import Link from "next/link";
import { InstallHint } from "./_components/InstallHint";

const featuredTools = [
  {
    name: "MWCS (Croup)",
    href: "/tools/mwcs",
    label: "Calculator",
    description: "Modified Westley Croup Score with automatic severity banding.",
    tag: "Paediatrics • Respiratory",
  },
  {
    name: "Paediatric Arrest (WAAFELSS)",
    href: "/tools/peds-arrest",
    label: "Calculator",
    description: "Age-based weight estimate, drug doses and defib energy in one view.",
    tag: "Paediatrics • Resuscitation",
  },
  {
    name: "Glasgow Coma Scale (GCS)",
    href: "/tools/gcs",
    label: "Assessment",
    description: "Eye, verbal and motor scoring with severity band and copy summary.",
    tag: "Neuro • Adult & Paeds",
  },
  {
    name: "Normal Vitals by Age",
    href: "/tools/vitals",
    label: "Reference",
    description: "Quick reference for HR, RR, BP and SpO₂ across age bands.",
    tag: "Reference • All ages",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Subtle background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 mx-auto h-64 max-w-xl rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="space-y-6 pb-10 pt-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-emerald-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-base">
              🚑
            </span>
            <span className="uppercase tracking-[0.25em] text-emerald-300/90">
              Ambulance Paramedic Toolkit
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Decision-support tools for ambulance crews.
            </h1>
            <p className="max-w-2xl text-sm text-slate-400">
              Quick-access calculators and assessment aids built around your
              prehospital workflow. Optimised for dark environments and offline
              use. Always interpret results in context and follow your local CPG.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Open tools dashboard
            </Link>
            <p className="text-[11px] text-slate-500">
              v0.1.0 • Early access build
            </p>
          </div>
        </header>

        {/* Featured tools */}
        <section className="space-y-3 pb-10">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Featured tools
            </h2>
            <Link
              href="/dashboard"
              className="text-[11px] font-medium text-emerald-300 hover:text-emerald-200"
            >
              View full dashboard →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featuredTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-emerald-400/70 hover:bg-slate-900"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-50">
                    {tool.name}
                  </p>
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300 group-hover:border-emerald-400/80 group-hover:text-emerald-200">
                    {tool.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{tool.description}</p>
                <p className="mt-3 text-[10px] font-medium text-slate-500">
                  {tool.tag}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Spacer to push footer down a bit */}
        <div className="flex-1" />

        {/* Disclaimer / footer card */}
        <footer className="pb-4 pt-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">
              Clinical use &amp; disclaimer
            </p>
            <p className="mt-1">
              This toolkit is intended for education and decision-support only.
              It does not replace ambulance service Clinical Practice Guidelines
              or clinical judgement. Always follow your local CPG, policies and
              online medical control.
            </p>
            <p className="mt-2 text-[10px] text-slate-500">
              For training / feedback only. Update notes and additional tools
              will be added in future versions.
            </p>
          </div>
        </footer>
      </div>
      <InstallHint />
    </main>
  );
}
