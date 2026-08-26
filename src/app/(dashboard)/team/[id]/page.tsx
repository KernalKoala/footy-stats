"use client";

import { useParams } from "next/navigation";
import { TeamDetailContent } from "@/components/dashboard/team-detail-content";

export default function TeamPage() {
  const params = useParams();
  const teamId = Number(params.id);

  if (isNaN(teamId)) {
    return (
      <div
        role="alert"
        className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
      >
        Invalid team ID.
      </div>
    );
  }

  return <TeamDetailContent teamId={teamId} />;
}
