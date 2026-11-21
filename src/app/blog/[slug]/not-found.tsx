import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { Container } from "@/components/ui/Container";

export default function BlogPostNotFound() {
  return (
    <main className="min-h-[70vh] bg-[#FBF7EE] flex items-center py-16">
      <Container size="sm">
        <div className="bg-[#EAF1DF]/90 border border-[#A8B88A]/45 rounded-[5px] p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#263D18] text-[#FBF7EE] flex items-center justify-center mx-auto mb-5">
            <Leaf className="w-6 h-6 text-[#A8B88A]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#536B35] block mb-2">
            Botanical Journal
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#263D18] mb-3">
            Article Not Found
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#555C4A] max-w-md mx-auto mb-7">
            The blog post you&apos;re looking for may have moved or is no longer
            available. Explore our latest botanical beauty guides instead.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Blogs</span>
          </Link>
        </div>
      </Container>
    </main>
  );
}
