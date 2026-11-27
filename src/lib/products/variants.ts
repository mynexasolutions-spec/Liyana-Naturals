// How a product's sizes are shown and chosen. Shared by the cart, the product
// page and checkout.

import type { Product, ProductVariant } from "@/types/product";

/** The size selected to start with: the first one in stock. */
export function defaultVariant(product: Product): ProductVariant | undefined {
  return product.variants?.find((variant) => variant.inStock) ?? product.variants?.[0];
}

export function findVariant(product: Product, variantId: string | undefined): ProductVariant | undefined {
  return product.variants?.find((variant) => variant.id === variantId);
}

/** A size's own pictures, otherwise those that are not tied to any size. */
export function imagesFor(product: Product, variant: ProductVariant | undefined): Product["images"] {
  const own = variant ? product.images.filter((image) => image.size === variant.name) : [];
  const shared = product.images.filter((image) => !image.size);
  if (own.length > 0) return [...own, ...shared];
  return shared.length > 0 ? shared : product.images;
}

/** "Face Cream (50 ml)" for an ordered or listed item. */
export function itemLabel(name: string, size: string | null | undefined): string {
  return size ? `${name} (${size})` : name;
}
