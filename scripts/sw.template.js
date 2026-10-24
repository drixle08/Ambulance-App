// Service worker template. `npm run build` turns this into public/sw.js via
// scripts/build-sw.mjs, filling CONFIG with this build's id and file lists.
// Edit this file, not public/sw.js (generated, git-ignored).
//
// Offline model:
// - install: precache every page and every /_next/static file of THIS build.
//   All-or-nothing — if anything fails, the install fails and the previous
//   worker (with its complete cache) stays in charge. A half-filled cache can
//   never become active.
// - activate: only then delete older caches. Because the new cache is already
//   complete, applying an update (even while offline) cannot leave the app
//   without its code.
// - pages: network first with a short timeout (poor signal shouldn't stall a
//   crew), falling back to the precached copy of this build.
// - code/assets: cache first.
// - reference PDFs: the CPG is saved in the background after install; SOP/CPM
//   are saved the first time they're opened online. pdf.js reads PDFs in byte
//   ranges, so ranges are served from the saved whole file.

const CONFIG = /*__CONFIG__*/ null;

const CACHE = `apt-${CONFIG.buildId}`;
const REFERENCE_CACHE = "apt-reference";
const PAGE_TIMEOUT_MS = 3000;
const INSTALL_CONCURRENCY = 6;
const VIEWER_SHELL = "/cpg/view";

// ─── Install: precache this build, all or nothing ───────────────────────────

async function runLimited(items, limit, fn) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift());
  });
  await Promise.all(workers);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await runLimited([...CONFIG.pages, ...CONFIG.assets], INSTALL_CONCURRENCY, async (url) => {
        const response = await fetch(url, { cache: "no-cache", credentials: "same-origin" });
        if (!response.ok || response.redirected) throw new Error(`Precache failed: ${url} (${response.status})`);
        await cache.put(url, response);
      });
    })().catch(async (error) => {
      await caches.delete(CACHE);
      throw error;
    })
  );
});

// ─── Activate: drop older builds only now that this one is complete ─────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE && key !== REFERENCE_CACHE && key.startsWith("apt-"))
          .map((key) => caches.delete(key))
      );
      // Remove reference documents this build no longer ships (e.g. an older CPG).
      const reference = await caches.open(REFERENCE_CACHE);
      const shipped = new Set(CONFIG.reference.files);
      for (const request of await reference.keys()) {
        if (!shipped.has(new URL(request.url).pathname)) await reference.delete(request);
      }
      await self.clients.claim();
    })()
  );
});

// The new worker waits until the page asks it to take over (the dashboard's
// "Update available" banner), so versions never swap mid-protocol.
self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type === "SKIP_WAITING") self.skipWaiting();
  if (type === "CACHE_REFERENCE") event.waitUntil(Promise.all(CONFIG.reference.precache.map(saveReference)));
});

// ─── Fetch routing ──────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Client-side navigation data (React Server Components). Left to the
  // network: offline, Next falls back to a full page load, served below.
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (CONFIG.reference.files.includes(url.pathname)) {
    event.respondWith(serveReference(event, request, url.pathname));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(servePage(request, url));
    return;
  }
  event.respondWith(serveAsset(request));
});

async function precachedPage(url) {
  const cache = await caches.open(CACHE);
  // Pages are cached by path; the query (e.g. ?code=&page= for the CPG viewer)
  // is read by the page itself. Any /cpg/* lookup uses the viewer shell.
  const path = url.pathname.startsWith("/cpg/") ? VIEWER_SHELL : url.pathname;
  return cache.match(path);
}

function offlinePage() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#041e24;color:#f8fafc;font:16px/1.5 system-ui,sans-serif;padding:24px;box-sizing:border-box}a{display:inline-block;margin-top:16px;padding:14px 20px;border-radius:16px;background:#14b8a6;color:#020617;font-weight:800;text-decoration:none}</style></head><body><main><h1 style="font-size:22px;margin:0 0 8px">You're offline</h1><p style="margin:0;color:#cbd5e1">This page isn't saved for offline use. All clinical tools are.</p><a href="/dashboard">Open tools</a></main></body></html>`;
  return new Response(html, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// Pages: network first, but don't wait on a weak signal longer than PAGE_TIMEOUT_MS.
// Network responses are not written back: the precache holds pages that match
// this build's code exactly.
async function servePage(request, url) {
  const cached = await precachedPage(url);
  const network = fetch(request);
  network.catch(() => {}); // may settle after the timeout; nothing left to do then
  try {
    const response = cached
      ? await Promise.race([
          network,
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), PAGE_TIMEOUT_MS)),
        ])
      : await network;
    if (response.ok || response.type === "opaqueredirect" || !cached) return response;
    return cached;
  } catch {
    return cached || offlinePage();
  }
}

// Code and assets: cache first; fill the cache from the network when online.
async function serveAsset(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.status === 200 && response.type === "basic") {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

// ─── Reference PDFs ─────────────────────────────────────────────────────────

const savingReference = new Map();
const referenceBlobs = new Map();

function saveReference(path) {
  if (!savingReference.has(path)) {
    savingReference.set(
      path,
      (async () => {
        try {
          const cache = await caches.open(REFERENCE_CACHE);
          if (await cache.match(path)) return;
          const response = await fetch(path, { cache: "no-cache", credentials: "same-origin" });
          if (response.status === 200) await cache.put(path, response);
        } catch {
          // Offline or interrupted — retried next time.
        } finally {
          savingReference.delete(path);
        }
      })()
    );
  }
  return savingReference.get(path);
}

async function serveReference(event, request, path) {
  const cache = await caches.open(REFERENCE_CACHE);
  const cached = await cache.match(path);
  if (cached) return fromSavedFile(request, path, cached);
  event.waitUntil(saveReference(path)); // first open online: keep a copy for offline
  try {
    return await fetch(request);
  } catch {
    return new Response("This document hasn't been saved for offline use yet — open it once while online.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function fromSavedFile(request, path, response) {
  const range = request.headers.get("Range");
  if (!range) return response;
  let blob = referenceBlobs.get(path);
  if (!blob) {
    blob = await response.blob();
    referenceBlobs.set(path, blob);
  }
  const size = blob.size;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start = 0;
  let end = size - 1;
  if (match && match[1] === "" && match[2] !== "") {
    start = Math.max(0, size - Number(match[2]));
  } else if (match) {
    start = Number(match[1] || 0);
    if (match[2] !== "") end = Math.min(Number(match[2]), size - 1);
  }
  if (!match || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/pdf",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}
