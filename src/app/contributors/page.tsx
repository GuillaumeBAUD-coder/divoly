import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Flame,
  Medal,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { CATEGORIES } from "@/lib/data";
import type { ContributorBadge, ContributorRank } from "@/lib/contributors";
import { getContributorLeaderboard } from "@/lib/contributors";
import { contributorSlug } from "@/lib/slugs";

export const metadata: Metadata = {
  title: "Contributor leaderboard | Divoly",
  description:
    "Discover top Divoly contributors, reputation, streaks, badges, weekly leaders, and category specialists.",
};

type PageSearchParams = Promise<{
  period?: string;
  category?: string;
}>;

const PERIODS = [
  { label: "All time", value: "all" },
  { label: "This week", value: "week" },
  { label: "30 days", value: "month" },
];

const badgeToneClass: Record<ContributorBadge["tone"], string> = {
  orange: "border-orange-300/20 bg-orange-300/10 text-orange-100",
  amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  blue: "border-sky-300/20 bg-sky-300/10 text-sky-100",
  pink: "border-rose-300/20 bg-rose-300/10 text-rose-100",
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function queryHref(next: { period?: string; category?: string }) {
  const params = new URLSearchParams();
  if (next.period && next.period !== "all") params.set("period", next.period);
  if (next.category && next.category !== "All") params.set("category", next.category);
  const query = params.toString();
  return query ? `/contributors?${query}` : "/contributors";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard" }).format(value);
}

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy size={22} className="text-amber-200" />;
  if (rank === 2) return <Medal size={22} className="text-zinc-200" />;
  if (rank === 3) return <Award size={22} className="text-orange-200" />;
  return <span className="text-sm font-black text-white/35">#{rank}</span>;
}

export default async function ContributorsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const periodParam = one(params.period);
  const categoryParam = one(params.category);
  const period = periodParam === "week" || periodParam === "month" || periodParam === "all" ? periodParam : "all";
  const category = CATEGORIES.some((item) => item.name === categoryParam) ? categoryParam : "All";

  const [contributors, weeklyContributors] = await Promise.all([
    getContributorLeaderboard({ period, category, limit: 50 }).catch(() => []),
    getContributorLeaderboard({ period: "week", limit: 5 }).catch(() => []),
  ]);

  const leader = contributors[0] ?? null;
  const totalReputation = contributors.reduce((sum, contributor) => sum + contributor.reputation, 0);
  const totalAnswers = contributors.reduce((sum, contributor) => sum + contributor.answerCount, 0);
  const bestStreak = contributors.reduce((max, contributor) => Math.max(max, contributor.streakDays), 0);

  return (
    <div className="explore-bg min-h-screen">
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/">
          <DivolyWordmark height={32} />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/explore" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">
            Explore
          </Link>
          <Link href="/contribute" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
            Add answer
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back home
        </Link>

        <section className="relative mb-8 overflow-hidden rounded-[2.4rem] border border-orange-300/15 bg-[radial-gradient(circle_at_20%_0%,rgba(249,115,22,0.2),transparent_26rem),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-orange-950/20 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-4 py-2 text-sm font-bold text-orange-100">
                <Trophy size={16} />
                Contribution league
              </div>
              <h1 className="max-w-3xl text-5xl font-black tracking-[-0.055em] text-white md:text-7xl">
                Build reputation by sharing answers.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/55 md:text-lg">
                Divoly now rewards useful contributions with reputation, badges, streaks, category expertise, and weekly leaderboards.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <HeroStat icon={<Users size={18} />} label="Ranked contributors" value={contributors.length} />
              <HeroStat icon={<Sparkles size={18} />} label="Reputation scored" value={formatNumber(totalReputation)} />
              <HeroStat icon={<Star size={18} />} label="Answers counted" value={formatNumber(totalAnswers)} />
              <HeroStat icon={<Flame size={18} />} label="Best streak" value={`${bestStreak}d`} />
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="answer-row-card rounded-[2rem] p-6" style={{ "--answer-accent": "#f97316" } as CSSProperties}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-200/60">Top contributor this week</p>
            {weeklyContributors[0] ? (
              <ContributorFeature contributor={weeklyContributors[0]} />
            ) : (
              <EmptyLeaderboard title="No weekly leader yet" description="The first contributor this week will appear here." />
            )}
          </div>

          <div className="answer-row-card rounded-[2rem] p-6" style={{ "--answer-accent": "#f59e0b" } as CSSProperties}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-amber-200/60">How reputation works</p>
            <div className="grid gap-3 md:grid-cols-3">
              <RuleCard icon={<Zap size={18} />} title="Answers" description="+90 reputation per answer, with extra weekly momentum." />
              <RuleCard icon={<Star size={18} />} title="Helpfulness" description="Upvotes and views push high-signal answers above volume." />
              <RuleCard icon={<ShieldCheck size={18} />} title="Expertise" description="Category reputation highlights specialists, not only generalists." />
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((item) => (
                <Link
                  key={item.value}
                  href={queryHref({ period: item.value, category })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    period === item.value
                      ? "bg-orange-300 text-black"
                      : "border border-white/10 bg-white/[0.04] text-white/50 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {["All", ...CATEGORIES.map((item) => item.name)].map((item) => (
                <Link
                  key={item}
                  href={queryHref({ period, category: item })}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition-colors ${
                    category === item
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.035] text-white/42 hover:text-white"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {leader ? (
          <section className="mb-8 grid gap-4 lg:grid-cols-3">
            {contributors.slice(0, 3).map((contributor) => (
              <PodiumCard key={contributor.userId} contributor={contributor} />
            ))}
          </section>
        ) : null}

        <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Leaderboard</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Contributor ranking</h2>
              </div>
              <Link href="/contribute" className="hidden text-sm font-medium text-orange-300 hover:text-amber-200 sm:inline">
                Start contributing
              </Link>
            </div>

            {contributors.length > 0 ? (
              <div className="space-y-3">
                {contributors.map((contributor) => (
                  <ContributorRow key={contributor.userId} contributor={contributor} />
                ))}
              </div>
            ) : (
              <EmptyLeaderboard
                title="No contributors for this filter yet"
                description="Add the first answer in this category or period to claim the top spot."
              />
            )}
          </div>

          <aside className="space-y-6">
            <section className="answer-row-card rounded-[2rem] p-6" style={{ "--answer-accent": "#fb923c" } as CSSProperties}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-200/60">Category reputation</p>
              <h2 className="text-2xl font-bold text-white">Specialists by topic</h2>
              <div className="mt-5 space-y-4">
                {(leader?.categoryReputation ?? []).slice(0, 5).map((item) => (
                  <div key={item.category}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">{item.category}</span>
                      <span className="text-white/35">{formatNumber(item.score)} rep</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300"
                        style={{ width: `${Math.max(12, Math.min(100, (item.score / Math.max(leader?.categoryReputation[0]?.score ?? 1, 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!leader ? <p className="text-sm text-white/42">Category specialists will appear when contributors add answers.</p> : null}
              </div>
            </section>

            <section className="answer-row-card rounded-[2rem] p-6" style={{ "--answer-accent": "#f59e0b" } as CSSProperties}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-amber-200/60">Badge system</p>
              <h2 className="text-2xl font-bold text-white">Milestones that create a loop</h2>
              <div className="mt-5 grid gap-2">
                {[
                  "First answer",
                  "Top contributor",
                  "Rising this week",
                  "Category specialist",
                  "Helpful expert",
                  "High-signal answers",
                  "Streak builder",
                  "Multi-topic",
                ].map((badge) => (
                  <div key={badge} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/68">
                    {badge}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
      <div className="mb-3 text-orange-200">{icon}</div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-white/38">{label}</p>
    </div>
  );
}

function ContributorFeature({ contributor }: { contributor: ContributorRank }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <ContributorAvatar contributor={contributor} size="lg" />
        <div>
          <h2 className="text-3xl font-black tracking-[-0.035em] text-white">{contributor.name}</h2>
          <p className="mt-1 text-sm text-white/42">{contributor.weeklyAnswerCount} answers this week · {contributor.level}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric label="Reputation" value={formatNumber(contributor.reputation)} />
        <MiniMetric label="Streak" value={`${contributor.streakDays}d`} />
        <MiniMetric label="Top topic" value={contributor.topCategory} />
      </div>
    </div>
  );
}

function PodiumCard({ contributor }: { contributor: ContributorRank }) {
  return (
    <Link href={`/contributors/${contributorSlug(contributor.name)}`} className="answer-row-card block rounded-[2rem] p-6" style={{ "--answer-accent": contributor.rank === 1 ? "#f59e0b" : "#f97316" } as CSSProperties}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-300/10">
          {rankIcon(contributor.rank)}
        </div>
        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white/55">{contributor.level}</span>
      </div>
      <ContributorAvatar contributor={contributor} size="md" />
      <h3 className="mt-4 text-2xl font-black tracking-[-0.035em] text-white">{contributor.name}</h3>
      <p className="mt-2 text-sm text-white/45">{formatNumber(contributor.reputation)} reputation · {contributor.topCategory}</p>
      <BadgeList badges={contributor.badges} />
    </Link>
  );
}

function ContributorRow({ contributor }: { contributor: ContributorRank }) {
  return (
    <Link href={`/contributors/${contributorSlug(contributor.name)}`} className="answer-row-card block rounded-[1.5rem] p-4" style={{ "--answer-accent": "#f97316" } as CSSProperties}>
      <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            {rankIcon(contributor.rank)}
          </div>
          <ContributorAvatar contributor={contributor} size="sm" />
          <div>
            <h3 className="font-bold text-white">{contributor.name}</h3>
            <p className="text-xs text-white/35">{contributor.level} · {contributor.topCategory}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <BadgeList badges={contributor.badges} compact />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center lg:min-w-[24rem]">
          <MiniMetric label="Rep" value={formatNumber(contributor.reputation)} />
          <MiniMetric label="Answers" value={contributor.answerCount} />
          <MiniMetric label="Votes" value={formatNumber(contributor.upvotes)} />
          <MiniMetric label="Streak" value={`${contributor.streakDays}d`} />
        </div>
      </div>
    </Link>
  );
}

function ContributorAvatar({ contributor, size }: { contributor: ContributorRank; size: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-xl" : size === "md" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";
  const initials = contributor.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-200 font-black text-black shadow-lg shadow-orange-950/30`}>
      {initials || "D"}
    </div>
  );
}

function BadgeList({ badges, compact = false }: { badges: ContributorBadge[]; compact?: boolean }) {
  if (badges.length === 0) {
    return <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-semibold text-white/35">No badges yet</span>;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-4"}`}>
      {badges.map((badge) => (
        <span key={badge.label} className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeToneClass[badge.tone]}`}>
          {badge.label}
        </span>
      ))}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-2">
      <p className="text-sm font-black text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/32">{label}</p>
    </div>
  );
}

function RuleCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 text-orange-200">{icon}</div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-white/42">{description}</p>
    </div>
  );
}

function EmptyLeaderboard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.025] p-8 text-center">
      <Trophy size={24} className="mx-auto mb-3 text-white/25" />
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/42">{description}</p>
      <Link href="/contribute" className="btn-primary mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold">
        Add the first answer
      </Link>
    </div>
  );
}
