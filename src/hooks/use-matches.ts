"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-error";
import type { Match } from "@/lib/footystats/types";

interface UseMatchesParams {
  leagueId: number | null;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

export function useMatches(params: UseMatchesParams) {
  return useQuery({
    queryKey: ["matches", params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set("league_id", String(params.leagueId));
      if (params.dateFrom) searchParams.set("date_from", params.dateFrom);
      if (params.dateTo) searchParams.set("date_to", params.dateTo);
      if (params.page) searchParams.set("page", String(params.page));
      return apiFetch<Match[]>(`/api/matches?${searchParams.toString()}`);
    },
    enabled: params.leagueId !== null,
  });
}
