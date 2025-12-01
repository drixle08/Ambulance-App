"use client";

import Link from "next/link";
import { useState } from "react";
import { CopySummaryButton } from "../../_components/CopySummaryButton";

type SeverityLevel = "none" | "mild" | "moderate" | "severe" | "life";

type Option = {
  label: string;
  value: SeverityLevel;
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AsthmaSeverityPage() {
  // Each clinical feature
  const [speech, setSpeech] = useState<SeverityLevel>("none");
  const [respRate, setRespRate] = useState<SeverityLevel>("none");
  const [wheeze, setWheeze] = useState<SeverityLevel>("none");
  const [accessory, setAccessory] = useState<SeverityLevel>("none");
  const [spo2, setSpo2] = useState<SeverityLevel>("none");

  const features = [speech, respRate, wheeze, accessory, spo2];

  const ranks: SeverityLevel[] = ["none", "mild", "moderate", "severe", "life"];

  const highestLevel: SeverityLevel =
    features.reduce<SeverityLevel>((current, next) => {
      return ranks.indexOf(next) > ranks.indexOf(current) ? next : current;
    }, "none") || "none";

  // Summary text based on highest severity
  let label = "No criteria selected";
  let explain =
    "Start by choosing features that best describe the patient. This tool is a guide only and must be used with your local asthma CPG.";
  let color = "border-slate-700 bg-slate-900 text-slate-100";
  let managementLines: string[] = [
    "Complete a full respiratory assessment.",
    "Check vital signs and SpO₂.",
    "Reassess after bronchodilator if given.",
  ];

  if (highestLevel === "mild") {
    label = "Mild exacerbation";
    explain =
      "Likely mild asthma exacerbation with minimal work of breathing and near-normal speech.";
    color = "border-emerald-500/40 bg-emerald-500/10 text-emerald-50";
    managementLines = [
      "Administer short-acting bronchodilator (e.g. salbutamol) as per CPG.",
      "Monitor RR, HR, SpO₂ and work of breathing.",
      "Consider steroid if indicated by your CPG.",
      "Assess response; arrange follow-up or ED as per protocol.",
    ];
  } else if (highestLevel === "moderate") {
    label = "Moderate exacerbation";
    explain =
      "Increased work of breathing with reduced exercise tolerance or speech, but no features of life-threatening asthma.";
    color = "border-amber-500/40 bg-amber-500/10 text-amber-50";
    managementLines = [
      "Give repeated or continuous short-acting bronchodilator as per CPG.",
      "Administer systemic steroid if not already given.",
      "Monitor HR, RR, SpO₂ and ability to speak or complete sentences.",
      "Transport to ED; consider higher transport priority if slow to respond.",
    ];
  } else if (highestLevel === "severe") {
    label = "Severe exacerbation";
    explain =
      "Marked work of breathing with significant limitation of speech and abnormal vital signs.";
    color = "border-red-500/50 bg-red-500/10 text-red-50";
    managementLines = [
      "Urgent treatment with frequent/continuous bronchodilators as per CPG.",
      "Administer systemic steroid; consider ipratropium if in protocol.",
      "Provide oxygen if SpO₂ is below target range in your CPG.",
      "High-priority transport to ED; pre-alert receiving facility.",
      "Monitor closely for signs of fatigue or deterioration.",
    ];
  } else if (highestLevel === "life") {
    label = "Life-threatening / near respiratory failure";
    explain =
      "Features suggest impending respiratory failure: exhaustion, silent chest, altered mental status or very poor air entry.";
    color = "border-red-500/70 bg-red-500/15 text-red-50";
    managementLines = [
      "Treat as time-critical; activate highest transport priority.",
      "Aggressive bronchodilator therapy as per CPG; consider additional agents if protocol allows.",
      "Provide high-concentration oxygen; support ventilation as needed.",
      "Prepare for possible assisted ventilation and early senior/airway support.",
      "Minimise exertion and agitation; continuous monitoring during transport.",
    ];
  }

  const reset = () => {
    setSpeech("none");
    setRespRate("none");
    setWheeze("none");
    setAccessory("none");
    setSpo2("none");
  };

  // 🔹 Text to be copied to clipboard
  const summaryText =
    highestLevel === "none"
      ? "Asthma field assessment – no severity criteria selected. Complete full respiratory assessment and use local asthma CPG."
      : `Asthma field assessment – highest band: ${label}. Use in conjunction with local asthma CPG, age-appropriate normal values and full clinical assessment.`;

  const speechOptions: Option[] = [
    { label: "Normal speech / full sentences", value: "mild" },
    { label: "Short phrases only", value: "moderate" },
    { label: "Single words only", value: "severe" },
    { label: "Unable to speak / drowsy", value: "life" },
  ];

  const respRateOptions: Option[] = [
    { label: "Normal for age / slightly ↑", value: "mild" },
    { label: "Moderately ↑ RR", value: "moderate" },
    { label: "Marked tachypnoea", value: "severe" },
    { label: "Very slow RR / irregular", value: "life" },
  ];

  const wheezeOptions: Option[] = [
    { label: "Mild expiratory wheeze", value: "mild" },
    { label: "Loud bilateral wheeze", value: "moderate" },
    { label: "Very loud / tight wheeze", value: "severe" },
    { label: "Silent chest / minimal air entry", value: "life" },
  ];

  const accessoryOptions: Option[] = [
    { label: "Minimal / no accessory muscle use", value: "mild" },
    { label: "Visible accessory muscle use", value: "moderate" },
    { label: "Severe recession / tracheal tug", value: "severe" },
    { label: "Exhausted, little chest movement", value: "life" },
  ];

  const spo2Options: Option[] = [
    { label: "SpO₂ ≥ 95%", value: "mild" },
    { label: "SpO₂ 92–94%", value: "moderate" },
    { label: "SpO₂ < 92%", value: "severe" },
    { label: "Very poor sats despite O₂", value: "life" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {/* Top bar: back + copy + reset */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-400 hover:text-emerald-400"
          >
            ← Back to dashboard
          </Link>

          <div className="flex items-center gap-2">
            <CopySummaryButton summaryText={summaryText} />

            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80 transition"
            >
              ⟳ Reset all
            </button>
          </div>
        </div>

        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Assessment
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Asthma Severity (Field Assessment)
          </h1>
          <p className="text-sm text-slate-400">
            Choose the options that best describe the patient&apos;s current
            asthma attack. The tool will highlight the highest severity band.
            Always adapt to your local asthma CPG and age-specific normal values.
          </p>
        </header>

        {/* Summary card */}
        <section
          className={classNames(
            "rounded-2xl border px-5 py-4 text-sm shadow-sm",
            color
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400/80">
                Overall band
              </p>
              <p className="mt-1 text-2xl font-semibold">{label}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-100">{explain}</p>

          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Suggested Prehospital Actions (adapt to local CPG)
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-100">
              {managementLines.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-[11px] text-slate-300">
            Copied summary format:{" "}
            <span className="font-semibold">
              {`"${summaryText}"`}
            </span>
            . Paste into your PRF or clinical notes.
          </p>
        </section>

        {/* Inputs */}
        <section className="space-y-5">
          <FieldGroup
            label="Speech / ability to talk"
            helper="Can they speak in full sentences, phrases, or only single words?"
            options={speechOptions}
            value={speech}
            onChange={setSpeech}
          />

          <FieldGroup
            label="Respiratory rate"
            helper="Compare to age-appropriate normals; look at overall pattern."
            options={respRateOptions}
            value={respRate}
            onChange={setRespRate}
          />

          <FieldGroup
            label="Wheeze / air entry"
            helper="Listen over all lung zones; note loud wheeze vs silent chest."
            options={wheezeOptions}
            value={wheeze}
            onChange={setWheeze}
          />

          <FieldGroup
            label="Accessory muscle use"
            helper="Look for recession, tracheal tug, nasal flaring, use of neck muscles."
            options={accessoryOptions}
            value={accessory}
            onChange={setAccessory}
          />

          <FieldGroup
            label="SpO₂ trend"
            helper="Use appropriate target saturations for age and comorbidities."
            options={spo2Options}
            value={spo2}
            onChange={setSpo2}
          />
        </section>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80 transition"
          >
            Reset all fields
          </button>

          <p className="text-[11px] text-slate-500 text-right max-w-xs">
            This asthma tool is for education and decision-support only and must
            be used with your ambulance service asthma CPG and clinical
            judgement.
          </p>
        </div>
      </div>
    </main>
  );
}

type FieldGroupProps = {
  label: string;
  helper?: string;
  options: Option[];
  value: SeverityLevel;
  onChange: (v: SeverityLevel) => void;
};

function FieldGroup({
  label,
  helper,
  options,
  value,
  onChange,
}: FieldGroupProps) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-slate-100">{label}</p>
        {helper && <p className="text-xs text-slate-400">{helper}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.value)}
              className={classNames(
                "rounded-xl border px-3 py-2 text-xs text-left transition",
                "border-slate-700 bg-slate-900/70 hover:border-emerald-400/70 hover:bg-slate-900",
                isActive &&
                  "border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow-sm"
              )}
            >
              <span className="block font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
