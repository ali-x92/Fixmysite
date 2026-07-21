import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./instrumentation+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-generic-pool/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.43.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-generic-pool";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-generic-pool/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GenericPoolInstrumentation = void 0;
	var api = require_src$1();
	var instrumentation_1 = (init_esm(), __toCommonJS(esm_exports));
	/** @knipignore */
	var version_1 = require_version();
	var MODULE_NAME = "generic-pool";
	var GenericPoolInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
			this._isDisabled = false;
		}
		init() {
			return [
				new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=3.0.0 <4"], (moduleExports) => {
					const Pool = moduleExports.Pool;
					if ((0, instrumentation_1.isWrapped)(Pool.prototype.acquire)) this._unwrap(Pool.prototype, "acquire");
					this._wrap(Pool.prototype, "acquire", this._acquirePatcher.bind(this));
					return moduleExports;
				}, (moduleExports) => {
					const Pool = moduleExports.Pool;
					this._unwrap(Pool.prototype, "acquire");
					return moduleExports;
				}),
				new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=2.4.0 <3"], (moduleExports) => {
					const Pool = moduleExports.Pool;
					if ((0, instrumentation_1.isWrapped)(Pool.prototype.acquire)) this._unwrap(Pool.prototype, "acquire");
					this._wrap(Pool.prototype, "acquire", this._acquireWithCallbacksPatcher.bind(this));
					return moduleExports;
				}, (moduleExports) => {
					const Pool = moduleExports.Pool;
					this._unwrap(Pool.prototype, "acquire");
					return moduleExports;
				}),
				new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [">=2.0.0 <2.4"], (moduleExports) => {
					this._isDisabled = false;
					if ((0, instrumentation_1.isWrapped)(moduleExports.Pool)) this._unwrap(moduleExports, "Pool");
					this._wrap(moduleExports, "Pool", this._poolWrapper.bind(this));
					return moduleExports;
				}, (moduleExports) => {
					this._isDisabled = true;
					return moduleExports;
				})
			];
		}
		_acquirePatcher(original) {
			const instrumentation = this;
			return function wrapped_acquire(...args) {
				const parent = api.context.active();
				const span = instrumentation.tracer.startSpan("generic-pool.acquire", {}, parent);
				return api.context.with(api.trace.setSpan(parent, span), () => {
					return original.call(this, ...args).then((value) => {
						span.end();
						return value;
					}, (err) => {
						span.recordException(err);
						span.end();
						throw err;
					});
				});
			};
		}
		_poolWrapper(original) {
			const instrumentation = this;
			return function wrapped_pool() {
				const pool = original.apply(this, arguments);
				instrumentation._wrap(pool, "acquire", instrumentation._acquireWithCallbacksPatcher.bind(instrumentation));
				return pool;
			};
		}
		_acquireWithCallbacksPatcher(original) {
			const instrumentation = this;
			return function wrapped_acquire(cb, priority) {
				if (instrumentation._isDisabled) return original.call(this, cb, priority);
				const parent = api.context.active();
				const span = instrumentation.tracer.startSpan("generic-pool.acquire", {}, parent);
				return api.context.with(api.trace.setSpan(parent, span), () => {
					original.call(this, (err, client) => {
						span.end();
						if (cb) return cb(err, client);
					}, priority);
				});
			};
		}
	};
	exports.GenericPoolInstrumentation = GenericPoolInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-generic-pool/build/src/index.js
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
