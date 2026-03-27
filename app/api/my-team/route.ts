import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data: team, error: teamError } = await supabase
    .from("fantasy_teams")
    .select("*")
    .eq("id", 1)
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
    .eq("fantasy_team_id", 1)
    .eq("is_active", true);

  if (playersError) {
    return NextResponse.json({ error: playersError.message }, { status: 500 });
  }

  return NextResponse.json({
    team,
    players,
  });
}