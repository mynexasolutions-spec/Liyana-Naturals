"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ImageOff, Pencil, Trash2 } from "lucide-react";
import {
  adminRequest,
  ConfirmDialog,
  dangerIconButton,
  EmptyState,
  errorText,
  Feedback,
  FormActions,
  FormError,
  iconButton,
  ImageField,
  inputClass,
  Modal,
  PageHeader,
  panel,
  removeImages,
  Switch,
  useAdminAction,
  useRealtimeRefresh,
  useViewMode,
  DataTable,
  DataView,
  ViewToggle,
} from "@/components/admin/kit";
import { isSafeBannerLink } from "@/lib/banners/link";
import { renderableImageUrl } from "@/lib/media/image-url";

export type AdminBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  image_url: string | null;
  image_file_id: string | null;
  desktop_image_url: string | null;
  desktop_image_file_id: string | null;
  mobile_image_url: string | null;
  mobile_image_file_id: string | null;
  eyebrow?: string | null;
  button_label?: string | null;
  show_text?: boolean;
};

const EMPTY = {
  title: "",
  subtitle: "",
  link_url: "",
  eyebrow: "LIYANA NATURALS",
  button_label: "Shop Now",
  show_text: true,
  is_active: true,
  desktop_image_url: "",
  desktop_image_file_id: "",
  mobile_image_url: "",
  mobile_image_file_id: "",
};

function Preview({ url, label, className }: { url: string | null; label: string; className: string }) {
  const image = renderableImageUrl(url);
  return (
    <figure className="min-w-0">
      <div className={`relative overflow-hidden rounded-xl border border-[#28321F]/8 bg-[#FBF7EE] ${className}`}>
        {image ? (
          <Image src={image} alt={label} fill unoptimized sizes="(max-width: 768px) 100vw, 500px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[#777968]">
            <ImageOff className="size-5" />
          </span>
        )}
      </div>
      <figcaption className="mt-1 text-[11px] text-[#777968]">{label}</figcaption>
    </figure>
  );
}

export function BannerManager({
  banners,
  sections,
}: {
  banners: AdminBanner[];
  sections: { label: string; count: number; href: string; hint: string }[];
}) {
  useRealtimeRefresh("admin-banners", ["homepage_banners"]);
  const [view, setView] = useViewMode("banners");
  const { run, busy, locked, error, notice } = useAdminAction();
  const [editing, setEditing] = useState<AdminBanner | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminBanner | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [uploads, setUploads] = useState(0);
  // Images uploaded in the open form that are not saved yet.
  const [pending, setPending] = useState<string[]>([]);

  const openForm = (banner: AdminBanner | "new") => {
    setEditing(banner);
    setFormError("");
    setPending([]);
    setForm(
      banner === "new"
        ? EMPTY
        : {
            title: banner.title,
            subtitle: banner.subtitle ?? "",
            link_url: banner.link_url ?? "",
            eyebrow: banner.eyebrow === undefined ? EMPTY.eyebrow : banner.eyebrow ?? "",
            button_label: banner.button_label === undefined ? EMPTY.button_label : banner.button_label ?? "",
            show_text: banner.show_text !== false,
            is_active: banner.is_active,
            desktop_image_url: banner.desktop_image_url ?? banner.image_url ?? "",
            desktop_image_file_id: banner.desktop_image_file_id ?? "",
            mobile_image_url: banner.mobile_image_url ?? "",
            mobile_image_file_id: banner.mobile_image_file_id ?? "",
          },
    );
  };

  const closeForm = () => {
    if (busy || uploads > 0) return;
    void removeImages(pending);
    setPending([]);
    setEditing(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const link = form.link_url.trim();
    if (!form.title.trim()) return setFormError("Enter a title.");
    if (link && !isSafeBannerLink(link)) {
      return setFormError("The link must start with / (a page of this website) or https://");
    }
    if (editing === "new" && (!form.desktop_image_file_id || !form.mobile_image_file_id)) {
      return setFormError("Upload both the desktop and the mobile image.");
    }

    const previous = editing === "new" ? null : editing;
    const desktopChanged = form.desktop_image_file_id && form.desktop_image_file_id !== previous?.desktop_image_file_id;
    const mobileChanged = form.mobile_image_file_id && form.mobile_image_file_id !== previous?.mobile_image_file_id;
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      link_url: link || null,
      eyebrow: form.eyebrow.trim() || null,
      button_label: form.button_label.trim() || null,
      show_text: form.show_text,
      is_active: form.is_active,
      // Only changed images are sent. The old single-image field follows the desktop one.
      ...(desktopChanged
        ? {
            desktop_image_url: form.desktop_image_url,
            desktop_image_file_id: form.desktop_image_file_id,
            image_url: form.desktop_image_url,
            image_file_id: form.desktop_image_file_id,
          }
        : {}),
      ...(mobileChanged
        ? { mobile_image_url: form.mobile_image_url, mobile_image_file_id: form.mobile_image_file_id }
        : {}),
      ...(previous ? {} : { sort_order: Math.max(0, ...banners.map((banner) => banner.sort_order)) + 1 }),
    };

    setFormError("");
    let failure = "";
    const saved = await run(async () => {
      try {
        await adminRequest(
          previous ? `/api/admin/banners/${previous.id}` : "/api/admin/banners",
          previous ? "PATCH" : "POST",
          payload,
        );
      } catch (saveError) {
        failure = errorText(saveError);
        throw saveError;
      }
    }, "Banner saved.");
    if (!saved) return setFormError(failure);

    const kept = [form.desktop_image_file_id, form.mobile_image_file_id];
    const replaced = [
      ...(desktopChanged ? [previous?.desktop_image_file_id, previous?.image_file_id] : []),
      ...(mobileChanged ? [previous?.mobile_image_file_id] : []),
    ];
    void removeImages([...pending, ...replaced].filter((id) => id && !kept.includes(id)));
    setPending([]);
    setEditing(null);
  };

  const move = (index: number, step: -1 | 1) =>
    run(async () => {
      const ordered = [...banners];
      [ordered[index], ordered[index + step]] = [ordered[index + step], ordered[index]];
      for (const [position, banner] of ordered.entries()) {
        if (banner.sort_order !== position + 1) {
          await adminRequest(`/api/admin/banners/${banner.id}`, "PATCH", { sort_order: position + 1 });
        }
      }
    }, "Order saved.");

  const liveCount = banners.filter((banner) => banner.is_active).length;
  const showSwitch = (banner: AdminBanner) => (
    <Switch
      checked={banner.is_active}
      label={banner.is_active ? "Showing" : "Hidden"}
      disabled={locked}
      onChange={() =>
        void run(() => adminRequest(`/api/admin/banners/${banner.id}`, "PATCH", { is_active: !banner.is_active }), "Banner updated.")
      }
    />
  );
  const actions = (banner: AdminBanner) => {
    const index = banners.findIndex((item) => item.id === banner.id);
    return (
      <div className="flex justify-end gap-1">
        <button type="button" aria-label="Move earlier" disabled={locked || index === 0} onClick={() => void move(index, -1)} className={iconButton}>
          <ArrowUp className="size-4" />
        </button>
        <button type="button" aria-label="Move later" disabled={locked || index === banners.length - 1} onClick={() => void move(index, 1)} className={iconButton}>
          <ArrowDown className="size-4" />
        </button>
        <button type="button" aria-label={`Edit ${banner.title}`} onClick={() => openForm(banner)} className={iconButton}>
          <Pencil className="size-4" />
        </button>
        <button type="button" aria-label={`Delete ${banner.title}`} onClick={() => setDeleting(banner)} className={dangerIconButton}>
          <Trash2 className="size-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Homepage" addLabel="Add banner" onAdd={() => openForm("new")} />

      <section aria-label="Other homepage sections" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sections.map((section) => (
          <Link key={section.label} href={section.href} className={`${panel} min-w-0 p-4 hover:border-[#536B35]/40`}>
            <p className="text-2xl font-semibold text-[#263D18]">{section.count}</p>
            <p className="text-sm font-medium text-[#28321F]">{section.label}</p>
            <p className="mt-1 text-xs text-[#777968]">{section.hint}</p>
          </Link>
        ))}
      </section>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-xl text-[#263D18]">Hero banners</h2>
          <p className="text-xs text-[#777968]">
            {liveCount === 0
              ? "No banner is active, so the website shows its built-in slides."
              : `${liveCount} banner${liveCount === 1 ? "" : "s"} rotating at the top of the homepage, in this order.`}
          </p>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>
      <Feedback error={editing ? "" : error} notice={notice} />

      {banners.length === 0 ? (
        <EmptyState>No banners yet. Add your first one.</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={banners}
              columns={[
                { label: "Slide", cell: (banner) => banners.findIndex((item) => item.id === banner.id) + 1 },
                {
                  label: "Images",
                  cell: (banner) => (
                    <div className="flex gap-2">
                      <div className="w-36">
                        <Preview url={banner.desktop_image_url ?? banner.image_url} label="Desktop" className="aspect-[12/5]" />
                      </div>
                      <div className="w-10">
                        <Preview url={banner.mobile_image_url} label="Mobile" className="aspect-[3/4]" />
                      </div>
                    </div>
                  ),
                },
                {
                  label: "Banner",
                  cell: (banner) => (
                    <div className="max-w-xs">
                      <p className="font-medium text-[#263D18]">{banner.title}</p>
                      <p className="truncate text-xs text-[#777968]">Button opens {banner.link_url || "/shop"}</p>
                    </div>
                  ),
                },
                { label: "Status", cell: showSwitch },
                { label: "Actions", align: "right", cell: actions },
              ]}
            />
          }
          grid={
            <ol className="grid gap-4 xl:grid-cols-2">
              {banners.map((banner, index) => (
                <li key={banner.id} className={`${panel} flex min-w-0 flex-col gap-4 p-4`}>
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <Preview url={banner.desktop_image_url ?? banner.image_url} label="Desktop" className="aspect-[12/5]" />
                    </div>
                    <div className="w-20 shrink-0">
                      <Preview url={banner.mobile_image_url} label="Mobile" className="aspect-[3/4]" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#777968]">Slide {index + 1}</p>
                    <h3 className="break-words font-serif text-xl text-[#263D18]">{banner.title}</h3>
                    {banner.subtitle && <p className="mt-1 line-clamp-2 text-sm text-[#555C4A]">{banner.subtitle}</p>}
                    <p className="mt-1 truncate text-xs text-[#777968]">Button opens {banner.link_url || "/shop"}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#28321F]/8 pt-3">
                    {showSwitch(banner)}
                    {actions(banner)}
                  </div>
                </li>
              ))}
            </ol>
          }
        />
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add banner" : "Edit banner"} wide onClose={closeForm}>
          <form onSubmit={save} noValidate className="space-y-4">
            <FormError>{formError}</FormError>
            <div className="rounded-xl bg-[#FBF7EE] px-4 py-3">
              <Switch checked={form.show_text} label="Show text and button over the image" onChange={() => setForm({ ...form, show_text: !form.show_text })} />
              <p className="mt-1.5 text-xs text-[#777968]">Turn off if your picture already has the text in it. The whole picture then opens the link.</p>
            </div>
            <label className="block text-sm font-medium">
              Title
              <input value={form.title} maxLength={160} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} />
              {!form.show_text && <span className="mt-1 block text-xs font-normal text-[#777968]">Not shown; used to describe the picture.</span>}
            </label>
            {form.show_text && (
              <>
                <label className="block text-sm font-medium">
                  Small label above the title (empty to hide)
                  <input value={form.eyebrow} maxLength={60} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} className={inputClass} />
                </label>
                <label className="block text-sm font-medium">
                  Subtitle (empty to hide)
                  <textarea rows={2} maxLength={1000} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className={inputClass} />
                </label>
                <label className="block text-sm font-medium">
                  Button text (empty to hide the button)
                  <input value={form.button_label} maxLength={40} onChange={(event) => setForm({ ...form, button_label: event.target.value })} className={inputClass} />
                </label>
              </>
            )}
            <label className="block text-sm font-medium">
              Link (optional)
              <input value={form.link_url} maxLength={2048} placeholder="/shop" onChange={(event) => setForm({ ...form, link_url: event.target.value })} className={inputClass} />
            </label>
            <ImageField
              label="Desktop image"
              help="Wide picture, at least 1200 × 500. JPG, PNG or WebP up to 40 MB, compressed automatically."
              url={form.desktop_image_url}
              folder="/liyana-naturals/banners/desktop"
              rules={{ minWidth: 1200, minHeight: 500, minRatio: 1.6, maxRatio: 3 }}
              onBusy={(isBusy) => setUploads((value) => value + (isBusy ? 1 : -1))}
              onUploaded={(image) => {
                setPending((current) => [...current, image.fileId]);
                setForm((current) => ({ ...current, desktop_image_url: image.url, desktop_image_file_id: image.fileId }));
              }}
            />
            <ImageField
              label="Mobile image"
              help="Tall picture, at least 360 × 480. JPG, PNG or WebP up to 40 MB, compressed automatically."
              url={form.mobile_image_url}
              folder="/liyana-naturals/banners/mobile"
              rules={{ minWidth: 360, minHeight: 480, minRatio: 0.45, maxRatio: 1.1 }}
              onBusy={(isBusy) => setUploads((value) => value + (isBusy ? 1 : -1))}
              onUploaded={(image) => {
                setPending((current) => [...current, image.fileId]);
                setForm((current) => ({ ...current, mobile_image_url: image.url, mobile_image_file_id: image.fileId }));
              }}
            />
            <Switch checked={form.is_active} label="Show on the homepage" onChange={() => setForm({ ...form, is_active: !form.is_active })} />
            <FormActions busy={busy || uploads > 0} label="Save banner" onCancel={closeForm} />
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete banner"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void run(async () => {
              await adminRequest(`/api/admin/banners/${deleting.id}`, "DELETE");
              await removeImages([deleting.image_file_id, deleting.desktop_image_file_id, deleting.mobile_image_file_id]);
            }, "Banner deleted.").then(() => setDeleting(null))
          }
        >
          Delete <strong>{deleting.title}</strong> and its images? To only hide it, switch it off instead.
        </ConfirmDialog>
      )}
    </div>
  );
}
