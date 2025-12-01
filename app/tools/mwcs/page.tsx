"use client";

import Link from "next/link";
import { useState } from "react";

type Option = {
  label: string;
  value: number;
  description?: string;
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function MwcsPage() {
  // Each part of the Westley Croup Score
  const [loc, setLoc] = useState<number>(0);
  const [cyanosis, setCyanosis] = useState<number>(0);
  const [stridor, setStridor] = useState<number>(0);
  const [airEntry, setAirEntry] = useState<number>(0);
  const [retractions, setRetractions] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const total = loc + cyanosis + stridor + airEntry + retractions;

  // Severity based on total score (standard Westley bands)
  let severityLabel = "Mild (≤ 2)";
  let severityExplain =
    "Likely mild croup with minimal distress. Barky cough may be present but little or no stridor at rest.";
  let severityColor =
    "text-emerald-400 bg-emerald-500/10 border-emerald-500/40";

  let managementLines: string[] = [
    "Keep child calm, avoid unnecessary handling or agitation.",
    "Give corticosteroid (e.g. dexamethasone) as per CPG if not already given.",
    "Monitor for progression; usually suitable for observation and possible discharge if stable and no red flags.",
  ];

  if (total >= 3 && total <= 5) {
    severityLabel = "Moderate (3–5)";
    severityExplain =
      "Moderate croup. Stridor at rest and increased work of breathing may be present.";
    severityColor =
      "text-amber-300 bg-amber-500/10 border-amber-500/40";
    managementLines = [
      "Administer corticosteroid as per CPG.",
      "Consider nebulised adrenaline if moderate distress or stridor at rest, as per CPG.",
      "Provide oxygen if hypoxic; continuously monitor SpO₂, RR, HR and work of breathing.",
      "Transport to ED; consider higher transport priority if the child is tiring or worsening.",
    ];
  } else if (total >= 6 && total <= 11) {
    severityLabel = "Severe (6–11)";
    severityExplain =
      "Severe croup with marked work of breathing, prominent stridor and reduced air entry.";
    severityColor =
      "text-red-400 bg-red-500/10 border-red-500/40";
    managementLines = [
      "Treat as time-critical. Minimise distress and keep child in preferred position.",
      "Give nebulised adrenaline as per CPG; repeat as allowed if deterioration recurs.",
      "Administer corticosteroid (if not already given).",
      "High-flow oxygen if tolerated; close monitoring of SpO₂, RR, HR, mental status.",
      "Urgent transport to ED with high priority; pre-alert receiving facility.",
    ];
  } else if (total >= 12) {
    severityLabel = "Impending respiratory failure (≥ 12)";
    severityExplain =
      "Very high score – this may represent impending respiratory failure. Child may appear exhausted with poor air entry and altered consciousness.";
    severityColor =
      "text-red-400 bg-red-500/10 border-red-500/60";
    managementLines = [
      "Immediate high-priority management and rapid transport; treat as critically unwell.",
      "Support airway and breathing; provide high-flow oxygen and prepare for assisted ventilation if needed.",
      "Nebulised adrenaline as per CPG, repeat per protocol while preparing definitive airway.",
      "Ensure senior/airway-experienced clinician involvement as early as possible.",
      "Avoid upsetting the child; allow parent presence if safe.",
    ];
  }

  // 🔹 Text that will be copied to clipboard
  const summaryText =
    total === 0
      ? "MWCS 0 – no croup criteria selected."
      : `MWCS ${total} – ${severityLabel}. Use with local croup CPG and clinical judgement.`;

  const handleCopySummary = async () => {
    try {
      if (!("clipboard" in navigator)) {
        console.warn("Clipboard API not available");
        return;
      }
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy MWCS summary:", err);
    }
  };

  // 🔄 Reset all fields
  const resetAll = () => {
    setLoc(0);
    setCyanosis(0);
    setStridor(0);
    setAirEntry(0);
    setRetractions(0);
    setCopied(false);
  };

  const locOptions: Option[] = [
    { label: "Normal / alert", value: 0 },
    { label: "Disoriented / agitated", value: 5 },
  ];

  const cyanosisOptions: Option[] = [
    { label: "None", value: 0 },
    { label: "With agitation", value: 4 },
    { label: "At rest", value: 5 },
  ];

  const stridorOptions: Option[] = [
    { label: "None", value: 0 },
    { label: "With agitation", value: 1 },
    { label: "At rest", value: 2 },
  ];

  const airEntryOptions: Option[] = [
    { label: "Normal", value: 0 },
    { label: "Decreased", value: 1 },
    { label: "Markedly decreased", value: 2 },
  ];

  const retractionOptions: Option[] = [
    { label: "None", value: 0 },
    { label: "Mild", value: 1 },
    { label: "Moderate", value: 2 },
    { label: "Severe", value: 3 },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {/* Top bar: back + copy summary */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-400 hover:text-emerald-400"
          >
            ← Back to dashboard
          </Link>

          <button
            type="button"
            onClick={handleCopySummary}
            className={classNames(
              "rounded-full border px-3 py-1.5 text-[11px] font-medium transition flex items-center gap-1.5",
              copied
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-100"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80"
            )}
          >
            {copied ? "Copied!" : "Copy summary"}
          </button>
        </div>

        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Calculator
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            MWCS (Modified Westley Croup Score)
          </h1>
          <p className="text-sm text-slate-400">
            Select the findings that best match your patient. The tool will sum
            the score and show a severity band. Always use alongside your local
            CPG and clinical judgement.
          </p>
        </header>

        {/* Result + management card */}
        <section
          className={classNames(
            "rounded-2xl border px-5 py-4 text-sm shadow-sm",
            severityColor
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400/80">
                Total Score
              </p>
              <p className="mt-1 text-3xl font-semibold">{total}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400/80">
                Severity
              </p>
              <p className="mt-1 text-base font-semibold">{severityLabel}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-200">{severityExplain}</p>

          <p className="mt-3 text-[11px] text-slate-300">
            Copied summary format:{" "}
            <span className="font-semibold">
              {`"${summaryText}"`}
            </span>
            . Paste into your PRF or clinical notes.
          </p>

          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Suggested Management (adapt to local CPG)
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
        </section>

        {/* Inputs */}
        <section className="space-y-5">
          <FieldGroup
            label="Level of consciousness"
            helper="Alert vs disoriented / agitated."
            options={locOptions}
            value={loc}
            onChange={setLoc}
          />

          <FieldGroup
            label="Cyanosis"
            helper="Central cyanosis at rest vs only when agitated."
            options={cyanosisOptions}
            value={cyanosis}
            onChange={setCyanosis}
          />

          <FieldGroup
            label="Stridor"
            helper="Listen at rest and when the child is agitated or crying."
            options={stridorOptions}
            value={stridor}
            onChange={setStridor}
          />

          <FieldGroup
            label="Air entry"
            helper="Compare both lungs, and note any marked reduction."
            options={airEntryOptions}
            value={airEntry}
            onChange={setAirEntry}
          />

          <FieldGroup
            label="Retractions"
            helper="Subcostal, intercostal, sternal tug; overall work of breathing."
            options={retractionOptions}
            value={retractions}
            onChange={setRetractions}
          />
        </section>

        {/* Reset + disclaimer */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={resetAll}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80 transition"
          >
            Reset all fields
          </button>

          <p className="text-[11px] text-slate-500 text-right max-w-xs">
            This tool is for educational / decision-support use and does not
            replace clinical judgement or your ambulance service CPG.
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
  value: number;
  onChange: (v: number) => void;
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
              <span className="mt-0.5 block text-[10px] text-slate-400">
                +{opt.value} point{opt.value === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
