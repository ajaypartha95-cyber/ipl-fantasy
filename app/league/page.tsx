import Link from "next/link";

async function getLeagueData() {
  const res = await fetch("http://localhost:3000/api/league", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch league data");
  }

  const json = await res.json();
  return json.data;
}

function renderStatus(value: boolean) {
  return value ? "Set" : "Pending";
}

export default async function LeaguePage() {
  const teams = await getLeagueData();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">IPL 2026 League</h1>
        <p className="text-gray-400 mb-8">Private fantasy league overview</p>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4 border-b border-zinc-700">Owner</th>
                <th className="p-4 border-b border-zinc-700">Team Name</th>
                <th className="p-4 border-b border-zinc-700">Players</th>
                <th className="p-4 border-b border-zinc-700">Captain</th>
                <th className="p-4 border-b border-zinc-700">Vice-Captain</th>
                <th className="p-4 border-b border-zinc-700">Substitutions Left</th>
                <th className="p-4 border-b border-zinc-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team: any) => {
                const profile = Array.isArray(team.profiles)
                  ? team.profiles[0]
                  : team.profiles;

                return (
                  <tr key={team.id} className="odd:bg-zinc-950 even:bg-black">
                    <td className="p-4 border-b border-zinc-800">
                      {profile?.display_name}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {team.team_name}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {team.player_count}/11
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {renderStatus(team.captain_set)}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {renderStatus(team.vice_captain_set)}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {profile?.substitutions_left}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
  {team.captain_set && team.vice_captain_set ? (
    <Link
      href={`/team/${team.id}`}
      className="inline-block rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-gray-200"
    >
      View Team
    </Link>
  ) : (
    <Link
      href={`/team/${team.id}/setup`}
      className="inline-block rounded-lg bg-yellow-300 text-black px-4 py-2 text-sm font-medium hover:bg-yellow-200"
    >
      Set Captains
    </Link>
  )}
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