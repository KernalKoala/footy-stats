"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { StandingsEntry } from "@/lib/footystats/types";

function FormBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: "bg-green-500 text-white",
    D: "bg-yellow-500 text-white",
    L: "bg-red-500 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-sm text-[10px] font-bold",
        colors[result] || "bg-muted text-muted-foreground"
      )}
    >
      {result}
    </span>
  );
}

export const standingsColumns: ColumnDef<StandingsEntry, unknown>[] = [
  {
    accessorKey: "position",
    header: ({ column }) => <SortableHeader column={column} title="#" />,
    cell: ({ row }) => <span className="text-center font-medium">{row.getValue("position")}</span>,
  },
  {
    accessorKey: "teamName",
    header: "Team",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.teamImage && (
          <img
            src={row.original.teamImage}
            alt={row.original.teamName}
            className="h-5 w-5 object-contain"
          />
        )}
        <Link href={`/team/${row.original.teamId}`} className="font-medium hover:underline">
          {row.original.teamName}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "played",
    header: ({ column }) => <SortableHeader column={column} title="P" />,
  },
  {
    accessorKey: "wins",
    header: ({ column }) => <SortableHeader column={column} title="W" />,
    cell: ({ row }) => <span className="text-green-600">{row.getValue("wins")}</span>,
  },
  {
    accessorKey: "draws",
    header: ({ column }) => <SortableHeader column={column} title="D" />,
    cell: ({ row }) => <span className="text-yellow-600">{row.getValue("draws")}</span>,
  },
  {
    accessorKey: "losses",
    header: ({ column }) => <SortableHeader column={column} title="L" />,
    cell: ({ row }) => <span className="text-red-600">{row.getValue("losses")}</span>,
  },
  {
    accessorKey: "goalsFor",
    header: ({ column }) => <SortableHeader column={column} title="GF" />,
  },
  {
    accessorKey: "goalsAgainst",
    header: ({ column }) => <SortableHeader column={column} title="GA" />,
  },
  {
    accessorKey: "goalDifference",
    header: ({ column }) => <SortableHeader column={column} title="GD" />,
    cell: ({ row }) => {
      const gd = row.getValue("goalDifference") as number;
      return (
        <span className={cn(gd > 0 && "text-green-600", gd < 0 && "text-red-600")}>
          {gd > 0 ? `+${gd}` : gd}
        </span>
      );
    },
  },
  {
    accessorKey: "points",
    header: ({ column }) => <SortableHeader column={column} title="Pts" />,
    cell: ({ row }) => <span className="font-bold">{row.getValue("points")}</span>,
  },
  {
    accessorKey: "form",
    header: "Form",
    cell: ({ row }) => {
      const form = row.original.form;
      if (!form || form.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex gap-0.5">
          {form.slice(-5).map((result, i) => (
            <FormBadge key={i} result={result} />
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
];
