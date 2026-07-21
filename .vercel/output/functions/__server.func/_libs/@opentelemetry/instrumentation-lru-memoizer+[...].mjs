import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./instrumentation+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-lru-memoizer/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.44.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-lru-memoizer";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-lru-memoizer/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LruMemoizerInstrumentation = void 0;
	var api_1 = require_src$1();
	var instrumentation_1 = (init_esm(), __toCommonJS(esm_exports));
	/** @knipignore */
	var version_1 = require_version();
	var LruMemoizerInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			return [new instrumentation_1.InstrumentationNodeModuleDefinition("lru-memoizer", [">=1.3 <3"], (moduleExports) => {
				const asyncMemoizer = function() {
					const origMemoizer = moduleExports.apply(this, arguments);
					return function() {
						const modifiedArguments = [...arguments];
						const origCallback = modifiedArguments.pop();
						const callbackWithContext = typeof origCallback === "function" ? api_1.context.bind(api_1.context.active(), origCallback) : origCallback;
						modifiedArguments.push(callbackWithContext);
						return origMemoizer.apply(this, modifiedArguments);
					};
				};
				asyncMemoizer.sync = moduleExports.sync;
				return asyncMemoizer;
			}, void 0)];
		}
	};
	exports.LruMemoizerInstrumentation = LruMemoizerInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-lru-memoizer/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_instrumentation(), exports);
}));
//#endregion
export { require_src as t };
