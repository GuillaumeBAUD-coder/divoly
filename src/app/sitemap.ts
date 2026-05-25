import { MetadataRoute } from "next";
import { getContributorLeaderboard } from "@/lib/contributors";
import { CATEGORIES, MODELS } from "@/lib/data";
import { prisma } from "@/lib/db";
import { categorySeoPath, compareCategorySeoPath, getModelByName, modelCategorySeoPath } from "@/lib/seoRoutes";
import { answerSlug, categorySlug, contributorSlug, modelSlug } from "@/lib/slugs";

const SITE_URL = "https://www.divoly.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.86 },
    { url: `${SITE_URL}/requests`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/contributors`, lastModified: now, changeFrequency: "daily", priority: 0.82 },
    { url: `${SITE_URL}/contribute`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...MODELS.map((model) => ({
      url: `${SITE_URL}/models/${modelSlug(model.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    })),
    ...CATEGORIES.map((category) => ({
      url: `${SITE_URL}/categories/${categorySlug(category.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.78,
    })),
    ...CATEGORIES.map((category) => ({
      url: `${SITE_URL}${categorySeoPath(category.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...CATEGORIES.map((category) => ({
      url: `${SITE_URL}${compareCategorySeoPath(category.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.76,
    })),
  ];

  try {
    const answers = await prisma.answer.findMany({
      orderBy: [{ upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }],
      take: 800,
      select: { prompt: true, model: true, category: true, updatedAt: true },
    });
    const contributors = await getContributorLeaderboard({ period: "all", limit: 100 }).catch(() => []);

    const uniqueAnswerRoutes = Array.from(
      new Map(
        answers.map((answer) => [
          answerSlug(answer),
          {
            url: `${SITE_URL}/answers/${answerSlug(answer)}`,
            lastModified: answer.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.64,
          },
        ]),
      ).values(),
    );

    const uniqueModelCategoryRoutes = Array.from(
      new Map(
        answers.filter((answer) => getModelByName(answer.model)).map((answer) => [
          `${answer.model}::${answer.category}`,
          {
            url: `${SITE_URL}${modelCategorySeoPath(answer.model, answer.category)}`,
            lastModified: answer.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          },
        ]),
      ).values(),
    );

    const contributorRoutes = contributors.map((contributor) => ({
      url: `${SITE_URL}/contributors/${contributorSlug(contributor.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.58,
    }));

    return [...staticRoutes, ...contributorRoutes, ...uniqueModelCategoryRoutes, ...uniqueAnswerRoutes];
  } catch {
    return staticRoutes;
  }
}
