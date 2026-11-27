// Shrinks an image in the browser before it is uploaded, to save storage.
// The picture is only scaled down if it is bigger than the site ever shows it,
// then saved as high-quality WebP (transparency is kept).

// Longest side, in pixels, that is worth storing for each upload folder. Each is
// at least as large as the smallest size the matching admin form accepts.
const MAX_EDGE: Record<string, number> = {
  "/liyana-naturals/products": 1600,
  "/liyana-naturals/categories": 1200,
  "/liyana-naturals/banners/desktop": 2560, // full-width banners
  "/liyana-naturals/banners/mobile": 1600,
  "/liyana-naturals/blog": 1600,
};
const DEFAULT_MAX_EDGE = 1600;
const QUALITY = 0.88;
// Shown as squares on the website, so other shapes are cut to fit.
const SQUARE_FOLDERS = new Set(["/liyana-naturals/products", "/liyana-naturals/categories"]);

// Re-drawing an animated PNG or WebP would keep only its first frame.
async function isAnimated(file: File): Promise<boolean> {
  if (file.type === "image/jpeg") return false;
  const head = new TextDecoder("latin1").decode(await file.slice(0, 65536).arrayBuffer());
  return file.type === "image/webp" ? head.includes("ANIM") : head.includes("acTL");
}

function draw(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot resize images.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

/** The largest square from the middle of a picture. */
function cutSquare(picture: ImageBitmap): HTMLCanvasElement {
  const side = Math.min(picture.width, picture.height);
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot resize images.");
  context.drawImage(picture, (picture.width - side) / 2, (picture.height - side) / 2, side, side, 0, 0, side, side);
  return canvas;
}

const toBlob =(canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

/**
 * Returns a smaller File, or the original one if it cannot (or need not) be
 * improved. For square places the picture is also cut to a square. Never throws.
 */
export async function compressImage(file: File, folder: string): Promise<File> {
  let bitmap: ImageBitmap | undefined;
  try {
    // Applies the camera's rotation, so phone photos do not come out sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const cut = SQUARE_FOLDERS.has(folder) && bitmap.width !== bitmap.height;
    // An animation is kept as it is, unless it has to be cut.
    if (!cut && (await isAnimated(file))) return file;

    let source: CanvasImageSource = cut ? cutSquare(bitmap) : bitmap;
    let currentWidth = cut ? Math.min(bitmap.width, bitmap.height) : bitmap.width;
    let currentHeight = cut ? currentWidth : bitmap.height;

    const maxEdge = MAX_EDGE[folder] ?? DEFAULT_MAX_EDGE;
    const scale = Math.min(1, maxEdge / Math.max(currentWidth, currentHeight));
    const width = Math.max(1, Math.round(currentWidth * scale));
    const height = Math.max(1, Math.round(currentHeight * scale));

    // Large reductions are done in halving steps, which keeps edges sharp.
    while (currentWidth / 2 >= width && currentHeight / 2 >= height) {
      currentWidth = Math.round(currentWidth / 2);
      currentHeight = Math.round(currentHeight / 2);
      source = draw(source, currentWidth, currentHeight);
    }
    const canvas = draw(source, width, height);

    let blob = await toBlob(canvas, "image/webp");
    if (blob?.type !== "image/webp") {
      // This browser cannot write WebP. JPEG is only safe for JPEG input (no transparency).
      if (file.type !== "image/jpeg" && !cut) return file;
      blob = await toBlob(canvas, file.type === "image/jpeg" ? "image/jpeg" : "image/png");
    }
    // Not worth re-encoding for a saving under 10%, unless the shape changed.
    if (!blob || (!cut && blob.size >= file.size * 0.9)) return file;

    const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
    return new File([blob], `${file.name.replace(/\.[^.]*$/, "")}.${extension}`, { type: blob.type });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}

const readableSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** "Compressed 4.2 MB → 310 KB", or nothing when the file was uploaded as it was. */
export function compressionNote(originalBytes: number, storedBytes: number): string {
  return storedBytes < originalBytes ? `Compressed ${readableSize(originalBytes)} → ${readableSize(storedBytes)}` : "";
}
