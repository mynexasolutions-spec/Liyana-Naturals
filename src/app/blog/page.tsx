import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "The Botanical Journal",
  description: "Insights on clean skincare rituals, active plant extracts, and holistic well-being.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FBF7EE] py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#536B35] hover:text-[#263D18] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="text-xs uppercase tracking-widest text-[#536B35] font-semibold block mb-2">
          Botanical Journal
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl text-[#263D18] mb-4">
          Rituals &amp; Stories
        </h1>
        <p className="text-[#777968] max-w-lg mx-auto">
          Explore skin science, plant remedies, and sustainable self-care traditions written by our holistic team.
        </p>
      </div>
    </div>
  );
}
