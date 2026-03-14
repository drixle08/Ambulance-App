"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  Circle,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Activity,
  XCircle,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

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
    detail: "Non-traumatic aetiology (CPG 2.9).",
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
    label: "Immediate bystander / paramedic CPR",
    detail: "CPR initiated without delay after collapse.",
    group: "core",
  },
  {
    id: "initial-rhythm",
    label: "Initial rhythm VF / VT / PEA",
    detail: "As documented on first available ECG rhythm check.",
    group: "core",
  },
  {
    id: "time-to-ed",
    label: "Arrest onset → estimated ED arrival ≤ 45 min",
    detail: "Includes scene time and transport to an ECMO-capable ED.",
    group: "core",
  },
  {
    id: "etco2",
    label: "EtCO₂ > 10 mmHg",
    detail: "Sustained during ongoing high-quality CPR.",
    group: "core",
  },

  // Comorbidity / functional status (exclusion — all must be ticked = confirmed absent)
  {
    id: "no-active-cancer",
    label: "NO active cancer or haematological disease",
    detail: "No known active malignancy or significant haematological disorder.",
    group: "comorbidity",
  },
  {
    id: "no-cardiac-disease",
    label: "NO significant cardiac disease (e.g. CHF)",
    detail: "No known severe chronic heart failure or end-stage cardiac disease.",
    group: "comorbidity",
  },
  {
    id: "no-pulmonary-disease",
    label: "NO significant pulmonary disease (e.g. COPD)",
    detail: "No known advanced chronic lung disease limiting function.",
    group: "comorbidity",
  },
  {
    id: "no-renal-failure",
    label: "NO renal failure / not on haemodialysis",
    detail: "No chronic renal failure requiring dialysis.",
    group: "comorbidity",
  },
  {
    id: "not-bedbound",
    label: "NOT bedbound pre-arrest",
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
    label: "NO prolonged downtime without CPR",
    detail: "No extended 'no-flow' period before CPR commenced.",
    group: "comorbidity",
  },

  // Alternative pathway
  {
    id: "unknown-history-assume-well",
    label: "History unknown — CCP reasonably assumes no significant comorbidity",
    detail:
      "Treat as comorbidity-free when clinical context supports this and history cannot be obtained.",
    group: "alternative",
  },
];

type CriterionState = Record<string, boolean>;

function buildInitialState(): CriterionState {
  const state: CriterionState = {};
  for (const c of CRITERIA) state[c.id] = false;
  return state;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ECMOCriteriaPage() {
  const [checked, setChecked] = useState<CriterionState>(buildInitialState);

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

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const reset = () => setChecked(buildInitialState());

  const {
    anyChecked,
    coreMetCount,
    coreTotal,
    coreMet,
    comorbidityMetCount,
    comorbidityTotal,
    comorbidityMet,
    alternativeSelected,
    allMet,
  } = useMemo(() => {
    const anyCheckedInner = Object.values(checked).some(Boolean);
    const coreTotalInner = coreCriteria.length;
    const coreMetCountInner = coreCriteria.filter((c) => checked[c.id]).length;
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
    const allMetInner =
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
      allMet: allMetInner,
    };
  }, [checked, coreCriteria, comorbidityCriteria, alternativeCriterion]);

  // Status bar content
  type Tone = "neutral" | "positive" | "warning" | "negative";
  let tone: Tone = "neutral";
  let statusTitle = "Tick criteria to assess e-CPR eligibility";
  let statusDetail = "All inclusion criteria must be met.";

  if (anyChecked) {
    if (allMet) {
      tone = "positive";
      statusTitle = "Meets e-CPR inclusion criteria";
      statusDetail =
        "Notify ECMO-capable centre early. Minimise scene time, maintain high-quality CPR and EtCO₂. Transport per CPG 2.9.";
    } else if (coreMet && !comorbidityMet && !alternativeSelected) {
      tone = "warning";
      statusTitle = "Core met — comorbidities not cleared";
      statusDetail =
        "Arrest features are favourable but significant comorbidities may limit e-CPR benefit. Consider discussion with CCP / medical control.";
    } else if (!coreMet) {
      tone = "negative";
      statusTitle = "Does NOT meet core e-CPR criteria";
      statusDetail =
        "One or more core criteria not met. Manage per standard cardiac arrest CPG 2.8 and ROSC care CPG 2.6.";
    } else {
      tone = "warning";
      statusTitle = "Partial — does NOT meet full e-CPR criteria";
      statusDetail =
        "Continue standard cardiac arrest management. e-CPR unlikely appropriate. Discuss with CCP / medical control if in doubt.";
    }
  }

  const summaryText = useMemo(() => {
    if (!anyChecked)
      return "ECMO CPR (e-CPR) checklist — criteria not yet completed at time of documentation.";
    if (allMet)
      return "ECMO CPR (e-CPR) checklist: ALL inclusion criteria met — treat as e-CPR candidate and liaise with ECMO centre per CPG 2.9.";
    return `ECMO CPR (e-CPR) checklist: criteria partially met (core ${coreMetCount}/${coreTotal}, comorbidity ${comorbidityMetCount}/${comorbidityTotal}${alternativeSelected ? ", history assumed comorbidity-free" : ""}) — does NOT meet full e-CPR inclusion criteria; managed as standard cardiac arrest.`;
  }, [
    anyChecked,
    allMet,
    coreMetCount,
    coreTotal,
    comorbidityMetCount,
    comorbidityTotal,
    alternativeSelected,
  ]);

  const toneCls = {
    neutral:
      "border-slate-700 bg-slate-900 text-slate-300",
    positive:
      "border-emerald-700 bg-emerald-950/60 text-emerald-200",
    warning:
      "border-amber-700 bg-amber-950/60 text-amber-200",
    negative:
      "border-rose-700 bg-rose-950/60 text-rose-200",
  };

  const toneIcon = {
    neutral: <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />,
    positive: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    negative: <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/resuscitation"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Resuscitation
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              ECMO CPR (e-CPR) Criteria
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Reset checklist"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        {/* ── Context note ── */}
        <div className="flex items-start gap-3 rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-3">
          <Zap className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-emerald-300">
            CPG 2.9 — Apply to adult medical cardiac arrests. Patient must meet{" "}
            <span className="font-bold">ALL</span> inclusion criteria to be
            considered an e-CPR candidate.
          </p>
        </div>

        {/* ── Section 1: Core Arrest Features ── */}
        <section className="rounded-2xl border border-emerald-900/60 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-950/50 border-b border-emerald-900/40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  1. Core Arrest Features
                </p>
                <p className="text-[11px] text-slate-400">All must be met</p>
              </div>
            </div>
            <ProgressBadge met={coreMetCount} total={coreTotal} color="emerald" />
          </div>
          <div className="p-3 space-y-2">
            {coreCriteria.map((c) => (
              <CriterionButton
                key={c.id}
                label={c.label}
                detail={c.detail}
                checked={checked[c.id]}
                onToggle={() => toggle(c.id)}
                color="emerald"
              />
            ))}
          </div>
        </section>

        {/* ── Section 2: Comorbidities ── */}
        <section className="rounded-2xl border border-sky-900/60 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-sky-950/50 border-b border-sky-900/40">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
                  2. Comorbidities & Functional Status
                </p>
                <p className="text-[11px] text-slate-400">All exclusions must be absent</p>
              </div>
            </div>
            <ProgressBadge
              met={comorbidityMetCount}
              total={comorbidityTotal}
              color="sky"
            />
          </div>
          <div className="p-3 space-y-2">
            {comorbidityCriteria.map((c) => (
              <CriterionButton
                key={c.id}
                label={c.label}
                detail={c.detail}
                checked={checked[c.id]}
                onToggle={() => toggle(c.id)}
                color="sky"
              />
            ))}

            {/* OR separator */}
            <div className="flex items-center gap-2 py-1">
              <span className="flex-1 h-px bg-slate-700" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                OR
              </span>
              <span className="flex-1 h-px bg-slate-700" />
            </div>

            {/* Alternative */}
            {alternativeCriterion && (
              <>
                <CriterionButton
                  label={alternativeCriterion.label}
                  detail={alternativeCriterion.detail}
                  checked={checked[alternativeCriterion.id]}
                  onToggle={() => toggle(alternativeCriterion.id)}
                  color="violet"
                />
                <p className="text-[10px] text-slate-600 px-1">
                  Only tick if there is genuinely insufficient background
                  information and the CCP reasonably judges the patient to be
                  comorbidity-free.
                </p>
              </>
            )}
          </div>
        </section>

        {/* ── Practical triggers ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Practical Prehospital Triggers
          </p>
          <p className="text-[11px] text-slate-500">
            e-CPR is most likely appropriate when ALL of the following are present:
          </p>
          <ul className="space-y-1.5">
            {[
              "Younger adult (< 60 y) with good pre-arrest functional status and no major comorbidities.",
              "Witnessed medical cardiac arrest with immediate, high-quality bystander or paramedic CPR.",
              "Initial rhythm VF/VT or PEA, with EtCO₂ > 10 mmHg during resuscitation.",
              "Collapse → ECMO-capable ED arrival expected ≤ 45 minutes.",
              "No clear exclusion: no advanced malignancy, end-stage heart/lung/renal disease, bedbound status, or severe dementia.",
            ].map((t, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/70 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* Spacer for fixed bar */}
        <div className="h-2" />
      </main>

      {/* ── Sticky Outcome Bar ── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 space-y-2">
          {/* Progress row */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Core</span>
            <span
              className={`font-bold tabular-nums ${coreMet ? "text-emerald-400" : "text-slate-300"}`}
            >
              {coreMetCount}/{coreTotal}
            </span>
            <span className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-500">Comorbidity</span>
            <span
              className={`font-bold tabular-nums ${comorbidityMet || alternativeSelected ? "text-sky-400" : "text-slate-300"}`}
            >
              {alternativeSelected
                ? "assumed OK"
                : `${comorbidityMetCount}/${comorbidityTotal}`}
            </span>
          </div>

          {/* Status */}
          <div className={`flex items-center gap-3 rounded-xl border p-3 ${toneCls[tone]}`}>
            {toneIcon[tone]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-snug">{statusTitle}</p>
              <p className="text-[11px] opacity-80 leading-snug mt-0.5">
                {statusDetail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type ColorKey = "emerald" | "sky" | "violet";

const CRITERION_STYLES: Record<
  ColorKey,
  { ring: string; checkedBg: string; dotOn: string; dotOff: string }
> = {
  emerald: {
    ring: "border-emerald-500/70 bg-emerald-950/40",
    checkedBg: "border-emerald-500/70 bg-emerald-950/40",
    dotOn: "text-emerald-400",
    dotOff: "text-slate-600",
  },
  sky: {
    ring: "border-sky-500/70 bg-sky-950/40",
    checkedBg: "border-sky-500/70 bg-sky-950/40",
    dotOn: "text-sky-400",
    dotOff: "text-slate-600",
  },
  violet: {
    ring: "border-violet-500/70 bg-violet-950/40",
    checkedBg: "border-violet-500/70 bg-violet-950/40",
    dotOn: "text-violet-400",
    dotOff: "text-slate-600",
  },
};

type CriterionButtonProps = {
  label: string;
  detail?: string;
  checked: boolean;
  onToggle: () => void;
  color: ColorKey;
};

function CriterionButton({
  label,
  detail,
  checked,
  onToggle,
  color,
}: CriterionButtonProps) {
  const s = CRITERION_STYLES[color];
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-colors active:scale-[0.99] ${
        checked
          ? s.checkedBg
          : "border-slate-700 bg-slate-800 hover:border-slate-600"
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        {checked ? (
          <CheckCircle className={`w-5 h-5 ${s.dotOn}`} />
        ) : (
          <Circle className={`w-5 h-5 ${s.dotOff}`} />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`text-sm font-semibold leading-snug ${checked ? "text-white" : "text-slate-300"}`}
        >
          {label}
        </p>
        {detail && (
          <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
            {detail}
          </p>
        )}
      </div>
    </button>
  );
}

type ProgressBadgeProps = {
  met: number;
  total: number;
  color: "emerald" | "sky";
};

function ProgressBadge({ met, total, color }: ProgressBadgeProps) {
  const all = met === total;
  const cls = all
    ? color === "emerald"
      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
      : "bg-sky-500/20 border-sky-500/50 text-sky-300"
    : "bg-slate-800 border-slate-700 text-slate-400";
  return (
    <span
      className={`flex-shrink-0 rounded-lg border px-2 py-1 text-xs font-bold tabular-nums ${cls}`}
    >
      {met}/{total}
    </span>
  );
}
