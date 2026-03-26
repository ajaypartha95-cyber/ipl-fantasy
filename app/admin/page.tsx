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

export default async function AdminPage() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Admin Scoring Panel</h1>
        <p className="text-gray-400 mb-8">
          Manage match scoring and fantasy points
        </p>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900">
              <tr>
                <th className="p-4 border-b border-zinc-700">Match #</th>
                <th className="p-4 border-b border-zinc-700">Fixture</th>
                <th className="p-4 border-b border-zinc-700">Date</th>
                <th className="p-4 border-b border-zinc-700">Status</th>
                <th className="p-4 border-b border-zinc-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match: any) => (
                <tr key={match.id} className="odd:bg-zinc-950 even:bg-black">
                  <td className="p-4 border-b border-zinc-800">
                    #{match.match_number}
                  </td>
                  <td className="p-4 border-b border-zinc-800">
                    {match.team_1} vs {match.team_2}
                  </td>
                  <td className="p-4 border-b border-zinc-800">
                    {formatMatchDate(match.match_date)}
                  </td>
                  <td className="p-4 border-b border-zinc-800 capitalize">
                    {match.status}
                  </td>
                  <td className="p-4 border-b border-zinc-800">
                    <Link
                      href={`/admin/match/${match.id}`}
                      className="inline-block rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-gray-200"
                    >
                      Enter Scores
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}