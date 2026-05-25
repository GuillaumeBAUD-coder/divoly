import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Collection | Divoly",
  description: "A private collection of AI answers on Divoly.",
  robots: { index: false, follow: false },
};

export default async function CollectionDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const collection = await prisma.answerCollection.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: { answer: true },
      },
    },
  }).catch(() => null);

  if (!collection) notFound();

  return (
    <div className="explore-bg min-h-screen">
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <div className="flex items-center gap-2">
          <Link href="/collections" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">Collections</Link>
          <Link href="/explore" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">Explore</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/collections" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to collections
        </Link>

        <section className="filter-studio mb-8 rounded-[28px] p-6 md:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Collection</p>
          <h1 className="text-4xl font-bold text-white md:text-6xl">{collection.name}</h1>
          {collection.description ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">{collection.description}</p>
          ) : null}
          <p className="mt-4 text-xs text-white/35">
            {collection.items.length} answer{collection.items.length === 1 ? "" : "s"}
          </p>
        </section>

        {collection.items.length > 0 ? (
          <section className="space-y-4">
            {collection.items.map((item) => <SeoAnswerCard key={item.id} answer={item.answer} />)}
          </section>
        ) : (
          <section className="filter-studio rounded-[28px] p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
              <FolderOpen size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">This collection is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/45">
              Open an answer and add it to this collection from the answer action bar.
            </p>
            <Link href="/explore" className="btn-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium">Find answers</Link>
          </section>
        )}
      </main>
    </div>
  );
}
