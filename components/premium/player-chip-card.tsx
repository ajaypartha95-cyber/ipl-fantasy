import { Pill } from "./pill";

type PlayerChipCardProps = {
  name?: string;
  role?: string;
  iplTeam?: string;
};

function getRoleTone(role?: string): "gold" | "info" | "success" | "default" {
  const value = (role || "").toLowerCase();

  if (value.includes("all")) return "gold";
  if (value.includes("bowl")) return "info";
  if (value.includes("bat")) return "success";
  return "default";
}

export function PlayerChipCard({
  name,
  role,
  iplTeam,
}: PlayerChipCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="font-medium text-stone-50">{name || "—"}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill tone={getRoleTone(role)}>{role || "—"}</Pill>
        <Pill tone="default">{iplTeam || "—"}</Pill>
      </div>
    </div>
  );
}