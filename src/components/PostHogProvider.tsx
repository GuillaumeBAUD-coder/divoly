"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",

    // Track all visitors (anonymous + identified) so we get full funnel data
    person_profiles: "always",

    // Page views handled manually in PageViewTracker for accurate SPA routing
    capture_pageview: false,
    capture_pageleave: true,

    // Session recording — replay user journeys to spot UX friction
    session_recording: {
      maskAllInputs: true,           // hide passwords / sensitive fields
      maskInputOptions: { password: true },
    },

    // Autocapture clicks, inputs, form submits with CSS selectors
    autocapture: {
      dom_event_allowlist: ["click", "submit"],
      url_allowlist: [".*"],
      // Ignore purely decorative elements to reduce noise
      element_allowlist: ["a", "button", "input", "select", "textarea", "form", "label"],
    },

    // Persist experiments & feature flags across pages
    persistence: "localStorage+cookie",

    // Capture performance / web vitals automatically
    capture_performance: true,

    // Bootstrap faster by not blocking render
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") ph.opt_out_capturing();
    },
  });
}

function PostHogAuthSync() {
  const { data: session } = useSession();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph) return;
    if (session?.user?.id) {
      ph.identify(session.user.id, {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
        // Extra person properties useful for segmentation
        has_account: true,
      });
    } else {
      // Anonymous visitor — keep distinct_id but clear person data
      ph.reset(/* resetDeviceId= */ false);
    }
  }, [session, ph]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return <>{children}</>;
  return (
    <PHProvider client={posthog}>
      <PostHogAuthSync />
      {children}
    </PHProvider>
  );
}
