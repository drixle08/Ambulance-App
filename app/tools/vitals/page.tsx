"use client";

import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

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
  ageRange: string;
  weightRange?: string;
  hrRange: string;
  rrRange: string;
  sbpRange: string;
  dbpRange: string;
  spo2Target: string;
  notes: string[];
};

const AGE_BANDS: AgeBand[] = [
  {
    id: "neonate",
    label: "Neonate (term – 2 months)",
    ageRange: "0–2 months (term newborn)",
    weightRange: "≈3–4 kg",
    hrRange: "110–160 bpm",
    rrRange: "35–55 /min",
    sbpRange: "65–85 mmHg",
    dbpRange: "45–55 mmHg",
    spo2Target: "≥94% (low <94%)",
    notes: [
      "Based on the 'Term–2 months' row in the paediatric normal vital signs table.",
      "Preterm reference (≈2 kg): HR 110–170, RR 40–70, SBP 55–75, DBP 35–45 – check CPG table if needed for very preterm neonates.",
    ],
  },
  {
    id: "infant",
    label: "Infant (3–12 months)",
    ageRange: "3–12 months",
    weightRange: "≈5–11 kg",
    // Union of 3–7 and 8–12 months rows
    hrRange: "90–160 bpm",
    rrRange: "22–45 /min",
    sbpRange: "70–100 mmHg",
    dbpRange: "50–65 mmHg",
    spo2Target: "≥94% (low <94%)",
    notes: [
      "Ranges merged from 3–7 months and 8–12 months rows (min–max across both).",
      "Treat persistent values outside these ranges as abnormal for age and reassess.",
    ],
  },
  {
    id: "toddler",
    label: "Toddler (1–3 years)",
    ageRange: "1–3 years",
    weightRange: "≈12–15 kg",
    hrRange: "80–150 bpm",
    rrRange: "22–30 /min",
    sbpRange: "90–105 mmHg",
    dbpRange: "55–70 mmHg",
    spo2Target: "≥94% (low <94%)",
    notes: [
      "Directly from the '1–3 years' row of the paediatric normal vital signs table.",
      "Remember age-based hypotension threshold for shock is SBP < (age × 2) + 70.",
    ],
  },
  {
    id: "preschool",
    label: "Preschool (4–5 years)",
    ageRange: "4–5 years",
    weightRange: "≈16–21 kg",
    hrRange: "70–120 bpm",
    rrRange: "20–24 /min",
    sbpRange: "95–110 mmHg",
    dbpRange: "60–75 mmHg",
    spo2Target: "≥94% (low <94%)",
    notes: [
      "Directly from the '4–5 years' row of the paediatric normal vital signs table.",
      "Persistently high RR or HR for age should trigger a search for sepsis, respiratory distress, or shock.",
    ],
  },
  {
    id: "school",
    label: "School-age (6–11 years)",
    ageRange: "6–11 years",
    weightRange: "≈22–40 kg",
    // Union of 6–7, 8–9, 10–11 years rows
    hrRange: "60–120 bpm",
    rrRange: "16–24 /min",
    sbpRange: "95–120 mmHg",
    dbpRange: "60–75 mmHg",
    spo2Target: "≥94% (low <94%)",
    notes: [
      "Ranges merged from 6–7, 8–9 and 10–11 years rows.",
      "In sepsis screening, RR and HR outside the normal age band plus low SBP or SpO₂ <94% elevate risk.",
    ],
  },
  {
    id: "adolescent",
    label: "Adolescent (12–15 years)",
    ageRange: "12–15 years",
    weightRange: "≈41–50 kg",
    // 12–13 and ≥14 rows share the same range
    hrRange: "60–100 bpm",
    rrRange: "12–20 /min",
    sbpRange: "110–135 mmHg",
    dbpRange: "65–85 mmHg",
    spo2Target: "≥94% (low <94%)",
    notes: [
      "Uses the 12–13 and ≥14 years rows from the paediatric normal vital signs table.",
      "Physiology is approaching adult; treat persistent tachycardia, tachypnoea or borderline SBP as red flags.",
    ],
  },
  {
    id: "adult",
    label: "Adult (≥16 years)",
    ageRange: "≥16 years",
    hrRange: "50–99 bpm",
    rrRange: "12–20 /min",
    sbpRange: "110–140 mmHg",
    dbpRange: "60–90 mmHg",
    spo2Target: "≥94% (88–92% if COPD)",
    notes: [
      "Adult normal ranges from the 'NORMAL VITAL SIGNS RANGE FOR ADULTS' table.",
      "In most adults and APO, aim for SpO₂ ≥94%. In COPD exacerbations, target SpO₂ 88–92% as per COPD CPG.",
      "Hypotension for sepsis/qSOFA is SBP ≤100 mmHg; also consider MAP and clinical context.",
    ],
  },
];

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function VitalsByAgePage() {
  const [selectedId, setSelectedId] = useState<AgeBandId>("adult");

  const selectedBand =
    AGE_BANDS.find((band) => band.id === selectedId) ?? AGE_BANDS[0];

  const summaryText = `Normal vitals for ${selectedBand.label} (${selectedBand.ageRange}): HR ${selectedBand.hrRange}, RR ${selectedBand.rrRange}, SBP ${selectedBand.sbpRange}, SpO₂ ${selectedBand.spo2Target}.`;

  function handleReset() {
    setSelectedId("adult");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
              Reference
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              Normal Vitals by Age
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Age-specific heart rate, respiratory rate, and blood pressure ranges
              based on the HMCAS CPG normal vital sign tables (adult and paediatric).
              Use alongside your primary assessment, sepsis screening, and perfusion
              status tools.
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

      {/* Main layout: selector + selected band */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Age band selector */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
              Age bands
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Tap a band to see the CPG-based normal ranges for that age group.
            </p>
            <div className="mt-3 space-y-2">
              {AGE_BANDS.map((band) => {
                const isActive = band.id === selectedId;
                return (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => setSelectedId(band.id)}
                    className={classNames(
                      "w-full rounded-xl px-3 py-2 text-left text-sm border transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      isActive
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-50 text-slate-800 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    <div className="font-medium">{band.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {band.ageRange}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected band detail */}
        <div className="md:col-span-2">
          <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 flex flex-col gap-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  Selected band
                </p>
                <h2 className="mt-1 text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {selectedBand.label}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedBand.ageRange}
                  {selectedBand.weightRange ? ` • ${selectedBand.weightRange}` : null}
                </p>
              </div>
              <CopySummaryButton summaryText={summaryText} />
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-2">
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 dark:bg-slate-900/80 dark:border-slate-800">
                <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                  Heart Rate
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {selectedBand.hrRange}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 dark:bg-slate-900/80 dark:border-slate-800">
                <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                  Respiratory Rate
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {selectedBand.rrRange}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 dark:bg-slate-900/80 dark:border-slate-800">
                <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                  Systolic BP
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {selectedBand.sbpRange}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 dark:bg-slate-900/80 dark:border-slate-800">
                <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                  Diastolic BP
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {selectedBand.dbpRange}
                </dd>
              </div>
            </dl>

            <div className="mt-3 rounded-xl bg-slate-100 border border-slate-200 p-3 text-sm text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.65rem] tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                    Oxygen Saturation Target
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {selectedBand.spo2Target}
                  </p>
                </div>
              </div>
              {selectedBand.notes.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {selectedBand.notes.map((note, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-[0.3rem] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Compact all-bands table */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
            All age bands overview
          </p>
          <p className="text-[0.65rem] text-slate-500 dark:text-slate-500">
            Values from CPG normal vital sign tables (adult & paediatric).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                <th className="text-left px-2 py-2">Age band</th>
                <th className="text-left px-2 py-2">Age range</th>
                <th className="text-left px-2 py-2">HR (bpm)</th>
                <th className="text-left px-2 py-2">RR (/min)</th>
                <th className="text-left px-2 py-2">SBP (mmHg)</th>
                <th className="text-left px-2 py-2">DBP (mmHg)</th>
                <th className="text-left px-2 py-2">SpO₂ target</th>
              </tr>
            </thead>
            <tbody>
              {AGE_BANDS.map((band) => (
                <tr
                  key={band.id}
                  className={classNames(
                    "rounded-xl",
                    band.id === selectedId
                      ? "bg-emerald-50 dark:bg-emerald-500/5"
                      : "bg-slate-50 dark:bg-slate-900/80"
                  )}
                >
                  <td className="px-2 py-2 rounded-l-xl align-top">
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {band.label}
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top text-slate-700 dark:text-slate-300">
                    {band.ageRange}
                  </td>
                  <td className="px-2 py-2 align-top text-slate-700 dark:text-slate-300">
                    {band.hrRange}
                  </td>
                  <td className="px-2 py-2 align-top text-slate-700 dark:text-slate-300">
                    {band.rrRange}
                  </td>
                  <td className="px-2 py-2 align-top text-slate-700 dark:text-slate-300">
                    {band.sbpRange}
                  </td>
                  <td className="px-2 py-2 align-top text-slate-700 dark:text-slate-300">
                    {band.dbpRange}
                  </td>
                  <td className="px-2 py-2 rounded-r-xl align-top text-slate-700 dark:text-slate-300">
                    {band.spo2Target}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[0.7rem] text-slate-600 dark:text-slate-500">
          Always interpret vital signs in context: perfusion, mental status, temperature,
          sepsis screening, and specific CPGs such as respiratory, shock, and cardiac
          guidelines.
        </p>
      </section>
    </div>
  );
}
