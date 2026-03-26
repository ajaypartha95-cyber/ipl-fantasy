import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/client";

export async function GET() {
  const { data, error } = await supabase
    .from("fantasy_teams")
    .select(`
      id,
      team_name,
      profile_id,
      profiles (
        id,
        display_name
      )
    `)
    .eq("season_id", 1)
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}