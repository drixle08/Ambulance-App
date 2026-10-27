"use client";

/**
 * High-contrast, one-line critical value, used on top of
 * `CriticalValue`/`ResultCard` (F13).
 *
 * The number itself is always bright on the dark panels — never
 * coloured. Severity/urgency is expressed through a left colour border and
 * a small coloured dot icon only.
 */
export type CriticalValueTone = "critical" | "warning" | "ok" | "neutral";
export interface CriticalValueProps {
  /** Numeric value to display. */
  value: number | string;
  /** Unit, e.g. "mg", "mmHg", "J/kg". Rendered >=14px. */
  unit?: string;
  /** Extra label/context shown above the value. */
  label?: string;
  /** Tone drives the coloured border + icon only, never the number text. */
  tone?: CriticalValueTone;
  /** Render as a full-width callout (larger number) rather than a compact row. */
  asCallout?: boolean;
  /** Extra classes for fine-tuning. */
  className?: string;
}

const TONE: Record<CriticalValueTone, { number: string; border: string; dot: string }> = {
  critical: {
    number: "text-red-500",
    border: "border-l-4 border-l-red-500",
    dot: "text-red-500",
  },
  warning: {
    number: "text-amber-500",
    border: "border-l-3 border-l-amber-500",
    dot: "text-amber-500",
  },
  ok: {
    number: "text-emerald-500",
    border: "border-l-3 border-l-emerald-500",
    dot: "text-emerald-500",
  },
  neutral: {
    number: "text-slate-500",
    border: "border-l-2 border-l-slate-500",
    dot: "text-slate-500",
  },
};

export function CriticalValue({
  value,
  unit,
  label,
  tone = "critical",
  asCallout = false,
  className,
}: CriticalValueProps) {
  const sizeClass = asCallout
    ? "text-3xl"
    : "text-xl";
  const base = `font-black tabular-nums leading-tight ${TONE[tone].number}`;
  const unitClass =
    "text-sm font-semibold select-none " + (asCallout ? "text-slate-600" : "text-slate-500");

  return (
    <div className={`w-fit rounded-lg border border-slate-800 bg-slate-900/40 px-2 py-1 ${TONE[tone].border} ${className}`}>
      {label && <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">{label}</div>}
      <div className={`flex items-baseline gap-1.5 ${base}`}>
        <span className={`${sizeClass} ${TONE[tone].number}`}>
          {typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(value)}
        </span>
        {unit && <span className={unitClass}>{unit}</span>}
      </div>
      {tone !== "neutral" && (
        <span className={`ml-1 mt-0.5 flex items-center gap-1 text-[0.65rem] font-bold text-slate-400`}>
          <span className={`w-1 h-1 rounded-full ${TONE[tone].dot}`} />
          {tone === "critical" ? "critical" : tone === "warning" ? "warning" : "ok"}
        </span>
      )}
    </div>
  );
}
