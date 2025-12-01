"use client";

import Link from "next/link";
import { useState } from "react";
import { CopySummaryButton } from "../../_components/CopySummaryButton";

type Option = {
  label: string;
  value: "normal" | "abnormal" | "unknown";
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function StrokeBefastPage() {
  const [balance, setBalance] = useState<"normal" | "abnormal" | "unknown">(
    "normal"
  );
  const [eyes, setEyes] = useState<"normal" | "abnormal" | "unknown">(
    "normal"
  );
  const [face, setFace] = useState<"normal" | "abnormal" | "unknown">(
    "normal"
  );
  const [arm, setArm] = useState<"normal" | "abnormal" | "unknown">("normal");
  const [speech, setSpeech] = useState<"normal" | "abnormal" | "unknown">(
    "normal"
  );

  const fields = { balance, eyes, face, arm, speech };
  const positives = Object.values(fields).filter(
    (v) => v === "abnormal"
  ).length;

  const suspectedStroke = positives > 0;

  let severityColor =
    "border-slate-700 bg-slate-900 text-slate-100";
  let flagLabel = "No BEFAST features detected";
  let flagExplain =
    "No obvious BEFAST abnormalities selected. Continue assessment and consider other causes.";

  let managementLines: string[] = [
    "Continue full neuro and medical assessment.",
    "Check blood glucose and vital signs.",
    "Reassess if symptoms evolve or new deficits appear.",
  ];

  if (suspectedStroke && positives <= 2) {
    severityColor =
      "border-amber-500/40 bg-amber-500/10 text-amber-50";
    flagLabel = "Possible stroke – BEFAST positive";
    flagExplain =
      "One or more BEFAST features are abnormal. Treat as possible stroke and follow your stroke pathway.";
    managementLines = [
      "Establish exact time of symptom onset / last known well.",
      "Check blood glucose; correct hypoglycaemia if present.",
      "Monitor airway, breathing, circulation and vital signs.",
      "Arrange timely transport to stroke-capable facility as per local pathway.",
    ];
  }

  if (suspectedStroke && positives >= 3) {
    severityColor =
      "border-red-500/50 bg-red-500/10 text-red-50";
    flagLabel = "High concern – multiple BEFAST positives";
    flagExplain =
      "Multiple BEFAST features are abnormal. This may represent an acute stroke; treat as time-critical.";
    managementLines = [
      "High-priority activation of stroke pathway; pre-alert receiving hospital.",
      "Determine exact time of onset / last known well and bring any info/medication list.",
      "Check glucose, ECG and full vital signs; manage ABCs and oxygen if hypoxic.",
      "Minimise on-scene time; aim for rapid transport to stroke centre as per local CPG.",
    ];
  }

  const reset = () => {
    setBalance("normal");
    setEyes("normal");
    setFace("normal");
    setArm("normal");
    setSpeech("normal");
  };

  const yesNoUnknown: Option[] = [
    { label: "Normal", value: "normal" },
    { label: "Abnormal", value: "abnormal" },
    { label: "Unable / unknown", value: "unknown" },
  ];

  // 🔹 Build list of abnormal components for the summary
  const abnormalParts: string[] = [];
  if (balance === "abnormal") abnormalParts.push("Balance");
  if (eyes === "abnormal") abnormalParts.push("Eyes");
  if (face === "abnormal") abnormalParts.push("Face");
  if (arm === "abnormal") abnormalParts.push("Arm");
  if (speech === "abnormal") abnormalParts.push("Speech");

  // 🔹 Summary text for PRF / notes
  let summaryText: string;

  if (!suspectedStroke) {
    summaryText =
      "BEFAST stroke screen: 0/5 features abnormal. No BEFAST positives. Continue full assessment, consider other causes and follow local stroke pathway.";
  } else if (positives <= 2) {
    summaryText = `BEFAST stroke screen positive (${positives}/5): ${abnormalParts.join(
      ", "
    )} abnormal. Possible stroke – follow local stroke pathway, determine last-known-well time and transport to stroke-capable facility.`;
  } else {
    summaryText = `BEFAST stroke screen high concern (${positives}/5): ${abnormalParts.join(
      ", "
    )} abnormal. Treat as time-critical stroke – activate pathway, pre-alert receiving hospital and minimise on-scene time as per CPG.`;
  }

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
            Stroke BEFAST Screen
          </h1>
          <p className="text-sm text-slate-400">
            Use BEFAST as a quick bedside stroke screen. Select whether each
            component is normal or abnormal based on your examination. This tool
            does not replace your local stroke CPG.
          </p>
        </header>

        {/* Summary card */}
        <section
          className={classNames(
            "rounded-2xl border px-5 py-4 text-sm shadow-sm",
            severityColor
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400/80">
                BEFAST Positives
              </p>
              <p className="mt-1 text-3xl font-semibold">{positives}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400/80">
                Stroke flag
              </p>
              <p className="mt-1 text-base font-semibold">{flagLabel}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-100">{flagExplain}</p>

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
            label="B – Balance"
            helper="Sudden loss of balance, unsteady gait, difficulty standing/walking."
            options={yesNoUnknown}
            value={balance}
            onChange={setBalance}
          />

          <FieldGroup
            label="E – Eyes"
            helper="Sudden visual loss, double vision or visual field defect."
            options={yesNoUnknown}
            value={eyes}
            onChange={setEyes}
          />

          <FieldGroup
            label="F – Face"
            helper="Facial droop or asymmetry when smiling or showing teeth."
            options={yesNoUnknown}
            value={face}
            onChange={setFace}
          />

          <FieldGroup
            label="A – Arm"
            helper="Weakness or drift in one arm (or leg) when held up."
            options={yesNoUnknown}
            value={arm}
            onChange={setArm}
          />

          <FieldGroup
            label="S – Speech"
            helper="Slurred speech, difficulty finding words or understanding speech."
            options={yesNoUnknown}
            value={speech}
            onChange={setSpeech}
          />
        </section>

        <div className="flex items-center justify-end pt-4">
          <p className="text-[11px] text-slate-500 text-right max-w-xs">
            This BEFAST tool is for education and decision-support only and
            must be used with your ambulance service stroke pathway and clinical
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
  value: Option["value"];
  onChange: (v: Option["value"]) => void;
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
