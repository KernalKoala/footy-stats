"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LeagueSelector } from "@/components/dashboard/league-selector";
import { MatchCard } from "./match-card";
import { MatchDetail } from "./match-detail";
import { useMatches } from "@/hooks";
import type { League, Match } from "@/lib/footystats/types";

export function MatchesContent() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const {
    data: matches,
    isLoading,
    isError,
  } = useMatches({
    leagueId: selectedLeague?.id ?? null,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
  });

  const results = useMemo(() => matches?.filter((m) => m.status === "complete") ?? [], [matches]);

  const fixtures = useMemo(() => matches?.filter((m) => m.status !== "complete") ?? [], [matches]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
          <p className="text-muted-foreground">Recent results and upcoming fixtures.</p>
        </div>
        <LeagueSelector selectedLeague={selectedLeague} onSelect={setSelectedLeague} />
      </div>

      {/* Filters */}
      {selectedLeague && (
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="date-from" className="text-xs">
              From
            </Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-36"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date-to" className="text-xs">
              To
            </Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-36"
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
            >
              Clear dates
            </Button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!selectedLeague && (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Select a league above to view matches.
        </div>
      )}

      {/* Loading */}
      {selectedLeague && isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {selectedLeague && isError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Failed to load matches. Please try again.
        </div>
      )}

      {/* Tabs */}
      {selectedLeague && matches && (
        <Tabs defaultValue="results">
          <TabsList>
            <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures ({fixtures.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-4">
            {results.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No results found for the selected filters.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((match) => (
                  <MatchCard key={match.id} match={match} onClick={setSelectedMatch} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="fixtures" className="mt-4">
            {fixtures.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No upcoming fixtures found.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {fixtures.map((match) => (
                  <MatchCard key={match.id} match={match} onClick={setSelectedMatch} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Pagination */}
      {selectedLeague && matches && matches.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Match detail modal */}
      {selectedMatch && (
        <MatchDetail match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
