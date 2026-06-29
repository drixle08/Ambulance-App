## 2025-05-15 - [Clinical UX: Destructive Action Confirmation]
**Learning:** In high-pressure clinical environments (e.g., resuscitation), destructive actions like "Reset" require a two-step confirmation to prevent accidental data loss. A 3-second auto-revert timeout is critical to ensure the UI doesn't remain in a "primed" destructive state if the user gets distracted.
**Action:** Implement two-step confirmation with auto-revert and distinct haptic feedback for all destructive clinical tool actions.
