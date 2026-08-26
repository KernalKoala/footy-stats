"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import type { PlayerStats } from "@/lib/footystats/types";

const playerColumns: ColumnDef<PlayerStats, unknown>[] = [
  {
    accessorFn: (row) => row.player.name,
    id: "name",
    header: "Player",
    cell: ({ row }) => <span className="font-medium">{row.original.player.name}</span>,
  },
  {
    accessorFn: (row) => row.player.position,
    id: "position",
    header: "Pos",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.player.position}</span>
    ),
  },
  {
    accessorKey: "appearances",
    header: ({ column }) => <SortableHeader column={column} title="App" />,
  },
  {
    accessorKey: "goals",
    header: ({ column }) => <SortableHeader column={column} title="G" />,
    cell: ({ row }) => <span className="font-medium text-green-600">{row.getValue("goals")}</span>,
  },
  {
    accessorKey: "assists",
    header: ({ column }) => <SortableHeader column={column} title="A" />,
  },
  {
    accessorKey: "yellowCards",
    header: ({ column }) => <SortableHeader column={column} title="YC" />,
    cell: ({ row }) => <span className="text-yellow-600">{row.getValue("yellowCards")}</span>,
  },
  {
    accessorKey: "redCards",
    header: ({ column }) => <SortableHeader column={column} title="RC" />,
    cell: ({ row }) => <span className="text-red-600">{row.getValue("redCards")}</span>,
  },
  {
    accessorKey: "minutesPlayed",
    header: ({ column }) => <SortableHeader column={column} title="Min" />,
  },
];

interface PlayerStatsTableProps {
  players: PlayerStats[];
}

export function PlayerStatsTable({ players }: PlayerStatsTableProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Squad Stats</h3>
      <DataTable columns={playerColumns} data={players} />
    </div>
  );
}
