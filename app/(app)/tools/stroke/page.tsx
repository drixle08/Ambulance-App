"use client";

import { useState } from "react";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  Footprints,
  Eye,
  Smile,
  Hand,
  MessageCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Brain,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type BEFASTState = "normal" | "abnormal" | "unknown";
type OnsetBand = "lt15" | "gt15" | "unknown";

// ─── BEFAST items ─────────────────────────────────────────────────────────────

const BEFAST_ITEMS = [
  {
    key: "balance" as const,
    letter: "B",
    label: "Balance",
    desc: "Sudden loss of balance, unsteady gait, leaning to one side, difficulty walking.",
    icon: <Footprints className="w-5 h-5" />,
  },
  {
    key: "eyes" as const,
    letter: "E",
    label: "Eyes",
    desc: "Sudden change in vision: loss in one eye, double vision, or field defect.",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    key: "face" as const,
    letter: "F",
    label: "Face",
    desc: "Facial asymmetry: droop when smiling, flattened nasolabial fold, unequal grimace.",
    icon: <Smile className="w-5 h-5" />,
  },
  {
    key: "arm" as const,
    letter: "A",
    label: "Arm",
    desc: "Arm drift or weakness: unable to hold both arms up equally for 10 seconds.",
    icon: <Hand className="w-5 h-5" />,
  },
  {
    key: "speech" as const,
    letter: "S",
    label: "Speech",
    desc: "Slurred speech, word-finding difficulty, inappropriate words, or comprehension problems.",
    icon: <MessageCircle className="w-5 h-5" />,
  },
] as const;

type BEFASTKey = (typeof BEFAST_ITEMS)[number]["key"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StrokeBefastPage() {
  const [onset, setOnset] = useState<OnsetBand>("lt15");
  const [states, setStates] = useState<Record<BEFASTKey, BEFASTState>>({
    balance: "normal",
    eyes: "normal",
    face: "normal",
    arm: "normal",
    speech: "normal",
  });

  function setState(key: BEFASTKey, val: BEFASTState) {
    setStates((prev) => ({ ...prev, [key]: val }));
  }

  function handleReset() {
    setOnset("lt15");
    setStates({ balance: "normal", eyes: "normal", face: "normal", arm: "normal", speech: "normal" });
  }

  const abnormalKeys = BEFAST_ITEMS.filter(
    (i) => states[i.key] === "abnormal"
  ).map((i) => i.label);
  const abnormalCount = abnormalKeys.length;
  const unknownCount = Object.values(states).filter(
    (v) => v === "unknown"
  ).length;

  // Classification
  type Classification = "none" | "possible" | "high";
  const classification: Classification =
    abnormalCount === 0 ? "none" : abnormalCount <= 2 ? "possible" : "high";

  const onsetLabel =
    onset === "lt15"
      ? "< 15 h / wake-up stroke"
      : onset === "gt15"
      ? "> 15 h since onset"
      : "Onset time unknown";

  const timeCriticalNote =
    abnormalCount >= 1 && onset === "lt15"
      ? "Onset < 15 h / wake-up stroke with BEFAST positivity — consider stroke code / hyperacute pathway per CPG 3.1."
      : abnormalCount >= 1 && onset === "gt15"
      ? "Onset > 15 h — outside standard thrombolysis window but still requires urgent stroke assessment and imaging per CPG 3.1."
      : "Document last known well time clearly. Liaise with Clinical Coordination / receiving ED per CPG 3.1.";

  const CLASS_STYLES = {
    none: {
      label: "No BEFAST deficits",
      border: "border-slate-700",
      bg: "bg-slate-900",
      text: "text-slate-400",
      dot: "bg-slate-500",
    },
    possible: {
      label: "BEFAST positive — Possible stroke",
      border: "border-amber-700",
      bg: "bg-amber-950/70",
      text: "text-amber-300",
      dot: "bg-amber-500",
    },
    high: {
      label: "BEFAST positive — High concern",
      border: "border-rose-700",
      bg: "bg-rose-950/70",
      text: "text-rose-300",
      dot: "bg-rose-500",
    },
  };

  const cs = CLASS_STYLES[classification];

  const ACTIONS: Record<Classification, string[]> = {
    none: [
      "Full neurological assessment (GCS, pupils, limb strength, speech, gait). Consider mimics: hypoglycaemia, seizure, migraine, sepsis.",
      "Check blood glucose and vital signs. Manage ABC issues. Consult CPG 3.1 if concern persists.",
    ],
    possible: [
      "Treat as suspected stroke: obtain precise last-known-well time, check blood glucose, full neuro assessment per CPG 3.1.",
      "Prioritise transport to CT-capable facility. Prenotify ED with BEFAST findings and onset band.",
      timeCriticalNote,
    ],
    high: [
      "Time-critical stroke: multiple BEFAST positives — high suspicion for acute stroke.",
      "Secure ABCs, check blood glucose, avoid hypotension/hypoxia. Urgent transport to CT-capable facility with prenotification.",
      timeCriticalNote,
    ],
  };

  const summaryText =
    `BEFAST: ${abnormalCount}/5 positive${abnormalKeys.length ? ` (${abnormalKeys.join(", ")})` : ""}; onset: ${onsetLabel}; classification: ${cs.label}. ` +
    `Actions: ${ACTIONS[classification][0]}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-48">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/assessment"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">
              Neurological
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              Stroke BEFAST Screen
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
        {/* ── T: Time / Onset ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              T — Time of Onset / Last Known Well
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                {
                  id: "lt15" as const,
                  label: "< 15 hours",
                  sub: "Wake-up stroke included",
                  color: "emerald",
                },
                {
                  id: "gt15" as const,
                  label: "> 15 hours",
                  sub: "Outside standard window",
                  color: "amber",
                },
                {
                  id: "unknown" as const,
                  label: "Unknown",
                  sub: "Document best estimate",
                  color: "slate",
                },
              ] as const
            ).map((opt) => {
              const active = onset === opt.id;
              const activeCls =
                opt.color === "emerald"
                  ? "border-emerald-500/70 bg-emerald-950/50"
                  : opt.color === "amber"
                  ? "border-amber-500/70 bg-amber-950/50"
                  : "border-slate-500/70 bg-slate-800";
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOnset(opt.id)}
                  className={`rounded-xl border p-3 text-center transition-colors active:scale-95 ${
                    active
                      ? activeCls
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <p className="text-sm font-bold text-white">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── BEFAST items ── */}
        <div className="space-y-3">
          {BEFAST_ITEMS.map((item) => {
            const val = states[item.key];
            return (
              <div
                key={item.key}
                className={`rounded-2xl border bg-slate-900 overflow-hidden transition-colors ${
                  val === "abnormal"
                    ? "border-rose-700/70"
                    : val === "normal"
                    ? "border-slate-800"
                    : "border-amber-800/50"
                }`}
              >
                {/* Item header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${
                      val === "abnormal"
                        ? "bg-rose-900/60 text-rose-300"
                        : val === "normal"
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                  <StateButton
                    label="Normal"
                    icon={<CheckCircle className="w-4 h-4" />}
                    active={val === "normal"}
                    color="emerald"
                    onClick={() => setState(item.key, "normal")}
                  />
                  <StateButton
                    label="Abnormal"
                    icon={<XCircle className="w-4 h-4" />}
                    active={val === "abnormal"}
                    color="rose"
                    onClick={() => setState(item.key, "abnormal")}
                  />
                  <StateButton
                    label="Can't Assess"
                    icon={<HelpCircle className="w-4 h-4" />}
                    active={val === "unknown"}
                    color="amber"
                    onClick={() => setState(item.key, "unknown")}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BEFAST dot summary ── */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 flex items-center gap-3">
          <Brain className="w-4 h-4 text-violet-400 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            {BEFAST_ITEMS.map((item) => {
              const v = states[item.key];
              return (
                <div key={item.key} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      v === "abnormal"
                        ? "bg-rose-500"
                        : v === "normal"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-[9px] text-slate-500 font-bold">
                    {item.letter}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">
            <span className="font-bold text-white">{abnormalCount}/5</span>{" "}
            abnormal
            {unknownCount > 0 && (
              <span className="text-slate-600"> · {unknownCount} unknown</span>
            )}
          </p>
        </div>

        <p className="text-[10px] text-slate-600 pb-2">
          CPG 3.1 Stroke — BEFAST assists early recognition and transport priority.
          Thrombolysis/thrombectomy decisions require imaging and the receiving stroke team.
        </p>
      </main>

      {/* ── Sticky Outcome Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 space-y-2">
          <div className={`rounded-xl border p-3 space-y-2 ${cs.border} ${cs.bg}`}>
            <div className="flex items-center gap-2">
              {classification !== "none" && (
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${cs.text}`} />
              )}
              <p className={`text-sm font-bold ${cs.text}`}>{cs.label}</p>
              <span className="ml-auto text-[10px] text-slate-500">
                Onset: {onsetLabel}
              </span>
            </div>
            <ul className="space-y-0.5">
              {ACTIONS[classification].map((a, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 text-[11px] text-slate-300 leading-snug"
                >
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cs.dot}`}
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type StateButtonProps = {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  color: "emerald" | "rose" | "amber";
  onClick: () => void;
};

const STATE_BTN_ACTIVE = {
  emerald: "border-emerald-500/70 bg-emerald-950/50 text-emerald-300",
  rose: "border-rose-500/70 bg-rose-950/50 text-rose-300",
  amber: "border-amber-500/70 bg-amber-950/50 text-amber-300",
};

function StateButton({ label, icon, active, color, onClick }: StateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors active:scale-95 ${
        active
          ? STATE_BTN_ACTIVE[color]
          : "border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-600"
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </button>
  );
}
