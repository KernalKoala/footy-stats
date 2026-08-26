"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-error";
import type { League, LeagueSeason } from "@/lib/footystats/types";

export function useLeagues() {
  return useQuery({
    queryKey: ["leagues", "v2"],
    queryFn: () => apiFetch<League[]>("/api/leagues"),
  });
}

export function useLeagueSeason(seasonId: number | null) {
  return useQuery({
    queryKey: ["league-season", seasonId],
    queryFn: () => apiFetch<LeagueSeason>(`/api/leagues?season_id=${seasonId}`),
    enabled: seasonId !== null,
    retry: false,
  });
}
