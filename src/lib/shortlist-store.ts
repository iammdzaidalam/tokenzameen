import { readStore, writeStore } from "@/lib/storage";

export const MAX_COMPARE = 4;

const SAVED_KEY = "tz.shortlist.v1";
const COMPARE_KEY = "tz.compare.v1";
const VIEWED_KEY = "tz.viewed.v1";

export interface ShortlistState {
  ready: boolean;
  saved: string[];
  compare: string[];
  viewed: string[];
}

const SERVER_STATE: ShortlistState = { ready: false, saved: [], compare: [], viewed: [] };

let state: ShortlistState = SERVER_STATE;
const listeners = new Set<() => void>();

function sanitize(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.filter((v): v is string => typeof v === "string").slice(0, 64);
}

function hydrate() {
  if (state.ready) return;
  state = {
    ready: true,
    saved: sanitize(readStore<string[]>(SAVED_KEY, [])),
    compare: sanitize(readStore<string[]>(COMPARE_KEY, [])),
    viewed: sanitize(readStore<string[]>(VIEWED_KEY, [])),
  };
}

function commit(next: Omit<ShortlistState, "ready">) {
  state = { ready: true, ...next };
  writeStore(SAVED_KEY, state.saved);
  writeStore(COMPARE_KEY, state.compare);
  writeStore(VIEWED_KEY, state.viewed);
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  if (!state.ready) hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): ShortlistState {
  return state;
}

export function getServerSnapshot(): ShortlistState {
  return SERVER_STATE;
}

export function toggleSaved(slug: string) {
  const saved = state.saved.includes(slug)
    ? state.saved.filter((s) => s !== slug)
    : [slug, ...state.saved];
  commit({ saved, compare: state.compare, viewed: state.viewed });
}

/** Returns false when the comparison is already full, so the caller can explain why. */
export function toggleCompare(slug: string): boolean {
  if (state.compare.includes(slug)) {
    commit({ saved: state.saved, compare: state.compare.filter((s) => s !== slug), viewed: state.viewed });
    return true;
  }
  if (state.compare.length >= MAX_COMPARE) return false;
  commit({ saved: state.saved, compare: [...state.compare, slug], viewed: state.viewed });
  return true;
}

export function removeCompare(slug: string) {
  commit({ saved: state.saved, compare: state.compare.filter((s) => s !== slug), viewed: state.viewed });
}

export function clearCompare() {
  commit({ saved: state.saved, compare: [], viewed: state.viewed });
}

export function recordView(slug: string) {
  if (state.viewed[0] === slug) return;
  const viewed = [slug, ...state.viewed.filter((s) => s !== slug)].slice(0, 12);
  commit({ saved: state.saved, compare: state.compare, viewed });
}
