"use client";

import { useSyncExternalStore } from "react";
import { RefreshCw } from "lucide-react";
import { applyUpdate, getWaitingWorker, subscribe } from "@/lib/swUpdate";

// Dashboard-only, non-blocking notice that a new app version has finished
// downloading and is ready to apply. Deliberately never rendered inside a
// tool screen — a crew mid-protocol shouldn't have their attention pulled
// by anything other than the tool itself.
export function UpdateBanner() {
  const waitingWorker = useSyncExternalStore(subscribe, getWaitingWorker, () => null);

  if (!waitingWorker) return null;

  return (
    <button
      type="button"
      onClick={applyUpdate}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-500/15 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/15"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Update available — tap to refresh
    </button>
  );
}
