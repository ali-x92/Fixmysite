import { i as __require, o as __toESM, r as __exportAll, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src } from "../opentelemetry__api.mjs";
import { J as suppressTracing$1, W as W3CBaggagePropagator, c as getRPCMetadata, f as TraceState, n as init_esm, q as isTracingSuppressed, s as RPCType } from "../@opentelemetry/core+[...].mjs";
import { t as require_src$1 } from "../@opentelemetry/instrumentation-http+[...].mjs";
import { a as InstrumentationNodeModuleDefinition, d as safeExecuteInTheMiddle, n as init_esm$1, p as registerInstrumentations, r as InstrumentationNodeModuleFile, s as InstrumentationBase, u as isWrapped } from "../@opentelemetry/instrumentation+[...].mjs";
import { $ as generateSentryTraceHeader, A as setExtras, At as snipLine, B as logSpanStart, C as _INTERNAL_flushLogsBuffer, Ct as withScope, D as captureException, Dt as generateSpanId, E as captureEvent, Et as getDefaultIsolationScope, F as withActiveSpan$1, Ft as stackParserFromStackParserOptions, G as addChildSpanToSpan, H as getDynamicSamplingContextFromScope, I as sampleSpan, It as consoleSandbox, J as getRootSpan, K as convertSpanLinksForEnvelope, L as handleCallbackErrors, Lt as debug, M as startSession, Mt as truncate, N as startSpanManual$1, Nt as isError, O as captureMessage, Ot as parseSemver, P as suppressTracing$2, Pt as createStackParser, Q as spanToTraceContext, R as timedEventsToMeasurements, Rt as SDK_VERSION, S as ServerRuntimeClient, St as withIsolationScope, T as getIntegrationsToSetup, Tt as getDefaultCurrentScope, U as getDynamicSamplingContextFromSpan, V as serializeEnvelope, W as hasSpansEnabled, X as spanTimeInputToSeconds, Y as getStatusMessage, Z as spanToJSON, _ as httpRequestToRequestData, _t as SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, a as OPENAI_INTEGRATION_NAME, at as objectToBaggageHeader, b as applySdkMetadata, bt as getIsolationScope, c as parseUrl, ct as setCapturedScopesOnSpan, d as dirname$1, dt as SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, et as propagationContextFromHeaders, f as requestDataIntegration, ft as SEMANTIC_ATTRIBUTE_CACHE_KEY, g as addBreadcrumb, gt as SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, h as functionToStringIntegration, ht as SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, i as instrumentOpenAiClient, it as dynamicSamplingContextToSentryBaggageHeader, j as setTags, jt as stringMatchesSomePattern, k as endSession, kt as addNonEnumerableProperty, l as stripUrlQueryAndFragment, lt as getSpanStatusFromHttpCode, m as inboundFiltersIntegration, mt as SEMANTIC_ATTRIBUTE_SENTRY_OP, n as nodeStackLineParser, nt as SENTRY_BAGGAGE_KEY_PREFIX, o as addVercelAiProcessors, ot as parseBaggageHeader, p as linkedErrorsIntegration, pt as SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME, q as getActiveSpan$1, r as getBreadcrumbLogLevelFromHttpStatusCode, rt as baggageHeaderToDynamicSamplingContext, s as getSanitizedUrlString, st as getCapturedScopesOnSpan, t as LRUMap, tt as parseSampleRate, u as consoleIntegration, ut as SEMANTIC_ATTRIBUTE_CACHE_HIT, v as debounce, vt as getClient, w as defineIntegration, wt as setAsyncContextStrategy, x as createTransport, xt as getTraceContextFromScope, y as getTraceData$1, yt as getCurrentScope, z as logSpanEnd, zt as GLOBAL_OBJ } from "../sentry__core.mjs";
import { n as require_src$2, t as require_src$3 } from "../@opentelemetry/instrumentation-amqplib+[...].mjs";
import { n as SamplingDecision, t as BasicTracerProvider } from "../@opentelemetry/sdk-trace-base+[...].mjs";
import { t as Resource } from "../@opentelemetry/resources+[...].mjs";
import { t as require_src$4 } from "../@opentelemetry/context-async-hooks+[...].mjs";
import { t as require_src$5 } from "../@opentelemetry/instrumentation-undici+[...].mjs";
import { t as require_src$6 } from "../@opentelemetry/instrumentation-express+[...].mjs";
import { t as require_src$7 } from "../@opentelemetry/instrumentation-graphql+[...].mjs";
import { t as require_src$8 } from "../@opentelemetry/instrumentation-kafkajs+[...].mjs";
import { t as require_src$9 } from "../@opentelemetry/instrumentation-lru-memoizer+[...].mjs";
import { t as require_src$10 } from "../@opentelemetry/instrumentation-mongodb+[...].mjs";
import { t as require_src$11 } from "../@opentelemetry/instrumentation-mongoose+[...].mjs";
import { t as require_src$12 } from "../@opentelemetry/instrumentation-mysql+[...].mjs";
import { t as require_src$13 } from "../@opentelemetry/instrumentation-mysql2+[...].mjs";
import { t as require_src$14 } from "../@opentelemetry/instrumentation-ioredis+[...].mjs";
import { t as require_src$15 } from "../@opentelemetry/instrumentation-redis-4+[...].mjs";
import { t as require_src$16 } from "../@opentelemetry/instrumentation-pg+[...].mjs";
import { t as PrismaInstrumentation } from "../prisma__instrumentation.mjs";
import { t as require_src$17 } from "../@opentelemetry/instrumentation-hapi+[...].mjs";
import { t as require_src$18 } from "../@opentelemetry/instrumentation-koa+[...].mjs";
import { t as require_src$19 } from "../@opentelemetry/instrumentation-connect+[...].mjs";
import { t as require_src$20 } from "../@opentelemetry/instrumentation-tedious+[...].mjs";
import { t as require_src$21 } from "../@opentelemetry/instrumentation-generic-pool+[...].mjs";
import * as http from "node:http";
import { Readable } from "node:stream";
import * as https from "node:https";
import { dirname, join, posix, sep } from "node:path";
import { createAddHookMessageChannel } from "import-in-the-middle";
import * as util from "node:util";
import { promisify } from "node:util";
import * as diagnosticsChannel from "node:diagnostics_channel";
import dc__default, { subscribe, unsubscribe } from "node:diagnostics_channel";
import * as diagch from "diagnostics_channel";
import { execFile } from "node:child_process";
import { createReadStream, existsSync, readFile, readFileSync, readdir } from "node:fs";
import * as os from "node:os";
import { createInterface } from "node:readline";
import { Worker } from "node:worker_threads";
import { createGzip } from "node:zlib";
import * as net from "node:net";
import * as tls from "node:tls";
import { isMainThread, threadId } from "worker_threads";
import moduleModule from "module";
//#region node_modules/@sentry/node-core/build/esm/otel/instrument.js
var import_src$21 = /* @__PURE__ */ __toESM(require_src());
init_esm();
init_esm$1();
/** Exported only for tests. */
var INSTRUMENTED = {};
/**
* Instrument an OpenTelemetry instrumentation once.
* This will skip running instrumentation again if it was already instrumented.
*/
function generateInstrumentOnce(name, creatorOrClass, optionsCallback) {
	if (optionsCallback) return _generateInstrumentOnceWithOptions(name, creatorOrClass, optionsCallback);
	return _generateInstrumentOnce(name, creatorOrClass);
}
function _generateInstrumentOnce(name, creator) {
	return Object.assign((options) => {
		const instrumented = INSTRUMENTED[name];
		if (instrumented) {
			if (options) instrumented.setConfig(options);
			return instrumented;
		}
		const instrumentation = creator(options);
		INSTRUMENTED[name] = instrumentation;
		registerInstrumentations({ instrumentations: [instrumentation] });
		return instrumentation;
	}, { id: name });
}
function _generateInstrumentOnceWithOptions(name, instrumentationClass, optionsCallback) {
	return Object.assign((_options) => {
		const options = optionsCallback(_options);
		const instrumented = INSTRUMENTED[name];
		if (instrumented) {
			instrumented.setConfig(options);
			return instrumented;
		}
		const instrumentation = new instrumentationClass(options);
		INSTRUMENTED[name] = instrumentation;
		registerInstrumentations({ instrumentations: [instrumentation] });
		return instrumentation;
	}, { id: name });
}
/**
* Ensure a given callback is called when the instrumentation is actually wrapping something.
* This can be used to ensure some logic is only called when the instrumentation is actually active.
*
* This function returns a function that can be invoked with a callback.
* This callback will either be invoked immediately
* (e.g. if the instrumentation was already wrapped, or if _wrap could not be patched),
* or once the instrumentation is actually wrapping something.
*
* Make sure to call this function right after adding the instrumentation, otherwise it may be too late!
* The returned callback can be used any time, and also multiple times.
*/
function instrumentWhenWrapped(instrumentation) {
	let isWrapped = false;
	let callbacks = [];
	if (!hasWrap(instrumentation)) isWrapped = true;
	else {
		const originalWrap = instrumentation["_wrap"];
		instrumentation["_wrap"] = (...args) => {
			isWrapped = true;
			callbacks.forEach((callback) => callback());
			callbacks = [];
			return originalWrap(...args);
		};
	}
	const registerCallback = (callback) => {
		if (isWrapped) callback();
		else callbacks.push(callback);
	};
	return registerCallback;
}
function hasWrap(instrumentation) {
	return typeof instrumentation["_wrap"] === "function";
}
//#endregion
//#region node_modules/@sentry/opentelemetry/build/esm/index.js
var import_src$20 = require_src$2();
/** If this attribute is true, it means that the parent is a remote span. */
var SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE = "sentry.parentIsRemote";
var SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION = "sentry.graphql.operation";
/**
* Get the parent span id from a span.
* In OTel v1, the parent span id is accessed as `parentSpanId`
* In OTel v2, the parent span id is accessed as `spanId` on the `parentSpanContext`
*/
function getParentSpanId(span) {
	if ("parentSpanId" in span) return span.parentSpanId;
	else if ("parentSpanContext" in span) return span.parentSpanContext?.spanId;
}
/**
* Check if a given span has attributes.
* This is necessary because the base `Span` type does not have attributes,
* so in places where we are passed a generic span, we need to check if we want to access them.
*/
function spanHasAttributes(span) {
	const castSpan = span;
	return !!castSpan.attributes && typeof castSpan.attributes === "object";
}
/**
* Check if a given span has a kind.
* This is necessary because the base `Span` type does not have a kind,
* so in places where we are passed a generic span, we need to check if we want to access it.
*/
function spanHasKind(span) {
	return typeof span.kind === "number";
}
/**
* Check if a given span has a status.
* This is necessary because the base `Span` type does not have a status,
* so in places where we are passed a generic span, we need to check if we want to access it.
*/
function spanHasStatus(span) {
	return !!span.status;
}
/**
* Check if a given span has a name.
* This is necessary because the base `Span` type does not have a name,
* so in places where we are passed a generic span, we need to check if we want to access it.
*/
function spanHasName(span) {
	return !!span.name;
}
/**
* Get sanitizied request data from an OTEL span.
*/
function getRequestSpanData(span) {
	if (!spanHasAttributes(span)) return {};
	const maybeUrlAttribute = span.attributes[import_src$20.ATTR_URL_FULL] || span.attributes[import_src$20.SEMATTRS_HTTP_URL];
	const data = {
		url: maybeUrlAttribute,
		"http.method": span.attributes[import_src$20.ATTR_HTTP_REQUEST_METHOD] || span.attributes[import_src$20.SEMATTRS_HTTP_METHOD]
	};
	if (!data["http.method"] && data.url) data["http.method"] = "GET";
	try {
		if (typeof maybeUrlAttribute === "string") {
			const url = parseUrl(maybeUrlAttribute);
			data.url = getSanitizedUrlString(url);
			if (url.search) data["http.query"] = url.search;
			if (url.hash) data["http.fragment"] = url.hash;
		}
	} catch {}
	return data;
}
/**
* Get the span kind from a span.
* For whatever reason, this is not public API on the generic "Span" type,
* so we need to check if we actually have a `SDKTraceBaseSpan` where we can fetch this from.
* Otherwise, we fall back to `SpanKind.INTERNAL`.
*/
function getSpanKind(span) {
	if (spanHasKind(span)) return span.kind;
	return import_src$21.SpanKind.INTERNAL;
}
var SENTRY_TRACE_HEADER$1 = "sentry-trace";
var SENTRY_BAGGAGE_HEADER$1 = "baggage";
var SENTRY_TRACE_STATE_DSC = "sentry.dsc";
var SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING = "sentry.sampled_not_recording";
var SENTRY_TRACE_STATE_URL = "sentry.url";
var SENTRY_TRACE_STATE_SAMPLE_RAND = "sentry.sample_rand";
var SENTRY_TRACE_STATE_SAMPLE_RATE = "sentry.sample_rate";
var SENTRY_SCOPES_CONTEXT_KEY = (0, import_src$21.createContextKey)("sentry_scopes");
var SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY = (0, import_src$21.createContextKey)("sentry_fork_isolation_scope");
var SENTRY_FORK_SET_SCOPE_CONTEXT_KEY = (0, import_src$21.createContextKey)("sentry_fork_set_scope");
var SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY = (0, import_src$21.createContextKey)("sentry_fork_set_isolation_scope");
var SCOPE_CONTEXT_FIELD = "_scopeContext";
/**
* Try to get the current scopes from the given OTEL context.
* This requires a Context Manager that was wrapped with getWrappedContextManager.
*/
function getScopesFromContext(context) {
	return context.getValue(SENTRY_SCOPES_CONTEXT_KEY);
}
/**
* Set the current scopes on an OTEL context.
* This will return a forked context with the Propagation Context set.
*/
function setScopesOnContext(context, scopes) {
	return context.setValue(SENTRY_SCOPES_CONTEXT_KEY, scopes);
}
/**
* Set the context on the scope so we can later look it up.
* We need this to get the context from the scope in the `trace` functions.
*/
function setContextOnScope(scope, context) {
	addNonEnumerableProperty(scope, SCOPE_CONTEXT_FIELD, context);
}
/**
* Get the context related to a scope.
*/
function getContextFromScope(scope) {
	return scope[SCOPE_CONTEXT_FIELD];
}
/**
* OpenTelemetry only knows about SAMPLED or NONE decision,
* but for us it is important to differentiate between unset and unsampled.
*
* Both of these are identified as `traceFlags === TracegFlags.NONE`,
* but we additionally look at a special trace state to differentiate between them.
*/
function getSamplingDecision(spanContext) {
	const { traceFlags, traceState } = spanContext;
	const sampledNotRecording = traceState ? traceState.get(SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING) === "1" : false;
	if (traceFlags === import_src$21.TraceFlags.SAMPLED) return true;
	if (sampledNotRecording) return false;
	const dscString = traceState ? traceState.get(SENTRY_TRACE_STATE_DSC) : void 0;
	const dsc = dscString ? baggageHeaderToDynamicSamplingContext(dscString) : void 0;
	if (dsc?.sampled === "true") return true;
	if (dsc?.sampled === "false") return false;
}
/**
* Infer the op & description for a set of name, attributes and kind of a span.
*/
function inferSpanData(spanName, attributes, kind) {
	const httpMethod = attributes[import_src$20.ATTR_HTTP_REQUEST_METHOD] || attributes[import_src$20.SEMATTRS_HTTP_METHOD];
	if (httpMethod) return descriptionForHttpMethod({
		attributes,
		name: spanName,
		kind
	}, httpMethod);
	const dbSystem = attributes[import_src$20.SEMATTRS_DB_SYSTEM];
	const opIsCache = typeof attributes["sentry.op"] === "string" && attributes["sentry.op"].startsWith("cache.");
	if (dbSystem && !opIsCache) return descriptionForDbSystem({
		attributes,
		name: spanName
	});
	const customSourceOrRoute = attributes["sentry.source"] === "custom" ? "custom" : "route";
	if (attributes[import_src$20.SEMATTRS_RPC_SERVICE]) return {
		...getUserUpdatedNameAndSource(spanName, attributes, "route"),
		op: "rpc"
	};
	if (attributes[import_src$20.SEMATTRS_MESSAGING_SYSTEM]) return {
		...getUserUpdatedNameAndSource(spanName, attributes, customSourceOrRoute),
		op: "message"
	};
	const faasTrigger = attributes[import_src$20.SEMATTRS_FAAS_TRIGGER];
	if (faasTrigger) return {
		...getUserUpdatedNameAndSource(spanName, attributes, customSourceOrRoute),
		op: faasTrigger.toString()
	};
	return {
		op: void 0,
		description: spanName,
		source: "custom"
	};
}
/**
* Extract better op/description from an otel span.
*
* Does not overwrite the span name if the source is already set to custom to ensure
* that user-updated span names are preserved. In this case, we only adjust the op but
* leave span description and source unchanged.
*
* Based on https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/7422ce2a06337f68a59b552b8c5a2ac125d6bae5/exporter/sentryexporter/sentry_exporter.go#L306
*/
function parseSpanDescription(span) {
	const attributes = spanHasAttributes(span) ? span.attributes : {};
	return inferSpanData(spanHasName(span) ? span.name : "<unknown>", attributes, getSpanKind(span));
}
function descriptionForDbSystem({ attributes, name }) {
	const userDefinedName = attributes[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
	if (typeof userDefinedName === "string") return {
		op: "db",
		description: userDefinedName,
		source: attributes["sentry.source"] || "custom"
	};
	if (attributes["sentry.source"] === "custom") return {
		op: "db",
		description: name,
		source: "custom"
	};
	const statement = attributes[import_src$20.SEMATTRS_DB_STATEMENT];
	return {
		op: "db",
		description: statement ? statement.toString() : name,
		source: "task"
	};
}
/** Only exported for tests. */
function descriptionForHttpMethod({ name, kind, attributes }, httpMethod) {
	const opParts = ["http"];
	switch (kind) {
		case import_src$21.SpanKind.CLIENT:
			opParts.push("client");
			break;
		case import_src$21.SpanKind.SERVER:
			opParts.push("server");
			break;
	}
	if (attributes["sentry.http.prefetch"]) opParts.push("prefetch");
	const { urlPath, url, query, fragment, hasRoute } = getSanitizedUrl(attributes, kind);
	if (!urlPath) return {
		...getUserUpdatedNameAndSource(name, attributes),
		op: opParts.join(".")
	};
	const graphqlOperationsAttribute = attributes[SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION];
	const baseDescription = `${httpMethod} ${urlPath}`;
	const inferredDescription = graphqlOperationsAttribute ? `${baseDescription} (${getGraphqlOperationNamesFromAttribute$1(graphqlOperationsAttribute)})` : baseDescription;
	const inferredSource = hasRoute || urlPath === "/" ? "route" : "url";
	const data = {};
	if (url) data.url = url;
	if (query) data["http.query"] = query;
	if (fragment) data["http.fragment"] = fragment;
	const isClientOrServerKind = kind === import_src$21.SpanKind.CLIENT || kind === import_src$21.SpanKind.SERVER;
	const isManualSpan = !`${attributes["sentry.origin"] || "manual"}`.startsWith("auto");
	const alreadyHasCustomSource = attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] === "custom";
	const customSpanName = attributes[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
	const { description, source } = !alreadyHasCustomSource && customSpanName == null && (isClientOrServerKind || !isManualSpan) ? {
		description: inferredDescription,
		source: inferredSource
	} : getUserUpdatedNameAndSource(name, attributes);
	return {
		op: opParts.join("."),
		description,
		source,
		data
	};
}
function getGraphqlOperationNamesFromAttribute$1(attr) {
	if (Array.isArray(attr)) {
		const sorted = attr.slice().sort();
		if (sorted.length <= 5) return sorted.join(", ");
		else return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
	}
	return `${attr}`;
}
/** Exported for tests only */
function getSanitizedUrl(attributes, kind) {
	const httpTarget = attributes[import_src$20.SEMATTRS_HTTP_TARGET];
	const httpUrl = attributes[import_src$20.SEMATTRS_HTTP_URL] || attributes[import_src$20.ATTR_URL_FULL];
	const httpRoute = attributes[import_src$20.ATTR_HTTP_ROUTE];
	const parsedUrl = typeof httpUrl === "string" ? parseUrl(httpUrl) : void 0;
	const url = parsedUrl ? getSanitizedUrlString(parsedUrl) : void 0;
	const query = parsedUrl?.search || void 0;
	const fragment = parsedUrl?.hash || void 0;
	if (typeof httpRoute === "string") return {
		urlPath: httpRoute,
		url,
		query,
		fragment,
		hasRoute: true
	};
	if (kind === import_src$21.SpanKind.SERVER && typeof httpTarget === "string") return {
		urlPath: stripUrlQueryAndFragment(httpTarget),
		url,
		query,
		fragment,
		hasRoute: false
	};
	if (parsedUrl) return {
		urlPath: url,
		url,
		query,
		fragment,
		hasRoute: false
	};
	if (typeof httpTarget === "string") return {
		urlPath: stripUrlQueryAndFragment(httpTarget),
		url,
		query,
		fragment,
		hasRoute: false
	};
	return {
		urlPath: void 0,
		url,
		query,
		fragment,
		hasRoute: false
	};
}
/**
* Because Otel instrumentation sometimes mutates span names via `span.updateName`, the only way
* to ensure that a user-set span name is preserved is to store it as a tmp attribute on the span.
* We delete this attribute once we're done with it when preparing the event envelope.
*
* This temp attribute always takes precedence over the original name.
*
* We also need to take care of setting the correct source. Users can always update the source
* after updating the name, so we need to respect that.
*
* @internal exported only for testing
*/
function getUserUpdatedNameAndSource(originalName, attributes, fallbackSource = "custom") {
	const source = attributes["sentry.source"] || fallbackSource;
	const description = attributes[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
	if (description && typeof description === "string") return {
		description,
		source
	};
	return {
		description: originalName,
		source
	};
}
/**
* Setup a DSC handler on the passed client,
* ensuring that the transaction name is inferred from the span correctly.
*/
function enhanceDscWithOpenTelemetryRootSpanName(client) {
	client.on("createDsc", (dsc, rootSpan) => {
		if (!rootSpan) return;
		const source = spanToJSON(rootSpan).data[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		const { description } = spanHasName(rootSpan) ? parseSpanDescription(rootSpan) : { description: void 0 };
		if (source !== "url" && description) dsc.transaction = description;
		if (hasSpansEnabled()) {
			const sampled = getSamplingDecision(rootSpan.spanContext());
			dsc.sampled = sampled == void 0 ? void 0 : String(sampled);
		}
	});
}
/**
* Returns the currently active span.
*/
function getActiveSpan() {
	return import_src$21.trace.getActiveSpan();
}
/**
* This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
*
* ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
*/
var DEBUG_BUILD$2 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
/**
* Generate a TraceState for the given data.
*/
function makeTraceState({ dsc, sampled }) {
	const dscString = dsc ? dynamicSamplingContextToSentryBaggageHeader(dsc) : void 0;
	const traceStateBase = new TraceState();
	const traceStateWithDsc = dscString ? traceStateBase.set(SENTRY_TRACE_STATE_DSC, dscString) : traceStateBase;
	return sampled === false ? traceStateWithDsc.set(SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING, "1") : traceStateWithDsc;
}
var setupElements = /* @__PURE__ */ new Set();
/** Get all the OpenTelemetry elements that have been set up. */
function openTelemetrySetupCheck() {
	return Array.from(setupElements);
}
/** Mark an OpenTelemetry element as setup. */
function setIsSetup(element) {
	setupElements.add(element);
}
/**
* Injects and extracts `sentry-trace` and `baggage` headers from carriers.
*/
var SentryPropagator = class extends W3CBaggagePropagator {
	/** A map of URLs that have already been checked for if they match tracePropagationTargets. */
	constructor() {
		super();
		setIsSetup("SentryPropagator");
		this._urlMatchesTargetsMap = new LRUMap(100);
	}
	/**
	* @inheritDoc
	*/
	inject(context, carrier, setter) {
		if (isTracingSuppressed(context)) {
			DEBUG_BUILD$2 && debug.log("[Tracing] Not injecting trace data for url because tracing is suppressed.");
			return;
		}
		const activeSpan = import_src$21.trace.getSpan(context);
		const url = activeSpan && getCurrentURL(activeSpan);
		const tracePropagationTargets = getClient()?.getOptions()?.tracePropagationTargets;
		if (!shouldPropagateTraceForUrl(url, tracePropagationTargets, this._urlMatchesTargetsMap)) {
			DEBUG_BUILD$2 && debug.log("[Tracing] Not injecting trace data for url because it does not match tracePropagationTargets:", url);
			return;
		}
		const existingBaggageHeader = getExistingBaggage(carrier);
		let baggage = import_src$21.propagation.getBaggage(context) || import_src$21.propagation.createBaggage({});
		const { dynamicSamplingContext, traceId, spanId, sampled } = getInjectionData(context);
		if (existingBaggageHeader) {
			const baggageEntries = parseBaggageHeader(existingBaggageHeader);
			if (baggageEntries) Object.entries(baggageEntries).forEach(([key, value]) => {
				baggage = baggage.setEntry(key, { value });
			});
		}
		if (dynamicSamplingContext) baggage = Object.entries(dynamicSamplingContext).reduce((b, [dscKey, dscValue]) => {
			if (dscValue) return b.setEntry(`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`, { value: dscValue });
			return b;
		}, baggage);
		if (traceId && traceId !== import_src$21.INVALID_TRACEID) setter.set(carrier, SENTRY_TRACE_HEADER$1, generateSentryTraceHeader(traceId, spanId, sampled));
		super.inject(import_src$21.propagation.setBaggage(context, baggage), carrier, setter);
	}
	/**
	* @inheritDoc
	*/
	extract(context, carrier, getter) {
		const maybeSentryTraceHeader = getter.get(carrier, SENTRY_TRACE_HEADER$1);
		const baggage = getter.get(carrier, SENTRY_BAGGAGE_HEADER$1);
		return ensureScopesOnContext(getContextWithRemoteActiveSpan(context, {
			sentryTrace: maybeSentryTraceHeader ? Array.isArray(maybeSentryTraceHeader) ? maybeSentryTraceHeader[0] : maybeSentryTraceHeader : void 0,
			baggage
		}));
	}
	/**
	* @inheritDoc
	*/
	fields() {
		return [SENTRY_TRACE_HEADER$1, SENTRY_BAGGAGE_HEADER$1];
	}
};
var NOT_PROPAGATED_MESSAGE = "[Tracing] Not injecting trace data for url because it does not match tracePropagationTargets:";
/**
* Check if a given URL should be propagated to or not.
* If no url is defined, or no trace propagation targets are defined, this will always return `true`.
* You can also optionally provide a decision map, to cache decisions and avoid repeated regex lookups.
*/
function shouldPropagateTraceForUrl(url, tracePropagationTargets, decisionMap) {
	if (typeof url !== "string" || !tracePropagationTargets) return true;
	const cachedDecision = decisionMap?.get(url);
	if (cachedDecision !== void 0) {
		DEBUG_BUILD$2 && !cachedDecision && debug.log(NOT_PROPAGATED_MESSAGE, url);
		return cachedDecision;
	}
	const decision = stringMatchesSomePattern(url, tracePropagationTargets);
	decisionMap?.set(url, decision);
	DEBUG_BUILD$2 && !decision && debug.log(NOT_PROPAGATED_MESSAGE, url);
	return decision;
}
/**
* Get propagation injection data for the given context.
* The additional options can be passed to override the scope and client that is otherwise derived from the context.
*/
function getInjectionData(context, options = {}) {
	const span = import_src$21.trace.getSpan(context);
	if (span?.spanContext().isRemote) {
		const spanContext = span.spanContext();
		return {
			dynamicSamplingContext: getDynamicSamplingContextFromSpan(span),
			traceId: spanContext.traceId,
			spanId: void 0,
			sampled: getSamplingDecision(spanContext)
		};
	}
	if (span) {
		const spanContext = span.spanContext();
		return {
			dynamicSamplingContext: getDynamicSamplingContextFromSpan(span),
			traceId: spanContext.traceId,
			spanId: spanContext.spanId,
			sampled: getSamplingDecision(spanContext)
		};
	}
	const scope = options.scope || getScopesFromContext(context)?.scope || getCurrentScope();
	const client = options.client || getClient();
	const propagationContext = scope.getPropagationContext();
	return {
		dynamicSamplingContext: client ? getDynamicSamplingContextFromScope(client, scope) : void 0,
		traceId: propagationContext.traceId,
		spanId: propagationContext.propagationSpanId,
		sampled: propagationContext.sampled
	};
}
function getContextWithRemoteActiveSpan(ctx, { sentryTrace, baggage }) {
	const { traceId, parentSpanId, sampled, dsc } = propagationContextFromHeaders(sentryTrace, baggage);
	if (!parentSpanId) return ctx;
	const spanContext = generateRemoteSpanContext({
		traceId,
		spanId: parentSpanId,
		sampled,
		dsc
	});
	return import_src$21.trace.setSpanContext(ctx, spanContext);
}
/**
* Takes trace strings and propagates them as a remote active span.
* This should be used in addition to `continueTrace` in OTEL-powered environments.
*/
function continueTraceAsRemoteSpan(ctx, options, callback) {
	const ctxWithSpanContext = ensureScopesOnContext(getContextWithRemoteActiveSpan(ctx, options));
	return import_src$21.context.with(ctxWithSpanContext, callback);
}
function ensureScopesOnContext(ctx) {
	const scopes = getScopesFromContext(ctx);
	return setScopesOnContext(ctx, {
		scope: scopes ? scopes.scope : getCurrentScope().clone(),
		isolationScope: scopes ? scopes.isolationScope : getIsolationScope()
	});
}
/** Try to get the existing baggage header so we can merge this in. */
function getExistingBaggage(carrier) {
	try {
		const baggage = carrier[SENTRY_BAGGAGE_HEADER$1];
		return Array.isArray(baggage) ? baggage.join(",") : baggage;
	} catch {
		return;
	}
}
/**
* It is pretty tricky to get access to the outgoing request URL of a request in the propagator.
* As we only have access to the context of the span to be sent and the carrier (=headers),
* but the span may be unsampled and thus have no attributes.
*
* So we use the following logic:
* 1. If we have an active span, we check if it has a URL attribute.
* 2. Else, if the active span has no URL attribute (e.g. it is unsampled), we check a special trace state (which we set in our sampler).
*/
function getCurrentURL(span) {
	const spanData = spanToJSON(span).data;
	const urlAttribute = spanData[import_src$20.SEMATTRS_HTTP_URL] || spanData[import_src$20.ATTR_URL_FULL];
	if (typeof urlAttribute === "string") return urlAttribute;
	const urlTraceState = span.spanContext().traceState?.get(SENTRY_TRACE_STATE_URL);
	if (urlTraceState) return urlTraceState;
}
function generateRemoteSpanContext({ spanId, traceId, sampled, dsc }) {
	const traceState = makeTraceState({
		dsc,
		sampled
	});
	return {
		traceId,
		spanId,
		isRemote: true,
		traceFlags: sampled ? import_src$21.TraceFlags.SAMPLED : import_src$21.TraceFlags.NONE,
		traceState
	};
}
/**
* Wraps a function with a transaction/span and finishes the span after the function is done.
* The created span is the active span and will be used as parent by other spans created inside the function
* and can be accessed via `Sentry.getActiveSpan()`, as long as the function is executed while the scope is active.
*
* If you want to create a span that is not set as active, use {@link startInactiveSpan}.
*
* You'll always get a span passed to the callback,
* it may just be a non-recording span if the span is not sampled or if tracing is disabled.
*/
function startSpan$1(options, callback) {
	const tracer = getTracer();
	const { name, parentSpan: customParentSpan } = options;
	return getActiveSpanWrapper(customParentSpan)(() => {
		const activeCtx = getContext(options.scope, options.forceTransaction);
		const ctx = options.onlyIfParent && !import_src$21.trace.getSpan(activeCtx) ? suppressTracing$1(activeCtx) : activeCtx;
		const spanOptions = getSpanOptions(options);
		return tracer.startActiveSpan(name, spanOptions, ctx, (span) => {
			return handleCallbackErrors(() => callback(span), () => {
				if (spanToJSON(span).status === void 0) span.setStatus({ code: import_src$21.SpanStatusCode.ERROR });
			}, () => span.end());
		});
	});
}
/**
* Similar to `Sentry.startSpan`. Wraps a function with a span, but does not finish the span
* after the function is done automatically. You'll have to call `span.end()` manually.
*
* The created span is the active span and will be used as parent by other spans created inside the function
* and can be accessed via `Sentry.getActiveSpan()`, as long as the function is executed while the scope is active.
*
* You'll always get a span passed to the callback,
* it may just be a non-recording span if the span is not sampled or if tracing is disabled.
*/
function startSpanManual(options, callback) {
	const tracer = getTracer();
	const { name, parentSpan: customParentSpan } = options;
	return getActiveSpanWrapper(customParentSpan)(() => {
		const activeCtx = getContext(options.scope, options.forceTransaction);
		const ctx = options.onlyIfParent && !import_src$21.trace.getSpan(activeCtx) ? suppressTracing$1(activeCtx) : activeCtx;
		const spanOptions = getSpanOptions(options);
		return tracer.startActiveSpan(name, spanOptions, ctx, (span) => {
			return handleCallbackErrors(() => callback(span, () => span.end()), () => {
				if (spanToJSON(span).status === void 0) span.setStatus({ code: import_src$21.SpanStatusCode.ERROR });
			});
		});
	});
}
/**
* Creates a span. This span is not set as active, so will not get automatic instrumentation spans
* as children or be able to be accessed via `Sentry.getActiveSpan()`.
*
* If you want to create a span that is set as active, use {@link startSpan}.
*
* This function will always return a span,
* it may just be a non-recording span if the span is not sampled or if tracing is disabled.
*/
function startInactiveSpan(options) {
	const tracer = getTracer();
	const { name, parentSpan: customParentSpan } = options;
	return getActiveSpanWrapper(customParentSpan)(() => {
		const activeCtx = getContext(options.scope, options.forceTransaction);
		const ctx = options.onlyIfParent && !import_src$21.trace.getSpan(activeCtx) ? suppressTracing$1(activeCtx) : activeCtx;
		const spanOptions = getSpanOptions(options);
		return tracer.startSpan(name, spanOptions, ctx);
	});
}
/**
* Forks the current scope and sets the provided span as active span in the context of the provided callback. Can be
* passed `null` to start an entirely new span tree.
*
* @param span Spans started in the context of the provided callback will be children of this span. If `null` is passed,
* spans started within the callback will be root spans.
* @param callback Execution context in which the provided span will be active. Is passed the newly forked scope.
* @returns the value returned from the provided callback function.
*/
function withActiveSpan(span, callback) {
	const newContextWithActiveSpan = span ? import_src$21.trace.setSpan(import_src$21.context.active(), span) : import_src$21.trace.deleteSpan(import_src$21.context.active());
	return import_src$21.context.with(newContextWithActiveSpan, () => callback(getCurrentScope()));
}
function getTracer() {
	return getClient()?.tracer || import_src$21.trace.getTracer("@sentry/opentelemetry", "9.47.1");
}
function getSpanOptions(options) {
	const { startTime, attributes, kind, op, links } = options;
	const fixedStartTime = typeof startTime === "number" ? ensureTimestampInMilliseconds(startTime) : startTime;
	return {
		attributes: op ? {
			[SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
			...attributes
		} : attributes,
		kind,
		links,
		startTime: fixedStartTime
	};
}
function ensureTimestampInMilliseconds(timestamp) {
	return timestamp < 9999999999 ? timestamp * 1e3 : timestamp;
}
function getContext(scope, forceTransaction) {
	const ctx = getContextForScope(scope);
	const parentSpan = import_src$21.trace.getSpan(ctx);
	if (!parentSpan) return ctx;
	if (!forceTransaction) return ctx;
	const ctxWithoutSpan = import_src$21.trace.deleteSpan(ctx);
	const { spanId, traceId } = parentSpan.spanContext();
	const sampled = getSamplingDecision(parentSpan.spanContext());
	const traceState = makeTraceState({
		dsc: getDynamicSamplingContextFromSpan(getRootSpan(parentSpan)),
		sampled
	});
	const spanOptions = {
		traceId,
		spanId,
		isRemote: true,
		traceFlags: sampled ? import_src$21.TraceFlags.SAMPLED : import_src$21.TraceFlags.NONE,
		traceState
	};
	return import_src$21.trace.setSpanContext(ctxWithoutSpan, spanOptions);
}
function getContextForScope(scope) {
	if (scope) {
		const ctx = getContextFromScope(scope);
		if (ctx) return ctx;
	}
	return import_src$21.context.active();
}
/**
* Continue a trace from `sentry-trace` and `baggage` values.
* These values can be obtained from incoming request headers, or in the browser from `<meta name="sentry-trace">`
* and `<meta name="baggage">` HTML tags.
*
* Spans started with `startSpan`, `startSpanManual` and `startInactiveSpan`, within the callback will automatically
* be attached to the incoming trace.
*
* This is a custom version of `continueTrace` that is used in OTEL-powered environments.
* It propagates the trace as a remote span, in addition to setting it on the propagation context.
*/
function continueTrace(options, callback) {
	return continueTraceAsRemoteSpan(import_src$21.context.active(), options, callback);
}
/**
* Get the trace context for a given scope.
* We have a custom implemention here because we need an OTEL-specific way to get the span from a scope.
*/
function getTraceContextForScope(client, scope) {
	const ctx = getContextFromScope(scope);
	const span = ctx && import_src$21.trace.getSpan(ctx);
	const traceContext = span ? spanToTraceContext(span) : getTraceContextFromScope(scope);
	return [span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromScope(client, scope), traceContext];
}
function getActiveSpanWrapper(parentSpan) {
	return parentSpan !== void 0 ? (callback) => {
		return withActiveSpan(parentSpan, callback);
	} : (callback) => callback();
}
/** Suppress tracing in the given callback, ensuring no spans are generated inside of it. */
function suppressTracing(callback) {
	const ctx = suppressTracing$1(import_src$21.context.active());
	return import_src$21.context.with(ctx, callback);
}
/** Ensure the `trace` context is set on all events. */
function setupEventContextTrace(client) {
	client.on("preprocessEvent", (event) => {
		const span = getActiveSpan();
		if (!span || event.type === "transaction") return;
		event.contexts = {
			trace: spanToTraceContext(span),
			...event.contexts
		};
		event.sdkProcessingMetadata = {
			dynamicSamplingContext: getDynamicSamplingContextFromSpan(getRootSpan(span)),
			...event.sdkProcessingMetadata
		};
		return event;
	});
}
/**
* Otel-specific implementation of `getTraceData`.
* @see `@sentry/core` version of `getTraceData` for more information
*/
function getTraceData({ span, scope, client } = {}) {
	let ctx = (scope && getContextFromScope(scope)) ?? import_src$21.context.active();
	if (span) {
		const { scope } = getCapturedScopesOnSpan(span);
		ctx = scope && getContextFromScope(scope) || import_src$21.trace.setSpan(import_src$21.context.active(), span);
	}
	const { traceId, spanId, sampled, dynamicSamplingContext } = getInjectionData(ctx, {
		scope,
		client
	});
	return {
		"sentry-trace": generateSentryTraceHeader(traceId, spanId, sampled),
		baggage: dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext)
	};
}
/**
* Sets the async context strategy to use follow the OTEL context under the hood.
* We handle forking a hub inside of our custom OTEL Context Manager (./otelContextManager.ts)
*/
function setOpenTelemetryContextAsyncContextStrategy() {
	function getScopes() {
		const scopes = getScopesFromContext(import_src$21.context.active());
		if (scopes) return scopes;
		return {
			scope: getDefaultCurrentScope(),
			isolationScope: getDefaultIsolationScope()
		};
	}
	function withScope(callback) {
		const ctx = import_src$21.context.active();
		return import_src$21.context.with(ctx, () => {
			return callback(getCurrentScope());
		});
	}
	function withSetScope(scope, callback) {
		const ctx = getContextFromScope(scope) || import_src$21.context.active();
		return import_src$21.context.with(ctx.setValue(SENTRY_FORK_SET_SCOPE_CONTEXT_KEY, scope), () => {
			return callback(scope);
		});
	}
	function withIsolationScope(callback) {
		const ctx = import_src$21.context.active();
		return import_src$21.context.with(ctx.setValue(SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY, true), () => {
			return callback(getIsolationScope());
		});
	}
	function withSetIsolationScope(isolationScope, callback) {
		const ctx = import_src$21.context.active();
		return import_src$21.context.with(ctx.setValue(SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY, isolationScope), () => {
			return callback(getIsolationScope());
		});
	}
	function getCurrentScope() {
		return getScopes().scope;
	}
	function getIsolationScope() {
		return getScopes().isolationScope;
	}
	setAsyncContextStrategy({
		withScope,
		withSetScope,
		withSetIsolationScope,
		withIsolationScope,
		getCurrentScope,
		getIsolationScope,
		startSpan: startSpan$1,
		startSpanManual,
		startInactiveSpan,
		getActiveSpan,
		suppressTracing,
		getTraceData,
		continueTrace,
		withActiveSpan
	});
}
/**
* Wrap an OpenTelemetry ContextManager in a way that ensures the context is kept in sync with the Sentry Scope.
*
* Usage:
* import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
* const SentryContextManager = wrapContextManagerClass(AsyncLocalStorageContextManager);
* const contextManager = new SentryContextManager();
*/
function wrapContextManagerClass(ContextManagerClass) {
	/**
	* This is a custom ContextManager for OpenTelemetry, which extends the default AsyncLocalStorageContextManager.
	* It ensures that we create new scopes per context, so that the OTEL Context & the Sentry Scope are always in sync.
	*
	* Note that we currently only support AsyncHooks with this,
	* but since this should work for Node 14+ anyhow that should be good enough.
	*/
	class SentryContextManager extends ContextManagerClass {
		constructor(...args) {
			super(...args);
			setIsSetup("SentryContextManager");
		}
		/**
		* Overwrite with() of the original AsyncLocalStorageContextManager
		* to ensure we also create new scopes per context.
		*/
		with(context, fn, thisArg, ...args) {
			const currentScopes = getScopesFromContext(context);
			const currentScope = currentScopes?.scope || getCurrentScope();
			const currentIsolationScope = currentScopes?.isolationScope || getIsolationScope();
			const shouldForkIsolationScope = context.getValue(SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY) === true;
			const scope = context.getValue(SENTRY_FORK_SET_SCOPE_CONTEXT_KEY);
			const isolationScope = context.getValue(SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY);
			const newCurrentScope = scope || currentScope.clone();
			const ctx2 = setScopesOnContext(context, {
				scope: newCurrentScope,
				isolationScope: isolationScope || (shouldForkIsolationScope ? currentIsolationScope.clone() : currentIsolationScope)
			}).deleteValue(SENTRY_FORK_ISOLATION_SCOPE_CONTEXT_KEY).deleteValue(SENTRY_FORK_SET_SCOPE_CONTEXT_KEY).deleteValue(SENTRY_FORK_SET_ISOLATION_SCOPE_CONTEXT_KEY);
			setContextOnScope(newCurrentScope, ctx2);
			return super.with(ctx2, fn, thisArg, ...args);
		}
	}
	return SentryContextManager;
}
/**
* This function runs through a list of OTEL Spans, and wraps them in an `SpanNode`
* where each node holds a reference to their parent node.
*/
function groupSpansWithParents(spans) {
	const nodeMap = /* @__PURE__ */ new Map();
	for (const span of spans) createOrUpdateSpanNodeAndRefs(nodeMap, span);
	return Array.from(nodeMap, function([_id, spanNode]) {
		return spanNode;
	});
}
/**
* This returns the _local_ parent ID - `parentId` on the span may point to a remote span.
*/
function getLocalParentId(span) {
	return !(span.attributes[SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE] === true) ? getParentSpanId(span) : void 0;
}
function createOrUpdateSpanNodeAndRefs(nodeMap, span) {
	const id = span.spanContext().spanId;
	const parentId = getLocalParentId(span);
	if (!parentId) {
		createOrUpdateNode(nodeMap, {
			id,
			span,
			children: []
		});
		return;
	}
	const parentNode = createOrGetParentNode(nodeMap, parentId);
	const node = createOrUpdateNode(nodeMap, {
		id,
		span,
		parentNode,
		children: []
	});
	parentNode.children.push(node);
}
function createOrGetParentNode(nodeMap, id) {
	const existing = nodeMap.get(id);
	if (existing) return existing;
	return createOrUpdateNode(nodeMap, {
		id,
		children: []
	});
}
function createOrUpdateNode(nodeMap, spanNode) {
	const existing = nodeMap.get(spanNode.id);
	if (existing?.span) return existing;
	if (existing && !existing.span) {
		existing.span = spanNode.span;
		existing.parentNode = spanNode.parentNode;
		return existing;
	}
	nodeMap.set(spanNode.id, spanNode);
	return spanNode;
}
var canonicalGrpcErrorCodesMap = {
	"1": "cancelled",
	"2": "unknown_error",
	"3": "invalid_argument",
	"4": "deadline_exceeded",
	"5": "not_found",
	"6": "already_exists",
	"7": "permission_denied",
	"8": "resource_exhausted",
	"9": "failed_precondition",
	"10": "aborted",
	"11": "out_of_range",
	"12": "unimplemented",
	"13": "internal_error",
	"14": "unavailable",
	"15": "data_loss",
	"16": "unauthenticated"
};
var isStatusErrorMessageValid = (message) => {
	return Object.values(canonicalGrpcErrorCodesMap).includes(message);
};
/**
* Get a Sentry span status from an otel span.
*/
function mapStatus(span) {
	const attributes = spanHasAttributes(span) ? span.attributes : {};
	const status = spanHasStatus(span) ? span.status : void 0;
	if (status) {
		if (status.code === import_src$21.SpanStatusCode.OK) return { code: 1 };
		else if (status.code === import_src$21.SpanStatusCode.ERROR) {
			if (typeof status.message === "undefined") {
				const inferredStatus = inferStatusFromAttributes(attributes);
				if (inferredStatus) return inferredStatus;
			}
			if (status.message && isStatusErrorMessageValid(status.message)) return {
				code: 2,
				message: status.message
			};
			else return {
				code: 2,
				message: "unknown_error"
			};
		}
	}
	const inferredStatus = inferStatusFromAttributes(attributes);
	if (inferredStatus) return inferredStatus;
	if (status?.code === import_src$21.SpanStatusCode.UNSET) return { code: 1 };
	else return {
		code: 2,
		message: "unknown_error"
	};
}
function inferStatusFromAttributes(attributes) {
	const httpCodeAttribute = attributes[import_src$20.ATTR_HTTP_RESPONSE_STATUS_CODE] || attributes[import_src$20.SEMATTRS_HTTP_STATUS_CODE];
	const grpcCodeAttribute = attributes[import_src$20.SEMATTRS_RPC_GRPC_STATUS_CODE];
	const numberHttpCode = typeof httpCodeAttribute === "number" ? httpCodeAttribute : typeof httpCodeAttribute === "string" ? parseInt(httpCodeAttribute) : void 0;
	if (typeof numberHttpCode === "number") return getSpanStatusFromHttpCode(numberHttpCode);
	if (typeof grpcCodeAttribute === "string") return {
		code: 2,
		message: canonicalGrpcErrorCodesMap[grpcCodeAttribute] || "unknown_error"
	};
}
var MAX_SPAN_COUNT = 1e3;
var DEFAULT_TIMEOUT = 300;
/**
* A Sentry-specific exporter that converts OpenTelemetry Spans to Sentry Spans & Transactions.
*/
var SentrySpanExporter = class {
	constructor(options) {
		this._finishedSpanBucketSize = options?.timeout || DEFAULT_TIMEOUT;
		this._finishedSpanBuckets = new Array(this._finishedSpanBucketSize).fill(void 0);
		this._lastCleanupTimestampInS = Math.floor(Date.now() / 1e3);
		this._spansToBucketEntry = /* @__PURE__ */ new WeakMap();
		this._sentSpans = /* @__PURE__ */ new Map();
		this._debouncedFlush = debounce(this.flush.bind(this), 1, { maxWait: 100 });
	}
	/**
	* Export a single span.
	* This is called by the span processor whenever a span is ended.
	*/
	export(span) {
		const currentTimestampInS = Math.floor(Date.now() / 1e3);
		if (this._lastCleanupTimestampInS !== currentTimestampInS) {
			let droppedSpanCount = 0;
			this._finishedSpanBuckets.forEach((bucket, i) => {
				if (bucket && bucket.timestampInS <= currentTimestampInS - this._finishedSpanBucketSize) {
					droppedSpanCount += bucket.spans.size;
					this._finishedSpanBuckets[i] = void 0;
				}
			});
			if (droppedSpanCount > 0) DEBUG_BUILD$2 && debug.log(`SpanExporter dropped ${droppedSpanCount} spans because they were pending for more than ${this._finishedSpanBucketSize} seconds.`);
			this._lastCleanupTimestampInS = currentTimestampInS;
		}
		const currentBucketIndex = currentTimestampInS % this._finishedSpanBucketSize;
		const currentBucket = this._finishedSpanBuckets[currentBucketIndex] || {
			timestampInS: currentTimestampInS,
			spans: /* @__PURE__ */ new Set()
		};
		this._finishedSpanBuckets[currentBucketIndex] = currentBucket;
		currentBucket.spans.add(span);
		this._spansToBucketEntry.set(span, currentBucket);
		const localParentId = getLocalParentId(span);
		if (!localParentId || this._sentSpans.has(localParentId)) this._debouncedFlush();
	}
	/**
	* Try to flush any pending spans immediately.
	* This is called internally by the exporter (via _debouncedFlush),
	* but can also be triggered externally if we force-flush.
	*/
	flush() {
		const finishedSpans = this._finishedSpanBuckets.flatMap((bucket) => bucket ? Array.from(bucket.spans) : []);
		this._flushSentSpanCache();
		const sentSpans = this._maybeSend(finishedSpans);
		const sentSpanCount = sentSpans.size;
		const remainingOpenSpanCount = finishedSpans.length - sentSpanCount;
		DEBUG_BUILD$2 && debug.log(`SpanExporter exported ${sentSpanCount} spans, ${remainingOpenSpanCount} spans are waiting for their parent spans to finish`);
		const expirationDate = Date.now() + DEFAULT_TIMEOUT * 1e3;
		for (const span of sentSpans) {
			this._sentSpans.set(span.spanContext().spanId, expirationDate);
			const bucketEntry = this._spansToBucketEntry.get(span);
			if (bucketEntry) bucketEntry.spans.delete(span);
		}
		this._debouncedFlush.cancel();
	}
	/**
	* Clear the exporter.
	* This is called when the span processor is shut down.
	*/
	clear() {
		this._finishedSpanBuckets = this._finishedSpanBuckets.fill(void 0);
		this._sentSpans.clear();
		this._debouncedFlush.cancel();
	}
	/**
	* Send the given spans, but only if they are part of a finished transaction.
	*
	* Returns the sent spans.
	* Spans remain unsent when their parent span is not yet finished.
	* This will happen regularly, as child spans are generally finished before their parents.
	* But it _could_ also happen because, for whatever reason, a parent span was lost.
	* In this case, we'll eventually need to clean this up.
	*/
	_maybeSend(spans) {
		const grouped = groupSpansWithParents(spans);
		const sentSpans = /* @__PURE__ */ new Set();
		const rootNodes = this._getCompletedRootNodes(grouped);
		for (const root of rootNodes) {
			const span = root.span;
			sentSpans.add(span);
			const transactionEvent = createTransactionForOtelSpan(span);
			if (root.parentNode && this._sentSpans.has(root.parentNode.id)) {
				const traceData = transactionEvent.contexts?.trace?.data;
				if (traceData) traceData["sentry.parent_span_already_sent"] = true;
			}
			const spans = transactionEvent.spans || [];
			for (const child of root.children) createAndFinishSpanForOtelSpan(child, spans, sentSpans);
			transactionEvent.spans = spans.length > MAX_SPAN_COUNT ? spans.sort((a, b) => a.start_timestamp - b.start_timestamp).slice(0, MAX_SPAN_COUNT) : spans;
			const measurements = timedEventsToMeasurements(span.events);
			if (measurements) transactionEvent.measurements = measurements;
			captureEvent(transactionEvent);
		}
		return sentSpans;
	}
	/** Remove "expired" span id entries from the _sentSpans cache. */
	_flushSentSpanCache() {
		const currentTimestamp = Date.now();
		for (const [spanId, expirationTime] of this._sentSpans.entries()) if (expirationTime <= currentTimestamp) this._sentSpans.delete(spanId);
	}
	/** Check if a node is a completed root node or a node whose parent has already been sent */
	_nodeIsCompletedRootNodeOrHasSentParent(node) {
		return !!node.span && (!node.parentNode || this._sentSpans.has(node.parentNode.id));
	}
	/** Get all completed root nodes from a list of nodes */
	_getCompletedRootNodes(nodes) {
		return nodes.filter((node) => this._nodeIsCompletedRootNodeOrHasSentParent(node));
	}
};
function parseSpan(span) {
	const attributes = span.attributes;
	return {
		origin: attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
		op: attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
		source: attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]
	};
}
/** Exported only for tests. */
function createTransactionForOtelSpan(span) {
	const { op, description, data, origin = "manual", source } = getSpanData(span);
	const capturedSpanScopes = getCapturedScopesOnSpan(span);
	const sampleRate = span.attributes[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE];
	const attributes = {
		[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
		[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE]: sampleRate,
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: origin,
		...data,
		...removeSentryAttributes(span.attributes)
	};
	const { links } = span;
	const { traceId: trace_id, spanId: span_id } = span.spanContext();
	const traceContext = {
		parent_span_id: getParentSpanId(span),
		span_id,
		trace_id,
		data: attributes,
		origin,
		op,
		status: getStatusMessage(mapStatus(span)),
		links: convertSpanLinksForEnvelope(links)
	};
	const statusCode = attributes[import_src$20.ATTR_HTTP_RESPONSE_STATUS_CODE];
	const responseContext = typeof statusCode === "number" ? { response: { status_code: statusCode } } : void 0;
	return {
		contexts: {
			trace: traceContext,
			otel: { resource: span.resource.attributes },
			...responseContext
		},
		spans: [],
		start_timestamp: spanTimeInputToSeconds(span.startTime),
		timestamp: spanTimeInputToSeconds(span.endTime),
		transaction: description,
		type: "transaction",
		sdkProcessingMetadata: {
			capturedSpanScope: capturedSpanScopes.scope,
			capturedSpanIsolationScope: capturedSpanScopes.isolationScope,
			sampleRate,
			dynamicSamplingContext: getDynamicSamplingContextFromSpan(span)
		},
		...source && { transaction_info: { source } }
	};
}
function createAndFinishSpanForOtelSpan(node, spans, sentSpans) {
	const span = node.span;
	if (span) sentSpans.add(span);
	if (!span) {
		node.children.forEach((child) => {
			createAndFinishSpanForOtelSpan(child, spans, sentSpans);
		});
		return;
	}
	const span_id = span.spanContext().spanId;
	const trace_id = span.spanContext().traceId;
	const parentSpanId = getParentSpanId(span);
	const { attributes, startTime, endTime, links } = span;
	const { op, description, data, origin = "manual" } = getSpanData(span);
	const allData = {
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: origin,
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
		...removeSentryAttributes(attributes),
		...data
	};
	const status = mapStatus(span);
	const spanJSON = {
		span_id,
		trace_id,
		data: allData,
		description,
		parent_span_id: parentSpanId,
		start_timestamp: spanTimeInputToSeconds(startTime),
		timestamp: spanTimeInputToSeconds(endTime) || void 0,
		status: getStatusMessage(status),
		op,
		origin,
		measurements: timedEventsToMeasurements(span.events),
		links: convertSpanLinksForEnvelope(links)
	};
	spans.push(spanJSON);
	node.children.forEach((child) => {
		createAndFinishSpanForOtelSpan(child, spans, sentSpans);
	});
}
function getSpanData(span) {
	const { op: definedOp, source: definedSource, origin } = parseSpan(span);
	const { op: inferredOp, description, source: inferredSource, data: inferredData } = parseSpanDescription(span);
	return {
		op: definedOp || inferredOp,
		description,
		source: definedSource || inferredSource,
		origin,
		data: {
			...inferredData,
			...getData(span)
		}
	};
}
/**
* Remove custom `sentry.` attributes we do not need to send.
* These are more carrier attributes we use inside of the SDK, we do not need to send them to the API.
*/
function removeSentryAttributes(data) {
	const cleanedData = { ...data };
	delete cleanedData[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE];
	delete cleanedData[SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE];
	delete cleanedData[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
	return cleanedData;
}
function getData(span) {
	const attributes = span.attributes;
	const data = {};
	if (span.kind !== import_src$21.SpanKind.INTERNAL) data["otel.kind"] = import_src$21.SpanKind[span.kind];
	const maybeHttpStatusCodeAttribute = attributes[import_src$20.SEMATTRS_HTTP_STATUS_CODE];
	if (maybeHttpStatusCodeAttribute) data[import_src$20.ATTR_HTTP_RESPONSE_STATUS_CODE] = maybeHttpStatusCodeAttribute;
	const requestData = getRequestSpanData(span);
	if (requestData.url) data.url = requestData.url;
	if (requestData["http.query"]) data["http.query"] = requestData["http.query"].slice(1);
	if (requestData["http.fragment"]) data["http.fragment"] = requestData["http.fragment"].slice(1);
	return data;
}
function onSpanStart(span, parentContext) {
	const parentSpan = import_src$21.trace.getSpan(parentContext);
	let scopes = getScopesFromContext(parentContext);
	if (parentSpan && !parentSpan.spanContext().isRemote) addChildSpanToSpan(parentSpan, span);
	if (parentSpan?.spanContext().isRemote) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_PARENT_IS_REMOTE, true);
	if (parentContext === import_src$21.ROOT_CONTEXT) scopes = {
		scope: getDefaultCurrentScope(),
		isolationScope: getDefaultIsolationScope()
	};
	if (scopes) setCapturedScopesOnSpan(span, scopes.scope, scopes.isolationScope);
	logSpanStart(span);
	getClient()?.emit("spanStart", span);
}
function onSpanEnd(span) {
	logSpanEnd(span);
	getClient()?.emit("spanEnd", span);
}
/**
* Converts OpenTelemetry Spans to Sentry Spans and sends them to Sentry via
* the Sentry SDK.
*/
var SentrySpanProcessor = class {
	constructor(options) {
		setIsSetup("SentrySpanProcessor");
		this._exporter = new SentrySpanExporter(options);
	}
	/**
	* @inheritDoc
	*/
	async forceFlush() {
		this._exporter.flush();
	}
	/**
	* @inheritDoc
	*/
	async shutdown() {
		this._exporter.clear();
	}
	/**
	* @inheritDoc
	*/
	onStart(span, parentContext) {
		onSpanStart(span, parentContext);
	}
	/** @inheritDoc */
	onEnd(span) {
		onSpanEnd(span);
		this._exporter.export(span);
	}
};
/**
* A custom OTEL sampler that uses Sentry sampling rates to make its decision
*/
var SentrySampler = class {
	constructor(client) {
		this._client = client;
		setIsSetup("SentrySampler");
	}
	/** @inheritDoc */
	shouldSample(context, traceId, spanName, spanKind, spanAttributes, _links) {
		const options = this._client.getOptions();
		const parentSpan = getValidSpan(context);
		const parentContext = parentSpan?.spanContext();
		if (!hasSpansEnabled(options)) return wrapSamplingDecision({
			decision: void 0,
			context,
			spanAttributes
		});
		const maybeSpanHttpMethod = spanAttributes[import_src$20.SEMATTRS_HTTP_METHOD] || spanAttributes[import_src$20.ATTR_HTTP_REQUEST_METHOD];
		if (spanKind === import_src$21.SpanKind.CLIENT && maybeSpanHttpMethod && (!parentSpan || parentContext?.isRemote)) return wrapSamplingDecision({
			decision: void 0,
			context,
			spanAttributes
		});
		const parentSampled = parentSpan ? getParentSampled(parentSpan, traceId, spanName) : void 0;
		if (!(!parentSpan || parentContext?.isRemote)) return wrapSamplingDecision({
			decision: parentSampled ? SamplingDecision.RECORD_AND_SAMPLED : SamplingDecision.NOT_RECORD,
			context,
			spanAttributes
		});
		const { description: inferredSpanName, data: inferredAttributes, op } = inferSpanData(spanName, spanAttributes, spanKind);
		const mergedAttributes = {
			...inferredAttributes,
			...spanAttributes
		};
		if (op) mergedAttributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] = op;
		const mutableSamplingDecision = { decision: true };
		this._client.emit("beforeSampling", {
			spanAttributes: mergedAttributes,
			spanName: inferredSpanName,
			parentSampled,
			parentContext
		}, mutableSamplingDecision);
		if (!mutableSamplingDecision.decision) return wrapSamplingDecision({
			decision: void 0,
			context,
			spanAttributes
		});
		const { isolationScope } = getScopesFromContext(context) ?? {};
		const dscString = parentContext?.traceState ? parentContext.traceState.get(SENTRY_TRACE_STATE_DSC) : void 0;
		const dsc = dscString ? baggageHeaderToDynamicSamplingContext(dscString) : void 0;
		const sampleRand = parseSampleRate(dsc?.sample_rand) ?? Math.random();
		const [sampled, sampleRate, localSampleRateWasApplied] = sampleSpan(options, {
			name: inferredSpanName,
			attributes: mergedAttributes,
			normalizedRequest: isolationScope?.getScopeData().sdkProcessingMetadata.normalizedRequest,
			parentSampled,
			parentSampleRate: parseSampleRate(dsc?.sample_rate)
		}, sampleRand);
		const method = `${maybeSpanHttpMethod}`.toUpperCase();
		if (method === "OPTIONS" || method === "HEAD") {
			DEBUG_BUILD$2 && debug.log(`[Tracing] Not sampling span because HTTP method is '${method}' for ${spanName}`);
			return wrapSamplingDecision({
				decision: SamplingDecision.NOT_RECORD,
				context,
				spanAttributes,
				sampleRand,
				downstreamTraceSampleRate: 0
			});
		}
		if (!sampled && parentSampled === void 0) {
			DEBUG_BUILD$2 && debug.log("[Tracing] Discarding root span because its trace was not chosen to be sampled.");
			this._client.recordDroppedEvent("sample_rate", "transaction");
		}
		return {
			...wrapSamplingDecision({
				decision: sampled ? SamplingDecision.RECORD_AND_SAMPLED : SamplingDecision.NOT_RECORD,
				context,
				spanAttributes,
				sampleRand,
				downstreamTraceSampleRate: localSampleRateWasApplied ? sampleRate : void 0
			}),
			attributes: { [SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE]: localSampleRateWasApplied ? sampleRate : void 0 }
		};
	}
	/** Returns the sampler name or short description with the configuration. */
	toString() {
		return "SentrySampler";
	}
};
function getParentSampled(parentSpan, traceId, spanName) {
	const parentContext = parentSpan.spanContext();
	if ((0, import_src$21.isSpanContextValid)(parentContext) && parentContext.traceId === traceId) {
		if (parentContext.isRemote) {
			const parentSampled = getSamplingDecision(parentSpan.spanContext());
			DEBUG_BUILD$2 && debug.log(`[Tracing] Inheriting remote parent's sampled decision for ${spanName}: ${parentSampled}`);
			return parentSampled;
		}
		const parentSampled = getSamplingDecision(parentContext);
		DEBUG_BUILD$2 && debug.log(`[Tracing] Inheriting parent's sampled decision for ${spanName}: ${parentSampled}`);
		return parentSampled;
	}
}
/**
* Wrap a sampling decision with data that Sentry needs to work properly with it.
* If you pass `decision: undefined`, it will be treated as `NOT_RECORDING`, but in contrast to passing `NOT_RECORDING`
* it will not propagate this decision to downstream Sentry SDKs.
*/
function wrapSamplingDecision({ decision, context, spanAttributes, sampleRand, downstreamTraceSampleRate }) {
	let traceState = getBaseTraceState(context, spanAttributes);
	if (downstreamTraceSampleRate !== void 0) traceState = traceState.set(SENTRY_TRACE_STATE_SAMPLE_RATE, `${downstreamTraceSampleRate}`);
	if (sampleRand !== void 0) traceState = traceState.set(SENTRY_TRACE_STATE_SAMPLE_RAND, `${sampleRand}`);
	if (decision == void 0) return {
		decision: SamplingDecision.NOT_RECORD,
		traceState
	};
	if (decision === SamplingDecision.NOT_RECORD) return {
		decision,
		traceState: traceState.set(SENTRY_TRACE_STATE_SAMPLED_NOT_RECORDING, "1")
	};
	return {
		decision,
		traceState
	};
}
function getBaseTraceState(context, spanAttributes) {
	let traceState = (import_src$21.trace.getSpan(context)?.spanContext())?.traceState || new TraceState();
	const url = spanAttributes[import_src$20.SEMATTRS_HTTP_URL] || spanAttributes[import_src$20.ATTR_URL_FULL];
	if (url && typeof url === "string") traceState = traceState.set(SENTRY_TRACE_STATE_URL, url);
	return traceState;
}
/**
* If the active span is invalid, we want to ignore it as parent.
* This aligns with how otel tracers and default samplers handle these cases.
*/
function getValidSpan(context) {
	const span = import_src$21.trace.getSpan(context);
	return span && (0, import_src$21.isSpanContextValid)(span.spanContext()) ? span : void 0;
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/debug-build.js
/**
* This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
*
* ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
*/
var DEBUG_BUILD$1 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
//#endregion
//#region node_modules/@sentry/node-core/build/esm/utils/baggage.js
/**
* Merge two baggage headers into one, where the existing one takes precedence.
* The order of the existing baggage will be preserved, and new entries will be added to the end.
*/
function mergeBaggageHeaders(existing, baggage) {
	if (!existing) return baggage;
	const existingBaggageEntries = parseBaggageHeader(existing);
	const newBaggageEntries = parseBaggageHeader(baggage);
	if (!newBaggageEntries) return existing;
	const mergedBaggageEntries = { ...existingBaggageEntries };
	Object.entries(newBaggageEntries).forEach(([key, value]) => {
		if (!mergedBaggageEntries[key]) mergedBaggageEntries[key] = value;
	});
	return objectToBaggageHeader(mergedBaggageEntries);
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/utils/getRequestUrl.js
/** Build a full URL from request options. */
function getRequestUrl(requestOptions) {
	const protocol = requestOptions.protocol || "";
	const hostname = requestOptions.hostname || requestOptions.host || "";
	return `${protocol}//${hostname}${!requestOptions.port || requestOptions.port === 80 || requestOptions.port === 443 || /^(.*):(\d+)$/.test(hostname) ? "" : `:${requestOptions.port}`}${requestOptions.path ? requestOptions.path : "/"}`;
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/http/SentryHttpInstrumentation.js
init_esm();
init_esm$1();
var INSTRUMENTATION_NAME$1 = "@sentry/instrumentation-http";
var MAX_BODY_BYTE_LENGTH = 1024 * 1024;
/**
* This custom HTTP instrumentation is used to isolate incoming requests and annotate them with additional information.
* It does not emit any spans.
*
* The reason this is isolated from the OpenTelemetry instrumentation is that users may overwrite this,
* which would lead to Sentry not working as expected.
*
* Important note: Contrary to other OTEL instrumentation, this one cannot be unwrapped.
* It only does minimal things though and does not emit any spans.
*
* This is heavily inspired & adapted from:
* https://github.com/open-telemetry/opentelemetry-js/blob/f8ab5592ddea5cba0a3b33bf8d74f27872c0367f/experimental/packages/opentelemetry-instrumentation-http/src/http.ts
*/
var SentryHttpInstrumentation = class extends InstrumentationBase {
	constructor(config = {}) {
		super(INSTRUMENTATION_NAME$1, SDK_VERSION, config);
		this._propagationDecisionMap = new LRUMap(100);
		this._ignoreOutgoingRequestsMap = /* @__PURE__ */ new WeakMap();
	}
	/** @inheritdoc */
	init() {
		let hasRegisteredHandlers = false;
		const onHttpServerRequestStart = ((_data) => {
			const data = _data;
			this._patchServerEmitOnce(data.server);
		});
		const onHttpClientResponseFinish = ((_data) => {
			const data = _data;
			this._onOutgoingRequestFinish(data.request, data.response);
		});
		const onHttpClientRequestError = ((_data) => {
			const data = _data;
			this._onOutgoingRequestFinish(data.request, void 0);
		});
		const onHttpClientRequestCreated = ((_data) => {
			const data = _data;
			this._onOutgoingRequestCreated(data.request);
		});
		const wrap = (moduleExports) => {
			if (hasRegisteredHandlers) return moduleExports;
			hasRegisteredHandlers = true;
			subscribe("http.server.request.start", onHttpServerRequestStart);
			subscribe("http.client.response.finish", onHttpClientResponseFinish);
			subscribe("http.client.request.error", onHttpClientRequestError);
			if (this.getConfig().propagateTraceInOutgoingRequests) subscribe("http.client.request.created", onHttpClientRequestCreated);
			return moduleExports;
		};
		const unwrap = () => {
			unsubscribe("http.server.request.start", onHttpServerRequestStart);
			unsubscribe("http.client.response.finish", onHttpClientResponseFinish);
			unsubscribe("http.client.request.error", onHttpClientRequestError);
			unsubscribe("http.client.request.created", onHttpClientRequestCreated);
		};
		/**
		* You may be wondering why we register these diagnostics-channel listeners
		* in such a convoluted way (as InstrumentationNodeModuleDefinition...)˝,
		* instead of simply subscribing to the events once in here.
		* The reason for this is timing semantics: These functions are called once the http or https module is loaded.
		* If we'd subscribe before that, there seem to be conflicts with the OTEL native instrumentation in some scenarios,
		* especially the "import-on-top" pattern of setting up ESM applications.
		*/
		return [new InstrumentationNodeModuleDefinition("http", ["*"], wrap, unwrap), new InstrumentationNodeModuleDefinition("https", ["*"], wrap, unwrap)];
	}
	/**
	* This is triggered when an outgoing request finishes.
	* It has access to the final request and response objects.
	*/
	_onOutgoingRequestFinish(request, response) {
		DEBUG_BUILD$1 && debug.log(INSTRUMENTATION_NAME$1, "Handling finished outgoing request");
		const _breadcrumbs = this.getConfig().breadcrumbs;
		const breadCrumbsEnabled = typeof _breadcrumbs === "undefined" ? true : _breadcrumbs;
		const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request) ?? this._shouldIgnoreOutgoingRequest(request);
		this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
		if (breadCrumbsEnabled && !shouldIgnore) addRequestBreadcrumb$1(request, response);
	}
	/**
	* This is triggered when an outgoing request is created.
	* It has access to the request object, and can mutate it before the request is sent.
	*/
	_onOutgoingRequestCreated(request) {
		const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request) ?? this._shouldIgnoreOutgoingRequest(request);
		this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
		if (shouldIgnore) return;
		const url = getRequestUrl(request);
		const tracePropagationTargets = getClient()?.getOptions().tracePropagationTargets;
		const addedHeaders = shouldPropagateTraceForUrl(url, tracePropagationTargets, this._propagationDecisionMap) ? getTraceData$1() : void 0;
		if (!addedHeaders) return;
		const { "sentry-trace": sentryTrace, baggage } = addedHeaders;
		if (sentryTrace && !request.getHeader("sentry-trace")) try {
			request.setHeader("sentry-trace", sentryTrace);
			DEBUG_BUILD$1 && debug.log(INSTRUMENTATION_NAME$1, "Added sentry-trace header to outgoing request");
		} catch (error) {
			DEBUG_BUILD$1 && debug.error(INSTRUMENTATION_NAME$1, "Failed to add sentry-trace header to outgoing request:", isError(error) ? error.message : "Unknown error");
		}
		if (baggage) {
			const newBaggage = mergeBaggageHeaders(request.getHeader("baggage"), baggage);
			if (newBaggage) try {
				request.setHeader("baggage", newBaggage);
				DEBUG_BUILD$1 && debug.log(INSTRUMENTATION_NAME$1, "Added baggage header to outgoing request");
			} catch (error) {
				DEBUG_BUILD$1 && debug.error(INSTRUMENTATION_NAME$1, "Failed to add baggage header to outgoing request:", isError(error) ? error.message : "Unknown error");
			}
		}
	}
	/**
	* Patch a server.emit function to handle process isolation for incoming requests.
	* This will only patch the emit function if it was not already patched.
	*/
	_patchServerEmitOnce(server) {
		const originalEmit = server.emit;
		if (originalEmit.__sentry_patched__) return;
		DEBUG_BUILD$1 && debug.log(INSTRUMENTATION_NAME$1, "Patching server.emit");
		const instrumentation = this;
		const { ignoreIncomingRequestBody, maxIncomingRequestBodySize = "medium" } = instrumentation.getConfig();
		const newEmit = new Proxy(originalEmit, { apply(target, thisArg, args) {
			if (args[0] !== "request") return target.apply(thisArg, args);
			DEBUG_BUILD$1 && debug.log(INSTRUMENTATION_NAME$1, "Handling incoming request");
			const isolationScope = getIsolationScope().clone();
			const request = args[1];
			const response = args[2];
			const normalizedRequest = httpRequestToRequestData(request);
			const ipAddress = request.ip || request.socket?.remoteAddress;
			const url = request.url || "/";
			if (!ignoreIncomingRequestBody?.(url, request) && maxIncomingRequestBodySize !== "none") patchRequestToCaptureBody(request, isolationScope, maxIncomingRequestBodySize);
			isolationScope.setSDKProcessingMetadata({
				normalizedRequest,
				ipAddress
			});
			const bestEffortTransactionName = `${(request.method || "GET").toUpperCase()} ${stripUrlQueryAndFragment(url)}`;
			isolationScope.setTransactionName(bestEffortTransactionName);
			if (instrumentation.getConfig().trackIncomingRequestsAsSessions !== false) recordRequestSession({
				requestIsolationScope: isolationScope,
				response,
				sessionFlushingDelayMS: instrumentation.getConfig().sessionFlushingDelayMS ?? 6e4
			});
			return withIsolationScope(isolationScope, () => {
				getCurrentScope().getPropagationContext().propagationSpanId = generateSpanId();
				if (!instrumentation.getConfig().extractIncomingTraceFromHeader) return target.apply(thisArg, args);
				const ctx = import_src$21.propagation.extract(import_src$21.context.active(), normalizedRequest.headers);
				return import_src$21.context.with(ctx, () => {
					return target.apply(thisArg, args);
				});
			});
		} });
		addNonEnumerableProperty(newEmit, "__sentry_patched__", true);
		server.emit = newEmit;
	}
	/**
	* Check if the given outgoing request should be ignored.
	*/
	_shouldIgnoreOutgoingRequest(request) {
		if (isTracingSuppressed(import_src$21.context.active())) return true;
		const ignoreOutgoingRequests = this.getConfig().ignoreOutgoingRequests;
		if (!ignoreOutgoingRequests) return false;
		const options = getRequestOptions(request);
		return ignoreOutgoingRequests(getRequestUrl(request), options);
	}
};
/** Add a breadcrumb for outgoing requests. */
function addRequestBreadcrumb$1(request, response) {
	const data = getBreadcrumbData$1(request);
	const statusCode = response?.statusCode;
	const level = getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
	addBreadcrumb({
		category: "http",
		data: {
			status_code: statusCode,
			...data
		},
		type: "http",
		level
	}, {
		event: "response",
		request,
		response
	});
}
function getBreadcrumbData$1(request) {
	try {
		const host = request.getHeader("host") || request.host;
		const parsedUrl = parseUrl(new URL(request.path, `${request.protocol}//${host}`).toString());
		const data = {
			url: getSanitizedUrlString(parsedUrl),
			"http.method": request.method || "GET"
		};
		if (parsedUrl.search) data["http.query"] = parsedUrl.search;
		if (parsedUrl.hash) data["http.fragment"] = parsedUrl.hash;
		return data;
	} catch {
		return {};
	}
}
/**
* This method patches the request object to capture the body.
* Instead of actually consuming the streamed body ourselves, which has potential side effects,
* we monkey patch `req.on('data')` to intercept the body chunks.
* This way, we only read the body if the user also consumes the body, ensuring we do not change any behavior in unexpected ways.
*/
function patchRequestToCaptureBody(req, isolationScope, maxIncomingRequestBodySize) {
	let bodyByteLength = 0;
	const chunks = [];
	DEBUG_BUILD$1 && debug.log(INSTRUMENTATION_NAME$1, "Patching request.on");
	/**
	* We need to keep track of the original callbacks, in order to be able to remove listeners again.
	* Since `off` depends on having the exact same function reference passed in, we need to be able to map
	* original listeners to our wrapped ones.
	*/
	const callbackMap = /* @__PURE__ */ new WeakMap();
	const maxBodySize = maxIncomingRequestBodySize === "small" ? 1e3 : maxIncomingRequestBodySize === "medium" ? 1e4 : MAX_BODY_BYTE_LENGTH;
	try {
		req.on = new Proxy(req.on, { apply: (target, thisArg, args) => {
			const [event, listener, ...restArgs] = args;
			if (event === "data") {
				DEBUG_BUILD$1 && debug.log(INSTRUMENTATION_NAME$1, `Handling request.on("data") with maximum body size of ${maxBodySize}b`);
				const callback = new Proxy(listener, { apply: (target, thisArg, args) => {
					try {
						const chunk = args[0];
						const bufferifiedChunk = Buffer.from(chunk);
						if (bodyByteLength < maxBodySize) {
							chunks.push(bufferifiedChunk);
							bodyByteLength += bufferifiedChunk.byteLength;
						} else if (DEBUG_BUILD$1) debug.log(INSTRUMENTATION_NAME$1, `Dropping request body chunk because maximum body length of ${maxBodySize}b is exceeded.`);
					} catch (err) {
						DEBUG_BUILD$1 && debug.error(INSTRUMENTATION_NAME$1, "Encountered error while storing body chunk.");
					}
					return Reflect.apply(target, thisArg, args);
				} });
				callbackMap.set(listener, callback);
				return Reflect.apply(target, thisArg, [
					event,
					callback,
					...restArgs
				]);
			}
			return Reflect.apply(target, thisArg, args);
		} });
		req.off = new Proxy(req.off, { apply: (target, thisArg, args) => {
			const [, listener] = args;
			const callback = callbackMap.get(listener);
			if (callback) {
				callbackMap.delete(listener);
				const modifiedArgs = args.slice();
				modifiedArgs[1] = callback;
				return Reflect.apply(target, thisArg, modifiedArgs);
			}
			return Reflect.apply(target, thisArg, args);
		} });
		req.on("end", () => {
			try {
				const body = Buffer.concat(chunks).toString("utf-8");
				if (body) {
					const truncatedBody = Buffer.byteLength(body, "utf-8") > maxBodySize ? `${Buffer.from(body).subarray(0, maxBodySize - 3).toString("utf-8")}...` : body;
					isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
				}
			} catch (error) {
				if (DEBUG_BUILD$1) debug.error(INSTRUMENTATION_NAME$1, "Error building captured request body", error);
			}
		});
	} catch (error) {
		if (DEBUG_BUILD$1) debug.error(INSTRUMENTATION_NAME$1, "Error patching request to capture body", error);
	}
}
function getRequestOptions(request) {
	return {
		method: request.method,
		protocol: request.protocol,
		host: request.host,
		hostname: request.host,
		path: request.path,
		headers: request.getHeaders()
	};
}
/**
* Starts a session and tracks it in the context of a given isolation scope.
* When the passed response is finished, the session is put into a task and is
* aggregated with other sessions that may happen in a certain time window
* (sessionFlushingDelayMs).
*
* The sessions are always aggregated by the client that is on the current scope
* at the time of ending the response (if there is one).
*/
function recordRequestSession({ requestIsolationScope, response, sessionFlushingDelayMS }) {
	requestIsolationScope.setSDKProcessingMetadata({ requestSession: { status: "ok" } });
	response.once("close", () => {
		const client = getClient();
		const requestSession = requestIsolationScope.getScopeData().sdkProcessingMetadata.requestSession;
		if (client && requestSession) {
			DEBUG_BUILD$1 && debug.log(`Recorded request session with status: ${requestSession.status}`);
			const roundedDate = /* @__PURE__ */ new Date();
			roundedDate.setSeconds(0, 0);
			const dateBucketKey = roundedDate.toISOString();
			const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
			const bucket = existingClientAggregate?.[dateBucketKey] || {
				exited: 0,
				crashed: 0,
				errored: 0
			};
			bucket[{
				ok: "exited",
				crashed: "crashed",
				errored: "errored"
			}[requestSession.status]]++;
			if (existingClientAggregate) existingClientAggregate[dateBucketKey] = bucket;
			else {
				DEBUG_BUILD$1 && debug.log("Opened new request session aggregate.");
				const newClientAggregate = { [dateBucketKey]: bucket };
				clientToRequestSessionAggregatesMap.set(client, newClientAggregate);
				const flushPendingClientAggregates = () => {
					clearTimeout(timeout);
					unregisterClientFlushHook();
					clientToRequestSessionAggregatesMap.delete(client);
					const aggregatePayload = Object.entries(newClientAggregate).map(([timestamp, value]) => ({
						started: timestamp,
						exited: value.exited,
						errored: value.errored,
						crashed: value.crashed
					}));
					client.sendSession({ aggregates: aggregatePayload });
				};
				const unregisterClientFlushHook = client.on("flush", () => {
					DEBUG_BUILD$1 && debug.log("Sending request session aggregate due to client flush");
					flushPendingClientAggregates();
				});
				const timeout = setTimeout(() => {
					DEBUG_BUILD$1 && debug.log("Sending request session aggregate due to flushing schedule");
					flushPendingClientAggregates();
				}, sessionFlushingDelayMS).unref();
			}
		}
	});
}
var clientToRequestSessionAggregatesMap = /* @__PURE__ */ new Map();
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/http/index.js
var INTEGRATION_NAME$32 = "Http";
var instrumentSentryHttp$1 = generateInstrumentOnce(`${INTEGRATION_NAME$32}.sentry`, (options) => {
	return new SentryHttpInstrumentation(options);
});
/**
* The http integration instruments Node's internal http and https modules.
* It creates breadcrumbs for outgoing HTTP requests which will be attached to the currently active span.
*/
var httpIntegration$1 = defineIntegration((options = {}) => {
	const dropSpansForIncomingRequestStatusCodes = options.dropSpansForIncomingRequestStatusCodes ?? [[401, 404], [300, 399]];
	return {
		name: INTEGRATION_NAME$32,
		setupOnce() {
			instrumentSentryHttp$1({
				...options,
				extractIncomingTraceFromHeader: true,
				propagateTraceInOutgoingRequests: true
			});
		},
		processEvent(event) {
			if (event.type === "transaction") {
				const statusCode = event.contexts?.trace?.data?.["http.response.status_code"];
				if (typeof statusCode === "number" && dropSpansForIncomingRequestStatusCodes.some((code) => {
					if (typeof code === "number") return code === statusCode;
					const [min, max] = code;
					return statusCode >= min && statusCode <= max;
				})) return null;
			}
			return event;
		}
	};
});
//#endregion
//#region node_modules/@sentry/node-core/build/esm/nodeVersion.js
var NODE_VERSION = parseSemver(process.versions.node);
var NODE_MAJOR = NODE_VERSION.major;
var NODE_MINOR = NODE_VERSION.minor;
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/node-fetch/SentryNodeFetchInstrumentation.js
init_esm();
init_esm$1();
var SENTRY_TRACE_HEADER = "sentry-trace";
var SENTRY_BAGGAGE_HEADER = "baggage";
var BAGGAGE_HEADER_REGEX = /baggage: (.*)\r\n/;
/**
* This custom node-fetch instrumentation is used to instrument outgoing fetch requests.
* It does not emit any spans.
*
* The reason this is isolated from the OpenTelemetry instrumentation is that users may overwrite this,
* which would lead to Sentry not working as expected.
*
* This is heavily inspired & adapted from:
* https://github.com/open-telemetry/opentelemetry-js-contrib/blob/28e209a9da36bc4e1f8c2b0db7360170ed46cb80/plugins/node/instrumentation-undici/src/undici.ts
*/
var SentryNodeFetchInstrumentation = class extends InstrumentationBase {
	constructor(config = {}) {
		super("@sentry/instrumentation-node-fetch", SDK_VERSION, config);
		this._channelSubs = [];
		this._propagationDecisionMap = new LRUMap(100);
		this._ignoreOutgoingRequestsMap = /* @__PURE__ */ new WeakMap();
	}
	/** No need to instrument files/modules. */
	init() {}
	/** Disable the instrumentation. */
	disable() {
		super.disable();
		this._channelSubs.forEach((sub) => sub.unsubscribe());
		this._channelSubs = [];
	}
	/** Enable the instrumentation. */
	enable() {
		super.enable();
		this._channelSubs = this._channelSubs || [];
		if (this._channelSubs.length > 0) return;
		this._subscribeToChannel("undici:request:create", this._onRequestCreated.bind(this));
		this._subscribeToChannel("undici:request:headers", this._onResponseHeaders.bind(this));
	}
	/**
	* This method is called when a request is created.
	* You can still mutate the request here before it is sent.
	*/
	_onRequestCreated({ request }) {
		if (!(this.getConfig().enabled !== false)) return;
		const shouldIgnore = this._shouldIgnoreOutgoingRequest(request);
		this._ignoreOutgoingRequestsMap.set(request, shouldIgnore);
		if (shouldIgnore) return;
		const url = getAbsoluteUrl$1(request.origin, request.path);
		const tracePropagationTargets = getClient()?.getOptions().tracePropagationTargets;
		const addedHeaders = shouldPropagateTraceForUrl(url, tracePropagationTargets, this._propagationDecisionMap) ? getTraceData$1() : void 0;
		if (!addedHeaders) return;
		const { "sentry-trace": sentryTrace, baggage } = addedHeaders;
		if (Array.isArray(request.headers)) {
			const requestHeaders = request.headers;
			if (sentryTrace && !requestHeaders.includes(SENTRY_TRACE_HEADER)) requestHeaders.push(SENTRY_TRACE_HEADER, sentryTrace);
			const existingBaggagePos = requestHeaders.findIndex((header) => header === SENTRY_BAGGAGE_HEADER);
			if (baggage && existingBaggagePos === -1) requestHeaders.push(SENTRY_BAGGAGE_HEADER, baggage);
			else if (baggage) {
				const existingBaggage = requestHeaders[existingBaggagePos + 1];
				const merged = mergeBaggageHeaders(existingBaggage, baggage);
				if (merged) requestHeaders[existingBaggagePos + 1] = merged;
			}
		} else {
			const requestHeaders = request.headers;
			if (sentryTrace && !requestHeaders.includes(`${SENTRY_TRACE_HEADER}:`)) request.headers += `${SENTRY_TRACE_HEADER}: ${sentryTrace}\r\n`;
			const existingBaggage = request.headers.match(BAGGAGE_HEADER_REGEX)?.[1];
			if (baggage && !existingBaggage) request.headers += `${SENTRY_BAGGAGE_HEADER}: ${baggage}\r\n`;
			else if (baggage) {
				const merged = mergeBaggageHeaders(existingBaggage, baggage);
				if (merged) request.headers = request.headers.replace(BAGGAGE_HEADER_REGEX, `baggage: ${merged}\r\n`);
			}
		}
	}
	/**
	* This method is called when a response is received.
	*/
	_onResponseHeaders({ request, response }) {
		const config = this.getConfig();
		if (!(config.enabled !== false)) return;
		const _breadcrumbs = config.breadcrumbs;
		const breadCrumbsEnabled = typeof _breadcrumbs === "undefined" ? true : _breadcrumbs;
		const shouldIgnore = this._ignoreOutgoingRequestsMap.get(request);
		if (breadCrumbsEnabled && !shouldIgnore) addRequestBreadcrumb(request, response);
	}
	/** Subscribe to a diagnostics channel. */
	_subscribeToChannel(diagnosticChannel, onMessage) {
		const useNewSubscribe = NODE_MAJOR > 18 || NODE_MAJOR === 18 && NODE_MINOR >= 19;
		let unsubscribe;
		if (useNewSubscribe) {
			diagch.subscribe?.(diagnosticChannel, onMessage);
			unsubscribe = () => diagch.unsubscribe?.(diagnosticChannel, onMessage);
		} else {
			const channel = diagch.channel(diagnosticChannel);
			channel.subscribe(onMessage);
			unsubscribe = () => channel.unsubscribe(onMessage);
		}
		this._channelSubs.push({
			name: diagnosticChannel,
			unsubscribe
		});
	}
	/**
	* Check if the given outgoing request should be ignored.
	*/
	_shouldIgnoreOutgoingRequest(request) {
		if (isTracingSuppressed(import_src$21.context.active())) return true;
		const url = getAbsoluteUrl$1(request.origin, request.path);
		const ignoreOutgoingRequests = this.getConfig().ignoreOutgoingRequests;
		if (typeof ignoreOutgoingRequests !== "function" || !url) return false;
		return ignoreOutgoingRequests(url);
	}
};
/** Add a breadcrumb for outgoing requests. */
function addRequestBreadcrumb(request, response) {
	const data = getBreadcrumbData(request);
	const statusCode = response.statusCode;
	const level = getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
	addBreadcrumb({
		category: "http",
		data: {
			status_code: statusCode,
			...data
		},
		type: "http",
		level
	}, {
		event: "response",
		request,
		response
	});
}
function getBreadcrumbData(request) {
	try {
		const parsedUrl = parseUrl(getAbsoluteUrl$1(request.origin, request.path));
		const data = {
			url: getSanitizedUrlString(parsedUrl),
			"http.method": request.method || "GET"
		};
		if (parsedUrl.search) data["http.query"] = parsedUrl.search;
		if (parsedUrl.hash) data["http.fragment"] = parsedUrl.hash;
		return data;
	} catch {
		return {};
	}
}
function getAbsoluteUrl$1(origin, path = "/") {
	try {
		return new URL(path, origin).toString();
	} catch {
		const url = `${origin}`;
		if (url.endsWith("/") && path.startsWith("/")) return `${url}${path.slice(1)}`;
		if (!url.endsWith("/") && !path.startsWith("/")) return `${url}/${path.slice(1)}`;
		return `${url}${path}`;
	}
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/node-fetch/index.js
var instrumentSentryNodeFetch$1 = generateInstrumentOnce(`NodeFetch.sentry`, SentryNodeFetchInstrumentation, (options) => {
	return options;
});
var _nativeNodeFetchIntegration$1 = ((options = {}) => {
	return {
		name: "NodeFetch",
		setupOnce() {
			instrumentSentryNodeFetch$1(options);
		}
	};
});
var nativeNodeFetchIntegration$1 = defineIntegration(_nativeNodeFetchIntegration$1);
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/context.js
var readFileAsync = promisify(readFile);
var readDirAsync = promisify(readdir);
var INTEGRATION_NAME$31 = "Context";
var _nodeContextIntegration = ((options = {}) => {
	let cachedContext;
	const _options = {
		app: true,
		os: true,
		device: true,
		culture: true,
		cloudResource: true,
		...options
	};
	/** Add contexts to the event. Caches the context so we only look it up once. */
	async function addContext(event) {
		if (cachedContext === void 0) cachedContext = _getContexts();
		const updatedContext = _updateContext(await cachedContext);
		event.contexts = {
			...event.contexts,
			app: {
				...updatedContext.app,
				...event.contexts?.app
			},
			os: {
				...updatedContext.os,
				...event.contexts?.os
			},
			device: {
				...updatedContext.device,
				...event.contexts?.device
			},
			culture: {
				...updatedContext.culture,
				...event.contexts?.culture
			},
			cloud_resource: {
				...updatedContext.cloud_resource,
				...event.contexts?.cloud_resource
			}
		};
		return event;
	}
	/** Get the contexts from node. */
	async function _getContexts() {
		const contexts = {};
		if (_options.os) contexts.os = await getOsContext();
		if (_options.app) contexts.app = getAppContext();
		if (_options.device) contexts.device = getDeviceContext(_options.device);
		if (_options.culture) {
			const culture = getCultureContext();
			if (culture) contexts.culture = culture;
		}
		if (_options.cloudResource) contexts.cloud_resource = getCloudResourceContext();
		return contexts;
	}
	return {
		name: INTEGRATION_NAME$31,
		processEvent(event) {
			return addContext(event);
		}
	};
});
/**
* Capture context about the environment and the device that the client is running on, to events.
*/
var nodeContextIntegration = defineIntegration(_nodeContextIntegration);
/**
* Updates the context with dynamic values that can change
*/
function _updateContext(contexts) {
	if (contexts.app?.app_memory) contexts.app.app_memory = process.memoryUsage().rss;
	if (contexts.app?.free_memory && typeof process.availableMemory === "function") {
		const freeMemory = process.availableMemory?.();
		if (freeMemory != null) contexts.app.free_memory = freeMemory;
	}
	if (contexts.device?.free_memory) contexts.device.free_memory = os.freemem();
	return contexts;
}
/**
* Returns the operating system context.
*
* Based on the current platform, this uses a different strategy to provide the
* most accurate OS information. Since this might involve spawning subprocesses
* or accessing the file system, this should only be executed lazily and cached.
*
*  - On macOS (Darwin), this will execute the `sw_vers` utility. The context
*    has a `name`, `version`, `build` and `kernel_version` set.
*  - On Linux, this will try to load a distribution release from `/etc` and set
*    the `name`, `version` and `kernel_version` fields.
*  - On all other platforms, only a `name` and `version` will be returned. Note
*    that `version` might actually be the kernel version.
*/
async function getOsContext() {
	const platformId = os.platform();
	switch (platformId) {
		case "darwin": return getDarwinInfo();
		case "linux": return getLinuxInfo();
		default: return {
			name: PLATFORM_NAMES[platformId] || platformId,
			version: os.release()
		};
	}
}
function getCultureContext() {
	try {
		if (typeof process.versions.icu !== "string") return;
		const january = /* @__PURE__ */ new Date(9e8);
		if (new Intl.DateTimeFormat("es", { month: "long" }).format(january) === "enero") {
			const options = Intl.DateTimeFormat().resolvedOptions();
			return {
				locale: options.locale,
				timezone: options.timeZone
			};
		}
	} catch {}
}
/**
* Get app context information from process
*/
function getAppContext() {
	const app_memory = process.memoryUsage().rss;
	const appContext = {
		app_start_time: (/* @__PURE__ */ new Date(Date.now() - process.uptime() * 1e3)).toISOString(),
		app_memory
	};
	if (typeof process.availableMemory === "function") {
		const freeMemory = process.availableMemory?.();
		if (freeMemory != null) appContext.free_memory = freeMemory;
	}
	return appContext;
}
/**
* Gets device information from os
*/
function getDeviceContext(deviceOpt) {
	const device = {};
	let uptime;
	try {
		uptime = os.uptime();
	} catch {}
	if (typeof uptime === "number") device.boot_time = (/* @__PURE__ */ new Date(Date.now() - uptime * 1e3)).toISOString();
	device.arch = os.arch();
	if (deviceOpt === true || deviceOpt.memory) {
		device.memory_size = os.totalmem();
		device.free_memory = os.freemem();
	}
	if (deviceOpt === true || deviceOpt.cpu) {
		const cpuInfo = os.cpus();
		const firstCpu = cpuInfo?.[0];
		if (firstCpu) {
			device.processor_count = cpuInfo.length;
			device.cpu_description = firstCpu.model;
			device.processor_frequency = firstCpu.speed;
		}
	}
	return device;
}
/** Mapping of Node's platform names to actual OS names. */
var PLATFORM_NAMES = {
	aix: "IBM AIX",
	freebsd: "FreeBSD",
	openbsd: "OpenBSD",
	sunos: "SunOS",
	win32: "Windows"
};
/** Linux version file to check for a distribution. */
/** Mapping of linux release files located in /etc to distributions. */
var LINUX_DISTROS = [
	{
		name: "fedora-release",
		distros: ["Fedora"]
	},
	{
		name: "redhat-release",
		distros: ["Red Hat Linux", "Centos"]
	},
	{
		name: "redhat_version",
		distros: ["Red Hat Linux"]
	},
	{
		name: "SuSE-release",
		distros: ["SUSE Linux"]
	},
	{
		name: "lsb-release",
		distros: ["Ubuntu Linux", "Arch Linux"]
	},
	{
		name: "debian_version",
		distros: ["Debian"]
	},
	{
		name: "debian_release",
		distros: ["Debian"]
	},
	{
		name: "arch-release",
		distros: ["Arch Linux"]
	},
	{
		name: "gentoo-release",
		distros: ["Gentoo Linux"]
	},
	{
		name: "novell-release",
		distros: ["SUSE Linux"]
	},
	{
		name: "alpine-release",
		distros: ["Alpine Linux"]
	}
];
/** Functions to extract the OS version from Linux release files. */
var LINUX_VERSIONS = {
	alpine: (content) => content,
	arch: (content) => matchFirst(/distrib_release=(.*)/, content),
	centos: (content) => matchFirst(/release ([^ ]+)/, content),
	debian: (content) => content,
	fedora: (content) => matchFirst(/release (..)/, content),
	mint: (content) => matchFirst(/distrib_release=(.*)/, content),
	red: (content) => matchFirst(/release ([^ ]+)/, content),
	suse: (content) => matchFirst(/VERSION = (.*)\n/, content),
	ubuntu: (content) => matchFirst(/distrib_release=(.*)/, content)
};
/**
* Executes a regular expression with one capture group.
*
* @param regex A regular expression to execute.
* @param text Content to execute the RegEx on.
* @returns The captured string if matched; otherwise undefined.
*/
function matchFirst(regex, text) {
	const match = regex.exec(text);
	return match ? match[1] : void 0;
}
/** Loads the macOS operating system context. */
async function getDarwinInfo() {
	const darwinInfo = {
		kernel_version: os.release(),
		name: "Mac OS X",
		version: `10.${Number(os.release().split(".")[0]) - 4}`
	};
	try {
		const output = await new Promise((resolve, reject) => {
			execFile("/usr/bin/sw_vers", (error, stdout) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(stdout);
			});
		});
		darwinInfo.name = matchFirst(/^ProductName:\s+(.*)$/m, output);
		darwinInfo.version = matchFirst(/^ProductVersion:\s+(.*)$/m, output);
		darwinInfo.build = matchFirst(/^BuildVersion:\s+(.*)$/m, output);
	} catch {}
	return darwinInfo;
}
/** Returns a distribution identifier to look up version callbacks. */
function getLinuxDistroId(name) {
	return name.split(" ")[0].toLowerCase();
}
/** Loads the Linux operating system context. */
async function getLinuxInfo() {
	const linuxInfo = {
		kernel_version: os.release(),
		name: "Linux"
	};
	try {
		const etcFiles = await readDirAsync("/etc");
		const distroFile = LINUX_DISTROS.find((file) => etcFiles.includes(file.name));
		if (!distroFile) return linuxInfo;
		const contents = (await readFileAsync(join("/etc", distroFile.name), { encoding: "utf-8" })).toLowerCase();
		const { distros } = distroFile;
		linuxInfo.name = distros.find((d) => contents.indexOf(getLinuxDistroId(d)) >= 0) || distros[0];
		linuxInfo.version = LINUX_VERSIONS[getLinuxDistroId(linuxInfo.name)]?.(contents);
	} catch {}
	return linuxInfo;
}
/**
* Grabs some information about hosting provider based on best effort.
*/
function getCloudResourceContext() {
	if (process.env.VERCEL) return {
		"cloud.provider": "vercel",
		"cloud.region": process.env.VERCEL_REGION
	};
	else if (process.env.AWS_REGION) return {
		"cloud.provider": "aws",
		"cloud.region": process.env.AWS_REGION,
		"cloud.platform": process.env.AWS_EXECUTION_ENV
	};
	else if (process.env.GCP_PROJECT) return { "cloud.provider": "gcp" };
	else if (process.env.ALIYUN_REGION_ID) return {
		"cloud.provider": "alibaba_cloud",
		"cloud.region": process.env.ALIYUN_REGION_ID
	};
	else if (process.env.WEBSITE_SITE_NAME && process.env.REGION_NAME) return {
		"cloud.provider": "azure",
		"cloud.region": process.env.REGION_NAME
	};
	else if (process.env.IBM_CLOUD_REGION) return {
		"cloud.provider": "ibm_cloud",
		"cloud.region": process.env.IBM_CLOUD_REGION
	};
	else if (process.env.TENCENTCLOUD_REGION) return {
		"cloud.provider": "tencent_cloud",
		"cloud.region": process.env.TENCENTCLOUD_REGION,
		"cloud.account.id": process.env.TENCENTCLOUD_APPID,
		"cloud.availability_zone": process.env.TENCENTCLOUD_ZONE
	};
	else if (process.env.NETLIFY) return { "cloud.provider": "netlify" };
	else if (process.env.FLY_REGION) return {
		"cloud.provider": "fly.io",
		"cloud.region": process.env.FLY_REGION
	};
	else if (process.env.DYNO) return { "cloud.provider": "heroku" };
	else return;
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/contextlines.js
var LRU_FILE_CONTENTS_CACHE = new LRUMap(10);
var LRU_FILE_CONTENTS_FS_READ_FAILED = new LRUMap(20);
var DEFAULT_LINES_OF_CONTEXT = 7;
var INTEGRATION_NAME$30 = "ContextLines";
/**
* Get or init map value
*/
function emplace(map, key, contents) {
	const value = map.get(key);
	if (value === void 0) {
		map.set(key, contents);
		return contents;
	}
	return value;
}
/**
* Determines if context lines should be skipped for a file.
* - .min.(mjs|cjs|js) files are and not useful since they dont point to the original source
* - node: prefixed modules are part of the runtime and cannot be resolved to a file
* - data: skip json, wasm and inline js https://nodejs.org/api/esm.html#data-imports
*/
function shouldSkipContextLinesForFile(path) {
	if (path.startsWith("node:")) return true;
	if (path.endsWith(".min.js")) return true;
	if (path.endsWith(".min.cjs")) return true;
	if (path.endsWith(".min.mjs")) return true;
	if (path.startsWith("data:")) return true;
	return false;
}
/**
* Determines if we should skip contextlines based off the max lineno and colno values.
*/
function shouldSkipContextLinesForFrame(frame) {
	if (frame.lineno !== void 0 && frame.lineno > 1e4) return true;
	if (frame.colno !== void 0 && frame.colno > 1e3) return true;
	return false;
}
/**
* Checks if we have all the contents that we need in the cache.
*/
function rangeExistsInContentCache(file, range) {
	const contents = LRU_FILE_CONTENTS_CACHE.get(file);
	if (contents === void 0) return false;
	for (let i = range[0]; i <= range[1]; i++) if (contents[i] === void 0) return false;
	return true;
}
/**
* Creates contiguous ranges of lines to read from a file. In the case where context lines overlap,
* the ranges are merged to create a single range.
*/
function makeLineReaderRanges(lines, linecontext) {
	if (!lines.length) return [];
	let i = 0;
	const line = lines[0];
	if (typeof line !== "number") return [];
	let current = makeContextRange(line, linecontext);
	const out = [];
	while (true) {
		if (i === lines.length - 1) {
			out.push(current);
			break;
		}
		const next = lines[i + 1];
		if (typeof next !== "number") break;
		if (next <= current[1]) current[1] = next + linecontext;
		else {
			out.push(current);
			current = makeContextRange(next, linecontext);
		}
		i++;
	}
	return out;
}
/**
* Extracts lines from a file and stores them in a cache.
*/
function getContextLinesFromFile(path, ranges, output) {
	return new Promise((resolve, _reject) => {
		const stream = createReadStream(path);
		const lineReaded = createInterface({ input: stream });
		function destroyStreamAndResolve() {
			stream.destroy();
			resolve();
		}
		let lineNumber = 0;
		let currentRangeIndex = 0;
		const range = ranges[currentRangeIndex];
		if (range === void 0) {
			destroyStreamAndResolve();
			return;
		}
		let rangeStart = range[0];
		let rangeEnd = range[1];
		function onStreamError(e) {
			LRU_FILE_CONTENTS_FS_READ_FAILED.set(path, 1);
			DEBUG_BUILD$1 && debug.error(`Failed to read file: ${path}. Error: ${e}`);
			lineReaded.close();
			lineReaded.removeAllListeners();
			destroyStreamAndResolve();
		}
		stream.on("error", onStreamError);
		lineReaded.on("error", onStreamError);
		lineReaded.on("close", destroyStreamAndResolve);
		lineReaded.on("line", (line) => {
			lineNumber++;
			if (lineNumber < rangeStart) return;
			output[lineNumber] = snipLine(line, 0);
			if (lineNumber >= rangeEnd) {
				if (currentRangeIndex === ranges.length - 1) {
					lineReaded.close();
					lineReaded.removeAllListeners();
					return;
				}
				currentRangeIndex++;
				const range = ranges[currentRangeIndex];
				if (range === void 0) {
					lineReaded.close();
					lineReaded.removeAllListeners();
					return;
				}
				rangeStart = range[0];
				rangeEnd = range[1];
			}
		});
	});
}
/**
* Adds surrounding (context) lines of the line that an exception occurred on to the event.
* This is done by reading the file line by line and extracting the lines. The extracted lines are stored in
* a cache to prevent multiple reads of the same file. Failures to read a file are similarly cached to prevent multiple
* failing reads from happening.
*/
async function addSourceContext(event, contextLines) {
	const filesToLines = {};
	if (contextLines > 0 && event.exception?.values) for (const exception of event.exception.values) {
		if (!exception.stacktrace?.frames?.length) continue;
		for (let i = exception.stacktrace.frames.length - 1; i >= 0; i--) {
			const frame = exception.stacktrace.frames[i];
			const filename = frame?.filename;
			if (!frame || typeof filename !== "string" || typeof frame.lineno !== "number" || shouldSkipContextLinesForFile(filename) || shouldSkipContextLinesForFrame(frame)) continue;
			if (!filesToLines[filename]) filesToLines[filename] = [];
			filesToLines[filename].push(frame.lineno);
		}
	}
	const files = Object.keys(filesToLines);
	if (files.length == 0) return event;
	const readlinePromises = [];
	for (const file of files) {
		if (LRU_FILE_CONTENTS_FS_READ_FAILED.get(file)) continue;
		const filesToLineRanges = filesToLines[file];
		if (!filesToLineRanges) continue;
		filesToLineRanges.sort((a, b) => a - b);
		const ranges = makeLineReaderRanges(filesToLineRanges, contextLines);
		if (ranges.every((r) => rangeExistsInContentCache(file, r))) continue;
		const cache = emplace(LRU_FILE_CONTENTS_CACHE, file, {});
		readlinePromises.push(getContextLinesFromFile(file, ranges, cache));
	}
	await Promise.all(readlinePromises).catch(() => {
		DEBUG_BUILD$1 && debug.log("Failed to read one or more source files and resolve context lines");
	});
	if (contextLines > 0 && event.exception?.values) {
		for (const exception of event.exception.values) if (exception.stacktrace?.frames && exception.stacktrace.frames.length > 0) addSourceContextToFrames(exception.stacktrace.frames, contextLines, LRU_FILE_CONTENTS_CACHE);
	}
	return event;
}
/** Adds context lines to frames */
function addSourceContextToFrames(frames, contextLines, cache) {
	for (const frame of frames) if (frame.filename && frame.context_line === void 0 && typeof frame.lineno === "number") {
		const contents = cache.get(frame.filename);
		if (contents === void 0) continue;
		addContextToFrame(frame.lineno, frame, contextLines, contents);
	}
}
/**
* Clears the context lines from a frame, used to reset a frame to its original state
* if we fail to resolve all context lines for it.
*/
function clearLineContext(frame) {
	delete frame.pre_context;
	delete frame.context_line;
	delete frame.post_context;
}
/**
* Resolves context lines before and after the given line number and appends them to the frame;
*/
function addContextToFrame(lineno, frame, contextLines, contents) {
	if (frame.lineno === void 0 || contents === void 0) {
		DEBUG_BUILD$1 && debug.error("Cannot resolve context for frame with no lineno or file contents");
		return;
	}
	frame.pre_context = [];
	for (let i = makeRangeStart(lineno, contextLines); i < lineno; i++) {
		const line = contents[i];
		if (line === void 0) {
			clearLineContext(frame);
			DEBUG_BUILD$1 && debug.error(`Could not find line ${i} in file ${frame.filename}`);
			return;
		}
		frame.pre_context.push(line);
	}
	if (contents[lineno] === void 0) {
		clearLineContext(frame);
		DEBUG_BUILD$1 && debug.error(`Could not find line ${lineno} in file ${frame.filename}`);
		return;
	}
	frame.context_line = contents[lineno];
	const end = makeRangeEnd(lineno, contextLines);
	frame.post_context = [];
	for (let i = lineno + 1; i <= end; i++) {
		const line = contents[i];
		if (line === void 0) break;
		frame.post_context.push(line);
	}
}
function makeRangeStart(line, linecontext) {
	return Math.max(1, line - linecontext);
}
function makeRangeEnd(line, linecontext) {
	return line + linecontext;
}
function makeContextRange(line, linecontext) {
	return [makeRangeStart(line, linecontext), makeRangeEnd(line, linecontext)];
}
/** Exported only for tests, as a type-safe variant. */
var _contextLinesIntegration = ((options = {}) => {
	const contextLines = options.frameContextLines !== void 0 ? options.frameContextLines : DEFAULT_LINES_OF_CONTEXT;
	return {
		name: INTEGRATION_NAME$30,
		processEvent(event) {
			return addSourceContext(event, contextLines);
		}
	};
});
/**
* Capture the lines before and after the frame's context.
*/
var contextLinesIntegration = defineIntegration(_contextLinesIntegration);
//#endregion
//#region node_modules/@sentry/node-core/build/esm/utils/debug.js
var cachedDebuggerEnabled;
/**
* Was the debugger enabled when this function was first called?
*/
async function isDebuggerEnabled() {
	if (cachedDebuggerEnabled === void 0) try {
		cachedDebuggerEnabled = !!(await import("node:inspector")).url();
	} catch {
		cachedDebuggerEnabled = false;
	}
	return cachedDebuggerEnabled;
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/local-variables/common.js
/**
* The key used to store the local variables on the error object.
*/
var LOCAL_VARIABLES_KEY = "__SENTRY_ERROR_LOCAL_VARIABLES__";
/**
* Creates a rate limiter that will call the disable callback when the rate limit is reached and the enable callback
* when a timeout has occurred.
* @param maxPerSecond Maximum number of calls per second
* @param enable Callback to enable capture
* @param disable Callback to disable capture
* @returns A function to call to increment the rate limiter count
*/
function createRateLimiter(maxPerSecond, enable, disable) {
	let count = 0;
	let retrySeconds = 5;
	let disabledTimeout = 0;
	setInterval(() => {
		if (disabledTimeout === 0) {
			if (count > maxPerSecond) {
				retrySeconds *= 2;
				disable(retrySeconds);
				if (retrySeconds > 86400) retrySeconds = 86400;
				disabledTimeout = retrySeconds;
			}
		} else {
			disabledTimeout -= 1;
			if (disabledTimeout === 0) enable();
		}
		count = 0;
	}, 1e3).unref();
	return () => {
		count += 1;
	};
}
/** Could this be an anonymous function? */
function isAnonymous(name) {
	return name !== void 0 && (name.length === 0 || name === "?" || name === "<anonymous>");
}
/** Do the function names appear to match? */
function functionNamesMatch(a, b) {
	return a === b || `Object.${a}` === b || a === `Object.${b}` || isAnonymous(a) && isAnonymous(b);
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/local-variables/local-variables-async.js
var base64WorkerScript = "LyohIEBzZW50cnkvbm9kZS1jb3JlIDkuNDcuMSAoNDExZTEwMikgfCBodHRwczovL2dpdGh1Yi5jb20vZ2V0c2VudHJ5L3NlbnRyeS1qYXZhc2NyaXB0ICovCmltcG9ydHtTZXNzaW9uIGFzIGV9ZnJvbSJub2RlOmluc3BlY3Rvci9wcm9taXNlcyI7aW1wb3J0e3dvcmtlckRhdGEgYXMgdH1mcm9tIm5vZGU6d29ya2VyX3RocmVhZHMiO2NvbnN0IG49Z2xvYmFsVGhpcyxpPXt9O2NvbnN0IG89Il9fU0VOVFJZX0VSUk9SX0xPQ0FMX1ZBUklBQkxFU19fIjtjb25zdCBhPXQ7ZnVuY3Rpb24gcyguLi5lKXthLmRlYnVnJiZmdW5jdGlvbihlKXtpZighKCJjb25zb2xlImluIG4pKXJldHVybiBlKCk7Y29uc3QgdD1uLmNvbnNvbGUsbz17fSxhPU9iamVjdC5rZXlzKGkpO2EuZm9yRWFjaChlPT57Y29uc3Qgbj1pW2VdO29bZV09dFtlXSx0W2VdPW59KTt0cnl7cmV0dXJuIGUoKX1maW5hbGx5e2EuZm9yRWFjaChlPT57dFtlXT1vW2VdfSl9fSgoKT0+Y29uc29sZS5sb2coIltMb2NhbFZhcmlhYmxlcyBXb3JrZXJdIiwuLi5lKSl9YXN5bmMgZnVuY3Rpb24gYyhlLHQsbixpKXtjb25zdCBvPWF3YWl0IGUucG9zdCgiUnVudGltZS5nZXRQcm9wZXJ0aWVzIix7b2JqZWN0SWQ6dCxvd25Qcm9wZXJ0aWVzOiEwfSk7aVtuXT1vLnJlc3VsdC5maWx0ZXIoZT0+Imxlbmd0aCIhPT1lLm5hbWUmJiFpc05hTihwYXJzZUludChlLm5hbWUsMTApKSkuc29ydCgoZSx0KT0+cGFyc2VJbnQoZS5uYW1lLDEwKS1wYXJzZUludCh0Lm5hbWUsMTApKS5tYXAoZT0+ZS52YWx1ZT8udmFsdWUpfWFzeW5jIGZ1bmN0aW9uIHIoZSx0LG4saSl7Y29uc3Qgbz1hd2FpdCBlLnBvc3QoIlJ1bnRpbWUuZ2V0UHJvcGVydGllcyIse29iamVjdElkOnQsb3duUHJvcGVydGllczohMH0pO2lbbl09by5yZXN1bHQubWFwKGU9PltlLm5hbWUsZS52YWx1ZT8udmFsdWVdKS5yZWR1Y2UoKGUsW3Qsbl0pPT4oZVt0XT1uLGUpLHt9KX1mdW5jdGlvbiB1KGUsdCl7ZS52YWx1ZSYmKCJ2YWx1ZSJpbiBlLnZhbHVlP3ZvaWQgMD09PWUudmFsdWUudmFsdWV8fG51bGw9PT1lLnZhbHVlLnZhbHVlP3RbZS5uYW1lXT1gPCR7ZS52YWx1ZS52YWx1ZX0+YDp0W2UubmFtZV09ZS52YWx1ZS52YWx1ZToiZGVzY3JpcHRpb24iaW4gZS52YWx1ZSYmImZ1bmN0aW9uIiE9PWUudmFsdWUudHlwZT90W2UubmFtZV09YDwke2UudmFsdWUuZGVzY3JpcHRpb259PmA6InVuZGVmaW5lZCI9PT1lLnZhbHVlLnR5cGUmJih0W2UubmFtZV09Ijx1bmRlZmluZWQ+IikpfWFzeW5jIGZ1bmN0aW9uIGwoZSx0KXtjb25zdCBuPWF3YWl0IGUucG9zdCgiUnVudGltZS5nZXRQcm9wZXJ0aWVzIix7b2JqZWN0SWQ6dCxvd25Qcm9wZXJ0aWVzOiEwfSksaT17fTtmb3IoY29uc3QgdCBvZiBuLnJlc3VsdClpZih0LnZhbHVlPy5vYmplY3RJZCYmIkFycmF5Ij09PXQudmFsdWUuY2xhc3NOYW1lKXtjb25zdCBuPXQudmFsdWUub2JqZWN0SWQ7YXdhaXQgYyhlLG4sdC5uYW1lLGkpfWVsc2UgaWYodC52YWx1ZT8ub2JqZWN0SWQmJiJPYmplY3QiPT09dC52YWx1ZS5jbGFzc05hbWUpe2NvbnN0IG49dC52YWx1ZS5vYmplY3RJZDthd2FpdCByKGUsbix0Lm5hbWUsaSl9ZWxzZSB0LnZhbHVlJiZ1KHQsaSk7cmV0dXJuIGl9bGV0IGY7KGFzeW5jIGZ1bmN0aW9uKCl7Y29uc3QgdD1uZXcgZTt0LmNvbm5lY3RUb01haW5UaHJlYWQoKSxzKCJDb25uZWN0ZWQgdG8gbWFpbiB0aHJlYWQiKTtsZXQgbj0hMTt0Lm9uKCJEZWJ1Z2dlci5yZXN1bWVkIiwoKT0+e249ITF9KSx0Lm9uKCJEZWJ1Z2dlci5wYXVzZWQiLGU9PntuPSEwLGFzeW5jIGZ1bmN0aW9uKGUse3JlYXNvbjp0LGRhdGE6e29iamVjdElkOm59LGNhbGxGcmFtZXM6aX0pe2lmKCJleGNlcHRpb24iIT09dCYmInByb21pc2VSZWplY3Rpb24iIT09dClyZXR1cm47aWYoZj8uKCksbnVsbD09bilyZXR1cm47Y29uc3QgYT1bXTtmb3IobGV0IHQ9MDt0PGkubGVuZ3RoO3QrKyl7Y29uc3R7c2NvcGVDaGFpbjpuLGZ1bmN0aW9uTmFtZTpvLHRoaXM6c309aVt0XSxjPW4uZmluZChlPT4ibG9jYWwiPT09ZS50eXBlKSxyPSJnbG9iYWwiIT09cy5jbGFzc05hbWUmJnMuY2xhc3NOYW1lP2Ake3MuY2xhc3NOYW1lfS4ke299YDpvO2lmKHZvaWQgMD09PWM/Lm9iamVjdC5vYmplY3RJZClhW3RdPXtmdW5jdGlvbjpyfTtlbHNle2NvbnN0IG49YXdhaXQgbChlLGMub2JqZWN0Lm9iamVjdElkKTthW3RdPXtmdW5jdGlvbjpyLHZhcnM6bn19fWF3YWl0IGUucG9zdCgiUnVudGltZS5jYWxsRnVuY3Rpb25PbiIse2Z1bmN0aW9uRGVjbGFyYXRpb246YGZ1bmN0aW9uKCkgeyB0aGlzLiR7b30gPSB0aGlzLiR7b30gfHwgJHtKU09OLnN0cmluZ2lmeShhKX07IH1gLHNpbGVudDohMCxvYmplY3RJZDpufSksYXdhaXQgZS5wb3N0KCJSdW50aW1lLnJlbGVhc2VPYmplY3QiLHtvYmplY3RJZDpufSl9KHQsZS5wYXJhbXMpLnRoZW4oYXN5bmMoKT0+e24mJmF3YWl0IHQucG9zdCgiRGVidWdnZXIucmVzdW1lIil9LGFzeW5jIGU9PntuJiZhd2FpdCB0LnBvc3QoIkRlYnVnZ2VyLnJlc3VtZSIpfSl9KSxhd2FpdCB0LnBvc3QoIkRlYnVnZ2VyLmVuYWJsZSIpO2NvbnN0IGk9ITEhPT1hLmNhcHR1cmVBbGxFeGNlcHRpb25zO2lmKGF3YWl0IHQucG9zdCgiRGVidWdnZXIuc2V0UGF1c2VPbkV4Y2VwdGlvbnMiLHtzdGF0ZTppPyJhbGwiOiJ1bmNhdWdodCJ9KSxpKXtjb25zdCBlPWEubWF4RXhjZXB0aW9uc1BlclNlY29uZHx8NTA7Zj1mdW5jdGlvbihlLHQsbil7bGV0IGk9MCxvPTUsYT0wO3JldHVybiBzZXRJbnRlcnZhbCgoKT0+ezA9PT1hP2k+ZSYmKG8qPTIsbihvKSxvPjg2NDAwJiYobz04NjQwMCksYT1vKTooYS09MSwwPT09YSYmdCgpKSxpPTB9LDFlMykudW5yZWYoKSwoKT0+e2krPTF9fShlLGFzeW5jKCk9PntzKCJSYXRlLWxpbWl0IGxpZnRlZC4iKSxhd2FpdCB0LnBvc3QoIkRlYnVnZ2VyLnNldFBhdXNlT25FeGNlcHRpb25zIix7c3RhdGU6ImFsbCJ9KX0sYXN5bmMgZT0+e3MoYFJhdGUtbGltaXQgZXhjZWVkZWQuIERpc2FibGluZyBjYXB0dXJpbmcgb2YgY2F1Z2h0IGV4Y2VwdGlvbnMgZm9yICR7ZX0gc2Vjb25kcy5gKSxhd2FpdCB0LnBvc3QoIkRlYnVnZ2VyLnNldFBhdXNlT25FeGNlcHRpb25zIix7c3RhdGU6InVuY2F1Z2h0In0pfSl9fSkoKS5jYXRjaChlPT57cygiRmFpbGVkIHRvIHN0YXJ0IGRlYnVnZ2VyIixlKX0pLHNldEludGVydmFsKCgpPT57fSwxZTQpOw==";
function log(...args) {
	debug.log("[LocalVariables]", ...args);
}
/**
* Adds local variables to exception frames
*/
var localVariablesAsyncIntegration = defineIntegration(((integrationOptions = {}) => {
	function addLocalVariablesToException(exception, localVariables) {
		const frames = (exception.stacktrace?.frames || []).filter((frame) => frame.function !== "new Promise");
		for (let i = 0; i < frames.length; i++) {
			const frameIndex = frames.length - i - 1;
			const frameLocalVariables = localVariables[i];
			const frame = frames[frameIndex];
			if (!frame || !frameLocalVariables) break;
			if (frameLocalVariables.vars === void 0 || frame.in_app === false || !functionNamesMatch(frame.function, frameLocalVariables.function)) continue;
			frame.vars = frameLocalVariables.vars;
		}
	}
	function addLocalVariablesToEvent(event, hint) {
		if (hint.originalException && typeof hint.originalException === "object" && "__SENTRY_ERROR_LOCAL_VARIABLES__" in hint.originalException && Array.isArray(hint.originalException["__SENTRY_ERROR_LOCAL_VARIABLES__"])) {
			for (const exception of event.exception?.values || []) addLocalVariablesToException(exception, hint.originalException[LOCAL_VARIABLES_KEY]);
			hint.originalException[LOCAL_VARIABLES_KEY] = void 0;
		}
		return event;
	}
	async function startInspector() {
		const inspector = await import("node:inspector");
		if (!inspector.url()) inspector.open(0);
	}
	function startWorker(options) {
		const worker = new Worker(new URL(`data:application/javascript;base64,${base64WorkerScript}`), {
			workerData: options,
			execArgv: [],
			env: {
				...process.env,
				NODE_OPTIONS: void 0
			}
		});
		process.on("exit", () => {
			worker.terminate();
		});
		worker.once("error", (err) => {
			log("Worker error", err);
		});
		worker.once("exit", (code) => {
			log("Worker exit", code);
		});
		worker.unref();
	}
	return {
		name: "LocalVariablesAsync",
		async setup(client) {
			if (!client.getOptions().includeLocalVariables) return;
			if (await isDebuggerEnabled()) {
				debug.warn("Local variables capture has been disabled because the debugger was already enabled");
				return;
			}
			const options = {
				...integrationOptions,
				debug: debug.isEnabled()
			};
			startInspector().then(() => {
				try {
					startWorker(options);
				} catch (e) {
					debug.error("Failed to start worker", e);
				}
			}, (e) => {
				debug.error("Failed to start inspector", e);
			});
		},
		processEvent(event, hint) {
			return addLocalVariablesToEvent(event, hint);
		}
	};
}));
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/local-variables/local-variables-sync.js
/** Creates a unique hash from stack frames */
function hashFrames(frames) {
	if (frames === void 0) return;
	return frames.slice(-10).reduce((acc, frame) => `${acc},${frame.function},${frame.lineno},${frame.colno}`, "");
}
/**
* We use the stack parser to create a unique hash from the exception stack trace
* This is used to lookup vars when the exception passes through the event processor
*/
function hashFromStack(stackParser, stack) {
	if (stack === void 0) return;
	return hashFrames(stackParser(stack, 1));
}
/** Creates a container for callbacks to be called sequentially */
function createCallbackList(complete) {
	let callbacks = [];
	let completedCalled = false;
	function checkedComplete(result) {
		callbacks = [];
		if (completedCalled) return;
		completedCalled = true;
		complete(result);
	}
	callbacks.push(checkedComplete);
	function add(fn) {
		callbacks.push(fn);
	}
	function next(result) {
		const popped = callbacks.pop() || checkedComplete;
		try {
			popped(result);
		} catch {
			checkedComplete(result);
		}
	}
	return {
		add,
		next
	};
}
/**
* Promise API is available as `Experimental` and in Node 19 only.
*
* Callback-based API is `Stable` since v14 and `Experimental` since v8.
* Because of that, we are creating our own `AsyncSession` class.
*
* https://nodejs.org/docs/latest-v19.x/api/inspector.html#promises-api
* https://nodejs.org/docs/latest-v14.x/api/inspector.html
*/
var AsyncSession = class AsyncSession {
	/** Throws if inspector API is not available */
	constructor(_session) {
		this._session = _session;
	}
	static async create(orDefault) {
		if (orDefault) return orDefault;
		const inspector = await import("node:inspector");
		return new AsyncSession(new inspector.Session());
	}
	/** @inheritdoc */
	configureAndConnect(onPause, captureAll) {
		this._session.connect();
		this._session.on("Debugger.paused", (event) => {
			onPause(event, () => {
				this._session.post("Debugger.resume");
			});
		});
		this._session.post("Debugger.enable");
		this._session.post("Debugger.setPauseOnExceptions", { state: captureAll ? "all" : "uncaught" });
	}
	setPauseOnExceptions(captureAll) {
		this._session.post("Debugger.setPauseOnExceptions", { state: captureAll ? "all" : "uncaught" });
	}
	/** @inheritdoc */
	getLocalVariables(objectId, complete) {
		this._getProperties(objectId, (props) => {
			const { add, next } = createCallbackList(complete);
			for (const prop of props) if (prop.value?.objectId && prop.value.className === "Array") {
				const id = prop.value.objectId;
				add((vars) => this._unrollArray(id, prop.name, vars, next));
			} else if (prop.value?.objectId && prop.value.className === "Object") {
				const id = prop.value.objectId;
				add((vars) => this._unrollObject(id, prop.name, vars, next));
			} else if (prop.value) add((vars) => this._unrollOther(prop, vars, next));
			next({});
		});
	}
	/**
	* Gets all the PropertyDescriptors of an object
	*/
	_getProperties(objectId, next) {
		this._session.post("Runtime.getProperties", {
			objectId,
			ownProperties: true
		}, (err, params) => {
			if (err) next([]);
			else next(params.result);
		});
	}
	/**
	* Unrolls an array property
	*/
	_unrollArray(objectId, name, vars, next) {
		this._getProperties(objectId, (props) => {
			vars[name] = props.filter((v) => v.name !== "length" && !isNaN(parseInt(v.name, 10))).sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10)).map((v) => v.value?.value);
			next(vars);
		});
	}
	/**
	* Unrolls an object property
	*/
	_unrollObject(objectId, name, vars, next) {
		this._getProperties(objectId, (props) => {
			vars[name] = props.map((v) => [v.name, v.value?.value]).reduce((obj, [key, val]) => {
				obj[key] = val;
				return obj;
			}, {});
			next(vars);
		});
	}
	/**
	* Unrolls other properties
	*/
	_unrollOther(prop, vars, next) {
		if (prop.value) {
			if ("value" in prop.value) if (prop.value.value === void 0 || prop.value.value === null) vars[prop.name] = `<${prop.value.value}>`;
			else vars[prop.name] = prop.value.value;
			else if ("description" in prop.value && prop.value.type !== "function") vars[prop.name] = `<${prop.value.description}>`;
			else if (prop.value.type === "undefined") vars[prop.name] = "<undefined>";
		}
		next(vars);
	}
};
var INTEGRATION_NAME$29 = "LocalVariables";
/**
* Adds local variables to exception frames
*/
var _localVariablesSyncIntegration = ((options = {}, sessionOverride) => {
	const cachedFrames = new LRUMap(20);
	let rateLimiter;
	let shouldProcessEvent = false;
	function addLocalVariablesToException(exception) {
		const hash = hashFrames(exception.stacktrace?.frames);
		if (hash === void 0) return;
		const cachedFrame = cachedFrames.remove(hash);
		if (cachedFrame === void 0) return;
		const frames = (exception.stacktrace?.frames || []).filter((frame) => frame.function !== "new Promise");
		for (let i = 0; i < frames.length; i++) {
			const frameIndex = frames.length - i - 1;
			const cachedFrameVariable = cachedFrame[i];
			const frameVariable = frames[frameIndex];
			if (!frameVariable || !cachedFrameVariable) break;
			if (cachedFrameVariable.vars === void 0 || frameVariable.in_app === false || !functionNamesMatch(frameVariable.function, cachedFrameVariable.function)) continue;
			frameVariable.vars = cachedFrameVariable.vars;
		}
	}
	function addLocalVariablesToEvent(event) {
		for (const exception of event.exception?.values || []) addLocalVariablesToException(exception);
		return event;
	}
	return {
		name: INTEGRATION_NAME$29,
		async setupOnce() {
			const clientOptions = getClient()?.getOptions();
			if (!clientOptions?.includeLocalVariables) return;
			if (NODE_MAJOR < 18) {
				debug.log("The `LocalVariables` integration is only supported on Node >= v18.");
				return;
			}
			if (await isDebuggerEnabled()) {
				debug.warn("Local variables capture has been disabled because the debugger was already enabled");
				return;
			}
			AsyncSession.create(sessionOverride).then((session) => {
				function handlePaused(stackParser, { params: { reason, data, callFrames } }, complete) {
					if (reason !== "exception" && reason !== "promiseRejection") {
						complete();
						return;
					}
					rateLimiter?.();
					const exceptionHash = hashFromStack(stackParser, data.description);
					if (exceptionHash == void 0) {
						complete();
						return;
					}
					const { add, next } = createCallbackList((frames) => {
						cachedFrames.set(exceptionHash, frames);
						complete();
					});
					for (let i = 0; i < Math.min(callFrames.length, 5); i++) {
						const { scopeChain, functionName, this: obj } = callFrames[i];
						const localScope = scopeChain.find((scope) => scope.type === "local");
						const fn = obj.className === "global" || !obj.className ? functionName : `${obj.className}.${functionName}`;
						if (localScope?.object.objectId === void 0) add((frames) => {
							frames[i] = { function: fn };
							next(frames);
						});
						else {
							const id = localScope.object.objectId;
							add((frames) => session.getLocalVariables(id, (vars) => {
								frames[i] = {
									function: fn,
									vars
								};
								next(frames);
							}));
						}
					}
					next([]);
				}
				const captureAll = options.captureAllExceptions !== false;
				session.configureAndConnect((ev, complete) => handlePaused(clientOptions.stackParser, ev, complete), captureAll);
				if (captureAll) rateLimiter = createRateLimiter(options.maxExceptionsPerSecond || 50, () => {
					debug.log("Local variables rate-limit lifted.");
					session.setPauseOnExceptions(true);
				}, (seconds) => {
					debug.log(`Local variables rate-limit exceeded. Disabling capturing of caught exceptions for ${seconds} seconds.`);
					session.setPauseOnExceptions(false);
				});
				shouldProcessEvent = true;
			}, (error) => {
				debug.log("The `LocalVariables` integration failed to start.", error);
			});
		},
		processEvent(event) {
			if (shouldProcessEvent) return addLocalVariablesToEvent(event);
			return event;
		},
		_getCachedFramesCount() {
			return cachedFrames.size;
		},
		_getFirstCachedFrame() {
			return cachedFrames.values()[0];
		}
	};
});
/**
* Adds local variables to exception frames.
*/
var localVariablesSyncIntegration = defineIntegration(_localVariablesSyncIntegration);
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/local-variables/index.js
var localVariablesIntegration = (options = {}) => {
	return NODE_VERSION.major < 19 ? localVariablesSyncIntegration(options) : localVariablesAsyncIntegration(options);
};
//#endregion
//#region node_modules/@sentry/node-core/build/esm/utils/commonjs.js
/** Detect CommonJS. */
function isCjs() {
	try {
		return typeof module !== "undefined" && typeof module.exports !== "undefined";
	} catch {
		return false;
	}
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/modules.js
var moduleCache;
var INTEGRATION_NAME$28 = "Modules";
/**
* `__SENTRY_SERVER_MODULES__` can be replaced at build time with the modules loaded by the server.
* Right now, we leverage this in Next.js to circumvent the problem that we do not get access to these things at runtime.
*/
var SERVER_MODULES = typeof __SENTRY_SERVER_MODULES__ === "undefined" ? {} : __SENTRY_SERVER_MODULES__;
var _modulesIntegration = (() => {
	return {
		name: INTEGRATION_NAME$28,
		processEvent(event) {
			event.modules = {
				...event.modules,
				..._getModules()
			};
			return event;
		},
		getModules: _getModules
	};
});
/**
* Add node modules / packages to the event.
* For this, multiple sources are used:
* - They can be injected at build time into the __SENTRY_SERVER_MODULES__ variable (e.g. in Next.js)
* - They are extracted from the dependencies & devDependencies in the package.json file
* - They are extracted from the require.cache (CJS only)
*/
var modulesIntegration = _modulesIntegration;
function getRequireCachePaths() {
	try {
		return __require.cache ? Object.keys(__require.cache) : [];
	} catch {
		return [];
	}
}
/** Extract information about package.json modules */
function collectModules() {
	return {
		...SERVER_MODULES,
		...getModulesFromPackageJson(),
		...isCjs() ? collectRequireModules() : {}
	};
}
/** Extract information about package.json modules from require.cache */
function collectRequireModules() {
	const mainPaths = __require.main?.paths || [];
	const paths = getRequireCachePaths();
	const infos = {};
	const seen = /* @__PURE__ */ new Set();
	paths.forEach((path) => {
		let dir = path;
		/** Traverse directories upward in the search of package.json file */
		const updir = () => {
			const orig = dir;
			dir = dirname(orig);
			if (!dir || orig === dir || seen.has(orig)) return;
			if (mainPaths.indexOf(dir) < 0) return updir();
			const pkgfile = join(orig, "package.json");
			seen.add(orig);
			if (!existsSync(pkgfile)) return updir();
			try {
				const info = JSON.parse(readFileSync(pkgfile, "utf8"));
				infos[info.name] = info.version;
			} catch {}
		};
		updir();
	});
	return infos;
}
/** Fetches the list of modules and the versions loaded by the entry file for your node.js app. */
function _getModules() {
	if (!moduleCache) moduleCache = collectModules();
	return moduleCache;
}
function getPackageJson() {
	try {
		const filePath = join(process.cwd(), "package.json");
		return JSON.parse(readFileSync(filePath, "utf8"));
	} catch {
		return {};
	}
}
function getModulesFromPackageJson() {
	const packageJson = getPackageJson();
	return {
		...packageJson.dependencies,
		...packageJson.devDependencies
	};
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/utils/errorhandling.js
var DEFAULT_SHUTDOWN_TIMEOUT = 2e3;
/**
* @hidden
*/
function logAndExitProcess(error) {
	consoleSandbox(() => {
		console.error(error);
	});
	const client = getClient();
	if (client === void 0) {
		DEBUG_BUILD$1 && debug.warn("No NodeClient was defined, we are exiting the process now.");
		global.process.exit(1);
		return;
	}
	const options = client.getOptions();
	const timeout = options?.shutdownTimeout && options.shutdownTimeout > 0 ? options.shutdownTimeout : DEFAULT_SHUTDOWN_TIMEOUT;
	client.close(timeout).then((result) => {
		if (!result) DEBUG_BUILD$1 && debug.warn("We reached the timeout for emptying the request buffer, still exiting now!");
		global.process.exit(1);
	}, (error) => {
		DEBUG_BUILD$1 && debug.error(error);
	});
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/onuncaughtexception.js
var INTEGRATION_NAME$27 = "OnUncaughtException";
/**
* Add a global exception handler.
*/
var onUncaughtExceptionIntegration = defineIntegration((options = {}) => {
	const optionsWithDefaults = {
		exitEvenIfOtherHandlersAreRegistered: false,
		...options
	};
	return {
		name: INTEGRATION_NAME$27,
		setup(client) {
			global.process.on("uncaughtException", makeErrorHandler(client, optionsWithDefaults));
		}
	};
});
/** Exported only for tests */
function makeErrorHandler(client, options) {
	const timeout = 2e3;
	let caughtFirstError = false;
	let caughtSecondError = false;
	let calledFatalError = false;
	let firstError;
	const clientOptions = client.getOptions();
	return Object.assign((error) => {
		let onFatalError = logAndExitProcess;
		if (options.onFatalError) onFatalError = options.onFatalError;
		else if (clientOptions.onFatalError) onFatalError = clientOptions.onFatalError;
		const processWouldExit = global.process.listeners("uncaughtException").filter((listener) => {
			return listener.name !== "domainUncaughtExceptionClear" && listener.tag !== "sentry_tracingErrorCallback" && listener._errorHandler !== true;
		}).length === 0;
		const shouldApplyFatalHandlingLogic = options.exitEvenIfOtherHandlersAreRegistered || processWouldExit;
		if (!caughtFirstError) {
			firstError = error;
			caughtFirstError = true;
			if (getClient() === client) captureException(error, {
				originalException: error,
				captureContext: { level: "fatal" },
				mechanism: {
					handled: false,
					type: "onuncaughtexception"
				}
			});
			if (!calledFatalError && shouldApplyFatalHandlingLogic) {
				calledFatalError = true;
				onFatalError(error);
			}
		} else if (shouldApplyFatalHandlingLogic) {
			if (calledFatalError) {
				DEBUG_BUILD$1 && debug.warn("uncaught exception after calling fatal error shutdown callback - this is bad! forcing shutdown");
				logAndExitProcess(error);
			} else if (!caughtSecondError) {
				caughtSecondError = true;
				setTimeout(() => {
					if (!calledFatalError) {
						calledFatalError = true;
						onFatalError(firstError, error);
					}
				}, timeout);
			}
		}
	}, { _errorHandler: true });
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/onunhandledrejection.js
var INTEGRATION_NAME$26 = "OnUnhandledRejection";
var _onUnhandledRejectionIntegration = ((options = {}) => {
	const opts = {
		mode: "warn",
		...options
	};
	return {
		name: INTEGRATION_NAME$26,
		setup(client) {
			global.process.on("unhandledRejection", makeUnhandledPromiseHandler(client, opts));
		}
	};
});
/**
* Add a global promise rejection handler.
*/
var onUnhandledRejectionIntegration = defineIntegration(_onUnhandledRejectionIntegration);
/**
* Send an exception with reason
* @param reason string
* @param promise promise
*
* Exported only for tests.
*/
function makeUnhandledPromiseHandler(client, options) {
	return function sendUnhandledPromise(reason, promise) {
		if (getClient() !== client) return;
		const level = options.mode === "strict" ? "fatal" : "error";
		const activeSpanForError = reason && typeof reason === "object" ? reason._sentry_active_span : void 0;
		(activeSpanForError ? (fn) => withActiveSpan$1(activeSpanForError, fn) : (fn) => fn())(() => {
			captureException(reason, {
				originalException: promise,
				captureContext: {
					extra: { unhandledPromiseRejection: true },
					level
				},
				mechanism: {
					handled: false,
					type: "onunhandledrejection"
				}
			});
		});
		handleRejection(reason, options.mode);
	};
}
/**
* Handler for `mode` option
*/
function handleRejection(reason, mode) {
	const rejectionWarning = "This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason:";
	if (mode === "warn") consoleSandbox(() => {
		console.warn(rejectionWarning);
		console.error(reason && typeof reason === "object" && "stack" in reason ? reason.stack : reason);
	});
	else if (mode === "strict") {
		consoleSandbox(() => {
			console.warn(rejectionWarning);
		});
		logAndExitProcess(reason);
	}
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/spotlight.js
var INTEGRATION_NAME$25 = "Spotlight";
var _spotlightIntegration = ((options = {}) => {
	const _options = { sidecarUrl: options.sidecarUrl || "http://localhost:8969/stream" };
	return {
		name: INTEGRATION_NAME$25,
		setup(client) {
			try {
				debug.warn("[Spotlight] It seems you're not in dev mode. Do you really want to have Spotlight enabled?");
			} catch {}
			connectToSpotlight(client, _options);
		}
	};
});
/**
* Use this integration to send errors and transactions to Spotlight.
*
* Learn more about spotlight at https://spotlightjs.com
*
* Important: This integration only works with Node 18 or newer.
*/
var spotlightIntegration = defineIntegration(_spotlightIntegration);
function connectToSpotlight(client, options) {
	const spotlightUrl = parseSidecarUrl(options.sidecarUrl);
	if (!spotlightUrl) return;
	let failedRequests = 0;
	client.on("beforeEnvelope", (envelope) => {
		if (failedRequests > 3) {
			debug.warn("[Spotlight] Disabled Sentry -> Spotlight integration due to too many failed requests");
			return;
		}
		const serializedEnvelope = serializeEnvelope(envelope);
		suppressTracing$2(() => {
			const req = http.request({
				method: "POST",
				path: spotlightUrl.pathname,
				hostname: spotlightUrl.hostname,
				port: spotlightUrl.port,
				headers: { "Content-Type": "application/x-sentry-envelope" }
			}, (res) => {
				if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) failedRequests = 0;
				res.on("data", () => {});
				res.on("end", () => {});
				res.setEncoding("utf8");
			});
			req.on("error", () => {
				failedRequests++;
				debug.warn("[Spotlight] Failed to send envelope to Spotlight Sidecar");
			});
			req.write(serializedEnvelope);
			req.end();
		});
	});
}
function parseSidecarUrl(url) {
	try {
		return new URL(`${url}`);
	} catch {
		debug.warn(`[Spotlight] Invalid sidecar URL: ${url}`);
		return;
	}
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/systemError.js
var INTEGRATION_NAME$24 = "NodeSystemError";
function isSystemError(error) {
	if (!(error instanceof Error)) return false;
	if (!("errno" in error) || typeof error.errno !== "number") return false;
	return util.getSystemErrorMap().has(error.errno);
}
/**
* Captures context for Node.js SystemError errors.
*/
var systemErrorIntegration = defineIntegration((options = {}) => {
	return {
		name: INTEGRATION_NAME$24,
		processEvent: (event, hint, client) => {
			if (!isSystemError(hint.originalException)) return event;
			const error = hint.originalException;
			const errorContext = { ...error };
			if (!client.getOptions().sendDefaultPii && options.includePaths !== true) {
				delete errorContext.path;
				delete errorContext.dest;
			}
			event.contexts = {
				...event.contexts,
				node_system_error: errorContext
			};
			for (const exception of event.exception?.values || []) if (exception.value) {
				if (error.path && exception.value.includes(error.path)) exception.value = exception.value.replace(`'${error.path}'`, "").trim();
				if (error.dest && exception.value.includes(error.dest)) exception.value = exception.value.replace(`'${error.dest}'`, "").trim();
			}
			return event;
		}
	};
});
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/childProcess.js
var INTEGRATION_NAME$23 = "ChildProcess";
/**
* Capture breadcrumbs and events for child processes and worker threads.
*/
var childProcessIntegration = defineIntegration((options = {}) => {
	return {
		name: INTEGRATION_NAME$23,
		setup() {
			diagnosticsChannel.channel("child_process").subscribe((event) => {
				if (event && typeof event === "object" && "process" in event) captureChildProcessEvents(event.process, options);
			});
			diagnosticsChannel.channel("worker_threads").subscribe((event) => {
				if (event && typeof event === "object" && "worker" in event) captureWorkerThreadEvents(event.worker, options);
			});
		}
	};
});
function captureChildProcessEvents(child, options) {
	let hasExited = false;
	let data;
	child.on("spawn", () => {
		if (child.spawnfile === "/usr/bin/sw_vers") {
			hasExited = true;
			return;
		}
		data = { spawnfile: child.spawnfile };
		if (options.includeChildProcessArgs) data.spawnargs = child.spawnargs;
	}).on("exit", (code) => {
		if (!hasExited) {
			hasExited = true;
			if (code !== null && code !== 0) addBreadcrumb({
				category: "child_process",
				message: `Child process exited with code '${code}'`,
				level: code === 0 ? "info" : "warning",
				data
			});
		}
	}).on("error", (error) => {
		if (!hasExited) {
			hasExited = true;
			addBreadcrumb({
				category: "child_process",
				message: `Child process errored with '${error.message}'`,
				level: "error",
				data
			});
		}
	});
}
function captureWorkerThreadEvents(worker, options) {
	let threadId;
	worker.on("online", () => {
		threadId = worker.threadId;
	}).on("error", (error) => {
		if (options.captureWorkerErrors !== false) captureException(error, { mechanism: {
			type: "instrument",
			handled: false,
			data: { threadId: String(threadId) }
		} });
		else addBreadcrumb({
			category: "worker_thread",
			message: `Worker thread errored with '${error.message}'`,
			level: "error",
			data: { threadId }
		});
	});
}
/**
* This is a custom ContextManager for OpenTelemetry, which extends the default AsyncLocalStorageContextManager.
* It ensures that we create a new hub per context, so that the OTEL Context & the Sentry Scopes are always in sync.
*
* Note that we currently only support AsyncHooks with this,
* but since this should work for Node 14+ anyhow that should be good enough.
*/
var SentryContextManager = wrapContextManagerClass(require_src$4().AsyncLocalStorageContextManager);
//#endregion
//#region node_modules/@sentry/node-core/build/esm/otel/logger.js
/**
* Setup the OTEL logger to use our own debug logger.
*/
function setupOpenTelemetryLogger() {
	import_src$21.diag.disable();
	import_src$21.diag.setLogger({
		error: debug.error,
		warn: debug.warn,
		info: debug.log,
		debug: debug.log,
		verbose: debug.log
	}, import_src$21.DiagLogLevel.DEBUG);
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/integrations/processSession.js
var INTEGRATION_NAME$22 = "ProcessSession";
/**
* Records a Session for the current process to track release health.
*/
var processSessionIntegration = defineIntegration(() => {
	return {
		name: INTEGRATION_NAME$22,
		setupOnce() {
			startSession();
			process.on("beforeExit", () => {
				if (getIsolationScope().getSession()?.status !== "ok") endSession();
			});
		}
	};
});
//#endregion
//#region node_modules/@sentry/node-core/build/esm/proxy/base.js
/**
* This code was originally forked from https://github.com/TooTallNate/proxy-agents/tree/b133295fd16f6475578b6b15bd9b4e33ecb0d0b7
* With the following LICENSE:
*
* (The MIT License)
*
* Copyright (c) 2013 Nathan Rajlich <nathan@tootallnate.net>*
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* 'Software'), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:*
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.*
*
* THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var INTERNAL = Symbol("AgentBaseInternalState");
var Agent = class extends http.Agent {
	constructor(opts) {
		super(opts);
		this[INTERNAL] = {};
	}
	/**
	* Determine whether this is an `http` or `https` request.
	*/
	isSecureEndpoint(options) {
		if (options) {
			if (typeof options.secureEndpoint === "boolean") return options.secureEndpoint;
			if (typeof options.protocol === "string") return options.protocol === "https:";
		}
		const { stack } = /* @__PURE__ */ new Error();
		if (typeof stack !== "string") return false;
		return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
	}
	createSocket(req, options, cb) {
		const connectOpts = {
			...options,
			secureEndpoint: this.isSecureEndpoint(options)
		};
		Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
			if (socket instanceof http.Agent) return socket.addRequest(req, connectOpts);
			this[INTERNAL].currentSocket = socket;
			super.createSocket(req, options, cb);
		}, cb);
	}
	createConnection() {
		const socket = this[INTERNAL].currentSocket;
		this[INTERNAL].currentSocket = void 0;
		if (!socket) throw new Error("No socket was returned in the `connect()` function");
		return socket;
	}
	get defaultPort() {
		return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
	}
	set defaultPort(v) {
		if (this[INTERNAL]) this[INTERNAL].defaultPort = v;
	}
	get protocol() {
		return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
	}
	set protocol(v) {
		if (this[INTERNAL]) this[INTERNAL].protocol = v;
	}
};
//#endregion
//#region node_modules/@sentry/node-core/build/esm/proxy/parse-proxy-response.js
function debugLog$1(...args) {
	debug.log("[https-proxy-agent:parse-proxy-response]", ...args);
}
function parseProxyResponse(socket) {
	return new Promise((resolve, reject) => {
		let buffersLength = 0;
		const buffers = [];
		function read() {
			const b = socket.read();
			if (b) ondata(b);
			else socket.once("readable", read);
		}
		function cleanup() {
			socket.removeListener("end", onend);
			socket.removeListener("error", onerror);
			socket.removeListener("readable", read);
		}
		function onend() {
			cleanup();
			debugLog$1("onend");
			reject(/* @__PURE__ */ new Error("Proxy connection ended before receiving CONNECT response"));
		}
		function onerror(err) {
			cleanup();
			debugLog$1("onerror %o", err);
			reject(err);
		}
		function ondata(b) {
			buffers.push(b);
			buffersLength += b.length;
			const buffered = Buffer.concat(buffers, buffersLength);
			const endOfHeaders = buffered.indexOf("\r\n\r\n");
			if (endOfHeaders === -1) {
				debugLog$1("have not received end of HTTP headers yet...");
				read();
				return;
			}
			const headerParts = buffered.subarray(0, endOfHeaders).toString("ascii").split("\r\n");
			const firstLine = headerParts.shift();
			if (!firstLine) {
				socket.destroy();
				return reject(/* @__PURE__ */ new Error("No header received from proxy CONNECT response"));
			}
			const firstLineParts = firstLine.split(" ");
			const statusCode = +(firstLineParts[1] || 0);
			const statusText = firstLineParts.slice(2).join(" ");
			const headers = {};
			for (const header of headerParts) {
				if (!header) continue;
				const firstColon = header.indexOf(":");
				if (firstColon === -1) {
					socket.destroy();
					return reject(/* @__PURE__ */ new Error(`Invalid header from proxy CONNECT response: "${header}"`));
				}
				const key = header.slice(0, firstColon).toLowerCase();
				const value = header.slice(firstColon + 1).trimStart();
				const current = headers[key];
				if (typeof current === "string") headers[key] = [current, value];
				else if (Array.isArray(current)) current.push(value);
				else headers[key] = value;
			}
			debugLog$1("got proxy server response: %o %o", firstLine, headers);
			cleanup();
			resolve({
				connect: {
					statusCode,
					statusText,
					headers
				},
				buffered
			});
		}
		socket.on("error", onerror);
		socket.on("end", onend);
		read();
	});
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/proxy/index.js
function debugLog(...args) {
	debug.log("[https-proxy-agent]", ...args);
}
/**
* The `HttpsProxyAgent` implements an HTTP Agent subclass that connects to
* the specified "HTTP(s) proxy server" in order to proxy HTTPS requests.
*
* Outgoing HTTP requests are first tunneled through the proxy server using the
* `CONNECT` HTTP request method to establish a connection to the proxy server,
* and then the proxy server connects to the destination target and issues the
* HTTP request from the proxy server.
*
* `https:` requests have their socket connection upgraded to TLS once
* the connection to the proxy server has been established.
*/
var HttpsProxyAgent = class extends Agent {
	static __initStatic() {
		this.protocols = ["http", "https"];
	}
	constructor(proxy, opts) {
		super(opts);
		this.options = {};
		this.proxy = typeof proxy === "string" ? new URL(proxy) : proxy;
		this.proxyHeaders = opts?.headers ?? {};
		debugLog("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
		const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
		const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
		this.connectOpts = {
			ALPNProtocols: ["http/1.1"],
			...opts ? omit(opts, "headers") : null,
			host,
			port
		};
	}
	/**
	* Called when the node-core HTTP client library is creating a
	* new HTTP request.
	*/
	async connect(req, opts) {
		const { proxy } = this;
		if (!opts.host) throw new TypeError("No \"host\" provided");
		let socket;
		if (proxy.protocol === "https:") {
			debugLog("Creating `tls.Socket`: %o", this.connectOpts);
			const servername = this.connectOpts.servername || this.connectOpts.host;
			socket = tls.connect({
				...this.connectOpts,
				servername: servername && net.isIP(servername) ? void 0 : servername
			});
		} else {
			debugLog("Creating `net.Socket`: %o", this.connectOpts);
			socket = net.connect(this.connectOpts);
		}
		const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
		const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
		let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r\n`;
		if (proxy.username || proxy.password) {
			const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
			headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
		}
		headers.Host = `${host}:${opts.port}`;
		if (!headers["Proxy-Connection"]) headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
		for (const name of Object.keys(headers)) payload += `${name}: ${headers[name]}\r\n`;
		const proxyResponsePromise = parseProxyResponse(socket);
		socket.write(`${payload}\r\n`);
		const { connect, buffered } = await proxyResponsePromise;
		req.emit("proxyConnect", connect);
		this.emit("proxyConnect", connect, req);
		if (connect.statusCode === 200) {
			req.once("socket", resume);
			if (opts.secureEndpoint) {
				debugLog("Upgrading socket connection to TLS");
				const servername = opts.servername || opts.host;
				return tls.connect({
					...omit(opts, "host", "path", "port"),
					socket,
					servername: net.isIP(servername) ? void 0 : servername
				});
			}
			return socket;
		}
		socket.destroy();
		const fakeSocket = new net.Socket({ writable: false });
		fakeSocket.readable = true;
		req.once("socket", (s) => {
			debugLog("Replaying proxy buffer for failed request");
			s.push(buffered);
			s.push(null);
		});
		return fakeSocket;
	}
};
HttpsProxyAgent.__initStatic();
function resume(socket) {
	socket.resume();
}
function omit(obj, ...keys) {
	const ret = {};
	let key;
	for (key in obj) if (!keys.includes(key)) ret[key] = obj[key];
	return ret;
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/transports/http.js
var GZIP_THRESHOLD = 1024 * 32;
/**
* Gets a stream from a Uint8Array or string
* Readable.from is ideal but was added in node.js v12.3.0 and v10.17.0
*/
function streamFromBody(body) {
	return new Readable({ read() {
		this.push(body);
		this.push(null);
	} });
}
/**
* Creates a Transport that uses native the native 'http' and 'https' modules to send events to Sentry.
*/
function makeNodeTransport(options) {
	let urlSegments;
	try {
		urlSegments = new URL(options.url);
	} catch (e) {
		consoleSandbox(() => {
			console.warn("[@sentry/node]: Invalid dsn or tunnel option, will not send any events. The tunnel option must be a full URL when used.");
		});
		return createTransport(options, () => Promise.resolve({}));
	}
	const isHttps = urlSegments.protocol === "https:";
	const proxy = applyNoProxyOption(urlSegments, options.proxy || (isHttps ? process.env.https_proxy : void 0) || process.env.http_proxy);
	const nativeHttpModule = isHttps ? https : http;
	const keepAlive = options.keepAlive === void 0 ? false : options.keepAlive;
	const agent = proxy ? new HttpsProxyAgent(proxy) : new nativeHttpModule.Agent({
		keepAlive,
		maxSockets: 30,
		timeout: 2e3
	});
	return createTransport(options, createRequestExecutor(options, options.httpModule ?? nativeHttpModule, agent));
}
/**
* Honors the `no_proxy` env variable with the highest priority to allow for hosts exclusion.
*
* @param transportUrl The URL the transport intends to send events to.
* @param proxy The client configured proxy.
* @returns A proxy the transport should use.
*/
function applyNoProxyOption(transportUrlSegments, proxy) {
	const { no_proxy } = process.env;
	if (no_proxy?.split(",").some((exemption) => transportUrlSegments.host.endsWith(exemption) || transportUrlSegments.hostname.endsWith(exemption))) return;
	else return proxy;
}
/**
* Creates a RequestExecutor to be used with `createTransport`.
*/
function createRequestExecutor(options, httpModule, agent) {
	const { hostname, pathname, port, protocol, search } = new URL(options.url);
	return function makeRequest(request) {
		return new Promise((resolve, reject) => {
			suppressTracing$2(() => {
				let body = streamFromBody(request.body);
				const headers = { ...options.headers };
				if (request.body.length > GZIP_THRESHOLD) {
					headers["content-encoding"] = "gzip";
					body = body.pipe(createGzip());
				}
				const req = httpModule.request({
					method: "POST",
					agent,
					headers,
					hostname,
					path: `${pathname}${search}`,
					port,
					protocol,
					ca: options.caCerts
				}, (res) => {
					res.on("data", () => {});
					res.on("end", () => {});
					res.setEncoding("utf8");
					const retryAfterHeader = res.headers["retry-after"] ?? null;
					const rateLimitsHeader = res.headers["x-sentry-rate-limits"] ?? null;
					resolve({
						statusCode: res.statusCode,
						headers: {
							"retry-after": retryAfterHeader,
							"x-sentry-rate-limits": Array.isArray(rateLimitsHeader) ? rateLimitsHeader[0] || null : rateLimitsHeader
						}
					});
				});
				req.on("error", reject);
				body.pipe(req);
			});
		});
	};
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/utils/envToBool.js
var FALSY_ENV_VALUES = /* @__PURE__ */ new Set([
	"false",
	"f",
	"n",
	"no",
	"off",
	"0"
]);
var TRUTHY_ENV_VALUES = /* @__PURE__ */ new Set([
	"true",
	"t",
	"y",
	"yes",
	"on",
	"1"
]);
/**
* A helper function which casts an ENV variable value to `true` or `false` using the constants defined above.
* In strict mode, it may return `null` if the value doesn't match any of the predefined values.
*
* @param value The value of the env variable
* @param options -- Only has `strict` key for now, which requires a strict match for `true` in TRUTHY_ENV_VALUES
* @returns true/false if the lowercase value matches the predefined values above. If not, null in strict mode,
*          and Boolean(value) in loose mode.
*/
function envToBool(value, options) {
	const normalized = String(value).toLowerCase();
	if (FALSY_ENV_VALUES.has(normalized)) return false;
	if (TRUTHY_ENV_VALUES.has(normalized)) return true;
	return options?.strict ? null : Boolean(value);
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/utils/module.js
/** normalizes Windows paths */
function normalizeWindowsPath(path) {
	return path.replace(/^[A-Z]:/, "").replace(/\\/g, "/");
}
/** Creates a function that gets the module name from a filename */
function createGetModuleFromFilename(basePath = process.argv[1] ? dirname$1(process.argv[1]) : process.cwd(), isWindows = sep === "\\") {
	const normalizedBase = isWindows ? normalizeWindowsPath(basePath) : basePath;
	return (filename) => {
		if (!filename) return;
		const normalizedFilename = isWindows ? normalizeWindowsPath(filename) : filename;
		let { dir, base: file, ext } = posix.parse(normalizedFilename);
		if (ext === ".js" || ext === ".mjs" || ext === ".cjs") file = file.slice(0, ext.length * -1);
		const decodedFile = decodeURIComponent(file);
		if (!dir) dir = ".";
		const n = dir.lastIndexOf("/node_modules");
		if (n > -1) return `${dir.slice(n + 14).replace(/\//g, ".")}:${decodedFile}`;
		if (dir.startsWith(normalizedBase)) {
			const moduleName = dir.slice(normalizedBase.length + 1).replace(/\//g, ".");
			return moduleName ? `${moduleName}:${decodedFile}` : decodedFile;
		}
		return decodedFile;
	};
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/sdk/api.js
/**
* Returns a release dynamically from environment variables.
*/
function getSentryRelease(fallback) {
	if (process.env.SENTRY_RELEASE) return process.env.SENTRY_RELEASE;
	if (GLOBAL_OBJ.SENTRY_RELEASE?.id) return GLOBAL_OBJ.SENTRY_RELEASE.id;
	const possibleReleaseNameOfGitProvider = process.env["GITHUB_SHA"] || process.env["CI_MERGE_REQUEST_SOURCE_BRANCH_SHA"] || process.env["CI_BUILD_REF"] || process.env["CI_COMMIT_SHA"] || process.env["BITBUCKET_COMMIT"];
	const possibleReleaseNameOfCiProvidersWithSpecificEnvVar = process.env["APPVEYOR_PULL_REQUEST_HEAD_COMMIT"] || process.env["APPVEYOR_REPO_COMMIT"] || process.env["CODEBUILD_RESOLVED_SOURCE_VERSION"] || process.env["AWS_COMMIT_ID"] || process.env["BUILD_SOURCEVERSION"] || process.env["GIT_CLONE_COMMIT_HASH"] || process.env["BUDDY_EXECUTION_REVISION"] || process.env["BUILDKITE_COMMIT"] || process.env["CIRCLE_SHA1"] || process.env["CIRRUS_CHANGE_IN_REPO"] || process.env["CF_REVISION"] || process.env["CM_COMMIT"] || process.env["CF_PAGES_COMMIT_SHA"] || process.env["DRONE_COMMIT_SHA"] || process.env["FC_GIT_COMMIT_SHA"] || process.env["HEROKU_TEST_RUN_COMMIT_VERSION"] || process.env["HEROKU_SLUG_COMMIT"] || process.env["RAILWAY_GIT_COMMIT_SHA"] || process.env["RENDER_GIT_COMMIT"] || process.env["SEMAPHORE_GIT_SHA"] || process.env["TRAVIS_PULL_REQUEST_SHA"] || process.env["VERCEL_GIT_COMMIT_SHA"] || process.env["VERCEL_GITHUB_COMMIT_SHA"] || process.env["VERCEL_GITLAB_COMMIT_SHA"] || process.env["VERCEL_BITBUCKET_COMMIT_SHA"] || process.env["ZEIT_GITHUB_COMMIT_SHA"] || process.env["ZEIT_GITLAB_COMMIT_SHA"] || process.env["ZEIT_BITBUCKET_COMMIT_SHA"];
	const possibleReleaseNameOfCiProvidersWithGenericEnvVar = process.env["CI_COMMIT_ID"] || process.env["SOURCE_COMMIT"] || process.env["SOURCE_VERSION"] || process.env["GIT_COMMIT"] || process.env["COMMIT_REF"] || process.env["BUILD_VCS_NUMBER"] || process.env["CI_COMMIT_SHA"];
	return possibleReleaseNameOfGitProvider || possibleReleaseNameOfCiProvidersWithSpecificEnvVar || possibleReleaseNameOfCiProvidersWithGenericEnvVar || fallback;
}
/** Node.js stack parser */
var defaultStackParser = createStackParser(nodeStackLineParser(createGetModuleFromFilename()));
//#endregion
//#region node_modules/@sentry/node-core/build/esm/sdk/client.js
init_esm$1();
var DEFAULT_CLIENT_REPORT_FLUSH_INTERVAL_MS = 6e4;
/** A client for using Sentry with Node & OpenTelemetry. */
var NodeClient = class extends ServerRuntimeClient {
	constructor(options) {
		const serverName = options.includeServerName === false ? void 0 : options.serverName || global.process.env.SENTRY_NAME || os.hostname();
		const clientOptions = {
			...options,
			platform: "node",
			runtime: {
				name: "node",
				version: global.process.version
			},
			serverName
		};
		if (options.openTelemetryInstrumentations) registerInstrumentations({ instrumentations: options.openTelemetryInstrumentations });
		applySdkMetadata(clientOptions, "node");
		debug.log(`Initializing Sentry: process: ${process.pid}, thread: ${isMainThread ? "main" : `worker-${threadId}`}.`);
		super(clientOptions);
		const { enableLogs, _experiments } = this.getOptions();
		if (enableLogs ?? _experiments?.enableLogs) {
			this._logOnExitFlushListener = () => {
				_INTERNAL_flushLogsBuffer(this);
			};
			if (serverName) this.on("beforeCaptureLog", (log) => {
				log.attributes = {
					...log.attributes,
					"server.address": serverName
				};
			});
			process.on("beforeExit", this._logOnExitFlushListener);
		}
	}
	/** Get the OTEL tracer. */
	get tracer() {
		if (this._tracer) return this._tracer;
		const name = "@sentry/node";
		const version = SDK_VERSION;
		const tracer = import_src$21.trace.getTracer(name, version);
		this._tracer = tracer;
		return tracer;
	}
	async flush(timeout) {
		await this.traceProvider?.forceFlush();
		if (this.getOptions().sendClientReports) this._flushOutcomes();
		return super.flush(timeout);
	}
	close(timeout) {
		if (this._clientReportInterval) clearInterval(this._clientReportInterval);
		if (this._clientReportOnExitFlushListener) process.off("beforeExit", this._clientReportOnExitFlushListener);
		if (this._logOnExitFlushListener) process.off("beforeExit", this._logOnExitFlushListener);
		return super.close(timeout);
	}
	/**
	* Will start tracking client reports for this client.
	*
	* NOTICE: This method will create an interval that is periodically called and attach a `process.on('beforeExit')`
	* hook. To clean up these resources, call `.close()` when you no longer intend to use the client. Not doing so will
	* result in a memory leak.
	*/
	startClientReportTracking() {
		const clientOptions = this.getOptions();
		if (clientOptions.sendClientReports) {
			this._clientReportOnExitFlushListener = () => {
				this._flushOutcomes();
			};
			this._clientReportInterval = setInterval(() => {
				DEBUG_BUILD$1 && debug.log("Flushing client reports based on interval.");
				this._flushOutcomes();
			}, clientOptions.clientReportFlushInterval ?? DEFAULT_CLIENT_REPORT_FLUSH_INTERVAL_MS).unref();
			process.on("beforeExit", this._clientReportOnExitFlushListener);
		}
	}
	/** Custom implementation for OTEL, so we can handle scope-span linking. */
	_getTraceInfoFromScope(scope) {
		if (!scope) return [void 0, void 0];
		return getTraceContextForScope(this, scope);
	}
};
//#endregion
//#region node_modules/@sentry/node-core/build/esm/sdk/esmLoader.js
/** Initialize the ESM loader. */
function maybeInitializeEsmLoader() {
	const [nodeMajor = 0, nodeMinor = 0] = process.versions.node.split(".").map(Number);
	if (nodeMajor >= 21 || nodeMajor === 20 && nodeMinor >= 6 || nodeMajor === 18 && nodeMinor >= 19) {
		if (!GLOBAL_OBJ._sentryEsmLoaderHookRegistered) try {
			const { addHookMessagePort } = createAddHookMessageChannel();
			moduleModule.register("import-in-the-middle/hook.mjs", import.meta.url, {
				data: {
					addHookMessagePort,
					include: []
				},
				transferList: [addHookMessagePort]
			});
		} catch (error) {
			debug.warn("Failed to register ESM hook", error);
		}
	} else consoleSandbox(() => {
		console.warn(`[Sentry] You are using Node.js v${process.versions.node} in ESM mode ("import syntax"). The Sentry Node.js SDK is not compatible with ESM in Node.js versions before 18.19.0 or before 20.6.0. Please either build your application with CommonJS ("require() syntax"), or upgrade your Node.js version.`);
	});
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/sdk/index.js
/**
* Get default integrations for the Node-Core SDK.
*/
function getDefaultIntegrations$1() {
	return [
		inboundFiltersIntegration(),
		functionToStringIntegration(),
		linkedErrorsIntegration(),
		requestDataIntegration(),
		systemErrorIntegration(),
		consoleIntegration(),
		httpIntegration$1(),
		nativeNodeFetchIntegration$1(),
		onUncaughtExceptionIntegration(),
		onUnhandledRejectionIntegration(),
		contextLinesIntegration(),
		localVariablesIntegration(),
		nodeContextIntegration(),
		childProcessIntegration(),
		processSessionIntegration(),
		modulesIntegration()
	];
}
/**
* Initialize Sentry for Node.
*/
function init$1(options = {}) {
	return _init$1(options, getDefaultIntegrations$1);
}
/**
* Initialize Sentry for Node, without performance instrumentation.
*/
function _init$1(_options = {}, getDefaultIntegrationsImpl) {
	const options = getClientOptions(_options, getDefaultIntegrationsImpl);
	if (options.debug === true) if (DEBUG_BUILD$1) debug.enable();
	else consoleSandbox(() => {
		console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
	});
	if (!isCjs() && options.registerEsmLoaderHooks !== false) maybeInitializeEsmLoader();
	setOpenTelemetryContextAsyncContextStrategy();
	getCurrentScope().update(options.initialScope);
	if (options.spotlight && !options.integrations.some(({ name }) => name === "Spotlight")) options.integrations.push(spotlightIntegration({ sidecarUrl: typeof options.spotlight === "string" ? options.spotlight : void 0 }));
	applySdkMetadata(options, "node-core");
	const client = new NodeClient(options);
	getCurrentScope().setClient(client);
	client.init();
	debug.log(`Running in ${isCjs() ? "CommonJS" : "ESM"} mode.`);
	client.startClientReportTracking();
	updateScopeFromEnvVariables();
	enhanceDscWithOpenTelemetryRootSpanName(client);
	setupEventContextTrace(client);
	return client;
}
/**
* Validate that your OpenTelemetry setup is correct.
*/
function validateOpenTelemetrySetup() {
	if (!DEBUG_BUILD$1) return;
	const setup = openTelemetrySetupCheck();
	const required = ["SentryContextManager", "SentryPropagator"];
	if (hasSpansEnabled()) required.push("SentrySpanProcessor");
	for (const k of required) if (!setup.includes(k)) debug.error(`You have to set up the ${k}. Without this, the OpenTelemetry & Sentry integration will not work properly.`);
	if (!setup.includes("SentrySampler")) debug.warn("You have to set up the SentrySampler. Without this, the OpenTelemetry & Sentry integration may still work, but sample rates set for the Sentry SDK will not be respected. If you use a custom sampler, make sure to use `wrapSamplingDecision`.");
}
function getClientOptions(options, getDefaultIntegrationsImpl) {
	const release = getRelease(options.release);
	const spotlight = options.spotlight ?? envToBool(process.env.SENTRY_SPOTLIGHT, { strict: true }) ?? process.env.SENTRY_SPOTLIGHT;
	const tracesSampleRate = getTracesSampleRate(options.tracesSampleRate);
	const mergedOptions = {
		...options,
		dsn: options.dsn ?? process.env.SENTRY_DSN,
		environment: options.environment ?? process.env.SENTRY_ENVIRONMENT,
		sendClientReports: options.sendClientReports ?? true,
		transport: options.transport ?? makeNodeTransport,
		stackParser: stackParserFromStackParserOptions(options.stackParser || defaultStackParser),
		release,
		tracesSampleRate,
		spotlight,
		debug: envToBool(options.debug ?? process.env.SENTRY_DEBUG)
	};
	const integrations = options.integrations;
	const defaultIntegrations = options.defaultIntegrations ?? getDefaultIntegrationsImpl(mergedOptions);
	return {
		...mergedOptions,
		integrations: getIntegrationsToSetup({
			defaultIntegrations,
			integrations
		})
	};
}
function getRelease(release) {
	if (release !== void 0) return release;
	const detectedRelease = getSentryRelease();
	if (detectedRelease !== void 0) return detectedRelease;
}
function getTracesSampleRate(tracesSampleRate) {
	if (tracesSampleRate !== void 0) return tracesSampleRate;
	const sampleRateFromEnv = process.env.SENTRY_TRACES_SAMPLE_RATE;
	if (!sampleRateFromEnv) return;
	const parsed = parseFloat(sampleRateFromEnv);
	return isFinite(parsed) ? parsed : void 0;
}
/**
* Update scope and propagation context based on environmental variables.
*
* See https://github.com/getsentry/rfcs/blob/main/text/0071-continue-trace-over-process-boundaries.md
* for more details.
*/
function updateScopeFromEnvVariables() {
	if (envToBool(process.env.SENTRY_USE_ENVIRONMENT) !== false) {
		const sentryTraceEnv = process.env.SENTRY_TRACE;
		const baggageEnv = process.env.SENTRY_BAGGAGE;
		const propagationContext = propagationContextFromHeaders(sentryTraceEnv, baggageEnv);
		getCurrentScope().setPropagationContext(propagationContext);
	}
}
//#endregion
//#region node_modules/@sentry/node-core/build/esm/utils/addOriginToSpan.js
/** Adds an origin to an OTEL Span. */
function addOriginToSpan(span, origin) {
	span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, origin);
}
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/http/index.js
var import_src$18 = require_src$1();
var INTEGRATION_NAME$21 = "Http";
var INSTRUMENTATION_NAME = "@opentelemetry_sentry-patched/instrumentation-http";
var instrumentSentryHttp = generateInstrumentOnce(`${INTEGRATION_NAME$21}.sentry`, (options) => {
	return new SentryHttpInstrumentation(options);
});
var instrumentOtelHttp = generateInstrumentOnce(INTEGRATION_NAME$21, (config) => {
	const instrumentation = new import_src$18.HttpInstrumentation(config);
	try {
		instrumentation["_diag"] = import_src$21.diag.createComponentLogger({ namespace: INSTRUMENTATION_NAME });
		instrumentation.instrumentationName = INSTRUMENTATION_NAME;
	} catch {}
	return instrumentation;
});
/** Exported only for tests. */
function _shouldInstrumentSpans$1(options, clientOptions = {}) {
	if (typeof options.spans === "boolean") return options.spans;
	if (clientOptions.skipOpenTelemetrySetup) return false;
	if (!hasSpansEnabled(clientOptions) && NODE_VERSION.major >= 22) return false;
	return true;
}
/**
* The http integration instruments Node's internal http and https modules.
* It creates breadcrumbs and spans for outgoing HTTP requests which will be attached to the currently active span.
*/
var httpIntegration = defineIntegration((options = {}) => {
	const dropSpansForIncomingRequestStatusCodes = options.dropSpansForIncomingRequestStatusCodes ?? [[401, 404], [300, 399]];
	return {
		name: INTEGRATION_NAME$21,
		setupOnce() {
			const instrumentSpans = _shouldInstrumentSpans$1(options, getClient()?.getOptions());
			instrumentSentryHttp({
				...options,
				extractIncomingTraceFromHeader: !instrumentSpans,
				propagateTraceInOutgoingRequests: !instrumentSpans
			});
			if (instrumentSpans) instrumentOtelHttp(getConfigWithDefaults$1(options));
		},
		processEvent(event) {
			if (event.type === "transaction") {
				const statusCode = event.contexts?.trace?.data?.["http.response.status_code"];
				if (typeof statusCode === "number" && dropSpansForIncomingRequestStatusCodes.some((code) => {
					if (typeof code === "number") return code === statusCode;
					const [min, max] = code;
					return statusCode >= min && statusCode <= max;
				})) return null;
			}
			return event;
		}
	};
});
/**
* Determines if @param req is a ClientRequest, meaning the request was created within the express app
* and it's an outgoing request.
* Checking for properties instead of using `instanceOf` to avoid importing the request classes.
*/
function _isClientRequest(req) {
	return "outputData" in req && "outputSize" in req && !("client" in req) && !("statusCode" in req);
}
/**
* Detects if an incoming request is a prefetch request.
*/
function isKnownPrefetchRequest(req) {
	return req.headers["next-router-prefetch"] === "1";
}
function getConfigWithDefaults$1(options = {}) {
	return {
		...options.instrumentation?._experimentalConfig,
		disableIncomingRequestInstrumentation: options.disableIncomingRequestSpans,
		ignoreOutgoingRequestHook: (request) => {
			const url = getRequestUrl(request);
			if (!url) return false;
			const _ignoreOutgoingRequests = options.ignoreOutgoingRequests;
			if (_ignoreOutgoingRequests?.(url, request)) return true;
			return false;
		},
		ignoreIncomingRequestHook: (request) => {
			const urlPath = request.url;
			const method = request.method?.toUpperCase();
			if (method === "OPTIONS" || method === "HEAD") return true;
			const _ignoreIncomingRequests = options.ignoreIncomingRequests;
			if (urlPath && _ignoreIncomingRequests?.(urlPath, request)) return true;
			return false;
		},
		requireParentforOutgoingSpans: false,
		requireParentforIncomingSpans: false,
		requestHook: (span, req) => {
			addOriginToSpan(span, "auto.http.otel.http");
			if (!_isClientRequest(req) && isKnownPrefetchRequest(req)) span.setAttribute("sentry.http.prefetch", true);
			options.instrumentation?.requestHook?.(span, req);
		},
		responseHook: (span, res) => {
			options.instrumentation?.responseHook?.(span, res);
		},
		applyCustomAttributesOnSpan: (span, request, response) => {
			options.instrumentation?.applyCustomAttributesOnSpan?.(span, request, response);
		}
	};
}
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/node-fetch/index.js
var import_src$17 = require_src$5();
var INTEGRATION_NAME$20 = "NodeFetch";
var instrumentOtelNodeFetch = generateInstrumentOnce(INTEGRATION_NAME$20, import_src$17.UndiciInstrumentation, (options) => {
	return getConfigWithDefaults(options);
});
var instrumentSentryNodeFetch = generateInstrumentOnce(`${INTEGRATION_NAME$20}.sentry`, SentryNodeFetchInstrumentation, (options) => {
	return options;
});
var _nativeNodeFetchIntegration = ((options = {}) => {
	return {
		name: "NodeFetch",
		setupOnce() {
			if (_shouldInstrumentSpans(options, getClient()?.getOptions())) instrumentOtelNodeFetch(options);
			instrumentSentryNodeFetch(options);
		}
	};
});
var nativeNodeFetchIntegration = defineIntegration(_nativeNodeFetchIntegration);
function getAbsoluteUrl(origin, path = "/") {
	const url = `${origin}`;
	if (url.endsWith("/") && path.startsWith("/")) return `${url}${path.slice(1)}`;
	if (!url.endsWith("/") && !path.startsWith("/")) return `${url}/${path.slice(1)}`;
	return `${url}${path}`;
}
function _shouldInstrumentSpans(options, clientOptions = {}) {
	return typeof options.spans === "boolean" ? options.spans : !clientOptions.skipOpenTelemetrySetup && hasSpansEnabled(clientOptions);
}
function getConfigWithDefaults(options = {}) {
	return {
		requireParentforSpans: false,
		ignoreRequestHook: (request) => {
			const url = getAbsoluteUrl(request.origin, request.path);
			const _ignoreOutgoingRequests = options.ignoreOutgoingRequests;
			return !!(_ignoreOutgoingRequests && url && _ignoreOutgoingRequests(url));
		},
		startSpanHook: () => {
			return { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.node_fetch" };
		}
	};
}
//#endregion
//#region node_modules/@sentry/node/build/esm/debug-build.js
var import_src$16 = require_src$6();
/**
* This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
*
* ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
*/
var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/express-v5/enums/AttributeNames.js
var AttributeNames$1;
(function(AttributeNames) {
	AttributeNames["EXPRESS_TYPE"] = "express.type";
	AttributeNames["EXPRESS_NAME"] = "express.name";
})(AttributeNames$1 || (AttributeNames$1 = {}));
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/express-v5/enums/ExpressLayerType.js
var ExpressLayerType;
(function(ExpressLayerType) {
	ExpressLayerType["ROUTER"] = "router";
	ExpressLayerType["MIDDLEWARE"] = "middleware";
	ExpressLayerType["REQUEST_HANDLER"] = "request_handler";
})(ExpressLayerType || (ExpressLayerType = {}));
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/express-v5/internal-types.js
/**
* This symbol is used to mark express layer as being already instrumented
* since its possible to use a given layer multiple times (ex: middlewares)
*/
var kLayerPatched = Symbol("express-layer-patched");
/**
* This const define where on the `request` object the Instrumentation will mount the
* current stack of express layer.
*
* It is necessary because express doesn't store the different layers
* (ie: middleware, router etc) that it called to get to the current layer.
* Given that, the only way to know the route of a given layer is to
* store the path of where each previous layer has been mounted.
*
* ex: bodyParser > auth middleware > /users router > get /:id
*  in this case the stack would be: ["/users", "/:id"]
*
* ex2: bodyParser > /api router > /v1 router > /users router > get /:id
*  stack: ["/api", "/v1", "/users", ":id"]
*
*/
var _LAYERS_STORE_PROPERTY = "__ot_middlewares";
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/express-v5/utils.js
/**
* Store layers path in the request to be able to construct route later
* @param request The request where
* @param [value] the value to push into the array
*/
var storeLayerPath = (request, value) => {
	if (Array.isArray(request["__ot_middlewares"]) === false) Object.defineProperty(request, _LAYERS_STORE_PROPERTY, {
		enumerable: false,
		value: []
	});
	if (value === void 0) return;
	request[_LAYERS_STORE_PROPERTY].push(value);
};
/**
* Recursively search the router path from layer stack
* @param path The path to reconstruct
* @param layer The layer to reconstruct from
* @returns The reconstructed path
*/
var getRouterPath = (path, layer) => {
	const stackLayer = layer.handle?.stack?.[0];
	if (stackLayer?.route?.path) return `${path}${stackLayer.route.path}`;
	if (stackLayer?.handle?.stack) return getRouterPath(path, stackLayer);
	return path;
};
/**
* Parse express layer context to retrieve a name and attributes.
* @param route The route of the layer
* @param layer Express layer
* @param [layerPath] if present, the path on which the layer has been mounted
*/
var getLayerMetadata = (route, layer, layerPath) => {
	if (layer.name === "router") {
		const maybeRouterPath = getRouterPath("", layer);
		const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || "/";
		return {
			attributes: {
				[AttributeNames$1.EXPRESS_NAME]: extractedRouterPath,
				[AttributeNames$1.EXPRESS_TYPE]: ExpressLayerType.ROUTER
			},
			name: `router - ${extractedRouterPath}`
		};
	} else if (layer.name === "bound dispatch" || layer.name === "handle") return {
		attributes: {
			[AttributeNames$1.EXPRESS_NAME]: (route || layerPath) ?? "request handler",
			[AttributeNames$1.EXPRESS_TYPE]: ExpressLayerType.REQUEST_HANDLER
		},
		name: `request handler${layer.path ? ` - ${route || layerPath}` : ""}`
	};
	else return {
		attributes: {
			[AttributeNames$1.EXPRESS_NAME]: layer.name,
			[AttributeNames$1.EXPRESS_TYPE]: ExpressLayerType.MIDDLEWARE
		},
		name: `middleware - ${layer.name}`
	};
};
/**
* Check whether the given obj match pattern
* @param constant e.g URL of request
* @param obj obj to inspect
* @param pattern Match pattern
*/
var satisfiesPattern = (constant, pattern) => {
	if (typeof pattern === "string") return pattern === constant;
	else if (pattern instanceof RegExp) return pattern.test(constant);
	else if (typeof pattern === "function") return pattern(constant);
	else throw new TypeError("Pattern is in unsupported datatype");
};
/**
* Check whether the given request is ignored by configuration
* It will not re-throw exceptions from `list` provided by the client
* @param constant e.g URL of request
* @param [list] List of ignore patterns
* @param [onException] callback for doing something when an exception has
*     occurred
*/
var isLayerIgnored = (name, type, config) => {
	if (Array.isArray(config?.ignoreLayersType) && config?.ignoreLayersType?.includes(type)) return true;
	if (Array.isArray(config?.ignoreLayers) === false) return false;
	try {
		for (const pattern of config.ignoreLayers) if (satisfiesPattern(name, pattern)) return true;
	} catch {}
	return false;
};
/**
* Converts a user-provided error value into an error and error message pair
*
* @param error - User-provided error value
* @returns Both an Error or string representation of the value and an error message
*/
var asErrorAndMessage = (error) => error instanceof Error ? [error, error.message] : [String(error), String(error)];
/**
* Extracts the layer path from the route arguments
*
* @param args - Arguments of the route
* @returns The layer path
*/
var getLayerPath = (args) => {
	const firstArg = args[0];
	if (Array.isArray(firstArg)) return firstArg.map((arg) => extractLayerPathSegment(arg) || "").join(",");
	return extractLayerPathSegment(firstArg);
};
var extractLayerPathSegment = (arg) => {
	if (typeof arg === "string") return arg;
	if (arg instanceof RegExp || typeof arg === "number") return arg.toString();
};
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/express-v5/instrumentation.js
init_esm();
init_esm$1();
var PACKAGE_VERSION$2 = "0.1.0";
var PACKAGE_NAME$2 = "@sentry/instrumentation-express-v5";
/** Express instrumentation for OpenTelemetry */
var ExpressInstrumentationV5 = class extends InstrumentationBase {
	constructor(config = {}) {
		super(PACKAGE_NAME$2, PACKAGE_VERSION$2, config);
	}
	init() {
		return [new InstrumentationNodeModuleDefinition("express", [">=5.0.0"], (moduleExports) => this._setup(moduleExports), (moduleExports) => this._tearDown(moduleExports))];
	}
	_setup(moduleExports) {
		const routerProto = moduleExports.Router.prototype;
		if (isWrapped(routerProto.route)) this._unwrap(routerProto, "route");
		this._wrap(routerProto, "route", this._getRoutePatch());
		if (isWrapped(routerProto.use)) this._unwrap(routerProto, "use");
		this._wrap(routerProto, "use", this._getRouterUsePatch());
		if (isWrapped(moduleExports.application.use)) this._unwrap(moduleExports.application, "use");
		this._wrap(moduleExports.application, "use", this._getAppUsePatch());
		return moduleExports;
	}
	_tearDown(moduleExports) {
		if (moduleExports === void 0) return;
		const routerProto = moduleExports.Router.prototype;
		this._unwrap(routerProto, "route");
		this._unwrap(routerProto, "use");
		this._unwrap(moduleExports.application, "use");
	}
	/**
	* Get the patch for Router.route function
	*/
	_getRoutePatch() {
		const instrumentation = this;
		return function(original) {
			return function route_trace(...args) {
				const route = original.apply(this, args);
				const layer = this.stack[this.stack.length - 1];
				instrumentation._applyPatch(layer, getLayerPath(args));
				return route;
			};
		};
	}
	/**
	* Get the patch for Router.use function
	*/
	_getRouterUsePatch() {
		const instrumentation = this;
		return function(original) {
			return function use(...args) {
				const route = original.apply(this, args);
				const layer = this.stack[this.stack.length - 1];
				instrumentation._applyPatch(layer, getLayerPath(args));
				return route;
			};
		};
	}
	/**
	* Get the patch for Application.use function
	*/
	_getAppUsePatch() {
		const instrumentation = this;
		return function(original) {
			return function use(...args) {
				const router = this.router;
				const route = original.apply(this, args);
				if (router) {
					const layer = router.stack[router.stack.length - 1];
					instrumentation._applyPatch(layer, getLayerPath(args));
				}
				return route;
			};
		};
	}
	/** Patch each express layer to create span and propagate context */
	_applyPatch(layer, layerPath) {
		const instrumentation = this;
		if (layer[kLayerPatched] === true) return;
		layer[kLayerPatched] = true;
		this._wrap(layer, "handle", (original) => {
			if (original.length === 4) return original;
			const patched = function(req, res) {
				storeLayerPath(req, layerPath);
				const route = req[_LAYERS_STORE_PROPERTY].filter((path) => path !== "/" && path !== "/*").join("").replace(/\/{2,}/g, "/");
				const actualRoute = route.length > 0 ? route : void 0;
				const attributes = { [import_src$20.SEMATTRS_HTTP_ROUTE]: actualRoute };
				const metadata = getLayerMetadata(route, layer, layerPath);
				const type = metadata.attributes[AttributeNames$1.EXPRESS_TYPE];
				const rpcMetadata = getRPCMetadata(import_src$21.context.active());
				if (rpcMetadata?.type === RPCType.HTTP) rpcMetadata.route = actualRoute;
				if (isLayerIgnored(metadata.name, type, instrumentation.getConfig())) {
					if (type === ExpressLayerType.MIDDLEWARE) req[_LAYERS_STORE_PROPERTY].pop();
					return original.apply(this, arguments);
				}
				if (import_src$21.trace.getSpan(import_src$21.context.active()) === void 0) return original.apply(this, arguments);
				const spanName = instrumentation._getSpanName({
					request: req,
					layerType: type,
					route
				}, metadata.name);
				const span = instrumentation.tracer.startSpan(spanName, { attributes: Object.assign(attributes, metadata.attributes) });
				const { requestHook } = instrumentation.getConfig();
				if (requestHook) safeExecuteInTheMiddle(() => requestHook(span, {
					request: req,
					layerType: type,
					route
				}), (e) => {
					if (e) import_src$21.diag.error("express instrumentation: request hook failed", e);
				}, true);
				let spanHasEnded = false;
				if (metadata.attributes[AttributeNames$1.EXPRESS_TYPE] !== ExpressLayerType.MIDDLEWARE) {
					span.end();
					spanHasEnded = true;
				}
				const onResponseFinish = () => {
					if (spanHasEnded === false) {
						spanHasEnded = true;
						span.end();
					}
				};
				const args = Array.from(arguments);
				const callbackIdx = args.findIndex((arg) => typeof arg === "function");
				if (callbackIdx >= 0) arguments[callbackIdx] = function() {
					const maybeError = arguments[0];
					const isError = ![
						void 0,
						null,
						"route",
						"router"
					].includes(maybeError);
					if (!spanHasEnded && isError) {
						const [error, message] = asErrorAndMessage(maybeError);
						span.recordException(error);
						span.setStatus({
							code: import_src$21.SpanStatusCode.ERROR,
							message
						});
					}
					if (spanHasEnded === false) {
						spanHasEnded = true;
						req.res?.removeListener("finish", onResponseFinish);
						span.end();
					}
					if (!(req.route && isError)) req[_LAYERS_STORE_PROPERTY].pop();
					return args[callbackIdx].apply(this, arguments);
				};
				try {
					return original.apply(this, arguments);
				} catch (anyError) {
					const [error, message] = asErrorAndMessage(anyError);
					span.recordException(error);
					span.setStatus({
						code: import_src$21.SpanStatusCode.ERROR,
						message
					});
					throw anyError;
				} finally {
					/**
					* At this point if the callback wasn't called, that means either the
					* layer is asynchronous (so it will call the callback later on) or that
					* the layer directly end the http response, so we'll hook into the "finish"
					* event to handle the later case.
					*/
					if (!spanHasEnded) res.once("finish", onResponseFinish);
				}
			};
			for (const key in original) Object.defineProperty(patched, key, {
				get() {
					return original[key];
				},
				set(value) {
					original[key] = value;
				}
			});
			return patched;
		});
	}
	_getSpanName(info, defaultName) {
		const { spanNameHook } = this.getConfig();
		if (!(spanNameHook instanceof Function)) return defaultName;
		try {
			return spanNameHook(info, defaultName) ?? defaultName;
		} catch (err) {
			import_src$21.diag.error("express instrumentation: error calling span name rewrite hook", err);
			return defaultName;
		}
	}
};
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/express.js
var INTEGRATION_NAME$19 = "Express";
var INTEGRATION_NAME_V5$1 = "Express-V5";
function requestHook(span) {
	addOriginToSpan(span, "auto.http.otel.express");
	const attributes = spanToJSON(span).data;
	const type = attributes["express.type"];
	if (type) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `${type}.express`);
	const name = attributes["express.name"];
	if (typeof name === "string") span.updateName(name);
}
function spanNameHook(info, defaultName) {
	if (getIsolationScope() === getDefaultIsolationScope()) {
		DEBUG_BUILD && debug.warn("Isolation scope is still default isolation scope - skipping setting transactionName");
		return defaultName;
	}
	if (info.layerType === "request_handler") {
		const req = info.request;
		const method = req.method ? req.method.toUpperCase() : "GET";
		getIsolationScope().setTransactionName(`${method} ${info.route}`);
	}
	return defaultName;
}
var instrumentExpress = generateInstrumentOnce(INTEGRATION_NAME$19, () => new import_src$16.ExpressInstrumentation({
	requestHook: (span) => requestHook(span),
	spanNameHook: (info, defaultName) => spanNameHook(info, defaultName)
}));
var instrumentExpressV5 = generateInstrumentOnce(INTEGRATION_NAME_V5$1, () => new ExpressInstrumentationV5({
	requestHook: (span) => requestHook(span),
	spanNameHook: (info, defaultName) => spanNameHook(info, defaultName)
}));
var _expressIntegration = (() => {
	return {
		name: INTEGRATION_NAME$19,
		setupOnce() {
			instrumentExpress();
			instrumentExpressV5();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for [Express](https://expressjs.com/).
*
* If you also want to capture errors, you need to call `setupExpressErrorHandler(app)` after you set up your Express server.
*
* For more information, see the [express documentation](https://docs.sentry.io/platforms/javascript/guides/express/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*   integrations: [Sentry.expressIntegration()],
* })
* ```
*/
var expressIntegration = defineIntegration(_expressIntegration);
//#endregion
//#region node_modules/balanced-match/index.js
var require_balanced_match = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = balanced;
	function balanced(a, b, str) {
		if (a instanceof RegExp) a = maybeMatch(a, str);
		if (b instanceof RegExp) b = maybeMatch(b, str);
		var r = range(a, b, str);
		return r && {
			start: r[0],
			end: r[1],
			pre: str.slice(0, r[0]),
			body: str.slice(r[0] + a.length, r[1]),
			post: str.slice(r[1] + b.length)
		};
	}
	function maybeMatch(reg, str) {
		var m = str.match(reg);
		return m ? m[0] : null;
	}
	balanced.range = range;
	function range(a, b, str) {
		var begs, beg, left, right, result;
		var ai = str.indexOf(a);
		var bi = str.indexOf(b, ai + 1);
		var i = ai;
		if (ai >= 0 && bi > 0) {
			if (a === b) return [ai, bi];
			begs = [];
			left = str.length;
			while (i >= 0 && !result) {
				if (i == ai) {
					begs.push(i);
					ai = str.indexOf(a, i + 1);
				} else if (begs.length == 1) result = [begs.pop(), bi];
				else {
					beg = begs.pop();
					if (beg < left) {
						left = beg;
						right = bi;
					}
					bi = str.indexOf(b, i + 1);
				}
				i = ai < bi && ai >= 0 ? ai : bi;
			}
			if (begs.length) result = [left, right];
		}
		return result;
	}
}));
//#endregion
//#region node_modules/@sentry/node/node_modules/minimatch/dist/esm/assert-valid-pattern.js
var import_brace_expansion = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var balanced = require_balanced_match();
	module.exports = expandTop;
	var escSlash = "\0SLASH" + Math.random() + "\0";
	var escOpen = "\0OPEN" + Math.random() + "\0";
	var escClose = "\0CLOSE" + Math.random() + "\0";
	var escComma = "\0COMMA" + Math.random() + "\0";
	var escPeriod = "\0PERIOD" + Math.random() + "\0";
	function numeric(str) {
		return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
	}
	function escapeBraces(str) {
		return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
	}
	function unescapeBraces(str) {
		return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
	}
	function parseCommaParts(str) {
		if (!str) return [""];
		var parts = [];
		var m = balanced("{", "}", str);
		if (!m) return str.split(",");
		var pre = m.pre;
		var body = m.body;
		var post = m.post;
		var p = pre.split(",");
		p[p.length - 1] += "{" + body + "}";
		var postParts = parseCommaParts(post);
		if (post.length) {
			p[p.length - 1] += postParts.shift();
			p.push.apply(p, postParts);
		}
		parts.push.apply(parts, p);
		return parts;
	}
	function expandTop(str, options) {
		if (!str) return [];
		options = options || {};
		var max = options.max == null ? Infinity : options.max;
		if (str.substr(0, 2) === "{}") str = "\\{\\}" + str.substr(2);
		return expand(escapeBraces(str), max, true).map(unescapeBraces);
	}
	function embrace(str) {
		return "{" + str + "}";
	}
	function isPadded(el) {
		return /^-?0\d/.test(el);
	}
	function lte(i, y) {
		return i <= y;
	}
	function gte(i, y) {
		return i >= y;
	}
	function expand(str, max, isTop) {
		var expansions = [];
		for (;;) {
			const m = balanced("{", "}", str);
			if (!m) return [str];
			const pre = m.pre;
			if (/\$$/.test(m.pre)) {
				const post = m.post.length ? expand(m.post, max, false) : [""];
				for (let k = 0; k < post.length && k < max; k++) {
					const expansion = pre + "{" + m.body + "}" + post[k];
					expansions.push(expansion);
				}
				return expansions;
			}
			var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
			var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
			var isSequence = isNumericSequence || isAlphaSequence;
			var isOptions = m.body.indexOf(",") >= 0;
			if (!isSequence && !isOptions) {
				if (m.post.match(/,(?!,).*\}/)) {
					str = m.pre + "{" + m.body + escClose + m.post;
					isTop = true;
					continue;
				}
				return [str];
			}
			const post = m.post.length ? expand(m.post, max, false) : [""];
			var n;
			if (isSequence) n = m.body.split(/\.\./);
			else {
				n = parseCommaParts(m.body);
				if (n.length === 1) {
					n = expand(n[0], max, false).map(embrace);
					if (n.length === 1) return post.map(function(p) {
						return m.pre + n[0] + p;
					});
				}
			}
			var N;
			if (isSequence) {
				var x = numeric(n[0]);
				var y = numeric(n[1]);
				var width = Math.max(n[0].length, n[1].length);
				var incr = n.length == 3 ? Math.max(Math.abs(numeric(n[2])), 1) : 1;
				var test = lte;
				if (y < x) {
					incr *= -1;
					test = gte;
				}
				var pad = n.some(isPadded);
				N = [];
				for (var i = x; test(i, y) && N.length < max; i += incr) {
					var c;
					if (isAlphaSequence) {
						c = String.fromCharCode(i);
						if (c === "\\") c = "";
					} else {
						c = String(i);
						if (pad) {
							var need = width - c.length;
							if (need > 0) {
								var z = new Array(need + 1).join("0");
								if (i < 0) c = "-" + z + c.slice(1);
								else c = z + c;
							}
						}
					}
					N.push(c);
				}
			} else {
				N = [];
				for (var j = 0; j < n.length; j++) N.push.apply(N, expand(n[j], max, false));
			}
			for (var j = 0; j < N.length; j++) for (var k = 0; k < post.length && expansions.length < max; k++) {
				var expansion = pre + N[j] + post[k];
				if (!isTop || isSequence || expansion) expansions.push(expansion);
			}
			return expansions;
		}
	}
})))(), 1);
var MAX_PATTERN_LENGTH = 1024 * 64;
var assertValidPattern = (pattern) => {
	if (typeof pattern !== "string") throw new TypeError("invalid pattern");
	if (pattern.length > MAX_PATTERN_LENGTH) throw new TypeError("pattern is too long");
};
//#endregion
//#region node_modules/@sentry/node/node_modules/minimatch/dist/esm/brace-expressions.js
var posixClasses = {
	"[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true],
	"[:alpha:]": ["\\p{L}\\p{Nl}", true],
	"[:ascii:]": ["\\x00-\\x7f", false],
	"[:blank:]": ["\\p{Zs}\\t", true],
	"[:cntrl:]": ["\\p{Cc}", true],
	"[:digit:]": ["\\p{Nd}", true],
	"[:graph:]": [
		"\\p{Z}\\p{C}",
		true,
		true
	],
	"[:lower:]": ["\\p{Ll}", true],
	"[:print:]": ["\\p{C}", true],
	"[:punct:]": ["\\p{P}", true],
	"[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true],
	"[:upper:]": ["\\p{Lu}", true],
	"[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true],
	"[:xdigit:]": ["A-Fa-f0-9", false]
};
var braceEscape = (s) => s.replace(/[[\]\\-]/g, "\\$&");
var regexpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var rangesToString = (ranges) => ranges.join("");
var parseClass = (glob, position) => {
	const pos = position;
	/* c8 ignore start */
	if (glob.charAt(pos) !== "[") throw new Error("not in a brace expression");
	/* c8 ignore stop */
	const ranges = [];
	const negs = [];
	let i = pos + 1;
	let sawStart = false;
	let uflag = false;
	let escaping = false;
	let negate = false;
	let endPos = pos;
	let rangeStart = "";
	WHILE: while (i < glob.length) {
		const c = glob.charAt(i);
		if ((c === "!" || c === "^") && i === pos + 1) {
			negate = true;
			i++;
			continue;
		}
		if (c === "]" && sawStart && !escaping) {
			endPos = i + 1;
			break;
		}
		sawStart = true;
		if (c === "\\") {
			if (!escaping) {
				escaping = true;
				i++;
				continue;
			}
		}
		if (c === "[" && !escaping) {
			for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)) if (glob.startsWith(cls, i)) {
				if (rangeStart) return [
					"$.",
					false,
					glob.length - pos,
					true
				];
				i += cls.length;
				if (neg) negs.push(unip);
				else ranges.push(unip);
				uflag = uflag || u;
				continue WHILE;
			}
		}
		escaping = false;
		if (rangeStart) {
			if (c > rangeStart) ranges.push(braceEscape(rangeStart) + "-" + braceEscape(c));
			else if (c === rangeStart) ranges.push(braceEscape(c));
			rangeStart = "";
			i++;
			continue;
		}
		if (glob.startsWith("-]", i + 1)) {
			ranges.push(braceEscape(c + "-"));
			i += 2;
			continue;
		}
		if (glob.startsWith("-", i + 1)) {
			rangeStart = c;
			i += 2;
			continue;
		}
		ranges.push(braceEscape(c));
		i++;
	}
	if (endPos < i) return [
		"",
		false,
		0,
		false
	];
	if (!ranges.length && !negs.length) return [
		"$.",
		false,
		glob.length - pos,
		true
	];
	if (negs.length === 0 && ranges.length === 1 && /^\\?.$/.test(ranges[0]) && !negate) return [
		regexpEscape(ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0]),
		false,
		endPos - pos,
		false
	];
	const sranges = "[" + (negate ? "^" : "") + rangesToString(ranges) + "]";
	const snegs = "[" + (negate ? "" : "^") + rangesToString(negs) + "]";
	return [
		ranges.length && negs.length ? "(" + sranges + "|" + snegs + ")" : ranges.length ? sranges : snegs,
		uflag,
		endPos - pos,
		true
	];
};
//#endregion
//#region node_modules/@sentry/node/node_modules/minimatch/dist/esm/unescape.js
/**
* Un-escape a string that has been escaped with {@link escape}.
*
* If the {@link windowsPathsNoEscape} option is used, then square-brace
* escapes are removed, but not backslash escapes.  For example, it will turn
* the string `'[*]'` into `*`, but it will not turn `'\\*'` into `'*'`,
* becuase `\` is a path separator in `windowsPathsNoEscape` mode.
*
* When `windowsPathsNoEscape` is not set, then both brace escapes and
* backslash escapes are removed.
*
* Slashes (and backslashes in `windowsPathsNoEscape` mode) cannot be escaped
* or unescaped.
*/
var unescape = (s, { windowsPathsNoEscape = false } = {}) => {
	return windowsPathsNoEscape ? s.replace(/\[([^\/\\])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2").replace(/\\([^\/])/g, "$1");
};
//#endregion
//#region node_modules/@sentry/node/node_modules/minimatch/dist/esm/ast.js
var _a;
var types = /* @__PURE__ */ new Set([
	"!",
	"?",
	"+",
	"*",
	"@"
]);
var isExtglobType = (c) => types.has(c);
var isExtglobAST = (c) => isExtglobType(c.type);
var adoptionMap = /* @__PURE__ */ new Map([
	["!", ["@"]],
	["?", ["?", "@"]],
	["@", ["@"]],
	["*", [
		"*",
		"+",
		"?",
		"@"
	]],
	["+", ["+", "@"]]
]);
var adoptionWithSpaceMap = /* @__PURE__ */ new Map([
	["!", ["?"]],
	["@", ["?"]],
	["+", ["?", "*"]]
]);
var adoptionAnyMap = /* @__PURE__ */ new Map([
	["!", ["?", "@"]],
	["?", ["?", "@"]],
	["@", ["?", "@"]],
	["*", [
		"*",
		"+",
		"?",
		"@"
	]],
	["+", [
		"+",
		"@",
		"?",
		"*"
	]]
]);
var usurpMap = /* @__PURE__ */ new Map([
	["!", /* @__PURE__ */ new Map([["!", "@"]])],
	["?", /* @__PURE__ */ new Map([["*", "*"], ["+", "*"]])],
	["@", /* @__PURE__ */ new Map([
		["!", "!"],
		["?", "?"],
		["@", "@"],
		["*", "*"],
		["+", "+"]
	])],
	["+", /* @__PURE__ */ new Map([["?", "*"], ["*", "*"]])]
]);
var startNoTraversal = "(?!(?:^|/)\\.\\.?(?:$|/))";
var startNoDot = "(?!\\.)";
var addPatternStart = /* @__PURE__ */ new Set(["[", "."]);
var justDots = /* @__PURE__ */ new Set(["..", "."]);
var reSpecials = /* @__PURE__ */ new Set("().*{}+?[]^$\\!");
var regExpEscape$1 = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var qmark = "[^/]";
var star$1 = "[^/]*?";
var starNoEmpty = "[^/]+?";
var AST = class {
	type;
	#root;
	#hasMagic;
	#uflag = false;
	#parts = [];
	#parent;
	#parentIndex;
	#negs;
	#filledNegs = false;
	#options;
	#toString;
	#emptyExt = false;
	constructor(type, parent, options = {}) {
		this.type = type;
		if (type) this.#hasMagic = true;
		this.#parent = parent;
		this.#root = this.#parent ? this.#parent.#root : this;
		this.#options = this.#root === this ? options : this.#root.#options;
		this.#negs = this.#root === this ? [] : this.#root.#negs;
		if (type === "!" && !this.#root.#filledNegs) this.#negs.push(this);
		this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
	}
	get hasMagic() {
		/* c8 ignore start */
		if (this.#hasMagic !== void 0) return this.#hasMagic;
		/* c8 ignore stop */
		for (const p of this.#parts) {
			if (typeof p === "string") continue;
			if (p.type || p.hasMagic) return this.#hasMagic = true;
		}
		return this.#hasMagic;
	}
	toString() {
		if (this.#toString !== void 0) return this.#toString;
		if (!this.type) return this.#toString = this.#parts.map((p) => String(p)).join("");
		else return this.#toString = this.type + "(" + this.#parts.map((p) => String(p)).join("|") + ")";
	}
	#fillNegs() {
		/* c8 ignore start */
		if (this !== this.#root) throw new Error("should only call on root");
		if (this.#filledNegs) return this;
		/* c8 ignore stop */
		this.toString();
		this.#filledNegs = true;
		let n;
		while (n = this.#negs.pop()) {
			if (n.type !== "!") continue;
			let p = n;
			let pp = p.#parent;
			while (pp) {
				for (let i = p.#parentIndex + 1; !pp.type && i < pp.#parts.length; i++) for (const part of n.#parts) {
					/* c8 ignore start */
					if (typeof part === "string") throw new Error("string part in extglob AST??");
					/* c8 ignore stop */
					part.copyIn(pp.#parts[i]);
				}
				p = pp;
				pp = p.#parent;
			}
		}
		return this;
	}
	push(...parts) {
		for (const p of parts) {
			if (p === "") continue;
			/* c8 ignore start */
			if (typeof p !== "string" && !(p instanceof _a && p.#parent === this)) throw new Error("invalid part: " + p);
			/* c8 ignore stop */
			this.#parts.push(p);
		}
	}
	toJSON() {
		const ret = this.type === null ? this.#parts.slice().map((p) => typeof p === "string" ? p : p.toJSON()) : [this.type, ...this.#parts.map((p) => p.toJSON())];
		if (this.isStart() && !this.type) ret.unshift([]);
		if (this.isEnd() && (this === this.#root || this.#root.#filledNegs && this.#parent?.type === "!")) ret.push({});
		return ret;
	}
	isStart() {
		if (this.#root === this) return true;
		if (!this.#parent?.isStart()) return false;
		if (this.#parentIndex === 0) return true;
		const p = this.#parent;
		for (let i = 0; i < this.#parentIndex; i++) {
			const pp = p.#parts[i];
			if (!(pp instanceof _a && pp.type === "!")) return false;
		}
		return true;
	}
	isEnd() {
		if (this.#root === this) return true;
		if (this.#parent?.type === "!") return true;
		if (!this.#parent?.isEnd()) return false;
		if (!this.type) return this.#parent?.isEnd();
		/* c8 ignore start */
		const pl = this.#parent ? this.#parent.#parts.length : 0;
		/* c8 ignore stop */
		return this.#parentIndex === pl - 1;
	}
	copyIn(part) {
		if (typeof part === "string") this.push(part);
		else this.push(part.clone(this));
	}
	clone(parent) {
		const c = new _a(this.type, parent);
		for (const p of this.#parts) c.copyIn(p);
		return c;
	}
	static #parseAST(str, ast, pos, opt, extDepth) {
		const maxDepth = opt.maxExtglobRecursion ?? 2;
		let escaping = false;
		let inBrace = false;
		let braceStart = -1;
		let braceNeg = false;
		if (ast.type === null) {
			let i = pos;
			let acc = "";
			while (i < str.length) {
				const c = str.charAt(i++);
				if (escaping || c === "\\") {
					escaping = !escaping;
					acc += c;
					continue;
				}
				if (inBrace) {
					if (i === braceStart + 1) {
						if (c === "^" || c === "!") braceNeg = true;
					} else if (c === "]" && !(i === braceStart + 2 && braceNeg)) inBrace = false;
					acc += c;
					continue;
				} else if (c === "[") {
					inBrace = true;
					braceStart = i;
					braceNeg = false;
					acc += c;
					continue;
				}
				if (!opt.noext && isExtglobType(c) && str.charAt(i) === "(" && extDepth <= maxDepth) {
					ast.push(acc);
					acc = "";
					const ext = new _a(c, ast);
					i = _a.#parseAST(str, ext, i, opt, extDepth + 1);
					ast.push(ext);
					continue;
				}
				acc += c;
			}
			ast.push(acc);
			return i;
		}
		let i = pos + 1;
		let part = new _a(null, ast);
		const parts = [];
		let acc = "";
		while (i < str.length) {
			const c = str.charAt(i++);
			if (escaping || c === "\\") {
				escaping = !escaping;
				acc += c;
				continue;
			}
			if (inBrace) {
				if (i === braceStart + 1) {
					if (c === "^" || c === "!") braceNeg = true;
				} else if (c === "]" && !(i === braceStart + 2 && braceNeg)) inBrace = false;
				acc += c;
				continue;
			} else if (c === "[") {
				inBrace = true;
				braceStart = i;
				braceNeg = false;
				acc += c;
				continue;
			}
			/* c8 ignore stop */
			if (isExtglobType(c) && str.charAt(i) === "(" && (extDepth <= maxDepth || ast && ast.#canAdoptType(c))) {
				const depthAdd = ast && ast.#canAdoptType(c) ? 0 : 1;
				part.push(acc);
				acc = "";
				const ext = new _a(c, part);
				part.push(ext);
				i = _a.#parseAST(str, ext, i, opt, extDepth + depthAdd);
				continue;
			}
			if (c === "|") {
				part.push(acc);
				acc = "";
				parts.push(part);
				part = new _a(null, ast);
				continue;
			}
			if (c === ")") {
				if (acc === "" && ast.#parts.length === 0) ast.#emptyExt = true;
				part.push(acc);
				acc = "";
				ast.push(...parts, part);
				return i;
			}
			acc += c;
		}
		ast.type = null;
		ast.#hasMagic = void 0;
		ast.#parts = [str.substring(pos - 1)];
		return i;
	}
	#canAdoptWithSpace(child) {
		return this.#canAdopt(child, adoptionWithSpaceMap);
	}
	#canAdopt(child, map = adoptionMap) {
		if (!child || typeof child !== "object" || child.type !== null || child.#parts.length !== 1 || this.type === null) return false;
		const gc = child.#parts[0];
		if (!gc || typeof gc !== "object" || gc.type === null) return false;
		return this.#canAdoptType(gc.type, map);
	}
	#canAdoptType(c, map = adoptionAnyMap) {
		return !!map.get(this.type)?.includes(c);
	}
	#adoptWithSpace(child, index) {
		const gc = child.#parts[0];
		const blank = new _a(null, gc, this.options);
		blank.#parts.push("");
		gc.push(blank);
		this.#adopt(child, index);
	}
	#adopt(child, index) {
		const gc = child.#parts[0];
		this.#parts.splice(index, 1, ...gc.#parts);
		for (const p of gc.#parts) if (typeof p === "object") p.#parent = this;
		this.#toString = void 0;
	}
	#canUsurpType(c) {
		return !!usurpMap.get(this.type)?.has(c);
	}
	#canUsurp(child) {
		if (!child || typeof child !== "object" || child.type !== null || child.#parts.length !== 1 || this.type === null || this.#parts.length !== 1) return false;
		const gc = child.#parts[0];
		if (!gc || typeof gc !== "object" || gc.type === null) return false;
		return this.#canUsurpType(gc.type);
	}
	#usurp(child) {
		const m = usurpMap.get(this.type);
		const gc = child.#parts[0];
		const nt = m?.get(gc.type);
		/* c8 ignore start - impossible */
		if (!nt) return false;
		/* c8 ignore stop */
		this.#parts = gc.#parts;
		for (const p of this.#parts) if (typeof p === "object") p.#parent = this;
		this.type = nt;
		this.#toString = void 0;
		this.#emptyExt = false;
	}
	#flatten() {
		if (!isExtglobAST(this)) {
			for (const p of this.#parts) if (typeof p === "object") p.#flatten();
		} else {
			let iterations = 0;
			let done = false;
			do {
				done = true;
				for (let i = 0; i < this.#parts.length; i++) {
					const c = this.#parts[i];
					if (typeof c === "object") {
						c.#flatten();
						if (this.#canAdopt(c)) {
							done = false;
							this.#adopt(c, i);
						} else if (this.#canAdoptWithSpace(c)) {
							done = false;
							this.#adoptWithSpace(c, i);
						} else if (this.#canUsurp(c)) {
							done = false;
							this.#usurp(c);
						}
					}
				}
			} while (!done && ++iterations < 10);
		}
		this.#toString = void 0;
	}
	static fromGlob(pattern, options = {}) {
		const ast = new _a(null, void 0, options);
		_a.#parseAST(pattern, ast, 0, options, 0);
		return ast;
	}
	toMMPattern() {
		/* c8 ignore start */
		if (this !== this.#root) return this.#root.toMMPattern();
		/* c8 ignore stop */
		const glob = this.toString();
		const [re, body, hasMagic, uflag] = this.toRegExpSource();
		if (!(hasMagic || this.#hasMagic || this.#options.nocase && !this.#options.nocaseMagicOnly && glob.toUpperCase() !== glob.toLowerCase())) return body;
		const flags = (this.#options.nocase ? "i" : "") + (uflag ? "u" : "");
		return Object.assign(new RegExp(`^${re}$`, flags), {
			_src: re,
			_glob: glob
		});
	}
	get options() {
		return this.#options;
	}
	toRegExpSource(allowDot) {
		const dot = allowDot ?? !!this.#options.dot;
		if (this.#root === this) {
			this.#flatten();
			this.#fillNegs();
		}
		if (!isExtglobAST(this)) {
			const noEmpty = this.isStart() && this.isEnd();
			const src = this.#parts.map((p) => {
				const [re, _, hasMagic, uflag] = typeof p === "string" ? _a.#parseGlob(p, this.#hasMagic, noEmpty) : p.toRegExpSource(allowDot);
				this.#hasMagic = this.#hasMagic || hasMagic;
				this.#uflag = this.#uflag || uflag;
				return re;
			}).join("");
			let start = "";
			if (this.isStart()) {
				if (typeof this.#parts[0] === "string") {
					if (!(this.#parts.length === 1 && justDots.has(this.#parts[0]))) {
						const aps = addPatternStart;
						const needNoTrav = dot && aps.has(src.charAt(0)) || src.startsWith("\\.") && aps.has(src.charAt(2)) || src.startsWith("\\.\\.") && aps.has(src.charAt(4));
						const needNoDot = !dot && !allowDot && aps.has(src.charAt(0));
						start = needNoTrav ? startNoTraversal : needNoDot ? startNoDot : "";
					}
				}
			}
			let end = "";
			if (this.isEnd() && this.#root.#filledNegs && this.#parent?.type === "!") end = "(?:$|\\/)";
			return [
				start + src + end,
				unescape(src),
				this.#hasMagic = !!this.#hasMagic,
				this.#uflag
			];
		}
		const repeated = this.type === "*" || this.type === "+";
		const start = this.type === "!" ? "(?:(?!(?:" : "(?:";
		let body = this.#partsToRegExp(dot);
		if (this.isStart() && this.isEnd() && !body && this.type !== "!") {
			const s = this.toString();
			const me = this;
			me.#parts = [s];
			me.type = null;
			me.#hasMagic = void 0;
			return [
				s,
				unescape(this.toString()),
				false,
				false
			];
		}
		let bodyDotAllowed = !repeated || allowDot || dot || false ? "" : this.#partsToRegExp(true);
		if (bodyDotAllowed === body) bodyDotAllowed = "";
		if (bodyDotAllowed) body = `(?:${body})(?:${bodyDotAllowed})*?`;
		let final = "";
		if (this.type === "!" && this.#emptyExt) final = (this.isStart() && !dot ? startNoDot : "") + starNoEmpty;
		else {
			const close = this.type === "!" ? "))" + (this.isStart() && !dot && !allowDot ? startNoDot : "") + "[^/]*?)" : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && bodyDotAllowed ? ")" : this.type === "*" && bodyDotAllowed ? `)?` : `)${this.type}`;
			final = start + body + close;
		}
		return [
			final,
			unescape(body),
			this.#hasMagic = !!this.#hasMagic,
			this.#uflag
		];
	}
	#partsToRegExp(dot) {
		return this.#parts.map((p) => {
			/* c8 ignore start */
			if (typeof p === "string") throw new Error("string type in extglob ast??");
			/* c8 ignore stop */
			const [re, _, _hasMagic, uflag] = p.toRegExpSource(dot);
			this.#uflag = this.#uflag || uflag;
			return re;
		}).filter((p) => !(this.isStart() && this.isEnd()) || !!p).join("|");
	}
	static #parseGlob(glob, hasMagic, noEmpty = false) {
		let escaping = false;
		let re = "";
		let uflag = false;
		let inStar = false;
		for (let i = 0; i < glob.length; i++) {
			const c = glob.charAt(i);
			if (escaping) {
				escaping = false;
				re += (reSpecials.has(c) ? "\\" : "") + c;
				inStar = false;
				continue;
			}
			if (c === "\\") {
				if (i === glob.length - 1) re += "\\\\";
				else escaping = true;
				continue;
			}
			if (c === "[") {
				const [src, needUflag, consumed, magic] = parseClass(glob, i);
				if (consumed) {
					re += src;
					uflag = uflag || needUflag;
					i += consumed - 1;
					hasMagic = hasMagic || magic;
					inStar = false;
					continue;
				}
			}
			if (c === "*") {
				if (inStar) continue;
				inStar = true;
				re += noEmpty && /^[*]+$/.test(glob) ? starNoEmpty : star$1;
				hasMagic = true;
				continue;
			} else inStar = false;
			if (c === "?") {
				re += qmark;
				hasMagic = true;
				continue;
			}
			re += regExpEscape$1(c);
		}
		return [
			re,
			unescape(glob),
			!!hasMagic,
			uflag
		];
	}
};
_a = AST;
//#endregion
//#region node_modules/@sentry/node/node_modules/minimatch/dist/esm/escape.js
/**
* Escape all magic characters in a glob pattern.
*
* If the {@link windowsPathsNoEscape | GlobOptions.windowsPathsNoEscape}
* option is used, then characters are escaped by wrapping in `[]`, because
* a magic character wrapped in a character class can only be satisfied by
* that exact character.  In this mode, `\` is _not_ escaped, because it is
* not interpreted as a magic character, but instead as a path separator.
*/
var escape = (s, { windowsPathsNoEscape = false } = {}) => {
	return windowsPathsNoEscape ? s.replace(/[?*()[\]]/g, "[$&]") : s.replace(/[?*()[\]\\]/g, "\\$&");
};
//#endregion
//#region node_modules/@sentry/node/node_modules/minimatch/dist/esm/index.js
var minimatch = (p, pattern, options = {}) => {
	assertValidPattern(pattern);
	if (!options.nocomment && pattern.charAt(0) === "#") return false;
	return new Minimatch(pattern, options).match(p);
};
var starDotExtRE = /^\*+([^+@!?\*\[\(]*)$/;
var starDotExtTest = (ext) => (f) => !f.startsWith(".") && f.endsWith(ext);
var starDotExtTestDot = (ext) => (f) => f.endsWith(ext);
var starDotExtTestNocase = (ext) => {
	ext = ext.toLowerCase();
	return (f) => !f.startsWith(".") && f.toLowerCase().endsWith(ext);
};
var starDotExtTestNocaseDot = (ext) => {
	ext = ext.toLowerCase();
	return (f) => f.toLowerCase().endsWith(ext);
};
var starDotStarRE = /^\*+\.\*+$/;
var starDotStarTest = (f) => !f.startsWith(".") && f.includes(".");
var starDotStarTestDot = (f) => f !== "." && f !== ".." && f.includes(".");
var dotStarRE = /^\.\*+$/;
var dotStarTest = (f) => f !== "." && f !== ".." && f.startsWith(".");
var starRE = /^\*+$/;
var starTest = (f) => f.length !== 0 && !f.startsWith(".");
var starTestDot = (f) => f.length !== 0 && f !== "." && f !== "..";
var qmarksRE = /^\?+([^+@!?\*\[\(]*)?$/;
var qmarksTestNocase = ([$0, ext = ""]) => {
	const noext = qmarksTestNoExt([$0]);
	if (!ext) return noext;
	ext = ext.toLowerCase();
	return (f) => noext(f) && f.toLowerCase().endsWith(ext);
};
var qmarksTestNocaseDot = ([$0, ext = ""]) => {
	const noext = qmarksTestNoExtDot([$0]);
	if (!ext) return noext;
	ext = ext.toLowerCase();
	return (f) => noext(f) && f.toLowerCase().endsWith(ext);
};
var qmarksTestDot = ([$0, ext = ""]) => {
	const noext = qmarksTestNoExtDot([$0]);
	return !ext ? noext : (f) => noext(f) && f.endsWith(ext);
};
var qmarksTest = ([$0, ext = ""]) => {
	const noext = qmarksTestNoExt([$0]);
	return !ext ? noext : (f) => noext(f) && f.endsWith(ext);
};
var qmarksTestNoExt = ([$0]) => {
	const len = $0.length;
	return (f) => f.length === len && !f.startsWith(".");
};
var qmarksTestNoExtDot = ([$0]) => {
	const len = $0.length;
	return (f) => f.length === len && f !== "." && f !== "..";
};
/* c8 ignore start */
var defaultPlatform = typeof process === "object" && process ? typeof process.env === "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
var path = {
	win32: { sep: "\\" },
	posix: { sep: "/" }
};
minimatch.sep = defaultPlatform === "win32" ? path.win32.sep : path.posix.sep;
var GLOBSTAR = Symbol("globstar **");
minimatch.GLOBSTAR = GLOBSTAR;
var star = "[^/]*?";
var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
var filter = (pattern, options = {}) => (p) => minimatch(p, pattern, options);
minimatch.filter = filter;
var ext = (a, b = {}) => Object.assign({}, a, b);
var defaults = (def) => {
	if (!def || typeof def !== "object" || !Object.keys(def).length) return minimatch;
	const orig = minimatch;
	const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
	return Object.assign(m, {
		Minimatch: class Minimatch extends orig.Minimatch {
			constructor(pattern, options = {}) {
				super(pattern, ext(def, options));
			}
			static defaults(options) {
				return orig.defaults(ext(def, options)).Minimatch;
			}
		},
		AST: class AST extends orig.AST {
			/* c8 ignore start */
			constructor(type, parent, options = {}) {
				super(type, parent, ext(def, options));
			}
			/* c8 ignore stop */
			static fromGlob(pattern, options = {}) {
				return orig.AST.fromGlob(pattern, ext(def, options));
			}
		},
		unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
		escape: (s, options = {}) => orig.escape(s, ext(def, options)),
		filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
		defaults: (options) => orig.defaults(ext(def, options)),
		makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
		braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
		match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
		sep: orig.sep,
		GLOBSTAR
	});
};
minimatch.defaults = defaults;
var braceExpand = (pattern, options = {}) => {
	assertValidPattern(pattern);
	if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) return [pattern];
	return (0, import_brace_expansion.default)(pattern);
};
minimatch.braceExpand = braceExpand;
var makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
minimatch.makeRe = makeRe;
var match = (list, pattern, options = {}) => {
	const mm = new Minimatch(pattern, options);
	list = list.filter((f) => mm.match(f));
	if (mm.options.nonull && !list.length) list.push(pattern);
	return list;
};
minimatch.match = match;
var globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var Minimatch = class {
	options;
	set;
	pattern;
	windowsPathsNoEscape;
	nonegate;
	negate;
	comment;
	empty;
	preserveMultipleSlashes;
	partial;
	globSet;
	globParts;
	nocase;
	isWindows;
	platform;
	windowsNoMagicRoot;
	maxGlobstarRecursion;
	regexp;
	constructor(pattern, options = {}) {
		assertValidPattern(pattern);
		options = options || {};
		this.options = options;
		this.maxGlobstarRecursion = options.maxGlobstarRecursion ?? 200;
		this.pattern = pattern;
		this.platform = options.platform || defaultPlatform;
		this.isWindows = this.platform === "win32";
		this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
		if (this.windowsPathsNoEscape) this.pattern = this.pattern.replace(/\\/g, "/");
		this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
		this.regexp = null;
		this.negate = false;
		this.nonegate = !!options.nonegate;
		this.comment = false;
		this.empty = false;
		this.partial = !!options.partial;
		this.nocase = !!this.options.nocase;
		this.windowsNoMagicRoot = options.windowsNoMagicRoot !== void 0 ? options.windowsNoMagicRoot : !!(this.isWindows && this.nocase);
		this.globSet = [];
		this.globParts = [];
		this.set = [];
		this.make();
	}
	hasMagic() {
		if (this.options.magicalBraces && this.set.length > 1) return true;
		for (const pattern of this.set) for (const part of pattern) if (typeof part !== "string") return true;
		return false;
	}
	debug(..._) {}
	make() {
		const pattern = this.pattern;
		const options = this.options;
		if (!options.nocomment && pattern.charAt(0) === "#") {
			this.comment = true;
			return;
		}
		if (!pattern) {
			this.empty = true;
			return;
		}
		this.parseNegate();
		this.globSet = [...new Set(this.braceExpand())];
		if (options.debug) this.debug = (...args) => console.error(...args);
		this.debug(this.pattern, this.globSet);
		const rawGlobParts = this.globSet.map((s) => this.slashSplit(s));
		this.globParts = this.preprocess(rawGlobParts);
		this.debug(this.pattern, this.globParts);
		let set = this.globParts.map((s, _, __) => {
			if (this.isWindows && this.windowsNoMagicRoot) {
				const isUNC = s[0] === "" && s[1] === "" && (s[2] === "?" || !globMagic.test(s[2])) && !globMagic.test(s[3]);
				const isDrive = /^[a-z]:/i.test(s[0]);
				if (isUNC) return [...s.slice(0, 4), ...s.slice(4).map((ss) => this.parse(ss))];
				else if (isDrive) return [s[0], ...s.slice(1).map((ss) => this.parse(ss))];
			}
			return s.map((ss) => this.parse(ss));
		});
		this.debug(this.pattern, set);
		this.set = set.filter((s) => s.indexOf(false) === -1);
		if (this.isWindows) for (let i = 0; i < this.set.length; i++) {
			const p = this.set[i];
			if (p[0] === "" && p[1] === "" && this.globParts[i][2] === "?" && typeof p[3] === "string" && /^[a-z]:$/i.test(p[3])) p[2] = "?";
		}
		this.debug(this.pattern, this.set);
	}
	preprocess(globParts) {
		if (this.options.noglobstar) {
			for (let i = 0; i < globParts.length; i++) for (let j = 0; j < globParts[i].length; j++) if (globParts[i][j] === "**") globParts[i][j] = "*";
		}
		const { optimizationLevel = 1 } = this.options;
		if (optimizationLevel >= 2) {
			globParts = this.firstPhasePreProcess(globParts);
			globParts = this.secondPhasePreProcess(globParts);
		} else if (optimizationLevel >= 1) globParts = this.levelOneOptimize(globParts);
		else globParts = this.adjascentGlobstarOptimize(globParts);
		return globParts;
	}
	adjascentGlobstarOptimize(globParts) {
		return globParts.map((parts) => {
			let gs = -1;
			while (-1 !== (gs = parts.indexOf("**", gs + 1))) {
				let i = gs;
				while (parts[i + 1] === "**") i++;
				if (i !== gs) parts.splice(gs, i - gs);
			}
			return parts;
		});
	}
	levelOneOptimize(globParts) {
		return globParts.map((parts) => {
			parts = parts.reduce((set, part) => {
				const prev = set[set.length - 1];
				if (part === "**" && prev === "**") return set;
				if (part === "..") {
					if (prev && prev !== ".." && prev !== "." && prev !== "**") {
						set.pop();
						return set;
					}
				}
				set.push(part);
				return set;
			}, []);
			return parts.length === 0 ? [""] : parts;
		});
	}
	levelTwoFileOptimize(parts) {
		if (!Array.isArray(parts)) parts = this.slashSplit(parts);
		let didSomething = false;
		do {
			didSomething = false;
			if (!this.preserveMultipleSlashes) {
				for (let i = 1; i < parts.length - 1; i++) {
					const p = parts[i];
					if (i === 1 && p === "" && parts[0] === "") continue;
					if (p === "." || p === "") {
						didSomething = true;
						parts.splice(i, 1);
						i--;
					}
				}
				if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
					didSomething = true;
					parts.pop();
				}
			}
			let dd = 0;
			while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
				const p = parts[dd - 1];
				if (p && p !== "." && p !== ".." && p !== "**") {
					didSomething = true;
					parts.splice(dd - 1, 2);
					dd -= 2;
				}
			}
		} while (didSomething);
		return parts.length === 0 ? [""] : parts;
	}
	firstPhasePreProcess(globParts) {
		let didSomething = false;
		do {
			didSomething = false;
			for (let parts of globParts) {
				let gs = -1;
				while (-1 !== (gs = parts.indexOf("**", gs + 1))) {
					let gss = gs;
					while (parts[gss + 1] === "**") gss++;
					if (gss > gs) parts.splice(gs + 1, gss - gs);
					let next = parts[gs + 1];
					const p = parts[gs + 2];
					const p2 = parts[gs + 3];
					if (next !== "..") continue;
					if (!p || p === "." || p === ".." || !p2 || p2 === "." || p2 === "..") continue;
					didSomething = true;
					parts.splice(gs, 1);
					const other = parts.slice(0);
					other[gs] = "**";
					globParts.push(other);
					gs--;
				}
				if (!this.preserveMultipleSlashes) {
					for (let i = 1; i < parts.length - 1; i++) {
						const p = parts[i];
						if (i === 1 && p === "" && parts[0] === "") continue;
						if (p === "." || p === "") {
							didSomething = true;
							parts.splice(i, 1);
							i--;
						}
					}
					if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
						didSomething = true;
						parts.pop();
					}
				}
				let dd = 0;
				while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
					const p = parts[dd - 1];
					if (p && p !== "." && p !== ".." && p !== "**") {
						didSomething = true;
						const splin = dd === 1 && parts[dd + 1] === "**" ? ["."] : [];
						parts.splice(dd - 1, 2, ...splin);
						if (parts.length === 0) parts.push("");
						dd -= 2;
					}
				}
			}
		} while (didSomething);
		return globParts;
	}
	secondPhasePreProcess(globParts) {
		for (let i = 0; i < globParts.length - 1; i++) for (let j = i + 1; j < globParts.length; j++) {
			const matched = this.partsMatch(globParts[i], globParts[j], !this.preserveMultipleSlashes);
			if (matched) {
				globParts[i] = [];
				globParts[j] = matched;
				break;
			}
		}
		return globParts.filter((gs) => gs.length);
	}
	partsMatch(a, b, emptyGSMatch = false) {
		let ai = 0;
		let bi = 0;
		let result = [];
		let which = "";
		while (ai < a.length && bi < b.length) if (a[ai] === b[bi]) {
			result.push(which === "b" ? b[bi] : a[ai]);
			ai++;
			bi++;
		} else if (emptyGSMatch && a[ai] === "**" && b[bi] === a[ai + 1]) {
			result.push(a[ai]);
			ai++;
		} else if (emptyGSMatch && b[bi] === "**" && a[ai] === b[bi + 1]) {
			result.push(b[bi]);
			bi++;
		} else if (a[ai] === "*" && b[bi] && (this.options.dot || !b[bi].startsWith(".")) && b[bi] !== "**") {
			if (which === "b") return false;
			which = "a";
			result.push(a[ai]);
			ai++;
			bi++;
		} else if (b[bi] === "*" && a[ai] && (this.options.dot || !a[ai].startsWith(".")) && a[ai] !== "**") {
			if (which === "a") return false;
			which = "b";
			result.push(b[bi]);
			ai++;
			bi++;
		} else return false;
		return a.length === b.length && result;
	}
	parseNegate() {
		if (this.nonegate) return;
		const pattern = this.pattern;
		let negate = false;
		let negateOffset = 0;
		for (let i = 0; i < pattern.length && pattern.charAt(i) === "!"; i++) {
			negate = !negate;
			negateOffset++;
		}
		if (negateOffset) this.pattern = pattern.slice(negateOffset);
		this.negate = negate;
	}
	matchOne(file, pattern, partial = false) {
		let fileStartIndex = 0;
		let patternStartIndex = 0;
		if (this.isWindows) {
			const fileDrive = typeof file[0] === "string" && /^[a-z]:$/i.test(file[0]);
			const fileUNC = !fileDrive && file[0] === "" && file[1] === "" && file[2] === "?" && /^[a-z]:$/i.test(file[3]);
			const patternDrive = typeof pattern[0] === "string" && /^[a-z]:$/i.test(pattern[0]);
			const patternUNC = !patternDrive && pattern[0] === "" && pattern[1] === "" && pattern[2] === "?" && typeof pattern[3] === "string" && /^[a-z]:$/i.test(pattern[3]);
			const fdi = fileUNC ? 3 : fileDrive ? 0 : void 0;
			const pdi = patternUNC ? 3 : patternDrive ? 0 : void 0;
			if (typeof fdi === "number" && typeof pdi === "number") {
				const [fd, pd] = [file[fdi], pattern[pdi]];
				if (fd.toLowerCase() === pd.toLowerCase()) {
					pattern[pdi] = fd;
					patternStartIndex = pdi;
					fileStartIndex = fdi;
				}
			}
		}
		const { optimizationLevel = 1 } = this.options;
		if (optimizationLevel >= 2) file = this.levelTwoFileOptimize(file);
		if (pattern.includes(GLOBSTAR)) return this.#matchGlobstar(file, pattern, partial, fileStartIndex, patternStartIndex);
		return this.#matchOne(file, pattern, partial, fileStartIndex, patternStartIndex);
	}
	#matchGlobstar(file, pattern, partial, fileIndex, patternIndex) {
		const firstgs = pattern.indexOf(GLOBSTAR, patternIndex);
		const lastgs = pattern.lastIndexOf(GLOBSTAR);
		const [head, body, tail] = partial ? [
			pattern.slice(patternIndex, firstgs),
			pattern.slice(firstgs + 1),
			[]
		] : [
			pattern.slice(patternIndex, firstgs),
			pattern.slice(firstgs + 1, lastgs),
			pattern.slice(lastgs + 1)
		];
		if (head.length) {
			const fileHead = file.slice(fileIndex, fileIndex + head.length);
			if (!this.#matchOne(fileHead, head, partial, 0, 0)) return false;
			fileIndex += head.length;
		}
		let fileTailMatch = 0;
		if (tail.length) {
			if (tail.length + fileIndex > file.length) return false;
			let tailStart = file.length - tail.length;
			if (this.#matchOne(file, tail, partial, tailStart, 0)) fileTailMatch = tail.length;
			else {
				if (file[file.length - 1] !== "" || fileIndex + tail.length === file.length) return false;
				tailStart--;
				if (!this.#matchOne(file, tail, partial, tailStart, 0)) return false;
				fileTailMatch = tail.length + 1;
			}
		}
		if (!body.length) {
			let sawSome = !!fileTailMatch;
			for (let i = fileIndex; i < file.length - fileTailMatch; i++) {
				const f = String(file[i]);
				sawSome = true;
				if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) return false;
			}
			return partial || sawSome;
		}
		const bodySegments = [[[], 0]];
		let currentBody = bodySegments[0];
		let nonGsParts = 0;
		const nonGsPartsSums = [0];
		for (const b of body) if (b === GLOBSTAR) {
			nonGsPartsSums.push(nonGsParts);
			currentBody = [[], 0];
			bodySegments.push(currentBody);
		} else {
			currentBody[0].push(b);
			nonGsParts++;
		}
		let i = bodySegments.length - 1;
		const fileLength = file.length - fileTailMatch;
		for (const b of bodySegments) b[1] = fileLength - (nonGsPartsSums[i--] + b[0].length);
		return !!this.#matchGlobStarBodySections(file, bodySegments, fileIndex, 0, partial, 0, !!fileTailMatch);
	}
	#matchGlobStarBodySections(file, bodySegments, fileIndex, bodyIndex, partial, globStarDepth, sawTail) {
		const bs = bodySegments[bodyIndex];
		if (!bs) {
			for (let i = fileIndex; i < file.length; i++) {
				sawTail = true;
				const f = file[i];
				if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) return false;
			}
			return sawTail;
		}
		const [body, after] = bs;
		while (fileIndex <= after) {
			if (this.#matchOne(file.slice(0, fileIndex + body.length), body, partial, fileIndex, 0) && globStarDepth < this.maxGlobstarRecursion) {
				const sub = this.#matchGlobStarBodySections(file, bodySegments, fileIndex + body.length, bodyIndex + 1, partial, globStarDepth + 1, sawTail);
				if (sub !== false) return sub;
			}
			const f = file[fileIndex];
			if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) return false;
			fileIndex++;
		}
		return partial || null;
	}
	#matchOne(file, pattern, partial, fileIndex, patternIndex) {
		let fi;
		let pi;
		let pl;
		let fl;
		for (fi = fileIndex, pi = patternIndex, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
			this.debug("matchOne loop");
			let p = pattern[pi];
			let f = file[fi];
			this.debug(pattern, p, f);
			/* c8 ignore start */
			if (p === false || p === GLOBSTAR) return false;
			/* c8 ignore stop */
			let hit;
			if (typeof p === "string") {
				hit = f === p;
				this.debug("string match", p, f, hit);
			} else {
				hit = p.test(f);
				this.debug("pattern match", p, f, hit);
			}
			if (!hit) return false;
		}
		if (fi === fl && pi === pl) return true;
		else if (fi === fl) return partial;
		else if (pi === pl) return fi === fl - 1 && file[fi] === "";
		else throw new Error("wtf?");
		/* c8 ignore stop */
	}
	braceExpand() {
		return braceExpand(this.pattern, this.options);
	}
	parse(pattern) {
		assertValidPattern(pattern);
		const options = this.options;
		if (pattern === "**") return GLOBSTAR;
		if (pattern === "") return "";
		let m;
		let fastTest = null;
		if (m = pattern.match(starRE)) fastTest = options.dot ? starTestDot : starTest;
		else if (m = pattern.match(starDotExtRE)) fastTest = (options.nocase ? options.dot ? starDotExtTestNocaseDot : starDotExtTestNocase : options.dot ? starDotExtTestDot : starDotExtTest)(m[1]);
		else if (m = pattern.match(qmarksRE)) fastTest = (options.nocase ? options.dot ? qmarksTestNocaseDot : qmarksTestNocase : options.dot ? qmarksTestDot : qmarksTest)(m);
		else if (m = pattern.match(starDotStarRE)) fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
		else if (m = pattern.match(dotStarRE)) fastTest = dotStarTest;
		const re = AST.fromGlob(pattern, this.options).toMMPattern();
		if (fastTest && typeof re === "object") Reflect.defineProperty(re, "test", { value: fastTest });
		return re;
	}
	makeRe() {
		if (this.regexp || this.regexp === false) return this.regexp;
		const set = this.set;
		if (!set.length) {
			this.regexp = false;
			return this.regexp;
		}
		const options = this.options;
		const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
		const flags = new Set(options.nocase ? ["i"] : []);
		let re = set.map((pattern) => {
			const pp = pattern.map((p) => {
				if (p instanceof RegExp) for (const f of p.flags.split("")) flags.add(f);
				return typeof p === "string" ? regExpEscape(p) : p === GLOBSTAR ? GLOBSTAR : p._src;
			});
			pp.forEach((p, i) => {
				const next = pp[i + 1];
				const prev = pp[i - 1];
				if (p !== GLOBSTAR || prev === GLOBSTAR) return;
				if (prev === void 0) if (next !== void 0 && next !== GLOBSTAR) pp[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + next;
				else pp[i] = twoStar;
				else if (next === void 0) pp[i - 1] = prev + "(?:\\/|" + twoStar + ")?";
				else if (next !== GLOBSTAR) {
					pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + "\\/)" + next;
					pp[i + 1] = GLOBSTAR;
				}
			});
			return pp.filter((p) => p !== GLOBSTAR).join("/");
		}).join("|");
		const [open, close] = set.length > 1 ? ["(?:", ")"] : ["", ""];
		re = "^" + open + re + close + "$";
		if (this.negate) re = "^(?!" + re + ").+$";
		try {
			this.regexp = new RegExp(re, [...flags].join(""));
		} catch (ex) {
			this.regexp = false;
		}
		/* c8 ignore stop */
		return this.regexp;
	}
	slashSplit(p) {
		if (this.preserveMultipleSlashes) return p.split("/");
		else if (this.isWindows && /^\/\/[^\/]+/.test(p)) return ["", ...p.split(/\/+/)];
		else return p.split(/\/+/);
	}
	match(f, partial = this.partial) {
		this.debug("match", f, this.pattern);
		if (this.comment) return false;
		if (this.empty) return f === "";
		if (f === "/" && partial) return true;
		const options = this.options;
		if (this.isWindows) f = f.split("\\").join("/");
		const ff = this.slashSplit(f);
		this.debug(this.pattern, "split", ff);
		const set = this.set;
		this.debug(this.pattern, "set", set);
		let filename = ff[ff.length - 1];
		if (!filename) for (let i = ff.length - 2; !filename && i >= 0; i--) filename = ff[i];
		for (let i = 0; i < set.length; i++) {
			const pattern = set[i];
			let file = ff;
			if (options.matchBase && pattern.length === 1) file = [filename];
			if (this.matchOne(file, pattern, partial)) {
				if (options.flipNegate) return true;
				return !this.negate;
			}
		}
		if (options.flipNegate) return false;
		return this.negate;
	}
	static defaults(def) {
		return minimatch.defaults(def).Minimatch;
	}
};
/* c8 ignore stop */
minimatch.AST = AST;
minimatch.Minimatch = Minimatch;
minimatch.escape = escape;
minimatch.unescape = unescape;
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/fastify/fastify-otel/index.js
init_esm();
init_esm$1();
var PACKAGE_NAME$1 = "@fastify/otel";
var PACKAGE_VERSION$1 = "0.8.0";
var SUPPORTED_VERSIONS$1 = ">=4.0.0 <6";
var FASTIFY_HOOKS = [
	"onRequest",
	"preParsing",
	"preValidation",
	"preHandler",
	"preSerialization",
	"onSend",
	"onResponse",
	"onError"
];
var ATTRIBUTE_NAMES = {
	HOOK_NAME: "hook.name",
	FASTIFY_TYPE: "fastify.type",
	HOOK_CALLBACK_NAME: "hook.callback.name",
	ROOT: "fastify.root"
};
var HOOK_TYPES = {
	ROUTE: "route-hook",
	INSTANCE: "hook",
	HANDLER: "request-handler"
};
var ANONYMOUS_FUNCTION_NAME = "anonymous";
var kInstrumentation = Symbol("fastify otel instance");
var kRequestSpan = Symbol("fastify otel request spans");
var kRequestContext = Symbol("fastify otel request context");
var kAddHookOriginal = Symbol("fastify otel addhook original");
var kSetNotFoundOriginal = Symbol("fastify otel setnotfound original");
var kIgnorePaths = Symbol("fastify otel ignore path");
var FastifyOtelInstrumentation = class extends InstrumentationBase {
	constructor(config) {
		super(PACKAGE_NAME$1, PACKAGE_VERSION$1, config);
		this.servername = config?.servername ?? process.env.OTEL_SERVICE_NAME ?? "fastify";
		this[kIgnorePaths] = null;
		this._logger = import_src$21.diag.createComponentLogger({ namespace: PACKAGE_NAME$1 });
		if (config?.ignorePaths != null || process.env.OTEL_FASTIFY_IGNORE_PATHS != null) {
			const ignorePaths = config?.ignorePaths ?? process.env.OTEL_FASTIFY_IGNORE_PATHS;
			if ((typeof ignorePaths !== "string" || ignorePaths.length === 0) && typeof ignorePaths !== "function") throw new TypeError("ignorePaths must be a string or a function");
			const globMatcher = minimatch;
			this[kIgnorePaths] = (routeOptions) => {
				if (typeof ignorePaths === "function") return ignorePaths(routeOptions);
				else return globMatcher(routeOptions.url, ignorePaths);
			};
		}
	}
	enable() {
		if (this._handleInitialization === void 0 && this.getConfig().registerOnInitialization) {
			const FastifyInstrumentationPlugin = this.plugin();
			this._handleInitialization = (message) => {
				message.fastify.register(FastifyInstrumentationPlugin);
			};
			dc__default.subscribe("fastify.initialization", this._handleInitialization);
		}
		return super.enable();
	}
	disable() {
		if (this._handleInitialization) {
			dc__default.unsubscribe("fastify.initialization", this._handleInitialization);
			this._handleInitialization = void 0;
		}
		return super.disable();
	}
	init() {
		return [];
	}
	plugin() {
		const instrumentation = this;
		FastifyInstrumentationPlugin[Symbol.for("skip-override")] = true;
		FastifyInstrumentationPlugin[Symbol.for("fastify.display-name")] = "@fastify/otel";
		FastifyInstrumentationPlugin[Symbol.for("plugin-meta")] = {
			fastify: SUPPORTED_VERSIONS$1,
			name: "@fastify/otel"
		};
		return FastifyInstrumentationPlugin;
		function FastifyInstrumentationPlugin(instance, opts, done) {
			instance.decorate(kInstrumentation, instrumentation);
			instance.decorate(kAddHookOriginal, instance.addHook);
			instance.decorate(kSetNotFoundOriginal, instance.setNotFoundHandler);
			instance.decorateRequest("opentelemetry", function openetelemetry() {
				const ctx = this[kRequestContext];
				return {
					span: this[kRequestSpan],
					tracer: instrumentation.tracer,
					context: ctx,
					inject: (carrier, setter) => {
						return import_src$21.propagation.inject(ctx, carrier, setter);
					},
					extract: (carrier, getter) => {
						return import_src$21.propagation.extract(ctx, carrier, getter);
					}
				};
			});
			instance.decorateRequest(kRequestSpan, null);
			instance.decorateRequest(kRequestContext, null);
			instance.addHook("onRoute", function(routeOptions) {
				if (instrumentation[kIgnorePaths]?.(routeOptions) === true) {
					instrumentation._logger.debug(`Ignoring route instrumentation ${routeOptions.method} ${routeOptions.url} because it matches the ignore path`);
					return;
				}
				for (const hook of FASTIFY_HOOKS) if (routeOptions[hook] != null) {
					const handlerLike = routeOptions[hook];
					if (typeof handlerLike === "function") routeOptions[hook] = handlerWrapper(handlerLike, {
						[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
						[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
						[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
						[import_src$20.ATTR_HTTP_ROUTE]: routeOptions.url,
						[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handlerLike.name?.length > 0 ? handlerLike.name : ANONYMOUS_FUNCTION_NAME
					});
					else if (Array.isArray(handlerLike)) {
						const wrappedHandlers = [];
						for (const handler of handlerLike) wrappedHandlers.push(handlerWrapper(handler, {
							[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
							[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
							[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
							[import_src$20.ATTR_HTTP_ROUTE]: routeOptions.url,
							[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
						}));
						routeOptions[hook] = wrappedHandlers;
					}
				}
				if (routeOptions.onSend != null) routeOptions.onSend = Array.isArray(routeOptions.onSend) ? [...routeOptions.onSend, onSendHook] : [routeOptions.onSend, onSendHook];
				else routeOptions.onSend = onSendHook;
				if (routeOptions.onError != null) routeOptions.onError = Array.isArray(routeOptions.onError) ? [...routeOptions.onError, onErrorHook] : [routeOptions.onError, onErrorHook];
				else routeOptions.onError = onErrorHook;
				routeOptions.handler = handlerWrapper(routeOptions.handler, {
					[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
					[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route-handler`,
					[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.HANDLER,
					[import_src$20.ATTR_HTTP_ROUTE]: routeOptions.url,
					[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: routeOptions.handler.name.length > 0 ? routeOptions.handler.name : ANONYMOUS_FUNCTION_NAME
				});
			});
			instance.addHook("onRequest", function(request, _reply, hookDone) {
				if (this[kInstrumentation].isEnabled() === false) return hookDone();
				else if (this[kInstrumentation][kIgnorePaths]?.({
					url: request.url,
					method: request.method
				}) === true) {
					this[kInstrumentation]._logger.debug(`Ignoring request ${request.method} ${request.url} because it matches the ignore path`);
					return hookDone();
				}
				let ctx = import_src$21.context.active();
				if (import_src$21.trace.getSpan(ctx) == null) ctx = import_src$21.propagation.extract(ctx, request.headers);
				const rpcMetadata = getRPCMetadata(ctx);
				if (request.routeOptions.url != null && rpcMetadata?.type === RPCType.HTTP) rpcMetadata.route = request.routeOptions.url;
				/** @type {import('@opentelemetry/api').Span} */
				const span = this[kInstrumentation].tracer.startSpan("request", { attributes: {
					[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
					[ATTRIBUTE_NAMES.ROOT]: "@fastify/otel",
					[import_src$20.ATTR_HTTP_ROUTE]: request.url,
					[import_src$20.ATTR_HTTP_REQUEST_METHOD]: request.method
				} }, ctx);
				request[kRequestContext] = import_src$21.trace.setSpan(ctx, span);
				request[kRequestSpan] = span;
				import_src$21.context.with(request[kRequestContext], () => {
					hookDone();
				});
			});
			instance.addHook("onResponse", function(request, reply, hookDone) {
				const span = request[kRequestSpan];
				if (span != null) {
					span.setStatus({
						code: import_src$21.SpanStatusCode.OK,
						message: "OK"
					});
					span.setAttributes({ [import_src$20.ATTR_HTTP_RESPONSE_STATUS_CODE]: 404 });
					span.end();
				}
				request[kRequestSpan] = null;
				hookDone();
			});
			instance.addHook = addHookPatched;
			instance.setNotFoundHandler = setNotFoundHandlerPatched;
			done();
			function onSendHook(request, reply, payload, hookDone) {
				/** @type {import('@opentelemetry/api').Span} */
				const span = request[kRequestSpan];
				if (span != null) {
					if (reply.statusCode < 500) span.setStatus({
						code: import_src$21.SpanStatusCode.OK,
						message: "OK"
					});
					span.setAttributes({ [import_src$20.ATTR_HTTP_RESPONSE_STATUS_CODE]: reply.statusCode });
					span.end();
				}
				request[kRequestSpan] = null;
				hookDone(null, payload);
			}
			function onErrorHook(request, reply, error, hookDone) {
				/** @type {Span} */
				const span = request[kRequestSpan];
				if (span != null) {
					span.setStatus({
						code: import_src$21.SpanStatusCode.ERROR,
						message: error.message
					});
					span.recordException(error);
				}
				hookDone();
			}
			function addHookPatched(name, hook) {
				const addHookOriginal = this[kAddHookOriginal];
				if (FASTIFY_HOOKS.includes(name)) return addHookOriginal.call(this, name, handlerWrapper(hook, {
					[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
					[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - ${name}`,
					[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
					[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hook.name?.length > 0 ? hook.name : ANONYMOUS_FUNCTION_NAME
				}));
				else return addHookOriginal.call(this, name, hook);
			}
			function setNotFoundHandlerPatched(hooks, handler) {
				const setNotFoundHandlerOriginal = this[kSetNotFoundOriginal];
				if (typeof hooks === "function") {
					handler = handlerWrapper(hooks, {
						[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
						[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
						[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
						[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.name?.length > 0 ? hooks.name : ANONYMOUS_FUNCTION_NAME
					});
					setNotFoundHandlerOriginal.call(this, handler);
				} else {
					if (hooks.preValidation != null) hooks.preValidation = handlerWrapper(hooks.preValidation, {
						[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
						[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preValidation`,
						[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
						[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preValidation.name?.length > 0 ? hooks.preValidation.name : ANONYMOUS_FUNCTION_NAME
					});
					if (hooks.preHandler != null) hooks.preHandler = handlerWrapper(hooks.preHandler, {
						[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
						[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preHandler`,
						[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
						[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preHandler.name?.length > 0 ? hooks.preHandler.name : ANONYMOUS_FUNCTION_NAME
					});
					handler = handlerWrapper(handler, {
						[import_src$20.ATTR_SERVICE_NAME]: instance[kInstrumentation].servername,
						[ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
						[ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
						[ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
					});
					setNotFoundHandlerOriginal.call(this, hooks, handler);
				}
			}
			function handlerWrapper(handler, spanAttributes = {}) {
				return function handlerWrapped(...args) {
					/** @type {FastifyOtelInstrumentation} */
					const instrumentation = this[kInstrumentation];
					const [request] = args;
					if (instrumentation.isEnabled() === false) return handler.call(this, ...args);
					const ctx = request[kRequestContext] ?? import_src$21.context.active();
					const span = instrumentation.tracer.startSpan(`handler - ${handler.name?.length > 0 ? handler.name : this.pluginName ?? ANONYMOUS_FUNCTION_NAME}`, { attributes: spanAttributes }, ctx);
					return import_src$21.context.with(import_src$21.trace.setSpan(ctx, span), function() {
						try {
							const res = handler.call(this, ...args);
							if (typeof res?.then === "function") return res.then((result) => {
								span.end();
								return result;
							}, (error) => {
								span.setStatus({
									code: import_src$21.SpanStatusCode.ERROR,
									message: error.message
								});
								span.recordException(error);
								span.end();
								return Promise.reject(error);
							});
							span.end();
							return res;
						} catch (error) {
							span.setStatus({
								code: import_src$21.SpanStatusCode.ERROR,
								message: error.message
							});
							span.recordException(error);
							span.end();
							throw error;
						}
					}, this);
				};
			}
		}
	}
};
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/fastify/v3/enums/AttributeNames.js
var AttributeNames;
(function(AttributeNames) {
	AttributeNames["FASTIFY_NAME"] = "fastify.name";
	AttributeNames["FASTIFY_TYPE"] = "fastify.type";
	AttributeNames["HOOK_NAME"] = "hook.name";
	AttributeNames["PLUGIN_NAME"] = "plugin.name";
})(AttributeNames || (AttributeNames = {}));
var FastifyTypes;
(function(FastifyTypes) {
	FastifyTypes["MIDDLEWARE"] = "middleware";
	FastifyTypes["REQUEST_HANDLER"] = "request_handler";
})(FastifyTypes || (FastifyTypes = {}));
var FastifyNames;
(function(FastifyNames) {
	FastifyNames["MIDDLEWARE"] = "middleware";
	FastifyNames["REQUEST_HANDLER"] = "request handler";
})(FastifyNames || (FastifyNames = {}));
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/fastify/v3/constants.js
var spanRequestSymbol = Symbol("opentelemetry.instrumentation.fastify.request_active_span");
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/fastify/v3/utils.js
/**
* Starts Span
* @param reply - reply function
* @param tracer - tracer
* @param spanName - span name
* @param spanAttributes - span attributes
*/
function startSpan(reply, tracer, spanName, spanAttributes = {}) {
	const span = tracer.startSpan(spanName, { attributes: spanAttributes });
	const spans = reply[spanRequestSymbol] || [];
	spans.push(span);
	Object.defineProperty(reply, spanRequestSymbol, {
		enumerable: false,
		configurable: true,
		value: spans
	});
	return span;
}
/**
* Ends span
* @param reply - reply function
* @param err - error
*/
function endSpan(reply, err) {
	const spans = reply[spanRequestSymbol] || [];
	if (!spans.length) return;
	spans.forEach((span) => {
		if (err) {
			span.setStatus({
				code: import_src$21.SpanStatusCode.ERROR,
				message: err.message
			});
			span.recordException(err);
		}
		span.end();
	});
	delete reply[spanRequestSymbol];
}
/**
* This function handles the missing case from instrumentation package when
* execute can either return a promise or void. And using async is not an
* option as it is producing unwanted side effects.
* @param execute - function to be executed
* @param onFinish - function called when function executed
* @param preventThrowingError - prevent to throw error when execute
* function fails
*/
function safeExecuteInTheMiddleMaybePromise(execute, onFinish, preventThrowingError) {
	let error;
	let result = void 0;
	try {
		result = execute();
		if (isPromise(result)) result.then((res) => onFinish(void 0, res), (err) => onFinish(err));
	} catch (e) {
		error = e;
	} finally {
		if (!isPromise(result)) {
			onFinish(error, result);
			if (error && true) throw error;
		}
		return result;
	}
}
function isPromise(val) {
	return typeof val === "object" && val && typeof Object.getOwnPropertyDescriptor(val, "then")?.value === "function" || false;
}
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/fastify/v3/instrumentation.js
init_esm();
init_esm$1();
/** @knipignore */
var PACKAGE_VERSION = "0.1.0";
var PACKAGE_NAME = "@sentry/instrumentation-fastify-v3";
var ANONYMOUS_NAME = "anonymous";
var hooksNamesToWrap = /* @__PURE__ */ new Set([
	"onTimeout",
	"onRequest",
	"preParsing",
	"preValidation",
	"preSerialization",
	"preHandler",
	"onSend",
	"onResponse",
	"onError"
]);
/**
* Fastify instrumentation for OpenTelemetry
*/
var FastifyInstrumentationV3 = class extends InstrumentationBase {
	constructor(config = {}) {
		super(PACKAGE_NAME, PACKAGE_VERSION, config);
	}
	init() {
		return [new InstrumentationNodeModuleDefinition("fastify", [">=3.0.0 <4"], (moduleExports) => {
			return this._patchConstructor(moduleExports);
		})];
	}
	_hookOnRequest() {
		const instrumentation = this;
		return function onRequest(request, reply, done) {
			if (!instrumentation.isEnabled()) return done();
			instrumentation._wrap(reply, "send", instrumentation._patchSend());
			const anyRequest = request;
			const rpcMetadata = getRPCMetadata(import_src$21.context.active());
			const routeName = anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath;
			if (routeName && rpcMetadata?.type === RPCType.HTTP) rpcMetadata.route = routeName;
			const method = request.method || "GET";
			getIsolationScope().setTransactionName(`${method} ${routeName}`);
			done();
		};
	}
	_wrapHandler(pluginName, hookName, original, syncFunctionWithDone) {
		const instrumentation = this;
		this._diag.debug("Patching fastify route.handler function");
		return function(...args) {
			if (!instrumentation.isEnabled()) return original.apply(this, args);
			const name = original.name || pluginName || ANONYMOUS_NAME;
			const spanName = `${FastifyNames.MIDDLEWARE} - ${name}`;
			const reply = args[1];
			const span = startSpan(reply, instrumentation.tracer, spanName, {
				[AttributeNames.FASTIFY_TYPE]: FastifyTypes.MIDDLEWARE,
				[AttributeNames.PLUGIN_NAME]: pluginName,
				[AttributeNames.HOOK_NAME]: hookName
			});
			const origDone = syncFunctionWithDone && args[args.length - 1];
			if (origDone) args[args.length - 1] = function(...doneArgs) {
				endSpan(reply);
				origDone.apply(this, doneArgs);
			};
			return import_src$21.context.with(import_src$21.trace.setSpan(import_src$21.context.active(), span), () => {
				return safeExecuteInTheMiddleMaybePromise(() => {
					return original.apply(this, args);
				}, (err) => {
					if (err instanceof Error) {
						span.setStatus({
							code: import_src$21.SpanStatusCode.ERROR,
							message: err.message
						});
						span.recordException(err);
					}
					if (!syncFunctionWithDone) endSpan(reply);
				});
			});
		};
	}
	_wrapAddHook() {
		const instrumentation = this;
		this._diag.debug("Patching fastify server.addHook function");
		return function(original) {
			return function wrappedAddHook(...args) {
				const name = args[0];
				const handler = args[1];
				const pluginName = this.pluginName;
				if (!hooksNamesToWrap.has(name)) return original.apply(this, args);
				const syncFunctionWithDone = typeof args[args.length - 1] === "function" && handler.constructor.name !== "AsyncFunction";
				return original.apply(this, [name, instrumentation._wrapHandler(pluginName, name, handler, syncFunctionWithDone)]);
			};
		};
	}
	_patchConstructor(moduleExports) {
		const instrumentation = this;
		function fastify(...args) {
			const app = moduleExports.fastify.apply(this, args);
			app.addHook("onRequest", instrumentation._hookOnRequest());
			app.addHook("preHandler", instrumentation._hookPreHandler());
			instrumentClient$1();
			instrumentation._wrap(app, "addHook", instrumentation._wrapAddHook());
			return app;
		}
		if (moduleExports.errorCodes !== void 0) fastify.errorCodes = moduleExports.errorCodes;
		fastify.fastify = fastify;
		fastify.default = fastify;
		return fastify;
	}
	_patchSend() {
		const instrumentation = this;
		this._diag.debug("Patching fastify reply.send function");
		return function patchSend(original) {
			return function send(...args) {
				const maybeError = args[0];
				if (!instrumentation.isEnabled()) return original.apply(this, args);
				return safeExecuteInTheMiddle(() => {
					return original.apply(this, args);
				}, (err) => {
					if (!err && maybeError instanceof Error) err = maybeError;
					endSpan(this, err);
				});
			};
		};
	}
	_hookPreHandler() {
		const instrumentation = this;
		this._diag.debug("Patching fastify preHandler function");
		return function preHandler(request, reply, done) {
			if (!instrumentation.isEnabled()) return done();
			const anyRequest = request;
			const handler = anyRequest.routeOptions?.handler || anyRequest.context?.handler;
			const handlerName = handler?.name.startsWith("bound ") ? handler.name.substring(6) : handler?.name;
			const spanName = `${FastifyNames.REQUEST_HANDLER} - ${handlerName || this.pluginName || ANONYMOUS_NAME}`;
			const spanAttributes = {
				[AttributeNames.PLUGIN_NAME]: this.pluginName,
				[AttributeNames.FASTIFY_TYPE]: FastifyTypes.REQUEST_HANDLER,
				[import_src$20.SEMATTRS_HTTP_ROUTE]: anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath
			};
			if (handlerName) spanAttributes[AttributeNames.FASTIFY_NAME] = handlerName;
			const span = startSpan(reply, instrumentation.tracer, spanName, spanAttributes);
			addFastifyV3SpanAttributes(span);
			const { requestHook } = instrumentation.getConfig();
			if (requestHook) safeExecuteInTheMiddle(() => requestHook(span, { request }), (e) => {
				if (e) instrumentation._diag.error("request hook failed", e);
			}, true);
			return import_src$21.context.with(import_src$21.trace.setSpan(import_src$21.context.active(), span), () => {
				done();
			});
		};
	}
};
function instrumentClient$1() {
	const client = getClient();
	if (client) client.on("spanStart", (span) => {
		addFastifyV3SpanAttributes(span);
	});
}
function addFastifyV3SpanAttributes(span) {
	const attributes = spanToJSON(span).data;
	const type = attributes["fastify.type"];
	if (attributes["sentry.op"] || !type) return;
	span.setAttributes({
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.fastify`
	});
	const name = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
	if (typeof name === "string") {
		const updatedName = name.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "");
		span.updateName(updatedName);
	}
}
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/fastify/index.js
/**
* Options for the Fastify integration.
*
* `shouldHandleError` - Callback method deciding whether error should be captured and sent to Sentry
* This is used on Fastify v5 where Sentry handles errors in the diagnostics channel.
* Fastify v3 and v4 use `setupFastifyErrorHandler` instead.
*
* @example
*
* ```javascript
* Sentry.init({
*   integrations: [
*     Sentry.fastifyIntegration({
*       shouldHandleError(_error, _request, reply) {
*         return reply.statusCode >= 500;
*       },
*     });
*   },
* });
* ```
*
*/
var INTEGRATION_NAME$18 = "Fastify";
var INTEGRATION_NAME_V5 = "Fastify-V5";
var instrumentFastifyV3 = generateInstrumentOnce("Fastify-V3", () => new FastifyInstrumentationV3());
function getFastifyIntegration() {
	const client = getClient();
	if (!client) return;
	else return client.getIntegrationByName(INTEGRATION_NAME$18);
}
function handleFastifyError(error, request, reply, handlerOrigin) {
	const shouldHandleError = getFastifyIntegration()?.getShouldHandleError() || defaultShouldHandleError;
	if (handlerOrigin === "diagnostics-channel") this.diagnosticsChannelExists = true;
	if (this.diagnosticsChannelExists && handlerOrigin === "onError-hook") {
		DEBUG_BUILD && debug.warn("Fastify error handler was already registered via diagnostics channel.", "You can safely remove `setupFastifyErrorHandler` call and set `shouldHandleError` on the integration options.");
		return;
	}
	if (shouldHandleError(error, request, reply)) captureException(error, { mechanism: {
		handled: false,
		type: "fastify"
	} });
}
var instrumentFastify = generateInstrumentOnce(INTEGRATION_NAME_V5, () => {
	const fastifyOtelInstrumentationInstance = new FastifyOtelInstrumentation();
	const plugin = fastifyOtelInstrumentationInstance.plugin();
	diagnosticsChannel.subscribe("fastify.initialization", (message) => {
		const fastifyInstance = message.fastify;
		fastifyInstance?.register(plugin).after((err) => {
			if (err) DEBUG_BUILD && debug.error("Failed to setup Fastify instrumentation", err);
			else {
				instrumentClient();
				if (fastifyInstance) instrumentOnRequest(fastifyInstance);
			}
		});
	});
	diagnosticsChannel.subscribe("tracing:fastify.request.handler:error", (message) => {
		const { error, request, reply } = message;
		handleFastifyError.call(handleFastifyError, error, request, reply, "diagnostics-channel");
	});
	return fastifyOtelInstrumentationInstance;
});
var _fastifyIntegration = (({ shouldHandleError }) => {
	let _shouldHandleError;
	return {
		name: INTEGRATION_NAME$18,
		setupOnce() {
			_shouldHandleError = shouldHandleError || defaultShouldHandleError;
			instrumentFastifyV3();
			instrumentFastify();
		},
		getShouldHandleError() {
			return _shouldHandleError;
		},
		setShouldHandleError(fn) {
			_shouldHandleError = fn;
		}
	};
});
/**
* Adds Sentry tracing instrumentation for [Fastify](https://fastify.dev/).
*
* If you also want to capture errors, you need to call `setupFastifyErrorHandler(app)` after you set up your Fastify server.
*
* For more information, see the [fastify documentation](https://docs.sentry.io/platforms/javascript/guides/fastify/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*   integrations: [Sentry.fastifyIntegration()],
* })
* ```
*/
var fastifyIntegration = defineIntegration((options = {}) => _fastifyIntegration(options));
/**
* Default function to determine if an error should be sent to Sentry
*
* 3xx and 4xx errors are not sent by default.
*/
function defaultShouldHandleError(_error, _request, reply) {
	const statusCode = reply.statusCode;
	return statusCode >= 500 || statusCode <= 299;
}
function addFastifySpanAttributes(span) {
	const spanJSON = spanToJSON(span);
	const spanName = spanJSON.description;
	const attributes = spanJSON.data;
	const type = attributes["fastify.type"];
	const isHook = type === "hook";
	const isHandler = type === spanName?.startsWith("handler -");
	const isRequestHandler = spanName === "request" || type === "request-handler";
	if (attributes["sentry.op"] || !isHandler && !isRequestHandler && !isHook) return;
	const opPrefix = isHook ? "hook" : isHandler ? "middleware" : isRequestHandler ? "request-handler" : "<unknown>";
	span.setAttributes({
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${opPrefix}.fastify`
	});
	const attrName = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
	if (typeof attrName === "string") {
		const updatedName = attrName.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "");
		span.updateName(updatedName);
	}
}
function instrumentClient() {
	const client = getClient();
	if (client) client.on("spanStart", (span) => {
		addFastifySpanAttributes(span);
	});
}
function instrumentOnRequest(fastify) {
	fastify.addHook("onRequest", async (request, _reply) => {
		if (request.opentelemetry) {
			const { span } = request.opentelemetry();
			if (span) addFastifySpanAttributes(span);
		}
		const routeName = request.routeOptions?.url;
		const method = request.method || "GET";
		getIsolationScope().setTransactionName(`${method} ${routeName}`);
	});
}
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/graphql.js
var import_src$15 = require_src$7();
var INTEGRATION_NAME$17 = "Graphql";
var instrumentGraphql = generateInstrumentOnce(INTEGRATION_NAME$17, import_src$15.GraphQLInstrumentation, (_options) => {
	const options = getOptionsWithDefaults(_options);
	return {
		...options,
		responseHook(span, result) {
			addOriginToSpan(span, "auto.graphql.otel.graphql");
			if (result.errors?.length && !spanToJSON(span).status) span.setStatus({ code: import_src$21.SpanStatusCode.ERROR });
			const attributes = spanToJSON(span).data;
			const operationType = attributes["graphql.operation.type"];
			const operationName = attributes["graphql.operation.name"];
			if (options.useOperationNameForRootSpan && operationType) {
				const rootSpan = getRootSpan(span);
				const existingOperations = spanToJSON(rootSpan).data["sentry.graphql.operation"] || [];
				const newOperation = operationName ? `${operationType} ${operationName}` : `${operationType}`;
				if (Array.isArray(existingOperations)) {
					existingOperations.push(newOperation);
					rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, existingOperations);
				} else if (typeof existingOperations === "string") rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, [existingOperations, newOperation]);
				else rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, newOperation);
				if (!spanToJSON(rootSpan).data["original-description"]) rootSpan.setAttribute("original-description", spanToJSON(rootSpan).description);
				rootSpan.updateName(`${spanToJSON(rootSpan).data["original-description"]} (${getGraphqlOperationNamesFromAttribute(existingOperations)})`);
			}
		}
	};
});
var _graphqlIntegration = ((options = {}) => {
	return {
		name: INTEGRATION_NAME$17,
		setupOnce() {
			instrumentGraphql(getOptionsWithDefaults(options));
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [graphql](https://www.npmjs.com/package/graphql) library.
*
* For more information, see the [`graphqlIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/graphql/).
*
* @param {GraphqlOptions} options Configuration options for the GraphQL integration.
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.graphqlIntegration()],
* });
*/
var graphqlIntegration = defineIntegration(_graphqlIntegration);
function getOptionsWithDefaults(options) {
	return {
		ignoreResolveSpans: true,
		ignoreTrivialResolveSpans: true,
		useOperationNameForRootSpan: true,
		...options
	};
}
function getGraphqlOperationNamesFromAttribute(attr) {
	if (Array.isArray(attr)) {
		const sorted = attr.slice().sort();
		if (sorted.length <= 5) return sorted.join(", ");
		else return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
	}
	return `${attr}`;
}
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/kafka.js
var import_src$14 = require_src$8();
var INTEGRATION_NAME$16 = "Kafka";
var instrumentKafka = generateInstrumentOnce(INTEGRATION_NAME$16, () => new import_src$14.KafkaJsInstrumentation({
	consumerHook(span) {
		addOriginToSpan(span, "auto.kafkajs.otel.consumer");
	},
	producerHook(span) {
		addOriginToSpan(span, "auto.kafkajs.otel.producer");
	}
}));
var _kafkaIntegration = (() => {
	return {
		name: INTEGRATION_NAME$16,
		setupOnce() {
			instrumentKafka();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [kafkajs](https://www.npmjs.com/package/kafkajs) library.
*
* For more information, see the [`kafkaIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/kafka/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.kafkaIntegration()],
* });
*/
var kafkaIntegration = defineIntegration(_kafkaIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/lrumemoizer.js
var import_src$13 = require_src$9();
var INTEGRATION_NAME$15 = "LruMemoizer";
var instrumentLruMemoizer = generateInstrumentOnce(INTEGRATION_NAME$15, () => new import_src$13.LruMemoizerInstrumentation());
var _lruMemoizerIntegration = (() => {
	return {
		name: INTEGRATION_NAME$15,
		setupOnce() {
			instrumentLruMemoizer();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [lru-memoizer](https://www.npmjs.com/package/lru-memoizer) library.
*
* For more information, see the [`lruMemoizerIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/lrumemoizer/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.lruMemoizerIntegration()],
* });
*/
var lruMemoizerIntegration = defineIntegration(_lruMemoizerIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/mongo.js
var import_src$12 = require_src$10();
var INTEGRATION_NAME$14 = "Mongo";
var instrumentMongo = generateInstrumentOnce(INTEGRATION_NAME$14, () => new import_src$12.MongoDBInstrumentation({
	dbStatementSerializer: _defaultDbStatementSerializer,
	responseHook(span) {
		addOriginToSpan(span, "auto.db.otel.mongo");
	}
}));
/**
* Replaces values in document with '?', hiding PII and helping grouping.
*/
function _defaultDbStatementSerializer(commandObj) {
	const resultObj = _scrubStatement(commandObj);
	return JSON.stringify(resultObj);
}
function _scrubStatement(value) {
	if (Array.isArray(value)) return value.map((element) => _scrubStatement(element));
	if (isCommandObj(value)) return Object.entries(value).map(([key, element]) => [key, _scrubStatement(element)]).reduce((prev, current) => {
		if (isCommandEntry(current)) prev[current[0]] = current[1];
		return prev;
	}, {});
	return "?";
}
function isCommandObj(value) {
	return typeof value === "object" && value !== null && !isBuffer(value);
}
function isBuffer(value) {
	let isBuffer = false;
	if (typeof Buffer !== "undefined") isBuffer = Buffer.isBuffer(value);
	return isBuffer;
}
function isCommandEntry(value) {
	return Array.isArray(value);
}
var _mongoIntegration = (() => {
	return {
		name: INTEGRATION_NAME$14,
		setupOnce() {
			instrumentMongo();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [mongodb](https://www.npmjs.com/package/mongodb) library.
*
* For more information, see the [`mongoIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/mongo/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.mongoIntegration()],
* });
* ```
*/
var mongoIntegration = defineIntegration(_mongoIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/mongoose.js
var import_src$11 = require_src$11();
var INTEGRATION_NAME$13 = "Mongoose";
var instrumentMongoose = generateInstrumentOnce(INTEGRATION_NAME$13, () => new import_src$11.MongooseInstrumentation({ responseHook(span) {
	addOriginToSpan(span, "auto.db.otel.mongoose");
} }));
var _mongooseIntegration = (() => {
	return {
		name: INTEGRATION_NAME$13,
		setupOnce() {
			instrumentMongoose();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [mongoose](https://www.npmjs.com/package/mongoose) library.
*
* For more information, see the [`mongooseIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/mongoose/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.mongooseIntegration()],
* });
* ```
*/
var mongooseIntegration = defineIntegration(_mongooseIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/mysql.js
var import_src$10 = require_src$12();
var INTEGRATION_NAME$12 = "Mysql";
var instrumentMysql = generateInstrumentOnce(INTEGRATION_NAME$12, () => new import_src$10.MySQLInstrumentation({}));
var _mysqlIntegration = (() => {
	return {
		name: INTEGRATION_NAME$12,
		setupOnce() {
			instrumentMysql();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [mysql](https://www.npmjs.com/package/mysql) library.
*
* For more information, see the [`mysqlIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/mysql/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.mysqlIntegration()],
* });
* ```
*/
var mysqlIntegration = defineIntegration(_mysqlIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/mysql2.js
var import_src$9 = require_src$13();
var INTEGRATION_NAME$11 = "Mysql2";
var instrumentMysql2 = generateInstrumentOnce(INTEGRATION_NAME$11, () => new import_src$9.MySQL2Instrumentation({ responseHook(span) {
	addOriginToSpan(span, "auto.db.otel.mysql2");
} }));
var _mysql2Integration = (() => {
	return {
		name: INTEGRATION_NAME$11,
		setupOnce() {
			instrumentMysql2();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [mysql2](https://www.npmjs.com/package/mysql2) library.
*
* For more information, see the [`mysql2Integration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/mysql2/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.mysqlIntegration()],
* });
* ```
*/
var mysql2Integration = defineIntegration(_mysql2Integration);
//#endregion
//#region node_modules/@sentry/node/build/esm/utils/redisCache.js
var import_src$7 = require_src$14();
var import_src$8 = require_src$15();
var SINGLE_ARG_COMMANDS = [
	"get",
	"set",
	"setex"
];
var GET_COMMANDS = ["get", "mget"];
var SET_COMMANDS = ["set", "setex"];
/** Checks if a given command is in the list of redis commands.
*  Useful because commands can come in lowercase or uppercase (depending on the library). */
function isInCommands(redisCommands, command) {
	return redisCommands.includes(command.toLowerCase());
}
/** Determine cache operation based on redis statement */
function getCacheOperation(command) {
	if (isInCommands(GET_COMMANDS, command)) return "cache.get";
	else if (isInCommands(SET_COMMANDS, command)) return "cache.put";
	else return;
}
function keyHasPrefix(key, prefixes) {
	return prefixes.some((prefix) => key.startsWith(prefix));
}
/** Safely converts a redis key to a string (comma-separated if there are multiple keys) */
function getCacheKeySafely(redisCommand, cmdArgs) {
	try {
		if (cmdArgs.length === 0) return;
		const processArg = (arg) => {
			if (typeof arg === "string" || typeof arg === "number" || Buffer.isBuffer(arg)) return [arg.toString()];
			else if (Array.isArray(arg)) return flatten(arg.map((arg) => processArg(arg)));
			else return ["<unknown>"];
		};
		const firstArg = cmdArgs[0];
		if (isInCommands(SINGLE_ARG_COMMANDS, redisCommand) && firstArg != null) return processArg(firstArg);
		return flatten(cmdArgs.map((arg) => processArg(arg)));
	} catch {
		return;
	}
}
/** Determines whether a redis operation should be considered as "cache operation" by checking if a key is prefixed.
*  We only support certain commands (such as 'set', 'get', 'mget'). */
function shouldConsiderForCache(redisCommand, keys, prefixes) {
	if (!getCacheOperation(redisCommand)) return false;
	for (const key of keys) if (keyHasPrefix(key, prefixes)) return true;
	return false;
}
/** Calculates size based on the cache response value */
function calculateCacheItemSize(response) {
	const getSize = (value) => {
		try {
			if (Buffer.isBuffer(value)) return value.byteLength;
			else if (typeof value === "string") return value.length;
			else if (typeof value === "number") return value.toString().length;
			else if (value === null || value === void 0) return 0;
			return JSON.stringify(value).length;
		} catch {
			return;
		}
	};
	return Array.isArray(response) ? response.reduce((acc, curr) => {
		const size = getSize(curr);
		return typeof size === "number" ? acc !== void 0 ? acc + size : size : acc;
	}, 0) : getSize(response);
}
function flatten(input) {
	const result = [];
	const flattenHelper = (input) => {
		input.forEach((el) => {
			if (Array.isArray(el)) flattenHelper(el);
			else result.push(el);
		});
	};
	flattenHelper(input);
	return result;
}
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/redis.js
var INTEGRATION_NAME$10 = "Redis";
var _redisOptions = {};
var cacheResponseHook = (span, redisCommand, cmdArgs, response) => {
	span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.redis");
	const safeKey = getCacheKeySafely(redisCommand, cmdArgs);
	const cacheOperation = getCacheOperation(redisCommand);
	if (!safeKey || !cacheOperation || !_redisOptions.cachePrefixes || !shouldConsiderForCache(redisCommand, safeKey, _redisOptions.cachePrefixes)) return;
	const networkPeerAddress = spanToJSON(span).data["net.peer.name"];
	const networkPeerPort = spanToJSON(span).data["net.peer.port"];
	if (networkPeerPort && networkPeerAddress) span.setAttributes({
		"network.peer.address": networkPeerAddress,
		"network.peer.port": networkPeerPort
	});
	const cacheItemSize = calculateCacheItemSize(response);
	if (cacheItemSize) span.setAttribute(SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, cacheItemSize);
	if (isInCommands(GET_COMMANDS, redisCommand) && cacheItemSize !== void 0) span.setAttribute(SEMANTIC_ATTRIBUTE_CACHE_HIT, cacheItemSize > 0);
	span.setAttributes({
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: cacheOperation,
		[SEMANTIC_ATTRIBUTE_CACHE_KEY]: safeKey
	});
	const spanDescription = safeKey.join(", ");
	span.updateName(truncate(spanDescription, 1024));
};
var instrumentIORedis = generateInstrumentOnce("IORedis", () => {
	return new import_src$7.IORedisInstrumentation({ responseHook: cacheResponseHook });
});
var instrumentRedis4 = generateInstrumentOnce("Redis-4", () => {
	return new import_src$8.RedisInstrumentation({ responseHook: cacheResponseHook });
});
/** To be able to preload all Redis OTel instrumentations with just one ID ("Redis"), all the instrumentations are generated in this one function  */
var instrumentRedis = Object.assign(() => {
	instrumentIORedis();
	instrumentRedis4();
}, { id: INTEGRATION_NAME$10 });
var _redisIntegration = ((options = {}) => {
	return {
		name: INTEGRATION_NAME$10,
		setupOnce() {
			_redisOptions = options;
			instrumentRedis();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [redis](https://www.npmjs.com/package/redis) and
* [ioredis](https://www.npmjs.com/package/ioredis) libraries.
*
* For more information, see the [`redisIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/redis/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.redisIntegration()],
* });
* ```
*/
var redisIntegration = defineIntegration(_redisIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/postgres.js
var import_src$6 = require_src$16();
var INTEGRATION_NAME$9 = "Postgres";
var instrumentPostgres = generateInstrumentOnce(INTEGRATION_NAME$9, () => new import_src$6.PgInstrumentation({
	requireParentSpan: true,
	requestHook(span) {
		addOriginToSpan(span, "auto.db.otel.postgres");
	}
}));
var _postgresIntegration = (() => {
	return {
		name: INTEGRATION_NAME$9,
		setupOnce() {
			instrumentPostgres();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [pg](https://www.npmjs.com/package/pg) library.
*
* For more information, see the [`postgresIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/postgres/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.postgresIntegration()],
* });
* ```
*/
var postgresIntegration = defineIntegration(_postgresIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/postgresjs.js
init_esm$1();
var INTEGRATION_NAME$8 = "PostgresJs";
var SUPPORTED_VERSIONS = [">=3.0.0 <4"];
var instrumentPostgresJs = generateInstrumentOnce(INTEGRATION_NAME$8, (options) => new PostgresJsInstrumentation({
	requireParentSpan: options?.requireParentSpan ?? true,
	requestHook: options?.requestHook
}));
/**
* Instrumentation for the [postgres](https://www.npmjs.com/package/postgres) library.
* This instrumentation captures postgresjs queries and their attributes,
*/
var PostgresJsInstrumentation = class extends InstrumentationBase {
	constructor(config) {
		super("sentry-postgres-js", SDK_VERSION, config);
	}
	/**
	* Initializes the instrumentation.
	*/
	init() {
		const instrumentationModule = new InstrumentationNodeModuleDefinition("postgres", SUPPORTED_VERSIONS);
		[
			"src",
			"cf/src",
			"cjs/src"
		].forEach((path) => {
			instrumentationModule.files.push(new InstrumentationNodeModuleFile(`postgres/${path}/connection.js`, ["*"], this._patchConnection.bind(this), this._unwrap.bind(this)));
			instrumentationModule.files.push(new InstrumentationNodeModuleFile(`postgres/${path}/query.js`, SUPPORTED_VERSIONS, this._patchQuery.bind(this), this._unwrap.bind(this)));
		});
		return [instrumentationModule];
	}
	/**
	* Determines whether a span should be created based on the current context.
	* If `requireParentSpan` is set to true in the configuration, a span will
	* only be created if there is a parent span available.
	*/
	_shouldCreateSpans() {
		const config = this.getConfig();
		return import_src$21.trace.getSpan(import_src$21.context.active()) !== void 0 || !config.requireParentSpan;
	}
	/**
	* Patches the reject method of the Query class to set the span status and end it
	*/
	_patchReject(rejectTarget, span) {
		return new Proxy(rejectTarget, { apply: (rejectTarget, rejectThisArg, rejectArgs) => {
			span.setStatus({
				code: 2,
				message: rejectArgs?.[0]?.message || "unknown_error"
			});
			const result = Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
			span.setAttribute(import_src$20.ATTR_DB_RESPONSE_STATUS_CODE, rejectArgs?.[0]?.code || "Unknown error");
			span.setAttribute(import_src$20.ATTR_ERROR_TYPE, rejectArgs?.[0]?.name || "Unknown error");
			span.end();
			return result;
		} });
	}
	/**
	* Patches the resolve method of the Query class to end the span when the query is resolved.
	*/
	_patchResolve(resolveTarget, span) {
		return new Proxy(resolveTarget, { apply: (resolveTarget, resolveThisArg, resolveArgs) => {
			const result = Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
			const sqlCommand = resolveArgs?.[0]?.command;
			if (sqlCommand) span.setAttribute(import_src$20.ATTR_DB_OPERATION_NAME, sqlCommand);
			span.end();
			return result;
		} });
	}
	/**
	* Patches the Query class to instrument the handle method.
	*/
	_patchQuery(moduleExports) {
		moduleExports.Query.prototype.handle = new Proxy(moduleExports.Query.prototype.handle, { apply: async (handleTarget, handleThisArg, handleArgs) => {
			if (!this._shouldCreateSpans()) return Reflect.apply(handleTarget, handleThisArg, handleArgs);
			const sanitizedSqlQuery = this._sanitizeSqlQuery(handleThisArg.strings?.[0]);
			return startSpanManual$1({
				name: sanitizedSqlQuery || "postgresjs.query",
				op: "db"
			}, (span) => {
				const postgresConnectionContext = getCurrentScope().getScopeData().contexts["postgresjsConnection"];
				addOriginToSpan(span, "auto.db.otel.postgres");
				const { requestHook } = this.getConfig();
				if (requestHook) safeExecuteInTheMiddle(() => requestHook(span, sanitizedSqlQuery, postgresConnectionContext), (error) => {
					if (error) debug.error(`Error in requestHook for ${INTEGRATION_NAME$8} integration:`, error);
				});
				const databaseName = postgresConnectionContext?.ATTR_DB_NAMESPACE || "<unknown database>";
				const databaseHost = postgresConnectionContext?.ATTR_SERVER_ADDRESS || "<unknown host>";
				const databasePort = postgresConnectionContext?.ATTR_SERVER_PORT || "<unknown port>";
				span.setAttribute(import_src$20.ATTR_DB_SYSTEM_NAME, "postgres");
				span.setAttribute(import_src$20.ATTR_DB_NAMESPACE, databaseName);
				span.setAttribute(import_src$20.ATTR_SERVER_ADDRESS, databaseHost);
				span.setAttribute(import_src$20.ATTR_SERVER_PORT, databasePort);
				span.setAttribute(import_src$20.ATTR_DB_QUERY_TEXT, sanitizedSqlQuery);
				handleThisArg.resolve = this._patchResolve(handleThisArg.resolve, span);
				handleThisArg.reject = this._patchReject(handleThisArg.reject, span);
				try {
					return Reflect.apply(handleTarget, handleThisArg, handleArgs);
				} catch (error) {
					span.setStatus({ code: 2 });
					span.end();
					throw error;
				}
			});
		} });
		return moduleExports;
	}
	/**
	* Patches the Connection class to set the database, host, and port attributes
	* when a new connection is created.
	*/
	_patchConnection(Connection) {
		return new Proxy(Connection, { apply: (connectionTarget, thisArg, connectionArgs) => {
			const databaseName = connectionArgs[0]?.database || "<unknown database>";
			const databaseHost = connectionArgs[0]?.host?.[0] || "<unknown host>";
			const databasePort = connectionArgs[0]?.port?.[0] || "<unknown port>";
			getCurrentScope().setContext("postgresjsConnection", {
				ATTR_DB_NAMESPACE: databaseName,
				ATTR_SERVER_ADDRESS: databaseHost,
				ATTR_SERVER_PORT: databasePort
			});
			return Reflect.apply(connectionTarget, thisArg, connectionArgs);
		} });
	}
	/**
	* Sanitize SQL query as per the OTEL semantic conventions
	* https://opentelemetry.io/docs/specs/semconv/database/database-spans/#sanitization-of-dbquerytext
	*/
	_sanitizeSqlQuery(sqlQuery) {
		if (!sqlQuery) return "Unknown SQL Query";
		return sqlQuery.replace(/\s+/g, " ").trim().substring(0, 1024).replace(/--.*?(\r?\n|$)/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\b\d+\b/g, "?").replace(/\s+/g, " ").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/g, "IN (?)");
	}
};
var _postgresJsIntegration = (() => {
	return {
		name: INTEGRATION_NAME$8,
		setupOnce() {
			instrumentPostgresJs();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [postgres](https://www.npmjs.com/package/postgres) library.
*
* For more information, see the [`postgresIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/postgres/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.postgresJsIntegration()],
* });
* ```
*/
var postgresJsIntegration = defineIntegration(_postgresJsIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/prisma.js
var INTEGRATION_NAME$7 = "Prisma";
function isPrismaV6TracingHelper(helper) {
	return !!helper && typeof helper === "object" && "dispatchEngineSpans" in helper;
}
function getPrismaTracingHelper() {
	const prismaInstrumentationObject = globalThis.PRISMA_INSTRUMENTATION;
	return prismaInstrumentationObject && typeof prismaInstrumentationObject === "object" && "helper" in prismaInstrumentationObject ? prismaInstrumentationObject.helper : void 0;
}
var SentryPrismaInteropInstrumentation = class extends PrismaInstrumentation {
	constructor() {
		super();
	}
	enable() {
		super.enable();
		const prismaTracingHelper = getPrismaTracingHelper();
		let emittedWarning = false;
		if (isPrismaV6TracingHelper(prismaTracingHelper)) prismaTracingHelper.createEngineSpan = () => {
			consoleSandbox(() => {
				if (!emittedWarning) {
					emittedWarning = true;
					console.warn("[Sentry] The Sentry SDK supports tracing with Prisma version 5 only with limited capabilities. For full tracing capabilities pass `prismaInstrumentation` for version 5 to the Sentry `prismaIntegration`. Read more: https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/prisma/");
				}
			});
		};
	}
};
var instrumentPrisma = generateInstrumentOnce(INTEGRATION_NAME$7, (options) => {
	if (options?.prismaInstrumentation) return options.prismaInstrumentation;
	return new SentryPrismaInteropInstrumentation();
});
/**
* Adds Sentry tracing instrumentation for the [prisma](https://www.npmjs.com/package/prisma) library.
* For more information, see the [`prismaIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/prisma/).
*
* NOTE: By default, this integration works with Prisma version 6.
* To get performance instrumentation for other Prisma versions,
* 1. Install the `@prisma/instrumentation` package with the desired version.
* 1. Pass a `new PrismaInstrumentation()` instance as exported from `@prisma/instrumentation` to the `prismaInstrumentation` option of this integration:
*
*    ```js
*    import { PrismaInstrumentation } from '@prisma/instrumentation'
*
*    Sentry.init({
*      integrations: [
*        prismaIntegration({
*          // Override the default instrumentation that Sentry uses
*          prismaInstrumentation: new PrismaInstrumentation()
*        })
*      ]
*    })
*    ```
*
*    The passed instrumentation instance will override the default instrumentation instance the integration would use, while the `prismaIntegration` will still ensure data compatibility for the various Prisma versions.
* 1. Depending on your Prisma version (prior to version 6), add `previewFeatures = ["tracing"]` to the client generator block of your Prisma schema:
*
*    ```
*    generator client {
*      provider = "prisma-client-js"
*      previewFeatures = ["tracing"]
*    }
*    ```
*/
var prismaIntegration = defineIntegration(({ prismaInstrumentation } = {}) => {
	return {
		name: INTEGRATION_NAME$7,
		setupOnce() {
			instrumentPrisma({ prismaInstrumentation });
		},
		setup(client) {
			if (!getPrismaTracingHelper()) return;
			client.on("spanStart", (span) => {
				const spanJSON = spanToJSON(span);
				if (spanJSON.description?.startsWith("prisma:")) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.prisma");
				if (spanJSON.description === "prisma:engine:db_query" && spanJSON.data["db.query.text"]) span.updateName(spanJSON.data["db.query.text"]);
				if (spanJSON.description === "prisma:engine:db_query" && !spanJSON.data["db.system"]) span.setAttribute("db.system", "prisma");
			});
		}
	};
});
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/hapi/index.js
var import_src$5 = require_src$17();
var INTEGRATION_NAME$6 = "Hapi";
var instrumentHapi = generateInstrumentOnce(INTEGRATION_NAME$6, () => new import_src$5.HapiInstrumentation());
var _hapiIntegration = (() => {
	return {
		name: INTEGRATION_NAME$6,
		setupOnce() {
			instrumentHapi();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for [Hapi](https://hapi.dev/).
*
* If you also want to capture errors, you need to call `setupHapiErrorHandler(server)` after you set up your server.
*
* For more information, see the [hapi documentation](https://docs.sentry.io/platforms/javascript/guides/hapi/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*   integrations: [Sentry.hapiIntegration()],
* })
* ```
*/
var hapiIntegration = defineIntegration(_hapiIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/koa.js
var import_src$4 = require_src$18();
var INTEGRATION_NAME$5 = "Koa";
var instrumentKoa = generateInstrumentOnce(INTEGRATION_NAME$5, import_src$4.KoaInstrumentation, (options = {}) => {
	return {
		ignoreLayersType: options.ignoreLayersType,
		requestHook(span, info) {
			addOriginToSpan(span, "auto.http.otel.koa");
			const attributes = spanToJSON(span).data;
			const type = attributes["koa.type"];
			if (type) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `${type}.koa`);
			const name = attributes["koa.name"];
			if (typeof name === "string") span.updateName(name || "< unknown >");
			if (getIsolationScope() === getDefaultIsolationScope()) {
				DEBUG_BUILD && debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
				return;
			}
			const route = attributes[import_src$20.ATTR_HTTP_ROUTE];
			const method = info.context?.request?.method?.toUpperCase() || "GET";
			if (route) getIsolationScope().setTransactionName(`${method} ${route}`);
		}
	};
});
var _koaIntegration = ((options = {}) => {
	return {
		name: INTEGRATION_NAME$5,
		setupOnce() {
			instrumentKoa(options);
		}
	};
});
/**
* Adds Sentry tracing instrumentation for [Koa](https://koajs.com/).
*
* If you also want to capture errors, you need to call `setupKoaErrorHandler(app)` after you set up your Koa server.
*
* For more information, see the [koa documentation](https://docs.sentry.io/platforms/javascript/guides/koa/).
*
* @param {KoaOptions} options Configuration options for the Koa integration.
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*   integrations: [Sentry.koaIntegration()],
* })
* ```
*
* @example
* ```javascript
* // To ignore middleware spans
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*   integrations: [
*     Sentry.koaIntegration({
*       ignoreLayersType: ['middleware']
*     })
*   ],
* })
* ```
*/
var koaIntegration = defineIntegration(_koaIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/connect.js
var import_src$3 = require_src$19();
var INTEGRATION_NAME$4 = "Connect";
var instrumentConnect = generateInstrumentOnce(INTEGRATION_NAME$4, () => new import_src$3.ConnectInstrumentation());
var _connectIntegration = (() => {
	return {
		name: INTEGRATION_NAME$4,
		setupOnce() {
			instrumentConnect();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for [Connect](https://github.com/senchalabs/connect/).
*
* If you also want to capture errors, you need to call `setupConnectErrorHandler(app)` after you initialize your connect app.
*
* For more information, see the [connect documentation](https://docs.sentry.io/platforms/javascript/guides/connect/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*   integrations: [Sentry.connectIntegration()],
* })
* ```
*/
var connectIntegration = defineIntegration(_connectIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/tedious.js
var import_src$2 = require_src$20();
var TEDIUS_INSTRUMENTED_METHODS = /* @__PURE__ */ new Set([
	"callProcedure",
	"execSql",
	"execSqlBatch",
	"execBulkLoad",
	"prepare",
	"execute"
]);
var INTEGRATION_NAME$3 = "Tedious";
var instrumentTedious = generateInstrumentOnce(INTEGRATION_NAME$3, () => new import_src$2.TediousInstrumentation({}));
var _tediousIntegration = (() => {
	let instrumentationWrappedCallback;
	return {
		name: INTEGRATION_NAME$3,
		setupOnce() {
			instrumentationWrappedCallback = instrumentWhenWrapped(instrumentTedious());
		},
		setup(client) {
			instrumentationWrappedCallback?.(() => client.on("spanStart", (span) => {
				const { description, data } = spanToJSON(span);
				if (!description || data["db.system"] !== "mssql") return;
				const operation = description.split(" ")[0] || "";
				if (TEDIUS_INSTRUMENTED_METHODS.has(operation)) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.tedious");
			}));
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [tedious](https://www.npmjs.com/package/tedious) library.
*
* For more information, see the [`tediousIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/tedious/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.tediousIntegration()],
* });
* ```
*/
var tediousIntegration = defineIntegration(_tediousIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/genericPool.js
var import_src$1 = require_src$21();
var INTEGRATION_NAME$2 = "GenericPool";
var instrumentGenericPool = generateInstrumentOnce(INTEGRATION_NAME$2, () => new import_src$1.GenericPoolInstrumentation({}));
var _genericPoolIntegration = (() => {
	let instrumentationWrappedCallback;
	return {
		name: INTEGRATION_NAME$2,
		setupOnce() {
			instrumentationWrappedCallback = instrumentWhenWrapped(instrumentGenericPool());
		},
		setup(client) {
			instrumentationWrappedCallback?.(() => client.on("spanStart", (span) => {
				const spanDescription = spanToJSON(span).description;
				if (spanDescription === "generic-pool.aquire" || spanDescription === "generic-pool.acquire") span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.generic_pool");
			}));
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [generic-pool](https://www.npmjs.com/package/generic-pool) library.
*
* For more information, see the [`genericPoolIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/genericpool/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.genericPoolIntegration()],
* });
* ```
*/
var genericPoolIntegration = defineIntegration(_genericPoolIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/amqplib.js
var import_src = require_src$3();
var INTEGRATION_NAME$1 = "Amqplib";
var config = {
	consumeEndHook: (span) => {
		addOriginToSpan(span, "auto.amqplib.otel.consumer");
	},
	publishHook: (span) => {
		addOriginToSpan(span, "auto.amqplib.otel.publisher");
	}
};
var instrumentAmqplib = generateInstrumentOnce(INTEGRATION_NAME$1, () => new import_src.AmqplibInstrumentation(config));
var _amqplibIntegration = (() => {
	return {
		name: INTEGRATION_NAME$1,
		setupOnce() {
			instrumentAmqplib();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [amqplib](https://www.npmjs.com/package/amqplib) library.
*
* For more information, see the [`amqplibIntegration` documentation](https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/amqplib/).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.amqplibIntegration()],
* });
* ```
*/
var amqplibIntegration = defineIntegration(_amqplibIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/vercelai/constants.js
var INTEGRATION_NAME = "VercelAI";
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/vercelai/instrumentation.js
init_esm$1();
var INSTRUMENTED_METHODS = [
	"generateText",
	"streamText",
	"generateObject",
	"streamObject",
	"embed",
	"embedMany"
];
/**
* Determines whether to record inputs and outputs for Vercel AI telemetry based on the configuration hierarchy.
*
* The order of precedence is:
* 1. The vercel ai integration options
* 2. The experimental_telemetry options in the vercel ai method calls
* 3. When telemetry is explicitly enabled (isEnabled: true), default to recording
* 4. Otherwise, use the sendDefaultPii option from client options
*/
function determineRecordingSettings$1(integrationRecordingOptions, methodTelemetryOptions, telemetryExplicitlyEnabled, defaultRecordingEnabled) {
	return {
		recordInputs: integrationRecordingOptions?.recordInputs !== void 0 ? integrationRecordingOptions.recordInputs : methodTelemetryOptions.recordInputs !== void 0 ? methodTelemetryOptions.recordInputs : telemetryExplicitlyEnabled === true ? true : defaultRecordingEnabled,
		recordOutputs: integrationRecordingOptions?.recordOutputs !== void 0 ? integrationRecordingOptions.recordOutputs : methodTelemetryOptions.recordOutputs !== void 0 ? methodTelemetryOptions.recordOutputs : telemetryExplicitlyEnabled === true ? true : defaultRecordingEnabled
	};
}
/**
* This detects is added by the Sentry Vercel AI Integration to detect if the integration should
* be enabled.
*
* It also patches the `ai` module to enable Vercel AI telemetry automatically for all methods.
*/
var SentryVercelAiInstrumentation = class SentryVercelAiInstrumentation extends InstrumentationBase {
	__init() {
		this._isPatched = false;
	}
	__init2() {
		this._callbacks = [];
	}
	constructor(config = {}) {
		super("@sentry/instrumentation-vercel-ai", SDK_VERSION, config);
		SentryVercelAiInstrumentation.prototype.__init.call(this);
		SentryVercelAiInstrumentation.prototype.__init2.call(this);
	}
	/**
	* Initializes the instrumentation by defining the modules to be patched.
	*/
	init() {
		return new InstrumentationNodeModuleDefinition("ai", [">=3.0.0 <5"], this._patch.bind(this));
	}
	/**
	* Call the provided callback when the module is patched.
	* If it has already been patched, the callback will be called immediately.
	*/
	callWhenPatched(callback) {
		if (this._isPatched) callback();
		else this._callbacks.push(callback);
	}
	/**
	* Patches module exports to enable Vercel AI telemetry.
	*/
	_patch(moduleExports) {
		this._isPatched = true;
		this._callbacks.forEach((callback) => callback());
		this._callbacks = [];
		function generatePatch(originalMethod) {
			return (...args) => {
				const existingExperimentalTelemetry = args[0].experimental_telemetry || {};
				const isEnabled = existingExperimentalTelemetry.isEnabled;
				const client = getCurrentScope().getClient();
				const integration = client?.getIntegrationByName(INTEGRATION_NAME);
				const integrationOptions = integration?.options;
				const { recordInputs, recordOutputs } = determineRecordingSettings$1(integrationOptions, existingExperimentalTelemetry, isEnabled, integration ? Boolean(client?.getOptions().sendDefaultPii) : false);
				args[0].experimental_telemetry = {
					...existingExperimentalTelemetry,
					isEnabled: isEnabled !== void 0 ? isEnabled : true,
					recordInputs,
					recordOutputs
				};
				return handleCallbackErrors(() => {
					return originalMethod.apply(this, args);
				}, (error) => {
					if (error && typeof error === "object") addNonEnumerableProperty(error, "_sentry_active_span", getActiveSpan$1());
				});
			};
		}
		if (Object.prototype.toString.call(moduleExports) === "[object Module]") {
			for (const method of INSTRUMENTED_METHODS) moduleExports[method] = generatePatch(moduleExports[method]);
			return moduleExports;
		} else {
			const patchedModuleExports = INSTRUMENTED_METHODS.reduce((acc, curr) => {
				acc[curr] = generatePatch(moduleExports[curr]);
				return acc;
			}, {});
			return {
				...moduleExports,
				...patchedModuleExports
			};
		}
	}
};
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/vercelai/index.js
var instrumentVercelAi = generateInstrumentOnce(INTEGRATION_NAME, () => new SentryVercelAiInstrumentation({}));
/**
* Determines if the integration should be forced based on environment and package availability.
* Returns true if the 'ai' package is available.
*/
function shouldForceIntegration(client) {
	return !!client.getIntegrationByName("Modules")?.getModules?.()?.ai;
}
var _vercelAIIntegration = ((options = {}) => {
	let instrumentation;
	return {
		name: INTEGRATION_NAME,
		options,
		setupOnce() {
			instrumentation = instrumentVercelAi();
		},
		afterAllSetup(client) {
			if (options.force ?? shouldForceIntegration(client)) addVercelAiProcessors(client);
			else instrumentation?.callWhenPatched(() => addVercelAiProcessors(client));
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the [ai](https://www.npmjs.com/package/ai) library.
* This integration is not enabled by default, you need to manually add it.
*
* For more information, see the [`ai` documentation](https://sdk.vercel.ai/docs/ai-sdk-core/telemetry).
*
* @example
* ```javascript
* const Sentry = require('@sentry/node');
*
* Sentry.init({
*  integrations: [Sentry.vercelAIIntegration()],
* });
* ```
*
* This integration adds tracing support to all `ai` function calls.
* You need to opt-in to collecting spans for a specific call,
* you can do so by setting `experimental_telemetry.isEnabled` to `true` in the first argument of the function call.
*
* ```javascript
* const result = await generateText({
*   model: openai('gpt-4-turbo'),
*   experimental_telemetry: { isEnabled: true },
* });
* ```
*
* If you want to collect inputs and outputs for a specific call, you must specifically opt-in to each
* function call by setting `experimental_telemetry.recordInputs` and `experimental_telemetry.recordOutputs`
* to `true`.
*
* ```javascript
* const result = await generateText({
*  model: openai('gpt-4-turbo'),
*  experimental_telemetry: { isEnabled: true, recordInputs: true, recordOutputs: true },
* });
*/
var vercelAIIntegration = defineIntegration(_vercelAIIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/openai/instrumentation.js
init_esm$1();
var supportedVersions = [">=4.0.0 <6"];
/**
* Determines telemetry recording settings.
*/
function determineRecordingSettings(integrationOptions, defaultEnabled) {
	return {
		recordInputs: integrationOptions?.recordInputs ?? defaultEnabled,
		recordOutputs: integrationOptions?.recordOutputs ?? defaultEnabled
	};
}
/**
* Sentry OpenAI instrumentation using OpenTelemetry.
*/
var SentryOpenAiInstrumentation = class extends InstrumentationBase {
	constructor(config = {}) {
		super("@sentry/instrumentation-openai", SDK_VERSION, config);
	}
	/**
	* Initializes the instrumentation by defining the modules to be patched.
	*/
	init() {
		return new InstrumentationNodeModuleDefinition("openai", supportedVersions, this._patch.bind(this));
	}
	/**
	* Core patch logic applying instrumentation to the OpenAI client constructor.
	*/
	_patch(exports) {
		const Original = exports.OpenAI;
		const WrappedOpenAI = function(...args) {
			const instance = Reflect.construct(Original, args);
			const scopeClient = getCurrentScope().getClient();
			const integrationOpts = (scopeClient?.getIntegrationByName(OPENAI_INTEGRATION_NAME))?.options;
			const { recordInputs, recordOutputs } = determineRecordingSettings(integrationOpts, Boolean(scopeClient?.getOptions().sendDefaultPii));
			return instrumentOpenAiClient(instance, {
				recordInputs,
				recordOutputs
			});
		};
		Object.setPrototypeOf(WrappedOpenAI, Original);
		Object.setPrototypeOf(WrappedOpenAI.prototype, Original.prototype);
		for (const key of Object.getOwnPropertyNames(Original)) if (![
			"length",
			"name",
			"prototype"
		].includes(key)) {
			const descriptor = Object.getOwnPropertyDescriptor(Original, key);
			if (descriptor) Object.defineProperty(WrappedOpenAI, key, descriptor);
		}
		try {
			exports.OpenAI = WrappedOpenAI;
		} catch (error) {
			Object.defineProperty(exports, "OpenAI", {
				value: WrappedOpenAI,
				writable: true,
				configurable: true,
				enumerable: true
			});
		}
		if (exports.default === Original) try {
			exports.default = WrappedOpenAI;
		} catch (error) {
			Object.defineProperty(exports, "default", {
				value: WrappedOpenAI,
				writable: true,
				configurable: true,
				enumerable: true
			});
		}
		return exports;
	}
};
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/openai/index.js
var instrumentOpenAi = generateInstrumentOnce(OPENAI_INTEGRATION_NAME, () => new SentryOpenAiInstrumentation({}));
var _openAiIntegration = ((options = {}) => {
	return {
		name: OPENAI_INTEGRATION_NAME,
		options,
		setupOnce() {
			instrumentOpenAi();
		}
	};
});
/**
* Adds Sentry tracing instrumentation for the OpenAI SDK.
*
* This integration is enabled by default.
*
* When configured, this integration automatically instruments OpenAI SDK client instances
* to capture telemetry data following OpenTelemetry Semantic Conventions for Generative AI.
*
* @example
* ```javascript
* import * as Sentry from '@sentry/node';
*
* Sentry.init({
*   integrations: [Sentry.openAIIntegration()],
* });
* ```
*
* ## Options
*
* - `recordInputs`: Whether to record prompt messages (default: respects `sendDefaultPii` client option)
* - `recordOutputs`: Whether to record response text (default: respects `sendDefaultPii` client option)
*
* ### Default Behavior
*
* By default, the integration will:
* - Record inputs and outputs ONLY if `sendDefaultPii` is set to `true` in your Sentry client options
* - Otherwise, inputs and outputs are NOT recorded unless explicitly enabled
*
* @example
* ```javascript
* // Record inputs and outputs when sendDefaultPii is false
* Sentry.init({
*   integrations: [
*     Sentry.openAIIntegration({
*       recordInputs: true,
*       recordOutputs: true
*     })
*   ],
* });
*
* // Never record inputs/outputs regardless of sendDefaultPii
* Sentry.init({
*   sendDefaultPii: true,
*   integrations: [
*     Sentry.openAIIntegration({
*       recordInputs: false,
*       recordOutputs: false
*     })
*   ],
* });
* ```
*
*/
var openAIIntegration = defineIntegration(_openAiIntegration);
//#endregion
//#region node_modules/@sentry/node/build/esm/integrations/tracing/index.js
/**
* With OTEL, all performance integrations will be added, as OTEL only initializes them when the patched package is actually required.
*/
function getAutoPerformanceIntegrations() {
	return [
		expressIntegration(),
		fastifyIntegration(),
		graphqlIntegration(),
		mongoIntegration(),
		mongooseIntegration(),
		mysqlIntegration(),
		mysql2Integration(),
		redisIntegration(),
		postgresIntegration(),
		prismaIntegration(),
		hapiIntegration(),
		koaIntegration(),
		connectIntegration(),
		tediousIntegration(),
		genericPoolIntegration(),
		kafkaIntegration(),
		amqplibIntegration(),
		lruMemoizerIntegration(),
		vercelAIIntegration(),
		openAIIntegration(),
		postgresJsIntegration()
	];
}
//#endregion
//#region node_modules/@sentry/node/build/esm/sdk/initOtel.js
var MAX_MAX_SPAN_WAIT_DURATION = 1e6;
/**
* Initialize OpenTelemetry for Node.
*/
function initOpenTelemetry(client, options = {}) {
	if (client.getOptions().debug) setupOpenTelemetryLogger();
	client.traceProvider = setupOtel(client, options);
}
/** Just exported for tests. */
function setupOtel(client, options = {}) {
	const provider = new BasicTracerProvider({
		sampler: new SentrySampler(client),
		resource: new Resource({
			[import_src$20.ATTR_SERVICE_NAME]: "node",
			[import_src$20.SEMRESATTRS_SERVICE_NAMESPACE]: "sentry",
			[import_src$20.ATTR_SERVICE_VERSION]: SDK_VERSION
		}),
		forceFlushTimeoutMillis: 500,
		spanProcessors: [new SentrySpanProcessor({ timeout: _clampSpanProcessorTimeout(client.getOptions().maxSpanWaitDuration) }), ...options.spanProcessors || []]
	});
	import_src$21.trace.setGlobalTracerProvider(provider);
	import_src$21.propagation.setGlobalPropagator(new SentryPropagator());
	import_src$21.context.setGlobalContextManager(new SentryContextManager());
	return provider;
}
/** Just exported for tests. */
function _clampSpanProcessorTimeout(maxSpanWaitDuration) {
	if (maxSpanWaitDuration == null) return;
	if (maxSpanWaitDuration > MAX_MAX_SPAN_WAIT_DURATION) {
		DEBUG_BUILD && debug.warn(`\`maxSpanWaitDuration\` is too high, using the maximum value of ${MAX_MAX_SPAN_WAIT_DURATION}`);
		return MAX_MAX_SPAN_WAIT_DURATION;
	} else if (maxSpanWaitDuration <= 0 || Number.isNaN(maxSpanWaitDuration)) {
		DEBUG_BUILD && debug.warn("`maxSpanWaitDuration` must be a positive number, using default value instead.");
		return;
	}
	return maxSpanWaitDuration;
}
//#endregion
//#region node_modules/@sentry/node/build/esm/sdk/index.js
/**
* Get default integrations, excluding performance.
*/
function getDefaultIntegrationsWithoutPerformance() {
	return getDefaultIntegrations$1().filter((integration) => integration.name !== "Http" && integration.name !== "NodeFetch").concat(httpIntegration(), nativeNodeFetchIntegration());
}
/** Get the default integrations for the Node SDK. */
function getDefaultIntegrations(options) {
	return [...getDefaultIntegrationsWithoutPerformance(), ...hasSpansEnabled(options) ? getAutoPerformanceIntegrations() : []];
}
/**
* Initialize Sentry for Node.
*/
function init(options = {}) {
	return _init(options, getDefaultIntegrations);
}
/**
* Internal initialization function.
*/
function _init(options = {}, getDefaultIntegrationsImpl) {
	applySdkMetadata(options, "node");
	const client = init$1({
		...options,
		defaultIntegrations: options.defaultIntegrations ?? getDefaultIntegrationsImpl(options)
	});
	if (client && !options.skipOpenTelemetrySetup) {
		initOpenTelemetry(client, { spanProcessors: options.openTelemetrySpanProcessors });
		validateOpenTelemetrySetup();
	}
	return client;
}
//#endregion
//#region node_modules/@sentry/node/build/esm/index.js
var esm_exports = /* @__PURE__ */ __exportAll({
	SDK_VERSION: () => SDK_VERSION,
	SEMANTIC_ATTRIBUTE_SENTRY_OP: () => SEMANTIC_ATTRIBUTE_SENTRY_OP,
	SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN: () => SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
	SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE: () => SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE,
	SEMANTIC_ATTRIBUTE_SENTRY_SOURCE: () => SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
	addBreadcrumb: () => addBreadcrumb,
	captureException: () => captureException,
	captureMessage: () => captureMessage,
	init: () => init,
	setExtras: () => setExtras,
	setTags: () => setTags,
	withScope: () => withScope
});
//#endregion
export { esm_exports as t };
