import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSeedEmail } from "@/lib/publicData";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const answer = await prisma.answer.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: { user: { select: { name: true, email: true } }, votes: true },
    });
    return NextResponse.json({
      ...answer,
      user: answer.user
        ? {
            name: isSeedEmail(answer.user.email) ? null : answer.user.name,
            isSeed: isSeedEmail(answer.user.email),
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
