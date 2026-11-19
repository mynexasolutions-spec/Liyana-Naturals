import { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Liyana Naturals",
  tagline: "Pure, Organic, Botanically Crafted Skincare",
  description:
    "Discover natural skincare, haircare and beauty products with Liyana Naturals.",
  url: "https://liyananaturals.com",
  ogImage: "https://liyananaturals.com/og.jpg",
  announcement: {
    enabled: true,
    text: "Free Shipping on orders above ₹999",
    linkText: "Shop Now",
    href: "/shop",
  },
  navigation: [
    { label: "Home", href: "/" },
    {
      label: "Shop",
      href: "/shop",
      children: [
        { label: "All Products", href: "/shop" },
        { label: "Facial Care", href: "/shop?category=facial-care" },
        { label: "Hair & Scalp", href: "/shop?category=hair-and-scalp" },
        { label: "Body & Bath", href: "/shop?category=body-and-bath" },
        { label: "Aromatherapy", href: "/shop?category=aromatherapy" },
        { label: "Best Sellers", href: "/shop?tag=bestseller" },
        { label: "New Arrivals", href: "/shop?tag=new" },
      ],
    },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  footerNavigation: {
    shop: [
      { label: "Botanical Serums", href: "/shop?category=serums" },
      { label: "Hydrating Creams", href: "/shop?category=creams" },
      { label: "Herbal Cleansers", href: "/shop?category=cleansers" },
      { label: "Nourishing Oils", href: "/shop?category=oils" },
      { label: "New Arrivals", href: "/shop?tag=new" },
      { label: "Best Sellers", href: "/shop?tag=bestseller" },
    ],
    about: [
      { label: "Our Philosophy", href: "/about#philosophy" },
      { label: "Ethical Sourcing", href: "/about#sourcing" },
      { label: "Sustainable Packaging", href: "/about#sustainability" },
      { label: "Ingredient Glossary", href: "/about#ingredients" },
      { label: "Press & Awards", href: "/about#press" },
    ],
    help: [
      { label: "Shipping & Delivery", href: "/contact#shipping" },
      { label: "Returns & Exchanges", href: "/contact#returns" },
      { label: "Order Tracking", href: "/contact#tracking" },
      { label: "FAQs", href: "/contact#faq" },
      { label: "Contact Us", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
  contact: {
    email: "info@liyananaturals.com",
    phone: "+91 91069 72400",
    address: "Udgir, Maharashtra, India",
  },
  social: {
    instagram: "https://instagram.com/liyananaturals",
    facebook: "https://facebook.com/liyananaturals",
    pinterest: "https://pinterest.com/liyananaturals",
    twitter: "https://youtube.com/@liyananaturals",
  },
};
