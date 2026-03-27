import { cx } from "./utils";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cx(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div>
        {eyebrow ? <div className="sp-eyebrow mb-2">{eyebrow}</div> : null}
        <h2 className="text-3xl font-semibold text-stone-50">{title}</h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-stone-400">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}