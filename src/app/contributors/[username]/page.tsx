import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Flame, Layers, Star, Trophy } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { ShareButton } from "@/components/ShareButton";
import type { ContributorBadge } from "@/lib/contributors";
import { getContributorBySlug } from "@/lib/contributors";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{ username: string }>;
};

const badgeToneClass: Record<ContributorBadge["tone"], string> = {
  orange: "border-orange-300/20 bg-orange-300/10 text-orange-100",
  amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  blue: "border-sky-300/20 bg-sky-300/10 text-sky-100",
  pink: "border-rose-300/20 bg-rose-300/10 text-rose-100",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard" }).format(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const contributor = await getContributorBySlug(username).catch(() => null);

  if (!contributor) {
    return {
      title: "Contributor not found | Divoly",
      robots: { index: false, follow: true },
    };
  }

  const title = `${contributor.name} | Divoly contributor`;
  const description = `${contributor.name} has ${formatNumber(contributor.reputation)} reputation on Divoly, with strongest expertise in ${contributor.topCategory}.`;

  return {
    title,
    description,
    alternates: { canonical: `/contributors/${username}` },
    openGraph: { title, description, url: `/contributors/${username}`, siteName: "Divoly", type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ContributorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const contributor = await getContributorBySlug(username).catch(() => null);

  if (!contributor) notFound();

  const answers = await prisma.answer.findMany({
    where: { userId: contributor.userId },
    orderBy: [{ upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }],
    take: 12,
  }).catch(() => []);

  const profileUrl = `/contributors/${username}`;

  return (
    <div className="explore-bg min-h-screen">
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/">
          <DivolyWordmark height={32} />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/contributors" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">Leaderboard</Link>
          <Link href="/contribute" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">Add answer</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <Link href="/contributors" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to leaderboard
        </Link>

        <section className="relative mb-8 overflow-hidden rounded-[2.4rem] border border-orange-300/15 bg-[radial-gradient(circle_at_18%_0%,rgba(249,115,22,0.22),transparent_27rem),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-orange-950/20 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-4 py-2 text-sm font-bold text-orange-100">
                <Trophy size={16} />
                Rank #{contributor.rank} contributor
              </div>
              <h1 className="max-w-3xl text-5xl font-black tracking-[-0.055em] text-white md:text-7xl">{contributor.name}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/55">
                {contributor.level} contributor with strongest reputation in {contributor.topCategory}. Public profile, badges, category reputation, and top reusable answers.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ShareButton
                  title={`${contributor.name} on Divoly`}
                  text={`${contributor.name} has ${formatNumber(contributor.reputation)} reputation on Divoly.`}
                  url={profileUrl}
                  label="Share profile"
                  className="border-orange-300/20 bg-orange-300/10 text-orange-100"
                />
                <Link href="/contribute" className="btn-primary inline-flex rounded-xl px-4 py-2 text-sm font-semibold">
                  Compete by contributing
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ProfileMetric icon={<Star size={18} />} label="Reputation" value={formatNumber(contributor.reputation)} />
              <ProfileMetric icon={<Layers size={18} />} label="Answers" value={contributor.answerCount} />
              <ProfileMetric icon={<Award size={18} />} label="Top category" value={contributor.topCategory} />
              <ProfileMetric icon={<Flame size={18} />} label="Streak" value={`${contributor.streakDays}d`} />
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-6">
            <section className="answer-row-card rounded-[2rem] p-6" style={{ "--answer-accent": "#f97316" } as CSSProperties}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-200/60">Shareable badges</p>
              <h2 className="text-2xl font-bold text-white">Proof of contribution</h2>
              <div className="mt-5 space-y-3">
                {contributor.badges.length > 0 ? contributor.badges.map((badge) => (
                  <div key={badge.label} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeToneClass[badge.tone]}`}>
                      {badge.label}
                    </span>
                    <ShareButton
                      compact
                      title={`${contributor.name} earned ${badge.label} on Divoly`}
                      text={`${contributor.name} earned the ${badge.label} badge on Divoly.`}
                      url={profileUrl}
                      label="Share badge"
                    />
                  </div>
                )) : (
                  <p className="text-sm text-white/42">Badges appear when this contributor reaches milestones.</p>
                )}
              </div>
            </section>

            <section className="answer-row-card rounded-[2rem] p-6" style={{ "--answer-accent": "#fb923c" } as CSSProperties}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-200/60">Category reputation</p>
              <h2 className="text-2xl font-bold text-white">Where {contributor.name} is strongest</h2>
              <div className="mt-5 space-y-4">
                {contributor.categoryReputation.map((item) => (
                  <div key={item.category}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <Link href={`/contributors?category=${encodeURIComponent(item.category)}`} className="font-semibold text-white hover:text-orange-200">
                        {item.category}
                      </Link>
                      <span className="text-white/35">{formatNumber(item.score)} rep</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300"
                        style={{ width: `${Math.max(12, Math.min(100, (item.score / Math.max(contributor.categoryReputation[0]?.score ?? 1, 1)) * 100))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/32">{item.answers} answers · {formatNumber(item.upvotes)} votes · {formatNumber(item.views)} views</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Top answers</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Reusable answers by {contributor.name}</h2>
              </div>
              <ShareButton compact title={`${contributor.name}'s Divoly answers`} url={profileUrl} label="Share" />
            </div>

            {answers.length > 0 ? (
              <div className="space-y-4">
                {answers.map((answer) => <SeoAnswerCard key={answer.id} answer={answer} />)}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.025] p-8 text-center">
                <h3 className="text-lg font-bold text-white">No public answers yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/42">This profile will fill up as the contributor adds answers.</p>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

function ProfileMetric({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
      <div className="mb-3 text-orange-200">{icon}</div>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-white/38">{label}</p>
    </div>
  );
}
