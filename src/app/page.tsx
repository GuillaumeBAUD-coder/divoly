"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import {
  Search, Zap, Leaf, Users, TrendingUp, ArrowRight,
  Star, ChevronRight, LogOut, LogIn, Sparkles,
  Globe, Shield, BarChart3,
} from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { DivolyWordmark, DivolyLogo } from "@/components/DivolyLogo";

type Answer = {
  id: string; prompt: string; answer: string;
  model: string; modelColor: string; category: string;
  tags: string[]; upvotes: number; views: number;
  user?: { name: string | null }; createdAt: string;
};

const TICKER_ITEMS = [
  "🧠 What is recursion?", "⚛️ How does React work?", "🌍 Why is the sky blue?",
  "💰 What is compound interest?", "🧬 How does CRISPR work?", "📐 Explain the Pythagorean theorem",
  "🔐 What is OAuth2?", "📊 What is Big O notation?", "🧪 How do vaccines work?",
  "⚡ What is quantum entanglement?", "📝 How to write a cover letter?", "🏛️ What caused WWI?",
  "🤖 What is machine learning?", "🌿 How does photosynthesis work?", "📈 What is dollar-cost averaging?",
];

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function HomePage() {
  const { data: session } = useSession();
  const ph = usePostHog();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Answer[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<Answer[]>([]);

  useEffect(() => {
    fetch("/api/answers?sort=date")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setRecent(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => {});
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    ph?.capture("search", { query });
    try {
      const res = await fetch(`/api/answers?q=${encodeURIComponent(query)}`);
      const data = res.ok ? await res.json() : [];
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    }
    setSearched(true);
    setLoading(false);
  }

  function handleCategoryClick(name: string) {
    setQuery(name);
    ph?.capture("category_click", { category: name });
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#07070f" }}>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <DivolyWordmark height={34} />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
          <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#impact" className="hover:text-white transition-colors">Impact</Link>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="text-sm text-white/40 hidden sm:inline">
                Hi, {session.user.name?.split(" ")[0]} 👋
              </span>
              <Link href="/contribute" className="btn-primary text-sm px-4 py-2 rounded-full font-medium">
                + Add Answer
              </Link>
              <button onClick={() => signOut()} className="glass btn-ghost p-2 rounded-full">
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm px-4 py-2 rounded-full flex items-center gap-1.5">
                <LogIn size={14} /> Sign in
              </Link>
              <Link href="/register" className="btn-primary text-sm px-4 py-2 rounded-full font-medium">
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative px-6 pt-28 pb-20 text-center max-w-5xl mx-auto">

        {/* Luminous Commons galaxy background — full-bleed behind hero */}
        <div
          aria-hidden
          className="hero-galaxy pointer-events-none absolute inset-x-0 top-[-120px] bottom-[-80px] overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <div
            className="absolute inset-0 galaxy-drift"
            style={{
              backgroundImage: "url(/hero-bg.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.82,
              filter: "saturate(1.05) contrast(1.02)",
            }}
          />
          {/* Soft vignette fade into page background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 36% 50%, transparent 30%, #07070f 85%)",
            }}
          />
          {/* Bottom blend into page */}
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, #07070f 100%)",
            }}
          />
        </div>

        {/* Decorative logo above headline */}
        <div className="relative flex justify-center mb-6 fade-up">
          <DivolyLogo size={80} animated />
        </div>

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-indigo-300 fade-up">
          <Sparkles size={13} className="text-yellow-400" />
          <span>Crowdsourced AI knowledge library</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs">Live</span>
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-7xl font-bold mb-6 leading-[1.08] tracking-tight fade-up" style={{ animationDelay: "0.1s" }}>
          <span className="text-white">Ask anything.</span><br />
          <span className="gradient-text">Get answers instantly.</span><br />
          <span className="text-white/60 text-4xl md:text-5xl font-semibold">Zero AI inference needed.</span>
        </h1>

        <p className="relative text-lg text-white/50 max-w-2xl mx-auto mb-4 leading-relaxed fade-up" style={{ animationDelay: "0.2s" }}>
          Divoly is a living library of real AI responses, contributed by millions of users.
          Search once, find answers that already exist. Every cached response
          <span className="text-emerald-400 font-medium"> saves energy, water, and compute</span>.
        </p>

        {/* Social proof row */}
        <div className="relative flex items-center justify-center gap-6 mb-10 fade-up" style={{ animationDelay: "0.25s" }}>
          <div className="flex items-center gap-1.5 text-sm text-white/40">
            <div className="flex -space-x-1.5">
              {["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b"].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#07070f]"
                  style={{ background: c }} />
              ))}
            </div>
            <span>48,000+ contributors</span>
          </div>
          <span className="text-white/20">·</span>
          <div className="flex items-center gap-1.5 text-sm text-white/40">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
            <span>4.8 avg rating</span>
          </div>
          <span className="text-white/20">·</span>
          <div className="flex items-center gap-1.5 text-sm text-emerald-400">
            <Leaf size={13} />
            <span>7,200 kWh saved</span>
          </div>
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto mb-6 fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex gap-3 p-2 glass rounded-2xl"
            style={{ border: "1px solid rgba(129,140,248,0.2)", boxShadow: "0 0 40px rgba(99,102,241,0.12)" }}>
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className="w-full bg-transparent text-white pl-11 pr-4 py-3.5 text-base focus:outline-none"
                placeholder="e.g. 'explain recursion' or 'what is compound interest?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary px-6 py-3.5 rounded-xl font-semibold whitespace-nowrap flex items-center gap-2 disabled:opacity-60 shrink-0">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching…
                </span>
              ) : (
                <><span className="hidden sm:inline">Search</span> <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {CATEGORIES.slice(0, 7).map((cat) => (
              <button key={cat.name} type="button"
                onClick={() => handleCategoryClick(cat.name)}
                className="glass glass-card text-xs px-3.5 py-1.5 rounded-full text-white/55 hover:text-white cursor-pointer">
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </form>

        {/* Search results */}
        {searched && (
          <div className="text-left max-w-3xl mx-auto mt-8 mb-6 fade-up">
            <p className="text-sm text-white/40 mb-4">
              {results.length === 0
                ? "No results yet. Be the first to contribute this answer!"
                : `${results.length} answer${results.length > 1 ? "s" : ""} found`}
            </p>
            {results.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">🌱</div>
                <p className="text-white/60 mb-4">This question hasn&apos;t been answered yet.</p>
                <Link href="/contribute"
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium">
                  Contribute the first answer <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((r) => <AnswerCard key={r.id} answer={r} />)}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Ticker ────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-4 border-y border-white/5 mb-24">
        <div className="absolute inset-y-0 left-0 w-20 z-10"
          style={{ background: "linear-gradient(90deg, #07070f, transparent)" }} />
        <div className="absolute inset-y-0 right-0 w-20 z-10"
          style={{ background: "linear-gradient(-90deg, #07070f, transparent)" }} />
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-sm text-white/30 px-6 whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Simple as copy, paste, search.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01", icon: "💬", color: "#6366f1",
              title: "You ask an AI",
              desc: "Ask your question to ChatGPT, Claude, Gemini, or any AI tool you already use.",
            },
            {
              step: "02", icon: "📋", color: "#8b5cf6",
              title: "You contribute the answer",
              desc: "Copy and paste the prompt + response into Divoly. Takes 30 seconds.",
            },
            {
              step: "03", icon: "🔍", color: "#38bdf8",
              title: "Everyone finds it instantly",
              desc: "Next time someone asks the same question, they get the answer. No AI query needed.",
            },
          ].map((s) => (
            <div key={s.step} className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold tracking-widest"
                  style={{ color: s.color }}>{s.step}</span>
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{s.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Impact stats ──────────────────────────────────── */}
      <section id="impact" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="glass-card rounded-3xl p-10 md:p-14 glow-pulse relative overflow-hidden">
          {/* bg decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative text-center mb-12">
            <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3">Real impact</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Every search <span className="gradient-text-green">saves the planet</span> a little.
            </h2>
            <p className="text-white/40 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              A single GPT-4 query uses ~10× more energy than a Google search. By sharing answers,
              we eliminate redundant inference at scale.
            </p>
          </div>

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Zap size={22} className="text-yellow-400" />, value: 2400000, suffix: "", label: "Queries cached", color: "#facc15" },
              { icon: <Leaf size={22} className="text-emerald-400" />, value: 7200, suffix: " kWh", label: "Energy saved", color: "#34d399" },
              { icon: <Users size={22} className="text-indigo-400" />, value: 48000, suffix: "+", label: "Contributors", color: "#818cf8" },
              { icon: <BarChart3 size={22} className="text-purple-400" />, value: 94, suffix: "%", label: "Satisfaction", color: "#c084fc" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: stat.color }}>
                  <AnimatedCounter target={stat.value} />
                  {stat.suffix}
                </div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ──────────────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3">Why Divoly</p>
          <h2 className="text-3xl font-bold text-white">Built for everyone.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <Globe size={20} className="text-cyan-400" />, title: "100% free, forever", desc: "Search and read any answer without an account. No paywalls, no limits." },
            { icon: <Shield size={20} className="text-green-400" />, title: "Community verified", desc: "Answers are upvoted by real users. The best float to the top automatically." },
            { icon: <Leaf size={20} className="text-emerald-400" />, title: "Eco-conscious", desc: "Every cached answer avoids a GPU inference. Collectively, that's megawatt-hours saved." },
            { icon: <Zap size={20} className="text-yellow-400" />, title: "Instant results", desc: "No waiting for AI to think. Pre-computed answers load in milliseconds." },
            { icon: <TrendingUp size={20} className="text-purple-400" />, title: "Grows smarter", desc: "The more people contribute, the more comprehensive the library becomes." },
            { icon: <Sparkles size={20} className="text-pink-400" />, title: "Multi-model", desc: "Compare how GPT-4, Claude, and Gemini answer the same question side by side." },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-5">
              <div className="mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent contributions ──────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-1">Fresh answers</p>
            <h2 className="text-2xl font-bold text-white">Recent contributions</h2>
          </div>
          <Link href="/explore"
            className="btn-ghost text-sm px-4 py-2 rounded-full flex items-center gap-1.5">
            Browse all <ChevronRight size={14} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-white/30 text-sm">
            No answers yet,{" "}
            <Link href="/contribute" className="text-indigo-400">be the first to contribute</Link>!
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {recent.map((a) => <AnswerCard key={a.id} answer={a} compact />)}
          </div>
        )}
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-3xl mx-auto text-center">
        <div className="glass-card rounded-3xl p-12 md:p-16 relative overflow-hidden glow-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 pointer-events-none" />
          <div className="relative">
            <div className="flex justify-center mb-5">
              <DivolyLogo size={64} animated />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Be part of the movement
            </h2>
            <p className="text-white/50 mb-8 text-base leading-relaxed max-w-md mx-auto">
              Every answer you share is one fewer AI inference. Join 48,000+ contributors
              building the world&apos;s most sustainable knowledge base.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/register"
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base">
                Create free account <ArrowRight size={18} />
              </Link>
              <Link href="/explore"
                className="btn-ghost inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base">
                Browse answers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="glass border-t border-white/5 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <DivolyWordmark height={28} />
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
            <Link href="/contribute" className="hover:text-white transition-colors">Contribute</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
          </div>
          <p className="text-white/20 text-xs">© 2026 divoly.com · Zero inference.</p>
        </div>
      </footer>
    </div>
  );
}

function AnswerCard({ answer, compact }: { answer: Answer; compact?: boolean }) {
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
    if (res.status === 401) { window.location.href = "/login"; return; }
    const data = await res.json();
    if (data.removed) { setUpvoted(false); setCount((c) => c - 1); }
    else { setUpvoted(true); setCount(data.upvotes ?? count + 1); }
  }

  return (
    <Link href={`/answer/${answer.id}`}>
      <div className="glass-card rounded-2xl p-5 cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-white font-medium text-sm leading-snug flex-1 line-clamp-2">
            {answer.prompt}
          </h3>
          <span className="badge shrink-0"
            style={{ background: (answer.modelColor ?? "#818cf8") + "22", color: answer.modelColor ?? "#818cf8" }}>
            {answer.model}
          </span>
        </div>
        {!compact && (
          <p className="text-white/50 text-xs line-clamp-2 mb-4 flex-1">{answer.answer}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <span className="badge" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
            {answer.category}
          </span>
          <button onClick={handleVote}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-yellow-400 transition-colors">
            <Star size={12} fill={upvoted ? "currentColor" : "none"}
              className={upvoted ? "text-yellow-400" : ""} />
            {count}
          </button>
        </div>
      </div>
    </Link>
  );
}
