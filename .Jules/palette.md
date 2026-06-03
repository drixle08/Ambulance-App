## 2025-05-22 - Multi-modal feedback for clinical copy actions
**Learning:** In high-pressure clinical environments, multi-modal feedback (combining visual icons, `aria-live` for screen readers, and `navigator.vibrate` for haptics) ensures action success is noticed even when visual focus is divided.
**Action:** Use `navigator?.vibrate?.(25)` and `aria-live="polite"` for transient UI state changes like 'Copied!' in medical tools.
