import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./instrumentation+[...].mjs";
import { n as require_src$2 } from "./instrumentation-amqplib+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-kafkajs/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.7.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-kafkajs";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-kafkajs/build/src/propagator.js
var require_propagator = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bufferTextMapGetter = void 0;
	exports.bufferTextMapGetter = {
		get(carrier, key) {
			var _a;
			if (!carrier) return;
			const keys = Object.keys(carrier);
			for (const carrierKey of keys) if (carrierKey === key || carrierKey.toLowerCase() === key) return (_a = carrier[carrierKey]) === null || _a === void 0 ? void 0 : _a.toString();
		},
		keys(carrier) {
			return carrier ? Object.keys(carrier) : [];
		}
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-kafkajs/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.KafkaJsInstrumentation = void 0;
	var api_1 = require_src$1();
	var semantic_conventions_1 = require_src$2();
	/** @knipignore */
	var version_1 = require_version();
	var propagator_1 = require_propagator();
	var instrumentation_1 = (init_esm(), __toCommonJS(esm_exports));
	var KafkaJsInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
		}
		init() {
			const unpatch = (moduleExports) => {
				var _a, _b;
				if ((0, instrumentation_1.isWrapped)((_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.Kafka) === null || _a === void 0 ? void 0 : _a.prototype.producer)) this._unwrap(moduleExports.Kafka.prototype, "producer");
				if ((0, instrumentation_1.isWrapped)((_b = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.Kafka) === null || _b === void 0 ? void 0 : _b.prototype.consumer)) this._unwrap(moduleExports.Kafka.prototype, "consumer");
			};
			return new instrumentation_1.InstrumentationNodeModuleDefinition("kafkajs", [">=0.1.0 <3"], (moduleExports) => {
				var _a, _b;
				unpatch(moduleExports);
				this._wrap((_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.Kafka) === null || _a === void 0 ? void 0 : _a.prototype, "producer", this._getProducerPatch());
				this._wrap((_b = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.Kafka) === null || _b === void 0 ? void 0 : _b.prototype, "consumer", this._getConsumerPatch());
				return moduleExports;
			}, unpatch);
		}
		_getConsumerPatch() {
			const instrumentation = this;
			return (original) => {
				return function consumer(...args) {
					const newConsumer = original.apply(this, args);
					if ((0, instrumentation_1.isWrapped)(newConsumer.run)) instrumentation._unwrap(newConsumer, "run");
					instrumentation._wrap(newConsumer, "run", instrumentation._getConsumerRunPatch());
					return newConsumer;
				};
			};
		}
		_getProducerPatch() {
			const instrumentation = this;
			return (original) => {
				return function consumer(...args) {
					const newProducer = original.apply(this, args);
					if ((0, instrumentation_1.isWrapped)(newProducer.sendBatch)) instrumentation._unwrap(newProducer, "sendBatch");
					instrumentation._wrap(newProducer, "sendBatch", instrumentation._getProducerSendBatchPatch());
					if ((0, instrumentation_1.isWrapped)(newProducer.send)) instrumentation._unwrap(newProducer, "send");
					instrumentation._wrap(newProducer, "send", instrumentation._getProducerSendPatch());
					return newProducer;
				};
			};
		}
		_getConsumerRunPatch() {
			const instrumentation = this;
			return (original) => {
				return function run(...args) {
					const config = args[0];
					if (config === null || config === void 0 ? void 0 : config.eachMessage) {
						if ((0, instrumentation_1.isWrapped)(config.eachMessage)) instrumentation._unwrap(config, "eachMessage");
						instrumentation._wrap(config, "eachMessage", instrumentation._getConsumerEachMessagePatch());
					}
					if (config === null || config === void 0 ? void 0 : config.eachBatch) {
						if ((0, instrumentation_1.isWrapped)(config.eachBatch)) instrumentation._unwrap(config, "eachBatch");
						instrumentation._wrap(config, "eachBatch", instrumentation._getConsumerEachBatchPatch());
					}
					return original.call(this, config);
				};
			};
		}
		_getConsumerEachMessagePatch() {
			const instrumentation = this;
			return (original) => {
				return function eachMessage(...args) {
					const payload = args[0];
					const propagatedContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, payload.message.headers, propagator_1.bufferTextMapGetter);
					const span = instrumentation._startConsumerSpan(payload.topic, payload.message, semantic_conventions_1.MESSAGINGOPERATIONVALUES_PROCESS, propagatedContext);
					const eachMessagePromise = api_1.context.with(api_1.trace.setSpan(propagatedContext, span), () => {
						return original.apply(this, args);
					});
					return instrumentation._endSpansOnPromise([span], eachMessagePromise);
				};
			};
		}
		_getConsumerEachBatchPatch() {
			return (original) => {
				const instrumentation = this;
				return function eachBatch(...args) {
					const payload = args[0];
					const receivingSpan = instrumentation._startConsumerSpan(payload.batch.topic, void 0, semantic_conventions_1.MESSAGINGOPERATIONVALUES_RECEIVE, api_1.ROOT_CONTEXT);
					return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), receivingSpan), () => {
						const spans = payload.batch.messages.map((message) => {
							var _a;
							const propagatedContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, message.headers, propagator_1.bufferTextMapGetter);
							const spanContext = (_a = api_1.trace.getSpan(propagatedContext)) === null || _a === void 0 ? void 0 : _a.spanContext();
							let origSpanLink;
							if (spanContext) origSpanLink = { context: spanContext };
							return instrumentation._startConsumerSpan(payload.batch.topic, message, semantic_conventions_1.MESSAGINGOPERATIONVALUES_PROCESS, void 0, origSpanLink);
						});
						const batchMessagePromise = original.apply(this, args);
						spans.unshift(receivingSpan);
						return instrumentation._endSpansOnPromise(spans, batchMessagePromise);
					});
				};
			};
		}
		_getProducerSendBatchPatch() {
			const instrumentation = this;
			return (original) => {
				return function sendBatch(...args) {
					const spans = (args[0].topicMessages || []).map((topicMessage) => topicMessage.messages.map((message) => instrumentation._startProducerSpan(topicMessage.topic, message))).reduce((acc, val) => acc.concat(val), []);
					const origSendResult = original.apply(this, args);
					return instrumentation._endSpansOnPromise(spans, origSendResult);
				};
			};
		}
		_getProducerSendPatch() {
			const instrumentation = this;
			return (original) => {
				return function send(...args) {
					const record = args[0];
					const spans = record.messages.map((message) => {
						return instrumentation._startProducerSpan(record.topic, message);
					});
					const origSendResult = original.apply(this, args);
					return instrumentation._endSpansOnPromise(spans, origSendResult);
				};
			};
		}
		_endSpansOnPromise(spans, sendPromise) {
			return Promise.resolve(sendPromise).catch((reason) => {
				let errorMessage;
				if (typeof reason === "string") errorMessage = reason;
				else if (typeof reason === "object" && Object.prototype.hasOwnProperty.call(reason, "message")) errorMessage = reason.message;
				spans.forEach((span) => span.setStatus({
					code: api_1.SpanStatusCode.ERROR,
					message: errorMessage
				}));
				throw reason;
			}).finally(() => {
				spans.forEach((span) => span.end());
			});
		}
		_startConsumerSpan(topic, message, operation, context, link) {
			const span = this.tracer.startSpan(topic, {
				kind: api_1.SpanKind.CONSUMER,
				attributes: {
					[semantic_conventions_1.SEMATTRS_MESSAGING_SYSTEM]: "kafka",
					[semantic_conventions_1.SEMATTRS_MESSAGING_DESTINATION]: topic,
					[semantic_conventions_1.SEMATTRS_MESSAGING_OPERATION]: operation
				},
				links: link ? [link] : []
			}, context);
			const { consumerHook } = this.getConfig();
			if (consumerHook && message) (0, instrumentation_1.safeExecuteInTheMiddle)(() => consumerHook(span, {
				topic,
				message
			}), (e) => {
				if (e) this._diag.error("consumerHook error", e);
			}, true);
			return span;
		}
		_startProducerSpan(topic, message) {
			var _a;
			const span = this.tracer.startSpan(topic, {
				kind: api_1.SpanKind.PRODUCER,
				attributes: {
					[semantic_conventions_1.SEMATTRS_MESSAGING_SYSTEM]: "kafka",
					[semantic_conventions_1.SEMATTRS_MESSAGING_DESTINATION]: topic
				}
			});
			message.headers = (_a = message.headers) !== null && _a !== void 0 ? _a : {};
			api_1.propagation.inject(api_1.trace.setSpan(api_1.context.active(), span), message.headers);
			const { producerHook } = this.getConfig();
			if (producerHook) (0, instrumentation_1.safeExecuteInTheMiddle)(() => producerHook(span, {
				topic,
				message
			}), (e) => {
				if (e) this._diag.error("producerHook error", e);
			}, true);
			return span;
		}
	};
	exports.KafkaJsInstrumentation = KafkaJsInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-kafkajs/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-kafkajs/build/src/index.js
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
