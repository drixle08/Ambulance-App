"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // We use window.load to make sure all Next.js stuff is ready.
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => {
          // Silent fail – don't break the UI.
          console.error("[SW] registration failed", err);
        });
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
