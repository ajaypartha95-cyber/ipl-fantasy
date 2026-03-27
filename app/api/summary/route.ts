import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const [{ count: teamCount, error: teamError }, { count: playerCount, error: playerError }, { count: matchCount, error: matchError }] =
    await Promise.all([
      supabase
        .from("fantasy_teams")
        .select("*", { count: "exact", head: true })
        .eq("season_id", 1),
      supabase
        .from("players")
        .select("*", { count: "exact", head: true })
        .eq("season_id", 1),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("season_id", 1),
    ]);

  const error = teamError || playerError || matchError;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      totalTeams: teamCount ?? 0,
      totalPlayers: playerCount ?? 0,
      totalMatches: matchCount ?? 0,
    },
  });
}