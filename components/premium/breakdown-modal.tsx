"use client";

type Breakdown = {
  playing_xi_points: number;
  batting_points: number;
  batting_milestone_points: number;
  strike_rate_points: number;
  bowling_points: number;
  bowling_milestone_points: number;
  economy_points: number;
  fielding_points: number;
  total_points: number;
};

type BreakdownModalProps = {
  open: boolean;
  onClose: () => void;
  playerName?: string;
  iplTeam?: string;
  breakdown: Breakdown | null;
};

export function BreakdownModal({
  open,
  onClose,
  playerName,
  iplTeam,
  breakdown,
}: BreakdownModalProps) {
  if (!open || !breakdown) return null;

  const rows = [
    ["Playing XI", breakdown.playing_xi_points],
    ["Batting", breakdown.batting_points],
    ["Batting Milestone", breakdown.batting_milestone_points],
    ["Strike Rate", breakdown.strike_rate_points],
    ["Bowling", breakdown.bowling_points],
    ["Bowling Milestone", breakdown.bowling_milestone_points],
    ["Economy", breakdown.economy_points],
    ["Fielding", breakdown.fielding_points],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#243041] bg-[#0B0F14] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F7FA]">{playerName}</h2>
            <p className="text-sm text-[#778396]">{iplTeam}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-[#243041] bg-[#10161E] px-3 py-2 text-sm text-[#F5F7FA] hover:border-[#2FA36B]/40 hover:bg-[#111924]"
          >
            Close
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#243041]">
          <div className="grid grid-cols-2 bg-[#10161E] text-sm font-medium text-[#F5F7FA]">
            <div className="border-b border-[#243041] p-3">Component</div>
            <div className="border-b border-[#243041] p-3">Points</div>

            {rows.map(([label, value]) => (
              <FragmentRow key={label} label={label} value={value} />
            ))}

            <div className="p-3 font-semibold text-[#F5F7FA]">Total</div>
            <div className="p-3 font-semibold text-[#F5F7FA]">
              {breakdown.total_points}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <>
      <div className="border-b border-[#243041] p-3 text-[#A8B3C2]">{label}</div>
      <div className="border-b border-[#243041] p-3 text-[#F5F7FA]">{value}</div>
    </>
  );
}