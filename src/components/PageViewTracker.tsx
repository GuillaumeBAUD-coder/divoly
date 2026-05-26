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

    // Build enriched page properties for better segmentation in PostHog
    const properties: Record<string, unknown> = {
      $current_url: window.location.href,
      path: pathname,
    };

    // Tag which section of the site was viewed — enables easy funnel analysis
    if (pathname === "/") {
      properties.page_section = "homepage";
    } else if (pathname.startsWith("/explore")) {
      properties.page_section = "explore";
      const q = searchParams.get("q");
      const cat = searchParams.get("category");
      const model = searchParams.get("model");
      if (q) properties.search_query = q;
      if (cat) properties.filter_category = cat;
      if (model) properties.filter_model = model;
    } else if (pathname.startsWith("/answers/")) {
      properties.page_section = "answer_detail";
      properties.answer_slug = pathname.split("/").at(-1);
    } else if (pathname.startsWith("/categories/")) {
      properties.page_section = "category";
      properties.category_slug = pathname.split("/").at(-1);
    } else if (pathname.startsWith("/models/")) {
      properties.page_section = "model";
      properties.model_slug = pathname.split("/").at(-1);
    } else if (pathname.startsWith("/contributors/")) {
      properties.page_section = "contributor";
      properties.contributor_slug = pathname.split("/").at(-1);
    } else if (pathname.startsWith("/contribute")) {
      properties.page_section = "contribute";
    } else if (pathname.startsWith("/saved")) {
      properties.page_section = "saved";
    } else if (pathname.startsWith("/collections")) {
      properties.page_section = "collections";
    } else if (pathname.startsWith("/compare")) {
      properties.page_section = "compare";
    } else if (pathname.startsWith("/requests")) {
      properties.page_section = "requests";
    } else if (pathname.startsWith("/about") || pathname.startsWith("/privacy") || pathname.startsWith("/legal")) {
      properties.page_section = "static";
    }

    ph.capture("$pageview", properties);
  // Re-run on pathname change; searchParams is intentionally read inside without being a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, ph]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
