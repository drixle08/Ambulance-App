## 2025-05-14 - Multi-modal Feedback for Transient UI States
**Learning:** In high-pressure clinical environments, transient UI state changes like "Copied!" are easily missed. Combining visual iconography, haptic feedback (vibration), and ARIA live regions ensures the interaction is noticeable regardless of the user's primary focus.
**Action:** Use `navigator.vibrate?.(15)` and `aria-live="polite"` for "Copy to Clipboard" actions in medical tools.
