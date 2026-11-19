import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { BestSellers } from "@/components/home/BestSellers";
import { AboutSection } from "@/components/home/AboutSection";
import { Testimonials } from "@/components/home/Testimonials";
import { BlogSection } from "@/components/home/BlogSection";
import { Newsletter } from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FBF7EE]">
      <HeroSection />
      <CategorySection />
      <BestSellers />
      <AboutSection />
      <Testimonials />
      <BlogSection />
      <Newsletter />
    </main>
  );
}
