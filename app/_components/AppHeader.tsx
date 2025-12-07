"use client";

import Link from "next/link";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { Info } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-4 py-2.5 text-slate-900 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-xs font-semibold text-emerald-300">
          AP
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Ambulance Paramedic Toolkit
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Clinical tools
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/about"
          className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-800 hover:border-emerald-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-50 dark:hover:border-emerald-400 dark:hover:bg-slate-900"
        >
          <Info className="h-3 w-3" />
          About
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
