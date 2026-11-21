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
  ChevronRight,
  Pill,
  AlertTriangle,
  Calculator,
  Clock,
  Ambulance,
} from "lucide-react";
import { cpgEdition } from "@/lib/cpgEdition";
import { cpgRef, type CpgRef } from "@/lib/cpgProvenance";

// Edition this tool's clinical content was last checked against (see lib/cpgEdition.ts).
const EDITION = cpgEdition("2.6");

// ─── Types ───────────────────────────────────────────────────────────────────

type Rhythm = "shockable" | "nonShockable" | null;
type Tab = "algorithm" | "reference";

// ─── Data ────────────────────────────────────────────────────────────────────

// CPG 2.4 reversible causes (p.49), in the CPG's wording.
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
 * quote against its page. The CPG 2.4 algorithm (p.48) is an image with no text
 * layer, so its items (10–20 ml/kg NS, needle decompression by CCP, pelvic
 * binder) were checked against the rendered page instead.
 */
const SOURCES: { what: string; ref: CpgRef }[] = [
  { what: "Assume arrest if in doubt", ref: cpgRef("2.6", 46, "If in doubt, assume cardiac arrest and start CPR") },
  { what: "Bradycardia with poor perfusion", ref: cpgRef("2.6", 46, "Bradycardic <60 beats/min with - Signs of poor perfusion such as pallor, mottling, central cyanosis") },
  { what: "Reversible causes before compressions when short of hands", ref: cpgRef("2.6", 46, "If insufficient resources are available, correct reversible causes first before starting compressions") },
  { what: "Catastrophic haemorrhage", ref: cpgRef("2.6", 46, "Controlling catastrophic external haemorrhage") },
  { what: "Bilateral chest decompression", ref: cpgRef("2.6", 46, "Bilateral chest decompression by CCP") },
  { what: "Pad position", ref: cpgRef("2.6", 46, "The anterior-posterior pad position is the primary pad placement position for paediatrics <25kg") },
  { what: "Defibrillation energy", ref: cpgRef("2.6", 46, "Defibrillate at a dose of 4J/kg or adult dose depending on patient weight") },
  { what: "CCP joule escalation", ref: cpgRef("2.6", 46, "CCPs may escalate the joules if required after 5 shocks in increments of 2J for every subsequent shock to a maximum of 8J/kg or adult dosing") },
  { what: "Infant compressions", ref: cpgRef("2.6", 46, "The two-thumb encircling technique for chest compressions must be used for infants <1 year") },
  { what: "Adrenaline timing", ref: cpgRef("2.6", 47, "Do not administer adrenaline until reversible causes and appropriate volume replacement (10ml/kg bolus of NaCl) has occurred") },
  { what: "Adrenaline — non-shockable", ref: cpgRef("2.6", 47, "for the non-shockable rhythms at a dose of 0.01mg/kg (max 1mg) and repeated every 4 minutes") },
  { what: "Adrenaline — shockable", ref: cpgRef("2.6", 47, "Adrenaline should be administered after 4 minutes of CPR at a dose of 0.01mg/kg (max 1mg)") },
  { what: "Amiodarone", ref: cpgRef("2.6", 47, "Amiodarone 5mg/kg (max 300mg) should be administered for the shockable rhythm after the 3rd shock, and 5mg/kg (max 150mg) after the 5th shock") },
  { what: "CPR-induced consciousness", ref: cpgRef("2.6", 47, "CPR induced consciousness should be managed with a bolus dose of Ketamine 1mg/kg") },
  { what: "Dose weight", ref: cpgRef("2.6", 47, "Drug doses should ideally be calculated according to the patients’ actual weight") },
  { what: "Mechanical ventilator", ref: cpgRef("2.6", 47, "Use of the mechanical ventilator during paediatric cardiac arrest is not recommended") },
  { what: "Termination", ref: cpgRef("2.6", 47, "Termination of resuscitation for paediatric patients is not a routine practice and may only occur in special circumstances") },
  { what: "Ventilation rates", ref: cpgRef("2.6", 49, "<1 year – 25 breaths/min o 1-8 years – 20 breaths/min o 8-12 years – 15 breaths/min o >12 years – 10 breaths/min") },
  { what: "ETI", ref: cpgRef("2.6", 49, "CCPs may consider ETI after approx. 10 min of resuscitation (if suitable ETT size available)") },
];

const summaryText =
  "Paediatric trauma cardiac arrest — CPG 2.4 (HMCAS " + EDITION.short + "). No signs of life (or bradycardia <60/min with poor perfusion); if in doubt, assumed arrest. Reversible causes addressed by clinical priority (HOTT: hypovolaemia, oxygenation, tamponade/tension pneumothorax), prioritised over chest compressions: catastrophic external haemorrhage controlled; bilateral needle decompression (CCP); SGA/ETT and maximal oxygenation; pelvic binder; IV/IO access with 10–20 ml/kg NS. CPR started and rhythm analysed. VF/VT: 4 J/kg or adult dose by weight (A-P pads primary <25 kg); amiodarone 5 mg/kg (max 300 mg) after the 3rd shock and 5 mg/kg (max 150 mg) after the 5th; CCP joule escalation +2 J after 5 shocks to max 8 J/kg or adult dose. Adrenaline 0.01 mg/kg (max 1 mg) only after reversible causes corrected and a 10 ml/kg NaCl bolus — non-shockable then, shockable after 4 min of CPR — then every 4 min. Transported. ROSC → CPG 2.6; no ROSC → continue resuscitation and transport (termination not routine, CPG 2.7).";

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

function PedsShockItem({ cycleNum }: { cycleNum: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
        <Zap className="h-5 w-5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tabular-nums text-amber-300">4 J/kg</span>
          <span className="text-xs text-amber-500 font-medium">or adult dose by weight</span>
        </div>
        <p className="mt-0.5 text-[0.65rem] text-amber-500/80">
          Shock {cycleNum} — see WAAFELSS calculator for exact joules
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

const CAUSES_SUB = "Haemorrhage · Decompression · Airway · Pelvic binder · Fluids";
const VENT_SUB = "HME/filter · EtCO₂ · Ventilate <1y 25 · 1–8y 20 · 8–12y 15 · >12y 10 /min";

// ─── Shockable pathway ───────────────────────────────────────────────────────

function ShockablePathway() {
  return (
    <div className="flex flex-col gap-3">
      <CycleCard label="Shocks 1 – 2" sub="0 – 4 min" labelColor="text-amber-400" borderColor="border-amber-500/25">
        <PedsShockItem cycleNum={1} />
        <PedsShockItem cycleNum={2} />
        <ActionItem text="Resume CPR immediately after each shock — 2-min cycles" />
        <ActionItem text="Keep correcting reversible causes alongside CPR" sub={CAUSES_SUB} />
        <ActionItem text="SGA in place → continuous compressions" sub={VENT_SUB} />
      </CycleCard>

      <CycleCard label="Shock 3" sub="~4 – 6 min" labelColor="text-amber-400" borderColor="border-amber-500/25">
        <PedsShockItem cycleNum={3} />
        <DrugItem
          name="Adrenaline"
          dose="0.01 mg/kg IV/IO (max 1 mg)"
          sub="After 4 min of CPR — only once reversible causes are corrected and a 10 ml/kg NaCl bolus has been given · then every 4 min"
        />
        <DrugItem name="Amiodarone" dose="5 mg/kg IV/IO (max 300 mg)" sub="After the 3rd shock — use WAAFELSS for exact mg" />
      </CycleCard>

      <CycleCard label="Ongoing — shock 4+" sub="6 min+" labelColor="text-amber-400/70" borderColor="border-amber-500/15">
        <PedsShockItem cycleNum={4} />
        <ActionItem text="Continue 2-min CPR cycles" />
        <DrugItem name="Adrenaline" dose="0.01 mg/kg IV/IO (max 1 mg) — every 4 min" />
        <DrugItem name="Amiodarone" dose="5 mg/kg IV/IO (max 150 mg)" sub="After the 5th shock" />
        <ActionItem text="Reassess rhythm + reversible causes each cycle" />
        <CcpBox>
          <CcpNoteItem text="Joule escalation: after 5 shocks, increase +2 J per shock — max 8 J/kg or adult dose" />
          <CcpNoteItem text="Consider ETI after ~10 min if a suitable ETT size is available" />
          <CcpNoteItem text="Gastric tube via the SGA to prevent aspiration" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg (no neuromuscular blockers)" />
        </CcpBox>
      </CycleCard>
    </div>
  );
}

// ─── Non-shockable pathway ───────────────────────────────────────────────────

function NonShockablePathway() {
  return (
    <div className="flex flex-col gap-3">
      <CycleCard label="Asystole / PEA" sub="2-min CPR cycles" labelColor="text-sky-400" borderColor="border-sky-500/25">
        <NoShockItem />
        <ActionItem text="2-min CPR cycles — minimise all interruptions" />
        <ActionItem text="Keep correcting reversible causes alongside CPR" sub={CAUSES_SUB} />
        <ActionItem text="SGA in place → continuous compressions" sub={VENT_SUB} />
        <WarnItem
          text="Unlike medical arrest, do NOT give adrenaline as soon as access is gained"
          sub="Correct reversible causes and give a 10 ml/kg NaCl bolus first"
        />
        <DrugItem
          name="Adrenaline"
          dose="0.01 mg/kg IV/IO (max 1 mg)"
          sub="Once reversible causes are corrected and the fluid bolus is given · then every 4 min"
        />
      </CycleCard>

      <CycleCard label="Ongoing" labelColor="text-sky-400/70" borderColor="border-sky-500/15">
        <NoShockItem />
        <ActionItem text="Continue 2-min CPR cycles" />
        <DrugItem name="Adrenaline" dose="0.01 mg/kg IV/IO (max 1 mg) — every 4 min" />
        <ActionItem text="Reassess rhythm + reversible causes each cycle" />
        <WarnItem text="Rhythm converts to VF/VT → switch to shockable pathway immediately" />
        <CcpBox>
          <CcpNoteItem text="Consider ETI after ~10 min if a suitable ETT size is available" />
          <CcpNoteItem text="Gastric tube via the SGA to prevent aspiration" />
          <CcpNoteItem text="CPR-induced consciousness → Ketamine 1 mg/kg (no neuromuscular blockers)" />
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
            "Bilateral chest decompression is a CCP intervention in paediatric trauma arrest",
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

      <Accordion title="CPR quality — paediatric" sub="Rate · Depth · Technique">
        <Bullets
          items={[
            "Rate: 100–120 compressions/min",
            "Depth: >1/3 of the anteroposterior diameter of the chest — allow complete recoil",
            "Hand position: lower half of sternum",
            "Infants <1 year: two-thumb encircling technique must be used",
            ">1 year (or if two-thumb encircling isn't possible): 1-handed or 2-handed technique",
            "Change compressor every 2 minutes · interruptions <5 s",
            "Avoid excessive ventilation — <1y 25 · 1–8y 20 · 8–12y 15 · >12y 10 breaths/min",
            "SGA/ETT in place → continuous compressions; SGA air leak → revert to 15:2",
          ]}
        />
      </Accordion>

      <Accordion title="Airway management" sub="SGA primary · EtCO₂ mandatory">
        <div className="p-3 space-y-2">
          {[
            "SGA is the primary airway adjunct during cardiac arrest — maximise oxygenation",
            "Attach HME/filter to SGA or ETT",
            "Waveform capnography mandatory with all advanced airways — confirms placement, monitors CPR quality, helps detect ROSC",
            "Mechanical ventilator is not recommended in paediatric cardiac arrest",
            "SGA / ETT sizes: use the WAAFELSS calculator",
          ].map((item, i) => (
            <p key={i} className="text-xs text-slate-300 flex gap-2">
              <span className="text-slate-600 shrink-0">·</span>
              {item}
            </p>
          ))}
          {[
            "Consider ETI after ~10 min of resuscitation — if a suitable ETT size is available",
            "Gastric tube via the SGA to prevent aspiration",
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

      <Accordion title="Defibrillation" sub="4 J/kg · CCP joule escalation">
        <div className="p-3 space-y-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-500 mb-1">
              First and subsequent shocks
            </p>
            <p className="text-lg font-black text-amber-200">4 J/kg — or adult dose by weight</p>
            <p className="text-xs text-amber-400/80 mt-0.5">Use WAAFELSS calculator for exact joule value</p>
          </div>
          <Bullets
            items={[
              "<25 kg: anterior-posterior is the primary pad position",
              ">25 kg: anterior-lateral or anterior-posterior",
            ]}
          />
          <div className="flex items-start gap-2">
            <CcpBadge />
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-violet-400 mb-1">
                Joule escalation (CCP only)
              </p>
              <p className="text-xs text-slate-300 leading-5">
                After 5 shocks, CCPs may escalate in 2 J increments for every subsequent shock to a maximum of 8 J/kg or adult dose.
              </p>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Drug reference" sub="Adrenaline · Amiodarone · Ketamine">
        <div className="p-3 space-y-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Adrenaline</p>
            <p className="text-xs text-slate-300">0.01 mg/kg IV/IO (max 1 mg) = 0.1 ml/kg of 1:10,000</p>
            <p className="text-xs text-slate-400 mt-0.5">Only after reversible causes are corrected and a 10 ml/kg NaCl bolus</p>
            <p className="text-xs text-slate-400 mt-0.5">Asystole/PEA: then give · VF/VT: after 4 min of CPR</p>
            <p className="text-xs text-slate-400 mt-0.5">Repeat every 4 min</p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Amiodarone — shockable rhythm</p>
            <p className="text-xs text-slate-300">5 mg/kg IV/IO (max 300 mg) — after the 3rd shock</p>
            <p className="text-xs text-slate-300 mt-0.5">5 mg/kg IV/IO (max 150 mg) — after the 5th shock</p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-500 mb-1.5">Fluids</p>
            <p className="text-xs text-slate-300">IV/IO access — 10–20 ml/kg NS</p>
          </div>
          <div className="border-t border-slate-800 pt-3 flex items-start gap-1.5">
            <CcpBadge />
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-violet-400 mb-1">Ketamine — CPR-induced consciousness</p>
              <p className="text-xs text-slate-300">1 mg/kg bolus — do not give neuromuscular blockers</p>
            </div>
          </div>
          <p className="border-t border-slate-800 pt-3 text-xs text-slate-500">
            Calculate doses from actual weight (from parents / caregiver); if unavailable, use an age-based weight formula.
          </p>
        </div>
      </Accordion>

      <Accordion title="CPG sources" sub={`CPG 2.4 · ${EDITION.short}`}>
        <div className="p-3 space-y-1.5">
          {SOURCES.map(({ what, ref }) => (
            <p key={what} className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">{what}</span> — p.{ref.page}: “{ref.quote}”
            </p>
          ))}
          <p className="text-xs text-slate-500 pt-1">Algorithm (needle decompression by CCP, pelvic binder, 10–20 ml/kg NS, transport): CPG 2.4 p.48.</p>
        </div>
      </Accordion>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PedsTraumaArrestPage() {
  const [rhythm, setRhythm] = useState<Rhythm>(null);
  const [tab, setTab] = useState<Tab>("algorithm");
  const [roscOpen, setRoscOpen] = useState(false);
  const [noRoscOpen, setNoRoscOpen] = useState(false);
  useWakeLock(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-8">
      <ToolHeader
        title="Paediatric Trauma Cardiac Arrest"
        meta={`CPG 2.4 · ${EDITION.short}`}
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
            {/* WAAFELSS calculator shortcut */}
            <Link
              href="/tools/peds-arrest"
              className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3 transition-colors hover:bg-emerald-500/15"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <Calculator className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-200">WAAFELSS Dose Calculator</p>
                <p className="text-[0.65rem] text-emerald-500">
                  Enter age / weight → exact adrenaline mg, amiodarone mg, fluid volume & shock joules
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-emerald-600 shrink-0" />
            </Link>

            {/* Step 1 — Confirm arrest */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <SectionHeader label="1 — Confirm arrest" sub="No signs of life" />
              <div className="flex flex-col gap-1.5 p-3">
                <ActionItem text="Unresponsive + absent or agonal breathing + no palpable carotid pulse" />
                <ActionItem text="If in doubt, assume cardiac arrest and start CPR" />
                <ActionItem
                  text="Also start CPR for bradycardia <60/min with signs of poor perfusion"
                  sub="Pallor · mottling · central cyanosis"
                />
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
                <ActionItem text="Bilateral needle decompression" ccp />
                <ActionItem
                  text="SGA / ETT insertion and maximise oxygenation"
                  sub="SGA primary · HME/filter · waveform EtCO₂"
                />
                <ActionItem text="Apply pelvic binder" />
                <ActionItem text="IV / IO access — 10–20 ml/kg NS" sub="Use WAAFELSS for the volume" />
                <DrugItem
                  name="Adrenaline"
                  dose="0.01 mg/kg IV/IO (max 1 mg)"
                  sub="Only once reversible causes are corrected and a 10 ml/kg NaCl bolus has been given"
                />
              </div>
            </section>

            {/* Step 3 — CPR + rhythm */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <SectionHeader label="3 — Start CPR" sub="Simultaneously where possible" />
              <div className="flex flex-col gap-1.5 p-3">
                <ActionItem
                  text="Push hard (>1/3 AP chest diameter) and fast (100–120/min), full recoil"
                  sub="Infants <1 year: two-thumb encircling · >1 year: 1- or 2-handed"
                />
                <ActionItem
                  text="Attach defibrillator pads"
                  sub="Anterior-posterior is primary for <25 kg · A-L or A-P for >25 kg"
                />
              </div>
            </section>

            <section>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 px-1 mb-2">
                4 — Analyse the rhythm
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
                <ShockablePathway />
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

            {/* Step 5 — Transport */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <SectionHeader label="5 — Transport" />
              <div className="flex flex-col gap-1.5 p-3">
                <div className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2.5">
                  <Ambulance className="h-4 w-4 shrink-0 text-orange-400" />
                  <p className="text-sm font-semibold text-orange-200">Transport with resuscitation in progress</p>
                </div>
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

              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 overflow-hidden">
                <button type="button" onClick={() => setNoRoscOpen((o) => !o)}
                  className="flex w-full items-center gap-2 px-3 py-2.5">
                  <Clock className="h-4 w-4 text-rose-400 shrink-0" />
                  <p className="flex-1 text-left text-xs font-bold text-rose-300">No ROSC</p>
                  <p className="text-[0.62rem] font-semibold text-rose-500 mr-1">CPG 2.7</p>
                  {noRoscOpen
                    ? <ChevronUp className="h-3.5 w-3.5 text-rose-400" />
                    : <ChevronDown className="h-3.5 w-3.5 text-rose-400/50" />}
                </button>
                {noRoscOpen && (
                  <div className="px-3 pb-3 space-y-2 border-t border-rose-500/20">
                    <p className="text-[0.7rem] text-rose-200/70 pt-2">
                      Continue resuscitation and transport. Termination in paediatrics is not routine practice and only occurs in special circumstances.
                    </p>
                    <Link href="/tools/cpg"
                      className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 active:scale-[0.98] transition-all">
                      <span className="flex-1">CPG 2.7 — Termination of Resuscitation</span>
                      <span className="text-rose-500">→</span>
                    </Link>
                    <Link href="/tools/sop"
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all">
                      <span className="flex-1">SOP — Scene & Transport</span>
                      <span className="text-slate-500">→</span>
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <p className="text-[0.65rem] text-slate-600 pb-2">
              CPG 2.4 · HMCAS {EDITION.short}. Quick reference only — always follow the full current guideline and Clinical Coordination advice.
            </p>
          </>
        )}

        {/* ══════════════ REFERENCE TAB ══════════════ */}
        {tab === "reference" && (
          <>
            <ReferenceTab />
            <p className="text-[0.65rem] text-slate-600 pb-2">
              CPG 2.4 · HMCAS {EDITION.short}. Quick reference only.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
