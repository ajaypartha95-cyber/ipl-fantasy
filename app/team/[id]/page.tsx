async function getTeam(id: string) {
  const res = await fetch(`http://localhost:3000/api/team/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch team");
  }

  return res.json();
}

export default async function TeamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { team, players } = await getTeam(id);

  const captainId = team.captain_player_id;
  const viceCaptainId = team.vice_captain_player_id;
  const profile = Array.isArray(team.profiles) ? team.profiles[0] : team.profiles;

  const hasCaptain = !!captainId;
  const hasViceCaptain = !!viceCaptainId;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{team.team_name}</h1>
        <p className="text-gray-400 mb-4">
          Owner: {profile?.display_name}
        </p>

        {(!hasCaptain || !hasViceCaptain) && (
  <div className="mb-6 rounded-xl border border-yellow-700 bg-yellow-950/40 p-4 text-yellow-200">
    <p className="mb-3">
      Captain and vice-captain have not been selected yet for this team.
    </p>

    <a
      href={`/team/${team.id}/setup`}
      className="inline-block rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-gray-200"
    >
      Set Captain & Vice-Captain
    </a>
  </div>
)}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-semibold mb-4">Selected Players</h2>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="p-4 border-b border-zinc-700">Name</th>
                  <th className="p-4 border-b border-zinc-700">Role</th>
                  <th className="p-4 border-b border-zinc-700">IPL Team</th>
                  <th className="p-4 border-b border-zinc-700">Tag</th>
                </tr>
              </thead>
              <tbody>
                {players.map((item: any) => {
                  const player = Array.isArray(item.players) ? item.players[0] : item.players;
                  const isCaptain = player?.id === captainId;
                  const isViceCaptain = player?.id === viceCaptainId;

                  return (
                    <tr key={item.id} className="odd:bg-zinc-950 even:bg-black">
                      <td className="p-4 border-b border-zinc-800">{player?.name}</td>
                      <td className="p-4 border-b border-zinc-800">{player?.role}</td>
                      <td className="p-4 border-b border-zinc-800">{player?.ipl_team}</td>
                      <td className="p-4 border-b border-zinc-800">
                        {isCaptain ? "Captain" : isViceCaptain ? "Vice-Captain" : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}