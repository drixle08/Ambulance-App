import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ShieldAlert,
  HeartPulse,
  Wind,
  Brain,
  BookOpen,
  Activity,
  FlaskConical,
} from "lucide-react";
import { ProtocolFinder } from "./ProtocolFinder";
import { TOOL_GROUPS } from "./data";
import { CpgChatBubble } from "@/app/_components/CpgChatBubble";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldAlert,
  HeartPulse,
  Wind,
  Brain,
  BookOpen,
  Activity,
  FlaskConical,
};

const COLOR_MAP: Record<string, { bg: string; icon: string; hover: string; ring: string }> = {
  orange: { bg: "bg-orange-500/10 dark:bg-orange-500/15", icon: "text-orange-600 dark:text-orange-300", hover: "hover:border-orange-400/60 dark:hover:border-orange-400/50", ring: "group-hover:ring-orange-400/30" },
  red: { bg: "bg-red-500/10 dark:bg-red-500/15", icon: "text-red-600 dark:text-red-300", hover: "hover:border-red-400/60 dark:hover:border-red-400/50", ring: "group-hover:ring-red-400/30" },
  sky: { bg: "bg-sky-500/10 dark:bg-sky-500/15", icon: "text-sky-600 dark:text-sky-300", hover: "hover:border-sky-400/60 dark:hover:border-sky-400/50", ring: "group-hover:ring-sky-400/30" },
  violet: { bg: "bg-violet-500/10 dark:bg-violet-500/15", icon: "text-violet-600 dark:text-violet-300", hover: "hover:border-violet-400/60 dark:hover:border-violet-400/50", ring: "group-hover:ring-violet-400/30" },
  amber: { bg: "bg-amber-500/10 dark:bg-amber-500/15", icon: "text-amber-600 dark:text-amber-300", hover: "hover:border-amber-400/60 dark:hover:border-amber-400/50", ring: "group-hover:ring-amber-400/30" },
  teal: { bg: "bg-teal-500/10 dark:bg-teal-500/15", icon: "text-teal-600 dark:text-teal-300", hover: "hover:border-teal-400/60 dark:hover:border-teal-400/50", ring: "group-hover:ring-teal-400/30" },
  rose: { bg: "bg-rose-500/10 dark:bg-rose-500/15", icon: "text-rose-600 dark:text-rose-300", hover: "hover:border-rose-400/60 dark:hover:border-rose-400/50", ring: "group-hover:ring-rose-400/30" },
};

export default function DashboardPage() {
  return (
    <>
      {/* Mobile sticky header — shown only when AppHeader is hidden */}
      <div className="flex md:hidden sticky top-0 z-20 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-xs font-bold text-emerald-400">AP</span>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-none">Ambulance Paramedic</p>
            <p className="text-[0.6rem] uppercase tracking-widest text-slate-500">Clinical Tools</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-4 pb-4">

        {/* Protocol Finder row — desktop only; mobile uses BottomNav Search tab */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          <Link href="/?allowLanding=1" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500">
            ← Back
          </Link>
          <div className="min-w-48 flex-1">
            <ProtocolFinder />
          </div>
        </div>

        <header className="space-y-0.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-emerald-500">Tools dashboard</p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Select a category</h1>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOOL_GROUPS.map((group) => {
            const Icon = ICON_MAP[group.icon] ?? BookOpen;
            const color = COLOR_MAP[group.color] ?? COLOR_MAP.amber;
            return (
              <Link
                key={group.slug}
                href={`/dashboard/${group.slug}`}
                className={`group flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 text-center shadow-sm transition-all active:scale-95 ${color.hover} hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80`}
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${color.bg} ring-4 ring-transparent transition-all ${color.ring}`}>
                  <Icon className={`h-8 w-8 ${color.icon}`} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50">{group.shortTitle ?? group.title}</h2>
                  <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {group.tools.length} {group.tools.length === 1 ? "tool" : "tools"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <CpgChatBubble />
    </>
  );
}
