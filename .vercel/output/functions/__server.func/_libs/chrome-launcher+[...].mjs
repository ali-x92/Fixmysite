import { i as __require, o as __toESM, r as __exportAll, t as __commonJSMin } from "../_runtime.mjs";
import path, { join } from "path";
import * as fs$1 from "fs";
import fs, { mkdirSync } from "fs";
import { EventEmitter } from "events";
import { homedir } from "os";
import process$1 from "process";
import childProcess, { execFileSync, execSync, spawn, spawnSync } from "child_process";
import * as net from "net";
import { createServer } from "http";
//#region node_modules/escape-string-regexp/index.js
var require_escape_string_regexp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = (string) => {
		if (typeof string !== "string") throw new TypeError("Expected a string");
		return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
	};
}));
//#endregion
//#region node_modules/ms/index.js
var require_ms = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Helpers.
	*/
	var s = 1e3;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	/**
	* Parse or format the given `val`.
	*
	* Options:
	*
	*  - `long` verbose formatting [false]
	*
	* @param {String|Number} val
	* @param {Object} [options]
	* @throws {Error} throw an error if val is not a non-empty string or a number
	* @return {String|Number}
	* @api public
	*/
	module.exports = function(val, options) {
		options = options || {};
		var type = typeof val;
		if (type === "string" && val.length > 0) return parse(val);
		else if (type === "number" && isFinite(val)) return options.long ? fmtLong(val) : fmtShort(val);
		throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
	};
	/**
	* Parse the given `str` and return milliseconds.
	*
	* @param {String} str
	* @return {Number}
	* @api private
	*/
	function parse(str) {
		str = String(str);
		if (str.length > 100) return;
		var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
		if (!match) return;
		var n = parseFloat(match[1]);
		switch ((match[2] || "ms").toLowerCase()) {
			case "years":
			case "year":
			case "yrs":
			case "yr":
			case "y": return n * y;
			case "weeks":
			case "week":
			case "w": return n * w;
			case "days":
			case "day":
			case "d": return n * d;
			case "hours":
			case "hour":
			case "hrs":
			case "hr":
			case "h": return n * h;
			case "minutes":
			case "minute":
			case "mins":
			case "min":
			case "m": return n * m;
			case "seconds":
			case "second":
			case "secs":
			case "sec":
			case "s": return n * s;
			case "milliseconds":
			case "millisecond":
			case "msecs":
			case "msec":
			case "ms": return n;
			default: return;
		}
	}
	/**
	* Short format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtShort(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return Math.round(ms / d) + "d";
		if (msAbs >= h) return Math.round(ms / h) + "h";
		if (msAbs >= m) return Math.round(ms / m) + "m";
		if (msAbs >= s) return Math.round(ms / s) + "s";
		return ms + "ms";
	}
	/**
	* Long format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtLong(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return plural(ms, msAbs, d, "day");
		if (msAbs >= h) return plural(ms, msAbs, h, "hour");
		if (msAbs >= m) return plural(ms, msAbs, m, "minute");
		if (msAbs >= s) return plural(ms, msAbs, s, "second");
		return ms + " ms";
	}
	/**
	* Pluralization helper.
	*/
	function plural(ms, msAbs, n, name) {
		var isPlural = msAbs >= n * 1.5;
		return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
	}
}));
//#endregion
//#region node_modules/debug/src/common.js
var require_common = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the common logic for both the Node.js and web browser
	* implementations of `debug()`.
	*/
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = require_ms();
		createDebug.destroy = destroy;
		Object.keys(env).forEach((key) => {
			createDebug[key] = env[key];
		});
		/**
		* The currently active debug mode names, and names to skip.
		*/
		createDebug.names = [];
		createDebug.skips = [];
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
			for (let i = 0; i < namespace.length; i++) {
				hash = (hash << 5) - hash + namespace.charCodeAt(i);
				hash |= 0;
			}
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
			function debug(...args) {
				if (!debug.enabled) return;
				const self = debug;
				const curr = Number(/* @__PURE__ */ new Date());
				self.diff = curr - (prevTime || curr);
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
				args[0] = createDebug.coerce(args[0]);
				if (typeof args[0] !== "string") args.unshift("%O");
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					if (match === "%%") return "%";
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === "function") {
						const val = args[index];
						match = formatter.call(self, val);
						args.splice(index, 1);
						index--;
					}
					return match;
				});
				createDebug.formatArgs.call(self, args);
				(self.log || createDebug.log).apply(self, args);
			}
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy;
			Object.defineProperty(debug, "enabled", {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) return enableOverride;
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
					return enabledCache;
				},
				set: (v) => {
					enableOverride = v;
				}
			});
			if (typeof createDebug.init === "function") createDebug.init(debug);
			return debug;
		}
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
			createDebug.names = [];
			createDebug.skips = [];
			const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
			for (const ns of split) if (ns[0] === "-") createDebug.skips.push(ns.slice(1));
			else createDebug.names.push(ns);
		}
		/**
		* Checks if the given string matches a namespace template, honoring
		* asterisks as wildcards.
		*
		* @param {String} search
		* @param {String} template
		* @return {Boolean}
		*/
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;
			while (searchIndex < search.length) if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) if (template[templateIndex] === "*") {
				starIndex = templateIndex;
				matchIndex = searchIndex;
				templateIndex++;
			} else {
				searchIndex++;
				templateIndex++;
			}
			else if (starIndex !== -1) {
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else return false;
			while (templateIndex < template.length && template[templateIndex] === "*") templateIndex++;
			return templateIndex === template.length;
		}
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [...createDebug.names, ...createDebug.skips.map((namespace) => "-" + namespace)].join(",");
			createDebug.enable("");
			return namespaces;
		}
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) if (matchesTemplate(name, skip)) return false;
			for (const ns of createDebug.names) if (matchesTemplate(name, ns)) return true;
			return false;
		}
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) return val.stack || val.message;
			return val;
		}
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
		}
		createDebug.enable(createDebug.load());
		return createDebug;
	}
	module.exports = setup;
}));
//#endregion
//#region node_modules/debug/src/browser.js
var require_browser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the web browser implementation of `debug()`.
	*/
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
		return () => {
			if (!warned) {
				warned = true;
				console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
			}
		};
	})();
	/**
	* Colors.
	*/
	exports.colors = [
		"#0000CC",
		"#0000FF",
		"#0033CC",
		"#0033FF",
		"#0066CC",
		"#0066FF",
		"#0099CC",
		"#0099FF",
		"#00CC00",
		"#00CC33",
		"#00CC66",
		"#00CC99",
		"#00CCCC",
		"#00CCFF",
		"#3300CC",
		"#3300FF",
		"#3333CC",
		"#3333FF",
		"#3366CC",
		"#3366FF",
		"#3399CC",
		"#3399FF",
		"#33CC00",
		"#33CC33",
		"#33CC66",
		"#33CC99",
		"#33CCCC",
		"#33CCFF",
		"#6600CC",
		"#6600FF",
		"#6633CC",
		"#6633FF",
		"#66CC00",
		"#66CC33",
		"#9900CC",
		"#9900FF",
		"#9933CC",
		"#9933FF",
		"#99CC00",
		"#99CC33",
		"#CC0000",
		"#CC0033",
		"#CC0066",
		"#CC0099",
		"#CC00CC",
		"#CC00FF",
		"#CC3300",
		"#CC3333",
		"#CC3366",
		"#CC3399",
		"#CC33CC",
		"#CC33FF",
		"#CC6600",
		"#CC6633",
		"#CC9900",
		"#CC9933",
		"#CCCC00",
		"#CCCC33",
		"#FF0000",
		"#FF0033",
		"#FF0066",
		"#FF0099",
		"#FF00CC",
		"#FF00FF",
		"#FF3300",
		"#FF3333",
		"#FF3366",
		"#FF3399",
		"#FF33CC",
		"#FF33FF",
		"#FF6600",
		"#FF6633",
		"#FF9900",
		"#FF9933",
		"#FFCC00",
		"#FFCC33"
	];
	/**
	* Currently only WebKit-based Web Inspectors, Firefox >= v31,
	* and the Firebug extension (any Firefox version) are known
	* to support "%c" CSS customizations.
	*
	* TODO: add a `localStorage` variable to explicitly enable/disable colors
	*/
	function useColors() {
		if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) return true;
		if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return false;
		let m;
		return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
	}
	/**
	* Colorize log arguments if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
		if (!this.useColors) return;
		const c = "color: " + this.color;
		args.splice(1, 0, c, "color: inherit");
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, (match) => {
			if (match === "%%") return;
			index++;
			if (match === "%c") lastC = index;
		});
		args.splice(lastC, 0, c);
	}
	/**
	* Invokes `console.debug()` when available.
	* No-op when `console.debug` is not a "function".
	* If `console.debug` is not available, falls back
	* to `console.log`.
	*
	* @api public
	*/
	exports.log = console.debug || console.log || (() => {});
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		try {
			if (namespaces) exports.storage.setItem("debug", namespaces);
			else exports.storage.removeItem("debug");
		} catch (error) {}
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		let r;
		try {
			r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
		} catch (error) {}
		if (!r && typeof process !== "undefined" && "env" in process) r = process.env.DEBUG;
		return r;
	}
	/**
	* Localstorage attempts to return the localstorage.
	*
	* This is necessary because safari throws
	* when a user disables cookies/localstorage
	* and you attempt to access it.
	*
	* @return {LocalStorage}
	* @api private
	*/
	function localstorage() {
		try {
			return localStorage;
		} catch (error) {}
	}
	module.exports = require_common()(exports);
	var { formatters } = module.exports;
	/**
	* Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	*/
	formatters.j = function(v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return "[UnexpectedJSONParseError]: " + error.message;
		}
	};
}));
//#endregion
//#region node_modules/has-flag/index.js
var require_has_flag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = (flag, argv = process.argv) => {
		const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf("--");
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
}));
//#endregion
//#region node_modules/supports-color/index.js
var require_supports_color = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var os$1 = __require("os");
	var tty$1 = __require("tty");
	var hasFlag = require_has_flag();
	var { env } = process;
	var forceColor;
	if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) forceColor = 0;
	else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) forceColor = 1;
	if ("FORCE_COLOR" in env) if (env.FORCE_COLOR === "true") forceColor = 1;
	else if (env.FORCE_COLOR === "false") forceColor = 0;
	else forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	function translateLevel(level) {
		if (level === 0) return false;
		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}
	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) return 0;
		if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) return 3;
		if (hasFlag("color=256")) return 2;
		if (haveStream && !streamIsTTY && forceColor === void 0) return 0;
		const min = forceColor || 0;
		if (env.TERM === "dumb") return min;
		if (process.platform === "win32") {
			const osRelease = os$1.release().split(".");
			if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) return Number(osRelease[2]) >= 14931 ? 3 : 2;
			return 1;
		}
		if ("CI" in env) {
			if ([
				"TRAVIS",
				"CIRCLECI",
				"APPVEYOR",
				"GITLAB_CI",
				"GITHUB_ACTIONS",
				"BUILDKITE"
			].some((sign) => sign in env) || env.CI_NAME === "codeship") return 1;
			return min;
		}
		if ("TEAMCITY_VERSION" in env) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		if (env.COLORTERM === "truecolor") return 3;
		if ("TERM_PROGRAM" in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
			switch (env.TERM_PROGRAM) {
				case "iTerm.app": return version >= 3 ? 3 : 2;
				case "Apple_Terminal": return 2;
			}
		}
		if (/-256(color)?$/i.test(env.TERM)) return 2;
		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) return 1;
		if ("COLORTERM" in env) return 1;
		return min;
	}
	function getSupportLevel(stream) {
		return translateLevel(supportsColor(stream, stream && stream.isTTY));
	}
	module.exports = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty$1.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty$1.isatty(2)))
	};
}));
//#endregion
//#region node_modules/debug/src/node.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module dependencies.
	*/
	var tty = __require("tty");
	var util = __require("util");
	/**
	* This is the Node.js implementation of `debug()`.
	*/
	exports.init = init;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.destroy = util.deprecate(() => {}, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
	/**
	* Colors.
	*/
	exports.colors = [
		6,
		2,
		3,
		4,
		5,
		1
	];
	try {
		const supportsColor = require_supports_color();
		if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	} catch (error) {}
	/**
	* Build up the default `inspectOpts` object from the environment variables.
	*
	*   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
	*/
	exports.inspectOpts = Object.keys(process.env).filter((key) => {
		return /^debug_/i.test(key);
	}).reduce((obj, key) => {
		const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});
		let val = process.env[key];
		if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
		else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
		else if (val === "null") val = null;
		else val = Number(val);
		obj[prop] = val;
		return obj;
	}, {});
	/**
	* Is stdout a TTY? Colored output is enabled when `true`.
	*/
	function useColors() {
		return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
	}
	/**
	* Adds ANSI color escape codes if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		const { namespace: name, useColors } = this;
		if (useColors) {
			const c = this.color;
			const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
			const prefix = `  ${colorCode};1m${name} \u001B[0m`;
			args[0] = prefix + args[0].split("\n").join("\n" + prefix);
			args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
		} else args[0] = getDate() + name + " " + args[0];
	}
	function getDate() {
		if (exports.inspectOpts.hideDate) return "";
		return (/* @__PURE__ */ new Date()).toISOString() + " ";
	}
	/**
	* Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
	*/
	function log(...args) {
		return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
	}
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		if (namespaces) process.env.DEBUG = namespaces;
		else delete process.env.DEBUG;
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		return process.env.DEBUG;
	}
	/**
	* Init logic for `debug` instances.
	*
	* Create a new `inspectOpts` object in case `useColors` is set
	* differently for a particular `debug` instance.
	*/
	function init(debug) {
		debug.inspectOpts = {};
		const keys = Object.keys(exports.inspectOpts);
		for (let i = 0; i < keys.length; i++) debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
	module.exports = require_common()(exports);
	var { formatters } = module.exports;
	/**
	* Map %o to `util.inspect()`, all on a single line.
	*/
	formatters.o = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
	};
	/**
	* Map %O to `util.inspect()`, allowing multiple lines if needed.
	*/
	formatters.O = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util.inspect(v, this.inspectOpts);
	};
}));
//#endregion
//#region node_modules/debug/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Detect Electron renderer / nwjs process, which is node, but we should
	* treat as a browser.
	*/
	if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) module.exports = require_browser();
	else module.exports = require_node();
}));
//#endregion
//#region node_modules/marky/lib/marky.es.js
var import_escape_string_regexp = /* @__PURE__ */ __toESM(require_escape_string_regexp(), 1);
var import_src = /* @__PURE__ */ __toESM(require_src(), 1);
var perf = typeof performance !== "undefined" && performance;
var nowPolyfillForNode;
var hrtime = process.hrtime;
var getNanoSeconds = function() {
	var hr = hrtime();
	return hr[0] * 1e9 + hr[1];
};
var loadTime = getNanoSeconds();
nowPolyfillForNode = function() {
	return (getNanoSeconds() - loadTime) / 1e6;
};
var now = perf && perf.now ? function() {
	return perf.now();
} : nowPolyfillForNode;
function throwIfEmpty(name) {
	if (!name) throw new Error("name must be non-empty");
}
function insertSorted(arr, item) {
	var low = 0;
	var high = arr.length;
	var mid;
	while (low < high) {
		mid = low + high >>> 1;
		if (arr[mid].startTime < item.startTime) low = mid + 1;
		else high = mid;
	}
	arr.splice(low, 0, item);
}
var mark;
var stop;
var getEntries;
var clear;
if (perf && perf.mark && perf.measure && perf.getEntriesByName && perf.getEntriesByType && perf.clearMarks && perf.clearMeasures && perf.clearResourceTimings) {
	mark = function(name) {
		throwIfEmpty(name);
		perf.mark("start " + name);
	};
	stop = function(name) {
		throwIfEmpty(name);
		perf.mark("end " + name);
		var measure = perf.measure(name, "start " + name, "end " + name);
		if (measure) return measure;
		var entries = perf.getEntriesByName(name);
		return entries[entries.length - 1];
	};
	getEntries = function() {
		return perf.getEntriesByType("measure");
	};
	clear = function() {
		perf.clearMarks();
		perf.clearMeasures();
	};
} else {
	var marks = {};
	var entries = [];
	mark = function(name) {
		throwIfEmpty(name);
		var startTime = now();
		marks["$" + name] = startTime;
	};
	stop = function(name) {
		throwIfEmpty(name);
		var endTime = now();
		var startTime = marks["$" + name];
		if (!startTime) throw new Error("no known mark: " + name);
		var entry = {
			startTime,
			name,
			duration: endTime - startTime,
			entryType: "measure"
		};
		insertSorted(entries, entry);
		return entry;
	};
	getEntries = function() {
		return entries;
	};
	clear = function() {
		marks = {};
		entries = [];
	};
}
//#endregion
//#region node_modules/lighthouse-logger/index.js
/**
* @license
* Copyright 2016 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
var isWindows$1 = process$1.platform === "win32";
var isBrowser = process$1.browser;
var colors = {
	red: isBrowser ? "crimson" : 1,
	yellow: isBrowser ? "gold" : 3,
	cyan: isBrowser ? "darkturquoise" : 6,
	green: isBrowser ? "forestgreen" : 2,
	blue: isBrowser ? "steelblue" : 4,
	magenta: isBrowser ? "palevioletred" : 5
};
import_src.default.colors = [
	colors.cyan,
	colors.green,
	colors.blue,
	colors.magenta
];
var Emitter = class extends EventEmitter {
	constructor(options) {
		super(options);
	}
	/**
	* Fires off all status updates. Listen with
	* `require('lib/log').events.addListener('status', callback)`
	* @param {string} title
	* @param {!Array<*>} argsArray
	*/
	issueStatus(title, argsArray) {
		if (title === "status" || title === "statusEnd") this.emit(title, [title, ...argsArray]);
	}
	/**
	* Fires off all warnings. Listen with
	* `require('lib/log').events.addListener('warning', callback)`
	* @param {string} title
	* @param {!Array<*>} argsArray
	*/
	issueWarning(title, argsArray) {
		this.emit("warning", [title, ...argsArray]);
	}
};
var loggersByTitle = {};
var loggingBufferColumns = 25;
var level_;
var Log = class Log {
	static _logToStdErr(title, argsArray) {
		Log.loggerfn(title)(...argsArray);
	}
	/**
	* @param {string} title
	*/
	static loggerfn(title) {
		title = `LH:${title}`;
		let log = loggersByTitle[title];
		if (!log) {
			log = (0, import_src.default)(title);
			loggersByTitle[title] = log;
			if (title.endsWith("error")) log.color = colors.red;
			else if (title.endsWith("warn")) log.color = colors.yellow;
		}
		return log;
	}
	/**
	* @param {string} level
	*/
	static setLevel(level) {
		level_ = level;
		switch (level) {
			case "silent":
				import_src.default.enable("-LH:*");
				break;
			case "verbose":
				import_src.default.enable("LH:*");
				break;
			case "warn":
				import_src.default.enable("-LH:*, LH:*:warn, LH:*:error");
				break;
			case "error":
				import_src.default.enable("-LH:*, LH:*:error");
				break;
			default: import_src.default.enable("LH:*, -LH:*:verbose");
		}
	}
	/**
	* A simple formatting utility for event logging.
	* @param {string} prefix
	* @param {!Object} data A JSON-serializable object of event data to log.
	* @param {string=} level Optional logging level. Defaults to 'log'.
	*/
	static formatProtocol(prefix, data, level) {
		const columns = !process$1 || process$1.browser ? Infinity : process$1.stdout.columns;
		const method = data.method || "?????";
		const maxLength = columns - method.length - prefix.length - loggingBufferColumns;
		const snippet = data.params && method !== "IO.read" ? JSON.stringify(data.params).substr(0, maxLength) : "";
		Log._logToStdErr(`${prefix}:${level || ""}`, [method, snippet]);
	}
	/**
	* @return {boolean}
	*/
	static isVerbose() {
		return level_ === "verbose";
	}
	/**
	* @param {{msg: string, id: string, args?: any[]}} status
	* @param {string} level
	*/
	static time({ msg, id, args = [] }, level = "log") {
		mark(id);
		Log[level]("status", msg, ...args);
	}
	/**
	* @param {{msg: string, id: string, args?: any[]}} status
	* @param {string} level
	*/
	static timeEnd({ msg, id, args = [] }, level = "verbose") {
		Log[level]("statusEnd", msg, ...args);
		stop(id);
	}
	/**
	* @param {string} title
	* @param {...any} args
	*/
	static log(title, ...args) {
		Log.events.issueStatus(title, args);
		return Log._logToStdErr(title, args);
	}
	/**
	* @param {string} title
	* @param {...any} args
	*/
	static warn(title, ...args) {
		Log.events.issueWarning(title, args);
		return Log._logToStdErr(`${title}:warn`, args);
	}
	/**
	* @param {string} title
	* @param {...any} args
	*/
	static error(title, ...args) {
		return Log._logToStdErr(`${title}:error`, args);
	}
	/**
	* @param {string} title
	* @param {...any} args
	*/
	static verbose(title, ...args) {
		Log.events.issueStatus(title, args);
		return Log._logToStdErr(`${title}:verbose`, args);
	}
	/**
	* Add surrounding escape sequences to turn a string green when logged.
	* @param {string} str
	* @return {string}
	*/
	static greenify(str) {
		return `${Log.green}${str}${Log.reset}`;
	}
	/**
	* Add surrounding escape sequences to turn a string red when logged.
	* @param {string} str
	* @return {string}
	*/
	static redify(str) {
		return `${Log.red}${str}${Log.reset}`;
	}
	static get green() {
		return "\x1B[32m";
	}
	static get red() {
		return "\x1B[31m";
	}
	static get yellow() {
		return "\x1B[33m";
	}
	static get purple() {
		return "\x1B[95m";
	}
	static get reset() {
		return "\x1B[0m";
	}
	static get bold() {
		return "\x1B[1m";
	}
	static get dim() {
		return "\x1B[2m";
	}
	static get tick() {
		return isWindows$1 ? "√" : "✓";
	}
	static get cross() {
		return isWindows$1 ? "×" : "✘";
	}
	static get whiteSmallSquare() {
		return isWindows$1 ? "·" : "▫";
	}
	static get heavyHorizontal() {
		return isWindows$1 ? "─" : "━";
	}
	static get heavyVertical() {
		return isWindows$1 ? "│ " : "┃ ";
	}
	static get heavyUpAndRight() {
		return isWindows$1 ? "└" : "┗";
	}
	static get heavyVerticalAndRight() {
		return isWindows$1 ? "├" : "┣";
	}
	static get heavyDownAndHorizontal() {
		return isWindows$1 ? "┬" : "┳";
	}
	static get doubleLightHorizontal() {
		return "──";
	}
};
Log.events = new Emitter();
/**
* @return {PerformanceEntry[]}
*/
Log.takeTimeEntries = () => {
	const entries = getEntries();
	clear();
	return entries;
};
/**
* @return {PerformanceEntry[]}
*/
Log.getTimeEntries = () => getEntries();
//#endregion
//#region node_modules/is-docker/index.js
var require_is_docker = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs$3 = __require("fs");
	var isDocker;
	function hasDockerEnv() {
		try {
			fs$3.statSync("/.dockerenv");
			return true;
		} catch (_) {
			return false;
		}
	}
	function hasDockerCGroup() {
		try {
			return fs$3.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
		} catch (_) {
			return false;
		}
	}
	module.exports = () => {
		if (isDocker === void 0) isDocker = hasDockerEnv() || hasDockerCGroup();
		return isDocker;
	};
}));
//#endregion
//#region node_modules/chrome-launcher/dist/utils.js
/**
* @license Copyright 2017 Google Inc. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
var import_is_wsl = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var os = __require("os");
	var fs$2 = __require("fs");
	var isDocker = require_is_docker();
	var isWsl = () => {
		if (process.platform !== "linux") return false;
		if (os.release().toLowerCase().includes("microsoft")) {
			if (isDocker()) return false;
			return true;
		}
		try {
			return fs$2.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft") ? !isDocker() : false;
		} catch (_) {
			return false;
		}
	};
	if (process.env.__IS_WSL_TEST__) module.exports = isWsl;
	else module.exports = isWsl();
})))(), 1);
function defaults(val, def) {
	return typeof val === "undefined" ? def : val;
}
async function delay(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
var LauncherError = class extends Error {
	constructor(message = "Unexpected error", code) {
		super();
		this.message = message;
		this.code = code;
		this.stack = (/* @__PURE__ */ new Error()).stack;
		return this;
	}
};
var ChromePathNotSetError = class extends LauncherError {
	constructor() {
		super(...arguments);
		this.message = "The CHROME_PATH environment variable must be set to a Chrome/Chromium executable no older than Chrome stable.";
		this.code = "ERR_LAUNCHER_PATH_NOT_SET";
	}
};
var InvalidUserDataDirectoryError = class extends LauncherError {
	constructor() {
		super(...arguments);
		this.message = "userDataDir must be false or a path.";
		this.code = "ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY";
	}
};
var UnsupportedPlatformError = class extends LauncherError {
	constructor() {
		super(...arguments);
		this.message = `Platform ${getPlatform()} is not supported.`;
		this.code = "ERR_LAUNCHER_UNSUPPORTED_PLATFORM";
	}
};
var ChromeNotInstalledError = class extends LauncherError {
	constructor() {
		super(...arguments);
		this.message = "No Chrome installations found.";
		this.code = "ERR_LAUNCHER_NOT_INSTALLED";
	}
};
function getPlatform() {
	return import_is_wsl.default ? "wsl" : process.platform;
}
function makeTmpDir() {
	switch (getPlatform()) {
		case "darwin":
		case "linux": return makeUnixTmpDir();
		case "wsl": process.env.TEMP = getWSLLocalAppDataPath(`${process.env.PATH}`);
		case "win32": return makeWin32TmpDir();
		default: throw new UnsupportedPlatformError();
	}
}
function toWinDirFormat(dir = "") {
	const results = /\/mnt\/([a-z])\//.exec(dir);
	if (!results) return dir;
	const driveLetter = results[1];
	return dir.replace(`/mnt/${driveLetter}/`, `${driveLetter.toUpperCase()}:\\`).replace(/\//g, "\\");
}
function toWin32Path(dir = "") {
	if (/[a-z]:\\/iu.test(dir)) return dir;
	try {
		return childProcess.execFileSync("wslpath", ["-w", dir]).toString().trim();
	} catch {
		return toWinDirFormat(dir);
	}
}
function toWSLPath(dir, fallback) {
	try {
		return childProcess.execFileSync("wslpath", ["-u", dir]).toString().trim();
	} catch {
		return fallback;
	}
}
function getLocalAppDataPath(path) {
	const results = /\/mnt\/([a-z])\/Users\/([^\/:]+)\/AppData\//.exec(path) || [];
	return `/mnt/${results[1]}/Users/${results[2]}/AppData/Local`;
}
function getWSLLocalAppDataPath(path) {
	const results = /\/([a-z])\/Users\/([^\/:]+)\/AppData\//.exec(path) || [];
	return toWSLPath(`${results[1]}:\\Users\\${results[2]}\\AppData\\Local`, getLocalAppDataPath(path));
}
function makeUnixTmpDir() {
	return childProcess.execSync("mktemp -d -t lighthouse.XXXXXXX").toString().trim();
}
function makeWin32TmpDir() {
	const tmpdir = join(process.env.TEMP || process.env.TMP || (process.env.SystemRoot || process.env.windir) + "\\temp", "lighthouse." + Math.floor(Math.random() * 9e7 + 1e7));
	mkdirSync(tmpdir, { recursive: true });
	return tmpdir;
}
//#endregion
//#region node_modules/chrome-launcher/dist/chrome-finder.js
/**
* @license Copyright 2016 Google Inc. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
var chrome_finder_exports = /* @__PURE__ */ __exportAll({
	darwin: () => darwin,
	darwinFast: () => darwinFast,
	linux: () => linux,
	win32: () => win32,
	wsl: () => wsl
});
var newLineRegex = /\r?\n/;
/**
* check for MacOS default app paths first to avoid waiting for the slow lsregister command
*/
function darwinFast() {
	const priorityOptions = [
		process.env.CHROME_PATH,
		process.env.LIGHTHOUSE_CHROMIUM_PATH,
		"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
	];
	for (const chromePath of priorityOptions) if (chromePath && canAccess(chromePath)) return chromePath;
	return darwin()[0];
}
function darwin() {
	const suffixes = ["/Contents/MacOS/Google Chrome Canary", "/Contents/MacOS/Google Chrome"];
	const LSREGISTER = "/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister";
	const installations = [];
	const customChromePath = resolveChromePath();
	if (customChromePath) installations.push(customChromePath);
	execSync(`${LSREGISTER} -dump | grep -i 'google chrome\\( canary\\)\\?\\.app' | awk '{\$1=""; print \$0}'`).toString().split(newLineRegex).forEach((inst) => {
		suffixes.forEach((suffix) => {
			const execPath = path.join(inst.substring(0, inst.indexOf(".app") + 4).trim(), suffix);
			if (canAccess(execPath) && installations.indexOf(execPath) === -1) installations.push(execPath);
		});
	});
	const home = (0, import_escape_string_regexp.default)(process.env.HOME || homedir());
	const priorities = [
		{
			regex: new RegExp(`^${home}/Applications/.*Chrome\\.app`),
			weight: 50
		},
		{
			regex: new RegExp(`^${home}/Applications/.*Chrome Canary\\.app`),
			weight: 51
		},
		{
			regex: /^\/Applications\/.*Chrome.app/,
			weight: 100
		},
		{
			regex: /^\/Applications\/.*Chrome Canary.app/,
			weight: 101
		},
		{
			regex: /^\/Volumes\/.*Chrome.app/,
			weight: -2
		},
		{
			regex: /^\/Volumes\/.*Chrome Canary.app/,
			weight: -1
		}
	];
	if (process.env.LIGHTHOUSE_CHROMIUM_PATH) priorities.unshift({
		regex: new RegExp((0, import_escape_string_regexp.default)(process.env.LIGHTHOUSE_CHROMIUM_PATH)),
		weight: 150
	});
	if (process.env.CHROME_PATH) priorities.unshift({
		regex: new RegExp((0, import_escape_string_regexp.default)(process.env.CHROME_PATH)),
		weight: 151
	});
	return sort(installations, priorities);
}
function resolveChromePath() {
	if (canAccess(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
	if (canAccess(process.env.LIGHTHOUSE_CHROMIUM_PATH)) {
		Log.warn("ChromeLauncher", "LIGHTHOUSE_CHROMIUM_PATH is deprecated, use CHROME_PATH env variable instead.");
		return process.env.LIGHTHOUSE_CHROMIUM_PATH;
	}
}
/**
* Look for linux executables in 3 ways
* 1. Look into CHROME_PATH env variable
* 2. Look into the directories where .desktop are saved on gnome based distro's
* 3. Look for google-chrome-stable & google-chrome executables by using the which command
*/
function linux() {
	let installations = [];
	const customChromePath = resolveChromePath();
	if (customChromePath) installations.push(customChromePath);
	[path.join(homedir(), ".local/share/applications/"), "/usr/share/applications/"].forEach((folder) => {
		installations = installations.concat(findChromeExecutables(folder));
	});
	[
		"google-chrome-stable",
		"google-chrome",
		"chromium-browser",
		"chromium"
	].forEach((executable) => {
		try {
			const chromePath = execFileSync("which", [executable], { stdio: "pipe" }).toString().split(newLineRegex)[0];
			if (canAccess(chromePath)) installations.push(chromePath);
		} catch (e) {}
	});
	if (!installations.length) throw new ChromePathNotSetError();
	const priorities = [
		{
			regex: /chrome-wrapper$/,
			weight: 51
		},
		{
			regex: /google-chrome-stable$/,
			weight: 50
		},
		{
			regex: /google-chrome$/,
			weight: 49
		},
		{
			regex: /chromium-browser$/,
			weight: 48
		},
		{
			regex: /chromium$/,
			weight: 47
		}
	];
	if (process.env.LIGHTHOUSE_CHROMIUM_PATH) priorities.unshift({
		regex: new RegExp((0, import_escape_string_regexp.default)(process.env.LIGHTHOUSE_CHROMIUM_PATH)),
		weight: 100
	});
	if (process.env.CHROME_PATH) priorities.unshift({
		regex: new RegExp((0, import_escape_string_regexp.default)(process.env.CHROME_PATH)),
		weight: 101
	});
	return sort(uniq(installations.filter(Boolean)), priorities);
}
function wsl() {
	process.env.LOCALAPPDATA = getWSLLocalAppDataPath(`${process.env.PATH}`);
	process.env.PROGRAMFILES = toWSLPath("C:/Program Files", "/mnt/c/Program Files");
	process.env["PROGRAMFILES(X86)"] = toWSLPath("C:/Program Files (x86)", "/mnt/c/Program Files (x86)");
	return win32();
}
function win32() {
	const installations = [];
	const suffixes = [`${path.sep}Google${path.sep}Chrome SxS${path.sep}Application${path.sep}chrome.exe`, `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`];
	const prefixes = [
		process.env.LOCALAPPDATA,
		process.env.PROGRAMFILES,
		process.env["PROGRAMFILES(X86)"]
	].filter(Boolean);
	const customChromePath = resolveChromePath();
	if (customChromePath) installations.push(customChromePath);
	prefixes.forEach((prefix) => suffixes.forEach((suffix) => {
		const chromePath = path.join(prefix, suffix);
		if (canAccess(chromePath)) installations.push(chromePath);
	}));
	return installations;
}
function sort(installations, priorities) {
	const defaultPriority = 10;
	return installations.map((inst) => {
		for (const pair of priorities) if (pair.regex.test(inst)) return {
			path: inst,
			weight: pair.weight
		};
		return {
			path: inst,
			weight: defaultPriority
		};
	}).sort((a, b) => b.weight - a.weight).map((pair) => pair.path);
}
function canAccess(file) {
	if (!file) return false;
	try {
		fs.accessSync(file);
		return true;
	} catch (e) {
		return false;
	}
}
function uniq(arr) {
	return Array.from(new Set(arr));
}
function findChromeExecutables(folder) {
	const argumentsRegex = /(^[^ ]+).*/;
	const chromeExecRegex = "^Exec=/.*/(google-chrome|chrome|chromium)-.*";
	let installations = [];
	if (canAccess(folder)) {
		let execPaths;
		try {
			execPaths = execSync(`grep -ER "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`, { stdio: "pipe" });
		} catch (e) {
			execPaths = execSync(`grep -Er "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`, { stdio: "pipe" });
		}
		execPaths = execPaths.toString().split(newLineRegex).map((execPath) => execPath.replace(argumentsRegex, "$1"));
		execPaths.forEach((execPath) => canAccess(execPath) && installations.push(execPath));
	}
	return installations;
}
//#endregion
//#region node_modules/chrome-launcher/dist/random-port.js
/**
* @license Copyright 2016 Google Inc. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
/**
* Return a random, unused port.
*/
function getRandomPort() {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.listen(0);
		server.once("listening", () => {
			const { port } = server.address();
			server.close(() => resolve(port));
		});
		server.once("error", reject);
	});
}
//#endregion
//#region node_modules/chrome-launcher/dist/flags.js
/**
* @license Copyright 2017 Google Inc. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
/**
* See the following `chrome-flags-for-tools.md` for exhaustive coverage of these and related flags
* @url https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md
*/
var DEFAULT_FLAGS = [
	"--disable-features=" + [
		"Translate",
		"OptimizationHints",
		"MediaRouter",
		"DialMediaRouteProvider",
		"CalculateNativeWinOcclusion",
		"InterestFeedContentSuggestions",
		"CertificateTransparencyComponentUpdater",
		"AutofillServerCommunication",
		"PrivacySandboxSettings4",
		"RenderDocument"
	].join(","),
	"--disable-extensions",
	"--disable-component-extensions-with-background-pages",
	"--disable-background-networking",
	"--disable-component-update",
	"--disable-client-side-phishing-detection",
	"--disable-sync",
	"--metrics-recording-only",
	"--disable-default-apps",
	"--mute-audio",
	"--no-default-browser-check",
	"--no-first-run",
	"--disable-backgrounding-occluded-windows",
	"--disable-renderer-backgrounding",
	"--disable-background-timer-throttling",
	"--disable-ipc-flooding-protection",
	"--password-store=basic",
	"--use-mock-keychain",
	"--force-fieldtrials=*BackgroundTracing/default/",
	"--disable-hang-monitor",
	"--disable-prompt-on-repost",
	"--disable-domain-reliability",
	"--propagate-iph-for-testing"
];
//#endregion
//#region node_modules/chrome-launcher/dist/chrome-launcher.js
/**
* @license Copyright 2016 Google Inc. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
var isWsl = getPlatform() === "wsl";
var isWindows = getPlatform() === "win32";
var _SIGINT = "SIGINT";
var _SIGINT_EXIT_CODE = 130;
var _SUPPORTED_PLATFORMS = /* @__PURE__ */ new Set([
	"darwin",
	"linux",
	"win32",
	"wsl"
]);
var instances = /* @__PURE__ */ new Set();
var sigintListener = () => {
	killAll();
	process.exit(_SIGINT_EXIT_CODE);
};
async function launch(opts = {}) {
	opts.handleSIGINT = defaults(opts.handleSIGINT, true);
	const instance = new Launcher(opts);
	if (opts.handleSIGINT && instances.size === 0) process.on(_SIGINT, sigintListener);
	instances.add(instance);
	await instance.launch();
	const kill = () => {
		instances.delete(instance);
		if (instances.size === 0) process.removeListener(_SIGINT, sigintListener);
		instance.kill();
	};
	return {
		pid: instance.pid,
		port: instance.port,
		process: instance.chromeProcess,
		remoteDebuggingPipes: instance.remoteDebuggingPipes,
		kill
	};
}
function killAll() {
	let errors = [];
	for (const instance of instances) try {
		instance.kill();
		instances.delete(instance);
	} catch (err) {
		errors.push(err);
	}
	return errors;
}
var Launcher = class Launcher {
	constructor(opts = {}, moduleOverrides = {}) {
		this.opts = opts;
		this.tmpDirandPidFileReady = false;
		this.remoteDebuggingPipes = null;
		this.fs = moduleOverrides.fs || fs$1;
		this.spawn = moduleOverrides.spawn || spawn;
		Log.setLevel(defaults(this.opts.logLevel, "silent"));
		this.startingUrl = defaults(this.opts.startingUrl, "about:blank");
		this.chromeFlags = defaults(this.opts.chromeFlags, []);
		this.prefs = defaults(this.opts.prefs, {});
		this.requestedPort = defaults(this.opts.port, 0);
		this.portStrictMode = opts.portStrictMode;
		this.chromePath = this.opts.chromePath;
		this.ignoreDefaultFlags = defaults(this.opts.ignoreDefaultFlags, false);
		this.connectionPollInterval = defaults(this.opts.connectionPollInterval, 500);
		this.maxConnectionRetries = defaults(this.opts.maxConnectionRetries, 50);
		this.envVars = defaults(opts.envVars, Object.assign({}, process.env));
		if (typeof this.opts.userDataDir === "boolean") if (!this.opts.userDataDir) {
			this.useDefaultProfile = true;
			this.userDataDir = void 0;
		} else throw new InvalidUserDataDirectoryError();
		else {
			this.useDefaultProfile = false;
			this.userDataDir = this.opts.userDataDir;
		}
		this.useRemoteDebuggingPipe = this.chromeFlags.some((f) => f.startsWith("--remote-debugging-pipe"));
	}
	get flags() {
		const flags = this.ignoreDefaultFlags ? [] : DEFAULT_FLAGS.slice();
		if (this.port) flags.push(`--remote-debugging-port=${this.port}`);
		if (!this.ignoreDefaultFlags && getPlatform() === "linux") flags.push("--disable-setuid-sandbox");
		if (!this.useDefaultProfile) flags.push(`--user-data-dir=${isWsl ? toWin32Path(this.userDataDir) : this.userDataDir}`);
		if (process.env.HEADLESS) flags.push("--headless");
		flags.push(...this.chromeFlags);
		flags.push(this.startingUrl);
		return flags;
	}
	static defaultFlags() {
		return DEFAULT_FLAGS.slice();
	}
	/** Returns the highest priority chrome installation. */
	static getFirstInstallation() {
		if (getPlatform() === "darwin") return darwinFast();
		return chrome_finder_exports[getPlatform()]()[0];
	}
	/** Returns all available chrome installations in decreasing priority order. */
	static getInstallations() {
		return chrome_finder_exports[getPlatform()]();
	}
	makeTmpDir() {
		return makeTmpDir();
	}
	prepare() {
		const platform = getPlatform();
		if (!_SUPPORTED_PLATFORMS.has(platform)) throw new UnsupportedPlatformError();
		this.userDataDir = this.userDataDir || this.makeTmpDir();
		this.outFile = this.fs.openSync(`${this.userDataDir}/chrome-out.log`, "a");
		this.errFile = this.fs.openSync(`${this.userDataDir}/chrome-err.log`, "a");
		this.setBrowserPrefs();
		this.pidFile = `${this.userDataDir}/chrome.pid`;
		Log.verbose("ChromeLauncher", `created ${this.userDataDir}`);
		this.tmpDirandPidFileReady = true;
	}
	setBrowserPrefs() {
		if (Object.keys(this.prefs).length === 0) return;
		const profileDir = `${this.userDataDir}/Default`;
		if (!this.fs.existsSync(profileDir)) this.fs.mkdirSync(profileDir, { recursive: true });
		const preferenceFile = `${profileDir}/Preferences`;
		try {
			if (this.fs.existsSync(preferenceFile)) {
				const file = this.fs.readFileSync(preferenceFile, "utf-8");
				const content = JSON.parse(file);
				this.fs.writeFileSync(preferenceFile, JSON.stringify({
					...content,
					...this.prefs
				}), "utf-8");
			} else this.fs.writeFileSync(preferenceFile, JSON.stringify({ ...this.prefs }), "utf-8");
		} catch (err) {
			Log.log("ChromeLauncher", `Failed to set browser prefs: ${err.message}`);
		}
	}
	async launch() {
		if (this.requestedPort !== 0) {
			this.port = this.requestedPort;
			try {
				await this.isDebuggerReady();
				Log.log("ChromeLauncher", `Found existing Chrome already running using port ${this.port}, using that.`);
				return;
			} catch (err) {
				if (this.portStrictMode) throw new Error(`found no Chrome at port ${this.requestedPort}`);
				Log.log("ChromeLauncher", `No debugging port found on port ${this.port}, launching a new Chrome.`);
			}
		}
		if (this.chromePath === void 0) {
			const installation = Launcher.getFirstInstallation();
			if (!installation) throw new ChromeNotInstalledError();
			this.chromePath = installation;
		}
		if (!this.tmpDirandPidFileReady) this.prepare();
		this.pid = await this.spawnProcess(this.chromePath);
		return Promise.resolve();
	}
	async spawnProcess(execPath) {
		const pid = await (async () => {
			if (this.chromeProcess) {
				Log.log("ChromeLauncher", `Chrome already running with pid ${this.chromeProcess.pid}.`);
				return this.chromeProcess.pid;
			}
			if (this.requestedPort === 0) if (this.useRemoteDebuggingPipe) this.port = 0;
			else this.port = await getRandomPort();
			Log.verbose("ChromeLauncher", `Launching with command:\n"${execPath}" ${this.flags.join(" ")}`);
			this.chromeProcess = this.spawn(execPath, this.flags, {
				detached: process.platform !== "win32",
				stdio: this.useRemoteDebuggingPipe ? [
					"ignore",
					this.outFile,
					this.errFile,
					"pipe",
					"pipe"
				] : [
					"ignore",
					this.outFile,
					this.errFile
				],
				env: this.envVars
			});
			if (this.chromeProcess.pid) this.fs.writeFileSync(this.pidFile, this.chromeProcess.pid.toString());
			if (this.useRemoteDebuggingPipe) this.remoteDebuggingPipes = {
				incoming: this.chromeProcess.stdio[4],
				outgoing: this.chromeProcess.stdio[3]
			};
			Log.verbose("ChromeLauncher", `Chrome running with pid ${this.chromeProcess.pid} on port ${this.port}.`);
			return this.chromeProcess.pid;
		})();
		if (this.port !== 0) await this.waitUntilReady();
		return pid;
	}
	cleanup(client) {
		if (client) {
			client.removeAllListeners();
			client.end();
			client.destroy();
			client.unref();
		}
	}
	isDebuggerReady() {
		return new Promise((resolve, reject) => {
			const client = net.createConnection(this.port, "127.0.0.1");
			client.once("error", (err) => {
				this.cleanup(client);
				reject(err);
			});
			client.once("connect", () => {
				this.cleanup(client);
				resolve();
			});
		});
	}
	waitUntilReady() {
		const launcher = this;
		return new Promise((resolve, reject) => {
			let retries = 0;
			let waitStatus = "Waiting for browser.";
			const poll = () => {
				if (retries === 0) Log.log("ChromeLauncher", waitStatus);
				retries++;
				waitStatus += "..";
				Log.log("ChromeLauncher", waitStatus);
				launcher.isDebuggerReady().then(() => {
					Log.log("ChromeLauncher", waitStatus + `${Log.greenify(Log.tick)}`);
					resolve();
				}).catch((err) => {
					if (retries > launcher.maxConnectionRetries) {
						Log.error("ChromeLauncher", err.message);
						const stderr = this.fs.readFileSync(`${this.userDataDir}/chrome-err.log`, { encoding: "utf-8" });
						Log.error("ChromeLauncher", `Logging contents of ${this.userDataDir}/chrome-err.log`);
						Log.error("ChromeLauncher", stderr);
						return reject(err);
					}
					delay(launcher.connectionPollInterval).then(poll);
				});
			};
			poll();
		});
	}
	kill() {
		if (!this.chromeProcess) return;
		this.chromeProcess.on("close", () => {
			delete this.chromeProcess;
			this.destroyTmp();
		});
		Log.log("ChromeLauncher", `Killing Chrome instance ${this.chromeProcess.pid}`);
		try {
			if (isWindows) {
				const { stderr } = spawnSync(`taskkill /pid ${this.chromeProcess.pid} /T /F`, {
					shell: true,
					encoding: "utf-8"
				});
				if (stderr) Log.error("ChromeLauncher", `taskkill stderr`, stderr);
			} else if (this.chromeProcess.pid) process.kill(-this.chromeProcess.pid, "SIGKILL");
		} catch (err) {
			const message = `Chrome could not be killed ${err.message}`;
			Log.warn("ChromeLauncher", message);
		}
		this.destroyTmp();
	}
	destroyTmp() {
		if (this.outFile) {
			this.fs.closeSync(this.outFile);
			delete this.outFile;
		}
		if (this.userDataDir === void 0 || this.opts.userDataDir !== void 0) return;
		if (this.errFile) {
			this.fs.closeSync(this.errFile);
			delete this.errFile;
		}
		(this.fs.rmSync || this.fs.rmdirSync)(this.userDataDir, {
			recursive: true,
			force: true,
			maxRetries: 10
		});
	}
};
//#endregion
//#region node_modules/chrome-launcher/dist/index.js
var dist_exports = /* @__PURE__ */ __exportAll({
	Launcher: () => Launcher,
	killAll: () => killAll,
	launch: () => launch
});
//#endregion
export { Log as n, dist_exports as t };
