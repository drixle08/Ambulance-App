"use client";

import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type Mode = "adult" | "paeds";

type EyeScore = 1 | 2 | 3 | 4;
type VerbalScore = 1 | 2 | 3 | 4 | 5;
type MotorScore = 1 | 2 | 3 | 4 | 5 | 6;

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function GcsPage() {
  const [mode, setMode] = useState<Mode>("adult");
  const [eye, setEye] = useState<EyeScore>(4);
  const [verbal, setVerbal] = useState<VerbalScore>(5);
  const [motor, setMotor] = useState<MotorScore>(6);

  const total = eye + verbal + motor;

  let severity = "Mild";
  if (total <= 8) severity = "Severe";
  else if (total <= 12) severity = "Moderate";

  const severityColor =
    severity === "Severe"
      ? "text-red-500"
      : severity === "Moderate"
      ? "text-yellow-500"
      : "text-emerald-500";

  // Adult verbal descriptors
  const adultVerbalOptions: { score: VerbalScore; label: string }[] = [
    { score: 5, label: "Oriented" },
    { score: 4, label: "Confused conversation" },
    { score: 3, label: "Inappropriate words" },
    { score: 2, label: "Incomprehensible sounds" },
    { score: 1, label: "No verbal response" },
  ];

  // Paediatric verbal options (pre-verbal child)
  const paedsVerbalOptions: { score: VerbalScore; label: string }[] = [
    { score: 5, label: "Coos / babbles / appropriate words" },
    { score: 4, label: "Irritable cry / consolable" },
    { score: 3, label: "Persistent inappropriate crying / screaming" },
    { score: 2, label: "Moans / grunts to pain" },
    { score: 1, label: "No response" },
  ];

  const verbalOptions = mode === "adult" ? adultVerbalOptions : paedsVerbalOptions;

  const eyeLabel =
    eye === 4
      ? "Spontaneous"
      : eye === 3
      ? "To speech"
      : eye === 2
      ? "To pain"
      : "No eye opening";

  const motorLabel =
    motor === 6
      ? "Obeys commands"
      : motor === 5
      ? "Localises pain"
      : motor === 4
      ? "Withdraws from pain"
      : motor === 3
      ? "Abnormal flexion (decorticate)"
      : motor === 2
      ? "Abnormal extension (decerebrate)"
      : "No motor response";

  const summaryText = `GCS ${total} (E${eye} V${verbal} M${motor}) – ${severity} (${mode === "adult" ? "Adult" : "Paediatric"}).`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          Neurological
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Glasgow Coma Scale (GCS)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Adult and paediatric GCS calculator with PRF-ready summary. Use in
          conjunction with your primary clinical approach and trending of
          neurological status.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {/* Left: inputs */}
        <div className="md:col-span-2 space-y-4">
          {/* Mode switch */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                Patient type
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "adult", label: "Adult / verbal child" },
                { id: "paeds", label: "Paediatric (pre-verbal)" },
              ].map((opt) => {
                const active = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id as Mode)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[0.7rem] text-slate-500 dark:text-slate-500 mt-1">
              Adult verbal scale is used for older children who can give age-appropriate
              responses. Paediatric scale is used for pre-verbal children.
            </p>
          </div>

          {/* Eye opening */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                  Eye opening (E)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Score {eye} – {eyeLabel}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { score: 4 as EyeScore, label: "4 – Spontaneous" },
                { score: 3 as EyeScore, label: "3 – To speech" },
                { score: 2 as EyeScore, label: "2 – To pain" },
                { score: 1 as EyeScore, label: "1 – No response" },
              ].map((opt) => {
                const active = eye === opt.score;
                return (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => setEye(opt.score)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verbal response */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                  Verbal response (V)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Score {verbal}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {verbalOptions.map((opt) => {
                const active = verbal === opt.score;
                return (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => setVerbal(opt.score)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition text-left",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motor response */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                  Motor response (M)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Score {motor} – {motorLabel}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { score: 6 as MotorScore, label: "6 – Obeys commands" },
                { score: 5 as MotorScore, label: "5 – Localises pain" },
                { score: 4 as MotorScore, label: "4 – Withdraws from pain" },
                { score: 3 as MotorScore, label: "3 – Abnormal flexion" },
                { score: 2 as MotorScore, label: "2 – Abnormal extension" },
                { score: 1 as MotorScore, label: "1 – No response" },
              ].map((opt) => {
                const active = motor === opt.score;
                return (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => setMotor(opt.score)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition text-left",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: result */}
        <div className="md:col-span-1">
          <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  GCS result
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {total}
                  <span className="ml-2 text-sm font-semibold">
                    (E{eye} V{verbal} M{motor})
                  </span>
                </p>
                <p className={classNames("text-xs font-semibold", severityColor)}>
                  {severity} (3–8 severe • 9–12 moderate • 13–15 mild)
                </p>
                <p className="text-[0.7rem] text-slate-600 dark:text-slate-500">
                  {mode === "adult"
                    ? "Adult / verbal child verbal scale."
                    : "Paediatric pre-verbal verbal scale."}
                </p>
              </div>
              <CopySummaryButton summaryText={summaryText} />
            </div>

            <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Documentation hint
              </p>
              <p>
                Record as <span className="font-mono">GCS {total} (E{eye} V{verbal} M{motor})</span>{" "}
                and trend over time. Always interpret in context of airway, breathing,
                circulation, and underlying cause.
              </p>
            </div>

            <p className="text-[0.7rem] text-slate-600 dark:text-slate-500 mt-auto">
              GCS is one component of neurological assessment. Consider pupils, limb
              strength, seizures, and relevant CPGs (e.g. head injury, stroke, status
              epilepticus).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
