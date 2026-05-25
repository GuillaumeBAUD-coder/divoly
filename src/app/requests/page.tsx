"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  Bell,
  CheckCircle2,
  Clock3,
  Flame,
  MessageSquarePlus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { FollowRequestButton } from "@/components/FollowRequestButton";
import { RequestAnswerCard } from "@/components/RequestAnswerCard";

type AnswerRequest = {
  id: string;
  query: string;
  category: string | null;
  status: string;
  requestCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followers: number;
  };
};

type SortMode = "popular" | "newest";
type StatusMode = "open" | "answered" | "all";

export default function RequestsPage() {
  const [requests, setRequests] = useState<AnswerRequest[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<StatusMode>("open");
  const [sort, setSort] = useState<SortMode>("popular");

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/requests?status=all&limit=100", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!controller.signal.aborted) {
          setRequests(Array.isArray(data) ? data : []);
          setHasLoaded(true);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRequests([]);
          setHasLoaded(true);
        }
      });

    return () => controller.abort();
  }, []);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests
      .filter((request) => status === "all" || request.status === status)
      .filter((request) => category === "All" || request.category === category)
      .filter((request) => {
        if (!term) return true;
        return request.query.toLowerCase().includes(term) || request.category?.toLowerCase().includes(term);
      })
      .sort((a, b) => {
        if (sort === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        const demandDelta = getDemandCount(b) - getDemandCount(a);
        if (demandDelta !== 0) return demandDelta;

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [requests, search, category, status, sort]);

  const stats = useMemo(() => {
    const open = requests.filter((request) => request.status === "open");
    const totalDemand = requests.reduce((sum, request) => sum + getDemandCount(request), 0);
    const followers = requests.reduce((sum, request) => sum + (request._count?.followers ?? 0), 0);
    const hottest = [...requests].sort((a, b) => getDemandCount(b) - getDemandCount(a))[0];

    return { openCount: open.length, totalDemand, followers, hottest };
  }, [requests]);

  function handleSubmitted(
    request: Omit<AnswerRequest, "createdAt" | "updatedAt"> & Partial<Pick<AnswerRequest, "createdAt" | "updatedAt">>,
  ) {
    const submittedAt = new Date().toISOString();
    const normalizedRequest: AnswerRequest = {
      createdAt: request.createdAt ?? submittedAt,
      updatedAt: request.updatedAt ?? submittedAt,
      ...request,
    };

    setRequests((current) => {
      const existing = current.find((item) => item.id === normalizedRequest.id);
      if (!existing) return [normalizedRequest, ...current];

      return current.map((item) => (item.id === normalizedRequest.id ? { ...item, ...normalizedRequest } : item));
    });
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#07070f]">
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/">
          <DivolyWordmark height={32} />
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium text-white/50">
          <Link href="/explore" className="hidden transition-colors hover:text-white sm:inline">
            Explore
          </Link>
          <Link href="/contribute" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
            + Add Answer
          </Link>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="pointer-events-none absolute -left-48 top-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-[110px]" />
        <div className="pointer-events-none absolute -right-40 top-32 h-[34rem] w-[34rem] rounded-full bg-indigo-500/12 blur-[130px]" />

        <Link href="/" className="relative mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back
        </Link>

        <section className="relative mb-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.16),transparent_34rem),radial-gradient(circle_at_82%_8%,rgba(139,92,246,0.18),transparent_30rem)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                <Flame size={15} />
                Demand marketplace
              </div>
              <h1 className="max-w-4xl text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-white md:text-6xl">
                The place where missing answers become public demand.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/58 md:text-lg">
                Vote for the questions Divoly should answer next, follow updates, and turn high-demand gaps into useful public pages.
              </p>

              <div className="mt-7 flex flex-wrap gap-2 text-sm text-white/52">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                  “People want this answered” loop
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">Answer this request</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">Follow updates</span>
                <span className="rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1.5 text-amber-200">
                  Bounty soon
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MarketplaceStat icon={Target} label="Open requests" value={stats.openCount.toLocaleString()} />
              <MarketplaceStat icon={Users} label="People want answers" value={stats.totalDemand.toLocaleString()} />
              <MarketplaceStat icon={Bell} label="Update followers" value={stats.followers.toLocaleString()} />
              <MarketplaceStat
                icon={TrendingUp}
                label="Hottest demand"
                value={stats.hottest ? `${getDemandCount(stats.hottest).toLocaleString()}x` : "0x"}
              />
            </div>
          </div>
        </section>

        <div className="relative grid gap-8 lg:grid-cols-[1fr_420px]">
          <section>
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-400">Live demand board</p>
                <h2 className="text-3xl font-bold tracking-[-0.035em] text-white md:text-4xl">
                  Answer what people already asked for.
                </h2>
              </div>
              <Link
                href="/contribute"
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              >
                Contribute answer <ArrowRight size={15} />
              </Link>
            </div>

            <div className="glass mb-6 rounded-[1.6rem] p-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    className="search-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                    placeholder="Search requests..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <select
                  className="search-input rounded-xl px-4 py-3 text-sm lg:w-44"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="All">All categories</option>
                  {CATEGORIES.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="mr-2 flex items-center gap-2 text-xs text-white/35">
                  <SlidersHorizontal size={14} />
                  Filters
                </div>

                {(["open", "answered", "all"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatus(item)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                    style={{
                      background: status === item ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.05)",
                      color: status === item ? "#93c5fd" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    {item}
                  </button>
                ))}

                {(["popular", "newest"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setSort(item)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                    style={{
                      background: sort === item ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                      color: sort === item ? "white" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {!hasLoaded ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="glass rounded-[1.6rem] p-5">
                    <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-white/5" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
                  </div>
                ))}
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="glass rounded-[1.6rem] p-10 text-center">
                <MessageSquarePlus size={28} className="mx-auto mb-4 text-white/25" />
                <p className="text-white/60">No requests match these filters yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <RequestRow key={request.id} request={request} />
                ))}
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-4 rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles size={16} className="text-cyan-300" />
                How the marketplace works
              </div>
              <div className="space-y-3">
                <FlowStep label="1" title="Demand appears" description="A missing search becomes a public request." />
                <FlowStep label="2" title="People join" description="Duplicates and follows raise the demand score." />
                <FlowStep label="3" title="Someone answers" description="Contributors pick high-signal questions first." />
              </div>
            </div>

            <RequestAnswerCard
              title="Create new demand"
              description="Add a missing question. If it already exists, Divoly merges it and increases the demand score."
              onSubmitted={handleSubmitted}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

function getDemandCount(request: AnswerRequest) {
  return request.requestCount + (request._count?.followers ?? 0);
}

function getMomentumLabel(request: AnswerRequest) {
  const daysSinceUpdate = Math.max(1, Math.round((Date.now() - new Date(request.updatedAt).getTime()) / 86_400_000));
  const velocity = getDemandCount(request) / daysSinceUpdate;

  if (velocity >= 10) return "Exploding";
  if (velocity >= 3) return "Hot";
  if (velocity >= 1) return "Rising";
  return "Steady";
}

function MarketplaceStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5 shadow-inner shadow-white/[0.03]">
      <Icon size={18} className="text-cyan-300" />
      <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-white/35">{label}</p>
    </div>
  );
}

function FlowStep({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
      <div className="flex gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-xs font-bold text-cyan-200">
          {label}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/45">{description}</p>
        </div>
      </div>
    </div>
  );
}

function RequestRow({ request }: { request: AnswerRequest }) {
  const isAnswered = request.status === "answered";
  const demandCount = getDemandCount(request);
  const followerCount = request._count?.followers ?? 0;
  const momentum = getMomentumLabel(request);

  return (
    <div className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.065] hover:shadow-2xl hover:shadow-cyan-950/20">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300 via-blue-400 to-indigo-500 opacity-70" />
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {request.category ? (
              <span className="badge border border-white/10 bg-white/5 text-zinc-300">{request.category}</span>
            ) : null}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isAnswered ? "bg-emerald-400/10 text-emerald-300" : "bg-blue-400/10 text-cyan-300"
              }`}
            >
              {isAnswered ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
              {isAnswered ? "Answered" : "Open"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-400/10 px-3 py-1 text-xs font-semibold text-orange-200">
              <Zap size={12} />
              {momentum}
            </span>
          </div>

          <h2 className="text-lg font-semibold leading-relaxed text-white md:text-xl">{request.query}</h2>

          <div className="mt-4 grid gap-2 text-xs text-white/45 sm:grid-cols-3">
            <MetricPill icon={Users} value={`${demandCount.toLocaleString()} people want this answered`} />
            <MetricPill icon={Bell} value={`${followerCount.toLocaleString()} following updates`} />
            <MetricPill icon={BadgeDollarSign} value="Bounty soon" />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
          <FollowRequestButton requestId={request.id} />
          <Link
            href={`/contribute?request=${encodeURIComponent(request.query)}`}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Answer this request <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricPill({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-3 py-2">
      <Icon size={13} className="text-cyan-300" />
      {value}
    </span>
  );
}
