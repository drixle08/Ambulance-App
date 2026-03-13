"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Flame,
  RotateCcw,
  Plus,
  Minus,
  Wind,
  Zap,
  Check,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Region = {
  id: string;
  label: string;
  sublabel?: string;
  adultPct: number;
  paedsPct: number;
  span?: "full"; // col-span-2
};

const REGIONS: Region[] = [
  { id: "head",      label: "Head & Neck",           adultPct: 9,  paedsPct: 18, span: "full", sublabel: "Paeds: 18%" },
  { id: "chest",     label: "Anterior Torso",         sublabel: "chest / abdomen", adultPct: 18, paedsPct: 18 },
  { id: "back",      label: "Posterior Torso",        sublabel: "back / buttocks",  adultPct: 18, paedsPct: 18 },
  { id: "arm-left",  label: "Left Arm",               adultPct: 9,  paedsPct: 9 },
  { id: "arm-right", label: "Right Arm",              adultPct: 9,  paedsPct: 9 },
  { id: "leg-left",  label: "Left Leg",               sublabel: "Paeds: 14%", adultPct: 18, paedsPct: 14 },
  { id: "leg-right", label: "Right Leg",              sublabel: "Paeds: 14%", adultPct: 18, paedsPct: 14 },
  { id: "perineum",  label: "Perineum",               adultPct: 1,  paedsPct: 1,  span: "full" },
];

type AgeBand = "adult" | "paeds";

// ─── Region button ─────────────────────────────────────────────────────────────

function RegionButton({
  region,
  ageBand,
  checked,
  onToggle,
}: {
  region: Region;
  ageBand: AgeBand;
  checked: boolean;
  onToggle: () => void;
}) {
  const pct = ageBand === "adult" ? region.adultPct : region.paedsPct;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl border py-4 text-center transition-all active:scale-[0.97] ${
        region.span === "full" ? "col-span-2" : ""
      } ${
        checked
          ? "border-orange-500/70 bg-orange-500/15 text-orange-100"
          : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
      }`}
    >
      {/* Checked indicator */}
      {checked && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/30 border border-orange-400/60">
          <Check className="h-3 w-3 text-orange-300" />
        </span>
      )}

      {/* Percentage — big and prominent */}
      <span className={`text-2xl font-bold tabular-nums ${checked ? "text-orange-300" : "text-slate-400"}`}>
        {pct}%
      </span>

      {/* Label */}
      <span className="text-xs font-semibold leading-tight px-2">
        {region.label}
      </span>

      {/* Sublabel (paeds diff or region detail) */}
      {region.sublabel && (
        <span className="text-[0.62rem] text-slate-500 leading-tight px-2">
          {ageBand === "paeds" && region.id === "head" ? "Paeds ↑" :
           ageBand === "paeds" && (region.id === "leg-left" || region.id === "leg-right") ? "Paeds ↓" :
           region.sublabel.startsWith("Paeds") ? "" : region.sublabel}
        </span>
      )}
    </button>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function BurnsToolPage() {
  const [ageBand, setAgeBand] = useState<AgeBand>("adult");
  const [selected, setSelected] = useState<string[]>([]);
  const [palmCount, setPalmCount] = useState(0);
  const [airwayRisk, setAirwayRisk] = useState(false);
  const [electrical, setElectrical] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const resetAll = () => {
    setSelected([]);
    setPalmCount(0);
    setAirwayRisk(false);
    setElectrical(false);
  };

  const totalBsa = useMemo(() => {
    const regionSum = selected.reduce((sum, id) => {
      const r = REGIONS.find((r) => r.id === id);
      return sum + (r ? (ageBand === "adult" ? r.adultPct : r.paedsPct) : 0);
    }, 0);
    return Math.min(regionSum + palmCount, 100);
  }, [selected, palmCount, ageBand]);

  const threshold = ageBand === "adult" ? 20 : 10;
  const meetsThreshold = totalBsa >= threshold;

  // Outcome bar style
  const outcomeStyle = meetsThreshold
    ? { bar: "border-orange-500/60 bg-orange-950/60", pct: "text-orange-300", badge: "bg-orange-500/20 text-orange-200 border-orange-500/40", label: "MAJOR BURN" }
    : totalBsa > 0
    ? { bar: "border-amber-700/40 bg-amber-950/40", pct: "text-amber-300", badge: "bg-amber-500/15 text-amber-300 border-amber-600/40", label: "Below threshold" }
    : { bar: "border-slate-700 bg-slate-900/80", pct: "text-slate-300", badge: "bg-slate-800 text-slate-400 border-slate-700", label: "No regions selected" };

  // Summary for copy
  const summaryLines: string[] = [];
  summaryLines.push(
    `Burn surface area (CPG 10.9): ${totalBsa}% TBSA (${ageBand === "adult" ? "adult" : "paediatric"} rule of nines).`
  );
  summaryLines.push(
    selected.length
      ? `Regions: ${selected.map((id) => REGIONS.find((r) => r.id === id)?.label || id).join(", ")}${palmCount ? `; plus ${palmCount} palm%` : ""}.`
      : `Regions: none selected${palmCount ? `; plus ${palmCount} palm%` : ""}.`
  );
  if (airwayRisk) summaryLines.push("Airway/inhalation risk noted — consider early airway management.");
  if (electrical) summaryLines.push("Electrical burn / mixed mechanism noted — monitor ECG, consider deeper injury.");
  summaryLines.push(
    meetsThreshold
      ? `Meets major burn threshold (≥${threshold}% TBSA); follow CPG 10.9 for CCD notification, destination, and fluid guidance.`
      : `Below major burn threshold (<${threshold}% TBSA); manage per CPG 10.9 and clinical judgement.`
  );
  const summaryText = summaryLines.join(" ");

  // Progress bar width capped at 100%
  const progressPct = Math.min((totalBsa / threshold) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-36">

      {/* ── Sticky header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard/trauma"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-orange-400">
              Trauma · CPG 10.9
            </p>
            <h1 className="text-sm font-semibold leading-tight text-slate-50">
              Burn Surface Area Calculator
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {totalBsa > 0 && (
              <span className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-bold ${outcomeStyle.badge}`}>
                {totalBsa}% TBSA
              </span>
            )}
            <button
              type="button"
              onClick={resetAll}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              aria-label="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pt-4">

        {/* ── Age band selector ─────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-2">
          {(["adult", "paeds"] as AgeBand[]).map((band) => (
            <button
              key={band}
              type="button"
              onClick={() => { setAgeBand(band); setSelected([]); }}
              className={`flex flex-col items-center gap-0.5 rounded-2xl border py-3 text-sm font-semibold transition-all ${
                ageBand === band
                  ? "border-orange-500/60 bg-orange-500/10 text-orange-200"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="text-base">{band === "adult" ? "🧑" : "👶"}</span>
              <span>{band === "adult" ? "Adult" : "Paediatric"}</span>
              <span className="text-[0.65rem] font-normal text-slate-500">
                {band === "adult" ? "threshold ≥20% TBSA" : "threshold ≥10% TBSA · <~10 y"}
              </span>
            </button>
          ))}
        </section>

        {/* ── Rule of nines note ───────────────────────────────────── */}
        <p className="text-[0.68rem] text-slate-500 text-center -mt-2">
          Tap burned body regions · palm method adds 1% per patient palm
        </p>

        {/* ── Body region grid ─────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-2">
          {REGIONS.map((region) => (
            <RegionButton
              key={region.id}
              region={region}
              ageBand={ageBand}
              checked={selected.includes(region.id)}
              onToggle={() => toggle(region.id)}
            />
          ))}
        </section>

        {/* ── Palm method stepper ──────────────────────────────────── */}
        <section className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-200">Palm method</p>
            <p className="text-[0.68rem] text-slate-500">1% TBSA per patient palm (incl. fingers)</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPalmCount((n) => Math.max(0, n - 1))}
              disabled={palmCount === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-xl font-bold tabular-nums text-orange-300">
              {palmCount}
            </span>
            <button
              type="button"
              onClick={() => setPalmCount((n) => Math.min(30, n + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:border-slate-500"
            >
              <Plus className="h-4 w-4" />
            </button>
            {palmCount > 0 && (
              <span className="text-xs font-semibold text-orange-400">+{palmCount}%</span>
            )}
          </div>
        </section>

        {/* ── Special flags ────────────────────────────────────────── */}
        <section className="space-y-1.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500 px-1">
            Special considerations
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAirwayRisk((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-all ${
                airwayRisk
                  ? "border-sky-500/60 bg-sky-500/10 text-sky-200"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Wind className={`h-4 w-4 shrink-0 ${airwayRisk ? "text-sky-400" : "text-slate-600"}`} />
              <span>Airway / Inhalation risk</span>
              {airwayRisk && <Check className="ml-auto h-3.5 w-3.5 text-sky-400" />}
            </button>
            <button
              type="button"
              onClick={() => setElectrical((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-all ${
                electrical
                  ? "border-yellow-500/60 bg-yellow-500/10 text-yellow-200"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Zap className={`h-4 w-4 shrink-0 ${electrical ? "text-yellow-400" : "text-slate-600"}`} />
              <span>Electrical / Mixed mechanism</span>
              {electrical && <Check className="ml-auto h-3.5 w-3.5 text-yellow-400" />}
            </button>
          </div>
        </section>

        {/* ── Quick reference ──────────────────────────────────────── */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-[0.7rem] text-slate-400 space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Key actions (CPG 10.9)
          </p>
          <p>Stop burning process · cool with tepid water (no ice) · remove constricting items</p>
          <p>Assess airway early: facial/neck burns, soot, hoarseness, singed hairs</p>
          <p>Analgesia · warmth · glucose · monitor circumferential chest/limb burns (eschar risk)</p>
          <p>Contact CCD early for destination and fluid guidance</p>
        </section>

      </main>

      {/* ── Sticky outcome bar ───────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800">
        <div className={`mx-auto max-w-2xl rounded-2xl border px-4 py-3 transition-colors ${outcomeStyle.bar}`}>
          {/* Progress bar */}
          <div className="mb-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${meetsThreshold ? "bg-orange-500" : "bg-amber-500"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold tabular-nums ${outcomeStyle.pct}`}>
                  {totalBsa}
                </span>
                <span className="text-sm text-slate-400">% TBSA</span>
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold ${outcomeStyle.pct}`}>{outcomeStyle.label}</p>
                <p className="text-[0.65rem] text-slate-500">
                  threshold: {ageBand === "adult" ? "≥20%" : "≥10%"} · {ageBand}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(airwayRisk || electrical) && (
                <div className="flex gap-1">
                  {airwayRisk && <Wind className="h-4 w-4 text-sky-400" />}
                  {electrical && <Zap className="h-4 w-4 text-yellow-400" />}
                </div>
              )}
              <Flame className={`h-4 w-4 ${meetsThreshold ? "text-orange-400" : "text-slate-600"}`} />
              <CopySummaryButton summaryText={summaryText} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
