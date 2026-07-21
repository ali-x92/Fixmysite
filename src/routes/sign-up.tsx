import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Chrome, Github, Lock, Mail } from "lucide-react";
import { AuthShowcase } from "@/components/auth-showcase";
import { signInWithOAuth, signUp } from "@/features/auth/auth-client";
import { useToast } from "@/lib/toast";

export const Route = createFileRoute("/sign-up")({
  head: () => ({ meta: [{ title: "Create account - FixMySite AI" }] }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signUp({ email, password });
      notify("Account created. Check your inbox if email confirmation is enabled.", "success");
      navigate({ to: "/check-email" });
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to create your account.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen w-full bg-background lg:grid-cols-2">
      <AuthShowcase />
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-in-up">
          <h1 className="text-heading text-2xl font-semibold">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Start saving website audits and fix plans.
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
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Password</span>
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
              <span className="mt-1 block text-xs text-muted-foreground">
                Use at least 8 characters.
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
