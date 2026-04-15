import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type PagePlayer = {
  id: number;
  name: string;
  role: string;
  ipl_team: string;
};

type ParsedBattingRow = {
  name: string;
  dismissalText: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
};

type ParsedBowlingRow = {
  name: string;
  overs: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
};

function normalizeLine(line: string) {
  return line
    .replace(/[|]+/g, " ")
    .replace(/[<>]+/g, " ")
    .replace(/[‘’`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripRoleMarkersFromName(value: string) {
  return value
    .replace(/\s*\((?:c|wk|c\s*&\s*wk|wk\s*&\s*c)\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value: string) {
  const cleaned = value.trim().replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalizeNumericToken(token: string) {
  return token.trim().replace(/^[oO]$/, "0").replace(/[oO]/g, "0");
}

function isLikelyBattingHeader(line: string) {
  const normalized = line.toLowerCase();
  return (
    normalized.includes("batter") ||
    normalized.includes("batsman") ||
    normalized.includes(" r b 4s 6s sr") ||
    normalized.includes("r b 4s 6s sr")
  );
}

function isLikelyBowlingHeader(line: string) {
  const normalized = line.toLowerCase();
  return (
    normalized.startsWith("bowler") ||
    normalized.includes(" o m r w ") ||
    normalized.includes("o m r w")
  );
}

function isSkippableLine(line: string) {
  const normalized = line.toLowerCase();
  return (
    normalized.startsWith("extras") ||
    normalized.startsWith("total") ||
    normalized.startsWith("did not bat") ||
    normalized.startsWith("fall of wickets") ||
    normalized.startsWith("yet to bat")
  );
}

function splitSections(lines: string[]) {
  const battingLines: string[] = [];
  const bowlingLines: string[] = [];

  let inBatting = false;
  let inBowling = false;

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (!line) continue;

    if (isLikelyBattingHeader(line)) {
      inBatting = true;
      inBowling = false;
      continue;
    }

    if (isLikelyBowlingHeader(line)) {
      inBatting = false;
      inBowling = true;
      continue;
    }

    if (isSkippableLine(line)) continue;

    if (inBatting) battingLines.push(line);
    if (inBowling) bowlingLines.push(line);
  }

  return { battingLines, bowlingLines };
}

function scorePlayerMatch(text: string, player: PagePlayer) {
  const normalizedText = normalizeName(text);
  const normalizedPlayer = normalizeName(player.name);

  if (!normalizedText || !normalizedPlayer) return 0;

  let score = 0;

  if (normalizedText.startsWith(normalizedPlayer)) score += 120;
  if (normalizedText.includes(normalizedPlayer)) score += 90;

  const playerWords = normalizedPlayer.split(" ").filter(Boolean);
  const matchedWords = playerWords.filter((word) =>
    normalizedText.includes(word)
  ).length;
  score += matchedWords * 15;

  const joinedPlayer = normalizedPlayer.replace(/\s+/g, "");
  const joinedText = normalizedText.replace(/\s+/g, "");
  if (joinedText.includes(joinedPlayer)) score += 40;

  return score;
}

function findBestPlayerMatch(text: string, candidates: PagePlayer[]) {
  let best: PagePlayer | null = null;
  let bestScore = -1;

  for (const player of candidates) {
    const score = scorePlayerMatch(text, player);
    if (score > bestScore) {
      best = player;
      bestScore = score;
    }
  }

  if (!best || bestScore < 90) return null;
  return best;
}

function replaceMatchedName(originalText: string, playerName: string) {
  const escaped = playerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const directRegex = new RegExp(escaped, "i");
  if (directRegex.test(originalText)) {
    return originalText.replace(directRegex, "").trim();
  }

  const playerWords = playerName.split(/\s+/).filter(Boolean);
  let updated = originalText;
  for (const word of playerWords) {
    const wordRegex = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );
    updated = updated.replace(wordRegex, " ");
  }

  return updated.replace(/\s+/g, " ").trim();
}

function cleanupDismissalNoise(text: string) {
  return text
    .replace(/[~]+/g, " ")
    .replace(/\(\s*c\s*&\s*wk\s*\)/gi, "")
    .replace(/\(\s*wk\s*&\s*c\s*\)/gi, "")
    .replace(/\(\s*c\s*\)/gi, "")
    .replace(/\(\s*wk\s*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDismissalPrefix(text: string) {
  let t = text.trim();

  t = t.replace(/^[¢€£@&*]+/, "c ");
  t = t.replace(/^[:;.,-]+\s*/, "");
  t = t.replace(/^c(?=[A-Z])/, "c ");
  t = t.replace(/\s+/g, " ").trim();

  return t;
}

function canonicalizeDismissalText(
  dismissalText: string,
  fieldingCandidates: PagePlayer[],
  bowlerCandidates: PagePlayer[]
) {
  let text = normalizeDismissalPrefix(cleanupDismissalNoise(dismissalText));

  if (!text) return "";
  if (
    /^not out$/i.test(text) ||
    /^n0t out$/i.test(text) ||
    /^not\s*0ut$/i.test(text)
  ) {
    return "not out";
  }

  const lower = text.toLowerCase();

  if (lower.includes("c & b")) {
    const bowler = findBestPlayerMatch(text, bowlerCandidates);
    return bowler ? `c & b ${bowler.name}` : text;
  }

  if (lower.startsWith("lbw") || lower.includes(" lbw ")) {
    const bowlerMatch = text.match(/\bb\s+(.+)$/i);
    const bowler = bowlerMatch
      ? findBestPlayerMatch(bowlerMatch[1], bowlerCandidates)
      : findBestPlayerMatch(text, bowlerCandidates);
    return bowler ? `lbw b ${bowler.name}` : text;
  }

  if (/^st\s+/i.test(text) || lower.includes(" st ")) {
    const bowlerMatch = text.match(/\bb\s+(.+)$/i);
    const bowler = bowlerMatch
      ? findBestPlayerMatch(bowlerMatch[1], bowlerCandidates)
      : null;

    const keeperPart = text
      .replace(/^st\s+/i, "")
      .replace(/\bb\s+.+$/i, "")
      .trim();

    const keeper = findBestPlayerMatch(keeperPart, fieldingCandidates);

    if (keeper && bowler) return `st ${keeper.name} b ${bowler.name}`;
    if (keeper) return `st ${keeper.name}`;
    return text;
  }

  if (/^c\s+/i.test(text) || lower.includes(" c ")) {
    const bowlerMatch = text.match(/\bb\s+(.+)$/i);
    const bowler = bowlerMatch
      ? findBestPlayerMatch(bowlerMatch[1], bowlerCandidates)
      : null;

    const catcherPart = text
      .replace(/^c\s+/i, "")
      .replace(/\bb\s+.+$/i, "")
      .trim();

    const catcher = findBestPlayerMatch(catcherPart, fieldingCandidates);

    if (catcher && bowler) return `c ${catcher.name} b ${bowler.name}`;
    if (catcher) return `c ${catcher.name}`;
    if (bowler) return `b ${bowler.name}`;
    return text;
  }

  if (/^b\s+/i.test(text) || lower.includes(" b ")) {
    const bowlerMatch = text.match(/\bb\s+(.+)$/i);
    const bowler = bowlerMatch
      ? findBestPlayerMatch(bowlerMatch[1], bowlerCandidates)
      : null;
    return bowler ? `b ${bowler.name}` : text;
  }

  return text;
}

function parseBattingRowWithPlayers(
  line: string,
  battingCandidates: PagePlayer[],
  fieldingCandidates: PagePlayer[],
  bowlerCandidates: PagePlayer[]
): ParsedBattingRow | null {
  const cleaned = normalizeLine(line);

  const numericRegex = /(\d+(?:\.\d+)?)/g;
  const numericMatches = [...cleaned.matchAll(numericRegex)];
  if (numericMatches.length < 5) return null;

  const tail = numericMatches.slice(-5);
  const runsToken = tail[0][1];
  const ballsToken = tail[1][1];
  const foursToken = tail[2][1];
  const sixesToken = tail[3][1];

  const leftPart = cleaned.slice(0, tail[0].index).trim();
  if (!leftPart) return null;

  const matchedBatter = findBestPlayerMatch(leftPart, battingCandidates);
  if (!matchedBatter) return null;

  let dismissalText = replaceMatchedName(leftPart, matchedBatter.name);
  dismissalText = canonicalizeDismissalText(
    dismissalText,
    fieldingCandidates,
    bowlerCandidates
  );

  return {
    name: stripRoleMarkersFromName(matchedBatter.name),
    dismissalText,
    runs: parseNumber(runsToken),
    balls: parseNumber(ballsToken),
    fours: parseNumber(foursToken),
    sixes: parseNumber(sixesToken),
  };
}

function parseBowlingRowWithPlayers(
  line: string,
  bowlerCandidates: PagePlayer[]
): ParsedBowlingRow | null {
  const cleaned = normalizeLine(line);
  const matchedBowler = findBestPlayerMatch(cleaned, bowlerCandidates);
  if (!matchedBowler) return null;

  const tokens = cleaned.split(/\s+/);
  const firstNumericIndex = tokens.findIndex((token) => /^[\d.oO]+$/.test(token));
  if (firstNumericIndex <= 0) return null;

  const statTokens = tokens.slice(firstNumericIndex).map(normalizeNumericToken);
  if (statTokens.length < 4) return null;

  return {
    name: matchedBowler.name,
    overs: parseNumber(statTokens[0]),
    maidens: parseNumber(statTokens[1]),
    runsConceded: parseNumber(statTokens[2]),
    wickets: parseNumber(statTokens[3]),
  };
}

function dedupeBattingRows(rows: ParsedBattingRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.name}__${row.runs}__${row.balls}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeBowlingRows(rows: ParsedBowlingRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.name}__${row.overs}__${row.runsConceded}__${row.wickets}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const matchId = formData.get("matchId");
    const innings = formData.get("innings");
    const ocrText = formData.get("ocrText");
    const pagePlayersRaw = formData.get("pagePlayers");

    if (!matchId || !innings || !ocrText || !pagePlayersRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "matchId, innings, ocrText, and pagePlayers are required.",
        },
        { status: 400 }
      );
    }

    const rawText = String(ocrText);
    const pagePlayers = JSON.parse(String(pagePlayersRaw)) as PagePlayer[];

    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const { battingLines, bowlingLines } = splitSections(lines);

    const battingCandidates = pagePlayers.filter(
      (player) => player.role === "Batter" || player.role === "All Rounder"
    );

    const fieldingCandidates = pagePlayers;
    const bowlerCandidates = pagePlayers.filter(
      (player) => player.role === "Bowler" || player.role === "All Rounder"
    );

    const battingRows = dedupeBattingRows(
      battingLines
        .map((line) =>
          parseBattingRowWithPlayers(
            line,
            battingCandidates,
            fieldingCandidates,
            bowlerCandidates
          )
        )
        .filter((row): row is ParsedBattingRow => Boolean(row))
    );

    const bowlingRows = dedupeBowlingRows(
      bowlingLines
        .map((line) => parseBowlingRowWithPlayers(line, bowlerCandidates))
        .filter((row): row is ParsedBowlingRow => Boolean(row))
    );

    return NextResponse.json({
      success: true,
      message: "OCR text parsed successfully.",
      meta: {
        matchId: String(matchId),
        innings: Number(innings),
      },
      ocrText: rawText,
      debug: {
        battingLines,
        bowlingLines,
      },
      parsed: {
        battingRows,
        bowlingRows,
      },
      warnings: [],
    });
  } catch (error) {
    console.error("import-scorecard POST failed", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse OCR text.",
      },
      { status: 500 }
    );
  }
}