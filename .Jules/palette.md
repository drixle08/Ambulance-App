## 2025-05-15 - Multi-modal Feedback for Transient States

**Learning:** In high-pressure clinical environments, multi-modal feedback (combining haptics and ARIA live regions) ensures that transient UI state changes, such as 'Copied!', are noticed by users whose visual focus may be divided. Placing `aria-live="polite"` on a nested `<span>` rather than the parent button prevents some screen readers from re-announcing the entire button label.

**Action:** When implementing feedback for transient states like 'Copied!', use a subtle 15ms haptic pulse (`navigator.vibrate?.(15)`) and wrap the changing text in a `<span>` with `aria-live="polite"`.
