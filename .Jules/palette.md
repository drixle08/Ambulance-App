## 2025-05-16 - [Haptic Feedback for Clinical Confirmation]
**Learning:** In high-pressure clinical environments, physical (haptic) feedback provides an essential secondary confirmation layer for critical UI actions like copying summaries or medical triggers, reducing the cognitive load on paramedics who may not be able to focus on the screen.
**Action:** Use `navigator?.vibrate?.(ms)` for terminal confirmation actions (copy, save, submit) while keeping the duration short (50ms) to avoid over-stimulation.
