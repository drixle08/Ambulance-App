export type CpgEntry = {
  code: string;
  title: string;
  section: string;
  printedPage: number;
  keywords: string[];
};

export const CPG_ENTRIES: CpgEntry[] = [
  {
    code: "CPG 1.1",
    title: "Clinical Approach and Assessment of the Adult Patient",
    section: "CLINICAL APPROACH AND PATIENT ASSESSMENT",
    printedPage: 17,
    keywords: ["cpg 1.1", "adult", "assessment", "clinical approach", "adult patient"],
  },
  {
    code: "CPG 1.2",
    title: "Clinical Approach and Assessment of the Paediatric Patient",
    section: "CLINICAL APPROACH AND PATIENT ASSESSMENT",
    printedPage: 20,
    keywords: ["cpg 1.2", "paediatric", "pediatric", "assessment", "clinical approach", "child"],
  },
  {
    code: "CPG 1.3",
    title: "Clinical Approach and Assessment of the Obstetric Patient",
    section: "CLINICAL APPROACH AND PATIENT ASSESSMENT",
    printedPage: 24,
    keywords: ["cpg 1.3", "obstetric", "pregnancy", "assessment", "clinical approach"],
  },
  {
    code: "CPG 1.4",
    title: "Consciousness Status Assessment",
    section: "CLINICAL APPROACH AND PATIENT ASSESSMENT",
    printedPage: 26,
    keywords: ["cpg 1.4", "consciousness", "gcs", "avpu", "mental status"],
  },
  {
    code: "CPG 1.5",
    title: "Airway & Respiratory Status Assessment",
    section: "CLINICAL APPROACH AND PATIENT ASSESSMENT",
    printedPage: 28,
    keywords: ["cpg 1.5", "airway", "respiratory", "assessment", "breathing"],
  },
  {
    code: "CPG 1.6",
    title: "Perfusion Status Assessment",
    section: "CLINICAL APPROACH AND PATIENT ASSESSMENT",
    printedPage: 30,
    keywords: ["cpg 1.6", "perfusion", "circulation", "shock", "assessment"],
  },
  {
    code: "CPG 1.7",
    title: "Mental Status Assessment",
    section: "CLINICAL APPROACH AND PATIENT ASSESSMENT",
    printedPage: 31,
    keywords: ["cpg 1.7", "mental status", "neurological", "assessment"],
  },
  {
    code: "CPG 1.8",
    title: "Qatar Early Warning Score (QEWS)",
    section: "CLINICAL APPROACH AND PATIENT ASSESSMENT",
    printedPage: 32,
    keywords: ["cpg 1.8", "qews", "early warning score", "qatar ews", "risk score"],
  },
  {
    code: "CPG 2.1",
    title: "Adult Medical Cardiac Arrest",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 34,
    keywords: ["cpg 2.1", "adult arrest", "medical arrest", "cpr", "als"],
  },
  {
    code: "CPG 2.2",
    title: "Adult Trauma Cardiac Arrest",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 38,
    keywords: ["cpg 2.2", "trauma arrest", "adult", "cpr", "hemorrhage"],
  },
  {
    code: "CPG 2.3",
    title: "Paediatric Medical Cardiac Arrest",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 41,
    keywords: ["cpg 2.3", "pediatric arrest", "paediatric arrest", "medical arrest", "cpr"],
  },
  {
    code: "CPG 2.4",
    title: "Paediatric Trauma Cardiac Arrest",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 45,
    keywords: ["cpg 2.4", "pediatric trauma arrest", "paediatric trauma arrest", "cpr", "trauma"],
  },
  {
    code: "CPG 2.5",
    title: "Resuscitation of the New-born & Neonates",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 48,
    keywords: ["cpg 2.5", "neonate", "newborn", "resuscitation", "nrp"],
  },
  {
    code: "CPG 2.6",
    title: "Post Cardiac Arrest (ROSC) Care",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 51,
    keywords: ["cpg 2.6", "rosc", "post arrest", "post resuscitation", "cooling"],
  },
  {
    code: "CPG 2.7",
    title: "Termination of Resuscitation / Declaration of Death",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 54,
    keywords: ["cpg 2.7", "termination", "stop resuscitation", "declaration of death", "tor"],
  },
  {
    code: "CPG 2.8",
    title: "Cardiac Arrest - Special Circumstances",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 55,
    keywords: ["cpg 2.8", "special circumstances", "pregnancy arrest", "hypothermia arrest", "drowning"],
  },
  {
    code: "CPG 2.9",
    title: "ECMO Pathway Inclusion Criteria",
    section: "CARDIAC ARREST - RESUSCITATION",
    printedPage: 56,
    keywords: ["cpg 2.9", "ecmo", "pathway", "inclusion", "criteria"],
  },
  {
    code: "CPG 3.1",
    title: "Stroke",
    section: "NEUROLOGICAL",
    printedPage: 58,
    keywords: ["cpg 3.1", "stroke", "cva", "tia", "fast", "neurological"],
  },
  {
    code: "CPG 3.2",
    title: "Seizures",
    section: "NEUROLOGICAL",
    printedPage: 61,
    keywords: ["cpg 3.2", "seizure", "status", "epilepsy", "convulsion"],
  },
  {
    code: "CPG 4.1",
    title: "Acute Coronary Syndrome",
    section: "CARDIAC",
    printedPage: 65,
    keywords: ["cpg 4.1", "acs", "chest pain", "stemi", "nstemi"],
  },
  {
    code: "CPG 4.2",
    title: "Bradyarrhythmias",
    section: "CARDIAC",
    printedPage: 69,
    keywords: ["cpg 4.2", "bradycardia", "brady", "slow heart", "arrhythmia"],
  },
  {
    code: "CPG 4.3",
    title: "Tachyarrhythmias – Broad complex",
    section: "CARDIAC",
    printedPage: 71,
    keywords: ["cpg 4.3", "tachycardia", "wide complex", "vt", "arrhythmia"],
  },
  {
    code: "CPG 4.4",
    title: "Tachyarrhythmias – Narrow complex",
    section: "CARDIAC",
    printedPage: 73,
    keywords: ["cpg 4.4", "svt", "narrow complex", "tachycardia", "arrhythmia"],
  },
  {
    code: "CPG 4.5",
    title: "Acute Pulmonary Oedema",
    section: "CARDIAC",
    printedPage: 76,
    keywords: ["cpg 4.5", "pulmonary edema", "pulmonary oedema", "heart failure", "congestive"],
  },
  {
    code: "CPG 4.6",
    title: "Cardiogenic Shock",
    section: "CARDIAC",
    printedPage: 78,
    keywords: ["cpg 4.6", "cardiogenic shock", "shock", "pump failure", "low output"],
  },
  {
    code: "CPG 4.7",
    title: "Acute Aortic Dissection",
    section: "CARDIAC",
    printedPage: 80,
    keywords: ["cpg 4.7", "aortic dissection", "dissection", "chest pain", "back pain"],
  },
  {
    code: "CPG 5.1",
    title: "Asthma",
    section: "RESPIRATORY",
    printedPage: 84,
    keywords: ["cpg 5.1", "asthma", "wheeze", "bronchospasm"],
  },
  {
    code: "CPG 5.2",
    title: "Chronic Obstructive Pulmonary Disease (COPD)",
    section: "RESPIRATORY",
    printedPage: 87,
    keywords: ["cpg 5.2", "copd", "chronic obstructive", "emphysema", "bronchitis"],
  },
  {
    code: "CPG 5.3",
    title: "Croup",
    section: "RESPIRATORY",
    printedPage: 89,
    keywords: ["cpg 5.3", "croup", "stridor", "upper airway"],
  },
  {
    code: "CPG 5.4",
    title: "Epiglottitis",
    section: "RESPIRATORY",
    printedPage: 92,
    keywords: ["cpg 5.4", "epiglottitis", "airway", "stridor", "infection"],
  },
  {
    code: "CPG 5.5",
    title: "Foreign Body Airway Obstruction",
    section: "RESPIRATORY",
    printedPage: 94,
    keywords: ["cpg 5.5", "choking", "fbao", "foreign body", "airway obstruction"],
  },
  {
    code: "CPG 5.6",
    title: "Hyperventilation",
    section: "RESPIRATORY",
    printedPage: 96,
    keywords: ["cpg 5.6", "hyperventilation", "panic", "respiratory alkalosis"],
  },
  {
    code: "CPG 5.7",
    title: "Pulmonary Embolism",
    section: "RESPIRATORY",
    printedPage: 98,
    keywords: ["cpg 5.7", "pe", "embolism", "clot", "dyspnea"],
  },
  {
    code: "CPG 5.8",
    title: "Severe Respiratory Infection",
    section: "RESPIRATORY",
    printedPage: 100,
    keywords: ["cpg 5.8", "respiratory infection", "pneumonia", "severe infection"],
  },
  {
    code: "CPG 5.9",
    title: "Tracheostomy Emergencies",
    section: "RESPIRATORY",
    printedPage: 102,
    keywords: ["cpg 5.9", "tracheostomy", "trach emergency", "stoma", "airway"],
  },
  {
    code: "CPG 6.1",
    title: "Abdominal Emergencies (Non-traumatic)",
    section: "MEDICAL",
    printedPage: 106,
    keywords: ["cpg 6.1", "abdominal pain", "abdomen", "non-traumatic", "gastro"],
  },
  {
    code: "CPG 6.2",
    title: "Anaphylaxis and Allergic Reactions",
    section: "MEDICAL",
    printedPage: 108,
    keywords: ["cpg 6.2", "anaphylaxis", "allergy", "allergic reaction", "epi"],
  },
  {
    code: "CPG 6.3",
    title: "Hypoglycaemia and Hyperglycaemia",
    section: "MEDICAL",
    printedPage: 112,
    keywords: ["cpg 6.3", "hypoglycemia", "hyperglycemia", "diabetes", "low sugar", "high sugar"],
  },
  {
    code: "CPG 6.4",
    title: "Nausea and Vomiting",
    section: "MEDICAL",
    printedPage: 115,
    keywords: ["cpg 6.4", "nausea", "vomiting", "antiemetic", "ondansetron"],
  },
  {
    code: "CPG 6.5",
    title: "Non-Traumatic Shock",
    section: "MEDICAL",
    printedPage: 117,
    keywords: ["cpg 6.5", "shock", "non-traumatic", "hypotension", "perfusion"],
  },
  {
    code: "CPG 6.6",
    title: "Sepsis",
    section: "MEDICAL",
    printedPage: 119,
    keywords: ["cpg 6.6", "sepsis", "infection", "septic shock", "qsofa"],
  },
  {
    code: "CPG 6.7",
    title: "Adrenal Insufficiency",
    section: "MEDICAL",
    printedPage: 123,
    keywords: ["cpg 6.7", "adrenal insufficiency", "adrenal crisis", "hydrocortisone", "steroid"],
  },
  {
    code: "CPG 7.1",
    title: "Acute Behavioural Disturbance",
    section: "MENTAL HEALTH AND BEHAVIOURAL DISTURBANCES",
    printedPage: 127,
    keywords: ["cpg 7.1", "behavioural", "behavioral", "abd", "agitation", "sedation"],
  },
  {
    code: "CPG 8.1",
    title: "Benzodiazepine",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 134,
    keywords: ["cpg 8.1", "benzodiazepine", "benzo", "overdose", "toxicity"],
  },
  {
    code: "CPG 8.2",
    title: "Beta Blocker",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 136,
    keywords: ["cpg 8.2", "beta blocker", "beta-blocker", "overdose", "toxicity"],
  },
  {
    code: "CPG 8.3",
    title: "Calcium Channel Blocker",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 138,
    keywords: ["cpg 8.3", "calcium channel blocker", "ccb", "overdose", "toxicity"],
  },
  {
    code: "CPG 8.4",
    title: "Carbon Monoxide",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 140,
    keywords: ["cpg 8.4", "carbon monoxide", "co", "poisoning"],
  },
  {
    code: "CPG 8.5",
    title: "Cyanide",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 142,
    keywords: ["cpg 8.5", "cyanide", "poisoning", "toxic"],
  },
  {
    code: "CPG 8.6",
    title: "Opioids",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 144,
    keywords: ["cpg 8.6", "opioid", "opiate", "overdose", "naloxone"],
  },
  {
    code: "CPG 8.7",
    title: "Organophosphates",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 146,
    keywords: ["cpg 8.7", "organophosphate", "cholinergic", "pesticide", "poisoning"],
  },
  {
    code: "CPG 8.8",
    title: "Psychostimulants",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 148,
    keywords: ["cpg 8.8", "stimulant", "amphetamine", "cocaine", "toxicity"],
  },
  {
    code: "CPG 8.9",
    title: "Tricyclic Antidepressants",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 151,
    keywords: ["cpg 8.9", "tca", "tricyclic", "overdose", "toxicity"],
  },
  {
    code: "CPG 8.10",
    title: "Alcohol Intoxication",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 153,
    keywords: ["cpg 8.10", "alcohol", "intoxication", "ethanol", "drunk"],
  },
  {
    code: "CPG 8.11",
    title: "Envenomation",
    section: "TOXICOLOGY AND TOXINOLOGY",
    printedPage: 156,
    keywords: ["cpg 8.11", "envenomation", "snake bite", "sting", "toxicity"],
  },
  {
    code: "CPG 9.1",
    title: "Heat-Related Disorders",
    section: "ENVIRONMENTAL",
    printedPage: 160,
    keywords: ["cpg 9.1", "heat", "heat stroke", "heat exhaustion", "hyperthermia"],
  },
  {
    code: "CPG 9.2",
    title: "Cold-Related Disorders",
    section: "ENVIRONMENTAL",
    printedPage: 163,
    keywords: ["cpg 9.2", "cold", "hypothermia", "frostbite"],
  },
  {
    code: "CPG 10.1",
    title: "Major Haemorrhage and Haemorrhagic Shock",
    section: "TRAUMA",
    printedPage: 167,
    keywords: ["cpg 10.1", "hemorrhage", "haemorrhage", "bleeding", "shock", "massive transfusion"],
  },
  {
    code: "CPG 10.2",
    title: "Traumatic Brain Injury",
    section: "TRAUMA",
    printedPage: 169,
    keywords: ["cpg 10.2", "tbi", "brain injury", "head injury", "traumatic"],
  },
  {
    code: "CPG 10.3",
    title: "Spinal Trauma",
    section: "TRAUMA",
    printedPage: 171,
    keywords: ["cpg 10.3", "spinal", "spine", "cord injury", "trauma"],
  },
  {
    code: "CPG 10.4",
    title: "Chest Trauma",
    section: "TRAUMA",
    printedPage: 174,
    keywords: ["cpg 10.4", "chest trauma", "thoracic injury", "rib fracture", "pneumothorax"],
  },
  {
    code: "CPG 10.5",
    title: "Abdominal Trauma",
    section: "TRAUMA",
    printedPage: 177,
    keywords: ["cpg 10.5", "abdominal trauma", "abdomen injury", "penetrating", "blunt"],
  },
  {
    code: "CPG 10.6",
    title: "Pelvic Trauma",
    section: "TRAUMA",
    printedPage: 179,
    keywords: ["cpg 10.6", "pelvic trauma", "pelvis fracture", "binder"],
  },
  {
    code: "CPG 10.7",
    title: "Limb Trauma",
    section: "TRAUMA",
    printedPage: 181,
    keywords: ["cpg 10.7", "limb trauma", "fracture", "extremity", "dislocation"],
  },
  {
    code: "CPG 10.8",
    title: "Trauma in Pregnancy",
    section: "TRAUMA",
    printedPage: 183,
    keywords: ["cpg 10.8", "pregnancy trauma", "obstetric trauma", "pregnant"],
  },
  {
    code: "CPG 10.9",
    title: "Burns",
    section: "TRAUMA",
    printedPage: 185,
    keywords: ["cpg 10.9", "burns", "thermal injury", "inhalation", "burn calculation"],
  },
  {
    code: "CPG 10.10",
    title: "Trauma Bypass Criteria",
    section: "TRAUMA",
    printedPage: 188,
    keywords: ["cpg 10.10", "trauma bypass", "bypass criteria", "major trauma"],
  },
  {
    code: "CPG 10.11",
    title: "Crush Injury",
    section: "TRAUMA",
    printedPage: 190,
    keywords: ["cpg 10.11", "crush injury", "compartment", "rhabdo", "hyperkalemia"],
  },
  {
    code: "CPG 10.12",
    title: "Ongoing Trauma Care Checklist",
    section: "TRAUMA",
    printedPage: 193,
    keywords: ["cpg 10.12", "ongoing trauma care", "trauma checklist", "major trauma", "transfer"],
  },
  {
    code: "CPG 11.1",
    title: "Rapid Sequence Induction",
    section: "RAPID SEQUENCE INDUCTION, MECHANICAL VENTILATION AND SAFE SEDATION",
    printedPage: 195,
    keywords: ["cpg 11.1", "rsi", "intubation", "rapid sequence"],
  },
  {
    code: "CPG 11.2",
    title: "Failed Intubation Drill",
    section: "RAPID SEQUENCE INDUCTION, MECHANICAL VENTILATION AND SAFE SEDATION",
    printedPage: 199,
    keywords: ["cpg 11.2", "failed intubation", "can not intubate", "airway drill", "crisis"],
  },
  {
    code: "CPG 11.3",
    title: "Procedural Sedation",
    section: "RAPID SEQUENCE INDUCTION, MECHANICAL VENTILATION AND SAFE SEDATION",
    printedPage: 200,
    keywords: ["cpg 11.3", "procedural sedation", "sedation", "safe sedation", "analgesia"],
  },
  {
    code: "CPG 11.4",
    title: "Mechanical Ventilation",
    section: "RAPID SEQUENCE INDUCTION, MECHANICAL VENTILATION AND SAFE SEDATION",
    printedPage: 204,
    keywords: ["cpg 11.4", "ventilation", "mechanical ventilation", "ventilator", "settings"],
  },
  {
    code: "CPG 11.5",
    title: "RSI Quick Reference Guide & Checklist",
    section: "RAPID SEQUENCE INDUCTION, MECHANICAL VENTILATION AND SAFE SEDATION",
    printedPage: 207,
    keywords: ["cpg 11.5", "rsi checklist", "quick reference", "airway checklist"],
  },
  {
    code: "CPG 12.1",
    title: "Ectopic Pregnancy",
    section: "OBSTETRICS",
    printedPage: 210,
    keywords: ["cpg 12.1", "ectopic", "pregnancy", "abdominal pain", "obstetric"],
  },
  {
    code: "CPG 12.2",
    title: "Miscarriage",
    section: "OBSTETRICS",
    printedPage: 212,
    keywords: ["cpg 12.2", "miscarriage", "pregnancy loss", "bleeding"],
  },
  {
    code: "CPG 12.3",
    title: "Placenta Abruption",
    section: "OBSTETRICS",
    printedPage: 214,
    keywords: ["cpg 12.3", "placental abruption", "abruption", "bleeding", "obstetric emergency"],
  },
  {
    code: "CPG 12.4",
    title: "Placenta Praevia",
    section: "OBSTETRICS",
    printedPage: 216,
    keywords: ["cpg 12.4", "placenta previa", "praevia", "bleeding", "pregnancy"],
  },
  {
    code: "CPG 12.5",
    title: "Pre-eclampsia and Eclampsia",
    section: "OBSTETRICS",
    printedPage: 218,
    keywords: ["cpg 12.5", "pre-eclampsia", "eclampsia", "pregnancy hypertension", "seizure"],
  },
  {
    code: "CPG 12.6",
    title: "Umbilical Cord Prolapse",
    section: "OBSTETRICS",
    printedPage: 221,
    keywords: ["cpg 12.6", "cord prolapse", "umbilical", "pregnancy emergency"],
  },
  {
    code: "CPG 12.7",
    title: "Imminent Delivery",
    section: "OBSTETRICS",
    printedPage: 223,
    keywords: ["cpg 12.7", "delivery", "birth", "labour", "obstetric"],
  },
  {
    code: "CPG 12.8",
    title: "Breech Presentation",
    section: "OBSTETRICS",
    printedPage: 226,
    keywords: ["cpg 12.8", "breech", "delivery", "obstetric"],
  },
  {
    code: "CPG 12.9",
    title: "Pre-term Labour",
    section: "OBSTETRICS",
    printedPage: 228,
    keywords: ["cpg 12.9", "preterm", "pre-term", "labour", "premature"],
  },
  {
    code: "CPG 12.10",
    title: "Post Delivery (or 3rd Stage) Complications",
    section: "OBSTETRICS",
    printedPage: 230,
    keywords: ["cpg 12.10", "postpartum", "post delivery", "hemorrhage", "complications"],
  },
  {
    code: "CPG 12.11",
    title: "APGAR Score",
    section: "OBSTETRICS",
    printedPage: 233,
    keywords: ["cpg 12.11", "apgar", "newborn score", "neonate", "assessment"],
  },
  {
    code: "CPG 12.12",
    title: "Obs/Gynae Bypass Criteria",
    section: "OBSTETRICS",
    printedPage: 234,
    keywords: ["cpg 12.12", "obgyn bypass", "ob gyn bypass", "criteria", "transfer"],
  },
  {
    code: "CPG 13.1",
    title: "Pain Management",
    section: "OTHER",
    printedPage: 236,
    keywords: ["cpg 13.1", "pain", "analgesia", "analgesic", "pain control"],
  },
  {
    code: "CPG 13.2",
    title: "Multiple Casualty Incidents",
    section: "OTHER",
    printedPage: 239,
    keywords: ["cpg 13.2", "mci", "multiple casualty", "mass casualty", "triage"],
  },
  {
    code: "CPG 13.3",
    title: "Patient Refusal of Treatment or Transport",
    section: "OTHER",
    printedPage: 243,
    keywords: ["cpg 13.3", "refusal", "ama", "against medical advice", "decline transport"],
  },
  {
    code: "CPG 13.4",
    title: "Submersion Incident",
    section: "OTHER",
    printedPage: 244,
    keywords: ["cpg 13.4", "submersion", "drowning", "near drowning", "water rescue"],
  },
  {
    code: "CPG 13.5",
    title: "HAZMAT Incident",
    section: "OTHER",
    printedPage: 246,
    keywords: ["cpg 13.5", "hazmat", "hazardous materials", "chemical", "decon"],
  },
  {
    code: "CPG 13.6",
    title: "IMIST-AMBO Handover",
    section: "OTHER",
    printedPage: 247,
    keywords: ["cpg 13.6", "imist", "ambo", "handover", "communication"],
  },
  {
    code: "CPG 13.7",
    title: "Sexual Assault",
    section: "OTHER",
    printedPage: 248,
    keywords: ["cpg 13.7", "sexual assault", "safeguarding", "forensic", "support"],
  },
  {
    code: "CPG 13.8",
    title: "Epistaxis (Non-traumatic)",
    section: "OTHER",
    printedPage: 249,
    keywords: ["cpg 13.8", "epistaxis", "nosebleed", "non-traumatic", "txa"],
  },
  {
    code: "CPG 14.1",
    title: "Elderly Patients (>65 years old)",
    section: "VULNERABLE PATIENTS",
    printedPage: 252,
    keywords: ["cpg 14.1", "elderly", "geriatrics", "older adult", "aging"],
  },
  {
    code: "CPG 14.2",
    title: "Bariatric Patients",
    section: "VULNERABLE PATIENTS",
    printedPage: 255,
    keywords: ["cpg 14.2", "bariatric", "obesity", "heavy patient", "large patient"],
  },
  {
    code: "CPG 14.3",
    title: "Patients Receiving Renal Dialysis",
    section: "VULNERABLE PATIENTS",
    printedPage: 257,
    keywords: ["cpg 14.3", "renal dialysis", "dialysis", "ckd", "renal"],
  },
  {
    code: "CPG 15.1",
    title: "Continuation of Previously Prescribed Medication",
    section: "INTER-FACILITY TRANSFER GUIDELINES",
    printedPage: 261,
    keywords: ["cpg 15.1", "continuation", "prescribed medication", "transfer", "medication"],
  },
  {
    code: "CPG 15.2",
    title: "Use of Specialist Medication During Transfer",
    section: "INTER-FACILITY TRANSFER GUIDELINES",
    printedPage: 264,
    keywords: ["cpg 15.2", "specialist medication", "transfer", "drip", "infusion"],
  },
  {
    code: "CPG 15.3",
    title: "Drug Chart for frequently used transfer medications",
    section: "INTER-FACILITY TRANSFER GUIDELINES",
    printedPage: 265,
    keywords: ["cpg 15.3", "drug chart", "transfer medications", "reference"],
  },
  {
    code: "CPG 15.4",
    title: "AP Transfer of Patients with Infusion Devices",
    section: "INTER-FACILITY TRANSFER GUIDELINES",
    printedPage: 268,
    keywords: ["cpg 15.4", "transfer", "infusion devices", "pump", "drip", "isdn", "isosorbide", "blood products"],
  },
  {
    code: "CPG 15.5",
    title: "RASS",
    section: "INTER-FACILITY TRANSFER GUIDELINES",
    printedPage: 270,
    keywords: ["cpg 15.5", "rass", "sedation scale", "agitation scale"],
  },
  {
    code: "CPG 15.6",
    title: "Retrieval Service Patient Transfer Checklist",
    section: "INTER-FACILITY TRANSFER GUIDELINES",
    printedPage: 271,
    keywords: ["cpg 15.6", "retrieval", "transfer checklist", "handover"],
  },
  {
    code: "CPG 16.1",
    title: "Clinical Approach to Scheduled Ambulance Service Transfer Patients",
    section: "SCHEDULED AMBULANCE SERVICE GUIDELINES",
    printedPage: 273,
    keywords: ["cpg 16.1", "scheduled transfer", "non emergency", "clinical approach", "sas"],
  },
  {
    code: "CPG 17.1",
    title: "Respiratory Distress/Hypoxaemia in Suspected/Confirmed COVID-19 Patients",
    section: "COVID-19 CLINICAL GUIDELINES",
    printedPage: 277,
    keywords: ["cpg 17.1", "covid", "respiratory distress", "hypoxemia", "covid-19"],
  },
  {
    code: "CPG 17.2",
    title: "Cardiac Arrest Management in Suspected/Confirmed COVID-19 Patient",
    section: "COVID-19 CLINICAL GUIDELINES",
    printedPage: 279,
    keywords: ["cpg 17.2", "covid", "cardiac arrest", "covid arrest", "resuscitation"],
  },
];

// ─── Formulary / Medication entries ──────────────────────────────────────────

export type MedicationEntry = {
  name: string;
  aliases: string[];   // common synonyms / trade names
  formularyPage: number; // printed page in CPG formulary
  class?: string;      // drug class hint for display
};

/** Exact formulary page numbers sourced from CPG v2.5 (2026) formulary. */
export const MEDICATION_ENTRIES: MedicationEntry[] = [
  { name: "Adenosine", aliases: ["adenocard", "svt", "18 mg", "third dose"], formularyPage: 281, class: "Antiarrhythmic" },
  { name: "Adrenaline", aliases: ["epinephrine", "epi", "adrenalin"], formularyPage: 284, class: "Sympathomimetic" },
  { name: "Amiodarone", aliases: ["cordarone"], formularyPage: 288, class: "Antiarrhythmic" },
  { name: "Aspirin", aliases: ["acetylsalicylic acid", "asa", "aspro"], formularyPage: 291, class: "Antiplatelet" },
  { name: "Atropine", aliases: ["atropine sulfate"], formularyPage: 293, class: "Anticholinergic" },
  { name: "Budesonide", aliases: ["pulmicort", "rhinocort"], formularyPage: 296, class: "Corticosteroid" },
  { name: "Calcium Chloride", aliases: ["calcium", "cacl2"], formularyPage: 298, class: "Electrolyte" },
  { name: "Clopidogrel", aliases: ["plavix", "600 mg", "stemi"], formularyPage: 300, class: "Antiplatelet" },
  { name: "Dexamethasone", aliases: ["dexamethasone", "dex", "decadron"], formularyPage: 302, class: "Corticosteroid" },
  { name: "Dextrose", aliases: ["glucose", "d50", "d10", "d5w", "dextrose 50%", "dextrose 10%"], formularyPage: 305, class: "Glucose" },
  { name: "Diclofenac", aliases: ["voltaren", "nsaid"], formularyPage: 308, class: "NSAID" },
  { name: "Diphenhydramine", aliases: ["benadryl", "antihistamine"], formularyPage: 310, class: "Antihistamine" },
  { name: "Droperidol", aliases: ["inapsine", "dridol"], formularyPage: 313, class: "Antiemetic / Sedative" },
  { name: "Fentanyl", aliases: ["sublimaze"], formularyPage: 316, class: "Opioid" },
  { name: "Furosemide", aliases: ["lasix", "frusemide"], formularyPage: 320, class: "Loop Diuretic" },
  { name: "Glucagon", aliases: ["glucagen"], formularyPage: 322, class: "Glucose" },
  { name: "Glycerol Trinitrate", aliases: ["gtn", "nitroglycerin", "nitro", "ntg", "anginine"], formularyPage: 325, class: "Nitrate" },
  { name: "Hydrocortisone", aliases: ["solu-cortef", "cortisol", "adrenal insufficiency", "adrenal crisis"], formularyPage: 327, class: "Corticosteroid" },
  { name: "Ibuprofen", aliases: ["nurofen", "brufen", "nsaid"], formularyPage: 330, class: "NSAID" },
  { name: "Ipratropium Bromide", aliases: ["atrovent", "ipratropium"], formularyPage: 333, class: "Bronchodilator" },
  { name: "Ketamine", aliases: ["ketalar", "ket"], formularyPage: 336, class: "Dissociative Anaesthetic" },
  { name: "Ketorolac", aliases: ["toradol"], formularyPage: 341, class: "NSAID" },
  { name: "Magnesium Sulphate", aliases: ["magnesium sulfate", "mg", "mag", "magnesium"], formularyPage: 344, class: "Electrolyte / Bronchodilator" },
  { name: "Methoxyflurane", aliases: ["penthrox", "green whistle", "penthrox inhaler"], formularyPage: 347, class: "Analgesic" },
  { name: "Metoclopramide", aliases: ["maxolon", "reglan"], formularyPage: 349, class: "Antiemetic" },
  { name: "Midazolam", aliases: ["versed", "hypnovel", "midaz"], formularyPage: 351, class: "Benzodiazepine" },
  { name: "Naloxone", aliases: ["narcan", "naxalone"], formularyPage: 354, class: "Opioid Antagonist" },
  { name: "Noradrenaline", aliases: ["norepinephrine", "levophed", "norepi"], formularyPage: 357, class: "Vasopressor" },
  { name: "Ondansetron", aliases: ["zofran", "ondan"], formularyPage: 359, class: "Antiemetic" },
  { name: "Paracetamol", aliases: ["acetaminophen", "panadol", "perfalgan", "tylenol", "iv paracetamol", "paediatric"], formularyPage: 362, class: "Analgesic / Antipyretic" },
  { name: "Phenylephrine", aliases: ["neosynephrine", "neo-synephrine"], formularyPage: 365, class: "Vasopressor" },
  { name: "Prochlorperazine", aliases: ["stemetil", "compazine"], formularyPage: 367, class: "Antiemetic" },
  { name: "Rocuronium", aliases: ["zemuron", "esmeron", "roc"], formularyPage: 369, class: "Neuromuscular Blocker" },
  { name: "Salbutamol", aliases: ["albuterol", "ventolin", "salbutol"], formularyPage: 372, class: "Bronchodilator" },
  { name: "Succinylcholine", aliases: ["suxamethonium", "sux", "anectine"], formularyPage: 375, class: "Neuromuscular Blocker" },
  { name: "Tranexamic Acid", aliases: ["txa", "cyklokapron", "epistaxis", "nosebleed"], formularyPage: 377, class: "Antifibrinolytic" },
  { name: "Vecuronium", aliases: ["norcuron", "vec"], formularyPage: 380, class: "Neuromuscular Blocker" },
];

export function searchMedications(query: string): MedicationEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return MEDICATION_ENTRIES.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.aliases.some((a) => a.toLowerCase().includes(q)) ||
      (m.class ?? "").toLowerCase().includes(q)
  ).slice(0, 8);
}

/**
 * Normalize a slug or code string into a comparable identifier.
 * - Lowercases
 * - Replaces spaces/dots with hyphens
 * - Drops other non-alphanumeric/hyphen chars
 */
export function normalizeCpgSlug(input: string): string {
  return decodeURIComponent(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\./g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Find a CPG entry by a URL slug (e.g., "cpg-1-1" or "clinical-approach-and-assessment-of-the-adult-patient").
 * Matches against normalized code and title.
 */
export function findCpgEntryBySlug(slug: string): CpgEntry | undefined {
  const normalized = normalizeCpgSlug(slug);
  return CPG_ENTRIES.find((entry) => {
    const normalizedCode = normalizeCpgSlug(entry.code);
    const normalizedTitle = normalizeCpgSlug(entry.title);
    return normalized === normalizedCode || normalized === normalizedTitle;
  });
}
