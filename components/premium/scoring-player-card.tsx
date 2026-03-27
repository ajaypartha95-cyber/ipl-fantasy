"use client";

type MatchPlayer = {
  id: number;
  name: string;
  role: string;
  ipl_team: string;
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

type Breakdown = {
  playing_xi_points: number;
  batting_points: number;
  batting_milestone_points: number;
  strike_rate_points: number;
  bowling_points: number;
  bowling_milestone_points: number;
  economy_points: number;
  fielding_points: number;
  total_points: number;
};

export function ScoringPlayerCard({
  player,
  row,
  validation,
  preview,
  breakdown,
  oversParsedLabel,
  isExpanded,
  isEdited,
  battingSummary,
  bowlingSummary,
  fieldingSummary,
  onOpenBreakdown,
  onToggleExpanded,
  updateScore,
  updateBoolean,
  updateText,
  renderField,
  renderMiniMetric,
}: {
  player: MatchPlayer;
  row: PlayerScoreInput;
  validation: { isValid: boolean; errors: string[] };
  preview: number;
  breakdown: Breakdown;
  oversParsedLabel: string;
  isExpanded: boolean;
  isEdited: boolean;
  battingSummary: string;
  bowlingSummary: string;
  fieldingSummary: string;
  onOpenBreakdown: () => void;
  onToggleExpanded: () => void;
  updateScore: (field: keyof PlayerScoreInput, value: string) => void;
  updateBoolean: (field: keyof PlayerScoreInput, value: boolean) => void;
  updateText: (field: keyof PlayerScoreInput, value: string) => void;
  renderField: (
    label: string,
    value: number,
    onChange: (value: string) => void,
    decimal?: boolean
  ) => React.ReactNode;
  renderMiniMetric: (label: string, value: number) => React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[22px] border shadow-[0_12px_30px_rgba(0,0,0,0.22)] ${
        !validation.isValid
          ? "border-red-800 bg-red-950/10"
          : isEdited
          ? "border-[#8E6A2A]/50 bg-[linear-gradient(180deg,_rgba(214,179,106,0.06),_rgba(10,15,21,1))]"
          : "border-[#243041] bg-[#0A0F15]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xl font-semibold text-[#F5F7FA]">
              {player.name}
            </span>

            <span className="inline-flex items-center rounded-full border border-[#243041] bg-[#10161E] px-3 py-1 text-xs text-[#A8B3C2]">
              {player.ipl_team}
            </span>

            <span className="inline-flex items-center rounded-full border border-[#243041] bg-[#10161E] px-3 py-1 text-xs font-medium text-[#C8D2DE]">
              {player.role}
            </span>

            {row.in_starting_xi && (
              <span className="inline-flex items-center rounded-full border border-[#2FA36B]/35 bg-[#163B2D]/50 px-3 py-1 text-xs font-medium text-[#7FE3AE]">
                XI
              </span>
            )}

            {isEdited && (
              <span className="inline-flex items-center rounded-full border border-[#8E6A2A]/35 bg-[#2A2114]/50 px-3 py-1 text-xs font-medium text-[#E6C98B]">
                Edited
              </span>
            )}

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                validation.isValid
                  ? "border border-green-700 bg-green-900/30 text-green-300"
                  : "border border-red-700 bg-red-900/30 text-red-300"
              }`}
            >
              {validation.isValid ? "OK" : "Invalid"}
            </span>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-4">
            <SummaryBox label="Preview" value={String(preview)} valueClassName="text-lg font-semibold text-[#F5F7FA]" />
            <SummaryBox label="Batting" value={battingSummary} labelClassName="text-[#D6B36A]" />
            <SummaryBox label="Bowling" value={bowlingSummary} labelClassName="text-[#7FE3AE]" />
            <SummaryBox label="Fielding" value={fieldingSummary} labelClassName="text-[#9AC7FF]" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenBreakdown}
            className="rounded-lg border border-[#243041] bg-[#10161E] px-4 py-2 text-sm font-medium text-[#F5F7FA] hover:border-[#2FA36B]/40 hover:bg-[#111924]"
          >
            View Breakdown
          </button>

          <button
            onClick={onToggleExpanded}
            className="rounded-lg bg-[#F5F7FA] px-4 py-2 text-sm font-semibold text-black hover:bg-white"
          >
            {isExpanded ? "Collapse" : "Edit"}
          </button>
        </div>
      </div>

      {!validation.isValid && (
        <div className="border-t border-red-900/40 bg-red-950/20 px-5 py-3 text-sm text-red-200">
          <div className="space-y-1">
            {validation.errors.map((error, index) => (
              <div key={index}>• {error}</div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="border-t border-[#243041] px-5 py-5">
          <div className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-[#8E6A2A]/35 bg-[linear-gradient(180deg,_rgba(214,179,106,0.05),_rgba(13,18,25,1))] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#F5F7FA]">Batting</h3>
                <label className="flex items-center gap-2 text-sm text-[#A8B3C2]">
                  <input
                    type="checkbox"
                    checked={row.in_starting_xi}
                    onChange={(e) => updateBoolean("in_starting_xi", e.target.checked)}
                  />
                  In XI
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {renderField("Runs", row.runs, (v) => updateScore("runs", v))}
                {renderField("Balls Faced", row.balls_faced, (v) => updateScore("balls_faced", v))}
                {renderField("4s", row.fours, (v) => updateScore("fours", v))}
                {renderField("6s", row.sixes, (v) => updateScore("sixes", v))}

                <div className="col-span-2 flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 text-sm text-[#A8B3C2]">
                    <input
                      type="checkbox"
                      checked={row.is_out}
                      onChange={(e) => updateBoolean("is_out", e.target.checked)}
                    />
                    Out
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="mb-2 block text-sm text-[#A8B3C2]">
                    Dismissal Type
                  </label>
                  <select
                    value={row.dismissal_type}
                    onChange={(e) => updateText("dismissal_type", e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-white"
                  >
                    <option value="">-</option>
                    <option value="bowled">bowled</option>
                    <option value="caught">caught</option>
                    <option value="lbw">lbw</option>
                    <option value="run_out">run_out</option>
                    <option value="stumped">stumped</option>
                    <option value="hit_wicket">hit_wicket</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2FA36B]/30 bg-[linear-gradient(180deg,_rgba(47,163,107,0.05),_rgba(13,18,25,1))] p-4">
              <h3 className="mb-4 text-lg font-semibold text-[#F5F7FA]">Bowling</h3>

              <div className="grid grid-cols-2 gap-3">
                {renderField("Dot Balls", row.dot_balls, (v) => updateScore("dot_balls", v))}
                {renderField("Wickets", row.wickets, (v) => updateScore("wickets", v))}
                {renderField("LBW/Bowled", row.bowled_or_lbw_wickets, (v) =>
                  updateScore("bowled_or_lbw_wickets", v)
                )}
                {renderField("Maidens", row.maiden_overs, (v) => updateScore("maiden_overs", v))}
                {renderField("Overs", row.overs_bowled, (v) => updateScore("overs_bowled", v), true)}
                {renderField("Runs Conceded", row.runs_conceded, (v) =>
                  updateScore("runs_conceded", v)
                )}
              </div>

              <div className="mt-3 text-xs text-[#778396]">
                Parsed overs: {oversParsedLabel}
              </div>
            </div>

            <div className="rounded-2xl border border-[#4E6FAE]/30 bg-[linear-gradient(180deg,_rgba(78,111,174,0.06),_rgba(13,18,25,1))] p-4">
              <h3 className="mb-4 text-lg font-semibold text-[#F5F7FA]">
                Fielding & Summary
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {renderField("Catches", row.catches, (v) => updateScore("catches", v))}
                {renderField("Stumpings", row.stumpings, (v) => updateScore("stumpings", v))}
                {renderField("Run Outs", row.run_outs, (v) => updateScore("run_outs", v))}
              </div>

              <div className="mt-5 rounded-xl border border-[#243041] bg-[#0A0F15] p-4">
                <p className="text-sm text-[#778396]">Preview Points</p>
                <p className="mt-2 text-3xl font-bold text-[#F5F7FA]">{preview}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {renderMiniMetric("XI", breakdown.playing_xi_points)}
                {renderMiniMetric("Bat", breakdown.batting_points)}
                {renderMiniMetric("Bat Milestone", breakdown.batting_milestone_points)}
                {renderMiniMetric("SR", breakdown.strike_rate_points)}
                {renderMiniMetric("Bowl", breakdown.bowling_points)}
                {renderMiniMetric("Bowl Milestone", breakdown.bowling_milestone_points)}
                {renderMiniMetric("Eco", breakdown.economy_points)}
                {renderMiniMetric("Field", breakdown.fielding_points)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBox({
  label,
  value,
  labelClassName = "text-[#778396]",
  valueClassName = "text-sm text-[#A8B3C2]",
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-[#243041] bg-[#0B1017] px-3 py-2">
      <p className={`text-[11px] uppercase tracking-[0.16em] ${labelClassName}`}>
        {label}
      </p>
      <p className={`mt-1 ${valueClassName}`}>{value}</p>
    </div>
  );
}