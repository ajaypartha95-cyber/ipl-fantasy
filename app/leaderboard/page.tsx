import { getBaseUrl } from "@/src/lib/base-url";
import { PageShell } from "@/components/premium/page-shell";
import { Panel } from "@/components/premium/panel";
import { Pill } from "@/components/premium/pill";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionTitle } from "@/components/premium/section-title";
import { LeaderboardRow } from "@/components/premium/leaderboard-row";

async function getLeaderboard() {
  const res = await fetch(`${getBaseUrl()}/api/leaderboard`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  const json = await res.json();

  return {
    rows: json.data ?? [],
    summary: json.summary ?? {
      matches_scored: 0,
      total_matches: 0,
    },
  };
}

function getProfileAndTeam(row: any) {
  const team = Array.isArray(row.fantasy_teams)
    ? row.fantasy_teams[0]
    : row.fantasy_teams;

  const profile = Array.isArray(team?.profiles)
    ? team?.profiles[0]
    : team?.profiles;

  return { team, profile };
}

function getPodiumTone(rank: number): "gold" | "info" | "default" {
  if (rank === 1) return "gold";
  if (rank === 2) return "info";
  return "default";
}

function getPodiumCardClass(rank: number) {
  if (rank === 1) {
    return "bg-[linear-gradient(180deg,rgba(252,211,77,0.14),rgba(255,255,255,0.03))]";
  }

  if (rank === 2) {
    return "bg-[linear-gradient(180deg,rgba(103,232,249,0.14),rgba(255,255,255,0.03))]";
  }

  return "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]";
}

export default async function LeaderboardPage() {
  const leaderboardPayload = await getLeaderboard();
  const rows = leaderboardPayload.rows;
  const summary = leaderboardPayload.summary;
  const topThree = rows.slice(0, 3);
  const leader = rows[0];

  const leaderProfile = leader ? getProfileAndTeam(leader).profile : null;
  const leaderTeam = leader ? getProfileAndTeam(leader).team : null;

  return (
    <PageShell>
      <section className="sp-hero p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Pill tone="gold">Silly Point Standings</Pill>
              <Pill tone="info">Every over counts</Pill>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
              The title race,
              <span className="block text-amber-100">one fixture at a time.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Follow the race for the top spot as every captaincy decision,
              points swing, and scored fixture reshapes the standings.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Matches scored"
                value={summary.matches_scored}
                subtitle={`Out of ${summary.total_matches} fixtures`}
                accent="emerald"
              />
              <MetricCard
                label="Current leader"
                value={leaderProfile?.display_name || "—"}
                subtitle={leaderTeam?.team_name || "No leader yet"}
                accent="cyan"
                className="[&>div:nth-child(2)]:text-2xl"
              />
              <MetricCard
                label="Highest points"
                value={leader?.total_points ?? 0}
                subtitle="Current benchmark to beat"
                accent="gold"
              />
            </div>
          </div>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Leader spotlight
                </div>
                <div className="mt-2 text-2xl font-semibold">Table topper</div>
              </div>
              <Pill tone="success">Live standings</Pill>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                Rank #1
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-stone-50">
                {leaderProfile?.display_name || "—"}
              </div>
              <div className="mt-2 text-stone-400">
                {leaderTeam?.team_name || "No team yet"}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                    Fantasy points
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-stone-50">
                    {leader?.total_points ?? 0}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                    Table status
                  </div>
                  <div className="mt-2">
                    <Pill tone="gold">Leader</Pill>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Podium"
          title="Top fantasy managers right now"
          subtitle="The top three managers leading the Silly Point table."
        />

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {topThree.map((row: any) => {
            const { team, profile } = getProfileAndTeam(row);

            return (
              <Panel
                key={row.id}
                className={`p-6 ${getPodiumCardClass(row.rank)}`}
              >
                <div className="flex items-center justify-between">
                  <Pill tone={getPodiumTone(row.rank)}>Rank #{row.rank}</Pill>
                  <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                    Silly Point
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-semibold tracking-tight text-stone-50">
                  {profile?.display_name || "—"}
                </h3>
                <p className="mt-2 text-sm text-stone-400">
                  {team?.team_name || "—"}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm text-stone-500">Fantasy Points</div>
                  <div className="mt-2 text-4xl font-semibold tracking-tight text-stone-50">
                    {row.total_points}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Standings"
          title="Full league table"
          subtitle="Every team ranked by total fantasy points."
        />

        <Panel className="mt-6 overflow-hidden">
          <div className="hidden border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs uppercase tracking-[0.18em] text-stone-500 md:grid md:grid-cols-[110px_1.1fr_1fr_160px]">
            <div>Rank</div>
            <div>Owner</div>
            <div>Team name</div>
            <div className="text-right">Total points</div>
          </div>

          <div>
            {rows.map((row: any) => {
              const { team, profile } = getProfileAndTeam(row);

              return (
                <LeaderboardRow
                  key={row.id}
                  rank={row.rank}
                  ownerName={profile?.display_name}
                  teamName={team?.team_name}
                  totalPoints={row.total_points ?? 0}
                />
              );
            })}
          </div>
        </Panel>
      </section>
    </PageShell>
  );
}