import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data, error } = await supabase
    .from("player_match_points")
    .select(`
      player_id,
      total_points,
      players (
        id,
        name,
        role,
        ipl_team
      )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate total points per player across all matches
  const pointsByPlayer = new Map<
    number,
    { player_id: number; name: string; role: string; ipl_team: string; total_points: number }
  >();

  for (const row of data ?? []) {
    const player = Array.isArray(row.players) ? row.players[0] : row.players;
    if (!player) continue;

    const existing = pointsByPlayer.get(row.player_id);
    if (existing) {
      existing.total_points += row.total_points ?? 0;
    } else {
      pointsByPlayer.set(row.player_id, {
        player_id: row.player_id,
        name: player.name,
        role: player.role,
        ipl_team: player.ipl_team,
        total_points: row.total_points ?? 0,
      });
    }
  }

  const sorted = Array.from(pointsByPlayer.values())
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 10)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return NextResponse.json({ data: sorted });
}
