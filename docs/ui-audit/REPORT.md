# UI/UX Audit — Ambulance Paramedic Toolkit

**Date:** 2026-10-23 · **Build audited:** `main` @ `8dac914` (production build) · **Scope:** UI/UX only, no code changed

---

## How this audit was run

- **Server:** I ran a production build (`next build` then `next start -p 3100`), not `npm run dev`. `ServiceWorkerRegister` skips registration outside production, so offline behaviour can't be tested in dev.
- **Device emulation:** I ran every capture with a **mobile user agent** plus touch emulation. The app picks mobile or desktop chrome from the **user agent**, through `lib/device.ts`, not from viewport width. An iPad UA was used at 768×1024.
- **Capture:**
  - 42 screens: landing, dashboard, 9 category pages, About, and 30 tool routes. Each was captured at 360×640, 390×844, 412×915 and 768×1024, in both light and dark.
  - Landscape at 844×390 for the dashboard and 5 time-critical tools (Resus Timer, Adult Arrest, RSI Meds, Drug Calculator, ROSC), light and dark.
  - That gives **348 full-page screenshots plus 20 interaction, above-the-fold and offline captures**, 368 files in all.
  - The bulk sweep used the Playwright library that ships with the Playwright MCP, on the same Chrome 155. Interactive tests used the MCP directly: timer state, reset, drag, offline, reduced motion and truncation.
- **Metrics collected on every screen:**
  - Touch-target sizes from the bounding box of every interactive element.
  - Rendered font sizes.
  - Contrast ratios: text colour composited over its ancestors' background colours. The body gradient is approximated by a flat colour, so treat ratios as ±0.2.
  - Horizontal overflow, accessible names, labelled inputs, and heading order.
- **Reading the screenshots:**
  - Full-page screenshots draw fixed elements (the BottomNav, sticky result bars) at their viewport position. They therefore appear **part-way down the image**. That is an artefact of the capture, not a layout bug.
  - The `fold-*` files show what is actually visible on load at 360×640.
- **Not reproduced:** I couldn't trigger the "Update available" banner. Playwright doesn't intercept the service worker's own update fetch. Banner behaviour is therefore assessed from code (marked *code review*).
- **Filenames:** `docs/ui-audit/screenshots/<screen>-<viewport>-<theme>.png`. Extra prefixes: `interaction-`, `fold-`, `offline-`. The folder is about 46 MB, so you may prefer to git-ignore it rather than commit it.

---

## 1. Summary

The top five issues:

1. **Cardiac-arrest records are lost silently.** The Resus Timer keeps its clock and event log only in component state. Tapping any BottomNav tab mid-arrest and returning resets the clock to `02:00` and empties the log, which was measured. A single tap on **Reset** wipes the log with no confirmation. The voice command also resets on the everyday word "again". Nothing in the app holds a Screen Wake Lock, so the phone can sleep mid-arrest.
2. **Offline doesn't work for any tool a crew hasn't already opened online.** The service worker precaches tool *HTML* but none of the JavaScript the tools need. Offline, GCS, Adult Arrest, RSI Meds, the Drug Calculator and 15 other screens show **"This page couldn't load"**. Tools opened once while online do work offline.
3. **Light theme makes several tools unreadable.** Tool screens are hard-coded dark, while `globals.css` swaps the accent and surface colours for light mode. In light mode:
   - Drug Calculator, Treatment Log, Care Bundles and RASS titles drop to **1.0:1** contrast, and their content to 1.0–1.3:1.
   - The GCS total drops to **2.6:1**.
   - The Resus Timer "Cycle → CPR" label drops to **2.6:1**.
4. **Text is too small and too faint for arm's-length reading.** **90%** of rendered text is under 16px, with a minimum of 8.8px. **34%** of text fails WCAG AA (40% in light, 29% in dark). Critical values are well below AAA in places:
   - RSI phase timings: 8.8px at 1.5:1.
   - Paediatric joule rows: 9px at 2.9:1.
   - Adult defib energies: 10.4px at 3.1:1.
5. **Targets are too small, and names are truncated.** About 20 tools have a **32×32px** back button and a 32×32px reset button. "Copy summary" is 31px tall on about 25 tools. At 360–412px the category lists cut tool names off with an ellipsis. Both "Adult Cardiac Arrest …" entries then look identical, and so do the two "Paediatric … Arrest" entries.

---

## 2. Findings

Severity: **P0** could cause an error or delay in care. Anything under 44px is also P0, per the audit rule. **P1** slows use. **P2** is polish. Effort: **S** is under half a day, **M** is 1–2 days, **L** is 3 days or more.

### P0

| ID | Screen | Viewport / theme | Issue | Evidence | Sev | Suggested fix | Effort |
|---|---|---|---|---|---|---|---|
| F01 | Resus Timer | All | Timer, cycle count and the whole event log are lost when you leave the screen. Leaving happens easily: one tap on any BottomNav tab, the search sheet, or a link out to a drug tool. On return it shows `02:00`, 0 log entries, and "Start". The state is all `useState` in `tools/resus-timer/page.tsx`. | `interaction-resus-timer-running-390x844-dark.png` vs `interaction-resus-timer-after-nav-390x844-dark.png`. Measured: 2 log rows before, 0 after. | P0 | Move timer state into a module-level store (the same `useSyncExternalStore` pattern as `lib/swUpdate.ts`), mounted above the route. Persist `startTime`, `logs` and drug times to `localStorage`. Derive elapsed time from `Date.now() - startTime` so it survives reloads and backgrounding. Show a "Resuscitation in progress" pill in the BottomNav while it runs. | M |
| F02 | Resus Timer | All | **Reset** clears the whole event log (`setLogs([])`) on one tap, with no confirm and no undo. It sits right next to Start/Pause. Voice control also triggers `handleReset` on "reset", "restart", **"again"** or "reset timer". "Again" is a common word in a resus room. | Measured: 0 dialogs, log emptied after a single tap. Code: `resus-timer/page.tsx:291` and `:442`. | P0 | Split the action into two: "New cycle" (keeps the log) and "End / clear case". Make clearing need a hold-to-confirm or a two-step confirm, plus a 10-second **Undo** snackbar. Remove "again" and "restart" from the voice words, and ask for spoken confirmation before a voice reset. | S |
| F03 | All tools | Offline | Only tool *HTML* is precached. JavaScript chunks are cached only after a page has been opened online. Results:<ul><li>Opening GCS, Adult Arrest, ROSC, Peds Arrest, RSI Meds, Drug Calc, Treatment Log, Burns, Trauma Bypass, Toxicology, Care Bundles, Documentation, RACE, RASS, Sepsis, CPG or Chat offline shows Next's "This page couldn't load".</li><li>Client-side navigation from the dashboard to Adult Arrest also fails.</li><li>`CORE_ROUTES` leaves out RSI Meds, Drug Calculator, Care Bundles, Treatment Log, Burns, Trauma Bypass, Toxicology, Toxidrome, RACE, RASS, Documentation, CPM, SOP, and 5 category pages.</li><li>Tools opened online first (Resus, RSI, Drug Calc) did load offline.</li></ul> | `offline-resus-timer-390x844-dark.png` (cold cache), `offline-clientnav-adult-arrest-390x844-dark.png`. Test log in Appendix A. | P0 | At build time, write a precache manifest listing every `/_next/static/**` asset plus every tool and category route, and inject it into `sw.js`. A small Node script in `scripts/` would do it; no new dependency is needed. Version the cache by build ID. Add an `npm run build` check that fails if a route in `TOOL_GROUPS` is missing from the manifest. | M |
| F04 | Update banner / SW | Offline *(code review)* | Three problems combine here:<ul><li>`UpdateBanner` appears whether or not the device is online.</li><li>Tapping it sends `SKIP_WAITING`. The new worker's `activate` then deletes every old cache, including the runtime-cached JS from tools the crew has opened.</li><li>The new worker precached only HTML.</li></ul> So an update applied offline, or just before losing signal, could leave every tool failing offline until each one is reopened online. | `public/sw.js:46-58` (activate deletes the old caches) and `:3-25` (HTML-only precache). `UpdateBanner.tsx` has no `navigator.onLine` check. | P0 | With F03's full precache in place, the new cache is complete before activation. In addition:<ul><li>Hide the banner, or show "Update ready — connect to apply", when `!navigator.onLine`.</li><li>Only `skipWaiting` once the install's `Promise.allSettled` reports zero failures.</li></ul> | S (after F03) |
| F05 | Drug Calc, Treatment Log, Care Bundles, RASS, GCS, Resus Timer, most tools | Light, all sizes | Light theme is broken on tool screens. Tools hard-code a dark palette (`bg-slate-950`, `text-white` / `text-slate-100`). Meanwhile `globals.css` remaps `text-emerald-300/400/500` to `#0e7490` and `bg-white/slate-100` to a translucent white in light mode. Measured contrast:<ul><li>Drug Calc title 1.0:1; all 39 text nodes fail.</li><li>Treatment Log title 1.0:1; 50 of 53 text nodes fail.</li><li>Care Bundles title 1.05:1.</li><li>RASS score digits 1.0–2.4:1.</li><li>GCS total "15" 2.59:1.</li><li>Resus "CYCLE 1 → CPR" 2.59:1.</li></ul> | `drug-calculator-390x844-light.png`, `treatment-log-390x844-light.png`, `rass-390x844-light.png`, `gcs-390x844-light.png`, `resus-timer-390x844-light.png` | P0 | **Stopgap (S):** wrap tool routes in a `.dark` scope so the CSS variables and `dark:` variants resolve to dark. That means an `app/(app)/tools/layout.tsx` with `<div className="dark">`. Then hide the theme toggle on tool screens, or label it "Dashboard theme". **Proper fix (L):** move tools onto semantic tokens such as `--surface`, `--ink`, `--accent` and `--severity-*`, and delete the `!important` attribute-selector overrides in `globals.css`. | S / L |
| F06 | Dashboard (mobile header) | Light, phones | The mobile sticky header title "Ambulance Paramedic" is `text-slate-100` on the light top bar, measuring **1.04:1**. It's effectively invisible. | `dashboard-390x844-light.png` | P0 | Use `text-slate-900 dark:text-slate-100`. This is fixed for free by the shared header in Batch 4. | S |
| F07 | Category lists (Resuscitation, Assessment, Reference, Trauma, CCP) | 360, 390, 412 / both | Tool names are cut to one line with an ellipsis. At 360px, 14 names are truncated, including all four arrest algorithms. "Adult Cardiac Arrest (Unwitnessed)" and "Adult Cardiac Arrest - Witnessed" both render as **"Adult Cardiac Arrest …"**. The two paediatric arrest tools look alike in the same way. Even at 412px, 9 names are still truncated. | `grp-resuscitation-360x640-light.png`. The truncation list is in Appendix A. | P0 | Allow 2 lines (`line-clamp-2` in place of `truncate`). Put the word that tells them apart first, e.g. "Unwitnessed adult arrest" and "Witnessed adult arrest". Move version metadata to the second line. | S |
| F08 | Resus Timer, arrest algorithms, Treatment Log, RSI | All | Nothing in the app requests a Screen Wake Lock (`grep wakeLock` finds nothing). On default Android and iOS settings the screen dims and locks after 30 s–2 min. That happens during CPR, when no one is touching the phone. `navigator.wakeLock` is available in the test browser. | Code grep; `'wakeLock' in navigator === true` | P0 | Add a `useWakeLock(active)` hook. Request the lock when the timer starts or a protocol screen mounts. Re-request it on `visibilitychange`, and release it on unmount or reset. | S |
| F09 | Treatment Log | All | The same in-memory-only pattern as F01. All checked interventions, meds and timestamps live in `useState` with no persistence. Opening a drug calculator or the Resus tab mid-job wipes the log. | Code: `treatment-log/page.tsx:638-662` has no storage. | P0 | Use the same persistent store as F01. "New patient" (which already confirms) becomes the only way to clear. | S (after F01) |
| F10 | Shared: tool headers, chips and dialogs on ~25 screens | Phones / both | These touch targets fall under 44px:<ul><li>**Back button 32×32** (adult/witnessed/peds arrest, ROSC, ECMO, asthma, MWCS, RSI, stroke, GCS, burns, trauma-bypass, toxicology, toxidrome, RACE).</li><li>**Reset icon 32×32** (peds arrest, ROSC, asthma, MWCS, stroke, RACE, GCS, burns, trauma-bypass).</li><li>**Copy summary 101×31** (about 25 tools).</li><li>Arrest **Algorithm / Quick Reference** tabs 28px tall.</li><li>**ROSC / No ROSC** expanders 36px.</li><li>"All categories" back pill 30px.</li><li>Theme toggle 34px.</li><li>Resus "Other…" dialog **Cancel / Add 36px**.</li><li>Shock-index Reset 45×24.</li><li>CPG/SOP/CPM "Go to page" input **16px** tall.</li><li>Toxicology symptom chips 34px.</li><li>Care Bundles and CPG-changes filter chips 30px.</li><li>RASS tabs 32px.</li></ul> | Appendix A lists every <44px target per screen (390×844). | P0 | Add a shared `IconButton` and `Button` with `min-h-12 min-w-12` (48px), with a hit area extended by padding rather than a bigger icon. A shared `ToolHeader` uses them for back, reset and copy (Batch 4). | M |
| F11 | Drug Infusion Calculator | All | Patient weight is set with a **range slider**, 3–150 kg. At 360px it is 294px wide, so **2px per kg**, on a 24px-tall track. Presets come only in 10 kg steps (50–100). There is no typed entry and no stepper. A thumb scrolling the page can catch the slider and silently change the weight, and with it the mL/h result. The dose-rate slider has the same problem. | `interaction-drug-calculator-adrenaline-360x640-dark.png`. Measured: 2.0px/kg; slider 294×24. | P0 | Use a shared `NumberStepper`: −/+ buttons at 48px plus a typed `inputMode="decimal"` field with range validation. Keep the presets. Echo the weight inside the result card ("for **70 kg**") so it gets checked. Drop the slider, or make it display-only. | M |
| F12 | Drug Calculator → General Formulas | All | `FormulaField` uses `parseFloat(v) \|\| 0`. Clearing a field silently becomes **0** and still produces a result. `min` / `max` aren't enforced on typed values. Inputs are ~30px tall, 80px wide, `text-sm`. Units read "**mcg (or mg)**" and "**mcg/mL (or mg/mL)**", which invites a 1000× unit mismatch. | `drug-calculator/page.tsx:1095-1110`, `:1153-1154` | P0 | Validate: when a field is empty or out of range, show an inline error and hide the result rather than computing from 0. Make the unit an explicit selector (mcg or mg) shared by dose and concentration. Use 48px inputs. | S |
| F13 | RSI Meds, Peds Arrest, Adult Arrest, ROSC, GCS, Vitals | Phones / both | Critical numbers fall below 16px and below the 7:1 AAA target:<ul><li>RSI "Pre-induction targets" doses ("1.5 mg/kg", "1.2 mg/kg", "1–2 mg/kg") at ~12–13px in coloured text.</li><li>RSI phase timings ("T−3 min", "T=0") **8.8px at 1.53:1**.</li><li>Peds joule rows "4 J/kg / 6 J/kg / 8 J/kg max" labels **9px at 2.89:1**.</li><li>Adult arrest energies "200 → 300 → 360 J" **10.4px at 3.1:1**.</li><li>ROSC targets ("94–98%", ">90 mmHg") 12px.</li><li>GCS band labels **9px at 1.9:1**.</li><li>Vitals age-band labels 9.6px at 1.6–1.9:1.</li></ul> | `rsi-meds-390x844-dark.png`, `peds-arrest-*`, `adult-arrest-*`, `gcs-*`. Values are in the per-screen metrics. | P0 | Add a shared `CriticalValue` component: minimum 20px, weight 700+, `tabular-nums`, `text-slate-50` on the dark surface (≥ 12:1), with the unit at ≥ 14px. No coloured text on critical numbers; put colour in an icon or border instead. | M |

### P1

| ID | Screen | Viewport / theme | Issue | Evidence | Sev | Suggested fix | Effort |
|---|---|---|---|---|---|---|---|
| F14 | Phone landscape / tablet | 844×390, 768×1024 | The layout switches on `md` (768px), so a **phone in landscape gets desktop chrome**. The BottomNav (Resus, Search) disappears and a 55px desktop header appears. On the Resus Timer at 390px tall, only the clock fits: **Shock / Adrenaline start at y≈466 and Start/Reset at y≈646**, both below the fold. Tablets also lose the one-tap Resus shortcut. | `resus-timer-844x390-dark.png`, `adult-arrest-844x390-dark.png`, `dashboard-768x1024-light.png` | P1 | Gate desktop chrome on `(hover:hover) and (pointer:fine)` or on the device context, not on width. Give the Resus Timer a landscape layout: clock on the left, the 4 event buttons plus Start/Reset in a 2×3 grid on the right. | M |
| F15 | Adult / Witnessed / Peds medical arrest | 360×640 / both | The decision point, **rhythm selection** (VF/VT vs Asystole/PEA), sits below about 2 screens of static checklist ("Confirm arrest", "Start CPR"). On load at 360×640 none of the pathway controls are visible. | `fold-adult-arrest-360x640-dark.png` | P1 | Put the rhythm selector (and LP15/Zoll) at the top of the screen. Collapse steps 1–2 into a one-line "✓ Confirm arrest · Start CPR" disclosure. | S |
| F16 | All tools | All | Navigation and headers are inconsistent across 30 tools:<ul><li>Header `h1` sizes range from **14px to 20px** across 6 patterns.</li><li>Resus Timer and RASS have **no back control**.</li><li>Sepsis uses a text link "← Back to tools".</li><li>Category pages use an "All categories" pill.</li><li>Documentation uses "Go back".</li><li>The eyebrow line holds a mix of category, CPG number and version in different colours.</li><li>Arrest titles don't match their list names: the list says "Adult Cardiac Arrest (Unwitnessed)", the page says "Adult Medical Cardiac Arrest".</li></ul> | The header comparison table is in Appendix B. | P1 | Use one shared `ToolHeader` with: back (48px), a title (18–20px) that matches the list name, a single meta line (`CPG x.y · v2.6`), and right-hand slots for Reset and Copy. | M |
| F17 | Dashboard, Drug Calc, Arrest tools, BottomNav, Search, Peds/Adult arrest | All | **Red and amber are used for things other than severity:**<ul><li>Drug identity colours (Adrenaline red, Noradrenaline rose, Amiodarone amber, Ketamine orange), including **the weight and dose values in red**.</li><li>The **active Resus tab is red**.</li><li>"RESUSCITATION · CPG 2.1" eyebrow in red.</li><li>**Selected LP15 shown with an amber border**.</li><li>Dashboard category tiles in red, orange and amber.</li><li>SOP search results in amber.</li><li>The resus "Pause" phase is amber.</li></ul>Crews learn that red means danger, and here it doesn't. The Shock button being red is defensible as a high-risk action, but it should be a conscious exception. | `drug-calculator-390x844-dark.png`, `interaction-drug-calculator-adrenaline-full-360x640-dark.png`, `adult-arrest-844x390-dark.png` | P1 | Reserve `red-*` and `amber-*` for a `severity` token only. Selection becomes emerald plus a check icon. Drug and category identity use neutral, sky, violet or teal hues, or icons. Document the Shock button as the only allowed exception. | M |
| F18 | Peds Arrest, GCS, Asthma, MWCS, Treatment Log | 360×640 / both | Stacked fixed bars eat the screen. On Peds Arrest, a fixed "Active weight" bar (68px), the BottomNav (71px) and the header (80px) leave **only ~420px of 640** to scroll. GCS is similar (94px bar). On **Treatment Log, the Handover bar sits on top of the BottomNav and hides it** (bar top 777, nav top 773), so the Resus and Search tabs disappear on that screen. | `fold-peds-arrest-360x640-dark.png`, `fold-treatment-log-360x640-dark.png` | P1 | Use one shared `StickyActionBar` that docks **above** the BottomNav (`bottom: calc(4rem + env(safe-area-inset-bottom))`) and collapses to a single 48px row on short screens. Headers stop being sticky on screens under 700px tall. | M |
| F19 | All screens | All | 90% of text nodes are under 16px. The smallest are 8.8px (RSI), 9px (Peds, GCS, MWCS) and 9.28px (Witnessed). Grey helper text (`text-slate-500/600/700` on dark teal) measures 1.5–3.6:1. Many CPG references and sub-labels that carry content ("No signs of life", "Immediate", "CPG 2.7") are 9.6px at 1.9:1. | The font histogram is in the per-screen metrics. Adult Arrest (dark) has 17 of 37 text nodes failing AA. | P1 | Set a type scale floor: body 16px, secondary 14px, legal and meta 12px at most and never for clinical content. Use `slate-300` for secondary text on dark surfaces (about 9:1). Ban `slate-600/700` text on dark. | M |
| F20 | Most tools | All | **There are no visible focus styles**: none of the tool pages under `app/(app)/tools/` use `focus-visible:`. Icon-only buttons have no accessible name: the back button on about 20 tools, the 9 dashboard drag handles, and the search-sheet close button. Inputs have no label: Shock Index (3 inputs), the Peds weight override, the 5 Documentation textareas, CPG/SOP/CPM "Go to page", and the Chat box. | `unnamed` / `unlabelled` arrays in Appendix A. `grep focus-visible`. | P1 | Shared `IconButton` requires an `aria-label` prop. Shared `Field` wraps `<label>` and the input. Add a global `:focus-visible` ring in `globals.css` (2px emerald plus a 2px offset). | S |
| F21 | Dashboard | 360, 390 / both | Drag-to-reorder **works** at both 360 and 390. A hold of at least 800 ms on the icon followed by a drag reordered the grid and persisted it (`interaction-dashboard-drag-390x844-dark.png`). Problems:<ul><li>The 80×80px icon has `touch-none`, so **a swipe that starts on an icon doesn't scroll the page** (0px measured at 390). The icon is about 40% of each card.</li><li>The only hint is "Hold the icon to rearrange" at **9.6px and 2.28:1**.</li><li>There's no keyboard sorting, although the handle is exposed as `role=button tabindex=0`.</li><li>The handle is a button nested inside a link, which is invalid nesting.</li><li>There's no way to reset the order.</li></ul> | Drag test log (Appendix A) | P1 | Make reordering an explicit "Edit layout" mode, entered from a header button, and leave cards plain links outside it. Remove `touch-none` outside edit mode. Add dnd-kit's `KeyboardSensor`. Add "Reset order". | M |
| F22 | Resus Timer "Other…" dialog, BottomNav search sheet | All | Neither is a real dialog: no `role="dialog"` or `aria-modal`, no focus trap, no Esc handling, and no restoring focus on close. The search close button is an unnamed 32px icon. | Code: `resus-timer/page.tsx:764`, `BottomNav.tsx:420-444` | P1 | Add a shared `Sheet` component based on native `<dialog>` (`showModal()` gives focus trap and Esc for free), with 48px actions. | S |
| F23 | All | Offline | There is no offline indicator anywhere, and the Clinical Assistant (chat) can't work offline. The BottomNav still promotes "CPG Chat" as a primary tab, and there is no message when it fails. | `offlineIndicator: false` in the offline test | P1 | Add a small "Offline — tools available, Assistant unavailable" pill in the header, and disable the Chat tab with that explanation. Next 16's experimental `useOffline` hook can drive this ([Next docs: Offline support](https://nextjs.org/docs/app/guides/offline-support)), or a 5-line `online`/`offline` listener. | S |
| F24 | Respect for reduced motion | All | `prefers-reduced-motion: reduce` is ignored everywhere:<ul><li>`html { scroll-behavior: smooth }` stays smooth.</li><li>`animate-pulse` (Adrenaline "DUE NOW"), `animate-bounce` (chat typing) and `animate-spin` keep running.</li><li>Cards keep `transition-all` and `active:scale-95`, and the drag lifts with `scale-[1.06]`.</li></ul>No `motion-safe:`/`motion-reduce:` variant is used in the codebase. | Measured under reduced-motion emulation: pulse 2s and bounce 1s still running; scroll-behavior `smooth`. | P1 | Add `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } *, ::before, ::after { animation-duration: .01ms !important; transition-duration: .01ms !important } }`. Change `animate-pulse` to `motion-safe:animate-pulse`, which is supported in Tailwind 3.4. Keep a **static** red "DUE NOW" state so nothing depends on motion. | S |
| F25 | Landing | Phones / both | The floating "Install app" pill (31px tall) overlaps the third Quick-action tile. The status chips read **"Tools available: 5"** and **"Time-critical tools: 3"**, but there are about 30 tools. "Mobile mode" and the copy about UA detection are developer jargon. | `landing-390x844-light.png` | P1 | Dock the install hint into the card flow, or make it dismissible. Derive chip counts from `TOOL_GROUPS`, or remove them. Remove "Mobile mode". | S |
| F26 | Toxicology, Treatment Log, CPG-changes | Phones | These screens have a high choice density. Toxicology shows 51 interactive targets (22 under 48px) in one scroll. Treatment Log has 13 collapsible stages × up to 13 items. Patient-type tiles that aren't selected render at about 1.3:1, so they read as disabled. | `toxicology-390x844-dark.png`, `fold-treatment-log-360x640-dark.png` | P1 | Group symptoms by body system under collapsed headings. Unselected tiles use full-contrast text with an outline, not a dimmed fill. | M |
| F27 | Update banner | Dashboard *(code review)* | The banner is a `text-xs` button with `py-2` (about 32px tall). It shows only on `/dashboard`, which is the right placement. | `UpdateBanner.tsx` | P1 | Use 48px height and `text-sm`, add a "Later" dismiss, and gate it on being online (see F04). | S |

### P2

| ID | Screen | Viewport / theme | Issue | Evidence | Sev | Suggested fix | Effort |
|---|---|---|---|---|---|---|---|
| F28 | Global CSS | — | `globals.css` overrides about 40 Tailwind classes using `[class~="bg-slate-950"]` attribute selectors with `!important`. This is the root cause of F05 and makes colour behaviour unpredictable: `bg-slate-950` renders as dark teal even in light mode, and `text-emerald-400` becomes cyan-700 in light. | `app/globals.css:94-158` | P2 | Replace these with CSS-variable tokens in `tailwind.config.ts` `theme.extend.colors` (e.g. `surface`, `ink`, `accent`, `severity`), and migrate gradually. | L |
| F29 | Config / dead code | — | There are two Tailwind configs, `tailwind.config.js` and `tailwind.config.ts`, with identical content. `components/Button.tsx` (blue-600) and `components/Card.tsx` are unused and off-palette. `ICON_MAP` lacks `Calculator`, so WAAFELSS falls back to a generic icon. | Repo | P2 | Delete the `.js` config. Repurpose `components/` as the home for the new shared components. | S |
| F30 | All pages | — | Every page has the same `<title>`, "Ambulance Paramedic Toolkit". Tab switching, history and screen-reader page announcements can't tell pages apart. | `res.title` on all 42 screens | P2 | Add `export const metadata = { title: "GCS · Paramedic Toolkit" }` per route, or a `title.template` in the root layout. | S |
| F31 | Sepsis | — | `/tools/sepsis` exists and works, but isn't linked from any category, the search, or the service worker. It is also the only tool built with proper light/dark classes. | `TOOL_GROUPS` (no entry) | P2 | Link it, or delete it (see Clinical flag C6). | S |
| F32 | Eyebrow labels | All | Uppercase labels with wide letter-spacing (`tracking-[0.25em]`) at 9–11px appear on almost every card header. They're decorative, hard to read, and take vertical space. | Most screens | P2 | Use sentence-case 14px semibold section headings. | S |

---

## 3. Cross-cutting issues (fix once, in shared components)

The Tailwind components below all live in the existing stack, under `components/` or `app/_components/`, with no new UI library. Each one removes a whole class of findings.

| Shared piece | What it standardises | Fixes |
|---|---|---|
| `ToolShell` + `ToolHeader` | Forced dark scope for tools (stopgap); a 48px back button with `aria-label`; one 18–20px title that matches the list name; one meta line; right-side `Reset` / `Copy` slots; per-route `<title>` | F05, F06, F10, F16, F20, F30 |
| `IconButton` / `Button` (`primary` emerald, `secondary`, `destructive`) | `min-h-12 min-w-12`, a `focus-visible` ring, a required `aria-label` on icon-only buttons; `destructive` needs `confirm` (two-step or hold) and offers Undo | F02, F10, F20, F22, F27 |
| `NumberStepper` / `Field` | 48px −/+ buttons, typed `inputMode="decimal"`, min/max validation with inline error, `<label>` association, a unit suffix, and no silent `\|\| 0` | F11, F12, F20 |
| `CriticalValue` / `ResultCard` | ≥ 20px bold tabular numbers at ≥ 12:1 on the dark surface, ≥ 14px unit, input echo ("for 70 kg"), severity only through the `severity` prop (icon + label + colour) | F13, F17, F19 |
| `SegmentedControl` / `Tabs` / `Chip` | 48px height, selected state shown with emerald plus a check icon (never amber or red), `aria-pressed` / `role=tab` | F10, F17, F26 |
| `StickyActionBar` | Docks above the BottomNav; one bar per screen; collapses on short viewports | F18 |
| `Sheet` (native `<dialog>`) | Focus trap, Esc, focus restore, 48px actions | F22 |
| `usePersistentCase()` store | A module-level store with `localStorage` persistence and timestamp-derived timers, shared by the Resus Timer, Treatment Log and (later) arrest algorithms | F01, F09 |
| `useWakeLock(active)` | Screen Wake Lock with re-acquire on visibility change | F08 |
| Theme tokens (`surface`, `ink`, `muted`, `accent`, `severity-high`, `severity-med`) | Replace the `globals.css` `!important` overrides; makes light mode real | F05, F19, F28 |
| Reduced-motion base layer | A global media query plus the `motion-safe:` convention | F24 |

**Patterns that repeat across many tools:**
- A 32×32px icon back button with no `aria-label` (about 20 tools).
- A 32×32px reset icon (about 9 tools).
- "Copy summary" 31px tall (about 25 tools).
- The "uppercase 9–11px eyebrow" style (nearly all tools).
- `text-slate-500/600/700` helper text on dark teal (all tools).
- A hard-coded `bg-slate-950` root (25 tools).

---

## 4. Clinical content flags (not fixed, listed for clinical review)

These are observations only. I did not change, or check against the source PDF, any dosing, algorithm logic or `public/reference/*` content.

| ID | Where | Observation | Why it's flagged |
|---|---|---|---|
| C1 | App-wide | Your brief references **CPG v2.5 2026**, but the app says **v2.6 (2026)** everywhere: dashboard metadata, headers, the PDF path `cpg-v2.6-2026.pdf`, and the latest commit "Update to CPG v2.6". *Follow-up check:* the repo PDF's own running header reads "HMCAS CPG VERSION 2.6 2026" on 405 of 412 pages (v2.6, approved 07/09/2026). It replaced `cpg-v2.5-2026.pdf` in `efbed0b` on 2026-10-17, **after** the 17 care-bundles and RSI fixes of 25–26 Aug, which were checked against v2.5. The `care-bundles/page.tsx:588` "v2.5 <15h window" mention is a deliberate historical note. | Re-verify the August fixes against v2.6. `efbed0b` relabelled their "not in CPG v2.5" comments as v2.6, but the diff doesn't show that they were re-checked. |
| C2 | Peds Arrest (WAAFELSS) vs Peds Medical Arrest | WAAFELSS shows rows for **4 J/kg, 6 J/kg and 8 J/kg max**, with the formula label "4 J/kg · CCP **+2 J** to max 8 J/kg". Peds Medical Arrest says "after 5 shocks, increase **+2 J per shock**". The dashboard tagline says "4 J/kg shocks" only. | It is ambiguous whether the escalation step is +2 J or +2 J/kg, and the two tools present different escalation schedules. |
| C3 | GCS | A total of **15** is labelled "**Mild impairment**" (band 13–15). | Labelling a normal GCS as impaired may confuse documentation and handover. Check the CPG wording. |
| C4 | Drug Calculator → General Formulas | The units "mcg (or mg)" and "mcg/mL (or mg/mL)" are free-form; the result is only right if both fields use the same unit. | There is a risk of 1000× error. This is also listed as UI finding F12. |
| C5 | Resus Timer / Adult Arrest | The adrenaline reminder is a fixed **every 4 min** after the first logged dose. That matches the app's own CPG 2.1 text, but there is no rhythm context (shockable: after the 3rd shock; non-shockable: ASAP). | Check that "every 4 min" matches CPG v2.6 wording exactly, and that the timer shouldn't prompt the first dose by rhythm. |
| C6 | Sepsis (`/tools/sepsis`) | The tool isn't linked from navigation, has no version label, and uses QEWS triggers that reference "CPG 1.8". | It may be stale relative to v2.6. Either review and link it, or retire it. |
| C7 | Toxicology / Toxidrome | Metadata cites "CPG 8.x" instead of specific CPG numbers. | It's hard for crews to cross-check against the PDF. |
| C8 | Clinical Assistant | A suggested prompt is "Adrenaline dose in adult cardiac arrest?". The AI answers dosing questions while flagged beta. | Confirm the answer UI carries a prominent "verify against CPG" warning next to any dose. Product and clinical governance should decide whether dose questions should be offered as suggestions at all. |

---

## 5. Proposed fix order (small, independently shippable batches)

Each batch can ship and be verified on its own. The order puts patient-safety risk first and effort second.

| Batch | Contents | Findings | Effort | Verification |
|---|---|---|---|---|
| **B1 — Never lose a case, never sleep** | `usePersistentCase` store plus `localStorage` for the Resus Timer; timestamp-derived clock; "in progress" pill on the Resus tab; Reset split into "New cycle" and "Clear case" (hold-to-confirm + Undo); remove "again"/"restart" voice words; `useWakeLock` on the Resus Timer, arrest algorithms, Treatment Log and RSI; Treatment Log persistence | F01, F02, F08, F09 | M | Re-run the interaction test: start the timer, log events, navigate away and back, then reload. The log and clock must survive. A single tap on Reset must not clear. |
| **B2 — Offline that actually works** | Build-time precache manifest (`/_next/static/**` + every route in `TOOL_GROUPS`); a build check for missing routes; banner gated on being online and on a complete install; offline pill; Chat disabled offline | F03, F04, F23, F27 | M | Fresh context: load `/` once, go offline, and open every tool cold. All must render. Then simulate an update while offline. |
| **B3 — Theme stopgap and the worst contrast** | `app/(app)/tools/layout.tsx` with a `.dark` scope; hide or relabel the toggle on tools; fix the dashboard mobile header colour | F05, F06 | S | Re-run the light sweep. Tool screens should match their dark metrics, and the dashboard header should be ≥ 7:1. |
| **B4 — Shared header and controls** | `ToolHeader`, `IconButton`, `Button`, a global `:focus-visible` ring, `aria-label`s, per-route titles; roll out to all 30 tools mechanically | F10, F16, F20, F30, F29 | M | The sweep reports 0 targets under 44px in headers and 0 unnamed buttons. |
| **B5 — Names and above-the-fold** | `line-clamp-2` plus distinctive names in category lists; rhythm selector moved to the top of the arrest tools; matching list and page titles | F07, F15 | S | Truncation check at 360/390/412 returns nothing; the rhythm selector is visible on load at 360×640. |
| **B6 — Inputs and critical values** | `NumberStepper` / `Field`, Drug Calculator weight and dose entry, General Formulas validation and explicit units; `CriticalValue` on RSI, Peds Arrest, Adult Arrest, ROSC, GCS and Vitals | F11, F12, F13 | M | All critical numerics ≥ 20px and ≥ 7:1; an empty or out-of-range input shows an error and no result. |
| **B7 — Layout chrome** | `StickyActionBar` above the BottomNav; Treatment Log bar no longer hides the nav; landscape and tablet chrome based on pointer type; Resus landscape layout | F14, F18 | M | Re-run the 844×390 captures: BottomNav present, Resus actions above the fold. |
| **B8 — Colour semantics** | `severity` token; selection becomes emerald plus a check; drug and category identity colours moved off red and amber; Resus tab no longer red | F17 | M | Code grep: `red-`/`amber-` only inside the `severity` component (plus the documented Shock exception). |
| **B9 — Readability pass** | Type-scale floor (16/14/12), `slate-300` secondary text, eyebrow cleanup, density reduction on Toxicology and Treatment Log | F19, F26, F32 | M–L | The sweep shows text-under-16px share below 40% and AA failures below 5%. |
| **B10 — Motion, dashboard, polish** | Reduced-motion base layer; dashboard "Edit layout" mode + `KeyboardSensor` + reset order; landing fixes; Sepsis link-or-remove; proper `<dialog>` sheets; token migration out of `globals.css` | F21, F22, F24, F25, F28, F31 | M–L | Reduced-motion emulation shows no running animations; keyboard reorder works. |

B3 is the cheapest high-impact item and can ship alongside B1.

---

## Appendix A — Raw test results

**Resus Timer state test** (390×844, dark, reduced motion): 2 log rows after Start, Shock and Adrenaline. After Tools → Resus navigation: 0 log rows, the clock reads `02:00`, and the button reads "Start". Reset: 0 confirmation dialogs, and the log was emptied.

**Offline test:**
- Fresh context: loaded `/`, waited for the service worker to precache, then went offline.
- Precache contained 23 entries: `/`, `/dashboard`, 4 category pages, 14 tool HTML pages, and the manifest and icons.
- Offline result for every one of the 20 routes tried except `/dashboard`: **"This page couldn't load"**.
- Second context, after opening Resus, RSI and Drug Calc online: those 3 rendered offline. GCS and client-side navigation to Adult Arrest still failed.

**Drag test** (CDP touch: 900 ms hold, then a 12-step move from Toxicology to Resuscitation):
- 360×640: new order `trauma, resuscitation, toxicology, …`, persisted.
- 390×844: same result, persisted.
- A swipe starting on the icon at 390 scrolled **0px**.
- Handle: `role=button`, `tabindex=0`, `aria-roledescription=sortable`; no keyboard sensor configured.

**Truncated tool names:**
- **360:** Burn Surface Area Calculator, Emergency Resuscitation Timer, Adult Cardiac Arrest (Unwitnessed), Adult Cardiac Arrest - Witnessed, Paediatric Medical Cardiac Arrest, Paediatric Arrest (WAAFELSS), Post-Cardiac Arrest (ROSC) Care, Asthma Severity (Adult + Paeds), RACE Scale (Stroke LVO), Glasgow Coma Scale (Adult + Paeds), Sedation Assessment (RASS), Drug Infusion Calculator, Clinical Assistant (beta), Standard Operating Procedures. Also tool headers: Shock Index & MAP Calculator, Clinical Practice Guidelines.
- **412:** still 9 names, plus 2 headers.

**Targets under 44px at 390×844 (dark):**
- **Category pages:** All categories 120×30.
- **Resus Timer:** Copy summary 101×31.
- **Arrest tools (×3):** back 32×32, Copy summary 101×31, Algorithm and Quick Reference 173×28, ROSC and No ROSC 356×36.
- **Peds Arrest:** back 32, Reset 32, Copy summary 31.
- **ROSC:** back 32, Reset checklist 32, Copy 31, Next 42.
- **ECMO, Asthma, MWCS, Stroke, GCS, Trauma-bypass:** back 32, reset 32, Copy summary 31.
- **RSI:** back 32, Copy 31, "Next: Pre-treatment" 42.
- **RACE:** Back 32, Reset 32, Copy 31, two links at 30, test buttons 42.
- **RASS:** tabs 119×32.
- **Treatment Log:** Handover 40, New patient 38.
- **Care Bundles:** chips 30.
- **Documentation:** Go back 36, Save/Download/Clear 38, 5× Copy 36.
- **Toxicology:** back 32, Copy 52×31, symptom chips 163×34.
- **Burns:** back 32, Reset 32, two icons 36, Copy 31.
- **Vitals:** back 36, Copy 31.
- **CPG / SOP / CPM:** back 36, Ask AI 30, Prev and Next 34, page input 80×16, Go 40×28.
- **CPG changes:** filter chips 30, search input 20px tall.
- **Chat:** back 36, suggestions 42, Send 40.
- **Shock Index:** back 36, Copy 31, Reset 45×24.
- **Sepsis:** Back 34, criteria buttons 31, Copy 30.
- **Landing:** Open tools 30, theme toggle 34, Protocol Finder 38, Install 31.

**Contrast totals** (all 348 sweep captures): 11,596 text nodes, of which **3,990 fail AA (34%)**. Light: 2,332 of 5,798 fail (40%). Dark: 1,658 of 5,798 fail (29%).

## Appendix B — Tool header comparison (from source)

| Pattern | Tools | `h1` size | Back control |
|---|---|---|---|
| Sticky header, `text-sm` title, icon back 32px | adult-arrest, witnessed, peds-medical, burns, trauma-bypass, rosc, rsi-meds | 14px | Icon, no label |
| Sticky header, `text-base` title | asthma, ecmo, gcs, mwcs, peds-arrest, race, stroke | 16px | Icon, no label |
| `text-base truncate` title | cpg, cpm, sop, vitals, shock-index, documentation, cpg-latest-changes | 16px | Icon (36px), some labelled "Go back" |
| `text-sm truncate` title | toxicology, toxidrome | 14px | Icon, no label |
| Page-style `text-xl` title, no app-bar | care-bundles, drug-calculator, treatment-log, rass | 20px | Care Bundles "CCP / CCA" pill (30px); Drug Calc only inside drug detail views; RASS **none** |
| Custom | resus-timer (none), sepsis ("← Back to tools"), cpg-chat | 14–24px | Mixed |
