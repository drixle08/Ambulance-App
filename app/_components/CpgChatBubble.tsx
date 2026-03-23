"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function CpgChatBubble() {
  return (
    <Link
      href="/tools/cpg-chat"
      className="hidden md:inline-flex fixed bottom-20 right-6 z-50 items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      aria-label="Open Clinical Assistant"
    >
      <MessageCircle className="h-4 w-4" />
      Clinical Assistant
    </Link>
  );
}
