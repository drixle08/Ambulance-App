"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Activity, Heart, Droplets, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

export default function ShockIndexPage() {
  const router = useRouter();
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

  let siBand: "normal" | "borderline" | "high" | "invalid" = "invalid";
  if (Number.isFinite(shockIndex)) {
    if (shockIndex < 0.7) siBand = "normal";
    else if (shockIndex < 0.9) siBand = "borderline";
    else siBand = "high";
  }

  const siConfig = {
    normal: {
      label: "Within Normal Range",
      sub: "SI < 0.7 — stable perfusion",
      icon: <CheckCircle className="w-6 h-6" />,
      bar: "bg-emerald-500",
      card: "border-emerald-500/40 bg-emerald-500/10",
      text: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    borderline: {
      label: "Elevated — Monitor Closely",
      sub: "SI 0.7–0.9 — possible early compromise",
      icon: <AlertCircle className="w-6 h-6" />,
      bar: "bg-amber-500",
      card: "border-amber-500/40 bg-amber-500/10",
      text: "text-amber-400",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    high: {
      label: "HIGH — Concerning for Shock",
      sub: "SI ≥ 0.9 — treat as time-critical",
      icon: <AlertTriangle className="w-6 h-6" />,
      bar: "bg-rose-500",
      card: "border-rose-500/40 bg-rose-500/10",
      text: "text-rose-400",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    invalid: {
      label: "Awaiting Data",
      sub: "Enter HR and SBP to calculate",
      icon: <Activity className="w-6 h-6" />,
      bar: "bg-slate-700",
      card: "border-slate-700 bg-slate-900",
      text: "text-slate-400",
      badge: "bg-slate-800 text-slate-400 border-slate-700",
    },
  }[siBand];

  const hasEnoughData = Number.isFinite(shockIndex);

  const summaryText = hasEnoughData
    ? `Shock index: HR ${Math.round(hrNum)}/min, SBP ${Math.round(sbpNum)} mmHg → SI ${shockIndex.toFixed(2)} (${siConfig.label.toLowerCase()}).${Number.isFinite(map) ? ` MAP ≈ ${Math.round(map)} mmHg.` : ""} ${siBand === "high" ? "Treat as time-critical — consider occult shock, follow sepsis/trauma/shock CPG, prenotify receiving hospital." : siBand === "borderline" ? "Elevated SI — monitor trends, repeat vitals, be alert for early shock." : "SI not elevated — continue routine monitoring."}`
    : "Shock index tool used — insufficient data to calculate SI. Enter HR and SBP to generate summary.";

  const handleReset = () => {
    setSbp("");
    setDbp("");
    setHr("");
  };

  // Visual SI gauge: max display at SI=1.5
  const siGaugeWidth = Number.isFinite(shockIndex)
    ? Math.min((shockIndex / 1.5) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
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
              Shock Index & MAP Calculator
            </h1>
          </div>
          <CopySummaryButton summaryText={summaryText} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-4">

        {/* Vitals input */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Patient Vitals</p>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* SBP */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-orange-400" />
                <label className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                  SBP
                </label>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={sbp}
                onChange={(e) => setSbp(e.target.value)}
                placeholder="e.g. 90"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-lg font-bold text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder:text-slate-600 transition-colors"
              />
              <p className="text-[0.6rem] text-slate-600 text-center">mmHg</p>
            </div>

            {/* DBP */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-violet-400" />
                <label className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                  DBP
                </label>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={dbp}
                onChange={(e) => setDbp(e.target.value)}
                placeholder="e.g. 60"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-lg font-bold text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600 transition-colors"
              />
              <p className="text-[0.6rem] text-slate-600 text-center">mmHg (optional)</p>
            </div>

            {/* HR */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <label className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                  HR
                </label>
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="e.g. 120"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-lg font-bold text-slate-100 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-slate-600 transition-colors"
              />
              <p className="text-[0.6rem] text-slate-600 text-center">/min</p>
            </div>
          </div>
        </section>

        {/* Result cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Shock Index result */}
          <div className={["rounded-xl border p-4 space-y-2", siConfig.card].join(" ")}>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Shock Index</p>
            <p className={["text-4xl font-black", siConfig.text].join(" ")}>
              {Number.isFinite(shockIndex) ? shockIndex.toFixed(2) : "—"}
            </p>
            <p className="text-[0.65rem] text-slate-500">HR ÷ SBP</p>
          </div>

          {/* MAP result */}
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">MAP</p>
            <p className="text-4xl font-black text-slate-100">
              {Number.isFinite(map) ? Math.round(map) : "—"}
            </p>
            <p className="text-[0.65rem] text-slate-500">
              {Number.isFinite(map) ? "mmHg · (SBP + 2×DBP) ÷ 3" : "Enter SBP + DBP"}
            </p>
          </div>
        </div>

        {/* SI gauge bar */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-[0.6rem] text-slate-600 font-mono">
            <span>0.0</span>
            <span>0.7</span>
            <span>0.9</span>
            <span>1.5+</span>
          </div>
          <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
            {/* Zone bands */}
            <div className="absolute inset-y-0 left-0 w-[47%] bg-emerald-500/20" />
            <div className="absolute inset-y-0 left-[47%] w-[13%] bg-amber-500/20" />
            <div className="absolute inset-y-0 left-[60%] right-0 bg-rose-500/20" />
            {/* Value bar */}
            <div
              className={["absolute inset-y-0 left-0 rounded-full transition-all duration-300", siConfig.bar].join(" ")}
              style={{ width: `${siGaugeWidth}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className={["flex items-center gap-1.5 rounded-lg border px-3 py-1.5 flex-1 justify-center", siConfig.badge].join(" ")}>
              <span className={siConfig.text}>{siConfig.icon}</span>
              <div>
                <p className="text-xs font-bold leading-tight">{siConfig.label}</p>
                <p className="text-[0.6rem] opacity-70">{siConfig.sub}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SI reference thresholds */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800 overflow-hidden">
          <div className="px-4 py-2.5">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">SI Reference Thresholds</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-200">SI &lt; 0.7</p>
              <p className="text-xs text-slate-500">Usually within normal range in stable adults</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-200">SI 0.7–0.9</p>
              <p className="text-xs text-slate-500">May reflect early compromise — monitor trends, repeat vitals, use QEWS/sepsis tools</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-200">SI ≥ 0.9</p>
              <p className="text-xs text-slate-500">Concerning for shock — treat as time-critical, follow trauma/sepsis/haemorrhage CPG</p>
            </div>
          </div>
        </section>

        <p className="text-[0.65rem] text-slate-600 text-center pb-2">
          SI is most validated in adults. In paediatrics, interpret with age-adjusted vitals and paediatric shock CPG.
        </p>
      </div>

      {/* Sticky outcome bar */}
      {hasEnoughData && (
        <div className={["fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t backdrop-blur-sm px-4 py-3", siConfig.card, "border-t"].join(" ")}>
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className={siConfig.text}>{siConfig.icon}</span>
              <div className="min-w-0">
                <p className={["text-xs font-bold truncate", siConfig.text].join(" ")}>{siConfig.label}</p>
                <p className="text-[0.65rem] text-slate-400 truncate">SI {shockIndex.toFixed(2)}{Number.isFinite(map) ? ` · MAP ${Math.round(map)} mmHg` : ""}</p>
              </div>
            </div>
            <CopySummaryButton summaryText={summaryText} />
          </div>
        </div>
      )}
    </div>
  );
}
