"use client";

export function AdminSaveBar({
  onSave,
  onReset,
  saving,
  resetting,
  disabledSave,
  message,
  statusLabel,
  statusClassName,
}: {
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  resetting: boolean;
  disabledSave: boolean;
  message: string;
  statusLabel: string;
  statusClassName: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto max-w-7xl px-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#243041] bg-[#0B0F14]/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        <button
          onClick={onSave}
          disabled={saving || resetting || disabledSave}
          className="rounded-full bg-[#F5F7FA] px-5 py-3 font-semibold text-black transition hover:bg-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Scores"}
        </button>

        <button
          onClick={onReset}
          disabled={saving || resetting}
          className="rounded-full border border-red-700 px-5 py-3 font-semibold text-red-300 hover:bg-red-950/30 disabled:opacity-60"
        >
          {resetting ? "Resetting..." : "Reset Match"}
        </button>

        <div className="min-w-[240px] text-sm text-[#A8B3C2]">
          {message || "No pending action."}
        </div>

        <div className="ml-auto">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClassName}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}