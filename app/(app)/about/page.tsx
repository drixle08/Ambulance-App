export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-8 pt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
        About this app
      </p>
      <h1 className="text-2xl font-semibold text-slate-100">
        Ambulance Paramedic Toolkit
      </h1>
      <p className="text-sm text-slate-300">
        Mobile-first PWA for ambulance crews. Dark-mode by default, designed for
        use in the back of the truck and during inter-facility transfers.
        Provides quick calculators, assessment aids and reference cards
        aligned with HMCAS Clinical Practice Guideline v2.4 (2025).
      </p>
      <section className="space-y-2 text-xs text-slate-300">
        <p>
          This toolkit is a teaching and decision-support aid for HMCAS-style
          ambulance practice. It mirrors wording and thresholds from CPG v2.4
          where possible.
        </p>
        <p>
          It does not replace the official guidelines, Clinical Coordination,
          or local protocols. Always confirm doses, ranges and pathways against
          the current CPG and local policies.
        </p>
      </section>
    </main>
  );
}
