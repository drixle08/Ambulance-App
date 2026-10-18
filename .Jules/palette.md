## 2026-06-08 - [Multi-modal Feedback & Destructive Action Safety]
**Learning:** In high-pressure clinical environments (like a resuscitation), users benefit from multi-modal feedback (haptics + aria-live) and safety guards for destructive actions. A two-step confirmation for a "Reset" button with a visual state change (red) and a short auto-revert timeout (3s) provides a balance between speed and data safety.
**Action:** Always guard reset/delete actions in clinical tools with confirmation states and provide non-visual feedback for transient UI changes.
