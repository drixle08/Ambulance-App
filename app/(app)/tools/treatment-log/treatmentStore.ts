"use client";

import { useSyncExternalStore } from "react";
import { createStore } from "@/lib/persistentStore";

/**
 * Persistent state for the Treatment Log, so a job in progress survives
 * switching to another tool (e.g. the Resus Timer or a drug calculator),
 * a reload, or the OS killing the installed app.
 *
 * Stored in localStorage on this device only. Entries can include free-text
 * notes, so a log untouched for CASE_TTL_MS is discarded on load.
 */

export type PatientType = "medical" | "trauma" | "paeds" | "obstetric" | "newborn";

export interface MedEntry {
  id: string;
  drug: string;
  dose: string;
  route: string;
  time: string;
}

export type CheckedMap = Record<string, { time: string; note: string }>;

export type TreatmentCase = {
  pt: PatientType;
  /** Wall-clock ms of the first logged intervention; null before the job starts. */
  startedAt: number | null;
  checked: CheckedMap;
  meds: MedEntry[];
  /** Last medication id issued, so ids stay unique across reloads. */
  medSeq: number;
  updatedAt: number;
};

export const CASE_TTL_MS = 12 * 60 * 60 * 1000;
const KEY = "treatment-log-case";
const PATIENT_TYPES: PatientType[] = ["medical", "trauma", "paeds", "obstetric", "newborn"];

export const EMPTY_TREATMENT_CASE: TreatmentCase = {
  pt: "medical",
  startedAt: null,
  checked: {},
  meds: [],
  medSeq: 0,
  updatedAt: 0,
};

function parseChecked(raw: unknown): CheckedMap {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).filter(
      (entry): entry is [string, { time: string; note: string }] => {
        const v = entry[1] as Record<string, unknown> | null;
        return !!v && typeof v.time === "string" && typeof v.note === "string";
      }
    )
  );
}

function isMedEntry(m: unknown): m is MedEntry {
  if (!m || typeof m !== "object") return false;
  const x = m as Record<string, unknown>;
  return ["id", "drug", "dose", "route", "time"].every((k) => typeof x[k] === "string");
}

export function parseTreatmentCase(raw: unknown, now = Date.now()): TreatmentCase {
  if (!raw || typeof raw !== "object") return EMPTY_TREATMENT_CASE;
  const x = raw as Record<string, unknown>;
  const updatedAt = typeof x.updatedAt === "number" ? x.updatedAt : 0;
  if (now - updatedAt > CASE_TTL_MS) return EMPTY_TREATMENT_CASE;
  return {
    pt: PATIENT_TYPES.includes(x.pt as PatientType) ? (x.pt as PatientType) : "medical",
    startedAt: typeof x.startedAt === "number" ? x.startedAt : null,
    checked: parseChecked(x.checked),
    meds: Array.isArray(x.meds) ? x.meds.filter(isMedEntry) : [],
    medSeq: typeof x.medSeq === "number" ? x.medSeq : 0,
    updatedAt,
  };
}

const store = createStore(() => window.localStorage, KEY, EMPTY_TREATMENT_CASE, (raw) => parseTreatmentCase(raw));

export function useTreatmentCase(): TreatmentCase {
  return useSyncExternalStore(store.subscribe, store.get, () => EMPTY_TREATMENT_CASE);
}

export function updateTreatmentCase(fn: (c: TreatmentCase) => TreatmentCase) {
  const current = store.get();
  const next = fn(current);
  if (next !== current) store.set({ ...next, updatedAt: Date.now() });
}

/** Clear the log. Returns the log as it was so it can be restored by Undo. */
export function clearTreatmentCase(): TreatmentCase {
  const previous = store.get();
  store.set({ ...EMPTY_TREATMENT_CASE, updatedAt: Date.now() });
  return previous;
}

export function restoreTreatmentCase(snapshot: TreatmentCase) {
  store.set({ ...snapshot, updatedAt: Date.now() });
}
