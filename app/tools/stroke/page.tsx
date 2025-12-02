"use client";

import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type BEFASTState = "normal" | "abnormal" | "unknown";
type OnsetBand = "lt15" | "gt15" | "unknown";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function StrokeBefastPage() {
  const [ageYears, setAgeYears] = useState<string>("70");
  const [onset, setOnset] = useState<OnsetBand>("lt15");

  const [balance, setBalance] = useState<BEFASTState>("normal");
  const [eyes, setEyes] = useState<BEFASTState>("normal");
  const [face, setFace] = useState<BEFASTState>("normal");
  const [arm, setArm] = useState<BEFASTState>("normal");
  const [speech, setSpeech] = useState<BEFASTState>("normal");

  const befastStates: Record<string, BEFASTState> = {
    Balance: balance,
    Eyes: eyes,
    Face: face,
    Arm: arm,
    Speech: speech,
  };

  const abnormalEntries = Object.entries(befastStates).filter(
    ([, v]) => v === "abnormal"
  );
  const abnormalCount = abnormalEntries.length;
  const abnormalLabels = abnormalEntries.map(([k]) => k);

  const unknownCount = Object.values(befastStates).filter(
    (v) => v === "unknown"
  ).length;

  // Classification logic
  let classificationLabel: string;
  let classificationExplanation: string;

  if (abnormalCount === 0) {
    classificationLabel = "No BEFAST deficits";
    classificationExplanation =
      "No focal deficits on BEFAST. Stroke is still possible — correlate with history, vitals, glucose, and full neurological exam as per CPG 3.1 Stroke.";
  } else if (abnormalCount >= 1 && abnormalCount <= 2) {
    classificationLabel = "BEFAST positive ▮ possible stroke";
    classificationExplanation =
      "One or two abnormal BEFAST findings. Treat as suspected stroke and apply CPG 3.1 Stroke, including time of onset, glucose check, and transport to CT-capable facility.";
  } else {
    classificationLabel = "BEFAST positive ▮ high concern";
    classificationExplanation =
      "Multiple abnormal BEFAST findings. High suspicion for acute stroke; time-critical management and rapid transport to CT-capable facility required as per CPG 3.1 Stroke.";
  }

  const onsetText =
    onset === "lt15"
      ? "< 15 hours / wake-up stroke"
      : onset === "gt15"
      ? "> 15 hours since onset"
      : "Onset time unknown";

  const timeCriticalNote =
    abnormalCount >= 1 && onset === "lt15"
      ? "Onset < 15 hours or wake-up stroke with BEFAST positivity — consider stroke code / hyperacute pathway as per CPG 3.1 Stroke."
      : abnormalCount >= 1 && onset === "gt15"
      ? "Onset > 15 hours with BEFAST positivity — outside standard thrombolysis window but still requires urgent stroke assessment and imaging as per CPG 3.1 Stroke."
      : "Document last known well time clearly and liaise with Clinical Coordination / receiving ED as per CPG 3.1 Stroke.";

  const severityColor =
    abnormalCount === 0
      ? "text-slate-500"
      : abnormalCount <= 2
      ? "text-yellow-500"
      : "text-red-500";

  const actions: string[] = [];

  if (abnormalCount === 0) {
    actions.push(
      "Continue full neurological assessment (GCS, pupils, limb strength, speech, gait) and consider mimics such as hypoglycaemia, seizure, migraine, or sepsis.",
      "Check blood glucose and vital signs; manage any ABC issues and consult CPG 3.1 Stroke if concern persists despite negative BEFAST."
    );
  } else if (abnormalCount >= 1 && abnormalCount <= 2) {
    actions.push(
      "Treat as suspected stroke: obtain precise last-known-well time, check blood glucose, and perform full neurological assessment as per CPG 3.1 Stroke.",
      "Prioritise transport to CT-capable facility; prenotify ED with BEFAST findings and onset band.",
      timeCriticalNote
    );
  } else {
    actions.push(
      "Treat as time-critical stroke: multiple BEFAST positives with high suspicion for acute stroke.",
      "Secure ABCs, check blood glucose, avoid hypotension/hypoxia, and transport urgently to CT-capable facility with prenotification (stroke code if applicable).",
      timeCriticalNote
    );
  }

  const ageNum = Number(ageYears);

  const summaryPieces: string[] = [];
  summaryPieces.push(
    `BEFAST: ${abnormalCount}/5 positive${
      abnormalLabels.length ? ` (${abnormalLabels.join(", ")})` : ""
    }`
  );
  if (!Number.isNaN(ageNum)) {
    summaryPieces.push(`age ~${ageNum}y`);
  }
  summaryPieces.push(`onset: ${onsetText}`, `classification: ${classificationLabel}`);

  const summaryText =
    summaryPieces.join("; ") +
    `. Primary actions: ${actions[0] ?? "Apply CPG 3.1 Stroke and consult Clinical Coordination."}`;

  function handleReset() {
    setAgeYears("70");
    setOnset("lt15");
    setBalance("normal");
    setEyes("normal");
    setFace("normal");
    setArm("normal");
    setSpeech("normal");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
              Neurological
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              Stroke BEFAST Screen
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Quick BEFAST screen (Balance, Eyes, Face, Arm, Speech) with onset banding
              and transport priority hints. Aligns with HMCAS CPG 3.1 Stroke — this
              tool supports, but does not replace, your clinical judgement or the CPG.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
          >
            Reset
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {/* Left: inputs */}
        <div className="md:col-span-2 space-y-4">
          {/* Patient / onset */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
              Patient & onset
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Age (years)
              </label>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="w-24 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Older age & comorbidities increase risk of stroke.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Time of symptom onset / last known well
              </p>
              <div className="flex flex-wrap gap-2">
                {([
                  {
                    id: "lt15",
                    label: "< 15 hours / wake-up stroke",
                    desc: "Potentially within hyperacute pathway windows.",
                  },
                  {
                    id: "gt15",
                    label: "> 15 hours since onset",
                    desc: "Outside standard thrombolysis window; still urgent.",
                  },
                  {
                    id: "unknown",
                    label: "Onset time unclear / unknown",
                    desc: "Document best estimate and liaise with ED/Coordination.",
                  },
                ] as const).map((opt) => {
                  const active = onset === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOnset(opt.id)}
                      className={classNames(
                        "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition text-left flex-1 min-w-40",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                        active
                          ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                          : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                      )}
                    >
                      <span className="block">{opt.label}</span>
                      <span className="block text-[0.65rem] text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BEFAST items */}
          {([
            {
              key: "Balance",
              value: balance,
              setter: setBalance,
              help: "Sudden loss of balance, unsteady gait, leaning to one side, or difficulty walking.",
            },
            {
              key: "Eyes",
              value: eyes,
              setter: setEyes,
              help: "Sudden change in vision: loss in one eye, double vision, or field defect.",
            },
            {
              key: "Face",
              value: face,
              setter: setFace,
              help: "Facial asymmetry: droop when smiling, flattened nasolabial fold, or unequal grimace.",
            },
            {
              key: "Arm",
              value: arm,
              setter: setArm,
              help: "Arm drift or weakness: unable to hold both arms up equally for 10 seconds.",
            },
            {
              key: "Speech",
              value: speech,
              setter: setSpeech,
              help: "Slurred speech, word-finding difficulty, inappropriate words, or comprehension problems.",
            },
          ] as const).map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                    {item.key}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {item.help}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { id: "normal", label: "Normal / no deficit" },
                  { id: "abnormal", label: "Abnormal BEFAST finding" },
                  { id: "unknown", label: "Unable to assess / unclear" },
                ] as const).map((opt) => {
                  const active = item.value === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => item.setter(opt.id as BEFASTState)}
                      className={classNames(
                        "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition text-left",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                        active
                          ? opt.id === "abnormal"
                            ? "border-red-500 bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200"
                            : "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                          : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary */}
        <div className="md:col-span-1">
          <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  BEFAST classification
                </p>
                <p
                  className={classNames(
                    "mt-1 text-lg md:text-xl font-semibold",
                    severityColor
                  )}
                >
                  {classificationLabel}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {abnormalCount} of 5 domains abnormal
                  {abnormalLabels.length
                    ? `: ${abnormalLabels.join(", ")}`
                    : ""}{" "}
                  {unknownCount > 0 && `( + ${unknownCount} unknown )`}
                </p>
              </div>
              <CopySummaryButton summaryText={summaryText} />
            </div>

            <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Interpretation
              </p>
              <p>{classificationExplanation}</p>
            </div>

            <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Suggested prehospital actions (summary)
              </p>
              <ul className="mt-1 space-y-1.5">
                {actions.map((a, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400/70 shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[0.7rem] text-slate-600 dark:text-slate-500 mt-auto">
              This BEFAST screen assists with early stroke recognition and transport
              priority. Final decisions on thrombolysis/thrombectomy pathways and
              imaging must follow HMCAS CPG 3.1 Stroke and the receiving stroke team.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
