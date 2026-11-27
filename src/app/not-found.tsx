import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Page Not Found" };

// Shown for any address the website does not have.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FBF7EE] px-5 py-12 text-center text-[#28321F]">
      <Link href="/" aria-label="Liyana Naturals home" className="rounded-[5px] bg-white px-5 py-3 shadow-card">
        <Image src="/images/logo/logo.png" alt="Liyana Naturals" width={184} height={60} unoptimized />
      </Link>
      <p className="font-heading text-7xl sm:text-8xl font-bold leading-none text-[#536B35]">404</p>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#263D18]">Page not found</h1>
        <p className="mx-auto max-w-md text-sm sm:text-base text-[#555C4A]">
          The page you are looking for does not exist or has moved.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <Link href="/" className="rounded-[5px] bg-[#263D18] px-7 py-3 text-sm font-semibold text-[#FBF7EE] hover:bg-[#1D3214]">
          Go to Home
        </Link>
        <Link href="/shop" className="rounded-[5px] border border-[#263D18]/30 px-7 py-3 text-sm font-semibold text-[#263D18] hover:bg-[#EAF1DF]">
          Shop Products
        </Link>
      </div>
    </main>
  );
}
