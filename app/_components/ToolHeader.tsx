"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Copy, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { IconButton } from "./IconButton";
import { Button } from "./Button";

type ToolHeaderProps = {
  title: string;
  meta?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  showReset?: boolean;
  resetLabel?: string;
  onReset?: () => void;
  showCopy?: boolean;
  copyLabel?: string;
  copyText?: string;
  onCopy?: (text: string) => void;
  rightContent?: React.ReactNode;
  pathname?: string;
};

/**
 * Shared ToolHeader with a 48px back button and reset/copy slots.
 *
 * Usage: use in each tool's header to ensure consistent 44px+ touch targets.
 */
export function ToolHeader({
  title,
  meta,
  showBack = true,
  backHref,
  onBack,
  showReset = false,
  resetLabel = "Reset",
  onReset,
  showCopy = false,
  copyLabel = "Copy summary",
  copyText,
  onCopy,
  rightContent,
}: ToolHeaderProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyText) return;
    try {
      if (!("clipboard" in navigator)) return;
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(copyText);
    } catch {
      console.error("Failed to copy");
    }
  };

  const showBackButton = showBack || showReset || showCopy || Boolean(rightContent) || Boolean(onReset);

  return (
    <header className="flex min-h-20 flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900/95 px-3 py-3 backdrop-blur-sm md:py-4">
      {/* Back button (always visible when any action slot is present) */}
      {showBackButton && (
        <IconButton
          ariaLabel="Go back"
          onClick={
            onBack ??
            (backHref
              ? () => {
                  if (backHref.startsWith("http")) window.open(backHref, "_blank", "noopener,noreferrer");
                  else pathname && backHref.startsWith("/") ? window.history.back() : undefined;
                }
              : undefined)
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="text-base font-black leading-tight tracking-tight text-slate-100">
          {title}
        </h1>
        {meta && <p className="text-[0.68rem] font-medium text-slate-400">{meta}</p>}
      </div>

      {/* Right side: reset and copy buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {showReset && onReset && (
          <Button variant="secondary" onClick={onReset}>
            <RefreshCw className="h-4 w-4" />
            {resetLabel}
          </Button>
        )}

        {showCopy && copyText && (
          <Button variant="secondary" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : copyLabel}
          </Button>
        )}

        {rightContent}
      </div>
    </header>
  );
}
