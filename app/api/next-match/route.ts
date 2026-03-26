import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/client";

export async function GET() {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("season_id", 1)
    .eq("status", "upcoming")
    .order("match_date", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}