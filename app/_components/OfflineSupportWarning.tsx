"use client";

import { useSyncExternalStore } from "react";
import { AlertTriangle } from "lucide-react";
import { getInstallFailure, subscribe } from "@/lib/swUpdate";

// Dashboard notice when offline support failed to install on this device
// (e.g. /sw.js missing from a deploy, or the precache download failed).
// The app keeps working online; the point is that nobody discovers this for
// the first time in a dead zone.
export function OfflineSupportWarning() {
  const failure = useSyncExternalStore(subscribe, getInstallFailure, () => null);
  if (!failure) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-slate-500 bg-slate-700 px-4 py-3 text-slate-50"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="space-y-0.5">
        <p className="text-base font-bold">Offline mode isn&apos;t set up on this device</p>
        <p className="text-sm text-slate-200">
          Tools work now, but will need a connection. Reload with a good signal to retry — if this
          keeps appearing, report it ({failure === "register" ? "service worker missing" : "offline download failed"}).
        </p>
      </div>
    </div>
  );
}
