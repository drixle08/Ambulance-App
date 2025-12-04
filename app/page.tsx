import Link from "next/link";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import { InstallHint } from "@/app/_components/InstallHint";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const FEATURED_TOOLS = [
  {
    name: "Paediatric Arrest (WAAFELSS)",
    href: "/tools/peds-arrest",
    description:
      "Age/weight-based drugs, shocks, and fluid doses for paediatric cardiac arrest.",
    tag: "Paeds resus",
  },
  {
    name: "Asthma Severity (Adult + Paeds)",
    href: "/tools/asthma",
    description:
      "Unified asthma severity assessment that auto-selects adult vs paediatric thresholds.",
    tag: "Respiratory",
  },
  {
    name: "MWCS – Croup",
    href: "/tools/mwcs",
    description:
      "Modified Westley Croup Score with CPG-aligned severity bands and management hints.",
    tag: "Paeds respiratory",
  },
  {
    name: "Stroke BEFAST",
    href: "/tools/stroke",
    description:
      "BEFAST stroke screen with onset bands and transport priority guidance.",
    tag: "Neurological",
  },
];

export default function HomePage() {
  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
      {/* Top bar with theme toggle */}
      <div className="flex items-center justify-between gap-4 mb-4">
              {/* DEBUG: Dark mode test box */}

        <div className="flex flex-col">
          <span className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-emerald-500">
            Ambulance • Toolkit
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] items-start">
        <div className="space-y-5">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Decision-support tools for ambulance crews.
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
           A small collection of decision-support tools for ambulance crews working under
           HMCAS Clinical Practice Guideline v2.4 (2025). Built for time-critical care,
           dark environments, and offline use on the road.
         </p>


          {/* CTAs */}
           <div className="mt-6 flex flex-wrap gap-3">
           <Link
           href="/dashboard"
           className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
           Open tools dashboard →
          </Link>
        </div>

        </div>

        {/* Highlight / “cardy” right-side panel */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 space-y-3">
          <p className="text-xs font-semibold tracking-[0.3em] text-emerald-400 uppercase">
            Built for the back of the truck
          </p>
          <ul className="space-y-2 text-xs md:text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-2">
              <span className="mt-[0.3rem] h-1.5 w-1.5 rounded-full bg-emerald-400/80 shrink-0" />
              <span>
                <span className="font-semibold">Quick calculators</span> for paediatric
                arrest, asthma, and croup – with single-line summaries ready to paste
                into your PRF / ePCR.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[0.3rem] h-1.5 w-1.5 rounded-full bg-emerald-400/80 shrink-0" />
              <span>
                <span className="font-semibold">Assessment aids</span> like BEFAST and
                GCS that match HMCAS CPG wording, thresholds, and transport priorities.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-[0.3rem] h-1.5 w-1.5 rounded-full bg-emerald-400/80 shrink-0" />
              <span>
                <span className="font-semibold">Low-clutter UI</span> optimised for
                dark cabs, gloved hands, and patchy mobile data.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Featured tools */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Featured tools
          </h2>
          <Link
            href="/dashboard"
            className="text-[0.75rem] text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            View all tools →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {FEATURED_TOOLS.map((tool) => (
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
                <p className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400">
                  {tool.tag}
                </p>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {tool.description}
                </p>
              </div>
              <span className="mt-3 text-[0.7rem] text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity dark:text-emerald-400">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Meta badges moved here */}
      <section className="pt-2">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[0.7rem] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            v0.1.0 • Early access
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-100/70 px-2.5 py-1 text-[0.7rem] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100">
            Offline-capable PWA
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[0.7rem] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Dark-environment friendly
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[0.7rem] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Aligned with CPG v2.4 (2025)
          </span>
        </div>
      </section>

      {/* About section (anchor target for secondary CTA) */}
      <section id="about" className="space-y-3 pt-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          About this app
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
         This app is a teaching and decision-support aid for HMCAS-style ambulance
         practice. It mirrors wording, thresholds and patterns from HMCAS CPG v2.4
         where possible, but it does not replace the official guidelines, local
         protocols, or Clinical Coordination. Always confirm doses, ranges and pathways
         against the current CPG.
       </p>

      </section>

      {/* Install hint – bottom-right */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6">
        <InstallHint />
      </div>
    </div>
  );
}
