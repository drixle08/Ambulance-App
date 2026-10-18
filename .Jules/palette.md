## 2025-05-15 - Destructive Action Safeguards in Clinical UX

**Learning:** High-risk actions in clinical tools (like resetting a resuscitation timer) require intentional friction to prevent accidental data loss, yet must remain efficient for rapid intentional use. A two-step confirmation with a short (3s) auto-revert timeout provides this balance. However, voice-activated commands for the same action should bypass this friction to ensure hands-free reliability when the user's manual focus is elsewhere.

**Action:** Implement a two-step "Confirm?" pattern with high-contrast visual cues (e.g. `bg-red-600`) and haptic feedback for manual resets, while allowing direct execution for voice-triggered resets.
