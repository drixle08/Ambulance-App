"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The SOP Assistant has been merged into the unified Clinical Assistant at /tools/cpg-chat
export default function SopChatRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/tools/cpg-chat");
  }, [router]);
  return null;
}
