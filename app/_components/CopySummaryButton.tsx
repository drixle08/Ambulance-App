"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type CopySummaryButtonProps = {
  summaryText: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

export function CopySummaryButton({
  summaryText,
  label = "Copy summary",
  copiedLabel = "Copied!",
  className,
}: CopySummaryButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (!("clipboard" in navigator)) {
        console.warn("Clipboard API not available");
        return;
      }
      await navigator.clipboard.writeText(summaryText);

      // Haptic feedback for tactile confirmation in high-pressure environments
      navigator?.vibrate?.(10);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy summary:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={classNames(
        "rounded-full border px-3 py-1.5 text-[11px] font-medium transition flex items-center gap-1.5",
        copied
          ? "border-emerald-500 bg-emerald-500/15 text-emerald-100"
          : "border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  );
}
