"use client";

import { useEffect } from "react";
import { checkForUpdate, setInstallFailure, setRegistration, setWaitingWorker } from "@/lib/swUpdate";

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
          updateViaCache: "none",
        });
        console.info("[SW] Registered:", registration.scope);
        setRegistration(registration);

        // Once a worker is active, ask it to save the CPG PDF for offline use
        // in the background (kept out of install so a 12 MB download can never
        // hold up precaching the app's code). No-op if already saved.
        navigator.serviceWorker.ready
          .then((ready) => ready.active?.postMessage({ type: "CACHE_REFERENCE" }))
          .catch(() => {});

        // A worker already sitting in "waiting" when we attach (e.g. this
        // tab loaded while an update from another tab was pending).
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }

        const watchInstall = (installing: ServiceWorker) => {
          installing.addEventListener("statechange", () => {
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
            if (installing.state === "activated") setInstallFailure(null);
            // Install failed (the precache is all-or-nothing). With an older
            // version active that's harmless — it keeps working — but on a
            // first install it means this device has no offline support.
            if (installing.state === "redundant" && !registration.active) {
              console.error("[SW] First install failed — no offline support.");
              setInstallFailure("install");
            }
          });
        };

        // The first install can already be underway by the time register() resolves.
        if (registration.installing) watchInstall(registration.installing);
        registration.onupdatefound = () => {
          if (registration.installing) watchInstall(registration.installing);
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
        // Online and still failing means /sw.js is missing or broken on this
        // deploy — say so on the dashboard rather than degrading silently.
        // (Offline, an already-installed worker keeps working; ignore.)
        if (navigator.onLine) setInstallFailure("register");
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
