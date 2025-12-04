"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Criterion = {
  id: string;
  label: string;
  helper?: string;
};

const PHYSIOLOGICAL_CRITERIA: Criterion[] = [
  {
    id: "gcs-13-or-less",
    label: "GCS ≤ 13",
    helper: "Newly reduced GCS in the context of trauma.",
  },
  {
    id: "sbp-below-90",
    label: "Adult SBP < 90 mmHg (or age-adjusted hypotension in paeds)",
    helper: "After obvious issues corrected (cuff position, movement, etc.).",
  },
  {
    id: "rr-critical",
    label: "Critical RR: < 10 /min or > 29 /min (or requiring ventilatory support)",
    helper: "Includes severe respiratory distress or need for assisted ventilation.",
  },
  {
    id: "needs-ventilation",
    label: "Requires airway/ventilatory support",
    helper: "Actual or impending airway compromise requiring BVM or advanced airway.",
  },
];

const ANATOMICAL_CRITERIA: Criterion[] = [
  {
    id: "penetrating-head-neck-torso",
    label: "Penetrating injury to head, neck, chest, abdomen or proximal extremities",
  },
  {
    id: "flail-chest",
    label: "Flail chest or severe chest wall injury",
  },
  {
    id: "two-or-more-long-bone-fractures",
    label: "Two or more proximal long-bone fractures",
    helper: "E.g. femur, humerus.",
  },
  {
    id: "pelvic-fracture",
    label: "Suspected pelvic ring fracture",
    helper: "e.g. pelvic instability, deformity, or mechanism strongly suggestive.",
  },
  {
    id: "amputation-proximal",
    label: "Amputation proximal to wrist or ankle",
  },
  {
    id: "open-depressed-skull",
    label: "Open or depressed skull fracture",
  },
  {
    id: "spinal-neurology",
    label: "New spinal cord deficit (paralysis or significant focal neurology)",
  },
];

const MECHANISM_CRITERIA: Criterion[] = [
  {
    id: "high-energy-mvc",
    label: "High-energy MVC / collision",
    helper: "e.g. high speed, intrusion into passenger compartment, ejection from vehicle.",
  },
  {
    id: "death-same-vehicle",
    label: "Death in the same vehicle or same incident",
  },
  {
    id: "pedestrian-struck",
    label: "Pedestrian or cyclist struck by vehicle",
  },
  {
    id: "fall-height",
    label: "Significant fall",
    helper: "Adult: >3 m or ~>2 storeys. Paeds: >2 m or >3 × child height (or as per CPG).",
  },
  {
    id: "explosion",
    label: "Blast / explosion or major crush injury",
  },
];

const SPECIAL_FACTORS: Criterion[] = [
  {
    id: "age-elderly",
    label: "Elderly patient (e.g. ≥65 years)",
    helper: "Lower threshold for trauma centre referral.",
  },
  {
    id: "pregnancy-20-weeks",
    label: "Pregnancy ≥ 20 weeks",
  },
  {
    id: "anticoagulated",
    label: "On anticoagulants or known coagulopathy",
    helper: "e.g. warfarin, DOACs, severe liver disease.",
  },
  {
    id: "multiple-comorbidities",
    label: "Significant comorbidities or frailty",
  },
  {
    id: "burns-with-trauma",
    label: "Significant burns with trauma",
    helper: "Consider both trauma and burns pathways.",
  },
];

export default function TraumaBypassPage() {
  const [physSelected, setPhysSelected] = useState<string[]>([]);
  const [anatSelected, setAnatSelected] = useState<string[]>([]);
  const [mechSelected, setMechSelected] = useState<string[]>([]);
  const [specialSelected, setSpecialSelected] = useState<string[]>([]);
  const [nearestOnly, setNearestOnly] = useState<boolean>(false);

  const toggle = (id: string, list: string[], setter: (ids: string[]) => void) => {
    if (list.includes(id)) {
      setter(list.filter((x) => x !== id));
    } else {
      setter([...list, id]);
    }
  };

  const physCount = physSelected.length;
  const anatCount = anatSelected.length;
  const mechCount = mechSelected.length;
  const specialCount = specialSelected.length;

  const hasMajorPhys = physCount > 0;
  const hasMajorAnat = anatCount > 0;
  const hasMechanismOnly = mechCount > 0 && !hasMajorPhys && !hasMajorAnat;
  const hasSpecialFactors = specialCount > 0;

  const bypassRecommended =
    !nearestOnly && (hasMajorPhys || hasMajorAnat || (hasMechanismOnly && hasSpecialFactors));

  const bypassReasonParts: string[] = [];
  if (hasMajorPhys) bypassReasonParts.push("physiological");
  if (hasMajorAnat) bypassReasonParts.push("anatomical");
  if (hasMechanismOnly) bypassReasonParts.push("mechanism");
  if (hasSpecialFactors) bypassReasonParts.push("special factors");

  const bypassReason =
    bypassReasonParts.length > 0 ? bypassReasonParts.join(" + ") : "no bypass criteria selected";

  // Summary string for PRF
  const detailLabel = (ids: string[], source: Criterion[]) =>
    ids
      .map((id) => source.find((c) => c.id === id)?.label ?? id)
      .join(", ");

  const parts: string[] = [];

  if (hasMajorPhys || hasMajorAnat || mechCount > 0 || hasSpecialFactors) {
    const physText = hasMajorPhys
      ? `physiological criteria: ${detailLabel(physSelected, PHYSIOLOGICAL_CRITERIA)}`
      : "no physiological criteria";
    const anatText = hasMajorAnat
      ? `anatomical criteria: ${detailLabel(anatSelected, ANATOMICAL_CRITERIA)}`
      : "no anatomical criteria";
    const mechText = mechCount
      ? `mechanism factors: ${detailLabel(mechSelected, MECHANISM_CRITERIA)}`
      : "no mechanism factors";
    const specialText = hasSpecialFactors
      ? `special factors: ${detailLabel(specialSelected, SPECIAL_FACTORS)}`
      : "no special factors";

    parts.push(`Trauma bypass screen – ${physText}; ${anatText}; ${mechText}; ${specialText}.`);
  } else {
    parts.push("Trauma bypass screen – no criteria selected.");
  }

  if (nearestOnly) {
    parts.push(
      "Bypass not feasible (nearest ED only) – treat as time-critical locally and confer with Clinical Coordination / CCP."
    );
  } else if (bypassRecommended) {
    parts.push(
      "Meets trauma bypass criteria – transport to designated trauma centre if safe and within acceptable time, with prenotification."
    );
  } else {
    parts.push(
      "Does not clearly meet major trauma bypass criteria – consider nearest ED and discuss with Clinical Coordination if in doubt."
    );
  }

  const summaryText = `${parts.join(
    " "
  )} (Trauma bypass quick ref – confirm against current major trauma CPG and local trauma centre network.)`;

  const resetAll = () => {
    setPhysSelected([]);
    setAnatSelected([]);
    setMechSelected([]);
    setSpecialSelected([]);
    setNearestOnly(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-500">
            Trauma
          </p>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Trauma bypass criteria
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Checklist-style reference for major trauma bypass decisions, combining physiological,
            anatomical, mechanism and special-factor criteria. Use alongside the major trauma CPG and
            in consultation with Clinical Coordination. This tool does not replace local transport
            policies.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <CopySummaryButton summaryText={summaryText} />
          <button
            type="button"
            onClick={resetAll}
            className="text-[0.7rem] rounded-full border border-slate-300 bg-slate-50 px-2 py-1 text-slate-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-300"
          >
            Reset
          </button>
          <Link
            href="/dashboard"
            className="text-[0.7rem] text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            ← Back to tools
          </Link>
        </div>
      </div>

      {/* Top info row */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-start">
        <div className="rounded-2xl border border-amber-300/70 bg-amber-50/80 p-3 text-xs shadow-sm dark:border-amber-500/70 dark:bg-amber-500/10 dark:text-amber-100 space-y-1.5">
          <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] mb-1">
            Principles
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Identify major trauma early and minimise time on scene – &quot;load and go&quot; for
              unstable patients.
            </li>
            <li>
              Where possible, bypass non-trauma facilities in favour of designated trauma centres,
              provided transport time is acceptable and airway/circulation can be maintained.
            </li>
            <li>
              If bypass is not feasible, transport to the nearest appropriate facility and confer with
              Clinical Coordination / trauma centre.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 space-y-2">
          <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Bypass feasibility
          </h2>
          <p>
            Consider distance, transport time, road conditions, scene safety and ability to maintain
            airway, breathing and circulation during transport.
          </p>
          <button
            type="button"
            onClick={() => setNearestOnly((v) => !v)}
            className={classNames(
              "mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.75rem] transition",
              nearestOnly
                ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:border-rose-400 dark:text-rose-100"
                : "border-slate-300 bg-slate-50 text-slate-700 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            )}
          >
            <span
              className={classNames(
                "h-2.5 w-2.5 rounded-full border",
                nearestOnly
                  ? "border-rose-500 bg-rose-500/80"
                  : "border-slate-400 bg-slate-100 dark:bg-slate-800"
              )}
            />
            <span>
              {nearestOnly
                ? "Bypass not feasible – nearest ED only"
                : "Bypass feasible – trauma centre reachable within acceptable time"}
            </span>
          </button>
        </div>
      </section>

      {/* Criteria sections */}
      <section className="grid gap-4 md:grid-cols-2 items-start">
        {/* Physiological */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Physiological criteria
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Any of these in a trauma patient usually indicate major trauma. Bypass to a trauma centre
            should be strongly considered if feasible.
          </p>
          <div className="mt-2 space-y-2">
            {PHYSIOLOGICAL_CRITERIA.map((item) => {
              const checked = physSelected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id, physSelected, setPhysSelected)}
                  className={classNames(
                    "w-full text-left rounded-xl border px-3 py-2.5 text-xs md:text-sm transition",
                    checked
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100"
                      : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={classNames(
                        "mt-0.5 h-3 w-3 rounded-full border",
                        checked
                          ? "border-emerald-500 bg-emerald-500/80"
                          : "border-slate-400 bg-slate-100 dark:bg-slate-800"
                      )}
                    />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.helper && (
                        <p className="mt-0.5 text-[0.7rem] text-slate-600 dark:text-slate-400">
                          {item.helper}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Anatomical */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Anatomical criteria
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Specific injury patterns associated with major trauma. These usually mandate trauma centre
            care where feasible.
          </p>
          <div className="mt-2 space-y-2">
            {ANATOMICAL_CRITERIA.map((item) => {
              const checked = anatSelected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id, anatSelected, setAnatSelected)}
                  className={classNames(
                    "w-full text-left rounded-xl border px-3 py-2.5 text-xs md:text-sm transition",
                    checked
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100"
                      : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={classNames(
                        "mt-0.5 h-3 w-3 rounded-full border",
                        checked
                          ? "border-emerald-500 bg-emerald-500/80"
                          : "border-slate-400 bg-slate-100 dark:bg-slate-800"
                      )}
                    />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.helper && (
                        <p className="mt-0.5 text-[0.7rem] text-slate-600 dark:text-slate-400">
                          {item.helper}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mechanism & special factors */}
      <section className="grid gap-4 md:grid-cols-2 items-start">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Mechanism of injury
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Mechanism alone may not mandate bypass, but concerning mechanisms plus clinical findings
            or special factors should prompt trauma centre consideration.
          </p>
          <div className="mt-2 space-y-2">
            {MECHANISM_CRITERIA.map((item) => {
              const checked = mechSelected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id, mechSelected, setMechSelected)}
                  className={classNames(
                    "w-full text-left rounded-xl border px-3 py-2.5 text-xs md:text-sm transition",
                    checked
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100"
                      : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={classNames(
                        "mt-0.5 h-3 w-3 rounded-full border",
                        checked
                          ? "border-emerald-500 bg-emerald-500/80"
                          : "border-slate-400 bg-slate-100 dark:bg-slate-800"
                      )}
                    />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.helper && (
                        <p className="mt-0.5 text-[0.7rem] text-slate-600 dark:text-slate-400">
                          {item.helper}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Special factors / lower threshold
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Consider a lower threshold for trauma centre bypass where these factors are present, even
            with less dramatic mechanism or physiology.
          </p>
          <div className="mt-2 space-y-2">
            {SPECIAL_FACTORS.map((item) => {
              const checked = specialSelected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id, specialSelected, setSpecialSelected)}
                  className={classNames(
                    "w-full text-left rounded-xl border px-3 py-2.5 text-xs md:text-sm transition",
                    checked
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100"
                      : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={classNames(
                        "mt-0.5 h-3 w-3 rounded-full border",
                        checked
                          ? "border-emerald-500 bg-emerald-500/80"
                          : "border-slate-400 bg-slate-100 dark:bg-slate-800"
                      )}
                    />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.helper && (
                        <p className="mt-0.5 text-[0.7rem] text-slate-600 dark:text-slate-400">
                          {item.helper}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary strip */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Overall interpretation
          </p>
          <p className="mt-1 text-xs md:text-sm">
            Bypass rationale: <span className="font-semibold">{bypassReason}</span>.{" "}
            {nearestOnly
              ? "Nearest ED only marked – consider early consultation with trauma centre / Clinical Coordination."
              : bypassRecommended
              ? "Criteria and feasibility favour trauma centre bypass if safe to do so."
              : "Consider nearest appropriate ED and discuss with Clinical Coordination if unsure."}
          </p>
        </div>
        <CopySummaryButton summaryText={summaryText} />
      </section>
    </div>
  );
}
