import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Bookmark, Search } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { SeoAnswerCard } from "@/components/SeoAnswerCard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Saved answers | Divoly",
  description: "Your private library of saved AI answers on Divoly.",
  robots: { index: false, follow: false },
};

export default async function SavedAnswersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const saved = await prisma.savedAnswer.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { answer: true },
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

      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/explore" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to explore
        </Link>

        <section className="filter-studio mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Personal library</p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">Saved answers</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                Keep the AI answers you want to reuse later. This is the first account feature that turns Divoly from a search page into a personal knowledge layer.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <Bookmark size={18} className="mb-2 text-cyan-300" />
              <p className="text-3xl font-bold text-white">{saved.length}</p>
              <p className="text-xs text-white/35">saved answers</p>
            </div>
          </div>
        </section>

        {saved.length > 0 ? (
          <section className="space-y-4">
            {saved.map((item) => <SeoAnswerCard key={item.id} answer={item.answer} />)}
          </section>
        ) : (
          <section className="filter-studio rounded-[28px] p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
              <Search size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">No saved answers yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/45">
              Open any answer and save it. Your saved list will become a private shortcut to the answers you reuse most.
            </p>
            <Link href="/explore" className="btn-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium">Find answers to save</Link>
          </section>
        )}
      </main>
    </div>
  );
}
