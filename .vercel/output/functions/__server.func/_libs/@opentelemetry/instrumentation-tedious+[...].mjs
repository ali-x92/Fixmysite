import { a as __toCommonJS, i as __require, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-tedious/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.once = exports.getSpanName = void 0;
	/**
	* The span name SHOULD be set to a low cardinality value
	* representing the statement executed on the database.
	*
	* @returns Operation executed on Tedious Connection. Does not map to SQL statement in any way.
	*/
	function getSpanName(operation, db, sql, bulkLoadTable) {
		if (operation === "execBulkLoad" && bulkLoadTable && db) return `${operation} ${bulkLoadTable} ${db}`;
		if (operation === "callProcedure") {
			if (db) return `${operation} ${sql} ${db}`;
			return `${operation} ${sql}`;
		}
		if (db) return `${operation} ${db}`;
		return `${operation}`;
	}
	exports.getSpanName = getSpanName;
	var once = (fn) => {
		let called = false;
		return (...args) => {
			if (called) return;
			called = true;
			return fn(...args);
		};
	};
	exports.once = once;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-tedious/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.18.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-tedious";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-tedious/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TediousInstrumentation = void 0;
	var api = require_src$1();
	var events_1 = __require("events");
	var instrumentation_1 = (init_esm(), __toCommonJS(esm_exports));
	var semantic_conventions_1 = require_src$2();
	var utils_1 = require_utils();
	/** @knipignore */
	var version_1 = require_version();
	var CURRENT_DATABASE = Symbol("opentelemetry.instrumentation-tedious.current-database");
	var PATCHED_METHODS = [
		"callProcedure",
		"execSql",
		"execSqlBatch",
		"execBulkLoad",
		"prepare",
		"execute"
	];
	function setDatabase(databaseName) {
		Object.defineProperty(this, CURRENT_DATABASE, {
			value: databaseName,
			writable: true
		});
	}
	var TediousInstrumentation = class TediousInstrumentation extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			return [new instrumentation_1.InstrumentationNodeModuleDefinition(TediousInstrumentation.COMPONENT, [">=1.11.0 <20"], (moduleExports) => {
				const ConnectionPrototype = moduleExports.Connection.prototype;
				for (const method of PATCHED_METHODS) {
					if ((0, instrumentation_1.isWrapped)(ConnectionPrototype[method])) this._unwrap(ConnectionPrototype, method);
					this._wrap(ConnectionPrototype, method, this._patchQuery(method));
				}
				if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.connect)) this._unwrap(ConnectionPrototype, "connect");
				this._wrap(ConnectionPrototype, "connect", this._patchConnect);
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports === void 0) return;
				const ConnectionPrototype = moduleExports.Connection.prototype;
				for (const method of PATCHED_METHODS) this._unwrap(ConnectionPrototype, method);
				this._unwrap(ConnectionPrototype, "connect");
			})];
		}
		_patchConnect(original) {
			return function patchedConnect() {
				var _a, _b;
				setDatabase.call(this, (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.database);
				this.removeListener("databaseChange", setDatabase);
				this.on("databaseChange", setDatabase);
				this.once("end", () => {
					this.removeListener("databaseChange", setDatabase);
				});
				return original.apply(this, arguments);
			};
		}
		_patchQuery(operation) {
			return (originalMethod) => {
				const thisPlugin = this;
				function patchedMethod(request) {
					var _a, _b, _c, _d, _e, _f, _g, _h;
					if (!(request instanceof events_1.EventEmitter)) {
						thisPlugin._diag.warn(`Unexpected invocation of patched ${operation} method. Span not recorded`);
						return originalMethod.apply(this, arguments);
					}
					let procCount = 0;
					let statementCount = 0;
					const incrementStatementCount = () => statementCount++;
					const incrementProcCount = () => procCount++;
					const databaseName = this[CURRENT_DATABASE];
					const sql = ((request) => {
						var _a, _b;
						if (request.sqlTextOrProcedure === "sp_prepare" && ((_b = (_a = request.parametersByName) === null || _a === void 0 ? void 0 : _a.stmt) === null || _b === void 0 ? void 0 : _b.value)) return request.parametersByName.stmt.value;
						return request.sqlTextOrProcedure;
					})(request);
					const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(operation, databaseName, sql, request.table), {
						kind: api.SpanKind.CLIENT,
						attributes: {
							[semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_MSSQL,
							[semantic_conventions_1.SEMATTRS_DB_NAME]: databaseName,
							[semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.port,
							[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: (_c = this.config) === null || _c === void 0 ? void 0 : _c.server,
							[semantic_conventions_1.SEMATTRS_DB_USER]: (_e = (_d = this.config) === null || _d === void 0 ? void 0 : _d.userName) !== null && _e !== void 0 ? _e : (_h = (_g = (_f = this.config) === null || _f === void 0 ? void 0 : _f.authentication) === null || _g === void 0 ? void 0 : _g.options) === null || _h === void 0 ? void 0 : _h.userName,
							[semantic_conventions_1.SEMATTRS_DB_STATEMENT]: sql,
							[semantic_conventions_1.SEMATTRS_DB_SQL_TABLE]: request.table
						}
					});
					const endSpan = (0, utils_1.once)((err) => {
						request.removeListener("done", incrementStatementCount);
						request.removeListener("doneInProc", incrementStatementCount);
						request.removeListener("doneProc", incrementProcCount);
						request.removeListener("error", endSpan);
						this.removeListener("end", endSpan);
						span.setAttribute("tedious.procedure_count", procCount);
						span.setAttribute("tedious.statement_count", statementCount);
						if (err) span.setStatus({
							code: api.SpanStatusCode.ERROR,
							message: err.message
						});
						span.end();
					});
					request.on("done", incrementStatementCount);
					request.on("doneInProc", incrementStatementCount);
					request.on("doneProc", incrementProcCount);
					request.once("error", endSpan);
					this.on("end", endSpan);
					if (typeof request.callback === "function") thisPlugin._wrap(request, "callback", thisPlugin._patchCallbackQuery(endSpan));
					else thisPlugin._diag.error("Expected request.callback to be a function");
					return api.context.with(api.trace.setSpan(api.context.active(), span), originalMethod, this, ...arguments);
				}
				Object.defineProperty(patchedMethod, "length", {
					value: originalMethod.length,
					writable: false
				});
				return patchedMethod;
			};
		}
		_patchCallbackQuery(endSpan) {
			return (originalCallback) => {
				return function(err, rowCount, rows) {
					endSpan(err);
					return originalCallback.apply(this, arguments);
				};
			};
		}
	};
	exports.TediousInstrumentation = TediousInstrumentation;
	TediousInstrumentation.COMPONENT = "tedious";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-tedious/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-tedious/build/src/index.js
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
