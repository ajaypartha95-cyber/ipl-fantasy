import { getBaseUrl } from "@/src/lib/base-url";

async function getTeamMatchBreakdown(id: string, matchId: string) {
  const res = await fetch(
    `${getBaseUrl()}/api/team/${id}/match/${matchId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch team match breakdown");
  }

  return res.json();
}

function formatMatchDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default async function TeamMatchBreakdownPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = await params;
  const { team, match, breakdown } = await getTeamMatchBreakdown(id, matchId);

  const profile = Array.isArray(team.profiles) ? team.profiles[0] : team.profiles;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{team.team_name} Match Breakdown</h1>
        <p className="text-gray-400 mb-8">
          Owner: {profile?.display_name} • Match #{match.match_number} • {match.team_1} vs {match.team_2} • {formatMatchDate(match.match_date)}
        </p>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4 border-b border-zinc-700">Player</th>
                <th className="p-4 border-b border-zinc-700">Tag</th>
                <th className="p-4 border-b border-zinc-700">IPL Team</th>
                <th className="p-4 border-b border-zinc-700">Base</th>
                <th className="p-4 border-b border-zinc-700">Captain Bonus</th>
                <th className="p-4 border-b border-zinc-700">Vice Bonus</th>
                <th className="p-4 border-b border-zinc-700">Final</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row: any) => (
                <tr key={row.player_id} className="odd:bg-zinc-950 even:bg-black">
                  <td className="p-4 border-b border-zinc-800">{row.name}</td>
                  <td className="p-4 border-b border-zinc-800">{row.tag}</td>
                  <td className="p-4 border-b border-zinc-800">{row.ipl_team}</td>
                  <td className="p-4 border-b border-zinc-800">{row.base_points}</td>
                  <td className="p-4 border-b border-zinc-800">{row.captain_bonus}</td>
                  <td className="p-4 border-b border-zinc-800">{row.vice_captain_bonus}</td>
                  <td className="p-4 border-b border-zinc-800 font-semibold">{row.final_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}