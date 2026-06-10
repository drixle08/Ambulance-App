"use client";

import { useState } from "react";
import { ArrowLeft, FlaskConical, Calculator, ChevronRight } from "lucide-react";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type ModeType =
  | "mcg/kg/min"
  | "mcg/kg/h"
  | "mg/kg/min"
  | "mg/kg"
  | "mg/kg/h"
  | "mcg/min"
  | "mg"
  | "g"
  | "push_mcg"
  | "bolus_mg_kg"
  | "bolus_mcg_kg"
  | "topical_mg";

interface SedationCell {
  doseMin: number;
  doseMax: number;
  doseDefault: number;
  doseStep: number;
  concMcgMl: number;
  concLabel: string;
  mixInstructions: string;
  note?: string;
}

interface SedationGrid {
  depths: string[];
  routes: string[];
  cells: SedationCell[][];  // cells[depthIdx][routeIdx]
}

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
  rsiPhase?: number;
  sedationGrid?: SedationGrid;
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
        type: "topical_mg",
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
        id: "rsi-pre",
        label: "RSI Pre-treat",
        description: "1 – 3 mcg/kg bolus",
        type: "bolus_mcg_kg",
        doseMin: 1,
        doseMax: 3,
        doseDefault: 1,
        doseStep: 0.5,
        concMcgMl: 50,
        concLabel: "50 mcg/mL (stock)",
        mixInstructions: "Use 50 mcg/mL Fentanyl ampoule undiluted — draw calculated volume neat.",
        note: "Give 3 min before induction. Push slowly 30–60 s. OMIT if haemodynamic compromise or opioid/BZD/alcohol toxidrome.",
        rsiPhase: 2,
      },
      {
        id: "post-rsi",
        label: "Post-RSI Analgesia",
        description: "1 – 5 mcg/kg/h infusion",
        type: "mcg/kg/h",
        doseMin: 1,
        doseMax: 5,
        doseDefault: 2,
        doseStep: 0.5,
        concMcgMl: 10,
        concLabel: "10 mcg/mL",
        mixInstructions: "200 mcg (4 mL of 50 mcg/mL) + 16 mL NaCl 0.9% → 20 mL @ 10 mcg/mL",
        note: "Run alongside Ketamine sedation post-intubation.",
        rsiPhase: 6,
      },
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
        id: "rsi-induction",
        label: "RSI Induction",
        description: "1 – 2 mg/kg IV bolus",
        type: "bolus_mg_kg",
        doseMin: 1,
        doseMax: 2,
        doseDefault: 1.5,
        doseStep: 0.25,
        concMcgMl: 10000,
        concLabel: "10 mg/mL",
        mixInstructions: "1 mL of 50 mg/mL + 4 mL NaCl 0.9% → 5 mL @ 10 mg/mL. Scale up for larger patients.",
        note: "Push over 30–60 s. Use 1 mg/kg if haemodynamically compromised.",
        rsiPhase: 3,
      },
      {
        id: "post-rsi",
        label: "Post-RSI Sedation",
        description: "1 – 2 mg/kg/h infusion",
        type: "mg/kg/h",
        doseMin: 1,
        doseMax: 2,
        doseDefault: 1,
        doseStep: 0.5,
        concMcgMl: 10000,
        concLabel: "10 mg/mL",
        mixInstructions: "200 mg (4 mL of 50 mg/mL) + 16 mL NaCl 0.9% → 20 mL @ 10 mg/mL",
        note: "First-line post-intubation sedation. Run alongside Fentanyl. Titrate to RASS −2 to −3.",
        rsiPhase: 6,
      },
      {
        id: "sedation",
        label: "Sedation",
        description: "Select depth and route below",
        type: "bolus_mg_kg",
        doseMin: 0.1,
        doseMax: 0.5,
        doseDefault: 0.2,
        doseStep: 0.1,
        concMcgMl: 10000,
        concLabel: "10 mg/mL",
        mixInstructions: "1 mL of 50 mg/mL + 4 mL NaCl 0.9% → 5 mL @ 10 mg/mL",
        sedationGrid: {
          depths: ["Light", "Deep"],
          routes: ["IV / IO", "IM / IN"],
          cells: [
            [
              {
                doseMin: 0.1, doseMax: 0.5, doseDefault: 0.2, doseStep: 0.1,
                concMcgMl: 10000, concLabel: "10 mg/mL",
                mixInstructions: "1 mL of 50 mg/mL + 4 mL NaCl 0.9% → 5 mL @ 10 mg/mL",
                note: "Sub-dissociative — analgesia & anxiolysis. Push over 30–60 s.",
              },
              {
                doseMin: 0.5, doseMax: 1.5, doseDefault: 1.0, doseStep: 0.25,
                concMcgMl: 50000, concLabel: "50 mg/mL (undiluted)",
                mixInstructions: "Use 50 mg/mL Ketamine undiluted — draw the calculated volume neat.",
                note: "IM: inject into large muscle. IN: MAD device, max 0.5 mL per nostril. Onset 5–10 min IM.",
              },
            ],
            [
              {
                doseMin: 1.0, doseMax: 2.0, doseDefault: 1.5, doseStep: 0.25,
                concMcgMl: 10000, concLabel: "10 mg/mL",
                mixInstructions: "1 mL of 50 mg/mL + 4 mL NaCl 0.9% → 5 mL @ 10 mg/mL",
                note: "Dissociative — procedural sedation. Push over 60 s. Monitor airway closely.",
              },
              {
                doseMin: 3.0, doseMax: 5.0, doseDefault: 4.0, doseStep: 0.5,
                concMcgMl: 50000, concLabel: "50 mg/mL (undiluted)",
                mixInstructions: "Use 50 mg/mL Ketamine undiluted — draw the calculated volume neat.",
                note: "Dissociative IM — onset 3–5 min, duration 15–30 min. Monitor airway. IN not suitable for deep sedation.",
              },
            ],
          ],
        },
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
        description: "2 g over 10 min",
        type: "g",
        doseMin: 2,
        doseMax: 2,
        doseDefault: 2,
        doseStep: 0.5,
        concMcgMl: 20000,
        concLabel: "20 mg/mL (2 g in 100 mL)",
        mixInstructions: "2 g (20 mL of 100 mg/mL TXA) + 80 mL NaCl 0.9% → 100 mL @ 20 mg/mL",
        infusionMinutes: 10,
        note: "600 mL/h for 10 min",
      },
      {
        id: "epistaxis-topical",
        label: "Epistaxis topical",
        description: "500 mg topical",
        type: "mg",
        doseMin: 500,
        doseMax: 500,
        doseDefault: 500,
        doseStep: 50,
        concMcgMl: 100000,
        concLabel: "100 mg/mL",
        mixInstructions: "Use 500 mg/5 mL TXA soaked into gauze and pack into the bleeding nostril",
        note: "Topical use after first aid is unsuccessful",
      },
      {
        id: "epistaxis-iv",
        label: "Epistaxis IV",
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
        note: "For epistaxis with haemodynamic compromise",
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
   COLOUR MAP
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

const WEIGHT_PRESETS = [50, 60, 70, 80, 90, 100];

/* ════════════════════════════════════════════════════════════
   CALCULATION ENGINE
════════════════════════════════════════════════════════════ */
function fmtNum(n: number, dp = 1): string {
  if (!isFinite(n) || n < 0) return "—";
  const r = parseFloat(n.toFixed(dp));
  return r === Math.floor(r) ? Math.floor(r).toString() : r.toFixed(dp);
}

interface CalcResult {
  kind: "infusion" | "fixed" | "push" | "topical";
  flowRateMlH?: number;
  volumeMl?: number;
  totalDoseMg?: number;
  totalDoseMcg?: number;
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
    case "mg/kg/h": {
      const concMgMl = c / 1000;
      const fr = (weight * dose) / concMgMl;
      return withDrip(fr, `${weight} kg × ${dose} mg/kg/h ÷ ${fmtNum(concMgMl, 0)} mg/mL`);
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
    case "bolus_mg_kg": {
      const totalMg = weight * dose;
      const vol = (totalMg * 1000) / c;
      return { kind: "push", volumeMl: vol, totalDoseMg: totalMg, formula: `${weight} kg × ${dose} mg/kg = ${fmtNum(totalMg, 0)} mg → ${fmtNum(vol, 1)} mL` };
    }
    case "bolus_mcg_kg": {
      const totalMcg = weight * dose;
      const vol = totalMcg / c;
      return { kind: "push", volumeMl: vol, totalDoseMcg: totalMcg, formula: `${weight} kg × ${dose} mcg/kg = ${fmtNum(totalMcg, 0)} mcg → ${fmtNum(vol, 2)} mL` };
    }
    case "topical_mg": {
      const vol = (dose * 1000) / c;
      return { kind: "topical", volumeMl: vol, formula: `${dose} mg ÷ ${c / 1000} mg/mL` };
    }
  }
}

/* ════════════════════════════════════════════════════════════
   SHARED SLIDER
════════════════════════════════════════════════════════════ */
function SliderRow({
  label, unit, value, min, max, step, onChange, accentClass,
}: {
  label: string; unit: string; value: number; min: number; max: number;
  step: number; onChange: (v: number) => void; accentClass: string;
}) {
  const dp = step < 0.1 ? 3 : step < 1 ? 1 : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</span>
        <span className={`text-lg font-bold tabular-nums ${accentClass}`}>
          {fmtNum(value, dp)} <span className="text-xs font-normal text-slate-500">{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-6 w-full accent-current" />
      <div className="flex justify-between text-[0.6rem] text-slate-600">
        <span>{fmtNum(min, dp)}</span>
        <span>{fmtNum(max, dp)}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   RSI PHASE DIAGRAM
════════════════════════════════════════════════════════════ */
const RSI_MINI_PHASES = [
  { num: 1, short: "Prepare", timing: "T−5 min", activeCls: { ring: "border-sky-600/60",    bg: "bg-sky-950/50",    num: "bg-sky-500 text-white",    text: "text-sky-300" } },
  { num: 2, short: "Pre-treat", timing: "T−3 min", activeCls: { ring: "border-amber-600/60",  bg: "bg-amber-950/50",  num: "bg-amber-500 text-white",  text: "text-amber-300" } },
  { num: 3, short: "Induce",   timing: "T = 0",   activeCls: { ring: "border-violet-600/60", bg: "bg-violet-950/50", num: "bg-violet-500 text-white", text: "text-violet-300" } },
  { num: 4, short: "Paralyse", timing: "",         activeCls: { ring: "border-rose-600/60",   bg: "bg-rose-950/50",   num: "bg-rose-500 text-white",   text: "text-rose-300" } },
  { num: 5, short: "Confirm",  timing: "T+60 s",  activeCls: { ring: "border-slate-500/60",  bg: "bg-slate-800/50",  num: "bg-slate-500 text-white",  text: "text-slate-300" } },
  { num: 6, short: "Maintain", timing: "T+2 min", activeCls: { ring: "border-emerald-600/60",bg: "bg-emerald-950/50",num: "bg-emerald-500 text-white",text: "text-emerald-300" } },
];

function RsiPhaseDiagram({ activePhase, doseLabel }: { activePhase: number; doseLabel: string }) {
  const isPreRsi  = activePhase >= 1 && activePhase <= 4;
  const isPostRsi = activePhase > 4;

  const prePhases    = RSI_MINI_PHASES.slice(0, 4);
  const confirmPhase = RSI_MINI_PHASES[4];
  const maintainPhase = RSI_MINI_PHASES[5];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-[0.55rem] font-bold uppercase tracking-widest text-slate-600 mb-2.5">RSI flow</p>

      <div className="flex items-center gap-1">

        {/* ── PRE-RSI section ── */}
        <div className={`flex-1 min-w-0 rounded-xl border p-2 transition-colors ${
          isPreRsi ? "border-amber-700/50 bg-amber-950/25" : "border-slate-800/50 bg-slate-900/20"
        }`}>
          <p className={`text-[0.5rem] font-bold uppercase tracking-[0.2em] text-center mb-2 ${
            isPreRsi ? "text-amber-400" : "text-slate-700"
          }`}>Pre-RSI</p>
          <div className="flex items-center justify-around">
            {prePhases.map((phase, idx) => {
              const isActive = phase.num === activePhase;
              const c = phase.activeCls;
              return (
                <div key={phase.num} className="flex items-center gap-0.5">
                  <div className={`flex flex-col items-center gap-0.5 rounded-lg p-1 border min-w-[36px] transition-all ${
                    isActive ? `${c.ring} ${c.bg}` : "border-transparent"
                  }`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.5rem] font-black ${
                      isActive ? c.num : "bg-slate-800 text-slate-600"
                    }`}>{phase.num}</div>
                    <p className={`text-[0.48rem] font-semibold leading-none text-center mt-0.5 ${
                      isActive ? c.text : "text-slate-600"
                    }`}>{phase.short}</p>
                    {phase.timing && (
                      <p className={`text-[0.44rem] leading-none ${isActive ? "text-slate-500" : "text-slate-700"}`}>
                        {phase.timing}
                      </p>
                    )}
                    {isActive && (
                      <p className={`text-[0.45rem] font-bold text-center leading-tight mt-0.5 max-w-[36px] ${c.text}`}>
                        {doseLabel}
                      </p>
                    )}
                  </div>
                  {idx < prePhases.length - 1 && (
                    <ChevronRight className="w-2 h-2 text-slate-700 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Connector + Confirm ── */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <ChevronRight className="w-2.5 h-2.5 text-slate-700" />
          <div className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-700/40 bg-slate-800/30 p-1 min-w-[36px]">
            <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[0.5rem] font-black text-slate-400">
              {confirmPhase.num}
            </div>
            <p className="text-[0.48rem] font-medium text-slate-600 text-center">{confirmPhase.short}</p>
          </div>
          <ChevronRight className="w-2.5 h-2.5 text-slate-700" />
        </div>

        {/* ── POST-RSI section ── */}
        {(() => {
          const isActive = maintainPhase.num === activePhase;
          const c = maintainPhase.activeCls;
          return (
            <div className={`rounded-xl border p-2 shrink-0 transition-colors ${
              isPostRsi ? "border-emerald-700/50 bg-emerald-950/25" : "border-slate-800/50 bg-slate-900/20"
            }`}>
              <p className={`text-[0.5rem] font-bold uppercase tracking-[0.2em] text-center mb-2 ${
                isPostRsi ? "text-emerald-400" : "text-slate-700"
              }`}>Post-RSI</p>
              <div className="flex justify-center">
                <div className={`flex flex-col items-center gap-0.5 rounded-lg p-1 border min-w-[44px] transition-all ${
                  isActive ? `${c.ring} ${c.bg}` : "border-transparent"
                }`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.5rem] font-black ${
                    isActive ? c.num : "bg-slate-800 text-slate-600"
                  }`}>{maintainPhase.num}</div>
                  <p className={`text-[0.48rem] font-semibold leading-none text-center mt-0.5 ${
                    isActive ? c.text : "text-slate-600"
                  }`}>{maintainPhase.short}</p>
                  {maintainPhase.timing && (
                    <p className={`text-[0.44rem] leading-none ${isActive ? "text-slate-500" : "text-slate-700"}`}>
                      {maintainPhase.timing}
                    </p>
                  )}
                  {isActive && (
                    <p className={`text-[0.45rem] font-bold text-center leading-tight mt-0.5 max-w-[44px] ${c.text}`}>
                      {doseLabel}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
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
  const [depthIdx, setDepthIdx] = useState(0);
  const [routeIdx, setRouteIdx] = useState(0);
  const [weight, setWeight] = useState(70);
  const [dose, setDose] = useState(() => {
    const m = drug.modes[0];
    return m.sedationGrid?.cells[0]?.[0]?.doseDefault ?? m.doseDefault;
  });
  const [duration, setDuration] = useState(() => drug.modes[0].durationDefault ?? 30);

  const mode = drug.modes[modeIdx];

  // When a sedationGrid is present, derive effective params from the selected cell
  const gridCell = mode.sedationGrid?.cells[depthIdx]?.[routeIdx];
  const em: DoseMode = gridCell
    ? { ...mode, doseMin: gridCell.doseMin, doseMax: gridCell.doseMax, doseDefault: gridCell.doseDefault, doseStep: gridCell.doseStep, concMcgMl: gridCell.concMcgMl, concLabel: gridCell.concLabel, mixInstructions: gridCell.mixInstructions, note: gridCell.note }
    : mode;

  const needsWeight =
    em.type === "mcg/kg/min" || em.type === "mcg/kg/h" ||
    em.type === "mg/kg/min"  || em.type === "mg/kg" ||
    em.type === "mg/kg/h"    || em.type === "bolus_mg_kg" ||
    em.type === "bolus_mcg_kg";
  const isFixed = em.doseMin === em.doseMax;
  const result = doCalc(em, dose, weight, duration);

  const handleModeChange = (idx: number) => {
    const newMode = drug.modes[idx];
    setModeIdx(idx);
    setDepthIdx(0);
    setRouteIdx(0);
    setDose(newMode.sedationGrid?.cells[0]?.[0]?.doseDefault ?? newMode.doseDefault);
    setDuration(newMode.durationDefault ?? 30);
  };

  const handleDepthChange = (idx: number) => {
    setDepthIdx(idx);
    const cell = mode.sedationGrid?.cells[idx]?.[routeIdx];
    if (cell) setDose(cell.doseDefault);
  };

  const handleRouteChange = (idx: number) => {
    setRouteIdx(idx);
    const cell = mode.sedationGrid?.cells[depthIdx]?.[idx];
    if (cell) setDose(cell.doseDefault);
  };

  const doseUnit =
    em.type === "push_mcg"     ? "mcg" :
    em.type === "topical_mg"   ? "mg"  :
    em.type === "bolus_mg_kg"  ? "mg/kg" :
    em.type === "bolus_mcg_kg" ? "mcg/kg" :
    em.type;

  const doseLabel = em.type === "bolus_mg_kg" || em.type === "bolus_mcg_kg" ? "Dose" : "Dose rate";

  const rsiDoseLabel =
    em.type === "bolus_mg_kg"  ? `${fmtNum(dose, 2)} mg/kg` :
    em.type === "bolus_mcg_kg" ? `${fmtNum(dose, 2)} mcg/kg` :
    em.type === "mg/kg/h"      ? `${fmtNum(dose, 1)} mg/kg/h` :
    `${fmtNum(dose, 1)} mcg/kg/h`;

  const modeDescription = mode.sedationGrid
    ? `${mode.sedationGrid.depths[depthIdx]}  •  ${mode.sedationGrid.routes[routeIdx]}  ·  ${em.doseMin}–${em.doseMax} mg/kg`
    : mode.description;

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 active:bg-slate-800">
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
            <button key={m.id} type="button" onClick={() => handleModeChange(i)}
              className={`min-h-11 px-4 pb-2 pt-1.5 text-sm font-semibold transition-colors ${
                i === modeIdx ? clr.tabActive : `text-slate-500 ${clr.tab}`
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Mode description */}
      <p className="text-sm text-slate-400">{modeDescription}</p>

      {/* Sedation depth + route selectors */}
      {mode.sedationGrid && (
        <div className="space-y-2">
          <div className="flex gap-2">
            {mode.sedationGrid.depths.map((d, i) => (
              <button key={d} type="button" onClick={() => handleDepthChange(i)}
                className={`flex-1 min-h-11 rounded-xl border text-sm font-bold transition-colors ${
                  i === depthIdx ? `${clr.badge} border-current` : "border-slate-700 bg-slate-900/70 text-slate-400 hover:border-slate-500"
                }`}>
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {mode.sedationGrid.routes.map((r, i) => (
              <button key={r} type="button" onClick={() => handleRouteChange(i)}
                className={`flex-1 min-h-10 rounded-xl border text-sm font-semibold transition-colors ${
                  i === routeIdx ? `${clr.badge} border-current` : "border-slate-700 bg-slate-900/70 text-slate-400 hover:border-slate-500"
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className={`rounded-2xl border p-4 space-y-5 ${clr.card} ${clr.border}`}>
        {needsWeight && (
          <div className="space-y-3">
            <SliderRow label="Weight" unit="kg" value={weight} min={3} max={150} step={1}
              onChange={setWeight} accentClass={clr.label} />
            <div className="grid grid-cols-3 gap-2">
              {WEIGHT_PRESETS.map((preset) => {
                const selected = weight === preset;
                return (
                  <button key={preset} type="button" onClick={() => setWeight(preset)}
                    className={`min-h-11 rounded-xl border px-3 text-sm font-black tabular-nums transition-colors ${
                      selected ? `${clr.badge} border-current` : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500"
                    }`}>
                    {preset}kg
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!isFixed && (
          <SliderRow label={doseLabel} unit={doseUnit} value={dose}
            min={em.doseMin} max={em.doseMax} step={em.doseStep}
            onChange={setDose} accentClass={clr.label} />
        )}

        {isFixed && (
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Fixed Dose</span>
            <span className={`text-lg font-bold ${clr.label}`}>
              {em.doseDefault}{" "}
              <span className="text-xs font-normal text-slate-500">{em.type === "g" ? "g" : "mg"}</span>
            </span>
          </div>
        )}

        {em.variableDuration && (
          <SliderRow label="Duration" unit="min" value={duration}
            min={em.durationMin ?? 20} max={em.durationMax ?? 60} step={5}
            onChange={setDuration} accentClass={clr.label} />
        )}
      </div>

      {/* Results */}
      <div className={`rounded-3xl border p-5 space-y-4 shadow-lg shadow-black/20 ${clr.result} ${clr.resultBorder}`}>
        {result.kind === "push" || result.kind === "topical" ? (
          <div className="text-center py-2">
            {(result.totalDoseMg !== undefined || result.totalDoseMcg !== undefined) && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs text-slate-500">Total dose</span>
                <span className={`text-sm font-bold ${clr.label}`}>
                  {result.totalDoseMg !== undefined
                    ? `${fmtNum(result.totalDoseMg, 0)} mg`
                    : `${fmtNum(result.totalDoseMcg ?? 0, 0)} mcg`}
                </span>
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Draw up</p>
            <p className={`text-6xl font-black tabular-nums ${clr.label}`}>
              {fmtNum(result.volumeMl ?? 0, 2)}
              <span className="text-2xl font-normal text-slate-300 ml-1">mL</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {result.kind === "topical" ? "apply topically as directed" : `from ${em.concLabel} solution`}
            </p>
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
              <p className={`text-7xl font-black tabular-nums ${clr.label}`}>
                {fmtNum(result.flowRateMlH ?? 0, 1)}
                <span className="text-2xl font-normal text-slate-300 ml-1.5">mL/h</span>
              </p>
            </div>
            {result.dripsPerMin !== undefined && (
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Gravity (20 gtt/mL)
                </span>
                <span className="text-xl font-black text-slate-100 tabular-nums">
                  {fmtNum(result.dripsPerMin, 0)} drops/min
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mixing + formula — always visible */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mixing</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{em.mixInstructions}</p>
        <p className="text-xs text-slate-500">Conc: {em.concLabel}</p>
        {em.note && (
          <p className="text-xs text-slate-400 italic border-l-2 border-slate-700 pl-2">{em.note}</p>
        )}
        <div className="border-t border-slate-800/60 pt-2.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600 mb-1.5">Formula</p>
          <p className="rounded-lg bg-slate-900/60 px-3 py-2 font-mono text-xs text-slate-400 leading-relaxed break-all">
            {result.formula}{" = "}
            <strong className={clr.label}>
              {fmtNum(result.flowRateMlH ?? result.volumeMl ?? 0, 2)}
            </strong>{" "}
            {result.kind === "push" || result.kind === "topical" ? "mL" : "mL/h"}
          </p>
        </div>
      </div>

      {/* RSI flow diagram — shown at bottom when an RSI mode is active */}
      {mode.rsiPhase !== undefined && (
        <RsiPhaseDiagram activePhase={mode.rsiPhase} doseLabel={rsiDoseLabel} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   GENERAL FORMULAS VIEW
════════════════════════════════════════════════════════════ */
function FormulaSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

function FormulaRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-baseline justify-between border-t border-slate-800 pt-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xl font-bold tabular-nums text-teal-400">
        {fmtNum(value, 2)} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </span>
    </div>
  );
}

function FormulaField({
  label, unit, value, onChange, min = 0, max = 9999, step = 1,
}: {
  label: string; unit: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5">
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-right text-sm font-semibold text-slate-200 focus:border-teal-600 focus:outline-none" />
        <span className="text-xs text-slate-500 w-12">{unit}</span>
      </div>
    </div>
  );
}

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

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 active:bg-slate-800">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-teal-400">General Formulas</h2>
          <p className="text-xs text-slate-500">Universal drug calculation tools</p>
        </div>
      </div>

      <FormulaSection title="1 — How many mL to draw up?">
        <p className="font-mono text-xs text-slate-500">Volume = Dose ÷ Stock concentration</p>
        <div className="space-y-2">
          <FormulaField label="Required dose" unit="mcg (or mg)" value={drawDose} onChange={setDrawDose} min={1} max={10000} />
          <FormulaField label="Stock concentration" unit="mcg/mL (or mg/mL)" value={drawStockConc} onChange={setDrawStockConc} min={0.1} max={10000} step={0.1} />
        </div>
        <FormulaRow label="Volume to draw up" value={drawVolume} unit="mL" />
      </FormulaSection>

      <FormulaSection title="2 — Infusion flow rate (mcg/kg/min)">
        <p className="font-mono text-xs text-slate-500">Flow = (Vol × Dose × 60) ÷ (Conc × 1000)</p>
        <div className="space-y-2">
          <FormulaField label="Solution volume" unit="mL" value={infVol} onChange={setInfVol} min={1} max={1000} />
          <FormulaField label="Dose rate" unit="mcg/kg/min" value={infDose} onChange={setInfDose} min={0.01} max={10} step={0.01} />
          <FormulaField label="Patient weight" unit="kg" value={infWeight} onChange={setInfWeight} min={1} max={200} />
          <FormulaField label="Total drug in bag" unit="mg" value={infConc} onChange={setInfConc} min={0.1} max={1000} step={0.1} />
        </div>
        <FormulaRow label="Flow rate" value={infFlowRate} unit="mL/h" />
      </FormulaSection>

      <FormulaSection title="3 — Drip rate (gravity set)">
        <p className="font-mono text-xs text-slate-500">Drops/min = (mL/h × Drop factor) ÷ 60</p>
        <div className="space-y-2">
          <FormulaField label="Flow rate" unit="mL/h" value={dripRate} onChange={setDripRate} min={1} max={500} />
          <FormulaField label="Drop factor" unit="gtt/mL" value={dripFactor} onChange={setDripFactor} min={10} max={60} step={10} />
        </div>
        <FormulaRow label="Drip rate" value={drips} unit="drops/min" />
      </FormulaSection>

      <FormulaSection title="4 — Flow rate for fixed volume/time">
        <p className="font-mono text-xs text-slate-500">Flow = (Volume × 60) ÷ Infusion time</p>
        <div className="space-y-2">
          <FormulaField label="Volume to infuse" unit="mL" value={vtVol} onChange={setVtVol} min={1} max={1000} />
          <FormulaField label="Infusion time" unit="min" value={vtTime} onChange={setVtTime} min={1} max={480} />
        </div>
        <FormulaRow label="Flow rate" value={vtFlowRate} unit="mL/h" />
      </FormulaSection>

      <FormulaSection title="5 — What dose is running? (reverse calc)">
        <p className="font-mono text-xs text-slate-500">Dose = (Flow × Conc) ÷ 60 ÷ Weight</p>
        <div className="space-y-2">
          <FormulaField label="Current flow rate" unit="mL/h" value={backFr} onChange={setBackFr} min={0.1} max={500} step={0.1} />
          <FormulaField label="Solution concentration" unit="mcg/mL" value={backConc} onChange={setBackConc} min={0.1} max={10000} step={0.1} />
          <FormulaField label="Patient weight" unit="kg" value={backWeight} onChange={setBackWeight} min={1} max={200} />
        </div>
        <FormulaRow label="Dose rate" value={backDose} unit="mcg/kg/min" />
      </FormulaSection>
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
          const rsiModes = drug.modes.filter((m) => m.rsiPhase !== undefined);
          return (
            <button key={drug.id} type="button"
              onClick={() => { setSelectedId(drug.id); setView("drug"); }}
              className={`flex min-h-36 flex-col gap-3 rounded-2xl border p-5 text-left transition-all active:scale-95 hover:brightness-110 ${clr.card} ${clr.border}`}>
              <p className={`text-base font-black leading-tight ${clr.label}`}>{drug.name}</p>
              <p className="text-[0.65rem] text-slate-500 leading-snug">{drug.subtitle}</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                <span className={`self-start rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${clr.badge}`}>
                  {drug.modes.length > 1 ? `${drug.modes.length} modes` : drug.modes[0].description}
                </span>
                {rsiModes.length > 0 && (
                  <span className="self-start rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider border border-violet-500/40 bg-violet-500/10 text-violet-300">
                    RSI
                  </span>
                )}
              </div>
            </button>
          );
        })}

        <button type="button" onClick={() => setView("formulas")}
          className="col-span-2 flex min-h-24 items-center gap-4 rounded-2xl border border-teal-800/50 bg-teal-950/20 p-5 text-left transition-all active:scale-95 hover:brightness-110">
          <Calculator className="h-8 w-8 shrink-0 text-teal-400" />
          <div>
            <p className="text-sm font-bold text-teal-400">General Formulas</p>
            <p className="text-[0.65rem] text-slate-500">Draw-up, flow rate, drip rate, reverse-calculate dose</p>
          </div>
        </button>
      </div>
    </div>
  );
}
