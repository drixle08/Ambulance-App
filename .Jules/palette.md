## 2025-05-14 - Multi-modal feedback for clinical tools
**Learning:** In high-pressure clinical environments, users benefit from multi-modal feedback for transient state changes. Combining `aria-live="polite"` (auditory/textual) with `navigator.vibrate(50)` (tactile) ensures the user is aware of a successful 'Copy' action without needing to maintain visual focus on the button.
**Action:** Always include both `aria-live` and haptic feedback for success confirmations in time-critical clinical tools.
