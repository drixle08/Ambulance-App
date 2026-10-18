## 2025-05-14 - [Copy Feedback Pattern]
**Learning:** In high-pressure clinical environments, users benefit from multi-modal feedback for transient actions like "Copy summary". Combining visual icons (Copy -> Check), haptic pulses (15ms vibration), and screen reader announcements (aria-live) ensures the action is confirmed even when the user's focus is divided.
**Action:** Always implement this triple-feedback pattern (visual + haptic + a11y) for clipboard interactions and similar transient state changes.
