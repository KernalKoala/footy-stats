import { NextResponse } from "next/server";
import { getTeam, getPlayerStats, FootyStatsError } from "@/lib/footystats/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const teamId = Number(params.id);

    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const includePlayers = searchParams.get("include") === "players";
    const season = searchParams.get("season") || undefined;

    const team = await getTeam(teamId);

    if (includePlayers) {
      // Use provided season or try to get it from the team's season stats
      const seasonId =
        season ||
        (team.seasonStats[0]?.leagueId ? String(team.seasonStats[0].leagueId) : undefined);
      const players = await getPlayerStats({ teamId, season: seasonId });
      return NextResponse.json({ data: { ...team, players } });
    }

    return NextResponse.json({ data: team });
  } catch (error) {
    console.error("[API /team] Error:", error);
    if (error instanceof FootyStatsError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
