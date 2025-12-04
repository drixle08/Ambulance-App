"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export function InstallHint() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Effect 1: subscribe to install events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowHint(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowHint(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Effect 2: fallback – if not in standalone, still show a hint
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;

    if (!isStandalone) {
      // Defer setState to avoid "synchronous setState in effect" warning
      window.setTimeout(() => {
        setShowHint(true);
      }, 0);
    }
  }, []);

  const handleClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setShowHint(false);
      } catch {
        // user cancelled or error – ignore
      }
      return;
    }

    // Fallback instructions if we don't have a deferredPrompt
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        alert(
          "To install: tap the Share button in Safari, then tap 'Add to Home Screen'."
        );
      } else {
        alert(
          "To install: open your browser menu and choose 'Install app' or 'Add to Home Screen'."
        );
      }
    }
  }, [deferredPrompt]);

  if (!showHint) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-500 px-3 py-1.5 text-[0.7rem] font-semibold text-slate-900 shadow-lg hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <Download className="h-3.5 w-3.5" />
      <span>Install app</span>
    </button>
  );
}
