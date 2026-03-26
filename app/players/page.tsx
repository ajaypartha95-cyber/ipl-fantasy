async function getPlayers() {
  const res = await fetch("http://localhost:3000/api/players", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch players");
  }

  const json = await res.json();
  return json.data;
}

function groupPlayersByTeam(players: any[]) {
  return players.reduce((acc: Record<string, any[]>, player) => {
    if (!acc[player.ipl_team]) {
      acc[player.ipl_team] = [];
    }
    acc[player.ipl_team].push(player);
    return acc;
  }, {});
}

export default async function PlayersPage() {
  const players = await getPlayers();
  const groupedPlayers = groupPlayersByTeam(players);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">IPL 2026 Players</h1>
        <p className="text-gray-400 mb-8">
          Total players imported: {players.length}
        </p>

        <div className="space-y-10">
          {Object.entries(groupedPlayers).map(([teamName, teamPlayers]) => (
            <section
              key={teamName}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <h2 className="text-2xl font-semibold mb-4">{teamName}</h2>
              <p className="text-sm text-gray-400 mb-4">
                Players: {(teamPlayers as any[]).length}
              </p>

              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="p-4 border-b border-zinc-700">Name</th>
                      <th className="p-4 border-b border-zinc-700">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(teamPlayers as any[]).map((player) => (
                      <tr key={player.id} className="odd:bg-zinc-950 even:bg-black">
                        <td className="p-4 border-b border-zinc-800">
                          {player.name}
                        </td>
                        <td className="p-4 border-b border-zinc-800">
                          {player.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}