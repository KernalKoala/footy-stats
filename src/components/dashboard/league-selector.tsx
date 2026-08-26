"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLeagues, usePreferences, useUpdatePreferences, toggleFavouriteLeague } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import type { League } from "@/lib/footystats/types";

interface LeagueSelectorProps {
  selectedLeague: League | null;
  onSelect: (league: League) => void;
}

export function LeagueSelector({ selectedLeague, onSelect }: LeagueSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: leagues, isLoading, isError } = useLeagues();
  const { data: preferences } = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const favouriteIds = preferences?.favourite_leagues ?? [];

  // Sort leagues: favourites first, then alphabetical
  const sortedLeagues = useMemo(() => {
    if (!leagues) return [];
    return [...leagues].sort((a, b) => {
      const aFav = favouriteIds.includes(a.id);
      const bFav = favouriteIds.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [leagues, favouriteIds]);

  function handleToggleFavourite(e: React.MouseEvent, leagueId: number) {
    e.stopPropagation();
    e.preventDefault();
    const updated = toggleFavouriteLeague(favouriteIds, leagueId);
    updatePreferences.mutate({ favourite_leagues: updated });
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-[280px]" />;
  }

  if (isError) {
    return (
      <Button variant="outline" className="w-[280px] justify-between" disabled>
        <span className="text-destructive">Failed to load leagues</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a league"
          className="w-[280px] justify-between"
        >
          {selectedLeague ? (
            <span className="truncate">
              {selectedLeague.name} ({selectedLeague.country})
            </span>
          ) : (
            <span className="text-muted-foreground">Select a league...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search leagues..." />
          <CommandList>
            <CommandEmpty>No league found.</CommandEmpty>
            <CommandGroup>
              {sortedLeagues.map((league) => {
                const isFavourite = favouriteIds.includes(league.id);
                return (
                  <CommandItem
                    key={league.id}
                    value={`${league.name} ${league.country}`}
                    onSelect={() => {
                      onSelect(league);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        selectedLeague?.id === league.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm">{league.name}</span>
                      <span className="text-xs text-muted-foreground">{league.country}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavourite(e, league.id)}
                      className="ml-1 shrink-0 p-1"
                      aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          isFavourite
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground hover:text-yellow-400"
                        )}
                      />
                    </button>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
