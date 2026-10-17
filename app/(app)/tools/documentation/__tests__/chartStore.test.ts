import { beforeEach, describe, expect, it, vi } from "vitest";

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

// Fresh module + fresh storage per test, since the store keeps module-level memory.
async function loadStore(session = memoryStorage(), local = memoryStorage()) {
  vi.stubGlobal("window", { sessionStorage: session, localStorage: local });
  vi.resetModules();
  const store = await import("../chartStore");
  return { store, session, local };
}

describe("chartStore", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("persists the draft to sessionStorage and restores it after the page is reopened", async () => {
    const { store, session } = await loadStore();
    store.updateDraftSection("chief-complaint", "Shortness of breath");
    store.updateDraftSection("history", "PMH asthma");
    expect(JSON.parse(session.getItem("chart-documentation-draft")!)).toEqual({
      "chief-complaint": "Shortness of breath",
      history: "PMH asthma",
    });

    // Simulate a reload: a new module instance must pick up the stored draft,
    // so editing one field keeps the others.
    const reloaded = await loadStore(session);
    reloaded.store.updateDraftSection("assessment", "Wheeze");
    expect(JSON.parse(session.getItem("chart-documentation-draft")!)).toEqual({
      "chief-complaint": "Shortness of breath",
      history: "PMH asthma",
      assessment: "Wheeze",
    });
  });

  it("clears the draft only when asked", async () => {
    const { store, session } = await loadStore();
    store.updateDraftSection("assessment", "Alert, wheeze");
    store.clearDraft();
    expect(JSON.parse(session.getItem("chart-documentation-draft")!)).toEqual({});
  });

  it("saves charts newest-first to localStorage and deletes them", async () => {
    const { store, local } = await loadStore();
    const first = store.saveChart({ "chief-complaint": "Chest pain" }, "Chest pain");
    const second = store.saveChart({ "chief-complaint": "Fall" }, "Fall");
    let saved = JSON.parse(local.getItem("chart-documentation-saved")!);
    expect(saved.map((c: { id: string }) => c.id)).toEqual([second.id, first.id]);

    store.deleteSavedChart(first.id);
    saved = JSON.parse(local.getItem("chart-documentation-saved")!);
    expect(saved.map((c: { id: string }) => c.id)).toEqual([second.id]);
  });

  it("drops saved charts older than the retention period on load", async () => {
    const local = memoryStorage();
    const old = Date.now() - 25 * 60 * 60 * 1000;
    local.setItem(
      "chart-documentation-saved",
      JSON.stringify([
        { id: "old", savedAt: old, title: "Old", draft: {} },
        { id: "new", savedAt: Date.now(), title: "New", draft: {} },
      ])
    );
    const { store } = await loadStore(memoryStorage(), local);
    store.saveChart({}, "Latest");
    const ids = JSON.parse(local.getItem("chart-documentation-saved")!).map((c: { id: string }) => c.id);
    expect(ids).toContain("new");
    expect(ids).not.toContain("old");
  });

  it("keeps working in memory when storage throws", async () => {
    const broken = memoryStorage();
    broken.setItem = () => {
      throw new Error("QuotaExceeded");
    };
    const { store } = await loadStore(broken, broken);
    expect(() => store.updateDraftSection("treatment", "Salbutamol neb")).not.toThrow();
    expect(() => store.saveChart({ treatment: "Salbutamol neb" }, "t")).not.toThrow();
  });
});
