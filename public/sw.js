// public/sw.js

const CACHE_NAME = "apt-cache-v4";
const CORE_ROUTES = [
  "/",
  "/dashboard",
  "/dashboard/resuscitation",
  "/dashboard/respiratory-airway",
  "/dashboard/assessment-screening",
  "/dashboard/reference",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
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
const FALLBACK_HTML = "/dashboard";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(
        CORE_ROUTES.map(async (url) => {
          try {
            const resp = await fetch(url, { cache: "no-cache" });
            if (resp.ok) {
              await cache.put(url, resp.clone());
            }
          } catch (err) {
            console.warn("[SW] Precache failed for", url, err);
          }
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Do not cache APIs or cross-origin requests
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api")) {
    return;
  }

  const accept = request.headers.get("accept") || "";
  const isHTML =
    accept.includes("text/html") || request.destination === "document";

  // HTML/documents: network-first with dashboard fallback
  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          const networkResp = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResp.clone());
          return networkResp;
        } catch (err) {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match(FALLBACK_HTML);
          if (fallback) return fallback;
          throw err;
        }
      })()
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const networkResp = await fetch(request);
        cache.put(request, networkResp.clone());
        return networkResp;
      } catch (err) {
        console.warn("[SW] Static fetch failed:", request.url, err);
        // Return cached (if race) or a generic offline response to avoid unhandled rejections.
        const fallback = await cache.match(request);
        if (fallback) return fallback;
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })()
  );
});
