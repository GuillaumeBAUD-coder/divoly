import { prisma } from "@/lib/db";
import { isSeedEmail } from "@/lib/publicData";
import { contributorSlug } from "@/lib/slugs";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ContributorBadge = {
  label: string;
  tone: "orange" | "amber" | "green" | "blue" | "pink";
};

export type CategoryReputation = {
  category: string;
  answers: number;
  upvotes: number;
  views: number;
  score: number;
};

export type ContributorRank = {
  userId: string;
  name: string;
  image: string | null;
  rank: number;
  level: string;
  reputation: number;
  answerCount: number;
  weeklyAnswerCount: number;
  upvotes: number;
  views: number;
  categoryCount: number;
  topCategory: string;
  streakDays: number;
  badges: ContributorBadge[];
  categoryReputation: CategoryReputation[];
};

type ContributorPeriod = "all" | "week" | "month";

type LeaderboardOptions = {
  period?: ContributorPeriod;
  category?: string;
  limit?: number;
};

type AnswerRow = {
  id: string;
  category: string;
  upvotes: number;
  views: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

function startOfUTCDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function dayKey(date: Date) {
  return startOfUTCDate(date).toISOString().slice(0, 10);
}

function getPeriodStart(period: ContributorPeriod, now = new Date()) {
  if (period === "week") return new Date(now.getTime() - 7 * DAY_MS);
  if (period === "month") return new Date(now.getTime() - 30 * DAY_MS);
  return null;
}

function displayName(user: AnswerRow["user"]) {
  return user.name?.trim() || user.email.split("@")[0] || "Divoly contributor";
}

function levelFor(reputation: number) {
  if (reputation >= 5000) return "Legend";
  if (reputation >= 2500) return "Expert";
  if (reputation >= 1200) return "Builder";
  if (reputation >= 450) return "Contributor";
  return "Starter";
}

function calculateStreak(answers: AnswerRow[]) {
  if (answers.length === 0) return 0;

  const activeDays = new Set(answers.map((answer) => dayKey(answer.createdAt)));
  const latest = answers.reduce((max, answer) => (answer.createdAt > max ? answer.createdAt : max), answers[0].createdAt);
  let cursor = startOfUTCDate(latest);
  let streak = 0;

  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  return streak;
}

function buildCategoryReputation(answers: AnswerRow[]) {
  const byCategory = new Map<string, CategoryReputation>();

  for (const answer of answers) {
    const current = byCategory.get(answer.category) ?? {
      category: answer.category,
      answers: 0,
      upvotes: 0,
      views: 0,
      score: 0,
    };

    current.answers += 1;
    current.upvotes += answer.upvotes;
    current.views += answer.views;
    current.score = current.answers * 80 + current.upvotes * 12 + Math.floor(current.views / 20);
    byCategory.set(answer.category, current);
  }

  return Array.from(byCategory.values()).sort((a, b) => b.score - a.score);
}

function buildBadges({
  rank,
  answerCount,
  weeklyAnswerCount,
  upvotes,
  views,
  categoryCount,
  streakDays,
  topCategoryAnswers,
}: {
  rank: number;
  answerCount: number;
  weeklyAnswerCount: number;
  upvotes: number;
  views: number;
  categoryCount: number;
  streakDays: number;
  topCategoryAnswers: number;
}): ContributorBadge[] {
  const badges: ContributorBadge[] = [];

  if (rank === 1) badges.push({ label: "Top contributor", tone: "amber" });
  if (answerCount >= 1) badges.push({ label: "First answer", tone: "orange" });
  if (weeklyAnswerCount >= 2) badges.push({ label: "Rising this week", tone: "green" });
  if (topCategoryAnswers >= 3) badges.push({ label: "Category specialist", tone: "blue" });
  if (upvotes >= 50) badges.push({ label: "Helpful expert", tone: "amber" });
  if (views >= 1000) badges.push({ label: "High-signal answers", tone: "pink" });
  if (streakDays >= 3) badges.push({ label: "Streak builder", tone: "orange" });
  if (categoryCount >= 3) badges.push({ label: "Multi-topic", tone: "blue" });

  return badges.slice(0, 4);
}

export async function getContributorLeaderboard(options: LeaderboardOptions = {}) {
  const period = options.period ?? "all";
  const normalizedCategory = options.category && options.category !== "All" ? options.category : null;
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
  const periodStart = getPeriodStart(period);
  const weekStart = getPeriodStart("week")!;

  const allAnswers = await prisma.answer.findMany({
    select: {
      id: true,
      category: true,
      upvotes: true,
      views: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const answersByUser = new Map<string, AnswerRow[]>();
  for (const answer of allAnswers) {
    if (isSeedEmail(answer.user.email)) continue;

    const userAnswers = answersByUser.get(answer.user.id) ?? [];
    userAnswers.push(answer);
    answersByUser.set(answer.user.id, userAnswers);
  }

  const contributors = Array.from(answersByUser.entries())
    .map(([userId, userAnswers]) => {
      const eligibleAnswers = userAnswers.filter((answer) => {
        if (periodStart && answer.createdAt < periodStart) return false;
        if (normalizedCategory && answer.category !== normalizedCategory) return false;
        return true;
      });

      if (eligibleAnswers.length === 0) return null;

      const weeklyAnswers = userAnswers.filter((answer) => answer.createdAt >= weekStart);
      const categoryReputation = buildCategoryReputation(userAnswers);
      const scopedCategoryReputation = buildCategoryReputation(eligibleAnswers);
      const upvotes = eligibleAnswers.reduce((sum, answer) => sum + answer.upvotes, 0);
      const views = eligibleAnswers.reduce((sum, answer) => sum + answer.views, 0);
      const categories = new Set(userAnswers.map((answer) => answer.category));
      const topCategory = categoryReputation[0]?.category ?? "General";
      const streakDays = calculateStreak(userAnswers);
      const reputation = Math.round(
        eligibleAnswers.length * 90 +
          upvotes * 14 +
          views * 0.08 +
          categories.size * 35 +
          weeklyAnswers.length * 55 +
          streakDays * 30,
      );

      return {
        userId,
        name: displayName(userAnswers[0].user),
        image: userAnswers[0].user.image,
        rank: 0,
        level: levelFor(reputation),
        reputation,
        answerCount: eligibleAnswers.length,
        weeklyAnswerCount: weeklyAnswers.length,
        upvotes,
        views,
        categoryCount: categories.size,
        topCategory,
        streakDays,
        badges: [] as ContributorBadge[],
        categoryReputation: scopedCategoryReputation,
      };
    })
    .filter((contributor): contributor is Omit<ContributorRank, "badges"> & { badges: ContributorBadge[] } => Boolean(contributor))
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, limit)
    .map((contributor, index) => {
      const rank = index + 1;
      const topCategoryAnswers = contributor.categoryReputation[0]?.answers ?? 0;

      return {
        ...contributor,
        rank,
        badges: buildBadges({
          rank,
          answerCount: contributor.answerCount,
          weeklyAnswerCount: contributor.weeklyAnswerCount,
          upvotes: contributor.upvotes,
          views: contributor.views,
          categoryCount: contributor.categoryCount,
          streakDays: contributor.streakDays,
          topCategoryAnswers,
        }),
      };
    });

  return contributors satisfies ContributorRank[];
}

export async function getContributorProfile(userId: string) {
  const contributors = await getContributorLeaderboard({ period: "all", limit: 100 });
  return contributors.find((contributor) => contributor.userId === userId) ?? null;
}

export async function getContributorBySlug(slug: string) {
  const contributors = await getContributorLeaderboard({ period: "all", limit: 100 });
  return contributors.find((contributor) => contributorSlug(contributor.name) === slug) ?? null;
}
