import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useToast } from "./toast-BG9z9MQh.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { l as signUp, s as signInWithOAuth } from "./auth-client-DOg5UVO1.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as Github, V as Chromium, b as Lock, q as ArrowRight, v as Mail } from "../_libs/lucide-react.mjs";
import { t as AuthShowcase } from "./auth-showcase-hX6naPW1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sign-up-DgaFEZZE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SignUpPage() {
	const navigate = useNavigate();
	const { notify } = useToast();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const oauth = async (provider) => {
		setLoading(true);
		try {
			await signInWithOAuth(provider);
		} catch (error) {
			notify(error instanceof Error ? error.message : `Unable to continue with ${provider}.`, "error");
			setLoading(false);
		}
	};
	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		try {
			await signUp({
				email,
				password
			});
			notify("Account created. Check your inbox if email confirmation is enabled.", "success");
			navigate({ to: "/check-email" });
		} catch (error) {
			notify(error instanceof Error ? error.message : "Unable to create your account.", "error");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen w-full bg-background lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthShowcase, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center p-6 sm:p-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm animate-in-up",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-heading text-2xl font-semibold",
						children: "Create your account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-muted-foreground",
						children: "Start saving website audits and fix plans."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-7 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: loading,
							onClick: () => oauth("google"),
							className: "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium transition-all hover:border-primary/30 hover:bg-surface disabled:opacity-70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chromium, { className: "h-4 w-4" }), " Google"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: loading,
							onClick: () => oauth("github"),
							className: "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium transition-all hover:border-primary/30 hover:bg-surface disabled:opacity-70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "h-4 w-4" }), " GitHub"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
							" or ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
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
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-muted-foreground",
										children: "Password"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative mt-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											minLength: 8,
											type: "password",
											value: password,
											onChange: (event) => setPassword(event.target.value),
											className: "h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-xs text-muted-foreground",
										children: "Use at least 8 characters."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "submit",
								disabled: loading,
								className: "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-70",
								children: [loading ? "Creating account..." : "Create account", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-center text-xs text-muted-foreground",
						children: [
							"Already have an account?",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "font-semibold text-primary hover:underline",
								children: "Sign in"
							})
						]
					})
				]
			})
		})]
	});
}
//#endregion
export { SignUpPage as component };
