import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, Compass, Eye, Layers, Star } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { prisma } from "@/lib/db";
import { answerSlug, categorySlug, modelSlug } from "@/lib/slugs";
import { categorySeoPath, compareCategorySeoPath, getCategoryBySlug, getModelByName, getModelBySlug, modelCategorySeoPath } from "@/lib/seoRoutes";

const SITE_URL = "https://www.divoly.com";

type PageProps = {
  params: Promise<{ model: string; category: string }>;
};

export async function generateStaticParams() {
  const pairs = await prisma.answer.findMany({
    distinct: ["model", "category"],
    select: { model: true, category: true },
    take: 500,
  }).catch(() => []);

  return pairs
    .filter((pair) => getModelByName(pair.model))
    .map((pair) => ({
      model: modelSlug(pair.model),
      category: categorySlug(pair.category),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { model: modelParam, category: categoryParam } = await params;
  const model = getModelBySlug(modelParam);
  const category = getCategoryBySlug(categoryParam);

  if (!model || !category) {
    return {
      title: "AI answers not found | Divoly",
      robots: { index: false, follow: true },
    };
  }

  const title = `${model.name} ${category.name} AI answers | Divoly`;
  const description = `Browse real ${category.name.toLowerCase()} answers attributed to ${model.name}. See useful prompts, reusable responses, and model-specific examples on Divoly.`;
  const url = modelCategorySeoPath(model.name, category.name);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Divoly", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ModelCategoryAiAnswersPage({ params }: PageProps) {
  const { model: modelParam, category: categoryParam } = await params;
  const model = getModelBySlug(modelParam);
  const category = getCategoryBySlug(categoryParam);

  if (!model || !category) notFound();

  const [answers, categoryModelPairs] = await Promise.all([
    prisma.answer.findMany({
      where: { model: model.name, category: category.name },
      orderBy: [{ upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }],
      take: 40,
    }),
    prisma.answer.findMany({
      where: { category: category.name },
      distinct: ["model"],
      select: { model: true, modelColor: true },
      orderBy: [{ model: "asc" }],
      take: 20,
    }),
  ]).catch(() => [[], []] as const);

  if (answers.length === 0) notFound();

  const totalViews = answers.reduce((sum, answer) => sum + answer.views, 0);
  const totalVotes = answers.reduce((sum, answer) => sum + answer.upvotes, 0);
  const topAnswer = answers[0];
  const relatedModels = categoryModelPairs.filter((item) => item.model !== model.name && getModelByName(item.model));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${model.name} ${category.name} AI answers`,
    description: `A model-specific collection of ${category.name.toLowerCase()} AI answers from ${model.name}.`,
    url: `${SITE_URL}${modelCategorySeoPath(model.name, category.name)}`,
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
        <Link href={categorySeoPath(category.name)} className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to best {category.name} answers
        </Link>

        <section className="model-universe mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em]" style={{ color: model.color }}>
                Model-specific SEO page
              </p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">
                {model.name} answers for {category.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                Real {category.name.toLowerCase()} questions answered by {model.name}, organized as a focused landing page for people searching by model and topic.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Metric icon={<Layers size={16} />} label="answers" value={answers.length.toLocaleString()} accent={model.color} />
              <Metric icon={<Star size={16} />} label="helpful votes" value={totalVotes.toLocaleString()} accent={model.color} />
              <Metric icon={<Eye size={16} />} label="views" value={totalViews.toLocaleString()} accent={model.color} />
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="answer-row-card rounded-[24px] p-5" style={{ "--answer-accent": model.color } as CSSProperties}>
            <BarChart3 size={18} className="mb-3" style={{ color: model.color }} />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">Top answer on this page</p>
            <h2 className="mt-3 text-xl font-bold leading-snug text-white">{topAnswer.prompt}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/45">{topAnswer.answer}</p>
            <Link href={`/answers/${answerSlug(topAnswer)}`} className="btn-primary mt-5 inline-flex rounded-full px-4 py-2 text-sm font-medium">
              Read answer
            </Link>
          </div>

          <div className="filter-studio rounded-[24px] p-5">
            <Compass size={18} className="mb-3 text-cyan-300" />
            <h2 className="text-xl font-bold text-white">Explore this topic further</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={compareCategorySeoPath(category.name)} className="badge border border-cyan-300/15 bg-cyan-300/10 text-cyan-200">
                Compare models
              </Link>
              <Link href={`/models/${modelSlug(model.name)}`} className="badge border border-white/10" style={{ background: `${model.color}18`, color: model.color }}>
                All {model.name} answers
              </Link>
              <Link href={`/categories/${categorySlug(category.name)}`} className="badge border border-white/10 bg-white/[0.05] text-white/55">
                {category.name} category
              </Link>
              {relatedModels.slice(0, 8).map((item) => (
                <Link
                  key={item.model}
                  href={modelCategorySeoPath(item.model, category.name)}
                  className="badge border border-white/10"
                  style={{ background: `${item.modelColor}18`, color: item.modelColor }}
                >
                  {item.model}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {answers.map((answer) => <SeoAnswerCard key={answer.id} answer={answer} />)}
        </section>
      </main>
    </div>
  );
}

function Metric({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="mb-2" style={{ color: accent }}>{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/35">{label}</p>
    </div>
  );
}
