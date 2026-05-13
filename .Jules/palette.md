## 2026-05-13 - [Haptic feedback and hydration safety]
**Learning:** In high-pressure clinical apps, haptic feedback (navigator.vibrate) provides critical tactile confirmation. However, when using browser-only APIs to control UI states (like 'disabled' or 'vibrate' presence), a hydration mismatch can occur.
**Action:** Always use a 'mounted' state flag set in useEffect with a setTimeout(0) to ensure browser-only logic only affects the UI after the initial hydration.
