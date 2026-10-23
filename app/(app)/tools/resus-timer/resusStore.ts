"use client";

import { useSyncExternalStore } from "react";
import { createStore } from "@/lib/persistentStore";
import { formatTPlus } from "./timeUtils";

/**
 * Persistent state for the resuscitation timer.
 *
 * The clock is derived from wall-clock timestamps rather than counted ticks,
 * so a case survives navigating to another tool, a reload, the app being
 * backgrounded (timers throttled) or killed. Cycle boundaries and drug
 * reminders that fell due while the screen was away are caught up and logged
 * at the time they actually happened; after a long absence (a clock left
 * running) they are summarised in one entry instead of flooding the log.
 *
 * Stored in localStorage (not sessionStorage) so an installed PWA that the OS
 * kills mid-arrest still has the case. A case is never discarded
 * automatically — crews may reopen the app hours later to write the PCR —
 * only by Reset (confirmed, with Undo).
 */

export type Phase = "CPR" | "Pause";

export type LogEntry = {
  id: string;
  timeSinceStart: string; // "T+06:32"
  absoluteTime: string; // "14:22:05"
  message: string; // "Shock delivered", etc.
  /** "gap": a summary of time the screen was away — not a recorded event. */
  kind?: "gap";
};

export type ResusCase = {
  /** Wall-clock ms of the first Start; null before the case begins. */
  startedAt: number | null;
  /** Wall-clock ms when the current running segment began; null while paused. */
  runningSince: number | null;
  /** Running time banked from earlier segments (excludes paused time). */
  accumulatedMs: number;
  /** Elapsed second up to which cycle boundaries and reminders were processed. */
  processedElapsed: number;
  /** Elapsed second of the last adrenaline dose / repeat reminder. */
  lastAdrenalineAt: number | null;
  amiodaroneDose: 0 | 1 | 2;
  logs: LogEntry[];
  /** Wall-clock ms of the last user action (not clock ticks); drives the stale-case prompt. */
  lastActionAt: number;
  updatedAt: number;
};

/** Audio/haptic prompts raised while advancing the clock. */
export type Cue = { kind: "cprEndingSoon" | "cycleEnd" | "cycleStart" | "adrenalineSoon" | "adrenalineDue"; at: number };

export const CYCLE_SECONDS = 120; // 2-minute CPR cycles
export const PAUSE_SECONDS = 5; // rhythm-check gap between cycles
export const ADRENALINE_INTERVAL = 240; // every 4 minutes per CPG
/** Cues older than this (e.g. caught up after the screen was away) are not played. */
export const LIVE_CUE_SECONDS = 2;
/**
 * Missed cycle boundaries are logged one by one only for gaps up to this long
 * (e.g. a few minutes in a drug calculator). Longer gaps get a single summary
 * entry, so a forgotten running clock doesn't bury the real events.
 */
export const DETAILED_CATCH_UP_SECONDS = 10 * 60;
/**
 * A case with no user action for this long is treated as a previous patient:
 * opening the timer asks first, with "Start new case" as the default, so a new
 * arrest is never merged into an old log by tapping Start.
 */
export const STALE_CASE_MS = 60 * 60 * 1000;

const PERIOD = CYCLE_SECONDS + PAUSE_SECONDS;
const KEY = "resus-timer-case";

export const EMPTY_CASE: ResusCase = {
  startedAt: null,
  runningSince: null,
  accumulatedMs: 0,
  processedElapsed: 0,
  lastAdrenalineAt: null,
  amiodaroneDose: 0,
  logs: [],
  lastActionAt: 0,
  updatedAt: 0,
};

// ─── Pure clock logic ────────────────────────────────────────────────────────

export function elapsedSecondsAt(c: ResusCase, now: number): number {
  const runningMs = c.runningSince !== null ? Math.max(0, now - c.runningSince) : 0;
  return Math.floor((c.accumulatedMs + runningMs) / 1000);
}

export function cycleAt(elapsed: number): { cycleNumber: number; phase: Phase; secondsRemaining: number } {
  const cycleNumber = Math.floor(elapsed / PERIOD) + 1;
  const within = elapsed % PERIOD;
  return within < CYCLE_SECONDS
    ? { cycleNumber, phase: "CPR", secondsRemaining: CYCLE_SECONDS - within }
    : { cycleNumber, phase: "Pause", secondsRemaining: PERIOD - within };
}

function makeEntry(c: ResusCase, wallMs: number, message: string, kind?: LogEntry["kind"]): LogEntry {
  const offsetSeconds = c.startedAt !== null
    ? Math.floor((wallMs - c.startedAt) / 1000)
    : elapsedSecondsAt(c, wallMs);
  return {
    id: `${wallMs}-${Math.random().toString(16).slice(2)}`,
    timeSinceStart: formatTPlus(offsetSeconds),
    absoluteTime: new Date(wallMs).toLocaleTimeString(),
    message,
    ...(kind ? { kind } : {}),
  };
}

/** Wall-clock ms at which the running clock reached `elapsed` seconds. */
function wallAtElapsed(c: ResusCase, elapsed: number): number {
  return (c.runningSince ?? 0) + (elapsed * 1000 - c.accumulatedMs);
}

/**
 * Process every second between the last processed second and `now`: log
 * cycle boundaries and raise reminder cues exactly as a 1 s ticker would.
 * Returns the same object when nothing changed.
 */
export function advance(c: ResusCase, now: number): { next: ResusCase; cues: Cue[] } {
  const elapsed = elapsedSecondsAt(c, now);
  if (c.runningSince === null || elapsed <= c.processedElapsed) return { next: c, cues: [] };

  const gap = elapsed - c.processedElapsed;
  if (gap > DETAILED_CATCH_UP_SECONDS) {
    // Long absence: keep the clock and adrenaline schedule exact, but record
    // one summary line instead of a pair of entries per missed cycle.
    let lastAdr = c.lastAdrenalineAt;
    if (lastAdr !== null && elapsed - lastAdr >= ADRENALINE_INTERVAL) {
      lastAdr += Math.floor((elapsed - lastAdr) / ADRENALINE_INTERVAL) * ADRENALINE_INTERVAL;
    }
    const fromCycle = cycleAt(c.processedElapsed + 1).cycleNumber;
    const toCycle = cycleAt(elapsed).cycleNumber;
    const summary = makeEntry(
      c,
      now,
      `Timer ran ${Math.round(gap / 60)} min with the screen away — cycles ${fromCycle}–${toCycle} not logged individually`,
      "gap"
    );
    return {
      next: { ...c, processedElapsed: elapsed, lastAdrenalineAt: lastAdr, logs: [...c.logs, summary], updatedAt: now },
      cues: [],
    };
  }

  const cues: Cue[] = [];
  const newLogs: LogEntry[] = [];
  let lastAdr = c.lastAdrenalineAt;

  for (let s = c.processedElapsed + 1; s <= elapsed; s++) {
    const { cycleNumber, phase, secondsRemaining } = cycleAt(s);
    const within = s % PERIOD;
    if (phase === "CPR" && secondsRemaining === 5) cues.push({ kind: "cprEndingSoon", at: s });
    if (within === CYCLE_SECONDS) {
      cues.push({ kind: "cycleEnd", at: s });
      newLogs.push(makeEntry(c, wallAtElapsed(c, s), `Cycle ${cycleNumber} complete — rhythm check`));
    } else if (within === 0) {
      cues.push({ kind: "cycleStart", at: s });
      newLogs.push(makeEntry(c, wallAtElapsed(c, s), `Cycle ${cycleNumber} started (CPR)`));
    }

    if (lastAdr !== null) {
      const since = s - lastAdr;
      if (since === ADRENALINE_INTERVAL - 30) {
        cues.push({ kind: "adrenalineSoon", at: s });
      } else if (since === ADRENALINE_INTERVAL) {
        cues.push({ kind: "adrenalineDue", at: s });
        // Restart the countdown for the next repeating reminder
        lastAdr = s;
      }
    }
  }

  return {
    next: {
      ...c,
      processedElapsed: elapsed,
      lastAdrenalineAt: lastAdr,
      logs: newLogs.length ? [...c.logs, ...newLogs] : c.logs,
      updatedAt: now,
    },
    cues,
  };
}

/** True when a cue fell due within the last couple of seconds (not caught up from a gap). */
export function isLiveCue(cue: Cue, processedElapsed: number): boolean {
  return processedElapsed - cue.at <= LIVE_CUE_SECONDS;
}

/** Add a user-initiated event to the log (after catching the clock up). */
export function withLog(c: ResusCase, now: number, message: string, kind?: LogEntry["kind"]): ResusCase {
  return { ...c, logs: [...c.logs, makeEntry(c, now, message, kind)], lastActionAt: now, updatedAt: now };
}

/** True when an open case has had no user action for longer than STALE_CASE_MS. */
export function isStaleCase(c: ResusCase, now: number): boolean {
  return c.startedAt !== null && now - c.lastActionAt > STALE_CASE_MS;
}

export function startOrResume(c: ResusCase, now: number): ResusCase {
  if (c.runningSince !== null) return c;
  if (c.startedAt === null) {
    // Drug events logged before the first Start keep their state, as before.
    const started: ResusCase = { ...c, startedAt: now, runningSince: now, accumulatedMs: 0, processedElapsed: 0 };
    return withLog(started, now, "Timer started (Cycle 1, CPR)");
  }
  return withLog({ ...c, runningSince: now }, now, "Timer resumed");
}

export function pause(c: ResusCase, now: number): ResusCase {
  if (c.runningSince === null) return c;
  const paused: ResusCase = { ...c, accumulatedMs: c.accumulatedMs + Math.max(0, now - c.runningSince), runningSince: null };
  return withLog(paused, now, "Timer paused");
}

export function resetCase(now: number): ResusCase {
  return withLog({ ...EMPTY_CASE, updatedAt: now }, now, "Timer reset");
}

// ─── Persistence ─────────────────────────────────────────────────────────────

function isLogEntry(e: unknown): e is LogEntry {
  if (!e || typeof e !== "object") return false;
  const x = e as Record<string, unknown>;
  return typeof x.id === "string" && typeof x.timeSinceStart === "string" &&
    typeof x.absoluteTime === "string" && typeof x.message === "string" &&
    (x.kind === undefined || x.kind === "gap");
}

const numOrNull = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function parseCase(raw: unknown): ResusCase {
  if (!raw || typeof raw !== "object") return EMPTY_CASE;
  const x = raw as Record<string, unknown>;
  const updatedAt = numOrNull(x.updatedAt) ?? 0;
  const amio = x.amiodaroneDose;
  return {
    startedAt: numOrNull(x.startedAt),
    runningSince: numOrNull(x.runningSince),
    accumulatedMs: numOrNull(x.accumulatedMs) ?? 0,
    processedElapsed: numOrNull(x.processedElapsed) ?? 0,
    lastAdrenalineAt: numOrNull(x.lastAdrenalineAt),
    amiodaroneDose: amio === 1 || amio === 2 ? amio : 0,
    logs: Array.isArray(x.logs) ? x.logs.filter(isLogEntry) : [],
    // Cases stored before lastActionAt existed fall back to their last update.
    lastActionAt: numOrNull(x.lastActionAt) ?? updatedAt,
    updatedAt,
  };
}

export const resusStore = createStore(() => window.localStorage, KEY, EMPTY_CASE, parseCase);

export function useResusCase(): ResusCase {
  return useSyncExternalStore(resusStore.subscribe, resusStore.get, () => EMPTY_CASE);
}

/** Clear the case. Returns the case as it was (caught up to now) so it can be restored by Undo. */
export function clearResusCase(): ResusCase {
  const now = Date.now();
  const previous = advance(resusStore.get(), now).next;
  resusStore.set(resetCase(now));
  return previous;
}

/**
 * Replace the open case with a new one and start its clock. Returns the old
 * case (caught up to now) so a mistaken tap can be undone.
 */
export function startNewResusCase(): ResusCase {
  const now = Date.now();
  const previous = advance(resusStore.get(), now).next;
  resusStore.set(startOrResume({ ...EMPTY_CASE, updatedAt: now }, now));
  return previous;
}

/** Catch the clock up to now, then apply `fn`. Returns cues raised by the catch-up. */
export function updateResusCase(fn: (c: ResusCase, now: number) => ResusCase = (c) => c): Cue[] {
  const now = Date.now();
  const current = resusStore.get();
  const { next, cues } = advance(current, now);
  const updated = fn(next, now);
  if (updated !== current) resusStore.set(updated);
  return cues.filter((cue) => isLiveCue(cue, next.processedElapsed));
}
