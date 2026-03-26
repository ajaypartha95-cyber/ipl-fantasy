"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calculateFantasyPoints } from "@/src/lib/fantasy-scoring";
import {
  validatePlayerScoreRow,
  parseCricketOvers,
} from "@/src/lib/fantasy-validation";

type MatchPlayer = {
  id: number;
  name: string;
  role: string;
  ipl_team: string;
};

type MatchData = {
  match: {
    id: number;
    match_number: number;
    team_1: string;
    team_2: string;
    match_date: string;
  };
  players: MatchPlayer[];
  savedStats: {
  player_id: number;
  runs: number;
  fours: number;
  sixes: number;
  balls_faced: number;
  wickets: number;
  maiden_overs: number;
  catches: number;
  stumpings: number;
  run_outs: number;
  is_out: boolean;
  dismissal_type: string | null;
  dot_balls: number;
  bowled_or_lbw_wickets: number;
  overs_bowled: number;
  runs_conceded: number;
}[];
};

type PlayerScoreInput = {
  in_starting_xi: boolean;
  runs: number;
  fours: number;
  sixes: number;
  balls_faced: number;
  is_out: boolean;
  dismissal_type: string;
  dot_balls: number;
  wickets: number;
  bowled_or_lbw_wickets: number;
  maiden_overs: number;
  overs_bowled: number;
  runs_conceded: number;
  catches: number;
  stumpings: number;
  run_outs: number;
};

export default function AdminMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [matchId, setMatchId] = useState<string>("");
  const [match, setMatch] = useState<MatchData["match"] | null>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [scores, setScores] = useState<Record<number, PlayerScoreInput>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [resetting, setResetting] = useState(false);
  const [selectedBreakdownPlayerId, setSelectedBreakdownPlayerId] = useState<number | null>(null);
  const [rowFilter, setRowFilter] = useState<"all" | "edited" | "invalid">("all");

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setMatchId(id);

      const res = await fetch(`/api/admin/match/${id}/players`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch match players");
      }

      const data: MatchData = await res.json();

      setMatch(data.match);
      setPlayers(data.players);

      const savedStatsMap = new Map(
        data.savedStats.map((row) => [row.player_id, row])
      );

      const initialScores: Record<number, PlayerScoreInput> = {};
      data.players.forEach((player) => {
        const saved = savedStatsMap.get(player.id);

        initialScores[player.id] = {
  in_starting_xi: true,
  runs: saved?.runs ?? 0,
  fours: saved?.fours ?? 0,
  sixes: saved?.sixes ?? 0,
  balls_faced: saved?.balls_faced ?? 0,
  is_out: saved?.is_out ?? false,
  dismissal_type: saved?.dismissal_type ?? "",
  dot_balls: saved?.dot_balls ?? 0,
  wickets: saved?.wickets ?? 0,
  bowled_or_lbw_wickets: saved?.bowled_or_lbw_wickets ?? 0,
  maiden_overs: saved?.maiden_overs ?? 0,
  overs_bowled: saved?.overs_bowled ?? 0,
  runs_conceded: saved?.runs_conceded ?? 0,
  catches: saved?.catches ?? 0,
  stumpings: saved?.stumpings ?? 0,
  run_outs: saved?.run_outs ?? 0,
};
      });

      setScores(initialScores);
      setLoading(false);
    }

    loadData();
  }, [params]);

  function formatMatchDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  }

  function updateScore(
    playerId: number,
    field: keyof PlayerScoreInput,
    value: string
  ) {
    const numericValue = Number(value) || 0;

    setScores((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: numericValue,
      },
    }));
  }
function updateBoolean(playerId: number, field: keyof PlayerScoreInput, value: boolean) {
  setScores((prev) => ({
    ...prev,
    [playerId]: {
      ...prev[playerId],
      [field]: value,
    },
  }));
}

function updateText(playerId: number, field: keyof PlayerScoreInput, value: string) {
  setScores((prev) => ({
    ...prev,
    [playerId]: {
      ...prev[playerId],
      [field]: value,
    },
  }));
}

  function getPreviewPoints(playerId: number) {
  const row = scores[playerId];
  if (!row) return 0;

  return calculateFantasyPoints(row).total_points;
}

function getScoreBreakdown(playerId: number) {
  const row = scores[playerId];
  if (!row) return null;

  return calculateFantasyPoints(row);
}

function getRowValidation(playerId: number) {
  const row = scores[playerId];
  if (!row) {
    return { isValid: true, errors: [] };
  }

  return validatePlayerScoreRow(row);
}

function hasAnyRowErrors() {
  return players.some((player) => !getRowValidation(player.id).isValid);
}

function getTeamOuts(teamName: string) {
  return players.filter((player) => {
    if (player.ipl_team !== teamName) return false;
    const row = scores[player.id];
    return row?.is_out;
  }).length;
}

function getBattingDismissalTypeCount(teamName: string, dismissalType: string) {
  return players.filter((player) => {
    if (player.ipl_team !== teamName) return false;
    const row = scores[player.id];
    if (!row) return false;
    return row.is_out && row.dismissal_type === dismissalType;
  }).length;
}

function getFieldingDismissalTotals(teamName: string) {
  const teamPlayers = players.filter((player) => player.ipl_team === teamName);

  return teamPlayers.reduce(
    (acc, player) => {
      const row = scores[player.id];
      if (!row) return acc;

      acc.wickets += row.wickets;
      acc.bowledOrLbw += row.bowled_or_lbw_wickets;
      acc.catches += row.catches;
      acc.stumpings += row.stumpings;
      acc.runOuts += row.run_outs;
      return acc;
    },
    {
      wickets: 0,
      bowledOrLbw: 0,
      catches: 0,
      stumpings: 0,
      runOuts: 0,
    }
  );
}

function getDismissalReconciliation(battingTeam: string, fieldingTeam: string) {
  const outs = getTeamOuts(battingTeam);
  const fieldingTotals = getFieldingDismissalTotals(fieldingTeam);

  return {
    outs,
    expectedDismissals: fieldingTotals.wickets + fieldingTotals.runOuts,
    matches: outs === fieldingTotals.wickets + fieldingTotals.runOuts,
    fieldingTotals,
  };
}

function getSubtypeComparison(battingTeam: string, fieldingTeam: string) {
  const fieldingTotals = getFieldingDismissalTotals(fieldingTeam);

  const caughtDismissals = getBattingDismissalTypeCount(battingTeam, "caught");
  const bowledDismissals = getBattingDismissalTypeCount(battingTeam, "bowled");
  const lbwDismissals = getBattingDismissalTypeCount(battingTeam, "lbw");
  const stumpedDismissals = getBattingDismissalTypeCount(battingTeam, "stumped");
  const runOutDismissals = getBattingDismissalTypeCount(battingTeam, "run_out");

  return {
    caught: {
      batting: caughtDismissals,
      fielding: fieldingTotals.catches,
      matches: caughtDismissals === fieldingTotals.catches,
    },
    bowledLbw: {
      batting: bowledDismissals + lbwDismissals,
      fielding: fieldingTotals.bowledOrLbw,
      matches: bowledDismissals + lbwDismissals === fieldingTotals.bowledOrLbw,
    },
    stumped: {
      batting: stumpedDismissals,
      fielding: fieldingTotals.stumpings,
      matches: stumpedDismissals === fieldingTotals.stumpings,
    },
    runOut: {
      batting: runOutDismissals,
      fielding: fieldingTotals.runOuts,
      matches: runOutDismissals === fieldingTotals.runOuts,
    },
  };
}

function renderMiniStatus(matches: boolean) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        matches
          ? "bg-green-900/40 text-green-300 border border-green-700"
          : "bg-red-900/40 text-red-300 border border-red-700"
      }`}
    >
      {matches ? "Matched" : "Mismatch"}
    </span>
  );
}

function getValidRowCount() {
  return players.filter((player) => getRowValidation(player.id).isValid).length;
}

function getInvalidRowCount() {
  return players.length - getValidRowCount();
}

function getOverallStatus() {
  const hasRowErrors = hasAnyRowErrors();
  const hasReconciliationErrors = hasAnyMatchReconciliationErrors();

  if (hasRowErrors || hasReconciliationErrors) {
    return {
      label: "Needs fixes",
      className: "bg-red-900/40 text-red-300 border border-red-700",
    };
  }

  return {
    label: "Ready to save",
    className: "bg-green-900/40 text-green-300 border border-green-700",
  };
}

function getMatchReconciliationErrors() {
  if (!match) return [];

  const errors: string[] = [];

  const team1 = getDismissalReconciliation(match.team_1, match.team_2);
  const team2 = getDismissalReconciliation(match.team_2, match.team_1);

  const team1Subtype = getSubtypeComparison(match.team_1, match.team_2);
  const team2Subtype = getSubtypeComparison(match.team_2, match.team_1);

  if (!team1.matches) {
    errors.push(`${match.team_1} outs must equal ${match.team_2} wickets + run outs.`);
  }

  if (!team2.matches) {
    errors.push(`${match.team_2} outs must equal ${match.team_1} wickets + run outs.`);
  }

  if (!team1Subtype.caught.matches) {
    errors.push(`${match.team_1} caught dismissals must equal ${match.team_2} catches.`);
  }

  if (!team1Subtype.bowledLbw.matches) {
    errors.push(`${match.team_1} bowled/LBW dismissals must equal ${match.team_2} bowled/LBW credits.`);
  }

  if (!team1Subtype.stumped.matches) {
    errors.push(`${match.team_1} stumped dismissals must equal ${match.team_2} stumpings.`);
  }

  if (!team1Subtype.runOut.matches) {
    errors.push(`${match.team_1} run-out dismissals must equal ${match.team_2} run outs.`);
  }

  if (!team2Subtype.caught.matches) {
    errors.push(`${match.team_2} caught dismissals must equal ${match.team_1} catches.`);
  }

  if (!team2Subtype.bowledLbw.matches) {
    errors.push(`${match.team_2} bowled/LBW dismissals must equal ${match.team_1} bowled/LBW credits.`);
  }

  if (!team2Subtype.stumped.matches) {
    errors.push(`${match.team_2} stumped dismissals must equal ${match.team_1} stumpings.`);
  }

  if (!team2Subtype.runOut.matches) {
    errors.push(`${match.team_2} run-out dismissals must equal ${match.team_1} run outs.`);
  }

  return errors;
}

function hasAnyMatchReconciliationErrors() {
  return getMatchReconciliationErrors().length > 0;
}

function isEditedRow(playerId: number) {
  const row = scores[playerId];
  if (!row) return false;

  return (
    row.runs > 0 ||
    row.fours > 0 ||
    row.sixes > 0 ||
    row.balls_faced > 0 ||
    row.is_out ||
    row.dismissal_type.trim() !== "" ||
    row.dot_balls > 0 ||
    row.wickets > 0 ||
    row.bowled_or_lbw_wickets > 0 ||
    row.maiden_overs > 0 ||
    row.overs_bowled > 0 ||
    row.runs_conceded > 0 ||
    row.catches > 0 ||
    row.stumpings > 0 ||
    row.run_outs > 0
  );
}

function getFilteredPlayers() {
  if (rowFilter === "all") return players;
  if (rowFilter === "edited") {
    return players.filter((player) => isEditedRow(player.id));
  }
  return players.filter((player) => !getRowValidation(player.id).isValid);
}

const selectedPlayer =
  selectedBreakdownPlayerId !== null
    ? players.find((player) => player.id === selectedBreakdownPlayerId) ?? null
    : null;

const selectedBreakdown =
  selectedBreakdownPlayerId !== null
    ? getScoreBreakdown(selectedBreakdownPlayerId)
    : null;

  async function handleSave() {
  setMessage("");
  setSaving(true);

  if (hasAnyRowErrors()) {
    setMessage("Fix validation errors before saving.");
    setSaving(false);
    return;
  }

  try {
    const rows = players.map((player) => ({
      player_id: player.id,
      in_starting_xi: scores[player.id]?.in_starting_xi ?? true,
      runs: scores[player.id]?.runs ?? 0,
      fours: scores[player.id]?.fours ?? 0,
      sixes: scores[player.id]?.sixes ?? 0,
      balls_faced: scores[player.id]?.balls_faced ?? 0,
      is_out: scores[player.id]?.is_out ?? false,
      dismissal_type: scores[player.id]?.dismissal_type ?? "",
      dot_balls: scores[player.id]?.dot_balls ?? 0,
      wickets: scores[player.id]?.wickets ?? 0,
      bowled_or_lbw_wickets: scores[player.id]?.bowled_or_lbw_wickets ?? 0,
      maiden_overs: scores[player.id]?.maiden_overs ?? 0,
      overs_bowled: scores[player.id]?.overs_bowled ?? 0,
      runs_conceded: scores[player.id]?.runs_conceded ?? 0,
      catches: scores[player.id]?.catches ?? 0,
      stumpings: scores[player.id]?.stumpings ?? 0,
      run_outs: scores[player.id]?.run_outs ?? 0,
    }));

    const saveRes = await fetch(`/api/admin/match/${matchId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rows }),
    });

    const saveResult = await saveRes.json();

    if (!saveRes.ok) {
      setMessage(saveResult.error || "Failed to save scores.");
      setSaving(false);
      return;
    }

    const recalcRes = await fetch(`/api/admin/match/${matchId}/recalculate`, {
      method: "POST",
    });

    const recalcResult = await recalcRes.json();

    if (!recalcRes.ok) {
      setMessage(recalcResult.error || "Scores saved, but recalculation failed.");
      setSaving(false);
      return;
    }

    const completeRes = await fetch(`/api/admin/match/${matchId}/complete`, {
      method: "POST",
    });

    const completeResult = await completeRes.json();

    if (!completeRes.ok) {
      setMessage(
        completeResult.error || "Scores saved, but match completion update failed."
      );
      setSaving(false);
      return;
    }

    setMessage("Scores saved, leaderboard updated, and match marked completed.");
  } catch (error) {
    setMessage("Something went wrong while saving.");
  } finally {
    setSaving(false);
  }
}

  async function handleReset() {
    const confirmed = window.confirm(
      "Are you sure you want to reset all saved scores for this match?"
    );

    if (!confirmed) return;

    setMessage("");
    setResetting(true);

    try {
      const res = await fetch(`/api/admin/match/${matchId}/reset`, {
        method: "POST",
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Failed to reset scores.");
        setResetting(false);
        return;
      }

      const clearedScores: Record<number, PlayerScoreInput> = {};
      players.forEach((player) => {
        clearedScores[player.id] = {
  in_starting_xi: true,
  runs: 0,
  fours: 0,
  sixes: 0,
  balls_faced: 0,
  is_out: false,
  dismissal_type: "",
  dot_balls: 0,
  wickets: 0,
  bowled_or_lbw_wickets: 0,
  maiden_overs: 0,
  overs_bowled: 0,
  runs_conceded: 0,
  catches: 0,
  stumpings: 0,
  run_outs: 0,
};
      });

      setScores(clearedScores);
      setMessage("Match scores reset successfully.");
    } catch {
      setMessage("Something went wrong while resetting.");
    } finally {
      setResetting(false);
    }
  }

  if (loading || !match) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Enter Match Scores</h1>
            <p className="text-gray-400">
              Match #{match.match_number} • {match.team_1} vs {match.team_2} •{" "}
              {formatMatchDate(match.match_date)}
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
          >
            Back to Admin
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 mb-8">
          <p className="text-lg mb-2">Editable scoring form</p>
          <p className="text-gray-400">
            This version saves runs, fours, sixes and catches to Supabase.
          </p>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-4">
  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
    <p className="text-sm text-gray-400">Players</p>
    <p className="mt-1 text-2xl font-bold">{players.length}</p>
  </div>

  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
    <p className="text-sm text-gray-400">Valid Rows</p>
    <p className="mt-1 text-2xl font-bold">{getValidRowCount()}</p>
  </div>

  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
    <p className="text-sm text-gray-400">Invalid Rows</p>
    <p className="mt-1 text-2xl font-bold">{getInvalidRowCount()}</p>
  </div>

  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
    <p className="text-sm text-gray-400">Status</p>
    <div className="mt-2">
      <span className={`rounded-full px-3 py-1 text-sm font-medium ${getOverallStatus().className}`}>
        {getOverallStatus().label}
      </span>
    </div>
  </div>
</div>
{match && (
  <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
    <h2 className="text-xl font-semibold mb-4">Dismissal Reconciliation</h2>

    {(() => {
      const team1Batting = getDismissalReconciliation(match.team_1, match.team_2);
      const team2Batting = getDismissalReconciliation(match.team_2, match.team_1);

      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {match.team_1} batting vs {match.team_2} fielding
                </p>
                <p className="text-sm text-gray-400">
                  {match.team_1} outs: {team1Batting.outs} · {match.team_2} wickets + run outs:{" "}
                  {team1Batting.expectedDismissals}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  team1Batting.matches
                    ? "bg-green-900/40 text-green-300 border border-green-700"
                    : "bg-red-900/40 text-red-300 border border-red-700"
                }`}
              >
                {team1Batting.matches ? "Matched" : "Mismatch"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 p-3">
                <p className="text-sm font-medium mb-2">{match.team_1} batting dismissals</p>
                <p className="text-sm text-gray-400">
                  Caught: {getBattingDismissalTypeCount(match.team_1, "caught")} ·
                  Bowled: {getBattingDismissalTypeCount(match.team_1, "bowled")} ·
                  LBW: {getBattingDismissalTypeCount(match.team_1, "lbw")} ·
                  Stumped: {getBattingDismissalTypeCount(match.team_1, "stumped")} ·
                  Run out: {getBattingDismissalTypeCount(match.team_1, "run_out")}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 p-3">
                <p className="text-sm font-medium mb-2">{match.team_2} fielding credits</p>
                <p className="text-sm text-gray-400">
                  Wickets: {team1Batting.fieldingTotals.wickets} ·
                  Bowled/LBW: {team1Batting.fieldingTotals.bowledOrLbw} ·
                  Catches: {team1Batting.fieldingTotals.catches} ·
                  Stumpings: {team1Batting.fieldingTotals.stumpings} ·
                  Run outs: {team1Batting.fieldingTotals.runOuts}
                </p>
              </div>

              {(() => {
  const subtype = getSubtypeComparison(match.team_1, match.team_2);

  return (
    <div className="mt-4 rounded-lg border border-zinc-800 p-3">
      <p className="text-sm font-medium mb-3">Subtype reconciliation</p>

      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center justify-between gap-4">
          <span>Caught dismissals: {subtype.caught.batting} vs Catches: {subtype.caught.fielding}</span>
          {renderMiniStatus(subtype.caught.matches)}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Bowled/LBW dismissals: {subtype.bowledLbw.batting} vs Bowled/LBW credits: {subtype.bowledLbw.fielding}</span>
          {renderMiniStatus(subtype.bowledLbw.matches)}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Stumped dismissals: {subtype.stumped.batting} vs Stumpings: {subtype.stumped.fielding}</span>
          {renderMiniStatus(subtype.stumped.matches)}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Run out dismissals: {subtype.runOut.batting} vs Run outs: {subtype.runOut.fielding}</span>
          {renderMiniStatus(subtype.runOut.matches)}
        </div>
      </div>
    </div>
  );
})()}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {match.team_2} batting vs {match.team_1} fielding
                </p>
                <p className="text-sm text-gray-400">
                  {match.team_2} outs: {team2Batting.outs} · {match.team_1} wickets + run outs:{" "}
                  {team2Batting.expectedDismissals}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  team2Batting.matches
                    ? "bg-green-900/40 text-green-300 border border-green-700"
                    : "bg-red-900/40 text-red-300 border border-red-700"
                }`}
              >
                {team2Batting.matches ? "Matched" : "Mismatch"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 p-3">
                <p className="text-sm font-medium mb-2">{match.team_2} batting dismissals</p>
                <p className="text-sm text-gray-400">
                  Caught: {getBattingDismissalTypeCount(match.team_2, "caught")} ·
                  Bowled: {getBattingDismissalTypeCount(match.team_2, "bowled")} ·
                  LBW: {getBattingDismissalTypeCount(match.team_2, "lbw")} ·
                  Stumped: {getBattingDismissalTypeCount(match.team_2, "stumped")} ·
                  Run out: {getBattingDismissalTypeCount(match.team_2, "run_out")}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 p-3">
                <p className="text-sm font-medium mb-2">{match.team_1} fielding credits</p>
                <p className="text-sm text-gray-400">
                  Wickets: {team2Batting.fieldingTotals.wickets} ·
                  Bowled/LBW: {team2Batting.fieldingTotals.bowledOrLbw} ·
                  Catches: {team2Batting.fieldingTotals.catches} ·
                  Stumpings: {team2Batting.fieldingTotals.stumpings} ·
                  Run outs: {team2Batting.fieldingTotals.runOuts}
                </p>
              </div>
              {(() => {
  const subtype = getSubtypeComparison(match.team_2, match.team_1);

  return (
    <div className="mt-4 rounded-lg border border-zinc-800 p-3">
      <p className="text-sm font-medium mb-3">Subtype reconciliation</p>

      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center justify-between gap-4">
          <span>Caught dismissals: {subtype.caught.batting} vs Catches: {subtype.caught.fielding}</span>
          {renderMiniStatus(subtype.caught.matches)}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Bowled/LBW dismissals: {subtype.bowledLbw.batting} vs Bowled/LBW credits: {subtype.bowledLbw.fielding}</span>
          {renderMiniStatus(subtype.bowledLbw.matches)}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Stumped dismissals: {subtype.stumped.batting} vs Stumpings: {subtype.stumped.fielding}</span>
          {renderMiniStatus(subtype.stumped.matches)}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Run out dismissals: {subtype.runOut.batting} vs Run outs: {subtype.runOut.fielding}</span>
          {renderMiniStatus(subtype.runOut.matches)}
        </div>
      </div>
    </div>
  );
})()}
            </div>
          </div>
        </div>
      );
    })()}
  </div>
)}
<div className="mb-4 flex flex-wrap items-center gap-3">
  <button
    onClick={() => setRowFilter("all")}
    className={`rounded-lg px-4 py-2 text-sm border ${
      rowFilter === "all"
        ? "border-white bg-white text-black"
        : "border-zinc-700 text-white hover:border-zinc-500"
    }`}
  >
    All Players
  </button>

  <button
    onClick={() => setRowFilter("edited")}
    className={`rounded-lg px-4 py-2 text-sm border ${
      rowFilter === "edited"
        ? "border-white bg-white text-black"
        : "border-zinc-700 text-white hover:border-zinc-500"
    }`}
  >
    Edited Rows
  </button>

  <button
    onClick={() => setRowFilter("invalid")}
    className={`rounded-lg px-4 py-2 text-sm border ${
      rowFilter === "invalid"
        ? "border-white bg-white text-black"
        : "border-zinc-700 text-white hover:border-zinc-500"
    }`}
  >
    Invalid Rows
  </button>
</div>
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900">
  <tr>
    <th className="p-4 border-b border-zinc-700">Player</th>
    <th className="p-4 border-b border-zinc-700">Team</th>
    <th className="p-4 border-b border-zinc-700">XI</th>
    <th className="p-4 border-b border-zinc-700">Runs</th>
    <th className="p-4 border-b border-zinc-700">4s</th>
    <th className="p-4 border-b border-zinc-700">6s</th>
    <th className="p-4 border-b border-zinc-700">BF</th>
    <th className="p-4 border-b border-zinc-700">Out</th>
    <th className="p-4 border-b border-zinc-700">Dismissal</th>
    <th className="p-4 border-b border-zinc-700">Dots</th>
    <th className="p-4 border-b border-zinc-700">Wkts</th>
    <th className="p-4 border-b border-zinc-700">LBW/Bowled</th>
    <th className="p-4 border-b border-zinc-700">Maidens</th>
    <th className="p-4 border-b border-zinc-700">Overs</th>
    <th className="p-4 border-b border-zinc-700">Conceded</th>
    <th className="p-4 border-b border-zinc-700">Catches</th>
    <th className="p-4 border-b border-zinc-700">Stumpings</th>
    <th className="p-4 border-b border-zinc-700">Run Outs</th>
    <th className="p-4 border-b border-zinc-700">Preview</th>
    <th className="p-4 border-b border-zinc-700">Breakdown</th>
  </tr>
</thead>
            <tbody>
             {getFilteredPlayers().map((player) => {
  const validation = getRowValidation(player.id);

  return (
    <tr
      key={player.id}
      className={`align-top odd:bg-zinc-950 even:bg-black ${
        !validation.isValid ? "bg-red-950/20" : ""
      }`}
    >
    <td className="p-4 border-b border-zinc-800">{player.name}</td>
    <td className="p-4 border-b border-zinc-800">{player.ipl_team}</td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="checkbox"
        checked={scores[player.id]?.in_starting_xi ?? true}
        onChange={(e) => updateBoolean(player.id, "in_starting_xi", e.target.checked)}
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.runs ?? 0}
        onChange={(e) => updateScore(player.id, "runs", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.fours ?? 0}
        onChange={(e) => updateScore(player.id, "fours", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.sixes ?? 0}
        onChange={(e) => updateScore(player.id, "sixes", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.balls_faced ?? 0}
        onChange={(e) => updateScore(player.id, "balls_faced", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="checkbox"
        checked={scores[player.id]?.is_out ?? false}
        onChange={(e) => updateBoolean(player.id, "is_out", e.target.checked)}
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <select
        value={scores[player.id]?.dismissal_type ?? ""}
        onChange={(e) => updateText(player.id, "dismissal_type", e.target.value)}
        className="w-32 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      >
        <option value="">-</option>
        <option value="bowled">bowled</option>
        <option value="caught">caught</option>
        <option value="lbw">lbw</option>
        <option value="run_out">run_out</option>
        <option value="stumped">stumped</option>
        <option value="hit_wicket">hit_wicket</option>
      </select>
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.dot_balls ?? 0}
        onChange={(e) => updateScore(player.id, "dot_balls", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.wickets ?? 0}
        onChange={(e) => updateScore(player.id, "wickets", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.bowled_or_lbw_wickets ?? 0}
        onChange={(e) =>
          updateScore(player.id, "bowled_or_lbw_wickets", e.target.value)
        }
        className="w-24 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.maiden_overs ?? 0}
        onChange={(e) => updateScore(player.id, "maiden_overs", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        step="0.1"
        value={scores[player.id]?.overs_bowled ?? 0}
        onChange={(e) => updateScore(player.id, "overs_bowled", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.runs_conceded ?? 0}
        onChange={(e) => updateScore(player.id, "runs_conceded", e.target.value)}
        className="w-24 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.catches ?? 0}
        onChange={(e) => updateScore(player.id, "catches", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.stumpings ?? 0}
        onChange={(e) => updateScore(player.id, "stumpings", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800">
      <input
        type="number"
        min="0"
        value={scores[player.id]?.run_outs ?? 0}
        onChange={(e) => updateScore(player.id, "run_outs", e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </td>

    <td className="p-4 border-b border-zinc-800 font-semibold">
      {getPreviewPoints(player.id)}
    </td>

    <td className="p-4 border-b border-zinc-800">
  <button
    onClick={() => setSelectedBreakdownPlayerId(player.id)}
    className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500"
  >
    View
  </button>
</td>
<td className="p-4 border-b border-zinc-800 text-xs min-w-[260px]">
  {validation.isValid ? (
    <span className="text-green-400">OK</span>
  ) : (
    <div className="space-y-1 text-red-300">
      {validation.errors.map((error, index) => (
        <div key={index}>• {error}</div>
      ))}
    </div>
  )}
</td>
  </tr>
);
             })}
            </tbody>
          </table>
        </div>

        <div className="sticky bottom-4 z-40 mt-6">
  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur">
    <button
      onClick={handleSave}
      disabled={saving || resetting || hasAnyRowErrors() || hasAnyMatchReconciliationErrors()}
      className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-gray-200 disabled:opacity-60"
    >
      {saving ? "Saving..." : "Save Scores"}
    </button>

    <button
      onClick={handleReset}
      disabled={saving || resetting}
      className="rounded-lg border border-red-700 px-5 py-3 font-medium text-red-300 hover:bg-red-950/30 disabled:opacity-60"
    >
      {resetting ? "Resetting..." : "Reset Match"}
    </button>

    <div className="min-w-[220px] text-sm text-gray-300">
      {message || "No pending action."}
    </div>

    <div className="ml-auto">
      <span className={`rounded-full px-3 py-1 text-sm font-medium ${getOverallStatus().className}`}>
        {getOverallStatus().label}
      </span>
    </div>
  </div>
</div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold mb-3">Preview formula</h2>
          <p className="text-gray-400">
  Preview Points now use the full fantasy scoring logic based on Dream XI rules.
</p>
        </div>
      </div>
      {selectedPlayer && selectedBreakdown && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{selectedPlayer.name}</h2>
          <p className="text-sm text-gray-400">{selectedPlayer.ipl_team}</p>
        </div>

        <button
          onClick={() => setSelectedBreakdownPlayerId(null)}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500"
        >
          Close
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-2 bg-zinc-900 text-sm font-medium">
          <div className="p-3 border-b border-zinc-800">Component</div>
          <div className="p-3 border-b border-zinc-800">Points</div>

          <div className="p-3 border-b border-zinc-800">Playing XI</div>
          <div className="p-3 border-b border-zinc-800">{selectedBreakdown.playing_xi_points}</div>

          <div className="p-3 border-b border-zinc-800">Batting</div>
          <div className="p-3 border-b border-zinc-800">{selectedBreakdown.batting_points}</div>

          <div className="p-3 border-b border-zinc-800">Batting Milestone</div>
          <div className="p-3 border-b border-zinc-800">{selectedBreakdown.batting_milestone_points}</div>

          <div className="p-3 border-b border-zinc-800">Strike Rate</div>
          <div className="p-3 border-b border-zinc-800">{selectedBreakdown.strike_rate_points}</div>

          <div className="p-3 border-b border-zinc-800">Bowling</div>
          <div className="p-3 border-b border-zinc-800">{selectedBreakdown.bowling_points}</div>

          <div className="p-3 border-b border-zinc-800">Bowling Milestone</div>
          <div className="p-3 border-b border-zinc-800">{selectedBreakdown.bowling_milestone_points}</div>

          <div className="p-3 border-b border-zinc-800">Economy</div>
          <div className="p-3 border-b border-zinc-800">{selectedBreakdown.economy_points}</div>

          <div className="p-3 border-b border-zinc-800">Fielding</div>
          <div className="p-3 border-b border-zinc-800">{selectedBreakdown.fielding_points}</div>

          <div className="p-3 font-semibold">Total</div>
          <div className="p-3 font-semibold">{selectedBreakdown.total_points}</div>
        </div>
      </div>
    </div>
  </div>
)}
    </main>
  );
}