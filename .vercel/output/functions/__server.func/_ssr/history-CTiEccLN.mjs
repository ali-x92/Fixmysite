import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useToast } from "./toast-BG9z9MQh.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Globe, h as Search, k as Funnel, u as Trash2 } from "../_libs/lucide-react.mjs";
import { a as getHistory, n as PageHeader, r as deleteAnalysis, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-CTiEccLN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HistoryPage() {
	const [history, setHistory] = (0, import_react.useState)([]);
	const [query, setQuery] = (0, import_react.useState)("");
	const [range, setRange] = (0, import_react.useState)("All");
	const [error, setError] = (0, import_react.useState)(null);
	const { notify } = useToast();
	(0, import_react.useEffect)(() => {
		getHistory().then((response) => setHistory(response.entries)).catch((cause) => setError(cause.message));
	}, []);
	const entries = (0, import_react.useMemo)(() => {
		const now = Date.now();
		return history.filter(({ analysis, site }) => {
			const matchesQuery = `${site.url} ${analysis.id}`.toLowerCase().includes(query.toLowerCase());
			const age = now - new Date(analysis.created_at).getTime();
			const matchesRange = range === "All" || range === "Last 7 days" && age <= 6048e5 || range === "This month" && new Date(analysis.created_at).getMonth() === (/* @__PURE__ */ new Date()).getMonth();
			return matchesQuery && matchesRange;
		});
	}, [
		history,
		query,
		range
	]);
	const remove = async (id) => {
		try {
			await deleteAnalysis(id);
			setHistory((current) => current.filter((entry) => entry.analysis.id !== id));
			notify("Report deleted.", "success");
		} catch (cause) {
			const message = cause instanceof Error ? cause.message : "Unable to delete this report.";
			setError(message);
			notify(message, "error");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10 animate-in-up",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Timeline",
				title: "Analysis history",
				description: "Every scan in reverse chronological order."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Search URLs…",
						"aria-label": "Search analysis history",
						className: "h-11 w-full rounded-xl border border-border bg-card pl-9 text-sm outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
					})]
				}), [
					"All",
					"Last 7 days",
					"This month"
				].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setRange(label),
					className: `inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium ${range === label ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-surface"}`,
					children: [range === label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-4 w-4" }), label]
				}, label))]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-4 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-4 top-2 bottom-2 w-px bg-border",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-3",
					children: [entries.map(({ analysis, site }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "relative pl-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-2.5 top-4 h-3 w-3 rounded-full border-2 border-primary bg-background" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card-surface flex items-center gap-4 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/reports/$id",
								params: { id: analysis.id },
								className: "flex min-w-0 flex-1 items-center gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4 text-muted-foreground" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-sm font-semibold text-foreground",
											children: site.url
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: [
												new Date(analysis.created_at).toLocaleString(),
												" · Report #",
												analysis.id.slice(0, 8)
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-heading text-xl font-semibold tabular-nums",
										children: analysis.overall_score ?? "—"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => remove(analysis.id),
								"aria-label": `Delete report for ${site.domain}`,
								className: "rounded-lg p-2 text-muted-foreground hover:bg-surface hover:text-danger",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})]
						})]
					}, analysis.id)), !entries.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "card-surface p-8 text-center text-sm text-muted-foreground",
						children: "No analyses match your filters."
					})]
				})]
			})
		]
	}) });
}
//#endregion
export { HistoryPage as component };
