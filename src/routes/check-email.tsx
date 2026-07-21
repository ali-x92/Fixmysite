import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/check-email")({
  head: () => ({ meta: [{ title: "Check your email - FixMySite AI" }] }),
  component: CheckEmailPage,
});

function CheckEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 sm:p-10">
      <div className="w-full max-w-md animate-in-up text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
          <Check className="h-9 w-9" strokeWidth={2.5} />
        </div>
        <h1 className="text-heading mt-7 text-3xl font-semibold">Check your email</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to your email address. Open it to activate your account and
          continue to your dashboard.
        </p>
        <p className="mt-5 text-xs text-muted-foreground">
          After confirmation, you will be redirected to your workspace automatically.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-surface"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
