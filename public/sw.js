const CACHE_NAME = "mwcs-cache-v1";

// Pages & assets we want available offline
const OFFLINE_URLS = [
  "/",                 // root
  "/dashboard",
  "/tools/mwcs",
  "/tools/gcs",
  "/tools/stroke",
  "/tools/asthma",
  "/tools/vitals",
  "/tools/peds-arrest",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: pre-cache core pages & icons
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for pages, cache-first for assets
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // We only care about GET requests
  if (request.method !== "GET") return;

  // Handle navigation/page requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Save latest version of the page to cache
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          // If offline or network fails, try cache, else fall back to dashboard
          caches.match(request).then((cached) => cached || caches.match("/dashboard"))
        )
    );
    return;
  }

  // For static assets (JS, CSS, images) → cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached); // if network fails and nothing cached, just fail
    })
  );
});
