import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login to vote" }, { status: 401 });
  }

  const { id } = await params;
  const { value } = await req.json(); // 1 or -1

  const existing = await prisma.vote.findUnique({
    where: { userId_answerId: { userId: session.user.id, answerId: id } },
  });

  if (existing) {
    if (existing.value === value) {
      // Toggle off: remove vote
      await prisma.vote.delete({ where: { id: existing.id } });
      await prisma.answer.update({
        where: { id },
        data: { upvotes: { increment: -value } },
      });
      return NextResponse.json({ removed: true });
    }
    // Change vote direction
    await prisma.vote.update({ where: { id: existing.id }, data: { value } });
    await prisma.answer.update({
      where: { id },
      data: { upvotes: { increment: value * 2 } },
    });
  } else {
    await prisma.vote.create({
      data: { userId: session.user.id, answerId: id, value },
    });
    await prisma.answer.update({
      where: { id },
      data: { upvotes: { increment: value } },
    });
  }

  const updated = await prisma.answer.findUnique({ where: { id }, select: { upvotes: true } });
  return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
