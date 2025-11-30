import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./_components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "MWCS Toolkit",
  description: "Paramedic tools for ambulance crews",
  manifest: "/manifest.webmanifest",
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
        {/* This will register the service worker once we add it */}
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
