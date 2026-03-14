"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, MessageCircle, Pill, Search, Timer, X } from "lucide-react";
import {
  CPG_ENTRIES,
  searchMedications,
  type CpgEntry,
  type MedicationEntry,
} from "@/lib/cpgIndex";

const PDF_PATH = "/reference/cpg/cpg-v2.4-2025.pdf";

// ─── Inline search result components ─────────────────────────────────────────

function SearchResults({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) {
  const q = query.toLowerCase().trim();
  const numericQuery = Number(query.trim());
  const isNumericQuery =
    query.trim().length > 0 &&
    Number.isFinite(numericQuery) &&
    numericQuery > 0 &&
    numericQuery < 1000;

  const protocols: CpgEntry[] = q
    ? CPG_ENTRIES.filter(
        (e) =>
          e.code.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.keywords.some((k) => k.toLowerCase().includes(q)) ||
          (isNumericQuery && e.printedPage === Math.round(numericQuery))
      ).slice(0, 7)
    : [];

  const meds: MedicationEntry[] =
    q && !isNumericQuery ? searchMedications(q) : [];

  const hasResults = protocols.length > 0 || meds.length > 0 || isNumericQuery;

  const open = (url: string) => {
    window.location.assign(url);
    onClose();
  };

  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-600">
        <Search className="w-8 h-8" />
        <p className="text-sm">Type to search protocols or medications</p>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <p className="px-5 py-8 text-center text-sm text-slate-600">
        No matching protocols or medications found.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-800/60">
      {/* Jump to page */}
      {isNumericQuery && (
        <button
          type="button"
          onClick={() => open(`${PDF_PATH}#page=${Math.round(numericQuery)}`)}
          className="flex w-full items-center justify-between px-5 py-4 hover:bg-slate-800/40 active:bg-slate-800"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-100">
              Open printed page {Math.round(numericQuery)}
            </p>
            <p className="text-xs text-slate-500">Jump to CPG PDF page {Math.round(numericQuery)}</p>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-400">
            PDF
          </span>
        </button>
      )}

      {/* Protocols */}
      {protocols.length > 0 && (
        <>
          <div className="bg-slate-900/60 px-5 py-2">
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">
              Protocols
            </span>
          </div>
          {protocols.map((entry) => (
            <button
              key={entry.code}
              type="button"
              onClick={() => open(`${PDF_PATH}#page=${entry.printedPage}`)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-800/40 active:bg-slate-800"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-100">{entry.title}</p>
                <p className="text-xs text-slate-500">
                  {entry.section} · p.{entry.printedPage}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-400">
                {entry.code}
              </span>
            </button>
          ))}
        </>
      )}

      {/* Medications */}
      {meds.length > 0 && (
        <>
          <div className="bg-violet-500/5 px-5 py-2">
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-violet-500">
              Medications — Formulary
            </span>
          </div>
          {meds.map((med) => (
            <button
              key={med.name}
              type="button"
              onClick={() => open(`${PDF_PATH}#page=${med.formularyPage}`)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-violet-500/5 active:bg-violet-500/10"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-400">
                <Pill className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100">{med.name}</p>
                <p className="text-xs text-slate-500">
                  {med.class ? `${med.class} · ` : ""}Formulary p.{med.formularyPage}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-violet-400">
                Formulary
              </span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Bottom nav bar ───────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus search input when sheet opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [searchOpen]);

  // Close search sheet on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  // Active tab detection
  const isTools =
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/tools") &&
      pathname !== "/tools/cpg-chat" &&
      pathname !== "/tools/resus-timer");
  const isChat = pathname === "/tools/cpg-chat";
  const isResus = pathname === "/tools/resus-timer";

  const tabBase =
    "flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors active:opacity-70";
  const active = "text-emerald-400";
  const inactive = "text-slate-500";

  return (
    <>
      {/* ── Fixed tab bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-slate-800 bg-slate-950/98 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Tools */}
        <Link
          href="/dashboard"
          className={`${tabBase} ${isTools ? active : inactive}`}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[0.6rem] font-semibold tracking-wide">Tools</span>
        </Link>

        {/* Search */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className={`${tabBase} ${searchOpen ? active : inactive}`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[0.6rem] font-semibold tracking-wide">Search</span>
        </button>

        {/* CPG Chat */}
        <Link
          href="/tools/cpg-chat"
          className={`${tabBase} ${isChat ? active : inactive}`}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[0.6rem] font-semibold tracking-wide">CPG Chat</span>
        </Link>

        {/* Resus Timer */}
        <Link
          href="/tools/resus-timer"
          className={`${tabBase} ${isResus ? "text-red-400" : inactive}`}
        >
          <Timer className="h-5 w-5" />
          <span className="text-[0.6rem] font-semibold tracking-wide">Resus</span>
        </Link>
      </nav>

      {/* ── Full-screen search sheet (mobile only) ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 md:hidden">
          {/* Search header */}
          <div
            className="flex items-center gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Protocol, medication, or page number…"
              className="flex-1 bg-transparent text-base text-slate-100 placeholder:text-slate-600 outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <SearchResults query={query} onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
