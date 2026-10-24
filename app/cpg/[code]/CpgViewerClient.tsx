"use client";

import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { WifiOff } from "lucide-react";
import { CPG_ENTRIES, findCpgEntryBySlug, normalizeCpgSlug, type CpgEntry } from "@/lib/cpgIndex";
import { useOnline } from "@/lib/useOnline";

const CpgPdfViewer = dynamic(
  () => import("./CpgPdfViewer").then((mod) => mod.CpgPdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-inner dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Loading CPG viewer…
      </div>
    ),
  }
);

// The entry and page are read from the URL in the browser (?code=…&page=…&pdfPage=…,
// or a legacy /cpg/<slug> path), not on the server, so one cached page serves
// every lookup offline.
function resolveEntry(slug: string, code: string): CpgEntry | null {
  const candidates = [code, slug === "view" ? "" : slug].filter(Boolean);
  for (const candidate of candidates) {
    const found =
      findCpgEntryBySlug(candidate) ||
      CPG_ENTRIES.find((item) => normalizeCpgSlug(item.code) === normalizeCpgSlug(candidate));
    if (found) return found;
  }
  return null;
}

export function CpgViewerClient() {
  const params = useParams<{ code?: string }>();
  const search = useSearchParams();
  const online = useOnline();
  const slug = typeof params?.code === "string" ? params.code : "";
  const code = search.get("code") ?? "";

  const resolved = resolveEntry(slug, code);
  const printedPage = Number(search.get("page")) || resolved?.printedPage || 1;
  const pdfPage = Number(search.get("pdfPage")) || undefined;
  const label = code || (slug === "view" ? "" : slug);
  const entry: CpgEntry = resolved ?? {
    code: label || "CPG",
    title: label || "Clinical Practice Guidelines",
    section: "CPG PDF",
    printedPage,
    keywords: [],
  };

  return (
    <>
      <div className="space-y-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-emerald-500">
          CPG viewer
        </p>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {entry.code === entry.title ? entry.title : `${entry.code} – ${entry.title}`}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Section: {entry.section} · Starting at printed page {printedPage}
        </p>
        {!online && (
          <p
            role="status"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-500 bg-slate-700 px-3 py-1 text-sm font-semibold text-slate-50"
          >
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            Offline — showing the saved CPG
          </p>
        )}
      </div>
      <CpgPdfViewer entry={entry} printedPage={printedPage} pdfPage={pdfPage} />
    </>
  );
}
