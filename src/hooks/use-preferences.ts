"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserPreferences, DefaultFilters } from "@/types/preferences";

async function fetchPreferences(): Promise<UserPreferences> {
  const res = await fetch("/api/preferences");
  if (!res.ok) {
    throw new Error("Failed to fetch preferences");
  }
  const json = await res.json();
  return json.data;
}

interface UpdatePreferencesInput {
  favourite_leagues?: number[];
  default_filters?: DefaultFilters;
}

async function updatePreferences(input: UpdatePreferencesInput): Promise<UserPreferences> {
  const res = await fetch("/api/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error("Failed to update preferences");
  }
  const json = await res.json();
  return json.data;
}

export function usePreferences() {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(["preferences"], data);
    },
  });
}

/** Helper to toggle a league ID in the favourites array */
export function toggleFavouriteLeague(currentFavourites: number[], leagueId: number): number[] {
  if (currentFavourites.includes(leagueId)) {
    return currentFavourites.filter((id) => id !== leagueId);
  }
  return [...currentFavourites, leagueId];
}
