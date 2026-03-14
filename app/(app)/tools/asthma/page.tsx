"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  RotateCcw,
  Brain,
  MessageCircle,
  Stethoscope,
  Wind,
  HeartPulse,
  Activity,
  Baby,
  User,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Severity = "mild" | "moderate" | "severe";
type PatientType = "adult" | "paeds";

type AdultMental = "alert" | "drowsy" | "reduced";
type AdultSpeech = "sentences" | "phrases" | "words-unable";
type AdultWheeze = "exp-only" | "all-fields" | "severe-silent";
type AdultRR = "<24" | "24-29" | ">29";

type PaedsBehaviour =
  | "alert-normal"
  | "alert-agitated"
  | "agitated-unable"
  | "confused";
type PaedsAirEntry = "wheeze-cough" | "silent-chest";
type PaedsSpO2 = "normal" | "low" | "unknown";
type PaedsHR = "normal" | "120-140" | "very-high";
type PaedsRR = "<30" | ">30" | "marked";

type OptionSeverity = "mild" | "moderate" | "severe" | "neutral";

// ─── Severity Styles ─────────────────────────────────────────────────────────

const SEV_STYLES: Record<
  Severity,
  { label: string; border: string; bg: string; text: string; barBg: string; barText: string; barBorder: string }
> = {
  mild: {
    label: "Mild",
    border: "border-emerald-500/70",
    bg: "bg-emerald-950/50",
    text: "text-emerald-300",
    barBg: "bg-emerald-950/80",
    barText: "text-emerald-300",
    barBorder: "border-emerald-700",
  },
  moderate: {
    label: "Moderate",
    border: "border-amber-500/70",
    bg: "bg-amber-950/50",
    text: "text-amber-300",
    barBg: "bg-amber-950/80",
    barText: "text-amber-300",
    barBorder: "border-amber-700",
  },
  severe: {
    label: "Severe",
    border: "border-rose-500/70",
    bg: "bg-rose-950/50",
    text: "text-rose-300",
    barBg: "bg-rose-950/80",
    barText: "text-rose-300",
    barBorder: "border-rose-700",
  },
};

const OPT_DOT: Record<OptionSeverity, string> = {
  mild: "bg-emerald-500",
  moderate: "bg-amber-500",
  severe: "bg-rose-500",
  neutral: "bg-slate-500",
};

const OPT_SELECTED: Record<OptionSeverity, string> = {
  mild: "border-emerald-500/70 bg-emerald-950/50 text-white",
  moderate: "border-amber-500/70 bg-amber-950/50 text-white",
  severe: "border-rose-500/70 bg-rose-950/50 text-white",
  neutral: "border-slate-500/70 bg-slate-800 text-white",
};

// ─── Classification ───────────────────────────────────────────────────────────

function classifyAdult(
  mental: AdultMental,
  speech: AdultSpeech,
  wheeze: AdultWheeze,
  rr: AdultRR
): Severity {
  if (
    mental === "reduced" ||
    wheeze === "severe-silent" ||
    speech === "words-unable" ||
    rr === ">29"
  )
    return "severe";
  if (
    mental === "drowsy" ||
    wheeze === "all-fields" ||
    speech === "phrases" ||
    rr === "24-29"
  )
    return "moderate";
  return "mild";
}

function classifyPaeds(
  behaviour: PaedsBehaviour,
  airEntry: PaedsAirEntry,
  spo2: PaedsSpO2,
  hr: PaedsHR,
  rr: PaedsRR
): Severity {
  if (
    behaviour === "agitated-unable" ||
    behaviour === "confused" ||
    airEntry === "silent-chest" ||
    spo2 === "low" ||
    hr === "very-high" ||
    rr === "marked"
  )
    return "severe";
  if (behaviour === "alert-agitated" || hr === "120-140" || rr === ">30")
    return "moderate";
  return "mild";
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AsthmaPage() {
  const [patientType, setPatientType] = useState<PatientType>("adult");

  // Adult
  const [adultMental, setAdultMental] = useState<AdultMental>("alert");
  const [adultSpeech, setAdultSpeech] = useState<AdultSpeech>("sentences");
  const [adultWheeze, setAdultWheeze] = useState<AdultWheeze>("exp-only");
  const [adultRR, setAdultRR] = useState<AdultRR>("<24");

  // Paeds
  const [paedsBehaviour, setPaedsBehaviour] =
    useState<PaedsBehaviour>("alert-normal");
  const [paedsAirEntry, setPaedsAirEntry] =
    useState<PaedsAirEntry>("wheeze-cough");
  const [paedsSpO2, setPaedsSpO2] = useState<PaedsSpO2>("normal");
  const [paedsHR, setPaedsHR] = useState<PaedsHR>("normal");
  const [paedsRR, setPaedsRR] = useState<PaedsRR>("<30");

  const severity: Severity =
    patientType === "adult"
      ? classifyAdult(adultMental, adultSpeech, adultWheeze, adultRR)
      : classifyPaeds(
          paedsBehaviour,
          paedsAirEntry,
          paedsSpO2,
          paedsHR,
          paedsRR
        );

  const sev = SEV_STYLES[severity];

  const actions: Record<Severity, string[]> = {
    mild: [
      "Short-acting bronchodilator (salbutamol) via pMDI + spacer or nebuliser per CPG.",
      "Monitor response, RR, work of breathing. Transport if poor response or high-risk history.",
    ],
    moderate: [
      "Repeat short-acting bronchodilator. Add ipratropium per CPG dose chart.",
      "Titrate oxygen only if hypoxic. Monitor closely and transport to ED.",
      "Prenotify if deteriorating or poor response after initial therapy.",
    ],
    severe: [
      "Time-critical — aggressive bronchodilator + ipratropium. Early IV access per CPG.",
      "Support ventilation. Prepare for advanced airway / RSI (CCP/ED) if tiring or ↓ LOC.",
      "Priority transport with prenotification. Involve Clinical Coordination early.",
    ],
  };

  function handleReset() {
    setAdultMental("alert");
    setAdultSpeech("sentences");
    setAdultWheeze("exp-only");
    setAdultRR("<24");
    setPaedsBehaviour("alert-normal");
    setPaedsAirEntry("wheeze-cough");
    setPaedsSpO2("normal");
    setPaedsHR("normal");
    setPaedsRR("<30");
  }

  const summaryText =
    `${patientType === "adult" ? "Adult" : "Paediatric"} asthma severity: ${sev.label}. ` +
    (patientType === "adult"
      ? `Mental state: ${adultMental}; speech: ${adultSpeech}; wheeze: ${adultWheeze}; RR: ${adultRR}.`
      : `Behaviour: ${paedsBehaviour}; air entry: ${paedsAirEntry}; SpO₂: ${paedsSpO2}; HR: ${paedsHR}; RR: ${paedsRR}.`) +
    ` Actions: ${actions[severity][0]}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-44">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/respiratory-airway"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400">
              Respiratory
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              Asthma Severity
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        {/* ── Patient Type Toggle ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPatientType("adult")}
            className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors text-left ${
              patientType === "adult"
                ? "border-sky-500/70 bg-sky-950/50"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                patientType === "adult"
                  ? "bg-sky-900/60 text-sky-400"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Adult</p>
              <p className="text-[11px] text-slate-400">≥ 14 years</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPatientType("paeds")}
            className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors text-left ${
              patientType === "paeds"
                ? "border-emerald-500/70 bg-emerald-950/50"
                : "border-slate-700 bg-slate-900 hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                patientType === "paeds"
                  ? "bg-emerald-900/60 text-emerald-400"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Paediatric</p>
              <p className="text-[11px] text-slate-400">&lt; 14 years</p>
            </div>
          </button>
        </div>

        {/* ── Severity Legend ── */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-slate-600 uppercase tracking-wider">
            Key:
          </span>
          {(["mild", "moderate", "severe"] as Severity[]).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${OPT_DOT[s]}`} />
              <span className="text-[10px] text-slate-500 capitalize">{s}</span>
            </span>
          ))}
        </div>

        {/* ── Adult Assessment ── */}
        {patientType === "adult" && (
          <div className="space-y-3">
            <AssessRow
              label="Mental State"
              icon={<Brain className="w-4 h-4 text-sky-400" />}
              options={[
                { id: "alert", label: "Alert", severity: "mild" },
                { id: "drowsy", label: "Alert or drowsy", severity: "moderate" },
                {
                  id: "reduced",
                  label: "Reduced / ↓ LOC",
                  severity: "severe",
                },
              ]}
              value={adultMental}
              onChange={(v) => setAdultMental(v as AdultMental)}
            />

            <AssessRow
              label="Speech"
              icon={<MessageCircle className="w-4 h-4 text-sky-400" />}
              options={[
                {
                  id: "sentences",
                  label: "Full sentences",
                  severity: "mild",
                },
                { id: "phrases", label: "Phrases", severity: "moderate" },
                {
                  id: "words-unable",
                  label: "Words / unable",
                  severity: "severe",
                },
              ]}
              value={adultSpeech}
              onChange={(v) => setAdultSpeech(v as AdultSpeech)}
            />

            <AssessRow
              label="Auscultation"
              icon={<Stethoscope className="w-4 h-4 text-sky-400" />}
              options={[
                {
                  id: "exp-only",
                  label: "Exp. wheeze only",
                  severity: "mild",
                },
                {
                  id: "all-fields",
                  label: "All lung fields",
                  severity: "moderate",
                },
                {
                  id: "severe-silent",
                  label: "Severe / silent",
                  severity: "severe",
                },
              ]}
              value={adultWheeze}
              onChange={(v) => setAdultWheeze(v as AdultWheeze)}
            />

            <AssessRow
              label="Resp. Rate"
              icon={<Wind className="w-4 h-4 text-sky-400" />}
              options={[
                { id: "<24", label: "< 24 bpm", severity: "mild" },
                { id: "24-29", label: "24–29 bpm", severity: "moderate" },
                { id: ">29", label: "> 29 bpm", severity: "severe" },
              ]}
              value={adultRR}
              onChange={(v) => setAdultRR(v as AdultRR)}
            />
          </div>
        )}

        {/* ── Paeds Assessment ── */}
        {patientType === "paeds" && (
          <div className="space-y-3">
            <AssessRow
              label="Behaviour / Vocalisation"
              icon={<Brain className="w-4 h-4 text-emerald-400" />}
              options={[
                {
                  id: "alert-normal",
                  label: "Alert, normal",
                  severity: "mild",
                },
                {
                  id: "alert-agitated",
                  label: "Alert, agitated",
                  severity: "moderate",
                },
                {
                  id: "agitated-unable",
                  label: "Agitated, can't vocalise",
                  severity: "severe",
                },
                { id: "confused", label: "Confused", severity: "severe" },
              ]}
              value={paedsBehaviour}
              onChange={(v) => setPaedsBehaviour(v as PaedsBehaviour)}
              columns={2}
            />

            <AssessRow
              label="Air Entry"
              icon={<Stethoscope className="w-4 h-4 text-emerald-400" />}
              options={[
                {
                  id: "wheeze-cough",
                  label: "Wheeze or cough",
                  severity: "mild",
                },
                {
                  id: "silent-chest",
                  label: "Silent chest",
                  severity: "severe",
                },
              ]}
              value={paedsAirEntry}
              onChange={(v) => setPaedsAirEntry(v as PaedsAirEntry)}
              columns={2}
            />

            <AssessRow
              label="SpO₂"
              icon={<Activity className="w-4 h-4 text-emerald-400" />}
              options={[
                {
                  id: "normal",
                  label: "Within target",
                  severity: "mild",
                },
                { id: "low", label: "Low for age", severity: "severe" },
                {
                  id: "unknown",
                  label: "Not available",
                  severity: "neutral",
                },
              ]}
              value={paedsSpO2}
              onChange={(v) => setPaedsSpO2(v as PaedsSpO2)}
            />

            <AssessRow
              label="Heart Rate"
              icon={<HeartPulse className="w-4 h-4 text-emerald-400" />}
              options={[
                { id: "normal", label: "Not elevated", severity: "mild" },
                { id: "120-140", label: "120–140 bpm", severity: "moderate" },
                {
                  id: "very-high",
                  label: "> 140 (2–5y) / > 125 (>5y)",
                  severity: "severe",
                },
              ]}
              value={paedsHR}
              onChange={(v) => setPaedsHR(v as PaedsHR)}
            />

            <AssessRow
              label="Resp. Rate"
              icon={<Wind className="w-4 h-4 text-emerald-400" />}
              options={[
                { id: "<30", label: "< 30 bpm", severity: "mild" },
                { id: ">30", label: "> 30 bpm", severity: "moderate" },
                {
                  id: "marked",
                  label: "> 40 (2–5y) / > 30 (>5y)",
                  severity: "severe",
                },
              ]}
              value={paedsRR}
              onChange={(v) => setPaedsRR(v as PaedsRR)}
            />
          </div>
        )}

        <p className="text-[10px] text-slate-600 pb-2">
          CPG 5.1 Asthma — always confirm drug doses and escalation steps in
          the full CPG. Contact Clinical Coordination for severe cases.
        </p>
      </main>

      {/* ── Sticky Outcome Bar ── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 space-y-2">
          {/* Severity label */}
          <div
            className={`flex items-center gap-3 rounded-xl border p-3 ${sev.barBorder} ${sev.barBg}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Severity
              </p>
              <p className={`text-xl font-bold ${sev.barText}`}>
                {sev.label}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Actions
              </p>
              <ul className="space-y-0.5">
                {actions[severity].map((a, i) => (
                  <li key={i} className="flex gap-1.5 text-[11px] text-slate-300 leading-snug">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${OPT_DOT[severity]}`} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type AssessOption = {
  id: string;
  label: string;
  severity: OptionSeverity;
};

type AssessRowProps = {
  label: string;
  icon: React.ReactNode;
  options: AssessOption[];
  value: string;
  onChange: (v: string) => void;
  columns?: 2 | 3;
};

function AssessRow({
  label,
  icon,
  options,
  value,
  onChange,
  columns = 3,
}: AssessRowProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <div
        className={`grid gap-2 ${columns === 2 ? "grid-cols-2" : "grid-cols-3"}`}
      >
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-xl border p-2.5 text-center transition-colors active:scale-95 ${
                selected
                  ? OPT_SELECTED[opt.severity]
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="flex justify-center mb-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    selected ? OPT_DOT[opt.severity] : "bg-slate-600"
                  }`}
                />
              </div>
              <p
                className={`text-xs font-medium leading-snug ${
                  selected ? "text-white" : "text-slate-400"
                }`}
              >
                {opt.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
