import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const teamId = Number(params.id);

  const { data, error } = await supabase
    .from("team_match_points")
    .select(`
      id,
      fantasy_team_id,
      match_id,
      base_points,
      captain_bonus_points,
      vice_captain_bonus_points,
      total_points,
      matches (
        id,
        match_number,
        team_1,
        team_2,
        match_date,
        status
      )
    `)
    .eq("fantasy_team_id", teamId)
    .order("match_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}