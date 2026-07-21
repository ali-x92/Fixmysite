import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, Lock, Mail } from "lucide-react";
import { AuthShowcase } from "@/components/auth-showcase";
import { requestPasswordReset, updatePassword } from "@/features/auth/auth-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password - FixMySite AI" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const legacyRecovery = window.location.hash.includes("type=recovery");
    if (!code) {
      setRecovery(legacyRecovery);
      setCheckingLink(false);
      return;
    }

    const client = getSupabaseBrowserClient();
    client.auth
      .getSession()
      .then(async ({ data }) => {
        if (data.session) return;
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) throw error;
      })
      .then(() => {
        setRecovery(true);
        window.history.replaceState({}, document.title, "/reset-password");
      })
      .catch((error) => {
        notify(
          error instanceof Error
            ? error.message
            : "This password reset link is invalid or expired.",
          "error",
        );
      })
      .finally(() => setCheckingLink(false));
  }, [notify]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (recovery) {
        await updatePassword(password);
        notify("Your password has been updated. Please sign in.", "success");
        navigate({ to: "/login" });
      } else {
        await requestPasswordReset(email);
        notify("If that email has an account, a reset link is on its way.", "success");
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to reset your password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen w-full bg-background lg:grid-cols-2">
      <AuthShowcase />
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-in-up">
          {checkingLink ? (
            <div className="text-center text-sm text-muted-foreground">
              Verifying your reset link...
            </div>
          ) : (
            <>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <h1 className="mt-5 text-heading text-2xl font-semibold">
                {recovery ? "Choose a new password" : "Reset your password"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {recovery
                  ? "Set a new password for your account."
                  : "Enter your email and we will send a secure reset link."}
              </p>
              <form onSubmit={submit} className="mt-7 space-y-4">
                {recovery ? (
                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">
                      New password
                    </span>
                    <div className="relative mt-1.5">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        required
                        minLength={8}
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </label>
                ) : (
                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">Email</span>
                    <div className="relative mt-1.5">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </label>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-70"
                >
                  {loading ? "Please wait..." : recovery ? "Update password" : "Send reset link"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
