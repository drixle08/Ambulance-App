// public/sw.js

const CACHE_NAME = "apt-cache-v1";

// Optional: some core routes to try to keep handy.
// (They'll also be cached on first visit anyway.)
const CORE_ROUTES = [
  "/",
  "/dashboard",
  "/tools/asthma",
  "/tools/mwcs",
  "/tools/gcs",
  "/tools/stroke",
  "/tools/vitals",
  "/tools/peds-arrest",
  "/tools/peds-arrest-algorithm",
  "/tools/adult-arrest",
  "/tools/witnessed-adult-arrest",
  "/tools/rosc",
  "/tools/resus-timer",
  "/tools/ecmo-criteria",
  "/tools/shock-index",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        // Best-effort; failures here won't break install.
        await cache.addAll(CORE_ROUTES);
      } catch (err) {
        // Ignore – network might be flaky during install.
        console.warn("[SW] Precache failed", err);
      }
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Simple strategy:
// - HTML requests: network-first, fallback to cache.
// - Everything else: cache-first, fallback to network.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const accept = request.headers.get("accept") || "";

  // HTML/documents → network-first
  if (accept.includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          const networkResp = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResp.clone());
          return networkResp;
        } catch (err) {
          const cacheMatch = await caches.match(request);
          if (cacheMatch) return cacheMatch;
          // last resort: try cached dashboard
          const fallback = await caches.match("/dashboard");
          if (fallback) return fallback;
          throw err;
        }
      })()
    );
    return;
  }

  // Everything else → cache-first
  event.respondWith(
    (async () => {
      const cacheMatch = await caches.match(request);
      if (cacheMatch) return cacheMatch;

      try {
        const networkResp = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResp.clone());
        return networkResp;
      } catch (err) {
        // Offline and not in cache – just fail.
        throw err;
      }
    })()
  );
});
