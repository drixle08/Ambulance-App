"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Baby,
  Syringe,
  Zap,
  Droplets,
  Activity,
  RotateCcw,
  Plus,
  Minus,
  Scale,
  Heart,
  Wind,
  GitBranch,
  ChevronRight,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function estimateWeightKg(ageYears: number, ageMonths: number): number | null {
  const totalMonths = ageYears * 12 + ageMonths;
  if (totalMonths <= 0) return null;
  if (ageYears === 0) return totalMonths * 0.5 + 4;
  if (ageYears >= 1 && ageYears <= 5) return ageYears * 2 + 8;
  if (ageYears >= 6 && ageYears <= 14) return ageYears * 3 + 7;
  return null;
}

function getSGASize(weight: number): string {
  if (weight <= 5) return "1";
  if (weight <= 12) return "1.5";
  if (weight <= 25) return "2";
  if (weight <= 35) return "2.5";
  return "3";
}

function fmt(value: number | null | undefined, dp = 1): string {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toFixed(dp);
}

// ─── Types ──────────────────────────────────────────────────────────────────

type ColorKey =
  | "emerald"
  | "sky"
  | "blue"
  | "amber"
  | "yellow"
  | "rose"
  | "violet";

const COLOR_STYLES: Record<
  ColorKey,
  { border: string; iconBg: string; accent: string }
> = {
  emerald: {
    border: "border-emerald-900/60",
    iconBg: "bg-emerald-900/40 text-emerald-400",
    accent: "text-emerald-400",
  },
  sky: {
    border: "border-sky-900/60",
    iconBg: "bg-sky-900/40 text-sky-400",
    accent: "text-sky-400",
  },
  blue: {
    border: "border-blue-900/60",
    iconBg: "bg-blue-900/40 text-blue-400",
    accent: "text-blue-400",
  },
  amber: {
    border: "border-amber-900/60",
    iconBg: "bg-amber-900/40 text-amber-400",
    accent: "text-amber-400",
  },
  yellow: {
    border: "border-yellow-900/60",
    iconBg: "bg-yellow-900/40 text-yellow-400",
    accent: "text-yellow-400",
  },
  rose: {
    border: "border-rose-900/60",
    iconBg: "bg-rose-900/40 text-rose-400",
    accent: "text-rose-400",
  },
  violet: {
    border: "border-violet-900/60",
    iconBg: "bg-violet-900/40 text-violet-400",
    accent: "text-violet-400",
  },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PedsArrestPage() {
  const [ageYears, setAgeYears] = useState(0);
  const [ageMonths, setAgeMonths] = useState(0);
  const [hasAge, setHasAge] = useState(false);
  const [weightOverride, setWeightOverride] = useState("");

  const estWeight = hasAge ? estimateWeightKg(ageYears, ageMonths) : null;
  const parsedOverride = parseFloat(weightOverride);
  const weight =
    !isNaN(parsedOverride) && parsedOverride > 0 ? parsedOverride : estWeight;

  // Doses
  const adrMg = weight ? 0.01 * weight : null;
  const adrMl = weight ? 0.1 * weight : null;
  const amioMgRaw = weight ? 5 * weight : null;
  const amioMg = amioMgRaw != null ? Math.min(amioMgRaw, 300) : null;
  const amioCapped = amioMgRaw != null && amioMgRaw > 300;
  // Amiodarone: 150 mg/3 mL = 50 mg/mL (undiluted)
  const amioMl = amioMg != null ? amioMg / 50 : null;
  const fluid10 = weight ? 10 * weight : null;
  const fluid20 = weight ? 20 * weight : null;
  const defib4 = weight ? 4 * weight : null;
  const defib6 = weight ? 6 * weight : null;
  const defib8 = weight ? 8 * weight : null;
  const defib10 = weight ? 10 * weight : null;
  const dex10Vol = weight ? 2.5 * weight : null;
  const sbp = hasAge && ageYears > 0 ? 70 + 2 * ageYears : 70;

  // Airway sizing
  const sgaSize = weight ? getSGASize(weight) : null;
  const isInfant = hasAge && ageYears === 0 && ageMonths > 0;
  const ettUncuffed =
    hasAge && ageYears >= 1 ? ageYears / 4 + 4 : null;
  const ettCuffed =
    hasAge && ageYears >= 1 ? ageYears / 4 + 3.5 : null;
  const ettDepth =
    hasAge && ageYears >= 1 ? ageYears / 2 + 12 : null;

  function adjustYears(delta: number) {
    setAgeYears((prev) => Math.max(0, Math.min(14, prev + delta)));
    if (!hasAge) setHasAge(true);
  }

  function adjustMonths(delta: number) {
    setAgeMonths((prev) => Math.max(0, Math.min(11, prev + delta)));
    if (!hasAge) setHasAge(true);
  }

  function handleReset() {
    setAgeYears(0);
    setAgeMonths(0);
    setHasAge(false);
    setWeightOverride("");
  }

  const sgaText = sgaSize ? `SGA size ${sgaSize}` : "";
  const ettText = ettUncuffed
    ? `ETT uncuffed ${fmt(ettUncuffed, 1)} / cuffed ${fmt(ettCuffed, 1)} mm ID, depth ${fmt(ettDepth, 1)} cm at lip`
    : isInfant
    ? "ETT ~3.0–3.5 mm (infant)"
    : "";
  const summaryText =
    weight == null
      ? "Paediatric arrest – no valid age/weight entered."
      : `Paediatric arrest: ${ageYears}y ${ageMonths}m, weight ~${fmt(weight)} kg. ` +
        `Adrenaline 0.01 mg/kg ≈ ${fmt(adrMg, 3)} mg (${fmt(adrMl, 1)} mL of 1:10,000). ` +
        `Amiodarone 5 mg/kg ≈ ${fmt(amioMg, 1)} mg${amioCapped ? " (capped 300 mg)" : ""} (${fmt(amioMl, 1)} mL undiluted). ` +
        `Fluids 10–20 mL/kg: bolus ${fmt(fluid10, 0)}–${fmt(fluid20, 0)} mL (up to 3 boluses). ` +
        `First shock 4 J/kg ≈ ${fmt(defib4, 0)} J. ` +
        (sgaText ? `${sgaText}. ` : "") +
        (ettText ? `${ettText}. ` : "") +
        `Target SBP ≥ ${sbp} mmHg.`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/resuscitation"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              CPG 2.3 · v2.5 2026
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              Paediatric Arrest — WAAFELSS
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        {/* ── Algorithm Link ── */}
        <Link
          href="/tools/peds-medical-arrest"
          className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 hover:bg-violet-500/10 transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20 flex-shrink-0">
            <GitBranch className="h-4 w-4 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-violet-300">
              Paediatric Medical Cardiac Arrest
            </p>
            <p className="text-[10px] text-violet-500">
              Step-by-step shockable / non-shockable algorithm — CPG 2.3
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-violet-500 flex-shrink-0" />
        </Link>

        {/* ── Age Input ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Patient Age
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Years */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-500 text-center">Years</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustYears(-1)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5 text-slate-300" />
                </button>
                <span className="w-10 text-center text-2xl font-bold text-white tabular-nums">
                  {ageYears}
                </span>
                <button
                  type="button"
                  onClick={() => adjustYears(1)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Months */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-500 text-center">
                Months (0–11)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustMonths(-1)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5 text-slate-300" />
                </button>
                <span className="w-10 text-center text-2xl font-bold text-white tabular-nums">
                  {ageMonths}
                </span>
                <button
                  type="button"
                  onClick={() => adjustMonths(1)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Weight ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Weight
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {!isNaN(parsedOverride) && parsedOverride > 0
                  ? "Actual"
                  : "Estimated"}
              </p>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                {weight != null ? `${fmt(weight)} kg` : "–"}
              </p>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-500">
              Override with actual weight (kg)
            </label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={weightOverride}
              onChange={(e) => setWeightOverride(e.target.value)}
              placeholder="Leave blank to use estimate"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-base text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
            />
          </div>
          <p className="text-[10px] text-slate-600">
            CPG v2.5 formulas — 0–12m: (months×0.5)+4 · 1–5y: (age×2)+8 ·
            6–14y: (age×3)+7
          </p>
        </section>

        {/* ── Dose Cards: A A F E ── */}
        <div className="grid grid-cols-2 gap-3">
          <DoseCard
            letter="A"
            title="Adrenaline"
            formula="0.01 mg/kg IV/IO — repeat every 4 min"
            color="emerald"
            icon={<Syringe className="w-5 h-5" />}
          >
            <BigValue value={fmt(adrMg, 3)} unit="mg" />
            <SmallValue value={fmt(adrMl, 1)} unit="mL of 1:10,000 (0.1 mg/mL)" />
          </DoseCard>

          <DoseCard
            letter="A"
            title="Amiodarone"
            formula="5 mg/kg IV/IO — refractory VF/VT"
            color="sky"
            icon={<Zap className="w-5 h-5" />}
          >
            <BigValue value={fmt(amioMg, 1)} unit="mg" />
            <SmallValue value={fmt(amioMl, 1)} unit="mL undiluted (150 mg/3 mL)" />
            {amioCapped && (
              <p className="text-[10px] text-amber-400 mt-0.5">
                ⚠ Capped at 300 mg max dose
              </p>
            )}
          </DoseCard>

          <DoseCard
            letter="F"
            title="Fluids"
            formula="10–20 mL/kg NaCl 0.9% — up to 3 boluses"
            color="blue"
            icon={<Droplets className="w-5 h-5" />}
          >
            <BigValue value={fmt(fluid10, 0)} unit="mL" />
            <SmallValue
              value={`max ${fmt(fluid20, 0)} mL`}
              unit="per bolus"
            />
          </DoseCard>

          <DoseCard
            letter="E"
            title="Energy"
            formula="4 → 10 J/kg"
            color="amber"
            icon={<Zap className="w-5 h-5" />}
          >
            <div className="grid grid-cols-2 gap-1">
              <ShockRow label="4 J/kg" value={fmt(defib4, 0)} />
              <ShockRow label="6 J/kg" value={fmt(defib6, 0)} />
              <ShockRow label="8 J/kg" value={fmt(defib8, 0)} />
              <ShockRow label="10 J/kg" value={fmt(defib10, 0)} />
            </div>
          </DoseCard>
        </div>

        {/* ── L: Laryngeal / Airway Sizing (full-width) ── */}
        <DoseCard
          letter="L"
          title="Laryngeal / Airway Sizing"
          formula="Weight → SGA size · Age → ETT (mm ID)"
          color="violet"
          icon={<Wind className="w-5 h-5" />}
        >
          <div className="grid grid-cols-2 gap-3 mt-1">
            {/* SGA */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
              <p className="text-[10px] text-violet-500 font-medium uppercase tracking-wider mb-1">
                SGA (LMA) Size
              </p>
              <p className="text-4xl font-black text-violet-300 tabular-nums leading-none">
                {sgaSize ?? "–"}
              </p>
              <p className="text-[10px] text-violet-600 leading-snug mt-2">
                ≤5 kg → 1 · 5–12 → 1.5
                <br />
                10–25 → 2 · 25–35 → 2.5
              </p>
            </div>

            {/* ETT */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
              <p className="text-[10px] text-violet-500 font-medium uppercase tracking-wider mb-1">
                ETT (mm ID)
              </p>
              {ettUncuffed != null ? (
                <div className="space-y-1.5">
                  <div>
                    <p className="text-[9px] text-violet-600 leading-none">
                      Uncuffed
                    </p>
                    <p className="text-2xl font-black text-violet-300 tabular-nums leading-tight">
                      {fmt(ettUncuffed, 1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-violet-600 leading-none">
                      Cuffed
                    </p>
                    <p className="text-2xl font-black text-violet-300 tabular-nums leading-tight">
                      {fmt(ettCuffed, 1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-violet-600 leading-none">
                      Depth at lip
                    </p>
                    <p className="text-base font-bold text-violet-300 tabular-nums">
                      {fmt(ettDepth, 1)} cm
                    </p>
                  </div>
                </div>
              ) : isInfant ? (
                <div>
                  <p className="text-2xl font-black text-violet-300 tabular-nums leading-tight">
                    3.0–3.5
                  </p>
                  <p className="text-[10px] text-violet-600 mt-1">
                    uncuffed (infant)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-16">
                  <p className="text-[10px] text-violet-700 text-center leading-relaxed">
                    Enter age ≥ 1y
                    <br />
                    for ETT sizing
                  </p>
                </div>
              )}
              <p className="text-[9px] text-violet-700 leading-snug mt-2">
                (age÷4)+4 / +3.5 · depth (age÷2)+12
              </p>
            </div>
          </div>
        </DoseCard>

        {/* ── Dose Cards: S S ── */}
        <div className="grid grid-cols-2 gap-3">
          <DoseCard
            letter="S"
            title="Sugar (Dextrose 10%)"
            formula="2.5 mL/kg IV/IO"
            color="yellow"
            icon={<Droplets className="w-5 h-5" />}
          >
            <BigValue value={fmt(dex10Vol, 1)} unit="mL" />
            <SmallValue value="D10W" unit="(10% dextrose)" />
          </DoseCard>

          <DoseCard
            letter="S"
            title="Target SBP"
            formula="(age × 2) + 70 mmHg"
            color="rose"
            icon={<Activity className="w-5 h-5" />}
          >
            <BigValue
              value={hasAge ? `≥ ${sbp}` : "–"}
              unit={hasAge ? "mmHg" : ""}
            />
          </DoseCard>
        </div>

        {/* ── WAAFELSS Mnemonic ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
            WAAFELSS Mnemonic
          </p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {(
              [
                ["W", "Weight", false],
                ["A", "Airway", false],
                ["A", "Adrenaline / Amiodarone", false],
                ["F", "Fluids", false],
                ["E", "Energy (Defib)", false],
                ["L", "Laryngeal (SGA & ETT sizing)", true],
                ["S", "Sugar (Dextrose)", false],
                ["S", "Systolic BP target", false],
              ] as [string, string, boolean][]
            ).map(([letter, label, isL], i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                    isL
                      ? "bg-violet-900/60 text-violet-400"
                      : "bg-emerald-900/60 text-emerald-400"
                  }`}
                >
                  {letter}
                </span>
                <span
                  className={`text-xs ${isL ? "text-violet-300" : "text-slate-300"}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <Heart className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Cross-check all doses against your HMCAS CPG v2.5, resuscitation
            chart, and clinical judgement. Do NOT terminate paediatric
            resuscitation in the field — transport to hospital.
          </p>
        </div>
      </main>

      {/* ── Sticky Bottom Bar ── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Active weight
            </p>
            <p className="text-lg font-bold text-white tabular-nums">
              {weight != null ? `~${fmt(weight)} kg` : "Enter age or weight"}
            </p>
          </div>
          {weight != null && (
            <>
              <div className="text-right">
                <p className="text-[10px] text-slate-500">Adrenaline</p>
                <p className="text-base font-bold text-emerald-400 tabular-nums">
                  {fmt(adrMl, 1)} mL
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500">1st Shock</p>
                <p className="text-base font-bold text-amber-400 tabular-nums">
                  {fmt(defib4, 0)} J
                </p>
              </div>
              {sgaSize && (
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">SGA</p>
                  <p className="text-base font-bold text-violet-400 tabular-nums">
                    {sgaSize}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type DoseCardProps = {
  letter: string;
  title: string;
  formula: string;
  color: ColorKey;
  icon: React.ReactNode;
  children: React.ReactNode;
};

function DoseCard({
  letter,
  title,
  formula,
  color,
  icon,
  children,
}: DoseCardProps) {
  const s = COLOR_STYLES[color];
  return (
    <div className={`rounded-2xl border ${s.border} bg-slate-900 p-4 space-y-2`}>
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold uppercase tracking-widest ${s.accent}`}
          >
            {letter}
          </p>
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {title}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-slate-500">{formula}</p>
      <div>{children}</div>
    </div>
  );
}

function BigValue({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-white tabular-nums">
        {value}
      </span>
      {unit && <span className="text-xs text-slate-400">{unit}</span>}
    </div>
  );
}

function SmallValue({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex items-baseline gap-1 mt-0.5">
      <span className="text-sm font-semibold text-slate-300 tabular-nums">
        {value}
      </span>
      <span className="text-[10px] text-slate-500">{unit}</span>
    </div>
  );
}

function ShockRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-800 px-2 py-1.5 text-center">
      <p className="text-[9px] text-slate-500 leading-none">{label}</p>
      <p className="text-sm font-bold text-white tabular-nums mt-0.5">
        {value}{" "}
        <span className="text-[10px] font-normal text-slate-400">J</span>
      </p>
    </div>
  );
}
