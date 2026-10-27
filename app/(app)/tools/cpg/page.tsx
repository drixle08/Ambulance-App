import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";
import { CpgViewerClient } from "../../../cpg/[code]/CpgViewerClient";

// Thin server shell: the protocol + page come from the URL and are resolved in
// the browser (see CpgViewerClient), so this shell is identical for every
// lookup — and for the dashboard's CPG tool. This is what lets the service
// worker serve the CPG viewer offline and keeps a single viewer implementation.
export default function CpgPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-12 pt-6">
      <div className="flex flex-wrap items-start gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-slate-900/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <Link
          href="/tools/cpg-chat"
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors shrink-0"
        >
          <Bot className="h-3.5 w-3.5" />
          Ask AI
        </Link>
      </div>

      <Suspense fallback={null}>
        <CpgViewerClient />
      </Suspense>
    </div>
  );
}
