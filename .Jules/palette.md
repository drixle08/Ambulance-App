## 2026-06-04 - Multi-modal Feedback for High-Pressure Clinical Actions
**Learning:** In high-pressure environments like resuscitation, visual focus is often divided. Providing multi-modal feedback (haptics + screen reader announcements + visual state changes) for critical UI actions like 'Copy to Clipboard' ensures the user is certain the action succeeded without needing to stare at the screen.
**Action:** Use `navigator.vibrate(25)` for haptics and `aria-live="polite"` for screen readers alongside visual state changes (icons/text) for transient success states.
