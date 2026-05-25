"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bookmark } from "lucide-react";

type SaveAnswerButtonProps = {
  answerId: string;
  compact?: boolean;
};

export function SaveAnswerButton({ answerId, compact = false }: SaveAnswerButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [saved, setSaved] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      return;
    }

    const controller = new AbortController();
    void fetch(`/api/answers/${answerId}/save`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { saved: false }))
      .then((data) => {
        if (!controller.signal.aborted) {
          setSaved(Boolean(data.saved));
          setHasLoaded(true);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasLoaded(true);
      });

    return () => controller.abort();
  }, [answerId, session?.user?.id, status]);

  const visiblySaved = Boolean(session?.user?.id && saved);
  const isReady = status !== "loading" && (!session?.user?.id || hasLoaded);

  function toggleSave() {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    startTransition(() => {
      void fetch(`/api/answers/${answerId}/save`, { method: "POST" })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setSaved(Boolean(data.saved)))
        .catch(() => {});
    });
  }

  return (
    <button
      type="button"
      onClick={toggleSave}
      disabled={!isReady || isPending}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all disabled:opacity-50 ${
        visiblySaved
          ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-200"
          : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/20 hover:text-white"
      }`}
      aria-pressed={visiblySaved}
    >
      <Bookmark size={compact ? 13 : 14} fill={visiblySaved ? "currentColor" : "none"} />
      {visiblySaved ? "Saved" : "Save"}
    </button>
  );
}
