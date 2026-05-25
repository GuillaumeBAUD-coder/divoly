import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, BarChart3, Bookmark, FileText, FolderOpen, MessageSquarePlus, Search, Sparkles, Star, Users } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Product analytics | Divoly",
  description: "Private product analytics and growth signals for Divoly.",
  robots: { index: false, follow: false },
};

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return promise.catch(() => fallback);
}

async function countRecentAnswers() {
  const rows = await safe(prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int AS count FROM "Answer" WHERE "createdAt" >= NOW() - INTERVAL '7 days'`, [{ count: 0 }]);
  return Number(rows[0]?.count ?? 0);
}

async function countRecentRequests() {
  const rows = await safe(prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int AS count FROM "AnswerRequest" WHERE "createdAt" >= NOW() - INTERVAL '7 days'`, [{ count: 0 }]);
  return Number(rows[0]?.count ?? 0);
}

async function countRecentSaves() {
  const rows = await safe(prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int AS count FROM "SavedAnswer" WHERE "createdAt" >= NOW() - INTERVAL '7 days'`, [{ count: 0 }]);
  return Number(rows[0]?.count ?? 0);
}

async function countRecentSearches() {
  const rows = await safe(prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int AS count FROM "SearchHistory" WHERE "updatedAt" >= NOW() - INTERVAL '7 days'`, [{ count: 0 }]);
  return Number(rows[0]?.count ?? 0);
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [
    userCount,
    answerCount,
    requestCount,
    openRequestCount,
    savedCount,
    collectionCount,
    followedRequestCount,
    searchCount,
    activeSearchUsers,
    answersThisWeek,
    requestsThisWeek,
    savesThisWeek,
    searchesThisWeek,
    topAnswers,
    topRequests,
    recentSearches,
    zeroResultSearches,
    categoryStats,
    modelStats,
  ] = await Promise.all([
    safe(prisma.user.count(), 0),
    safe(prisma.answer.count(), 0),
    safe(prisma.answerRequest.count(), 0),
    safe(prisma.answerRequest.count({ where: { status: "open" } }), 0),
    safe(prisma.savedAnswer.count(), 0),
    safe(prisma.answerCollection.count(), 0),
    safe(prisma.followedRequest.count(), 0),
    safe(prisma.searchHistory.count(), 0),
    safe(prisma.searchHistory.findMany({ distinct: ["userId"], select: { userId: true } }), []),
    countRecentAnswers(),
    countRecentRequests(),
    countRecentSaves(),
    countRecentSearches(),
    safe(prisma.answer.findMany({ orderBy: [{ upvotes: "desc" }, { views: "desc" }], take: 8 }), []),
    safe(prisma.answerRequest.findMany({ where: { status: "open" }, orderBy: [{ requestCount: "desc" }, { updatedAt: "desc" }], take: 8 }), []),
    safe(prisma.searchHistory.findMany({ orderBy: { updatedAt: "desc" }, take: 10 }), []),
    safe(prisma.searchHistory.findMany({ where: { resultCount: 0 }, orderBy: { updatedAt: "desc" }, take: 8 }), []),
    safe(prisma.answer.groupBy({ by: ["category"], _count: { _all: true }, _sum: { upvotes: true, views: true } }), []),
    safe(prisma.answer.groupBy({ by: ["model"], _count: { _all: true }, _sum: { upvotes: true, views: true } }), []),
  ]);

  const sortedCategoryStats = [...categoryStats].sort((a, b) => b._count._all - a._count._all);
  const sortedModelStats = [...modelStats].sort((a, b) => b._count._all - a._count._all);
  const requestCoverage = requestCount > 0 ? Math.round(((requestCount - openRequestCount) / requestCount) * 100) : 0;

  return (
    <div className="explore-bg min-h-screen">
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <div className="flex items-center gap-2">
          <Link href="/account" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">Account</Link>
          <Link href="/explore" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">Explore</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <Link href="/account" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to account
        </Link>

        <section className="filter-studio mb-8 rounded-[30px] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Product analytics</p>
              <h1 className="text-4xl font-bold tracking-[-0.04em] text-white md:text-6xl">Divoly signal room</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                Internal product signals from the database: content supply, demand, searches, saves, and the gaps that should guide what to build or seed next.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-5 py-4">
              <BarChart3 size={18} className="mb-2 text-cyan-300" />
              <p className="text-sm font-semibold text-white">Private dashboard</p>
              <p className="mt-1 text-xs text-white/35">Noindex, login required</p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={<Users size={18} />} label="Users" value={userCount} />
          <MetricCard icon={<FileText size={18} />} label="Answers" value={answerCount} />
          <MetricCard icon={<Search size={18} />} label="Searches" value={searchCount} />
          <MetricCard icon={<MessageSquarePlus size={18} />} label="Requests" value={requestCount} />
          <MetricCard icon={<Bookmark size={18} />} label="Saved answers" value={savedCount} />
          <MetricCard icon={<FolderOpen size={18} />} label="Collections" value={collectionCount} />
          <MetricCard icon={<Sparkles size={18} />} label="Active search users" value={activeSearchUsers.length} />
          <MetricCard icon={<MessageSquarePlus size={18} />} label="Followed requests" value={followedRequestCount} />
          <MetricCard icon={<Star size={18} />} label="Request coverage" value={`${requestCoverage}%`} />
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-4">
          <MomentumCard label="New answers" value={answersThisWeek} />
          <MomentumCard label="New requests" value={requestsThisWeek} />
          <MomentumCard label="New saves" value={savesThisWeek} />
          <MomentumCard label="Search activity" value={searchesThisWeek} />
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Content quality</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Top answers</h2>
              </div>
              <Link href="/explore" className="text-sm text-white/40 hover:text-white">Explore</Link>
            </div>
            <div className="space-y-4">
              {topAnswers.map((answer) => <SeoAnswerCard key={answer.id} answer={answer} />)}
            </div>
          </section>

          <aside className="space-y-8">
            <SignalPanel title="Open demand" eyebrow="Requests to answer">
              {topRequests.length > 0 ? (
                topRequests.map((request) => (
                  <div key={request.id} className="answer-row-card rounded-2xl p-4" style={{ "--answer-accent": "#22d3ee" } as CSSProperties}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="badge border border-white/10 bg-white/5 text-zinc-400">{request.category ?? "General"}</span>
                      <span className="badge bg-cyan-300/10 text-cyan-200">{request.requestCount} requests</span>
                    </div>
                    <h3 className="text-sm font-semibold leading-relaxed text-white">{request.query}</h3>
                  </div>
                ))
              ) : (
                <EmptyState text="No open requests yet." />
              )}
            </SignalPanel>

            <SignalPanel title="Search gaps" eyebrow="Zero-result searches">
              {zeroResultSearches.length > 0 ? (
                zeroResultSearches.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-red-300/10 bg-red-300/[0.045] p-4">
                    <h3 className="text-sm font-semibold leading-relaxed text-white">{item.query}</h3>
                    <p className="mt-2 text-xs text-white/35">{new Date(item.updatedAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <EmptyState text="No zero-result searches captured yet." />
              )}
            </SignalPanel>
          </aside>
        </div>

        <section className="mt-10 grid gap-8 xl:grid-cols-2">
          <SignalPanel title="Category coverage" eyebrow="Supply map">
            <BarList items={sortedCategoryStats.map((item) => ({ label: item.category, value: item._count._all, meta: `${(item._sum.views ?? 0).toLocaleString()} views` }))} />
          </SignalPanel>

          <SignalPanel title="Model coverage" eyebrow="Supply map">
            <BarList items={sortedModelStats.slice(0, 12).map((item) => ({ label: item.model, value: item._count._all, meta: `${(item._sum.upvotes ?? 0).toLocaleString()} votes` }))} />
          </SignalPanel>
        </section>

        <section className="mt-10">
          <SignalPanel title="Recent searches" eyebrow="Intent stream">
            {recentSearches.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {recentSearches.map((item) => (
                  <Link key={item.id} href={`/explore?q=${encodeURIComponent(item.query)}`} className="answer-row-card rounded-2xl p-4">
                    <h3 className="text-sm font-semibold leading-relaxed text-white">{item.query}</h3>
                    <p className="mt-2 text-xs text-white/35">{item.resultCount} results · {new Date(item.updatedAt).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState text="No searches captured yet." />
            )}
          </SignalPanel>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="mb-3 text-cyan-300">{icon}</div>
      <p className="text-3xl font-bold text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-1 text-xs text-white/35">{label}</p>
    </div>
  );
}

function MomentumCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="filter-studio rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/40">Last 7 days</p>
      <p className="mt-3 text-3xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-white/42">{label}</p>
    </div>
  );
}

function SignalPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="filter-studio rounded-[26px] p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function BarList({ items }: { items: Array<{ label: string; value: number; meta: string }> }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-white">{item.label}</span>
            <span className="text-white/35">{item.value.toLocaleString()} · {item.meta}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-cyan-300/70" style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm text-white/40">{text}</p>;
}
