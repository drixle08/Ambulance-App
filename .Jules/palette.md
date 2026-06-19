## 2025-06-19 - Safety Confirmation Pattern for Clinical Tools

**Learning:** High-risk destructive actions in high-pressure clinical environments (like resetting a resuscitation timer) should be guarded by a two-step confirmation pattern. A 3-second auto-revert timeout ensures the UI returns to a safe default if the confirmation was accidental or if the clinician's attention is diverted. Visual cues (e.g., high-contrast red styling) and haptic feedback further distinguish the confirmation state.

**Action:** Implement two-step confirmation with auto-revert for any action that causes irreversible data loss in clinical tools.
