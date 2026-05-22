## 2025-05-15 - [Transient Feedback in Clinical Tools]
**Learning:** In high-pressure clinical environments, transient UI state changes (like "Copied!") need multi-modal feedback to ensure they are noticed without requiring constant visual focus. Combining `aria-live` for screen readers and `navigator.vibrate` for tactile feedback ensures accessibility and confirmation even when the user's attention is divided.
**Action:** Always pair visual state changes for critical actions with `aria-live` and consider subtle haptic feedback (`vibrate(10)`) for non-destructive confirmations.
