"use client";

import Link from "next/link";
import { CopySummaryButton } from "@/app/_components/CopySummaryButton";
import {
  ArrowLeft,
  ShieldCheck,
  Wind,
  HeartPulse,
  Brain,
  Ambulance,
  Activity,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

type Step = { title: string; detail: string };

type Section = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "emerald" | "sky" | "rose" | "violet";
  steps: Step[];
};

const SECTIONS: Section[] = [
  {
    id: "immediate",
    title: "Immediate Priorities",
    subtitle: "Confirm ROSC, stop CPR, reassess",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "emerald",
    steps: [
      {
        title: "Confirm sustained ROSC",
        detail:
          "Organised rhythm with palpable pulse, rising or maintained BP, and appropriate EtCO₂. Use clinical assessment + monitoring per CPG 2.6.",
      },
      {
        title: "Move to post-arrest phase",
        detail:
          "Stop compressions once sustained ROSC confirmed. Maintain airway, support breathing and circulation. Remain on scene for 10 minutes or transport as per CPG.",
      },
      {
        title: "Reassess LOC — ABC",
        detail:
          "Focused primary assessment: level of consciousness, airway, breathing, circulation. Correct reversible causes and treat immediately life-threatening problems.",
      },
    ],
  },
  {
    id: "airway",
    title: "Airway & Breathing",
    subtitle: "Oxygenate without hyperventilating",
    icon: <Wind className="w-5 h-5" />,
    color: "sky",
    steps: [
      {
        title: "Secure the airway",
        detail:
          "Insert advanced airway if airway is compromised or oxygenation/ventilation suboptimal. Consider replacing SGA with ETT (age-dependent) as per CPG 2.6.",
      },
      {
        title: "Ventilate carefully — avoid hyperventilation",
        detail:
          "Adequate tidal volumes per ideal body weight. Controlled rate, appropriate inspiratory time, allow full exhalation. Avoid excessive bagging.",
      },
      {
        title: "Accept elevated EtCO₂ post-ROSC",
        detail:
          "Elevated EtCO₂ is expected after ROSC. Do not attempt to fully normalise it prehospitally — correct over time in hospital. Adjust for cause of arrest.",
      },
      {
        title: "Target SpO₂ > 90%",
        detail:
          "Avoid prolonged hypoxia and unnecessary hyperoxia. Titrate oxygen delivery. Follow respiratory or cardiac CPG if special considerations apply.",
      },
    ],
  },
  {
    id: "circulation",
    title: "Circulation, BP & Fluids",
    subtitle: "Maintain perfusion — treat underlying cause",
    icon: <HeartPulse className="w-5 h-5" />,
    color: "rose",
    steps: [
      {
        title: "12-lead ECG & cardiac cause",
        detail:
          "Obtain 12-lead ECG on all ROSC patients after medical cardiac arrest. If pre-arrest ECG showed STEMI, transport to PCI-capable facility per CPG 2.6.",
      },
      {
        title: "Monitor BP & MAP every 5 min",
        detail:
          "Adults: maintain SBP > 90 mmHg and MAP ≥ 65 mmHg (MAP 70–80 mmHg for isolated TBI). Paediatrics: SBP ≥ (age × 2) + 70 mmHg. Avoid large BP spikes in trauma.",
      },
      {
        title: "Fluids — use judiciously",
        detail:
          "Adults: 250 mL IV boluses up to 1–2 L (max 1 L in major haemorrhage). Paediatrics: 10–20 mL/kg bolus, may be repeated once if required, per CPG 2.6.",
      },
      {
        title: "Consider vasopressors if hypotension persists",
        detail:
          "If hypotension despite fluids, consider vasopressor/inotrope to maintain target MAP. Phenylephrine or noradrenaline for adults. Adrenaline infusions not routine — follow CPG guidance.",
      },
    ],
  },
  {
    id: "neuro",
    title: "Neuro, Temperature & Transport",
    subtitle: "Protect the brain — choose the right destination",
    icon: <Brain className="w-5 h-5" />,
    color: "violet",
    steps: [
      {
        title: "Protect cerebral perfusion",
        detail:
          "Avoid hypotension, hypoxia and extremes of CO₂ — all worsen neurological outcomes. For isolated TBI, target MAP 70–80 mmHg per CPG 2.6.",
      },
      {
        title: "Manage agitation, pain & seizures",
        detail:
          "Treat using relevant CPGs (analgesia, sedation, seizure management). Avoid excessive movement. Maintain cervical spine precautions where trauma is suspected.",
      },
      {
        title: "Temperature management",
        detail:
          "Prevent hyperthermia. Avoid unnecessary cooling outside CPG or receiving-facility protocols. Aim for normothermia during transport and handover.",
      },
      {
        title: "Plan destination — transport without delay",
        detail:
          "PCI centre for STEMI · Trauma centre for major trauma · Paediatric centre for children. Structured handover: pre-arrest status, arrest rhythm, downtime and ROSC times.",
      },
    ],
  },
];

const COLOR_STYLES = {
  emerald: {
    border: "border-emerald-900/60",
    header: "bg-emerald-950/50 border-b border-emerald-900/40",
    icon: "bg-emerald-900/50 text-emerald-400",
    accent: "text-emerald-400",
    dot: "bg-emerald-500/70",
    num: "bg-emerald-900/50 border-emerald-700/50 text-emerald-300",
  },
  sky: {
    border: "border-sky-900/60",
    header: "bg-sky-950/50 border-b border-sky-900/40",
    icon: "bg-sky-900/50 text-sky-400",
    accent: "text-sky-400",
    dot: "bg-sky-500/70",
    num: "bg-sky-900/50 border-sky-700/50 text-sky-300",
  },
  rose: {
    border: "border-rose-900/60",
    header: "bg-rose-950/50 border-b border-rose-900/40",
    icon: "bg-rose-900/50 text-rose-400",
    accent: "text-rose-400",
    dot: "bg-rose-500/70",
    num: "bg-rose-900/50 border-rose-700/50 text-rose-300",
  },
  violet: {
    border: "border-violet-900/60",
    header: "bg-violet-950/50 border-b border-violet-900/40",
    icon: "bg-violet-900/50 text-violet-400",
    accent: "text-violet-400",
    dot: "bg-violet-500/70",
    num: "bg-violet-900/50 border-violet-700/50 text-violet-300",
  },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RoscPage() {
  const summaryText =
    "Post-ROSC care: confirm ROSC, stop CPR, reassess ABC. Airway secured, controlled ventilation avoiding hyperventilation, SpO₂ > 90%. Adults: SBP > 90 mmHg, MAP ≥ 65 mmHg (70–80 for TBI); fluids 250 mL boluses up to 1–2 L (≤1 L if major haemorrhage). Paeds: SBP ≥ (age×2)+70; 10–20 mL/kg bolus once if required. 12-lead ECG if cardiac cause. Transport to PCI centre for STEMI, trauma centre for trauma, paeds centre for children.";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-8">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/resuscitation"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
              Resuscitation
            </p>
            <h1 className="text-base font-bold text-white leading-tight">
              Post Cardiac Arrest (ROSC) Care
            </h1>
          </div>
          <CopySummaryButton summaryText={summaryText} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-4 space-y-4">
        {/* ── Key Targets Bar ── */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Key Targets
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <TargetChip label="SpO₂" value="> 90%" color="sky" />
            <TargetChip label="Adult SBP" value="> 90 mmHg" color="rose" />
            <TargetChip label="Adult MAP" value="≥ 65 mmHg" color="rose" />
            <TargetChip label="TBI MAP" value="70–80 mmHg" color="amber" />
          </div>
          <p className="mt-2 text-[10px] text-slate-600">
            Paeds SBP ≥ (age × 2) + 70 mmHg · Adults: 250 mL fluid boluses up
            to 1–2 L · Paeds: 10–20 mL/kg bolus
          </p>
        </section>

        {/* ── Sections ── */}
        {SECTIONS.map((section) => {
          const s = COLOR_STYLES[section.color];
          return (
            <section
              key={section.id}
              className={`rounded-2xl border ${s.border} bg-slate-900 overflow-hidden`}
            >
              {/* Section header */}
              <div className={`flex items-center gap-3 px-4 py-3 ${s.header}`}>
                <div
                  className={`w-8 h-8 rounded-lg ${s.icon} flex items-center justify-center flex-shrink-0`}
                >
                  {section.icon}
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${s.accent}`}>
                    {section.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{section.subtitle}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="p-3 space-y-2">
                {section.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-xl bg-slate-800 p-3"
                  >
                    <div
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${s.num}`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white leading-snug">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* ── Transport Reminder ── */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-900/50 bg-amber-950/30 p-3">
          <Ambulance className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300">
            <span className="font-semibold">Transport to the right destination:</span>{" "}
            PCI centre for STEMI · Trauma centre for major trauma · Paediatric
            centre for children. Structured handover with pre-arrest status,
            rhythm, downtime and ROSC times.
          </p>
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-[11px] text-slate-600 pb-2">
          Summary of CPG 2.6 — not a replacement for the full guideline or
          clinical coordination. Integrate with underlying cause of arrest and
          relevant CPGs (STEMI, trauma/TBI, respiratory, sepsis, paediatrics).
        </p>
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type TargetChipProps = {
  label: string;
  value: string;
  color: "sky" | "rose" | "amber" | "emerald";
};

const CHIP_STYLES = {
  sky: "border-sky-900/60 bg-sky-950/40 text-sky-300",
  rose: "border-rose-900/60 bg-rose-950/40 text-rose-300",
  amber: "border-amber-900/60 bg-amber-950/40 text-amber-300",
  emerald: "border-emerald-900/60 bg-emerald-950/40 text-emerald-300",
};

function TargetChip({ label, value, color }: TargetChipProps) {
  return (
    <div className={`rounded-xl border p-2.5 ${CHIP_STYLES[color]}`}>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">
        {label}
      </p>
      <p className="text-sm font-bold mt-1 leading-none">{value}</p>
    </div>
  );
}
