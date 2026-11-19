import { BlogPost } from "@/types";

export const blogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "5 Benefits of Aloe Vera for Your Skin",
    slug: "5-benefits-of-aloe-vera-for-your-skin",
    excerpt:
      "Discover why pure cold-pressed aloe vera calms inflammation, promotes deep hydration, and revitalizes sun-exposed skin naturally.",
    category: "Skincare",
    readTime: "4 min read",
    publishedAt: "Nov 15, 2024",
    coverImage: "/images/blog/Aloe_01.png",
    author: {
      name: "Dr. Maya Lin",
      role: "Botanical Chemist",
    },
  },
  {
    id: "blog-2",
    title: "Natural Skincare Routine at Home",
    slug: "natural-skincare-routine-at-home",
    excerpt:
      "Step-by-step everyday organic rituals with chamomile and botanical essences to nourish, protect, and illuminate your complexion.",
    category: "Beauty Rituals",
    readTime: "5 min read",
    publishedAt: "Nov 12, 2024",
    coverImage: "/images/blog/Chamomile_02.png",
    author: {
      name: "Elena Ward",
      role: "Holistic Esthetician",
    },
  },
  {
    id: "blog-3",
    title: "How to Get Strong & Healthy Hair",
    slug: "how-to-get-strong-and-healthy-hair",
    excerpt:
      "Essential nutrients, Ayurvedic scalp oil massage rituals, and active herb extracts for thicker, lustrous, root-to-tip hair health.",
    category: "Hair Wellness",
    readTime: "6 min read",
    publishedAt: "Nov 10, 2024",
    coverImage: "/images/blog/Golden_03.png",
    author: {
      name: "Julian Brooks",
      role: "Herbal Formulator",
    },
  },
];
