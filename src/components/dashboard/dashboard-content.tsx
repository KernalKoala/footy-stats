"use client";

import { useEffect, useState } from "react";
import { LeagueSelector } from "./league-selector";
import { StatCards } from "./stat-cards";
import { useLeagues, useLeagueSeason, usePreferences } from "@/hooks";
import type { League } from "@/lib/footystats/types";

export function DashboardContent() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [prefsApplied, setPrefsApplied] = useState(false);

  const { data: preferences } = usePreferences();
  const { data: leagues } = useLeagues();
  const { data: season, isLoading, isError } = useLeagueSeason(selectedLeague?.id ?? null);

  // Auto-apply: select the first favourite league on initial load
  useEffect(() => {
    if (prefsApplied || !preferences || !leagues) return;

    const favourites = preferences.favourite_leagues;
    if (favourites && favourites.length > 0) {
      const firstFav = leagues.find((l) => favourites.includes(l.id));
      if (firstFav) {
        setSelectedLeague(firstFav);
      }
    }
    setPrefsApplied(true);
  }, [preferences, leagues, prefsApplied]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your football stats overview. Select a league to get started.
          </p>
        </div>
        <LeagueSelector selectedLeague={selectedLeague} onSelect={setSelectedLeague} />
      </div>

      <StatCards season={season} isLoading={isLoading} isError={isError} />

      {selectedLeague && season && (
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">
            {selectedLeague.name} — {selectedLeague.season}
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedLeague.country} &middot; Over {season.over25Percentage.toFixed(1)}% of matches
            have over 2.5 goals
          </p>
        </div>
      )}
    </div>
  );
}
