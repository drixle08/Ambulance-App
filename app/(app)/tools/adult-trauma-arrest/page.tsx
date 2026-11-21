"use client";

import { useState } from "react";
import Link from "next/link";

import { useWakeLock } from "@/lib/useWakeLock";
import { ToolHeader } from "@/app/_components/ToolHeader";
import {
  Zap,
  XCircle,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Pill,
  AlertTriangle,
  Clock,
  Timer,
  Ambulance,
} from "lucide-react";
import { cpgEdition } from "@/lib/cpgEdition";
import { cpgRef, type CpgRef } from "@/lib/cpgProvenance";
import { CriticalValue } from "@/components/CriticalValue";

// Edition this tool's clinical content was last checked against (see lib/cpgEdition.ts).
const EDITION = cpgEdition("2.6");

// ─── Types ───────────────────────────────────────────────────────────────────

type Rhythm = "shockable" | "nonShockable" | null;
type Defib = "lp15" | "zoll";
type Tab = "algorithm" | "reference";

// ─── Data ────────────────────────────────────────────────────────────────────

const DEFIB_ENERGY: Record<Defib, [string, string, string, string]> = {
  lp15: ["200 J", "300 J", "360 J", "360 J"],
  zoll: ["150 J", "200 J", "200 J", "200 J"],
};

// CPG 2.2 reversible causes (p.41), in the CPG's wording.
const HS = [
  "Hypovolaemia",
  "Hypoxia",
  "Hydrogen ions (acidosis)",
  "Hypoglycaemia",
  "Hypo / hyperkalaemia",
  "Hypothermia",
];

const TS = [
  "Tension pneumothorax",
  "Tamponade — cardiac",
  "Toxins",
  "Thrombosis — cardiac",
  "Thrombosis — pulmonary",
];

/**
 * Where each value on this page is stated in the CPG. cpg:reverify checks every
 * quote against its page. The CPG 2.2 algorithm (p.40) is an image with no text
 * layer, so its items (pelvic binder, 500–1000 ml NS) were checked against the
 * rendered page instead.
 */
const SOURCES: { what: string; ref: CpgRef }[] = [
  { what: "Assume arrest if in doubt", ref: cpgRef("2.6", 38, "If in doubt, assume cardiac arrest and start CPR") },
  { what: "Reversible causes before compressions when short of hands", ref: cpgRef("2.6", 38, "If insufficient resources are available, correct reversible causes first before starting compressions") },
  { what: "Catastrophic haemorrhage", ref: cpgRef("2.6", 38, "Controlling catastrophic external haemorrhage") },
  { what: "Bilateral chest decompression", ref: cpgRef("2.6", 38, "Bilateral chest decompression by Delta and bilateral finger thoracostomy by CCP") },
  { what: "AP needle decompression", ref: cpgRef("2.6", 41, "AP may perform needle decompression under supervision in trauma cardiac arrest") },
  { what: "Vector change", ref: cpgRef("2.6", 38, "perform a vector change following 3 consecutive defibrillations and the rhythm remains shockable") },
  { what: "Defibrillation energy (LP15)", ref: cpgRef("2.6", 41, "LP15 (Biphasic): 200J, 300J, 360J") },
  { what: "Defibrillation energy (Zoll)", ref: cpgRef("2.6", 41, "Zoll (Biphasic): 150J, 200J, 200J") },
  { what: "Shock pauses", ref: cpgRef("2.6", 39, "Minimise pre- and post-shock pauses to <5 seconds") },
  { what: "DSED", ref: cpgRef("2.6", 39, "a maximum of 3 DSEDs may be performed") },
  { what: "Adrenaline timing", ref: cpgRef("2.6", 39, "Do not administer Adrenaline until reversible causes and appropriate volume replacement (at least 500ml normal saline) has occurred") },
  { what: "Adrenaline repeat", ref: cpgRef("2.6", 39, "subsequent Adrenaline should be administered every 4 minutes thereafter") },
  { what: "Adrenaline dose", ref: cpgRef("2.6", 300, "Cardiac Arrest IV 1mg Repeat every 4 minutes") },
  { what: "Amiodarone", ref: cpgRef("2.6", 39, "Amiodarone 300mg should be administered for the shockable rhythm after the 3rd shock, and 150mg after the 5th shock") },
  { what: "EtCO₂ target", ref: cpgRef("2.6", 39, "Aim for a EtCO2 of ≈25mmHg") },
  { what: "CPR-induced consciousness", ref: cpgRef("2.6", 39, "Ketamine 1mg/kg IV/IO. Neuromuscular blocking drugs should not be administered for CPR induced consciousness") },
  { what: "Mechanical ventilator", ref: cpgRef("2.6", 39, "Tidal Volume: 6-8 ml/kg (predicted body weight)") },
  { what: "Scene time", ref: cpgRef("2.6", 39, "Initiate rapid transport and provide treatment en route to the TRU") },
  { what: "LUCAS before transport", ref: cpgRef("2.6", 41, "LUCAS should be applied prior to transport if transporting patient to hospital") },
  { what: "Termination", ref: cpgRef("2.6", 39, "Consider terminating resuscitation after 20 minutes of CPR if no response to treatment and no signs of life present") },
];

const summaryText =
  "Adult trauma cardiac arrest — CPG 2.2 (HMCAS " + EDITION.short + "). Unresponsive, absent/agonal breathing, no pulse (if in doubt, assume arrest). Minimised scene time. Reversible causes addressed by clinical priority (HOTT: hypovolaemia, oxygenation, tamponade/tension pneumothorax), prioritised over chest compressions: catastrophic external haemorrhage controlled; bilateral chest decompression (needle — Delta/CCP; finger thoracostomy — CCP); SGA/ETT and maximal oxygenation; pelvic binder; IV/IO access with 500–1000 ml NS. CPR started and rhythm analysed. VF/VT: shocks LP15 200→300→360 J / Zoll 150→200→200 J, vector change to A-P after 3 consecutive shocks, amiodarone 300 mg after the 3rd shock and 150 mg after the 5th. Adrenaline 1 mg IV/IO only after reversible causes corrected and at least 500 ml NS given, then every 4 min. Transport considered with LUCAS applied. ROSC → CPG 2.6; no ROSC → continue resuscitation and transport, or consider termination after 20 min with no response (CPG 2.7).";

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

function ActionItem({ text, sub, ccp }: { text: string; sub?: string; ccp?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 px-1 py-1">
      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
      <div>
        <div className="flex items-start gap-1.5 flex-wrap">
          <p className="text-sm text-slate-200">{text}</p>
          {ccp && <CcpBadge />}
        </div>
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
          <CriticalValue value={energy} tone="critical" />
          <span className="text-xs text-amber-500 font-medium">
            {defib === "lp15" ? "LP15" : "Zoll"} · biphasic
          </span>
        </div>
        <p className="mt-0.5 text-[0.65rem] text-amber-500/80">
          Shock {cycleNum} — pre- and post-shock pauses &lt;5 s
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

/** Adrenaline in trauma arrest: only after reversible causes and at least 500 ml NS (CPG 2.2 p.39). */
function TraumaAdrenaline() {
  return (
    <DrugItem
      name="Adrenaline"
      dose="1 mg IV / IO — then every 4 min"
      sub="Only once reversible causes are corrected and at least 500 ml NS has been given"
    />
  );
}

// ─── Shockable pathway ───────────────────────────────────────────────────────

function ShockablePathway({ defib }: { defib: Defib }) {
  const e = DEFIB_ENERGY[defib];

  return (
    <div className="flex flex-col gap-3">
      <CycleCard
        label="Shocks 1 – 3"
        sub="2-min CPR cycles"
        labelColor="text-amber-400"
        borderColor="border-amber-500/25"
      >
        <ShockItem energy={e[0]} cycleNum={1} defib={defib} />
        <ShockItem energy={e[1]} cycleNum={2} defib={defib} />
        <ShockItem energy={e[2]} cycleNum={3} defib={defib} />
        <ActionItem text="Resume CPR immediately after each shock" />
        <ActionItem text="Keep correcting reversible causes alongside CPR" sub="Haemorrhage · Decompression · Airway · Pelvic binder · Fluids" />
      </CycleCard>

      <CycleCard
        label="After the 3rd shock"
        labelColor="text-amber-400"
        borderColor="border-amber-500/25"
      >
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 flex flex-col gap-1">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-500/80 px-1">
            Vector change after 3 consecutive shocks
          </p>
          <ActionItem
            text="Change to anterior-posterior pad placement"
            sub="Pad 1: left posterior back, left of spine, below scapula · Pad 2: left anterior, midline to left nipple"
          />
        </div>
        <DrugItem
          name="Amiodarone"
          dose="300 mg IV / IO"
          sub="After the 3rd shock"
        />
        <TraumaAdrenaline />
      </CycleCard>

      <CycleCard
        label="Ongoing — shock 4+"
        labelColor="text-amber-400/70"
        borderColor="border-amber-500/15"
      >
        <ShockItem energy={e[3]} cycleNum={4} defib={defib} />
        <ActionItem text="Continue 2-min CPR cycles" />
        <DrugItem
          name="Amiodarone"
          dose="150 mg IV / IO"
          sub="After the 5th shock"
        />
        <DrugItem name="Adrenaline" dose="1 mg IV / IO every 4 min" sub="Once started" />
        <ActionItem text="Reassess rhythm + reversible causes each cycle" />
        <CcpBox>
          <CcpNoteItem text="DSED: refractory VF/VT after 3 consecutive shocks (shock 4+) or once max joules reached. No vector change required. Max 3 DSEDs — if still shockable, revert to standard A-P at max joules." />
          <CcpNoteItem text="Witnessed arrest presenting in a shockable rhythm: 3 stacked shocks" />
          <CcpNoteItem text="Replace SGA with ETT once all necessary interventions are done — particularly if ROSC is likely or transporting" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO (no neuromuscular blockers)" />
        </CcpBox>
      </CycleCard>
    </div>
  );
}

// ─── Non-shockable pathway ───────────────────────────────────────────────────

function NonShockablePathway() {
  return (
    <div className="flex flex-col gap-3">
      <CycleCard
        label="Asystole / PEA"
        sub="2-min CPR cycles"
        labelColor="text-sky-400"
        borderColor="border-sky-500/25"
      >
        <NoShockItem />
        <ActionItem text="2-min CPR cycles — minimise all interruptions" />
        <ActionItem text="Keep correcting reversible causes alongside CPR" sub="Haemorrhage · Decompression · Airway · Pelvic binder · Fluids" />
        <WarnItem
          text="Unlike medical arrest, do NOT give adrenaline as soon as access is gained"
          sub="Correct reversible causes and give at least 500 ml NS first"
        />
        <TraumaAdrenaline />
      </CycleCard>

      <CycleCard
        label="Ongoing"
        labelColor="text-sky-400/70"
        borderColor="border-sky-500/15"
      >
        <NoShockItem />
        <ActionItem text="Continue 2-min CPR cycles" />
        <DrugItem name="Adrenaline" dose="1 mg IV / IO every 4 min" sub="Once started" />
        <ActionItem text="Reassess rhythm + reversible causes each cycle" />
        <WarnItem text="Rhythm change to VF/VT → immediately switch to shockable pathway" />
        <CcpBox>
          <CcpNoteItem text="Replace SGA with ETT once all necessary interventions are done — particularly if ROSC is likely or transporting" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg IV/IO (no neuromuscular blockers)" />
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

function Bullets({ items }: { items: string[] }) {
  return (
    <div className="p-3 space-y-1.5">
      {items.map((item, i) => (
        <p key={i} className="text-xs text-slate-300 flex gap-2">
          <span className="text-slate-600 shrink-0">·</span>
          {item}
        </p>
      ))}
    </div>
  );
}

function ReferenceTab() {
  return (
    <div className="flex flex-col gap-2">
      <Accordion title="Trauma priorities" sub="HOTT · by clinical priority">
        <Bullets
          items={[
            "Hypovolaemia · Oxygenation · Tamponade / Tension pneumothorax",
            "Prioritise treatment of reversible causes over chest compressions",
            "Do compressions and correct reversible causes simultaneously — if there aren't enough hands, correct reversible causes first",
            "Interventions are performed by clinical priority, not in sequence",
            "Minimise time on scene — rapid transport, treat en route to the TRU when definitive surgical care can be provided",
          ]}
        />
      </Accordion>

      <Accordion title="Reversible causes" sub="6 H's · 5 T's">
        <div className="grid grid-cols-2 divide-x divide-slate-800">
          <div className="p-3 space-y-1.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
              H&apos;s
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
              T&apos;s
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

      <Accordion title="Chest decompression" sub="Needle · Finger thoracostomy">
        <div className="p-3 space-y-2">
          <p className="text-xs text-slate-300 flex gap-2">
            <span className="text-slate-600 shrink-0">·</span>
            Bilateral chest decompression — needle decompression by Delta / CCP
          </p>
          <div className="flex items-start gap-2">
            <span className="text-slate-600 shrink-0 text-xs mt-[1px]">·</span>
            <div className="flex items-start gap-1.5 flex-wrap">
              <CcpBadge />
              <p className="text-xs text-slate-300 leading-5">Bilateral finger thoracostomy</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 flex gap-2">
            <span className="text-slate-600 shrink-0">·</span>
            AP may perform needle decompression under supervision in trauma cardiac arrest
          </p>
        </div>
      </Accordion>

      <Accordion title="CPR quality" sub="Rate · Depth · Recoil">
        <Bullets
          items={[
            "Rate: 100–120 compressions/min",
            "Depth: ≈5 cm — push hard, allow complete chest recoil",
            "Hand position: lower half of sternum",
            "Change compressor every 2 minutes",
            "Minimise interruptions — pre- and post-shock pauses <5 s",
            "Avoid excessive ventilation — ventilate according to LUCAS when applied",
            "Apply LUCAS before transport if transporting to hospital",
            "SGA/ETT in place → continuous compressions; SGA air leak → revert to 30:2",
          ]}
        />
      </Accordion>

      <Accordion title="Airway management" sub="SGA primary · EtCO₂ mandatory">
        <div className="p-3 space-y-2">
          {[
            "SGA is the primary airway adjunct during cardiac arrest — maximise oxygenation",
            "Attach HME/filter to SGA or ETT",
            "Waveform capnography mandatory with all advanced airways — confirms placement, monitors CPR quality, helps detect ROSC. Aim for EtCO₂ ≈ 25 mmHg",
            "APs and CCPs: consider a gastric tube via the SGA to reduce aspiration risk",
          ].map((item, i) => (
            <p key={i} className="text-xs text-slate-300 flex gap-2">
              <span className="text-slate-600 shrink-0">·</span>
              {item}
            </p>
          ))}
          {[
            "Replace SGA with ETT once all necessary interventions are done — particularly if ROSC is likely or transporting (consider ETI after ~10 min)",
            "Orogastric tube if an ETT is in place",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-slate-600 shrink-0 text-xs mt-[1px]">·</span>
              <div className="flex items-start gap-1.5 flex-wrap">
                <CcpBadge />
                <p className="text-xs text-slate-300 leading-5">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="Defibrillation" sub="Energy · Vector change · DSED">
        <div className="p-3 space-y-4">
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
                <p className="text-sm font-bold text-amber-200/70">150 → 200 → 200 J</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Vector change (AP / CCP) — after 3 consecutive shocks
            </p>
            <p className="text-xs text-slate-300 mb-1.5">
              If the rhythm remains shockable after 3 consecutive shocks, switch to anterior-posterior pad placement:
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

          <div className="flex items-start gap-2">
            <CcpBadge />
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-violet-400 mb-1">
                DSED · Stacked shocks
              </p>
              <p className="text-xs text-slate-300 leading-5">
                Dual sequential external defibrillation for refractory VF/VT after 3 consecutive shocks (shock 4+) or when max joules reached. No vector change needed before DSED. Maximum 3 DSEDs — if the shockable rhythm persists, revert to standard anterior-posterior defibrillation at maximum joules. CCPs may give 3 stacked shocks for a witnessed arrest presenting in a shockable rhythm.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Ensure pads have good skin contact — poor placement leads to ineffective defibrillation.
          </p>
        </div>
      </Accordion>

      <Accordion title="Drug reference" sub="Adrenaline · Amiodarone · Ketamine">
        <div className="p-3 space-y-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Adrenaline</p>
            <p className="text-xs text-slate-300">1 mg IV/IO — only after reversible causes are corrected and at least 500 ml NS has been given</p>
            <p className="text-xs text-slate-400 mt-0.5">Then every 4 min</p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Amiodarone — shockable rhythm</p>
            <p className="text-xs text-slate-300">300 mg IV/IO — after the 3rd shock</p>
            <p className="text-xs text-slate-300 mt-0.5">150 mg IV/IO — after the 5th shock</p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Fluids</p>
            <p className="text-xs text-slate-300">IV/IO access — 500–1000 ml NS</p>
          </div>
          <div className="border-t border-slate-800 pt-3 flex items-start gap-1.5">
            <CcpBadge />
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-violet-400 mb-1">Ketamine — CPR-induced consciousness</p>
              <p className="text-xs text-slate-300">1 mg/kg IV/IO bolus — do not give neuromuscular blockers</p>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Mechanical ventilator" sub="CCP · initial settings">
        <Bullets
          items={[
            "Volume controlled or pressure regulated modes",
            "Tidal volume: 6–8 ml/kg (predicted body weight) — enough to cause chest rise",
            "FiO₂: 1.0 (100% oxygen)",
            "Rate: 10 breaths/min",
            "I:E: 1–1.5",
            "PEEP: 0–5 cmH₂O",
            "Pmax: 60–70 cmH₂O",
            "Inspiratory trigger: OFF",
            "Not effective → revert to manual ventilation with a BVM",
          ]}
        />
      </Accordion>

      <Accordion title="CPG sources" sub={`CPG 2.2 · Formulary · ${EDITION.short}`}>
        <div className="p-3 space-y-1.5">
          {SOURCES.map(({ what, ref }) => (
            <p key={what} className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">{what}</span> — p.{ref.page}: “{ref.quote}”
            </p>
          ))}
          <p className="text-xs text-slate-500 pt-1">Algorithm (pelvic binder, 500–1000 ml NS, LUCAS before transport): CPG 2.2 p.40.</p>
        </div>
      </Accordion>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdultTraumaArrestPage() {
  const [rhythm, setRhythm] = useState<Rhythm>(null);
  const [defib, setDefib] = useState<Defib>("lp15");
  const [tab, setTab] = useState<Tab>("algorithm");
  const [roscOpen, setRoscOpen] = useState(false);
  const [noRoscOpen, setNoRoscOpen] = useState(false);
  useWakeLock(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-8">
      <ToolHeader
        title="Adult Trauma Cardiac Arrest"
        meta={`CPG 2.2 · ${EDITION.short}`}
        showCopy
        copyText={summaryText}
      >
        {/* Tab bar */}
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-1 rounded-xl bg-slate-900 p-1">
            {(["algorithm", "reference"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 min-h-11 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
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
      </ToolHeader>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-4">
        {/* ══════════════ ALGORITHM TAB ══════════════ */}
        {tab === "algorithm" && (
          <>
            {/* Scene time — always visible */}
            <div className="flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
              <Clock className="h-4 w-4 shrink-0 text-orange-400" />
              <div>
                <p className="text-sm font-semibold text-orange-200">Minimise time on scene</p>
                <p className="text-[0.65rem] text-orange-500">
                  Rapid transport — treat en route to the TRU when definitive surgical care can be provided
                </p>
              </div>
            </div>

            {/* Step 1 — Confirm arrest */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <SectionHeader label="1 — Confirm arrest" sub="No signs of life" />
              <div className="flex flex-col gap-1.5 p-3">
                <ActionItem text="Unresponsive + absent or agonal breathing + no palpable carotid pulse" />
                <ActionItem text="If in doubt, assume cardiac arrest and start CPR" />
                <WarnItem text="Features of undeniable death present → do NOT start resuscitation (CPG 2.7)" />
              </div>
            </section>

            {/* Step 2 — Reversible causes */}
            <section className="rounded-2xl border border-rose-500/30 bg-slate-900/60 overflow-hidden">
              <SectionHeader label="2 — Address reversible causes" sub="Prioritise over compressions" color="text-rose-300" />
              <div className="flex flex-col gap-1.5 p-3">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest text-rose-400">HOTT</p>
                  <p className="text-sm font-semibold text-rose-100">
                    Hypovolaemia · Oxygenation · Tamponade / Tension pneumothorax
                  </p>
                </div>
                <ActionItem
                  text="Prioritise treatment of reversible causes over chest compressions"
                  sub="Do both at once — if there aren't enough hands, correct reversible causes first, then start compressions"
                />
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-500 px-1 pt-1">
                  By clinical priority, not in sequence
                </p>
                <ActionItem text="Control external catastrophic haemorrhage" />
                <ActionItem
                  text="Bilateral chest decompression"
                  sub="Needle decompression (Delta / CCP) · AP may perform needle decompression under supervision"
                />
                <ActionItem text="Bilateral finger thoracostomy" ccp />
                <ActionItem
                  text="SGA / ETT insertion and maximise oxygenation"
                  sub="SGA primary · HME/filter · waveform EtCO₂ (aim ≈ 25 mmHg)"
                />
                <ActionItem text="Apply pelvic binder" />
                <ActionItem text="IV / IO access — 500–1000 ml NS" />
                <TraumaAdrenaline />
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
                      {d === "lp15" ? "200 → 300 → 360 J" : "150 → 200 → 200 J"}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 3 — CPR + rhythm */}
            <section>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1 mb-2">
                3 — Start CPR and analyse the rhythm
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

            {rhythm === "shockable" && (
              <section>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-amber-500/80 px-1 mb-2">
                  Shockable pathway — VF / VT
                </p>
                <ShockablePathway defib={defib} />
              </section>
            )}

            {rhythm === "nonShockable" && (
              <section>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-sky-500/80 px-1 mb-2">
                  Non-shockable pathway — Asystole / PEA
                </p>
                <NonShockablePathway />
              </section>
            )}

            {/* Step 4 — Transport */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <SectionHeader label="4 — Transport" sub="Minimise scene time" />
              <div className="flex flex-col gap-1.5 p-3">
                <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2.5">
                  <Timer className="h-4 w-4 shrink-0 text-orange-400" />
                  <div>
                    <p className="text-sm font-semibold text-orange-200">Consider transport and apply LUCAS</p>
                    <p className="text-[0.65rem] text-orange-500">Apply LUCAS before transport if transporting to hospital</p>
                  </div>
                </div>
                <ActionItem text="Treat en route to the TRU when definitive surgical care can be provided" />
              </div>
            </section>

            {/* ROSC / No ROSC */}
            <section className="space-y-2">
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 overflow-hidden">
                <button type="button" onClick={() => setRoscOpen((o) => !o)}
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
                    <Link href="/tools/trauma-bypass"
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                      <Ambulance className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1">Trauma Bypass — sustained ROSC after trauma arrest</span>
                      <span className="text-slate-500">→</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 overflow-hidden">
                <button type="button" onClick={() => setNoRoscOpen((o) => !o)}
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
                      Continue resuscitation and transport, or consider terminating after 20 min of CPR with no response to treatment and no signs of life.
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
                  </div>
                )}
              </div>
            </section>

            <p className="text-[0.65rem] text-slate-600 pb-2">
              CPG 2.2 · HMCAS {EDITION.short}. Quick reference only — always follow the full current guideline and Clinical Coordination advice.
            </p>
          </>
        )}

        {/* ══════════════ REFERENCE TAB ══════════════ */}
        {tab === "reference" && (
          <>
            <ReferenceTab />
            <p className="text-[0.65rem] text-slate-600 pb-2">
              CPG 2.2 · HMCAS {EDITION.short}. Quick reference only.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
