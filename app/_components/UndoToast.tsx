"use client";

import { useEffect } from "react";
import { Undo2 } from "lucide-react";

export const UNDO_WINDOW_MS = 10_000;

type UndoToastProps = {
  message: string;
  onUndo: () => void;
  onExpire: () => void;
};

// Short-lived "… cleared — Undo" bar shown after a destructive action.
// Sits above the mobile BottomNav and any tool action bar docked at the bottom.
export function UndoToast({ message, onUndo, onExpire }: UndoToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onExpire, UNDO_WINDOW_MS);
    return () => window.clearTimeout(id);
  }, [onExpire]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 z-[60] flex justify-center px-4"
      style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
    >
      {/* bg-slate-700 / bg-emerald-500: colours globals.css leaves opaque */}
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-500 bg-slate-700 py-2 pl-4 pr-2 text-slate-50 shadow-2xl">
        <span className="flex-1 text-base font-semibold">{message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-base font-black text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <Undo2 className="h-5 w-5" aria-hidden="true" />
          Undo
        </button>
      </div>
    </div>
  );
}
