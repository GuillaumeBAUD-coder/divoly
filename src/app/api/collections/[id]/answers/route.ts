import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Login to update collections" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const answerId = body?.answerId;
    if (!answerId) return NextResponse.json({ error: "Answer id is required" }, { status: 400 });

    const collection = await prisma.answerCollection.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    const existing = await prisma.collectionItem.findUnique({
      where: { collectionId_answerId: { collectionId: id, answerId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.collectionItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false });
    }

    await prisma.collectionItem.create({
      data: { collectionId: id, answerId },
    });

    return NextResponse.json({ added: true });
  } catch {
    return NextResponse.json({ error: "Could not update collection" }, { status: 503 });
  }
}
