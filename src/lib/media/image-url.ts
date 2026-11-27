/**
 * The first usable picture in a product's stored image list. With a size, that
 * size's own picture is preferred.
 */
export function firstImageUrl(images: unknown, size?: string | null): string | null {
  let list = images;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      return renderableImageUrl(images);
    }
  }
  if (!Array.isArray(list)) return null;
  const sizeOf = (item: unknown) => (item && typeof item === "object" ? (item as Record<string, unknown>).size : undefined);
  // The size's pictures first, then shared ones, then any other.
  const rank = (item: unknown) => (size && sizeOf(item) === size ? 0 : sizeOf(item) ? 2 : 1);
  for (const item of [...list].sort((a, b) => rank(a) - rank(b))) {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : null;
    const url = record ? (renderableImageUrl(record.src) ?? renderableImageUrl(record.url)) : renderableImageUrl(item);
    if (url) return url;
  }
  return null;
}

export function renderableImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || (trimmed.startsWith("//"))) return null;
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}
