"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  MAX_COMPARE,
  clearCompare,
  getServerSnapshot,
  getSnapshot,
  recordView,
  removeCompare,
  subscribe,
  toggleCompare,
  toggleSaved,
} from "@/lib/shortlist-store";

export { MAX_COMPARE };

/**
 * Retained so the root layout keeps a single obvious mount point for the
 * shortlist. State itself lives in an external store, so any component can call
 * useShortlist without a provider above it.
 */
export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function useShortlist() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isSaved = useCallback((slug: string) => state.saved.includes(slug), [state.saved]);
  const isComparing = useCallback((slug: string) => state.compare.includes(slug), [state.compare]);

  return useMemo(
    () => ({
      ready: state.ready,
      saved: state.saved,
      compare: state.compare,
      viewed: state.viewed,
      isSaved,
      isComparing,
      toggleSaved,
      toggleCompare,
      removeCompare,
      clearCompare,
      recordView,
    }),
    [state, isSaved, isComparing],
  );
}
