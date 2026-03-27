import { getBaseUrl } from "@/src/lib/base-url";
import { PageShell } from "@/components/premium/page-shell";
import { Panel } from "@/components/premium/panel";
import { Pill } from "@/components/premium/pill";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionTitle } from "@/components/premium/section-title";
import { TeamRow } from "@/components/premium/team-row";

async function getLeagueData() {
  const res = await fetch(`${getBaseUrl()}/api/league`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch league data");
  }

  const json = await res.json();
  return json.data;
}

export default async function LeaguePage() {
  const teams = await getLeagueData();

  const readyTeams = teams.filter(
    (team: any) => team.captain_set && team.vice_captain_set
  ).length;

  const totalSubsLeft = teams.reduce((sum: number, team: any) => {
    const profile = Array.isArray(team.profiles) ? team.profiles[0] : team.profiles;
    return sum + (profile?.substitutions_left ?? 0);
  }, 0);

  const avgPlayers =
    teams.length > 0
      ? (
          teams.reduce(
            (sum: number, team: any) => sum + (team.player_count ?? 0),
            0
          ) / teams.length
        ).toFixed(1)
      : "0.0";

  return (
    <PageShell>
      <section className="sp-hero p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Pill tone="gold">League overview</Pill>
              <Pill tone="default">Private fantasy squads</Pill>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
              An elevated view of every
              <span className="block text-emerald-200"> squad in play.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Owners, captaincy, substitutions, and roster readiness presented
              with premium scanability, just like a real fantasy control room.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Total teams"
                value={teams.length}
                subtitle="All league slots active"
                accent="emerald"
              />
              <MetricCard
                label="Avg squad size"
                value={avgPlayers}
                subtitle="Players selected per team"
                accent="cyan"
              />
              <MetricCard
                label="Subs left"
                value={totalSubsLeft}
                subtitle="League-wide flexibility remaining"
                accent="gold"
              />
            </div>
          </div>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  League pulse
                </div>
                <div className="mt-2 text-2xl font-semibold">Readiness snapshot</div>
              </div>
              <Pill tone="success">{readyTeams} ready</Pill>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Captains configured
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-50">
                  {readyTeams}/{teams.length}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Pending setups
                </div>
                <div className="mt-2 text-2xl font-semibold text-amber-100">
                  {teams.length - readyTeams}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  League format
                </div>
                <div className="mt-2 text-base text-stone-200">
                  Premium private fantasy table
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="League squads"
          title="Every owner, lineup, and setup state"
          subtitle="Cleaner, richer squad cards driven by the shared premium component system."
        />

        <div className="mt-6 grid gap-5">
          {teams.map((team: any) => {
            const profile = Array.isArray(team.profiles)
              ? team.profiles[0]
              : team.profiles;

            return (
              <TeamRow
                key={team.id}
                id={team.id}
                teamName={team.team_name}
                managerName={profile?.display_name}
                playerCount={team.player_count ?? 0}
                substitutionsLeft={profile?.substitutions_left ?? 0}
                captainSet={!!team.captain_set}
                viceCaptainSet={!!team.vice_captain_set}
              />
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}