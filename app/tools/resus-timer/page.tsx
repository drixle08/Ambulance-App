"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const CYCLE_DURATION_SECONDS = 120; // 2-minute CPR cycles
const METRONOME_BPM = 110; // within 100–120 bpm

type Phase = "CPR" | "Pause";

type LogEntry = {
  id: string;
  timeSinceStart: string; // "T+06:32"
  absoluteTime: string; // "14:22:05"
  message: string; // "Shock delivered", "Adrenaline 1mg IV", etc.
};

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const ResuscitationTimer: React.FC = () => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    CYCLE_DURATION_SECONDS
  );
  const [cycleNumber, setCycleNumber] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [phase, setPhase] = useState<Phase>("CPR");

  const [totalElapsedSeconds, setTotalElapsedSeconds] =
    useState<number>(0); // total time since first start
  const elapsedSecondsRef = useRef<number>(0);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const timerIntervalRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const metronomeIntervalRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [otherDialogOpen, setOtherDialogOpen] = useState<boolean>(false);
  const [otherText, setOtherText] = useState<string>("");

  const [copyStatus, setCopyStatus] = useState<string>("");

  // Keep ref in sync with state for precise timestamps
  useEffect(() => {
    elapsedSecondsRef.current = totalElapsedSeconds;
  }, [totalElapsedSeconds]);

const ensureAudioContext = useCallback(() => {
  if (typeof window === "undefined") return null;

  // Narrow the window type so TypeScript knows about both properties
  const audioWindow = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };

  if (!audioCtxRef.current) {
    const Ctx = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
  }

  return audioCtxRef.current;
}, []);


  const playClick = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = 1000;

    gain.gain.value = 0.0;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.1);
  }, [ensureAudioContext]);

  const addLog = useCallback(
    (message: string, elapsedOverride?: number) => {
      const elapsedSeconds =
        typeof elapsedOverride === "number"
          ? elapsedOverride
          : elapsedSecondsRef.current;

      const timeSinceStart = `T+${formatSeconds(elapsedSeconds)}`;
      const absoluteTime = new Date().toLocaleTimeString();

      const entry: LogEntry = {
        id: createId(),
        timeSinceStart,
        absoluteTime,
        message,
      };

      setLogs((prev) => [...prev, entry]);
    },
    []
  );

  // Timer effect – handles 1-second countdown and elapsed tracking
  useEffect(() => {
    if (!isRunning) {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setSecondsRemaining((prevSeconds) => {
        if (prevSeconds <= 1) {
          // Cycle transition
          setCycleNumber((prevCycle) => {
            const nextCycle = prevCycle + 1;
            addLog(`Cycle ${nextCycle} started (CPR phase)`);
            return nextCycle;
          });
          return CYCLE_DURATION_SECONDS;
        }
        return prevSeconds - 1;
      });

      setTotalElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRunning, addLog]);

  // Metronome effect – plays clicks during CPR phase when running and not muted
  useEffect(() => {
    if (!isRunning || isMuted || phase !== "CPR") {
      if (metronomeIntervalRef.current !== null) {
        window.clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      return;
    }

    const intervalMs = Math.round((60_000 / METRONOME_BPM) || 600);

    if (metronomeIntervalRef.current !== null) {
      window.clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
    }

    metronomeIntervalRef.current = window.setInterval(() => {
      playClick();
    }, intervalMs);

    return () => {
      if (metronomeIntervalRef.current !== null) {
        window.clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
    };
  }, [isRunning, isMuted, phase, playClick]);

  const handleStartPause = useCallback(() => {
    setIsRunning((prevRunning) => {
      const nextRunning = !prevRunning;

      if (nextRunning) {
        // Starting or resuming
        if (!startTimeRef.current) {
          const now = new Date();
          startTimeRef.current = now;
          setStartTime(now);
          // First start: elapsed is 0
          setTotalElapsedSeconds(0);
          elapsedSecondsRef.current = 0;
          addLog(`Timer started (Cycle 1, CPR phase)`, 0);
          addLog(`Cycle 1 started (CPR phase)`, 0);
        } else {
          addLog(
            `Timer resumed (Cycle ${cycleNumber}, ${phase} phase)`,
            elapsedSecondsRef.current
          );
        }
        if (phase !== "CPR") {
          setPhase("CPR");
          addLog(`Phase changed to CPR`, elapsedSecondsRef.current);
        }
      } else {
        // Pausing
        addLog(
          `Timer paused (Cycle ${cycleNumber}, ${phase} phase)`,
          elapsedSecondsRef.current
        );
        if (phase !== "Pause") {
          setPhase("Pause");
          addLog(`Phase changed to Pause`, elapsedSecondsRef.current);
        }
      }

      return nextRunning;
    });
  }, [addLog, cycleNumber, phase]);

  const handleReset = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (metronomeIntervalRef.current !== null) {
      window.clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
    }

    setIsRunning(false);
    setSecondsRemaining(CYCLE_DURATION_SECONDS);
    setCycleNumber(1);
    setPhase("CPR");
    setTotalElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    setStartTime(null);
    startTimeRef.current = null;

    addLog("Timer reset");
  }, [addLog]);

  const logEventWithContext = useCallback(
    (label: string) => {
      const context = ` (Cycle ${cycleNumber}, ${phase} phase)`;
      addLog(`${label}${context}`);
    },
    [addLog, cycleNumber, phase]
  );

  const handleOtherSubmit = useCallback(() => {
    const trimmed = otherText.trim();
    if (trimmed.length > 0) {
      logEventWithContext(trimmed);
    }
    setOtherText("");
    setOtherDialogOpen(false);
  }, [logEventWithContext, otherText]);

  const displayTime = useMemo(
    () => formatSeconds(secondsRemaining),
    [secondsRemaining]
  );
  const elapsedDisplay = useMemo(
    () => formatSeconds(totalElapsedSeconds),
    [totalElapsedSeconds]
  );

  const summaryText = useMemo(() => {
    const lines: string[] = [];

    lines.push("Resuscitation summary");
    lines.push(
      `Start time: ${startTime ? startTime.toLocaleTimeString() : "-"}`
    );
    lines.push(`Total cycles: ${cycleNumber}`);
    lines.push("");

    logs.forEach((log) => {
      lines.push(
        `${log.timeSinceStart}  ${log.message} (${log.absoluteTime})`
      );
    });

    return lines.join("\n");
  }, [logs, cycleNumber, startTime]);

  const handleCopySummary = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus("Clipboard not available on this device");
      setTimeout(() => setCopyStatus(""), 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopyStatus("Summary copied");
    } catch {
      setCopyStatus("Copy failed");
    }
    setTimeout(() => setCopyStatus(""), 2000);
  }, [summaryText]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="px-4 pt-4 pb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-500">
            Resuscitation
          </p>
          <h1 className="text-lg font-semibold">Resuscitation cycle timer</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsMuted((v) => !v)}
          className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-emerald-300"
        >
          Sound: {isMuted ? "Off" : "On"}
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-between gap-4 px-4 pb-4">
        {/* Centered timer */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 px-6 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Cycle {cycleNumber}
              </p>
              <p className="mt-1 inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-400/70 dark:text-emerald-100">
                {phase === "CPR" ? "CPR phase" : "Pause / Rhythm check"}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-center">
              <div className="relative flex items-center justify-center rounded-full border border-slate-300 bg-slate-50/80 px-10 py-7 shadow-inner dark:border-slate-700 dark:bg-slate-950/80">
                <span className="text-5xl md:text-6xl font-mono tabular-nums">
                  {displayTime}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 text-center">
              Cycle {cycleNumber} · {phase === "CPR" ? "CPR phase" : "Pause phase"} ·
              {" "}
              Time since start: {elapsedDisplay}
            </p>
          </div>
        </div>

        {/* Event log buttons */}
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Log events
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => logEventWithContext("Shock delivered")}
                className="flex-1 min-w-[7rem] rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                Shock
              </button>
              <button
                type="button"
                onClick={() => logEventWithContext("Adrenaline given")}
                className="flex-1 min-w-[7rem] rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                Adrenaline
              </button>
              <button
                type="button"
                onClick={() => logEventWithContext("Amiodarone given")}
                className="flex-1 min-w-[7rem] rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                Amiodarone
              </button>
              <button
                type="button"
                onClick={() => setOtherDialogOpen(true)}
                className="flex-1 min-w-[7rem] rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                Other…
              </button>
            </div>
          </div>

          {/* Summary + log list */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Activity log
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[0.7rem] font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-emerald-300"
                >
                  Copy summary
                </button>
                {copyStatus && (
                  <span className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                    {copyStatus}
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-1.5 text-[0.75rem] text-slate-800 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100">
              {logs.length === 0 ? (
                <p className="italic text-slate-500 dark:text-slate-400">
                  No events logged yet. Start the timer and record shocks, drugs and
                  key events here.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {logs.map((log) => (
                    <li key={log.id}>
                      <span className="font-mono text-[0.7rem]">
                        {log.timeSinceStart}
                      </span>{" "}
                      <span className="text-slate-500 dark:text-slate-400">
                        ({log.absoluteTime})
                      </span>{" "}
                      <span>{log.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleStartPause}
              className={`flex-1 rounded-2xl px-6 py-3 text-base font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isRunning
                  ? "bg-rose-500 text-white hover:bg-rose-400"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-base font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Reset
            </button>
          </div>
        </div>
      </main>

      {/* Simple overlay dialog for "Other" event */}
      {otherDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-50">
              Log other event
            </p>
            <input
              type="text"
              autoFocus
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="e.g. Airway repositioned, ROSC, intubation"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOtherDialogOpen(false);
                  setOtherText("");
                }}
                className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOtherSubmit}
                className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Log event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResuscitationTimer;
