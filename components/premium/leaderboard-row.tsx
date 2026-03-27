import { Panel } from "./panel";
import { Pill } from "./pill";

type LeaderboardRowProps = {
  rank: number;
  ownerName?: string;
  teamName?: string;
  totalPoints: number;
};

export function LeaderboardRow({
  rank,
  ownerName,
  teamName,
  totalPoints,
}: LeaderboardRowProps) {
  const rankTone =
    rank === 1 ? "gold" : rank === 2 ? "info" : rank === 3 ? "default" : "default";

  return (
    <div className="grid items-center gap-4 border-t border-white/10 px-5 py-4 first:border-t-0 md:grid-cols-[110px_1.1fr_1fr_160px]">
      <div>
        <Pill tone={rankTone}>#{rank}</Pill>
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