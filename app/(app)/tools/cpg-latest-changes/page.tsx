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
  | "Formulary"
  | "Document";

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
  "Document",
];

const CHANGES: CpgChange[] = [
  {
    id: 1,
    cpg: "Abbreviation List",
    title: "Abbreviations updated",
    detail: "Abbreviation list updated to include IPC, infection prevention and control.",
    category: "Document",
  },
  {
    id: 2,
    cpg: "Page 11",
    title: "CPG feedback email added",
    detail:
      "Staff can send CPG feedback, suggestions, or comments to HMCAS-Clinicalguideline@hamad.qa.",
    category: "Document",
  },
  {
    id: 3,
    cpg: "CPG 1.1",
    title: "Monitoring frequency updated",
    detail:
      "A complete set of vital signs is required at minimum every 15 minutes, or 2 sets if patient contact time is less than 15 minutes.",
    category: "Clinical",
  },
  {
    id: 4,
    cpg: "CPG 1.2",
    title: "Monitoring frequency updated",
    detail:
      "A complete set of vital signs is required at minimum every 15 minutes, or 2 sets if patient contact time is less than 15 minutes.",
    category: "Clinical",
  },
  {
    id: 5,
    cpg: "CPG 4.1",
    title: "Clopidogrel dose updated for STEMI",
    detail: "Clopidogrel loading dose updated to 600 mg for STEMI.",
    category: "Medication",
    badge: "Dose",
  },
  {
    id: 6,
    cpg: "CPG 4.2",
    title: "Cardioversion sedation priority clarified",
    detail:
      "Special note added that procedural sedation should not be prioritized over TCP for patients presenting in extremis or peri-arrest.",
    category: "Clinical",
  },
  {
    id: 7,
    cpg: "CPG 4.3",
    title: "Amiodarone infusion note added",
    detail:
      "Consider amiodarone infusion for unstable patients following 3 unsuccessful synchronized shocks.",
    category: "Medication",
  },
  {
    id: 8,
    cpg: "CPG 4.3",
    title: "Cardioversion sedation priority clarified",
    detail:
      "Special note added that procedural sedation should not be prioritized over synchronized cardioversion for patients presenting in extremis or peri-arrest.",
    category: "Clinical",
  },
  {
    id: 9,
    cpg: "CPG 4.4",
    title: "Amiodarone infusion note added",
    detail:
      "Consider amiodarone infusion for unstable patients following unsuccessful synchronized shocks.",
    category: "Medication",
  },
  {
    id: 10,
    cpg: "CPG 4.4",
    title: "Adenosine dosing sequence updated",
    detail:
      "After sedation and unsuccessful 12 mg adenosine, an 18 mg IV adenosine dose is added.",
    category: "Medication",
    badge: "Dose",
  },
  {
    id: 11,
    cpg: "CPG 4.4",
    title: "Cardioversion sedation priority clarified",
    detail:
      "Special note added that procedural sedation should not be prioritized over synchronized cardioversion for patients presenting in extremis or peri-arrest.",
    category: "Clinical",
  },
  {
    id: 12,
    cpg: "CPG 4.7",
    title: "Acute Aortic Dissection added",
    detail: "New CPG added for Acute Aortic Dissection.",
    category: "New CPG",
    badge: "New",
  },
  {
    id: 13,
    cpg: "CPG 6.7",
    title: "Adrenal Insufficiency added",
    detail: "New CPG added for Adrenal Insufficiency.",
    category: "New CPG",
    badge: "New",
  },
  {
    id: 14,
    cpg: "CPG 7.1",
    title: "Droperidol removed from ABD",
    detail: "Droperidol removed from the ABD CPG.",
    category: "Medication",
    badge: "Removed",
  },
  {
    id: 15,
    cpg: "CPG 10.3",
    title: "NEXUS criterion amended",
    detail:
      "NEXUS criteria point 1 amended to state neck pain or tenderness rather than spinal pain or tenderness.",
    category: "Trauma",
  },
  {
    id: 16,
    cpg: "CPG 10.3",
    title: "Standing-height falls guidance added",
    detail: "Guidance provided for standing-height falls in elderly patients.",
    category: "Trauma",
  },
  {
    id: 17,
    cpg: "CPG 10.4",
    title: "Flail chest splinting removed",
    detail: "Splinting of flail chest removed. Effective analgesia is the management of choice.",
    category: "Trauma",
    badge: "Removed",
  },
  {
    id: 18,
    cpg: "CPG 10.6",
    title: "Pelvic binder indications updated",
    detail: "Indications for pelvic binder application updated.",
    category: "Trauma",
  },
  {
    id: 19,
    cpg: "CPG 10.12",
    title: "Ongoing Trauma Care Checklist added",
    detail: "New CPG added for the Ongoing Trauma Care Checklist.",
    category: "New CPG",
    badge: "New",
  },
  {
    id: 20,
    cpg: "CPG 11.3",
    title: "Safe Sedation renamed",
    detail: "Title changed from Safe Sedation to Procedural Sedation.",
    category: "Clinical",
  },
  {
    id: 21,
    cpg: "CPG 11.3",
    title: "Procedural sedation guidance updated",
    detail:
      "Medication choice, dosing, and indications for procedural sedation have been updated.",
    category: "Medication",
  },
  {
    id: 22,
    cpg: "CPG 11.5",
    title: "RSI checklist updated",
    detail: "RSI checklist updated.",
    category: "Clinical",
  },
  {
    id: 23,
    cpg: "CPG 13.8",
    title: "Epistaxis added",
    detail: "New CPG added for Epistaxis.",
    category: "New CPG",
    badge: "New",
  },
  {
    id: 24,
    cpg: "CPG 15.1",
    title: "Blood transfusion transfer guidance added",
    detail: "Guidance added for transfers with blood transfusions.",
    category: "Clinical",
  },
  {
    id: 25,
    cpg: "CPG 15.4",
    title: "ISDN approved for AP transfer",
    detail:
      "Isosorbide Dinitrate (ISDN) included in the list of approved medications for AP transfer.",
    category: "Medication",
  },
  {
    id: 26,
    cpg: "CPG 4.4",
    title: "Blood products included",
    detail: "CPG updated to include blood and blood products.",
    category: "Clinical",
  },
  {
    id: 27,
    cpg: "Adenosine",
    title: "Adenosine formulary updated",
    detail: "Formulary updated to reflect 18 mg adenosine as the 3rd dose.",
    category: "Formulary",
    badge: "Dose",
  },
  {
    id: 28,
    cpg: "Clopidogrel",
    title: "Clopidogrel formulary updated",
    detail: "Formulary updated to reflect 600 mg dosing for STEMI.",
    category: "Formulary",
    badge: "Dose",
  },
  {
    id: 29,
    cpg: "Hydrocortisone",
    title: "Hydrocortisone formulary updated",
    detail: "Formulary updated to reflect hydrocortisone dosing for adrenal insufficiency.",
    category: "Formulary",
  },
  {
    id: 30,
    cpg: "Paracetamol",
    title: "Paracetamol formulary updated",
    detail:
      "Formulary updated to reflect that IV paracetamol may be administered to paediatric patients and infants by APs.",
    category: "Formulary",
  },
  {
    id: 31,
    cpg: "TXA",
    title: "TXA formulary updated",
    detail: "Formulary updated to reflect TXA dosing for epistaxis.",
    category: "Formulary",
    badge: "Dose",
  },
];

const CATEGORY_STYLE: Record<Exclude<ChangeCategory, "All">, string> = {
  Clinical: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "New CPG": "border-sky-500/30 bg-sky-500/10 text-sky-300",
  Medication: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  Trauma: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  Formulary: "border-pink-500/30 bg-pink-500/10 text-pink-300",
  Document: "border-slate-600 bg-slate-800 text-slate-300",
};

const DOCUMENT_PAGE_BY_LABEL: Record<string, number> = {
  "Abbreviation List": 8,
  "Page 11": 11,
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

  return DOCUMENT_PAGE_BY_LABEL[change.cpg] ?? 1;
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
              Reference - CPG v2.5
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
              <p className="text-sm font-semibold text-amber-100">22 April AS SC 26-27 CPG update</p>
              <p className="mt-1 text-xs leading-5 text-amber-100/80">
                Summary of the published change list for CPG v2.5. Always verify clinical decisions
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
