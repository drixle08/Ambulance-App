"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Zap,
  XCircle,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Pill,
  AlertTriangle,
  Calculator,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Rhythm = "shockable" | "nonShockable" | null;
type Tab = "algorithm" | "reference";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HS = [
  "Hypoxia",
  "Hypovolaemia",
  "Hydrogen ions (acidosis)",
  "Hypoglycaemia",
  "Hypo / hyperkalaemia",
  "Hypothermia",
];

const TS = [
  "Tension pneumothorax",
  "Tamponade — cardiac",
  "Toxins",
  "Thrombosis — coronary",
  "Thrombosis — pulmonary",
];

const summaryText =
  "Paediatric medical cardiac arrest — CPG 2.3 (HMCAS v2.5 2026). Confirmed arrest, commenced CPR (100–120/min, >1/3 AP chest diameter), 5 BVM rescue breaths, attached pads. For VF/VT: single shocks at 4 J/kg with 2-min CPR cycles; SGA with HME/filter, continuous compressions, EtCO₂, ventilate every 3–5 sec; IV/IO; adrenaline 0.01 mg/kg (0.1 mL/kg 1:10,000) from cycle 3 then every 4 min; amiodarone 5 mg/kg for refractory VF/VT; CCP may escalate joules in 2 J increments after 3 shocks to max 10 J/kg or adult dose; vector change A-P after 3 shocks. For asystole/PEA: CPR, SGA, IV/IO, adrenaline 0.01 mg/kg ASAP then every 4 min, H's & T's review. Do NOT terminate paediatric resuscitation in the field — transport with CPR in progress per CPG 2.7. ROSC → CPG 2.6.";

// ─── Primitives (same language as adult arrest pages) ─────────────────────────

function CcpBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider border border-violet-500/40 bg-violet-500/10 text-violet-300">
      CCP
    </span>
  );
}

function ActionItem({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2.5 px-1 py-1">
      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
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

function DrugItem({
  name,
  dose,
  sub,
  ccp,
}: {
  name: string;
  dose: string;
  sub?: string;
  ccp?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5">
      <Pill className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-emerald-200">{name}</span>
          {ccp && <CcpBadge />}
        </div>
        <p className="text-sm font-semibold text-emerald-300">{dose}</p>
        {sub && <p className="mt-0.5 text-[0.68rem] text-emerald-500">{sub}</p>}
      </div>
    </div>
  );
}

function PedsShockItem({ cycleNum }: { cycleNum: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
        <Zap className="h-5 w-5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tabular-nums text-amber-300">4 J/kg</span>
          <span className="text-xs text-amber-500 font-medium">weight-based</span>
        </div>
        <p className="mt-0.5 text-[0.65rem] text-amber-500/80">
          Shock {cycleNum} — use WAAFELSS calculator for exact joules
        </p>
      </div>
    </div>
  );
}

function NoShockItem() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30">
        <XCircle className="h-5 w-5 text-sky-400" />
      </div>
      <div>
        <p className="text-base font-bold text-sky-300">No shock</p>
        <p className="text-[0.65rem] text-sky-600">CPR only</p>
      </div>
    </div>
  );
}

function CcpNoteItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 px-1 py-0.5">
      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/50" />
      <div className="flex items-start gap-1.5 flex-wrap">
        <CcpBadge />
        <p className="text-xs text-slate-300 leading-5">{text}</p>
      </div>
    </div>
  );
}

function CcpBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 flex flex-col gap-1 rounded-xl border border-violet-500/20 bg-violet-500/5 p-2.5">
      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-violet-500 px-1 mb-0.5">
        CCP scope
      </p>
      {children}
    </div>
  );
}

function CycleCard({
  label,
  sub,
  labelColor,
  borderColor,
  children,
}: {
  label: string;
  sub?: string;
  labelColor: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border ${borderColor} bg-slate-900/70 overflow-hidden`}>
      <div className="border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <p className={`text-[0.65rem] font-bold uppercase tracking-[0.22em] ${labelColor}`}>
          {label}
        </p>
        {sub && <span className="text-[0.6rem] text-slate-600">{sub}</span>}
      </div>
      <div className="flex flex-col gap-1.5 p-3">{children}</div>
    </div>
  );
}

// ─── Pathway: Shockable ───────────────────────────────────────────────────────

function ShockablePathway() {
  return (
    <div className="flex flex-col gap-3">
      <CycleCard
        label="Cycle 1"
        sub="0 – 2 min"
        labelColor="text-amber-400"
        borderColor="border-amber-500/25"
      >
        <PedsShockItem cycleNum={1} />
        <ActionItem text="Immediately resume CPR — 2 minutes" />
        <ActionItem
          text="Insert SGA → switch to continuous compressions"
          sub="HME/filter · Ventilate every 3–5 sec · EtCO₂ waveform capnography"
        />
        <ActionItem text="Assess rhythm at end of 2-min cycle" />
      </CycleCard>

      <CycleCard
        label="Cycle 2"
        sub="~2 – 4 min"
        labelColor="text-amber-400"
        borderColor="border-amber-500/25"
      >
        <PedsShockItem cycleNum={2} />
        <ActionItem text="Resume CPR — 2 minutes" />
        <ActionItem text="Establish IV / IO access" />
        <ActionItem text="Begin systematic H's & T's review" />
      </CycleCard>

      <CycleCard
        label="Cycle 3"
        sub="~4 – 6 min"
        labelColor="text-amber-400"
        borderColor="border-amber-500/25"
      >
        <PedsShockItem cycleNum={3} />
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 flex flex-col gap-1">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-500/80 px-1">
            Vector change after 3 shocks
          </p>
          <ActionItem
            text="Change to anterior-posterior pad placement if rhythm remains shockable"
            sub="Pad 1: left posterior, left of spine, below scapula · Pad 2: left anterior, midline to left nipple"
          />
        </div>
        <ActionItem text="Resume CPR — 2 minutes" />
        <DrugItem
          name="Adrenaline"
          dose="0.01 mg/kg IV/IO"
          sub="= 0.1 mL/kg of 1:10,000 — then every 4 min"
        />
        <DrugItem
          name="Amiodarone"
          dose="5 mg/kg IV/IO"
          sub="Refractory VF/VT only — see calculator for exact mg"
        />
      </CycleCard>

      <CycleCard
        label="Ongoing — cycle 4+"
        sub="6 min+"
        labelColor="text-amber-400/70"
        borderColor="border-amber-500/15"
      >
        <PedsShockItem cycleNum={4} />
        <ActionItem text="Continue 2-min CPR cycles" />
        <DrugItem name="Adrenaline" dose="0.01 mg/kg IV/IO every 4 min" />
        <DrugItem
          name="Amiodarone"
          dose="5 mg/kg IV/IO"
          sub="Repeat dose for continued refractory VF/VT"
        />
        <ActionItem text="Reassess rhythm + reversible causes each cycle" />
        <CcpBox>
          <CcpNoteItem text="Joule escalation: after 3 shocks, increase in 2 J increments per kg each cycle — max 10 J/kg or adult dose" />
          <CcpNoteItem text="Must consider ETI after ~10 min of resuscitation (if suitable ETT size available)" />
          <CcpNoteItem text="Gastric tube via SGA, or OGT if ETT in situ — prevent aspiration" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO" />
        </CcpBox>
      </CycleCard>
    </div>
  );
}

// ─── Pathway: Non-shockable ───────────────────────────────────────────────────

function NonShockablePathway() {
  return (
    <div className="flex flex-col gap-3">
      <CycleCard
        label="Early — first 2 min"
        labelColor="text-sky-400"
        borderColor="border-sky-500/25"
      >
        <NoShockItem />
        <ActionItem text="2-min CPR cycles — minimise all interruptions" />
        <ActionItem
          text="Insert SGA → switch to continuous compressions"
          sub="HME/filter · Ventilate every 3–5 sec · EtCO₂ waveform capnography"
        />
        <ActionItem text="Establish IV / IO access" />
        <DrugItem
          name="Adrenaline"
          dose="0.01 mg/kg IV/IO — ASAP"
          sub="= 0.1 mL/kg of 1:10,000 — as soon as IV/IO established"
        />
      </CycleCard>

      <CycleCard
        label="~2 – 6 min"
        labelColor="text-sky-400"
        borderColor="border-sky-500/20"
      >
        <NoShockItem />
        <ActionItem text="Continue 2-min CPR cycles" />
        <ActionItem text="Systematic H's & T's review — treat reversible causes" />
        <ActionItem text="Reassess rhythm each cycle — may convert to shockable" />
      </CycleCard>

      <CycleCard
        label="Ongoing — 6 min+"
        labelColor="text-sky-400/70"
        borderColor="border-sky-500/15"
      >
        <NoShockItem />
        <ActionItem text="Continue 2-min CPR cycles" />
        <DrugItem name="Adrenaline" dose="0.01 mg/kg IV/IO every 4 min" />
        <ActionItem text="Reassess rhythm + reversible causes each cycle" />
        <WarnItem text="Rhythm converts to VF/VT → switch to shockable pathway immediately" />
        <CcpBox>
          <CcpNoteItem text="Must consider ETI after ~10 min of resuscitation (if suitable ETT size available)" />
          <CcpNoteItem text="Gastric tube via SGA, or OGT if ETT in situ — prevent aspiration" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO" />
        </CcpBox>
      </CycleCard>
    </div>
  );
}

// ─── Reference tab ────────────────────────────────────────────────────────────

function Accordion({
  title,
  sub,
  defaultOpen,
  children,
}: {
  title: string;
  sub: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="text-left">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">
            {title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        )}
      </button>
      {open && <div className="border-t border-slate-800">{children}</div>}
    </div>
  );
}

function ReferenceTab() {
  return (
    <div className="flex flex-col gap-2">
      <Accordion title="Reversible causes" sub="6 H's · 5 T's" defaultOpen>
        <div className="grid grid-cols-2 divide-x divide-slate-800">
          <div className="p-3 space-y-1.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">H's</p>
            {HS.map((h, i) => (
              <p key={i} className="text-xs text-slate-300 flex gap-2">
                <span className="text-slate-600 shrink-0">·</span>{h}
              </p>
            ))}
          </div>
          <div className="p-3 space-y-1.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">T's</p>
            {TS.map((t, i) => (
              <p key={i} className="text-xs text-slate-300 flex gap-2">
                <span className="text-slate-600 shrink-0">·</span>{t}
              </p>
            ))}
          </div>
        </div>
      </Accordion>

      <Accordion title="CPR quality — paediatric" sub="Depth · Rate · Recoil">
        <div className="p-3 space-y-1.5">
          {[
            "Rate: 100–120 compressions/min",
            "Depth: >1/3 of anteroposterior chest diameter (not fixed cm — adapts to child size)",
            "Hand position: lower half of sternum",
            "Allow complete chest recoil after each compression",
            "Change compressor every 2 minutes",
            "Minimise all interruptions to compressions",
            "Avoid excessive ventilation",
            "SGA air leak during continuous compressions → revert to 15:2 or 30:2",
          ].map((item, i) => (
            <p key={i} className="text-xs text-slate-300 flex gap-2">
              <span className="text-slate-600 shrink-0">·</span>{item}
            </p>
          ))}
        </div>
      </Accordion>

      <Accordion title="Airway — SGA & ETT sizing" sub="Weight-based SGA · Age-based ETT">
        <div className="p-3 space-y-4">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 mb-2">
              SGA size by weight
            </p>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
              {[
                ["Size 1", "2–5 kg"],
                ["Size 1.5", "5–12 kg"],
                ["Size 2", "10–25 kg"],
                ["Size 2.5", "25–35 kg"],
              ].map(([size, range], i, arr) => (
                <div
                  key={i}
                  className={`flex justify-between px-3 py-2 ${i < arr.length - 1 ? "border-b border-slate-700" : ""}`}
                >
                  <span className="text-xs font-semibold text-slate-200">{size}</span>
                  <span className="text-xs text-slate-400">{range}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 mb-2">
              ETT size (age-based)
            </p>
            <div className="space-y-1">
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-slate-100">Uncuffed:</span> (age ÷ 4) + 4
              </p>
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-slate-100">Cuffed:</span> (age ÷ 4) + 3.5
              </p>
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-slate-100">Depth:</span> (age ÷ 2) + 12 cm at lip
              </p>
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Notes
            </p>
            {[
              "SGA is the primary airway adjunct during cardiac arrest",
              "Attach HME/filter to SGA or ETT",
              "EtCO₂ waveform capnography mandatory with all advanced airways",
            ].map((item, i) => (
              <p key={i} className="text-xs text-slate-300 flex gap-2 mb-1">
                <span className="text-slate-600 shrink-0">·</span>{item}
              </p>
            ))}
            <div className="flex items-start gap-2 mt-1">
              <span className="text-slate-600 shrink-0 text-xs mt-[1px]">·</span>
              <div className="flex items-start gap-1.5 flex-wrap">
                <CcpBadge />
                <p className="text-xs text-slate-300 leading-5">
                  Must consider ETI after ~10 min — if suitable ETT size available
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-1">
              <span className="text-slate-600 shrink-0 text-xs mt-[1px]">·</span>
              <div className="flex items-start gap-1.5 flex-wrap">
                <CcpBadge />
                <p className="text-xs text-slate-300 leading-5">
                  Gastric tube via SGA, or OGT if ETT in situ — prevent aspiration
                </p>
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Defibrillation" sub="4 J/kg · CCP joule escalation">
        <div className="p-3 space-y-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-500 mb-1">
              All shocks
            </p>
            <p className="text-sm font-bold text-amber-200">4 J/kg — first and subsequent</p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              Use WAAFELSS calculator for actual joule value
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CcpBadge />
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-violet-400 mb-1">
                Joule escalation
              </p>
              <p className="text-xs text-slate-300 leading-5">
                After 3 shocks without rhythm change, increase joules in 2 J/kg increments each subsequent cycle — to a maximum of 10 J/kg or adult dosing.
              </p>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Drug reference" sub="Adrenaline · Amiodarone · Ketamine">
        <div className="p-3 space-y-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">
              Adrenaline
            </p>
            <p className="text-xs text-slate-300">0.01 mg/kg IV/IO = 0.1 mL/kg of 1:10,000</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Asystole/PEA: give ASAP · VF/VT: first dose at cycle 3
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Repeat every 4 min throughout</p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">
              Amiodarone — refractory VF/VT only
            </p>
            <p className="text-xs text-slate-300">5 mg/kg IV/IO — first dose (cycle 3)</p>
            <p className="text-xs text-slate-300 mt-0.5">5 mg/kg IV/IO — repeat dose (ongoing cycles)</p>
          </div>
          <div className="border-t border-slate-800 pt-3 flex items-start gap-1.5">
            <CcpBadge />
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-violet-400 mb-1">
                Ketamine — CPR-induced consciousness
              </p>
              <p className="text-xs text-slate-300">1 mg/kg IV/IO bolus</p>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="WAAFELSS mnemonic" sub="Quick memory aid — CPG 2.3">
        <div className="p-3">
          <div className="space-y-2.5">
            {(
              [
                ["W", "Weight", "0–12m: (months×0.5)+4 · 1–5y: (age×2)+8 · 6–14y: (age×3)+7"],
                ["A", "Adrenaline", "0.01 mg/kg = 0.1 mL/kg of 1:10,000"],
                ["A", "Amiodarone", "5 mg/kg IV/IO — refractory VF/VT"],
                ["F", "Fluids", "10–20 mL/kg isotonic · up to 3 boluses"],
                ["E", "Energy", "4 J/kg · CCP: escalate to max 10 J/kg"],
                ["L", "Laryngeal (airway sizes)", "SGA 1/1.5/2/2.5 · ETT: uncuffed (age÷4)+4"],
                ["S", "Sugar", "2.5 mL/kg of 10% Dextrose IV"],
                ["S", "Systolic BP target", "(age × 2) + 70 mmHg"],
              ] as [string, string, string][]
            ).map(([letter, label, detail], i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-900/50 text-xs font-bold text-emerald-400">
                  {letter}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{label}</p>
                  <p className="text-[0.68rem] text-slate-500 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PedsArrestAlgorithmPage() {
  const [rhythm, setRhythm] = useState<Rhythm>(null);
  const [tab, setTab] = useState<Tab>("algorithm");
  const [roscOpen, setRoscOpen] = useState(false);
  const [noRoscOpen, setNoRoscOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard/resuscitation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Paediatric Resuscitation · CPG 2.3 · v2.5 2026
            </p>
            <h1 className="text-sm font-semibold leading-tight text-slate-50">
              Paediatric Medical Cardiac Arrest
            </h1>
          </div>
          <CopySummaryButton summaryText={summaryText} />
        </div>

        {/* Tab bar */}
        <div className="mx-auto max-w-2xl px-4 pb-2">
          <div className="flex gap-1 rounded-xl bg-slate-900 p-1">
            {(["algorithm", "reference"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  tab === t
                    ? "bg-slate-700 text-slate-100"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t === "algorithm" ? "Algorithm" : "Quick Reference"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-4">
        {/* ══════════════ ALGORITHM TAB ══════════════ */}
        {tab === "algorithm" && (
          <>
            {/* No field termination — always visible */}
            <WarnItem
              text="Do NOT terminate paediatric resuscitation in the field"
              sub="Transport with CPR in progress to appropriate facility — per CPG 2.7"
            />

            {/* Step 1 — Confirm arrest */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">
                  1 — Confirm arrest
                </p>
                <span className="text-[0.6rem] font-semibold text-slate-600">No signs of life</span>
              </div>
              <div className="flex flex-col gap-1.5 p-3">
                <ActionItem text="Unresponsive + absent or agonal breathing" />
                <ActionItem text="No palpable carotid pulse" />
                <ActionItem text="Undeniable death criteria absent — if present, do not commence CPR (CPG 2.7)" />
              </div>
            </section>

            {/* Step 2 — Start CPR */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="border-b border-slate-800 px-4 py-2.5">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">
                  2 — Start CPR &amp; prepare airway
                </p>
              </div>
              <div className="flex flex-col gap-1.5 p-3">
                <ActionItem
                  text="Start CPR immediately"
                  sub="Push hard (>1/3 AP chest diameter), fast (100–120/min), full recoil"
                />
                <ActionItem
                  text="Prepare BVM → deliver 5 effective rescue breaths → resume CPR"
                  sub="5 initial BVM breaths before first rhythm check — paediatric-specific"
                />
                <ActionItem text="Attach defibrillator pads while CPR continues" />
                <ActionItem text="Call for backup — assign clear team roles" />
              </div>
            </section>

            {/* WAAFELSS calculator shortcut */}
            <Link
              href="/tools/peds-arrest"
              className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 transition-colors hover:bg-emerald-500/15"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <Calculator className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-200">WAAFELSS Dose Calculator</p>
                <p className="text-[0.65rem] text-emerald-500">
                  Enter age / weight → get exact adrenaline, amiodarone &amp; shock joules
                </p>
              </div>
            </Link>

            {/* Step 3 — Rhythm */}
            <section>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1 mb-2">
                3 — Rhythm assessment
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRhythm(rhythm === "shockable" ? null : "shockable")}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-center transition-all active:scale-[0.97] ${
                    rhythm === "shockable"
                      ? "border-amber-500/70 bg-amber-500/15 text-amber-100"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Zap className={`h-7 w-7 ${rhythm === "shockable" ? "text-amber-400" : "text-slate-600"}`} />
                  <span className="text-sm font-bold">VF / VT</span>
                  <span className="text-[0.65rem] text-slate-500">Shockable</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRhythm(rhythm === "nonShockable" ? null : "nonShockable")}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-center transition-all active:scale-[0.97] ${
                    rhythm === "nonShockable"
                      ? "border-sky-500/70 bg-sky-500/15 text-sky-100"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <XCircle className={`h-7 w-7 ${rhythm === "nonShockable" ? "text-sky-400" : "text-slate-600"}`} />
                  <span className="text-sm font-bold">Asystole / PEA</span>
                  <span className="text-[0.65rem] text-slate-500">Non-shockable</span>
                </button>
              </div>
              {rhythm === null && (
                <p className="text-center text-[0.7rem] text-slate-600 pt-2">
                  Select rhythm to display treatment pathway
                </p>
              )}
            </section>

            {/* Shockable pathway */}
            {rhythm === "shockable" && (
              <section>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-amber-500/80 px-1 mb-2">
                  Shockable pathway — VF / VT
                </p>
                <ShockablePathway />
              </section>
            )}

            {/* Non-shockable pathway */}
            {rhythm === "nonShockable" && (
              <section>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-sky-500/80 px-1 mb-2">
                  Non-shockable pathway — Asystole / PEA
                </p>
                <NonShockablePathway />
              </section>
            )}

            {/* ROSC / No ROSC */}
            <section className="space-y-2">

              {/* ROSC */}
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 overflow-hidden">
                <button type="button" onClick={() => setRoscOpen(o => !o)}
                  className="flex w-full items-center gap-2 px-3 py-2.5">
                  <HeartPulse className="h-4 w-4 text-emerald-400 shrink-0" />
                  <p className="flex-1 text-left text-xs font-bold text-emerald-300">ROSC</p>
                  <p className="text-[0.62rem] font-semibold text-emerald-500 mr-1">CPG 2.6</p>
                  {roscOpen
                    ? <ChevronUp className="h-3.5 w-3.5 text-emerald-400" />
                    : <ChevronDown className="h-3.5 w-3.5 text-emerald-400/50" />}
                </button>
                {roscOpen && (
                  <div className="px-3 pb-3 space-y-2 border-t border-emerald-500/20">
                    <p className="text-[0.7rem] text-emerald-200/70 pt-2">
                      Transition to post-arrest care — initiate CPG 2.6 management.
                    </p>
                    <Link href="/tools/rosc"
                      className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 active:scale-[0.98] transition-all">
                      <HeartPulse className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1">Post-ROSC Care Tool</span>
                      <span className="text-emerald-500">→</span>
                    </Link>
                    <Link href="/tools/cpg"
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                      <span className="flex-1">CPG 2.6 — Post-Cardiac Arrest Care</span>
                      <span className="text-slate-500">→</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* No ROSC */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 overflow-hidden">
                <button type="button" onClick={() => setNoRoscOpen(o => !o)}
                  className="flex w-full items-center gap-2 px-3 py-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <p className="flex-1 text-left text-xs font-bold text-rose-300">No ROSC</p>
                  <p className="text-[0.62rem] font-semibold text-rose-500 mr-1">CPG 2.7</p>
                  {noRoscOpen
                    ? <ChevronUp className="h-3.5 w-3.5 text-rose-400" />
                    : <ChevronDown className="h-3.5 w-3.5 text-rose-400/50" />}
                </button>
                {noRoscOpen && (
                  <div className="px-3 pb-3 space-y-2 border-t border-rose-500/20">
                    <p className="text-[0.7rem] text-rose-200/70 pt-2">
                      Do NOT terminate in the field — transport with ongoing CPR.
                    </p>
                    <Link href="/tools/cpg"
                      className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 active:scale-[0.98] transition-all">
                      <span className="flex-1">CPG 2.7 — Paediatric Resuscitation</span>
                      <span className="text-rose-500">→</span>
                    </Link>
                    <Link href="/tools/sop"
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                      <span className="flex-1">SOP — Scene & Transport</span>
                      <span className="text-slate-500">→</span>
                    </Link>
                    <Link href="/tools/cpm"
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                      <span className="flex-1">CPM v4.0 — Clinical Procedures</span>
                      <span className="text-slate-500">→</span>
                    </Link>
                  </div>
                )}
              </div>

            </section>

            <p className="text-[0.65rem] text-slate-600 pb-2">
              CPG 2.3 · HMCAS v2.5 2026. Quick reference only — always follow the full current guideline and Clinical Coordination advice.
            </p>
          </>
        )}

        {/* ══════════════ REFERENCE TAB ══════════════ */}
        {tab === "reference" && (
          <>
            <ReferenceTab />
            <p className="text-[0.65rem] text-slate-600 pb-2">
              CPG 2.3 · HMCAS v2.5 2026. Quick reference only.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
