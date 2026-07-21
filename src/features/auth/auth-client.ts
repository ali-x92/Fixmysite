import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import {
  credentialsSchema,
  profileUpdateSchema,
  type Credentials,
  type Profile,
} from "./contracts";

function toProfile(row: {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  ai_fix_credits_used: number;
  ai_fix_credits_limit: number;
  created_at: string;
}): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    aiFixCreditsUsed: row.ai_fix_credits_used,
    aiFixCreditsLimit: row.ai_fix_credits_limit,
    createdAt: row.created_at,
  };
}

function userFacingDatabaseError(error: unknown): Error {
  const details =
    error && typeof error === "object"
      ? `${"message" in error ? String(error.message) : ""} ${"code" in error ? String(error.code) : ""}`
      : "";
  if (/PGRST205|42P01|relation .* does not exist/i.test(details)) {
    return new Error(
      "FixMySite AI needs its Supabase database migrations applied before accounts can be used.",
    );
  }
  return error instanceof Error ? error : new Error("Unable to complete the database request.");
}

function userFacingAuthError(error: unknown, provider?: "google" | "github"): Error {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (provider && /provider|unsupported|disabled/i.test(message)) {
    return new Error(
      `${provider === "google" ? "Google" : "GitHub"} sign-in is unavailable. Enable this provider in Supabase Dashboard → Authentication → Sign In / Providers, add its OAuth client ID and secret, then save. You can still sign in with email and password.`,
    );
  }
  if (/email not confirmed|email confirmation/i.test(message)) {
    return new Error("Confirm your email address before signing in.");
  }
  if (/signup.*disabled|signups.*disabled/i.test(message)) {
    return new Error("Email sign-up is disabled for this Supabase project.");
  }
  return error instanceof Error ? error : new Error("Authentication could not be completed.");
}

async function ensureProfile(user: User): Promise<Profile> {
  const client = getSupabaseBrowserClient();
  const { data: existing, error: fetchError } = await client
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle();
  if (fetchError) throw userFacingDatabaseError(fetchError);
  if (existing) return toProfile(existing);
  const { data, error } = await client
    .from("profiles")
    .upsert({ id: user.id, email: user.email ?? "" })
    .select()
    .single();
  if (error) throw userFacingDatabaseError(error);
  return toProfile(data);
}

export async function signIn(credentials: Credentials): Promise<Session> {
  const { email, password } = credentialsSchema.parse(credentials);
  const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) {
    throw userFacingAuthError(error ?? new Error("Unable to establish a session"));
  }
  await ensureProfile(data.user);
  return data.session;
}

export async function signUp(credentials: Credentials): Promise<void> {
  const { email, password } = credentialsSchema.parse(credentials);
  const { data, error } = await getSupabaseBrowserClient().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw userFacingAuthError(error);
  if (data.user && data.session) await ensureProfile(data.user);
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseBrowserClient().auth.signOut();
  if (error) throw userFacingDatabaseError(error);
}

export async function signInWithOAuth(provider: "google" | "github"): Promise<void> {
  const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw userFacingAuthError(error, provider);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = credentialsSchema.shape.email.parse(email);
  const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw userFacingAuthError(error);
}

export async function updatePassword(password: string): Promise<void> {
  const nextPassword = credentialsSchema.shape.password.parse(password);
  const { error } = await getSupabaseBrowserClient().auth.updateUser({ password: nextPassword });
  if (error) throw userFacingAuthError(error);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data, error } = await getSupabaseBrowserClient().auth.getUser();
  if (error || !data.user) return null;
  return ensureProfile(data.user);
}

export async function updateCurrentProfile(values: {
  fullName: string;
  avatarUrl?: string | null;
}): Promise<Profile> {
  const updates = profileUpdateSchema.parse(values);
  const client = getSupabaseBrowserClient();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error("Authentication is required");
  const { data, error } = await client
    .from("profiles")
    .update({ full_name: updates.fullName, avatar_url: updates.avatarUrl })
    .eq("id", authData.user.id)
    .select()
    .single();
  if (error) throw userFacingDatabaseError(error);
  return toProfile(data);
}
