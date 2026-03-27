"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/my-team";
  const blocked = searchParams.get("blocked") === "1";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    blocked ? "This email is not allowed for Silly Point." : ""
  );
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;
  }, [next]);

  async function handleGoogleSignIn() {
    setLoadingGoogle(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoadingGoogle(false);
      return;
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoadingMagic(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoadingMagic(false);
      return;
    }

    setMessage("Magic link sent. Check your email.");
    setLoadingMagic(false);
  }

  return (
    <main className="sp-page">
      <div className="sp-container py-12">
        <section className="mx-auto max-w-2xl sp-hero p-8 lg:p-10">
          <div className="flex flex-wrap gap-3">
            <span className="sp-pill sp-pill-gold">Invite-only access</span>
            <span className="sp-pill sp-pill-info">Fast sign-in</span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight text-stone-50 md:text-5xl">
            Sign in to
            <span className="block text-emerald-200">Silly Point.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-stone-300">
            Use Google for the easiest login. Magic link is still available as a
            fallback.
          </p>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle || loadingMagic}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-base font-medium text-stone-50 transition hover:bg-white/[0.10] disabled:opacity-60"
            >
              <span className="text-lg">G</span>
              <span>
                {loadingGoogle ? "Redirecting to Google..." : "Continue with Google"}
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
                Or use magic link
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="sp-panel p-5">
                <label className="mb-3 block text-sm uppercase tracking-[0.18em] text-stone-500">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-emerald-400/40"
                />
              </div>

              <button
                type="submit"
                disabled={loadingMagic || loadingGoogle}
                className="sp-button-primary disabled:opacity-60"
              >
                {loadingMagic ? "Sending..." : "Send magic link"}
              </button>
            </form>

            {message ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-stone-300">
                {message}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="sp-page">
          <div className="sp-container py-12">
            <section className="mx-auto max-w-2xl sp-hero p-8 lg:p-10">
              <div className="text-stone-300">Loading sign-in...</div>
            </section>
          </div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}