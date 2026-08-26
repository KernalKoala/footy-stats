import { NextResponse } from "next/server";
import { getMatches, FootyStatsError } from "@/lib/footystats/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get("league_id");

    if (!leagueId) {
      return NextResponse.json({ error: "league_id is required" }, { status: 400 });
    }

    const dateFrom = searchParams.get("date_from") || undefined;
    const dateTo = searchParams.get("date_to") || undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;

    const matches = await getMatches({
      leagueId: Number(leagueId),
      dateFrom,
      dateTo,
      page,
    });

    return NextResponse.json({ data: matches });
  } catch (error) {
    console.error("[API /matches] Error:", error);
    if (error instanceof FootyStatsError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
