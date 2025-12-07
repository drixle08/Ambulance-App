"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ShockIndexPage() {
  const [sbp, setSbp] = useState<string>("");
  const [dbp, setDbp] = useState<string>("");
  const [hr, setHr] = useState<string>("");

  const sbpNum = useMemo(() => {
    const v = parseFloat(sbp);
    return Number.isFinite(v) && v > 0 ? v : NaN;
  }, [sbp]);

  const dbpNum = useMemo(() => {
    const v = parseFloat(dbp);
    return Number.isFinite(v) && v > 0 ? v : NaN;
  }, [dbp]);

  const hrNum = useMemo(() => {
    const v = parseFloat(hr);
    return Number.isFinite(v) && v > 0 ? v : NaN;
  }, [hr]);

  const shockIndex = useMemo(() => {
    if (!Number.isFinite(hrNum) || !Number.isFinite(sbpNum) || sbpNum === 0) return NaN;
    return hrNum / sbpNum;
  }, [hrNum, sbpNum]);

  const map = useMemo(() => {
    if (!Number.isFinite(sbpNum) || !Number.isFinite(dbpNum)) return NaN;
    return (sbpNum + 2 * dbpNum) / 3;
  }, [sbpNum, dbpNum]);

  // Basic banding – this is generic SI data; adjust if your CPG has specific numbers.
  let siBand: "normal" | "borderline" | "high" | "invalid" = "invalid";
  if (Number.isFinite(shockIndex)) {
    if (shockIndex < 0.7) siBand = "normal";
    else if (shockIndex < 0.9) siBand = "borderline";
    else siBand = "high";
  }

  const siLabel =
    siBand === "normal"
      ? "Within usual range"
      : siBand === "borderline"
      ? "Elevated – monitor closely"
      : siBand === "high"
      ? "High – concerning for shock"
      : "Insufficient data";

  const siColour =
    siBand === "normal"
      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-100"
      : siBand === "borderline"
      ? "bg-amber-500/15 text-amber-700 border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100"
      : siBand === "high"
      ? "bg-rose-500/15 text-rose-700 border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-100"
      : "bg-slate-500/10 text-slate-700 border-slate-400/60 dark:bg-slate-700/40 dark:text-slate-100";

  const mapText = Number.isFinite(map) ? `${Math.round(map)} mmHg` : "—";

  const hasEnoughData = Number.isFinite(shockIndex);

  const summaryText = hasEnoughData
    ? (() => {
        const parts: string[] = [];
        parts.push(
          `Shock index: HR ${Number.isFinite(hrNum) ? Math.round(hrNum) : "?"}/min, SBP ${
            Number.isFinite(sbpNum) ? Math.round(sbpNum) : "?"
          } mmHg → SI ${shockIndex.toFixed(2)} (${siLabel.toLowerCase()})`
        );
        if (Number.isFinite(map)) {
          parts.push(`MAP approx ${Math.round(map)} mmHg`);
        }
        const escalation =
          siBand === "high"
            ? "Treat as time-critical — consider occult shock, follow sepsis/trauma/shock CPG, and prenotify receiving hospital."
            : siBand === "borderline"
            ? "Elevated SI — monitor trends, repeat vitals, and be alert for early shock."
            : "SI not elevated — continue routine monitoring and reassessment.";
        parts.push(escalation);
        return `${parts.join(". ")} (Shock index quick ref; thresholds based on generic evidence — confirm with local CPG).`;
      })()
    : "Shock index tool used – insufficient data entered to calculate SI. (Enter HR and SBP to generate a PRF summary.)";

  const handleReset = () => {
    setSbp("");
    setDbp("");
    setHr("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-500">
            Reference
          </p>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Shock Index & MAP quick calculator
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Calculates Shock Index (HR ÷ SBP) and estimated MAP from entered vitals to support early
            recognition of occult shock. Use alongside trauma, sepsis and shock CPGs. This tool does
            not replace clinical judgement or local protocols.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <CopySummaryButton summaryText={summaryText} />
          <Link
            href="/dashboard"
            className="text-[0.7rem] text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            ← Back to tools
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] items-start">
        {/* Input card */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Patient vitals
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="text-[0.7rem] rounded-full border border-slate-300 bg-slate-50 px-2 py-1 text-slate-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-300"
            >
              Reset
            </button>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                SBP
                <span className="ml-1 text-[0.65rem] font-normal normal-case text-slate-400 dark:text-slate-500">
                  (mmHg)
                </span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                value={sbp}
                onChange={(e) => setSbp(e.target.value)}
                placeholder="e.g. 90"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                DBP
                <span className="ml-1 text-[0.65rem] font-normal normal-case text-slate-400 dark:text-slate-500">
                  (mmHg, optional)
                </span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                value={dbp}
                onChange={(e) => setDbp(e.target.value)}
                placeholder="e.g. 60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Heart rate
                <span className="ml-1 text-[0.65rem] font-normal normal-case text-slate-400 dark:text-slate-500">
                  (/min)
                </span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="e.g. 120"
              />
            </div>
          </div>

          <p className="mt-3 text-[0.7rem] text-slate-500 dark:text-slate-400">
            Shock Index is most commonly used in adults. In paediatric patients, interpret in
            conjunction with age-adjusted vitals, clinical picture, and paediatric shock CPG.
          </p>
        </div>

        {/* Output / interpretation card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Calculated values & interpretation
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Shock Index (SI)
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {Number.isFinite(shockIndex) ? shockIndex.toFixed(2) : "—"}
              </p>
              <p className="mt-1 text-[0.75rem] text-slate-600 dark:text-slate-400">
                HR ÷ SBP. Elevated SI may indicate occult shock even when SBP is &quot;normal&quot;.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                MAP (if DBP entered)
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {mapText}
              </p>
              <p className="mt-1 text-[0.75rem] text-slate-600 dark:text-slate-400">
                Estimated mean arterial pressure using (SBP + 2×DBP) ÷ 3. Compare with target MAP
                ranges in relevant CPGs (e.g. trauma, TBI, shock).
              </p>
            </div>
          </div>

          <div
            className={classNames(
              "rounded-2xl border px-3 py-2.5 text-xs md:text-sm",
              siColour
            )}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.18em] mb-1">
              Shock Index band
            </p>
            <p className="font-semibold">{siLabel}</p>
            <ul className="mt-1.5 list-disc pl-4 space-y-0.5">
              <li>SI &lt; 0.7: usually within normal range in stable adults.</li>
              <li>
                SI 0.7–0.9: may reflect early compromise – monitor trends, repeat vitals, and use
                QEWS/sepsis tools.
              </li>
              <li>
                SI ≥ 0.9: concerning for shock – treat as time-critical and follow relevant CPG
                (trauma, sepsis, haemorrhage, cardiogenic shock, etc.).
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Summary strip */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            PRF summary
          </p>
          <p className="mt-1 text-xs md:text-sm">{summaryText}</p>
        </div>
        <CopySummaryButton summaryText={summaryText} />
      </section>
    </div>
  );
}
