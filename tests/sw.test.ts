// Runs scripts/sw.template.js in a sandbox with in-memory CacheStorage and no
// network, to check what a device that has installed the app can open offline.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const ORIGIN = "https://app.test";
const CONFIG = {
  buildId: "build-test",
  version: "v1",
  pages: ["/dashboard", "/tools/gcs", "/cpg/view"],
  assets: ["/_next/static/chunks/app.js", "/_next/static/chunks/app.css", "/icons/icon-192.png"],
  reference: { files: [], precache: [] },
};

type Listener = (event: unknown) => void;

function keyOf(input: string | Request) {
  return new URL(typeof input === "string" ? input : input.url, ORIGIN).href;
}

// Exact-URL matching, like the real Cache API without ignoreSearch.
class MemoryCache {
  entries = new Map<string, Response>();
  async match(input: string | Request) {
    return this.entries.get(keyOf(input))?.clone();
  }
  async put(input: string | Request, response: Response) {
    this.entries.set(keyOf(input), response);
  }
  async keys() {
    return [...this.entries.keys()].map((url) => new Request(url));
  }
  async delete(input: string | Request) {
    return this.entries.delete(keyOf(input));
  }
}

type Network = { online: boolean; failUrl?: string };

// Workers loaded with the same `stores` share one device's CacheStorage.
function loadWorker(config = CONFIG, stores = new Map<string, MemoryCache>(), network: Network = { online: true }) {
  const listeners: Record<string, Listener> = {};
  const sandbox = {
    self: {
      location: { origin: ORIGIN },
      addEventListener: (type: string, fn: Listener) => (listeners[type] = fn),
      clients: { claim: async () => {} },
      skipWaiting: () => {},
    },
    caches: {
      open: async (name: string) => {
        if (!stores.has(name)) stores.set(name, new MemoryCache());
        return stores.get(name)!;
      },
      keys: async () => [...stores.keys()],
      delete: async (name: string) => stores.delete(name),
    },
    fetch: async (input: string | Request) => {
      if (!network.online || keyOf(input) === keyOf(network.failUrl ?? "")) throw new TypeError("Failed to fetch");
      return new Response(`body of ${keyOf(input)}`, { status: 200 });
    },
    Response, Request, URL, Headers, setTimeout, clearTimeout, console,
  };
  const template = fs.readFileSync(path.join(__dirname, "../scripts/sw.template.js"), "utf8");
  vm.runInNewContext(template.replace("/*__CONFIG__*/ null", JSON.stringify(config)), sandbox);

  const waitFor = (type: string, extra: object) => {
    let pending: Promise<unknown> = Promise.resolve();
    listeners[type]({ ...extra, waitUntil: (p: Promise<unknown>) => (pending = p), respondWith: (p: Promise<unknown>) => (pending = p) });
    return pending;
  };
  return {
    install: () => waitFor("install", {}),
    activate: () => waitFor("activate", {}),
    goOffline: () => (network.online = false),
    stores,
    request: (url: string, init: { mode?: RequestMode } = {}) => {
      // Request() refuses mode "navigate"; the worker only reads it.
      const request = new Request(ORIGIN + url);
      if (init.mode) Object.defineProperty(request, "mode", { value: init.mode });
      return waitFor("fetch", { request }) as Promise<Response>;
    },
  };
}

describe("service worker offline", () => {
  it("serves precached build files when the page asks with a deployment query", async () => {
    const sw = loadWorker();
    await sw.install();
    sw.goOffline();
    // Vercel's HTML references every build file as ?dpl=<deployment id>.
    const js = await sw.request("/_next/static/chunks/app.js?dpl=dpl_abc123");
    expect(js.status).toBe(200);
    expect(await js.text()).toBe(`body of ${ORIGIN}/_next/static/chunks/app.js`);
    const css = await sw.request("/_next/static/chunks/app.css?dpl=dpl_abc123");
    expect(css.status).toBe(200);
  });

  it("serves precached pages, with the CPG viewer shell for any /cpg/ path", async () => {
    const sw = loadWorker();
    await sw.install();
    sw.goOffline();
    expect((await sw.request("/tools/gcs", { mode: "navigate" })).status).toBe(200);
    const viewer = await sw.request("/cpg/view?code=CPG%203.1&page=62", { mode: "navigate" });
    expect(await viewer.text()).toBe(`body of ${ORIGIN}/cpg/view`);
  });

  it("answers 503 for an asset that was never saved", async () => {
    const sw = loadWorker();
    await sw.install();
    sw.goOffline();
    expect((await sw.request("/_next/static/chunks/missing.js?dpl=dpl_abc123")).status).toBe(503);
  });

  it("a worker-only update that fails to install leaves the cache in use intact", async () => {
    const device = new Map<string, MemoryCache>();
    const current = loadWorker(CONFIG, device);
    await current.install();
    await current.activate();
    // Same app build (same buildId), changed worker: a new version, so a new cache.
    const update = loadWorker({ ...CONFIG, version: "v2" }, device, { online: true, failUrl: "/tools/gcs" });
    await expect(update.install()).rejects.toThrow();
    expect([...device.keys()].filter((name) => name !== "apt-reference")).toEqual(["apt-v1"]);
    current.goOffline();
    expect((await current.request("/tools/gcs", { mode: "navigate" })).status).toBe(200);
  });
});
