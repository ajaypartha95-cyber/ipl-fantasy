import Link from "next/link";
import { getBaseUrl } from "@/src/lib/base-url";

async function getSummary() {
  const res = await fetch(`${getBaseUrl()}/api/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch summary");
  }

  const json = await res.json();
  return json.data;
}

async function getNextMatch() {
  const res = await fetch(`${getBaseUrl()}/api/next-match`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch next match");
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

export default async function HomePage() {
  const summary = await getSummary();
  const nextMatch = await getNextMatch();

  return (
    <main className="sp-page">
      <div className="sp-container py-8 md:py-10">
        <section className="sp-hero">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="sp-pill sp-pill-gold">
                  Private League · Premium Build
                </span>
                <span className="sp-pill sp-pill-info">
                  Silly Point · IPL 2026
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-stone-50 lg:text-6xl">
                Fantasy cricket with scoreboard drama
                <span className="block text-amber-100">
                  and captaincy intelligence.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
                Silly Point turns every fixture into a premium tactical experience
                with sharper league views, richer squad ownership, and a scoring
                control room built for speed.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/matches" className="sp-button-primary">
                  View next fixture
                </Link>
                <Link href="/leaderboard" className="sp-button-secondary">
                  Open leaderboard
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="sp-metric bg-[linear-gradient(180deg,rgba(110,231,183,0.15),rgba(52,211,153,0.05))] text-emerald-100">
                  <div className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Teams
                  </div>
                  <div className="mt-5 text-3xl font-semibold tracking-tight">
                    {summary.totalTeams}
                  </div>
                  <div className="mt-2 text-sm text-stone-300">
                    Private league active
                  </div>
                </div>

                <div className="sp-metric bg-[linear-gradient(180deg,rgba(103,232,249,0.15),rgba(34,211,238,0.05))] text-cyan-100">
                  <div className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Fixtures
                  </div>
                  <div className="mt-5 text-3xl font-semibold tracking-tight">
                    {summary.totalMatches}
                  </div>
                  <div className="mt-2 text-sm text-stone-300">
                    League phase in motion
                  </div>
                </div>

                <div className="sp-metric bg-[linear-gradient(180deg,rgba(252,211,77,0.15),rgba(251,191,36,0.05))] text-amber-100">
                  <div className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Player pool
                  </div>
                  <div className="mt-5 text-3xl font-semibold tracking-tight">
                    {summary.totalPlayers}
                  </div>
                  <div className="mt-2 text-sm text-stone-300">
                    League-wide options
                  </div>
                </div>
              </div>
            </div>

            <div className="sp-panel p-6 bg-black/20">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-stone-400">
                    Next fixture spotlight
                  </div>
                  <div className="mt-2 text-2xl font-semibold">Upcoming clash</div>
                </div>
                <span className="sp-pill sp-pill-success">Upcoming</span>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-8">
  <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_100px_minmax(0,1fr)]">
    <div className="min-w-0">
      <div className="text-2xl font-semibold tracking-tight leading-tight text-stone-50 whitespace-normal">
        {nextMatch.team_1}
      </div>
      <div className="mt-3 text-sm text-stone-400">
        Match #{nextMatch.match_number}
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
        {nextMatch.team_2}
      </div>
      <div className="mt-3 text-sm text-stone-400">IPL 2026</div>
    </div>
  </div>
</div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Start time
                  </div>
                  <div className="mt-2 text-base text-stone-100">
                    {formatMatchDate(nextMatch.match_date)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Countdown vibe
                  </div>
                  <div className="mt-2 text-base text-stone-100">
                    Build your XI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="sp-panel p-6">
            <div className="mb-6">
              <div className="sp-eyebrow mb-2">League pulse</div>
              <h2 className="text-3xl font-semibold text-stone-50">
                The season at a glance
              </h2>
              <p className="mt-2 max-w-2xl text-stone-400">
                High-signal league activity, top movers, and quick routes into the
                core experiences.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/league"
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
              >
                <div className="mb-4 text-xs uppercase tracking-[0.22em] text-emerald-300/80">
                  League
                </div>
                <div className="text-lg font-medium">Manage squads and lineups</div>
                <div className="mt-2 text-sm text-stone-400">
                  Premium view of every team in the league.
                </div>
              </Link>

              <Link
                href="/compare"
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
              >
                <div className="mb-4 text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Compare
                </div>
                <div className="text-lg font-medium">Find overlap and uniqueness</div>
                <div className="mt-2 text-sm text-stone-400">
                  Compare squads and identify the difference makers.
                </div>
              </Link>

              <Link
                href="/admin"
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
              >
                <div className="mb-4 text-xs uppercase tracking-[0.22em] text-amber-100/80">
                  Admin
                </div>
                <div className="text-lg font-medium">Score fixtures with confidence</div>
                <div className="mt-2 text-sm text-stone-400">
                  A cleaner control room for scoring and review.
                </div>
              </Link>
            </div>
          </section>

          <aside className="sp-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-stone-500">
                  Top routes
                </div>
                <div className="mt-2 text-xl font-semibold">Quick access</div>
              </div>
              <div className="sp-pill sp-pill-default">Live</div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { href: "/my-team", title: "My Team", desc: "Track your XI" },
                { href: "/leaderboard", title: "Leaderboard", desc: "Chase the top" },
                { href: "/matches", title: "Matches", desc: "Follow fixtures" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
                >
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="mt-1 text-sm text-stone-400">{item.desc}</div>
                  </div>
                  <div className="text-sm text-stone-300">Open</div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}