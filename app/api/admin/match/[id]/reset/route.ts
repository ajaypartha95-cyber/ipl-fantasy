import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

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

  const { error: deletePointsError } = await supabase
    .from("player_match_points")
    .delete()
    .eq("match_id", matchId);

  if (deletePointsError) {
    return NextResponse.json({ error: deletePointsError.message }, { status: 500 });
  }

  const { error: deleteStatsError } = await supabase
    .from("player_match_stats")
    .delete()
    .eq("match_id", matchId);

  if (deleteStatsError) {
    return NextResponse.json({ error: deleteStatsError.message }, { status: 500 });
  }

  const { error: deleteTeamMatchError } = await supabase
    .from("team_match_points")
    .delete()
    .eq("match_id", matchId);

  if (deleteTeamMatchError) {
    return NextResponse.json({ error: deleteTeamMatchError.message }, { status: 500 });
  }

  const { data: fantasyTeams, error: teamsError } = await supabase
    .from("fantasy_teams")
    .select("id, season_id")
    .eq("season_id", match.season_id);

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
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
    message: "Match scores reset successfully.",
  });
}