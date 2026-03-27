"use client";

type Option<T extends string> = {
  value: T;
  label: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#243041] bg-[#0B0F14] p-2">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-4 py-2 text-sm border transition ${
              active
                ? "border-white bg-white text-black"
                : "border-zinc-700 text-white hover:border-zinc-500"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}