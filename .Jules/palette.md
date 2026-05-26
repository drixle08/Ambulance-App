## 2025-05-15 - Enhancing CopySummaryButton accessibility and delight
**Learning:** In high-pressure clinical environments, multi-modal feedback (combining `aria-live` for screen readers and `navigator.vibrate` for haptics) ensures that critical transient UI states like 'Copied!' are effectively communicated without requiring the user's undivided visual focus.
**Action:** Use `aria-live="polite"` and subtle haptic feedback for success/confirmation states in all high-utility clinical components.
