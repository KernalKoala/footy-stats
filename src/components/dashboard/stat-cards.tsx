"use client";

import { Trophy, Target, Percent, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeagueSeason } from "@/lib/footystats/types";

interface StatCardsProps {
  season: LeagueSeason | undefined;
  isLoading: boolean;
  isError: boolean;
}

interface StatCardData {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function getStats(season: LeagueSeason): StatCardData[] {
  return [
    {
      title: "Matches Played",
      value: `${season.matchesPlayed} / ${season.totalMatches}`,
      description: "Completed this season",
      icon: <Trophy className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Avg Goals/Match",
      value: season.averageGoals.toFixed(2),
      description: "Goals per match average",
      icon: <Target className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "BTTS %",
      value: `${season.bttsPercentage.toFixed(1)}%`,
      description: "Both teams to score",
      icon: <Percent className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Clean Sheet %",
      value: `${season.cleanSheetPercentage.toFixed(1)}%`,
      description: "Matches with a clean sheet",
      icon: <Shield className="h-4 w-4 text-muted-foreground" />,
    },
  ];
}

export function StatCards({ season, isLoading, isError }: StatCardsProps) {
  if (isLoading) {
    return <StatCardsSkeleton />;
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
      >
        Failed to load league statistics. Please try again.
      </div>
    );
  }

  if (!season) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">—</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">Select a league to see stats</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = getStats(season);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
