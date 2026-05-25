import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json([], { status: 200 });

    const collections = await prisma.answerCollection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { items: true } },
        items: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { answer: true },
        },
      },
    });

    return NextResponse.json(collections);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Login to create collections" }, { status: 401 });

    const body = await req.json();
    const name = body?.name?.trim();
    const description = body?.description?.trim() || null;

    if (!name) return NextResponse.json({ error: "Collection name is required" }, { status: 400 });

    const collection = await prisma.answerCollection.create({
      data: { userId, name: name.slice(0, 80), description },
      include: { _count: { select: { items: true } }, items: true },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create collection" }, { status: 503 });
  }
}
