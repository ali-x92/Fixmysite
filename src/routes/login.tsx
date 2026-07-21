import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Chrome, Github, Lock, Mail } from "lucide-react";
import { AuthShowcase } from "@/components/auth-showcase";
import { signIn, signInWithOAuth } from "@/features/auth/auth-client";
import { useToast } from "@/lib/toast";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in - FixMySite AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signIn({ email, password });
      navigate({ to: "/" });
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to sign in.", "error");
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : `Unable to continue with ${provider}.`,
        "error",
      );
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-2">
      <AuthShowcase />

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-in-up">
          <h2 className="text-heading text-2xl font-semibold">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to continue to your workspace.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => oauth("google")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium transition-all hover:border-primary/30 hover:bg-surface disabled:opacity-70"
            >
              <Chrome className="h-4 w-4" /> Google
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => oauth("github")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium transition-all hover:border-primary/30 hover:bg-surface disabled:opacity-70"
            >
              <Github className="h-4 w-4" /> GitHub
            </button>
          </div>
          <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Email</span>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-shadow focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </label>
            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Password</span>
                <Link
                  to="/reset-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-shadow focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:shadow-elevated disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/sign-up" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
