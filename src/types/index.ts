export * from "./product";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  provider: "email" | "google";
  createdAt: string;
}

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
  children?: NavItem[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title?: string;
  role?: string;
  rating: number;
  avatar?: string;
  verifiedBuyer: boolean;
  productName?: string;
}

export interface BlogSectionContent {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  highlightTip?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  subtitle?: string;
  content?: string;
  coverImage: string;
  category: string;
  readTime: string;
  publishedAt: string;
  featured?: boolean;
  tags?: string[];
  keyTakeaways?: string[];
  sections?: BlogSectionContent[];
  relatedProductSlugs?: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
    bio?: string;
  };
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  announcement: {
    enabled: boolean;
    text: string;
    linkText?: string;
    href?: string;
  };
  navigation: NavItem[];
  footerNavigation: {
    shop: NavItem[];
    about: NavItem[];
    help: NavItem[];
    legal: NavItem[];
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    instagram: string;
    facebook: string;
    pinterest: string;
    twitter?: string;
  };
}
