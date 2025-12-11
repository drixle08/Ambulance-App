"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { CpgEntry } from "@/lib/cpgIndex";

// Path to the bundled PDF in /public. Adjust if the filename or location changes.
const PDF_PATH = "/reference/cpg/cpg-v2.4-2025.pdf";
// If the PDF's actual page numbering differs from the printed page numbers in the CPG index,
// set this to (viewerPage - printedPage). Example: if printed page 58 shows as 61 in the viewer, set to 3.
const PDF_PAGE_OFFSET = 0;

type Props = {
  entry: CpgEntry;
  printedPage: number;
};

export function CpgPdfViewer({ entry, printedPage }: Props) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetPdfPage = useMemo(() => {
    const target = printedPage + PDF_PAGE_OFFSET;
    return Number.isFinite(target) && target > 0 ? target : 1;
  }, [printedPage]);

  // Configure PDF.js worker
  useEffect(() => {
    GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }, []);

  // Load the PDF document
  useEffect(() => {
    let cancelled = false;
    const task = getDocument(PDF_PATH);
    task.promise
      .then((doc) => {
        if (cancelled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError("Unable to load CPG PDF");
        console.error(err);
      });

    return () => {
      cancelled = true;
      task.destroy();
    };
  }, []);

  // Sync target page from props once PDF is ready
  useEffect(() => {
    if (!pdf) return;
    const clamped = Math.min(Math.max(1, targetPdfPage), pdf.numPages);
    // Sync state to the target page after the document is ready.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageNumber(clamped);
  }, [pdf, targetPdfPage]);

  // Render the current page to canvas
  useEffect(() => {
    const render = async () => {
      if (!pdf || !canvasRef.current) return;
      const clampedPage = Math.min(
        Math.max(1, pageNumber),
        pdf.numPages || pageNumber
      );

      if (clampedPage !== pageNumber) {
        setPageNumber(clampedPage);
        return;
      }

      const page = await pdf.getPage(clampedPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const scale = 1.2;
      const outputScale = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * outputScale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / outputScale}px`;
      canvas.style.height = `${viewport.height / outputScale}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise;
    };

    render().catch((err) => {
      setError("Unable to render CPG page");
      console.error(err);
    });
  }, [pdf, pageNumber]);

  const goPrev = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    setPageNumber((prev) =>
      numPages ? Math.min(numPages, prev + 1) : prev + 1
    );
  };

  const pageLabel =
    numPages != null ? `Page ${pageNumber} of ${numPages}` : `Page ${pageNumber}`;
  const isLoading = !pdf && !error;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={isLoading || pageNumber <= 1}
          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev page
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={isLoading || (numPages != null && pageNumber >= numPages)}
          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
          Next page
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
          {pageLabel}
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-inner dark:border-slate-800 dark:bg-slate-900">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading CPG PDF…
          </div>
        )}
        <canvas ref={canvasRef} className="w-full max-w-full" />
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Viewing {entry.code} – {entry.title}. Starting at printed page {printedPage} (viewer page {targetPdfPage}). Adjust PDF_PAGE_OFFSET in CpgPdfViewer if the viewer and printed numbering differ.
      </p>
    </div>
  );
}
