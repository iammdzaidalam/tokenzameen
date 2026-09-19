"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Fires one `page-view` per route change. Mount once in the root layout. The
 * query string is read from `window` inside the effect so this never needs a
 * Suspense boundary of its own.
 */
export function PageView() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    const path = `${pathname}${window.location.search}`;
    if (last.current === path) return;
    last.current = path;
    trackPageView(path, document.referrer || null);
  }, [pathname]);

  return null;
}
