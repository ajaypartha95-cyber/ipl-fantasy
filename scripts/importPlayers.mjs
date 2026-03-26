import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const filePath = path.join(process.cwd(), "IPL_2026_Player_List (1).xlsx");

const teamNameMap = {
  CSK: "Chennai Super Kings",
  DC: "Delhi Capitals",
  GT: "Gujarat Titans",
  KKR: "Kolkata Knight Riders",
  LSG: "Lucknow Super Giants",
  MI: "Mumbai Indians",
  PBKS: "Punjab Kings",
  RR: "Rajasthan Royals",
  RCB: "Royal Challengers Bengaluru",
  SRH: "Sunrisers Hyderabad",
};

function cleanValue(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

async function run() {
  console.log("Reading Excel file...");

  if (!fs.existsSync(filePath)) {
    console.error(`Excel file not found at: ${filePath}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;

  console.log("Sheets found:", sheetNames);

  const { data: seasons, error: seasonError } = await supabase
    .from("seasons")
    .select("id, name, year")
    .eq("name", "IPL 2026")
    .limit(1);

  if (seasonError) {
    console.error("Failed to fetch season:", seasonError.message);
    process.exit(1);
  }

  if (!seasons || seasons.length === 0) {
    console.error("Season 'IPL 2026' not found in database.");
    process.exit(1);
  }

  const seasonId = seasons[0].id;
  const playersToInsert = [];

  for (const sheetName of sheetNames) {
  if (sheetName === "Index") continue;

  const sheet = workbook.Sheets[sheetName];

  const rows = xlsx.utils.sheet_to_json(sheet, {
    defval: "",
    range: 3,
  });

  const fullTeamName = teamNameMap[sheetName] || sheetName;

  for (const row of rows) {
    const name = cleanValue(row.Player);
    const role = cleanValue(row.Role);

    if (!name || !role) continue;

    playersToInsert.push({
      name,
      role,
      ipl_team: fullTeamName,
      season_id: seasonId,
    });
  }
}
console.log(playersToInsert.slice(0, 5));
  console.log(`Prepared ${playersToInsert.length} players for import.`);

  if (playersToInsert.length === 0) {
    console.error("No players found to import.");
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("players")
    .upsert(playersToInsert, {
      onConflict: "name,ipl_team,season_id",
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    console.error("Import failed:", error.message);
    process.exit(1);
  }

  console.log(`Import successful. Inserted/updated ${data.length} players.`);
}

run();