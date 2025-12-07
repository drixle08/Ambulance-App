import type { ReactNode } from "react";
import { AppHeader } from "@/app/_components/AppHeader";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <AppHeader />
      <main className="flex-1 pb-6">{children}</main>
    </div>
  );
}
