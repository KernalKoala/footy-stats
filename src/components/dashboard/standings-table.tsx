"use client";

import { useState } from "react";
import { LeagueSelector } from "./league-selector";
import { DataTable } from "@/components/ui/data-table";
import { standingsColumns } from "./standings-columns";
import { useStandings } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import type { League } from "@/lib/footystats/types";

export function StandingsTable() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const { data: standings, isLoading, isError } = useStandings(selectedLeague?.id ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">League Standings</h1>
          <p className="text-muted-foreground">
            Full table with sorting. Click any column header to sort.
          </p>
        </div>
        <LeagueSelector selectedLeague={selectedLeague} onSelect={setSelectedLeague} />
      </div>

      {!selectedLeague && (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Select a league above to view standings.
        </div>
      )}

      {selectedLeague && isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      )}

      {selectedLeague && isError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Failed to load standings. Please try again.
        </div>
      )}

      {selectedLeague && standings && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing standings for <strong>{selectedLeague.name}</strong> ({selectedLeague.country}
              )
            </span>
          </div>
          <DataTable columns={standingsColumns} data={standings} />
        </>
      )}
    </div>
  );
}
