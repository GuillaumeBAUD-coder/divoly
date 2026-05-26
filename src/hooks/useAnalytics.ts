"use client";

import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

/**
 * Thin wrapper around PostHog that provides typed event helpers.
 * Import this wherever you need to fire an analytics event.
 *
 * Usage:
 *   const { track } = useAnalytics();
 *   track("answer_saved", { answer_id: "abc", model: "GPT-4o" });
 */
export function useAnalytics() {
  const ph = usePostHog();

  const track = useCallback(
    (event: AnalyticsEvent, properties?: Record<string, unknown>) => {
      ph?.capture(event, properties);
    },
    [ph],
  );

  return { track, ph };
}

// ─── Event catalogue ──────────────────────────────────────────────────────────
// Keeping every event name in one place makes it easy to search PostHog and
// prevents typos in different files.

export type AnalyticsEvent =
  // ── Search & Explore ──────────────────────────────────────────────────────
  | "search_performed"          // user types in the search box (debounced)
  | "filter_category_changed"   // user picks a category chip
  | "filter_model_changed"      // user picks a model chip
  | "filter_sort_changed"       // user changes sort order
  | "answer_card_clicked"       // user clicks an answer card in the list

  // ── Answer page ───────────────────────────────────────────────────────────
  | "answer_viewed"             // answer detail page loaded (with metadata)
  | "answer_saved"              // user saves an answer
  | "answer_unsaved"            // user removes a saved answer
  | "answer_shared"             // user hits Share (clipboard or native share)
  | "answer_added_to_collection"// user adds to a collection

  // ── Contribute ────────────────────────────────────────────────────────────
  | "contribute_started"        // user lands on /contribute
  | "contribute_step1_completed"// prompt + answer filled, moves to step 2
  | "contribute_step2_completed"// model + category chosen, submits
  | "contribute_submitted"      // API call succeeded
  | "contribute_error"          // API call failed (with error message)

  // ── Auth ──────────────────────────────────────────────────────────────────
  | "login_cta_clicked"         // any "Sign in" link/button clicked
  | "signup_cta_clicked"        // any "Register" link/button clicked
  | "login_success"             // OAuth callback succeeded
  | "logout"                    // user signs out

  // ── Homepage ──────────────────────────────────────────────────────────────
  | "hero_cta_clicked"          // "Get started free" / primary CTA on homepage
  | "explore_cta_clicked"       // "Explore answers" button

  // ── Collections ───────────────────────────────────────────────────────────
  | "collection_created"
  | "collection_viewed"

  // ── SEO / discovery ───────────────────────────────────────────────────────
  | "related_answer_clicked"    // clicked a related answer at the bottom
  | "category_link_clicked"     // clicked a category badge
  | "model_link_clicked";       // clicked a model badge
