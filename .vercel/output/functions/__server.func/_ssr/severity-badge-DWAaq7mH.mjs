import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn } from "./auth-client-DOg5UVO1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/severity-badge-DWAaq7mH.js
var import_jsx_runtime = require_jsx_runtime();
var severityStyles = {
	critical: "bg-danger/10 text-danger ring-1 ring-inset ring-danger/20",
	high: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/20",
	medium: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/20",
	low: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
	info: "bg-muted text-muted-foreground ring-1 ring-inset ring-border"
};
function SeverityBadge({ severity, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", severityStyles[severity], className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-current opacity-80" }), severity]
	});
}
//#endregion
export { SeverityBadge as t };
