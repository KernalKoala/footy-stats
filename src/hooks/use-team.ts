"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-error";
import type { Team, PlayerStats } from "@/lib/footystats/types";

interface TeamWithPlayers extends Team {
  players?: PlayerStats[];
}

export function useTeam(teamId: number | null, includePlayers = false) {
  return useQuery({
    queryKey: ["team", teamId, includePlayers],
    queryFn: () => {
      const params = new URLSearchParams();
      if (includePlayers) params.set("include", "players");
      return apiFetch<TeamWithPlayers>(`/api/team/${teamId}?${params.toString()}`);
    },
    enabled: teamId !== null,
  });
}
