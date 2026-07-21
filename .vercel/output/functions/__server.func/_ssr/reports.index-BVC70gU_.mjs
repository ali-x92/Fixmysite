import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Globe, h as Search } from "../_libs/lucide-react.mjs";
import { a as getHistory, n as PageHeader, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports.index-BVC70gU_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportsList() {
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [query, setQuery] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getHistory().then((response) => setEntries(response.entries)).catch((cause) => setError(cause.message));
	}, []);
	const filtered = (0, import_react.useMemo)(() => entries.filter(({ analysis, site }) => `${site.url} ${analysis.id}`.toLowerCase().includes(query.toLowerCase())), [entries, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10 animate-in-up",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Reports",
				title: "All website audits",
				description: "Your saved website analyses and their scores.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/analyze",
					className: "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover",
					children: "New analysis"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Search by URL or ID…",
					"aria-label": "Search reports",
					className: "h-11 w-full rounded-xl border border-border bg-card pl-9 text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 card-surface overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(0,1fr)_100px_120px] items-center gap-4 border-b border-border bg-surface px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Website" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Score" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Date" })
						]
					}),
					filtered.map(({ analysis, site }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/reports/$id",
						params: { id: analysis.id },
						className: "grid grid-cols-[minmax(0,1fr)_100px_120px] items-center gap-4 border-b border-border px-6 py-4 transition-colors last:border-b-0 hover:bg-surface",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4 text-muted-foreground" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-sm font-medium text-foreground",
										children: site.url
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: ["Report #", analysis.id.slice(0, 8)]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-heading text-lg font-semibold tabular-nums",
								children: analysis.overall_score ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: new Date(analysis.created_at).toLocaleDateString()
							})
						]
					}, analysis.id)),
					!filtered.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-8 text-center text-sm text-muted-foreground",
						children: "No reports found."
					})
				]
			})
		]
	}) });
}
//#endregion
export { ReportsList as component };
