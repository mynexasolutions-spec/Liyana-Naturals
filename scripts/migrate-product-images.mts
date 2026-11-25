import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import ImageKit from "imagekit";
import { products } from "../src/data/products.ts";

type Env = Record<string, string>;

type ImageAsset = {
  fileId: string;
  url: string;
  thumbnailUrl?: string;
};

type ProductImage = {
  src?: unknown;
  url?: unknown;
  alt?: unknown;
  fileId?: unknown;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  images: unknown;
};

function readEnv(raw: string): Env {
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.match(/^([^#=]+)=(.*)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1].trim(), match[2].trim().replace(/^['"]|['"]$/g, "")]),
  );
}

async function requireConfiguration(): Promise<Env> {
  const env = readEnv(await fs.readFile(".env", "utf8"));
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "Email",
    "Password",
    "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
    "IMAGEKIT_PRIVATE_KEY",
    "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT",
  ];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) throw new Error(`Missing .env values: ${missing.join(", ")}`);
  return env;
}

function imageList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function imageUrl(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!value || typeof value !== "object") return null;
  const image = value as ProductImage;
  if (typeof image.src === "string" && image.src.trim()) return image.src.trim();
  if (typeof image.url === "string" && image.url.trim()) return image.url.trim();
  return null;
}

function imageAlt(value: unknown, fallback: string): string {
  if (value && typeof value === "object" && typeof (value as ProductImage).alt === "string") {
    return String((value as ProductImage).alt);
  }
  return fallback;
}

function imageFileId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const fileId = (value as ProductImage).fileId;
  return typeof fileId === "string" && fileId.trim() ? fileId.trim() : null;
}

function imageExtension(source: string): string {
  const cleanSource = source.split(/[?#]/, 1)[0];
  const extension = path.extname(cleanSource).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(extension) ? extension : ".webp";
}

function imageMime(source: string): string {
  const extension = imageExtension(source);
  const mimeByExtension: Record<string, string> = {
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return mimeByExtension[extension] ?? "image/*";
}

async function readOriginal(source: string): Promise<Buffer> {
  const maxBytes = 10 * 1024 * 1024;
  let original: Buffer;
  if (source.startsWith("/")) {
    original = await fs.readFile(path.join(process.cwd(), "public", source.replace(/^\//, "")));
  } else {
    if (!/^https?:\/\//i.test(source)) {
      throw new Error(`Product image source is not a local asset or URL: ${source}`);
    }

    const response = await fetch(source);
    if (!response.ok) throw new Error(`Product image could not be downloaded (${response.status}).`);
    original = Buffer.from(await response.arrayBuffer());
  }
  if (original.byteLength > maxBytes) throw new Error("Product image is larger than 10 MB.");
  return original;
}

async function main(): Promise<void> {
  const env = await requireConfiguration();
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email: env.Email,
    password: env.Password,
  });
  if (authError || !authData.session || !authData.user) {
    throw new Error(authError?.message ?? "The configured admin account could not sign in.");
  }

  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
  });
  const imagekit = new ImageKit({
    publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });
  const folder = "/liyana-naturals/products";
  const fileByName = new Map<string, ImageAsset>();
  const fileById = new Map<string, ImageAsset>();
  const fileByUrl = new Map<string, ImageAsset>();

  const files = await imagekit.listFiles({ path: folder, limit: 1000 });
  for (const file of files) {
    if (!file.name || !file.fileId || !file.url) continue;
    const asset = { fileId: file.fileId, url: file.url, thumbnailUrl: file.thumbnailUrl };
    fileByName.set(`${folder}/${file.name}`, asset);
    fileById.set(file.fileId, asset);
    fileByUrl.set(file.url, asset);
  }

  const { data: rows, error: lookupError } = await admin
    .from("products")
    .select("id,slug,name,images")
    .order("created_at", { ascending: true });
  if (lookupError) throw new Error(`Product image lookup failed: ${lookupError.message}`);

  const sourceBySlug = new Map(products.map((product) => [product.slug, product]));
  let updated = 0;
  let reused = 0;
  let uploaded = 0;
  let skipped = 0;

  for (const row of (rows ?? []) as ProductRow[]) {
    const sourceProduct = sourceBySlug.get(row.slug);
    const storedImages = imageList(row.images);
    const sourceImages = sourceProduct?.images ?? [];
    const candidates = storedImages.length > 0 ? storedImages : sourceImages;
    if (candidates.length === 0) {
      skipped += 1;
      continue;
    }

    const normalizedImages: Record<string, string>[] = [];
    for (const [index, candidate] of candidates.entries()) {
      const storedSource = imageUrl(candidate);
      const sourceImage = sourceImages[index];
      const sourcePath = typeof sourceImage?.src === "string" ? sourceImage.src : null;
      const source = storedSource ?? sourcePath;
      if (!source) throw new Error(`Product ${row.slug} has an image without a source.`);

      const existingFileId = imageFileId(candidate);
      let asset = existingFileId
        ? fileById.get(existingFileId)
        : fileByUrl.get(storedSource ?? "");
      const fileName = `${row.slug}-${index + 1}${imageExtension(sourcePath ?? source)}`;

      if (!asset) {
        const cachedAsset = fileByName.get(`${folder}/${fileName}`);
        if (cachedAsset) {
          asset = cachedAsset;
          reused += 1;
        }
      } else {
        reused += 1;
      }

      if (!asset) {
        const original = await readOriginal(sourcePath ?? source);
        const upload = await imagekit.upload({
          file: original,
          fileName,
          folder,
          useUniqueFileName: false,
          overwriteFile: false,
        });
        asset = { fileId: upload.fileId, url: upload.url, thumbnailUrl: upload.thumbnailUrl };
        fileByName.set(`${folder}/${fileName}`, asset);
        fileByUrl.set(asset.url, asset);
        uploaded += 1;
      }

      const { data: existingAsset, error: assetLookupError } = await admin
        .from("media_assets")
        .select("id")
        .eq("imagekit_file_id", asset.fileId)
        .maybeSingle();
      if (assetLookupError) throw new Error(`Media asset lookup failed: ${assetLookupError.message}`);
      if (!existingAsset) {
        const { error: assetInsertError } = await admin.from("media_assets").insert({
          imagekit_file_id: asset.fileId,
          name: fileName,
          url: asset.url,
          thumbnail_url: asset.thumbnailUrl ?? null,
          mime: imageMime(sourcePath ?? source),
          size_bytes: null,
          folder,
          created_by: authData.user.id,
        });
        if (assetInsertError) throw new Error(`Media asset metadata failed: ${assetInsertError.message}`);
      }

      normalizedImages.push({
        src: asset.url,
        url: asset.url,
        alt: imageAlt(candidate, row.name),
        fileId: asset.fileId,
      });
    }

    const currentImages = storedImages.map((candidate) => {
      const currentSource = imageUrl(candidate);
      const currentFileId = imageFileId(candidate);
      if (!currentSource || !currentFileId) return null;
      return {
        src: currentSource,
        url: currentSource,
        alt: imageAlt(candidate, row.name),
        fileId: currentFileId,
      };
    });
    if (
      currentImages.length !== storedImages.length ||
      JSON.stringify(currentImages) !== JSON.stringify(normalizedImages)
    ) {
      const { error: updateError } = await admin
        .from("products")
        .update({ images: normalizedImages })
        .eq("id", row.id);
      if (updateError) throw new Error(`Product ${row.slug} image update failed: ${updateError.message}`);
      updated += 1;
    }
  }

  console.log(JSON.stringify({ ok: true, products: rows?.length ?? 0, updated, reused, uploaded, skipped }, null, 2));
  await client.auth.signOut();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Product image migration failed.");
    process.exit(1);
  });
