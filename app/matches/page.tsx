import Link from "next/link";
import { getBaseUrl } from "@/src/lib/base-url";

async function getMatches() {
  const res = await fetch(`${getBaseUrl()}/api/matches`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch matches");
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

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">IPL 2026 Matches</h1>
        <p className="text-gray-400 mb-8">Upcoming match schedule</p>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4 border-b border-zinc-700">Match #</th>
                <th className="p-4 border-b border-zinc-700">Team 1</th>
                <th className="p-4 border-b border-zinc-700">Team 2</th>
                <th className="p-4 border-b border-zinc-700">Date & Time</th>
                <th className="p-4 border-b border-zinc-700">Status</th>
                <th className="p-4 border-b border-zinc-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match: any) => {
                const isScored =
                  match.status === "completed" || match.has_points;

                return (
                  <tr key={match.id} className="odd:bg-zinc-950 even:bg-black">
                    <td className="p-4 border-b border-zinc-800">
                      {match.match_number}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {match.team_1}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {match.team_2}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {formatMatchDate(match.match_date)}
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          isScored
                            ? "bg-green-900/40 text-green-300 border border-green-700"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        }`}
                      >
                        {isScored ? "Completed" : "Upcoming"}
                      </span>
                    </td>
                    <td className="p-4 border-b border-zinc-800">
                      {isScored ? (
                        <Link
                          href={`/match/${match.id}/points`}
                          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
                        >
                          View Points
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No points yet
                        </span>
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