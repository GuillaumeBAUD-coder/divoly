"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

type ShareButtonProps = {
  title: string;
  text?: string;
  url: string;
  label?: string;
  compact?: boolean;
  className?: string;
};

export function ShareButton({ title, text, url, label = "Share", compact = false, className = "" }: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const { track } = useAnalytics();

  async function handleShare() {
    const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    const method = typeof navigator.share === "function" ? "native_share" : "clipboard";

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: absoluteUrl });
      } else {
        await navigator.clipboard.writeText(absoluteUrl);
      }
      setShared(true);
      track("answer_shared", { url: absoluteUrl, method });
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // Users can cancel native share sheets; no UI error is needed.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.055] font-semibold text-white/55 transition-colors hover:border-orange-300/25 hover:bg-orange-300/10 hover:text-orange-100 ${compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"} ${className}`}
    >
      {shared ? <Check size={compact ? 12 : 14} className="text-orange-200" /> : <Share2 size={compact ? 12 : 14} />}
      {shared ? "Copied" : label}
    </button>
  );
}
