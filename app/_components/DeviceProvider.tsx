"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { detectDeviceType, type DeviceType } from "@/lib/device";

type DeviceContextValue = {
  deviceType: DeviceType;
  isMobile: boolean;
};

const DeviceContext = createContext<DeviceContextValue | undefined>(undefined);

export function DeviceProvider({
  children,
  initialDevice,
}: {
  children: ReactNode;
  initialDevice: DeviceType;
}) {
  const deviceType = useMemo<DeviceType>(() => {
    if (typeof navigator === "undefined") return initialDevice;
    const ua = navigator.userAgent;
    if (!ua) return initialDevice;
    return detectDeviceType(ua);
  }, [initialDevice]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.device = deviceType;
    }
  }, [deviceType]);

  const value = useMemo(
    () => ({
      deviceType,
      isMobile: deviceType === "mobile",
    }),
    [deviceType]
  );

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}

export function useDevice(): DeviceContextValue {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
}
