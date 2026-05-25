import { prisma } from "./db";
import type { Prisma } from "@prisma/client";
import { isSeedEmail } from "@/lib/publicData";

export async function searchAnswers(query: string, category?: string, model?: string, sort = "upvotes") {
  const where: Prisma.AnswerWhereInput = {};

  if (category && category !== "All") where.category = category;
  if (model && model !== "All") where.model = model;

  if (query.trim()) {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    where.OR = terms.flatMap((term) => [
      { prompt: { contains: term, mode: "insensitive" } },
      { answer: { contains: term, mode: "insensitive" } },
      { tags: { has: term.toLowerCase() } },
      { category: { contains: term, mode: "insensitive" } },
    ]);
  }

  const orderBy: Prisma.AnswerOrderByWithRelationInput =
    sort === "views"
      ? { views: "desc" }
      : sort === "date"
      ? { createdAt: "desc" }
      : { upvotes: "desc" };

  const answers = await prisma.answer.findMany({
    where,
    orderBy,
    take: 30,
    include: { user: { select: { name: true, email: true } } },
  });

  return answers.map((answer) => ({
    ...answer,
    user: answer.user ? { name: isSeedEmail(answer.user.email) ? null : answer.user.name } : null,
  }));
}
