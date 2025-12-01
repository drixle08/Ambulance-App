import React from "react";
import Link from "next/link";

type CategoryId = "paeds" | "neuro" | "resp" | "reference";

type Tool = {
  id: string;
  name: string;
  badge: string;
  description: string;
  tagline: string;
  status: string;
  href: string;
  category: CategoryId;
};

type Category = {
  id: CategoryId;
  title: string;
  subtitle: string;
};

const categories: Category[] = [
  {
    id: "paeds",
    title: "Paediatric tools",
    subtitle: "Age/weight-based calculators and paeds-specific assessments.",
  },
  {
    id: "neuro",
    title: "Neurological tools",
    subtitle: "Consciousness, stroke screening and neuro-focused assessments.",
  },
  {
    id: "resp",
    title: "Respiratory tools",
    subtitle: "Airway and breathing severity tools for the field.",
  },
  {
    id: "reference",
    title: "Reference",
    subtitle: "Quick-look reference for vitals and general parameters.",
  },
];

const tools: Tool[] = [
  // Paeds
  {
    id: "mwcs",
    name: "MWCS (Croup)",
    badge: "Calculator",
    description:
      "Modified Westley Croup Score with automatic severity grading for prehospital use.",
    tagline: "Respiratory • Paediatrics",
    status: "Live",
    href: "/tools/mwcs",
    category: "paeds",
  },
  {
    id: "peds-arrest",
    name: "Pediatric Arrest Calculator",
    badge: "Calculator",
    description:
      "Age → weight estimate with key arrest doses and parameters (WAAFELSS style).",
    tagline: "Paediatrics • Resus",
    status: "Live",
    href: "/tools/peds-arrest",
    category: "paeds",
  },

  // Neuro
  {
    id: "gcs",
    name: "Glasgow Coma Scale (GCS)",
    badge: "Assessment",
    description:
      "Eye, verbal and motor components with automatic total and severity band.",
    tagline: "Neuro • Consciousness",
    status: "Live",
    href: "/tools/gcs",
    category: "neuro",
  },
  {
    id: "stroke",
    name: "Stroke BEFAST",
    badge: "Assessment",
    description:
      "Bedside BEFAST stroke screening with prompts and transport priority hints.",
    tagline: "Neuro • Time critical",
    status: "Live",
    href: "/tools/stroke",
    category: "neuro",
  },

  // Respiratory
  {
    id: "asthma",
    name: "Asthma Severity",
    badge: "Assessment",
    description:
      "Simple asthma severity tool tailored for ambulance assessment and treatment thresholds.",
    tagline: "Respiratory",
    status: "Live",
    href: "/tools/asthma",
    category: "resp",
  },

  // Reference
  {
    id: "vitals",
    name: "Normal Vitals by Age",
    badge: "Reference",
    description:
      "Age-based reference for HR, RR, BP, SpO₂ and more, optimised for quick look-up.",
    tagline: "Reference • All ages",
    status: "Live",
    href: "/tools/vitals",
    category: "reference",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Global header */}
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-400/80">
            Ambulance Paramedic Toolkit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Central hub for your ambulance tools, organised by system. Click a
            card to open its calculator, assessment or reference page.
          </p>
        </header>

        {/* Category sections */}
        <div className="space-y-8">
          {categories.map((cat) => {
            const toolsInCategory = tools.filter(
              (tool) => tool.category === cat.id
            );

            if (toolsInCategory.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {cat.title}
                  </h2>
                  <p className="text-xs text-slate-400">{cat.subtitle}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {toolsInCategory.map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="group flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm ring-1 ring-black/5 transition hover:border-emerald-400/70 hover:bg-slate-900 hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-semibold leading-tight">
                            {tool.name}
                          </h3>
                          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            {tool.badge}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-slate-400">
                          {tool.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[11px]">
                        <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-slate-300">
                          {tool.tagline}
                        </span>
                        <span className="text-slate-500 group-hover:text-emerald-400">
                          {tool.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
