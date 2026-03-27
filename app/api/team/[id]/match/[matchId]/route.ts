import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; matchId: string }> }
) {
  const params = await context.params;
  const teamId = Number(params.id);
  const matchId = Number(params.matchId);

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

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const { data: teamPlayers, error: teamPlayersError } = await supabase
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

  if (teamPlayersError) {
    return NextResponse.json({ error: teamPlayersError.message }, { status: 500 });
  }

  const playerIds = teamPlayers.map((row: any) => row.player_id);

  const { data: playerPoints, error: playerPointsError } = await supabase
    .from("player_match_points")
    .select(`
      id,
      player_id,
      batting_points,
      bowling_points,
      fielding_points,
      bonus_points,
      total_points
    `)
    .eq("match_id", matchId)
    .in("player_id", playerIds);

  if (playerPointsError) {
    return NextResponse.json({ error: playerPointsError.message }, { status: 500 });
  }

  const pointsMap = new Map(playerPoints.map((row: any) => [row.player_id, row]));

  const breakdown = teamPlayers.map((row: any) => {
    const player = Array.isArray(row.players) ? row.players[0] : row.players;
    const points = pointsMap.get(row.player_id);

    const isCaptain = row.player_id === team.captain_player_id;
    const isViceCaptain = row.player_id === team.vice_captain_player_id;

    const basePoints = points?.total_points || 0;
    const captainBonus = isCaptain ? basePoints : 0;
    const viceCaptainBonus = isViceCaptain ? Math.floor(basePoints * 0.5) : 0;

    return {
      player_id: row.player_id,
      name: player?.name,
      role: player?.role,
      ipl_team: player?.ipl_team,
      batting_points: points?.batting_points || 0,
      bowling_points: points?.bowling_points || 0,
      fielding_points: points?.fielding_points || 0,
      bonus_points: points?.bonus_points || 0,
      base_points: basePoints,
      captain_bonus: captainBonus,
      vice_captain_bonus: viceCaptainBonus,
      final_points: basePoints + captainBonus + viceCaptainBonus,
      tag: isCaptain ? "Captain" : isViceCaptain ? "Vice-Captain" : "-",
    };
  });

  return NextResponse.json({
    team,
    match,
    breakdown,
  });
}