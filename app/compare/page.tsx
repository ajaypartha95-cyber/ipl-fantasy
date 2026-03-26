import Link from "next/link";

async function getComparison(team2: string) {
  const res = await fetch(
    `http://localhost:3000/api/compare?team1=1&team2=${team2}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch comparison");
  }

  const json = await res.json();
  return json.data;
}

async function getTeams() {
  const res = await fetch("http://localhost:3000/api/compare-teams", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch teams");
  }

  const json = await res.json();
  return json.data;
}

function renderPlayerList(players: any[]) {
  if (!players.length) {
    return <p className="text-gray-400">None</p>;
  }

  return (
    <ul className="space-y-2">
      {players.map((player: any) => (
        <li
          key={player.id}
          className="rounded-lg border border-zinc-800 bg-black px-4 py-3"
        >
          <div className="font-medium">{player.name}</div>
          <div className="text-sm text-gray-400">
            {player.role} • {player.ipl_team}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ team2?: string }>;
}) {
  const params = await searchParams;
  const selectedTeam2 = params.team2 || "2";

  const [comparison, teams] = await Promise.all([
    getComparison(selectedTeam2),
    getTeams(),
  ]);

  const teamOptions = teams.filter((team: any) => team.id !== 1);
  const selectedTeam = teamOptions.find(
    (team: any) => String(team.id) === selectedTeam2
  );

  const selectedProfile = Array.isArray(selectedTeam?.profiles)
    ? selectedTeam?.profiles[0]
    : selectedTeam?.profiles;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Team Comparison</h1>
        <p className="text-gray-400 mb-6">
          Ajay XI vs {selectedTeam?.team_name || "Selected Team"}
        </p>

        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold mb-4">Choose a team to compare</h2>
          <div className="flex flex-wrap gap-3">
            {teamOptions.map((team: any) => {
              const profile = Array.isArray(team.profiles)
                ? team.profiles[0]
                : team.profiles;

              const isActive = String(team.id) === selectedTeam2;

              return (
                <Link
                  key={team.id}
                  href={`/compare?team2=${team.id}`}
                  className={`rounded-lg px-4 py-2 border transition ${
                    isActive
                      ? "bg-white text-black border-white"
                      : "bg-black text-white border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {profile?.display_name}
                </Link>
              );
            })}
          </div>

          {selectedProfile && (
            <p className="text-sm text-gray-400 mt-4">
              Currently comparing with: {selectedProfile.display_name}
            </p>
          )}
        </div>
<div className="grid gap-4 md:grid-cols-3 mb-8">
  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
    <p className="text-sm text-gray-400 mb-2">Common Players</p>
    <p className="text-3xl font-bold">{comparison.commonPlayers.length}</p>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
    <p className="text-sm text-gray-400 mb-2">Only in Ajay XI</p>
    <p className="text-3xl font-bold">{comparison.onlyTeam1.length}</p>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
    <p className="text-sm text-gray-400 mb-2">
      Only in {selectedTeam?.team_name || "Selected Team"}
    </p>
    <p className="text-3xl font-bold">{comparison.onlyTeam2.length}</p>
  </div>
</div>
        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-semibold mb-4">Common Players</h2>
            {renderPlayerList(comparison.commonPlayers)}
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-semibold mb-4">Only in Ajay XI</h2>
            {renderPlayerList(comparison.onlyTeam1)}
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Only in {selectedTeam?.team_name || "Selected Team"}
            </h2>
            {renderPlayerList(comparison.onlyTeam2)}
          </section>
        </div>
      </div>
    </main>
  );
}