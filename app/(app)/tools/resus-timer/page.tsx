"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import { UndoToast } from "@/app/_components/UndoToast";
import { useWakeLock } from "@/lib/useWakeLock";
import {
  HeartPulse,
  ActivitySquare,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from "lucide-react";
import { formatSeconds } from "./timeUtils";
import {
  ADRENALINE_INTERVAL,
  advance,
  clearResusCase,
  cycleAt,
  isStaleCase,
  pause,
  startNewResusCase,
  startOrResume,
  updateResusCase,
  useResusCase,
  withLog,
  type Cue,
  type LogEntry,
  type ResusCase,
} from "./resusStore";

// Minimal SpeechRecognition typings to avoid TS errors when not available.
type SpeechRecognitionEventLike = {
  results: Array<{
    0: { transcript: string };
  }>;
};
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const DEFAULT_BPM = 110;
const RESET_CONFIRM_MS = 8000; // confirm prompt closes itself if not acted on

// Voice phrases are matched as whole words, so "start" no longer fires on
// "restart" and "go" no longer fires on "ago". Reset needs the explicit
// phrase "reset timer" and then only opens the on-screen confirmation —
// clearing the log always takes a tap. (Bare "reset", "restart" and "again"
// used to clear the whole log immediately.)
const START_PHRASES = ["start timer", "start", "timer", "go", "begin", "two minute", "2 minute"];
const STOP_PHRASES = ["stop timer", "stop", "pause timer", "pause", "hold", "halt"];
const RESET_PHRASES = ["reset timer"];

function hasPhrase(transcript: string, phrases: string[]): boolean {
  const words = ` ${transcript.replace(/[^a-z0-9]+/g, " ").trim()} `;
  return phrases.some((phrase) => words.includes(` ${phrase} `));
}

function formatIdle(ms: number): string {
  const totalMin = Math.max(1, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}

// Gap entries summarise time the screen was away. They are drawn (and copied)
// differently so nobody documents them as recorded cycles or interventions.
function GapLogRow({ log }: { log: LogEntry }) {
  return (
    <li className="my-1 list-none space-y-1 rounded-lg border border-dashed border-slate-500 px-2 py-1.5 text-[0.75rem]">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-50">
          Gap · not recorded
        </span>
        <span className="text-[0.65rem] text-slate-400">noted {log.absoluteTime}</span>
      </div>
      <p className="italic text-slate-300">{log.message}</p>
    </li>
  );
}

function vibrate(pattern: VibratePattern = 35) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}

export default function ResuscitationTimerPage() {
  const resus = useResusCase();
  const isRunning = resus.runningSince !== null;
  const elapsedSeconds = resus.processedElapsed;
  const { cycleNumber, phase, secondsRemaining } = cycleAt(elapsedSeconds);
  const lastAdrenalineAt = resus.lastAdrenalineAt;
  const amiodaroneDose = resus.amiodaroneDose;
  const logs = resus.logs;

  const [metronomeOn, setMetronomeOn] = useState(true);
  const [otherDialogOpen, setOtherDialogOpen] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<{ previous: ResusCase; kind: "reset" | "newCase" } | null>(null);
  // Time of the last stale-case check (set after mount, on return to the
  // screen, and every minute) — null until the client has read the store.
  const [staleCheckAt, setStaleCheckAt] = useState<number | null>(null);
  const showNewCasePrompt = staleCheckAt !== null && isStaleCase(resus, staleCheckAt);
  const newCasePromptRef = useRef(false);
  const voiceSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    const SpeechRec: SpeechRecognitionConstructor | undefined =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    return Boolean(SpeechRec);
  }, []);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("voiceEnabled") === "true";
    } catch {
      return false;
    }
  });
  const [voiceListening, setVoiceListening] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const isRunningRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldRestartRecognition = useRef(false);
  const lastVoiceCommandAtRef = useRef(0);

  // Keep the screen on for the whole case — paused included: a rhythm or pulse
  // check is exactly when nobody is touching the phone.
  useWakeLock(resus.startedAt !== null);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    newCasePromptRef.current = showNewCasePrompt;
  }, [showNewCasePrompt]);

  // Re-check whether the open case has gone stale whenever the screen is shown.
  useEffect(() => {
    const check = () => {
      if (document.visibilityState === "visible") setStaleCheckAt(Date.now());
    };
    const first = window.setTimeout(check, 0);
    const id = window.setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  // Persist voice preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("voiceEnabled", voiceEnabled ? "true" : "false");
    } catch {
      // ignore storage errors
    }
  }, [voiceEnabled]);

  // The reset confirmation closes itself so a stray tap later can't clear the log.
  useEffect(() => {
    if (!resetConfirmOpen) return;
    const id = window.setTimeout(() => setResetConfirmOpen(false), RESET_CONFIRM_MS);
    return () => window.clearTimeout(id);
  }, [resetConfirmOpen]);

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

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Prompts raised by the clock (only live ones — not those caught up after
  // the screen was away).
  const playCues = useCallback(
    (cues: Cue[]) => {
      for (const cue of cues) {
        switch (cue.kind) {
          case "cprEndingSoon":
            vibrate([60, 40, 60]);
            speak("5 seconds. Prepare for rhythm check.");
            break;
          case "cycleEnd":
            vibrate([120, 60, 120]);
            break;
          case "cycleStart":
            vibrate(90);
            break;
          case "adrenalineSoon":
            vibrate([80, 50, 80]);
            speak("Adrenaline due in 30 seconds");
            break;
          case "adrenalineDue":
            vibrate([180, 80, 180, 80, 180]);
            speak("Adrenaline due now");
            break;
        }
      }
    },
    [speak]
  );

  const addLog = useCallback(
    (message: string) => {
      playCues(updateResusCase((c, now) => withLog(c, now, message)));
    },
    [playCues]
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

  // Main CPR clock. Time is derived from timestamps in the store, so this only
  // needs to wake often enough to show each second; on return from another
  // screen the first tick catches up and logs any cycles that elapsed meanwhile.
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => playCues(updateResusCase());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isRunning, playCues]);

  // Metronome (100-120 bpm, fixed at DEFAULT_BPM) — silent during rhythm-check pause
  useEffect(() => {
    if (!isRunning || !metronomeOn || phase !== "CPR") return;

    const intervalMs = Math.round(60000 / DEFAULT_BPM);

    const id = window.setInterval(() => {
      playClick();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [isRunning, metronomeOn, phase, playClick]);

  const handleStartPause = useCallback(() => {
    vibrate(25);
    playCues(
      updateResusCase((c, now) =>
        c.runningSince !== null ? pause(c, now) : startOrResume(c, now)
      )
    );
  }, [playCues]);

  const confirmReset = () => {
    vibrate([35, 35, 35]);
    const snapshot = clearResusCase();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setResetConfirmOpen(false);
    setUndoSnapshot({ previous: snapshot, kind: "reset" });
  };

  // Stale-case prompt: the default is a fresh case, because a new arrest
  // merged into an old patient's log is worse than losing the old log.
  const startNewCase = () => {
    vibrate(25);
    const previous = startNewResusCase();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setResetConfirmOpen(false);
    setUndoSnapshot({ previous, kind: "newCase" });
  };

  const keepPreviousCase = () => {
    vibrate(25);
    const idleMs = (staleCheckAt ?? resus.lastActionAt) - resus.lastActionAt;
    updateResusCase((c, now) =>
      withLog(c, now, `No activity for ${formatIdle(idleMs)} — case reopened`, "gap")
    );
  };

  const undoReset = useCallback(() => {
    const snapshot = undoSnapshot;
    if (!snapshot) return;
    vibrate(35);
    // Restore the case as it was; a running clock kept running in real time,
    // so catch it up (logging any cycles that passed) before noting the undo.
    updateResusCase((_c, now) => {
      const restored = advance(snapshot.previous, now).next;
      return snapshot.kind === "reset"
        ? withLog(restored, now, "Reset undone")
        : withLog(restored, now, "New case undone — previous case restored", "gap");
    });
    setUndoSnapshot(null);
  }, [undoSnapshot]);

  // Undoing a new case is only offered until the new case records an event;
  // after that, restoring the old case would mix two patients.
  const showUndo = undoSnapshot !== null && (undoSnapshot.kind === "reset" || logs.length <= 1);

  const dismissUndo = useCallback(() => setUndoSnapshot(null), []);

  const handleShock = () => {
    vibrate([90, 45, 90]);
    addLog("Shock delivered");
  };

  const handleAdrenaline = useCallback(() => {
    vibrate([80, 40, 80]);
    playCues(
      updateResusCase((c, now) =>
        withLog({ ...c, lastAdrenalineAt: c.processedElapsed }, now, "Adrenaline 1mg IV given")
      )
    );
    speak("Adrenaline given. Next dose in 4 minutes.");
  }, [playCues, speak]);

  const handleAmiodarone = useCallback(() => {
    vibrate(60);
    let spoken = "";
    const cues = updateResusCase((c, now) => {
      if (c.amiodaroneDose >= 2) {
        spoken = "Maximum amiodarone doses already given.";
        return withLog(c, now, "Amiodarone — max doses already given");
      }
      const next = (c.amiodaroneDose + 1) as 1 | 2;
      if (next === 1) {
        spoken = "Amiodarone 300 milligrams given. Next dose: 150 milligrams after the fifth shock.";
        return withLog({ ...c, amiodaroneDose: next }, now, "Amiodarone 300mg IV given (1st dose — after 3rd shock)");
      }
      spoken = "Amiodarone 150 milligrams given. Maximum doses reached.";
      return withLog({ ...c, amiodaroneDose: next }, now, "Amiodarone 150mg IV given (2nd dose — after 5th shock)");
    });
    playCues(cues);
    speak(spoken);
  }, [playCues, speak]);

  const handleOtherConfirm = () => {
    const trimmed = otherText.trim();
    if (trimmed) {
      vibrate(35);
      addLog(trimmed);
    }
    setOtherText("");
    setOtherDialogOpen(false);
  };

  const mainTimer = formatSeconds(secondsRemaining);
  const elapsedFormatted = formatSeconds(elapsedSeconds);

  const lastEvents = useMemo(() => logs.slice(-3).reverse(), [logs]);

  const startTimeString = resus.startedAt !== null
    ? new Date(resus.startedAt).toLocaleTimeString()
    : "Not started";

  const summaryText = useMemo(() => {
    const headerLines = [
      "Resuscitation summary",
      `Start time: ${startTimeString}`,
      `Total cycles: ${resus.startedAt !== null ? cycleNumber : 0}${
        logs.some((l) => l.kind === "gap") ? " (by clock — includes time the screen was away; see gap notes)" : ""
      }`,
      "",
    ];

    const eventLines =
      logs.length === 0
        ? ["No events recorded."]
        : logs.map((log) =>
            log.kind === "gap"
              ? `—— NOT A RECORDED EVENT: ${log.message} (noted ${log.absoluteTime}) ——`
              : `${log.timeSinceStart}  ${log.message} (${log.absoluteTime})`
          );

    return [...headerLines, ...eventLines].join("\n");
  }, [cycleNumber, logs, resus.startedAt, startTimeString]);

  // Voice control
  useEffect(() => {
    if (!voiceEnabled || !voiceSupported) return;
    if (typeof window === "undefined") return;

    const SpeechRec: SpeechRecognitionConstructor | undefined =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    shouldRestartRecognition.current = true;

    rec.onstart = () => setVoiceListening(true);
    rec.onend = () => {
      setVoiceListening(false);
      if (shouldRestartRecognition.current) {
        try {
          rec.start();
        } catch {
          // ignore restart errors
        }
      }
    };
    rec.onerror = () => {
      setVoiceListening(false);
    };
    rec.onresult = (event) => {
      const latestResult = event.results[event.results.length - 1];
      const transcript = (latestResult?.[0]?.transcript || "")
        .toLowerCase()
        .trim();

      if (!transcript) return;

      const now = Date.now();
      const recentCommand =
        now - lastVoiceCommandAtRef.current < 1200; // debounce rapid re-triggers
      if (recentCommand) return;

      // While the new-case prompt is open, voice must not resume the old case.
      if (newCasePromptRef.current) return;

      if (hasPhrase(transcript, RESET_PHRASES)) {
        // Never clears by voice: show the confirmation and let a tap decide.
        // (The spoken prompt must not contain a command word, or the mic could
        // hear the device itself.)
        setResetConfirmOpen(true);
        vibrate([35, 35, 35]);
        speak("Reset requested. Tap on screen to confirm.");
        lastVoiceCommandAtRef.current = now;
        return;
      }

      // Stop phrases are checked first so "stop timer" can't start a paused clock.
      if (hasPhrase(transcript, STOP_PHRASES)) {
        if (isRunningRef.current) {
          handleStartPause(); // pauses
          lastVoiceCommandAtRef.current = now;
        }
        return;
      }
      if (hasPhrase(transcript, START_PHRASES) && !isRunningRef.current) {
        handleStartPause();
        lastVoiceCommandAtRef.current = now;
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.warn("Voice recognition failed to start:", err);
      // We deliberately drop back to manual mode if the API errors on startup.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoiceEnabled(false);
      try {
        window.localStorage.setItem("voiceEnabled", "false");
      } catch {
        // ignore
      }
    }

    return () => {
      shouldRestartRecognition.current = false;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
      setVoiceListening(false);
    };
  }, [handleStartPause, speak, voiceEnabled, voiceSupported]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-6 pt-4">
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
              <h1 className="text-sm font-semibold">2-minute CPR timer</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMetronomeOn((on) => !on)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200"
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
            <button
              type="button"
              onClick={() => setVoiceEnabled((on) => !on)}
              disabled={!voiceSupported}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 disabled:opacity-50"
            >
              {voiceEnabled ? (
                <>
                  <Mic className="h-3.5 w-3.5" />
                  Voice on
                </>
              ) : (
                <>
                  <MicOff className="h-3.5 w-3.5" />
                  Voice off
                </>
              )}
            </button>
          </div>
        </header>
        {voiceEnabled && (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-[0.75rem] text-emerald-100">
            {voiceListening
              ? "Listening for: start / pause / “reset timer” (then tap to confirm)"
              : "Mic enabled; starting..."}
          </div>
        )}

        {/* Main timer area */}
        <section className="flex flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center gap-2">
            <div className={`w-full rounded-[2rem] border px-6 py-8 text-center shadow-lg transition-colors ${phase === "Pause" ? "border-amber-500/50 bg-amber-950/40" : "border-emerald-500/40 bg-slate-900/80"}`}>
              <div className={`mb-3 text-sm font-black uppercase tracking-[0.28em] ${phase === "Pause" ? "text-amber-400" : "text-emerald-400"}`}>
                {phase === "Pause"
                  ? `Cycle ${cycleNumber} complete — Rhythm Check`
                  : `Cycle ${cycleNumber} → CPR`}
              </div>
              <div className={`text-7xl font-black tabular-nums tracking-tight sm:text-8xl ${phase === "Pause" ? "text-amber-300" : "text-emerald-50"}`}>
                {mainTimer}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                <ActivitySquare className="h-4 w-4 text-emerald-400" />
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
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Recent events
            </span>
            <span className="text-[0.65rem] text-slate-500">
              Tap buttons below to log
            </span>
          </div>
          {lastEvents.length === 0 ? (
            <p className="text-[0.75rem] text-slate-500">
              No events yet. Shock / Adrenaline / Amiodarone / Other will appear
              here.
            </p>
          ) : (
            <ul className="space-y-1">
              {lastEvents.map((log) => log.kind === "gap" ? (
                <GapLogRow key={log.id} log={log} />
              ) : (
                <li
                  key={log.id}
                  className="flex items-baseline justify-between gap-2 text-[0.75rem]"
                >
                  <span className="font-mono text-emerald-300">
                    {log.timeSinceStart}
                  </span>
                  <span className="flex-1 text-slate-100">{log.message}</span>
                  <span className="text-[0.65rem] text-slate-500">
                    {log.absoluteTime}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Drug reminders */}
        {(lastAdrenalineAt !== null || amiodaroneDose > 0) && (() => {
          const adrSecs = lastAdrenalineAt !== null
            ? Math.max(0, ADRENALINE_INTERVAL - (elapsedSeconds - lastAdrenalineAt))
            : null;
          const adrOverdue = adrSecs === 0;
          const adrUrgent = adrSecs !== null && adrSecs <= 30 && !adrOverdue;

          return (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-4 space-y-3">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                Drug reminders
              </span>

              {/* Adrenaline countdown */}
              {adrSecs !== null && (
                <div className={`rounded-2xl border px-4 py-3 transition-colors ${adrOverdue ? "border-red-500/60 bg-red-500/15 animate-pulse" : adrUrgent ? "border-orange-400/60 bg-orange-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-base font-black ${adrOverdue ? "text-red-300" : adrUrgent ? "text-orange-300" : "text-amber-300"}`}>
                      Adrenaline 1mg IV
                    </span>
                    <span className={`font-mono text-base font-black ${adrOverdue ? "text-red-300" : adrUrgent ? "text-orange-300" : "text-amber-200"}`}>
                      {adrOverdue ? "DUE NOW" : formatSeconds(adrSecs)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[0.6rem] text-slate-500">Next dose · CPG: every 4 min</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${adrOverdue ? "bg-red-500" : adrUrgent ? "bg-orange-500" : "bg-amber-500"}`}
                      style={{ width: `${adrOverdue ? 100 : ((ADRENALINE_INTERVAL - adrSecs) / ADRENALINE_INTERVAL) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Amiodarone next dose reminder */}
              {amiodaroneDose === 1 && (
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-violet-300">Amiodarone 150mg IV</span>
                    <span className="text-[0.65rem] font-semibold text-violet-400">2nd dose</span>
                  </div>
                  <p className="mt-0.5 text-[0.6rem] text-slate-500">Due after the 5th shock (CPG 2.1)</p>
                </div>
              )}
              {amiodaroneDose >= 2 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2">
                  <span className="text-xs text-slate-400">Amiodarone — max doses given (450mg total)</span>
                </div>
              )}
            </section>
          );
        })()}

        {/* Event buttons */}
        <section className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleShock}
              className="h-20 rounded-3xl bg-red-600 text-xl font-black text-white shadow-lg active:translate-y-[1px]"
            >
              Shock
            </button>
            <button
              type="button"
              onClick={handleAdrenaline}
              className="h-20 rounded-3xl border border-emerald-500/80 bg-emerald-500 text-xl font-black text-slate-950 shadow-lg active:translate-y-[1px]"
            >
              Adrenaline
            </button>
            <button
              type="button"
              onClick={handleAmiodarone}
              className="h-16 rounded-2xl border border-slate-600 bg-slate-800 text-lg font-black text-slate-100 shadow-md active:translate-y-[1px]"
            >
              Amiodarone
            </button>
            <button
              type="button"
              onClick={() => setOtherDialogOpen(true)}
              className="h-16 rounded-2xl border border-slate-600 bg-slate-800 text-lg font-black text-slate-100 shadow-md active:translate-y-[1px]"
            >
              Other...
            </button>
          </div>
        </section>

        {/* Start / Pause / Reset controls */}
        <section className="mt-1 flex gap-3">
          <button
            type="button"
            onClick={handleStartPause}
            className="h-16 flex-1 rounded-3xl bg-emerald-500 text-lg font-black text-slate-950 shadow-lg active:translate-y-[1px]"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => setResetConfirmOpen((open) => !open)}
            aria-expanded={resetConfirmOpen}
            aria-controls="reset-confirm"
            className="h-16 min-w-28 rounded-3xl border border-slate-700 bg-slate-900 text-base font-black text-slate-100 shadow-md active:translate-y-[1px]"
          >
            {resetConfirmOpen ? "Cancel" : "Reset"}
          </button>
        </section>

        {/* Reset needs a second, deliberate tap; Undo is offered afterwards */}
        {resetConfirmOpen && (
          <section
            id="reset-confirm"
            role="alertdialog"
            aria-labelledby="reset-confirm-title"
            className="-mt-2 space-y-3 rounded-3xl border border-red-500/60 bg-red-500/10 p-4"
          >
            <p id="reset-confirm-title" className="text-base font-bold text-slate-50">
              Clear the timer and the full event log?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="h-14 flex-1 rounded-2xl border border-slate-600 bg-slate-900 text-base font-black text-slate-100"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="h-14 flex-1 rounded-2xl bg-red-600 text-base font-black text-white"
              >
                Clear timer &amp; log
              </button>
            </div>
          </section>
        )}

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
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-slate-950/40 p-2 text-[0.75rem]">
            {logs.length === 0 ? (
              <li className="list-none text-slate-500">No events recorded yet.</li>
            ) : (
              logs.map((log) => log.kind === "gap" ? (
                <GapLogRow key={log.id} log={log} />
              ) : (
                <li
                  key={log.id}
                  className="flex list-none items-baseline gap-2 border-b border-slate-800/60 pb-1 last:border-b-0"
                >
                  <span className="font-mono text-emerald-300">
                    {log.timeSinceStart}
                  </span>
                  <span className="flex-1 text-slate-100">{log.message}</span>
                  <span className="text-[0.65rem] text-slate-500">
                    {log.absoluteTime}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Other dialog */}
        {otherDialogOpen && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 px-4 pb-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-xl">
              <h2 className="mb-1 text-sm font-semibold">Log other event</h2>
              <p className="mb-2 text-[0.75rem] text-slate-400">
                Short description only (e.g. “Airway secured”, “ROSC”, “Rhythm
                check”).
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

      {/* Stale case: one tap starts a fresh case; keeping the old one is the deliberate choice */}
      {showNewCasePrompt && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="new-case-title"
          aria-describedby="new-case-desc"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-4 pb-6 sm:items-center"
        >
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-600 bg-slate-950 p-5 shadow-2xl">
            <div className="space-y-1">
              <h2 id="new-case-title" className="text-xl font-black text-slate-50">
                Start a new case?
              </h2>
              <p id="new-case-desc" className="text-base text-slate-300">
                A previous case is still open — started {startTimeString}, no activity for{" "}
                {formatIdle(staleCheckAt! - resus.lastActionAt)},{" "}
                {logs.filter((l) => !l.kind).length} events logged.
              </p>
            </div>
            <button
              type="button"
              autoFocus
              onClick={startNewCase}
              className="flex min-h-20 w-full flex-col items-center justify-center gap-0.5 rounded-3xl bg-emerald-500 px-4 py-3 text-slate-950 shadow-lg active:translate-y-[1px]"
            >
              <span className="text-xl font-black">Start new case</span>
              <span className="text-sm font-semibold">Clears the previous log and starts the timer</span>
            </button>
            <button
              type="button"
              onClick={keepPreviousCase}
              className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-2xl border border-slate-500 px-4 py-2 text-slate-100"
            >
              <span className="text-base font-bold">Keep previous case</span>
              <span className="text-sm text-slate-300">Continue it, or copy its log for the PCR</span>
            </button>
          </div>
        </div>
      )}

      {showUndo && undoSnapshot && (
        <UndoToast
          message={undoSnapshot.kind === "reset" ? "Timer and log cleared" : "New case started — previous log cleared"}
          onUndo={undoReset}
          onExpire={dismissUndo}
        />
      )}
    </div>
  );
}
