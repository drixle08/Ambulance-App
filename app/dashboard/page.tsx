import Link from "next/link";
import { ThemeToggle } from "@/app/_components/ThemeToggle";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Tool = {
  name: string;
  href: string;
  tagline: string;
  meta?: string;
};

type ToolGroup = {
  title: string;
  description: string;
  tools: Tool[];
};

const TOOL_GROUPS: ToolGroup[] = [
  {
    title: "Paediatric resus & respiratory",
    description:
      "Weight-based resuscitation, croup scoring, and asthma severity tools aligned with CPG v2.4.",
    tools: [
      {
        name: "Paediatric Arrest (WAAFELSS)",
        href: "/tools/peds-arrest",
        tagline:
          "Age/weight-based drug doses, shocks, and fluids for paediatric arrest.",
        meta: "WAAFELSS-style • CPG 2.x",
      },
      {
        name: "Asthma Severity (Adult + Paeds)",
        href: "/tools/asthma",
        tagline:
          "Unified asthma severity assessment that auto-selects adult vs paediatric thresholds.",
        meta: "CPG 5.1 Asthma",
      },
      {
        name: "MWCS – Croup",
        href: "/tools/mwcs",
        tagline:
          "Modified Westley Croup Score with severity banding and management hints.",
        meta: "CPG 5.3 Croup",
      },
    ],
  },
  {
    title: "Assessment & screening",
    description:
      "Quick bedside screening tools to support your primary clinical approach and early decision-making.",
    tools: [
      {
        name: "Stroke BEFAST",
        href: "/tools/stroke",
        tagline:
          "BEFAST stroke screen with onset banding and transport priority guidance.",
        meta: "CPG 3.1 Stroke",
      },
      {
        name: "Glasgow Coma Scale (GCS)",
        href: "/tools/gcs",
        tagline:
          "Adult + paediatric GCS with PRF-ready summary for trending neurological status.",
        meta: "CPG 1.4 GCS",
      },
    ],
  },
  {
    title: "Reference",
    description:
      "Low-friction reference cards you can glance at between calls or in the back of the truck.",
    tools: [
      {
        name: "Normal Vitals by Age",
        href: "/tools/vitals",
        tagline:
          "Age-banded HR, RR, BP and SpO₂ ranges for neonates, paediatrics, adolescents, and adults.",
        meta: "Adult + paeds tables",
      },
      // Easy slot for future reference tools (e.g. QEWS, sepsis flags, shock index etc.)
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
              Tools dashboard
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              Ambulance Paramedic Toolkit
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          A small collection of decision-support tools built around HMCAS CPG
          v2.4. Designed for dark environments, quick taps, and offline use on
          the road.
        </p>

        {/* Micro-badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            v0.1.0 • Early access
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-100/70 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100">
            Offline-capable PWA
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Dark-environment friendly
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Aligned with CPG v2.4 (2025)
          </span>
        </div>
      </header>

      {/* Groups */}
      <main className="space-y-8">
        {TOOL_GROUPS.map((group) => (
          <section
            key={group.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-4 dark:border-slate-800 dark:bg-slate-950/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {group.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {group.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {group.tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={classNames(
                    "group rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between",
                    "hover:border-emerald-500/80 hover:bg-slate-100 transition-colors",
                    "dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900"
                  )}
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {tool.tagline}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {tool.meta && (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
                        {tool.meta}
                      </span>
                    )}
                    <span className="ml-auto text-[0.7rem] text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity dark:text-emerald-400">
                      Open tool →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
