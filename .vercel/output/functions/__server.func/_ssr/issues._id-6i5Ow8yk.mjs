import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as CodeXml, J as ArrowLeft, M as ExternalLink, S as Lightbulb, d as Sparkles } from "../_libs/lucide-react.mjs";
import { a as getHistory, n as PageHeader, o as getReport, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
import { t as SeverityBadge } from "./severity-badge-DWAaq7mH.mjs";
import { t as Route } from "./issues._id-B76QmS4W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/issues._id-6i5Ow8yk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IssueDetail() {
	const { id } = Route.useParams();
	const [report, setReport] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		getHistory().then(async ({ entries }) => {
			const match = (await Promise.all(entries.map(({ analysis }) => getReport(analysis.id)))).find((candidate) => candidate.issues.some((issue) => issue.id === id));
			if (!match) throw new Error("This issue was not found in your saved reports.");
			if (active) setReport(match);
		}).catch((cause) => active && setError(cause instanceof Error ? cause.message : "Unable to load this issue."));
		return () => {
			active = false;
		};
	}, [id]);
	if (error || !report) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: error ? "Issue unavailable" : "Loading issue",
			title: error ? "We could not load this issue" : "Preparing issue details",
			description: error ?? "Loading the saved finding and its audited website.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/reports",
				className: "btn-primary",
				children: "Back to reports"
			})
		})
	}) });
	const issue = report.issues.find((candidate) => candidate.id === id);
	if (!issue) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl animate-in-up px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/reports/$id",
				params: { id: report.analysis.id },
				className: "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Back to report"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityBadge, { severity: issue.severity }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold capitalize text-muted-foreground",
								children: issue.category
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Detected in saved audit"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-heading text-2xl font-semibold sm:text-3xl",
						children: issue.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-3xl text-sm text-muted-foreground",
						children: issue.description
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailCard, {
							icon: CodeXml,
							title: "Technical explanation",
							body: issue.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailCard, {
							icon: Lightbulb,
							title: "Recommendation",
							body: issue.recommendation
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailCard, {
							icon: Sparkles,
							title: "Estimated fix time",
							body: issue.estimated_fix_time
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-heading text-sm font-semibold",
									children: "AI can help fix this"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Generate or reopen the saved AI guidance for this real audit finding."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/fixes",
								className: "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover",
								children: "Open AI fixes"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-heading text-sm font-semibold",
								children: "Affected URL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: report.site.url,
								target: "_blank",
								rel: "noreferrer",
								className: "mt-3 flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-primary hover:bg-primary/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-mono text-xs",
									children: report.site.url
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5 shrink-0" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "This audit scans the submitted homepage only."
							})
						]
					})]
				})]
			})
		]
	}) });
}
function DetailCard({ icon: Icon, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "card-surface p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-heading text-sm font-semibold",
				children: title
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-[15px] leading-relaxed text-foreground/90",
			children: body
		})]
	});
}
//#endregion
export { IssueDetail as component };
