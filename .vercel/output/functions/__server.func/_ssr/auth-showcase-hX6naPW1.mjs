import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as BrandMark } from "./auth-client-DOg5UVO1.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-showcase-hX6naPW1.js
var import_jsx_runtime = require_jsx_runtime();
function AuthShowcase() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-accent p-10 text-primary-foreground lg:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-black/20 blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "relative inline-flex items-center gap-3 self-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
					size: 48,
					className: "rounded-xl bg-white p-1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xl font-semibold tracking-tight",
					children: "FixMySite AI"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-md space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), " AI-powered audits"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl font-semibold leading-tight tracking-tight",
						children: "Audit your site. Ship the fix. In minutes, not weeks."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-primary-foreground/80",
						children: "Scan SEO, performance, accessibility, security, and UX, then see what to fix next."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative text-xs text-primary-foreground/70",
				children: "© 2026 FixMySite AI"
			})
		]
	});
}
//#endregion
export { AuthShowcase as t };
