import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransitionShell } from "@/components/layout/PageTransitionShell";
import { StoreProvider } from "@/context/StoreContext";
import { StorefrontRealtimeSync } from "@/components/layout/StorefrontRealtimeSync";
import { getStorefrontCategories, getStorefrontProducts, getStorefrontSettings } from "@/lib/supabase/storefront";

export const metadata: Metadata = {
  title: {
    default: "Liyana Naturals | Natural Beauty & Skincare",
    template: "%s | Liyana Naturals",
  },
  description: siteConfig.description,
  keywords: [
    "natural skincare",
    "organic cosmetics",
    "clean beauty",
    "botanical skincare",
    "hair care oils",
    "sustainable beauty",
    "Liyana Naturals",
  ],
  authors: [{ name: "Liyana Naturals" }],
  creator: "Liyana Naturals",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Liyana Naturals | Natural Beauty & Skincare",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Liyana Naturals - Pure, Organic, Botanically Crafted Skincare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Liyana Naturals | Natural Beauty & Skincare",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#263D18",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [storefrontProducts, storefrontSettings, storefrontCategories] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontSettings(),
    getStorefrontCategories(),
  ]);

  return (
    <StoreProvider products={storefrontProducts}>
      <div className="min-h-screen bg-[#FBF7EE] flex flex-col justify-between">
        <div className="flex flex-col flex-1">
          <AnnouncementBar settings={storefrontSettings} />
          <Header settings={storefrontSettings} categories={storefrontCategories} />
          <PageTransitionShell>{children}</PageTransitionShell>
        </div>
        <Footer settings={storefrontSettings} />
      </div>
      <StorefrontRealtimeSync />
    </StoreProvider>
  );
}
