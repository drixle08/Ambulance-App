"use client";

import { useEffect, useState } from "react";

// Minimal type for the PWA install event
declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallHint() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      // Prevent the default mini-infobar on some browsers
      e.preventDefault();
      setInstallEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // If we don't have an install event, or user dismissed, show nothing
  if (!installEvent || dismissed) return null;

  const handleInstall = async () => {
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      // Hide hint after user decides
      setInstallEvent(null);
      if (choice.outcome !== "accepted") {
        setDismissed(true);
      }
    } catch {
      setDismissed(true);
    }
  };

  const handleClose = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-20 max-w-xs rounded-2xl border border-slate-800 bg-slate-900/95 px-4 py-3 text-[11px] text-slate-200 shadow-lg shadow-black/50">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-lg">📲</div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-50">
            Install this app
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Add the Ambulance Paramedic Toolkit to your home screen for
            faster access and offline use.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-medium text-slate-950 hover:bg-emerald-400"
            >
              Install
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
