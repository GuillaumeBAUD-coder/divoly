"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, MessageSquarePlus } from "lucide-react";
import { CATEGORIES } from "@/lib/data";

type RequestAnswerCardProps = {
  initialQuery?: string;
  title?: string;
  description?: string;
  compact?: boolean;
  onSubmitted?: (request: {
    id: string;
    query: string;
    category: string | null;
    status: string;
    requestCount: number;
    _count?: {
      followers: number;
    };
  }) => void;
};

export function RequestAnswerCard({
  initialQuery = "",
  title = "Request this answer",
  description = "If it is not in Divoly yet, add it to the public request list so contributors know what to answer next.",
  compact = false,
  onSubmitted,
}: RequestAnswerCardProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextQuery = query.trim();

    if (!nextQuery) {
      setError("Add a question first.");
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nextQuery, category: category || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save your request.");
        return;
      }

      setSuccess(
        data.created
          ? "Your request is now live."
          : "That request already existed, so I added your vote to it.",
      );
      if (data.request) {
        onSubmitted?.(data.request);
      }
    } catch {
      setError("Could not save your request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`glass-super border border-white/10 ${compact ? "rounded-2xl p-6" : "rounded-[2rem] p-8 md:p-10"}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
          {success ? <CheckCircle2 size={20} /> : <MessageSquarePlus size={20} />}
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.08] px-4 py-3 text-xs leading-relaxed text-amber-100/70">
          Future-ready: high-demand requests can later receive bounties, sponsors, or prioritized contributor rewards.
        </div>

        <textarea
          className="search-input min-h-28 w-full rounded-2xl px-4 py-3 text-sm"
          placeholder="What should Divoly have an answer for? Example: How do I negotiate a salary offer by email?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex flex-col gap-3 md:flex-row">
          <select
            className="search-input rounded-xl px-4 py-3 text-sm md:w-60"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Choose a category</option>
            {CATEGORIES.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium disabled:opacity-60"
          >
            {loading ? <LoaderCircle size={16} className="animate-spin" /> : <MessageSquarePlus size={16} />}
            Create demand
          </button>

          <Link
            href="/contribute"
            className="btn-ghost inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium"
          >
            Contribute instead
          </Link>
        </div>

        {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </form>
    </div>
  );
}
