import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Our Story",
  description: "Learn about the mission, values, and organic botanical heritage of Liyana Naturals.",
};

export default function AboutPage() {
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
          Rooted in Nature
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl text-[#263D18] mb-4">
          Our Philosophy
        </h1>
        <p className="text-[#777968] max-w-lg mx-auto">
          Crafting pure botanical remedies with ethical transparency, regenerative farming partnerships, and mindful care.
        </p>
      </div>
    </div>
  );
}
