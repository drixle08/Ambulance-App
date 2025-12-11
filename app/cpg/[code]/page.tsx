export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CpgViewerClient } from "./CpgViewerClient";
import {
  CPG_ENTRIES,
  findCpgEntryBySlug,
  normalizeCpgSlug,
} from "@/lib/cpgIndex";

type CpgPageProps = {
  params?: { code?: string };
  searchParams?: { page?: string; code?: string; pdfPage?: string };
};

export default function CpgPage({
  params = { code: "" },
  searchParams = {},
}: CpgPageProps) {
  if (!params || typeof params.code !== "string") {
    return notFound();
  }

  const slug = params.code;
  const fallbackCode = searchParams.code || "";

  const normalizedSlug = normalizeCpgSlug(slug);
  const normalizedFallback = normalizeCpgSlug(fallbackCode);

  const resolvedEntry =
    findCpgEntryBySlug(slug) ||
    (fallbackCode && findCpgEntryBySlug(fallbackCode)) ||
    CPG_ENTRIES.find((item) => {
      const normalizedCode = normalizeCpgSlug(item.code);
      return (
        normalizedCode === normalizedSlug || normalizedCode === normalizedFallback
      );
    }) ||
    null;

  const printedPage =
    Number(searchParams.page) || Number(resolvedEntry?.printedPage) || 1;
  const pdfPage = Number(searchParams.pdfPage) || undefined;

  const entry =
    resolvedEntry ||
    ({
      code: fallbackCode || slug,
      title: fallbackCode || slug,
      section: "CPG PDF",
      printedPage,
      keywords: [],
    } as const);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-12 pt-6">
      <div className="flex flex-wrap items-start gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-slate-900/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <div className="space-y-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-emerald-500">
            CPG viewer
          </p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {entry.code} – {entry.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Section: {entry.section} · Starting at printed page {printedPage}
          </p>
        </div>
      </div>

      <CpgViewerClient entry={entry} printedPage={printedPage} pdfPage={pdfPage} />
    </div>
  );
}
