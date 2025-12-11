"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type Region = {
  id: string;
  label: string;
  percent: number;
  helper?: string;
};

const ADULT_REGIONS: Region[] = [
  { id: "head", label: "Head & neck", percent: 9 },
  { id: "chest", label: "Anterior torso (chest/abdomen)", percent: 18 },
  { id: "back", label: "Posterior torso (back/buttocks)", percent: 18 },
  { id: "arm-left", label: "Left arm", percent: 9 },
  { id: "arm-right", label: "Right arm", percent: 9 },
  { id: "leg-left", label: "Left leg", percent: 18 },
  { id: "leg-right", label: "Right leg", percent: 18 },
  { id: "perineum", label: "Perineum", percent: 1 },
];

// Simplified paediatric adjustment (CPG 10.9 notes higher head, smaller legs).
const PAEDS_REGIONS: Region[] = [
  { id: "head", label: "Head & neck", percent: 18, helper: "Higher % for paeds" },
  { id: "chest", label: "Anterior torso (chest/abdomen)", percent: 18 },
  { id: "back", label: "Posterior torso (back/buttocks)", percent: 18 },
  { id: "arm-left", label: "Left arm", percent: 9 },
  { id: "arm-right", label: "Right arm", percent: 9 },
  { id: "leg-left", label: "Left leg", percent: 14, helper: "Reduced % for paeds" },
  { id: "leg-right", label: "Right leg", percent: 14, helper: "Reduced % for paeds" },
  { id: "perineum", label: "Perineum", percent: 1 },
];

type AgeBand = "adult" | "paeds";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function BurnsToolPage() {
  const [ageBand, setAgeBand] = useState<AgeBand>("adult");
  const [selected, setSelected] = useState<string[]>([]);
  const [palmCount, setPalmCount] = useState<number>(0);
  const [airwayRisk, setAirwayRisk] = useState<boolean>(false);
  const [electrical, setElectrical] = useState<boolean>(false);

  const regions = ageBand === "adult" ? ADULT_REGIONS : PAEDS_REGIONS;

  const totalBsa = useMemo(() => {
    const regionSum = selected.reduce((sum, id) => {
      const region = regions.find((r) => r.id === id);
      return sum + (region?.percent || 0);
    }, 0);
    const palmSum = palmCount > 0 ? palmCount * 1 : 0; // palm ~1% TBSA
    return Math.min(regionSum + palmSum, 100);
  }, [regions, selected, palmCount]);

  const threshold = ageBand === "adult" ? 20 : 10;
  const meetsThreshold = totalBsa >= threshold;

  const summaryLines: string[] = [];
  summaryLines.push(
    `Burn surface area (CPG 10.9): ${totalBsa}% TBSA (${ageBand === "adult" ? "adult" : "paediatric"} rule of nines).`
  );
  summaryLines.push(
    selected.length
      ? `Regions: ${selected
          .map((id) => regions.find((r) => r.id === id)?.label || id)
          .join(", ")}${palmCount ? `; plus ${palmCount} palm%` : ""}.`
      : `Regions: none selected${palmCount ? `; plus ${palmCount} palm%` : ""}.`
  );
  if (airwayRisk) summaryLines.push("Airway/inhalation risk noted (consider early airway management).");
  if (electrical) summaryLines.push("Electrical burn / mixed mechanism noted (monitor ECG, consider deeper injury).");
  summaryLines.push(
    meetsThreshold
      ? `Meets major burn threshold (≥${threshold}% TBSA); follow CPG 10.9 for CCD notification, destination, and fluid guidance.`
      : `Below major burn threshold (<${threshold}% TBSA); manage per CPG 10.9 and clinical judgement.`
  );

  const summaryText = summaryLines.join(" ");

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-10 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-500">
            Trauma
          </p>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 md:text-2xl">
            Burn surface area calculator (CPG 10.9)
          </h1>
          <p className="mt-1 max-w-3xl text-xs text-slate-600 dark:text-slate-400">
            Uses rule of nines with paediatric adjustments. Thresholds: adults ≥20% TBSA; paediatrics ≥10% TBSA.
            Always follow the full CPG for airway, destination, analgesia, cooling, and fluid guidance.
          </p>
        </div>
        <CopySummaryButton summaryText={summaryText} />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["adult", "paeds"] as AgeBand[]).map((band) => (
          <button
            key={band}
            type="button"
            onClick={() => setAgeBand(band)}
            className={classNames(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              ageBand === band
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100"
                : "border-slate-300 bg-slate-50 text-slate-700 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            )}
          >
            {band === "adult" ? "Adult" : "Paediatric (<~10y)"}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Select burned regions
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Uses rule-of-nines weights (paeds adjusted). Palm method adds 1% per patient palm (including fingers).
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {regions.map((region) => {
              const checked = selected.includes(region.id);
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => toggle(region.id)}
                  className={classNames(
                    "w-full rounded-xl border px-3 py-2 text-left text-sm transition",
                    checked
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{region.label}</p>
                      {region.helper && (
                        <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                          {region.helper}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                      {region.percent}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">Palm method</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add palms for scattered burns (1% per patient palm, including fingers).
                </p>
              </div>
              <input
                type="number"
                min={0}
                max={30}
                value={palmCount}
                onChange={(e) => setPalmCount(Math.max(0, Number(e.target.value) || 0))}
                className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-right text-sm dark:border-slate-700 dark:bg-slate-900"
                aria-label="Palm count"
              />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Summary
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Total burn surface area:{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                {totalBsa}% TBSA
              </span>{" "}
              ({ageBand === "adult" ? "adult rule of nines" : "paediatric adjustment"}).
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Threshold: {ageBand === "adult" ? "≥20% TBSA (adult)" : "≥10% TBSA (paeds)"} triggers major burn pathway per CPG 10.9.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={classNames(
                  "inline-flex items-center rounded-full px-3 py-1 text-[0.75rem] font-semibold",
                  meetsThreshold
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-100"
                    : "bg-amber-500/15 text-amber-800 dark:text-amber-100"
                )}
              >
                {meetsThreshold ? "Meets major burn threshold" : "Below major burn threshold"}
              </span>
              <CopySummaryButton summaryText={summaryText} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 space-y-2">
            <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Critical considerations (CPG 10.9)
            </h3>
            <ul className="space-y-1 list-disc pl-4">
              <li>Stop the burning process; cool with tepid water (avoid ice); remove constricting items.</li>
              <li>Assess airway early: facial/neck burns, soot, hoarseness, singed hairs; consider early airway support.</li>
              <li>Analgesia, exposure/warmth, glucose check; monitor for circumferential chest/limb burns (eschar risk).</li>
              <li>Contact CCD early for destination and fluid guidance; consider mixed mechanisms (chemical, electrical).</li>
            </ul>
            <div className="mt-2 flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 text-[0.8rem]">
                <input
                  type="checkbox"
                  checked={airwayRisk}
                  onChange={(e) => setAirwayRisk(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 text-emerald-600"
                />
                Airway/inhalation risk
              </label>
              <label className="inline-flex items-center gap-2 text-[0.8rem]">
                <input
                  type="checkbox"
                  checked={electrical}
                  onChange={(e) => setElectrical(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 text-emerald-600"
                />
                Electrical / mixed mechanism
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Quick links
              </p>
              <p>CPG 10.9 Burns – use Protocol Finder or open the PDF to confirm details.</p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[0.8rem] font-semibold text-slate-700 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
