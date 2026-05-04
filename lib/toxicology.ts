import { CPG_ENTRIES, type CpgEntry } from "@/lib/cpgIndex";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToxicologySymptomGroup =
  | "scene"
  | "consciousness"
  | "behaviour"
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
  hallmarks: string[];       // key features — +5 each; completing the full set adds +4 bonus
  supporting: string[];      // corroborating features — +2 each
  exposureClues?: string[];  // scene / exposure clues — +4 each (very high diagnostic weight)
  counterSignals?: string[]; // features that argue against this toxidrome — −3 each
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
  allHallmarksPresent: boolean;
};

export type MixedSuggestion = {
  primary: ResolvedToxicologyProfile;
  secondary: ResolvedToxicologyProfile;
  unexplainedHallmarks: ToxicologySymptom[];
  rationale: string;
};

export type ToxicologyResult = {
  matches: ToxicologyMatch[];
  mixed: MixedSuggestion[];
  contradictions: string[];
};

// ─── Symptom catalogue ───────────────────────────────────────────────────────

export const TOXICOLOGY_SYMPTOM_GROUP_LABELS: Record<ToxicologySymptomGroup, string> = {
  scene: "Scene / exposure clues",
  consciousness: "Level of Consciousness",
  behaviour: "Behaviour",
  respiratory: "Respiratory",
  haemodynamic: "Haemodynamic",
  "pupils-secretions": "Pupils / secretions / skin",
  neurological: "Neurological / GI-GU",
  "temperature-skin": "Temperature / skin colour",
};

export const TOXICOLOGY_GROUP_ORDER: ToxicologySymptomGroup[] = [
  "scene",
  "consciousness",
  "behaviour",
  "respiratory",
  "haemodynamic",
  "pupils-secretions",
  "neurological",
  "temperature-skin",
];

export const TOXICOLOGY_SYMPTOMS: ToxicologySymptom[] = [
  // ── Scene / Exposure ──────────────────────────────────────────────────────
  { id: "smoke_or_enclosed_fire",    label: "Smoke inhalation / enclosed fire",               group: "scene" },
  { id: "generator_or_exhaust",      label: "Generator / exhaust / enclosed gas exposure",    group: "scene" },
  { id: "pesticide_or_chemical",     label: "Pesticide / chemical / industrial exposure",     group: "scene" },
  { id: "pill_bottle_or_medication", label: "Medication overdose / pill bottles present",     group: "scene" },
  { id: "bite_or_sting",             label: "Snake bite / sting / marine envenomation",       group: "scene" },

  // ── Level of Consciousness ────────────────────────────────────────────────
  { id: "decreased_loc",     label: "Reduced LOC / difficult to rouse",      group: "consciousness" },
  { id: "drowsiness",        label: "Drowsiness / sedation",                 group: "consciousness" },
  { id: "slurred_speech",    label: "Slurred speech",                        group: "consciousness" },
  { id: "ataxia",            label: "Ataxia / poor coordination",            group: "consciousness" },
  { id: "syncope_collapse",  label: "Syncope / sudden collapse",             group: "consciousness" },

  // ── Behaviour ─────────────────────────────────────────────────────────────
  { id: "agitation",  label: "Agitation / severe restlessness",    group: "behaviour" },
  { id: "delirium",   label: "Delirium / confusion / paranoia",    group: "behaviour" },

  // ── Respiratory ───────────────────────────────────────────────────────────
  { id: "respiratory_depression",    label: "Respiratory depression / slow / shallow",        group: "respiratory" },
  { id: "dyspnoea",                  label: "Dyspnoea / respiratory distress",                group: "respiratory" },
  { id: "bronchorrhea_bronchospasm", label: "Bronchorrhoea / bronchospasm / wheeze",          group: "respiratory" },

  // ── Haemodynamic ──────────────────────────────────────────────────────────
  { id: "bradycardia",        label: "Bradycardia",                              group: "haemodynamic" },
  { id: "tachycardia",        label: "Tachycardia",                              group: "haemodynamic" },
  { id: "hypotension",        label: "Hypotension / shock",                      group: "haemodynamic" },
  { id: "hypertension",       label: "Hypertension",                             group: "haemodynamic" },
  { id: "chest_pain_ischemia",label: "Chest pain / myocardial ischaemia",        group: "haemodynamic" },
  { id: "ecg_abnormalities",  label: "ECG changes / arrhythmia / heart block",   group: "haemodynamic" },

  // ── Pupils / Secretions / Skin ────────────────────────────────────────────
  { id: "normal_pupils",        label: "Normal pupils (equal, reactive, mid-size)",  group: "pupils-secretions" },
  { id: "miosis",               label: "Miosis / pinpoint pupils",                   group: "pupils-secretions" },
  { id: "mydriasis",            label: "Mydriasis / dilated pupils",                 group: "pupils-secretions" },
  { id: "salivation_lacrimation",label: "Excessive salivation / lacrimation / rhinorrhoea", group: "pupils-secretions" },
  { id: "dry_flushed_skin",     label: "Dry, warm, flushed skin",                    group: "pupils-secretions" },
  { id: "diaphoresis",          label: "Diaphoresis / profuse sweating",             group: "pupils-secretions" },

  // ── Neurological / GI-GU ─────────────────────────────────────────────────
  { id: "seizures",                  label: "Seizures / convulsions",                          group: "neurological" },
  { id: "tremor_clonus_fasciculations", label: "Tremor / clonus / muscle fasciculations",     group: "neurological" },
  { id: "weakness_paralysis",        label: "Muscle weakness / respiratory muscle fatigue",   group: "neurological" },
  { id: "vomiting_diarrhoea",        label: "Vomiting / diarrhoea / emesis",                  group: "neurological" },
  { id: "urinary_retention",         label: "Urinary retention",                              group: "neurological" },
  { id: "headache_dizziness",        label: "Headache / dizziness",                           group: "neurological" },
  { id: "local_pain_swelling",       label: "Local pain / swelling at exposure site",         group: "neurological" },

  // ── Temperature / Skin colour ─────────────────────────────────────────────
  { id: "hyperthermia",         label: "Hyperthermia / fever",                       group: "temperature-skin" },
  { id: "hypothermia",          label: "Hypothermia",                                group: "temperature-skin" },
  { id: "cherry_red_ashen_skin",label: "Cherry-red or ashen/grey skin (CO late sign)", group: "temperature-skin" },
];

const SYMPTOM_MAP = new Map(TOXICOLOGY_SYMPTOMS.map((s) => [s.id, s]));

// ─── CPG 8.x profiles ────────────────────────────────────────────────────────

const PROFILE_DEFS: ToxicologyProfile[] = [
  // ── CPG 8.6 — Opioid ─────────────────────────────────────────────────────
  {
    id: "opioids",
    cpgCode: "CPG 8.6",
    toxidrome: "Opioid toxidrome",
    hallmarks: ["miosis", "respiratory_depression", "decreased_loc"],
    supporting: ["drowsiness", "bradycardia", "hypotension", "hypothermia", "cyanosis"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["mydriasis", "normal_pupils", "hypertension", "hyperthermia", "agitation"],
    summary: "Pinpoint pupils + respiratory depression + reduced LOC. The triad is pathognomonic — no other common toxidrome replicates all three.",
    management: [
      "Full monitoring bundle: 4-lead ECG, SpO₂, EtCO₂, RR, BP, temperature, RBS.",
      "Support ventilation with BVM if RR < 10 or SpO₂ < 94%. High-flow O₂.",
      "Naloxone: titrate to RR > 10/min — not full reversal. Adults 200 mcg IV/IM/IN, repeat every 2–3 min. Paeds 10 mcg/kg.",
      "No response after 2 doses → reconsider diagnosis or co-ingestion (BZD, alcohol).",
      "RSI (omit fentanyl for induction) if ventilation cannot be maintained.",
    ],
    caution: "Naloxone half-life is shorter than most opioids — monitor closely for re-narcotisation. Fentanyl analogues may require higher and repeated doses. Co-ingestion with benzodiazepines or alcohol is common and persistent after naloxone.",
  },

  // ── CPG 8.1 — Sedative-hypnotic ──────────────────────────────────────────
  {
    id: "benzodiazepine",
    cpgCode: "CPG 8.1",
    toxidrome: "Sedative-hypnotic toxidrome",
    hallmarks: ["drowsiness", "slurred_speech", "ataxia"],
    supporting: ["decreased_loc", "hypotension", "bradycardia", "hypothermia", "normal_pupils"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["agitation", "hypertension", "hyperthermia", "miosis", "mydriasis"],
    summary: "CNS depression without the opioid triad — ataxia, slurred speech, and sedation with relatively preserved respiratory drive and normal pupils.",
    management: [
      "Support ABCs, give oxygen, and lateral positioning to protect the airway.",
      "IV fluids 10–20 mL/kg if hypotension present; monitor closely for aspiration.",
      "IPPV if ventilatory support is required.",
      "RSI (omit fentanyl for induction) if airway protection is failing.",
    ],
    caution: "Profound unconsciousness strongly suggests co-ingestion with opioids or alcohol — consider naloxone trial. Elderly patients and those with COPD are at highest risk of respiratory compromise.",
  },

  // ── CPG 8.10 — Alcohol ───────────────────────────────────────────────────
  {
    id: "alcohol",
    cpgCode: "CPG 8.10",
    toxidrome: "Alcohol / sedative-hypnotic pattern",
    hallmarks: ["slurred_speech", "ataxia", "drowsiness"],
    supporting: ["decreased_loc", "vomiting_diarrhoea", "hypothermia", "headache_dizziness", "agitation"],
    counterSignals: ["miosis", "salivation_lacrimation", "respiratory_depression", "mydriasis"],
    summary: "Alcohol intoxication — disinhibition, impaired coordination, and sedation. Vomiting is common and increases aspiration risk significantly.",
    management: [
      "Check RBS — hypoglycaemia mimics and co-exists with intoxication.",
      "Lateral positioning and airway monitoring. Keep warm — vasodilation causes hypothermia.",
      "IV fluids 250–500 mL if dehydrated; antiemetic if vomiting persists.",
      "RSI when vomiting plus deteriorating airway protection.",
    ],
    caution: "Alcohol mimics head injury, stroke, and hypoglycaemia — check RBS and assess for trauma. Alcohol withdrawal (tremors, seizures, agitation) is life-threatening in dependent patients who have stopped drinking.",
  },

  // ── CPG 8.2 — Beta-blocker ───────────────────────────────────────────────
  {
    id: "beta-blocker",
    cpgCode: "CPG 8.2",
    toxidrome: "Sympatholytic — beta-blocker",
    hallmarks: ["bradycardia", "hypotension"],
    supporting: ["decreased_loc", "syncope_collapse", "seizures", "chest_pain_ischemia", "ecg_abnormalities", "normal_pupils"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["tachycardia", "hypertension", "hyperthermia", "mydriasis"],
    summary: "Toxic bradycardia with haemodynamic compromise after medication ingestion. Propranolol and sotalol are highest-risk agents (CNS penetration, Na-channel blockade).",
    management: [
      "ABCs, oxygen, IPPV if required, IV fluids 10–20 mL/kg, 12-lead ECG.",
      "Atropine 600 mcg IV/IO for symptomatic bradycardia; repeat up to 3 mg total.",
      "Adrenaline or noradrenaline infusion if atropine fails.",
      "Calcium chloride 10% 10 mL IV for haemodynamic instability.",
      "Transcutaneous pacing as pharmacological escalation.",
    ],
    caution: "Glucagon is no longer recommended. Propranolol and sotalol carry risk of seizures and cardiac arrest — have resuscitation equipment immediately ready. Sotalol also prolongs QTc.",
  },

  // ── CPG 8.3 — CCB ────────────────────────────────────────────────────────
  {
    id: "calcium-channel-blocker",
    cpgCode: "CPG 8.3",
    toxidrome: "Sympatholytic — calcium channel blocker",
    hallmarks: ["bradycardia", "hypotension"],
    supporting: ["decreased_loc", "syncope_collapse", "ecg_abnormalities", "normal_pupils"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["tachycardia", "hypertension", "hyperthermia", "mydriasis"],
    summary: "CCB toxicity — profound cardiovascular collapse. Verapamil and diltiazem are most cardiotoxic; dihydropyridines (amlodipine) may cause reflex tachycardia.",
    management: [
      "Oxygen, IPPV if required, IV fluids 10–20 mL/kg, ABC support, 12-lead ECG.",
      "Atropine 600 mcg IV/IO for bradycardia; repeat up to 3 mg total.",
      "Adrenaline or noradrenaline infusion as required.",
      "Calcium chloride 10% 10 mL IV; transcutaneous pacing as escalation.",
    ],
    caution: "Slow-release CCB preparations can significantly delay toxicity onset — absence of early collapse does not exclude danger. Verapamil and diltiazem are highest-risk (cardioselective negative chronotropes and inotropes).",
  },

  // ── CPG 8.4 — Carbon monoxide ────────────────────────────────────────────
  {
    id: "carbon-monoxide",
    cpgCode: "CPG 8.4",
    toxidrome: "Carbon monoxide poisoning",
    hallmarks: ["headache_dizziness", "decreased_loc"],
    supporting: ["tachycardia", "ataxia", "syncope_collapse", "delirium", "chest_pain_ischemia", "seizures", "dyspnoea", "cherry_red_ashen_skin", "vomiting_diarrhoea"],
    exposureClues: ["smoke_or_enclosed_fire", "generator_or_exhaust"],
    counterSignals: [],
    summary: "SpO₂ is unreliable — reads falsely normal. Headache with enclosed-space exposure is CO until proven otherwise.",
    management: [
      "High-flow O₂ via NRB mask (15 L/min) immediately — regardless of SpO₂.",
      "Remove from exposure only when scene is safe. Do not enter without SCBA.",
      "IV fluids 10–20 mL/kg if haemodynamically compromised.",
      "BVM/IPPV if ventilating poorly; RSI if airway cannot be maintained.",
    ],
    caution: "SpO₂ appears falsely normal in CO poisoning — do not use it to guide O₂ therapy. Co-assess for cyanide in all fire victims. Pregnant patients and those with cardiac disease are at highest risk of harm.",
  },

  // ── CPG 8.5 — Cyanide ────────────────────────────────────────────────────
  {
    id: "cyanide",
    cpgCode: "CPG 8.5",
    toxidrome: "Cyanide poisoning",
    hallmarks: ["dyspnoea", "decreased_loc"],
    supporting: ["headache_dizziness", "vomiting_diarrhoea", "tachycardia", "hypertension", "seizures", "bradycardia", "syncope_collapse", "agitation"],
    exposureClues: ["smoke_or_enclosed_fire"],
    counterSignals: ["miosis"],
    summary: "Rapid cellular hypoxia despite apparently adequate oxygenation. Suspect in all fire or enclosed-space collapse, especially with severe neurological compromise disproportionate to the apparent respiratory state.",
    management: [
      "PPE and decontamination if required. Do not enter without HAZMAT support when risk persists.",
      "High-flow O₂, IV fluids 10–20 mL/kg, ABC support.",
      "Antiemetic early — vomiting can volatilise and release hydrogen cyanide gas.",
      "RSI early; rapid deterioration to cardiac arrest is a real risk before definitive care.",
    ],
    caution: "A 'bitter almond' odour is unreliable — do not use to rule in or out. Death may occur before resuscitation is possible. Always co-treat for CO in fire victims.",
  },

  // ── CPG 8.7 — Organophosphate / Cholinergic ──────────────────────────────
  {
    id: "organophosphates",
    cpgCode: "CPG 8.7",
    toxidrome: "Cholinergic toxidrome",
    hallmarks: ["miosis", "salivation_lacrimation", "bronchorrhea_bronchospasm"],
    supporting: ["bradycardia", "vomiting_diarrhoea", "tremor_clonus_fasciculations", "weakness_paralysis", "hypotension", "seizures", "agitation", "diaphoresis", "urinary_retention"],
    exposureClues: ["pesticide_or_chemical"],
    counterSignals: ["dry_flushed_skin", "mydriasis", "normal_pupils", "hypertension"],
    summary: "DUMBBELS / SLUDGE — wet patient: pinpoint pupils, excessive secretions, bronchospasm, bradycardia. Decontamination and PPE are non-negotiable.",
    management: [
      "PPE, remove clothing, copious irrigation — secondary contamination is a serious risk to rescuers.",
      "Atropine: Adult 1–2 mg IV every 5 min until secretions dry and bronchospasm resolves (no fixed ceiling).",
      "Paediatric: Atropine 0.05 mg/kg IV/IO, max 2 mg per dose.",
      "Oxygen, IV access, IV fluids, antiemetic; RSI when respiratory failure develops.",
    ],
    caution: "Presentations can be delayed up to 12 hours with certain agents (fat-soluble organophosphates, carbamates). Large atropine doses may be required in severe poisoning. Ensure scene safety before approaching.",
  },

  // ── CPG 8.8 — Sympathomimetic ────────────────────────────────────────────
  {
    id: "psychostimulants",
    cpgCode: "CPG 8.8",
    toxidrome: "Sympathomimetic toxidrome",
    hallmarks: ["agitation", "mydriasis", "tachycardia", "hypertension"],
    supporting: ["diaphoresis", "hyperthermia", "tremor_clonus_fasciculations", "seizures", "chest_pain_ischemia", "delirium"],
    counterSignals: ["miosis", "normal_pupils", "bradycardia", "hypothermia", "respiratory_depression"],
    summary: "Adrenergic excess — hyperthermic, agitated, diaphoretic, tachycardic. Methamphetamine and its derivatives are the most dangerous. Hyperthermia is the main driver of mortality.",
    management: [
      "Reduce stimulus; gain IV access (if safe); O₂ 4–8 L/min; 250–500 mL fluid boluses.",
      "Active cooling for hyperthermia — this is the top priority to prevent cardiac arrest.",
      "Midazolam: Adults 5–10 mg IM or 2.5–5 mg IV (frail/<60 kg: 2.5–5 mg IM / 1–2 mg IV); max 20 mg total.",
      "RSI if sedation insufficient or airway protection fails.",
    ],
    caution: "High risk of cardiac arrest post-sedation — resuscitation equipment immediately ready. MDMA may cause severe hyponatraemia. Physical restraints alone increase hyperthermia and rhabdomyolysis risk.",
  },

  // ── CPG 8.9 — Anticholinergic / TCA ─────────────────────────────────────
  {
    id: "tricyclic-antidepressants",
    cpgCode: "CPG 8.9",
    toxidrome: "Anticholinergic / TCA toxidrome",
    hallmarks: ["mydriasis", "dry_flushed_skin", "tachycardia"],
    supporting: ["delirium", "urinary_retention", "hyperthermia", "seizures", "ecg_abnormalities", "hypotension"],
    exposureClues: ["pill_bottle_or_medication"],
    counterSignals: ["miosis", "normal_pupils", "salivation_lacrimation", "bradycardia", "diaphoresis"],
    summary: "Hot, dry, flushed, confused, and tachycardic. TCAs add life-threatening ECG changes (wide QRS, R-wave in aVR) and haemodynamic collapse to the anticholinergic picture.",
    management: [
      "O₂, IV access, IV fluids 10–20 mL/kg, ABC support, 12-lead ECG immediately.",
      "Monitor: widened QRS, prolonged PR, dominant R wave in aVR, VT — all indicate TCA cardiotoxicity.",
      "Active cooling if hyperthermic; noradrenaline or adrenaline infusion for persistent shock.",
      "RSI (omit fentanyl for induction) when consciousness or airway protection deteriorates.",
    ],
    caution: "TCA ≥10 mg/kg (adults) or ≥5 mg/kg (children) are potentially life-threatening. Deterioration can be sudden — continuous monitoring with full bundle is essential from first contact.",
  },

  // ── CPG 8.11 — Envenomation ──────────────────────────────────────────────
  {
    id: "envenomation",
    cpgCode: "CPG 8.11",
    toxidrome: "Venomous exposure pattern",
    hallmarks: ["bite_or_sting", "local_pain_swelling"],
    supporting: ["dyspnoea", "vomiting_diarrhoea", "agitation", "seizures", "diaphoresis", "tremor_clonus_fasciculations", "weakness_paralysis", "syncope_collapse"],
    counterSignals: [],
    summary: "Qatar-specific: horned/saw-scaled vipers, scorpions, spiders, stonefish, blue-bottle jellyfish. Classify venom as neurotoxic, cytotoxic, or haemotoxic to guide antivenom preparation.",
    management: [
      "Limit movement; pressure immobilisation bandage from distal to proximal for snakebite.",
      "Prenotify hospital to prepare appropriate antivenom before arrival.",
      "O₂, IV fluids (Adults 250–500 mL; Paeds 10 mL/kg), analgesia (Penthrox or paracetamol).",
      "Blue-bottle / jellyfish / stonefish: hot water immersion for pain. Scorpion: monitor for arrhythmia, respiratory distress, seizures.",
    ],
    caution: "Identify the creature if safe — do not attempt to catch it. Haemotoxic (viper): coagulopathy and local tissue necrosis. Neurotoxic (scorpion, some spiders): autonomic storms and neuromuscular dysfunction. Cytotoxic: local necrosis may be severe.",
  },
];

// ─── Contradiction detection ─────────────────────────────────────────────────

const CONTRADICTIONS: { pair: [string, string]; message: string }[] = [
  {
    pair: ["miosis", "mydriasis"],
    message: "Miosis and mydriasis are mutually exclusive — re-examine pupils carefully.",
  },
  {
    pair: ["normal_pupils", "miosis"],
    message: "Normal pupils and miosis are contradictory — verify pupil exam (normal = mid-sized and reactive).",
  },
  {
    pair: ["normal_pupils", "mydriasis"],
    message: "Normal pupils and mydriasis are contradictory — verify pupil exam.",
  },
  {
    pair: ["bradycardia", "tachycardia"],
    message: "Bradycardia and tachycardia selected simultaneously — confirm current heart rate.",
  },
  {
    pair: ["hyperthermia", "hypothermia"],
    message: "Hyperthermia and hypothermia selected simultaneously — confirm patient temperature.",
  },
  {
    pair: ["dry_flushed_skin", "diaphoresis"],
    message: "Dry skin and diaphoresis are contradictory — verify skin findings (anticholinergic = dry; sympathomimetic = wet).",
  },
  {
    pair: ["dry_flushed_skin", "salivation_lacrimation"],
    message: "Dry skin and excessive secretions are contradictory — verify secretion status (anticholinergic = dry; cholinergic = wet).",
  },
];

// ─── Mixed toxidrome rationale ────────────────────────────────────────────────

const MIXED_RATIONALE: Record<string, string> = {
  "opioids+benzodiazepine":
    "Opioid + sedative-hypnotic (BZD/barbiturate) co-ingestion — additive CNS and respiratory depression. Naloxone partially reverses opioid component; sedative component persists. Aspiration risk is high and unconsciousness may outlast naloxone effect.",
  "opioids+alcohol":
    "Opioid + alcohol co-ingestion — highly additive CNS and respiratory depression. Naloxone titrated to RR > 10; lateral positioning and airway monitoring essential. Alcohol component is not reversed by naloxone.",
  "benzodiazepine+alcohol":
    "Benzodiazepine + alcohol — compounding sedative-hypnotic effects. Very common co-ingestion. Aspiration risk is high; RSI threshold should be low. Both depress the respiratory drive.",
  "opioids+psychostimulants":
    "Opioid + stimulant (speedball pattern) — competing autonomic effects. Pupils may not be classically miotic; cardiovascular instability is likely. Naloxone may unmask an acute sympathomimetic surge — monitor closely after reversal.",
  "psychostimulants+tricyclic-antidepressants":
    "Stimulant + anticholinergic/TCA overlap — both produce mydriasis and tachycardia. Distinguish by skin (diaphoretic = sympathomimetic; dry = anticholinergic) and ECG (wide QRS = TCA). 12-lead ECG is mandatory.",
  "carbon-monoxide+cyanide":
    "CO + cyanide co-exposure — both are common in structural fires and enclosed-space events. High-flow O₂ addresses CO; escalate to RSI early for cyanide. HAZMAT and decontamination coordination critical.",
  "carbon-monoxide+opioids":
    "CO inhalation + opioid co-exposure — SpO₂ is unreliable; high-flow O₂ regardless. Titrate naloxone if opioid features (miosis, RD) are present. Both mechanisms need simultaneous management.",
  "carbon-monoxide+alcohol":
    "CO + alcohol — unconsciousness in enclosed space. SpO₂ falsely normal; give high-flow O₂ regardless. Check RBS — hypoglycaemia may compound CNS depression.",
  "carbon-monoxide+benzodiazepine":
    "CO inhalation + sedative-hypnotic — unconsciousness in enclosed space. High-flow O₂ for CO; airway management priority for sedation. Both mechanisms impair arousal and respiratory drive.",
  "opioids+cyanide":
    "Opioid OD + cyanide inhalation — both cause rapid CNS and respiratory collapse. Suspect in fire victims with opioid access. Give high-flow O₂ + naloxone; RSI early.",
};

function getMixedRationale(idA: string, idB: string, nameA: string, nameB: string): string {
  return (
    MIXED_RATIONALE[`${idA}+${idB}`] ??
    MIXED_RATIONALE[`${idB}+${idA}`] ??
    `${nameA} + ${nameB} — features from both toxidromes are present simultaneously. Evaluate which symptoms are unexplained by the primary pattern and consider combined management strategy with the receiving team.`
  );
}

// ─── Resolved profiles ───────────────────────────────────────────────────────

function getEntryByCode(code: string): CpgEntry {
  const entry = CPG_ENTRIES.find((item) => item.code === code);
  if (!entry) throw new Error(`Missing CPG entry for ${code}`);
  return entry;
}

export const TOXICOLOGY_PROFILES: ResolvedToxicologyProfile[] = PROFILE_DEFS.map((profile) => ({
  ...profile,
  entry: getEntryByCode(profile.cpgCode),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickSymptoms(ids: string[]): ToxicologySymptom[] {
  return ids.flatMap((id) => {
    const s = SYMPTOM_MAP.get(id);
    return s ? [s] : [];
  });
}

function detectContradictions(selected: Set<string>): string[] {
  return CONTRADICTIONS.filter(({ pair }) => selected.has(pair[0]) && selected.has(pair[1])).map(
    ({ message }) => message
  );
}

// ─── Main scoring function ────────────────────────────────────────────────────
//
// Scoring weights:
//   Exposure clue match : +4  (scene context is highest specificity)
//   Hallmark match      : +5  (key defining features)
//   All hallmarks bonus : +4  (completing the full pattern)
//   Supporting match    : +2  (corroborating but non-specific)
//   Counter-signal      : −3  (feature that argues against this toxidrome)
//
// Confidence tiers:
//   "strong"   : score ≥ 12, OR (all hallmarks present AND score ≥ 7)
//   "moderate" : score ≥ 7
//   "possible" : score ≥ 3 AND at least 1 hallmark matched
//
// Mixed detection:
//   For each secondary qualifying match, check if it has hallmarks NOT already
//   explained by the primary match. If so, flag as a mixed / co-ingestion signal.

export function getToxicologyMatches(selectedIds: string[]): ToxicologyResult {
  const selected = new Set(selectedIds);
  const contradictions = detectContradictions(selected);

  if (!selected.size) {
    return { matches: [], mixed: [], contradictions };
  }

  const rawMatches = TOXICOLOGY_PROFILES.map((profile): ToxicologyMatch | null => {
    const matchedHallmarks = pickSymptoms(profile.hallmarks.filter((id) => selected.has(id)));
    const matchedSupporting = pickSymptoms(profile.supporting.filter((id) => selected.has(id)));
    const matchedExposure = pickSymptoms((profile.exposureClues ?? []).filter((id) => selected.has(id)));
    const counterCount = (profile.counterSignals ?? []).filter((id) => selected.has(id)).length;

    const allHallmarksPresent =
      profile.hallmarks.length >= 2 &&
      matchedHallmarks.length === profile.hallmarks.length;

    let score =
      matchedExposure.length * 4 +
      matchedHallmarks.length * 5 +
      matchedSupporting.length * 2 -
      counterCount * 3;

    if (allHallmarksPresent) score += 4;

    let confidence: ToxicologyConfidence | null = null;

    if (score >= 12 || (allHallmarksPresent && score >= 7)) {
      confidence = "strong";
    } else if (score >= 7) {
      confidence = "moderate";
    } else if (score >= 3 && matchedHallmarks.length >= 1) {
      confidence = "possible";
    }

    if (!confidence) return null;

    return {
      profile,
      entry: profile.entry,
      score,
      confidence,
      matchedHallmarks,
      matchedSupporting,
      matchedExposure,
      allHallmarksPresent,
    };
  });

  const matches = rawMatches
    .filter((m): m is ToxicologyMatch => m !== null)
    .sort((a, b) => b.score - a.score || a.entry.printedPage - b.entry.printedPage);

  // ── Mixed / co-ingestion detection ────────────────────────────────────────
  const mixed: MixedSuggestion[] = [];

  if (matches.length >= 2) {
    const primary = matches[0];

    // Symptoms already accounted for by the primary match
    const primaryExplained = new Set([
      ...primary.matchedHallmarks.map((s) => s.id),
      ...primary.matchedSupporting.map((s) => s.id),
      ...primary.matchedExposure.map((s) => s.id),
    ]);

    for (const secondary of matches.slice(1)) {
      // Find hallmarks of secondary that are NOT explained by the primary match
      const unexplainedHallmarks = secondary.matchedHallmarks.filter(
        (s) => !primaryExplained.has(s.id)
      );

      if (unexplainedHallmarks.length === 0) continue;

      // Skip if primary's hallmarks are counter-signals in secondary (incompatible profiles)
      const primaryCountersSecondary = (secondary.profile.counterSignals ?? []).some((cid) =>
        primary.matchedHallmarks.some((h) => h.id === cid)
      );
      if (primaryCountersSecondary) continue;

      mixed.push({
        primary: primary.profile,
        secondary: secondary.profile,
        unexplainedHallmarks,
        rationale: getMixedRationale(
          primary.profile.id,
          secondary.profile.id,
          primary.profile.toxidrome,
          secondary.profile.toxidrome
        ),
      });
    }
  }

  return { matches, mixed, contradictions };
}
