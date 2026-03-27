import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const teamId = Number(params.id);

  const { data: team, error: teamError } = await supabase
    .from("fantasy_teams")
    .select(`
      id,
      team_name,
      captain_player_id,
      vice_captain_player_id,
      profiles (
        id,
        display_name
      )
    `)
    .eq("id", teamId)
    .single();

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  const { data: players, error: playersError } = await supabase
    .from("fantasy_team_players")
    .select(`
      id,
      player_id,
      players (
        id,
        name,
        role,
        ipl_team
      )
    `)
    .eq("fantasy_team_id", teamId)
    .eq("is_active", true);

  if (playersError) {
    return NextResponse.json({ error: playersError.message }, { status: 500 });
  }

  return NextResponse.json({
    team,
    players,
  });
}