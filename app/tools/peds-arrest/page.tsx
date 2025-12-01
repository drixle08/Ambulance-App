"use client";

import Link from "next/link";
import { useState } from "react";
import { CopySummaryButton } from "../../_components/CopySummaryButton";

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

  const amiodaroneDoseMg =
    weightUsed != null ? 5 * weightUsed : null; // 5 mg/kg

  const defib4 = weightUsed != null ? 4 * weightUsed : null;
  const defib6 = weightUsed != null ? 6 * weightUsed : null;
  const defib8 = weightUsed != null ? 8 * weightUsed : null;
  const defib10 = weightUsed != null ? 10 * weightUsed : null;

  const dextrose10Vol =
    weightUsed != null ? 2.5 * weightUsed : null; // 2.5 mL/kg of 10%

  const computedAgeYears = hasAnyAge ? yearsNum + monthsNum / 12 : null;

  const targetSBP = hasAnyAge ? (yearsNum > 0 ? 70 + 2 * yearsNum : 70) : null;

  const resetAll = () => {
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-400 hover:text-emerald-400"
          >
            ← Back to dashboard
          </Link>

          <div className="flex items-center gap-2">
            <CopySummaryButton summaryText={summaryText} />

            <button
              type="button"
              onClick={resetAll}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80 transition flex items-center gap-1.5"
            >
              ⟳ Reset
            </button>
          </div>
        </div>

        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Calculator
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pediatric Arrest Calculator
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl">
            Age-based weight estimate with key arrest doses (adrenaline, fluids,
            defibrillation energy, dextrose) and target systolic blood pressure.
            Values are generic and must be confirmed against your local Clinical
            Practice Guidelines before use on real patients.
          </p>
        </header>

        {/* Age + weight row */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* Age card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Age
            </p>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] text-slate-400">Years</label>
                <input
                  type="number"
                  min={0}
                  max={14}
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 outline-none focus:border-emerald-400"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[11px] text-slate-400">
                  Months (0–11)
                </label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Computed age:{" "}
              <span className="font-semibold text-slate-100">
                {toFixed(computedAgeYears ?? null, 1)} years
              </span>
            </p>
          </div>

          {/* Weight card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Weight
            </p>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">
                Enter actual weight (kg) – optional
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="Leave blank to use estimate"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-emerald-400"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Estimated from age:{" "}
              <span className="font-semibold text-slate-100">
                {estWeight ? `${toFixed(estWeight, 1)} kg` : "–"}
              </span>
            </p>
            <p className="text-[10px] text-slate-500">
              Using CPG v2.4 estimates: 0–12 months ≈ (months × 0.5) + 4; 1–5
              years ≈ (age × 2) + 8; 6–14 years ≈ (age × 3) + 7. Always confirm
              with your local CPG.
            </p>
          </div>

          {/* Quick note */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              Quick notes
            </p>
            <ul className="space-y-1">
              <li>• Calculations are based on actual weight if entered.</li>
              <li>• Otherwise, age-based weight estimate is used.</li>
              <li>
                • Always cross-check critical doses with your resus chart / CPG.
              </li>
            </ul>
          </div>
        </section>

        {/* Grid of dose cards */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Adrenaline */}
          <DoseCard
            title="Adrenaline (1:10,000)"
            subtitle="0.01 mg/kg = 0.1 mL/kg"
          >
            <Row
              label="Dose (mg)"
              value={toFixed(adrenalineDoseMg, 3)}
              unit="mg"
            />
            <Row
              label="Volume (mL)"
              value={toFixed(adrenalineVolMl, 1)}
              unit="mL"
            />
          </DoseCard>

          {/* Amiodarone */}
          <DoseCard title="Amiodarone" subtitle="5 mg/kg (VF/pulseless VT)">
            <Row
              label="Dose (mg)"
              value={toFixed(amiodaroneDoseMg, 1)}
              unit="mg"
            />
          </DoseCard>

          {/* Fluids */}
          <DoseCard
            title="Fluids (Isotonic)"
            subtitle="10 mL/kg × 2 (CPG WAAFELSS)"
          >
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
          <DoseCard
            title="Dextrose 10% (Hypoglycaemia)"
            subtitle="2.5 mL/kg IV"
          >
            <Row
              label="Volume"
              value={toFixed(dextrose10Vol, 1)}
              unit="mL"
            />
          </DoseCard>

          {/* Target SBP */}
          <DoseCard
            title="Target Systolic BP"
            subtitle="Age ≥1 yr: (age × 2) + 70"
          >
            <Row
              label="SBP ≥"
              value={toFixed(targetSBP ?? null, 0)}
              unit="mmHg"
            />
          </DoseCard>
        </section>

        <p className="pt-2 text-[11px] text-slate-500 max-w-4xl">
          This tool is a quick-reference calculator for education and
          simulation. All doses and parameters must be checked against your
          local Clinical Practice Guidelines and clinical judgement before use
          in real patients.
        </p>
      </div>
    </main>
  );
}

type DoseCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

function DoseCard({ title, subtitle, children }: DoseCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-100 space-y-2">
      <div>
        <p className="text-sm font-semibold text-slate-50">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-slate-400">{subtitle}</p>
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
      <span className="text-[11px] text-slate-300">{label}</span>
      <span className="text-sm font-semibold">
        {value}{" "}
        {unit && (
          <span className="text-[11px] font-normal text-slate-400">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}
