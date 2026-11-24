"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const storefrontTables = [
  "products",
  "categories",
  "homepage_banners",
  "site_content",
  "store_settings",
  "reviews",
] as const;

export function StorefrontRealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel = supabase.channel("public-storefront-sync");

    for (const table of storefrontTables) {
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
