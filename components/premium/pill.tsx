import { cx } from "./utils";

type PillTone = "default" | "success" | "gold" | "info";

type PillProps = {
  children: React.ReactNode;
  tone?: PillTone;
  className?: string;
};

const toneClass: Record<PillTone, string> = {
  default: "sp-pill-default",
  success: "sp-pill-success",
  gold: "sp-pill-gold",
  info: "sp-pill-info",
};

export function Pill({
  children,
  tone = "default",
  className,
}: PillProps) {
  return (
    <span className={cx("sp-pill", toneClass[tone], className)}>
      {children}
    </span>
  );
}