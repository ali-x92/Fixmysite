import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useToast } from "./toast-BG9z9MQh.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as Download, d as Sparkles, p as Share2, q as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as PageHeader, o as getReport, s as getSummary, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
import { t as SeverityBadge } from "./severity-badge-DWAaq7mH.mjs";
import { t as Route } from "./reports._id-BJh4l51V.mjs";
import { t as ScoreRing } from "./score-ring-DYljwovs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports._id-CNrFfdBR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function categoriesForExport(analysis) {
	return [
		["Performance", analysis.performance_score],
		["SEO", analysis.seo_score],
		["Accessibility", analysis.accessibility_score],
		["Security", analysis.security_score],
		["Mobile", analysis.mobile_score],
		["User experience", analysis.ux_score]
	].map(([label, score]) => `${label}: ${typeof score === "number" ? score : "Not available"}`);
}
function ReportDetail() {
	const { id } = Route.useParams();
	const [report, setReport] = (0, import_react.useState)(null);
	const [summary, setSummary] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const { notify } = useToast();
	(0, import_react.useEffect)(() => {
		Promise.all([getReport(id), getSummary(id)]).then(([nextReport, nextSummary]) => {
			setReport(nextReport);
			setSummary(nextSummary);
		}).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load this report."));
	}, [id]);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Report unavailable",
			title: "We could not load this analysis",
			description: error,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/reports",
				className: "btn-primary",
				children: "Back to reports"
			})
		})
	}) });
	if (!report) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Loading report",
			title: "Preparing your analysis",
			description: "Loading saved results and recommendations."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-8 h-64 rounded-2xl skeleton-shimmer" })]
	}) });
	const analysis = report?.analysis;
	const issues = report?.issues ?? [];
	const overallScore = analysis?.overall_score ?? 0;
	const severityCounts = issues.reduce((counts, issue) => {
		counts[issue.severity] += 1;
		return counts;
	}, {
		critical: 0,
		high: 0,
		medium: 0,
		low: 0,
		info: 0
	});
	const shareReport = async () => {
		const shareUrl = window.location.href;
		const shareData = {
			title: `FixMySite AI report for ${report.site.domain}`,
			text: `Website health score: ${overallScore}/100`,
			url: shareUrl
		};
		try {
			if (navigator.share) {
				await navigator.share(shareData);
				return;
			}
			await navigator.clipboard.writeText(shareUrl);
			notify("Report link copied to your clipboard.", "success");
		} catch (cause) {
			if (cause instanceof DOMException && cause.name === "AbortError") return;
			notify("Unable to share this report. Please copy the address from your browser.", "error");
		}
	};
	const exportReport = () => {
		const lines = [
			"FixMySite AI Website Analysis Report",
			`Website: ${report.site.url}`,
			`Generated: ${new Date(analysis.created_at).toLocaleString()}`,
			`Overall health score: ${overallScore}/100`,
			"",
			"Category scores",
			...categoriesForExport(analysis),
			"",
			"Issues",
			...issues.length ? issues.map((issue) => `[${issue.severity.toUpperCase()}] ${issue.title}\n${issue.description}\nRecommendation: ${issue.recommendation}`) : ["No issues were found in this audit."]
		];
		const blob = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
		const downloadUrl = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = downloadUrl;
		anchor.download = `fixmysite-report-${report.site.domain}-${analysis.id.slice(0, 8)}.txt`;
		anchor.click();
		URL.revokeObjectURL(downloadUrl);
		notify("Report exported.", "success");
	};
	const categories = [
		["SEO", analysis?.seo_score],
		["Accessibility", analysis?.accessibility_score],
		["Performance", analysis?.performance_score],
		["Security", analysis?.security_score],
		["Mobile", analysis?.mobile_score],
		["User Experience", analysis?.ux_score]
	].map(([name, rawScore]) => {
		const score = typeof rawScore === "number" ? rawScore : 0;
		return {
			key: name,
			name,
			score,
			status: score >= 80 ? "Good" : "Needs work",
			severity: score < 60 ? "high" : score < 80 ? "medium" : "low",
			summary: "Based on the latest completed homepage audit."
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10 animate-in-up",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/reports",
						className: "hover:text-foreground",
						children: "Reports"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: id
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: `${analysis ? "Latest" : "Loading"} · Full audit`,
				title: "Analysis results",
				description: analysis ? `Completed ${new Date(analysis.created_at).toLocaleString()} · ${issues.length} issues found` : "Loading report…",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: shareReport,
					className: "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4" }), "Share"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: exportReport,
					className: "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), "Export"]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface flex flex-col items-center gap-4 p-8 lg:col-span-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRing, {
							value: overallScore,
							size: 200
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-heading text-sm font-semibold",
								children: "Overall health"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Composite of all 7 categories"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid w-full grid-cols-3 divide-x divide-border border-t border-border pt-4",
							children: [
								{
									l: "Critical",
									v: severityCounts.critical,
									t: "text-danger"
								},
								{
									l: "High",
									v: severityCounts.high,
									t: "text-warning"
								},
								{
									l: "Low",
									v: severityCounts.low,
									t: "text-primary"
								}
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `text-heading text-xl font-semibold tabular-nums ${s.t}`,
									children: s.v
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
									children: s.l
								})]
							}, s.l))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface lg:col-span-2 p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-8 w-8 place-items-center rounded-xl bg-primary/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-heading text-sm font-semibold",
								children: "AI executive summary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: summary?.source === "fallback" ? "Deterministic fallback guidance" : "Generated by Groq AI · GPT-OSS 20B"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-[15px] leading-relaxed text-foreground",
							children: summary?.executiveSummary ?? analysis.executive_summary ?? "This audit is ready for review. Prioritize the findings below and run another audit after deploying changes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[15px] leading-relaxed text-muted-foreground",
							children: issues.length ? `${severityCounts.critical + severityCounts.high} high-priority issue${severityCounts.critical + severityCounts.high === 1 ? "" : "s"} need attention. Generate a fix from a saved finding when ready.` : "No issues were found in this completed audit."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/fixes",
								className: "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover",
								children: ["Generate AI fixes ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/recommendations",
								className: "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-surface",
								children: "View recommendations"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-heading mt-10 mb-4 text-lg font-semibold",
				children: "Category breakdown"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface flex flex-col p-5 transition-shadow hover:shadow-elevated",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-heading text-sm font-semibold",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: c.status
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityBadge, { severity: c.severity })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-end gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-heading text-4xl font-semibold tabular-nums ${c.score >= 85 ? "text-primary" : c.score >= 70 ? "text-warning" : "text-danger"}`,
								children: c.score
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pb-1 text-xs text-muted-foreground",
								children: "/100"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `h-full rounded-full ${c.score >= 85 ? "bg-primary" : c.score >= 70 ? "bg-warning" : "bg-danger"}`,
								style: { width: `${c.score}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground",
							children: c.summary
						}),
						issues[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/issues/$id",
							params: { id: issues[0].id },
							className: "mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover",
							children: ["View details ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
						})
					]
				}, c.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 card-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between border-b border-border px-6 py-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-heading text-sm font-semibold",
						children: "Top issues"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Sorted by business impact"
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border",
					children: issues.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/issues/$id",
						params: { id: i.id },
						className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-surface",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-8 w-8 place-items-center rounded-lg bg-surface text-xs font-semibold text-muted-foreground",
								children: i.category.slice(0, 2).toUpperCase()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-medium text-foreground",
									children: i.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 line-clamp-1 text-xs text-muted-foreground",
									children: i.description
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityBadge, { severity: i.severity }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 text-muted-foreground" })]
							})
						]
					}, i.id))
				})]
			})
		]
	}) });
}
//#endregion
export { ReportDetail as component };
