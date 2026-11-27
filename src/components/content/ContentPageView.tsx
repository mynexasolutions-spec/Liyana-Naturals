import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PageBlocks } from "@/components/content/PageBlocks";
import { CONTENT_PAGES, parsePage, type PageSlug } from "@/lib/content/pages";
import { formatIndiaTime } from "@/lib/shiprocket/shared";
import { getContentPage } from "@/lib/supabase/storefront";

const fallbackName = (slug: PageSlug) => CONTENT_PAGES.find((page) => page.slug === slug)?.name ?? "";

export async function contentPageMetadata(slug: PageSlug): Promise<Metadata> {
  const page = await getContentPage(slug);
  return { title: page?.title || fallbackName(slug) };
}

/** An FAQ or policy page, written by the admin. Hidden pages are not found. */
export async function ContentPageView({ slug }: { slug: PageSlug }) {
  const page = await getContentPage(slug);
  if (!page) notFound();
  const title = page.title || fallbackName(slug);
  const sections = parsePage(page.content);

  return (
    <main className="min-h-screen w-full bg-[#FBF7EE] py-6 sm:py-10 pb-24 text-[#28321F]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-[#777968]">
          <Link href="/" className="text-[#555C4A] hover:text-[#263D18]">Home</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-semibold text-[#263D18]">{title}</span>
        </nav>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#263D18]">{title}</h1>
        <p className="mt-2 text-xs text-[#777968]">Last updated {formatIndiaTime(page.updatedAt, false)}</p>

        {slug === "faq" ? (
          <div className="mt-6 space-y-3">
            {sections.map((section, index) =>
              section.heading ? (
                <details key={index} className="group rounded-[5px] border border-[#28321F]/10 bg-white shadow-card">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 sm:px-5 py-4 font-semibold text-[#263D18] [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 break-words">{section.heading}</span>
                    <ChevronDown className="size-4 shrink-0 text-[#536B35] transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[#28321F]/8 px-4 sm:px-5 py-4">
                    <PageBlocks blocks={section.blocks} />
                  </div>
                </details>
              ) : (
                <PageBlocks key={index} blocks={section.blocks} />
              ),
            )}
          </div>
        ) : (
          <article className="mt-6 space-y-6 rounded-[5px] border border-[#28321F]/10 bg-white p-5 sm:p-8 shadow-card">
            {sections.map((section, index) => (
              <section key={index}>
                {section.heading && (
                  <h2 className="mb-2.5 font-heading text-xl sm:text-2xl font-bold text-[#263D18]">{section.heading}</h2>
                )}
                <PageBlocks blocks={section.blocks} />
              </section>
            ))}
          </article>
        )}

        <p className="mt-6 text-sm text-[#555C4A]">
          Still have a question?{" "}
          <Link href="/contact" className="font-semibold text-[#263D18] underline underline-offset-2 hover:text-[#536B35]">
            Contact us
          </Link>
        </p>
      </div>
    </main>
  );
}
