import { n as __esmMin } from "../_runtime.mjs";
//#region node_modules/@opentelemetry/api-logs/build/esm/NoopLogger.js
var NoopLogger, NOOP_LOGGER;
var init_NoopLogger = __esmMin((() => {
	NoopLogger = function() {
		function NoopLogger() {}
		NoopLogger.prototype.emit = function(_logRecord) {};
		return NoopLogger;
	}();
	NOOP_LOGGER = new NoopLogger();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/NoopLoggerProvider.js
var NoopLoggerProvider, NOOP_LOGGER_PROVIDER;
var init_NoopLoggerProvider = __esmMin((() => {
	init_NoopLogger();
	NoopLoggerProvider = function() {
		function NoopLoggerProvider() {}
		NoopLoggerProvider.prototype.getLogger = function(_name, _version, _options) {
			return new NoopLogger();
		};
		return NoopLoggerProvider;
	}();
	NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/ProxyLogger.js
var ProxyLogger;
var init_ProxyLogger = __esmMin((() => {
	init_NoopLogger();
	ProxyLogger = function() {
		function ProxyLogger(_provider, name, version, options) {
			this._provider = _provider;
			this.name = name;
			this.version = version;
			this.options = options;
		}
		/**
		* Emit a log record. This method should only be used by log appenders.
		*
		* @param logRecord
		*/
		ProxyLogger.prototype.emit = function(logRecord) {
			this._getLogger().emit(logRecord);
		};
		/**
		* Try to get a logger from the proxy logger provider.
		* If the proxy logger provider has no delegate, return a noop logger.
		*/
		ProxyLogger.prototype._getLogger = function() {
			if (this._delegate) return this._delegate;
			var logger = this._provider.getDelegateLogger(this.name, this.version, this.options);
			if (!logger) return NOOP_LOGGER;
			this._delegate = logger;
			return this._delegate;
		};
		return ProxyLogger;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/ProxyLoggerProvider.js
var ProxyLoggerProvider;
var init_ProxyLoggerProvider = __esmMin((() => {
	init_NoopLoggerProvider();
	init_ProxyLogger();
	ProxyLoggerProvider = function() {
		function ProxyLoggerProvider() {}
		ProxyLoggerProvider.prototype.getLogger = function(name, version, options) {
			var _a;
			return (_a = this.getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyLogger(this, name, version, options);
		};
		ProxyLoggerProvider.prototype.getDelegate = function() {
			var _a;
			return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_LOGGER_PROVIDER;
		};
		/**
		* Set the delegate logger provider
		*/
		ProxyLoggerProvider.prototype.setDelegate = function(delegate) {
			this._delegate = delegate;
		};
		ProxyLoggerProvider.prototype.getDelegateLogger = function(name, version, options) {
			var _a;
			return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
		};
		return ProxyLoggerProvider;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/platform/node/globalThis.js
var _globalThis;
var init_globalThis = __esmMin((() => {
	_globalThis = typeof globalThis === "object" ? globalThis : global;
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/platform/node/index.js
var init_node = __esmMin((() => {
	init_globalThis();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/platform/index.js
var init_platform = __esmMin((() => {
	init_node();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/internal/global-utils.js
/**
* Make a function which accepts a version integer and returns the instance of an API if the version
* is compatible, or a fallback version (usually NOOP) if it is not.
*
* @param requiredVersion Backwards compatibility version which is required to return the instance
* @param instance Instance which should be returned if the required version is compatible
* @param fallback Fallback instance, usually NOOP, which will be returned if the required version is not compatible
*/
function makeGetter(requiredVersion, instance, fallback) {
	return function(version) {
		return version === requiredVersion ? instance : fallback;
	};
}
var GLOBAL_LOGS_API_KEY, _global;
var init_global_utils = __esmMin((() => {
	init_platform();
	GLOBAL_LOGS_API_KEY = Symbol.for("io.opentelemetry.js.api.logs");
	_global = _globalThis;
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/api/logs.js
var LogsAPI;
var init_logs = __esmMin((() => {
	init_global_utils();
	init_NoopLoggerProvider();
	init_ProxyLoggerProvider();
	LogsAPI = function() {
		function LogsAPI() {
			this._proxyLoggerProvider = new ProxyLoggerProvider();
		}
		LogsAPI.getInstance = function() {
			if (!this._instance) this._instance = new LogsAPI();
			return this._instance;
		};
		LogsAPI.prototype.setGlobalLoggerProvider = function(provider) {
			if (_global[GLOBAL_LOGS_API_KEY]) return this.getLoggerProvider();
			_global[GLOBAL_LOGS_API_KEY] = makeGetter(1, provider, NOOP_LOGGER_PROVIDER);
			this._proxyLoggerProvider.setDelegate(provider);
			return provider;
		};
		/**
		* Returns the global logger provider.
		*
		* @returns LoggerProvider
		*/
		LogsAPI.prototype.getLoggerProvider = function() {
			var _a, _b;
			return (_b = (_a = _global[GLOBAL_LOGS_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(_global, 1)) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
		};
		/**
		* Returns a logger from the global logger provider.
		*
		* @returns Logger
		*/
		LogsAPI.prototype.getLogger = function(name, version, options) {
			return this.getLoggerProvider().getLogger(name, version, options);
		};
		/** Remove the global logger provider */
		LogsAPI.prototype.disable = function() {
			delete _global[GLOBAL_LOGS_API_KEY];
			this._proxyLoggerProvider = new ProxyLoggerProvider();
		};
		return LogsAPI;
	}();
}));
//#endregion
//#region node_modules/@opentelemetry/api-logs/build/esm/index.js
var logs;
var init_esm = __esmMin((() => {
	init_NoopLogger();
	init_NoopLoggerProvider();
	init_ProxyLogger();
	init_ProxyLoggerProvider();
	init_logs();
	logs = LogsAPI.getInstance();
}));
//#endregion
export { logs as n, init_esm as t };
