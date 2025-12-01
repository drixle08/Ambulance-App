"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;

    // Extra safety: don't register in development
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Check that service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported in this browser.");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service worker registered:", registration.scope);
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });
  }, []);

  // This component doesn’t render anything
  return null;
}
