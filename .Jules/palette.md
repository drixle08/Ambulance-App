## 2025-05-14 - [Resuscitation Timer Reset Confirmation]
**Learning:** In high-pressure clinical environments, destructive actions like 'Reset' require a two-step confirmation pattern with high-contrast visual cues (e.g., `bg-red-600`) and an auto-revert timeout (e.g., 3 seconds) to prevent accidental data loss while ensuring the interface remains predictable.
**Action:** Implement two-step confirmation with `aria-label` updates and auto-revert logic for all high-risk clinical reset/clear actions.
