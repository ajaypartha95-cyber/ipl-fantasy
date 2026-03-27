import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/premium/top-nav";

export const metadata: Metadata = {
  title: "Silly Point | IPL Fantasy",
  description: "Silly Point — Every over counts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="sp-app-bg text-[#F5F7FA]">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(61,220,151,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(214,179,106,0.08),transparent_22%),linear-gradient(180deg,#05070B_0%,#070B10_100%)]" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-amber-200/10 blur-3xl" />
        </div>

        <TopNav />

        <div className="relative overflow-x-hidden">{children}</div>
      </body>
    </html>
  );
}