"use client";

import Link from "next/link";

type ToolCard = {
  name: string;
  href: string;
  description: string;
  tag: string;
};

const paedsTools: ToolCard[] = [
  {
    name: "MWCS (Croup)",
    href: "/tools/mwcs",
    description:
      "Modified Westley Croup Score with automatic severity banding and management suggestions.",
    tag: "Paediatrics • Respiratory",
  },
  {
    name: "Paediatric Arrest (WAAFELSS)",
    href: "/tools/peds-arrest",
    description:
      "Age-based weight estimate, arrest drug doses, fluids, defibrillation energy and target SBP.",
    tag: "Paediatrics • Resuscitation",
  },
];

const assessmentTools: ToolCard[] = [
  {
    name: "Asthma Severity",
    href: "/tools/asthma",
    description:
      "Field severity bands (mild to life-threatening) with suggested prehospital actions.",
    tag: "Adult & Paeds • Respiratory",
  },
  {
    name: "Glasgow Coma Scale (GCS)",
    href: "/tools/gcs",
    description:
      "Eye, verbal and motor scoring with severity band and copyable GCS summary.",
    tag: "Neuro • Adult & Paeds",
  },
  {
    name: "Stroke BEFAST",
    href: "/tools/stroke",
    description:
      "Balance, Eyes, Face, Arm, Speech screen with quick stroke flag and PRF summary.",
    tag: "Neuro • Time-critical",
  },
];

const referenceTools: ToolCard[] = [
  {
    name: "Normal Vitals by Age",
    href: "/tools/vitals",
    description:
      "Textbook-style HR, RR, SBP and SpO₂ ranges from neonates to adults, with quick PRF copy.",
    tag: "Reference • All ages",
  },
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
              Tools Dashboard
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
              Ambulance Paramedic Toolkit
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
              Quick-access calculators, assessments and reference cards designed
              around prehospital workflows. Optimised for dark environments and
              offline use.
            </p>
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80 transition"
          >
            ⬅ Back to welcome
          </Link>
        </div>

        {/* Paediatric tools */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Paediatric resus & respiratory
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Core paediatric tools you are likely to open frequently in the field.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {paedsTools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </section>

        {/* Assessment tools */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Assessment & screening
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Simple, repeatable assessments with severity bands and copyable
                summaries for documentation.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {assessmentTools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </section>

        {/* Reference tools */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Reference
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Quick lookup tables to support decision-making and trending.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {referenceTools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </section>

        {/* Footer note */}
        <footer className="pt-4 border-t border-slate-900/70">
          <p className="text-[10px] text-slate-500 max-w-2xl">
            This toolkit is for education and decision-support only. It does not
            replace your ambulance service Clinical Practice Guidelines or
            clinical judgement. Always follow local CPG, policies and online
            medical control.
          </p>
        </footer>
      </div>
    </main>
  );
}

function ToolCard({ tool }: { tool: ToolCard }) {
  return (
    <Link
      href={tool.href}
      className={classNames(
        "group rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition",
        "hover:border-emerald-400/80 hover:bg-slate-900"
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-50">
          {tool.name}
        </p>
        <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300 group-hover:border-emerald-400/80 group-hover:text-emerald-200">
          Open
        </span>
      </div>
      <p className="text-xs text-slate-400">{tool.description}</p>
      <p className="mt-3 text-[10px] font-medium text-slate-500">
        {tool.tag}
      </p>
    </Link>
  );
}
