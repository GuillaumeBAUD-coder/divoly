import Link from "next/link";
import type { CSSProperties } from "react";
import { Eye, Star } from "lucide-react";
import { answerSlug } from "@/lib/slugs";

type SeoAnswerCardProps = {
  answer: {
    id: string;
    prompt: string;
    answer: string;
    model: string;
    modelColor: string;
    category: string;
    upvotes: number;
    views: number;
  };
};

export function SeoAnswerCard({ answer }: SeoAnswerCardProps) {
  return (
    <Link href={`/answers/${answerSlug(answer)}`}>
      <article className="answer-row-card rounded-2xl p-5 cursor-pointer" style={{ "--answer-accent": answer.modelColor } as CSSProperties}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="badge" style={{ background: "rgba(99,102,241,0.15)", color: "#c4b5fd" }}>{answer.category}</span>
              <span className="badge" style={{ background: `${answer.modelColor}22`, color: answer.modelColor }}>{answer.model}</span>
            </div>
            <h2 className="mb-2 text-sm font-semibold leading-snug text-white">{answer.prompt}</h2>
            <p className="line-clamp-2 text-xs leading-relaxed text-white/42">{answer.answer.slice(0, 180)}...</p>
          </div>
          <div className="shrink-0 space-y-1.5 text-right">
            <div className="flex items-center justify-end gap-1 text-xs text-yellow-400"><Star size={12} fill="currentColor" />{answer.upvotes}</div>
            <div className="flex items-center justify-end gap-1 text-xs text-white/30"><Eye size={12} />{answer.views.toLocaleString()}</div>
          </div>
        </div>
      </article>
    </Link>
  );
}
