"use client";

import { type ReactNode } from "react";

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type IconButtonProps = {
  /**
   * The icon element.
   */
  children: ReactNode;
  /**
   * Optional accessible label. Required for icon-only buttons per accessibility guidelines.
   */
  ariaLabel: string;
  /**
   * Optional additional className.
   */
  className?: string;
  /**
   * Optional onClick handler.
   */
  onClick?: () => void;
  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
};

/**
 * Shared IconButton with a 48px×48px hit area.
 *
 * The hit area is extended by padding on the inner icon container, so the
 * clickable region is 48px even if the visual icon is smaller. This ensures
 * the touch target meets the 44px minimum guideline regardless of icon size.
 */
export function IconButton({
  children,
  ariaLabel,
  className,
  onClick,
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        "min-h-12 min-w-12", // 48px × 48px minimum touch target
        className
      )}
    >
      <span className="flex items-center justify-center rounded-full p-3">
        {children}
      </span>
    </button>
  );
}
