import Link from "next/link";
import { ProtocolFinder } from "./ProtocolFinder";
import { DashboardGrid } from "./DashboardGrid";
import { CpgChatBubble } from "@/app/_components/CpgChatBubble";

export default function DashboardPage() {
  return (
    <>
      {/* Mobile sticky header — shown only when AppHeader is hidden */}
      <div className="app-topbar flex md:hidden sticky top-0 z-20 items-center justify-between border-b px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-xs font-bold text-emerald-400">AP</span>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-none">Ambulance Paramedic</p>
            <p className="text-[0.6rem] uppercase tracking-widest text-slate-500">Clinical Tools</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pt-4 pb-4">

        {/* Protocol Finder row — desktop only; mobile uses BottomNav Search tab */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          <Link href="/?allowLanding=1" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500">
            ← Back
          </Link>
          <div className="min-w-48 flex-1">
            <ProtocolFinder />
          </div>
        </div>

        <header className="space-y-0.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-emerald-500">Tools dashboard</p>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Select a category</h1>
        </header>

        <DashboardGrid />
      </div>
      <CpgChatBubble />
    </>
  );
}
