"use client";

import { usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function Tracker() {
  const ph = usePostHog();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ph) return;
    ph.capture("$pageview", { $current_url: window.location.href });
  }, [pathname, searchParams, ph]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
