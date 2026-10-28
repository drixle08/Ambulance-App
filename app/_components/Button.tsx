"use client";

import { type ReactNode } from "react";

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "destructive";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
};

/**
 * Shared Button with 48px minimum height.
 *
 * The hit area is extended by padding on the inner content container, so the
 * clickable region is 48px even if the visual content is smaller.
 */
export function Button({
  children,
  variant = "secondary",
  className,
  onClick,
  disabled = false,
  type = "button",
  ariaLabel,
}: ButtonProps) {
  const variantClasses = {
    primary: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:border-emerald-400 hover:bg-emerald-500/20 focus-visible:ring-emerald-500",
    secondary:
      "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800 focus-visible:ring-slate-500",
    destructive:
      "border-rose-500/40 bg-rose-500/15 text-rose-100 hover:border-rose-400 hover:bg-rose-500/20 focus-visible:ring-rose-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classNames(
        "flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        variantClasses[variant],
        className
      )}
    >
      <span className="flex items-center justify-center px-3 py-1">
        {children}
      </span>
    </button>
  );
}
