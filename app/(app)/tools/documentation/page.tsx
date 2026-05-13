"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Clipboard,
  ClipboardCheck,
  Copy,
  FilePenLine,
} from "lucide-react";

type CharteSection = {
  id: string;
  letter: string;
  title: string;
  phase: string;
  helper: string;
  placeholder: string;
};

const SECTIONS: CharteSection[] = [
  {
    id: "chief-complaint",
    letter: "C",
    title: "Chief Complaint",
    phase: "Subjective",
    helper: "Document the patient's stated complaint and the reason EMS was requested.",
    placeholder: 'Example: Patient states, "I cannot breathe." EMS requested for worsening shortness of breath.',
  },
  {
    id: "history",
    letter: "H",
    title: "History",
    phase: "Subjective",
    helper: "Document the history of present illness or mechanism of injury, PMH, allergies, medications, and other pertinent data.",
    placeholder:
      "Example: Symptoms began at 08:30 after exertion. PMH asthma, uses salbutamol inhaler, NKDA. Family reports worsening over 2 hours.",
  },
  {
    id: "assessment",
    letter: "A",
    title: "Assessment",
    phase: "Objective",
    helper: "Document primary survey/general impression, primary assessment findings, then secondary assessment findings including SAMPLE and OPQRST.",
    placeholder:
      "Example: Patient was found sitting on bed, alert, oriented, and in respiratory distress. Primary assessment: airway patent, speaking short phrases, increased work of breathing, bilateral wheeze, SpO2 88% RA improved to 96% on O2. Secondary assessment: no trauma noted, SAMPLE and OPQRST completed. Working impression: acute asthma exacerbation.",
  },
  {
    id: "treatment",
    letter: "R",
    title: "Rx Treatment",
    phase: "Treatment",
    helper: "Document each intervention, medication, dose, route, time, indication, and patient response.",
    placeholder:
      "Example: 09:12 salbutamol/ipratropium nebulized for wheeze and hypoxia. Work of breathing improved and SpO2 increased to 96%.",
  },
  {
    id: "transport",
    letter: "T",
    title: "Transport/Outcome",
    phase: "Disposition",
    helper: "Document transport priority, destination, patient condition during transport, reassessments, and transfer of care.",
    placeholder:
      "Example: Transported priority 2 to ED due to persistent respiratory distress. Reassessed en route with no deterioration. Verbal handover given to triage RN.",
  },
];

type DraftMap = Record<string, string>;

function buildInitialDraft(): DraftMap {
  return Object.fromEntries(SECTIONS.map((section) => [section.id, ""])) as DraftMap;
}

function formatSection(section: CharteSection, value: string) {
  return `${section.title}: ${value.trim()}`;
}

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function DocumentationPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftMap>(() => buildInitialDraft());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const completedCount = SECTIONS.filter((section) => draft[section.id].trim()).length;

  const narrative = useMemo(
    () =>
      SECTIONS.filter((section) => draft[section.id].trim())
        .map((section) => formatSection(section, draft[section.id]))
        .join("\n\n"),
    [draft]
  );

  async function copyText(id: string, text: string) {
    const cleanText = text.trim();
    if (!cleanText) return;

    await writeClipboard(cleanText);
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1400);
  }

  function updateSection(id: string, value: string) {
    setDraft((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-8 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-blue-400">
              Documentation
            </p>
            <h1 className="truncate text-base font-bold leading-tight text-slate-100">
              CHART Documentation
            </h1>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
            <FilePenLine className="h-5 w-5" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4">
        <section className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-100">Structured narrative format</p>
              <p className="mt-1 text-xs leading-5 text-blue-100/80">
                Complete each CHART field, then copy individual sections into the patient record.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-3">
            <p className="text-xl font-bold text-slate-50">
              {completedCount}/{SECTIONS.length}
            </p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
              Sections written
            </p>
          </div>
          <button
            type="button"
            onClick={() => copyText("all", narrative)}
            disabled={!narrative}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-3 text-sm font-bold text-blue-200 transition-colors hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copiedId === "all" ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copiedId === "all" ? "Copied note" : "Copy full note"}
          </button>
        </section>

        <section className="flex flex-col gap-3">
          {SECTIONS.map((section) => {
            const value = draft[section.id];
            const hasText = value.trim().length > 0;
            const copied = copiedId === section.id;

            return (
              <article
                key={section.id}
                className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-sm"
              >
                <div className="flex items-start gap-3 border-b border-slate-800 bg-slate-900 px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/15 text-xl font-black text-blue-200">
                    {section.letter}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-slate-50">{section.title}</h2>
                    <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-blue-300">
                      {section.phase}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-400">{section.helper}</p>
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  <textarea
                    value={value}
                    onChange={(event) => updateSection(section.id, event.target.value)}
                    placeholder={section.placeholder}
                    rows={4}
                    className="min-h-28 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => copyText(section.id, formatSection(section, value))}
                    disabled={!hasText}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : `Copy ${section.title}`}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
            <div>
              <p className="text-sm font-bold text-red-100">Documentation pitfall</p>
              <p className="mt-1 text-xs leading-5 text-red-100/80">
                Avoid writing a story without timestamps, vital sign trends, or treatment response.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-100">Full note preview</h2>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
              CHART
            </span>
          </div>
          <pre className="min-h-32 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-5 text-slate-300">
            {narrative || "Completed sections will appear here."}
          </pre>
        </section>
      </main>
    </div>
  );
}
