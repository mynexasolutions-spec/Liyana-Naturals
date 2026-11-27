"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import {
  adminRequest,
  ConfirmDialog,
  dangerIconButton,
  DataTable,
  DataView,
  EmptyState,
  Feedback,
  PageHeader,
  Pager,
  panel,
  secondaryButton,
  StatGrid,
  Toolbar,
  useAdminAction,
  useRealtimeRefresh,
  useViewMode,
} from "@/components/admin/kit";
import { downloadCsv } from "@/lib/admin/csv";
import { SUBSCRIBE_SOURCES, type SubscribeSource } from "@/lib/newsletter/schema";
import { formatIndiaTime } from "@/lib/shiprocket/shared";

export type Subscriber = {
  id: string;
  email: string;
  source: SubscribeSource;
  created_at: string;
};

const FILTERS = [
  ["all", "All"],
  ["home", "Home page"],
  ["shop", "Shop page"],
  ["contact", "Contact page"],
] as const;
const PER_PAGE = 20;
const indiaDay = (time: number | string) => new Date(time).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export function SubscriberManager({ subscribers }: { subscribers: Subscriber[] }) {
  useRealtimeRefresh("admin-subscribers", ["newsletter_subscribers"]);
  const [view, setView] = useViewMode("subscribers");
  const { run, busy, error, notice } = useAdminAction();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Subscriber | null>(null);

  const needle = query.trim().toLowerCase();
  const matched = subscribers.filter(
    (item) => (filter === "all" || item.source === filter) && (!needle || item.email.includes(needle)),
  );
  const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const today = indiaDay(Date.now());
  const monthStart = indiaDay(Date.now() - 29 * 86_400_000);

  const exportList = () =>
    downloadCsv(`subscribers-${today}.csv`, [
      ["Email", "Subscribed from", "Date"],
      ...matched.map((item) => [item.email, SUBSCRIBE_SOURCES[item.source], formatIndiaTime(item.created_at)]),
    ]);

  const email = (item: Subscriber) => (
    <a href={`mailto:${item.email}`} className="break-all font-medium text-[#263D18] hover:underline">
      {item.email}
    </a>
  );
  const sourceBadge = (item: Subscriber) => (
    <span className="whitespace-nowrap rounded-full bg-[#EAF1DF] px-2.5 py-1 text-xs font-medium text-[#263D18]">
      {SUBSCRIBE_SOURCES[item.source]}
    </span>
  );
  const remove = (item: Subscriber) => (
    <button type="button" aria-label={`Delete ${item.email}`} onClick={() => setDeleting(item)} className={`${dangerIconButton} ml-auto`}>
      <Trash2 className="size-4" />
    </button>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Subscribers" />
      <StatGrid
        items={[
          ["Subscribers", subscribers.length],
          ["Today", subscribers.filter((item) => indiaDay(item.created_at) === today).length],
          ["Last 30 days", subscribers.filter((item) => indiaDay(item.created_at) >= monthStart).length],
          ["From contact page", subscribers.filter((item) => item.source === "contact").length],
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
        placeholder="Search email"
        view={view}
        onView={setView}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#777968]">
          {matched.length} email{matched.length === 1 ? "" : "s"}
        </span>
        <button type="button" disabled={matched.length === 0} onClick={exportList} className={secondaryButton}>
          <Download className="size-4" /> Export CSV
        </button>
      </div>
      <Feedback error={error} notice={notice} />

      {visible.length === 0 ? (
        <EmptyState>{subscribers.length === 0 ? "No subscribers yet." : "No subscribers match."}</EmptyState>
      ) : (
        <DataView
          view={view}
          table={
            <DataTable
              rows={visible}
              columns={[
                { label: "Email", cell: email },
                { label: "Subscribed from", cell: sourceBadge },
                { label: "Date", cell: (item) => <span className="whitespace-nowrap text-xs text-[#555C4A]">{formatIndiaTime(item.created_at)}</span> },
                { label: "Actions", align: "right", cell: remove },
              ]}
            />
          }
          grid={
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => (
                <li key={item.id} className={`${panel} flex min-w-0 flex-col gap-3 p-4`}>
                  <div className="min-w-0">
                    {email(item)}
                    <p className="mt-1 text-xs text-[#777968]">{formatIndiaTime(item.created_at)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#28321F]/8 pt-3">
                    {sourceBadge(item)}
                    {remove(item)}
                  </div>
                </li>
              ))}
            </ul>
          }
        />
      )}
      <Pager page={current} pages={pages} onPage={setPage} />

      {deleting && (
        <ConfirmDialog
          title="Delete subscriber"
          busy={busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void run(() => adminRequest(`/api/admin/subscribers/${deleting.id}`, "DELETE"), "Subscriber deleted.").then(() =>
              setDeleting(null),
            )
          }
        >
          Delete <strong className="break-all">{deleting.email}</strong> from the list? This cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  );
}
