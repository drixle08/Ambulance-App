"use client";

import { useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type Stridor = "none" | "agitated" | "rest";
type Retractions = "none" | "mild" | "moderate" | "severe";
type AirEntry = "normal" | "mild" | "severe";
type Cyanosis = "none" | "agitated" | "rest";
type LOC = "awake" | "altered";

type SeverityBand = "Mild" | "Moderate" | "Severe";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function MWCSPage() {
  const [stridor, setStridor] = useState<Stridor>("none");
  const [retractions, setRetractions] = useState<Retractions>("none");
  const [airEntry, setAirEntry] = useState<AirEntry>("normal");
  const [cyanosis, setCyanosis] = useState<Cyanosis>("none");
  const [loc, setLoc] = useState<LOC>("awake");

  // --- Scoring based on CPG 5.3 Modified Westley Croup Score table ---
  // Inspiratory stridor: None (0), When agitated (1), At rest (2)
  const stridorScore: number =
    stridor === "none" ? 0 : stridor === "agitated" ? 1 : 2;

  // Intercostal recession: None (0), Mild (1), Moderate (2), Severe (3)
  const retractionsScore: number =
    retractions === "none"
      ? 0
      : retractions === "mild"
      ? 1
      : retractions === "moderate"
      ? 2
      : 3;

  // Air entry: Normal (0), Mildly decreased (1), Severely decreased (2)
  const airEntryScore: number =
    airEntry === "normal" ? 0 : airEntry === "mild" ? 1 : 2;

  // Cyanosis: None (0), With agitation/activity (4), At rest (5)
  const cyanosisScore: number =
    cyanosis === "none" ? 0 : cyanosis === "agitated" ? 4 : 5;

  // LOC: Awake (0), Altered (5)
  const locScore: number = loc === "awake" ? 0 : 5;

  const totalScore =
    stridorScore + retractionsScore + airEntryScore + cyanosisScore + locScore;

  const severity: SeverityBand =
    totalScore <= 2 ? "Mild" : totalScore <= 7 ? "Moderate" : "Severe";

  // --- Management hints per CPG 5.3 CROUP table (AP-level wording) ---
  const baseManagement: string[] = [
    "Avoid unnecessary interventions that increase distress; keep the child calm and with caregiver if possible.",
    "Position of comfort (preferably in a parent’s arms); minimise movement.",
    "Oxygen only if desaturating (SpO₂ < 94%) and tolerated.",
    "Request CCP/ALS assistance early for moderate–severe croup.",
  ];

  let severitySpecific: string[] = [];

  if (severity === "Mild") {
    severitySpecific = [
      "Dexamethasone 0.6 mg/kg PO (max 12 mg) OR Budesonide 2 mg nebulised as per CPG.",
      "Consider non-urgent transport or CCP sign-off only if stable and low risk of deterioration.",
    ];
  } else if (severity === "Moderate") {
    severitySpecific = [
      "Dexamethasone 0.6 mg/kg PO (max 12 mg) OR Budesonide 2 mg nebulised.",
      "Consider Adrenaline nebuliser 0.5 mg/kg (max 5 mg) if stridor or airway obstruction present.",
      "Transport to nearest appropriate Emergency Department; monitor airway closely.",
    ];
  } else {
    // Severe (includes life-threatening / impending respiratory failure)
    severitySpecific = [
      "Dexamethasone 0.6 mg/kg PO/IM/IV (max 12 mg) OR Budesonide 2 mg nebulised.",
      "Adrenaline nebuliser 0.5 mg/kg (max 5 mg) for stridor/airway obstruction.",
      "Prepare for airway compromise; request CCP for potential advanced airway (e.g., Quicktrach if unable to ventilate) as per CPG.",
      "Priority transport (P1) to nearest appropriate Emergency Department.",
    ];
  }

  const management = [...baseManagement, ...severitySpecific];

  // --- Feature description for summary string ---
  const featureParts: string[] = [];

  if (stridor === "none") {
    featureParts.push("no stridor");
  } else if (stridor === "agitated") {
    featureParts.push("stridor when agitated");
  } else {
    featureParts.push("stridor at rest");
  }

  if (retractions === "none") {
    featureParts.push("no intercostal recession");
  } else {
    featureParts.push(`${retractions} intercostal recession`);
  }

  if (airEntry === "normal") {
    featureParts.push("normal air entry");
  } else if (airEntry === "mild") {
    featureParts.push("mildly decreased air entry");
  } else {
    featureParts.push("severely decreased air entry");
  }

  if (cyanosis === "none") {
    featureParts.push("no cyanosis");
  } else if (cyanosis === "agitated") {
    featureParts.push("cyanosis with agitation");
  } else {
    featureParts.push("cyanosis at rest");
  }

  featureParts.push(loc === "awake" ? "awake" : "altered LOC");

  const featuresText = featureParts.join(", ");

  const summaryText = `Modified Westley Croup Score: ${totalScore} (${severity}). Features: ${featuresText}. Suggested: ${management[0]}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
          Paediatric respiratory
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Modified Westley Croup Score (MWCS)
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          CPG v2.4-aligned Modified Westley Croup Score for paediatric croup
          (typically 6 months – 3 years, but can occur in older children). Use this
          tool to score severity and guide management.
        </p>
      </header>

      {/* Inputs + result */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Input chips */}
        <div className="space-y-4 md:col-span-2">
          {/* Stridor */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                  Inspiratory stridor
                </p>
                <p className="text-xs text-slate-500">
                  None → with agitation → at rest
                </p>
              </div>
              <span className="text-xs text-slate-500">
                Score: {stridorScore}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "none", label: "None" },
                { id: "agitated", label: "When agitated" },
                { id: "rest", label: "At rest" },
              ].map((opt) => {
                const active = stridor === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStridor(opt.id as Stridor)}
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

          {/* Retractions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                  Intercostal recession
                </p>
                <p className="text-xs text-slate-500">
                  Chest/abdominal wall retractions
                </p>
              </div>
              <span className="text-xs text-slate-500">
                Score: {retractionsScore}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "none", label: "None" },
                { id: "mild", label: "Mild" },
                { id: "moderate", label: "Moderate" },
                { id: "severe", label: "Severe" },
              ].map((opt) => {
                const active = retractions === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRetractions(opt.id as Retractions)}
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

          {/* Air entry */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                  Air entry
                </p>
                <p className="text-xs text-slate-500">
                  On auscultation / chest movement
                </p>
              </div>
              <span className="text-xs text-slate-500">
                Score: {airEntryScore}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "normal", label: "Normal" },
                { id: "mild", label: "Mildly decreased" },
                { id: "severe", label: "Severely decreased" },
              ].map((opt) => {
                const active = airEntry === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAirEntry(opt.id as AirEntry)}
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

          {/* Cyanosis & LOC */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                    Cyanosis
                  </p>
                  <p className="text-xs text-slate-500">
                    Colour change around lips/face
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  Score: {cyanosisScore}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "none", label: "None" },
                  { id: "agitated", label: "With agitation/activity" },
                  { id: "rest", label: "At rest" },
                ].map((opt) => {
                  const active = cyanosis === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCyanosis(opt.id as Cyanosis)}
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

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
                    Level of consciousness
                  </p>
                  <p className="text-xs text-slate-500">
                    Awake vs confused / drowsy
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  Score: {locScore}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "awake", label: "Awake / normal" },
                  { id: "altered", label: "Altered / decreased" },
                ].map((opt) => {
                  const active = loc === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLoc(opt.id as LOC)}
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
        </div>

        {/* Result + management */}
        <div className="md:col-span-1">
          <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
                  Score & severity
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-50">
                  {totalScore}
                  <span className="ml-2 text-sm font-semibold">
                    ({severity} croup)
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  Mild ≤2 • Moderate 3–7 • Severe ≥8
                </p>
              </div>
              <CopySummaryButton summaryText={summaryText} />
            </div>

            <div className="mt-2 rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-100 mb-1">
                Features
              </p>
              <p>{featuresText}</p>
            </div>

            <div className="mt-1 rounded-xl bg-slate-900/80 border border-slate-800 p-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-100 mb-1">
                Suggested management (summary – see CPG 5.3 for full protocol)
              </p>
              <ul className="mt-1 space-y-1.5">
                {management.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400/70 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[0.65rem] text-slate-500 mt-auto">
              The Modified Westley Croup Score should be documented on the ePCR pre
              and post management. Always rule out other stridor causes (epiglottitis,
              FBAO) and follow CPG 5.3.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
