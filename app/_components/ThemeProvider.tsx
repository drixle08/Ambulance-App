"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// Tool screens are designed dark-only (hard-coded dark surfaces and light
// text), so light mode left several of them at ~1:1 contrast. Force dark on
// /tools/*; the user's chosen theme still applies everywhere else.
const DARK_ONLY_PREFIX = "/tools";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const forcedTheme = pathname?.startsWith(DARK_ONLY_PREFIX) ? "dark" : undefined;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange
      forcedTheme={forcedTheme}
    >
      {children}
    </NextThemesProvider>
  );
}
