import { a as __toCommonJS, i as __require, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./core+[...].mjs";
import { n as init_esm$1, t as esm_exports$1 } from "./instrumentation+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-undici/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.10.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-undici";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-undici/build/src/enums/SemanticAttributes.js
var require_SemanticAttributes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SemanticAttributes = void 0;
	exports.SemanticAttributes = {
		/**
		* State of the HTTP connection in the HTTP connection pool.
		*/
		HTTP_CONNECTION_STATE: "http.connection.state",
		/**
		* Describes a class of error the operation ended with.
		*
		* Note: The `error.type` SHOULD be predictable and SHOULD have low cardinality.
		Instrumentations SHOULD document the list of errors they report.
		
		The cardinality of `error.type` within one instrumentation library SHOULD be low.
		Telemetry consumers that aggregate data from multiple instrumentation libraries and applications
		should be prepared for `error.type` to have high cardinality at query time when no
		additional filters are applied.
		
		If the operation has completed successfully, instrumentations SHOULD NOT set `error.type`.
		
		If a specific domain defines its own set of error identifiers (such as HTTP or gRPC status codes),
		it&#39;s RECOMMENDED to:
		
		* Use a domain-specific attribute
		* Set `error.type` to capture all errors, regardless of whether they are defined within the domain-specific set or not.
		*/
		ERROR_TYPE: "error.type",
		/**
		* The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
		*/
		HTTP_REQUEST_BODY_SIZE: "http.request.body.size",
		/**
		* HTTP request method.
		*
		* Note: HTTP request method value SHOULD be &#34;known&#34; to the instrumentation.
		By default, this convention defines &#34;known&#34; methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
		and the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html).
		
		If the HTTP request method is not known to instrumentation, it MUST set the `http.request.method` attribute to `_OTHER`.
		
		If the HTTP instrumentation could end up converting valid HTTP request methods to `_OTHER`, then it MUST provide a way to override
		the list of known HTTP methods. If this override is done via environment variable, then the environment variable MUST be named
		OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS and support a comma-separated list of case-sensitive known HTTP methods
		(this list MUST be a full override of the default known method, it is not a list of known methods in addition to the defaults).
		
		HTTP method names are case-sensitive and `http.request.method` attribute value MUST match a known HTTP method name exactly.
		Instrumentations for specific web frameworks that consider HTTP methods to be case insensitive, SHOULD populate a canonical equivalent.
		Tracing instrumentations that do so, MUST also set `http.request.method_original` to the original value.
		*/
		HTTP_REQUEST_METHOD: "http.request.method",
		/**
		* Original HTTP method sent by the client in the request line.
		*/
		HTTP_REQUEST_METHOD_ORIGINAL: "http.request.method_original",
		/**
		* The ordinal number of request resending attempt (for any reason, including redirects).
		*
		* Note: The resend count SHOULD be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
		*/
		HTTP_REQUEST_RESEND_COUNT: "http.request.resend_count",
		/**
		* The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
		*/
		HTTP_RESPONSE_BODY_SIZE: "http.response.body.size",
		/**
		* [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
		*/
		HTTP_RESPONSE_STATUS_CODE: "http.response.status_code",
		/**
		* The matched route, that is, the path template in the format used by the respective server framework.
		*
		* Note: MUST NOT be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
		SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
		*/
		HTTP_ROUTE: "http.route",
		/**
		* Peer address of the network connection - IP address or Unix domain socket name.
		*/
		NETWORK_PEER_ADDRESS: "network.peer.address",
		/**
		* Peer port number of the network connection.
		*/
		NETWORK_PEER_PORT: "network.peer.port",
		/**
		* [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
		*
		* Note: The value SHOULD be normalized to lowercase.
		*/
		NETWORK_PROTOCOL_NAME: "network.protocol.name",
		/**
		* Version of the protocol specified in `network.protocol.name`.
		*
		* Note: `network.protocol.version` refers to the version of the protocol used and might be different from the protocol client&#39;s version. If the HTTP client has a version of `0.27.2`, but sends HTTP version `1.1`, this attribute should be set to `1.1`.
		*/
		NETWORK_PROTOCOL_VERSION: "network.protocol.version",
		/**
		* Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
		*
		* Note: When observed from the client side, and when communicating through an intermediary, `server.address` SHOULD represent the server address behind any intermediaries, for example proxies, if it&#39;s available.
		*/
		SERVER_ADDRESS: "server.address",
		/**
		* Server port number.
		*
		* Note: When observed from the client side, and when communicating through an intermediary, `server.port` SHOULD represent the server port behind any intermediaries, for example proxies, if it&#39;s available.
		*/
		SERVER_PORT: "server.port",
		/**
		* Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986).
		*
		* Note: For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it SHOULD be included nevertheless.
		`url.full` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password SHOULD be redacted and attribute&#39;s value SHOULD be `https://REDACTED:REDACTED@www.example.com/`.
		`url.full` SHOULD capture the absolute URL when it is available (or can be reconstructed) and SHOULD NOT be validated or modified except for sanitizing purposes.
		*/
		URL_FULL: "url.full",
		/**
		* The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component.
		*/
		URL_PATH: "url.path",
		/**
		* The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component.
		*
		* Note: Sensitive content provided in query string SHOULD be scrubbed when instrumentations can identify it.
		*/
		URL_QUERY: "url.query",
		/**
		* The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
		*/
		URL_SCHEME: "url.scheme",
		/**
		* Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
		*/
		USER_AGENT_ORIGINAL: "user_agent.original"
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-undici/build/src/undici.js
var require_undici = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.UndiciInstrumentation = void 0;
	var diagch = __require("diagnostics_channel");
	var url_1 = __require("url");
	var instrumentation_1 = (init_esm$1(), __toCommonJS(esm_exports$1));
	var api_1 = require_src$1();
	/** @knipignore */
	var version_1 = require_version();
	var SemanticAttributes_1 = require_SemanticAttributes();
	var core_1 = (init_esm(), __toCommonJS(esm_exports));
	var UndiciInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
			this._recordFromReq = /* @__PURE__ */ new WeakMap();
		}
		init() {}
		disable() {
			super.disable();
			this._channelSubs.forEach((sub) => sub.unsubscribe());
			this._channelSubs.length = 0;
		}
		enable() {
			super.enable();
			this._channelSubs = this._channelSubs || [];
			if (this._channelSubs.length > 0) return;
			this.subscribeToChannel("undici:request:create", this.onRequestCreated.bind(this));
			this.subscribeToChannel("undici:client:sendHeaders", this.onRequestHeaders.bind(this));
			this.subscribeToChannel("undici:request:headers", this.onResponseHeaders.bind(this));
			this.subscribeToChannel("undici:request:trailers", this.onDone.bind(this));
			this.subscribeToChannel("undici:request:error", this.onError.bind(this));
		}
		_updateMetricInstruments() {
			this._httpClientDurationHistogram = this.meter.createHistogram("http.client.request.duration", {
				description: "Measures the duration of outbound HTTP requests.",
				unit: "s",
				valueType: api_1.ValueType.DOUBLE,
				advice: { explicitBucketBoundaries: [
					.005,
					.01,
					.025,
					.05,
					.075,
					.1,
					.25,
					.5,
					.75,
					1,
					2.5,
					5,
					7.5,
					10
				] }
			});
		}
		subscribeToChannel(diagnosticChannel, onMessage) {
			var _a;
			const [major, minor] = process.version.replace("v", "").split(".").map((n) => Number(n));
			const useNewSubscribe = major > 18 || major === 18 && minor >= 19;
			let unsubscribe;
			if (useNewSubscribe) {
				(_a = diagch.subscribe) === null || _a === void 0 || _a.call(diagch, diagnosticChannel, onMessage);
				unsubscribe = () => {
					var _a;
					return (_a = diagch.unsubscribe) === null || _a === void 0 ? void 0 : _a.call(diagch, diagnosticChannel, onMessage);
				};
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
		onRequestCreated({ request }) {
			const config = this.getConfig();
			const enabled = config.enabled !== false;
			if ((0, instrumentation_1.safeExecuteInTheMiddle)(() => {
				var _a;
				return !enabled || request.method === "CONNECT" || ((_a = config.ignoreRequestHook) === null || _a === void 0 ? void 0 : _a.call(config, request));
			}, (e) => e && this._diag.error("caught ignoreRequestHook error: ", e), true)) return;
			const startTime = (0, core_1.hrTime)();
			let requestUrl;
			try {
				requestUrl = new url_1.URL(request.path, request.origin);
			} catch (err) {
				this._diag.warn("could not determine url.full:", err);
				return;
			}
			const urlScheme = requestUrl.protocol.replace(":", "");
			const requestMethod = this.getRequestMethod(request.method);
			const attributes = {
				[SemanticAttributes_1.SemanticAttributes.HTTP_REQUEST_METHOD]: requestMethod,
				[SemanticAttributes_1.SemanticAttributes.HTTP_REQUEST_METHOD_ORIGINAL]: request.method,
				[SemanticAttributes_1.SemanticAttributes.URL_FULL]: requestUrl.toString(),
				[SemanticAttributes_1.SemanticAttributes.URL_PATH]: requestUrl.pathname,
				[SemanticAttributes_1.SemanticAttributes.URL_QUERY]: requestUrl.search,
				[SemanticAttributes_1.SemanticAttributes.URL_SCHEME]: urlScheme
			};
			const schemePorts = {
				https: "443",
				http: "80"
			};
			const serverAddress = requestUrl.hostname;
			const serverPort = requestUrl.port || schemePorts[urlScheme];
			attributes[SemanticAttributes_1.SemanticAttributes.SERVER_ADDRESS] = serverAddress;
			if (serverPort && !isNaN(Number(serverPort))) attributes[SemanticAttributes_1.SemanticAttributes.SERVER_PORT] = Number(serverPort);
			let userAgent;
			if (Array.isArray(request.headers)) {
				const idx = request.headers.findIndex((h) => h.toLowerCase() === "user-agent");
				if (idx >= 0) userAgent = request.headers[idx + 1];
			} else if (typeof request.headers === "string") {
				const uaHeader = request.headers.split("\r\n").find((h) => h.toLowerCase().startsWith("user-agent"));
				userAgent = uaHeader && uaHeader.substring(uaHeader.indexOf(":") + 1).trim();
			}
			if (userAgent) attributes[SemanticAttributes_1.SemanticAttributes.USER_AGENT_ORIGINAL] = userAgent;
			const hookAttributes = (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
				var _a;
				return (_a = config.startSpanHook) === null || _a === void 0 ? void 0 : _a.call(config, request);
			}, (e) => e && this._diag.error("caught startSpanHook error: ", e), true);
			if (hookAttributes) Object.entries(hookAttributes).forEach(([key, val]) => {
				attributes[key] = val;
			});
			const activeCtx = api_1.context.active();
			const currentSpan = api_1.trace.getSpan(activeCtx);
			let span;
			if (config.requireParentforSpans && (!currentSpan || !api_1.trace.isSpanContextValid(currentSpan.spanContext()))) span = api_1.trace.wrapSpanContext(api_1.INVALID_SPAN_CONTEXT);
			else span = this.tracer.startSpan(requestMethod === "_OTHER" ? "HTTP" : requestMethod, {
				kind: api_1.SpanKind.CLIENT,
				attributes
			}, activeCtx);
			(0, instrumentation_1.safeExecuteInTheMiddle)(() => {
				var _a;
				return (_a = config.requestHook) === null || _a === void 0 ? void 0 : _a.call(config, span, request);
			}, (e) => e && this._diag.error("caught requestHook error: ", e), true);
			const requestContext = api_1.trace.setSpan(api_1.context.active(), span);
			const addedHeaders = {};
			api_1.propagation.inject(requestContext, addedHeaders);
			const headerEntries = Object.entries(addedHeaders);
			for (let i = 0; i < headerEntries.length; i++) {
				const [k, v] = headerEntries[i];
				if (typeof request.addHeader === "function") request.addHeader(k, v);
				else if (typeof request.headers === "string") request.headers += `${k}: ${v}\r\n`;
				else if (Array.isArray(request.headers)) request.headers.push(k, v);
			}
			this._recordFromReq.set(request, {
				span,
				attributes,
				startTime
			});
		}
		onRequestHeaders({ request, socket }) {
			var _a;
			const record = this._recordFromReq.get(request);
			if (!record) return;
			const config = this.getConfig();
			const { span } = record;
			const { remoteAddress, remotePort } = socket;
			const spanAttributes = {
				[SemanticAttributes_1.SemanticAttributes.NETWORK_PEER_ADDRESS]: remoteAddress,
				[SemanticAttributes_1.SemanticAttributes.NETWORK_PEER_PORT]: remotePort
			};
			if ((_a = config.headersToSpanAttributes) === null || _a === void 0 ? void 0 : _a.requestHeaders) {
				const headersToAttribs = new Set(config.headersToSpanAttributes.requestHeaders.map((n) => n.toLowerCase()));
				const rawHeaders = Array.isArray(request.headers) ? request.headers : request.headers.split("\r\n");
				rawHeaders.forEach((h, idx) => {
					const sepIndex = h.indexOf(":");
					const hasSeparator = sepIndex !== -1;
					const name = (hasSeparator ? h.substring(0, sepIndex) : h).toLowerCase();
					const value = hasSeparator ? h.substring(sepIndex + 1) : rawHeaders[idx + 1];
					if (headersToAttribs.has(name)) spanAttributes[`http.request.header.${name}`] = value.trim();
				});
			}
			span.setAttributes(spanAttributes);
		}
		onResponseHeaders({ request, response }) {
			var _a, _b;
			const record = this._recordFromReq.get(request);
			if (!record) return;
			const { span, attributes } = record;
			const spanAttributes = { [SemanticAttributes_1.SemanticAttributes.HTTP_RESPONSE_STATUS_CODE]: response.statusCode };
			const config = this.getConfig();
			(0, instrumentation_1.safeExecuteInTheMiddle)(() => {
				var _a;
				return (_a = config.responseHook) === null || _a === void 0 ? void 0 : _a.call(config, span, {
					request,
					response
				});
			}, (e) => e && this._diag.error("caught responseHook error: ", e), true);
			const headersToAttribs = /* @__PURE__ */ new Set();
			if ((_a = config.headersToSpanAttributes) === null || _a === void 0 ? void 0 : _a.responseHeaders) (_b = config.headersToSpanAttributes) === null || _b === void 0 || _b.responseHeaders.forEach((name) => headersToAttribs.add(name.toLowerCase()));
			for (let idx = 0; idx < response.headers.length; idx = idx + 2) {
				const name = response.headers[idx].toString().toLowerCase();
				const value = response.headers[idx + 1];
				if (headersToAttribs.has(name)) spanAttributes[`http.response.header.${name}`] = value.toString();
				if (name === "content-length") {
					const contentLength = Number(value.toString());
					if (!isNaN(contentLength)) spanAttributes["http.response.header.content-length"] = contentLength;
				}
			}
			span.setAttributes(spanAttributes);
			span.setStatus({ code: response.statusCode >= 400 ? api_1.SpanStatusCode.ERROR : api_1.SpanStatusCode.UNSET });
			record.attributes = Object.assign(attributes, spanAttributes);
		}
		onDone({ request }) {
			const record = this._recordFromReq.get(request);
			if (!record) return;
			const { span, attributes, startTime } = record;
			span.end();
			this._recordFromReq.delete(request);
			this.recordRequestDuration(attributes, startTime);
		}
		onError({ request, error }) {
			const record = this._recordFromReq.get(request);
			if (!record) return;
			const { span, attributes, startTime } = record;
			span.recordException(error);
			span.setStatus({
				code: api_1.SpanStatusCode.ERROR,
				message: error.message
			});
			span.end();
			this._recordFromReq.delete(request);
			attributes[SemanticAttributes_1.SemanticAttributes.ERROR_TYPE] = error.message;
			this.recordRequestDuration(attributes, startTime);
		}
		recordRequestDuration(attributes, startTime) {
			const metricsAttributes = {};
			[
				SemanticAttributes_1.SemanticAttributes.HTTP_RESPONSE_STATUS_CODE,
				SemanticAttributes_1.SemanticAttributes.HTTP_REQUEST_METHOD,
				SemanticAttributes_1.SemanticAttributes.SERVER_ADDRESS,
				SemanticAttributes_1.SemanticAttributes.SERVER_PORT,
				SemanticAttributes_1.SemanticAttributes.URL_SCHEME,
				SemanticAttributes_1.SemanticAttributes.ERROR_TYPE
			].forEach((key) => {
				if (key in attributes) metricsAttributes[key] = attributes[key];
			});
			const durationSeconds = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)())) / 1e3;
			this._httpClientDurationHistogram.record(durationSeconds, metricsAttributes);
		}
		getRequestMethod(original) {
			if (original.toUpperCase() in {
				CONNECT: true,
				OPTIONS: true,
				HEAD: true,
				GET: true,
				POST: true,
				PUT: true,
				PATCH: true,
				DELETE: true,
				TRACE: true
			}) return original.toUpperCase();
			return "_OTHER";
		}
	};
	exports.UndiciInstrumentation = UndiciInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-undici/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-undici/build/src/index.js
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
	__exportStar(require_undici(), exports);
	__exportStar(require_types(), exports);
}));
//#endregion
export { require_src as t };
