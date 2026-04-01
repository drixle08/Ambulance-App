"use client";

import { useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ArrowLeft, Bot, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const CPG_PATH = "/reference/cpg/cpg-v2.4-2025.pdf";

export default function CpgPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = (() => {
    const p = Number(searchParams.get("page"));
    return Number.isFinite(p) && p > 0 ? p : 1;
  })();

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [error, setError] = useState<string | null>(null);
  const [jumpInput, setJumpInput] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const task = getDocument(CPG_PATH);
    task.promise
      .then((doc) => {
        if (cancelled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load CPG PDF. Please try again.");
      });
    return () => {
      cancelled = true;
      task.destroy();
    };
  }, []);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    renderTaskRef.current?.cancel();

    const render = async () => {
      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const outputScale = window.devicePixelRatio || 1;
      const containerWidth = Math.min(window.innerWidth * 0.95, 800);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth / baseViewport.width) * outputScale;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / outputScale}px`;
      canvas.style.height = `${viewport.height / outputScale}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    };

    render().catch((err) => {
      if (err?.name !== "RenderingCancelledException") {
        console.error(err);
        setError("Failed to render page.");
      }
    });
  }, [pdf, pageNumber]);

  const goPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goNext = () => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpInput, 10);
    if (Number.isFinite(n) && n > 0 && numPages && n <= numPages) {
      setPageNumber(n);
      setJumpInput("");
    }
  };

  const isLoading = !pdf && !error;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-8">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-400">
              Reference · CPG v2.4 (2025)
            </p>
            <h1 className="text-base font-bold leading-tight text-slate-100 truncate">
              Clinical Practice Guidelines
            </h1>
          </div>
          <Link
            href="/tools/cpg-chat"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors shrink-0"
          >
            <Bot className="w-3.5 h-3.5" />
            Ask AI
          </Link>
          {numPages && (
            <span className="text-xs font-mono text-slate-400 shrink-0">
              {pageNumber} / {numPages}
            </span>
          )}
        </div>

        {/* Navigation + jump bar */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={isLoading || pageNumber <= 1}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-40 hover:bg-slate-800 transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={isLoading || (numPages != null && pageNumber >= numPages)}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-40 hover:bg-slate-800 transition-colors active:scale-95"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>

          <form onSubmit={handleJump} className="flex items-center gap-1.5 ml-auto">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={numPages ?? undefined}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder="Go to page"
                className="w-20 bg-transparent text-xs text-slate-200 placeholder:text-slate-600 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors active:scale-95"
            >
              Go
            </button>
          </form>
        </div>
      </header>

      {/* PDF canvas */}
      <div className="max-w-3xl mx-auto px-2 pt-4">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mb-4">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading CPG PDF…</span>
          </div>
        )}

        <div className={["flex justify-center rounded-xl overflow-hidden bg-white", isLoading ? "hidden" : ""].join(" ")}>
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        {pdf && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={pageNumber <= 1}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-slate-200 disabled:opacity-40 hover:bg-slate-800 transition-colors active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-xs font-mono text-slate-500 shrink-0 px-2">
              {pageNumber} / {numPages}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={numPages != null && pageNumber >= numPages}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-slate-200 disabled:opacity-40 hover:bg-slate-800 transition-colors active:scale-95"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
