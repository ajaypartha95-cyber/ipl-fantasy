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

  const { data: points, error: pointsError } = await supabase
    .from("player_match_points")
    .select(`
      id,
      match_id,
      player_id,
      batting_points,
      bowling_points,
      fielding_points,
      bonus_points,
      total_points,
      players (
        id,
        name,
        role,
        ipl_team
      )
    `)
    .eq("match_id", matchId)
    .order("total_points", { ascending: false });

  if (pointsError) {
    return NextResponse.json({ error: pointsError.message }, { status: 500 });
  }

  return NextResponse.json({
    match,
    points,
  });
}