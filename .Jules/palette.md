## 2025-05-22 - [Clinical Safety & A11y]
**Learning:** In high-pressure clinical environments, multi-modal feedback (haptics + `aria-live`) and guarding destructive actions (e.g. Reset) with two-step confirmations are critical for preventing data loss and ensuring accessibility.
**Action:** Always implement confirmation patterns for high-risk clinical actions and use `aria-live` for transient status updates like 'Copied!'.
