import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

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
  dotBalls: number;
};

interface EspnPlayer {
  name: string;
  longName?: string;
}

interface EspnBatsman {
  battedType: string; // "yes" | "DNB" | "sub"
  isOut: boolean;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissalText?: {
    long?: string;
    short?: string;
  };
  player: EspnPlayer;
}

interface EspnBowler {
  overs: number;
  maidens: number;
  conceded: number; // runs conceded — ESPN uses "conceded", not "runs"
  wickets: number;
  dots?: number; // dot balls — ESPN column "0S"
  player: EspnPlayer;
}

interface EspnInnings {
  inningNumber: number;
  inningBatsmen?: EspnBatsman[];
  inningBowlers?: EspnBowler[];
}

function extractInnings(nextData: unknown): EspnInnings[] | null {
  try {
    // Path: props.appPageProps.data.content.innings
    const root = nextData as Record<string, unknown>;
    const props = root?.props as Record<string, unknown>;
    const appPageProps = props?.appPageProps as Record<string, unknown>;
    const data = appPageProps?.data as Record<string, unknown>;
    const content = data?.content as Record<string, unknown>;
    const innings = content?.innings;
    return Array.isArray(innings) ? (innings as EspnInnings[]) : null;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(req.url);
  const espnUrl = searchParams.get("espnUrl");
  const inningsNumber = Number(searchParams.get("innings") ?? "1");

  if (!espnUrl) {
    return NextResponse.json(
      { success: false, error: "espnUrl query param is required." },
      { status: 400 }
    );
  }

  if (!espnUrl.includes("espncricinfo.com")) {
    return NextResponse.json(
      { success: false, error: "URL must be from espncricinfo.com." },
      { status: 400 }
    );
  }

  let html: string;
  try {
    const response = await fetch(espnUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Referer: "https://www.espncricinfo.com/",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
      },
    });

    if (!response.ok) {
      console.error(`[fetch-espn] ESPNCricinfo returned HTTP ${response.status} for ${espnUrl}`);
      return NextResponse.json(
        {
          success: false,
          error: `ESPNCricinfo returned HTTP ${response.status}. The site may be blocking server-side requests — try the screenshot import instead.`,
        },
        { status: 502 }
      );
    }

    html = await response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error(`[fetch-espn] fetch threw: ${message}`, err);
    return NextResponse.json(
      {
        success: false,
        error: `Could not reach ESPNCricinfo: ${message}.`,
      },
      { status: 502 }
    );
  }

  const scriptMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );

  if (!scriptMatch?.[1]) {
    return NextResponse.json(
      {
        success: false,
        error:
          "No scorecard data found in the page. Make sure the URL points to a full scorecard (e.g. ends in /full-scorecard or /match-scorecard).",
      },
      { status: 422 }
    );
  }

  let nextData: unknown;
  try {
    nextData = JSON.parse(scriptMatch[1]);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to parse scorecard data from page." },
      { status: 422 }
    );
  }

  const innings = extractInnings(nextData);

  if (!innings || innings.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error:
          "No innings data found. Make sure the match is completed and the URL is for the full scorecard.",
      },
      { status: 422 }
    );
  }

  const targetInnings = innings.find((inn) => inn.inningNumber === inningsNumber);

  if (!targetInnings) {
    const available = innings.map((i) => i.inningNumber).join(", ");
    return NextResponse.json(
      {
        success: false,
        error: `Innings ${inningsNumber} not found. Available: ${available}.`,
      },
      { status: 422 }
    );
  }

  const battingRows: ParsedBattingRow[] = (targetInnings.inningBatsmen ?? [])
    .filter((b) => b.battedType === "yes")
    .map((b) => ({
      name: b.player.longName ?? b.player.name,
      dismissalText: b.isOut ? (b.dismissalText?.long ?? "") : "not out",
      runs: b.runs ?? 0,
      balls: b.balls ?? 0,
      fours: b.fours ?? 0,
      sixes: b.sixes ?? 0,
    }));

  const bowlingRows: ParsedBowlingRow[] = (targetInnings.inningBowlers ?? []).map((b) => ({
    name: b.player.longName ?? b.player.name,
    overs: b.overs ?? 0,
    maidens: b.maidens ?? 0,
    runsConceded: b.conceded ?? 0,
    wickets: b.wickets ?? 0,
    dotBalls: b.dots ?? 0,
  }));

  return NextResponse.json({
    success: true,
    meta: { innings: inningsNumber },
    parsed: { battingRows, bowlingRows },
  });
}
