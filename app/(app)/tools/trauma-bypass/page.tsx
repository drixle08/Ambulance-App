"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  AlertTriangle,
  Activity,
  Layers,
  Users,
  Check,
  RotateCcw,
  Navigation,
  Hospital,
} from "lucide-react";

type Criterion = {
  id: string;
  label: string;
  helper?: string;
};

const MECHANISM_CRITERIA: Criterion[] = [
  { id: "falls-adult", label: "Adult fall ≥6 m (≥20 ft / 2 stories)" },
  { id: "falls-paeds", label: "Paediatric fall ≥3 m (≥10 ft / 1 story) or ≥2× patient height" },
  { id: "falls-animal", label: "Red (T1) or Yellow (T2) — fell from horse, camel or similar animal" },
  { id: "mvc-death", label: "Red/Yellow MVC — traumatic death in same vehicle (excl. bus / mini-bus)" },
  { id: "mvc-intrusion", label: "Red/Yellow MVC — intrusion ≥30 cm into occupant compartment or ≥45 cm at any site" },
  { id: "mvc-ejection", label: "Ejection (partial or complete) from vehicle, incl. ATV" },
  { id: "mvc-trapped", label: "Person trapped under/in vehicle or extrication ≥20 min" },
  { id: "mvc-rollover", label: "Red/Yellow MVC rollover — roof deformity ≥40 cm" },
  { id: "moto", label: "Red/Yellow motorcycle accident — speed ≥30 km/hr" },
  { id: "ped-cyclist", label: "Red/Yellow pedestrian / paediatric / bicyclist struck (thrown, run over, or impact ≥20 km/hr)" },
  {
    id: "burns-trauma",
    label: "Burns with trauma OR ≥20% BSA adults / ≥10% BSA paeds, or significant neck / facial burns with airway risk",
  },
  { id: "hanging", label: "Hanging / attempted hanging with evidence of trauma", helper: "e.g. fall > patient height or obvious spinal deformity" },
  { id: "drowning", label: "Drowning / near drowning with evidence of trauma", helper: "e.g. diving into shallow water" },
];

const VITALS_CRITERIA: Criterion[] = [
  { id: "gcs-under-15", label: "GCS < 15", helper: "Consider alcohol / drugs — treat as major trauma until proven otherwise" },
  { id: "sbp-adult-low", label: "Sustained SBP < 90 mmHg (adults)" },
  { id: "sbp-paeds-low", label: "Sustained SBP < age-specific normal value (paediatrics)" },
  { id: "sbp-elderly-low", label: "Sustained SBP < 110 mmHg (age ≥65)" },
  { id: "rr-adult", label: "RR < 10 or > 25 breaths/min (adults)" },
  { id: "rr-infant", label: "RR < 20 breaths/min (infants ≤1 year)" },
  { id: "resp-assist", label: "Any patient requiring respiratory assistance" },
];

const ANATOMIC_CRITERIA: Criterion[] = [
  { id: "chest-instability", label: "Chest wall instability / deformity, respiratory distress, subcutaneous emphysema, or suspected multiple rib fractures" },
  { id: "traumatic-amputation", label: "Traumatic amputation (excluding digits and toes)" },
  { id: "penetrating-trauma", label: "Penetrating trauma to head, neck, torso or extremities above elbow / knee" },
  { id: "open-skull", label: "Open and/or depressed skull fracture" },
  { id: "pelvic-fracture", label: "Suspected pelvic fracture / unstable pelvis" },
  { id: "multiple-long-bones", label: "Multiple long bone fractures (femur and/or humerus)" },
  { id: "isolated-femur", label: "Isolated femur fracture (excl. isolated pathologic femur fracture in elderly >65)" },
  { id: "threatened-limb", label: "Crushed, degloved, mangled or pulseless extremity (threatened limb)" },
  { id: "spinal-neuro", label: "Neurological deficit with spinal trauma or suspected spinal injury" },
  { id: "trauma-arrest", label: "Trauma arrest — decision to continue resuscitation or sustained ROSC following trauma arrest" },
];

const SPECIAL_CRITERIA: Criterion[] = [
  { id: "special-elderly", label: "Significant trauma — none of above, patient ≥65 years" },
  { id: "special-pregnancy", label: "Significant trauma — none of above, pregnant ≥20 weeks" },
  { id: "special-concern", label: "Reasonable concern despite clearing all criteria — following CCD / Clinical Desk notification" },
];

// ─── Section component ────────────────────────────────────────────────────────

type SectionColor = "orange" | "red" | "amber" | "violet";

const SECTION_STYLES: Record<SectionColor, {
  icon: string;
  count: string;
  checkedRing: string;
  checkedCard: string;
  dot: string;
}> = {
  orange: {
    icon: "text-orange-400",
    count: "bg-orange-500/20 text-orange-300",
    checkedRing: "border-orange-400 bg-orange-400/25",
    checkedCard: "border-orange-500/60 bg-orange-500/10 text-orange-50",
    dot: "bg-orange-400",
  },
  red: {
    icon: "text-red-400",
    count: "bg-red-500/20 text-red-300",
    checkedRing: "border-red-400 bg-red-400/25",
    checkedCard: "border-red-500/60 bg-red-500/10 text-red-50",
    dot: "bg-red-400",
  },
  amber: {
    icon: "text-amber-400",
    count: "bg-amber-500/20 text-amber-300",
    checkedRing: "border-amber-400 bg-amber-400/25",
    checkedCard: "border-amber-500/60 bg-amber-500/10 text-amber-50",
    dot: "bg-amber-400",
  },
  violet: {
    icon: "text-violet-400",
    count: "bg-violet-500/20 text-violet-300",
    checkedRing: "border-violet-400 bg-violet-400/25",
    checkedCard: "border-violet-500/60 bg-violet-500/10 text-violet-50",
    dot: "bg-violet-400",
  },
};

function CriteriaSection({
  icon: Icon,
  title,
  criteria,
  selected,
  onToggle,
  color,
}: {
  icon: React.ElementType;
  title: string;
  criteria: Criterion[];
  selected: string[];
  onToggle: (id: string) => void;
  color: SectionColor;
}) {
  const s = SECTION_STYLES[color];
  return (
    <section className="space-y-1.5">
      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        <Icon className={`h-4 w-4 shrink-0 ${s.icon}`} />
        <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {title}
        </h2>
        {selected.length > 0 && (
          <span className={`ml-auto rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${s.count}`}>
            {selected.length} ✓
          </span>
        )}
      </div>

      {/* Criteria buttons */}
      <div className="space-y-1.5">
        {criteria.map((item) => {
          const checked = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-all active:scale-[0.985] ${
                checked
                  ? s.checkedCard
                  : "border-slate-800 bg-slate-900/70 text-slate-200 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox indicator */}
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    checked ? s.checkedRing : "border-slate-600 bg-slate-800"
                  }`}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{item.label}</p>
                  {item.helper && (
                    <p className="mt-0.5 text-[0.7rem] text-slate-400">{item.helper}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TraumaBypassPage() {
  const [mechSelected, setMechSelected] = useState<string[]>([]);
  const [vitalsSelected, setVitalsSelected] = useState<string[]>([]);
  const [anatSelected, setAnatSelected] = useState<string[]>([]);
  const [specialSelected, setSpecialSelected] = useState<string[]>([]);
  const [nearestOnly, setNearestOnly] = useState(false);

  const toggle = (id: string, list: string[], setter: (ids: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const mechCount = mechSelected.length;
  const vitalsCount = vitalsSelected.length;
  const anatCount = anatSelected.length;
  const specialCount = specialSelected.length;
  const totalSelected = mechCount + vitalsCount + anatCount + specialCount;

  const meetsAnyCriteria = totalSelected > 0;
  const bypassRecommended = meetsAnyCriteria && !nearestOnly;

  const bypassReasonParts: string[] = [];
  if (mechCount > 0) bypassReasonParts.push("mechanism");
  if (vitalsCount > 0) bypassReasonParts.push("vitals / LOC");
  if (anatCount > 0) bypassReasonParts.push("anatomic");
  if (specialCount > 0) bypassReasonParts.push("special");
  const bypassReason = bypassReasonParts.length > 0 ? bypassReasonParts.join(" + ") : "no criteria selected";

  const detailLabel = (ids: string[], source: Criterion[]) =>
    ids.map((id) => source.find((c) => c.id === id)?.label ?? id).join(", ");

  const summaryChunks: string[] = [];
  if (meetsAnyCriteria) {
    const parts = [
      mechCount ? `mechanism: ${detailLabel(mechSelected, MECHANISM_CRITERIA)}` : null,
      vitalsCount ? `vital signs / LOC: ${detailLabel(vitalsSelected, VITALS_CRITERIA)}` : null,
      anatCount ? `anatomic injuries: ${detailLabel(anatSelected, ANATOMIC_CRITERIA)}` : null,
      specialCount ? `special considerations: ${detailLabel(specialSelected, SPECIAL_CRITERIA)}` : null,
    ].filter(Boolean);
    summaryChunks.push(`Trauma bypass screen (CPG 10.10) – ${parts.join("; ")}.`);
  } else {
    summaryChunks.push("Trauma bypass screen (CPG 10.10) – no criteria selected.");
  }
  if (nearestOnly) {
    summaryChunks.push("Bypass not feasible – nearest appropriate ED; consult CCD / trauma centre early where possible.");
  } else if (bypassRecommended) {
    summaryChunks.push("Meets trauma bypass criteria – notify CCD and transport directly to designated trauma centre if safe and within acceptable time.");
  } else {
    summaryChunks.push("Does not clearly meet major trauma bypass criteria – consider nearest ED and discuss with CCD if in doubt.");
  }
  summaryChunks.push(
    "In patients with TBI: aim for MAP 70–80 mmHg in isolated TBI, or MAP ≥65 mmHg if TBI with associated polytrauma (adults), with age-specific SBP in paediatrics as per CPG 2.6."
  );
  const summaryText = summaryChunks.join(" ");

  const resetAll = () => {
    setMechSelected([]);
    setVitalsSelected([]);
    setAnatSelected([]);
    setSpecialSelected([]);
    setNearestOnly(false);
  };

  // Outcome bar styling
  const outcomeStyle = nearestOnly
    ? { bar: "border-amber-500/60 bg-amber-950/60", label: "text-amber-300", badge: "bg-amber-500/20 text-amber-200 border-amber-500/40" }
    : bypassRecommended
    ? { bar: "border-orange-500/60 bg-orange-950/60", label: "text-orange-300", badge: "bg-orange-500/20 text-orange-200 border-orange-500/40" }
    : { bar: "border-slate-700 bg-slate-900/80", label: "text-slate-400", badge: "bg-slate-800 text-slate-300 border-slate-700" };

  const outcomeText = nearestOnly
    ? "Nearest ED — Bypass not feasible"
    : bypassRecommended
    ? "Bypass → Trauma Centre"
    : "No criteria selected";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-36">

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard/trauma"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-orange-400">
              Trauma · CPG 10.10
            </p>
            <h1 className="text-sm font-semibold leading-tight text-slate-50">
              Trauma Bypass Criteria
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {totalSelected > 0 && (
              <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-orange-300 border border-orange-500/30">
                {totalSelected} criteria
              </span>
            )}
            <button
              type="button"
              onClick={resetAll}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              aria-label="Reset all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pt-4">

        {/* ── Bypass feasibility toggle ──────────────────────────────── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Bypass feasibility
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNearestOnly(false)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-all ${
                !nearestOnly
                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600"
              }`}
            >
              <Navigation className={`h-4 w-4 shrink-0 ${!nearestOnly ? "text-emerald-400" : "text-slate-500"}`} />
              <span>Bypass feasible — Trauma centre reachable</span>
            </button>
            <button
              type="button"
              onClick={() => setNearestOnly(true)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-all ${
                nearestOnly
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-200"
                  : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600"
              }`}
            >
              <Hospital className={`h-4 w-4 shrink-0 ${nearestOnly ? "text-amber-400" : "text-slate-500"}`} />
              <span>Not feasible — Nearest ED only</span>
            </button>
          </div>
        </section>

        {/* ── Destination reminder ───────────────────────────────────── */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-[0.7rem] text-slate-400 space-y-0.5">
          <p><span className="font-semibold text-slate-300">Adults (≥14 yrs):</span> HGH Trauma Resuscitation Unit</p>
          <p><span className="font-semibold text-slate-300">Paediatrics (≤13 yrs):</span> Sidra Hospital Emergency Department</p>
          <p className="text-slate-500 mt-1">Deviation from bypass criteria must be authorised through CCD.</p>
        </section>

        {/* ── Criteria sections ─────────────────────────────────────── */}
        <CriteriaSection
          icon={AlertTriangle}
          title="Mechanism of Injury"
          criteria={MECHANISM_CRITERIA}
          selected={mechSelected}
          onToggle={(id) => toggle(id, mechSelected, setMechSelected)}
          color="orange"
        />

        <CriteriaSection
          icon={Activity}
          title="Vital Signs & Level of Consciousness"
          criteria={VITALS_CRITERIA}
          selected={vitalsSelected}
          onToggle={(id) => toggle(id, vitalsSelected, setVitalsSelected)}
          color="red"
        />

        <CriteriaSection
          icon={Layers}
          title="Anatomic Criteria"
          criteria={ANATOMIC_CRITERIA}
          selected={anatSelected}
          onToggle={(id) => toggle(id, anatSelected, setAnatSelected)}
          color="amber"
        />

        <CriteriaSection
          icon={Users}
          title="Special Patient / System Considerations"
          criteria={SPECIAL_CRITERIA}
          selected={specialSelected}
          onToggle={(id) => toggle(id, specialSelected, setSpecialSelected)}
          color="violet"
        />

        {/* ── MAP targets quick reference ───────────────────────────── */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-[0.7rem] text-slate-400 space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">TBI MAP targets (CPG 2.6)</p>
          <p><span className="font-semibold text-slate-300">Isolated TBI (adults):</span> MAP 70–80 mmHg · Paeds: (age × 2) + 70</p>
          <p><span className="font-semibold text-slate-300">TBI + polytrauma (adults):</span> MAP ≥65 mmHg · Paeds: (age × 2) + 70</p>
        </section>

      </main>

      {/* ── Sticky outcome bar ────────────────────────────────────────── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800">
        <div className={`mx-auto max-w-2xl rounded-2xl border px-4 py-3 transition-colors ${outcomeStyle.bar}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-sm font-bold ${outcomeStyle.label}`}>{outcomeText}</p>
              {meetsAnyCriteria && (
                <p className="text-[0.68rem] text-slate-400 truncate mt-0.5">
                  {bypassReason}
                </p>
              )}
            </div>
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      </div>

    </div>
  );
}
