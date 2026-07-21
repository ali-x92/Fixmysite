import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./core+[...].mjs";
import { n as init_esm$1, t as esm_exports$1 } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-connect/build/src/enums/AttributeNames.js
var require_AttributeNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ConnectNames = exports.ConnectTypes = exports.AttributeNames = void 0;
	(function(AttributeNames) {
		AttributeNames["CONNECT_TYPE"] = "connect.type";
		AttributeNames["CONNECT_NAME"] = "connect.name";
	})(exports.AttributeNames || (exports.AttributeNames = {}));
	(function(ConnectTypes) {
		ConnectTypes["MIDDLEWARE"] = "middleware";
		ConnectTypes["REQUEST_HANDLER"] = "request_handler";
	})(exports.ConnectTypes || (exports.ConnectTypes = {}));
	(function(ConnectNames) {
		ConnectNames["MIDDLEWARE"] = "middleware";
		ConnectNames["REQUEST_HANDLER"] = "request handler";
	})(exports.ConnectNames || (exports.ConnectNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-connect/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.43.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-connect";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-connect/build/src/internal-types.js
var require_internal_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._LAYERS_STORE_PROPERTY = void 0;
	exports._LAYERS_STORE_PROPERTY = Symbol("opentelemetry.instrumentation-connect.request-route-stack");
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-connect/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateRoute = exports.replaceCurrentStackRoute = exports.addNewStackLayer = void 0;
	var api_1 = require_src$1();
	var internal_types_1 = require_internal_types();
	var addNewStackLayer = (request) => {
		if (Array.isArray(request[internal_types_1._LAYERS_STORE_PROPERTY]) === false) Object.defineProperty(request, internal_types_1._LAYERS_STORE_PROPERTY, {
			enumerable: false,
			value: []
		});
		request[internal_types_1._LAYERS_STORE_PROPERTY].push("/");
		const stackLength = request[internal_types_1._LAYERS_STORE_PROPERTY].length;
		return () => {
			if (stackLength === request[internal_types_1._LAYERS_STORE_PROPERTY].length) request[internal_types_1._LAYERS_STORE_PROPERTY].pop();
			else api_1.diag.warn("Connect: Trying to pop the stack multiple time");
		};
	};
	exports.addNewStackLayer = addNewStackLayer;
	var replaceCurrentStackRoute = (request, newRoute) => {
		if (newRoute) request[internal_types_1._LAYERS_STORE_PROPERTY].splice(-1, 1, newRoute);
	};
	exports.replaceCurrentStackRoute = replaceCurrentStackRoute;
	var generateRoute = (request) => {
		return request[internal_types_1._LAYERS_STORE_PROPERTY].reduce((acc, sub) => acc.replace(/\/+$/, "") + sub);
	};
	exports.generateRoute = generateRoute;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-connect/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ConnectInstrumentation = exports.ANONYMOUS_NAME = void 0;
	var api_1 = require_src$1();
	var core_1 = (init_esm(), __toCommonJS(esm_exports));
	var AttributeNames_1 = require_AttributeNames();
	/** @knipignore */
	var version_1 = require_version();
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	var semantic_conventions_1 = require_src$2();
	var utils_1 = require_utils();
	exports.ANONYMOUS_NAME = "anonymous";
	/** Connect instrumentation for OpenTelemetry */
	var ConnectInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			return [new instrumentation_1.InstrumentationNodeModuleDefinition("connect", [">=3.0.0 <4"], (moduleExports) => {
				return this._patchConstructor(moduleExports);
			})];
		}
		_patchApp(patchedApp) {
			if (!(0, instrumentation_1.isWrapped)(patchedApp.use)) this._wrap(patchedApp, "use", this._patchUse.bind(this));
			if (!(0, instrumentation_1.isWrapped)(patchedApp.handle)) this._wrap(patchedApp, "handle", this._patchHandle.bind(this));
		}
		_patchConstructor(original) {
			const instrumentation = this;
			return function(...args) {
				const app = original.apply(this, args);
				instrumentation._patchApp(app);
				return app;
			};
		}
		_patchNext(next, finishSpan) {
			return function nextFunction(err) {
				const result = next.apply(this, [err]);
				finishSpan();
				return result;
			};
		}
		_startSpan(routeName, middleWare) {
			let connectType;
			let connectName;
			let connectTypeName;
			if (routeName) {
				connectType = AttributeNames_1.ConnectTypes.REQUEST_HANDLER;
				connectTypeName = AttributeNames_1.ConnectNames.REQUEST_HANDLER;
				connectName = routeName;
			} else {
				connectType = AttributeNames_1.ConnectTypes.MIDDLEWARE;
				connectTypeName = AttributeNames_1.ConnectNames.MIDDLEWARE;
				connectName = middleWare.name || exports.ANONYMOUS_NAME;
			}
			const spanName = `${connectTypeName} - ${connectName}`;
			const options = { attributes: {
				[semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: routeName.length > 0 ? routeName : "/",
				[AttributeNames_1.AttributeNames.CONNECT_TYPE]: connectType,
				[AttributeNames_1.AttributeNames.CONNECT_NAME]: connectName
			} };
			return this.tracer.startSpan(spanName, options);
		}
		_patchMiddleware(routeName, middleWare) {
			const instrumentation = this;
			const isErrorMiddleware = middleWare.length === 4;
			function patchedMiddleware() {
				if (!instrumentation.isEnabled()) return middleWare.apply(this, arguments);
				const [reqArgIdx, resArgIdx, nextArgIdx] = isErrorMiddleware ? [
					1,
					2,
					3
				] : [
					0,
					1,
					2
				];
				const req = arguments[reqArgIdx];
				const res = arguments[resArgIdx];
				const next = arguments[nextArgIdx];
				(0, utils_1.replaceCurrentStackRoute)(req, routeName);
				const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
				if (routeName && (rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP) rpcMetadata.route = (0, utils_1.generateRoute)(req);
				let spanName = "";
				if (routeName) spanName = `request handler - ${routeName}`;
				else spanName = `middleware - ${middleWare.name || exports.ANONYMOUS_NAME}`;
				const span = instrumentation._startSpan(routeName, middleWare);
				instrumentation._diag.debug("start span", spanName);
				let spanFinished = false;
				function finishSpan() {
					if (!spanFinished) {
						spanFinished = true;
						instrumentation._diag.debug(`finishing span ${span.name}`);
						span.end();
					} else instrumentation._diag.debug(`span ${span.name} - already finished`);
					res.removeListener("close", finishSpan);
				}
				res.addListener("close", finishSpan);
				arguments[nextArgIdx] = instrumentation._patchNext(next, finishSpan);
				return middleWare.apply(this, arguments);
			}
			Object.defineProperty(patchedMiddleware, "length", {
				value: middleWare.length,
				writable: false,
				configurable: true
			});
			return patchedMiddleware;
		}
		_patchUse(original) {
			const instrumentation = this;
			return function(...args) {
				const middleWare = args[args.length - 1];
				const routeName = args[args.length - 2] || "";
				args[args.length - 1] = instrumentation._patchMiddleware(routeName, middleWare);
				return original.apply(this, args);
			};
		}
		_patchHandle(original) {
			const instrumentation = this;
			return function() {
				const [reqIdx, outIdx] = [0, 2];
				const req = arguments[reqIdx];
				const out = arguments[outIdx];
				const completeStack = (0, utils_1.addNewStackLayer)(req);
				if (typeof out === "function") arguments[outIdx] = instrumentation._patchOut(out, completeStack);
				return original.apply(this, arguments);
			};
		}
		_patchOut(out, completeStack) {
			return function nextFunction(...args) {
				completeStack();
				return Reflect.apply(out, this, args);
			};
		}
	};
	exports.ConnectInstrumentation = ConnectInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-connect/build/src/index.js
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
	__exportStar(require_AttributeNames(), exports);
	__exportStar(require_instrumentation(), exports);
}));
//#endregion
export { require_src as t };
