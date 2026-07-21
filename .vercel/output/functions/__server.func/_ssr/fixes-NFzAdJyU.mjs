import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useToast } from "./toast-BG9z9MQh.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Globe, I as CodeXml, J as ArrowLeft, d as Sparkles, i as WandSparkles, x as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as getHistory, i as generateFix, n as PageHeader, o as getReport, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
import { t as SeverityBadge } from "./severity-badge-DWAaq7mH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fixes-NFzAdJyU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FixesPage() {
	const { notify } = useToast();
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [report, setReport] = (0, import_react.useState)(null);
	const [fix, setFix] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [generatingId, setGeneratingId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getHistory().then(({ entries: nextEntries }) => setEntries(nextEntries)).catch((error) => notify(error instanceof Error ? error.message : "Unable to load fixes.", "error")).finally(() => setLoading(false));
	}, [notify]);
	const openReport = async (analysisId) => {
		setLoading(true);
		try {
			setReport(await getReport(analysisId));
			setFix(null);
		} catch (error) {
			notify(error instanceof Error ? error.message : "Unable to load this analysis.", "error");
		} finally {
			setLoading(false);
		}
	};
	const createFix = async (issueId) => {
		setGeneratingId(issueId);
		try {
			setFix(await generateFix(issueId));
		} catch (error) {
			notify(error instanceof Error ? error.message : "Unable to generate a fix.", "error");
		} finally {
			setGeneratingId(null);
		}
	};
	if (fix) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl animate-in-up px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setFix(null),
				className: "inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " All issues"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "AI-generated fix",
				title: fix.fix.problem,
				description: fix.fix.explanation
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 card-surface p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm font-semibold text-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeXml, { className: "h-4 w-4 text-primary" }), " Suggested code"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-4 overflow-x-auto rounded-xl bg-[oklch(0.16_0.02_260)] p-5 text-sm leading-6 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: fix.fix.suggestedCode })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						title: "Implementation notes",
						body: fix.fix.implementationNotes
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						title: "Expected result",
						body: fix.fix.expectedResult
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						title: "Testing advice",
						body: fix.fix.testingAdvice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						title: "Rollback notes",
						body: fix.fix.rollbackNotes
					})
				]
			})
		]
	}) });
	if (report) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl animate-in-up px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setReport(null),
				className: "inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " All analyses"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "AI Fixes",
				title: "Choose an issue",
				description: "Generate a focused, AI-assisted fix from a real issue in this saved analysis."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-3",
				children: [report.issues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FixIssueRow, {
					issue,
					generatingId,
					onCreateFix: createFix
				}, issue.id)), report.issues.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "card-surface p-8 text-center text-sm text-muted-foreground",
					children: "This analysis has no issues to generate fixes for."
				})]
			})
		]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl animate-in-up px-4 py-8 md:px-8 md:py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "AI Fixes",
			title: "Fix real website issues",
			description: "Select one of your saved analyses to generate a practical fix for an identified issue."
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 card-surface p-8 text-center text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto mb-3 h-5 w-5 animate-spin text-primary" }), "Loading analyses..."]
		}) : entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 card-surface p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mx-auto h-6 w-6 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-heading text-lg font-semibold",
					children: "No analyses yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Run your first website analysis to generate fixes from real findings."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/analyze",
					className: "mt-5 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover",
					children: "Analyze a website"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 space-y-3",
			children: entries.map(({ analysis, site }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => openReport(analysis.id),
				className: "card-surface flex w-full items-center gap-4 p-5 text-left hover:border-primary/30 hover:shadow-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate text-heading text-sm font-semibold",
							children: site.domain
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [
								new Date(analysis.created_at).toLocaleDateString(),
								" · ",
								analysis.status
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-heading text-lg font-semibold",
						children: analysis.overall_score ?? "-"
					})
				]
			}, analysis.id))
		})]
	}) });
}
function InfoCard({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "card-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-heading text-sm font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm leading-relaxed text-muted-foreground",
			children: body
		})]
	});
}
function FixIssueRow({ issue, generatingId, onCreateFix }) {
	const hasGeneratedFix = Boolean(issue.ai_explanation && "fix" in issue.ai_explanation);
	const isGenerating = generatingId === issue.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface flex flex-wrap items-center gap-4 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityBadge, { severity: issue.severity }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: issue.category
						}),
						hasGeneratedFix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary",
							children: "Generated"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-heading text-base font-semibold",
					children: issue.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: issue.recommendation
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => onCreateFix(issue.id),
			disabled: generatingId !== null,
			className: "inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-70",
			children: [isGenerating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "h-4 w-4" }), isGenerating ? "Opening..." : hasGeneratedFix ? "View generated code" : "Generate fix"]
		})]
	});
}
//#endregion
export { FixesPage as component };
