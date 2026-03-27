import Link from "next/link";
import { getBaseUrl } from "@/src/lib/base-url";
import { PageShell } from "@/components/premium/page-shell";
import { Panel } from "@/components/premium/panel";
import { Pill } from "@/components/premium/pill";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionTitle } from "@/components/premium/section-title";
import { PlayerChipCard } from "@/components/premium/player-chip-card";

async function getComparison(team2: string) {
  const res = await fetch(
    `${getBaseUrl()}/api/compare?team1=1&team2=${team2}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch comparison");
  }

  const json = await res.json();
  return json.data;
}

async function getTeams() {
  const res = await fetch(`${getBaseUrl()}/api/compare-teams`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch teams");
  }

  const json = await res.json();
  return json.data;
}

function renderPlayerGrid(players: any[]) {
  if (!players.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-stone-400">
        None
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {players.map((player: any) => (
        <PlayerChipCard
          key={player.id}
          name={player.name}
          role={player.role}
          iplTeam={player.ipl_team}
        />
      ))}
    </div>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ team2?: string }>;
}) {
  const params = await searchParams;
  const selectedTeam2 = params.team2 || "2";

  const [comparison, teams] = await Promise.all([
    getComparison(selectedTeam2),
    getTeams(),
  ]);

  const teamOptions = teams.filter((team: any) => team.id !== 1);
  const selectedTeam = teamOptions.find(
    (team: any) => String(team.id) === selectedTeam2
  );

  const selectedProfile = Array.isArray(selectedTeam?.profiles)
    ? selectedTeam?.profiles[0]
    : selectedTeam?.profiles;

  return (
    <PageShell>
      <section className="sp-hero p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Pill tone="gold">Squad compare</Pill>
              <Pill tone="info">Ajay XI vs challenger</Pill>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
              Spot overlap,
              <span className="block text-cyan-100">find the difference makers.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Compare Ajay XI against another squad to see shared picks, unique
              punts, and where the fantasy edge could come from.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Common players"
                value={comparison.commonPlayers.length}
                subtitle="Shared picks across both squads"
                accent="emerald"
              />
              <MetricCard
                label="Only in Ajay XI"
                value={comparison.onlyTeam1.length}
                subtitle="Exclusive picks in your squad"
                accent="cyan"
              />
              <MetricCard
                label={`Only in ${selectedTeam?.team_name || "Selected Team"}`}
                value={comparison.onlyTeam2.length}
                subtitle="Exclusive picks in the other squad"
                accent="gold"
              />
            </div>
          </div>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Comparison target
                </div>
                <div className="mt-2 text-2xl font-semibold">Choose a squad</div>
              </div>
              <Pill tone="success">Live compare</Pill>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {teamOptions.map((team: any) => {
                const profile = Array.isArray(team.profiles)
                  ? team.profiles[0]
                  : team.profiles;

                const isActive = String(team.id) === selectedTeam2;

                return (
                  <Link
                    key={team.id}
                    href={`/compare?team2=${team.id}`}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-white/10 bg-white/[0.12] text-white"
                        : "border-white/10 bg-white/[0.04] text-stone-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {profile?.display_name}
                  </Link>
                );
              })}
            </div>

            {selectedProfile && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Currently comparing with
                </div>
                <div className="mt-2 text-xl font-semibold text-stone-50">
                  {selectedProfile.display_name}
                </div>
                <div className="mt-1 text-sm text-stone-400">
                  {selectedTeam?.team_name || "Selected Team"}
                </div>
              </div>
            )}
          </Panel>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Comparison breakdown"
          title="Where the squads overlap and differ"
          subtitle="Shared players in the middle, exclusive picks on either side."
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <Panel className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-stone-50">Only in Ajay XI</h2>
              <Pill tone="info">{comparison.onlyTeam1.length}</Pill>
            </div>
            {renderPlayerGrid(comparison.onlyTeam1)}
          </Panel>

          <Panel className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-stone-50">Common Players</h2>
              <Pill tone="success">{comparison.commonPlayers.length}</Pill>
            </div>
            {renderPlayerGrid(comparison.commonPlayers)}
          </Panel>

          <Panel className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-stone-50">
                Only in {selectedTeam?.team_name || "Selected Team"}
              </h2>
              <Pill tone="gold">{comparison.onlyTeam2.length}</Pill>
            </div>
            {renderPlayerGrid(comparison.onlyTeam2)}
          </Panel>
        </div>
      </section>
    </PageShell>
  );
}