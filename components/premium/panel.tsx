import { cx } from "./utils";

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
};

export function Panel({ children, className, strong = false }: PanelProps) {
  return (
    <section
      className={cx(
        strong ? "sp-panel-strong" : "sp-panel",
        className
      )}
    >
      {children}
    </section>
  );
}