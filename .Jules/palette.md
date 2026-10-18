## 2025-05-15 - Guarding Destructive Actions in Clinical Tools
**Learning:** In high-pressure clinical environments (like a resuscitation), destructive UI actions such as 'Reset' must be guarded with a two-step confirmation pattern to prevent accidental data loss. A 3-second auto-revert timeout for the confirmation state ensures the UI remains uncluttered if the action was accidental, while high-contrast visual cues (red background) signal the risk.
**Action:** Use a `confirmState` + `setTimeout` pattern for any reset or delete buttons in medical tools.

## 2025-05-15 - Multi-modal Feedback for Transient States
**Learning:** For transient UI states like "Copied!", combining haptic feedback (`navigator.vibrate`) with `aria-live` attributes ensures that users with different needs and in different environments (noisy, high-visual-load) receive confirmation of their action.
**Action:** Always pair `aria-live` with `vibrate()` for critical success confirmations.
