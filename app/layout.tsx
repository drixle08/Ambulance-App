import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/app/_components/ThemeProvider";
import { ServiceWorkerRegister } from "@/app/_components/ServiceWorkerRegister";
import { DeviceProvider } from "@/app/_components/DeviceProvider";
import { detectDeviceType } from "@/lib/device";

export const metadata: Metadata = {
  title: "Ambulance Paramedic Toolkit",
  description: "Paramedic tools for ambulance crews",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Ambulance Paramedic Toolkit",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent");
  const deviceType = detectDeviceType(userAgent);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-device={deviceType}
    >
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <DeviceProvider initialDevice={deviceType}>
          <ThemeProvider>
            {children}
            {/* TEMP: always register SW for debugging, dev + prod */}
            <ServiceWorkerRegister />
          </ThemeProvider>
        </DeviceProvider>
      </body>
    </html>
  );
}
