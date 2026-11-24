"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const dashboardTables = [
  "products",
  "categories",
  "orders",
  "customers",
  "reviews",
  "inquiries",
] as const;

export function AdminDashboardRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel = supabase.channel("admin-dashboard-realtime");
    for (const table of dashboardTables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => router.refresh(),
      );
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
