import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { searchAnswers } from "@/lib/search";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "";
    const model = searchParams.get("model") ?? "";
    const sort = searchParams.get("sort") ?? "upvotes";

    const answers = await searchAnswers(q, category, model, sort);
    return NextResponse.json(answers);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, answer, model, modelColor, category, tags } = body;

    if (!prompt?.trim() || !answer?.trim() || !model || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tagList: string[] = tags
      ? tags.split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const created = await prisma.answer.create({
      data: {
        prompt: prompt.trim(),
        answer: answer.trim(),
        model,
        modelColor: modelColor ?? "#818cf8",
        category,
        tags: tagList,
        userId: session.user.id,
      },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
