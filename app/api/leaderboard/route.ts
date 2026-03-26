import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/client";

export async function GET() {
  const { data, error } = await supabase
    .from("leaderboard")
    .select(`
      id,
      fantasy_team_id,
      season_id,
      total_points,
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

  const rankedData = data.map((row: any, index: number) => ({
    ...row,
    rank: index + 1,
  }));

  return NextResponse.json({ data: rankedData });
}