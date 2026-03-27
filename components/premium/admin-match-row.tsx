import { ActionButton } from "./action-button";
import { Panel } from "./panel";
import { Pill } from "./pill";

type AdminMatchRowProps = {
  id: string | number;
  matchNumber: number;
  team1: string;
  team2: string;
  matchDate: string;
  status?: string;
};

function getStatusTone(
  status?: string
): "default" | "success" | "gold" | "info" {
  const value = (status || "").toLowerCase();

  if (value === "completed") return "success";
  if (value === "scheduled" || value === "upcoming") return "gold";
  if (value === "live") return "info";
  return "default";
}

export function AdminMatchRow({
  id,
  matchNumber,
  team1,
  team2,
  matchDate,
  status,
}: AdminMatchRowProps) {
  return (
    <Panel className="overflow-hidden p-5 lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[120px_1.2fr_1fr_140px_180px] lg:items-center">
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
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Status
          </div>
          <div className="mt-3">
            <Pill tone={getStatusTone(status)}>{status || "Unknown"}</Pill>
          </div>
        </div>

        <div className="flex items-end lg:justify-end">
          <ActionButton
            href={`/admin/match/${id}`}
            variant="primary"
            className="w-full lg:w-auto"
          >
            Enter Scores
          </ActionButton>
        </div>
      </div>
    </Panel>
  );
}