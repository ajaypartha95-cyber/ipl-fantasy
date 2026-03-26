import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/client";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const matchId = Number(params.id);

  if (!matchId) {
    return NextResponse.json({ error: "Invalid match id" }, { status: 400 });
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, season_id")
    .eq("id", matchId)
    .single();

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const { data: fantasyTeams, error: teamsError } = await supabase
    .from("fantasy_teams")
    .select("id, season_id, captain_player_id, vice_captain_player_id")
    .eq("season_id", match.season_id);

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
  }

  for (const team of fantasyTeams) {
    const { data: roster, error: rosterError } = await supabase
      .from("fantasy_team_players")
      .select("player_id")
      .eq("fantasy_team_id", team.id)
      .eq("is_active", true);

    if (rosterError) {
      return NextResponse.json({ error: rosterError.message }, { status: 500 });
    }

    const playerIds = roster.map((r) => r.player_id);

    let basePoints = 0;
    let captainBonusPoints = 0;
    let viceCaptainBonusPoints = 0;

    if (playerIds.length > 0) {
      const { data: playerPoints, error: playerPointsError } = await supabase
        .from("player_match_points")
        .select("player_id, total_points")
        .eq("match_id", matchId)
        .in("player_id", playerIds);

      if (playerPointsError) {
        return NextResponse.json({ error: playerPointsError.message }, { status: 500 });
      }

      for (const row of playerPoints) {
        basePoints += row.total_points || 0;

        if (row.player_id === team.captain_player_id) {
          captainBonusPoints = row.total_points || 0;
        }

        if (row.player_id === team.vice_captain_player_id) {
          viceCaptainBonusPoints = Math.floor((row.total_points || 0) * 0.5);
        }
      }
    }

    const totalPoints =
      basePoints + captainBonusPoints + viceCaptainBonusPoints;

    const { error: upsertTeamMatchError } = await supabase
      .from("team_match_points")
      .upsert(
        {
          fantasy_team_id: team.id,
          match_id: matchId,
          base_points: basePoints,
          captain_bonus_points: captainBonusPoints,
          vice_captain_bonus_points: viceCaptainBonusPoints,
          total_points: totalPoints,
        },
        { onConflict: "fantasy_team_id,match_id" }
      );

    if (upsertTeamMatchError) {
      return NextResponse.json(
        { error: upsertTeamMatchError.message },
        { status: 500 }
      );
    }
  }

  for (const team of fantasyTeams) {
    const { data: teamMatchRows, error: teamMatchRowsError } = await supabase
      .from("team_match_points")
      .select("total_points")
      .eq("fantasy_team_id", team.id);

    if (teamMatchRowsError) {
      return NextResponse.json(
        { error: teamMatchRowsError.message },
        { status: 500 }
      );
    }

    const totalSeasonPoints = teamMatchRows.reduce(
      (sum, row) => sum + (row.total_points || 0),
      0
    );

    const { error: leaderboardError } = await supabase
      .from("leaderboard")
      .upsert(
        {
          fantasy_team_id: team.id,
          season_id: team.season_id,
          total_points: totalSeasonPoints,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "fantasy_team_id,season_id" }
      );

    if (leaderboardError) {
      return NextResponse.json({ error: leaderboardError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Team match points and leaderboard recalculated successfully.",
  });
}