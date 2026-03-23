"use client";

import { useState } from "react";
import { ArrowLeft, FlaskConical, ChevronDown, ChevronUp, Calculator } from "lucide-react";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type ModeType =
  | "mcg/kg/min"
  | "mcg/kg/h"
  | "mg/kg/min"
  | "mg/kg"
  | "mcg/min"
  | "mg"
  | "g"
  | "push_mcg";

interface DoseMode {
  id: string;
  label: string;
  description: string;
  type: ModeType;
  doseMin: number;
  doseMax: number;
  doseDefault: number;
  doseStep: number;
  concMcgMl: number;
  concLabel: string;
  mixInstructions: string;
  infusionMinutes?: number;
  variableDuration?: true;
  durationMin?: number;
  durationMax?: number;
  durationDefault?: number;
  note?: string;
}

interface Drug {
  id: string;
  name: string;
  subtitle: string;
  colorKey: string;
  reference: string;
  modes: DoseMode[];
}

/* ════════════════════════════════════════════════════════════
   DRUG DATA
════════════════════════════════════════════════════════════ */
const DRUGS: Drug[] = [
  {
    id: "adrenaline",
    name: "Adrenaline",
    subtitle: "Vasopressor / Inotrope",
    colorKey: "red",
    reference: "CPG Vasopressors",
    modes: [
      {
        id: "infusion",
        label: "Infusion",
        description: "0.05 – 0.3 mcg/kg/min",
        type: "mcg/kg/min",
        doseMin: 0.05,
        doseMax: 0.3,
        doseDefault: 0.1,
        doseStep: 0.01,
        concMcgMl: 10,
        concLabel: "10 mcg/mL",
        mixInstructions: "1 mg (1 mL of 1 mg/mL) + 99 mL NaCl 0.9% → 100 mL @ 10 mcg/mL",
      },
      {
        id: "push",
        label: "Push / Rescue Dose",
        description: "20 – 50 mcg bolus",
        type: "push_mcg",
        doseMin: 20,
        doseMax: 50,
        doseDefault: 20,
        doseStep: 5,
        concMcgMl: 10,
        concLabel: "10 mcg/mL",
        mixInstructions: "Draw from prepared adrenaline infusion bag (10 mcg/mL)",
        note: "Administer 2 – 5 mL IV for periarrest hypotension",
      },
    ],
  },
  {
    id: "amiodarone",
    name: "Amiodarone",
    subtitle: "Antiarrhythmic",
    colorKey: "amber",
    reference: "CPG Arrhythmias",
    modes: [
      {
        id: "adult",
        label: "Adult Loading",
        description: "300 mg over 15 min",
        type: "mg",
        doseMin: 300,
        doseMax: 300,
        doseDefault: 300,
        doseStep: 50,
        concMcgMl: 6000,
        concLabel: "6 mg/mL (300 mg in 50 mL D5W)",
        mixInstructions: "300 mg (6 mL of 50 mg/mL amp) + 44 mL D5W → 50 mL @ 6 mg/mL",
        infusionMinutes: 15,
        note: "200 mL/h for 15 min",
      },
      {
        id: "paeds",
        label: "Paediatric",
        description: "5 mg/kg over 20 – 60 min",
        type: "mg/kg",
        doseMin: 5,
        doseMax: 5,
        doseDefault: 5,
        doseStep: 1,
        concMcgMl: 6000,
        concLabel: "6 mg/mL",
        mixInstructions: "Dilute 5 mg/kg in D5W to achieve 6 mg/mL concentration",
        variableDuration: true,
        durationMin: 20,
        durationMax: 60,
        durationDefault: 30,
        note: "Typically 30 min; shorten if haemodynamically unstable",
      },
    ],
  },
  {
    id: "fentanyl",
    name: "Fentanyl",
    subtitle: "Opioid — Analgesia / Sedation",
    colorKey: "violet",
    reference: "CPG Pain Management",
    modes: [
      {
        id: "infusion",
        label: "Infusion",
        description: "1 – 10 mcg/kg/h",
        type: "mcg/kg/h",
        doseMin: 1,
        doseMax: 10,
        doseDefault: 2,
        doseStep: 0.5,
        concMcgMl: 10,
        concLabel: "10 mcg/mL",
        mixInstructions: "200 mcg (4 mL of 50 mcg/mL) + 16 mL NaCl 0.9% → 20 mL @ 10 mcg/mL",
      },
    ],
  },
  {
    id: "gtn",
    name: "GTN",
    subtitle: "Glyceryl Trinitrate — Vasodilator",
    colorKey: "sky",
    reference: "CPG APO / ACS",
    modes: [
      {
        id: "apo-high",
        label: "APO  BP > 200",
        description: "400 – 500 mcg/min × 2 min",
        type: "mcg/min",
        doseMin: 400,
        doseMax: 500,
        doseDefault: 400,
        doseStep: 50,
        concMcgMl: 1000,
        concLabel: "1 mg/mL = 1000 mcg/mL",
        mixInstructions: "Standard GTN 1 mg/mL — use undiluted",
        note: "Run at this rate for 2 min only, then switch to APO 160–200 mode",
      },
      {
        id: "apo-mod",
        label: "APO  BP 160–200",
        description: "100 – 300 mcg/min",
        type: "mcg/min",
        doseMin: 100,
        doseMax: 300,
        doseDefault: 150,
        doseStep: 50,
        concMcgMl: 1000,
        concLabel: "1 mg/mL = 1000 mcg/mL",
        mixInstructions: "Standard GTN 1 mg/mL — use undiluted",
      },
      {
        id: "acs",
        label: "ACS",
        description: "5 – 20 mcg/min",
        type: "mcg/min",
        doseMin: 5,
        doseMax: 20,
        doseDefault: 5,
        doseStep: 1,
        concMcgMl: 1000,
        concLabel: "1 mg/mL = 1000 mcg/mL",
        mixInstructions: "Standard GTN 1 mg/mL — use undiluted",
        note: "Start 5 mcg/min; titrate by 5 mcg/min every 3 – 5 min to pain/BP",
      },
    ],
  },
  {
    id: "ketamine",
    name: "Ketamine",
    subtitle: "Dissociative — Analgesia / Sedation",
    colorKey: "orange",
    reference: "CPG Pain / Sedation",
    modes: [
      {
        id: "infusion",
        label: "Sub-dissociative Infusion",
        description: "0.01 – 0.05 mg/kg/min",
        type: "mg/kg/min",
        doseMin: 0.01,
        doseMax: 0.05,
        doseDefault: 0.02,
        doseStep: 0.005,
        concMcgMl: 10000,
        concLabel: "10 mg/mL",
        mixInstructions: "200 mg (4 mL of 50 mg/mL) + 16 mL NaCl 0.9% → 20 mL @ 10 mg/mL",
      },
    ],
  },
  {
    id: "mgso4",
    name: "Magnesium Sulphate",
    subtitle: "Electrolyte / Antiarrhythmic",
    colorKey: "teal",
    reference: "CPG Eclampsia / Asthma",
    modes: [
      {
        id: "bronch",
        label: "Bronchospasm / TdP",
        description: "2 g over 10 min",
        type: "g",
        doseMin: 2,
        doseMax: 2,
        doseDefault: 2,
        doseStep: 0.5,
        concMcgMl: 100000,
        concLabel: "100 mg/mL",
        mixInstructions: "2 g = 20 mL of 100 mg/mL MgSO4 — run undiluted",
        infusionMinutes: 10,
        note: "120 mL/h for 10 min",
      },
      {
        id: "eclampsia",
        label: "Eclampsia",
        description: "4 g over 10 min",
        type: "g",
        doseMin: 4,
        doseMax: 4,
        doseDefault: 4,
        doseStep: 0.5,
        concMcgMl: 100000,
        concLabel: "100 mg/mL",
        mixInstructions: "4 g = 40 mL of 100 mg/mL MgSO4 — run undiluted",
        infusionMinutes: 10,
        note: "240 mL/h for 10 min",
      },
      {
        id: "paeds",
        label: "Paediatric",
        description: "25 – 50 mg/kg over 20 min",
        type: "mg/kg",
        doseMin: 25,
        doseMax: 50,
        doseDefault: 25,
        doseStep: 5,
        concMcgMl: 100000,
        concLabel: "100 mg/mL",
        mixInstructions: "Draw 0.25 – 0.5 mL/kg of 100 mg/mL MgSO4",
        infusionMinutes: 20,
      },
    ],
  },
  {
    id: "noradrenaline",
    name: "Noradrenaline",
    subtitle: "Vasopressor",
    colorKey: "rose",
    reference: "CPG Vasopressors",
    modes: [
      {
        id: "infusion",
        label: "Infusion",
        description: "0.01 – 0.3 mcg/kg/min",
        type: "mcg/kg/min",
        doseMin: 0.01,
        doseMax: 0.3,
        doseDefault: 0.05,
        doseStep: 0.01,
        concMcgMl: 16,
        concLabel: "16 mcg/mL",
        mixInstructions: "2 × 4 mg ampoules (2 mL total) + 498 mL NaCl 0.9% → 500 mL @ 16 mcg/mL",
      },
    ],
  },
  {
    id: "phenylephrine",
    name: "Phenylephrine",
    subtitle: "Alpha-1 Vasopressor",
    colorKey: "blue",
    reference: "CPG Vasopressors",
    modes: [
      {
        id: "infusion",
        label: "Infusion",
        description: "50 – 200 mcg/min",
        type: "mcg/min",
        doseMin: 50,
        doseMax: 200,
        doseDefault: 100,
        doseStep: 25,
        concMcgMl: 100,
        concLabel: "100 mcg/mL",
        mixInstructions: "10 mg (1 mL of 10 mg/mL) + 99 mL NaCl 0.9% → 100 mL @ 100 mcg/mL",
        note: "Standard rate: 100 mcg/min = 60 mL/h",
      },
      {
        id: "push",
        label: "Push Dose",
        description: "25 – 100 mcg bolus",
        type: "push_mcg",
        doseMin: 25,
        doseMax: 100,
        doseDefault: 50,
        doseStep: 25,
        concMcgMl: 100,
        concLabel: "100 mcg/mL",
        mixInstructions: "Draw from prepared phenylephrine bag (100 mcg/mL)",
        note: "0.25 – 1 mL IV bolus; repeat as needed",
      },
    ],
  },
  {
    id: "txa",
    name: "Tranexamic Acid",
    subtitle: "TXA — Haemostatic",
    colorKey: "emerald",
    reference: "CPG Trauma",
    modes: [
      {
        id: "adult",
        label: "Adult",
        description: "1 g over 10 min",
        type: "g",
        doseMin: 1,
        doseMax: 1,
        doseDefault: 1,
        doseStep: 0.5,
        concMcgMl: 10000,
        concLabel: "10 mg/mL (1 g in 100 mL)",
        mixInstructions: "1 g (10 mL of 100 mg/mL TXA) + 90 mL NaCl 0.9% → 100 mL @ 10 mg/mL",
        infusionMinutes: 10,
        note: "600 mL/h for 10 min",
      },
      {
        id: "paeds",
        label: "Paediatric",
        description: "15 mg/kg over 10 min",
        type: "mg/kg",
        doseMin: 15,
        doseMax: 15,
        doseDefault: 15,
        doseStep: 1,
        concMcgMl: 10000,
        concLabel: "10 mg/mL",
        mixInstructions: "Dilute 15 mg/kg in NaCl 0.9% to achieve 10 mg/mL concentration",
        infusionMinutes: 10,
      },
    ],
  },
];

/* ════════════════════════════════════════════════════════════
   COLOUR MAP  (all classes listed verbatim for Tailwind)
════════════════════════════════════════════════════════════ */
const CLR: Record<string, { card: string; border: string; label: string; badge: string; result: string; resultBorder: string; tab: string; tabActive: string }> = {
  red:     { card: "bg-red-950/30",     border: "border-red-800/50",     label: "text-red-400",     badge: "bg-red-900/50 text-red-300",     result: "bg-red-950/50",     resultBorder: "border-red-700/60",     tab: "hover:text-red-300",     tabActive: "text-red-300 border-b-2 border-red-500" },
  amber:   { card: "bg-amber-950/30",   border: "border-amber-800/50",   label: "text-amber-400",   badge: "bg-amber-900/50 text-amber-300",   result: "bg-amber-950/50",   resultBorder: "border-amber-700/60",   tab: "hover:text-amber-300",   tabActive: "text-amber-300 border-b-2 border-amber-500" },
  violet:  { card: "bg-violet-950/30",  border: "border-violet-800/50",  label: "text-violet-400",  badge: "bg-violet-900/50 text-violet-300",  result: "bg-violet-950/50",  resultBorder: "border-violet-700/60",  tab: "hover:text-violet-300",  tabActive: "text-violet-300 border-b-2 border-violet-500" },
  sky:     { card: "bg-sky-950/30",     border: "border-sky-800/50",     label: "text-sky-400",     badge: "bg-sky-900/50 text-sky-300",     result: "bg-sky-950/50",     resultBorder: "border-sky-700/60",     tab: "hover:text-sky-300",     tabActive: "text-sky-300 border-b-2 border-sky-500" },
  orange:  { card: "bg-orange-950/30",  border: "border-orange-800/50",  label: "text-orange-400",  badge: "bg-orange-900/50 text-orange-300",  result: "bg-orange-950/50",  resultBorder: "border-orange-700/60",  tab: "hover:text-orange-300",  tabActive: "text-orange-300 border-b-2 border-orange-500" },
  teal:    { card: "bg-teal-950/30",    border: "border-teal-800/50",    label: "text-teal-400",    badge: "bg-teal-900/50 text-teal-300",    result: "bg-teal-950/50",    resultBorder: "border-teal-700/60",    tab: "hover:text-teal-300",    tabActive: "text-teal-300 border-b-2 border-teal-500" },
  rose:    { card: "bg-rose-950/30",    border: "border-rose-800/50",    label: "text-rose-400",    badge: "bg-rose-900/50 text-rose-300",    result: "bg-rose-950/50",    resultBorder: "border-rose-700/60",    tab: "hover:text-rose-300",    tabActive: "text-rose-300 border-b-2 border-rose-500" },
  emerald: { card: "bg-emerald-950/30", border: "border-emerald-800/50", label: "text-emerald-400", badge: "bg-emerald-900/50 text-emerald-300", result: "bg-emerald-950/50", resultBorder: "border-emerald-700/60", tab: "hover:text-emerald-300", tabActive: "text-emerald-300 border-b-2 border-emerald-500" },
  blue:    { card: "bg-blue-950/30",    border: "border-blue-800/50",    label: "text-blue-400",    badge: "bg-blue-900/50 text-blue-300",    result: "bg-blue-950/50",    resultBorder: "border-blue-700/60",    tab: "hover:text-blue-300",    tabActive: "text-blue-300 border-b-2 border-blue-500" },
};

/* ════════════════════════════════════════════════════════════
   CALCULATION ENGINE
════════════════════════════════════════════════════════════ */
function fmtNum(n: number, dp = 1): string {
  if (!isFinite(n) || n < 0) return "—";
  const r = parseFloat(n.toFixed(dp));
  return r === Math.floor(r) ? Math.floor(r).toString() : r.toFixed(dp);
}

interface CalcResult {
  kind: "infusion" | "fixed" | "push";
  flowRateMlH?: number;
  volumeMl?: number;
  totalDoseMg?: number;
  durationMin?: number;
  dripsPerMin?: number;
  formula: string;
}

function doCalc(mode: DoseMode, dose: number, weight: number, durMin: number): CalcResult {
  const dur = mode.variableDuration ? durMin : (mode.infusionMinutes ?? 60);
  const c = mode.concMcgMl;

  const withDrip = (fr: number, formula: string, extras?: Partial<CalcResult>): CalcResult => ({
    kind: "infusion",
    flowRateMlH: fr,
    dripsPerMin: (fr * 20) / 60,
    formula,
    ...extras,
  });

  switch (mode.type) {
    case "mcg/kg/min": {
      const fr = (weight * dose * 60) / c;
      return withDrip(fr, `${weight} kg × ${dose} mcg/kg/min × 60 ÷ ${c} mcg/mL`);
    }
    case "mcg/kg/h": {
      const fr = (weight * dose) / c;
      return withDrip(fr, `${weight} kg × ${dose} mcg/kg/h ÷ ${c} mcg/mL`);
    }
    case "mg/kg/min": {
      const doseMcg = dose * 1000;
      const fr = (weight * doseMcg * 60) / c;
      return withDrip(fr, `${weight} kg × ${fmtNum(doseMcg, 0)} mcg/kg/min × 60 ÷ ${c} mcg/mL`);
    }
    case "mcg/min": {
      const fr = (dose * 60) / c;
      return withDrip(fr, `${dose} mcg/min × 60 ÷ ${c} mcg/mL`);
    }
    case "mg": {
      const vol = (dose * 1000) / c;
      const fr = (vol * 60) / dur;
      return { kind: "fixed", flowRateMlH: fr, volumeMl: vol, durationMin: dur, dripsPerMin: (fr * 20) / 60, formula: `${dose} mg → ${fmtNum(vol)} mL over ${dur} min` };
    }
    case "g": {
      const vol = (dose * 1_000_000) / c;
      const fr = (vol * 60) / dur;
      return { kind: "fixed", flowRateMlH: fr, volumeMl: vol, durationMin: dur, dripsPerMin: (fr * 20) / 60, formula: `${dose} g → ${fmtNum(vol)} mL over ${dur} min` };
    }
    case "mg/kg": {
      const totalMg = weight * dose;
      const vol = (totalMg * 1000) / c;
      const fr = (vol * 60) / dur;
      return { kind: "fixed", flowRateMlH: fr, volumeMl: vol, totalDoseMg: totalMg, durationMin: dur, dripsPerMin: (fr * 20) / 60, formula: `${weight} kg × ${dose} mg/kg = ${fmtNum(totalMg, 0)} mg → ${fmtNum(vol, 1)} mL over ${dur} min` };
    }
    case "push_mcg": {
      const vol = dose / c;
      return { kind: "push", volumeMl: vol, formula: `${dose} mcg ÷ ${c} mcg/mL` };
    }
  }
}

/* ════════════════════════════════════════════════════════════
   SHARED SLIDER COMPONENT
════════════════════════════════════════════════════════════ */
function SliderRow({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  accentClass,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accentClass: string;
}) {
  const dp = step < 0.1 ? 3 : step < 1 ? 1 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</span>
        <span className={`text-lg font-bold tabular-nums ${accentClass}`}>
          {fmtNum(value, dp)} <span className="text-xs font-normal text-slate-500">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-current"
      />
      <div className="flex justify-between text-[0.6rem] text-slate-600">
        <span>{fmtNum(min, dp)}</span>
        <span>{fmtNum(max, dp)}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DRUG CALCULATOR DETAIL VIEW
════════════════════════════════════════════════════════════ */
function DrugCalculator({ drug, onBack }: { drug: Drug; onBack: () => void }) {
  const clr = CLR[drug.colorKey] ?? CLR.emerald;
  const [modeIdx, setModeIdx] = useState(0);
  const [weight, setWeight] = useState(70);
  const [dose, setDose] = useState(() => drug.modes[0].doseDefault);
  const [duration, setDuration] = useState(() => drug.modes[0].durationDefault ?? 30);
  const [mixOpen, setMixOpen] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);

  const mode = drug.modes[modeIdx];
  const needsWeight =
    mode.type === "mcg/kg/min" ||
    mode.type === "mcg/kg/h" ||
    mode.type === "mg/kg/min" ||
    mode.type === "mg/kg";
  const isFixed = mode.doseMin === mode.doseMax;
  const result = doCalc(mode, dose, weight, duration);

  const handleModeChange = (idx: number) => {
    setModeIdx(idx);
    setDose(drug.modes[idx].doseDefault);
    setDuration(drug.modes[idx].durationDefault ?? 30);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 active:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className={`text-lg font-bold leading-tight ${clr.label}`}>{drug.name}</h2>
          <p className="text-xs text-slate-500">{drug.subtitle}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${clr.badge}`}>
          {drug.reference}
        </span>
      </div>

      {/* Mode tabs */}
      {drug.modes.length > 1 && (
        <div className="flex gap-0 border-b border-slate-800">
          {drug.modes.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(i)}
              className={`px-4 pb-2 pt-1.5 text-xs font-semibold transition-colors ${
                i === modeIdx ? clr.tabActive : `text-slate-500 ${clr.tab}`
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Mode description */}
      <p className="text-sm text-slate-400">{mode.description}</p>

      {/* Inputs */}
      <div className={`rounded-2xl border p-4 space-y-5 ${clr.card} ${clr.border}`}>
        {needsWeight && (
          <SliderRow
            label="Patient weight"
            unit="kg"
            value={weight}
            min={3}
            max={150}
            step={1}
            onChange={setWeight}
            accentClass={clr.label}
          />
        )}

        {!isFixed && (
          <SliderRow
            label={`Dose rate`}
            unit={mode.type === "push_mcg" ? "mcg" : mode.type}
            value={dose}
            min={mode.doseMin}
            max={mode.doseMax}
            step={mode.doseStep}
            onChange={setDose}
            accentClass={clr.label}
          />
        )}

        {isFixed && (
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Fixed Dose</span>
            <span className={`text-lg font-bold ${clr.label}`}>
              {mode.doseDefault}{" "}
              <span className="text-xs font-normal text-slate-500">{mode.type === "g" ? "g" : "mg"}</span>
            </span>
          </div>
        )}

        {mode.variableDuration && (
          <SliderRow
            label="Infusion duration"
            unit="min"
            value={duration}
            min={mode.durationMin ?? 20}
            max={mode.durationMax ?? 60}
            step={5}
            onChange={setDuration}
            accentClass={clr.label}
          />
        )}
      </div>

      {/* Results */}
      <div className={`rounded-2xl border p-4 space-y-3 ${clr.result} ${clr.resultBorder}`}>
        {result.kind === "push" ? (
          <div className="text-center py-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Volume to draw up</p>
            <p className={`text-4xl font-black tabular-nums ${clr.label}`}>
              {fmtNum(result.volumeMl ?? 0, 2)}
              <span className="text-lg font-normal text-slate-400 ml-1">mL</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">from {mode.concLabel} solution</p>
          </div>
        ) : (
          <>
            {result.kind === "fixed" && result.volumeMl !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {result.totalDoseMg !== undefined ? "Total dose" : "Volume"}
                </span>
                <span className="text-sm font-semibold text-slate-200 tabular-nums">
                  {result.totalDoseMg !== undefined
                    ? `${fmtNum(result.totalDoseMg, 0)} mg → ${fmtNum(result.volumeMl, 1)} mL`
                    : `${fmtNum(result.volumeMl, 1)} mL`}
                </span>
              </div>
            )}
            {result.kind === "fixed" && result.durationMin !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Duration</span>
                <span className="text-sm font-semibold text-slate-200">{result.durationMin} min</span>
              </div>
            )}
            <div className="pt-1 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Flow Rate</p>
              <p className={`text-5xl font-black tabular-nums ${clr.label}`}>
                {fmtNum(result.flowRateMlH ?? 0, 1)}
                <span className="text-xl font-normal text-slate-400 ml-1.5">mL/h</span>
              </p>
            </div>
            {result.dripsPerMin !== undefined && (
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Gravity set (20 gtt/mL)
                </span>
                <span className="text-sm font-semibold text-slate-300 tabular-nums">
                  {fmtNum(result.dripsPerMin, 0)} drops/min
                </span>
              </div>
            )}
          </>
        )}

        {/* Formula toggle */}
        <button
          type="button"
          onClick={() => setFormulaOpen((p) => !p)}
          className="flex w-full items-center justify-between pt-2 text-xs text-slate-600 hover:text-slate-400"
        >
          <span className="font-semibold uppercase tracking-widest">Formula</span>
          {formulaOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {formulaOpen && (
          <p className="rounded-lg bg-slate-900/60 px-3 py-2 font-mono text-xs text-slate-400 leading-relaxed">
            {result.formula} = <strong className={clr.label}>{fmtNum(result.flowRateMlH ?? result.volumeMl ?? 0, 2)}</strong>{" "}
            {result.kind === "push" ? "mL" : "mL/h"}
          </p>
        )}
      </div>

      {/* Mixing instructions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
        <button
          type="button"
          onClick={() => setMixOpen((p) => !p)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mixing Instructions</span>
          </div>
          {mixOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-600" />
          )}
        </button>
        {mixOpen && (
          <div className="border-t border-slate-800 px-4 pb-4 pt-3 space-y-1.5">
            <p className="text-sm text-slate-300 leading-relaxed">{mode.mixInstructions}</p>
            <p className="text-xs text-slate-500">Concentration: {mode.concLabel}</p>
            {mode.note && (
              <p className="text-xs text-slate-400 italic border-l-2 border-slate-700 pl-2 mt-2">{mode.note}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   GENERAL FORMULAS VIEW
════════════════════════════════════════════════════════════ */
function GeneralFormulas({ onBack }: { onBack: () => void }) {
  const [drawDose, setDrawDose] = useState(100);
  const [drawStockConc, setDrawStockConc] = useState(10);

  const [infVol, setInfVol] = useState(100);
  const [infDose, setInfDose] = useState(0.1);
  const [infWeight, setInfWeight] = useState(70);
  const [infConc, setInfConc] = useState(10);

  const [dripRate, setDripRate] = useState(60);
  const [dripFactor, setDripFactor] = useState(20);

  const [vtVol, setVtVol] = useState(100);
  const [vtTime, setVtTime] = useState(10);

  const [backFr, setBackFr] = useState(30);
  const [backConc, setBackConc] = useState(10);
  const [backWeight, setBackWeight] = useState(70);

  const drawVolume = drawStockConc > 0 ? drawDose / drawStockConc : 0;
  const infFlowRate = infConc > 0 ? (infVol * infDose * 60) / (infConc * 1000) : 0;
  const drips = (dripRate * dripFactor) / 60;
  const vtFlowRate = vtTime > 0 ? (vtVol * 60) / vtTime : 0;
  const backDose = backWeight > 0 ? (backFr * backConc) / 60 / backWeight : 0;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</h3>
      {children}
    </div>
  );

  const Row = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
    <div className="flex items-baseline justify-between border-t border-slate-800 pt-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xl font-bold tabular-nums text-teal-400">
        {fmtNum(value, 2)} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </span>
    </div>
  );

  const Field = ({
    label,
    unit,
    value,
    onChange,
    min = 0,
    max = 9999,
    step = 1,
  }: {
    label: string;
    unit: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-right text-sm font-semibold text-slate-200 focus:border-teal-600 focus:outline-none"
        />
        <span className="text-xs text-slate-500 w-12">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 active:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-teal-400">General Formulas</h2>
          <p className="text-xs text-slate-500">Universal drug calculation tools</p>
        </div>
      </div>

      {/* 1. Draw-up volume */}
      <Section title="1 — How many mL to draw up?">
        <p className="font-mono text-xs text-slate-500">Volume = Dose ÷ Stock concentration</p>
        <div className="space-y-2">
          <Field label="Required dose" unit="mcg (or mg)" value={drawDose} onChange={setDrawDose} min={1} max={10000} />
          <Field label="Stock concentration" unit="mcg/mL (or mg/mL)" value={drawStockConc} onChange={setDrawStockConc} min={0.1} max={10000} step={0.1} />
        </div>
        <Row label="Volume to draw up" value={drawVolume} unit="mL" />
      </Section>

      {/* 2. Infusion flow rate */}
      <Section title="2 — Infusion flow rate (mcg/kg/min)">
        <p className="font-mono text-xs text-slate-500">Flow = (Vol × Dose × 60) ÷ (Conc × 1000)</p>
        <div className="space-y-2">
          <Field label="Solution volume" unit="mL" value={infVol} onChange={setInfVol} min={1} max={1000} />
          <Field label="Dose rate" unit="mcg/kg/min" value={infDose} onChange={setInfDose} min={0.01} max={10} step={0.01} />
          <Field label="Patient weight" unit="kg" value={infWeight} onChange={setInfWeight} min={1} max={200} />
          <Field label="Total drug in bag" unit="mg" value={infConc} onChange={setInfConc} min={0.1} max={1000} step={0.1} />
        </div>
        <Row label="Flow rate" value={infFlowRate} unit="mL/h" />
      </Section>

      {/* 3. Drip rate */}
      <Section title="3 — Drip rate (gravity set)">
        <p className="font-mono text-xs text-slate-500">Drops/min = (mL/h × Drop factor) ÷ 60</p>
        <div className="space-y-2">
          <Field label="Flow rate" unit="mL/h" value={dripRate} onChange={setDripRate} min={1} max={500} />
          <Field label="Drop factor" unit="gtt/mL" value={dripFactor} onChange={setDripFactor} min={10} max={60} step={10} />
        </div>
        <Row label="Drip rate" value={drips} unit="drops/min" />
      </Section>

      {/* 4. Volume over time */}
      <Section title="4 — Flow rate for fixed volume/time">
        <p className="font-mono text-xs text-slate-500">Flow = (Volume × 60) ÷ Infusion time</p>
        <div className="space-y-2">
          <Field label="Volume to infuse" unit="mL" value={vtVol} onChange={setVtVol} min={1} max={1000} />
          <Field label="Infusion time" unit="min" value={vtTime} onChange={setVtTime} min={1} max={480} />
        </div>
        <Row label="Flow rate" value={vtFlowRate} unit="mL/h" />
      </Section>

      {/* 5. Back-calculate dose */}
      <Section title="5 — What dose is running? (reverse calc)">
        <p className="font-mono text-xs text-slate-500">Dose = (Flow × Conc) ÷ 60 ÷ Weight</p>
        <div className="space-y-2">
          <Field label="Current flow rate" unit="mL/h" value={backFr} onChange={setBackFr} min={0.1} max={500} step={0.1} />
          <Field label="Solution concentration" unit="mcg/mL" value={backConc} onChange={setBackConc} min={0.1} max={10000} step={0.1} />
          <Field label="Patient weight" unit="kg" value={backWeight} onChange={setBackWeight} min={1} max={200} />
        </div>
        <Row label="Dose rate" value={backDose} unit="mcg/kg/min" />
      </Section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
type View = "list" | "drug" | "formulas";

export default function DrugCalculatorPage() {
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedDrug = DRUGS.find((d) => d.id === selectedId) ?? null;

  if (view === "formulas") {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4">
        <GeneralFormulas onBack={() => setView("list")} />
      </div>
    );
  }

  if (view === "drug" && selectedDrug) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4">
        <DrugCalculator drug={selectedDrug} onBack={() => setView("list")} />
      </div>
    );
  }

  // List view
  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <header className="mb-4 space-y-0.5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-teal-500">CCP / CCA Tools</p>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Drug Infusion Calculator</h1>
        <p className="text-xs text-slate-500">Select a drug to calculate flow rates, draw-up volumes, and mixing.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {DRUGS.map((drug) => {
          const clr = CLR[drug.colorKey] ?? CLR.emerald;
          return (
            <button
              key={drug.id}
              type="button"
              onClick={() => { setSelectedId(drug.id); setView("drug"); }}
              className={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all active:scale-95 hover:brightness-110 ${clr.card} ${clr.border}`}
            >
              <p className={`text-sm font-bold leading-tight ${clr.label}`}>{drug.name}</p>
              <p className="text-[0.65rem] text-slate-500 leading-snug">{drug.subtitle}</p>
              <span className={`self-start rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${clr.badge}`}>
                {drug.modes.length > 1 ? `${drug.modes.length} modes` : drug.modes[0].description}
              </span>
            </button>
          );
        })}

        {/* General Formulas card */}
        <button
          type="button"
          onClick={() => setView("formulas")}
          className="col-span-2 flex items-center gap-3 rounded-2xl border border-teal-800/50 bg-teal-950/20 p-4 text-left transition-all active:scale-95 hover:brightness-110"
        >
          <Calculator className="h-6 w-6 shrink-0 text-teal-400" />
          <div>
            <p className="text-sm font-bold text-teal-400">General Formulas</p>
            <p className="text-[0.65rem] text-slate-500">Draw-up, flow rate, drip rate, reverse-calculate dose</p>
          </div>
        </button>
      </div>
    </div>
  );
}
