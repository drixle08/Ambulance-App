"use client";

import { useMemo, useState } from "react";
import { Pill, Search } from "lucide-react";
import {
  CPG_ENTRIES,
  normalizeCpgSlug,
  searchMedications,
  type CpgEntry,
  type MedicationEntry,
} from "@/lib/cpgIndex";
import { useDevice } from "@/app/_components/DeviceProvider";

const PDF_PATH = "/reference/cpg/cpg-v2.4-2025.pdf";
const PDF_PAGE_OFFSET = 0;

export function ProtocolFinder() {
  const { isMobile } = useDevice();
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const numericQuery = Number(query.trim());
  const isNumericQuery =
    query.trim().length > 0 &&
    Number.isFinite(numericQuery) &&
    numericQuery > 0 &&
    numericQuery < 1000;

  // Protocol results
  const protocolResults = useMemo((): CpgEntry[] => {
    if (!normalizedQuery) return [];
    return CPG_ENTRIES.filter((entry) => {
      const normalizedCode = entry.code.toLowerCase();
      const normalizedTitle = entry.title.toLowerCase();
      const normalizedKeywords = entry.keywords.map((k) => k.toLowerCase());
      return (
        normalizedCode.includes(normalizedQuery) ||
        normalizedTitle.includes(normalizedQuery) ||
        normalizedKeywords.some((k) => k.includes(normalizedQuery)) ||
        (isNumericQuery && entry.printedPage === Math.round(numericQuery))
      );
    }).slice(0, 6);
  }, [normalizedQuery, isNumericQuery, numericQuery]);

  // Medication / formulary results
  const medResults = useMemo((): MedicationEntry[] => {
    if (!normalizedQuery || isNumericQuery) return [];
    return searchMedications(normalizedQuery);
  }, [normalizedQuery, isNumericQuery]);

  const hasResults = protocolResults.length > 0 || medResults.length > 0 || isNumericQuery;

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const openPrintedPage = (printedPage: number) => {
    const clamped = Math.max(printedPage + PDF_PAGE_OFFSET, 1);
    if (isMobile) {
      window.location.assign(`/cpg/page?page=${clamped}&pdfPage=${clamped}`);
    } else {
      window.open(`${PDF_PATH}#page=${clamped}`, "_blank", "noopener,noreferrer");
    }
    setQuery("");
  };

  const openEntry = (entry: CpgEntry) => {
    const targetPdfPage = entry.printedPage + PDF_PAGE_OFFSET;
    if (isMobile) {
      const slug = normalizeCpgSlug(entry.code);
      window.location.assign(
        `/cpg/${encodeURIComponent(slug)}?code=${encodeURIComponent(entry.code)}&page=${entry.printedPage}&pdfPage=${targetPdfPage}`
      );
    } else {
      window.open(`${PDF_PATH}#page=${targetPdfPage}`, "_blank", "noopener,noreferrer");
    }
    setQuery("");
  };

  const openMedication = (med: MedicationEntry) => {
    const targetPdfPage = med.formularyPage + PDF_PAGE_OFFSET;
    if (isMobile) {
      // Re-use the CPG viewer with a formulary slug
      const slug = `formulary-${med.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
      window.location.assign(
        `/cpg/${encodeURIComponent(slug)}?code=Formulary&page=${med.formularyPage}&pdfPage=${targetPdfPage}`
      );
    } else {
      window.open(`${PDF_PATH}#page=${targetPdfPage}`, "_blank", "noopener,noreferrer");
    }
    setQuery("");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <Search className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
        <input
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (isNumericQuery) {
                openPrintedPage(Math.round(numericQuery));
                return;
              }
              if (protocolResults[0]) openEntry(protocolResults[0]);
              else if (medResults[0]) openMedication(medResults[0]);
            }
          }}
          placeholder="Search protocol or medication…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          aria-label="Search protocol or medication"
        />
      </div>

      {normalizedQuery && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {hasResults ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800/70 max-h-[70vh] overflow-y-auto">

              {/* Jump-to-page (numeric) */}
              {isNumericQuery && (
                <li>
                  <button
                    type="button"
                    onClick={() => openPrintedPage(Math.round(numericQuery))}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Open printed page {Math.round(numericQuery)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Jump directly to page {Math.round(numericQuery)} in the CPG PDF
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      PDF
                    </span>
                  </button>
                </li>
              )}

              {/* Protocol results */}
              {protocolResults.length > 0 && (
                <>
                  <li className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Protocols
                    </span>
                  </li>
                  {protocolResults.map((entry) => (
                    <li key={entry.code}>
                      <button
                        type="button"
                        onClick={() => openEntry(entry)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {entry.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {entry.section} · p.{entry.printedPage}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {entry.code}
                        </span>
                      </button>
                    </li>
                  ))}
                </>
              )}

              {/* Medication / formulary results */}
              {medResults.length > 0 && (
                <>
                  <li className="px-4 py-1.5 bg-violet-50 dark:bg-violet-500/10">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">
                      Medications — Formulary
                    </span>
                  </li>
                  {medResults.map((med) => (
                    <li key={med.name}>
                      <button
                        type="button"
                        onClick={() => openMedication(med)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-violet-50 dark:hover:bg-violet-500/10"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                          <Pill className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {med.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {med.class ? `${med.class} · ` : ""}Formulary p.{med.formularyPage}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                          Formulary
                        </span>
                      </button>
                    </li>
                  ))}
                </>
              )}

            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              No matching protocols or medications. Try another term.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
