import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { TOOL_GROUPS } from "./data";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-4">
      {/* Back to landing */}
      <div className="flex items-center">
        <Link
          href="/?allowLanding=1"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-slate-900/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to landing
        </Link>
      </div>

      {/* Header / Intro */}
      <header className="space-y-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-emerald-500">
          Tools dashboard
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Clinical tools for ambulance crews
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Pick a category to see its tools. Optimized for quick mobile access
          during time-critical care.
        </p>
      </header>

      {/* Category tiles */}
      <div className="grid gap-3 md:grid-cols-2">
        {TOOL_GROUPS.map((group) => (
          <Link
            key={group.slug}
            href={`/dashboard/${group.slug}`}
            className={classNames(
              "group relative flex flex-col gap-2 rounded-3xl border px-4 py-3 shadow-sm transition-colors",
              "border-slate-200 bg-white/90 hover:border-emerald-500/80 hover:bg-white",
              "dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-500/70 dark:hover:bg-slate-900"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-500">
                  {group.slug.replace("-", " ")}
                </p>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  {group.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {group.description}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                {group.tools.length} tools
              </span>
            </div>
            <div className="flex items-center gap-2 text-[0.8rem] font-medium text-emerald-700 dark:text-emerald-300">
              <FolderOpen className="h-4 w-4" />
              View tools
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-emerald-500/0 transition-colors group-hover:border-emerald-500/50" />
          </Link>
        ))}
      </div>
    </div>
  );
}
