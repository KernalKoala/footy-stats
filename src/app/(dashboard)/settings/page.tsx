"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeagues, usePreferences, useUpdatePreferences, toggleFavouriteLeague } from "@/hooks";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: preferences, isLoading: prefsLoading } = usePreferences();
  const { data: leagues, isLoading: leaguesLoading } = useLeagues();
  const updatePreferences = useUpdatePreferences();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize form values from preferences once loaded
  if (preferences && !initialized) {
    setDateFrom(preferences.default_filters?.dateFrom || "");
    setDateTo(preferences.default_filters?.dateTo || "");
    setInitialized(true);
  }

  const favouriteLeagues = preferences?.favourite_leagues ?? [];

  function handleToggleFavourite(leagueId: number) {
    const updated = toggleFavouriteLeague(favouriteLeagues, leagueId);
    updatePreferences.mutate(
      { favourite_leagues: updated },
      {
        onSuccess: () => toast.success("Favourites updated"),
        onError: () => toast.error("Failed to update favourites"),
      }
    );
  }

  function handleSaveFilters() {
    updatePreferences.mutate(
      {
        default_filters: {
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        },
      },
      {
        onSuccess: () => toast.success("Default filters saved"),
        onError: () => toast.error("Failed to save filters"),
      }
    );
  }

  if (prefsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your favourite leagues and default filter preferences.
        </p>
      </div>

      {/* Favourite Leagues */}
      <Card>
        <CardHeader>
          <CardTitle>Favourite Leagues</CardTitle>
          <CardDescription>
            Star your favourite leagues. They&apos;ll appear first in the league selector.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaguesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {leagues?.map((league) => {
                const isFavourite = favouriteLeagues.includes(league.id);
                return (
                  <button
                    key={league.id}
                    onClick={() => handleToggleFavourite(league.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted",
                      isFavourite && "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20"
                    )}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isFavourite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{league.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{league.country}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {updatePreferences.isPending && (
            <p className="mt-2 text-xs text-muted-foreground">Saving...</p>
          )}
        </CardContent>
      </Card>

      {/* Default Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Default Filters</CardTitle>
          <CardDescription>
            Set default date range filters that will be applied when you load the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="default-date-from" className="text-xs">
                Default From Date
              </Label>
              <Input
                id="default-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="default-date-to" className="text-xs">
                Default To Date
              </Label>
              <Input
                id="default-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
          <Button onClick={handleSaveFilters} disabled={updatePreferences.isPending} size="sm">
            {updatePreferences.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
