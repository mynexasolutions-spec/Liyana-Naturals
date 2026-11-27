"use client";

import { Plus, Trash2 } from "lucide-react";
import { dangerIconButton, inputClass } from "@/components/admin/kit";
import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { BADGE_ICONS, BADGE_ICON_KEYS, MAX_BADGES, type Badge, type BadgeIconKey } from "@/lib/content/badges";

/** Edits a short list of "icon + words" items. */
export function BadgeListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: Badge[];
  onChange: (items: Badge[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  const change = (index: number, part: Partial<Badge>) =>
    onChange(items.map((item, position) => (position === index ? { ...item, ...part } : item)));

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        // The list only changes by adding at the end or removing, and every field is controlled.
        <div key={index} className="flex flex-wrap items-end gap-2">
          <span className="mb-1 grid size-10 shrink-0 place-items-center rounded-lg bg-[#EAF1DF] text-[#263D18]">
            <BadgeIcon icon={item.icon} className="size-4" />
          </span>
          <label className="block w-32 text-xs font-medium">
            Icon
            <select value={item.icon} onChange={(event) => change(index, { icon: event.target.value as BadgeIconKey })} className={inputClass}>
              {BADGE_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {BADGE_ICONS[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-[10rem] flex-1 text-xs font-medium">
            Words
            <input value={item.label} maxLength={40} placeholder={placeholder} onChange={(event) => change(index, { label: event.target.value })} className={inputClass} />
          </label>
          <button type="button" aria-label={`Remove item ${index + 1}`} onClick={() => onChange(items.filter((_, position) => position !== index))} className={`${dangerIconButton} mb-1`}>
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      {items.length < MAX_BADGES && (
        <button
          type="button"
          onClick={() => onChange([...items, { icon: "leaf", label: "" }])}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#536B35]/30 px-4 text-sm font-semibold text-[#263D18] hover:bg-[#EAF1DF]/60"
        >
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}
