"use client";

import Link from "next/link";
import { ArrowLeft, GitBranch } from "lucide-react";
import { FlowGuide } from "./FlowGuide";

export default function ToxidromePage() {
  return (
    <div className="min-h-screen bg-slate-950 pb-28 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
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
            <h1 className="truncate text-sm font-bold text-white">Toxidrome Flow Guide</h1>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-500">
            <GitBranch className="h-4 w-4" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4">
        <FlowGuide />
      </main>
    </div>
  );
}
