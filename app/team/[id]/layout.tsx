import { requireTeamAccess } from "@/lib/auth";

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireTeamAccess(id);
  return children;
}