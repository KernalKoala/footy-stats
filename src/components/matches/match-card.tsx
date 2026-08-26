"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/footystats/types";

interface MatchCardProps {
  match: Match;
  onClick?: (match: Match) => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const isComplete = match.status === "complete";

  return (
    <Card
      className={cn("transition-colors", onClick && "cursor-pointer hover:bg-muted/50")}
      onClick={() => onClick?.(match)}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(match);
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={`${match.homeTeamName} vs ${match.awayTeamName}${isComplete ? `, ${match.homeGoals}-${match.awayGoals}` : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-1 items-center justify-end gap-2 text-right">
            <Link
              href={`/team/${match.homeTeamId}`}
              className="text-sm font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {match.homeTeamName}
            </Link>
            {match.homeTeamImage && (
              <img
                src={match.homeTeamImage}
                alt={match.homeTeamName}
                className="h-6 w-6 object-contain"
              />
            )}
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center gap-1">
            {isComplete ? (
              <span className="text-lg font-bold tabular-nums">
                {match.homeGoals} - {match.awayGoals}
              </span>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {formatTime(match.dateTimestamp)}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {formatDate(match.dateTimestamp)}
            </span>
          </div>

          {/* Away team */}
          <div className="flex flex-1 items-center gap-2">
            {match.awayTeamImage && (
              <img
                src={match.awayTeamImage}
                alt={match.awayTeamName}
                className="h-6 w-6 object-contain"
              />
            )}
            <Link
              href={`/team/${match.awayTeamId}`}
              className="text-sm font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {match.awayTeamName}
            </Link>
          </div>
        </div>

        {/* Key stats row */}
        {isComplete && (match.totalCorners !== null || match.totalCards !== null) && (
          <div className="mt-3 flex items-center justify-center gap-3 border-t pt-2">
            {match.totalCorners !== null && (
              <Badge variant="secondary" className="text-xs">
                {match.totalCorners} corners
              </Badge>
            )}
            {match.totalCards !== null && (
              <Badge variant="secondary" className="text-xs">
                {match.totalCards} cards
              </Badge>
            )}
            {match.round && (
              <Badge variant="outline" className="text-xs">
                {match.round}
              </Badge>
            )}
          </div>
        )}

        {!isComplete && match.round && (
          <div className="mt-3 flex items-center justify-center border-t pt-2">
            <Badge variant="outline" className="text-xs">
              {match.round}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
