import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/app/_components/ThemeProvider";
import { ServiceWorkerRegister } from "@/app/_components/ServiceWorkerRegister";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <ThemeProvider>
          {children}
          {/* TEMP: always register SW for debugging, dev + prod */}
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
