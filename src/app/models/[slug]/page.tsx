import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, Sparkles } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { MODELS } from "@/lib/data";
import { prisma } from "@/lib/db";
import { modelCategorySeoPath } from "@/lib/seoRoutes";
import { answerSlug, modelSlug } from "@/lib/slugs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getModel(slug: string) {
  return MODELS.find((model) => modelSlug(model.name) === slug) ?? null;
}

export function generateStaticParams() {
  return MODELS.map((model) => ({ slug: modelSlug(model.name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getModel(slug);

  if (!model) {
    return {
      title: "AI model not found | Divoly",
      robots: { index: false, follow: true },
    };
  }

  const title = `${model.name} answers | Divoly`;
  const description = `Browse real AI answers generated with ${model.name}. Find reusable responses, compare model quality, and discover useful prompts.`;

  return {
    title,
    description,
    alternates: { canonical: `/models/${modelSlug(model.name)}` },
    openGraph: { title, description, url: `/models/${modelSlug(model.name)}`, siteName: "Divoly", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ModelPage({ params }: PageProps) {
  const { slug } = await params;
  const model = getModel(slug);

  if (!model) notFound();

  const answers = await prisma.answer.findMany({
    where: { model: model.name },
    orderBy: [{ upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }],
    take: 30,
  }).catch(() => []);

  const categories = Array.from(new Set(answers.map((answer) => answer.category)));

  const pageUrl = `https://www.divoly.com/models/${modelSlug(model.name)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${model.name} AI answers`,
    description: `A searchable collection of AI answers generated with ${model.name}.`,
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
      { "@type": "ListItem", position: 2, name: "AI Models", item: "https://www.divoly.com/explore" },
      { "@type": "ListItem", position: 3, name: model.name, item: pageUrl },
    ],
  };

  return (
    <div className="explore-bg min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <Link href="/explore" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">Explore</Link>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/explore" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to explore
        </Link>

        <section className="model-universe mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em]" style={{ color: model.color }}>Model page</p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">{model.name}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                Real prompts and answers attributed to {model.name}. Use this page to see what people ask, what gets reused, and how this model performs in public answers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <BarChart3 size={16} className="mb-2" style={{ color: model.color }} />
                <p className="text-2xl font-bold text-white">{answers.length}</p>
                <p className="text-xs text-white/35">indexed answers</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <Sparkles size={16} className="mb-2" style={{ color: model.color }} />
                <p className="text-2xl font-bold text-white">{answers.reduce((sum, answer) => sum + answer.upvotes, 0)}</p>
                <p className="text-xs text-white/35">helpful votes</p>
              </div>
            </div>
          </div>
        </section>

        {categories.length > 0 ? (
          <section className="filter-studio mb-8 rounded-[24px] p-5">
            <h2 className="text-xl font-bold text-white">{model.name} by category</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/42">
              Jump into model-specific SEO pages for the topics where Divoly has indexed answers.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link key={category} href={modelCategorySeoPath(model.name, category)} className="badge border border-white/10" style={{ background: `${model.color}18`, color: model.color }}>
                  {category}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {answers.length > 0 ? (
          <section className="space-y-4">
            {answers.map((answer) => <SeoAnswerCard key={answer.id} answer={answer} />)}
          </section>
        ) : (
          <section className="filter-studio rounded-[28px] p-8 text-center">
            <h2 className="text-2xl font-bold text-white">No {model.name} answers yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/45">Be the first to add a useful response from this model and make it searchable on Divoly.</p>
            <Link href="/contribute" className="btn-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium">Add first answer</Link>
          </section>
        )}
      </main>
    </div>
  );
}
