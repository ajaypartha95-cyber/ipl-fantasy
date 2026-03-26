import { parseCricketOvers } from "./fantasy-validation";
export type FantasyScoreInput = {
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

export type FantasyScoreBreakdown = {
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

function getBattingMilestonePoints(runs: number) {
  if (runs >= 100) return 16;
  if (runs >= 75) return 12;
  if (runs >= 50) return 8;
  if (runs >= 25) return 4;
  return 0;
}

function getStrikeRatePoints(runs: number, ballsFaced: number) {
  const eligible = ballsFaced >= 10 || runs >= 20;
  if (!eligible || ballsFaced <= 0) return 0;

  const strikeRate = (runs / ballsFaced) * 100;

  if (strikeRate > 190) return 8;
  if (strikeRate > 170 && strikeRate <= 190) return 6;
  if (strikeRate > 150 && strikeRate <= 170) return 4;
  if (strikeRate >= 130 && strikeRate <= 150) return 2;
  if (strikeRate >= 70 && strikeRate < 100) return -2;
  if (strikeRate >= 60 && strikeRate < 70) return -4;
  if (strikeRate >= 50 && strikeRate < 60) return -6;

  return 0;
}

function getBowlingMilestonePoints(wickets: number) {
  if (wickets >= 5) return 16;
  if (wickets >= 4) return 12;
  if (wickets >= 3) return 8;
  return 0;
}

function getEconomyPoints(oversBowled: number, runsConceded: number) {
  const parsed = parseCricketOvers(oversBowled);

  if (!parsed.isValid || parsed.balls < 12) return 0;

  const economy = (runsConceded * 6) / parsed.balls;

  if (economy < 5) return 8;
  if (economy >= 5 && economy <= 5.99) return 6;
  if (economy >= 6 && economy <= 7) return 4;
  if (economy >= 7.01 && economy <= 8) return 2;
  if (economy >= 10 && economy <= 11) return -2;
  if (economy >= 11.01 && economy <= 12) return -4;
  if (economy > 12) return -6;

  return 0;
}

export function calculateFantasyPoints(
  input: FantasyScoreInput
): FantasyScoreBreakdown {
  const playing_xi_points = input.in_starting_xi ? 4 : 0;

  const duckPenalty =
    input.is_out && input.runs === 0 && input.dismissal_type !== "run_out" ? -2 : 0;

  const batting_points =
    input.runs +
    input.fours * 4 +
    input.sixes * 6 +
    duckPenalty;

  const batting_milestone_points = getBattingMilestonePoints(input.runs);
  const strike_rate_points = getStrikeRatePoints(input.runs, input.balls_faced);

  const bowling_points =
    input.dot_balls * 2 +
    input.wickets * 30 +
    input.bowled_or_lbw_wickets * 8 +
    input.maiden_overs * 12;

  const bowling_milestone_points = getBowlingMilestonePoints(input.wickets);
  const economy_points = getEconomyPoints(
    input.overs_bowled,
    input.runs_conceded
  );

  const catchBonus = input.catches >= 3 ? 4 : 0;

  const fielding_points =
    input.catches * 8 +
    catchBonus +
    input.run_outs * 10 +
    input.stumpings * 12;

  const total_points =
    playing_xi_points +
    batting_points +
    batting_milestone_points +
    strike_rate_points +
    bowling_points +
    bowling_milestone_points +
    economy_points +
    fielding_points;

  return {
    playing_xi_points,
    batting_points,
    batting_milestone_points,
    strike_rate_points,
    bowling_points,
    bowling_milestone_points,
    economy_points,
    fielding_points,
    total_points,
  };
}