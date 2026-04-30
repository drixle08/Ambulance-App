"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  FlaskConical,
  RefreshCcw,
  ShieldAlert,
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
} from "@/lib/toxicology";

const CONFIDENCE_STYLES: Record<
  ToxicologyConfidence,
  {
    badge: string;
    ring: string;
    text: string;
    label: string;
  }
> = {
  strong: {
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    ring: "border-rose-500/40",
    text: "text-rose-300",
    label: "Strong fit",
  },
  moderate: {
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    ring: "border-amber-500/40",
    text: "text-amber-300",
    label: "Moderate fit",
  },
  possible: {
    badge: "border-sky-500/40 bg-sky-500/15 text-sky-200",
    ring: "border-sky-500/40",
    text: "text-sky-300",
    label: "Possible fit",
  },
};

function buildCpgHref(match: ToxicologyMatch) {
  const slug = normalizeCpgSlug(match.entry.code);
  return `/cpg/${encodeURIComponent(slug)}?code=${encodeURIComponent(match.entry.code)}&page=${match.entry.printedPage}&pdfPage=${match.entry.printedPage}`;
}

export default function ToxicologyPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const matches = useMemo(() => getToxicologyMatches(selectedIds), [selectedIds]);
  const topMatch = matches[0] ?? null;

  const summaryText = useMemo(() => {
    if (!selectedIds.length) {
      return "Toxicology finder: no findings selected.";
    }

    const selectedLabels = TOXICOLOGY_SYMPTOMS.filter((symptom) => selectedSet.has(symptom.id))
      .map((symptom) => symptom.label)
      .join(", ");

    const topSummary = matches
      .slice(0, 3)
      .map(
        (match) =>
          `${match.entry.code} ${match.entry.title} (${CONFIDENCE_STYLES[match.confidence].label.toLowerCase()})`
      )
      .join("; ");

    return `Toxicology findings: ${selectedLabels}. Top matches: ${topSummary || "none"}.`;
  }, [matches, selectedIds.length, selectedSet]);

  function toggleSymptom(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function resetAll() {
    setSelectedIds([]);
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard/toxicology"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 transition-colors hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 text-slate-300" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400">
              Toxicology and Toxinology
            </p>
            <h1 className="truncate text-base font-bold text-white">Toxidrome Finder</h1>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-200 transition-colors hover:border-rose-400 hover:text-rose-300"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <CopySummaryButton summaryText={summaryText} label="Copy" copiedLabel="Copied" className="px-2.5" />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pt-4">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 p-5 shadow-xl shadow-black/20">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-rose-300">
                  CPG 8.x
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                  {TOXICOLOGY_PROFILES.length} protocol patterns
                </span>
              </div>
              <h2 className="text-xl font-semibold text-white">Match findings to likely toxins, toxidromes, and the right CPG</h2>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
                Tap the findings you see. The tool scores the closest toxicology CPG patterns and then surfaces the linked protocol with its prehospital management focus.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-200">Clinical safety note</p>
              <p className="text-sm leading-relaxed text-amber-100/90">
                This is a pattern-matching aid, not a diagnosis engine. Mixed overdoses, co-ingestions, and non-toxicology mimics are common. Continue scene safety, ABC management, glucose checks, monitoring, and escalation based on the patient in front of you.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Selected findings</p>
            <p className="mt-2 text-3xl font-bold text-white">{selectedIds.length}</p>
            <p className="mt-1 text-xs text-slate-400">Build the pattern from scene clues and exam findings.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Top match</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {topMatch ? `${topMatch.entry.code} ${topMatch.entry.title}` : "No match yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {topMatch ? topMatch.profile.toxidrome : "Select findings to start narrowing the list."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Linked CPGs</p>
            <p className="mt-2 text-3xl font-bold text-white">{matches.length}</p>
            <p className="mt-1 text-xs text-slate-400">Results are filtered to patterns with a meaningful score.</p>
          </div>
        </section>

        <section className="space-y-4">
          {TOXICOLOGY_GROUP_ORDER.map((group) => {
            const symptoms = TOXICOLOGY_SYMPTOMS.filter((symptom) => symptom.group === group);
            return (
              <div key={group} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <h2 className="text-sm font-semibold text-white">{TOXICOLOGY_SYMPTOM_GROUP_LABELS[group]}</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {symptoms.map((symptom) => {
                    const active = selectedSet.has(symptom.id);
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => toggleSymptom(symptom.id)}
                        className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm transition-all active:scale-[0.99] ${
                          active
                            ? "border-rose-500/50 bg-rose-500/15 text-rose-100"
                            : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            active
                              ? "border-rose-400 bg-rose-400 text-slate-950"
                              : "border-slate-600 text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="leading-snug">{symptom.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Best-fit toxicology CPGs</p>
              <h2 className="text-lg font-semibold text-white">Results</h2>
            </div>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                Clear findings
              </button>
            )}
          </div>

          {!selectedIds.length && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
              Start by selecting scene clues or symptoms above. The strongest results usually come from a combination of exposure history and one or two hallmark toxidrome findings.
            </div>
          )}

          {selectedIds.length > 0 && matches.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">No clear toxicology pattern</p>
                  <p className="text-sm leading-relaxed text-slate-400">
                    The selected findings do not strongly fit one bundled CPG pattern. Recheck for mixed ingestions, incomplete assessment, or non-toxicology differentials such as sepsis, stroke, hypoglycaemia, or primary trauma.
                  </p>
                </div>
              </div>
            </div>
          )}

          {matches.map((match, index) => {
            const styles = CONFIDENCE_STYLES[match.confidence];
            const matchedCueLabels = [
              ...match.matchedHallmarks.map((item) => item.label),
              ...match.matchedExposure.map((item) => item.label),
              ...match.matchedSupporting.map((item) => item.label),
            ];

            return (
              <article
                key={match.profile.id}
                className={`rounded-3xl border bg-slate-900 p-5 shadow-lg shadow-black/10 ${
                  index === 0 ? styles.ring : "border-slate-800"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${styles.badge}`}>
                        {styles.label}
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                        {match.profile.toxidrome}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {match.entry.code} - {match.entry.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Printed page {match.entry.printedPage} - {match.profile.summary}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${styles.text}`}>Score {match.score}</span>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Matched cues</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {matchedCueLabels.join(", ")}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">CPG-based management</p>
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Route to protocol</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Open the linked CPG to view the full algorithm and dosing page in the in-app viewer.
                    </p>
                    {match.profile.caution && (
                      <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                        {match.profile.caution}
                      </div>
                    )}
                    <div className="mt-4">
                      <Link
                        href={buildCpgHref(match)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/25"
                      >
                        Open {match.entry.code}
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
