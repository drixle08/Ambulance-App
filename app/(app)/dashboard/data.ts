export type Tool = {
  name: string;
  href: string;
  tagline: string;
  meta?: string;
  icon: string;
};

export type ToolGroup = {
  title: string;
  shortTitle?: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tools: Tool[];
};

export const TOOL_GROUPS: ToolGroup[] = [
  {
    title: "Trauma",
    slug: "trauma",
    description: "Bypass criteria and burn surface area assessment.",
    icon: "ShieldAlert",
    color: "orange",
    tools: [
      {
        name: "Trauma Bypass Criteria",
        href: "/tools/trauma-bypass",
        tagline: "Mechanism, vitals, anatomic injury, and special consideration checklist for major trauma.",
        meta: "CPG 10.10",
        icon: "Shield",
      },
      {
        name: "Burn Surface Area Calculator",
        href: "/tools/burns",
        tagline: "Rule of Nines / paediatric adjustments with CPG 10.9 burn thresholds.",
        meta: "CPG 10.9 Burns",
        icon: "Flame",
      },
    ],
  },
  {
    title: "Resuscitation",
    slug: "resuscitation",
    description: "Cardiac arrest algorithms and post-ROSC care.",
    icon: "HeartPulse",
    color: "red",
    tools: [
      {
        name: "Emergency Resuscitation Timer",
        href: "/tools/resus-timer",
        tagline: "2-minute cycles with CPR metronome and event logging.",
        meta: "CPR workflow",
        icon: "Timer",
      },
      {
        name: "Adult Cardiac Arrest (Unwitnessed)",
        href: "/tools/adult-arrest",
        tagline: "Updated single-shock algorithm for adult unwitnessed cardiac arrest in the field.",
        meta: "CPG 2.x Adult arrest",
        icon: "HeartOff",
      },
      {
        name: "Adult Cardiac Arrest - Witnessed",
        href: "/tools/witnessed-adult-arrest",
        tagline: "Witnessed arrest during transport/care with AP pads; crew configuration flow lanes.",
        meta: "CPG 2.x Adult arrest",
        icon: "Eye",
      },
      {
        name: "Paediatric Arrest (WAAFELSS)",
        href: "/tools/peds-arrest",
        tagline: "Age/weight-based drugs, shocks, and fluids for paediatric cardiac arrest.",
        meta: "CPG 2.x Paeds arrest",
        icon: "Baby",
      },
      {
        name: "Paediatric Arrest Algorithm",
        href: "/tools/peds-arrest-algorithm",
        tagline: "Diagram-style paediatric arrest algorithm with shockable/non-shockable branches.",
        meta: "CPG 2.x Paeds arrest",
        icon: "GitBranch",
      },
      {
        name: "Post-Cardiac Arrest (ROSC) Care",
        href: "/tools/rosc",
        tagline: "Airway, ventilation, blood pressure targets and transport priorities after ROSC.",
        meta: "CPG 2.6 ROSC",
        icon: "TrendingUp",
      },
      {
        name: "ECMO / ECPR Criteria",
        href: "/tools/ecmo-criteria",
        tagline: "Field triggers for considering ECMO/ECPR and discussing with an ECMO centre.",
        meta: "CPG ECMO / ECPR",
        icon: "Syringe",
      },
    ],
  },
  {
    title: "Respiratory & Paediatric Airway",
    shortTitle: "Respiratory",
    slug: "respiratory-airway",
    description: "Asthma severity and croup scoring tools.",
    icon: "Wind",
    color: "sky",
    tools: [
      {
        name: "Asthma Severity (Adult + Paeds)",
        href: "/tools/asthma",
        tagline: "Unified asthma severity assessment that auto-selects adult vs paediatric thresholds.",
        meta: "CPG Asthma",
        icon: "Wind",
      },
      {
        name: "MWCS - Croup",
        href: "/tools/mwcs",
        tagline: "Modified Westley Croup Score with severity bands and management hints.",
        meta: "CPG Croup",
        icon: "Stethoscope",
      },
    ],
  },
  {
    title: "Assessment & Screening",
    shortTitle: "Assessment",
    slug: "assessment-screening",
    description: "Neurological and global assessment tools.",
    icon: "Brain",
    color: "violet",
    tools: [
      {
        name: "Stroke BEFAST",
        href: "/tools/stroke",
        tagline: "BEFAST stroke screen with onset bands and transport priority guidance.",
        meta: "CPG Stroke",
        icon: "Brain",
      },
      {
        name: "Glasgow Coma Scale (Adult + Paeds)",
        href: "/tools/gcs",
        tagline: "Adult and paediatric GCS with a single-line summary for documentation.",
        meta: "Neuro assessment",
        icon: "ClipboardList",
      },
      {
        name: "Sedation Assessment (RASS)",
        href: "/tools/rass",
        tagline: "Richmond Agitation-Sedation Scale with guided assessment, clinical targets, and zone-based management guidance.",
        meta: "Sedation / CCA",
        icon: "Activity",
      },
    ],
  },
  {
    title: "CCP / CCA",
    slug: "ccp-cca",
    description: "Critical care paramedic and critical care assistant clinical tools.",
    icon: "Activity",
    color: "teal",
    tools: [
      {
        name: "Care Bundles",
        href: "/tools/care-bundles",
        tagline: "Interactive checklist for APO, Critical, Sedated, Anaphylaxis, Asthma, COVID-19, Trauma, STEMI, and Stroke care bundles.",
        meta: "CCA Handbook",
        icon: "ClipboardCheck",
      },
      {
        name: "Drug Infusion Calculator",
        href: "/tools/drug-calculator",
        tagline: "Flow rate, draw-up volume and mixing guide for Adrenaline, Amiodarone, Fentanyl, GTN, Ketamine, MgSO4, Noradrenaline, Phenylephrine and TXA.",
        meta: "CCA Handbook / Medical Math",
        icon: "FlaskConical",
      },
    ],
  },
  {
    title: "Reference",
    slug: "reference",
    description: "Vitals, CPG guidelines, and quick calculators.",
    icon: "BookOpen",
    color: "amber",
    tools: [
      {
        name: "Normal Vitals by Age",
        href: "/tools/vitals",
        tagline: "Normal ranges and red-flag values for adult and paediatric patients.",
        meta: "CPG Reference",
        icon: "Gauge",
      },
      {
        name: "CPG v2.4 (2025) PDF",
        href: "/reference/cpg/cpg-v2.4-2025.pdf",
        tagline: "Full guideline for reference (opens PDF).",
        meta: "Reference",
        icon: "FileText",
      },
      {
        name: "Clinical Assistant (beta)",
        href: "/tools/cpg-chat",
        tagline: "Ask CPG or SOP questions — AI answers with direct page references.",
        meta: "CPG + SOP",
        icon: "MessageCircle",
      },
      {
        name: "Shock Index",
        href: "/tools/shock-index",
        tagline: "Rapid SI check with sepsis/shock prompts.",
        meta: "Reference - Time-critical",
        icon: "Zap",
      },
      {
        name: "Standard Operating Procedures",
        href: "/tools/sop",
        tagline: "HMCAS SOP document — browse and jump to any page in-app.",
        meta: "SOP 2025",
        icon: "ClipboardCheck",
      },
    ],
  },
];
