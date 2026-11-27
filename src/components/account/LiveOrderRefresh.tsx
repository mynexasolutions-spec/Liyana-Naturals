"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 20_000;

// Refreshes the order page when the courier or the admin changes the order.
export function LiveOrderRefresh({ orderId, initialSnapshot }: { orderId: string; initialSnapshot: string }) {
  const router = useRouter();
  const lastSnapshot = useRef(initialSnapshot);

  useEffect(() => {
    lastSnapshot.current = initialSnapshot;
  }, [initialSnapshot]);

  useEffect(() => {
    let stopped = false;

    async function check() {
      if (document.hidden || stopped) return;
      try {
        const response = await fetch(`/api/account/orders/${orderId}/tracking`, { cache: "no-store" });
        if (!response.ok) return;
        const { snapshot } = (await response.json()) as { snapshot?: string };
        if (!stopped && snapshot && snapshot !== lastSnapshot.current) {
          lastSnapshot.current = snapshot;
          router.refresh();
        }
      } catch {
        // Network problem: try again on the next tick.
      }
    }

    const timer = window.setInterval(check, POLL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [orderId, router]);

  return null;
}
