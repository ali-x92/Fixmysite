import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./core+[...].mjs";
import { n as init_esm$1, t as esm_exports$1 } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-koa/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.KoaLayerType = void 0;
	(function(KoaLayerType) {
		KoaLayerType["ROUTER"] = "router";
		KoaLayerType["MIDDLEWARE"] = "middleware";
	})(exports.KoaLayerType || (exports.KoaLayerType = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-koa/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.47.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-koa";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-koa/build/src/enums/AttributeNames.js
var require_AttributeNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AttributeNames = void 0;
	(function(AttributeNames) {
		AttributeNames["KOA_TYPE"] = "koa.type";
		AttributeNames["KOA_NAME"] = "koa.name";
	})(exports.AttributeNames || (exports.AttributeNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-koa/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isLayerIgnored = exports.getMiddlewareMetadata = void 0;
	var types_1 = require_types();
	var AttributeNames_1 = require_AttributeNames();
	var semantic_conventions_1 = require_src$2();
	var getMiddlewareMetadata = (context, layer, isRouter, layerPath) => {
		var _a;
		if (isRouter) return {
			attributes: {
				[AttributeNames_1.AttributeNames.KOA_NAME]: layerPath === null || layerPath === void 0 ? void 0 : layerPath.toString(),
				[AttributeNames_1.AttributeNames.KOA_TYPE]: types_1.KoaLayerType.ROUTER,
				[semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: layerPath === null || layerPath === void 0 ? void 0 : layerPath.toString()
			},
			name: context._matchedRouteName || `router - ${layerPath}`
		};
		else return {
			attributes: {
				[AttributeNames_1.AttributeNames.KOA_NAME]: (_a = layer.name) !== null && _a !== void 0 ? _a : "middleware",
				[AttributeNames_1.AttributeNames.KOA_TYPE]: types_1.KoaLayerType.MIDDLEWARE
			},
			name: `middleware - ${layer.name}`
		};
	};
	exports.getMiddlewareMetadata = getMiddlewareMetadata;
	/**
	* Check whether the given request is ignored by configuration
	* @param [list] List of ignore patterns
	* @param [onException] callback for doing something when an exception has
	*     occurred
	*/
	var isLayerIgnored = (type, config) => {
		var _a;
		return !!(Array.isArray(config === null || config === void 0 ? void 0 : config.ignoreLayersType) && ((_a = config === null || config === void 0 ? void 0 : config.ignoreLayersType) === null || _a === void 0 ? void 0 : _a.includes(type)));
	};
	exports.isLayerIgnored = isLayerIgnored;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-koa/build/src/internal-types.js
var require_internal_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.kLayerPatched = void 0;
	/**
	* This symbol is used to mark a Koa layer as being already instrumented
	* since its possible to use a given layer multiple times (ex: middlewares)
	*/
	exports.kLayerPatched = Symbol("koa-layer-patched");
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-koa/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.KoaInstrumentation = void 0;
	var api = require_src$1();
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	var types_1 = require_types();
	/** @knipignore */
	var version_1 = require_version();
	var utils_1 = require_utils();
	var core_1 = (init_esm(), __toCommonJS(esm_exports));
	var internal_types_1 = require_internal_types();
	/** Koa instrumentation for OpenTelemetry */
	var KoaInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			return new instrumentation_1.InstrumentationNodeModuleDefinition("koa", [">=2.0.0 <3"], (module$1) => {
				const moduleExports = module$1[Symbol.toStringTag] === "Module" ? module$1.default : module$1;
				if (moduleExports == null) return moduleExports;
				if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.use)) this._unwrap(moduleExports.prototype, "use");
				this._wrap(moduleExports.prototype, "use", this._getKoaUsePatch.bind(this));
				return module$1;
			}, (module$2) => {
				const moduleExports = module$2[Symbol.toStringTag] === "Module" ? module$2.default : module$2;
				if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.use)) this._unwrap(moduleExports.prototype, "use");
			});
		}
		/**
		* Patches the Koa.use function in order to instrument each original
		* middleware layer which is introduced
		* @param {KoaMiddleware} middleware - the original middleware function
		*/
		_getKoaUsePatch(original) {
			const plugin = this;
			return function use(middlewareFunction) {
				let patchedFunction;
				if (middlewareFunction.router) patchedFunction = plugin._patchRouterDispatch(middlewareFunction);
				else patchedFunction = plugin._patchLayer(middlewareFunction, false);
				return original.apply(this, [patchedFunction]);
			};
		}
		/**
		* Patches the dispatch function used by @koa/router. This function
		* goes through each routed middleware and adds instrumentation via a call
		* to the @function _patchLayer function.
		* @param {KoaMiddleware} dispatchLayer - the original dispatch function which dispatches
		* routed middleware
		*/
		_patchRouterDispatch(dispatchLayer) {
			var _a;
			api.diag.debug("Patching @koa/router dispatch");
			const router = dispatchLayer.router;
			const routesStack = (_a = router === null || router === void 0 ? void 0 : router.stack) !== null && _a !== void 0 ? _a : [];
			for (const pathLayer of routesStack) {
				const path = pathLayer.path;
				const pathStack = pathLayer.stack;
				for (let j = 0; j < pathStack.length; j++) {
					const routedMiddleware = pathStack[j];
					pathStack[j] = this._patchLayer(routedMiddleware, true, path);
				}
			}
			return dispatchLayer;
		}
		/**
		* Patches each individual @param middlewareLayer function in order to create the
		* span and propagate context. It does not create spans when there is no parent span.
		* @param {KoaMiddleware} middlewareLayer - the original middleware function.
		* @param {boolean} isRouter - tracks whether the original middleware function
		* was dispatched by the router originally
		* @param {string?} layerPath - if present, provides additional data from the
		* router about the routed path which the middleware is attached to
		*/
		_patchLayer(middlewareLayer, isRouter, layerPath) {
			const layerType = isRouter ? types_1.KoaLayerType.ROUTER : types_1.KoaLayerType.MIDDLEWARE;
			if (middlewareLayer[internal_types_1.kLayerPatched] === true || (0, utils_1.isLayerIgnored)(layerType, this.getConfig())) return middlewareLayer;
			if (middlewareLayer.constructor.name === "GeneratorFunction" || middlewareLayer.constructor.name === "AsyncGeneratorFunction") {
				api.diag.debug("ignoring generator-based Koa middleware layer");
				return middlewareLayer;
			}
			middlewareLayer[internal_types_1.kLayerPatched] = true;
			api.diag.debug("patching Koa middleware layer");
			return async (context, next) => {
				if (api.trace.getSpan(api.context.active()) === void 0) return middlewareLayer(context, next);
				const metadata = (0, utils_1.getMiddlewareMetadata)(context, middlewareLayer, isRouter, layerPath);
				const span = this.tracer.startSpan(metadata.name, { attributes: metadata.attributes });
				const rpcMetadata = (0, core_1.getRPCMetadata)(api.context.active());
				if ((rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP && context._matchedRoute) rpcMetadata.route = context._matchedRoute.toString();
				const { requestHook } = this.getConfig();
				if (requestHook) (0, instrumentation_1.safeExecuteInTheMiddle)(() => requestHook(span, {
					context,
					middlewareLayer,
					layerType
				}), (e) => {
					if (e) api.diag.error("koa instrumentation: request hook failed", e);
				}, true);
				const newContext = api.trace.setSpan(api.context.active(), span);
				return api.context.with(newContext, async () => {
					try {
						return await middlewareLayer(context, next);
					} catch (err) {
						span.recordException(err);
						throw err;
					} finally {
						span.end();
					}
				});
			};
		}
	};
	exports.KoaInstrumentation = KoaInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-koa/build/src/index.js
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
	__exportStar(require_types(), exports);
	__exportStar(require_AttributeNames(), exports);
}));
//#endregion
export { require_src as t };
