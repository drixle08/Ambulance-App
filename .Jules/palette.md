# Palette's Journal - Ambulance Paramedic Toolkit

## 2025-05-15 - Haptic Feedback for Clinical Actions
**Learning:** In high-pressure clinical environments, haptic feedback provides essential confirmation of non-visual actions (like copying to clipboard) without requiring the user to shift focus back to the screen.
**Action:** Use `navigator?.vibrate?.(40)` for successful copy operations and other critical state changes.

## 2025-05-15 - Visual Cues for Async Actions
**Learning:** Users in a hurry benefit from immediate visual state changes (e.g., icon swaps) when an action is completed, especially when the button text also changes.
**Action:** Implement icon transitions (e.g., `Copy` -> `Check`) in reusable buttons.
