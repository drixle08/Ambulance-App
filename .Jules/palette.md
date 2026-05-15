## 2025-05-14 - [Haptic Feedback in Clinical Tools]
**Learning:** In high-pressure clinical environments, tactile confirmation (haptics) is vital for ensuring critical actions like "Copy Summary" (for handovers) or "Medical Triggers" have been successfully registered without requiring the user to look away from their patient.
**Action:** Use `navigator.vibrate` for critical confirmations (copy, meds, arrest triggers) but avoid it for routine navigation to maintain its signaling value.
