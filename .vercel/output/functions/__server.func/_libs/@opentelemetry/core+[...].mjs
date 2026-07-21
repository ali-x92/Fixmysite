import { n as __esmMin, o as __toESM, r as __exportAll, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { performance } from "perf_hooks";
//#region node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js
function suppressTracing(context) {
	return context.setValue(SUPPRESS_TRACING_KEY, true);
}
function unsuppressTracing(context) {
	return context.deleteValue(SUPPRESS_TRACING_KEY);
}
function isTracingSuppressed(context) {
	return context.getValue(SUPPRESS_TRACING_KEY) === true;
}
var import_src$14, SUPPRESS_TRACING_KEY;
var init_suppress_tracing = __esmMin((() => {
	import_src$14 = /* @__PURE__ */ __toESM(require_src$1());
	SUPPRESS_TRACING_KEY = (0, import_src$14.createContextKey)("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
})), BAGGAGE_HEADER, BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
var init_constants = __esmMin((() => {
	BAGGAGE_HEADER = "baggage";
	BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/baggage/utils.js
function serializeKeyPairs(keyPairs) {
	return keyPairs.reduce(function(hValue, current) {
		var value = "" + hValue + (hValue !== "" ? "," : "") + current;
		return value.length > 8192 ? hValue : value;
	}, "");
}
function getKeyPairs(baggage) {
	return baggage.getAllEntries().map(function(_a) {
		var _b = __read$2(_a, 2), key = _b[0], value = _b[1];
		var entry = encodeURIComponent(key) + "=" + encodeURIComponent(value.value);
		if (value.metadata !== void 0) entry += ";" + value.metadata.toString();
		return entry;
	});
}
function parsePairKeyValue(entry) {
	var valueProps = entry.split(";");
	if (valueProps.length <= 0) return;
	var keyPairPart = valueProps.shift();
	if (!keyPairPart) return;
	var separatorIndex = keyPairPart.indexOf("=");
	if (separatorIndex <= 0) return;
	var key = decodeURIComponent(keyPairPart.substring(0, separatorIndex).trim());
	var value = decodeURIComponent(keyPairPart.substring(separatorIndex + 1).trim());
	var metadata;
	if (valueProps.length > 0) metadata = (0, import_src$13.baggageEntryMetadataFromString)(valueProps.join(";"));
	return {
		key,
		value,
		metadata
	};
}
/**
* Parse a string serialized in the baggage HTTP Format (without metadata):
* https://github.com/w3c/baggage/blob/master/baggage/HTTP_HEADER_FORMAT.md
*/
function parseKeyPairsIntoRecord(value) {
	if (typeof value !== "string" || value.length === 0) return {};
	return value.split(",").map(function(entry) {
		return parsePairKeyValue(entry);
	}).filter(function(keyPair) {
		return keyPair !== void 0 && keyPair.value.length > 0;
	}).reduce(function(headers, keyPair) {
		headers[keyPair.key] = keyPair.value;
		return headers;
	}, {});
}
var import_src$13, __read$2;
var init_utils = __esmMin((() => {
	import_src$13 = /* @__PURE__ */ __toESM(require_src$1());
	init_constants();
	__read$2 = function(o, n) {
		var m = typeof Symbol === "function" && o[Symbol.iterator];
		if (!m) return o;
		var i = m.call(o), r, ar = [], e;
		try {
			while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
		} catch (error) {
			e = { error };
		} finally {
			try {
				if (r && !r.done && (m = i["return"])) m.call(i);
			} finally {
				if (e) throw e.error;
			}
		}
		return ar;
	};
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/baggage/propagation/W3CBaggagePropagator.js
var import_src$12, W3CBaggagePropagator;
var init_W3CBaggagePropagator = __esmMin((() => {
	import_src$12 = /* @__PURE__ */ __toESM(require_src$1());
	init_suppress_tracing();
	init_constants();
	init_utils();
	W3CBaggagePropagator = function() {
		function W3CBaggagePropagator() {}
		W3CBaggagePropagator.prototype.inject = function(context, carrier, setter) {
			var baggage = import_src$12.propagation.getBaggage(context);
			if (!baggage || isTracingSuppressed(context)) return;
			var headerValue = serializeKeyPairs(getKeyPairs(baggage).filter(function(pair) {
				return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
			}).slice(0, 180));
			if (headerValue.length > 0) setter.set(carrier, BAGGAGE_HEADER, headerValue);
		};
		W3CBaggagePropagator.prototype.extract = function(context, carrier, getter) {
			var headerValue = getter.get(carrier, BAGGAGE_HEADER);
			var baggageString = Array.isArray(headerValue) ? headerValue.join(",") : headerValue;
			if (!baggageString) return context;
			var baggage = {};
			if (baggageString.length === 0) return context;
			baggageString.split(",").forEach(function(entry) {
				var keyPair = parsePairKeyValue(entry);
				if (keyPair) {
					var baggageEntry = { value: keyPair.value };
					if (keyPair.metadata) baggageEntry.metadata = keyPair.metadata;
					baggage[keyPair.key] = baggageEntry;
				}
			});
			if (Object.entries(baggage).length === 0) return context;
			return import_src$12.propagation.setBaggage(context, import_src$12.propagation.createBaggage(baggage));
		};
		W3CBaggagePropagator.prototype.fields = function() {
			return [BAGGAGE_HEADER];
		};
		return W3CBaggagePropagator;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/common/anchored-clock.js
var AnchoredClock;
var init_anchored_clock = __esmMin((() => {
	AnchoredClock = function() {
		/**
		* Create a new AnchoredClock anchored to the current time returned by systemClock.
		*
		* @param systemClock should be a clock that returns the number of milliseconds since January 1 1970 such as Date
		* @param monotonicClock should be a clock that counts milliseconds monotonically such as window.performance or perf_hooks.performance
		*/
		function AnchoredClock(systemClock, monotonicClock) {
			this._monotonicClock = monotonicClock;
			this._epochMillis = systemClock.now();
			this._performanceMillis = monotonicClock.now();
		}
		/**
		* Returns the current time by adding the number of milliseconds since the
		* AnchoredClock was created to the creation epoch time
		*/
		AnchoredClock.prototype.now = function() {
			var delta = this._monotonicClock.now() - this._performanceMillis;
			return this._epochMillis + delta;
		};
		return AnchoredClock;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/common/attributes.js
function sanitizeAttributes(attributes) {
	var e_1, _a;
	var out = {};
	if (typeof attributes !== "object" || attributes == null) return out;
	try {
		for (var _b = __values$2(Object.entries(attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
			var _d = __read$1(_c.value, 2), key = _d[0], val = _d[1];
			if (!isAttributeKey(key)) {
				import_src$11.diag.warn("Invalid attribute key: " + key);
				continue;
			}
			if (!isAttributeValue(val)) {
				import_src$11.diag.warn("Invalid attribute value set for key: " + key);
				continue;
			}
			if (Array.isArray(val)) out[key] = val.slice();
			else out[key] = val;
		}
	} catch (e_1_1) {
		e_1 = { error: e_1_1 };
	} finally {
		try {
			if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
		} finally {
			if (e_1) throw e_1.error;
		}
	}
	return out;
}
function isAttributeKey(key) {
	return typeof key === "string" && key.length > 0;
}
function isAttributeValue(val) {
	if (val == null) return true;
	if (Array.isArray(val)) return isHomogeneousAttributeValueArray(val);
	return isValidPrimitiveAttributeValue(val);
}
function isHomogeneousAttributeValueArray(arr) {
	var e_2, _a;
	var type;
	try {
		for (var arr_1 = __values$2(arr), arr_1_1 = arr_1.next(); !arr_1_1.done; arr_1_1 = arr_1.next()) {
			var element = arr_1_1.value;
			if (element == null) continue;
			if (!type) {
				if (isValidPrimitiveAttributeValue(element)) {
					type = typeof element;
					continue;
				}
				return false;
			}
			if (typeof element === type) continue;
			return false;
		}
	} catch (e_2_1) {
		e_2 = { error: e_2_1 };
	} finally {
		try {
			if (arr_1_1 && !arr_1_1.done && (_a = arr_1.return)) _a.call(arr_1);
		} finally {
			if (e_2) throw e_2.error;
		}
	}
	return true;
}
function isValidPrimitiveAttributeValue(val) {
	switch (typeof val) {
		case "number":
		case "boolean":
		case "string": return true;
	}
	return false;
}
var import_src$11, __values$2, __read$1;
var init_attributes = __esmMin((() => {
	import_src$11 = /* @__PURE__ */ __toESM(require_src$1());
	__values$2 = function(o) {
		var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
		if (m) return m.call(o);
		if (o && typeof o.length === "number") return { next: function() {
			if (o && i >= o.length) o = void 0;
			return {
				value: o && o[i++],
				done: !o
			};
		} };
		throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	};
	__read$1 = function(o, n) {
		var m = typeof Symbol === "function" && o[Symbol.iterator];
		if (!m) return o;
		var i = m.call(o), r, ar = [], e;
		try {
			while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
		} catch (error) {
			e = { error };
		} finally {
			try {
				if (r && !r.done && (m = i["return"])) m.call(i);
			} finally {
				if (e) throw e.error;
			}
		}
		return ar;
	};
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/common/logging-error-handler.js
/**
* Returns a function that logs an error using the provided logger, or a
* console logger if one was not provided.
*/
function loggingErrorHandler() {
	return function(ex) {
		import_src$10.diag.error(stringifyException(ex));
	};
}
/**
* Converts an exception into a string representation
* @param {Exception} ex
*/
function stringifyException(ex) {
	if (typeof ex === "string") return ex;
	else return JSON.stringify(flattenException(ex));
}
/**
* Flattens an exception into key-value pairs by traversing the prototype chain
* and coercing values to strings. Duplicate properties will not be overwritten;
* the first insert wins.
*/
function flattenException(ex) {
	var result = {};
	var current = ex;
	while (current !== null) {
		Object.getOwnPropertyNames(current).forEach(function(propertyName) {
			if (result[propertyName]) return;
			var value = current[propertyName];
			if (value) result[propertyName] = String(value);
		});
		current = Object.getPrototypeOf(current);
	}
	return result;
}
var import_src$10;
var init_logging_error_handler = __esmMin((() => {
	import_src$10 = /* @__PURE__ */ __toESM(require_src$1());
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js
/**
* Set the global error handler
* @param {ErrorHandler} handler
*/
function setGlobalErrorHandler(handler) {
	delegateHandler = handler;
}
/**
* Return the global error handler
* @param {Exception} ex
*/
function globalErrorHandler(ex) {
	try {
		delegateHandler(ex);
	} catch (_a) {}
}
var delegateHandler;
var init_global_error_handler = __esmMin((() => {
	init_logging_error_handler();
	delegateHandler = loggingErrorHandler();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/sampling.js
var TracesSamplerValues;
var init_sampling = __esmMin((() => {
	(function(TracesSamplerValues) {
		TracesSamplerValues["AlwaysOff"] = "always_off";
		TracesSamplerValues["AlwaysOn"] = "always_on";
		TracesSamplerValues["ParentBasedAlwaysOff"] = "parentbased_always_off";
		TracesSamplerValues["ParentBasedAlwaysOn"] = "parentbased_always_on";
		TracesSamplerValues["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
		TracesSamplerValues["TraceIdRatio"] = "traceidratio";
	})(TracesSamplerValues || (TracesSamplerValues = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/environment.js
function isEnvVarABoolean(key) {
	return ENVIRONMENT_BOOLEAN_KEYS.indexOf(key) > -1;
}
function isEnvVarANumber(key) {
	return ENVIRONMENT_NUMBERS_KEYS.indexOf(key) > -1;
}
function isEnvVarAList(key) {
	return ENVIRONMENT_LISTS_KEYS.indexOf(key) > -1;
}
/**
* @param key
* @param environment
* @param values
*/
function parseBoolean(key, environment, values) {
	if (typeof values[key] === "undefined") return;
	environment[key] = String(values[key]).toLowerCase() === "true";
}
/**
* Parses a variable as number with number validation
* @param name
* @param environment
* @param values
* @param min
* @param max
*/
function parseNumber(name, environment, values, min, max) {
	if (min === void 0) min = -Infinity;
	if (max === void 0) max = Infinity;
	if (typeof values[name] !== "undefined") {
		var value = Number(values[name]);
		if (!isNaN(value)) if (value < min) environment[name] = min;
		else if (value > max) environment[name] = max;
		else environment[name] = value;
	}
}
/**
* Parses list-like strings from input into output.
* @param name
* @param environment
* @param values
* @param separator
*/
function parseStringList(name, output, input, separator) {
	if (separator === void 0) separator = DEFAULT_LIST_SEPARATOR;
	var givenValue = input[name];
	if (typeof givenValue === "string") output[name] = givenValue.split(separator).map(function(v) {
		return v.trim();
	});
}
/**
* Environmentally sets log level if valid log level string is provided
* @param key
* @param environment
* @param values
*/
function setLogLevelFromEnv(key, environment, values) {
	var value = values[key];
	if (typeof value === "string") {
		var theLevel = logLevelMap[value.toUpperCase()];
		if (theLevel != null) environment[key] = theLevel;
	}
}
/**
* Parses environment values
* @param values
*/
function parseEnvironment(values) {
	var environment = {};
	for (var env in DEFAULT_ENVIRONMENT) {
		var key = env;
		switch (key) {
			case "OTEL_LOG_LEVEL":
				setLogLevelFromEnv(key, environment, values);
				break;
			default: if (isEnvVarABoolean(key)) parseBoolean(key, environment, values);
			else if (isEnvVarANumber(key)) parseNumber(key, environment, values);
			else if (isEnvVarAList(key)) parseStringList(key, environment, values);
			else {
				var value = values[key];
				if (typeof value !== "undefined" && value !== null) environment[key] = String(value);
			}
		}
	}
	return environment;
}
var import_src$9, DEFAULT_LIST_SEPARATOR, ENVIRONMENT_BOOLEAN_KEYS, ENVIRONMENT_NUMBERS_KEYS, ENVIRONMENT_LISTS_KEYS, DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT, DEFAULT_ENVIRONMENT, logLevelMap;
var init_environment$1 = __esmMin((() => {
	import_src$9 = /* @__PURE__ */ __toESM(require_src$1());
	init_sampling();
	DEFAULT_LIST_SEPARATOR = ",";
	ENVIRONMENT_BOOLEAN_KEYS = ["OTEL_SDK_DISABLED"];
	ENVIRONMENT_NUMBERS_KEYS = [
		"OTEL_BSP_EXPORT_TIMEOUT",
		"OTEL_BSP_MAX_EXPORT_BATCH_SIZE",
		"OTEL_BSP_MAX_QUEUE_SIZE",
		"OTEL_BSP_SCHEDULE_DELAY",
		"OTEL_BLRP_EXPORT_TIMEOUT",
		"OTEL_BLRP_MAX_EXPORT_BATCH_SIZE",
		"OTEL_BLRP_MAX_QUEUE_SIZE",
		"OTEL_BLRP_SCHEDULE_DELAY",
		"OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT",
		"OTEL_ATTRIBUTE_COUNT_LIMIT",
		"OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT",
		"OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT",
		"OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT",
		"OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT",
		"OTEL_SPAN_EVENT_COUNT_LIMIT",
		"OTEL_SPAN_LINK_COUNT_LIMIT",
		"OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT",
		"OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT",
		"OTEL_EXPORTER_OTLP_TIMEOUT",
		"OTEL_EXPORTER_OTLP_TRACES_TIMEOUT",
		"OTEL_EXPORTER_OTLP_METRICS_TIMEOUT",
		"OTEL_EXPORTER_OTLP_LOGS_TIMEOUT",
		"OTEL_EXPORTER_JAEGER_AGENT_PORT"
	];
	ENVIRONMENT_LISTS_KEYS = [
		"OTEL_NO_PATCH_MODULES",
		"OTEL_PROPAGATORS",
		"OTEL_SEMCONV_STABILITY_OPT_IN"
	];
	DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
	DEFAULT_ENVIRONMENT = {
		OTEL_SDK_DISABLED: false,
		CONTAINER_NAME: "",
		ECS_CONTAINER_METADATA_URI_V4: "",
		ECS_CONTAINER_METADATA_URI: "",
		HOSTNAME: "",
		KUBERNETES_SERVICE_HOST: "",
		NAMESPACE: "",
		OTEL_BSP_EXPORT_TIMEOUT: 3e4,
		OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
		OTEL_BSP_MAX_QUEUE_SIZE: 2048,
		OTEL_BSP_SCHEDULE_DELAY: 5e3,
		OTEL_BLRP_EXPORT_TIMEOUT: 3e4,
		OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
		OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
		OTEL_BLRP_SCHEDULE_DELAY: 5e3,
		OTEL_EXPORTER_JAEGER_AGENT_HOST: "",
		OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
		OTEL_EXPORTER_JAEGER_ENDPOINT: "",
		OTEL_EXPORTER_JAEGER_PASSWORD: "",
		OTEL_EXPORTER_JAEGER_USER: "",
		OTEL_EXPORTER_OTLP_ENDPOINT: "",
		OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "",
		OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: "",
		OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
		OTEL_EXPORTER_OTLP_HEADERS: "",
		OTEL_EXPORTER_OTLP_TRACES_HEADERS: "",
		OTEL_EXPORTER_OTLP_METRICS_HEADERS: "",
		OTEL_EXPORTER_OTLP_LOGS_HEADERS: "",
		OTEL_EXPORTER_OTLP_TIMEOUT: 1e4,
		OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 1e4,
		OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 1e4,
		OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 1e4,
		OTEL_EXPORTER_ZIPKIN_ENDPOINT: "http://localhost:9411/api/v2/spans",
		OTEL_LOG_LEVEL: import_src$9.DiagLogLevel.INFO,
		OTEL_NO_PATCH_MODULES: [],
		OTEL_PROPAGATORS: ["tracecontext", "baggage"],
		OTEL_RESOURCE_ATTRIBUTES: "",
		OTEL_SERVICE_NAME: "",
		OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
		OTEL_ATTRIBUTE_COUNT_LIMIT: 128,
		OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
		OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: 128,
		OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
		OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: 128,
		OTEL_SPAN_EVENT_COUNT_LIMIT: 128,
		OTEL_SPAN_LINK_COUNT_LIMIT: 128,
		OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: 128,
		OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: 128,
		OTEL_TRACES_EXPORTER: "",
		OTEL_TRACES_SAMPLER: TracesSamplerValues.ParentBasedAlwaysOn,
		OTEL_TRACES_SAMPLER_ARG: "",
		OTEL_LOGS_EXPORTER: "",
		OTEL_EXPORTER_OTLP_INSECURE: "",
		OTEL_EXPORTER_OTLP_TRACES_INSECURE: "",
		OTEL_EXPORTER_OTLP_METRICS_INSECURE: "",
		OTEL_EXPORTER_OTLP_LOGS_INSECURE: "",
		OTEL_EXPORTER_OTLP_CERTIFICATE: "",
		OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: "",
		OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: "",
		OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: "",
		OTEL_EXPORTER_OTLP_COMPRESSION: "",
		OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: "",
		OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: "",
		OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: "",
		OTEL_EXPORTER_OTLP_CLIENT_KEY: "",
		OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: "",
		OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: "",
		OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: "",
		OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: "",
		OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: "",
		OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: "",
		OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: "",
		OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
		OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: "http/protobuf",
		OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: "http/protobuf",
		OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: "http/protobuf",
		OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: "cumulative",
		OTEL_SEMCONV_STABILITY_OPT_IN: []
	};
	logLevelMap = {
		ALL: import_src$9.DiagLogLevel.ALL,
		VERBOSE: import_src$9.DiagLogLevel.VERBOSE,
		DEBUG: import_src$9.DiagLogLevel.DEBUG,
		INFO: import_src$9.DiagLogLevel.INFO,
		WARN: import_src$9.DiagLogLevel.WARN,
		ERROR: import_src$9.DiagLogLevel.ERROR,
		NONE: import_src$9.DiagLogLevel.NONE
	};
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/node/environment.js
/**
* Gets the environment variables
*/
function getEnv() {
	var processEnv = parseEnvironment(process.env);
	return Object.assign({}, DEFAULT_ENVIRONMENT, processEnv);
}
function getEnvWithoutDefaults() {
	return parseEnvironment(process.env);
}
var init_environment = __esmMin((() => {
	init_environment$1();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/node/globalThis.js
var _globalThis;
var init_globalThis = __esmMin((() => {
	_globalThis = typeof globalThis === "object" ? globalThis : global;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/common/hex-to-binary.js
function intValue(charCode) {
	if (charCode >= 48 && charCode <= 57) return charCode - 48;
	if (charCode >= 97 && charCode <= 102) return charCode - 87;
	return charCode - 55;
}
function hexToBinary(hexStr) {
	var buf = new Uint8Array(hexStr.length / 2);
	var offset = 0;
	for (var i = 0; i < hexStr.length; i += 2) {
		var hi = intValue(hexStr.charCodeAt(i));
		var lo = intValue(hexStr.charCodeAt(i + 1));
		buf[offset++] = hi << 4 | lo;
	}
	return buf;
}
var init_hex_to_binary = __esmMin((() => {}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/node/hex-to-base64.js
function hexToBase64(hexStr) {
	return Buffer.from(hexToBinary(hexStr)).toString("base64");
}
var init_hex_to_base64 = __esmMin((() => {
	init_hex_to_binary();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/node/RandomIdGenerator.js
function getIdGenerator(bytes) {
	return function generateId() {
		for (var i = 0; i < bytes / 4; i++) SHARED_BUFFER.writeUInt32BE(Math.random() * Math.pow(2, 32) >>> 0, i * 4);
		for (var i = 0; i < bytes; i++) if (SHARED_BUFFER[i] > 0) break;
		else if (i === bytes - 1) SHARED_BUFFER[bytes - 1] = 1;
		return SHARED_BUFFER.toString("hex", 0, bytes);
	};
}
var SPAN_ID_BYTES, TRACE_ID_BYTES, RandomIdGenerator, SHARED_BUFFER;
var init_RandomIdGenerator = __esmMin((() => {
	SPAN_ID_BYTES = 8;
	TRACE_ID_BYTES = 16;
	RandomIdGenerator = function() {
		function RandomIdGenerator() {
			/**
			* Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
			* characters corresponding to 128 bits.
			*/
			this.generateTraceId = getIdGenerator(TRACE_ID_BYTES);
			/**
			* Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
			* characters corresponding to 64 bits.
			*/
			this.generateSpanId = getIdGenerator(SPAN_ID_BYTES);
		}
		return RandomIdGenerator;
	}();
	SHARED_BUFFER = Buffer.allocUnsafe(TRACE_ID_BYTES);
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/node/performance.js
var otperformance;
var init_performance = __esmMin((() => {
	otperformance = performance;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/version.js
var VERSION$1;
var init_version = __esmMin((() => {
	VERSION$1 = "1.30.1";
}));
//#endregion
//#region node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/build/src/internal/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createConstMap = void 0;
	/**
	* Creates a const map from the given values
	* @param values - An array of values to be used as keys and values in the map.
	* @returns A populated version of the map with the values and keys derived from the values.
	*/
	/*#__NO_SIDE_EFFECTS__*/
	function createConstMap(values) {
		let res = {};
		const len = values.length;
		for (let lp = 0; lp < len; lp++) {
			const val = values[lp];
			if (val) res[String(val).toUpperCase().replace(/[-.]/g, "_")] = val;
		}
		return res;
	}
	exports.createConstMap = createConstMap;
}));
//#endregion
//#region node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/build/src/trace/SemanticAttributes.js
var require_SemanticAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SEMATTRS_NET_HOST_CARRIER_ICC = exports.SEMATTRS_NET_HOST_CARRIER_MNC = exports.SEMATTRS_NET_HOST_CARRIER_MCC = exports.SEMATTRS_NET_HOST_CARRIER_NAME = exports.SEMATTRS_NET_HOST_CONNECTION_SUBTYPE = exports.SEMATTRS_NET_HOST_CONNECTION_TYPE = exports.SEMATTRS_NET_HOST_NAME = exports.SEMATTRS_NET_HOST_PORT = exports.SEMATTRS_NET_HOST_IP = exports.SEMATTRS_NET_PEER_NAME = exports.SEMATTRS_NET_PEER_PORT = exports.SEMATTRS_NET_PEER_IP = exports.SEMATTRS_NET_TRANSPORT = exports.SEMATTRS_FAAS_INVOKED_REGION = exports.SEMATTRS_FAAS_INVOKED_PROVIDER = exports.SEMATTRS_FAAS_INVOKED_NAME = exports.SEMATTRS_FAAS_COLDSTART = exports.SEMATTRS_FAAS_CRON = exports.SEMATTRS_FAAS_TIME = exports.SEMATTRS_FAAS_DOCUMENT_NAME = exports.SEMATTRS_FAAS_DOCUMENT_TIME = exports.SEMATTRS_FAAS_DOCUMENT_OPERATION = exports.SEMATTRS_FAAS_DOCUMENT_COLLECTION = exports.SEMATTRS_FAAS_EXECUTION = exports.SEMATTRS_FAAS_TRIGGER = exports.SEMATTRS_EXCEPTION_ESCAPED = exports.SEMATTRS_EXCEPTION_STACKTRACE = exports.SEMATTRS_EXCEPTION_MESSAGE = exports.SEMATTRS_EXCEPTION_TYPE = exports.SEMATTRS_DB_SQL_TABLE = exports.SEMATTRS_DB_MONGODB_COLLECTION = exports.SEMATTRS_DB_REDIS_DATABASE_INDEX = exports.SEMATTRS_DB_HBASE_NAMESPACE = exports.SEMATTRS_DB_CASSANDRA_COORDINATOR_DC = exports.SEMATTRS_DB_CASSANDRA_COORDINATOR_ID = exports.SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = exports.SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = exports.SEMATTRS_DB_CASSANDRA_TABLE = exports.SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL = exports.SEMATTRS_DB_CASSANDRA_PAGE_SIZE = exports.SEMATTRS_DB_CASSANDRA_KEYSPACE = exports.SEMATTRS_DB_MSSQL_INSTANCE_NAME = exports.SEMATTRS_DB_OPERATION = exports.SEMATTRS_DB_STATEMENT = exports.SEMATTRS_DB_NAME = exports.SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = exports.SEMATTRS_DB_USER = exports.SEMATTRS_DB_CONNECTION_STRING = exports.SEMATTRS_DB_SYSTEM = exports.SEMATTRS_AWS_LAMBDA_INVOKED_ARN = void 0;
	exports.SEMATTRS_MESSAGING_DESTINATION_KIND = exports.SEMATTRS_MESSAGING_DESTINATION = exports.SEMATTRS_MESSAGING_SYSTEM = exports.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = exports.SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = exports.SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT = exports.SEMATTRS_AWS_DYNAMODB_COUNT = exports.SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS = exports.SEMATTRS_AWS_DYNAMODB_SEGMENT = exports.SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = exports.SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = exports.SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = exports.SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = exports.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = exports.SEMATTRS_AWS_DYNAMODB_SELECT = exports.SEMATTRS_AWS_DYNAMODB_INDEX_NAME = exports.SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET = exports.SEMATTRS_AWS_DYNAMODB_LIMIT = exports.SEMATTRS_AWS_DYNAMODB_PROJECTION = exports.SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ = exports.SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = exports.SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = exports.SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = exports.SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY = exports.SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = exports.SEMATTRS_HTTP_CLIENT_IP = exports.SEMATTRS_HTTP_ROUTE = exports.SEMATTRS_HTTP_SERVER_NAME = exports.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = exports.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = exports.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = exports.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH = exports.SEMATTRS_HTTP_USER_AGENT = exports.SEMATTRS_HTTP_FLAVOR = exports.SEMATTRS_HTTP_STATUS_CODE = exports.SEMATTRS_HTTP_SCHEME = exports.SEMATTRS_HTTP_HOST = exports.SEMATTRS_HTTP_TARGET = exports.SEMATTRS_HTTP_URL = exports.SEMATTRS_HTTP_METHOD = exports.SEMATTRS_CODE_LINENO = exports.SEMATTRS_CODE_FILEPATH = exports.SEMATTRS_CODE_NAMESPACE = exports.SEMATTRS_CODE_FUNCTION = exports.SEMATTRS_THREAD_NAME = exports.SEMATTRS_THREAD_ID = exports.SEMATTRS_ENDUSER_SCOPE = exports.SEMATTRS_ENDUSER_ROLE = exports.SEMATTRS_ENDUSER_ID = exports.SEMATTRS_PEER_SERVICE = void 0;
	exports.DBSYSTEMVALUES_FILEMAKER = exports.DBSYSTEMVALUES_DERBY = exports.DBSYSTEMVALUES_FIREBIRD = exports.DBSYSTEMVALUES_ADABAS = exports.DBSYSTEMVALUES_CACHE = exports.DBSYSTEMVALUES_EDB = exports.DBSYSTEMVALUES_FIRSTSQL = exports.DBSYSTEMVALUES_INGRES = exports.DBSYSTEMVALUES_HANADB = exports.DBSYSTEMVALUES_MAXDB = exports.DBSYSTEMVALUES_PROGRESS = exports.DBSYSTEMVALUES_HSQLDB = exports.DBSYSTEMVALUES_CLOUDSCAPE = exports.DBSYSTEMVALUES_HIVE = exports.DBSYSTEMVALUES_REDSHIFT = exports.DBSYSTEMVALUES_POSTGRESQL = exports.DBSYSTEMVALUES_DB2 = exports.DBSYSTEMVALUES_ORACLE = exports.DBSYSTEMVALUES_MYSQL = exports.DBSYSTEMVALUES_MSSQL = exports.DBSYSTEMVALUES_OTHER_SQL = exports.SemanticAttributes = exports.SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE = exports.SEMATTRS_MESSAGE_COMPRESSED_SIZE = exports.SEMATTRS_MESSAGE_ID = exports.SEMATTRS_MESSAGE_TYPE = exports.SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = exports.SEMATTRS_RPC_JSONRPC_ERROR_CODE = exports.SEMATTRS_RPC_JSONRPC_REQUEST_ID = exports.SEMATTRS_RPC_JSONRPC_VERSION = exports.SEMATTRS_RPC_GRPC_STATUS_CODE = exports.SEMATTRS_RPC_METHOD = exports.SEMATTRS_RPC_SERVICE = exports.SEMATTRS_RPC_SYSTEM = exports.SEMATTRS_MESSAGING_KAFKA_TOMBSTONE = exports.SEMATTRS_MESSAGING_KAFKA_PARTITION = exports.SEMATTRS_MESSAGING_KAFKA_CLIENT_ID = exports.SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP = exports.SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY = exports.SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY = exports.SEMATTRS_MESSAGING_CONSUMER_ID = exports.SEMATTRS_MESSAGING_OPERATION = exports.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = exports.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = exports.SEMATTRS_MESSAGING_CONVERSATION_ID = exports.SEMATTRS_MESSAGING_MESSAGE_ID = exports.SEMATTRS_MESSAGING_URL = exports.SEMATTRS_MESSAGING_PROTOCOL_VERSION = exports.SEMATTRS_MESSAGING_PROTOCOL = exports.SEMATTRS_MESSAGING_TEMP_DESTINATION = void 0;
	exports.FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = exports.FaasDocumentOperationValues = exports.FAASDOCUMENTOPERATIONVALUES_DELETE = exports.FAASDOCUMENTOPERATIONVALUES_EDIT = exports.FAASDOCUMENTOPERATIONVALUES_INSERT = exports.FaasTriggerValues = exports.FAASTRIGGERVALUES_OTHER = exports.FAASTRIGGERVALUES_TIMER = exports.FAASTRIGGERVALUES_PUBSUB = exports.FAASTRIGGERVALUES_HTTP = exports.FAASTRIGGERVALUES_DATASOURCE = exports.DbCassandraConsistencyLevelValues = exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = exports.DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = exports.DBCASSANDRACONSISTENCYLEVELVALUES_ANY = exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = exports.DBCASSANDRACONSISTENCYLEVELVALUES_THREE = exports.DBCASSANDRACONSISTENCYLEVELVALUES_TWO = exports.DBCASSANDRACONSISTENCYLEVELVALUES_ONE = exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = exports.DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = exports.DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = exports.DBCASSANDRACONSISTENCYLEVELVALUES_ALL = exports.DbSystemValues = exports.DBSYSTEMVALUES_COCKROACHDB = exports.DBSYSTEMVALUES_MEMCACHED = exports.DBSYSTEMVALUES_ELASTICSEARCH = exports.DBSYSTEMVALUES_GEODE = exports.DBSYSTEMVALUES_NEO4J = exports.DBSYSTEMVALUES_DYNAMODB = exports.DBSYSTEMVALUES_COSMOSDB = exports.DBSYSTEMVALUES_COUCHDB = exports.DBSYSTEMVALUES_COUCHBASE = exports.DBSYSTEMVALUES_REDIS = exports.DBSYSTEMVALUES_MONGODB = exports.DBSYSTEMVALUES_HBASE = exports.DBSYSTEMVALUES_CASSANDRA = exports.DBSYSTEMVALUES_COLDFUSION = exports.DBSYSTEMVALUES_H2 = exports.DBSYSTEMVALUES_VERTICA = exports.DBSYSTEMVALUES_TERADATA = exports.DBSYSTEMVALUES_SYBASE = exports.DBSYSTEMVALUES_SQLITE = exports.DBSYSTEMVALUES_POINTBASE = exports.DBSYSTEMVALUES_PERVASIVE = exports.DBSYSTEMVALUES_NETEZZA = exports.DBSYSTEMVALUES_MARIADB = exports.DBSYSTEMVALUES_INTERBASE = exports.DBSYSTEMVALUES_INSTANTDB = exports.DBSYSTEMVALUES_INFORMIX = void 0;
	exports.MESSAGINGOPERATIONVALUES_RECEIVE = exports.MessagingDestinationKindValues = exports.MESSAGINGDESTINATIONKINDVALUES_TOPIC = exports.MESSAGINGDESTINATIONKINDVALUES_QUEUE = exports.HttpFlavorValues = exports.HTTPFLAVORVALUES_QUIC = exports.HTTPFLAVORVALUES_SPDY = exports.HTTPFLAVORVALUES_HTTP_2_0 = exports.HTTPFLAVORVALUES_HTTP_1_1 = exports.HTTPFLAVORVALUES_HTTP_1_0 = exports.NetHostConnectionSubtypeValues = exports.NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_NR = exports.NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = exports.NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_GSM = exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = exports.NETHOSTCONNECTIONSUBTYPEVALUES_LTE = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = exports.NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = exports.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = exports.NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = exports.NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = exports.NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = exports.NetHostConnectionTypeValues = exports.NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = exports.NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = exports.NETHOSTCONNECTIONTYPEVALUES_CELL = exports.NETHOSTCONNECTIONTYPEVALUES_WIRED = exports.NETHOSTCONNECTIONTYPEVALUES_WIFI = exports.NetTransportValues = exports.NETTRANSPORTVALUES_OTHER = exports.NETTRANSPORTVALUES_INPROC = exports.NETTRANSPORTVALUES_PIPE = exports.NETTRANSPORTVALUES_UNIX = exports.NETTRANSPORTVALUES_IP = exports.NETTRANSPORTVALUES_IP_UDP = exports.NETTRANSPORTVALUES_IP_TCP = exports.FaasInvokedProviderValues = exports.FAASINVOKEDPROVIDERVALUES_GCP = exports.FAASINVOKEDPROVIDERVALUES_AZURE = exports.FAASINVOKEDPROVIDERVALUES_AWS = void 0;
	exports.MessageTypeValues = exports.MESSAGETYPEVALUES_RECEIVED = exports.MESSAGETYPEVALUES_SENT = exports.RpcGrpcStatusCodeValues = exports.RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = exports.RPCGRPCSTATUSCODEVALUES_DATA_LOSS = exports.RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = exports.RPCGRPCSTATUSCODEVALUES_INTERNAL = exports.RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = exports.RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = exports.RPCGRPCSTATUSCODEVALUES_ABORTED = exports.RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = exports.RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = exports.RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = exports.RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = exports.RPCGRPCSTATUSCODEVALUES_NOT_FOUND = exports.RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = exports.RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = exports.RPCGRPCSTATUSCODEVALUES_UNKNOWN = exports.RPCGRPCSTATUSCODEVALUES_CANCELLED = exports.RPCGRPCSTATUSCODEVALUES_OK = exports.MessagingOperationValues = exports.MESSAGINGOPERATIONVALUES_PROCESS = void 0;
	var utils_1 = require_utils();
	var TMP_AWS_LAMBDA_INVOKED_ARN = "aws.lambda.invoked_arn";
	var TMP_DB_SYSTEM = "db.system";
	var TMP_DB_CONNECTION_STRING = "db.connection_string";
	var TMP_DB_USER = "db.user";
	var TMP_DB_JDBC_DRIVER_CLASSNAME = "db.jdbc.driver_classname";
	var TMP_DB_NAME = "db.name";
	var TMP_DB_STATEMENT = "db.statement";
	var TMP_DB_OPERATION = "db.operation";
	var TMP_DB_MSSQL_INSTANCE_NAME = "db.mssql.instance_name";
	var TMP_DB_CASSANDRA_KEYSPACE = "db.cassandra.keyspace";
	var TMP_DB_CASSANDRA_PAGE_SIZE = "db.cassandra.page_size";
	var TMP_DB_CASSANDRA_CONSISTENCY_LEVEL = "db.cassandra.consistency_level";
	var TMP_DB_CASSANDRA_TABLE = "db.cassandra.table";
	var TMP_DB_CASSANDRA_IDEMPOTENCE = "db.cassandra.idempotence";
	var TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = "db.cassandra.speculative_execution_count";
	var TMP_DB_CASSANDRA_COORDINATOR_ID = "db.cassandra.coordinator.id";
	var TMP_DB_CASSANDRA_COORDINATOR_DC = "db.cassandra.coordinator.dc";
	var TMP_DB_HBASE_NAMESPACE = "db.hbase.namespace";
	var TMP_DB_REDIS_DATABASE_INDEX = "db.redis.database_index";
	var TMP_DB_MONGODB_COLLECTION = "db.mongodb.collection";
	var TMP_DB_SQL_TABLE = "db.sql.table";
	var TMP_EXCEPTION_TYPE = "exception.type";
	var TMP_EXCEPTION_MESSAGE = "exception.message";
	var TMP_EXCEPTION_STACKTRACE = "exception.stacktrace";
	var TMP_EXCEPTION_ESCAPED = "exception.escaped";
	var TMP_FAAS_TRIGGER = "faas.trigger";
	var TMP_FAAS_EXECUTION = "faas.execution";
	var TMP_FAAS_DOCUMENT_COLLECTION = "faas.document.collection";
	var TMP_FAAS_DOCUMENT_OPERATION = "faas.document.operation";
	var TMP_FAAS_DOCUMENT_TIME = "faas.document.time";
	var TMP_FAAS_DOCUMENT_NAME = "faas.document.name";
	var TMP_FAAS_TIME = "faas.time";
	var TMP_FAAS_CRON = "faas.cron";
	var TMP_FAAS_COLDSTART = "faas.coldstart";
	var TMP_FAAS_INVOKED_NAME = "faas.invoked_name";
	var TMP_FAAS_INVOKED_PROVIDER = "faas.invoked_provider";
	var TMP_FAAS_INVOKED_REGION = "faas.invoked_region";
	var TMP_NET_TRANSPORT = "net.transport";
	var TMP_NET_PEER_IP = "net.peer.ip";
	var TMP_NET_PEER_PORT = "net.peer.port";
	var TMP_NET_PEER_NAME = "net.peer.name";
	var TMP_NET_HOST_IP = "net.host.ip";
	var TMP_NET_HOST_PORT = "net.host.port";
	var TMP_NET_HOST_NAME = "net.host.name";
	var TMP_NET_HOST_CONNECTION_TYPE = "net.host.connection.type";
	var TMP_NET_HOST_CONNECTION_SUBTYPE = "net.host.connection.subtype";
	var TMP_NET_HOST_CARRIER_NAME = "net.host.carrier.name";
	var TMP_NET_HOST_CARRIER_MCC = "net.host.carrier.mcc";
	var TMP_NET_HOST_CARRIER_MNC = "net.host.carrier.mnc";
	var TMP_NET_HOST_CARRIER_ICC = "net.host.carrier.icc";
	var TMP_PEER_SERVICE = "peer.service";
	var TMP_ENDUSER_ID = "enduser.id";
	var TMP_ENDUSER_ROLE = "enduser.role";
	var TMP_ENDUSER_SCOPE = "enduser.scope";
	var TMP_THREAD_ID = "thread.id";
	var TMP_THREAD_NAME = "thread.name";
	var TMP_CODE_FUNCTION = "code.function";
	var TMP_CODE_NAMESPACE = "code.namespace";
	var TMP_CODE_FILEPATH = "code.filepath";
	var TMP_CODE_LINENO = "code.lineno";
	var TMP_HTTP_METHOD = "http.method";
	var TMP_HTTP_URL = "http.url";
	var TMP_HTTP_TARGET = "http.target";
	var TMP_HTTP_HOST = "http.host";
	var TMP_HTTP_SCHEME = "http.scheme";
	var TMP_HTTP_STATUS_CODE = "http.status_code";
	var TMP_HTTP_FLAVOR = "http.flavor";
	var TMP_HTTP_USER_AGENT = "http.user_agent";
	var TMP_HTTP_REQUEST_CONTENT_LENGTH = "http.request_content_length";
	var TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = "http.request_content_length_uncompressed";
	var TMP_HTTP_RESPONSE_CONTENT_LENGTH = "http.response_content_length";
	var TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = "http.response_content_length_uncompressed";
	var TMP_HTTP_SERVER_NAME = "http.server_name";
	var TMP_HTTP_ROUTE = "http.route";
	var TMP_HTTP_CLIENT_IP = "http.client_ip";
	var TMP_AWS_DYNAMODB_TABLE_NAMES = "aws.dynamodb.table_names";
	var TMP_AWS_DYNAMODB_CONSUMED_CAPACITY = "aws.dynamodb.consumed_capacity";
	var TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = "aws.dynamodb.item_collection_metrics";
	var TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = "aws.dynamodb.provisioned_read_capacity";
	var TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = "aws.dynamodb.provisioned_write_capacity";
	var TMP_AWS_DYNAMODB_CONSISTENT_READ = "aws.dynamodb.consistent_read";
	var TMP_AWS_DYNAMODB_PROJECTION = "aws.dynamodb.projection";
	var TMP_AWS_DYNAMODB_LIMIT = "aws.dynamodb.limit";
	var TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET = "aws.dynamodb.attributes_to_get";
	var TMP_AWS_DYNAMODB_INDEX_NAME = "aws.dynamodb.index_name";
	var TMP_AWS_DYNAMODB_SELECT = "aws.dynamodb.select";
	var TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = "aws.dynamodb.global_secondary_indexes";
	var TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = "aws.dynamodb.local_secondary_indexes";
	var TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = "aws.dynamodb.exclusive_start_table";
	var TMP_AWS_DYNAMODB_TABLE_COUNT = "aws.dynamodb.table_count";
	var TMP_AWS_DYNAMODB_SCAN_FORWARD = "aws.dynamodb.scan_forward";
	var TMP_AWS_DYNAMODB_SEGMENT = "aws.dynamodb.segment";
	var TMP_AWS_DYNAMODB_TOTAL_SEGMENTS = "aws.dynamodb.total_segments";
	var TMP_AWS_DYNAMODB_COUNT = "aws.dynamodb.count";
	var TMP_AWS_DYNAMODB_SCANNED_COUNT = "aws.dynamodb.scanned_count";
	var TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = "aws.dynamodb.attribute_definitions";
	var TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = "aws.dynamodb.global_secondary_index_updates";
	var TMP_MESSAGING_SYSTEM = "messaging.system";
	var TMP_MESSAGING_DESTINATION = "messaging.destination";
	var TMP_MESSAGING_DESTINATION_KIND = "messaging.destination_kind";
	var TMP_MESSAGING_TEMP_DESTINATION = "messaging.temp_destination";
	var TMP_MESSAGING_PROTOCOL = "messaging.protocol";
	var TMP_MESSAGING_PROTOCOL_VERSION = "messaging.protocol_version";
	var TMP_MESSAGING_URL = "messaging.url";
	var TMP_MESSAGING_MESSAGE_ID = "messaging.message_id";
	var TMP_MESSAGING_CONVERSATION_ID = "messaging.conversation_id";
	var TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = "messaging.message_payload_size_bytes";
	var TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = "messaging.message_payload_compressed_size_bytes";
	var TMP_MESSAGING_OPERATION = "messaging.operation";
	var TMP_MESSAGING_CONSUMER_ID = "messaging.consumer_id";
	var TMP_MESSAGING_RABBITMQ_ROUTING_KEY = "messaging.rabbitmq.routing_key";
	var TMP_MESSAGING_KAFKA_MESSAGE_KEY = "messaging.kafka.message_key";
	var TMP_MESSAGING_KAFKA_CONSUMER_GROUP = "messaging.kafka.consumer_group";
	var TMP_MESSAGING_KAFKA_CLIENT_ID = "messaging.kafka.client_id";
	var TMP_MESSAGING_KAFKA_PARTITION = "messaging.kafka.partition";
	var TMP_MESSAGING_KAFKA_TOMBSTONE = "messaging.kafka.tombstone";
	var TMP_RPC_SYSTEM = "rpc.system";
	var TMP_RPC_SERVICE = "rpc.service";
	var TMP_RPC_METHOD = "rpc.method";
	var TMP_RPC_GRPC_STATUS_CODE = "rpc.grpc.status_code";
	var TMP_RPC_JSONRPC_VERSION = "rpc.jsonrpc.version";
	var TMP_RPC_JSONRPC_REQUEST_ID = "rpc.jsonrpc.request_id";
	var TMP_RPC_JSONRPC_ERROR_CODE = "rpc.jsonrpc.error_code";
	var TMP_RPC_JSONRPC_ERROR_MESSAGE = "rpc.jsonrpc.error_message";
	var TMP_MESSAGE_TYPE = "message.type";
	var TMP_MESSAGE_ID = "message.id";
	var TMP_MESSAGE_COMPRESSED_SIZE = "message.compressed_size";
	var TMP_MESSAGE_UNCOMPRESSED_SIZE = "message.uncompressed_size";
	/**
	* The full invoked ARN as provided on the `Context` passed to the function (`Lambda-Runtime-Invoked-Function-Arn` header on the `/runtime/invocation/next` applicable).
	*
	* Note: This may be different from `faas.id` if an alias is involved.
	*
	* @deprecated Use ATTR_AWS_LAMBDA_INVOKED_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_LAMBDA_INVOKED_ARN = TMP_AWS_LAMBDA_INVOKED_ARN;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use ATTR_DB_SYSTEM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_SYSTEM = TMP_DB_SYSTEM;
	/**
	* The connection string used to connect to the database. It is recommended to remove embedded credentials.
	*
	* @deprecated Use ATTR_DB_CONNECTION_STRING in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CONNECTION_STRING = TMP_DB_CONNECTION_STRING;
	/**
	* Username for accessing the database.
	*
	* @deprecated Use ATTR_DB_USER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_USER = TMP_DB_USER;
	/**
	* The fully-qualified class name of the [Java Database Connectivity (JDBC)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/) driver used to connect.
	*
	* @deprecated Use ATTR_DB_JDBC_DRIVER_CLASSNAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_JDBC_DRIVER_CLASSNAME = TMP_DB_JDBC_DRIVER_CLASSNAME;
	/**
	* If no [tech-specific attribute](#call-level-attributes-for-specific-technologies) is defined, this attribute is used to report the name of the database being accessed. For commands that switch the database, this should be set to the target database (even if the command fails).
	*
	* Note: In some SQL databases, the database name to be used is called &#34;schema name&#34;.
	*
	* @deprecated Use ATTR_DB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_NAME = TMP_DB_NAME;
	/**
	* The database statement being executed.
	*
	* Note: The value may be sanitized to exclude sensitive information.
	*
	* @deprecated Use ATTR_DB_STATEMENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_STATEMENT = TMP_DB_STATEMENT;
	/**
	* The name of the operation being executed, e.g. the [MongoDB command name](https://docs.mongodb.com/manual/reference/command/#database-operations) such as `findAndModify`, or the SQL keyword.
	*
	* Note: When setting this to an SQL keyword, it is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if the operation name is provided by the library being instrumented. If the SQL statement has an ambiguous operation, or performs more than one operation, this value may be omitted.
	*
	* @deprecated Use ATTR_DB_OPERATION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_OPERATION = TMP_DB_OPERATION;
	/**
	* The Microsoft SQL Server [instance name](https://docs.microsoft.com/en-us/sql/connect/jdbc/building-the-connection-url?view=sql-server-ver15) connecting to. This name is used to determine the port of a named instance.
	*
	* Note: If setting a `db.mssql.instance_name`, `net.peer.port` is no longer required (but still recommended if non-standard).
	*
	* @deprecated Use ATTR_DB_MSSQL_INSTANCE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_MSSQL_INSTANCE_NAME = TMP_DB_MSSQL_INSTANCE_NAME;
	/**
	* The name of the keyspace being accessed. To be used instead of the generic `db.name` attribute.
	*
	* @deprecated Use ATTR_DB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_KEYSPACE = TMP_DB_CASSANDRA_KEYSPACE;
	/**
	* The fetch size used for paging, i.e. how many rows will be returned at once.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_PAGE_SIZE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_PAGE_SIZE = TMP_DB_CASSANDRA_PAGE_SIZE;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use ATTR_DB_CASSANDRA_CONSISTENCY_LEVEL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_CONSISTENCY_LEVEL = TMP_DB_CASSANDRA_CONSISTENCY_LEVEL;
	/**
	* The name of the primary table that the operation is acting upon, including the schema name (if applicable).
	*
	* Note: This mirrors the db.sql.table attribute but references cassandra rather than sql. It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_TABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_TABLE = TMP_DB_CASSANDRA_TABLE;
	/**
	* Whether or not the query is idempotent.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_IDEMPOTENCE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_IDEMPOTENCE = TMP_DB_CASSANDRA_IDEMPOTENCE;
	/**
	* The number of times a query was speculatively executed. Not set or `0` if the query was not executed speculatively.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT = TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT;
	/**
	* The ID of the coordinating node for a query.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_COORDINATOR_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_COORDINATOR_ID = TMP_DB_CASSANDRA_COORDINATOR_ID;
	/**
	* The data center of the coordinating node for a query.
	*
	* @deprecated Use ATTR_DB_CASSANDRA_COORDINATOR_DC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_CASSANDRA_COORDINATOR_DC = TMP_DB_CASSANDRA_COORDINATOR_DC;
	/**
	* The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed. To be used instead of the generic `db.name` attribute.
	*
	* @deprecated Use ATTR_DB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_HBASE_NAMESPACE = TMP_DB_HBASE_NAMESPACE;
	/**
	* The index of the database being accessed as used in the [`SELECT` command](https://redis.io/commands/select), provided as an integer. To be used instead of the generic `db.name` attribute.
	*
	* @deprecated Use ATTR_DB_REDIS_DATABASE_INDEX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_REDIS_DATABASE_INDEX = TMP_DB_REDIS_DATABASE_INDEX;
	/**
	* The collection being accessed within the database stated in `db.name`.
	*
	* @deprecated Use ATTR_DB_MONGODB_COLLECTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_MONGODB_COLLECTION = TMP_DB_MONGODB_COLLECTION;
	/**
	* The name of the primary table that the operation is acting upon, including the schema name (if applicable).
	*
	* Note: It is not recommended to attempt any client-side parsing of `db.statement` just to get this property, but it should be set if it is provided by the library being instrumented. If the operation is acting upon an anonymous table, or more than one table, this value MUST NOT be set.
	*
	* @deprecated Use ATTR_DB_SQL_TABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_DB_SQL_TABLE = TMP_DB_SQL_TABLE;
	/**
	* The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
	*
	* @deprecated Use ATTR_EXCEPTION_TYPE.
	*/
	exports.SEMATTRS_EXCEPTION_TYPE = TMP_EXCEPTION_TYPE;
	/**
	* The exception message.
	*
	* @deprecated Use ATTR_EXCEPTION_MESSAGE.
	*/
	exports.SEMATTRS_EXCEPTION_MESSAGE = TMP_EXCEPTION_MESSAGE;
	/**
	* A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
	*
	* @deprecated Use ATTR_EXCEPTION_STACKTRACE.
	*/
	exports.SEMATTRS_EXCEPTION_STACKTRACE = TMP_EXCEPTION_STACKTRACE;
	/**
	* SHOULD be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
	*
	* Note: An exception is considered to have escaped (or left) the scope of a span,
	if that span is ended while the exception is still logically &#34;in flight&#34;.
	This may be actually &#34;in flight&#34; in some languages (e.g. if the exception
	is passed to a Context manager&#39;s `__exit__` method in Python) but will
	usually be caught at the point of recording the exception in most languages.
	
	It is usually not possible to determine at the point where an exception is thrown
	whether it will escape the scope of a span.
	However, it is trivial to know that an exception
	will escape, if one checks for an active exception just before ending the span,
	as done in the [example above](#exception-end-example).
	
	It follows that an exception may still escape the scope of the span
	even if the `exception.escaped` attribute was not set or set to false,
	since the event might have been recorded at a time where it was not
	clear whether the exception will escape.
	*
	* @deprecated Use ATTR_EXCEPTION_ESCAPED.
	*/
	exports.SEMATTRS_EXCEPTION_ESCAPED = TMP_EXCEPTION_ESCAPED;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use ATTR_FAAS_TRIGGER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_TRIGGER = TMP_FAAS_TRIGGER;
	/**
	* The execution ID of the current function execution.
	*
	* @deprecated Use ATTR_FAAS_INVOCATION_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_EXECUTION = TMP_FAAS_EXECUTION;
	/**
	* The name of the source on which the triggering operation was performed. For example, in Cloud Storage or S3 corresponds to the bucket name, and in Cosmos DB to the database name.
	*
	* @deprecated Use ATTR_FAAS_DOCUMENT_COLLECTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_DOCUMENT_COLLECTION = TMP_FAAS_DOCUMENT_COLLECTION;
	/**
	* Describes the type of the operation that was performed on the data.
	*
	* @deprecated Use ATTR_FAAS_DOCUMENT_OPERATION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_DOCUMENT_OPERATION = TMP_FAAS_DOCUMENT_OPERATION;
	/**
	* A string containing the time when the data was accessed in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
	*
	* @deprecated Use ATTR_FAAS_DOCUMENT_TIME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_DOCUMENT_TIME = TMP_FAAS_DOCUMENT_TIME;
	/**
	* The document name/table subjected to the operation. For example, in Cloud Storage or S3 is the name of the file, and in Cosmos DB the table name.
	*
	* @deprecated Use ATTR_FAAS_DOCUMENT_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_DOCUMENT_NAME = TMP_FAAS_DOCUMENT_NAME;
	/**
	* A string containing the function invocation time in the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format expressed in [UTC](https://www.w3.org/TR/NOTE-datetime).
	*
	* @deprecated Use ATTR_FAAS_TIME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_TIME = TMP_FAAS_TIME;
	/**
	* A string containing the schedule period as [Cron Expression](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm).
	*
	* @deprecated Use ATTR_FAAS_CRON in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_CRON = TMP_FAAS_CRON;
	/**
	* A boolean that is true if the serverless function is executed for the first time (aka cold-start).
	*
	* @deprecated Use ATTR_FAAS_COLDSTART in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_COLDSTART = TMP_FAAS_COLDSTART;
	/**
	* The name of the invoked function.
	*
	* Note: SHOULD be equal to the `faas.name` resource attribute of the invoked function.
	*
	* @deprecated Use ATTR_FAAS_INVOKED_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_INVOKED_NAME = TMP_FAAS_INVOKED_NAME;
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use ATTR_FAAS_INVOKED_PROVIDER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_INVOKED_PROVIDER = TMP_FAAS_INVOKED_PROVIDER;
	/**
	* The cloud region of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.region` resource attribute of the invoked function.
	*
	* @deprecated Use ATTR_FAAS_INVOKED_REGION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_FAAS_INVOKED_REGION = TMP_FAAS_INVOKED_REGION;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use ATTR_NET_TRANSPORT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_TRANSPORT = TMP_NET_TRANSPORT;
	/**
	* Remote address of the peer (dotted decimal for IPv4 or [RFC5952](https://tools.ietf.org/html/rfc5952) for IPv6).
	*
	* @deprecated Use ATTR_NET_PEER_IP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_PEER_IP = TMP_NET_PEER_IP;
	/**
	* Remote port number.
	*
	* @deprecated Use ATTR_NET_PEER_PORT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_PEER_PORT = TMP_NET_PEER_PORT;
	/**
	* Remote hostname or similar, see note below.
	*
	* @deprecated Use ATTR_NET_PEER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_PEER_NAME = TMP_NET_PEER_NAME;
	/**
	* Like `net.peer.ip` but for the host IP. Useful in case of a multi-IP host.
	*
	* @deprecated Use ATTR_NET_HOST_IP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_IP = TMP_NET_HOST_IP;
	/**
	* Like `net.peer.port` but for the host port.
	*
	* @deprecated Use ATTR_NET_HOST_PORT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_PORT = TMP_NET_HOST_PORT;
	/**
	* Local hostname or similar, see note below.
	*
	* @deprecated Use ATTR_NET_HOST_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_NAME = TMP_NET_HOST_NAME;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use ATTR_NETWORK_CONNECTION_TYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CONNECTION_TYPE = TMP_NET_HOST_CONNECTION_TYPE;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use ATTR_NETWORK_CONNECTION_SUBTYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CONNECTION_SUBTYPE = TMP_NET_HOST_CONNECTION_SUBTYPE;
	/**
	* The name of the mobile carrier.
	*
	* @deprecated Use ATTR_NETWORK_CARRIER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CARRIER_NAME = TMP_NET_HOST_CARRIER_NAME;
	/**
	* The mobile carrier country code.
	*
	* @deprecated Use ATTR_NETWORK_CARRIER_MCC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CARRIER_MCC = TMP_NET_HOST_CARRIER_MCC;
	/**
	* The mobile carrier network code.
	*
	* @deprecated Use ATTR_NETWORK_CARRIER_MNC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CARRIER_MNC = TMP_NET_HOST_CARRIER_MNC;
	/**
	* The ISO 3166-1 alpha-2 2-character country code associated with the mobile carrier network.
	*
	* @deprecated Use ATTR_NETWORK_CARRIER_ICC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_NET_HOST_CARRIER_ICC = TMP_NET_HOST_CARRIER_ICC;
	/**
	* The [`service.name`](../../resource/semantic_conventions/README.md#service) of the remote service. SHOULD be equal to the actual `service.name` resource attribute of the remote service if any.
	*
	* @deprecated Use ATTR_PEER_SERVICE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_PEER_SERVICE = TMP_PEER_SERVICE;
	/**
	* Username or client_id extracted from the access token or [Authorization](https://tools.ietf.org/html/rfc7235#section-4.2) header in the inbound request from outside the system.
	*
	* @deprecated Use ATTR_ENDUSER_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_ENDUSER_ID = TMP_ENDUSER_ID;
	/**
	* Actual/assumed role the client is making the request under extracted from token or application security context.
	*
	* @deprecated Use ATTR_ENDUSER_ROLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_ENDUSER_ROLE = TMP_ENDUSER_ROLE;
	/**
	* Scopes or granted authorities the client currently possesses extracted from token or application security context. The value would come from the scope associated with an [OAuth 2.0 Access Token](https://tools.ietf.org/html/rfc6749#section-3.3) or an attribute value in a [SAML 2.0 Assertion](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html).
	*
	* @deprecated Use ATTR_ENDUSER_SCOPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_ENDUSER_SCOPE = TMP_ENDUSER_SCOPE;
	/**
	* Current &#34;managed&#34; thread ID (as opposed to OS thread ID).
	*
	* @deprecated Use ATTR_THREAD_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_THREAD_ID = TMP_THREAD_ID;
	/**
	* Current thread name.
	*
	* @deprecated Use ATTR_THREAD_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_THREAD_NAME = TMP_THREAD_NAME;
	/**
	* The method or function name, or equivalent (usually rightmost part of the code unit&#39;s name).
	*
	* @deprecated Use ATTR_CODE_FUNCTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_CODE_FUNCTION = TMP_CODE_FUNCTION;
	/**
	* The &#34;namespace&#34; within which `code.function` is defined. Usually the qualified class or module name, such that `code.namespace` + some separator + `code.function` form a unique identifier for the code unit.
	*
	* @deprecated Use ATTR_CODE_NAMESPACE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_CODE_NAMESPACE = TMP_CODE_NAMESPACE;
	/**
	* The source code file name that identifies the code unit as uniquely as possible (preferably an absolute file path).
	*
	* @deprecated Use ATTR_CODE_FILEPATH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_CODE_FILEPATH = TMP_CODE_FILEPATH;
	/**
	* The line number in `code.filepath` best representing the operation. It SHOULD point within the code unit named in `code.function`.
	*
	* @deprecated Use ATTR_CODE_LINENO in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_CODE_LINENO = TMP_CODE_LINENO;
	/**
	* HTTP request method.
	*
	* @deprecated Use ATTR_HTTP_METHOD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_METHOD = TMP_HTTP_METHOD;
	/**
	* Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`. Usually the fragment is not transmitted over HTTP, but if it is known, it should be included nevertheless.
	*
	* Note: `http.url` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case the attribute&#39;s value should be `https://www.example.com/`.
	*
	* @deprecated Use ATTR_HTTP_URL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_URL = TMP_HTTP_URL;
	/**
	* The full request target as passed in a HTTP request line or equivalent.
	*
	* @deprecated Use ATTR_HTTP_TARGET in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_TARGET = TMP_HTTP_TARGET;
	/**
	* The value of the [HTTP host header](https://tools.ietf.org/html/rfc7230#section-5.4). An empty Host header should also be reported, see note.
	*
	* Note: When the header is present but empty the attribute SHOULD be set to the empty string. Note that this is a valid situation that is expected in certain cases, according the aforementioned [section of RFC 7230](https://tools.ietf.org/html/rfc7230#section-5.4). When the header is not set the attribute MUST NOT be set.
	*
	* @deprecated Use ATTR_HTTP_HOST in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_HOST = TMP_HTTP_HOST;
	/**
	* The URI scheme identifying the used protocol.
	*
	* @deprecated Use ATTR_HTTP_SCHEME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_SCHEME = TMP_HTTP_SCHEME;
	/**
	* [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
	*
	* @deprecated Use ATTR_HTTP_STATUS_CODE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_STATUS_CODE = TMP_HTTP_STATUS_CODE;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use ATTR_HTTP_FLAVOR in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_FLAVOR = TMP_HTTP_FLAVOR;
	/**
	* Value of the [HTTP User-Agent](https://tools.ietf.org/html/rfc7231#section-5.5.3) header sent by the client.
	*
	* @deprecated Use ATTR_HTTP_USER_AGENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_USER_AGENT = TMP_HTTP_USER_AGENT;
	/**
	* The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
	*
	* @deprecated Use ATTR_HTTP_REQUEST_CONTENT_LENGTH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH = TMP_HTTP_REQUEST_CONTENT_LENGTH;
	/**
	* The size of the uncompressed request payload body after transport decoding. Not set if transport encoding not used.
	*
	* @deprecated Use ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED;
	/**
	* The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://tools.ietf.org/html/rfc7230#section-3.3.2) header. For requests using transport encoding, this should be the compressed size.
	*
	* @deprecated Use ATTR_HTTP_RESPONSE_CONTENT_LENGTH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = TMP_HTTP_RESPONSE_CONTENT_LENGTH;
	/**
	* The size of the uncompressed response payload body after transport decoding. Not set if transport encoding not used.
	*
	* @deprecated Use ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED;
	/**
	* The primary server name of the matched virtual host. This should be obtained via configuration. If no such configuration can be obtained, this attribute MUST NOT be set ( `net.host.name` should be used instead).
	*
	* Note: `http.url` is usually not readily available on the server side but would have to be assembled in a cumbersome and sometimes lossy process from other information (see e.g. open-telemetry/opentelemetry-python/pull/148). It is thus preferred to supply the raw data that is available.
	*
	* @deprecated Use ATTR_HTTP_SERVER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_SERVER_NAME = TMP_HTTP_SERVER_NAME;
	/**
	* The matched route (path template).
	*
	* @deprecated Use ATTR_HTTP_ROUTE.
	*/
	exports.SEMATTRS_HTTP_ROUTE = TMP_HTTP_ROUTE;
	/**
	* The IP address of the original client behind all proxies, if known (e.g. from [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)).
	*
	* Note: This is not necessarily the same as `net.peer.ip`, which would
	identify the network-level peer, which may be a proxy.
	
	This attribute should be set when a source of information different
	from the one used for `net.peer.ip`, is available even if that other
	source just confirms the same value as `net.peer.ip`.
	Rationale: For `net.peer.ip`, one typically does not know if it
	comes from a proxy, reverse proxy, or the actual client. Setting
	`http.client_ip` when it&#39;s the same as `net.peer.ip` means that
	one is at least somewhat confident that the address is not that of
	the closest proxy.
	*
	* @deprecated Use ATTR_HTTP_CLIENT_IP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_HTTP_CLIENT_IP = TMP_HTTP_CLIENT_IP;
	/**
	* The keys in the `RequestItems` object field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_TABLE_NAMES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_TABLE_NAMES = TMP_AWS_DYNAMODB_TABLE_NAMES;
	/**
	* The JSON-serialized value of each item in the `ConsumedCapacity` response field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_CONSUMED_CAPACITY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_CONSUMED_CAPACITY = TMP_AWS_DYNAMODB_CONSUMED_CAPACITY;
	/**
	* The JSON-serialized value of the `ItemCollectionMetrics` response field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_ITEM_COLLECTION_METRICS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_ITEM_COLLECTION_METRICS = TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS;
	/**
	* The value of the `ProvisionedThroughput.ReadCapacityUnits` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY = TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY;
	/**
	* The value of the `ProvisionedThroughput.WriteCapacityUnits` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY = TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY;
	/**
	* The value of the `ConsistentRead` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_CONSISTENT_READ in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_CONSISTENT_READ = TMP_AWS_DYNAMODB_CONSISTENT_READ;
	/**
	* The value of the `ProjectionExpression` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_PROJECTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_PROJECTION = TMP_AWS_DYNAMODB_PROJECTION;
	/**
	* The value of the `Limit` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_LIMIT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_LIMIT = TMP_AWS_DYNAMODB_LIMIT;
	/**
	* The value of the `AttributesToGet` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_ATTRIBUTES_TO_GET in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_ATTRIBUTES_TO_GET = TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET;
	/**
	* The value of the `IndexName` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_INDEX_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_INDEX_NAME = TMP_AWS_DYNAMODB_INDEX_NAME;
	/**
	* The value of the `Select` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_SELECT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_SELECT = TMP_AWS_DYNAMODB_SELECT;
	/**
	* The JSON-serialized value of each item of the `GlobalSecondaryIndexes` request field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES = TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES;
	/**
	* The JSON-serialized value of each item of the `LocalSecondaryIndexes` request field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES = TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES;
	/**
	* The value of the `ExclusiveStartTableName` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_EXCLUSIVE_START_TABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_EXCLUSIVE_START_TABLE = TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE;
	/**
	* The the number of items in the `TableNames` response parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_TABLE_COUNT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_TABLE_COUNT = TMP_AWS_DYNAMODB_TABLE_COUNT;
	/**
	* The value of the `ScanIndexForward` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_SCAN_FORWARD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_SCAN_FORWARD = TMP_AWS_DYNAMODB_SCAN_FORWARD;
	/**
	* The value of the `Segment` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_SEGMENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_SEGMENT = TMP_AWS_DYNAMODB_SEGMENT;
	/**
	* The value of the `TotalSegments` request parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_TOTAL_SEGMENTS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_TOTAL_SEGMENTS = TMP_AWS_DYNAMODB_TOTAL_SEGMENTS;
	/**
	* The value of the `Count` response parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_COUNT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_COUNT = TMP_AWS_DYNAMODB_COUNT;
	/**
	* The value of the `ScannedCount` response parameter.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_SCANNED_COUNT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_SCANNED_COUNT = TMP_AWS_DYNAMODB_SCANNED_COUNT;
	/**
	* The JSON-serialized value of each item in the `AttributeDefinitions` request field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS = TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS;
	/**
	* The JSON-serialized value of each item in the the `GlobalSecondaryIndexUpdates` request field.
	*
	* @deprecated Use ATTR_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES = TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES;
	/**
	* A string identifying the messaging system.
	*
	* @deprecated Use ATTR_MESSAGING_SYSTEM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_SYSTEM = TMP_MESSAGING_SYSTEM;
	/**
	* The message destination name. This might be equal to the span name but is required nevertheless.
	*
	* @deprecated Use ATTR_MESSAGING_DESTINATION_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_DESTINATION = TMP_MESSAGING_DESTINATION;
	/**
	* The kind of message destination.
	*
	* @deprecated Removed in semconv v1.20.0.
	*/
	exports.SEMATTRS_MESSAGING_DESTINATION_KIND = TMP_MESSAGING_DESTINATION_KIND;
	/**
	* A boolean that is true if the message destination is temporary.
	*
	* @deprecated Use ATTR_MESSAGING_DESTINATION_TEMPORARY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_TEMP_DESTINATION = TMP_MESSAGING_TEMP_DESTINATION;
	/**
	* The name of the transport protocol.
	*
	* @deprecated Use ATTR_NETWORK_PROTOCOL_NAME.
	*/
	exports.SEMATTRS_MESSAGING_PROTOCOL = TMP_MESSAGING_PROTOCOL;
	/**
	* The version of the transport protocol.
	*
	* @deprecated Use ATTR_NETWORK_PROTOCOL_VERSION.
	*/
	exports.SEMATTRS_MESSAGING_PROTOCOL_VERSION = TMP_MESSAGING_PROTOCOL_VERSION;
	/**
	* Connection string.
	*
	* @deprecated Removed in semconv v1.17.0.
	*/
	exports.SEMATTRS_MESSAGING_URL = TMP_MESSAGING_URL;
	/**
	* A value used by the messaging system as an identifier for the message, represented as a string.
	*
	* @deprecated Use ATTR_MESSAGING_MESSAGE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_MESSAGE_ID = TMP_MESSAGING_MESSAGE_ID;
	/**
	* The [conversation ID](#conversations) identifying the conversation to which the message belongs, represented as a string. Sometimes called &#34;Correlation ID&#34;.
	*
	* @deprecated Use ATTR_MESSAGING_MESSAGE_CONVERSATION_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_CONVERSATION_ID = TMP_MESSAGING_CONVERSATION_ID;
	/**
	* The (uncompressed) size of the message payload in bytes. Also use this attribute if it is unknown whether the compressed or uncompressed payload size is reported.
	*
	* @deprecated Use ATTR_MESSAGING_MESSAGE_BODY_SIZE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES = TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES;
	/**
	* The compressed size of the message payload in bytes.
	*
	* @deprecated Removed in semconv v1.22.0.
	*/
	exports.SEMATTRS_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES = TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES;
	/**
	* A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
	*
	* @deprecated Use ATTR_MESSAGING_OPERATION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_OPERATION = TMP_MESSAGING_OPERATION;
	/**
	* The identifier for the consumer receiving a message. For Kafka, set it to `{messaging.kafka.consumer_group} - {messaging.kafka.client_id}`, if both are present, or only `messaging.kafka.consumer_group`. For brokers, such as RabbitMQ and Artemis, set it to the `client_id` of the client consuming the message.
	*
	* @deprecated Removed in semconv v1.21.0.
	*/
	exports.SEMATTRS_MESSAGING_CONSUMER_ID = TMP_MESSAGING_CONSUMER_ID;
	/**
	* RabbitMQ message routing key.
	*
	* @deprecated Use ATTR_MESSAGING_RABBITMQ_DESTINATION_ROUTING_KEY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY = TMP_MESSAGING_RABBITMQ_ROUTING_KEY;
	/**
	* Message keys in Kafka are used for grouping alike messages to ensure they&#39;re processed on the same partition. They differ from `messaging.message_id` in that they&#39;re not unique. If the key is `null`, the attribute MUST NOT be set.
	*
	* Note: If the key type is not string, it&#39;s string representation has to be supplied for the attribute. If the key has no unambiguous, canonical string form, don&#39;t include its value.
	*
	* @deprecated Use ATTR_MESSAGING_KAFKA_MESSAGE_KEY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_MESSAGE_KEY = TMP_MESSAGING_KAFKA_MESSAGE_KEY;
	/**
	* Name of the Kafka Consumer Group that is handling the message. Only applies to consumers, not producers.
	*
	* @deprecated Use ATTR_MESSAGING_KAFKA_CONSUMER_GROUP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_CONSUMER_GROUP = TMP_MESSAGING_KAFKA_CONSUMER_GROUP;
	/**
	* Client Id for the Consumer or Producer that is handling the message.
	*
	* @deprecated Use ATTR_MESSAGING_CLIENT_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_CLIENT_ID = TMP_MESSAGING_KAFKA_CLIENT_ID;
	/**
	* Partition the message is sent to.
	*
	* @deprecated Use ATTR_MESSAGING_KAFKA_DESTINATION_PARTITION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_PARTITION = TMP_MESSAGING_KAFKA_PARTITION;
	/**
	* A boolean that is true if the message is a tombstone.
	*
	* @deprecated Use ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGING_KAFKA_TOMBSTONE = TMP_MESSAGING_KAFKA_TOMBSTONE;
	/**
	* A string identifying the remoting system.
	*
	* @deprecated Use ATTR_RPC_SYSTEM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_SYSTEM = TMP_RPC_SYSTEM;
	/**
	* The full (logical) name of the service being called, including its package name, if applicable.
	*
	* Note: This is the logical name of the service from the RPC interface perspective, which can be different from the name of any implementing class. The `code.namespace` attribute may be used to store the latter (despite the attribute name, it may include a class name; e.g., class with method actually executing the call on the server side, RPC client stub class on the client side).
	*
	* @deprecated Use ATTR_RPC_SERVICE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_SERVICE = TMP_RPC_SERVICE;
	/**
	* The name of the (logical) method being called, must be equal to the $method part in the span name.
	*
	* Note: This is the logical name of the method from the RPC interface perspective, which can be different from the name of any implementing method/function. The `code.function` attribute may be used to store the latter (e.g., method actually executing the call on the server side, RPC client stub method on the client side).
	*
	* @deprecated Use ATTR_RPC_METHOD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_METHOD = TMP_RPC_METHOD;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use ATTR_RPC_GRPC_STATUS_CODE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_GRPC_STATUS_CODE = TMP_RPC_GRPC_STATUS_CODE;
	/**
	* Protocol version as in `jsonrpc` property of request/response. Since JSON-RPC 1.0 does not specify this, the value can be omitted.
	*
	* @deprecated Use ATTR_RPC_JSONRPC_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_JSONRPC_VERSION = TMP_RPC_JSONRPC_VERSION;
	/**
	* `id` property of request or response. Since protocol allows id to be int, string, `null` or missing (for notifications), value is expected to be cast to string for simplicity. Use empty string in case of `null` value. Omit entirely if this is a notification.
	*
	* @deprecated Use ATTR_RPC_JSONRPC_REQUEST_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_JSONRPC_REQUEST_ID = TMP_RPC_JSONRPC_REQUEST_ID;
	/**
	* `error.code` property of response if it is an error response.
	*
	* @deprecated Use ATTR_RPC_JSONRPC_ERROR_CODE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_JSONRPC_ERROR_CODE = TMP_RPC_JSONRPC_ERROR_CODE;
	/**
	* `error.message` property of response if it is an error response.
	*
	* @deprecated Use ATTR_RPC_JSONRPC_ERROR_MESSAGE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_RPC_JSONRPC_ERROR_MESSAGE = TMP_RPC_JSONRPC_ERROR_MESSAGE;
	/**
	* Whether this is a received or sent message.
	*
	* @deprecated Use ATTR_MESSAGE_TYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGE_TYPE = TMP_MESSAGE_TYPE;
	/**
	* MUST be calculated as two different counters starting from `1` one for sent messages and one for received message.
	*
	* Note: This way we guarantee that the values will be consistent between different implementations.
	*
	* @deprecated Use ATTR_MESSAGE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGE_ID = TMP_MESSAGE_ID;
	/**
	* Compressed size of the message in bytes.
	*
	* @deprecated Use ATTR_MESSAGE_COMPRESSED_SIZE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGE_COMPRESSED_SIZE = TMP_MESSAGE_COMPRESSED_SIZE;
	/**
	* Uncompressed size of the message in bytes.
	*
	* @deprecated Use ATTR_MESSAGE_UNCOMPRESSED_SIZE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMATTRS_MESSAGE_UNCOMPRESSED_SIZE = TMP_MESSAGE_UNCOMPRESSED_SIZE;
	/**
	* Create exported Value Map for SemanticAttributes values
	* @deprecated Use the SEMATTRS_XXXXX constants rather than the SemanticAttributes.XXXXX for bundle minification
	*/
	exports.SemanticAttributes = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_AWS_LAMBDA_INVOKED_ARN,
		TMP_DB_SYSTEM,
		TMP_DB_CONNECTION_STRING,
		TMP_DB_USER,
		TMP_DB_JDBC_DRIVER_CLASSNAME,
		TMP_DB_NAME,
		TMP_DB_STATEMENT,
		TMP_DB_OPERATION,
		TMP_DB_MSSQL_INSTANCE_NAME,
		TMP_DB_CASSANDRA_KEYSPACE,
		TMP_DB_CASSANDRA_PAGE_SIZE,
		TMP_DB_CASSANDRA_CONSISTENCY_LEVEL,
		TMP_DB_CASSANDRA_TABLE,
		TMP_DB_CASSANDRA_IDEMPOTENCE,
		TMP_DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT,
		TMP_DB_CASSANDRA_COORDINATOR_ID,
		TMP_DB_CASSANDRA_COORDINATOR_DC,
		TMP_DB_HBASE_NAMESPACE,
		TMP_DB_REDIS_DATABASE_INDEX,
		TMP_DB_MONGODB_COLLECTION,
		TMP_DB_SQL_TABLE,
		TMP_EXCEPTION_TYPE,
		TMP_EXCEPTION_MESSAGE,
		TMP_EXCEPTION_STACKTRACE,
		TMP_EXCEPTION_ESCAPED,
		TMP_FAAS_TRIGGER,
		TMP_FAAS_EXECUTION,
		TMP_FAAS_DOCUMENT_COLLECTION,
		TMP_FAAS_DOCUMENT_OPERATION,
		TMP_FAAS_DOCUMENT_TIME,
		TMP_FAAS_DOCUMENT_NAME,
		TMP_FAAS_TIME,
		TMP_FAAS_CRON,
		TMP_FAAS_COLDSTART,
		TMP_FAAS_INVOKED_NAME,
		TMP_FAAS_INVOKED_PROVIDER,
		TMP_FAAS_INVOKED_REGION,
		TMP_NET_TRANSPORT,
		TMP_NET_PEER_IP,
		TMP_NET_PEER_PORT,
		TMP_NET_PEER_NAME,
		TMP_NET_HOST_IP,
		TMP_NET_HOST_PORT,
		TMP_NET_HOST_NAME,
		TMP_NET_HOST_CONNECTION_TYPE,
		TMP_NET_HOST_CONNECTION_SUBTYPE,
		TMP_NET_HOST_CARRIER_NAME,
		TMP_NET_HOST_CARRIER_MCC,
		TMP_NET_HOST_CARRIER_MNC,
		TMP_NET_HOST_CARRIER_ICC,
		TMP_PEER_SERVICE,
		TMP_ENDUSER_ID,
		TMP_ENDUSER_ROLE,
		TMP_ENDUSER_SCOPE,
		TMP_THREAD_ID,
		TMP_THREAD_NAME,
		TMP_CODE_FUNCTION,
		TMP_CODE_NAMESPACE,
		TMP_CODE_FILEPATH,
		TMP_CODE_LINENO,
		TMP_HTTP_METHOD,
		TMP_HTTP_URL,
		TMP_HTTP_TARGET,
		TMP_HTTP_HOST,
		TMP_HTTP_SCHEME,
		TMP_HTTP_STATUS_CODE,
		TMP_HTTP_FLAVOR,
		TMP_HTTP_USER_AGENT,
		TMP_HTTP_REQUEST_CONTENT_LENGTH,
		TMP_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
		TMP_HTTP_RESPONSE_CONTENT_LENGTH,
		TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
		TMP_HTTP_SERVER_NAME,
		TMP_HTTP_ROUTE,
		TMP_HTTP_CLIENT_IP,
		TMP_AWS_DYNAMODB_TABLE_NAMES,
		TMP_AWS_DYNAMODB_CONSUMED_CAPACITY,
		TMP_AWS_DYNAMODB_ITEM_COLLECTION_METRICS,
		TMP_AWS_DYNAMODB_PROVISIONED_READ_CAPACITY,
		TMP_AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY,
		TMP_AWS_DYNAMODB_CONSISTENT_READ,
		TMP_AWS_DYNAMODB_PROJECTION,
		TMP_AWS_DYNAMODB_LIMIT,
		TMP_AWS_DYNAMODB_ATTRIBUTES_TO_GET,
		TMP_AWS_DYNAMODB_INDEX_NAME,
		TMP_AWS_DYNAMODB_SELECT,
		TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES,
		TMP_AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES,
		TMP_AWS_DYNAMODB_EXCLUSIVE_START_TABLE,
		TMP_AWS_DYNAMODB_TABLE_COUNT,
		TMP_AWS_DYNAMODB_SCAN_FORWARD,
		TMP_AWS_DYNAMODB_SEGMENT,
		TMP_AWS_DYNAMODB_TOTAL_SEGMENTS,
		TMP_AWS_DYNAMODB_COUNT,
		TMP_AWS_DYNAMODB_SCANNED_COUNT,
		TMP_AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS,
		TMP_AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES,
		TMP_MESSAGING_SYSTEM,
		TMP_MESSAGING_DESTINATION,
		TMP_MESSAGING_DESTINATION_KIND,
		TMP_MESSAGING_TEMP_DESTINATION,
		TMP_MESSAGING_PROTOCOL,
		TMP_MESSAGING_PROTOCOL_VERSION,
		TMP_MESSAGING_URL,
		TMP_MESSAGING_MESSAGE_ID,
		TMP_MESSAGING_CONVERSATION_ID,
		TMP_MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES,
		TMP_MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES,
		TMP_MESSAGING_OPERATION,
		TMP_MESSAGING_CONSUMER_ID,
		TMP_MESSAGING_RABBITMQ_ROUTING_KEY,
		TMP_MESSAGING_KAFKA_MESSAGE_KEY,
		TMP_MESSAGING_KAFKA_CONSUMER_GROUP,
		TMP_MESSAGING_KAFKA_CLIENT_ID,
		TMP_MESSAGING_KAFKA_PARTITION,
		TMP_MESSAGING_KAFKA_TOMBSTONE,
		TMP_RPC_SYSTEM,
		TMP_RPC_SERVICE,
		TMP_RPC_METHOD,
		TMP_RPC_GRPC_STATUS_CODE,
		TMP_RPC_JSONRPC_VERSION,
		TMP_RPC_JSONRPC_REQUEST_ID,
		TMP_RPC_JSONRPC_ERROR_CODE,
		TMP_RPC_JSONRPC_ERROR_MESSAGE,
		TMP_MESSAGE_TYPE,
		TMP_MESSAGE_ID,
		TMP_MESSAGE_COMPRESSED_SIZE,
		TMP_MESSAGE_UNCOMPRESSED_SIZE
	]);
	var TMP_DBSYSTEMVALUES_OTHER_SQL = "other_sql";
	var TMP_DBSYSTEMVALUES_MSSQL = "mssql";
	var TMP_DBSYSTEMVALUES_MYSQL = "mysql";
	var TMP_DBSYSTEMVALUES_ORACLE = "oracle";
	var TMP_DBSYSTEMVALUES_DB2 = "db2";
	var TMP_DBSYSTEMVALUES_POSTGRESQL = "postgresql";
	var TMP_DBSYSTEMVALUES_REDSHIFT = "redshift";
	var TMP_DBSYSTEMVALUES_HIVE = "hive";
	var TMP_DBSYSTEMVALUES_CLOUDSCAPE = "cloudscape";
	var TMP_DBSYSTEMVALUES_HSQLDB = "hsqldb";
	var TMP_DBSYSTEMVALUES_PROGRESS = "progress";
	var TMP_DBSYSTEMVALUES_MAXDB = "maxdb";
	var TMP_DBSYSTEMVALUES_HANADB = "hanadb";
	var TMP_DBSYSTEMVALUES_INGRES = "ingres";
	var TMP_DBSYSTEMVALUES_FIRSTSQL = "firstsql";
	var TMP_DBSYSTEMVALUES_EDB = "edb";
	var TMP_DBSYSTEMVALUES_CACHE = "cache";
	var TMP_DBSYSTEMVALUES_ADABAS = "adabas";
	var TMP_DBSYSTEMVALUES_FIREBIRD = "firebird";
	var TMP_DBSYSTEMVALUES_DERBY = "derby";
	var TMP_DBSYSTEMVALUES_FILEMAKER = "filemaker";
	var TMP_DBSYSTEMVALUES_INFORMIX = "informix";
	var TMP_DBSYSTEMVALUES_INSTANTDB = "instantdb";
	var TMP_DBSYSTEMVALUES_INTERBASE = "interbase";
	var TMP_DBSYSTEMVALUES_MARIADB = "mariadb";
	var TMP_DBSYSTEMVALUES_NETEZZA = "netezza";
	var TMP_DBSYSTEMVALUES_PERVASIVE = "pervasive";
	var TMP_DBSYSTEMVALUES_POINTBASE = "pointbase";
	var TMP_DBSYSTEMVALUES_SQLITE = "sqlite";
	var TMP_DBSYSTEMVALUES_SYBASE = "sybase";
	var TMP_DBSYSTEMVALUES_TERADATA = "teradata";
	var TMP_DBSYSTEMVALUES_VERTICA = "vertica";
	var TMP_DBSYSTEMVALUES_H2 = "h2";
	var TMP_DBSYSTEMVALUES_COLDFUSION = "coldfusion";
	var TMP_DBSYSTEMVALUES_CASSANDRA = "cassandra";
	var TMP_DBSYSTEMVALUES_HBASE = "hbase";
	var TMP_DBSYSTEMVALUES_MONGODB = "mongodb";
	var TMP_DBSYSTEMVALUES_REDIS = "redis";
	var TMP_DBSYSTEMVALUES_COUCHBASE = "couchbase";
	var TMP_DBSYSTEMVALUES_COUCHDB = "couchdb";
	var TMP_DBSYSTEMVALUES_COSMOSDB = "cosmosdb";
	var TMP_DBSYSTEMVALUES_DYNAMODB = "dynamodb";
	var TMP_DBSYSTEMVALUES_NEO4J = "neo4j";
	var TMP_DBSYSTEMVALUES_GEODE = "geode";
	var TMP_DBSYSTEMVALUES_ELASTICSEARCH = "elasticsearch";
	var TMP_DBSYSTEMVALUES_MEMCACHED = "memcached";
	var TMP_DBSYSTEMVALUES_COCKROACHDB = "cockroachdb";
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_OTHER_SQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_OTHER_SQL = TMP_DBSYSTEMVALUES_OTHER_SQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MSSQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MSSQL = TMP_DBSYSTEMVALUES_MSSQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MYSQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MYSQL = TMP_DBSYSTEMVALUES_MYSQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_ORACLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_ORACLE = TMP_DBSYSTEMVALUES_ORACLE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_DB2 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_DB2 = TMP_DBSYSTEMVALUES_DB2;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_POSTGRESQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_POSTGRESQL = TMP_DBSYSTEMVALUES_POSTGRESQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_REDSHIFT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_REDSHIFT = TMP_DBSYSTEMVALUES_REDSHIFT;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_HIVE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_HIVE = TMP_DBSYSTEMVALUES_HIVE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_CLOUDSCAPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_CLOUDSCAPE = TMP_DBSYSTEMVALUES_CLOUDSCAPE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_HSQLDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_HSQLDB = TMP_DBSYSTEMVALUES_HSQLDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_PROGRESS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_PROGRESS = TMP_DBSYSTEMVALUES_PROGRESS;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MAXDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MAXDB = TMP_DBSYSTEMVALUES_MAXDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_HANADB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_HANADB = TMP_DBSYSTEMVALUES_HANADB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_INGRES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_INGRES = TMP_DBSYSTEMVALUES_INGRES;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_FIRSTSQL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_FIRSTSQL = TMP_DBSYSTEMVALUES_FIRSTSQL;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_EDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_EDB = TMP_DBSYSTEMVALUES_EDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_CACHE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_CACHE = TMP_DBSYSTEMVALUES_CACHE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_ADABAS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_ADABAS = TMP_DBSYSTEMVALUES_ADABAS;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_FIREBIRD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_FIREBIRD = TMP_DBSYSTEMVALUES_FIREBIRD;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_DERBY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_DERBY = TMP_DBSYSTEMVALUES_DERBY;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_FILEMAKER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_FILEMAKER = TMP_DBSYSTEMVALUES_FILEMAKER;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_INFORMIX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_INFORMIX = TMP_DBSYSTEMVALUES_INFORMIX;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_INSTANTDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_INSTANTDB = TMP_DBSYSTEMVALUES_INSTANTDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_INTERBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_INTERBASE = TMP_DBSYSTEMVALUES_INTERBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MARIADB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MARIADB = TMP_DBSYSTEMVALUES_MARIADB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_NETEZZA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_NETEZZA = TMP_DBSYSTEMVALUES_NETEZZA;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_PERVASIVE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_PERVASIVE = TMP_DBSYSTEMVALUES_PERVASIVE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_POINTBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_POINTBASE = TMP_DBSYSTEMVALUES_POINTBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_SQLITE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_SQLITE = TMP_DBSYSTEMVALUES_SQLITE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_SYBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_SYBASE = TMP_DBSYSTEMVALUES_SYBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_TERADATA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_TERADATA = TMP_DBSYSTEMVALUES_TERADATA;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_VERTICA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_VERTICA = TMP_DBSYSTEMVALUES_VERTICA;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_H2 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_H2 = TMP_DBSYSTEMVALUES_H2;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COLDFUSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COLDFUSION = TMP_DBSYSTEMVALUES_COLDFUSION;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_CASSANDRA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_CASSANDRA = TMP_DBSYSTEMVALUES_CASSANDRA;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_HBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_HBASE = TMP_DBSYSTEMVALUES_HBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MONGODB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MONGODB = TMP_DBSYSTEMVALUES_MONGODB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_REDIS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_REDIS = TMP_DBSYSTEMVALUES_REDIS;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COUCHBASE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COUCHBASE = TMP_DBSYSTEMVALUES_COUCHBASE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COUCHDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COUCHDB = TMP_DBSYSTEMVALUES_COUCHDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COSMOSDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COSMOSDB = TMP_DBSYSTEMVALUES_COSMOSDB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_DYNAMODB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_DYNAMODB = TMP_DBSYSTEMVALUES_DYNAMODB;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_NEO4J in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_NEO4J = TMP_DBSYSTEMVALUES_NEO4J;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_GEODE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_GEODE = TMP_DBSYSTEMVALUES_GEODE;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_ELASTICSEARCH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_ELASTICSEARCH = TMP_DBSYSTEMVALUES_ELASTICSEARCH;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_MEMCACHED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_MEMCACHED = TMP_DBSYSTEMVALUES_MEMCACHED;
	/**
	* An identifier for the database management system (DBMS) product being used. See below for a list of well-known identifiers.
	*
	* @deprecated Use DB_SYSTEM_VALUE_COCKROACHDB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBSYSTEMVALUES_COCKROACHDB = TMP_DBSYSTEMVALUES_COCKROACHDB;
	/**
	* The constant map of values for DbSystemValues.
	* @deprecated Use the DBSYSTEMVALUES_XXXXX constants rather than the DbSystemValues.XXXXX for bundle minification.
	*/
	exports.DbSystemValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_DBSYSTEMVALUES_OTHER_SQL,
		TMP_DBSYSTEMVALUES_MSSQL,
		TMP_DBSYSTEMVALUES_MYSQL,
		TMP_DBSYSTEMVALUES_ORACLE,
		TMP_DBSYSTEMVALUES_DB2,
		TMP_DBSYSTEMVALUES_POSTGRESQL,
		TMP_DBSYSTEMVALUES_REDSHIFT,
		TMP_DBSYSTEMVALUES_HIVE,
		TMP_DBSYSTEMVALUES_CLOUDSCAPE,
		TMP_DBSYSTEMVALUES_HSQLDB,
		TMP_DBSYSTEMVALUES_PROGRESS,
		TMP_DBSYSTEMVALUES_MAXDB,
		TMP_DBSYSTEMVALUES_HANADB,
		TMP_DBSYSTEMVALUES_INGRES,
		TMP_DBSYSTEMVALUES_FIRSTSQL,
		TMP_DBSYSTEMVALUES_EDB,
		TMP_DBSYSTEMVALUES_CACHE,
		TMP_DBSYSTEMVALUES_ADABAS,
		TMP_DBSYSTEMVALUES_FIREBIRD,
		TMP_DBSYSTEMVALUES_DERBY,
		TMP_DBSYSTEMVALUES_FILEMAKER,
		TMP_DBSYSTEMVALUES_INFORMIX,
		TMP_DBSYSTEMVALUES_INSTANTDB,
		TMP_DBSYSTEMVALUES_INTERBASE,
		TMP_DBSYSTEMVALUES_MARIADB,
		TMP_DBSYSTEMVALUES_NETEZZA,
		TMP_DBSYSTEMVALUES_PERVASIVE,
		TMP_DBSYSTEMVALUES_POINTBASE,
		TMP_DBSYSTEMVALUES_SQLITE,
		TMP_DBSYSTEMVALUES_SYBASE,
		TMP_DBSYSTEMVALUES_TERADATA,
		TMP_DBSYSTEMVALUES_VERTICA,
		TMP_DBSYSTEMVALUES_H2,
		TMP_DBSYSTEMVALUES_COLDFUSION,
		TMP_DBSYSTEMVALUES_CASSANDRA,
		TMP_DBSYSTEMVALUES_HBASE,
		TMP_DBSYSTEMVALUES_MONGODB,
		TMP_DBSYSTEMVALUES_REDIS,
		TMP_DBSYSTEMVALUES_COUCHBASE,
		TMP_DBSYSTEMVALUES_COUCHDB,
		TMP_DBSYSTEMVALUES_COSMOSDB,
		TMP_DBSYSTEMVALUES_DYNAMODB,
		TMP_DBSYSTEMVALUES_NEO4J,
		TMP_DBSYSTEMVALUES_GEODE,
		TMP_DBSYSTEMVALUES_ELASTICSEARCH,
		TMP_DBSYSTEMVALUES_MEMCACHED,
		TMP_DBSYSTEMVALUES_COCKROACHDB
	]);
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL = "all";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = "each_quorum";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = "quorum";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = "local_quorum";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE = "one";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO = "two";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE = "three";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = "local_one";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY = "any";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = "serial";
	var TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = "local_serial";
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ALL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_ALL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_EACH_QUORUM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_QUORUM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_QUORUM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_ONE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_TWO in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_TWO = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_THREE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_THREE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_ONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_ANY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_ANY = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_SERIAL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL;
	/**
	* The consistency level of the query. Based on consistency values from [CQL](https://docs.datastax.com/en/cassandra-oss/3.0/cassandra/dml/dmlConfigConsistency.html).
	*
	* @deprecated Use DB_CASSANDRA_CONSISTENCY_LEVEL_VALUE_LOCAL_SERIAL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL = TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL;
	/**
	* The constant map of values for DbCassandraConsistencyLevelValues.
	* @deprecated Use the DBCASSANDRACONSISTENCYLEVELVALUES_XXXXX constants rather than the DbCassandraConsistencyLevelValues.XXXXX for bundle minification.
	*/
	exports.DbCassandraConsistencyLevelValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ALL,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_EACH_QUORUM,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_QUORUM,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_QUORUM,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ONE,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_TWO,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_THREE,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_ONE,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_ANY,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_SERIAL,
		TMP_DBCASSANDRACONSISTENCYLEVELVALUES_LOCAL_SERIAL
	]);
	var TMP_FAASTRIGGERVALUES_DATASOURCE = "datasource";
	var TMP_FAASTRIGGERVALUES_HTTP = "http";
	var TMP_FAASTRIGGERVALUES_PUBSUB = "pubsub";
	var TMP_FAASTRIGGERVALUES_TIMER = "timer";
	var TMP_FAASTRIGGERVALUES_OTHER = "other";
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_DATASOURCE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_DATASOURCE = TMP_FAASTRIGGERVALUES_DATASOURCE;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_HTTP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_HTTP = TMP_FAASTRIGGERVALUES_HTTP;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_PUBSUB in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_PUBSUB = TMP_FAASTRIGGERVALUES_PUBSUB;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_TIMER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_TIMER = TMP_FAASTRIGGERVALUES_TIMER;
	/**
	* Type of the trigger on which the function is executed.
	*
	* @deprecated Use FAAS_TRIGGER_VALUE_OTHER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASTRIGGERVALUES_OTHER = TMP_FAASTRIGGERVALUES_OTHER;
	/**
	* The constant map of values for FaasTriggerValues.
	* @deprecated Use the FAASTRIGGERVALUES_XXXXX constants rather than the FaasTriggerValues.XXXXX for bundle minification.
	*/
	exports.FaasTriggerValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_FAASTRIGGERVALUES_DATASOURCE,
		TMP_FAASTRIGGERVALUES_HTTP,
		TMP_FAASTRIGGERVALUES_PUBSUB,
		TMP_FAASTRIGGERVALUES_TIMER,
		TMP_FAASTRIGGERVALUES_OTHER
	]);
	var TMP_FAASDOCUMENTOPERATIONVALUES_INSERT = "insert";
	var TMP_FAASDOCUMENTOPERATIONVALUES_EDIT = "edit";
	var TMP_FAASDOCUMENTOPERATIONVALUES_DELETE = "delete";
	/**
	* Describes the type of the operation that was performed on the data.
	*
	* @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_INSERT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASDOCUMENTOPERATIONVALUES_INSERT = TMP_FAASDOCUMENTOPERATIONVALUES_INSERT;
	/**
	* Describes the type of the operation that was performed on the data.
	*
	* @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_EDIT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASDOCUMENTOPERATIONVALUES_EDIT = TMP_FAASDOCUMENTOPERATIONVALUES_EDIT;
	/**
	* Describes the type of the operation that was performed on the data.
	*
	* @deprecated Use FAAS_DOCUMENT_OPERATION_VALUE_DELETE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASDOCUMENTOPERATIONVALUES_DELETE = TMP_FAASDOCUMENTOPERATIONVALUES_DELETE;
	/**
	* The constant map of values for FaasDocumentOperationValues.
	* @deprecated Use the FAASDOCUMENTOPERATIONVALUES_XXXXX constants rather than the FaasDocumentOperationValues.XXXXX for bundle minification.
	*/
	exports.FaasDocumentOperationValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_FAASDOCUMENTOPERATIONVALUES_INSERT,
		TMP_FAASDOCUMENTOPERATIONVALUES_EDIT,
		TMP_FAASDOCUMENTOPERATIONVALUES_DELETE
	]);
	var TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = "alibaba_cloud";
	var TMP_FAASINVOKEDPROVIDERVALUES_AWS = "aws";
	var TMP_FAASINVOKEDPROVIDERVALUES_AZURE = "azure";
	var TMP_FAASINVOKEDPROVIDERVALUES_GCP = "gcp";
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_ALIBABA_CLOUD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD = TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD;
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_AWS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASINVOKEDPROVIDERVALUES_AWS = TMP_FAASINVOKEDPROVIDERVALUES_AWS;
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_AZURE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASINVOKEDPROVIDERVALUES_AZURE = TMP_FAASINVOKEDPROVIDERVALUES_AZURE;
	/**
	* The cloud provider of the invoked function.
	*
	* Note: SHOULD be equal to the `cloud.provider` resource attribute of the invoked function.
	*
	* @deprecated Use FAAS_INVOKED_PROVIDER_VALUE_GCP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.FAASINVOKEDPROVIDERVALUES_GCP = TMP_FAASINVOKEDPROVIDERVALUES_GCP;
	/**
	* The constant map of values for FaasInvokedProviderValues.
	* @deprecated Use the FAASINVOKEDPROVIDERVALUES_XXXXX constants rather than the FaasInvokedProviderValues.XXXXX for bundle minification.
	*/
	exports.FaasInvokedProviderValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_FAASINVOKEDPROVIDERVALUES_ALIBABA_CLOUD,
		TMP_FAASINVOKEDPROVIDERVALUES_AWS,
		TMP_FAASINVOKEDPROVIDERVALUES_AZURE,
		TMP_FAASINVOKEDPROVIDERVALUES_GCP
	]);
	var TMP_NETTRANSPORTVALUES_IP_TCP = "ip_tcp";
	var TMP_NETTRANSPORTVALUES_IP_UDP = "ip_udp";
	var TMP_NETTRANSPORTVALUES_IP = "ip";
	var TMP_NETTRANSPORTVALUES_UNIX = "unix";
	var TMP_NETTRANSPORTVALUES_PIPE = "pipe";
	var TMP_NETTRANSPORTVALUES_INPROC = "inproc";
	var TMP_NETTRANSPORTVALUES_OTHER = "other";
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_IP_TCP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_IP_TCP = TMP_NETTRANSPORTVALUES_IP_TCP;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_IP_UDP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_IP_UDP = TMP_NETTRANSPORTVALUES_IP_UDP;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Removed in v1.21.0.
	*/
	exports.NETTRANSPORTVALUES_IP = TMP_NETTRANSPORTVALUES_IP;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Removed in v1.21.0.
	*/
	exports.NETTRANSPORTVALUES_UNIX = TMP_NETTRANSPORTVALUES_UNIX;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_PIPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_PIPE = TMP_NETTRANSPORTVALUES_PIPE;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_INPROC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_INPROC = TMP_NETTRANSPORTVALUES_INPROC;
	/**
	* Transport protocol used. See note below.
	*
	* @deprecated Use NET_TRANSPORT_VALUE_OTHER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETTRANSPORTVALUES_OTHER = TMP_NETTRANSPORTVALUES_OTHER;
	/**
	* The constant map of values for NetTransportValues.
	* @deprecated Use the NETTRANSPORTVALUES_XXXXX constants rather than the NetTransportValues.XXXXX for bundle minification.
	*/
	exports.NetTransportValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_NETTRANSPORTVALUES_IP_TCP,
		TMP_NETTRANSPORTVALUES_IP_UDP,
		TMP_NETTRANSPORTVALUES_IP,
		TMP_NETTRANSPORTVALUES_UNIX,
		TMP_NETTRANSPORTVALUES_PIPE,
		TMP_NETTRANSPORTVALUES_INPROC,
		TMP_NETTRANSPORTVALUES_OTHER
	]);
	var TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI = "wifi";
	var TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED = "wired";
	var TMP_NETHOSTCONNECTIONTYPEVALUES_CELL = "cell";
	var TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = "unavailable";
	var TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = "unknown";
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_WIFI in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_WIFI = TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_WIRED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_WIRED = TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_CELL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_CELL = TMP_NETHOSTCONNECTIONTYPEVALUES_CELL;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_UNAVAILABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE = TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE;
	/**
	* The internet connection type currently being used by the host.
	*
	* @deprecated Use NETWORK_CONNECTION_TYPE_VALUE_UNKNOWN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONTYPEVALUES_UNKNOWN = TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN;
	/**
	* The constant map of values for NetHostConnectionTypeValues.
	* @deprecated Use the NETHOSTCONNECTIONTYPEVALUES_XXXXX constants rather than the NetHostConnectionTypeValues.XXXXX for bundle minification.
	*/
	exports.NetHostConnectionTypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_NETHOSTCONNECTIONTYPEVALUES_WIFI,
		TMP_NETHOSTCONNECTIONTYPEVALUES_WIRED,
		TMP_NETHOSTCONNECTIONTYPEVALUES_CELL,
		TMP_NETHOSTCONNECTIONTYPEVALUES_UNAVAILABLE,
		TMP_NETHOSTCONNECTIONTYPEVALUES_UNKNOWN
	]);
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = "gprs";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = "edge";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = "umts";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = "cdma";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = "evdo_0";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = "evdo_a";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = "cdma2000_1xrtt";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = "hsdpa";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = "hsupa";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = "hspa";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = "iden";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = "evdo_b";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE = "lte";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = "ehrpd";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = "hspap";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM = "gsm";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = "td_scdma";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = "iwlan";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR = "nr";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = "nrnsa";
	var TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = "lte_ca";
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_GPRS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_GPRS = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EDGE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EDGE = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_UMTS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_UMTS = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_CDMA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_0 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0 = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_A in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_CDMA2000_1XRTT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_HSDPA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_HSUPA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_HSPA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSPA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_IDEN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_IDEN = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EVDO_B in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_LTE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_LTE = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_EHRPD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_HSPAP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_GSM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_GSM = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_TD_SCDMA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_IWLAN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_NR in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_NR = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_NRNSA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA;
	/**
	* This describes more details regarding the connection.type. It may be the type of cell technology connection, but it could be used for describing details about a wifi connection.
	*
	* @deprecated Use NETWORK_CONNECTION_SUBTYPE_VALUE_LTE_CA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA = TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA;
	/**
	* The constant map of values for NetHostConnectionSubtypeValues.
	* @deprecated Use the NETHOSTCONNECTIONSUBTYPEVALUES_XXXXX constants rather than the NetHostConnectionSubtypeValues.XXXXX for bundle minification.
	*/
	exports.NetHostConnectionSubtypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GPRS,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EDGE,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_UMTS,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_0,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_A,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_CDMA2000_1XRTT,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSDPA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSUPA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IDEN,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EVDO_B,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_EHRPD,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_HSPAP,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_GSM,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_TD_SCDMA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_IWLAN,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NR,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_NRNSA,
		TMP_NETHOSTCONNECTIONSUBTYPEVALUES_LTE_CA
	]);
	var TMP_HTTPFLAVORVALUES_HTTP_1_0 = "1.0";
	var TMP_HTTPFLAVORVALUES_HTTP_1_1 = "1.1";
	var TMP_HTTPFLAVORVALUES_HTTP_2_0 = "2.0";
	var TMP_HTTPFLAVORVALUES_SPDY = "SPDY";
	var TMP_HTTPFLAVORVALUES_QUIC = "QUIC";
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_HTTP_1_0 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_HTTP_1_0 = TMP_HTTPFLAVORVALUES_HTTP_1_0;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_HTTP_1_1 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_HTTP_1_1 = TMP_HTTPFLAVORVALUES_HTTP_1_1;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_HTTP_2_0 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_HTTP_2_0 = TMP_HTTPFLAVORVALUES_HTTP_2_0;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_SPDY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_SPDY = TMP_HTTPFLAVORVALUES_SPDY;
	/**
	* Kind of HTTP protocol used.
	*
	* Note: If `net.transport` is not specified, it can be assumed to be `IP.TCP` except if `http.flavor` is `QUIC`, in which case `IP.UDP` is assumed.
	*
	* @deprecated Use HTTP_FLAVOR_VALUE_QUIC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HTTPFLAVORVALUES_QUIC = TMP_HTTPFLAVORVALUES_QUIC;
	/**
	* The constant map of values for HttpFlavorValues.
	* @deprecated Use the HTTPFLAVORVALUES_XXXXX constants rather than the HttpFlavorValues.XXXXX for bundle minification.
	*/
	exports.HttpFlavorValues = {
		HTTP_1_0: TMP_HTTPFLAVORVALUES_HTTP_1_0,
		HTTP_1_1: TMP_HTTPFLAVORVALUES_HTTP_1_1,
		HTTP_2_0: TMP_HTTPFLAVORVALUES_HTTP_2_0,
		SPDY: TMP_HTTPFLAVORVALUES_SPDY,
		QUIC: TMP_HTTPFLAVORVALUES_QUIC
	};
	var TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE = "queue";
	var TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC = "topic";
	/**
	* The kind of message destination.
	*
	* @deprecated Removed in semconv v1.20.0.
	*/
	exports.MESSAGINGDESTINATIONKINDVALUES_QUEUE = TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE;
	/**
	* The kind of message destination.
	*
	* @deprecated Removed in semconv v1.20.0.
	*/
	exports.MESSAGINGDESTINATIONKINDVALUES_TOPIC = TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC;
	/**
	* The constant map of values for MessagingDestinationKindValues.
	* @deprecated Use the MESSAGINGDESTINATIONKINDVALUES_XXXXX constants rather than the MessagingDestinationKindValues.XXXXX for bundle minification.
	*/
	exports.MessagingDestinationKindValues = /*#__PURE__*/ (0, utils_1.createConstMap)([TMP_MESSAGINGDESTINATIONKINDVALUES_QUEUE, TMP_MESSAGINGDESTINATIONKINDVALUES_TOPIC]);
	var TMP_MESSAGINGOPERATIONVALUES_RECEIVE = "receive";
	var TMP_MESSAGINGOPERATIONVALUES_PROCESS = "process";
	/**
	* A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
	*
	* @deprecated Use MESSAGING_OPERATION_TYPE_VALUE_RECEIVE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.MESSAGINGOPERATIONVALUES_RECEIVE = TMP_MESSAGINGOPERATIONVALUES_RECEIVE;
	/**
	* A string identifying the kind of message consumption as defined in the [Operation names](#operation-names) section above. If the operation is &#34;send&#34;, this attribute MUST NOT be set, since the operation can be inferred from the span kind in that case.
	*
	* @deprecated Use MESSAGING_OPERATION_TYPE_VALUE_PROCESS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.MESSAGINGOPERATIONVALUES_PROCESS = TMP_MESSAGINGOPERATIONVALUES_PROCESS;
	/**
	* The constant map of values for MessagingOperationValues.
	* @deprecated Use the MESSAGINGOPERATIONVALUES_XXXXX constants rather than the MessagingOperationValues.XXXXX for bundle minification.
	*/
	exports.MessagingOperationValues = /*#__PURE__*/ (0, utils_1.createConstMap)([TMP_MESSAGINGOPERATIONVALUES_RECEIVE, TMP_MESSAGINGOPERATIONVALUES_PROCESS]);
	var TMP_RPCGRPCSTATUSCODEVALUES_OK = 0;
	var TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED = 1;
	var TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN = 2;
	var TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = 3;
	var TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = 4;
	var TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND = 5;
	var TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = 6;
	var TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = 7;
	var TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = 8;
	var TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = 9;
	var TMP_RPCGRPCSTATUSCODEVALUES_ABORTED = 10;
	var TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = 11;
	var TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = 12;
	var TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL = 13;
	var TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = 14;
	var TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS = 15;
	var TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = 16;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_OK in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_OK = TMP_RPCGRPCSTATUSCODEVALUES_OK;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_CANCELLED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_CANCELLED = TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNKNOWN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_UNKNOWN = TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_INVALID_ARGUMENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT = TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_DEADLINE_EXCEEDED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED = TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_NOT_FOUND in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_NOT_FOUND = TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_ALREADY_EXISTS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS = TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_PERMISSION_DENIED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED = TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_RESOURCE_EXHAUSTED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED = TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_FAILED_PRECONDITION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION = TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_ABORTED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_ABORTED = TMP_RPCGRPCSTATUSCODEVALUES_ABORTED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_OUT_OF_RANGE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE = TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNIMPLEMENTED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED = TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_INTERNAL in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_INTERNAL = TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNAVAILABLE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_UNAVAILABLE = TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_DATA_LOSS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_DATA_LOSS = TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS;
	/**
	* The [numeric status code](https://github.com/grpc/grpc/blob/v1.33.2/doc/statuscodes.md) of the gRPC request.
	*
	* @deprecated Use RPC_GRPC_STATUS_CODE_VALUE_UNAUTHENTICATED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED = TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED;
	/**
	* The constant map of values for RpcGrpcStatusCodeValues.
	* @deprecated Use the RPCGRPCSTATUSCODEVALUES_XXXXX constants rather than the RpcGrpcStatusCodeValues.XXXXX for bundle minification.
	*/
	exports.RpcGrpcStatusCodeValues = {
		OK: TMP_RPCGRPCSTATUSCODEVALUES_OK,
		CANCELLED: TMP_RPCGRPCSTATUSCODEVALUES_CANCELLED,
		UNKNOWN: TMP_RPCGRPCSTATUSCODEVALUES_UNKNOWN,
		INVALID_ARGUMENT: TMP_RPCGRPCSTATUSCODEVALUES_INVALID_ARGUMENT,
		DEADLINE_EXCEEDED: TMP_RPCGRPCSTATUSCODEVALUES_DEADLINE_EXCEEDED,
		NOT_FOUND: TMP_RPCGRPCSTATUSCODEVALUES_NOT_FOUND,
		ALREADY_EXISTS: TMP_RPCGRPCSTATUSCODEVALUES_ALREADY_EXISTS,
		PERMISSION_DENIED: TMP_RPCGRPCSTATUSCODEVALUES_PERMISSION_DENIED,
		RESOURCE_EXHAUSTED: TMP_RPCGRPCSTATUSCODEVALUES_RESOURCE_EXHAUSTED,
		FAILED_PRECONDITION: TMP_RPCGRPCSTATUSCODEVALUES_FAILED_PRECONDITION,
		ABORTED: TMP_RPCGRPCSTATUSCODEVALUES_ABORTED,
		OUT_OF_RANGE: TMP_RPCGRPCSTATUSCODEVALUES_OUT_OF_RANGE,
		UNIMPLEMENTED: TMP_RPCGRPCSTATUSCODEVALUES_UNIMPLEMENTED,
		INTERNAL: TMP_RPCGRPCSTATUSCODEVALUES_INTERNAL,
		UNAVAILABLE: TMP_RPCGRPCSTATUSCODEVALUES_UNAVAILABLE,
		DATA_LOSS: TMP_RPCGRPCSTATUSCODEVALUES_DATA_LOSS,
		UNAUTHENTICATED: TMP_RPCGRPCSTATUSCODEVALUES_UNAUTHENTICATED
	};
	var TMP_MESSAGETYPEVALUES_SENT = "SENT";
	var TMP_MESSAGETYPEVALUES_RECEIVED = "RECEIVED";
	/**
	* Whether this is a received or sent message.
	*
	* @deprecated Use MESSAGE_TYPE_VALUE_SENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.MESSAGETYPEVALUES_SENT = TMP_MESSAGETYPEVALUES_SENT;
	/**
	* Whether this is a received or sent message.
	*
	* @deprecated Use MESSAGE_TYPE_VALUE_RECEIVED in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.MESSAGETYPEVALUES_RECEIVED = TMP_MESSAGETYPEVALUES_RECEIVED;
	/**
	* The constant map of values for MessageTypeValues.
	* @deprecated Use the MESSAGETYPEVALUES_XXXXX constants rather than the MessageTypeValues.XXXXX for bundle minification.
	*/
	exports.MessageTypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([TMP_MESSAGETYPEVALUES_SENT, TMP_MESSAGETYPEVALUES_RECEIVED]);
}));
//#endregion
//#region node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/build/src/trace/index.js
var require_trace = /* @__PURE__ */ __commonJSMin(((exports) => {
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
	var __exportStar = exports && exports.__exportStar || function(m, exports$3) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$3, p)) __createBinding(exports$3, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_SemanticAttributes(), exports);
}));
//#endregion
//#region node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/build/src/resource/SemanticResourceAttributes.js
var require_SemanticResourceAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SEMRESATTRS_K8S_STATEFULSET_NAME = exports.SEMRESATTRS_K8S_STATEFULSET_UID = exports.SEMRESATTRS_K8S_DEPLOYMENT_NAME = exports.SEMRESATTRS_K8S_DEPLOYMENT_UID = exports.SEMRESATTRS_K8S_REPLICASET_NAME = exports.SEMRESATTRS_K8S_REPLICASET_UID = exports.SEMRESATTRS_K8S_CONTAINER_NAME = exports.SEMRESATTRS_K8S_POD_NAME = exports.SEMRESATTRS_K8S_POD_UID = exports.SEMRESATTRS_K8S_NAMESPACE_NAME = exports.SEMRESATTRS_K8S_NODE_UID = exports.SEMRESATTRS_K8S_NODE_NAME = exports.SEMRESATTRS_K8S_CLUSTER_NAME = exports.SEMRESATTRS_HOST_IMAGE_VERSION = exports.SEMRESATTRS_HOST_IMAGE_ID = exports.SEMRESATTRS_HOST_IMAGE_NAME = exports.SEMRESATTRS_HOST_ARCH = exports.SEMRESATTRS_HOST_TYPE = exports.SEMRESATTRS_HOST_NAME = exports.SEMRESATTRS_HOST_ID = exports.SEMRESATTRS_FAAS_MAX_MEMORY = exports.SEMRESATTRS_FAAS_INSTANCE = exports.SEMRESATTRS_FAAS_VERSION = exports.SEMRESATTRS_FAAS_ID = exports.SEMRESATTRS_FAAS_NAME = exports.SEMRESATTRS_DEVICE_MODEL_NAME = exports.SEMRESATTRS_DEVICE_MODEL_IDENTIFIER = exports.SEMRESATTRS_DEVICE_ID = exports.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = exports.SEMRESATTRS_CONTAINER_IMAGE_TAG = exports.SEMRESATTRS_CONTAINER_IMAGE_NAME = exports.SEMRESATTRS_CONTAINER_RUNTIME = exports.SEMRESATTRS_CONTAINER_ID = exports.SEMRESATTRS_CONTAINER_NAME = exports.SEMRESATTRS_AWS_LOG_STREAM_ARNS = exports.SEMRESATTRS_AWS_LOG_STREAM_NAMES = exports.SEMRESATTRS_AWS_LOG_GROUP_ARNS = exports.SEMRESATTRS_AWS_LOG_GROUP_NAMES = exports.SEMRESATTRS_AWS_EKS_CLUSTER_ARN = exports.SEMRESATTRS_AWS_ECS_TASK_REVISION = exports.SEMRESATTRS_AWS_ECS_TASK_FAMILY = exports.SEMRESATTRS_AWS_ECS_TASK_ARN = exports.SEMRESATTRS_AWS_ECS_LAUNCHTYPE = exports.SEMRESATTRS_AWS_ECS_CLUSTER_ARN = exports.SEMRESATTRS_AWS_ECS_CONTAINER_ARN = exports.SEMRESATTRS_CLOUD_PLATFORM = exports.SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = exports.SEMRESATTRS_CLOUD_REGION = exports.SEMRESATTRS_CLOUD_ACCOUNT_ID = exports.SEMRESATTRS_CLOUD_PROVIDER = void 0;
	exports.CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = exports.CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = exports.CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = exports.CLOUDPLATFORMVALUES_AZURE_AKS = exports.CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = exports.CLOUDPLATFORMVALUES_AZURE_VM = exports.CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = exports.CLOUDPLATFORMVALUES_AWS_LAMBDA = exports.CLOUDPLATFORMVALUES_AWS_EKS = exports.CLOUDPLATFORMVALUES_AWS_ECS = exports.CLOUDPLATFORMVALUES_AWS_EC2 = exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = exports.CloudProviderValues = exports.CLOUDPROVIDERVALUES_GCP = exports.CLOUDPROVIDERVALUES_AZURE = exports.CLOUDPROVIDERVALUES_AWS = exports.CLOUDPROVIDERVALUES_ALIBABA_CLOUD = exports.SemanticResourceAttributes = exports.SEMRESATTRS_WEBENGINE_DESCRIPTION = exports.SEMRESATTRS_WEBENGINE_VERSION = exports.SEMRESATTRS_WEBENGINE_NAME = exports.SEMRESATTRS_TELEMETRY_AUTO_VERSION = exports.SEMRESATTRS_TELEMETRY_SDK_VERSION = exports.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = exports.SEMRESATTRS_TELEMETRY_SDK_NAME = exports.SEMRESATTRS_SERVICE_VERSION = exports.SEMRESATTRS_SERVICE_INSTANCE_ID = exports.SEMRESATTRS_SERVICE_NAMESPACE = exports.SEMRESATTRS_SERVICE_NAME = exports.SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION = exports.SEMRESATTRS_PROCESS_RUNTIME_VERSION = exports.SEMRESATTRS_PROCESS_RUNTIME_NAME = exports.SEMRESATTRS_PROCESS_OWNER = exports.SEMRESATTRS_PROCESS_COMMAND_ARGS = exports.SEMRESATTRS_PROCESS_COMMAND_LINE = exports.SEMRESATTRS_PROCESS_COMMAND = exports.SEMRESATTRS_PROCESS_EXECUTABLE_PATH = exports.SEMRESATTRS_PROCESS_EXECUTABLE_NAME = exports.SEMRESATTRS_PROCESS_PID = exports.SEMRESATTRS_OS_VERSION = exports.SEMRESATTRS_OS_NAME = exports.SEMRESATTRS_OS_DESCRIPTION = exports.SEMRESATTRS_OS_TYPE = exports.SEMRESATTRS_K8S_CRONJOB_NAME = exports.SEMRESATTRS_K8S_CRONJOB_UID = exports.SEMRESATTRS_K8S_JOB_NAME = exports.SEMRESATTRS_K8S_JOB_UID = exports.SEMRESATTRS_K8S_DAEMONSET_NAME = exports.SEMRESATTRS_K8S_DAEMONSET_UID = void 0;
	exports.TelemetrySdkLanguageValues = exports.TELEMETRYSDKLANGUAGEVALUES_WEBJS = exports.TELEMETRYSDKLANGUAGEVALUES_RUBY = exports.TELEMETRYSDKLANGUAGEVALUES_PYTHON = exports.TELEMETRYSDKLANGUAGEVALUES_PHP = exports.TELEMETRYSDKLANGUAGEVALUES_NODEJS = exports.TELEMETRYSDKLANGUAGEVALUES_JAVA = exports.TELEMETRYSDKLANGUAGEVALUES_GO = exports.TELEMETRYSDKLANGUAGEVALUES_ERLANG = exports.TELEMETRYSDKLANGUAGEVALUES_DOTNET = exports.TELEMETRYSDKLANGUAGEVALUES_CPP = exports.OsTypeValues = exports.OSTYPEVALUES_Z_OS = exports.OSTYPEVALUES_SOLARIS = exports.OSTYPEVALUES_AIX = exports.OSTYPEVALUES_HPUX = exports.OSTYPEVALUES_DRAGONFLYBSD = exports.OSTYPEVALUES_OPENBSD = exports.OSTYPEVALUES_NETBSD = exports.OSTYPEVALUES_FREEBSD = exports.OSTYPEVALUES_DARWIN = exports.OSTYPEVALUES_LINUX = exports.OSTYPEVALUES_WINDOWS = exports.HostArchValues = exports.HOSTARCHVALUES_X86 = exports.HOSTARCHVALUES_PPC64 = exports.HOSTARCHVALUES_PPC32 = exports.HOSTARCHVALUES_IA64 = exports.HOSTARCHVALUES_ARM64 = exports.HOSTARCHVALUES_ARM32 = exports.HOSTARCHVALUES_AMD64 = exports.AwsEcsLaunchtypeValues = exports.AWSECSLAUNCHTYPEVALUES_FARGATE = exports.AWSECSLAUNCHTYPEVALUES_EC2 = exports.CloudPlatformValues = exports.CLOUDPLATFORMVALUES_GCP_APP_ENGINE = exports.CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = exports.CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = exports.CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = void 0;
	var utils_1 = require_utils();
	var TMP_CLOUD_PROVIDER = "cloud.provider";
	var TMP_CLOUD_ACCOUNT_ID = "cloud.account.id";
	var TMP_CLOUD_REGION = "cloud.region";
	var TMP_CLOUD_AVAILABILITY_ZONE = "cloud.availability_zone";
	var TMP_CLOUD_PLATFORM = "cloud.platform";
	var TMP_AWS_ECS_CONTAINER_ARN = "aws.ecs.container.arn";
	var TMP_AWS_ECS_CLUSTER_ARN = "aws.ecs.cluster.arn";
	var TMP_AWS_ECS_LAUNCHTYPE = "aws.ecs.launchtype";
	var TMP_AWS_ECS_TASK_ARN = "aws.ecs.task.arn";
	var TMP_AWS_ECS_TASK_FAMILY = "aws.ecs.task.family";
	var TMP_AWS_ECS_TASK_REVISION = "aws.ecs.task.revision";
	var TMP_AWS_EKS_CLUSTER_ARN = "aws.eks.cluster.arn";
	var TMP_AWS_LOG_GROUP_NAMES = "aws.log.group.names";
	var TMP_AWS_LOG_GROUP_ARNS = "aws.log.group.arns";
	var TMP_AWS_LOG_STREAM_NAMES = "aws.log.stream.names";
	var TMP_AWS_LOG_STREAM_ARNS = "aws.log.stream.arns";
	var TMP_CONTAINER_NAME = "container.name";
	var TMP_CONTAINER_ID = "container.id";
	var TMP_CONTAINER_RUNTIME = "container.runtime";
	var TMP_CONTAINER_IMAGE_NAME = "container.image.name";
	var TMP_CONTAINER_IMAGE_TAG = "container.image.tag";
	var TMP_DEPLOYMENT_ENVIRONMENT = "deployment.environment";
	var TMP_DEVICE_ID = "device.id";
	var TMP_DEVICE_MODEL_IDENTIFIER = "device.model.identifier";
	var TMP_DEVICE_MODEL_NAME = "device.model.name";
	var TMP_FAAS_NAME = "faas.name";
	var TMP_FAAS_ID = "faas.id";
	var TMP_FAAS_VERSION = "faas.version";
	var TMP_FAAS_INSTANCE = "faas.instance";
	var TMP_FAAS_MAX_MEMORY = "faas.max_memory";
	var TMP_HOST_ID = "host.id";
	var TMP_HOST_NAME = "host.name";
	var TMP_HOST_TYPE = "host.type";
	var TMP_HOST_ARCH = "host.arch";
	var TMP_HOST_IMAGE_NAME = "host.image.name";
	var TMP_HOST_IMAGE_ID = "host.image.id";
	var TMP_HOST_IMAGE_VERSION = "host.image.version";
	var TMP_K8S_CLUSTER_NAME = "k8s.cluster.name";
	var TMP_K8S_NODE_NAME = "k8s.node.name";
	var TMP_K8S_NODE_UID = "k8s.node.uid";
	var TMP_K8S_NAMESPACE_NAME = "k8s.namespace.name";
	var TMP_K8S_POD_UID = "k8s.pod.uid";
	var TMP_K8S_POD_NAME = "k8s.pod.name";
	var TMP_K8S_CONTAINER_NAME = "k8s.container.name";
	var TMP_K8S_REPLICASET_UID = "k8s.replicaset.uid";
	var TMP_K8S_REPLICASET_NAME = "k8s.replicaset.name";
	var TMP_K8S_DEPLOYMENT_UID = "k8s.deployment.uid";
	var TMP_K8S_DEPLOYMENT_NAME = "k8s.deployment.name";
	var TMP_K8S_STATEFULSET_UID = "k8s.statefulset.uid";
	var TMP_K8S_STATEFULSET_NAME = "k8s.statefulset.name";
	var TMP_K8S_DAEMONSET_UID = "k8s.daemonset.uid";
	var TMP_K8S_DAEMONSET_NAME = "k8s.daemonset.name";
	var TMP_K8S_JOB_UID = "k8s.job.uid";
	var TMP_K8S_JOB_NAME = "k8s.job.name";
	var TMP_K8S_CRONJOB_UID = "k8s.cronjob.uid";
	var TMP_K8S_CRONJOB_NAME = "k8s.cronjob.name";
	var TMP_OS_TYPE = "os.type";
	var TMP_OS_DESCRIPTION = "os.description";
	var TMP_OS_NAME = "os.name";
	var TMP_OS_VERSION = "os.version";
	var TMP_PROCESS_PID = "process.pid";
	var TMP_PROCESS_EXECUTABLE_NAME = "process.executable.name";
	var TMP_PROCESS_EXECUTABLE_PATH = "process.executable.path";
	var TMP_PROCESS_COMMAND = "process.command";
	var TMP_PROCESS_COMMAND_LINE = "process.command_line";
	var TMP_PROCESS_COMMAND_ARGS = "process.command_args";
	var TMP_PROCESS_OWNER = "process.owner";
	var TMP_PROCESS_RUNTIME_NAME = "process.runtime.name";
	var TMP_PROCESS_RUNTIME_VERSION = "process.runtime.version";
	var TMP_PROCESS_RUNTIME_DESCRIPTION = "process.runtime.description";
	var TMP_SERVICE_NAME = "service.name";
	var TMP_SERVICE_NAMESPACE = "service.namespace";
	var TMP_SERVICE_INSTANCE_ID = "service.instance.id";
	var TMP_SERVICE_VERSION = "service.version";
	var TMP_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
	var TMP_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
	var TMP_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
	var TMP_TELEMETRY_AUTO_VERSION = "telemetry.auto.version";
	var TMP_WEBENGINE_NAME = "webengine.name";
	var TMP_WEBENGINE_VERSION = "webengine.version";
	var TMP_WEBENGINE_DESCRIPTION = "webengine.description";
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use ATTR_CLOUD_PROVIDER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_PROVIDER = TMP_CLOUD_PROVIDER;
	/**
	* The cloud account ID the resource is assigned to.
	*
	* @deprecated Use ATTR_CLOUD_ACCOUNT_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_ACCOUNT_ID = TMP_CLOUD_ACCOUNT_ID;
	/**
	* The geographical region the resource is running. Refer to your provider&#39;s docs to see the available regions, for example [Alibaba Cloud regions](https://www.alibabacloud.com/help/doc-detail/40654.htm), [AWS regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Azure regions](https://azure.microsoft.com/en-us/global-infrastructure/geographies/), or [Google Cloud regions](https://cloud.google.com/about/locations).
	*
	* @deprecated Use ATTR_CLOUD_REGION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_REGION = TMP_CLOUD_REGION;
	/**
	* Cloud regions often have multiple, isolated locations known as zones to increase availability. Availability zone represents the zone where the resource is running.
	*
	* Note: Availability zones are called &#34;zones&#34; on Alibaba Cloud and Google Cloud.
	*
	* @deprecated Use ATTR_CLOUD_AVAILABILITY_ZONE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_AVAILABILITY_ZONE = TMP_CLOUD_AVAILABILITY_ZONE;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use ATTR_CLOUD_PLATFORM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CLOUD_PLATFORM = TMP_CLOUD_PLATFORM;
	/**
	* The Amazon Resource Name (ARN) of an [ECS container instance](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_instances.html).
	*
	* @deprecated Use ATTR_AWS_ECS_CONTAINER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_CONTAINER_ARN = TMP_AWS_ECS_CONTAINER_ARN;
	/**
	* The ARN of an [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
	*
	* @deprecated Use ATTR_AWS_ECS_CLUSTER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_CLUSTER_ARN = TMP_AWS_ECS_CLUSTER_ARN;
	/**
	* The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
	*
	* @deprecated Use ATTR_AWS_ECS_LAUNCHTYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_LAUNCHTYPE = TMP_AWS_ECS_LAUNCHTYPE;
	/**
	* The ARN of an [ECS task definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
	*
	* @deprecated Use ATTR_AWS_ECS_TASK_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_TASK_ARN = TMP_AWS_ECS_TASK_ARN;
	/**
	* The task definition family this task definition is a member of.
	*
	* @deprecated Use ATTR_AWS_ECS_TASK_FAMILY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_TASK_FAMILY = TMP_AWS_ECS_TASK_FAMILY;
	/**
	* The revision for this task definition.
	*
	* @deprecated Use ATTR_AWS_ECS_TASK_REVISION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_ECS_TASK_REVISION = TMP_AWS_ECS_TASK_REVISION;
	/**
	* The ARN of an EKS cluster.
	*
	* @deprecated Use ATTR_AWS_EKS_CLUSTER_ARN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_EKS_CLUSTER_ARN = TMP_AWS_EKS_CLUSTER_ARN;
	/**
	* The name(s) of the AWS log group(s) an application is writing to.
	*
	* Note: Multiple log groups must be supported for cases like multi-container applications, where a single application has sidecar containers, and each write to their own log group.
	*
	* @deprecated Use ATTR_AWS_LOG_GROUP_NAMES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_LOG_GROUP_NAMES = TMP_AWS_LOG_GROUP_NAMES;
	/**
	* The Amazon Resource Name(s) (ARN) of the AWS log group(s).
	*
	* Note: See the [log group ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format).
	*
	* @deprecated Use ATTR_AWS_LOG_GROUP_ARNS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_LOG_GROUP_ARNS = TMP_AWS_LOG_GROUP_ARNS;
	/**
	* The name(s) of the AWS log stream(s) an application is writing to.
	*
	* @deprecated Use ATTR_AWS_LOG_STREAM_NAMES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_LOG_STREAM_NAMES = TMP_AWS_LOG_STREAM_NAMES;
	/**
	* The ARN(s) of the AWS log stream(s).
	*
	* Note: See the [log stream ARN format documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-access-control-overview-cwl.html#CWL_ARN_Format). One log group can contain several log streams, so these ARNs necessarily identify both a log group and a log stream.
	*
	* @deprecated Use ATTR_AWS_LOG_STREAM_ARNS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_AWS_LOG_STREAM_ARNS = TMP_AWS_LOG_STREAM_ARNS;
	/**
	* Container name.
	*
	* @deprecated Use ATTR_CONTAINER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_NAME = TMP_CONTAINER_NAME;
	/**
	* Container ID. Usually a UUID, as for example used to [identify Docker containers](https://docs.docker.com/engine/reference/run/#container-identification). The UUID might be abbreviated.
	*
	* @deprecated Use ATTR_CONTAINER_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_ID = TMP_CONTAINER_ID;
	/**
	* The container runtime managing this container.
	*
	* @deprecated Use ATTR_CONTAINER_RUNTIME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_RUNTIME = TMP_CONTAINER_RUNTIME;
	/**
	* Name of the image the container was built on.
	*
	* @deprecated Use ATTR_CONTAINER_IMAGE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_IMAGE_NAME = TMP_CONTAINER_IMAGE_NAME;
	/**
	* Container image tag.
	*
	* @deprecated Use ATTR_CONTAINER_IMAGE_TAGS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_CONTAINER_IMAGE_TAG = TMP_CONTAINER_IMAGE_TAG;
	/**
	* Name of the [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment) (aka deployment tier).
	*
	* @deprecated Use ATTR_DEPLOYMENT_ENVIRONMENT in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = TMP_DEPLOYMENT_ENVIRONMENT;
	/**
	* A unique identifier representing the device.
	*
	* Note: The device identifier MUST only be defined using the values outlined below. This value is not an advertising identifier and MUST NOT be used as such. On iOS (Swift or Objective-C), this value MUST be equal to the [vendor identifier](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor). On Android (Java or Kotlin), this value MUST be equal to the Firebase Installation ID or a globally unique UUID which is persisted across sessions in your application. More information can be found [here](https://developer.android.com/training/articles/user-data-ids) on best practices and exact implementation details. Caution should be taken when storing personal data or anything which can identify a user. GDPR and data protection laws may apply, ensure you do your own due diligence.
	*
	* @deprecated Use ATTR_DEVICE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_DEVICE_ID = TMP_DEVICE_ID;
	/**
	* The model identifier for the device.
	*
	* Note: It&#39;s recommended this value represents a machine readable version of the model identifier rather than the market or consumer-friendly name of the device.
	*
	* @deprecated Use ATTR_DEVICE_MODEL_IDENTIFIER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_DEVICE_MODEL_IDENTIFIER = TMP_DEVICE_MODEL_IDENTIFIER;
	/**
	* The marketing name for the device model.
	*
	* Note: It&#39;s recommended this value represents a human readable version of the device model rather than a machine readable alternative.
	*
	* @deprecated Use ATTR_DEVICE_MODEL_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_DEVICE_MODEL_NAME = TMP_DEVICE_MODEL_NAME;
	/**
	* The name of the single function that this runtime instance executes.
	*
	* Note: This is the name of the function as configured/deployed on the FaaS platform and is usually different from the name of the callback function (which may be stored in the [`code.namespace`/`code.function`](../../trace/semantic_conventions/span-general.md#source-code-attributes) span attributes).
	*
	* @deprecated Use ATTR_FAAS_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_NAME = TMP_FAAS_NAME;
	/**
	* The unique ID of the single function that this runtime instance executes.
	*
	* Note: Depending on the cloud provider, use:
	
	* **AWS Lambda:** The function [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).
	Take care not to use the &#34;invoked ARN&#34; directly but replace any
	[alias suffix](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html) with the resolved function version, as the same runtime instance may be invokable with multiple
	different aliases.
	* **GCP:** The [URI of the resource](https://cloud.google.com/iam/docs/full-resource-names)
	* **Azure:** The [Fully Qualified Resource ID](https://docs.microsoft.com/en-us/rest/api/resources/resources/get-by-id).
	
	On some providers, it may not be possible to determine the full ID at startup,
	which is why this field cannot be made required. For example, on AWS the account ID
	part of the ARN is not available without calling another AWS API
	which may be deemed too slow for a short-running lambda function.
	As an alternative, consider setting `faas.id` as a span attribute instead.
	*
	* @deprecated Use ATTR_CLOUD_RESOURCE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_ID = TMP_FAAS_ID;
	/**
	* The immutable version of the function being executed.
	*
	* Note: Depending on the cloud provider and platform, use:
	
	* **AWS Lambda:** The [function version](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)
	(an integer represented as a decimal string).
	* **Google Cloud Run:** The [revision](https://cloud.google.com/run/docs/managing/revisions)
	(i.e., the function name plus the revision suffix).
	* **Google Cloud Functions:** The value of the
	[`K_REVISION` environment variable](https://cloud.google.com/functions/docs/env-var#runtime_environment_variables_set_automatically).
	* **Azure Functions:** Not applicable. Do not set this attribute.
	*
	* @deprecated Use ATTR_FAAS_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_VERSION = TMP_FAAS_VERSION;
	/**
	* The execution environment ID as a string, that will be potentially reused for other invocations to the same function/function version.
	*
	* Note: * **AWS Lambda:** Use the (full) log stream name.
	*
	* @deprecated Use ATTR_FAAS_INSTANCE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_INSTANCE = TMP_FAAS_INSTANCE;
	/**
	* The amount of memory available to the serverless function in MiB.
	*
	* Note: It&#39;s recommended to set this attribute since e.g. too little memory can easily stop a Java AWS Lambda function from working correctly. On AWS Lambda, the environment variable `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` provides this information.
	*
	* @deprecated Use ATTR_FAAS_MAX_MEMORY in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_FAAS_MAX_MEMORY = TMP_FAAS_MAX_MEMORY;
	/**
	* Unique host ID. For Cloud, this must be the instance_id assigned by the cloud provider.
	*
	* @deprecated Use ATTR_HOST_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_ID = TMP_HOST_ID;
	/**
	* Name of the host. On Unix systems, it may contain what the hostname command returns, or the fully qualified hostname, or another name specified by the user.
	*
	* @deprecated Use ATTR_HOST_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_NAME = TMP_HOST_NAME;
	/**
	* Type of host. For Cloud, this must be the machine type.
	*
	* @deprecated Use ATTR_HOST_TYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_TYPE = TMP_HOST_TYPE;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use ATTR_HOST_ARCH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_ARCH = TMP_HOST_ARCH;
	/**
	* Name of the VM image or OS install the host was instantiated from.
	*
	* @deprecated Use ATTR_HOST_IMAGE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_IMAGE_NAME = TMP_HOST_IMAGE_NAME;
	/**
	* VM image ID. For Cloud, this value is from the provider.
	*
	* @deprecated Use ATTR_HOST_IMAGE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_IMAGE_ID = TMP_HOST_IMAGE_ID;
	/**
	* The version string of the VM image as defined in [Version Attributes](README.md#version-attributes).
	*
	* @deprecated Use ATTR_HOST_IMAGE_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_HOST_IMAGE_VERSION = TMP_HOST_IMAGE_VERSION;
	/**
	* The name of the cluster.
	*
	* @deprecated Use ATTR_K8S_CLUSTER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_CLUSTER_NAME = TMP_K8S_CLUSTER_NAME;
	/**
	* The name of the Node.
	*
	* @deprecated Use ATTR_K8S_NODE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_NODE_NAME = TMP_K8S_NODE_NAME;
	/**
	* The UID of the Node.
	*
	* @deprecated Use ATTR_K8S_NODE_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_NODE_UID = TMP_K8S_NODE_UID;
	/**
	* The name of the namespace that the pod is running in.
	*
	* @deprecated Use ATTR_K8S_NAMESPACE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_NAMESPACE_NAME = TMP_K8S_NAMESPACE_NAME;
	/**
	* The UID of the Pod.
	*
	* @deprecated Use ATTR_K8S_POD_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_POD_UID = TMP_K8S_POD_UID;
	/**
	* The name of the Pod.
	*
	* @deprecated Use ATTR_K8S_POD_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_POD_NAME = TMP_K8S_POD_NAME;
	/**
	* The name of the Container in a Pod template.
	*
	* @deprecated Use ATTR_K8S_CONTAINER_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_CONTAINER_NAME = TMP_K8S_CONTAINER_NAME;
	/**
	* The UID of the ReplicaSet.
	*
	* @deprecated Use ATTR_K8S_REPLICASET_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_REPLICASET_UID = TMP_K8S_REPLICASET_UID;
	/**
	* The name of the ReplicaSet.
	*
	* @deprecated Use ATTR_K8S_REPLICASET_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_REPLICASET_NAME = TMP_K8S_REPLICASET_NAME;
	/**
	* The UID of the Deployment.
	*
	* @deprecated Use ATTR_K8S_DEPLOYMENT_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_DEPLOYMENT_UID = TMP_K8S_DEPLOYMENT_UID;
	/**
	* The name of the Deployment.
	*
	* @deprecated Use ATTR_K8S_DEPLOYMENT_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_DEPLOYMENT_NAME = TMP_K8S_DEPLOYMENT_NAME;
	/**
	* The UID of the StatefulSet.
	*
	* @deprecated Use ATTR_K8S_STATEFULSET_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_STATEFULSET_UID = TMP_K8S_STATEFULSET_UID;
	/**
	* The name of the StatefulSet.
	*
	* @deprecated Use ATTR_K8S_STATEFULSET_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_STATEFULSET_NAME = TMP_K8S_STATEFULSET_NAME;
	/**
	* The UID of the DaemonSet.
	*
	* @deprecated Use ATTR_K8S_DAEMONSET_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_DAEMONSET_UID = TMP_K8S_DAEMONSET_UID;
	/**
	* The name of the DaemonSet.
	*
	* @deprecated Use ATTR_K8S_DAEMONSET_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_DAEMONSET_NAME = TMP_K8S_DAEMONSET_NAME;
	/**
	* The UID of the Job.
	*
	* @deprecated Use ATTR_K8S_JOB_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_JOB_UID = TMP_K8S_JOB_UID;
	/**
	* The name of the Job.
	*
	* @deprecated Use ATTR_K8S_JOB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_JOB_NAME = TMP_K8S_JOB_NAME;
	/**
	* The UID of the CronJob.
	*
	* @deprecated Use ATTR_K8S_CRONJOB_UID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_CRONJOB_UID = TMP_K8S_CRONJOB_UID;
	/**
	* The name of the CronJob.
	*
	* @deprecated Use ATTR_K8S_CRONJOB_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_K8S_CRONJOB_NAME = TMP_K8S_CRONJOB_NAME;
	/**
	* The operating system type.
	*
	* @deprecated Use ATTR_OS_TYPE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_OS_TYPE = TMP_OS_TYPE;
	/**
	* Human readable (not intended to be parsed) OS version information, like e.g. reported by `ver` or `lsb_release -a` commands.
	*
	* @deprecated Use ATTR_OS_DESCRIPTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_OS_DESCRIPTION = TMP_OS_DESCRIPTION;
	/**
	* Human readable operating system name.
	*
	* @deprecated Use ATTR_OS_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_OS_NAME = TMP_OS_NAME;
	/**
	* The version string of the operating system as defined in [Version Attributes](../../resource/semantic_conventions/README.md#version-attributes).
	*
	* @deprecated Use ATTR_OS_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_OS_VERSION = TMP_OS_VERSION;
	/**
	* Process identifier (PID).
	*
	* @deprecated Use ATTR_PROCESS_PID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_PID = TMP_PROCESS_PID;
	/**
	* The name of the process executable. On Linux based systems, can be set to the `Name` in `proc/[pid]/status`. On Windows, can be set to the base name of `GetProcessImageFileNameW`.
	*
	* @deprecated Use ATTR_PROCESS_EXECUTABLE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_EXECUTABLE_NAME = TMP_PROCESS_EXECUTABLE_NAME;
	/**
	* The full path to the process executable. On Linux based systems, can be set to the target of `proc/[pid]/exe`. On Windows, can be set to the result of `GetProcessImageFileNameW`.
	*
	* @deprecated Use ATTR_PROCESS_EXECUTABLE_PATH in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_EXECUTABLE_PATH = TMP_PROCESS_EXECUTABLE_PATH;
	/**
	* The command used to launch the process (i.e. the command name). On Linux based systems, can be set to the zeroth string in `proc/[pid]/cmdline`. On Windows, can be set to the first parameter extracted from `GetCommandLineW`.
	*
	* @deprecated Use ATTR_PROCESS_COMMAND in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_COMMAND = TMP_PROCESS_COMMAND;
	/**
	* The full command used to launch the process as a single string representing the full command. On Windows, can be set to the result of `GetCommandLineW`. Do not set this if you have to assemble it just for monitoring; use `process.command_args` instead.
	*
	* @deprecated Use ATTR_PROCESS_COMMAND_LINE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_COMMAND_LINE = TMP_PROCESS_COMMAND_LINE;
	/**
	* All the command arguments (including the command/executable itself) as received by the process. On Linux-based systems (and some other Unixoid systems supporting procfs), can be set according to the list of null-delimited strings extracted from `proc/[pid]/cmdline`. For libc-based executables, this would be the full argv vector passed to `main`.
	*
	* @deprecated Use ATTR_PROCESS_COMMAND_ARGS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_COMMAND_ARGS = TMP_PROCESS_COMMAND_ARGS;
	/**
	* The username of the user that owns the process.
	*
	* @deprecated Use ATTR_PROCESS_OWNER in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_OWNER = TMP_PROCESS_OWNER;
	/**
	* The name of the runtime of this process. For compiled native binaries, this SHOULD be the name of the compiler.
	*
	* @deprecated Use ATTR_PROCESS_RUNTIME_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_RUNTIME_NAME = TMP_PROCESS_RUNTIME_NAME;
	/**
	* The version of the runtime of this process, as returned by the runtime without modification.
	*
	* @deprecated Use ATTR_PROCESS_RUNTIME_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_RUNTIME_VERSION = TMP_PROCESS_RUNTIME_VERSION;
	/**
	* An additional description about the runtime of the process, for example a specific vendor customization of the runtime environment.
	*
	* @deprecated Use ATTR_PROCESS_RUNTIME_DESCRIPTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_PROCESS_RUNTIME_DESCRIPTION = TMP_PROCESS_RUNTIME_DESCRIPTION;
	/**
	* Logical name of the service.
	*
	* Note: MUST be the same for all instances of horizontally scaled services. If the value was not specified, SDKs MUST fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md#process), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value MUST be set to `unknown_service`.
	*
	* @deprecated Use ATTR_SERVICE_NAME.
	*/
	exports.SEMRESATTRS_SERVICE_NAME = TMP_SERVICE_NAME;
	/**
	* A namespace for `service.name`.
	*
	* Note: A string value having a meaning that helps to distinguish a group of services, for example the team name that owns a group of services. `service.name` is expected to be unique within the same namespace. If `service.namespace` is not specified in the Resource then `service.name` is expected to be unique for all services that have no explicit namespace defined (so the empty/unspecified namespace is simply one more valid namespace). Zero-length namespace string is assumed equal to unspecified namespace.
	*
	* @deprecated Use ATTR_SERVICE_NAMESPACE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_SERVICE_NAMESPACE = TMP_SERVICE_NAMESPACE;
	/**
	* The string ID of the service instance.
	*
	* Note: MUST be unique for each instance of the same `service.namespace,service.name` pair (in other words `service.namespace,service.name,service.instance.id` triplet MUST be globally unique). The ID helps to distinguish instances of the same service that exist at the same time (e.g. instances of a horizontally scaled service). It is preferable for the ID to be persistent and stay the same for the lifetime of the service instance, however it is acceptable that the ID is ephemeral and changes during important lifetime events for the service (e.g. service restarts). If the service has no inherent unique ID that can be used as the value of this attribute it is recommended to generate a random Version 1 or Version 4 RFC 4122 UUID (services aiming for reproducible UUIDs may also use Version 5, see RFC 4122 for more recommendations).
	*
	* @deprecated Use ATTR_SERVICE_INSTANCE_ID in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_SERVICE_INSTANCE_ID = TMP_SERVICE_INSTANCE_ID;
	/**
	* The version string of the service API or implementation.
	*
	* @deprecated Use ATTR_SERVICE_VERSION.
	*/
	exports.SEMRESATTRS_SERVICE_VERSION = TMP_SERVICE_VERSION;
	/**
	* The name of the telemetry SDK as defined above.
	*
	* @deprecated Use ATTR_TELEMETRY_SDK_NAME.
	*/
	exports.SEMRESATTRS_TELEMETRY_SDK_NAME = TMP_TELEMETRY_SDK_NAME;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use ATTR_TELEMETRY_SDK_LANGUAGE.
	*/
	exports.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = TMP_TELEMETRY_SDK_LANGUAGE;
	/**
	* The version string of the telemetry SDK.
	*
	* @deprecated Use ATTR_TELEMETRY_SDK_VERSION.
	*/
	exports.SEMRESATTRS_TELEMETRY_SDK_VERSION = TMP_TELEMETRY_SDK_VERSION;
	/**
	* The version string of the auto instrumentation agent, if used.
	*
	* @deprecated Use ATTR_TELEMETRY_DISTRO_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_TELEMETRY_AUTO_VERSION = TMP_TELEMETRY_AUTO_VERSION;
	/**
	* The name of the web engine.
	*
	* @deprecated Use ATTR_WEBENGINE_NAME in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_WEBENGINE_NAME = TMP_WEBENGINE_NAME;
	/**
	* The version of the web engine.
	*
	* @deprecated Use ATTR_WEBENGINE_VERSION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_WEBENGINE_VERSION = TMP_WEBENGINE_VERSION;
	/**
	* Additional description of the web engine (e.g. detailed version and edition information).
	*
	* @deprecated Use ATTR_WEBENGINE_DESCRIPTION in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.SEMRESATTRS_WEBENGINE_DESCRIPTION = TMP_WEBENGINE_DESCRIPTION;
	/**
	* Create exported Value Map for SemanticResourceAttributes values
	* @deprecated Use the SEMRESATTRS_XXXXX constants rather than the SemanticResourceAttributes.XXXXX for bundle minification
	*/
	exports.SemanticResourceAttributes = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_CLOUD_PROVIDER,
		TMP_CLOUD_ACCOUNT_ID,
		TMP_CLOUD_REGION,
		TMP_CLOUD_AVAILABILITY_ZONE,
		TMP_CLOUD_PLATFORM,
		TMP_AWS_ECS_CONTAINER_ARN,
		TMP_AWS_ECS_CLUSTER_ARN,
		TMP_AWS_ECS_LAUNCHTYPE,
		TMP_AWS_ECS_TASK_ARN,
		TMP_AWS_ECS_TASK_FAMILY,
		TMP_AWS_ECS_TASK_REVISION,
		TMP_AWS_EKS_CLUSTER_ARN,
		TMP_AWS_LOG_GROUP_NAMES,
		TMP_AWS_LOG_GROUP_ARNS,
		TMP_AWS_LOG_STREAM_NAMES,
		TMP_AWS_LOG_STREAM_ARNS,
		TMP_CONTAINER_NAME,
		TMP_CONTAINER_ID,
		TMP_CONTAINER_RUNTIME,
		TMP_CONTAINER_IMAGE_NAME,
		TMP_CONTAINER_IMAGE_TAG,
		TMP_DEPLOYMENT_ENVIRONMENT,
		TMP_DEVICE_ID,
		TMP_DEVICE_MODEL_IDENTIFIER,
		TMP_DEVICE_MODEL_NAME,
		TMP_FAAS_NAME,
		TMP_FAAS_ID,
		TMP_FAAS_VERSION,
		TMP_FAAS_INSTANCE,
		TMP_FAAS_MAX_MEMORY,
		TMP_HOST_ID,
		TMP_HOST_NAME,
		TMP_HOST_TYPE,
		TMP_HOST_ARCH,
		TMP_HOST_IMAGE_NAME,
		TMP_HOST_IMAGE_ID,
		TMP_HOST_IMAGE_VERSION,
		TMP_K8S_CLUSTER_NAME,
		TMP_K8S_NODE_NAME,
		TMP_K8S_NODE_UID,
		TMP_K8S_NAMESPACE_NAME,
		TMP_K8S_POD_UID,
		TMP_K8S_POD_NAME,
		TMP_K8S_CONTAINER_NAME,
		TMP_K8S_REPLICASET_UID,
		TMP_K8S_REPLICASET_NAME,
		TMP_K8S_DEPLOYMENT_UID,
		TMP_K8S_DEPLOYMENT_NAME,
		TMP_K8S_STATEFULSET_UID,
		TMP_K8S_STATEFULSET_NAME,
		TMP_K8S_DAEMONSET_UID,
		TMP_K8S_DAEMONSET_NAME,
		TMP_K8S_JOB_UID,
		TMP_K8S_JOB_NAME,
		TMP_K8S_CRONJOB_UID,
		TMP_K8S_CRONJOB_NAME,
		TMP_OS_TYPE,
		TMP_OS_DESCRIPTION,
		TMP_OS_NAME,
		TMP_OS_VERSION,
		TMP_PROCESS_PID,
		TMP_PROCESS_EXECUTABLE_NAME,
		TMP_PROCESS_EXECUTABLE_PATH,
		TMP_PROCESS_COMMAND,
		TMP_PROCESS_COMMAND_LINE,
		TMP_PROCESS_COMMAND_ARGS,
		TMP_PROCESS_OWNER,
		TMP_PROCESS_RUNTIME_NAME,
		TMP_PROCESS_RUNTIME_VERSION,
		TMP_PROCESS_RUNTIME_DESCRIPTION,
		TMP_SERVICE_NAME,
		TMP_SERVICE_NAMESPACE,
		TMP_SERVICE_INSTANCE_ID,
		TMP_SERVICE_VERSION,
		TMP_TELEMETRY_SDK_NAME,
		TMP_TELEMETRY_SDK_LANGUAGE,
		TMP_TELEMETRY_SDK_VERSION,
		TMP_TELEMETRY_AUTO_VERSION,
		TMP_WEBENGINE_NAME,
		TMP_WEBENGINE_VERSION,
		TMP_WEBENGINE_DESCRIPTION
	]);
	var TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD = "alibaba_cloud";
	var TMP_CLOUDPROVIDERVALUES_AWS = "aws";
	var TMP_CLOUDPROVIDERVALUES_AZURE = "azure";
	var TMP_CLOUDPROVIDERVALUES_GCP = "gcp";
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use CLOUD_PROVIDER_VALUE_ALIBABA_CLOUD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPROVIDERVALUES_ALIBABA_CLOUD = TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD;
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use CLOUD_PROVIDER_VALUE_AWS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPROVIDERVALUES_AWS = TMP_CLOUDPROVIDERVALUES_AWS;
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use CLOUD_PROVIDER_VALUE_AZURE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPROVIDERVALUES_AZURE = TMP_CLOUDPROVIDERVALUES_AZURE;
	/**
	* Name of the cloud provider.
	*
	* @deprecated Use CLOUD_PROVIDER_VALUE_GCP in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPROVIDERVALUES_GCP = TMP_CLOUDPROVIDERVALUES_GCP;
	/**
	* The constant map of values for CloudProviderValues.
	* @deprecated Use the CLOUDPROVIDERVALUES_XXXXX constants rather than the CloudProviderValues.XXXXX for bundle minification.
	*/
	exports.CloudProviderValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_CLOUDPROVIDERVALUES_ALIBABA_CLOUD,
		TMP_CLOUDPROVIDERVALUES_AWS,
		TMP_CLOUDPROVIDERVALUES_AZURE,
		TMP_CLOUDPROVIDERVALUES_GCP
	]);
	var TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = "alibaba_cloud_ecs";
	var TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = "alibaba_cloud_fc";
	var TMP_CLOUDPLATFORMVALUES_AWS_EC2 = "aws_ec2";
	var TMP_CLOUDPLATFORMVALUES_AWS_ECS = "aws_ecs";
	var TMP_CLOUDPLATFORMVALUES_AWS_EKS = "aws_eks";
	var TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA = "aws_lambda";
	var TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = "aws_elastic_beanstalk";
	var TMP_CLOUDPLATFORMVALUES_AZURE_VM = "azure_vm";
	var TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = "azure_container_instances";
	var TMP_CLOUDPLATFORMVALUES_AZURE_AKS = "azure_aks";
	var TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = "azure_functions";
	var TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = "azure_app_service";
	var TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = "gcp_compute_engine";
	var TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = "gcp_cloud_run";
	var TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = "gcp_kubernetes_engine";
	var TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = "gcp_cloud_functions";
	var TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE = "gcp_app_engine";
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_ECS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_ALIBABA_CLOUD_FC in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC = TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_EC2 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_EC2 = TMP_CLOUDPLATFORMVALUES_AWS_EC2;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_ECS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_ECS = TMP_CLOUDPLATFORMVALUES_AWS_ECS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_EKS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_EKS = TMP_CLOUDPLATFORMVALUES_AWS_EKS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_LAMBDA in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_LAMBDA = TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AWS_ELASTIC_BEANSTALK in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK = TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_VM in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_VM = TMP_CLOUDPLATFORMVALUES_AZURE_VM;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_CONTAINER_INSTANCES in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES = TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_AKS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_AKS = TMP_CLOUDPLATFORMVALUES_AZURE_AKS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_FUNCTIONS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_FUNCTIONS = TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_AZURE_APP_SERVICE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_AZURE_APP_SERVICE = TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_COMPUTE_ENGINE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_CLOUD_RUN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_CLOUD_RUN = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_KUBERNETES_ENGINE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_CLOUD_FUNCTIONS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS = TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS;
	/**
	* The cloud platform in use.
	*
	* Note: The prefix of the service SHOULD match the one specified in `cloud.provider`.
	*
	* @deprecated Use CLOUD_PLATFORM_VALUE_GCP_APP_ENGINE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.CLOUDPLATFORMVALUES_GCP_APP_ENGINE = TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE;
	/**
	* The constant map of values for CloudPlatformValues.
	* @deprecated Use the CLOUDPLATFORMVALUES_XXXXX constants rather than the CloudPlatformValues.XXXXX for bundle minification.
	*/
	exports.CloudPlatformValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_ECS,
		TMP_CLOUDPLATFORMVALUES_ALIBABA_CLOUD_FC,
		TMP_CLOUDPLATFORMVALUES_AWS_EC2,
		TMP_CLOUDPLATFORMVALUES_AWS_ECS,
		TMP_CLOUDPLATFORMVALUES_AWS_EKS,
		TMP_CLOUDPLATFORMVALUES_AWS_LAMBDA,
		TMP_CLOUDPLATFORMVALUES_AWS_ELASTIC_BEANSTALK,
		TMP_CLOUDPLATFORMVALUES_AZURE_VM,
		TMP_CLOUDPLATFORMVALUES_AZURE_CONTAINER_INSTANCES,
		TMP_CLOUDPLATFORMVALUES_AZURE_AKS,
		TMP_CLOUDPLATFORMVALUES_AZURE_FUNCTIONS,
		TMP_CLOUDPLATFORMVALUES_AZURE_APP_SERVICE,
		TMP_CLOUDPLATFORMVALUES_GCP_COMPUTE_ENGINE,
		TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_RUN,
		TMP_CLOUDPLATFORMVALUES_GCP_KUBERNETES_ENGINE,
		TMP_CLOUDPLATFORMVALUES_GCP_CLOUD_FUNCTIONS,
		TMP_CLOUDPLATFORMVALUES_GCP_APP_ENGINE
	]);
	var TMP_AWSECSLAUNCHTYPEVALUES_EC2 = "ec2";
	var TMP_AWSECSLAUNCHTYPEVALUES_FARGATE = "fargate";
	/**
	* The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
	*
	* @deprecated Use AWS_ECS_LAUNCHTYPE_VALUE_EC2 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.AWSECSLAUNCHTYPEVALUES_EC2 = TMP_AWSECSLAUNCHTYPEVALUES_EC2;
	/**
	* The [launch type](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html) for an ECS task.
	*
	* @deprecated Use AWS_ECS_LAUNCHTYPE_VALUE_FARGATE in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.AWSECSLAUNCHTYPEVALUES_FARGATE = TMP_AWSECSLAUNCHTYPEVALUES_FARGATE;
	/**
	* The constant map of values for AwsEcsLaunchtypeValues.
	* @deprecated Use the AWSECSLAUNCHTYPEVALUES_XXXXX constants rather than the AwsEcsLaunchtypeValues.XXXXX for bundle minification.
	*/
	exports.AwsEcsLaunchtypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([TMP_AWSECSLAUNCHTYPEVALUES_EC2, TMP_AWSECSLAUNCHTYPEVALUES_FARGATE]);
	var TMP_HOSTARCHVALUES_AMD64 = "amd64";
	var TMP_HOSTARCHVALUES_ARM32 = "arm32";
	var TMP_HOSTARCHVALUES_ARM64 = "arm64";
	var TMP_HOSTARCHVALUES_IA64 = "ia64";
	var TMP_HOSTARCHVALUES_PPC32 = "ppc32";
	var TMP_HOSTARCHVALUES_PPC64 = "ppc64";
	var TMP_HOSTARCHVALUES_X86 = "x86";
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_AMD64 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_AMD64 = TMP_HOSTARCHVALUES_AMD64;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_ARM32 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_ARM32 = TMP_HOSTARCHVALUES_ARM32;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_ARM64 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_ARM64 = TMP_HOSTARCHVALUES_ARM64;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_IA64 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_IA64 = TMP_HOSTARCHVALUES_IA64;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_PPC32 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_PPC32 = TMP_HOSTARCHVALUES_PPC32;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_PPC64 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_PPC64 = TMP_HOSTARCHVALUES_PPC64;
	/**
	* The CPU architecture the host system is running on.
	*
	* @deprecated Use HOST_ARCH_VALUE_X86 in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.HOSTARCHVALUES_X86 = TMP_HOSTARCHVALUES_X86;
	/**
	* The constant map of values for HostArchValues.
	* @deprecated Use the HOSTARCHVALUES_XXXXX constants rather than the HostArchValues.XXXXX for bundle minification.
	*/
	exports.HostArchValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_HOSTARCHVALUES_AMD64,
		TMP_HOSTARCHVALUES_ARM32,
		TMP_HOSTARCHVALUES_ARM64,
		TMP_HOSTARCHVALUES_IA64,
		TMP_HOSTARCHVALUES_PPC32,
		TMP_HOSTARCHVALUES_PPC64,
		TMP_HOSTARCHVALUES_X86
	]);
	var TMP_OSTYPEVALUES_WINDOWS = "windows";
	var TMP_OSTYPEVALUES_LINUX = "linux";
	var TMP_OSTYPEVALUES_DARWIN = "darwin";
	var TMP_OSTYPEVALUES_FREEBSD = "freebsd";
	var TMP_OSTYPEVALUES_NETBSD = "netbsd";
	var TMP_OSTYPEVALUES_OPENBSD = "openbsd";
	var TMP_OSTYPEVALUES_DRAGONFLYBSD = "dragonflybsd";
	var TMP_OSTYPEVALUES_HPUX = "hpux";
	var TMP_OSTYPEVALUES_AIX = "aix";
	var TMP_OSTYPEVALUES_SOLARIS = "solaris";
	var TMP_OSTYPEVALUES_Z_OS = "z_os";
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_WINDOWS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_WINDOWS = TMP_OSTYPEVALUES_WINDOWS;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_LINUX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_LINUX = TMP_OSTYPEVALUES_LINUX;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_DARWIN in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_DARWIN = TMP_OSTYPEVALUES_DARWIN;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_FREEBSD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_FREEBSD = TMP_OSTYPEVALUES_FREEBSD;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_NETBSD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_NETBSD = TMP_OSTYPEVALUES_NETBSD;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_OPENBSD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_OPENBSD = TMP_OSTYPEVALUES_OPENBSD;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_DRAGONFLYBSD in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_DRAGONFLYBSD = TMP_OSTYPEVALUES_DRAGONFLYBSD;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_HPUX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_HPUX = TMP_OSTYPEVALUES_HPUX;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_AIX in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_AIX = TMP_OSTYPEVALUES_AIX;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_SOLARIS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_SOLARIS = TMP_OSTYPEVALUES_SOLARIS;
	/**
	* The operating system type.
	*
	* @deprecated Use OS_TYPE_VALUE_Z_OS in [incubating entry-point]({@link https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv}).
	*/
	exports.OSTYPEVALUES_Z_OS = TMP_OSTYPEVALUES_Z_OS;
	/**
	* The constant map of values for OsTypeValues.
	* @deprecated Use the OSTYPEVALUES_XXXXX constants rather than the OsTypeValues.XXXXX for bundle minification.
	*/
	exports.OsTypeValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_OSTYPEVALUES_WINDOWS,
		TMP_OSTYPEVALUES_LINUX,
		TMP_OSTYPEVALUES_DARWIN,
		TMP_OSTYPEVALUES_FREEBSD,
		TMP_OSTYPEVALUES_NETBSD,
		TMP_OSTYPEVALUES_OPENBSD,
		TMP_OSTYPEVALUES_DRAGONFLYBSD,
		TMP_OSTYPEVALUES_HPUX,
		TMP_OSTYPEVALUES_AIX,
		TMP_OSTYPEVALUES_SOLARIS,
		TMP_OSTYPEVALUES_Z_OS
	]);
	var TMP_TELEMETRYSDKLANGUAGEVALUES_CPP = "cpp";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET = "dotnet";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG = "erlang";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_GO = "go";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA = "java";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS = "nodejs";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_PHP = "php";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON = "python";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY = "ruby";
	var TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS = "webjs";
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_CPP.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_CPP = TMP_TELEMETRYSDKLANGUAGEVALUES_CPP;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_DOTNET = TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_ERLANG = TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_GO.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_GO = TMP_TELEMETRYSDKLANGUAGEVALUES_GO;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_JAVA.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_JAVA = TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_NODEJS = TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_PHP.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_PHP = TMP_TELEMETRYSDKLANGUAGEVALUES_PHP;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_PYTHON = TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_RUBY.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_RUBY = TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY;
	/**
	* The language of the telemetry SDK.
	*
	* @deprecated Use TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS.
	*/
	exports.TELEMETRYSDKLANGUAGEVALUES_WEBJS = TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS;
	/**
	* The constant map of values for TelemetrySdkLanguageValues.
	* @deprecated Use the TELEMETRYSDKLANGUAGEVALUES_XXXXX constants rather than the TelemetrySdkLanguageValues.XXXXX for bundle minification.
	*/
	exports.TelemetrySdkLanguageValues = /*#__PURE__*/ (0, utils_1.createConstMap)([
		TMP_TELEMETRYSDKLANGUAGEVALUES_CPP,
		TMP_TELEMETRYSDKLANGUAGEVALUES_DOTNET,
		TMP_TELEMETRYSDKLANGUAGEVALUES_ERLANG,
		TMP_TELEMETRYSDKLANGUAGEVALUES_GO,
		TMP_TELEMETRYSDKLANGUAGEVALUES_JAVA,
		TMP_TELEMETRYSDKLANGUAGEVALUES_NODEJS,
		TMP_TELEMETRYSDKLANGUAGEVALUES_PHP,
		TMP_TELEMETRYSDKLANGUAGEVALUES_PYTHON,
		TMP_TELEMETRYSDKLANGUAGEVALUES_RUBY,
		TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS
	]);
}));
//#endregion
//#region node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/build/src/resource/index.js
var require_resource = /* @__PURE__ */ __commonJSMin(((exports) => {
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
	var __exportStar = exports && exports.__exportStar || function(m, exports$2) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$2, p)) __createBinding(exports$2, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_SemanticResourceAttributes(), exports);
}));
//#endregion
//#region node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/build/src/stable_attributes.js
var require_stable_attributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HTTP_REQUEST_METHOD_VALUE_POST = exports.HTTP_REQUEST_METHOD_VALUE_PATCH = exports.HTTP_REQUEST_METHOD_VALUE_OPTIONS = exports.HTTP_REQUEST_METHOD_VALUE_HEAD = exports.HTTP_REQUEST_METHOD_VALUE_GET = exports.HTTP_REQUEST_METHOD_VALUE_DELETE = exports.HTTP_REQUEST_METHOD_VALUE_CONNECT = exports.HTTP_REQUEST_METHOD_VALUE_OTHER = exports.ATTR_HTTP_REQUEST_METHOD = exports.ATTR_HTTP_REQUEST_HEADER = exports.ATTR_EXCEPTION_TYPE = exports.ATTR_EXCEPTION_STACKTRACE = exports.ATTR_EXCEPTION_MESSAGE = exports.ATTR_EXCEPTION_ESCAPED = exports.ERROR_TYPE_VALUE_OTHER = exports.ATTR_ERROR_TYPE = exports.ATTR_CLIENT_PORT = exports.ATTR_CLIENT_ADDRESS = exports.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = exports.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = exports.ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = exports.ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = exports.ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = exports.ATTR_ASPNETCORE_RATE_LIMITING_POLICY = exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = exports.ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = exports.ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = exports.ATTR_TELEMETRY_SDK_VERSION = exports.ATTR_TELEMETRY_SDK_NAME = exports.TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = exports.TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = exports.TELEMETRY_SDK_LANGUAGE_VALUE_RUST = exports.TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = exports.TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = exports.TELEMETRY_SDK_LANGUAGE_VALUE_PHP = exports.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = exports.TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = exports.TELEMETRY_SDK_LANGUAGE_VALUE_GO = exports.TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = exports.TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = exports.TELEMETRY_SDK_LANGUAGE_VALUE_CPP = exports.ATTR_TELEMETRY_SDK_LANGUAGE = exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = exports.ATTR_ASPNETCORE_RATE_LIMITING_RESULT = void 0;
	exports.SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = exports.SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = exports.SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = exports.ATTR_SIGNALR_CONNECTION_STATUS = exports.ATTR_SERVICE_VERSION = exports.ATTR_SERVICE_NAME = exports.ATTR_SERVER_PORT = exports.ATTR_SERVER_ADDRESS = exports.ATTR_OTEL_STATUS_DESCRIPTION = exports.OTEL_STATUS_CODE_VALUE_OK = exports.OTEL_STATUS_CODE_VALUE_ERROR = exports.ATTR_OTEL_STATUS_CODE = exports.ATTR_OTEL_SCOPE_VERSION = exports.ATTR_OTEL_SCOPE_NAME = exports.NETWORK_TYPE_VALUE_IPV6 = exports.NETWORK_TYPE_VALUE_IPV4 = exports.ATTR_NETWORK_TYPE = exports.NETWORK_TRANSPORT_VALUE_UNIX = exports.NETWORK_TRANSPORT_VALUE_UDP = exports.NETWORK_TRANSPORT_VALUE_TCP = exports.NETWORK_TRANSPORT_VALUE_QUIC = exports.NETWORK_TRANSPORT_VALUE_PIPE = exports.ATTR_NETWORK_TRANSPORT = exports.ATTR_NETWORK_PROTOCOL_VERSION = exports.ATTR_NETWORK_PROTOCOL_NAME = exports.ATTR_NETWORK_PEER_PORT = exports.ATTR_NETWORK_PEER_ADDRESS = exports.ATTR_NETWORK_LOCAL_PORT = exports.ATTR_NETWORK_LOCAL_ADDRESS = exports.JVM_THREAD_STATE_VALUE_WAITING = exports.JVM_THREAD_STATE_VALUE_TIMED_WAITING = exports.JVM_THREAD_STATE_VALUE_TERMINATED = exports.JVM_THREAD_STATE_VALUE_RUNNABLE = exports.JVM_THREAD_STATE_VALUE_NEW = exports.JVM_THREAD_STATE_VALUE_BLOCKED = exports.ATTR_JVM_THREAD_STATE = exports.ATTR_JVM_THREAD_DAEMON = exports.JVM_MEMORY_TYPE_VALUE_NON_HEAP = exports.JVM_MEMORY_TYPE_VALUE_HEAP = exports.ATTR_JVM_MEMORY_TYPE = exports.ATTR_JVM_MEMORY_POOL_NAME = exports.ATTR_JVM_GC_NAME = exports.ATTR_JVM_GC_ACTION = exports.ATTR_HTTP_ROUTE = exports.ATTR_HTTP_RESPONSE_STATUS_CODE = exports.ATTR_HTTP_RESPONSE_HEADER = exports.ATTR_HTTP_REQUEST_RESEND_COUNT = exports.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = exports.HTTP_REQUEST_METHOD_VALUE_TRACE = exports.HTTP_REQUEST_METHOD_VALUE_PUT = void 0;
	exports.ATTR_USER_AGENT_ORIGINAL = exports.ATTR_URL_SCHEME = exports.ATTR_URL_QUERY = exports.ATTR_URL_PATH = exports.ATTR_URL_FULL = exports.ATTR_URL_FRAGMENT = exports.SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = exports.SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = exports.SIGNALR_TRANSPORT_VALUE_LONG_POLLING = exports.ATTR_SIGNALR_TRANSPORT = void 0;
	/**
	* Rate-limiting result, shows whether the lease was acquired or contains a rejection reason
	*
	* @example acquired
	* @example request_canceled
	*/
	exports.ATTR_ASPNETCORE_RATE_LIMITING_RESULT = "aspnetcore.rate_limiting.result";
	/**
	* Enum value "acquired" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
	*/
	exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = "acquired";
	/**
	* Enum value "endpoint_limiter" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
	*/
	exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = "endpoint_limiter";
	/**
	* Enum value "global_limiter" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
	*/
	exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = "global_limiter";
	/**
	* Enum value "request_canceled" for attribute {@link ATTR_ASPNETCORE_RATE_LIMITING_RESULT}.
	*/
	exports.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = "request_canceled";
	/**
	* The language of the telemetry SDK.
	*/
	exports.ATTR_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
	/**
	* Enum value "cpp" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_CPP = "cpp";
	/**
	* Enum value "dotnet" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = "dotnet";
	/**
	* Enum value "erlang" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = "erlang";
	/**
	* Enum value "go" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_GO = "go";
	/**
	* Enum value "java" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = "java";
	/**
	* Enum value "nodejs" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = "nodejs";
	/**
	* Enum value "php" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_PHP = "php";
	/**
	* Enum value "python" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = "python";
	/**
	* Enum value "ruby" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = "ruby";
	/**
	* Enum value "rust" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_RUST = "rust";
	/**
	* Enum value "swift" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = "swift";
	/**
	* Enum value "webjs" for attribute {@link ATTR_TELEMETRY_SDK_LANGUAGE}.
	*/
	exports.TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
	/**
	* The name of the telemetry SDK as defined above.
	*
	* @example opentelemetry
	*
	* @note The OpenTelemetry SDK **MUST** set the `telemetry.sdk.name` attribute to `opentelemetry`.
	* If another SDK, like a fork or a vendor-provided implementation, is used, this SDK **MUST** set the
	* `telemetry.sdk.name` attribute to the fully-qualified class or module name of this SDK's main entry point
	* or another suitable identifier depending on the language.
	* The identifier `opentelemetry` is reserved and **MUST NOT** be used in this case.
	* All custom identifiers **SHOULD** be stable across different versions of an implementation.
	*/
	exports.ATTR_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
	/**
	* The version string of the telemetry SDK.
	*
	* @example 1.2.3
	*/
	exports.ATTR_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
	/**
	* Full type name of the [`IExceptionHandler`](https://learn.microsoft.com/dotnet/api/microsoft.aspnetcore.diagnostics.iexceptionhandler) implementation that handled the exception.
	*
	* @example Contoso.MyHandler
	*/
	exports.ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = "aspnetcore.diagnostics.handler.type";
	/**
	* ASP.NET Core exception middleware handling result
	*
	* @example handled
	* @example unhandled
	*/
	exports.ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = "aspnetcore.diagnostics.exception.result";
	/**
	* Enum value "aborted" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
	*/
	exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = "aborted";
	/**
	* Enum value "handled" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
	*/
	exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = "handled";
	/**
	* Enum value "skipped" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
	*/
	exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = "skipped";
	/**
	* Enum value "unhandled" for attribute {@link ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT}.
	*/
	exports.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = "unhandled";
	/**
	* Rate limiting policy name.
	*
	* @example fixed
	* @example sliding
	* @example token
	*/
	exports.ATTR_ASPNETCORE_RATE_LIMITING_POLICY = "aspnetcore.rate_limiting.policy";
	/**
	* Flag indicating if request was handled by the application pipeline.
	*
	* @example true
	*/
	exports.ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = "aspnetcore.request.is_unhandled";
	/**
	* A value that indicates whether the matched route is a fallback route.
	*
	* @example true
	*/
	exports.ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = "aspnetcore.routing.is_fallback";
	/**
	* Match result - success or failure
	*
	* @example success
	* @example failure
	*/
	exports.ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = "aspnetcore.routing.match_status";
	/**
	* Enum value "failure" for attribute {@link ATTR_ASPNETCORE_ROUTING_MATCH_STATUS}.
	*/
	exports.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = "failure";
	/**
	* Enum value "success" for attribute {@link ATTR_ASPNETCORE_ROUTING_MATCH_STATUS}.
	*/
	exports.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = "success";
	/**
	* Client address - domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
	*
	* @example client.example.com
	* @example 10.1.2.80
	* @example /tmp/my.sock
	*
	* @note When observed from the server side, and when communicating through an intermediary, `client.address` **SHOULD** represent the client address behind any intermediaries,  for example proxies, if it's available.
	*/
	exports.ATTR_CLIENT_ADDRESS = "client.address";
	/**
	* Client port number.
	*
	* @example 65123
	*
	* @note When observed from the server side, and when communicating through an intermediary, `client.port` **SHOULD** represent the client port behind any intermediaries,  for example proxies, if it's available.
	*/
	exports.ATTR_CLIENT_PORT = "client.port";
	/**
	* Describes a class of error the operation ended with.
	*
	* @example timeout
	* @example java.net.UnknownHostException
	* @example server_certificate_invalid
	* @example 500
	*
	* @note The `error.type` **SHOULD** be predictable, and **SHOULD** have low cardinality.
	*
	* When `error.type` is set to a type (e.g., an exception type), its
	* canonical class name identifying the type within the artifact **SHOULD** be used.
	*
	* Instrumentations **SHOULD** document the list of errors they report.
	*
	* The cardinality of `error.type` within one instrumentation library **SHOULD** be low.
	* Telemetry consumers that aggregate data from multiple instrumentation libraries and applications
	* should be prepared for `error.type` to have high cardinality at query time when no
	* additional filters are applied.
	*
	* If the operation has completed successfully, instrumentations **SHOULD NOT** set `error.type`.
	*
	* If a specific domain defines its own set of error identifiers (such as HTTP or gRPC status codes),
	* it's **RECOMMENDED** to:
	*
	*   - Use a domain-specific attribute
	*   - Set `error.type` to capture all errors, regardless of whether they are defined within the domain-specific set or not.
	*/
	exports.ATTR_ERROR_TYPE = "error.type";
	/**
	* Enum value "_OTHER" for attribute {@link ATTR_ERROR_TYPE}.
	*/
	exports.ERROR_TYPE_VALUE_OTHER = "_OTHER";
	/**
	* **SHOULD** be set to true if the exception event is recorded at a point where it is known that the exception is escaping the scope of the span.
	*
	* @note An exception is considered to have escaped (or left) the scope of a span,
	* if that span is ended while the exception is still logically "in flight".
	* This may be actually "in flight" in some languages (e.g. if the exception
	* is passed to a Context manager's `__exit__` method in Python) but will
	* usually be caught at the point of recording the exception in most languages.
	*
	* It is usually not possible to determine at the point where an exception is thrown
	* whether it will escape the scope of a span.
	* However, it is trivial to know that an exception
	* will escape, if one checks for an active exception just before ending the span,
	* as done in the [example for recording span exceptions](https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-spans/#recording-an-exception).
	*
	* It follows that an exception may still escape the scope of the span
	* even if the `exception.escaped` attribute was not set or set to false,
	* since the event might have been recorded at a time where it was not
	* clear whether the exception will escape.
	*/
	exports.ATTR_EXCEPTION_ESCAPED = "exception.escaped";
	/**
	* The exception message.
	*
	* @example Division by zero
	* @example Can't convert 'int' object to str implicitly
	*/
	exports.ATTR_EXCEPTION_MESSAGE = "exception.message";
	/**
	* A stacktrace as a string in the natural representation for the language runtime. The representation is to be determined and documented by each language SIG.
	*
	* @example "Exception in thread "main" java.lang.RuntimeException: Test exception\\n at com.example.GenerateTrace.methodB(GenerateTrace.java:13)\\n at com.example.GenerateTrace.methodA(GenerateTrace.java:9)\\n at com.example.GenerateTrace.main(GenerateTrace.java:5)\\n"
	*/
	exports.ATTR_EXCEPTION_STACKTRACE = "exception.stacktrace";
	/**
	* The type of the exception (its fully-qualified class name, if applicable). The dynamic type of the exception should be preferred over the static type in languages that support it.
	*
	* @example java.net.ConnectException
	* @example OSError
	*/
	exports.ATTR_EXCEPTION_TYPE = "exception.type";
	/**
	* HTTP request headers, `<key>` being the normalized HTTP Header name (lowercase), the value being the header values.
	*
	* @example http.request.header.content-type=["application/json"]
	* @example http.request.header.x-forwarded-for=["1.2.3.4", "1.2.3.5"]
	*
	* @note Instrumentations **SHOULD** require an explicit configuration of which headers are to be captured. Including all request headers can be a security risk - explicit configuration helps avoid leaking sensitive information.
	* The `User-Agent` header is already captured in the `user_agent.original` attribute. Users **MAY** explicitly configure instrumentations to capture them even though it is not recommended.
	* The attribute value **MUST** consist of either multiple header values as an array of strings or a single-item array containing a possibly comma-concatenated string, depending on the way the HTTP library provides access to headers.
	*/
	var ATTR_HTTP_REQUEST_HEADER = (key) => `http.request.header.${key}`;
	exports.ATTR_HTTP_REQUEST_HEADER = ATTR_HTTP_REQUEST_HEADER;
	/**
	* HTTP request method.
	*
	* @example GET
	* @example POST
	* @example HEAD
	*
	* @note HTTP request method value **SHOULD** be "known" to the instrumentation.
	* By default, this convention defines "known" methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
	* and the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html).
	*
	* If the HTTP request method is not known to instrumentation, it **MUST** set the `http.request.method` attribute to `_OTHER`.
	*
	* If the HTTP instrumentation could end up converting valid HTTP request methods to `_OTHER`, then it **MUST** provide a way to override
	* the list of known HTTP methods. If this override is done via environment variable, then the environment variable **MUST** be named
	* OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS and support a comma-separated list of case-sensitive known HTTP methods
	* (this list **MUST** be a full override of the default known method, it is not a list of known methods in addition to the defaults).
	*
	* HTTP method names are case-sensitive and `http.request.method` attribute value **MUST** match a known HTTP method name exactly.
	* Instrumentations for specific web frameworks that consider HTTP methods to be case insensitive, **SHOULD** populate a canonical equivalent.
	* Tracing instrumentations that do so, **MUST** also set `http.request.method_original` to the original value.
	*/
	exports.ATTR_HTTP_REQUEST_METHOD = "http.request.method";
	/**
	* Enum value "_OTHER" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_OTHER = "_OTHER";
	/**
	* Enum value "CONNECT" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_CONNECT = "CONNECT";
	/**
	* Enum value "DELETE" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_DELETE = "DELETE";
	/**
	* Enum value "GET" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_GET = "GET";
	/**
	* Enum value "HEAD" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_HEAD = "HEAD";
	/**
	* Enum value "OPTIONS" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_OPTIONS = "OPTIONS";
	/**
	* Enum value "PATCH" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_PATCH = "PATCH";
	/**
	* Enum value "POST" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_POST = "POST";
	/**
	* Enum value "PUT" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_PUT = "PUT";
	/**
	* Enum value "TRACE" for attribute {@link ATTR_HTTP_REQUEST_METHOD}.
	*/
	exports.HTTP_REQUEST_METHOD_VALUE_TRACE = "TRACE";
	/**
	* Original HTTP method sent by the client in the request line.
	*
	* @example GeT
	* @example ACL
	* @example foo
	*/
	exports.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = "http.request.method_original";
	/**
	* The ordinal number of request resending attempt (for any reason, including redirects).
	*
	* @example 3
	*
	* @note The resend count **SHOULD** be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
	*/
	exports.ATTR_HTTP_REQUEST_RESEND_COUNT = "http.request.resend_count";
	/**
	* HTTP response headers, `<key>` being the normalized HTTP Header name (lowercase), the value being the header values.
	*
	* @example http.response.header.content-type=["application/json"]
	* @example http.response.header.my-custom-header=["abc", "def"]
	*
	* @note Instrumentations **SHOULD** require an explicit configuration of which headers are to be captured. Including all response headers can be a security risk - explicit configuration helps avoid leaking sensitive information.
	* Users **MAY** explicitly configure instrumentations to capture them even though it is not recommended.
	* The attribute value **MUST** consist of either multiple header values as an array of strings or a single-item array containing a possibly comma-concatenated string, depending on the way the HTTP library provides access to headers.
	*/
	var ATTR_HTTP_RESPONSE_HEADER = (key) => `http.response.header.${key}`;
	exports.ATTR_HTTP_RESPONSE_HEADER = ATTR_HTTP_RESPONSE_HEADER;
	/**
	* [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
	*
	* @example 200
	*/
	exports.ATTR_HTTP_RESPONSE_STATUS_CODE = "http.response.status_code";
	/**
	* The matched route, that is, the path template in the format used by the respective server framework.
	*
	* @example /users/:userID?
	* @example {controller}/{action}/{id?}
	*
	* @note **MUST NOT** be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
	* **SHOULD** include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
	*/
	exports.ATTR_HTTP_ROUTE = "http.route";
	/**
	* Name of the garbage collector action.
	*
	* @example end of minor GC
	* @example end of major GC
	*
	* @note Garbage collector action is generally obtained via [GarbageCollectionNotificationInfo#getGcAction()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcAction()).
	*/
	exports.ATTR_JVM_GC_ACTION = "jvm.gc.action";
	/**
	* Name of the garbage collector.
	*
	* @example G1 Young Generation
	* @example G1 Old Generation
	*
	* @note Garbage collector name is generally obtained via [GarbageCollectionNotificationInfo#getGcName()](https://docs.oracle.com/en/java/javase/11/docs/api/jdk.management/com/sun/management/GarbageCollectionNotificationInfo.html#getGcName()).
	*/
	exports.ATTR_JVM_GC_NAME = "jvm.gc.name";
	/**
	* Name of the memory pool.
	*
	* @example G1 Old Gen
	* @example G1 Eden space
	* @example G1 Survivor Space
	*
	* @note Pool names are generally obtained via [MemoryPoolMXBean#getName()](https://docs.oracle.com/en/java/javase/11/docs/api/java.management/java/lang/management/MemoryPoolMXBean.html#getName()).
	*/
	exports.ATTR_JVM_MEMORY_POOL_NAME = "jvm.memory.pool.name";
	/**
	* The type of memory.
	*
	* @example heap
	* @example non_heap
	*/
	exports.ATTR_JVM_MEMORY_TYPE = "jvm.memory.type";
	/**
	* Enum value "heap" for attribute {@link ATTR_JVM_MEMORY_TYPE}.
	*/
	exports.JVM_MEMORY_TYPE_VALUE_HEAP = "heap";
	/**
	* Enum value "non_heap" for attribute {@link ATTR_JVM_MEMORY_TYPE}.
	*/
	exports.JVM_MEMORY_TYPE_VALUE_NON_HEAP = "non_heap";
	/**
	* Whether the thread is daemon or not.
	*/
	exports.ATTR_JVM_THREAD_DAEMON = "jvm.thread.daemon";
	/**
	* State of the thread.
	*
	* @example runnable
	* @example blocked
	*/
	exports.ATTR_JVM_THREAD_STATE = "jvm.thread.state";
	/**
	* Enum value "blocked" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*/
	exports.JVM_THREAD_STATE_VALUE_BLOCKED = "blocked";
	/**
	* Enum value "new" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*/
	exports.JVM_THREAD_STATE_VALUE_NEW = "new";
	/**
	* Enum value "runnable" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*/
	exports.JVM_THREAD_STATE_VALUE_RUNNABLE = "runnable";
	/**
	* Enum value "terminated" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*/
	exports.JVM_THREAD_STATE_VALUE_TERMINATED = "terminated";
	/**
	* Enum value "timed_waiting" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*/
	exports.JVM_THREAD_STATE_VALUE_TIMED_WAITING = "timed_waiting";
	/**
	* Enum value "waiting" for attribute {@link ATTR_JVM_THREAD_STATE}.
	*/
	exports.JVM_THREAD_STATE_VALUE_WAITING = "waiting";
	/**
	* Local address of the network connection - IP address or Unix domain socket name.
	*
	* @example 10.1.2.80
	* @example /tmp/my.sock
	*/
	exports.ATTR_NETWORK_LOCAL_ADDRESS = "network.local.address";
	/**
	* Local port number of the network connection.
	*
	* @example 65123
	*/
	exports.ATTR_NETWORK_LOCAL_PORT = "network.local.port";
	/**
	* Peer address of the network connection - IP address or Unix domain socket name.
	*
	* @example 10.1.2.80
	* @example /tmp/my.sock
	*/
	exports.ATTR_NETWORK_PEER_ADDRESS = "network.peer.address";
	/**
	* Peer port number of the network connection.
	*
	* @example 65123
	*/
	exports.ATTR_NETWORK_PEER_PORT = "network.peer.port";
	/**
	* [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
	*
	* @example amqp
	* @example http
	* @example mqtt
	*
	* @note The value **SHOULD** be normalized to lowercase.
	*/
	exports.ATTR_NETWORK_PROTOCOL_NAME = "network.protocol.name";
	/**
	* The actual version of the protocol used for network communication.
	*
	* @example 1.1
	* @example 2
	*
	* @note If protocol version is subject to negotiation (for example using [ALPN](https://www.rfc-editor.org/rfc/rfc7301.html)), this attribute **SHOULD** be set to the negotiated version. If the actual protocol version is not known, this attribute **SHOULD NOT** be set.
	*/
	exports.ATTR_NETWORK_PROTOCOL_VERSION = "network.protocol.version";
	/**
	* [OSI transport layer](https://osi-model.com/transport-layer/) or [inter-process communication method](https://wikipedia.org/wiki/Inter-process_communication).
	*
	* @example tcp
	* @example udp
	*
	* @note The value **SHOULD** be normalized to lowercase.
	*
	* Consider always setting the transport when setting a port number, since
	* a port number is ambiguous without knowing the transport. For example
	* different processes could be listening on TCP port 12345 and UDP port 12345.
	*/
	exports.ATTR_NETWORK_TRANSPORT = "network.transport";
	/**
	* Enum value "pipe" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*/
	exports.NETWORK_TRANSPORT_VALUE_PIPE = "pipe";
	/**
	* Enum value "quic" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*/
	exports.NETWORK_TRANSPORT_VALUE_QUIC = "quic";
	/**
	* Enum value "tcp" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*/
	exports.NETWORK_TRANSPORT_VALUE_TCP = "tcp";
	/**
	* Enum value "udp" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*/
	exports.NETWORK_TRANSPORT_VALUE_UDP = "udp";
	/**
	* Enum value "unix" for attribute {@link ATTR_NETWORK_TRANSPORT}.
	*/
	exports.NETWORK_TRANSPORT_VALUE_UNIX = "unix";
	/**
	* [OSI network layer](https://osi-model.com/network-layer/) or non-OSI equivalent.
	*
	* @example ipv4
	* @example ipv6
	*
	* @note The value **SHOULD** be normalized to lowercase.
	*/
	exports.ATTR_NETWORK_TYPE = "network.type";
	/**
	* Enum value "ipv4" for attribute {@link ATTR_NETWORK_TYPE}.
	*/
	exports.NETWORK_TYPE_VALUE_IPV4 = "ipv4";
	/**
	* Enum value "ipv6" for attribute {@link ATTR_NETWORK_TYPE}.
	*/
	exports.NETWORK_TYPE_VALUE_IPV6 = "ipv6";
	/**
	* The name of the instrumentation scope - (`InstrumentationScope.Name` in OTLP).
	*
	* @example io.opentelemetry.contrib.mongodb
	*/
	exports.ATTR_OTEL_SCOPE_NAME = "otel.scope.name";
	/**
	* The version of the instrumentation scope - (`InstrumentationScope.Version` in OTLP).
	*
	* @example 1.0.0
	*/
	exports.ATTR_OTEL_SCOPE_VERSION = "otel.scope.version";
	/**
	* Name of the code, either "OK" or "ERROR". **MUST NOT** be set if the status code is UNSET.
	*/
	exports.ATTR_OTEL_STATUS_CODE = "otel.status_code";
	/**
	* Enum value "ERROR" for attribute {@link ATTR_OTEL_STATUS_CODE}.
	*/
	exports.OTEL_STATUS_CODE_VALUE_ERROR = "ERROR";
	/**
	* Enum value "OK" for attribute {@link ATTR_OTEL_STATUS_CODE}.
	*/
	exports.OTEL_STATUS_CODE_VALUE_OK = "OK";
	/**
	* Description of the Status if it has a value, otherwise not set.
	*
	* @example resource not found
	*/
	exports.ATTR_OTEL_STATUS_DESCRIPTION = "otel.status_description";
	/**
	* Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
	*
	* @example example.com
	* @example 10.1.2.80
	* @example /tmp/my.sock
	*
	* @note When observed from the client side, and when communicating through an intermediary, `server.address` **SHOULD** represent the server address behind any intermediaries, for example proxies, if it's available.
	*/
	exports.ATTR_SERVER_ADDRESS = "server.address";
	/**
	* Server port number.
	*
	* @example 80
	* @example 8080
	* @example 443
	*
	* @note When observed from the client side, and when communicating through an intermediary, `server.port` **SHOULD** represent the server port behind any intermediaries, for example proxies, if it's available.
	*/
	exports.ATTR_SERVER_PORT = "server.port";
	/**
	* Logical name of the service.
	*
	* @example shoppingcart
	*
	* @note **MUST** be the same for all instances of horizontally scaled services. If the value was not specified, SDKs **MUST** fallback to `unknown_service:` concatenated with [`process.executable.name`](process.md), e.g. `unknown_service:bash`. If `process.executable.name` is not available, the value **MUST** be set to `unknown_service`.
	*/
	exports.ATTR_SERVICE_NAME = "service.name";
	/**
	* The version string of the service API or implementation. The format is not defined by these conventions.
	*
	* @example 2.0.0
	* @example a01dbef8a
	*/
	exports.ATTR_SERVICE_VERSION = "service.version";
	/**
	* SignalR HTTP connection closure status.
	*
	* @example app_shutdown
	* @example timeout
	*/
	exports.ATTR_SIGNALR_CONNECTION_STATUS = "signalr.connection.status";
	/**
	* Enum value "app_shutdown" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
	*/
	exports.SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = "app_shutdown";
	/**
	* Enum value "normal_closure" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
	*/
	exports.SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = "normal_closure";
	/**
	* Enum value "timeout" for attribute {@link ATTR_SIGNALR_CONNECTION_STATUS}.
	*/
	exports.SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = "timeout";
	/**
	* [SignalR transport type](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/TransportProtocols.md)
	*
	* @example web_sockets
	* @example long_polling
	*/
	exports.ATTR_SIGNALR_TRANSPORT = "signalr.transport";
	/**
	* Enum value "long_polling" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
	*/
	exports.SIGNALR_TRANSPORT_VALUE_LONG_POLLING = "long_polling";
	/**
	* Enum value "server_sent_events" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
	*/
	exports.SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = "server_sent_events";
	/**
	* Enum value "web_sockets" for attribute {@link ATTR_SIGNALR_TRANSPORT}.
	*/
	exports.SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = "web_sockets";
	/**
	* The [URI fragment](https://www.rfc-editor.org/rfc/rfc3986#section-3.5) component
	*
	* @example SemConv
	*/
	exports.ATTR_URL_FRAGMENT = "url.fragment";
	/**
	* Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986)
	*
	* @example https://www.foo.bar/search?q=OpenTelemetry#SemConv
	* @example //localhost
	*
	* @note For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it **SHOULD** be included nevertheless.
	* `url.full` **MUST NOT** contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password **SHOULD** be redacted and attribute's value **SHOULD** be `https://REDACTED:REDACTED@www.example.com/`.
	* `url.full` **SHOULD** capture the absolute URL when it is available (or can be reconstructed). Sensitive content provided in `url.full` **SHOULD** be scrubbed when instrumentations can identify it.
	*/
	exports.ATTR_URL_FULL = "url.full";
	/**
	* The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component
	*
	* @example /search
	*
	* @note Sensitive content provided in `url.path` **SHOULD** be scrubbed when instrumentations can identify it.
	*/
	exports.ATTR_URL_PATH = "url.path";
	/**
	* The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component
	*
	* @example q=OpenTelemetry
	*
	* @note Sensitive content provided in `url.query` **SHOULD** be scrubbed when instrumentations can identify it.
	*/
	exports.ATTR_URL_QUERY = "url.query";
	/**
	* The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
	*
	* @example https
	* @example ftp
	* @example telnet
	*/
	exports.ATTR_URL_SCHEME = "url.scheme";
	/**
	* Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
	*
	* @example CERN-LineMode/2.15 libwww/2.17b3
	* @example Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1
	* @example YourApp/1.0.0 grpc-java-okhttp/1.27.2
	*/
	exports.ATTR_USER_AGENT_ORIGINAL = "user_agent.original";
}));
//#endregion
//#region node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/build/src/stable_metrics.js
var require_stable_metrics = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.METRIC_SIGNALR_SERVER_CONNECTION_DURATION = exports.METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = exports.METRIC_KESTREL_UPGRADED_CONNECTIONS = exports.METRIC_KESTREL_TLS_HANDSHAKE_DURATION = exports.METRIC_KESTREL_REJECTED_CONNECTIONS = exports.METRIC_KESTREL_QUEUED_REQUESTS = exports.METRIC_KESTREL_QUEUED_CONNECTIONS = exports.METRIC_KESTREL_CONNECTION_DURATION = exports.METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = exports.METRIC_KESTREL_ACTIVE_CONNECTIONS = exports.METRIC_JVM_THREAD_COUNT = exports.METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = exports.METRIC_JVM_MEMORY_USED = exports.METRIC_JVM_MEMORY_LIMIT = exports.METRIC_JVM_MEMORY_COMMITTED = exports.METRIC_JVM_GC_DURATION = exports.METRIC_JVM_CPU_TIME = exports.METRIC_JVM_CPU_RECENT_UTILIZATION = exports.METRIC_JVM_CPU_COUNT = exports.METRIC_JVM_CLASS_UNLOADED = exports.METRIC_JVM_CLASS_LOADED = exports.METRIC_JVM_CLASS_COUNT = exports.METRIC_HTTP_SERVER_REQUEST_DURATION = exports.METRIC_HTTP_CLIENT_REQUEST_DURATION = exports.METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = exports.METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = exports.METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = exports.METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = void 0;
	/**
	* Number of exceptions caught by exception handling middleware.
	*
	* @note Meter name: `Microsoft.AspNetCore.Diagnostics`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = "aspnetcore.diagnostics.exceptions";
	/**
	* Number of requests that are currently active on the server that hold a rate limiting lease.
	*
	* @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = "aspnetcore.rate_limiting.active_request_leases";
	/**
	* Number of requests that are currently queued, waiting to acquire a rate limiting lease.
	*
	* @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = "aspnetcore.rate_limiting.queued_requests";
	/**
	* The time the request spent in a queue waiting to acquire a rate limiting lease.
	*
	* @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = "aspnetcore.rate_limiting.request.time_in_queue";
	/**
	* The duration of rate limiting lease held by requests on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = "aspnetcore.rate_limiting.request_lease.duration";
	/**
	* Number of requests that tried to acquire a rate limiting lease.
	*
	* @note Requests could be:
	*
	*   - Rejected by global or endpoint rate limiting policies
	*   - Canceled while waiting for the lease.
	*
	* Meter name: `Microsoft.AspNetCore.RateLimiting`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = "aspnetcore.rate_limiting.requests";
	/**
	* Number of requests that were attempted to be matched to an endpoint.
	*
	* @note Meter name: `Microsoft.AspNetCore.Routing`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = "aspnetcore.routing.match_attempts";
	/**
	* Duration of HTTP client requests.
	*/
	exports.METRIC_HTTP_CLIENT_REQUEST_DURATION = "http.client.request.duration";
	/**
	* Duration of HTTP server requests.
	*/
	exports.METRIC_HTTP_SERVER_REQUEST_DURATION = "http.server.request.duration";
	/**
	* Number of classes currently loaded.
	*/
	exports.METRIC_JVM_CLASS_COUNT = "jvm.class.count";
	/**
	* Number of classes loaded since JVM start.
	*/
	exports.METRIC_JVM_CLASS_LOADED = "jvm.class.loaded";
	/**
	* Number of classes unloaded since JVM start.
	*/
	exports.METRIC_JVM_CLASS_UNLOADED = "jvm.class.unloaded";
	/**
	* Number of processors available to the Java virtual machine.
	*/
	exports.METRIC_JVM_CPU_COUNT = "jvm.cpu.count";
	/**
	* Recent CPU utilization for the process as reported by the JVM.
	*
	* @note The value range is [0.0,1.0]. This utilization is not defined as being for the specific interval since last measurement (unlike `system.cpu.utilization`). [Reference](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html#getProcessCpuLoad()).
	*/
	exports.METRIC_JVM_CPU_RECENT_UTILIZATION = "jvm.cpu.recent_utilization";
	/**
	* CPU time used by the process as reported by the JVM.
	*/
	exports.METRIC_JVM_CPU_TIME = "jvm.cpu.time";
	/**
	* Duration of JVM garbage collection actions.
	*/
	exports.METRIC_JVM_GC_DURATION = "jvm.gc.duration";
	/**
	* Measure of memory committed.
	*/
	exports.METRIC_JVM_MEMORY_COMMITTED = "jvm.memory.committed";
	/**
	* Measure of max obtainable memory.
	*/
	exports.METRIC_JVM_MEMORY_LIMIT = "jvm.memory.limit";
	/**
	* Measure of memory used.
	*/
	exports.METRIC_JVM_MEMORY_USED = "jvm.memory.used";
	/**
	* Measure of memory used, as measured after the most recent garbage collection event on this pool.
	*/
	exports.METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = "jvm.memory.used_after_last_gc";
	/**
	* Number of executing platform threads.
	*/
	exports.METRIC_JVM_THREAD_COUNT = "jvm.thread.count";
	/**
	* Number of connections that are currently active on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_ACTIVE_CONNECTIONS = "kestrel.active_connections";
	/**
	* Number of TLS handshakes that are currently in progress on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = "kestrel.active_tls_handshakes";
	/**
	* The duration of connections on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_CONNECTION_DURATION = "kestrel.connection.duration";
	/**
	* Number of connections that are currently queued and are waiting to start.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_QUEUED_CONNECTIONS = "kestrel.queued_connections";
	/**
	* Number of HTTP requests on multiplexed connections (HTTP/2 and HTTP/3) that are currently queued and are waiting to start.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_QUEUED_REQUESTS = "kestrel.queued_requests";
	/**
	* Number of connections rejected by the server.
	*
	* @note Connections are rejected when the currently active count exceeds the value configured with `MaxConcurrentConnections`.
	* Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_REJECTED_CONNECTIONS = "kestrel.rejected_connections";
	/**
	* The duration of TLS handshakes on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_TLS_HANDSHAKE_DURATION = "kestrel.tls_handshake.duration";
	/**
	* Number of connections that are currently upgraded (WebSockets). .
	*
	* @note The counter only tracks HTTP/1.1 connections.
	*
	* Meter name: `Microsoft.AspNetCore.Server.Kestrel`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_KESTREL_UPGRADED_CONNECTIONS = "kestrel.upgraded_connections";
	/**
	* Number of connections that are currently active on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = "signalr.server.active_connections";
	/**
	* The duration of connections on the server.
	*
	* @note Meter name: `Microsoft.AspNetCore.Http.Connections`; Added in: ASP.NET Core 8.0
	*/
	exports.METRIC_SIGNALR_SERVER_CONNECTION_DURATION = "signalr.server.connection.duration";
}));
//#endregion
//#region node_modules/@opentelemetry/core/node_modules/@opentelemetry/semantic-conventions/build/src/index.js
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
	__exportStar(require_trace(), exports);
	__exportStar(require_resource(), exports);
	__exportStar(require_stable_attributes(), exports);
	__exportStar(require_stable_metrics(), exports);
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/node/sdk-info.js
var import_src$8, _a, SDK_INFO;
var init_sdk_info = __esmMin((() => {
	init_version();
	import_src$8 = require_src();
	SDK_INFO = (_a = {}, _a[import_src$8.SEMRESATTRS_TELEMETRY_SDK_NAME] = "opentelemetry", _a[import_src$8.SEMRESATTRS_PROCESS_RUNTIME_NAME] = "node", _a[import_src$8.SEMRESATTRS_TELEMETRY_SDK_LANGUAGE] = import_src$8.TELEMETRYSDKLANGUAGEVALUES_NODEJS, _a[import_src$8.SEMRESATTRS_TELEMETRY_SDK_VERSION] = VERSION$1, _a);
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/node/timer-util.js
function unrefTimer(timer) {
	timer.unref();
}
var init_timer_util = __esmMin((() => {}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/node/index.js
var init_node = __esmMin((() => {
	init_environment();
	init_globalThis();
	init_hex_to_base64();
	init_RandomIdGenerator();
	init_performance();
	init_sdk_info();
	init_timer_util();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/platform/index.js
var init_platform = __esmMin((() => {
	init_node();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/common/time.js
/**
* Converts a number of milliseconds from epoch to HrTime([seconds, remainder in nanoseconds]).
* @param epochMillis
*/
function millisToHrTime(epochMillis) {
	var epochSeconds = epochMillis / 1e3;
	return [Math.trunc(epochSeconds), Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS)];
}
function getTimeOrigin() {
	var timeOrigin = otperformance.timeOrigin;
	if (typeof timeOrigin !== "number") {
		var perf = otperformance;
		timeOrigin = perf.timing && perf.timing.fetchStart;
	}
	return timeOrigin;
}
/**
* Returns an hrtime calculated via performance component.
* @param performanceNow
*/
function hrTime(performanceNow) {
	return addHrTimes(millisToHrTime(getTimeOrigin()), millisToHrTime(typeof performanceNow === "number" ? performanceNow : otperformance.now()));
}
/**
*
* Converts a TimeInput to an HrTime, defaults to _hrtime().
* @param time
*/
function timeInputToHrTime(time) {
	if (isTimeInputHrTime(time)) return time;
	else if (typeof time === "number") if (time < getTimeOrigin()) return hrTime(time);
	else return millisToHrTime(time);
	else if (time instanceof Date) return millisToHrTime(time.getTime());
	else throw TypeError("Invalid input type");
}
/**
* Returns a duration of two hrTime.
* @param startTime
* @param endTime
*/
function hrTimeDuration(startTime, endTime) {
	var seconds = endTime[0] - startTime[0];
	var nanos = endTime[1] - startTime[1];
	if (nanos < 0) {
		seconds -= 1;
		nanos += SECOND_TO_NANOSECONDS;
	}
	return [seconds, nanos];
}
/**
* Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
* @param time
*/
function hrTimeToTimeStamp(time) {
	var precision = NANOSECOND_DIGITS;
	var tmp = "" + "0".repeat(precision) + time[1] + "Z";
	var nanoString = tmp.substring(tmp.length - precision - 1);
	return (/* @__PURE__ */ new Date(time[0] * 1e3)).toISOString().replace("000Z", nanoString);
}
/**
* Convert hrTime to nanoseconds.
* @param time
*/
function hrTimeToNanoseconds(time) {
	return time[0] * SECOND_TO_NANOSECONDS + time[1];
}
/**
* Convert hrTime to milliseconds.
* @param time
*/
function hrTimeToMilliseconds(time) {
	return time[0] * 1e3 + time[1] / 1e6;
}
/**
* Convert hrTime to microseconds.
* @param time
*/
function hrTimeToMicroseconds(time) {
	return time[0] * 1e6 + time[1] / 1e3;
}
/**
* check if time is HrTime
* @param value
*/
function isTimeInputHrTime(value) {
	return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}
/**
* check if input value is a correct types.TimeInput
* @param value
*/
function isTimeInput(value) {
	return isTimeInputHrTime(value) || typeof value === "number" || value instanceof Date;
}
/**
* Given 2 HrTime formatted times, return their sum as an HrTime.
*/
function addHrTimes(time1, time2) {
	var out = [time1[0] + time2[0], time1[1] + time2[1]];
	if (out[1] >= SECOND_TO_NANOSECONDS) {
		out[1] -= SECOND_TO_NANOSECONDS;
		out[0] += 1;
	}
	return out;
}
var NANOSECOND_DIGITS, MILLISECONDS_TO_NANOSECONDS, SECOND_TO_NANOSECONDS;
var init_time = __esmMin((() => {
	init_platform();
	NANOSECOND_DIGITS = 9;
	MILLISECONDS_TO_NANOSECONDS = Math.pow(10, 6);
	SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/ExportResult.js
var ExportResultCode;
var init_ExportResult = __esmMin((() => {
	(function(ExportResultCode) {
		ExportResultCode[ExportResultCode["SUCCESS"] = 0] = "SUCCESS";
		ExportResultCode[ExportResultCode["FAILED"] = 1] = "FAILED";
	})(ExportResultCode || (ExportResultCode = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/propagation/composite.js
var import_src$7, __values$1, CompositePropagator;
var init_composite = __esmMin((() => {
	import_src$7 = /* @__PURE__ */ __toESM(require_src$1());
	__values$1 = function(o) {
		var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
		if (m) return m.call(o);
		if (o && typeof o.length === "number") return { next: function() {
			if (o && i >= o.length) o = void 0;
			return {
				value: o && o[i++],
				done: !o
			};
		} };
		throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	};
	CompositePropagator = function() {
		/**
		* Construct a composite propagator from a list of propagators.
		*
		* @param [config] Configuration object for composite propagator
		*/
		function CompositePropagator(config) {
			if (config === void 0) config = {};
			var _a;
			this._propagators = (_a = config.propagators) !== null && _a !== void 0 ? _a : [];
			this._fields = Array.from(new Set(this._propagators.map(function(p) {
				return typeof p.fields === "function" ? p.fields() : [];
			}).reduce(function(x, y) {
				return x.concat(y);
			}, [])));
		}
		/**
		* Run each of the configured propagators with the given context and carrier.
		* Propagators are run in the order they are configured, so if multiple
		* propagators write the same carrier key, the propagator later in the list
		* will "win".
		*
		* @param context Context to inject
		* @param carrier Carrier into which context will be injected
		*/
		CompositePropagator.prototype.inject = function(context, carrier, setter) {
			var e_1, _a;
			try {
				for (var _b = __values$1(this._propagators), _c = _b.next(); !_c.done; _c = _b.next()) {
					var propagator = _c.value;
					try {
						propagator.inject(context, carrier, setter);
					} catch (err) {
						import_src$7.diag.warn("Failed to inject with " + propagator.constructor.name + ". Err: " + err.message);
					}
				}
			} catch (e_1_1) {
				e_1 = { error: e_1_1 };
			} finally {
				try {
					if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
				} finally {
					if (e_1) throw e_1.error;
				}
			}
		};
		/**
		* Run each of the configured propagators with the given context and carrier.
		* Propagators are run in the order they are configured, so if multiple
		* propagators write the same context key, the propagator later in the list
		* will "win".
		*
		* @param context Context to add values to
		* @param carrier Carrier from which to extract context
		*/
		CompositePropagator.prototype.extract = function(context, carrier, getter) {
			return this._propagators.reduce(function(ctx, propagator) {
				try {
					return propagator.extract(ctx, carrier, getter);
				} catch (err) {
					import_src$7.diag.warn("Failed to extract with " + propagator.constructor.name + ". Err: " + err.message);
				}
				return ctx;
			}, context);
		};
		CompositePropagator.prototype.fields = function() {
			return this._fields.slice();
		};
		return CompositePropagator;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/internal/validators.js
/**
* Key is opaque string up to 256 characters printable. It MUST begin with a
* lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
* underscores _, dashes -, asterisks *, and forward slashes /.
* For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
* vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
* see https://www.w3.org/TR/trace-context/#key
*/
function validateKey(key) {
	return VALID_KEY_REGEX.test(key);
}
/**
* Value is opaque string up to 256 characters printable ASCII RFC0020
* characters (i.e., the range 0x20 to 0x7E) except comma , and =.
*/
function validateValue(value) {
	return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
}
var VALID_KEY_CHAR_RANGE, VALID_KEY, VALID_VENDOR_KEY, VALID_KEY_REGEX, VALID_VALUE_BASE_REGEX, INVALID_VALUE_COMMA_EQUAL_REGEX;
var init_validators = __esmMin((() => {
	VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
	VALID_KEY = "[a-z]" + VALID_KEY_CHAR_RANGE + "{0,255}";
	VALID_VENDOR_KEY = "[a-z0-9]" + VALID_KEY_CHAR_RANGE + "{0,240}@[a-z]" + VALID_KEY_CHAR_RANGE + "{0,13}";
	VALID_KEY_REGEX = new RegExp("^(?:" + VALID_KEY + "|" + VALID_VENDOR_KEY + ")$");
	VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
	INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/trace/TraceState.js
var MAX_TRACE_STATE_ITEMS, MAX_TRACE_STATE_LEN, LIST_MEMBERS_SEPARATOR, LIST_MEMBER_KEY_VALUE_SPLITTER, TraceState;
var init_TraceState = __esmMin((() => {
	init_validators();
	MAX_TRACE_STATE_ITEMS = 32;
	MAX_TRACE_STATE_LEN = 512;
	LIST_MEMBERS_SEPARATOR = ",";
	LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
	TraceState = function() {
		function TraceState(rawTraceState) {
			this._internalState = /* @__PURE__ */ new Map();
			if (rawTraceState) this._parse(rawTraceState);
		}
		TraceState.prototype.set = function(key, value) {
			var traceState = this._clone();
			if (traceState._internalState.has(key)) traceState._internalState.delete(key);
			traceState._internalState.set(key, value);
			return traceState;
		};
		TraceState.prototype.unset = function(key) {
			var traceState = this._clone();
			traceState._internalState.delete(key);
			return traceState;
		};
		TraceState.prototype.get = function(key) {
			return this._internalState.get(key);
		};
		TraceState.prototype.serialize = function() {
			var _this = this;
			return this._keys().reduce(function(agg, key) {
				agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + _this.get(key));
				return agg;
			}, []).join(LIST_MEMBERS_SEPARATOR);
		};
		TraceState.prototype._parse = function(rawTraceState) {
			if (rawTraceState.length > MAX_TRACE_STATE_LEN) return;
			this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reverse().reduce(function(agg, part) {
				var listMember = part.trim();
				var i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
				if (i !== -1) {
					var key = listMember.slice(0, i);
					var value = listMember.slice(i + 1, part.length);
					if (validateKey(key) && validateValue(value)) agg.set(key, value);
				}
				return agg;
			}, /* @__PURE__ */ new Map());
			if (this._internalState.size > MAX_TRACE_STATE_ITEMS) this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
		};
		TraceState.prototype._keys = function() {
			return Array.from(this._internalState.keys()).reverse();
		};
		TraceState.prototype._clone = function() {
			var traceState = new TraceState();
			traceState._internalState = new Map(this._internalState);
			return traceState;
		};
		return TraceState;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/trace/W3CTraceContextPropagator.js
/**
* Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
* @param traceParent - A meta property that comes from server.
*     It should be dynamically generated server side to have the server's request trace Id,
*     a parent span Id that was set on the server's request span,
*     and the trace flags to indicate the server's sampling decision
*     (01 = sampled, 00 = not sampled).
*     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
*     For more information see {@link https://www.w3.org/TR/trace-context/}
*/
function parseTraceParent(traceParent) {
	var match = TRACE_PARENT_REGEX.exec(traceParent);
	if (!match) return null;
	if (match[1] === "00" && match[5]) return null;
	return {
		traceId: match[2],
		spanId: match[3],
		traceFlags: parseInt(match[4], 16)
	};
}
var import_src$6, TRACE_PARENT_HEADER, TRACE_STATE_HEADER, VERSION, TRACE_PARENT_REGEX, W3CTraceContextPropagator;
var init_W3CTraceContextPropagator = __esmMin((() => {
	import_src$6 = /* @__PURE__ */ __toESM(require_src$1());
	init_suppress_tracing();
	init_TraceState();
	TRACE_PARENT_HEADER = "traceparent";
	TRACE_STATE_HEADER = "tracestate";
	VERSION = "00";
	TRACE_PARENT_REGEX = /* @__PURE__ */ new RegExp("^\\s?((?!ff)[\\da-f]{2})-((?![0]{32})[\\da-f]{32})-((?![0]{16})[\\da-f]{16})-([\\da-f]{2})(-.*)?\\s?$");
	W3CTraceContextPropagator = function() {
		function W3CTraceContextPropagator() {}
		W3CTraceContextPropagator.prototype.inject = function(context, carrier, setter) {
			var spanContext = import_src$6.trace.getSpanContext(context);
			if (!spanContext || isTracingSuppressed(context) || !(0, import_src$6.isSpanContextValid)(spanContext)) return;
			var traceParent = VERSION + "-" + spanContext.traceId + "-" + spanContext.spanId + "-0" + Number(spanContext.traceFlags || import_src$6.TraceFlags.NONE).toString(16);
			setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
			if (spanContext.traceState) setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
		};
		W3CTraceContextPropagator.prototype.extract = function(context, carrier, getter) {
			var traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER);
			if (!traceParentHeader) return context;
			var traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
			if (typeof traceParent !== "string") return context;
			var spanContext = parseTraceParent(traceParent);
			if (!spanContext) return context;
			spanContext.isRemote = true;
			var traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
			if (traceStateHeader) {
				var state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
				spanContext.traceState = new TraceState(typeof state === "string" ? state : void 0);
			}
			return import_src$6.trace.setSpanContext(context, spanContext);
		};
		W3CTraceContextPropagator.prototype.fields = function() {
			return [TRACE_PARENT_HEADER, TRACE_STATE_HEADER];
		};
		return W3CTraceContextPropagator;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/trace/rpc-metadata.js
function setRPCMetadata(context, meta) {
	return context.setValue(RPC_METADATA_KEY, meta);
}
function deleteRPCMetadata(context) {
	return context.deleteValue(RPC_METADATA_KEY);
}
function getRPCMetadata(context) {
	return context.getValue(RPC_METADATA_KEY);
}
var import_src$5, RPC_METADATA_KEY, RPCType;
var init_rpc_metadata = __esmMin((() => {
	import_src$5 = /* @__PURE__ */ __toESM(require_src$1());
	RPC_METADATA_KEY = (0, import_src$5.createContextKey)("OpenTelemetry SDK Context Key RPC_METADATA");
	(function(RPCType) {
		RPCType["HTTP"] = "http";
	})(RPCType || (RPCType = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/trace/sampler/AlwaysOffSampler.js
var import_src$4, AlwaysOffSampler;
var init_AlwaysOffSampler = __esmMin((() => {
	import_src$4 = /* @__PURE__ */ __toESM(require_src$1());
	AlwaysOffSampler = function() {
		function AlwaysOffSampler() {}
		AlwaysOffSampler.prototype.shouldSample = function() {
			return { decision: import_src$4.SamplingDecision.NOT_RECORD };
		};
		AlwaysOffSampler.prototype.toString = function() {
			return "AlwaysOffSampler";
		};
		return AlwaysOffSampler;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/trace/sampler/AlwaysOnSampler.js
var import_src$3, AlwaysOnSampler;
var init_AlwaysOnSampler = __esmMin((() => {
	import_src$3 = /* @__PURE__ */ __toESM(require_src$1());
	AlwaysOnSampler = function() {
		function AlwaysOnSampler() {}
		AlwaysOnSampler.prototype.shouldSample = function() {
			return { decision: import_src$3.SamplingDecision.RECORD_AND_SAMPLED };
		};
		AlwaysOnSampler.prototype.toString = function() {
			return "AlwaysOnSampler";
		};
		return AlwaysOnSampler;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/trace/sampler/ParentBasedSampler.js
var import_src$2, ParentBasedSampler;
var init_ParentBasedSampler = __esmMin((() => {
	import_src$2 = /* @__PURE__ */ __toESM(require_src$1());
	init_global_error_handler();
	init_AlwaysOffSampler();
	init_AlwaysOnSampler();
	ParentBasedSampler = function() {
		function ParentBasedSampler(config) {
			var _a, _b, _c, _d;
			this._root = config.root;
			if (!this._root) {
				globalErrorHandler(/* @__PURE__ */ new Error("ParentBasedSampler must have a root sampler configured"));
				this._root = new AlwaysOnSampler();
			}
			this._remoteParentSampled = (_a = config.remoteParentSampled) !== null && _a !== void 0 ? _a : new AlwaysOnSampler();
			this._remoteParentNotSampled = (_b = config.remoteParentNotSampled) !== null && _b !== void 0 ? _b : new AlwaysOffSampler();
			this._localParentSampled = (_c = config.localParentSampled) !== null && _c !== void 0 ? _c : new AlwaysOnSampler();
			this._localParentNotSampled = (_d = config.localParentNotSampled) !== null && _d !== void 0 ? _d : new AlwaysOffSampler();
		}
		ParentBasedSampler.prototype.shouldSample = function(context, traceId, spanName, spanKind, attributes, links) {
			var parentContext = import_src$2.trace.getSpanContext(context);
			if (!parentContext || !(0, import_src$2.isSpanContextValid)(parentContext)) return this._root.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			if (parentContext.isRemote) {
				if (parentContext.traceFlags & import_src$2.TraceFlags.SAMPLED) return this._remoteParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
				return this._remoteParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			}
			if (parentContext.traceFlags & import_src$2.TraceFlags.SAMPLED) return this._localParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
			return this._localParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
		};
		ParentBasedSampler.prototype.toString = function() {
			return "ParentBased{root=" + this._root.toString() + ", remoteParentSampled=" + this._remoteParentSampled.toString() + ", remoteParentNotSampled=" + this._remoteParentNotSampled.toString() + ", localParentSampled=" + this._localParentSampled.toString() + ", localParentNotSampled=" + this._localParentNotSampled.toString() + "}";
		};
		return ParentBasedSampler;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/trace/sampler/TraceIdRatioBasedSampler.js
var import_src$1, TraceIdRatioBasedSampler;
var init_TraceIdRatioBasedSampler = __esmMin((() => {
	import_src$1 = /* @__PURE__ */ __toESM(require_src$1());
	TraceIdRatioBasedSampler = function() {
		function TraceIdRatioBasedSampler(_ratio) {
			if (_ratio === void 0) _ratio = 0;
			this._ratio = _ratio;
			this._ratio = this._normalize(_ratio);
			this._upperBound = Math.floor(this._ratio * 4294967295);
		}
		TraceIdRatioBasedSampler.prototype.shouldSample = function(context, traceId) {
			return { decision: (0, import_src$1.isValidTraceId)(traceId) && this._accumulate(traceId) < this._upperBound ? import_src$1.SamplingDecision.RECORD_AND_SAMPLED : import_src$1.SamplingDecision.NOT_RECORD };
		};
		TraceIdRatioBasedSampler.prototype.toString = function() {
			return "TraceIdRatioBased{" + this._ratio + "}";
		};
		TraceIdRatioBasedSampler.prototype._normalize = function(ratio) {
			if (typeof ratio !== "number" || isNaN(ratio)) return 0;
			return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
		};
		TraceIdRatioBasedSampler.prototype._accumulate = function(traceId) {
			var accumulation = 0;
			for (var i = 0; i < traceId.length / 8; i++) {
				var pos = i * 8;
				var part = parseInt(traceId.slice(pos, pos + 8), 16);
				accumulation = (accumulation ^ part) >>> 0;
			}
			return accumulation;
		};
		return TraceIdRatioBasedSampler;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/lodash.merge.js
/**
* Creates a unary function that invokes `func` with its argument transformed.
*
* @private
* @param {Function} func The function to wrap.
* @param {Function} transform The argument transform.
* @returns {Function} Returns the new function.
*/
function overArg(func, transform) {
	return function(arg) {
		return func(transform(arg));
	};
}
/**
* Checks if `value` is a plain object, that is, an object created by the
* `Object` constructor or one with a `[[Prototype]]` of `null`.
*
* @static
* @memberOf _
* @since 0.8.0
* @category Lang
* @param {*} value The value to check.
* @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
* @example
*
* function Foo() {
*   this.a = 1;
* }
*
* _.isPlainObject(new Foo);
* // => false
*
* _.isPlainObject([1, 2, 3]);
* // => false
*
* _.isPlainObject({ 'x': 0, 'y': 0 });
* // => true
*
* _.isPlainObject(Object.create(null));
* // => true
*/
function isPlainObject(value) {
	if (!isObjectLike(value) || baseGetTag(value) !== objectTag) return false;
	var proto = getPrototype(value);
	if (proto === null) return true;
	var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
	return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
}
/**
* Checks if `value` is object-like. A value is object-like if it's not `null`
* and has a `typeof` result of "object".
*
* @static
* @memberOf _
* @since 4.0.0
* @category Lang
* @param {*} value The value to check.
* @returns {boolean} Returns `true` if `value` is object-like, else `false`.
* @example
*
* _.isObjectLike({});
* // => true
*
* _.isObjectLike([1, 2, 3]);
* // => true
*
* _.isObjectLike(_.noop);
* // => false
*
* _.isObjectLike(null);
* // => false
*/
function isObjectLike(value) {
	return value != null && typeof value == "object";
}
/**
* The base implementation of `getTag` without fallbacks for buggy environments.
*
* @private
* @param {*} value The value to query.
* @returns {string} Returns the `toStringTag`.
*/
function baseGetTag(value) {
	if (value == null) return value === void 0 ? undefinedTag : nullTag;
	return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
/**
* A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
*
* @private
* @param {*} value The value to query.
* @returns {string} Returns the raw `toStringTag`.
*/
function getRawTag(value) {
	var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
	var unmasked = false;
	try {
		value[symToStringTag] = void 0;
		unmasked = true;
	} catch (e) {}
	var result = nativeObjectToString.call(value);
	if (unmasked) if (isOwn) value[symToStringTag] = tag;
	else delete value[symToStringTag];
	return result;
}
/**
* Converts `value` to a string using `Object.prototype.toString`.
*
* @private
* @param {*} value The value to convert.
* @returns {string} Returns the converted string.
*/
function objectToString(value) {
	return nativeObjectToString.call(value);
}
var objectTag, nullTag, undefinedTag, funcToString, objectCtorString, getPrototype, objectProto, hasOwnProperty, symToStringTag, nativeObjectToString;
var init_lodash_merge = __esmMin((() => {
	objectTag = "[object Object]";
	nullTag = "[object Null]";
	undefinedTag = "[object Undefined]";
	funcToString = Function.prototype.toString;
	objectCtorString = funcToString.call(Object);
	getPrototype = overArg(Object.getPrototypeOf, Object);
	objectProto = Object.prototype;
	hasOwnProperty = objectProto.hasOwnProperty;
	symToStringTag = Symbol ? Symbol.toStringTag : void 0;
	nativeObjectToString = objectProto.toString;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/merge.js
/**
* Merges objects together
* @param args - objects / values to be merged
*/
function merge() {
	var args = [];
	for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
	var result = args.shift();
	var objects = /* @__PURE__ */ new WeakMap();
	while (args.length > 0) result = mergeTwoObjects(result, args.shift(), 0, objects);
	return result;
}
function takeValue(value) {
	if (isArray(value)) return value.slice();
	return value;
}
/**
* Merges two objects
* @param one - first object
* @param two - second object
* @param level - current deep level
* @param objects - objects holder that has been already referenced - to prevent
* cyclic dependency
*/
function mergeTwoObjects(one, two, level, objects) {
	if (level === void 0) level = 0;
	var result;
	if (level > MAX_LEVEL) return;
	level++;
	if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) result = takeValue(two);
	else if (isArray(one)) {
		result = one.slice();
		if (isArray(two)) for (var i = 0, j = two.length; i < j; i++) result.push(takeValue(two[i]));
		else if (isObject(two)) {
			var keys = Object.keys(two);
			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];
				result[key] = takeValue(two[key]);
			}
		}
	} else if (isObject(one)) if (isObject(two)) {
		if (!shouldMerge(one, two)) return two;
		result = Object.assign({}, one);
		var keys = Object.keys(two);
		for (var i = 0, j = keys.length; i < j; i++) {
			var key = keys[i];
			var twoValue = two[key];
			if (isPrimitive(twoValue)) if (typeof twoValue === "undefined") delete result[key];
			else result[key] = twoValue;
			else {
				var obj1 = result[key];
				var obj2 = twoValue;
				if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) delete result[key];
				else {
					if (isObject(obj1) && isObject(obj2)) {
						var arr1 = objects.get(obj1) || [];
						var arr2 = objects.get(obj2) || [];
						arr1.push({
							obj: one,
							key
						});
						arr2.push({
							obj: two,
							key
						});
						objects.set(obj1, arr1);
						objects.set(obj2, arr2);
					}
					result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
				}
			}
		}
	} else result = two;
	return result;
}
/**
* Function to check if object has been already reference
* @param obj
* @param key
* @param objects
*/
function wasObjectReferenced(obj, key, objects) {
	var arr = objects.get(obj[key]) || [];
	for (var i = 0, j = arr.length; i < j; i++) {
		var info = arr[i];
		if (info.key === key && info.obj === obj) return true;
	}
	return false;
}
function isArray(value) {
	return Array.isArray(value);
}
function isFunction(value) {
	return typeof value === "function";
}
function isObject(value) {
	return !isPrimitive(value) && !isArray(value) && !isFunction(value) && typeof value === "object";
}
function isPrimitive(value) {
	return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
}
function shouldMerge(one, two) {
	if (!isPlainObject(one) || !isPlainObject(two)) return false;
	return true;
}
var MAX_LEVEL;
var init_merge = __esmMin((() => {
	init_lodash_merge();
	MAX_LEVEL = 20;
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/timeout.js
/**
* Adds a timeout to a promise and rejects if the specified timeout has elapsed. Also rejects if the specified promise
* rejects, and resolves if the specified promise resolves.
*
* <p> NOTE: this operation will continue even after it throws a {@link TimeoutError}.
*
* @param promise promise to use with timeout.
* @param timeout the timeout in milliseconds until the returned promise is rejected.
*/
function callWithTimeout(promise, timeout) {
	var timeoutHandle;
	var timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
		timeoutHandle = setTimeout(function timeoutHandler() {
			reject(new TimeoutError("Operation timed out."));
		}, timeout);
	});
	return Promise.race([promise, timeoutPromise]).then(function(result) {
		clearTimeout(timeoutHandle);
		return result;
	}, function(reason) {
		clearTimeout(timeoutHandle);
		throw reason;
	});
}
var __extends, TimeoutError;
var init_timeout = __esmMin((() => {
	__extends = (function() {
		var extendStatics = function(d, b) {
			extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
				d.__proto__ = b;
			} || function(d, b) {
				for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
			};
			return extendStatics(d, b);
		};
		return function(d, b) {
			if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
		};
	})();
	TimeoutError = function(_super) {
		__extends(TimeoutError, _super);
		function TimeoutError(message) {
			var _this = _super.call(this, message) || this;
			Object.setPrototypeOf(_this, TimeoutError.prototype);
			return _this;
		}
		return TimeoutError;
	}(Error);
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/url.js
function urlMatches(url, urlToMatch) {
	if (typeof urlToMatch === "string") return url === urlToMatch;
	else return !!url.match(urlToMatch);
}
/**
* Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
* @param url
* @param ignoredUrls
*/
function isUrlIgnored(url, ignoredUrls) {
	var e_1, _a;
	if (!ignoredUrls) return false;
	try {
		for (var ignoredUrls_1 = __values(ignoredUrls), ignoredUrls_1_1 = ignoredUrls_1.next(); !ignoredUrls_1_1.done; ignoredUrls_1_1 = ignoredUrls_1.next()) {
			var ignoreUrl = ignoredUrls_1_1.value;
			if (urlMatches(url, ignoreUrl)) return true;
		}
	} catch (e_1_1) {
		e_1 = { error: e_1_1 };
	} finally {
		try {
			if (ignoredUrls_1_1 && !ignoredUrls_1_1.done && (_a = ignoredUrls_1.return)) _a.call(ignoredUrls_1);
		} finally {
			if (e_1) throw e_1.error;
		}
	}
	return false;
}
var __values;
var init_url = __esmMin((() => {
	__values = function(o) {
		var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
		if (m) return m.call(o);
		if (o && typeof o.length === "number") return { next: function() {
			if (o && i >= o.length) o = void 0;
			return {
				value: o && o[i++],
				done: !o
			};
		} };
		throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	};
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/wrap.js
/**
* Checks if certain function has been already wrapped
* @param func
*/
function isWrapped(func) {
	return typeof func === "function" && typeof func.__original === "function" && typeof func.__unwrap === "function" && func.__wrapped === true;
}
var init_wrap = __esmMin((() => {}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/promise.js
var Deferred;
var init_promise = __esmMin((() => {
	Deferred = function() {
		function Deferred() {
			var _this = this;
			this._promise = new Promise(function(resolve, reject) {
				_this._resolve = resolve;
				_this._reject = reject;
			});
		}
		Object.defineProperty(Deferred.prototype, "promise", {
			get: function() {
				return this._promise;
			},
			enumerable: false,
			configurable: true
		});
		Deferred.prototype.resolve = function(val) {
			this._resolve(val);
		};
		Deferred.prototype.reject = function(err) {
			this._reject(err);
		};
		return Deferred;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/utils/callback.js
var __read, __spreadArray, BindOnceFuture;
var init_callback = __esmMin((() => {
	init_promise();
	__read = function(o, n) {
		var m = typeof Symbol === "function" && o[Symbol.iterator];
		if (!m) return o;
		var i = m.call(o), r, ar = [], e;
		try {
			while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
		} catch (error) {
			e = { error };
		} finally {
			try {
				if (r && !r.done && (m = i["return"])) m.call(i);
			} finally {
				if (e) throw e.error;
			}
		}
		return ar;
	};
	__spreadArray = function(to, from, pack) {
		if (pack || arguments.length === 2) {
			for (var i = 0, l = from.length, ar; i < l; i++) if (ar || !(i in from)) {
				if (!ar) ar = Array.prototype.slice.call(from, 0, i);
				ar[i] = from[i];
			}
		}
		return to.concat(ar || Array.prototype.slice.call(from));
	};
	BindOnceFuture = function() {
		function BindOnceFuture(_callback, _that) {
			this._callback = _callback;
			this._that = _that;
			this._isCalled = false;
			this._deferred = new Deferred();
		}
		Object.defineProperty(BindOnceFuture.prototype, "isCalled", {
			get: function() {
				return this._isCalled;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(BindOnceFuture.prototype, "promise", {
			get: function() {
				return this._deferred.promise;
			},
			enumerable: false,
			configurable: true
		});
		BindOnceFuture.prototype.call = function() {
			var _a;
			var _this = this;
			var args = [];
			for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
			if (!this._isCalled) {
				this._isCalled = true;
				try {
					Promise.resolve((_a = this._callback).call.apply(_a, __spreadArray([this._that], __read(args), false))).then(function(val) {
						return _this._deferred.resolve(val);
					}, function(err) {
						return _this._deferred.reject(err);
					});
				} catch (err) {
					this._deferred.reject(err);
				}
			}
			return this._deferred.promise;
		};
		return BindOnceFuture;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/internal/exporter.js
/**
* @internal
* Shared functionality used by Exporters while exporting data, including suppression of Traces.
*/
function _export(exporter, arg) {
	return new Promise(function(resolve) {
		import_src.context.with(suppressTracing(import_src.context.active()), function() {
			exporter.export(arg, function(result) {
				resolve(result);
			});
		});
	});
}
var import_src;
var init_exporter = __esmMin((() => {
	import_src = /* @__PURE__ */ __toESM(require_src$1());
	init_suppress_tracing();
}));
//#endregion
//#region node_modules/@opentelemetry/core/build/esm/index.js
var esm_exports = /* @__PURE__ */ __exportAll({
	AlwaysOffSampler: () => AlwaysOffSampler,
	AlwaysOnSampler: () => AlwaysOnSampler,
	AnchoredClock: () => AnchoredClock,
	BindOnceFuture: () => BindOnceFuture,
	CompositePropagator: () => CompositePropagator,
	DEFAULT_ATTRIBUTE_COUNT_LIMIT: () => 128,
	DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT: () => DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
	DEFAULT_ENVIRONMENT: () => DEFAULT_ENVIRONMENT,
	DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: () => 128,
	DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: () => 128,
	ExportResultCode: () => ExportResultCode,
	ParentBasedSampler: () => ParentBasedSampler,
	RPCType: () => RPCType,
	RandomIdGenerator: () => RandomIdGenerator,
	SDK_INFO: () => SDK_INFO,
	TRACE_PARENT_HEADER: () => TRACE_PARENT_HEADER,
	TRACE_STATE_HEADER: () => TRACE_STATE_HEADER,
	TimeoutError: () => TimeoutError,
	TraceIdRatioBasedSampler: () => TraceIdRatioBasedSampler,
	TraceState: () => TraceState,
	TracesSamplerValues: () => TracesSamplerValues,
	VERSION: () => VERSION$1,
	W3CBaggagePropagator: () => W3CBaggagePropagator,
	W3CTraceContextPropagator: () => W3CTraceContextPropagator,
	_globalThis: () => _globalThis,
	addHrTimes: () => addHrTimes,
	baggageUtils: () => baggageUtils,
	callWithTimeout: () => callWithTimeout,
	deleteRPCMetadata: () => deleteRPCMetadata,
	getEnv: () => getEnv,
	getEnvWithoutDefaults: () => getEnvWithoutDefaults,
	getRPCMetadata: () => getRPCMetadata,
	getTimeOrigin: () => getTimeOrigin,
	globalErrorHandler: () => globalErrorHandler,
	hexToBase64: () => hexToBase64,
	hexToBinary: () => hexToBinary,
	hrTime: () => hrTime,
	hrTimeDuration: () => hrTimeDuration,
	hrTimeToMicroseconds: () => hrTimeToMicroseconds,
	hrTimeToMilliseconds: () => hrTimeToMilliseconds,
	hrTimeToNanoseconds: () => hrTimeToNanoseconds,
	hrTimeToTimeStamp: () => hrTimeToTimeStamp,
	internal: () => internal,
	isAttributeKey: () => isAttributeKey,
	isAttributeValue: () => isAttributeValue,
	isTimeInput: () => isTimeInput,
	isTimeInputHrTime: () => isTimeInputHrTime,
	isTracingSuppressed: () => isTracingSuppressed,
	isUrlIgnored: () => isUrlIgnored,
	isWrapped: () => isWrapped,
	loggingErrorHandler: () => loggingErrorHandler,
	merge: () => merge,
	millisToHrTime: () => millisToHrTime,
	otperformance: () => otperformance,
	parseEnvironment: () => parseEnvironment,
	parseTraceParent: () => parseTraceParent,
	sanitizeAttributes: () => sanitizeAttributes,
	setGlobalErrorHandler: () => setGlobalErrorHandler,
	setRPCMetadata: () => setRPCMetadata,
	suppressTracing: () => suppressTracing,
	timeInputToHrTime: () => timeInputToHrTime,
	unrefTimer: () => unrefTimer,
	unsuppressTracing: () => unsuppressTracing,
	urlMatches: () => urlMatches
});
var baggageUtils, internal;
var init_esm = __esmMin((() => {
	init_W3CBaggagePropagator();
	init_anchored_clock();
	init_attributes();
	init_global_error_handler();
	init_logging_error_handler();
	init_time();
	init_hex_to_binary();
	init_ExportResult();
	init_utils();
	init_platform();
	init_composite();
	init_W3CTraceContextPropagator();
	init_rpc_metadata();
	init_AlwaysOffSampler();
	init_AlwaysOnSampler();
	init_ParentBasedSampler();
	init_TraceIdRatioBasedSampler();
	init_suppress_tracing();
	init_TraceState();
	init_environment$1();
	init_merge();
	init_sampling();
	init_timeout();
	init_url();
	init_wrap();
	init_callback();
	init_version();
	init_exporter();
	baggageUtils = {
		getKeyPairs,
		serializeKeyPairs,
		parseKeyPairsIntoRecord,
		parsePairKeyValue
	};
	internal = { _export };
}));
//#endregion
export { init_performance as A, init_global_error_handler as B, isTimeInput as C, unrefTimer as D, init_timer_util as E, DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT as F, init_W3CBaggagePropagator as G, isAttributeValue as H, init_environment$1 as I, suppressTracing as J, init_suppress_tracing as K, TracesSamplerValues as L, getEnv as M, getEnvWithoutDefaults as N, SDK_INFO as O, init_environment as P, init_sampling as R, init_time as S, millisToHrTime as T, sanitizeAttributes as U, init_attributes as V, W3CBaggagePropagator as W, init_ExportResult as _, init_merge as a, hrTime as b, getRPCMetadata as c, init_W3CTraceContextPropagator as d, TraceState as f, ExportResultCode as g, init_composite as h, init_callback as i, otperformance as j, init_sdk_info as k, init_rpc_metadata as l, CompositePropagator as m, init_esm as n, merge as o, init_TraceState as p, isTracingSuppressed as q, BindOnceFuture as r, RPCType as s, esm_exports as t, W3CTraceContextPropagator as u, addHrTimes as v, isTimeInputHrTime as w, hrTimeDuration as x, getTimeOrigin as y, globalErrorHandler as z };
