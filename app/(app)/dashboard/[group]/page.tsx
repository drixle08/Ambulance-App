import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TOOL_GROUPS } from "../data";

function classNames(...classes: Array<string | boolean | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type GroupPageProps = {
  params: {
    group: string;
  };
};

export default function GroupPage({ params }: GroupPageProps) {
  const group = TOOL_GROUPS.find((g) => g.slug === params.group);

  if (!group) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-4">
      {/* Back to dashboard */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-slate-900/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All categories
        </Link>
        <Link
          href="/?allowLanding=1"
          className="hidden items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-slate-900/80 md:inline-flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Landing
        </Link>
      </div>

      <header className="space-y-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-500">
          {group.slug.replace("-", " ")}
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {group.title}
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {group.description}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {group.tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={classNames(
              "group flex flex-col justify-between rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition-colors",
              "border-slate-200 bg-slate-50 hover:border-emerald-500/80 hover:bg-white",
              "dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-emerald-500/70 dark:hover:bg-slate-900"
            )}
          >
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {tool.tagline}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[0.7rem] font-medium text-emerald-700 dark:text-emerald-300">
                {"Open tool ->"}
              </span>
              {tool.meta && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {tool.meta}
                </span>
              )}
              {tool.href.endsWith(".pdf") && (
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
