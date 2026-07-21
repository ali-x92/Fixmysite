import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useToast } from "./toast-BG9z9MQh.mjs";
import { a as normalizeWebsiteUrl } from "./contracts-B__nLE0W.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { i as getSupabaseBrowserClient } from "./auth-client-DOg5UVO1.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Globe, K as ArrowUpRight, L as Clock, d as Sparkles, x as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as getHistory, n as PageHeader, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyze-cjk86nXf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var examples = [
	"stripe.com",
	"linear.app",
	"vercel.com",
	"notion.so"
];
function AnalyzePage() {
	const [url, setUrl] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [recent, setRecent] = (0, import_react.useState)([]);
	const navigate = useNavigate();
	const { notify } = useToast();
	(0, import_react.useEffect)(() => {
		getHistory().then(({ entries }) => setRecent(entries.slice(0, 4))).catch(() => setRecent([]));
	}, []);
	const start = async () => {
		if (!url) return;
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16 animate-in-up",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "New analysis",
				title: "Analyze any website in seconds",
				description: "Paste a URL and our AI will audit SEO, performance, accessibility, security, UX and mobile — then explain every issue in plain English."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 card-surface p-6 md:p-8 shadow-elevated",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Website URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								inputMode: "url",
								autoFocus: true,
								value: url,
								onChange: (e) => setUrl(e.target.value),
								onKeyDown: (e) => e.key === "Enter" && start(),
								placeholder: "https://website-to-analyze.com",
								className: "h-14 w-full rounded-2xl border border-border bg-background pl-12 pr-4 text-base font-medium outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-soft focus:ring-4 focus:ring-primary/10"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: start,
							disabled: loading,
							className: "inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover disabled:opacity-70",
							children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), loading ? "Analyzing…" : "Analyze website"]
						})]
					}),
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 space-y-3",
						children: [
							"Validating URL",
							"Auditing SEO & meta",
							"Measuring performance",
							"Checking accessibility"
						].map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 rounded-xl bg-surface px-4 py-2.5 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: `h-3.5 w-3.5 ${i < 2 ? "text-primary animate-spin" : "text-muted-foreground"}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: i < 2 ? "font-medium text-foreground" : "text-muted-foreground",
									children: step
								}),
								i < 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto text-xs text-muted-foreground",
									children: "Running…"
								})
							]
						}, step))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Try:"
						}), examples.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setUrl(`https://${e}`),
							className: "rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-surface hover:text-foreground",
							children: e
						}, e))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					"SEO",
					"Accessibility",
					"Performance",
					"UX",
					"Security",
					"Mobile",
					"Best practices"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 w-8 rounded-full bg-primary/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-4 rounded-full bg-primary" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-heading mt-3 text-sm font-semibold",
							children: t
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Audited by AI"
						})
					]
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-heading text-sm font-semibold",
						children: "Recent analyses"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface divide-y divide-border",
					children: [recent.map(({ analysis, site }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/reports/$id",
						params: { id: analysis.id },
						className: "flex items-center gap-4 px-5 py-3.5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-4 w-4 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-sm font-medium text-foreground",
									children: site.url
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: new Date(analysis.created_at).toLocaleDateString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-heading text-base font-semibold tabular-nums",
								children: analysis.overall_score ?? "-"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4 text-muted-foreground" })
						]
					}, analysis.id)), recent.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 py-8 text-center text-sm text-muted-foreground",
						children: "Your completed analyses will appear here."
					})]
				})]
			})
		]
	}) });
}
//#endregion
export { AnalyzePage as component };
