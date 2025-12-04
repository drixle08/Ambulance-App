"use client";

import { useMemo, useState } from "react";
import { CopySummaryButton } from "../../_components/CopySummaryButton";

type CriterionGroup = "core" | "comorbidity" | "alternative";

interface Criterion {
  id: string;
  label: string;
  detail?: string;
  group: CriterionGroup;
}

const CRITERIA: Criterion[] = [
  // Core arrest features
  {
    id: "medical-arrest",
    label: "Medical cardiac arrest",
    detail: "Non-traumatic aetiology as per CPG 2.9.",
    group: "core",
  },
  {
    id: "age-less-60",
    label: "Age < 60 years",
    detail: "Physiological age consistent with potential ECMO benefit.",
    group: "core",
  },
  {
    id: "witnessed",
    label: "Witnessed cardiac arrest",
    detail: "Collapse witnessed by bystander or ambulance crew.",
    group: "core",
  },
  {
    id: "immediate-cpr",
    label: "Immediate bystander/paramedic CPR",
    detail: "CPR initiated without delay after collapse.",
    group: "core",
  },
  {
    id: "initial-rhythm",
    label: "Initial rhythm VF / VT / PEA",
    detail: "As documented on the first available ECG rhythm check.",
    group: "core",
  },
  {
    id: "time-to-ed",
    label: "Time from arrest onset to estimated ED arrival ≤ 45 minutes",
    detail: "Includes scene time and transport time to an ECMO-capable ED.",
    group: "core",
  },
  {
    id: "etco2",
    label: "EtCO₂ > 10 mmHg",
    detail: "Sustained during ongoing high-quality CPR.",
    group: "core",
  },

  // Comorbidity / functional status block
  {
    id: "no-active-cancer",
    label: "NO active cancer or haematological disease",
    detail: "No known active malignancy or significant haematological disorder.",
    group: "comorbidity",
  },
  {
    id: "no-cardiac-disease",
    label: "NO significant cardiac disease (e.g., CHF)",
    detail: "No known severe chronic heart failure or similar end-stage cardiac disease.",
    group: "comorbidity",
  },
  {
    id: "no-pulmonary-disease",
    label: "NO significant pulmonary disease (e.g., COPD)",
    detail: "No known advanced chronic lung disease limiting functional capacity.",
    group: "comorbidity",
  },
  {
    id: "no-renal-failure",
    label: "NO renal failure and not on haemodialysis",
    detail: "No chronic renal failure requiring dialysis.",
    group: "comorbidity",
  },
  {
    id: "not-bedbound",
    label: "NOT a bedbound patient",
    detail: "Pre-arrest functional status allows independent or assisted mobility.",
    group: "comorbidity",
  },
  {
    id: "no-dementia",
    label: "NO dementia or advanced neurological disease",
    detail: "No severe neurodegenerative disease impacting function and prognosis.",
    group: "comorbidity",
  },
  {
    id: "no-prolonged-downtime",
    label: "NO prolonged down-time without CPR",
    detail: "No extended ‘no-flow’ period before CPR commenced.",
    group: "comorbidity",
  },

  // Alternative comorbidity pathway
  {
    id: "unknown-history-assume-well",
    label:
      "Medical history cannot be determined but CCP reasonably assumes no significant comorbidity",
    detail:
      "Treat as comorbidity free until proven otherwise, when clinical context supports this.",
    group: "alternative",
  },
];

type CriterionState = Record<string, boolean>;

function buildInitialState(): CriterionState {
  const state: CriterionState = {};
  for (const c of CRITERIA) {
    state[c.id] = false;
  }
  return state;
}

function ChecklistItem(props: {
  criterion: Criterion;
  checked: boolean;
  onToggle: () => void;
}) {
  const { criterion, checked, onToggle } = props;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80",
        checked
          ? "border-emerald-500/80 bg-emerald-500/10"
          : "border-slate-200 bg-white/80 hover:border-emerald-400/70 hover:bg-emerald-500/5 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-emerald-500/70",
      ].join(" ")}
    >
      <div
        className={[
          "mt-1 h-4 w-4 shrink-0 rounded-md border text-xs font-semibold",
          checked
            ? "border-emerald-500 bg-emerald-500 text-slate-950"
            : "border-slate-400 bg-slate-950/0 dark:border-slate-500",
        ].join(" ")}
      >
        {checked && (
          <span className="flex h-full w-full items-center justify-center">
            ✓
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-slate-900 dark:text-slate-50">
          {criterion.label}
        </span>
        {criterion.detail && (
          <span className="mt-0.5 text-xs text-slate-600 dark:text-slate-300/90">
            {criterion.detail}
          </span>
        )}
      </div>
    </button>
  );
}

export default function ECMOCriteriaPage() {
  const [checked, setChecked] = useState<CriterionState>(() =>
    buildInitialState()
  );

  const coreCriteria = useMemo(
    () => CRITERIA.filter((c) => c.group === "core"),
    []
  );
  const comorbidityCriteria = useMemo(
    () => CRITERIA.filter((c) => c.group === "comorbidity"),
    []
  );
  const alternativeCriterion = useMemo(
    () => CRITERIA.find((c) => c.group === "alternative"),
    []
  );

  const toggleCriterion = (id: string) => {
    setChecked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const resetChecklist = () => {
    setChecked(buildInitialState());
  };

  const {
    anyChecked,
    coreMetCount,
    coreTotal,
    coreMet,
    comorbidityMetCount,
    comorbidityTotal,
    comorbidityMet,
    alternativeSelected,
    allInclusionMet,
  } = useMemo(() => {
    const anyCheckedInner = Object.values(checked).some(Boolean);

    const coreTotalInner = coreCriteria.length;
    const coreMetCountInner = coreCriteria.filter(
      (c) => checked[c.id]
    ).length;
    const coreMetInner = coreMetCountInner === coreTotalInner;

    const comorbidityTotalInner = comorbidityCriteria.length;
    const comorbidityMetCountInner = comorbidityCriteria.filter(
      (c) => checked[c.id]
    ).length;
    const comorbidityMetInner =
      comorbidityMetCountInner === comorbidityTotalInner;

    const alternativeSelectedInner = alternativeCriterion
      ? !!checked[alternativeCriterion.id]
      : false;

    const allInclusionMetInner =
      coreMetInner && (comorbidityMetInner || alternativeSelectedInner);

    return {
      anyChecked: anyCheckedInner,
      coreMetCount: coreMetCountInner,
      coreTotal: coreTotalInner,
      coreMet: coreMetInner,
      comorbidityMetCount: comorbidityMetCountInner,
      comorbidityTotal: comorbidityTotalInner,
      comorbidityMet: comorbidityMetInner,
      alternativeSelected: alternativeSelectedInner,
      allInclusionMet: allInclusionMetInner,
    };
  }, [checked, coreCriteria, comorbidityCriteria, alternativeCriterion]);

  let statusTitle = "Start by ticking the criteria above";
  let statusBody: string[] = [
    "Apply this checklist to all adult medical cardiac arrests.",
    "Any patient meeting ALL inclusion criteria should be considered a candidate for e-CPR (CPG 2.9).",
  ];
  let statusTone: "neutral" | "positive" | "warning" = "neutral";

  if (anyChecked) {
    if (allInclusionMet) {
      statusTitle = "Meets e-CPR inclusion criteria";
      statusBody = [
        "Patient meets ALL ECMO CPR (e-CPR) inclusion criteria.",
        "Treat as an e-CPR candidate and liaise early with the ECMO-capable centre as per CPG 2.9.",
        "Maintain high-quality CPR, minimise no-flow time, and expedite transport to the designated ECMO facility.",
      ];
      statusTone = "positive";
    } else if (coreMet && !comorbidityMet && !alternativeSelected) {
      statusTitle =
        "Core arrest features met; comorbidity/functional criteria not fully met";
      statusBody = [
        "The cardiac arrest characteristics are favourable, but significant comorbidities or functional limitations may limit e-CPR benefit.",
        "Generally, this does NOT meet the full e-CPR inclusion criteria in CPG 2.9.",
        "Consider discussion with the on-call CCP/medical control for borderline cases.",
      ];
      statusTone = "warning";
    } else if (!coreMet) {
      statusTitle = "Does NOT meet core e-CPR inclusion criteria";
      statusBody = [
        "One or more core inclusion criteria are not met (age, witnessed status, immediate CPR, rhythm, EtCO₂, or time to ED).",
        "Manage as per standard cardiac arrest CPG (2.8) and ROSC care (2.6).",
        "e-CPR is generally not indicated where core criteria are not satisfied.",
      ];
      statusTone = "warning";
    } else {
      statusTitle = "Criteria partially met – does NOT meet full e-CPR checklist";
      statusBody = [
        "Some e-CPR checklist items are ticked, but the patient does not meet ALL inclusion criteria.",
        "Continue standard cardiac arrest management; e-CPR is unlikely to be appropriate.",
        "If in doubt, discuss with CCP/medical control and document the rationale.",
      ];
      statusTone = "warning";
    }
  }

  const summaryText = useMemo(() => {
    if (!anyChecked) {
      return (
        "ECMO CPR (e-CPR) checklist used; criteria not yet completed at time of documentation."
      );
    }

    if (allInclusionMet) {
      return (
        "ECMO CPR (e-CPR) checklist: ALL inclusion criteria met (core and comorbidity/functional) – treat as e-CPR candidate and liaise with ECMO centre as per CPG 2.9."
      );
    }

    return (
      `ECMO CPR (e-CPR) checklist: criteria partially met (core ${coreMetCount}/${coreTotal}, comorbidity ${comorbidityMetCount}/${comorbidityTotal}${
        alternativeSelected ? ", history unknown but assumed comorbidity-free" : ""
      }) – does NOT meet full e-CPR inclusion criteria; managed as standard cardiac arrest with consideration of expert consultation.`
    );
  }, [
    anyChecked,
    allInclusionMet,
    coreMetCount,
    coreTotal,
    comorbidityMetCount,
    comorbidityTotal,
    alternativeSelected,
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 pb-20 md:px-6 lg:px-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Resuscitation &amp; ECMO
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
            ECMO CPR (e-CPR) Inclusion Criteria
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/90">
            CPG 2.9: Apply this checklist to adult medical cardiac arrests. Any
            patient meeting{" "}
            <span className="font-semibold">all</span> inclusion criteria
            should be considered an e-CPR candidate and discussed with the
            ECMO-capable centre.
          </p>
        </div>
        <div className="mt-3 flex flex-col items-end gap-2 md:mt-0">
          <CopySummaryButton summaryText={summaryText} />
          <button
            type="button"
            onClick={resetChecklist}
            className="text-xs font-medium text-slate-500 underline underline-offset-4 hover:text-slate-300 dark:text-slate-400"
          >
            Reset checklist
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            1. Core arrest features
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300/90">
            Tick if the criterion is clearly met at the time of assessment.
          </p>
          <div className="mt-3 space-y-2">
            {coreCriteria.map((c) => (
              <ChecklistItem
                key={c.id}
                criterion={c}
                checked={checked[c.id]}
                onToggle={() => toggleCriterion(c.id)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            2. Comorbidities &amp; functional status
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300/90">
            These criteria aim to exclude patients with poor baseline prognosis.
          </p>
          <div className="mt-3 space-y-2">
            {comorbidityCriteria.map((c) => (
              <ChecklistItem
                key={c.id}
                criterion={c}
                checked={checked[c.id]}
                onToggle={() => toggleCriterion(c.id)}
              />
            ))}

            {alternativeCriterion && (
              <>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <span className="h-px flex-1 bg-slate-300/60 dark:bg-slate-700" />
                  <span>OR</span>
                  <span className="h-px flex-1 bg-slate-300/60 dark:bg-slate-700" />
                </div>
                <ChecklistItem
                  criterion={alternativeCriterion}
                  checked={checked[alternativeCriterion.id]}
                  onToggle={() => toggleCriterion(alternativeCriterion.id)}
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Only tick this alternative if there is genuinely insufficient
                  background information but the CCP reasonably judges the
                  patient to be comorbidity free based on the available
                  context.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          3. Checklist status &amp; guideline interpretation
        </h2>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300/90">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800/80">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Core: {coreMetCount}/{coreTotal} met
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800/80">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Comorbidity: {comorbidityMetCount}/{comorbidityTotal} met
          </span>
          {alternativeCriterion && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800/80">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  alternativeSelected
                    ? "bg-emerald-500"
                    : "bg-slate-400 dark:bg-slate-500",
                ].join(" ")}
              />
              Alternative history assumption{" "}
              {alternativeSelected ? "selected" : "not selected"}
            </span>
          )}
        </div>

        <div
          className={[
            "mt-4 rounded-xl border px-3 py-3 text-sm",
            statusTone === "positive"
              ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-100"
              : statusTone === "warning"
              ? "border-amber-500/70 bg-amber-500/10 text-amber-50"
              : "border-slate-500/60 bg-slate-900/40 text-slate-100",
          ].join(" ")}
        >
          <p className="font-semibold">{statusTitle}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {statusBody.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>

        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          This tool summarises CPG 2.9 ECMO CPR pathway inclusion criteria. It
          does not replace clinical judgement or consultation with the ECMO
          centre/medical control. Always document your reasoning in the PRF.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          4. Practical prehospital triggers to consider ECMO centre / e-CPR
        </h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300/90">
          In practice, ECMO CPR is most likely to be appropriate when ALL of the
          following are present:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-300/90">
          <li>
            Younger adult (&lt; 60 years) with previously good functional
            status and no major comorbidities.
          </li>
          <li>
            Witnessed medical cardiac arrest with immediate, high-quality
            bystander/paramedic CPR.
          </li>
          <li>
            Initial rhythm VF/VT or PEA, with EtCO₂ &gt; 10 mmHg during
            resuscitation, suggesting effective CPR.
          </li>
          <li>
            Time from collapse to arrival at an ECMO-capable ED expected to be
            ≤ 45 minutes.
          </li>
          <li>
            No clear exclusion factors such as advanced malignancy, end-stage
            heart/lung/renal disease, bedbound status, or severe dementia.
          </li>
        </ul>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          When these conditions are met, prioritise early notification of the
          ECMO-capable facility, minimise scene time, maintain high-quality CPR
          and EtCO₂, and follow the adult cardiac arrest (2.8) and ROSC (2.6)
          CPGs.
        </p>
      </section>
    </div>
  );
}
