import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as ToastContext } from "./toast-BG9z9MQh.mjs";
import { a as coerce, c as objectType, d as unknownType, f as ZodIssueCode, i as arrayType, n as OpenAI, o as enumType, r as NEVER, s as numberType, t as zodTextFormat, u as stringType } from "../_libs/openai+zod.mjs";
import { a as normalizeWebsiteUrl, i as analyzeResponseSchema, n as analysisSchema, o as reportParamsSchema, r as analyzeRequestSchema, s as reportResponseSchema, t as analysisIdSchema } from "./contracts-B__nLE0W.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as CircleCheck, T as Info, n as X, z as CircleX } from "../_libs/lucide-react.mjs";
import { t as Route$20 } from "./issues._id-B76QmS4W.mjs";
import { t as Route$21 } from "./reports._id-BJh4l51V.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as initializeApp, o as getApp, s as getApps } from "../_libs/@firebase/analytics+[...].mjs";
import "../_libs/firebase.mjs";
import { join } from "node:path";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DYXNfkTh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var toastStyles = {
	success: {
		icon: CircleCheck,
		className: "text-success"
	},
	error: {
		icon: CircleX,
		className: "text-danger"
	},
	info: {
		icon: Info,
		className: "text-info"
	}
};
function ToastProvider({ children }) {
	const [toasts, setToasts] = (0, import_react.useState)([]);
	const dismiss = (0, import_react.useCallback)((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
	const notify = (0, import_react.useCallback)((message, kind = "info") => {
		const id = Date.now();
		setToasts((current) => [...current, {
			id,
			kind,
			message
		}].slice(-3));
		window.setTimeout(() => dismiss(id), 4e3);
	}, [dismiss]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToastContext.Provider, {
		value: { notify },
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-live": "polite",
			className: "fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2",
			children: toasts.map((toast) => {
				const style = toastStyles[toast.kind];
				const Icon = style.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: toast.kind === "error" ? "alert" : "status",
					className: "card-surface flex items-start gap-3 p-3.5 shadow-pop animate-slide-in-right",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `mt-0.5 h-4 w-4 shrink-0 ${style.className}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "flex-1 text-sm leading-5 text-foreground",
							children: toast.message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => dismiss(toast.id),
							"aria-label": "Dismiss notification",
							className: "rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
						})
					]
				}, toast.id);
			})
		})]
	});
}
var styles_default = "/assets/styles-BSaj6fhF.css";
function reportApplicationError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__fixMySiteErrorReporter?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var firebaseApp = getApps().length ? getApp() : initializeApp({
	apiKey: "AIzaSyDn_9ecokJHWoD6ctso-RxxzLA-_glvwdA",
	authDomain: "fixmysite-66e3f.firebaseapp.com",
	projectId: "fixmysite-66e3f",
	storageBucket: "fixmysite-66e3f.firebasestorage.app",
	messagingSenderId: "259295108554",
	appId: "1:259295108554:web:21686b1525568aab9f0333",
	measurementId: "G-9R48617R5V"
});
async function initializeFirebaseAnalytics() {
	if (typeof window === "undefined") return;
	try {
		const { getAnalytics, isSupported } = await import("../_libs/firebase.mjs").then((n) => n.t);
		if (await isSupported()) getAnalytics(firebaseApp);
	} catch {}
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportApplicationError(error, { boundary: "root_error_boundary" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$19 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "FixMySite AI | AI-powered Website Analysis & Intelligent Fix Recommendations" },
			{
				name: "description",
				content: "FixMySite AI analyzes websites using Lighthouse and accessibility audits, then uses Groq AI to explain issues, prioritize improvements, and generate intelligent fix recommendations."
			},
			{
				property: "og:title",
				content: "FixMySite AI | Intelligent Website Analysis"
			},
			{
				property: "og:description",
				content: "AI-powered Website Analysis & Intelligent Fix Recommendations."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:image",
				content: "/fixmysite-logo.png"
			},
			{
				name: "twitter:title",
				content: "FixMySite AI | Intelligent Website Analysis"
			},
			{
				name: "twitter:description",
				content: "AI-powered Website Analysis & Intelligent Fix Recommendations."
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:image",
				content: "/fixmysite-logo.png"
			},
			{
				name: "application-name",
				content: "FixMySite AI"
			},
			{
				name: "theme-color",
				content: "#0f766e"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				sizes: "any"
			},
			{
				rel: "icon",
				href: "/favicon-16x16.png",
				sizes: "16x16",
				type: "image/png"
			},
			{
				rel: "icon",
				href: "/favicon-32x32.png",
				sizes: "32x32",
				type: "image/png"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png",
				sizes: "180x180"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "preconnect",
				href: "https://api.fontshare.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$19.useRouteContext();
	(0, import_react.useEffect)(() => {
		initializeFirebaseAnalytics();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
	});
}
var $$splitComponentImporter$11 = () => import("./sign-up-DgaFEZZE.mjs");
var Route$18 = createFileRoute("/sign-up")({
	head: () => ({ meta: [{ title: "Create account - FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./settings-BOfL-VTs.mjs");
var Route$17 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings - FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./reset-password-DAvywZLI.mjs");
var Route$16 = createFileRoute("/reset-password")({
	head: () => ({ meta: [{ title: "Reset password - FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./recommendations-G_njcwAC.mjs");
var Route$15 = createFileRoute("/recommendations")({
	head: () => ({ meta: [{ title: "AI Recommendations - FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./profile-Crc4pY9L.mjs");
var Route$14 = createFileRoute("/profile")({
	head: () => ({ meta: [{ title: "Profile — FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./login-D1MT3I1A.mjs");
var Route$13 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Sign in - FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./history-CTiEccLN.mjs");
var Route$12 = createFileRoute("/history")({
	head: () => ({ meta: [{ title: "History — FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./fixes-NFzAdJyU.mjs");
var Route$11 = createFileRoute("/fixes")({
	head: () => ({ meta: [{ title: "AI Fixes - FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./check-email-BsT7-SBK.mjs");
var Route$10 = createFileRoute("/check-email")({
	head: () => ({ meta: [{ title: "Check your email - FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./analyze-cjk86nXf.mjs");
var Route$9 = createFileRoute("/analyze")({
	head: () => ({ meta: [{ title: "Analyze — FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./routes-D-bZYYF9.mjs");
var Route$8 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./reports.index-BVC70gU_.mjs");
var Route$7 = createFileRoute("/reports/")({
	head: () => ({ meta: [{ title: "Reports — FixMySite AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var shortText = stringType().trim().min(1).max(1200);
var aiPriorityPlanItemSchema = objectType({
	priority: numberType().int().min(1).max(5),
	title: shortText,
	reason: shortText,
	estimatedImpact: shortText,
	difficulty: enumType([
		"low",
		"medium",
		"high"
	]),
	expectedImprovement: shortText
});
var aiIssueExplanationSchema = objectType({
	issueId: stringType().uuid(),
	explanation: shortText,
	whyItMatters: shortText,
	whoItAffects: shortText,
	howToFix: shortText,
	businessImpact: shortText
});
var aiRecommendationSchema = objectType({
	title: shortText,
	description: shortText,
	expectedImpact: shortText
});
var aiGeneratedContentSchema = objectType({
	executiveSummary: stringType().trim().min(1).max(1800),
	priorityPlan: arrayType(aiPriorityPlanItemSchema).min(1).max(5),
	issueExplanations: arrayType(aiIssueExplanationSchema).max(100),
	recommendations: arrayType(aiRecommendationSchema).min(1).max(5)
});
var aiSummarySchema = aiGeneratedContentSchema.extend({
	source: enumType(["ai", "fallback"]),
	promptVersion: stringType().min(1),
	generatedAt: stringType().datetime()
});
var summaryRequestSchema = objectType({ analysisId: analysisIdSchema });
var summaryParamsSchema = objectType({ analysisId: analysisIdSchema });
var summaryResponseSchema = objectType({
	analysisId: analysisIdSchema,
	summary: aiSummarySchema
});
var aiFixContentSchema = objectType({
	problem: shortText,
	explanation: shortText,
	suggestedCode: stringType().trim().min(1).max(4e3),
	implementationNotes: shortText,
	expectedResult: shortText,
	testingAdvice: shortText,
	rollbackNotes: shortText
});
var aiFixResponseSchema = objectType({
	issueId: stringType().uuid(),
	source: enumType(["ai", "fallback"]),
	promptVersion: stringType().min(1),
	generatedAt: stringType().datetime(),
	fix: aiFixContentSchema
});
var serverEnvironmentSchema = objectType({
	SUPABASE_URL: stringType().url(),
	SUPABASE_ANON_KEY: stringType().min(1),
	SUPABASE_SERVICE_ROLE_KEY: stringType().min(1).optional()
});
function getServerEnvironment(environment = process.env) {
	return serverEnvironmentSchema.parse(environment);
}
function createRequestSupabaseClient(accessToken) {
	const environment = getServerEnvironment();
	return createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		},
		global: { headers: { Authorization: `Bearer ${accessToken}` } }
	});
}
var apiErrorSchema = objectType({
	error: enumType([
		"unauthorized",
		"not_found",
		"validation_error",
		"database_error",
		"analysis_error",
		"usage_limit"
	]),
	message: stringType(),
	details: unknownType().optional()
});
function jsonResponse(schema, payload, status = 200) {
	return Response.json(schema.parse(payload), { status });
}
function validationErrorResponse(error) {
	return jsonResponse(apiErrorSchema, {
		error: "validation_error",
		message: "Invalid request",
		details: error.flatten()
	}, 400);
}
function unauthorizedResponse() {
	return jsonResponse(apiErrorSchema, {
		error: "unauthorized",
		message: "Authentication is required"
	}, 401);
}
function notFoundResponse() {
	return jsonResponse(apiErrorSchema, {
		error: "not_found",
		message: "Resource not found"
	}, 404);
}
function usageLimitResponse(message) {
	return jsonResponse(apiErrorSchema, {
		error: "usage_limit",
		message
	}, 403);
}
function analysisErrorResponse(cause) {
	const details = (cause instanceof Error ? cause.message : cause && typeof cause === "object" && "message" in cause ? String(cause.message) : void 0)?.slice(0, 1e3);
	return jsonResponse(apiErrorSchema, {
		error: "analysis_error",
		message: "The scan could not be completed. Make sure the website is public and reachable, then try again.",
		details
	}, 422);
}
function databaseErrorResponse(cause) {
	const errorDetails = cause && typeof cause === "object" ? `${"message" in cause ? String(cause.message) : ""} ${"code" in cause ? String(cause.code) : ""}` : cause instanceof Error ? cause.message : "";
	return jsonResponse(apiErrorSchema, {
		error: "database_error",
		message: /SUPABASE_|environment|url|PGRST205|42P01|relation .* does not exist/i.test(errorDetails) ? "FixMySite AI is not connected to its database schema. Verify the Supabase environment variables and apply the project migrations." : "We could not complete that database request. Please try again in a moment."
	}, 500);
}
async function requireUser(request) {
	const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
	if (!accessToken) return unauthorizedResponse();
	const client = createRequestSupabaseClient(accessToken);
	const { data, error } = await client.auth.getUser(accessToken);
	if (error || !data.user) return unauthorizedResponse();
	return {
		client,
		user: data.user
	};
}
function throwIfDatabaseError(error) {
	if (error) throw error;
}
function requireDatabaseData(data, error) {
	throwIfDatabaseError(error);
	if (data === null) throw new Error("Database returned no data");
	return data;
}
function createSupabaseAnalysisRepository(client) {
	return {
		async findById(id) {
			const { data, error } = await client.from("analyses").select().eq("id", id).maybeSingle();
			throwIfDatabaseError(error);
			return data;
		},
		async create(values) {
			const { data, error } = await client.from("analyses").insert(values).select().single();
			return requireDatabaseData(data, error);
		},
		async listBySiteIds(siteIds) {
			if (siteIds.length === 0) return [];
			const { data, error } = await client.from("analyses").select().in("site_id", siteIds).order("created_at", { ascending: false });
			throwIfDatabaseError(error);
			return data ?? [];
		},
		async update(id, values) {
			const { data, error } = await client.from("analyses").update(values).eq("id", id).select().single();
			return requireDatabaseData(data, error);
		},
		async delete(id) {
			const { error } = await client.from("analyses").delete().eq("id", id);
			throwIfDatabaseError(error);
		}
	};
}
function createSupabaseIssueRepository(client) {
	return {
		async create(values) {
			const { data, error } = await client.from("issues").insert(values).select().single();
			return requireDatabaseData(data, error);
		},
		async findById(id) {
			const { data, error } = await client.from("issues").select().eq("id", id).maybeSingle();
			throwIfDatabaseError(error);
			return data;
		},
		async listByAnalysisId(analysisId) {
			const { data, error } = await client.from("issues").select().eq("analysis_id", analysisId);
			throwIfDatabaseError(error);
			return data ?? [];
		},
		async update(id, values) {
			const { data, error } = await client.from("issues").update(values).eq("id", id).select().single();
			return requireDatabaseData(data, error);
		},
		async delete(id) {
			const { error } = await client.from("issues").delete().eq("id", id);
			throwIfDatabaseError(error);
		}
	};
}
function createSupabaseRecommendationRepository(client) {
	return {
		async create(values) {
			const { data, error } = await client.from("recommendations").insert(values).select().single();
			return requireDatabaseData(data, error);
		},
		async listByAnalysisId(analysisId) {
			const { data, error } = await client.from("recommendations").select().eq("analysis_id", analysisId).order("priority");
			throwIfDatabaseError(error);
			return data ?? [];
		},
		async update(id, values) {
			const { data, error } = await client.from("recommendations").update(values).eq("id", id).select().single();
			return requireDatabaseData(data, error);
		},
		async delete(id) {
			const { error } = await client.from("recommendations").delete().eq("id", id);
			throwIfDatabaseError(error);
		}
	};
}
function createSupabaseSiteRepository(client) {
	return {
		async create(values) {
			const { data, error } = await client.from("sites").insert(values).select().single();
			return requireDatabaseData(data, error);
		},
		async findById(id) {
			const { data, error } = await client.from("sites").select().eq("id", id).maybeSingle();
			throwIfDatabaseError(error);
			return data;
		},
		async listByUserId(userId) {
			const { data, error } = await client.from("sites").select().eq("user_id", userId).order("created_at", { ascending: false });
			throwIfDatabaseError(error);
			return data ?? [];
		},
		async update(id, values) {
			const { data, error } = await client.from("sites").update(values).eq("id", id).select().single();
			return requireDatabaseData(data, error);
		},
		async delete(id) {
			const { error } = await client.from("sites").delete().eq("id", id);
			throwIfDatabaseError(error);
		}
	};
}
var score = (value) => Math.round((typeof value === "number" ? value : 0) * 100);
var asRecord = (value) => value && typeof value === "object" ? value : {};
async function scanHomepage(target) {
	const chromeLauncher = await import("../_libs/chrome-launcher+[...].mjs").then((n) => n.t);
	const lighthouseModule = await import("../_libs/lighthouse+[...].mjs").then((n) => n.t);
	const puppeteer = await import("puppeteer-core");
	const axe = await import("../_libs/axe-core.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const chromium = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) ? (await import("../_libs/@sparticuz/chromium+[...].mjs").then((n) => n.t)).default : null;
	const chrome = await chromeLauncher.launch({
		chromePath: chromium ? await chromium.executablePath(join(process.env.LAMBDA_TASK_ROOT ?? process.cwd(), "node_modules/@sparticuz/chromium/bin")) : void 0,
		chromeFlags: chromium ? chromium.args : [
			"--headless=new",
			"--no-sandbox",
			"--disable-dev-shm-usage"
		]
	});
	try {
		const lighthouse = lighthouseModule.default;
		const lighthouseResult = await lighthouse(target.url, {
			port: chrome.port,
			output: "json",
			onlyCategories: [
				"performance",
				"seo",
				"accessibility",
				"best-practices"
			],
			disableStorageReset: true
		});
		if (!lighthouseResult) throw new Error("Lighthouse did not return a result");
		const lhr = asRecord(lighthouseResult.lhr);
		const categories = asRecord(lhr.categories);
		const audits = asRecord(lhr.audits);
		const performance = score(asRecord(categories.performance).score);
		const seo = score(asRecord(categories.seo).score);
		const accessibility = score(asRecord(categories.accessibility).score);
		const bestPractices = score(asRecord(categories["best-practices"]).score);
		const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
		let axeResults = {};
		try {
			const page = await browser.newPage();
			await page.goto(target.url, {
				waitUntil: "networkidle2",
				timeout: 45e3
			});
			const axeSource = axe.default.source ?? axe.source;
			await page.evaluate(axeSource);
			axeResults = await page.evaluate(async () => globalThis.axe.run());
			await page.close();
		} finally {
			await browser.disconnect();
		}
		const response = await fetch(target.url, {
			redirect: "follow",
			signal: AbortSignal.timeout(2e4)
		});
		const securityHeaders = [
			"strict-transport-security",
			"content-security-policy",
			"x-frame-options"
		];
		const securityMissing = securityHeaders.filter((header) => !response.headers.get(header));
		const security = Math.round(((target.url.startsWith("https://") ? 1 : 0) + (securityHeaders.length - securityMissing.length) / securityHeaders.length) / 2 * 100);
		const issues = [];
		for (const violation of (axeResults.violations ?? []).slice(0, 20)) {
			const item = asRecord(violation);
			const nodes = Array.isArray(item.nodes) ? item.nodes : [];
			const impact = String(item.impact ?? "moderate");
			issues.push({
				category: "accessibility",
				severity: impact === "critical" ? "critical" : impact === "serious" ? "high" : impact === "moderate" ? "medium" : "low",
				title: String(item.help ?? item.id),
				description: String(item.description ?? "Accessibility violation"),
				recommendation: String(item.helpUrl ?? "Resolve the reported accessibility rule"),
				estimatedFixTime: "15–60 min",
				source: "axe",
				evidence: {
					ruleId: item.id,
					helpUrl: item.helpUrl,
					affectedElements: nodes.length,
					selector: asRecord(nodes[0]).target
				}
			});
		}
		for (const [id, auditValue] of Object.entries(audits)) {
			const audit = asRecord(auditValue);
			if (asRecord(audit.details).type === "opportunity" && typeof audit.numericValue === "number" && audit.numericValue > 0) issues.push({
				category: "performance",
				severity: audit.numericValue > 1e3 ? "high" : "medium",
				title: String(audit.title ?? id),
				description: String(audit.description ?? "Lighthouse opportunity"),
				recommendation: "Review and implement the Lighthouse recommendation.",
				estimatedFixTime: "30–90 min",
				source: "lighthouse",
				evidence: {
					auditId: id,
					savingsMs: audit.numericValue,
					displayValue: audit.displayValue
				}
			});
		}
		for (const header of securityMissing) issues.push({
			category: "security",
			severity: header === "content-security-policy" ? "high" : "medium",
			title: `Missing ${header} header`,
			description: "The homepage response does not include this passive security header.",
			recommendation: `Configure the ${header} response header.`,
			estimatedFixTime: "15–30 min",
			source: "security",
			evidence: { header }
		});
		const mobile = performance;
		const ux = Math.round((accessibility + bestPractices + seo) / 3);
		return {
			scores: {
				performance,
				seo,
				accessibility,
				security,
				mobile,
				ux,
				overall: Math.round((performance + seo + accessibility + security + mobile + ux) / 6)
			},
			issues: issues.slice(0, 40)
		};
	} finally {
		try {
			chrome.kill();
		} catch {}
	}
}
var privateIpv4 = /^(127\.|10\.|0\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/;
var submittedUrlSchema = stringType().trim().transform(normalizeWebsiteUrl).pipe(stringType().url()).transform((value, context) => {
	const url = new URL(value);
	if (!["http:", "https:"].includes(url.protocol) || url.hostname === "localhost" || privateIpv4.test(url.hostname) || url.hostname === "::1") {
		context.addIssue({
			code: ZodIssueCode.custom,
			message: "Only public HTTP(S) URLs are supported"
		});
		return NEVER;
	}
	url.hash = "";
	if (url.pathname === "/") url.pathname = "";
	return {
		url: url.toString().replace(/\/$/, ""),
		domain: url.hostname.toLowerCase()
	};
});
var UsageLimitError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "UsageLimitError";
	}
};
async function consumeAiFixCredit(client) {
	const { data, error } = await client.rpc("consume_ai_fix_credit");
	if (error) throw error;
	if (!data) throw new UsageLimitError("You have used all 5 AI fix credits.");
}
function createAnalysisRunService(dependencies) {
	return { async run(userId, input) {
		const target = submittedUrlSchema.parse(input.url);
		const userSites = await dependencies.sites.listByUserId(userId);
		const existingSite = userSites.find((site) => site.domain === target.domain);
		if (!existingSite && userSites.length >= 3) throw new UsageLimitError("You can analyze up to 3 distinct websites with this account.");
		const site = existingSite ?? await dependencies.sites.create({
			user_id: userId,
			url: target.url,
			domain: target.domain
		});
		const analysis = await dependencies.analyses.create({
			site_id: site.id,
			status: "running"
		});
		try {
			const result = await scanHomepage(target);
			const completed = await dependencies.analyses.update(analysis.id, {
				status: "completed",
				overall_score: result.scores.overall,
				performance_score: result.scores.performance,
				seo_score: result.scores.seo,
				accessibility_score: result.scores.accessibility,
				security_score: result.scores.security,
				mobile_score: result.scores.mobile,
				ux_score: result.scores.ux
			});
			await Promise.all(result.issues.map((issue) => dependencies.issues.create({
				analysis_id: analysis.id,
				category: issue.category,
				severity: issue.severity,
				title: issue.title,
				description: issue.description,
				recommendation: issue.recommendation,
				estimated_fix_time: issue.estimatedFixTime,
				source: issue.source,
				evidence: issue.evidence
			})));
			await Promise.all(result.issues.slice(0, 3).map((issue, index) => dependencies.recommendations.create({
				analysis_id: analysis.id,
				priority: index + 1,
				title: issue.title,
				description: issue.recommendation,
				expected_impact: `Improve ${issue.category} score`
			})));
			return {
				analysisId: completed.id,
				status: completed.status,
				overallScore: result.scores.overall,
				scores: {
					performance: result.scores.performance,
					seo: result.scores.seo,
					accessibility: result.scores.accessibility,
					security: result.scores.security,
					mobile: result.scores.mobile,
					ux: result.scores.ux
				}
			};
		} catch (error) {
			await dependencies.analyses.update(analysis.id, { status: "failed" }).catch(() => void 0);
			throw error;
		}
	} };
}
var AI_PROMPT_VERSION = "website-audit-v2";
function buildSummaryInstructions() {
	return [
		"You are FixMySite AI, a pragmatic senior web engineer.",
		"Explain only the deterministic audit data supplied by the application; do not invent scan findings.",
		"Write a concise, professional executive summary of 250 words or fewer.",
		"Give exactly five prioritized actions when five issues exist, otherwise one action per supplied issue.",
		"Give concise explanations only for supplied issue IDs. Offer practical recommendations that add value beyond the supplied recommendation text.",
		"Do not claim suggested fixes are guaranteed. Do not mention unavailable data."
	].join(" ");
}
function buildSummaryInput(input) {
	return JSON.stringify(input);
}
function buildFixInstructions() {
	return [
		"You are FixMySite AI, a pragmatic senior web engineer.",
		"Create a cautious implementation suggestion for the supplied deterministic issue only.",
		"Suggested code must be clearly AI-generated, generic when the stack is unknown, and never claimed to be guaranteed.",
		"Do not assume access to the site's source code or invent facts outside the issue."
	].join(" ");
}
function buildFixInput(issue) {
	return JSON.stringify({ issue });
}
function fallbackFix(issue) {
	return {
		problem: issue.title,
		explanation: issue.description,
		suggestedCode: buildFallbackCode(issue),
		implementationNotes: issue.recommendation,
		expectedResult: "The reported issue should improve after the recommended change is deployed.",
		testingAdvice: "Test the affected page in a staging environment, then rerun the audit.",
		rollbackNotes: "Keep the prior implementation available and revert the change if it causes regressions."
	};
}
function buildFallbackCode(issue) {
	const hint = `${issue.category} ${issue.title} ${issue.recommendation}`.toLowerCase();
	if (/content-security-policy|csp|hsts|x-frame|security header/.test(hint)) return `// middleware.ts (Next.js). Review directives for your domains before deployment.
import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'");
  return response;
}

export const config = { matcher: "/:path*" };`;
	if (/alt|image.*accessib|image.*text/.test(hint)) return `<!-- Informative images need meaningful alt text. Decorative images use an empty alt. -->
<img src="/images/feature.png" alt="Dashboard showing website performance issues" width="1200" height="630" />
<img src="/images/decoration.svg" alt="" aria-hidden="true" />`;
	if (/meta|title|description|seo|canonical/.test(hint)) return `<head>
  <title>Descriptive page title | Your Brand</title>
  <meta name="description" content="A clear, unique description of this page for search results." />
  <link rel="canonical" href="https://www.example.com/current-page" />
  <meta property="og:title" content="Descriptive page title" />
  <meta property="og:description" content="A clear page summary for social sharing." />
</head>`;
	if (/image|lcp|lazy|performance|render-block/.test(hint)) return `<!-- Prioritize the above-the-fold image and defer non-critical images. -->
<link rel="preload" as="image" href="/images/hero.avif" fetchpriority="high" />
<img src="/images/hero.avif" width="1600" height="900" alt="Product preview" fetchpriority="high" decoding="async" />
<img src="/images/gallery-1.avif" width="800" height="600" alt="Feature detail" loading="lazy" decoding="async" />`;
	return `/* AI-generated implementation starting point. Add this to the affected component stylesheet. */
:focus-visible { outline: 3px solid #0f766e; outline-offset: 3px; }
@media (max-width: 640px) { .interactive-control { min-width: 44px; min-height: 44px; } }`;
}
var AI_MODEL = "openai/gpt-oss-20b";
var GROQ_BASE_URL = "https://api.groq.com/openai/v1";
function createGroqService() {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) return null;
	const client = new OpenAI({
		apiKey,
		baseURL: GROQ_BASE_URL,
		maxRetries: 0,
		timeout: 2e4
	});
	return {
		async generateSummary(input) {
			return requestWithRetry(() => client.responses.parse({
				model: AI_MODEL,
				store: false,
				instructions: buildSummaryInstructions(),
				input: buildSummaryInput(input),
				text: { format: zodTextFormat(aiGeneratedContentSchema, "website_audit_summary") }
			}).then((response) => {
				if (!response.output_parsed) throw new Error("Groq returned no structured summary");
				return aiGeneratedContentSchema.parse(response.output_parsed);
			}));
		},
		async generateFix(input) {
			return requestWithRetry(() => client.responses.parse({
				model: AI_MODEL,
				store: false,
				instructions: buildFixInstructions(),
				input: buildFixInput(input),
				text: { format: zodTextFormat(aiFixContentSchema, "website_issue_fix") }
			}).then((response) => {
				if (!response.output_parsed) throw new Error("Groq returned no structured fix");
				return aiFixContentSchema.parse(response.output_parsed);
			}));
		}
	};
}
async function requestWithRetry(request) {
	try {
		return await request();
	} catch {
		return request();
	}
}
function createAiSummaryService(dependencies) {
	const ai = dependencies.ai ?? createGroqService();
	return {
		async getCached(userId, analysisId) {
			const report = await dependencies.report.getReport(userId, analysisId);
			if (!report) return null;
			return parseCachedSummary(report.analysis.ai_content);
		},
		async generate(userId, analysisId) {
			const report = await dependencies.report.getReport(userId, analysisId);
			if (!report) return null;
			const cached = parseCachedSummary(report.analysis.ai_content);
			if (cached) return cached;
			const site = await dependencies.sites.findById(report.analysis.site_id);
			if (!site || site.user_id !== userId) return null;
			const input = createAuditInput(site.url, report);
			let content;
			let source = "ai";
			try {
				if (!ai) throw new Error("Groq is not configured");
				content = await ai.generateSummary(input);
			} catch {
				source = "fallback";
				content = createFallbackSummary(input);
			}
			const summary = aiSummarySchema.parse({
				...content,
				source,
				promptVersion: AI_PROMPT_VERSION,
				generatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			await dependencies.analyses.update(analysisId, {
				executive_summary: summary.executiveSummary,
				ai_content: summary,
				ai_generated_at: summary.generatedAt,
				ai_prompt_version: AI_PROMPT_VERSION
			});
			await Promise.all(summary.issueExplanations.map((explanation) => dependencies.issues.update(explanation.issueId, { ai_explanation: explanation })));
			return summary;
		}
	};
}
function parseCachedSummary(value) {
	const result = aiSummarySchema.safeParse(value);
	return result.success ? result.data : null;
}
function createAuditInput(website, report) {
	const issues = report.issues.slice(0, 100).map((issue) => ({
		id: issue.id,
		category: issue.category,
		severity: issue.severity,
		title: issue.title,
		description: issue.description,
		recommendation: issue.recommendation,
		estimatedFixTime: issue.estimated_fix_time
	}));
	return {
		website,
		scores: {
			overall: report.analysis.overall_score,
			performance: report.analysis.performance_score,
			seo: report.analysis.seo_score,
			accessibility: report.analysis.accessibility_score,
			security: report.analysis.security_score,
			mobile: report.analysis.mobile_score,
			ux: report.analysis.ux_score
		},
		issueCount: report.issues.length,
		criticalIssueCount: report.issues.filter((issue) => issue.severity === "critical").length,
		issues,
		recommendations: report.recommendations.slice(0, 5).map((recommendation) => ({
			title: recommendation.title,
			description: recommendation.description,
			expectedImpact: recommendation.expected_impact
		}))
	};
}
function createFallbackSummary(input) {
	const issueExplanations = input.issues.map((issue) => ({
		issueId: issue.id,
		explanation: issue.description,
		whyItMatters: `This ${issue.category.toLowerCase()} issue can reduce the quality of the visitor experience.`,
		whoItAffects: "Visitors using the affected page, including customers and search engines where relevant.",
		howToFix: issue.recommendation,
		businessImpact: "Resolving it can reduce friction and improve confidence in the site."
	}));
	const actionIssues = input.issues.slice(0, 5);
	return {
		executiveSummary: `The audit found ${input.issueCount} issue${input.issueCount === 1 ? "" : "s"} across the homepage. Focus first on the highest-severity findings, then validate the changes with a repeat audit. The deterministic scores provide the baseline for improvement.`,
		priorityPlan: actionIssues.map((issue, index) => ({
			priority: index + 1,
			title: issue.title,
			reason: issue.description,
			estimatedImpact: issue.severity === "critical" || issue.severity === "high" ? "High" : "Moderate",
			difficulty: "medium",
			expectedImprovement: issue.recommendation
		})),
		issueExplanations,
		recommendations: input.recommendations.length > 0 ? input.recommendations : [{
			title: "Resolve the highest-priority issues first",
			description: "Implement the deterministic recommendations and validate them on the homepage.",
			expectedImpact: "A clearer path to improving the audited categories."
		}]
	};
}
function createFixService(dependencies) {
	const ai = dependencies.ai ?? createGroqService();
	return { async requestFix(userId, input) {
		const issue = await dependencies.issues.findById(input.issueId);
		if (!issue) return null;
		const report = await dependencies.report.getReport(userId, issue.analysis_id);
		if (!report || !report.issues.some((item) => item.id === issue.id)) return null;
		const cached = parseCachedFix(issue.ai_explanation);
		if (cached) return cached;
		await consumeAiFixCredit(dependencies.client);
		let fix;
		let source = "ai";
		try {
			if (!ai) throw new Error("Groq is not configured");
			fix = await ai.generateFix({
				id: issue.id,
				category: issue.category,
				severity: issue.severity,
				title: issue.title,
				description: issue.description,
				recommendation: issue.recommendation,
				estimatedFixTime: issue.estimated_fix_time
			});
		} catch {
			source = "fallback";
			fix = fallbackFix(issue);
		}
		const response = aiFixResponseSchema.parse({
			issueId: issue.id,
			source,
			promptVersion: AI_PROMPT_VERSION,
			generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			fix
		});
		await dependencies.issues.update(issue.id, { ai_explanation: {
			...issue.ai_explanation ?? {},
			fix: response
		} });
		return response;
	} };
}
function parseCachedFix(value) {
	if (!value || !("fix" in value)) return null;
	const result = aiFixResponseSchema.safeParse(value.fix);
	if (!result.success || result.data.fix.suggestedCode.includes("No project source was provided")) return null;
	return result.data;
}
function createHistoryService(dependencies) {
	return {
		async getHistory(userId) {
			const sites = await dependencies.sites.listByUserId(userId);
			const siteById = new Map(sites.map((site) => [site.id, site]));
			return { entries: (await dependencies.analyses.listBySiteIds(sites.map((site) => site.id))).flatMap((analysis) => {
				const site = siteById.get(analysis.site_id);
				return site ? [{
					analysis,
					site: {
						id: site.id,
						url: site.url,
						domain: site.domain
					}
				}] : [];
			}) };
		},
		async deleteAnalysis(userId, analysisId) {
			const analysis = await dependencies.analyses.findById(analysisId);
			if (!analysis) return false;
			const site = await dependencies.sites.findById(analysis.site_id);
			if (!site || site.user_id !== userId) return false;
			await dependencies.analyses.delete(analysisId);
			return true;
		}
	};
}
function createReportService(dependencies) {
	return { async getReport(userId, analysisId) {
		const analysis = await dependencies.analyses.findById(analysisId);
		if (!analysis) return null;
		const site = await dependencies.sites.findById(analysis.site_id);
		if (!site || site.user_id !== userId) return null;
		const [issues, recommendations] = await Promise.all([dependencies.issues.listByAnalysisId(analysis.id), dependencies.recommendations.listByAnalysisId(analysis.id)]);
		return {
			analysis,
			site,
			issues,
			recommendations
		};
	} };
}
function createServerServices(client) {
	const analyses = createSupabaseAnalysisRepository(client);
	const sites = createSupabaseSiteRepository(client);
	const issues = createSupabaseIssueRepository(client);
	const recommendations = createSupabaseRecommendationRepository(client);
	const report = createReportService({
		analyses,
		sites,
		issues,
		recommendations
	});
	return {
		history: createHistoryService({
			sites,
			analyses
		}),
		report,
		analysisRunner: createAnalysisRunService({
			analyses,
			sites,
			issues,
			recommendations
		}),
		summary: createAiSummaryService({
			analyses,
			sites,
			issues,
			recommendations,
			report
		}),
		fix: createFixService({
			issues,
			report,
			client
		})
	};
}
async function withValidatedJson(request, schema, handler) {
	const body = await request.json().catch(() => void 0);
	const result = schema.safeParse(body);
	if (!result.success) return validationErrorResponse(result.error);
	return handler(result.data);
}
function withValidatedParams(params, schema) {
	const result = schema.safeParse(params);
	return result.success ? result.data : validationErrorResponse(result.error);
}
var Route$6 = createFileRoute("/api/summary")({ server: { handlers: { POST: ({ request }) => withValidatedJson(request, summaryRequestSchema, async (input) => {
	const authenticated = await requireUser(request);
	if (authenticated instanceof Response) return authenticated;
	try {
		const summary = await createServerServices(authenticated.client).summary.generate(authenticated.user.id, input.analysisId);
		return summary ? jsonResponse(summaryResponseSchema, {
			analysisId: input.analysisId,
			summary
		}) : notFoundResponse();
	} catch (error) {
		return databaseErrorResponse(error);
	}
}) } } });
var historyEntrySchema = objectType({
	analysis: analysisSchema,
	site: objectType({
		id: stringType().uuid(),
		url: stringType().url(),
		domain: stringType()
	})
});
objectType({ limit: coerce.number().int().min(1).max(100).default(20) });
var historyResponseSchema = objectType({ entries: arrayType(historyEntrySchema) });
var deleteHistoryParamsSchema = objectType({ id: analysisIdSchema });
var Route$5 = createFileRoute("/api/history")({ server: { handlers: { GET: async ({ request }) => {
	const authenticated = await requireUser(request);
	if (authenticated instanceof Response) return authenticated;
	try {
		return jsonResponse(historyResponseSchema, await createServerServices(authenticated.client).history.getHistory(authenticated.user.id));
	} catch (error) {
		return databaseErrorResponse(error);
	}
} } } });
var issueIdSchema = stringType().uuid();
enumType([
	"critical",
	"high",
	"medium",
	"low",
	"info"
]);
var fixRequestSchema = objectType({ issueId: issueIdSchema });
var fixResponseSchema = aiFixResponseSchema;
var Route$4 = createFileRoute("/api/fix")({ server: { handlers: { POST: ({ request }) => withValidatedJson(request, fixRequestSchema, async (input) => {
	const authenticated = await requireUser(request);
	if (authenticated instanceof Response) return authenticated;
	try {
		const result = await createServerServices(authenticated.client).fix.requestFix(authenticated.user.id, input);
		return result ? jsonResponse(fixResponseSchema, result) : notFoundResponse();
	} catch (error) {
		if (error instanceof UsageLimitError) return usageLimitResponse(error.message);
		return databaseErrorResponse(error);
	}
}) } } });
var Route$3 = createFileRoute("/api/analyze")({ server: { handlers: { POST: ({ request }) => withValidatedJson(request, analyzeRequestSchema, async (input) => {
	const authenticated = await requireUser(request);
	if (authenticated instanceof Response) return authenticated;
	try {
		const services = createServerServices(authenticated.client);
		const result = await services.analysisRunner.run(authenticated.user.id, input);
		await services.summary.generate(authenticated.user.id, result.analysisId);
		return jsonResponse(analyzeResponseSchema, result, 201);
	} catch (error) {
		if (error instanceof UsageLimitError) return usageLimitResponse(error.message);
		console.error("[api/analyze] request failed", error);
		return isDatabaseError(error) ? databaseErrorResponse(error) : analysisErrorResponse(error);
	}
}) } } });
function isDatabaseError(error) {
	if (typeof error !== "object" || error === null || !("code" in error)) return false;
	const code = error.code;
	return typeof code === "string" && (/^PGRST\d+$/i.test(code) || /^[0-9A-Z]{5}$/.test(code));
}
var Route$2 = createFileRoute("/api/summary/$analysisId")({ server: { handlers: { GET: ({ request, params }) => {
	const validated = withValidatedParams(params, summaryParamsSchema);
	if (validated instanceof Response) return validated;
	return getSummary(request, validated.analysisId);
} } } });
async function getSummary(request, analysisId) {
	const authenticated = await requireUser(request);
	if (authenticated instanceof Response) return authenticated;
	try {
		const summary = await createServerServices(authenticated.client).summary.getCached(authenticated.user.id, analysisId);
		return summary ? jsonResponse(summaryResponseSchema, {
			analysisId,
			summary
		}) : new Response(null, { status: 204 });
	} catch (error) {
		return databaseErrorResponse(error);
	}
}
var Route$1 = createFileRoute("/api/report/$id")({ server: { handlers: { GET: async ({ params, request }) => {
	const parsedParams = withValidatedParams(params, reportParamsSchema);
	if (parsedParams instanceof Response) return parsedParams;
	const authenticated = await requireUser(request);
	if (authenticated instanceof Response) return authenticated;
	try {
		const payload = await createServerServices(authenticated.client).report.getReport(authenticated.user.id, parsedParams.id);
		return payload ? jsonResponse(reportResponseSchema, payload) : notFoundResponse();
	} catch (error) {
		return databaseErrorResponse(error);
	}
} } } });
var Route = createFileRoute("/api/history/$id")({ server: { handlers: { DELETE: async ({ params, request }) => {
	const parsedParams = withValidatedParams(params, deleteHistoryParamsSchema);
	if (parsedParams instanceof Response) return parsedParams;
	const authenticated = await requireUser(request);
	if (authenticated instanceof Response) return authenticated;
	try {
		return await createServerServices(authenticated.client).history.deleteAnalysis(authenticated.user.id, parsedParams.id) ? new Response(null, { status: 204 }) : notFoundResponse();
	} catch (error) {
		return databaseErrorResponse(error);
	}
} } } });
var SignUpRoute = Route$18.update({
	id: "/sign-up",
	path: "/sign-up",
	getParentRoute: () => Route$19
});
var SettingsRoute = Route$17.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$19
});
var ResetPasswordRoute = Route$16.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$19
});
var RecommendationsRoute = Route$15.update({
	id: "/recommendations",
	path: "/recommendations",
	getParentRoute: () => Route$19
});
var ProfileRoute = Route$14.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$19
});
var LoginRoute = Route$13.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$19
});
var HistoryRoute = Route$12.update({
	id: "/history",
	path: "/history",
	getParentRoute: () => Route$19
});
var FixesRoute = Route$11.update({
	id: "/fixes",
	path: "/fixes",
	getParentRoute: () => Route$19
});
var CheckEmailRoute = Route$10.update({
	id: "/check-email",
	path: "/check-email",
	getParentRoute: () => Route$19
});
var AnalyzeRoute = Route$9.update({
	id: "/analyze",
	path: "/analyze",
	getParentRoute: () => Route$19
});
var IndexRoute = Route$8.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$19
});
var ReportsIndexRoute = Route$7.update({
	id: "/reports/",
	path: "/reports/",
	getParentRoute: () => Route$19
});
var ReportsIdRoute = Route$21.update({
	id: "/reports/$id",
	path: "/reports/$id",
	getParentRoute: () => Route$19
});
var IssuesIdRoute = Route$20.update({
	id: "/issues/$id",
	path: "/issues/$id",
	getParentRoute: () => Route$19
});
var ApiSummaryRoute = Route$6.update({
	id: "/api/summary",
	path: "/api/summary",
	getParentRoute: () => Route$19
});
var ApiHistoryRoute = Route$5.update({
	id: "/api/history",
	path: "/api/history",
	getParentRoute: () => Route$19
});
var ApiFixRoute = Route$4.update({
	id: "/api/fix",
	path: "/api/fix",
	getParentRoute: () => Route$19
});
var ApiAnalyzeRoute = Route$3.update({
	id: "/api/analyze",
	path: "/api/analyze",
	getParentRoute: () => Route$19
});
var ApiSummaryAnalysisIdRoute = Route$2.update({
	id: "/$analysisId",
	path: "/$analysisId",
	getParentRoute: () => ApiSummaryRoute
});
var ApiReportIdRoute = Route$1.update({
	id: "/api/report/$id",
	path: "/api/report/$id",
	getParentRoute: () => Route$19
});
var ApiHistoryRouteChildren = { ApiHistoryIdRoute: Route.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ApiHistoryRoute
}) };
var ApiHistoryRouteWithChildren = ApiHistoryRoute._addFileChildren(ApiHistoryRouteChildren);
var ApiSummaryRouteChildren = { ApiSummaryAnalysisIdRoute };
var rootRouteChildren = {
	IndexRoute,
	AnalyzeRoute,
	CheckEmailRoute,
	FixesRoute,
	HistoryRoute,
	LoginRoute,
	ProfileRoute,
	RecommendationsRoute,
	ResetPasswordRoute,
	SettingsRoute,
	SignUpRoute,
	ApiAnalyzeRoute,
	ApiFixRoute,
	ApiHistoryRoute: ApiHistoryRouteWithChildren,
	ApiSummaryRoute: ApiSummaryRoute._addFileChildren(ApiSummaryRouteChildren),
	IssuesIdRoute,
	ReportsIdRoute,
	ReportsIndexRoute,
	ApiReportIdRoute
};
var routeTree = Route$19._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
