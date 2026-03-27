import { getBaseUrl } from "@/src/lib/base-url";
import { PageShell } from "@/components/premium/page-shell";
import { Panel } from "@/components/premium/panel";
import { Pill } from "@/components/premium/pill";
import { MetricCard } from "@/components/premium/metric-card";
import { SectionTitle } from "@/components/premium/section-title";
import { AdminMatchRow } from "@/components/premium/admin-match-row";

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

export default async function AdminPage() {
  const matches = await getMatches();

  const completedMatches = matches.filter(
    (match: any) => (match.status || "").toLowerCase() === "completed"
  ).length;

  const upcomingMatches = matches.filter(
    (match: any) => (match.status || "").toLowerCase() !== "completed"
  ).length;

  const nextScoringMatch = matches.find(
    (match: any) => (match.status || "").toLowerCase() !== "completed"
  );

  return (
    <PageShell>
      <section className="sp-hero p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap gap-3">
              <Pill tone="gold">Admin scoring panel</Pill>
              <Pill tone="info">Control room</Pill>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
              Score fixtures with
              <span className="block text-amber-100">speed and clarity.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Manage every match in one clean scoring control room and jump directly
              into fixture-level score entry.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Total fixtures"
                value={matches.length}
                subtitle="All matches available for scoring"
                accent="emerald"
              />
              <MetricCard
                label="Completed"
                value={completedMatches}
                subtitle="Already scored and settled"
                accent="cyan"
              />
              <MetricCard
                label="Pending scoring"
                value={upcomingMatches}
                subtitle="Still open in the scoring queue"
                accent="gold"
              />
            </div>
          </div>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Scoring queue
                </div>
                <div className="mt-2 text-2xl font-semibold">Next action</div>
              </div>
              <Pill tone={nextScoringMatch ? "gold" : "success"}>
                {nextScoringMatch ? "Pending" : "All done"}
              </Pill>
            </div>

            {nextScoringMatch ? (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  Next match to score
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-stone-50">
                  #{nextScoringMatch.match_number}
                </div>
                <div className="mt-2 text-stone-300">
                  {nextScoringMatch.team_1} vs {nextScoringMatch.team_2}
                </div>
                <div className="mt-4 text-sm text-stone-400">
                  {formatMatchDate(nextScoringMatch.match_date)}
                </div>

                <div className="mt-6">
                  <a
                    href={`/admin/match/${nextScoringMatch.id}`}
                    className="sp-button-primary"
                  >
                    Enter scores now
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-stone-300">
                All currently available matches have already been scored.
              </div>
            )}
          </Panel>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle
          eyebrow="Scoring table"
          title="All matches in the admin queue"
          subtitle="Open any fixture to enter scores and calculate fantasy points."
        />

        <div className="mt-6 grid gap-5">
          {matches.map((match: any) => (
            <AdminMatchRow
              key={match.id}
              id={match.id}
              matchNumber={match.match_number}
              team1={match.team_1}
              team2={match.team_2}
              matchDate={formatMatchDate(match.match_date)}
              status={match.status}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}