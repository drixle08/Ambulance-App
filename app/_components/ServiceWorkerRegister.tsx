"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("serviceWorker" in navigator)) {
      console.log("[SW] Service workers not supported in this browser.");
      return;
    }

    console.log("[SW] Attempting to register service worker...");

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[SW] Registration successful:", registration);
      })
      .catch((error) => {
        console.error("[SW] Registration failed:", error);
      });
  }, []);

  return null;
}
