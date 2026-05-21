## 2026-05-21 - [Destructive Action Safety]
**Learning:** In high-pressure clinical tools (like a resuscitation timer), accidental resets are a significant risk. A single-tap reset is too dangerous.
**Action:** Always guard destructive or high-impact actions (Reset, Delete, Clear) with a two-step confirmation pattern. Use a "Confirm?" state with high-contrast visual changes (e.g., red background) and haptic feedback. Implement an auto-revert timeout (e.g., 3 seconds) to handle cases where the user changes their mind or misses the second tap.
