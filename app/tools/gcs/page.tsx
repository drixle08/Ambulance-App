"use client";

import Link from "next/link";
import { useState } from "react";

type GcsOption = {
  label: string;
  value: number;
  helper?: string;
};

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function GcsPage() {
  // Start at a fully alert patient by default (E4 V5 M6 = 15)
  const [eye, setEye] = useState<number>(4);
  const [verbal, setVerbal] = useState<number>(5);
  const [motor, setMotor] = useState<number>(6);

  const total = eye + verbal + motor;

  // Severity bands: 13–15 mild, 9–12 moderate, 3–8 severe
  let severityLabel = "Mild (13–15)";
  let severityExplain =
    "Consistent with a mild head injury or normal consciousness. Continue full assessment and monitoring.";
  let severityColor =
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-50";

  if (total >= 9 && total <= 12) {
    severityLabel = "Moderate (9–12)";
    severityExplain =
      "Moderate impairment of consciousness. Requires close observation, airway vigilance and urgent transport.";
    severityColor =
      "border-amber-500/40 bg-amber-500/10 text-amber-50";
  } else if (total <= 8) {
    severityLabel = "Severe (3–8)";
    severityExplain =
      "Severe impairment of consciousness. Treat as time-critical; airway protection and rapid transport are priorities.";
    severityColor =
      "border-red-500/60 bg-red-500/12 text-red-50";
  }

  const eyeOptions: GcsOption[] = [
    { label: "4 – Spontaneous", value: 4, helper: "Opens eyes without stimulus." },
    { label: "3 – To speech", value: 3, helper: "Opens eyes when spoken to." },
    { label: "2 – To pain", value: 2, helper: "Opens eyes only to painful stimulus." },
    { label: "1 – No eye opening", value: 1, helper: "No response." },
  ];

  const verbalOptions: GcsOption[] = [
    { label: "5 – Oriented", value: 5, helper: "Converses normally, oriented." },
    { label: "4 – Confused", value: 4, helper: "Converses but disoriented or confused." },
    { label: "3 – Inappropriate words", value: 3, helper: "Random or exclamatory speech." },
    { label: "2 – Incomprehensible sounds", value: 2, helper: "Moans or groans only." },
    { label: "1 – No verbal response", value: 1, helper: "No sounds." },
  ];

  const motorOptions: GcsOption[] = [
    { label: "6 – Obeys commands", value: 6, helper: "Performs simple requested movements." },
    { label: "5 – Localises pain", value: 5, helper: "Purposeful movement towards painful stimulus." },
    { label: "4 – Withdraws from pain", value: 4, helper: "Pulls away from painful stimulus." },
    { label: "3 – Abnormal flexion", value: 3, helper: "Decorticate posturing to pain." },
    { label: "2 – Extension", value: 2, helper: "Decerebrate posturing to pain." },
    { label: "1 – No motor response", value: 1, helper: "No movement." },
  ];

  const resetAll = () => {
    setEye(4);
    setVerbal(5);
    setMotor(6);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-medium text-slate-400 hover:text-emerald-400"
          >
            ← Back to dashboard
          </Link>

          <button
            type="button"
            onClick={resetAll}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80 transition flex items-center gap-1.5"
          >
            ⟳ Reset to 15
          </button>
        </div>

        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            Assessment
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Glasgow Coma Scale (GCS)
          </h1>
          <p className="text-sm text-slate-400">
            Select the most appropriate eye, verbal and motor responses. The tool
            will calculate the total GCS and show a severity band. Always
            interpret in context (e.g. intoxication, sedation, intubation) and
            follow your local CPG.
          </p>
        </header>

        {/* Summary card */}
        <section
          className={classNames(
            "rounded-2xl border px-5 py-4 text-sm shadow-sm",
            severityColor
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400/80">
                Total GCS
              </p>
              <p className="mt-1 text-3xl font-semibold">{total}</p>
              <p className="mt-1 text-xs text-slate-100">
                E{eye} V{verbal} M{motor}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400/80">
                Severity band
              </p>
              <p className="mt-1 text-base font-semibold">{severityLabel}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-100">{severityExplain}</p>

          <p className="mt-3 text-[11px] text-slate-300">
            Consider repeating GCS over time and documenting trends, particularly
            in head injury or stroke. In intubated/sedated patients, record{" "}
            <span className="font-semibold">“T”</span> or relevant notation for the
            verbal component as per your documentation standard.
          </p>
        </section>

        {/* Inputs */}
        <section className="grid gap-4 md:grid-cols-3">
          <GcsFieldGroup
            title="Eye opening (E)"
            options={eyeOptions}
            value={eye}
            onChange={setEye}
          />
          <GcsFieldGroup
            title="Verbal response (V)"
            options={verbalOptions}
            value={verbal}
            onChange={setVerbal}
          />
          <GcsFieldGroup
            title="Motor response (M)"
            options={motorOptions}
            value={motor}
            onChange={setMotor}
          />
        </section>

        <p className="pt-2 text-[11px] text-slate-500">
          This GCS tool is for education and decision-support only and must be
          used with your ambulance service guidelines and clinical judgement.
        </p>
      </div>
    </main>
  );
}

type GcsFieldGroupProps = {
  title: string;
  options: GcsOption[];
  value: number;
  onChange: (v: number) => void;
};

function GcsFieldGroup({ title, options, value, onChange }: GcsFieldGroupProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-50">{title}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.value)}
              className={classNames(
                "w-full rounded-xl border px-3 py-2 text-xs text-left transition",
                "border-slate-700 bg-slate-950 hover:border-emerald-400/70 hover:bg-slate-900",
                isActive &&
                  "border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow-sm"
              )}
            >
              <span className="block font-medium">{opt.label}</span>
              {opt.helper && (
                <span className="mt-0.5 block text-[10px] text-slate-400">
                  {opt.helper}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
