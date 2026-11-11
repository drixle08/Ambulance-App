import { cpgRef, type CpgRef } from "./cpgProvenance";
import type { FormularyDrug, Population } from "./formulary";

/**
 * Rule (HMCAS practice): when the formulary and the CPG for the patient's
 * condition differ, follow the condition CPG.
 *
 * From a sweep of all 37 formulary drugs against every condition CPG in the pinned edition
 * (pp.1–294, including the image-only algorithm pages), approved 2026-11-11.
 * `lines` are the condition CPG's own wording; a leading label such as
 * "Severe (MWCS ≥ 8):" is the CPG's column/heading. Every `refs` quote is
 * checked against the shipped PDF text by `npm run cpg:reverify`.
 */


/** A condition CPG dose shown above a formulary indication, to follow instead of it. */
export type ConditionCpgDose = {
  drug: string;
  population: Population;
  /** Formulary indication headings it applies to, exactly as in lib/formulary.json. */
  indications: string[];
  /** When it applies to only part of the indication, e.g. "Cardiac arrest". */
  scope?: string;
  cpg: string;
  page: number;
  lines: string[];
  note?: string;
  /** Formulary rows that conflict get this pointer. */
  formularyRows?: { route: string; note: string }[];
  /** Paediatric dosing-table columns that conflict get this note. */
  tableGroups?: { group: string; note: string }[];
  refs: CpgRef[];
};

/** A condition CPG dose for a situation the formulary does not list separately. */
export type ConditionCpgExtra = {
  drug: string;
  population: Population;
  situation: string;
  cpg: string;
  page: number;
  lines: string[];
  note?: string;
  refs: CpgRef[];
};

/** A condition CPG instruction not to give the drug (applies to adult and paediatric). */
export type ConditionCpgWarning = { drug: string; cpg: string; page: number; text: string; refs: CpgRef[] };

const both = (entry: Omit<ConditionCpgDose, "population">): ConditionCpgDose[] => [
  { ...entry, population: "adult" },
  { ...entry, population: "paediatric" },
];

export const CONDITION_CPG_DOSES: ConditionCpgDose[] = [
  // ─── Resuscitation ─────────────────────────────────────────────────────────
  {
    drug: "amiodarone",
    population: "adult",
    indications: ["Cardiac Arrest"],
    cpg: "CPG 2.1 Adult Medical Cardiac Arrest",
    page: 35,
    lines: ["Amiodarone 300mg should be administered for the shockable rhythm after the 3rd shock, and 150mg after the 5th shock"],
    note: "Same in the algorithm (p.36) and CPG 2.2 Adult Trauma Cardiac Arrest (p.39).",
    formularyRows: [
      { route: "IV", note: "Give the 150 mg after the 5th shock (CPG 2.1), not the 4th." },
      { route: "IO", note: "Give the 150 mg after the 5th shock (CPG 2.1), not the 4th." },
    ],
    refs: [
      cpgRef("2.6", 35, "Amiodarone 300mg should be administered for the shockable rhythm after the 3rd shock, and 150mg after the 5th shock"),
      cpgRef("2.6", 39, "Amiodarone 300mg should be administered for the shockable rhythm after the 3rd shock, and 150mg after the 5th shock"),
    ],
  },
  {
    drug: "amiodarone",
    population: "paediatric",
    indications: ["Cardiac Arrest"],
    cpg: "CPG 2.3 Paediatric Medical Cardiac Arrest",
    page: 43,
    lines: [
      "Amiodarone 5mg/kg (max 300mg) should be administered for the shockable rhythm after the 3rd shock, and 5mg/kg (max 150mg) after the 5th shock",
    ],
    note: "Two doses. Same in CPG 2.4 Paediatric Trauma Cardiac Arrest (p.47).",
    formularyRows: [
      { route: "IV", note: "Two doses per CPG 2.3: the 2nd (after the 5th shock) is max 150 mg." },
      { route: "IO", note: "Two doses per CPG 2.3: the 2nd (after the 5th shock) is max 150 mg." },
    ],
    tableGroups: [
      { group: "VF/Pulseless VT", note: "CPG 2.3: 1st dose after the 3rd shock (max 300 mg); 2nd dose after the 5th shock, max 150 mg." },
    ],
    refs: [
      cpgRef("2.6", 43, "Amiodarone 5mg/kg (max 300mg) should be administered for the shockable rhythm after the 3rd shock, and 5mg/kg (max 150mg) after the 5th shock"),
      cpgRef("2.6", 47, "Amiodarone 5mg/kg (max 300mg) should be administered for the shockable rhythm after the 3rd shock, and 5mg/kg (max 150mg) after the 5th shock"),
    ],
  },
  {
    drug: "dextrose",
    population: "paediatric",
    indications: ["Hypoglycaemia"],
    scope: "Cardiac arrest",
    cpg: "CPG 2.3 Paediatric Medical Cardiac Arrest",
    page: 43,
    lines: ["Sugar: 2ml/kg of 10% Dextrose (0.2g/kg)"],
    note: "In paediatric cardiac arrest (also CPG 2.4, p.47). The other hypoglycaemia doses below are unchanged.",
    formularyRows: [
      { route: "IV", note: "In cardiac arrest give 2 ml/kg (CPG 2.3), not 2.5 ml/kg." },
      { route: "IO", note: "In cardiac arrest give 2 ml/kg (CPG 2.3), not 2.5 ml/kg." },
    ],
    tableGroups: [
      {
        group: "Hypoglycaemia in cardiac arrest & ROSC",
        note: "These volumes use 2.5 ml/kg. In cardiac arrest CPG 2.3 gives 2 ml/kg of 10% Dextrose.",
      },
    ],
    refs: [cpgRef("2.6", 43, "Sugar: 2ml/kg of 10% Dextrose (0.2g/kg)"), cpgRef("2.6", 47, "Sugar: 2ml/kg of 10% Dextrose (0.2g/kg)")],
  },

  // ─── Trauma ────────────────────────────────────────────────────────────────
  {
    drug: "tranexamic-acid",
    population: "adult",
    indications: ["Traumatic Brain Injury GCS ≤ 12"],
    cpg: "CPG 10.2 Traumatic Brain Injury",
    page: 175,
    lines: ["TXA 2g"],
    note: "Consider within the first 3 hours of injury, GCS ≤ 12.",
    formularyRows: [
      { route: "IV", note: "Formulary misprint: give the full 2 g as per CPG 10.2 (the IV/IO row adds 2 g to 100 ml NS)." },
    ],
    refs: [cpgRef("2.6", 175, "TXA 2g"), cpgRef("2.6", 174, "Consider TXA within first 3 hours of injury GCS ≤ 12")],
  },

  // ─── Adrenaline push dose (adult) ──────────────────────────────────────────
  {
    drug: "adrenaline",
    population: "adult",
    indications: ["Anaphylaxis"],
    cpg: "CPG 6.2 Anaphylaxis and Allergic Reactions",
    page: 116,
    lines: ["Adrenaline Push dose 20-50mcg"],
    formularyRows: [{ route: "IV/IO", note: "Adult push dose: 20–50 mcg per CPG 6.2." }],
    refs: [cpgRef("2.6", 116, "Adrenaline Push dose 20-50mcg")],
  },
  {
    drug: "adrenaline",
    population: "adult",
    indications: ["Severe Bronchoconstriction"],
    scope: "Severe asthma – unconscious",
    cpg: "CPG 5.1 Asthma",
    page: 91,
    lines: ["Adrenaline Push dose 20- 50mcg IV/IO"],
    formularyRows: [{ route: "IV/IO", note: "Adult push dose: 20–50 mcg per CPG 5.1." }],
    refs: [cpgRef("2.6", 91, "Adrenaline Push dose 20- 50mcg IV/IO")],
  },
  {
    drug: "adrenaline",
    population: "adult",
    indications: ["Bradycardia & Inotropic and Vasopressor Support"],
    cpg: "CPG 4.2 Bradyarrhythmias",
    page: 75,
    lines: ["Adrenaline push-dose 20- 50mcg in peri-arrest state"],
    note: "CPG 4.6 Cardiogenic Shock (p.84): Adrenaline push dose 20- 50mcg (in hypotensive bradycardic peri-arrest state).",
    formularyRows: [{ route: "IV/IO", note: "Adult push dose: 20–50 mcg per CPG 4.2 / 4.6." }],
    refs: [
      cpgRef("2.6", 75, "Adrenaline push-dose 20- 50mcg in peri-arrest state"),
      cpgRef("2.6", 84, "Adrenaline push dose 20- 50mcg (in hypotensive bradycardic peri-arrest state)"),
    ],
  },

  // ─── Toxicology ────────────────────────────────────────────────────────────
  {
    drug: "naloxone",
    population: "adult",
    indications: ["Opioid Overdose"],
    cpg: "CPG 8.6 Opioids",
    page: 150,
    lines: [
      "RR 6-10/min OR SpO2 86-92%: Naloxone 100- 200mcg IV every 60 seconds titrated to effect (max 2000mcg)",
      "IM/IN route may be considered if no IV access available",
      "RR ≤ 5/min OR SpO2 <85% (respiratory/peri-arrest): Naloxone 400mcg IV → 800mcg IV → 2000mcg IV, each after no response for 60 seconds",
    ],
    note: "Target RR >10/min. The formulary's max total of 10 mg and 2–3 minute interval do not apply.",
    formularyRows: [
      { route: "IV/IO", note: "Use the CPG 8.6 titration above (max 2000 mcg)." },
      { route: "IM", note: "Use the CPG 8.6 titration above (max 2000 mcg)." },
    ],
    refs: [
      cpgRef("2.6", 150, "Naloxone 100- 200mcg IV every 60 seconds titrated to effect (max 2000mcg)"),
      cpgRef("2.6", 150, "IM/IN route may be considered if no IV access available"),
      cpgRef("2.6", 150, "Naloxone 400mcg IV No response after 60 seconds"),
      cpgRef("2.6", 150, "Naloxone 800mcg IV"),
      cpgRef("2.6", 150, "Naloxone 2000mcg IV"),
    ],
  },
  {
    drug: "atropine",
    population: "adult",
    indications: ["Organophosphate Toxicity"],
    cpg: "CPG 8.7 Organophosphates",
    page: 152,
    lines: ["Atropine 1-2mg every 5 min as required until clinical condition improves"],
    formularyRows: [{ route: "IV/IO/IM", note: "CPG 8.7 gives 1–2 mg." }],
    refs: [cpgRef("2.6", 152, "Atropine 1-2mg every 5 min as required until clinical condition improves")],
  },
  {
    drug: "atropine",
    population: "adult",
    indications: ["Bradycardia"],
    scope: "Beta-blocker or calcium channel blocker toxicity",
    cpg: "CPG 8.2 Beta Blocker / CPG 8.3 Calcium Channel Blocker",
    page: 142,
    lines: ["Atropine Adult: 1mg … repeat as required if bradycardic"],
    note: "Same in CPG 8.3 (p.144).",
    refs: [
      cpgRef("2.6", 142, "Atropine Adult: 1mg; Paediatric: 0.05mg/kg (max 0.5mg) repeat as required if bradycardic"),
      cpgRef("2.6", 144, "Atropine Adult: 1mg; Paediatric: 0.05mg/kg (max 0.5mg) repeat as required if bradycardic"),
    ],
  },
  {
    drug: "atropine",
    population: "paediatric",
    indications: ["Bradycardia"],
    scope: "Beta-blocker or calcium channel blocker toxicity",
    cpg: "CPG 8.2 Beta Blocker / CPG 8.3 Calcium Channel Blocker",
    page: 142,
    lines: ["Atropine Paediatric: 0.05mg/kg (max 0.5mg) repeat as required if bradycardic"],
    note: "Same in CPG 8.3 (p.144).",
    refs: [
      cpgRef("2.6", 142, "Atropine Adult: 1mg; Paediatric: 0.05mg/kg (max 0.5mg) repeat as required if bradycardic"),
      cpgRef("2.6", 144, "Atropine Adult: 1mg; Paediatric: 0.05mg/kg (max 0.5mg) repeat as required if bradycardic"),
    ],
  },

  // ─── Sedation / RSI ────────────────────────────────────────────────────────
  ...both({
    drug: "ketamine",
    indications: ["Sedation"],
    scope: "Procedural sedation",
    cpg: "CPG 11.3 Procedural Sedation",
    page: 213,
    lines: [
      "Light sedation: 0.25-0.5mg/kg IV/IO or 1-2mg/kg IN/IM repeat as required",
      "Moderate sedation: 1-1.5mg/kg IV/IO or 2-4mg/kg IN/IM repeat as required every 5-10 minutes",
    ],
    refs: [
      cpgRef("2.6", 213, "Light sedation: 0.25-0.5mg/kg IV/IO or 1-2mg/kg IN/IM repeat as required"),
      cpgRef("2.6", 213, "Moderate sedation: 1-1.5mg/kg IV/IO or 2-4mg/kg IN/IM repeat as required every 5-10 minutes"),
    ],
  }),
  ...both({
    drug: "ketamine",
    indications: ["RSI"],
    scope: "Post-RSI sedation",
    cpg: "CPG 11.1 Rapid Sequence Induction",
    page: 208,
    lines: ["Ketamine: 0.25-0.5mg/kg bolus every 15 minutes OR infusion 0.01-0.05mg/kg/min"],
    formularyRows: [{ route: "IV/IO", note: "Post-RSI bolus: 0.25–0.5 mg/kg every 15 minutes (CPG 11.1)." }],
    refs: [cpgRef("2.6", 208, "Ketamine: 0.25-0.5mg/kg bolus every 15 minutes OR infusion 0.01-0.05mg/kg/min")],
  }),

  // ─── Cardiac / respiratory ─────────────────────────────────────────────────
  {
    drug: "glycerol-trinitrate",
    population: "adult",
    indications: ["Acute Pulmonary Oedema"],
    cpg: "CPG 4.5 Acute Pulmonary Oedema",
    page: 82,
    lines: [
      "GTN 2 sprays (0.8mg) if SBP > 150mmHg",
      "GTN S/L – 1-3 sprays (0.4-1.2mg) followed by 1 spray every 5 minutes until CPAP applied",
      "Normal to high BP: GTN Infusion (if no response to S/L GTN) – 100mcg/min",
      "High BP (SBP > 160mmHg): GTN Infusion – 100 - 300mcg/min. Adjust infusion based on the patients response",
      "SBP > 200mmHg – consider starting infusion at a higher dose of 400- 500mcg/min for ≈2 minutes and titrate down",
    ],
    formularyRows: [
      { route: "SL", note: "Repeat 1 spray every 5 minutes until CPAP is applied (CPG 4.5)." },
      { route: "IV/IO INF", note: "For high BP the CPG 4.5 rates above apply." },
    ],
    refs: [
      cpgRef("2.6", 82, "GTN 2 sprays (0.8mg) if SBP > 150mmHg"),
      cpgRef("2.6", 82, "GTN S/L – 1-3 sprays (0.4-1.2mg) followed by 1 spray every 5 minutes until CPAP applied"),
      cpgRef("2.6", 82, "GTN Infusion (if no response to S/L GTN) – 100mcg/min"),
      cpgRef("2.6", 82, "GTN Infusion – 100 - 300mcg/min. Adjust infusion based on the patients response"),
      cpgRef("2.6", 82, "SBP > 200mmHg – consider starting infusion at a higher dose of 400- 500mcg/min for ≈2 minutes and titrate down"),
    ],
  },
  {
    drug: "magnesium-sulphate",
    population: "adult",
    indications: ["Severe asthma/Torsade’s de pointes"],
    scope: "Asthma",
    cpg: "CPG 5.1 Asthma",
    page: 91,
    lines: [
      "Moderate: Magnesium 1-2g IV (consider if no response to other therapy)",
      "Severe: Magnesium 1-2g IV",
    ],
    note: "For Torsade’s de pointes the formulary dose below applies (CPG 4.3: Magnesium 2g).",
    refs: [
      cpgRef("2.6", 91, "Magnesium 1-2g IV (consider if no response to other therapy)"),
      cpgRef("2.6", 91, "Magnesium 1-2g IV"),
      cpgRef("2.6", 77, "Magnesium 2g (Torsades de Pointes only)"),
    ],
  },
  {
    drug: "salbutamol",
    population: "paediatric",
    indications: ["Bronchoconstriction"],
    scope: "Anaphylaxis",
    cpg: "CPG 6.2 Anaphylaxis and Allergic Reactions",
    page: 116,
    lines: ["Salbutamol Neb 2.5mg repeat as required"],
    refs: [cpgRef("2.6", 116, "Salbutamol Neb 2.5mg repeat as required")],
  },
  {
    drug: "ipratropium-bromide",
    population: "paediatric",
    indications: ["Bronchoconstriction"],
    scope: "Anaphylaxis",
    cpg: "CPG 6.2 Anaphylaxis and Allergic Reactions",
    page: 116,
    lines: ["Ipratropium Bromide Neb 0.25mg"],
    refs: [cpgRef("2.6", 116, "Ipratropium Bromide Neb 0.25mg")],
  },
  {
    drug: "dexamethasone",
    population: "adult",
    indications: ["Confirmed/suspected COVID-19"],
    cpg: "CPG 17.1 Respiratory Distress/Hypoxaemia in COVID-19",
    page: 293,
    lines: [
      "Dexamethasone 6mg IV (Adults ≥18 years only) for any patient placed on CPAP or who requires supplemental oxygen to maintain SpO2 > 93% (unless already administered in a healthcare facility).",
      "IM or oral route may be used if IV access not available.",
    ],
    refs: [
      cpgRef("2.6", 293, "Dexamethasone 6mg IV (Adults ≥18 years only) for any patient placed on CPAP or who requires supplemental oxygen to maintain SpO2 > 93% (unless already administered in a healthcare facility)"),
      cpgRef("2.6", 293, "IM or oral route may be used if IV access not available"),
    ],
  },
  {
    drug: "dexamethasone",
    population: "paediatric",
    indications: ["Croup"],
    cpg: "CPG 5.3 Croup",
    page: 96,
    lines: [
      "Mild (MWCS ≤ 2) and moderate (MWCS 3-7): Dexamethasone 0.6mg/kg PO (max 12mg) OR Budesonide 2mg nebulised",
      "Severe (MWCS ≥ 8): Dexamethasone 0.6mg/kg PO/IM/IV (max 12mg) OR Budesonide 2mg nebulised",
    ],
    formularyRows: [{ route: "IV/IO/IM", note: "IM/IV only for severe croup (MWCS ≥ 8), per CPG 5.3." }],
    refs: [
      cpgRef("2.6", 96, "Dexamethasone 0.6mg/kg PO (max 12mg) OR"),
      cpgRef("2.6", 96, "Dexamethasone 0.6mg/kg PO/IM/IV (max 12mg) OR"),
    ],
  },
];

export const CONDITION_CPG_EXTRAS: ConditionCpgExtra[] = [
  {
    drug: "atropine",
    population: "adult",
    situation: "HAZMAT – nerve agent / organophosphate exposure (12 years and older)",
    cpg: "CPG 13.5 HAZMAT Incident",
    page: 261,
    lines: [
      "Atropine: 2mg IM – 1st, 2nd and 3rd dose",
      "Repeat doses to be administered every 15 minutes.",
      "IV Dose: Atropine 1-2mg every 5 minutes",
    ],
    note: "Given with Pralidoxime 600mg IM (not in the formulary). IV access only once the patient has been decontaminated.",
    refs: [
      cpgRef("2.6", 261, "Atropine: 2mg IM"),
      cpgRef("2.6", 261, "Repeat doses to be administered every 15 minutes"),
      cpgRef("2.6", 261, "Atropine: 1-2mg every 5 minutes"),
      cpgRef("2.6", 261, "IV access should only be established once the patient has been decontaminated"),
    ],
  },
  {
    drug: "atropine",
    population: "paediatric",
    situation: "HAZMAT – nerve agent / organophosphate exposure",
    cpg: "CPG 13.5 HAZMAT Incident",
    page: 261,
    lines: [
      "8 – 11 years: Atropine 2mg IM – 1st and 2nd dose",
      "1 – 7 years: Atropine 2mg IM – 1st dose only",
      "Repeat doses to be administered every 15 minutes.",
      "IV Dose: Atropine 0.05mg/kg (max 2mg) every 5 min",
    ],
    note: "12 years and older: as adult (three 2 mg IM doses). Given with Pralidoxime 600mg IM (not in the formulary). IV access only once the patient has been decontaminated.",
    refs: [
      cpgRef("2.6", 261, "Atropine: 2mg IM"),
      cpgRef("2.6", 261, "Repeat doses to be administered every 15 minutes"),
      cpgRef("2.6", 261, "Atropine: 0.05mg/kg (max 2mg) every 5 min"),
    ],
  },
  {
    drug: "midazolam",
    population: "adult",
    situation: "Acute behavioural disturbance (SAT +2 or +3)",
    cpg: "CPG 7.1 Acute Behavioural Disturbance",
    page: 137,
    lines: [
      "Adult: 5-10mg IM or 2-5mg IV",
      "≥65 years/frail/<60kg: 2-5mg IM or 1-2mg IV",
      "Dosing may be repeated every 5 – 15 minutes with lowest possible dose to titrate to effect",
    ],
    refs: [
      cpgRef("2.6", 137, "Adult: 5-10mg IM or 2-5mg IV"),
      cpgRef("2.6", 137, "≥65 years/frail/<60kg: 2-5mg IM or 1-2mg IV"),
      cpgRef("2.6", 137, "Dosing may be repeated every 5 – 15 minutes with lowest possible dose to titrate to effect"),
    ],
  },
  {
    drug: "midazolam",
    population: "paediatric",
    situation: "Acute behavioural disturbance (SAT +2 or +3)",
    cpg: "CPG 7.1 Acute Behavioural Disturbance",
    page: 137,
    lines: [
      "8-15 years: 0.2mg/kg IM (max single dose 10mg) or 0.1mg/kg IV (max single dose 5mg)",
      "Dosing may be repeated every 5 – 15 minutes with lowest possible dose to titrate to effect",
    ],
    refs: [
      cpgRef("2.6", 137, "8-15 years: 0.2mg/kg IM (max single dose 10mg) or 0.1mg/kg IV (max single dose 5mg)"),
      cpgRef("2.6", 137, "Dosing may be repeated every 5 – 15 minutes with lowest possible dose to titrate to effect"),
    ],
  },
  {
    drug: "midazolam",
    population: "adult",
    situation: "Psychostimulant toxicity",
    cpg: "CPG 8.8 Psychostimulants",
    page: 155,
    lines: [
      "Adults: 5-10mg IM or 2.5-5mg IV.",
      "Frail/elderly/hypotensive/<60kg: 2.5-5mg IM or 1-2mg IV.",
      "Repeat at 5-minute intervals if required (total max 20mg)",
    ],
    refs: [
      cpgRef("2.6", 155, "Midazolam Adults: 5-10mg IM or 2.5-5mg IV"),
      cpgRef("2.6", 155, "Frail/elderly/hypotensive/<60kg: 2.5-5mg IM or 1-2mg IV"),
      cpgRef("2.6", 155, "Repeat at 5-minute intervals if required (total max 20mg)"),
    ],
  },
  {
    drug: "midazolam",
    population: "adult",
    situation: "Procedural sedation",
    cpg: "CPG 11.3 Procedural Sedation",
    page: 213,
    lines: ["For co-administration with Fentanyl if required: 0.5mg IV repeat every 2-5 minutes as required to achieve desired effect"],
    refs: [cpgRef("2.6", 213, "For co-administration with Fentanyl if required: 0.5mg IV repeat every 2-5 minutes as required to achieve desired effect")],
  },
  {
    drug: "midazolam",
    population: "paediatric",
    situation: "Procedural sedation",
    cpg: "CPG 11.3 Procedural Sedation",
    page: 213,
    lines: ["For co-administration with Fentanyl if required: 0.05mg/kg IV, max 0.5mg repeat every 2-5 minutes as required to achieve desired effect"],
    refs: [cpgRef("2.6", 213, "0.05mg/kg IV, max 0.5mg repeat every 2-5 minutes as required to achieve desired effect")],
  },
  {
    drug: "fentanyl",
    population: "adult",
    situation: "Procedural sedation",
    cpg: "CPG 11.3 Procedural Sedation",
    page: 213,
    lines: ["0.5mcg/kg IV in aliquots of 20mcg to achieve desired effect. Repeat every 2 minutes as required"],
    refs: [cpgRef("2.6", 213, "0.5mcg/kg IV in aliquots of 20mcg to achieve desired effect. Repeat every 2 minutes as required")],
  },
  {
    drug: "fentanyl",
    population: "paediatric",
    situation: "Procedural sedation",
    cpg: "CPG 11.3 Procedural Sedation",
    page: 213,
    lines: ["0.5mcg/kg IV in aliquots of max 20mcg to achieve desired effect. Repeat every 2 minutes as required"],
    refs: [cpgRef("2.6", 213, "0.5mcg/kg IV in aliquots of max 20mcg to achieve desired effect. Repeat every 2 minutes as required")],
  },
];

export const CONDITION_CPG_WARNINGS: ConditionCpgWarning[] = ["paracetamol", "ibuprofen"].map((drug) => ({
  drug,
  cpg: "CPG 9.1 Heat-Related Disorders",
  page: 166,
  text: "Heat stroke: DO NOT administer Paracetamol or Ibuprofen to these patients.",
  refs: [cpgRef("2.6", 166, "DO NOT administer Paracetamol or Ibuprofen to these patients")],
}));

export function conditionCpgDoses(drug: FormularyDrug, population: Population, indication: string) {
  return CONDITION_CPG_DOSES.filter(
    (c) => c.drug === drug.id && c.population === population && c.indications.includes(indication),
  );
}

export function conditionCpgExtras(drug: FormularyDrug, population: Population) {
  return CONDITION_CPG_EXTRAS.filter((c) => c.drug === drug.id && c.population === population);
}

export function conditionCpgWarnings(drug: FormularyDrug) {
  return CONDITION_CPG_WARNINGS.filter((w) => w.drug === drug.id);
}

/** Notes on paediatric dosing-table columns that a condition CPG overrides. */
export function conditionTableNotes(drug: FormularyDrug, group: string) {
  return CONDITION_CPG_DOSES.filter((c) => c.drug === drug.id && c.population === "paediatric").flatMap((c) =>
    (c.tableGroups ?? []).filter((t) => t.group === group).map((t) => t.note),
  );
}
