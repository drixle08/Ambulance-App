import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADRENALINE_INTERVAL,
  DETAILED_CATCH_UP_SECONDS,
  EMPTY_CASE,
  STALE_CASE_MS,
  advance,
  cycleAt,
  isLiveCue,
  isStaleCase,
  parseCase,
  pause,
  startOrResume,
  withLog,
  type ResusCase,
} from "../resusStore";

const T0 = Date.UTC(2026, 9, 23, 8, 0, 0);
const sec = (s: number) => T0 + s * 1000;

function started(): ResusCase {
  return startOrResume(EMPTY_CASE, T0);
}

describe("cycleAt", () => {
  it("matches the original 1 s ticker: 120 s CPR, 5 s rhythm check, repeat", () => {
    expect(cycleAt(0)).toEqual({ cycleNumber: 1, phase: "CPR", secondsRemaining: 120 });
    expect(cycleAt(119)).toEqual({ cycleNumber: 1, phase: "CPR", secondsRemaining: 1 });
    expect(cycleAt(120)).toEqual({ cycleNumber: 1, phase: "Pause", secondsRemaining: 5 });
    expect(cycleAt(124)).toEqual({ cycleNumber: 1, phase: "Pause", secondsRemaining: 1 });
    expect(cycleAt(125)).toEqual({ cycleNumber: 2, phase: "CPR", secondsRemaining: 120 });
  });
});

describe("advance", () => {
  it("keeps time from timestamps and back-fills cycle logs missed while the screen was away", () => {
    const c = started();
    // Screen away for 5 min: no ticks at all, then one catch-up.
    const { next, cues } = advance(c, sec(300));
    expect(next.processedElapsed).toBe(300);
    expect(cycleAt(next.processedElapsed)).toMatchObject({ cycleNumber: 3, phase: "CPR" });
    const messages = next.logs.map((l) => `${l.timeSinceStart} ${l.message}`);
    expect(messages).toEqual([
      "T+00:00 Timer started (Cycle 1, CPR)",
      "T+02:00 Cycle 1 complete — rhythm check",
      "T+02:05 Cycle 2 started (CPR)",
      "T+04:05 Cycle 2 complete — rhythm check",
      "T+04:10 Cycle 3 started (CPR)",
    ]);
    // Caught-up cues are not replayed as audio.
    expect(cues.filter((cue) => isLiveCue(cue, next.processedElapsed))).toEqual([]);
  });

  it("raises live cues on a normal 1 s tick", () => {
    const c = advance(started(), sec(114)).next;
    const { next, cues } = advance(c, sec(115));
    expect(cues).toEqual([{ kind: "cprEndingSoon", at: 115 }]);
    expect(isLiveCue(cues[0], next.processedElapsed)).toBe(true);
  });

  it("returns the same object when no new second has elapsed", () => {
    const c = advance(started(), sec(10)).next;
    expect(advance(c, sec(10.6)).next).toBe(c);
  });

  it("excludes paused time and logs cycles at their real wall-clock time after resuming", () => {
    let c = advance(started(), sec(60)).next;
    c = pause(c, sec(60));
    expect(advance(c, sec(600)).next).toBe(c); // paused: clock frozen
    c = startOrResume(c, sec(600));
    const { next } = advance(c, sec(661));
    expect(next.processedElapsed).toBe(121);
    const cycleEnd = next.logs.find((l) => l.message.startsWith("Cycle 1 complete"));
    // 60 s run + 540 s paused + 60 s run = T+11:00 since the case started
    expect(cycleEnd?.timeSinceStart).toBe("T+11:00");
  });

  it("repeats the adrenaline reminder every 4 minutes after a dose", () => {
    let c = advance(started(), sec(30)).next;
    c = withLog({ ...c, lastAdrenalineAt: c.processedElapsed }, sec(30), "Adrenaline 1mg IV given");
    const { next, cues } = advance(c, sec(30 + 480));
    expect(cues.filter((q) => q.kind.startsWith("adrenaline")).map((q) => `${q.kind}@${q.at}`)).toEqual([
      "adrenalineSoon@240",
      "adrenalineDue@270",
      "adrenalineSoon@480",
      "adrenalineDue@510",
    ]);
    expect(next.lastAdrenalineAt).toBe(510);
  });

  it("summarises a long absence in one entry instead of logging every missed cycle", () => {
    let c = advance(started(), sec(30)).next;
    c = withLog({ ...c, lastAdrenalineAt: 30 }, sec(30), "Adrenaline 1mg IV given");
    // Clock left running, app reopened 3 h later to write the PCR.
    const { next, cues } = advance(c, sec(3 * 3600));
    expect(next.processedElapsed).toBe(3 * 3600);
    expect(next.logs).toHaveLength(c.logs.length + 1);
    expect(next.logs.at(-1)?.message).toBe(
      "Timer ran 180 min with the screen away — cycles 1–87 not logged individually"
    );
    expect(cues).toEqual([]);
    // Adrenaline schedule stays on its 4-minute grid from the dose at 30 s.
    expect((next.lastAdrenalineAt! - 30) % ADRENALINE_INTERVAL).toBe(0);
    expect(3 * 3600 - next.lastAdrenalineAt!).toBeLessThan(ADRENALINE_INTERVAL);
  });

  it("tags the long-gap summary as a gap, not a recorded event", () => {
    const { next } = advance(started(), sec(3600));
    expect(next.logs.at(-1)?.kind).toBe("gap");
    expect(next.logs.filter((l) => l.kind !== "gap").map((l) => l.message)).toEqual([
      "Timer started (Cycle 1, CPR)",
    ]);
  });

  it("still logs each cycle for a gap up to the detailed catch-up limit", () => {
    const { next } = advance(started(), sec(DETAILED_CATCH_UP_SECONDS));
    // 600 s: cycles 1–4 complete (120, 245, 370, 495) and 2–5 start (125, 250, 375, 500)
    expect(next.logs.filter((l) => l.message.startsWith("Cycle")).length).toBe(8);
  });
});

describe("stale case", () => {
  it("measures idle time from user actions, not clock ticks", () => {
    let c = started();
    expect(c.lastActionAt).toBe(T0);
    c = advance(c, sec(5400)).next; // clock ran 90 min, nobody touched it
    expect(c.lastActionAt).toBe(T0);
    expect(isStaleCase(c, sec(5400))).toBe(true);
    c = withLog(c, sec(5400), "Shock delivered");
    expect(isStaleCase(c, sec(5401))).toBe(false);
  });

  it("is never stale before a case has started, or within the hour", () => {
    expect(isStaleCase(EMPTY_CASE, sec(10 * 3600))).toBe(false);
    expect(isStaleCase(started(), T0 + STALE_CASE_MS)).toBe(false);
    expect(isStaleCase(started(), T0 + STALE_CASE_MS + 1)).toBe(true);
  });
});

describe("parseCase", () => {
  it("restores a stored case and drops malformed log entries", () => {
    const c = advance(started(), sec(130)).next;
    const raw = JSON.parse(JSON.stringify({ ...c, logs: [...c.logs, { bogus: true }] }));
    const parsed = parseCase(raw);
    expect(parsed.logs).toEqual(c.logs);
    expect(parsed.runningSince).toBe(T0);
  });

  it("loads cases stored before lastActionAt existed, using their last update", () => {
    const c = advance(started(), sec(30)).next;
    const legacy = JSON.parse(JSON.stringify(c));
    delete legacy.lastActionAt;
    expect(parseCase(legacy).lastActionAt).toBe(c.updatedAt);
  });

  it("never discards a stored case on its own, however old", () => {
    const c = pause(advance(started(), sec(600)).next, sec(600));
    vi.useFakeTimers();
    vi.setSystemTime(T0 + 30 * 24 * 3600 * 1000);
    try {
      expect(parseCase(JSON.parse(JSON.stringify(c)))).toEqual(c);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("resusStore persistence", () => {
  function memoryStorage(): Storage {
    const data = new Map<string, string>();
    return {
      get length() {
        return data.size;
      },
      clear: () => data.clear(),
      getItem: (key) => data.get(key) ?? null,
      key: (i) => [...data.keys()][i] ?? null,
      removeItem: (key) => void data.delete(key),
      setItem: (key, value) => void data.set(key, String(value)),
    };
  }

  async function loadStore(local: Storage) {
    vi.stubGlobal("window", { localStorage: local });
    vi.resetModules();
    return import("../resusStore");
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("survives a reload with the clock still running in real time", async () => {
    const local = memoryStorage();
    const first = await loadStore(local);
    first.updateResusCase(first.startOrResume);
    vi.setSystemTime(sec(5));
    first.updateResusCase((c, now) => first.withLog(c, now, "Shock delivered"));

    vi.setSystemTime(sec(200));
    const reloaded = await loadStore(local);
    reloaded.updateResusCase();
    const c = reloaded.resusStore.get();
    expect(c.processedElapsed).toBe(200);
    expect(c.logs.map((l) => l.message)).toContain("Shock delivered");
    expect(c.logs.map((l) => l.message)).toContain("Cycle 2 started (CPR)");
  });

  it("starts a new case in one step and returns the old case for Undo", async () => {
    const store = await loadStore(memoryStorage());
    store.updateResusCase(store.startOrResume);
    vi.setSystemTime(sec(20));
    store.updateResusCase((c, now) => store.withLog(c, now, "Shock delivered"));

    vi.setSystemTime(sec(2 * 3600));
    const previous = store.startNewResusCase();
    expect(previous.logs.map((l) => l.message)).toContain("Shock delivered");
    const fresh = store.resusStore.get();
    expect(fresh.startedAt).toBe(sec(2 * 3600));
    expect(fresh.runningSince).toBe(sec(2 * 3600));
    expect(fresh.logs.map((l) => l.message)).toEqual(["Timer started (Cycle 1, CPR)"]);
  });

  it("clears on reset and can be restored from the returned snapshot", async () => {
    const store = await loadStore(memoryStorage());
    store.updateResusCase(store.startOrResume);
    vi.setSystemTime(sec(42));
    store.updateResusCase((c, now) => store.withLog(c, now, "Shock delivered"));

    const snapshot = store.clearResusCase();
    expect(store.resusStore.get().logs.map((l) => l.message)).toEqual(["Timer reset"]);
    expect(store.resusStore.get().runningSince).toBeNull();

    vi.setSystemTime(sec(45));
    store.updateResusCase((_c, now) => store.withLog(store.advance(snapshot, now).next, now, "Reset undone"));
    const restored = store.resusStore.get();
    expect(restored.processedElapsed).toBe(45);
    expect(restored.runningSince).toBe(T0);
    expect(restored.logs.map((l) => l.message)).toEqual([
      "Timer started (Cycle 1, CPR)",
      "Shock delivered",
      "Reset undone",
    ]);
  });
});
