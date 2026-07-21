import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./core+[...].mjs";
import { n as init_esm$1, t as esm_exports$1 } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-mongoose/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.handleCallbackResponse = exports.handlePromiseResponse = exports.getAttributesFromCollection = void 0;
	var api_1 = require_src$1();
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	var semantic_conventions_1 = require_src$2();
	function getAttributesFromCollection(collection) {
		return {
			[semantic_conventions_1.SEMATTRS_DB_MONGODB_COLLECTION]: collection.name,
			[semantic_conventions_1.SEMATTRS_DB_NAME]: collection.conn.name,
			[semantic_conventions_1.SEMATTRS_DB_USER]: collection.conn.user,
			[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: collection.conn.host,
			[semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: collection.conn.port
		};
	}
	exports.getAttributesFromCollection = getAttributesFromCollection;
	function setErrorStatus(span, error = {}) {
		span.recordException(error);
		span.setStatus({
			code: api_1.SpanStatusCode.ERROR,
			message: `${error.message} ${error.code ? `\nMongoose Error Code: ${error.code}` : ""}`
		});
	}
	function applyResponseHook(span, response, responseHook, moduleVersion = void 0) {
		if (!responseHook) return;
		(0, instrumentation_1.safeExecuteInTheMiddle)(() => responseHook(span, {
			moduleVersion,
			response
		}), (e) => {
			if (e) api_1.diag.error("mongoose instrumentation: responseHook error", e);
		}, true);
	}
	function handlePromiseResponse(execResponse, span, responseHook, moduleVersion = void 0) {
		if (!(execResponse instanceof Promise)) {
			applyResponseHook(span, execResponse, responseHook, moduleVersion);
			span.end();
			return execResponse;
		}
		return execResponse.then((response) => {
			applyResponseHook(span, response, responseHook, moduleVersion);
			return response;
		}).catch((err) => {
			setErrorStatus(span, err);
			throw err;
		}).finally(() => span.end());
	}
	exports.handlePromiseResponse = handlePromiseResponse;
	function handleCallbackResponse(callback, exec, originalThis, span, args, responseHook, moduleVersion = void 0) {
		let callbackArgumentIndex = 0;
		if (args.length === 2) callbackArgumentIndex = 1;
		args[callbackArgumentIndex] = (err, response) => {
			err ? setErrorStatus(span, err) : applyResponseHook(span, response, responseHook, moduleVersion);
			span.end();
			return callback(err, response);
		};
		return exec.apply(originalThis, args);
	}
	exports.handleCallbackResponse = handleCallbackResponse;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mongoose/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.46.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-mongoose";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mongoose/build/src/mongoose.js
var require_mongoose = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MongooseInstrumentation = exports._STORED_PARENT_SPAN = void 0;
	var api_1 = require_src$1();
	var core_1 = (init_esm(), __toCommonJS(esm_exports));
	var utils_1 = require_utils();
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	/** @knipignore */
	var version_1 = require_version();
	var semantic_conventions_1 = require_src$2();
	var contextCaptureFunctionsCommon = [
		"deleteOne",
		"deleteMany",
		"find",
		"findOne",
		"estimatedDocumentCount",
		"countDocuments",
		"distinct",
		"where",
		"$where",
		"findOneAndUpdate",
		"findOneAndDelete",
		"findOneAndReplace"
	];
	var contextCaptureFunctions6 = [
		"remove",
		"count",
		"findOneAndRemove",
		...contextCaptureFunctionsCommon
	];
	var contextCaptureFunctions7 = [
		"count",
		"findOneAndRemove",
		...contextCaptureFunctionsCommon
	];
	var contextCaptureFunctions8 = [...contextCaptureFunctionsCommon];
	function getContextCaptureFunctions(moduleVersion) {
		/* istanbul ignore next */
		if (!moduleVersion) return contextCaptureFunctionsCommon;
		else if (moduleVersion.startsWith("6.") || moduleVersion.startsWith("5.")) return contextCaptureFunctions6;
		else if (moduleVersion.startsWith("7.")) return contextCaptureFunctions7;
		else return contextCaptureFunctions8;
	}
	function instrumentRemove(moduleVersion) {
		return moduleVersion && (moduleVersion.startsWith("5.") || moduleVersion.startsWith("6.")) || false;
	}
	exports._STORED_PARENT_SPAN = Symbol("stored-parent-span");
	var MongooseInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			return new instrumentation_1.InstrumentationNodeModuleDefinition("mongoose", [">=5.9.7 <9"], this.patch.bind(this), this.unpatch.bind(this));
		}
		patch(moduleExports, moduleVersion) {
			this._wrap(moduleExports.Model.prototype, "save", this.patchOnModelMethods("save", moduleVersion));
			moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
			if (instrumentRemove(moduleVersion)) this._wrap(moduleExports.Model.prototype, "remove", this.patchOnModelMethods("remove", moduleVersion));
			this._wrap(moduleExports.Query.prototype, "exec", this.patchQueryExec(moduleVersion));
			this._wrap(moduleExports.Aggregate.prototype, "exec", this.patchAggregateExec(moduleVersion));
			getContextCaptureFunctions(moduleVersion).forEach((funcName) => {
				this._wrap(moduleExports.Query.prototype, funcName, this.patchAndCaptureSpanContext(funcName));
			});
			this._wrap(moduleExports.Model, "aggregate", this.patchModelAggregate());
			return moduleExports;
		}
		unpatch(moduleExports, moduleVersion) {
			const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
			this._unwrap(moduleExports.Model.prototype, "save");
			moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
			if (instrumentRemove(moduleVersion)) this._unwrap(moduleExports.Model.prototype, "remove");
			this._unwrap(moduleExports.Query.prototype, "exec");
			this._unwrap(moduleExports.Aggregate.prototype, "exec");
			contextCaptureFunctions.forEach((funcName) => {
				this._unwrap(moduleExports.Query.prototype, funcName);
			});
			this._unwrap(moduleExports.Model, "aggregate");
		}
		patchAggregateExec(moduleVersion) {
			const self = this;
			return (originalAggregate) => {
				return function exec(callback) {
					var _a;
					if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) return originalAggregate.apply(this, arguments);
					const parentSpan = this[exports._STORED_PARENT_SPAN];
					const attributes = {};
					const { dbStatementSerializer } = self.getConfig();
					if (dbStatementSerializer) attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = dbStatementSerializer("aggregate", {
						options: this.options,
						aggregatePipeline: this._pipeline
					});
					const span = self._startSpan(this._model.collection, (_a = this._model) === null || _a === void 0 ? void 0 : _a.modelName, "aggregate", attributes, parentSpan);
					return self._handleResponse(span, originalAggregate, this, arguments, callback, moduleVersion);
				};
			};
		}
		patchQueryExec(moduleVersion) {
			const self = this;
			return (originalExec) => {
				return function exec(callback) {
					if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) return originalExec.apply(this, arguments);
					const parentSpan = this[exports._STORED_PARENT_SPAN];
					const attributes = {};
					const { dbStatementSerializer } = self.getConfig();
					if (dbStatementSerializer) attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = dbStatementSerializer(this.op, {
						condition: this._conditions,
						updates: this._update,
						options: this.options,
						fields: this._fields
					});
					const span = self._startSpan(this.mongooseCollection, this.model.modelName, this.op, attributes, parentSpan);
					return self._handleResponse(span, originalExec, this, arguments, callback, moduleVersion);
				};
			};
		}
		patchOnModelMethods(op, moduleVersion) {
			const self = this;
			return (originalOnModelFunction) => {
				return function method(options, callback) {
					if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === void 0) return originalOnModelFunction.apply(this, arguments);
					const serializePayload = { document: this };
					if (options && !(options instanceof Function)) serializePayload.options = options;
					const attributes = {};
					const { dbStatementSerializer } = self.getConfig();
					if (dbStatementSerializer) attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = dbStatementSerializer(op, serializePayload);
					const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op, attributes);
					if (options instanceof Function) {
						callback = options;
						options = void 0;
					}
					return self._handleResponse(span, originalOnModelFunction, this, arguments, callback, moduleVersion);
				};
			};
		}
		patchModelAggregate() {
			const self = this;
			return (original) => {
				return function captureSpanContext() {
					const currentSpan = api_1.trace.getSpan(api_1.context.active());
					const aggregate = self._callOriginalFunction(() => original.apply(this, arguments));
					if (aggregate) aggregate[exports._STORED_PARENT_SPAN] = currentSpan;
					return aggregate;
				};
			};
		}
		patchAndCaptureSpanContext(funcName) {
			const self = this;
			return (original) => {
				return function captureSpanContext() {
					this[exports._STORED_PARENT_SPAN] = api_1.trace.getSpan(api_1.context.active());
					return self._callOriginalFunction(() => original.apply(this, arguments));
				};
			};
		}
		_startSpan(collection, modelName, operation, attributes, parentSpan) {
			return this.tracer.startSpan(`mongoose.${modelName}.${operation}`, {
				kind: api_1.SpanKind.CLIENT,
				attributes: Object.assign(Object.assign(Object.assign({}, attributes), (0, utils_1.getAttributesFromCollection)(collection)), {
					[semantic_conventions_1.SEMATTRS_DB_OPERATION]: operation,
					[semantic_conventions_1.SEMATTRS_DB_SYSTEM]: "mongoose"
				})
			}, parentSpan ? api_1.trace.setSpan(api_1.context.active(), parentSpan) : void 0);
		}
		_handleResponse(span, exec, originalThis, args, callback, moduleVersion = void 0) {
			const self = this;
			if (callback instanceof Function) return self._callOriginalFunction(() => (0, utils_1.handleCallbackResponse)(callback, exec, originalThis, span, args, self.getConfig().responseHook, moduleVersion));
			else {
				const response = self._callOriginalFunction(() => exec.apply(originalThis, args));
				return (0, utils_1.handlePromiseResponse)(response, span, self.getConfig().responseHook, moduleVersion);
			}
		}
		_callOriginalFunction(originalFunction) {
			if (this.getConfig().suppressInternalInstrumentation) return api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), originalFunction);
			else return originalFunction();
		}
	};
	exports.MongooseInstrumentation = MongooseInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mongoose/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mongoose/build/src/index.js
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
	__exportStar(require_mongoose(), exports);
	__exportStar(require_types(), exports);
}));
//#endregion
export { require_src as t };
