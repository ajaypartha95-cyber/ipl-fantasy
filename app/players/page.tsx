import { getBaseUrl } from "@/src/lib/base-url";
import { PageShell } from "@/components/premium/page-shell";
import { Panel } from "@/components/premium/panel";
import { Pill } from "@/components/premium/pill";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionTitle } from "@/components/premium/section-title";

async function getPlayers() {
  const res = await fetch(`${getBaseUrl()}/api/players`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch players");
  }

  const json = await res.json();
  return json.data;
}

function groupPlayersByTeam(players: any[]) {
  return players.reduce((acc: Record<string, any[]>, player) => {
    if (!acc[player.ipl_team]) {
      acc[player.ipl_team] = [];
    }
    acc[player.ipl_team].push(player);
    return acc;
  }, {});
}

function getRoleTone(role?: string): "gold" | "info" | "success" | "default" {
  const value = (role || "").toLowerCase();

  if (value.includes("all")) return "gold";
  if (value.includes("bowl")) return "info";
  if (value.includes("bat")) return "success";
  return "default";
}

export default async function PlayersPage() {
  const players = await getPlayers();
  const groupedPlayers = groupPlayersByTeam(players);

  const teams = Object.entries(groupedPlayers)
    .map(([teamName, teamPlayers]) => ({
      teamName,
      players: teamPlayers as any[],
    }))
    .sort((a, b) => a.teamName.localeCompare(b.teamName));

  const totalTeams = teams.length;
  const batters = players.filter((player: any) =>
    (player.role || "").toLowerCase().includes("bat")
  ).length;
  const bowlers = players.filter((player: any) =>
    (player.role || "").toLowerCase().includes("bowl")
  ).length;
  const allRounders = players.filter((player: any) =>
    (player.role || "").toLowerCase().includes("all")
  ).length;

  return (
    <PageShell>
      <section className="sp-hero p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Pill tone="gold">IPL 2026 Player Pool</Pill>
              <Pill tone="info">Fantasy scouting board</Pill>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
              Every player,
              <span className="block text-cyan-100">organized by franchise.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Browse the full player pool available in Silly Point, grouped by IPL team,
              so you can quickly scan the fantasy landscape across the season.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <MetricCard
                label="Total players"
                value={players.length}
                subtitle="Imported for IPL 2026"
                accent="emerald"
              />
              <MetricCard
                label="Franchises"
                value={totalTeams}
                subtitle="Teams represented"
                accent="cyan"
              />
              <MetricCard
                label="Bowlers"
                value={bowlers}
                subtitle="Specialist bowling options"
                accent="neutral"
              />
              <MetricCard
                label="All-rounders"
                value={allRounders}
                subtitle="Balanced fantasy upside"
                accent="gold"
              />
            </div>
          </div>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Pool summary
                </div>
                <div className="mt-2 text-2xl font-semibold">Role mix</div>
              </div>
              <Pill tone="success">Scouting ready</Pill>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Batters
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-50">
                  {batters}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Bowlers
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-50">
                  {bowlers}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  All-rounders
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-50">
                  {allRounders}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Franchise breakdown"
          title="Players by IPL team"
          subtitle="Grouped lists of every available player and their role."
        />

        <div className="mt-6 grid gap-6">
          {teams.map(({ teamName, players: teamPlayers }) => (
            <Panel key={teamName} className="overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-stone-50">
                      {teamName}
                    </h2>
                    <p className="mt-1 text-sm text-stone-400">
                      {teamPlayers.length} players in the current pool
                    </p>
                  </div>

                  <Pill tone="default">{teamPlayers.length} players</Pill>
                </div>
              </div>

              <div className="grid gap-0">
                {teamPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="grid items-center gap-4 border-t border-white/10 px-6 py-4 first:border-t-0 md:grid-cols-[1.3fr_220px]"
                  >
                    <div>
                      <div className="font-medium text-stone-50">{player.name}</div>
                    </div>

                    <div>
                      <Pill tone={getRoleTone(player.role)}>{player.role}</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </section>
    </PageShell>
  );
}