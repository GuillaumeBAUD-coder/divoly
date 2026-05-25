"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Star, Eye, Filter } from "lucide-react";
import { CATEGORIES, MODELS as MODEL_OPTIONS } from "@/lib/data";
import { answerSlug } from "@/lib/slugs";
import { RequestAnswerCard } from "@/components/RequestAnswerCard";
import { DivolyWordmark } from "@/components/DivolyLogo";

type Answer = {
  id: string; prompt: string; answer: string; model: string;
  modelColor: string; category: string; tags: string[];
  upvotes: number; views: number;
};

const MODEL_GROUPS = [
  {
    label: "OpenAI",
    description: "GPT models",
    accent: "#10b981",
    models: MODEL_OPTIONS.filter((model) => model.name.startsWith("GPT")),
  },
  {
    label: "Anthropic",
    description: "Claude family",
    accent: "#8b5cf6",
    models: MODEL_OPTIONS.filter((model) => model.name.startsWith("Claude")),
  },
  {
    label: "Google",
    description: "Gemini line",
    accent: "#f59e0b",
    models: MODEL_OPTIONS.filter((model) => model.name.startsWith("Gemini")),
  },
  {
    label: "China open models",
    description: "Qwen, DeepSeek, GLM, Kimi",
    accent: "#06b6d4",
    models: MODEL_OPTIONS.filter((model) =>
      ["Qwen", "DeepSeek", "GLM", "Kimi", "MiniMax", "ERNIE", "Yi"].some((prefix) =>
        model.name.startsWith(prefix),
      ),
    ),
  },
  {
    label: "Open weights",
    description: "Llama and Mistral",
    accent: "#38bdf8",
    models: MODEL_OPTIONS.filter((model) => model.name.startsWith("Llama") || model.name === "Mistral"),
  },
  {
    label: "Other",
    description: "Additional models",
    accent: "#f97316",
    models: MODEL_OPTIONS.filter((model) => model.name === "Grok 4" || model.name === "Other"),
  },
].filter((group) => group.models.length > 0);

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExplorePageContent />}>
      <ExplorePageWithSearchParams />
    </Suspense>
  );
}

function ExplorePageWithSearchParams() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get("category") ?? "All");
  const [activeModel, setActiveModel] = useState(() => searchParams.get("model") ?? "All");
  const [sortBy, setSortBy] = useState<"upvotes" | "views" | "date">("upvotes");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  return (
    <ExplorePageContent
      activeCategory={activeCategory}
      activeModel={activeModel}
      sortBy={sortBy}
      search={search}
      setActiveCategory={setActiveCategory}
      setActiveModel={setActiveModel}
      setSortBy={setSortBy}
      setSearch={setSearch}
    />
  );
}

type ExplorePageContentProps = {
  activeCategory?: string;
  activeModel?: string;
  sortBy?: "upvotes" | "views" | "date";
  search?: string;
  setActiveCategory?: (value: string) => void;
  setActiveModel?: (value: string) => void;
  setSortBy?: (value: "upvotes" | "views" | "date") => void;
  setSearch?: (value: string) => void;
};

function ExplorePageContent({
  activeCategory = "All",
  activeModel = "All",
  sortBy = "upvotes",
  search = "",
  setActiveCategory = () => {},
  setActiveModel = () => {},
  setSortBy = () => {},
  setSearch = () => {},
}: ExplorePageContentProps) {
  const { data: session } = useSession();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const activeModelOption = MODEL_OPTIONS.find((model) => model.name === activeModel);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ sort: sortBy });
    if (search) params.set("q", search);
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (activeModel !== "All") params.set("model", activeModel);

    startTransition(() => {
      void fetch(`/api/answers?${params.toString()}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (!controller.signal.aborted) {
            setAnswers(Array.isArray(data) ? data : []);
            setHasLoaded(true);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setAnswers([]);
            setHasLoaded(true);
          }
        });
    });

    return () => controller.abort();
  }, [search, activeCategory, activeModel, sortBy]);

  const loading = !hasLoaded || isPending;

  return (
    <div className="explore-bg min-h-screen">
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/saved" className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">Saved</Link>
              <Link href="/account" className="btn-ghost hidden rounded-full px-4 py-2 text-sm font-medium sm:inline-flex">Account</Link>
            </>
          ) : null}
          <Link href="/contribute" className="btn-primary text-sm px-4 py-2 rounded-full font-medium">+ Add Answer</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/50">Answer Library</p>
            <h1 className="text-4xl font-bold text-white md:text-5xl">Explore answers</h1>
            <p className="mt-3 text-sm text-white/45">{answers.length} answers matching your current view</p>
          </div>
          <div className="glass rounded-2xl px-4 py-3 text-sm text-white/55">
            <span className="text-white/30">Viewing</span>{" "}
            <span className="font-semibold text-white">{activeCategory}</span>
            <span className="mx-2 text-white/20">/</span>
            <span className="font-semibold" style={{ color: activeModelOption?.color ?? "#f0f0ff" }}>
              {activeModel}
            </span>
          </div>
        </div>

        <div className="filter-studio mb-7 rounded-[28px] p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="search-input w-full rounded-xl pl-10 pr-4 py-3 text-sm"
              placeholder="Search questions…" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <Filter size={14} className="text-white/30" />
            <span className="text-xs text-white/30">Sort:</span>
            {(["upvotes", "views", "date"] as const).map((s) => (
              <button key={s} onClick={() => setSortBy(s)}
                className="text-xs px-3 py-1 rounded-full transition-all capitalize"
                style={{ background: sortBy === s ? "rgba(99,102,241,0.2)" : "transparent", color: sortBy === s ? "#818cf8" : "rgba(255,255,255,0.4)" }}>
                {s}
              </button>
            ))}
          </div>
          </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["All", ...CATEGORIES.map(c => c.name)].map((name) => {
            const cat = CATEGORIES.find(c => c.name === name);
            return (
              <button key={name} onClick={() => setActiveCategory(name)}
                className="badge transition-all"
                style={{ background: activeCategory === name ? "rgba(99,102,241,0.24)" : "rgba(255,255,255,0.06)", color: activeCategory === name ? "#c4b5fd" : "rgba(255,255,255,0.48)", padding: "6px 14px" }}>
                {cat ? `${cat.icon} ${name}` : name}
              </button>
            );
          })}
        </div>
        </div>

        <div className="model-universe mb-8 rounded-[28px] p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/50">Model universe</h2>
              <p className="mt-1 text-xs text-white/35">Grouped by provider so the filter stays readable.</p>
            </div>
            <button
              onClick={() => setActiveModel("All")}
              className="model-all-button rounded-2xl px-4 py-3 text-left transition-all"
              data-active={activeModel === "All"}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Scope</span>
              <span className="mt-1 block text-sm font-semibold text-white">All models</span>
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {MODEL_GROUPS.map((group) => (
              <section key={group.label} className="model-family-card rounded-2xl p-3" style={{ "--family-accent": group.accent } as CSSProperties}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{group.label}</h3>
                    <p className="text-[11px] text-white/35">{group.description}</p>
                  </div>
                  <span className="rounded-full px-2 py-1 text-[10px] font-bold text-white/45" style={{ background: `${group.accent}22`, color: group.accent }}>
                    {group.models.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.models.map((model) => (
                    <button
                      key={model.name}
                      onClick={() => setActiveModel(model.name)}
                      className="model-chip transition-all"
                      data-active={activeModel === model.name}
                      style={{
                        "--model-color": model.color,
                        background: activeModel === model.name ? `${model.color}24` : "rgba(255,255,255,0.045)",
                        borderColor: activeModel === model.name ? `${model.color}88` : "rgba(255,255,255,0.08)",
                        color: activeModel === model.name ? "#fff" : "rgba(255,255,255,0.54)",
                      } as CSSProperties}
                    >
                      <span className="model-chip-dot" style={{ background: model.color }} />
                      {model.name}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-white/5 rounded mb-3 w-3/4" />
                <div className="h-3 bg-white/5 rounded w-full mb-1" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : answers.length === 0 ? (
          <RequestAnswerCard
            key={`${search}-${activeCategory}-${activeModel}-${sortBy}`}
            compact
            initialQuery={search}
            title="No answers match these filters"
            description="Request the missing answer so Divoly learns what people expected to find here."
          />
        ) : (
          <div className="space-y-4">
            {answers.map((a) => (
              <Link key={a.id} href={`/answers/${answerSlug(a)}`}>
                <div className="answer-row-card rounded-2xl p-5 cursor-pointer" style={{ "--answer-accent": a.modelColor ?? "#818cf8" } as CSSProperties}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>{a.category}</span>
                        <span className="badge" style={{ background: (a.modelColor ?? "#818cf8") + "22", color: a.modelColor ?? "#818cf8" }}>{a.model}</span>
                      </div>
                      <h3 className="text-white text-sm font-medium mb-2">{a.prompt}</h3>
                      <p className="text-white/40 text-xs line-clamp-2">{a.answer.slice(0, 140)}…</p>
                    </div>
                    <div className="shrink-0 text-right space-y-1.5">
                      <div className="flex items-center gap-1 text-xs text-yellow-400"><Star size={12} fill="currentColor" />{a.upvotes}</div>
                      <div className="flex items-center gap-1 text-xs text-white/30"><Eye size={12} />{a.views.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
