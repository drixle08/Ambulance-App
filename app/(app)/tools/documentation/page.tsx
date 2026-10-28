"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ToolHeader } from "@/app/_components/ToolHeader";
import {
  AlertTriangle,
  ArrowLeft,
  Clipboard,
  ClipboardCheck,
  Copy,
  Download,
  FilePenLine,
  FolderOpen,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {
  SAVED_CHART_TTL_MS,
  clearDraft,
  deleteSavedChart,
  replaceDraft,
  saveChart,
  updateDraftSection,
  useChartDraft,
  useSavedCharts,
  type DraftMap,
} from "./chartStore";

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
    helper:
      "Start with what you found on arrival: scene/windshield survey, how and where the patient was found, and your general impression. Then the history of present illness or mechanism of injury, and relevant history from patient, family or bystanders.",
    placeholder: "Type the history here…",
  },
  {
    id: "assessment",
    letter: "A",
    title: "Assessment",
    phase: "Objective",
    helper:
      "Primary survey first (CPG 1.1). Medical: LOC-ABC — level of consciousness (AVPU), Airway, Breathing, Circulation. Trauma: CC-LOC-ABC — Catastrophic haemorrhage/C-spine control first, then LOC-ABC. Paediatrics: include the PAT (CPG 1.2). Then secondary survey: vital signs, SAMPLE, OPQRST, and a rapid trauma survey or head-to-toe exam as appropriate. Finish with your working impression.",
    placeholder: "Type the assessment here…",
  },
  {
    id: "treatment",
    letter: "R",
    title: "Rx Treatment/Management",
    phase: "Non-pharmacological",
    helper:
      "Document non-pharmacological management only — medications go in the separate medication section of the patient record. Include positioning, airway management, oxygen therapy, haemorrhage control, C-spine/splinting, wound care, cooling/warming and reassurance, with times.",
    placeholder: "Type the treatment/management here…",
  },
  {
    id: "transport",
    letter: "T",
    title: "Transport/Outcome",
    phase: "Disposition",
    helper:
      "Document transport priority, destination, patient condition during transport, reassessments, and transfer of care. Include a final set of vital signs before handover.",
    placeholder:
      "Example: Transported priority 2 to ED due to persistent respiratory distress. Reassessed en route with no deterioration. Verbal handover given to triage RN.",
  },
];

function formatSection(section: CharteSection, value: string) {
  return `${section.title}: ${value.trim()}`;
}

function buildNarrative(draft: DraftMap) {
  return SECTIONS.filter((section) => draft[section.id]?.trim())
    .map((section) => formatSection(section, draft[section.id]))
    .join("\n\n");
}

function chartTitle(draft: DraftMap) {
  const complaint = draft["chief-complaint"]?.trim().replace(/\s+/g, " ");
  if (!complaint) return "Untitled chart";
  return complaint.length > 60 ? `${complaint.slice(0, 60)}…` : complaint;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function downloadNote(draft: DraftMap, timestamp: number) {
  const date = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
  const text = `CHART Documentation\n${date.toLocaleString()}\n\n${buildNarrative(draft)}\n`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `chart-${stamp}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
  const draft = useChartDraft();
  const savedCharts = useSavedCharts();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const completedCount = SECTIONS.filter((section) => draft[section.id]?.trim()).length;
  const narrative = useMemo(() => buildNarrative(draft), [draft]);
  const hasContent = narrative.length > 0;

  function handleSave() {
    if (!hasContent) return;
    saveChart(draft, chartTitle(draft));
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1400);
  }

  function handleClear() {
    if (!hasContent) return;
    if (window.confirm("Clear all CHART fields? Saved charts are not affected.")) clearDraft();
  }

  function handleOpen(savedDraft: DraftMap) {
    if (hasContent && !window.confirm("Replace the chart you're writing with this saved one?")) return;
    replaceDraft(savedDraft);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete this saved chart?")) deleteSavedChart(id);
  }

  async function copyText(id: string, text: string) {
    const cleanText = text.trim();
    if (!cleanText) return;

    await writeClipboard(cleanText);
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1400);
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-8 text-slate-100">
      <ToolHeader
        title="CHART Documentation"
        showBack
        rightContent={
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
            <FilePenLine className="h-5 w-5" />
          </div>
        }
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4">
        <section className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-100">Structured narrative format</p>
              <p className="mt-1 text-xs leading-5 text-blue-100/80">
                Complete each CHART field, then copy individual sections into the patient record. Your draft is kept
                if you leave this page, until you close the app or clear it.
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

        <section className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasContent}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-2.5 text-xs font-bold text-emerald-200 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {justSaved ? <ClipboardCheck className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {justSaved ? "Saved" : "Save chart"}
          </button>
          <button
            type="button"
            onClick={() => downloadNote(draft, Date.now())}
            disabled={!hasContent}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2.5 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasContent}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-2.5 text-xs font-bold text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Clear chart
          </button>
        </section>

        <section className="flex flex-col gap-3">
          {SECTIONS.map((section) => {
            const value = draft[section.id] ?? "";
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
                    onChange={(event) => updateDraftSection(section.id, event.target.value)}
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

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-100">Saved charts</h2>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
              {savedCharts.length} saved
            </span>
          </div>
          <p className="mb-3 text-xs leading-5 text-slate-500">
            Stored only on this device and deleted automatically after {SAVED_CHART_TTL_MS / 3_600_000} hours.
            They contain patient information — delete them once the record is complete.
          </p>
          {savedCharts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center text-xs text-slate-500">
              No saved charts yet. Use Save chart to keep a copy.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {savedCharts.map((chart) => (
                <li
                  key={chart.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">{chart.title}</p>
                    <p className="text-[0.65rem] text-slate-500">{formatTime(chart.savedAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpen(chart.draft)}
                    className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-50"
                    aria-label={`Open chart: ${chart.title}`}
                  >
                    <FolderOpen className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadNote(chart.draft, chart.savedAt)}
                    className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-50"
                    aria-label={`Download chart: ${chart.title}`}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(chart.id)}
                    className="rounded-lg p-2 text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                    aria-label={`Delete chart: ${chart.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
