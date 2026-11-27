"use client";

import React, { useState } from "react";
import { Check, Pencil, Star, Trash2, X } from "lucide-react";
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
  inputClass,
  Modal,
  PageHeader,
  Pager,
  panel,
  StatGrid,
  Switch,
  Toolbar,
  useAdminAction,
  useRealtimeRefresh,
  useViewMode,
  DataTable,
  DataView,
} from "@/components/admin/kit";
import { formatIndiaTime } from "@/lib/shiprocket/shared";

type Status = "pending" | "approved" | "rejected";

export type AdminReview = {
  id: string;
  productName: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  status: Status;
  /** Chosen for the home page; it appears there only while approved. */
  showOnHome: boolean;
  createdAt: string;
};

const FILTERS = [
  ["all", "All"],
  ["pending", "Waiting"],
  ["approved", "Approved"],
  ["home", "On home page"],
  ["rejected", "Rejected"],
] as const;
const PER_PAGE = 10;
const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-700",
};
const STATUS_LABEL: Record<Status, string> = { pending: "Waiting", approved: "Approved", rejected: "Rejected" };
const EMPTY = { product_id: "", author_name: "", rating: 5, title: "", body: "", status: "pending" as Status, show_on_home: false };

const isOnHome = (review: AdminReview) => review.status === "approved" && review.showOnHome;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} className={`size-4 ${value <= rating ? "fill-amber-400 text-amber-500" : "text-[#CFCFC4]"}`} />
      ))}
    </span>
  );
}

export function ReviewManager({ reviews, products }: { reviews: AdminReview[]; products: { id: string; name: string }[] }) {
  useRealtimeRefresh("admin-reviews", ["reviews"]);
  const [view, setView] = useViewMode("reviews");
  const { run, busy, locked, error, notice } = useAdminAction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminReview | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminReview | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");

  const needle = query.trim().toLowerCase();
  const matched = reviews.filter(
    (review) =>
      (filter === "all" || (filter === "home" ? isOnHome(review) : review.status === filter)) &&
      (!needle || `${review.author} ${review.productName} ${review.title} ${review.body}`.toLowerCase().includes(needle)),
  );
  const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const approved = reviews.filter((review) => review.status === "approved");
  const average = approved.length ? approved.reduce((total, review) => total + review.rating, 0) / approved.length : 0;

  const setStatus = (review: AdminReview, status: Status) =>
    run(
      () => adminRequest(`/api/admin/reviews/${review.id}`, "PATCH", { status }),
      status === "approved" ? "Review approved. It is now visible in the store." : "Review rejected.",
    );

  const toggleHome = (review: AdminReview) =>
    run(
      () => adminRequest(`/api/admin/reviews/${review.id}`, "PATCH", { show_on_home: !review.showOnHome }),
      review.showOnHome ? "Removed from the home page." : "Added to the home page.",
    );

  // Only an approved review can be shown to visitors.
  const homeSwitch = (review: AdminReview) =>
    review.status === "approved" ? (
      <Switch
        checked={review.showOnHome}
        label="Home page"
        disabled={locked}
        onChange={() => void toggleHome(review)}
      />
    ) : (
      <span className="whitespace-nowrap text-xs text-[#777968]">Approve first</span>
    );

  const statusBadge = (review: AdminReview) => (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[review.status]}`}>
      {STATUS_LABEL[review.status]}
    </span>
  );
  const decisions = (review: AdminReview) => (
    <div className="flex gap-2">
      {review.status !== "approved" && (
        <button type="button" disabled={locked} onClick={() => void setStatus(review, "approved")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#263D18] px-4 text-xs font-semibold text-white disabled:opacity-50">
          <Check className="size-3.5" /> Approve
        </button>
      )}
      {review.status !== "rejected" && (
        <button type="button" disabled={locked} onClick={() => void setStatus(review, "rejected")} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#28321F]/15 px-4 text-xs font-semibold disabled:opacity-50">
          <X className="size-3.5" /> Reject
        </button>
      )}
    </div>
  );
  const actions = (review: AdminReview) => (
    <div className="flex justify-end gap-1">
      <button type="button" aria-label={`Edit review by ${review.author}`} onClick={() => openForm(review)} className={iconButton}>
        <Pencil className="size-4" />
      </button>
      <button type="button" aria-label={`Delete review by ${review.author}`} onClick={() => setDeleting(review)} className={dangerIconButton}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );

  const openForm = (review: AdminReview | "new") => {
    setEditing(review);
    setFormError("");
    setForm(
      review === "new"
        ? EMPTY
        : {
            product_id: "",
            author_name: review.author,
            rating: review.rating,
            title: review.title,
            body: review.body,
            status: review.status,
            show_on_home: review.showOnHome,
          },
    );
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (editing === "new" && !form.product_id) {
      setFormError("Choose a product.");
      return;
    }
    const { product_id, ...fields } = form;
    const payload = { ...fields, title: form.title || null, body: form.body || null };
    setFormError("");
    let failure = "";
    const saved = await run(async () => {
      try {
        await adminRequest(
          editing === "new" ? "/api/admin/reviews" : `/api/admin/reviews/${editing.id}`,
          editing === "new" ? "POST" : "PATCH",
          editing === "new" ? { ...payload, product_id } : payload,
        );
      } catch (saveError) {
        failure = errorText(saveError);
        throw saveError;
      }
    }, "Review saved.");
    if (saved) setEditing(null);
    else setFormError(failure);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Reviews" addLabel="Add review" onAdd={() => openForm("new")} />
      <StatGrid
        items={[
          ["Reviews", reviews.length],
          ["Waiting for approval", reviews.filter((review) => review.status === "pending").length],
          ["On home page", reviews.filter(isOnHome).length],
          ["Average rating", approved.length ? `${average.toFixed(1)} / 5` : "—"],
        ]}
      />
      <Toolbar
        filters={FILTERS}
        filter={filter}
        onFilter={(key) => {
          setFilter(key);
          setPage(1);
        }}
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setPage(1);
        }}
        placeholder="Search customer, product or text"
        view={view}
        onView={setView}
      />
      <Feedback error={editing ? "" : error} notice={notice} />

      {visible.length === 0 ? (
        <EmptyState>{reviews.length === 0 ? "No reviews yet." : "No reviews match."}</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                { label: "Rating", cell: (review) => <Stars rating={review.rating} /> },
                {
                  label: "Review",
                  cell: (review) => (
                    <div className="max-w-sm">
                      {review.title && <p className="font-medium text-[#263D18]">{review.title}</p>}
                      <p className="line-clamp-2 break-words text-xs text-[#555C4A]" title={review.body}>
                        {review.body || "No written review."}
                      </p>
                    </div>
                  ),
                },
                {
                  label: "Customer",
                  cell: (review) => (
                    <>
                      <p className="font-medium">{review.author}</p>
                      <p className="text-xs text-[#777968]">{review.productName}</p>
                      <p className="whitespace-nowrap text-xs text-[#777968]">{formatIndiaTime(review.createdAt, false)}</p>
                    </>
                  ),
                },
                { label: "Status", cell: statusBadge },
                { label: "Show on home", cell: homeSwitch },
                { label: "Decision", cell: decisions },
                { label: "Actions", align: "right", cell: actions },
              ]}
            />
          }
          grid={
            <ul className="grid gap-3 md:grid-cols-2">
              {visible.map((review) => (
                <li key={review.id} className={`${panel} flex min-w-0 flex-col gap-2 p-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars rating={review.rating} />
                    {statusBadge(review)}
                  </div>
                  {review.title && <h2 className="break-words font-serif text-lg text-[#263D18]">{review.title}</h2>}
                  <p className="whitespace-pre-line break-words text-sm text-[#555C4A]">{review.body || "No written review."}</p>
                  <p className="text-xs text-[#777968]">
                    <strong className="text-[#28321F]">{review.author}</strong> on {review.productName} · {formatIndiaTime(review.createdAt, false)}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#28321F]/8 pt-3">
                    <div className="w-full">{homeSwitch(review)}</div>
                    {decisions(review)}
                    {actions(review)}
                  </div>
                </li>
              ))}
            </ul>
          }
        />
      )}
      <Pager page={current} pages={pages} onPage={setPage} />

      {editing && (
        <Modal title={editing === "new" ? "Add review" : "Edit review"} onClose={() => !busy && setEditing(null)}>
          <form onSubmit={save} noValidate className="space-y-4">
            <FormError>{formError}</FormError>
            {editing === "new" ? (
              <>
                <p className="rounded-xl bg-[#FBF7EE] px-3.5 py-2.5 text-xs text-[#555C4A]">
                  Add only reviews a real customer gave you, for example by phone or message.
                </p>
                <label className="block text-sm font-medium">
                  Product
                  <select value={form.product_id} onChange={(event) => setForm({ ...form, product_id: event.target.value })} className={inputClass}>
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <p className="text-sm text-[#777968]">Product: {editing.productName}</p>
            )}
            <label className="block text-sm font-medium">
              Customer name
              <input value={form.author_name} maxLength={120} onChange={(event) => setForm({ ...form, author_name: event.target.value })} className={inputClass} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Rating
                <select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} className={inputClass}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Status
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Status })} className={inputClass}>
                  {(["pending", "approved", "rejected"] as const).map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium">
              Title (optional)
              <input value={form.title} maxLength={160} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Review
              <textarea rows={5} value={form.body} maxLength={2000} onChange={(event) => setForm({ ...form, body: event.target.value })} className={inputClass} />
            </label>
            <div className="rounded-xl bg-[#FBF7EE] px-3.5 py-3">
              <Switch
                checked={form.show_on_home}
                label="Show on home page"
                onChange={() => setForm({ ...form, show_on_home: !form.show_on_home })}
              />
              <p className="mt-1.5 text-xs text-[#777968]">It appears there only while the status is Approved.</p>
            </div>
            <FormActions busy={busy} label="Save review" onCancel={() => setEditing(null)} />
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete review"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void run(() => adminRequest(`/api/admin/reviews/${deleting.id}`, "DELETE"), "Review deleted.").then(() => setDeleting(null))
          }
        >
          Delete the review by <strong>{deleting.author}</strong>? To only hide it from the store, reject it instead.
        </ConfirmDialog>
      )}
    </div>
  );
}
