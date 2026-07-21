import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { c as signOut, i as getSupabaseBrowserClient, n as cn, t as BrandMark } from "./auth-client-DOg5UVO1.mjs";
import { _ as useNavigate, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as FileText, C as LayoutGrid, E as History, F as Command, G as Bell, H as ChevronRight, R as Circle, U as ChevronDown, W as Check, a as User, d as Sparkles, h as Search, j as FileChartColumn, m as Settings, n as X, r as Wrench, y as LogOut } from "../_libs/lucide-react.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-DHI1LrQv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
function useAuthSession() {
	const [session, setSession] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		let unsubscribe = () => {};
		try {
			const client = getSupabaseBrowserClient();
			client.auth.getSession().then(({ data }) => {
				if (active) {
					setSession(data.session);
					setReady(true);
				}
			});
			({data: {subscription: {unsubscribe}}} = client.auth.onAuthStateChange((_event, nextSession) => {
				if (active) {
					setSession(nextSession);
					setReady(true);
				}
			}));
		} catch {
			if (active) setReady(true);
		}
		return () => {
			active = false;
			unsubscribe();
		};
	}, []);
	return {
		session,
		ready
	};
}
async function authenticatedFetch(path, init) {
	const { data } = await getSupabaseBrowserClient().auth.getSession();
	if (!data.session) throw new Error("Please sign in to continue.");
	return fetch(path, {
		...init,
		headers: {
			...init?.headers,
			authorization: `Bearer ${data.session.access_token}`
		}
	});
}
async function readJson(response) {
	const payload = await response.json().catch(() => null);
	if (!response.ok) {
		const message = payload && typeof payload === "object" && "message" in payload ? payload.message : null;
		throw new Error(message ?? "The request could not be completed.");
	}
	return payload;
}
async function getHistory() {
	return readJson(await authenticatedFetch("/api/history"));
}
async function deleteAnalysis(id) {
	if (!(await authenticatedFetch(`/api/history/${id}`, { method: "DELETE" })).ok) throw new Error("Unable to delete this report.");
}
async function getReport(id) {
	return readJson(await authenticatedFetch(`/api/report/${id}`));
}
async function getSummary(analysisId) {
	const response = await authenticatedFetch(`/api/summary/${analysisId}`);
	if (response.status === 204) return null;
	return (await readJson(response)).summary;
}
async function generateFix(issueId) {
	return readJson(await authenticatedFetch("/api/fix", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ issueId })
	}));
}
var nav = [
	{
		label: "Dashboard",
		to: "/",
		icon: LayoutGrid,
		exact: true
	},
	{
		label: "Analyze",
		to: "/analyze",
		icon: Sparkles
	},
	{
		label: "Reports",
		to: "/reports",
		icon: FileChartColumn
	},
	{
		label: "AI Fixes",
		to: "/fixes",
		icon: Wrench
	},
	{
		label: "History",
		to: "/history",
		icon: History
	},
	{
		label: "Settings",
		to: "/settings",
		icon: Settings
	}
];
var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
var DUR = "360ms";
var SIDEBAR_EXPANDED = 220;
var SIDEBAR_COLLAPSED = 64;
function Logo({ collapsed, onToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onToggle,
		"aria-label": collapsed ? "Expand sidebar" : "Collapse sidebar",
		className: "flex h-11 w-full items-center gap-2.5 rounded-xl px-1.5 transition-colors hover:bg-surface overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { size: 36 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 text-left whitespace-nowrap",
			style: {
				opacity: collapsed ? 0 : 1,
				transform: collapsed ? "translateX(-8px)" : "translateX(0)",
				transition: `opacity ${collapsed ? "140ms" : "260ms"} ease ${collapsed ? "0ms" : "120ms"}, transform ${DUR} ${EASE}`,
				pointerEvents: collapsed ? "none" : "auto"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-heading text-[14px] font-semibold leading-tight",
				children: "FixMySite AI"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10.5px] font-medium text-muted-foreground leading-tight",
				children: "AI Audit Platform"
			})]
		})]
	});
}
function SidebarNav({ collapsed, setCollapsed }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hidden md:flex md:shrink-0 flex-col border-r border-border bg-background overflow-hidden",
		style: {
			width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
			transition: `width ${DUR} ${EASE}`,
			willChange: "width"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-16 flex items-center border-b border-border px-2.5 shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
				collapsed,
				onToggle: () => setCollapsed(!collapsed)
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "flex-1 space-y-1 overflow-y-auto no-scrollbar p-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-2 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground overflow-hidden whitespace-nowrap",
				style: {
					height: collapsed ? 0 : 20,
					opacity: collapsed ? 0 : 1,
					transition: `opacity ${collapsed ? "120ms" : "240ms"} ease ${collapsed ? "0ms" : "120ms"}, height ${DUR} ${EASE}`
				},
				children: "Workspace"
			}), nav.map((item) => {
				const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
				const Icon = item.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					title: item.label,
					onClick: () => {
						if (collapsed) setCollapsed(false);
					},
					className: cn("group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px] font-medium overflow-hidden", "transition-colors duration-200", active ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"),
					children: [
						active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("h-[17px] w-[17px] shrink-0 transition-colors duration-200", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate whitespace-nowrap flex-1",
							style: {
								opacity: collapsed ? 0 : 1,
								transform: collapsed ? "translateX(-6px)" : "translateX(0)",
								transition: `opacity ${collapsed ? "120ms" : "260ms"} ease ${collapsed ? "0ms" : "140ms"}, transform ${DUR} ${EASE}`
							},
							children: item.label
						}),
						item.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary whitespace-nowrap",
							style: {
								opacity: collapsed ? 0 : 1,
								transition: `opacity ${collapsed ? "100ms" : "260ms"} ease ${collapsed ? "0ms" : "160ms"}`
							},
							children: item.badge
						})
					]
				}, item.to);
			})]
		})]
	});
}
function Topbar({ onOpenSearch, onOpenNotifications, email }) {
	const navigate = useNavigate();
	const logout = async () => {
		try {
			await signOut();
		} catch {}
		navigate({ to: "/login" });
	};
	const displayName = email?.split("@")[0] ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full items-center gap-3 px-4 md:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onOpenSearch,
				className: "relative flex-1 max-w-lg text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex h-10 w-full items-center rounded-xl border border-border bg-surface pl-9 pr-14 text-sm text-muted-foreground transition-shadow hover:border-primary/30 hover:bg-card hover:shadow-soft",
						children: "Search reports, issues, URLs..."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("kbd", {
						className: "pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, { className: "h-3 w-3" }), "K"]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onOpenNotifications,
					"aria-label": "Open notifications",
					className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-surface hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuTrigger, {
					className: "flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground",
						children: displayName.slice(0, 2).toUpperCase()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "hidden h-3.5 w-3.5 text-muted-foreground sm:block" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					className: "w-56 rounded-xl border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
							className: "font-normal",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold text-heading",
								children: displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: email ?? ""
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/profile",
								className: "cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "mr-2 h-4 w-4" }), "Profile"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/settings",
								className: "cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "mr-2 h-4 w-4" }), "Settings"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: logout,
							className: "text-danger focus:text-danger",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 h-4 w-4" }), "Log out"]
						})
					]
				})] })]
			})]
		})
	});
}
function SidePanel({ open, onClose, title, children }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-200",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "absolute right-0 top-0 h-full w-full max-w-md border-l border-border bg-background shadow-pop animate-slide-in-right flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-16 items-center justify-between border-b border-border px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-heading text-base font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto no-scrollbar",
				children
			})]
		})]
	});
}
function SearchPanel({ open, onClose }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setLoading(true);
		getHistory().then(({ entries: nextEntries }) => setEntries(nextEntries)).catch(() => setEntries([])).finally(() => setLoading(false));
	}, [open]);
	const normalizedQuery = q.trim().toLowerCase();
	const matchingEntries = entries.filter(({ site }) => `${site.domain} ${site.url}`.toLowerCase().includes(normalizedQuery));
	const quickActions = [
		{
			label: "New scan",
			to: "/analyze"
		},
		{
			label: "View reports",
			to: "/reports"
		},
		{
			label: "AI fixes",
			to: "/fixes"
		}
	];
	const openRoute = (to) => {
		onClose();
		navigate({ to });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidePanel, {
		open,
		onClose,
		title: "Search",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search reports and website URLs...",
						className: "h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary/30 focus:bg-card focus:shadow-soft focus:ring-4 focus:ring-primary/10"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
						children: q ? "Matching reports" : "Recent reports"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [
							matchingEntries.slice(0, 8).map(({ analysis, site }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									onClose();
									navigate({
										to: "/reports/$id",
										params: { id: analysis.id }
									});
								},
								className: "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary/5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-sm font-medium text-heading",
										children: site.domain
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "truncate text-xs text-muted-foreground",
										children: [
											"Report · ",
											analysis.status,
											" ·",
											" ",
											new Date(analysis.created_at).toLocaleDateString()
										]
									})]
								})]
							}, analysis.id)),
							!loading && matchingEntries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-surface px-3 py-4 text-sm text-muted-foreground",
								children: q ? "No saved reports match that search." : "No saved reports yet."
							}),
							loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-4 text-sm text-muted-foreground",
								children: "Loading reports..."
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Quick actions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: quickActions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => openRoute(action.to),
							className: "group rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-heading transition-all hover:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:shadow-soft hover:-translate-y-0.5",
							children: action.label
						}, action.to))
					})]
				})
			]
		})
	});
}
function NotificationsPanel({ open, onClose }) {
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setLoading(true);
		getHistory().then(({ entries: nextEntries }) => setEntries(nextEntries.slice(0, 6))).catch(() => setEntries([])).finally(() => setLoading(false));
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidePanel, {
		open,
		onClose,
		title: "Notifications",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5",
			children: [
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Loading notifications..."
				}),
				!loading && entries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "mx-auto h-5 w-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-sm font-semibold text-heading",
							children: "You are all caught up"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Completed analyses will appear here."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: entries.map(({ analysis, site }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onClose();
							navigate({
								to: "/reports/$id",
								params: { id: analysis.id }
							});
						},
						className: "flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileChartColumn, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block truncate text-sm font-semibold text-heading",
								children: ["Analysis ", analysis.status]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block truncate text-xs text-muted-foreground",
								children: [
									site.domain,
									" · ",
									new Date(analysis.created_at).toLocaleDateString()
								]
							})]
						})]
					}, analysis.id))
				})
			]
		})
	});
}
function AppShell({ children }) {
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const [notificationsOpen, setNotificationsOpen] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const { session, ready } = useAuthSession();
	(0, import_react.useEffect)(() => {
		if (ready && !session) navigate({ to: "/login" });
	}, [
		navigate,
		ready,
		session
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setSearchOpen((v) => !v);
			}
			if (e.key === "Escape") setSearchOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	if (!ready || !session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-screen bg-background" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarNav, {
				collapsed,
				setCollapsed
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Topbar, {
					onOpenSearch: () => setSearchOpen(true),
					onOpenNotifications: () => setNotificationsOpen(true),
					email: session.user.email
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchPanel, {
				open: searchOpen,
				onClose: () => setSearchOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPanel, {
				open: notificationsOpen,
				onClose: () => setNotificationsOpen(false)
			})
		]
	});
}
function PageHeader({ eyebrow, title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-1 rounded-full bg-primary" }), eyebrow]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-heading mt-3 text-3xl font-semibold leading-[1.1] sm:text-[36px]",
					children: title
				}),
				description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground",
					children: description
				})
			]
		}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 items-center gap-2",
			children: actions
		})]
	});
}
//#endregion
export { getHistory as a, generateFix as i, PageHeader as n, getReport as o, deleteAnalysis as r, getSummary as s, AppShell as t };
