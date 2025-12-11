export type Tool = {
  name: string;
  href: string;
  tagline: string;
  meta?: string;
};

export type ToolGroup = {
  title: string;
  slug: string;
  description: string;
  tools: Tool[];
};

export const TOOL_GROUPS: ToolGroup[] = [
  {
    title: "Trauma",
    slug: "trauma",
    description:
      "Trauma assessment and destination decision support, including bypass criteria aligned to CPG 10.10.",
    tools: [
      {
        name: "Trauma Bypass Criteria",
        href: "/tools/trauma-bypass",
        tagline: "Mechanism, vitals, anatomic injury, and special consideration checklist for major trauma.",
        meta: "CPG 10.10",
      },
      {
        name: "Burn Surface Area Calculator",
        href: "/tools/burns",
        tagline: "Rule of Nines / paediatric adjustments with CPG 10.9 burn thresholds.",
        meta: "CPG 10.9 Burns",
      },
    ],
  },
  {
    title: "Resuscitation",
    slug: "resuscitation",
    description:
      "Adult and paediatric cardiac arrest tools aligned with the updated single-shock arrest algorithms and post-ROSC care.",
    tools: [
      {
        name: "Emergency Resuscitation Timer",
        href: "/tools/resus-timer",
        tagline: "2-minute cycles with CPR metronome and event logging.",
        meta: "CPR workflow",
      },
      {
        name: "Adult Cardiac Arrest (Unwitnessed)",
        href: "/tools/adult-arrest",
        tagline:
          "Updated single-shock algorithm for adult unwitnessed cardiac arrest in the field.",
        meta: "CPG 2.x Adult arrest",
      },
      {
        name: "Adult Cardiac Arrest - Witnessed",
        href: "/tools/witnessed-adult-arrest",
        tagline:
          "Witnessed arrest during transport/care with AP pads; crew configuration flow lanes.",
        meta: "CPG 2.x Adult arrest",
      },
      {
        name: "Paediatric Arrest (WAAFELSS)",
        href: "/tools/peds-arrest",
        tagline:
          "Age/weight-based drugs, shocks, and fluids for paediatric cardiac arrest.",
        meta: "CPG 2.x Paeds arrest",
      },
      {
        name: "Paediatric Arrest Algorithm",
        href: "/tools/peds-arrest-algorithm",
        tagline:
          "Diagram-style paediatric arrest algorithm with shockable/non-shockable branches.",
        meta: "CPG 2.x Paeds arrest",
      },
      {
        name: "Post-Cardiac Arrest (ROSC) Care",
        href: "/tools/rosc",
        tagline:
          "Airway, ventilation, blood pressure targets and transport priorities after ROSC.",
        meta: "CPG 2.6 ROSC",
      },
      {
        name: "ECMO / ECPR Criteria",
        href: "/tools/ecmo-criteria",
        tagline:
          "Field triggers for considering ECMO/ECPR and discussing with an ECMO centre.",
        meta: "CPG ECMO / ECPR",
      },
    ],
  },
  {
    title: "Respiratory & Paediatric Airway",
    slug: "respiratory-airway",
    description:
      "Respiratory severity and paediatric airway assessment aligned to CPG wording.",
    tools: [
      {
        name: "Asthma Severity (Adult + Paeds)",
        href: "/tools/asthma",
        tagline:
          "Unified asthma severity assessment that auto-selects adult vs paediatric thresholds.",
        meta: "CPG Asthma",
      },
      {
        name: "MWCS - Croup",
        href: "/tools/mwcs",
        tagline:
          "Modified Westley Croup Score with severity bands and management hints.",
        meta: "CPG Croup",
      },
    ],
  },
  {
    title: "Assessment & Screening",
    slug: "assessment-screening",
    description:
      "Neurological and global assessment tools ready to paste into your PRF/ePCR.",
    tools: [
      {
        name: "Stroke BEFAST",
        href: "/tools/stroke",
        tagline:
          "BEFAST stroke screen with onset bands and transport priority guidance.",
        meta: "CPG Stroke",
      },
      {
        name: "Glasgow Coma Scale (Adult + Paeds)",
        href: "/tools/gcs",
        tagline:
          "Adult and paediatric GCS with a single-line summary for documentation.",
        meta: "Neuro assessment",
      },
    ],
  },
  {
    title: "Reference",
    slug: "reference",
    description:
      "Quick reference cards that support primary and secondary survey decisions.",
    tools: [
      {
        name: "Normal Vitals by Age",
        href: "/tools/vitals",
        tagline:
          "Normal ranges and red-flag values for adult and paediatric patients.",
        meta: "CPG Reference",
      },
      {
        name: "CPG v2.4 (2025) PDF",
        href: "/reference/cpg/cpg-v2.4-2025.pdf",
        tagline: "Full guideline for reference (opens PDF).",
        meta: "Reference",
      },
      {
        name: "Shock Index",
        href: "/tools/shock-index",
        tagline: "Rapid SI check with sepsis/shock prompts.",
        meta: "Reference - Time-critical",
      },
    ],
  },
];
