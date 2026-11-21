"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/PageLoader";
import { cn } from "@/lib/utils";

type TransitionPhase = "idle" | "entering" | "active" | "exiting";

const MIN_LOADER_DURATION_MS = 1000;
const FADE_DURATION_MS = 300;
const SAFETY_TIMEOUT_MS = 4500;

interface RouteObserverProps {
  onRouteSettled: (routeKey: string) => void;
  committedRouteRef: React.MutableRefObject<string>;
}

function RouteObserver({
  onRouteSettled,
  committedRouteRef,
}: RouteObserverProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const routeKey = search ? `${pathname}?${search}` : pathname;
  const lastRouteRef = useRef<string>(routeKey);

  useEffect(() => {
    committedRouteRef.current = routeKey;
    if (routeKey !== lastRouteRef.current) {
      lastRouteRef.current = routeKey;
      onRouteSettled(routeKey);
    }
  }, [routeKey, onRouteSettled, committedRouteRef]);

  return null;
}

export function PageTransitionShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<TransitionPhase>("idle");

  const phaseRef = useRef<TransitionPhase>("idle");
  const committedRouteRef = useRef<string>("");
  const minUntilRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePhase = useCallback((next: TransitionPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearAllTimers = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const finishTransition = useCallback(() => {
    if (phaseRef.current === "idle" || phaseRef.current === "exiting") return;

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }

    const remaining = Math.max(0, minUntilRef.current - performance.now());

    finishTimerRef.current = setTimeout(() => {
      updatePhase("exiting");
      fadeTimerRef.current = setTimeout(() => {
        updatePhase("idle");
      }, FADE_DURATION_MS);
    }, remaining);
  }, [updatePhase]);

  const startTransition = useCallback(
    (scrollToTop: boolean) => {
      clearAllTimers();
      minUntilRef.current = performance.now() + MIN_LOADER_DURATION_MS;

      if (scrollToTop && typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }

      updatePhase("entering");

      rafRef.current = requestAnimationFrame(() => {
        if (phaseRef.current === "entering") {
          updatePhase("active");
        }
      });

      safetyTimerRef.current = setTimeout(() => {
        finishTransition();
      }, SAFETY_TIMEOUT_MS);
    },
    [clearAllTimers, finishTransition, updatePhase]
  );

  // Intercept internal link navigations (Next.js <Link> and internal <a>)
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      if (
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;

      let targetUrl: URL;
      try {
        targetUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (
        targetUrl.origin !== window.location.origin ||
        (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:")
      ) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const isSameRoute =
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search;

      if (isSameRoute) return;

      startTransition(true);
    };

    const handlePopState = () => {
      const nextSearch = window.location.search.replace(/^\?/, "");
      const nextRouteKey = nextSearch
        ? `${window.location.pathname}?${nextSearch}`
        : window.location.pathname;
      if (
        committedRouteRef.current &&
        nextRouteKey === committedRouteRef.current
      ) {
        return;
      }
      startTransition(false);
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
      clearAllTimers();
    };
  }, [clearAllTimers, startTransition]);

  const isLocked = phase === "entering" || phase === "active";
  const isLoaderMounted = phase !== "idle";
  const isLoaderVisible = phase === "active";

  return (
    <div
      className={cn(
        "relative flex-1 flex flex-col",
        isLocked && "h-[calc(100dvh-118px)] overflow-hidden"
      )}
    >
      <Suspense fallback={null}>
        <RouteObserver
          onRouteSettled={finishTransition}
          committedRouteRef={committedRouteRef}
        />
      </Suspense>

      {/* Route Content */}
      <div
        aria-hidden={isLocked}
        className={cn(
          "flex-1 transition-opacity duration-300 ease-out",
          isLocked ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {children}
      </div>

      {/* Centered Content-Area Loader */}
      {isLoaderMounted && <PageLoader isVisible={isLoaderVisible} />}
    </div>
  );
}
