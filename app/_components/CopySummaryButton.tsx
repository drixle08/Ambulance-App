"use client";

import { useState } from "react";

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
