import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPL Fantasy App",
  description: "Private IPL 2026 fantasy league",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <header className="border-b border-zinc-800 bg-black/95 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              IPL Fantasy
            </Link>

            <nav className="flex items-center gap-6 text-sm text-gray-300">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <Link href="/league" className="hover:text-white transition">
                League
              </Link>
              <Link href="/leaderboard" className="hover:text-white transition">
                Leaderboard
              </Link>
              <Link href="/compare" className="hover:text-white transition">
                Compare
              </Link>
              <Link href="/my-team" className="hover:text-white transition">
                My Team
              </Link>
              <Link href="/matches" className="hover:text-white transition">
                Matches
              </Link>
              <Link href="/players" className="hover:text-white transition">
                Players
              </Link>
              <Link href="/admin" className="hover:text-white transition">
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <div>{children}</div>
      </body>
    </html>
  );
}