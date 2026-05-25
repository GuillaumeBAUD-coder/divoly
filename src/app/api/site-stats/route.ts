import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [answerCount, answerMeta, requests, viewTotals] = await Promise.all([
      prisma.answer.count(),
      prisma.answer.findMany({
        select: {
          model: true,
          category: true,
        },
      }),
      prisma.answerRequest.count().catch(() => 0),
      prisma.answer.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return NextResponse.json({
      answerCount,
      modelCount: new Set(answerMeta.map((answer) => answer.model)).size,
      categoryCount: new Set(answerMeta.map((answer) => answer.category)).size,
      requestCount: requests,
      totalViews: viewTotals._sum.views ?? 0,
    });
  } catch {
    return NextResponse.json({
      answerCount: 0,
      modelCount: 0,
      categoryCount: 0,
      requestCount: 0,
      totalViews: 0,
    });
  }
}
