import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useToast } from "./toast-BG9z9MQh.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { r as getCurrentProfile, u as updateCurrentProfile } from "./auth-client-DOg5UVO1.mjs";
import { v as Mail } from "../_libs/lucide-react.mjs";
import { n as PageHeader, t as AppShell } from "./app-shell-DHI1LrQv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-Crc4pY9L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [fullName, setFullName] = (0, import_react.useState)("");
	const { notify } = useToast();
	(0, import_react.useEffect)(() => {
		getCurrentProfile().then((nextProfile) => {
			setProfile(nextProfile);
			setFullName(nextProfile?.fullName ?? "");
		}).catch(() => void 0);
	}, []);
	const save = async () => {
		try {
			setProfile(await updateCurrentProfile({ fullName }));
			notify("Profile updated successfully.", "success");
		} catch (error) {
			notify(error instanceof Error ? error.message : "Unable to update profile.", "error");
		}
	};
	const displayName = profile?.fullName || profile?.email?.split("@")[0] || "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10 animate-in-up",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Account",
				title: "Your profile",
				description: "Manage the information associated with your account."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 card-surface p-6 sm:p-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-6 sm:flex-row sm:items-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative",
						children: profile?.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: profile.avatarUrl,
							alt: "",
							className: "h-24 w-24 rounded-3xl object-cover shadow-elevated"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-primary to-accent text-2xl font-semibold text-primary-foreground shadow-elevated",
							children: displayName.slice(0, 2).toUpperCase()
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-heading text-2xl font-semibold",
							children: displayName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5" }),
									" ",
									profile?.email ?? ""
								]
							})
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 card-surface p-6 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-heading text-sm font-semibold",
						children: "Personal information"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid gap-5 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Full name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: fullName,
								onChange: (event) => setFullName(event.target.value),
								className: "mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: profile?.email ?? "",
								disabled: true,
								className: "mt-1.5 h-10 w-full rounded-xl border border-border bg-muted px-3 text-sm text-muted-foreground"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setFullName(profile?.fullName ?? ""),
							className: "rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-surface",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: save,
							className: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover",
							children: "Save changes"
						})]
					})
				]
			})
		]
	}) });
}
//#endregion
export { ProfilePage as component };
