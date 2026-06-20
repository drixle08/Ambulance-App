## 2026-06-20 - High-Stakes Action Confirmation Pattern
**Learning:** High-pressure clinical environments (like resuscitations) require protective patterns for destructive actions (e.g., Reset) to prevent accidental data loss. A two-step confirmation with a short (3s) auto-revert timeout and high-contrast visual/haptic feedback provides safety without impeding rapid re-engagement.
**Action:** Use the `resetConfirm` state pattern with `bg-red-600` and `navigator.vibrate` for irreversible actions in medical tools.
