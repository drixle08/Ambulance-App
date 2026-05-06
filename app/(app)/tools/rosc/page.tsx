"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Wind,
  HeartPulse,
  Brain,
  Ambulance,
  AlertTriangle,
  Info,
  Pill,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  Thermometer,
  Droplets,
  Zap,
  Activity,
} from "lucide-react";

// ─── Summary ──────────────────────────────────────────────────────────────────

const summaryText =
  "Post-ROSC care — CPG 2.6 HMCAS v2.5 2026. " +
  "DO NOT move patient rapidly for ≥10 min post-ROSC (re-arrest risk). " +
  "Airway: SpO2 >94%, advanced airway, HME/filter, EtCO2 waveform, do NOT hyperventilate — elevated EtCO2 expected, do not correct prehospitally. " +
  "Adults: SBP >90 mmHg, MAP ≥65 mmHg (isolated TBI: MAP 70–80). Fluids 250 mL boluses max 1–2L (max 1L major haemorrhage). BGL: correct if <4.0 mmol/L → 50 mL D10W; avoid >6.7 mmol/L. " +
  "Paeds: SpO2 >94%, SBP ≥(age×2)+70, fluids 10–20 mL/kg bolus repeat once PRN. BGL <4.0 → 2.5 mL/kg D10W (max 50 mL). " +
  "12-lead ECG all ROSC patients. STEMI → Heart Hospital PCI. " +
  "CCP: Noradrenaline 0.01–0.3 mcg/kg/min; Phenylephrine 25–100 mcg bolus / 100 mcg/min infusion; Adrenaline infusion 0.05–0.3 mcg/kg/min if refractory. " +
  "Transport: STEMI → PCI centre (Priority 1), trauma → trauma centre, paeds → paediatric centre. ECMO consideration: witnessed arrest ≤45 min (CPG 2.9). " +
  "Avoid hypotension, hypoxia, extreme CO2, hypo/hyperthermia.";

// ─── Checklist config ─────────────────────────────────────────────────────────

const SECTION_IDS = [
  "immediate",
  "airway",
  "circulation",
  "glucose",
  "neuro",
  "temperature",
  "transport",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

type SectionMeta = {
  id: SectionId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: SectionColor;
};

type SectionColor = "rose" | "sky" | "amber" | "violet" | "emerald";

const SECTION_META: SectionMeta[] = [
  {
    id: "immediate",
    title: "Immediate — Confirm ROSC",
    subtitle: "Stabilise · Prenotify · First 10 min",
    icon: <Activity className="w-4 h-4" />,
    color: "rose",
  },
  {
    id: "airway",
    title: "Airway & Ventilation",
    subtitle: "SpO₂ >94% · Avoid hyperventilation · EtCO₂",
    icon: <Wind className="w-4 h-4" />,
    color: "sky",
  },
  {
    id: "circulation",
    title: "Circulation & Fluids",
    subtitle: "BP targets · 12-lead ECG · Vasopressors",
    icon: <HeartPulse className="w-4 h-4" />,
    color: "rose",
  },
  {
    id: "glucose",
    title: "Blood Glucose",
    subtitle: "Correct <4.0 · Avoid >6.7 mmol/L",
    icon: <Droplets className="w-4 h-4" />,
    color: "amber",
  },
  {
    id: "neuro",
    title: "Neuro & Brain Protection",
    subtitle: "Avoid secondary injury · Agitation · Seizures",
    icon: <Brain className="w-4 h-4" />,
    color: "violet",
  },
  {
    id: "temperature",
    title: "Temperature",
    subtitle: "Normothermia · Avoid hypo/hyperthermia",
    icon: <Thermometer className="w-4 h-4" />,
    color: "amber",
  },
  {
    id: "transport",
    title: "Transport & Destination",
    subtitle: "Right patient · Right hospital · Handover",
    icon: <Ambulance className="w-4 h-4" />,
    color: "emerald",
  },
];

const COLOR_STYLES: Record<
  SectionColor,
  {
    border: string;
    activeBorder: string;
    headerBg: string;
    iconBg: string;
    accent: string;
    stepActive: string;
  }
> = {
  rose: {
    border: "border-slate-800",
    activeBorder: "border-rose-800/50",
    headerBg: "bg-rose-950/30",
    iconBg: "bg-rose-900/60 text-rose-400",
    accent: "text-rose-400",
    stepActive: "bg-rose-900/60 text-rose-300 border-rose-700/50",
  },
  sky: {
    border: "border-slate-800",
    activeBorder: "border-sky-800/50",
    headerBg: "bg-sky-950/30",
    iconBg: "bg-sky-900/60 text-sky-400",
    accent: "text-sky-400",
    stepActive: "bg-sky-900/60 text-sky-300 border-sky-700/50",
  },
  amber: {
    border: "border-slate-800",
    activeBorder: "border-amber-800/50",
    headerBg: "bg-amber-950/30",
    iconBg: "bg-amber-900/60 text-amber-400",
    accent: "text-amber-400",
    stepActive: "bg-amber-900/60 text-amber-300 border-amber-700/50",
  },
  violet: {
    border: "border-slate-800",
    activeBorder: "border-violet-800/50",
    headerBg: "bg-violet-950/30",
    iconBg: "bg-violet-900/60 text-violet-400",
    accent: "text-violet-400",
    stepActive: "bg-violet-900/60 text-violet-300 border-violet-700/50",
  },
  emerald: {
    border: "border-slate-800",
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

function DrugItem({
  name,
  dose,
  sub,
}: {
  name: string;
  dose: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
      <Pill className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-emerald-200">{name}</span>
          <CcpBadge />
        </div>
        <p className="text-xs font-semibold text-emerald-300">{dose}</p>
        {sub && (
          <p className="mt-0.5 text-[0.65rem] text-emerald-600/80">{sub}</p>
        )}
      </div>
    </div>
  );
}

function CcpItem({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2 px-1 py-0.5">
      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/50" />
      <div className="flex items-start gap-1.5 flex-wrap">
        <CcpBadge />
        <div className="min-w-0">
          <p className="text-xs text-slate-300 leading-5">{text}</p>
          {sub && (
            <p className="text-[0.65rem] text-slate-500 mt-0.5">{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SubLabel({
  label,
  color = "slate",
}: {
  label: string;
  color?: string;
}) {
  const map: Record<string, string> = {
    slate: "text-slate-500",
    rose: "text-rose-600",
    amber: "text-amber-600",
    sky: "text-sky-600",
    emerald: "text-emerald-600",
    violet: "text-violet-600",
  };
  return (
    <p
      className={`text-[0.6rem] font-bold uppercase tracking-[0.2em] ${map[color] ?? "text-slate-500"} px-1 pt-2 pb-0.5`}
    >
      {label}
    </p>
  );
}

// ─── Section content ──────────────────────────────────────────────────────────

function ImmediateContent() {
  return (
    <>
      <WarnItem
        text="Do NOT move patient rapidly for ≥10 min post-ROSC"
        sub="Rapid movement may result in re-arrest — stabilise before loading or transport"
      />
      <ActionItem
        text="Confirm sustained ROSC"
        sub="Organised rhythm + palpable pulse + rising or sustained BP + stable EtCO₂"
      />
      <ActionItem text="Stop CPR — reassess ABC, correct reversible causes" />
      <ActionItem
        text="Hospital prenotification immediately"
        sub="Rhythm · Downtime · ROSC time · Suspected cause · Destination"
      />
    </>
  );
}

function AirwayContent() {
  return (
    <>
      <ActionItem text="Insert or maintain advanced airway if oxygenation or ventilation suboptimal" />
      <ActionItem text="Attach HME/filter — EtCO₂ waveform capnography mandatory" />
      <ActionItem
        text="Target SpO₂ >94% — titrate oxygen delivery to maintain"
        sub="Avoid prolonged hypoxia and unnecessary hyperoxia"
      />
      <WarnItem
        text="Do NOT hyperventilate"
        sub="Adequate tidal volumes for ideal body weight · Allow full exhalation · Appropriate rate"
      />
      <CautionItem text="Elevated EtCO₂ is expected after ROSC — do NOT attempt to normalise prehospitally · Correct over time in-hospital" />
      <CcpItem text="Replace SGA with ETT if not done during arrest (age-dependent)" />
      <CcpItem text="Gastric tube via SGA, or OGT if ETT in situ — prevent aspiration" />
    </>
  );
}

function CirculationContent() {
  return (
    <>
      <ActionItem text="Obtain 12-lead ECG on all ROSC patients following medical cardiac arrest" />
      <ActionItem text="Monitor BP and MAP every 5 minutes" />

      <SubLabel label="Adult" color="rose" />
      <ActionItem
        text="Maintain SBP >90 mmHg and MAP ≥65 mmHg"
        sub="Isolated TBI: MAP 70–80 mmHg · Avoid large BP spikes in trauma"
      />
      <ActionItem
        text="Fluids: 250 mL IV boluses — maximum 1–2 L depending on cause"
        sub="Major haemorrhage: limit to maximum 1 L total"
      />

      <SubLabel label="Paediatric" color="rose" />
      <ActionItem text="Maintain SBP ≥ (age × 2) + 70 mmHg" />
      <ActionItem text="Fluids: 10–20 mL/kg bolus — may repeat once if required" />

      <SubLabel label="Vasopressors — if hypotension persists" />
      <DrugItem
        name="Noradrenaline"
        dose="0.01–0.3 mcg/kg/min IV infusion"
        sub="Titrate to desired MAP — first-line vasopressor"
      />
      <DrugItem
        name="Phenylephrine"
        dose="25–100 mcg IV bolus; infusion 100 mcg/min"
        sub="Titrate to desired effect — adults only"
      />
      <DrugItem
        name="Adrenaline infusion"
        dose="0.05–0.3 mcg/kg/min IV"
        sub="If unresponsive to Noradrenaline / Phenylephrine · Paeds: for vasopressor support"
      />

      <div className="flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/5 px-3 py-2.5 mt-1">
        <Zap className="h-4 w-4 text-rose-400 shrink-0" />
        <p className="text-sm font-semibold text-rose-300">
          STEMI on ECG → Heart Hospital (PCI) — Priority 1
        </p>
      </div>
    </>
  );
}

function GlucoseContent() {
  return (
    <>
      <ActionItem text="Monitor BGL regularly throughout post-arrest care" />

      <SubLabel label="Adult" color="amber" />
      <ActionItem
        text="Correct if BGL < 4.0 mmol/L → 50 mL Dextrose 10% IV"
        sub="Reassess after 10 min — repeat if still hypoglycaemic"
      />
      <CautionItem text="Avoid raising BGL above 6.7 mmol/L — hyperglycaemia worsens neurological outcome" />

      <SubLabel label="Paediatric" color="amber" />
      <ActionItem
        text="Correct if BGL < 4.0 mmol/L → 2.5 mL/kg Dextrose 10% IV/IO (max 50 mL)"
        sub="Reassess after 10 min — repeat if required to normalise BGL"
      />
    </>
  );
}

function NeuroContent() {
  return (
    <>
      <ActionItem text="Avoid hypotension, hypoxia, and extremes of CO₂ — all worsen neurological outcome" />
      <ActionItem
        text="Isolated TBI: target MAP 70–80 mmHg to maintain cerebral perfusion"
      />
      <ActionItem
        text="Manage agitation, pain, and seizures using relevant CPGs"
        sub="Analgesia · Sedation · Seizure management — per relevant protocols"
      />
      <ActionItem text="Maintain cervical spine precautions where trauma is suspected" />
      <CcpItem text="Sedation, analgesia, and paralysis as required — ROSC patients considered unstable for RSI" />
    </>
  );
}

function TemperatureContent() {
  return (
    <>
      <ActionItem text="Monitor temperature throughout post-arrest management" />
      <ActionItem text="Aim for normothermia during transport and handover" />
      <WarnItem
        text="Avoid hyperthermia and hypothermia"
        sub="Both worsen neurological outcome — active management required if temperature abnormal"
      />
    </>
  );
}

function TransportContent() {
  return (
    <>
      <div className="space-y-1.5">
        {(
          [
            {
              label: "STEMI with ROSC",
              dest: "Heart Hospital — PCI centre",
              note: "Priority 1 · Witnessed arrest + pre-arrest STEMI ECG",
              color: "rose",
            },
            {
              label: "Major Trauma",
              dest: "Trauma centre",
              note: "Sustained ROSC following traumatic cardiac arrest",
              color: "amber",
            },
            {
              label: "Paediatric",
              dest: "Paediatric centre",
              note: "All paediatric ROSC patients",
              color: "sky",
            },
            {
              label: "ECMO / ECPR",
              dest: "ECMO-capable centre — CPG 2.9",
              note: "Witnessed arrest · Time from onset ≤45 min · Check inclusion criteria",
              color: "violet",
            },
          ] as const
        ).map(({ label, dest, note, color }) => {
          const map = {
            rose: {
              wrap: "border-rose-500/25 bg-rose-500/5",
              lbl: "text-rose-500",
              val: "text-rose-200",
            },
            amber: {
              wrap: "border-amber-500/25 bg-amber-500/5",
              lbl: "text-amber-500",
              val: "text-amber-200",
            },
            sky: {
              wrap: "border-sky-500/25 bg-sky-500/5",
              lbl: "text-sky-500",
              val: "text-sky-200",
            },
            violet: {
              wrap: "border-violet-500/25 bg-violet-500/5",
              lbl: "text-violet-500",
              val: "text-violet-200",
            },
          } as const;
          const c = map[color];
          return (
            <div key={label} className={`rounded-xl border ${c.wrap} px-3 py-2.5`}>
              <p className={`text-[0.62rem] font-bold uppercase tracking-wider ${c.lbl}`}>
                {label}
              </p>
              <p className={`text-sm font-semibold ${c.val} mt-0.5`}>{dest}</p>
              <p className="text-[0.65rem] text-slate-500 mt-0.5">{note}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-3 py-2.5 mt-1">
        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Structured Handover
        </p>
        {[
          "Pre-arrest status and relevant history",
          "Arrest rhythm (VF/VT or Asystole/PEA)",
          "Estimated downtime — collapse to first CPR",
          "Total resuscitation time and time of ROSC",
          "Interventions: airway, drugs, defib count",
        ].map((item, i) => (
          <p key={i} className="text-xs text-slate-300 flex gap-2 mb-0.5">
            <span className="text-slate-600 shrink-0">·</span>
            {item}
          </p>
        ))}
      </div>
    </>
  );
}

const SECTION_CONTENT: Record<SectionId, React.ReactNode> = {
  immediate: <ImmediateContent />,
  airway: <AirwayContent />,
  circulation: <CirculationContent />,
  glucose: <GlucoseContent />,
  neuro: <NeuroContent />,
  temperature: <TemperatureContent />,
  transport: <TransportContent />,
};

// ─── Checklist Section Row ────────────────────────────────────────────────────

function ChecklistRow({
  meta,
  stepNum,
  isActive,
  isDone,
  isLast,
  nextTitle,
  onToggle,
  onNext,
}: {
  meta: SectionMeta;
  stepNum: number;
  isActive: boolean;
  isDone: boolean;
  isLast: boolean;
  nextTitle: string;
  onToggle: () => void;
  onNext: () => void;
}) {
  const s = COLOR_STYLES[meta.color];

  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-colors ${
        isActive
          ? s.activeBorder
          : isDone
          ? "border-emerald-900/40"
          : "border-slate-800"
      } bg-slate-900/70`}
    >
      {/* ── Row header (always visible) ── */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
          isActive
            ? s.headerBg
            : isDone
            ? "bg-emerald-950/15 hover:bg-emerald-950/25"
            : "bg-slate-900/60 hover:bg-slate-800/50"
        }`}
      >
        {/* Step indicator */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border text-xs font-bold transition-colors ${
            isDone
              ? "bg-emerald-900/50 border-emerald-700/50 text-emerald-400"
              : isActive
              ? `border ${s.stepActive}`
              : "bg-slate-800 border-slate-700 text-slate-500"
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            stepNum
          )}
        </div>

        {/* Text */}
        <div className="flex-1 text-left min-w-0">
          <p
            className={`text-[0.65rem] font-bold uppercase tracking-[0.2em] leading-none ${
              isDone
                ? "text-emerald-500/70"
                : isActive
                ? s.accent
                : "text-slate-500"
            }`}
          >
            {meta.title}
          </p>
          <p
            className={`text-[0.68rem] mt-1 leading-none ${
              isDone
                ? "text-emerald-700/70"
                : isActive
                ? "text-slate-400"
                : "text-slate-600"
            }`}
          >
            {meta.subtitle}
          </p>
        </div>

        {/* Right indicator */}
        {isDone && !isActive ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        ) : isActive ? (
          <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-600 shrink-0" />
        )}
      </button>

      {/* ── Expanded content ── */}
      {isActive && (
        <>
          <div className="border-t border-slate-800/80 flex flex-col gap-1.5 p-3">
            {SECTION_CONTENT[meta.id]}
          </div>

          {/* Next / Done button */}
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
                  Mark complete
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

export default function RoscPage() {
  const [activeId, setActiveId] = useState<SectionId | null>("immediate");
  const [done, setDone] = useState<Set<SectionId>>(new Set());

  function toggleSection(id: SectionId) {
    if (activeId === id) {
      // Close current — mark as done
      setDone((prev) => new Set([...prev, id]));
      setActiveId(null);
    } else {
      // Mark previously open section as done, open new one
      if (activeId) {
        setDone((prev) => new Set([...prev, activeId]));
      }
      setActiveId(id);
    }
  }

  function advance(currentId: SectionId) {
    setDone((prev) => new Set([...prev, currentId]));
    const idx = SECTION_IDS.indexOf(currentId);
    setActiveId(idx < SECTION_IDS.length - 1 ? SECTION_IDS[idx + 1] : null);
  }

  function reset() {
    setDone(new Set());
    setActiveId("immediate");
  }

  const doneCount = done.size;
  const totalCount = SECTION_IDS.length;
  const allDone = doneCount === totalCount && activeId === null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-10">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/resuscitation"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>

          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-emerald-400">
              CPG 2.6 · v2.5 2026
            </p>
            <h1 className="text-sm font-semibold leading-tight text-slate-50">
              Post-Cardiac Arrest (ROSC) Care
            </h1>
            {/* Progress bar */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${(doneCount / totalCount) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[0.6rem] text-slate-500 shrink-0 tabular-nums">
                {doneCount}/{totalCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Reset checklist"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </button>
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-2">
        {/* ── Quick target reference — always visible ── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-500">
              Quick Targets
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              { label: "SpO₂", value: ">94%", color: "text-sky-300" },
              { label: "SBP (adult)", value: ">90 mmHg", color: "text-rose-300" },
              { label: "MAP (adult)", value: "≥65 mmHg", color: "text-rose-300" },
              { label: "TBI MAP", value: "70–80 mmHg", color: "text-amber-300" },
              { label: "BGL", value: "4.0–6.7 mmol/L", color: "text-emerald-300" },
              { label: "Paeds SBP", value: "(age×2)+70", color: "text-rose-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-baseline gap-1">
                <span className="text-[0.6rem] text-slate-600">{label}</span>
                <span className={`text-xs font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Checklist sections ── */}
        {SECTION_META.map((meta, idx) => (
          <ChecklistRow
            key={meta.id}
            meta={meta}
            stepNum={idx + 1}
            isActive={activeId === meta.id}
            isDone={done.has(meta.id)}
            isLast={idx === SECTION_IDS.length - 1}
            nextTitle={SECTION_META[idx + 1]?.title ?? ""}
            onToggle={() => toggleSection(meta.id)}
            onNext={() => advance(meta.id)}
          />
        ))}

        {/* ── All done state ── */}
        {allDone && (
          <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 px-4 py-4 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                All sections reviewed
              </p>
              <p className="text-[0.68rem] text-emerald-600 mt-0.5">
                Continue monitoring — reassess each section as the patient&apos;s condition changes
              </p>
            </div>
          </div>
        )}

        <p className="text-[0.65rem] text-slate-600 pb-2 pt-1">
          CPG 2.6 · HMCAS v2.5 2026. Quick reference only — integrate with
          underlying cause and relevant CPGs. Follow Clinical Coordination advice.
        </p>
      </main>
    </div>
  );
}
