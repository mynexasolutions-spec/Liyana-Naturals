import { ProductCategory } from "@/types";

export const categories: ProductCategory[] = [
  {
    id: "soaps",
    name: "Soaps",
    slug: "soaps",
    description: "Cold-pressed handcrafted botanical bars rich in skin-nourishing herbs.",
    image: "/images/categories/Natural_cate.png",
    productCount: 8,
  },
  {
    id: "hair-care",
    name: "Hair Care",
    slug: "hair-and-scalp",
    description: "Nutrient-dense herbal oils & tonics formulated for root strengthening.",
    image: "/images/categories/Golden_cate.png",
    productCount: 12,
  },
  {
    id: "skin-care",
    name: "Skin Care",
    slug: "facial-care",
    description: "Pure plant creams, aloe vera emulsions, and soothing barrier balms.",
    image: "/images/categories/Aloe_cate.png",
    productCount: 14,
  },
  {
    id: "face-care",
    name: "Face Care",
    slug: "face-care",
    description: "Rejuvenating vitamin serums, facial oils, and botanical radiance elixirs.",
    image: "/images/categories/Amber_cate.png",
    productCount: 10,
  },
  {
    id: "hair-masks",
    name: "Hair Masks",
    slug: "hair-masks",
    description: "Deep conditioning restorative hair masks crafted with organic extracts.",
    image: "/images/categories/Mask_cate.png",
    productCount: 6,
  },
];
