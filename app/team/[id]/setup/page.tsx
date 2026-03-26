"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Player = {
  id: number;
  name: string;
  role: string;
  ipl_team: string;
};

type TeamSetupData = {
  team: any;
  players: Array<{
    id: number;
    player_id: number;
    players: Player | Player[];
  }>;
};

export default function TeamSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [teamId, setTeamId] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [captainId, setCaptainId] = useState<string>("");
  const [viceCaptainId, setViceCaptainId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setTeamId(id);

      const res = await fetch(`/api/team/${id}/setup`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch team setup data");
      }

      const data: TeamSetupData = await res.json();

      const profile = Array.isArray(data.team.profiles)
        ? data.team.profiles[0]
        : data.team.profiles;

      const normalizedPlayers = data.players.map((item) =>
        Array.isArray(item.players) ? item.players[0] : item.players
      );

      setTeamName(data.team.team_name);
      setOwnerName(profile?.display_name || "");
      setPlayers(normalizedPlayers);
      setCaptainId(data.team.captain_player_id ? String(data.team.captain_player_id) : "");
      setViceCaptainId(
        data.team.vice_captain_player_id ? String(data.team.vice_captain_player_id) : ""
      );
      setLoading(false);
    }

    loadData();
  }, [params]);

  async function handleSave() {
    setMessage("Captain and vice-captain saved successfully.");

    setTimeout(() => {
  router.push(`/team/${teamId}`);
}, 800);

    if (!captainId || !viceCaptainId) {
      setMessage("Please select both captain and vice-captain.");
      return;
    }

    if (captainId === viceCaptainId) {
      setMessage("Captain and vice-captain cannot be the same player.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/team/${teamId}/set-captains`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          captainPlayerId: captainId,
          viceCaptainPlayerId: viceCaptainId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Failed to save selections.");
        setSaving(false);
        return;
      }

      setMessage("Captain and vice-captain saved successfully.");
    } catch (error) {
      setMessage("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-5xl mx-auto">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
  <div>
    <h1 className="text-4xl font-bold mb-2">Set Captain & Vice-Captain</h1>
    <p className="text-gray-400">
      {teamName} • Owner: {ownerName}
    </p>
  </div>

  <Link
    href={`/team/${teamId}`}
    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
  >
    Back to Team
  </Link>
</div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 mb-8">
          <p className="text-lg mb-4">
            Choose captain and vice-captain from the selected 11 players.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Captain
              </label>
              <select
                value={captainId}
                onChange={(e) => setCaptainId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
              >
                <option value="">Select captain</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Vice-Captain
              </label>
              <select
                value={viceCaptainId}
                onChange={(e) => setViceCaptainId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
              >
                <option value="">Select vice-captain</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-4">
            <p className="text-sm text-gray-400 mb-2">Current selection preview</p>
            <p>
              Captain:{" "}
              <span className="font-medium">
                {players.find((p) => String(p.id) === captainId)?.name || "Not selected"}
              </span>
            </p>
            <p>
              Vice-Captain:{" "}
              <span className="font-medium">
                {players.find((p) => String(p.id) === viceCaptainId)?.name || "Not selected"}
              </span>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-white text-black px-5 py-3 font-medium hover:bg-gray-200 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Captain & Vice-Captain"}
            </button>

            {message && (
              <p className="text-sm text-gray-300">{message}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-semibold mb-4">Available Players</h2>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="p-4 border-b border-zinc-700">Name</th>
                  <th className="p-4 border-b border-zinc-700">Role</th>
                  <th className="p-4 border-b border-zinc-700">IPL Team</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="odd:bg-zinc-950 even:bg-black">
                    <td className="p-4 border-b border-zinc-800">{player.name}</td>
                    <td className="p-4 border-b border-zinc-800">{player.role}</td>
                    <td className="p-4 border-b border-zinc-800">{player.ipl_team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}