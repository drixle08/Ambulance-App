# Ambulance Paramedic Toolkit — task list

B = batch from review (B1/B2 = shipped, B3/B4 = open for discussion)

- [x] B1  Fix hardcoded UI counts (Tools available / Time-critical tools) — app/page.tsx — DONE
- [x] B2  Prominent "verify against CPG" banner on Clinical Assistant dose answers — app/(app)/tools/cpg-chat/page.tsx — DONE
- [x] B3  One CPG viewer (dedupe PDF render) — /tools/cpg reuses shared `CpgViewerClient` + `CpgPdfViewer`, same pattern as `/cpg/[code]` — DONE
- [x] B4  Re-run UI audit on current build — Re-capture + re-check F05/F10 etc.
- [x] B5  Run full type-check + lint + test on current code

Notes:
- B1 counts derived from TOOL_GROUPS; "time-critical" = tools with meta field containing "time-critical".
- B2 banner is content-agnostic by design (content detection = product decision; flagged for discussion).
- B3 done per Option A: one viewer implementation (CpgPdfViewer) used by both /tools/cpg and the search path; only entry-page chrome differs.
- Verify each item by reading back the changed file + running `npm run type-check` before marking done.
