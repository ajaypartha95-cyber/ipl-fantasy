import { getBaseUrl } from "@/src/lib/base-url";

async function getMatchPoints(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/match/${id}/points`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch match points");
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

export default async function MatchPointsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { match, points } = await getMatchPoints(id);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Match Points Breakdown</h1>
        <p className="text-gray-400 mb-8">
          Match #{match.match_number} • {match.team_1} vs {match.team_2} •{" "}
          {formatMatchDate(match.match_date)}
        </p>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4 border-b border-zinc-700">Player</th>
                <th className="p-4 border-b border-zinc-700">IPL Team</th>
                <th className="p-4 border-b border-zinc-700">Batting</th>
                <th className="p-4 border-b border-zinc-700">Bowling</th>
                <th className="p-4 border-b border-zinc-700">Fielding</th>
                <th className="p-4 border-b border-zinc-700">Bonus</th>
                <th className="p-4 border-b border-zinc-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {points.map((row: any) => {
                const player = Array.isArray(row.players)
                  ? row.players[0]
                  : row.players;

                return (
                  <tr key={row.id} className="odd:bg-zinc-950 even:bg-black">
                    <td className="p-4 border-b border-zinc-800">
                      {player?.name}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {player?.ipl_team}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {row.batting_points}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {row.bowling_points}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {row.fielding_points}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {row.bonus_points}
                    </td>
                    <td className="p-4 border-b border-zinc-800 font-semibold">
                      {row.total_points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}