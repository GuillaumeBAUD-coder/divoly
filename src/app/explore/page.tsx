"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Star, Eye, Filter } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { DivolyWordmark } from "@/components/DivolyLogo";

type Answer = {
  id: string; prompt: string; answer: string; model: string;
  modelColor: string; category: string; tags: string[];
  upvotes: number; views: number;
};

const MODELS = ["All", "GPT-4o", "Claude 3.7", "Claude 3.5", "Gemini 1.5"];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeModel, setActiveModel] = useState("All");
  const [sortBy, setSortBy] = useState<"upvotes" | "views" | "date">("upvotes");
  const [search, setSearch] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnswers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort: sortBy });
    if (search) params.set("q", search);
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (activeModel !== "All") params.set("model", activeModel);
    try {
      const res = await fetch(`/api/answers?${params}`);
      const data = res.ok ? await res.json() : [];
      setAnswers(Array.isArray(data) ? data : []);
    } catch {
      setAnswers([]);
    }
    setLoading(false);
  }, [search, activeCategory, activeModel, sortBy]);

  useEffect(() => { fetchAnswers(); }, [fetchAnswers]);

  return (
    <div className="min-h-screen" style={{ background: "#07070f" }}>
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <Link href="/contribute" className="btn-primary text-sm px-4 py-2 rounded-full font-medium">+ Add Answer</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Explore answers</h1>
        <p className="text-white/40 text-sm mb-8">{answers.length} answers in the library</p>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="search-input w-full rounded-xl pl-10 pr-4 py-3 text-sm"
              placeholder="Search questions…" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-3">
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

        <div className="flex flex-wrap gap-2 mb-4">
          {["All", ...CATEGORIES.map(c => c.name)].map((name) => {
            const cat = CATEGORIES.find(c => c.name === name);
            return (
              <button key={name} onClick={() => setActiveCategory(name)}
                className="badge transition-all"
                style={{ background: activeCategory === name ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)", color: activeCategory === name ? "#818cf8" : "rgba(255,255,255,0.4)", padding: "5px 14px" }}>
                {cat ? `${cat.icon} ${name}` : name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {MODELS.map((m) => (
            <button key={m} onClick={() => setActiveModel(m)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{ background: activeModel === m ? "rgba(255,255,255,0.1)" : "transparent", color: activeModel === m ? "white" : "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {m}
            </button>
          ))}
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
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-white/40">No answers match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((a) => (
              <Link key={a.id} href={`/answer/${a.id}`}>
                <div className="glass-card rounded-2xl p-5 cursor-pointer">
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
