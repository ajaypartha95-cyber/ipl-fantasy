import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("*")
    .eq("season_id", 1)
    .order("match_number", { ascending: true });

  if (matchesError) {
    return NextResponse.json({ error: matchesError.message }, { status: 500 });
  }

  const matchIds = (matches ?? []).map((match: any) => match.id);

  let matchesWithPoints = new Set<number>();

  if (matchIds.length > 0) {
    const { data: pointsRows, error: pointsError } = await supabase
      .from("player_match_points")
      .select("match_id")
      .in("match_id", matchIds);

    if (pointsError) {
      return NextResponse.json({ error: pointsError.message }, { status: 500 });
    }

    matchesWithPoints = new Set((pointsRows ?? []).map((row: any) => row.match_id));
  }

  const enrichedMatches = (matches ?? []).map((match: any) => ({
    ...match,
    has_points: matchesWithPoints.has(match.id),
  }));

  return NextResponse.json({ data: enrichedMatches });
}