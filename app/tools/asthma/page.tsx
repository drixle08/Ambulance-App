"use client";

import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type SeverityLevel = "Mild" | "Moderate" | "Severe" | "Unable to determine";

interface AssessmentInput {
  age: string;
  rr: string;
  hr: string;
  spo2: string;
  speech: string;
  loc: string;
  silentChest: boolean;
}

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AsthmaPage() {
  const [input, setInput] = useState<AssessmentInput>({
    age: "",
    rr: "",
    hr: "",
    spo2: "",
    speech: "sentences",
    loc: "alert",
    silentChest: false,
  });

  const numericAge = parseFloat(input.age);
  const isAdult = !isNaN(numericAge) && numericAge >= 14;

  // ---- Severity logic based on CPG 5.1 ----
  const rr = parseFloat(input.rr);
  const hr = parseFloat(input.hr);
  const spo2 = parseFloat(input.spo2);

  let severity: SeverityLevel = "Unable to determine";

  if (isAdult) {
    if (
      input.loc !== "alert" ||
      input.speech === "words" ||
      rr > 29 ||
      input.silentChest ||
      spo2 < 90
    ) {
      severity = "Severe";
    } else if (
      input.speech === "phrases" ||
      (rr >= 24 && rr <= 29)
    ) {
      severity = "Moderate";
    } else if (input.speech === "sentences" && rr < 24) {
      severity = "Mild";
    }
  } else {
    // Paediatric thresholds from CPG table
    const hrHigh =
      (numericAge >= 2 && numericAge <= 5 && hr > 140) ||
      (numericAge > 5 && hr > 125);
    const rrHigh =
      (numericAge >= 2 && numericAge <= 5 && rr > 40) ||
      (numericAge > 5 && rr > 30);

    if (
      input.loc !== "alert" ||
      input.silentChest ||
      spo2 < 92 ||
      hrHigh ||
      rrHigh
    ) {
      severity = "Severe";
    } else if (
      input.speech === "phrases" ||
      rrHigh ||
      hrHigh
    ) {
      severity = "Moderate";
    } else if (input.speech === "sentences" && rr < 30) {
      severity = "Mild";
    }
  }

  // ---- Suggested management per CPG 5.1 ----
  const management =
    severity === "Mild"
      ? [
          "Oxygen as required.",
          "Nebulised Salbutamol 5 mg (adults) or 2.5–5 mg (paeds) ± Ipratropium 0.5 mg (adults) / 0.25–0.5 mg (paeds).",
          "Repeat as required; monitor response.",
        ]
      : severity === "Moderate"
      ? [
          "Oxygen > 94%.",
          "Salbutamol + Ipratropium combination neb.",
          "Monitor HR, RR, SpO₂ and LOC.",
          "Consider IV access and fluids (250–500 mL adults / 10 mL/kg paeds if no oedema).",
        ]
      : severity === "Severe"
      ? [
          "High-flow O₂ and continuous Salbutamol + Ipratropium.",
          "IM Adrenaline 0.5 mg (1:1000) adults / 10 µg/kg paeds (max 0.5 mg).",
          "Magnesium 1–2 g IV (adults).",
          "Hydrocortisone 200 mg IV (adults).",
          "Consider NIV or RSI if peri-arrest / poor effort.",
        ]
      : [
          "Unable to classify — review inputs and clinical context.",
        ];

  const summaryText = `Asthma severity: ${severity} (${isAdult ? "Adult" : "Paediatric"}). Features: speech ${input.speech}, RR ${input.rr}, HR ${input.hr}, SpO₂ ${input.spo2}${input.silentChest ? ", silent chest" : ""}. Suggested: ${management[0]}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          Respiratory
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Asthma Severity Assessment
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Unified adult + paediatric asthma assessment aligned with HMCAS CPG v2.4 (2025).  
          Automatically selects age-appropriate thresholds.
        </p>
      </header>

      {/* Input form */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex flex-col text-sm">
            <span className="text-slate-400 mb-1">Age (yrs)</span>
            <input
              type="number"
              min="0"
              className="rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-100"
              value={input.age}
              onChange={(e) => setInput({ ...input, age: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-slate-400 mb-1">RR (/min)</span>
            <input
              type="number"
              className="rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-100"
              value={input.rr}
              onChange={(e) => setInput({ ...input, rr: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-slate-400 mb-1">HR (bpm)</span>
            <input
              type="number"
              className="rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-100"
              value={input.hr}
              onChange={(e) => setInput({ ...input, hr: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-slate-400 mb-1">SpO₂ (%)</span>
            <input
              type="number"
              className="rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-100"
              value={input.spo2}
              onChange={(e) => setInput({ ...input, spo2: e.target.value })}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex flex-col text-sm">
            <span className="text-slate-400 mb-1">Speech ability</span>
            <select
              className="rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-100"
              value={input.speech}
              onChange={(e) => setInput({ ...input, speech: e.target.value })}
            >
              <option value="sentences">Full sentences</option>
              <option value="phrases">Phrases</option>
              <option value="words">Single words / unable to talk</option>
            </select>
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-slate-400 mb-1">Level of consciousness</span>
            <select
              className="rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-100"
              value={input.loc}
              onChange={(e) => setInput({ ...input, loc: e.target.value })}
            >
              <option value="alert">Alert</option>
              <option value="drowsy">Drowsy / agitated</option>
              <option value="decreased">Decreasing LOC / unresponsive</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={input.silentChest}
              onChange={(e) =>
                setInput({ ...input, silentChest: e.target.checked })
              }
              className="h-4 w-4 accent-emerald-500"
            />
            <span className="text-slate-300">Silent chest present</span>
          </label>
        </div>
      </section>

      {/* Output section */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
              Result
            </p>
            <h2
              className={classNames(
                "mt-1 text-2xl font-bold",
                severity === "Mild"
                  ? "text-emerald-400"
                  : severity === "Moderate"
                  ? "text-yellow-400"
                  : severity === "Severe"
                  ? "text-red-500"
                  : "text-slate-400"
              )}
            >
              {severity}
            </h2>
            <p className="text-xs text-slate-400">
              {isAdult ? "Adult thresholds" : "Paediatric thresholds"}
            </p>
          </div>
          <CopySummaryButton summaryText={summaryText} />
        </div>

        <ul className="space-y-1.5 text-sm text-slate-300">
          {management.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[0.3rem] h-1.5 w-1.5 rounded-full bg-emerald-400/70 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
