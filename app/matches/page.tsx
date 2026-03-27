import { getBaseUrl } from "@/src/lib/base-url";
import { PageShell } from "@/components/premium/page-shell";
import { Panel } from "@/components/premium/panel";
import { Pill } from "@/components/premium/pill";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionTitle } from "@/components/premium/section-title";
import { MatchRow } from "@/components/premium/match-row";

async function getMatches() {
  const res = await fetch(`${getBaseUrl()}/api/matches`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch matches");
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

export default async function MatchesPage() {
  const matches = await getMatches();

  const completedMatches = matches.filter(
    (match: any) => match.status === "completed" || match.has_points
  ).length;

  const upcomingMatches = matches.length - completedMatches;

  const nextUpcomingMatch = matches.find(
    (match: any) => match.status !== "completed" && !match.has_points
  );

  return (
    <PageShell>
      <section className="sp-hero p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Pill tone="gold">Silly Point Fixture Centre</Pill>
              <Pill tone="info">Every over counts</Pill>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
              Every fixture,
              <span className="block text-cyan-100">ready for the spotlight.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Follow every IPL fixture in your league, track completed contests,
              and jump straight into the scored match breakdowns that shaped the table.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Total fixtures"
                value={matches.length}
                subtitle="Scheduled IPL matches in the league"
                accent="emerald"
              />
              <MetricCard
                label="Completed"
                value={completedMatches}
                subtitle="Fixtures already scored and settled"
                accent="cyan"
              />
              <MetricCard
                label="Upcoming"
                value={upcomingMatches}
                subtitle="Still waiting to shape the standings"
                accent="gold"
              />
            </div>
          </div>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Next fixture spotlight
                </div>
                <div className="mt-2 text-2xl font-semibold">Upcoming clash</div>
              </div>
              <Pill tone={nextUpcomingMatch ? "success" : "default"}>
                {nextUpcomingMatch ? "Upcoming" : "No pending match"}
              </Pill>
            </div>

            {nextUpcomingMatch ? (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <div className="grid items-center gap-6 rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-8 md:grid-cols-[minmax(0,1fr)_100px_minmax(0,1fr)]">
  <div className="min-w-0">
    <div className="text-2xl font-semibold tracking-tight leading-tight text-stone-50 whitespace-normal">
      {nextUpcomingMatch.team_1}
    </div>
    <div className="mt-3 text-sm text-stone-400">
      Match #{nextUpcomingMatch.match_number}
    </div>
  </div>

  <div className="text-center">
    <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
      Prime fixture
    </div>
    <div className="mt-3 text-lg text-amber-100">VS</div>
  </div>

  <div className="min-w-0 text-left md:text-right">
    <div className="text-2xl font-semibold tracking-tight leading-tight text-stone-50 whitespace-normal">
      {nextUpcomingMatch.team_2}
    </div>
    <div className="mt-3 text-sm text-stone-400">IPL 2026</div>
  </div>
</div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                      Start time
                    </div>
                    <div className="mt-2 text-base text-stone-100">
                      {formatMatchDate(nextUpcomingMatch.match_date)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                      Countdown vibe
                    </div>
                    <div className="mt-2 text-base text-stone-100">
                      Build your XI
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-stone-300">
                All currently available fixtures have already been scored.
              </div>
            )}
          </Panel>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Fixture list"
          title="All matches in the league"
          subtitle="Upcoming and completed fixtures across the season."
        />

        <div className="mt-6 grid gap-5">
          {matches.map((match: any) => {
            const isScored = match.status === "completed" || match.has_points;

            return (
              <MatchRow
                key={match.id}
                id={match.id}
                matchNumber={match.match_number}
                team1={match.team_1}
                team2={match.team_2}
                matchDate={formatMatchDate(match.match_date)}
                isScored={isScored}
              />
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}