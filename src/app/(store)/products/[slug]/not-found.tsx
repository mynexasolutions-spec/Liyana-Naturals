import Link from "next/link";
import { Leaf } from "lucide-react";
import { Container } from "@/components/ui/Container";

export default function ProductNotFound() {
  return (
    <main className="min-h-[70vh] bg-[#FBF7EE] flex items-center py-16">
      <Container size="sm">
        <div className="bg-[#EAF1DF]/90 border border-[#A8B88A]/45 rounded-[5px] p-8 sm:p-10 text-center shadow-xs">
          <div className="w-12 h-12 rounded-[5px] bg-[#263D18] text-[#FBF7EE] flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-6 h-6 text-[#A8B88A]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#536B35] block mb-1.5">
            Botanical Collection
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#263D18] mb-2.5">
            Product Not Found
          </h1>
          <p className="font-sans text-sm text-[#555C4A] max-w-md mx-auto mb-6">
            The botanical formula you&apos;re looking for is unavailable. Explore
            our pure skincare and haircare essentials in the shop.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[5px] bg-[#263D18] hover:bg-[#1D3214] text-[#FBF7EE] text-sm font-medium transition-colors"
          >
            <span>Back to Shop</span>
          </Link>
        </div>
      </Container>
    </main>
  );
}
