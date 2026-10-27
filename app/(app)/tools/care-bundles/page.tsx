"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Circle, RotateCcw, CheckCheck,
  ChevronDown, ChevronUp, AlertTriangle, Info, Wind,
} from "lucide-react";
import { cpgAbsent, cpgRef, type CpgProvenance } from "@/lib/cpgProvenance";

// ── Types ─────────────────────────────────────────────────────────────────────

type DoseOption = {
  id: string;
  label: string;
  dose: string;
  route: string;
  detail?: string;
  caution?: string;
  /** Where the CPG states (or doesn't state) this value — see lib/cpgProvenance.ts. */
  refs?: CpgProvenance[];
};

type BundleItem = {
  id: string;
  label: string;
  sublabel?: string;
  note?: string;
  detail?: string;
  caution?: string;
  options?: DoseOption[];
  calculator?: "ventilation";
  refs?: CpgProvenance[];
};

type Bundle = {
  id: string;
  title: string;
  color: BundleColor;
  tip?: string;
  items: BundleItem[];
};

type BundleColor =
  | "sky" | "red" | "violet" | "orange" | "amber"
  | "teal" | "rose" | "emerald" | "indigo";

// ── Colour palette ────────────────────────────────────────────────────────────

type ColorDef = {
  bg: string; icon: string; border: string; pill: string; check: string;
  card: string; bar: string; banner: string; optSel: string; optUnsel: string;
};

const COLOR: Record<BundleColor, ColorDef> = {
  sky:     { bg:"bg-sky-500/10",     icon:"text-sky-400",     border:"border-sky-500/30",     pill:"bg-sky-500/15 text-sky-300",     check:"text-sky-400",     card:"hover:border-sky-500/40",     bar:"bg-sky-500",     banner:"bg-sky-500/15 border-sky-500/30 text-sky-200",     optSel:"border-sky-500/60 bg-sky-500/15 text-sky-100",     optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-sky-500/40" },
  red:     { bg:"bg-red-500/10",     icon:"text-red-400",     border:"border-red-500/30",     pill:"bg-red-500/15 text-red-300",     check:"text-red-400",     card:"hover:border-red-500/40",     bar:"bg-red-500",     banner:"bg-red-500/15 border-red-500/30 text-red-200",     optSel:"border-red-500/60 bg-red-500/15 text-red-100",     optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-red-500/40" },
  violet:  { bg:"bg-violet-500/10",  icon:"text-violet-400",  border:"border-violet-500/30",  pill:"bg-violet-500/15 text-violet-300",  check:"text-violet-400",  card:"hover:border-violet-500/40",  bar:"bg-violet-500",  banner:"bg-violet-500/15 border-violet-500/30 text-violet-200",  optSel:"border-violet-500/60 bg-violet-500/15 text-violet-100",  optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-violet-500/40" },
  orange:  { bg:"bg-orange-500/10",  icon:"text-orange-400",  border:"border-orange-500/30",  pill:"bg-orange-500/15 text-orange-300",  check:"text-orange-400",  card:"hover:border-orange-500/40",  bar:"bg-orange-500",  banner:"bg-orange-500/15 border-orange-500/30 text-orange-200",  optSel:"border-orange-500/60 bg-orange-500/15 text-orange-100",  optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-orange-500/40" },
  amber:   { bg:"bg-amber-500/10",   icon:"text-amber-400",   border:"border-amber-500/30",   pill:"bg-amber-500/15 text-amber-300",   check:"text-amber-400",   card:"hover:border-amber-500/40",   bar:"bg-amber-500",   banner:"bg-amber-500/15 border-amber-500/30 text-amber-200",   optSel:"border-amber-500/60 bg-amber-500/15 text-amber-100",   optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-amber-500/40" },
  teal:    { bg:"bg-teal-500/10",    icon:"text-teal-400",    border:"border-teal-500/30",    pill:"bg-teal-500/15 text-teal-300",    check:"text-teal-400",    card:"hover:border-teal-500/40",    bar:"bg-teal-500",    banner:"bg-teal-500/15 border-teal-500/30 text-teal-200",    optSel:"border-teal-500/60 bg-teal-500/15 text-teal-100",    optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-teal-500/40" },
  rose:    { bg:"bg-rose-500/10",    icon:"text-rose-400",    border:"border-rose-500/30",    pill:"bg-rose-500/15 text-rose-300",    check:"text-rose-400",    card:"hover:border-rose-500/40",    bar:"bg-rose-500",    banner:"bg-rose-500/15 border-rose-500/30 text-rose-200",    optSel:"border-rose-500/60 bg-rose-500/15 text-rose-100",    optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-rose-500/40" },
  emerald: { bg:"bg-emerald-500/10", icon:"text-emerald-400", border:"border-emerald-500/30", pill:"bg-emerald-500/15 text-emerald-300", check:"text-emerald-400", card:"hover:border-emerald-500/40", bar:"bg-emerald-500", banner:"bg-emerald-500/15 border-emerald-500/30 text-emerald-200", optSel:"border-emerald-500/60 bg-emerald-500/15 text-emerald-100", optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-emerald-500/40" },
  indigo:  { bg:"bg-indigo-500/10",  icon:"text-indigo-400",  border:"border-indigo-500/30",  pill:"bg-indigo-500/15 text-indigo-300",  check:"text-indigo-400",  card:"hover:border-indigo-500/40",  bar:"bg-indigo-500",  banner:"bg-indigo-500/15 border-indigo-500/30 text-indigo-200",  optSel:"border-indigo-500/60 bg-indigo-500/15 text-indigo-100",  optUnsel:"border-slate-700 bg-slate-800/50 text-slate-300 hover:border-indigo-500/40" },
};

// ── Shared drug option sets ───────────────────────────────────────────────────

const ADRENALINE_OPTIONS: DoseOption[] = [
  {
    // CPG: 500mcg (0.5mg) IM, repeat q5min confirmed. Injection site
    // is extended scope (CPG only says rotate sites, doesn't specify thigh).
    // "Max 3 doses" corrected -- CPG frames the 3rd dose as an escalation
    // trigger to IV push-dose adrenaline, not a hard stop (CPG).
    id: "adr-im",
    refs: [
      cpgRef("2.6", 301, "Anaphylaxis IM 0.5 mg (1:1000) Repeat PRN every 5 minutes"),
      cpgRef("2.6", 116, "Repeat IM Adrenaline every 5 minutes as required"),
      cpgRef("2.6", 113, "unresponsive to 3 x IM Adrenaline"),
      cpgAbsent("2.6", "anterolateral-thigh injection site (CPG: rotate sites)"),
    ],
    label: "Adrenaline IM",
    dose: "500 mcg (0.5 mg)",
    route: "IM — anterolateral thigh",
    detail: "Use 1:1,000 (1 mg/mL). Inject into anterolateral thigh. May repeat q5 min. If unresponsive after 3 doses, escalate to IV push-dose adrenaline.",
    caution: "Confirm 1:1,000 concentration for IM. Do NOT use 1:10,000 IM.",
  },
  {
    // CPG: push-dose range corrected from 50-100mcg to
    // 20-50mcg (formulary max single dose is 1mcg/kg, max 50mcg). Dilution
    // corrected from 0.1mg/mL to the CPG's stated 10mcg/mL prep -- the
    // previous instructions were 10x more concentrated than CPG specifies.
    id: "adr-iv",
    refs: [
      cpgRef("2.6", 301, "Push Dose Max single dose of 50mcg Mix 1mg (1:1000) in 100ml NS (10mcg/ml)"),
      cpgRef("2.6", 116, "Adrenaline Push dose 20 - 50mcg"),
    ],
    label: "Adrenaline IV",
    dose: "20–50 mcg (max single dose 50 mcg)",
    route: "IV slow bolus",
    detail: "Mix 1 mg (1:1,000, 1 mL) into 100 mL NaCl = 10 mcg/mL. Give 2–5 mL (20–50 mcg) slow IV. Titrate to response.",
    caution: "Continuous ECG mandatory. Risk of arrhythmia. Reserve for refractory cases / cardiovascular collapse.",
  },
];

const ANALGESIA_OPTIONS: DoseOption[] = [
  {
    // CPG: onset corrected from "6-10 breaths" to CPG's "1-3
    // minutes"; repeat corrected from "if required" to CPG's "may repeat
    // once after 25 minutes". FLAGGED — could not confirm from CPG source:
    // the "15 mL/week" cap has no CPG basis (CPG states only a 6mL/24h
    // limit, no weekly figure). Left as-is per the keep-unsourced-values
    // policy, but unclear whether this is a deliberate departmental safety
    // margin or an error — needs a human clinical read, not a guess.
    id: "analg-methox",
    refs: [
      cpgRef("2.6", 363, "1 – 3 minutes"),
      cpgRef("2.6", 363, "May repeat once after 25 minutes Max of 6ml/24 hours"),
      cpgAbsent("2.6", "Methoxyflurane 15 mL/week cap", "15\\s*ml\\s*/\\s*week|per week|weekly"),
    ],
    label: "Methoxyflurane (Penthrox)",
    dose: "3 mL inhaled",
    route: "Inhaled — Penthrox inhaler",
    detail: "3 mL per inhaler, self-administered. Onset 1–3 min. May repeat once (second 3 mL inhaler) after 25 min. Max 6 mL/day, 15 mL/week.",
    caution: "Avoid in renal/hepatic impairment, altered conscious state, or haemodynamic instability.",
  },
  {
    // Extended scope — Morphine does not appear anywhere in the CPG (full-
    // text search of the entire document returns zero matches). Kept as
    // departmental extended scope per policy; dosing here is not CPG-verified.
    id: "analg-morph",
    refs: [
      cpgAbsent("2.6", "Morphine", "\\bmorphine\\b"),
    ],
    label: "Morphine",
    dose: "2.5–5 mg IV  |  0.1 mg/kg IN",
    route: "IV slow / Intranasal",
    detail: "IV: 2.5–5 mg slow IV over 2–3 min. Titrate q5 min to effect. Max 10 mg total.\nIN: 0.1 mg/kg intranasal (max 10 mg). Split between nostrils if volume >0.5 mL per nostril.",
    caution: "Monitor RR. Naloxone ready. Avoid in hypovolaemia without concurrent fluid resuscitation.",
  },
  {
    // CPG: IV corrected from a flat 25-50mcg to the CPG's weight-
    // based "1mcg/kg at 20mcg aliquots, repeat PRN every 1-2 min, max 200mcg
    // total". IN dose (1-2mcg/kg, max 200mcg) already matched, unchanged.
    id: "analg-fent",
    refs: [
      cpgRef("2.6", 332, "IV/IO 1mcg/kg at 20mcg aliquots Repeat PRN every 1 - 2 minutes"),
      cpgRef("2.6", 332, "Max total dose of 200mcg"),
      cpgRef("2.6", 332, "IM/IN 1 - 2mcg/kg"),
    ],
    label: "Fentanyl",
    dose: "1 mcg/kg IV (20 mcg aliquots)  |  1–2 mcg/kg IN",
    route: "IV slow / Intranasal",
    detail: "IV: 1 mcg/kg in 20 mcg aliquots, slow IV. Repeat PRN q1–2 min to effect. Max 200 mcg total.\nIN: 1–2 mcg/kg (max 200 mcg). Use atomiser. Split between nostrils.",
    caution: "Rapid respiratory depression possible. Continuous monitoring required.",
  },
  {
    // CPG: dose corrected from 0.1-0.3mg/kg to CPG's "IV/IO
    // 0.25-0.5mg/kg", and "repeat once" corrected to CPG's "Repeat PRN".
    id: "analg-ket",
    refs: [
      cpgRef("2.6", 352, "IV/IO 0.25 - 0.5mg/kg Repeat PRN"),
    ],
    label: "Ketamine (sub-anaesthetic)",
    dose: "0.25–0.5 mg/kg IV",
    route: "IV slow bolus",
    detail: "Sub-anaesthetic dose for analgesia. Give slow IV over 2–3 min (avoid rapid administration). Repeat PRN. Dissociative at higher doses.",
    caution: "Monitor airway and haemodynamics. Emergence reactions possible. Have airway equipment ready.",
  },
];

const VASOPRESSOR_OPTIONS: DoseOption[] = [
  {
    // CPG formulary, corroborated by the trauma and ROSC algorithms: 0.01-0.3
    // mcg/kg/min confirmed (corrected from 0.01-0.5 in a prior pass).
    id: "vaso-nora",
    refs: [
      cpgRef("2.6", 373, "0.01 – 0.3mcg/kg/min Increase rate by 0.05mcg/kg/min if required"),
      cpgRef("2.6", 173, "Noradrenaline 0.01 - 0.3mcg/kg/min"),
      cpgRef("2.6", 281, "NORADRENALINE 4mg/4ml D5W NS SD: 4mg/50ml"),
    ],
    label: "Noradrenaline",
    dose: "0.01–0.3 mcg/kg/min",
    route: "IV infusion",
    detail: "Preparation: 4 mg in 50 mL (80 mcg/mL) or per local protocol. Start 0.01–0.05 mcg/kg/min, increase by 0.05 mcg/kg/min if required. Titrate q5 min to MAP ≥65 mmHg.",
    caution: "Extravasation → tissue necrosis. Central access preferred. First-line vasopressor.",
  },
  {
    // Extended scope — Metaraminol does not appear anywhere in the CPG (full-
    // text search of the entire document returns zero matches). CPG's actual
    // vasopressor escalation for trauma/haemorrhage is Noradrenaline ->
    // Phenylephrine -> Adrenaline infusion (trauma CPGs), neither of which
    // Metaraminol nor Phenylephrine currently appear as an option here.
    // Kept as departmental extended scope per policy; dosing not CPG-verified.
    id: "vaso-meta",
    refs: [
      cpgAbsent("2.6", "Metaraminol", "metaraminol"),
    ],
    label: "Metaraminol",
    dose: "0.5–1 mg IV bolus",
    route: "IV bolus",
    detail: "0.5–1 mg IV bolus. Repeat q3–5 min titrating to BP. Infusion: 10–100 mcg/min. Duration ~20 min.",
    caution: "Reflex bradycardia possible. Correct hypovolaemia first if possible.",
  },
];

// ── Bundle data ───────────────────────────────────────────────────────────────

const BUNDLES: Bundle[] = [
  {
    id: "apo",
    title: "APO",
    color: "sky",
    items: [
      {
        // CPG (4.5 APO): PEEP 5→15 cmH2O confirmed. Extended scope, not CPG-stated:
        // 2.5 cmH2O titration step, SpO2 94-98% range (CPG gives only a >94% floor, no
        // ceiling), continuous ETCO2 mention, and the contraindication list (CPG's only
        // related statement is permissive of CPAP with reduced LOC, not a GCS<10 cutoff).
        id: "apo-cpap",
        refs: [
          cpgRef("2.6", 82, "CPAP – start with PEEP of 5"),
          cpgRef("2.6", 81, "maximum PEEP of 15 mbar"),
          cpgRef("2.6", 81, "CPAP application may be considered in patients with a reduced level of consciousness"),
          cpgAbsent("2.6", "2.5 cmH2O titration step, SpO2 98% ceiling and CPAP contraindication list"),
        ],
        label: "CPAP",
        sublabel: "5 → 15 cmH₂O  |  FiO₂ to SpO₂ 94–98%",
        detail: "Start PEEP 5 cmH₂O. Titrate in 2.5 cmH₂O steps to maximum 15 cmH₂O. Adjust FiO₂ to target SpO₂ 94–98%. Continuous ETCO₂ monitoring. Ensure mask seal.",
        caution: "Contraindicated: active vomiting · facial trauma · GCS <10 · suspected pneumothorax",
      },
      {
        // Extended scope — no numeric ETCO2 target appears anywhere in the CPG.
        id: "apo-etco2",
        refs: [
          cpgAbsent("2.6", "numeric ETCO2 target (35-45 mmHg)"),
        ],
        label: "ETCO₂",
        sublabel: "Target 35–45 mmHg",
        detail: "Waveform capnography. Normal 35–45 mmHg. Elevated ETCO₂ → CO₂ retention / hypoventilation. Low ETCO₂ → hyperventilation or poor perfusion (PE, low cardiac output).",
      },
      {
        id: "apo-gtn",
        refs: [
          cpgRef("2.6", 341, "SL 0.4 - 1.2mg (1 - 3 sprays) Repeat PRN every 5 minutes and SBP >100mmHg"),
          cpgRef("2.6", 341, "INF 100mcg/min Dilute to 1mg/1ml. Infuse at 6ml/hr Increase/decrease dose as required by 0.6ml/hr"),
          cpgAbsent("2.6", "GTN APO SL 'max 3 doses' (CPG: repeat PRN) — open item for clinical governance"),
        ],
        label: "GTN",
        sublabel: "400–1200 mcg SL q5 min  |  IV 100 mcg/min",
        detail: "SL: 400–1200 mcg (1–3 sprays) q5 min and SBP >100 mmHg, max 3 doses.\nIV infusion: 100 mcg/min. Dilute to 1 mg/mL, infuse at 6 mL/hr. Titrate in ~10 mcg/min (0.6 mL/hr) steps to BP.",
        caution: "Hold if: SBP <100 · HR <50 or >100 · inferior/RV STEMI · PDE-5 inhibitor within 24–48 h (sildenafil / tadalafil)",
      },
      {
        // CPG (4.5 APO): "12-lead ECG" is a listed algorithm step. Transmission
        // instruction is extended scope (general practice, not APO-specific in CPG).
        id: "apo-12ecg",
        refs: [
          cpgRef("2.6", 82, "Request CCP assistance • 12 - lead ECG"),
          cpgAbsent("2.6", "ECG transmission instruction"),
        ],
        label: "12-lead ECG",
        sublabel: "Obtain → interpret → transmit",
        detail: "Perform early. Look for: STE, posterior changes, LBBB, AF. Repeat with any clinical change. Transmit to receiving facility if capability available.",
      },
    ],
  },
  {
    id: "all-critical",
    title: "All Critical Patients",
    color: "red",
    items: [
      {
        // CPG (general monitoring standard): "every 5 minutes for unstable/
        // critically ill or injured patients" -- corrected from q2min, which CPG
        // reserves specifically for patients on an Adrenaline or Phenylephrine
        // infusion, not as the general critical-patient cadence. The SBP/pulse-
        // pressure flags below are extended scope -- not stated anywhere in CPG.
        id: "crit-bp",
        refs: [
          cpgRef("2.6", 19, "every 5 minutes for unstable/critically ill or injured patients"),
          cpgRef("2.6", 300, "Cycle BP every 2 minutes when administering via infusion"),
          cpgRef("2.6", 381, "Blood pressure must be closely monitored every 2 minutes"),
          cpgAbsent("2.6", "SBP / pulse-pressure flag values"),
        ],
        label: "BP every 5 minutes",
        sublabel: "Automated NIBP — q5 min cycle",
        detail: "Set NIBP to cycle q5 min (q2 min if on Adrenaline/Phenylephrine infusion). Document trend. Flags: SBP <90 (shock), SBP >180 (hypertensive emergency), pulse pressure <25 (tamponade/cardiogenic), wide pulse pressure (aortic regurgitation, sepsis).",
      },
      {
        // CPG: "Consider placing defib pads in the A/P position" for
        // critically ill/confirmed AMI patients.
        id: "crit-defib",
        refs: [
          cpgRef("2.6", 19, "Consider placing defib pads in the A/P position"),
        ],
        label: "Defib pads on",
        sublabel: "Hands-free pads — monitor mode",
        detail: "Apply anterior-lateral (or anterior-posterior) defibrillation pads. Select monitor mode. Enable continuous rhythm display. Ready for immediate cardioversion or defibrillation.",
      },
      {
        // CPG: continuous/mandatory-if-intubated ETCO2 confirmed.
        // Extended scope: the 35-45 mmHg numeric target -- no target range
        // appears anywhere in the CPG.
        id: "crit-etco2",
        refs: [
          cpgRef("2.6", 19, "Continuous EtCO2 together with basic monitoring is required"),
          cpgAbsent("2.6", "numeric ETCO2 target (35-45 mmHg)"),
        ],
        label: "ETCO₂",
        sublabel: "Target 35–45 mmHg",
        detail: "Continuous waveform capnography. If intubated: mandatory. Sudden ETCO₂ drop → check perfusion, tube position, PE. Trending ETCO₂ reflects cardiac output during CPR.",
      },
      {
        // Extended scope — QRS beep setting and the 130/40 bpm alarm limits
        // do not appear anywhere in the CPG.
        id: "crit-qrs",
        refs: [
          cpgAbsent("2.6", "QRS beep and 130/40 bpm alarm limits"),
        ],
        label: "QRS / HR tone HIGH",
        sublabel: "Audible alarm — max sensitivity",
        detail: "Enable QRS beep on maximum audible volume. Set HR high alarm 130 bpm, low alarm 40 bpm. Audible monitoring frees attention for other tasks while maintaining rhythm awareness.",
      },
      {
        // COPD figure corrected to CPG 5.2 in a prior pass. The
        // 94-98% range is CPG-stated for post-ROSC patients (CPG 2.6); for other
        // critical patients CPG states only a ≥94% floor (e.g. APO, trauma).
        id: "crit-spo2",
        refs: [
          cpgRef("2.6", 92, "maintain SpO2 between 88 - 92%"),
          cpgRef("2.6", 54, "SpO2 between 94% - 98%"),
        ],
        label: "SpO₂ — opposite arm to BP",
        sublabel: "Contralateral limb to NIBP cuff",
        detail: "SpO₂ probe on opposite arm/finger to BP cuff — prevents artefact during NIBP cycles. Target SpO₂ 94–98% (88–92% in COPD/chronic hypercapnia).",
      },
      {
        // CPG: "HR (4-lead ECG/Pads)"; "12-lead ECG (when appropriate)".
        id: "crit-ecg",
        refs: [
          cpgRef("2.6", 19, "HR (4 - lead ECG/Pads)"),
          cpgRef("2.6", 17, "12 - lead ECG (when appropriate)"),
        ],
        label: "4 / 12-lead ECG",
        sublabel: "Baseline + repeat PRN",
        detail: "Minimum 4-lead continuous monitoring. Obtain 12-lead as soon as patient stabilised. Repeat with any clinical change (pain, dyspnoea, haemodynamic shift, rhythm change).",
      },
    ],
  },
  {
    id: "all-sedated",
    title: "All Sedated Patients",
    color: "violet",
    tip: "Fulfilling the All Critical bundle automatically fulfils this bundle — treat all sedated patients as critical.",
    items: [
      {
        // CPG (11.3 Procedural Sedation): 5-min monitoring interval
        // confirmed. TBI MAP split corrected to CPG 10.2 / 2.6 in a prior pass.
        id: "sed-bp",
        refs: [
          cpgRef("2.6", 211, "BP (every 5 minutes)"),
          cpgRef("2.6", 174, "target MAP of 70 - 80mmHg for adults"),
          cpgRef("2.6", 174, "TBI and associated polytrauma, aim for a target MAP of ≥ 65mmHg"),
        ],
        label: "BP every 5 minutes",
        sublabel: "Automated NIBP — q5 min minimum",
        detail: "q5 min minimum; increase frequency if haemodynamically unstable. Target MAP >65 mmHg (isolated TBI: 70–80 mmHg · TBI + polytrauma: ≥65 mmHg). Document MAP trend.",
      },
      {
        // CPG: mandatory-if-intubated and tube-placement confirmation
        // both confirmed. Extended scope: 35-45 mmHg target and 30-35 mmHg raised-
        // ICP target -- CPG's TBI guidance on CO2 is qualitative only, no numbers.
        id: "sed-etco2",
        refs: [
          cpgRef("2.6", 19, "Advanced airway placement"),
          cpgAbsent("2.6", "ETCO2 35-45 / 30-35 mmHg targets"),
        ],
        label: "ETCO₂ — mandatory",
        sublabel: "Continuous waveform — 35–45 mmHg",
        detail: "Mandatory for all intubated patients. Confirms tube placement. Target ETCO₂ 35–45 mmHg. Target 30–35 mmHg if suspected raised ICP (TBI, massive stroke).",
        caution: "Loss of ETCO₂ waveform = assume tube displacement until proven otherwise. Stop and reassess.",
      },
      {
        // CPG (post-ROSC): SpO2 94-98% and "Avoid hyperoxaemia (SpO2 at
        // 100% for prolonged periods)". For other sedated patients CPG states only
        // a ≥94% floor; the >98% cut-off and outcome rationale are extended scope.
        id: "sed-spo2",
        refs: [
          cpgRef("2.6", 54, "Avoid hyperoxaemia (SpO2 at 100% for prolonged periods)"),
          cpgAbsent("2.6", "SpO2 >98% cut-off outside post-ROSC care"),
        ],
        label: "SpO₂ — opposite arm to BP",
        sublabel: "Contralateral limb to NIBP cuff",
        detail: "Post-intubation target SpO₂ 94–98%. Avoid hyperoxia (>98%) — associated with worse neurological outcomes post-arrest/TBI. Titrate FiO₂ down once stable.",
      },
      {
        // CPG: 4-lead ECG is mandatory sedation monitoring. Arrhythmia
        // rationale text is supplementary teaching, not itself a CPG quote.
        id: "sed-4ecg",
        refs: [
          cpgRef("2.6", 211, "ECG (4 - lead)"),
        ],
        label: "4-lead ECG",
        sublabel: "Continuous cardiac monitoring",
        detail: "Sedation and intubation can provoke arrhythmias (vagal, sympathetic response). Continuous 4-lead monitoring. Defib pads applied and charged.",
      },
      {
        id: "sed-vent",
        refs: [
          cpgRef("2.6", 217, "Calculate ideal body weight (IBW) in kg = height (cm) – 100"),
          cpgRef("2.6", 215, "Respiratory Rate 12 - 14 breaths/min"),
          cpgRef("2.6", 215, "Tidal Volume 6 - 8 ml/kg"),
        ],
        label: "Ventilation Settings",
        sublabel: "Calculate tidal volume from IBW →",
        calculator: "ventilation",
      },
    ],
  },
  {
    id: "anaphylaxis",
    title: "Anaphylaxis",
    color: "orange",
    items: [
      {
        // IV range corrected alongside ADRENALINE_OPTIONS above (CPG).
        id: "ana-adr",
        label: "Adrenaline",
        sublabel: "500 mcg IM  |  20–50 mcg IV",
        options: ADRENALINE_OPTIONS,
      },
      {
        // CPG: "IM/IV/IO 50mg — Single dose" -- corrected from
        // a 25-50mg range to the CPG's fixed 50mg dose.
        id: "ana-diph",
        refs: [
          cpgRef("2.6", 326, "IM/IV/IO 50mg Single dose"),
          cpgRef("2.6", 115, "Diphenhydramine 50mg IV/IM"),
        ],
        label: "Diphenhydramine IV",
        sublabel: "50 mg IV slow",
        detail: "50 mg slow IV/IO over 2–3 min. H₁ antihistamine — adjunct to adrenaline, not a replacement. Reduces urticaria and angioedema.",
        caution: "Does NOT treat hypotension or bronchospasm. Adrenaline remains primary treatment.",
      },
      {
        // CPG: "IV Fluids 500-1000ml repeat as required" -- corrected
        // from a fixed 1,000 mL to the CPG's repeatable 500-1000 mL bolus.
        id: "ana-fluids",
        refs: [
          cpgRef("2.6", 116, "IV Fluids 500 - 1000ml repeat as required"),
        ],
        label: "Fluids IV",
        sublabel: "500–1,000 mL NaCl 0.9%, repeat PRN",
        detail: "500 mL–1 L bolus NaCl 0.9% IV (pressure bag if required). Repeat PRN. Distributive shock — large volumes may be needed. Reassess BP and HR after each bolus.",
      },
      {
        // CPG: "IM/IV/IO 200mg — Single dose" confirmed.
        id: "ana-hydro",
        refs: [
          cpgRef("2.6", 115, "Hydrocortisone 200mg IV/IM"),
        ],
        label: "Hydrocortisone IV",
        sublabel: "200 mg IV",
        detail: "200 mg IV slow over 2–3 min. Prevents biphasic anaphylaxis reaction (second reaction 1–72 h later).",
        caution: "Onset 4–6 hours — NOT effective for acute resuscitation. Adjunct only.",
      },
    ],
  },
  {
    id: "asthma-lt",
    title: "Asthma — Life Threatening",
    color: "amber",
    items: [
      {
        // IV range corrected alongside ADRENALINE_OPTIONS (CPG).
        id: "asth-adr",
        label: "Adrenaline",
        sublabel: "500 mcg IM  |  20–50 mcg IV",
        options: ADRENALINE_OPTIONS,
      },
      {
        // CPG: "Fluid bolus - 250-500ml repeat as required"; overall
        // adult cap 1L. Corrected from a fixed 500-1,000mL bolus.
        id: "asth-fluids",
        refs: [
          cpgRef("2.6", 91, "Fluid bolus – 250 - 500ml repeat as required"),
          cpgRef("2.6", 90, "A maximum of 1L normal saline for adults"),
        ],
        label: "Fluids IV",
        sublabel: "250–500 mL bolus, repeat PRN (max 1 L)",
        detail: "250–500 mL NaCl 0.9% IV bolus, repeat as required (max 1 L total). Patients are often dehydrated from increased work of breathing. IV fluid supports preload during elevated intrathoracic pressures.",
      },
      {
        // CPG: "Hydrocortisone 200mg IV" confirmed.
        id: "asth-hydro",
        refs: [
          cpgRef("2.6", 91, "Hydrocortisone 200mg IV"),
        ],
        label: "Hydrocortisone IV",
        sublabel: "200 mg IV",
        detail: "200 mg IV slow. Reduces bronchial inflammation. Onset 4–6 hours — adjunct to bronchodilators for acute phase.",
      },
      {
        // CPG: dose and 20-min interval confirmed; "max 3 doses"
        // corrected to CPG's "may be repeated once after 20 minutes" = max 2.
        id: "asth-ipra",
        refs: [
          cpgRef("2.6", 91, "May be repeated once after 20 minutes if required"),
          cpgRef("2.6", 90, "A maximum of 2 doses of Ipratropium Bromide may be given 20 minutes apart"),
        ],
        label: "Ipratropium Bromide NEB",
        sublabel: "500 mcg NEB — max 2 doses",
        detail: "500 mcg (0.5 mg) nebulised via O₂ at 6–8 L/min. Combine with salbutamol in same NEB cup (synergistic). May repeat once after 20 min. If further doses required, request CCP assistance.",
        caution: "Less effective as sole bronchodilator — use in combination with salbutamol.",
      },
      {
        id: "asth-mag",
        refs: [
          cpgRef("2.6", 360, "2g Infused over 10 minutes. May repeat once to a max dose of 4g"),
          cpgRef("2.6", 91, "Magnesium 1 - 2g IV"),
        ],
        label: "Magnesium Sulphate IV",
        sublabel: "2 g IV over 10 min",
        detail: "2 g (4 mL of 50% solution) diluted in 100 mL NaCl 0.9%. Infuse over 10 minutes. May repeat once to a max dose of 4 g. Smooth muscle relaxant → bronchodilation.",
        caution: "Rapid infusion → flushing, hypotension, arrhythmia. Monitor BP throughout infusion.",
      },
      {
        // CPG: 5mg dose confirmed ("5mg repeat as required"). Extended
        // scope: "back-to-back continuously" -- CPG only says "repeat as
        // required", doesn't specify pacing for the life-threatening tier.
        id: "asth-salb",
        refs: [
          cpgRef("2.6", 91, "Salbutamol – 5mg repeat as required"),
          cpgAbsent("2.6", "back-to-back continuous nebulisation"),
        ],
        label: "Salbutamol NEB",
        sublabel: "5 mg NEB — back-to-back continuous",
        detail: "5 mg (5 mL of 0.1% solution) nebulised via O₂ at 6–8 L/min. Life-threatening: give back-to-back continuously. Combine with ipratropium in same NEB cup if available.",
      },
    ],
  },
  {
    id: "covid",
    title: "COVID-19",
    color: "teal",
    items: [
      {
        // CPG: 6mg single dose confirmed; oral route added
        // (CPG: "IM or oral route may be used if IV access not available",
        // previously omitted). Trigger broadened to match CPG's actual
        // criterion -- not purely an SpO2<93% cutoff, but any patient on CPAP
        // or requiring supplemental O2 to maintain SpO2 >93%.
        id: "covid-dexa",
        refs: [
          cpgRef("2.6", 293, "Dexamethasone 6mg IV"),
          cpgRef("2.6", 293, "for any patient placed on CPAP or who requires supplemental oxygen to maintain SpO2 > 93%"),
          cpgRef("2.6", 293, "IM or oral route may be used if IV access not available"),
          cpgRef("2.6", 318, "IV/IO/IM 6mg Single dose"),
        ],
        label: "Dexamethasone IV / IM / PO",
        sublabel: "6 mg — single dose",
        note: "if on CPAP or needs O₂ to keep SpO₂ > 93%",
        detail: "6 mg IV, IM, or PO as a single pre-hospital dose. Anti-inflammatory — reduces cytokine storm in COVID-19 pneumonitis. IV preferred if access available; oral/IM if not.",
        caution: "Administer if on CPAP, or requires supplemental O₂ to maintain SpO₂ >93%. Immunosuppressive — document administration.",
      },
      {
        // CPG (17.1): "PEEP at 10cmH2O, increase up to 12-15 cmH2O" --
        // corrected from 5->10; both the start and ceiling were too low. Trigger
        // corrected from "RR > 30" to "RR >= 30" to match CPG's stated cutoff.
        // Contraindication list is extended scope -- no such list in CPG.
        id: "covid-cpap",
        refs: [
          cpgRef("2.6", 293, "PEEP at 10cmH2O, increase up to 12 - 15 cmH2O"),
          cpgRef("2.6", 293, "CPAP for all patients with RR ≥ 30 AND/OR SpO2 < 93%"),
          cpgAbsent("2.6", "COVID CPAP contraindication list"),
        ],
        label: "CPAP",
        sublabel: "10 → 12–15 cmH₂O  |  FiO₂ to SpO₂ 94–98%",
        note: "if RR ≥ 30 or SpO₂ < 93%",
        detail: "Start PEEP 10 cmH₂O. Titrate up to 12–15 cmH₂O if tolerated and SpO₂ improving. Adjust FiO₂ for SpO₂ 94–98%. Monitor for fatigue — patient must maintain airway.",
        caution: "Contraindicated: GCS <10 · vomiting · haemodynamic instability · inability to protect airway",
      },
    ],
  },
  {
    id: "major-trauma",
    title: "Major Trauma",
    color: "rose",
    items: [
      {
        id: "trauma-analg",
        label: "Analgesia",
        sublabel: "Select agent ↓",
        options: ANALGESIA_OPTIONS,
      },
      {
        // CPG: "maintain MAP just above 65mmHg" -- corrected trigger
        // from "MAP < 50" (no "50" figure appears anywhere in CPG) to <65.
        id: "trauma-vaso",
        refs: [
          cpgRef("2.6", 172, "maintain MAP just above 65mmHg"),
        ],
        label: "Vasopressor",
        sublabel: "If MAP < 65 despite fluids",
        note: "Refractory hypotension despite fluids",
        options: VASOPRESSOR_OPTIONS,
      },
      {
        // CPG (also 174-175): "Aim to maintain a MAP 65mmHg for adults...
        // IV fluid 250ml boluses (Max 1L)" -- target parameter corrected from
        // SBP 80-90 (permissive hypotension) to CPG's MAP 65 target, and cap
        // corrected from >2L to the CPG's 1L. FLAGGED: the "penetrating torso
        // SBP~80" caution has no CPG source and is expressed in SBP terms
        // while the rest of this item is now MAP-based per the fix above --
        // kept as extended scope per policy, but worth a clinical read since
        // mixing SBP/MAP framing in the same item could read as inconsistent
        // in the field.
        id: "trauma-fluids",
        refs: [
          cpgRef("2.6", 172, "Aim to maintain a MAP ≥65mmHg for adults"),
          cpgRef("2.6", 173, "IV fluid 250ml boluses (Max 1L)"),
          cpgAbsent("2.6", "penetrating torso SBP ~80 target"),
        ],
        label: "Fluids IV",
        sublabel: "250 mL bolus → target MAP 65 mmHg",
        note: "Permissive resuscitation",
        detail: "250 mL NaCl 0.9% IV bolus. Reassess after each bolus. Target MAP just above 65 mmHg — do not attempt to restore normotension. Max 1 L crystalloid.",
        caution: "Exception — TBI: target MAP 70–80 mmHg if isolated, ≥65 mmHg if polytrauma. Penetrating torso: target SBP ~80 until surgical haemostasis (extended scope, not in CPG).",
      },
      {
        // Extended scope — for trauma CPG states only a ≥94% floor;
        // its 94-98% range applies to post-ROSC patients only (CPG 2.6).
        id: "trauma-o2",
        refs: [
          cpgRef("2.6", 177, "maintain SpO2 ≥94%"),
          cpgAbsent("2.6", "trauma SpO2 98% ceiling"),
        ],
        label: "Oxygen",
        sublabel: "Target SpO₂ 94–98%",
        detail: "High-flow O₂ initially, then titrate FiO₂ down. Target SpO₂ 94–98%. Avoid hyperoxia (>98%) — associated with worse outcomes in trauma.",
        caution: "Maintain SpO₂ 94–98%. Do not chase 100%.",
      },
      {
        // CPG: dose, dilution, duration, <3h window, and TBI GCS<=12
        // trigger all confirmed.
        id: "trauma-txa",
        refs: [
          cpgRef("2.6", 393, "Add 2 g to 100ml NS and infuse over 10 minutes"),
          cpgRef("2.6", 392, "major trauma < 3 hours old"),
          cpgRef("2.6", 392, "Traumatic brain injury with GCS ≤ 12"),
        ],
        label: "TXA IV",
        sublabel: "2 g in 100 mL NaCl over 10 min",
        detail: "2 g tranexamic acid IV/IO in 100 mL NaCl 0.9% infused over 10 minutes for adult traumatic major haemorrhage or TBI with GCS ≤12.",
        caution: "Must be given WITHIN 3 hours of injury. Possible harm if given after 3 hours.",
      },
    ],
  },
  {
    id: "stemi",
    title: "STEMI",
    color: "emerald",
    items: [
      {
        // NOTE: CPG's ACS algorithm lists only Penthrox and Fentanyl for
        // STEMI/ACS analgesia -- Ketamine isn't listed, and its own formulary
        // entry flags suspected ACS as a precaution requiring reduced dosing.
        // ANALGESIA_OPTIONS is shared with Major Trauma, where Ketamine is
        // appropriate; splitting the option set per bundle is a structural
        // change beyond a value fix, not made here -- flagged for review.
        id: "stemi-analg",
        refs: [
          cpgRef("2.6", 73, "Consider Penthrox – 3ml"),
        ],
        label: "Analgesia",
        sublabel: "Select agent ↓",
        options: ANALGESIA_OPTIONS,
      },
      {
        // CPG: "Aspirin - 300mg" confirmed for both STEMI and ACS-Other
        // pathways. Extended scope: "chewed" administration detail (CPG doesn't
        // specify; chewing-speeds-absorption is standard pharmacology, not
        // contradicted by anything in CPG).
        id: "stemi-asp",
        refs: [
          cpgRef("2.6", 73, "Aspirin – 300mg"),
          cpgAbsent("2.6", "'chewed' administration detail"),
        ],
        label: "Aspirin",
        sublabel: "300 mg PO — chewed",
        detail: "300 mg dispersible or regular tablet chewed stat. Irreversible COX-1 inhibition → antiplatelet. Chewing speeds absorption (onset ~5 min vs 15–30 min swallowed).",
        caution: "Hold if: aspirin allergy · active GI haemorrhage · severe thrombocytopaenia",
      },
      {
        // CPG: "Clopidogrel - 600mg (AP only to administer following
        // Clinical Desk advice)"; withhold-if-non-diagnostic rule confirmed.
        id: "stemi-clop",
        refs: [
          cpgRef("2.6", 73, "Clopidogrel – 600mg (AP only to administer following"),
          cpgRef("2.6", 315, "only for administration for identified STEMI"),
          cpgRef("2.6", 72, "withholding Clopidogrel"),
        ],
        label: "Clopidogrel",
        sublabel: "600 mg PO — STEMI only",
        detail: "600 mg PO single loading dose for identified STEMI. AP administration should follow Clinical Desk advice.",
        caution: "Withhold for suspected STEMI when the initial ECG does not meet STEMI criteria, and hold if active major bleeding or true contraindication.",
      },
      {
        // CPG: "Consider the A/P position as the primary placement" for
        // STEMI -- corrected from "anterior-lateral" as the stated method.
        id: "stemi-defib",
        refs: [
          cpgRef("2.6", 72, "Consider the A/P position as the primary placement"),
        ],
        label: "Defib pads on",
        sublabel: "Anterior-posterior preferred — monitor mode",
        detail: "Apply defib pads immediately on confirmed STEMI, A/P position as primary placement (anterior-lateral if A/P not practical). High risk of VF. Continuous rhythm monitoring. Crew briefed to defibrillate immediately if VF.",
      },
      {
        id: "stemi-gtn",
        refs: [
          cpgRef("2.6", 341, "Acute Coronary Syndrome SL 0.4mg (1 spray) Repeat PRN every 5 minutes and SBP >100mmHg"),
          cpgRef("2.6", 341, "5 - 20mcg/min Dilute to 50mg / 500ml = 0.1mg/ml"),
          cpgRef("2.6", 341, "IV GTN may be considered if unresponsive to SL GTN"),
        ],
        label: "GTN",
        sublabel: "400 mcg SL (1 spray) q5 min  |  IV 5–20 mcg/min",
        detail: "SL: 400 mcg (1 spray), repeat PRN q5 min and SBP >100 mmHg.\nIV infusion (if unresponsive to SL/analgesia, STEMI only): 5–20 mcg/min. Dilute to 0.1 mg/mL, infuse at 3–12 mL/hr. Titrate by 5 mcg/min increments to BP.",
        caution: "Hold if: SBP <100 · HR <50 or >100 · inferior STEMI (RV infarct) · PDE-5 inhibitor within 24–48 h",
      },
      {
        // CPG checked directly: the CPG does NOT itself quantify STE
        // mm/lead-count thresholds for STEMI (treated as a known clinical
        // skill) -- that numeric criterion here is extended scope, not CPG-
        // stated. What IS CPG-confirmed: ST depression in V1-V3 = posterior
        // STEMI equivalent (corrected from being folded into the STE/mm
        // criteria above -- it's a distinct finding, not an elevation
        // threshold). "New LBBB" corrected to match CPG's actual stance:
        // "Isolated LBBB without symptoms suggestive of a STEMI should be
        // transported to the nearest ED, not Heart Hospital" -- the opposite
        // of treating LBBB as a bypass trigger. "Transmit to cath lab /
        // pre-notify cardiology / repeat every 15 min" replaced with CPG's
        // actual terminology and repeat rule: notify Heart Hospital, and (for
        // suspected-but-non-diagnostic STEMI only) repeat 12-lead on ED
        // arrival before unloading -- not a periodic en-route interval.
        id: "stemi-12ecg",
        refs: [
          cpgRef("2.6", 72, "ST depression in leads V1 – V3"),
          cpgRef("2.6", 72, "Isolated LBBB without symptoms suggestive of a STEMI"),
          cpgRef("2.6", 72, "repeat a 12 - lead ECG on arrival at the Emergency department prior to unloading"),
          cpgAbsent("2.6", "numeric STE mm / lead-count thresholds"),
        ],
        label: "12-lead ECG",
        sublabel: "Obtain → notify Heart Hospital",
        detail: "Perform 12-lead immediately. STEMI-meeting ECG, or ST depression in V₁–V₃ (posterior STEMI equivalent) → Transport P1 to Heart Hospital, notify en route. Isolated LBBB without STEMI symptoms → nearest ED, not Heart Hospital. If suspected but non-diagnostic: withhold Clopidogrel, repeat 12-lead on ED arrival before unloading.",
      },
    ],
  },
  {
    id: "stroke",
    title: "Stroke",
    color: "indigo",
    items: [
      {
        // CPG: B/E/F/A/S/T definitions; RACE scale. (cpg-history: RACE was added in v2.6.)
        id: "stroke-befast",
        refs: [
          cpgRef("2.6", 63, "BALANCE Does the patient have a sudden loss of balance"),
          cpgRef("2.6", 63, "If the RACE Score is ≥ 5"),
        ],
        label: "BEFAST + RACE",
        sublabel: "Balance · Eyes · Face · Arms · Speech · Time",
        detail: "B — Balance: sudden loss of coordination or balance\nE — Eyes: sudden vision change (blurred, double, loss)\nF — Face: facial droop (ask patient to smile)\nA — Arms: arm or leg drift or weakness\nS — Speech: slurred, wrong words, no speech\nT — Time: record exact onset time. If unknown → time last seen well.\nRACE (BEFAST positive, onset > 8 h & < 24 h): facial palsy, arm, leg, head & gaze deviation, aphasia (right hemiparesis) or agnosia (left). Total 0–9; ≥ 5 = possible large vessel occlusion. Use the Stroke tool to score.",
      },
      {
        // CPG Stroke Transport Destination Decision Tree replaces the earlier
        // <15h window (cpg-history: v2.5). Extended scope, kept: the "~1.9 million neurons/min"
        // statistic doesn't appear in CPG.
        id: "stroke-p1",
        refs: [
          cpgRef("2.6", 64, "STROKE TRANSPORT DESTINATION DECISION TREE"),
          cpgRef("2.6", 64, "Wake - up or unknown - onset stroke should be treated as an acute stroke"),
          cpgRef("2.6", 62, "Anticoagulant status"),
          cpgAbsent("2.6", "'~1.9 million neurons/min' statistic"),
        ],
        label: "Destination — decision tree",
        sublabel: "≤ 8 h or wake-up/unknown → P1 HGH ED",
        note: "BEFAST positive · RACE if > 8 h & < 24 h",
        detail: "BEFAST positive and onset / last known well ≤ 8 h, or wake-up / unknown onset → P1 to HGH ED.\n> 8 h & < 24 h → perform RACE: ≥ 5 → P1 to HGH ED; < 5 → P2 to nearest appropriate ED.\n≥ 24 h → P2 to nearest appropriate ED.\nFor P1: update CC:E and prenotify (age, onset / last seen well, BEFAST, RACE, RBS, BP, anticoagulants, ETA). Every 1 min of delay = ~1.9 million neurons lost.",
        caution: "Wake-up / unknown-onset stroke is treated as acute stroke (P1 HGH). Do not delay on scene waiting for a CCP — meet en route.",
      },
      {
        // CPG: <4.0 mmol/L threshold confirmed. Dose corrected
        // from 100 mL to CPG's "15-20g D10W (150-200ml)". Recheck instruction
        // corrected from a fixed 5-min timer to CPG's actual rule: "repeat if
        // patient remains hypoglycaemic" -- CPG doesn't specify a time interval.
        id: "stroke-rbs",
        refs: [
          cpgRef("2.6", 119, "Dextrose 10% IV 150 - 200ml"),
          cpgRef("2.6", 321, "15 - 20g D10W (150 - 200ml)"),
          cpgRef("2.6", 321, "Repeat if patient remains hypoglycaemic"),
          cpgRef("2.6", 320, "RBS < 4mmol/L for paediatrics and adults"),
        ],
        label: "RBS",
        sublabel: "Check BSL — treat if < 4.0 mmol/L",
        detail: "Check blood glucose on all stroke patients — hypoglycaemia mimics stroke. If BSL <4.0 mmol/L: administer 150–200 mL (15–20 g) Dextrose 10% IV. Repeat if patient remains hypoglycaemic. Document result.",
        caution: "Do NOT treat hyperglycaemia in the field — worsens outcome in ischaemic stroke",
      },
      {
        // Extended scope, kept per policy — CPG's stroke BP guidance (CPG 3.1)
        // is monitor-only and qualitative ("do not attempt to reduce BP using
        // nitrates if hypertensive"); no active-treatment thresholds, target
        // reduction percentage, or "avoid SBP<140" figure appear anywhere in
        // CPG. FLAGGED FOR CLINICAL REVIEW: this isn't a minor omission --
        // CPG's silence here reflects a deliberate permissive-hypertension
        // stance in acute stroke, and this bundle actively directs BP-lowering
        // against thresholds CPG doesn't set. Worth explicit governance
        // sign-off given the direction of the discrepancy (CPG: don't
        // intervene; bundle: intervene above defined numbers).
        id: "stroke-bp",
        refs: [
          cpgRef("2.6", 63, "DO NOT attempt to reduce BP using nitrates if the patient is hypertensive"),
          cpgAbsent("2.6", "active BP-lowering thresholds (SBP >220 / >180, 10-15% reduction, avoid SBP <140) — open item for clinical governance"),
        ],
        label: "Regular BP monitoring",
        sublabel: "Monitor — do NOT aggressively treat",
        detail: "Elevated BP is protective in acute stroke — do not lower routinely.\nTreat only if:\n• Ischaemic: SBP >220 or DBP >120 with end-organ damage\n• Haemorrhagic: SBP >180 mmHg\nIf treating: target SBP reduction of 10–15% over first hour.",
        caution: "Aggressive BP lowering → cerebral hypoperfusion → worsens stroke. Avoid any hypotension (SBP <140).",
      },
    ],
  },
];

// ── Ventilation calculator ────────────────────────────────────────────────────

function VentilationCalculator({ color }: { color: BundleColor }) {
  const [heightCm, setHeightCm] = useState<string>("");
  const c = COLOR[color];

  const h = parseFloat(heightCm);
  // CPG: "Calculate ideal body weight (IBW) in kg = height (cm) - 100" --
  // a single flat formula, no sex split. Corrected from the Devine formula
  // (previously sex-differentiated, based on height - 152.4), which is why the
  // sex toggle that used to sit above the height input has been removed -- it
  // no longer affects the CPG-specified calculation. 30kg floor is extended
  // scope (a sensible clamp for short stature, not itself a CPG figure).
  const ibw = !isNaN(h) && h > 100 ? Math.max(30, h - 100) : null;

  const tvLow = ibw != null ? Math.round(ibw * 6) : null;
  const tvHigh = ibw != null ? Math.round(ibw * 8) : null;

  return (
    <div className="mt-3 space-y-3">
      {/* Height input */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
        <Wind className="h-4 w-4 shrink-0 text-slate-500" />
        <input
          type="number"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          placeholder="Height (cm)"
          min={100}
          max={220}
          className="flex-1 bg-transparent text-base text-slate-100 placeholder:text-slate-600 outline-none"
        />
        <span className="text-xs text-slate-500">cm</span>
      </div>

      {/* Results */}
      {ibw != null && tvLow != null && tvHigh != null ? (
        <div className={`rounded-xl border p-4 space-y-3 ${c.banner}`}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Calculated Settings</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "IBW", value: `${ibw.toFixed(1)} kg` },
              { label: "Tidal Volume", value: `${tvLow}–${tvHigh} mL` },
              // CPG gives condition-specific rates (Normal Lungs 12-14 ·
              // Asthma/COPD 5-10 · APO/ARDS 12-16), not one flat figure. This
              // calculator has no lung-condition selector, so it defaults to
              // the Normal Lungs rate -- the other two bands aren't covered.
              { label: "Rate", value: "12–14 / min" },
              { label: "PEEP (start)", value: "5 cmH₂O" },
              { label: "I:E ratio", value: "1 : 2" },
              { label: "FiO₂ (start)", value: "100% → titrate" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-black/20 px-3 py-2">
                <p className="text-[0.6rem] font-semibold uppercase tracking-wider opacity-60">{label}</p>
                <p className="text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-[0.65rem] opacity-60">
            IBW: height (cm) − 100 · Tidal volume 6–8 mL/kg IBW · Rate shown is for normal lungs (CPG: Asthma/COPD 5–10, APO/ARDS 12–16)
          </p>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-600 py-2">Enter height to calculate settings</p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CareBundlesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(BUNDLES.map((b) => [b.id, new Set<string>()]))
  );
  const [expanded, setExpanded] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(BUNDLES.map((b) => [b.id, null]))
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(BUNDLES.map((b) => [b.id, {}]))
  );

  const bundle = BUNDLES.find((b) => b.id === selectedId) ?? null;

  const toggleCheck = (bundleId: string, itemId: string) => {
    setChecked((prev) => {
      const next = new Set(prev[bundleId]);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return { ...prev, [bundleId]: next };
    });
  };

  const toggleExpand = (bundleId: string, itemId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [bundleId]: prev[bundleId] === itemId ? null : itemId,
    }));
  };

  const selectOption = (bundleId: string, itemId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [bundleId]: { ...prev[bundleId], [itemId]: optionId },
    }));
    setChecked((prev) => {
      const next = new Set(prev[bundleId]);
      next.add(itemId);
      return { ...prev, [bundleId]: next };
    });
    setExpanded((prev) => ({ ...prev, [bundleId]: null }));
  };

  const resetBundle = (bundleId: string) => {
    setChecked((prev) => ({ ...prev, [bundleId]: new Set<string>() }));
    setExpanded((prev) => ({ ...prev, [bundleId]: null }));
    setSelectedOptions((prev) => ({ ...prev, [bundleId]: {} }));
  };

  const resetAll = () => {
    setChecked(Object.fromEntries(BUNDLES.map((b) => [b.id, new Set<string>()])));
    setExpanded(Object.fromEntries(BUNDLES.map((b) => [b.id, null])));
    setSelectedOptions(Object.fromEntries(BUNDLES.map((b) => [b.id, {}])));
  };

  // ── Bundle list ─────────────────────────────────────────────────────────────

  if (!bundle) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-24 pt-4">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/ccp-cca"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-teal-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            CCP / CCA
          </Link>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-500 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </button>
        </div>

        <header className="space-y-0.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-teal-500">CCP / CCA</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">Care Bundles</h1>
          <p className="text-xs text-slate-400">Tap a bundle to open the checklist</p>
        </header>

        <div className="flex flex-col gap-2">
          {BUNDLES.map((b) => {
            const c = COLOR[b.color];
            const done = checked[b.id].size;
            const total = b.items.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const complete = done === total;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedId(b.id)}
                className={`group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-left transition-all active:scale-[0.98] ${c.card}`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
                  {complete ? (
                    <CheckCheck className={`h-5 w-5 ${c.icon}`} />
                  ) : (
                    <span className={`text-base font-bold ${c.icon}`}>{done}/{total}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-50">{b.title}</p>
                    {complete && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${c.pill}`}>
                        Done
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full rounded-full transition-all duration-300 ${c.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[0.65rem] text-slate-500">{total} item{total !== 1 ? "s" : ""}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Checklist detail ────────────────────────────────────────────────────────

  const c = COLOR[bundle.color];
  const done = checked[bundle.id].size;
  const total = bundle.items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-24 pt-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-teal-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All bundles
        </button>
        <button
          type="button"
          onClick={() => resetBundle(bundle.id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-500 hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Header */}
      <header className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg}`}>
          <span className={`text-lg font-bold ${c.icon}`}>{done}/{total}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-slate-50">{bundle.title}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div className={`h-full rounded-full transition-all duration-300 ${c.bar}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-400">{pct}%</span>
          </div>
        </div>
      </header>

      {/* Tip */}
      {bundle.tip && (
        <div className={`flex gap-2 rounded-xl border px-4 py-3 text-sm ${c.banner}`}>
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{bundle.tip}</p>
        </div>
      )}

      {/* Complete banner */}
      {complete && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${c.banner}`}>
          <CheckCheck className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Bundle complete</p>
            <p className="text-xs opacity-75">All items checked off</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-2">
        {bundle.items.map((item) => {
          const isChecked = checked[bundle.id].has(item.id);
          const isExpanded = expanded[bundle.id] === item.id;
          const chosenOptionId = selectedOptions[bundle.id][item.id];
          const chosenOption = item.options?.find((o) => o.id === chosenOptionId);
          const isExpandable = !!(item.detail || item.options || item.calculator || item.caution);

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                isChecked ? `${c.bg} ${c.border}` : "border-slate-800 bg-slate-900/80"
              }`}
            >
              {/* Main row */}
              <div className="flex items-start gap-0">
                {/* Checkbox tap target */}
                <button
                  type="button"
                  onClick={() => toggleCheck(bundle.id, item.id)}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-l-2xl transition-colors active:scale-95 ${
                    isChecked ? c.check : "text-slate-600 hover:text-slate-400"
                  }`}
                  aria-label={isChecked ? "Uncheck" : "Check"}
                >
                  {isChecked ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>

                {/* Content + expand */}
                <button
                  type="button"
                  onClick={() => isExpandable && toggleExpand(bundle.id, item.id)}
                  className={`flex min-w-0 flex-1 items-center gap-2 py-3.5 pr-3 text-left ${isExpandable ? "" : "cursor-default"}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold leading-snug ${isChecked ? "text-slate-400 line-through decoration-slate-500" : "text-slate-50"}`}>
                      {item.label}
                    </p>
                    {/* Show selected option or sublabel */}
                    {chosenOption ? (
                      <p className={`mt-0.5 text-[0.72rem] font-medium ${c.icon}`}>
                        ✓ {chosenOption.label} — {chosenOption.dose}
                      </p>
                    ) : item.sublabel ? (
                      <p className={`mt-0.5 text-[0.72rem] ${isChecked ? "text-slate-600" : "text-slate-400"}`}>
                        {item.sublabel}
                      </p>
                    ) : null}
                    {item.note && (
                      <span className="mt-0.5 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[0.6rem] font-medium text-slate-400">
                        {item.note}
                      </span>
                    )}
                  </div>
                  {isExpandable && (
                    <span className="shrink-0 text-slate-600">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  )}
                </button>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="mx-3 mb-3 space-y-3 rounded-xl border border-slate-700/60 bg-slate-950/60 p-4">
                  {/* Ventilation calculator */}
                  {item.calculator === "ventilation" && (
                    <VentilationCalculator color={bundle.color} />
                  )}

                  {/* Detail text */}
                  {item.detail && (
                    <div className="space-y-1">
                      {item.detail.split("\n").map((line, i) => (
                        <p key={i} className="text-sm leading-relaxed text-slate-300">{line}</p>
                      ))}
                    </div>
                  )}

                  {/* Caution */}
                  {item.caution && (
                    <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <p className="text-xs leading-relaxed text-amber-200">{item.caution}</p>
                    </div>
                  )}

                  {/* Drug options */}
                  {item.options && (
                    <div className="space-y-2">
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Select agent</p>
                      {item.options.map((opt) => {
                        const isSel = chosenOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => selectOption(bundle.id, item.id, opt.id)}
                            className={`w-full rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${
                              isSel ? c.optSel : c.optUnsel
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold">{opt.label}</p>
                                <p className="text-xs opacity-80">{opt.dose}</p>
                                <p className="text-[0.68rem] opacity-60">{opt.route}</p>
                              </div>
                              {isSel && (
                                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${c.icon}`} />
                              )}
                            </div>
                            {(opt.detail || opt.caution) && (
                              <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2">
                                {opt.detail && (
                                  <div className="space-y-0.5">
                                    {opt.detail.split("\n").map((line, i) => (
                                      <p key={i} className="text-[0.7rem] opacity-70 leading-relaxed">{line}</p>
                                    ))}
                                  </div>
                                )}
                                {opt.caution && (
                                  <div className="flex gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5">
                                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                                    <p className="text-[0.65rem] text-amber-200">{opt.caution}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
