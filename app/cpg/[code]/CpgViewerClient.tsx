"use client";

import dynamic from "next/dynamic";
import type { CpgEntry } from "@/lib/cpgIndex";

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

type Props = {
  entry: CpgEntry;
  printedPage: number;
  pdfPage?: number;
};

export function CpgViewerClient({ entry, printedPage, pdfPage }: Props) {
  return (
    <CpgPdfViewer entry={entry} printedPage={printedPage} pdfPage={pdfPage} />
  );
}
