import { a as __toCommonJS, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
import { n as init_esm, t as esm_exports } from "./instrumentation+[...].mjs";
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/enum.js
var require_enum = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SpanNames = exports.TokenKind = exports.AllowedOperationTypes = void 0;
	(function(AllowedOperationTypes) {
		AllowedOperationTypes["QUERY"] = "query";
		AllowedOperationTypes["MUTATION"] = "mutation";
		AllowedOperationTypes["SUBSCRIPTION"] = "subscription";
	})(exports.AllowedOperationTypes || (exports.AllowedOperationTypes = {}));
	(function(TokenKind) {
		TokenKind["SOF"] = "<SOF>";
		TokenKind["EOF"] = "<EOF>";
		TokenKind["BANG"] = "!";
		TokenKind["DOLLAR"] = "$";
		TokenKind["AMP"] = "&";
		TokenKind["PAREN_L"] = "(";
		TokenKind["PAREN_R"] = ")";
		TokenKind["SPREAD"] = "...";
		TokenKind["COLON"] = ":";
		TokenKind["EQUALS"] = "=";
		TokenKind["AT"] = "@";
		TokenKind["BRACKET_L"] = "[";
		TokenKind["BRACKET_R"] = "]";
		TokenKind["BRACE_L"] = "{";
		TokenKind["PIPE"] = "|";
		TokenKind["BRACE_R"] = "}";
		TokenKind["NAME"] = "Name";
		TokenKind["INT"] = "Int";
		TokenKind["FLOAT"] = "Float";
		TokenKind["STRING"] = "String";
		TokenKind["BLOCK_STRING"] = "BlockString";
		TokenKind["COMMENT"] = "Comment";
	})(exports.TokenKind || (exports.TokenKind = {}));
	(function(SpanNames) {
		SpanNames["EXECUTE"] = "graphql.execute";
		SpanNames["PARSE"] = "graphql.parse";
		SpanNames["RESOLVE"] = "graphql.resolve";
		SpanNames["VALIDATE"] = "graphql.validate";
		SpanNames["SCHEMA_VALIDATE"] = "graphql.validateSchema";
		SpanNames["SCHEMA_PARSE"] = "graphql.parseSchema";
	})(exports.SpanNames || (exports.SpanNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/enums/AttributeNames.js
var require_AttributeNames = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AttributeNames = void 0;
	(function(AttributeNames) {
		AttributeNames["SOURCE"] = "graphql.source";
		AttributeNames["FIELD_NAME"] = "graphql.field.name";
		AttributeNames["FIELD_PATH"] = "graphql.field.path";
		AttributeNames["FIELD_TYPE"] = "graphql.field.type";
		AttributeNames["OPERATION_TYPE"] = "graphql.operation.type";
		AttributeNames["OPERATION_NAME"] = "graphql.operation.name";
		AttributeNames["VARIABLES"] = "graphql.variables.";
		AttributeNames["ERROR_VALIDATION_NAME"] = "graphql.validation.error";
	})(exports.AttributeNames || (exports.AttributeNames = {}));
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/symbols.js
var require_symbols = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.OTEL_GRAPHQL_DATA_SYMBOL = exports.OTEL_PATCHED_SYMBOL = void 0;
	exports.OTEL_PATCHED_SYMBOL = Symbol.for("opentelemetry.patched");
	exports.OTEL_GRAPHQL_DATA_SYMBOL = Symbol.for("opentelemetry.graphql_data");
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/internal-types.js
var require_internal_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.OPERATION_NOT_SUPPORTED = void 0;
	require_symbols();
	exports.OPERATION_NOT_SUPPORTED = "Operation$operationName$not supported";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wrapFieldResolver = exports.wrapFields = exports.getSourceFromLocation = exports.getOperation = exports.endSpan = exports.addSpanSource = exports.addInputVariableAttributes = exports.isPromise = void 0;
	var api = require_src$1();
	var enum_1 = require_enum();
	var AttributeNames_1 = require_AttributeNames();
	var symbols_1 = require_symbols();
	var OPERATION_VALUES = Object.values(enum_1.AllowedOperationTypes);
	var isPromise = (value) => {
		return typeof (value === null || value === void 0 ? void 0 : value.then) === "function";
	};
	exports.isPromise = isPromise;
	var isObjectLike = (value) => {
		return typeof value == "object" && value !== null;
	};
	function addInputVariableAttribute(span, key, variable) {
		if (Array.isArray(variable)) variable.forEach((value, idx) => {
			addInputVariableAttribute(span, `${key}.${idx}`, value);
		});
		else if (variable instanceof Object) Object.entries(variable).forEach(([nestedKey, value]) => {
			addInputVariableAttribute(span, `${key}.${nestedKey}`, value);
		});
		else span.setAttribute(`${AttributeNames_1.AttributeNames.VARIABLES}${String(key)}`, variable);
	}
	function addInputVariableAttributes(span, variableValues) {
		Object.entries(variableValues).forEach(([key, value]) => {
			addInputVariableAttribute(span, key, value);
		});
	}
	exports.addInputVariableAttributes = addInputVariableAttributes;
	function addSpanSource(span, loc, allowValues, start, end) {
		const source = getSourceFromLocation(loc, allowValues, start, end);
		span.setAttribute(AttributeNames_1.AttributeNames.SOURCE, source);
	}
	exports.addSpanSource = addSpanSource;
	function createFieldIfNotExists(tracer, getConfig, contextValue, info, path) {
		let field = getField(contextValue, path);
		let spanAdded = false;
		if (!field) {
			spanAdded = true;
			const parent = getParentField(contextValue, path);
			field = {
				parent,
				span: createResolverSpan(tracer, getConfig, contextValue, info, path, parent.span),
				error: null
			};
			addField(contextValue, path, field);
		}
		return {
			spanAdded,
			field
		};
	}
	function createResolverSpan(tracer, getConfig, contextValue, info, path, parentSpan) {
		var _a, _b;
		const attributes = {
			[AttributeNames_1.AttributeNames.FIELD_NAME]: info.fieldName,
			[AttributeNames_1.AttributeNames.FIELD_PATH]: path.join("."),
			[AttributeNames_1.AttributeNames.FIELD_TYPE]: info.returnType.toString()
		};
		const span = tracer.startSpan(`${enum_1.SpanNames.RESOLVE} ${attributes[AttributeNames_1.AttributeNames.FIELD_PATH]}`, { attributes }, parentSpan ? api.trace.setSpan(api.context.active(), parentSpan) : void 0);
		const document = contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].source;
		const fieldNode = info.fieldNodes.find((fieldNode) => fieldNode.kind === "Field");
		if (fieldNode) addSpanSource(span, document.loc, getConfig().allowValues, (_a = fieldNode.loc) === null || _a === void 0 ? void 0 : _a.start, (_b = fieldNode.loc) === null || _b === void 0 ? void 0 : _b.end);
		return span;
	}
	function endSpan(span, error) {
		if (error) span.recordException(error);
		span.end();
	}
	exports.endSpan = endSpan;
	function getOperation(document, operationName) {
		if (!document || !Array.isArray(document.definitions)) return;
		if (operationName) return document.definitions.filter((definition) => {
			var _a;
			return OPERATION_VALUES.indexOf((_a = definition) === null || _a === void 0 ? void 0 : _a.operation) !== -1;
		}).find((definition) => {
			var _a, _b;
			return operationName === ((_b = (_a = definition) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.value);
		});
		else return document.definitions.find((definition) => {
			var _a;
			return OPERATION_VALUES.indexOf((_a = definition) === null || _a === void 0 ? void 0 : _a.operation) !== -1;
		});
	}
	exports.getOperation = getOperation;
	function addField(contextValue, path, field) {
		return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")] = field;
	}
	function getField(contextValue, path) {
		return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")];
	}
	function getParentField(contextValue, path) {
		for (let i = path.length - 1; i > 0; i--) {
			const field = getField(contextValue, path.slice(0, i));
			if (field) return field;
		}
		return { span: contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].span };
	}
	function pathToArray(mergeItems, path) {
		const flattened = [];
		let curr = path;
		while (curr) {
			let key = curr.key;
			if (mergeItems && typeof key === "number") key = "*";
			flattened.push(String(key));
			curr = curr.prev;
		}
		return flattened.reverse();
	}
	function repeatBreak(i) {
		return repeatChar("\n", i);
	}
	function repeatSpace(i) {
		return repeatChar(" ", i);
	}
	function repeatChar(char, to) {
		let text = "";
		for (let i = 0; i < to; i++) text += char;
		return text;
	}
	var KindsToBeRemoved = [
		enum_1.TokenKind.FLOAT,
		enum_1.TokenKind.STRING,
		enum_1.TokenKind.INT,
		enum_1.TokenKind.BLOCK_STRING
	];
	function getSourceFromLocation(loc, allowValues = false, inputStart, inputEnd) {
		var _a, _b;
		let source = "";
		if (loc === null || loc === void 0 ? void 0 : loc.startToken) {
			const start = typeof inputStart === "number" ? inputStart : loc.start;
			const end = typeof inputEnd === "number" ? inputEnd : loc.end;
			let next = loc.startToken.next;
			let previousLine = 1;
			while (next) {
				if (next.start < start) {
					next = next.next;
					previousLine = next === null || next === void 0 ? void 0 : next.line;
					continue;
				}
				if (next.end > end) {
					next = next.next;
					previousLine = next === null || next === void 0 ? void 0 : next.line;
					continue;
				}
				let value = next.value || next.kind;
				let space = "";
				if (!allowValues && KindsToBeRemoved.indexOf(next.kind) >= 0) value = "*";
				if (next.kind === enum_1.TokenKind.STRING) value = `"${value}"`;
				if (next.kind === enum_1.TokenKind.EOF) value = "";
				if (next.line > previousLine) {
					source += repeatBreak(next.line - previousLine);
					previousLine = next.line;
					space = repeatSpace(next.column - 1);
				} else if (next.line === ((_a = next.prev) === null || _a === void 0 ? void 0 : _a.line)) space = repeatSpace(next.start - (((_b = next.prev) === null || _b === void 0 ? void 0 : _b.end) || 0));
				source += space + value;
				if (next) next = next.next;
			}
		}
		return source;
	}
	exports.getSourceFromLocation = getSourceFromLocation;
	function wrapFields(type, tracer, getConfig) {
		if (!type || typeof type.getFields !== "function" || type[symbols_1.OTEL_PATCHED_SYMBOL]) return;
		const fields = type.getFields();
		type[symbols_1.OTEL_PATCHED_SYMBOL] = true;
		Object.keys(fields).forEach((key) => {
			const field = fields[key];
			if (!field) return;
			if (field.resolve) field.resolve = wrapFieldResolver(tracer, getConfig, field.resolve);
			if (field.type) {
				let unwrappedType = field.type;
				while (unwrappedType.ofType) unwrappedType = unwrappedType.ofType;
				wrapFields(unwrappedType, tracer, getConfig);
			}
		});
	}
	exports.wrapFields = wrapFields;
	var handleResolveSpanError = (resolveSpan, err, shouldEndSpan) => {
		if (!shouldEndSpan) return;
		resolveSpan.recordException(err);
		resolveSpan.setStatus({
			code: api.SpanStatusCode.ERROR,
			message: err.message
		});
		resolveSpan.end();
	};
	var handleResolveSpanSuccess = (resolveSpan, shouldEndSpan) => {
		if (!shouldEndSpan) return;
		resolveSpan.end();
	};
	function wrapFieldResolver(tracer, getConfig, fieldResolver, isDefaultResolver = false) {
		if (wrappedFieldResolver[symbols_1.OTEL_PATCHED_SYMBOL] || typeof fieldResolver !== "function") return fieldResolver;
		function wrappedFieldResolver(source, args, contextValue, info) {
			if (!fieldResolver) return;
			const config = getConfig();
			if (config.ignoreTrivialResolveSpans && isDefaultResolver && (isObjectLike(source) || typeof source === "function")) {
				if (typeof source[info.fieldName] !== "function") return fieldResolver.call(this, source, args, contextValue, info);
			}
			if (!contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL]) return fieldResolver.call(this, source, args, contextValue, info);
			const path = pathToArray(config.mergeItems, info && info.path);
			const depth = path.filter((item) => typeof item === "string").length;
			let field;
			let shouldEndSpan = false;
			if (config.depth >= 0 && config.depth < depth) field = getParentField(contextValue, path);
			else {
				const newField = createFieldIfNotExists(tracer, getConfig, contextValue, info, path);
				field = newField.field;
				shouldEndSpan = newField.spanAdded;
			}
			return api.context.with(api.trace.setSpan(api.context.active(), field.span), () => {
				try {
					const res = fieldResolver.call(this, source, args, contextValue, info);
					if ((0, exports.isPromise)(res)) return res.then((r) => {
						handleResolveSpanSuccess(field.span, shouldEndSpan);
						return r;
					}, (err) => {
						handleResolveSpanError(field.span, err, shouldEndSpan);
						throw err;
					});
					else {
						handleResolveSpanSuccess(field.span, shouldEndSpan);
						return res;
					}
				} catch (err) {
					handleResolveSpanError(field.span, err, shouldEndSpan);
					throw err;
				}
			});
		}
		wrappedFieldResolver[symbols_1.OTEL_PATCHED_SYMBOL] = true;
		return wrappedFieldResolver;
	}
	exports.wrapFieldResolver = wrapFieldResolver;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/version.js
var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
	exports.PACKAGE_VERSION = "0.47.1";
	exports.PACKAGE_NAME = "@opentelemetry/instrumentation-graphql";
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/instrumentation.js
var require_instrumentation = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GraphQLInstrumentation = void 0;
	var api_1 = require_src$1();
	var instrumentation_1 = (init_esm(), __toCommonJS(esm_exports));
	var enum_1 = require_enum();
	var AttributeNames_1 = require_AttributeNames();
	var symbols_1 = require_symbols();
	var internal_types_1 = require_internal_types();
	var utils_1 = require_utils();
	/** @knipignore */
	var version_1 = require_version();
	var DEFAULT_CONFIG = {
		mergeItems: false,
		depth: -1,
		allowValues: false,
		ignoreResolveSpans: false
	};
	var supportedVersions = [">=14.0.0 <17"];
	var GraphQLInstrumentation = class extends instrumentation_1.InstrumentationBase {
		constructor(config = {}) {
			super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
		}
		setConfig(config = {}) {
			super.setConfig(Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
		}
		init() {
			const module$1 = new instrumentation_1.InstrumentationNodeModuleDefinition("graphql", supportedVersions);
			module$1.files.push(this._addPatchingExecute());
			module$1.files.push(this._addPatchingParser());
			module$1.files.push(this._addPatchingValidate());
			return module$1;
		}
		_addPatchingExecute() {
			return new instrumentation_1.InstrumentationNodeModuleFile("graphql/execution/execute.js", supportedVersions, (moduleExports) => {
				if ((0, instrumentation_1.isWrapped)(moduleExports.execute)) this._unwrap(moduleExports, "execute");
				this._wrap(moduleExports, "execute", this._patchExecute(moduleExports.defaultFieldResolver));
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports) this._unwrap(moduleExports, "execute");
			});
		}
		_addPatchingParser() {
			return new instrumentation_1.InstrumentationNodeModuleFile("graphql/language/parser.js", supportedVersions, (moduleExports) => {
				if ((0, instrumentation_1.isWrapped)(moduleExports.parse)) this._unwrap(moduleExports, "parse");
				this._wrap(moduleExports, "parse", this._patchParse());
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports) this._unwrap(moduleExports, "parse");
			});
		}
		_addPatchingValidate() {
			return new instrumentation_1.InstrumentationNodeModuleFile("graphql/validation/validate.js", supportedVersions, (moduleExports) => {
				if ((0, instrumentation_1.isWrapped)(moduleExports.validate)) this._unwrap(moduleExports, "validate");
				this._wrap(moduleExports, "validate", this._patchValidate());
				return moduleExports;
			}, (moduleExports) => {
				if (moduleExports) this._unwrap(moduleExports, "validate");
			});
		}
		_patchExecute(defaultFieldResolved) {
			const instrumentation = this;
			return function execute(original) {
				return function patchExecute() {
					let processedArgs;
					if (arguments.length >= 2) {
						const args = arguments;
						processedArgs = instrumentation._wrapExecuteArgs(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], defaultFieldResolved);
					} else {
						const args = arguments[0];
						processedArgs = instrumentation._wrapExecuteArgs(args.schema, args.document, args.rootValue, args.contextValue, args.variableValues, args.operationName, args.fieldResolver, args.typeResolver, defaultFieldResolved);
					}
					const operation = (0, utils_1.getOperation)(processedArgs.document, processedArgs.operationName);
					const span = instrumentation._createExecuteSpan(operation, processedArgs);
					processedArgs.contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] = {
						source: processedArgs.document ? processedArgs.document || processedArgs.document[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] : void 0,
						span,
						fields: {}
					};
					return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
						return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
							return original.apply(this, [processedArgs]);
						}, (err, result) => {
							instrumentation._handleExecutionResult(span, err, result);
						});
					});
				};
			};
		}
		_handleExecutionResult(span, err, result) {
			const config = this.getConfig();
			if (result === void 0 || err) {
				(0, utils_1.endSpan)(span, err);
				return;
			}
			if ((0, utils_1.isPromise)(result)) result.then((resultData) => {
				if (typeof config.responseHook !== "function") {
					(0, utils_1.endSpan)(span);
					return;
				}
				this._executeResponseHook(span, resultData);
			}, (error) => {
				(0, utils_1.endSpan)(span, error);
			});
			else {
				if (typeof config.responseHook !== "function") {
					(0, utils_1.endSpan)(span);
					return;
				}
				this._executeResponseHook(span, result);
			}
		}
		_executeResponseHook(span, result) {
			const { responseHook } = this.getConfig();
			if (!responseHook) return;
			(0, instrumentation_1.safeExecuteInTheMiddle)(() => {
				responseHook(span, result);
			}, (err) => {
				if (err) this._diag.error("Error running response hook", err);
				(0, utils_1.endSpan)(span, void 0);
			}, true);
		}
		_patchParse() {
			const instrumentation = this;
			return function parse(original) {
				return function patchParse(source, options) {
					return instrumentation._parse(this, original, source, options);
				};
			};
		}
		_patchValidate() {
			const instrumentation = this;
			return function validate(original) {
				return function patchValidate(schema, documentAST, rules, options, typeInfo) {
					return instrumentation._validate(this, original, schema, documentAST, rules, typeInfo, options);
				};
			};
		}
		_parse(obj, original, source, options) {
			const config = this.getConfig();
			const span = this.tracer.startSpan(enum_1.SpanNames.PARSE);
			return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
				return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
					return original.call(obj, source, options);
				}, (err, result) => {
					if (result) {
						if (!(0, utils_1.getOperation)(result)) span.updateName(enum_1.SpanNames.SCHEMA_PARSE);
						else if (result.loc) (0, utils_1.addSpanSource)(span, result.loc, config.allowValues);
					}
					(0, utils_1.endSpan)(span, err);
				});
			});
		}
		_validate(obj, original, schema, documentAST, rules, typeInfo, options) {
			const span = this.tracer.startSpan(enum_1.SpanNames.VALIDATE, {});
			return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
				return (0, instrumentation_1.safeExecuteInTheMiddle)(() => {
					return original.call(obj, schema, documentAST, rules, options, typeInfo);
				}, (err, errors) => {
					if (!documentAST.loc) span.updateName(enum_1.SpanNames.SCHEMA_VALIDATE);
					if (errors && errors.length) span.recordException({
						name: AttributeNames_1.AttributeNames.ERROR_VALIDATION_NAME,
						message: JSON.stringify(errors)
					});
					(0, utils_1.endSpan)(span, err);
				});
			});
		}
		_createExecuteSpan(operation, processedArgs) {
			var _a;
			const config = this.getConfig();
			const span = this.tracer.startSpan(enum_1.SpanNames.EXECUTE, {});
			if (operation) {
				const { operation: operationType, name: nameNode } = operation;
				span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_TYPE, operationType);
				const operationName = nameNode === null || nameNode === void 0 ? void 0 : nameNode.value;
				if (operationName) {
					span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_NAME, operationName);
					span.updateName(`${operationType} ${operationName}`);
				} else span.updateName(operationType);
			} else {
				let operationName = " ";
				if (processedArgs.operationName) operationName = ` "${processedArgs.operationName}" `;
				operationName = internal_types_1.OPERATION_NOT_SUPPORTED.replace("$operationName$", operationName);
				span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_NAME, operationName);
			}
			if ((_a = processedArgs.document) === null || _a === void 0 ? void 0 : _a.loc) (0, utils_1.addSpanSource)(span, processedArgs.document.loc, config.allowValues);
			if (processedArgs.variableValues && config.allowValues) (0, utils_1.addInputVariableAttributes)(span, processedArgs.variableValues);
			return span;
		}
		_wrapExecuteArgs(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver, defaultFieldResolved) {
			if (!contextValue) contextValue = {};
			if (contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] || this.getConfig().ignoreResolveSpans) return {
				schema,
				document,
				rootValue,
				contextValue,
				variableValues,
				operationName,
				fieldResolver,
				typeResolver
			};
			const isUsingDefaultResolver = fieldResolver == null;
			const fieldResolverForExecute = fieldResolver !== null && fieldResolver !== void 0 ? fieldResolver : defaultFieldResolved;
			fieldResolver = (0, utils_1.wrapFieldResolver)(this.tracer, () => this.getConfig(), fieldResolverForExecute, isUsingDefaultResolver);
			if (schema) {
				(0, utils_1.wrapFields)(schema.getQueryType(), this.tracer, () => this.getConfig());
				(0, utils_1.wrapFields)(schema.getMutationType(), this.tracer, () => this.getConfig());
			}
			return {
				schema,
				document,
				rootValue,
				contextValue,
				variableValues,
				operationName,
				fieldResolver,
				typeResolver
			};
		}
	};
	exports.GraphQLInstrumentation = GraphQLInstrumentation;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation-graphql/build/src/index.js
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
