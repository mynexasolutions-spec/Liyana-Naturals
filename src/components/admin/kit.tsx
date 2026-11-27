"use client";

// Shared building blocks for the admin management pages.

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ImageOff, LayoutGrid, Plus, Rows3, Search, Upload, X } from "lucide-react";
import { compressionNote } from "@/lib/media/compress-image";
import { renderableImageUrl } from "@/lib/media/image-url";
import { deleteUploadedImage, uploadAdminImage } from "@/lib/media/upload-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#28321F]/12 bg-white px-3.5 py-2.5 text-sm font-normal text-[#28321F] outline-none focus:border-[#536B35] focus:ring-2 focus:ring-[#536B35]/15 disabled:bg-[#FBF7EE] disabled:text-[#777968]";
export const primaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#263D18] px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60";
export const secondaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#28321F]/12 bg-white px-5 text-sm font-medium text-[#28321F] disabled:opacity-50";
export const iconButton = "grid size-9 shrink-0 place-items-center rounded-lg text-[#536B35] hover:bg-[#EAF1DF] disabled:opacity-35";
export const dangerIconButton = "grid size-9 shrink-0 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-35";
export const panel = "rounded-2xl border border-[#28321F]/8 bg-white shadow-soft";

export const errorText = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong.");

export async function adminRequest(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.ok) return;
  const result = (await response.json().catch(() => ({}))) as { error?: string };
  throw new Error(result.error ?? `Request failed (${response.status}).`);
}

/** Runs a change, reports the result and reloads the page data. */
export function useAdminAction() {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const run = async (task: () => Promise<void>, success: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      setNotice(success);
      return true;
    } catch (taskError) {
      setError(errorText(taskError));
      return false;
    } finally {
      setBusy(false);
      startRefresh(() => router.refresh());
    }
  };

  return { run, busy, locked: busy || isRefreshing, error, notice };
}

/** Reloads the page data when any of these tables changes. */
export function useRealtimeRefresh(channelName: string, tables: string[]) {
  const router = useRouter();
  const list = tables.join(",");
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel = supabase.channel(channelName);
    for (const table of list.split(",")) {
      channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, () => router.refresh());
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelName, list, router]);
}

export function PageHeader({
  title,
  subtitle,
  addLabel,
  onAdd,
}: {
  title: string;
  subtitle?: string;
  addLabel?: string;
  onAdd?: () => void;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-[#777968]">{subtitle ?? "Store management"}</p>
        <h1 className="font-serif text-3xl text-[#263D18]">{title}</h1>
      </div>
      {onAdd && (
        <button type="button" onClick={onAdd} className={primaryButton}>
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </header>
  );
}

export function StatGrid({ items }: { items: [label: string, value: string | number][] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className={`${panel} flex min-w-0 flex-col-reverse p-4`}>
          <dt className="mt-1 text-xs text-[#777968]">{label}</dt>
          <dd className="break-words text-2xl font-semibold text-[#263D18]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type ViewMode = "table" | "grid";

/**
 * The chosen layout, remembered on this device. Until the admin picks one (null),
 * large screens show the table and phones show the grid.
 */
export function useViewMode(key: string) {
  const [view, setView] = useState<ViewMode | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`admin-view:${key}`);
      if (saved === "table" || saved === "grid") setView(saved);
    } catch {
      // Storage can be unavailable; the screen size decides.
    }
  }, [key]);

  const choose = (next: ViewMode) => {
    setView(next);
    try {
      window.localStorage.setItem(`admin-view:${key}`, next);
    } catch {
      // The choice still applies until the page is closed.
    }
  };

  return [view, choose] as const;
}

export function ViewToggle({ view, onChange }: { view: ViewMode | null; onChange: (view: ViewMode) => void }) {
  const active = "bg-[#263D18] text-white";
  const idle = "text-[#555C4A]";
  // Before a choice is made, the highlight follows the screen size like the content does.
  const style = (mode: ViewMode) => {
    if (view) return view === mode ? active : idle;
    return mode === "table"
      ? "text-[#555C4A] lg:bg-[#263D18] lg:text-white"
      : "bg-[#263D18] text-white lg:bg-transparent lg:text-[#555C4A]";
  };

  return (
    <div role="group" aria-label="Layout" className="flex shrink-0 gap-1 rounded-xl border border-[#28321F]/10 bg-white p-1">
      {(
        [
          ["table", "Table view", Rows3],
          ["grid", "Grid view", LayoutGrid],
        ] as const
      ).map(([mode, label, Icon]) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={view === mode}
          onClick={() => onChange(mode)}
          className={`grid h-9 w-10 place-items-center rounded-lg ${style(mode)}`}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

export function DataView({ view, table, grid }: { view: ViewMode | null; table: React.ReactNode; grid: React.ReactNode }) {
  if (view === "table") return <>{table}</>;
  if (view === "grid") return <>{grid}</>;
  return (
    <>
      <div className="hidden lg:block">{table}</div>
      <div className="lg:hidden">{grid}</div>
    </>
  );
}

export type Column<T> = {
  label: string;
  cell: (row: T) => React.ReactNode;
  align?: "right";
};

export function DataTable<T extends { id: string }>({ rows, columns }: { rows: T[]; columns: Column<T>[] }) {
  return (
    <div className={`${panel} overflow-x-auto`}>
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[#FBF7EE] text-xs text-[#777968]">
          <tr>
            {columns.map((column) => (
              <th key={column.label} className={`whitespace-nowrap px-4 py-3 font-medium ${column.align === "right" ? "text-right" : ""}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[#28321F]/8 align-middle hover:bg-[#FBF7EE]/60">
              {columns.map((column) => (
                <td key={column.label} className={`px-4 py-3 ${column.align === "right" ? "text-right" : ""}`}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Toolbar<K extends string>({
  filters,
  filter,
  onFilter,
  query,
  onQuery,
  placeholder,
  view,
  onView,
}: {
  filters: readonly (readonly [K, string])[];
  filter: K;
  onFilter: (key: K) => void;
  query: string;
  onQuery: (value: string) => void;
  placeholder: string;
  view: ViewMode | null;
  onView: (view: ViewMode) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => onFilter(key)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold ${
              filter === key ? "border-[#263D18] bg-[#263D18] text-white" : "border-[#28321F]/12 bg-white text-[#555C4A]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <label className="relative block min-w-0 flex-1 lg:w-80 lg:flex-none">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777968]" />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-11 w-full rounded-xl border border-[#28321F]/10 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#536B35]"
          />
        </label>
        <ViewToggle view={view} onChange={onView} />
      </div>
    </div>
  );
}

export function Feedback({ error, notice }: { error: string; notice: string }) {
  return (
    <>
      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}
      {notice && (
        <p role="status" className="fixed right-4 top-4 z-[80] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-[#536B35]/20 bg-[#EAF1DF] px-4 py-3 text-sm text-[#263D18] shadow-lg">
          <CheckCircle2 className="size-4 shrink-0" /> {notice}
        </p>
      )}
    </>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#28321F]/15 bg-white px-5 py-16 text-center text-sm text-[#777968]">
      {children}
    </div>
  );
}

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className={secondaryButton}>
        Previous
      </button>
      <span className="text-xs text-[#777968]">
        Page {page} of {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className={secondaryButton}>
        Next
      </button>
    </div>
  );
}

export function Switch({
  checked,
  label,
  disabled,
  onChange,
}: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="flex items-center gap-2 text-xs font-medium text-[#28321F] disabled:opacity-50"
    >
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-[#3C6E26]" : "bg-[#CFCFC4]"}`}>
        <span className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </span>
      {label}
    </button>
  );
}

export function Modal({
  title,
  wide,
  onClose,
  children,
}: {
  title: string;
  wide?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#1D3214]/45 p-3 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-elevated md:p-6 ${wide ? "max-w-3xl" : "max-w-xl"}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-[#263D18]">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-[#FBF7EE]">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormError({ children }: { children: string }) {
  return children ? (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {children}
    </p>
  ) : null;
}

export function FormActions({ busy, label, onCancel }: { busy: boolean; label: string; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-3 pt-1">
      <button type="button" onClick={onCancel} disabled={busy} className={secondaryButton}>
        Cancel
      </button>
      <button type="submit" disabled={busy} className={primaryButton}>
        {busy ? "Please wait…" : label}
      </button>
    </div>
  );
}

export function ConfirmDialog({
  title,
  busy,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
  children,
}: {
  title: string;
  busy: boolean;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal title={title} onClose={() => !busy && onCancel()}>
      <div className="text-sm text-[#555C4A]">{children}</div>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" disabled={busy} onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button type="button" disabled={busy} onClick={onConfirm} className="h-11 rounded-full bg-red-600 px-6 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export async function removeImages(fileIds: (string | null | undefined)[]) {
  for (const fileId of new Set(fileIds)) {
    // A leftover file is harmless; the record change has already been made.
    if (fileId) await deleteUploadedImage(fileId).catch(() => {});
  }
}

export type ImageRules = {
  minWidth: number;
  minHeight: number;
  minRatio?: number;
  maxRatio?: number;
  /** Shown when the shape is wrong, such as "Use a square (1:1) image." */
  shapeHint?: string;
};

export async function checkDimensions(file: File, rules: ImageRules) {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image could not be read. Choose another file.");
  }
  const { width, height } = bitmap;
  bitmap.close();
  if (width < rules.minWidth || height < rules.minHeight) {
    throw new Error(`The image must be at least ${rules.minWidth} × ${rules.minHeight} pixels. This one is ${width} × ${height}.`);
  }
  const ratio = width / height;
  if ((rules.minRatio && ratio < rules.minRatio) || (rules.maxRatio && ratio > rules.maxRatio)) {
    throw new Error(`${rules.shapeHint ?? "The image has the wrong shape for this space."} This one is ${width} × ${height}.`);
  }
}

export function ImageField({
  label,
  help,
  url,
  folder,
  rules,
  onBusy,
  onUploaded,
  onRemove,
}: {
  label: string;
  help: string;
  url: string;
  folder: string;
  rules?: ImageRules;
  onBusy: (busy: boolean) => void;
  onUploaded: (image: { url: string; fileId: string }) => void;
  onRemove?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const preview = renderableImageUrl(url);

  const upload = async (file: File) => {
    setUploading(true);
    onBusy(true);
    setError("");
    try {
      if (rules) await checkDimensions(file, rules);
      setSaved("");
      const image = await uploadAdminImage(file, folder);
      setSaved(compressionNote(image.originalBytes, image.storedBytes));
      onUploaded(image);
    } catch (uploadError) {
      setError(errorText(uploadError));
    } finally {
      setUploading(false);
      onBusy(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-[#28321F]/10 bg-[#FBF7EE]">
          {preview ? (
            <Image src={preview} alt={`${label} preview`} fill unoptimized sizes="176px" className="object-contain p-1.5" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[#777968]">
              <ImageOff className="size-5" />
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#536B35]/30 px-4 text-sm font-semibold text-[#263D18] ${uploading ? "opacity-60" : ""}`}>
            <Upload className="size-4" />
            {uploading ? "Uploading…" : preview ? "Change image" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />
          </label>
          {preview && onRemove && (
            <button type="button" onClick={onRemove} className="block text-xs font-semibold text-red-600">
              Remove image
            </button>
          )}
          <p className="text-xs text-[#777968]">{help}</p>
          {saved && <p role="status" className="text-xs font-medium text-[#3C6E26]">{saved}</p>}
          {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
