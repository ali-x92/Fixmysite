import { Link, createFileRoute } from "@tanstack/react-router";
import { Globe, ScanLine, UserRound, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { getCurrentProfile } from "@/features/auth/auth-client";
import type { Profile } from "@/features/auth/contracts";
import { getHistory } from "@/lib/api-client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings - FixMySite AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [siteCount, setSiteCount] = useState(0);
  useEffect(() => {
    getCurrentProfile()
      .then(setProfile)
      .catch(() => undefined);
    getHistory()
      .then(({ entries }) => setSiteCount(new Set(entries.map(({ site }) => site.id)).size))
      .catch(() => undefined);
  }, []);
  const fixUsed = profile?.aiFixCreditsUsed ?? 0;
  const fixLimit = profile?.aiFixCreditsLimit ?? 5;
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl animate-in-up px-4 py-8 md:px-8 md:py-10">
        <PageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Review how FixMySite AI runs each website analysis."
        />
        <section className="mt-8 card-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-heading text-sm font-semibold">Usage & credits</h2>
              <p className="text-xs text-muted-foreground">
                Your account includes three website slots and five AI fix credits.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <UsageBar label="Website slots" used={siteCount} limit={3} />
            <UsageBar label="AI fix credits" used={fixUsed} limit={fixLimit} />
          </div>
        </section>
        <section className="mt-6 card-surface p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-heading text-sm font-semibold">Analysis scope</h2>
              <p className="text-xs text-muted-foreground">
                Every analysis uses the same focused, repeatable homepage audit.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="mt-3 text-sm font-semibold text-heading">Homepage only</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                FixMySite AI audits the exact URL you submit. It does not crawl linked pages or
                subdomains.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <ScanLine className="h-4 w-4 text-primary" />
              <h3 className="mt-3 text-sm font-semibold text-heading">Reliable checks</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Each scan combines performance, SEO, accessibility, and passive security checks once
                per request.
              </p>
            </div>
          </div>
        </section>
        <section className="mt-6 card-surface p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-heading text-sm font-semibold">Profile</h2>
                <p className="text-xs text-muted-foreground">
                  Update the name shown in your workspace.
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-surface"
            >
              Manage profile
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const ratio = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-heading">{label}</span>
        <span className="text-muted-foreground">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}
