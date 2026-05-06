"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  Zap,
  XCircle,
  HeartPulse,
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Pill,
  AlertTriangle,
  Clock,
  Timer,
  Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Defib = "lp15" | "zoll";
type ScenarioId = "two-rescuer" | "solo-no-pads" | "solo-pads-on";
type Tab = "algorithm" | "reference";

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEFIB_ENERGY: Record<Defib, [string, string, string, string]> = {
  lp15: ["200 J", "300 J", "360 J", "360 J"],
  zoll: ["120 J", "150 J", "200 J", "200 J"],
};

const summaryText =
  "Adult witnessed medical cardiac arrest (witnessed by HMCAS staff during transport/care) — CPG 2.1 (v2.5 2026). Pads in AP position. If pads not on: CPR immediately, attach pads, analyse rhythm. If pads on: analyse rhythm first, then treat. For VF/VT: single shocks (LP15: 200→300→360 J / Zoll: 120→150→200 J) with immediate CPR after each shock; or CCP stacked shocks (3 consecutive without CPR between) for witnessed VF/VT. For asystole/PEA: CPR, early adrenaline 1 mg IV/IO ASAP then every 4 min. SGA airway with HME/filter, continuous compressions, waveform capnography (EtCO₂). LUCAS at 6-min mark. Vector change A-P pads after 3 shocks (AP). DSED from shock 4+ (CCP). ROSC → CPG 2.6. Termination after 20 min with no response per CPG 2.7.";

// ─── Primitive components (same language as unwitnessed) ──────────────────────

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
        <p className="text-sm text-rose-200">{text}</p>
        {sub && <p className="mt-0.5 text-[0.68rem] text-rose-400">{sub}</p>}
      </div>
    </div>
  );
}

function InfoItem({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-500/8 px-3 py-2.5">
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-sky-400" />
      <div>
        <p className="text-sm text-sky-200">{text}</p>
        {sub && <p className="mt-0.5 text-[0.68rem] text-sky-400">{sub}</p>}
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
  label,
  defib,
  sub,
}: {
  energy: string;
  label: string;
  defib: Defib;
  sub?: string;
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
        <p className="mt-0.5 text-[0.65rem] text-amber-500/80">{label}</p>
        {sub && <p className="text-[0.65rem] text-amber-400/70">{sub}</p>}
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

// Numbered step badge
function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[0.62rem] font-bold text-slate-200">
      {n}
    </span>
  );
}

function StepCard({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3">
      <StepBadge n={n} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 leading-snug">{label}</p>
        {children && <div className="mt-1.5 flex flex-col gap-1.5">{children}</div>}
      </div>
    </div>
  );
}

// Rhythm fork — side-by-side VF/VT vs Asystole/PEA
function RhythmFork({
  shockContent,
  noShockContent,
}: {
  shockContent: React.ReactNode;
  noShockContent: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-1.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <p className="text-[0.7rem] font-bold text-amber-300">VF / VT</p>
        </div>
        {shockContent}
      </div>
      <div className="flex flex-col gap-1.5 rounded-2xl border border-sky-500/40 bg-sky-500/10 p-3">
        <div className="flex items-center gap-1.5">
          <XCircle className="h-3.5 w-3.5 text-sky-400" />
          <p className="text-[0.7rem] font-bold text-sky-300">Asystole / PEA</p>
        </div>
        {noShockContent}
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center">
      <div className="h-3 w-px bg-slate-700" />
    </div>
  );
}

// ─── Scenario flows ───────────────────────────────────────────────────────────

function TwoRescuerFlow({ defib }: { defib: Defib }) {
  const e = DEFIB_ENERGY[defib];
  return (
    <div className="flex flex-col gap-1.5">
      <StepCard n={1} label="Confirm witnessed arrest — both rescuers present">
        <ActionItem
          text="Unresponsive + absent or agonal breathing"
          sub="Patient already on monitor with AP pads"
        />
        <ActionItem text="R1: confirm arrest · call for help · notify NCC" />
        <ActionItem text="R2: take position at defibrillator" />
      </StepCard>

      <Connector />

      <StepCard n={2} label="Analyse rhythm — pads already on">
        <ActionItem text="Brief pause to analyse (pads connected) — minimise delay" />
      </StepCard>

      <Connector />

      <RhythmFork
        shockContent={
          <>
            <p className="text-[0.7rem] text-amber-200/90 leading-relaxed">
              R2 charges while R1 continues compressions. Deliver shock — immediate CPR after.
            </p>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 mt-0.5">
              <p className="text-[0.72rem] font-bold text-amber-300">
                {e[0]} → {e[1]} → {e[2]}
              </p>
              <p className="text-[0.6rem] text-amber-500">Single shock per cycle</p>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/8 px-2 py-1.5">
              <div className="flex items-center gap-1 mb-0.5">
                <CcpBadge />
              </div>
              <p className="text-[0.68rem] text-slate-300 leading-relaxed">
                3 stacked shocks option — consecutive shocks without CPR between for witnessed VF/VT
              </p>
            </div>
          </>
        }
        noShockContent={
          <>
            <p className="text-[0.7rem] text-sky-200/90 leading-relaxed">
              R1 starts CPR immediately + 2-min timer.
            </p>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 mt-0.5">
              <p className="text-[0.72rem] font-bold text-emerald-300">Adrenaline 1 mg IV/IO</p>
              <p className="text-[0.6rem] text-emerald-500">ASAP — may give before airway if IV/IO in</p>
            </div>
          </>
        }
      />

      <Connector />

      <StepCard n={3} label="Continue — standard adult arrest algorithm">
        <ActionItem
          text="2-min CPR cycles · rhythm check after each cycle"
          sub="R1: compressions · R2: defib, drugs, airway"
        />
        <ActionItem
          text="Insert SGA → continuous compressions"
          sub="HME/filter · EtCO₂ · ventilate every 6 sec"
        />
        <ActionItem text="IV/IO access · H's & T's review" />
        <LucasItem />
        <ActionItem text="Adrenaline 1 mg every 4 min · Amiodarone for refractory VF/VT" />
        <CcpBox>
          <CcpNoteItem text="DSED from shock 4+ for refractory VF/VT — no vector change needed" />
          <CcpNoteItem text="ETI after ~10 min · Gastric tube via SGA or OGT if ETT in situ" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO" />
        </CcpBox>
      </StepCard>
    </div>
  );
}

function SoloNoPadsFlow({ defib }: { defib: Defib }) {
  const e = DEFIB_ENERGY[defib];
  return (
    <div className="flex flex-col gap-1.5">
      <WarnItem
        text="Pads not on — get them on as fast as possible"
        sub="Speed of defibrillation is the priority in witnessed VF/VT"
      />

      <StepCard n={1} label="Confirm arrest — call for help">
        <ActionItem text="Unresponsive + absent or agonal breathing" />
        <ActionItem text="Alert partner — request backup · notify NCC" />
      </StepCard>

      <Connector />

      <StepCard n={2} label="Retrieve defib — apply AP pads immediately">
        <ActionItem
          text="Power on defibrillator — apply pads in AP position"
          sub="This is the priority — minimise delay to first rhythm analysis"
        />
        <ActionItem
          text="If partner is present: one does compressions, other applies pads"
          sub="Solo: get pads on first, then start CPR"
        />
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2 mt-0.5">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-500/80 px-1 mb-1">
            AP pad positions
          </p>
          <p className="text-[0.7rem] text-slate-400">
            Pad 1: left posterior back, left of spine, below scapula
          </p>
          <p className="text-[0.7rem] text-slate-400 mt-0.5">
            Pad 2: left anterior, between midline and left nipple
          </p>
        </div>
      </StepCard>

      <Connector />

      <StepCard n={3} label="Analyse rhythm">
        <ActionItem text="Once pads connected — brief pause to analyse rhythm" />
      </StepCard>

      <Connector />

      <RhythmFork
        shockContent={
          <>
            <p className="text-[0.7rem] text-amber-200/90 leading-relaxed">
              Charge and deliver single shock — immediately resume CPR after.
            </p>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 mt-0.5">
              <p className="text-[0.72rem] font-bold text-amber-300">
                {e[0]} → {e[1]} → {e[2]}
              </p>
              <p className="text-[0.6rem] text-amber-500">Single shock per cycle</p>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/8 px-2 py-1.5">
              <div className="flex items-center gap-1 mb-0.5">
                <CcpBadge />
              </div>
              <p className="text-[0.68rem] text-slate-300 leading-relaxed">
                3 stacked shocks for witnessed VF/VT if partner assists compressions
              </p>
            </div>
          </>
        }
        noShockContent={
          <>
            <p className="text-[0.7rem] text-sky-200/90 leading-relaxed">
              Start CPR immediately — no shock.
            </p>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 mt-0.5">
              <p className="text-[0.72rem] font-bold text-emerald-300">Adrenaline 1 mg IV/IO</p>
              <p className="text-[0.6rem] text-emerald-500">Once IV/IO established — ASAP</p>
            </div>
          </>
        }
      />

      <Connector />

      <StepCard n={4} label="Partner arrives — transition to two-rescuer algorithm">
        <ActionItem
          text="2-min CPR cycles · rhythm check · drugs · airway · LUCAS"
          sub="Standard adult arrest algorithm — same as unwitnessed from this point"
        />
        <CcpBox>
          <CcpNoteItem text="DSED from shock 4+ for refractory VF/VT — no vector change needed" />
          <CcpNoteItem text="ETI after ~10 min · Gastric tube via SGA or OGT if ETT in situ" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO" />
        </CcpBox>
      </StepCard>
    </div>
  );
}

function SoloPadsOnFlow({ defib }: { defib: Defib }) {
  const e = DEFIB_ENERGY[defib];
  return (
    <div className="flex flex-col gap-1.5">
      <InfoItem
        text="Critical patient already monitored — arrest occurs during care"
        sub="AP pads in position · defibrillator connected and on"
      />

      <StepCard n={1} label="Confirm witnessed arrest — call for help">
        <ActionItem text="Unresponsive + absent or agonal breathing" />
        <ActionItem text="Call for backup immediately · notify NCC" />
      </StepCard>

      <Connector />

      <StepCard n={2} label="Analyse rhythm — pads already on">
        <ActionItem text="Pads connected — brief pause to analyse rhythm immediately" />
      </StepCard>

      <Connector />

      <RhythmFork
        shockContent={
          <>
            <p className="text-[0.7rem] text-amber-200/90 leading-relaxed">
              Charge and deliver shock — start CPR immediately after.
            </p>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 mt-0.5">
              <p className="text-[0.72rem] font-bold text-amber-300">
                {e[0]} → {e[1]} → {e[2]}
              </p>
              <p className="text-[0.6rem] text-amber-500">Single shock per cycle (solo)</p>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/8 px-2 py-1.5">
              <div className="flex items-center gap-1 mb-0.5">
                <CcpBadge />
              </div>
              <p className="text-[0.68rem] text-slate-300 leading-relaxed">
                3 stacked shocks for witnessed VF/VT once backup arrives for compressions
              </p>
            </div>
          </>
        }
        noShockContent={
          <>
            <p className="text-[0.7rem] text-sky-200/90 leading-relaxed">
              Start CPR immediately.
            </p>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 mt-0.5">
              <p className="text-[0.72rem] font-bold text-emerald-300">Adrenaline 1 mg IV/IO</p>
              <p className="text-[0.6rem] text-emerald-500">ASAP if IV/IO already in situ — before airway</p>
            </div>
          </>
        }
      />

      <Connector />

      <StepCard n={3} label="Backup arrives — move to full algorithm">
        <ActionItem
          text="Assign roles · 2-min cycles · rhythm checks · drugs · airway · LUCAS"
          sub="Standard adult arrest algorithm from this point"
        />
        <LucasItem />
        <CcpBox>
          <CcpNoteItem text="DSED from shock 4+ for refractory VF/VT — no vector change needed" />
          <CcpNoteItem text="ETI after ~10 min · Gastric tube via SGA or OGT if ETT in situ" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO" />
        </CcpBox>
      </StepCard>
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
      {/* Stacked shocks */}
      <Accordion title="CCP — stacked shocks" sub="Witnessed VF/VT only" defaultOpen>
        <div className="p-3 space-y-3">
          <div className="flex items-start gap-2">
            <CcpBadge />
            <p className="text-xs text-slate-300 leading-5">
              For witnessed cardiac arrest presenting with a shockable rhythm, CCPs may perform 3 consecutive shocks without CPR between shocks.
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1.5">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-500">Sequence</p>
            <p className="text-xs text-amber-200">Shock 1 → check rhythm → if VF/VT: Shock 2 → check rhythm → if VF/VT: Shock 3</p>
            <p className="text-xs text-amber-200">After 3 stacked shocks → CPR 2 min → continue standard algorithm</p>
          </div>
          <p className="text-xs text-slate-500">
            Stacked shocks aim to maximise early defibrillation success in the high-probability window immediately after witnessed arrest. If rhythm converts at any point, do not deliver next shock.
          </p>
        </div>
      </Accordion>

      {/* Pad placement */}
      <Accordion title="AP pad placement" sub="Standard position for monitored patients">
        <div className="p-3 space-y-2">
          <p className="text-xs text-slate-300">Anterior-posterior placement is the standard for witnessed arrest patients already being monitored:</p>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-2.5 space-y-1.5">
            <p className="text-xs text-slate-200">
              <span className="font-semibold text-slate-100">Pad 1:</span> Left posterior back, left of spine, just below scapula
            </p>
            <p className="text-xs text-slate-200">
              <span className="font-semibold text-slate-100">Pad 2:</span> Left anterior chest, between midline and left nipple
            </p>
          </div>
          <p className="text-xs text-slate-500">Ensure good skin contact — poor pad placement leads to ineffective defibrillation.</p>
        </div>
      </Accordion>

      {/* Defibrillation energy */}
      <Accordion title="Defibrillation energy" sub="LP15 · Zoll · DSED">
        <div className="p-3 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
              <p className="text-[0.62rem] font-bold uppercase text-amber-500 mb-1">LP15 (Biphasic)</p>
              <p className="text-sm font-bold text-amber-200">200 → 300 → 360 J</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
              <p className="text-[0.62rem] font-bold uppercase text-amber-500/70 mb-1">Zoll (Biphasic)</p>
              <p className="text-sm font-bold text-amber-200/70">120 → 150 → 200 J</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CcpBadge />
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-violet-400 mb-1">DSED</p>
              <p className="text-xs text-slate-300 leading-5">
                Dual sequential defibrillation for refractory VF/VT from shock 4+ (or when max joules reached). CCPs do not need a vector change before DSED. Once started, all subsequent shocks must be DSED.
              </p>
            </div>
          </div>
        </div>
      </Accordion>

      {/* Drug timing */}
      <Accordion title="Drug reference" sub="Adrenaline · Amiodarone · Ketamine">
        <div className="p-3 space-y-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Adrenaline</p>
            <p className="text-xs text-slate-300">1 mg IV/IO — give ASAP for asystole/PEA (may give before airway if IV/IO in place)</p>
            <p className="text-xs text-slate-300 mt-0.5">For VF/VT: first dose at cycle 3 (after 3 shocks)</p>
            <p className="text-xs text-slate-400 mt-0.5">Repeat every 4 min throughout resuscitation</p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Amiodarone — refractory VF/VT only</p>
            <p className="text-xs text-slate-300">300 mg IV/IO — first dose (cycle 3)</p>
            <p className="text-xs text-slate-300 mt-0.5">150 mg IV/IO — repeat dose · Max cumulative: 450 mg</p>
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

      {/* CPR quality */}
      <Accordion title="CPR quality" sub="Rate · Depth · Recoil · LUCAS">
        <div className="p-3 space-y-1.5">
          {[
            "Rate: 100–120 compressions/min",
            "Depth: ~5 cm — push hard, allow full chest recoil",
            "Hand position: lower half of sternum",
            "Change compressor every 2 minutes",
            "Minimise interruptions to compressions",
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
                Consider ETI after ~10 min — replace SGA if ROSC likely or pre-transport
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-slate-600 shrink-0 text-xs mt-[1px]">·</span>
            <div className="flex items-start gap-1.5 flex-wrap">
              <CcpBadge />
              <p className="text-xs text-slate-300 leading-5">
                Gastric tube via SGA or OGT if ETT in situ — prevent aspiration
              </p>
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  );
}

// ─── Scenario config ──────────────────────────────────────────────────────────

const SCENARIO_META: Record<
  ScenarioId,
  {
    Icon: React.ElementType;
    label: string;
    sub: string;
    activeStyle: string;
    iconColor: string;
  }
> = {
  "two-rescuer": {
    Icon: Users,
    label: "2 Rescuers",
    sub: "Pads on",
    activeStyle: "border-emerald-500/60 bg-emerald-500/10 text-emerald-100",
    iconColor: "text-emerald-400",
  },
  "solo-no-pads": {
    Icon: User,
    label: "Solo",
    sub: "No pads",
    activeStyle: "border-rose-500/60 bg-rose-500/10 text-rose-100",
    iconColor: "text-rose-400",
  },
  "solo-pads-on": {
    Icon: User,
    label: "Solo",
    sub: "Pads on",
    activeStyle: "border-amber-500/60 bg-amber-500/10 text-amber-100",
    iconColor: "text-amber-400",
  },
};

const SCENARIO_DESCRIPTIONS: Record<ScenarioId, string> = {
  "two-rescuer": "Both AP/CCP staff present · patient already monitored with AP pads on",
  "solo-no-pads": "One responder present · defibrillator in bag · pads not yet on patient",
  "solo-pads-on":
    "One responder present · critical patient already monitored with AP pads on",
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WitnessedAdultArrestPage() {
  const [scenario, setScenario] = useState<ScenarioId>("two-rescuer");
  const [defib, setDefib] = useState<Defib>("lp15");
  const [tab, setTab] = useState<Tab>("algorithm");

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
              Adult Cardiac Arrest — Witnessed
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
            {/* Definition banner */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 space-y-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">
                Definition — witnessed arrest
              </p>
              <p className="text-xs text-slate-300 leading-5">
                Cardiac arrest <span className="font-semibold text-slate-100">witnessed by HMCAS staff</span> during transport or active patient care — not simply reported as bystander-witnessed.
              </p>
            </div>

            {/* Pad decision rule */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 space-y-0.5">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-sky-500">
                  Pads NOT on
                </p>
                <p className="text-xs font-semibold text-sky-200">CPR first → pads on → analyse</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 space-y-0.5">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-amber-500">
                  Pads already on
                </p>
                <p className="text-xs font-semibold text-amber-200">Analyse FIRST → treat rhythm</p>
              </div>
            </div>

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
                      {d === "lp15" ? "200 → 300 → 360 J" : "120 → 150 → 200 J"}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Scenario selector */}
            <section>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1 mb-2">
                Your scenario
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(SCENARIO_META) as [ScenarioId, (typeof SCENARIO_META)[ScenarioId]][]).map(
                  ([id, meta]) => {
                    const active = scenario === id;
                    const { Icon } = meta;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setScenario(id)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-2 text-center transition-all active:scale-[0.97] ${
                          active
                            ? meta.activeStyle
                            : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${active ? meta.iconColor : "text-slate-600"}`}
                        />
                        <span className="text-[0.68rem] font-semibold leading-tight">
                          {meta.label}
                        </span>
                        <span
                          className={`text-[0.6rem] font-medium ${
                            active ? "opacity-80" : "text-slate-600"
                          }`}
                        >
                          {meta.sub}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
              <p className="text-[0.68rem] text-slate-500 px-1 mt-1.5">
                {SCENARIO_DESCRIPTIONS[scenario]}
              </p>
            </section>

            {/* Flow */}
            <section>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1 mb-2">
                Sequence of actions
              </p>
              {scenario === "two-rescuer" && <TwoRescuerFlow defib={defib} />}
              {scenario === "solo-no-pads" && <SoloNoPadsFlow defib={defib} />}
              {scenario === "solo-pads-on" && <SoloPadsOnFlow defib={defib} />}
            </section>

            {/* ROSC / Termination */}
            <section className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs font-bold text-emerald-300">ROSC</p>
                </div>
                <p className="text-[0.7rem] text-emerald-200">Transition to post-arrest care</p>
                <p className="text-[0.65rem] font-semibold text-emerald-400">→ CPG 2.6</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <p className="text-xs font-bold text-slate-400">No ROSC</p>
                </div>
                <p className="text-[0.7rem] text-slate-400">
                  Consider termination after 20 min with no response
                </p>
                <p className="text-[0.65rem] font-semibold text-slate-500">→ CPG 2.7</p>
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
