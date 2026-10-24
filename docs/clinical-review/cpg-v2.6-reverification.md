# Clinical values re-verified against CPG v2.6

**Date:** 2026-10-23 · **Source checked:** `public/reference/cpg/cpg-v2.6-2026.pdf` (CPG v2.6, approved 07/09/2026) · **Compared with:** `cpg-v2.5-2026.pdf` as it existed at `21d409d` · **Code at:** `ui-audit-fixes` @ `3aa4e07` · **Report only: no clinical value was changed**

> **Follow-up (2026-10-24).** Actioned since this report:
> - `3e7bb09`: the §3 citation corrections, and the stale post-ROSC SpO₂ comments (§2a).
> - `7020da5`: the §4 proposal, built — `lib/cpgEdition.json`, `cpgRef`/`cpgAbsent` references on each value, and `npm run cpg:reverify`.
>
> Still open for clinical governance: §5 items 1–8 (the paediatric weight bands, the six §1 partial findings, and the Mg algorithm vs formulary discrepancy). §5 item 9 (WAAFELSS joules, GCS label) is handled in separate commits.

## How this was checked

- **Text extraction:** both PDFs were extracted page by page with pdf.js. In both, the printed page number equals the PDF page index, so every page number below is the printed page.
- **Value checks:** each value was found in the v2.6 text by searching for the CPG's own wording. Formulary dosing and algorithm entries were both checked where both exist.
- **Version differences:** each v2.5 page was matched to its v2.6 counterpart, and the two were compared word by word. Differences that were only text-extraction spacing were ignored. The full list of numeric changes is in §2b.
- **Limitation:** values that exist only as images in the PDF can't be read this way. All the values below were present as text.

**Result legend:**
- **✅ Match:** the code value equals the v2.6 value.
- **⚠️ Partial:** the core value matches, but the code adds, omits or conflicts with part of the v2.6 entry.
- **❌ Mismatch:** the code contradicts v2.6.
- **— Extended scope:** the code value isn't in the CPG. The "not in CPG" claim was re-checked against v2.6.

---

## Summary

- **Every value changed in the 17 August fixes still matches v2.6.** None of the corrected numbers moved in the September update.
- **Two code comments are now wrong in v2.6.** They say "SpO₂ 94–98% / avoiding hyperoxia is not in the CPG". v2.6 added exactly that for post-ROSC patients (p.54). See §2.
- **Several app values outside the audited set changed in v2.6.** Most were already updated by `efbed0b`, but one wasn't: the Vitals tool's paediatric weight bands. v2.6 is itself inconsistent on these bands (p.21 vs p.289). See §2b.
- **Six ⚠️ partial findings, all present in v2.5 too:**
  - GTN APO SL "max 3 doses" has no source.
  - GTN APO IV omits the 100–300 mcg/min CCP titration range.
  - Dexamethasone omits "Adults ≥ 18 years only" and the withhold rules.
  - The noradrenaline preparation is the transfer-chart dilution, not the formulary one.
  - The "Defib pads on" item lists anterolateral first.
  - The asthma algorithm (Mg 1–2 g) differs from the formulary (2 g); this is a CPG inconsistency.
- **Most citations are stale.** 40 of the 45 comment lines with page citations in care-bundles now point to the wrong page; sections moved by +4, +5, +10 or +15 pages. 17 of those lines were already off by a page in v2.5. See §3.
- **v2.5 references:** one remains (`care-bundles/page.tsx:588`), and it's a deliberate historical note. There are **69 hard-coded v2.6 strings in 25 files**, in 9 different formats. See §4.

---

## 1. Values from commits `691facc`…`d123038`, and every cited care-bundles value

Citations shown as `p.X` are the page cited in the code comment. "v2.6 page" is where the wording actually is now.

### RSI Meds (`rsi-meds/page.tsx`)

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 691facc | Paeds ETT depth "(Age ÷ 2) + 12 cm"; uncuffed "(Age ÷ 4) + 4 mm" | "uncuffed (age÷4) + 4 … Depth: (age ÷ 2) + 12" | 43, 47 | ✅ | p.42 → **p.43** |
| da491d8 | Ketamine induction "1–2 mg/kg IV"; compromised "reduce toward 1 mg/kg" | "1 - 2mg/kg for induction. Adjust dose based on haemodynamic stability"; RSI algorithm "Ketamine – 1 - 2mg/kg based on haemodynamic status"; quick-reference table (unstable S/M/L 50/75/100 mg ≈ 1 mg/kg) | 353, 207, 217 | ✅ | p.197 → **p.207**; p.338 → **p.353** |

### Care Bundles: shared drug options

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 75a288a | Adrenaline IM 500 mcg, repeat q5 min; escalate to IV push after 3 doses | Formulary "Anaphylaxis IM 0.5 mg (1:1000) Repeat PRN every 5 minutes"; notes "Push dose IV Adrenaline should be considered if unresponsive to 3 x IM" | 301; 90, 113 | ✅ | p.285 → **p.301** (v2.5 was really p.286); p.108 → **p.113** |
| 75a288a | Adrenaline IV push 20–50 mcg, max single dose 50 mcg; 1 mg in 100 mL = 10 mcg/mL | "1mcg/kg Push Dose Max single dose of 50mcg Mix 1mg (1:1000) in 100ml NS (10mcg/ml)"; algorithm "Push dose 20 - 50mcg" | 301; 116 | ✅ | p.284-285 → **p.301** (v2.5 was really p.286) |
| 589d6b2 | Methoxyflurane 3 mL; onset 1–3 min; repeat once after 25 min; max 6 mL/day | "INH 3ml May repeat once after 25 minutes Max of 6ml/24 hours"; onset 1–3 min | 363 | ✅ | p.347-348 → **p.362-363** |
| 589d6b2 | Methoxyflurane "15 mL/week" | Not in v2.6 (only 6 mL/24 h; 3 mL/24 h in renal/hepatic disease) | — | — still unsourced (flagged in code) | — |
| 589d6b2 | Fentanyl IV 1 mcg/kg in 20 mcg aliquots, q1–2 min, max 200 mcg; IN 1–2 mcg/kg | "IM/IN 1 - 2mcg/kg … IV/IO 1mcg/kg at 20mcg aliquots Repeat PRN every 1 - 2 minutes … Max total dose of 200mcg" | 332 | ✅ | p.316-317 → **p.331-332** |
| 589d6b2 | Ketamine analgesia 0.25–0.5 mg/kg IV, repeat PRN | "Analgesia … IV/IO 0.25 - 0.5mg/kg Repeat PRN" | 352 | ✅ | p.336-337 → **p.352** |
| 8201fd3 | Noradrenaline 0.01–0.3 mcg/kg/min, increase by 0.05 | "Shock IV/IO INF 0.01 – 0.3mcg/kg/min Increase rate by 0.05mcg/kg/min if required"; same range in trauma algorithms | 373; 173, 175, 179 | ✅ | p.357 → **p.373** (v2.5 was really p.358); p.168/170/173 → **p.173/175/179**; p.52-53 → **p.55-56** |
| — (not changed by a fix) | Noradrenaline prep "4 mg in 50 mL (80 mcg/mL) or per local protocol" | Formulary shock dilution: "2 x 4mg/4ml amps into 500ml NS … (16mcg/ml). Draw 50ml". The 4 mg/50 mL syringe-driver figure is in the **transfer** infusion chart only | 373; 281 | ⚠️ the code uses the transfer-chart dilution; the prehospital shock formulary dilution is 16 mcg/mL | p.357 → p.373 |
| 589d6b2 | Morphine; Metaraminol | Not in v2.6 (full-text search; "apomorphine" is the only "morphine" match) | — | — claim still true | — |

### APO bundle

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 2412248 | CPAP start PEEP 5, max 15 cmH₂O | Algorithm "CPAP – start with PEEP of 5"; notes "maximum PEEP of 15 mbar and a combined PEEP and Psupport of 20mbar" | 82; 81 | ✅ | p.76 → **p.81** (notes) / **p.82** (algorithm) |
| 2412248 | "2.5 cmH₂O step", SpO₂ 94–98%, ETCO₂ 35–45, contraindication list | v2.6: "SpO2 ≥ 94%" (APO); no numeric EtCO₂ target; "CPAP application may be considered in patients with a reduced level of consciousness and adequate ventilation" | 82; 81 | — extended-scope claims still true for APO | p.76 → p.81 |
| e98ac21 | GTN SL 400–1200 mcg (1–3 sprays) q5 min and SBP > 100, **max 3 doses** | "SL 0.4 - 1.2mg (1 - 3 sprays) Repeat PRN every 5 minutes and SBP >100mmHg"; algorithm "1 - 3 sprays … followed by 1 spray every 5 minutes until CPAP applied" | 341; 82 | ⚠️ **"max 3 doses" isn't in v2.6** (or v2.5); the CPG says repeat PRN | p.325-326 → **p.341** |
| 3edfadc | GTN IV 100 mcg/min; 1 mg/mL at 6 mL/h; titrate ±0.6 mL/h (~10 mcg/min) | Formulary "INF 100mcg/min Dilute to 1mg/1ml. Infuse at 6ml/hr Increase/decrease dose as required by 0.6ml/hr" | 341 | ✅ formulary · ⚠️ the APO algorithm (CCP, high BP) also gives "GTN Infusion – 100 - 300 mcg/min" and "SBP > 200mmHg – consider … 400 - 500 mcg/min for ≈ 2 minutes"; the code omits both | p.325-326 → **p.341**; algorithm **p.82** |
| 2412248 | 12-lead ECG step | APO algorithm lists 12-lead ECG | 82 | ✅ | p.76 → **p.82** |

### All Critical Patients bundle

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 37f8dc1 | BP q5 min; q2 min on Adrenaline/Phenylephrine infusion | "every 5 minutes for unstable/critically ill or injured patients"; Adrenaline "Cycle BP every 2 minutes when administering via infusion"; Phenylephrine "Blood pressure must be closely monitored every 2 minutes" | 19; 300; 381 | ✅ | p.19 → p.19 |
| 37f8dc1 | Defib pads: "Apply anterior-lateral (or anterior-posterior)" | "Defib pads must be applied … Consider placing defib pads in the A/P position" | 19 | ⚠️ the code lists anterolateral first, while the CPG recommends A/P | p.19 → p.19 |
| 37f8dc1 | ETCO₂ continuous; mandatory if intubated; target 35–45 | "Continuous EtCO2 together with basic monitoring is required for … Advanced airway placement"; **no numeric target in v2.6** | 19, 23 | ✅ / — target is extended scope (see C2 note) | p.19/37-47 → p.19, 23 |
| 37f8dc1 | QRS beep, 130/40 bpm alarms | Not in v2.6 | — | — claim still true | — |
| b0479be | SpO₂ 88–92% in COPD | "maintain SpO2 between 88 - 92%" | 92, 93 | ✅ | p.87 → **p.92** |
| 37f8dc1 | SpO₂ 94–98% (comment: "CPG states only a >94% floor") | General/APO/trauma: "≥ 94%". **New in v2.6, post-ROSC: "maintain SpO2 between 94% - 98%"** | 82, 177; **54** | ✅ value · ❌ **the comment is now inaccurate** (see §2) | — |
| 37f8dc1 | 4-lead monitoring; 12-lead when appropriate | "HR (4 - lead ECG/Pads)"; "12 - lead ECG (when appropriate)" | 19; 17 | ✅ | p.17/19 → p.17/19 |

### All Sedated Patients bundle and ventilation calculator

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 41620b6 | BP q5 min; 4-lead ECG mandatory (sedation) | "mandatory continuous monitoring … SpO2 … EtCO2 … BP (every 5 minutes) … ECG (4 - lead)" | 211 | ✅ | p.200-202 → **p.210-212** (text on p.211) |
| c24ad2d | MAP: isolated TBI 70–80 mmHg; TBI + polytrauma ≥ 65 | "target MAP of 70 - 80mmHg for adults … isolated TBI"; "TBI and associated polytrauma, aim for a target MAP of ≥ 65mmHg"; ROSC "MAP of 70 - 80 for isolated TBI" | 174; 54 | ✅ | p.169 → **p.174**; p.51 → **p.54** |
| 41620b6 | ETCO₂ 35–45; 30–35 if raised ICP | No numeric EtCO₂ target in v2.6. ROSC: "An elevated EtCO2 is to be expected following ROSC. Do not try to normalise EtCO2 prehospitally" | 54 | — extended scope; ⚠️ sits uneasily with p.54 for post-ROSC patients | p.197/37-47 → p.207 / p.35-49 |
| 41620b6 | SpO₂ 94–98%, avoid hyperoxia > 98% (comment: "not anywhere in CPG") | **New in v2.6 (post-ROSC): "Titrate inspired oxygen to maintain SpO2 between 94% - 98% • Avoid hyperoxaemia (SpO2 at 100% for prolonged periods)"** | **54** | ✅ value · ❌ **the comment is now inaccurate** (see §2) | — |
| 41620b6 | IBW = height (cm) − 100 | "Calculate ideal body weight (IBW) in kg = height (cm) – 100" | 217 | ✅ | p.207 → **p.217** |
| 41620b6 | Rate 12–14/min (normal lungs); TV 6–8 mL/kg; PEEP start 5; I:E 1:2 | Normal lungs: RR 12-14, TV 6-8 ml/kg, PEEP 3-5 mbar, I:E 1:2 (Asthma/COPD 5-10; APO/ARDS 12-16) | 215 | ✅ | p.204 → **p.215** (v2.5 was really p.205) |

### Anaphylaxis bundle

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 75a288a | Diphenhydramine 50 mg IV/IO, single dose | "IM/IV/IO 50mg Single dose"; algorithm "Diphenhydramine 50mg IV/IM" | 326; 115-116 | ✅ | p.309-310 → **p.326** (v2.5 was really p.311) |
| 75a288a | IV fluids 500–1000 mL, repeat PRN | "IV Fluids 500 - 1000ml repeat as required" | 116 | ✅ | p.110 → **p.116** (v2.5 was really p.111) |
| 75a288a | Hydrocortisone 200 mg | "Hydrocortisone 200mg IV/IM" | 115-116; 342 | ✅ | p.327/109-110 → **p.342 / p.115-116** |

### Asthma bundle

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 6468486 | Fluids 250–500 mL bolus, repeat PRN, max 1 L | Algorithm "Fluid bolus – 250 - 500ml repeat as required"; notes "A maximum of 1L normal saline for adults" | 91; 90 | ✅ | p.85/84 → **p.90/91** (v2.5 algorithm was really p.86) |
| 6468486 | Ipratropium 500 mcg, repeat once after 20 min (max 2) | "0.5mg. May be repeated once after 20 minutes"; "A maximum of 2 doses of Ipratropium Bromide may be given 20 minutes apart" | 91; 90 | ✅ | p.85/84/333 → **p.90/91**, formulary **p.348** |
| 6468486 | Hydrocortisone 200 mg IV | "Hydrocortisone 200mg IV" | 91 | ✅ | p.85/327 → **p.91 / p.342** |
| 6468486 | Salbutamol 5 mg, repeat as required | "Salbutamol – 5mg repeat as required" | 91 | ✅ | p.85/372 → **p.91 / p.387** |
| 4b035a1 | MgSO₄ 2 g IV over 10 min, may repeat once to max 4 g | Formulary "2g Infused over 10 minutes. May repeat once to a max dose of 4g" | 360 | ✅ formulary · ⚠️ the asthma algorithm says "Magnesium 1 - 2g IV" (p.91): an inconsistency inside the CPG, not in the code. The "4 mL of 50% in 100 mL" dilution isn't stated in v2.6 | p.344-345 → **p.359-360** |
| 75a288a / 6468486 | Adrenaline IM 500 mcg / IV 20–50 mcg | As in the shared drug options above | 91, 301 | ✅ | p.284-285/85 → p.301 / p.91 |

### COVID-19 bundle

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 3353fbb | CPAP if RR ≥ 30 or SpO₂ < 93%; PEEP 10 → 12–15 cmH₂O | "CPAP for all patients with RR ≥ 30 AND/OR SpO2 < 93% … PEEP at 10cmH2O, increase up to 12 - 15 cmH2O" | 293 | ✅ (v2.6 also gives "Pressure Support at 3 cmH2O", which the code doesn't show) | p.277 → **p.293** (v2.5 was really p.278) |
| 3353fbb | Dexamethasone 6 mg IV/IM/PO single dose if on CPAP or needs O₂ for SpO₂ > 93% | "Dexamethasone 6mg IV (**Adults ≥ 18 years only**) for any patient placed on CPAP or who requires supplemental oxygen to maintain SpO2 > 93% (**unless already administered in a healthcare facility**). IM or oral route may be used if IV access not available." Formulary: "PO 6mg … IV/IO/IM 6mg Single dose"; **withhold if steroids within the previous 4 hours** | 293; 318 | ⚠️ the dose and trigger match; the code omits the age restriction and both withhold rules (same in v2.5) | p.301-302/277 → **p.318 / p.293** |

### Major Trauma bundle

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 589d6b2 | Vasopressor if MAP < 65 despite fluids | "Vasopressors should only be considered if MAP/BP is unresponsive to fluids … maintain MAP just above 65mmHg" | 172 | ✅ | p.167 → **p.172** |
| 589d6b2 | Fluids 250 mL bolus → MAP 65, max 1 L | "Aim to maintain a MAP ≥65mmHg for adults (this MAP target includes those patients with an associated TBI)"; algorithm "IV fluid 250ml boluses (Max 1L)" | 172; 173 | ✅ | p.167 → **p.172/173** |
| 589d6b2 | "Penetrating torso SBP ~80" | Not in v2.6 | — | — still unsourced (flagged in code) | — |
| 589d6b2 | TXA 2 g in 100 mL over 10 min; within 3 h; adult major haemorrhage or TBI GCS ≤ 12 | "Add 2 g to 100ml NS and infuse over 10 minutes"; "Adult (>14 years old) major trauma < 3 hours old … Traumatic brain injury with GCS ≤ 12" | 393; 392 | ✅ adult values unchanged · **the indications text changed in v2.6** (§2) | p.377-378 → **p.392-393** |
| — | Oxygen SpO₂ 94–98% (comment: "98% ceiling not in CPG") | Trauma: "maintain SpO2 ≥94%" | 177 | — claim still true for trauma | — |
| c24ad2d | TBI caution: MAP 70–80 isolated / ≥ 65 polytrauma | See the sedated bundle row | 174 | ✅ | p.169 → p.174 |

### STEMI / ACS bundle

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| 22d9a73 | Defib pads A/P as primary placement | "All patients with a STEMI must have defib pads applied. Consider the A/P position as the primary placement" | 72 | ✅ | p.66 → **p.72** (v2.5 was really p.67) |
| 22d9a73 | Isolated LBBB without STEMI symptoms → nearest ED | "Isolated LBBB without symptoms suggestive of a STEMI should be transported to the nearest emergency department, not heart hospital" | 72 | ✅ | p.67 → **p.72** |
| 22d9a73 | ST depression V1–V3 = posterior STEMI → P1 Heart Hospital | "ST depression in leads V1 – V3 … indicative of a posterior STEMI" | 72 | ✅ | p.65-67 → **p.72** |
| 22d9a73 | Non-diagnostic: withhold Clopidogrel; repeat 12-lead on ED arrival before unloading | "Manage for ACS, withholding Clopidogrel. … repeat a 12 - lead ECG on arrival at the Emergency department prior to unloading" | 72 | ✅ | p.65-67 → **p.72** |
| 22d9a73 | Aspirin 300 mg; Clopidogrel 600 mg PO, STEMI only, AP after Clinical Desk advice | "Aspirin – 300mg"; "Clopidogrel – 600mg (AP only to administer following Clinical Desk advice)"; formulary "only for … identified STEMI" | 73; 315 | ✅ | p.67-68 / p.66-68 → **p.73** |
| e98ac21 | GTN SL 400 mcg (1 spray), repeat PRN q5 min and SBP > 100 | "Acute Coronary Syndrome SL 0.4mg (1 spray) Repeat PRN every 5 minutes and SBP >100mmHg" | 341 | ✅ | p.325-326 → **p.341** |
| 3edfadc | GTN IV 5–20 mcg/min; 0.1 mg/mL at 3–12 mL/h; ±5 mcg/min; STEMI only, if unresponsive to SL/analgesia | "5 - 20mcg/min Dilute to 50mg / 500ml = 0.1mg/ml. Infuse at 3 - 12ml/hr … by 5mcg/min"; "IV GTN may be considered if unresponsive to SL GTN and/or alternative analgesia in the presence of STEMI only" | 341 | ✅ | p.325-326 → **p.341** |
| 22d9a73 | (Flag) Ketamine in the shared ACS analgesia set | ACS algorithm lists "Consider Penthrox – 3ml", "Fentanyl" only | 73 | flag still valid | p.68 → **p.73** |

### Stroke bundle

| Commit | Value in code | v2.6 value | v2.6 page | Result | Cited → v2.6 |
|---|---|---|---|---|---|
| d123038 | Hospital "HGH" | "Transport P1 to HGH ED" | 64 | ✅ | — |
| d123038 | BSL < 4.0 mmol/L → D10 150–200 mL (15–20 g), repeat if still hypoglycaemic | Algorithm "Dextrose 10% IV 150 - 200ml"; formulary "IV 15 - 20g D10W (150 - 200ml) … Repeat if patient remains hypoglycaemic"; indication "RBS < 4mmol/L" | 119; 321; 320 | ✅ | p.111 → **p.119** (v2.5 was really p.114); p.305-306 → **p.320-321** |
| efbed0b | BEFAST + RACE (≥ 5 = possible LVO) | BEFAST definitions; RACE 0–9, "≥ 5 … large vessel occlusion" | 63 | ✅ (already updated to v2.6) | v2.6 p.63 ✓ |
| efbed0b | Destination: ≤ 8 h or wake-up/unknown → P1 HGH ED; 8–24 h → RACE ≥ 5 P1 HGH / < 5 P2 nearest; ≥ 24 h → P2 nearest; prenotification list | Stroke Transport Destination Decision Tree; prenotification list (age, onset, BEFAST, RACE, RBS, BP, anticoagulants, ETA) | 64; 62 | ✅ (already updated to v2.6) | v2.6 p.64 ✓ |
| d123038 | (Flag) Active BP-lowering thresholds (SBP > 220 / > 180, 10–15% reduction, avoid SBP < 140) | v2.6 still says only "DO NOT attempt to reduce BP using nitrates if the patient is hypertensive" | 63 | — flag still valid; unchanged in v2.6 | p.58-60 → **p.63** |

---

## 2. Where v2.6 differs from v2.5

### 2a. Within the audited values

**No numeric value changed in the 17 August fixes.** These v2.6 changes do touch the audited code:

| What changed | v2.5 | v2.6 | Effect on app |
|---|---|---|---|
| Post-ROSC oxygen target (CPG 2.6) | "Aim to maintain SpO2 > 90%" (p.51) | "Titrate inspired oxygen to maintain SpO2 between 94% - 98% • Avoid hyperoxaemia (SpO2 at 100% for prolonged periods)" (p.54) | The ROSC tool already shows 94–98%. **Two care-bundles comments are now false:** `care-bundles/page.tsx:254-255` ("CPG states only a >94% floor") and `:295-296` ("98% hyperoxia ceiling and avoid hyperoxia do not appear anywhere in CPG"). The values are fine; the provenance claim is wrong for post-ROSC patients. |
| Stroke (CPG 3.1) | < 15 h window; BEFAST only (pp.58-60) | Decision tree with ≤ 8 h / 8–24 h / RACE ≥ 5; RACE added (pp.62-65) | Updated in `efbed0b`; matches v2.6 (§1). |
| Stroke flowchart drugs | "Oxygen • Penthrox/Paracetamol" (p.60) | "Oxygen as required • Paracetamol if required … Antiemetic if required" (p.65); **Penthrox removed** | The stroke tool doesn't list Penthrox. No app change needed. |
| TXA indications (formulary) | Scope tags "(AP and CCP)"; paeds "(CCP Only)"; "ante/post-partum" (p.377) | Scope tags removed; **paediatric TBI GCS ≤ 12 added**; **"post-partum" only** (p.392) | The adult values used by care-bundles are unchanged. The CPG-changes page already notes this. |
| TXA in algorithms | Adult and paediatric lines in different positions; **obstetric flowcharts list "TXA 1g"** (pp.211-217) | Paediatric "TXA 15mg/kg (max 1g)" now in the TBI/MH/chest/abdo/pelvic paediatric columns; **TXA removed from the obstetric (PV bleeding) flowcharts** (pp.221-227) | Not in care-bundles. Check any obstetric content in the app. |

### 2b. Other v2.6 numeric changes found document-wide (outside the audit scope)

This is the September update as it appears in the text diff. I checked the app quickly for each one.

| Area | v2.5 → v2.6 | v2.6 page | App status |
|---|---|---|---|
| Paeds CCP joule escalation | after **3** shocks, max **10 J/kg** → after **5** shocks, **+2 J** increments, max **8 J/kg** | 42, 45, 46, 49 | Peds Medical Arrest ✅. WAAFELSS 6 J/kg row ⚠️ (flagged earlier). |
| WAAFELSS Fluid | 10 mL/kg × **2** → × **3** | 43, 47 | ✅ ("up to 3") |
| WAAFELSS / ROSC Sugar | **2.5** mL/kg → **2** mL/kg D10 (0.2 g/kg) | 43, 47, 55 | ✅ (no 2.5 mL/kg remains in the app) |
| Paeds arrest ventilation rates | not stated → < 1 y 25, 1–8 y 20, 8–12 y 15, > 12 y 10 /min | 45, 49 | ✅ (Peds Medical Arrest) |
| Zoll energies | 120, 150 J… → **150, 200 J**… | 37, 41 | ✅ (Zoll 150 → 200 → 200 J) |
| Narrow-complex cardioversion | 200 J → **150 J** | 77 | No cardioversion energies found in the app ✅ |
| ROSC cooling | — → icepacks to axillae/groin for adult comatose medical ROSC | 55 | ✅ (ROSC tool) |
| ROSC BP wording | "SBP > 90/MAP > 65" → "SBP > 90 **OR** MAP > 65"; paeds target note | 56 | Not checked in detail |
| **Paediatric normal vitals weight bands** (CPG 1.2 table) | Term–2 mo 3–4 kg, 1–3 y 12–15, 4–5 y 16–21, 6–7 y 22–28, 8–9 y 29–34, 10–11 y 35–40, 12–13 y 41–45, ≥ 14 y 46–50 → **4–5, 10–14, 16–18, 25–28, 31–34, 37–40, 43–46, > 49 kg** (also 3–7 mo 5.5–7.5, 8–12 mo 8–10) | **21** | ❌ **The Vitals tool still uses the v2.5 bands** (`vitals/page.tsx:38-117`). ⚠️ **v2.6 contradicts itself:** the paediatric table on **p.289** (CPG 15.7) still has the old bands. Needs a clinical decision on which table is authoritative. |
| CPR quality wording | "(rate, depth, recoil)" → "rate 100-120/min, depth 5-6 cm … interruptions < 5 seconds" | 34, 45, 49 | Wording only |

---

## 3. Citations that no longer point to the right v2.6 page

**All `p.` citations in `care-bundles/page.tsx` comments are v2.5 page numbers, except lines 580 and 587, which already cite v2.6.** v2.6 inserted pages throughout, so most sections moved:

| v2.6 section offset | Sections |
|---|---|
| ±0 | CPG 1.x (pp.17-23) |
| +1 to +5 | Resuscitation (CPG 2.x), stroke (+4/+5), ACS/APO/respiratory/anaphylaxis/hypoglycaemia (+5), trauma (+5/+6) |
| +10 | RSI / sedation / ventilation (CPG 11.x) |
| +15 | COVID (CPG 17.1) and the whole formulary |

Corrections (cited → correct v2.6 page). **★** marks citations that were already off by a page in v2.5.

| `care-bundles` line | Cited | Correct v2.6 | Note |
|---|---|---|---|
| 67 | p.285/110 | **p.301 / p.116** | ★ v2.5 was really p.286/111 |
| 70 | p.108 | **p.113** (also p.90) | |
| 79, 324 | p.284-285/110 | **p.301 / p.116** | ★ v2.5 was really p.286/111 |
| 94 | p.347-348 | **p.362-363** | |
| 120 | p.316-317 | **p.331-332** | |
| 131 | p.336-337 | **p.352** | |
| 144 | p.357; p.168/170/173/52-53 | **p.373**; **p.173/175/179/55-56** | ★ v2.5 was really p.358 |
| 157 | p.167-170 | **p.172-175** | |
| 178, 203 | p.76 | **p.81** (notes) / **p.82** (algorithm) | ★ the algorithm was really v2.5 p.77 |
| 218, 229 | p.19 | p.19 | ✓ unchanged |
| 237 | p.19/37-47 | p.19, 23 / **p.34-49** | |
| 254 | p.87 | **p.92** | the "only a >94% floor" claim is now wrong for post-ROSC (§2a) |
| 262 | p.17/19 | p.17/19 | ✓ unchanged |
| 277-278 | p.200-202; p.169/51 | **p.210-212** (text p.211); **p.174/54** | |
| 285 | p.197/37-47 | **p.207 / p.34-49** | |
| 295-296 | (no page) "not anywhere in CPG" | **false since v2.6: p.54** | §2a |
| 303 | p.201-202 | **p.211-212** | |
| 331 | p.309-310/109-110 | **p.326 / p.115-116** | ★ v2.5 was really p.311 |
| 340 | p.110 | **p.116** | ★ v2.5 was really p.111 |
| 348 | p.327/109-110 | **p.342 / p.115-116** | |
| 363 | p.284-285/85 | **p.301 / p.91** | ★ |
| 370 | p.85/84 | **p.91 / p.90** | ★ the algorithm was really v2.5 p.86 |
| 378 | p.85/327 | **p.91 / p.342** | ★ |
| 385 | p.85/84/333 | **p.91 / p.90 / p.348** | ★ |
| 401 | p.85/372 | **p.91 / p.387** | ★ |
| 417 | p.301-302/277 | **p.318 / p.293** | ★ v2.5 was really p.303/278 |
| 430 | p.277 | **p.293** | ★ v2.5 was really p.278 |
| 455 | p.167 | **p.172** | |
| 464 | p.167 (also 169-170) | **p.172-173** (also 174-175) | |
| 490 | p.377-378 | **p.392-393** | the indications text changed (§2a) |
| 506 | p.68 | **p.73** | |
| 518 | p.67-68 | **p.73** | |
| 529 | p.66-68 | **p.72-73** | |
| 538 | p.66 | **p.72** | ★ v2.5 was really p.67 |
| 553 | p.65-67 | **p.70-72** | |
| 580, 587 | v2.6 p.63, p.64 | ✓ correct | |
| 588 | "v2.5 <15h window" | — | deliberate historical note |
| 598 | p.111/305-306 | **p.119 / p.320-321** | ★ v2.5 was really p.114 |
| 609 | p.58-60 | **p.62-65** (nitrates line p.63) | |
| 636 | p.207 | **p.217** | |
| 672 | p.204 | **p.215** | ★ v2.5 was really p.205 |

Commit messages for `691facc`…`d123038` also cite v2.5 pages. They're history and shouldn't be rewritten. Page citations in files other than care-bundles weren't part of this check.

---

## 4. Remaining v2.5 references, and consolidating the version string

### v2.5 references

- The code has one: `care-bundles/page.tsx:588`, "Stroke Transport Destination Decision Tree replaces the v2.5 <15h window". It's intentional and historical, so it can stay.
- Nothing in `lib/`, `scripts/`, `public/*.json` or `public/sw.js` references v2.5. The search index (`public/cpg-index.json`) was built from the v2.6 PDF on 2026-10-17.

### Hard-coded v2.6 strings

There are **69 occurrences in 25 files**, in 9 formats:

| Count | Form |
|---|---|
| 18 | `CPG v2.6` |
| 15 | `HMCAS v2.6 2026` |
| 13 | `v2.6 2026` |
| 7 | `v2.6` |
| 6 | `CPG v2.6 (2026)` |
| 6 | `cpg-v2.6-2026.pdf` |
| 2 | `v2.6 (2026)` |
| 1 | `HMCAS CPG v2.6 (2026)` |
| 1 | `HMCAS CPG v2.6` |

The heaviest files are `dashboard/data.ts` (9), `care-bundles` (7) and the four arrest tools (4 each). The PDF path constant is duplicated in `BottomNav.tsx:18`, `ProtocolFinder.tsx:16` and `CpgPdfViewer.tsx:10`, and once more in `scripts/build-cpg-index.mjs`.

### Proposal (not built)

1. **One source of truth.** Add `lib/cpgVersion.json`, `{ "version": "2.6", "year": 2026, "pdfFile": "cpg-v2.6-2026.pdf", "approved": "2026-09-07" }`, read by both the app and the Node build scripts. A thin `lib/cpgVersion.ts` derives the display forms:
   - `CPG_VERSION_LABEL` → "CPG v2.6 (2026)"
   - `CPG_VERSION_SHORT` → "v2.6 2026"
   - `CPG_PDF_PATH` → `/reference/cpg/${pdfFile}`

   Standardise on two display forms instead of nine. Replace the 69 literals and the four duplicated paths.
2. **Separate "the PDF we ship" from "the edition a value was checked against".** This is the root cause of the `efbed0b` problem: bumping the display version silently re-labelled unverified values. Replace free-text `// CPG p.NNN` comments with a small structured reference next to each clinical value, e.g. `cpgRef: { v: "2.6", page: 293, quote: "PEEP at 10cmH2O, increase up to 12 - 15" }`.
3. **A test that fails on the next version bump.** It lists every `cpgRef` whose `v` isn't the current version, and every hard-coded `v2.\d` string outside `lib/cpgVersion.*`. Changing the version then gives an explicit to-do list of values to re-verify, instead of a find-and-replace. Optionally, the same test checks each `quote` still appears on the cited page of the shipped PDF, using the page-text extraction from this review.
4. **Optional:** apply the same pattern to the SOP and CPM documents.

---

## 5. Clinical decisions needed

1. **Paediatric weight bands:** v2.6 p.21 and p.289 disagree. Decide which table is authoritative before changing the Vitals tool.
2. **GTN APO SL "max 3 doses":** keep it as departmental policy, or remove it to match the CPG's "repeat PRN".
3. **GTN APO IV:** add the CCP 100–300 mcg/min titration range and the SBP > 200 higher-dose start, or keep the formulary-only 100 mcg/min.
4. **Dexamethasone (COVID):** add "Adults ≥ 18 only", "unless already given in a healthcare facility" and "withhold if steroids within 4 h".
5. **Noradrenaline preparation:** choose the formulary prehospital dilution (8 mg/500 mL = 16 mcg/mL, 50 mL syringe) or the transfer-chart 4 mg/50 mL.
6. **"Defib pads on" (all critical):** lead with A/P to match p.19.
7. **ETCO₂ 35–45 targets** in the sedated and critical bundles, given v2.6 p.54 ("Do not try to normalise EtCO₂ prehospitally" post-ROSC).
8. **Still open from August:** the 15 mL/week Methoxyflurane cap; "penetrating torso SBP ~80"; the stroke active-BP thresholds; Ketamine in the ACS analgesia set. v2.6 settles none of these.
9. **Previously reported:** the WAAFELSS 6 J/kg row (v2.6 says +2 J increments after 5 shocks); the GCS "Mild" label for 15.
