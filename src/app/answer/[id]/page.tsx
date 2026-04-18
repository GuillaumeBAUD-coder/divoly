"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Star, Eye, Copy, Check, Leaf, Share2 } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";

type Answer = {
  id: string; prompt: string; answer: string; model: string;
  modelColor: string; category: string; tags: string[];
  upvotes: number; views: number;
  user: { name: string | null };
  createdAt: string;
};

export default function AnswerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/answers/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && !data.error) {
          setAnswer(data);
          setUpvotes(data.upvotes ?? 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleVote() {
    if (!session) { window.location.href = "/login"; return; }
    const res = await fetch(`/api/answers/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: 1 }),
    });
    const data = await res.json();
    if (data.removed) { setUpvoted(false); setUpvotes((v) => v - 1); }
    else { setUpvoted(true); setUpvotes(data.upvotes ?? upvotes + 1); }
  }

  function copyAnswer() {
    if (!answer) return;
    navigator.clipboard.writeText(answer.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070f" }}>
        <div className="text-white/30 text-sm">Loading…</div>
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070f" }}>
        <div className="text-center">
          <p className="text-white/50 mb-4">Answer not found</p>
          <Link href="/" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium">Back to search</Link>
        </div>
      </div>
    );
  }

  const paragraphs = answer.answer.split("\n\n");

  return (
    <div className="min-h-screen" style={{ background: "#07070f" }}>
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        <Link href="/contribute" className="btn-primary text-sm px-4 py-2 rounded-full font-medium">+ Add Answer</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to search
        </Link>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>{answer.category}</span>
            <span className="badge" style={{ background: (answer.modelColor ?? "#818cf8") + "22", color: answer.modelColor ?? "#818cf8" }}>{answer.model}</span>
          </div>
          <h1 className="text-xl font-semibold text-white leading-snug">{answer.prompt}</h1>
        </div>

        <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 mb-6">
          <Leaf size={16} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-white/60">
            You just saved ~<span className="text-emerald-400 font-medium">0.003 kWh</span> of energy by reading a cached answer instead of querying an AI.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Answer</span>
            <button onClick={copyAnswer}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors glass rounded-lg px-3 py-1.5">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="space-y-4">
            {paragraphs.map((para, i) => {
              if (para.startsWith("```")) {
                const code = para.replace(/```\w*\n?/, "").replace(/```$/, "");
                return (
                  <pre key={i} className="rounded-xl p-4 text-sm text-emerald-300 overflow-x-auto font-mono"
                    style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    {code}
                  </pre>
                );
              }
              return (
                <p key={i} className="text-white/70 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: para
                      .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
                      .replace(/\n/g, "<br/>"),
                  }} />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1.5"><Eye size={14} /> {answer.views.toLocaleString()} views</span>
            <span>by <span className="text-indigo-400">@{answer.user?.name ?? "contributor"}</span></span>
            <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyAnswer}
              className="flex items-center gap-1.5 glass glass-card rounded-xl px-3 py-2 text-xs text-white/50 hover:text-white">
              <Share2 size={13} /> Share
            </button>
            <button onClick={handleVote}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all"
              style={{ background: upvoted ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.05)", color: upvoted ? "#facc15" : "rgba(255,255,255,0.5)", border: `1px solid ${upvoted ? "rgba(250,204,21,0.3)" : "rgba(255,255,255,0.08)"}` }}>
              <Star size={14} fill={upvoted ? "currentColor" : "none"} />
              {upvotes} helpful
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {answer.tags.map((t) => (
            <span key={t} className="glass text-xs px-3 py-1 rounded-full text-white/40">#{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
