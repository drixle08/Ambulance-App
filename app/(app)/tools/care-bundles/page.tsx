"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, RotateCcw, CheckCheck } from "lucide-react";

type BundleItem = {
  id: string;
  label: string;
  note?: string;
};

type Bundle = {
  id: string;
  title: string;
  shortTitle: string;
  color: BundleColor;
  tip?: string;
  items: BundleItem[];
};

type BundleColor = "sky" | "red" | "violet" | "orange" | "amber" | "teal" | "rose" | "emerald" | "indigo";

const COLOR: Record<BundleColor, { bg: string; icon: string; border: string; pill: string; check: string; cardBg: string; progressFill: string; banner: string }> = {
  sky: {
    bg: "bg-sky-500/10",
    icon: "text-sky-400",
    border: "border-sky-500/30",
    pill: "bg-sky-500/15 text-sky-300",
    check: "text-sky-400",
    cardBg: "hover:border-sky-500/40",
    progressFill: "bg-sky-500",
    banner: "bg-sky-500/15 border-sky-500/30 text-sky-300",
  },
  red: {
    bg: "bg-red-500/10",
    icon: "text-red-400",
    border: "border-red-500/30",
    pill: "bg-red-500/15 text-red-300",
    check: "text-red-400",
    cardBg: "hover:border-red-500/40",
    progressFill: "bg-red-500",
    banner: "bg-red-500/15 border-red-500/30 text-red-300",
  },
  violet: {
    bg: "bg-violet-500/10",
    icon: "text-violet-400",
    border: "border-violet-500/30",
    pill: "bg-violet-500/15 text-violet-300",
    check: "text-violet-400",
    cardBg: "hover:border-violet-500/40",
    progressFill: "bg-violet-500",
    banner: "bg-violet-500/15 border-violet-500/30 text-violet-300",
  },
  orange: {
    bg: "bg-orange-500/10",
    icon: "text-orange-400",
    border: "border-orange-500/30",
    pill: "bg-orange-500/15 text-orange-300",
    check: "text-orange-400",
    cardBg: "hover:border-orange-500/40",
    progressFill: "bg-orange-500",
    banner: "bg-orange-500/15 border-orange-500/30 text-orange-300",
  },
  amber: {
    bg: "bg-amber-500/10",
    icon: "text-amber-400",
    border: "border-amber-500/30",
    pill: "bg-amber-500/15 text-amber-300",
    check: "text-amber-400",
    cardBg: "hover:border-amber-500/40",
    progressFill: "bg-amber-500",
    banner: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
  teal: {
    bg: "bg-teal-500/10",
    icon: "text-teal-400",
    border: "border-teal-500/30",
    pill: "bg-teal-500/15 text-teal-300",
    check: "text-teal-400",
    cardBg: "hover:border-teal-500/40",
    progressFill: "bg-teal-500",
    banner: "bg-teal-500/15 border-teal-500/30 text-teal-300",
  },
  rose: {
    bg: "bg-rose-500/10",
    icon: "text-rose-400",
    border: "border-rose-500/30",
    pill: "bg-rose-500/15 text-rose-300",
    check: "text-rose-400",
    cardBg: "hover:border-rose-500/40",
    progressFill: "bg-rose-500",
    banner: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
    border: "border-emerald-500/30",
    pill: "bg-emerald-500/15 text-emerald-300",
    check: "text-emerald-400",
    cardBg: "hover:border-emerald-500/40",
    progressFill: "bg-emerald-500",
    banner: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    icon: "text-indigo-400",
    border: "border-indigo-500/30",
    pill: "bg-indigo-500/15 text-indigo-300",
    check: "text-indigo-400",
    cardBg: "hover:border-indigo-500/40",
    progressFill: "bg-indigo-500",
    banner: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  },
};

const BUNDLES: Bundle[] = [
  {
    id: "apo",
    title: "APO",
    shortTitle: "APO",
    color: "sky",
    items: [
      { id: "apo-cpap", label: "CPAP" },
      { id: "apo-etco2", label: "ETCO2" },
      { id: "apo-gtn", label: "GTN SL / IV" },
      { id: "apo-12ecg", label: "12-lead ECG" },
    ],
  },
  {
    id: "all-critical",
    title: "All Critical Patients",
    shortTitle: "All Critical",
    color: "red",
    items: [
      { id: "crit-bp", label: "BP every 2 minutes" },
      { id: "crit-defib", label: "Defib pads on" },
      { id: "crit-etco2", label: "ETCO2" },
      { id: "crit-qrs", label: "QRS / HR tone on HIGH" },
      { id: "crit-spo2", label: "SpO2 opposite arm to BP" },
      { id: "crit-4ecg", label: "4 / 12-lead ECG" },
    ],
  },
  {
    id: "all-sedated",
    title: "All Sedated Patients",
    shortTitle: "All Sedated",
    color: "violet",
    tip: "Treat all sedated patients as critical — you will automatically fulfil the sedated patients care bundle.",
    items: [
      { id: "sed-bp", label: "BP every 5 minutes" },
      { id: "sed-etco2", label: "ETCO2" },
      { id: "sed-spo2", label: "SpO2 opposite arm to BP" },
      { id: "sed-4ecg", label: "4-lead ECG" },
    ],
  },
  {
    id: "anaphylaxis",
    title: "Anaphylaxis",
    shortTitle: "Anaphylaxis",
    color: "orange",
    items: [
      { id: "ana-adr", label: "Adrenaline IM / IV" },
      { id: "ana-diph", label: "Diphenhydramine IV" },
      { id: "ana-fluids", label: "Fluids IV" },
      { id: "ana-hydro", label: "Hydrocortisone IV" },
    ],
  },
  {
    id: "asthma-lt",
    title: "Asthma — Life Threatening",
    shortTitle: "Asthma LT",
    color: "amber",
    items: [
      { id: "asth-adr", label: "Adrenaline IM / IV" },
      { id: "asth-fluids", label: "Fluids IV" },
      { id: "asth-hydro", label: "Hydrocortisone IV" },
      { id: "asth-ipra", label: "Ipratropium NEB" },
      { id: "asth-mag", label: "Magnesium Sulphate IV" },
      { id: "asth-salb", label: "Salbutamol NEB" },
    ],
  },
  {
    id: "covid",
    title: "COVID-19",
    shortTitle: "COVID-19",
    color: "teal",
    items: [
      { id: "covid-dexa", label: "Dexamethasone IV / IM", note: "if SpO2 < 93%" },
      { id: "covid-cpap", label: "CPAP", note: "if RR > 30 or SpO2 < 93%" },
    ],
  },
  {
    id: "major-trauma",
    title: "Major Trauma",
    shortTitle: "Major Trauma",
    color: "rose",
    items: [
      { id: "trauma-analg", label: "Analgesia" },
      { id: "trauma-vaso", label: "Consider vasopressor" },
      { id: "trauma-fluids", label: "Fluids IV — minimal / permissive hypotension" },
      { id: "trauma-o2", label: "Oxygen" },
      { id: "trauma-txa", label: "TXA IV" },
    ],
  },
  {
    id: "stemi",
    title: "STEMI",
    shortTitle: "STEMI",
    color: "emerald",
    items: [
      { id: "stemi-analg", label: "Analgesia" },
      { id: "stemi-asp", label: "Aspirin" },
      { id: "stemi-clop", label: "Clopidogrel" },
      { id: "stemi-defib", label: "Defib pads on" },
      { id: "stemi-gtn", label: "GTN SL / IV" },
      { id: "stemi-12ecg", label: "12-lead ECG" },
    ],
  },
  {
    id: "stroke",
    title: "Stroke",
    shortTitle: "Stroke",
    color: "indigo",
    items: [
      { id: "stroke-befast", label: "BEFAST assessment" },
      { id: "stroke-p1", label: "Priority 1 to HGH", note: "< 15 h from onset, or uncertain onset time" },
      { id: "stroke-rbs", label: "RBS check" },
      { id: "stroke-bp", label: "Regular BP monitoring" },
    ],
  },
];

export default function CareBundlesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(BUNDLES.map((b) => [b.id, new Set<string>()]))
  );

  const selectedBundle = BUNDLES.find((b) => b.id === selectedId) ?? null;

  const toggle = (bundleId: string, itemId: string) => {
    setChecked((prev) => {
      const next = new Set(prev[bundleId]);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return { ...prev, [bundleId]: next };
    });
  };

  const resetBundle = (bundleId: string) => {
    setChecked((prev) => ({ ...prev, [bundleId]: new Set<string>() }));
  };

  const resetAll = () => {
    setChecked(Object.fromEntries(BUNDLES.map((b) => [b.id, new Set<string>()])));
  };

  // ── Bundle list ──────────────────────────────────────────────────────────────
  if (!selectedBundle) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-24 pt-4">
        {/* Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/ccp-cca"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-teal-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            CCP / CCA
          </Link>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-500 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </button>
        </div>

        {/* Header */}
        <header className="space-y-0.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-teal-500">CCP / CCA</p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">Care Bundles</h1>
          <p className="text-xs text-slate-400">Tap a bundle to open the checklist</p>
        </header>

        {/* Bundle grid */}
        <div className="flex flex-col gap-2">
          {BUNDLES.map((bundle) => {
            const c = COLOR[bundle.color];
            const done = checked[bundle.id].size;
            const total = bundle.items.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const complete = done === total;

            return (
              <button
                key={bundle.id}
                type="button"
                onClick={() => setSelectedId(bundle.id)}
                className={`group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-left transition-all active:scale-[0.98] ${c.cardBg}`}
              >
                {/* Progress ring-ish dot */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
                  {complete ? (
                    <CheckCheck className={`h-5 w-5 ${c.icon}`} />
                  ) : (
                    <span className={`text-base font-bold ${c.icon}`}>{done}/{total}</span>
                  )}
                </div>

                {/* Text + progress */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-50">{bundle.title}</p>
                    {complete && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${c.pill}`}>
                        Done
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${c.progressFill}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[0.65rem] text-slate-500">{total} item{total !== 1 ? "s" : ""}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Checklist detail ─────────────────────────────────────────────────────────
  const c = COLOR[selectedBundle.color];
  const done = checked[selectedBundle.id].size;
  const total = selectedBundle.items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done === total;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-24 pt-4">
      {/* Back + reset */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-teal-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All bundles
        </button>
        <button
          type="button"
          onClick={() => resetBundle(selectedBundle.id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-500 hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Header */}
      <header className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg}`}>
          <span className={`text-lg font-bold ${c.icon}`}>{done}/{total}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-slate-50">{selectedBundle.title}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${c.progressFill}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-400">{pct}%</span>
          </div>
        </div>
      </header>

      {/* Tip */}
      {selectedBundle.tip && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${c.banner}`}>
          <span className="font-semibold">Tip: </span>{selectedBundle.tip}
        </div>
      )}

      {/* Complete banner */}
      {complete && (
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${c.banner}`}>
          <CheckCheck className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Bundle complete</p>
            <p className="text-xs opacity-75">All items checked off</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-2">
        {selectedBundle.items.map((item) => {
          const isChecked = checked[selectedBundle.id].has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(selectedBundle.id, item.id)}
              className={`flex items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.98] ${
                isChecked
                  ? `${c.bg} ${c.border}`
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              {/* Checkbox */}
              <span className={`mt-0.5 shrink-0 transition-colors ${isChecked ? c.check : "text-slate-600"}`}>
                {isChecked ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </span>

              {/* Label + note */}
              <div className="min-w-0 flex-1">
                <p className={`text-base font-semibold leading-snug transition-colors ${isChecked ? "text-slate-300 line-through decoration-slate-500" : "text-slate-50"}`}>
                  {item.label}
                </p>
                {item.note && (
                  <p className={`mt-0.5 text-xs ${isChecked ? "text-slate-600" : "text-slate-400"}`}>
                    {item.note}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
