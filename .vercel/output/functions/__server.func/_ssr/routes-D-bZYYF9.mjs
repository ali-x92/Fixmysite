import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useToast } from "./toast-BG9z9MQh.mjs";
import { a as normalizeWebsiteUrl } from "./contracts-B__nLE0W.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { i as getSupabaseBrowserClient } from "./auth-client-DOg5UVO1.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { K as ArrowUpRight, N as Earth, d as Sparkles, f as ShieldCheck, q as ArrowRight, s as TriangleAlert, t as Zap, x as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as getHistory, n as PageHeader, o as getReport, s as getSummary, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
import { t as SeverityBadge } from "./severity-badge-DWAaq7mH.mjs";
import { t as ScoreRing } from "./score-ring-DYljwovs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D-bZYYF9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const [history, setHistory] = (0, import_react.useState)([]);
	const [report, setReport] = (0, import_react.useState)(null);
	const [summary, setSummary] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getHistory().then(async ({ entries }) => {
			setHistory(entries);
			const latest = entries[0];
			if (!latest) return;
			const [nextReport, nextSummary] = await Promise.all([getReport(latest.analysis.id), getSummary(latest.analysis.id)]);
			setReport(nextReport);
			setSummary(nextSummary);
		}).catch((cause) => setError(cause instanceof Error ? cause.message : "Your workspace could not be loaded."));
	}, []);
	if (!history.length && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, {});
	const analysis = report?.analysis ?? history[0]?.analysis;
	const latestSite = history[0]?.site;
	const categories = [
		["Performance", analysis?.performance_score],
		["SEO", analysis?.seo_score],
		["Accessibility", analysis?.accessibility_score],
		["Security", analysis?.security_score]
	];
	const criticalIssues = report?.issues.filter((issue) => issue.severity === "critical" || issue.severity === "high").slice(0, 4) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10 animate-in-up",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Workspace health",
				title: "Your latest website analysis",
				description: latestSite ? `Review ${latestSite.domain}, prioritize the most important issues, and keep improvements moving.` : "Loading your latest analysis…",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/analyze",
					className: "btn-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " Analyze a website"]
				})
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "alert",
				className: "mt-6 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "card-surface p-7 lg:col-span-2 shadow-elevated",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-8 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRing, { value: analysis?.overall_score ?? 0 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " Latest audit"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: latestSite?.domain ?? "Preparing workspace"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-heading mt-3 text-2xl font-semibold leading-tight",
									children: analysis?.overall_score === null ? "Analysis in progress" : "Health score at a glance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2.5 text-[15px] leading-relaxed text-muted-foreground",
									children: summary?.executiveSummary ?? "Your deterministic audit results will appear here as soon as the analysis is complete."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 grid grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
											label: "Open issues",
											value: String(report?.issues.length ?? 0)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
											label: "Priority issues",
											value: String(criticalIssues.length)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
											label: "Latest score",
											value: analysis?.overall_score === null || analysis?.overall_score === void 0 ? "—" : `${analysis.overall_score}/100`
										})
									]
								})
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface p-7 shadow-elevated",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-heading text-sm font-semibold",
								children: "AI action plan"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-2",
							children: summary?.priorityPlan.slice(0, 3).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2.5 rounded-lg p-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.title })]
							}, item.priority)) ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted-foreground",
								children: "AI priorities are generated when the latest audit is complete."
							})
						}),
						analysis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/reports/$id",
							params: { id: analysis.id },
							className: "mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover",
							children: ["Open full report ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-heading text-lg font-semibold",
						children: "Category scores"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/reports",
						className: "text-xs font-semibold text-muted-foreground hover:text-foreground",
						children: "View report history"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: categories.map(([name, score]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-heading text-sm font-semibold",
									children: name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4 text-muted-foreground" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-heading mt-3 text-3xl font-semibold tabular-nums",
								children: typeof score === "number" ? score : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Latest homepage audit"
							})
						]
					}, name))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b border-border px-6 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-heading text-sm font-semibold",
							children: "Recent analyses"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/history",
							className: "text-xs font-semibold text-primary",
							children: "See history"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border",
						children: history.slice(0, 5).map(({ analysis: item, site }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/reports/$id",
							params: { id: item.id },
							className: "flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { className: "h-4 w-4 text-muted-foreground" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-sm font-medium text-foreground",
										children: site.domain
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: new Date(item.created_at).toLocaleDateString()
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-heading text-lg font-semibold tabular-nums",
									children: item.overall_score ?? "—"
								})
							]
						}, item.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-heading text-sm font-semibold",
						children: "Priority issues"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: criticalIssues.length ? criticalIssues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/issues/$id",
							params: { id: issue.id },
							className: "block rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-surface",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "line-clamp-1 text-sm font-medium text-foreground",
									children: issue.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeverityBadge, { severity: issue.severity })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-xs capitalize text-muted-foreground",
								children: issue.category
							})]
						}, issue.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No priority issues in the latest report."
						})
					})]
				})]
			})
		]
	}) });
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface px-3.5 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-heading mt-1.5 text-xl font-semibold tabular-nums",
			children: value
		})]
	});
}
function Onboarding() {
	const navigate = useNavigate();
	const { notify } = useToast();
	const [url, setUrl] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const startAnalysis = async (event) => {
		event.preventDefault();
		setLoading(true);
		try {
			const { data } = await getSupabaseBrowserClient().auth.getSession();
			if (!data.session) throw new Error("Please sign in before starting an analysis.");
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: `Bearer ${data.session.access_token}`
				},
				body: JSON.stringify({ url: normalizeWebsiteUrl(url) })
			});
			const payload = await response.json();
			if (!response.ok || !payload.analysisId) throw new Error(payload.details ?? payload.message ?? "Unable to analyze this website.");
			navigate({
				to: "/reports/$id",
				params: { id: payload.analysisId }
			});
		} catch (error) {
			notify(error instanceof Error ? error.message : "Unable to analyze this website.", "error");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-20 animate-in-up",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface overflow-hidden p-8 text-center shadow-elevated sm:p-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm font-semibold text-primary",
					children: "Welcome to FixMySite AI"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-heading mt-2 text-3xl font-semibold sm:text-4xl",
					children: "Analyze your first website in under 60 seconds."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground",
					children: "Get a clear health score, accessibility and security findings, and practical AI-guided next steps from one homepage audit."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: startAnalysis,
					className: "mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						type: "url",
						value: url,
						onChange: (event) => setUrl(event.target.value),
						placeholder: "https://yourwebsite.com",
						className: "h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						disabled: loading,
						className: "btn-primary h-11 shrink-0 disabled:opacity-70",
						children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), loading ? "Analyzing..." : "Analyze website"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 grid gap-3 text-left sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
							icon: Zap,
							title: "Performance",
							text: "Identify the biggest opportunities."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
							icon: ShieldCheck,
							title: "Accessibility & security",
							text: "Surface issues that affect trust."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
							icon: TriangleAlert,
							title: "AI recommendations",
							text: "Turn findings into an action plan."
						})
					]
				})
			]
		})
	}) });
}
function Highlight({ icon: Icon, title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-heading mt-3 text-sm font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-relaxed text-muted-foreground",
				children: text
			})
		]
	});
}
//#endregion
export { Dashboard as component };
