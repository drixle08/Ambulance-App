"use client";

import { useState } from "react";
import { ToolHeader } from "@/app/_components/ToolHeader";
import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  EMPTY_RACE,
  RACE_LVO_THRESHOLD,
  RACE_VIDEO_URL,
  raceItems as getRaceItems,
  raceTotal,
  type Hemiparesis,
  type RaceScores,
} from "@/lib/race";
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
import { cpgEdition } from "@/lib/cpgEdition";

// Edition this tool's clinical content was last checked against (see lib/cpgEdition.ts).
const EDITION = cpgEdition("2.6");

// ─── Types ───────────────────────────────────────────────────────────────────

type BEFASTState = "normal" | "abnormal" | "unknown";
// CPG 3.1 Stroke Transport Destination Decision Tree onset bands (edition: EDITION).
type OnsetBand = "le8" | "8to24" | "ge24" | "unknown";

const ONSET_OPTIONS = [
  { id: "le8", label: "≤ 8 hours", sub: "Onset / last known well" },
  { id: "8to24", label: "> 8 h & < 24 h", sub: "Perform RACE" },
  { id: "ge24", label: "≥ 24 hours", sub: "Onset / last known well" },
  { id: "unknown", label: "Wake-up / unknown", sub: "Treat as acute stroke" },
] as const;

const ONSET_LABEL: Record<OnsetBand, string> = {
  le8: "≤ 8 h",
  "8to24": "> 8 h & < 24 h",
  ge24: "≥ 24 h",
  unknown: "Wake-up / unknown onset",
};

type Destination = {
  tone: "none" | "p1" | "p2" | "pending";
  title: string;
  steps: string[];
};

function getDestination(
  befastPositive: boolean,
  onset: OnsetBand,
  raceScore: number | null
): Destination {
  if (!befastPositive) {
    return {
      tone: "none",
      title: "BEFAST negative — manage according to clinical condition",
      steps: [
        "Full neurological assessment. Rule out mimics: hypoglycaemia, hypoxia, seizure/post-ictal, intoxication, infection, migraine.",
        "Reassess BEFAST if symptoms change.",
      ],
    };
  }
  const p1: Destination = {
    tone: "p1",
    title: "Transport P1 to HGH ED",
    steps: [
      "Update CC:E and provide hospital prenotification.",
      "Prenotify: age, time last seen well / onset, BEFAST findings, RACE score (if applicable), RBS, BP, anticoagulant status, ETA.",
    ],
  };
  if (onset === "le8") return p1;
  if (onset === "unknown") {
    return {
      ...p1,
      steps: ["Wake-up or unknown-onset stroke is treated as an acute stroke.", ...p1.steps],
    };
  }
  if (onset === "ge24") {
    return {
      tone: "p2",
      title: "Transport P2 to nearest appropriate ED",
      steps: ["Onset / last known well ≥ 24 h."],
    };
  }
  if (raceScore === null) {
    return {
      tone: "pending",
      title: "Perform RACE to decide destination",
      steps: ["Onset / last known well > 8 h and < 24 h — complete every RACE item below."],
    };
  }
  if (raceScore >= RACE_LVO_THRESHOLD) {
    return { ...p1, steps: [`RACE ${raceScore} (≥ 5) — possible large vessel occlusion.`, ...p1.steps] };
  }
  return {
    tone: "p2",
    title: "Transport P2 to nearest appropriate ED",
    steps: [`RACE ${raceScore} (< 5).`],
  };
}

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
  const [onset, setOnset] = useState<OnsetBand>("le8");
  const [states, setStates] = useState<Record<BEFASTKey, BEFASTState>>({
    balance: "normal",
    eyes: "normal",
    face: "normal",
    arm: "normal",
    speech: "normal",
  });
  const [hemiparesis, setHemiparesis] = useState<Hemiparesis>("right");
  const [race, setRace] = useState<RaceScores>(EMPTY_RACE);

  function setState(key: BEFASTKey, val: BEFASTState) {
    setStates((prev) => ({ ...prev, [key]: val }));
  }

  function handleReset() {
    setOnset("le8");
    setStates({ balance: "normal", eyes: "normal", face: "normal", arm: "normal", speech: "normal" });
    setHemiparesis("right");
    setRace(EMPTY_RACE);
  }

  const raceItems = getRaceItems(hemiparesis);
  const raceScore = raceTotal(race);

  const abnormalKeys = BEFAST_ITEMS.filter(
    (i) => states[i.key] === "abnormal"
  ).map((i) => i.label);
  const abnormalCount = abnormalKeys.length;
  const unknownCount = Object.values(states).filter(
    (v) => v === "unknown"
  ).length;

  const befastPositive = abnormalCount > 0;
  const destination = getDestination(befastPositive, onset, raceScore);
  const showRace = befastPositive && onset === "8to24";

  const TONE_STYLES = {
    none: { border: "border-slate-700", bg: "bg-slate-900", text: "text-slate-300", dot: "bg-slate-500" },
    pending: { border: "border-amber-700", bg: "bg-amber-950/70", text: "text-amber-300", dot: "bg-amber-500" },
    p1: { border: "border-rose-700", bg: "bg-rose-950/70", text: "text-rose-300", dot: "bg-rose-500" },
    p2: { border: "border-sky-700", bg: "bg-sky-950/70", text: "text-sky-300", dot: "bg-sky-500" },
  };
  const cs = TONE_STYLES[destination.tone];

  const summaryText =
    `BEFAST: ${abnormalCount}/5 positive${abnormalKeys.length ? ` (${abnormalKeys.join(", ")})` : ""}; ` +
    `onset / last known well: ${ONSET_LABEL[onset]}` +
    (showRace && raceScore !== null ? `; RACE ${raceScore}/9` : "") +
    `. Destination: ${destination.title} (CPG 3.1).`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-48">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/assessment-screening"
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
          <div className="grid grid-cols-2 gap-2">
            {ONSET_OPTIONS.map((opt) => {
              const active = onset === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOnset(opt.id)}
                  className={`rounded-xl border p-3 text-center transition-colors active:scale-95 ${
                    active
                      ? "border-violet-500/70 bg-violet-950/50"
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

        {/* ── RACE scale (BEFAST positive, onset > 8 h & < 24 h) ── */}
        {showRace && (
          <section className="rounded-2xl border border-violet-800/60 bg-slate-900 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                RACE Scale — Large Vessel Occlusion
              </span>
              <span className="ml-auto text-sm font-bold text-white">
                {raceScore !== null ? `${raceScore}/9` : "—/9"}
              </span>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] text-slate-400">Side of hemiparesis</p>
              <div className="grid grid-cols-2 gap-2">
                {(["right", "left"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => {
                      setHemiparesis(side);
                      setRace((prev) => ({ ...prev, cortical: null }));
                    }}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      hemiparesis === side
                        ? "border-violet-500/70 bg-violet-950/50 text-violet-200"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {side === "right" ? "Right → test aphasia" : "Left → test agnosia"}
                  </button>
                ))}
              </div>
            </div>

            {raceItems.map((item) => (
              <div key={item.key}>
                <p className="mb-1.5 text-[11px] font-semibold text-slate-300">{item.label}</p>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${item.options.length}, minmax(0, 1fr))` }}>
                  {item.options.map((opt) => (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setRace((prev) => ({ ...prev, [item.key]: opt.score }))}
                      className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                        race[item.key] === opt.score
                          ? "border-violet-500/70 bg-violet-950/50 text-violet-200"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <span className="block text-sm font-bold">{opt.score}</span>
                      <span className="block text-[10px] leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-[10px] text-slate-500">
              RACE ≥ 5 = possible large vessel occlusion. Learn the assessment:{" "}
              <a
                href={RACE_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-300 underline"
              >
                RACE educational video
              </a>
            </p>
          </section>
        )}

        <p className="text-[10px] text-slate-600 pb-2">
          CPG 3.1 Stroke ({EDITION.tag}) — destination follows the Stroke Transport Destination Decision Tree.
          RACE is used only for BEFAST-positive patients with onset / last known well &gt; 8 h and &lt; 24 h.
          Do not delay on scene waiting for a CCP; do not reduce BP with nitrates.
        </p>
      </main>

      {/* ── Sticky Outcome Bar ── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 space-y-2">
          <div className={`rounded-xl border p-3 space-y-2 ${cs.border} ${cs.bg}`}>
            <div className="flex items-center gap-2">
              {destination.tone !== "none" && (
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${cs.text}`} />
              )}
              <p className={`text-sm font-bold ${cs.text}`}>{destination.title}</p>
              <span className="ml-auto text-[10px] text-slate-500 text-right">
                BEFAST {abnormalCount}/5 · {ONSET_LABEL[onset]}
              </span>
            </div>
            <ul className="space-y-0.5">
              {destination.steps.map((a, i) => (
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
