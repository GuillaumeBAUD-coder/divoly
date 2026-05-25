import { NextRequest, NextResponse } from "next/server";
import { getContributorLeaderboard } from "@/lib/contributors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period");
    const period = periodParam === "week" || periodParam === "month" || periodParam === "all" ? periodParam : "all";
    const category = searchParams.get("category") ?? undefined;
    const limit = Number(searchParams.get("limit") ?? 25);

    const contributors = await getContributorLeaderboard({
      period,
      category,
      limit: Number.isFinite(limit) ? limit : 25,
    });

    return NextResponse.json(contributors);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
