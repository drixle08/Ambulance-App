"use client";

import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type SeverityBand =
  | "mild"
  | "moderate"
  | "severe"
  | "impending"
  | "none";

type LOCOption = "normal" | "disoriented";
type CyanosisOption = "none" | "with-agitation" | "at-rest";
type StridorOption = "none" | "with-agitation" | "at-rest";
type AirEntryOption = "normal" | "decreased" | "markedly-decreased";
type RetractionOption = "none" | "mild" | "moderate" | "severe";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const locScore: Record<LOCOption, number> = {
  normal: 0,
  disoriented: 5,
};

const cyanosisScore: Record<CyanosisOption, number> = {
  none: 0,
  "with-agitation": 4,
  "at-rest": 5,
};

const stridorScore: Record<StridorOption, number> = {
  none: 0,
  "with-agitation": 1,
  "at-rest": 2,
};

const airEntryScore: Record<AirEntryOption, number> = {
  normal: 0,
  decreased: 1,
  "markedly-decreased": 2,
};

const retractionsScore: Record<RetractionOption, number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

function getSeverityBand(total: number): SeverityBand {
  if (total <= 0) return "none";
  if (total <= 2) return "mild";
  if (total <= 5) return "moderate";
  if (total <= 11) return "severe";
  return "impending";
}

const severityLabel: Record<SeverityBand, string> = {
  none: "No croup features",
  mild: "Mild croup",
  moderate: "Moderate croup",
  severe: "Severe croup",
  impending: "Impending respiratory failure",
};

export default function MwcsPage() {
  const [ageYears, setAgeYears] = useState<string>("3");

  const [loc, setLoc] = useState<LOCOption>("normal");
  const [cyanosis, setCyanosis] = useState<CyanosisOption>("none");
  const [stridor, setStridor] = useState<StridorOption>("with-agitation");
  const [airEntry, setAirEntry] = useState<AirEntryOption>("normal");
  const [retractions, setRetractions] =
    useState<RetractionOption>("mild");

  const locPoints = locScore[loc];
  const cyanosisPoints = cyanosisScore[cyanosis];
  const stridorPoints = stridorScore[stridor];
  const airEntryPoints = airEntryScore[airEntry];
  const retractionsPoints = retractionsScore[retractions];

  const totalScore =
    locPoints +
    cyanosisPoints +
    stridorPoints +
    airEntryPoints +
    retractionsPoints;

  const band = getSeverityBand(totalScore);

  const severityColor =
    band === "impending"
      ? "text-red-500"
      : band === "severe"
      ? "text-red-500"
      : band === "moderate"
      ? "text-yellow-500"
      : band === "mild"
      ? "text-emerald-500"
      : "text-slate-500";

  const bandBlurb: Record<SeverityBand, string> = {
    none:
      "No clear croup features on this score. Correlate with history, cough, and respiratory exam.",
    mild:
      "Barking cough with minimal distress. Usually managed with single-dose steroids; observe for deterioration as per CPG.",
    moderate:
      "Increased work of breathing and stridor. Requires close observation, steroids, and consideration of nebulised adrenaline as per CPG.",
    severe:
      "Marked distress with stridor at rest, significant retractions, or altered mentation. Time-critical management with nebulised adrenaline, steroids, and early senior/CCP/ED support.",
    impending:
      "Features of respiratory failure (silent chest, severe retractions, reduced LOC, or high score). Time-critical transfer; prepare for advanced airway/RSI as per CPG.",
  };

  const suggestedActions: string[] = [];
  if (band === "none") {
    suggestedActions.push(
      "Reassess diagnosis; consider alternative causes of stridor or noisy breathing.",
      "Monitor work of breathing, RR, and SpO₂; follow CPG if croup still suspected."
    );
  } else if (band === "mild") {
    suggestedActions.push(
      "Administer steroid (e.g. oral dexamethasone) as per CPG dose chart.",
      "Observe and monitor for progression; provide caregiver education and safety-net advice.",
      "Transport or discharge according to CPG criteria and Clinical Coordination."
    );
  } else if (band === "moderate") {
    suggestedActions.push(
      "Administer steroid and consider nebulised adrenaline as per CPG.",
      "Monitor closely: RR, work of breathing, stridor at rest, and mental state.",
      "Transport to ED; prenotify if needing repeated nebulised adrenaline."
    );
  } else if (band === "severe") {
    suggestedActions.push(
      "Time-critical: nebulised adrenaline + steroid immediately as per CPG.",
      "Position of comfort; minimise distress and handling; titrate oxygen if hypoxic.",
      "Priority transport with prenotification; consider CCP/anaesthetics support."
    );
  } else if (band === "impending") {
    suggestedActions.push(
      "Impending respiratory failure: urgent nebulised adrenaline and advanced airway planning.",
      "Prepare for possible RSI/advanced airway (CCP/ED/anaesthetics) as per CPG.",
      "Priority 1 transport with immediate prenotification and early Clinical Coordination involvement."
    );
  }

  const ageNum = Number(ageYears);
  const summaryBits: string[] = [];
  summaryBits.push(
    `MWCS: ${totalScore} (${severityLabel[band]})`
  );
  if (!Number.isNaN(ageNum)) {
    summaryBits.push(`approx age ${ageNum} years`);
  }

  summaryBits.push(
    `LOC: ${loc === "normal" ? "normal" : "disoriented"}`,
    `cyanosis: ${
      cyanosis === "none"
        ? "none"
        : cyanosis === "with-agitation"
        ? "with agitation"
        : "at rest"
    }`,
    `stridor: ${
      stridor === "none"
        ? "none"
        : stridor === "with-agitation"
        ? "with agitation"
        : "at rest"
    }`,
    `air entry: ${
      airEntry === "normal"
        ? "normal"
        : airEntry === "decreased"
        ? "decreased"
        : "markedly decreased"
    }`,
    `retractions: ${retractions}`
  );

  const summaryText =
    summaryBits.join("; ") +
    `. Actions: ${suggestedActions[0] ?? "See CPG for management."}`;

  function handleReset() {
    setAgeYears("3");
    setLoc("normal");
    setCyanosis("none");
    setStridor("with-agitation");
    setAirEntry("normal");
    setRetractions("mild");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
              Paediatric respiratory
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              MWCS – Modified Westley Croup Score
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
             Croup is a common viral infection affecting the subglottic airway. The severity 
             is determined using the Modified Westley Croup Score as per CPG 5.3 Croup, which 
             guides treatment for mild, moderate and severe croup.
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
          {/* Age */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
              Patient
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Approx age (years)
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
                Typically 6&nbsp;months–6&nbsp;years for croup presentations.
              </span>
            </div>
          </div>

          {/* LOC */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                  Level of consciousness
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Reduced or disoriented LOC scores highly and suggests severe
                  disease / impending failure.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "normal", label: "Normal / alert" },
                { id: "disoriented", label: "Disoriented / reduced LOC" },
              ] as const).map((opt) => {
                const active = loc === opt.id;
                const points = locScore[opt.id];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLoc(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition flex items-center justify-between gap-2 min-w-40",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                      {points} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cyanosis */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                  Cyanosis
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Peripheral/central cyanosis with agitation vs at rest.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "none", label: "None observed" },
                { id: "with-agitation", label: "With agitation" },
                { id: "at-rest", label: "Present at rest" },
              ] as const).map((opt) => {
                const active = cyanosis === opt.id;
                const points = cyanosisScore[opt.id];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCyanosis(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition flex items-center justify-between gap-2 min-w-40",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                      {points} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stridor */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                  Stridor
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Presence of inspiratory stridor with agitation vs at rest.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "none", label: "None" },
                { id: "with-agitation", label: "Only with agitation" },
                { id: "at-rest", label: "At rest" },
              ] as const).map((opt) => {
                const active = stridor === opt.id;
                const points = stridorScore[opt.id];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStridor(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition flex items-center justify-between gap-2 min-w-40",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                      {points} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Air entry */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                  Air entry
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Global air entry on auscultation.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "normal", label: "Normal" },
                { id: "decreased", label: "Decreased" },
                {
                  id: "markedly-decreased",
                  label: "Markedly decreased / barely audible",
                },
              ] as const).map((opt) => {
                const active = airEntry === opt.id;
                const points = airEntryScore[opt.id];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAirEntry(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition flex items-center justify-between gap-2 min-w-40",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                      {points} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Retractions */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">
                  Chest wall retractions
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Suprasternal, intercostal, and subcostal recession.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "none", label: "None" },
                { id: "mild", label: "Mild" },
                { id: "moderate", label: "Moderate" },
                { id: "severe", label: "Severe" },
              ] as const).map((opt) => {
                const active = retractions === opt.id;
                const points = retractionsScore[opt.id];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRetractions(opt.id)}
                    className={classNames(
                      "px-3 py-1.5 rounded-xl text-xs md:text-sm border transition flex items-center justify-between gap-2 min-w-40",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                      active
                        ? "border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-100"
                        : "border-slate-300 bg-slate-100 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                      {points} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div className="md:col-span-1">
          <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  Croup score
                </p>
                <p
                  className={classNames(
                    "mt-1 text-lg md:text-xl font-semibold",
                    severityColor
                  )}
                >
                  {severityLabel[band]}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Total MWCS:{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {totalScore}
                  </span>{" "}
                  (LOC {locPoints} + cyanosis {cyanosisPoints} + stridor{" "}
                  {stridorPoints} + air entry {airEntryPoints} + retractions{" "}
                  {retractionsPoints})
                </p>
              </div>
              <CopySummaryButton summaryText={summaryText} />
            </div>

            <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Interpretation & management hint
              </p>
              <p>{bandBlurb[band]}</p>
            </div>

            <div className="rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-700 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Suggested prehospital actions (summary)
              </p>
              <ul className="mt-1 space-y-1.5">
                {suggestedActions.map((a, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400/70 shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
             Total possible score 0–17. CPG 5.3 defines: Mild croup ≤2, Moderate 3–7, 
             Severe ≥8. This tool adds a teaching band for “impending respiratory failure” 
             at very high scores – always follow CPG 5.3 for management decisions.
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}
