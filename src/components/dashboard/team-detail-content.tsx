"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, Target, Shield, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeam } from "@/hooks";
import { TeamFormChart } from "./team-form-chart";
import { PlayerStatsTable } from "./player-stats-table";

interface TeamDetailContentProps {
  teamId: number;
}

export function TeamDetailContent({ teamId }: TeamDetailContentProps) {
  const { data: team, isLoading, isError } = useTeam(teamId, true);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/standings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to standings
          </Link>
        </Button>
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Failed to load team data. Please try again.
        </div>
      </div>
    );
  }

  const currentSeason = team.seasonStats?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/standings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {team.image && (
          <img src={team.image} alt={team.name} className="h-16 w-16 object-contain" />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground">
            {team.country}
            {team.founded ? ` · Founded ${team.founded}` : ""}
          </p>
        </div>
      </div>

      {/* Season stats cards */}
      {currentSeason && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Record</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentSeason.wins}W {currentSeason.draws}D {currentSeason.losses}L
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentSeason.played} played · {currentSeason.points} pts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentSeason.goalsFor} / {currentSeason.goalsAgainst}
                </div>
                <p className="text-xs text-muted-foreground">Scored / Conceded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clean Sheets</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentSeason.cleanSheets}</div>
                <p className="text-xs text-muted-foreground">
                  {currentSeason.played > 0
                    ? `${((currentSeason.cleanSheets / currentSeason.played) * 100).toFixed(0)}% of matches`
                    : "—"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">BTTS</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentSeason.bttsCount}</div>
                <p className="text-xs text-muted-foreground">
                  {currentSeason.played > 0
                    ? `${((currentSeason.bttsCount / currentSeason.played) * 100).toFixed(0)}% of matches`
                    : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form chart */}
          {currentSeason.form && currentSeason.form.length > 0 && (
            <TeamFormChart stats={currentSeason} />
          )}
        </>
      )}

      {/* Player stats */}
      {team.players && team.players.length > 0 && <PlayerStatsTable players={team.players} />}

      {team.players && team.players.length === 0 && (
        <p className="text-sm text-muted-foreground">No player data available for this team.</p>
      )}
    </div>
  );
}
