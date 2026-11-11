"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Baby, BookOpen, ChevronDown, ShieldCheck, User } from "lucide-react";
import { ToolHeader } from "@/app/_components/ToolHeader";
import { cpgViewerHref } from "@/lib/cpgIndex";
import {
  FORMULARY,
  FORMULARY_EDITION,
  PRIVILEGE_LEVELS,
  alsoKnownAs,
  bandKey,
  findDrug,
  pairCells,
  sourceFlag,
  type Bullet,
  type DoseRow,
  type FormularyDrug,
  type Population,
} from "@/lib/formulary";

const POPULATIONS: { id: Population; label: string; Icon: typeof User }[] = [
  { id: "adult", label: "Adult", Icon: User },
  { id: "paediatric", label: "Paediatric", Icon: Baby },
];

function dosingFor(drug: FormularyDrug, pop: Population) {
  return pop === "adult" ? drug.dosing.adult : drug.dosing.paediatric;
}

export default function FormularyPage() {
  const [population, setPopulation] = useState<Population | null>(null);
  const [drugId, setDrugId] = useState<string>("");
  const [band, setBand] = useState<string | null>(null);
  const drug = findDrug(drugId);

  // Deep links: /tools/formulary?drug=adrenaline&pop=paediatric
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("drug");
    const p = params.get("pop");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time read of the URL after mount */
    if (d && findDrug(d)) setDrugId(d);
    if (p === "adult" || p === "paediatric") setPopulation(p);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (drugId) params.set("drug", drugId);
    if (population) params.set("pop", population);
    const qs = params.toString();
    window.history.replaceState(window.history.state, "", qs ? `?${qs}` : window.location.pathname);
  }, [drugId, population]);

  const reset = () => {
    setPopulation(null);
    setDrugId("");
    setBand(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <ToolHeader
        title="Formulary"
        meta={`CPG ${FORMULARY_EDITION.tag} · ${FORMULARY.length} medications`}
        showReset
        onReset={reset}
      />

      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        {/* 1. Patient */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">1 · Patient</p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Patient">
            {POPULATIONS.map(({ id, label, Icon }) => {
              const active = population === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPopulation(id)}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 text-base font-bold transition-colors active:scale-[0.98] ${
                    active
                      ? "border-amber-400 bg-amber-400 text-slate-950"
                      : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Medication */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <label
            htmlFor="formulary-drug"
            className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400"
          >
            2 · Medication
          </label>
          <div className="relative">
            <select
              id="formulary-drug"
              value={drugId}
              onChange={(e) => setDrugId(e.target.value)}
              className="min-h-14 w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 py-3 pl-4 pr-11 text-base font-semibold text-slate-50 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            >
              <option value="">Select a medication…</option>
              {FORMULARY.map((d) => {
                const aka = alsoKnownAs(d);
                const none = population && !dosingFor(d, population);
                return (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {aka && aka.toLowerCase() !== d.name.toLowerCase() ? ` (${aka})` : ""}
                    {none ? (population === "adult" ? " — no adult dosing" : " — no paediatric dosing") : ""}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
          </div>
        </section>

        {!drug ? (
          <p className="px-1 text-sm text-slate-400">
            Choose the patient and a medication to see the CPG formulary dose, then indications,
            contraindications and notes.
          </p>
        ) : (
          <DrugView drug={drug} population={population} band={band} onBand={setBand} />
        )}
      </main>
    </div>
  );
}

function DrugView({
  drug,
  population,
  band,
  onBand,
}: {
  drug: FormularyDrug;
  population: Population | null;
  band: string | null;
  onBand: (b: string) => void;
}) {
  const aka = alsoKnownAs(drug);
  const cpgHref = cpgViewerHref({ code: "Formulary", page: drug.pages.start });

  return (
    <>
      {/* Drug title */}
      <section className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="text-2xl font-black leading-tight text-white">{drug.name}</h2>
          <p className="text-sm text-slate-400">
            {aka && aka.toLowerCase() !== drug.name.toLowerCase() ? `${aka} · ` : ""}
            {drug.class}
          </p>
        </div>
        <Link
          href={cpgHref}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-200 hover:border-slate-500"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          CPG p.{drug.pages.start}
        </Link>
      </section>

      {/* Dosing — the priority */}
      {population ? (
        <Dosing drug={drug} population={population} />
      ) : (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm font-semibold text-amber-200">
          Choose Adult or Paediatric above to see the dose.
        </div>
      )}

      {population === "paediatric" && drug.dosing.paediatric && drug.paediatricTables.length > 0 && (
        <PaedsTables drug={drug} band={band} onBand={onBand} />
      )}

      {/* Everything else */}
      <InfoCard title="Indications" items={drug.indications} />
      <InfoCard title="Contraindications" items={drug.contraindications} tone="rose" />
      <InfoCard title="Precautions" items={drug.precautions} tone="amber" />
      <InfoCard title="Special notes" items={drug.specialNotes} tone="sky" />
      <InfoCard title="Side effects" items={drug.sideEffects} />

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Routes</h3>
        <ul className="flex flex-wrap gap-2">
          {drug.routes.map((r) => (
            <li key={r} className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm text-slate-200">
              {r}
            </li>
          ))}
        </ul>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {(
            [
              ["Onset", drug.pharmacokinetics.onset],
              ["Duration", drug.pharmacokinetics.duration],
              ["Half-life", drug.pharmacokinetics.halfLife],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-800 px-2 py-2">
              <dt className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-100">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Privileges drug={drug} />

      <details className="group rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-400">
          Action &amp; metabolism
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-2 space-y-3 text-sm leading-6 text-slate-300">
          <p>
            <span className="font-semibold text-slate-100">Action. </span>
            {drug.action}
          </p>
          <p>
            <span className="font-semibold text-slate-100">Metabolism. </span>
            {drug.metabolism}
          </p>
        </div>
      </details>

      <p className="px-1 pb-2 text-xs leading-5 text-slate-500">
        {FORMULARY_EDITION.label} formulary, p.{drug.pages.start}–{drug.pages.end}, shown as printed. A
        condition CPG may give a specific dose for that condition, so check the relevant CPG. Give only
        what your privileging level allows.
      </p>
    </>
  );
}

function Dosing({ drug, population }: { drug: FormularyDrug; population: Population }) {
  const groups = dosingFor(drug, population);
  const other: Population = population === "adult" ? "paediatric" : "adult";
  const popLabel = population === "adult" ? "Adult" : "Paediatric";

  if (!groups) {
    return (
      <div className="flex gap-3 rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
        <div className="text-sm text-amber-100">
          <p className="font-bold">No {popLabel.toLowerCase()} dosing in the CPG formulary for {drug.name}.</p>
          {dosingFor(drug, other) && (
            <p className="mt-1 text-amber-200/90">
              The formulary lists {other === "adult" ? "adult" : "paediatric"} dosing only. Check the
              contraindications below.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label={`${popLabel} dosing`}
      className="overflow-hidden rounded-2xl border-2 border-emerald-500/60 bg-slate-900"
    >
      <div className="flex items-center justify-between gap-2 bg-emerald-500/15 px-4 py-2.5">
        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-300">
          {drug.dosing.shared ? "Adult & paediatric dosing" : `${popLabel} dosing`}
        </h3>
        <span className="text-xs font-semibold text-emerald-300/80">CPG p.{groups[0].rows[0]?.page}</span>
      </div>
      <div className="divide-y divide-slate-800">
        {groups.map((g, gi) => (
          <div key={`${g.indication}-${gi}`} className="px-4 py-3">
            {g.indication && <h4 className="mb-2 text-base font-bold text-slate-50">{g.indication}</h4>}
            <ul className="space-y-2.5">
              {g.rows.map((r, ri) => (
                <DoseLine
                  key={`${r.route}-${ri}`}
                  row={r}
                  flag={sourceFlag(drug, population, g.indication, r.route)?.note}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// A line that states an amount: "300mg …", "≥65 years …", "Light sedation: 0.5mg/kg", "Infant: 7.5mg/kg"
const AMOUNT_LINE = /^(\d|[<>≤≥]|[A-Z][a-z]+( sedation)?: \d)/;

function DoseLine({ row, flag }: { row: DoseRow; flag?: string }) {
  const lines = row.dose.split("\n");
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex h-fit min-w-[4.5rem] shrink-0 justify-center rounded-md bg-slate-800 px-2 py-1 text-xs font-bold tracking-wide text-emerald-200 ring-1 ring-slate-700">
        {row.route}
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        {lines.map((line, i) =>
          i === 0 || AMOUNT_LINE.test(line) ? (
            <p key={i} className="text-lg font-bold leading-snug text-white">
              {line}
            </p>
          ) : (
            <p key={i} className="text-sm leading-snug text-slate-300">
              {line}
            </p>
          ),
        )}
        {flag && (
          <p className="mt-1.5 flex gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-2.5 py-1.5 text-xs leading-5 text-amber-100">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />
            <span>
              <span className="font-bold">CPG text inconsistency. </span>
              {flag}
            </span>
          </p>
        )}
      </div>
    </li>
  );
}

function PaedsTables({ drug, band, onBand }: { drug: FormularyDrug; band: string | null; onBand: (b: string) => void }) {
  // Bands come from the drug's first table; later tables (Fentanyl, Ketamine) use the same bands.
  const bands = drug.paediatricTables[0].rows;
  const active = band && bands.some((r) => bandKey(r) === band) ? band : null;
  const resultsRef = useRef<HTMLDivElement>(null);
  const pick = (key: string) => {
    onBand(key);
    // The band's doses render under the 11 chips, below the fold on a phone
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <section aria-label="Paediatric dosing table" className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Dose by age / weight</h3>
        <span className="text-xs text-slate-500">CPG p.{drug.paediatricTables[0].page}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {bands.map((r) => {
          const key = bandKey(r);
          const on = active === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => pick(key)}
              className={`flex min-h-12 flex-col items-center justify-center rounded-xl border px-2 py-1.5 text-center transition-colors ${
                on
                  ? "border-amber-400 bg-amber-400 text-slate-950"
                  : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500"
              }`}
            >
              <span className="text-sm font-bold leading-tight">{r.age}</span>
              {r.weight && <span className={`text-xs ${on ? "text-slate-900" : "text-slate-400"}`}>{r.weight}</span>}
            </button>
          );
        })}
      </div>

      {!active ? (
        <p className="mt-3 text-sm text-slate-400">Select the child&apos;s age or weight band.</p>
      ) : (
        <div ref={resultsRef} className="mt-4 scroll-mt-24 space-y-4">
          {drug.paediatricTables.map((t, ti) => {
            const row = t.rows.find((r) => bandKey(r) === active);
            const groups = row ? pairCells(row.cells) : [];
            const groupNames = [...new Set(groups.map((c) => c.group))];
            return (
              <div key={ti} className="space-y-3">
                {!row && (
                  <p className="text-sm text-slate-400">This band isn&apos;t listed in the CPG table (p.{t.page}).</p>
                )}
                {groupNames.map((name) => (
                  <div key={name} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                    <p className="text-sm font-bold text-slate-50">{name}</p>
                    <ul className="mt-2 space-y-2">
                      {groups
                        .filter((c) => c.group === name)
                        .map((c, i) => (
                          <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                            <span className="text-xs text-slate-400">{c.label || "Dose"}</span>
                            <span className="text-right">
                              <span className="text-lg font-bold text-white">{c.value}</span>
                              {c.volume && (
                                <span className="ml-2 text-lg font-bold text-emerald-300">{c.volume}</span>
                              )}
                            </span>
                          </li>
                        ))}
                    </ul>
                    {(t.groupNotes?.[name] ?? []).length > 0 && (
                      <ul className="mt-2 space-y-0.5 border-t border-slate-800 pt-2 text-xs leading-5 text-slate-400">
                        {t.groupNotes![name].map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {t.notes.length > 0 && (
                  <ul className="space-y-0.5 text-xs leading-5 text-amber-200">
                    {t.notes.map((n, i) => (
                      <li key={i}>{n.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const TONES = {
  slate: { border: "border-slate-800", title: "text-slate-400", dot: "bg-slate-500" },
  rose: { border: "border-rose-500/40", title: "text-rose-300", dot: "bg-rose-400" },
  amber: { border: "border-amber-500/40", title: "text-amber-300", dot: "bg-amber-400" },
  sky: { border: "border-sky-500/40", title: "text-sky-300", dot: "bg-sky-400" },
};

function InfoCard({ title, items, tone = "slate" }: { title: string; items: Bullet[]; tone?: keyof typeof TONES }) {
  if (!items.length) return null;
  const t = TONES[tone];
  return (
    <section className={`rounded-2xl border bg-slate-900 p-4 ${t.border}`}>
      <h3 className={`mb-2 text-xs font-semibold uppercase tracking-widest ${t.title}`}>{title}</h3>
      <ul className="space-y-1.5">
        {items.map((b, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-6 text-slate-200">
            <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${t.dot}`} aria-hidden />
            <div className="min-w-0">
              {b.text}
              {b.sub && (
                <ul className="mt-0.5 space-y-0.5 text-slate-300">
                  {b.sub.map((s, j) => (
                    <li key={j}>– {s}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Privileges({ drug }: { drug: FormularyDrug }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
        <ShieldCheck className="h-4 w-4" aria-hidden />
        Who can give it
      </h3>
      {drug.privileges.length === 0 ? (
        <p className="text-sm text-slate-300">
          Not listed in the CPG Medication Privileges table. Check your privileging letter.
        </p>
      ) : (
        <ul className="space-y-2">
          {drug.privileges.map((p) => (
            <li key={p.route ?? "all"} className="flex flex-wrap items-center gap-2">
              <span className="min-w-[3.5rem] text-sm font-semibold text-slate-200">{p.route ?? "All routes"}</span>
              {p.levels.map((l) => (
                <span
                  key={l}
                  title={PRIVILEGE_LEVELS[l].long}
                  className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-200 ring-1 ring-slate-700"
                >
                  L{l} {PRIVILEGE_LEVELS[l].short}
                </span>
              ))}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-slate-500">
        CPG Medication Privileges, p.{drug.privileges[0]?.page ?? 399}. L4 CCP · L3 AP · L2 reduced-scope AP · L1
        First Responder.
      </p>
    </section>
  );
}
