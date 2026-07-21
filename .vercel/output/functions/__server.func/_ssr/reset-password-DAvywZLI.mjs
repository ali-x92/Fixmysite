import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useToast } from "./toast-BG9z9MQh.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as requestPasswordReset, d as updatePassword, i as getSupabaseBrowserClient } from "./auth-client-DOg5UVO1.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as Lock, q as ArrowRight, v as Mail, w as KeyRound } from "../_libs/lucide-react.mjs";
import { t as AuthShowcase } from "./auth-showcase-hX6naPW1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-DAvywZLI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const navigate = useNavigate();
	const { notify } = useToast();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [recovery, setRecovery] = (0, import_react.useState)(false);
	const [checkingLink, setCheckingLink] = (0, import_react.useState)(true);
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const code = new URLSearchParams(window.location.search).get("code");
		const legacyRecovery = window.location.hash.includes("type=recovery");
		if (!code) {
			setRecovery(legacyRecovery);
			setCheckingLink(false);
			return;
		}
		const client = getSupabaseBrowserClient();
		client.auth.getSession().then(async ({ data }) => {
			if (data.session) return;
			const { error } = await client.auth.exchangeCodeForSession(code);
			if (error) throw error;
		}).then(() => {
			setRecovery(true);
			window.history.replaceState({}, document.title, "/reset-password");
		}).catch((error) => {
			notify(error instanceof Error ? error.message : "This password reset link is invalid or expired.", "error");
		}).finally(() => setCheckingLink(false));
	}, [notify]);
	const submit = async (event) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen w-full bg-background lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthShowcase, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center p-6 sm:p-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full max-w-sm animate-in-up",
				children: checkingLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center text-sm text-muted-foreground",
					children: "Verifying your reset link..."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-5 text-heading text-2xl font-semibold",
						children: recovery ? "Choose a new password" : "Reset your password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-muted-foreground",
						children: recovery ? "Set a new password for your account." : "Enter your email and we will send a secure reset link."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "mt-7 space-y-4",
						children: [recovery ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "New password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									minLength: 8,
									type: "password",
									value: password,
									onChange: (event) => setPassword(event.target.value),
									className: "h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									type: "email",
									value: email,
									onChange: (event) => setEmail(event.target.value),
									className: "h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: loading,
							className: "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-70",
							children: [loading ? "Please wait..." : recovery ? "Update password" : "Send reset link", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-center text-xs text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "font-semibold text-primary hover:underline",
							children: "Back to sign in"
						})
					})
				] })
			})
		})]
	});
}
//#endregion
export { ResetPasswordPage as component };
