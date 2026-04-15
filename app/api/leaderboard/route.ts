import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data, error } = await supabase
    .from("leaderboard")
    .select(`
      id,
      fantasy_team_id,
      season_id,
      total_points,
      previous_rank,
      fantasy_teams (
        id,
        team_name,
        profiles (
          id,
          display_name
        )
      )
    `)
    .eq("season_id", 1)
    .order("total_points", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rankedData = (data ?? []).map((row: any, index: number) => {
    const currentRank = index + 1;
    const rankChange =
      row.previous_rank != null ? row.previous_rank - currentRank : null;
    return {
      ...row,
      rank: currentRank,
      rank_change: rankChange,
    };
  });

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id,status")
    .eq("season_id", 1);

  if (matchesError) {
    return NextResponse.json({ error: matchesError.message }, { status: 500 });
  }

  const matchesScored = (matches ?? []).filter(
    (match: any) => match.status === "completed"
  ).length;

  const totalMatches = (matches ?? []).length;

  return NextResponse.json({
    data: rankedData,
    summary: {
      matches_scored: matchesScored,
      total_matches: totalMatches,
    },
  });
}