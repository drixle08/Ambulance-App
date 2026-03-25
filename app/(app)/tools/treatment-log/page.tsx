"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, X } from "lucide-react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type PatientType = "medical" | "trauma" | "paeds" | "obstetric";

interface ItemDef {
  id: string;
  label: string;
  sub?: string;
  onlyFor?: PatientType[];
  framework?: string; // LOCABC/CCLOCABC letter(s) — triggers header badge on change
}

interface StageDef {
  id: string;
  title: string;
  color: string; // tailwind color name
  items: ItemDef[];
  isMeds?: true;
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
   COLOUR TOKENS  (all literal for Tailwind)
════════════════════════════════════════════════════════════ */
const CLR: Record<string, { bg: string; border: string; text: string; badge: string; pill: string }> = {
  slate:   { bg: "bg-slate-800/40",   border: "border-slate-700/60",   text: "text-slate-400",   badge: "bg-slate-800 text-slate-400",   pill: "bg-slate-700/60 text-slate-300" },
  rose:    { bg: "bg-rose-950/30",    border: "border-rose-800/50",    text: "text-rose-400",    badge: "bg-rose-900/60 text-rose-300",    pill: "bg-rose-900/40 text-rose-300" },
  sky:     { bg: "bg-sky-950/30",     border: "border-sky-800/50",     text: "text-sky-400",     badge: "bg-sky-900/60 text-sky-300",     pill: "bg-sky-900/40 text-sky-300" },
  amber:   { bg: "bg-amber-950/30",   border: "border-amber-800/50",   text: "text-amber-400",   badge: "bg-amber-900/60 text-amber-300",   pill: "bg-amber-900/40 text-amber-300" },
  teal:    { bg: "bg-teal-950/30",    border: "border-teal-800/50",    text: "text-teal-400",    badge: "bg-teal-900/60 text-teal-300",    pill: "bg-teal-900/40 text-teal-300" },
  orange:  { bg: "bg-orange-950/30",  border: "border-orange-800/50",  text: "text-orange-400",  badge: "bg-orange-900/60 text-orange-300",  pill: "bg-orange-900/40 text-orange-300" },
  violet:  { bg: "bg-violet-950/30",  border: "border-violet-800/50",  text: "text-violet-400",  badge: "bg-violet-900/60 text-violet-300",  pill: "bg-violet-900/40 text-violet-300" },
  indigo:  { bg: "bg-indigo-950/30",  border: "border-indigo-800/50",  text: "text-indigo-400",  badge: "bg-indigo-900/60 text-indigo-300",  pill: "bg-indigo-900/40 text-indigo-300" },
  emerald: { bg: "bg-emerald-950/30", border: "border-emerald-800/50", text: "text-emerald-400", badge: "bg-emerald-900/60 text-emerald-300", pill: "bg-emerald-900/40 text-emerald-300" },
};

/* ════════════════════════════════════════════════════════════
   STAGE DATA
════════════════════════════════════════════════════════════ */

// Primary survey items use `framework` to render section headers
const PRIMARY_ITEMS: ItemDef[] = [
  // CC — Trauma only
  { id: "pri-cc-tq",      label: "Tourniquet applied",                          sub: "Time of application documented",        framework: "CC", onlyFor: ["trauma"] },
  { id: "pri-cc-pack",    label: "Wound packing / haemostatic dressing",         sub: "Direct pressure maintained",            framework: "CC", onlyFor: ["trauma"] },
  { id: "pri-cc-binder",  label: "Pelvic binder applied",                        sub: "If pelvic instability suspected",        framework: "CC", onlyFor: ["trauma"] },
  // L — Level of consciousness / Life-threatening haemorrhage
  { id: "pri-l-loc",      label: "Level of consciousness assessed",               sub: "AVPU / GCS",                            framework: "L" },
  { id: "pri-l-bleed",    label: "Life-threatening haemorrhage identified",       sub: "Controlled / ongoing",                  framework: "L" },
  // O — Oxygen / initial airway
  { id: "pri-o-pos",      label: "Patient positioned / airway opened",            sub: "Recovery, upright, supine as indicated",framework: "O" },
  { id: "pri-o-o2",       label: "Oxygen applied",                                sub: "Device and flow rate noted",            framework: "O" },
  // C — Cervical spine (trauma) / Circulation (medical)
  { id: "pri-c-spine",    label: "Cervical spine — manual stabilisation",         sub: "MILS applied if mechanism warrants",    framework: "C-spine", onlyFor: ["trauma"] },
  { id: "pri-c-pulse",    label: "Circulatory status assessed",                   sub: "Radial / carotid; CPR if absent",       framework: "C-circ",  onlyFor: ["medical", "paeds", "obstetric"] },
  // A — Airway
  { id: "pri-a-patent",   label: "Airway patent and clear",                       sub: "Adjunct / manoeuvre if needed",         framework: "A" },
  { id: "pri-a-at",       label: "Paediatric Assessment Triangle (PAT) complete", sub: "Appearance, Work of breathing, Colour", framework: "A", onlyFor: ["paeds"] },
  // B — Breathing
  { id: "pri-b-rate",     label: "Breathing — rate, depth, effort assessed",      sub: "SpO2 and auscultation",                 framework: "B" },
  { id: "pri-b-ptx",      label: "Tension pneumothorax excluded / treated",       sub: "Clinical exam; needle decompression if needed", framework: "B", onlyFor: ["trauma"] },
  // C — Circulation management
  { id: "pri-c2-circ",    label: "Circulation — haemodynamics managed",           sub: "IV/IO access; fluid / vasopressor decision",  framework: "C2" },
  { id: "pri-c2-ob",      label: "Uterine displacement applied",                  sub: "Left lateral tilt if >20 weeks gestation",   framework: "C2", onlyFor: ["obstetric"] },
];

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
      { id: "sc-ga",        label: "Gestational age confirmed", onlyFor: ["obstetric"] },
    ],
  },
  {
    id: "primary", title: "Primary Survey", color: "rose",
    items: PRIMARY_ITEMS,
  },
  {
    id: "vitals", title: "Vitals & Monitoring", color: "sky",
    items: [
      { id: "vt-spo2",    label: "SpO2" },
      { id: "vt-ecg3",    label: "3-lead ECG" },
      { id: "vt-ecg12",   label: "12-lead ECG" },
      { id: "vt-bp",      label: "Blood pressure" },
      { id: "vt-bgl",     label: "Blood glucose (BGL)" },
      { id: "vt-etco2",   label: "EtCO2 / capnography" },
      { id: "vt-temp",    label: "Temperature" },
      { id: "vt-pupils",  label: "Pupils (PEARL)" },
      { id: "vt-rr",      label: "Respiratory rate (manual count)" },
      { id: "vt-pain",    label: "Pain score (0–10 / FLACC)" },
      { id: "vt-gcs",     label: "GCS documented" },
      { id: "vt-rass",    label: "Sedation score (RASS)" },
      { id: "vt-weight",  label: "Weight estimated / confirmed" },
      { id: "vt-fhr",     label: "Foetal heart rate assessed", onlyFor: ["obstetric"] },
    ],
  },
  {
    id: "history", title: "History — SAMPLE", color: "amber",
    items: [
      { id: "hx-s",       label: "S — Signs & Symptoms",           sub: "Onset, character, severity, radiation, associations" },
      { id: "hx-a",       label: "A — Allergies",                  sub: "Medications, latex, environmental" },
      { id: "hx-m",       label: "M — Current medications",        sub: "Including OTC and supplements" },
      { id: "hx-p",       label: "P — Past medical / surgical Hx", sub: "Relevant comorbidities" },
      { id: "hx-l",       label: "L — Last oral intake",           sub: "Time and nature" },
      { id: "hx-e",       label: "E — Events leading to call" },
      { id: "hx-guardian",label: "Parent / guardian present and informed", onlyFor: ["paeds"] },
    ],
  },
  {
    id: "airway", title: "Airway Management", color: "teal",
    items: [
      { id: "aw-hc",      label: "Head-tilt chin-lift" },
      { id: "aw-jt",      label: "Jaw thrust" },
      { id: "aw-suction", label: "Suction performed" },
      { id: "aw-opa",     label: "OPA inserted" },
      { id: "aw-npa",     label: "NPA inserted" },
      { id: "aw-igel",    label: "i-gel / SGA inserted" },
      { id: "aw-ett",     label: "Endotracheal intubation (RSI/DSI)", sub: "Drug sequence and tube size documented" },
      { id: "aw-conf",    label: "ETT confirmed",                     sub: "EtCO2 waveform + bilateral auscultation" },
      { id: "aw-surgical",label: "Surgical airway" },
    ],
  },
  {
    id: "breathing", title: "Breathing & Oxygenation", color: "sky",
    items: [
      { id: "br-nc",      label: "Nasal cannula O2" },
      { id: "br-sm",      label: "Simple face mask O2" },
      { id: "br-nrb",     label: "Non-rebreather mask (NRB) 15 L/min" },
      { id: "br-bvm",     label: "BVM ventilation" },
      { id: "br-vent",    label: "Mechanical ventilator initiated" },
      { id: "br-cpap",    label: "CPAP / NIV applied" },
      { id: "br-nd-l",    label: "Needle decompression — Left" },
      { id: "br-nd-r",    label: "Needle decompression — Right" },
      { id: "br-seal-l",  label: "Chest seal applied — Left" },
      { id: "br-seal-r",  label: "Chest seal applied — Right" },
      { id: "br-neb",     label: "Nebuliser treatment administered" },
    ],
  },
  {
    id: "circulation", title: "Circulation & Access", color: "orange",
    items: [
      { id: "ci-iv",      label: "IV access established" },
      { id: "ci-io",      label: "IO access established" },
      { id: "ci-f250",    label: "Fluid bolus — 250 mL NaCl 0.9%" },
      { id: "ci-f500",    label: "Fluid bolus — 500 mL NaCl 0.9%" },
      { id: "ci-blood",   label: "Blood products administered" },
      { id: "ci-defib",   label: "Defibrillation delivered" },
      { id: "ci-cardio",  label: "Synchronised cardioversion" },
      { id: "ci-pacing",  label: "External pacing initiated" },
      { id: "ci-cpr",     label: "CPR initiated" },
      { id: "ci-lucas",   label: "Mechanical CPR device applied" },
    ],
  },
  {
    id: "meds", title: "Medications", color: "violet",
    items: [], isMeds: true,
  },
  {
    id: "secondary", title: "Secondary Survey", color: "indigo",
    items: [
      { id: "ss-head",    label: "Head & face assessed" },
      { id: "ss-neck",    label: "Neck & JVP assessed" },
      { id: "ss-chest",   label: "Chest — inspect, palpate, auscultate" },
      { id: "ss-abd",     label: "Abdomen assessed" },
      { id: "ss-pelvis",  label: "Pelvis assessed" },
      { id: "ss-limbs",   label: "All four limbs assessed" },
      { id: "ss-back",    label: "Back assessed (log roll if indicated)" },
      { id: "ss-neuro",   label: "Neurological exam completed" },
      { id: "ss-vitals2", label: "Repeat vitals documented" },
      { id: "ss-response",label: "Response to treatment noted" },
      { id: "ss-delivery",label: "Field delivery performed",             onlyFor: ["obstetric"] },
      { id: "ss-cord",    label: "Cord clamped and cut",                 onlyFor: ["obstetric"] },
      { id: "ss-apgar",   label: "APGAR at 1 min & 5 min",              onlyFor: ["obstetric"] },
      { id: "ss-placenta",label: "Placenta delivered",                   onlyFor: ["obstetric"] },
      { id: "ss-pph",     label: "PPH management initiated",             onlyFor: ["obstetric"] },
    ],
  },
  {
    id: "immob", title: "Immobilisation & Wound Care", color: "amber",
    items: [
      { id: "im-collar",  label: "Cervical collar applied" },
      { id: "im-vacuum",  label: "Vacuum mattress / scoop stretcher" },
      { id: "im-splint",  label: "Limb splint applied" },
      { id: "im-traction",label: "Traction splint applied" },
      { id: "im-pelvic",  label: "Pelvic binder applied" },
      { id: "im-sling",   label: "Sling / broad arm sling" },
      { id: "im-dressing",label: "Wound dressing applied" },
      { id: "im-burns",   label: "Burns management / dressing" },
      { id: "im-tq-time", label: "Tourniquet application time documented" },
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
   FRAMEWORK LABELS
════════════════════════════════════════════════════════════ */
const FRAMEWORK_LABELS: Record<string, Record<PatientType, string | null>> = {
  CC:       { medical: null, trauma: "CC — Critical / Catastrophic Haemorrhage", paeds: null, obstetric: null },
  L:        { medical: "L — Level of Consciousness", trauma: "L — Level of Consciousness", paeds: "L — Level of Consciousness", obstetric: "L — Level of Consciousness" },
  O:        { medical: "O — Oxygen & Initial Airway",  trauma: "O — Oxygen & Initial Airway",  paeds: "O — Oxygen & Initial Airway",  obstetric: "O — Oxygen & Initial Airway" },
  "C-spine":{ medical: null, trauma: "C — Cervical Spine", paeds: null, obstetric: null },
  "C-circ": { medical: "C — Circulation", trauma: null, paeds: "C — Circulation", obstetric: "C — Circulation" },
  A:        { medical: "A — Airway", trauma: "A — Airway", paeds: "A — Airway", obstetric: "A — Airway" },
  B:        { medical: "B — Breathing", trauma: "B — Breathing", paeds: "B — Breathing", obstetric: "B — Breathing" },
  C2:       { medical: "C — Circulation Management", trauma: "C — Circulation Management", paeds: "C — Circulation Management", obstetric: "C — Circulation Management" },
};

/* ════════════════════════════════════════════════════════════
   MEDICATION PRESETS
════════════════════════════════════════════════════════════ */
const PRESET_DRUGS = [
  "Adrenaline", "Amiodarone", "Aspirin", "Atropine", "Clopidogrel",
  "Dexamethasone", "Fentanyl", "Flumazenil", "GTN", "Glucagon",
  "Glucose 10%", "Hydrocortisone", "Ipratropium", "Ketamine",
  "Magnesium Sulphate", "Methoxyflurane", "Midazolam", "Morphine",
  "Naloxone", "Noradrenaline", "Ondansetron", "Oxytocin",
  "Salbutamol", "TXA", "Other",
];

const MED_ROUTES = ["IV", "IO", "IM", "IN", "SL", "NEB", "SC", "PO", "ETT", "PR"];

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

function visibleItems(items: ItemDef[], pt: PatientType) {
  return items.filter((i) => !i.onlyFor || i.onlyFor.includes(pt));
}

const PT_META = {
  medical:   { label: "Medical",    sub: "LOCABC",         color: "sky" },
  trauma:    { label: "Trauma",     sub: "CCLOCABC",       color: "rose" },
  paeds:     { label: "Paediatric", sub: "LOCABC + Paeds", color: "amber" },
  obstetric: { label: "Obstetric",  sub: "LOCABC + OB",    color: "violet" },
};

const PT_CLR: Record<PatientType, { pill: string; active: string; border: string }> = {
  medical:   { pill: "bg-slate-800 text-slate-400 border-slate-700", active: "bg-sky-900/70 text-sky-300 border-sky-700",     border: "border-sky-700" },
  trauma:    { pill: "bg-slate-800 text-slate-400 border-slate-700", active: "bg-rose-900/70 text-rose-300 border-rose-700",   border: "border-rose-700" },
  paeds:     { pill: "bg-slate-800 text-slate-400 border-slate-700", active: "bg-amber-900/70 text-amber-300 border-amber-700",border: "border-amber-700" },
  obstetric: { pill: "bg-slate-800 text-slate-400 border-slate-700", active: "bg-violet-900/70 text-violet-300 border-violet-700",border: "border-violet-700" },
};

/* ════════════════════════════════════════════════════════════
   HANDOVER TEXT BUILDER
════════════════════════════════════════════════════════════ */
function buildHandover(
  pt: PatientType, startTime: Date | null,
  checked: CheckedMap, meds: MedEntry[],
): string {
  const startStr = startTime
    ? startTime.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "—";
  const lines: string[] = [
    "PATIENT TREATMENT LOG",
    "─".repeat(38),
    `Type:       ${PT_META[pt].label} (${PT_META[pt].sub})`,
    `Scene time: ${startStr}`,
    "─".repeat(38),
    "",
  ];

  for (const stage of STAGES) {
    if (stage.isMeds) {
      if (meds.length === 0) continue;
      lines.push(`[ ${stage.title.toUpperCase()} ]`);
      for (const m of meds) {
        lines.push(`  ${m.time}  ${m.drug}  ${m.dose}  ${m.route}`);
      }
      lines.push("");
      continue;
    }
    const vis = visibleItems(stage.items, pt);
    const done = vis.filter((i) => checked[i.id]);
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
  /* ─── Session state ─── */
  const [pt, setPt] = useState<PatientType>("medical");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [view, setView] = useState<"log" | "handover">("log");
  const [resetConfirm, setResetConfirm] = useState(false);
  const startRef = useRef<Date | null>(null);

  /* ─── Treatment state ─── */
  const [checked, setChecked] = useState<CheckedMap>({});
  const [meds, setMeds] = useState<MedEntry[]>([]);

  /* ─── UI state ─── */
  const [openStage, setOpenStage] = useState<string | null>("scene");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ time: "", note: "" });
  const [medFormOpen, setMedFormOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [medDrug, setMedDrug] = useState("");
  const [medCustomDrug, setMedCustomDrug] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medRoute, setMedRoute] = useState("IV");
  const [medTime, setMedTime] = useState("");

  /* ─── Elapsed timer ─── */
  useEffect(() => {
    if (!startTime) return;
    startRef.current = startTime;
    const id = setInterval(() => {
      if (startRef.current) {
        setElapsed(Math.floor((Date.now() - startRef.current.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  /* ─── Handlers ─── */
  function ensureStarted() {
    if (!startRef.current) {
      const now = new Date();
      startRef.current = now;
      setStartTime(now);
    }
  }

  function handleItemTap(itemId: string) {
    ensureStarted();
    setMedFormOpen(false);
    if (checked[itemId]) {
      // Already checked → open editor
      setEditingId(itemId);
      setEditDraft({ time: checked[itemId].time, note: checked[itemId].note });
    } else {
      // First tap → check with timestamp
      setChecked((prev) => ({ ...prev, [itemId]: { time: nowHHMM(), note: "" } }));
      setEditingId(null);
    }
  }

  function handleEditSave() {
    if (!editingId) return;
    setChecked((prev) => ({ ...prev, [editingId]: editDraft }));
    setEditingId(null);
  }

  function handleUncheck(itemId: string) {
    setChecked((prev) => {
      const n = { ...prev };
      delete n[itemId];
      return n;
    });
    setEditingId(null);
  }

  function openMedForm(medId?: string) {
    setEditingId(null);
    if (medId) {
      const m = meds.find((x) => x.id === medId);
      if (!m) return;
      setEditingMedId(medId);
      setMedDrug(PRESET_DRUGS.includes(m.drug) ? m.drug : "Other");
      setMedCustomDrug(PRESET_DRUGS.includes(m.drug) ? "" : m.drug);
      setMedDose(m.dose);
      setMedRoute(m.route);
      setMedTime(m.time);
    } else {
      setEditingMedId(null);
      setMedDrug("");
      setMedCustomDrug("");
      setMedDose("");
      setMedRoute("IV");
      setMedTime(nowHHMM());
    }
    setMedFormOpen(true);
  }

  function saveMed() {
    const drug = medDrug === "Other" ? medCustomDrug.trim() : medDrug;
    if (!drug || !medDose.trim()) return;
    const entry: MedEntry = {
      id: editingMedId ?? `med-${Date.now()}`,
      drug, dose: medDose.trim(), route: medRoute, time: medTime || nowHHMM(),
    };
    if (editingMedId) {
      setMeds((prev) => prev.map((m) => m.id === editingMedId ? entry : m));
    } else {
      ensureStarted();
      setMeds((prev) => [...prev, entry]);
    }
    setMedFormOpen(false);
    setEditingMedId(null);
  }

  function deleteMed(id: string) {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  }

  function resetAll() {
    setChecked({});
    setMeds([]);
    setStartTime(null);
    setElapsed(0);
    setPt("medical");
    setView("log");
    setOpenStage("scene");
    setEditingId(null);
    setMedFormOpen(false);
    setEditingMedId(null);
    setResetConfirm(false);
    startRef.current = null;
  }

  const hasStarted = Object.keys(checked).length > 0 || meds.length > 0;

  const handoverText = useMemo(
    () => buildHandover(pt, startTime, checked, meds),
    [pt, startTime, checked, meds],
  );

  /* ─── Patient type selector ─── */
  const PtSelector = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-600">Patient type</p>
        {hasStarted && (
          <span className="text-[0.6rem] text-slate-700 border border-slate-800 rounded-full px-2 py-0.5">
            locked — reset to change
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(PT_META) as PatientType[]).map((type) => {
          const meta = PT_META[type];
          const clr = PT_CLR[type];
          const isActive = pt === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => { if (!hasStarted) setPt(type); }}
              disabled={hasStarted && pt !== type}
              className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                isActive ? clr.active : "bg-slate-900/60 text-slate-500 border-slate-800 opacity-60"
              } ${hasStarted ? "cursor-default" : "active:scale-95"}`}
            >
              <span className="text-sm font-bold">{meta.label}</span>
              <span className="text-[0.6rem] opacity-60">{meta.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ─── Stage cards ─── */
  const StageCards = () => (
    <div className="space-y-2">
      {STAGES.map((stage) => {
        const clr = CLR[stage.color] ?? CLR.slate;
        const vis = visibleItems(stage.items, pt);
        const doneCount = stage.isMeds
          ? meds.length
          : vis.filter((i) => checked[i.id]).length;
        const total = stage.isMeds ? null : vis.length;
        const isOpen = openStage === stage.id;
        const allDone = !stage.isMeds && total !== null && doneCount === total && total > 0;

        return (
          <div key={stage.id} className={`rounded-2xl border overflow-hidden ${clr.border} ${clr.bg}`}>
            {/* Stage header */}
            <button
              type="button"
              onClick={() => setOpenStage(isOpen ? null : stage.id)}
              className="flex w-full items-center gap-3 px-4 py-3"
            >
              <div className="flex-1 text-left">
                <span className={`text-sm font-bold ${clr.text}`}>{stage.title}</span>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold ${
                allDone ? clr.pill : "bg-slate-800/80 text-slate-500"
              }`}>
                {stage.isMeds
                  ? doneCount > 0 ? `${doneCount} med${doneCount !== 1 ? "s" : ""}` : "—"
                  : `${doneCount} / ${total}`}
              </span>
              {isOpen
                ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-600" />
                : <ChevronDown className="h-4 w-4 shrink-0 text-slate-600" />}
            </button>

            {/* Stage body */}
            {isOpen && !stage.isMeds && (
              <div className="border-t border-slate-800/50 divide-y divide-slate-800/40">
                {(() => {
                  let lastFramework: string | null = null;
                  return vis.map((item) => {
                    const isChecked = !!checked[item.id];
                    const isEditing = editingId === item.id;
                    const frameworkChanged = item.framework && item.framework !== lastFramework;
                    if (item.framework) lastFramework = item.framework;
                    const frameworkLabel = item.framework
                      ? FRAMEWORK_LABELS[item.framework]?.[pt] ?? null
                      : null;

                    return (
                      <div key={item.id}>
                        {/* Framework badge */}
                        {frameworkChanged && frameworkLabel && (
                          <div className={`px-4 py-1.5 ${clr.bg}`}>
                            <span className={`text-[0.6rem] font-black uppercase tracking-widest ${clr.text}`}>
                              {frameworkLabel}
                            </span>
                          </div>
                        )}

                        {/* Item row */}
                        <button
                          type="button"
                          onClick={() => handleItemTap(item.id)}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                            isChecked ? "bg-slate-900/60" : "hover:bg-slate-900/30 active:bg-slate-900/40"
                          }`}
                        >
                          {/* Checkbox indicator */}
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isChecked
                              ? `${clr.pill} border-transparent`
                              : "border-slate-700 bg-slate-900"
                          }`}>
                            {isChecked && <div className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />}
                          </div>
                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${isChecked ? "text-slate-300" : "text-slate-400"}`}>
                              {item.label}
                            </p>
                            {item.sub && (
                              <p className="text-[0.65rem] text-slate-600 mt-0.5">{item.sub}</p>
                            )}
                          </div>
                          {/* Time badge */}
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
                              <div className="flex-1 space-y-1">
                                <label className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Time</label>
                                <input
                                  type="time"
                                  value={editDraft.time}
                                  onChange={(e) => setEditDraft((d) => ({ ...d, time: e.target.value }))}
                                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm font-mono text-slate-200 focus:border-slate-500 focus:outline-none"
                                />
                              </div>
                              <div className="flex-[2] space-y-1">
                                <label className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Note (optional)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. right AC, 18G"
                                  value={editDraft.note}
                                  onChange={(e) => setEditDraft((d) => ({ ...d, note: e.target.value }))}
                                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-slate-500 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleEditSave}
                                className="flex-1 rounded-lg bg-slate-700 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUncheck(item.id)}
                                className="flex items-center gap-1 rounded-lg bg-rose-950/60 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/60"
                              >
                                <X className="h-3 w-3" /> Remove
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Medications stage body */}
            {isOpen && stage.isMeds && (
              <div className="border-t border-slate-800/50 px-4 pb-4 pt-3 space-y-3">
                {/* Med entries */}
                {meds.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200">{m.drug}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className={`font-mono font-bold ${clr.text}`}>{m.time}</span>
                        {" · "}{m.dose}{" · "}{m.route}
                      </p>
                    </div>
                    <button type="button" onClick={() => openMedForm(m.id)} className="p-1.5 text-slate-600 hover:text-slate-300">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => deleteMed(m.id)} className="p-1.5 text-slate-700 hover:text-rose-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Medication form */}
                {medFormOpen ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 space-y-3">
                    {/* Drug picker */}
                    <div className="space-y-1">
                      <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Drug</label>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {PRESET_DRUGS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setMedDrug(d)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                              medDrug === d
                                ? "bg-violet-700 text-violet-100"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      {medDrug === "Other" && (
                        <input
                          type="text"
                          placeholder="Drug name"
                          value={medCustomDrug}
                          onChange={(e) => setMedCustomDrug(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-slate-500 focus:outline-none"
                          autoFocus
                        />
                      )}
                    </div>

                    {/* Dose */}
                    <div className="space-y-1">
                      <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Dose</label>
                      <input
                        type="text"
                        placeholder="e.g. 100 mcg, 10 mg, 500 mL"
                        value={medDose}
                        onChange={(e) => setMedDose(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-slate-500 focus:outline-none"
                      />
                    </div>

                    {/* Route */}
                    <div className="space-y-1">
                      <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Route</label>
                      <div className="flex flex-wrap gap-1.5">
                        {MED_ROUTES.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setMedRoute(r)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                              medRoute === r
                                ? "bg-violet-700 text-violet-100"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="space-y-1">
                      <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-600">Time administered</label>
                      <input
                        type="time"
                        value={medTime}
                        onChange={(e) => setMedTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 font-mono text-sm text-slate-200 focus:border-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={saveMed}
                        disabled={!medDrug || (medDrug === "Other" && !medCustomDrug.trim()) || !medDose.trim()}
                        className="flex-1 rounded-lg bg-violet-700 py-2 text-sm font-bold text-white disabled:opacity-40 hover:bg-violet-600"
                      >
                        {editingMedId ? "Update" : "Add Medication"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMedFormOpen(false); setEditingMedId(null); }}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-500 hover:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openMedForm()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-3 text-sm text-slate-500 hover:border-violet-700 hover:text-violet-400 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Medication
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ─── Handover view ─── */
  if (view === "handover") {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setView("log")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200"
          >
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
  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-32 space-y-4">
      {/* Header */}
      <header>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-teal-500">
          Clinical Management
        </p>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Treatment Log</h1>
        <p className="text-xs text-slate-500">Tap each intervention as you perform it — timestamps auto-set.</p>
      </header>

      {/* Patient type */}
      <PtSelector />

      {/* Stages */}
      <StageCards />

      {/* Floating bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center gap-3">
          {/* Elapsed */}
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-600">Elapsed</p>
            <p className="font-mono text-lg font-bold text-slate-300 tabular-nums">
              {startTime ? fmtElapsed(elapsed) : "—"}
            </p>
          </div>
          {/* Handover */}
          <button
            type="button"
            onClick={() => setView("handover")}
            className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 active:bg-teal-800"
          >
            Handover
          </button>
          {/* Reset */}
          {resetConfirm ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={resetAll}
                className="rounded-xl bg-rose-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-rose-600"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="rounded-xl border border-slate-700 px-3 py-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="rounded-xl border border-slate-800 px-3 py-2.5 text-xs text-slate-500 hover:border-rose-800 hover:text-rose-400"
            >
              New patient
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
