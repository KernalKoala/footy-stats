"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/footystats/types";

interface MatchDetailProps {
  match: Match;
  onClose: () => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatRow({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function MatchDetail({ match, onClose }: MatchDetailProps) {
  const isComplete = match.status === "complete";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-detail-title"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-lg border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 id="match-detail-title" className="text-lg font-semibold">
            Match Details
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close match details">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Teams and Score */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-col items-center gap-2">
              {match.homeTeamImage && (
                <img
                  src={match.homeTeamImage}
                  alt={match.homeTeamName}
                  className="h-12 w-12 object-contain"
                />
              )}
              <span className="text-center text-sm font-medium">{match.homeTeamName}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              {isComplete ? (
                <>
                  <span className="text-3xl font-bold tabular-nums">
                    {match.homeGoals} - {match.awayGoals}
                  </span>
                  {match.htHomeGoals !== null && match.htAwayGoals !== null && (
                    <span className="text-xs text-muted-foreground">
                      HT: {match.htHomeGoals} - {match.htAwayGoals}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-lg font-medium text-muted-foreground">
                  {formatTime(match.dateTimestamp)}
                </span>
              )}
              <Badge variant={isComplete ? "default" : "secondary"} className="mt-1 text-xs">
                {isComplete ? "Full Time" : "Upcoming"}
              </Badge>
            </div>

            <div className="flex flex-1 flex-col items-center gap-2">
              {match.awayTeamImage && (
                <img
                  src={match.awayTeamImage}
                  alt={match.awayTeamName}
                  className="h-12 w-12 object-contain"
                />
              )}
              <span className="text-center text-sm font-medium">{match.awayTeamName}</span>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="border-t px-6 py-4">
          <StatRow label="Date" value={formatDate(match.dateTimestamp)} />
          <StatRow label="Kickoff" value={formatTime(match.dateTimestamp)} />
          {match.round && <StatRow label="Round" value={match.round} />}
          {isComplete && (
            <>
              <StatRow label="Total Corners" value={match.totalCorners} />
              <StatRow label="Total Cards" value={match.totalCards} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
