import { Panel } from "./panel";
import { Pill } from "./pill";

type LeaderboardRowProps = {
  rank: number;
  ownerName?: string;
  teamName?: string;
  totalPoints: number;
  rankChange?: number | null;
};

function RankChangeBadge({ change }: { change: number | null | undefined }) {
  if (change == null) return null;
  if (change === 0)
    return <span className="text-xs text-stone-500">—</span>;
  if (change > 0)
    return (
      <span className="text-xs font-medium text-emerald-400">
        ▲{change}
      </span>
    );
  return (
    <span className="text-xs font-medium text-red-400">
      ▼{Math.abs(change)}
    </span>
  );
}

export function LeaderboardRow({
  rank,
  ownerName,
  teamName,
  totalPoints,
  rankChange,
}: LeaderboardRowProps) {
  const rankTone =
    rank === 1 ? "gold" : rank === 2 ? "info" : rank === 3 ? "default" : "default";

  return (
    <div className="grid items-center gap-4 border-t border-white/10 px-5 py-4 first:border-t-0 md:grid-cols-[110px_1.1fr_1fr_160px]">
      <div className="flex items-center gap-2">
        <Pill tone={rankTone}>#{rank}</Pill>
        <RankChangeBadge change={rankChange} />
      </div>

      <div>
        <div className="font-medium text-stone-50">{ownerName || "—"}</div>
        <div className="mt-1 text-sm text-stone-500 md:hidden">
          {teamName || "—"}
        </div>
      </div>

      <div className="hidden text-stone-300 md:block">{teamName || "—"}</div>

      <div className="text-right text-2xl font-semibold tracking-tight text-stone-50">
        {totalPoints}
      </div>
    </div>
  );
}