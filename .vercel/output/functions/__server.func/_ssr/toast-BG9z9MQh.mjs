import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/toast-BG9z9MQh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var ToastContext = (0, import_react.createContext)(null);
function useToast() {
	const context = (0, import_react.useContext)(ToastContext);
	if (!context) throw new Error("useToast must be used inside ToastProvider");
	return context;
}
//#endregion
export { useToast as n, ToastContext as t };
