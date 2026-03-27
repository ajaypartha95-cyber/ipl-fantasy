import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { calculateFantasyPoints } from "@/src/lib/fantasy-scoring";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const matchId = Number(params.id);
  const body = await request.json();

  const rows = body.rows || [];

  if (!matchId || !Array.isArray(rows)) {
    return NextResponse.json(
      { error: "Invalid match id or rows payload" },
      { status: 400 }
    );
  }

  for (const row of rows) {
  const playerId = Number(row.player_id);

  const input = {
    in_starting_xi: row.in_starting_xi ?? true,
    runs: Number(row.runs) || 0,
    fours: Number(row.fours) || 0,
    sixes: Number(row.sixes) || 0,
    balls_faced: Number(row.balls_faced) || 0,
    is_out: Boolean(row.is_out),
    dismissal_type: String(row.dismissal_type || ""),
    dot_balls: Number(row.dot_balls) || 0,
    wickets: Number(row.wickets) || 0,
    bowled_or_lbw_wickets: Number(row.bowled_or_lbw_wickets) || 0,
    maiden_overs: Number(row.maiden_overs) || 0,
    overs_bowled: Number(row.overs_bowled) || 0,
    runs_conceded: Number(row.runs_conceded) || 0,
    catches: Number(row.catches) || 0,
    stumpings: Number(row.stumpings) || 0,
    run_outs: Number(row.run_outs) || 0,
  };

  const breakdown = calculateFantasyPoints(input);

  const { error: statsError } = await supabase
    .from("player_match_stats")
    .upsert(
      {
  match_id: matchId,
  player_id: playerId,
  runs: input.runs,
  fours: input.fours,
  sixes: input.sixes,
  balls_faced: input.balls_faced,
  wickets: input.wickets,
  maiden_overs: input.maiden_overs,
  catches: input.catches,
  stumpings: input.stumpings,
  run_outs: input.run_outs,
  is_out: input.is_out,
  dismissal_type: input.dismissal_type,
  dot_balls: input.dot_balls,
  bowled_or_lbw_wickets: input.bowled_or_lbw_wickets,
  overs_bowled: input.overs_bowled,
  runs_conceded: input.runs_conceded,
},
      { onConflict: "match_id,player_id" }
    );

  if (statsError) {
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  const { error: pointsError } = await supabase
    .from("player_match_points")
    .upsert(
      {
        match_id: matchId,
        player_id: playerId,
        batting_points:
          breakdown.playing_xi_points +
          breakdown.batting_points +
          breakdown.batting_milestone_points +
          breakdown.strike_rate_points,
        bowling_points:
          breakdown.bowling_points +
          breakdown.bowling_milestone_points +
          breakdown.economy_points,
        fielding_points: breakdown.fielding_points,
        bonus_points: 0,
        total_points: breakdown.total_points,
      },
      { onConflict: "match_id,player_id" }
    );

  if (pointsError) {
    return NextResponse.json({ error: pointsError.message }, { status: 500 });
  }
}

  return NextResponse.json({
    success: true,
    message: "Match scores saved successfully",
  });
}