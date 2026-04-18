"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Leaf, Info } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { DivolyWordmark } from "@/components/DivolyLogo";

const MODELS = [
  { name: "GPT-4o", color: "#10b981" },
  { name: "GPT-4", color: "#10b981" },
  { name: "Claude 3.7", color: "#818cf8" },
  { name: "Claude 3.5", color: "#818cf8" },
  { name: "Gemini 1.5", color: "#f59e0b" },
  { name: "Gemini 2.0", color: "#f59e0b" },
  { name: "Llama 3", color: "#38bdf8" },
  { name: "Mistral", color: "#fb7185" },
  { name: "Other", color: "#a1a1aa" },
];

export default function ContributePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ prompt: "", answer: "", model: "", modelColor: "#818cf8", category: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setError(data.error ?? "Submission failed.");
      return;
    }
    setStep(3);
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070f" }}>
        <div className="glass rounded-3xl p-12 text-center max-w-sm">
          <div className="text-4xl mb-4">🌿</div>
          <h2 className="text-xl font-bold text-white mb-3">Sign in to contribute to divoly</h2>
          <p className="text-white/50 text-sm mb-6">You need an account to add answers to the library.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn-primary px-6 py-3 rounded-xl text-sm font-medium">Sign in</Link>
            <Link href="/register" className="glass rounded-xl px-6 py-3 text-sm text-white/60 hover:text-white">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#07070f" }}>
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/"><DivolyWordmark height={32} /></Link>
        {session && <span className="text-sm text-white/40">{session.user.name}</span>}
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Contribute an answer</h1>
        <p className="text-white/50 mb-8 text-sm">Share a prompt + AI response you received.</p>

        {step < 3 && (
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{ background: step >= s ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.08)", color: step >= s ? "white" : "rgba(255,255,255,0.3)" }}>
                  {s}
                </div>
                <span className="text-xs text-white/40">{s === 1 ? "Prompt & Answer" : "Details"}</span>
                {s < 2 && <div className="w-12 h-px bg-white/10 mx-1" />}
              </div>
            ))}
          </div>
        )}

        {step === 3 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Contribution submitted!</h2>
            <p className="text-white/50 mb-2">Your answer is now searchable on Divoly.</p>
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 mb-8">
              <Leaf size={14} /><span>You just helped save ~0.003 kWh ♻️</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link href="/" className="btn-primary px-6 py-3 rounded-xl font-medium text-sm">Back to search</Link>
              <button onClick={() => { setStep(1); setForm({ prompt: "", answer: "", model: "", modelColor: "#818cf8", category: "", tags: "" }); }}
                className="glass rounded-xl px-6 py-3 text-sm text-white/60 hover:text-white transition-colors">
                Add another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-1">
                  <div className="flex items-start gap-3 px-4 py-2 border-b border-white/5">
                    <span className="text-xs text-white/30 uppercase tracking-wider mt-3 w-16 shrink-0">Prompt</span>
                    <textarea className="flex-1 bg-transparent text-sm text-white placeholder-white/25 resize-none py-3 focus:outline-none"
                      rows={4} placeholder="Paste the exact question you typed into the AI…"
                      value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} required />
                  </div>
                  <div className="flex items-start gap-3 px-4 py-2">
                    <span className="text-xs text-white/30 uppercase tracking-wider mt-3 w-16 shrink-0">Answer</span>
                    <textarea className="flex-1 bg-transparent text-sm text-white placeholder-white/25 resize-none py-3 focus:outline-none"
                      rows={8} placeholder="Paste the AI's full response here…"
                      value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
                  </div>
                </div>
                <div className="flex items-center gap-2 glass rounded-xl px-4 py-3">
                  <Info size={14} className="text-indigo-400 shrink-0" />
                  <p className="text-xs text-white/40">Only paste answers you personally obtained. Don&apos;t include private or sensitive info.</p>
                </div>
                <button type="button" disabled={!form.prompt || !form.answer} onClick={() => setStep(2)}
                  className="btn-primary w-full py-3.5 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-3">AI Model used</label>
                  <div className="grid grid-cols-3 gap-2">
                    {MODELS.map((m) => (
                      <button key={m.name} type="button"
                        onClick={() => setForm({ ...form, model: m.name, modelColor: m.color })}
                        className="text-sm py-2 px-3 rounded-xl transition-all text-left"
                        style={{ background: form.model === m.name ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.model === m.name ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, color: form.model === m.name ? "#818cf8" : "rgba(255,255,255,0.5)" }}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-3">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.name} type="button"
                        onClick={() => setForm({ ...form, category: cat.name })}
                        className="text-sm py-2 px-3 rounded-xl transition-all text-left"
                        style={{ background: form.category === cat.name ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.category === cat.name ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, color: form.category === cat.name ? "#818cf8" : "rgba(255,255,255,0.5)" }}>
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Tags <span className="text-white/20">(comma separated)</span></label>
                  <input className="search-input w-full rounded-xl px-4 py-3 text-sm"
                    placeholder="e.g. python, recursion, beginner"
                    value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="glass rounded-xl px-6 py-3.5 text-sm text-white/60 hover:text-white transition-colors">
                    ← Back
                  </button>
                  <button type="submit" disabled={!form.model || !form.category || loading}
                    className="btn-primary flex-1 py-3.5 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed">
                    {loading ? "Submitting…" : "Submit answer 🌿"}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
