import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppProfile = {
  id: number;
  username: string;
  display_name: string;
  email: string;
  is_admin: boolean;
};

export async function getCurrentUserContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { user: null, profile: null, team: null };
  }

  const email = user.email.toLowerCase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, email, is_admin")
    .eq("email", email)
    .maybeSingle<AppProfile>();

  if (!profile) {
    return { user, profile: null, team: null };
  }

  const { data: team } = await supabase
    .from("fantasy_teams")
    .select("id, team_name, profile_id, season_id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  return { user, profile, team };
}

export async function requireSignedInProfile(nextPath = "/my-team") {
  const context = await getCurrentUserContext();

  if (!context.user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!context.profile) {
    redirect("/login?blocked=1");
  }

  return context as {
    user: NonNullable<typeof context.user>;
    profile: NonNullable<typeof context.profile>;
    team: typeof context.team;
  };
}

export async function requireAdmin() {
  const context = await requireSignedInProfile("/admin");

  if (!context.profile.is_admin) {
    redirect("/");
  }

  return context;
}

export async function requireTeamAccess(teamId: string | number) {
  const context = await requireSignedInProfile(`/team/${teamId}`);

  if (context.profile.is_admin) {
    return context;
  }

  if (!context.team || String(context.team.id) !== String(teamId)) {
    redirect("/my-team");
  }

  return context;
}