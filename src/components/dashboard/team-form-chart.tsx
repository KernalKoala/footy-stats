"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamSeasonStats } from "@/lib/footystats/types";

interface TeamFormChartProps {
  stats: TeamSeasonStats;
}

const formColors: Record<string, string> = {
  W: "#22c55e",
  D: "#eab308",
  L: "#ef4444",
};

export function TeamFormChart({ stats }: TeamFormChartProps) {
  const formData = stats.form.map((result, i) => ({
    match: `M${i + 1}`,
    value: result === "W" ? 3 : result === "D" ? 1 : 0,
    result,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Form (Points per match)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="match" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 3]} ticks={[0, 1, 3]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {formData.map((entry, index) => (
                  <Cell key={index} fill={formColors[entry.result] || "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
