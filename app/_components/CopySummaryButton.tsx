"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useInToolHeader } from "./toolHeaderContext";

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
  const inHeader = useInToolHeader();

  const handleCopy = async () => {
    try {
      if (!("clipboard" in navigator)) {
        console.warn("Clipboard API not available");
        return;
      }
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy summary:", err);
    }
  };

  // In ToolHeader's action slot: match the header's 48px buttons, icon-only
  // below `sm` (label kept for screen readers), check icon as copy feedback.
  if (inHeader) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : label}
        className={classNames(
          "flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
          copied
            ? "border-emerald-500 bg-emerald-500/15 text-emerald-100"
            : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800",
          className
        )}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="sr-only sm:not-sr-only">{copied ? copiedLabel : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={classNames(
        "rounded-full border px-3 py-1.5 text-[11px] font-medium transition flex items-center gap-1.5",
        copied
          ? "border-emerald-500 bg-emerald-500/15 text-emerald-100"
          : "border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80",
        className
      )}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
