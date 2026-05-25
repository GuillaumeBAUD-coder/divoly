import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, FolderOpen, Layers, Search } from "lucide-react";
import { CreateCollectionForm } from "@/components/CreateCollectionForm";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Collections | Divoly",
  description: "Organize saved AI answers into private collections.",
  robots: { index: false, follow: false },
};

export default async function CollectionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const collections = await prisma.answerCollection.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: {
        orderBy: { createdAt: "desc" },
        take: 2,
        include: { answer: true },
      },
    },
  }).catch(() => []);

  return (
    <div className="explore-bg min-h-screen">
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <div className="flex items-center gap-2">
          <Link href="/account" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">Account</Link>
          <Link href="/explore" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">Explore</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/account" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to account
        </Link>

        <section className="filter-studio mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Private library</p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">Collections</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                Group useful answers by project, topic, or recurring question so Divoly becomes a reusable workspace instead of a flat archive.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <Layers size={18} className="mb-2 text-cyan-300" />
              <p className="text-3xl font-bold text-white">{collections.length}</p>
              <p className="text-xs text-white/35">collections</p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            {collections.length > 0 ? (
              <div className="space-y-5">
                {collections.map((collection) => (
                  <article key={collection.id} className="filter-studio rounded-[24px] p-5">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link href={`/collections/${collection.id}`} className="text-xl font-bold text-white hover:text-cyan-200">
                          {collection.name}
                        </Link>
                        {collection.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-white/45">{collection.description}</p>
                        ) : null}
                      </div>
                      <span className="badge border border-cyan-300/15 bg-cyan-300/10 text-cyan-200">
                        {collection._count.items} answer{collection._count.items === 1 ? "" : "s"}
                      </span>
                    </div>

                    {collection.items.length > 0 ? (
                      <div className="space-y-3">
                        {collection.items.map((item) => <SeoAnswerCard key={item.id} answer={item.answer} />)}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm text-white/40">
                        Empty collection. Open an answer and use “Add to collection”.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <section className="filter-studio rounded-[28px] p-8 text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                  <FolderOpen size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">No collections yet</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/45">
                  Create your first collection, then organize answers from any answer detail page.
                </p>
                <Link href="/explore" className="btn-ghost mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium">
                  <Search size={15} />
                  Find answers
                </Link>
              </section>
            )}
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <CreateCollectionForm />
          </aside>
        </div>
      </main>
    </div>
  );
}
