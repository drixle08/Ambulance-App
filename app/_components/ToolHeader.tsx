"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Copy, RefreshCw } from "lucide-react";
import { categoryHrefFor } from "@/app/(app)/dashboard/data";
import { ToolHeaderActionsContext } from "./toolHeaderContext";
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
  /** Optional full-width row under the title (e.g. a checklist progress bar); stays in the sticky header. */
  children?: React.ReactNode;
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
  children,
}: ToolHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Back goes to an explicit target, else the tool's dashboard category, else
  // the dashboard. A fixed target (not history.back) also works when the tool
  // was opened directly, e.g. from a deep link or a fresh PWA launch.
  const backTarget = backHref ?? categoryHrefFor(pathname) ?? "/dashboard";
  const handleBack =
    onBack ??
    (() => {
      if (backTarget.startsWith("http")) window.open(backTarget, "_blank", "noopener,noreferrer");
      else router.push(backTarget);
    });

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
    <header className="sticky top-0 z-30 flex min-h-20 flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900/95 px-3 py-3 backdrop-blur-sm md:py-4">
      {/* Back button (always visible when any action slot is present) */}
      {showBackButton && (
        <IconButton ariaLabel="Go back" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="text-base font-black leading-tight tracking-tight text-slate-100">
          {title}
        </h1>
        {meta && <p className="text-[0.68rem] font-medium text-slate-400">{meta}</p>}
      </div>

      {/* Right side: reset and copy. Icon-only below `sm` so the title keeps
          room on phones; the label stays available to screen readers. */}
      <div className="flex shrink-0 items-center gap-2">
        {showReset && onReset && (
          <Button variant="secondary" onClick={onReset} ariaLabel={resetLabel}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{resetLabel}</span>
          </Button>
        )}

        {showCopy && copyText && (
          <Button variant="secondary" onClick={handleCopy} ariaLabel={copied ? "Copied" : copyLabel}>
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only sm:not-sr-only">{copied ? "Copied!" : copyLabel}</span>
          </Button>
        )}

        <ToolHeaderActionsContext.Provider value={true}>{rightContent}</ToolHeaderActionsContext.Provider>
      </div>

      {children && <div className="basis-full">{children}</div>}
    </header>
  );
}
