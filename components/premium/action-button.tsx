import Link from "next/link";
import { cx } from "./utils";

type ActionButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function ActionButton({
  href,
  children,
  variant = "secondary",
  className,
}: ActionButtonProps) {
  return (
    <Link
      href={href}
      className={cx(
        variant === "primary" ? "sp-button-primary" : "sp-button-secondary",
        className
      )}
    >
      {children}
    </Link>
  );
}