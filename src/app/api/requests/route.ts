import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeQuery } from "@/lib/normalizeQuery";

const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") ?? "popular";
    const status = searchParams.get("status") ?? "open";
    const limit = Math.min(Number(searchParams.get("limit") ?? "6"), MAX_LIMIT);

    const requests = await prisma.answerRequest.findMany({
      where: status === "all" ? undefined : { status },
      orderBy:
        sort === "date"
          ? [{ createdAt: "desc" }]
          : [{ requestCount: "desc" }, { updatedAt: "desc" }],
      take: Number.isFinite(limit) && limit > 0 ? limit : 6,
      include: {
        _count: {
          select: { followers: true },
        },
      },
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const query = body?.query?.trim();
    const category = body?.category?.trim() || undefined;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const existing = await prisma.answerRequest.findUnique({
      where: { normalizedQuery },
    });

    if (existing) {
      const updated = await prisma.answerRequest.update({
        where: { id: existing.id },
        data: {
          requestCount: { increment: 1 },
          category: existing.category ?? category,
          status: "open",
          userId: existing.userId ?? session?.user?.id,
        },
        include: {
          _count: {
            select: { followers: true },
          },
        },
      });

      return NextResponse.json({ created: false, request: updated });
    }

    const created = await prisma.answerRequest.create({
      data: {
        query,
        normalizedQuery,
        category,
        userId: session?.user?.id,
      },
      include: {
        _count: {
          select: { followers: true },
        },
      },
    });

    return NextResponse.json({ created: true, request: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save request" }, { status: 503 });
  }
}
