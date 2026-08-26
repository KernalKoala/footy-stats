"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-error";
import type { StandingsEntry } from "@/lib/footystats/types";

export function useStandings(seasonId: number | null) {
  return useQuery({
    queryKey: ["standings", seasonId],
    queryFn: () =>
      apiFetch<StandingsEntry[]>(`/api/leagues?season_id=${seasonId}&include=standings`),
    enabled: seasonId !== null,
    retry: false,
  });
}
