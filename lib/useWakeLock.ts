"use client";

import { useEffect } from "react";

/**
 * Keep the screen on while `active` (Screen Wake Lock API).
 *
 * The browser drops the lock whenever the page is hidden, so it is
 * re-requested each time the page becomes visible again. Unsupported
 * browsers, or a refusal (e.g. battery saver), are ignored: the screen
 * then follows the device's normal sleep setting.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (document.visibilityState !== "visible") return;
      if (sentinel && !sentinel.released) return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
      } catch {
        // Refused or unsupported — nothing more we can do.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") request();
    };

    request();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [active]);
}
