import { NextResponse } from "next/server";
import {
  getLeagues,
  getLeagueSeason,
  getStandings,
  FootyStatsError,
} from "@/lib/footystats/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get("season_id");

    // If season_id is provided, return league season details or standings
    if (seasonId) {
      const includeStandings = searchParams.get("include") === "standings";

      if (includeStandings) {
        const standings = await getStandings(Number(seasonId));
        return NextResponse.json({ data: standings });
      }

      const season = await getLeagueSeason(Number(seasonId));
      return NextResponse.json({ data: season });
    }

    // Otherwise return all leagues
    const leagues = await getLeagues();
    return NextResponse.json({ data: leagues });
  } catch (error) {
    console.error("[API /leagues] Error:", error);
    if (error instanceof FootyStatsError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
