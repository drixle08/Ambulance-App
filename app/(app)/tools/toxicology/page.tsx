"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Flame,
  FlaskConical,
  Pill,
  RefreshCcw,
  ShieldAlert,
  Wind,
} from "lucide-react";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import { normalizeCpgSlug } from "@/lib/cpgIndex";
import {
  TOXICOLOGY_GROUP_ORDER,
  TOXICOLOGY_PROFILES,
  TOXICOLOGY_SYMPTOM_GROUP_LABELS,
  TOXICOLOGY_SYMPTOMS,
  getToxicologyMatches,
  type ToxicologyConfidence,
  type ToxicologyMatch,
  type ToxicologySymptomGroup,
} from "@/lib/toxicology";

const CONFIDENCE_STYLES: Record<
  ToxicologyConfidence,
  { badge: string; ring: string; text: string; label: string; sticky: string }
> = {
  strong: {
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    ring: "border-rose-500/40",
    text: "text-rose-300",
    label: "Strong fit",
    sticky: "border-rose-500/40 bg-rose-950/95 backdrop-blur-sm",
  },
  moderate: {
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    ring: "border-amber-500/40",
    text: "text-amber-300",
    label: "Moderate fit",
    sticky: "border-amber-500/40 bg-amber-950/95 backdrop-blur-sm",
  },
  possible: {
    badge: "border-sky-500/40 bg-sky-500/15 text-sky-200",
    ring: "border-sky-500/40",
    text: "text-sky-300",
    label: "Possible fit",
    sticky: "border-sky-500/40 bg-sky-950/95 backdrop-blur-sm",
  },
};

type ExposureColor = "orange" | "neutral" | "emerald" | "violet" | "rose";

const EXPOSURE_COLOR_STYLES: Record<ExposureColor, { active: string; inactive: string; iconActive: string; iconInactive: string }> = {
  orange: {
    active: "border-orange-500/50 bg-orange-500/15 text-orange-100",
    inactive: "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-orange-500/30 hover:text-orange-200",
    iconActive: "text-orange-300",
    iconInactive: "text-orange-500/60",
  },
  neutral: {
    active: "border-slate-400/50 bg-slate-700/30 text-slate-100",
    inactive: "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500",
    iconActive: "text-slate-300",
    iconInactive: "text-slate-500",
  },
  emerald: {
    active: "border-emerald-500/50 bg-emerald-500/15 text-emerald-100",
    inactive: "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-500/30 hover:text-emerald-200",
    iconActive: "text-emerald-300",
    iconInactive: "text-emerald-600/70",
  },
  violet: {
    active: "border-violet-500/50 bg-violet-500/15 text-violet-100",
    inactive: "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-violet-500/30 hover:text-violet-200",
    iconActive: "text-violet-300",
    iconInactive: "text-violet-500/60",
  },
  rose: {
    active: "border-rose-500/50 bg-rose-500/15 text-rose-100",
    inactive: "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-rose-500/30 hover:text-rose-200",
    iconActive: "text-rose-300",
    iconInactive: "text-rose-500/60",
  },
};

const EXPOSURE_CLUE_DEFS: { id: string; Icon: React.ElementType; color: ExposureColor }[] = [
  { id: "smoke_or_enclosed_fire", Icon: Flame, color: "orange" },
  { id: "generator_or_exhaust", Icon: Wind, color: "neutral" },
  { id: "pesticide_or_chemical", Icon: FlaskConical, color: "emerald" },
  { id: "pill_bottle_or_medication", Icon: Pill, color: "violet" },
  { id: "bite_or_sting", Icon: Bug, color: "rose" },
];

const EXPOSURE_CLUE_IDS = new Set(EXPOSURE_CLUE_DEFS.map((e) => e.id));
const CLINICAL_GROUPS = TOXICOLOGY_GROUP_ORDER.filter((g) => g !== "scene");

function buildCpgHref(match: ToxicologyMatch) {
  const slug = normalizeCpgSlug(match.entry.code);
  return `/cpg/${encodeURIComponent(slug)}?code=${encodeURIComponent(match.entry.code)}&page=${match.entry.printedPage}&pdfPage=${match.entry.printedPage}`;
}

export default function ToxicologyPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<ToxicologySymptomGroup>>(
    new Set(TOXICOLOGY_GROUP_ORDER)
  );
  const [showAllResults, setShowAllResults] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const matches = useMemo(() => getToxicologyMatches(selectedIds), [selectedIds]);
  const topMatch = matches[0] ?? null;

  const summaryText = useMemo(() => {
    if (!selectedIds.length) return "Toxicology finder: no findings selected.";
    const labels = TOXICOLOGY_SYMPTOMS.filter((s) => selectedSet.has(s.id))
      .map((s) => s.label)
      .join(", ");
    const top = matches
      .slice(0, 3)
      .map((m) => `${m.entry.code} ${m.entry.title} (${CONFIDENCE_STYLES[m.confidence].label.toLowerCase()})`)
      .join("; ");
    return `Toxicology findings: ${labels}. Top matches: ${top || "none"}.`;
  }, [matches, selectedIds.length, selectedSet]);

  function toggleSymptom(id: string) {
    setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function toggleGroup(group: ToxicologySymptomGroup) {
    setExpandedGroups((cur) => {
      const next = new Set(cur);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  function resetAll() {
    setSelectedIds([]);
    setShowAllResults(false);
  }

  const selectedExposureCount = EXPOSURE_CLUE_DEFS.filter((e) => selectedSet.has(e.id)).length;
  const selectedClinicalCount = selectedIds.filter((id) => !EXPOSURE_CLUE_IDS.has(id)).length;
  const displayedMatches = showAllResults ? matches : matches.slice(0, 1);

  return (
    <div className="min-h-screen bg-slate-950 pb-36 text-slate-100">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard/toxicology"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 transition-colors hover:border-slate-500"
          >
            <ArrowLeft className="h-4 w-4 text-slate-300" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400">
              Toxicology & Toxinology
            </p>
            <h1 className="truncate text-sm font-bold text-white">Toxidrome Finder</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="flex h-8 items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 text-[11px] font-medium text-slate-300 transition-colors hover:border-rose-400/50 hover:text-rose-300"
              >
                <RefreshCcw className="h-3 w-3" />
                Clear ({selectedIds.length})
              </button>
            )}
            <CopySummaryButton summaryText={summaryText} label="Copy" copiedLabel="Copied" className="px-2.5" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 pt-4">
        {/* ── Intro + safety note ── */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-rose-300">
                    CPG 8.x
                  </span>
                  <span className="text-[10px] text-slate-500">{TOXICOLOGY_PROFILES.length} toxidrome patterns</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Select scene clues then exam findings — the tool scores the closest CPG toxidrome pattern and links the protocol.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 sm:max-w-[260px]">
            <div className="flex gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-xs leading-relaxed text-amber-100/80">
                Pattern-matching aid only. Continue scene safety, ABCs, glucose, monitoring, and escalation based on the patient in front of you.
              </p>
            </div>
          </div>
        </div>

        {/* ── Step 1: Scene & Exposure clues ── */}
        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              1
            </span>
            <h2 className="text-sm font-semibold text-white">Scene &amp; exposure clues</h2>
            <span className="text-xs text-slate-500">— start here, highest diagnostic weight</span>
            {selectedExposureCount > 0 && (
              <span className="ml-auto rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 tabular-nums">
                {selectedExposureCount} selected
              </span>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EXPOSURE_CLUE_DEFS.map(({ id, Icon, color }) => {
              const symptom = TOXICOLOGY_SYMPTOMS.find((s) => s.id === id)!;
              const active = selectedSet.has(id);
              const c = EXPOSURE_COLOR_STYLES[color];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSymptom(id)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all active:scale-[0.99] ${active ? c.active : c.inactive}`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? c.iconActive : c.iconInactive}`} />
                  <span className="leading-snug">{symptom.label}</span>
                  {active && (
                    <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Step 2: Examination findings (collapsible groups) ── */}
        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-600 text-[10px] font-bold text-white">
              2
            </span>
            <h2 className="text-sm font-semibold text-white">Examination findings</h2>
            {selectedClinicalCount > 0 && (
              <span className="ml-auto rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 tabular-nums">
                {selectedClinicalCount} selected
              </span>
            )}
          </div>

          <div className="space-y-2">
            {CLINICAL_GROUPS.map((group) => {
              const symptoms = TOXICOLOGY_SYMPTOMS.filter((s) => s.group === group);
              const selectedInGroup = symptoms.filter((s) => selectedSet.has(s.id)).length;
              const isExpanded = expandedGroups.has(group);

              return (
                <div
                  key={group}
                  className={`overflow-hidden rounded-2xl border transition-colors ${
                    selectedInGroup > 0 ? "border-slate-700 bg-slate-900" : "border-slate-800 bg-slate-900/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="flex-1 text-sm font-semibold text-white">
                      {TOXICOLOGY_SYMPTOM_GROUP_LABELS[group]}
                    </span>
                    {selectedInGroup > 0 ? (
                      <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300 tabular-nums">
                        {selectedInGroup}/{symptoms.length}
                      </span>
                    ) : (
                      <span className="text-[11px] tabular-nums text-slate-600">{symptoms.length}</span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="grid grid-cols-2 gap-1.5 border-t border-slate-800 px-3 pb-3 pt-2.5 sm:grid-cols-3">
                      {symptoms.map((symptom) => {
                        const active = selectedSet.has(symptom.id);
                        return (
                          <button
                            key={symptom.id}
                            type="button"
                            onClick={() => toggleSymptom(symptom.id)}
                            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-xs transition-all active:scale-[0.98] ${
                              active
                                ? "border-rose-500/50 bg-rose-500/15 text-rose-100"
                                : "border-slate-700/70 bg-slate-950/60 text-slate-300 hover:border-slate-600 hover:text-slate-200"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                active
                                  ? "border-rose-400 bg-rose-400 text-slate-950"
                                  : "border-slate-600 text-transparent"
                              }`}
                            >
                              <Check className="h-2.5 w-2.5" />
                            </span>
                            <span className="leading-tight">{symptom.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Step 3: Results ── */}
        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                matches.length > 0 ? "bg-rose-500" : "bg-slate-600"
              }`}
            >
              3
            </span>
            <h2 className="text-sm font-semibold text-white">Best-fit CPGs</h2>
            {matches.length > 0 && (
              <span className="text-xs text-slate-400">
                {matches.length} match{matches.length !== 1 ? "es" : ""}
              </span>
            )}
          </div>

          {!selectedIds.length && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
              Start by selecting a scene clue or examination finding above. The strongest results usually come from an exposure clue combined with one or two hallmark findings.
            </div>
          )}

          {selectedIds.length > 0 && matches.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">No clear toxicology pattern</p>
                  <p className="text-sm leading-relaxed text-slate-400">
                    The selected findings do not strongly fit one bundled CPG pattern. Consider mixed ingestion, incomplete assessment, or non-toxicology differentials — sepsis, stroke, hypoglycaemia, or trauma.
                  </p>
                </div>
              </div>
            </div>
          )}

          {matches.length > 0 && (
            <div className="space-y-3">
              {displayedMatches.map((match, index) => {
                const styles = CONFIDENCE_STYLES[match.confidence];
                const isTop = index === 0;

                return (
                  <article
                    key={match.profile.id}
                    className={`rounded-3xl border bg-slate-900 p-5 shadow-lg shadow-black/10 ${isTop ? styles.ring : "border-slate-800"}`}
                  >
                    {/* Title row */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${styles.badge}`}
                          >
                            {styles.label}
                          </span>
                          <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                            {match.profile.toxidrome}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {match.entry.code} — {match.entry.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Page {match.entry.printedPage} · {match.profile.summary}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 text-sm font-bold tabular-nums ${styles.text}`}>
                        Score {match.score}
                      </span>
                    </div>

                    {/* Matched cues — color-coded by type */}
                    {(match.matchedHallmarks.length > 0 || match.matchedExposure.length > 0 || match.matchedSupporting.length > 0) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {match.matchedHallmarks.map((c) => (
                          <span
                            key={c.id}
                            className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-200"
                          >
                            {c.label}
                          </span>
                        ))}
                        {match.matchedExposure.map((c) => (
                          <span
                            key={c.id}
                            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200"
                          >
                            {c.label}
                          </span>
                        ))}
                        {match.matchedSupporting.map((c) => (
                          <span
                            key={c.id}
                            className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300"
                          >
                            {c.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Management + route */}
                    <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                          CPG-based management
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-200">
                          {match.profile.management.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                          Route to protocol
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          Open the linked CPG for the full algorithm and dosing page.
                        </p>
                        {match.profile.caution && (
                          <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
                            {match.profile.caution}
                          </div>
                        )}
                        <div className="mt-4">
                          <Link
                            href={buildCpgHref(match)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/25"
                          >
                            Open {match.entry.code}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Show / hide additional matches */}
              {matches.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowAllResults((v) => !v)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showAllResults ? "rotate-180" : ""}`}
                  />
                  {showAllResults
                    ? "Show fewer results"
                    : `Show ${matches.length - 1} more match${matches.length - 1 !== 1 ? "es" : ""}`}
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── Sticky bottom bar: top match ── */}
      {topMatch && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 md:bottom-0">
          <div
            className={`mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${CONFIDENCE_STYLES[topMatch.confidence].sticky}`}
          >
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                Top match
              </p>
              <p className="truncate text-sm font-bold text-white">
                {topMatch.entry.code} — {topMatch.entry.title}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${CONFIDENCE_STYLES[topMatch.confidence].badge}`}
              >
                {CONFIDENCE_STYLES[topMatch.confidence].label}
              </span>
              <Link
                href={buildCpgHref(topMatch)}
                className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
              >
                Open
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
