import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./_components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Ambulance Paramedic Toolkit",
  description: "Paramedic tools for ambulance crews",
  manifest: "/manifest.webmanifest",
};

// Next 16 style: move themeColor here
export const viewport: Viewport = {
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        {children}
        {/* Only register the service worker in production (Vercel), not in dev */}
        {process.env.NODE_ENV === "production" && <ServiceWorkerRegister />}
      </body>
    </html>
  );
}
