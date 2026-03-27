import { Pill } from "./pill";

type PlayerRowProps = {
  name?: string;
  role?: string;
  iplTeam?: string;
  tag?: "Captain" | "Vice-Captain" | null;
};

function getRoleTone(role?: string): "gold" | "info" | "success" | "default" {
  const value = (role || "").toLowerCase();

  if (value.includes("all")) return "gold";
  if (value.includes("bowl")) return "info";
  if (value.includes("bat")) return "success";
  return "default";
}

export function PlayerRow({
  name,
  role,
  iplTeam,
  tag,
}: PlayerRowProps) {
  return (
    <div className="grid items-center gap-4 border-t border-white/10 px-5 py-4 first:border-t-0 md:grid-cols-[1.2fr_180px_1fr_180px]">
      <div>
        <div className="font-medium text-stone-50">{name || "—"}</div>
      </div>

      <div>
        <Pill tone={getRoleTone(role)}>{role || "—"}</Pill>
      </div>

      <div className="text-stone-300">{iplTeam || "—"}</div>

      <div>
        {tag ? (
          <Pill tone={tag === "Captain" ? "gold" : "info"}>{tag}</Pill>
        ) : (
          <span className="text-stone-500">—</span>
        )}
      </div>
    </div>
  );
}