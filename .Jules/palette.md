## 2026-06-15 - [Safety Confirmation Pattern in Clinical Tools]
**Learning:** In high-stress clinical environments (like cardiac arrests), destructive actions such as 'Reset' must be guarded by a two-step confirmation pattern. Combining high-contrast visual cues (bg-red-600), haptic feedback (vibration), and a timed auto-revert (3s) ensures safety without adding excessive friction.
**Action:** Implement the 'Confirm?' pattern for high-risk actions. Store timeout IDs in a useRef and explicitly clear them in a cleanup useEffect to prevent state updates on unmounted components.
