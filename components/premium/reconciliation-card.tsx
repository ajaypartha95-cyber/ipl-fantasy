type ReconciliationCardProps = {
  title: string;
  subtitle: string;
  matched: boolean;
  battingLabel: string;
  battingText: string;
  fieldingLabel: string;
  fieldingText: string;
  subtypeItems: { label: string; matched: boolean }[];
};

export function ReconciliationCard({
  title,
  subtitle,
  matched,
  battingLabel,
  battingText,
  fieldingLabel,
  fieldingText,
  subtypeItems,
}: ReconciliationCardProps) {
  return (
    <div className="rounded-xl border border-[#243041] bg-[#0A0F15] p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-[#F5F7FA]">{title}</p>
          <p className="text-sm text-[#A8B3C2]">{subtitle}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            matched
              ? "border border-green-700 bg-green-900/40 text-green-300"
              : "border border-red-700 bg-red-900/40 text-red-300"
          }`}
        >
          {matched ? "Matched" : "Mismatch"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#243041] p-3">
          <p className="mb-2 text-sm font-medium text-[#F5F7FA]">{battingLabel}</p>
          <p className="text-sm text-[#A8B3C2]">{battingText}</p>
        </div>

        <div className="rounded-lg border border-[#243041] p-3">
          <p className="mb-2 text-sm font-medium text-[#F5F7FA]">{fieldingLabel}</p>
          <p className="text-sm text-[#A8B3C2]">{fieldingText}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[#243041] p-3">
        <p className="mb-3 text-sm font-medium text-[#F5F7FA]">
          Subtype reconciliation
        </p>

        <div className="space-y-2 text-sm text-[#A8B3C2]">
          {subtypeItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span>{item.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.matched
                    ? "border border-green-700 bg-green-900/40 text-green-300"
                    : "border border-red-700 bg-red-900/40 text-red-300"
                }`}
              >
                {item.matched ? "Matched" : "Mismatch"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}