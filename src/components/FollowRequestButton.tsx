"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, BellOff } from "lucide-react";

type FollowRequestButtonProps = {
  requestId: string;
};

export function FollowRequestButton({ requestId }: FollowRequestButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [followed, setFollowed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) return;

    const controller = new AbortController();
    void fetch(`/api/requests/${requestId}/follow`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { followed: false }))
      .then((data) => {
        if (!controller.signal.aborted) {
          setFollowed(Boolean(data.followed));
          setHasLoaded(true);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasLoaded(true);
      });

    return () => controller.abort();
  }, [requestId, session?.user?.id, status]);

  const isReady = status !== "loading" && (!session?.user?.id || hasLoaded);

  function toggleFollow() {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    startTransition(() => {
      void fetch(`/api/requests/${requestId}/follow`, { method: "POST" })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setFollowed(Boolean(data.followed)))
        .catch(() => {});
    });
  }

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={!isReady || isPending}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        followed
          ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-200"
          : "border-white/10 bg-white/[0.04] text-white/45 hover:border-white/20 hover:text-white"
      }`}
      aria-pressed={followed}
    >
      {followed ? <BellOff size={14} /> : <Bell size={14} />}
      {followed ? "Following" : "Follow"}
    </button>
  );
}
