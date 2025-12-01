"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until we're on the client to read theme/resolvedTheme
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) {
    // Render nothing on the server / first paint to avoid hydration mismatch
    return null;
  }

  const currentTheme = (theme === "system" ? resolvedTheme : theme) || "dark";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="inline-flex items-center justify-center rounded-lg border border-slate-300/70 bg-slate-100/70 px-2 py-2 text-slate-700 shadow-sm hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-emerald-400 transition"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
