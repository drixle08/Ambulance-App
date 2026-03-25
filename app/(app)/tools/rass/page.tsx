"use client";

import { useState } from "react";

// ─── RASS data ────────────────────────────────────────────────────────────────

type RassEntry = {
  score: number;
  label: string;
  description: string;
  zone: "agitated" | "alert" | "light" | "moderate" | "deep";
  color: {
    row: string;
    badge: string;
    score: string;
    result: string;
    resultBorder: string;
  };
};

const RASS: RassEntry[] = [
  {
    score: +4,
    label: "Combative",
    description: "Overtly combative, violent, immediate danger to staff",
    zone: "agitated",
    color: {
      row: "bg-red-950/50 border-red-800/60 active:bg-red-900/60",
      badge: "bg-red-900 text-red-300",
      score: "text-red-400",
      result: "bg-red-950/60",
      resultBorder: "border-red-700",
    },
  },
  {
    score: +3,
    label: "Very Agitated",
    description: "Pulls/removes tubes or catheters, or has aggressive behaviour toward staff",
    zone: "agitated",
    color: {
      row: "bg-red-950/40 border-red-800/40 active:bg-red-900/50",
      badge: "bg-red-900/80 text-red-300",
      score: "text-red-400",
      result: "bg-red-950/60",
      resultBorder: "border-red-700",
    },
  },
  {
    score: +2,
    label: "Agitated",
    description: "Frequent non-purposeful movement, fights ventilator",
    zone: "agitated",
    color: {
      row: "bg-orange-950/40 border-orange-800/40 active:bg-orange-900/50",
      badge: "bg-orange-900/80 text-orange-300",
      score: "text-orange-400",
      result: "bg-orange-950/60",
      resultBorder: "border-orange-700",
    },
  },
  {
    score: +1,
    label: "Restless",
    description: "Anxious but movements not aggressive or vigorous",
    zone: "agitated",
    color: {
      row: "bg-amber-950/40 border-amber-800/40 active:bg-amber-900/50",
      badge: "bg-amber-900/80 text-amber-300",
      score: "text-amber-400",
      result: "bg-amber-950/60",
      resultBorder: "border-amber-700",
    },
  },
  {
    score: 0,
    label: "Alert & Calm",
    description: "Spontaneously pays attention to caregiver",
    zone: "alert",
    color: {
      row: "bg-emerald-950/40 border-emerald-800/40 active:bg-emerald-900/50",
      badge: "bg-emerald-900/80 text-emerald-300",
      score: "text-emerald-400",
      result: "bg-emerald-950/60",
      resultBorder: "border-emerald-700",
    },
  },
  {
    score: -1,
    label: "Drowsy",
    description: "Not fully alert, but sustained awakening (eye opening/contact) to voice >10 sec",
    zone: "light",
    color: {
      row: "bg-sky-950/40 border-sky-800/40 active:bg-sky-900/50",
      badge: "bg-sky-900/80 text-sky-300",
      score: "text-sky-400",
      result: "bg-sky-950/60",
      resultBorder: "border-sky-700",
    },
  },
  {
    score: -2,
    label: "Light Sedation",
    description: "Briefly awakens to voice with eye opening/contact <10 sec",
    zone: "light",
    color: {
      row: "bg-sky-950/50 border-sky-800/50 active:bg-sky-900/60",
      badge: "bg-sky-900 text-sky-300",
      score: "text-sky-400",
      result: "bg-sky-950/60",
      resultBorder: "border-sky-700",
    },
  },
  {
    score: -3,
    label: "Moderate Sedation",
    description: "Movement or eye opening to voice, but no eye contact",
    zone: "moderate",
    color: {
      row: "bg-violet-950/40 border-violet-800/40 active:bg-violet-900/50",
      badge: "bg-violet-900/80 text-violet-300",
      score: "text-violet-400",
      result: "bg-violet-950/60",
      resultBorder: "border-violet-700",
    },
  },
  {
    score: -4,
    label: "Deep Sedation",
    description: "No response to voice, but movement or eye opening to physical stimulation",
    zone: "deep",
    color: {
      row: "bg-slate-800/60 border-slate-700/60 active:bg-slate-700/60",
      badge: "bg-slate-700 text-slate-300",
      score: "text-slate-400",
      result: "bg-slate-800/60",
      resultBorder: "border-slate-600",
    },
  },
  {
    score: -5,
    label: "Unarousable",
    description: "No response to voice or physical stimulation",
    zone: "deep",
    color: {
      row: "bg-slate-900/80 border-slate-700/40 active:bg-slate-800/80",
      badge: "bg-slate-800 text-slate-400",
      score: "text-slate-500",
      result: "bg-slate-900/80",
      resultBorder: "border-slate-700",
    },
  },
];

// ─── Clinical guidance per zone ───────────────────────────────────────────────

const ZONE_GUIDANCE: Record<string, { title: string; points: string[]; color: string }> = {
  agitated: {
    title: "Over-sedation / Agitation",
    points: [
      "Assess for pain, delirium, or inadequate analgesia first",
      "Ensure ETT position and ventilator synchrony if intubated",
      "Titrate sedation only after analgesia is optimised (analgesia-first model)",
      "Consider PRN sedative bolus if non-pharmacological measures fail",
      "Document agitation cause and interventions",
    ],
    color: "text-red-300 border-red-800 bg-red-950/30",
  },
  alert: {
    title: "Alert & Calm — Target Range (non-ventilated)",
    points: [
      "Ideal for spontaneously breathing patients",
      "Minimise sedation to maintain this level",
      "Reassess regularly — target may vary per clinical scenario",
      "Suitable for Spontaneous Awakening Trial (SAT) consideration",
    ],
    color: "text-emerald-300 border-emerald-800 bg-emerald-950/30",
  },
  light: {
    title: "Light Sedation — Target Range (ventilated)",
    points: [
      "Preferred target for most mechanically ventilated patients (PADIS 2018)",
      "RASS −2 to 0 associated with shorter ventilation and ICU stay",
      "Assess for SAT readiness: no active seizures, FiO₂ ≤70%, PEEP ≤10, no vasopressor escalation",
      "If on infusion: consider daily spontaneous awakening trials (SAT)",
      "Reassess pain (CPOT/NRS) in parallel",
    ],
    color: "text-sky-300 border-sky-800 bg-sky-950/30",
  },
  moderate: {
    title: "Moderate Sedation",
    points: [
      "Acceptable during active procedures or transport",
      "Goal-directed: define a clinical endpoint (e.g. procedure complete, haemodynamics stable)",
      "Avoid as a steady state unless clinically necessary",
      "Monitor airway patency and respiratory effort closely",
      "Titrate toward light sedation when safe",
    ],
    color: "text-violet-300 border-violet-800 bg-violet-950/30",
  },
  deep: {
    title: "Deep Sedation / Unarousable",
    points: [
      "Reserved for: ICP management, refractory status epilepticus, severe ARDS (prone/NMBA)",
      "Assess for unintended deep sedation — evaluate sedation infusion rate",
      "RASS −5 in absence of a specific indication may signal neurological deterioration",
      "Perform neurological assessment: pupils, GCS off sedation if safe",
      "Document sedation indication and review daily",
    ],
    color: "text-slate-300 border-slate-600 bg-slate-800/40",
  },
};

// ─── Assessment steps helper ──────────────────────────────────────────────────

const ASSESSMENT_STEPS = [
  {
    step: "Step 1 — Observe",
    instruction: "Without stimulation, observe the patient.",
    options: [
      { label: "+4  Combative", score: 4 },
      { label: "+3  Very Agitated", score: 3 },
      { label: "+2  Agitated", score: 2 },
      { label: "+1  Restless", score: 1 },
      { label: "0    Alert & Calm", score: 0 },
      { label: "→   Not spontaneously alert — continue to Step 2", score: null },
    ],
  },
  {
    step: "Step 2 — Verbal Stimulation",
    instruction: "Call patient's name in a normal then loud voice; ask them to open their eyes.",
    options: [
      { label: "−1  Opens eyes / eye contact  > 10 sec", score: -1 },
      { label: "−2  Opens eyes / eye contact  < 10 sec", score: -2 },
      { label: "−3  Movement or eye opening, no eye contact", score: -3 },
      { label: "→   No response to voice — continue to Step 3", score: null },
    ],
  },
  {
    step: "Step 3 — Physical Stimulation",
    instruction: "Shoulder shaking or sternal rub.",
    options: [
      { label: "−4  Movement or eye opening to physical stimulation", score: -4 },
      { label: "−5  No response to voice or physical stimulation", score: -5 },
    ],
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

type TabType = "quick" | "guided" | "scale";

export default function RassPage() {
  const [tab, setTab] = useState<TabType>("quick");
  const [selected, setSelected] = useState<number | null>(null);
  const [guidedStep, setGuidedStep] = useState(0);

  const selectedEntry = selected !== null ? RASS.find((r) => r.score === selected) ?? null : null;
  const guidance = selectedEntry ? ZONE_GUIDANCE[selectedEntry.zone] : null;

  const handleSelect = (score: number) => setSelected(score);

  const resetGuided = () => {
    setGuidedStep(0);
    setSelected(null);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "quick", label: "Quick Select" },
    { id: "guided", label: "Guided" },
    { id: "scale", label: "Full Scale" },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <header className="mb-4 space-y-0.5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-violet-500">
          Assessment & Screening
        </p>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Sedation Assessment (RASS)</h1>
        <p className="text-xs text-slate-500">Richmond Agitation-Sedation Scale · −5 to +4</p>
      </header>

      {/* Target banner */}
      <div className="mb-4 rounded-xl border border-sky-800/50 bg-sky-950/30 px-3 py-2 flex items-start gap-2">
        <span className="mt-0.5 text-[0.6rem] font-black uppercase tracking-widest text-sky-500 shrink-0">Target</span>
        <p className="text-xs text-sky-300">
          <strong>Ventilated:</strong> RASS −2 to 0 &nbsp;·&nbsp; <strong>Non-ventilated:</strong> RASS 0 &nbsp;·&nbsp;
          <strong>Procedures:</strong> RASS −3 to −4
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex border-b border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setSelected(null); resetGuided(); }}
            className={`flex-1 pb-2 pt-1.5 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "text-violet-300 border-b-2 border-violet-500"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── QUICK SELECT ── */}
      {tab === "quick" && (
        <div className="space-y-2">
          {RASS.map((r) => (
            <button
              key={r.score}
              type="button"
              onClick={() => handleSelect(r.score)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${r.color.row} ${
                selected === r.score ? "ring-2 ring-white/20" : ""
              }`}
            >
              <span className={`w-8 shrink-0 text-center text-lg font-black tabular-nums ${r.color.score}`}>
                {r.score > 0 ? `+${r.score}` : r.score}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${r.color.score}`}>{r.label}</p>
                <p className="text-xs text-slate-500 leading-snug truncate">{r.description}</p>
              </div>
              {selected === r.score && (
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ${r.color.badge}`}>
                  Selected
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── GUIDED ASSESSMENT ── */}
      {tab === "guided" && selected === null && (
        <div className="space-y-4">
          {ASSESSMENT_STEPS.map((step, si) => (
            <div
              key={si}
              className={`rounded-2xl border p-4 space-y-3 transition-all ${
                si === guidedStep
                  ? "border-violet-700/60 bg-violet-950/20"
                  : si < guidedStep
                  ? "border-slate-800 bg-slate-900/20 opacity-40"
                  : "border-slate-800/40 bg-slate-900/10 opacity-30"
              }`}
            >
              <div>
                <p className={`text-[0.65rem] font-black uppercase tracking-widest ${si === guidedStep ? "text-violet-500" : "text-slate-600"}`}>
                  {step.step}
                </p>
                <p className={`text-sm mt-0.5 ${si === guidedStep ? "text-slate-300" : "text-slate-600"}`}>
                  {step.instruction}
                </p>
              </div>
              {si === guidedStep && (
                <div className="space-y-2">
                  {step.options.map((opt, oi) => (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => {
                        if (opt.score !== null) {
                          handleSelect(opt.score);
                        } else {
                          setGuidedStep((p) => p + 1);
                        }
                      }}
                      className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-all active:scale-95 ${
                        opt.score === null
                          ? "border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-700/60"
                          : "border-violet-800/40 bg-violet-950/30 text-slate-200 hover:bg-violet-900/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={resetGuided}
            className="text-xs text-slate-600 hover:text-slate-400 underline"
          >
            Reset
          </button>
        </div>
      )}

      {tab === "guided" && selected !== null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Assessment complete</p>
            <button
              type="button"
              onClick={resetGuided}
              className="text-xs text-violet-400 hover:text-violet-300 underline"
            >
              Reassess
            </button>
          </div>
        </div>
      )}

      {/* ── FULL SCALE REFERENCE ── */}
      {tab === "scale" && (
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <div className="grid grid-cols-[3rem_7rem_1fr] text-[0.6rem] font-black uppercase tracking-widest text-slate-600 border-b border-slate-800 px-3 py-2 gap-2">
            <span>Score</span>
            <span>Label</span>
            <span>Description</span>
          </div>
          {RASS.map((r) => (
            <button
              key={r.score}
              type="button"
              onClick={() => { setTab("quick"); handleSelect(r.score); }}
              className={`w-full grid grid-cols-[3rem_7rem_1fr] gap-2 border-b border-slate-800/60 px-3 py-2.5 text-left last:border-0 transition-all active:brightness-110 ${r.color.row.split("active:")[0]}`}
            >
              <span className={`text-sm font-black tabular-nums ${r.color.score}`}>
                {r.score > 0 ? `+${r.score}` : r.score}
              </span>
              <span className={`text-xs font-bold leading-tight self-center ${r.color.score}`}>{r.label}</span>
              <span className="text-[0.65rem] text-slate-500 leading-snug self-center">{r.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── RESULT CARD (shown when score is selected) ── */}
      {selectedEntry && guidance && (
        <div className={`mt-5 rounded-2xl border p-4 space-y-3 ${selectedEntry.color.result} ${selectedEntry.color.resultBorder}`}>
          {/* Score display */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">RASS Score</p>
              <p className={`text-4xl font-black tabular-nums mt-0.5 ${selectedEntry.color.score}`}>
                {selectedEntry.score > 0 ? `+${selectedEntry.score}` : selectedEntry.score}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-base font-bold ${selectedEntry.color.score}`}>{selectedEntry.label}</p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-[180px] leading-snug">{selectedEntry.description}</p>
            </div>
          </div>

          {/* Zone guidance */}
          <div className={`rounded-xl border p-3 space-y-2 ${guidance.color}`}>
            <p className="text-[0.65rem] font-black uppercase tracking-widest opacity-70">{guidance.title}</p>
            <ul className="space-y-1.5">
              {guidance.points.map((pt, i) => (
                <li key={i} className="flex gap-2 text-xs leading-snug">
                  <span className="opacity-40 shrink-0">·</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clear */}
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400 pt-1"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}
