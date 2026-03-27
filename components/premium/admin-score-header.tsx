import Link from "next/link";

export function AdminScoreHeader({
  matchNumber,
  team1,
  team2,
  matchDate,
  statusLabel,
  statusClassName,
  playerCount,
  validRowCount,
  invalidRowCount,
  visibleRowCount,
}: {
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  statusLabel: string;
  statusClassName: string;
  playerCount: number;
  validRowCount: number;
  invalidRowCount: number;
  visibleRowCount: number;
}) {
  return (
    <div className="sticky top-[76px] z-40 mb-4">
      <div className="rounded-[24px] border border-[#243041] bg-[#0B0F14]/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[#2FA36B]/35 bg-[#163B2D]/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#7FE3AE]">
                Silly Point Scoring Console
              </span>
              <span className="inline-flex items-center rounded-full border border-[#8E6A2A]/35 bg-[#2A2114]/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#E6C98B]">
                Every over counts
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Enter Match Scores
            </h1>
            <p className="mt-1 text-sm text-[#A8B3C2]">
              Match #{matchNumber} • {team1} vs {team2} • {matchDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-full border border-[#243041] bg-[#10161E] px-4 py-2 text-sm font-medium text-[#F5F7FA] transition hover:border-[#2FA36B]/40 hover:bg-[#111924]"
            >
              Back to Admin
            </Link>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClassName}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric title="Players" value={playerCount} />
          <Metric title="Valid Rows" value={validRowCount} />
          <Metric title="Invalid Rows" value={invalidRowCount} />
          <Metric title="Visible Rows" value={visibleRowCount} />
        </div>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-[20px] border border-[#243041] bg-[#0A0F15] p-4">
      <p className="text-sm uppercase tracking-[0.18em] text-[#778396]">{title}</p>
      <p className="mt-2 text-3xl font-bold text-[#F5F7FA]">{value}</p>
    </div>
  );
}