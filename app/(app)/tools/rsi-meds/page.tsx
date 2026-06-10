"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Wind,
  Pill,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  Info,
  Activity,
  XCircle,
  Zap,
  CheckCircle2,
} from "lucide-react";

// ─── Summary ──────────────────────────────────────────────────────────────────

const summaryText =
  "RSI Medications — CPG 11.1 HMCAS v2.5 2026 (CCP scope). " +
  "PREPARE: 100% O₂ ×3–5 min, SpO₂ >95%, sniffing/ramped position, 3 ETT sizes + bougie + suction, IV/IO access, drugs drawn, failed airway plan ready. " +
  "PRE-TREAT (T−3 min): Fentanyl 1–3 mcg/kg IV slow push — OMIT if haemodynamic compromise, opioid/BZD/alcohol toxidrome, suspected raised ICP without haemodynamic reserve. " +
  "Paeds atropine 0.02 mg/kg IV (min 0.1 mg, max 0.5 mg). " +
  "INDUCE (T=0): Ketamine 1.5–2 mg/kg IV. If haemodynamically compromised: 1 mg/kg. Alt: Midazolam 0.1 mg/kg IV. " +
  "PARALYSE: Succinylcholine 1.5 mg/kg IV — onset 30–60 s, duration 8–12 min. " +
  "If Sux CI: Rocuronium 1.2 mg/kg IV — onset 60–90 s, duration 45–70 min. " +
  "Sux CI: hyperkalaemia, rhabdomyolysis, burns/crush >48h, neuromuscular disease. " +
  "POST-INTUBATION: Ketamine 1–2 mg/kg/h infusion + Fentanyl 1–5 mcg/kg/h infusion. " +
  "Re-paralysis: Rocuronium 0.6 mg/kg IV PRN. " +
  "Post-intubation hypotension: Noradrenaline 0.01–0.3 mcg/kg/min IV. " +
  "Targets: SpO₂ >95%, ETCO₂ 35–45 mmHg, SBP >90 mmHg.";

// ─── Phase flow data ──────────────────────────────────────────────────────────

type PhaseColor = "sky" | "amber" | "violet" | "rose" | "slate" | "emerald";

const PHASES: {
  num: number;
  label: string;
  drug: string;
  timing: string;
  color: PhaseColor;
}[] = [
  { num: 1, label: "PREPARE", drug: "O₂ · Setup", timing: "T−5 min", color: "sky" },
  { num: 2, label: "PRE-TREAT", drug: "Fentanyl ± Atropine", timing: "T−3 min", color: "amber" },
  { num: 3, label: "INDUCE", drug: "Ketamine / MDZ", timing: "T=0", color: "violet" },
  { num: 4, label: "PARALYSE", drug: "Sux / Rocuronium", timing: "T+0", color: "rose" },
  { num: 5, label: "CONFIRM", drug: "ETCO₂ · Sounds", timing: "T+60 s", color: "slate" },
  { num: 6, label: "MAINTAIN", drug: "K + F infusion", timing: "T+2 min", color: "emerald" },
];

const PHASE_COLORS: Record<
  PhaseColor,
  { ring: string; bg: string; text: string; dot: string; line: string; numBg: string }
> = {
  sky: {
    ring: "border-sky-600/50",
    bg: "bg-sky-950/40",
    text: "text-sky-300",
    dot: "bg-sky-500",
    line: "bg-sky-800/60",
    numBg: "bg-sky-700/50 text-sky-200",
  },
  amber: {
    ring: "border-amber-600/50",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    dot: "bg-amber-500",
    line: "bg-amber-800/60",
    numBg: "bg-amber-700/50 text-amber-200",
  },
  violet: {
    ring: "border-violet-600/50",
    bg: "bg-violet-950/40",
    text: "text-violet-300",
    dot: "bg-violet-500",
    line: "bg-violet-800/60",
    numBg: "bg-violet-700/50 text-violet-200",
  },
  rose: {
    ring: "border-rose-600/50",
    bg: "bg-rose-950/40",
    text: "text-rose-300",
    dot: "bg-rose-500",
    line: "bg-rose-800/60",
    numBg: "bg-rose-700/50 text-rose-200",
  },
  slate: {
    ring: "border-slate-600/50",
    bg: "bg-slate-800/40",
    text: "text-slate-300",
    dot: "bg-slate-500",
    line: "bg-slate-700/60",
    numBg: "bg-slate-700/50 text-slate-200",
  },
  emerald: {
    ring: "border-emerald-600/50",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    dot: "bg-emerald-500",
    line: "bg-emerald-800/60",
    numBg: "bg-emerald-700/50 text-emerald-200",
  },
};

// ─── Accordion config ─────────────────────────────────────────────────────────

const SECTION_IDS = [
  "prepare",
  "pretreat",
  "induce",
  "paralyse",
  "confirm",
  "maintain",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

type SectionMeta = {
  id: SectionId;
  title: string;
  subtitle: string;
  color: PhaseColor;
  phaseNum: number;
};

const SECTION_META: SectionMeta[] = [
  {
    id: "prepare",
    title: "Prepare",
    subtitle: "Pre-oxygenation · Positioning · Equipment",
    color: "sky",
    phaseNum: 1,
  },
  {
    id: "pretreat",
    title: "Pre-treatment",
    subtitle: "Fentanyl · Atropine (paeds) — T−3 min",
    color: "amber",
    phaseNum: 2,
  },
  {
    id: "induce",
    title: "Induction",
    subtitle: "Ketamine (first-line) · Midazolam (alt) — T=0",
    color: "violet",
    phaseNum: 3,
  },
  {
    id: "paralyse",
    title: "Paralysis",
    subtitle: "Succinylcholine (first-line) · Rocuronium (alt)",
    color: "rose",
    phaseNum: 4,
  },
  {
    id: "confirm",
    title: "Intubation & Confirmation",
    subtitle: "Laryngoscopy · ETT placement · ETCO₂",
    color: "slate",
    phaseNum: 5,
  },
  {
    id: "maintain",
    title: "Post-intubation Maintenance",
    subtitle: "Sedation · Analgesia · Paralysis · Vasopressors",
    color: "emerald",
    phaseNum: 6,
  },
];

const COLOR_STYLES: Record<
  PhaseColor,
  {
    activeBorder: string;
    headerBg: string;
    iconBg: string;
    accent: string;
    stepActive: string;
  }
> = {
  sky: {
    activeBorder: "border-sky-800/50",
    headerBg: "bg-sky-950/30",
    iconBg: "bg-sky-900/60 text-sky-400",
    accent: "text-sky-400",
    stepActive: "bg-sky-900/60 text-sky-300 border-sky-700/50",
  },
  amber: {
    activeBorder: "border-amber-800/50",
    headerBg: "bg-amber-950/30",
    iconBg: "bg-amber-900/60 text-amber-400",
    accent: "text-amber-400",
    stepActive: "bg-amber-900/60 text-amber-300 border-amber-700/50",
  },
  violet: {
    activeBorder: "border-violet-800/50",
    headerBg: "bg-violet-950/30",
    iconBg: "bg-violet-900/60 text-violet-400",
    accent: "text-violet-400",
    stepActive: "bg-violet-900/60 text-violet-300 border-violet-700/50",
  },
  rose: {
    activeBorder: "border-rose-800/50",
    headerBg: "bg-rose-950/30",
    iconBg: "bg-rose-900/60 text-rose-400",
    accent: "text-rose-400",
    stepActive: "bg-rose-900/60 text-rose-300 border-rose-700/50",
  },
  slate: {
    activeBorder: "border-slate-600/50",
    headerBg: "bg-slate-800/30",
    iconBg: "bg-slate-700/60 text-slate-400",
    accent: "text-slate-400",
    stepActive: "bg-slate-700/60 text-slate-300 border-slate-600/50",
  },
  emerald: {
    activeBorder: "border-emerald-800/50",
    headerBg: "bg-emerald-950/30",
    iconBg: "bg-emerald-900/60 text-emerald-400",
    accent: "text-emerald-400",
    stepActive: "bg-emerald-900/60 text-emerald-300 border-emerald-700/50",
  },
};

// ─── Primitives ───────────────────────────────────────────────────────────────

function CcpBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider border border-violet-500/40 bg-violet-500/10 text-violet-300">
      CCP
    </span>
  );
}

function PedsBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider border border-sky-500/40 bg-sky-500/10 text-sky-300">
      Paeds
    </span>
  );
}

function SubLabel({ label, color = "slate" }: { label: string; color?: string }) {
  const map: Record<string, string> = {
    slate: "text-slate-500",
    rose: "text-rose-600",
    amber: "text-amber-600",
    sky: "text-sky-600",
    emerald: "text-emerald-600",
    violet: "text-violet-600",
  };
  return (
    <p className={`text-[0.6rem] font-bold uppercase tracking-[0.2em] ${map[color] ?? "text-slate-500"} px-1 pt-2 pb-0.5`}>
      {label}
    </p>
  );
}

function ActionItem({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2.5 px-1 py-0.5">
      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
      <div>
        <p className="text-sm text-slate-200">{text}</p>
        {sub && <p className="mt-0.5 text-[0.68rem] text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

function WarnItem({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
      <div>
        <p className="text-sm font-semibold text-rose-200">{text}</p>
        {sub && <p className="mt-0.5 text-[0.68rem] text-rose-400">{sub}</p>}
      </div>
    </div>
  );
}

function CautionItem({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2">
      <Info className="h-3.5 w-3.5 shrink-0 mt-[3px] text-amber-400" />
      <div>
        <p className="text-xs font-medium text-amber-200">{text}</p>
        {sub && <p className="mt-0.5 text-[0.65rem] text-amber-500">{sub}</p>}
      </div>
    </div>
  );
}

function OmitItem({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-600/30 bg-rose-600/5 px-3 py-2">
      <XCircle className="h-3.5 w-3.5 shrink-0 mt-[3px] text-rose-500" />
      <div>
        <p className="text-xs font-medium text-rose-200">{text}</p>
        {sub && <p className="mt-0.5 text-[0.65rem] text-rose-500">{sub}</p>}
      </div>
    </div>
  );
}

function RsiDrugCard({
  name,
  dose,
  route,
  onset,
  duration,
  note,
  badge,
  omit,
  omitSub,
  alt,
}: {
  name: string;
  dose: string;
  route: string;
  onset?: string;
  duration?: string;
  note?: string;
  badge?: React.ReactNode;
  omit?: string;
  omitSub?: string;
  alt?: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 overflow-hidden">
      <div className="px-3 pt-2.5 pb-2 flex items-start gap-2.5">
        <Pill className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-emerald-200">{name}</span>
            <CcpBadge />
            {badge}
          </div>
          <p className="text-base font-bold text-emerald-300 mt-0.5 leading-tight">{dose}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-900/40 border border-emerald-800/50 rounded px-1.5 py-0.5">
              {route}
            </span>
            {onset && (
              <span className="text-[0.65rem] text-slate-500">
                Onset <span className="text-slate-400 font-medium">{onset}</span>
              </span>
            )}
            {duration && (
              <span className="text-[0.65rem] text-slate-500">
                Duration <span className="text-slate-400 font-medium">{duration}</span>
              </span>
            )}
          </div>
          {note && <p className="mt-1.5 text-[0.68rem] text-slate-400 leading-relaxed">{note}</p>}
          {alt && <p className="mt-1 text-[0.68rem] text-violet-400">{alt}</p>}
        </div>
      </div>
      {omit && (
        <div className="border-t border-rose-600/20 bg-rose-600/5 px-3 py-2 flex items-start gap-2">
          <XCircle className="h-3 w-3 shrink-0 mt-[3px] text-rose-500" />
          <div>
            <p className="text-[0.65rem] font-semibold text-rose-300">OMIT if: {omit}</p>
            {omitSub && <p className="text-[0.62rem] text-rose-600 mt-0.5">{omitSub}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section content ──────────────────────────────────────────────────────────

function PrepareContent() {
  return (
    <>
      <SubLabel label="Pre-oxygenation" color="sky" />
      <ActionItem
        text="100% O₂ via BVM/NRB for minimum 3–5 minutes"
        sub="Target SpO₂ >95% before induction — apnoeic oxygenation via NC 15 L/min throughout"
      />
      <ActionItem
        text="Position: sniffing position (adults) or ramped position (obese/pregnant)"
        sub="Ear-to-sternal notch alignment — optimises laryngoscopic view"
      />

      <SubLabel label="Equipment check" color="sky" />
      <ActionItem text="3 ETT sizes (planned size ± 0.5 mm), 10 mL syringe, introducer/bougie" />
      <ActionItem text="Suction on and functional — Yankauer within reach" />
      <ActionItem text="BVM, SGA (backup), EtCO₂ inline — connected and ready" />
      <ActionItem text="Continuous SpO₂, EtCO₂, ECG, BP monitoring" />

      <SubLabel label="Access & drugs" color="sky" />
      <ActionItem text="IV/IO access confirmed and patent — draw up all drugs before induction" />
      <ActionItem
        text="Failed airway plan declared before induction begins"
        sub="Backup: LMA/iGel → 2nd attempt → surgical airway (scalpel-bougie-tube)"
      />

      <WarnItem
        text="No induction until SpO₂ >95% or situation absolutely time-critical"
        sub="If unable to pre-oxygenate adequately, consider Delayed Sequence Induction (DSI) — CPM 2.20"
      />
    </>
  );
}

function PretreatContent() {
  return (
    <>
      <CautionItem
        text="Pre-treatment is administered 3 minutes before induction to allow onset"
        sub="Blunts the sympathetic surge from laryngoscopy — hypertension, tachycardia, raised ICP"
      />

      <div className="mt-1" />
      <RsiDrugCard
        name="Fentanyl"
        dose="1–3 mcg/kg IV"
        route="IV slow push over 30–60 sec"
        note="Blunts laryngoscopy sympathetic response. Use 1 mcg/kg if haemodynamically borderline. Administer slowly to minimise chest wall rigidity."
        omit="haemodynamic compromise, opioid/BZD/alcohol toxidrome, suspected raised ICP without haemodynamic reserve"
        omitSub="If Fentanyl omitted, induction proceeds directly with Ketamine which partially compensates for the blunting effect."
      />

      <SubLabel label="Paediatric only" color="sky" />
      <RsiDrugCard
        name="Atropine"
        dose="0.02 mg/kg IV"
        route="IV"
        note="Minimum 0.1 mg · Maximum 0.5 mg per dose. Prevents vagally-mediated bradycardia from succinylcholine and laryngoscopy in children."
        badge={<PedsBadge />}
      />
      <CautionItem text="Atropine for paeds RSI — not routine in adults unless baseline bradycardia is present" />
    </>
  );
}

function InduceContent() {
  return (
    <>
      <RsiDrugCard
        name="Ketamine"
        dose="1.5–2 mg/kg IV"
        route="IV"
        onset="30–60 sec"
        note="First-line prehospital induction agent. Dissociative — maintains airway reflexes and haemodynamic stability. Bronchodilator effect is advantageous in bronchospasm."
        alt="Haemodynamically compromised: reduce to 1–1.5 mg/kg IV"
        omit="suspected raised intracranial pressure without haemodynamic instability (relative CI), known severe/uncontrolled hypertension"
        omitSub="If Ketamine contraindicated, use Midazolam. Note: Ketamine may actually be safe in isolated TBI — discuss with CCP/MO."
      />

      <SubLabel label="Alternative — if Ketamine contraindicated" color="violet" />
      <RsiDrugCard
        name="Midazolam"
        dose="0.1 mg/kg IV"
        route="IV slow push"
        onset="1–3 min"
        note="Reduce to 0.05 mg/kg in elderly, frail, or haemodynamically compromised patients. Use in combination with additional analgesia (Fentanyl from pre-treatment phase). Onset is slower than Ketamine."
        omit="haemodynamic instability, already sedated patients, respiratory depression"
      />

      <WarnItem
        text="Do NOT give paralytic before confirmed loss of consciousness"
        sub="Wait for jaw relaxation and loss of lash reflex before proceeding to paralytic"
      />
      <CautionItem
        text="Both agents are CCP scope — confirm drug authorisation before administration"
      />
    </>
  );
}

function ParalyseContent() {
  return (
    <>
      <RsiDrugCard
        name="Succinylcholine (Sux)"
        dose="1.5 mg/kg IV"
        route="IV"
        onset="30–60 sec"
        duration="8–12 min"
        note="First-line depolarising neuromuscular blocker. Shorter duration allows faster recovery if intubation fails. Give immediately after confirmed loss of consciousness."
        omit="hyperkalaemia (K⁺ >5.5 or suspected), rhabdomyolysis, burns/crush injury >48h, known neuromuscular disease (myopathies, paralysis >24h, MS, Guillain-Barré), personal/family hx of malignant hyperthermia"
        omitSub="If any contraindication present — use Rocuronium 1.2 mg/kg instead."
      />

      <SubLabel label="Alternative — if Sux contraindicated" color="rose" />
      <RsiDrugCard
        name="Rocuronium"
        dose="1.2 mg/kg IV"
        route="IV"
        onset="60–90 sec"
        duration="45–70 min"
        note="Non-depolarising agent. Onset slightly slower than Sux at RSI dose. Longer duration — plan for post-intubation paralysis maintenance. Reversible with Sugammadex 16 mg/kg IV if available."
        omit="known hypersensitivity to rocuronium or bromide compounds (rare)"
      />

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 mt-1">
        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-amber-500 mb-1.5">
          Succinylcholine Contraindications — Quick Reference
        </p>
        {[
          "Hyperkalaemia or risk of hyperkalaemia",
          "Burns or crush injury >48 hours old",
          "Rhabdomyolysis (traumatic or non-traumatic)",
          "Neuromuscular disease (myopathy, MS, GBS, paraplegia >24h)",
          "Personal or family history of malignant hyperthermia",
          "Known pseudocholinesterase deficiency",
        ].map((item, i) => (
          <p key={i} className="text-xs text-amber-200 flex gap-2 mb-0.5">
            <span className="text-amber-600 shrink-0">·</span>
            {item}
          </p>
        ))}
      </div>

      <WarnItem
        text="Paralysis without intubation is lethal — be prepared to intubate immediately"
        sub="Suction on · ETT in hand · Failed airway plan verbally declared before giving paralytic"
      />
    </>
  );
}

function ConfirmContent() {
  return (
    <>
      <ActionItem text="Direct laryngoscopy — blade introduced at right side of mouth, sweep tongue left" />
      <ActionItem
        text="Best laryngoscopic view: Grade I–II preferred — use bougie if Grade III/IV"
        sub="External laryngeal manipulation (ELM) if needed — ask assistant to apply"
      />
      <ActionItem text="ETT placed through cords under direct vision — advance to teeth mark" />

      <SubLabel label="ETT sizing" color="slate" />
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5">
        {[
          { label: "Adult male", value: "8.0–9.0 mm ID · Depth at lips 23 cm" },
          { label: "Adult female", value: "7.0–8.0 mm ID · Depth at lips 21 cm" },
          { label: "Paeds uncuffed", value: "(Age ÷ 4) + 4 mm · Depth (Age × 3) + 12 cm" },
          { label: "Paeds cuffed", value: "(Age ÷ 4) + 3.5 mm · Cuff ≤20 cmH₂O" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-2 mb-1">
            <span className="text-[0.62rem] text-slate-500 shrink-0 w-28">{label}</span>
            <span className="text-xs font-medium text-slate-300">{value}</span>
          </div>
        ))}
      </div>

      <SubLabel label="Confirmation — mandatory" color="slate" />
      <ActionItem
        text="Continuous EtCO₂ waveform — gold standard confirmation"
        sub="Minimum 6 waveform cycles with consistent ETCO₂ 35–45 mmHg"
      />
      <ActionItem text="Bilateral breath sounds — auscultate 5 points (apex ×2, base ×2, epigastrium)" />
      <ActionItem text="Chest rise symmetrical with each ventilation" />
      <ActionItem text="SpO₂ maintaining or improving" />
      <ActionItem text="Secure ETT: tie + tape · Record tube position at teeth" />

      <WarnItem
        text="Absent ETCO₂ waveform = oesophageal intubation until proven otherwise"
        sub="Remove tube immediately · Re-oxygenate · Re-attempt"
      />
      <CautionItem text="Unilateral breath sounds → right main bronchus intubation — withdraw 1–2 cm and reassess" />
    </>
  );
}

function MaintainContent() {
  return (
    <>
      <SubLabel label="Sedation (first-line)" color="emerald" />
      <RsiDrugCard
        name="Ketamine infusion"
        dose="1–2 mg/kg/h IV"
        route="IV infusion"
        note="First-line post-intubation sedation prehospitally. Haemodynamically stable. Use drug calculator for draw-up and rate. Titrate to RASS −2 to −3."
      />

      <SubLabel label="Analgesia" color="emerald" />
      <RsiDrugCard
        name="Fentanyl infusion"
        dose="1–5 mcg/kg/h IV"
        route="IV infusion"
        note="Run alongside Ketamine for analgesia. Titrate to pain response and haemodynamic state. Use drug calculator for draw-up and rate."
      />

      <SubLabel label="Supplement sedation — PRN boluses" color="slate" />
      <RsiDrugCard
        name="Midazolam"
        dose="0.05 mg/kg IV bolus"
        route="IV"
        note="If patient appears to be emerging from sedation between infusion adjustments. Maximum 0.1 mg/kg total bolus dose. Reduce in elderly and haemodynamically compromised."
      />

      <SubLabel label="Ongoing paralysis — if required" color="rose" />
      <RsiDrugCard
        name="Rocuronium"
        dose="0.6 mg/kg IV"
        route="IV"
        duration="20–35 min"
        note="Repeat dosing for ongoing paralysis. Use only if sedation adequately established — do not paralyse an inadequately sedated patient."
      />

      <SubLabel label="Post-intubation hypotension" color="rose" />
      <RsiDrugCard
        name="Noradrenaline"
        dose="0.01–0.3 mcg/kg/min IV"
        route="IV infusion"
        note="First-line vasopressor for post-intubation haemodynamic compromise. Titrate to SBP >90 mmHg / MAP ≥65 mmHg. Use drug calculator."
      />
      <RsiDrugCard
        name="Phenylephrine"
        dose="25–100 mcg IV bolus"
        route="IV"
        note="Alternative for isolated vasodilatory hypotension. Adults only. Use when tachycardia present and nor adrenaline unavailable."
      />

      <SubLabel label="Ventilation targets" color="emerald" />
      <div className="rounded-xl border border-emerald-700/30 bg-emerald-900/10 px-3 py-2.5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { label: "SpO₂", value: ">95%", color: "text-sky-300" },
            { label: "ETCO₂", value: "35–45 mmHg", color: "text-emerald-300" },
            { label: "SBP", value: ">90 mmHg", color: "text-rose-300" },
            { label: "MAP", value: "≥65 mmHg", color: "text-rose-300" },
            { label: "TV", value: "6–8 mL/kg IBW", color: "text-slate-300" },
            { label: "RR", value: "10–12 /min", color: "text-slate-300" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className="text-[0.6rem] text-slate-600 shrink-0">{label}</span>
              <span className={`text-xs font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <WarnItem
        text="Do NOT hyperventilate"
        sub="Avoid RR >12/min post-intubation unless treating metabolic acidosis with MO guidance"
      />
      <CautionItem text="Reassess RASS every 5–10 min — titrate infusions to maintain RASS −2 to −3" />
      <div className="flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2.5 mt-0.5">
        <Activity className="h-4 w-4 text-sky-400 shrink-0" />
        <p className="text-xs font-medium text-sky-300">
          Use Drug Infusion Calculator for draw-up and flow rates
        </p>
      </div>
    </>
  );
}

const SECTION_CONTENT: Record<SectionId, React.ReactNode> = {
  prepare: <PrepareContent />,
  pretreat: <PretreatContent />,
  induce: <InduceContent />,
  paralyse: <ParalyseContent />,
  confirm: <ConfirmContent />,
  maintain: <MaintainContent />,
};

// ─── Phase Flow Diagram ───────────────────────────────────────────────────────

function PhaseFlowDiagram({ activeId }: { activeId: SectionId | null }) {
  const activePhase = SECTION_META.find((s) => s.id === activeId)?.phaseNum ?? 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <p className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-500">
          RSI Sequence
        </p>
      </div>
      {/* Scrollable phase strip */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex items-center gap-0 min-w-max">
          {PHASES.map((phase, idx) => {
            const c = PHASE_COLORS[phase.color];
            const isActive = phase.num === activePhase;
            return (
              <div key={phase.num} className="flex items-center">
                {/* Phase node */}
                <div
                  className={`relative flex flex-col items-center rounded-xl border px-2.5 py-2 min-w-[72px] transition-all ${
                    isActive
                      ? `${c.ring} ${c.bg}`
                      : "border-slate-800/60 bg-slate-900/40"
                  }`}
                >
                  {/* Number + label row */}
                  <div className="flex items-center gap-1 mb-1">
                    <span
                      className={`text-[0.58rem] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                        isActive ? c.numBg : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {phase.num}
                    </span>
                    <p
                      className={`text-[0.58rem] font-bold uppercase tracking-wide leading-none ${
                        isActive ? c.text : "text-slate-500"
                      }`}
                    >
                      {phase.label}
                    </p>
                  </div>
                  {/* Drug hint */}
                  <p
                    className={`text-[0.58rem] leading-tight text-center ${
                      isActive ? c.text : "text-slate-600"
                    }`}
                  >
                    {phase.drug}
                  </p>
                  {/* Timing */}
                  <p
                    className={`text-[0.55rem] mt-1 font-medium ${
                      isActive ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    {phase.timing}
                  </p>
                </div>
                {/* Connector arrow */}
                {idx < PHASES.length - 1 && (
                  <div className="flex items-center shrink-0 mx-0.5">
                    <ChevronRight className="w-3 h-3 text-slate-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Accordion row ────────────────────────────────────────────────────────────

function AccordionRow({
  meta,
  isActive,
  isLast,
  nextTitle,
  onToggle,
  onNext,
}: {
  meta: SectionMeta;
  isActive: boolean;
  isLast: boolean;
  nextTitle: string;
  onToggle: () => void;
  onNext: () => void;
}) {
  const s = COLOR_STYLES[meta.color];
  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-colors ${
        isActive ? s.activeBorder : "border-slate-800"
      } bg-slate-900/70`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
          isActive ? s.headerBg : "bg-slate-900/60 hover:bg-slate-800/50"
        }`}
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border text-xs font-bold transition-colors ${
            isActive
              ? `border ${s.stepActive}`
              : "bg-slate-800 border-slate-700 text-slate-500"
          }`}
        >
          {meta.phaseNum}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p
            className={`text-[0.65rem] font-bold uppercase tracking-[0.2em] leading-none ${
              isActive ? s.accent : "text-slate-500"
            }`}
          >
            {meta.title}
          </p>
          <p
            className={`text-[0.68rem] mt-1 leading-none ${
              isActive ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {meta.subtitle}
          </p>
        </div>
        {isActive ? (
          <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-600 shrink-0" />
        )}
      </button>

      {isActive && (
        <>
          <div className="border-t border-slate-800/80 flex flex-col gap-1.5 p-3">
            {SECTION_CONTENT[meta.id]}
          </div>
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={onNext}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                isLast
                  ? "bg-emerald-700/30 hover:bg-emerald-700/50 border border-emerald-700/40 text-emerald-300"
                  : "bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-200"
              }`}
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Sequence complete
                </>
              ) : (
                <>
                  Next: {nextTitle}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RsiMedsPage() {
  const [activeId, setActiveId] = useState<SectionId | null>("prepare");

  function toggleSection(id: SectionId) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  function advance(currentId: SectionId) {
    const idx = SECTION_IDS.indexOf(currentId);
    setActiveId(idx < SECTION_IDS.length - 1 ? SECTION_IDS[idx + 1] : null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-10">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/respiratory-airway"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-violet-400">
              CPG 11.1 · v2.5 2026 · CCP
            </p>
            <h1 className="text-sm font-semibold leading-tight text-slate-50">
              RSI Medications — Pre &amp; Post Dosing
            </h1>
          </div>
          <div className="shrink-0">
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-2">
        {/* ── Phase flow diagram ── */}
        <PhaseFlowDiagram activeId={activeId} />

        {/* ── Quick targets bar ── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <p className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-500">
              Pre-induction targets
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              { label: "SpO₂ pre-induction", value: ">95%", color: "text-sky-300" },
              { label: "Fentanyl lead time", value: "T−3 min", color: "text-amber-300" },
              { label: "Sux dose", value: "1.5 mg/kg", color: "text-rose-300" },
              { label: "Rocuronium (RSI)", value: "1.2 mg/kg", color: "text-rose-300" },
              { label: "Ketamine induction", value: "1.5–2 mg/kg", color: "text-violet-300" },
              { label: "Post-intubation ETCO₂", value: "35–45 mmHg", color: "text-emerald-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-baseline gap-1">
                <span className="text-[0.6rem] text-slate-600">{label}</span>
                <span className={`text-xs font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Accordion sections ── */}
        {SECTION_META.map((meta, idx) => (
          <AccordionRow
            key={meta.id}
            meta={meta}
            isActive={activeId === meta.id}
            isLast={idx === SECTION_IDS.length - 1}
            nextTitle={SECTION_META[idx + 1]?.title ?? ""}
            onToggle={() => toggleSection(meta.id)}
            onNext={() => advance(meta.id)}
          />
        ))}

        <p className="text-[0.65rem] text-slate-600 pb-2 pt-1">
          CPG 11.1 · HMCAS v2.5 2026 · CCP scope. Quick reference only — integrate
          with patient presentation, authorised drugs list, and Clinical Coordination advice.
        </p>
      </main>
    </div>
  );
}
