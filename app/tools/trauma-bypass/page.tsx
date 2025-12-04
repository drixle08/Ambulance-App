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

// CPG 10.10 – MECHANISM OF INJURY
const MECHANISM_CRITERIA: Criterion[] = [
  {
    id: "falls-adult",
    label: "Adult fall ≥6 m (≥20 ft or 2 stories)",
  },
  {
    id: "falls-paeds",
    label: "Paediatric fall ≥3 m (≥10 ft or 1 story) or ≥2 × patient height",
  },
  {
    id: "falls-animal",
    label: "Red (T1) or Yellow (T2) code patient that fell from a horse, camel or similar animal",
  },
  {
    id: "mvc-death",
    label:
      "Red (T1) or Yellow (T2) MVC with traumatic death in the same vehicle (except bus / mini-bus)",
  },
  {
    id: "mvc-intrusion",
    label:
      "Red (T1) or Yellow (T2) MVC with intrusion ≥30 cm into occupant compartment or ≥45 cm at any site",
  },
  {
    id: "mvc-ejection",
    label: "Ejection (partial or complete) from vehicle, including ATV-type vehicles",
  },
  {
    id: "mvc-trapped",
    label: "Person trapped in or under a vehicle or extrication ≥20 minutes",
  },
  {
    id: "mvc-rollover",
    label: "Red (T1) or Yellow (T2) MVC rollover with roof deformity ≥40 cm",
  },
  {
    id: "moto",
    label: "Red (T1) or Yellow (T2) motorcycle accident with speed ≥30 km/hr",
  },
  {
    id: "ped-cyclist",
    label:
      "Red (T1) or Yellow (T2) pedestrian / paediatric / bicyclist struck (thrown / run over / impact ≥20 km/hr)",
  },
  {
    id: "burns-trauma",
    label:
      "Burns with evidence of trauma OR ≥20% BSA in adults / ≥10% BSA in paediatrics (excluding isolated superficial extremity burns) or significant neck / facial burns with airway risk",
  },
  {
    id: "hanging",
    label: "Hanging or attempted hanging with evidence of trauma",
    helper: "e.g. fall greater than patient height or obvious spinal deformity",
  },
  {
    id: "drowning",
    label: "Drowning or near drowning with evidence of trauma",
    helper: "e.g. diving into shallow water",
  },
];

// CPG 10.10 – VITAL SIGNS AND LEVEL OF CONSCIOUSNESS
const VITALS_CRITERIA: Criterion[] = [
  {
    id: "gcs-under-15",
    label: "GCS < 15",
    helper: "Consider effects of alcohol / drugs but treat as major trauma until proven otherwise.",
  },
  {
    id: "sbp-adult-low",
    label: "Sustained SBP < 90 mmHg in adults",
  },
  {
    id: "sbp-paeds-low",
    label: "Sustained SBP < age-specific normal value in paediatrics",
  },
  {
    id: "sbp-elderly-low",
    label: "Sustained SBP < 110 mmHg in patients ≥65 years old",
  },
  {
    id: "rr-adult",
    label: "RR <10 or >25 breaths / minute for adults",
  },
  {
    id: "rr-infant",
    label: "Infants to 1 year old RR <20 breaths / minute",
  },
  {
    id: "resp-assist",
    label: "Any patient requiring respiratory assistance",
  },
];

// CPG 10.10 – ANATOMIC CRITERIA (PATTERN OF INJURY)
const ANATOMIC_CRITERIA: Criterion[] = [
  {
    id: "chest-instability",
    label:
      "Chest wall instability or deformity, respiratory distress, subcutaneous emphysema or suspected multiple rib fractures",
  },
  {
    id: "traumatic-amputation",
    label: "Traumatic amputation, excluding digits and toes",
  },
  {
    id: "penetrating-trauma",
    label: "Penetrating trauma to head, neck, torso or extremities above elbow or knee",
  },
  {
    id: "open-skull",
    label: "Open and/or depressed skull fracture",
  },
  {
    id: "pelvic-fracture",
    label: "Suspected pelvic fracture / unstable pelvis",
  },
  {
    id: "multiple-long-bones",
    label: "Multiple long bone fractures (femur and/or humerus)",
  },
  {
    id: "isolated-femur",
    label:
      "Isolated femur fracture (excluding isolated pathologic femur fracture in elderly >65 years)",
  },
  {
    id: "threatened-limb",
    label: "Crushed, degloved, mangled or pulseless extremity (threatened limb)",
  },
  {
    id: "spinal-neuro",
    label:
      "Neurological deficit in patients with spinal trauma or suspected spinal injury",
  },
  {
    id: "trauma-arrest",
    label:
      "Trauma arrest where decision made to continue resuscitation to hospital / sustained ROSC following trauma arrest",
  },
];

// CPG 10.10 – SPECIAL PATIENT OR SYSTEM CONSIDERATIONS
const SPECIAL_CRITERIA: Criterion[] = [
  {
    id: "special-elderly",
    label:
      "Significant trauma, none of the above criteria, patient ≥65 years old",
  },
  {
    id: "special-pregnancy",
    label:
      "Significant trauma, none of the above criteria, pregnant ≥20 weeks gestation",
  },
  {
    id: "special-concern",
    label:
      "Reasonable concern despite clearing all criteria, following Clinical Desk / CCD notification",
  },
];

export default function TraumaBypassPage() {
  const [mechSelected, setMechSelected] = useState<string[]>([]);
  const [vitalsSelected, setVitalsSelected] = useState<string[]>([]);
  const [anatSelected, setAnatSelected] = useState<string[]>([]);
  const [specialSelected, setSpecialSelected] = useState<string[]>([]);
  const [nearestOnly, setNearestOnly] = useState<boolean>(false);

  const toggle = (
    id: string,
    list: string[],
    setter: (ids: string[]) => void
  ) => {
    if (list.includes(id)) {
      setter(list.filter((x) => x !== id));
    } else {
      setter([...list, id]);
    }
  };

  const mechCount = mechSelected.length;
  const vitalsCount = vitalsSelected.length;
  const anatCount = anatSelected.length;
  const specialCount = specialSelected.length;

  const meetsAnyCriteria =
    mechCount > 0 || vitalsCount > 0 || anatCount > 0 || specialCount > 0;

  // CPG 10.10: If ONE or MORE criteria are met and bypass is feasible → go to trauma centre.
  const bypassRecommended = meetsAnyCriteria && !nearestOnly;

  const bypassReasonParts: string[] = [];
  if (mechCount > 0) bypassReasonParts.push("mechanism of injury");
  if (vitalsCount > 0) bypassReasonParts.push("vital signs / LOC");
  if (anatCount > 0) bypassReasonParts.push("anatomic pattern of injury");
  if (specialCount > 0) bypassReasonParts.push("special patient / system considerations");

  const bypassReason =
    bypassReasonParts.length > 0
      ? bypassReasonParts.join(" + ")
      : "no trauma bypass criteria selected";

  const detailLabel = (ids: string[], source: Criterion[]) =>
    ids
      .map((id) => source.find((c) => c.id === id)?.label ?? id)
      .join(", ");

  const summaryChunks: string[] = [];

  if (meetsAnyCriteria) {
    const mechText = mechCount
      ? `mechanism: ${detailLabel(mechSelected, MECHANISM_CRITERIA)}`
      : "mechanism: none selected";
    const vitalsText = vitalsCount
      ? `vital signs / LOC: ${detailLabel(vitalsSelected, VITALS_CRITERIA)}`
      : "vital signs / LOC: none selected";
    const anatText = anatCount
      ? `anatomic injuries: ${detailLabel(anatSelected, ANATOMIC_CRITERIA)}`
      : "anatomic injuries: none selected";
    const specialText = specialCount
      ? `special considerations: ${detailLabel(specialSelected, SPECIAL_CRITERIA)}`
      : "special considerations: none selected";

    summaryChunks.push(
      `Trauma bypass screen (CPG 10.10) – ${mechText}; ${vitalsText}; ${anatText}; ${specialText}.`
    );
  } else {
    summaryChunks.push("Trauma bypass screen (CPG 10.10) – no criteria selected.");
  }

  if (nearestOnly) {
    summaryChunks.push(
      "Bypass not feasible – nearest appropriate ED only; consult CCD / trauma centre early where possible."
    );
  } else if (bypassRecommended) {
    summaryChunks.push(
      "Meets trauma bypass criteria – notify CCD and transport directly to designated trauma centre if safe and within acceptable time."
    );
  } else {
    summaryChunks.push(
      "Does not clearly meet major trauma bypass criteria – consider nearest ED and discuss with CCD if in doubt."
    );
  }

  // CPG 2.6 ROSC – MAP targets in TBI (we surface this as a reminder here)
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-500">
            Trauma
          </p>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Trauma bypass criteria (CPG 10.10)
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            If one or more of the listed criteria are met, notify the CCD and transport adults (≥14 years)
            directly to the HGH Trauma Resuscitation Unit and paediatrics (≤13 years) directly to Sidra
            Hospital Emergency Department. If none of the criteria are met, transport to the nearest
            emergency department. Deviation from these criteria must be authorised through the CCD.
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

      {/* Principles + feasibility + MAP targets */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-start">
        <div className="rounded-2xl border border-amber-300/70 bg-amber-50/80 p-3 text-xs shadow-sm dark:border-amber-500/70 dark:bg-amber-500/10 dark:text-amber-100 space-y-1.5">
          <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] mb-1">
            Major trauma principles
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Identify major trauma early and minimise time on scene – unstable patients are usually
              “load and go”.
            </li>
            <li>
              Where feasible, bypass non-trauma facilities in favour of designated trauma centres if
              transport time and patient condition allow.
            </li>
            <li>
              If bypass is not feasible, transport to the nearest appropriate facility and confer with CCD /
              trauma centre.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 space-y-2.5">
          <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Bypass feasibility & MAP targets
          </h2>
          <p>
            Consider distance, transport time, road conditions, scene safety and your ability to maintain
            airway, breathing and circulation during transport when deciding if bypass is feasible.
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

          <div className="mt-2 rounded-2xl border border-slate-300/70 bg-white/80 p-2.5 dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              MAP targets in TBI (CPG 2.6 special notes)
            </p>
            <ul className="mt-1 list-disc pl-4 space-y-1">
              <li>
                <span className="font-semibold">Isolated TBI (adults):</span> aim for MAP{" "}
                <span className="font-semibold">70–80 mmHg</span>. In paediatrics, maintain age-specific
                SBP using (age × 2) + 70.
              </li>
              <li>
                <span className="font-semibold">TBI with associated polytrauma (adults):</span> aim for
                MAP <span className="font-semibold">≥65 mmHg</span>. In paediatrics, maintain age-specific
                SBP using (age × 2) + 70.
              </li>
              <li>
                Avoid large swings in BP; use small fluid boluses and vasopressors as per CPG to achieve
                targets.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mechanism & vitals */}
      <section className="grid gap-4 md:grid-cols-2 items-start">
        {/* Mechanism of injury */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Mechanism of injury (CPG 10.10)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            If any of these mechanisms are present in a trauma patient, consider them as meeting trauma
            bypass criteria when clinically appropriate.
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

        {/* Vitals & LOC */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Vital signs and level of consciousness
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            CPG 10.10 lists these abnormalities in GCS, blood pressure and respiratory rate as major
            trauma bypass criteria.
          </p>
          <div className="mt-2 space-y-2">
            {VITALS_CRITERIA.map((item) => {
              const checked = vitalsSelected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id, vitalsSelected, setVitalsSelected)}
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

      {/* Anatomic + Special considerations */}
      <section className="grid gap-4 md:grid-cols-2 items-start">
        {/* Anatomic criteria */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Anatomic criteria (pattern of injury)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            These specific injury patterns are strongly associated with major trauma and usually warrant
            trauma centre care where feasible.
          </p>
          <div className="mt-2 space-y-2">
            {ANATOMIC_CRITERIA.map((item) => {
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

        {/* Special patient / system considerations */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Special patient or system considerations
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            CPG 10.10 allows bypass for significant trauma not fitting other criteria when age, pregnancy
            or system-level concern increase risk.
          </p>
          <div className="mt-2 space-y-2">
            {SPECIAL_CRITERIA.map((item) => {
              const checked = specialSelected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    toggle(item.id, specialSelected, setSpecialSelected)
                  }
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
              ? "Bypass marked as not feasible – transport to nearest appropriate ED and consider early contact with CCD / trauma centre."
              : bypassRecommended
              ? "Meets CPG 10.10 trauma bypass criteria with feasible route to trauma centre."
              : "Does not clearly meet major trauma bypass criteria – consider nearest ED and discuss with CCD if unsure."}
          </p>
        </div>
        <CopySummaryButton summaryText={summaryText} />
      </section>
    </div>
  );
}
