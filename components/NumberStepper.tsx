"use client";

import { useId } from "react";

/**
 * Shared stepper used by the Drug Infusion Calculator (weight + dose rate)
 * and anywhere a small numeric input with units is needed.
 *
 * Replaces `SliderRow` (F11): no more wide range slider that scrolls the
 * page and reads 2px/kg. The -/+ buttons are 48px, the field is a typed
 * inputMode="decimal" with min/max clamping, and it never silently turns
 * an empty field into 0.
 */
export interface NumberStepperProps {
  /** Visible label above the field. */
  label: string;
  /** Suffix shown next to the value, e.g. "kg", "mcg/kg/min". */
  unit?: string;
  value: number;
  /** Minimum selectable value (inclusive). */
  min?: number;
  /** Maximum selectable value (inclusive). */
  max?: number;
  /** Step for the buttons and the field. Defaults to 1 (or 0.1 when < 1). */
  step?: number;
  /** Called when the value changes. Clamps to [min, max]. */
  onChange: (value: number) => void;
  /** Inline error shown when the field is empty, out of range, or otherwise invalid. */
  error?: string;
  /** Random id, or an explicit id for label association. */
  inputId?: string;
  className?: string;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(v * 100) / 100));
}

function toStep(v: number, step: number): number {
  return step >= 1 ? Math.round(v * 100) / 100 : Math.round(v / step) * step;
}

export function NumberStepper({
  label,
  unit,
  value,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onChange,
  error,
  inputId,
  className,
}: NumberStepperProps) {
  const localId = useId();
  const id = inputId ?? localId;
  const displayValue = Number.isFinite(value) ? value : NaN;

  const apply = (next: number): void => {
    const clamped = clamp(toStep(next, step), min, max);
    if (clamped >= min && clamped <= max) {
      onChange(clamped);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      // Empty field is valid: clear it, and let the parent decide (no silent 0).
      onChange(NaN);
      return;
    }
    const next = Number(raw);
    if (Number.isNaN(next)) {
      onChange(NaN);
      return;
    }
    const rounded = toStep(next, step);
    if (rounded >= min && rounded <= max) {
      onChange(rounded);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold leading-none text-slate-900 dark:text-white">
          {label}
        </label>
        <div className="flex items-baseline gap-1.5">
          <input
            id={id}
            name={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={Number.isFinite(displayValue) ? toStep(displayValue, step) : ""}
            onChange={handleInput}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="w-28 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-sm font-bold tabular-nums text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
          />
          {unit && <span className="text-sm font-semibold select-none text-slate-500">{unit}</span>}
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-rose-400">
          {error}
        </p>
      )}
      <div
        className="mt-1 flex gap-1"
        role="group"
        aria-label={`${label} ${min}–${max}${unit ? " " + unit : ""}`}
      >
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => apply(displayValue - step)}
          className="min-h-12 min-w-12 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <span className="text-sm font-black">−</span>
        </button>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => apply(displayValue + step)}
          className="min-h-12 min-w-12 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <span className="text-sm font-black">+</span>
        </button>
      </div>
    </div>
  );
}
