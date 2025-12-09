import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    title: "Resuscitation",
    description:
      "Adult and paediatric cardiac arrest tools aligned with the updated single-shock arrest algorithms and post-ROSC care.",
    tools: [
      {
        name: "Emergency Resuscitation Timer",
        href: "/tools/resus-timer",
        tagline: "2-minute cycles with CPR metronome and event logging.",
        meta: "CPR workflow",
      },
      {
        name: "Adult Cardiac Arrest (Unwitnessed)",
        href: "/tools/adult-arrest",
        tagline:
          "Updated single-shock algorithm for adult unwitnessed cardiac arrest in the field.",
        meta: "CPG 2.x Adult arrest",
      },
      {
        name: "Adult Cardiac Arrest - Witnessed",
        href: "/tools/witnessed-adult-arrest",
        tagline:
          "Witnessed arrest during transport/care with AP pads; crew configuration flow lanes.",
        meta: "CPG 2.x Adult arrest",
      },
      {
        name: "Paediatric Arrest (WAAFELSS)",
        href: "/tools/peds-arrest",
        tagline:
          "Age/weight-based drugs, shocks, and fluids for paediatric cardiac arrest.",
        meta: "CPG 2.x Paeds arrest",
      },
      {
        name: "Paediatric Arrest Algorithm",
        href: "/tools/peds-arrest-algorithm",
        tagline:
          "Diagram-style paediatric arrest algorithm with shockable/non-shockable branches.",
        meta: "CPG 2.x Paeds arrest",
      },
      {
        name: "Post-Cardiac Arrest (ROSC) Care",
        href: "/tools/rosc",
        tagline:
          "Airway, ventilation, blood pressure targets and transport priorities after ROSC.",
        meta: "CPG 2.6 ROSC",
      },
      {
        name: "ECMO / ECPR Criteria",
        href: "/tools/ecmo-criteria", // or "/tools/ecmo" - just keep this in sync with the actual route
        tagline:
          "Field triggers for considering ECMO/ECPR and discussing with an ECMO centre.",
        meta: "CPG ECMO / ECPR",
      },
    ],
  },
  {
    title: "Respiratory & Paediatric Airway",
    description:
      "Respiratory severity and paediatric airway assessment aligned to CPG wording.",
    tools: [
      {
        name: "Asthma Severity (Adult + Paeds)",
        href: "/tools/asthma",
        tagline:
          "Unified asthma severity assessment that auto-selects adult vs paediatric thresholds.",
        meta: "CPG Asthma",
      },
      {
        name: "MWCS - Croup",
        href: "/tools/mwcs",
        tagline:
          "Modified Westley Croup Score with severity bands and management hints.",
        meta: "CPG Croup",
      },
    ],
  },
  {
    title: "Assessment & Screening",
    description:
      "Neurological and global assessment tools ready to paste into your PRF/ePCR.",
    tools: [
      {
        name: "Stroke BEFAST",
        href: "/tools/stroke",
        tagline:
          "BEFAST stroke screen with onset bands and transport priority guidance.",
        meta: "CPG Stroke",
      },
      {
        name: "Glasgow Coma Scale (Adult + Paeds)",
        href: "/tools/gcs",
        tagline:
          "Adult and paediatric GCS with a single-line summary for documentation.",
        meta: "Neuro assessment",
      },
    ],
  },
  {
    title: "Reference",
    description:
      "Quick reference cards that support primary and secondary survey decisions.",
    tools: [
      {
        name: "Normal Vitals by Age",
        href: "/tools/vitals",
        tagline:
          "Normal ranges and red-flag values for adult and paediatric patients.",
        meta: "CPG Reference",
      },
      {
        name: "CPG v2.4 (2025) PDF",
        href: "/reference/cpg/cpg-v2.4-2025.pdf",
        tagline: "Full guideline for reference (opens PDF).",
        meta: "Reference",
      },
      {
        name: "Shock Index",
        href: "/tools/shock-index",
        tagline: "Rapid SI check with sepsis/shock prompts.",
        meta: "Reference - Time-critical",
      },
    ],
  },
];

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-4">
      {/* Back to landing */}
      <div className="flex items-center">
        <Link
          href="/"
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
          Pick a tool by clinical area. Each card opens a quick calculator or
          reference aligned with HMCAS Clinical Practice Guideline v2.4 (2025).
        </p>
      </header>

      {/* Tool groups */}
      <div className="space-y-6">
        {TOOL_GROUPS.map((group) => (
          <section
            key={group.title}
            className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <div>
                <h2 className="text-sm font-semibold md:text-base">
                  {group.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {group.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={classNames(
                    "group flex flex-col justify-between rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition-colors",
                    "border-slate-200 bg-slate-50 hover:border-emerald-500/80 hover:bg-white",
                    "dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-500/70 dark:hover:bg-slate-900"
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
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[0.7rem] font-medium text-emerald-700 dark:text-emerald-300">
                      {"Open tool ->"}
                    </span>
                    {tool.meta && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {tool.meta}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
