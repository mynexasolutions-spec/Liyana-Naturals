"use client";

import { useState } from "react";
import { Eye, Mail, Phone, Trash2 } from "lucide-react";
import {
  adminRequest,
  ConfirmDialog,
  dangerIconButton,
  EmptyState,
  Feedback,
  PageHeader,
  Pager,
  panel,
  StatGrid,
  Toolbar,
  useAdminAction,
  useRealtimeRefresh,
  useViewMode,
  DataTable,
  DataView,
  iconButton,
  Modal,
} from "@/components/admin/kit";
import { formatIndiaTime } from "@/lib/shiprocket/shared";

type Status = "new" | "in_progress" | "resolved" | "closed";

export type AdminInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: Status;
  createdAt: string;
};

const FILTERS = [
  ["all", "All"],
  ["new", "New"],
  ["in_progress", "In progress"],
  ["resolved", "Resolved"],
  ["closed", "Closed"],
] as const;
const LABEL: Record<Status, string> = { new: "New", in_progress: "In progress", resolved: "Resolved", closed: "Closed" };
const STYLE: Record<Status, string> = {
  new: "bg-amber-50 text-amber-800",
  in_progress: "bg-blue-50 text-blue-800",
  resolved: "bg-emerald-50 text-emerald-800",
  closed: "bg-[#EDEDE6] text-[#555C4A]",
};
const PER_PAGE = 10;

export function InquiryManager({ inquiries }: { inquiries: AdminInquiry[] }) {
  useRealtimeRefresh("admin-inquiries", ["inquiries"]);
  const [view, setView] = useViewMode("inquiries");
  const { run, busy, locked, error, notice } = useAdminAction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<AdminInquiry | null>(null);
  const [reading, setReading] = useState<AdminInquiry | null>(null);

  const needle = query.trim().toLowerCase();
  const matched = inquiries.filter(
    (inquiry) =>
      (filter === "all" || inquiry.status === filter) &&
      (!needle ||
        `${inquiry.name} ${inquiry.email} ${inquiry.phone ?? ""} ${inquiry.subject ?? ""} ${inquiry.message}`.toLowerCase().includes(needle)),
  );
  const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const count = (status: Status) => inquiries.filter((inquiry) => inquiry.status === status).length;

  const setStatus = (inquiry: AdminInquiry, status: Status) =>
    run(() => adminRequest(`/api/admin/inquiries/${inquiry.id}`, "PATCH", { status }), `Marked as ${LABEL[status].toLowerCase()}.`);

  const replyLink = (inquiry: AdminInquiry) =>
    `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(`Re: ${inquiry.subject || "Your message to Liyana Naturals"}`)}`;
  const contactButtons = (inquiry: AdminInquiry) => (
    <div className="flex flex-wrap gap-2">
      <a href={replyLink(inquiry)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#263D18] px-4 text-xs font-semibold text-white">
        <Mail className="size-3.5" /> Reply by email
      </a>
      {inquiry.phone && (
        <a href={`tel:${inquiry.phone.replace(/[^+\d]/g, "")}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#28321F]/15 px-4 text-xs font-semibold">
          <Phone className="size-3.5" /> Call
        </a>
      )}
    </div>
  );
  const statusSelect = (inquiry: AdminInquiry) => (
    <select
      aria-label={`Status of message from ${inquiry.name}`}
      value={inquiry.status}
      disabled={locked}
      onChange={(event) => void setStatus(inquiry, event.target.value as Status)}
      className="h-9 rounded-lg border border-[#28321F]/15 bg-white px-2 text-xs text-[#28321F]"
    >
      {(Object.keys(LABEL) as Status[]).map((status) => (
        <option key={status} value={status}>
          {LABEL[status]}
        </option>
      ))}
    </select>
  );
  const deleteButton = (inquiry: AdminInquiry) => (
    <button type="button" aria-label={`Delete message from ${inquiry.name}`} onClick={() => setDeleting(inquiry)} className={dangerIconButton}>
      <Trash2 className="size-4" />
    </button>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Inquiries" subtitle="Messages from the contact form" />
      <StatGrid
        items={[
          ["New", count("new")],
          ["In progress", count("in_progress")],
          ["Resolved", count("resolved")],
          ["All messages", inquiries.length],
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
        placeholder="Search name, email or message"
        view={view}
        onView={setView}
      />
      <Feedback error={error} notice={notice} />

      {visible.length === 0 ? (
        <EmptyState>{inquiries.length === 0 ? "No messages yet." : "No messages match."}</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                {
                  label: "From",
                  cell: (inquiry) => (
                    <>
                      <p className="font-medium text-[#263D18]">{inquiry.name}</p>
                      <p className="text-xs text-[#777968]">{inquiry.email}</p>
                      {inquiry.phone && <p className="text-xs text-[#777968]">{inquiry.phone}</p>}
                    </>
                  ),
                },
                {
                  label: "Message",
                  cell: (inquiry) => (
                    <button type="button" onClick={() => setReading(inquiry)} className="block max-w-xs text-left">
                      <span className="block truncate font-medium">{inquiry.subject || "No subject"}</span>
                      <span className="line-clamp-2 break-words text-xs text-[#555C4A]">{inquiry.message}</span>
                    </button>
                  ),
                },
                { label: "Received", cell: (inquiry) => <span className="text-xs">{formatIndiaTime(inquiry.createdAt)}</span> },
                { label: "Status", cell: statusSelect },
                {
                  label: "Actions",
                  align: "right",
                  cell: (inquiry) => (
                    <div className="flex justify-end gap-1">
                      <button type="button" aria-label={`Read message from ${inquiry.name}`} onClick={() => setReading(inquiry)} className={iconButton}>
                        <Eye className="size-4" />
                      </button>
                      <a href={replyLink(inquiry)} aria-label={`Reply to ${inquiry.name}`} className={iconButton}>
                        <Mail className="size-4" />
                      </a>
                      {deleteButton(inquiry)}
                    </div>
                  ),
                },
              ]}
            />
          }
          grid={
            <ul className="grid gap-3 xl:grid-cols-2">
              {visible.map((inquiry) => (
                <li key={inquiry.id} className={`${panel} flex min-w-0 flex-col gap-3 p-4`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="break-words font-serif text-lg text-[#263D18]">{inquiry.subject || "No subject"}</h2>
                      <p className="break-all text-xs text-[#777968]">
                        <strong className="text-[#28321F]">{inquiry.name}</strong> · {inquiry.email}
                        {inquiry.phone ? ` · ${inquiry.phone}` : ""} · {formatIndiaTime(inquiry.createdAt)}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLE[inquiry.status]}`}>{LABEL[inquiry.status]}</span>
                  </div>
                  <p className="whitespace-pre-line break-words rounded-xl bg-[#FBF7EE]/80 px-4 py-3 text-sm text-[#28321F]">{inquiry.message}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    {contactButtons(inquiry)}
                    <div className="flex items-center gap-2">
                      {statusSelect(inquiry)}
                      {deleteButton(inquiry)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          }
        />
      )}
      <Pager page={current} pages={pages} onPage={setPage} />

      {reading && (
        <Modal title={reading.subject || "No subject"} onClose={() => setReading(null)}>
          <div className="space-y-4">
            <p className="break-all text-sm text-[#777968]">
              <strong className="text-[#28321F]">{reading.name}</strong> · {reading.email}
              {reading.phone ? ` · ${reading.phone}` : ""} · {formatIndiaTime(reading.createdAt)}
            </p>
            <p className="whitespace-pre-line break-words rounded-xl bg-[#FBF7EE]/80 px-4 py-3 text-sm text-[#28321F]">{reading.message}</p>
            {contactButtons(reading)}
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete message"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void run(() => adminRequest(`/api/admin/inquiries/${deleting.id}`, "DELETE"), "Message deleted.").then(() => setDeleting(null))
          }
        >
          Delete the message from <strong>{deleting.name}</strong>? This cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  );
}
