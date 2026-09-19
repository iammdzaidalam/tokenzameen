"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps a fast local draft for a control whose committed value lives in the URL.
 * The draft follows the committed value when it changes elsewhere (back/forward,
 * a removed chip) and pushes its own changes only after the user settles.
 */
export function useDebouncedMirror<T>(
  value: T,
  commit: (next: T) => void,
  delay: number,
  equals: (a: T, b: T) => boolean,
) {
  const [draft, setDraft] = useState<T>(value);
  const syncedRef = useRef<T>(value);

  useEffect(() => {
    if (equals(value, syncedRef.current)) return;
    syncedRef.current = value;
    setDraft(value);
  }, [value, equals]);

  useEffect(() => {
    if (equals(draft, syncedRef.current)) return;
    const timer = window.setTimeout(() => {
      syncedRef.current = draft;
      commit(draft);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [draft, commit, delay, equals]);

  return [draft, setDraft] as const;
}

export function sameString(a: string, b: string): boolean {
  return a === b;
}

export function sameRange(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}
