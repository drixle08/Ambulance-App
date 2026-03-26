import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ShieldAlert, HeartPulse, Wind, Brain, BookOpen,
  Shield, Flame, Timer, HeartOff, Eye, Baby, GitBranch,
  TrendingUp, Syringe, Stethoscope, ClipboardList, ClipboardCheck, Gauge,
  FileText, MessageCircle, Zap, Bot, Activity, FlaskConical,
  Link2, BadgeCheck, RefreshCcw, GraduationCap, Globe,
} from "lucide-react";
import { TOOL_GROUPS } from "../data";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldAlert, HeartPulse, Wind, Brain, BookOpen,
  Shield, Flame, Timer, HeartOff, Eye, Baby, GitBranch,
  TrendingUp, Syringe, Stethoscope, ClipboardList, ClipboardCheck, Gauge,
  FileText, MessageCircle, Zap, Bot, Activity, FlaskConical,
  Link2, BadgeCheck, RefreshCcw, GraduationCap, Globe,
};

const COLOR_MAP: Record<string, { bg: string; icon: string; hover: string }> = {
  orange: {
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    icon: "text-orange-600 dark:text-orange-300",
    hover: "hover:border-orange-400/50",
  },
  red: {
    bg: "bg-red-500/10 dark:bg-red-500/15",
    icon: "text-red-600 dark:text-red-300",
    hover: "hover:border-red-400/50",
  },
  sky: {
    bg: "bg-sky-500/10 dark:bg-sky-500/15",
    icon: "text-sky-600 dark:text-sky-300",
    hover: "hover:border-sky-400/50",
  },
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-500/15",
    icon: "text-violet-600 dark:text-violet-300",
    hover: "hover:border-violet-400/50",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    icon: "text-amber-600 dark:text-amber-300",
    hover: "hover:border-amber-400/50",
  },
  teal: {
    bg: "bg-teal-500/10 dark:bg-teal-500/15",
    icon: "text-teal-600 dark:text-teal-300",
    hover: "hover:border-teal-400/50",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    icon: "text-blue-600 dark:text-blue-300",
    hover: "hover:border-blue-400/50",
  },
};

type GroupPageProps = {
  params: Promise<{
    group: string;
  }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { group: groupSlug } = await params;
  const group = TOOL_GROUPS.find((g) => g.slug === groupSlug);

  if (!group) {
    notFound();
  }

  const color = COLOR_MAP[group.color] ?? COLOR_MAP.amber;
  const GroupIcon = ICON_MAP[group.icon] ?? BookOpen;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-4">
      {/* Back */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-slate-900/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All categories
        </Link>
      </div>

      {/* Header */}
      <header className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color.bg}`}>
          <GroupIcon className={`h-6 w-6 ${color.icon}`} />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-xl">
            {group.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{group.description}</p>
        </div>
      </header>

      {/* Tool cards */}
      <div className="flex flex-col gap-2">
        {group.tools.map((tool) => {
          const ToolIcon = ICON_MAP[tool.icon] ?? FileText;
          const isExternal = tool.href.startsWith("http");
          const cardClass = `group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm transition-all ${color.hover} hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-900`;

          const inner = (
            <>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color.bg}`}>
                <ToolIcon className={`h-5 w-5 ${color.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {tool.name}
                </p>
                {tool.meta && (
                  <span className="text-[0.68rem] font-medium text-slate-500 dark:text-slate-400">
                    {tool.meta}
                  </span>
                )}
              </div>
              {isExternal ? (
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              )}
            </>
          );

          return isExternal ? (
            <a key={tool.href} href={tool.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
              {inner}
            </a>
          ) : (
            <Link key={tool.href} href={tool.href} className={cardClass}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return TOOL_GROUPS.map((group) => ({
    group: group.slug,
  }));
}

export const dynamicParams = false;
export const dynamic = "force-static";
export const revalidate = 3600;
