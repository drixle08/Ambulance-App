"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  CPG_ENTRIES,
  normalizeCpgSlug,
  type CpgEntry,
} from "@/lib/cpgIndex";
import { useDevice } from "@/app/_components/DeviceProvider";

// Path to the bundled PDF in /public. Adjust if the filename or location changes.
const PDF_PATH = "/reference/cpg/cpg-v2.4-2025.pdf";
// If the PDF's actual page numbering differs from the printed page numbers above,
// set this to (viewerPage - printedPage). Example: if printed page 58 shows as 61 in the viewer, set to 3.
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

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return CPG_ENTRIES.filter((entry) => {
      const normalizedCode = entry.code.toLowerCase();
      const normalizedTitle = entry.title.toLowerCase();
      const normalizedKeywords = entry.keywords.map((keyword) =>
        keyword.toLowerCase()
      );
      return (
        normalizedCode.includes(normalizedQuery) ||
        normalizedTitle.includes(normalizedQuery) ||
        normalizedKeywords.some((keyword) => keyword.includes(normalizedQuery)) ||
        (isNumericQuery && entry.printedPage === Math.round(numericQuery))
      );
    }).slice(0, 10);
  }, [normalizedQuery, isNumericQuery, numericQuery]);

  const openPrintedPage = (printedPage: number) => {
    const targetPdfPage = printedPage + PDF_PAGE_OFFSET;
    const clamped = targetPdfPage > 0 ? targetPdfPage : 1;
    const href = `${PDF_PATH}#page=${clamped}`;
    window.location.assign(href);
    setQuery("");
  };

  const openEntry = (entry: CpgEntry) => {
    const printedPage = entry.printedPage;
    const targetPdfPage = printedPage + PDF_PAGE_OFFSET;

    if (isMobile) {
      const slug = normalizeCpgSlug(entry.code);
      const href = `/cpg/${encodeURIComponent(
        slug
      )}?code=${encodeURIComponent(entry.code)}&page=${printedPage}&pdfPage=${targetPdfPage}`;
      window.location.assign(href);
    } else {
      const href = `${PDF_PATH}#page=${targetPdfPage}`;
      window.open(href, "_blank", "noopener,noreferrer");
    }

    setQuery("");
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <input
          type="search"
          inputMode="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (isNumericQuery) {
                openPrintedPage(Math.round(numericQuery));
                return;
              }
              if (results[0]) {
                openEntry(results[0]);
              }
            }
          }}
          placeholder="Search protocol or CPG section"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          aria-label="Search protocol or CPG section"
        />
      </div>

      {normalizedQuery && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {results.length > 0 || isNumericQuery ? (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {isNumericQuery ? (
                <li key={`page-${numericQuery}`}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-emerald-500/10"
                    onClick={() => openPrintedPage(Math.round(numericQuery))}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Open printed page {Math.round(numericQuery)}
                      </span>
                      <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                        PDF
                      </span>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate">
                        Jump directly to page {Math.round(numericQuery)} in the CPG PDF
                      </span>
                      <span className="shrink-0">
                        #page={Math.round(numericQuery + PDF_PAGE_OFFSET)}
                      </span>
                    </div>
                  </button>
                </li>
              ) : null}
              {results.map((entry) => (
                <li key={entry.code}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-emerald-500/10"
                    onClick={() => openEntry(entry)}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {entry.title}
                      </span>
                      <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                        {entry.code}
                      </span>
                    </div>
                    <div className="flex w-full items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate">{entry.section}</span>
                      <span className="shrink-0">Printed page {entry.printedPage}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              No matching protocols yet. Try another term.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
