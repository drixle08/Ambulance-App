"use client";

import Link from "next/link";
import { useState } from "react";

type Category = "all" | "paeds" | "resp" | "neuro" | "resus" | "reference";

type Tool = {
  name: string;
  href: string;
  label: string;
  description: string;
  meta: string;
  categories: Category[];
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const tools: Tool[] = [
  {
    name: "MWCS (Croup)",
    href: "/tools/mwcs",
    label: "Calculator",
    description:
      "Modified Westley Croup Score with automatic severity banding and suggested actions.",
    meta: "Paediatrics • Respiratory",
    categories: ["paeds", "resp"],
  },
  {
    name: "Asthma Severity",
    href: "/tools/asthma",
    label: "Assessment",
    description:
      "Field-focused asthma severity bands with prehospital management prompts.",
    meta: "Respiratory • All ages",
    categories: ["resp", "reference"],
  },
  {
    name: "Paediatric Arrest (WAAFELSS)",
    href: "/tools/peds-arrest",
    label: "Calculator",
    description:
      "Age-based weight estimate, arrest drugs, defibrillation energy and target SBP.",
    meta: "Paediatrics • Resuscitation",
    categories: ["paeds", "resus"],
  },
  {
    name: "Glasgow Coma Scale (GCS)",
    href: "/tools/gcs",
    label: "Assessment",
    description:
      "Eye, verbal and motor scoring with severity band and copy-to-notes summary.",
    meta: "Neuro • Adult & Paeds",
    categories: ["neuro", "reference"],
  },
  {
    name: "Stroke BEFAST Screen",
    href: "/tools/stroke-befast",
    label: "Assessment",
    description:
      "Quick BEFAST screen with count of positive components and stroke pathway prompts.",
    meta: "Neuro • Stroke",
    categories: ["neuro"],
  },
  {
    name: "Normal Vitals by Age",
    href: "/tools/vitals",
    label: "Reference",
    description:
      "Textbook-style HR, RR, SBP and SpO₂ bands from neonate to adult, with mini overview table.",
    meta: "Reference • All ages",
    categories: ["paeds", "reference"],
  },
];

const categoryPills: { id: Category; label: string }[] = [
  { id: "all", label: "All tools" },
  { id: "paeds", label: "Paediatrics" },
  { id: "resp", label: "Respiratory" },
  { id: "neuro", label: "Neuro" },
  { id: "resus", label: "Resuscitation" },
  { id: "reference", label: "Reference" },
];

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredTools =
    activeCategory === "all"
      ? tools
      : tools.filter((tool) => tool.categories.includes(activeCategory));

  const activeLabel =
    categoryPills.find((c) => c.id === activeCategory)?.label ?? "All tools";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {/* Top bar: back to home */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-emerald-400"
          >
            ← Back to home
          </Link>
          <p className="text-[11px] text-slate-500">
            {filteredTools.length} tool
            {filteredTools.length !== 1 ? "s" : ""} shown
          </p>
        </div>

        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Tools
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Ambulance Paramedic Toolkit
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Quick-access calculators and assessment aids grouped by clinical
            area. Choose a category or browse all tools. Always use in
            conjunction with your ambulance service Clinical Practice Guidelines.
          </p>
        </header>

        {/* Category filters */}
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Filter by category
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryPills.map((cat) => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={classNames(
                    "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                    "border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-400/70 hover:text-emerald-300 hover:bg-slate-900",
                    isActive &&
                      "border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow-sm"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500">
            Showing: <span className="font-semibold text-slate-300">{activeLabel}</span>
          </p>
        </section>

        {/* Tools grid */}
        <section className="grid gap-4 sm:grid-cols-2">
          {filteredTools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-emerald-400/70 hover:bg-slate-900"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-50">
                  {tool.name}
                </p>
                <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300 group-hover:border-emerald-400/80 group-hover:text-emerald-200">
                  {tool.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">{tool.description}</p>
              <p className="mt-3 text-[10px] font-medium text-slate-500">
                {tool.meta}
              </p>
            </Link>
          ))}

          {filteredTools.length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-400">
              No tools match this category yet. This section will populate as
              more calculators and references are added.
            </div>
          )}
        </section>

        <p className="pt-2 text-[11px] text-slate-500">
          This dashboard is for education and decision-support. It does not
          replace Clinical Practice Guidelines, online medical control or
          clinical judgement.
        </p>
      </div>
    </main>
  );
}
