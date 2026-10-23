import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

// Fresh module + given storage per load, since the store keeps module-level memory.
async function loadStore(local = memoryStorage()) {
  vi.stubGlobal("window", { localStorage: local });
  vi.resetModules();
  const store = await import("../treatmentStore");
  return { store, local };
}

const T0 = Date.UTC(2026, 9, 23, 8, 0, 0);

describe("treatmentStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps a job in progress across a reload (e.g. after visiting another tool)", async () => {
    const { store, local } = await loadStore();
    store.updateTreatmentCase((c) => ({ ...c, pt: "trauma", startedAt: T0 }));
    store.updateTreatmentCase((c) => ({ ...c, checked: { ...c.checked, "sc-safe": { time: "08:00", note: "" } } }));
    store.updateTreatmentCase((c) => ({
      ...c,
      medSeq: c.medSeq + 1,
      meds: [...c.meds, { id: `med-${c.medSeq + 1}`, drug: "Fentanyl", dose: "50 mcg", route: "IV", time: "08:05" }],
    }));

    const reloaded = await loadStore(local);
    const job = reloaded.store.parseTreatmentCase(JSON.parse(local.getItem("treatment-log-case")!));
    expect(job.pt).toBe("trauma");
    expect(job.startedAt).toBe(T0);
    expect(Object.keys(job.checked)).toEqual(["sc-safe"]);
    expect(job.meds.map((m) => m.id)).toEqual(["med-1"]);
    expect(job.medSeq).toBe(1);
  });

  it("clears on New patient and restores everything on Undo", async () => {
    const { store, local } = await loadStore();
    store.updateTreatmentCase((c) => ({ ...c, pt: "paeds", startedAt: T0, checked: { a: { time: "08:00", note: "x" } } }));

    const snapshot = store.clearTreatmentCase();
    expect(store.parseTreatmentCase(JSON.parse(local.getItem("treatment-log-case")!))).toMatchObject({
      pt: "medical",
      startedAt: null,
      checked: {},
    });

    store.restoreTreatmentCase(snapshot);
    expect(store.parseTreatmentCase(JSON.parse(local.getItem("treatment-log-case")!))).toMatchObject({
      pt: "paeds",
      startedAt: T0,
      checked: { a: { time: "08:00", note: "x" } },
    });
  });

  it("discards a stale job and malformed entries", async () => {
    const { store } = await loadStore();
    const raw = {
      pt: "trauma",
      startedAt: T0,
      checked: { ok: { time: "08:00", note: "" }, bad: { time: 1 } },
      meds: [{ id: "med-1", drug: "X", dose: "1", route: "IV", time: "08:00" }, { id: 2 }],
      medSeq: 1,
      updatedAt: T0,
    };
    const fresh = store.parseTreatmentCase(raw, T0 + 1000);
    expect(Object.keys(fresh.checked)).toEqual(["ok"]);
    expect(fresh.meds).toHaveLength(1);

    expect(store.parseTreatmentCase(raw, T0 + store.CASE_TTL_MS + 1)).toEqual(store.EMPTY_TREATMENT_CASE);
  });
});
