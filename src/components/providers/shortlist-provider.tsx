"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readStore, writeStore } from "@/lib/hooks";

const SAVED_KEY = "tz.shortlist.v1";
const COMPARE_KEY = "tz.compare.v1";
const VIEWED_KEY = "tz.viewed.v1";

export const MAX_COMPARE = 4;

interface ShortlistValue {
  ready: boolean;
  saved: string[];
  compare: string[];
  viewed: string[];
  isSaved: (slug: string) => boolean;
  toggleSaved: (slug: string) => void;
  isComparing: (slug: string) => boolean;
  toggleCompare: (slug: string) => boolean;
  clearCompare: () => void;
  removeCompare: (slug: string) => void;
  recordView: (slug: string) => void;
}

const ShortlistContext = createContext<ShortlistValue | null>(null);

function sanitize(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.filter((v): v is string => typeof v === "string").slice(0, 64);
}

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [viewed, setViewed] = useState<string[]>([]);

  useEffect(() => {
    setSaved(sanitize(readStore<string[]>(SAVED_KEY, [])));
    setCompare(sanitize(readStore<string[]>(COMPARE_KEY, [])));
    setViewed(sanitize(readStore<string[]>(VIEWED_KEY, [])));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStore(SAVED_KEY, saved);
  }, [ready, saved]);

  useEffect(() => {
    if (ready) writeStore(COMPARE_KEY, compare);
  }, [ready, compare]);

  useEffect(() => {
    if (ready) writeStore(VIEWED_KEY, viewed);
  }, [ready, viewed]);

  const toggleSaved = useCallback((slug: string) => {
    setSaved((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current],
    );
  }, []);

  const toggleCompare = useCallback((slug: string) => {
    let accepted = true;
    setCompare((current) => {
      if (current.includes(slug)) return current.filter((s) => s !== slug);
      if (current.length >= MAX_COMPARE) {
        accepted = false;
        return current;
      }
      return [...current, slug];
    });
    return accepted;
  }, []);

  const recordView = useCallback((slug: string) => {
    setViewed((current) => [slug, ...current.filter((s) => s !== slug)].slice(0, 12));
  }, []);

  const value = useMemo<ShortlistValue>(
    () => ({
      ready,
      saved,
      compare,
      viewed,
      isSaved: (slug) => saved.includes(slug),
      toggleSaved,
      isComparing: (slug) => compare.includes(slug),
      toggleCompare,
      clearCompare: () => setCompare([]),
      removeCompare: (slug) => setCompare((current) => current.filter((s) => s !== slug)),
      recordView,
    }),
    [ready, saved, compare, viewed, toggleSaved, toggleCompare, recordView],
  );

  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist(): ShortlistValue {
  const context = useContext(ShortlistContext);
  if (!context) throw new Error("useShortlist must be used inside ShortlistProvider");
  return context;
}
