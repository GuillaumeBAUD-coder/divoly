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
    if (!userId) return NextResponse.json({ followed: false }, { status: 200 });

    const { id } = await params;
    const followed = await prisma.followedRequest.findUnique({
      where: { userId_requestId: { userId, requestId: id } },
      select: { id: true },
    });

    return NextResponse.json({ followed: Boolean(followed) });
  } catch {
    return NextResponse.json({ followed: false }, { status: 200 });
  }
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Login to follow requests" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.followedRequest.findUnique({
      where: { userId_requestId: { userId, requestId: id } },
      select: { id: true },
    });

    if (existing) {
      await prisma.followedRequest.delete({ where: { id: existing.id } });
      return NextResponse.json({ followed: false });
    }

    await prisma.followedRequest.create({
      data: { userId, requestId: id },
    });

    return NextResponse.json({ followed: true });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
