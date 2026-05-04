import { CPG_ENTRIES, type CpgEntry } from "@/lib/cpgIndex";

export type ToxicologySymptomGroup =
  | "scene"
  | "consciousness"
  | "respiratory"
  | "haemodynamic"
  | "pupils-secretions"
  | "neurological"
  | "temperature-skin";

export type ToxicologySymptom = {
  id: string;
  label: string;
  group: ToxicologySymptomGroup;
};

export type ToxicologyProfile = {
  id: string;
  cpgCode: string;
  toxidrome: string;
  hallmarks: string[];
  supporting: string[];
  exposureClues?: string[];
  counterSignals?: string[];
  summary: string;
  management: string[];
  caution?: string;
};

export type ResolvedToxicologyProfile = ToxicologyProfile & {
  entry: CpgEntry;
};

export type ToxicologyConfidence = "strong" | "moderate" | "possible";

export type ToxicologyMatch = {
  profile: ResolvedToxicologyProfile;
  entry: CpgEntry;
  score: number;
  confidence: ToxicologyConfidence;
  matchedHallmarks: ToxicologySymptom[];
  matchedSupporting: ToxicologySymptom[];
  matchedExposure: ToxicologySymptom[];
};

export const TOXICOLOGY_SYMPTOM_GROUP_LABELS: Record<ToxicologySymptomGroup, string> = {
  scene: "Scene / exposure clues",
  consciousness: "Consciousness / behaviour",
  respiratory: "Respiratory",
  haemodynamic: "Haemodynamic",
  "pupils-secretions": "Pupils / secretions",
  neurological: "Neurological / GI-GU",
  "temperature-skin": "Temperature / skin",
};

export const TOXICOLOGY_GROUP_ORDER: ToxicologySymptomGroup[] = [
  "scene",
  "consciousness",
  "respiratory",
  "haemodynamic",
  "pupils-secretions",
  "neurological",
  "temperature-skin",
];

export const TOXICOLOGY_SYMPTOMS: ToxicologySymptom[] = [
  { id: "smoke_or_enclosed_fire", label: "Smoke inhalation / enclosed fire", group: "scene" },
  { id: "generator_or_exhaust", label: "Generator / exhaust / enclosed gas exposure", group: "scene" },
  { id: "pesticide_or_chemical", label: "Pesticide / chemical exposure", group: "scene" },
  { id: "pill_bottle_or_medication", label: "Medication overdose / pill bottles present", group: "scene" },
  { id: "bite_or_sting", label: "Snake bite / sting / marine envenomation", group: "scene" },

  { id: "decreased_loc", label: "Reduced LOC / difficult to rouse", group: "consciousness" },
  { id: "drowsiness", label: "Drowsiness / sedation", group: "consciousness" },
  { id: "slurred_speech", label: "Slurred speech", group: "consciousness" },
  { id: "ataxia", label: "Ataxia / poor coordination", group: "consciousness" },
  { id: "agitation", label: "Agitation / severe restlessness", group: "consciousness" },
  { id: "delirium", label: "Delirium / confusion / paranoia", group: "consciousness" },
  { id: "syncope_collapse", label: "Syncope / sudden collapse", group: "consciousness" },

  { id: "respiratory_depression", label: "Respiratory depression / slow respirations", group: "respiratory" },
  { id: "dyspnoea", label: "Dyspnoea / respiratory distress", group: "respiratory" },
  { id: "bronchorrhea_bronchospasm", label: "Bronchorrhoea / bronchospasm", group: "respiratory" },

  { id: "bradycardia", label: "Bradycardia", group: "haemodynamic" },
  { id: "tachycardia", label: "Tachycardia", group: "haemodynamic" },
  { id: "hypotension", label: "Hypotension / shock", group: "haemodynamic" },
  { id: "hypertension", label: "Hypertension", group: "haemodynamic" },
  { id: "chest_pain_ischemia", label: "Chest pain / myocardial ischaemia", group: "haemodynamic" },
  { id: "ecg_abnormalities", label: "ECG changes / heart block / arrhythmia", group: "haemodynamic" },

  { id: "miosis", label: "Miosis / pinpoint pupils", group: "pupils-secretions" },
  { id: "mydriasis", label: "Mydriasis / dilated pupils", group: "pupils-secretions" },
  { id: "salivation_lacrimation", label: "Salivation / lacrimation", group: "pupils-secretions" },
  { id: "dry_flushed_skin", label: "Dry, warm, flushed skin", group: "pupils-secretions" },
  { id: "diaphoresis", label: "Diaphoresis / sweating", group: "pupils-secretions" },

  { id: "seizures", label: "Seizures / convulsions", group: "neurological" },
  { id: "tremor_clonus_fasciculations", label: "Tremor / clonus / fasciculations", group: "neurological" },
  { id: "weakness_paralysis", label: "Muscle weakness / respiratory muscle fatigue", group: "neurological" },
  { id: "vomiting_diarrhoea", label: "Vomiting / diarrhoea / emesis", group: "neurological" },
  { id: "urinary_retention", label: "Urinary retention", group: "neurological" },
  { id: "headache_dizziness", label: "Headache / dizziness", group: "neurological" },
  { id: "local_pain_swelling", label: "Local pain / swelling at exposure site", group: "neurological" },

  { id: "hyperthermia", label: "Hyperthermia", group: "temperature-skin" },
  { id: "hypothermia", label: "Hypothermia", group: "temperature-skin" },
];

const SYMPTOM_MAP = new Map(TOXICOLOGY_SYMPTOMS.map((symptom) => [symptom.id, symptom]));

const PROFILE_DEFS: ToxicologyProfile[] = [
  {
    id: "opioids",
    cpgCode: "CPG 8.6",
    toxidrome: "Opioid toxidrome",
    hallmarks: ["miosis", "respiratory_depression", "decreased_loc"],
    supporting: ["drowsiness", "bradycardia", "hypotension", "hypothermia", "seizures"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["mydriasis", "hypertension", "hyperthermia"],
    summary: "Best fit when pinpoint pupils and reduced respiratory effort dominate the presentation.",
    management: [
      "Apply the full monitoring bundle (4-lead ECG, SpO2, EtCO2, RR, BP, temperature, RBS) and support ventilation early with oxygen.",
      "Use naloxone titrated to RR >10/min — target respiratory rate, not full reversal. IM/IN route if no IV access.",
      "Escalate to RSI (omit fentanyl for induction) if respiratory compromise persists despite naloxone.",
    ],
    caution: "Naloxone has a shorter half-life than most opioids — monitor closely for rebound toxicity. Consider alternative diagnosis if no response to naloxone.",
  },
  {
    id: "benzodiazepine",
    cpgCode: "CPG 8.1",
    toxidrome: "Sedative-hypnotic toxidrome",
    hallmarks: ["drowsiness", "slurred_speech", "ataxia", "decreased_loc"],
    supporting: ["hypotension", "bradycardia", "hypothermia"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["agitation", "hypertension", "hyperthermia"],
    summary: "Usually a supportive-care presentation with sedation, ataxia, and airway risk.",
    management: [
      "Support ABCs, give oxygen, and provide IPPV if ventilatory support is required.",
      "Give IV fluids 10-20 mL/kg if needed and monitor closely for aspiration risk.",
      "RSI if airway protection is failing — omit fentanyl for induction.",
    ],
    caution: "Profound unconsciousness should raise concern for co-ingestion with another CNS depressant such as alcohol. The elderly and patients with comorbidities are at greatest risk.",
  },
  {
    id: "alcohol",
    cpgCode: "CPG 8.10",
    toxidrome: "Sedative-hypnotic / alcohol pattern",
    hallmarks: ["slurred_speech", "ataxia", "drowsiness"],
    supporting: ["decreased_loc", "vomiting_diarrhoea", "hypothermia", "headache_dizziness", "agitation", "seizures"],
    counterSignals: ["miosis", "salivation_lacrimation"],
    summary: "Think alcohol when coordination, judgement, and airway reflexes are deteriorating.",
    management: [
      "Check RBS in all suspected intoxicated patients, position laterally if LOC is reduced, and keep warm.",
      "Use oxygen as needed and give 250-500 mL IV fluids if dehydration is present.",
      "Give antiemetic if vomiting; RSI when vomiting and airway protection become the main issue.",
    ],
    caution: "Signs of intoxication mimic trauma, stroke, and hypoglycaemia — always check RBS and assess for injury. Alcohol withdrawal syndrome (tremors, seizures, agitation) can be life-threatening in alcohol-dependent patients who stop drinking.",
  },
  {
    id: "beta-blocker",
    cpgCode: "CPG 8.2",
    toxidrome: "Bradycardic cardiotoxic pattern",
    hallmarks: ["bradycardia", "hypotension"],
    supporting: ["decreased_loc", "seizures", "chest_pain_ischemia", "ecg_abnormalities"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["tachycardia", "hypertension"],
    summary: "Best fit for toxic bradycardia with shock after a medication ingestion.",
    management: [
      "Start ABC support, oxygen, IPPV if required, IV fluids 10-20 mL/kg, and a 12-lead ECG.",
      "Treat bradycardia with atropine; escalate to adrenaline or noradrenaline infusion if needed.",
      "Consider calcium chloride, transcutaneous pacing, and RSI (omit fentanyl for induction) when deterioration continues.",
    ],
    caution: "Glucagon is no longer recommended — large doses are required and effect is short-lived. Propranolol and sotalol are particularly toxic and arrhythmogenic; be prepared for cardiac arrest.",
  },
  {
    id: "calcium-channel-blocker",
    cpgCode: "CPG 8.3",
    toxidrome: "Bradycardic cardiotoxic pattern",
    hallmarks: ["bradycardia", "hypotension"],
    supporting: ["decreased_loc", "seizures", "ecg_abnormalities"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["tachycardia", "hypertension"],
    summary: "Consider CCB toxicity when profound cardiovascular collapse follows a tablet overdose.",
    management: [
      "Start oxygen, IPPV if required, IV fluids 10-20 mL/kg, ABC support, and a 12-lead ECG.",
      "Use atropine for bradycardia and escalate to adrenaline or noradrenaline infusion if required.",
      "Calcium chloride, transcutaneous pacing, and RSI (omit fentanyl for induction) are listed escalation options.",
    ],
    caution: "Verapamil and diltiazem are particularly cardioselective and high-risk. Slow-release preparations can significantly delay onset of toxicity — absence of early collapse does not exclude danger.",
  },
  {
    id: "carbon-monoxide",
    cpgCode: "CPG 8.4",
    toxidrome: "Inhalational toxic gas pattern",
    hallmarks: ["generator_or_exhaust", "smoke_or_enclosed_fire", "headache_dizziness"],
    supporting: ["tachycardia", "decreased_loc", "seizures", "chest_pain_ischemia", "dyspnoea", "ataxia", "syncope_collapse", "delirium"],
    summary: "Strong fit when exposure history and headache/dizziness outweigh the pulse oximeter reading.",
    management: [
      "Give high-flow oxygen whenever CO poisoning is suspected — SpO2 may appear falsely normal.",
      "Add IPPV if ventilatory support is required and give IV fluids 10-20 mL/kg if needed.",
      "Escalate to RSI when airway or ventilation cannot be maintained. Do not enter the scene until it is safe.",
    ],
    caution: "SpO2 is unreliable in CO poisoning. In fire cases, co-assess for cyanide toxicity. Pregnant patients and those with cardiovascular disease are at increased risk.",
  },
  {
    id: "cyanide",
    cpgCode: "CPG 8.5",
    toxidrome: "Inhalational toxic gas pattern",
    hallmarks: ["smoke_or_enclosed_fire", "dyspnoea", "decreased_loc"],
    supporting: ["headache_dizziness", "vomiting_diarrhoea", "tachycardia", "hypertension", "seizures", "bradycardia", "syncope_collapse"],
    counterSignals: ["miosis"],
    summary: "Think cyanide in rapid smoke-inhalation collapse, especially with severe respiratory or neurological compromise.",
    management: [
      "Use PPE, decontaminate if required, and request HAZMAT unit when scene risk persists. Do not enter until safe.",
      "Give oxygen, IV fluids 10-20 mL/kg, and ABC support; give antiemetic early — vomiting can emit hydrogen cyanide gas.",
      "Prepare for RSI early; these patients are at high risk of cardiac arrest and death before definitive care.",
    ],
    caution: "Onset is rapid — death may occur before arrival or resuscitation opportunity. A 'bitter almond' odour may be present but is unreliable and should not be used to rule cyanide in or out.",
  },
  {
    id: "organophosphates",
    cpgCode: "CPG 8.7",
    toxidrome: "Cholinergic toxidrome",
    hallmarks: ["pesticide_or_chemical", "salivation_lacrimation", "bronchorrhea_bronchospasm", "miosis"],
    supporting: ["bradycardia", "vomiting_diarrhoea", "tremor_clonus_fasciculations", "weakness_paralysis", "hypotension", "seizures", "agitation"],
    counterSignals: ["dry_flushed_skin", "mydriasis", "hypertension"],
    summary: "Classic cholinergic picture (DUMBBELS): wet patient, pinpoint pupils, bronchorrhoea, and bradycardia.",
    management: [
      "Use PPE, decontaminate if required, consider HAZMAT support, and secure ABCs early.",
      "Give atropine Adult 1-2 mg every 5 min (Paediatric 0.05 mg/kg max 2 mg) until clinical condition improves.",
      "Add oxygen, IV access, IV fluids, antiemetic, and RSI when respiratory failure develops.",
    ],
    caution: "Severe presentations may require large atropine doses. Symptoms can be delayed up to 12 hours with some agents. Carbamates (e.g. from insecticides) cause similar but generally less severe effects.",
  },
  {
    id: "psychostimulants",
    cpgCode: "CPG 8.8",
    toxidrome: "Sympathomimetic toxidrome",
    hallmarks: ["agitation", "mydriasis", "tachycardia", "hypertension"],
    supporting: ["diaphoresis", "hyperthermia", "tremor_clonus_fasciculations", "seizures", "chest_pain_ischemia", "delirium"],
    counterSignals: ["miosis", "bradycardia", "hypothermia"],
    summary: "Best fit for stimulant toxicity with agitation, adrenergic excess, and heat generation. Methamphetamine derivatives are the most common life-threatening form.",
    management: [
      "Reduce external stimulus, gain IV access if safe, give oxygen, and use 250-500 mL fluid boluses as needed.",
      "Actively cool hyperthermic patients aggressively — this is a priority. Be prepared for rapid deterioration and resuscitation.",
      "Midazolam Adults 5-10 mg IM or 2.5-5 mg IV (frail/<60 kg: 2.5-5 mg IM, 1-2 mg IV) up to 20 mg total; RSI if required.",
    ],
    caution: "These patients are at high risk of deterioration and cardiac arrest post-sedation — keep resuscitation equipment immediately ready. Use caution with fluids in elderly or those with cardiac failure.",
  },
  {
    id: "tricyclic-antidepressants",
    cpgCode: "CPG 8.9",
    toxidrome: "Anticholinergic / cardiotoxic pattern",
    hallmarks: ["dry_flushed_skin", "mydriasis", "tachycardia", "hypotension"],
    supporting: ["delirium", "urinary_retention", "hyperthermia", "seizures", "ecg_abnormalities"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["miosis", "salivation_lacrimation", "bradycardia"],
    summary: "Strong fit when anticholinergic findings sit alongside cardiovascular collapse or seizures.",
    management: [
      "Use oxygen, IV access, IV fluids 10-20 mL/kg, ABC support, and obtain a 12-lead ECG — watch for widened QRS, prolonged PR, dominant R wave in aVR, and VT.",
      "Actively cool if hyperthermic and escalate to noradrenaline or adrenaline infusion if shock persists.",
      "RSI (omit fentanyl for induction) when airway or consciousness deteriorates. Be prepared to manage cardiac arrest.",
    ],
    caution: "Doses of 10 mg/kg in adults or 5 mg/kg in children are potentially toxic. Rapid deterioration can occur in large overdoses — continuous monitoring with the full bundle is essential.",
  },
  {
    id: "envenomation",
    cpgCode: "CPG 8.11",
    toxidrome: "Venomous exposure pattern",
    hallmarks: ["bite_or_sting", "local_pain_swelling"],
    supporting: ["dyspnoea", "vomiting_diarrhoea", "agitation", "seizures", "diaphoresis", "tremor_clonus_fasciculations", "weakness_paralysis", "syncope_collapse"],
    summary: "Qatar-specific hazards: horned and saw-scaled vipers, scorpions, spiders, stonefish, and blue-bottle/jellyfish. Identify exposure and classify venom as neurotoxic, cytotoxic, or haemotoxic.",
    management: [
      "Limit movement, apply a pressure immobilisation bandage from distal to proximal, and prenotify hospital so the appropriate antivenom can be readied.",
      "Give oxygen, IV fluids (Adults 250-500 mL; Paeds 10 mL/kg), and analgesia — Penthrox or paracetamol are listed CPG options.",
      "For blue-bottle, jellyfish, or stonefish: add hot water immersion. For scorpion stings: monitor closely for cardiac arrhythmias, respiratory distress, and seizures.",
    ],
    caution: "Attempt to identify the creature if safe — do not try to catch it. Classify venom type (neurotoxic / cytotoxic / haemotoxic) to guide hospital antivenom preparation and anticipate systemic complications.",
  },
];

function getEntryByCode(code: string): CpgEntry {
  const entry = CPG_ENTRIES.find((item) => item.code === code);
  if (!entry) {
    throw new Error(`Missing CPG entry for ${code}`);
  }
  return entry;
}

export const TOXICOLOGY_PROFILES: ResolvedToxicologyProfile[] = PROFILE_DEFS.map((profile) => ({
  ...profile,
  entry: getEntryByCode(profile.cpgCode),
}));

function pickSymptoms(ids: string[]): ToxicologySymptom[] {
  return ids
    .map((id) => SYMPTOM_MAP.get(id))
    .filter((symptom): symptom is ToxicologySymptom => Boolean(symptom));
}

export function getToxicologyMatches(selectedIds: string[]): ToxicologyMatch[] {
  const selected = new Set(selectedIds);

  if (!selected.size) {
    return [];
  }

  const matches = TOXICOLOGY_PROFILES.map((profile): ToxicologyMatch | null => {
    const matchedHallmarks = pickSymptoms(profile.hallmarks.filter((id) => selected.has(id)));
    const matchedSupporting = pickSymptoms(profile.supporting.filter((id) => selected.has(id)));
    const matchedExposure = pickSymptoms((profile.exposureClues ?? []).filter((id) => selected.has(id)));
    const counterCount = (profile.counterSignals ?? []).filter((id) => selected.has(id)).length;

    const score =
      matchedHallmarks.length * 4 +
      matchedSupporting.length * 2 +
      matchedExposure.length * 3 -
      counterCount * 2;

    let confidence: ToxicologyConfidence | null = null;

    if (score >= 11 || (matchedHallmarks.length >= 2 && matchedExposure.length >= 1)) {
      confidence = "strong";
    } else if (score >= 7) {
      confidence = "moderate";
    } else if (score >= 4 && matchedHallmarks.length >= 1) {
      confidence = "possible";
    }

    if (!confidence) {
      return null;
    }

    return {
      profile,
      entry: profile.entry,
      score,
      confidence,
      matchedHallmarks,
      matchedSupporting,
      matchedExposure,
    };
  });

  return matches
    .filter((match): match is ToxicologyMatch => match !== null)
    .sort((a, b) => b.score - a.score || a.entry.printedPage - b.entry.printedPage);
}
