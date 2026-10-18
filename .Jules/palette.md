
## 2026-07-05 - Safety Confirmation Pattern for Clinical Actions
**Learning:** Destructive actions in high-stress clinical environments (like resetting a resus timer) require a two-step confirmation to prevent accidental data loss. A 3-second auto-revert timeout provides a good balance between safety and fluidity, ensuring the UI doesn't get "stuck" in a dangerous state if the user changes their mind or misses the second tap.
**Action:** Use a 'Confirm?' state with high-contrast visual feedback (e.g., `bg-red-600`) and a 25ms haptic pulse for the initial tap. Ensure voice commands bypass this confirmation for efficiency.
