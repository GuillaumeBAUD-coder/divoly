import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, BookOpenText, Leaf, Quote, Route, Sparkles } from "lucide-react";
import { AddToCollectionButton } from "@/components/AddToCollectionButton";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SaveAnswerButton } from "@/components/SaveAnswerButton";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { ShareButton } from "@/components/ShareButton";
import { prisma } from "@/lib/db";
import { isSeedEmail, publicContributorLabel } from "@/lib/publicData";
import { categorySeoPath, compareCategorySeoPath, modelCategorySeoPath } from "@/lib/seoRoutes";
import { answerSlug, categorySlug, contributorSlug, modelSlug } from "@/lib/slugs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getAnswerBySlug = cache(async (slug: string) => {
  const answers = await prisma.answer.findMany({
    orderBy: [{ upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }],
    take: 1200,
    include: { user: { select: { name: true, email: true } } },
  }).catch(() => []);

  return answers.find((answer) => answerSlug(answer) === slug) ?? null;
});

function excerpt(value: string, length = 155) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length - 1)}...` : clean;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const answer = await getAnswerBySlug(slug);

  if (!answer) {
    return {
      title: "AI answer not found | Divoly",
      robots: { index: false, follow: true },
    };
  }

  const title = `${answer.prompt} | ${answer.model} answer`;
  const description = excerpt(answer.answer);
  const url = `/answers/${answerSlug(answer)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Divoly",
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function SeoAnswerPage({ params }: PageProps) {
  const { slug } = await params;
  const answer = await getAnswerBySlug(slug);

  if (!answer) notFound();

  const related = await prisma.answer.findMany({
    where: {
      id: { not: answer.id },
      OR: [{ category: answer.category }, { model: answer.model }],
    },
    orderBy: [{ upvotes: "desc" }, { views: "desc" }],
    take: 6,
  }).catch(() => []);

  const paragraphs = answer.answer.split(/\n{2,}/).filter(Boolean);
  const canonicalUrl = `https://divoly.com/answers/${answerSlug(answer)}`;
  const contributorName = publicContributorLabel(answer.user);
  const showContributorLink = Boolean(answer.user?.name && !isSeedEmail(answer.user.email));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: answer.prompt,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer.answer,
        upvoteCount: answer.upvotes,
        url: canonicalUrl,
        author: {
          "@type": "Person",
          name: contributorName,
        },
      },
    },
  };

  return (
    <div className="explore-bg min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <div className="flex items-center gap-2">
          <Link href="/saved" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">Saved</Link>
          <Link href="/account" className="btn-ghost hidden rounded-full px-4 py-2 text-sm font-medium sm:inline-flex">Account</Link>
          <Link href="/contribute" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">+ Add Answer</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/explore" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to explore
        </Link>

        <section className="answer-hero mb-8 rounded-[34px] p-6 md:p-9" style={{ "--answer-accent": answer.modelColor } as CSSProperties}>
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Link href={`/categories/${categorySlug(answer.category)}`} className="badge" style={{ background: "rgba(99,102,241,0.18)", color: "#c4b5fd" }}>
                  {answer.category}
                </Link>
                <Link href={`/models/${modelSlug(answer.model)}`} className="badge" style={{ background: `${answer.modelColor}22`, color: answer.modelColor }}>
                  {answer.model}
                </Link>
                <span className="badge border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">Cached answer</span>
              </div>
              <h1 className="max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-white md:text-6xl">{answer.prompt}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/52">
                A reusable AI answer archived as a public knowledge page, with model attribution, category context, and related discovery paths.
              </p>
            </div>

            <div className="answer-proof-card">
              <Quote size={22} className="text-cyan-200" />
              <p className="mt-4 text-sm leading-relaxed text-white/58">
                Searchable once, reusable many times. This is the core Divoly loop.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-bold text-yellow-300">{answer.upvotes}</p>
                  <p className="text-xs text-white/35">helpful votes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{answer.views.toLocaleString()}</p>
                  <p className="text-xs text-white/35">views</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <section className="answer-article-shell rounded-[28px] p-5 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Answer</p>
                <p className="mt-2 text-sm text-white/35">
                  Generated with {answer.model}, contributed by{" "}
                  {showContributorLink && answer.user?.name ? (
                    <Link href={`/contributors/${contributorSlug(answer.user.name)}`} className="text-orange-200 hover:text-amber-100">
                      @{answer.user.name}
                    </Link>
                  ) : (
                    contributorName
                  )}
                  .
                </p>
              </div>
              <BookOpenText size={22} className="shrink-0 text-white/25" />
            </div>

          <article className="space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-wrap text-[15px] leading-8 text-white/74">{paragraph}</p>
            ))}
          </article>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="answer-side-panel rounded-[24px] p-5">
              <Sparkles size={18} className="mb-3 text-cyan-300" />
              <h2 className="text-lg font-bold text-white">Save this answer</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/42">Keep it in your private library or organize it into a collection.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <AddToCollectionButton answerId={answer.id} />
                <SaveAnswerButton answerId={answer.id} />
                <ShareButton
                  title={answer.prompt}
                  text={`A reusable AI answer on Divoly: ${answer.prompt}`}
                  url={`/answers/${answerSlug(answer)}`}
                  label="Share answer"
                />
              </div>
            </div>

            <div className="answer-side-panel rounded-[24px] p-5">
              <Route size={18} className="mb-3 text-cyan-300" />
              <h2 className="text-lg font-bold text-white">Explore the answer graph</h2>
              <div className="mt-4 space-y-2">
                <Link href={categorySeoPath(answer.category)} className="answer-graph-link">Best {answer.category} answers</Link>
                <Link href={modelCategorySeoPath(answer.model, answer.category)} className="answer-graph-link">{answer.model} in {answer.category}</Link>
                <Link href={compareCategorySeoPath(answer.category)} className="answer-graph-link">Compare models for {answer.category}</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Leaf size={16} className="shrink-0 text-emerald-400" />
                <p className="text-sm font-medium text-white/68">Cached knowledge</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/45">Less waiting, fewer repeated AI calls, more reusable knowledge.</p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">Keep exploring</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Related AI answers</h2>
              </div>
              <Link href={`/categories/${categorySlug(answer.category)}`} className="text-sm text-white/40 hover:text-white">View category</Link>
            </div>
            <div className="space-y-4">
              {related.map((item) => <SeoAnswerCard key={item.id} answer={item} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
