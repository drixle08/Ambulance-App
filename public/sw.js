self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  clients.claim();
});

// No special caching yet; just pass-through
self.addEventListener("fetch", () => {});
