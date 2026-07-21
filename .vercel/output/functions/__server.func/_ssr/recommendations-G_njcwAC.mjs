import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as Clock, d as Sparkles, q as ArrowRight } from "../_libs/lucide-react.mjs";
import { a as getHistory, n as PageHeader, o as getReport, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
import { t as SeverityBadge } from "./severity-badge-DWAaq7mH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recommendations-G_njcwAC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Recommendations() {
	const [reports, setReports] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		getHistory().then(async ({ entries }) => setReports(await Promise.all(entries.map(({ analysis }) => getReport(analysis.id))))).finally(() => setLoading(false));
	}, []);
	const issues = (0, import_react.useMemo)(() => reports.flatMap((report) => report.issues.map((issue) => ({
		issue,
		report
	}))).sort((a, b) => severityRank(a.issue.severity) - severityRank(b.issue.severity)), [reports]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl animate-in-up px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "AI recommendations",
				title: "What to do next",
				description: "Recommendations from your saved website audits, ordered by severity."
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted-foreground",
				children: "Loading recommendations..."
			}) : null,
			!loading && !issues.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 card-surface p-8 text-center text-sm text-muted-foreground",
				children: "Run an analysis to see recommendations from real findings."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-4",
				children: issues.map(({ issue, report }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary",
											children: index + 1
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityBadge, { severity: issue.severity }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), issue.estimated_fix_time]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-heading mt-3 text-lg font-semibold",
									children: issue.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 max-w-2xl text-sm text-muted-foreground",
									children: issue.recommendation
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/fixes",
								className: "inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), "Generate AI fix"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/issues/$id",
								params: { id: issue.id },
								className: "inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-surface",
								children: ["View details ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/reports/$id",
								params: { id: report.analysis.id },
								className: "text-xs font-semibold text-primary hover:underline",
								children: "Open report"
							})
						]
					})]
				}, issue.id))
			})
		]
	}) });
}
function severityRank(severity) {
	return {
		critical: 0,
		high: 1,
		medium: 2,
		low: 3,
		info: 4
	}[severity];
}
//#endregion
export { Recommendations as component };
