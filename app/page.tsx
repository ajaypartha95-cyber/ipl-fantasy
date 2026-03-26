import Link from "next/link";
import { getBaseUrl } from "@/src/lib/base-url";

async function getSummary() {
  const res = await fetch(`${getBaseUrl()}/api/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch summary");
  }

  const json = await res.json();
  return json.data;
}

async function getNextMatch() {
  const res = await fetch(`${getBaseUrl()}/api/next-match`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch next match");
  }

  const json = await res.json();
  return json.data;
}

function formatMatchDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default async function HomePage() {
  const summary = await getSummary();
  const nextMatch = await getNextMatch();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3">IPL Fantasy App</h1>
          <p className="text-gray-400 text-lg">
            Private fantasy league for IPL 2026
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm text-gray-400 mb-2">Next Match</p>
          <h2 className="text-2xl font-semibold mb-2">
            {nextMatch.team_1} vs {nextMatch.team_2}
          </h2>
          <p className="text-gray-400">
            Match #{nextMatch.match_number} • {formatMatchDate(nextMatch.match_date)}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-gray-400 mb-2">Total Teams</p>
            <p className="text-3xl font-bold">{summary.totalTeams}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-gray-400 mb-2">Player Pool</p>
            <p className="text-3xl font-bold">{summary.totalPlayers}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-gray-400 mb-2">Scheduled Matches</p>
            <p className="text-3xl font-bold">{summary.totalMatches}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href="/league"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">League</h2>
            <p className="text-gray-400">
              View all fantasy teams in the private league.
            </p>
          </Link>

          <Link
            href="/my-team"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">My Team</h2>
            <p className="text-gray-400">
              View Ajay XI with captain and vice-captain.
            </p>
          </Link>

          <Link
            href="/players"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 hover:border-zinc-600 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">Players</h2>
            <p className="text-gray-400">
              Browse the IPL 2026 player pool by team.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}