//#region node_modules/@sentry/core/build/esm/debug-build.js
/**
* This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
*
* ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
*/
var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/worldwide.js
/** Internal global with common properties and Sentry extensions  */
/** Get's the global object for the current JavaScript runtime */
var GLOBAL_OBJ = globalThis;
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/version.js
var SDK_VERSION = "9.47.1";
//#endregion
//#region node_modules/@sentry/core/build/esm/carrier.js
/**
* An object that contains globally accessible properties and maintains a scope stack.
* @hidden
*/
/**
* Returns the global shim registry.
*
* FIXME: This function is problematic, because despite always returning a valid Carrier,
* it has an optional `__SENTRY__` property, which then in turn requires us to always perform an unnecessary check
* at the call-site. We always access the carrier through this function, so we can guarantee that `__SENTRY__` is there.
**/
function getMainCarrier() {
	getSentryCarrier(GLOBAL_OBJ);
	return GLOBAL_OBJ;
}
/** Will either get the existing sentry carrier, or create a new one. */
function getSentryCarrier(carrier) {
	const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
	__SENTRY__.version = __SENTRY__.version || "9.47.1";
	return __SENTRY__[SDK_VERSION] = __SENTRY__["9.47.1"] || {};
}
/**
* Returns a global singleton contained in the global `__SENTRY__[]` object.
*
* If the singleton doesn't already exist in `__SENTRY__`, it will be created using the given factory
* function and added to the `__SENTRY__` object.
*
* @param name name of the global singleton on __SENTRY__
* @param creator creator Factory function to create the singleton if it doesn't already exist on `__SENTRY__`
* @param obj (Optional) The global object on which to look for `__SENTRY__`, if not `GLOBAL_OBJ`'s return value
* @returns the singleton
*/
function getGlobalSingleton(name, creator, obj = GLOBAL_OBJ) {
	const __SENTRY__ = obj.__SENTRY__ = obj.__SENTRY__ || {};
	const carrier = __SENTRY__[SDK_VERSION] = __SENTRY__["9.47.1"] || {};
	return carrier[name] || (carrier[name] = creator());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/debug-logger.js
/**
* A Sentry Logger instance.
*
* @deprecated Use {@link debug} instead with the {@link SentryDebugLogger} type.
*/
var CONSOLE_LEVELS = [
	"debug",
	"info",
	"warn",
	"error",
	"log",
	"assert",
	"trace"
];
/** Prefix for logging strings */
var PREFIX = "Sentry Logger ";
/** This may be mutated by the console instrumentation. */
var originalConsoleMethods = {};
/**
* Temporarily disable sentry console instrumentations.
*
* @param callback The function to run against the original `console` messages
* @returns The results of the callback
*/
function consoleSandbox(callback) {
	if (!("console" in GLOBAL_OBJ)) return callback();
	const console = GLOBAL_OBJ.console;
	const wrappedFuncs = {};
	const wrappedLevels = Object.keys(originalConsoleMethods);
	wrappedLevels.forEach((level) => {
		const originalConsoleMethod = originalConsoleMethods[level];
		wrappedFuncs[level] = console[level];
		console[level] = originalConsoleMethod;
	});
	try {
		return callback();
	} finally {
		wrappedLevels.forEach((level) => {
			console[level] = wrappedFuncs[level];
		});
	}
}
function enable() {
	_getLoggerSettings().enabled = true;
}
function disable() {
	_getLoggerSettings().enabled = false;
}
function isEnabled$1() {
	return _getLoggerSettings().enabled;
}
function log(...args) {
	_maybeLog("log", ...args);
}
function warn(...args) {
	_maybeLog("warn", ...args);
}
function error(...args) {
	_maybeLog("error", ...args);
}
function _maybeLog(level, ...args) {
	if (!DEBUG_BUILD) return;
	if (isEnabled$1()) consoleSandbox(() => {
		GLOBAL_OBJ.console[level](`${PREFIX}[${level}]:`, ...args);
	});
}
function _getLoggerSettings() {
	if (!DEBUG_BUILD) return { enabled: false };
	return getGlobalSingleton("loggerSettings", () => ({ enabled: false }));
}
/**
* This is a logger singleton which either logs things or no-ops if logging is not enabled.
*/
var debug = {
	/** Enable logging. */
	enable,
	/** Disable logging. */
	disable,
	/** Check if logging is enabled. */
	isEnabled: isEnabled$1,
	/** Log a message. */
	log,
	/** Log a warning. */
	warn,
	/** Log an error. */
	error
};
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/stacktrace.js
var STACKTRACE_FRAME_LIMIT = 50;
var WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
var STRIP_FRAME_REGEXP = /captureMessage|captureException/;
/**
* Creates a stack parser with the supplied line parsers
*
* StackFrames are returned in the correct order for Sentry Exception
* frames and with Sentry SDK internal frames removed from the top and bottom
*
*/
function createStackParser(...parsers) {
	const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map((p) => p[1]);
	return (stack, skipFirstLines = 0, framesToPop = 0) => {
		const frames = [];
		const lines = stack.split("\n");
		for (let i = skipFirstLines; i < lines.length; i++) {
			const line = lines[i];
			if (line.length > 1024) continue;
			const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, "$1") : line;
			if (cleanedLine.match(/\S*Error: /)) continue;
			for (const parser of sortedParsers) {
				const frame = parser(cleanedLine);
				if (frame) {
					frames.push(frame);
					break;
				}
			}
			if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) break;
		}
		return stripSentryFramesAndReverse(frames.slice(framesToPop));
	};
}
/**
* Gets a stack parser implementation from Options.stackParser
* @see Options
*
* If options contains an array of line parsers, it is converted into a parser
*/
function stackParserFromStackParserOptions(stackParser) {
	if (Array.isArray(stackParser)) return createStackParser(...stackParser);
	return stackParser;
}
/**
* Removes Sentry frames from the top and bottom of the stack if present and enforces a limit of max number of frames.
* Assumes stack input is ordered from top to bottom and returns the reverse representation so call site of the
* function that caused the crash is the last frame in the array.
* @hidden
*/
function stripSentryFramesAndReverse(stack) {
	if (!stack.length) return [];
	const localStack = Array.from(stack);
	if (/sentryWrapped/.test(getLastStackFrame(localStack).function || "")) localStack.pop();
	localStack.reverse();
	if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) {
		localStack.pop();
		if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) localStack.pop();
	}
	return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame) => ({
		...frame,
		filename: frame.filename || getLastStackFrame(localStack).filename,
		function: frame.function || "?"
	}));
}
function getLastStackFrame(arr) {
	return arr[arr.length - 1] || {};
}
var defaultFunctionName = "<anonymous>";
/**
* Safely extract function name from itself
*/
function getFunctionName(fn) {
	try {
		if (!fn || typeof fn !== "function") return defaultFunctionName;
		return fn.name || defaultFunctionName;
	} catch {
		return defaultFunctionName;
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/handlers.js
var handlers = {};
var instrumented = {};
/** Add a handler function. */
function addHandler(type, handler) {
	handlers[type] = handlers[type] || [];
	handlers[type].push(handler);
}
/** Maybe run an instrumentation function, unless it was already called. */
function maybeInstrument(type, instrumentFn) {
	if (!instrumented[type]) {
		instrumented[type] = true;
		try {
			instrumentFn();
		} catch (e) {
			DEBUG_BUILD && debug.error(`Error while instrumenting ${type}`, e);
		}
	}
}
/** Trigger handlers for a given instrumentation type. */
function triggerHandlers(type, data) {
	const typeHandlers = type && handlers[type];
	if (!typeHandlers) return;
	for (const handler of typeHandlers) try {
		handler(data);
	} catch (e) {
		DEBUG_BUILD && debug.error(`Error while triggering instrumentation handler.\nType: ${type}\nName: ${getFunctionName(handler)}\nError:`, e);
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/globalError.js
var _oldOnErrorHandler = null;
/**
* Add an instrumentation handler for when an error is captured by the global error handler.
*
* Use at your own risk, this might break without changelog notice, only used internally.
* @hidden
*/
function addGlobalErrorInstrumentationHandler(handler) {
	const type = "error";
	addHandler(type, handler);
	maybeInstrument(type, instrumentError);
}
function instrumentError() {
	_oldOnErrorHandler = GLOBAL_OBJ.onerror;
	GLOBAL_OBJ.onerror = function(msg, url, line, column, error) {
		triggerHandlers("error", {
			column,
			error,
			line,
			msg,
			url
		});
		if (_oldOnErrorHandler) return _oldOnErrorHandler.apply(this, arguments);
		return false;
	};
	GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/globalUnhandledRejection.js
var _oldOnUnhandledRejectionHandler = null;
/**
* Add an instrumentation handler for when an unhandled promise rejection is captured.
*
* Use at your own risk, this might break without changelog notice, only used internally.
* @hidden
*/
function addGlobalUnhandledRejectionInstrumentationHandler(handler) {
	const type = "unhandledrejection";
	addHandler(type, handler);
	maybeInstrument(type, instrumentUnhandledRejection);
}
function instrumentUnhandledRejection() {
	_oldOnUnhandledRejectionHandler = GLOBAL_OBJ.onunhandledrejection;
	GLOBAL_OBJ.onunhandledrejection = function(e) {
		triggerHandlers("unhandledrejection", e);
		if (_oldOnUnhandledRejectionHandler) return _oldOnUnhandledRejectionHandler.apply(this, arguments);
		return true;
	};
	GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/is.js
var objectToString = Object.prototype.toString;
/**
* Checks whether given value's type is one of a few Error or Error-like
* {@link isError}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isError(wat) {
	switch (objectToString.call(wat)) {
		case "[object Error]":
		case "[object Exception]":
		case "[object DOMException]":
		case "[object WebAssembly.Exception]": return true;
		default: return isInstanceOf(wat, Error);
	}
}
/**
* Checks whether given value is an instance of the given built-in class.
*
* @param wat The value to be checked
* @param className
* @returns A boolean representing the result.
*/
function isBuiltin(wat, className) {
	return objectToString.call(wat) === `[object ${className}]`;
}
/**
* Checks whether given value's type is ErrorEvent
* {@link isErrorEvent}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isErrorEvent$1(wat) {
	return isBuiltin(wat, "ErrorEvent");
}
/**
* Checks whether given value's type is a string
* {@link isString}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isString(wat) {
	return isBuiltin(wat, "String");
}
/**
* Checks whether given string is parameterized
* {@link isParameterizedString}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isParameterizedString(wat) {
	return typeof wat === "object" && wat !== null && "__sentry_template_string__" in wat && "__sentry_template_values__" in wat;
}
/**
* Checks whether given value is a primitive (undefined, null, number, boolean, string, bigint, symbol)
* {@link isPrimitive}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isPrimitive(wat) {
	return wat === null || isParameterizedString(wat) || typeof wat !== "object" && typeof wat !== "function";
}
/**
* Checks whether given value's type is an object literal, or a class instance.
* {@link isPlainObject}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isPlainObject(wat) {
	return isBuiltin(wat, "Object");
}
/**
* Checks whether given value's type is an Event instance
* {@link isEvent}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isEvent(wat) {
	return typeof Event !== "undefined" && isInstanceOf(wat, Event);
}
/**
* Checks whether given value's type is an Element instance
* {@link isElement}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isElement(wat) {
	return typeof Element !== "undefined" && isInstanceOf(wat, Element);
}
/**
* Checks whether given value's type is an regexp
* {@link isRegExp}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isRegExp(wat) {
	return isBuiltin(wat, "RegExp");
}
/**
* Checks whether given value has a then function.
* @param wat A value to be checked.
*/
function isThenable(wat) {
	return Boolean(wat?.then && typeof wat.then === "function");
}
/**
* Checks whether given value's type is a SyntheticEvent
* {@link isSyntheticEvent}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isSyntheticEvent(wat) {
	return isPlainObject(wat) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat;
}
/**
* Checks whether given value's type is an instance of provided constructor.
* {@link isInstanceOf}.
*
* @param wat A value to be checked.
* @param base A constructor to be used in a check.
* @returns A boolean representing the result.
*/
function isInstanceOf(wat, base) {
	try {
		return wat instanceof base;
	} catch {
		return false;
	}
}
/**
* Checks whether given value's type is a Vue ViewModel.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isVueViewModel(wat) {
	return !!(typeof wat === "object" && wat !== null && (wat.__isVue || wat._isVue));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/browser.js
var WINDOW = GLOBAL_OBJ;
var DEFAULT_MAX_STRING_LENGTH = 80;
/**
* Given a child DOM element, returns a query-selector statement describing that
* and its ancestors
* e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
* @returns generated DOM path
*/
function htmlTreeAsString(elem, options = {}) {
	if (!elem) return "<unknown>";
	try {
		let currentElem = elem;
		const MAX_TRAVERSE_HEIGHT = 5;
		const out = [];
		let height = 0;
		let len = 0;
		const separator = " > ";
		const sepLength = 3;
		let nextStr;
		const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
		const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
		while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
			nextStr = _htmlElementAsString(currentElem, keyAttrs);
			if (nextStr === "html" || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) break;
			out.push(nextStr);
			len += nextStr.length;
			currentElem = currentElem.parentNode;
		}
		return out.reverse().join(separator);
	} catch {
		return "<unknown>";
	}
}
/**
* Returns a simple, query-selector representation of a DOM element
* e.g. [HTMLElement] => input#foo.btn[name=baz]
* @returns generated DOM path
*/
function _htmlElementAsString(el, keyAttrs) {
	const elem = el;
	const out = [];
	if (!elem?.tagName) return "";
	if (WINDOW.HTMLElement) {
		if (elem instanceof HTMLElement && elem.dataset) {
			if (elem.dataset["sentryComponent"]) return elem.dataset["sentryComponent"];
			if (elem.dataset["sentryElement"]) return elem.dataset["sentryElement"];
		}
	}
	out.push(elem.tagName.toLowerCase());
	const keyAttrPairs = keyAttrs?.length ? keyAttrs.filter((keyAttr) => elem.getAttribute(keyAttr)).map((keyAttr) => [keyAttr, elem.getAttribute(keyAttr)]) : null;
	if (keyAttrPairs?.length) keyAttrPairs.forEach((keyAttrPair) => {
		out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
	});
	else {
		if (elem.id) out.push(`#${elem.id}`);
		const className = elem.className;
		if (className && isString(className)) {
			const classes = className.split(/\s+/);
			for (const c of classes) out.push(`.${c}`);
		}
	}
	for (const k of [
		"aria-label",
		"type",
		"name",
		"title",
		"alt"
	]) {
		const attr = elem.getAttribute(k);
		if (attr) out.push(`[${k}="${attr}"]`);
	}
	return out.join("");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/string.js
/**
* Truncates given string to the maximum characters count
*
* @param str An object that contains serializable values
* @param max Maximum number of characters in truncated string (0 = unlimited)
* @returns string Encoded
*/
function truncate(str, max = 0) {
	if (typeof str !== "string" || max === 0) return str;
	return str.length <= max ? str : `${str.slice(0, max)}...`;
}
/**
* This is basically just `trim_line` from
* https://github.com/getsentry/sentry/blob/master/src/sentry/lang/javascript/processor.py#L67
*
* @param str An object that contains serializable values
* @param max Maximum number of characters in truncated string
* @returns string Encoded
*/
function snipLine(line, colno) {
	let newLine = line;
	const lineLength = newLine.length;
	if (lineLength <= 150) return newLine;
	if (colno > lineLength) colno = lineLength;
	let start = Math.max(colno - 60, 0);
	if (start < 5) start = 0;
	let end = Math.min(start + 140, lineLength);
	if (end > lineLength - 5) end = lineLength;
	if (end === lineLength) start = Math.max(end - 140, 0);
	newLine = newLine.slice(start, end);
	if (start > 0) newLine = `'{snip} ${newLine}`;
	if (end < lineLength) newLine += " {snip}";
	return newLine;
}
/**
* Join values in array
* @param input array of values to be joined together
* @param delimiter string to be placed in-between values
* @returns Joined values
*/
function safeJoin(input, delimiter) {
	if (!Array.isArray(input)) return "";
	const output = [];
	for (let i = 0; i < input.length; i++) {
		const value = input[i];
		try {
			if (isVueViewModel(value)) output.push("[VueViewModel]");
			else output.push(String(value));
		} catch {
			output.push("[value cannot be serialized]");
		}
	}
	return output.join(delimiter);
}
/**
* Checks if the given value matches a regex or string
*
* @param value The string to test
* @param pattern Either a regex or a string against which `value` will be matched
* @param requireExactStringMatch If true, `value` must match `pattern` exactly. If false, `value` will match
* `pattern` if it contains `pattern`. Only applies to string-type patterns.
*/
function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
	if (!isString(value)) return false;
	if (isRegExp(pattern)) return pattern.test(value);
	if (isString(pattern)) return requireExactStringMatch ? value === pattern : value.includes(pattern);
	return false;
}
/**
* Test the given string against an array of strings and regexes. By default, string matching is done on a
* substring-inclusion basis rather than a strict equality basis
*
* @param testString The string to test
* @param patterns The patterns against which to test the string
* @param requireExactStringMatch If true, `testString` must match one of the given string patterns exactly in order to
* count. If false, `testString` will match a string pattern if it contains that pattern.
* @returns
*/
function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
	return patterns.some((pattern) => isMatchingPattern(testString, pattern, requireExactStringMatch));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/object.js
/**
* Replace a method in an object with a wrapped version of itself.
*
* If the method on the passed object is not a function, the wrapper will not be applied.
*
* @param source An object that contains a method to be wrapped.
* @param name The name of the method to be wrapped.
* @param replacementFactory A higher-order function that takes the original version of the given method and returns a
* wrapped version. Note: The function returned by `replacementFactory` needs to be a non-arrow function, in order to
* preserve the correct value of `this`, and the original method must be called using `origMethod.call(this, <other
* args>)` or `origMethod.apply(this, [<other args>])` (rather than being called directly), again to preserve `this`.
* @returns void
*/
function fill(source, name, replacementFactory) {
	if (!(name in source)) return;
	const original = source[name];
	if (typeof original !== "function") return;
	const wrapped = replacementFactory(original);
	if (typeof wrapped === "function") markFunctionWrapped(wrapped, original);
	try {
		source[name] = wrapped;
	} catch {
		DEBUG_BUILD && debug.log(`Failed to replace method "${name}" in object`, source);
	}
}
/**
* Defines a non-enumerable property on the given object.
*
* @param obj The object on which to set the property
* @param name The name of the property to be set
* @param value The value to which to set the property
*/
function addNonEnumerableProperty(obj, name, value) {
	try {
		Object.defineProperty(obj, name, {
			value,
			writable: true,
			configurable: true
		});
	} catch {
		DEBUG_BUILD && debug.log(`Failed to add non-enumerable property "${name}" to object`, obj);
	}
}
/**
* Remembers the original function on the wrapped function and
* patches up the prototype.
*
* @param wrapped the wrapper function
* @param original the original function that gets wrapped
*/
function markFunctionWrapped(wrapped, original) {
	try {
		wrapped.prototype = original.prototype = original.prototype || {};
		addNonEnumerableProperty(wrapped, "__sentry_original__", original);
	} catch {}
}
/**
* This extracts the original function if available.  See
* `markFunctionWrapped` for more information.
*
* @param func the function to unwrap
* @returns the unwrapped version of the function if available.
*/
function getOriginalFunction(func) {
	return func.__sentry_original__;
}
/**
* Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
* non-enumerable properties attached.
*
* @param value Initial source that we have to transform in order for it to be usable by the serializer
* @returns An Event or Error turned into an object - or the value argument itself, when value is neither an Event nor
*  an Error.
*/
function convertToPlainObject(value) {
	if (isError(value)) return {
		message: value.message,
		name: value.name,
		stack: value.stack,
		...getOwnProperties(value)
	};
	else if (isEvent(value)) {
		const newObj = {
			type: value.type,
			target: serializeEventTarget(value.target),
			currentTarget: serializeEventTarget(value.currentTarget),
			...getOwnProperties(value)
		};
		if (typeof CustomEvent !== "undefined" && isInstanceOf(value, CustomEvent)) newObj.detail = value.detail;
		return newObj;
	} else return value;
}
/** Creates a string representation of the target of an `Event` object */
function serializeEventTarget(target) {
	try {
		return isElement(target) ? htmlTreeAsString(target) : Object.prototype.toString.call(target);
	} catch {
		return "<unknown>";
	}
}
/** Filters out all but an object's own properties */
function getOwnProperties(obj) {
	if (typeof obj === "object" && obj !== null) {
		const extractedProps = {};
		for (const property in obj) if (Object.prototype.hasOwnProperty.call(obj, property)) extractedProps[property] = obj[property];
		return extractedProps;
	} else return {};
}
/**
* Given any captured exception, extract its keys and create a sorted
* and truncated list that will be used inside the event message.
* eg. `Non-error exception captured with keys: foo, bar, baz`
*/
function extractExceptionKeysForMessage(exception, maxLength = 40) {
	const keys = Object.keys(convertToPlainObject(exception));
	keys.sort();
	const firstKey = keys[0];
	if (!firstKey) return "[object has no keys]";
	if (firstKey.length >= maxLength) return truncate(firstKey, maxLength);
	for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
		const serialized = keys.slice(0, includedKeys).join(", ");
		if (serialized.length > maxLength) continue;
		if (includedKeys === keys.length) return serialized;
		return truncate(serialized, maxLength);
	}
	return "";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/misc.js
function getCrypto() {
	const gbl = GLOBAL_OBJ;
	return gbl.crypto || gbl.msCrypto;
}
/**
* UUID4 generator
* @param crypto Object that provides the crypto API.
* @returns string Generated UUID4.
*/
function uuid4(crypto = getCrypto()) {
	let getRandomByte = () => Math.random() * 16;
	try {
		if (crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, "");
		if (crypto?.getRandomValues) getRandomByte = () => {
			const typedArray = /* @__PURE__ */ new Uint8Array(1);
			crypto.getRandomValues(typedArray);
			return typedArray[0];
		};
	} catch {}
	return "10000000100040008000100000000000".replace(/[018]/g, (c) => (c ^ (getRandomByte() & 15) >> c / 4).toString(16));
}
function getFirstException(event) {
	return event.exception?.values?.[0];
}
/**
* Extracts either message or type+value from an event that can be used for user-facing logs
* @returns event's description
*/
function getEventDescription(event) {
	const { message, event_id: eventId } = event;
	if (message) return message;
	const firstException = getFirstException(event);
	if (firstException) {
		if (firstException.type && firstException.value) return `${firstException.type}: ${firstException.value}`;
		return firstException.type || firstException.value || eventId || "<unknown>";
	}
	return eventId || "<unknown>";
}
/**
* Adds exception values, type and value to an synthetic Exception.
* @param event The event to modify.
* @param value Value of the exception.
* @param type Type of the exception.
* @hidden
*/
function addExceptionTypeValue(event, value, type) {
	const exception = event.exception = event.exception || {};
	const values = exception.values = exception.values || [];
	const firstException = values[0] = values[0] || {};
	if (!firstException.value) firstException.value = value || "";
	if (!firstException.type) firstException.type = type || "Error";
}
/**
* Adds exception mechanism data to a given event. Uses defaults if the second parameter is not passed.
*
* @param event The event to modify.
* @param newMechanism Mechanism data to add to the event.
* @hidden
*/
function addExceptionMechanism(event, newMechanism) {
	const firstException = getFirstException(event);
	if (!firstException) return;
	const defaultMechanism = {
		type: "generic",
		handled: true
	};
	const currentMechanism = firstException.mechanism;
	firstException.mechanism = {
		...defaultMechanism,
		...currentMechanism,
		...newMechanism
	};
	if (newMechanism && "data" in newMechanism) {
		const mergedData = {
			...currentMechanism?.data,
			...newMechanism.data
		};
		firstException.mechanism.data = mergedData;
	}
}
var SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
/**
* Represents Semantic Versioning object
*/
function _parseInt(input) {
	return parseInt(input || "", 10);
}
/**
* Parses input into a SemVer interface
* @param input string representation of a semver version
*/
function parseSemver(input) {
	const match = input.match(SEMVER_REGEXP) || [];
	const major = _parseInt(match[1]);
	const minor = _parseInt(match[2]);
	const patch = _parseInt(match[3]);
	return {
		buildmetadata: match[5],
		major: isNaN(major) ? void 0 : major,
		minor: isNaN(minor) ? void 0 : minor,
		patch: isNaN(patch) ? void 0 : patch,
		prerelease: match[4]
	};
}
/**
* Checks whether or not we've already captured the given exception (note: not an identical exception - the very object
* in question), and marks it captured if not.
*
* This is useful because it's possible for an error to get captured by more than one mechanism. After we intercept and
* record an error, we rethrow it (assuming we've intercepted it before it's reached the top-level global handlers), so
* that we don't interfere with whatever effects the error might have had were the SDK not there. At that point, because
* the error has been rethrown, it's possible for it to bubble up to some other code we've instrumented. If it's not
* caught after that, it will bubble all the way up to the global handlers (which of course we also instrument). This
* function helps us ensure that even if we encounter the same error more than once, we only record it the first time we
* see it.
*
* Note: It will ignore primitives (always return `false` and not mark them as seen), as properties can't be set on
* them. {@link: Object.objectify} can be used on exceptions to convert any that are primitives into their equivalent
* object wrapper forms so that this check will always work. However, because we need to flag the exact object which
* will get rethrown, and because that rethrowing happens outside of the event processing pipeline, the objectification
* must be done before the exception captured.
*
* @param A thrown exception to check or flag as having been seen
* @returns `true` if the exception has already been captured, `false` if not (with the side effect of marking it seen)
*/
function checkOrSetAlreadyCaught(exception) {
	if (isAlreadyCaptured(exception)) return true;
	try {
		addNonEnumerableProperty(exception, "__sentry_captured__", true);
	} catch {}
	return false;
}
function isAlreadyCaptured(exception) {
	try {
		return exception.__sentry_captured__;
	} catch {}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/time.js
var ONE_SECOND_IN_MS = 1e3;
/**
* A partial definition of the [Performance Web API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Performance}
* for accessing a high-resolution monotonic clock.
*/
/**
* Returns a timestamp in seconds since the UNIX epoch using the Date API.
*/
function dateTimestampInSeconds() {
	return Date.now() / ONE_SECOND_IN_MS;
}
/**
* Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
* support the API.
*
* Wrapping the native API works around differences in behavior from different browsers.
*/
function createUnixTimestampInSecondsFunc() {
	const { performance } = GLOBAL_OBJ;
	if (!performance?.now || !performance.timeOrigin) return dateTimestampInSeconds;
	const timeOrigin = performance.timeOrigin;
	return () => {
		return (timeOrigin + performance.now()) / ONE_SECOND_IN_MS;
	};
}
var _cachedTimestampInSeconds;
/**
* Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
* availability of the Performance API.
*
* BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
* asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
* skew can grow to arbitrary amounts like days, weeks or months.
* See https://github.com/getsentry/sentry-javascript/issues/2590.
*/
function timestampInSeconds() {
	return (_cachedTimestampInSeconds ?? (_cachedTimestampInSeconds = createUnixTimestampInSecondsFunc()))();
}
//#endregion
//#region node_modules/@sentry/core/build/esm/session.js
/**
* Creates a new `Session` object by setting certain default parameters. If optional @param context
* is passed, the passed properties are applied to the session object.
*
* @param context (optional) additional properties to be applied to the returned session object
*
* @returns a new `Session` object
*/
function makeSession(context) {
	const startingTime = timestampInSeconds();
	const session = {
		sid: uuid4(),
		init: true,
		timestamp: startingTime,
		started: startingTime,
		duration: 0,
		status: "ok",
		errors: 0,
		ignoreDuration: false,
		toJSON: () => sessionToJSON(session)
	};
	if (context) updateSession(session, context);
	return session;
}
/**
* Updates a session object with the properties passed in the context.
*
* Note that this function mutates the passed object and returns void.
* (Had to do this instead of returning a new and updated session because closing and sending a session
* makes an update to the session after it was passed to the sending logic.
* @see Client.captureSession )
*
* @param session the `Session` to update
* @param context the `SessionContext` holding the properties that should be updated in @param session
*/
function updateSession(session, context = {}) {
	if (context.user) {
		if (!session.ipAddress && context.user.ip_address) session.ipAddress = context.user.ip_address;
		if (!session.did && !context.did) session.did = context.user.id || context.user.email || context.user.username;
	}
	session.timestamp = context.timestamp || timestampInSeconds();
	if (context.abnormal_mechanism) session.abnormal_mechanism = context.abnormal_mechanism;
	if (context.ignoreDuration) session.ignoreDuration = context.ignoreDuration;
	if (context.sid) session.sid = context.sid.length === 32 ? context.sid : uuid4();
	if (context.init !== void 0) session.init = context.init;
	if (!session.did && context.did) session.did = `${context.did}`;
	if (typeof context.started === "number") session.started = context.started;
	if (session.ignoreDuration) session.duration = void 0;
	else if (typeof context.duration === "number") session.duration = context.duration;
	else {
		const duration = session.timestamp - session.started;
		session.duration = duration >= 0 ? duration : 0;
	}
	if (context.release) session.release = context.release;
	if (context.environment) session.environment = context.environment;
	if (!session.ipAddress && context.ipAddress) session.ipAddress = context.ipAddress;
	if (!session.userAgent && context.userAgent) session.userAgent = context.userAgent;
	if (typeof context.errors === "number") session.errors = context.errors;
	if (context.status) session.status = context.status;
}
/**
* Closes a session by setting its status and updating the session object with it.
* Internally calls `updateSession` to update the passed session object.
*
* Note that this function mutates the passed session (@see updateSession for explanation).
*
* @param session the `Session` object to be closed
* @param status the `SessionStatus` with which the session was closed. If you don't pass a status,
*               this function will keep the previously set status, unless it was `'ok'` in which case
*               it is changed to `'exited'`.
*/
function closeSession(session, status) {
	let context = {};
	if (status) context = { status };
	else if (session.status === "ok") context = { status: "exited" };
	updateSession(session, context);
}
/**
* Serializes a passed session object to a JSON object with a slightly different structure.
* This is necessary because the Sentry backend requires a slightly different schema of a session
* than the one the JS SDKs use internally.
*
* @param session the session to be converted
*
* @returns a JSON object of the passed session
*/
function sessionToJSON(session) {
	return {
		sid: `${session.sid}`,
		init: session.init,
		started: (/* @__PURE__ */ new Date(session.started * 1e3)).toISOString(),
		timestamp: (/* @__PURE__ */ new Date(session.timestamp * 1e3)).toISOString(),
		status: session.status,
		errors: session.errors,
		did: typeof session.did === "number" || typeof session.did === "string" ? `${session.did}` : void 0,
		duration: session.duration,
		abnormal_mechanism: session.abnormal_mechanism,
		attrs: {
			release: session.release,
			environment: session.environment,
			ip_address: session.ipAddress,
			user_agent: session.userAgent
		}
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/merge.js
/**
* Shallow merge two objects.
* Does not mutate the passed in objects.
* Undefined/empty values in the merge object will overwrite existing values.
*
* By default, this merges 2 levels deep.
*/
function merge(initialObj, mergeObj, levels = 2) {
	if (!mergeObj || typeof mergeObj !== "object" || levels <= 0) return mergeObj;
	if (initialObj && Object.keys(mergeObj).length === 0) return initialObj;
	const output = { ...initialObj };
	for (const key in mergeObj) if (Object.prototype.hasOwnProperty.call(mergeObj, key)) output[key] = merge(output[key], mergeObj[key], levels - 1);
	return output;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/propagationContext.js
/**
* Generate a random, valid trace ID.
*/
function generateTraceId() {
	return uuid4();
}
/**
* Generate a random, valid span ID.
*/
function generateSpanId() {
	return uuid4().substring(16);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/spanOnScope.js
var SCOPE_SPAN_FIELD = "_sentrySpan";
/**
* Set the active span for a given scope.
* NOTE: This should NOT be used directly, but is only used internally by the trace methods.
*/
function _setSpanForScope(scope, span) {
	if (span) addNonEnumerableProperty(scope, SCOPE_SPAN_FIELD, span);
	else delete scope[SCOPE_SPAN_FIELD];
}
/**
* Get the active span for a given scope.
* NOTE: This should NOT be used directly, but is only used internally by the trace methods.
*/
function _getSpanForScope(scope) {
	return scope[SCOPE_SPAN_FIELD];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/scope.js
/**
* Default value for maximum number of breadcrumbs added to an event.
*/
var DEFAULT_MAX_BREADCRUMBS = 100;
/**
* A context to be used for capturing an event.
* This can either be a Scope, or a partial ScopeContext,
* or a callback that receives the current scope and returns a new scope to use.
*/
/**
* Holds additional event information.
*/
var Scope = class Scope {
	/** Flag if notifying is happening. */
	/** Callback for client to receive scope changes. */
	/** Callback list that will be called during event processing. */
	/** Array of breadcrumbs. */
	/** User */
	/** Tags */
	/** Extra */
	/** Contexts */
	/** Attachments */
	/** Propagation Context for distributed tracing */
	/**
	* A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
	* sent to Sentry
	*/
	/** Fingerprint */
	/** Severity */
	/**
	* Transaction Name
	*
	* IMPORTANT: The transaction name on the scope has nothing to do with root spans/transaction objects.
	* It's purpose is to assign a transaction to the scope that's added to non-transaction events.
	*/
	/** Session */
	/** The client on this scope */
	/** Contains the last event id of a captured event.  */
	constructor() {
		this._notifyingListeners = false;
		this._scopeListeners = [];
		this._eventProcessors = [];
		this._breadcrumbs = [];
		this._attachments = [];
		this._user = {};
		this._tags = {};
		this._extra = {};
		this._contexts = {};
		this._sdkProcessingMetadata = {};
		this._propagationContext = {
			traceId: generateTraceId(),
			sampleRand: Math.random()
		};
	}
	/**
	* Clone all data from this scope into a new scope.
	*/
	clone() {
		const newScope = new Scope();
		newScope._breadcrumbs = [...this._breadcrumbs];
		newScope._tags = { ...this._tags };
		newScope._extra = { ...this._extra };
		newScope._contexts = { ...this._contexts };
		if (this._contexts.flags) newScope._contexts.flags = { values: [...this._contexts.flags.values] };
		newScope._user = this._user;
		newScope._level = this._level;
		newScope._session = this._session;
		newScope._transactionName = this._transactionName;
		newScope._fingerprint = this._fingerprint;
		newScope._eventProcessors = [...this._eventProcessors];
		newScope._attachments = [...this._attachments];
		newScope._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
		newScope._propagationContext = { ...this._propagationContext };
		newScope._client = this._client;
		newScope._lastEventId = this._lastEventId;
		_setSpanForScope(newScope, _getSpanForScope(this));
		return newScope;
	}
	/**
	* Update the client assigned to this scope.
	* Note that not every scope will have a client assigned - isolation scopes & the global scope will generally not have a client,
	* as well as manually created scopes.
	*/
	setClient(client) {
		this._client = client;
	}
	/**
	* Set the ID of the last captured error event.
	* This is generally only captured on the isolation scope.
	*/
	setLastEventId(lastEventId) {
		this._lastEventId = lastEventId;
	}
	/**
	* Get the client assigned to this scope.
	*/
	getClient() {
		return this._client;
	}
	/**
	* Get the ID of the last captured error event.
	* This is generally only available on the isolation scope.
	*/
	lastEventId() {
		return this._lastEventId;
	}
	/**
	* @inheritDoc
	*/
	addScopeListener(callback) {
		this._scopeListeners.push(callback);
	}
	/**
	* Add an event processor that will be called before an event is sent.
	*/
	addEventProcessor(callback) {
		this._eventProcessors.push(callback);
		return this;
	}
	/**
	* Set the user for this scope.
	* Set to `null` to unset the user.
	*/
	setUser(user) {
		this._user = user || {
			email: void 0,
			id: void 0,
			ip_address: void 0,
			username: void 0
		};
		if (this._session) updateSession(this._session, { user });
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Get the user from this scope.
	*/
	getUser() {
		return this._user;
	}
	/**
	* Set an object that will be merged into existing tags on the scope,
	* and will be sent as tags data with the event.
	*/
	setTags(tags) {
		this._tags = {
			...this._tags,
			...tags
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Set a single tag that will be sent as tags data with the event.
	*/
	setTag(key, value) {
		this._tags = {
			...this._tags,
			[key]: value
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Set an object that will be merged into existing extra on the scope,
	* and will be sent as extra data with the event.
	*/
	setExtras(extras) {
		this._extra = {
			...this._extra,
			...extras
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Set a single key:value extra entry that will be sent as extra data with the event.
	*/
	setExtra(key, extra) {
		this._extra = {
			...this._extra,
			[key]: extra
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets the fingerprint on the scope to send with the events.
	* @param {string[]} fingerprint Fingerprint to group events in Sentry.
	*/
	setFingerprint(fingerprint) {
		this._fingerprint = fingerprint;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets the level on the scope for future events.
	*/
	setLevel(level) {
		this._level = level;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets the transaction name on the scope so that the name of e.g. taken server route or
	* the page location is attached to future events.
	*
	* IMPORTANT: Calling this function does NOT change the name of the currently active
	* root span. If you want to change the name of the active root span, use
	* `Sentry.updateSpanName(rootSpan, 'new name')` instead.
	*
	* By default, the SDK updates the scope's transaction name automatically on sensible
	* occasions, such as a page navigation or when handling a new request on the server.
	*/
	setTransactionName(name) {
		this._transactionName = name;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets context data with the given name.
	* Data passed as context will be normalized. You can also pass `null` to unset the context.
	* Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
	*/
	setContext(key, context) {
		if (context === null) delete this._contexts[key];
		else this._contexts[key] = context;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Set the session for the scope.
	*/
	setSession(session) {
		if (!session) delete this._session;
		else this._session = session;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Get the session from the scope.
	*/
	getSession() {
		return this._session;
	}
	/**
	* Updates the scope with provided data. Can work in three variations:
	* - plain object containing updatable attributes
	* - Scope instance that'll extract the attributes from
	* - callback function that'll receive the current scope as an argument and allow for modifications
	*/
	update(captureContext) {
		if (!captureContext) return this;
		const scopeToMerge = typeof captureContext === "function" ? captureContext(this) : captureContext;
		const { tags, extra, user, contexts, level, fingerprint = [], propagationContext } = (scopeToMerge instanceof Scope ? scopeToMerge.getScopeData() : isPlainObject(scopeToMerge) ? captureContext : void 0) || {};
		this._tags = {
			...this._tags,
			...tags
		};
		this._extra = {
			...this._extra,
			...extra
		};
		this._contexts = {
			...this._contexts,
			...contexts
		};
		if (user && Object.keys(user).length) this._user = user;
		if (level) this._level = level;
		if (fingerprint.length) this._fingerprint = fingerprint;
		if (propagationContext) this._propagationContext = propagationContext;
		return this;
	}
	/**
	* Clears the current scope and resets its properties.
	* Note: The client will not be cleared.
	*/
	clear() {
		this._breadcrumbs = [];
		this._tags = {};
		this._extra = {};
		this._user = {};
		this._contexts = {};
		this._level = void 0;
		this._transactionName = void 0;
		this._fingerprint = void 0;
		this._session = void 0;
		_setSpanForScope(this, void 0);
		this._attachments = [];
		this.setPropagationContext({
			traceId: generateTraceId(),
			sampleRand: Math.random()
		});
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Adds a breadcrumb to the scope.
	* By default, the last 100 breadcrumbs are kept.
	*/
	addBreadcrumb(breadcrumb, maxBreadcrumbs) {
		const maxCrumbs = typeof maxBreadcrumbs === "number" ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
		if (maxCrumbs <= 0) return this;
		const mergedBreadcrumb = {
			timestamp: dateTimestampInSeconds(),
			...breadcrumb,
			message: breadcrumb.message ? truncate(breadcrumb.message, 2048) : breadcrumb.message
		};
		this._breadcrumbs.push(mergedBreadcrumb);
		if (this._breadcrumbs.length > maxCrumbs) {
			this._breadcrumbs = this._breadcrumbs.slice(-maxCrumbs);
			this._client?.recordDroppedEvent("buffer_overflow", "log_item");
		}
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Get the last breadcrumb of the scope.
	*/
	getLastBreadcrumb() {
		return this._breadcrumbs[this._breadcrumbs.length - 1];
	}
	/**
	* Clear all breadcrumbs from the scope.
	*/
	clearBreadcrumbs() {
		this._breadcrumbs = [];
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Add an attachment to the scope.
	*/
	addAttachment(attachment) {
		this._attachments.push(attachment);
		return this;
	}
	/**
	* Clear all attachments from the scope.
	*/
	clearAttachments() {
		this._attachments = [];
		return this;
	}
	/**
	* Get the data of this scope, which should be applied to an event during processing.
	*/
	getScopeData() {
		return {
			breadcrumbs: this._breadcrumbs,
			attachments: this._attachments,
			contexts: this._contexts,
			tags: this._tags,
			extra: this._extra,
			user: this._user,
			level: this._level,
			fingerprint: this._fingerprint || [],
			eventProcessors: this._eventProcessors,
			propagationContext: this._propagationContext,
			sdkProcessingMetadata: this._sdkProcessingMetadata,
			transactionName: this._transactionName,
			span: _getSpanForScope(this)
		};
	}
	/**
	* Add data which will be accessible during event processing but won't get sent to Sentry.
	*/
	setSDKProcessingMetadata(newData) {
		this._sdkProcessingMetadata = merge(this._sdkProcessingMetadata, newData, 2);
		return this;
	}
	/**
	* Add propagation context to the scope, used for distributed tracing
	*/
	setPropagationContext(context) {
		this._propagationContext = context;
		return this;
	}
	/**
	* Get propagation context from the scope, used for distributed tracing
	*/
	getPropagationContext() {
		return this._propagationContext;
	}
	/**
	* Capture an exception for this scope.
	*
	* @returns {string} The id of the captured Sentry event.
	*/
	captureException(exception, hint) {
		const eventId = hint?.event_id || uuid4();
		if (!this._client) {
			DEBUG_BUILD && debug.warn("No client configured on scope - will not capture exception!");
			return eventId;
		}
		const syntheticException = /* @__PURE__ */ new Error("Sentry syntheticException");
		this._client.captureException(exception, {
			originalException: exception,
			syntheticException,
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* Capture a message for this scope.
	*
	* @returns {string} The id of the captured message.
	*/
	captureMessage(message, level, hint) {
		const eventId = hint?.event_id || uuid4();
		if (!this._client) {
			DEBUG_BUILD && debug.warn("No client configured on scope - will not capture message!");
			return eventId;
		}
		const syntheticException = new Error(message);
		this._client.captureMessage(message, level, {
			originalException: message,
			syntheticException,
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* Capture a Sentry event for this scope.
	*
	* @returns {string} The id of the captured event.
	*/
	captureEvent(event, hint) {
		const eventId = hint?.event_id || uuid4();
		if (!this._client) {
			DEBUG_BUILD && debug.warn("No client configured on scope - will not capture event!");
			return eventId;
		}
		this._client.captureEvent(event, {
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* This will be called on every set call.
	*/
	_notifyScopeListeners() {
		if (!this._notifyingListeners) {
			this._notifyingListeners = true;
			this._scopeListeners.forEach((callback) => {
				callback(this);
			});
			this._notifyingListeners = false;
		}
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/defaultScopes.js
/** Get the default current scope. */
function getDefaultCurrentScope() {
	return getGlobalSingleton("defaultCurrentScope", () => new Scope());
}
/** Get the default isolation scope. */
function getDefaultIsolationScope() {
	return getGlobalSingleton("defaultIsolationScope", () => new Scope());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/asyncContext/stackStrategy.js
/**
* This is an object that holds a stack of scopes.
*/
var AsyncContextStack = class {
	constructor(scope, isolationScope) {
		let assignedScope;
		if (!scope) assignedScope = new Scope();
		else assignedScope = scope;
		let assignedIsolationScope;
		if (!isolationScope) assignedIsolationScope = new Scope();
		else assignedIsolationScope = isolationScope;
		this._stack = [{ scope: assignedScope }];
		this._isolationScope = assignedIsolationScope;
	}
	/**
	* Fork a scope for the stack.
	*/
	withScope(callback) {
		const scope = this._pushScope();
		let maybePromiseResult;
		try {
			maybePromiseResult = callback(scope);
		} catch (e) {
			this._popScope();
			throw e;
		}
		if (isThenable(maybePromiseResult)) return maybePromiseResult.then((res) => {
			this._popScope();
			return res;
		}, (e) => {
			this._popScope();
			throw e;
		});
		this._popScope();
		return maybePromiseResult;
	}
	/**
	* Get the client of the stack.
	*/
	getClient() {
		return this.getStackTop().client;
	}
	/**
	* Returns the scope of the top stack.
	*/
	getScope() {
		return this.getStackTop().scope;
	}
	/**
	* Get the isolation scope for the stack.
	*/
	getIsolationScope() {
		return this._isolationScope;
	}
	/**
	* Returns the topmost scope layer in the order domain > local > process.
	*/
	getStackTop() {
		return this._stack[this._stack.length - 1];
	}
	/**
	* Push a scope to the stack.
	*/
	_pushScope() {
		const scope = this.getScope().clone();
		this._stack.push({
			client: this.getClient(),
			scope
		});
		return scope;
	}
	/**
	* Pop a scope from the stack.
	*/
	_popScope() {
		if (this._stack.length <= 1) return false;
		return !!this._stack.pop();
	}
};
/**
* Get the global async context stack.
* This will be removed during the v8 cycle and is only here to make migration easier.
*/
function getAsyncContextStack() {
	const sentry = getSentryCarrier(getMainCarrier());
	return sentry.stack = sentry.stack || new AsyncContextStack(getDefaultCurrentScope(), getDefaultIsolationScope());
}
function withScope$1(callback) {
	return getAsyncContextStack().withScope(callback);
}
function withSetScope(scope, callback) {
	const stack = getAsyncContextStack();
	return stack.withScope(() => {
		stack.getStackTop().scope = scope;
		return callback(scope);
	});
}
function withIsolationScope$1(callback) {
	return getAsyncContextStack().withScope(() => {
		return callback(getAsyncContextStack().getIsolationScope());
	});
}
/**
* Get the stack-based async context strategy.
*/
function getStackAsyncContextStrategy() {
	return {
		withIsolationScope: withIsolationScope$1,
		withScope: withScope$1,
		withSetScope,
		withSetIsolationScope: (_isolationScope, callback) => {
			return withIsolationScope$1(callback);
		},
		getCurrentScope: () => getAsyncContextStack().getScope(),
		getIsolationScope: () => getAsyncContextStack().getIsolationScope()
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/asyncContext/index.js
/**
* @private Private API with no semver guarantees!
*
* Sets the global async context strategy
*/
function setAsyncContextStrategy(strategy) {
	const sentry = getSentryCarrier(getMainCarrier());
	sentry.acs = strategy;
}
/**
* Get the current async context strategy.
* If none has been setup, the default will be used.
*/
function getAsyncContextStrategy(carrier) {
	const sentry = getSentryCarrier(carrier);
	if (sentry.acs) return sentry.acs;
	return getStackAsyncContextStrategy();
}
//#endregion
//#region node_modules/@sentry/core/build/esm/currentScopes.js
/**
* Get the currently active scope.
*/
function getCurrentScope() {
	return getAsyncContextStrategy(getMainCarrier()).getCurrentScope();
}
/**
* Get the currently active isolation scope.
* The isolation scope is active for the current execution context.
*/
function getIsolationScope() {
	return getAsyncContextStrategy(getMainCarrier()).getIsolationScope();
}
/**
* Get the global scope.
* This scope is applied to _all_ events.
*/
function getGlobalScope() {
	return getGlobalSingleton("globalScope", () => new Scope());
}
/**
* Creates a new scope with and executes the given operation within.
* The scope is automatically removed once the operation
* finishes or throws.
*/
/**
* Either creates a new active scope, or sets the given scope as active scope in the given callback.
*/
function withScope(...rest) {
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (rest.length === 2) {
		const [scope, callback] = rest;
		if (!scope) return acs.withScope(callback);
		return acs.withSetScope(scope, callback);
	}
	return acs.withScope(rest[0]);
}
/**
* Attempts to fork the current isolation scope and the current scope based on the current async context strategy. If no
* async context strategy is set, the isolation scope and the current scope will not be forked (this is currently the
* case, for example, in the browser).
*
* Usage of this function in environments without async context strategy is discouraged and may lead to unexpected behaviour.
*
* This function is intended for Sentry SDK and SDK integration development. It is not recommended to be used in "normal"
* applications directly because it comes with pitfalls. Use at your own risk!
*/
/**
* Either creates a new active isolation scope, or sets the given isolation scope as active scope in the given callback.
*/
function withIsolationScope(...rest) {
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (rest.length === 2) {
		const [isolationScope, callback] = rest;
		if (!isolationScope) return acs.withIsolationScope(callback);
		return acs.withSetIsolationScope(isolationScope, callback);
	}
	return acs.withIsolationScope(rest[0]);
}
/**
* Get the currently active client.
*/
function getClient() {
	return getCurrentScope().getClient();
}
/**
* Get a trace context for the given scope.
*/
function getTraceContextFromScope(scope) {
	const { traceId, parentSpanId, propagationSpanId } = scope.getPropagationContext();
	const traceContext = {
		trace_id: traceId,
		span_id: propagationSpanId || generateSpanId()
	};
	if (parentSpanId) traceContext.parent_span_id = parentSpanId;
	return traceContext;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/semanticAttributes.js
/**
* Use this attribute to represent the source of a span.
* Should be one of: custom, url, route, view, component, task, unknown
*
*/
var SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = "sentry.source";
/**
* Attributes that holds the sample rate that was locally applied to a span.
* If this attribute is not defined, it means that the span inherited a sampling decision.
*
* NOTE: Is only defined on root spans.
*/
var SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = "sentry.sample_rate";
/**
* Use this attribute to represent the operation of a span.
*/
var SEMANTIC_ATTRIBUTE_SENTRY_OP = "sentry.op";
/**
* Use this attribute to represent the origin of a span.
*/
var SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = "sentry.origin";
/** The unit of a measurement, which may be stored as a TimedEvent. */
var SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = "sentry.measurement_unit";
/** The value of a measurement, which may be stored as a TimedEvent. */
var SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = "sentry.measurement_value";
/**
* A custom span name set by users guaranteed to be taken over any automatically
* inferred name. This attribute is removed before the span is sent.
*
* @internal only meant for internal SDK usage
* @hidden
*/
var SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME = "sentry.custom_span_name";
/**
* The id of the profile that this span occurred in.
*/
var SEMANTIC_ATTRIBUTE_PROFILE_ID = "sentry.profile_id";
var SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = "sentry.exclusive_time";
var SEMANTIC_ATTRIBUTE_CACHE_HIT = "cache.hit";
var SEMANTIC_ATTRIBUTE_CACHE_KEY = "cache.key";
var SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE = "cache.item_size";
/**
* Converts a HTTP status code into a sentry status with a message.
*
* @param httpStatus The HTTP response status code.
* @returns The span status or unknown_error.
*/
function getSpanStatusFromHttpCode(httpStatus) {
	if (httpStatus < 400 && httpStatus >= 100) return { code: 1 };
	if (httpStatus >= 400 && httpStatus < 500) switch (httpStatus) {
		case 401: return {
			code: 2,
			message: "unauthenticated"
		};
		case 403: return {
			code: 2,
			message: "permission_denied"
		};
		case 404: return {
			code: 2,
			message: "not_found"
		};
		case 409: return {
			code: 2,
			message: "already_exists"
		};
		case 413: return {
			code: 2,
			message: "failed_precondition"
		};
		case 429: return {
			code: 2,
			message: "resource_exhausted"
		};
		case 499: return {
			code: 2,
			message: "cancelled"
		};
		default: return {
			code: 2,
			message: "invalid_argument"
		};
	}
	if (httpStatus >= 500 && httpStatus < 600) switch (httpStatus) {
		case 501: return {
			code: 2,
			message: "unimplemented"
		};
		case 503: return {
			code: 2,
			message: "unavailable"
		};
		case 504: return {
			code: 2,
			message: "deadline_exceeded"
		};
		default: return {
			code: 2,
			message: "internal_error"
		};
	}
	return {
		code: 2,
		message: "unknown_error"
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/utils.js
var SCOPE_ON_START_SPAN_FIELD = "_sentryScope";
var ISOLATION_SCOPE_ON_START_SPAN_FIELD = "_sentryIsolationScope";
/** Store the scope & isolation scope for a span, which can the be used when it is finished. */
function setCapturedScopesOnSpan(span, scope, isolationScope) {
	if (span) {
		addNonEnumerableProperty(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, isolationScope);
		addNonEnumerableProperty(span, SCOPE_ON_START_SPAN_FIELD, scope);
	}
}
/**
* Grabs the scope and isolation scope off a span that were active when the span was started.
*/
function getCapturedScopesOnSpan(span) {
	return {
		scope: span[SCOPE_ON_START_SPAN_FIELD],
		isolationScope: span[ISOLATION_SCOPE_ON_START_SPAN_FIELD]
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/baggage.js
var SENTRY_BAGGAGE_KEY_PREFIX = "sentry-";
var SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
/**
* Takes a baggage header and turns it into Dynamic Sampling Context, by extracting all the "sentry-" prefixed values
* from it.
*
* @param baggageHeader A very bread definition of a baggage header as it might appear in various frameworks.
* @returns The Dynamic Sampling Context that was found on `baggageHeader`, if there was any, `undefined` otherwise.
*/
function baggageHeaderToDynamicSamplingContext(baggageHeader) {
	const baggageObject = parseBaggageHeader(baggageHeader);
	if (!baggageObject) return;
	const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => {
		if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
			const nonPrefixedKey = key.slice(7);
			acc[nonPrefixedKey] = value;
		}
		return acc;
	}, {});
	if (Object.keys(dynamicSamplingContext).length > 0) return dynamicSamplingContext;
	else return;
}
/**
* Turns a Dynamic Sampling Object into a baggage header by prefixing all the keys on the object with "sentry-".
*
* @param dynamicSamplingContext The Dynamic Sampling Context to turn into a header. For convenience and compatibility
* with the `getDynamicSamplingContext` method on the Transaction class ,this argument can also be `undefined`. If it is
* `undefined` the function will return `undefined`.
* @returns a baggage header, created from `dynamicSamplingContext`, or `undefined` either if `dynamicSamplingContext`
* was `undefined`, or if `dynamicSamplingContext` didn't contain any values.
*/
function dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext) {
	if (!dynamicSamplingContext) return;
	return objectToBaggageHeader(Object.entries(dynamicSamplingContext).reduce((acc, [dscKey, dscValue]) => {
		if (dscValue) acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
		return acc;
	}, {}));
}
/**
* Take a baggage header and parse it into an object.
*/
function parseBaggageHeader(baggageHeader) {
	if (!baggageHeader || !isString(baggageHeader) && !Array.isArray(baggageHeader)) return;
	if (Array.isArray(baggageHeader)) return baggageHeader.reduce((acc, curr) => {
		const currBaggageObject = baggageHeaderToObject(curr);
		Object.entries(currBaggageObject).forEach(([key, value]) => {
			acc[key] = value;
		});
		return acc;
	}, {});
	return baggageHeaderToObject(baggageHeader);
}
/**
* Will parse a baggage header, which is a simple key-value map, into a flat object.
*
* @param baggageHeader The baggage header to parse.
* @returns a flat object containing all the key-value pairs from `baggageHeader`.
*/
function baggageHeaderToObject(baggageHeader) {
	return baggageHeader.split(",").map((baggageEntry) => baggageEntry.split("=").map((keyOrValue) => {
		try {
			return decodeURIComponent(keyOrValue.trim());
		} catch {
			return;
		}
	})).reduce((acc, [key, value]) => {
		if (key && value) acc[key] = value;
		return acc;
	}, {});
}
/**
* Turns a flat object (key-value pairs) into a baggage header, which is also just key-value pairs.
*
* @param object The object to turn into a baggage header.
* @returns a baggage header string, or `undefined` if the object didn't have any values, since an empty baggage header
* is not spec compliant.
*/
function objectToBaggageHeader(object) {
	if (Object.keys(object).length === 0) return;
	return Object.entries(object).reduce((baggageHeader, [objectKey, objectValue], currentIndex) => {
		const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
		const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
		if (newBaggageHeader.length > 8192) {
			DEBUG_BUILD && debug.warn(`Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`);
			return baggageHeader;
		} else return newBaggageHeader;
	}, "");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/parseSampleRate.js
/**
* Parse a sample rate from a given value.
* This will either return a boolean or number sample rate, if the sample rate is valid (between 0 and 1).
* If a string is passed, we try to convert it to a number.
*
* Any invalid sample rate will return `undefined`.
*/
function parseSampleRate(sampleRate) {
	if (typeof sampleRate === "boolean") return Number(sampleRate);
	const rate = typeof sampleRate === "string" ? parseFloat(sampleRate) : sampleRate;
	if (typeof rate !== "number" || isNaN(rate) || rate < 0 || rate > 1) return;
	return rate;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/tracing.js
var TRACEPARENT_REGEXP = /* @__PURE__ */ new RegExp("^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$");
/**
* Extract transaction context data from a `sentry-trace` header.
*
* @param traceparent Traceparent string
*
* @returns Object containing data from the header, or undefined if traceparent string is malformed
*/
function extractTraceparentData(traceparent) {
	if (!traceparent) return;
	const matches = traceparent.match(TRACEPARENT_REGEXP);
	if (!matches) return;
	let parentSampled;
	if (matches[3] === "1") parentSampled = true;
	else if (matches[3] === "0") parentSampled = false;
	return {
		traceId: matches[1],
		parentSampled,
		parentSpanId: matches[2]
	};
}
/**
* Create a propagation context from incoming headers or
* creates a minimal new one if the headers are undefined.
*/
function propagationContextFromHeaders(sentryTrace, baggage) {
	const traceparentData = extractTraceparentData(sentryTrace);
	const dynamicSamplingContext = baggageHeaderToDynamicSamplingContext(baggage);
	if (!traceparentData?.traceId) return {
		traceId: generateTraceId(),
		sampleRand: Math.random()
	};
	const sampleRand = getSampleRandFromTraceparentAndDsc(traceparentData, dynamicSamplingContext);
	if (dynamicSamplingContext) dynamicSamplingContext.sample_rand = sampleRand.toString();
	const { traceId, parentSpanId, parentSampled } = traceparentData;
	return {
		traceId,
		parentSpanId,
		sampled: parentSampled,
		dsc: dynamicSamplingContext || {},
		sampleRand
	};
}
/**
* Create sentry-trace header from span context values.
*/
function generateSentryTraceHeader(traceId = generateTraceId(), spanId = generateSpanId(), sampled) {
	let sampledString = "";
	if (sampled !== void 0) sampledString = sampled ? "-1" : "-0";
	return `${traceId}-${spanId}${sampledString}`;
}
/**
* Given any combination of an incoming trace, generate a sample rand based on its defined semantics.
*
* Read more: https://develop.sentry.dev/sdk/telemetry/traces/#propagated-random-value
*/
function getSampleRandFromTraceparentAndDsc(traceparentData, dsc) {
	const parsedSampleRand = parseSampleRate(dsc?.sample_rand);
	if (parsedSampleRand !== void 0) return parsedSampleRand;
	const parsedSampleRate = parseSampleRate(dsc?.sample_rate);
	if (parsedSampleRate && traceparentData?.parentSampled !== void 0) return traceparentData.parentSampled ? Math.random() * parsedSampleRate : parsedSampleRate + Math.random() * (1 - parsedSampleRate);
	else return Math.random();
}
var hasShownSpanDropWarning = false;
/**
* Convert a span to a trace context, which can be sent as the `trace` context in an event.
* By default, this will only include trace_id, span_id & parent_span_id.
* If `includeAllData` is true, it will also include data, op, status & origin.
*/
function spanToTransactionTraceContext(span) {
	const { spanId: span_id, traceId: trace_id } = span.spanContext();
	const { data, op, parent_span_id, status, origin, links } = spanToJSON(span);
	return {
		parent_span_id,
		span_id,
		trace_id,
		data,
		op,
		status,
		origin,
		links
	};
}
/**
* Convert a span to a trace context, which can be sent as the `trace` context in a non-transaction event.
*/
function spanToTraceContext(span) {
	const { spanId, traceId: trace_id, isRemote } = span.spanContext();
	const parent_span_id = isRemote ? spanId : spanToJSON(span).parent_span_id;
	const scope = getCapturedScopesOnSpan(span).scope;
	return {
		parent_span_id,
		span_id: isRemote ? scope?.getPropagationContext().propagationSpanId || generateSpanId() : spanId,
		trace_id
	};
}
/**
* Convert a Span to a Sentry trace header.
*/
function spanToTraceHeader(span) {
	const { traceId, spanId } = span.spanContext();
	return generateSentryTraceHeader(traceId, spanId, spanIsSampled(span));
}
/**
*  Converts the span links array to a flattened version to be sent within an envelope.
*
*  If the links array is empty, it returns `undefined` so the empty value can be dropped before it's sent.
*/
function convertSpanLinksForEnvelope(links) {
	if (links && links.length > 0) return links.map(({ context: { spanId, traceId, traceFlags, ...restContext }, attributes }) => ({
		span_id: spanId,
		trace_id: traceId,
		sampled: traceFlags === 1,
		attributes,
		...restContext
	}));
	else return;
}
/**
* Convert a span time input into a timestamp in seconds.
*/
function spanTimeInputToSeconds(input) {
	if (typeof input === "number") return ensureTimestampInSeconds(input);
	if (Array.isArray(input)) return input[0] + input[1] / 1e9;
	if (input instanceof Date) return ensureTimestampInSeconds(input.getTime());
	return timestampInSeconds();
}
/**
* Converts a timestamp to second, if it was in milliseconds, or keeps it as second.
*/
function ensureTimestampInSeconds(timestamp) {
	return timestamp > 9999999999 ? timestamp / 1e3 : timestamp;
}
/**
* Convert a span to a JSON representation.
*/
function spanToJSON(span) {
	if (spanIsSentrySpan(span)) return span.getSpanJSON();
	const { spanId: span_id, traceId: trace_id } = span.spanContext();
	if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
		const { attributes, startTime, name, endTime, status, links } = span;
		return {
			span_id,
			trace_id,
			data: attributes,
			description: name,
			parent_span_id: "parentSpanId" in span ? span.parentSpanId : "parentSpanContext" in span ? span.parentSpanContext?.spanId : void 0,
			start_timestamp: spanTimeInputToSeconds(startTime),
			timestamp: spanTimeInputToSeconds(endTime) || void 0,
			status: getStatusMessage(status),
			op: attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
			origin: attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
			links: convertSpanLinksForEnvelope(links)
		};
	}
	return {
		span_id,
		trace_id,
		start_timestamp: 0,
		data: {}
	};
}
function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
	const castSpan = span;
	return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
}
/** Exported only for tests. */
/**
* Sadly, due to circular dependency checks we cannot actually import the Span class here and check for instanceof.
* :( So instead we approximate this by checking if it has the `getSpanJSON` method.
*/
function spanIsSentrySpan(span) {
	return typeof span.getSpanJSON === "function";
}
/**
* Returns true if a span is sampled.
* In most cases, you should just use `span.isRecording()` instead.
* However, this has a slightly different semantic, as it also returns false if the span is finished.
* So in the case where this distinction is important, use this method.
*/
function spanIsSampled(span) {
	const { traceFlags } = span.spanContext();
	return traceFlags === 1;
}
/** Get the status message to use for a JSON representation of a span. */
function getStatusMessage(status) {
	if (!status || status.code === 0) return;
	if (status.code === 1) return "ok";
	return status.message || "unknown_error";
}
var CHILD_SPANS_FIELD = "_sentryChildSpans";
var ROOT_SPAN_FIELD = "_sentryRootSpan";
/**
* Adds an opaque child span reference to a span.
*/
function addChildSpanToSpan(span, childSpan) {
	addNonEnumerableProperty(childSpan, ROOT_SPAN_FIELD, span[ROOT_SPAN_FIELD] || span);
	if (span[CHILD_SPANS_FIELD]) span[CHILD_SPANS_FIELD].add(childSpan);
	else addNonEnumerableProperty(span, CHILD_SPANS_FIELD, /* @__PURE__ */ new Set([childSpan]));
}
/**
* Returns an array of the given span and all of its descendants.
*/
function getSpanDescendants(span) {
	const resultSet = /* @__PURE__ */ new Set();
	function addSpanChildren(span) {
		if (resultSet.has(span)) return;
		else if (spanIsSampled(span)) {
			resultSet.add(span);
			const childSpans = span[CHILD_SPANS_FIELD] ? Array.from(span[CHILD_SPANS_FIELD]) : [];
			for (const childSpan of childSpans) addSpanChildren(childSpan);
		}
	}
	addSpanChildren(span);
	return Array.from(resultSet);
}
/**
* Returns the root span of a given span.
*/
function getRootSpan(span) {
	return span[ROOT_SPAN_FIELD] || span;
}
/**
* Returns the currently active span.
*/
function getActiveSpan() {
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (acs.getActiveSpan) return acs.getActiveSpan();
	return _getSpanForScope(getCurrentScope());
}
/**
* Logs a warning once if `beforeSendSpan` is used to drop spans.
*/
function showSpanDropWarning() {
	if (!hasShownSpanDropWarning) {
		consoleSandbox(() => {
			console.warn("[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly.");
		});
		hasShownSpanDropWarning = true;
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/errors.js
var errorsInstrumented = false;
/**
* Ensure that global errors automatically set the active span status.
*/
function registerSpanErrorInstrumentation() {
	if (errorsInstrumented) return;
	/**
	* If an error or unhandled promise occurs, we mark the active root span as failed
	*/
	function errorCallback() {
		const activeSpan = getActiveSpan();
		const rootSpan = activeSpan && getRootSpan(activeSpan);
		if (rootSpan) {
			const message = "internal_error";
			DEBUG_BUILD && debug.log(`[Tracing] Root span: ${message} -> Global error occurred`);
			rootSpan.setStatus({
				code: 2,
				message
			});
		}
	}
	errorCallback.tag = "sentry_tracingErrorCallback";
	errorsInstrumented = true;
	addGlobalErrorInstrumentationHandler(errorCallback);
	addGlobalUnhandledRejectionInstrumentationHandler(errorCallback);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js
/**
* Determines if span recording is currently enabled.
*
* Spans are recorded when at least one of `tracesSampleRate` and `tracesSampler`
* is defined in the SDK config. This function does not make any assumption about
* sampling decisions, it only checks if the SDK is configured to record spans.
*
* Important: This function only determines if span recording is enabled. Trace
* continuation and propagation is separately controlled and not covered by this function.
* If this function returns `false`, traces can still be propagated (which is what
* we refer to by "Tracing without Performance")
* @see https://develop.sentry.dev/sdk/telemetry/traces/tracing-without-performance/
*
* @param maybeOptions An SDK options object to be passed to this function.
* If this option is not provided, the function will use the current client's options.
*/
function hasSpansEnabled(maybeOptions) {
	if (typeof __SENTRY_TRACING__ === "boolean" && !__SENTRY_TRACING__) return false;
	const options = maybeOptions || getClient()?.getOptions();
	return !!options && (options.tracesSampleRate != null || !!options.tracesSampler);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/constants.js
var DEFAULT_ENVIRONMENT = "production";
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/dsn.js
/** Regular expression used to extract org ID from a DSN host. */
var ORG_ID_REGEX = /^o(\d+)\./;
/** Regular expression used to parse a Dsn. */
var DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function isValidProtocol(protocol) {
	return protocol === "http" || protocol === "https";
}
/**
* Renders the string representation of this Dsn.
*
* By default, this will render the public representation without the password
* component. To get the deprecated private representation, set `withPassword`
* to true.
*
* @param withPassword When set to true, the password will be included.
*/
function dsnToString(dsn, withPassword = false) {
	const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
	return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ""}@${host}${port ? `:${port}` : ""}/${path ? `${path}/` : path}${projectId}`;
}
/**
* Parses a Dsn from a given string.
*
* @param str A Dsn as string
* @returns Dsn as DsnComponents or undefined if @param str is not a valid DSN string
*/
function dsnFromString(str) {
	const match = DSN_REGEX.exec(str);
	if (!match) {
		consoleSandbox(() => {
			console.error(`Invalid Sentry Dsn: ${str}`);
		});
		return;
	}
	const [protocol, publicKey, pass = "", host = "", port = "", lastPath = ""] = match.slice(1);
	let path = "";
	let projectId = lastPath;
	const split = projectId.split("/");
	if (split.length > 1) {
		path = split.slice(0, -1).join("/");
		projectId = split.pop();
	}
	if (projectId) {
		const projectMatch = projectId.match(/^\d+/);
		if (projectMatch) projectId = projectMatch[0];
	}
	return dsnFromComponents({
		host,
		pass,
		path,
		projectId,
		port,
		protocol,
		publicKey
	});
}
function dsnFromComponents(components) {
	return {
		protocol: components.protocol,
		publicKey: components.publicKey || "",
		pass: components.pass || "",
		host: components.host,
		port: components.port || "",
		path: components.path || "",
		projectId: components.projectId
	};
}
function validateDsn(dsn) {
	if (!DEBUG_BUILD) return true;
	const { port, projectId, protocol } = dsn;
	if ([
		"protocol",
		"publicKey",
		"host",
		"projectId"
	].find((component) => {
		if (!dsn[component]) {
			debug.error(`Invalid Sentry Dsn: ${component} missing`);
			return true;
		}
		return false;
	})) return false;
	if (!projectId.match(/^\d+$/)) {
		debug.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
		return false;
	}
	if (!isValidProtocol(protocol)) {
		debug.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
		return false;
	}
	if (port && isNaN(parseInt(port, 10))) {
		debug.error(`Invalid Sentry Dsn: Invalid port ${port}`);
		return false;
	}
	return true;
}
/**
* Extract the org ID from a DSN host.
*
* @param host The host from a DSN
* @returns The org ID if found, undefined otherwise
*/
function extractOrgIdFromDsnHost(host) {
	return host.match(ORG_ID_REGEX)?.[1];
}
/**
* Creates a valid Sentry Dsn object, identifying a Sentry instance and project.
* @returns a valid DsnComponents object or `undefined` if @param from is an invalid DSN source
*/
function makeDsn(from) {
	const components = typeof from === "string" ? dsnFromString(from) : dsnFromComponents(from);
	if (!components || !validateDsn(components)) return;
	return components;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js
/**
* If you change this value, also update the terser plugin config to
* avoid minification of the object property!
*/
var FROZEN_DSC_FIELD = "_frozenDsc";
/**
* Freeze the given DSC on the given span.
*/
function freezeDscOnSpan(span, dsc) {
	addNonEnumerableProperty(span, FROZEN_DSC_FIELD, dsc);
}
/**
* Creates a dynamic sampling context from a client.
*
* Dispatches the `createDsc` lifecycle hook as a side effect.
*/
function getDynamicSamplingContextFromClient(trace_id, client) {
	const options = client.getOptions();
	const { publicKey: public_key, host } = client.getDsn() || {};
	let org_id;
	if (options.orgId) org_id = String(options.orgId);
	else if (host) org_id = extractOrgIdFromDsnHost(host);
	const dsc = {
		environment: options.environment || "production",
		release: options.release,
		public_key,
		trace_id,
		org_id
	};
	client.emit("createDsc", dsc);
	return dsc;
}
/**
* Get the dynamic sampling context for the currently active scopes.
*/
function getDynamicSamplingContextFromScope(client, scope) {
	const propagationContext = scope.getPropagationContext();
	return propagationContext.dsc || getDynamicSamplingContextFromClient(propagationContext.traceId, client);
}
/**
* Creates a dynamic sampling context from a span (and client and scope)
*
* @param span the span from which a few values like the root span name and sample rate are extracted.
*
* @returns a dynamic sampling context
*/
function getDynamicSamplingContextFromSpan(span) {
	const client = getClient();
	if (!client) return {};
	const rootSpan = getRootSpan(span);
	const rootSpanJson = spanToJSON(rootSpan);
	const rootSpanAttributes = rootSpanJson.data;
	const traceState = rootSpan.spanContext().traceState;
	const rootSpanSampleRate = traceState?.get("sentry.sample_rate") ?? rootSpanAttributes["sentry.sample_rate"] ?? rootSpanAttributes["sentry.previous_trace_sample_rate"];
	function applyLocalSampleRateToDsc(dsc) {
		if (typeof rootSpanSampleRate === "number" || typeof rootSpanSampleRate === "string") dsc.sample_rate = `${rootSpanSampleRate}`;
		return dsc;
	}
	const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
	if (frozenDsc) return applyLocalSampleRateToDsc(frozenDsc);
	const traceStateDsc = traceState?.get("sentry.dsc");
	const dscOnTraceState = traceStateDsc && baggageHeaderToDynamicSamplingContext(traceStateDsc);
	if (dscOnTraceState) return applyLocalSampleRateToDsc(dscOnTraceState);
	const dsc = getDynamicSamplingContextFromClient(span.spanContext().traceId, client);
	const source = rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
	const name = rootSpanJson.description;
	if (source !== "url" && name) dsc.transaction = name;
	if (hasSpansEnabled()) {
		dsc.sampled = String(spanIsSampled(rootSpan));
		dsc.sample_rand = traceState?.get("sentry.sample_rand") ?? getCapturedScopesOnSpan(rootSpan).scope?.getPropagationContext().sampleRand.toString();
	}
	applyLocalSampleRateToDsc(dsc);
	client.emit("createDsc", dsc, rootSpan);
	return dsc;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/sentryNonRecordingSpan.js
/**
* A Sentry Span that is non-recording, meaning it will not be sent to Sentry.
*/
var SentryNonRecordingSpan = class {
	constructor(spanContext = {}) {
		this._traceId = spanContext.traceId || generateTraceId();
		this._spanId = spanContext.spanId || generateSpanId();
	}
	/** @inheritdoc */
	spanContext() {
		return {
			spanId: this._spanId,
			traceId: this._traceId,
			traceFlags: 0
		};
	}
	/** @inheritdoc */
	end(_timestamp) {}
	/** @inheritdoc */
	setAttribute(_key, _value) {
		return this;
	}
	/** @inheritdoc */
	setAttributes(_values) {
		return this;
	}
	/** @inheritdoc */
	setStatus(_status) {
		return this;
	}
	/** @inheritdoc */
	updateName(_name) {
		return this;
	}
	/** @inheritdoc */
	isRecording() {
		return false;
	}
	/** @inheritdoc */
	addEvent(_name, _attributesOrStartTime, _startTime) {
		return this;
	}
	/** @inheritDoc */
	addLink(_link) {
		return this;
	}
	/** @inheritDoc */
	addLinks(_links) {
		return this;
	}
	/**
	* This should generally not be used,
	* but we need it for being compliant with the OTEL Span interface.
	*
	* @hidden
	* @internal
	*/
	recordException(_exception, _time) {}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/normalize.js
/**
* Recursively normalizes the given object.
*
* - Creates a copy to prevent original input mutation
* - Skips non-enumerable properties
* - When stringifying, calls `toJSON` if implemented
* - Removes circular references
* - Translates non-serializable values (`undefined`/`NaN`/functions) to serializable format
* - Translates known global objects/classes to a string representations
* - Takes care of `Error` object serialization
* - Optionally limits depth of final output
* - Optionally limits number of properties/elements included in any single object/array
*
* @param input The object to be normalized.
* @param depth The max depth to which to normalize the object. (Anything deeper stringified whole.)
* @param maxProperties The max number of elements or properties to be included in any single array or
* object in the normalized output.
* @returns A normalized version of the object, or `"**non-serializable**"` if any errors are thrown during normalization.
*/
function normalize(input, depth = 100, maxProperties = Infinity) {
	try {
		return visit("", input, depth, maxProperties);
	} catch (err) {
		return { ERROR: `**non-serializable** (${err})` };
	}
}
/** JSDoc */
function normalizeToSize(object, depth = 3, maxSize = 100 * 1024) {
	const normalized = normalize(object, depth);
	if (jsonSize(normalized) > maxSize) return normalizeToSize(object, depth - 1, maxSize);
	return normalized;
}
/**
* Visits a node to perform normalization on it
*
* @param key The key corresponding to the given node
* @param value The node to be visited
* @param depth Optional number indicating the maximum recursion depth
* @param maxProperties Optional maximum number of properties/elements included in any single object/array
* @param memo Optional Memo class handling decycling
*/
function visit(key, value, depth = Infinity, maxProperties = Infinity, memo = memoBuilder()) {
	const [memoize, unmemoize] = memo;
	if (value == null || ["boolean", "string"].includes(typeof value) || typeof value === "number" && Number.isFinite(value)) return value;
	const stringified = stringifyValue(key, value);
	if (!stringified.startsWith("[object ")) return stringified;
	if (value["__sentry_skip_normalization__"]) return value;
	const remainingDepth = typeof value["__sentry_override_normalization_depth__"] === "number" ? value["__sentry_override_normalization_depth__"] : depth;
	if (remainingDepth === 0) return stringified.replace("object ", "");
	if (memoize(value)) return "[Circular ~]";
	const valueWithToJSON = value;
	if (valueWithToJSON && typeof valueWithToJSON.toJSON === "function") try {
		return visit("", valueWithToJSON.toJSON(), remainingDepth - 1, maxProperties, memo);
	} catch {}
	const normalized = Array.isArray(value) ? [] : {};
	let numAdded = 0;
	const visitable = convertToPlainObject(value);
	for (const visitKey in visitable) {
		if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) continue;
		if (numAdded >= maxProperties) {
			normalized[visitKey] = "[MaxProperties ~]";
			break;
		}
		const visitValue = visitable[visitKey];
		normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
		numAdded++;
	}
	unmemoize(value);
	return normalized;
}
/**
* Stringify the given value. Handles various known special values and types.
*
* Not meant to be used on simple primitives which already have a string representation, as it will, for example, turn
* the number 1231 into "[Object Number]", nor on `null`, as it will throw.
*
* @param value The value to stringify
* @returns A stringified representation of the given value
*/
function stringifyValue(key, value) {
	try {
		if (key === "domain" && value && typeof value === "object" && value._events) return "[Domain]";
		if (key === "domainEmitter") return "[DomainEmitter]";
		if (typeof global !== "undefined" && value === global) return "[Global]";
		if (typeof window !== "undefined" && value === window) return "[Window]";
		if (typeof document !== "undefined" && value === document) return "[Document]";
		if (isVueViewModel(value)) return "[VueViewModel]";
		if (isSyntheticEvent(value)) return "[SyntheticEvent]";
		if (typeof value === "number" && !Number.isFinite(value)) return `[${value}]`;
		if (typeof value === "function") return `[Function: ${getFunctionName(value)}]`;
		if (typeof value === "symbol") return `[${String(value)}]`;
		if (typeof value === "bigint") return `[BigInt: ${String(value)}]`;
		const objName = getConstructorName(value);
		if (/^HTML(\w*)Element$/.test(objName)) return `[HTMLElement: ${objName}]`;
		return `[object ${objName}]`;
	} catch (err) {
		return `**non-serializable** (${err})`;
	}
}
function getConstructorName(value) {
	const prototype = Object.getPrototypeOf(value);
	return prototype?.constructor ? prototype.constructor.name : "null prototype";
}
/** Calculates bytes size of input string */
function utf8Length(value) {
	return ~-encodeURI(value).split(/%..|./).length;
}
/** Calculates bytes size of input object */
function jsonSize(value) {
	return utf8Length(JSON.stringify(value));
}
/**
* Helper to decycle json objects
*/
function memoBuilder() {
	const inner = /* @__PURE__ */ new WeakSet();
	function memoize(obj) {
		if (inner.has(obj)) return true;
		inner.add(obj);
		return false;
	}
	function unmemoize(obj) {
		inner.delete(obj);
	}
	return [memoize, unmemoize];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/envelope.js
/**
* Creates an envelope.
* Make sure to always explicitly provide the generic to this function
* so that the envelope types resolve correctly.
*/
function createEnvelope(headers, items = []) {
	return [headers, items];
}
/**
* Add an item to an envelope.
* Make sure to always explicitly provide the generic to this function
* so that the envelope types resolve correctly.
*/
function addItemToEnvelope(envelope, newItem) {
	const [headers, items] = envelope;
	return [headers, [...items, newItem]];
}
/**
* Convenience function to loop through the items and item types of an envelope.
* (This function was mostly created because working with envelope types is painful at the moment)
*
* If the callback returns true, the rest of the items will be skipped.
*/
function forEachEnvelopeItem(envelope, callback) {
	const envelopeItems = envelope[1];
	for (const envelopeItem of envelopeItems) {
		const envelopeItemType = envelopeItem[0].type;
		if (callback(envelopeItem, envelopeItemType)) return true;
	}
	return false;
}
/**
* Encode a string to UTF8 array.
*/
function encodeUTF8(input) {
	const carrier = getSentryCarrier(GLOBAL_OBJ);
	return carrier.encodePolyfill ? carrier.encodePolyfill(input) : new TextEncoder().encode(input);
}
/**
* Serializes an envelope.
*/
function serializeEnvelope(envelope) {
	const [envHeaders, items] = envelope;
	let parts = JSON.stringify(envHeaders);
	function append(next) {
		if (typeof parts === "string") parts = typeof next === "string" ? parts + next : [encodeUTF8(parts), next];
		else parts.push(typeof next === "string" ? encodeUTF8(next) : next);
	}
	for (const item of items) {
		const [itemHeaders, payload] = item;
		append(`\n${JSON.stringify(itemHeaders)}\n`);
		if (typeof payload === "string" || payload instanceof Uint8Array) append(payload);
		else {
			let stringifiedPayload;
			try {
				stringifiedPayload = JSON.stringify(payload);
			} catch {
				stringifiedPayload = JSON.stringify(normalize(payload));
			}
			append(stringifiedPayload);
		}
	}
	return typeof parts === "string" ? parts : concatBuffers(parts);
}
function concatBuffers(buffers) {
	const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
	const merged = new Uint8Array(totalLength);
	let offset = 0;
	for (const buffer of buffers) {
		merged.set(buffer, offset);
		offset += buffer.length;
	}
	return merged;
}
/**
* Creates envelope item for a single span
*/
function createSpanEnvelopeItem(spanJson) {
	return [{ type: "span" }, spanJson];
}
/**
* Creates attachment envelope items
*/
function createAttachmentEnvelopeItem(attachment) {
	const buffer = typeof attachment.data === "string" ? encodeUTF8(attachment.data) : attachment.data;
	return [{
		type: "attachment",
		length: buffer.length,
		filename: attachment.filename,
		content_type: attachment.contentType,
		attachment_type: attachment.attachmentType
	}, buffer];
}
var ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
	session: "session",
	sessions: "session",
	attachment: "attachment",
	transaction: "transaction",
	event: "error",
	client_report: "internal",
	user_report: "default",
	profile: "profile",
	profile_chunk: "profile",
	replay_event: "replay",
	replay_recording: "replay",
	check_in: "monitor",
	feedback: "feedback",
	span: "span",
	raw_security: "security",
	log: "log_item"
};
/**
* Maps the type of an envelope item to a data category.
*/
function envelopeItemTypeToDataCategory(type) {
	return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
}
/** Extracts the minimal SDK info from the metadata or an events */
function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
	if (!metadataOrEvent?.sdk) return;
	const { name, version } = metadataOrEvent.sdk;
	return {
		name,
		version
	};
}
/**
* Creates event envelope headers, based on event, sdk info and tunnel
* Note: This function was extracted from the core package to make it available in Replay
*/
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
	const dynamicSamplingContext = event.sdkProcessingMetadata?.dynamicSamplingContext;
	return {
		event_id: event.event_id,
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...sdkInfo && { sdk: sdkInfo },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) },
		...dynamicSamplingContext && { trace: dynamicSamplingContext }
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/envelope.js
/**
* Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
* Merge with existing data if any.
**/
function enhanceEventWithSdkInfo(event, sdkInfo) {
	if (!sdkInfo) return event;
	event.sdk = event.sdk || {};
	event.sdk.name = event.sdk.name || sdkInfo.name;
	event.sdk.version = event.sdk.version || sdkInfo.version;
	event.sdk.integrations = [...event.sdk.integrations || [], ...sdkInfo.integrations || []];
	event.sdk.packages = [...event.sdk.packages || [], ...sdkInfo.packages || []];
	return event;
}
/** Creates an envelope from a Session */
function createSessionEnvelope(session, dsn, metadata, tunnel) {
	const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
	return createEnvelope({
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...sdkInfo && { sdk: sdkInfo },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) }
	}, ["aggregates" in session ? [{ type: "sessions" }, session] : [{ type: "session" }, session.toJSON()]]);
}
/**
* Create an Envelope from an event.
*/
function createEventEnvelope(event, dsn, metadata, tunnel) {
	const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
	const eventType = event.type && event.type !== "replay_event" ? event.type : "event";
	enhanceEventWithSdkInfo(event, metadata?.sdk);
	const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
	delete event.sdkProcessingMetadata;
	return createEnvelope(envelopeHeaders, [[{ type: eventType }, event]]);
}
/**
* Create envelope from Span item.
*
* Takes an optional client and runs spans through `beforeSendSpan` if available.
*/
function createSpanEnvelope(spans, client) {
	function dscHasRequiredProps(dsc) {
		return !!dsc.trace_id && !!dsc.public_key;
	}
	const dsc = getDynamicSamplingContextFromSpan(spans[0]);
	const dsn = client?.getDsn();
	const tunnel = client?.getOptions().tunnel;
	const headers = {
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...dscHasRequiredProps(dsc) && { trace: dsc },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) }
	};
	const beforeSendSpan = client?.getOptions().beforeSendSpan;
	const convertToSpanJSON = beforeSendSpan ? (span) => {
		const spanJson = spanToJSON(span);
		const processedSpan = beforeSendSpan(spanJson);
		if (!processedSpan) {
			showSpanDropWarning();
			return spanJson;
		}
		return processedSpan;
	} : spanToJSON;
	const items = [];
	for (const span of spans) {
		const spanJson = convertToSpanJSON(span);
		if (spanJson) items.push(createSpanEnvelopeItem(spanJson));
	}
	return createEnvelope(headers, items);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/logSpans.js
/**
* Print a log message for a started span.
*/
function logSpanStart(span) {
	if (!DEBUG_BUILD) return;
	const { description = "< unknown name >", op = "< unknown op >", parent_span_id: parentSpanId } = spanToJSON(span);
	const { spanId } = span.spanContext();
	const sampled = spanIsSampled(span);
	const rootSpan = getRootSpan(span);
	const isRootSpan = rootSpan === span;
	const header = `[Tracing] Starting ${sampled ? "sampled" : "unsampled"} ${isRootSpan ? "root " : ""}span`;
	const infoParts = [
		`op: ${op}`,
		`name: ${description}`,
		`ID: ${spanId}`
	];
	if (parentSpanId) infoParts.push(`parent ID: ${parentSpanId}`);
	if (!isRootSpan) {
		const { op, description } = spanToJSON(rootSpan);
		infoParts.push(`root ID: ${rootSpan.spanContext().spanId}`);
		if (op) infoParts.push(`root op: ${op}`);
		if (description) infoParts.push(`root description: ${description}`);
	}
	debug.log(`${header}
  ${infoParts.join("\n  ")}`);
}
/**
* Print a log message for an ended span.
*/
function logSpanEnd(span) {
	if (!DEBUG_BUILD) return;
	const { description = "< unknown name >", op = "< unknown op >" } = spanToJSON(span);
	const { spanId } = span.spanContext();
	const msg = `[Tracing] Finishing "${op}" ${getRootSpan(span) === span ? "root " : ""}span "${description}" with ID ${spanId}`;
	debug.log(msg);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/measurement.js
/**
* Convert timed events to measurements.
*/
function timedEventsToMeasurements(events) {
	if (!events || events.length === 0) return;
	const measurements = {};
	events.forEach((event) => {
		const attributes = event.attributes || {};
		const unit = attributes[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT];
		const value = attributes[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE];
		if (typeof unit === "string" && typeof value === "number") measurements[event.name] = {
			value,
			unit
		};
	});
	return measurements;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/sentrySpan.js
var MAX_SPAN_COUNT = 1e3;
/**
* Span contains all data about a span
*/
var SentrySpan = class {
	/** Epoch timestamp in seconds when the span started. */
	/** Epoch timestamp in seconds when the span ended. */
	/** Internal keeper of the status */
	/** The timed events added to this span. */
	/** if true, treat span as a standalone span (not part of a transaction) */
	/**
	* You should never call the constructor manually, always use `Sentry.startSpan()`
	* or other span methods.
	* @internal
	* @hideconstructor
	* @hidden
	*/
	constructor(spanContext = {}) {
		this._traceId = spanContext.traceId || generateTraceId();
		this._spanId = spanContext.spanId || generateSpanId();
		this._startTime = spanContext.startTimestamp || timestampInSeconds();
		this._links = spanContext.links;
		this._attributes = {};
		this.setAttributes({
			[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "manual",
			[SEMANTIC_ATTRIBUTE_SENTRY_OP]: spanContext.op,
			...spanContext.attributes
		});
		this._name = spanContext.name;
		if (spanContext.parentSpanId) this._parentSpanId = spanContext.parentSpanId;
		if ("sampled" in spanContext) this._sampled = spanContext.sampled;
		if (spanContext.endTimestamp) this._endTime = spanContext.endTimestamp;
		this._events = [];
		this._isStandaloneSpan = spanContext.isStandalone;
		if (this._endTime) this._onSpanEnded();
	}
	/** @inheritDoc */
	addLink(link) {
		if (this._links) this._links.push(link);
		else this._links = [link];
		return this;
	}
	/** @inheritDoc */
	addLinks(links) {
		if (this._links) this._links.push(...links);
		else this._links = links;
		return this;
	}
	/**
	* This should generally not be used,
	* but it is needed for being compliant with the OTEL Span interface.
	*
	* @hidden
	* @internal
	*/
	recordException(_exception, _time) {}
	/** @inheritdoc */
	spanContext() {
		const { _spanId: spanId, _traceId: traceId, _sampled: sampled } = this;
		return {
			spanId,
			traceId,
			traceFlags: sampled ? 1 : 0
		};
	}
	/** @inheritdoc */
	setAttribute(key, value) {
		if (value === void 0) delete this._attributes[key];
		else this._attributes[key] = value;
		return this;
	}
	/** @inheritdoc */
	setAttributes(attributes) {
		Object.keys(attributes).forEach((key) => this.setAttribute(key, attributes[key]));
		return this;
	}
	/**
	* This should generally not be used,
	* but we need it for browser tracing where we want to adjust the start time afterwards.
	* USE THIS WITH CAUTION!
	*
	* @hidden
	* @internal
	*/
	updateStartTime(timeInput) {
		this._startTime = spanTimeInputToSeconds(timeInput);
	}
	/**
	* @inheritDoc
	*/
	setStatus(value) {
		this._status = value;
		return this;
	}
	/**
	* @inheritDoc
	*/
	updateName(name) {
		this._name = name;
		this.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, "custom");
		return this;
	}
	/** @inheritdoc */
	end(endTimestamp) {
		if (this._endTime) return;
		this._endTime = spanTimeInputToSeconds(endTimestamp);
		logSpanEnd(this);
		this._onSpanEnded();
	}
	/**
	* Get JSON representation of this span.
	*
	* @hidden
	* @internal This method is purely for internal purposes and should not be used outside
	* of SDK code. If you need to get a JSON representation of a span,
	* use `spanToJSON(span)` instead.
	*/
	getSpanJSON() {
		return {
			data: this._attributes,
			description: this._name,
			op: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
			parent_span_id: this._parentSpanId,
			span_id: this._spanId,
			start_timestamp: this._startTime,
			status: getStatusMessage(this._status),
			timestamp: this._endTime,
			trace_id: this._traceId,
			origin: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
			profile_id: this._attributes[SEMANTIC_ATTRIBUTE_PROFILE_ID],
			exclusive_time: this._attributes[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
			measurements: timedEventsToMeasurements(this._events),
			is_segment: this._isStandaloneSpan && getRootSpan(this) === this || void 0,
			segment_id: this._isStandaloneSpan ? getRootSpan(this).spanContext().spanId : void 0,
			links: convertSpanLinksForEnvelope(this._links)
		};
	}
	/** @inheritdoc */
	isRecording() {
		return !this._endTime && !!this._sampled;
	}
	/**
	* @inheritdoc
	*/
	addEvent(name, attributesOrStartTime, startTime) {
		DEBUG_BUILD && debug.log("[Tracing] Adding an event to span:", name);
		const time = isSpanTimeInput(attributesOrStartTime) ? attributesOrStartTime : startTime || timestampInSeconds();
		const attributes = isSpanTimeInput(attributesOrStartTime) ? {} : attributesOrStartTime || {};
		const event = {
			name,
			time: spanTimeInputToSeconds(time),
			attributes
		};
		this._events.push(event);
		return this;
	}
	/**
	* This method should generally not be used,
	* but for now we need a way to publicly check if the `_isStandaloneSpan` flag is set.
	* USE THIS WITH CAUTION!
	* @internal
	* @hidden
	* @experimental
	*/
	isStandaloneSpan() {
		return !!this._isStandaloneSpan;
	}
	/** Emit `spanEnd` when the span is ended. */
	_onSpanEnded() {
		const client = getClient();
		if (client) client.emit("spanEnd", this);
		if (!(this._isStandaloneSpan || this === getRootSpan(this))) return;
		if (this._isStandaloneSpan) {
			if (this._sampled) sendSpanEnvelope(createSpanEnvelope([this], client));
			else {
				DEBUG_BUILD && debug.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled.");
				if (client) client.recordDroppedEvent("sample_rate", "span");
			}
			return;
		}
		const transactionEvent = this._convertSpanToTransaction();
		if (transactionEvent) (getCapturedScopesOnSpan(this).scope || getCurrentScope()).captureEvent(transactionEvent);
	}
	/**
	* Finish the transaction & prepare the event to send to Sentry.
	*/
	_convertSpanToTransaction() {
		if (!isFullFinishedSpan(spanToJSON(this))) return;
		if (!this._name) {
			DEBUG_BUILD && debug.warn("Transaction has no name, falling back to `<unlabeled transaction>`.");
			this._name = "<unlabeled transaction>";
		}
		const { scope: capturedSpanScope, isolationScope: capturedSpanIsolationScope } = getCapturedScopesOnSpan(this);
		const normalizedRequest = capturedSpanScope?.getScopeData().sdkProcessingMetadata?.normalizedRequest;
		if (this._sampled !== true) return;
		const spans = getSpanDescendants(this).filter((span) => span !== this && !isStandaloneSpan(span)).map((span) => spanToJSON(span)).filter(isFullFinishedSpan);
		const source = this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		delete this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
		spans.forEach((span) => {
			delete span.data[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
		});
		const transaction = {
			contexts: { trace: spanToTransactionTraceContext(this) },
			spans: spans.length > MAX_SPAN_COUNT ? spans.sort((a, b) => a.start_timestamp - b.start_timestamp).slice(0, MAX_SPAN_COUNT) : spans,
			start_timestamp: this._startTime,
			timestamp: this._endTime,
			transaction: this._name,
			type: "transaction",
			sdkProcessingMetadata: {
				capturedSpanScope,
				capturedSpanIsolationScope,
				dynamicSamplingContext: getDynamicSamplingContextFromSpan(this)
			},
			request: normalizedRequest,
			...source && { transaction_info: { source } }
		};
		const measurements = timedEventsToMeasurements(this._events);
		if (measurements && Object.keys(measurements).length) {
			DEBUG_BUILD && debug.log("[Measurements] Adding measurements to transaction event", JSON.stringify(measurements, void 0, 2));
			transaction.measurements = measurements;
		}
		return transaction;
	}
};
function isSpanTimeInput(value) {
	return value && typeof value === "number" || value instanceof Date || Array.isArray(value);
}
function isFullFinishedSpan(input) {
	return !!input.start_timestamp && !!input.timestamp && !!input.span_id && !!input.trace_id;
}
/** `SentrySpan`s can be sent as a standalone span rather than belonging to a transaction */
function isStandaloneSpan(span) {
	return span instanceof SentrySpan && span.isStandaloneSpan();
}
/**
* Sends a `SpanEnvelope`.
*
* Note: If the envelope's spans are dropped, e.g. via `beforeSendSpan`,
* the envelope will not be sent either.
*/
function sendSpanEnvelope(envelope) {
	const client = getClient();
	if (!client) return;
	const spanItems = envelope[1];
	if (!spanItems || spanItems.length === 0) {
		client.recordDroppedEvent("before_send", "span");
		return;
	}
	client.sendEnvelope(envelope);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/handleCallbackErrors.js
/**
* Wrap a callback function with error handling.
* If an error is thrown, it will be passed to the `onError` callback and re-thrown.
*
* If the return value of the function is a promise, it will be handled with `maybeHandlePromiseRejection`.
*
* If an `onFinally` callback is provided, this will be called when the callback has finished
* - so if it returns a promise, once the promise resolved/rejected,
* else once the callback has finished executing.
* The `onFinally` callback will _always_ be called, no matter if an error was thrown or not.
*/
function handleCallbackErrors(fn, onError, onFinally = () => {}) {
	let maybePromiseResult;
	try {
		maybePromiseResult = fn();
	} catch (e) {
		onError(e);
		onFinally();
		throw e;
	}
	return maybeHandlePromiseRejection(maybePromiseResult, onError, onFinally);
}
/**
* Maybe handle a promise rejection.
* This expects to be given a value that _may_ be a promise, or any other value.
* If it is a promise, and it rejects, it will call the `onError` callback.
* Other than this, it will generally return the given value as-is.
*/
function maybeHandlePromiseRejection(value, onError, onFinally) {
	if (isThenable(value)) return value.then((res) => {
		onFinally();
		return res;
	}, (e) => {
		onError(e);
		onFinally();
		throw e;
	});
	onFinally();
	return value;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/sampling.js
/**
* Makes a sampling decision for the given options.
*
* Called every time a root span is created. Only root spans which emerge with a `sampled` value of `true` will be
* sent to Sentry.
*/
function sampleSpan(options, samplingContext, sampleRand) {
	if (!hasSpansEnabled(options)) return [false];
	let localSampleRateWasApplied = void 0;
	let sampleRate;
	if (typeof options.tracesSampler === "function") {
		sampleRate = options.tracesSampler({
			...samplingContext,
			inheritOrSampleWith: (fallbackSampleRate) => {
				if (typeof samplingContext.parentSampleRate === "number") return samplingContext.parentSampleRate;
				if (typeof samplingContext.parentSampled === "boolean") return Number(samplingContext.parentSampled);
				return fallbackSampleRate;
			}
		});
		localSampleRateWasApplied = true;
	} else if (samplingContext.parentSampled !== void 0) sampleRate = samplingContext.parentSampled;
	else if (typeof options.tracesSampleRate !== "undefined") {
		sampleRate = options.tracesSampleRate;
		localSampleRateWasApplied = true;
	}
	const parsedSampleRate = parseSampleRate(sampleRate);
	if (parsedSampleRate === void 0) {
		DEBUG_BUILD && debug.warn(`[Tracing] Discarding root span because of invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(sampleRate)} of type ${JSON.stringify(typeof sampleRate)}.`);
		return [false];
	}
	if (!parsedSampleRate) {
		DEBUG_BUILD && debug.log(`[Tracing] Discarding transaction because ${typeof options.tracesSampler === "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`);
		return [
			false,
			parsedSampleRate,
			localSampleRateWasApplied
		];
	}
	const shouldSample = sampleRand < parsedSampleRate;
	if (!shouldSample) DEBUG_BUILD && debug.log(`[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(sampleRate)})`);
	return [
		shouldSample,
		parsedSampleRate,
		localSampleRateWasApplied
	];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/trace.js
var SUPPRESS_TRACING_KEY = "__SENTRY_SUPPRESS_TRACING__";
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
function startSpan(options, callback) {
	const acs = getAcs();
	if (acs.startSpan) return acs.startSpan(options, callback);
	const spanArguments = parseSentrySpanArguments(options);
	const { forceTransaction, parentSpan: customParentSpan, scope: customScope } = options;
	const customForkedScope = customScope?.clone();
	return withScope(customForkedScope, () => {
		return getActiveSpanWrapper(customParentSpan)(() => {
			const scope = getCurrentScope();
			const parentSpan = getParentSpan(scope, customParentSpan);
			const activeSpan = options.onlyIfParent && !parentSpan ? new SentryNonRecordingSpan() : createChildOrRootSpan({
				parentSpan,
				spanArguments,
				forceTransaction,
				scope
			});
			_setSpanForScope(scope, activeSpan);
			return handleCallbackErrors(() => callback(activeSpan), () => {
				const { status } = spanToJSON(activeSpan);
				if (activeSpan.isRecording() && (!status || status === "ok")) activeSpan.setStatus({
					code: 2,
					message: "internal_error"
				});
			}, () => {
				activeSpan.end();
			});
		});
	});
}
/**
* Similar to `Sentry.startSpan`. Wraps a function with a transaction/span, but does not finish the span
* after the function is done automatically. Use `span.end()` to end the span.
*
* The created span is the active span and will be used as parent by other spans created inside the function
* and can be accessed via `Sentry.getActiveSpan()`, as long as the function is executed while the scope is active.
*
* You'll always get a span passed to the callback,
* it may just be a non-recording span if the span is not sampled or if tracing is disabled.
*/
function startSpanManual(options, callback) {
	const acs = getAcs();
	if (acs.startSpanManual) return acs.startSpanManual(options, callback);
	const spanArguments = parseSentrySpanArguments(options);
	const { forceTransaction, parentSpan: customParentSpan, scope: customScope } = options;
	const customForkedScope = customScope?.clone();
	return withScope(customForkedScope, () => {
		return getActiveSpanWrapper(customParentSpan)(() => {
			const scope = getCurrentScope();
			const parentSpan = getParentSpan(scope, customParentSpan);
			const activeSpan = options.onlyIfParent && !parentSpan ? new SentryNonRecordingSpan() : createChildOrRootSpan({
				parentSpan,
				spanArguments,
				forceTransaction,
				scope
			});
			_setSpanForScope(scope, activeSpan);
			return handleCallbackErrors(() => callback(activeSpan, () => activeSpan.end()), () => {
				const { status } = spanToJSON(activeSpan);
				if (activeSpan.isRecording() && (!status || status === "ok")) activeSpan.setStatus({
					code: 2,
					message: "internal_error"
				});
			});
		});
	});
}
/**
* Forks the current scope and sets the provided span as active span in the context of the provided callback. Can be
* passed `null` to start an entirely new span tree.
*
* @param span Spans started in the context of the provided callback will be children of this span. If `null` is passed,
* spans started within the callback will not be attached to a parent span.
* @param callback Execution context in which the provided span will be active. Is passed the newly forked scope.
* @returns the value returned from the provided callback function.
*/
function withActiveSpan(span, callback) {
	const acs = getAcs();
	if (acs.withActiveSpan) return acs.withActiveSpan(span, callback);
	return withScope((scope) => {
		_setSpanForScope(scope, span || void 0);
		return callback(scope);
	});
}
/** Suppress tracing in the given callback, ensuring no spans are generated inside of it. */
function suppressTracing(callback) {
	const acs = getAcs();
	if (acs.suppressTracing) return acs.suppressTracing(callback);
	return withScope((scope) => {
		scope.setSDKProcessingMetadata({ [SUPPRESS_TRACING_KEY]: true });
		const res = callback();
		scope.setSDKProcessingMetadata({ [SUPPRESS_TRACING_KEY]: void 0 });
		return res;
	});
}
function createChildOrRootSpan({ parentSpan, spanArguments, forceTransaction, scope }) {
	if (!hasSpansEnabled()) {
		const span = new SentryNonRecordingSpan();
		if (forceTransaction || !parentSpan) freezeDscOnSpan(span, {
			sampled: "false",
			sample_rate: "0",
			transaction: spanArguments.name,
			...getDynamicSamplingContextFromSpan(span)
		});
		return span;
	}
	const isolationScope = getIsolationScope();
	let span;
	if (parentSpan && !forceTransaction) {
		span = _startChildSpan(parentSpan, scope, spanArguments);
		addChildSpanToSpan(parentSpan, span);
	} else if (parentSpan) {
		const dsc = getDynamicSamplingContextFromSpan(parentSpan);
		const { traceId, spanId: parentSpanId } = parentSpan.spanContext();
		const parentSampled = spanIsSampled(parentSpan);
		span = _startRootSpan({
			traceId,
			parentSpanId,
			...spanArguments
		}, scope, parentSampled);
		freezeDscOnSpan(span, dsc);
	} else {
		const { traceId, dsc, parentSpanId, sampled: parentSampled } = {
			...isolationScope.getPropagationContext(),
			...scope.getPropagationContext()
		};
		span = _startRootSpan({
			traceId,
			parentSpanId,
			...spanArguments
		}, scope, parentSampled);
		if (dsc) freezeDscOnSpan(span, dsc);
	}
	logSpanStart(span);
	setCapturedScopesOnSpan(span, scope, isolationScope);
	return span;
}
/**
* This converts StartSpanOptions to SentrySpanArguments.
* For the most part (for now) we accept the same options,
* but some of them need to be transformed.
*/
function parseSentrySpanArguments(options) {
	const initialCtx = {
		isStandalone: (options.experimental || {}).standalone,
		...options
	};
	if (options.startTime) {
		const ctx = { ...initialCtx };
		ctx.startTimestamp = spanTimeInputToSeconds(options.startTime);
		delete ctx.startTime;
		return ctx;
	}
	return initialCtx;
}
function getAcs() {
	return getAsyncContextStrategy(getMainCarrier());
}
function _startRootSpan(spanArguments, scope, parentSampled) {
	const client = getClient();
	const options = client?.getOptions() || {};
	const { name = "" } = spanArguments;
	const mutableSpanSamplingData = {
		spanAttributes: { ...spanArguments.attributes },
		spanName: name,
		parentSampled
	};
	client?.emit("beforeSampling", mutableSpanSamplingData, { decision: false });
	const finalParentSampled = mutableSpanSamplingData.parentSampled ?? parentSampled;
	const finalAttributes = mutableSpanSamplingData.spanAttributes;
	const currentPropagationContext = scope.getPropagationContext();
	const [sampled, sampleRate, localSampleRateWasApplied] = scope.getScopeData().sdkProcessingMetadata[SUPPRESS_TRACING_KEY] ? [false] : sampleSpan(options, {
		name,
		parentSampled: finalParentSampled,
		attributes: finalAttributes,
		parentSampleRate: parseSampleRate(currentPropagationContext.dsc?.sample_rate)
	}, currentPropagationContext.sampleRand);
	const rootSpan = new SentrySpan({
		...spanArguments,
		attributes: {
			[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "custom",
			[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE]: sampleRate !== void 0 && localSampleRateWasApplied ? sampleRate : void 0,
			...finalAttributes
		},
		sampled
	});
	if (!sampled && client) {
		DEBUG_BUILD && debug.log("[Tracing] Discarding root span because its trace was not chosen to be sampled.");
		client.recordDroppedEvent("sample_rate", "transaction");
	}
	if (client) client.emit("spanStart", rootSpan);
	return rootSpan;
}
/**
* Creates a new `Span` while setting the current `Span.id` as `parentSpanId`.
* This inherits the sampling decision from the parent span.
*/
function _startChildSpan(parentSpan, scope, spanArguments) {
	const { spanId, traceId } = parentSpan.spanContext();
	const sampled = scope.getScopeData().sdkProcessingMetadata[SUPPRESS_TRACING_KEY] ? false : spanIsSampled(parentSpan);
	const childSpan = sampled ? new SentrySpan({
		...spanArguments,
		parentSpanId: spanId,
		traceId,
		sampled
	}) : new SentryNonRecordingSpan({ traceId });
	addChildSpanToSpan(parentSpan, childSpan);
	const client = getClient();
	if (client) {
		client.emit("spanStart", childSpan);
		if (spanArguments.endTimestamp) client.emit("spanEnd", childSpan);
	}
	return childSpan;
}
function getParentSpan(scope, customParentSpan) {
	if (customParentSpan) return customParentSpan;
	if (customParentSpan === null) return;
	const span = _getSpanForScope(scope);
	if (!span) return;
	const client = getClient();
	if ((client ? client.getOptions() : {}).parentSpanIsAlwaysRootSpan) return getRootSpan(span);
	return span;
}
function getActiveSpanWrapper(parentSpan) {
	return parentSpan !== void 0 ? (callback) => {
		return withActiveSpan(parentSpan, callback);
	} : (callback) => callback();
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/syncpromise.js
/** SyncPromise internal states */
var STATE_PENDING = 0;
var STATE_RESOLVED = 1;
var STATE_REJECTED = 2;
/**
* Creates a resolved sync promise.
*
* @param value the value to resolve the promise with
* @returns the resolved sync promise
*/
function resolvedSyncPromise(value) {
	return new SyncPromise((resolve) => {
		resolve(value);
	});
}
/**
* Creates a rejected sync promise.
*
* @param value the value to reject the promise with
* @returns the rejected sync promise
*/
function rejectedSyncPromise(reason) {
	return new SyncPromise((_, reject) => {
		reject(reason);
	});
}
/**
* Thenable class that behaves like a Promise and follows it's interface
* but is not async internally
*/
var SyncPromise = class SyncPromise {
	constructor(executor) {
		this._state = STATE_PENDING;
		this._handlers = [];
		this._runExecutor(executor);
	}
	/** @inheritdoc */
	then(onfulfilled, onrejected) {
		return new SyncPromise((resolve, reject) => {
			this._handlers.push([
				false,
				(result) => {
					if (!onfulfilled) resolve(result);
					else try {
						resolve(onfulfilled(result));
					} catch (e) {
						reject(e);
					}
				},
				(reason) => {
					if (!onrejected) reject(reason);
					else try {
						resolve(onrejected(reason));
					} catch (e) {
						reject(e);
					}
				}
			]);
			this._executeHandlers();
		});
	}
	/** @inheritdoc */
	catch(onrejected) {
		return this.then((val) => val, onrejected);
	}
	/** @inheritdoc */
	finally(onfinally) {
		return new SyncPromise((resolve, reject) => {
			let val;
			let isRejected;
			return this.then((value) => {
				isRejected = false;
				val = value;
				if (onfinally) onfinally();
			}, (reason) => {
				isRejected = true;
				val = reason;
				if (onfinally) onfinally();
			}).then(() => {
				if (isRejected) {
					reject(val);
					return;
				}
				resolve(val);
			});
		});
	}
	/** Excute the resolve/reject handlers. */
	_executeHandlers() {
		if (this._state === STATE_PENDING) return;
		const cachedHandlers = this._handlers.slice();
		this._handlers = [];
		cachedHandlers.forEach((handler) => {
			if (handler[0]) return;
			if (this._state === STATE_RESOLVED) handler[1](this._value);
			if (this._state === STATE_REJECTED) handler[2](this._value);
			handler[0] = true;
		});
	}
	/** Run the executor for the SyncPromise. */
	_runExecutor(executor) {
		const setResult = (state, value) => {
			if (this._state !== STATE_PENDING) return;
			if (isThenable(value)) {
				value.then(resolve, reject);
				return;
			}
			this._state = state;
			this._value = value;
			this._executeHandlers();
		};
		const resolve = (value) => {
			setResult(STATE_RESOLVED, value);
		};
		const reject = (reason) => {
			setResult(STATE_REJECTED, reason);
		};
		try {
			executor(resolve, reject);
		} catch (e) {
			reject(e);
		}
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/eventProcessors.js
/**
* Process an array of event processors, returning the processed event (or `null` if the event was dropped).
*/
function notifyEventProcessors(processors, event, hint, index = 0) {
	return new SyncPromise((resolve, reject) => {
		const processor = processors[index];
		if (event === null || typeof processor !== "function") resolve(event);
		else {
			const result = processor({ ...event }, hint);
			DEBUG_BUILD && processor.id && result === null && debug.log(`Event processor "${processor.id}" dropped event`);
			if (isThenable(result)) result.then((final) => notifyEventProcessors(processors, final, hint, index + 1).then(resolve)).then(null, reject);
			else notifyEventProcessors(processors, result, hint, index + 1).then(resolve).then(null, reject);
		}
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/applyScopeDataToEvent.js
/**
* Applies data from the scope to the event and runs all event processors on it.
*/
function applyScopeDataToEvent(event, data) {
	const { fingerprint, span, breadcrumbs, sdkProcessingMetadata } = data;
	applyDataToEvent(event, data);
	if (span) applySpanToEvent(event, span);
	applyFingerprintToEvent(event, fingerprint);
	applyBreadcrumbsToEvent(event, breadcrumbs);
	applySdkMetadataToEvent(event, sdkProcessingMetadata);
}
/** Merge data of two scopes together. */
function mergeScopeData(data, mergeData) {
	const { extra, tags, user, contexts, level, sdkProcessingMetadata, breadcrumbs, fingerprint, eventProcessors, attachments, propagationContext, transactionName, span } = mergeData;
	mergeAndOverwriteScopeData(data, "extra", extra);
	mergeAndOverwriteScopeData(data, "tags", tags);
	mergeAndOverwriteScopeData(data, "user", user);
	mergeAndOverwriteScopeData(data, "contexts", contexts);
	data.sdkProcessingMetadata = merge(data.sdkProcessingMetadata, sdkProcessingMetadata, 2);
	if (level) data.level = level;
	if (transactionName) data.transactionName = transactionName;
	if (span) data.span = span;
	if (breadcrumbs.length) data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
	if (fingerprint.length) data.fingerprint = [...data.fingerprint, ...fingerprint];
	if (eventProcessors.length) data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
	if (attachments.length) data.attachments = [...data.attachments, ...attachments];
	data.propagationContext = {
		...data.propagationContext,
		...propagationContext
	};
}
/**
* Merges certain scope data. Undefined values will overwrite any existing values.
* Exported only for tests.
*/
function mergeAndOverwriteScopeData(data, prop, mergeVal) {
	data[prop] = merge(data[prop], mergeVal, 1);
}
function applyDataToEvent(event, data) {
	const { extra, tags, user, contexts, level, transactionName } = data;
	if (Object.keys(extra).length) event.extra = {
		...extra,
		...event.extra
	};
	if (Object.keys(tags).length) event.tags = {
		...tags,
		...event.tags
	};
	if (Object.keys(user).length) event.user = {
		...user,
		...event.user
	};
	if (Object.keys(contexts).length) event.contexts = {
		...contexts,
		...event.contexts
	};
	if (level) event.level = level;
	if (transactionName && event.type !== "transaction") event.transaction = transactionName;
}
function applyBreadcrumbsToEvent(event, breadcrumbs) {
	const mergedBreadcrumbs = [...event.breadcrumbs || [], ...breadcrumbs];
	event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : void 0;
}
function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
	event.sdkProcessingMetadata = {
		...event.sdkProcessingMetadata,
		...sdkProcessingMetadata
	};
}
function applySpanToEvent(event, span) {
	event.contexts = {
		trace: spanToTraceContext(span),
		...event.contexts
	};
	event.sdkProcessingMetadata = {
		dynamicSamplingContext: getDynamicSamplingContextFromSpan(span),
		...event.sdkProcessingMetadata
	};
	const transactionName = spanToJSON(getRootSpan(span)).description;
	if (transactionName && !event.transaction && event.type === "transaction") event.transaction = transactionName;
}
/**
* Applies fingerprint from the scope to the event if there's one,
* uses message if there's one instead or get rid of empty fingerprint
*/
function applyFingerprintToEvent(event, fingerprint) {
	event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [event.fingerprint] : [];
	if (fingerprint) event.fingerprint = event.fingerprint.concat(fingerprint);
	if (!event.fingerprint.length) delete event.fingerprint;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/debug-ids.js
var parsedStackResults;
var lastKeysCount;
var cachedFilenameDebugIds;
/**
* Returns a map of filenames to debug identifiers.
*/
function getFilenameToDebugIdMap(stackParser) {
	const debugIdMap = GLOBAL_OBJ._sentryDebugIds;
	if (!debugIdMap) return {};
	const debugIdKeys = Object.keys(debugIdMap);
	if (cachedFilenameDebugIds && debugIdKeys.length === lastKeysCount) return cachedFilenameDebugIds;
	lastKeysCount = debugIdKeys.length;
	cachedFilenameDebugIds = debugIdKeys.reduce((acc, stackKey) => {
		if (!parsedStackResults) parsedStackResults = {};
		const result = parsedStackResults[stackKey];
		if (result) acc[result[0]] = result[1];
		else {
			const parsedStack = stackParser(stackKey);
			for (let i = parsedStack.length - 1; i >= 0; i--) {
				const filename = parsedStack[i]?.filename;
				const debugId = debugIdMap[stackKey];
				if (filename && debugId) {
					acc[filename] = debugId;
					parsedStackResults[stackKey] = [filename, debugId];
					break;
				}
			}
		}
		return acc;
	}, {});
	return cachedFilenameDebugIds;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/prepareEvent.js
/**
* This type makes sure that we get either a CaptureContext, OR an EventHint.
* It does not allow mixing them, which could lead to unexpected outcomes, e.g. this is disallowed:
* { user: { id: '123' }, mechanism: { handled: false } }
*/
/**
* Adds common information to events.
*
* The information includes release and environment from `options`,
* breadcrumbs and context (extra, tags and user) from the scope.
*
* Information that is already present in the event is never overwritten. For
* nested objects, such as the context, keys are merged.
*
* @param event The original event.
* @param hint May contain additional information about the original exception.
* @param scope A scope containing event metadata.
* @returns A new event with more information.
* @hidden
*/
function prepareEvent(options, event, hint, scope, client, isolationScope) {
	const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = options;
	const prepared = {
		...event,
		event_id: event.event_id || hint.event_id || uuid4(),
		timestamp: event.timestamp || dateTimestampInSeconds()
	};
	const integrations = hint.integrations || options.integrations.map((i) => i.name);
	applyClientOptions(prepared, options);
	applyIntegrationsMetadata(prepared, integrations);
	if (client) client.emit("applyFrameMetadata", event);
	if (event.type === void 0) applyDebugIds(prepared, options.stackParser);
	const finalScope = getFinalScope(scope, hint.captureContext);
	if (hint.mechanism) addExceptionMechanism(prepared, hint.mechanism);
	const clientEventProcessors = client ? client.getEventProcessors() : [];
	const data = getGlobalScope().getScopeData();
	if (isolationScope) mergeScopeData(data, isolationScope.getScopeData());
	if (finalScope) mergeScopeData(data, finalScope.getScopeData());
	const attachments = [...hint.attachments || [], ...data.attachments];
	if (attachments.length) hint.attachments = attachments;
	applyScopeDataToEvent(prepared, data);
	return notifyEventProcessors([...clientEventProcessors, ...data.eventProcessors], prepared, hint).then((evt) => {
		if (evt) applyDebugMeta(evt);
		if (typeof normalizeDepth === "number" && normalizeDepth > 0) return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
		return evt;
	});
}
/**
* Enhances event using the client configuration.
* It takes care of all "static" values like environment, release and `dist`,
* as well as truncating overly long values.
*
* Only exported for tests.
*
* @param event event instance to be enhanced
*/
function applyClientOptions(event, options) {
	const { environment, release, dist, maxValueLength = 250 } = options;
	event.environment = event.environment || environment || "production";
	if (!event.release && release) event.release = release;
	if (!event.dist && dist) event.dist = dist;
	const request = event.request;
	if (request?.url) request.url = truncate(request.url, maxValueLength);
}
/**
* Puts debug IDs into the stack frames of an error event.
*/
function applyDebugIds(event, stackParser) {
	const filenameDebugIdMap = getFilenameToDebugIdMap(stackParser);
	event.exception?.values?.forEach((exception) => {
		exception.stacktrace?.frames?.forEach((frame) => {
			if (frame.filename) frame.debug_id = filenameDebugIdMap[frame.filename];
		});
	});
}
/**
* Moves debug IDs from the stack frames of an error event into the debug_meta field.
*/
function applyDebugMeta(event) {
	const filenameDebugIdMap = {};
	event.exception?.values?.forEach((exception) => {
		exception.stacktrace?.frames?.forEach((frame) => {
			if (frame.debug_id) {
				if (frame.abs_path) filenameDebugIdMap[frame.abs_path] = frame.debug_id;
				else if (frame.filename) filenameDebugIdMap[frame.filename] = frame.debug_id;
				delete frame.debug_id;
			}
		});
	});
	if (Object.keys(filenameDebugIdMap).length === 0) return;
	event.debug_meta = event.debug_meta || {};
	event.debug_meta.images = event.debug_meta.images || [];
	const images = event.debug_meta.images;
	Object.entries(filenameDebugIdMap).forEach(([filename, debug_id]) => {
		images.push({
			type: "sourcemap",
			code_file: filename,
			debug_id
		});
	});
}
/**
* This function adds all used integrations to the SDK info in the event.
* @param event The event that will be filled with all integrations.
*/
function applyIntegrationsMetadata(event, integrationNames) {
	if (integrationNames.length > 0) {
		event.sdk = event.sdk || {};
		event.sdk.integrations = [...event.sdk.integrations || [], ...integrationNames];
	}
}
/**
* Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
* Normalized keys:
* - `breadcrumbs.data`
* - `user`
* - `contexts`
* - `extra`
* @param event Event
* @returns Normalized event
*/
function normalizeEvent(event, depth, maxBreadth) {
	if (!event) return null;
	const normalized = {
		...event,
		...event.breadcrumbs && { breadcrumbs: event.breadcrumbs.map((b) => ({
			...b,
			...b.data && { data: normalize(b.data, depth, maxBreadth) }
		})) },
		...event.user && { user: normalize(event.user, depth, maxBreadth) },
		...event.contexts && { contexts: normalize(event.contexts, depth, maxBreadth) },
		...event.extra && { extra: normalize(event.extra, depth, maxBreadth) }
	};
	if (event.contexts?.trace && normalized.contexts) {
		normalized.contexts.trace = event.contexts.trace;
		if (event.contexts.trace.data) normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth);
	}
	if (event.spans) normalized.spans = event.spans.map((span) => {
		return {
			...span,
			...span.data && { data: normalize(span.data, depth, maxBreadth) }
		};
	});
	if (event.contexts?.flags && normalized.contexts) normalized.contexts.flags = normalize(event.contexts.flags, 3, maxBreadth);
	return normalized;
}
function getFinalScope(scope, captureContext) {
	if (!captureContext) return scope;
	const finalScope = scope ? scope.clone() : new Scope();
	finalScope.update(captureContext);
	return finalScope;
}
/**
* Parse either an `EventHint` directly, or convert a `CaptureContext` to an `EventHint`.
* This is used to allow to update method signatures that used to accept a `CaptureContext` but should now accept an `EventHint`.
*/
function parseEventHintOrCaptureContext(hint) {
	if (!hint) return;
	if (hintIsScopeOrFunction(hint)) return { captureContext: hint };
	if (hintIsScopeContext(hint)) return { captureContext: hint };
	return hint;
}
function hintIsScopeOrFunction(hint) {
	return hint instanceof Scope || typeof hint === "function";
}
var captureContextKeys = [
	"user",
	"level",
	"extra",
	"contexts",
	"tags",
	"fingerprint",
	"propagationContext"
];
function hintIsScopeContext(hint) {
	return Object.keys(hint).some((key) => captureContextKeys.includes(key));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/exports.js
/**
* Captures an exception event and sends it to Sentry.
*
* @param exception The exception to capture.
* @param hint Optional additional data to attach to the Sentry event.
* @returns the id of the captured Sentry event.
*/
function captureException(exception, hint) {
	return getCurrentScope().captureException(exception, parseEventHintOrCaptureContext(hint));
}
/**
* Captures a message event and sends it to Sentry.
*
* @param message The message to send to Sentry.
* @param captureContext Define the level of the message or pass in additional data to attach to the message.
* @returns the id of the captured message.
*/
function captureMessage(message, captureContext) {
	const level = typeof captureContext === "string" ? captureContext : void 0;
	const context = typeof captureContext !== "string" ? { captureContext } : void 0;
	return getCurrentScope().captureMessage(message, level, context);
}
/**
* Captures a manually created event and sends it to Sentry.
*
* @param event The event to send to Sentry.
* @param hint Optional additional data to attach to the Sentry event.
* @returns the id of the captured event.
*/
function captureEvent(event, hint) {
	return getCurrentScope().captureEvent(event, hint);
}
/**
* Set an object that will be merged sent as extra data with the event.
* @param extras Extras object to merge into current context.
*/
function setExtras(extras) {
	getIsolationScope().setExtras(extras);
}
/**
* Set an object that will be merged sent as tags data with the event.
* @param tags Tags context object to merge into current context.
*/
function setTags(tags) {
	getIsolationScope().setTags(tags);
}
/** If the SDK is initialized & enabled. */
function isEnabled() {
	const client = getClient();
	return client?.getOptions().enabled !== false && !!client?.getTransport();
}
/**
* Start a session on the current isolation scope.
*
* @param context (optional) additional properties to be applied to the returned session object
*
* @returns the new active session
*/
function startSession(context) {
	const isolationScope = getIsolationScope();
	const currentScope = getCurrentScope();
	const { userAgent } = GLOBAL_OBJ.navigator || {};
	const session = makeSession({
		user: currentScope.getUser() || isolationScope.getUser(),
		...userAgent && { userAgent },
		...context
	});
	const currentSession = isolationScope.getSession();
	if (currentSession?.status === "ok") updateSession(currentSession, { status: "exited" });
	endSession();
	isolationScope.setSession(session);
	return session;
}
/**
* End the session on the current isolation scope.
*/
function endSession() {
	const isolationScope = getIsolationScope();
	const session = getCurrentScope().getSession() || isolationScope.getSession();
	if (session) closeSession(session);
	_sendSessionUpdate();
	isolationScope.setSession();
}
/**
* Sends the current Session on the scope
*/
function _sendSessionUpdate() {
	const isolationScope = getIsolationScope();
	const client = getClient();
	const session = isolationScope.getSession();
	if (session && client) client.captureSession(session);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/api.js
var SENTRY_API_VERSION = "7";
/** Returns the prefix to construct Sentry ingestion API endpoints. */
function getBaseApiEndpoint(dsn) {
	const protocol = dsn.protocol ? `${dsn.protocol}:` : "";
	const port = dsn.port ? `:${dsn.port}` : "";
	return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ""}/api/`;
}
/** Returns the ingest API endpoint for target. */
function _getIngestEndpoint(dsn) {
	return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
}
/** Returns a URL-encoded string with auth config suitable for a query string. */
function _encodedAuth(dsn, sdkInfo) {
	const params = { sentry_version: SENTRY_API_VERSION };
	if (dsn.publicKey) params.sentry_key = dsn.publicKey;
	if (sdkInfo) params.sentry_client = `${sdkInfo.name}/${sdkInfo.version}`;
	return new URLSearchParams(params).toString();
}
/**
* Returns the envelope endpoint URL with auth in the query string.
*
* Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
*/
function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
	return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integration.js
var installedIntegrations = [];
/** Map of integrations assigned to a client */
/**
* Remove duplicates from the given array, preferring the last instance of any duplicate. Not guaranteed to
* preserve the order of integrations in the array.
*
* @private
*/
function filterDuplicates(integrations) {
	const integrationsByName = {};
	integrations.forEach((currentInstance) => {
		const { name } = currentInstance;
		const existingInstance = integrationsByName[name];
		if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) return;
		integrationsByName[name] = currentInstance;
	});
	return Object.values(integrationsByName);
}
/** Gets integrations to install */
function getIntegrationsToSetup(options) {
	const defaultIntegrations = options.defaultIntegrations || [];
	const userIntegrations = options.integrations;
	defaultIntegrations.forEach((integration) => {
		integration.isDefaultInstance = true;
	});
	let integrations;
	if (Array.isArray(userIntegrations)) integrations = [...defaultIntegrations, ...userIntegrations];
	else if (typeof userIntegrations === "function") {
		const resolvedUserIntegrations = userIntegrations(defaultIntegrations);
		integrations = Array.isArray(resolvedUserIntegrations) ? resolvedUserIntegrations : [resolvedUserIntegrations];
	} else integrations = defaultIntegrations;
	return filterDuplicates(integrations);
}
/**
* Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
* integrations are added unless they were already provided before.
* @param integrations array of integration instances
* @param withDefault should enable default integrations
*/
function setupIntegrations(client, integrations) {
	const integrationIndex = {};
	integrations.forEach((integration) => {
		if (integration) setupIntegration(client, integration, integrationIndex);
	});
	return integrationIndex;
}
/**
* Execute the `afterAllSetup` hooks of the given integrations.
*/
function afterSetupIntegrations(client, integrations) {
	for (const integration of integrations) if (integration?.afterAllSetup) integration.afterAllSetup(client);
}
/** Setup a single integration.  */
function setupIntegration(client, integration, integrationIndex) {
	if (integrationIndex[integration.name]) {
		DEBUG_BUILD && debug.log(`Integration skipped because it was already installed: ${integration.name}`);
		return;
	}
	integrationIndex[integration.name] = integration;
	if (installedIntegrations.indexOf(integration.name) === -1 && typeof integration.setupOnce === "function") {
		integration.setupOnce();
		installedIntegrations.push(integration.name);
	}
	if (integration.setup && typeof integration.setup === "function") integration.setup(client);
	if (typeof integration.preprocessEvent === "function") {
		const callback = integration.preprocessEvent.bind(integration);
		client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
	}
	if (typeof integration.processEvent === "function") {
		const callback = integration.processEvent.bind(integration);
		const processor = Object.assign((event, hint) => callback(event, hint, client), { id: integration.name });
		client.addEventProcessor(processor);
	}
	DEBUG_BUILD && debug.log(`Integration installed: ${integration.name}`);
}
/**
* Define an integration function that can be used to create an integration instance.
* Note that this by design hides the implementation details of the integration, as they are considered internal.
*/
function defineIntegration(fn) {
	return fn;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/clientreport.js
/**
* Creates client report envelope
* @param discarded_events An array of discard events
* @param dsn A DSN that can be set on the header. Optional.
*/
function createClientReportEnvelope(discarded_events, dsn, timestamp) {
	const clientReportItem = [{ type: "client_report" }, {
		timestamp: timestamp || dateTimestampInSeconds(),
		discarded_events
	}];
	return createEnvelope(dsn ? { dsn } : {}, [clientReportItem]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/eventUtils.js
/**
* Get a list of possible event messages from a Sentry event.
*/
function getPossibleEventMessages(event) {
	const possibleMessages = [];
	if (event.message) possibleMessages.push(event.message);
	try {
		const lastException = event.exception.values[event.exception.values.length - 1];
		if (lastException?.value) {
			possibleMessages.push(lastException.value);
			if (lastException.type) possibleMessages.push(`${lastException.type}: ${lastException.value}`);
		}
	} catch {}
	return possibleMessages;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/transactionEvent.js
/**
* Converts a transaction event to a span JSON object.
*/
function convertTransactionEventToSpanJson(event) {
	const { trace_id, parent_span_id, span_id, status, origin, data, op } = event.contexts?.trace ?? {};
	return {
		data: data ?? {},
		description: event.transaction,
		op,
		parent_span_id,
		span_id: span_id ?? "",
		start_timestamp: event.start_timestamp ?? 0,
		status,
		timestamp: event.timestamp,
		trace_id: trace_id ?? "",
		origin,
		profile_id: data?.[SEMANTIC_ATTRIBUTE_PROFILE_ID],
		exclusive_time: data?.[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
		measurements: event.measurements,
		is_segment: true
	};
}
/**
* Converts a span JSON object to a transaction event.
*/
function convertSpanJsonToTransactionEvent(span) {
	return {
		type: "transaction",
		timestamp: span.timestamp,
		start_timestamp: span.start_timestamp,
		transaction: span.description,
		contexts: { trace: {
			trace_id: span.trace_id,
			span_id: span.span_id,
			parent_span_id: span.parent_span_id,
			op: span.op,
			status: span.status,
			origin: span.origin,
			data: {
				...span.data,
				...span.profile_id && { ["sentry.profile_id"]: span.profile_id },
				...span.exclusive_time && { ["sentry.exclusive_time"]: span.exclusive_time }
			}
		} },
		measurements: span.measurements
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/client.js
var ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
var MISSING_RELEASE_FOR_SESSION_ERROR = "Discarded session because of missing or non-string release";
var INTERNAL_ERROR_SYMBOL = Symbol.for("SentryInternalError");
var DO_NOT_SEND_EVENT_SYMBOL = Symbol.for("SentryDoNotSendEventError");
function _makeInternalError(message) {
	return {
		message,
		[INTERNAL_ERROR_SYMBOL]: true
	};
}
function _makeDoNotSendEventError(message) {
	return {
		message,
		[DO_NOT_SEND_EVENT_SYMBOL]: true
	};
}
function _isInternalError(error) {
	return !!error && typeof error === "object" && INTERNAL_ERROR_SYMBOL in error;
}
function _isDoNotSendEventError(error) {
	return !!error && typeof error === "object" && DO_NOT_SEND_EVENT_SYMBOL in error;
}
/**
* Base implementation for all JavaScript SDK clients.
*
* Call the constructor with the corresponding options
* specific to the client subclass. To access these options later, use
* {@link Client.getOptions}.
*
* If a Dsn is specified in the options, it will be parsed and stored. Use
* {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
* invalid, the constructor will throw a {@link SentryException}. Note that
* without a valid Dsn, the SDK will not send any events to Sentry.
*
* Before sending an event, it is passed through
* {@link Client._prepareEvent} to add SDK information and scope data
* (breadcrumbs and context). To add more custom information, override this
* method and extend the resulting prepared event.
*
* To issue automatically created events (e.g. via instrumentation), use
* {@link Client.captureEvent}. It will prepare the event and pass it through
* the callback lifecycle. To issue auto-breadcrumbs, use
* {@link Client.addBreadcrumb}.
*
* @example
* class NodeClient extends Client<NodeOptions> {
*   public constructor(options: NodeOptions) {
*     super(options);
*   }
*
*   // ...
* }
*/
var Client = class {
	/** Options passed to the SDK. */
	/** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */
	/** Array of set up integrations. */
	/** Number of calls being processed */
	/** Holds flushable  */
	/**
	* Initializes this client instance.
	*
	* @param options Options for the client.
	*/
	constructor(options) {
		this._options = options;
		this._integrations = {};
		this._numProcessing = 0;
		this._outcomes = {};
		this._hooks = {};
		this._eventProcessors = [];
		if (options.dsn) this._dsn = makeDsn(options.dsn);
		else DEBUG_BUILD && debug.warn("No DSN provided, client will not send events.");
		if (this._dsn) {
			const url = getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options.tunnel, options._metadata ? options._metadata.sdk : void 0);
			this._transport = options.transport({
				tunnel: this._options.tunnel,
				recordDroppedEvent: this.recordDroppedEvent.bind(this),
				...options.transportOptions,
				url
			});
		}
	}
	/**
	* Captures an exception event and sends it to Sentry.
	*
	* Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
	*/
	captureException(exception, hint, scope) {
		const eventId = uuid4();
		if (checkOrSetAlreadyCaught(exception)) {
			DEBUG_BUILD && debug.log(ALREADY_SEEN_ERROR);
			return eventId;
		}
		const hintWithEventId = {
			event_id: eventId,
			...hint
		};
		this._process(this.eventFromException(exception, hintWithEventId).then((event) => this._captureEvent(event, hintWithEventId, scope)));
		return hintWithEventId.event_id;
	}
	/**
	* Captures a message event and sends it to Sentry.
	*
	* Unlike `captureMessage` exported from every SDK, this method requires that you pass it the current scope.
	*/
	captureMessage(message, level, hint, currentScope) {
		const hintWithEventId = {
			event_id: uuid4(),
			...hint
		};
		const eventMessage = isParameterizedString(message) ? message : String(message);
		const promisedEvent = isPrimitive(message) ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
		this._process(promisedEvent.then((event) => this._captureEvent(event, hintWithEventId, currentScope)));
		return hintWithEventId.event_id;
	}
	/**
	* Captures a manually created event and sends it to Sentry.
	*
	* Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
	*/
	captureEvent(event, hint, currentScope) {
		const eventId = uuid4();
		if (hint?.originalException && checkOrSetAlreadyCaught(hint.originalException)) {
			DEBUG_BUILD && debug.log(ALREADY_SEEN_ERROR);
			return eventId;
		}
		const hintWithEventId = {
			event_id: eventId,
			...hint
		};
		const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
		const capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
		const capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
		this._process(this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope, capturedSpanIsolationScope));
		return hintWithEventId.event_id;
	}
	/**
	* Captures a session.
	*/
	captureSession(session) {
		this.sendSession(session);
		updateSession(session, { init: false });
	}
	/**
	* Create a cron monitor check in and send it to Sentry. This method is not available on all clients.
	*
	* @param checkIn An object that describes a check in.
	* @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
	* to create a monitor automatically when sending a check in.
	* @param scope An optional scope containing event metadata.
	* @returns A string representing the id of the check in.
	*/
	/**
	* Get the current Dsn.
	*/
	getDsn() {
		return this._dsn;
	}
	/**
	* Get the current options.
	*/
	getOptions() {
		return this._options;
	}
	/**
	* Get the SDK metadata.
	* @see SdkMetadata
	*/
	getSdkMetadata() {
		return this._options._metadata;
	}
	/**
	* Returns the transport that is used by the client.
	* Please note that the transport gets lazy initialized so it will only be there once the first event has been sent.
	*/
	getTransport() {
		return this._transport;
	}
	/**
	* Wait for all events to be sent or the timeout to expire, whichever comes first.
	*
	* @param timeout Maximum time in ms the client should wait for events to be flushed. Omitting this parameter will
	*   cause the client to wait until all events are sent before resolving the promise.
	* @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
	* still events in the queue when the timeout is reached.
	*/
	flush(timeout) {
		const transport = this._transport;
		if (transport) {
			this.emit("flush");
			return this._isClientDoneProcessing(timeout).then((clientFinished) => {
				return transport.flush(timeout).then((transportFlushed) => clientFinished && transportFlushed);
			});
		} else return resolvedSyncPromise(true);
	}
	/**
	* Flush the event queue and set the client to `enabled = false`. See {@link Client.flush}.
	*
	* @param {number} timeout Maximum time in ms the client should wait before shutting down. Omitting this parameter will cause
	*   the client to wait until all events are sent before disabling itself.
	* @returns {Promise<boolean>} A promise which resolves to `true` if the flush completes successfully before the timeout, or `false` if
	* it doesn't.
	*/
	close(timeout) {
		return this.flush(timeout).then((result) => {
			this.getOptions().enabled = false;
			this.emit("close");
			return result;
		});
	}
	/**
	* Get all installed event processors.
	*/
	getEventProcessors() {
		return this._eventProcessors;
	}
	/**
	* Adds an event processor that applies to any event processed by this client.
	*/
	addEventProcessor(eventProcessor) {
		this._eventProcessors.push(eventProcessor);
	}
	/**
	* Initialize this client.
	* Call this after the client was set on a scope.
	*/
	init() {
		if (this._isEnabled() || this._options.integrations.some(({ name }) => name.startsWith("Spotlight"))) this._setupIntegrations();
	}
	/**
	* Gets an installed integration by its name.
	*
	* @returns {Integration|undefined} The installed integration or `undefined` if no integration with that `name` was installed.
	*/
	getIntegrationByName(integrationName) {
		return this._integrations[integrationName];
	}
	/**
	* Add an integration to the client.
	* This can be used to e.g. lazy load integrations.
	* In most cases, this should not be necessary,
	* and you're better off just passing the integrations via `integrations: []` at initialization time.
	* However, if you find the need to conditionally load & add an integration, you can use `addIntegration` to do so.
	*/
	addIntegration(integration) {
		const isAlreadyInstalled = this._integrations[integration.name];
		setupIntegration(this, integration, this._integrations);
		if (!isAlreadyInstalled) afterSetupIntegrations(this, [integration]);
	}
	/**
	* Send a fully prepared event to Sentry.
	*/
	sendEvent(event, hint = {}) {
		this.emit("beforeSendEvent", event, hint);
		let env = createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
		for (const attachment of hint.attachments || []) env = addItemToEnvelope(env, createAttachmentEnvelopeItem(attachment));
		const promise = this.sendEnvelope(env);
		if (promise) promise.then((sendResponse) => this.emit("afterSendEvent", event, sendResponse), null);
	}
	/**
	* Send a session or session aggregrates to Sentry.
	*/
	sendSession(session) {
		const { release: clientReleaseOption, environment: clientEnvironmentOption = DEFAULT_ENVIRONMENT } = this._options;
		if ("aggregates" in session) {
			const sessionAttrs = session.attrs || {};
			if (!sessionAttrs.release && !clientReleaseOption) {
				DEBUG_BUILD && debug.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
				return;
			}
			sessionAttrs.release = sessionAttrs.release || clientReleaseOption;
			sessionAttrs.environment = sessionAttrs.environment || clientEnvironmentOption;
			session.attrs = sessionAttrs;
		} else {
			if (!session.release && !clientReleaseOption) {
				DEBUG_BUILD && debug.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
				return;
			}
			session.release = session.release || clientReleaseOption;
			session.environment = session.environment || clientEnvironmentOption;
		}
		this.emit("beforeSendSession", session);
		const env = createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
		this.sendEnvelope(env);
	}
	/**
	* Record on the client that an event got dropped (ie, an event that will not be sent to Sentry).
	*/
	recordDroppedEvent(reason, category, count = 1) {
		if (this._options.sendClientReports) {
			const key = `${reason}:${category}`;
			DEBUG_BUILD && debug.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ""}`);
			this._outcomes[key] = (this._outcomes[key] || 0) + count;
		}
	}
	/**
	* Register a callback for whenever a span is started.
	* Receives the span as argument.
	* @returns {() => void} A function that, when executed, removes the registered callback.
	*/
	/**
	* Register a hook on this client.
	*/
	on(hook, callback) {
		const hooks = this._hooks[hook] = this._hooks[hook] || [];
		hooks.push(callback);
		return () => {
			const cbIndex = hooks.indexOf(callback);
			if (cbIndex > -1) hooks.splice(cbIndex, 1);
		};
	}
	/** Fire a hook whenever a span starts. */
	/**
	* Emit a hook that was previously registered via `on()`.
	*/
	emit(hook, ...rest) {
		const callbacks = this._hooks[hook];
		if (callbacks) callbacks.forEach((callback) => callback(...rest));
	}
	/**
	* Send an envelope to Sentry.
	*/
	sendEnvelope(envelope) {
		this.emit("beforeEnvelope", envelope);
		if (this._isEnabled() && this._transport) return this._transport.send(envelope).then(null, (reason) => {
			DEBUG_BUILD && debug.error("Error while sending envelope:", reason);
			return reason;
		});
		DEBUG_BUILD && debug.error("Transport disabled");
		return resolvedSyncPromise({});
	}
	/** Setup integrations for this client. */
	_setupIntegrations() {
		const { integrations } = this._options;
		this._integrations = setupIntegrations(this, integrations);
		afterSetupIntegrations(this, integrations);
	}
	/** Updates existing session based on the provided event */
	_updateSessionFromEvent(session, event) {
		let crashed = event.level === "fatal";
		let errored = false;
		const exceptions = event.exception?.values;
		if (exceptions) {
			errored = true;
			for (const ex of exceptions) if (ex.mechanism?.handled === false) {
				crashed = true;
				break;
			}
		}
		const sessionNonTerminal = session.status === "ok";
		if (sessionNonTerminal && session.errors === 0 || sessionNonTerminal && crashed) {
			updateSession(session, {
				...crashed && { status: "crashed" },
				errors: session.errors || Number(errored || crashed)
			});
			this.captureSession(session);
		}
	}
	/**
	* Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
	* "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
	*
	* @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
	* passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
	* `true`.
	* @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
	* `false` otherwise
	*/
	_isClientDoneProcessing(timeout) {
		return new SyncPromise((resolve) => {
			let ticked = 0;
			const tick = 1;
			const interval = setInterval(() => {
				if (this._numProcessing == 0) {
					clearInterval(interval);
					resolve(true);
				} else {
					ticked += tick;
					if (timeout && ticked >= timeout) {
						clearInterval(interval);
						resolve(false);
					}
				}
			}, tick);
		});
	}
	/** Determines whether this SDK is enabled and a transport is present. */
	_isEnabled() {
		return this.getOptions().enabled !== false && this._transport !== void 0;
	}
	/**
	* Adds common information to events.
	*
	* The information includes release and environment from `options`,
	* breadcrumbs and context (extra, tags and user) from the scope.
	*
	* Information that is already present in the event is never overwritten. For
	* nested objects, such as the context, keys are merged.
	*
	* @param event The original event.
	* @param hint May contain additional information about the original exception.
	* @param currentScope A scope containing event metadata.
	* @returns A new event with more information.
	*/
	_prepareEvent(event, hint, currentScope, isolationScope) {
		const options = this.getOptions();
		const integrations = Object.keys(this._integrations);
		if (!hint.integrations && integrations?.length) hint.integrations = integrations;
		this.emit("preprocessEvent", event, hint);
		if (!event.type) isolationScope.setLastEventId(event.event_id || hint.event_id);
		return prepareEvent(options, event, hint, currentScope, this, isolationScope).then((evt) => {
			if (evt === null) return evt;
			this.emit("postprocessEvent", evt, hint);
			evt.contexts = {
				trace: getTraceContextFromScope(currentScope),
				...evt.contexts
			};
			evt.sdkProcessingMetadata = {
				dynamicSamplingContext: getDynamicSamplingContextFromScope(this, currentScope),
				...evt.sdkProcessingMetadata
			};
			return evt;
		});
	}
	/**
	* Processes the event and logs an error in case of rejection
	* @param event
	* @param hint
	* @param scope
	*/
	_captureEvent(event, hint = {}, currentScope = getCurrentScope(), isolationScope = getIsolationScope()) {
		if (DEBUG_BUILD && isErrorEvent(event)) debug.log(`Captured error event \`${getPossibleEventMessages(event)[0] || "<unknown>"}\``);
		return this._processEvent(event, hint, currentScope, isolationScope).then((finalEvent) => {
			return finalEvent.event_id;
		}, (reason) => {
			if (DEBUG_BUILD) if (_isDoNotSendEventError(reason)) debug.log(reason.message);
			else if (_isInternalError(reason)) debug.warn(reason.message);
			else debug.warn(reason);
		});
	}
	/**
	* Processes an event (either error or message) and sends it to Sentry.
	*
	* This also adds breadcrumbs and context information to the event. However,
	* platform specific meta data (such as the User's IP address) must be added
	* by the SDK implementor.
	*
	*
	* @param event The event to send to Sentry.
	* @param hint May contain additional information about the original exception.
	* @param currentScope A scope containing event metadata.
	* @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
	*/
	_processEvent(event, hint, currentScope, isolationScope) {
		const options = this.getOptions();
		const { sampleRate } = options;
		const isTransaction = isTransactionEvent(event);
		const isError = isErrorEvent(event);
		const eventType = event.type || "error";
		const beforeSendLabel = `before send for type \`${eventType}\``;
		const parsedSampleRate = typeof sampleRate === "undefined" ? void 0 : parseSampleRate(sampleRate);
		if (isError && typeof parsedSampleRate === "number" && Math.random() > parsedSampleRate) {
			this.recordDroppedEvent("sample_rate", "error");
			return rejectedSyncPromise(_makeDoNotSendEventError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`));
		}
		const dataCategory = eventType === "replay_event" ? "replay" : eventType;
		return this._prepareEvent(event, hint, currentScope, isolationScope).then((prepared) => {
			if (prepared === null) {
				this.recordDroppedEvent("event_processor", dataCategory);
				throw _makeDoNotSendEventError("An event processor returned `null`, will not send event.");
			}
			if (hint.data && hint.data.__sentry__ === true) return prepared;
			return _validateBeforeSendResult(processBeforeSend(this, options, prepared, hint), beforeSendLabel);
		}).then((processedEvent) => {
			if (processedEvent === null) {
				this.recordDroppedEvent("before_send", dataCategory);
				if (isTransaction) {
					const spanCount = 1 + (event.spans || []).length;
					this.recordDroppedEvent("before_send", "span", spanCount);
				}
				throw _makeDoNotSendEventError(`${beforeSendLabel} returned \`null\`, will not send event.`);
			}
			const session = currentScope.getSession() || isolationScope.getSession();
			if (isError && session) this._updateSessionFromEvent(session, processedEvent);
			if (isTransaction) {
				const droppedSpanCount = (processedEvent.sdkProcessingMetadata?.spanCountBeforeProcessing || 0) - (processedEvent.spans ? processedEvent.spans.length : 0);
				if (droppedSpanCount > 0) this.recordDroppedEvent("before_send", "span", droppedSpanCount);
			}
			const transactionInfo = processedEvent.transaction_info;
			if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
				const source = "custom";
				processedEvent.transaction_info = {
					...transactionInfo,
					source
				};
			}
			this.sendEvent(processedEvent, hint);
			return processedEvent;
		}).then(null, (reason) => {
			if (_isDoNotSendEventError(reason) || _isInternalError(reason)) throw reason;
			this.captureException(reason, {
				data: { __sentry__: true },
				originalException: reason
			});
			throw _makeInternalError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${reason}`);
		});
	}
	/**
	* Occupies the client with processing and event
	*/
	_process(promise) {
		this._numProcessing++;
		promise.then((value) => {
			this._numProcessing--;
			return value;
		}, (reason) => {
			this._numProcessing--;
			return reason;
		});
	}
	/**
	* Clears outcomes on this client and returns them.
	*/
	_clearOutcomes() {
		const outcomes = this._outcomes;
		this._outcomes = {};
		return Object.entries(outcomes).map(([key, quantity]) => {
			const [reason, category] = key.split(":");
			return {
				reason,
				category,
				quantity
			};
		});
	}
	/**
	* Sends client reports as an envelope.
	*/
	_flushOutcomes() {
		DEBUG_BUILD && debug.log("Flushing outcomes...");
		const outcomes = this._clearOutcomes();
		if (outcomes.length === 0) {
			DEBUG_BUILD && debug.log("No outcomes to send");
			return;
		}
		if (!this._dsn) {
			DEBUG_BUILD && debug.log("No dsn provided, will not send outcomes");
			return;
		}
		DEBUG_BUILD && debug.log("Sending outcomes:", outcomes);
		const envelope = createClientReportEnvelope(outcomes, this._options.tunnel && dsnToString(this._dsn));
		this.sendEnvelope(envelope);
	}
};
/**
* Verifies that return value of configured `beforeSend` or `beforeSendTransaction` is of expected type, and returns the value if so.
*/
function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
	const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
	if (isThenable(beforeSendResult)) return beforeSendResult.then((event) => {
		if (!isPlainObject(event) && event !== null) throw _makeInternalError(invalidValueError);
		return event;
	}, (e) => {
		throw _makeInternalError(`${beforeSendLabel} rejected with ${e}`);
	});
	else if (!isPlainObject(beforeSendResult) && beforeSendResult !== null) throw _makeInternalError(invalidValueError);
	return beforeSendResult;
}
/**
* Process the matching `beforeSendXXX` callback.
*/
function processBeforeSend(client, options, event, hint) {
	const { beforeSend, beforeSendTransaction, beforeSendSpan } = options;
	let processedEvent = event;
	if (isErrorEvent(processedEvent) && beforeSend) return beforeSend(processedEvent, hint);
	if (isTransactionEvent(processedEvent)) {
		if (beforeSendSpan) {
			const processedRootSpanJson = beforeSendSpan(convertTransactionEventToSpanJson(processedEvent));
			if (!processedRootSpanJson) showSpanDropWarning();
			else processedEvent = merge(event, convertSpanJsonToTransactionEvent(processedRootSpanJson));
			if (processedEvent.spans) {
				const processedSpans = [];
				for (const span of processedEvent.spans) {
					const processedSpan = beforeSendSpan(span);
					if (!processedSpan) {
						showSpanDropWarning();
						processedSpans.push(span);
					} else processedSpans.push(processedSpan);
				}
				processedEvent.spans = processedSpans;
			}
		}
		if (beforeSendTransaction) {
			if (processedEvent.spans) {
				const spanCountBefore = processedEvent.spans.length;
				processedEvent.sdkProcessingMetadata = {
					...event.sdkProcessingMetadata,
					spanCountBeforeProcessing: spanCountBefore
				};
			}
			return beforeSendTransaction(processedEvent, hint);
		}
	}
	return processedEvent;
}
function isErrorEvent(event) {
	return event.type === void 0;
}
function isTransactionEvent(event) {
	return event.type === "transaction";
}
/** Extract trace information from scope */
function _getTraceInfoFromScope(client, scope) {
	if (!scope) return [void 0, void 0];
	return withScope(scope, () => {
		const span = getActiveSpan();
		const traceContext = span ? spanToTraceContext(span) : getTraceContextFromScope(scope);
		return [span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromScope(client, scope), traceContext];
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/checkin.js
/**
* Create envelope from check in item.
*/
function createCheckInEnvelope(checkIn, dynamicSamplingContext, metadata, tunnel, dsn) {
	const headers = { sent_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (metadata?.sdk) headers.sdk = {
		name: metadata.sdk.name,
		version: metadata.sdk.version
	};
	if (!!tunnel && !!dsn) headers.dsn = dsnToString(dsn);
	if (dynamicSamplingContext) headers.trace = dynamicSamplingContext;
	return createEnvelope(headers, [createCheckInEnvelopeItem(checkIn)]);
}
function createCheckInEnvelopeItem(checkIn) {
	return [{ type: "check_in" }, checkIn];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/envelope.js
/**
* Creates a log container envelope item for a list of logs.
*
* @param items - The logs to include in the envelope.
* @returns The created log container envelope item.
*/
function createLogContainerEnvelopeItem(items) {
	return [{
		type: "log",
		item_count: items.length,
		content_type: "application/vnd.sentry.items.log+json"
	}, { items }];
}
/**
* Creates an envelope for a list of logs.
*
* Logs from multiple traces can be included in the same envelope.
*
* @param logs - The logs to include in the envelope.
* @param metadata - The metadata to include in the envelope.
* @param tunnel - The tunnel to include in the envelope.
* @param dsn - The DSN to include in the envelope.
* @returns The created envelope.
*/
function createLogEnvelope(logs, metadata, tunnel, dsn) {
	const headers = {};
	if (metadata?.sdk) headers.sdk = {
		name: metadata.sdk.name,
		version: metadata.sdk.version
	};
	if (!!tunnel && !!dsn) headers.dsn = dsnToString(dsn);
	return createEnvelope(headers, [createLogContainerEnvelopeItem(logs)]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/exports.js
/**
* Flushes the logs buffer to Sentry.
*
* @param client - A client.
* @param maybeLogBuffer - A log buffer. Uses the log buffer for the given client if not provided.
*
* @experimental This method will experience breaking changes. This is not yet part of
* the stable Sentry SDK API and can be changed or removed without warning.
*/
function _INTERNAL_flushLogsBuffer(client, maybeLogBuffer) {
	const logBuffer = maybeLogBuffer ?? _INTERNAL_getLogBuffer(client) ?? [];
	if (logBuffer.length === 0) return;
	const clientOptions = client.getOptions();
	const envelope = createLogEnvelope(logBuffer, clientOptions._metadata, clientOptions.tunnel, client.getDsn());
	_getBufferMap().set(client, []);
	client.emit("flushLogs");
	client.sendEnvelope(envelope);
}
/**
* Returns the log buffer for a given client.
*
* Exported for testing purposes.
*
* @param client - The client to get the log buffer for.
* @returns The log buffer for the given client.
*/
function _INTERNAL_getLogBuffer(client) {
	return _getBufferMap().get(client);
}
function _getBufferMap() {
	return getGlobalSingleton("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/eventbuilder.js
/**
* Extracts stack frames from the error.stack string
*/
function parseStackFrames(stackParser, error) {
	return stackParser(error.stack || "", 1);
}
/**
* Extracts stack frames from the error and builds a Sentry Exception
*/
function exceptionFromError(stackParser, error) {
	const exception = {
		type: error.name || error.constructor.name,
		value: error.message
	};
	const frames = parseStackFrames(stackParser, error);
	if (frames.length) exception.stacktrace = { frames };
	return exception;
}
/** If a plain object has a property that is an `Error`, return this error. */
function getErrorPropertyFromObject(obj) {
	for (const prop in obj) if (Object.prototype.hasOwnProperty.call(obj, prop)) {
		const value = obj[prop];
		if (value instanceof Error) return value;
	}
}
function getMessageForObject(exception) {
	if ("name" in exception && typeof exception.name === "string") {
		let message = `'${exception.name}' captured as exception`;
		if ("message" in exception && typeof exception.message === "string") message += ` with message '${exception.message}'`;
		return message;
	} else if ("message" in exception && typeof exception.message === "string") return exception.message;
	const keys = extractExceptionKeysForMessage(exception);
	if (isErrorEvent$1(exception)) return `Event \`ErrorEvent\` captured as exception with message \`${exception.message}\``;
	const className = getObjectClassName(exception);
	return `${className && className !== "Object" ? `'${className}'` : "Object"} captured as exception with keys: ${keys}`;
}
function getObjectClassName(obj) {
	try {
		const prototype = Object.getPrototypeOf(obj);
		return prototype ? prototype.constructor.name : void 0;
	} catch {}
}
function getException(client, mechanism, exception, hint) {
	if (isError(exception)) return [exception, void 0];
	mechanism.synthetic = true;
	if (isPlainObject(exception)) {
		const normalizeDepth = client?.getOptions().normalizeDepth;
		const extras = { ["__serialized__"]: normalizeToSize(exception, normalizeDepth) };
		const errorFromProp = getErrorPropertyFromObject(exception);
		if (errorFromProp) return [errorFromProp, extras];
		const message = getMessageForObject(exception);
		const ex = hint?.syntheticException || new Error(message);
		ex.message = message;
		return [ex, extras];
	}
	const ex = hint?.syntheticException || new Error(exception);
	ex.message = `${exception}`;
	return [ex, void 0];
}
/**
* Builds and Event from a Exception
* @hidden
*/
function eventFromUnknownInput(client, stackParser, exception, hint) {
	const mechanism = hint?.data && hint.data.mechanism || {
		handled: true,
		type: "generic"
	};
	const [ex, extras] = getException(client, mechanism, exception, hint);
	const event = { exception: { values: [exceptionFromError(stackParser, ex)] } };
	if (extras) event.extra = extras;
	addExceptionTypeValue(event, void 0, void 0);
	addExceptionMechanism(event, mechanism);
	return {
		...event,
		event_id: hint?.event_id
	};
}
/**
* Builds and Event from a Message
* @hidden
*/
function eventFromMessage(stackParser, message, level = "info", hint, attachStacktrace) {
	const event = {
		event_id: hint?.event_id,
		level
	};
	if (attachStacktrace && hint?.syntheticException) {
		const frames = parseStackFrames(stackParser, hint.syntheticException);
		if (frames.length) {
			event.exception = { values: [{
				value: message,
				stacktrace: { frames }
			}] };
			addExceptionMechanism(event, { synthetic: true });
		}
	}
	if (isParameterizedString(message)) {
		const { __sentry_template_string__, __sentry_template_values__ } = message;
		event.logentry = {
			message: __sentry_template_string__,
			params: __sentry_template_values__
		};
		return event;
	}
	event.message = message;
	return event;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/server-runtime-client.js
var DEFAULT_LOG_FLUSH_INTERVAL = 5e3;
/**
* The Sentry Server Runtime Client SDK.
*/
var ServerRuntimeClient = class extends Client {
	/**
	* Creates a new Edge SDK instance.
	* @param options Configuration options for this SDK.
	*/
	constructor(options) {
		registerSpanErrorInstrumentation();
		super(options);
		this._logWeight = 0;
		this._isLogTimerActive = false;
		if (this._options.enableLogs ?? this._options._experiments?.enableLogs) {
			const client = this;
			client.on("flushLogs", () => {
				client._logWeight = 0;
				clearTimeout(client._logFlushIdleTimeout);
				client._isLogTimerActive = false;
			});
			client.on("afterCaptureLog", (log) => {
				client._logWeight += estimateLogSizeInBytes(log);
				if (client._logWeight >= 8e5) _INTERNAL_flushLogsBuffer(client);
				else if (!client._isLogTimerActive) {
					client._isLogTimerActive = true;
					client._logFlushIdleTimeout = setTimeout(() => {
						_INTERNAL_flushLogsBuffer(client);
					}, DEFAULT_LOG_FLUSH_INTERVAL);
				}
			});
			client.on("flush", () => {
				_INTERNAL_flushLogsBuffer(client);
			});
		}
	}
	/**
	* @inheritDoc
	*/
	eventFromException(exception, hint) {
		const event = eventFromUnknownInput(this, this._options.stackParser, exception, hint);
		event.level = "error";
		return resolvedSyncPromise(event);
	}
	/**
	* @inheritDoc
	*/
	eventFromMessage(message, level = "info", hint) {
		return resolvedSyncPromise(eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace));
	}
	/**
	* @inheritDoc
	*/
	captureException(exception, hint, scope) {
		setCurrentRequestSessionErroredOrCrashed(hint);
		return super.captureException(exception, hint, scope);
	}
	/**
	* @inheritDoc
	*/
	captureEvent(event, hint, scope) {
		if (!event.type && event.exception?.values && event.exception.values.length > 0) setCurrentRequestSessionErroredOrCrashed(hint);
		return super.captureEvent(event, hint, scope);
	}
	/**
	* Create a cron monitor check in and send it to Sentry.
	*
	* @param checkIn An object that describes a check in.
	* @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
	* to create a monitor automatically when sending a check in.
	*/
	captureCheckIn(checkIn, monitorConfig, scope) {
		const id = "checkInId" in checkIn && checkIn.checkInId ? checkIn.checkInId : uuid4();
		if (!this._isEnabled()) {
			DEBUG_BUILD && debug.warn("SDK not enabled, will not capture check-in.");
			return id;
		}
		const { release, environment, tunnel } = this.getOptions();
		const serializedCheckIn = {
			check_in_id: id,
			monitor_slug: checkIn.monitorSlug,
			status: checkIn.status,
			release,
			environment
		};
		if ("duration" in checkIn) serializedCheckIn.duration = checkIn.duration;
		if (monitorConfig) serializedCheckIn.monitor_config = {
			schedule: monitorConfig.schedule,
			checkin_margin: monitorConfig.checkinMargin,
			max_runtime: monitorConfig.maxRuntime,
			timezone: monitorConfig.timezone,
			failure_issue_threshold: monitorConfig.failureIssueThreshold,
			recovery_threshold: monitorConfig.recoveryThreshold
		};
		const [dynamicSamplingContext, traceContext] = _getTraceInfoFromScope(this, scope);
		if (traceContext) serializedCheckIn.contexts = { trace: traceContext };
		const envelope = createCheckInEnvelope(serializedCheckIn, dynamicSamplingContext, this.getSdkMetadata(), tunnel, this.getDsn());
		DEBUG_BUILD && debug.log("Sending checkin:", checkIn.monitorSlug, checkIn.status);
		this.sendEnvelope(envelope);
		return id;
	}
	/**
	* @inheritDoc
	*/
	_prepareEvent(event, hint, currentScope, isolationScope) {
		if (this._options.platform) event.platform = event.platform || this._options.platform;
		if (this._options.runtime) event.contexts = {
			...event.contexts,
			runtime: event.contexts?.runtime || this._options.runtime
		};
		if (this._options.serverName) event.server_name = event.server_name || this._options.serverName;
		return super._prepareEvent(event, hint, currentScope, isolationScope);
	}
};
function setCurrentRequestSessionErroredOrCrashed(eventHint) {
	const requestSession = getIsolationScope().getScopeData().sdkProcessingMetadata.requestSession;
	if (requestSession) {
		const isHandledException = eventHint?.mechanism?.handled ?? true;
		if (isHandledException && requestSession.status !== "crashed") requestSession.status = "errored";
		else if (!isHandledException) requestSession.status = "crashed";
	}
}
/**
* Estimate the size of a log in bytes.
*
* @param log - The log to estimate the size of.
* @returns The estimated size of the log in bytes.
*/
function estimateLogSizeInBytes(log) {
	let weight = 0;
	if (log.message) weight += log.message.length * 2;
	if (log.attributes) Object.values(log.attributes).forEach((value) => {
		if (Array.isArray(value)) weight += value.length * estimatePrimitiveSizeInBytes(value[0]);
		else if (isPrimitive(value)) weight += estimatePrimitiveSizeInBytes(value);
		else weight += 100;
	});
	return weight;
}
function estimatePrimitiveSizeInBytes(value) {
	if (typeof value === "string") return value.length * 2;
	else if (typeof value === "number") return 8;
	else if (typeof value === "boolean") return 4;
	return 0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/promisebuffer.js
var SENTRY_BUFFER_FULL_ERROR = Symbol.for("SentryBufferFullError");
/**
* Creates an new PromiseBuffer object with the specified limit
* @param limit max number of promises that can be stored in the buffer
*/
function makePromiseBuffer(limit) {
	const buffer = [];
	function isReady() {
		return limit === void 0 || buffer.length < limit;
	}
	/**
	* Remove a promise from the queue.
	*
	* @param task Can be any PromiseLike<T>
	* @returns Removed promise.
	*/
	function remove(task) {
		return buffer.splice(buffer.indexOf(task), 1)[0] || Promise.resolve(void 0);
	}
	/**
	* Add a promise (representing an in-flight action) to the queue, and set it to remove itself on fulfillment.
	*
	* @param taskProducer A function producing any PromiseLike<T>; In previous versions this used to be `task:
	*        PromiseLike<T>`, but under that model, Promises were instantly created on the call-site and their executor
	*        functions therefore ran immediately. Thus, even if the buffer was full, the action still happened. By
	*        requiring the promise to be wrapped in a function, we can defer promise creation until after the buffer
	*        limit check.
	* @returns The original promise.
	*/
	function add(taskProducer) {
		if (!isReady()) return rejectedSyncPromise(SENTRY_BUFFER_FULL_ERROR);
		const task = taskProducer();
		if (buffer.indexOf(task) === -1) buffer.push(task);
		task.then(() => remove(task)).then(null, () => remove(task).then(null, () => {}));
		return task;
	}
	/**
	* Wait for all promises in the queue to resolve or for timeout to expire, whichever comes first.
	*
	* @param timeout The time, in ms, after which to resolve to `false` if the queue is still non-empty. Passing `0` (or
	* not passing anything) will make the promise wait as long as it takes for the queue to drain before resolving to
	* `true`.
	* @returns A promise which will resolve to `true` if the queue is already empty or drains before the timeout, and
	* `false` otherwise
	*/
	function drain(timeout) {
		return new SyncPromise((resolve, reject) => {
			let counter = buffer.length;
			if (!counter) return resolve(true);
			const capturedSetTimeout = setTimeout(() => {
				if (timeout && timeout > 0) resolve(false);
			}, timeout);
			buffer.forEach((item) => {
				resolvedSyncPromise(item).then(() => {
					if (!--counter) {
						clearTimeout(capturedSetTimeout);
						resolve(true);
					}
				}, reject);
			});
		});
	}
	return {
		$: buffer,
		add,
		drain
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/ratelimit.js
var DEFAULT_RETRY_AFTER = 60 * 1e3;
/**
* Extracts Retry-After value from the request header or returns default value
* @param header string representation of 'Retry-After' header
* @param now current unix timestamp
*
*/
function parseRetryAfterHeader(header, now = Date.now()) {
	const headerDelay = parseInt(`${header}`, 10);
	if (!isNaN(headerDelay)) return headerDelay * 1e3;
	const headerDate = Date.parse(`${header}`);
	if (!isNaN(headerDate)) return headerDate - now;
	return DEFAULT_RETRY_AFTER;
}
/**
* Gets the time that the given category is disabled until for rate limiting.
* In case no category-specific limit is set but a general rate limit across all categories is active,
* that time is returned.
*
* @return the time in ms that the category is disabled until or 0 if there's no active rate limit.
*/
function disabledUntil(limits, dataCategory) {
	return limits[dataCategory] || limits.all || 0;
}
/**
* Checks if a category is rate limited
*/
function isRateLimited(limits, dataCategory, now = Date.now()) {
	return disabledUntil(limits, dataCategory) > now;
}
/**
* Update ratelimits from incoming headers.
*
* @return the updated RateLimits object.
*/
function updateRateLimits(limits, { statusCode, headers }, now = Date.now()) {
	const updatedRateLimits = { ...limits };
	const rateLimitHeader = headers?.["x-sentry-rate-limits"];
	const retryAfterHeader = headers?.["retry-after"];
	if (rateLimitHeader)
 /**
	* rate limit headers are of the form
	*     <header>,<header>,..
	* where each <header> is of the form
	*     <retry_after>: <categories>: <scope>: <reason_code>: <namespaces>
	* where
	*     <retry_after> is a delay in seconds
	*     <categories> is the event type(s) (error, transaction, etc) being rate limited and is of the form
	*         <category>;<category>;...
	*     <scope> is what's being limited (org, project, or key) - ignored by SDK
	*     <reason_code> is an arbitrary string like "org_quota" - ignored by SDK
	*     <namespaces> Semicolon-separated list of metric namespace identifiers. Defines which namespace(s) will be affected.
	*         Only present if rate limit applies to the metric_bucket data category.
	*/
	for (const limit of rateLimitHeader.trim().split(",")) {
		const [retryAfter, categories, , , namespaces] = limit.split(":", 5);
		const headerDelay = parseInt(retryAfter, 10);
		const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1e3;
		if (!categories) updatedRateLimits.all = now + delay;
		else for (const category of categories.split(";")) if (category === "metric_bucket") {
			if (!namespaces || namespaces.split(";").includes("custom")) updatedRateLimits[category] = now + delay;
		} else updatedRateLimits[category] = now + delay;
	}
	else if (retryAfterHeader) updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
	else if (statusCode === 429) updatedRateLimits.all = now + 60 * 1e3;
	return updatedRateLimits;
}
/**
* Creates an instance of a Sentry `Transport`
*
* @param options
* @param makeRequest
*/
function createTransport(options, makeRequest, buffer = makePromiseBuffer(options.bufferSize || 64)) {
	let rateLimits = {};
	const flush = (timeout) => buffer.drain(timeout);
	function send(envelope) {
		const filteredEnvelopeItems = [];
		forEachEnvelopeItem(envelope, (item, type) => {
			const dataCategory = envelopeItemTypeToDataCategory(type);
			if (isRateLimited(rateLimits, dataCategory)) options.recordDroppedEvent("ratelimit_backoff", dataCategory);
			else filteredEnvelopeItems.push(item);
		});
		if (filteredEnvelopeItems.length === 0) return resolvedSyncPromise({});
		const filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems);
		const recordEnvelopeLoss = (reason) => {
			forEachEnvelopeItem(filteredEnvelope, (item, type) => {
				options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type));
			});
		};
		const requestTask = () => makeRequest({ body: serializeEnvelope(filteredEnvelope) }).then((response) => {
			if (response.statusCode !== void 0 && (response.statusCode < 200 || response.statusCode >= 300)) DEBUG_BUILD && debug.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
			rateLimits = updateRateLimits(rateLimits, response);
			return response;
		}, (error) => {
			recordEnvelopeLoss("network_error");
			DEBUG_BUILD && debug.error("Encountered error running transport request:", error);
			throw error;
		});
		return buffer.add(requestTask).then((result) => result, (error) => {
			if (error === SENTRY_BUFFER_FULL_ERROR) {
				DEBUG_BUILD && debug.error("Skipped sending event because buffer is full.");
				recordEnvelopeLoss("queue_overflow");
				return resolvedSyncPromise({});
			} else throw error;
		});
	}
	return {
		send,
		flush
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/sdkMetadata.js
/**
* A builder for the SDK metadata in the options for the SDK initialization.
*
* Note: This function is identical to `buildMetadata` in Remix and NextJS and SvelteKit.
* We don't extract it for bundle size reasons.
* @see https://github.com/getsentry/sentry-javascript/pull/7404
* @see https://github.com/getsentry/sentry-javascript/pull/4196
*
* If you make changes to this function consider updating the others as well.
*
* @param options SDK options object that gets mutated
* @param names list of package names
*/
function applySdkMetadata(options, name, names = [name], source = "npm") {
	const metadata = options._metadata || {};
	if (!metadata.sdk) metadata.sdk = {
		name: `sentry.javascript.${name}`,
		packages: names.map((name) => ({
			name: `${source}:@sentry/${name}`,
			version: SDK_VERSION
		})),
		version: SDK_VERSION
	};
	options._metadata = metadata;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/traceData.js
/**
* Extracts trace propagation data from the current span or from the client's scope (via transaction or propagation
* context) and serializes it to `sentry-trace` and `baggage` values to strings. These values can be used to propagate
* a trace via our tracing Http headers or Html `<meta>` tags.
*
* This function also applies some validation to the generated sentry-trace and baggage values to ensure that
* only valid strings are returned.
*
* @returns an object with the tracing data values. The object keys are the name of the tracing key to be used as header
* or meta tag name.
*/
function getTraceData(options = {}) {
	const client = options.client || getClient();
	if (!isEnabled() || !client) return {};
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (acs.getTraceData) return acs.getTraceData(options);
	const scope = options.scope || getCurrentScope();
	const span = options.span || getActiveSpan();
	const sentryTrace = span ? spanToTraceHeader(span) : scopeToTraceHeader(scope);
	const baggage = dynamicSamplingContextToSentryBaggageHeader(span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromScope(client, scope));
	if (!TRACEPARENT_REGEXP.test(sentryTrace)) {
		debug.warn("Invalid sentry-trace data. Cannot generate trace data");
		return {};
	}
	return {
		"sentry-trace": sentryTrace,
		baggage
	};
}
/**
* Get a sentry-trace header value for the given scope.
*/
function scopeToTraceHeader(scope) {
	const { traceId, sampled, propagationSpanId } = scope.getPropagationContext();
	return generateSentryTraceHeader(traceId, propagationSpanId, sampled);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/debounce.js
/**
* Heavily simplified debounce function based on lodash.debounce.
*
* This function takes a callback function (@param fun) and delays its invocation
* by @param wait milliseconds. Optionally, a maxWait can be specified in @param options,
* which ensures that the callback is invoked at least once after the specified max. wait time.
*
* @param func the function whose invocation is to be debounced
* @param wait the minimum time until the function is invoked after it was called once
* @param options the options object, which can contain the `maxWait` property
*
* @returns the debounced version of the function, which needs to be called at least once to start the
*          debouncing process. Subsequent calls will reset the debouncing timer and, in case @paramfunc
*          was already invoked in the meantime, return @param func's return value.
*          The debounced function has two additional properties:
*          - `flush`: Invokes the debounced function immediately and returns its return value
*          - `cancel`: Cancels the debouncing process and resets the debouncing timer
*/
function debounce(func, wait, options) {
	let callbackReturnValue;
	let timerId;
	let maxTimerId;
	const maxWait = options?.maxWait ? Math.max(options.maxWait, wait) : 0;
	const setTimeoutImpl = options?.setTimeoutImpl || setTimeout;
	function invokeFunc() {
		cancelTimers();
		callbackReturnValue = func();
		return callbackReturnValue;
	}
	function cancelTimers() {
		timerId !== void 0 && clearTimeout(timerId);
		maxTimerId !== void 0 && clearTimeout(maxTimerId);
		timerId = maxTimerId = void 0;
	}
	function flush() {
		if (timerId !== void 0 || maxTimerId !== void 0) return invokeFunc();
		return callbackReturnValue;
	}
	function debounced() {
		if (timerId) clearTimeout(timerId);
		timerId = setTimeoutImpl(invokeFunc, wait);
		if (maxWait && maxTimerId === void 0) maxTimerId = setTimeoutImpl(invokeFunc, maxWait);
		return callbackReturnValue;
	}
	debounced.cancel = cancelTimers;
	debounced.flush = flush;
	return debounced;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/request.js
/**
* Convert common request headers to a simple dictionary.
*/
function headersToDict(reqHeaders) {
	const headers = Object.create(null);
	try {
		Object.entries(reqHeaders).forEach(([key, value]) => {
			if (typeof value === "string") headers[key] = value;
		});
	} catch {}
	return headers;
}
/**
* Convert a HTTP request object to RequestEventData to be passed as normalizedRequest.
* Instead of allowing `PolymorphicRequest` to be passed,
* we want to be more specific and generally require a http.IncomingMessage-like object.
*/
function httpRequestToRequestData(request) {
	const headers = request.headers || {};
	const host = (typeof headers["x-forwarded-host"] === "string" ? headers["x-forwarded-host"] : void 0) || (typeof headers.host === "string" ? headers.host : void 0);
	const protocol = (typeof headers["x-forwarded-proto"] === "string" ? headers["x-forwarded-proto"] : void 0) || request.protocol || (request.socket?.encrypted ? "https" : "http");
	const url = request.url || "";
	const absoluteUrl = getAbsoluteUrl({
		url,
		host,
		protocol
	});
	const data = request.body || void 0;
	const cookies = request.cookies;
	return {
		url: absoluteUrl,
		method: request.method,
		query_string: extractQueryParamsFromUrl(url),
		headers: headersToDict(headers),
		cookies,
		data
	};
}
function getAbsoluteUrl({ url, protocol, host }) {
	if (url?.startsWith("http")) return url;
	if (url && host) return `${protocol}://${host}${url}`;
}
/** Extract the query params from an URL. */
function extractQueryParamsFromUrl(url) {
	if (!url) return;
	try {
		const queryParams = new URL(url, "http://s.io").search.slice(1);
		return queryParams.length ? queryParams : void 0;
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/breadcrumbs.js
/**
* Default maximum number of breadcrumbs added to an event. Can be overwritten
* with {@link Options.maxBreadcrumbs}.
*/
var DEFAULT_BREADCRUMBS = 100;
/**
* Records a new breadcrumb which will be attached to future events.
*
* Breadcrumbs will be added to subsequent events to provide more context on
* user's actions prior to an error or crash.
*/
function addBreadcrumb(breadcrumb, hint) {
	const client = getClient();
	const isolationScope = getIsolationScope();
	if (!client) return;
	const { beforeBreadcrumb = null, maxBreadcrumbs = DEFAULT_BREADCRUMBS } = client.getOptions();
	if (maxBreadcrumbs <= 0) return;
	const mergedBreadcrumb = {
		timestamp: dateTimestampInSeconds(),
		...breadcrumb
	};
	const finalBreadcrumb = beforeBreadcrumb ? consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
	if (finalBreadcrumb === null) return;
	if (client.emit) client.emit("beforeAddBreadcrumb", finalBreadcrumb, hint);
	isolationScope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/functiontostring.js
var originalFunctionToString;
var INTEGRATION_NAME$4 = "FunctionToString";
var SETUP_CLIENTS = /* @__PURE__ */ new WeakMap();
var _functionToStringIntegration = (() => {
	return {
		name: INTEGRATION_NAME$4,
		setupOnce() {
			originalFunctionToString = Function.prototype.toString;
			try {
				Function.prototype.toString = function(...args) {
					const originalFunction = getOriginalFunction(this);
					const context = SETUP_CLIENTS.has(getClient()) && originalFunction !== void 0 ? originalFunction : this;
					return originalFunctionToString.apply(context, args);
				};
			} catch {}
		},
		setup(client) {
			SETUP_CLIENTS.set(client, true);
		}
	};
});
/**
* Patch toString calls to return proper name for wrapped functions.
*
* ```js
* Sentry.init({
*   integrations: [
*     functionToStringIntegration(),
*   ],
* });
* ```
*/
var functionToStringIntegration = defineIntegration(_functionToStringIntegration);
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/eventFilters.js
var DEFAULT_IGNORE_ERRORS = [
	/^Script error\.?$/,
	/^Javascript error: Script error\.? on line 0$/,
	/^ResizeObserver loop completed with undelivered notifications.$/,
	/^Cannot redefine property: googletag$/,
	/^Can't find variable: gmo$/,
	/^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
	"can't redefine non-configurable property \"solana\"",
	"vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)",
	"Can't find variable: _AutofillCallbackHandler",
	/^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/,
	/^Java exception was raised during method invocation$/
];
/** Options for the EventFilters integration */
var INTEGRATION_NAME$3 = "EventFilters";
/**
* An integration that filters out events (errors and transactions) based on:
*
* - (Errors) A curated list of known low-value or irrelevant errors (see {@link DEFAULT_IGNORE_ERRORS})
* - (Errors) A list of error messages or urls/filenames passed in via
*   - Top level Sentry.init options (`ignoreErrors`, `denyUrls`, `allowUrls`)
*   - The same options passed to the integration directly via @param options
* - (Transactions/Spans) A list of root span (transaction) names passed in via
*   - Top level Sentry.init option (`ignoreTransactions`)
*   - The same option passed to the integration directly via @param options
*
* Events filtered by this integration will not be sent to Sentry.
*/
var eventFiltersIntegration = defineIntegration((options = {}) => {
	let mergedOptions;
	return {
		name: INTEGRATION_NAME$3,
		setup(client) {
			mergedOptions = _mergeOptions(options, client.getOptions());
		},
		processEvent(event, _hint, client) {
			if (!mergedOptions) mergedOptions = _mergeOptions(options, client.getOptions());
			return _shouldDropEvent(event, mergedOptions) ? null : event;
		}
	};
});
/**
* An integration that filters out events (errors and transactions) based on:
*
* - (Errors) A curated list of known low-value or irrelevant errors (see {@link DEFAULT_IGNORE_ERRORS})
* - (Errors) A list of error messages or urls/filenames passed in via
*   - Top level Sentry.init options (`ignoreErrors`, `denyUrls`, `allowUrls`)
*   - The same options passed to the integration directly via @param options
* - (Transactions/Spans) A list of root span (transaction) names passed in via
*   - Top level Sentry.init option (`ignoreTransactions`)
*   - The same option passed to the integration directly via @param options
*
* Events filtered by this integration will not be sent to Sentry.
*
* @deprecated this integration was renamed and will be removed in a future major version.
* Use `eventFiltersIntegration` instead.
*/
var inboundFiltersIntegration = defineIntegration(((options = {}) => {
	return {
		...eventFiltersIntegration(options),
		name: "InboundFilters"
	};
}));
function _mergeOptions(internalOptions = {}, clientOptions = {}) {
	return {
		allowUrls: [...internalOptions.allowUrls || [], ...clientOptions.allowUrls || []],
		denyUrls: [...internalOptions.denyUrls || [], ...clientOptions.denyUrls || []],
		ignoreErrors: [
			...internalOptions.ignoreErrors || [],
			...clientOptions.ignoreErrors || [],
			...internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS
		],
		ignoreTransactions: [...internalOptions.ignoreTransactions || [], ...clientOptions.ignoreTransactions || []]
	};
}
function _shouldDropEvent(event, options) {
	if (!event.type) {
		if (_isIgnoredError(event, options.ignoreErrors)) {
			DEBUG_BUILD && debug.warn(`Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${getEventDescription(event)}`);
			return true;
		}
		if (_isUselessError(event)) {
			DEBUG_BUILD && debug.warn(`Event dropped due to not having an error message, error type or stacktrace.\nEvent: ${getEventDescription(event)}`);
			return true;
		}
		if (_isDeniedUrl(event, options.denyUrls)) {
			DEBUG_BUILD && debug.warn(`Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${_getEventFilterUrl(event)}`);
			return true;
		}
		if (!_isAllowedUrl(event, options.allowUrls)) {
			DEBUG_BUILD && debug.warn(`Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${getEventDescription(event)}.\nUrl: ${_getEventFilterUrl(event)}`);
			return true;
		}
	} else if (event.type === "transaction") {
		if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
			DEBUG_BUILD && debug.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.\nEvent: ${getEventDescription(event)}`);
			return true;
		}
	}
	return false;
}
function _isIgnoredError(event, ignoreErrors) {
	if (!ignoreErrors?.length) return false;
	return getPossibleEventMessages(event).some((message) => stringMatchesSomePattern(message, ignoreErrors));
}
function _isIgnoredTransaction(event, ignoreTransactions) {
	if (!ignoreTransactions?.length) return false;
	const name = event.transaction;
	return name ? stringMatchesSomePattern(name, ignoreTransactions) : false;
}
function _isDeniedUrl(event, denyUrls) {
	if (!denyUrls?.length) return false;
	const url = _getEventFilterUrl(event);
	return !url ? false : stringMatchesSomePattern(url, denyUrls);
}
function _isAllowedUrl(event, allowUrls) {
	if (!allowUrls?.length) return true;
	const url = _getEventFilterUrl(event);
	return !url ? true : stringMatchesSomePattern(url, allowUrls);
}
function _getLastValidUrl(frames = []) {
	for (let i = frames.length - 1; i >= 0; i--) {
		const frame = frames[i];
		if (frame && frame.filename !== "<anonymous>" && frame.filename !== "[native code]") return frame.filename || null;
	}
	return null;
}
function _getEventFilterUrl(event) {
	try {
		const frames = [...event.exception?.values ?? []].reverse().find((value) => value.mechanism?.parent_id === void 0 && value.stacktrace?.frames?.length)?.stacktrace?.frames;
		return frames ? _getLastValidUrl(frames) : null;
	} catch {
		DEBUG_BUILD && debug.error(`Cannot extract url for event ${getEventDescription(event)}`);
		return null;
	}
}
function _isUselessError(event) {
	if (!event.exception?.values?.length) return false;
	return !event.message && !event.exception.values.some((value) => value.stacktrace || value.type && value.type !== "Error" || value.value);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/aggregate-errors.js
/**
* Creates exceptions inside `event.exception.values` for errors that are nested on properties based on the `key` parameter.
*/
function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, key, limit, event, hint) {
	if (!event.exception?.values || !hint || !isInstanceOf(hint.originalException, Error)) return;
	const originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : void 0;
	if (originalException) event.exception.values = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, hint.originalException, key, event.exception.values, originalException, 0);
}
function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error, key, prevExceptions, exception, exceptionId) {
	if (prevExceptions.length >= limit + 1) return prevExceptions;
	let newExceptions = [...prevExceptions];
	if (isInstanceOf(error[key], Error)) {
		applyExceptionGroupFieldsForParentException(exception, exceptionId);
		const newException = exceptionFromErrorImplementation(parser, error[key]);
		const newExceptionId = newExceptions.length;
		applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
		newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error[key], key, [newException, ...newExceptions], newException, newExceptionId);
	}
	if (Array.isArray(error.errors)) error.errors.forEach((childError, i) => {
		if (isInstanceOf(childError, Error)) {
			applyExceptionGroupFieldsForParentException(exception, exceptionId);
			const newException = exceptionFromErrorImplementation(parser, childError);
			const newExceptionId = newExceptions.length;
			applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
			newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, childError, key, [newException, ...newExceptions], newException, newExceptionId);
		}
	});
	return newExceptions;
}
function applyExceptionGroupFieldsForParentException(exception, exceptionId) {
	exception.mechanism = exception.mechanism || {
		type: "generic",
		handled: true
	};
	exception.mechanism = {
		...exception.mechanism,
		...exception.type === "AggregateError" && { is_exception_group: true },
		exception_id: exceptionId
	};
}
function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
	exception.mechanism = exception.mechanism || {
		type: "generic",
		handled: true
	};
	exception.mechanism = {
		...exception.mechanism,
		type: "chained",
		source,
		exception_id: exceptionId,
		parent_id: parentId
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/linkederrors.js
var DEFAULT_KEY = "cause";
var DEFAULT_LIMIT = 5;
var INTEGRATION_NAME$2 = "LinkedErrors";
var _linkedErrorsIntegration = ((options = {}) => {
	const limit = options.limit || DEFAULT_LIMIT;
	const key = options.key || DEFAULT_KEY;
	return {
		name: INTEGRATION_NAME$2,
		preprocessEvent(event, hint, client) {
			applyAggregateErrorsToEvent(exceptionFromError, client.getOptions().stackParser, key, limit, event, hint);
		}
	};
});
var linkedErrorsIntegration = defineIntegration(_linkedErrorsIntegration);
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/cookie.js
/**
* This code was originally copied from the 'cookie` module at v0.5.0 and was simplified for our use case.
* https://github.com/jshttp/cookie/blob/a0c84147aab6266bdb3996cf4062e93907c0b0fc/index.js
* It had the following license:
*
* (The MIT License)
*
* Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
* Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* 'Software'), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
* Parses a cookie string
*/
function parseCookie(str) {
	const obj = {};
	let index = 0;
	while (index < str.length) {
		const eqIdx = str.indexOf("=", index);
		if (eqIdx === -1) break;
		let endIdx = str.indexOf(";", index);
		if (endIdx === -1) endIdx = str.length;
		else if (endIdx < eqIdx) {
			index = str.lastIndexOf(";", eqIdx - 1) + 1;
			continue;
		}
		const key = str.slice(index, eqIdx).trim();
		if (void 0 === obj[key]) {
			let val = str.slice(eqIdx + 1, endIdx).trim();
			if (val.charCodeAt(0) === 34) val = val.slice(1, -1);
			try {
				obj[key] = val.indexOf("%") !== -1 ? decodeURIComponent(val) : val;
			} catch {
				obj[key] = val;
			}
		}
		index = endIdx + 1;
	}
	return obj;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/vendor/getIpAddress.js
var ipHeaderNames = [
	"X-Client-IP",
	"X-Forwarded-For",
	"Fly-Client-IP",
	"CF-Connecting-IP",
	"Fastly-Client-Ip",
	"True-Client-Ip",
	"X-Real-IP",
	"X-Cluster-Client-IP",
	"X-Forwarded",
	"Forwarded-For",
	"Forwarded",
	"X-Vercel-Forwarded-For"
];
/**
* Get the IP address of the client sending a request.
*
* It receives a Request headers object and use it to get the
* IP address from one of the following headers in order.
*
* If the IP address is valid, it will be returned. Otherwise, null will be
* returned.
*
* If the header values contains more than one IP address, the first valid one
* will be returned.
*/
function getClientIPAddress(headers) {
	return ipHeaderNames.map((headerName) => {
		const rawValue = headers[headerName];
		const value = Array.isArray(rawValue) ? rawValue.join(";") : rawValue;
		if (headerName === "Forwarded") return parseForwardedHeader(value);
		return value?.split(",").map((v) => v.trim());
	}).reduce((acc, val) => {
		if (!val) return acc;
		return acc.concat(val);
	}, []).find((ip) => ip !== null && isIP(ip)) || null;
}
function parseForwardedHeader(value) {
	if (!value) return null;
	for (const part of value.split(";")) if (part.startsWith("for=")) return part.slice(4);
	return null;
}
/**
* Custom method instead of importing this from `net` package, as this only exists in node
* Accepts:
* 127.0.0.1
* 192.168.1.1
* 192.168.1.255
* 255.255.255.255
* 10.1.1.1
* 0.0.0.0
* 2b01:cb19:8350:ed00:d0dd:fa5b:de31:8be5
*
* Rejects:
* 1.1.1.01
* 30.168.1.255.1
* 127.1
* 192.168.1.256
* -1.2.3.4
* 1.1.1.1.
* 3...3
* 192.168.1.099
*/
function isIP(str) {
	return /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/.test(str);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/requestdata.js
var DEFAULT_INCLUDE = {
	cookies: true,
	data: true,
	headers: true,
	query_string: true,
	url: true
};
var INTEGRATION_NAME$1 = "RequestData";
var _requestDataIntegration = ((options = {}) => {
	const include = {
		...DEFAULT_INCLUDE,
		...options.include
	};
	return {
		name: INTEGRATION_NAME$1,
		processEvent(event, _hint, client) {
			const { sdkProcessingMetadata = {} } = event;
			const { normalizedRequest, ipAddress } = sdkProcessingMetadata;
			const includeWithDefaultPiiApplied = {
				...include,
				ip: include.ip ?? client.getOptions().sendDefaultPii
			};
			if (normalizedRequest) addNormalizedRequestDataToEvent(event, normalizedRequest, { ipAddress }, includeWithDefaultPiiApplied);
			return event;
		}
	};
});
/**
* Add data about a request to an event. Primarily for use in Node-based SDKs, but included in `@sentry/core`
* so it can be used in cross-platform SDKs like `@sentry/nextjs`.
*/
var requestDataIntegration = defineIntegration(_requestDataIntegration);
/**
* Add already normalized request data to an event.
* This mutates the passed in event.
*/
function addNormalizedRequestDataToEvent(event, req, additionalData, include) {
	event.request = {
		...event.request,
		...extractNormalizedRequestData(req, include)
	};
	if (include.ip) {
		const ip = req.headers && getClientIPAddress(req.headers) || additionalData.ipAddress;
		if (ip) event.user = {
			...event.user,
			ip_address: ip
		};
	}
}
function extractNormalizedRequestData(normalizedRequest, include) {
	const requestData = {};
	const headers = { ...normalizedRequest.headers };
	if (include.headers) {
		requestData.headers = headers;
		if (!include.cookies) delete headers.cookie;
		if (!include.ip) ipHeaderNames.forEach((ipHeaderName) => {
			delete headers[ipHeaderName];
		});
	}
	requestData.method = normalizedRequest.method;
	if (include.url) requestData.url = normalizedRequest.url;
	if (include.cookies) requestData.cookies = normalizedRequest.cookies || (headers?.cookie ? parseCookie(headers.cookie) : void 0) || {};
	if (include.query_string) requestData.query_string = normalizedRequest.query_string;
	if (include.data) requestData.data = normalizedRequest.data;
	return requestData;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/console.js
/**
* Add an instrumentation handler for when a console.xxx method is called.
*
* Use at your own risk, this might break without changelog notice, only used internally.
* @hidden
*/
function addConsoleInstrumentationHandler(handler) {
	const type = "console";
	addHandler(type, handler);
	maybeInstrument(type, instrumentConsole);
}
function instrumentConsole() {
	if (!("console" in GLOBAL_OBJ)) return;
	CONSOLE_LEVELS.forEach(function(level) {
		if (!(level in GLOBAL_OBJ.console)) return;
		fill(GLOBAL_OBJ.console, level, function(originalConsoleMethod) {
			originalConsoleMethods[level] = originalConsoleMethod;
			return function(...args) {
				triggerHandlers("console", {
					args,
					level
				});
				originalConsoleMethods[level]?.apply(GLOBAL_OBJ.console, args);
			};
		});
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/severity.js
/**
* Converts a string-based level into a `SeverityLevel`, normalizing it along the way.
*
* @param level String representation of desired `SeverityLevel`.
* @returns The `SeverityLevel` corresponding to the given string, or 'log' if the string isn't a valid level.
*/
function severityLevelFromString(level) {
	return level === "warn" ? "warning" : [
		"fatal",
		"error",
		"warning",
		"log",
		"info",
		"debug"
	].includes(level) ? level : "log";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/path.js
var splitPathRe = /^(\S+:\\|\/?)([\s\S]*?)((?:\.{1,2}|[^/\\]+?|)(\.[^./\\]*|))(?:[/\\]*)$/;
/** JSDoc */
function splitPath(filename) {
	const truncated = filename.length > 1024 ? `<truncated>${filename.slice(-1024)}` : filename;
	const parts = splitPathRe.exec(truncated);
	return parts ? parts.slice(1) : [];
}
/** JSDoc */
function dirname(path) {
	const result = splitPath(path);
	const root = result[0] || "";
	let dir = result[1];
	if (!root && !dir) return ".";
	if (dir) dir = dir.slice(0, dir.length - 1);
	return root + dir;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/console.js
var INTEGRATION_NAME = "Console";
/**
* Captures calls to the `console` API as breadcrumbs in Sentry.
*
* By default the integration instruments `console.debug`, `console.info`, `console.warn`, `console.error`,
* `console.log`, `console.trace`, and `console.assert`. You can use the `levels` option to customize which
* levels are captured.
*
* @example
*
* ```js
* Sentry.init({
*   integrations: [Sentry.consoleIntegration({ levels: ['error', 'warn'] })],
* });
* ```
*/
var consoleIntegration = defineIntegration((options = {}) => {
	const levels = new Set(options.levels || CONSOLE_LEVELS);
	return {
		name: INTEGRATION_NAME,
		setup(client) {
			addConsoleInstrumentationHandler(({ args, level }) => {
				if (getClient() !== client || !levels.has(level)) return;
				addConsoleBreadcrumb(level, args);
			});
		}
	};
});
/**
* Capture a console breadcrumb.
*
* Exported just for tests.
*/
function addConsoleBreadcrumb(level, args) {
	const breadcrumb = {
		category: "console",
		data: {
			arguments: args,
			logger: "console"
		},
		level: severityLevelFromString(level),
		message: formatConsoleArgs(args)
	};
	if (level === "assert") if (args[0] === false) {
		const assertionArgs = args.slice(1);
		breadcrumb.message = assertionArgs.length > 0 ? `Assertion failed: ${formatConsoleArgs(assertionArgs)}` : "Assertion failed";
		breadcrumb.data.arguments = assertionArgs;
	} else return;
	addBreadcrumb(breadcrumb, {
		input: args,
		level
	});
}
function formatConsoleArgs(values) {
	return "util" in GLOBAL_OBJ && typeof GLOBAL_OBJ.util.format === "function" ? GLOBAL_OBJ.util.format(...values) : safeJoin(values, " ");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/url.js
/**
* Parses string form of URL into an object
* // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
* // intentionally using regex and not <a/> href parsing trick because React Native and other
* // environments where DOM might not be available
* @returns parsed URL object
*/
function parseUrl(url) {
	if (!url) return {};
	const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
	if (!match) return {};
	const query = match[6] || "";
	const fragment = match[8] || "";
	return {
		host: match[4],
		path: match[5],
		protocol: match[2],
		search: query,
		hash: fragment,
		relative: match[5] + query + fragment
	};
}
/**
* Strip the query string and fragment off of a given URL or path (if present)
*
* @param urlPath Full URL or path, including possible query string and/or fragment
* @returns URL or path without query string or fragment
*/
function stripUrlQueryAndFragment(urlPath) {
	return urlPath.split(/[?#]/, 1)[0];
}
/**
* Takes a URL object and returns a sanitized string which is safe to use as span name
* see: https://develop.sentry.dev/sdk/data-handling/#structuring-data
*/
function getSanitizedUrlString(url) {
	const { protocol, host, path } = url;
	const filteredHost = host?.replace(/^.*@/, "[filtered]:[filtered]@").replace(/(:80)$/, "").replace(/(:443)$/, "") || "";
	return `${protocol ? `${protocol}://` : ""}${filteredHost}${path}`;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/vercel-ai-attributes.js
/**
* AI SDK Telemetry Attributes
* Based on https://ai-sdk.dev/docs/ai-sdk-core/telemetry#collected-data
*/
/**
* `generateText` function - `ai.generateText` span
* `streamText` function - `ai.streamText` span
*
* The prompt that was used when calling the function
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#generatetext-function
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#streamtext-function
*/
var AI_PROMPT_ATTRIBUTE = "ai.prompt";
/**
* `generateObject` function - `ai.generateObject` span
* `streamObject` function - `ai.streamObject` span
*
* The object that was generated (stringified JSON)
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#generateobject-function
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#streamobject-function
*/
var AI_RESPONSE_OBJECT_ATTRIBUTE = "ai.response.object";
/**
* `generateText` function - `ai.generateText` span
*
* The text that was generated
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#generatetext-function
*/
var AI_RESPONSE_TEXT_ATTRIBUTE = "ai.response.text";
/**
* `generateText` function - `ai.generateText` span
*
* The tool calls that were made as part of the generation (stringified JSON)
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#generatetext-function
*/
var AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "ai.response.toolCalls";
/**
* `generateText` function - `ai.generateText.doGenerate` span
*
* The messages that were passed into the provider
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#generatetext-function
*/
var AI_PROMPT_MESSAGES_ATTRIBUTE = "ai.prompt.messages";
/**
* `generateText` function - `ai.generateText.doGenerate` span
*
* Array of stringified tool definitions
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#generatetext-function
*/
var AI_PROMPT_TOOLS_ATTRIBUTE = "ai.prompt.tools";
/**
* Basic LLM span information
* Multiple spans
*
* The id of the model
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#basic-llm-span-information
*/
var AI_MODEL_ID_ATTRIBUTE = "ai.model.id";
/**
* Basic LLM span information
* Multiple spans
*
* The provider of the model
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#basic-llm-span-information
*/
var AI_MODEL_PROVIDER_ATTRIBUTE = "ai.model.provider";
/**
* Basic LLM span information
* Multiple spans
*
* Provider specific metadata returned with the generation response
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#basic-llm-span-information
*/
var AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE = "ai.response.providerMetadata";
/**
* Basic LLM span information
* Multiple spans
*
* The functionId that was set through `telemetry.functionId`
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#basic-llm-span-information
*/
var AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE = "ai.telemetry.functionId";
/**
* Basic LLM span information
* Multiple spans
*
* The number of completion tokens that were used
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#basic-llm-span-information
*/
var AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE = "ai.usage.completionTokens";
/**
* Basic LLM span information
* Multiple spans
*
* The number of prompt tokens that were used
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#basic-llm-span-information
*/
var AI_USAGE_PROMPT_TOKENS_ATTRIBUTE = "ai.usage.promptTokens";
/**
* Semantic Conventions for GenAI operations
* Individual LLM call spans
*
* The model that was used to generate the response
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#call-llm-span-information
*/
var GEN_AI_RESPONSE_MODEL_ATTRIBUTE$1 = "gen_ai.response.model";
/**
* Semantic Conventions for GenAI operations
* Individual LLM call spans
*
* The number of prompt tokens that were used
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#call-llm-span-information
*/
var GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE$1 = "gen_ai.usage.input_tokens";
/**
* Semantic Conventions for GenAI operations
* Individual LLM call spans
*
* The number of completion tokens that were used
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#call-llm-span-information
*/
var GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE$1 = "gen_ai.usage.output_tokens";
/**
* Tool call spans
* `ai.toolCall` span
*
* The name of the tool
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#tool-call-spans
*/
var AI_TOOL_CALL_NAME_ATTRIBUTE = "ai.toolCall.name";
/**
* Tool call spans
* `ai.toolCall` span
*
* The id of the tool call
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#tool-call-spans
*/
var AI_TOOL_CALL_ID_ATTRIBUTE = "ai.toolCall.id";
/**
* Tool call spans
* `ai.toolCall` span
*
* The parameters of the tool call
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#tool-call-spans
*/
var AI_TOOL_CALL_ARGS_ATTRIBUTE = "ai.toolCall.args";
/**
* Tool call spans
* `ai.toolCall` span
*
* The result of the tool call
* @see https://ai-sdk.dev/docs/ai-sdk-core/telemetry#tool-call-spans
*/
var AI_TOOL_CALL_RESULT_ATTRIBUTE = "ai.toolCall.result";
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/vercel-ai.js
function addOriginToSpan(span, origin) {
	span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, origin);
}
/**
* Post-process spans emitted by the Vercel AI SDK.
* This is supposed to be used in `client.on('spanStart', ...)
*/
function onVercelAiSpanStart(span) {
	const { data: attributes, description: name } = spanToJSON(span);
	if (!name) return;
	if (attributes["ai.toolCall.name"] && attributes["ai.toolCall.id"] && name === "ai.toolCall") {
		processToolCallSpan(span, attributes);
		return;
	}
	const aiModelId = attributes[AI_MODEL_ID_ATTRIBUTE];
	const aiModelProvider = attributes[AI_MODEL_PROVIDER_ATTRIBUTE];
	if (typeof aiModelId !== "string" || typeof aiModelProvider !== "string" || !aiModelId || !aiModelProvider) return;
	processGenerateSpan(span, name, attributes);
}
function vercelAiEventProcessor(event) {
	if (event.type === "transaction" && event.spans) for (const span of event.spans) processEndedVercelAiSpan(span);
	return event;
}
/**
* Post-process spans emitted by the Vercel AI SDK.
*/
function processEndedVercelAiSpan(span) {
	const { data: attributes, origin } = span;
	if (origin !== "auto.vercelai.otel") return;
	renameAttributeKey(attributes, AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE$1);
	renameAttributeKey(attributes, AI_USAGE_PROMPT_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE$1);
	if (typeof attributes["gen_ai.usage.output_tokens"] === "number" && typeof attributes["gen_ai.usage.input_tokens"] === "number") attributes["gen_ai.usage.total_tokens"] = attributes[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE$1] + attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE$1];
	renameAttributeKey(attributes, AI_PROMPT_MESSAGES_ATTRIBUTE, "gen_ai.request.messages");
	renameAttributeKey(attributes, AI_RESPONSE_TEXT_ATTRIBUTE, "gen_ai.response.text");
	renameAttributeKey(attributes, AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, "gen_ai.response.tool_calls");
	renameAttributeKey(attributes, AI_RESPONSE_OBJECT_ATTRIBUTE, "gen_ai.response.object");
	renameAttributeKey(attributes, AI_PROMPT_TOOLS_ATTRIBUTE, "gen_ai.request.available_tools");
	renameAttributeKey(attributes, AI_TOOL_CALL_ARGS_ATTRIBUTE, "gen_ai.tool.input");
	renameAttributeKey(attributes, AI_TOOL_CALL_RESULT_ATTRIBUTE, "gen_ai.tool.output");
	addProviderMetadataToAttributes(attributes);
	for (const key of Object.keys(attributes)) if (key.startsWith("ai.")) renameAttributeKey(attributes, key, `vercel.${key}`);
}
/**
* Renames an attribute key in the provided attributes object if the old key exists.
* This function safely handles null and undefined values.
*/
function renameAttributeKey(attributes, oldKey, newKey) {
	if (attributes[oldKey] != null) {
		attributes[newKey] = attributes[oldKey];
		delete attributes[oldKey];
	}
}
function processToolCallSpan(span, attributes) {
	addOriginToSpan(span, "auto.vercelai.otel");
	span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.execute_tool");
	renameAttributeKey(attributes, AI_TOOL_CALL_NAME_ATTRIBUTE, "gen_ai.tool.name");
	renameAttributeKey(attributes, AI_TOOL_CALL_ID_ATTRIBUTE, "gen_ai.tool.call.id");
	if (!attributes["gen_ai.tool.type"]) span.setAttribute("gen_ai.tool.type", "function");
	const toolName = attributes["gen_ai.tool.name"];
	if (toolName) span.updateName(`execute_tool ${toolName}`);
}
function processGenerateSpan(span, name, attributes) {
	addOriginToSpan(span, "auto.vercelai.otel");
	const nameWthoutAi = name.replace("ai.", "");
	span.setAttribute("ai.pipeline.name", nameWthoutAi);
	span.updateName(nameWthoutAi);
	const functionId = attributes[AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE];
	if (functionId && typeof functionId === "string" && name.split(".").length - 1 === 1) {
		span.updateName(`${nameWthoutAi} ${functionId}`);
		span.setAttribute("gen_ai.function_id", functionId);
	}
	if (attributes["ai.prompt"]) span.setAttribute("gen_ai.prompt", attributes[AI_PROMPT_ATTRIBUTE]);
	if (attributes["ai.model.id"] && !attributes["gen_ai.response.model"]) span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE$1, attributes[AI_MODEL_ID_ATTRIBUTE]);
	span.setAttribute("ai.streaming", name.includes("stream"));
	if (name === "ai.generateText") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.invoke_agent");
		return;
	}
	if (name === "ai.generateText.doGenerate") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.generate_text");
		span.updateName(`generate_text ${attributes[AI_MODEL_ID_ATTRIBUTE]}`);
		return;
	}
	if (name === "ai.streamText") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.invoke_agent");
		return;
	}
	if (name === "ai.streamText.doStream") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.stream_text");
		span.updateName(`stream_text ${attributes[AI_MODEL_ID_ATTRIBUTE]}`);
		return;
	}
	if (name === "ai.generateObject") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.invoke_agent");
		return;
	}
	if (name === "ai.generateObject.doGenerate") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.generate_object");
		span.updateName(`generate_object ${attributes[AI_MODEL_ID_ATTRIBUTE]}`);
		return;
	}
	if (name === "ai.streamObject") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.invoke_agent");
		return;
	}
	if (name === "ai.streamObject.doStream") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.stream_object");
		span.updateName(`stream_object ${attributes[AI_MODEL_ID_ATTRIBUTE]}`);
		return;
	}
	if (name === "ai.embed") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.invoke_agent");
		return;
	}
	if (name === "ai.embed.doEmbed") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.embed");
		span.updateName(`embed ${attributes[AI_MODEL_ID_ATTRIBUTE]}`);
		return;
	}
	if (name === "ai.embedMany") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.invoke_agent");
		return;
	}
	if (name === "ai.embedMany.doEmbed") {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.embed_many");
		span.updateName(`embed_many ${attributes[AI_MODEL_ID_ATTRIBUTE]}`);
		return;
	}
	if (name.startsWith("ai.stream")) {
		span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "ai.run");
		return;
	}
}
/**
* Add event processors to the given client to process Vercel AI spans.
*/
function addVercelAiProcessors(client) {
	client.on("spanStart", onVercelAiSpanStart);
	client.addEventProcessor(Object.assign(vercelAiEventProcessor, { id: "VercelAiEventProcessor" }));
}
function addProviderMetadataToAttributes(attributes) {
	const providerMetadata = attributes[AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE];
	if (providerMetadata) try {
		const providerMetadataObject = JSON.parse(providerMetadata);
		if (providerMetadataObject.openai) {
			setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cached", providerMetadataObject.openai.cachedPromptTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.reasoning", providerMetadataObject.openai.reasoningTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.prediction_accepted", providerMetadataObject.openai.acceptedPredictionTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.prediction_rejected", providerMetadataObject.openai.rejectedPredictionTokens);
			setAttributeIfDefined(attributes, "gen_ai.conversation.id", providerMetadataObject.openai.responseId);
		}
		if (providerMetadataObject.anthropic) {
			setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cached", providerMetadataObject.anthropic.cacheReadInputTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cache_write", providerMetadataObject.anthropic.cacheCreationInputTokens);
		}
		if (providerMetadataObject.bedrock?.usage) {
			setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cached", providerMetadataObject.bedrock.usage.cacheReadInputTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cache_write", providerMetadataObject.bedrock.usage.cacheWriteInputTokens);
		}
		if (providerMetadataObject.deepseek) {
			setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cached", providerMetadataObject.deepseek.promptCacheHitTokens);
			setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cache_miss", providerMetadataObject.deepseek.promptCacheMissTokens);
		}
	} catch {}
}
/**
* Sets an attribute only if the value is not null or undefined.
*/
function setAttributeIfDefined(attributes, key, value) {
	if (value != null) attributes[key] = value;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/gen-ai-attributes.js
/**
* OpenAI Integration Telemetry Attributes
* Based on OpenTelemetry Semantic Conventions for Generative AI
* @see https://opentelemetry.io/docs/specs/semconv/gen-ai/
*/
/**
* The Generative AI system being used
* For OpenAI, this should always be "openai"
*/
var GEN_AI_SYSTEM_ATTRIBUTE = "gen_ai.system";
/**
* The name of the model as requested
* Examples: "gpt-4", "gpt-3.5-turbo"
*/
var GEN_AI_REQUEST_MODEL_ATTRIBUTE = "gen_ai.request.model";
/**
* The temperature setting for the model request
*/
var GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE = "gen_ai.request.temperature";
/**
* The frequency penalty setting for the model request
*/
var GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE = "gen_ai.request.frequency_penalty";
/**
* The presence penalty setting for the model request
*/
var GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE = "gen_ai.request.presence_penalty";
/**
* The top_p (nucleus sampling) setting for the model request
*/
var GEN_AI_REQUEST_TOP_P_ATTRIBUTE = "gen_ai.request.top_p";
/**
* Array of reasons why the model stopped generating tokens
*/
var GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE = "gen_ai.response.finish_reasons";
/**
* The name of the model that generated the response
*/
var GEN_AI_RESPONSE_MODEL_ATTRIBUTE = "gen_ai.response.model";
/**
* The unique identifier for the response
*/
var GEN_AI_RESPONSE_ID_ATTRIBUTE = "gen_ai.response.id";
/**
* The number of tokens used in the prompt
*/
var GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.input_tokens";
/**
* The number of tokens used in the response
*/
var GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.output_tokens";
/**
* The total number of tokens used (input + output)
*/
var GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE = "gen_ai.usage.total_tokens";
/**
* The operation name for OpenAI API calls
*/
var GEN_AI_OPERATION_NAME_ATTRIBUTE = "gen_ai.operation.name";
/**
* The prompt messages sent to OpenAI (stringified JSON)
* Only recorded when recordInputs is enabled
*/
var GEN_AI_REQUEST_MESSAGES_ATTRIBUTE = "gen_ai.request.messages";
/**
* The response text from OpenAI (stringified JSON array)
* Only recorded when recordOutputs is enabled
*/
var GEN_AI_RESPONSE_TEXT_ATTRIBUTE = "gen_ai.response.text";
/**
* The response ID from OpenAI
*/
var OPENAI_RESPONSE_ID_ATTRIBUTE = "openai.response.id";
/**
* The response model from OpenAI
*/
var OPENAI_RESPONSE_MODEL_ATTRIBUTE = "openai.response.model";
/**
* The response timestamp from OpenAI (ISO string)
*/
var OPENAI_RESPONSE_TIMESTAMP_ATTRIBUTE = "openai.response.timestamp";
/**
* The number of completion tokens used (OpenAI specific)
*/
var OPENAI_USAGE_COMPLETION_TOKENS_ATTRIBUTE = "openai.usage.completion_tokens";
/**
* The number of prompt tokens used (OpenAI specific)
*/
var OPENAI_USAGE_PROMPT_TOKENS_ATTRIBUTE = "openai.usage.prompt_tokens";
/**
* OpenAI API operations
*/
var OPENAI_OPERATIONS = { CHAT: "chat" };
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/openai/constants.js
var OPENAI_INTEGRATION_NAME = "OpenAI";
var INSTRUMENTED_METHODS = ["responses.create", "chat.completions.create"];
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/openai/utils.js
/**
* Maps OpenAI method paths to Sentry operation names
*/
function getOperationName(methodPath) {
	if (methodPath.includes("chat.completions")) return OPENAI_OPERATIONS.CHAT;
	if (methodPath.includes("responses")) return OPENAI_OPERATIONS.CHAT;
	return methodPath.split(".").pop() || "unknown";
}
/**
* Get the span operation for OpenAI methods
* Following Sentry's convention: "gen_ai.{operation_name}"
*/
function getSpanOperation(methodPath) {
	return `gen_ai.${getOperationName(methodPath)}`;
}
/**
* Check if a method path should be instrumented
*/
function shouldInstrument(methodPath) {
	return INSTRUMENTED_METHODS.includes(methodPath);
}
/**
* Build method path from current traversal
*/
function buildMethodPath(currentPath, prop) {
	return currentPath ? `${currentPath}.${prop}` : prop;
}
/**
* Check if response is a Chat Completion object
*/
function isChatCompletionResponse(response) {
	return response !== null && typeof response === "object" && "object" in response && response.object === "chat.completion";
}
/**
* Check if response is a Responses API object
*/
function isResponsesApiResponse(response) {
	return response !== null && typeof response === "object" && "object" in response && response.object === "response";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/openai/index.js
/**
* Extract request attributes from method arguments
*/
function extractRequestAttributes(args, methodPath) {
	const attributes = {
		[GEN_AI_SYSTEM_ATTRIBUTE]: "openai",
		[GEN_AI_OPERATION_NAME_ATTRIBUTE]: getOperationName(methodPath)
	};
	if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
		const params = args[0];
		attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = params.model ?? "unknown";
		if ("temperature" in params) attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
		if ("top_p" in params) attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
		if ("frequency_penalty" in params) attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
		if ("presence_penalty" in params) attributes[GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = params.presence_penalty;
	} else attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
	return attributes;
}
/**
* Helper function to set token usage attributes
*/
function setTokenUsageAttributes(span, promptTokens, completionTokens, totalTokens) {
	if (promptTokens !== void 0) span.setAttributes({
		[OPENAI_USAGE_PROMPT_TOKENS_ATTRIBUTE]: promptTokens,
		[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: promptTokens
	});
	if (completionTokens !== void 0) span.setAttributes({
		[OPENAI_USAGE_COMPLETION_TOKENS_ATTRIBUTE]: completionTokens,
		[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: completionTokens
	});
	if (totalTokens !== void 0) span.setAttributes({ [GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: totalTokens });
}
/**
* Helper function to set common response attributes (ID, model, timestamp)
*/
function setCommonResponseAttributes(span, id, model, timestamp) {
	if (id) span.setAttributes({
		[OPENAI_RESPONSE_ID_ATTRIBUTE]: id,
		[GEN_AI_RESPONSE_ID_ATTRIBUTE]: id
	});
	if (model) span.setAttributes({
		[OPENAI_RESPONSE_MODEL_ATTRIBUTE]: model,
		[GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: model
	});
	if (timestamp) span.setAttributes({ [OPENAI_RESPONSE_TIMESTAMP_ATTRIBUTE]: (/* @__PURE__ */ new Date(timestamp * 1e3)).toISOString() });
}
/**
* Add attributes for Chat Completion responses
*/
function addChatCompletionAttributes(span, response) {
	setCommonResponseAttributes(span, response.id, response.model, response.created);
	if (response.usage) setTokenUsageAttributes(span, response.usage.prompt_tokens, response.usage.completion_tokens, response.usage.total_tokens);
	if (Array.isArray(response.choices)) {
		const finishReasons = response.choices.map((choice) => choice.finish_reason).filter((reason) => reason !== null);
		if (finishReasons.length > 0) span.setAttributes({ [GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]: JSON.stringify(finishReasons) });
	}
}
/**
* Add attributes for Responses API responses
*/
function addResponsesApiAttributes(span, response) {
	setCommonResponseAttributes(span, response.id, response.model, response.created_at);
	if (response.status) span.setAttributes({ [GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]: JSON.stringify([response.status]) });
	if (response.usage) setTokenUsageAttributes(span, response.usage.input_tokens, response.usage.output_tokens, response.usage.total_tokens);
}
/**
* Add response attributes to spans
* This currently supports both Chat Completion and Responses API responses
*/
function addResponseAttributes(span, result, recordOutputs) {
	if (!result || typeof result !== "object") return;
	const response = result;
	if (isChatCompletionResponse(response)) {
		addChatCompletionAttributes(span, response);
		if (recordOutputs && response.choices?.length) {
			const responseTexts = response.choices.map((choice) => choice.message?.content || "");
			span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: JSON.stringify(responseTexts) });
		}
	} else if (isResponsesApiResponse(response)) {
		addResponsesApiAttributes(span, response);
		if (recordOutputs && response.output_text) span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.output_text });
	}
}
function addRequestAttributes(span, params) {
	if ("messages" in params) span.setAttributes({ [GEN_AI_REQUEST_MESSAGES_ATTRIBUTE]: JSON.stringify(params.messages) });
	if ("input" in params) span.setAttributes({ [GEN_AI_REQUEST_MESSAGES_ATTRIBUTE]: JSON.stringify(params.input) });
}
function getOptionsFromIntegration() {
	const client = getCurrentScope().getClient();
	const integration = client?.getIntegrationByName(OPENAI_INTEGRATION_NAME);
	const shouldRecordInputsAndOutputs = integration ? Boolean(client?.getOptions().sendDefaultPii) : false;
	return {
		recordInputs: integration?.options?.recordInputs ?? shouldRecordInputsAndOutputs,
		recordOutputs: integration?.options?.recordOutputs ?? shouldRecordInputsAndOutputs
	};
}
/**
* Instrument a method with Sentry spans
* Following Sentry AI Agents Manual Instrumentation conventions
* @see https://docs.sentry.io/platforms/javascript/guides/node/tracing/instrumentation/ai-agents-module/#manual-instrumentation
*/
function instrumentMethod(originalMethod, methodPath, context, options) {
	return async function instrumentedMethod(...args) {
		const finalOptions = options || getOptionsFromIntegration();
		const requestAttributes = extractRequestAttributes(args, methodPath);
		const model = requestAttributes["gen_ai.request.model"] || "unknown";
		return startSpan({
			name: `${getOperationName(methodPath)} ${model}`,
			op: getSpanOperation(methodPath),
			attributes: requestAttributes
		}, async (span) => {
			try {
				if (finalOptions.recordInputs && args[0] && typeof args[0] === "object") addRequestAttributes(span, args[0]);
				const result = await originalMethod.apply(context, args);
				addResponseAttributes(span, result, finalOptions.recordOutputs);
				return result;
			} catch (error) {
				captureException(error);
				throw error;
			}
		});
	};
}
/**
* Create a deep proxy for OpenAI client instrumentation
*/
function createDeepProxy(target, currentPath = "", options) {
	return new Proxy(target, { get(obj, prop) {
		const value = obj[prop];
		const methodPath = buildMethodPath(currentPath, String(prop));
		if (typeof value === "function" && shouldInstrument(methodPath)) return instrumentMethod(value, methodPath, obj, options);
		if (typeof value === "function") return value.bind(obj);
		if (value && typeof value === "object") return createDeepProxy(value, methodPath, options);
		return value;
	} });
}
/**
* Instrument an OpenAI client with Sentry tracing
* Can be used across Node.js, Cloudflare Workers, and Vercel Edge
*/
function instrumentOpenAiClient(client, options) {
	return createDeepProxy(client, "", options);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/breadcrumb-log-level.js
/**
* Determine a breadcrumb's log level (only `warning` or `error`) based on an HTTP status code.
*/
function getBreadcrumbLogLevelFromHttpStatusCode(statusCode) {
	if (statusCode === void 0) return;
	else if (statusCode >= 400 && statusCode < 500) return "warning";
	else if (statusCode >= 500) return "error";
	else return;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/node-stack-trace.js
/**
* Does this filename look like it's part of the app code?
*/
function filenameIsInApp(filename, isNative = false) {
	return !(isNative || filename && !filename.startsWith("/") && !filename.match(/^[A-Z]:/) && !filename.startsWith(".") && !filename.match(/^[a-zA-Z]([a-zA-Z0-9.\-+])*:\/\//)) && filename !== void 0 && !filename.includes("node_modules/");
}
/** Node Stack line parser */
function node(getModule) {
	const FILENAME_MATCH = /^\s*[-]{4,}$/;
	const FULL_MATCH = /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;
	return (line) => {
		const lineMatch = line.match(FULL_MATCH);
		if (lineMatch) {
			let object;
			let method;
			let functionName;
			let typeName;
			let methodName;
			if (lineMatch[1]) {
				functionName = lineMatch[1];
				let methodStart = functionName.lastIndexOf(".");
				if (functionName[methodStart - 1] === ".") methodStart--;
				if (methodStart > 0) {
					object = functionName.slice(0, methodStart);
					method = functionName.slice(methodStart + 1);
					const objectEnd = object.indexOf(".Module");
					if (objectEnd > 0) {
						functionName = functionName.slice(objectEnd + 1);
						object = object.slice(0, objectEnd);
					}
				}
				typeName = void 0;
			}
			if (method) {
				typeName = object;
				methodName = method;
			}
			if (method === "<anonymous>") {
				methodName = void 0;
				functionName = void 0;
			}
			if (functionName === void 0) {
				methodName = methodName || "?";
				functionName = typeName ? `${typeName}.${methodName}` : methodName;
			}
			let filename = lineMatch[2]?.startsWith("file://") ? lineMatch[2].slice(7) : lineMatch[2];
			const isNative = lineMatch[5] === "native";
			if (filename?.match(/\/[A-Z]:/)) filename = filename.slice(1);
			if (!filename && lineMatch[5] && !isNative) filename = lineMatch[5];
			return {
				filename: filename ? decodeURI(filename) : void 0,
				module: getModule ? getModule(filename) : void 0,
				function: functionName,
				lineno: _parseIntOrUndefined(lineMatch[3]),
				colno: _parseIntOrUndefined(lineMatch[4]),
				in_app: filenameIsInApp(filename || "", isNative)
			};
		}
		if (line.match(FILENAME_MATCH)) return { filename: line };
	};
}
/**
* Node.js stack line parser
*
* This is in @sentry/core so it can be used from the Electron SDK in the browser for when `nodeIntegration == true`.
* This allows it to be used without referencing or importing any node specific code which causes bundlers to complain
*/
function nodeStackLineParser(getModule) {
	return [90, node(getModule)];
}
function _parseIntOrUndefined(input) {
	return parseInt(input || "", 10) || void 0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/lru.js
/** A simple Least Recently Used map */
var LRUMap = class {
	constructor(_maxSize) {
		this._maxSize = _maxSize;
		this._cache = /* @__PURE__ */ new Map();
	}
	/** Get the current size of the cache */
	get size() {
		return this._cache.size;
	}
	/** Get an entry or undefined if it was not in the cache. Re-inserts to update the recently used order */
	get(key) {
		const value = this._cache.get(key);
		if (value === void 0) return;
		this._cache.delete(key);
		this._cache.set(key, value);
		return value;
	}
	/** Insert an entry and evict an older entry if we've reached maxSize */
	set(key, value) {
		if (this._cache.size >= this._maxSize) this._cache.delete(this._cache.keys().next().value);
		this._cache.set(key, value);
	}
	/** Remove an entry and return the entry if it was in the cache */
	remove(key) {
		const value = this._cache.get(key);
		if (value) this._cache.delete(key);
		return value;
	}
	/** Clear all entries */
	clear() {
		this._cache.clear();
	}
	/** Get all the keys */
	keys() {
		return Array.from(this._cache.keys());
	}
	/** Get all the values */
	values() {
		const values = [];
		this._cache.forEach((value) => values.push(value));
		return values;
	}
};
//#endregion
export { generateSentryTraceHeader as $, setExtras as A, snipLine as At, logSpanStart as B, _INTERNAL_flushLogsBuffer as C, withScope as Ct, captureException as D, generateSpanId as Dt, captureEvent as E, getDefaultIsolationScope as Et, withActiveSpan as F, stackParserFromStackParserOptions as Ft, addChildSpanToSpan as G, getDynamicSamplingContextFromScope as H, sampleSpan as I, consoleSandbox as It, getRootSpan as J, convertSpanLinksForEnvelope as K, handleCallbackErrors as L, debug as Lt, startSession as M, truncate as Mt, startSpanManual as N, isError as Nt, captureMessage as O, parseSemver as Ot, suppressTracing as P, createStackParser as Pt, spanToTraceContext as Q, timedEventsToMeasurements as R, SDK_VERSION as Rt, ServerRuntimeClient as S, withIsolationScope as St, getIntegrationsToSetup as T, getDefaultCurrentScope as Tt, getDynamicSamplingContextFromSpan as U, serializeEnvelope as V, hasSpansEnabled as W, spanTimeInputToSeconds as X, getStatusMessage as Y, spanToJSON as Z, httpRequestToRequestData as _, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE as _t, OPENAI_INTEGRATION_NAME as a, objectToBaggageHeader as at, applySdkMetadata as b, getIsolationScope as bt, parseUrl as c, setCapturedScopesOnSpan as ct, dirname as d, SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE as dt, propagationContextFromHeaders as et, requestDataIntegration as f, SEMANTIC_ATTRIBUTE_CACHE_KEY as ft, addBreadcrumb as g, SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE as gt, functionToStringIntegration as h, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN as ht, instrumentOpenAiClient as i, dynamicSamplingContextToSentryBaggageHeader as it, setTags as j, stringMatchesSomePattern as jt, endSession as k, addNonEnumerableProperty as kt, stripUrlQueryAndFragment as l, getSpanStatusFromHttpCode as lt, inboundFiltersIntegration as m, SEMANTIC_ATTRIBUTE_SENTRY_OP as mt, nodeStackLineParser as n, SENTRY_BAGGAGE_KEY_PREFIX as nt, addVercelAiProcessors as o, parseBaggageHeader as ot, linkedErrorsIntegration as p, SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME as pt, getActiveSpan as q, getBreadcrumbLogLevelFromHttpStatusCode as r, baggageHeaderToDynamicSamplingContext as rt, getSanitizedUrlString as s, getCapturedScopesOnSpan as st, LRUMap as t, parseSampleRate as tt, consoleIntegration as u, SEMANTIC_ATTRIBUTE_CACHE_HIT as ut, debounce as v, getClient as vt, defineIntegration as w, setAsyncContextStrategy as wt, createTransport as x, getTraceContextFromScope as xt, getTraceData as y, getCurrentScope as yt, logSpanEnd as z, GLOBAL_OBJ as zt };
