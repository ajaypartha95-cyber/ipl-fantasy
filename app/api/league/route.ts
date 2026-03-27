import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data: teams, error: teamsError } = await supabase
    .from("fantasy_teams")
    .select(`
      id,
      team_name,
      season_id,
      profile_id,
      captain_player_id,
      vice_captain_player_id,
      profiles (
        id,
        username,
        display_name,
        substitutions_left
      )
    `)
    .eq("season_id", 1)
    .order("id", { ascending: true });

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
  }

  const teamIds = teams.map((team: any) => team.id);

  const { data: teamPlayers, error: playersError } = await supabase
    .from("fantasy_team_players")
    .select("fantasy_team_id")
    .in("fantasy_team_id", teamIds)
    .eq("is_active", true);

  if (playersError) {
    return NextResponse.json({ error: playersError.message }, { status: 500 });
  }

  const playerCountMap: Record<number, number> = {};

  for (const row of teamPlayers) {
    playerCountMap[row.fantasy_team_id] =
      (playerCountMap[row.fantasy_team_id] || 0) + 1;
  }

  const enrichedTeams = teams.map((team: any) => ({
    ...team,
    player_count: playerCountMap[team.id] || 0,
    captain_set: !!team.captain_player_id,
    vice_captain_set: !!team.vice_captain_player_id,
  }));

  return NextResponse.json({ data: enrichedTeams });
}