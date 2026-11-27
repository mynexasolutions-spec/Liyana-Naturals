// The text pages (FAQs and policies) the admin writes. Stored in site_content as
// "page:<slug>". Shared by server and browser code.

import { z } from "zod";

export const CONTENT_PAGES = [
  { slug: "faq", name: "FAQs" },
  { slug: "shipping-policy", name: "Shipping Policy" },
  { slug: "privacy", name: "Privacy Policy" },
  { slug: "terms", name: "Terms & Conditions" },
  { slug: "refund-policy", name: "Refund Policy" },
] as const;

export type PageSlug = (typeof CONTENT_PAGES)[number]["slug"];

export const isPageSlug = (value: string): value is PageSlug => CONTENT_PAGES.some((page) => page.slug === value);
export const pageKey = (slug: PageSlug) => `page:${slug}`;
export const MAX_PAGE_CONTENT = 30_000;

export const contentPageSchema = z
  .strictObject({
    title: z.string().trim().min(2, "Enter the page title.").max(120, "Title is too long."),
    content: z.string().trim().max(MAX_PAGE_CONTENT, "The page text is too long."),
    is_published: z.boolean(),
  })
  .refine((page) => !page.is_published || page.content, "Write the page text before publishing it.");

export function pageContent(body: unknown): string {
  const content = body && typeof body === "object" ? (body as Record<string, unknown>).content : null;
  return typeof content === "string" ? content.trim() : "";
}

/** One box in the admin editor: a heading (or question) and the text under it. */
export type EditorSection = { heading: string; text: string };

export function splitPage(content: string): { intro: string; sections: EditorSection[] } {
  const intro: string[] = [];
  const sections: { heading: string; lines: string[] }[] = [];
  for (const line of content.replace(/\r\n?/g, "\n").split("\n")) {
    if (line.trim().startsWith("## ")) sections.push({ heading: line.trim().slice(3).trim(), lines: [] });
    else (sections.at(-1)?.lines ?? intro).push(line);
  }
  return {
    intro: intro.join("\n").trim(),
    sections: sections.map(({ heading, lines }) => ({ heading, text: lines.join("\n").trim() })),
  };
}

export function joinPage(intro: string, sections: EditorSection[]): string {
  const written = sections.map(({ heading, text }) =>
    // A box still without a heading is only possible while editing.
    heading.trim() ? `## ${heading.trim()}\n${text.trim()}`.trim() : text.trim(),
  );
  return [intro.trim(), ...written].filter(Boolean).join("\n\n");
}

export type PageBlock = { type: "text"; text: string } | { type: "list"; items: string[] };
export type PageSection = { heading: string | null; blocks: PageBlock[] };

/**
 * The simple writing style of the admin editor: a line starting "## " is a
 * heading (a question on the FAQ page), lines starting "- " make a list, and an
 * empty line starts a new paragraph.
 */
export function parsePage(content: string): PageSection[] {
  const sections: PageSection[] = [];
  let section: PageSection = { heading: null, blocks: [] };
  // True while the next line may continue the last block.
  let open = false;
  const finish = () => {
    if (section.heading || section.blocks.length) sections.push(section);
  };

  for (const raw of content.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      open = false;
      continue;
    }
    if (line.startsWith("## ")) {
      finish();
      section = { heading: line.slice(3).trim(), blocks: [] };
      open = false;
      continue;
    }
    const last = open ? section.blocks[section.blocks.length - 1] : undefined;
    if (line.startsWith("- ")) {
      if (last?.type === "list") last.items.push(line.slice(2).trim());
      else section.blocks.push({ type: "list", items: [line.slice(2).trim()] });
    } else if (last?.type === "text") {
      last.text += `\n${line}`;
    } else {
      section.blocks.push({ type: "text", text: line });
    }
    open = true;
  }
  finish();
  return sections;
}
