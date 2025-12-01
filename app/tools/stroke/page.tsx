"use client";

import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type FieldState = "normal" | "abnormal" | "unknown";
type OnsetBand = "lt15" | "gt15" | "unknown";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function StrokeBEFASTPage() {
  const [balance, setBalance] = useState<FieldState>("normal");
  const [eyes, setEyes] = useState<FieldState>("normal");
  const [face, setFace] = useState<FieldState>("normal");
  const [arms, setArms] = useState<FieldState>("normal");
  const [speech, setSpeech] = useState<FieldState>("normal");
  const [onset, setOnset] = useState<OnsetBand>("lt15");

  const befastStates: { key: string; label: string; value: FieldState }[] = [
    { key: "balance", label: "Balance", value: balance },
    { key: "eyes", label: "Eyes", value: eyes },
    { key: "face", label: "Face", value: face },
    { key: "arms", label: "Arms", value: arms },
    { key: "speech", label: "Speech", value: speech },
  ];

  const abnormalCount = befastStates.filter((f) => f.value === "abnormal").length;

  let classificationLabel = "No BEFAST signs";
  let classificationExplanation =
    "No focal deficits on BEFAST. Stroke is still possible — correlate with history, vitals, and other neurological findings.";

  if (abnormalCount >= 1 && abnormalCount <= 2) {
    classificationLabel = "BEFAST positive – possible stroke";
    classificationExplanation =
      "One or two abnormal BEFAST findings. Treat as suspected stroke and apply CPG 3.1 Stroke.";
  } else if (abnormalCount >= 3) {
    classificationLabel = "BEFAST positive – high concern";
    classificationExplanation =
      "Multiple abnormal BEFAST findings. High suspicion for acute stroke; time-critical management required.";
  }

  const onsetText =
    onset === "lt15"
      ? "< 15 hours / wake-up stroke"
      : onset === "gt15"
      ? "> 15 hours since onset"
      : "Onset time unknown";

  const abnormalLabels = befastStates
    .filter((f) => f.value === "abnormal")
    .map((f) => f.label);

  const abnormalFeaturesText =
    abnormalLabels.length > 0 ? abnormalLabels.join(", ") : "None";

  // Management hints based on CPG 3.1
  const management: string[] = [];

  if (abnormalCount === 0) {
    management.push(
      "Continue full neurological assessment and monitor vitals. Stroke still possible despite a negative BEFAST.",
      "Actively rule out stroke mimics (intoxication, hypoxia, hypo/hyperglycaemia, post-ictal state, infections, migraine, electrolyte disturbance, intracranial lesions) as per CPG 3.1.",
      "If clinical suspicion remains high, manage as suspected stroke and transport to HGH ED with prenotification."
    );
  } else {
    if (onset === "lt15") {
      management.push(
        "Positive BEFAST < 15 hours or wake-up stroke: treat as time-critical stroke.",
        "Transport Priority 1 to the appropriate facility (HGH ED) and provide prenotification via CC: Emergency."
      );
    } else if (onset === "gt15") {
      management.push(
        "Positive BEFAST > 15 hours since onset: stroke still time-sensitive.",
        "Transport Priority 2 to the appropriate facility (HGH ED) and provide prenotification."
      );
    } else {
      management.push(
        "Positive BEFAST with uncertain onset time: treat as suspected acute stroke.",
        "Discuss with CC: Emergency and consider Priority 1 transport to HGH ED with prenotification."
      );
    }

    management.push(
      "Position patient lateral or semi-Fowler if reduced level of consciousness; protect airway.",
      "Administer oxygen only if indicated (hypoxia). Avoid hypoxia and hypercapnia.",
      "Rule out reversible/mimicking causes: consider glucose, seizure/post-ictal state, intoxication, infection, migraine, electrolyte disturbance, intracranial lesions.",
      "APs do not routinely require CCP unless there is airway or haemodynamic compromise. Do not delay transport waiting for CCP; meet en route if needed.",
      "Do NOT attempt to reduce blood pressure with nitrates in hypertensive stroke patients."
    );
  }

  const summaryText = `Stroke screen: ${classificationLabel} (${abnormalCount}/5 BEFAST positive). Onset: ${onsetText}. Abnormal: ${abnormalFeaturesText}. Plan: ${management[0]}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          Neurological
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Stroke BEFAST Screen
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          BEFAST stroke assessment aligned with HMCAS CPG v2.4 (CPG 3.1 Stroke). Any
          abnormal BEFAST finding = suspected stroke; use onset time to guide transport
          priority and prenotification.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {/* Left: BEFAST inputs */}
        <div className="md:col-span-2 space-y-4">
          {/* Balance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                  B – Balance
                </p>
                <p className="text-xs text-slate-500">
                  Sudden loss of balance, unsteadiness, or dizziness?
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "normal", label: "No acute balance issue" },
                { id: "abnormal", label: "Acute loss of balance / ataxia" },
                { id: "unknown", label: "Unable to assess / uncertain" },
              ] as const).map((opt) => {
                const active = balance === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBalance(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                        : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Eyes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                  E – Eyes
                </p>
                <p className="text-xs text-slate-500">
                  Sudden loss of vision in one or both eyes, or new visual blurring?
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "normal", label: "No acute visual change" },
                { id: "abnormal", label: "New visual loss / field cut / blurring" },
                { id: "unknown", label: "Unable to assess / uncertain" },
              ] as const).map((opt) => {
                const active = eyes === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEyes(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                        : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Face */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                  F – Face
                </p>
                <p className="text-xs text-slate-500">
                  Ask the patient to smile. Is one side of the face drooping?
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "normal", label: "Symmetrical" },
                { id: "abnormal", label: "Facial droop / asymmetry" },
                { id: "unknown", label: "Unable to assess / uncertain" },
              ] as const).map((opt) => {
                const active = face === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFace(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                        : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arms */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                  A – Arms
                </p>
                <p className="text-xs text-slate-500">
                  Ask the patient to lift both arms or squeeze your fingers. Is one arm weaker?
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "normal", label: "Equal strength" },
                { id: "abnormal", label: "Weakness / drift in one arm" },
                { id: "unknown", label: "Unable to assess / uncertain" },
              ] as const).map((opt) => {
                const active = arms === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setArms(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                        : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speech */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                  S – Speech
                </p>
                <p className="text-xs text-slate-500">
                  Ask the patient to speak. Is their speech slurred, confused, or unable to speak?
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "normal", label: "Clear, normal speech" },
                { id: "abnormal", label: "Slurred / aphasia / unable to speak" },
                { id: "unknown", label: "Unable to assess / uncertain" },
              ] as const).map((opt) => {
                const active = speech === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSpeech(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                        : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Onset time */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  T – Time last seen normal
                </p>
                <p className="text-xs text-slate-500">
                  Use best available history: exact onset or last known well time.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "lt15", label: "< 15 hours / wake-up stroke" },
                { id: "gt15", label: "> 15 hours since onset" },
                { id: "unknown", label: "Onset time unknown / unclear" },
              ] as const).map((opt) => {
                const active = onset === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOnset(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                        : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Result & management */}
        <div className="md:col-span-1">
          <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  BEFAST summary
                </p>
                <h2 className="mt-1 text-lg md:text-xl font-semibold text-slate-50">
                  {classificationLabel}
                </h2>
                <p className="text-xs text-slate-400">
                  {abnormalCount}/5 signs abnormal • Onset: {onsetText}
                </p>
                  <p className="text-[0.7rem] text-slate-500 mt-1">
                   {classificationExplanation}
                </p>
              </div>
              <CopySummaryButton summaryText={summaryText} />
            </div>

            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-100 mb-1">Abnormal components</p>
              <p>{abnormalFeaturesText}</p>
            </div>

            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-100 mb-1">
                Suggested prehospital actions (see CPG 3.1 for full protocol)
              </p>
              <ul className="mt-1 space-y-1.5">
                {management.map((m, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400/70 shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[0.65rem] text-slate-500 mt-auto">
              Any suspected stroke with new onset symptoms, regardless of time of onset, should be
              transported to HGH Emergency Department with prenotification as per CPG 3.1 Stroke.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
