import { withCache, CacheTTL } from "@/lib/redis";
import type {
  ApiResponse,
  RawLeague,
  League,
  LeagueSeason,
  StandingsEntry,
  Match,
  Team,
  PlayerStats,
  GetMatchesParams,
  GetPlayerStatsParams,
} from "./types";

const BASE_URL = "https://api.football-data-api.com";

// ─── Rate Limit Tracking ─────────────────────────────────────────────────────

let requestCount = 0;
let windowStart = Date.now();
const MAX_REQUESTS_PER_HOUR = 1800;
const HOUR_MS = 60 * 60 * 1000;

function checkRateLimit(): void {
  const now = Date.now();
  if (now - windowStart > HOUR_MS) {
    requestCount = 0;
    windowStart = now;
  }

  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    throw new FootyStatsError(
      "Rate limit approaching. Please wait before making more requests.",
      429
    );
  }
}

// ─── Error Class ─────────────────────────────────────────────────────────────

export class FootyStatsError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "FootyStatsError";
  }
}

// ─── Internal Fetch Helper ───────────────────────────────────────────────────

async function fetchFromApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.FOOTYSTATS_API_KEY;
  if (!apiKey) {
    throw new FootyStatsError("FOOTYSTATS_API_KEY is not configured", 500);
  }

  checkRateLimit();

  const url = new URL(endpoint, BASE_URL);
  url.searchParams.set("key", apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  requestCount++;

  if (!response.ok) {
    if (response.status === 429) {
      throw new FootyStatsError("FootyStats API rate limit exceeded", 429);
    }
    if (response.status === 417) {
      throw new FootyStatsError("This league/season is not available on your subscription", 403);
    }
    throw new FootyStatsError(
      `FootyStats API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const json = await response.json();

  if (json.success === false) {
    throw new FootyStatsError(json.message || "FootyStats API returned an error", 400);
  }

  return json as T;
}

// ─── Data Transformers ───────────────────────────────────────────────────────

function transformLeague(raw: RawLeague): League {
  // Sort seasons by year descending
  // FootyStats year format: 2024 for calendar year, 20242025 for cross-year seasons
  const sortedSeasons = [...raw.season].sort((a, b) => b.year - a.year);

  // Pick the latest season where the ending year is <= 2025
  // This avoids future seasons that might not be accessible on the subscription
  const accessibleSeason = sortedSeasons.find((s) => {
    const endYear = s.year > 10000 ? s.year % 10000 : s.year;
    return endYear <= 2025;
  });

  const selectedSeason = accessibleSeason || sortedSeasons[sortedSeasons.length - 1];

  return {
    id: selectedSeason.id,
    name: raw.name,
    country: raw.country,
    image: raw.image,
    season: String(selectedSeason.year),
  };
}

function transformLeagueSeason(raw: any): LeagueSeason {
  return {
    id: raw.id || raw.season_id,
    name: raw.name || raw.league_name || "",
    country: raw.country || "",
    image: raw.image || "",
    season: raw.season || raw.year || "",
    status: raw.status || "active",
    matchesPlayed: raw.matchesCompleted || raw.matches_completed || 0,
    totalMatches: raw.totalMatches || raw.total_matches || 0,
    averageGoals: raw.seasonAVG_overall || raw.avg_goals_per_match || 0,
    bttsPercentage: raw.seasonBTTSPercentage || raw.btts_percentage || 0,
    over25Percentage: raw.seasonOver25Percentage_overall || raw.over25_percentage || 0,
    cleanSheetPercentage:
      raw.matchesCompleted > 0
        ? Math.round(((raw.clean_sheets_total || 0) / raw.matchesCompleted) * 100)
        : raw.clean_sheet_percentage || 0,
  };
}

function transformStandingsEntry(raw: any, index: number): StandingsEntry {
  const stats = raw.stats || {};
  const additionalInfo = stats.additional_info || {};
  const formRun = additionalInfo.formRun_overall || "";

  return {
    position: raw.table_position || index + 1,
    teamId: raw.id || 0,
    teamName: raw.cleanName || raw.name || "",
    teamImage: raw.image || "",
    played: stats.seasonMatchesPlayed_overall || 0,
    wins: stats.seasonWinsNum_overall || 0,
    draws: stats.seasonDrawsNum_overall || 0,
    losses: stats.seasonLossesNum_overall || 0,
    goalsFor: stats.seasonGoals_overall || 0,
    goalsAgainst: stats.seasonConceded_overall || 0,
    goalDifference: (stats.seasonGoals_overall || 0) - (stats.seasonConceded_overall || 0),
    points: Math.round((stats.seasonPPG_overall || 0) * (stats.seasonMatchesPlayed_overall || 0)),
    form: formRun
      ? formRun
          .slice(-5)
          .split("")
          .map((c: string) => c.toUpperCase())
      : [],
  };
}

const CDN_BASE_URL = "https://cdn.footystats.org/img/";

/**
 * Resolve a FootyStats image reference to an absolute URL.
 * The match-schedule endpoint returns relative paths (e.g. "teams/foo.png"),
 * whereas other endpoints return full CDN URLs. Normalize both to absolute.
 */
function resolveImageUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${CDN_BASE_URL}${raw.replace(/^\/+/, "")}`;
}

function transformMatch(raw: any): Match {
  return {
    id: raw.id || raw.match_id,
    leagueId: raw.competition_id || raw.league_id || 0,
    homeTeamId: raw.homeID || raw.home_id || 0,
    homeTeamName: raw.home_name || raw.homeTeam || "",
    homeTeamImage: resolveImageUrl(raw.home_image),
    awayTeamId: raw.awayID || raw.away_id || 0,
    awayTeamName: raw.away_name || raw.awayTeam || "",
    awayTeamImage: resolveImageUrl(raw.away_image),
    date: raw.date_unix ? new Date(raw.date_unix * 1000).toISOString() : raw.date || "",
    dateTimestamp: raw.date_unix || 0,
    status: raw.status || (raw.date_unix * 1000 < Date.now() ? "complete" : "incomplete"),
    homeGoals: raw.homeGoalCount ?? raw.home_goals ?? null,
    awayGoals: raw.awayGoalCount ?? raw.away_goals ?? null,
    htHomeGoals: raw.ht_goals_home ?? raw.team_a_ht_goals ?? null,
    htAwayGoals: raw.ht_goals_away ?? raw.team_b_ht_goals ?? null,
    totalCorners: raw.totalCornerCount ?? raw.total_corners ?? null,
    totalCards: raw.totalCardCount ?? raw.total_cards ?? null,
    round: raw.game_week ? `Round ${raw.game_week}` : raw.round || "",
  };
}

function transformTeam(raw: any): Team {
  const stats = raw.stats || {};
  return {
    id: raw.id || raw.team_id,
    name: raw.name || raw.cleanName || "",
    image: raw.image || "",
    country: raw.country || "",
    founded: raw.founded || null,
    seasonStats: stats.seasonWinsNum_overall
      ? [
          {
            leagueId: raw.competition_id || 0,
            leagueName: raw.league || "",
            season: raw.season || "",
            played: stats.seasonMatchesPlayed_overall || 0,
            wins: stats.seasonWinsNum_overall || 0,
            draws: stats.seasonDrawsNum_overall || 0,
            losses: stats.seasonLossesNum_overall || 0,
            goalsFor: stats.seasonGoals_overall || 0,
            goalsAgainst: stats.seasonConceded_overall || 0,
            cleanSheets: stats.seasonCS_overall || 0,
            bttsCount: stats.seasonBTTS_overall || 0,
            over25Count: stats.seasonOver25Num_overall || 0,
            form: stats.additional_info?.formRun_overall
              ? stats.additional_info.formRun_overall.split("").map((c: string) => c.toUpperCase())
              : [],
            points: Math.round(
              (stats.seasonPPG_overall || 0) * (stats.seasonMatchesPlayed_overall || 0)
            ),
          },
        ]
      : [],
  };
}

function transformTeamSeasonStats(raw: any): import("./types").TeamSeasonStats {
  return {
    leagueId: raw.competition_id || raw.league_id || 0,
    leagueName: raw.league_name || raw.competition || "",
    season: raw.season || "",
    played: raw.matches_played || raw.played || 0,
    wins: raw.wins || raw.seasonWins_overall || 0,
    draws: raw.draws || raw.seasonDraws_overall || 0,
    losses: raw.losses || raw.seasonLosses_overall || 0,
    goalsFor: raw.goals_scored || raw.seasonGoals_overall || 0,
    goalsAgainst: raw.goals_conceded || raw.seasonConceded_overall || 0,
    cleanSheets: raw.clean_sheets || raw.seasonCS_overall || 0,
    bttsCount: raw.btts_count || raw.seasonBTTS_overall || 0,
    over25Count: raw.over25_count || raw.seasonOver25_overall || 0,
    form: raw.form || [],
    points: raw.points || raw.seasonPts || 0,
  };
}

function transformPlayerStats(raw: any): PlayerStats {
  return {
    player: {
      id: raw.id || raw.player_id || 0,
      name: raw.full_name || raw.name || raw.known_as || "",
      nationality: raw.nationality || "",
      position: raw.position || "",
      teamId: raw.team_id || 0,
      teamName: raw.team_name || "",
      image: raw.image || null,
    },
    leagueId: raw.competition_id || 0,
    leagueName: raw.league_name || "",
    season: raw.season || "",
    appearances: raw.appearances || raw.matches_played || 0,
    goals: raw.goals || raw.goals_overall || 0,
    assists: raw.assists || raw.assists_overall || 0,
    yellowCards: raw.yellow_cards || raw.yellow_cards_overall || 0,
    redCards: raw.red_cards || raw.red_cards_overall || 0,
    minutesPlayed: raw.minutes_played || raw.minutes_played_overall || 0,
    rating: raw.rating || null,
  };
}

// ─── Service Methods ─────────────────────────────────────────────────────────

/**
 * Get all available leagues for the authenticated API key.
 * Uses chosen_leagues_only to only return leagues the user has subscribed to.
 * Validates each league's season is accessible before returning.
 */
export async function getLeagues(): Promise<League[]> {
  return withCache<League[]>("footystats:leagues:v3", CacheTTL.LONG, async () => {
    const response = await fetchFromApi<ApiResponse<RawLeague[]>>("/league-list", {
      chosen_leagues_only: "true",
    });

    const leagues = response.data.map(transformLeague);

    // Validate each league's season_id is accessible
    const validated = await Promise.all(
      leagues.map(async (league) => {
        try {
          await fetchFromApi<ApiResponse<unknown>>("/league-season", {
            season_id: String(league.id),
          });
          return league;
        } catch {
          // Season not accessible, try older seasons
          const raw = response.data.find((r) => r.name === league.name);
          if (!raw) return null;

          const sortedSeasons = [...raw.season].sort((a, b) => b.year - a.year);
          for (const season of sortedSeasons.slice(1)) {
            try {
              await fetchFromApi<ApiResponse<unknown>>("/league-season", {
                season_id: String(season.id),
              });
              return { ...league, id: season.id, season: String(season.year) };
            } catch {
              continue;
            }
          }
          return null;
        }
      })
    );

    return validated.filter((l): l is League => l !== null);
  });
}

/**
 * Get league season stats including team data.
 */
export async function getLeagueSeason(seasonId: number): Promise<LeagueSeason> {
  return withCache<LeagueSeason>(
    `footystats:league-season:${seasonId}`,
    CacheTTL.STANDARD,
    async () => {
      const response = await fetchFromApi<ApiResponse<unknown>>("/league-season", {
        season_id: String(seasonId),
      });
      return transformLeagueSeason(response.data);
    }
  );
}

/**
 * Get league standings/table for a given season.
 * Uses /league-teams with include=stats since /league-table may not be available.
 */
export async function getStandings(seasonId: number): Promise<StandingsEntry[]> {
  return withCache<StandingsEntry[]>(
    `footystats:standings:${seasonId}`,
    CacheTTL.STANDARD,
    async () => {
      const response = await fetchFromApi<ApiResponse<unknown[]>>("/league-teams", {
        season_id: String(seasonId),
        include: "stats",
      });
      const entries = response.data.map(transformStandingsEntry);
      // Sort by position (table_position from API)
      return entries.sort((a, b) => a.position - b.position);
    }
  );
}

/**
 * Get matches for a league with optional date range and pagination.
 */
export async function getMatches(params: GetMatchesParams): Promise<Match[]> {
  const { leagueId, dateFrom, dateTo, page } = params;
  const cacheKey = `footystats:matches:${leagueId}:${dateFrom || ""}:${dateTo || ""}:${page || 1}`;

  return withCache<Match[]>(cacheKey, CacheTTL.LIVE, async () => {
    const queryParams: Record<string, string> = {
      season_id: String(leagueId),
    };
    if (dateFrom) queryParams.date_from = dateFrom;
    if (dateTo) queryParams.date_to = dateTo;
    if (page) queryParams.page = String(page);

    const response = await fetchFromApi<ApiResponse<unknown[]>>("/league-matches", queryParams);
    return response.data.map(transformMatch);
  });
}

/**
 * Get team details and stats.
 */
export async function getTeam(teamId: number): Promise<Team> {
  return withCache<Team>(`footystats:team:${teamId}`, CacheTTL.STANDARD, async () => {
    const response = await fetchFromApi<ApiResponse<unknown[]>>("/team", {
      team_id: String(teamId),
    });
    const teamData = Array.isArray(response.data) ? response.data[0] : response.data;
    return transformTeam(teamData);
  });
}

/**
 * Get player stats for a team in a season.
 * Requires season_id since the endpoint is /league-players.
 */
export async function getPlayerStats(params: GetPlayerStatsParams): Promise<PlayerStats[]> {
  const { teamId, season } = params;
  const cacheKey = `footystats:players:${teamId}:${season || "current"}`;

  return withCache<PlayerStats[]>(cacheKey, CacheTTL.STANDARD, async () => {
    const queryParams: Record<string, string> = {
      team_id: String(teamId),
    };
    // league-players requires season_id; if not provided, skip player fetch
    if (season) {
      queryParams.season_id = season;
    } else {
      // Without season_id, we can't fetch players from this endpoint
      return [];
    }

    try {
      const response = await fetchFromApi<ApiResponse<unknown[]>>("/league-players", queryParams);
      return response.data.map(transformPlayerStats);
    } catch {
      // If player endpoint fails, return empty array rather than breaking
      return [];
    }
  });
}
