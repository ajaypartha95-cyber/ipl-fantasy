import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const teamId = Number(params.id);

  const body = await request.json();
  const captainPlayerId = Number(body.captainPlayerId);
  const viceCaptainPlayerId = Number(body.viceCaptainPlayerId);

  if (!teamId || !captainPlayerId || !viceCaptainPlayerId) {
    return NextResponse.json(
      { error: "teamId, captainPlayerId, and viceCaptainPlayerId are required" },
      { status: 400 }
    );
  }

  if (captainPlayerId === viceCaptainPlayerId) {
    return NextResponse.json(
      { error: "Captain and vice-captain cannot be the same player" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("fantasy_teams")
    .update({
      captain_player_id: captainPlayerId,
      vice_captain_player_id: viceCaptainPlayerId,
    })
    .eq("id", teamId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Captain and vice-captain saved successfully",
  });
}