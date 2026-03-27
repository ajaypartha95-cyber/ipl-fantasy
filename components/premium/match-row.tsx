import Link from "next/link";
import { Panel } from "./panel";
import { Pill } from "./pill";
import { ActionButton } from "./action-button";

type MatchRowProps = {
  id: string | number;
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  isScored: boolean;
};

export function MatchRow({
  id,
  matchNumber,
  team1,
  team2,
  matchDate,
  isScored,
}: MatchRowProps) {
  return (
    <Panel className="overflow-hidden p-5 lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[120px_1.2fr_1fr_160px] lg:items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Match
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-stone-50">
            #{matchNumber}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Fixture
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-stone-50">
            {team1}
            <span className="mx-3 text-stone-500">vs</span>
            {team2}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Date & time
          </div>
          <div className="mt-2 text-base text-stone-200">{matchDate}</div>
          <div className="mt-3">
            <Pill tone={isScored ? "success" : "default"}>
              {isScored ? "Completed" : "Upcoming"}
            </Pill>
          </div>
        </div>

        <div className="flex items-end lg:justify-end">
          {isScored ? (
            <ActionButton href={`/match/${id}/points`} variant="secondary" className="w-full lg:w-auto">
              View Points
            </ActionButton>
          ) : (
            <div className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-400 lg:w-auto">
              Not scored yet
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}