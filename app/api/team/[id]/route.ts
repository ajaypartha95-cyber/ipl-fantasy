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

  const playerIds = players.map((p: any) => p.player_id);

  const { data: playerPoints, error: ppError } = await supabase
    .from("player_match_points")
    .select("player_id, total_points")
    .in("player_id", playerIds);

  if (ppError) {
    return NextResponse.json({ error: ppError.message }, { status: 500 });
  }

  const seasonPointsByPlayerId: Record<number, number> = {};
  for (const pp of playerPoints || []) {
    seasonPointsByPlayerId[pp.player_id] =
      (seasonPointsByPlayerId[pp.player_id] || 0) + (pp.total_points || 0);
  }

  const enrichedPlayers = players.map((p: any) => ({
    ...p,
    season_points: seasonPointsByPlayerId[p.player_id] || 0,
  }));

  return NextResponse.json({
    team,
    players: enrichedPlayers,
  });
}