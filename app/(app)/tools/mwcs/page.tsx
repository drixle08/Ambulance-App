"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  RotateCcw,
  Brain,
  Activity,
  Volume2,
  Stethoscope,
  Layers,
  AlertTriangle,
} from "lucide-react";

// ─── Scoring ─────────────────────────────────────────────────────────────────

type LOCOption = "normal" | "disoriented";
type CyanosisOption = "none" | "with-agitation" | "at-rest";
type StridorOption = "none" | "with-agitation" | "at-rest";
type AirEntryOption = "normal" | "decreased" | "markedly-decreased";
type RetractionOption = "none" | "mild" | "moderate" | "severe";

type SeverityBand = "none" | "mild" | "moderate" | "severe" | "impending";

const locScore: Record<LOCOption, number> = { normal: 0, disoriented: 5 };
const cyanosisScore: Record<CyanosisOption, number> = {
  none: 0,
  "with-agitation": 4,
  "at-rest": 5,
};
const stridorScore: Record<StridorOption, number> = {
  none: 0,
  "with-agitation": 1,
  "at-rest": 2,
};
const airEntryScore: Record<AirEntryOption, number> = {
  normal: 0,
  decreased: 1,
  "markedly-decreased": 2,
};
const retractionsScore: Record<RetractionOption, number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

function getSeverityBand(total: number): SeverityBand {
  if (total <= 0) return "none";
  if (total <= 2) return "mild";
  if (total <= 5) return "moderate";
  if (total <= 11) return "severe";
  return "impending";
}

// ─── Styles ──────────────────────────────────────────────────────────────────

type BandStyle = {
  label: string;
  range: string;
  border: string;
  bg: string;
  text: string;
  bar: string;
};

const BAND_STYLES: Record<SeverityBand, BandStyle> = {
  none: {
    label: "No features",
    range: "0",
    border: "border-slate-700",
    bg: "bg-slate-900",
    text: "text-slate-400",
    bar: "bg-slate-600",
  },
  mild: {
    label: "Mild Croup",
    range: "1–2",
    border: "border-emerald-700",
    bg: "bg-emerald-950/70",
    text: "text-emerald-300",
    bar: "bg-emerald-500",
  },
  moderate: {
    label: "Moderate Croup",
    range: "3–5",
    border: "border-amber-700",
    bg: "bg-amber-950/70",
    text: "text-amber-300",
    bar: "bg-amber-500",
  },
  severe: {
    label: "Severe Croup",
    range: "6–11",
    border: "border-orange-700",
    bg: "bg-orange-950/70",
    text: "text-orange-300",
    bar: "bg-orange-500",
  },
  impending: {
    label: "Impending Resp. Failure",
    range: "≥ 12",
    border: "border-rose-700",
    bg: "bg-rose-950/70",
    text: "text-rose-300",
    bar: "bg-rose-500",
  },
};

// Point badge colour based on score value
function ptColor(pts: number): string {
  if (pts === 0) return "bg-slate-700 text-slate-400";
  if (pts <= 2) return "bg-emerald-900/80 text-emerald-300";
  if (pts <= 4) return "bg-amber-900/80 text-amber-300";
  return "bg-rose-900/80 text-rose-300";
}

const ACTIONS: Record<SeverityBand, string[]> = {
  none: [
    "Reassess diagnosis — consider alternative causes of stridor.",
    "Monitor WOB, RR, SpO₂. Follow CPG if croup still suspected.",
  ],
  mild: [
    "Steroid (e.g. oral dexamethasone) per CPG dose chart.",
    "Observe for progression. Caregiver education and safety-net advice.",
    "Transport or discharge per CPG criteria and Clinical Coordination.",
  ],
  moderate: [
    "Steroid + consider nebulised adrenaline per CPG.",
    "Monitor closely: RR, WOB, stridor at rest, mental state.",
    "Transport to ED. Prenotify if requiring repeated nebulised adrenaline.",
  ],
  severe: [
    "Time-critical: nebulised adrenaline + steroid immediately per CPG.",
    "Position of comfort. Minimise distress. Titrate O₂ if hypoxic.",
    "Priority transport with prenotification. Consider CCP/anaesthetics.",
  ],
  impending: [
    "Impending failure: urgent nebulised adrenaline + advanced airway planning.",
    "Prepare for RSI / advanced airway (CCP/ED/anaesthetics) per CPG.",
    "Priority 1 transport + immediate prenotification + Clinical Coordination.",
  ],
};

const BLURB: Record<SeverityBand, string> = {
  none: "No clear croup features. Correlate with history, barking cough and respiratory exam.",
  mild: "Barking cough with minimal distress. Steroids; observe for deterioration.",
  moderate: "Increased WOB and stridor. Steroids + consider nebulised adrenaline. Transport to ED.",
  severe: "Marked distress — stridor at rest, significant retractions, or altered mentation. Time-critical.",
  impending: "Features of respiratory failure. Time-critical transfer; prepare for advanced airway.",
};

const MAX_SCORE = 17;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MwcsPage() {
  const [loc, setLoc] = useState<LOCOption>("normal");
  const [cyanosis, setCyanosis] = useState<CyanosisOption>("none");
  const [stridor, setStridor] = useState<StridorOption>("none");
  const [airEntry, setAirEntry] = useState<AirEntryOption>("normal");
  const [retractions, setRetractions] = useState<RetractionOption>("none");

  const locPts = locScore[loc];
  const cyanPts = cyanosisScore[cyanosis];
  const stridPts = stridorScore[stridor];
  const airPts = airEntryScore[airEntry];
  const retPts = retractionsScore[retractions];
  const total = locPts + cyanPts + stridPts + airPts + retPts;

  const band = getSeverityBand(total);
  const bs = BAND_STYLES[band];

  const barWidth = `${Math.min(100, (total / MAX_SCORE) * 100)}%`;

  function handleReset() {
    setLoc("normal");
    setCyanosis("none");
    setStridor("none");
    setAirEntry("normal");
    setRetractions("none");
  }

  const summaryText =
    `MWCS: ${total}/17 — ${bs.label}. ` +
    `LOC: ${loc} (${locPts}pt), cyanosis: ${cyanosis} (${cyanPts}pt), ` +
    `stridor: ${stridor} (${stridPts}pt), air entry: ${airEntry} (${airPts}pt), ` +
    `retractions: ${retractions} (${retPts}pt). Actions: ${ACTIONS[band][0]}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-52">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/respiratory-airway"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400">
              Paediatric Respiratory
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              MWCS — Modified Westley Croup Score
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-3">
        {/* ── Score Bar ── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Running score
              </p>
              <p className="text-3xl font-bold text-white tabular-nums leading-none">
                {total}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  / {MAX_SCORE}
                </span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>LOC {locPts} + Cyan {cyanPts} + Strid {stridPts}</p>
              <p>Air {airPts} + Ret {retPts}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${bs.bar}`}
              style={{ width: barWidth }}
            />
          </div>
          {/* Scale labels */}
          <div className="flex justify-between text-[9px] text-slate-600">
            <span>0 — None</span>
            <span>1–2 Mild</span>
            <span>3–5 Mod</span>
            <span>6–11 Severe</span>
            <span>≥12 Impending</span>
          </div>
        </div>

        {/* ── LOC ── */}
        <ScoreRow
          label="Level of Consciousness"
          icon={<Brain className="w-4 h-4 text-sky-400" />}
          options={[
            { id: "normal", label: "Normal / alert", pts: locScore.normal },
            {
              id: "disoriented",
              label: "Disoriented / ↓ LOC",
              pts: locScore.disoriented,
            },
          ]}
          value={loc}
          onChange={(v) => setLoc(v as LOCOption)}
          columns={2}
        />

        {/* ── Cyanosis ── */}
        <ScoreRow
          label="Cyanosis"
          icon={<Activity className="w-4 h-4 text-sky-400" />}
          options={[
            { id: "none", label: "None", pts: cyanosisScore.none },
            {
              id: "with-agitation",
              label: "With agitation",
              pts: cyanosisScore["with-agitation"],
            },
            {
              id: "at-rest",
              label: "At rest",
              pts: cyanosisScore["at-rest"],
            },
          ]}
          value={cyanosis}
          onChange={(v) => setCyanosis(v as CyanosisOption)}
        />

        {/* ── Stridor ── */}
        <ScoreRow
          label="Stridor"
          icon={<Volume2 className="w-4 h-4 text-sky-400" />}
          options={[
            { id: "none", label: "None", pts: stridorScore.none },
            {
              id: "with-agitation",
              label: "With agitation",
              pts: stridorScore["with-agitation"],
            },
            { id: "at-rest", label: "At rest", pts: stridorScore["at-rest"] },
          ]}
          value={stridor}
          onChange={(v) => setStridor(v as StridorOption)}
        />

        {/* ── Air Entry ── */}
        <ScoreRow
          label="Air Entry"
          icon={<Stethoscope className="w-4 h-4 text-sky-400" />}
          options={[
            { id: "normal", label: "Normal", pts: airEntryScore.normal },
            {
              id: "decreased",
              label: "Decreased",
              pts: airEntryScore.decreased,
            },
            {
              id: "markedly-decreased",
              label: "Markedly ↓",
              pts: airEntryScore["markedly-decreased"],
            },
          ]}
          value={airEntry}
          onChange={(v) => setAirEntry(v as AirEntryOption)}
        />

        {/* ── Retractions ── */}
        <ScoreRow
          label="Chest Wall Retractions"
          icon={<Layers className="w-4 h-4 text-sky-400" />}
          options={[
            { id: "none", label: "None", pts: retractionsScore.none },
            { id: "mild", label: "Mild", pts: retractionsScore.mild },
            {
              id: "moderate",
              label: "Moderate",
              pts: retractionsScore.moderate,
            },
            { id: "severe", label: "Severe", pts: retractionsScore.severe },
          ]}
          value={retractions}
          onChange={(v) => setRetractions(v as RetractionOption)}
          columns={4}
        />

        {/* ── Reference ── */}
        <p className="text-[10px] text-slate-600 pb-2">
          CPG 5.3 Croup — total possible 0–17. Always follow CPG 5.3 for management decisions.
        </p>
      </main>

      {/* ── Sticky Outcome Bar ── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 space-y-2">
          {/* Band header */}
          <div className={`rounded-xl border p-3 space-y-2 ${bs.border} ${bs.bg}`}>
            <div className="flex items-center gap-3">
              {band === "impending" && (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <div className="flex-1 flex items-baseline gap-3">
                <span className={`text-lg font-bold ${bs.text}`}>
                  {bs.label}
                </span>
                <span className="text-xs text-slate-500">
                  Score {total} — range {bs.range}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">{BLURB[band]}</p>
            <ul className="space-y-0.5">
              {ACTIONS[band].map((a, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 text-[11px] text-slate-300 leading-snug"
                >
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${bs.bar}`}
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

type ScoreOption = { id: string; label: string; pts: number };

type ScoreRowProps = {
  label: string;
  icon: React.ReactNode;
  options: ScoreOption[];
  value: string;
  onChange: (v: string) => void;
  columns?: 2 | 3 | 4;
};

function ScoreRow({
  label,
  icon,
  options,
  value,
  onChange,
  columns = 3,
}: ScoreRowProps) {
  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
      ? "grid-cols-4"
      : "grid-cols-3";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <div className={`grid gap-2 ${colClass}`}>
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-xl border p-2.5 text-center transition-colors active:scale-95 ${
                selected
                  ? "border-sky-500/70 bg-sky-950/50"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              {/* Point badge */}
              <div className="flex justify-center mb-1.5">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    selected ? "bg-sky-800 text-sky-200" : ptColor(opt.pts)
                  }`}
                >
                  {opt.pts} pt{opt.pts !== 1 ? "s" : ""}
                </span>
              </div>
              <p
                className={`text-xs font-medium leading-snug ${
                  selected ? "text-white" : "text-slate-400"
                }`}
              >
                {opt.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
