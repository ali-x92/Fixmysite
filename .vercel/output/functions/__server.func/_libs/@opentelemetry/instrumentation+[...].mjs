import { i as __require, n as __esmMin, o as __toESM, r as __exportAll, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src } from "../opentelemetry__api.mjs";
import { n as logs, t as init_esm$1 } from "../opentelemetry__api-logs.mjs";
import { types } from "util";
import * as path$1 from "path";
import { normalize } from "path";
import { Hook } from "require-in-the-middle";
import { Hook as Hook$1 } from "import-in-the-middle";
import { readFileSync } from "fs";
//#region node_modules/@opentelemetry/instrumentation/build/esm/autoLoaderUtils.js
/**
* Enable instrumentations
* @param instrumentations
* @param tracerProvider
* @param meterProvider
*/
function enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider) {
	for (var i = 0, j = instrumentations.length; i < j; i++) {
		var instrumentation = instrumentations[i];
		if (tracerProvider) instrumentation.setTracerProvider(tracerProvider);
		if (meterProvider) instrumentation.setMeterProvider(meterProvider);
		if (loggerProvider && instrumentation.setLoggerProvider) instrumentation.setLoggerProvider(loggerProvider);
		if (!instrumentation.getConfig().enabled) instrumentation.enable();
	}
}
/**
* Disable instrumentations
* @param instrumentations
*/
function disableInstrumentations(instrumentations) {
	instrumentations.forEach(function(instrumentation) {
		return instrumentation.disable();
	});
}
var init_autoLoaderUtils = __esmMin((() => {}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/autoLoader.js
/**
* It will register instrumentations and plugins
* @param options
* @return returns function to unload instrumentation and plugins that were
*   registered
*/
function registerInstrumentations(options) {
	var _a, _b;
	var tracerProvider = options.tracerProvider || import_src$2.trace.getTracerProvider();
	var meterProvider = options.meterProvider || import_src$2.metrics.getMeterProvider();
	var loggerProvider = options.loggerProvider || logs.getLoggerProvider();
	var instrumentations = (_b = (_a = options.instrumentations) === null || _a === void 0 ? void 0 : _a.flat()) !== null && _b !== void 0 ? _b : [];
	enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider);
	return function() {
		disableInstrumentations(instrumentations);
	};
}
var import_src$2;
var init_autoLoader = __esmMin((() => {
	import_src$2 = /* @__PURE__ */ __toESM(require_src());
	init_esm$1();
	init_autoLoaderUtils();
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/internal/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SEMVER_SPEC_VERSION = "2.0.0";
	var MAX_LENGTH = 256;
	var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
	module.exports = {
		MAX_LENGTH,
		MAX_SAFE_COMPONENT_LENGTH: 16,
		MAX_SAFE_BUILD_LENGTH: MAX_LENGTH - 6,
		MAX_SAFE_INTEGER,
		RELEASE_TYPES: [
			"major",
			"premajor",
			"minor",
			"preminor",
			"patch",
			"prepatch",
			"prerelease"
		],
		SEMVER_SPEC_VERSION,
		FLAG_INCLUDE_PRERELEASE: 1,
		FLAG_LOOSE: 2
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/internal/debug.js
var require_debug = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/internal/re.js
var require_re = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { MAX_SAFE_COMPONENT_LENGTH, MAX_SAFE_BUILD_LENGTH, MAX_LENGTH } = require_constants();
	var debug = require_debug();
	exports = module.exports = {};
	var re = exports.re = [];
	var safeRe = exports.safeRe = [];
	var src = exports.src = [];
	var safeSrc = exports.safeSrc = [];
	var t = exports.t = {};
	var R = 0;
	var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
	var safeRegexReplacements = [
		["\\s", 1],
		["\\d", MAX_LENGTH],
		[LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
	];
	var makeSafeRegex = (value) => {
		for (const [token, max] of safeRegexReplacements) value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
		return value;
	};
	var createToken = (name, value, isGlobal) => {
		const safe = makeSafeRegex(value);
		const index = R++;
		debug(name, index, value);
		t[name] = index;
		src[index] = value;
		safeSrc[index] = safe;
		re[index] = new RegExp(value, isGlobal ? "g" : void 0);
		safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
	};
	createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
	createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
	createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
	createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
	createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
	createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
	createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
	createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
	createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
	createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
	createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
	createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
	createToken("FULL", `^${src[t.FULLPLAIN]}$`);
	createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
	createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
	createToken("GTLT", "((?:<|>)?=?)");
	createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
	createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
	createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
	createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
	createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
	createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("COERCEPLAIN", `(^|[^\\d])(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
	createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
	createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
	createToken("COERCERTL", src[t.COERCE], true);
	createToken("COERCERTLFULL", src[t.COERCEFULL], true);
	createToken("LONETILDE", "(?:~>?)");
	createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
	exports.tildeTrimReplace = "$1~";
	createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
	createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("LONECARET", "(?:\\^)");
	createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
	exports.caretTrimReplace = "$1^";
	createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
	createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
	createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
	createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
	createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
	exports.comparatorTrimReplace = "$1$2$3";
	createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
	createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
	createToken("STAR", "(<|>)?=?\\s*\\*");
	createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
	createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/internal/parse-options.js
var require_parse_options = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var looseOption = Object.freeze({ loose: true });
	var emptyOpts = Object.freeze({});
	var parseOptions = (options) => {
		if (!options) return emptyOpts;
		if (typeof options !== "object") return looseOption;
		return options;
	};
	module.exports = parseOptions;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/internal/identifiers.js
var require_identifiers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var numeric = /^[0-9]+$/;
	var compareIdentifiers = (a, b) => {
		if (typeof a === "number" && typeof b === "number") return a === b ? 0 : a < b ? -1 : 1;
		const anum = numeric.test(a);
		const bnum = numeric.test(b);
		if (anum && bnum) {
			a = +a;
			b = +b;
		}
		return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
	};
	var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
	module.exports = {
		compareIdentifiers,
		rcompareIdentifiers
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/classes/semver.js
var require_semver$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_debug();
	var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
	var { safeRe: re, t } = require_re();
	var parseOptions = require_parse_options();
	var { compareIdentifiers } = require_identifiers();
	var isPrereleaseIdentifier = (prerelease, identifier) => {
		const identifiers = identifier.split(".");
		if (identifiers.length > prerelease.length) return false;
		for (let i = 0; i < identifiers.length; i++) if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) return false;
		return true;
	};
	module.exports = class SemVer {
		constructor(version, options) {
			options = parseOptions(options);
			if (version instanceof SemVer) if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) return version;
			else version = version.version;
			else if (typeof version !== "string") throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
			if (version.length > MAX_LENGTH) throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
			debug("SemVer", version, options);
			this.options = options;
			this.loose = !!options.loose;
			this.includePrerelease = !!options.includePrerelease;
			const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
			if (!m) throw new TypeError(`Invalid Version: ${version}`);
			this.raw = version;
			this.major = +m[1];
			this.minor = +m[2];
			this.patch = +m[3];
			if (this.major > MAX_SAFE_INTEGER || this.major < 0) throw new TypeError("Invalid major version");
			if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) throw new TypeError("Invalid minor version");
			if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) throw new TypeError("Invalid patch version");
			if (!m[4]) this.prerelease = [];
			else this.prerelease = m[4].split(".").map((id) => {
				if (/^[0-9]+$/.test(id)) {
					const num = +id;
					if (num >= 0 && num < MAX_SAFE_INTEGER) return num;
				}
				return id;
			});
			this.build = m[5] ? m[5].split(".") : [];
			this.format();
		}
		format() {
			this.version = `${this.major}.${this.minor}.${this.patch}`;
			if (this.prerelease.length) this.version += `-${this.prerelease.join(".")}`;
			return this.version;
		}
		toString() {
			return this.version;
		}
		compare(other) {
			debug("SemVer.compare", this.version, this.options, other);
			if (!(other instanceof SemVer)) {
				if (typeof other === "string" && other === this.version) return 0;
				other = new SemVer(other, this.options);
			}
			if (other.version === this.version) return 0;
			return this.compareMain(other) || this.comparePre(other);
		}
		compareMain(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			if (this.major < other.major) return -1;
			if (this.major > other.major) return 1;
			if (this.minor < other.minor) return -1;
			if (this.minor > other.minor) return 1;
			if (this.patch < other.patch) return -1;
			if (this.patch > other.patch) return 1;
			return 0;
		}
		comparePre(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			if (this.prerelease.length && !other.prerelease.length) return -1;
			else if (!this.prerelease.length && other.prerelease.length) return 1;
			else if (!this.prerelease.length && !other.prerelease.length) return 0;
			let i = 0;
			do {
				const a = this.prerelease[i];
				const b = other.prerelease[i];
				debug("prerelease compare", i, a, b);
				if (a === void 0 && b === void 0) return 0;
				else if (b === void 0) return 1;
				else if (a === void 0) return -1;
				else if (a === b) continue;
				else return compareIdentifiers(a, b);
			} while (++i);
		}
		compareBuild(other) {
			if (!(other instanceof SemVer)) other = new SemVer(other, this.options);
			let i = 0;
			do {
				const a = this.build[i];
				const b = other.build[i];
				debug("build compare", i, a, b);
				if (a === void 0 && b === void 0) return 0;
				else if (b === void 0) return 1;
				else if (a === void 0) return -1;
				else if (a === b) continue;
				else return compareIdentifiers(a, b);
			} while (++i);
		}
		inc(release, identifier, identifierBase) {
			if (release.startsWith("pre")) {
				if (!identifier && identifierBase === false) throw new Error("invalid increment argument: identifier is empty");
				if (identifier) {
					const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
					if (!match || match[1] !== identifier) throw new Error(`invalid identifier: ${identifier}`);
				}
			}
			switch (release) {
				case "premajor":
					this.prerelease.length = 0;
					this.patch = 0;
					this.minor = 0;
					this.major++;
					this.inc("pre", identifier, identifierBase);
					break;
				case "preminor":
					this.prerelease.length = 0;
					this.patch = 0;
					this.minor++;
					this.inc("pre", identifier, identifierBase);
					break;
				case "prepatch":
					this.prerelease.length = 0;
					this.inc("patch", identifier, identifierBase);
					this.inc("pre", identifier, identifierBase);
					break;
				case "prerelease":
					if (this.prerelease.length === 0) this.inc("patch", identifier, identifierBase);
					this.inc("pre", identifier, identifierBase);
					break;
				case "release":
					if (this.prerelease.length === 0) throw new Error(`version ${this.raw} is not a prerelease`);
					this.prerelease.length = 0;
					break;
				case "major":
					if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) this.major++;
					this.minor = 0;
					this.patch = 0;
					this.prerelease = [];
					break;
				case "minor":
					if (this.patch !== 0 || this.prerelease.length === 0) this.minor++;
					this.patch = 0;
					this.prerelease = [];
					break;
				case "patch":
					if (this.prerelease.length === 0) this.patch++;
					this.prerelease = [];
					break;
				case "pre": {
					const base = Number(identifierBase) ? 1 : 0;
					if (this.prerelease.length === 0) this.prerelease = [base];
					else {
						let i = this.prerelease.length;
						while (--i >= 0) if (typeof this.prerelease[i] === "number") {
							this.prerelease[i]++;
							i = -2;
						}
						if (i === -1) {
							if (identifier === this.prerelease.join(".") && identifierBase === false) throw new Error("invalid increment argument: identifier already exists");
							this.prerelease.push(base);
						}
					}
					if (identifier) {
						let prerelease = [identifier, base];
						if (identifierBase === false) prerelease = [identifier];
						if (isPrereleaseIdentifier(this.prerelease, identifier)) {
							const prereleaseBase = this.prerelease[identifier.split(".").length];
							if (isNaN(prereleaseBase)) this.prerelease = prerelease;
						} else this.prerelease = prerelease;
					}
					break;
				}
				default: throw new Error(`invalid increment argument: ${release}`);
			}
			this.raw = this.format();
			if (this.build.length) this.raw += `+${this.build.join(".")}`;
			return this;
		}
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/parse.js
var require_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var parse = (version, options, throwErrors = false) => {
		if (version instanceof SemVer) return version;
		try {
			return new SemVer(version, options);
		} catch (er) {
			if (!throwErrors) return null;
			throw er;
		}
	};
	module.exports = parse;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/valid.js
var require_valid$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var parse = require_parse();
	var valid = (version, options) => {
		const v = parse(version, options);
		return v ? v.version : null;
	};
	module.exports = valid;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/clean.js
var require_clean = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var parse = require_parse();
	var clean = (version, options) => {
		const s = parse(version.trim().replace(/^[=v]+/, ""), options);
		return s ? s.version : null;
	};
	module.exports = clean;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/inc.js
var require_inc = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var inc = (version, release, options, identifier, identifierBase) => {
		if (typeof options === "string") {
			identifierBase = identifier;
			identifier = options;
			options = void 0;
		}
		try {
			return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
		} catch (er) {
			return null;
		}
	};
	module.exports = inc;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/diff.js
var require_diff = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var parse = require_parse();
	var diff = (version1, version2) => {
		const v1 = parse(version1, null, true);
		const v2 = parse(version2, null, true);
		const comparison = v1.compare(v2);
		if (comparison === 0) return null;
		const v1Higher = comparison > 0;
		const highVersion = v1Higher ? v1 : v2;
		const lowVersion = v1Higher ? v2 : v1;
		const highHasPre = !!highVersion.prerelease.length;
		if (!!lowVersion.prerelease.length && !highHasPre) {
			if (!lowVersion.patch && !lowVersion.minor) return "major";
			if (lowVersion.compareMain(highVersion) === 0) {
				if (lowVersion.minor && !lowVersion.patch) return "minor";
				return "patch";
			}
		}
		const prefix = highHasPre ? "pre" : "";
		if (v1.major !== v2.major) return prefix + "major";
		if (v1.minor !== v2.minor) return prefix + "minor";
		if (v1.patch !== v2.patch) return prefix + "patch";
		return "prerelease";
	};
	module.exports = diff;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/major.js
var require_major = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var major = (a, loose) => new SemVer(a, loose).major;
	module.exports = major;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/minor.js
var require_minor = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var minor = (a, loose) => new SemVer(a, loose).minor;
	module.exports = minor;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/patch.js
var require_patch = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var patch = (a, loose) => new SemVer(a, loose).patch;
	module.exports = patch;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/prerelease.js
var require_prerelease = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var parse = require_parse();
	var prerelease = (version, options) => {
		const parsed = parse(version, options);
		return parsed && parsed.prerelease.length ? parsed.prerelease : null;
	};
	module.exports = prerelease;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/compare.js
var require_compare = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
	module.exports = compare;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/rcompare.js
var require_rcompare = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compare = require_compare();
	var rcompare = (a, b, loose) => compare(b, a, loose);
	module.exports = rcompare;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/compare-loose.js
var require_compare_loose = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compare = require_compare();
	var compareLoose = (a, b) => compare(a, b, true);
	module.exports = compareLoose;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/compare-build.js
var require_compare_build = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var compareBuild = (a, b, loose) => {
		const versionA = new SemVer(a, loose);
		const versionB = new SemVer(b, loose);
		return versionA.compare(versionB) || versionA.compareBuild(versionB);
	};
	module.exports = compareBuild;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/sort.js
var require_sort = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compareBuild = require_compare_build();
	var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
	module.exports = sort;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/rsort.js
var require_rsort = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compareBuild = require_compare_build();
	var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
	module.exports = rsort;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/gt.js
var require_gt = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compare = require_compare();
	var gt = (a, b, loose) => compare(a, b, loose) > 0;
	module.exports = gt;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/lt.js
var require_lt = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compare = require_compare();
	var lt = (a, b, loose) => compare(a, b, loose) < 0;
	module.exports = lt;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/eq.js
var require_eq = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compare = require_compare();
	var eq = (a, b, loose) => compare(a, b, loose) === 0;
	module.exports = eq;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/neq.js
var require_neq = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compare = require_compare();
	var neq = (a, b, loose) => compare(a, b, loose) !== 0;
	module.exports = neq;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/gte.js
var require_gte = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compare = require_compare();
	var gte = (a, b, loose) => compare(a, b, loose) >= 0;
	module.exports = gte;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/lte.js
var require_lte = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var compare = require_compare();
	var lte = (a, b, loose) => compare(a, b, loose) <= 0;
	module.exports = lte;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/cmp.js
var require_cmp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var eq = require_eq();
	var neq = require_neq();
	var gt = require_gt();
	var gte = require_gte();
	var lt = require_lt();
	var lte = require_lte();
	var cmp = (a, op, b, loose) => {
		switch (op) {
			case "===":
				if (typeof a === "object") a = a.version;
				if (typeof b === "object") b = b.version;
				return a === b;
			case "!==":
				if (typeof a === "object") a = a.version;
				if (typeof b === "object") b = b.version;
				return a !== b;
			case "":
			case "=":
			case "==": return eq(a, b, loose);
			case "!=": return neq(a, b, loose);
			case ">": return gt(a, b, loose);
			case ">=": return gte(a, b, loose);
			case "<": return lt(a, b, loose);
			case "<=": return lte(a, b, loose);
			default: throw new TypeError(`Invalid operator: ${op}`);
		}
	};
	module.exports = cmp;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/coerce.js
var require_coerce = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var parse = require_parse();
	var { safeRe: re, t } = require_re();
	var coerce = (version, options) => {
		if (version instanceof SemVer) return version;
		if (typeof version === "number") version = String(version);
		if (typeof version !== "string") return null;
		options = options || {};
		let match = null;
		if (!options.rtl) match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
		else {
			const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
			let next;
			while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
				if (!match || next.index + next[0].length !== match.index + match[0].length) match = next;
				coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
			}
			coerceRtlRegex.lastIndex = -1;
		}
		if (match === null) return null;
		const major = match[2];
		return parse(`${major}.${match[3] || "0"}.${match[4] || "0"}${options.includePrerelease && match[5] ? `-${match[5]}` : ""}${options.includePrerelease && match[6] ? `+${match[6]}` : ""}`, options);
	};
	module.exports = coerce;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/truncate.js
var require_truncate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var parse = require_parse();
	var constants = require_constants();
	var SemVer = require_semver$1();
	var truncate = (version, truncation, options) => {
		if (!constants.RELEASE_TYPES.includes(truncation)) return null;
		const clonedVersion = cloneInputVersion(version, options);
		return clonedVersion && doTruncation(clonedVersion, truncation);
	};
	var cloneInputVersion = (version, options) => {
		return parse(version instanceof SemVer ? version.version : version, options);
	};
	var doTruncation = (version, truncation) => {
		if (isPrerelease(truncation)) return version.version;
		version.prerelease = [];
		switch (truncation) {
			case "major":
				version.minor = 0;
				version.patch = 0;
				break;
			case "minor":
				version.patch = 0;
				break;
		}
		return version.format();
	};
	var isPrerelease = (type) => {
		return type.startsWith("pre");
	};
	module.exports = truncate;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/internal/lrucache.js
var require_lrucache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var LRUCache = class {
		constructor() {
			this.max = 1e3;
			this.map = /* @__PURE__ */ new Map();
		}
		get(key) {
			const value = this.map.get(key);
			if (value === void 0) return;
			else {
				this.map.delete(key);
				this.map.set(key, value);
				return value;
			}
		}
		delete(key) {
			return this.map.delete(key);
		}
		set(key, value) {
			if (!this.delete(key) && value !== void 0) {
				if (this.map.size >= this.max) {
					const firstKey = this.map.keys().next().value;
					this.delete(firstKey);
				}
				this.map.set(key, value);
			}
			return this;
		}
	};
	module.exports = LRUCache;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/classes/range.js
var require_range = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SPACE_CHARACTERS = /\s+/g;
	module.exports = class Range {
		constructor(range, options) {
			options = parseOptions(options);
			if (range instanceof Range) if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) return range;
			else return new Range(range.raw, options);
			if (range instanceof Comparator) {
				this.raw = range.value;
				this.set = [[range]];
				this.formatted = void 0;
				return this;
			}
			this.options = options;
			this.loose = !!options.loose;
			this.includePrerelease = !!options.includePrerelease;
			this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
			this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
			if (!this.set.length) throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
			if (this.set.length > 1) {
				const first = this.set[0];
				this.set = this.set.filter((c) => !isNullSet(c[0]));
				if (this.set.length === 0) this.set = [first];
				else if (this.set.length > 1) {
					for (const c of this.set) if (c.length === 1 && isAny(c[0])) {
						this.set = [c];
						break;
					}
				}
			}
			this.formatted = void 0;
		}
		get range() {
			if (this.formatted === void 0) {
				this.formatted = "";
				for (let i = 0; i < this.set.length; i++) {
					if (i > 0) this.formatted += "||";
					const comps = this.set[i];
					for (let k = 0; k < comps.length; k++) {
						if (k > 0) this.formatted += " ";
						this.formatted += comps[k].toString().trim();
					}
				}
			}
			return this.formatted;
		}
		format() {
			return this.range;
		}
		toString() {
			return this.range;
		}
		parseRange(range) {
			range = range.replace(BUILDSTRIPRE, "");
			const memoKey = ((this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE)) + ":" + range;
			const cached = cache.get(memoKey);
			if (cached) return cached;
			const loose = this.options.loose;
			const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
			range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
			debug("hyphen replace", range);
			range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
			debug("comparator trim", range);
			range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
			debug("tilde trim", range);
			range = range.replace(re[t.CARETTRIM], caretTrimReplace);
			debug("caret trim", range);
			let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
			if (loose) rangeList = rangeList.filter((comp) => {
				debug("loose invalid filter", comp, this.options);
				return !!comp.match(re[t.COMPARATORLOOSE]);
			});
			debug("range list", rangeList);
			const rangeMap = /* @__PURE__ */ new Map();
			const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
			for (const comp of comparators) {
				if (isNullSet(comp)) return [comp];
				rangeMap.set(comp.value, comp);
			}
			if (rangeMap.size > 1 && rangeMap.has("")) rangeMap.delete("");
			const result = [...rangeMap.values()];
			cache.set(memoKey, result);
			return result;
		}
		intersects(range, options) {
			if (!(range instanceof Range)) throw new TypeError("a Range is required");
			return this.set.some((thisComparators) => {
				return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
					return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
						return rangeComparators.every((rangeComparator) => {
							return thisComparator.intersects(rangeComparator, options);
						});
					});
				});
			});
		}
		test(version) {
			if (!version) return false;
			if (typeof version === "string") try {
				version = new SemVer(version, this.options);
			} catch (er) {
				return false;
			}
			for (let i = 0; i < this.set.length; i++) if (testSet(this.set[i], version, this.options)) return true;
			return false;
		}
	};
	var cache = new (require_lrucache())();
	var parseOptions = require_parse_options();
	var Comparator = require_comparator();
	var debug = require_debug();
	var SemVer = require_semver$1();
	var { safeRe: re, src, t, comparatorTrimReplace, tildeTrimReplace, caretTrimReplace } = require_re();
	var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
	var BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
	var isNullSet = (c) => c.value === "<0.0.0-0";
	var isAny = (c) => c.value === "";
	var isSatisfiable = (comparators, options) => {
		let result = true;
		const remainingComparators = comparators.slice();
		let testComparator = remainingComparators.pop();
		while (result && remainingComparators.length) {
			result = remainingComparators.every((otherComparator) => {
				return testComparator.intersects(otherComparator, options);
			});
			testComparator = remainingComparators.pop();
		}
		return result;
	};
	var parseComparator = (comp, options) => {
		comp = comp.replace(re[t.BUILD], "");
		debug("comp", comp, options);
		comp = replaceCarets(comp, options);
		debug("caret", comp);
		comp = replaceTildes(comp, options);
		debug("tildes", comp);
		comp = replaceXRanges(comp, options);
		debug("xrange", comp);
		comp = replaceStars(comp, options);
		debug("stars", comp);
		return comp;
	};
	var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
	var invalidXRangeOrder = (M, m, p) => isX(M) && !isX(m) || isX(m) && p && !isX(p);
	var replaceTildes = (comp, options) => {
		return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
	};
	var replaceTilde = (comp, options) => {
		const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
		const z = options.includePrerelease ? "-0" : "";
		return comp.replace(r, (_, M, m, p, pr) => {
			debug("tilde", comp, _, M, m, p, pr);
			let ret;
			if (isX(M)) ret = "";
			else if (isX(m)) ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
			else if (isX(p)) ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
			else if (pr) {
				debug("replaceTilde pr", pr);
				ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
			} else ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
			debug("tilde return", ret);
			return ret;
		});
	};
	var replaceCarets = (comp, options) => {
		return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
	};
	var replaceCaret = (comp, options) => {
		debug("caret", comp, options);
		const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
		const z = options.includePrerelease ? "-0" : "";
		return comp.replace(r, (_, M, m, p, pr) => {
			debug("caret", comp, _, M, m, p, pr);
			let ret;
			if (isX(M)) ret = "";
			else if (isX(m)) ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
			else if (isX(p)) if (M === "0") ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
			else ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
			else if (pr) {
				debug("replaceCaret pr", pr);
				if (M === "0") if (m === "0") ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
				else ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
				else ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
			} else {
				debug("no pr");
				if (M === "0") if (m === "0") ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
				else ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
				else ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
			}
			debug("caret return", ret);
			return ret;
		});
	};
	var replaceXRanges = (comp, options) => {
		debug("replaceXRanges", comp, options);
		return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
	};
	var replaceXRange = (comp, options) => {
		comp = comp.trim();
		const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
		return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
			debug("xRange", comp, ret, gtlt, M, m, p, pr);
			if (invalidXRangeOrder(M, m, p)) return comp;
			const xM = isX(M);
			const xm = xM || isX(m);
			const xp = xm || isX(p);
			const anyX = xp;
			if (gtlt === "=" && anyX) gtlt = "";
			pr = options.includePrerelease ? "-0" : "";
			if (xM) if (gtlt === ">" || gtlt === "<") ret = "<0.0.0-0";
			else ret = "*";
			else if (gtlt && anyX) {
				if (xm) m = 0;
				p = 0;
				if (gtlt === ">") {
					gtlt = ">=";
					if (xm) {
						M = +M + 1;
						m = 0;
						p = 0;
					} else {
						m = +m + 1;
						p = 0;
					}
				} else if (gtlt === "<=") {
					gtlt = "<";
					if (xm) M = +M + 1;
					else m = +m + 1;
				}
				if (gtlt === "<") pr = "-0";
				ret = `${gtlt + M}.${m}.${p}${pr}`;
			} else if (xm) ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
			else if (xp) ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
			debug("xRange return", ret);
			return ret;
		});
	};
	var replaceStars = (comp, options) => {
		debug("replaceStars", comp, options);
		return comp.trim().replace(re[t.STAR], "");
	};
	var replaceGTE0 = (comp, options) => {
		debug("replaceGTE0", comp, options);
		return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
	};
	var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
		if (isX(fM)) from = "";
		else if (isX(fm)) from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
		else if (isX(fp)) from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
		else if (fpr) from = `>=${from}`;
		else from = `>=${from}${incPr ? "-0" : ""}`;
		if (isX(tM)) to = "";
		else if (isX(tm)) to = `<${+tM + 1}.0.0-0`;
		else if (isX(tp)) to = `<${tM}.${+tm + 1}.0-0`;
		else if (tpr) to = `<=${tM}.${tm}.${tp}-${tpr}`;
		else if (incPr) to = `<${tM}.${tm}.${+tp + 1}-0`;
		else to = `<=${to}`;
		return `${from} ${to}`.trim();
	};
	var testSet = (set, version, options) => {
		for (let i = 0; i < set.length; i++) if (!set[i].test(version)) return false;
		if (version.prerelease.length && !options.includePrerelease) {
			for (let i = 0; i < set.length; i++) {
				debug(set[i].semver);
				if (set[i].semver === Comparator.ANY) continue;
				if (set[i].semver.prerelease.length > 0) {
					const allowed = set[i].semver;
					if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) return true;
				}
			}
			return false;
		}
		return true;
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/classes/comparator.js
var require_comparator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ANY = Symbol("SemVer ANY");
	module.exports = class Comparator {
		static get ANY() {
			return ANY;
		}
		constructor(comp, options) {
			options = parseOptions(options);
			if (comp instanceof Comparator) if (comp.loose === !!options.loose) return comp;
			else comp = comp.value;
			comp = comp.trim().split(/\s+/).join(" ");
			debug("comparator", comp, options);
			this.options = options;
			this.loose = !!options.loose;
			this.parse(comp);
			if (this.semver === ANY) this.value = "";
			else this.value = this.operator + this.semver.version;
			debug("comp", this);
		}
		parse(comp) {
			const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
			const m = comp.match(r);
			if (!m) throw new TypeError(`Invalid comparator: ${comp}`);
			this.operator = m[1] !== void 0 ? m[1] : "";
			if (this.operator === "=") this.operator = "";
			if (!m[2]) this.semver = ANY;
			else this.semver = new SemVer(m[2], this.options.loose);
		}
		toString() {
			return this.value;
		}
		test(version) {
			debug("Comparator.test", version, this.options.loose);
			if (this.semver === ANY || version === ANY) return true;
			if (typeof version === "string") try {
				version = new SemVer(version, this.options);
			} catch (er) {
				return false;
			}
			return cmp(version, this.operator, this.semver, this.options);
		}
		intersects(comp, options) {
			if (!(comp instanceof Comparator)) throw new TypeError("a Comparator is required");
			if (this.operator === "") {
				if (this.value === "") return true;
				return new Range(comp.value, options).test(this.value);
			} else if (comp.operator === "") {
				if (comp.value === "") return true;
				return new Range(this.value, options).test(comp.semver);
			}
			options = parseOptions(options);
			if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) return false;
			if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) return false;
			if (this.operator.startsWith(">") && comp.operator.startsWith(">")) return true;
			if (this.operator.startsWith("<") && comp.operator.startsWith("<")) return true;
			if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) return true;
			if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) return true;
			if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) return true;
			return false;
		}
	};
	var parseOptions = require_parse_options();
	var { safeRe: re, t } = require_re();
	var cmp = require_cmp();
	var debug = require_debug();
	var SemVer = require_semver$1();
	var Range = require_range();
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/functions/satisfies.js
var require_satisfies = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Range = require_range();
	var satisfies = (version, range, options) => {
		try {
			range = new Range(range, options);
		} catch (er) {
			return false;
		}
		return range.test(version);
	};
	module.exports = satisfies;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/to-comparators.js
var require_to_comparators = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Range = require_range();
	var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
	module.exports = toComparators;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var Range = require_range();
	var maxSatisfying = (versions, range, options) => {
		let max = null;
		let maxSV = null;
		let rangeObj = null;
		try {
			rangeObj = new Range(range, options);
		} catch (er) {
			return null;
		}
		versions.forEach((v) => {
			if (rangeObj.test(v)) {
				if (!max || maxSV.compare(v) === -1) {
					max = v;
					maxSV = new SemVer(max, options);
				}
			}
		});
		return max;
	};
	module.exports = maxSatisfying;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var Range = require_range();
	var minSatisfying = (versions, range, options) => {
		let min = null;
		let minSV = null;
		let rangeObj = null;
		try {
			rangeObj = new Range(range, options);
		} catch (er) {
			return null;
		}
		versions.forEach((v) => {
			if (rangeObj.test(v)) {
				if (!min || minSV.compare(v) === 1) {
					min = v;
					minSV = new SemVer(min, options);
				}
			}
		});
		return min;
	};
	module.exports = minSatisfying;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/min-version.js
var require_min_version = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var Range = require_range();
	var gt = require_gt();
	var minVersion = (range, loose) => {
		range = new Range(range, loose);
		let minver = new SemVer("0.0.0");
		if (range.test(minver)) return minver;
		minver = new SemVer("0.0.0-0");
		if (range.test(minver)) return minver;
		minver = null;
		for (let i = 0; i < range.set.length; ++i) {
			const comparators = range.set[i];
			let setMin = null;
			comparators.forEach((comparator) => {
				const compver = new SemVer(comparator.semver.version);
				switch (comparator.operator) {
					case ">":
						if (compver.prerelease.length === 0) compver.patch++;
						else compver.prerelease.push(0);
						compver.raw = compver.format();
					case "":
					case ">=":
						if (!setMin || gt(compver, setMin)) setMin = compver;
						break;
					case "<":
					case "<=": break;
					/* istanbul ignore next */
					default: throw new Error(`Unexpected operation: ${comparator.operator}`);
				}
			});
			if (setMin && (!minver || gt(minver, setMin))) minver = setMin;
		}
		if (minver && range.test(minver)) return minver;
		return null;
	};
	module.exports = minVersion;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/valid.js
var require_valid = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Range = require_range();
	var validRange = (range, options) => {
		try {
			return new Range(range, options).range || "*";
		} catch (er) {
			return null;
		}
	};
	module.exports = validRange;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/outside.js
var require_outside = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var SemVer = require_semver$1();
	var Comparator = require_comparator();
	var { ANY } = Comparator;
	var Range = require_range();
	var satisfies = require_satisfies();
	var gt = require_gt();
	var lt = require_lt();
	var lte = require_lte();
	var gte = require_gte();
	var outside = (version, range, hilo, options) => {
		version = new SemVer(version, options);
		range = new Range(range, options);
		let gtfn, ltefn, ltfn, comp, ecomp;
		switch (hilo) {
			case ">":
				gtfn = gt;
				ltefn = lte;
				ltfn = lt;
				comp = ">";
				ecomp = ">=";
				break;
			case "<":
				gtfn = lt;
				ltefn = gte;
				ltfn = gt;
				comp = "<";
				ecomp = "<=";
				break;
			default: throw new TypeError("Must provide a hilo val of \"<\" or \">\"");
		}
		if (satisfies(version, range, options)) return false;
		for (let i = 0; i < range.set.length; ++i) {
			const comparators = range.set[i];
			let high = null;
			let low = null;
			comparators.forEach((comparator) => {
				if (comparator.semver === ANY) comparator = new Comparator(">=0.0.0");
				high = high || comparator;
				low = low || comparator;
				if (gtfn(comparator.semver, high.semver, options)) high = comparator;
				else if (ltfn(comparator.semver, low.semver, options)) low = comparator;
			});
			if (high.operator === comp || high.operator === ecomp) return false;
			if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) return false;
			else if (low.operator === ecomp && ltfn(version, low.semver)) return false;
		}
		return true;
	};
	module.exports = outside;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/gtr.js
var require_gtr = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var outside = require_outside();
	var gtr = (version, range, options) => outside(version, range, ">", options);
	module.exports = gtr;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/ltr.js
var require_ltr = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var outside = require_outside();
	var ltr = (version, range, options) => outside(version, range, "<", options);
	module.exports = ltr;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/intersects.js
var require_intersects = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Range = require_range();
	var intersects = (r1, r2, options) => {
		r1 = new Range(r1, options);
		r2 = new Range(r2, options);
		return r1.intersects(r2, options);
	};
	module.exports = intersects;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/simplify.js
var require_simplify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var satisfies = require_satisfies();
	var compare = require_compare();
	module.exports = (versions, range, options) => {
		const set = [];
		let first = null;
		let prev = null;
		const v = versions.sort((a, b) => compare(a, b, options));
		for (const version of v) if (satisfies(version, range, options)) {
			prev = version;
			if (!first) first = version;
		} else {
			if (prev) set.push([first, prev]);
			prev = null;
			first = null;
		}
		if (first) set.push([first, null]);
		const ranges = [];
		for (const [min, max] of set) if (min === max) ranges.push(min);
		else if (!max && min === v[0]) ranges.push("*");
		else if (!max) ranges.push(`>=${min}`);
		else if (min === v[0]) ranges.push(`<=${max}`);
		else ranges.push(`${min} - ${max}`);
		const simplified = ranges.join(" || ");
		const original = typeof range.raw === "string" ? range.raw : String(range);
		return simplified.length < original.length ? simplified : range;
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/ranges/subset.js
var require_subset = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Range = require_range();
	var Comparator = require_comparator();
	var { ANY } = Comparator;
	var satisfies = require_satisfies();
	var compare = require_compare();
	var subset = (sub, dom, options = {}) => {
		if (sub === dom) return true;
		sub = new Range(sub, options);
		dom = new Range(dom, options);
		let sawNonNull = false;
		OUTER: for (const simpleSub of sub.set) {
			for (const simpleDom of dom.set) {
				const isSub = simpleSubset(simpleSub, simpleDom, options);
				sawNonNull = sawNonNull || isSub !== null;
				if (isSub) continue OUTER;
			}
			if (sawNonNull) return false;
		}
		return true;
	};
	var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
	var minimumVersion = [new Comparator(">=0.0.0")];
	var simpleSubset = (sub, dom, options) => {
		if (sub === dom) return true;
		if (sub.length === 1 && sub[0].semver === ANY) if (dom.length === 1 && dom[0].semver === ANY) return true;
		else if (options.includePrerelease) sub = minimumVersionWithPreRelease;
		else sub = minimumVersion;
		if (dom.length === 1 && dom[0].semver === ANY) if (options.includePrerelease) return true;
		else dom = minimumVersion;
		const eqSet = /* @__PURE__ */ new Set();
		let gt, lt;
		for (const c of sub) if (c.operator === ">" || c.operator === ">=") gt = higherGT(gt, c, options);
		else if (c.operator === "<" || c.operator === "<=") lt = lowerLT(lt, c, options);
		else eqSet.add(c.semver);
		if (eqSet.size > 1) return null;
		let gtltComp;
		if (gt && lt) {
			gtltComp = compare(gt.semver, lt.semver, options);
			if (gtltComp > 0) return null;
			else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) return null;
		}
		for (const eq of eqSet) {
			if (gt && !satisfies(eq, String(gt), options)) return null;
			if (lt && !satisfies(eq, String(lt), options)) return null;
			for (const c of dom) if (!satisfies(eq, String(c), options)) return false;
			return true;
		}
		let higher, lower;
		let hasDomLT, hasDomGT;
		let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
		let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
		if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) needDomLTPre = false;
		for (const c of dom) {
			hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
			hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
			if (gt) {
				if (needDomGTPre) {
					if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) needDomGTPre = false;
				}
				if (c.operator === ">" || c.operator === ">=") {
					higher = higherGT(gt, c, options);
					if (higher === c && higher !== gt) return false;
				} else if (gt.operator === ">=" && !c.test(gt.semver)) return false;
			}
			if (lt) {
				if (needDomLTPre) {
					if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) needDomLTPre = false;
				}
				if (c.operator === "<" || c.operator === "<=") {
					lower = lowerLT(lt, c, options);
					if (lower === c && lower !== lt) return false;
				} else if (lt.operator === "<=" && !c.test(lt.semver)) return false;
			}
			if (!c.operator && (lt || gt) && gtltComp !== 0) return false;
		}
		if (gt && hasDomLT && !lt && gtltComp !== 0) return false;
		if (lt && hasDomGT && !gt && gtltComp !== 0) return false;
		if (needDomGTPre || needDomLTPre) return false;
		return true;
	};
	var higherGT = (a, b, options) => {
		if (!a) return b;
		const comp = compare(a.semver, b.semver, options);
		return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
	};
	var lowerLT = (a, b, options) => {
		if (!a) return b;
		const comp = compare(a.semver, b.semver, options);
		return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
	};
	module.exports = subset;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/node_modules/semver/index.js
var require_semver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var internalRe = require_re();
	var constants = require_constants();
	var SemVer = require_semver$1();
	var identifiers = require_identifiers();
	module.exports = {
		parse: require_parse(),
		valid: require_valid$1(),
		clean: require_clean(),
		inc: require_inc(),
		diff: require_diff(),
		major: require_major(),
		minor: require_minor(),
		patch: require_patch(),
		prerelease: require_prerelease(),
		compare: require_compare(),
		rcompare: require_rcompare(),
		compareLoose: require_compare_loose(),
		compareBuild: require_compare_build(),
		sort: require_sort(),
		rsort: require_rsort(),
		gt: require_gt(),
		lt: require_lt(),
		eq: require_eq(),
		neq: require_neq(),
		gte: require_gte(),
		lte: require_lte(),
		cmp: require_cmp(),
		coerce: require_coerce(),
		truncate: require_truncate(),
		Comparator: require_comparator(),
		Range: require_range(),
		satisfies: require_satisfies(),
		toComparators: require_to_comparators(),
		maxSatisfying: require_max_satisfying(),
		minSatisfying: require_min_satisfying(),
		minVersion: require_min_version(),
		validRange: require_valid(),
		outside: require_outside(),
		gtr: require_gtr(),
		ltr: require_ltr(),
		intersects: require_intersects(),
		simplifyRange: require_simplify(),
		subset: require_subset(),
		SemVer,
		re: internalRe.re,
		src: internalRe.src,
		tokens: internalRe.t,
		SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
		RELEASE_TYPES: constants.RELEASE_TYPES,
		compareIdentifiers: identifiers.compareIdentifiers,
		rcompareIdentifiers: identifiers.rcompareIdentifiers
	};
}));
//#endregion
//#region node_modules/shimmer/index.js
var require_shimmer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function isFunction(funktion) {
		return typeof funktion === "function";
	}
	var logger = console.error.bind(console);
	function defineProperty(obj, name, value) {
		var enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
		Object.defineProperty(obj, name, {
			configurable: true,
			enumerable,
			writable: true,
			value
		});
	}
	function shimmer(options) {
		if (options && options.logger) if (!isFunction(options.logger)) logger("new logger isn't a function, not replacing");
		else logger = options.logger;
	}
	function wrap(nodule, name, wrapper) {
		if (!nodule || !nodule[name]) {
			logger("no original function " + name + " to wrap");
			return;
		}
		if (!wrapper) {
			logger("no wrapper function");
			logger((/* @__PURE__ */ new Error()).stack);
			return;
		}
		if (!isFunction(nodule[name]) || !isFunction(wrapper)) {
			logger("original object and wrapper must be functions");
			return;
		}
		var original = nodule[name];
		var wrapped = wrapper(original, name);
		defineProperty(wrapped, "__original", original);
		defineProperty(wrapped, "__unwrap", function() {
			if (nodule[name] === wrapped) defineProperty(nodule, name, original);
		});
		defineProperty(wrapped, "__wrapped", true);
		defineProperty(nodule, name, wrapped);
		return wrapped;
	}
	function massWrap(nodules, names, wrapper) {
		if (!nodules) {
			logger("must provide one or more modules to patch");
			logger((/* @__PURE__ */ new Error()).stack);
			return;
		} else if (!Array.isArray(nodules)) nodules = [nodules];
		if (!(names && Array.isArray(names))) {
			logger("must provide one or more functions to wrap on modules");
			return;
		}
		nodules.forEach(function(nodule) {
			names.forEach(function(name) {
				wrap(nodule, name, wrapper);
			});
		});
	}
	function unwrap(nodule, name) {
		if (!nodule || !nodule[name]) {
			logger("no function to unwrap.");
			logger((/* @__PURE__ */ new Error()).stack);
			return;
		}
		if (!nodule[name].__unwrap) logger("no original to unwrap to -- has " + name + " already been unwrapped?");
		else return nodule[name].__unwrap();
	}
	function massUnwrap(nodules, names) {
		if (!nodules) {
			logger("must provide one or more modules to patch");
			logger((/* @__PURE__ */ new Error()).stack);
			return;
		} else if (!Array.isArray(nodules)) nodules = [nodules];
		if (!(names && Array.isArray(names))) {
			logger("must provide one or more functions to unwrap on modules");
			return;
		}
		nodules.forEach(function(nodule) {
			names.forEach(function(name) {
				unwrap(nodule, name);
			});
		});
	}
	shimmer.wrap = wrap;
	shimmer.massWrap = massWrap;
	shimmer.unwrap = unwrap;
	shimmer.massUnwrap = massUnwrap;
	module.exports = shimmer;
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/instrumentation.js
var import_src$1, import_shimmer$1, __assign, InstrumentationAbstract;
var init_instrumentation$1 = __esmMin((() => {
	import_src$1 = /* @__PURE__ */ __toESM(require_src());
	init_esm$1();
	import_shimmer$1 = /* @__PURE__ */ __toESM(require_shimmer());
	__assign = function() {
		__assign = Object.assign || function(t) {
			for (var s, i = 1, n = arguments.length; i < n; i++) {
				s = arguments[i];
				for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
			}
			return t;
		};
		return __assign.apply(this, arguments);
	};
	InstrumentationAbstract = function() {
		function InstrumentationAbstract(instrumentationName, instrumentationVersion, config) {
			this.instrumentationName = instrumentationName;
			this.instrumentationVersion = instrumentationVersion;
			this._config = {};
			this._wrap = import_shimmer$1.wrap;
			this._unwrap = import_shimmer$1.unwrap;
			this._massWrap = import_shimmer$1.massWrap;
			this._massUnwrap = import_shimmer$1.massUnwrap;
			this.setConfig(config);
			this._diag = import_src$1.diag.createComponentLogger({ namespace: instrumentationName });
			this._tracer = import_src$1.trace.getTracer(instrumentationName, instrumentationVersion);
			this._meter = import_src$1.metrics.getMeter(instrumentationName, instrumentationVersion);
			this._logger = logs.getLogger(instrumentationName, instrumentationVersion);
			this._updateMetricInstruments();
		}
		Object.defineProperty(InstrumentationAbstract.prototype, "meter", {
			get: function() {
				return this._meter;
			},
			enumerable: false,
			configurable: true
		});
		/**
		* Sets MeterProvider to this plugin
		* @param meterProvider
		*/
		InstrumentationAbstract.prototype.setMeterProvider = function(meterProvider) {
			this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
			this._updateMetricInstruments();
		};
		Object.defineProperty(InstrumentationAbstract.prototype, "logger", {
			get: function() {
				return this._logger;
			},
			enumerable: false,
			configurable: true
		});
		/**
		* Sets LoggerProvider to this plugin
		* @param loggerProvider
		*/
		InstrumentationAbstract.prototype.setLoggerProvider = function(loggerProvider) {
			this._logger = loggerProvider.getLogger(this.instrumentationName, this.instrumentationVersion);
		};
		/**
		* @experimental
		*
		* Get module definitions defined by {@link init}.
		* This can be used for experimental compile-time instrumentation.
		*
		* @returns an array of {@link InstrumentationModuleDefinition}
		*/
		InstrumentationAbstract.prototype.getModuleDefinitions = function() {
			var _a;
			var initResult = (_a = this.init()) !== null && _a !== void 0 ? _a : [];
			if (!Array.isArray(initResult)) return [initResult];
			return initResult;
		};
		/**
		* Sets the new metric instruments with the current Meter.
		*/
		InstrumentationAbstract.prototype._updateMetricInstruments = function() {};
		InstrumentationAbstract.prototype.getConfig = function() {
			return this._config;
		};
		/**
		* Sets InstrumentationConfig to this plugin
		* @param config
		*/
		InstrumentationAbstract.prototype.setConfig = function(config) {
			this._config = __assign({ enabled: true }, config);
		};
		/**
		* Sets TraceProvider to this plugin
		* @param tracerProvider
		*/
		InstrumentationAbstract.prototype.setTracerProvider = function(tracerProvider) {
			this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
		};
		Object.defineProperty(InstrumentationAbstract.prototype, "tracer", {
			get: function() {
				return this._tracer;
			},
			enumerable: false,
			configurable: true
		});
		/**
		* Execute span customization hook, if configured, and log any errors.
		* Any semantics of the trigger and info are defined by the specific instrumentation.
		* @param hookHandler The optional hook handler which the user has configured via instrumentation config
		* @param triggerName The name of the trigger for executing the hook for logging purposes
		* @param span The span to which the hook should be applied
		* @param info The info object to be passed to the hook, with useful data the hook may use
		*/
		InstrumentationAbstract.prototype._runSpanCustomizationHook = function(hookHandler, triggerName, span, info) {
			if (!hookHandler) return;
			try {
				hookHandler(span, info);
			} catch (e) {
				this._diag.error("Error running span customization hook due to exception in handler", { triggerName }, e);
			}
		};
		return InstrumentationAbstract;
	}();
})), __values$2, __read, __spreadArray, ModuleNameTrieNode, ModuleNameTrie;
var init_ModuleNameTrie = __esmMin((() => {
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
	ModuleNameTrieNode = function() {
		function ModuleNameTrieNode() {
			this.hooks = [];
			this.children = /* @__PURE__ */ new Map();
		}
		return ModuleNameTrieNode;
	}();
	ModuleNameTrie = function() {
		function ModuleNameTrie() {
			this._trie = new ModuleNameTrieNode();
			this._counter = 0;
		}
		/**
		* Insert a module hook into the trie
		*
		* @param {Hooked} hook Hook
		*/
		ModuleNameTrie.prototype.insert = function(hook) {
			var e_1, _a;
			var trieNode = this._trie;
			try {
				for (var _b = __values$2(hook.moduleName.split("/")), _c = _b.next(); !_c.done; _c = _b.next()) {
					var moduleNamePart = _c.value;
					var nextNode = trieNode.children.get(moduleNamePart);
					if (!nextNode) {
						nextNode = new ModuleNameTrieNode();
						trieNode.children.set(moduleNamePart, nextNode);
					}
					trieNode = nextNode;
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
			trieNode.hooks.push({
				hook,
				insertedId: this._counter++
			});
		};
		/**
		* Search for matching hooks in the trie
		*
		* @param {string} moduleName Module name
		* @param {boolean} maintainInsertionOrder Whether to return the results in insertion order
		* @param {boolean} fullOnly Whether to return only full matches
		* @returns {Hooked[]} Matching hooks
		*/
		ModuleNameTrie.prototype.search = function(moduleName, _a) {
			var e_2, _b;
			var _c = _a === void 0 ? {} : _a, maintainInsertionOrder = _c.maintainInsertionOrder, fullOnly = _c.fullOnly;
			var trieNode = this._trie;
			var results = [];
			var foundFull = true;
			try {
				for (var _d = __values$2(moduleName.split("/")), _e = _d.next(); !_e.done; _e = _d.next()) {
					var moduleNamePart = _e.value;
					var nextNode = trieNode.children.get(moduleNamePart);
					if (!nextNode) {
						foundFull = false;
						break;
					}
					if (!fullOnly) results.push.apply(results, __spreadArray([], __read(nextNode.hooks), false));
					trieNode = nextNode;
				}
			} catch (e_2_1) {
				e_2 = { error: e_2_1 };
			} finally {
				try {
					if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
				} finally {
					if (e_2) throw e_2.error;
				}
			}
			if (fullOnly && foundFull) results.push.apply(results, __spreadArray([], __read(trieNode.hooks), false));
			if (results.length === 0) return [];
			if (results.length === 1) return [results[0].hook];
			if (maintainInsertionOrder) results.sort(function(a, b) {
				return a.insertedId - b.insertedId;
			});
			return results.map(function(_a) {
				return _a.hook;
			});
		};
		return ModuleNameTrie;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/platform/node/RequireInTheMiddleSingleton.js
/**
* Normalize the path separators to forward slash in a module name or path
*
* @param {string} moduleNameOrPath Module name or path
* @returns {string} Normalized module name or path
*/
function normalizePathSeparators(moduleNameOrPath) {
	return path$1.sep !== "/" ? moduleNameOrPath.split(path$1.sep).join("/") : moduleNameOrPath;
}
var __values$1, isMocha, RequireInTheMiddleSingleton;
var init_RequireInTheMiddleSingleton = __esmMin((() => {
	init_ModuleNameTrie();
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
	isMocha = [
		"afterEach",
		"after",
		"beforeEach",
		"before",
		"describe",
		"it"
	].every(function(fn) {
		return typeof global[fn] === "function";
	});
	RequireInTheMiddleSingleton = function() {
		function RequireInTheMiddleSingleton() {
			this._moduleNameTrie = new ModuleNameTrie();
			this._initialize();
		}
		RequireInTheMiddleSingleton.prototype._initialize = function() {
			var _this = this;
			new Hook(null, { internals: true }, function(exports, name, basedir) {
				var e_1, _a;
				var normalizedModuleName = normalizePathSeparators(name);
				var matches = _this._moduleNameTrie.search(normalizedModuleName, {
					maintainInsertionOrder: true,
					fullOnly: basedir === void 0
				});
				try {
					for (var matches_1 = __values$1(matches), matches_1_1 = matches_1.next(); !matches_1_1.done; matches_1_1 = matches_1.next()) {
						var onRequire = matches_1_1.value.onRequire;
						exports = onRequire(exports, name, basedir);
					}
				} catch (e_1_1) {
					e_1 = { error: e_1_1 };
				} finally {
					try {
						if (matches_1_1 && !matches_1_1.done && (_a = matches_1.return)) _a.call(matches_1);
					} finally {
						if (e_1) throw e_1.error;
					}
				}
				return exports;
			});
		};
		/**
		* Register a hook with `require-in-the-middle`
		*
		* @param {string} moduleName Module name
		* @param {OnRequireFn} onRequire Hook function
		* @returns {Hooked} Registered hook
		*/
		RequireInTheMiddleSingleton.prototype.register = function(moduleName, onRequire) {
			var hooked = {
				moduleName,
				onRequire
			};
			this._moduleNameTrie.insert(hooked);
			return hooked;
		};
		/**
		* Get the `RequireInTheMiddleSingleton` singleton
		*
		* @returns {RequireInTheMiddleSingleton} Singleton of `RequireInTheMiddleSingleton`
		*/
		RequireInTheMiddleSingleton.getInstance = function() {
			var _a;
			if (isMocha) return new RequireInTheMiddleSingleton();
			return this._instance = (_a = this._instance) !== null && _a !== void 0 ? _a : new RequireInTheMiddleSingleton();
		};
		return RequireInTheMiddleSingleton;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/utils.js
/**
* function to execute patched function and being able to catch errors
* @param execute - function to be executed
* @param onFinish - callback to run when execute finishes
*/
function safeExecuteInTheMiddle(execute, onFinish, preventThrowingError) {
	var error;
	var result;
	try {
		result = execute();
	} catch (e) {
		error = e;
	} finally {
		onFinish(error, result);
		if (error && !preventThrowingError) throw error;
		return result;
	}
}
/**
* Async function to execute patched function and being able to catch errors
* @param execute - function to be executed
* @param onFinish - callback to run when execute finishes
*/
function safeExecuteInTheMiddleAsync(execute, onFinish, preventThrowingError) {
	return __awaiter(this, void 0, void 0, function() {
		var error, result, e_1;
		return __generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([
						0,
						2,
						3,
						4
					]);
					return [4, execute()];
				case 1:
					result = _a.sent();
					return [3, 4];
				case 2:
					e_1 = _a.sent();
					error = e_1;
					return [3, 4];
				case 3:
					onFinish(error, result);
					if (error && !preventThrowingError) throw error;
					return [2, result];
				case 4: return [2];
			}
		});
	});
}
/**
* Checks if certain function has been already wrapped
* @param func
*/
function isWrapped(func) {
	return typeof func === "function" && typeof func.__original === "function" && typeof func.__unwrap === "function" && func.__wrapped === true;
}
var __awaiter, __generator;
var init_utils = __esmMin((() => {
	__awaiter = function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	__generator = function(thisArg, body) {
		var _ = {
			label: 0,
			sent: function() {
				if (t[0] & 1) throw t[1];
				return t[1];
			},
			trys: [],
			ops: []
		}, f, y, t, g;
		return g = {
			next: verb(0),
			"throw": verb(1),
			"return": verb(2)
		}, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
			return this;
		}), g;
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError("Generator is already executing.");
			while (_) try {
				if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
				if (y = 0, t) op = [op[0] & 2, t.value];
				switch (op[0]) {
					case 0:
					case 1:
						t = op;
						break;
					case 4:
						_.label++;
						return {
							value: op[1],
							done: false
						};
					case 5:
						_.label++;
						y = op[1];
						op = [0];
						continue;
					case 7:
						op = _.ops.pop();
						_.trys.pop();
						continue;
					default:
						if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
							_ = 0;
							continue;
						}
						if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
							_.label = op[1];
							break;
						}
						if (op[0] === 6 && _.label < t[1]) {
							_.label = t[1];
							t = op;
							break;
						}
						if (t && _.label < t[2]) {
							_.label = t[2];
							_.ops.push(op);
							break;
						}
						if (t[2]) _.ops.pop();
						_.trys.pop();
						continue;
				}
				op = body.call(thisArg, _);
			} catch (e) {
				op = [6, e];
				y = 0;
			} finally {
				f = t = 0;
			}
			if (op[0] & 5) throw op[1];
			return {
				value: op[0] ? op[1] : void 0,
				done: true
			};
		}
	};
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
function isSupported(supportedVersions, version, includePrerelease) {
	if (typeof version === "undefined") return supportedVersions.includes("*");
	return supportedVersions.some(function(supportedVersion) {
		return (0, import_semver.satisfies)(version, supportedVersion, { includePrerelease });
	});
}
var import_semver, import_shimmer, import_src, __extends, __values, InstrumentationBase;
var init_instrumentation = __esmMin((() => {
	import_semver = require_semver();
	import_shimmer = /* @__PURE__ */ __toESM(require_shimmer());
	init_instrumentation$1();
	init_RequireInTheMiddleSingleton();
	import_src = /* @__PURE__ */ __toESM(require_src());
	init_utils();
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
	InstrumentationBase = function(_super) {
		__extends(InstrumentationBase, _super);
		function InstrumentationBase(instrumentationName, instrumentationVersion, config) {
			var _this = _super.call(this, instrumentationName, instrumentationVersion, config) || this;
			_this._hooks = [];
			_this._requireInTheMiddleSingleton = RequireInTheMiddleSingleton.getInstance();
			_this._enabled = false;
			_this._wrap = function(moduleExports, name, wrapper) {
				if (isWrapped(moduleExports[name])) _this._unwrap(moduleExports, name);
				if (!types.isProxy(moduleExports)) return (0, import_shimmer.wrap)(moduleExports, name, wrapper);
				else {
					var wrapped = (0, import_shimmer.wrap)(Object.assign({}, moduleExports), name, wrapper);
					Object.defineProperty(moduleExports, name, { value: wrapped });
					return wrapped;
				}
			};
			_this._unwrap = function(moduleExports, name) {
				if (!types.isProxy(moduleExports)) return (0, import_shimmer.unwrap)(moduleExports, name);
				else return Object.defineProperty(moduleExports, name, { value: moduleExports[name] });
			};
			_this._massWrap = function(moduleExportsArray, names, wrapper) {
				if (!moduleExportsArray) {
					import_src.diag.error("must provide one or more modules to patch");
					return;
				} else if (!Array.isArray(moduleExportsArray)) moduleExportsArray = [moduleExportsArray];
				if (!(names && Array.isArray(names))) {
					import_src.diag.error("must provide one or more functions to wrap on modules");
					return;
				}
				moduleExportsArray.forEach(function(moduleExports) {
					names.forEach(function(name) {
						_this._wrap(moduleExports, name, wrapper);
					});
				});
			};
			_this._massUnwrap = function(moduleExportsArray, names) {
				if (!moduleExportsArray) {
					import_src.diag.error("must provide one or more modules to patch");
					return;
				} else if (!Array.isArray(moduleExportsArray)) moduleExportsArray = [moduleExportsArray];
				if (!(names && Array.isArray(names))) {
					import_src.diag.error("must provide one or more functions to wrap on modules");
					return;
				}
				moduleExportsArray.forEach(function(moduleExports) {
					names.forEach(function(name) {
						_this._unwrap(moduleExports, name);
					});
				});
			};
			var modules = _this.init();
			if (modules && !Array.isArray(modules)) modules = [modules];
			_this._modules = modules || [];
			if (_this._config.enabled) _this.enable();
			return _this;
		}
		InstrumentationBase.prototype._warnOnPreloadedModules = function() {
			var _this = this;
			this._modules.forEach(function(module) {
				var name = module.name;
				try {
					var resolvedModule = __require.resolve(name);
					if (__require.cache[resolvedModule]) _this._diag.warn("Module " + name + " has been loaded before " + _this.instrumentationName + " so it might not work, please initialize it before requiring " + name);
				} catch (_a) {}
			});
		};
		InstrumentationBase.prototype._extractPackageVersion = function(baseDir) {
			try {
				var json = readFileSync(path$1.join(baseDir, "package.json"), { encoding: "utf8" });
				var version = JSON.parse(json).version;
				return typeof version === "string" ? version : void 0;
			} catch (error) {
				import_src.diag.warn("Failed extracting version", baseDir);
			}
		};
		InstrumentationBase.prototype._onRequire = function(module, exports, name, baseDir) {
			var _this = this;
			var _a;
			if (!baseDir) {
				if (typeof module.patch === "function") {
					module.moduleExports = exports;
					if (this._enabled) {
						this._diag.debug("Applying instrumentation patch for nodejs core module on require hook", { module: module.name });
						return module.patch(exports);
					}
				}
				return exports;
			}
			var version = this._extractPackageVersion(baseDir);
			module.moduleVersion = version;
			if (module.name === name) {
				if (isSupported(module.supportedVersions, version, module.includePrerelease)) {
					if (typeof module.patch === "function") {
						module.moduleExports = exports;
						if (this._enabled) {
							this._diag.debug("Applying instrumentation patch for module on require hook", {
								module: module.name,
								version: module.moduleVersion,
								baseDir
							});
							return module.patch(exports, module.moduleVersion);
						}
					}
				}
				return exports;
			}
			var files = (_a = module.files) !== null && _a !== void 0 ? _a : [];
			var normalizedName = path$1.normalize(name);
			return files.filter(function(f) {
				return f.name === normalizedName;
			}).filter(function(f) {
				return isSupported(f.supportedVersions, version, module.includePrerelease);
			}).reduce(function(patchedExports, file) {
				file.moduleExports = patchedExports;
				if (_this._enabled) {
					_this._diag.debug("Applying instrumentation patch for nodejs module file on require hook", {
						module: module.name,
						version: module.moduleVersion,
						fileName: file.name,
						baseDir
					});
					return file.patch(patchedExports, module.moduleVersion);
				}
				return patchedExports;
			}, exports);
		};
		InstrumentationBase.prototype.enable = function() {
			var e_1, _a, e_2, _b, e_3, _c;
			var _this = this;
			if (this._enabled) return;
			this._enabled = true;
			if (this._hooks.length > 0) {
				try {
					for (var _d = __values(this._modules), _e = _d.next(); !_e.done; _e = _d.next()) {
						var module_1 = _e.value;
						if (typeof module_1.patch === "function" && module_1.moduleExports) {
							this._diag.debug("Applying instrumentation patch for nodejs module on instrumentation enabled", {
								module: module_1.name,
								version: module_1.moduleVersion
							});
							module_1.patch(module_1.moduleExports, module_1.moduleVersion);
						}
						try {
							for (var _f = (e_2 = void 0, __values(module_1.files)), _g = _f.next(); !_g.done; _g = _f.next()) {
								var file = _g.value;
								if (file.moduleExports) {
									this._diag.debug("Applying instrumentation patch for nodejs module file on instrumentation enabled", {
										module: module_1.name,
										version: module_1.moduleVersion,
										fileName: file.name
									});
									file.patch(file.moduleExports, module_1.moduleVersion);
								}
							}
						} catch (e_2_1) {
							e_2 = { error: e_2_1 };
						} finally {
							try {
								if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
							} finally {
								if (e_2) throw e_2.error;
							}
						}
					}
				} catch (e_1_1) {
					e_1 = { error: e_1_1 };
				} finally {
					try {
						if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
					} finally {
						if (e_1) throw e_1.error;
					}
				}
				return;
			}
			this._warnOnPreloadedModules();
			var _loop_1 = function(module_2) {
				var hookFn = function(exports, name, baseDir) {
					if (!baseDir && path$1.isAbsolute(name)) {
						var parsedPath = path$1.parse(name);
						name = parsedPath.name;
						baseDir = parsedPath.dir;
					}
					return _this._onRequire(module_2, exports, name, baseDir);
				};
				var onRequire = function(exports, name, baseDir) {
					return _this._onRequire(module_2, exports, name, baseDir);
				};
				var hook = path$1.isAbsolute(module_2.name) ? new Hook([module_2.name], { internals: true }, onRequire) : this_1._requireInTheMiddleSingleton.register(module_2.name, onRequire);
				this_1._hooks.push(hook);
				var esmHook = new Hook$1([module_2.name], { internals: false }, hookFn);
				this_1._hooks.push(esmHook);
			};
			var this_1 = this;
			try {
				for (var _h = __values(this._modules), _j = _h.next(); !_j.done; _j = _h.next()) {
					var module_2 = _j.value;
					_loop_1(module_2);
				}
			} catch (e_3_1) {
				e_3 = { error: e_3_1 };
			} finally {
				try {
					if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
				} finally {
					if (e_3) throw e_3.error;
				}
			}
		};
		InstrumentationBase.prototype.disable = function() {
			var e_4, _a, e_5, _b;
			if (!this._enabled) return;
			this._enabled = false;
			try {
				for (var _c = __values(this._modules), _d = _c.next(); !_d.done; _d = _c.next()) {
					var module_3 = _d.value;
					if (typeof module_3.unpatch === "function" && module_3.moduleExports) {
						this._diag.debug("Removing instrumentation patch for nodejs module on instrumentation disabled", {
							module: module_3.name,
							version: module_3.moduleVersion
						});
						module_3.unpatch(module_3.moduleExports, module_3.moduleVersion);
					}
					try {
						for (var _e = (e_5 = void 0, __values(module_3.files)), _f = _e.next(); !_f.done; _f = _e.next()) {
							var file = _f.value;
							if (file.moduleExports) {
								this._diag.debug("Removing instrumentation patch for nodejs module file on instrumentation disabled", {
									module: module_3.name,
									version: module_3.moduleVersion,
									fileName: file.name
								});
								file.unpatch(file.moduleExports, module_3.moduleVersion);
							}
						}
					} catch (e_5_1) {
						e_5 = { error: e_5_1 };
					} finally {
						try {
							if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
						} finally {
							if (e_5) throw e_5.error;
						}
					}
				}
			} catch (e_4_1) {
				e_4 = { error: e_4_1 };
			} finally {
				try {
					if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
				} finally {
					if (e_4) throw e_4.error;
				}
			}
		};
		InstrumentationBase.prototype.isEnabled = function() {
			return this._enabled;
		};
		return InstrumentationBase;
	}(InstrumentationAbstract);
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/platform/node/normalize.js
var init_normalize = __esmMin((() => {}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/platform/node/index.js
var init_node = __esmMin((() => {
	init_instrumentation();
	init_normalize();
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/platform/index.js
var init_platform = __esmMin((() => {
	init_node();
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/instrumentationNodeModuleDefinition.js
var InstrumentationNodeModuleDefinition;
var init_instrumentationNodeModuleDefinition = __esmMin((() => {
	InstrumentationNodeModuleDefinition = function() {
		function InstrumentationNodeModuleDefinition(name, supportedVersions, patch, unpatch, files) {
			this.name = name;
			this.supportedVersions = supportedVersions;
			this.patch = patch;
			this.unpatch = unpatch;
			this.files = files || [];
		}
		return InstrumentationNodeModuleDefinition;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/instrumentationNodeModuleFile.js
var InstrumentationNodeModuleFile;
var init_instrumentationNodeModuleFile = __esmMin((() => {
	init_platform();
	InstrumentationNodeModuleFile = function() {
		function InstrumentationNodeModuleFile(name, supportedVersions, patch, unpatch) {
			this.supportedVersions = supportedVersions;
			this.patch = patch;
			this.unpatch = unpatch;
			this.name = normalize(name);
		}
		return InstrumentationNodeModuleFile;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/instrumentation/build/esm/index.js
var esm_exports = /* @__PURE__ */ __exportAll({
	InstrumentationBase: () => InstrumentationBase,
	InstrumentationNodeModuleDefinition: () => InstrumentationNodeModuleDefinition,
	InstrumentationNodeModuleFile: () => InstrumentationNodeModuleFile,
	isWrapped: () => isWrapped,
	registerInstrumentations: () => registerInstrumentations,
	safeExecuteInTheMiddle: () => safeExecuteInTheMiddle,
	safeExecuteInTheMiddleAsync: () => safeExecuteInTheMiddleAsync
});
var init_esm = __esmMin((() => {
	init_autoLoader();
	init_platform();
	init_instrumentationNodeModuleDefinition();
	init_instrumentationNodeModuleFile();
	init_utils();
}));
//#endregion
export { InstrumentationNodeModuleDefinition as a, init_instrumentation as c, safeExecuteInTheMiddle as d, init_autoLoader as f, init_instrumentationNodeModuleFile as i, init_utils as l, init_esm as n, init_instrumentationNodeModuleDefinition as o, registerInstrumentations as p, InstrumentationNodeModuleFile as r, InstrumentationBase as s, esm_exports as t, isWrapped as u };
