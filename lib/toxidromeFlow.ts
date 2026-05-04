export type FlowColor =
  | "orange"
  | "red"
  | "sky"
  | "violet"
  | "emerald"
  | "lime"
  | "amber"
  | "yellow"
  | "rose"
  | "blue"
  | "indigo"
  | "teal"
  | "slate";

export type FlowResult = {
  name: string;
  detail: string;
  color: FlowColor;
  cpgCodes?: string[];
};

export type FlowQuestion = {
  id: string;
  label: string;
  question: string;
  detail: string;
  result: FlowResult;
};

export const FLOW_QUESTIONS: FlowQuestion[] = [
  {
    id: "q1",
    label: "Q1",
    question: "Immediate Burns or Irritation?",
    detail:
      "Check for pain, redness, or blisters on the eyes, skin, or airway — as well as coughing, wheezing, or choking.",
    result: {
      name: "Irritant / Corrosive Toxidrome",
      detail:
        "Corrosive or irritant substance causing direct local tissue damage to skin, eyes, or airway. Decontaminate, secure the airway early, and transport urgently.",
      color: "orange",
    },
  },
  {
    id: "q2",
    label: "Q2",
    question: "Significant Bleeding or Coagulopathy?",
    detail:
      "Look for unexplained bruising, petechiae, bleeding from gums or nose, haemoptysis, or melaena without obvious trauma.",
    result: {
      name: "Anticoagulant Toxidrome",
      detail:
        "Anticoagulant or rodenticide poisoning impairing clotting. No prehospital reversal agent — supportive care and urgent transfer for FFP / Vitamin K in-hospital.",
      color: "red",
    },
  },
  {
    id: "q3",
    label: "Q3",
    question: "Rapid Collapse with Severe Hypoxia?",
    detail:
      "Assess for sudden coma or seizures, and cherry-red or ashen/grey skin — especially in fire scenes or enclosed spaces with generators.",
    result: {
      name: '"Knockdown" O₂ Disruptor Toxidrome',
      detail:
        "Carbon monoxide or cyanide poisoning disrupting cellular oxygen use. Give high-flow O₂ immediately regardless of SpO₂ reading — it will appear falsely normal in CO poisoning. Co-assess for cyanide in all fire victims.",
      color: "sky",
      cpgCodes: ["CPG 8.4", "CPG 8.5"],
    },
  },
  {
    id: "q4",
    label: "Q4",
    question: "Pinpoint Pupils AND Respiratory Depression / Coma?",
    detail:
      "The patient is miotic (pinpoint pupils) and has significantly depressed respirations or is unresponsive.",
    result: {
      name: "Opioid Toxidrome",
      detail:
        "Classic opioid triad: miosis, respiratory depression, reduced LOC. Naloxone titrated to RR >10/min — target respiratory rate, not full reversal. Full monitoring bundle: ECG, SpO₂, EtCO₂, RR, BP, temperature, RBS.",
      color: "violet",
      cpgCodes: ["CPG 8.6"],
    },
  },
  {
    id: "q5",
    label: "Q5",
    question: "Pinpoint Pupils WITH Excessive Secretions?",
    detail:
      'Look for the "wet" patient: salivation, lacrimation, urination, defecation, GI cramping, emesis (SLUDGE), or bronchospasm/wheezing.',
    result: {
      name: "Cholinergic Toxidrome",
      detail:
        "Organophosphate or carbamate poisoning — DUMBBELS signs dominate. Atropine Adult 1–2 mg every 5 min until secretions dry. PPE and decontamination are mandatory. Note: features may present up to 12 hours late.",
      color: "emerald",
      cpgCodes: ["CPG 8.7"],
    },
  },
  {
    id: "q6",
    label: "Q6",
    question: "Dilated Pupils WITH Agitation AND Clonus / Hyperreflexia?",
    detail:
      "Look for neuromuscular hyperactivity, inducible muscle jerks (clonus), or overactive reflexes — often associated with diarrhoea.",
    result: {
      name: "Serotonin Syndrome",
      detail:
        "Serotonergic excess. Key differentiator from sympathomimetic toxidrome: clonus and hyperreflexia are hallmarks. Benzodiazepines for agitation; cyproheptadine is given in-hospital.",
      color: "lime",
    },
  },
  {
    id: "q7",
    label: "Q7",
    question: "Dilated Pupils WITH Agitation AND Profuse Sweating?",
    detail:
      "Observe for tachycardia, hypertension, and hyperthermia in a diaphoretic patient — without the clonus seen in serotonin syndrome.",
    result: {
      name: "Sympathomimetic Toxidrome",
      detail:
        "Stimulant excess (amphetamines, cocaine, MDMA). Active cooling is the top priority. Midazolam Adults 5–10 mg IM or 2.5–5 mg IV for agitation. High risk of cardiac arrest post-sedation — keep resuscitation equipment ready.",
      color: "amber",
      cpgCodes: ["CPG 8.8"],
    },
  },
  {
    id: "q8",
    label: "Q8",
    question: "Dilated Pupils WITH Dry, Hot, Flushed Skin?",
    detail:
      'Look for confusion or delirium with "dry as a bone" skin and urinary retention — no sweating, skin is warm and flushed.',
    result: {
      name: "Anticholinergic Toxidrome",
      detail:
        "TCA, antihistamine, or anticholinergic drug overdose. 12-lead ECG is mandatory — watch for wide QRS, prolonged PR, dominant R wave in aVR, and ventricular tachycardia. Doses of 10 mg/kg (adults) or 5 mg/kg (children) are potentially toxic.",
      color: "yellow",
      cpgCodes: ["CPG 8.9"],
    },
  },
  {
    id: "q9",
    label: "Q9",
    question: "Seizure-Dominant Presentation?",
    detail:
      "Assess for recurrent or prolonged seizures (status epilepticus) or a post-ictal state where seizures are the leading feature.",
    result: {
      name: "Convulsant Toxidrome",
      detail:
        "Seizure-causing toxin — TCA, isoniazid, tramadol, MDMA, or local anaesthetic toxicity. Benzodiazepines are the prehospital first-line. Identify and treat the underlying cause on arrival.",
      color: "rose",
    },
  },
  {
    id: "q10",
    label: "Q10",
    question: "Marked Bradycardia AND Hypotension?",
    detail:
      "Look for slow heart rate and low blood pressure combined with CNS depression (lethargy/coma) and normal or small pupils.",
    result: {
      name: "Sympatholytic Toxidrome",
      detail:
        "Beta blocker or CCB overdose. Atropine first, then vasopressors (adrenaline/noradrenaline infusion). Calcium chloride and transcutaneous pacing as escalation. Glucagon is no longer recommended.",
      color: "blue",
      cpgCodes: ["CPG 8.2", "CPG 8.3"],
    },
  },
  {
    id: "q11",
    label: "Q11",
    question: "CNS Depression WITH Depressed Respirations (Normal Pupils)?",
    detail:
      "Check for somnolence, slurred speech, or ataxia where vital signs are only mildly depressed and pupils are not pinpoint.",
    result: {
      name: "SAS / Sedative-Hypnotic Toxidrome",
      detail:
        "Benzodiazepine, alcohol, or barbiturate ingestion. Supportive care, lateral positioning, airway monitoring. IPPV and RSI (omit fentanyl for induction) if airway protection fails. Profound unconsciousness suggests co-ingestion.",
      color: "indigo",
      cpgCodes: ["CPG 8.1", "CPG 8.10"],
    },
  },
  {
    id: "q12",
    label: "Q12",
    question: "Predominant GI Symptoms WITH Near-Normal Exam?",
    detail:
      "Look for nausea, vomiting, diarrhoea, and cramping without acute systemic toxidrome signs, neurological features, or significantly abnormal vital signs.",
    result: {
      name: "GI Toxidrome",
      detail:
        "Food poisoning, plant ingestion, or an early undifferentiated poisoning presentation. Supportive care: antiemetic, IV fluid replacement, and monitor closely for an evolving systemic toxidrome.",
      color: "teal",
    },
  },
];

export const FLOW_MIXED_RESULT: FlowResult = {
  name: "Mixed / Other — Reassess",
  detail:
    "No single toxidrome pattern identified. Consider mixed or combined toxidromes, drug interactions, or non-toxicological differentials (sepsis, stroke, metabolic disorder, trauma). Reassess systematically with the clinical team.",
  color: "slate",
};
