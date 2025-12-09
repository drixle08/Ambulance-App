"use client";

import { InstallHint } from "@/app/_components/InstallHint";
import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { StandaloneRedirect } from "@/app/_components/StandaloneRedirect";
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

const KPI_CHIPS = [
  { label: "Tools available", value: "5" },
  { label: "Time-critical tools", value: "3" },
  { label: "Offline-capable PWA", value: "" },
  { label: "Aligned with CPG v2.4 (2025)", value: "" },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <StandaloneRedirect />
      {/* Top app bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex flex-col">
            <span className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-500">
              Ambulance Paramedic Toolkit
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
              {/* Install hint - bottom-right */}
              <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40">
              <InstallHint />
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
                {/* THIS is the snippet - main CTA to dashboard */}
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

            {/* Quick actions (thumb zone) */}
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
          </div>

          {/* Right column: status + about */}
          <div className="flex flex-col gap-4 md:sticky md:top-20">
            {/* Status chips */}
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

export default HomePage;
