"use client";

import { useEffect } from "react";
import { checkForUpdate, setRegistration, setWaitingWorker } from "@/lib/swUpdate";

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

    let cleanupVisibility: (() => void) | undefined;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.info("[SW] Registered:", registration.scope);
        setRegistration(registration);

        // A worker already sitting in "waiting" when we attach (e.g. this
        // tab loaded while an update from another tab was pending).
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }

        registration.onupdatefound = () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.onstatechange = () => {
            // "installed" while we already have a controller means this is
            // an update (not the very first install) and the new worker is
            // ready and waiting — surface it instead of auto-swapping.
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.info("[SW] Update ready and waiting.");
              setWaitingWorker(installing);
            }
          };
        };

        // The browser only checks for a new sw.js on navigation / roughly
        // every 24h in the background. A shift-long open tab needs an
        // explicit nudge whenever the crew brings it back to the foreground.
        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            checkForUpdate();
          }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        cleanupVisibility = () =>
          document.removeEventListener("visibilitychange", handleVisibilityChange);
      } catch (error) {
        console.error("[SW] Registration failed:", error);
      }
    };

    // Defer registration slightly to avoid competing with first paint/network fetches.
    const timeoutId = window.setTimeout(() => {
      register();
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
      cleanupVisibility?.();
    };
  }, []);

  return null;
}
