import type { ReactNode } from "react";
import { AppHeader } from "@/app/_components/AppHeader";
import { BottomNav } from "@/app/_components/BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Desktop-only top header */}
      <AppHeader />
      {/* Extra bottom padding on mobile clears the fixed BottomNav (h-16 = 4rem) */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>
      {/* Mobile-only bottom tab bar */}
      <BottomNav />
    </div>
  );
}
