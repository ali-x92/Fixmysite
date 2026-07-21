import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
import { n as require_src$3 } from "./instrumentation-ioredis+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-redis-4/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getClientAttributes = void 0;
	var semantic_conventions_1 = require_src$2();
	function getClientAttributes(diag, options) {
		var _a, _b;
		return {
			[semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_REDIS,
			[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: (_a = options === null || options === void 0 ? void 0 : options.socket) === null || _a === void 0 ? void 0 : _a.host,
			[semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: (_b = options === null || options === void 0 ? void 0 : options.socket) === null || _b === void 0 ? void 0 : _b.port,
			[semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: removeCredentialsFromDBConnectionStringAttribute(diag, options === null || options === void 0 ? void 0 : options.url)
		};
	}
	exports.getClientAttributes = getClientAttributes;
	/**
	* removeCredentialsFromDBConnectionStringAttribute removes basic auth from url and user_pwd from query string
	*
	* Examples:
	*   redis://user:pass@localhost:6379/mydb => redis://localhost:6379/mydb
	*   redis://localhost:6379?db=mydb&user_pwd=pass => redis://localhost:6379?db=mydb
	*/
	function removeCredentialsFromDBConnectionStringAttribute(diag, url) {
		if (typeof url !== "string" || !url) return;
		try {
			const u = new URL(url);
			u.searchParams.delete("user_pwd");
			u.username = "";
			u.password = "";
			return u.href;
		} catch (err) {
			diag.error("failed to sanitize redis connection url", err);
		}
	}
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-redis-4/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.46.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-redis-4";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-redis-4/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RedisInstrumentation = void 0;
	var api_1 = require_src$1();
	var instrumentation_1 = (init_esm(), __toCommonJS(esm_exports));
	var utils_1 = require_utils();
	var redis_common_1 = require_src$3();
	/** @knipignore */
	var version_1 = require_version();
	var semantic_conventions_1 = require_src$2();
	var OTEL_OPEN_SPANS = Symbol("opentelemetry.instrumentation.redis.open_spans");
	var MULTI_COMMAND_OPTIONS = Symbol("opentelemetry.instrumentation.redis.multi_command_options");
	var DEFAULT_CONFIG = { requireParentSpan: false };
	var RedisInstrumentation = class RedisInstrumentation extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
		}
		setConfig(config = {}) {
			super.setConfig(Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
		}
		init() {
			return [this._getInstrumentationNodeModuleDefinition("@redis/client"), this._getInstrumentationNodeModuleDefinition("@node-redis/client")];
		}
		_getInstrumentationNodeModuleDefinition(basePackageName) {
			const commanderModuleFile = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/commander.js`, ["^1.0.0"], (moduleExports, moduleVersion) => {
				const transformCommandArguments = moduleExports.transformCommandArguments;
				if (!transformCommandArguments) {
					this._diag.error("internal instrumentation error, missing transformCommandArguments function");
					return moduleExports;
				}
				const functionToPatch = (moduleVersion === null || moduleVersion === void 0 ? void 0 : moduleVersion.startsWith("1.0.")) ? "extendWithCommands" : "attachCommands";
				if ((0, instrumentation_1.isWrapped)(moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports[functionToPatch])) this._unwrap(moduleExports, functionToPatch);
				this._wrap(moduleExports, functionToPatch, this._getPatchExtendWithCommands(transformCommandArguments));
				return moduleExports;
			}, (moduleExports) => {
				if ((0, instrumentation_1.isWrapped)(moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.extendWithCommands)) this._unwrap(moduleExports, "extendWithCommands");
				if ((0, instrumentation_1.isWrapped)(moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.attachCommands)) this._unwrap(moduleExports, "attachCommands");
			});
			const multiCommanderModule = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/multi-command.js`, ["^1.0.0"], (moduleExports) => {
				var _a;
				const redisClientMultiCommandPrototype = (_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.default) === null || _a === void 0 ? void 0 : _a.prototype;
				if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype === null || redisClientMultiCommandPrototype === void 0 ? void 0 : redisClientMultiCommandPrototype.exec)) this._unwrap(redisClientMultiCommandPrototype, "exec");
				this._wrap(redisClientMultiCommandPrototype, "exec", this._getPatchMultiCommandsExec());
				if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype === null || redisClientMultiCommandPrototype === void 0 ? void 0 : redisClientMultiCommandPrototype.addCommand)) this._unwrap(redisClientMultiCommandPrototype, "addCommand");
				this._wrap(redisClientMultiCommandPrototype, "addCommand", this._getPatchMultiCommandsAddCommand());
				return moduleExports;
			}, (moduleExports) => {
				var _a;
				const redisClientMultiCommandPrototype = (_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.default) === null || _a === void 0 ? void 0 : _a.prototype;
				if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype === null || redisClientMultiCommandPrototype === void 0 ? void 0 : redisClientMultiCommandPrototype.exec)) this._unwrap(redisClientMultiCommandPrototype, "exec");
				if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype === null || redisClientMultiCommandPrototype === void 0 ? void 0 : redisClientMultiCommandPrototype.addCommand)) this._unwrap(redisClientMultiCommandPrototype, "addCommand");
			});
			const clientIndexModule = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/index.js`, ["^1.0.0"], (moduleExports) => {
				var _a;
				const redisClientPrototype = (_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.default) === null || _a === void 0 ? void 0 : _a.prototype;
				if (redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.multi) {
					if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.multi)) this._unwrap(redisClientPrototype, "multi");
					this._wrap(redisClientPrototype, "multi", this._getPatchRedisClientMulti());
				}
				if (redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.MULTI) {
					if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.MULTI)) this._unwrap(redisClientPrototype, "MULTI");
					this._wrap(redisClientPrototype, "MULTI", this._getPatchRedisClientMulti());
				}
				if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.sendCommand)) this._unwrap(redisClientPrototype, "sendCommand");
				this._wrap(redisClientPrototype, "sendCommand", this._getPatchRedisClientSendCommand());
				this._wrap(redisClientPrototype, "connect", this._getPatchedClientConnect());
				return moduleExports;
			}, (moduleExports) => {
				var _a;
				const redisClientPrototype = (_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.default) === null || _a === void 0 ? void 0 : _a.prototype;
				if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.multi)) this._unwrap(redisClientPrototype, "multi");
				if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.MULTI)) this._unwrap(redisClientPrototype, "MULTI");
				if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.sendCommand)) this._unwrap(redisClientPrototype, "sendCommand");
			});
			return new instrumentation_1.InstrumentationNodeModuleDefinition(basePackageName, ["^1.0.0"], (moduleExports) => {
				return moduleExports;
			}, () => {}, [
				commanderModuleFile,
				multiCommanderModule,
				clientIndexModule
			]);
		}
		_getPatchExtendWithCommands(transformCommandArguments) {
			const plugin = this;
			return function extendWithCommandsPatchWrapper(original) {
				return function extendWithCommandsPatch(config) {
					var _a;
					if (((_a = config === null || config === void 0 ? void 0 : config.BaseClass) === null || _a === void 0 ? void 0 : _a.name) !== "RedisClient") return original.apply(this, arguments);
					const origExecutor = config.executor;
					config.executor = function(command, args) {
						const redisCommandArguments = transformCommandArguments(command, args).args;
						return plugin._traceClientCommand(origExecutor, this, arguments, redisCommandArguments);
					};
					return original.apply(this, arguments);
				};
			};
		}
		_getPatchMultiCommandsExec() {
			const plugin = this;
			return function execPatchWrapper(original) {
				return function execPatch() {
					const execRes = original.apply(this, arguments);
					if (typeof (execRes === null || execRes === void 0 ? void 0 : execRes.then) !== "function") {
						plugin._diag.error("got non promise result when patching RedisClientMultiCommand.exec");
						return execRes;
					}
					return execRes.then((redisRes) => {
						const openSpans = this[OTEL_OPEN_SPANS];
						plugin._endSpansWithRedisReplies(openSpans, redisRes);
						return redisRes;
					}).catch((err) => {
						const openSpans = this[OTEL_OPEN_SPANS];
						if (!openSpans) plugin._diag.error("cannot find open spans to end for redis multi command");
						else {
							const replies = err.constructor.name === "MultiErrorReply" ? err.replies : new Array(openSpans.length).fill(err);
							plugin._endSpansWithRedisReplies(openSpans, replies);
						}
						return Promise.reject(err);
					});
				};
			};
		}
		_getPatchMultiCommandsAddCommand() {
			const plugin = this;
			return function addCommandWrapper(original) {
				return function addCommandPatch(args) {
					return plugin._traceClientCommand(original, this, arguments, args);
				};
			};
		}
		_getPatchRedisClientMulti() {
			return function multiPatchWrapper(original) {
				return function multiPatch() {
					const multiRes = original.apply(this, arguments);
					multiRes[MULTI_COMMAND_OPTIONS] = this.options;
					return multiRes;
				};
			};
		}
		_getPatchRedisClientSendCommand() {
			const plugin = this;
			return function sendCommandWrapper(original) {
				return function sendCommandPatch(args) {
					return plugin._traceClientCommand(original, this, arguments, args);
				};
			};
		}
		_getPatchedClientConnect() {
			const plugin = this;
			return function connectWrapper(original) {
				return function patchedConnect() {
					const options = this.options;
					const attributes = (0, utils_1.getClientAttributes)(plugin._diag, options);
					const span = plugin.tracer.startSpan(`${RedisInstrumentation.COMPONENT}-connect`, {
						kind: api_1.SpanKind.CLIENT,
						attributes
					});
					return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
						return original.apply(this);
					}).then((result) => {
						span.end();
						return result;
					}).catch((error) => {
						span.recordException(error);
						span.setStatus({
							code: api_1.SpanStatusCode.ERROR,
							message: error.message
						});
						span.end();
						return Promise.reject(error);
					});
				};
			};
		}
		_traceClientCommand(origFunction, origThis, origArguments, redisCommandArguments) {
			if (api_1.trace.getSpan(api_1.context.active()) === void 0 && this.getConfig().requireParentSpan) return origFunction.apply(origThis, origArguments);
			const clientOptions = origThis.options || origThis[MULTI_COMMAND_OPTIONS];
			const commandName = redisCommandArguments[0];
			const commandArgs = redisCommandArguments.slice(1);
			const dbStatementSerializer = this.getConfig().dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
			const attributes = (0, utils_1.getClientAttributes)(this._diag, clientOptions);
			try {
				const dbStatement = dbStatementSerializer(commandName, commandArgs);
				if (dbStatement != null) attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = dbStatement;
			} catch (e) {
				this._diag.error("dbStatementSerializer throw an exception", e, { commandName });
			}
			const span = this.tracer.startSpan(`${RedisInstrumentation.COMPONENT}-${commandName}`, {
				kind: api_1.SpanKind.CLIENT,
				attributes
			});
			const res = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
				return origFunction.apply(origThis, origArguments);
			});
			if (typeof (res === null || res === void 0 ? void 0 : res.then) === "function") res.then((redisRes) => {
				this._endSpanWithResponse(span, commandName, commandArgs, redisRes, void 0);
			}, (err) => {
				this._endSpanWithResponse(span, commandName, commandArgs, null, err);
			});
			else {
				const redisClientMultiCommand = res;
				redisClientMultiCommand[OTEL_OPEN_SPANS] = redisClientMultiCommand[OTEL_OPEN_SPANS] || [];
				redisClientMultiCommand[OTEL_OPEN_SPANS].push({
					span,
					commandName,
					commandArgs
				});
			}
			return res;
		}
		_endSpansWithRedisReplies(openSpans, replies) {
			if (!openSpans) return this._diag.error("cannot find open spans to end for redis multi command");
			if (replies.length !== openSpans.length) return this._diag.error("number of multi command spans does not match response from redis");
			for (let i = 0; i < openSpans.length; i++) {
				const { span, commandName, commandArgs } = openSpans[i];
				const currCommandRes = replies[i];
				const [res, err] = currCommandRes instanceof Error ? [null, currCommandRes] : [currCommandRes, void 0];
				this._endSpanWithResponse(span, commandName, commandArgs, res, err);
			}
		}
		_endSpanWithResponse(span, commandName, commandArgs, response, error) {
			const { responseHook } = this.getConfig();
			if (!error && responseHook) try {
				responseHook(span, commandName, commandArgs, response);
			} catch (err) {
				this._diag.error("responseHook throw an exception", err);
			}
			if (error) {
				span.recordException(error);
				span.setStatus({
					code: api_1.SpanStatusCode.ERROR,
					message: error === null || error === void 0 ? void 0 : error.message
				});
			}
			span.end();
		}
	};
	exports.RedisInstrumentation = RedisInstrumentation;
	RedisInstrumentation.COMPONENT = "redis";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-redis-4/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-redis-4/build/src/index.js
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
export { require_src as t };
