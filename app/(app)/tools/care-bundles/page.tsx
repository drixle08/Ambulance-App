"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Circle, RotateCcw, CheckCheck,
  ChevronDown, ChevronUp, AlertTriangle, Info, Wind,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type DoseOption = {
  id: string;
  label: string;
  dose: string;
  route: string;
  detail?: string;
  caution?: string;
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
    id: "adr-im",
    label: "Adrenaline IM",
    dose: "500 mcg (0.5 mg)",
    route: "IM — anterolateral thigh",
    detail: "Use 1:1,000 (1 mg/mL). Inject into anterolateral thigh. May repeat q5 min. Max 3 doses.",
    caution: "Confirm 1:1,000 concentration for IM. Do NOT use 1:10,000 IM.",
  },
  {
    id: "adr-iv",
    label: "Adrenaline IV",
    dose: "50–100 mcg (0.05–0.1 mg)",
    route: "IV slow bolus",
    detail: "Dilute 1:1,000 → 1:10,000: draw 1 mL adrenaline into 9 mL NaCl (0.1 mg/mL). Give 0.5–1 mL (50–100 mcg) slow IV. Titrate to response.",
    caution: "Continuous ECG mandatory. Risk of arrhythmia. Reserve for refractory cases / cardiovascular collapse.",
  },
];

const ANALGESIA_OPTIONS: DoseOption[] = [
  {
    id: "analg-methox",
    label: "Methoxyflurane (Penthrox)",
    dose: "3 mL inhaled",
    route: "Inhaled — Penthrox inhaler",
    detail: "3 mL per inhaler, self-administered. Onset 6–10 breaths. Can repeat with second 3 mL inhaler if required. Max 6 mL/day, 15 mL/week.",
    caution: "Avoid in renal/hepatic impairment, altered conscious state, or haemodynamic instability.",
  },
  {
    id: "analg-morph",
    label: "Morphine",
    dose: "2.5–5 mg IV  |  0.1 mg/kg IN",
    route: "IV slow / Intranasal",
    detail: "IV: 2.5–5 mg slow IV over 2–3 min. Titrate q5 min to effect. Max 10 mg total.\nIN: 0.1 mg/kg intranasal (max 10 mg). Split between nostrils if volume >0.5 mL per nostril.",
    caution: "Monitor RR. Naloxone ready. Avoid in hypovolaemia without concurrent fluid resuscitation.",
  },
  {
    id: "analg-fent",
    label: "Fentanyl",
    dose: "25–50 mcg IV  |  1–2 mcg/kg IN",
    route: "IV slow / Intranasal",
    detail: "IV: 25–50 mcg slow IV. Repeat q5 min to effect. Max 200 mcg.\nIN: 1–2 mcg/kg (max 200 mcg). Use atomiser. Split between nostrils.",
    caution: "Rapid respiratory depression possible. Continuous monitoring required.",
  },
  {
    id: "analg-ket",
    label: "Ketamine (sub-anaesthetic)",
    dose: "0.1–0.3 mg/kg IV",
    route: "IV slow bolus",
    detail: "Sub-anaesthetic dose for analgesia. Give slow IV over 2–3 min. Can repeat once. Dissociative at higher doses.",
    caution: "Monitor airway and haemodynamics. Emergence reactions possible. Have airway equipment ready.",
  },
];

const VASOPRESSOR_OPTIONS: DoseOption[] = [
  {
    id: "vaso-nora",
    label: "Noradrenaline",
    dose: "0.01–0.5 mcg/kg/min",
    route: "IV infusion",
    detail: "Preparation: 4 mg in 50 mL (80 mcg/mL) or per local protocol. Start 0.01–0.05 mcg/kg/min. Titrate q5 min to MAP ≥65 mmHg.",
    caution: "Extravasation → tissue necrosis. Central access preferred. First-line vasopressor.",
  },
  {
    id: "vaso-meta",
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
        id: "apo-cpap",
        label: "CPAP",
        sublabel: "5 → 15 cmH₂O  |  FiO₂ to SpO₂ 94–98%",
        detail: "Start PEEP 5 cmH₂O. Titrate in 2.5 cmH₂O steps to maximum 15 cmH₂O. Adjust FiO₂ to target SpO₂ 94–98%. Continuous ETCO₂ monitoring. Ensure mask seal.",
        caution: "Contraindicated: active vomiting · facial trauma · GCS <10 · suspected pneumothorax",
      },
      {
        id: "apo-etco2",
        label: "ETCO₂",
        sublabel: "Target 35–45 mmHg",
        detail: "Waveform capnography. Normal 35–45 mmHg. Elevated ETCO₂ → CO₂ retention / hypoventilation. Low ETCO₂ → hyperventilation or poor perfusion (PE, low cardiac output).",
      },
      {
        id: "apo-gtn",
        label: "GTN",
        sublabel: "300–600 mcg SL q5 min  |  IV 5–10 mcg/min",
        detail: "SL: 300–600 mcg (1–2 sprays or 1 tablet) q5 min, max 3 doses.\nIV infusion: Start 5–10 mcg/min. Titrate in 5–10 mcg/min steps q3–5 min. Usual range 10–100 mcg/min.",
        caution: "Hold if: SBP <100 · HR <50 or >100 · inferior/RV STEMI · PDE-5 inhibitor within 24–48 h (sildenafil / tadalafil)",
      },
      {
        id: "apo-12ecg",
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
        id: "crit-bp",
        label: "BP every 2 minutes",
        sublabel: "Automated NIBP — q2 min cycle",
        detail: "Set NIBP to cycle q2 min. Document trend. Flags: SBP <90 (shock), SBP >180 (hypertensive emergency), pulse pressure <25 (tamponade/cardiogenic), wide pulse pressure (aortic regurgitation, sepsis).",
      },
      {
        id: "crit-defib",
        label: "Defib pads on",
        sublabel: "Hands-free pads — monitor mode",
        detail: "Apply anterior-lateral (or anterior-posterior) defibrillation pads. Select monitor mode. Enable continuous rhythm display. Ready for immediate cardioversion or defibrillation.",
      },
      {
        id: "crit-etco2",
        label: "ETCO₂",
        sublabel: "Target 35–45 mmHg",
        detail: "Continuous waveform capnography. If intubated: mandatory. Sudden ETCO₂ drop → check perfusion, tube position, PE. Trending ETCO₂ reflects cardiac output during CPR.",
      },
      {
        id: "crit-qrs",
        label: "QRS / HR tone HIGH",
        sublabel: "Audible alarm — max sensitivity",
        detail: "Enable QRS beep on maximum audible volume. Set HR high alarm 130 bpm, low alarm 40 bpm. Audible monitoring frees attention for other tasks while maintaining rhythm awareness.",
      },
      {
        id: "crit-spo2",
        label: "SpO₂ — opposite arm to BP",
        sublabel: "Contralateral limb to NIBP cuff",
        detail: "SpO₂ probe on opposite arm/finger to BP cuff — prevents artefact during NIBP cycles. Target SpO₂ 94–98% (93–95% in COPD/chronic hypercapnia).",
      },
      {
        id: "crit-ecg",
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
        id: "sed-bp",
        label: "BP every 5 minutes",
        sublabel: "Automated NIBP — q5 min minimum",
        detail: "q5 min minimum; increase frequency if haemodynamically unstable. Target MAP >65 mmHg (>80 mmHg if TBI). Document MAP trend.",
      },
      {
        id: "sed-etco2",
        label: "ETCO₂ — mandatory",
        sublabel: "Continuous waveform — 35–45 mmHg",
        detail: "Mandatory for all intubated patients. Confirms tube placement. Target ETCO₂ 35–45 mmHg. Target 30–35 mmHg if suspected raised ICP (TBI, massive stroke).",
        caution: "Loss of ETCO₂ waveform = assume tube displacement until proven otherwise. Stop and reassess.",
      },
      {
        id: "sed-spo2",
        label: "SpO₂ — opposite arm to BP",
        sublabel: "Contralateral limb to NIBP cuff",
        detail: "Post-intubation target SpO₂ 94–98%. Avoid hyperoxia (>98%) — associated with worse neurological outcomes post-arrest/TBI. Titrate FiO₂ down once stable.",
      },
      {
        id: "sed-4ecg",
        label: "4-lead ECG",
        sublabel: "Continuous cardiac monitoring",
        detail: "Sedation and intubation can provoke arrhythmias (vagal, sympathetic response). Continuous 4-lead monitoring. Defib pads applied and charged.",
      },
      {
        id: "sed-vent",
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
        id: "ana-adr",
        label: "Adrenaline",
        sublabel: "500 mcg IM  |  50–100 mcg IV",
        options: ADRENALINE_OPTIONS,
      },
      {
        id: "ana-diph",
        label: "Diphenhydramine IV",
        sublabel: "25–50 mg IV slow",
        detail: "25–50 mg slow IV over 2–3 min. H₁ antihistamine — adjunct to adrenaline, not a replacement. Reduces urticaria and angioedema.",
        caution: "Does NOT treat hypotension or bronchospasm. Adrenaline remains primary treatment.",
      },
      {
        id: "ana-fluids",
        label: "Fluids IV",
        sublabel: "1,000 mL NaCl 0.9% rapid bolus",
        detail: "Rapid 1 L bolus NaCl 0.9% IV (pressure bag if required). Repeat PRN. Distributive shock — large volumes may be needed. Reassess BP and HR after each bolus.",
      },
      {
        id: "ana-hydro",
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
        id: "asth-adr",
        label: "Adrenaline",
        sublabel: "500 mcg IM  |  50–100 mcg IV",
        options: ADRENALINE_OPTIONS,
      },
      {
        id: "asth-fluids",
        label: "Fluids IV",
        sublabel: "500–1,000 mL NaCl 0.9%",
        detail: "500 mL–1 L NaCl 0.9% IV. Patients are often dehydrated from increased work of breathing. IV fluid supports preload during elevated intrathoracic pressures.",
      },
      {
        id: "asth-hydro",
        label: "Hydrocortisone IV",
        sublabel: "200 mg IV",
        detail: "200 mg IV slow. Reduces bronchial inflammation. Onset 4–6 hours — adjunct to bronchodilators for acute phase.",
      },
      {
        id: "asth-ipra",
        label: "Ipratropium Bromide NEB",
        sublabel: "500 mcg NEB — max 3 doses",
        detail: "500 mcg (0.5 mg) nebulised via O₂ at 6–8 L/min. Combine with salbutamol in same NEB cup (synergistic). Allow 20 min between doses. Max 3 doses.",
        caution: "Less effective as sole bronchodilator — use in combination with salbutamol.",
      },
      {
        id: "asth-mag",
        label: "Magnesium Sulphate IV",
        sublabel: "2 g IV over 20 min",
        detail: "2 g (4 mL of 50% solution) diluted in 100 mL NaCl 0.9%. Infuse over 20 minutes. Single dose. Smooth muscle relaxant → bronchodilation.",
        caution: "Rapid infusion → flushing, hypotension, arrhythmia. Monitor BP throughout infusion.",
      },
      {
        id: "asth-salb",
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
        id: "covid-dexa",
        label: "Dexamethasone IV / IM",
        sublabel: "6 mg — single dose",
        note: "if SpO₂ < 93%",
        detail: "6 mg IV or IM as a single pre-hospital dose. Anti-inflammatory — reduces cytokine storm in COVID-19 pneumonitis. IV preferred if access available.",
        caution: "Administer only if SpO₂ <93% on supplemental O₂. Immunosuppressive — document administration.",
      },
      {
        id: "covid-cpap",
        label: "CPAP",
        sublabel: "5 → 10 cmH₂O  |  FiO₂ to SpO₂ 94–98%",
        note: "if RR > 30 or SpO₂ < 93%",
        detail: "Start PEEP 5 cmH₂O. Titrate to 10 cmH₂O if tolerated and SpO₂ improving. Adjust FiO₂ for SpO₂ 94–98%. Monitor for fatigue — patient must maintain airway.",
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
        id: "trauma-vaso",
        label: "Vasopressor",
        sublabel: "If MAP < 50 after fluid bolus",
        note: "Refractory hypotension despite fluids",
        options: VASOPRESSOR_OPTIONS,
      },
      {
        id: "trauma-fluids",
        label: "Fluids IV",
        sublabel: "250 mL bolus → target SBP 80–90 mmHg",
        note: "Permissive hypotension",
        detail: "250 mL NaCl 0.9% IV bolus. Reassess after each bolus. Target SBP 80–90 mmHg (permissive hypotension — reduces ongoing blood loss). Avoid >2 L crystalloid.",
        caution: "Exception — TBI: maintain MAP ≥80 mmHg. Penetrating torso: target SBP ~80 until surgical haemostasis.",
      },
      {
        id: "trauma-o2",
        label: "Oxygen",
        sublabel: "Target SpO₂ 94–98%",
        detail: "High-flow O₂ initially, then titrate FiO₂ down. Target SpO₂ 94–98%. Avoid hyperoxia (>98%) — associated with worse outcomes in trauma.",
        caution: "Maintain SpO₂ 94–98%. Do not chase 100%.",
      },
      {
        id: "trauma-txa",
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
        id: "stemi-analg",
        label: "Analgesia",
        sublabel: "Select agent ↓",
        options: ANALGESIA_OPTIONS,
      },
      {
        id: "stemi-asp",
        label: "Aspirin",
        sublabel: "300 mg PO — chewed",
        detail: "300 mg dispersible or regular tablet chewed stat. Irreversible COX-1 inhibition → antiplatelet. Chewing speeds absorption (onset ~5 min vs 15–30 min swallowed).",
        caution: "Hold if: aspirin allergy · active GI haemorrhage · severe thrombocytopaenia",
      },
      {
        id: "stemi-clop",
        label: "Clopidogrel",
        sublabel: "600 mg PO — STEMI only",
        detail: "600 mg PO single loading dose for identified STEMI. AP administration should follow Clinical Desk advice.",
        caution: "Withhold for suspected STEMI when the initial ECG does not meet STEMI criteria, and hold if active major bleeding or true contraindication.",
      },
      {
        id: "stemi-defib",
        label: "Defib pads on",
        sublabel: "Hands-free pads — monitor mode",
        detail: "Apply anterior-lateral hands-free defib pads immediately on confirmed STEMI. High risk of VF. Continuous rhythm monitoring. Crew briefed to defibrillate immediately if VF.",
      },
      {
        id: "stemi-gtn",
        label: "GTN",
        sublabel: "300–600 mcg SL q5 min  |  IV 5–10 mcg/min",
        detail: "SL: 300–600 mcg q5 min, max 3 doses.\nIV infusion: Start 5–10 mcg/min, titrate to symptom relief and haemodynamic tolerance.",
        caution: "Hold if: SBP <100 · HR <50 or >100 · inferior STEMI (RV infarct) · PDE-5 inhibitor within 24–48 h",
      },
      {
        id: "stemi-12ecg",
        label: "12-lead ECG",
        sublabel: "Obtain + transmit to cath lab",
        detail: "Perform 12-lead immediately. Identify: STE ≥1 mm in ≥2 contiguous leads (≥2 mm in V₁–V₃), new LBBB. Transmit to cath lab. Pre-notify cardiology. Repeat every 15 min.",
      },
    ],
  },
  {
    id: "stroke",
    title: "Stroke",
    color: "indigo",
    items: [
      {
        id: "stroke-befast",
        label: "BEFAST Assessment",
        sublabel: "Balance · Eyes · Face · Arms · Speech · Time",
        detail: "B — Balance: sudden loss of coordination or balance\nE — Eyes: sudden vision change (blurred, double, loss)\nF — Face: facial droop (ask patient to smile)\nA — Arms: arm or leg drift or weakness\nS — Speech: slurred, wrong words, no speech\nT — Time: record exact onset time. If unknown → time last seen well.",
      },
      {
        id: "stroke-p1",
        label: "Priority 1 → HGH",
        sublabel: "Pre-notify stroke team",
        note: "< 15 h from onset, or uncertain onset time",
        detail: "Pre-notify John Hunter Hospital stroke team on route. Bypass other facilities if within criteria. Every 1 min of delay = ~1.9 million neurons lost. Document: GCS, BEFAST result, onset time, last seen well time.",
        caution: "Uncertain onset time = treat as eligible (default to P1). Do not delay transport for further assessment.",
      },
      {
        id: "stroke-rbs",
        label: "RBS",
        sublabel: "Check BSL — treat if < 4.0 mmol/L",
        detail: "Check blood glucose on all stroke patients — hypoglycaemia mimics stroke. If BSL <4.0 mmol/L: administer 100 mL of 10% glucose IV. Recheck BSL after 5 min. Document result.",
        caution: "Do NOT treat hyperglycaemia in the field — worsens outcome in ischaemic stroke",
      },
      {
        id: "stroke-bp",
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
  const [sex, setSex] = useState<"M" | "F">("M");
  const [heightCm, setHeightCm] = useState<string>("");
  const c = COLOR[color];

  const h = parseFloat(heightCm);
  const ibw =
    !isNaN(h) && h > 100
      ? Math.max(30, sex === "M" ? 50 + 0.91 * (h - 152.4) : 45.5 + 0.91 * (h - 152.4))
      : null;

  const tvLow = ibw != null ? Math.round(ibw * 6) : null;
  const tvHigh = ibw != null ? Math.round(ibw * 8) : null;

  return (
    <div className="mt-3 space-y-3">
      {/* Sex toggle */}
      <div className="flex gap-2">
        {(["M", "F"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSex(s)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              sex === s ? c.optSel + " border" : c.optUnsel + " border"
            }`}
          >
            {s === "M" ? "Male" : "Female"}
          </button>
        ))}
      </div>

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
              { label: "Rate", value: "10–12 / min" },
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
            IBW: {sex === "M" ? "50" : "45.5"} + 0.91 × (height − 152.4 cm) · Tidal volume 6–8 mL/kg IBW
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
