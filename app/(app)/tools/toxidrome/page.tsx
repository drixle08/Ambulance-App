"use client";

import Link from "next/link";
import { ToolHeader } from "@/app/_components/ToolHeader";
import { ArrowLeft, GitBranch } from "lucide-react";
import { FlowGuide } from "./FlowGuide";

export default function ToxidromePage() {
  return (
    <div className="min-h-screen bg-slate-950 pb-28 text-slate-100">
      <ToolHeader
        title="Toxidrome Flow Guide"
        meta="Toxicology & Toxinology"
        showBack
        rightContent={
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-500">
            <GitBranch className="h-4 w-4" />
          </div>
        }
      />

      <main className="mx-auto max-w-2xl px-4 pt-4">
        <FlowGuide />
      </main>
    </div>
  );
}
