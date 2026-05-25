import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Layers, Route, Sparkles, Star } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { CATEGORIES } from "@/lib/data";
import { prisma } from "@/lib/db";
import { answerSlug, categorySlug } from "@/lib/slugs";
import { categorySeoPath, compareCategorySeoPath, getCategoryBySlug, getModelByName, modelCategorySeoPath } from "@/lib/seoRoutes";

const SITE_URL = "https://www.divoly.com";

type PageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: categorySlug(category.name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const category = getCategoryBySlug(categoryParam);

  if (!category) {
    return {
      title: "Best AI answers not found | Divoly",
      robots: { index: false, follow: true },
    };
  }

  const title = `Best ${category.name} AI answers | Divoly`;
  const description = `Explore the best reusable AI answers for ${category.name.toLowerCase()} questions, ranked by helpful votes and views across GPT, Claude, Gemini, DeepSeek, Qwen, and more.`;
  const url = categorySeoPath(category.name);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Divoly", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function BestAiAnswersCategoryPage({ params }: PageProps) {
  const { category: categoryParam } = await params;
  const category = getCategoryBySlug(categoryParam);

  if (!category) notFound();

  const answers = await prisma.answer.findMany({
    where: { category: category.name },
    orderBy: [{ upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }],
    take: 40,
  }).catch(() => []);

  const totalViews = answers.reduce((sum, answer) => sum + answer.views, 0);
  const totalVotes = answers.reduce((sum, answer) => sum + answer.upvotes, 0);
  const modelStats = Array.from(
    answers.reduce((map, answer) => {
      const current = map.get(answer.model) ?? { model: answer.model, modelColor: answer.modelColor, count: 0, votes: 0 };
      current.count += 1;
      current.votes += answer.upvotes;
      map.set(answer.model, current);
      return map;
    }, new Map<string, { model: string; modelColor: string; count: number; votes: number }>()).values(),
  )
    .filter((model) => getModelByName(model.model))
    .sort((a, b) => b.votes - a.votes || b.count - a.count);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Best ${category.name} AI answers`,
    description: `A ranked collection of reusable AI answers for ${category.name.toLowerCase()} questions.`,
    url: `${SITE_URL}${categorySeoPath(category.name)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: answers.slice(0, 20).map((answer, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/answers/${answerSlug(answer)}`,
        name: answer.prompt,
      })),
    },
  };

  return (
    <div className="explore-bg min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <div className="flex items-center gap-2">
          <Link href="/explore" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">Explore</Link>
          <Link href="/contribute" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">+ Add Answer</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href={`/categories/${categorySlug(category.name)}`} className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to {category.name}
        </Link>

        <section className="filter-studio mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Best AI answers</p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">
                {category.icon} Best {category.name} AI answers
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                The strongest {category.name.toLowerCase()} answers on Divoly, ranked by usefulness signals so search engines and users can land on a focused, high-quality index.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Metric icon={<Layers size={16} />} label="answers" value={answers.length.toLocaleString()} />
              <Metric icon={<Star size={16} />} label="helpful votes" value={totalVotes.toLocaleString()} />
              <Metric icon={<Eye size={16} />} label="views" value={totalViews.toLocaleString()} />
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="model-universe rounded-[24px] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={17} className="text-cyan-300" />
              <h2 className="text-xl font-bold text-white">Top models in {category.name}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {modelStats.slice(0, 10).map((model) => (
                <Link
                  key={model.model}
                  href={modelCategorySeoPath(model.model, category.name)}
                  className="badge border border-white/10"
                  style={{ background: `${model.modelColor}18`, color: model.modelColor }}
                >
                  {model.model} · {model.count}
                </Link>
              ))}
            </div>
          </div>

          <Link href={compareCategorySeoPath(category.name)} className="answer-row-card rounded-[24px] p-5" style={{ "--answer-accent": "#22d3ee" } as CSSProperties}>
            <Route size={18} className="mb-3 text-cyan-300" />
            <h2 className="text-xl font-bold text-white">Compare AI models for {category.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/42">
              See which models have the most useful answers in this category and jump into model-specific answer pages.
            </p>
          </Link>
        </section>

        {answers.length > 0 ? (
          <section className="space-y-4">
            {answers.map((answer) => <SeoAnswerCard key={answer.id} answer={answer} />)}
          </section>
        ) : (
          <section className="filter-studio rounded-[28px] p-8 text-center">
            <h2 className="text-2xl font-bold text-white">No {category.name.toLowerCase()} answers yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/45">This SEO page will become indexable once the category has useful answers.</p>
            <Link href="/contribute" className="btn-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium">Add first answer</Link>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="mb-2 text-cyan-300">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/35">{label}</p>
    </div>
  );
}
