"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type Criterion = {
  id: string;
  label: string;
  helper?: string;
};

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const qSOFA_CRITERIA: Criterion[] = [
  {
    id: "alt-mental-status",
    label: "Altered mental status (GCS < 15)",
    helper: "New confusion, agitation, or reduced GCS in the context of suspected infection.",
  },
  {
    id: "sbp-100",
    label: "SBP ≤ 100 mmHg",
    helper: "Measured on scene or during transport, after correcting obvious technical issues.",
  },
  {
    id: "rr-22",
    label: "RR ≥ 22 /min",
    helper: "Tachypnoea is a very common early sign of sepsis.",
  },
];

const PAEDS_SEPSIS_CRITERIA: Criterion[] = [
  {
    id: "paeds-tachypnoea",
    label: "Tachypnoea or increased work of breathing",
    helper: "Age-adjusted RR elevated, recession / grunting / nasal flaring.",
  },
  {
    id: "paeds-perfusion",
    label: "Poor perfusion",
    helper: "Prolonged capillary refill, cool peripheries, mottling, weak pulses.",
  },
  {
    id: "paeds-mental-status",
    label: "Altered mental status",
    helper: "Irritable, lethargic, drowsy or reduced AVPU/GCS.",
  },
  {
    id: "paeds-temp",
    label: "Fever or hypothermia",
    helper: "Measured temperature abnormal for age, or strong clinical suspicion.",
  },
  {
    id: "paeds-hypotension",
    label: "Hypotension for age",
    helper: "SBP below age-appropriate normal range on CPG vitals chart.",
  },
  {
    id: "paeds-risk-factors",
    label: "High-risk history",
    helper: "Immunocompromised, very young (<3 months), recent surgery/trauma, or re-presentation within 48 hours.",
  },
];

const QEWS_TRIGGERS: Criterion[] = [
  {
    id: "qews-4plus",
    label: "QEWS ≥ 4",
    helper: "Marker of increased clinical risk – requires senior review / CCP support as per CPG 1.8.",
  },
  {
    id: "qews-single-red",
    label: "Any single parameter in the red zone",
    helper: "Treat as time-critical regardless of total QEWS.",
  },
  {
    id: "qews-clinical-concern",
    label: "Clinical concern despite QEWS < 4",
    helper: "“Gut feeling” or deteriorating trend should prompt escalation even with low score.",
  },
];

export default function SepsisReferencePage() {
  const [qSofaSelected, setQSofaSelected] = useState<string[]>([]);
  const [paedsSelected, setPaedsSelected] = useState<string[]>([]);
  const [qewsSelected, setQewsSelected] = useState<string[]>([]);

  const toggle = (id: string, list: string[], setter: (ids: string[]) => void) => {
    if (list.includes(id)) {
      setter(list.filter((x) => x !== id));
    } else {
      setter([...list, id]);
    }
  };

  const qSofaScore = qSofaSelected.length;
  const paedsScore = paedsSelected.length;
  const hasQewsTrigger = qewsSelected.length > 0;

  const adultHighRisk = qSofaScore >= 2;
  const paedsHighRisk = paedsScore >= 2;
  const anyHighRisk = adultHighRisk || paedsHighRisk || hasQewsTrigger;

  const summaryParts: string[] = [];

  if (qSofaScore > 0) {
    summaryParts.push(`adult qSOFA ${qSofaScore}/3`);
  } else {
    summaryParts.push("adult qSOFA 0/3");
  }

  if (paedsSelected.length > 0) {
    summaryParts.push(`paediatric sepsis criteria ${paedsScore} checked`);
  } else {
    summaryParts.push("no paediatric sepsis criteria checked");
  }

  if (hasQewsTrigger) {
    summaryParts.push(
      `QEWS trigger(s): ${qewsSelected
        .map((id) => QEWS_TRIGGERS.find((c) => c.id === id)?.label ?? id)
        .join(", ")}`
    );
  } else {
    summaryParts.push("no QEWS triggers selected");
  }

  const escalationText = anyHighRisk
    ? "High-risk sepsis: treat as time-critical, consider early fluids as per CPG, and prenotify receiving hospital."
    : "Monitor closely, repeat vitals and QEWS, and reassess if clinical condition worsens.";

  const summaryText = `Sepsis screen: ${summaryParts.join(
    "; "
  )}. ${escalationText} (CPG 1.8 & 6.6).`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-500">
            Reference
          </p>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Sepsis & QEWS quick reference
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Checklist-style support for suspected sepsis, combining adult qSOFA, paediatric sepsis
            criteria, and QEWS triggers. Use alongside the full sepsis and QEWS CPGs. This tool does
            not replace clinical judgement or local protocols.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <CopySummaryButton summaryText={summaryText} />
          <Link
            href="/dashboard"
            className="text-[0.7rem] text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            ← Back to tools
          </Link>
        </div>
      </div>

      {/* Adult qSOFA section */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-start">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Adult qSOFA (suspected infection)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Use in adults with suspected infection as a predictor of severity/mortality. qSOFA ≥2 with
            suspected sepsis = high risk. Manage as time-critical, following sepsis and shock CPGs.
          </p>

          <div className="mt-2 space-y-2">
            {qSOFA_CRITERIA.map((item) => {
              const checked = qSofaSelected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id, qSofaSelected, setQSofaSelected)}
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

          <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold">qSOFA score: {qSofaScore}/3.</span>{" "}
            qSOFA ≥2 with suspected infection = high-risk sepsis/septic shock. Escalate, treat ABCs,
            and prenotify receiving hospital.
          </p>
        </div>

        {/* Adult & general notes */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-amber-300/70 bg-amber-50/80 p-3 text-xs shadow-sm dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100">
            <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] mb-1">
              Suspect sepsis when
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>Unwell patient with suspected or confirmed infection.</li>
              <li>Tachypnoea, hypotension or altered mental status without another clear cause.</li>
              <li>High-risk history: immunocompromised, extremes of age, recent surgery/trauma, or re-presentation within 48 hours.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 space-y-1.5">
            <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Prehospital sepsis priorities
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>Early recognition using qSOFA / paediatric sepsis tool and QEWS.</li>
              <li>Support airway and breathing; titrate oxygen to CPG targets (avoid hyperoxia).</li>
              <li>Assess circulation, treat hypotension and shock (fluids as per CPG; avoid fluid overload).</li>
              <li>Obtain IV/IO access where indicated; monitor EtCO₂ and lactate if available.</li>
              <li>Frequent vital signs, glucose check, temperature and mental status reassessment.</li>
              <li>Rapid transport to appropriate facility with prenotification for high-risk sepsis.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Paediatric sepsis section */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-start">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Paediatric sepsis screening tool
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Use in children with suspected infection. Two or more criteria with clinical concern =
            suspected sepsis. Treat as time-critical and follow paediatric shock/fluids guidance in
            the CPG.
          </p>

          <div className="mt-2 space-y-2">
            {PAEDS_SEPSIS_CRITERIA.map((item) => {
              const checked = paedsSelected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id, paedsSelected, setPaedsSelected)}
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

          <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold">
              Paediatric criteria checked: {paedsScore} / {PAEDS_SEPSIS_CRITERIA.length}.
            </span>{" "}
            Two or more criteria with suspected infection should prompt sepsis treatment pathway
            and rapid transport.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 space-y-2">
          <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Paediatric red flags
          </h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Any signs of septic shock: hypotension, poor perfusion, altered consciousness.</li>
            <li>Severe respiratory distress, apnoeic episodes, or cyanosis.</li>
            <li>Non-blanching rash or purpura.</li>
            <li>Very young age (especially &lt;3 months) with fever, hypothermia, or lethargy.</li>
          </ul>
        </div>
      </section>

      {/* QEWS triggers */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          QEWS triggers & escalation (CPG 1.8)
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          QEWS is calculated once the first full set of vital signs is obtained. A QEWS score of ≥4 is
          a marker of increased clinical risk. Request CCP assistance where appropriate, and manage
          the patient according to the relevant CPGs.
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {QEWS_TRIGGERS.map((item) => {
            const checked = qewsSelected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id, qewsSelected, setQewsSelected)}
                className={classNames(
                  "inline-flex items-start gap-2 rounded-full border px-3 py-1.5 text-[0.7rem] md:text-xs transition",
                  checked
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                )}
              >
                <span
                  className={classNames(
                    "mt-[0.1rem] h-2 w-2 rounded-full border",
                    checked
                      ? "border-emerald-500 bg-emerald-500/80"
                      : "border-slate-400 bg-slate-100 dark:bg-slate-800"
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold">
            Escalation:{" "}
            {hasQewsTrigger
              ? "QEWS trigger selected – consider CCP support, increased monitoring frequency, and time-critical transport."
              : "No QEWS triggers selected – continue routine monitoring, but reassess with any deterioration."}
          </span>
        </p>
      </section>

      {/* Summary strip */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            PRF summary
          </p>
          <p className="mt-1 text-xs md:text-sm">{summaryText}</p>
        </div>
        <CopySummaryButton summaryText={summaryText} />
      </section>
    </div>
  );
}
