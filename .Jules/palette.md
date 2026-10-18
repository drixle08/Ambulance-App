## 2026-06-11 - Two-step confirmation for destructive clinical actions
**Learning:** In high-pressure clinical environments (like cardiac arrest), destructive actions like 'Reset' must be guarded against accidental touch. A two-step confirmation pattern with visual feedback (e.g. red high-contrast state) and a short (3s) auto-revert timeout balances safety with speed, while voice commands should bypass this for multi-modal efficiency.
**Action:** Implement `isConfirming` states with auto-revert timeouts for high-risk reset/delete operations in clinical tools.
