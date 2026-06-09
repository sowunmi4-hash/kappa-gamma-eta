"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track portal/login/pledge/api pages
    if (["/portal", "/login", "/pledge"].some(p => pathname.startsWith(p))) return;
    // Don't track logged-in members (they have a session cookie)
    if (document.cookie.includes("kge_session")) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
