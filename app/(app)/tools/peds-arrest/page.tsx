"use client";

import { useState, type ReactNode } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

function toFixed(value: number | null | undefined, dp: number = 1) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toFixed(dp);
}

// Estimate weight if actual not provided (aligned with CPG v2.4 formulas)
function estimateWeightKg(ageYears: number, ageMonths: number): number | null {
  const totalMonths = ageYears * 12 + ageMonths;

  if (totalMonths <= 0) return null;

  // 0–12 months: (months × 0.5) + 4
  if (ageYears === 0) {
    return totalMonths * 0.5 + 4;
  }

  // 1–5 years: (age × 2) + 8
  if (ageYears >= 1 && ageYears <= 5) {
    return ageYears * 2 + 8;
  }

  // 6–14 years: (age × 3) + 7
  if (ageYears >= 6 && ageYears <= 14) {
    return ageYears * 3 + 7;
  }

  // Outside range supported by the formula
  return null;
}

export default function PedsArrestPage() {
  // Age fields as strings so they can be truly blank
  const [ageYears, setAgeYears] = useState<string>("");
  const [ageMonths, setAgeMonths] = useState<string>("");
  const [weightInput, setWeightInput] = useState<string>("");

  // Convert to numbers for calculations
  const yearsNum = Math.min(14, Math.max(0, Number(ageYears || "0")));
  const monthsNum = Math.min(11, Math.max(0, Number(ageMonths || "0")));
  const hasAnyAge = ageYears !== "" || ageMonths !== "";

  const parsedWeight = parseFloat(weightInput);
  const estWeight = hasAnyAge ? estimateWeightKg(yearsNum, monthsNum) : null;

  const weightUsed =
    !Number.isNaN(parsedWeight) && parsedWeight > 0 ? parsedWeight : estWeight;

  // Core calculations (check against local CPG before clinical use)
  const adrenalineDoseMg =
    weightUsed != null ? 0.01 * weightUsed : null; // 0.01 mg/kg
  const adrenalineVolMl =
    weightUsed != null ? 0.1 * weightUsed : null; // 0.1 mL/kg of 1:10,000 (0.1 mg/mL)

  const fluids10 = weightUsed != null ? 10 * weightUsed : null;
  const fluids20 = weightUsed != null ? 20 * weightUsed : null; // 2 × 10 mL/kg

  const amiodaroneDoseMg = weightUsed != null ? 5 * weightUsed : null; // 5 mg/kg

  const defib4 = weightUsed != null ? 4 * weightUsed : null;
  const defib6 = weightUsed != null ? 6 * weightUsed : null;
  const defib8 = weightUsed != null ? 8 * weightUsed : null;
  const defib10 = weightUsed != null ? 10 * weightUsed : null;

  const dextrose10Vol =
    weightUsed != null ? 2.5 * weightUsed : null; // 2.5 mL/kg of 10%

  const computedAgeYears = hasAnyAge ? yearsNum + monthsNum / 12 : null;

  const targetSBP = hasAnyAge ? (yearsNum > 0 ? 70 + 2 * yearsNum : 70) : null;

  const handleReset = () => {
    setAgeYears("");
    setAgeMonths("");
    setWeightInput("");
  };

  // 🔹 Summary text for PRF / notes
  const summaryText =
    weightUsed == null
      ? "Paediatric arrest calculator – no valid age/weight entered. Complete age/weight to generate weight-based doses and confirm all values with local CPG."
      : `Paediatric arrest: approx age ${toFixed(
          computedAgeYears ?? null,
          1
        )} years, weight ~${toFixed(
          weightUsed,
          1
        )} kg. Adrenaline 0.01 mg/kg ≈ ${toFixed(
          adrenalineDoseMg,
          3
        )} mg (${toFixed(
          adrenalineVolMl,
          1
        )} mL of 1:10,000). Amiodarone 5 mg/kg ≈ ${toFixed(
          amiodaroneDoseMg,
          1
        )} mg. Fluids 10 mL/kg ≈ ${toFixed(
          fluids10,
          0
        )} mL; up to 20 mL/kg total ≈ ${toFixed(
          fluids20,
          0
        )} mL. First shock 4 J/kg ≈ ${toFixed(
          defib4,
          0
        )} J. Target SBP ≥ ${toFixed(
          targetSBP ?? null,
          0
        )} mmHg (confirm with local CPG).`;

  const hasValidWeight = weightUsed != null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Paediatric resuscitation
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              Paediatric Arrest Calculator (WAAFELSS-style)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              Age-based weight estimate with key arrest doses (adrenaline, amiodarone,
              fluids, defibrillation energy, dextrose) and target systolic blood
              pressure. Aligned with HMCAS CPG v2.4 patterns. Always confirm doses on
              your local resus chart / CPG before use on real patients.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main layout: inputs + summary */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Left: inputs */}
        <div className="md:col-span-2 space-y-4">
          {/* Age card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Age
            </p>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-slate-400">
                  Years
                </label>
                <input
                  type="number"
                  min={0}
                  max={14}
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-slate-400">
                  Months (0–11)
                </label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Computed age:{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {toFixed(computedAgeYears ?? null, 1)} years
              </span>
            </p>
          </div>

          {/* Weight card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Weight
            </p>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400">
                Enter actual weight (kg) – optional
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="Leave blank to use estimate"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500"
              />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Estimated from age:{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {estWeight ? `${toFixed(estWeight, 1)} kg` : "–"}
              </span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">
              Using CPG v2.4 estimates: 0–12 months ≈ (months × 0.5) + 4; 1–5 years ≈
              (age × 2) + 8; 6–14 years ≈ (age × 3) + 7. Always confirm with your local
              CPG/resus chart.
            </p>
          </div>

          {/* Quick notes */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-2 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Quick notes
            </p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Calculations use actual weight if entered.</li>
              <li>Otherwise, age-based weight estimate is used.</li>
              <li>Always cross-check critical doses with your WAAFELSS/resus chart.</li>
            </ul>
          </div>
        </div>

        {/* Right: summary card */}
        <div className="md:col-span-1">
          <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  Arrest summary
                </p>
                <p className="mt-1 text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {hasValidWeight
                    ? `Weight ~${toFixed(weightUsed ?? null, 1)} kg`
                    : "Awaiting age/weight"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {hasValidWeight
                    ? "Weight-based doses calculated below. Use this summary for PRF/ePCR, but confirm all doses in the CPG."
                    : "Enter age and/or weight to generate weight-based doses."}
                </p>
              </div>
              <CopySummaryButton summaryText={summaryText} />
            </div>

            <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Key numbers (first line)
              </p>
              <ul className="space-y-1.5">
                <li>
                  <span className="font-semibold">Adrenaline:</span>{" "}
                  0.01 mg/kg ≈ {toFixed(adrenalineDoseMg, 3)} mg (
                  {toFixed(adrenalineVolMl, 1)} mL of 1:10,000)
                </li>
                <li>
                  <span className="font-semibold">Fluids:</span> 10 mL/kg ≈{" "}
                  {toFixed(fluids10, 0)} mL (up to 20 mL/kg ≈{" "}
                  {toFixed(fluids20, 0)} mL)
                </li>
                <li>
                  <span className="font-semibold">First shock:</span> 4 J/kg ≈{" "}
                  {toFixed(defib4, 0)} J
                </li>
                <li>
                  <span className="font-semibold">Target SBP:</span> ≥{" "}
                  {toFixed(targetSBP ?? null, 0)} mmHg
                </li>
              </ul>
            </div>

            <p className="text-[0.7rem] text-slate-600 dark:text-slate-500 mt-auto">
              This tool supports WAAFELSS-style paediatric arrest management. It does
              not replace your HMCAS CPG, resuscitation charts, or Clinical
              Coordination. Always cross-check doses and adapt to the clinical
              situation.
            </p>
          </div>
        </div>
      </section>

      {/* Grid of dose cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Adrenaline */}
        <DoseCard title="Adrenaline (1:10,000)" subtitle="0.01 mg/kg = 0.1 mL/kg">
          <Row label="Dose" value={toFixed(adrenalineDoseMg, 3)} unit="mg" />
          <Row label="Volume" value={toFixed(adrenalineVolMl, 1)} unit="mL" />
        </DoseCard>

        {/* Amiodarone */}
        <DoseCard title="Amiodarone" subtitle="5 mg/kg (VF/pulseless VT)">
          <Row label="Dose" value={toFixed(amiodaroneDoseMg, 1)} unit="mg" />
        </DoseCard>

        {/* Fluids */}
        <DoseCard title="Fluids (Isotonic)" subtitle="10 mL/kg × 2 (CPG WAAFELSS)">
          <Row
            label="10 mL/kg (1st bolus)"
            value={toFixed(fluids10, 0)}
            unit="mL"
          />
          <Row
            label="Max 20 mL/kg (2 boluses)"
            value={toFixed(fluids20, 0)}
            unit="mL"
          />
        </DoseCard>

        {/* Defibrillation energy */}
        <DoseCard
          title="Defibrillation Energy"
          subtitle="Start 4 J/kg – escalate to max 10 J/kg"
        >
          <Row label="Initial (4 J/kg)" value={toFixed(defib4, 0)} unit="J" />
          <Row label="Next (6 J/kg)" value={toFixed(defib6, 0)} unit="J" />
          <Row label="Then (8 J/kg)" value={toFixed(defib8, 0)} unit="J" />
          <Row label="Max (10 J/kg)" value={toFixed(defib10, 0)} unit="J" />
        </DoseCard>

        {/* Dextrose */}
        <DoseCard title="Dextrose 10% (Hypoglycaemia)" subtitle="2.5 mL/kg IV">
          <Row label="Volume" value={toFixed(dextrose10Vol, 1)} unit="mL" />
        </DoseCard>

        {/* Target SBP */}
        <DoseCard title="Target Systolic BP" subtitle="Age ≥1 yr: (age × 2) + 70">
          <Row label="SBP ≥" value={toFixed(targetSBP ?? null, 0)} unit="mmHg" />
        </DoseCard>
      </section>

      <p className="pt-2 text-[0.7rem] text-slate-600 dark:text-slate-500 max-w-4xl">
        This tool is a quick-reference calculator for education and simulation. All
        doses and parameters must be checked against your local Clinical Practice
        Guidelines, resuscitation charts, and clinical judgement before use in real
        patients.
      </p>
    </div>
  );
}

type DoseCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function DoseCard({ title, subtitle, children }: DoseCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 space-y-2 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="mt-1 space-y-1.5">{children}</div>
    </div>
  );
}

type RowProps = {
  label: string;
  value: string;
  unit?: string;
};

function Row({ label, value, unit }: RowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        {value}{" "}
        {unit && (
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}
