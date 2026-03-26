import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const matchId = Number(params.id);

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, name, role, ipl_team")
    .in("ipl_team", [match.team_1, match.team_2])
    .eq("season_id", 1)
    .order("ipl_team", { ascending: true })
    .order("name", { ascending: true });

  if (playersError) {
    return NextResponse.json({ error: playersError.message }, { status: 500 });
  }

  const playerIds = players.map((p) => p.id);

  const { data: savedStats, error: savedStatsError } = await supabase
  .from("player_match_stats")
  .select(`
  player_id,
  runs,
  fours,
  sixes,
  balls_faced,
  wickets,
  maiden_overs,
  catches,
  stumpings,
  run_outs,
  is_out,
  dismissal_type,
  dot_balls,
  bowled_or_lbw_wickets,
  overs_bowled,
  runs_conceded
`)
  .eq("match_id", matchId)
  .in("player_id", playerIds);

  if (savedStatsError) {
    return NextResponse.json({ error: savedStatsError.message }, { status: 500 });
  }

  return NextResponse.json({
    match,
    players,
    savedStats,
  });
}