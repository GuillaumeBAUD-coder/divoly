import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Award, BarChart3, Bell, Bookmark, Clock3, Eye, FileText, FolderOpen, MessageSquarePlus, Search, Sparkles, Star, Trophy } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { authOptions } from "@/lib/auth";
import type { ContributorRank } from "@/lib/contributors";
import { getContributorLeaderboard, getContributorProfile } from "@/lib/contributors";
import { prisma } from "@/lib/db";
import { contributorSlug } from "@/lib/slugs";

export const metadata: Metadata = {
  title: "Account | Divoly",
  description: "Manage your saved answers, contributions, and requests on Divoly.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const [
    user,
    saved,
    contributions,
    requests,
    collections,
    followedRequests,
    recentSearches,
    contributionStats,
    savedCount,
    requestCount,
    collectionCount,
    followedCount,
    searchCount,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.savedAnswer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { answer: true },
    }),
    prisma.answer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.answerRequest.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.answerCollection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { _count: { select: { items: true } } },
    }),
    prisma.followedRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { request: true },
    }),
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.answer.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: { upvotes: true, views: true },
    }),
    prisma.savedAnswer.count({ where: { userId } }),
    prisma.answerRequest.count({ where: { userId } }),
    prisma.answerCollection.count({ where: { userId } }),
    prisma.followedRequest.count({ where: { userId } }),
    prisma.searchHistory.count({ where: { userId } }),
  ]).catch(() => [
    null,
    [],
    [],
    [],
    [],
    [],
    [],
    { _count: { id: 0 }, _sum: { upvotes: 0, views: 0 } },
    0,
    0,
    0,
    0,
    0,
  ] as const);

  const displayName = user?.name ?? session.user.name ?? "Divoly user";
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently";
  const helpfulVotes = contributionStats._sum.upvotes ?? 0;
  const totalViews = contributionStats._sum.views ?? 0;
  const contributorProfile = await getContributorProfile(userId).catch(() => null);
  const weeklyCategoryRank = contributorProfile
    ? await getContributorLeaderboard({ period: "week", category: contributorProfile.topCategory, limit: 100 })
        .then((contributors) => contributors.find((contributor) => contributor.userId === userId)?.rank ?? null)
        .catch(() => null)
    : null;
  const answeredFollowedRequests = followedRequests.filter((item) => item.request.status === "answered");

  return (
    <div className="explore-bg min-h-screen">
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <div className="flex items-center gap-2">
          <Link href="/saved" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">Saved</Link>
          <Link href="/explore" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">Explore</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back home
        </Link>

        <section className="filter-studio mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Account dashboard</p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">{displayName}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                Your Divoly workspace: saved answers, contributions, requests, and the early signals that make your account useful over time.
              </p>
              <p className="mt-3 text-xs text-white/32">Joined {joinedDate}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-5 py-4">
              <Sparkles size={18} className="mb-2 text-cyan-300" />
              <p className="text-sm font-semibold text-white">{user?.email ?? session.user.email}</p>
              <p className="mt-1 text-xs text-white/35">Private account area</p>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Bookmark size={18} />} label="Saved answers" value={savedCount} />
          <StatCard icon={<FolderOpen size={18} />} label="Collections" value={collectionCount} />
          <StatCard icon={<Bell size={18} />} label="Followed requests" value={followedCount} />
          <StatCard icon={<Search size={18} />} label="Searches" value={searchCount} />
          <StatCard icon={<FileText size={18} />} label="Contributions" value={contributionStats._count.id} />
          <StatCard icon={<Star size={18} />} label="Helpful votes" value={helpfulVotes} />
          <StatCard icon={<Eye size={18} />} label="Answer views" value={totalViews} />
          <StatCard icon={<MessageSquarePlus size={18} />} label="Requests" value={requestCount} />
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          <QuickLink
            href="/contributors"
            icon={<Trophy size={18} />}
            label="Leaderboard"
            title="Contributor league"
            description="See reputation, badges, streaks, weekly leaders, and category specialists."
          />
          <QuickLink
            href="/analytics"
            icon={<BarChart3 size={18} />}
            label="Analytics"
            title="Product signals"
            description="See what people search, save, request, and reuse across Divoly."
          />
          <QuickLink
            href="/collections"
            icon={<FolderOpen size={18} />}
            label="Collections"
            title="Organize answers"
            description="Build private folders around projects, school, work, or recurring questions."
          />
          <QuickLink
            href="/history"
            icon={<Clock3 size={18} />}
            label="History"
            title="Resume searches"
            description="Return to recent searches and keep useful discovery loops alive."
          />
        </section>

        <NotificationCenter
          contributorProfile={contributorProfile}
          weeklyCategoryRank={weeklyCategoryRank}
          answeredFollowedRequests={answeredFollowedRequests}
        />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Personal library</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Recent saved answers</h2>
              </div>
              <Link href="/saved" className="text-sm text-white/40 hover:text-white">View all</Link>
            </div>
            {saved.length > 0 ? (
              <div className="space-y-4">
                {saved.map((item) => <SeoAnswerCard key={item.id} answer={item.answer} />)}
              </div>
            ) : (
              <EmptyPanel title="No saved answers yet" description="Save answers from detail pages to build your personal AI answer library." href="/explore" cta="Find answers" />
            )}
          </section>

          <aside className="space-y-8">
            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Folders</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Collections</h2>
              </div>
              {collections.length > 0 ? (
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <Link key={collection.id} href={`/collections/${collection.id}`} className="answer-row-card block rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-white">{collection.name}</h3>
                        <span className="text-xs text-cyan-200">{collection._count.items}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyPanel title="No collections yet" description="Create folders for answers you want to reuse together." href="/collections" cta="Create collection" />
              )}
            </section>

            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Your output</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Contributions</h2>
              </div>
              {contributions.length > 0 ? (
                <div className="space-y-3">
                  {contributions.map((answer) => <SeoAnswerCard key={answer.id} answer={answer} />)}
                </div>
              ) : (
                <EmptyPanel title="No contributions yet" description="Add useful AI answers so other people can find them." href="/contribute" cta="Add answer" />
              )}
            </section>

            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Demand signals</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Your requests</h2>
              </div>
              {requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="answer-row-card rounded-2xl p-4" style={{ "--answer-accent": "#22d3ee" } as CSSProperties}>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="badge border border-white/10 bg-white/5 text-zinc-400">{request.category ?? "General"}</span>
                        <span className={`badge ${request.status === "answered" ? "text-emerald-300" : "text-cyan-300"}`}>
                          {request.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold leading-relaxed text-white">{request.query}</h3>
                      <p className="mt-2 text-xs text-white/35">{request.requestCount} request{request.requestCount > 1 ? "s" : ""}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyPanel title="No requests yet" description="Request missing answers when Divoly does not have what you need." href="/requests" cta="Request answer" />
              )}
            </section>

            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Following</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Tracked requests</h2>
              </div>
              {followedRequests.length > 0 ? (
                <div className="space-y-3">
                  {followedRequests.map((item) => (
                    <div key={item.id} className="answer-row-card rounded-2xl p-4" style={{ "--answer-accent": "#22d3ee" } as CSSProperties}>
                      <span className={`badge ${item.request.status === "answered" ? "text-emerald-300" : "text-cyan-300"}`}>
                        {item.request.status}
                      </span>
                      <h3 className="mt-2 text-sm font-semibold leading-relaxed text-white">{item.request.query}</h3>
                      <p className="mt-2 text-xs text-white/35">{item.request.requestCount} request{item.request.requestCount > 1 ? "s" : ""}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyPanel title="No followed requests" description="Follow open requests to keep track of demand signals." href="/requests" cta="Browse requests" />
              )}
            </section>

            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Recent intent</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Search history</h2>
              </div>
              {recentSearches.length > 0 ? (
                <div className="space-y-3">
                  {recentSearches.map((item) => (
                    <Link key={item.id} href={`/explore?q=${encodeURIComponent(item.query)}`} className="answer-row-card block rounded-2xl p-4">
                      <h3 className="text-sm font-semibold leading-relaxed text-white">{item.query}</h3>
                      <p className="mt-2 text-xs text-white/35">{item.resultCount} result{item.resultCount === 1 ? "" : "s"}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyPanel title="No search history" description="Search while logged in to build a useful private history." href="/explore" cta="Search answers" />
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="mb-3 text-cyan-300">{icon}</div>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-white/35">{label}</p>
    </div>
  );
}

function QuickLink({ href, icon, label, title, description }: { href: string; icon: ReactNode; label: string; title: string; description: string }) {
  return (
    <Link href={href} className="answer-row-card block rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-cyan-300">{icon}</div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">{label}</span>
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/42">{description}</p>
    </Link>
  );
}

function NotificationCenter({
  contributorProfile,
  weeklyCategoryRank,
  answeredFollowedRequests,
}: {
  contributorProfile: ContributorRank | null;
  weeklyCategoryRank: number | null;
  answeredFollowedRequests: Array<{ id: string; request: { id: string; query: string; category: string | null; status: string; requestCount: number } }>;
}) {
  const notifications: Array<{ title: string; description: string; href: string; icon: ReactNode; tone: string }> = [];

  if (answeredFollowedRequests.length > 0) {
    const first = answeredFollowedRequests[0].request;
    notifications.push({
      title: "Request answered",
      description: `${first.query}${answeredFollowedRequests.length > 1 ? ` and ${answeredFollowedRequests.length - 1} more followed request${answeredFollowedRequests.length > 2 ? "s" : ""} were answered.` : " was answered."}`,
      href: "/requests?status=answered",
      icon: <Bell size={18} />,
      tone: "text-emerald-200",
    });
  }

  if (contributorProfile?.badges.length) {
    const badge = contributorProfile.badges[0];
    notifications.push({
      title: "Badge earned",
      description: `You currently hold the “${badge.label}” badge. Share it from your contributor profile.`,
      href: `/contributors/${contributorSlug(contributorProfile.name)}`,
      icon: <Award size={18} />,
      tone: "text-orange-200",
    });
  }

  if (contributorProfile && weeklyCategoryRank) {
    notifications.push({
      title: `You are #${weeklyCategoryRank} in ${contributorProfile.topCategory} this week`,
      description: "Keep contributing in your strongest category to climb the weekly leaderboard.",
      href: `/contributors?period=week&category=${encodeURIComponent(contributorProfile.topCategory)}`,
      icon: <Trophy size={18} />,
      tone: "text-amber-200",
    });
  }

  if (notifications.length === 0) {
    notifications.push({
      title: "No new contribution notifications yet",
      description: "Follow requests and add answers to unlock rank updates, badges, and answered-request alerts.",
      href: "/contribute",
      icon: <Sparkles size={18} />,
      tone: "text-white/45",
    });
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Notifications</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Community updates</h2>
        </div>
        <Link href="/contributors" className="hidden text-sm text-white/40 hover:text-white sm:inline">View leaderboard</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {notifications.slice(0, 3).map((notification) => (
          <Link key={notification.title} href={notification.href} className="answer-row-card block rounded-2xl p-5" style={{ "--answer-accent": "#f97316" } as CSSProperties}>
            <div className={`mb-3 ${notification.tone}`}>{notification.icon}</div>
            <h3 className="text-base font-bold text-white">{notification.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/45">{notification.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptyPanel({ title, description, href, cta }: { title: string; description: string; href: string; cta: string }) {
  return (
    <div className="filter-studio rounded-[24px] p-6">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/45">{description}</p>
      <Link href={href} className="btn-primary mt-5 inline-flex rounded-full px-4 py-2 text-sm font-medium">{cta}</Link>
    </div>
  );
}
