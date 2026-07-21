import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$2 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./core+[...].mjs";
import { n as init_esm$1, t as esm_exports$1 } from "./instrumentation+[...].mjs";
import { n as require_src$3 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/sql-common/build/src/index.js
var require_src$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.addSqlCommenterComment = void 0;
	var api_1 = require_src$2();
	var core_1 = (init_esm(), __toCommonJS(esm_exports));
	function hasValidSqlComment(query) {
		const indexOpeningDashDashComment = query.indexOf("--");
		if (indexOpeningDashDashComment >= 0) return true;
		if (query.indexOf("/*") < 0) return false;
		return indexOpeningDashDashComment < query.indexOf("*/");
	}
	function fixedEncodeURIComponent(str) {
		return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
	}
	function addSqlCommenterComment(span, query) {
		if (typeof query !== "string" || query.length === 0) return query;
		if (hasValidSqlComment(query)) return query;
		const propagator = new core_1.W3CTraceContextPropagator();
		const headers = {};
		propagator.inject(api_1.trace.setSpan(api_1.ROOT_CONTEXT, span), headers, api_1.defaultTextMapSetter);
		const sortedKeys = Object.keys(headers).sort();
		if (sortedKeys.length === 0) return query;
		return `${query} /*${sortedKeys.map((key) => {
			return `${key}='${fixedEncodeURIComponent(headers[key])}'`;
		}).join(",")}*/`;
	}
	exports.addSqlCommenterComment = addSqlCommenterComment;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql2/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getConnectionPrototypeToInstrument = exports.once = exports.getSpanName = exports.getDbStatement = exports.getConnectionAttributes = void 0;
	var semantic_conventions_1 = require_src$3();
	/**
	* Get an Attributes map from a mysql connection config object
	*
	* @param config ConnectionConfig
	*/
	function getConnectionAttributes(config) {
		const { host, port, database, user } = getConfig(config);
		const portNumber = parseInt(port, 10);
		if (!isNaN(portNumber)) return {
			[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
			[semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: portNumber,
			[semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
			[semantic_conventions_1.SEMATTRS_DB_NAME]: database,
			[semantic_conventions_1.SEMATTRS_DB_USER]: user
		};
		return {
			[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
			[semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
			[semantic_conventions_1.SEMATTRS_DB_NAME]: database,
			[semantic_conventions_1.SEMATTRS_DB_USER]: user
		};
	}
	exports.getConnectionAttributes = getConnectionAttributes;
	function getConfig(config) {
		const { host, port, database, user } = config && config.connectionConfig || config || {};
		return {
			host,
			port,
			database,
			user
		};
	}
	function getJDBCString(host, port, database) {
		let jdbcString = `jdbc:mysql://${host || "localhost"}`;
		if (typeof port === "number") jdbcString += `:${port}`;
		if (typeof database === "string") jdbcString += `/${database}`;
		return jdbcString;
	}
	/**
	* Conjures up the value for the db.statement attribute by formatting a SQL query.
	*
	* @returns the database statement being executed.
	*/
	function getDbStatement(query, format, values) {
		if (!format) return typeof query === "string" ? query : query.sql;
		if (typeof query === "string") return values ? format(query, values) : query;
		else return values || query.values ? format(query.sql, values || query.values) : query.sql;
	}
	exports.getDbStatement = getDbStatement;
	/**
	* The span name SHOULD be set to a low cardinality value
	* representing the statement executed on the database.
	*
	* @returns SQL statement without variable arguments or SQL verb
	*/
	function getSpanName(query) {
		const rawQuery = typeof query === "object" ? query.sql : query;
		const firstSpace = rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.indexOf(" ");
		if (typeof firstSpace === "number" && firstSpace !== -1) return rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.substring(0, firstSpace);
		return rawQuery;
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
	function getConnectionPrototypeToInstrument(connection) {
		const connectionPrototype = connection.prototype;
		const basePrototype = Object.getPrototypeOf(connectionPrototype);
		if (typeof (basePrototype === null || basePrototype === void 0 ? void 0 : basePrototype.query) === "function" && typeof (basePrototype === null || basePrototype === void 0 ? void 0 : basePrototype.execute) === "function") return basePrototype;
		return connectionPrototype;
	}
	exports.getConnectionPrototypeToInstrument = getConnectionPrototypeToInstrument;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql2/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.45.2";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-mysql2";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql2/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MySQL2Instrumentation = void 0;
	var api = require_src$2();
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	var semantic_conventions_1 = require_src$3();
	var sql_common_1 = require_src$1();
	var utils_1 = require_utils();
	/** @knipignore */
	var version_1 = require_version();
	var supportedVersions = [">=1.4.2 <4"];
	var MySQL2Instrumentation = class MySQL2Instrumentation extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			let format;
			function setFormatFunction(moduleExports) {
				if (!format && moduleExports.format) format = moduleExports.format;
			}
			const patch = (ConnectionPrototype) => {
				if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.query)) this._unwrap(ConnectionPrototype, "query");
				this._wrap(ConnectionPrototype, "query", this._patchQuery(format, false));
				if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.execute)) this._unwrap(ConnectionPrototype, "execute");
				this._wrap(ConnectionPrototype, "execute", this._patchQuery(format, true));
			};
			const unpatch = (ConnectionPrototype) => {
				this._unwrap(ConnectionPrototype, "query");
				this._unwrap(ConnectionPrototype, "execute");
			};
			return [new instrumentation_1.InstrumentationNodeModuleDefinition("mysql2", supportedVersions, (moduleExports) => {
				setFormatFunction(moduleExports);
				return moduleExports;
			}, () => {}, [new instrumentation_1.InstrumentationNodeModuleFile("mysql2/promise.js", supportedVersions, (moduleExports) => {
				setFormatFunction(moduleExports);
				return moduleExports;
			}, () => {}), new instrumentation_1.InstrumentationNodeModuleFile("mysql2/lib/connection.js", supportedVersions, (moduleExports) => {
				const ConnectionPrototype = (0, utils_1.getConnectionPrototypeToInstrument)(moduleExports);
				patch(ConnectionPrototype);
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports === void 0) return;
				const ConnectionPrototype = (0, utils_1.getConnectionPrototypeToInstrument)(moduleExports);
				unpatch(ConnectionPrototype);
			})])];
		}
		_patchQuery(format, isPrepared) {
			return (originalQuery) => {
				const thisPlugin = this;
				return function query(query, _valuesOrCallback, _callback) {
					let values;
					if (Array.isArray(_valuesOrCallback)) values = _valuesOrCallback;
					else if (arguments[2]) values = [_valuesOrCallback];
					const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(query), {
						kind: api.SpanKind.CLIENT,
						attributes: Object.assign(Object.assign(Object.assign({}, MySQL2Instrumentation.COMMON_ATTRIBUTES), (0, utils_1.getConnectionAttributes)(this.config)), { [semantic_conventions_1.SEMATTRS_DB_STATEMENT]: (0, utils_1.getDbStatement)(query, format, values) })
					});
					if (!isPrepared && thisPlugin.getConfig().addSqlCommenterCommentToQueries) arguments[0] = query = typeof query === "string" ? (0, sql_common_1.addSqlCommenterComment)(span, query) : Object.assign(query, { sql: (0, sql_common_1.addSqlCommenterComment)(span, query.sql) });
					const endSpan = (0, utils_1.once)((err, results) => {
						if (err) span.setStatus({
							code: api.SpanStatusCode.ERROR,
							message: err.message
						});
						else {
							const { responseHook } = thisPlugin.getConfig();
							if (typeof responseHook === "function") (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
								responseHook(span, { queryResults: results });
							}, (err) => {
								if (err) thisPlugin._diag.warn("Failed executing responseHook", err);
							}, true);
						}
						span.end();
					});
					if (arguments.length === 1) {
						if (typeof query.onResult === "function") thisPlugin._wrap(query, "onResult", thisPlugin._patchCallbackQuery(endSpan));
						const streamableQuery = originalQuery.apply(this, arguments);
						streamableQuery.once("error", (err) => {
							endSpan(err);
						}).once("result", (results) => {
							endSpan(void 0, results);
						});
						return streamableQuery;
					}
					if (typeof arguments[1] === "function") thisPlugin._wrap(arguments, 1, thisPlugin._patchCallbackQuery(endSpan));
					else if (typeof arguments[2] === "function") thisPlugin._wrap(arguments, 2, thisPlugin._patchCallbackQuery(endSpan));
					return originalQuery.apply(this, arguments);
				};
			};
		}
		_patchCallbackQuery(endSpan) {
			return (originalCallback) => {
				return function(err, results, fields) {
					endSpan(err, results);
					return originalCallback(...arguments);
				};
			};
		}
	};
	exports.MySQL2Instrumentation = MySQL2Instrumentation;
	MySQL2Instrumentation.COMMON_ATTRIBUTES = { [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_MYSQL };
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql2/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql2/build/src/index.js
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
