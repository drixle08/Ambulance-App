"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  ListChecks,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { CPG_ENTRIES, MEDICATION_ENTRIES } from "@/lib/cpgIndex";

type ChangeCategory =
  | "All"
  | "Clinical"
  | "New CPG"
  | "Medication"
  | "Trauma"
  | "Formulary";

type CpgChange = {
  id: number;
  cpg: string;
  title: string;
  detail: string;
  category: Exclude<ChangeCategory, "All">;
  badge?: string;
};

const FILTERS: ChangeCategory[] = [
  "All",
  "Clinical",
  "New CPG",
  "Medication",
  "Trauma",
  "Formulary",
];

const CHANGES: CpgChange[] = [
  {
    id: 1,
    cpg: "CPG 2.1",
    title: "Adult medical cardiac arrest updated",
    detail: "Adult medical cardiac arrest updated to reflect ERC 2025 changes.",
    category: "Clinical",
    badge: "ERC 2025",
  },
  {
    id: 2,
    cpg: "CPG 2.2",
    title: "Adult trauma cardiac arrest updated",
    detail: "Adult trauma cardiac arrest updated to reflect ERC 2025 changes.",
    category: "Clinical",
    badge: "ERC 2025",
  },
  {
    id: 3,
    cpg: "CPG 2.3",
    title: "Paediatric medical cardiac arrest updated",
    detail: "Paediatric medical cardiac arrest updated to reflect ERC 2025 changes.",
    category: "Clinical",
    badge: "ERC 2025",
  },
  {
    id: 4,
    cpg: "CPG 2.4",
    title: "Paediatric trauma cardiac arrest updated",
    detail: "Paediatric trauma cardiac arrest updated to reflect ERC 2025 changes.",
    category: "Clinical",
    badge: "ERC 2025",
  },
  {
    id: 5,
    cpg: "CPG 2.5",
    title: "Newborn & neonatal resuscitation updated",
    detail: "Resuscitation of the newborn & neonates updated to reflect ERC 2025 changes.",
    category: "Clinical",
    badge: "ERC 2025",
  },
  {
    id: 6,
    cpg: "CPG 2.6",
    title: "Post cardiac arrest (ROSC) care updated",
    detail: "Post cardiac arrest (ROSC) care updated to reflect ERC 2025 changes.",
    category: "Clinical",
    badge: "ERC 2025",
  },
  {
    id: 7,
    cpg: "CPG 2.8",
    title: "Cardiac arrest in special circumstances updated",
    detail: "Cardiac arrest in special circumstances updated to reflect ERC 2025 changes.",
    category: "Clinical",
    badge: "ERC 2025",
  },
  {
    id: 8,
    cpg: "CPG 3.1",
    title: "Stroke window, decision tree and RACE added",
    detail:
      "Stroke CPG updated with new stroke window, transport decision tree and large vessel occlusion screening tool (RACE). All staff must watch the educational video on performing the RACE assessment: https://youtu.be/9-65gGKgx_k",
    category: "Clinical",
    badge: "Must watch",
  },
  {
    id: 9,
    cpg: "CPG 4.3",
    title: "Broad complex cardioversion joules updated",
    detail: "Adult synchronised cardioversion joules updated for broad complex tachyarrhythmias.",
    category: "Clinical",
    badge: "Energy",
  },
  {
    id: 10,
    cpg: "CPG 4.4",
    title: "Narrow complex cardioversion joules updated",
    detail: "Adult synchronised cardioversion joules updated for narrow complex tachyarrhythmias.",
    category: "Clinical",
    badge: "Energy",
  },
  {
    id: 11,
    cpg: "CPG 6.4",
    title: "CCP sign-off after antiemetic",
    detail:
      "CCPs may sign off patients who have been administered an antiemetic. See CPG special notes for details.",
    category: "Medication",
  },
  {
    id: 12,
    cpg: "CPG 10.1",
    title: "Paediatric TXA added for APs",
    detail: "TXA added to paediatric section of algorithm for APs.",
    category: "Trauma",
    badge: "TXA",
  },
  {
    id: 13,
    cpg: "CPG 10.2",
    title: "Paediatric TXA added for APs and CCPs",
    detail: "TXA added to paediatric section of algorithm for APs and CCPs.",
    category: "Trauma",
    badge: "TXA",
  },
  {
    id: 14,
    cpg: "CPG 10.3",
    title: "Neurogenic shock and SMR guidance",
    detail:
      "Spinal Trauma CPG updated to provide further guidance on the management of neurogenic shock associated with spinal cord injuries and SMR principles.",
    category: "Trauma",
  },
  {
    id: 15,
    cpg: "CPG 10.4",
    title: "Paediatric TXA added for APs",
    detail: "TXA added to paediatric section of algorithm for APs.",
    category: "Trauma",
    badge: "TXA",
  },
  {
    id: 16,
    cpg: "CPG 10.5",
    title: "Paediatric TXA added for APs",
    detail: "TXA added to paediatric section of algorithm for APs.",
    category: "Trauma",
    badge: "TXA",
  },
  {
    id: 17,
    cpg: "CPG 10.6",
    title: "Paediatric TXA added for APs",
    detail: "TXA added to paediatric section of algorithm for APs.",
    category: "Trauma",
    badge: "TXA",
  },
  {
    id: 18,
    cpg: "CPG 10.7",
    title: "Paediatric TXA added for APs",
    detail: "TXA added to paediatric section of algorithm for APs.",
    category: "Trauma",
    badge: "TXA",
  },
  {
    id: 19,
    cpg: "CPG 10.10",
    title: "Seat belt sign added to bypass criteria",
    detail: "Trauma bypass criteria updated to include positive 'seat belt sign'.",
    category: "Trauma",
  },
  {
    id: 20,
    cpg: "CPG 10.11",
    title: "Paediatric TXA added for APs",
    detail: "TXA added to paediatric section of algorithm for APs.",
    category: "Trauma",
    badge: "TXA",
  },
  {
    id: 21,
    cpg: "CPG 10.13",
    title: "Vehicle Extrication & Care of the Trapped Patient added",
    detail: "New CPG – Vehicle Extrication & Care of the Trapped Patient.",
    category: "New CPG",
    badge: "New",
  },
  {
    id: 22,
    cpg: "CPG 12.1",
    title: "TXA removed from ectopic pregnancy",
    detail: "TXA removed from Ectopic pregnancy algorithm.",
    category: "Medication",
    badge: "Removed",
  },
  {
    id: 23,
    cpg: "CPG 12.2",
    title: "TXA removed from miscarriage",
    detail: "TXA removed from miscarriage algorithm.",
    category: "Medication",
    badge: "Removed",
  },
  {
    id: 24,
    cpg: "CPG 12.3",
    title: "TXA removed from placenta abruption",
    detail: "TXA removed from placenta abruption algorithm.",
    category: "Medication",
    badge: "Removed",
  },
  {
    id: 25,
    cpg: "CPG 12.4",
    title: "TXA removed from placenta praevia",
    detail: "TXA removed from placenta praevia algorithm.",
    category: "Medication",
    badge: "Removed",
  },
  {
    id: 26,
    cpg: "CPG 12.13",
    title: "Care of the Newborn added",
    detail: "New CPG – Care of the Newborn.",
    category: "New CPG",
    badge: "New",
  },
  {
    id: 27,
    cpg: "TXA",
    title: "TXA for paediatrics by APs",
    detail: "TXA formulary updated to include administration to paediatrics by AP.",
    category: "Formulary",
  },
  {
    id: 28,
    cpg: "TXA",
    title: "TXA for paediatric isolated TBI",
    detail:
      "TXA indications updated to include paediatric isolated TBI with GCS ≤12 for AP and CCP.",
    category: "Formulary",
    badge: "Indication",
  },
  {
    id: 29,
    cpg: "TXA",
    title: "TXA obstetric indication: PPH only",
    detail: "TXA obstetric indications updated to post-partum haemorrhage only.",
    category: "Formulary",
    badge: "Indication",
  },
  {
    id: 30,
    cpg: "Ondansetron",
    title: "Ondansetron CCP sign-off",
    detail:
      "Ondansetron Formulary updated to reflect CCPs sign off to APs following administration.",
    category: "Formulary",
  },
];

const CATEGORY_STYLE: Record<Exclude<ChangeCategory, "All">, string> = {
  Clinical: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "New CPG": "border-sky-500/30 bg-sky-500/10 text-sky-300",
  Medication: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  Trauma: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  Formulary: "border-pink-500/30 bg-pink-500/10 text-pink-300",
};

function getTargetPage(change: CpgChange): number {
  const protocol = CPG_ENTRIES.find((entry) => entry.code === change.cpg);
  if (protocol) return protocol.printedPage;

  const label = change.cpg.toLowerCase();
  const medication = MEDICATION_ENTRIES.find(
    (entry) =>
      entry.name.toLowerCase() === label ||
      entry.aliases.some((alias) => alias.toLowerCase() === label)
  );
  if (medication) return medication.formularyPage;

  return 1;
}

function getCpgHref(change: CpgChange): string {
  return `/tools/cpg?page=${getTargetPage(change)}`;
}

export default function CpgLatestChangesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChangeCategory>("All");

  const visibleChanges = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHANGES.filter((change) => {
      const matchesFilter = filter === "All" || change.category === filter;
      const haystack = `${change.cpg} ${change.title} ${change.detail} ${change.category}`.toLowerCase();
      return matchesFilter && (!q || haystack.includes(q));
    });
  }, [filter, query]);

  const newCpgCount = CHANGES.filter((change) => change.category === "New CPG").length;
  const medicationCount = CHANGES.filter(
    (change) => change.category === "Medication" || change.category === "Formulary"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 pb-8 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-amber-400">
              Reference - CPG v2.6
            </p>
            <h1 className="truncate text-base font-bold leading-tight text-slate-100">
              Latest CPG Changes
            </h1>
          </div>
          <Link
            href="/tools/cpg"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            <BookOpen className="h-3.5 w-3.5" />
            CPG
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-4">
        <section className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-3">
            <p className="text-xl font-bold text-slate-50">{CHANGES.length}</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">Updates</p>
          </div>
          <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-3">
            <p className="text-xl font-bold text-sky-200">{newCpgCount}</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-sky-500">New CPGs</p>
          </div>
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-3">
            <p className="text-xl font-bold text-violet-200">{medicationCount}</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-violet-500">Drug updates</p>
          </div>
        </section>

        <section className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-semibold text-amber-100">AS SC 26-56 · CPG v2.6 update</p>
              <p className="mt-1 text-xs leading-5 text-amber-100/80">
                Summary of the published change list for CPG v2.6. Always verify clinical decisions
                against the full guideline.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search change, CPG number, or medication"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((item) => {
              const active = filter === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={[
                    "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-emerald-400 bg-emerald-400 text-slate-950"
                      : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500",
                  ].join(" ")}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          {visibleChanges.map((change) => {
            const targetPage = getTargetPage(change);

            return (
            <Link
              key={change.id}
              href={getCpgHref(change)}
              aria-label={`Open ${change.cpg} on CPG page ${targetPage}`}
              className="group rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm transition-colors hover:border-amber-500/50 hover:bg-slate-900/80"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                  <ListChecks className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-0.5 text-[0.7rem] font-bold text-slate-200 group-hover:border-amber-500/50 group-hover:text-amber-200">
                      {change.cpg}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-300">
                      <BookOpen className="h-3 w-3" />
                      p.{targetPage}
                    </span>
                    <span
                      className={[
                        "rounded-md border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
                        CATEGORY_STYLE[change.category],
                      ].join(" ")}
                    >
                      {change.category}
                    </span>
                    {change.badge && (
                      <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-rose-300">
                        {change.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-sm font-bold text-slate-50">{change.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{change.detail}</p>
                </div>
              </div>
            </Link>
            );
          })}

          {visibleChanges.length === 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-8 text-center">
              <FileText className="mx-auto h-6 w-6 text-slate-600" />
              <p className="mt-2 text-sm font-semibold text-slate-300">No matching CPG changes.</p>
            </div>
          )}
        </section>

        <section className="grid gap-2 pb-4 sm:grid-cols-2">
          <Link
            href="/tools/cpg"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800"
          >
            <BookOpen className="h-4 w-4" />
            Open full CPG
          </Link>
          <Link
            href="/tools/cpg-chat"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-4 w-4" />
            Clinical Assistant
          </Link>
        </section>
      </main>
    </div>
  );
}
