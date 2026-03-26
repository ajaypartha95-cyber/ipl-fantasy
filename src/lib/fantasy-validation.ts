import type { FantasyScoreInput } from "./fantasy-scoring";

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export function parseCricketOvers(value: number): {
  isValid: boolean;
  balls: number;
  normalized: string;
} {
  if (value < 0) {
    return { isValid: false, balls: 0, normalized: "0.0" };
  }

  const str = String(value);

  if (!str.includes(".")) {
    const overs = Number(str);
    if (!Number.isInteger(overs) || overs > 4) {
      return { isValid: false, balls: 0, normalized: "0.0" };
    }

    return {
      isValid: true,
      balls: overs * 6,
      normalized: `${overs}.0`,
    };
  }

  const parts = str.split(".");
  if (parts.length !== 2) {
    return { isValid: false, balls: 0, normalized: "0.0" };
  }

  const overs = Number(parts[0]);
  const ballsPart = Number(parts[1]);

  if (
    !Number.isInteger(overs) ||
    !Number.isInteger(ballsPart) ||
    overs < 0 ||
    overs > 4 ||
    ballsPart < 0 ||
    ballsPart > 5
  ) {
    return { isValid: false, balls: 0, normalized: "0.0" };
  }

  const totalBalls = overs * 6 + ballsPart;
  if (totalBalls > 24) {
    return { isValid: false, balls: 0, normalized: "0.0" };
  }

  return {
    isValid: true,
    balls: totalBalls,
    normalized: `${overs}.${ballsPart}`,
  };
}

export function validatePlayerScoreRow(
  input: FantasyScoreInput
): ValidationResult {
  const errors: string[] = [];

  const boundaryRuns = input.fours * 4 + input.sixes * 6;

  if (input.runs < 0) errors.push("Runs cannot be negative.");
  if (input.fours < 0) errors.push("Fours cannot be negative.");
  if (input.sixes < 0) errors.push("Sixes cannot be negative.");
  if (input.balls_faced < 0) errors.push("Balls faced cannot be negative.");
  if (input.dot_balls < 0) errors.push("Dot balls cannot be negative.");
  if (input.wickets < 0) errors.push("Wickets cannot be negative.");
  if (input.bowled_or_lbw_wickets < 0) errors.push("Bowled/LBW wickets cannot be negative.");
  if (input.maiden_overs < 0) errors.push("Maidens cannot be negative.");
  if (input.runs_conceded < 0) errors.push("Runs conceded cannot be negative.");
  if (input.catches < 0) errors.push("Catches cannot be negative.");
  if (input.stumpings < 0) errors.push("Stumpings cannot be negative.");
  if (input.run_outs < 0) errors.push("Run outs cannot be negative.");

  if (boundaryRuns > input.runs) {
    errors.push("Boundary runs cannot exceed total runs.");
  }

  if (input.fours + input.sixes > input.balls_faced) {
    errors.push("Fours and sixes together cannot exceed balls faced.");
  }

  if (input.dot_balls > 24) {
    errors.push("Dot balls cannot exceed 24.");
  }

  if (input.wickets > 10) {
    errors.push("Wickets cannot exceed 10.");
  }

  if (input.bowled_or_lbw_wickets > input.wickets) {
    errors.push("Bowled/LBW wickets cannot exceed total wickets.");
  }

  if (input.maiden_overs > 4) {
    errors.push("Maidens cannot exceed 4.");
  }

  if (input.maiden_overs > 0 && input.dot_balls < input.maiden_overs * 6) {
    errors.push("Maidens require at least 6 dot balls each.");
  }

  const oversParsed = parseCricketOvers(input.overs_bowled);
  if (!oversParsed.isValid) {
    errors.push("Overs must be valid cricket overs like 3.4, 3.5, or 4.0.");
  }

  if (input.catches > 10) {
    errors.push("Catches cannot exceed 10.");
  }

  if (input.stumpings > 10) {
    errors.push("Stumpings cannot exceed 10.");
  }

  if (input.run_outs > 10) {
    errors.push("Run outs cannot exceed 10.");
  }

  if (!input.is_out && input.dismissal_type.trim() !== "") {
    errors.push("Dismissal type should be blank if player is not out.");
  }

  if (input.is_out && input.dismissal_type.trim() === "") {
    errors.push("Dismissal type is required if player is out.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}