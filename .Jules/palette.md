## 2025-05-14 - [Confirmation Patterns in Clinical Tools]
**Learning:** In high-pressure clinical environments (like a Resuscitation Timer), destructive actions such as 'Reset' should be guarded by a two-step confirmation pattern. A 3-second auto-revert window prevents the interface from getting stuck in a "Confirm?" state if the user changes their mind or misses the second tap.
**Action:** For any destructive or irreversible action, implement a transient confirmation state with high-contrast visual feedback (e.g., `bg-red-600`) and haptic feedback on the first interaction.
