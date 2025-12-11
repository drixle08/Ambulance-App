export type DeviceType = "mobile" | "desktop";

// Minimal user-agent check to distinguish handheld devices.
const MOBILE_USER_AGENT_PATTERN =
  /android|iphone|ipad|ipod|iemobile|blackberry|bada|webos|opera mini|mobile/i;

export function detectDeviceType(userAgent?: string | null): DeviceType {
  if (!userAgent) return "desktop";
  return MOBILE_USER_AGENT_PATTERN.test(userAgent) ? "mobile" : "desktop";
}
