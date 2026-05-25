"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  DatabaseZap,
  FileText,
  Globe2,
  LibraryBig,
  Lightbulb,
  LogIn,
  LogOut,
  Network,
  Radar,
  Repeat2,
  Search,
  ShieldCheck,
  Sparkles,
  Telescope,
  Trophy,
  Flame,
  Workflow,
} from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { answerSlug, contributorSlug } from "@/lib/slugs";
import { RequestAnswerCard } from "@/components/RequestAnswerCard";
import { DivolyWordmark } from "@/components/DivolyLogo";
import { PlasmaMarbleBg } from "@/components/PlasmaMarbleBg";

type Answer = {
  id: string;
  prompt: string;
  answer: string;
  model: string;
  modelColor: string;
  category: string;
  tags: string[];
  upvotes: number;
  views: number;
  user?: { name: string | null };
  createdAt: string;
};

type AnswerRequest = {
  id: string;
  query: string;
  category: string | null;
  requestCount: number;
  status: string;
};

type ContributorPreview = {
  userId: string;
  name: string;
  rank: number;
  level: string;
  reputation: number;
  answerCount: number;
  weeklyAnswerCount: number;
  topCategory: string;
  streakDays: number;
  badges: { label: string; tone: string }[];
};

type SiteStats = {
  answerCount: number;
  modelCount: number;
  categoryCount: number;
  requestCount: number;
  totalViews: number;
};

const SEARCH_SUGGESTIONS = [
  "Why are bees important?",
  "How can I save money easily?",
  "How do I improve my focus?",
  "What is compound interest?",
];

const HERO_STATS = [
  { label: "Indexed answers", key: "answerCount", icon: LibraryBig },
  { label: "AI models", key: "modelCount", icon: Network },
  { label: "Categories", key: "categoryCount", icon: Globe2 },
] satisfies Array<{
  label: string;
  key: keyof SiteStats;
  icon: typeof LibraryBig;
}>;

const TRUST_SIGNALS = [
  "No blank chat screen",
  "Search before asking again",
  "Requests reveal demand",
  "Answers become reusable pages",
];

const SCROLLY_STEPS = [
  {
    number: "01",
    title: "You ask an AI once",
    description:
      "A useful answer starts as a normal AI chat. Someone asks a specific question, gets a strong response, and realizes it should not disappear inside a private thread.",
    caption: "Private inference",
  },
  {
    number: "02",
    title: "You contribute what matters",
    description:
      "Instead of letting that answer vanish, the contributor pastes the prompt and response into Divoly. The answer becomes structured, categorized, and reusable.",
    caption: "Public contribution",
  },
  {
    number: "03",
    title: "Everyone finds it instantly",
    description:
      "The next visitor finds the answer from Divoly's public memory layer. No new inference, no empty chat screen, no repeated energy cost for the same question.",
    caption: "Cached public answer",
  },
];

const BENTO_FEATURES = [
  {
    area: "search",
    icon: Search,
    title: "Search answers, not empty chats",
    description:
      "Divoly starts where most AI tools stop: with answers that already exist, are readable, and can be found again.",
    accent: "249, 115, 22",
    detail: "Instant discovery",
  },
  {
    area: "demand",
    icon: Radar,
    title: "Demand becomes visible",
    description:
      "Requests show what people actually want answered next, so contributors do not guess what content matters.",
    accent: "251, 146, 60",
    detail: "Request marketplace",
  },
  {
    area: "cache",
    icon: Repeat2,
    title: "Reuse beats regeneration",
    description:
      "A strong public answer can serve thousands of future visitors without repeating the same AI inference.",
    accent: "249, 115, 22",
    detail: "Cached public memory",
  },
  {
    area: "models",
    icon: Telescope,
    title: "Compare model coverage",
    description:
      "Answers are organized by model, category, and topic, making Divoly useful as a public AI answer index.",
    accent: "245, 158, 11",
    detail: "Model pages",
  },
  {
    area: "contribute",
    icon: Workflow,
    title: "Contribution loop",
    description:
      "Users can turn useful private AI replies into durable public pages with prompt, answer, model, and category.",
    accent: "251, 191, 36",
    detail: "Prompt to page",
  },
  {
    area: "trust",
    icon: ShieldCheck,
    title: "Less noise by design",
    description:
      "Saved answers, votes, requests, and categories create signals that help the best answers rise over time.",
    accent: "251, 146, 60",
    detail: "Ranking signals",
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const ph = usePostHog();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Answer[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<Answer[]>([]);
  const [requests, setRequests] = useState<AnswerRequest[]>([]);
  const [contributors, setContributors] = useState<ContributorPreview[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch("/api/answers?sort=date")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setRecent(Array.isArray(data) ? data.slice(0, 6) : []))
        .catch(() => setRecent([])),
      fetch("/api/requests?sort=popular&limit=6")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setRequests(Array.isArray(data) ? data : []))
        .catch(() => setRequests([])),
      fetch("/api/contributors?period=all&limit=3")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setContributors(Array.isArray(data) ? data : []))
        .catch(() => setContributors([])),
      fetch("/api/site-stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setSiteStats(data && typeof data === "object" ? data : null))
        .catch(() => setSiteStats(null)),
    ]);
  }, []);

  async function performSearch(nextQuery: string) {
    const trimmedQuery = nextQuery.trim();
    if (!trimmedQuery) {
      return;
    }

    setLoading(true);
    setSearchFocused(false);
    ph?.capture("search", { query: trimmedQuery });

    try {
      const res = await fetch(`/api/answers?q=${encodeURIComponent(trimmedQuery)}`);
      const data = res.ok ? await res.json() : [];
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await performSearch(query);
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Divoly",
    url: "https://www.divoly.com",
    description: "Crowdsourced library of real AI responses. Search once, find reusable answers instantly.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://www.divoly.com/explore?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Divoly",
    url: "https://www.divoly.com",
    logo: "https://www.divoly.com/favicon-32.png",
    sameAs: [],
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#07070f]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/">
          <DivolyWordmark height={34} />
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-white/50 md:flex">
          <Link href="/explore" className="transition-colors hover:text-white">
            Explore
          </Link>
          <Link href="/requests" className="transition-colors hover:text-white">
            Requests
          </Link>
          <Link href="/contributors" className="transition-colors hover:text-white">
            Contributors
          </Link>
          <Link href="#how-it-works" className="transition-colors hover:text-white">
            How It Works
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm text-white/40 sm:inline">
                Hi, {session.user.name?.split(" ")[0]}
              </span>
              <Link href="/saved" className="btn-ghost hidden rounded-full px-4 py-2 text-sm sm:inline-flex">
                Saved
              </Link>
              <Link href="/account" className="btn-ghost hidden rounded-full px-4 py-2 text-sm lg:inline-flex">
                Account
              </Link>
              <Link href="/contribute" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
                + Add Answer
              </Link>
              <button onClick={() => signOut()} className="glass btn-ghost rounded-full p-2">
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm sm:flex"
              >
                <LogIn size={14} /> Sign in
              </Link>
              <Link href="/register" className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold">
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="relative overflow-hidden">
        {/* Plasma Marble shader — full-bleed background */}
        <div className="absolute inset-0" style={{ opacity: 0.55 }}>
          <PlasmaMarbleBg />
        </div>
        {/* bottom fade into page bg */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#07070f]" />

        <div className="pointer-events-none absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-300/14 blur-[90px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-28 text-center lg:pt-32">
          <div>
            <div className="neon-border fade-up relative mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-orange-200 glass">
              <CheckCircle2 size={14} className="text-orange-300" />
              <span className="font-medium tracking-wide">Search AI answers, not empty chats</span>
            </div>

            <h1
              className="fade-up relative mx-auto mb-6 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-white md:text-7xl lg:text-[86px]"
              style={{ animationDelay: "0.1s" }}
            >
              <span>The public memory layer</span>
              <br />
              <span className="gradient-text">for AI answers.</span>
            </h1>

            <p
              className="fade-up relative mx-auto mb-8 max-w-2xl text-lg font-light leading-relaxed text-white/58 md:text-xl"
              style={{ animationDelay: "0.2s" }}
            >
              Divoly turns useful AI replies into searchable, ranked, reusable pages. Find what someone already asked, compare model coverage, or request what is missing.
            </p>

            <div className="mx-auto mb-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {HERO_STATS.map((stat) => {
                const Icon = stat.icon;
                const value = siteStats ? siteStats[stat.key].toLocaleString() : "—";
                return (
                  <div key={stat.label} className="startup-metric-card">
                    <Icon size={16} className="text-orange-300" />
                    <p className="mt-3 text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-white/38">{stat.label}</p>
                  </div>
                );
              })}
            </div>

        <div className="fade-up relative z-30 mx-auto max-w-3xl" style={{ animationDelay: "0.3s" }}>
          <form onSubmit={handleSearch} className="group relative">
            <div
              className={`flex flex-col gap-3 rounded-[2rem] p-2.5 transition-all duration-300 sm:flex-row ${searchFocused ? "glass-super" : "glass"}`}
              style={{
                boxShadow: searchFocused ? "0 0 60px rgba(249,115,22,0.16)" : "0 0 40px rgba(234,88,12,0.07)",
                border: searchFocused ? "1px solid rgba(249,115,22,0.42)" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="relative flex-1">
                <Search
                  size={22}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? "text-orange-300" : "text-white/30"}`}
                />
                <input
                  className="w-full bg-transparent py-4 pl-14 pr-4 text-lg font-medium text-white placeholder:text-white/20 focus:outline-none md:text-xl"
                  placeholder="Search a useful answer that may already exist..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[1.5rem] bg-white px-8 py-4 font-bold text-black shadow-lg shadow-white/10 transition-transform hover:scale-[1.02] hover:bg-gray-100 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                ) : (
                  <ArrowRight size={20} />
                )}
              </button>
            </div>

            {searchFocused && !query && (
              <div className="glass-super absolute left-0 right-0 top-full z-40 mt-3 rounded-3xl border border-white/10 p-4 text-left shadow-2xl">
                <div className="px-4 pb-3 text-xs font-semibold uppercase tracking-wider text-orange-300">
                  Popular searches
                </div>
                <div className="space-y-1">
                  {SEARCH_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(suggestion);
                        void performSearch(suggestion);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <Search size={14} className="text-white/30" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-white/42">
            {TRUST_SIGNALS.map((signal) => (
              <span key={signal} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                {signal}
              </span>
            ))}
          </div>
        </div>
          </div>
        </div>

        {searched && (
          <div className="relative z-20 mx-auto max-w-5xl px-6 pb-10">
            <div className="mb-6 mt-4 text-left fade-up">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                <Sparkles size={20} className="text-orange-300" />
                Results for &quot;{query}&quot;
              </h3>
              {results.length === 0 ? (
                <RequestAnswerCard
                  key={query}
                  compact
                  initialQuery={query}
                  title="No answer found yet"
                  description="Turn this search into a request so contributors know what Divoly should have next."
                />
              ) : (
                <div className="space-y-4">
                  {results.map((answer) => (
                    <AnswerCard key={answer.id} answer={answer} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="relative overflow-visible border-t border-white/5 bg-[#0a0a14] py-24">
        <section className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Recently Added</p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">Real answers already in the library.</h2>
            </div>
            <Link href="/explore" className="text-sm font-medium text-orange-300 transition-colors hover:text-amber-200">
              Explore all answers
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-white/45">
              No answers yet. Add the first useful answer to start the library.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recent.map((answer) => (
                <AnswerCard key={answer.id} answer={answer} compact />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto mt-24 max-w-6xl px-6">
          <div className="mb-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Browse Categories</p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">Wide scope, but only useful answers.</h2>
            <p className="mt-4 max-w-2xl text-white/55">
              Divoly can stay broad without becoming noisy. The library works when answers are reusable, readable, and worth finding again.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={`/best-ai-answers/${category.name.toLowerCase()}`}
                className="category-lift-card flex items-center justify-between rounded-2xl p-5 text-left"
              >
                <div>
                  <p className="text-sm text-white/45">Category</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </h3>
                </div>
                <ChevronRight size={18} className="text-white/25" />
              </Link>
            ))}
          </div>
        </section>

        <WhyDivolyBento />

        <ContributorLeaguePreview contributors={contributors} />

        <section id="requests" className="mx-auto mt-24 max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card rounded-[2rem] p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Most Requested</p>
                  <h2 className="text-3xl font-bold text-white">What people want Divoly to answer next.</h2>
                </div>
                <Link href="/requests" className="hidden text-sm font-medium text-orange-300 transition-colors hover:text-amber-200 sm:inline">
                  View all
                </Link>
              </div>
              <p className="mt-4 max-w-2xl text-white/55">
                Requests turn missing searches into product direction. They tell you what people actually came here to find.
              </p>

              <div className="mt-8 space-y-3">
                {requests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">
                    No requests yet. Search for something and request it if Divoly does not have it.
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-medium leading-relaxed text-white">{request.query}</h3>
                          <div className="mt-2 flex items-center gap-3 text-xs text-white/35">
                            <span>{request.requestCount} request{request.requestCount > 1 ? "s" : ""}</span>
                            {request.category ? <span>{request.category}</span> : null}
                          </div>
                        </div>
                        <span className="rounded-full bg-orange-400/10 px-3 py-1 text-xs font-semibold text-orange-200">
                          Open
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-super rounded-[2rem] border border-white/10 p-8 md:p-10">
              <MessageSquarePlusText />
              <Link href="/requests" className="btn-primary mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-medium">
                Open requests page
              </Link>
            </div>
          </div>
        </section>

        <ScrollytellingHowItWorks />
      </div>

      <footer className="glass border-t border-white/5 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <DivolyWordmark height={28} />
          <div className="flex items-center gap-8 text-sm font-medium text-white/40">
            <Link href="/explore" className="transition-colors hover:text-white">
              Explore
            </Link>
            <Link href="/requests" className="transition-colors hover:text-white">
              Requests
            </Link>
            <Link href="/contributors" className="transition-colors hover:text-white">
              Contributors
            </Link>
            <Link href="/contribute" className="transition-colors hover:text-white">
              Contribute
            </Link>
            <Link href="/about" className="transition-colors hover:text-white">
              About
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/legal" className="transition-colors hover:text-white">
              Legal
            </Link>
          </div>
          <p className="text-xs text-white/20">© 2026 divoly.com · useful answers, shared publicly.</p>
        </div>
      </footer>
    </div>
  );
}

function WhyDivolyBento() {
  function handleGlowMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  return (
    <section className="mx-auto mt-24 max-w-7xl px-6">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-orange-200">
            <Lightbulb size={15} />
            Why Divoly
          </div>
          <h2 className="max-w-3xl text-4xl font-bold tracking-[-0.045em] text-white md:text-5xl">
            A public layer for answers people should not ask twice.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-7 text-white/48">
          Divoly is not another blank AI box. It is a searchable memory layer built from real prompts, real answers, and visible demand.
        </p>
      </div>

      <div className="bento-grid">
        {BENTO_FEATURES.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.area}
              className={`bento-card bento-card-${feature.area}`}
              onMouseMove={handleGlowMove}
              style={{ "--bento-rgb": feature.accent } as CSSProperties}
            >
              <div className="bento-card-glow" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="bento-icon">
                    <Icon size={22} />
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-white/30">{feature.detail}</p>
                  <h3 className="mt-3 max-w-lg text-2xl font-bold tracking-[-0.035em] text-white md:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">{feature.description}</p>
                </div>

                <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ContributorLeaguePreview({ contributors }: { contributors: ContributorPreview[] }) {
  const leader = contributors[0];

  return (
    <section className="mx-auto mt-24 max-w-6xl px-6">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-4 py-2 text-sm font-semibold text-orange-100">
            <Trophy size={15} />
            Contributor league
          </div>
          <h2 className="max-w-2xl text-4xl font-bold tracking-[-0.045em] text-white md:text-5xl">
            Reputation turns contribution into a game.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/50">
            Contributors earn reputation from useful answers, helpful votes, views, category expertise, streaks, and weekly momentum.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contributors" className="btn-primary inline-flex rounded-full px-5 py-3 text-sm font-semibold">
              View leaderboard
            </Link>
            <Link href="/contribute" className="btn-ghost inline-flex rounded-full px-5 py-3 text-sm font-semibold">
              Add an answer
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-orange-300/15 bg-[radial-gradient(circle_at_15%_0%,rgba(249,115,22,0.18),transparent_18rem),linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 shadow-2xl shadow-orange-950/15">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-orange-200/55">Top contributors</p>
              <h3 className="mt-2 text-2xl font-bold text-white">This community has a scoreboard.</h3>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-black/20 p-3 text-orange-200 sm:block">
              <Flame size={22} />
            </div>
          </div>

          {contributors.length > 0 ? (
            <div className="space-y-3">
              {contributors.map((contributor) => (
                <Link
                  key={contributor.userId}
                  href={`/contributors/${contributorSlug(contributor.name)}`}
                  className="block rounded-2xl border border-white/8 bg-black/18 p-4 transition-colors hover:border-orange-300/25 hover:bg-orange-300/[0.055]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-200 text-sm font-black text-black">
                      #{contributor.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-white">{contributor.name}</h4>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-bold text-white/45">
                          {contributor.level}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/35">
                        {contributor.answerCount} answers · {contributor.topCategory} · {contributor.streakDays}d streak
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-orange-200">{contributor.reputation.toLocaleString()}</p>
                      <p className="text-[11px] text-white/30">rep</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/12 p-8 text-center">
              <Trophy size={24} className="mx-auto mb-3 text-white/25" />
              <h3 className="font-bold text-white">No leaderboard yet</h3>
              <p className="mt-2 text-sm text-white/42">The first real contributors will appear here automatically.</p>
            </div>
          )}

          {leader ? (
            <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-100/60">Current leader</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                <span className="font-bold text-white">{leader.name}</span> leads with {leader.reputation.toLocaleString()} reputation and a strongest category in {leader.topCategory}.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ScrollytellingHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;

    function updateFromScroll() {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollableDistance = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(0.999, Math.max(0, -rect.top / scrollableDistance));
      const nextStep = Math.min(SCROLLY_STEPS.length - 1, Math.floor(progress * SCROLLY_STEPS.length));

      setActiveStep(nextStep);
    }

    function onScroll() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateFromScroll);
    }

    updateFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="relative mx-auto mt-28 min-h-[360vh] max-w-7xl px-6">
      <div className="sticky top-0 flex min-h-screen items-center py-16">
        <div className="w-full">
          <div className="mb-10 max-w-3xl lg:mb-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-300">How It Works</p>
            <h2 className="text-4xl font-bold tracking-[-0.045em] text-white md:text-6xl">
              One AI answer becomes public memory.
            </h2>
          </div>

          <div className="scrollytelling-container grid items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="text-column relative min-h-[34rem]">
              <div className="absolute left-0 top-10 hidden h-[26rem] w-px bg-white/10 md:block">
                <div
                  className="w-px bg-orange-300 shadow-[0_0_24px_rgba(249,115,22,0.55)] transition-all duration-700"
                  style={{ height: `${((activeStep + 1) / SCROLLY_STEPS.length) * 100}%` }}
                />
              </div>

              {SCROLLY_STEPS.map((step, index) => (
                <div
                  key={step.number}
                  className={`absolute left-0 top-1/2 w-full -translate-y-1/2 pl-0 transition-all duration-700 md:pl-8 ${
                    activeStep === index
                      ? "translate-x-0 opacity-100 blur-0"
                      : index < activeStep
                        ? "-translate-y-[72%] opacity-0 blur-sm"
                        : "-translate-y-[28%] opacity-0 blur-sm"
                  }`}
                >
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-black transition-all duration-500 ${
                      activeStep === index
                        ? "border-orange-300/35 bg-orange-300/15 text-orange-100 shadow-[0_0_38px_rgba(249,115,22,0.22)]"
                        : "border-white/10 bg-white/[0.035] text-white/35"
                    }`}
                  >
                    {step.number}
                  </div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/32">{step.caption}</p>
                  <h3 className="max-w-xl text-3xl font-bold tracking-[-0.035em] text-white md:text-5xl">{step.title}</h3>
                  <p className="mt-5 max-w-xl text-base leading-8 text-white/55 md:text-lg">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="visual-column flex items-center">
              <ScrollyMockBrowser activeStep={activeStep} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScrollyMockBrowser({ activeStep }: { activeStep: number }) {
  return (
    <div className="mock-browser relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/12 bg-[#090d18]/95 shadow-2xl shadow-orange-950/25">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-300/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-300/80" />
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-xs font-medium text-white/35">
          {activeStep === 0 ? "ai-chat.local" : activeStep === 1 ? "divoly.com/contribute" : "divoly.com/answers"}
        </div>
      </div>

      <div className="relative min-h-[430px] p-5 md:min-h-[520px] md:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,rgba(249,115,22,0.13),transparent_16rem),radial-gradient(circle_at_78%_20%,rgba(251,146,60,0.1),transparent_18rem)]" />
        <AIChatScene active={activeStep === 0} />
        <ContributeScene active={activeStep === 1} />
        <CachedAnswerScene active={activeStep === 2} />
      </div>
    </div>
  );
}

function AIChatScene({ active }: { active: boolean }) {
  return (
    <div
      className={`absolute inset-5 transition-all duration-700 md:inset-7 ${
        active ? "translate-x-0 opacity-100 blur-0" : "-translate-x-6 opacity-0 blur-sm"
      }`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-orange-200">
          <Bot size={19} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AI Chat</p>
          <p className="text-xs text-white/35">New inference running</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="ml-auto max-w-[88%] rounded-[1.35rem] rounded-tr-md border border-orange-300/20 bg-orange-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-200/70">You ask</p>
          <p className="mt-2 overflow-hidden whitespace-nowrap text-sm font-medium text-white md:text-base">
            <span className={active ? "scrolly-typewriter" : ""}>What is GPT-4 energy consumption?</span>
          </p>
        </div>

        <div className="max-w-[92%] rounded-[1.35rem] rounded-tl-md border border-white/10 bg-white/[0.055] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-white/35">
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-300" />
            Generating response
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-white/12" />
            <div className="h-3 w-[92%] rounded-full bg-white/10" />
            <div className="h-3 w-[74%] rounded-full bg-white/8" />
          </div>
          <p className="mt-5 text-sm leading-6 text-white/62">
            The exact energy use depends on model size, hardware, region, and request length. A practical estimate should compare repeated inference against cached access...
          </p>
        </div>
      </div>
    </div>
  );
}

function ContributeScene({ active }: { active: boolean }) {
  return (
    <div
      className={`absolute inset-5 transition-all duration-700 md:inset-7 ${
        active ? "translate-x-0 opacity-100 blur-0" : "translate-x-6 opacity-0 blur-sm"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-300/10 text-orange-200">
            <ClipboardCheck size={19} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Divoly contribution</p>
            <p className="text-xs text-white/35">Prompt + answer become structured</p>
          </div>
        </div>
        <span className="rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1 text-xs font-semibold text-orange-200">
          Paste
        </span>
      </div>

      <div className="relative mb-4 rounded-[1.35rem] border border-orange-300/12 bg-orange-300/[0.045] p-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/65">
          <Bot size={13} />
          Source AI answer
        </div>
        <div className={`mt-3 space-y-2 ${active ? "scrolly-copy-source" : ""}`}>
          <div className="h-2.5 w-full rounded-full bg-white/18" />
          <div className="h-2.5 w-[88%] rounded-full bg-white/14" />
          <div className="h-2.5 w-[70%] rounded-full bg-white/10" />
        </div>
        <div className={`scrolly-transfer-card ${active ? "scrolly-transfer-card-active" : ""}`}>
          <FileText size={13} />
          copied response
        </div>
      </div>

      <div className="relative mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-[0.22em] text-white/30">Divoly editor</label>
          <span className={`rounded-full bg-orange-300/10 px-2.5 py-1 text-[11px] font-bold text-orange-200 transition-all delay-700 duration-500 ${active ? "opacity-100" : "opacity-0"}`}>
            pasted
          </span>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/25">Prompt</p>
          <p className="mt-2 text-sm text-white/78">What is GPT-4 energy consumption?</p>
        </div>

        <div className="mt-3 min-h-32 overflow-hidden rounded-2xl border border-orange-300/12 bg-orange-300/[0.045] p-4 text-sm leading-6 text-white/66">
          <div className={active ? "scrolly-paste-reveal" : ""}>
            The exact energy use depends on model size, hardware, region, and request length. A useful way to think about it is: one high-quality answer can become reusable public knowledge instead of being regenerated every time...
          </div>
        </div>
        <div
          className={`absolute -right-3 top-28 rounded-2xl border border-orange-300/25 bg-orange-300/12 px-4 py-3 text-xs font-semibold text-orange-100 shadow-2xl shadow-orange-950/30 transition-all delay-200 duration-700 ${
            active ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
          }`}
        >
          Drag/drop into Divoly
        </div>
      </div>
    </div>
  );
}

function CachedAnswerScene({ active }: { active: boolean }) {
  return (
    <div
      className={`absolute inset-5 transition-all duration-700 md:inset-7 ${
        active ? "translate-y-0 opacity-100 blur-0" : "translate-y-6 opacity-0 blur-sm"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-300/10 text-orange-200">
            <DatabaseZap size={19} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Divoly memory</p>
            <p className="text-xs text-white/35">No new inference needed</p>
          </div>
        </div>
        <span className="rounded-full border border-orange-300/25 bg-orange-300/12 px-3 py-1 text-xs font-bold text-orange-200">
          18ms cached
        </span>
      </div>

      <div className="mb-4 rounded-[1.4rem] border border-white/10 bg-black/20 p-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <Search size={15} className="text-white/35" />
          <span className="overflow-hidden whitespace-nowrap text-sm text-white/72">
            <span className={active ? "scrolly-search-typewriter" : ""}>What is GPT-4 energy consumption?</span>
          </span>
        </div>
      </div>

      <div className="relative rounded-[1.7rem] border border-orange-300/20 bg-gradient-to-br from-orange-300/[0.12] to-white/[0.035] p-5 shadow-[0_0_80px_rgba(249,115,22,0.13)]">
        <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-300/20 blur-3xl ${active ? "animate-pulse" : ""}`} />
        <div className={`scrolly-cache-ring ${active ? "scrolly-cache-ring-active" : ""}`} />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-200">
            <FileText size={14} />
            Public answer page
          </div>
          <h3 className={`text-2xl font-bold tracking-[-0.03em] text-white ${active ? "scrolly-result-pop" : ""}`}>
            What is GPT-4 energy consumption?
          </h3>
          <p className={`mt-4 text-sm leading-7 text-white/62 ${active ? "scrolly-result-fade" : ""}`}>
            The answer is already indexed, ranked, and readable. Future visitors can find it through search, model pages, or SEO without asking an AI to regenerate the same explanation.
          </p>
          <div className={`mt-5 grid gap-3 sm:grid-cols-3 ${active ? "scrolly-metric-cascade" : ""}`}>
            <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
              <p className="text-xl font-bold text-white">0</p>
              <p className="text-xs text-white/35">new prompts</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
              <p className="text-xl font-bold text-orange-200">Instant</p>
              <p className="text-xs text-white/35">answer access</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/18 p-3">
              <p className="text-xl font-bold text-orange-200">Reusable</p>
              <p className="text-xs text-white/35">public page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageSquarePlusText() {
  return (
    <div>
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-400/10 text-orange-300">
        <Sparkles size={20} />
      </div>
      <h3 className="text-xl font-semibold text-white">Requests now have their own space.</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/55">
        Browse demand, filter by category, and add missing questions from a full page instead of this homepage preview.
      </p>
    </div>
  );
}

function AnswerCard({ answer, compact = false }: { answer: Answer; compact?: boolean }) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(answer.upvotes);
  const ph = usePostHog();

  async function handleVote(e: React.MouseEvent) {
    e.preventDefault();
    ph?.capture("vote", { answer_id: answer.id });
    const res = await fetch(`/api/answers/${answer.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: 1 }),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (data.removed) {
      setUpvoted(false);
      setCount((currentCount) => currentCount - 1);
    } else {
      setUpvoted(true);
      setCount(data.upvotes ?? count + 1);
    }
  }

  return (
    <Link href={`/answers/${answerSlug(answer)}`}>
      <div className="glass-card group h-full cursor-pointer rounded-[1.5rem] p-6 transition-all duration-300 hover:border-blue-500/30">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{ background: `${answer.modelColor ?? "#3b82f6"}22`, color: answer.modelColor ?? "#3b82f6" }}
            >
              {answer.model}
            </span>
            <span className="badge border border-white/10 bg-white/5 text-zinc-400">{answer.category}</span>
          </div>
          <button
            onClick={handleVote}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              upvoted ? "bg-yellow-400/20 text-yellow-400" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            {count} helpful
          </button>
        </div>

        <h3 className="mb-3 text-lg font-semibold leading-snug text-white">{answer.prompt}</h3>
        <p className={`font-light leading-relaxed text-white/60 ${compact ? "line-clamp-2 text-sm" : "line-clamp-3 text-sm"}`}>
          {answer.answer}
        </p>
      </div>
    </Link>
  );
}
