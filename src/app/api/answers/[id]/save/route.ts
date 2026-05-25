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

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ saved: false }, { status: 200 });

    const { id } = await params;
    const saved = await prisma.savedAnswer.findUnique({
      where: { userId_answerId: { userId, answerId: id } },
      select: { id: true },
    });

    return NextResponse.json({ saved: Boolean(saved) });
  } catch {
    return NextResponse.json({ saved: false }, { status: 200 });
  }
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Login to save answers" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.savedAnswer.findUnique({
      where: { userId_answerId: { userId, answerId: id } },
      select: { id: true },
    });

    if (existing) {
      await prisma.savedAnswer.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.savedAnswer.create({
      data: { userId, answerId: id },
    });

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
