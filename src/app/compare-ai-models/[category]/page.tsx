import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, Eye, Scale, Star, Trophy } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { CATEGORIES } from "@/lib/data";
import { prisma } from "@/lib/db";
import { categorySlug } from "@/lib/slugs";
import { categorySeoPath, compareCategorySeoPath, getCategoryBySlug, getModelByName, getModelColor, modelCategorySeoPath } from "@/lib/seoRoutes";

const SITE_URL = "https://divoly.com";

type PageProps = {
  params: Promise<{ category: string }>;
};

type ComparisonAnswer = {
  id: string;
  prompt: string;
  answer: string;
  model: string;
  modelColor: string;
  category: string;
  upvotes: number;
  views: number;
};

type ModelComparison = {
  model: string;
  modelColor: string;
  answers: ComparisonAnswer[];
  answerCount: number;
  helpfulVotes: number;
  views: number;
  score: number;
};

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: categorySlug(category.name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const category = getCategoryBySlug(categoryParam);

  if (!category) {
    return {
      title: "AI model comparison not found | Divoly",
      robots: { index: false, follow: true },
    };
  }

  const title = `Compare AI models for ${category.name} answers | Divoly`;
  const description = `Compare GPT, Claude, Gemini, DeepSeek, Qwen, and other AI models by their best ${category.name.toLowerCase()} answers, helpful votes, views, and reusable responses.`;
  const url = compareCategorySeoPath(category.name);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Divoly", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CompareAiModelsCategoryPage({ params }: PageProps) {
  const { category: categoryParam } = await params;
  const category = getCategoryBySlug(categoryParam);

  if (!category) notFound();

  const answers = await prisma.answer.findMany({
    where: { category: category.name },
    orderBy: [{ upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }],
    take: 120,
  }).catch(() => []);

  if (answers.length === 0) notFound();

  const modelStats = Array.from(
    answers.reduce((map, answer) => {
      if (!getModelByName(answer.model)) return map;

      const current = map.get(answer.model) ?? {
        model: answer.model,
        modelColor: answer.modelColor || getModelColor(answer.model),
        answers: [],
        answerCount: 0,
        helpfulVotes: 0,
        views: 0,
        score: 0,
      };

      current.answers.push(answer);
      current.answerCount += 1;
      current.helpfulVotes += answer.upvotes;
      current.views += answer.views;
      current.score = current.helpfulVotes * 8 + Math.round(current.views / 120) + current.answerCount * 15;
      map.set(answer.model, current);
      return map;
    }, new Map<string, ModelComparison>()).values(),
  ).sort((a, b) => b.score - a.score);

  if (modelStats.length === 0) notFound();

  const winner = modelStats[0];
  const totalViews = answers.reduce((sum, answer) => sum + answer.views, 0);
  const totalVotes = answers.reduce((sum, answer) => sum + answer.upvotes, 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Compare AI models for ${category.name} answers`,
    description: `A comparison of AI models based on ${category.name.toLowerCase()} answers indexed on Divoly.`,
    url: `${SITE_URL}${compareCategorySeoPath(category.name)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: modelStats.map((model, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: model.model,
        url: `${SITE_URL}${modelCategorySeoPath(model.model, category.name)}`,
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
        <Link href={categorySeoPath(category.name)} className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to best {category.name} answers
        </Link>

        <section className="filter-studio mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">AI model comparison</p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">
                Compare AI models for {category.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                A topic-specific comparison of AI models based on indexed Divoly answers, helpful votes, views, and coverage depth.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Metric icon={<Scale size={16} />} label="models" value={modelStats.length.toLocaleString()} />
              <Metric icon={<Star size={16} />} label="helpful votes" value={totalVotes.toLocaleString()} />
              <Metric icon={<Eye size={16} />} label="views" value={totalViews.toLocaleString()} />
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="model-universe rounded-[24px] p-5">
            <Trophy size={19} className="mb-3" style={{ color: winner.modelColor }} />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">Current category leader</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{winner.model}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              {winner.model} currently leads this category by combined helpful votes, views, and answer coverage.
            </p>
            <Link href={modelCategorySeoPath(winner.model, category.name)} className="btn-primary mt-5 inline-flex rounded-full px-4 py-2 text-sm font-medium">
              View {winner.model} answers
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {modelStats.slice(0, 8).map((model, index) => (
              <Link
                key={model.model}
                href={modelCategorySeoPath(model.model, category.name)}
                className="answer-row-card rounded-2xl p-4"
                style={{ "--answer-accent": model.modelColor } as CSSProperties}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/30">#{index + 1}</span>
                  <span className="badge border border-white/10" style={{ background: `${model.modelColor}18`, color: model.modelColor }}>
                    {model.model}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <SmallMetric label="answers" value={model.answerCount} />
                  <SmallMetric label="votes" value={model.helpfulVotes} />
                  <SmallMetric label="views" value={model.views} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-white">{model.answers[0]?.prompt}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-cyan-300" />
            <h2 className="text-2xl font-bold text-white">Best answers used for this comparison</h2>
          </div>
          <div className="space-y-4">
            {answers.slice(0, 12).map((answer) => <SeoAnswerCard key={answer.id} answer={answer} />)}
          </div>
        </section>
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

function SmallMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] px-2 py-2">
      <p className="font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-white/30">{label}</p>
    </div>
  );
}
