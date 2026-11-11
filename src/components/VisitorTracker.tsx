"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Do not track admin portal or internal api routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    // Prevent duplicate logging for the same path in a single render session
    if (lastTrackedRef.current === pathname) {
      return;
    }
    lastTrackedRef.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });

    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Fail silently to never disrupt the user's browsing
    }
  }, [pathname]);

  return null;
}
