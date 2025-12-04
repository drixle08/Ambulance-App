"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import {
  Menu,
  ActivitySquare,
  HeartPulse,
  Brain,
  Wind,
  Baby,
  Stethoscope,
} from "lucide-react";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
};

type ToolMeta = {
  name: string;
  href: string;
  description: string;
  category: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Start resuscitation timer",
    description: "2-min cycles with CPR metronome",
    href: "/tools/resus-timer",
    icon: HeartPulse,
  },
  {
    label: "Open Paediatric Arrest",
    description: "WAAFELSS doses & shocks",
    href: "/tools/peds-arrest",
    icon: Baby,
  },
  {
    label: "Open Stroke BEFAST",
    description: "Onset bands & transport priority",
    href: "/tools/stroke",
    icon: Brain,
  },
  {
    label: "Open Asthma Severity",
    description: "Adult + paeds thresholds",
    href: "/tools/asthma",
    icon: Wind,
  },
];

const TOOLS: ToolMeta[] = [
  {
    name: "Paediatric Arrest (WAAFELSS)",
    href: "/tools/peds-arrest",
    description: "Weight-based drugs, shocks and fluids for paediatric arrest.",
    category: "Paeds Resus",
  },
  {
    name: "Asthma Severity (Adult + Paeds)",
    href: "/tools/asthma",
    description: "Unified asthma severity assessment across age groups.",
    category: "Respiratory",
  },
  {
    name: "MWCS – Croup",
    href: "/tools/mwcs",
    description: "Modified Westley Croup Score with CPG-aligned bands.",
    category: "Paeds Respiratory",
  },
  {
    name: "Stroke BEFAST",
    href: "/tools/stroke",
    description: "Stroke screen with onset bands and transport hints.",
    category: "Neurological",
  },
  {
    name: "Emergency Resuscitation Timer",
    href: "/tools/resus-timer",
    description: "2-min CPR cycles with built-in metronome.",
    category: "Resuscitation",
  },
];

const KPI_CHIPS = [
  { label: "Tools available", value: "5" },
  { label: "Time-critical tools", value: "3" },
  { label: "Offline-capable PWA", value: "" },
  { label: "Aligned with CPG v2.4 (2025)", value: "" },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Top app bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex flex-col">
            <span className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-500">
              Ambulance • Toolkit
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Paramedic Tools
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-6 pt-4 md:pt-6">
        <section className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.8fr)_minmax(0,1.4fr)] md:items-start md:gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {/* Hero / greeting card */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <ActivitySquare className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-lg font-semibold md:text-xl">
                    Decision-support tools for ambulance crews.
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Built around HMCAS Clinical Practice Guideline v2.4 (2025) to
                    support time-critical decisions in the back of the truck.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 md:flex-row md:gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex w-full justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:w-auto md:flex-1"
                >
                  Open tools list
                </Link>
                <Link
                  href="/tools/resus-timer"
                  className="inline-flex w-full justify-center rounded-2xl border border-emerald-500/70 bg-transparent px-4 py-3 text-base font-semibold text-emerald-700 shadow-sm hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-400/70 dark:text-emerald-100 md:w-auto md:flex-1"
                >
                  Start resuscitation timer
                </Link>
              </div>
            </div>

            {/* KPI chips */}
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Status
              </h2>
              <div className="flex flex-wrap gap-2">
                {KPI_CHIPS.map((chip) => (
                  <span
                    key={chip.label}
                    className={classNames(
                      "inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[0.7rem] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
                      chip.label.includes("Time-critical")
                        ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/70 dark:text-emerald-100"
                        : ""
                    )}
                  >
                    {chip.value
                      ? `${chip.label}: ${chip.value}`
                      : chip.label}
                  </span>
                ))}
              </div>
            </section>

            {/* Tools grid / list */}
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Clinical tools
                </h2>
                <span className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                  Tap a card to open
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TOOLS.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group block rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-left shadow-sm transition-colors hover:border-emerald-500/80 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/70 dark:hover:bg-slate-900"
                  >
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {tool.category}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {tool.description}
                    </p>
                    <span className="mt-2 inline-block text-[0.7rem] font-medium text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100 dark:text-emerald-300">
                      Open tool →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: quick actions & about */}
          <div className="flex flex-col gap-4 md:sticky md:top-20">
            {/* Quick actions */}
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Quick actions
              </h2>
              <div className="flex flex-col gap-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-sm hover:border-emerald-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:border-emerald-500 dark:hover:bg-slate-900/80"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold">
                            {action.label}
                          </span>
                          <span className="text-[0.75rem] font-normal text-slate-600 dark:text-slate-400">
                            {action.description}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* About / disclaimer */}
            <section>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                <div className="mb-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    About this app
                  </h3>
                </div>
                <p className="mb-1">
                  This toolkit is a teaching and decision-support aid for
                  HMCAS-style ambulance practice. It mirrors wording and
                  thresholds from CPG v2.4 where possible.
                </p>
                <p>
                  It does not replace the official guidelines, Clinical
                  Coordination, or local protocols. Always confirm doses,
                  ranges and pathways against the current CPG.
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
