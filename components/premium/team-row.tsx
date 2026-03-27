import { Panel } from "./panel";
import { Pill } from "./pill";
import { ActionButton } from "./action-button";

type TeamRowProps = {
  id: string | number;
  teamName: string;
  managerName?: string;
  playerCount: number;
  substitutionsLeft: number;
  captainSet: boolean;
  viceCaptainSet: boolean;
};

function getInitials(name?: string) {
  if (!name) return "SP";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamRow({
  id,
  teamName,
  managerName,
  playerCount,
  substitutionsLeft,
  captainSet,
  viceCaptainSet,
}: TeamRowProps) {
  const isReady = captainSet && viceCaptainSet;

  return (
    <Panel className="overflow-hidden p-5 lg:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr_180px]">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 text-base font-semibold text-stone-100">
            {getInitials(managerName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="truncate text-2xl font-semibold tracking-tight text-stone-50">
                {teamName}
              </h3>
              <Pill tone="default" className="uppercase tracking-[0.16em]">
                Fantasy Squad
              </Pill>
            </div>

            <p className="mt-2 text-sm text-stone-400">
              Managed by {managerName || "Unknown"}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  Players
                </div>
                <div className="mt-2 text-xl font-semibold text-stone-100">
                  {playerCount}/11
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  Subs left
                </div>
                <div className="mt-2 text-xl font-semibold text-stone-100">
                  {substitutionsLeft}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  Status
                </div>
                <div className="mt-2">
                  <Pill tone={isReady ? "success" : "gold"}>
                    {isReady ? "Ready" : "Needs setup"}
                  </Pill>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
              Captain
            </div>
            <div className="mt-3">
              <Pill tone={captainSet ? "success" : "gold"}>
                {captainSet ? "Set" : "Pending"}
              </Pill>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
              Vice-captain
            </div>
            <div className="mt-3">
              <Pill tone={viceCaptainSet ? "success" : "gold"}>
                {viceCaptainSet ? "Set" : "Pending"}
              </Pill>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
              Primary action
            </div>
            <div className="mt-3 text-sm text-stone-300">
              {isReady
                ? "Open full squad and match history."
                : "Complete captaincy before the next fixture."}
            </div>
          </div>

          <ActionButton
            href={isReady ? `/team/${id}` : `/team/${id}/setup`}
            variant={isReady ? "secondary" : "primary"}
            className="w-full"
          >
            {isReady ? "View Team" : "Set Captains"}
          </ActionButton>
        </div>
      </div>
    </Panel>
  );
}