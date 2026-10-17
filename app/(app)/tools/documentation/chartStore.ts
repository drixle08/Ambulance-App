"use client";

import { useSyncExternalStore } from "react";

/**
 * Persistence for the CHART documentation tool.
 *
 * - The working draft lives in sessionStorage: it survives navigating away,
 *   going back and reloads, and is cleared when the app/tab is closed.
 * - Saved charts live in localStorage on this device only and are deleted
 *   automatically after SAVED_CHART_TTL_MS, since they contain patient data.
 *
 * Module-level memory is the source of truth, so the tool keeps working even
 * when storage is unavailable (private browsing, blocked site data).
 */

export type DraftMap = Record<string, string>;

export type SavedChart = {
  id: string;
  savedAt: number;
  title: string;
  draft: DraftMap;
};

export const SAVED_CHART_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_SAVED_CHARTS = 20;
const DRAFT_KEY = "chart-documentation-draft";
const SAVED_KEY = "chart-documentation-saved";

type Store<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
};

function createStore<T>(
  storage: () => Storage,
  key: string,
  fallback: T,
  parse: (raw: unknown) => T
): Store<T> {
  const listeners = new Set<() => void>();
  let value = fallback;
  let loaded = false;

  function get(): T {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try {
        const raw = storage().getItem(key);
        if (raw) value = parse(JSON.parse(raw));
      } catch {
        /* storage unavailable or corrupt — keep fallback */
      }
    }
    return value;
  }

  function set(next: T) {
    value = next;
    loaded = true;
    try {
      storage().setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable — memory copy still works for this session */
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { get, set, subscribe };
}

function parseDraft(raw: unknown): DraftMap {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
}

function pruneExpired(charts: SavedChart[]): SavedChart[] {
  const cutoff = Date.now() - SAVED_CHART_TTL_MS;
  return charts.filter((chart) => chart.savedAt >= cutoff);
}

function parseSaved(raw: unknown): SavedChart[] {
  if (!Array.isArray(raw)) return [];
  const charts = raw.filter(
    (c): c is SavedChart =>
      c && typeof c.id === "string" && typeof c.savedAt === "number" && typeof c.title === "string"
  );
  return pruneExpired(charts.map((c) => ({ ...c, draft: parseDraft(c.draft) })));
}

const EMPTY_DRAFT: DraftMap = {};
const NO_CHARTS: SavedChart[] = [];

const draftStore = createStore(() => window.sessionStorage, DRAFT_KEY, EMPTY_DRAFT, parseDraft);
const savedStore = createStore(() => window.localStorage, SAVED_KEY, NO_CHARTS, parseSaved);

// ─── Draft ───────────────────────────────────────────────────────────────────

export function useChartDraft(): DraftMap {
  return useSyncExternalStore(draftStore.subscribe, draftStore.get, () => EMPTY_DRAFT);
}

export function updateDraftSection(id: string, text: string) {
  draftStore.set({ ...draftStore.get(), [id]: text });
}

export function replaceDraft(draft: DraftMap) {
  draftStore.set({ ...draft });
}

export function clearDraft() {
  draftStore.set({});
}

// ─── Saved charts ────────────────────────────────────────────────────────────

export function useSavedCharts(): SavedChart[] {
  return useSyncExternalStore(savedStore.subscribe, savedStore.get, () => NO_CHARTS);
}

export function saveChart(draft: DraftMap, title: string): SavedChart {
  const chart: SavedChart = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: Date.now(),
    title,
    draft: { ...draft },
  };
  savedStore.set([chart, ...pruneExpired(savedStore.get())].slice(0, MAX_SAVED_CHARTS));
  return chart;
}

export function deleteSavedChart(id: string) {
  savedStore.set(savedStore.get().filter((chart) => chart.id !== id));
}
