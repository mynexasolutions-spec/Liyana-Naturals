"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminRequest,
  dangerIconButton,
  Feedback,
  iconButton,
  inputClass,
  PageHeader,
  panel,
  primaryButton,
  secondaryButton,
  Switch,
  useAdminAction,
} from "@/components/admin/kit";
import { PageBlocks } from "@/components/content/PageBlocks";
import {
  CONTENT_PAGES,
  contentPageSchema,
  joinPage,
  parsePage,
  splitPage,
  type EditorSection,
  type PageSlug,
} from "@/lib/content/pages";

export type AdminPage = { slug: PageSlug; title: string; content: string; is_published: boolean };

type Section = EditorSection & { key: string };
type Draft = { title: string; intro: string; sections: Section[]; is_published: boolean };

function toDraft(page: AdminPage): Draft {
  const { intro, sections } = splitPage(page.content);
  return {
    title: page.title,
    intro,
    sections: sections.map((section, index) => ({ ...section, key: `saved-${index}` })),
    is_published: page.is_published,
  };
}

/** What would be saved. */
const toPayload = (draft: Draft) => ({
  title: draft.title.trim(),
  content: joinPage(draft.intro, draft.sections),
  is_published: draft.is_published,
});

// About as tall as the text, so there is little scrolling inside a box.
const rowsFor = (text: string, minimum: number) =>
  Math.min(16, Math.max(minimum, text.split("\n").length + Math.floor(text.length / 90)));

export function PagesManager({ pages }: { pages: AdminPage[] }) {
  const { run, busy, locked, error, notice } = useAdminAction();
  const [slug, setSlug] = useState<PageSlug>(CONTENT_PAGES[0].slug);
  // Unsaved changes of one page are kept while another is open.
  const [drafts, setDrafts] = useState(
    () => Object.fromEntries(pages.map((page) => [page.slug, toDraft(page)])) as Record<PageSlug, Draft>,
  );
  const [formError, setFormError] = useState("");
  const [preview, setPreview] = useState(false);

  const savedPage = (key: PageSlug) => pages.find((page) => page.slug === key) as AdminPage;
  const isDirty = (key: PageSlug) =>
    JSON.stringify(toPayload(drafts[key])) !== JSON.stringify(toPayload(toDraft(savedPage(key))));

  const draft = drafts[slug];
  const dirty = isDirty(slug);
  const anyDirty = CONTENT_PAGES.some((page) => isDirty(page.slug));
  const isFaq = slug === "faq";
  const word = isFaq ? "question" : "section";

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!anyDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  const change = (part: Partial<Draft>) => {
    setFormError("");
    setDrafts((current) => ({ ...current, [slug]: { ...current[slug], ...part } }));
  };
  const changeSection = (key: string, part: Partial<EditorSection>) =>
    change({ sections: draft.sections.map((section) => (section.key === key ? { ...section, ...part } : section)) });
  const addSection = () =>
    change({ sections: [...draft.sections, { key: `new-${Date.now()}`, heading: "", text: "" }] });
  const moveSection = (from: number, to: number) => {
    const sections = [...draft.sections];
    [sections[from], sections[to]] = [sections[to], sections[from]];
    change({ sections });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = draft.sections.findIndex((section) => {
      const heading = section.heading.trim();
      const text = section.text.trim();
      return (!heading && text) || (isFaq && heading && !text);
    });
    if (problem >= 0) {
      setPreview(false);
      setFormError(
        draft.sections[problem].heading.trim()
          ? `Write the answer for question ${problem + 1}.`
          : `Write the ${isFaq ? "question" : "heading"} for ${word} ${problem + 1}.`,
      );
      return;
    }
    const payload = toPayload(draft);
    const checked = contentPageSchema.safeParse(payload);
    if (!checked.success) {
      setFormError(checked.error.issues[0]?.message ?? "Check the page.");
      return;
    }
    const ok = await run(() => adminRequest(`/api/admin/pages/${slug}`, "PATCH", payload), "Page saved.");
    if (ok) setDrafts((current) => ({ ...current, [slug]: toDraft({ slug, ...payload }) }));
  };

  const sections = parsePage(joinPage(draft.intro, draft.sections));

  return (
    <div className="space-y-5">
      <PageHeader title="Pages" subtitle="Choose a page, write in the boxes and press Save." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" role="tablist" aria-label="Pages">
        {CONTENT_PAGES.map((page) => {
          const open = slug === page.slug;
          const published = savedPage(page.slug).is_published;
          return (
            <button
              key={page.slug}
              type="button"
              role="tab"
              aria-selected={open}
              onClick={() => {
                setSlug(page.slug);
                setFormError("");
                setPreview(false);
              }}
              className={`rounded-2xl border p-3.5 text-left transition-colors ${open ? "border-[#263D18] bg-[#263D18] text-white" : "border-[#28321F]/10 bg-white text-[#28321F] hover:border-[#536B35]/50"}`}
            >
              <span className="block text-sm font-semibold">{page.name}</span>
              <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                <span className={`rounded-full px-2 py-0.5 ${published ? "bg-emerald-50 text-emerald-800" : "bg-[#EDEDE6] text-[#555C4A]"}`}>
                  {published ? "Published" : "Hidden"}
                </span>
                {isDirty(page.slug) && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Not saved</span>}
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={save} noValidate className="space-y-4">
        <div className={`${panel} space-y-4 p-4 md:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Switch
                checked={draft.is_published}
                label={draft.is_published ? "Show on website" : "Hidden from website"}
                onChange={() => change({ is_published: !draft.is_published })}
              />
              <p className="mt-1 text-xs text-[#777968]">Shown pages also get a link in the website footer.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setPreview((value) => !value)} className={secondaryButton}>
                {preview ? <Pencil className="size-4" /> : <Eye className="size-4" />}
                {preview ? "Back to editing" : "Preview"}
              </button>
              {savedPage(slug).is_published && (
                <Link href={`/${slug}`} target="_blank" className={secondaryButton}>
                  Open page <ExternalLink className="size-4" />
                </Link>
              )}
            </div>
          </div>
          <label className="block text-sm font-medium">
            Page title
            <input value={draft.title} maxLength={120} onChange={(event) => change({ title: event.target.value })} className={inputClass} />
          </label>
          {!preview && (!isFaq || draft.intro) && (
            <label className="block text-sm font-medium">
              Opening lines (optional)
              <textarea
                rows={rowsFor(draft.intro, 2)}
                value={draft.intro}
                onChange={(event) => change({ intro: event.target.value })}
                className={`${inputClass} leading-relaxed`}
              />
            </label>
          )}
        </div>

        {preview ? (
          <div className="space-y-5 rounded-2xl border border-[#28321F]/10 bg-[#FBF7EE] p-4 md:p-6">
            <h2 className="break-words text-2xl font-bold text-[#263D18]">{draft.title}</h2>
            {sections.length === 0 && <p className="text-sm text-[#777968]">Nothing written yet.</p>}
            {sections.map((section, index) => (
              <section key={index}>
                {section.heading && <h3 className="mb-2 break-words text-lg font-bold text-[#263D18]">{section.heading}</h3>}
                <PageBlocks blocks={section.blocks} />
              </section>
            ))}
          </div>
        ) : (
          <>
            {draft.sections.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[#28321F]/20 bg-white p-6 text-center text-sm text-[#777968]">
                No {word}s yet. Press “Add {word}” to start.
              </p>
            )}
            <ol className="space-y-3">
              {draft.sections.map((section, index) => (
                <li key={section.key} className={`${panel} space-y-3 p-4 md:p-5`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#536B35]">
                      {isFaq ? "Question" : "Section"} {index + 1}
                    </span>
                    <div className="flex gap-1">
                      <button type="button" aria-label={`Move ${word} ${index + 1} up`} disabled={index === 0} onClick={() => moveSection(index, index - 1)} className={iconButton}>
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" aria-label={`Move ${word} ${index + 1} down`} disabled={index === draft.sections.length - 1} onClick={() => moveSection(index, index + 1)} className={iconButton}>
                        <ArrowDown className="size-4" />
                      </button>
                      <button type="button" aria-label={`Delete ${word} ${index + 1}`} onClick={() => change({ sections: draft.sections.filter((item) => item.key !== section.key) })} className={dangerIconButton}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <label className="block text-sm font-medium">
                    {isFaq ? "Question" : "Heading"}
                    <input value={section.heading} maxLength={200} onChange={(event) => changeSection(section.key, { heading: event.target.value })} className={inputClass} />
                  </label>
                  <label className="block text-sm font-medium">
                    {isFaq ? "Answer" : "Text"}
                    <textarea
                      rows={rowsFor(section.text, 3)}
                      value={section.text}
                      onChange={(event) => changeSection(section.key, { text: event.target.value })}
                      className={`${inputClass} leading-relaxed`}
                    />
                  </label>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={addSection}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#536B35]/50 bg-white py-3.5 text-sm font-semibold text-[#263D18] hover:bg-[#EAF1DF]/60"
            >
              <Plus className="size-4" /> Add {word}
            </button>
            <p className="text-xs text-[#777968]">Tip: start a line with “- ” to show it as a bullet point.</p>
          </>
        )}

        <Feedback error={formError || error} notice={notice} />

        {/* Stays in view while there is something to save. */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#28321F]/10 bg-white px-4 py-3 ${dirty ? "sticky bottom-3 z-20 shadow-[0_8px_30px_rgba(38,61,24,0.18)]" : ""}`}
        >
          <p role="status" className="text-sm font-medium text-[#777968]">
            {dirty ? "You have unsaved changes." : "All changes are saved."}
          </p>
          <div className="ml-auto flex gap-2.5">
            <button
              type="button"
              disabled={!dirty || locked}
              onClick={() => change(toDraft(savedPage(slug)))}
              className={secondaryButton}
            >
              Undo changes
            </button>
            <button type="submit" disabled={!dirty || locked} className={primaryButton}>
              {busy ? "Saving…" : "Save page"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
