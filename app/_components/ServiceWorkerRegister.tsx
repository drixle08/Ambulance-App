"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (process.env.NODE_ENV !== "production") {
      console.info("[SW] Skipping registration in non-prod.");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.info("[SW] Service workers not supported in this browser.");
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.info("[SW] Registered:", registration.scope);

        registration.onupdatefound = () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.onstatechange = () => {
            if (
              installing.state === "activated" &&
              navigator.serviceWorker.controller
            ) {
              console.info("[SW] New service worker activated; reloading.");
              window.location.reload();
            }
          };
        };
      } catch (error) {
        console.error("[SW] Registration failed:", error);
      }
    };

    register();
  }, []);

  return null;
}
