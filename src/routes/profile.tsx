import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Mail } from "lucide-react";
import { getCurrentProfile, updateCurrentProfile } from "@/features/auth/auth-client";
import { useToast } from "@/lib/toast";
import type { Profile } from "@/features/auth/contracts";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — FixMySite AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const { notify } = useToast();

  useEffect(() => {
    getCurrentProfile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        setFullName(nextProfile?.fullName ?? "");
      })
      .catch(() => undefined);
  }, []);

  const save = async () => {
    try {
      setProfile(await updateCurrentProfile({ fullName }));
      notify("Profile updated successfully.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to update profile.", "error");
    }
  };

  const displayName = profile?.fullName || profile?.email?.split("@")[0] || "Account";
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10 animate-in-up">
        <PageHeader
          eyebrow="Account"
          title="Your profile"
          description="Manage the information associated with your account."
        />

        <div className="mt-8 card-surface p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-24 w-24 rounded-3xl object-cover shadow-elevated"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-primary to-accent text-2xl font-semibold text-primary-foreground shadow-elevated">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-heading text-2xl font-semibold">{displayName}</h2>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {profile?.email ?? ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 card-surface p-6 sm:p-8">
          <h3 className="text-heading text-sm font-semibold">Personal information</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Email</span>
              <input
                value={profile?.email ?? ""}
                disabled
                className="mt-1.5 h-10 w-full rounded-xl border border-border bg-muted px-3 text-sm text-muted-foreground"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFullName(profile?.fullName ?? "")}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
