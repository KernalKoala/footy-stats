/**
 * FootyStats API response types.
 * Based on the football-data-api.com (FootyStats) API endpoints.
 * Base URL: https://api.football-data-api.com
 */

// ─── Generic API Response Wrapper ────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  pager?: {
    current_page: number;
    max_page: number;
    results_per_page: number;
    total_results: number;
  };
  data: T;
}

// ─── League ──────────────────────────────────────────────────────────────────

/** Raw league from /league-list endpoint */
export interface RawLeague {
  name: string;
  country: string;
  league_name: string;
  image: string;
  season: { id: number; year: number }[];
}

/** Normalized league for the app (includes latest season ID) */
export interface League {
  id: number;
  name: string;
  country: string;
  image: string;
  season: string;
}

export interface LeagueSeason {
  id: number;
  name: string;
  country: string;
  image: string;
  season: string;
  status: string;
  matchesPlayed: number;
  totalMatches: number;
  averageGoals: number;
  bttsPercentage: number;
  over25Percentage: number;
  cleanSheetPercentage: number;
}

// ─── League Table / Standings ────────────────────────────────────────────────

export interface StandingsEntry {
  position: number;
  teamId: number;
  teamName: string;
  teamImage: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
}

// ─── Match ───────────────────────────────────────────────────────────────────

export interface Match {
  id: number;
  leagueId: number;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamImage: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamImage: string;
  date: string;
  dateTimestamp: number;
  status: "complete" | "incomplete" | "suspended" | "cancelled";
  homeGoals: number | null;
  awayGoals: number | null;
  htHomeGoals: number | null;
  htAwayGoals: number | null;
  totalCorners: number | null;
  totalCards: number | null;
  round: string;
}

// ─── Team ────────────────────────────────────────────────────────────────────

export interface Team {
  id: number;
  name: string;
  image: string;
  country: string;
  founded: number | null;
  seasonStats: TeamSeasonStats[];
}

export interface TeamSeasonStats {
  leagueId: number;
  leagueName: string;
  season: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  bttsCount: number;
  over25Count: number;
  form: string[];
  points: number;
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface Player {
  id: number;
  name: string;
  nationality: string;
  position: string;
  teamId: number;
  teamName: string;
  image: string | null;
}

export interface PlayerStats {
  player: Player;
  leagueId: number;
  leagueName: string;
  season: string;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  rating: number | null;
}

// ─── Service Method Params ───────────────────────────────────────────────────

export interface GetMatchesParams {
  leagueId: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

export interface GetPlayerStatsParams {
  teamId: number;
  season?: string;
}
