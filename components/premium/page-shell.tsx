import { cx } from "./utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cx("sp-page", className)}>
      <div className="sp-container py-8 md:py-10">{children}</div>
    </main>
  );
}