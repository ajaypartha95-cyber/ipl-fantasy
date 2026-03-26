import { getBaseUrl } from "@/src/lib/base-url";

async function getLeaderboard() {
  const res = await fetch(`${getBaseUrl()}/api/leaderboard`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  const json = await res.json();
  return json.data;
}

function getProfileAndTeam(row: any) {
  const team = Array.isArray(row.fantasy_teams)
    ? row.fantasy_teams[0]
    : row.fantasy_teams;

  const profile = Array.isArray(team?.profiles)
    ? team?.profiles[0]
    : team?.profiles;

  return { team, profile };
}

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  const topThree = rows.slice(0, 3);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-400 mb-8">
          IPL 2026 private fantasy standings
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-10">
          {topThree.map((row: any) => {
            const { team, profile } = getProfileAndTeam(row);

            return (
              <div
                key={row.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <p className="text-sm text-gray-400 mb-2">Rank #{row.rank}</p>
                <h2 className="text-2xl font-bold mb-2">{profile?.display_name}</h2>
                <p className="text-gray-400 mb-3">{team?.team_name}</p>
                <p className="text-3xl font-bold">{row.total_points}</p>
                <p className="text-sm text-gray-400 mt-1">points</p>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4 border-b border-zinc-700">Rank</th>
                <th className="p-4 border-b border-zinc-700">Owner</th>
                <th className="p-4 border-b border-zinc-700">Team Name</th>
                <th className="p-4 border-b border-zinc-700">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => {
                const { team, profile } = getProfileAndTeam(row);

                return (
                  <tr key={row.id} className="odd:bg-zinc-950 even:bg-black">
                    <td className="p-4 border-b border-zinc-800 font-semibold">
                      #{row.rank}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {profile?.display_name}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {team?.team_name}
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