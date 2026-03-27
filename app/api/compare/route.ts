import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

async function getTeamPlayers(teamId: number) {
  const { data, error } = await supabase
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

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item: any) => {
    const player = Array.isArray(item.players) ? item.players[0] : item.players;
    return player;
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team1 = Number(searchParams.get("team1"));
  const team2 = Number(searchParams.get("team2"));

  if (!team1 || !team2) {
    return NextResponse.json(
      { error: "team1 and team2 are required" },
      { status: 400 }
    );
  }

  try {
    const [team1Players, team2Players] = await Promise.all([
      getTeamPlayers(team1),
      getTeamPlayers(team2),
    ]);

    const team1Names = new Set(team1Players.map((p: any) => p.name));
    const team2Names = new Set(team2Players.map((p: any) => p.name));

    const commonPlayers = team1Players.filter((p: any) => team2Names.has(p.name));
    const onlyTeam1 = team1Players.filter((p: any) => !team2Names.has(p.name));
    const onlyTeam2 = team2Players.filter((p: any) => !team1Names.has(p.name));

    return NextResponse.json({
      data: {
        commonPlayers,
        onlyTeam1,
        onlyTeam2,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}