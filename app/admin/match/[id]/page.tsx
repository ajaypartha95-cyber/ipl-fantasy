"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateFantasyPoints } from "@/src/lib/fantasy-scoring";
import {
  validatePlayerScoreRow,
  parseCricketOvers,
} from "@/src/lib/fantasy-validation";
import { SegmentedControl } from "@/components/premium/segmented-control";
import { AdminScoreHeader } from "@/components/premium/admin-score-header";
import { AdminSaveBar } from "@/components/premium/admin-save-bar";
import { BreakdownModal } from "@/components/premium/breakdown-modal";
import { ReconciliationCard } from "@/components/premium/reconciliation-card";
import { ScoringPlayerCard } from "@/components/premium/scoring-player-card";

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
    status?: string;
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
    in_starting_xi?: boolean;
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

type TeamFilter = "team1" | "team2" | "all";
type SquadView = "xi" | "full";
type RowFilter = "all" | "edited" | "invalid";

const EMPTY_ROW: PlayerScoreInput = {
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

export default function AdminMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [matchId, setMatchId] = useState("");
  const [match, setMatch] = useState<MatchData["match"] | null>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [scores, setScores] = useState<Record<number, PlayerScoreInput>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("team1");
  const [squadView, setSquadView] = useState<SquadView>("xi");
  const [rowFilter, setRowFilter] = useState<RowFilter>("all");
  const [expandedPlayerIds, setExpandedPlayerIds] = useState<number[]>([]);
  const [selectedBreakdownPlayerId, setSelectedBreakdownPlayerId] = useState<number | null>(null);

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
          in_starting_xi: saved?.in_starting_xi ?? true,
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

  function updateBoolean(
    playerId: number,
    field: keyof PlayerScoreInput,
    value: boolean
  ) {
    setScores((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  }

  function updateText(
    playerId: number,
    field: keyof PlayerScoreInput,
    value: string
  ) {
    setScores((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  }

  function getRow(playerId: number) {
    return scores[playerId] ?? EMPTY_ROW;
  }

  function isEditedRow(playerId: number) {
    const row = getRow(playerId);
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
      row.run_outs > 0 ||
      !row.in_starting_xi
    );
  }

  function isMeaningfullyUsedRow(playerId: number) {
    const row = getRow(playerId);
    return (
      row.in_starting_xi ||
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

  function getRowValidation(playerId: number) {
    return validatePlayerScoreRow(getRow(playerId));
  }

  function getPreviewPoints(playerId: number) {
    return calculateFantasyPoints(getRow(playerId)).total_points;
  }

  function getScoreBreakdown(playerId: number) {
    return calculateFantasyPoints(getRow(playerId));
  }

  function getBattingSummary(playerId: number) {
    const row = getRow(playerId);

    if (
      row.runs === 0 &&
      row.balls_faced === 0 &&
      row.fours === 0 &&
      row.sixes === 0 &&
      !row.is_out
    ) {
      return "No batting entry";
    }

    const parts = [
      `${row.runs}${row.balls_faced > 0 ? ` (${row.balls_faced})` : ""}`,
    ];

    if (row.fours > 0) parts.push(`${row.fours}x4`);
    if (row.sixes > 0) parts.push(`${row.sixes}x6`);
    if (row.is_out) {
      parts.push(row.dismissal_type ? `out • ${row.dismissal_type}` : "out");
    } else if (row.balls_faced > 0 || row.runs > 0) {
      parts.push("not out");
    }

    return parts.join(" • ");
  }

  function getBowlingSummary(playerId: number) {
    const row = getRow(playerId);

    if (
      row.wickets === 0 &&
      row.overs_bowled === 0 &&
      row.runs_conceded === 0 &&
      row.dot_balls === 0 &&
      row.maiden_overs === 0
    ) {
      return "No bowling entry";
    }

    const parts: string[] = [];

    if (row.wickets > 0) parts.push(`${row.wickets} wkts`);
    if (row.overs_bowled > 0) parts.push(`${row.overs_bowled} ov`);
    if (row.runs_conceded > 0 || row.overs_bowled > 0) {
      parts.push(`${row.runs_conceded} runs`);
    }
    if (row.dot_balls > 0) parts.push(`${row.dot_balls} dots`);
    if (row.maiden_overs > 0) parts.push(`${row.maiden_overs} maiden`);

    return parts.join(" • ");
  }

  function getFieldingSummary(playerId: number) {
    const row = getRow(playerId);

    if (row.catches === 0 && row.stumpings === 0 && row.run_outs === 0) {
      return "No fielding entry";
    }

    const parts: string[] = [];
    if (row.catches > 0) parts.push(`${row.catches} catch`);
    if (row.stumpings > 0) parts.push(`${row.stumpings} stumping`);
    if (row.run_outs > 0) parts.push(`${row.run_outs} run out`);

    return parts.join(" • ");
  }

  function getCardPriority(playerId: number) {
    const invalid = !getRowValidation(playerId).isValid;
    const edited = isEditedRow(playerId);

    if (invalid) return 0;
    if (edited) return 1;
    return 2;
  }

  function toggleExpanded(playerId: number) {
    setExpandedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  }

  function getPlayersForSelectedTeam() {
    if (!match) return players;

    if (teamFilter === "team1") {
      return players.filter((player) => player.ipl_team === match.team_1);
    }

    if (teamFilter === "team2") {
      return players.filter((player) => player.ipl_team === match.team_2);
    }

    return players;
  }

  function getScopedPlayers() {
    const teamPlayers = getPlayersForSelectedTeam();
    if (squadView === "full") return teamPlayers;

    return teamPlayers.filter((player) => isMeaningfullyUsedRow(player.id));
  }

  function getVisiblePlayers() {
    const scopedPlayers = getScopedPlayers();

    if (rowFilter === "all") return scopedPlayers;
    if (rowFilter === "edited") {
      return scopedPlayers.filter((player) => isEditedRow(player.id));
    }
    return scopedPlayers.filter((player) => !getRowValidation(player.id).isValid);
  }

  function hasAnyRowErrors() {
    return players.some((player) => !getRowValidation(player.id).isValid);
  }

  function getValidRowCount() {
    return players.filter((player) => getRowValidation(player.id).isValid).length;
  }

  function getInvalidRowCount() {
    return players.length - getValidRowCount();
  }

  function getTeamOuts(teamName: string) {
    return players.filter((player) => {
      if (player.ipl_team !== teamName) return false;
      return getRow(player.id).is_out;
    }).length;
  }

  function getBattingDismissalTypeCount(teamName: string, dismissalType: string) {
    return players.filter((player) => {
      if (player.ipl_team !== teamName) return false;
      const row = getRow(player.id);
      return row.is_out && row.dismissal_type === dismissalType;
    }).length;
  }

  function getFieldingDismissalTotals(teamName: string) {
    const teamPlayers = players.filter((player) => player.ipl_team === teamName);

    return teamPlayers.reduce(
      (acc, player) => {
        const row = getRow(player.id);
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
      errors.push(
        `${match.team_1} bowled/LBW dismissals must equal ${match.team_2} bowled/LBW credits.`
      );
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
      errors.push(
        `${match.team_2} bowled/LBW dismissals must equal ${match.team_1} bowled/LBW credits.`
      );
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

  function getOverallStatus() {
    if (hasAnyRowErrors() || hasAnyMatchReconciliationErrors()) {
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
        in_starting_xi: getRow(player.id).in_starting_xi,
        runs: getRow(player.id).runs,
        fours: getRow(player.id).fours,
        sixes: getRow(player.id).sixes,
        balls_faced: getRow(player.id).balls_faced,
        is_out: getRow(player.id).is_out,
        dismissal_type: getRow(player.id).dismissal_type,
        dot_balls: getRow(player.id).dot_balls,
        wickets: getRow(player.id).wickets,
        bowled_or_lbw_wickets: getRow(player.id).bowled_or_lbw_wickets,
        maiden_overs: getRow(player.id).maiden_overs,
        overs_bowled: getRow(player.id).overs_bowled,
        runs_conceded: getRow(player.id).runs_conceded,
        catches: getRow(player.id).catches,
        stumpings: getRow(player.id).stumpings,
        run_outs: getRow(player.id).run_outs,
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
    } catch {
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
        clearedScores[player.id] = { ...EMPTY_ROW };
      });

      setScores(clearedScores);
      setExpandedPlayerIds([]);
      setMessage("Match scores reset successfully.");
    } catch {
      setMessage("Something went wrong while resetting.");
    } finally {
      setResetting(false);
    }
  }

  const visiblePlayers = useMemo(() => {
    return [...getVisiblePlayers()].sort((a, b) => {
      const priorityDiff = getCardPriority(a.id) - getCardPriority(b.id);
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name);
    });
  }, [players, scores, teamFilter, squadView, rowFilter, match]);

  useEffect(() => {
    const invalidVisibleIds = visiblePlayers
      .filter((player) => !getRowValidation(player.id).isValid)
      .map((player) => player.id);

    if (invalidVisibleIds.length === 0) return;

    setExpandedPlayerIds((prev) => {
      const merged = new Set([...prev, ...invalidVisibleIds]);
      return Array.from(merged);
    });
  }, [visiblePlayers]);

  const selectedPlayer =
    selectedBreakdownPlayerId !== null
      ? players.find((player) => player.id === selectedBreakdownPlayerId) ?? null
      : null;

  const selectedBreakdown =
    selectedBreakdownPlayerId !== null
      ? getScoreBreakdown(selectedBreakdownPlayerId)
      : null;

  if (loading || !match) {
    return (
      <main className="min-h-screen bg-[#05070B] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070B] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <AdminScoreHeader
          matchNumber={match.match_number}
          team1={match.team_1}
          team2={match.team_2}
          matchDate={formatMatchDate(match.match_date)}
          statusLabel={getOverallStatus().label}
          statusClassName={getOverallStatus().className}
          playerCount={players.length}
          validRowCount={getValidRowCount()}
          invalidRowCount={getInvalidRowCount()}
          visibleRowCount={visiblePlayers.length}
        />

        <section className="mb-5 mt-28 flex flex-wrap items-center gap-3 xl:mt-24">
          <SegmentedControl
            value={teamFilter}
            onChange={setTeamFilter}
            options={[
              { value: "team1", label: match.team_1 },
              { value: "team2", label: match.team_2 },
              { value: "all", label: "All Players" },
            ]}
          />

          <SegmentedControl
            value={squadView}
            onChange={setSquadView}
            options={[
              { value: "xi", label: "Match XI" },
              { value: "full", label: "Full Squad" },
            ]}
          />

          <SegmentedControl
            value={rowFilter}
            onChange={setRowFilter}
            options={[
              { value: "all", label: "All" },
              { value: "edited", label: "Edited only" },
              { value: "invalid", label: "Invalid only" },
            ]}
          />
        </section>

        <section className="mb-6 rounded-[24px] border border-[#243041] bg-[#0B0F14] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#F5F7FA]">
              Scoring Cards
            </h2>
            <p className="mt-1 text-sm text-[#778396]">
              Score one player at a time without spreadsheet-style horizontal scrolling.
            </p>
          </div>

          <div className="space-y-4">
            {visiblePlayers.length === 0 ? (
              <div className="rounded-2xl border border-[#243041] bg-[#0A0F15] p-6 text-sm text-[#778396]">
                No players match the current filters.
              </div>
            ) : (
              visiblePlayers.map((player) => {
                const row = getRow(player.id);
                const validation = getRowValidation(player.id);
                const preview = getPreviewPoints(player.id);
                const breakdown = getScoreBreakdown(player.id);
                const oversParsed = parseCricketOvers(row.overs_bowled);
                const isExpanded = expandedPlayerIds.includes(player.id);
                const isEdited = isEditedRow(player.id);
                const battingSummary = getBattingSummary(player.id);
                const bowlingSummary = getBowlingSummary(player.id);
                const fieldingSummary = getFieldingSummary(player.id);

                return (
                  <ScoringPlayerCard
                    key={player.id}
                    player={player}
                    row={row}
                    validation={validation}
                    preview={preview}
                    breakdown={breakdown}
                    oversParsedLabel={oversParsed.isValid ? oversParsed.normalized : "Invalid"}
                    isExpanded={isExpanded}
                    isEdited={isEdited}
                    battingSummary={battingSummary}
                    bowlingSummary={bowlingSummary}
                    fieldingSummary={fieldingSummary}
                    onOpenBreakdown={() => setSelectedBreakdownPlayerId(player.id)}
                    onToggleExpanded={() => toggleExpanded(player.id)}
                    updateScore={(field, value) => updateScore(player.id, field, value)}
                    updateBoolean={(field, value) => updateBoolean(player.id, field, value)}
                    updateText={(field, value) => updateText(player.id, field, value)}
                    renderField={(label, value, onChange, decimal = false) => (
                      <Field
                        label={label}
                        value={value}
                        onChange={onChange}
                        decimal={decimal}
                      />
                    )}
                    renderMiniMetric={(label, value) => (
                      <MiniMetric label={label} value={value} />
                    )}
                  />
                );
              })
            )}
          </div>
        </section>

        <section className="mb-24 rounded-[24px] border border-[#243041] bg-[#0B0F14] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#F5F7FA]">
              Dismissal Reconciliation
            </h2>
            <p className="mt-1 text-sm text-[#778396]">
              Review consistency after entering scores. This stays out of the way while scoring.
            </p>
          </div>

          {getMatchReconciliationErrors().length > 0 && (
            <div className="mb-4 rounded-xl border border-red-800 bg-red-950/30 p-4">
              <p className="mb-2 font-medium text-red-300">Reconciliation errors</p>
              <div className="space-y-1 text-sm text-red-200">
                {getMatchReconciliationErrors().map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(() => {
              const team1Batting = getDismissalReconciliation(match.team_1, match.team_2);
              const team2Batting = getDismissalReconciliation(match.team_2, match.team_1);
              const subtype1 = getSubtypeComparison(match.team_1, match.team_2);
              const subtype2 = getSubtypeComparison(match.team_2, match.team_1);

              return (
                <>
                  <ReconciliationCard
                    title={`${match.team_1} batting vs ${match.team_2} fielding`}
                    subtitle={`${match.team_1} outs: ${team1Batting.outs} · ${match.team_2} wickets + run outs: ${team1Batting.expectedDismissals}`}
                    matched={team1Batting.matches}
                    battingLabel={`${match.team_1} dismissals`}
                    battingText={`${team1Batting.outs} outs recorded`}
                    fieldingLabel={`${match.team_2} dismissal credits`}
                    fieldingText={`${team1Batting.fieldingTotals.wickets} wickets + ${team1Batting.fieldingTotals.runOuts} run outs`}
                    subtypeItems={[
                      {
                        label: `Caught: ${subtype1.caught.batting} vs ${subtype1.caught.fielding}`,
                        matched: subtype1.caught.matches,
                      },
                      {
                        label: `Bowled/LBW: ${subtype1.bowledLbw.batting} vs ${subtype1.bowledLbw.fielding}`,
                        matched: subtype1.bowledLbw.matches,
                      },
                      {
                        label: `Stumped: ${subtype1.stumped.batting} vs ${subtype1.stumped.fielding}`,
                        matched: subtype1.stumped.matches,
                      },
                      {
                        label: `Run out: ${subtype1.runOut.batting} vs ${subtype1.runOut.fielding}`,
                        matched: subtype1.runOut.matches,
                      },
                    ]}
                  />

                  <ReconciliationCard
                    title={`${match.team_2} batting vs ${match.team_1} fielding`}
                    subtitle={`${match.team_2} outs: ${team2Batting.outs} · ${match.team_1} wickets + run outs: ${team2Batting.expectedDismissals}`}
                    matched={team2Batting.matches}
                    battingLabel={`${match.team_2} dismissals`}
                    battingText={`${team2Batting.outs} outs recorded`}
                    fieldingLabel={`${match.team_1} dismissal credits`}
                    fieldingText={`${team2Batting.fieldingTotals.wickets} wickets + ${team2Batting.fieldingTotals.runOuts} run outs`}
                    subtypeItems={[
                      {
                        label: `Caught: ${subtype2.caught.batting} vs ${subtype2.caught.fielding}`,
                        matched: subtype2.caught.matches,
                      },
                      {
                        label: `Bowled/LBW: ${subtype2.bowledLbw.batting} vs ${subtype2.bowledLbw.fielding}`,
                        matched: subtype2.bowledLbw.matches,
                      },
                      {
                        label: `Stumped: ${subtype2.stumped.batting} vs ${subtype2.stumped.fielding}`,
                        matched: subtype2.stumped.matches,
                      },
                      {
                        label: `Run out: ${subtype2.runOut.batting} vs ${subtype2.runOut.fielding}`,
                        matched: subtype2.runOut.matches,
                      },
                    ]}
                  />
                </>
              );
            })()}
          </div>
        </section>
      </div>

      <BreakdownModal
        open={!!selectedPlayer && !!selectedBreakdown}
        onClose={() => setSelectedBreakdownPlayerId(null)}
        playerName={selectedPlayer?.name}
        iplTeam={selectedPlayer?.ipl_team}
        breakdown={selectedBreakdown}
      />

      <AdminSaveBar
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
        resetting={resetting}
        disabledSave={hasAnyRowErrors()}
        message={message}
        statusLabel={getOverallStatus().label}
        statusClassName={getOverallStatus().className}
      />
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  decimal = false,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  decimal?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-[#A8B3C2]">{label}</label>
      <input
        type="number"
        step={decimal ? "0.1" : "1"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-white"
      />
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-[#243041] bg-[#10161E] p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-[#778396]">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-[#F5F7FA]">{value}</div>
    </div>
  );
}