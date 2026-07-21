import { c as objectType, s as numberType, u as stringType } from "../_libs/openai+zod.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-client-DOg5UVO1.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function BrandMark({ size = 36, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/fixmysite-icon.png",
		alt: "",
		"aria-hidden": "true",
		className: cn("shrink-0 rounded-[26%] bg-white object-cover", className),
		style: {
			width: size,
			height: size
		}
	});
}
var browserEnvironmentSchema = objectType({
	url: stringType().url(),
	anonKey: stringType().min(1)
});
var browserClient;
function getSupabaseBrowserClient() {
	if (!browserClient) {
		const environment = browserEnvironmentSchema.parse({
			url: "https://zwifwpkvtzrwjnhdpitk.supabase.co",
			anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3aWZ3cGt2dHpyd2puaGRwaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTMyMTksImV4cCI6MjA5OTg4OTIxOX0.rOACBiRNUJkjjZlg5X-SfPqu5zyWtPAp1rpQniVbwgI"
		});
		browserClient = createClient(environment.url, environment.anonKey);
	}
	return browserClient;
}
objectType({
	id: stringType().uuid(),
	email: stringType().email(),
	fullName: stringType().nullable(),
	avatarUrl: stringType().url().nullable(),
	aiFixCreditsUsed: numberType().int().nonnegative(),
	aiFixCreditsLimit: numberType().int().nonnegative(),
	createdAt: stringType().datetime()
});
var credentialsSchema = objectType({
	email: stringType().email(),
	password: stringType().min(8)
});
var profileUpdateSchema = objectType({
	fullName: stringType().trim().min(1).max(120),
	avatarUrl: stringType().url().nullable().optional()
});
function toProfile(row) {
	return {
		id: row.id,
		email: row.email,
		fullName: row.full_name,
		avatarUrl: row.avatar_url,
		aiFixCreditsUsed: row.ai_fix_credits_used,
		aiFixCreditsLimit: row.ai_fix_credits_limit,
		createdAt: row.created_at
	};
}
function userFacingDatabaseError(error) {
	const details = error && typeof error === "object" ? `${"message" in error ? String(error.message) : ""} ${"code" in error ? String(error.code) : ""}` : "";
	if (/PGRST205|42P01|relation .* does not exist/i.test(details)) return /* @__PURE__ */ new Error("FixMySite AI needs its Supabase database migrations applied before accounts can be used.");
	return error instanceof Error ? error : /* @__PURE__ */ new Error("Unable to complete the database request.");
}
function userFacingAuthError(error, provider) {
	const message = error instanceof Error ? error.message : String(error ?? "");
	if (provider && /provider|unsupported|disabled/i.test(message)) return /* @__PURE__ */ new Error(`${provider === "google" ? "Google" : "GitHub"} sign-in is unavailable. Enable this provider in Supabase Dashboard → Authentication → Sign In / Providers, add its OAuth client ID and secret, then save. You can still sign in with email and password.`);
	if (/email not confirmed|email confirmation/i.test(message)) return /* @__PURE__ */ new Error("Confirm your email address before signing in.");
	if (/signup.*disabled|signups.*disabled/i.test(message)) return /* @__PURE__ */ new Error("Email sign-up is disabled for this Supabase project.");
	return error instanceof Error ? error : /* @__PURE__ */ new Error("Authentication could not be completed.");
}
async function ensureProfile(user) {
	const client = getSupabaseBrowserClient();
	const { data: existing, error: fetchError } = await client.from("profiles").select().eq("id", user.id).maybeSingle();
	if (fetchError) throw userFacingDatabaseError(fetchError);
	if (existing) return toProfile(existing);
	const { data, error } = await client.from("profiles").upsert({
		id: user.id,
		email: user.email ?? ""
	}).select().single();
	if (error) throw userFacingDatabaseError(error);
	return toProfile(data);
}
async function signIn(credentials) {
	const { email, password } = credentialsSchema.parse(credentials);
	const { data, error } = await getSupabaseBrowserClient().auth.signInWithPassword({
		email,
		password
	});
	if (error || !data.session) throw userFacingAuthError(error ?? /* @__PURE__ */ new Error("Unable to establish a session"));
	await ensureProfile(data.user);
	return data.session;
}
async function signUp(credentials) {
	const { email, password } = credentialsSchema.parse(credentials);
	const { data, error } = await getSupabaseBrowserClient().auth.signUp({
		email,
		password,
		options: { emailRedirectTo: `${window.location.origin}/` }
	});
	if (error) throw userFacingAuthError(error);
	if (data.user && data.session) await ensureProfile(data.user);
}
async function signOut() {
	const { error } = await getSupabaseBrowserClient().auth.signOut();
	if (error) throw userFacingDatabaseError(error);
}
async function signInWithOAuth(provider) {
	const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
		provider,
		options: { redirectTo: `${window.location.origin}/` }
	});
	if (error) throw userFacingAuthError(error, provider);
}
async function requestPasswordReset(email) {
	const normalizedEmail = credentialsSchema.shape.email.parse(email);
	const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(normalizedEmail, { redirectTo: `${window.location.origin}/reset-password` });
	if (error) throw userFacingAuthError(error);
}
async function updatePassword(password) {
	const nextPassword = credentialsSchema.shape.password.parse(password);
	const { error } = await getSupabaseBrowserClient().auth.updateUser({ password: nextPassword });
	if (error) throw userFacingAuthError(error);
}
async function getCurrentProfile() {
	const { data, error } = await getSupabaseBrowserClient().auth.getUser();
	if (error || !data.user) return null;
	return ensureProfile(data.user);
}
async function updateCurrentProfile(values) {
	const updates = profileUpdateSchema.parse(values);
	const client = getSupabaseBrowserClient();
	const { data: authData, error: authError } = await client.auth.getUser();
	if (authError || !authData.user) throw authError ?? /* @__PURE__ */ new Error("Authentication is required");
	const { data, error } = await client.from("profiles").update({
		full_name: updates.fullName,
		avatar_url: updates.avatarUrl
	}).eq("id", authData.user.id).select().single();
	if (error) throw userFacingDatabaseError(error);
	return toProfile(data);
}
//#endregion
export { requestPasswordReset as a, signOut as c, updatePassword as d, getSupabaseBrowserClient as i, signUp as l, cn as n, signIn as o, getCurrentProfile as r, signInWithOAuth as s, BrandMark as t, updateCurrentProfile as u };
