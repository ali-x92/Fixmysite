import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$2 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./instrumentation+[...].mjs";
import { n as require_src$3 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-ioredis/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.endSpan = void 0;
	var api_1 = require_src$2();
	var endSpan = (span, err) => {
		if (err) {
			span.recordException(err);
			span.setStatus({
				code: api_1.SpanStatusCode.ERROR,
				message: err.message
			});
		}
		span.end();
	};
	exports.endSpan = endSpan;
}));
//#endregion
//#region node_modules/@opentelemetry/redis-common/build/src/index.js
var require_src$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultDbStatementSerializer = void 0;
	/**
	* List of regexes and the number of arguments that should be serialized for matching commands.
	* For example, HSET should serialize which key and field it's operating on, but not its value.
	* Setting the subset to -1 will serialize all arguments.
	* Commands without a match will have their first argument serialized.
	*
	* Refer to https://redis.io/commands/ for the full list.
	*/
	var serializationSubsets = [
		{
			regex: /^ECHO/i,
			args: 0
		},
		{
			regex: /^(LPUSH|MSET|PFA|PUBLISH|RPUSH|SADD|SET|SPUBLISH|XADD|ZADD)/i,
			args: 1
		},
		{
			regex: /^(HSET|HMSET|LSET|LINSERT)/i,
			args: 2
		},
		{
			regex: /^(ACL|BIT|B[LRZ]|CLIENT|CLUSTER|CONFIG|COMMAND|DECR|DEL|EVAL|EX|FUNCTION|GEO|GET|HINCR|HMGET|HSCAN|INCR|L[TRLM]|MEMORY|P[EFISTU]|RPOP|S[CDIMORSU]|XACK|X[CDGILPRT]|Z[CDILMPRS])/i,
			args: -1
		}
	];
	/**
	* Given the redis command name and arguments, return a combination of the
	* command name + the allowed arguments according to `serializationSubsets`.
	* @param cmdName The redis command name
	* @param cmdArgs The redis command arguments
	* @returns a combination of the command name + args according to `serializationSubsets`.
	*/
	var defaultDbStatementSerializer = (cmdName, cmdArgs) => {
		var _a, _b;
		if (Array.isArray(cmdArgs) && cmdArgs.length) {
			const nArgsToSerialize = (_b = (_a = serializationSubsets.find(({ regex }) => {
				return regex.test(cmdName);
			})) === null || _a === void 0 ? void 0 : _a.args) !== null && _b !== void 0 ? _b : 0;
			const argsToSerialize = nArgsToSerialize >= 0 ? cmdArgs.slice(0, nArgsToSerialize) : cmdArgs;
			if (cmdArgs.length > argsToSerialize.length) argsToSerialize.push(`[${cmdArgs.length - nArgsToSerialize} other arguments]`);
			return `${cmdName} ${argsToSerialize.join(" ")}`;
		}
		return cmdName;
	};
	exports.defaultDbStatementSerializer = defaultDbStatementSerializer;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-ioredis/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.47.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-ioredis";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-ioredis/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.IORedisInstrumentation = void 0;
	var api_1 = require_src$2();
	var instrumentation_1 = (init_esm(), __toCommonJS(esm_exports));
	var semantic_conventions_1 = require_src$3();
	var instrumentation_2 = (init_esm(), __toCommonJS(esm_exports));
	var utils_1 = require_utils();
	var redis_common_1 = require_src$1();
	/** @knipignore */
	var version_1 = require_version();
	var DEFAULT_CONFIG = { requireParentSpan: true };
	var IORedisInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
		}
		setConfig(config = {}) {
			super.setConfig(Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
		}
		init() {
			return [new instrumentation_1.InstrumentationNodeModuleDefinition("ioredis", [">=2.0.0 <6"], (module$1, moduleVersion) => {
				const moduleExports = module$1[Symbol.toStringTag] === "Module" ? module$1.default : module$1;
				if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.sendCommand)) this._unwrap(moduleExports.prototype, "sendCommand");
				this._wrap(moduleExports.prototype, "sendCommand", this._patchSendCommand(moduleVersion));
				if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
				this._wrap(moduleExports.prototype, "connect", this._patchConnection());
				return module$1;
			}, (module$2) => {
				if (module$2 === void 0) return;
				const moduleExports = module$2[Symbol.toStringTag] === "Module" ? module$2.default : module$2;
				this._unwrap(moduleExports.prototype, "sendCommand");
				this._unwrap(moduleExports.prototype, "connect");
			})];
		}
		/**
		* Patch send command internal to trace requests
		*/
		_patchSendCommand(moduleVersion) {
			return (original) => {
				return this._traceSendCommand(original, moduleVersion);
			};
		}
		_patchConnection() {
			return (original) => {
				return this._traceConnection(original);
			};
		}
		_traceSendCommand(original, moduleVersion) {
			const instrumentation = this;
			return function(cmd) {
				if (arguments.length < 1 || typeof cmd !== "object") return original.apply(this, arguments);
				const config = instrumentation.getConfig();
				const dbStatementSerializer = config.dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
				const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
				if (config.requireParentSpan === true && hasNoParentSpan) return original.apply(this, arguments);
				const span = instrumentation.tracer.startSpan(cmd.name, {
					kind: api_1.SpanKind.CLIENT,
					attributes: {
						[semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_REDIS,
						[semantic_conventions_1.SEMATTRS_DB_STATEMENT]: dbStatementSerializer(cmd.name, cmd.args)
					}
				});
				const { requestHook } = config;
				if (requestHook) (0, instrumentation_2.safeExecuteInTheMiddle)(() => requestHook(span, {
					moduleVersion,
					cmdName: cmd.name,
					cmdArgs: cmd.args
				}), (e) => {
					if (e) api_1.diag.error("ioredis instrumentation: request hook failed", e);
				}, true);
				const { host, port } = this.options;
				span.setAttributes({
					[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
					[semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: port,
					[semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: `redis://${host}:${port}`
				});
				try {
					const result = original.apply(this, arguments);
					const origResolve = cmd.resolve;
					cmd.resolve = function(result) {
						(0, instrumentation_2.safeExecuteInTheMiddle)(() => {
							var _a;
							return (_a = config.responseHook) === null || _a === void 0 ? void 0 : _a.call(config, span, cmd.name, cmd.args, result);
						}, (e) => {
							if (e) api_1.diag.error("ioredis instrumentation: response hook failed", e);
						}, true);
						(0, utils_1.endSpan)(span, null);
						origResolve(result);
					};
					const origReject = cmd.reject;
					cmd.reject = function(err) {
						(0, utils_1.endSpan)(span, err);
						origReject(err);
					};
					return result;
				} catch (error) {
					(0, utils_1.endSpan)(span, error);
					throw error;
				}
			};
		}
		_traceConnection(original) {
			const instrumentation = this;
			return function() {
				const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === void 0;
				if (instrumentation.getConfig().requireParentSpan === true && hasNoParentSpan) return original.apply(this, arguments);
				const span = instrumentation.tracer.startSpan("connect", {
					kind: api_1.SpanKind.CLIENT,
					attributes: {
						[semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_REDIS,
						[semantic_conventions_1.SEMATTRS_DB_STATEMENT]: "connect"
					}
				});
				const { host, port } = this.options;
				span.setAttributes({
					[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
					[semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: port,
					[semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: `redis://${host}:${port}`
				});
				try {
					const client = original.apply(this, arguments);
					(0, utils_1.endSpan)(span, null);
					return client;
				} catch (error) {
					(0, utils_1.endSpan)(span, error);
					throw error;
				}
			};
		}
	};
	exports.IORedisInstrumentation = IORedisInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-ioredis/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-ioredis/build/src/index.js
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
}));
//#endregion
export { require_src$1 as n, require_src as t };
