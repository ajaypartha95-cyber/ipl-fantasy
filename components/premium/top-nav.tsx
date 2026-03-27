"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/league", label: "League" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
  { href: "/my-team", label: "My Team" },
  { href: "/matches", label: "Matches" },
  { href: "/players", label: "Players" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070B]/72 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link href="/" className="group flex min-w-0 items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.30)]">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(61,220,151,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(214,179,106,0.18),transparent_50%)]" />
              <div className="relative h-5 w-5 rounded-full border border-amber-200/70 bg-[radial-gradient(circle,rgba(214,179,106,0.24)_0%,transparent_72%)]" />
            </div>

            <div className="min-w-0">
              <div className="truncate text-xl font-semibold tracking-tight text-stone-50 transition group-hover:text-white">
                Silly Point
              </div>
              <div className="truncate text-[11px] uppercase tracking-[0.26em] text-emerald-300/80">
                Make every over count
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "rounded-full px-4 py-2 text-sm transition",
                    active
                      ? "border border-white/10 bg-white/[0.08] text-white"
                      : "border border-transparent text-stone-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/admin"
              className={cx(
                "ml-2 rounded-full px-4 py-2 text-sm font-medium transition",
                isActive(pathname, "/admin")
                  ? "border border-white/10 bg-white/[0.12] text-stone-50"
                  : "border border-white/10 bg-white/[0.06] text-stone-50 hover:bg-white/[0.10]"
              )}
            >
              Admin
            </Link>
          </nav>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 lg:hidden no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "shrink-0 rounded-full px-4 py-2 text-sm",
                  active
                    ? "border border-white/10 bg-white/[0.10] text-stone-50"
                    : "border border-white/10 bg-white/[0.04] text-stone-200"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/admin"
            className={cx(
              "shrink-0 rounded-full border border-white/10 px-4 py-2 text-sm font-medium",
              isActive(pathname, "/admin")
                ? "bg-white/[0.12] text-stone-50"
                : "bg-white/[0.08] text-stone-50"
            )}
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}