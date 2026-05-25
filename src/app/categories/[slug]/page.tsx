import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Layers, Trophy } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { getContributorLeaderboard } from "@/lib/contributors";
import { CATEGORIES } from "@/lib/data";
import { prisma } from "@/lib/db";
import { categorySeoPath, compareCategorySeoPath } from "@/lib/seoRoutes";
import { answerSlug, categorySlug } from "@/lib/slugs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getCategory(slug: string) {
  return CATEGORIES.find((category) => categorySlug(category.name) === slug) ?? null;
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: categorySlug(category.name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    return {
      title: "AI answer category not found | Divoly",
      robots: { index: false, follow: true },
    };
  }

  const title = `${category.name} AI answers | Divoly`;
  const description = `Browse reusable AI answers for ${category.name.toLowerCase()} questions. Search real responses from GPT, Claude, Gemini, DeepSeek, Qwen, and more.`;

  return {
    title,
    description,
    alternates: { canonical: `/categories/${categorySlug(category.name)}` },
    openGraph: { title, description, url: `/categories/${categorySlug(category.name)}`, siteName: "Divoly", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) notFound();

  const answers = await prisma.answer.findMany({
    where: { category: category.name },
    orderBy: [{ upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }],
    take: 30,
  }).catch(() => []);
  const categoryLeaders = await getContributorLeaderboard({ category: category.name, period: "all", limit: 3 }).catch(() => []);

  const totalViews = answers.reduce((sum, answer) => sum + answer.views, 0);
  const pageUrl = `https://www.divoly.com/categories/${categorySlug(category.name)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} AI answers`,
    description: `A searchable collection of AI answers for ${category.name.toLowerCase()} questions.`,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: answers.length,
      itemListElement: answers.slice(0, 10).map((answer, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.divoly.com/answers/${answerSlug(answer)}`,
        name: answer.prompt,
      })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Divoly", item: "https://www.divoly.com" },
      { "@type": "ListItem", position: 2, name: "Categories", item: "https://www.divoly.com/explore" },
      { "@type": "ListItem", position: 3, name: category.name, item: pageUrl },
    ],
  };

  return (
    <div className="explore-bg min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <Link href="/contribute" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">+ Add Answer</Link>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/explore" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to explore
        </Link>

        <section className="filter-studio mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Category page</p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">{category.icon} {category.name}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                A curated index of reusable AI answers for {category.name.toLowerCase()} questions, built to help people find high-quality responses without asking again.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <Layers size={16} className="mb-2 text-cyan-300" />
                <p className="text-2xl font-bold text-white">{answers.length}</p>
                <p className="text-xs text-white/35">answers</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <Eye size={16} className="mb-2 text-cyan-300" />
                <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-white/35">views</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <Link href={categorySeoPath(category.name)} className="answer-row-card rounded-[24px] p-5">
            <h2 className="text-xl font-bold text-white">Best {category.name} AI answers</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/42">
              A ranked SEO index of the most useful {category.name.toLowerCase()} answers on Divoly.
            </p>
          </Link>
          <Link href={compareCategorySeoPath(category.name)} className="answer-row-card rounded-[24px] p-5">
            <h2 className="text-xl font-bold text-white">Compare AI models</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/42">
              Compare which models perform best for {category.name.toLowerCase()} questions.
            </p>
          </Link>
        </section>

        <section className="mb-8 rounded-[28px] border border-orange-300/15 bg-[radial-gradient(circle_at_0%_0%,rgba(249,115,22,0.16),transparent_20rem),rgba(255,255,255,0.035)] p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Category leaderboard</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Top {category.name} contributors</h2>
            </div>
            <Link href={`/contributors?category=${encodeURIComponent(category.name)}`} className="text-sm font-medium text-orange-300 hover:text-amber-200">
              View full leaderboard
            </Link>
          </div>
          {categoryLeaders.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {categoryLeaders.map((contributor) => (
                <Link key={contributor.userId} href={`/contributors?category=${encodeURIComponent(category.name)}`} className="rounded-2xl border border-white/10 bg-black/18 p-4 transition-colors hover:border-orange-300/25 hover:bg-orange-300/[0.06]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-300/10 text-orange-200">
                      <Trophy size={16} />
                    </div>
                    <span className="text-xs font-black text-white/35">#{contributor.rank}</span>
                  </div>
                  <h3 className="font-bold text-white">{contributor.name}</h3>
                  <p className="mt-1 text-xs text-white/35">{contributor.reputation.toLocaleString()} reputation · {contributor.answerCount} answers</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/42">No category contributors yet. Add the first answer to take the lead.</p>
          )}
        </section>

        {answers.length > 0 ? (
          <section className="space-y-4">
            {answers.map((answer) => <SeoAnswerCard key={answer.id} answer={answer} />)}
          </section>
        ) : (
          <section className="filter-studio rounded-[28px] p-8 text-center">
            <h2 className="text-2xl font-bold text-white">No {category.name.toLowerCase()} answers yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/45">Add the first useful answer in this category and make it discoverable.</p>
            <Link href="/contribute" className="btn-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium">Add first answer</Link>
          </section>
        )}
      </main>
    </div>
  );
}
