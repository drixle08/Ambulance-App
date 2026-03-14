"use client";

import { useState } from "react";
import { ArrowLeft, Heart, Wind, Activity, Droplets, Gauge } from "lucide-react";
import { useRouter } from "next/navigation";
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
  shortLabel: string;
  ageRange: string;
  weightRange?: string;
  hrRange: string;
  rrRange: string;
  sbpRange: string;
  dbpRange: string;
  spo2Target: string;
  hypotensionThreshold?: string;
  notes: string[];
};

const AGE_BANDS: AgeBand[] = [
  {
    id: "neonate",
    label: "Neonate",
    shortLabel: "0–2 mo",
    ageRange: "0–2 months (term newborn)",
    weightRange: "≈3–4 kg",
    hrRange: "110–160",
    rrRange: "35–55",
    sbpRange: "65–85",
    dbpRange: "45–55",
    spo2Target: "≥94%",
    notes: [
      "Preterm (≈2 kg): HR 110–170, RR 40–70, SBP 55–75 — check CPG if very preterm.",
      "Treat persistent values outside range as abnormal and reassess.",
    ],
  },
  {
    id: "infant",
    label: "Infant",
    shortLabel: "3–12 mo",
    ageRange: "3–12 months",
    weightRange: "≈5–11 kg",
    hrRange: "90–160",
    rrRange: "22–45",
    sbpRange: "70–100",
    dbpRange: "50–65",
    spo2Target: "≥94%",
    notes: [
      "Ranges merged from 3–7 months and 8–12 months CPG rows.",
    ],
  },
  {
    id: "toddler",
    label: "Toddler",
    shortLabel: "1–3 yr",
    ageRange: "1–3 years",
    weightRange: "≈12–15 kg",
    hrRange: "80–150",
    rrRange: "22–30",
    sbpRange: "90–105",
    dbpRange: "55–70",
    spo2Target: "≥94%",
    hypotensionThreshold: "SBP < (age×2)+70",
    notes: [
      "Age-based hypotension threshold for shock: SBP < (age × 2) + 70.",
    ],
  },
  {
    id: "preschool",
    label: "Preschool",
    shortLabel: "4–5 yr",
    ageRange: "4–5 years",
    weightRange: "≈16–21 kg",
    hrRange: "70–120",
    rrRange: "20–24",
    sbpRange: "95–110",
    dbpRange: "60–75",
    spo2Target: "≥94%",
    hypotensionThreshold: "SBP < (age×2)+70",
    notes: [
      "Persistently elevated HR or RR for age — consider sepsis, respiratory distress, or shock.",
    ],
  },
  {
    id: "school",
    label: "School-age",
    shortLabel: "6–11 yr",
    ageRange: "6–11 years",
    weightRange: "≈22–40 kg",
    hrRange: "60–120",
    rrRange: "16–24",
    sbpRange: "95–120",
    dbpRange: "60–75",
    spo2Target: "≥94%",
    hypotensionThreshold: "SBP < (age×2)+70",
    notes: [
      "Ranges merged from 6–7, 8–9 and 10–11 years CPG rows.",
    ],
  },
  {
    id: "adolescent",
    label: "Adolescent",
    shortLabel: "12–15 yr",
    ageRange: "12–15 years",
    weightRange: "≈41–50 kg",
    hrRange: "60–100",
    rrRange: "12–20",
    sbpRange: "110–135",
    dbpRange: "65–85",
    spo2Target: "≥94%",
    notes: [
      "Physiology approaching adult — treat persistent tachycardia, tachypnoea, or borderline SBP as red flags.",
    ],
  },
  {
    id: "adult",
    label: "Adult",
    shortLabel: "≥16 yr",
    ageRange: "≥16 years",
    hrRange: "50–99",
    rrRange: "12–20",
    sbpRange: "110–140",
    dbpRange: "60–90",
    spo2Target: "≥94% (88–92% if COPD)",
    notes: [
      "COPD exacerbation: target SpO₂ 88–92% as per COPD CPG.",
      "Sepsis/qSOFA hypotension: SBP ≤100 mmHg.",
    ],
  },
];

type VitalCard = {
  key: keyof AgeBand;
  label: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const VITAL_CARDS: VitalCard[] = [
  {
    key: "hrRange",
    label: "Heart Rate",
    unit: "bpm",
    icon: <Heart className="w-5 h-5" />,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
  {
    key: "rrRange",
    label: "Resp Rate",
    unit: "/min",
    icon: <Wind className="w-5 h-5" />,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/30",
  },
  {
    key: "sbpRange",
    label: "Systolic BP",
    unit: "mmHg",
    icon: <Activity className="w-5 h-5" />,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
  },
  {
    key: "dbpRange",
    label: "Diastolic BP",
    unit: "mmHg",
    icon: <Droplets className="w-5 h-5" />,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/30",
  },
  {
    key: "spo2Target",
    label: "SpO₂ Target",
    unit: "",
    icon: <Gauge className="w-5 h-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
];

export default function VitalsByAgePage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<AgeBandId>("adult");

  const band = AGE_BANDS.find((b) => b.id === selectedId) ?? AGE_BANDS[AGE_BANDS.length - 1];

  const summaryText = `Normal vitals — ${band.label} (${band.ageRange}): HR ${band.hrRange} bpm, RR ${band.rrRange}/min, SBP ${band.sbpRange} mmHg, DBP ${band.dbpRange} mmHg, SpO₂ ${band.spo2Target}.`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-8">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-amber-400">
              Reference
            </p>
            <h1 className="text-base font-bold leading-tight text-slate-100 truncate">
              Normal Vitals by Age
            </h1>
          </div>
          <CopySummaryButton summaryText={summaryText} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        {/* Age band selector */}
        <section>
          <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-slate-500 mb-3">
            Select Age Band
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {AGE_BANDS.map((b) => {
              const isActive = b.id === selectedId;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedId(b.id)}
                  className={[
                    "flex flex-col items-center justify-center rounded-xl px-1 py-3 border text-center transition-all active:scale-95",
                    isActive
                      ? "border-amber-500 bg-amber-500/15 text-amber-300"
                      : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200",
                  ].join(" ")}
                >
                  <span className={["text-[0.7rem] font-bold leading-tight", isActive ? "text-amber-200" : "text-slate-300"].join(" ")}>
                    {b.label}
                  </span>
                  <span className="text-[0.6rem] mt-0.5 leading-tight">
                    {b.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected band info */}
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1">
          <div>
            <p className="text-lg font-bold text-amber-300">{band.label}</p>
            <p className="text-xs text-slate-400">{band.ageRange}</p>
          </div>
          {band.weightRange && (
            <div className="text-xs">
              <span className="text-slate-500">Est. weight</span>{" "}
              <span className="font-semibold text-slate-200">{band.weightRange}</span>
            </div>
          )}
          {band.hypotensionThreshold && (
            <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1.5">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-red-400">Hypotension</span>
              <span className="text-xs font-mono font-semibold text-red-300">{band.hypotensionThreshold}</span>
            </div>
          )}
        </section>

        {/* Vital sign cards */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {VITAL_CARDS.map((card) => {
            const value = band[card.key] as string;
            return (
              <div
                key={card.key as string}
                className={["rounded-xl border p-4 flex flex-col gap-2", card.bg].join(" ")}
              >
                <div className={["flex items-center gap-2", card.color].join(" ")}>
                  {card.icon}
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider">{card.label}</span>
                </div>
                <p className="text-2xl font-black text-slate-100 leading-none">{value}</p>
                {card.unit && (
                  <p className="text-[0.65rem] text-slate-500 font-medium">{card.unit}</p>
                )}
              </div>
            );
          })}
        </section>

        {/* Notes */}
        {band.notes.length > 0 && (
          <section className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 space-y-1.5">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Notes</p>
            {band.notes.map((note, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
                <p className="text-sm text-slate-300">{note}</p>
              </div>
            ))}
          </section>
        )}

        {/* All bands overview table */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">All Age Bands Overview</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-3 py-2 text-[0.6rem] uppercase tracking-wider text-slate-500 font-semibold">Age</th>
                  <th className="text-left px-3 py-2 text-[0.6rem] uppercase tracking-wider text-slate-500 font-semibold">HR</th>
                  <th className="text-left px-3 py-2 text-[0.6rem] uppercase tracking-wider text-slate-500 font-semibold">RR</th>
                  <th className="text-left px-3 py-2 text-[0.6rem] uppercase tracking-wider text-slate-500 font-semibold">SBP</th>
                  <th className="text-left px-3 py-2 text-[0.6rem] uppercase tracking-wider text-slate-500 font-semibold">DBP</th>
                  <th className="text-left px-3 py-2 text-[0.6rem] uppercase tracking-wider text-slate-500 font-semibold">SpO₂</th>
                </tr>
              </thead>
              <tbody>
                {AGE_BANDS.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={[
                      "border-b border-slate-800/50 last:border-0 cursor-pointer transition-colors",
                      b.id === selectedId
                        ? "bg-amber-500/10"
                        : "hover:bg-slate-800/50",
                    ].join(" ")}
                  >
                    <td className="px-3 py-2">
                      <span className={["font-semibold", b.id === selectedId ? "text-amber-300" : "text-slate-300"].join(" ")}>
                        {b.label}
                      </span>
                      <div className="text-[0.6rem] text-slate-600">{b.shortLabel}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-300 font-mono">{b.hrRange}</td>
                    <td className="px-3 py-2 text-slate-300 font-mono">{b.rrRange}</td>
                    <td className="px-3 py-2 text-slate-300 font-mono">{b.sbpRange}</td>
                    <td className="px-3 py-2 text-slate-300 font-mono">{b.dbpRange}</td>
                    <td className="px-3 py-2 text-slate-300">{b.spo2Target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-[0.65rem] text-slate-600 text-center pb-2">
          Interpret vital signs in clinical context — perfusion, mental status, temperature, and relevant CPGs.
        </p>
      </div>
    </div>
  );
}
