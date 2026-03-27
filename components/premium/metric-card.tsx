import { cx } from "./utils";

type MetricAccent = "emerald" | "cyan" | "gold" | "neutral";

type MetricCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: MetricAccent;
  className?: string;
};

const accentClass: Record<MetricAccent, string> = {
  emerald:
    "bg-[linear-gradient(180deg,rgba(110,231,183,0.15),rgba(52,211,153,0.05))] text-emerald-100",
  cyan:
    "bg-[linear-gradient(180deg,rgba(103,232,249,0.15),rgba(34,211,238,0.05))] text-cyan-100",
  gold:
    "bg-[linear-gradient(180deg,rgba(252,211,77,0.15),rgba(251,191,36,0.05))] text-amber-100",
  neutral:
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-stone-100",
};

export function MetricCard({
  label,
  value,
  subtitle,
  accent = "neutral",
  className,
}: MetricCardProps) {
  return (
    <div className={cx("sp-metric", accentClass[accent], className)}>
      <div className="text-xs uppercase tracking-[0.22em] text-stone-400">
        {label}
      </div>
      <div className="mt-5 text-3xl font-semibold tracking-tight">{value}</div>
      {subtitle ? (
        <div className="mt-2 text-sm text-stone-300">{subtitle}</div>
      ) : null}
    </div>
  );
}