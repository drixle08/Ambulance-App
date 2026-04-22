"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, X } from "lucide-react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type PatientType = "medical" | "trauma" | "paeds" | "obstetric" | "newborn";

type SpecialType = "avpu" | "painScore" | "noteRequired" | "apgar";

interface ItemDef {
  id: string;
  label: string;
  sub?: string;
  onlyFor?: PatientType[];
  framework?: string;
  specialType?: SpecialType;
  noteHint?: string; // placeholder for note field
}

interface StageDef {
  id: string;
  title: string;
  color: string;
  items: ItemDef[];
  isMeds?: true;
  onlyFor?: PatientType[];
}

interface MedEntry {
  id: string;
  drug: string;
  dose: string;
  route: string;
  time: string;
}

type CheckedMap = Record<string, { time: string; note: string }>;

/* ════════════════════════════════════════════════════════════
   COLOUR TOKENS
════════════════════════════════════════════════════════════ */
const CLR: Record<string, { bg: string; border: string; text: string; badge: string; pill: string }> = {
  slate:   { bg: "bg-slate-800/40",   border: "border-slate-700/60",   text: "text-slate-400",   badge: "bg-slate-800 text-slate-400",    pill: "bg-slate-700/60 text-slate-300" },
  rose:    { bg: "bg-rose-950/30",    border: "border-rose-800/50",    text: "text-rose-400",    badge: "bg-rose-900/60 text-rose-300",    pill: "bg-rose-900/40 text-rose-300" },
  sky:     { bg: "bg-sky-950/30",     border: "border-sky-800/50",     text: "text-sky-400",     badge: "bg-sky-900/60 text-sky-300",      pill: "bg-sky-900/40 text-sky-300" },
  amber:   { bg: "bg-amber-950/30",   border: "border-amber-800/50",   text: "text-amber-400",   badge: "bg-amber-900/60 text-amber-300",   pill: "bg-amber-900/40 text-amber-300" },
  teal:    { bg: "bg-teal-950/30",    border: "border-teal-800/50",    text: "text-teal-400",    badge: "bg-teal-900/60 text-teal-300",     pill: "bg-teal-900/40 text-teal-300" },
  orange:  { bg: "bg-orange-950/30",  border: "border-orange-800/50",  text: "text-orange-400",  badge: "bg-orange-900/60 text-orange-300",  pill: "bg-orange-900/40 text-orange-300" },
  violet:  { bg: "bg-violet-950/30",  border: "border-violet-800/50",  text: "text-violet-400",  badge: "bg-violet-900/60 text-violet-300",  pill: "bg-violet-900/40 text-violet-300" },
  indigo:  { bg: "bg-indigo-950/30",  border: "border-indigo-800/50",  text: "text-indigo-400",  badge: "bg-indigo-900/60 text-indigo-300",  pill: "bg-indigo-900/40 text-indigo-300" },
  emerald: { bg: "bg-emerald-950/30", border: "border-emerald-800/50", text: "text-emerald-400", badge: "bg-emerald-900/60 text-emerald-300", pill: "bg-emerald-900/40 text-emerald-300" },
  pink:    { bg: "bg-pink-950/30",    border: "border-pink-800/50",    text: "text-pink-400",    badge: "bg-pink-900/60 text-pink-300",      pill: "bg-pink-900/40 text-pink-300" },
};

/* ════════════════════════════════════════════════════════════
   PRIMARY SURVEY ITEMS
   Framework: Medical  → L → A → B → C
              Trauma   → CC → L → C-spine → A → B → C
════════════════════════════════════════════════════════════ */
const PRIMARY_ITEMS: ItemDef[] = [
  // CC — Trauma only
  { id: "pri-cc-tq",      label: "Tourniquet applied",                    sub: "Document time of application",              framework: "CC",      onlyFor: ["trauma"] },
  { id: "pri-cc-pack",    label: "Wound packing / haemostatic dressing",  sub: "Direct pressure maintained",                framework: "CC",      onlyFor: ["trauma"] },
  { id: "pri-cc-binder",  label: "Pelvic binder considered / applied",    sub: "If pelvic instability suspected",           framework: "CC",      onlyFor: ["trauma"] },
  // L — Level of Consciousness (all except newborn) — AVPU selector
  { id: "pri-l-loc",      label: "Level of consciousness",                sub: "AVPU",                                      framework: "L",       specialType: "avpu",        onlyFor: ["medical", "trauma", "paeds", "obstetric"] },
  { id: "pri-l-bleed",    label: "Life-threatening haemorrhage identified",sub: "Controlled / ongoing",                     framework: "L",                                   onlyFor: ["medical", "trauma", "paeds", "obstetric"] },
  // L — Newborn initial assessment (NRP)
  { id: "pri-nb-term",    label: "Term gestation (≥37 weeks)?",           sub: "Confirm with mother if possible",           framework: "L",       specialType: "noteRequired", noteHint: "e.g. 39 weeks", onlyFor: ["newborn"] },
  { id: "pri-nb-tone",    label: "Muscle tone",                           sub: "Good / reduced / limp",                    framework: "L",       specialType: "noteRequired", noteHint: "e.g. good tone", onlyFor: ["newborn"] },
  { id: "pri-nb-cry",     label: "Breathing / crying",                    sub: "Crying / breathing / absent",              framework: "L",       specialType: "noteRequired", noteHint: "e.g. crying strongly", onlyFor: ["newborn"] },
  // C-spine — Trauma only
  { id: "pri-cs-mils",    label: "Manual inline stabilisation (MILS)",    sub: "Maintained throughout",                     framework: "C-spine", onlyFor: ["trauma"] },
  { id: "pri-cs-collar",  label: "Cervical collar applied",                                                                 framework: "C-spine", onlyFor: ["trauma"] },
  // Paediatric Assessment Triangle
  { id: "pri-a-pat",      label: "Paediatric Assessment Triangle (PAT)",  sub: "Appearance · Work of Breathing · Colour",  framework: "A",       onlyFor: ["paeds"] },
  // A — Airway (all)
  { id: "pri-a-open",     label: "Airway patent and clear",               sub: "Adjunct / positioning if needed",          framework: "A" },
  // B — Breathing (all)
  { id: "pri-b-rate",     label: "Breathing — rate, depth, effort",       sub: "SpO2 + auscultation",                      framework: "B" },
  { id: "pri-b-ptx",      label: "Tension pneumothorax excluded",         sub: "Clinical exam; decompress if needed",      framework: "B",       onlyFor: ["trauma"] },
  // C — Circulation (all)
  { id: "pri-c-pulse",    label: "Pulse — rate and quality",              sub: "Radial / carotid; CPR if absent",          framework: "C" },
  { id: "pri-c-bp",       label: "Blood pressure obtained",                                                                 framework: "C" },
  { id: "pri-c-access",   label: "IV / IO access",                                                                          framework: "C" },
  { id: "pri-c-ob",       label: "Uterine displacement applied",          sub: "Left lateral tilt — > 20 weeks gestation", framework: "C",       onlyFor: ["obstetric"] },
];

/* ════════════════════════════════════════════════════════════
   FRAMEWORK LABELS
════════════════════════════════════════════════════════════ */
const FRAMEWORK_LABELS: Record<string, Record<PatientType, string | null>> = {
  CC:       { medical: null,                           trauma: "CC — Catastrophic Haemorrhage",    paeds: null,                           obstetric: null,   newborn: null },
  L:        { medical: "L — Level of Consciousness",  trauma: "L — Level of Consciousness",       paeds: "L — Level of Consciousness",   obstetric: "L — Level of Consciousness", newborn: "L — Initial Assessment" },
  "C-spine":{ medical: null,                           trauma: "C — Cervical Spine",               paeds: null,                           obstetric: null,   newborn: null },
  A:        { medical: "A — Airway",                  trauma: "A — Airway",                       paeds: "A — Airway",                   obstetric: "A — Airway", newborn: "A — Airway" },
  B:        { medical: "B — Breathing",               trauma: "B — Breathing",                    paeds: "B — Breathing",                obstetric: "B — Breathing", newborn: "B — Breathing" },
  C:        { medical: "C — Circulation",             trauma: "C — Circulation",                  paeds: "C — Circulation",              obstetric: "C — Circulation", newborn: "C — Circulation" },
};

/* ════════════════════════════════════════════════════════════
   ALL STAGES
════════════════════════════════════════════════════════════ */
const STAGES: StageDef[] = [
  {
    id: "scene", title: "Scene Assessment", color: "slate",
    items: [
      { id: "sc-safe",      label: "Scene safe" },
      { id: "sc-ppe",       label: "Standard precautions (PPE) applied" },
      { id: "sc-moi",       label: "MOI / NOI identified and documented" },
      { id: "sc-pts",       label: "Number of patients confirmed" },
      { id: "sc-res",       label: "Additional resources requested if needed" },
      { id: "sc-bystander", label: "Bystanders / witnesses spoken to" },
      { id: "sc-broselow",  label: "Weight-based reference used (Broselow / formula)", onlyFor: ["paeds"] },
      { id: "sc-ga",        label: "Gestational age confirmed",                         onlyFor: ["obstetric"] },
      { id: "sc-nb-time",   label: "Time of delivery noted",                            onlyFor: ["newborn"] },
      { id: "sc-nb-circ",   label: "Delivery circumstances documented",                 sub: "Location, attendants, complications", onlyFor: ["newborn"], specialType: "noteRequired", noteHint: "e.g. unassisted home delivery" },
    ],
  },
  {
    id: "primary", title: "Primary Survey", color: "rose",
    items: PRIMARY_ITEMS,
  },
  {
    id: "vitals", title: "Vitals & Monitoring", color: "sky",
    items: [
      { id: "vt-spo2",     label: "SpO2" },
      { id: "vt-ecg3",     label: "3-lead ECG" },
      { id: "vt-ecg12",    label: "12-lead ECG" },
      { id: "vt-bp",       label: "Blood pressure" },
      { id: "vt-bgl",      label: "Blood glucose (BGL)" },
      { id: "vt-etco2",    label: "EtCO2 / capnography" },
      { id: "vt-temp",     label: "Temperature" },
      { id: "vt-pupils",   label: "Pupils (PEARL)" },
      { id: "vt-rr",       label: "Respiratory rate (manual count)" },
      { id: "vt-pain",     label: "Pain score",                        specialType: "painScore", onlyFor: ["medical", "trauma", "paeds", "obstetric"] },
      { id: "vt-gcs",      label: "GCS documented" },
      { id: "vt-rass",     label: "Sedation score (RASS)" },
      { id: "vt-weight",   label: "Weight estimated / confirmed" },
      { id: "vt-fhr",      label: "Foetal heart rate",                 onlyFor: ["obstetric"] },
    ],
  },
  /* ── APGAR — newborn only ── */
  {
    id: "apgar-stage", title: "APGAR Score", color: "teal",
    onlyFor: ["newborn"],
    items: [
      { id: "apgar-1min", label: "APGAR — 1 min",  sub: "Scored immediately after birth",                   specialType: "apgar" },
      { id: "apgar-5min", label: "APGAR — 5 min",  sub: "Routine repeat at 5 minutes",                      specialType: "apgar" },
      { id: "apgar-7min", label: "APGAR — 7 min",  sub: "Repeat at 7 min if 5-min score < 7",               specialType: "apgar" },
    ],
  },
  {
    id: "history", title: "History — SAMPLE", color: "amber",
    onlyFor: ["medical", "trauma", "paeds", "obstetric"],
    items: [
      { id: "hx-s", label: "S — Signs & Symptoms",           sub: "Onset, character, severity, radiation, associations" },
      { id: "hx-a", label: "A — Allergies",                  sub: "Medications, latex, environmental" },
      { id: "hx-m", label: "M — Current medications",        sub: "Including OTC and supplements" },
      { id: "hx-p", label: "P — Past medical / surgical Hx", sub: "Relevant comorbidities" },
      { id: "hx-l", label: "L — Last oral intake",           sub: "Time and nature" },
      { id: "hx-e", label: "E — Events leading to call" },
      { id: "hx-guardian", label: "Parent / guardian present and informed", onlyFor: ["paeds"] },
    ],
  },
  /* ── OPQRST — medical + paeds only ── */
  {
    id: "opqrst", title: "Symptom Analysis — OPQRST", color: "amber",
    onlyFor: ["medical", "paeds"],
    items: [
      { id: "oq-o", label: "O — Onset",              sub: "Sudden or gradual? What were you doing?",           specialType: "noteRequired", noteHint: "e.g. sudden onset at rest" },
      { id: "oq-p", label: "P — Provocation / Palliation", sub: "What makes it better or worse?",             specialType: "noteRequired", noteHint: "e.g. worse on exertion, better sitting forward" },
      { id: "oq-q", label: "Q — Quality / Character", sub: "Sharp, dull, pressure, burning, tearing?",        specialType: "noteRequired", noteHint: "e.g. crushing, pressure-like" },
      { id: "oq-r", label: "R — Radiation / Region",  sub: "Does it spread anywhere?",                        specialType: "noteRequired", noteHint: "e.g. radiates to left arm and jaw" },
      { id: "oq-s", label: "S — Severity",            sub: "Pain score 0–10",                                 specialType: "noteRequired", noteHint: "e.g. 8/10" },
      { id: "oq-t", label: "T — Time / Duration",     sub: "When did it start? Constant or intermittent?",    specialType: "noteRequired", noteHint: "e.g. started 2 hours ago, constant" },
    ],
  },
  /* ── OB Assessment — obstetric only ── */
  {
    id: "ob-hx", title: "Obstetric Assessment", color: "pink",
    onlyFor: ["obstetric"],
    items: [
      { id: "ob-aog",    label: "AOG — Age of gestation",               sub: "Weeks confirmed",                              specialType: "noteRequired", noteHint: "e.g. 38 weeks" },
      { id: "ob-edd",    label: "EDD — Expected due date",              sub: "Date documented",                              specialType: "noteRequired", noteHint: "e.g. 01/04/2025" },
      { id: "ob-gpa",    label: "G / P / A — Gravida / Para / Abortus", sub: "Obstetric history",                           specialType: "noteRequired", noteHint: "e.g. G3 P2 A0" },
      { id: "ob-anc",    label: "Antenatal care received",              sub: "Regular / irregular / none",                   specialType: "noteRequired", noteHint: "e.g. regular care at QEII" },
      { id: "ob-comp",   label: "Previous obstetric complications",     sub: "CS, PPH, pre-eclampsia, etc.",                 specialType: "noteRequired", noteHint: "e.g. previous LSCS x1" },
      { id: "ob-cx",     label: "Contractions",                        sub: "Frequency and duration",                        specialType: "noteRequired", noteHint: "e.g. every 3 min, 60 sec duration" },
      { id: "ob-bleed",  label: "Bleeding / show",                     sub: "Amount and character",                          specialType: "noteRequired", noteHint: "e.g. blood-stained mucous show" },
      { id: "ob-memb",   label: "Membranes",                           sub: "Intact / ruptured (SROM/PROM) — time",          specialType: "noteRequired", noteHint: "e.g. SROM at 14:20" },
      { id: "ob-pres",   label: "Foetal presentation",                 sub: "Cephalic / breech / unknown",                   specialType: "noteRequired", noteHint: "e.g. cephalic, crowning noted" },
      { id: "ob-crown",  label: "Crowning assessed" },
    ],
  },
  /* ── Newborn Assessment — newborn only ── */
  {
    id: "newborn-assess", title: "Newborn Assessment", color: "teal",
    onlyFor: ["newborn"],
    items: [
      { id: "nb-dry",      label: "Dry and stimulate",                    sub: "Vigorous drying with warm towel; assess response" },
      { id: "nb-warm",     label: "Maintain warmth",                      sub: "Skin-to-skin / warm towels / polyethylene wrap if <32 weeks" },
      { id: "nb-position", label: "Head in neutral / sniffing position",   sub: "Avoid hyperextension or flexion" },
      { id: "nb-suction",  label: "Suction performed if required",        sub: "Mouth then nose; only if airway obstructed" },
      { id: "nb-meconium", label: "Meconium-stained liquor noted",        sub: "Assess for vigorous cry; intubation if not vigorous", specialType: "noteRequired", noteHint: "e.g. thick meconium, not vigorous" },
      { id: "nb-cord",     label: "Cord clamped and cut",                 sub: "Delayed ≥60 sec if stable and well" },
      { id: "nb-id",       label: "Identity band / labelling applied" },
    ],
  },
  {
    id: "airway", title: "Airway Management", color: "teal",
    items: [
      { id: "aw-hc",       label: "Head-tilt chin-lift" },
      { id: "aw-jt",       label: "Jaw thrust" },
      { id: "aw-suction",  label: "Suction performed" },
      { id: "aw-opa",      label: "OPA inserted" },
      { id: "aw-npa",      label: "NPA inserted" },
      { id: "aw-igel",     label: "i-gel / SGA inserted" },
      { id: "aw-ett",      label: "Endotracheal intubation (RSI/DSI)", sub: "Drug sequence and tube size documented" },
      { id: "aw-conf",     label: "ETT confirmed",                     sub: "EtCO2 waveform + bilateral auscultation" },
      { id: "aw-surgical", label: "Surgical airway" },
    ],
  },
  {
    id: "breathing", title: "Breathing & Oxygenation", color: "sky",
    items: [
      { id: "br-nc",    label: "Nasal cannula O2" },
      { id: "br-sm",    label: "Simple face mask O2" },
      { id: "br-nrb",   label: "Non-rebreather mask (NRB) 15 L/min" },
      { id: "br-bvm",   label: "BVM ventilation" },
      { id: "br-vent",  label: "Mechanical ventilator initiated" },
      { id: "br-cpap",  label: "CPAP / NIV applied" },
      { id: "br-nd-l",  label: "Needle decompression — Left" },
      { id: "br-nd-r",  label: "Needle decompression — Right" },
      { id: "br-sl",    label: "Chest seal — Left" },
      { id: "br-sr",    label: "Chest seal — Right" },
      { id: "br-neb",   label: "Nebuliser treatment administered" },
    ],
  },
  {
    id: "circulation", title: "Circulation & Access", color: "orange",
    items: [
      { id: "ci-iv",     label: "IV access established" },
      { id: "ci-io",     label: "IO access established" },
      { id: "ci-f250",   label: "Fluid bolus — 250 mL NaCl 0.9%" },
      { id: "ci-f500",   label: "Fluid bolus — 500 mL NaCl 0.9%" },
      { id: "ci-blood",  label: "Blood products administered" },
      { id: "ci-defib",  label: "Defibrillation delivered" },
      { id: "ci-cardio", label: "Synchronised cardioversion" },
      { id: "ci-pacing", label: "External pacing initiated" },
      { id: "ci-cpr",    label: "CPR initiated" },
      { id: "ci-lucas",  label: "Mechanical CPR device applied" },
    ],
  },
  { id: "meds", title: "Medications", color: "violet", items: [], isMeds: true },
  {
    id: "secondary", title: "Secondary Survey", color: "indigo",
    items: [
      { id: "ss-head",     label: "Head & face assessed" },
      { id: "ss-neck",     label: "Neck & JVP assessed" },
      { id: "ss-chest",    label: "Chest — inspect, palpate, auscultate" },
      { id: "ss-abd",      label: "Abdomen assessed" },
      { id: "ss-pelvis",   label: "Pelvis assessed" },
      { id: "ss-limbs",    label: "All four limbs assessed" },
      { id: "ss-back",     label: "Back assessed (log roll if indicated)" },
      { id: "ss-neuro",    label: "Neurological exam completed" },
      { id: "ss-vitals2",  label: "Repeat vitals documented" },
      { id: "ss-response", label: "Response to treatment noted" },
      { id: "ss-delivery", label: "Field delivery performed",   onlyFor: ["obstetric"] },
      { id: "ss-cord",     label: "Cord clamped and cut",       onlyFor: ["obstetric"] },
      { id: "ss-apgar",    label: "APGAR at 1 min & 5 min",    onlyFor: ["obstetric"] },
      { id: "ss-placenta", label: "Placenta delivered",         onlyFor: ["obstetric"] },
      { id: "ss-pph",      label: "PPH management initiated",   onlyFor: ["obstetric"] },
    ],
  },
  {
    id: "immob", title: "Immobilisation & Wound Care", color: "amber",
    onlyFor: ["medical", "trauma", "paeds", "obstetric"],
    items: [
      { id: "im-collar",   label: "Cervical collar applied" },
      { id: "im-vacuum",   label: "Vacuum mattress / scoop stretcher" },
      { id: "im-splint",   label: "Limb splint applied" },
      { id: "im-traction", label: "Traction splint applied" },
      { id: "im-pelvic",   label: "Pelvic binder applied" },
      { id: "im-sling",    label: "Sling / broad arm sling" },
      { id: "im-dressing", label: "Wound dressing applied" },
      { id: "im-burns",    label: "Burns management / dressing" },
      { id: "im-tq-time",  label: "Tourniquet application time documented" },
    ],
  },
  {
    id: "transport", title: "Handover & Transport", color: "emerald",
    items: [
      { id: "tr-consent",  label: "Consent obtained / documented" },
      { id: "tr-prealert", label: "Pre-alert called to receiving facility" },
      { id: "tr-position", label: "Patient position optimised" },
      { id: "tr-secured",  label: "Patient secured on stretcher" },
      { id: "tr-vitals3",  label: "Vitals reassessed post-loading" },
      { id: "tr-handover", label: "Verbal handover given to receiving crew" },
      { id: "tr-pcr",      label: "ePCR / PCR completed" },
    ],
  },
];

/* ════════════════════════════════════════════════════════════
   DRUG DOSE PRESETS
════════════════════════════════════════════════════════════ */
const DRUG_DOSES: Record<string, { dose: string; route: string }[]> = {
  "Adenosine":          [{ dose: "6 mg", route: "IV" }, { dose: "12 mg", route: "IV" }, { dose: "18 mg", route: "IV" }, { dose: "0.1 mg/kg", route: "IV" }, { dose: "0.2 mg/kg", route: "IV" }],
  "Adrenaline":         [{ dose: "1 mg", route: "IV" }, { dose: "0.5 mg", route: "IM" }, { dose: "0.1 mg", route: "IV" }, { dose: "0.01 mg/kg", route: "IV" }],
  "Amiodarone":         [{ dose: "300 mg", route: "IV" }, { dose: "150 mg", route: "IV" }, { dose: "5 mg/kg", route: "IV" }],
  "Aspirin":            [{ dose: "300 mg", route: "PO" }],
  "Atropine":           [{ dose: "0.5 mg", route: "IV" }, { dose: "1 mg", route: "IV" }, { dose: "3 mg", route: "IV" }],
  "Clopidogrel":        [{ dose: "300 mg", route: "PO" }, { dose: "600 mg", route: "PO" }],
  "Dexamethasone":      [{ dose: "8 mg", route: "IV" }, { dose: "0.15 mg/kg", route: "IV" }],
  "Fentanyl":           [{ dose: "25 mcg", route: "IV" }, { dose: "50 mcg", route: "IV" }, { dose: "100 mcg", route: "IV" }, { dose: "150 mcg", route: "IV" }, { dose: "100 mcg", route: "IM" }, { dose: "200 mcg", route: "IN" }],
  "Flumazenil":         [{ dose: "200 mcg", route: "IV" }, { dose: "100 mcg", route: "IV" }],
  "GTN":                [{ dose: "400 mcg", route: "SL" }, { dose: "800 mcg", route: "SL" }, { dose: "100–300 mcg/min", route: "IV" }, { dose: "5–20 mcg/min", route: "IV" }],
  "Glucagon":           [{ dose: "1 mg", route: "IM" }, { dose: "1 mg", route: "IV" }],
  "Glucose 10%":        [{ dose: "100 mL", route: "IV" }, { dose: "200 mL", route: "IV" }, { dose: "2 mL/kg", route: "IV" }],
  "Hydrocortisone":     [{ dose: "200 mg", route: "IV" }, { dose: "4 mg/kg", route: "IV" }],
  "Ipratropium":        [{ dose: "500 mcg", route: "NEB" }],
  "Ketamine":           [{ dose: "1–2 mg/kg", route: "IV" }, { dose: "4 mg/kg", route: "IM" }, { dose: "0.2–0.5 mg/kg", route: "IV" }],
  "Magnesium Sulphate": [{ dose: "2 g", route: "IV" }, { dose: "4 g", route: "IV" }, { dose: "25–50 mg/kg", route: "IV" }],
  "Methoxyflurane":     [{ dose: "3 mL", route: "INH" }],
  "Midazolam":          [{ dose: "2.5 mg", route: "IV" }, { dose: "5 mg", route: "IM" }, { dose: "5 mg", route: "IN" }, { dose: "0.1 mg/kg", route: "IV" }],
  "Morphine":           [{ dose: "2.5 mg", route: "IV" }, { dose: "5 mg", route: "IV" }, { dose: "10 mg", route: "IV" }, { dose: "5 mg", route: "IM" }, { dose: "0.1 mg/kg", route: "IV" }],
  "Naloxone":           [{ dose: "400 mcg", route: "IV" }, { dose: "800 mcg", route: "IM" }, { dose: "2 mg", route: "IN" }],
  "Noradrenaline":      [{ dose: "0.01–0.3 mcg/kg/min", route: "IV" }],
  "Ondansetron":        [{ dose: "4 mg", route: "IV" }, { dose: "4 mg", route: "PO" }, { dose: "4 mg", route: "IM" }],
  "Oxytocin":           [{ dose: "5 IU", route: "IM" }, { dose: "10 IU", route: "IM" }],
  "Salbutamol":         [{ dose: "5 mg", route: "NEB" }, { dose: "2.5 mg", route: "NEB" }],
  "TXA":                [{ dose: "2 g", route: "IV" }, { dose: "1 g", route: "IV" }, { dose: "500 mg", route: "TOP" }, { dose: "15 mg/kg", route: "IV" }],
  "Vitamin K":          [{ dose: "0.5 mg", route: "IM" }, { dose: "1 mg", route: "IM" }],
};

const PRESET_DRUGS = Object.keys(DRUG_DOSES).concat(["Other"]);
const MED_ROUTES = ["IV", "IO", "IM", "IN", "SL", "NEB", "SC", "PO", "ETT", "PR", "INH", "TOP"];

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function nowHHMM() {
  return new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtElapsed(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function vis(items: ItemDef[], pt: PatientType) {
  return items.filter((i) => !i.onlyFor || i.onlyFor.includes(pt));
}

function visStages(pt: PatientType) {
  return STAGES.filter((s) => !s.onlyFor || s.onlyFor.includes(pt));
}

const PT_META = {
  medical:   { label: "Medical",    sub: "LOCABC" },
  trauma:    { label: "Trauma",     sub: "CCLOCABC" },
  paeds:     { label: "Paediatric", sub: "LOCABC + Paeds" },
  obstetric: { label: "Obstetric",  sub: "LOCABC + OB" },
  newborn:   { label: "Newborn",    sub: "NRP + APGAR" },
};

const PT_CLR: Record<PatientType, { active: string }> = {
  medical:   { active: "bg-sky-900/70 text-sky-300 border-sky-700" },
  trauma:    { active: "bg-rose-900/70 text-rose-300 border-rose-700" },
  paeds:     { active: "bg-amber-900/70 text-amber-300 border-amber-700" },
  obstetric: { active: "bg-pink-900/70 text-pink-300 border-pink-700" },
  newborn:   { active: "bg-emerald-900/70 text-emerald-300 border-emerald-700" },
};

/* ════════════════════════════════════════════════════════════
   PAIN SCORE SUB-COMPONENT
════════════════════════════════════════════════════════════ */
const FLACC_CATS = [
  { key: "F", label: "Face",           opts: ["No expression / smile", "Occasional grimace / frown", "Frequent grimace / clenched jaw"] },
  { key: "L", label: "Legs",           opts: ["Normal / relaxed",      "Uneasy / restless / tense",   "Kicking / legs drawn up"] },
  { key: "A", label: "Activity",       opts: ["Lying quietly / moves easily", "Squirming / shifting", "Arched / rigid / jerking"] },
  { key: "C", label: "Cry",            opts: ["No cry (awake or asleep)", "Moans / whimpers",       "Crying steadily / screams"] },
  { key: "C2", label: "Consolability", opts: ["Content / relaxed",     "Reassured by touch / talking", "Difficult to console"] },
];

const WB_FACES = [
  { score: 0,  label: "No hurt",            emoji: "😊" },
  { score: 2,  label: "Hurts a little bit", emoji: "🙂" },
  { score: 4,  label: "Hurts a little more",emoji: "😐" },
  { score: 6,  label: "Hurts even more",    emoji: "😟" },
  { score: 8,  label: "Hurts a whole lot",  emoji: "😢" },
  { score: 10, label: "Hurts worst",        emoji: "😭" },
];

function PainScoreSelector({
  pt, onSelect,
}: { pt: PatientType; onSelect: (value: string) => void }) {
  const [mode, setMode] = useState<"nrs" | "flacc" | "wb">("nrs");
  const [flaccScores, setFlaccScores] = useState<Record<string, number>>({});

  const flaccTotal = Object.values(flaccScores).reduce((a, b) => a + b, 0);
  const flaccComplete = Object.keys(flaccScores).length === 5;

  const isKid = pt === "paeds";

  return (
    <div className="px-4 pb-3 pt-2 space-y-3 border-t border-slate-800 bg-slate-950/50">
      {/* Mode switcher for paeds */}
      {isKid && (
        <div className="flex gap-1.5">
          {[{ id: "nrs" as const, label: "NRS 0–10" }, { id: "flacc" as const, label: "FLACC" }, { id: "wb" as const, label: "Wong-Baker" }].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                mode === m.id ? "bg-sky-700 text-sky-100" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* NRS */}
      {mode === "nrs" && (
        <div className="space-y-1.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Numeric Rating Scale</p>
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => {
              const col = i <= 3 ? "bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800/60"
                        : i <= 6 ? "bg-amber-900/60 text-amber-300 hover:bg-amber-800/60"
                        : "bg-rose-900/60 text-rose-300 hover:bg-rose-800/60";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelect(`${i}/10`)}
                  className={`rounded-lg py-2 text-sm font-bold transition-all active:scale-90 ${col}`}
                >
                  {i}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[0.6rem] text-slate-600">
            <span>No pain</span>
            <span>Worst pain</span>
          </div>
        </div>
      )}

      {/* FLACC */}
      {mode === "flacc" && (
        <div className="space-y-2">
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">FLACC Scale</p>
          {FLACC_CATS.map((cat) => (
            <div key={cat.key} className="space-y-1">
              <p className="text-[0.65rem] font-bold text-slate-400">{cat.label}</p>
              <div className="flex gap-1">
                {cat.opts.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFlaccScores((p) => ({ ...p, [cat.key]: i }))}
                    className={`flex-1 rounded-lg px-1 py-1.5 text-[0.6rem] leading-tight text-center transition-all ${
                      flaccScores[cat.key] === i
                        ? "bg-sky-700 text-sky-100"
                        : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                    }`}
                  >
                    <span className="block font-bold">{i}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {flaccComplete && (
            <button
              type="button"
              onClick={() => onSelect(`FLACC ${flaccTotal}/10`)}
              className="w-full rounded-xl bg-sky-700 py-2 text-sm font-bold text-white hover:bg-sky-600"
            >
              Record FLACC {flaccTotal}/10
            </button>
          )}
        </div>
      )}

      {/* Wong-Baker */}
      {mode === "wb" && (
        <div className="space-y-1.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Wong-Baker FACES</p>
          <div className="grid grid-cols-3 gap-2">
            {WB_FACES.map((f) => (
              <button
                key={f.score}
                type="button"
                onClick={() => onSelect(`Wong-Baker ${f.score}/10 (${f.label})`)}
                className="flex flex-col items-center rounded-xl border border-slate-800 bg-slate-800/60 py-2 gap-0.5 hover:border-sky-700 active:scale-95 transition-all"
              >
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-xs font-bold text-slate-300">{f.score}</span>
                <span className="text-[0.55rem] text-slate-500 text-center leading-tight">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   APGAR SCORE SUB-COMPONENT
════════════════════════════════════════════════════════════ */
const APGAR_CATS = [
  { key: "A", label: "Appearance",  opts: ["Blue / pale all over", "Pink body, blue extremities", "Pink all over"] },
  { key: "P", label: "Pulse",       opts: ["Absent", "< 100 bpm", "≥ 100 bpm"] },
  { key: "G", label: "Grimace",     opts: ["No response", "Grimace", "Cry / cough / sneeze"] },
  { key: "M", label: "Activity",    opts: ["None / limp", "Some flexion", "Active motion"] },
  { key: "R", label: "Respiration", opts: ["Absent", "Weak / irregular", "Strong cry"] },
];

function ApgarScoreSelector({ onSelect }: { onSelect: (value: string) => void }) {
  const [scores, setScores] = useState<Record<string, number>>({});

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const complete = Object.keys(scores).length === 5;

  function apgarInterp(score: number) {
    if (score >= 7) return { text: "Normal", cls: "text-emerald-400" };
    if (score >= 4) return { text: "Moderate concern", cls: "text-amber-400" };
    return { text: "Requires resuscitation", cls: "text-rose-400" };
  }

  return (
    <div className="px-4 pb-3 pt-2 space-y-3 border-t border-slate-800 bg-slate-950/50">
      {/* Categories */}
      <div className="space-y-2">
        <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">APGAR</p>
        {APGAR_CATS.map((cat) => (
          <div key={cat.key} className="space-y-1">
            <p className="text-[0.65rem] font-bold text-slate-400">{cat.label}</p>
            <div className="flex gap-1">
              {cat.opts.map((opt, i) => (
                <button key={i} type="button"
                  onClick={() => setScores((p) => ({ ...p, [cat.key]: i }))}
                  className={`flex-1 rounded-lg px-1 py-1.5 text-[0.6rem] leading-tight text-center transition-all ${
                    scores[cat.key] === i ? "bg-teal-700 text-teal-100" : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                  }`}
                >
                  <span className="block font-bold">{i}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Score + record */}
      {complete && (() => {
        const interp = apgarInterp(total);
        return (
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-lg font-bold text-white">{total}/10</span>
              <span className={`ml-2 text-xs ${interp.cls}`}>{interp.text}</span>
            </div>
            <button type="button"
              onClick={() => onSelect(`${total}/10`)}
              className="rounded-xl bg-teal-700 px-3 py-2 text-sm font-bold text-white hover:bg-teal-600 active:scale-95 transition-all"
            >
              Record
            </button>
          </div>
        );
      })()}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HANDOVER TEXT
════════════════════════════════════════════════════════════ */
function buildHandover(pt: PatientType, startTime: Date | null, checked: CheckedMap, meds: MedEntry[]): string {
  const startStr = startTime
    ? startTime.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "—";
  const lines = [
    "PATIENT TREATMENT LOG",
    "─".repeat(38),
    `Type:       ${PT_META[pt].label} (${PT_META[pt].sub})`,
    `Scene time: ${startStr}`,
    "─".repeat(38),
    "",
  ];

  for (const stage of visStages(pt)) {
    if (stage.isMeds) {
      if (meds.length === 0) continue;
      lines.push(`[ ${stage.title.toUpperCase()} ]`);
      for (const m of meds) lines.push(`  ${m.time}  ${m.drug}  ${m.dose}  ${m.route}`);
      lines.push("");
      continue;
    }
    const done = vis(stage.items, pt).filter((i) => checked[i.id]);
    if (done.length === 0) continue;
    lines.push(`[ ${stage.title.toUpperCase()} ]`);
    for (const item of done) {
      const rec = checked[item.id];
      const notePart = rec.note ? `  — ${rec.note}` : "";
      lines.push(`  ${rec.time}  ${item.label}${notePart}`);
    }
    lines.push("");
  }

  if (lines.at(-1) === "") lines.pop();
  return lines.join("\n");
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
export default function TreatmentLogPage() {
  const [pt, setPt]           = useState<PatientType>("medical");
  const [startTime, setStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [view, setView]       = useState<"log" | "handover">("log");
  const [resetConfirm, setRC] = useState(false);
  const startRef              = useRef<Date | null>(null);

  const [checked, setChecked] = useState<CheckedMap>({});
  const [meds, setMeds]       = useState<MedEntry[]>([]);

  const [openStage, setOpen]      = useState<string | null>("scene");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ time: "", note: "" });

  // Pain score selectors open state
  const [painOpen, setPainOpen]   = useState<string | null>(null);

  // Medication form
  const [medFormOpen, setMedFO]   = useState(false);
  const [editingMedId, setEditMed]= useState<string | null>(null);
  const [medDrug, setMedDrug]     = useState("");
  const [medCustom, setMedCustom] = useState("");
  const [medDose, setMedDose]     = useState("");
  const [medRoute, setMedRoute]   = useState("IV");
  const [medTime, setMedTime]     = useState("");
  const medIdSeq = useRef(0);

  /* ─── Timer ─── */
  useEffect(() => {
    if (!startTime) return;
    startRef.current = startTime;
    const id = setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  function ensureStarted() {
    if (!startRef.current) {
      const now = new Date();
      startRef.current = now;
      setStart(now);
    }
  }

  /* ─── Item handlers ─── */
  function handleItemTap(item: ItemDef) {
    if (item.specialType === "painScore" || item.specialType === "apgar") {
      // Toggle selector open/closed; don't auto-check
      setPainOpen((p) => (p === item.id ? null : item.id));
      setEditingId(null);
      return;
    }
    if (item.specialType === "avpu") {
      // AVPU inline selector — handled by render; just open it
      setPainOpen((p) => (p === item.id ? null : item.id));
      setEditingId(null);
      return;
    }

    ensureStarted();
    setMedFO(false);
    setPainOpen(null);

    if (checked[item.id]) {
      setEditingId(item.id);
      setEditDraft({ time: checked[item.id].time, note: checked[item.id].note });
    } else {
      // noteRequired: check AND open editor immediately
      if (item.specialType === "noteRequired") {
        setChecked((p) => ({ ...p, [item.id]: { time: nowHHMM(), note: "" } }));
        setEditingId(item.id);
        setEditDraft({ time: nowHHMM(), note: "" });
      } else {
        setChecked((p) => ({ ...p, [item.id]: { time: nowHHMM(), note: "" } }));
        setEditingId(null);
      }
    }
  }

  function handleAvpuSelect(itemId: string, value: string) {
    ensureStarted();
    setChecked((p) => ({ ...p, [itemId]: { time: nowHHMM(), note: value } }));
    setPainOpen(null);
  }

  function handlePainSelect(itemId: string, value: string) {
    ensureStarted();
    setChecked((p) => ({ ...p, [itemId]: { time: nowHHMM(), note: value } }));
    setPainOpen(null);
  }

  function handleEditSave() {
    if (!editingId) return;
    setChecked((p) => ({ ...p, [editingId]: editDraft }));
    setEditingId(null);
  }

  function handleUncheck(itemId: string) {
    setChecked((p) => { const n = { ...p }; delete n[itemId]; return n; });
    setEditingId(null);
    setPainOpen(null);
  }

  /* ─── Medication handlers ─── */
  function openMedForm(medId?: string) {
    setEditingId(null);
    if (medId) {
      const m = meds.find((x) => x.id === medId);
      if (!m) return;
      setEditMed(medId);
      setMedDrug(PRESET_DRUGS.includes(m.drug) ? m.drug : "Other");
      setMedCustom(PRESET_DRUGS.includes(m.drug) ? "" : m.drug);
      setMedDose(m.dose);
      setMedRoute(m.route);
      setMedTime(m.time);
    } else {
      setEditMed(null);
      setMedDrug("");
      setMedCustom("");
      setMedDose("");
      setMedRoute("IV");
      setMedTime(nowHHMM());
    }
    setMedFO(true);
  }

  function saveMed() {
    const drug = medDrug === "Other" ? medCustom.trim() : medDrug;
    if (!drug || !medDose.trim()) return;
    medIdSeq.current += 1;
    const entry: MedEntry = { id: editingMedId ?? `med-${medIdSeq.current}`, drug, dose: medDose.trim(), route: medRoute, time: medTime || nowHHMM() };
    if (editingMedId) setMeds((p) => p.map((m) => m.id === editingMedId ? entry : m));
    else { ensureStarted(); setMeds((p) => [...p, entry]); }
    setMedFO(false); setEditMed(null);
  }

  function resetAll() {
    setChecked({}); setMeds([]); setStart(null); setElapsed(0);
    setPt("medical"); setView("log"); setOpen("scene");
    setEditingId(null); setMedFO(false); setEditMed(null);
    setRC(false); setPainOpen(null);
    startRef.current = null;
  }

  const hasStarted = Object.keys(checked).length > 0 || meds.length > 0;
  const handoverText = useMemo(() => buildHandover(pt, startTime, checked, meds), [pt, startTime, checked, meds]);

  /* ─── Handover view ─── */
  if (view === "handover") {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => setView("log")} className="text-sm text-slate-400 hover:text-slate-200">
            ← Back to log
          </button>
          <CopySummaryButton summaryText={handoverText} label="Copy handover" />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
            {handoverText || "No interventions recorded yet."}
          </pre>
        </div>
      </div>
    );
  }

  /* ─── Log view ─── */
  const activeStages = visStages(pt);

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-32 space-y-4">
      <header>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-teal-500">Clinical Management</p>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Treatment Log</h1>
        <p className="text-xs text-slate-500">Tap each intervention as you perform it — timestamps auto-set.</p>
      </header>

      {/* Patient type selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-600">Patient type</p>
          {hasStarted && <span className="text-[0.6rem] border border-slate-800 rounded-full px-2 py-0.5 text-slate-700">locked — reset to change</span>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PT_META) as PatientType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { if (!hasStarted) setPt(type); }}
              disabled={hasStarted && pt !== type}
              className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                pt === type ? PT_CLR[type].active : "bg-slate-900/60 text-slate-500 border-slate-800 opacity-50"
              } ${hasStarted ? "cursor-default" : "active:scale-95"}`}
            >
              <span className="text-sm font-bold">{PT_META[type].label}</span>
              <span className="text-[0.6rem] opacity-60">{PT_META[type].sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stage cards */}
      <div className="space-y-2">
        {activeStages.map((stage) => {
          const clr = CLR[stage.color] ?? CLR.slate;
          const items = vis(stage.items, pt);
          const doneCount = stage.isMeds ? meds.length : items.filter((i) => checked[i.id]).length;
          const total = stage.isMeds ? null : items.length;
          const allDone = !stage.isMeds && total !== null && doneCount === total && total > 0;
          const isOpen = openStage === stage.id;

          return (
            <div key={stage.id} className={`rounded-2xl border overflow-hidden ${clr.border} ${clr.bg}`}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : stage.id)}
                className="flex w-full items-center gap-3 px-4 py-3"
              >
                <div className="flex-1 text-left">
                  <span className={`text-sm font-bold ${clr.text}`}>{stage.title}</span>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ${allDone ? clr.pill : "bg-slate-800/80 text-slate-500"}`}>
                  {stage.isMeds ? (doneCount > 0 ? `${doneCount} med${doneCount !== 1 ? "s" : ""}` : "—") : `${doneCount} / ${total}`}
                </span>
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-600" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-600" />}
              </button>

              {/* Body — regular items */}
              {isOpen && !stage.isMeds && (() => {
                let lastFw: string | null = null;
                return (
                  <div className="border-t border-slate-800/50 divide-y divide-slate-800/40">
                    {items.map((item) => {
                      const isChecked  = !!checked[item.id];
                      const isEditing  = editingId === item.id;
                      const isPainOpen = painOpen === item.id;
                      const fwChanged  = item.framework && item.framework !== lastFw;
                      if (item.framework) lastFw = item.framework;
                      const fwLabel    = item.framework ? (FRAMEWORK_LABELS[item.framework]?.[pt] ?? null) : null;

                      return (
                        <div key={item.id}>
                          {/* Framework badge */}
                          {fwChanged && fwLabel && (
                            <div className={`px-4 py-1.5 ${clr.bg}`}>
                              <span className={`text-[0.6rem] font-black uppercase tracking-widest ${clr.text}`}>{fwLabel}</span>
                            </div>
                          )}

                          {/* ── AVPU selector ── */}
                          {item.specialType === "avpu" && (
                            <div>
                              <button
                                type="button"
                                onClick={() => handleItemTap(item)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${isChecked ? "bg-slate-900/60" : "hover:bg-slate-900/30"}`}
                              >
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isChecked ? `${clr.pill} border-transparent` : "border-slate-700"}`}>
                                  {isChecked && <div className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm ${isChecked ? "text-slate-300" : "text-slate-400"}`}>{item.label}</p>
                                  {item.sub && <p className="text-[0.65rem] text-slate-600">{item.sub}</p>}
                                </div>
                                {isChecked && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-mono font-semibold ${clr.pill}`}>{checked[item.id].note || checked[item.id].time}</span>}
                              </button>
                              {isPainOpen && !isChecked && (
                                <div className="border-t border-slate-800 bg-slate-950/50 px-4 pb-3 pt-2 space-y-2">
                                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Select AVPU</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {["Alert", "Verbal", "Pain", "Unconscious"].map((v) => (
                                      <button
                                        key={v}
                                        type="button"
                                        onClick={() => handleAvpuSelect(item.id, v)}
                                        className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition-all active:scale-95 ${
                                          v === "Alert"       ? "border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40" :
                                          v === "Verbal"      ? "border-amber-800   bg-amber-950/40   text-amber-300   hover:bg-amber-900/40"   :
                                          v === "Pain"        ? "border-orange-800  bg-orange-950/40  text-orange-300  hover:bg-orange-900/40"  :
                                                                "border-red-800     bg-red-950/40     text-red-300     hover:bg-red-900/40"
                                        }`}
                                      >
                                        {v}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Edit already-selected AVPU */}
                              {isChecked && isEditing && (
                                <div className="border-t border-slate-800 bg-slate-950/60 px-4 pb-3 pt-2 space-y-2">
                                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Change AVPU</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {["Alert", "Verbal", "Pain", "Unconscious"].map((v) => (
                                      <button key={v} type="button"
                                        onClick={() => { setChecked((p) => ({ ...p, [item.id]: { ...p[item.id], note: v } })); setEditingId(null); }}
                                        className={`rounded-xl border px-3 py-2 text-sm font-bold ${checked[item.id]?.note === v ? "bg-slate-600 text-white border-slate-500" : "border-slate-700 bg-slate-800 text-slate-400"}`}
                                      >{v}</button>
                                    ))}
                                  </div>
                                  <button type="button" onClick={() => handleUncheck(item.id)} className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300">
                                    <X className="h-3 w-3" /> Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Pain score selector ── */}
                          {item.specialType === "painScore" && (
                            <div>
                              <button
                                type="button"
                                onClick={() => handleItemTap(item)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${isChecked ? "bg-slate-900/60" : "hover:bg-slate-900/30"}`}
                              >
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isChecked ? `${clr.pill} border-transparent` : "border-slate-700"}`}>
                                  {isChecked && <div className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm ${isChecked ? "text-slate-300" : "text-slate-400"}`}>{item.label}</p>
                                  {item.sub && <p className="text-[0.65rem] text-slate-600">{item.sub}</p>}
                                </div>
                                {isChecked && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${clr.pill}`}>{checked[item.id].note}</span>}
                                {!isChecked && <span className="text-[0.65rem] text-slate-600">Tap to score</span>}
                              </button>
                              {isPainOpen && !isChecked && (
                                <PainScoreSelector pt={pt} onSelect={(v) => handlePainSelect(item.id, v)} />
                              )}
                              {isChecked && isEditing && (
                                <div className="border-t border-slate-800 bg-slate-950/60 px-4 pb-3 pt-2 space-y-2">
                                  <PainScoreSelector pt={pt} onSelect={(v) => { setChecked((p) => ({ ...p, [item.id]: { ...p[item.id], note: v } })); setEditingId(null); }} />
                                  <button type="button" onClick={() => handleUncheck(item.id)} className="flex items-center gap-1 text-xs text-rose-400">
                                    <X className="h-3 w-3" /> Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── APGAR selector ── */}
                          {item.specialType === "apgar" && (
                            <div>
                              <button
                                type="button"
                                onClick={() => handleItemTap(item)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${isChecked ? "bg-slate-900/60" : "hover:bg-slate-900/30"}`}
                              >
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isChecked ? `${clr.pill} border-transparent` : "border-slate-700"}`}>
                                  {isChecked && <div className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm ${isChecked ? "text-slate-300" : "text-slate-400"}`}>{item.label}</p>
                                  {item.sub && <p className="text-[0.65rem] text-slate-600">{item.sub}</p>}
                                  {isChecked && checked[item.id].note && (
                                    <p className={`text-[0.65rem] mt-0.5 ${clr.text}`}>{checked[item.id].note}</p>
                                  )}
                                </div>
                                {!isChecked && <span className="text-[0.65rem] text-slate-600">Tap to score</span>}
                                {isChecked && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-mono font-semibold ${clr.pill}`}>{checked[item.id].time}</span>}
                              </button>
                              {isPainOpen && !isChecked && (
                                <ApgarScoreSelector onSelect={(v) => handlePainSelect(item.id, v)} />
                              )}
                              {isChecked && isEditing && (
                                <div className="border-t border-slate-800 bg-slate-950/60 px-4 pb-3 pt-2 space-y-2">
                                  <ApgarScoreSelector onSelect={(v) => { setChecked((p) => ({ ...p, [item.id]: { ...p[item.id], note: v } })); setEditingId(null); }} />
                                  <button type="button" onClick={() => handleUncheck(item.id)} className="flex items-center gap-1 text-xs text-rose-400">
                                    <X className="h-3 w-3" /> Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Standard / noteRequired items ── */}
                          {(!item.specialType || item.specialType === "noteRequired") && (
                            <div>
                              <button
                                type="button"
                                onClick={() => handleItemTap(item)}
                                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${isChecked ? "bg-slate-900/60" : "hover:bg-slate-900/30 active:bg-slate-900/40"}`}
                              >
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isChecked ? `${clr.pill} border-transparent` : "border-slate-700 bg-slate-900"}`}>
                                  {isChecked && <div className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm leading-snug ${isChecked ? "text-slate-300" : "text-slate-400"}`}>{item.label}</p>
                                  {item.sub && <p className="text-[0.65rem] text-slate-600 mt-0.5">{item.sub}</p>}
                                  {isChecked && checked[item.id].note && (
                                    <p className={`text-[0.65rem] mt-0.5 ${clr.text}`}>{checked[item.id].note}</p>
                                  )}
                                </div>
                                {isChecked && (
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-mono font-semibold ${clr.pill}`}>
                                    {checked[item.id].time}
                                  </span>
                                )}
                              </button>
                              {/* Inline editor */}
                              {isEditing && (
                                <div className="border-t border-slate-800 bg-slate-950/60 px-4 pb-3 pt-2 space-y-2">
                                  <div className="flex gap-2">
                                    <div className="w-24 space-y-1 shrink-0">
                                      <label className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Time</label>
                                      <input type="time" value={editDraft.time}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, time: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm font-mono text-slate-200 focus:border-slate-500 focus:outline-none" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <label className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Note</label>
                                      <input type="text" placeholder={item.noteHint ?? "e.g. right AC, 18G"}
                                        value={editDraft.note}
                                        onChange={(e) => setEditDraft((d) => ({ ...d, note: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-slate-500 focus:outline-none"
                                        autoFocus={item.specialType === "noteRequired"} />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={handleEditSave} className="flex-1 rounded-lg bg-slate-700 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600">Save</button>
                                    <button type="button" onClick={() => handleUncheck(item.id)} className="flex items-center gap-1 rounded-lg bg-rose-950/60 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/60"><X className="h-3 w-3" /> Remove</button>
                                    <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300">Cancel</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Body — medications */}
              {isOpen && stage.isMeds && (
                <div className="border-t border-slate-800/50 px-4 pb-4 pt-3 space-y-3">
                  {meds.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200">{m.drug}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className={`font-mono font-bold ${clr.text}`}>{m.time}</span>
                          {" · "}{m.dose}{" · "}{m.route}
                        </p>
                      </div>
                      <button type="button" onClick={() => openMedForm(m.id)} className="p-1.5 text-slate-600 hover:text-slate-300"><Pencil className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => setMeds((p) => p.filter((x) => x.id !== m.id))} className="p-1.5 text-slate-700 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}

                  {medFormOpen ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 space-y-3">
                      {/* Drug picker */}
                      <div className="space-y-1">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Drug</label>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                          {PRESET_DRUGS.map((d) => (
                            <button key={d} type="button" onClick={() => { setMedDrug(d); setMedDose(""); setMedRoute("IV"); }}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${medDrug === d ? "bg-violet-700 text-violet-100" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                              {d}
                            </button>
                          ))}
                        </div>
                        {medDrug === "Other" && (
                          <input type="text" placeholder="Drug name" value={medCustom} onChange={(e) => setMedCustom(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-slate-500 focus:outline-none" autoFocus />
                        )}
                      </div>

                      {/* Dose presets */}
                      {medDrug && medDrug !== "Other" && DRUG_DOSES[medDrug] && (
                        <div className="space-y-1">
                          <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Common doses</label>
                          <div className="flex flex-wrap gap-1.5">
                            {DRUG_DOSES[medDrug].map((opt, i) => (
                              <button key={i} type="button"
                                onClick={() => { setMedDose(opt.dose); setMedRoute(opt.route); }}
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                                  medDose === opt.dose && medRoute === opt.route
                                    ? "bg-violet-700 text-violet-100"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                }`}>
                                {opt.dose} {opt.route}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dose free-text */}
                      <div className="space-y-1">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Dose</label>
                        <input type="text" placeholder="e.g. 100 mcg, 10 mg" value={medDose} onChange={(e) => setMedDose(e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-slate-500 focus:outline-none" />
                      </div>

                      {/* Route */}
                      <div className="space-y-1">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Route</label>
                        <div className="flex flex-wrap gap-1.5">
                          {MED_ROUTES.map((r) => (
                            <button key={r} type="button" onClick={() => setMedRoute(r)}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${medRoute === r ? "bg-violet-700 text-violet-100" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="space-y-1">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Time</label>
                        <input type="time" value={medTime} onChange={(e) => setMedTime(e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 font-mono text-sm text-slate-200 focus:border-slate-500 focus:outline-none" />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={saveMed}
                          disabled={!medDrug || (medDrug === "Other" && !medCustom.trim()) || !medDose.trim()}
                          className="flex-1 rounded-lg bg-violet-700 py-2 text-sm font-bold text-white disabled:opacity-40 hover:bg-violet-600">
                          {editingMedId ? "Update" : "Add Medication"}
                        </button>
                        <button type="button" onClick={() => { setMedFO(false); setEditMed(null); }}
                          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-500 hover:text-slate-300">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => openMedForm()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-3 text-sm text-slate-500 hover:border-violet-700 hover:text-violet-400 transition-colors">
                      <Plus className="h-4 w-4" /> Add Medication
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Elapsed</p>
            <p className="font-mono text-lg font-bold text-slate-300 tabular-nums">{startTime ? fmtElapsed(elapsed) : "—"}</p>
          </div>
          <button type="button" onClick={() => setView("handover")}
            className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 active:bg-teal-800">
            Handover
          </button>
          {resetConfirm ? (
            <div className="flex gap-1">
              <button type="button" onClick={resetAll} className="rounded-xl bg-rose-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-rose-600">Confirm</button>
              <button type="button" onClick={() => setRC(false)} className="rounded-xl border border-slate-700 px-3 py-2.5 text-xs text-slate-500 hover:text-slate-300">Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={() => setRC(true)}
              className="rounded-xl border border-slate-800 px-3 py-2.5 text-xs text-slate-500 hover:border-rose-800 hover:text-rose-400">
              New patient
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
