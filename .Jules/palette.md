## 2025-05-22 - Safety-critical confirmation patterns in clinical tools

**Learning:** In high-pressure clinical environments (like cardiac arrest), destructive actions such as 'Reset' must be protected from accidental triggers while remaining highly efficient. A two-step confirmation with a short auto-revert timeout (e.g., 3 seconds) provides a safety buffer without creating a permanent modal barrier. High-contrast visual changes (e.g., switching to red) and dynamic ARIA labels ensure the state change is clear to both sighted and screen-reader users.

**Action:** Implement two-step confirmations for destructive actions in clinical tools, using auto-reverting states and high-contrast UI feedback. Ensure voice commands or secondary interaction modes bypass these checks when efficiency is paramount and the mode of entry is less prone to accidental 'taps'.
