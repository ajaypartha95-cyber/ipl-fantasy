import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Returns cumulative fantasy points per manager after each completed match.
// Shape:
// {
//   matches: [{ id, match_number }, ...],
//   managers: [
//     {
//       team_id, team_name, owner_name, total_points,
//       series: [{ match_number, cumulative }]
//     }
//   ],
//   leader_team_id
// }
export async function GET() {
  const seasonId = 1;

  // 1. Completed matches in order
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, match_number, status")
    .eq("season_id", seasonId)
    .eq("status", "completed")
    .order("match_number", { ascending: true });

  if (matchesError) {
    return NextResponse.json({ error: matchesError.message }, { status: 500 });
  }

  const completedMatches = (matches ?? []).map((m: any) => ({
    id: m.id,
    match_number: m.match_number,
  }));
  const matchIds = completedMatches.map((m: any) => m.id);

  // 2. All fantasy teams + owner profile
  const { data: teams, error: teamsError } = await supabase
    .from("fantasy_teams")
    .select(`
      id,
      team_name,
      profiles ( id, display_name )
    `);

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
  }

  // 3. Per-match points for those matches
  let matchPoints: any[] = [];
  if (matchIds.length > 0) {
    const { data, error } = await supabase
      .from("team_match_points")
      .select("fantasy_team_id, match_id, total_points")
      .in("match_id", matchIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    matchPoints = data ?? [];
  }

  // Index: team_id -> match_id -> points
  const pointsByTeamMatch = new Map<number, Map<number, number>>();
  for (const row of matchPoints) {
    const teamId = row.fantasy_team_id;
    if (!pointsByTeamMatch.has(teamId)) {
      pointsByTeamMatch.set(teamId, new Map());
    }
    pointsByTeamMatch.get(teamId)!.set(row.match_id, row.total_points ?? 0);
  }

  const managers = (teams ?? []).map((team: any) => {
    const profile = Array.isArray(team.profiles)
      ? team.profiles[0]
      : team.profiles;

    const teamId = team.id;
    const perMatch = pointsByTeamMatch.get(teamId);

    let cumulative = 0;
    const series = completedMatches.map((match: any) => {
      const pts = perMatch?.get(match.id) ?? 0;
      cumulative += pts;
      return {
        match_number: match.match_number,
        cumulative,
      };
    });

    return {
      team_id: teamId,
      team_name: team.team_name,
      owner_name: profile?.display_name ?? "—",
      total_points: cumulative,
      series,
    };
  });

  // Sort by total_points descending so the leader is first
  managers.sort((a, b) => b.total_points - a.total_points);

  const leader = managers[0];

  return NextResponse.json({
    matches: completedMatches,
    managers,
    leader_team_id: leader?.team_id ?? null,
  });
}
