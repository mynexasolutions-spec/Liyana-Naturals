"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { dangerIconButton, iconButton, inputClass, secondaryButton } from "@/components/admin/kit";

/** A section while it is being edited: lists are plain text boxes. */
export type SectionDraft = {
  /** Stays the same while editing, and becomes the section's link on the page. */
  id: string;
  heading: string;
  paragraphs: string;
  bullets: string;
  highlightTip: string;
};

type SavedSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets: string[];
  highlightTip: string;
};

// Marks ids of sections that have never been saved.
const NEW_ID = "new:";

const split = (value: string, separator: RegExp) =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

export function toSectionDrafts(sections: SavedSection[]): SectionDraft[] {
  return sections.map((section) => ({
    id: section.id,
    heading: section.heading,
    paragraphs: section.paragraphs.join("\n\n"),
    bullets: section.bullets.join("\n"),
    highlightTip: section.highlightTip,
  }));
}

/** Returns null if a section with text has no heading. Empty sections are dropped. */
export function sectionsPayload(drafts: SectionDraft[]) {
  const filled = drafts.filter((draft) =>
    [draft.heading, draft.paragraphs, draft.bullets, draft.highlightTip].some((value) => value.trim()),
  );
  if (filled.some((draft) => !draft.heading.trim())) return null;

  const used = new Set<string>();
  return filled.map((draft, index) => {
    const base = draft.id.startsWith(NEW_ID) ? slugify(draft.heading) || `section-${index + 1}` : draft.id;
    let id = base;
    for (let count = 2; used.has(id); count += 1) id = `${base}-${count}`;
    used.add(id);
    return {
      id,
      heading: draft.heading.trim(),
      // A blank line separates paragraphs; each line is one bullet.
      paragraphs: split(draft.paragraphs, /\n\s*\n/),
      bullets: split(draft.bullets, /\n/),
      ...(draft.highlightTip.trim() ? { highlightTip: draft.highlightTip.trim() } : {}),
    };
  });
}

export function BlogSectionsEditor({
  sections,
  plainText,
  onChange,
}: {
  sections: SectionDraft[];
  plainText: string;
  /** `movedPlainText` is true when the plain article was turned into the first section. */
  onChange: (sections: SectionDraft[], movedPlainText?: boolean) => void;
}) {
  const add = () => {
    const moving = sections.length === 0 && plainText.trim() !== "";
    onChange(
      [
        ...sections,
        {
          id: `${NEW_ID}${Date.now()}`,
          heading: "",
          paragraphs: moving ? plainText.trim() : "",
          bullets: "",
          highlightTip: "",
        },
      ],
      moving,
    );
  };

  const update = (index: number, key: keyof SectionDraft, value: string) =>
    onChange(sections.map((section, position) => (position === index ? { ...section, [key]: value } : section)));

  const move = (index: number, step: -1 | 1) => {
    const next = [...sections];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  };

  const remove = (index: number) => {
    const section = sections[index];
    const hasText = [section.heading, section.paragraphs, section.bullets, section.highlightTip].some((value) => value.trim());
    if (hasText && !window.confirm(`Remove section "${section.heading || index + 1}"? Its text will be deleted when you save.`)) return;
    onChange(sections.filter((_, position) => position !== index));
  };

  return (
    <fieldset className="space-y-3">
      {sections.length > 0 && (
        <legend className="mb-1 text-sm font-medium">
          Article sections ({sections.length})
        </legend>
      )}

      {sections.map((section, index) => (
        <div key={section.id} className="space-y-3 rounded-2xl border border-[#28321F]/12 bg-[#FBF7EE]/60 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#536B35]">Section {index + 1}</p>
            <div className="flex gap-1">
              <button type="button" aria-label="Move section up" disabled={index === 0} onClick={() => move(index, -1)} className={iconButton}>
                <ArrowUp className="size-4" />
              </button>
              <button type="button" aria-label="Move section down" disabled={index === sections.length - 1} onClick={() => move(index, 1)} className={iconButton}>
                <ArrowDown className="size-4" />
              </button>
              <button type="button" aria-label="Remove section" onClick={() => remove(index)} className={dangerIconButton}>
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <label className="block text-sm font-medium">
            Heading
            <input value={section.heading} maxLength={240} onChange={(event) => update(index, "heading", event.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Text
            <textarea
              rows={6}
              value={section.paragraphs}
              placeholder="Leave a blank line between paragraphs."
              onChange={(event) => update(index, "paragraphs", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium">
            Bullet points (optional, one per line)
            <textarea rows={3} value={section.bullets} onChange={(event) => update(index, "bullets", event.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Expert tip box (optional)
            <textarea rows={2} maxLength={2000} value={section.highlightTip} onChange={(event) => update(index, "highlightTip", event.target.value)} className={inputClass} />
          </label>
        </div>
      ))}

      <button type="button" onClick={add} className={secondaryButton}>
        <Plus className="size-4" />
        {sections.length > 0 ? "Add section" : "Split into sections with headings"}
      </button>
    </fieldset>
  );
}
