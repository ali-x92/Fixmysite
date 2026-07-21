import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./core+[...].mjs";
import { n as init_esm$1, t as esm_exports$1 } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-express/build/src/enums/ExpressLayerType.js
var require_ExpressLayerType = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ExpressLayerType = void 0;
	(function(ExpressLayerType) {
		ExpressLayerType["ROUTER"] = "router";
		ExpressLayerType["MIDDLEWARE"] = "middleware";
		ExpressLayerType["REQUEST_HANDLER"] = "request_handler";
	})(exports.ExpressLayerType || (exports.ExpressLayerType = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-express/build/src/enums/AttributeNames.js
var require_AttributeNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AttributeNames = void 0;
	(function(AttributeNames) {
		AttributeNames["EXPRESS_TYPE"] = "express.type";
		AttributeNames["EXPRESS_NAME"] = "express.name";
	})(exports.AttributeNames || (exports.AttributeNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-express/build/src/internal-types.js
var require_internal_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._LAYERS_STORE_PROPERTY = exports.kLayerPatched = void 0;
	/**
	* This symbol is used to mark express layer as being already instrumented
	* since its possible to use a given layer multiple times (ex: middlewares)
	*/
	exports.kLayerPatched = Symbol("express-layer-patched");
	/**
	* This const define where on the `request` object the Instrumentation will mount the
	* current stack of express layer.
	*
	* It is necessary because express doesn't store the different layers
	* (ie: middleware, router etc) that it called to get to the current layer.
	* Given that, the only way to know the route of a given layer is to
	* store the path of where each previous layer has been mounted.
	*
	* ex: bodyParser > auth middleware > /users router > get /:id
	*  in this case the stack would be: ["/users", "/:id"]
	*
	* ex2: bodyParser > /api router > /v1 router > /users router > get /:id
	*  stack: ["/api", "/v1", "/users", ":id"]
	*
	*/
	exports._LAYERS_STORE_PROPERTY = "__ot_middlewares";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-express/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getLayerPath = exports.asErrorAndMessage = exports.isLayerIgnored = exports.getLayerMetadata = exports.getRouterPath = exports.storeLayerPath = void 0;
	var ExpressLayerType_1 = require_ExpressLayerType();
	var AttributeNames_1 = require_AttributeNames();
	var internal_types_1 = require_internal_types();
	/**
	* Store layers path in the request to be able to construct route later
	* @param request The request where
	* @param [value] the value to push into the array
	*/
	var storeLayerPath = (request, value) => {
		if (Array.isArray(request[internal_types_1._LAYERS_STORE_PROPERTY]) === false) Object.defineProperty(request, internal_types_1._LAYERS_STORE_PROPERTY, {
			enumerable: false,
			value: []
		});
		if (value === void 0) return;
		request[internal_types_1._LAYERS_STORE_PROPERTY].push(value);
	};
	exports.storeLayerPath = storeLayerPath;
	/**
	* Recursively search the router path from layer stack
	* @param path The path to reconstruct
	* @param layer The layer to reconstruct from
	* @returns The reconstructed path
	*/
	var getRouterPath = (path, layer) => {
		var _a, _b, _c, _d;
		const stackLayer = (_b = (_a = layer.handle) === null || _a === void 0 ? void 0 : _a.stack) === null || _b === void 0 ? void 0 : _b[0];
		if ((_c = stackLayer === null || stackLayer === void 0 ? void 0 : stackLayer.route) === null || _c === void 0 ? void 0 : _c.path) return `${path}${stackLayer.route.path}`;
		if ((_d = stackLayer === null || stackLayer === void 0 ? void 0 : stackLayer.handle) === null || _d === void 0 ? void 0 : _d.stack) return (0, exports.getRouterPath)(path, stackLayer);
		return path;
	};
	exports.getRouterPath = getRouterPath;
	/**
	* Parse express layer context to retrieve a name and attributes.
	* @param route The route of the layer
	* @param layer Express layer
	* @param [layerPath] if present, the path on which the layer has been mounted
	*/
	var getLayerMetadata = (route, layer, layerPath) => {
		var _a;
		if (layer.name === "router") {
			const maybeRouterPath = (0, exports.getRouterPath)("", layer);
			const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || "/";
			return {
				attributes: {
					[AttributeNames_1.AttributeNames.EXPRESS_NAME]: extractedRouterPath,
					[AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.ROUTER
				},
				name: `router - ${extractedRouterPath}`
			};
		} else if (layer.name === "bound dispatch") return {
			attributes: {
				[AttributeNames_1.AttributeNames.EXPRESS_NAME]: (_a = route || layerPath) !== null && _a !== void 0 ? _a : "request handler",
				[AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.REQUEST_HANDLER
			},
			name: `request handler${layer.path ? ` - ${route || layerPath}` : ""}`
		};
		else return {
			attributes: {
				[AttributeNames_1.AttributeNames.EXPRESS_NAME]: layer.name,
				[AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.MIDDLEWARE
			},
			name: `middleware - ${layer.name}`
		};
	};
	exports.getLayerMetadata = getLayerMetadata;
	/**
	* Check whether the given obj match pattern
	* @param constant e.g URL of request
	* @param obj obj to inspect
	* @param pattern Match pattern
	*/
	var satisfiesPattern = (constant, pattern) => {
		if (typeof pattern === "string") return pattern === constant;
		else if (pattern instanceof RegExp) return pattern.test(constant);
		else if (typeof pattern === "function") return pattern(constant);
		else throw new TypeError("Pattern is in unsupported datatype");
	};
	/**
	* Check whether the given request is ignored by configuration
	* It will not re-throw exceptions from `list` provided by the client
	* @param constant e.g URL of request
	* @param [list] List of ignore patterns
	* @param [onException] callback for doing something when an exception has
	*     occurred
	*/
	var isLayerIgnored = (name, type, config) => {
		var _a;
		if (Array.isArray(config === null || config === void 0 ? void 0 : config.ignoreLayersType) && ((_a = config === null || config === void 0 ? void 0 : config.ignoreLayersType) === null || _a === void 0 ? void 0 : _a.includes(type))) return true;
		if (Array.isArray(config === null || config === void 0 ? void 0 : config.ignoreLayers) === false) return false;
		try {
			for (const pattern of config.ignoreLayers) if (satisfiesPattern(name, pattern)) return true;
		} catch (e) {}
		return false;
	};
	exports.isLayerIgnored = isLayerIgnored;
	/**
	* Converts a user-provided error value into an error and error message pair
	*
	* @param error - User-provided error value
	* @returns Both an Error or string representation of the value and an error message
	*/
	var asErrorAndMessage = (error) => error instanceof Error ? [error, error.message] : [String(error), String(error)];
	exports.asErrorAndMessage = asErrorAndMessage;
	/**
	* Extracts the layer path from the route arguments
	*
	* @param args - Arguments of the route
	* @returns The layer path
	*/
	var getLayerPath = (args) => {
		const firstArg = args[0];
		if (Array.isArray(firstArg)) return firstArg.map((arg) => extractLayerPathSegment(arg) || "").join(",");
		return extractLayerPathSegment(firstArg);
	};
	exports.getLayerPath = getLayerPath;
	var extractLayerPathSegment = (arg) => {
		if (typeof arg === "string") return arg;
		if (arg instanceof RegExp || typeof arg === "number") return arg.toString();
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-express/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.47.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-express";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-express/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ExpressInstrumentation = void 0;
	var core_1 = (init_esm(), __toCommonJS(esm_exports));
	var api_1 = require_src$1();
	var ExpressLayerType_1 = require_ExpressLayerType();
	var AttributeNames_1 = require_AttributeNames();
	var utils_1 = require_utils();
	/** @knipignore */
	var version_1 = require_version();
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	var semantic_conventions_1 = require_src$2();
	var internal_types_1 = require_internal_types();
	/** Express instrumentation for OpenTelemetry */
	var ExpressInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			return [new instrumentation_1.InstrumentationNodeModuleDefinition("express", [">=4.0.0 <5"], (moduleExports) => {
				const routerProto = moduleExports.Router;
				if ((0, instrumentation_1.isWrapped)(routerProto.route)) this._unwrap(routerProto, "route");
				this._wrap(routerProto, "route", this._getRoutePatch());
				if ((0, instrumentation_1.isWrapped)(routerProto.use)) this._unwrap(routerProto, "use");
				this._wrap(routerProto, "use", this._getRouterUsePatch());
				if ((0, instrumentation_1.isWrapped)(moduleExports.application.use)) this._unwrap(moduleExports.application, "use");
				this._wrap(moduleExports.application, "use", this._getAppUsePatch());
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports === void 0) return;
				const routerProto = moduleExports.Router;
				this._unwrap(routerProto, "route");
				this._unwrap(routerProto, "use");
				this._unwrap(moduleExports.application, "use");
			})];
		}
		/**
		* Get the patch for Router.route function
		*/
		_getRoutePatch() {
			const instrumentation = this;
			return function(original) {
				return function route_trace(...args) {
					const route = original.apply(this, args);
					const layer = this.stack[this.stack.length - 1];
					instrumentation._applyPatch(layer, (0, utils_1.getLayerPath)(args));
					return route;
				};
			};
		}
		/**
		* Get the patch for Router.use function
		*/
		_getRouterUsePatch() {
			const instrumentation = this;
			return function(original) {
				return function use(...args) {
					const route = original.apply(this, args);
					const layer = this.stack[this.stack.length - 1];
					instrumentation._applyPatch(layer, (0, utils_1.getLayerPath)(args));
					return route;
				};
			};
		}
		/**
		* Get the patch for Application.use function
		*/
		_getAppUsePatch() {
			const instrumentation = this;
			return function(original) {
				return function use(...args) {
					const route = original.apply(this, args);
					const layer = this._router.stack[this._router.stack.length - 1];
					instrumentation._applyPatch(layer, (0, utils_1.getLayerPath)(args));
					return route;
				};
			};
		}
		/** Patch each express layer to create span and propagate context */
		_applyPatch(layer, layerPath) {
			const instrumentation = this;
			if (layer[internal_types_1.kLayerPatched] === true) return;
			layer[internal_types_1.kLayerPatched] = true;
			this._wrap(layer, "handle", (original) => {
				if (original.length === 4) return original;
				const patched = function(req, res) {
					(0, utils_1.storeLayerPath)(req, layerPath);
					const route = req[internal_types_1._LAYERS_STORE_PROPERTY].filter((path) => path !== "/" && path !== "/*").join("").replace(/\/{2,}/g, "/");
					const attributes = { [semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: route.length > 0 ? route : "/" };
					const metadata = (0, utils_1.getLayerMetadata)(route, layer, layerPath);
					const type = metadata.attributes[AttributeNames_1.AttributeNames.EXPRESS_TYPE];
					const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
					if ((rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP) rpcMetadata.route = route || "/";
					if ((0, utils_1.isLayerIgnored)(metadata.name, type, instrumentation.getConfig())) {
						if (type === ExpressLayerType_1.ExpressLayerType.MIDDLEWARE) req[internal_types_1._LAYERS_STORE_PROPERTY].pop();
						return original.apply(this, arguments);
					}
					if (api_1.trace.getSpan(api_1.context.active()) === void 0) return original.apply(this, arguments);
					const spanName = instrumentation._getSpanName({
						request: req,
						layerType: type,
						route
					}, metadata.name);
					const span = instrumentation.tracer.startSpan(spanName, { attributes: Object.assign(attributes, metadata.attributes) });
					const { requestHook } = instrumentation.getConfig();
					if (requestHook) (0, instrumentation_1.safeExecuteInTheMiddle)(() => requestHook(span, {
						request: req,
						layerType: type,
						route
					}), (e) => {
						if (e) api_1.diag.error("express instrumentation: request hook failed", e);
					}, true);
					let spanHasEnded = false;
					if (metadata.attributes[AttributeNames_1.AttributeNames.EXPRESS_TYPE] !== ExpressLayerType_1.ExpressLayerType.MIDDLEWARE) {
						span.end();
						spanHasEnded = true;
					}
					const onResponseFinish = () => {
						if (spanHasEnded === false) {
							spanHasEnded = true;
							span.end();
						}
					};
					const args = Array.from(arguments);
					const callbackIdx = args.findIndex((arg) => typeof arg === "function");
					if (callbackIdx >= 0) arguments[callbackIdx] = function() {
						var _a;
						const maybeError = arguments[0];
						const isError = ![
							void 0,
							null,
							"route",
							"router"
						].includes(maybeError);
						if (!spanHasEnded && isError) {
							const [error, message] = (0, utils_1.asErrorAndMessage)(maybeError);
							span.recordException(error);
							span.setStatus({
								code: api_1.SpanStatusCode.ERROR,
								message
							});
						}
						if (spanHasEnded === false) {
							spanHasEnded = true;
							(_a = req.res) === null || _a === void 0 || _a.removeListener("finish", onResponseFinish);
							span.end();
						}
						if (!(req.route && isError)) req[internal_types_1._LAYERS_STORE_PROPERTY].pop();
						return args[callbackIdx].apply(this, arguments);
					};
					try {
						return original.apply(this, arguments);
					} catch (anyError) {
						const [error, message] = (0, utils_1.asErrorAndMessage)(anyError);
						span.recordException(error);
						span.setStatus({
							code: api_1.SpanStatusCode.ERROR,
							message
						});
						throw anyError;
					} finally {
						/**
						* At this point if the callback wasn't called, that means either the
						* layer is asynchronous (so it will call the callback later on) or that
						* the layer directly end the http response, so we'll hook into the "finish"
						* event to handle the later case.
						*/
						if (!spanHasEnded) res.once("finish", onResponseFinish);
					}
				};
				for (const key in original) Object.defineProperty(patched, key, {
					get() {
						return original[key];
					},
					set(value) {
						original[key] = value;
					}
				});
				return patched;
			});
		}
		_getSpanName(info, defaultName) {
			var _a;
			const { spanNameHook } = this.getConfig();
			if (!(spanNameHook instanceof Function)) return defaultName;
			try {
				return (_a = spanNameHook(info, defaultName)) !== null && _a !== void 0 ? _a : defaultName;
			} catch (err) {
				api_1.diag.error("express instrumentation: error calling span name rewrite hook", err);
				return defaultName;
			}
		}
	};
	exports.ExpressInstrumentation = ExpressInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-express/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-express/build/src/index.js
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
	__exportStar(require_ExpressLayerType(), exports);
	__exportStar(require_AttributeNames(), exports);
	__exportStar(require_types(), exports);
}));
//#endregion
export { require_src as t };
