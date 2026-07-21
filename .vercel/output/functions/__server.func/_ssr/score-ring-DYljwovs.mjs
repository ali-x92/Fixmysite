import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as cn } from "./auth-client-DOg5UVO1.mjs";
import { _ as Minus, c as TrendingUp, l as TrendingDown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/score-ring-DYljwovs.js
var import_jsx_runtime = require_jsx_runtime();
function ScoreRing({ value, size = 200, stroke = 14, label = "Health score", status, trend }) {
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const offset = c - value / 100 * c;
	const tone = value >= 85 ? "text-primary" : value >= 70 ? "text-warning" : "text-danger";
	const autoStatus = status ?? (value >= 85 ? "Excellent" : value >= 70 ? "Good" : "Needs work");
	const TrendIcon = trend === void 0 ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative grid place-items-center",
		style: {
			width: size,
			height: size
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			className: "-rotate-90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				stroke: "var(--color-border)",
				strokeWidth: stroke,
				fill: "none"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				stroke: "currentColor",
				strokeWidth: stroke,
				strokeLinecap: "round",
				fill: "none",
				strokeDasharray: c,
				strokeDashoffset: offset,
				className: cn("transition-[stroke-dashoffset] duration-1000 ease-out", tone),
				style: { animation: "ring-progress 1.2s ease-out" }
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 grid place-items-center text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-heading mt-1 text-[56px] font-semibold leading-none tabular-nums",
					children: value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 inline-flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("inline-flex h-1.5 w-1.5 rounded-full", tone.replace("text-", "bg-")) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-foreground",
							children: autoStatus
						}),
						TrendIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("ml-1 inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums", trend > 0 ? "text-primary" : trend < 0 ? "text-danger" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendIcon, { className: "h-3 w-3" }), trend > 0 ? `+${trend}` : trend]
						})
					]
				})
			] })
		})]
	});
}
//#endregion
export { ScoreRing as t };
