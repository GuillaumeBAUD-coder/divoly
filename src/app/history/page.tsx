import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Clock3, Search } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Search history | Divoly",
  description: "Your private Divoly search history.",
  robots: { index: false, follow: false },
};

function exploreHref(item: { query: string; category: string | null; model: string | null }) {
  const params = new URLSearchParams({ q: item.query });
  if (item.category) params.set("category", item.category);
  if (item.model) params.set("model", item.model);
  return `/explore?${params.toString()}`;
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const history = await prisma.searchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
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
        <Link href="/account" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowLeft size={14} /> Back to account
        </Link>

        <section className="filter-studio mb-8 rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Private signal</p>
              <h1 className="text-4xl font-bold text-white md:text-6xl">Search history</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/48">
                Reopen recent searches and filters. This helps Divoly learn what a returning user actually needs.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <Clock3 size={18} className="mb-2 text-cyan-300" />
              <p className="text-3xl font-bold text-white">{history.length}</p>
              <p className="text-xs text-white/35">recent searches</p>
            </div>
          </div>
        </section>

        {history.length > 0 ? (
          <section className="space-y-3">
            {history.map((item) => (
              <Link key={item.id} href={exploreHref(item)} className="answer-row-card block rounded-2xl p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white">{item.query}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.category ? <span className="badge border border-white/10 bg-white/5 text-zinc-400">{item.category}</span> : null}
                      {item.model ? <span className="badge border border-cyan-300/15 bg-cyan-300/10 text-cyan-200">{item.model}</span> : null}
                      <span className="text-xs text-white/32">{item.resultCount} result{item.resultCount === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                  <span className="text-xs text-white/30">{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="filter-studio rounded-[28px] p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
              <Search size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">No searches yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/45">
              Search while logged in and your recent queries will appear here.
            </p>
            <Link href="/explore" className="btn-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium">Start searching</Link>
          </section>
        )}
      </main>
    </div>
  );
}
