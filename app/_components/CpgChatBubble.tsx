"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function CpgChatBubble() {
  return (
    <Link
      href="/tools/cpg-chat"
      className="fixed bottom-16 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 md:bottom-20 md:right-6"
      aria-label="Open CPG Chat"
    >
      <MessageCircle className="h-4 w-4" />
      CPG Chat
    </Link>
  );
}
