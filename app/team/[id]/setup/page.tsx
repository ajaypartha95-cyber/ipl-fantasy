"use client";

import { useEffect, useMemo, useState } from "react";
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

function getRoleTone(role?: string) {
  const value = (role || "").toLowerCase();
  if (value.includes("all")) return "sp-pill-gold";
  if (value.includes("bowl")) return "sp-pill-info";
  if (value.includes("bat")) return "sp-pill-success";
  return "sp-pill-default";
}

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
      setCaptainId(
        data.team.captain_player_id ? String(data.team.captain_player_id) : ""
      );
      setViceCaptainId(
        data.team.vice_captain_player_id
          ? String(data.team.vice_captain_player_id)
          : ""
      );
      setLoading(false);
    }

    loadData();
  }, [params]);

  const captain = useMemo(
    () => players.find((p) => String(p.id) === captainId),
    [players, captainId]
  );

  const viceCaptain = useMemo(
    () => players.find((p) => String(p.id) === viceCaptainId),
    [players, viceCaptainId]
  );

  const isValidSelection =
    !!captainId && !!viceCaptainId && captainId !== viceCaptainId;

  async function handleSave() {
    setMessage("");

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

      setTimeout(() => {
        router.push(`/team/${teamId}`);
      }, 800);
    } catch {
      setMessage("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="sp-page">
        <div className="sp-container py-10">
          <div className="sp-panel p-8">
            <p className="text-stone-300">Loading team setup...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="sp-page">
      <div className="sp-container py-8 md:py-10">
        <section className="sp-hero p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="sp-pill sp-pill-gold">Captaincy setup</span>
                <span className="sp-pill sp-pill-info">Fantasy leadership</span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
                Set the captaincy
                <span className="block text-amber-100">for {teamName}.</span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
                Choose your captain and vice-captain from the selected XI.
                These two choices define the core upside of your fantasy squad.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="sp-metric bg-[linear-gradient(180deg,rgba(110,231,183,0.15),rgba(52,211,153,0.05))] text-emerald-100">
                  <div className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Squad size
                  </div>
                  <div className="mt-5 text-3xl font-semibold tracking-tight">
                    {players.length}
                  </div>
                  <div className="mt-2 text-sm text-stone-300">
                    Available fantasy players
                  </div>
                </div>

                <div className="sp-metric bg-[linear-gradient(180deg,rgba(103,232,249,0.15),rgba(34,211,238,0.05))] text-cyan-100">
                  <div className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Captain
                  </div>
                  <div className="mt-5 text-2xl font-semibold tracking-tight">
                    {captain?.name || "—"}
                  </div>
                  <div className="mt-2 text-sm text-stone-300">
                    Primary multiplier pick
                  </div>
                </div>

                <div className="sp-metric bg-[linear-gradient(180deg,rgba(252,211,77,0.15),rgba(251,191,36,0.05))] text-amber-100">
                  <div className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Vice-captain
                  </div>
                  <div className="mt-5 text-2xl font-semibold tracking-tight">
                    {viceCaptain?.name || "—"}
                  </div>
                  <div className="mt-2 text-sm text-stone-300">
                    Secondary upside pick
                  </div>
                </div>
              </div>
            </div>

            <div className="sp-panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Team overview
                  </div>
                  <div className="mt-2 text-2xl font-semibold">Leadership preview</div>
                </div>
                <span
                  className={`sp-pill ${
                    isValidSelection ? "sp-pill-success" : "sp-pill-gold"
                  }`}
                >
                  {isValidSelection ? "Ready" : "Incomplete"}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Team name
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-stone-50">
                    {teamName}
                  </div>
                  <div className="mt-2 text-sm text-stone-400">
                    Managed by {ownerName}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Captain
                  </div>
                  <div className="mt-2 text-xl font-semibold text-stone-50">
                    {captain?.name || "Not selected"}
                  </div>
                  <div className="mt-1 text-sm text-stone-400">
                    {captain?.ipl_team || "Choose a player"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Vice-captain
                  </div>
                  <div className="mt-2 text-xl font-semibold text-stone-50">
                    {viceCaptain?.name || "Not selected"}
                  </div>
                  <div className="mt-1 text-sm text-stone-400">
                    {viceCaptain?.ipl_team || "Choose a player"}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/team/${teamId}`}
                  className="sp-button-secondary"
                >
                  Back to Team
                </Link>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="sp-button-primary disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Captaincy"}
                </button>
              </div>

              {message ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-stone-300">
                  {message}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6">
            <div className="sp-eyebrow mb-2">Selection controls</div>
            <h2 className="text-3xl font-semibold text-stone-50">
              Pick your captain and vice-captain
            </h2>
            <p className="mt-2 max-w-2xl text-stone-400">
              Select two different players from your squad to complete the setup.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="sp-panel p-6">
              <label className="mb-3 block text-sm uppercase tracking-[0.18em] text-stone-500">
                Captain
              </label>
              <select
                value={captainId}
                onChange={(e) => setCaptainId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-emerald-400/40"
              >
                <option value="">Select captain</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sp-panel p-6">
              <label className="mb-3 block text-sm uppercase tracking-[0.18em] text-stone-500">
                Vice-captain
              </label>
              <select
                value={viceCaptainId}
                onChange={(e) => setViceCaptainId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-cyan-400/40"
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
        </section>

        <section className="mt-8">
          <div className="mb-6">
            <div className="sp-eyebrow mb-2">Squad reference</div>
            <h2 className="text-3xl font-semibold text-stone-50">
              Available players
            </h2>
            <p className="mt-2 max-w-2xl text-stone-400">
              Review your selected players before locking in the leadership pair.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => {
              const isCaptain = String(player.id) === captainId;
              const isViceCaptain = String(player.id) === viceCaptainId;

              return (
                <div
                  key={player.id}
                  className="sp-panel p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xl font-semibold text-stone-50">
                        {player.name}
                      </div>
                      <div className="mt-1 text-sm text-stone-400">
                        {player.ipl_team}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isCaptain ? (
                        <span className="sp-pill sp-pill-gold">Captain</span>
                      ) : null}
                      {isViceCaptain ? (
                        <span className="sp-pill sp-pill-info">Vice-Captain</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`sp-pill ${getRoleTone(player.role)}`}>
                      {player.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}