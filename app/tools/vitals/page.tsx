"use client";

import Link from "next/link";
import { useState } from "react";
import { CopySummaryButton } from "../../_components/CopySummaryButton";

type AgeBandId =
  | "neonate"
  | "infant"
  | "toddler"
  | "preschool"
  | "school"
  | "adolescent"
  | "adult";

type AgeBand = {
  id: AgeBandId;
  label: string;
  range: string;
  hr: string;
  rr: string;
  sbp: string;
  spo2: string;
  notes?: string;
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Approximate textbook / CPG-style ranges.
// If your CPG updates, you only need to edit this array.
const ageBands: AgeBand[] = [
  {
    id: "neonate",
    label: "Neonate",
    range: "0–3 months",
    hr: "100–180 bpm",
    rr: "30–60 breaths/min",
    sbp: "60–90 mmHg",
    spo2: "≥ 94% (if no chronic lung disease)",
    notes: "Higher baseline HR and RR are normal. Watch for apnoeas and poor feeding.",
  },
  {
    id: "infant",
    label: "Infant",
    range: "3–12 months",
    hr: "100–160 bpm",
    rr: "30–60 breaths/min",
    sbp: "80–100 mmHg",
    spo2: "≥ 94%",
    notes: "Crying or fever can transiently increase HR and RR.",
  },
  {
    id: "toddler",
    label: "Toddler",
    range: "1–3 years",
    hr: "90–150 bpm",
    rr: "24–40 breaths/min",
    sbp: "80–110 mmHg",
    spo2: "≥ 94%",
    notes: "Assess work of breathing, accessory muscle use and behaviour.",
  },
  {
    id: "preschool",
    label: "Preschool",
    range: "3–5 years",
    hr: "80–140 bpm",
    rr: "22–34 breaths/min",
    sbp: "80–110 mmHg",
    spo2: "≥ 94%",
    notes: "Trend vitals over time; consider pain, fever and anxiety.",
  },
  {
    id: "school",
    label: "School-age",
    range: "6–12 years",
    hr: "70–120 bpm",
    rr: "18–30 breaths/min",
    sbp: "80–120 mmHg",
    spo2: "≥ 94%",
    notes: "Tachycardia and tachypnoea can be early signs of shock or sepsis.",
  },
  {
    id: "adolescent",
    label: "Adolescent",
    range: "13–17 years",
    hr: "60–100 bpm",
    rr: "12–20 breaths/min",
    sbp: "90–130 mmHg",
    spo2: "≥ 94%",
    notes: "Values begin to approximate adult ranges; interpret with clinical context.",
  },
  {
    id: "adult",
    label: "Adult",
    range: "≥ 18 years",
    hr: "60–100 bpm",
    rr: "12–20 breaths/min",
    sbp: "100–140 mmHg",
    spo2: "≥ 94% (or patient baseline, e.g. COPD)",
    notes: "Always compare to patient baseline and medications (e.g. beta-blockers).",
  },
];

export default function VitalsByAgePage() {
  const [selectedId, setSelectedId] = useState<AgeBandId>("adult");

  const selected = ageBands.find((b) => b.id === selectedId) ?? ageBands[0];

  const summaryText = `Normal vitals band – ${selected.label} (${selected.range}): HR ${selected.hr}, RR ${selected.rr}, SBP ${selected.sbp}, SpO₂ target ${selected.spo2}. Ranges adapted from CPG-style reference; interpret with trends, patient baseline and full clinical picture.`;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-400 hover:text-emerald-400"
          >
            ← Back to dashboard
          </Link>

          <CopySummaryButton summaryText={summaryText} />
        </div>

        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Reference
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Normal Vitals by Age
          </h1>
          <p className="text-sm text-slate-400">
            Quick reference for typical heart rate, respiratory rate, systolic
            blood pressure and SpO₂ by age band. Values are approximate
            CPG-style ranges and must be adapted to your local guideline and
            patient context.
          </p>
        </header>

        {/* Age band selector + summary */}
        <section className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
          {/* Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Choose age band
            </p>
            <div className="flex flex-wrap gap-2">
              {ageBands.map((band) => {
                const isActive = band.id === selected.id;
                return (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => setSelectedId(band.id)}
                    className={classNames(
                      "rounded-xl border px-3 py-2 text-xs text-left transition",
                      "border-slate-700 bg-slate-950 hover:border-emerald-400/70 hover:bg-slate-900",
                      isActive &&
                        "border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow-sm"
                    )}
                  >
                    <span className="block font-medium">{band.label}</span>
                    <span className="block text-[10px] text-slate-400">
                      {band.range}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400/80">
              Selected band
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {selected.label}{" "}
              <span className="text-sm font-normal text-slate-400">
                ({selected.range})
              </span>
            </h2>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-slate-400 text-xs uppercase tracking-[0.18em]">
                  Heart rate
                </dt>
                <dd className="font-medium">{selected.hr}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-slate-400 text-xs uppercase tracking-[0.18em]">
                  Respiratory rate
                </dt>
                <dd className="font-medium">{selected.rr}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-slate-400 text-xs uppercase tracking-[0.18em]">
                  Systolic BP
                </dt>
                <dd className="font-medium">{selected.sbp}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-slate-400 text-xs uppercase tracking-[0.18em]">
                  SpO₂ target
                </dt>
                <dd className="font-medium">{selected.spo2}</dd>
              </div>
            </dl>

            {selected.notes && (
              <p className="mt-3 text-[11px] text-slate-400">
                {selected.notes}
              </p>
            )}
          </div>
        </section>

        {/* Mini table of all ranges */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs overflow-x-auto">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            Full age band overview
          </p>
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="py-2 pr-3 font-medium">Age band</th>
                <th className="py-2 pr-3 font-medium">HR (bpm)</th>
                <th className="py-2 pr-3 font-medium">RR (breaths/min)</th>
                <th className="py-2 pr-3 font-medium">Systolic BP (mmHg)</th>
                <th className="py-2 pr-3 font-medium">SpO₂ target</th>
              </tr>
            </thead>
            <tbody>
              {ageBands.map((band) => (
                <tr
                  key={band.id}
                  className={classNames(
                    "border-b border-slate-900/80",
                    band.id === selected.id && "bg-slate-900"
                  )}
                >
                  <td className="py-2 pr-3 align-top">
                    <div className="font-medium text-slate-100">
                      {band.label}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {band.range}
                    </div>
                  </td>
                  <td className="py-2 pr-3 align-top">{band.hr}</td>
                  <td className="py-2 pr-3 align-top">{band.rr}</td>
                  <td className="py-2 pr-3 align-top">{band.sbp}</td>
                  <td className="py-2 pr-3 align-top">{band.spo2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="pt-2 text-[11px] text-slate-500">
          These ranges are approximate and for educational / decision-support
          use only. Always refer to your ambulance service CPG (v2.4) and
          consider the whole clinical picture, trends over time and patient
          baseline.
        </p>
      </div>
    </main>
  );
}
