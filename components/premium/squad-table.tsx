"use client";

import { useState } from "react";
import { Pill } from "./pill";

type Player = {
  id: string;
  name: string;
  role?: string;
  ipl_team?: string;
};

type SquadItem = {
  id: string;
  player_id: number;
  players: Player | Player[];
  season_points: number;
};

type SortDir = "asc" | "desc";

function getRoleTone(role?: string): "gold" | "info" | "success" | "default" {
  const value = (role || "").toLowerCase();
  if (value.includes("all")) return "gold";
  if (value.includes("bowl")) return "info";
  if (value.includes("bat")) return "success";
  return "default";
}

export function SquadTable({
  players,
  captainId,
  viceCaptainId,
}: {
  players: SquadItem[];
  captainId: number | null;
  viceCaptainId: number | null;
}) {
  const [sortDir, setSortDir] = useState<SortDir | null>(null);

  const sorted = [...players].sort((a, b) => {
    if (sortDir === null) return 0;
    const diff = a.season_points - b.season_points;
    return sortDir === "asc" ? diff : -diff;
  });

  function cycleSortDir() {
    setSortDir((prev) =>
      prev === null ? "desc" : prev === "desc" ? "asc" : null
    );
  }

  return (
    <div>
      <div className="hidden border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs uppercase tracking-[0.18em] text-stone-500 md:grid md:grid-cols-[1.2fr_180px_1fr_180px_160px]">
        <div>Player</div>
        <div>Role</div>
        <div>IPL team</div>
        <div>Tag</div>
        <div>
          <button
            onClick={cycleSortDir}
            className="flex items-center gap-1.5 hover:text-stone-300 transition-colors"
          >
            Season pts
            <span className="text-[10px]">
              {sortDir === "desc" ? "▼" : sortDir === "asc" ? "▲" : "⇅"}
            </span>
          </button>
        </div>
      </div>

      <div>
        {sorted.map((item) => {
          const player = Array.isArray(item.players)
            ? item.players[0]
            : item.players;
          const isCaptain = player?.id === captainId;
          const isViceCaptain = player?.id === viceCaptainId;

          return (
            <div
              key={item.id}
              className="grid items-center gap-4 border-t border-white/10 px-5 py-4 first:border-t-0 md:grid-cols-[1.2fr_180px_1fr_180px_160px]"
            >
              <div>
                <div className="font-medium text-stone-50">{player?.name}</div>
              </div>

              <div>
                <Pill tone={getRoleTone(player?.role)}>{player?.role}</Pill>
              </div>

              <div className="text-stone-300">{player?.ipl_team}</div>

              <div>
                {isCaptain ? (
                  <Pill tone="gold">Captain</Pill>
                ) : isViceCaptain ? (
                  <Pill tone="info">Vice-Captain</Pill>
                ) : (
                  <Pill tone="default">Squad</Pill>
                )}
              </div>

              <div className="font-semibold text-stone-50">
                {item.season_points}
                <span className="ml-1 text-xs font-normal text-stone-500">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
