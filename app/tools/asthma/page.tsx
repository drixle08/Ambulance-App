"use client";

import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type Severity = "none" | "mild" | "moderate" | "severe";

type AdultMental = "alert" | "drowsy" | "reduced";
type AdultSpeech = "sentences" | "phrases" | "words-unable";
type AdultWheeze = "exp-only" | "all-fields" | "severe-silent";
type AdultRR = "<24" | "24-29" | ">29";

type PaedsBehaviour = "alert-normal" | "alert-agitated" | "agitated-unable" | "confused";
type PaedsAirEntry = "wheeze-cough" | "silent-chest";
type PaedsSpO2 = "normal" | "low" | "unknown";
type PaedsHR = "normal" | "120-140" | "very-high";
type PaedsRR = "<30" | ">30" | "marked";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AsthmaPage() {
  const [ageYears, setAgeYears] = useState<string>("25");

  // Adult fields
  const [adultMental, setAdultMental] = useState<AdultMental>("alert");
  const [adultSpeech, setAdultSpeech] = useState<AdultSpeech>("sentences");
  const [adultWheeze, setAdultWheeze] = useState<AdultWheeze>("exp-only");
  const [adultRR, setAdultRR] = useState<AdultRR>("<24");

  // Paeds fields
  const [paedsBehaviour, setPaedsBehaviour] =
    useState<PaedsBehaviour>("alert-normal");
  const [paedsAirEntry, setPaedsAirEntry] =
    useState<PaedsAirEntry>("wheeze-cough");
  const [paedsSpO2, setPaedsSpO2] = useState<PaedsSpO2>("normal");
  const [paedsHR, setPaedsHR] = useState<PaedsHR>("normal");
  const [paedsRR, setPaedsRR] = useState<PaedsRR>("<30");

  const numericAge = Number(ageYears);
  const isPaeds = !Number.isNaN(numericAge) && numericAge < 14; // adult/paeds split; adjust if CPG differs
  const patientTypeLabel = isPaeds ? "Paediatric" : "Adult";

  // --- ADULT SEVERITY MAPPING (from CPG table) ---
  // MILD: alert, expiratory wheeze, sentences, RR <24
  // MODERATE: alert or drowsy, wheeze all lung fields, phrases, RR 24–29
  // SEVERE: reduced/decreasing LOC, severe wheeze or silent chest, words/unable, RR >29

  function classifyAdult(): Severity {
    let severity: Severity = "mild";

    // Severe features
    if (
      adultMental === "reduced" ||
      adultWheeze === "severe-silent" ||
      adultSpeech === "words-unable" ||
      adultRR === ">29"
    ) {
      severity = "severe";
    } else if (
      adultMental === "drowsy" ||
      adultWheeze === "all-fields" ||
      adultSpeech === "phrases" ||
      adultRR === "24-29"
    ) {
      severity = "moderate";
    } else {
      // All fully mild-level choices
      severity = "mild";
    }

    // No asthma features case (optional)
    if (
      adultMental === "alert" &&
      adultWheeze === "exp-only" &&
      adultSpeech === "sentences" &&
      adultRR === "<24"
    ) {
      severity = "mild"; // table has no explicit "none" category, keep as mild
    }

    return severity;
  }

  // --- PAEDIATRIC SEVERITY MAPPING (from CPG table) ---
  // MILD: alert, talks/vocalises normally, wheeze or cough, RR <30
  // MODERATE: alert but agitated, wheeze or cough, HR 120–140, RR >30
  // SEVERE: agitated & unable to vocalise, confused, silent chest, low SpO2,
  //         HR >140 (2–5) or >125 (>5), RR >40 (2–5) or >30 (>5)
  function classifyPaeds(): Severity {
    let severity: Severity = "mild";

    // Severe features
    if (
      paedsBehaviour === "agitated-unable" ||
      paedsBehaviour === "confused" ||
      paedsAirEntry === "silent-chest" ||
      paedsSpO2 === "low" ||
      paedsHR === "very-high" ||
      paedsRR === "marked"
    ) {
      severity = "severe";
    } else if (
      paedsBehaviour === "alert-agitated" ||
      paedsHR === "120-140" ||
      paedsRR === ">30"
    ) {
      severity = "moderate";
    } else {
      severity = "mild";
    }

    return severity;
  }

  const overallSeverity: Severity = isPaeds ? classifyPaeds() : classifyAdult();

  const severityLabel: Record<Severity, string> = {
    none: "No asthma features",
    mild: "Mild",
    moderate: "Moderate",
    severe: "Severe",
  };

  const severityColor =
    overallSeverity === "severe"
      ? "text-red-500"
      : overallSeverity === "moderate"
      ? "text-yellow-500"
      : overallSeverity === "mild"
      ? "text-emerald-500"
      : "text-slate-500";

  // Suggested actions summary (short, CPG-aligned wording; details still in CPG)
  const actions: string[] = [];

  if (overallSeverity === "mild") {
    actions.push(
      "Short-acting bronchodilator (e.g. salbutamol) via pMDI + spacer or nebuliser as per CPG.",
      "Monitor response, RR, and work of breathing; consider transport if poor response or high-risk history."
    );
  } else if (overallSeverity === "moderate") {
    actions.push(
      "Repeated short-acting bronchodilator and add ipratropium as per CPG dose chart.",
      "Titrate oxygen only if indicated (hypoxia); monitor closely and transport to ED.",
      "Prenotify if poor response after initial therapy or deteriorating features."
    );
  } else if (overallSeverity === "severe") {
    actions.push(
      "Time-critical asthma: aggressive bronchodilator + ipratropium and early IV access as per CPG.",
      "Support ventilation; prepare for potential advanced airway/RSI (CCP/ED) if tiring or reduced LOC.",
      "Priority transport with prenotification; involve Clinical Coordination early."
    );
  }

  // Build a concise summary string for PRF
  const summaryPieces: string[] = [];
  summaryPieces.push(`${patientTypeLabel} asthma: ${severityLabel[overallSeverity]}`);

  if (!Number.isNaN(numericAge)) summaryPieces.push(`age ${numericAge}y`);

  if (isPaeds) {
    // Paeds feature summary (compact)
    summaryPieces.push(
      `behaviour ${paedsBehaviour.replace("-", " ")}`,
      paedsAirEntry === "silent-chest" ? "silent chest" : "wheeze/cough present",
      paedsSpO2 === "low" ? "low SpO₂" : paedsSpO2 === "normal" ? "SpO₂ ok" : "SpO₂ n/a",
      paedsHR === "120-140"
        ? "HR 120–140"
        : paedsHR === "very-high"
        ? "HR above CPG severe threshold"
        : "HR not elevated",
      paedsRR === "<30"
        ? "RR <30"
        : paedsRR === ">30"
        ? "RR >30"
        : "marked tachypnoea"
    );
  } else {
    summaryPieces.push(
      `mental state ${
        adultMental === "alert"
          ? "alert"
          : adultMental === "drowsy"
          ? "alert/drowsy"
          : "reduced LOC"
      }`,
      adultSpeech === "sentences"
        ? "speaks in sentences"
        : adultSpeech === "phrases"
        ? "speaks in phrases"
        : "words/unable to talk",
      adultWheeze === "exp-only"
        ? "expiratory wheeze"
        : adultWheeze === "all-fields"
        ? "wheeze all fields"
        : "severe wheeze/silent chest",
      adultRR === "<24" ? "RR <24" : adultRR === "24-29" ? "RR 24–29" : "RR >29"
    );
  }

  const summaryText = summaryPieces.join("; ") + ". Actions: " + (actions[0] ?? "See CPG.");

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

    setAgeYears("25");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
              Respiratory
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              Asthma Severity (Adult + Paediatric)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Severity bands (mild, moderate, severe) based on HMCAS CPG asthma
              severity table for adults and paediatrics. Use with CPG dosing and
              escalation guidance.
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
          {/* Age / patient type */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
              Patient
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
                Interpreting as{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {patientTypeLabel}
                </span>{" "}
                asthma.
              </span>
            </div>
            <p className="text-[0.7rem] text-slate-500 dark:text-slate-500">
              Adult vs paediatric banding is auto-selected by age. HR and RR thresholds
              are based on the CPG asthma severity table; confirm exact numbers there
              if unsure.
            </p>
          </div>

          {/* Adult or Paeds blocks */}
          {!isPaeds ? (
            <>
              {/* Adult mental state */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      Mental state
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Alert vs drowsy vs reduced/decreasing LOC.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "alert", label: "Alert" },
                    { id: "drowsy", label: "Alert or drowsy" },
                    { id: "reduced", label: "Reduced / decreasing LOC" },
                  ] as const).map((opt) => {
                    const active = adultMental === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAdultMental(opt.id)}
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

              {/* Adult speech */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      Speech / ability to talk
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Based on how much the patient can speak per breath.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "sentences", label: "Talks in full sentences" },
                    { id: "phrases", label: "Talks in phrases" },
                    {
                      id: "words-unable",
                      label: "Talks in words only / unable to talk",
                    },
                  ] as const).map((opt) => {
                    const active = adultSpeech === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAdultSpeech(opt.id)}
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

              {/* Adult wheeze */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      Auscultation / wheeze
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Distribution and severity of wheeze on auscultation.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "exp-only", label: "Expiratory wheeze only" },
                    { id: "all-fields", label: "Wheezing in all lung fields" },
                    {
                      id: "severe-silent",
                      label: "Severe wheeze or silent chest",
                    },
                  ] as const).map((opt) => {
                    const active = adultWheeze === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAdultWheeze(opt.id)}
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

              {/* Adult RR */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      Respiratory rate (adult)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Use RR bands directly from the CPG table.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "<24", label: "RR < 24 bpm" },
                    { id: "24-29", label: "RR 24–29 bpm" },
                    { id: ">29", label: "RR > 29 bpm" },
                  ] as const).map((opt) => {
                    const active = adultRR === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAdultRR(opt.id)}
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
            </>
          ) : (
            <>
              {/* Paeds behaviour */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      Behaviour / ability to vocalise
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      From alert and talking normally through to agitated and unable to
                      vocalise.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "alert-normal", label: "Alert; talks/vocalises normally" },
                    { id: "alert-agitated", label: "Alert but agitated" },
                    {
                      id: "agitated-unable",
                      label: "Agitated and unable to vocalise",
                    },
                    { id: "confused", label: "Confused" },
                  ] as const).map((opt) => {
                    const active = paedsBehaviour === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaedsBehaviour(opt.id)}
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

              {/* Paeds air entry */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      Auscultation / air entry
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Wheeze or cough vs silent chest.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    {
                      id: "wheeze-cough",
                      label: "Wheeze or cough (air entry present)",
                    },
                    { id: "silent-chest", label: "Silent chest" },
                  ] as const).map((opt) => {
                    const active = paedsAirEntry === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaedsAirEntry(opt.id)}
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

              {/* Paeds SpO2 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      SpO₂ (paediatric)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      “Low SpO₂” is a severe feature in the CPG; use age-appropriate
                      targets.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "normal", label: "Within target for age" },
                    { id: "low", label: "Low SpO₂ for age" },
                    { id: "unknown", label: "Not available / unreadable" },
                  ] as const).map((opt) => {
                    const active = paedsSpO2 === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaedsSpO2(opt.id)}
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

              {/* Paeds HR */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      Heart rate (paediatric)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      CPG: HR 120–140 = moderate; HR &gt;140 (2–5y) or &gt;125 (&gt;5y) =
                      severe.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "normal", label: "Not in these high ranges" },
                    { id: "120-140", label: "Around 120–140 bpm" },
                    {
                      id: "very-high",
                      label: ">140 bpm (2–5y) or >125 bpm (>5y)",
                    },
                  ] as const).map((opt) => {
                    const active = paedsHR === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaedsHR(opt.id)}
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

              {/* Paeds RR */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                      Respiratory rate (paediatric)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      CPG: RR &lt;30 = mild; RR &gt;30 = moderate; RR &gt;40 (2–5y) or
                      &gt;30 (&gt;5y) = severe.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "<30", label: "RR < 30 bpm" },
                    { id: ">30", label: "RR > 30 bpm" },
                    {
                      id: "marked",
                      label: "Marked tachypnoea (e.g. >40 if 2–5y or >30 if >5y)",
                    },
                  ] as const).map((opt) => {
                    const active = paedsRR === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaedsRR(opt.id)}
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
            </>
          )}
        </div>

        {/* Right: summary / actions */}
        <div className="md:col-span-1">
          <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  Asthma severity
                </p>
                <p
                  className={classNames(
                    "mt-1 text-lg md:text-xl font-semibold",
                    severityColor
                  )}
                >
                  {severityLabel[overallSeverity]}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {patientTypeLabel} • CPG-aligned banding
                </p>
              </div>
              <CopySummaryButton summaryText={summaryText} />
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
              This tool mirrors the asthma severity table (adult + paediatric) from
              the HMCAS CPG. Always confirm drug doses and escalation steps in the
              actual CPG and with Clinical Coordination when required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
