## 2025-05-15 - [Enhanced Copy Feedback]
**Learning:** Browser-based clipboard operations can fail silently or return `None` in certain environments (like some headless CI/headless browsers) if permissions or API mocks are not correctly handled, which impacts UI state testing.
**Action:** Use `navigator?.vibrate?.(ms)` as a safe, non-blocking pattern for tactile feedback, and always pair it with visual state changes (like icons) to ensure feedback is accessible even when vibration is unavailable.
