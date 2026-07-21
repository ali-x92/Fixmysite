import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-mysql/build/src/AttributeNames.js
var require_AttributeNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AttributeNames = void 0;
	(function(AttributeNames) {
		AttributeNames["MYSQL_VALUES"] = "db.mysql.values";
	})(exports.AttributeNames || (exports.AttributeNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getPoolName = exports.arrayStringifyHelper = exports.getSpanName = exports.getDbValues = exports.getDbStatement = exports.getConnectionAttributes = void 0;
	var semantic_conventions_1 = require_src$2();
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
	* @returns the database statement being executed.
	*/
	function getDbStatement(query) {
		if (typeof query === "string") return query;
		else return query.sql;
	}
	exports.getDbStatement = getDbStatement;
	function getDbValues(query, values) {
		if (typeof query === "string") return arrayStringifyHelper(values);
		else return arrayStringifyHelper(values || query.values);
	}
	exports.getDbValues = getDbValues;
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
	function arrayStringifyHelper(arr) {
		if (arr) return `[${arr.toString()}]`;
		return "";
	}
	exports.arrayStringifyHelper = arrayStringifyHelper;
	function getPoolName(pool) {
		const c = pool.config.connectionConfig;
		let poolName = "";
		poolName += c.host ? `host: '${c.host}', ` : "";
		poolName += c.port ? `port: ${c.port}, ` : "";
		poolName += c.database ? `database: '${c.database}', ` : "";
		poolName += c.user ? `user: '${c.user}'` : "";
		if (!c.user) poolName = poolName.substring(0, poolName.length - 2);
		return poolName.trim();
	}
	exports.getPoolName = getPoolName;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.45.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-mysql";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MySQLInstrumentation = void 0;
	var api_1 = require_src$1();
	var instrumentation_1 = (init_esm(), __toCommonJS(esm_exports));
	var semantic_conventions_1 = require_src$2();
	var AttributeNames_1 = require_AttributeNames();
	var utils_1 = require_utils();
	/** @knipignore */
	var version_1 = require_version();
	var MySQLInstrumentation = class MySQLInstrumentation extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
			this._setMetricInstruments();
		}
		setMeterProvider(meterProvider) {
			super.setMeterProvider(meterProvider);
			this._setMetricInstruments();
		}
		_setMetricInstruments() {
			this._connectionsUsage = this.meter.createUpDownCounter("db.client.connections.usage", {
				description: "The number of connections that are currently in state described by the state attribute.",
				unit: "{connection}"
			});
		}
		init() {
			return [new instrumentation_1.InstrumentationNodeModuleDefinition("mysql", [">=2.0.0 <3"], (moduleExports) => {
				if ((0, instrumentation_1.isWrapped)(moduleExports.createConnection)) this._unwrap(moduleExports, "createConnection");
				this._wrap(moduleExports, "createConnection", this._patchCreateConnection());
				if ((0, instrumentation_1.isWrapped)(moduleExports.createPool)) this._unwrap(moduleExports, "createPool");
				this._wrap(moduleExports, "createPool", this._patchCreatePool());
				if ((0, instrumentation_1.isWrapped)(moduleExports.createPoolCluster)) this._unwrap(moduleExports, "createPoolCluster");
				this._wrap(moduleExports, "createPoolCluster", this._patchCreatePoolCluster());
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports === void 0) return;
				this._unwrap(moduleExports, "createConnection");
				this._unwrap(moduleExports, "createPool");
				this._unwrap(moduleExports, "createPoolCluster");
			})];
		}
		_patchCreateConnection() {
			return (originalCreateConnection) => {
				const thisPlugin = this;
				return function createConnection(_connectionUri) {
					const originalResult = originalCreateConnection(...arguments);
					thisPlugin._wrap(originalResult, "query", thisPlugin._patchQuery(originalResult));
					return originalResult;
				};
			};
		}
		_patchCreatePool() {
			return (originalCreatePool) => {
				const thisPlugin = this;
				return function createPool(_config) {
					const pool = originalCreatePool(...arguments);
					thisPlugin._wrap(pool, "query", thisPlugin._patchQuery(pool));
					thisPlugin._wrap(pool, "getConnection", thisPlugin._patchGetConnection(pool));
					thisPlugin._wrap(pool, "end", thisPlugin._patchPoolEnd(pool));
					thisPlugin._setPoolcallbacks(pool, thisPlugin, "");
					return pool;
				};
			};
		}
		_patchPoolEnd(pool) {
			return (originalPoolEnd) => {
				const thisPlugin = this;
				return function end(callback) {
					const nAll = pool._allConnections.length;
					const nFree = pool._freeConnections.length;
					const nUsed = nAll - nFree;
					const poolName = (0, utils_1.getPoolName)(pool);
					thisPlugin._connectionsUsage.add(-nUsed, {
						state: "used",
						name: poolName
					});
					thisPlugin._connectionsUsage.add(-nFree, {
						state: "idle",
						name: poolName
					});
					originalPoolEnd.apply(pool, arguments);
				};
			};
		}
		_patchCreatePoolCluster() {
			return (originalCreatePoolCluster) => {
				const thisPlugin = this;
				return function createPool(_config) {
					const cluster = originalCreatePoolCluster(...arguments);
					thisPlugin._wrap(cluster, "getConnection", thisPlugin._patchGetConnection(cluster));
					thisPlugin._wrap(cluster, "add", thisPlugin._patchAdd(cluster));
					return cluster;
				};
			};
		}
		_patchAdd(cluster) {
			return (originalAdd) => {
				const thisPlugin = this;
				return function add(id, config) {
					if (!thisPlugin["_enabled"]) {
						thisPlugin._unwrap(cluster, "add");
						return originalAdd.apply(cluster, arguments);
					}
					originalAdd.apply(cluster, arguments);
					const nodes = cluster["_nodes"];
					if (nodes) {
						const pool = nodes[typeof id === "object" ? "CLUSTER::" + cluster._lastId : String(id)].pool;
						thisPlugin._setPoolcallbacks(pool, thisPlugin, id);
					}
				};
			};
		}
		_patchGetConnection(pool) {
			return (originalGetConnection) => {
				const thisPlugin = this;
				return function getConnection(arg1, arg2, arg3) {
					if (!thisPlugin["_enabled"]) {
						thisPlugin._unwrap(pool, "getConnection");
						return originalGetConnection.apply(pool, arguments);
					}
					if (arguments.length === 1 && typeof arg1 === "function") {
						const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg1);
						return originalGetConnection.call(pool, patchFn);
					}
					if (arguments.length === 2 && typeof arg2 === "function") {
						const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg2);
						return originalGetConnection.call(pool, arg1, patchFn);
					}
					if (arguments.length === 3 && typeof arg3 === "function") {
						const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg3);
						return originalGetConnection.call(pool, arg1, arg2, patchFn);
					}
					return originalGetConnection.apply(pool, arguments);
				};
			};
		}
		_getConnectionCallbackPatchFn(cb) {
			const thisPlugin = this;
			const activeContext = api_1.context.active();
			return function(err, connection) {
				if (connection) {
					if (!(0, instrumentation_1.isWrapped)(connection.query)) thisPlugin._wrap(connection, "query", thisPlugin._patchQuery(connection));
				}
				if (typeof cb === "function") api_1.context.with(activeContext, cb, this, err, connection);
			};
		}
		_patchQuery(connection) {
			return (originalQuery) => {
				const thisPlugin = this;
				return function query(query, _valuesOrCallback, _callback) {
					if (!thisPlugin["_enabled"]) {
						thisPlugin._unwrap(connection, "query");
						return originalQuery.apply(connection, arguments);
					}
					const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(query), {
						kind: api_1.SpanKind.CLIENT,
						attributes: Object.assign(Object.assign({}, MySQLInstrumentation.COMMON_ATTRIBUTES), (0, utils_1.getConnectionAttributes)(connection.config))
					});
					span.setAttribute(semantic_conventions_1.SEMATTRS_DB_STATEMENT, (0, utils_1.getDbStatement)(query));
					if (thisPlugin.getConfig().enhancedDatabaseReporting) {
						let values;
						if (Array.isArray(_valuesOrCallback)) values = _valuesOrCallback;
						else if (arguments[2]) values = [_valuesOrCallback];
						span.setAttribute(AttributeNames_1.AttributeNames.MYSQL_VALUES, (0, utils_1.getDbValues)(query, values));
					}
					const cbIndex = Array.from(arguments).findIndex((arg) => typeof arg === "function");
					const parentContext = api_1.context.active();
					if (cbIndex === -1) {
						const streamableQuery = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
							return originalQuery.apply(connection, arguments);
						});
						api_1.context.bind(parentContext, streamableQuery);
						return streamableQuery.on("error", (err) => span.setStatus({
							code: api_1.SpanStatusCode.ERROR,
							message: err.message
						})).on("end", () => {
							span.end();
						});
					} else {
						thisPlugin._wrap(arguments, cbIndex, thisPlugin._patchCallbackQuery(span, parentContext));
						return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
							return originalQuery.apply(connection, arguments);
						});
					}
				};
			};
		}
		_patchCallbackQuery(span, parentContext) {
			return (originalCallback) => {
				return function(err, results, fields) {
					if (err) span.setStatus({
						code: api_1.SpanStatusCode.ERROR,
						message: err.message
					});
					span.end();
					return api_1.context.with(parentContext, () => originalCallback(...arguments));
				};
			};
		}
		_setPoolcallbacks(pool, thisPlugin, id) {
			const poolName = id || (0, utils_1.getPoolName)(pool);
			pool.on("connection", (connection) => {
				thisPlugin._connectionsUsage.add(1, {
					state: "idle",
					name: poolName
				});
			});
			pool.on("acquire", (connection) => {
				thisPlugin._connectionsUsage.add(-1, {
					state: "idle",
					name: poolName
				});
				thisPlugin._connectionsUsage.add(1, {
					state: "used",
					name: poolName
				});
			});
			pool.on("release", (connection) => {
				thisPlugin._connectionsUsage.add(-1, {
					state: "used",
					name: poolName
				});
				thisPlugin._connectionsUsage.add(1, {
					state: "idle",
					name: poolName
				});
			});
		}
	};
	exports.MySQLInstrumentation = MySQLInstrumentation;
	MySQLInstrumentation.COMMON_ATTRIBUTES = { [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_MYSQL };
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-mysql/build/src/index.js
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
