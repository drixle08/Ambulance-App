"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Brain, AlertTriangle, PlayCircle } from "lucide-react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  EMPTY_RACE,
  RACE_EDITION,
  RACE_LVO_THRESHOLD,
  RACE_MAX_SCORE,
  RACE_VIDEO_URL,
  raceItems,
  raceTotal,
  type Hemiparesis,
  type RaceScores,
} from "@/lib/race";

export default function RacePage() {
  const [hemiparesis, setHemiparesis] = useState<Hemiparesis>("right");
  const [scores, setScores] = useState<RaceScores>(EMPTY_RACE);

  const items = raceItems(hemiparesis);
  const total = raceTotal(scores);
  const answered = Object.values(scores).filter((v) => v !== null).length;
  const partial = Object.values(scores).reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const lvo = total !== null && total >= RACE_LVO_THRESHOLD;

  function handleReset() {
    setHemiparesis("right");
    setScores(EMPTY_RACE);
  }

  const outcome =
    total === null
      ? {
          title: `Score every item (${answered}/5)`,
          detail: "RACE is used for BEFAST-positive patients with onset / last known well > 8 h and < 24 h.",
          cls: "border-slate-700 bg-slate-900 text-slate-300",
        }
      : lvo
      ? {
          title: `RACE ${total} — possible large vessel occlusion`,
          detail: "Update CC:E, provide hospital prenotification and transport P1 to HGH ED.",
          cls: "border-rose-700 bg-rose-950/70 text-rose-300",
        }
      : {
          title: `RACE ${total} — below ${RACE_LVO_THRESHOLD}`,
          detail: "Onset > 8 h & < 24 h: transport P2 to the nearest appropriate ED.",
          cls: "border-sky-700 bg-sky-950/70 text-sky-300",
        };

  const summaryText =
    total === null
      ? "RACE scale incomplete."
      : `RACE ${total}/${RACE_MAX_SCORE} (${hemiparesis} hemiparesis): ` +
        items.map((item) => `${item.label.split(" — ")[0]} ${scores[item.key]}`).join(", ") +
        `. ${lvo ? "≥ 5 — possible LVO" : "< 5"} (CPG 3.1).`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-48">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/assessment-screening"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">
              Neurological · CPG 3.1
            </p>
            <h1 className="text-base font-bold text-white leading-tight">RACE Scale</h1>
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
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <p className="text-xs leading-5 text-slate-300">
            The Rapid Arterial oCclusion Evaluation (RACE) is used with BEFAST to identify strokes
            associated with large vessel occlusion. Use it for BEFAST-positive patients with onset /
            last known well <span className="font-semibold text-white">&gt; 8 h and &lt; 24 h</span>.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/tools/stroke"
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-500/20"
            >
              <Brain className="h-3.5 w-3.5" />
              Stroke BEFAST & destination
            </Link>
            <a
              href={RACE_VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              RACE educational video
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Side of hemiparesis
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["right", "left"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => {
                  setHemiparesis(side);
                  setScores((prev) => ({ ...prev, cortical: null }));
                }}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  hemiparesis === side
                    ? "border-violet-500/70 bg-violet-950/50 text-violet-200"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                }`}
              >
                {side === "right" ? "Right → test aphasia" : "Left → test agnosia"}
              </button>
            ))}
          </div>
        </section>

        {items.map((item) => (
          <section key={item.key} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-white">{item.label}</p>
              <span className="text-xs font-semibold text-slate-500">
                {scores[item.key] ?? "–"}/{item.options.length - 1}
              </span>
            </div>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${item.options.length}, minmax(0, 1fr))` }}
            >
              {item.options.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setScores((prev) => ({ ...prev, [item.key]: opt.score }))}
                  className={`rounded-xl border px-2 py-2.5 text-center transition-colors active:scale-95 ${
                    scores[item.key] === opt.score
                      ? "border-violet-500/70 bg-violet-950/50 text-violet-200"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="block text-base font-bold">{opt.score}</span>
                  <span className="block text-[10px] leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}

        <p className="text-[10px] text-slate-600 pb-2">
          CPG 3.1 Stroke ({RACE_EDITION.tag}). RACE ≥ {RACE_LVO_THRESHOLD} = possible large vessel occlusion.
          Include the RACE score in the hospital prenotification. Do not delay on scene to complete it.
        </p>
      </main>

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className={`rounded-xl border p-3 ${outcome.cls}`}>
            <div className="flex items-center gap-2">
              {lvo && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              <p className="text-sm font-bold">{outcome.title}</p>
              <span className="ml-auto text-lg font-black tabular-nums text-white">
                {total ?? partial}/{RACE_MAX_SCORE}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-300">{outcome.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
