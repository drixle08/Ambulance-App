"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  HeartPulse,
  ActivitySquare,
  Volume2,
  VolumeX,
} from "lucide-react";

type Phase = "CPR" | "Pause";

type LogEntry = {
  id: string;
  timeSinceStart: string; // "T+06:32"
  absoluteTime: string; // "14:22:05"
  message: string; // "Shock delivered", etc.
};

const CYCLE_SECONDS = 120; // 2-minute CPR cycles
const DEFAULT_BPM = 110;

function formatSeconds(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function formatTPlus(totalSeconds: number): string {
  return `T+${formatSeconds(totalSeconds)}`;
}

export default function ResuscitationTimerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [phase] = useState<Phase>("CPR"); // reserved for future CPR/Pause phases
  const [cycleNumber, setCycleNumber] = useState(1);
  const [secondsRemaining, setSecondsRemaining] =
    useState(CYCLE_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [metronomeOn, setMetronomeOn] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [otherDialogOpen, setOtherDialogOpen] = useState(false);
  const [otherText, setOtherText] = useState("");

  // start time stored both in a ref (for logic) and state (safe for render)
  const [startTime, setStartTime] = useState<Date | null>(null);

  const startTimeRef = useRef<Date | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (audioCtxRef.current) return audioCtxRef.current;

    const AudioCtx =
      window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext;

    if (!AudioCtx) return null;

    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    return ctx;
  }, []);

  const addLog = useCallback((message: string) => {
    const now = new Date();
    const start = startTimeRef.current;
    const offsetSeconds = start
      ? Math.floor((now.getTime() - start.getTime()) / 1000)
      : elapsedRef.current;

    const entry: LogEntry = {
      id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      timeSinceStart: formatTPlus(offsetSeconds),
      absoluteTime: now.toLocaleTimeString(),
      message,
    };

    setLogs((prev) => [...prev, entry]);
  }, []);

  const logCycleStart = useCallback(
    (cycle: number) => {
      addLog(`Cycle ${cycle} started (CPR)`);
    },
    [addLog]
  );

  const playClick = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;

    osc.type = "square";

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }, [getAudioContext]);

  // Main CPR timer
  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Cycle completed -> start next
        setCycleNumber((prevCycle) => {
          const next = prevCycle + 1;
          if (startTimeRef.current) {
            logCycleStart(next);
          }
          return next;
        });

        return CYCLE_SECONDS;
      });

      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, logCycleStart]);

  // Metronome (100–120 bpm, fixed at DEFAULT_BPM)
  useEffect(() => {
    if (!isRunning || !metronomeOn) return;

    const intervalMs = Math.round(60000 / DEFAULT_BPM);

    const id = window.setInterval(() => {
      playClick();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [isRunning, metronomeOn, playClick]);

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      addLog("Timer paused");
      return;
    }

    if (!startTimeRef.current) {
      const now = new Date();
      startTimeRef.current = now;
      setStartTime(now);
      setCycleNumber(1);
      setSecondsRemaining(CYCLE_SECONDS);
      setElapsedSeconds(0);
      addLog("Timer started (Cycle 1, CPR)");
    } else {
      addLog("Timer resumed");
    }

    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCycleNumber(1);
    setSecondsRemaining(CYCLE_SECONDS);
    setElapsedSeconds(0);
    startTimeRef.current = null;
    setStartTime(null);
    setLogs([]);
    addLog("Timer reset");
  };

  const handleShock = () => addLog("Shock delivered");
  const handleAdrenaline = () => addLog("Adrenaline given");
  const handleAmiodarone = () => addLog("Amiodarone given");

  const handleOtherConfirm = () => {
    const trimmed = otherText.trim();
    if (trimmed) {
      addLog(trimmed);
    }
    setOtherText("");
    setOtherDialogOpen(false);
  };

  const mainTimer = formatSeconds(secondsRemaining);
  const elapsedFormatted = formatSeconds(elapsedSeconds);

  const lastEvents = useMemo(
    () => logs.slice(-3).reverse(),
    [logs]
  );

  const startTimeString = startTime
    ? startTime.toLocaleTimeString()
    : "Not started";

  const summaryText = useMemo(() => {
    const headerLines = [
      "Resuscitation summary",
      `Start time: ${startTimeString}`,
      `Total cycles: ${startTime ? cycleNumber : 0}`,
      "",
    ];

    const eventLines =
      logs.length === 0
        ? ["No events recorded."]
        : logs.map(
            (log) =>
              `${log.timeSinceStart}  ${log.message} (${log.absoluteTime})`
          );

    return [...headerLines, ...eventLines].join("\n");
  }, [cycleNumber, logs, startTime, startTimeString]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-5 pt-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <HeartPulse className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Resuscitation
              </span>
              <h1 className="text-sm font-semibold">
                2-minute CPR timer
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMetronomeOn((on) => !on)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-[0.7rem] text-slate-200"
          >
            {metronomeOn ? (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                Metronome
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                Muted
              </>
            )}
          </button>
        </header>

        {/* Main timer area */}
        <section className="flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-center shadow-lg">
              <div className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
                Cycle {cycleNumber} • {phase}
              </div>
              <div className="text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">
                {mainTimer}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-[0.7rem] text-slate-400">
                <ActivitySquare className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  Time since start:{" "}
                  <span className="font-mono text-slate-100">
                    {elapsedFormatted}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent events */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Recent events
            </span>
            <span className="text-[0.65rem] text-slate-500">
              Tap buttons below to log
            </span>
          </div>
          {lastEvents.length === 0 ? (
            <p className="text-[0.75rem] text-slate-500">
              No events yet. Shock / Adrenaline / Amiodarone / Other
              will appear here.
            </p>
          ) : (
            <ul className="space-y-1">
              {lastEvents.map((log) => (
                <li
                  key={log.id}
                  className="flex items-baseline justify-between gap-2 text-[0.75rem]"
                >
                  <span className="font-mono text-emerald-300">
                    {log.timeSinceStart}
                  </span>
                  <span className="flex-1 text-slate-100">
                    {log.message}
                  </span>
                  <span className="text-[0.65rem] text-slate-500">
                    {log.absoluteTime}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Event buttons */}
        <section className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShock}
              className="h-12 rounded-2xl bg-emerald-500 text-sm font-semibold text-slate-950 shadow-md active:translate-y-[1px]"
            >
              Shock
            </button>
            <button
              type="button"
              onClick={handleAdrenaline}
              className="h-12 rounded-2xl border border-emerald-500/80 bg-slate-900 text-sm font-semibold text-emerald-300 shadow-md active:translate-y-[1px]"
            >
              Adrenaline
            </button>
            <button
              type="button"
              onClick={handleAmiodarone}
              className="h-12 rounded-2xl border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-100 shadow-md active:translate-y-[1px]"
            >
              Amiodarone
            </button>
            <button
              type="button"
              onClick={() => setOtherDialogOpen(true)}
              className="h-12 rounded-2xl border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-100 shadow-md active:translate-y-[1px]"
            >
              Other…
            </button>
          </div>
        </section>

        {/* Start / Pause / Reset controls */}
        <section className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={handleStartPause}
            className="flex-1 h-14 rounded-2xl bg-emerald-500 text-base font-semibold text-slate-950 shadow-lg active:translate-y-[1px]"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="h-14 min-w-[5.5rem] rounded-2xl border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-100 shadow-md active:translate-y-[1px]"
          >
            Reset
          </button>
        </section>

        {/* Full log + summary */}
        <section className="mt-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Full log
              </span>
              <span className="text-[0.7rem] text-slate-500">
                Copy to PRF / ePCR with one tap
              </span>
            </div>
            <CopySummaryButton summaryText={summaryText} />
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-slate-950/40 p-2 text-[0.75rem]">
            {logs.length === 0 ? (
              <p className="text-slate-500">No events recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-baseline gap-2 border-b border-slate-800/60 pb-1 last:border-b-0"
                >
                  <span className="font-mono text-emerald-300">
                    {log.timeSinceStart}
                  </span>
                  <span className="flex-1 text-slate-100">
                    {log.message}
                  </span>
                  <span className="text-[0.65rem] text-slate-500">
                    {log.absoluteTime}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Other… dialog */}
        {otherDialogOpen && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 px-4 pb-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-xl">
              <h2 className="mb-1 text-sm font-semibold">
                Log other event
              </h2>
              <p className="mb-2 text-[0.75rem] text-slate-400">
                Short description only (e.g. &ldquo;Airway
                secured&rdquo;, &ldquo;ROSC&rdquo;, &ldquo;Rhythm
                check&rdquo;).
              </p>
              <textarea
                rows={2}
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtherDialogOpen(false);
                    setOtherText("");
                  }}
                  className="h-9 rounded-xl border border-slate-700 px-3 text-sm text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOtherConfirm}
                  className="h-9 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
