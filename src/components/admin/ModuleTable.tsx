"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDownUp, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Row = Record<string, unknown> & { id: string };

export type ModuleFieldType =
  | "text"
  | "number"
  | "email"
  | "textarea"
  | "boolean"
  | "json"
  | "select"
  | "image";

export interface ModuleField {
  key: string;
  label: string;
  type?: ModuleFieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  assetIdKey?: string;
  folder?: string;
  relation?: { table: string; labelKey: string; valueKey?: string };
}

export interface ModuleColumn {
  key: string;
  label: string;
  format?: "product" | "currency" | "status";
}

interface ModuleTableProps {
  table: string;
  title: string;
  columns: ModuleColumn[];
  searchKeys: string[];
  emptyFields: ModuleField[];
  orderBy?: string;
  allowCreate?: boolean;
  filters?: { key: string; value: string; operator?: "eq" | "like" }[];
}

const PAGE_SIZE = 10;
const EMPTY_FILTERS: NonNullable<ModuleTableProps["filters"]> = [];

function renderCell(row: Row, column: ModuleColumn) {
  const value = row[column.key];

  if (column.format === "product") {
    return (
      <div>
        <p className="font-medium text-[#263D18]">{String(value ?? "")}</p>
        <p className="text-xs text-[#777968]">{String(row.slug ?? "")}</p>
      </div>
    );
  }

  if (column.format === "currency") {
    const amount = Number(value);
    return <span>₹{Number.isFinite(amount) ? amount.toLocaleString("en-IN") : "0"}</span>;
  }

  if (column.format === "status") {
    const label =
      typeof value === "boolean"
        ? value
          ? "Active"
          : "Hidden"
        : String(value ?? "").replaceAll("_", " ");
    const normalized = label.toLowerCase();
    const positive = ["active", "approved", "confirmed", "delivered", "paid", "published", "resolved"].includes(normalized);
    const negative = ["cancelled", "closed", "failed", "hidden", "inactive", "rejected"].includes(normalized);

    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs ${
          positive
            ? "bg-green-50 text-green-700"
            : negative
              ? "bg-red-50 text-red-700"
              : "bg-amber-50 text-amber-700"
        }`}
      >
        {label}
      </span>
    );
  }

  return String(value ?? "—");
}

function inputValue(value: unknown, type?: ModuleFieldType): string | boolean {
  if (type === "boolean") return Boolean(value);
  if (type === "json") {
    if (typeof value === "string") return value;
    return value === undefined || value === null
      ? "{}"
      : JSON.stringify(value, null, 2);
  }
  if (type === "image" && Array.isArray(value)) return JSON.stringify(value, null, 2);
  return value === undefined || value === null ? "" : String(value);
}

function buildPayload(
  form: Record<string, unknown>,
  fields: ModuleField[],
): { payload?: Record<string, unknown>; error?: string } {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const value = form[field.key];
    const stringValue = typeof value === "string" ? value.trim() : value;

    if (field.required && (stringValue === "" || stringValue === undefined)) {
      return { error: `${field.label} is required.` };
    }

    if (stringValue === "" || stringValue === undefined) continue;

    if (field.type === "email" && typeof stringValue === "string") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
        return { error: `Enter a valid ${field.label.toLowerCase()}.` };
      }
      payload[field.key] = stringValue.toLowerCase();
      continue;
    }

    if (field.type === "number") {
      const numberValue = Number(stringValue);
      if (!Number.isFinite(numberValue)) {
        return { error: `${field.label} must be a valid number.` };
      }
      payload[field.key] = numberValue;
      continue;
    }

    if (field.type === "json") {
      try {
        payload[field.key] = JSON.parse(String(stringValue));
      } catch {
        return { error: `${field.label} must contain valid JSON.` };
      }
      continue;
    }

    if (field.type === "image" && !field.assetIdKey) {
      try {
        payload[field.key] = JSON.parse(String(stringValue));
      } catch {
        return { error: `${field.label} must contain a valid uploaded image list.` };
      }
      continue;
    }

    payload[field.key] = field.type === "boolean" ? Boolean(value) : stringValue;
    if (field.assetIdKey && form[field.assetIdKey]) {
      payload[field.assetIdKey] = form[field.assetIdKey];
    }
  }

  return { payload };
}

export function ModuleTable({
  table,
  title,
  columns,
  searchKeys,
  emptyFields,
  orderBy = "created_at",
  allowCreate = true,
  filters = EMPTY_FILTERS,
}: ModuleTableProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState(columns[0]?.key ?? orderBy);
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [relationOptions, setRelationOptions] = useState<Record<string, { label: string; value: string }[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select("*");
    for (const filter of filters) {
      query = filter.operator === "like"
        ? query.like(filter.key, filter.value)
        : query.eq(filter.key, filter.value);
    }
    const { data, error: loadError } = await query.order(orderBy, { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setRows([]);
    } else {
      setError("");
      setRows((data as Row[]) ?? []);
    }
    setLoading(false);
  }, [filters, orderBy, supabase, table]);

  useEffect(() => {
    const relationFields = emptyFields.filter((field) => field.relation);
    if (relationFields.length === 0) return;

    void Promise.all(
      relationFields.map(async (field) => {
        const relation = field.relation!;
        const { data, error: relationError } = await supabase
          .from(relation.table)
          .select(`${relation.valueKey ?? "id"},${relation.labelKey}`)
          .order(relation.labelKey, { ascending: true });
        if (relationError) throw relationError;
        const relationRows = (data ?? []) as unknown as Record<string, unknown>[];
        return [
          field.key,
          relationRows.map((row) => ({
            label: String(row[relation.labelKey] ?? ""),
            value: String(row[relation.valueKey ?? "id"] ?? ""),
          })),
        ] as const;
      }),
    )
      .then((entries) => setRelationOptions(Object.fromEntries(entries)))
      .catch((relationError: unknown) => {
        setError(relationError instanceof Error ? relationError.message : "Related records could not be loaded.");
      });
  }, [emptyFields, supabase]);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel(`admin-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => void load(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load, supabase, table]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const searched = needle
      ? rows.filter((row) =>
          searchKeys.some((key) =>
            String(row[key] ?? "").toLowerCase().includes(needle),
          ),
        )
      : rows;

    return [...searched].sort((left, right) => {
      const a = String(left[sortKey] ?? "").toLowerCase();
      const b = String(right[sortKey] ?? "").toLowerCase();
      return (a === b ? 0 : a > b ? 1 : -1) * (ascending ? 1 : -1);
    });
  }, [ascending, query, rows, searchKeys, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function closeEditor() {
    if (saving) return;
    setCreating(false);
    setEditing(null);
    setError("");
  }

  function openCreate() {
    setEditing(null);
    setForm(
      Object.fromEntries(
        emptyFields.flatMap((field) => [
          [field.key, field.type === "boolean" ? false : field.type === "json" || field.type === "image" ? "[]" : ""],
          ...(field.assetIdKey ? [[field.assetIdKey, ""]] : []),
        ]),
      ),
    );
    setError("");
    setCreating(true);
  }

  function openEdit(row: Row) {
    setCreating(false);
    setEditing(row);
    setForm(
      Object.fromEntries(
        emptyFields.flatMap((field) => [
          [field.key, inputValue(row[field.key], field.type)],
          ...(field.assetIdKey ? [[field.assetIdKey, row[field.assetIdKey] ?? ""]] : []),
        ]),
      ),
    );
    setError("");
  }

  async function uploadImage(field: ModuleField, file: File) {
    setError("");
    setUploadingKey(field.key);
    try {
      const authResponse = await fetch(
        `/api/imagekit/auth?folder=${encodeURIComponent(field.folder ?? "/liyana-naturals")}`,
      );
      const auth = await authResponse.json();
      if (!authResponse.ok) throw new Error(auth.error ?? "Unable to authorize image upload.");

      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("fileName", file.name);
      uploadForm.append("publicKey", auth.publicKey);
      uploadForm.append("signature", auth.signature);
      uploadForm.append("expire", String(auth.expire));
      uploadForm.append("token", auth.token);
      uploadForm.append("folder", auth.folder);

      const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: uploadForm,
      });
      const upload = await uploadResponse.json();
      if (!uploadResponse.ok || !upload.url || !upload.fileId) {
        throw new Error(upload.message ?? "Image upload failed.");
      }

      const assetResponse = await fetch("/api/imagekit/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: upload.fileId,
          name: upload.name ?? file.name,
          url: upload.url,
          thumbnailUrl: upload.thumbnailUrl,
          mime: file.type,
          sizeBytes: file.size,
          folder: auth.folder,
        }),
      });
      const asset = await assetResponse.json();
      if (!assetResponse.ok) throw new Error(asset.error ?? "Image metadata could not be saved.");

      setForm((current) => {
        if (field.assetIdKey) {
          return { ...current, [field.key]: upload.url, [field.assetIdKey]: upload.fileId };
        }
        const currentImages = (() => {
          try {
            const parsed = JSON.parse(String(current[field.key] ?? "[]"));
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })();
        return {
          ...current,
          [field.key]: JSON.stringify([
            ...currentImages,
            { src: upload.url, alt: upload.name ?? file.name, fileId: upload.fileId },
          ]),
        };
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function deleteImage(fileId: string) {
    const response = await fetch("/api/imagekit/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error ?? "Uploaded image could not be deleted.");
    }
  }

  function fileIdsForRow(row: Row): string[] {
    const ids = emptyFields.flatMap((field) => {
      if (field.assetIdKey && typeof row[field.assetIdKey] === "string") {
        return [row[field.assetIdKey] as string];
      }
      if (field.type === "image" && !field.assetIdKey && Array.isArray(row[field.key])) {
        return (row[field.key] as { fileId?: unknown }[]).flatMap((image) =>
          typeof image.fileId === "string" ? [image.fileId] : [],
        );
      }
      return [];
    });
    return [...new Set(ids)];
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const result = buildPayload(form, emptyFields);
    if (result.error || !result.payload) {
      setError(result.error ?? "Enter valid values before saving.");
      return;
    }

    setSaving(true);
    const mutation = editing
      ? supabase.from(table).update(result.payload).eq("id", editing.id)
      : supabase.from(table).insert(result.payload);
    const { error: mutationError } = await mutation;

    if (mutationError) {
      setError(mutationError.message);
    } else {
      if (editing) {
        const oldIds = fileIdsForRow(editing);
        const newIds = fileIdsForRow(result.payload as Row);
        for (const fileId of oldIds.filter((id) => !newIds.includes(id))) {
          try {
            await deleteImage(fileId);
          } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Old image cleanup failed.");
          }
        }
      }
      setCreating(false);
      setEditing(null);
      await load();
    }
    setSaving(false);
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete this ${title.toLowerCase()} record? This cannot be undone.`)) return;
    setError("");
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("id", row.id);
    if (deleteError) setError(deleteError.message);
    else {
      for (const fileId of fileIdsForRow(row)) {
        try {
          await deleteImage(fileId);
        } catch (deleteError) {
          setError(deleteError instanceof Error ? deleteError.message : "Image cleanup failed.");
        }
      }
      await load();
    }
  }

  const modalOpen = creating || Boolean(editing);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#777968]">Store management</p>
          <h1 className="font-serif text-3xl text-[#263D18]">{title}</h1>
        </div>
        {allowCreate && (
          <button
            onClick={openCreate}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#263D18] px-5 text-sm font-semibold text-white"
          >
            <Plus className="size-4" /> Add {title.replace(/s$/, "")}
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#28321F]/8 bg-white">
        <div className="flex flex-col gap-3 border-b border-[#28321F]/8 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777968]" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="h-11 w-full rounded-xl border border-[#28321F]/10 pl-9 pr-4 text-sm outline-none focus:border-[#536B35]"
            />
          </div>
          <p className="text-xs text-[#777968]">
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#FBF7EE] text-xs text-[#777968]">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-5 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortKey === column.key) setAscending((value) => !value);
                        else {
                          setSortKey(column.key);
                          setAscending(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5"
                    >
                      {column.label}
                      <ArrowDownUp className="size-3" />
                    </button>
                  </th>
                ))}
                <th className="w-24 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-t border-[#28321F]/8">
                  {columns.map((column) => (
                    <td key={column.key} className="px-5 py-4">
                      {renderCell(row, column)}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        aria-label={`Edit ${title}`}
                        onClick={() => openEdit(row)}
                        className="grid size-9 place-items-center rounded-lg text-[#536B35] hover:bg-[#E9DCC5]/50"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        aria-label={`Delete ${title}`}
                        onClick={() => void remove(row)}
                        className="grid size-9 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-14 text-center text-[#777968]">
                    Loading records…
                  </td>
                </tr>
              )}
              {!loading && visibleRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-14 text-center text-[#777968]">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#28321F]/8 px-5 py-3 text-sm">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              className="rounded-full border border-[#28321F]/12 px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-[#777968]">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-full border border-[#28321F]/12 px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#1D3214]/40 p-4" role="dialog" aria-modal="true">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-elevated md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">{editing ? "Edit" : "Add"} {title.replace(/s$/, "")}</h2>
              <button type="button" aria-label="Close" onClick={closeEditor} className="grid size-9 place-items-center rounded-lg hover:bg-[#FBF7EE]">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {emptyFields.map((field) => (
                  <label key={field.key} className={field.type === "textarea" || field.type === "json" || field.type === "image" ? "sm:col-span-2" : ""}>
                  <span className="mb-1.5 block text-sm font-medium">{field.label}{field.required ? " *" : ""}</span>
                  {field.type === "image" ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingKey === field.key}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadImage(field, file);
                          event.currentTarget.value = "";
                        }}
                        className="block w-full rounded-xl border border-[#28321F]/10 px-3 py-2 text-sm"
                      />
                      {uploadingKey === field.key && <p className="text-xs text-[#777968]">Uploading securely…</p>}
                      {field.assetIdKey && typeof form[field.key] === "string" && Boolean(form[field.key]) && (
                        <Image src={String(form[field.key])} alt={field.label} width={96} height={96} unoptimized className="size-24 rounded-xl object-cover" />
                      )}
                      {!field.assetIdKey && <textarea value={String(form[field.key] ?? "[]")} readOnly className="min-h-20 w-full rounded-xl border border-[#28321F]/10 px-3 py-2 text-xs text-[#777968]" />}
                    </div>
                  ) : field.type === "textarea" || field.type === "json" ? (
                    <textarea
                      value={String(form[field.key] ?? "")}
                      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                      className="min-h-24 w-full rounded-xl border border-[#28321F]/10 px-3 py-2.5 text-sm outline-none focus:border-[#536B35]"
                    />
                  ) : field.type === "boolean" ? (
                    <select
                      value={String(Boolean(form[field.key]))}
                      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value === "true" }))}
                      className="h-11 w-full rounded-xl border border-[#28321F]/10 px-3 text-sm"
                    >
                      <option value="true">Yes</option><option value="false">No</option>
                    </select>
                  ) : field.type === "select" ? (
                    <select
                      value={String(form[field.key] ?? "")}
                      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                      className="h-11 w-full rounded-xl border border-[#28321F]/10 px-3 text-sm"
                    >
                      <option value="">Select {field.label.toLowerCase()}</option>
                      {(field.options ?? relationOptions[field.key] ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      value={String(form[field.key] ?? "")}
                      onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                      className="h-11 w-full rounded-xl border border-[#28321F]/10 px-3 text-sm outline-none focus:border-[#536B35]"
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeEditor} className="h-11 rounded-full border border-[#28321F]/12 px-5 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="h-11 rounded-full bg-[#263D18] px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
