import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/client";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const matchId = Number(resolvedParams.id);

  if (!matchId || Number.isNaN(matchId)) {
    return NextResponse.json({ error: "Invalid match id." }, { status: 400 });
  }

  const { error } = await supabase
    .from("matches")
    .update({ status: "completed" })
    .eq("id", matchId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}