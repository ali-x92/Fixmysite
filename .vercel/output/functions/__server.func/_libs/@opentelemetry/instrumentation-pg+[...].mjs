import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./core+[...].mjs";
import { n as init_esm$1, t as esm_exports$1 } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
import { n as require_src$3 } from "./instrumentation-mysql2+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/internal-types.js
var require_internal_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EVENT_LISTENERS_SET = void 0;
	exports.EVENT_LISTENERS_SET = Symbol("opentelemetry.instrumentation.pg.eventListenersSet");
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/enums/AttributeNames.js
var require_AttributeNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AttributeNames = void 0;
	(function(AttributeNames) {
		AttributeNames["PG_VALUES"] = "db.postgresql.values";
		AttributeNames["PG_PLAN"] = "db.postgresql.plan";
		AttributeNames["IDLE_TIMEOUT_MILLIS"] = "db.postgresql.idle.timeout.millis";
		AttributeNames["MAX_CLIENT"] = "db.postgresql.max.client";
	})(exports.AttributeNames || (exports.AttributeNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/semconv.js
var require_semconv = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.METRIC_DB_CLIENT_OPERATION_DURATION = exports.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = exports.METRIC_DB_CLIENT_CONNECTION_COUNT = exports.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = exports.DB_CLIENT_CONNECTION_STATE_VALUE_USED = exports.ATTR_DB_OPERATION_NAME = exports.ATTR_DB_NAMESPACE = exports.ATTR_DB_CLIENT_CONNECTION_STATE = exports.ATTR_DB_CLIENT_CONNECTION_POOL_NAME = void 0;
	/**
	* The name of the connection pool; unique within the instrumented application. In case the connection pool implementation doesn't provide a name, instrumentation **SHOULD** use a combination of parameters that would make the name unique, for example, combining attributes `server.address`, `server.port`, and `db.namespace`, formatted as `server.address:server.port/db.namespace`. Instrumentations that generate connection pool name following different patterns **SHOULD** document it.
	*
	* @example myDataSource
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_DB_CLIENT_CONNECTION_POOL_NAME = "db.client.connection.pool.name";
	/**
	* The state of a connection in the pool
	*
	* @example idle
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_DB_CLIENT_CONNECTION_STATE = "db.client.connection.state";
	/**
	* The name of the database, fully qualified within the server address and port.
	*
	* @example customers
	* @example test.users
	*
	* @note If a database system has multiple namespace components, they **SHOULD** be concatenated (potentially using database system specific conventions) from most general to most specific namespace component, and more specific namespaces **SHOULD NOT** be captured without the more general namespaces, to ensure that "startswith" queries for the more general namespaces will be valid.
	* Semantic conventions for individual database systems **SHOULD** document what `db.namespace` means in the context of that system.
	* It is **RECOMMENDED** to capture the value as provided by the application without attempting to do any case normalization.
	* This attribute has stability level RELEASE CANDIDATE.
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_DB_NAMESPACE = "db.namespace";
	/**
	* The name of the operation or command being executed.
	*
	* @example findAndModify
	* @example HMSET
	* @example SELECT
	*
	* @note It is **RECOMMENDED** to capture the value as provided by the application without attempting to do any case normalization.
	* If the operation name is parsed from the query text, it **SHOULD** be the first operation name found in the query.
	* For batch operations, if the individual operations are known to have the same operation name then that operation name **SHOULD** be used prepended by `BATCH `, otherwise `db.operation.name` **SHOULD** be `BATCH` or some other database system specific term if more applicable.
	* This attribute has stability level RELEASE CANDIDATE.
	*
	* @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.ATTR_DB_OPERATION_NAME = "db.operation.name";
	/**
	* Enum value "used" for attribute {@link ATTR_DB_CLIENT_CONNECTION_STATE}.
	*/
	exports.DB_CLIENT_CONNECTION_STATE_VALUE_USED = "used";
	/**
	* Enum value "idle" for attribute {@link ATTR_DB_CLIENT_CONNECTION_STATE}.
	*/
	exports.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = "idle";
	/**
	* The number of connections that are currently in state described by the `state` attribute
	*
	* @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.METRIC_DB_CLIENT_CONNECTION_COUNT = "db.client.connection.count";
	/**
	* The number of current pending requests for an open connection
	*
	* @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = "db.client.connection.pending_requests";
	/**
	* Duration of database client operations.
	*
	* @note Batch operations **SHOULD** be recorded as a single operation.
	*
	* @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
	*/
	exports.METRIC_DB_CLIENT_OPERATION_DURATION = "db.client.operation.duration";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/enums/SpanNames.js
var require_SpanNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SpanNames = void 0;
	(function(SpanNames) {
		SpanNames["QUERY_PREFIX"] = "pg.query";
		SpanNames["CONNECT"] = "pg.connect";
		SpanNames["POOL_CONNECT"] = "pg-pool.connect";
	})(exports.SpanNames || (exports.SpanNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isObjectWithTextString = exports.getErrorMessage = exports.patchClientConnectCallback = exports.patchCallbackPGPool = exports.updateCounter = exports.getPoolName = exports.patchCallback = exports.handleExecutionResult = exports.handleConfigQuery = exports.shouldSkipInstrumentation = exports.getSemanticAttributesFromPool = exports.getSemanticAttributesFromConnection = exports.getConnectionString = exports.parseNormalizedOperationName = exports.getQuerySpanName = void 0;
	var api_1 = require_src$1();
	var AttributeNames_1 = require_AttributeNames();
	var semantic_conventions_1 = require_src$2();
	var semconv_1 = require_semconv();
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	var SpanNames_1 = require_SpanNames();
	/**
	* Helper function to get a low cardinality span name from whatever info we have
	* about the query.
	*
	* This is tricky, because we don't have most of the information (table name,
	* operation name, etc) the spec recommends using to build a low-cardinality
	* value w/o parsing. So, we use db.name and assume that, if the query's a named
	* prepared statement, those `name` values will be low cardinality. If we don't
	* have a named prepared statement, we try to parse an operation (despite the
	* spec's warnings).
	*
	* @params dbName The name of the db against which this query is being issued,
	*   which could be missing if no db name was given at the time that the
	*   connection was established.
	* @params queryConfig Information we have about the query being issued, typed
	*   to reflect only the validation we've actually done on the args to
	*   `client.query()`. This will be undefined if `client.query()` was called
	*   with invalid arguments.
	*/
	function getQuerySpanName(dbName, queryConfig) {
		if (!queryConfig) return SpanNames_1.SpanNames.QUERY_PREFIX;
		const command = typeof queryConfig.name === "string" && queryConfig.name ? queryConfig.name : parseNormalizedOperationName(queryConfig.text);
		return `${SpanNames_1.SpanNames.QUERY_PREFIX}:${command}${dbName ? ` ${dbName}` : ""}`;
	}
	exports.getQuerySpanName = getQuerySpanName;
	function parseNormalizedOperationName(queryText) {
		const indexOfFirstSpace = queryText.indexOf(" ");
		let sqlCommand = indexOfFirstSpace === -1 ? queryText : queryText.slice(0, indexOfFirstSpace);
		sqlCommand = sqlCommand.toUpperCase();
		return sqlCommand.endsWith(";") ? sqlCommand.slice(0, -1) : sqlCommand;
	}
	exports.parseNormalizedOperationName = parseNormalizedOperationName;
	function getConnectionString(params) {
		return `postgresql://${params.host || "localhost"}:${params.port || 5432}/${params.database || ""}`;
	}
	exports.getConnectionString = getConnectionString;
	function getPort(port) {
		if (Number.isInteger(port)) return port;
	}
	function getSemanticAttributesFromConnection(params) {
		return {
			[semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_POSTGRESQL,
			[semantic_conventions_1.SEMATTRS_DB_NAME]: params.database,
			[semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getConnectionString(params),
			[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: params.host,
			[semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: getPort(params.port),
			[semantic_conventions_1.SEMATTRS_DB_USER]: params.user
		};
	}
	exports.getSemanticAttributesFromConnection = getSemanticAttributesFromConnection;
	function getSemanticAttributesFromPool(params) {
		return {
			[semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_POSTGRESQL,
			[semantic_conventions_1.SEMATTRS_DB_NAME]: params.database,
			[semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getConnectionString(params),
			[semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: params.host,
			[semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: getPort(params.port),
			[semantic_conventions_1.SEMATTRS_DB_USER]: params.user,
			[AttributeNames_1.AttributeNames.IDLE_TIMEOUT_MILLIS]: params.idleTimeoutMillis,
			[AttributeNames_1.AttributeNames.MAX_CLIENT]: params.maxClient
		};
	}
	exports.getSemanticAttributesFromPool = getSemanticAttributesFromPool;
	function shouldSkipInstrumentation(instrumentationConfig) {
		return instrumentationConfig.requireParentSpan === true && api_1.trace.getSpan(api_1.context.active()) === void 0;
	}
	exports.shouldSkipInstrumentation = shouldSkipInstrumentation;
	function handleConfigQuery(tracer, instrumentationConfig, queryConfig) {
		const { connectionParameters } = this;
		const dbName = connectionParameters.database;
		const spanName = getQuerySpanName(dbName, queryConfig);
		const span = tracer.startSpan(spanName, {
			kind: api_1.SpanKind.CLIENT,
			attributes: getSemanticAttributesFromConnection(connectionParameters)
		});
		if (!queryConfig) return span;
		if (queryConfig.text) span.setAttribute(semantic_conventions_1.SEMATTRS_DB_STATEMENT, queryConfig.text);
		if (instrumentationConfig.enhancedDatabaseReporting && Array.isArray(queryConfig.values)) try {
			const convertedValues = queryConfig.values.map((value) => {
				if (value == null) return "null";
				else if (value instanceof Buffer) return value.toString();
				else if (typeof value === "object") {
					if (typeof value.toPostgres === "function") return value.toPostgres();
					return JSON.stringify(value);
				} else return value.toString();
			});
			span.setAttribute(AttributeNames_1.AttributeNames.PG_VALUES, convertedValues);
		} catch (e) {
			api_1.diag.error("failed to stringify ", queryConfig.values, e);
		}
		if (typeof queryConfig.name === "string") span.setAttribute(AttributeNames_1.AttributeNames.PG_PLAN, queryConfig.name);
		return span;
	}
	exports.handleConfigQuery = handleConfigQuery;
	function handleExecutionResult(config, span, pgResult) {
		if (typeof config.responseHook === "function") (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
			config.responseHook(span, { data: pgResult });
		}, (err) => {
			if (err) api_1.diag.error("Error running response hook", err);
		}, true);
	}
	exports.handleExecutionResult = handleExecutionResult;
	function patchCallback(instrumentationConfig, span, cb, attributes, recordDuration) {
		return function patchedCallback(err, res) {
			if (err) {
				if (Object.prototype.hasOwnProperty.call(err, "code")) attributes[semantic_conventions_1.ATTR_ERROR_TYPE] = err["code"];
				span.setStatus({
					code: api_1.SpanStatusCode.ERROR,
					message: err.message
				});
			} else handleExecutionResult(instrumentationConfig, span, res);
			recordDuration();
			span.end();
			cb.call(this, err, res);
		};
	}
	exports.patchCallback = patchCallback;
	function getPoolName(pool) {
		let poolName = "";
		poolName += ((pool === null || pool === void 0 ? void 0 : pool.host) ? `${pool.host}` : "unknown_host") + ":";
		poolName += ((pool === null || pool === void 0 ? void 0 : pool.port) ? `${pool.port}` : "unknown_port") + "/";
		poolName += (pool === null || pool === void 0 ? void 0 : pool.database) ? `${pool.database}` : "unknown_database";
		return poolName.trim();
	}
	exports.getPoolName = getPoolName;
	function updateCounter(poolName, pool, connectionCount, connectionPendingRequests, latestCounter) {
		const all = pool.totalCount;
		const pending = pool.waitingCount;
		const idle = pool.idleCount;
		const used = all - idle;
		connectionCount.add(used - latestCounter.used, {
			[semconv_1.ATTR_DB_CLIENT_CONNECTION_STATE]: semconv_1.DB_CLIENT_CONNECTION_STATE_VALUE_USED,
			[semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
		});
		connectionCount.add(idle - latestCounter.idle, {
			[semconv_1.ATTR_DB_CLIENT_CONNECTION_STATE]: semconv_1.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE,
			[semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
		});
		connectionPendingRequests.add(pending - latestCounter.pending, { [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName });
		return {
			used,
			idle,
			pending
		};
	}
	exports.updateCounter = updateCounter;
	function patchCallbackPGPool(span, cb) {
		return function patchedCallback(err, res, done) {
			if (err) span.setStatus({
				code: api_1.SpanStatusCode.ERROR,
				message: err.message
			});
			span.end();
			cb.call(this, err, res, done);
		};
	}
	exports.patchCallbackPGPool = patchCallbackPGPool;
	function patchClientConnectCallback(span, cb) {
		return function patchedClientConnectCallback(err) {
			if (err) span.setStatus({
				code: api_1.SpanStatusCode.ERROR,
				message: err.message
			});
			span.end();
			cb.apply(this, arguments);
		};
	}
	exports.patchClientConnectCallback = patchClientConnectCallback;
	/**
	* Attempt to get a message string from a thrown value, while being quite
	* defensive, to recognize the fact that, in JS, any kind of value (even
	* primitives) can be thrown.
	*/
	function getErrorMessage(e) {
		return typeof e === "object" && e !== null && "message" in e ? String(e.message) : void 0;
	}
	exports.getErrorMessage = getErrorMessage;
	function isObjectWithTextString(it) {
		var _a;
		return typeof it === "object" && typeof ((_a = it) === null || _a === void 0 ? void 0 : _a.text) === "string";
	}
	exports.isObjectWithTextString = isObjectWithTextString;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.51.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-pg";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PgInstrumentation = void 0;
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	var api_1 = require_src$1();
	var internal_types_1 = require_internal_types();
	var utils = require_utils();
	var sql_common_1 = require_src$3();
	/** @knipignore */
	var version_1 = require_version();
	var SpanNames_1 = require_SpanNames();
	var core_1 = (init_esm(), __toCommonJS(esm_exports));
	var semantic_conventions_1 = require_src$2();
	var semconv_1 = require_semconv();
	function extractModuleExports(module$1) {
		return module$1[Symbol.toStringTag] === "Module" ? module$1.default : module$1;
	}
	var PgInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
			this._connectionsCounter = {
				used: 0,
				idle: 0,
				pending: 0
			};
		}
		_updateMetricInstruments() {
			this._operationDuration = this.meter.createHistogram(semconv_1.METRIC_DB_CLIENT_OPERATION_DURATION, {
				description: "Duration of database client operations.",
				unit: "s",
				valueType: api_1.ValueType.DOUBLE,
				advice: { explicitBucketBoundaries: [
					.001,
					.005,
					.01,
					.05,
					.1,
					.5,
					1,
					5,
					10
				] }
			});
			this._connectionsCounter = {
				idle: 0,
				pending: 0,
				used: 0
			};
			this._connectionsCount = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTION_COUNT, {
				description: "The number of connections that are currently in state described by the state attribute.",
				unit: "{connection}"
			});
			this._connectionPendingRequests = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS, {
				description: "The number of current pending requests for an open connection.",
				unit: "{connection}"
			});
		}
		init() {
			const SUPPORTED_PG_VERSIONS = [">=8.0.3 <9"];
			const modulePgNativeClient = new instrumentation_1.InstrumentationNodeModuleFile("pg/lib/native/client.js", SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
			const modulePgClient = new instrumentation_1.InstrumentationNodeModuleFile("pg/lib/client.js", SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
			return [new instrumentation_1.InstrumentationNodeModuleDefinition("pg", SUPPORTED_PG_VERSIONS, (module$2) => {
				const moduleExports = extractModuleExports(module$2);
				this._patchPgClient(moduleExports.Client);
				return module$2;
			}, (module$3) => {
				const moduleExports = extractModuleExports(module$3);
				this._unpatchPgClient(moduleExports.Client);
				return module$3;
			}, [modulePgClient, modulePgNativeClient]), new instrumentation_1.InstrumentationNodeModuleDefinition("pg-pool", [">=2.0.0 <4"], (moduleExports) => {
				if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
				this._wrap(moduleExports.prototype, "connect", this._getPoolConnectPatch());
				return moduleExports;
			}, (moduleExports) => {
				if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
			})];
		}
		_patchPgClient(module$4) {
			if (!module$4) return;
			const moduleExports = extractModuleExports(module$4);
			if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.query)) this._unwrap(moduleExports.prototype, "query");
			if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
			this._wrap(moduleExports.prototype, "query", this._getClientQueryPatch());
			this._wrap(moduleExports.prototype, "connect", this._getClientConnectPatch());
			return module$4;
		}
		_unpatchPgClient(module$5) {
			const moduleExports = extractModuleExports(module$5);
			if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.query)) this._unwrap(moduleExports.prototype, "query");
			if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) this._unwrap(moduleExports.prototype, "connect");
			return module$5;
		}
		_getClientConnectPatch() {
			const plugin = this;
			return (original) => {
				return function connect(callback) {
					if (utils.shouldSkipInstrumentation(plugin.getConfig())) return original.call(this, callback);
					const span = plugin.tracer.startSpan(SpanNames_1.SpanNames.CONNECT, {
						kind: api_1.SpanKind.CLIENT,
						attributes: utils.getSemanticAttributesFromConnection(this)
					});
					if (callback) {
						const parentSpan = api_1.trace.getSpan(api_1.context.active());
						callback = utils.patchClientConnectCallback(span, callback);
						if (parentSpan) callback = api_1.context.bind(api_1.context.active(), callback);
					}
					return handleConnectResult(span, api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
						return original.call(this, callback);
					}));
				};
			};
		}
		recordOperationDuration(attributes, startTime) {
			const metricsAttributes = {};
			[
				semantic_conventions_1.SEMATTRS_DB_SYSTEM,
				semconv_1.ATTR_DB_NAMESPACE,
				semantic_conventions_1.ATTR_ERROR_TYPE,
				semantic_conventions_1.ATTR_SERVER_PORT,
				semantic_conventions_1.ATTR_SERVER_ADDRESS,
				semconv_1.ATTR_DB_OPERATION_NAME
			].forEach((key) => {
				if (key in attributes) metricsAttributes[key] = attributes[key];
			});
			const durationSeconds = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)())) / 1e3;
			this._operationDuration.record(durationSeconds, metricsAttributes);
		}
		_getClientQueryPatch() {
			const plugin = this;
			return (original) => {
				this._diag.debug("Patching pg.Client.prototype.query");
				return function query(...args) {
					if (utils.shouldSkipInstrumentation(plugin.getConfig())) return original.apply(this, args);
					const startTime = (0, core_1.hrTime)();
					const arg0 = args[0];
					const firstArgIsString = typeof arg0 === "string";
					const firstArgIsQueryObjectWithText = utils.isObjectWithTextString(arg0);
					const queryConfig = firstArgIsString ? {
						text: arg0,
						values: Array.isArray(args[1]) ? args[1] : void 0
					} : firstArgIsQueryObjectWithText ? arg0 : void 0;
					const attributes = {
						[semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_POSTGRESQL,
						[semconv_1.ATTR_DB_NAMESPACE]: this.database,
						[semantic_conventions_1.ATTR_SERVER_PORT]: this.connectionParameters.port,
						[semantic_conventions_1.ATTR_SERVER_ADDRESS]: this.connectionParameters.host
					};
					if (queryConfig === null || queryConfig === void 0 ? void 0 : queryConfig.text) attributes[semconv_1.ATTR_DB_OPERATION_NAME] = utils.parseNormalizedOperationName(queryConfig === null || queryConfig === void 0 ? void 0 : queryConfig.text);
					const recordDuration = () => {
						plugin.recordOperationDuration(attributes, startTime);
					};
					const instrumentationConfig = plugin.getConfig();
					const span = utils.handleConfigQuery.call(this, plugin.tracer, instrumentationConfig, queryConfig);
					if (instrumentationConfig.addSqlCommenterCommentToQueries) {
						if (firstArgIsString) args[0] = (0, sql_common_1.addSqlCommenterComment)(span, arg0);
						else if (firstArgIsQueryObjectWithText && !("name" in arg0)) args[0] = Object.assign(Object.assign({}, arg0), { text: (0, sql_common_1.addSqlCommenterComment)(span, arg0.text) });
					}
					if (args.length > 0) {
						const parentSpan = api_1.trace.getSpan(api_1.context.active());
						if (typeof args[args.length - 1] === "function") {
							args[args.length - 1] = utils.patchCallback(instrumentationConfig, span, args[args.length - 1], attributes, recordDuration);
							if (parentSpan) args[args.length - 1] = api_1.context.bind(api_1.context.active(), args[args.length - 1]);
						} else if (typeof (queryConfig === null || queryConfig === void 0 ? void 0 : queryConfig.callback) === "function") {
							let callback = utils.patchCallback(plugin.getConfig(), span, queryConfig.callback, attributes, recordDuration);
							if (parentSpan) callback = api_1.context.bind(api_1.context.active(), callback);
							args[0].callback = callback;
						}
					}
					const { requestHook } = instrumentationConfig;
					if (typeof requestHook === "function" && queryConfig) (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
						const { database, host, port, user } = this.connectionParameters;
						requestHook(span, {
							connection: {
								database,
								host,
								port,
								user
							},
							query: {
								text: queryConfig.text,
								values: queryConfig.values,
								name: queryConfig.name
							}
						});
					}, (err) => {
						if (err) plugin._diag.error("Error running query hook", err);
					}, true);
					let result;
					try {
						result = original.apply(this, args);
					} catch (e) {
						span.setStatus({
							code: api_1.SpanStatusCode.ERROR,
							message: utils.getErrorMessage(e)
						});
						span.end();
						throw e;
					}
					if (result instanceof Promise) return result.then((result) => {
						return new Promise((resolve) => {
							utils.handleExecutionResult(plugin.getConfig(), span, result);
							recordDuration();
							span.end();
							resolve(result);
						});
					}).catch((error) => {
						return new Promise((_, reject) => {
							span.setStatus({
								code: api_1.SpanStatusCode.ERROR,
								message: error.message
							});
							recordDuration();
							span.end();
							reject(error);
						});
					});
					return result;
				};
			};
		}
		_setPoolConnectEventListeners(pgPool) {
			if (pgPool[internal_types_1.EVENT_LISTENERS_SET]) return;
			const poolName = utils.getPoolName(pgPool.options);
			pgPool.on("connect", () => {
				this._connectionsCounter = utils.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
			});
			pgPool.on("acquire", () => {
				this._connectionsCounter = utils.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
			});
			pgPool.on("remove", () => {
				this._connectionsCounter = utils.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
			});
			pgPool.on("release", () => {
				this._connectionsCounter = utils.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
			});
			pgPool[internal_types_1.EVENT_LISTENERS_SET] = true;
		}
		_getPoolConnectPatch() {
			const plugin = this;
			return (originalConnect) => {
				return function connect(callback) {
					if (utils.shouldSkipInstrumentation(plugin.getConfig())) return originalConnect.call(this, callback);
					const span = plugin.tracer.startSpan(SpanNames_1.SpanNames.POOL_CONNECT, {
						kind: api_1.SpanKind.CLIENT,
						attributes: utils.getSemanticAttributesFromPool(this.options)
					});
					plugin._setPoolConnectEventListeners(this);
					if (callback) {
						const parentSpan = api_1.trace.getSpan(api_1.context.active());
						callback = utils.patchCallbackPGPool(span, callback);
						if (parentSpan) callback = api_1.context.bind(api_1.context.active(), callback);
					}
					return handleConnectResult(span, api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
						return originalConnect.call(this, callback);
					}));
				};
			};
		}
	};
	exports.PgInstrumentation = PgInstrumentation;
	function handleConnectResult(span, connectResult) {
		if (!(connectResult instanceof Promise)) return connectResult;
		const connectResultPromise = connectResult;
		return api_1.context.bind(api_1.context.active(), connectResultPromise.then((result) => {
			span.end();
			return result;
		}).catch((error) => {
			span.setStatus({
				code: api_1.SpanStatusCode.ERROR,
				message: utils.getErrorMessage(error)
			});
			span.end();
			return Promise.reject(error);
		}));
	}
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-pg/build/src/index.js
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
