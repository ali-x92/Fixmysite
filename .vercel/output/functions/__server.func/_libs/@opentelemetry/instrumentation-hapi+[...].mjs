import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./core+[...].mjs";
import { n as init_esm$1, t as esm_exports$1 } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-hapi/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.45.2";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-hapi";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-hapi/build/src/internal-types.js
var require_internal_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HapiLifecycleMethodNames = exports.HapiLayerType = exports.handlerPatched = exports.HapiComponentName = void 0;
	exports.HapiComponentName = "@hapi/hapi";
	/**
	* This symbol is used to mark a Hapi route handler or server extension handler as
	* already patched, since its possible to use these handlers multiple times
	* i.e. when allowing multiple versions of one plugin, or when registering a plugin
	* multiple times on different servers.
	*/
	exports.handlerPatched = Symbol("hapi-handler-patched");
	exports.HapiLayerType = {
		ROUTER: "router",
		PLUGIN: "plugin",
		EXT: "server.ext"
	};
	exports.HapiLifecycleMethodNames = /* @__PURE__ */ new Set([
		"onPreAuth",
		"onCredentials",
		"onPostAuth",
		"onPreHandler",
		"onPostHandler",
		"onPreResponse",
		"onRequest"
	]);
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-hapi/build/src/enums/AttributeNames.js
var require_AttributeNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AttributeNames = void 0;
	(function(AttributeNames) {
		AttributeNames["HAPI_TYPE"] = "hapi.type";
		AttributeNames["PLUGIN_NAME"] = "hapi.plugin.name";
		AttributeNames["EXT_TYPE"] = "server.ext.type";
	})(exports.AttributeNames || (exports.AttributeNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-hapi/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getPluginFromInput = exports.getExtMetadata = exports.getRouteMetadata = exports.isPatchableExtMethod = exports.isDirectExtInput = exports.isLifecycleExtEventObj = exports.isLifecycleExtType = exports.getPluginName = void 0;
	var semantic_conventions_1 = require_src$2();
	var internal_types_1 = require_internal_types();
	var AttributeNames_1 = require_AttributeNames();
	function getPluginName(plugin) {
		if (plugin.name) return plugin.name;
		else return plugin.pkg.name;
	}
	exports.getPluginName = getPluginName;
	var isLifecycleExtType = (variableToCheck) => {
		return typeof variableToCheck === "string" && internal_types_1.HapiLifecycleMethodNames.has(variableToCheck);
	};
	exports.isLifecycleExtType = isLifecycleExtType;
	var isLifecycleExtEventObj = (variableToCheck) => {
		var _a;
		const event = (_a = variableToCheck) === null || _a === void 0 ? void 0 : _a.type;
		return event !== void 0 && (0, exports.isLifecycleExtType)(event);
	};
	exports.isLifecycleExtEventObj = isLifecycleExtEventObj;
	var isDirectExtInput = (variableToCheck) => {
		return Array.isArray(variableToCheck) && variableToCheck.length <= 3 && (0, exports.isLifecycleExtType)(variableToCheck[0]) && typeof variableToCheck[1] === "function";
	};
	exports.isDirectExtInput = isDirectExtInput;
	var isPatchableExtMethod = (variableToCheck) => {
		return !Array.isArray(variableToCheck);
	};
	exports.isPatchableExtMethod = isPatchableExtMethod;
	var getRouteMetadata = (route, pluginName) => {
		if (pluginName) return {
			attributes: {
				[semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: route.path,
				[semantic_conventions_1.SEMATTRS_HTTP_METHOD]: route.method,
				[AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.PLUGIN,
				[AttributeNames_1.AttributeNames.PLUGIN_NAME]: pluginName
			},
			name: `${pluginName}: route - ${route.path}`
		};
		return {
			attributes: {
				[semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: route.path,
				[semantic_conventions_1.SEMATTRS_HTTP_METHOD]: route.method,
				[AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.ROUTER
			},
			name: `route - ${route.path}`
		};
	};
	exports.getRouteMetadata = getRouteMetadata;
	var getExtMetadata = (extPoint, pluginName) => {
		if (pluginName) return {
			attributes: {
				[AttributeNames_1.AttributeNames.EXT_TYPE]: extPoint,
				[AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.EXT,
				[AttributeNames_1.AttributeNames.PLUGIN_NAME]: pluginName
			},
			name: `${pluginName}: ext - ${extPoint}`
		};
		return {
			attributes: {
				[AttributeNames_1.AttributeNames.EXT_TYPE]: extPoint,
				[AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.EXT
			},
			name: `ext - ${extPoint}`
		};
	};
	exports.getExtMetadata = getExtMetadata;
	var getPluginFromInput = (pluginObj) => {
		if ("plugin" in pluginObj) {
			if ("plugin" in pluginObj.plugin) return pluginObj.plugin.plugin;
			return pluginObj.plugin;
		}
		return pluginObj;
	};
	exports.getPluginFromInput = getPluginFromInput;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-hapi/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HapiInstrumentation = void 0;
	var api = require_src$1();
	var core_1 = (init_esm(), __toCommonJS(esm_exports));
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	/** @knipignore */
	var version_1 = require_version();
	var internal_types_1 = require_internal_types();
	var utils_1 = require_utils();
	/** Hapi instrumentation for OpenTelemetry */
	var HapiInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			return new instrumentation_1.InstrumentationNodeModuleDefinition(internal_types_1.HapiComponentName, [">=17.0.0 <22"], (module$1) => {
				const moduleExports = module$1[Symbol.toStringTag] === "Module" ? module$1.default : module$1;
				if (!(0, instrumentation_1.isWrapped)(moduleExports.server)) this._wrap(moduleExports, "server", this._getServerPatch.bind(this));
				if (!(0, instrumentation_1.isWrapped)(moduleExports.Server)) this._wrap(moduleExports, "Server", this._getServerPatch.bind(this));
				return moduleExports;
			}, (module$2) => {
				const moduleExports = module$2[Symbol.toStringTag] === "Module" ? module$2.default : module$2;
				this._massUnwrap([moduleExports], ["server", "Server"]);
			});
		}
		/**
		* Patches the Hapi.server and Hapi.Server functions in order to instrument
		* the server.route, server.ext, and server.register functions via calls to the
		* @function _getServerRoutePatch, @function _getServerExtPatch, and
		* @function _getServerRegisterPatch functions
		* @param original - the original Hapi Server creation function
		*/
		_getServerPatch(original) {
			const instrumentation = this;
			const self = this;
			return function server(opts) {
				const newServer = original.apply(this, [opts]);
				self._wrap(newServer, "route", (originalRouter) => {
					return instrumentation._getServerRoutePatch.bind(instrumentation)(originalRouter);
				});
				self._wrap(newServer, "ext", (originalExtHandler) => {
					return instrumentation._getServerExtPatch.bind(instrumentation)(originalExtHandler);
				});
				self._wrap(newServer, "register", instrumentation._getServerRegisterPatch.bind(instrumentation));
				return newServer;
			};
		}
		/**
		* Patches the plugin register function used by the Hapi Server. This function
		* goes through each plugin that is being registered and adds instrumentation
		* via a call to the @function _wrapRegisterHandler function.
		* @param {RegisterFunction<T>} original - the original register function which
		* registers each plugin on the server
		*/
		_getServerRegisterPatch(original) {
			const instrumentation = this;
			return function register(pluginInput, options) {
				if (Array.isArray(pluginInput)) for (const pluginObj of pluginInput) {
					const plugin = (0, utils_1.getPluginFromInput)(pluginObj);
					instrumentation._wrapRegisterHandler(plugin);
				}
				else {
					const plugin = (0, utils_1.getPluginFromInput)(pluginInput);
					instrumentation._wrapRegisterHandler(plugin);
				}
				return original.apply(this, [pluginInput, options]);
			};
		}
		/**
		* Patches the Server.ext function which adds extension methods to the specified
		* point along the request lifecycle. This function accepts the full range of
		* accepted input into the standard Hapi `server.ext` function. For each extension,
		* it adds instrumentation to the handler via a call to the @function _wrapExtMethods
		* function.
		* @param original - the original ext function which adds the extension method to the server
		* @param {string} [pluginName] - if present, represents the name of the plugin responsible
		* for adding this server extension. Else, signifies that the extension was added directly
		*/
		_getServerExtPatch(original, pluginName) {
			const instrumentation = this;
			return function ext(...args) {
				if (Array.isArray(args[0])) {
					const eventsList = args[0];
					for (let i = 0; i < eventsList.length; i++) {
						const eventObj = eventsList[i];
						if ((0, utils_1.isLifecycleExtType)(eventObj.type)) {
							const lifecycleEventObj = eventObj;
							lifecycleEventObj.method = instrumentation._wrapExtMethods(lifecycleEventObj.method, eventObj.type, pluginName);
							eventsList[i] = lifecycleEventObj;
						}
					}
					return original.apply(this, args);
				} else if ((0, utils_1.isDirectExtInput)(args)) {
					const extInput = args;
					const method = extInput[1];
					const handler = instrumentation._wrapExtMethods(method, extInput[0], pluginName);
					return original.apply(this, [
						extInput[0],
						handler,
						extInput[2]
					]);
				} else if ((0, utils_1.isLifecycleExtEventObj)(args[0])) {
					const lifecycleEventObj = args[0];
					lifecycleEventObj.method = instrumentation._wrapExtMethods(lifecycleEventObj.method, lifecycleEventObj.type, pluginName);
					return original.call(this, lifecycleEventObj);
				}
				return original.apply(this, args);
			};
		}
		/**
		* Patches the Server.route function. This function accepts either one or an array
		* of Hapi.ServerRoute objects and adds instrumentation on each route via a call to
		* the @function _wrapRouteHandler function.
		* @param {HapiServerRouteInputMethod} original - the original route function which adds
		* the route to the server
		* @param {string} [pluginName] - if present, represents the name of the plugin responsible
		* for adding this server route. Else, signifies that the route was added directly
		*/
		_getServerRoutePatch(original, pluginName) {
			const instrumentation = this;
			return function route(route) {
				if (Array.isArray(route)) for (let i = 0; i < route.length; i++) {
					const newRoute = instrumentation._wrapRouteHandler.call(instrumentation, route[i], pluginName);
					route[i] = newRoute;
				}
				else route = instrumentation._wrapRouteHandler.call(instrumentation, route, pluginName);
				return original.apply(this, [route]);
			};
		}
		/**
		* Wraps newly registered plugins to add instrumentation to the plugin's clone of
		* the original server. Specifically, wraps the server.route and server.ext functions
		* via calls to @function _getServerRoutePatch and @function _getServerExtPatch
		* @param {Hapi.Plugin<T>} plugin - the new plugin which is being instrumented
		*/
		_wrapRegisterHandler(plugin) {
			const instrumentation = this;
			const pluginName = (0, utils_1.getPluginName)(plugin);
			const oldRegister = plugin.register;
			const self = this;
			const newRegisterHandler = function(server, options) {
				self._wrap(server, "route", (original) => {
					return instrumentation._getServerRoutePatch.bind(instrumentation)(original, pluginName);
				});
				self._wrap(server, "ext", (originalExtHandler) => {
					return instrumentation._getServerExtPatch.bind(instrumentation)(originalExtHandler, pluginName);
				});
				return oldRegister.call(this, server, options);
			};
			plugin.register = newRegisterHandler;
		}
		/**
		* Wraps request extension methods to add instrumentation to each new extension handler.
		* Patches each individual extension in order to create the
		* span and propagate context. It does not create spans when there is no parent span.
		* @param {PatchableExtMethod | PatchableExtMethod[]} method - the request extension
		* handler which is being instrumented
		* @param {Hapi.ServerRequestExtType} extPoint - the point in the Hapi request lifecycle
		* which this extension targets
		* @param {string} [pluginName] - if present, represents the name of the plugin responsible
		* for adding this server route. Else, signifies that the route was added directly
		*/
		_wrapExtMethods(method, extPoint, pluginName) {
			const instrumentation = this;
			if (method instanceof Array) {
				for (let i = 0; i < method.length; i++) method[i] = instrumentation._wrapExtMethods(method[i], extPoint);
				return method;
			} else if ((0, utils_1.isPatchableExtMethod)(method)) {
				if (method[internal_types_1.handlerPatched] === true) return method;
				method[internal_types_1.handlerPatched] = true;
				const newHandler = async function(...params) {
					if (api.trace.getSpan(api.context.active()) === void 0) return await method.apply(this, params);
					const metadata = (0, utils_1.getExtMetadata)(extPoint, pluginName);
					const span = instrumentation.tracer.startSpan(metadata.name, { attributes: metadata.attributes });
					try {
						return await api.context.with(api.trace.setSpan(api.context.active(), span), method, void 0, ...params);
					} catch (err) {
						span.recordException(err);
						span.setStatus({
							code: api.SpanStatusCode.ERROR,
							message: err.message
						});
						throw err;
					} finally {
						span.end();
					}
				};
				return newHandler;
			}
			return method;
		}
		/**
		* Patches each individual route handler method in order to create the
		* span and propagate context. It does not create spans when there is no parent span.
		* @param {PatchableServerRoute} route - the route handler which is being instrumented
		* @param {string} [pluginName] - if present, represents the name of the plugin responsible
		* for adding this server route. Else, signifies that the route was added directly
		*/
		_wrapRouteHandler(route, pluginName) {
			var _a;
			const instrumentation = this;
			if (route[internal_types_1.handlerPatched] === true) return route;
			route[internal_types_1.handlerPatched] = true;
			const wrapHandler = (oldHandler) => {
				return async function(...params) {
					if (api.trace.getSpan(api.context.active()) === void 0) return await oldHandler.call(this, ...params);
					const rpcMetadata = (0, core_1.getRPCMetadata)(api.context.active());
					if ((rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP) rpcMetadata.route = route.path;
					const metadata = (0, utils_1.getRouteMetadata)(route, pluginName);
					const span = instrumentation.tracer.startSpan(metadata.name, { attributes: metadata.attributes });
					try {
						return await api.context.with(api.trace.setSpan(api.context.active(), span), () => oldHandler.call(this, ...params));
					} catch (err) {
						span.recordException(err);
						span.setStatus({
							code: api.SpanStatusCode.ERROR,
							message: err.message
						});
						throw err;
					} finally {
						span.end();
					}
				};
			};
			if (typeof route.handler === "function") route.handler = wrapHandler(route.handler);
			else if (typeof route.options === "function") {
				const oldOptions = route.options;
				route.options = function(server) {
					const options = oldOptions(server);
					if (typeof options.handler === "function") options.handler = wrapHandler(options.handler);
					return options;
				};
			} else if (typeof ((_a = route.options) === null || _a === void 0 ? void 0 : _a.handler) === "function") route.options.handler = wrapHandler(route.options.handler);
			return route;
		}
	};
	exports.HapiInstrumentation = HapiInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-hapi/build/src/index.js
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
	__exportStar(require_AttributeNames(), exports);
}));
//#endregion
export { require_src as t };
