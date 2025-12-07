"use client";

import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";

type Step = {
  title: string;
  description: string;
};

type Section = {
  id: string;
  title: string;
  subtitle?: string;
  steps: Step[];
};

const ROSC_SECTIONS: Section[] = [
  {
    id: "immediate",
    title: "Immediate priorities after ROSC",
    subtitle:
      "Confirm ROSC, stabilise, and move from arrest algorithm to post–cardiac arrest care.",
    steps: [
      {
        title: "Confirm sustained ROSC",
        description:
          "Check for an organised rhythm with palpable pulse, rising/maintained blood pressure, and appropriate EtCO₂. Use clinical assessment and monitoring in line with CPG 2.6.",
      },
      {
        title: "Move to post-arrest phase",
        description:
          "Stop chest compressions once sustained ROSC is confirmed. Maintain airway, support breathing and circulation, and prepare for ongoing monitoring and transport or stay for 10 minutes as per cpg guideline.",
      },
      {
        title: "Reassess LOC ABC",
        description:
          "Perform a focused primary assessment (LOC, airway, breathing, circulation). Correct reversible causes and treat immediately life-threatening problems.",
      },
    ],
  },
  {
    id: "airway-breathing",
    title: "Airway & breathing",
    subtitle: "Support oxygenation and ventilation without hyperventilating.",
    steps: [
      {
        title: "Secure the airway",
        description:
          "Consider inserting an advanced airway if not already done during the arrest, where the airway is compromised or oxygenation/ventilation is suboptimal. Consider replacing an SGA with an ETT (age-dependent) as per CPG 2.6.",
      },
      {
        title: "Ventilate carefully",
        description:
          "Ensure adequate tidal volumes based on ideal body weight. Avoid hyperventilation. Use a controlled rate with appropriate inspiratory time and allow full exhalation.",
      },
      {
        title: "Accept higher EtCO₂ post-ROSC",
        description:
          "An elevated EtCO₂ is expected following ROSC. Do not attempt to fully normalise EtCO₂ prehospitally; this is corrected over time in hospital. Adjust ventilation based on lung pathology and the cause of arrest.",
      },
      {
        title: "Target oxygen saturation",
        description:
          "Aim to maintain SpO₂ > 90%. Avoid prolonged hypoxia or unnecessary hyperoxia. Titrate oxygen according to the relevant respiratory or cardiac CPG if there are special considerations.",
      },
    ],
  },
  {
    id: "circulation",
    title: "Circulation, blood pressure & fluids",
    subtitle: "Maintain perfusion pressure and treat the underlying cardiac cause.",
    steps: [
      {
        title: "12-lead ECG & cardiac cause",
        description:
          "Obtain a 12-lead ECG on all ROSC patients after a medical cardiac arrest, especially if a cardiac cause is suspected. If a pre-arrest ECG showed STEMI, transport to an appropriate PCI-capable facility as per CPG 2.6.",
      },
      {
        title: "Monitor BP & MAP frequently",
        description:
          "Monitor BP and MAP at least every 5 minutes. For adults, maintain SBP > 90 mmHg and MAP > 65 mmHg (or MAP 70–80 mmHg for isolated TBI). For paediatrics, maintain age-appropriate SBP using (age × 2) + 70 and avoid large BP spikes, especially in trauma.",
      },
      {
        title: "Use fluids judiciously",
        description:
          "Adults: give 250 mL IV boluses to a maximum of 1–2 L depending on the cause of arrest. In major haemorrhage, limit to a maximum of 1 L. Paediatrics: give 10–20 mL/kg bolus, which may be repeated once if required, according to CPG 2.6.",
      },
      {
        title: "Consider vasopressors/inotropes",
        description:
          "If hypotension persists despite fluids, consider vasopressor/inotrope support to maintain target MAP. Phenylephrine or noradrenaline may be considered for adults. Adrenaline infusions in adults are not for routine use and should follow CPG guidance.",
      },
    ],
  },
  {
    id: "neuro-transport",
    title: "Neurological care, temperature & transport",
    subtitle:
      "Protect the brain, control agitation/seizures, and choose the right destination.",
    steps: [
      {
        title: "Protect cerebral perfusion",
        description:
          "Avoid hypotension, hypoxia and extremes of CO₂, as these worsen neurological outcomes. In isolated TBI, favour the higher MAP target (70–80 mmHg) as per CPG 2.6.",
      },
      {
        title: "Manage agitation, pain & seizures",
        description:
          "Treat pain, agitation and seizures using the relevant CPGs (analgesia, sedation, seizure management). Avoid excessive movement and maintain cervical spine precautions where trauma is suspected.",
      },
      {
        title: "Temperature management",
        description:
          "Prevent hyperthermia and avoid unnecessary cooling outside CPG or receiving-facility protocols. Aim for normothermia during transport and handover.",
      },
      {
        title: "Plan destination & early transport",
        description:
          "Once stabilised, transport without delay to the most appropriate facility (e.g. PCI centre for STEMI, trauma centre for major trauma, or paediatric centre for children). Provide a structured handover highlighting pre-arrest status, arrest rhythm, downtime and ROSC times.",
      },
    ],
  },
];

export default function RoscPage() {
  const summaryText =
    "Post-ROSC care: airway secured, controlled ventilation avoiding hyperventilation, SpO₂ >90%, SBP >90 mmHg and MAP ≥65 mmHg (MAP 70–80 mmHg in isolated TBI; paeds SBP ≥70 + 2×age), adult fluids 250 mL boluses up to 1–2 L (≤1 L if major haemorrhage), paeds 10–20 mL/kg bolus repeated once if required, 12-lead ECG performed if cardiac cause suspected.";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-400 hover:text-emerald-400"
          >
            ← Back to dashboard
          </Link>

          <CopySummaryButton summaryText={summaryText} />
        </div>

        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Resuscitation
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Post Cardiac Arrest (ROSC) Care
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl">
            Diagram-style reference for post–cardiac arrest care based on HMCAS
            CPG 2.6 Post Cardiac Arrest (ROSC) Care. Focused on airway and
            ventilation strategy, blood pressure and MAP targets, fluids,
            vasopressors and transport decisions for both adults and
            paediatrics. Always confirm doses and decisions with the full CPG
            before clinical use.
          </p>
        </header>

        {/* Sections */}
        <section className="space-y-6">
          {ROSC_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs text-slate-400 mt-1">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {section.steps.map((step, index) => (
                  <StepRow
                    key={step.title}
                    index={index + 1}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        <p className="pt-2 text-[11px] text-slate-500 max-w-4xl">
          This tool is an educational summary of CPG 2.6 and does not replace
          the full guideline or clinical coordination. Always integrate ROSC
          care with the underlying cause of arrest and relevant CPGs (STEMI,
          trauma/TBI, respiratory, sepsis, paediatrics).
        </p>
      </div>
    </main>
  );
}

type StepRowProps = {
  index: number;
  title: string;
  description: string;
};

function StepRow({ index, title, description }: StepRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/60 text-xs font-semibold text-emerald-300">
        {index}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-50">{title}</p>
        <p className="text-xs text-slate-300">{description}</p>
      </div>
    </div>
  );
}
