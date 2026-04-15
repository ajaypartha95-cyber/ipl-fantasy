import Link from "next/link";
import { getBaseUrl } from "@/src/lib/base-url";
import { PageShell } from "@/components/premium/page-shell";
import { Panel } from "@/components/premium/panel";
import { Pill } from "@/components/premium/pill";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionTitle } from "@/components/premium/section-title";
import { SquadTable } from "@/components/premium/squad-table";

async function getTeam(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/team/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch team");
  }

  return res.json();
}

async function getMatchHistory(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/team/${id}/match-history`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch team match history");
  }

  const json = await res.json();
  return json.data;
}

function formatMatchDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}


export default async function TeamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ team, players }, matchHistory] = await Promise.all([
    getTeam(id),
    getMatchHistory(id),
  ]);

  const captainId = team.captain_player_id;
  const viceCaptainId = team.vice_captain_player_id;
  const profile = Array.isArray(team.profiles) ? team.profiles[0] : team.profiles;

  const hasCaptain = !!captainId;
  const hasViceCaptain = !!viceCaptainId;

  const totalBasePoints = matchHistory.reduce(
    (sum: number, row: any) => sum + (row.base_points ?? 0),
    0
  );

  const totalFantasyPoints = matchHistory.reduce(
    (sum: number, row: any) => sum + (row.total_points ?? 0),
    0
  );

  const captainPlayer = players
    .map((item: any) => (Array.isArray(item.players) ? item.players[0] : item.players))
    .find((player: any) => player?.id === captainId);

  const viceCaptainPlayer = players
    .map((item: any) => (Array.isArray(item.players) ? item.players[0] : item.players))
    .find((player: any) => player?.id === viceCaptainId);

  return (
    <PageShell>
      <section className="sp-hero p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Pill tone="gold">Silly Point Squad</Pill>
              <Pill tone="info">Every over counts</Pill>
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
              {team.team_name}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Managed by <span className="font-medium text-stone-50">{profile?.display_name}</span>. 
              View your selected XI, leadership choices, and full match-by-match fantasy ledger.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <MetricCard
                label="Squad size"
                value={players.length}
                subtitle="Selected fantasy players"
                accent="emerald"
              />
              <MetricCard
                label="Scored matches"
                value={matchHistory.length}
                subtitle="Fixtures with fantasy totals"
                accent="cyan"
              />
              <MetricCard
                label="Base points"
                value={totalBasePoints}
                subtitle="Before captaincy multipliers"
                accent="neutral"
              />
              <MetricCard
                label="Fantasy points"
                value={totalFantasyPoints}
                subtitle="Total with C and VC impact"
                accent="gold"
              />
            </div>
          </div>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Leadership core
                </div>
                <div className="mt-2 text-2xl font-semibold">Captaincy spine</div>
              </div>
              <Pill tone={hasCaptain && hasViceCaptain ? "success" : "gold"}>
                {hasCaptain && hasViceCaptain ? "Ready" : "Needs setup"}
              </Pill>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Captain
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-50">
                  {captainPlayer?.name || "Not selected"}
                </div>
                <div className="mt-1 text-sm text-stone-400">
                  {captainPlayer?.ipl_team || "Choose a captain"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Vice-captain
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-50">
                  {viceCaptainPlayer?.name || "Not selected"}
                </div>
                <div className="mt-1 text-sm text-stone-400">
                  {viceCaptainPlayer?.ipl_team || "Choose a vice-captain"}
                </div>
              </div>

              {(!hasCaptain || !hasViceCaptain) && (
                <div className="rounded-2xl border border-amber-300/15 bg-amber-400/10 p-4">
                  <div className="text-sm text-amber-100">
                    Captain and vice-captain have not been fully selected yet.
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/team/${team.id}/setup`}
                      className="sp-button-primary"
                    >
                      Set Captain & Vice-Captain
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Squad sheet"
          title="Selected players"
          subtitle="Your current fantasy squad, player roles, IPL teams, and leadership tags."
        />

        <Panel className="mt-6 overflow-hidden">
          <SquadTable
            players={players}
            captainId={captainId}
            viceCaptainId={viceCaptainId}
          />
        </Panel>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Match ledger"
          title="Fantasy scoring history"
          subtitle="Base scoring, captaincy bonuses, and final fantasy totals by match."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Scored matches"
            value={matchHistory.length}
            subtitle="Fixtures already completed"
            accent="emerald"
          />
          <MetricCard
            label="Total base points"
            value={totalBasePoints}
            subtitle="Without C and VC multipliers"
            accent="cyan"
          />
          <MetricCard
            label="Total fantasy points"
            value={totalFantasyPoints}
            subtitle="Including leadership bonuses"
            accent="gold"
          />
        </div>

        {matchHistory.length === 0 ? (
          <Panel className="mt-6 p-6 text-stone-400">
            No match points available yet.
          </Panel>
        ) : (
          <Panel className="mt-6 overflow-hidden">
            <div className="hidden border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs uppercase tracking-[0.18em] text-stone-500 md:grid md:grid-cols-[90px_1.2fr_220px_100px_100px_100px_120px_160px]">
              <div>Match</div>
              <div>Fixture</div>
              <div>Date</div>
              <div>Base</div>
              <div>C Bonus</div>
              <div>VC Bonus</div>
              <div>Total</div>
              <div>Action</div>
            </div>

            <div>
              {matchHistory.map((row: any) => {
                const match = Array.isArray(row.matches) ? row.matches[0] : row.matches;

                return (
                  <div
                    key={row.id}
                    className="grid items-center gap-4 border-t border-white/10 px-5 py-4 first:border-t-0 md:grid-cols-[90px_1.2fr_220px_100px_100px_100px_120px_160px]"
                  >
                    <div className="font-medium text-stone-50">#{match?.match_number}</div>

                    <div className="text-stone-300">
                      {match?.team_1} vs {match?.team_2}
                    </div>

                    <div className="text-stone-300">
                      {formatMatchDate(match?.match_date)}
                    </div>

                    <div className="font-medium text-stone-50">
                      {row.base_points ?? 0}
                    </div>

                    <div className="font-medium text-amber-100">
                      {row.captain_bonus_points ?? 0}
                    </div>

                    <div className="font-medium text-cyan-100">
                      {row.vice_captain_bonus_points ?? 0}
                    </div>

                    <div className="text-lg font-semibold text-stone-50">
                      {row.total_points ?? 0}
                    </div>

                    <div>
                      <Link
                        href={`/team/${team.id}/match/${match.id}`}
                        className="sp-button-secondary"
                      >
                        View Breakdown
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </section>
    </PageShell>
  );
}