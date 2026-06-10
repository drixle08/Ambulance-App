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
  Clock,
  Timer,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Rhythm = "shockable" | "nonShockable" | null;
type Defib = "lp15" | "zoll";
type Tab = "algorithm" | "reference";

// ─── Data ────────────────────────────────────────────────────────────────────

const DEFIB_ENERGY: Record<Defib, [string, string, string, string]> = {
  lp15: ["200 J", "300 J", "360 J", "360 J"],
  zoll: ["120 J", "200 J", "200 J", "200 J"],
};

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
  "Adult unwitnessed medical cardiac arrest — CPG 2.1 (HMCAS v2.5 2026). Confirmed arrest, commenced CPR (100–120/min, ~5 cm depth), attached defibrillator. For VF/VT: single shocks (LP15: 200→300→360 J / Zoll: 120→150→200 J) with 2-min CPR cycles; SGA airway with HME/filter, continuous compressions, waveform capnography (EtCO₂); IV/IO access; adrenaline 1 mg IV/IO at cycle 3 then every 4 min; amiodarone 300 mg IV/IO then 150 mg for refractory VF/VT; vector change to A-P pads after 3 consecutive shocks; LUCAS applied at 6-min mark. For asystole/PEA: no shock; 2-min CPR cycles; SGA; IV/IO; adrenaline 1 mg ASAP then every 4 min; systematic H's & T's review (6H's: hypoxia, hypovolaemia, H⁺ acidosis, hypoglycaemia, K⁺ imbalance, hypothermia; 5T's: tension pneumo, tamponade, toxins, thrombosis-coronary, thrombosis-PE); LUCAS at 6-min mark. ROSC → CPG 2.6. Termination considered after 20 min with no response per CPG 2.7.";

// ─── Primitive components ─────────────────────────────────────────────────────

function CcpBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider border border-violet-500/40 bg-violet-500/10 text-violet-300">
      CCP
    </span>
  );
}

function SectionHeader({
  label,
  sub,
  color = "text-slate-400",
}: {
  label: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
      <p className={`text-[0.65rem] font-bold uppercase tracking-[0.22em] ${color}`}>{label}</p>
      {sub && <span className="text-[0.6rem] font-semibold text-slate-600">{sub}</span>}
    </div>
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
        <p className="text-sm text-rose-200">{text}</p>
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

function ShockItem({
  energy,
  cycleNum,
  defib,
}: {
  energy: string;
  cycleNum: number;
  defib: Defib;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
        <Zap className="h-5 w-5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tabular-nums text-amber-300">{energy}</span>
          <span className="text-xs text-amber-500 font-medium">
            {defib === "lp15" ? "LP15" : "Zoll"} · biphasic
          </span>
        </div>
        <p className="mt-0.5 text-[0.65rem] text-amber-500/80">
          Shock {cycleNum} — minimise pre-shock pause
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
        <p className="text-[0.65rem] text-sky-600">CPR only — do not charge defibrillator</p>
      </div>
    </div>
  );
}

function LucasItem() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2.5">
      <Timer className="h-4 w-4 shrink-0 text-orange-400" />
      <div>
        <p className="text-sm font-semibold text-orange-200">LUCAS — apply at 6-min mark</p>
        <p className="text-[0.65rem] text-orange-500">Regardless of presenting rhythm</p>
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
  children,
  borderColor,
}: {
  label: string;
  sub?: string;
  labelColor: string;
  children: React.ReactNode;
  borderColor: string;
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

// ─── Shockable pathway ───────────────────────────────────────────────────────

function ShockablePathway({ defib }: { defib: Defib }) {
  const e = DEFIB_ENERGY[defib];

  return (
    <div className="flex flex-col gap-3">
      {/* Cycle 1 */}
      <CycleCard
        label="Cycle 1"
        sub="0 – 2 min"
        labelColor="text-amber-400"
        borderColor="border-amber-500/25"
      >
        <ShockItem energy={e[0]} cycleNum={1} defib={defib} />
        <ActionItem text="Immediately resume CPR — 2 minutes" />
        <ActionItem
          text="Insert SGA → switch to continuous compressions"
          sub="Attach HME/filter · Ventilate every 6 sec (~10 bpm)"
        />
        <ActionItem text="Assess rhythm at end of 2-min cycle" />
      </CycleCard>

      {/* Cycle 2 */}
      <CycleCard
        label="Cycle 2"
        sub="~2 – 4 min"
        labelColor="text-amber-400"
        borderColor="border-amber-500/25"
      >
        <ShockItem energy={e[1]} cycleNum={2} defib={defib} />
        <ActionItem text="Resume CPR — 2 minutes" />
        <ActionItem text="Establish IV / IO access" />
        <ActionItem text="Begin systematic H's & T's review" />
        <LucasItem />
      </CycleCard>

      {/* Cycle 3 */}
      <CycleCard
        label="Cycle 3"
        sub="~4 – 6 min"
        labelColor="text-amber-400"
        borderColor="border-amber-500/25"
      >
        <ShockItem energy={e[2]} cycleNum={3} defib={defib} />
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 flex flex-col gap-1">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-500/80 px-1">
            Vector change after 3 shocks
          </p>
          <ActionItem
            text="Change to anterior-posterior pad placement"
            sub="Pad 1: left posterior back, left of spine, below scapula · Pad 2: left anterior, midline to left nipple"
          />
        </div>
        <ActionItem text="Resume CPR — 2 minutes" />
        <DrugItem
          name="Adrenaline"
          dose="1 mg IV / IO"
          sub="Then 1 mg every 4 min thereafter"
        />
        <DrugItem
          name="Amiodarone"
          dose="300 mg IV / IO"
          sub="Refractory VF/VT — give slowly"
        />
      </CycleCard>

      {/* Ongoing cycles */}
      <CycleCard
        label="Ongoing — cycle 4+"
        sub="6 min+"
        labelColor="text-amber-400/70"
        borderColor="border-amber-500/15"
      >
        <ShockItem energy={e[3]} cycleNum={4} defib={defib} />
        <ActionItem text="Continue 2-min CPR cycles" />
        <DrugItem name="Adrenaline" dose="1 mg IV / IO every 4 min" />
        <DrugItem
          name="Amiodarone"
          dose="150 mg IV / IO"
          sub="Repeat dose — max cumulative 450 mg"
        />
        <ActionItem text="LUCAS continuous mode — ongoing" />
        <ActionItem text="Reassess rhythm + reversible causes each cycle" />
        <CcpBox>
          <CcpNoteItem text="DSED: dual sequential defibrillation from shock 4+ (or once max joules reached). No vector change required before DSED. Once initiated, all subsequent shocks must be DSED." />
          <CcpNoteItem text="Consider ETI after ~10 min of resuscitation — replace SGA if ROSC likely or transporting" />
          <CcpNoteItem text="Insert gastric tube via SGA, or OGT if ETT in situ — prevent aspiration" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO" />
        </CcpBox>
      </CycleCard>
    </div>
  );
}

// ─── Non-shockable pathway ───────────────────────────────────────────────────

function NonShockablePathway() {
  return (
    <div className="flex flex-col gap-3">
      {/* Early */}
      <CycleCard
        label="Early — first 2 min"
        labelColor="text-sky-400"
        borderColor="border-sky-500/25"
      >
        <NoShockItem />
        <ActionItem text="2-min CPR cycles — minimise all interruptions" />
        <ActionItem
          text="Insert SGA → switch to continuous compressions"
          sub="Attach HME/filter · Ventilate every 6 sec (~10 bpm)"
        />
        <ActionItem text="Establish IV / IO access" />
        <DrugItem
          name="Adrenaline"
          dose="1 mg IV / IO — ASAP"
          sub="Give as soon as IV/IO access established — do not delay"
        />
      </CycleCard>

      {/* 2–6 min */}
      <CycleCard
        label="~2 – 6 min"
        labelColor="text-sky-400"
        borderColor="border-sky-500/20"
      >
        <NoShockItem />
        <ActionItem text="Continue 2-min CPR cycles" />
        <ActionItem text="Systematic H's & T's review — treat reversible causes" />
        <LucasItem />
        <ActionItem text="Reassess rhythm each cycle — may convert to shockable" />
      </CycleCard>

      {/* Ongoing */}
      <CycleCard
        label="Ongoing — 6 min+"
        labelColor="text-sky-400/70"
        borderColor="border-sky-500/12"
      >
        <NoShockItem />
        <ActionItem text="Continue 2-min CPR cycles" />
        <DrugItem name="Adrenaline" dose="1 mg IV / IO every 4 min" />
        <ActionItem text="LUCAS continuous mode — ongoing" />
        <ActionItem text="Reassess rhythm + reversible causes each cycle" />
        <WarnItem
          text="Rhythm change to VF/VT → immediately switch to shockable pathway"
        />
        <CcpBox>
          <CcpNoteItem text="Consider ETI after ~10 min of resuscitation" />
          <CcpNoteItem text="Insert gastric tube via SGA, or OGT if ETT in situ — prevent aspiration" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO" />
        </CcpBox>
      </CycleCard>
    </div>
  );
}

// ─── Reference tab ───────────────────────────────────────────────────────────

function Accordion({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
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
      {/* H's & T's */}
      <Accordion title="Reversible causes" sub="6 H's · 5 T's">
        <div className="grid grid-cols-2 divide-x divide-slate-800">
          <div className="p-3 space-y-1.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
              H's
            </p>
            {HS.map((h, i) => (
              <p key={i} className="text-xs text-slate-300 flex gap-2">
                <span className="text-slate-600 shrink-0">·</span>
                {h}
              </p>
            ))}
          </div>
          <div className="p-3 space-y-1.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
              T's
            </p>
            {TS.map((t, i) => (
              <p key={i} className="text-xs text-slate-300 flex gap-2">
                <span className="text-slate-600 shrink-0">·</span>
                {t}
              </p>
            ))}
          </div>
        </div>
      </Accordion>

      {/* CPR quality */}
      <Accordion title="CPR quality" sub="Rate · Depth · Recoil">
        <div className="p-3 space-y-1.5">
          {[
            "Rate: 100–120 compressions/min",
            "Depth: ~5 cm — push hard, allow full chest recoil",
            "Hand position: lower half of sternum",
            "Change compressor every 2 minutes",
            "Minimise interruptions to compressions",
            "Avoid excessive ventilation",
            "LUCAS: apply at 6-min mark regardless of rhythm",
            "SGA air leak during continuous compressions → revert to 30:2",
          ].map((item, i) => (
            <p key={i} className="text-xs text-slate-300 flex gap-2">
              <span className="text-slate-600 shrink-0">·</span>
              {item}
            </p>
          ))}
        </div>
      </Accordion>

      {/* Airway */}
      <Accordion title="Airway management" sub="SGA primary · EtCO₂ mandatory">
        <div className="p-3 space-y-2">
          {[
            "SGA is the primary airway adjunct during cardiac arrest",
            "Attach HME/filter to SGA or ETT",
            "EtCO₂ waveform capnography mandatory with all advanced airways — monitors cardiac output and indicates ROSC",
          ].map((item, i) => (
            <p key={i} className="text-xs text-slate-300 flex gap-2">
              <span className="text-slate-600 shrink-0">·</span>
              {item}
            </p>
          ))}
          <div className="flex items-start gap-2 pt-1">
            <span className="text-slate-600 shrink-0 text-xs mt-[1px]">·</span>
            <div className="flex items-start gap-1.5 flex-wrap">
              <CcpBadge />
              <p className="text-xs text-slate-300 leading-5">
                Consider ETI after ~10 min — replace SGA if high likelihood of ROSC or pre-transport
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-slate-600 shrink-0 text-xs mt-[1px]">·</span>
            <div className="flex items-start gap-1.5 flex-wrap">
              <CcpBadge />
              <p className="text-xs text-slate-300 leading-5">
                Insert gastric tube via SGA or OGT if ETT in situ — prevent aspiration
              </p>
            </div>
          </div>
        </div>
      </Accordion>

      {/* Defibrillation */}
      <Accordion title="Defibrillation" sub="Energy · Vector change · DSED">
        <div className="p-3 space-y-4">
          {/* Energy table */}
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Energy sequence
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
                <p className="text-[0.62rem] font-bold uppercase text-amber-500 mb-1">LP15 (Biphasic)</p>
                <p className="text-sm font-bold text-amber-200">200 → 300 → 360 J</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                <p className="text-[0.62rem] font-bold uppercase text-amber-500/70 mb-1">Zoll (Biphasic)</p>
                <p className="text-sm font-bold text-amber-200/70">120 → 200 J</p>
              </div>
            </div>
          </div>

          {/* Vector change */}
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Vector change (AP scope) — after 3 shocks
            </p>
            <p className="text-xs text-slate-300 mb-1.5">
              After 3 consecutive shocks with no rhythm change, switch to anterior-posterior pad placement:
            </p>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Pad 1:</span> left posterior back, left of spine, just below scapula
              </p>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Pad 2:</span> left anterior chest, between midline and left nipple
              </p>
            </div>
          </div>

          {/* DSED */}
          <div className="flex items-start gap-2">
            <CcpBadge />
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-violet-400 mb-1">
                DSED
              </p>
              <p className="text-xs text-slate-300 leading-5">
                Dual sequential external defibrillation for refractory VF/VT after 3 consecutive shocks (or from shock 4+ when max joules reached). No vector change needed before DSED. Once initiated, all subsequent shocks must be DSED.
              </p>
            </div>
          </div>

          {/* Pad contact note */}
          <p className="text-xs text-slate-500">
            Ensure pads have good skin contact — poor placement leads to ineffective defibrillation.
          </p>
        </div>
      </Accordion>

      {/* Drug reference */}
      <Accordion title="Drug reference" sub="Adrenaline · Amiodarone · Ketamine">
        <div className="p-3 space-y-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Adrenaline</p>
            <p className="text-xs text-slate-300">1 mg IV/IO — first dose at cycle 3 (VF/VT) or ASAP (asystole/PEA)</p>
            <p className="text-xs text-slate-400 mt-0.5">Repeat every 4 min throughout resuscitation</p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Amiodarone — refractory VF/VT only</p>
            <p className="text-xs text-slate-300">300 mg IV/IO — first dose (cycle 3)</p>
            <p className="text-xs text-slate-300 mt-0.5">150 mg IV/IO — repeat dose</p>
            <p className="text-xs text-slate-400 mt-0.5">Maximum cumulative: 450 mg</p>
          </div>
          <div className="border-t border-slate-800 pt-3 flex items-start gap-1.5">
            <CcpBadge />
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-violet-400 mb-1">Ketamine — CPR-induced consciousness</p>
              <p className="text-xs text-slate-300">1 mg/kg IV/IO bolus</p>
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdultArrestPage() {
  const [rhythm, setRhythm] = useState<Rhythm>(null);
  const [defib, setDefib] = useState<Defib>("lp15");
  const [tab, setTab] = useState<Tab>("algorithm");
  const [roscOpen, setRoscOpen] = useState(false);
  const [noRoscOpen, setNoRoscOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-8">
      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard/resuscitation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-red-400">
              Resuscitation · CPG 2.1 · v2.5 2026
            </p>
            <h1 className="text-sm font-semibold leading-tight text-slate-50">
              Adult Medical Cardiac Arrest
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
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors capitalize ${
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
            {/* Step 1 — Confirm arrest */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <SectionHeader label="1 — Confirm arrest" sub="No signs of life" />
              <div className="flex flex-col gap-1.5 p-3">
                <ActionItem text="Unresponsive + absent or agonal breathing" />
                <ActionItem text="No palpable carotid pulse — confirm quickly, do not delay CPR" />
                <WarnItem text="Features of undeniable death present → do NOT start resuscitation (CPG 2.7)" />
              </div>
            </section>

            {/* Step 2 — Start CPR */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <SectionHeader label="2 — Start CPR" sub="Immediate" />
              <div className="flex flex-col gap-1.5 p-3">
                <ActionItem
                  text="Start CPR immediately"
                  sub="Push hard (~5 cm), fast (100–120/min), full recoil · Change compressor every 2 min"
                />
                <ActionItem text="Attach defibrillator / monitor as soon as possible" />
                <ActionItem text="Assign clear team roles — call for backup if needed" />
              </div>
            </section>

            {/* Defibrillator selector */}
            <section>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1 mb-2">
                Defibrillator
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["lp15", "zoll"] as Defib[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDefib(d)}
                    className={`rounded-xl border py-3 px-3 text-left transition-all ${
                      defib === d
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-100"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <p className="text-sm font-bold">{d === "lp15" ? "LP15" : "Zoll"}</p>
                    <p className="text-[0.65rem] text-slate-500 mt-0.5">
                      {d === "lp15" ? "200 → 300 → 360 J" : "120 → 200 J"}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 3 — Rhythm */}
            <section>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1 mb-2">
                3 — Rhythm assessment
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRhythm(rhythm === "shockable" ? null : "shockable")
                  }
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-center transition-all active:scale-[0.97] ${
                    rhythm === "shockable"
                      ? "border-amber-500/70 bg-amber-500/15 text-amber-100"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Zap
                    className={`h-7 w-7 ${
                      rhythm === "shockable" ? "text-amber-400" : "text-slate-600"
                    }`}
                  />
                  <span className="text-sm font-bold">VF / VT</span>
                  <span className="text-[0.65rem] text-slate-500">Shockable</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRhythm(rhythm === "nonShockable" ? null : "nonShockable")
                  }
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-center transition-all active:scale-[0.97] ${
                    rhythm === "nonShockable"
                      ? "border-sky-500/70 bg-sky-500/15 text-sky-100"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <XCircle
                    className={`h-7 w-7 ${
                      rhythm === "nonShockable" ? "text-sky-400" : "text-slate-600"
                    }`}
                  />
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
                <ShockablePathway defib={defib} />
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

            {/* ROSC / Termination */}
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
              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 overflow-hidden">
                <button type="button" onClick={() => setNoRoscOpen(o => !o)}
                  className="flex w-full items-center gap-2 px-3 py-2.5">
                  <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                  <p className="flex-1 text-left text-xs font-bold text-slate-400">No ROSC</p>
                  <p className="text-[0.62rem] font-semibold text-slate-600 mr-1">CPG 2.7</p>
                  {noRoscOpen
                    ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                    : <ChevronDown className="h-3.5 w-3.5 text-slate-600" />}
                </button>
                {noRoscOpen && (
                  <div className="px-3 pb-3 space-y-2 border-t border-slate-700/50">
                    <p className="text-[0.7rem] text-slate-400 pt-2">
                      Consider termination after 20 min with no response.
                    </p>
                    <Link href="/tools/cpg"
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                      <span className="flex-1">CPG 2.7 — Termination of Resuscitation</span>
                      <span className="text-slate-500">→</span>
                    </Link>
                    <Link href="/tools/sop"
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                      <span className="flex-1">SOP — Scene & Deceased Management</span>
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
              CPG 2.1 · HMCAS v2.5 2026. Quick reference only — always follow the full current guideline and Clinical Coordination advice.
            </p>
          </>
        )}

        {/* ══════════════ REFERENCE TAB ══════════════ */}
        {tab === "reference" && (
          <>
            <ReferenceTab />
            <p className="text-[0.65rem] text-slate-600 pb-2">
              CPG 2.1 · HMCAS v2.5 2026. Quick reference only.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
