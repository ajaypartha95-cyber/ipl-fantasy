import { getBaseUrl } from "@/src/lib/base-url";
import { requireSignedInProfile } from "@/lib/auth";
import { PageShell } from "@/components/premium/page-shell";
import { Panel } from "@/components/premium/panel";
import { Pill } from "@/components/premium/pill";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionTitle } from "@/components/premium/section-title";
import { PlayerRow } from "@/components/premium/player-row";

async function getTeam(teamId: number) {
  const res = await fetch(`${getBaseUrl()}/api/team/${teamId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch team");
  }

  return res.json();
}

export default async function MyTeamPage() {
  const { team: currentTeam } = await requireSignedInProfile("/my-team");

  if (!currentTeam) {
    throw new Error("No fantasy team mapped to this user");
  }

  const { team, players } = await getTeam(currentTeam.id);

  const captainId = team.captain_player_id;
  const viceCaptainId = team.vice_captain_player_id;

  const selectedPlayers = players.map((item: any) =>
    Array.isArray(item.players) ? item.players[0] : item.players
  );

  const captain = selectedPlayers.find((player: any) => player?.id === captainId);
  const viceCaptain = selectedPlayers.find(
    (player: any) => player?.id === viceCaptainId
  );

  const playerCount = selectedPlayers.length;

  const roleCounts = selectedPlayers.reduce(
    (acc: Record<string, number>, player: any) => {
      const role = player?.role || "Unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {}
  );

  const uniqueIplTeams = new Set(
    selectedPlayers.map((player: any) => player?.ipl_team).filter(Boolean)
  ).size;

  return (
    <PageShell>
      <section className="sp-hero p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Pill tone="gold">My fantasy squad</Pill>
              <Pill tone="info">IPL 2026</Pill>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
              {team.team_name}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Your selected XI, captaincy spine, and player mix — all in one
              premium squad view.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Selected players"
                value={playerCount}
                subtitle="Current squad size"
                accent="emerald"
              />
              <MetricCard
                label="IPL teams covered"
                value={uniqueIplTeams}
                subtitle="Franchises represented in your XI"
                accent="cyan"
              />
              <MetricCard
                label="Captaincy set"
                value={captain && viceCaptain ? "Yes" : "No"}
                subtitle="Captain and vice-captain readiness"
                accent="gold"
              />
            </div>
          </div>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Captaincy spine
                </div>
                <div className="mt-2 text-2xl font-semibold">Leadership core</div>
              </div>
              <Pill tone={captain && viceCaptain ? "success" : "gold"}>
                {captain && viceCaptain ? "Ready" : "Incomplete"}
              </Pill>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Captain
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-50">
                  {captain?.name || "Not selected"}
                </div>
                <div className="mt-2 text-sm text-stone-400">
                  {captain?.ipl_team || "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Vice-captain
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-50">
                  {viceCaptain?.name || "Not selected"}
                </div>
                <div className="mt-2 text-sm text-stone-400">
                  {viceCaptain?.ipl_team || "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Role mix
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(roleCounts as Record<string, number>).map(
                    ([role, count]: [string, number]) => (
                      <Pill key={role} tone="default">
                        {role}: {count}
                      </Pill>
                    )
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Squad list"
          title="Selected players"
          subtitle="Your current fantasy XI, roles, IPL teams, and captaincy tags."
        />

        <Panel className="mt-6 overflow-hidden">
          <div className="hidden border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs uppercase tracking-[0.18em] text-stone-500 md:grid md:grid-cols-[1.2fr_180px_1fr_180px]">
            <div>Name</div>
            <div>Role</div>
            <div>IPL team</div>
            <div>Tag</div>
          </div>

          <div>
            {players.map((item: any) => {
              const player = Array.isArray(item.players) ? item.players[0] : item.players;
              const isCaptain = player?.id === captainId;
              const isViceCaptain = player?.id === viceCaptainId;

              return (
                <PlayerRow
                  key={item.id}
                  name={player?.name}
                  role={player?.role}
                  iplTeam={player?.ipl_team}
                  tag={isCaptain ? "Captain" : isViceCaptain ? "Vice-Captain" : null}
                />
              );
            })}
          </div>
        </Panel>
      </section>
    </PageShell>
  );
}