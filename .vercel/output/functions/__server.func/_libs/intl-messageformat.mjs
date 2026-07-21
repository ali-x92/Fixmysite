import { n as strategies, t as memoize } from "./formatjs__fast-memoize.mjs";
import { a as isLiteralElement, c as isPluralElement, d as isTagElement, f as isTimeElement, i as isDateTimeSkeleton, l as isPoundElement, n as isArgumentElement, o as isNumberElement, r as isDateElement, s as isNumberSkeleton, t as parse, u as isSelectElement } from "./@formatjs/icu-messageformat-parser+[...].mjs";
import { __assign, __extends, __rest, __spreadArray } from "tslib";
//#region node_modules/intl-messageformat/lib/src/error.js
var ErrorCode;
(function(ErrorCode) {
	ErrorCode["MISSING_VALUE"] = "MISSING_VALUE";
	ErrorCode["INVALID_VALUE"] = "INVALID_VALUE";
	ErrorCode["MISSING_INTL_API"] = "MISSING_INTL_API";
})(ErrorCode || (ErrorCode = {}));
var FormatError = function(_super) {
	__extends(FormatError, _super);
	function FormatError(msg, code, originalMessage) {
		var _this = _super.call(this, msg) || this;
		_this.code = code;
		_this.originalMessage = originalMessage;
		return _this;
	}
	FormatError.prototype.toString = function() {
		return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
	};
	return FormatError;
}(Error);
var InvalidValueError = function(_super) {
	__extends(InvalidValueError, _super);
	function InvalidValueError(variableId, value, options, originalMessage) {
		return _super.call(this, "Invalid values for \"".concat(variableId, "\": \"").concat(value, "\". Options are \"").concat(Object.keys(options).join("\", \""), "\""), ErrorCode.INVALID_VALUE, originalMessage) || this;
	}
	return InvalidValueError;
}(FormatError);
var InvalidValueTypeError = function(_super) {
	__extends(InvalidValueTypeError, _super);
	function InvalidValueTypeError(value, type, originalMessage) {
		return _super.call(this, "Value for \"".concat(value, "\" must be of type ").concat(type), ErrorCode.INVALID_VALUE, originalMessage) || this;
	}
	return InvalidValueTypeError;
}(FormatError);
var MissingValueError = function(_super) {
	__extends(MissingValueError, _super);
	function MissingValueError(variableId, originalMessage) {
		return _super.call(this, "The intl string context variable \"".concat(variableId, "\" was not provided to the string \"").concat(originalMessage, "\""), ErrorCode.MISSING_VALUE, originalMessage) || this;
	}
	return MissingValueError;
}(FormatError);
//#endregion
//#region node_modules/intl-messageformat/lib/src/formatters.js
var PART_TYPE;
(function(PART_TYPE) {
	PART_TYPE[PART_TYPE["literal"] = 0] = "literal";
	PART_TYPE[PART_TYPE["object"] = 1] = "object";
})(PART_TYPE || (PART_TYPE = {}));
function mergeLiteral(parts) {
	if (parts.length < 2) return parts;
	return parts.reduce(function(all, part) {
		var lastPart = all[all.length - 1];
		if (!lastPart || lastPart.type !== PART_TYPE.literal || part.type !== PART_TYPE.literal) all.push(part);
		else lastPart.value += part.value;
		return all;
	}, []);
}
function isFormatXMLElementFn(el) {
	return typeof el === "function";
}
function formatToParts(els, locales, formatters, formats, values, currentPluralValue, originalMessage) {
	if (els.length === 1 && isLiteralElement(els[0])) return [{
		type: PART_TYPE.literal,
		value: els[0].value
	}];
	var result = [];
	for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
		var el = els_1[_i];
		if (isLiteralElement(el)) {
			result.push({
				type: PART_TYPE.literal,
				value: el.value
			});
			continue;
		}
		if (isPoundElement(el)) {
			if (typeof currentPluralValue === "number") result.push({
				type: PART_TYPE.literal,
				value: formatters.getNumberFormat(locales).format(currentPluralValue)
			});
			continue;
		}
		var varName = el.value;
		if (!(values && varName in values)) throw new MissingValueError(varName, originalMessage);
		var value = values[varName];
		if (isArgumentElement(el)) {
			if (!value || typeof value === "string" || typeof value === "number") value = typeof value === "string" || typeof value === "number" ? String(value) : "";
			result.push({
				type: typeof value === "string" ? PART_TYPE.literal : PART_TYPE.object,
				value
			});
			continue;
		}
		if (isDateElement(el)) {
			var style = typeof el.style === "string" ? formats.date[el.style] : isDateTimeSkeleton(el.style) ? el.style.parsedOptions : void 0;
			result.push({
				type: PART_TYPE.literal,
				value: formatters.getDateTimeFormat(locales, style).format(value)
			});
			continue;
		}
		if (isTimeElement(el)) {
			var style = typeof el.style === "string" ? formats.time[el.style] : isDateTimeSkeleton(el.style) ? el.style.parsedOptions : formats.time.medium;
			result.push({
				type: PART_TYPE.literal,
				value: formatters.getDateTimeFormat(locales, style).format(value)
			});
			continue;
		}
		if (isNumberElement(el)) {
			var style = typeof el.style === "string" ? formats.number[el.style] : isNumberSkeleton(el.style) ? el.style.parsedOptions : void 0;
			if (style && style.scale) value = value * (style.scale || 1);
			result.push({
				type: PART_TYPE.literal,
				value: formatters.getNumberFormat(locales, style).format(value)
			});
			continue;
		}
		if (isTagElement(el)) {
			var children = el.children, value_1 = el.value;
			var formatFn = values[value_1];
			if (!isFormatXMLElementFn(formatFn)) throw new InvalidValueTypeError(value_1, "function", originalMessage);
			var chunks = formatFn(formatToParts(children, locales, formatters, formats, values, currentPluralValue).map(function(p) {
				return p.value;
			}));
			if (!Array.isArray(chunks)) chunks = [chunks];
			result.push.apply(result, chunks.map(function(c) {
				return {
					type: typeof c === "string" ? PART_TYPE.literal : PART_TYPE.object,
					value: c
				};
			}));
		}
		if (isSelectElement(el)) {
			var opt = el.options[value] || el.options.other;
			if (!opt) throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
			result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
			continue;
		}
		if (isPluralElement(el)) {
			var opt = el.options["=".concat(value)];
			if (!opt) {
				if (!Intl.PluralRules) throw new FormatError("Intl.PluralRules is not available in this environment.\nTry polyfilling it using \"@formatjs/intl-pluralrules\"\n", ErrorCode.MISSING_INTL_API, originalMessage);
				var rule = formatters.getPluralRules(locales, { type: el.pluralType }).select(value - (el.offset || 0));
				opt = el.options[rule] || el.options.other;
			}
			if (!opt) throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
			result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
			continue;
		}
	}
	return mergeLiteral(result);
}
//#endregion
//#region node_modules/intl-messageformat/lib/src/core.js
function mergeConfig(c1, c2) {
	if (!c2) return c1;
	return __assign(__assign(__assign({}, c1 || {}), c2 || {}), Object.keys(c1).reduce(function(all, k) {
		all[k] = __assign(__assign({}, c1[k]), c2[k] || {});
		return all;
	}, {}));
}
function mergeConfigs(defaultConfig, configs) {
	if (!configs) return defaultConfig;
	return Object.keys(defaultConfig).reduce(function(all, k) {
		all[k] = mergeConfig(defaultConfig[k], configs[k]);
		return all;
	}, __assign({}, defaultConfig));
}
function createFastMemoizeCache(store) {
	return { create: function() {
		return {
			get: function(key) {
				return store[key];
			},
			set: function(key, value) {
				store[key] = value;
			}
		};
	} };
}
function createDefaultFormatters(cache) {
	if (cache === void 0) cache = {
		number: {},
		dateTime: {},
		pluralRules: {}
	};
	return {
		getNumberFormat: memoize(function() {
			var _a;
			var args = [];
			for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
			return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
		}, {
			cache: createFastMemoizeCache(cache.number),
			strategy: strategies.variadic
		}),
		getDateTimeFormat: memoize(function() {
			var _a;
			var args = [];
			for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
			return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
		}, {
			cache: createFastMemoizeCache(cache.dateTime),
			strategy: strategies.variadic
		}),
		getPluralRules: memoize(function() {
			var _a;
			var args = [];
			for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
			return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args, false)))();
		}, {
			cache: createFastMemoizeCache(cache.pluralRules),
			strategy: strategies.variadic
		})
	};
}
//#endregion
//#region node_modules/intl-messageformat/lib/index.js
var lib_default = function() {
	function IntlMessageFormat(message, locales, overrideFormats, opts) {
		if (locales === void 0) locales = IntlMessageFormat.defaultLocale;
		var _this = this;
		this.formatterCache = {
			number: {},
			dateTime: {},
			pluralRules: {}
		};
		this.format = function(values) {
			var parts = _this.formatToParts(values);
			if (parts.length === 1) return parts[0].value;
			var result = parts.reduce(function(all, part) {
				if (!all.length || part.type !== PART_TYPE.literal || typeof all[all.length - 1] !== "string") all.push(part.value);
				else all[all.length - 1] += part.value;
				return all;
			}, []);
			if (result.length <= 1) return result[0] || "";
			return result;
		};
		this.formatToParts = function(values) {
			return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, void 0, _this.message);
		};
		this.resolvedOptions = function() {
			var _a;
			return { locale: ((_a = _this.resolvedLocale) === null || _a === void 0 ? void 0 : _a.toString()) || Intl.NumberFormat.supportedLocalesOf(_this.locales)[0] };
		};
		this.getAst = function() {
			return _this.ast;
		};
		this.locales = locales;
		this.resolvedLocale = IntlMessageFormat.resolveLocale(locales);
		if (typeof message === "string") {
			this.message = message;
			if (!IntlMessageFormat.__parse) throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");
			var _a = opts || {};
			_a.formatters;
			var parseOpts = __rest(_a, ["formatters"]);
			this.ast = IntlMessageFormat.__parse(message, __assign(__assign({}, parseOpts), { locale: this.resolvedLocale }));
		} else this.ast = message;
		if (!Array.isArray(this.ast)) throw new TypeError("A message must be provided as a String or AST.");
		this.formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats);
		this.formatters = opts && opts.formatters || createDefaultFormatters(this.formatterCache);
	}
	Object.defineProperty(IntlMessageFormat, "defaultLocale", {
		get: function() {
			if (!IntlMessageFormat.memoizedDefaultLocale) IntlMessageFormat.memoizedDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale;
			return IntlMessageFormat.memoizedDefaultLocale;
		},
		enumerable: false,
		configurable: true
	});
	IntlMessageFormat.memoizedDefaultLocale = null;
	IntlMessageFormat.resolveLocale = function(locales) {
		if (typeof Intl.Locale === "undefined") return;
		var supportedLocales = Intl.NumberFormat.supportedLocalesOf(locales);
		if (supportedLocales.length > 0) return new Intl.Locale(supportedLocales[0]);
		return new Intl.Locale(typeof locales === "string" ? locales : locales[0]);
	};
	IntlMessageFormat.__parse = parse;
	IntlMessageFormat.formats = {
		number: {
			integer: { maximumFractionDigits: 0 },
			currency: { style: "currency" },
			percent: { style: "percent" }
		},
		date: {
			short: {
				month: "numeric",
				day: "numeric",
				year: "2-digit"
			},
			medium: {
				month: "short",
				day: "numeric",
				year: "numeric"
			},
			long: {
				month: "long",
				day: "numeric",
				year: "numeric"
			},
			full: {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric"
			}
		},
		time: {
			short: {
				hour: "numeric",
				minute: "numeric"
			},
			medium: {
				hour: "numeric",
				minute: "numeric",
				second: "numeric"
			},
			long: {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				timeZoneName: "short"
			},
			full: {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				timeZoneName: "short"
			}
		}
	};
	return IntlMessageFormat;
}();
//#endregion
export { lib_default as t };
