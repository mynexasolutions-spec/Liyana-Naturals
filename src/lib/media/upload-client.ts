// Browser side of the signed ImageKit upload used by the admin panel.

import { compressImage } from "@/lib/media/compress-image";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_BYTES = 40 * 1024 * 1024; // what may be picked, before compression
const MAX_BYTES = 10 * 1024 * 1024; // what may be stored

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !body) {
    const message = typeof body?.error === "string" ? body.error : body?.message;
    throw new Error(typeof message === "string" ? message : `Request failed (${response.status}).`);
  }
  return body;
}

export async function deleteUploadedImage(fileId: string): Promise<void> {
  await readJson(
    await fetch("/api/imagekit/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    }),
  );
}

export async function uploadAdminImage(file: File, folder: string) {
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("The image must be smaller than 40 MB.");
  const ready = await compressImage(file, folder);
  if (ready.size > MAX_BYTES) throw new Error("The image is still larger than 10 MB. Choose a smaller one.");

  const auth = await readJson(await fetch(`/api/imagekit/auth?folder=${encodeURIComponent(folder)}`));
  const form = new FormData();
  form.append("file", ready);
  form.append("fileName", ready.name);
  for (const key of ["publicKey", "signature", "expire", "token", "folder"]) {
    form.append(key, String(auth[key]));
  }

  const upload = await readJson(
    await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: form }),
  );
  if (typeof upload.url !== "string" || typeof upload.fileId !== "string") {
    throw new Error("Image upload failed. Please try again.");
  }
  const { url, fileId } = upload;

  try {
    await readJson(
      await fetch("/api/imagekit/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          name: typeof upload.name === "string" ? upload.name : ready.name,
          url,
          thumbnailUrl: upload.thumbnailUrl,
          mime: ready.type,
          sizeBytes: ready.size,
          folder,
        }),
      }),
    );
  } catch (error) {
    await deleteUploadedImage(fileId).catch(() => {});
    throw error;
  }
  return { url, fileId, originalBytes: file.size, storedBytes: ready.size };
}
