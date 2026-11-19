import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FBF7EE] text-[#28321F] font-sans antialiased selection:bg-[#A8B88A] selection:text-[#1D3214] flex flex-col justify-between">
        <div>
          <AnnouncementBar />
          <Header />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
