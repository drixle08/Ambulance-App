"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type NavigatorStandalone = Navigator & {
  standalone?: boolean; // iOS Safari-only property
};

export function StandaloneRedirect() {
  const router = useRouter();

  useEffect(() => {
  if (typeof window === "undefined") return;

  const nav = window.navigator as NavigatorStandalone;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true; // iOS Safari quirk

  if (isStandalone) {
    router.replace("/dashboard");
  }
}, [router]);


  return null;
}
