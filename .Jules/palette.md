# Palette's Journal - Critical Clinical UX Learnings

## 2026-06-02 - Multi-modal Feedback for Clinical Workflows
**Learning:** In high-pressure clinical environments, users often cannot maintain visual focus on the UI while performing tasks. Multi-modal feedback (combining haptics and `aria-live`) for transient state changes ensures the user is confident an action succeeded without needing to look at the screen.
**Action:** Always pair transient UI state changes (e.g., "Copied!", "Saved") with haptic feedback (`navigator.vibrate`) and `aria-live` attributes to ensure noticeability and accessibility in clinical tool contexts.
