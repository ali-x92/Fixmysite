import { i as __require, t as __commonJSMin } from "../../_runtime.mjs";
import { t as require_src$1 } from "../opentelemetry__api.mjs";
//#region node_modules/@opentelemetry/context-async-hooks/build/src/AbstractAsyncHooksContextManager.js
var require_AbstractAsyncHooksContextManager = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AbstractAsyncHooksContextManager = void 0;
	var events_1 = __require("events");
	var ADD_LISTENER_METHODS = [
		"addListener",
		"on",
		"once",
		"prependListener",
		"prependOnceListener"
	];
	var AbstractAsyncHooksContextManager = class {
		constructor() {
			this._kOtListeners = Symbol("OtListeners");
			this._wrapped = false;
		}
		/**
		* Binds a the certain context or the active one to the target function and then returns the target
		* @param context A context (span) to be bind to target
		* @param target a function or event emitter. When target or one of its callbacks is called,
		*  the provided context will be used as the active context for the duration of the call.
		*/
		bind(context, target) {
			if (target instanceof events_1.EventEmitter) return this._bindEventEmitter(context, target);
			if (typeof target === "function") return this._bindFunction(context, target);
			return target;
		}
		_bindFunction(context, target) {
			const manager = this;
			const contextWrapper = function(...args) {
				return manager.with(context, () => target.apply(this, args));
			};
			Object.defineProperty(contextWrapper, "length", {
				enumerable: false,
				configurable: true,
				writable: false,
				value: target.length
			});
			/**
			* It isn't possible to tell Typescript that contextWrapper is the same as T
			* so we forced to cast as any here.
			*/
			return contextWrapper;
		}
		/**
		* By default, EventEmitter call their callback with their context, which we do
		* not want, instead we will bind a specific context to all callbacks that
		* go through it.
		* @param context the context we want to bind
		* @param ee EventEmitter an instance of EventEmitter to patch
		*/
		_bindEventEmitter(context, ee) {
			if (this._getPatchMap(ee) !== void 0) return ee;
			this._createPatchMap(ee);
			ADD_LISTENER_METHODS.forEach((methodName) => {
				if (ee[methodName] === void 0) return;
				ee[methodName] = this._patchAddListener(ee, ee[methodName], context);
			});
			if (typeof ee.removeListener === "function") ee.removeListener = this._patchRemoveListener(ee, ee.removeListener);
			if (typeof ee.off === "function") ee.off = this._patchRemoveListener(ee, ee.off);
			if (typeof ee.removeAllListeners === "function") ee.removeAllListeners = this._patchRemoveAllListeners(ee, ee.removeAllListeners);
			return ee;
		}
		/**
		* Patch methods that remove a given listener so that we match the "patched"
		* version of that listener (the one that propagate context).
		* @param ee EventEmitter instance
		* @param original reference to the patched method
		*/
		_patchRemoveListener(ee, original) {
			const contextManager = this;
			return function(event, listener) {
				var _a;
				const events = (_a = contextManager._getPatchMap(ee)) === null || _a === void 0 ? void 0 : _a[event];
				if (events === void 0) return original.call(this, event, listener);
				const patchedListener = events.get(listener);
				return original.call(this, event, patchedListener || listener);
			};
		}
		/**
		* Patch methods that remove all listeners so we remove our
		* internal references for a given event.
		* @param ee EventEmitter instance
		* @param original reference to the patched method
		*/
		_patchRemoveAllListeners(ee, original) {
			const contextManager = this;
			return function(event) {
				const map = contextManager._getPatchMap(ee);
				if (map !== void 0) {
					if (arguments.length === 0) contextManager._createPatchMap(ee);
					else if (map[event] !== void 0) delete map[event];
				}
				return original.apply(this, arguments);
			};
		}
		/**
		* Patch methods on an event emitter instance that can add listeners so we
		* can force them to propagate a given context.
		* @param ee EventEmitter instance
		* @param original reference to the patched method
		* @param [context] context to propagate when calling listeners
		*/
		_patchAddListener(ee, original, context) {
			const contextManager = this;
			return function(event, listener) {
				/**
				* This check is required to prevent double-wrapping the listener.
				* The implementation for ee.once wraps the listener and calls ee.on.
				* Without this check, we would wrap that wrapped listener.
				* This causes an issue because ee.removeListener depends on the onceWrapper
				* to properly remove the listener. If we wrap their wrapper, we break
				* that detection.
				*/
				if (contextManager._wrapped) return original.call(this, event, listener);
				let map = contextManager._getPatchMap(ee);
				if (map === void 0) map = contextManager._createPatchMap(ee);
				let listeners = map[event];
				if (listeners === void 0) {
					listeners = /* @__PURE__ */ new WeakMap();
					map[event] = listeners;
				}
				const patchedListener = contextManager.bind(context, listener);
				listeners.set(listener, patchedListener);
				/**
				* See comment at the start of this function for the explanation of this property.
				*/
				contextManager._wrapped = true;
				try {
					return original.call(this, event, patchedListener);
				} finally {
					contextManager._wrapped = false;
				}
			};
		}
		_createPatchMap(ee) {
			const map = Object.create(null);
			ee[this._kOtListeners] = map;
			return map;
		}
		_getPatchMap(ee) {
			return ee[this._kOtListeners];
		}
	};
	exports.AbstractAsyncHooksContextManager = AbstractAsyncHooksContextManager;
}));
//#endregion
//#region node_modules/@opentelemetry/context-async-hooks/build/src/AsyncHooksContextManager.js
var require_AsyncHooksContextManager = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AsyncHooksContextManager = void 0;
	var api_1 = require_src$1();
	var asyncHooks = __require("async_hooks");
	var AbstractAsyncHooksContextManager_1 = require_AbstractAsyncHooksContextManager();
	var AsyncHooksContextManager = class extends AbstractAsyncHooksContextManager_1.AbstractAsyncHooksContextManager {
		constructor() {
			super();
			this._contexts = /* @__PURE__ */ new Map();
			this._stack = [];
			this._asyncHook = asyncHooks.createHook({
				init: this._init.bind(this),
				before: this._before.bind(this),
				after: this._after.bind(this),
				destroy: this._destroy.bind(this),
				promiseResolve: this._destroy.bind(this)
			});
		}
		active() {
			var _a;
			return (_a = this._stack[this._stack.length - 1]) !== null && _a !== void 0 ? _a : api_1.ROOT_CONTEXT;
		}
		with(context, fn, thisArg, ...args) {
			this._enterContext(context);
			try {
				return fn.call(thisArg, ...args);
			} finally {
				this._exitContext();
			}
		}
		enable() {
			this._asyncHook.enable();
			return this;
		}
		disable() {
			this._asyncHook.disable();
			this._contexts.clear();
			this._stack = [];
			return this;
		}
		/**
		* Init hook will be called when userland create a async context, setting the
		* context as the current one if it exist.
		* @param uid id of the async context
		* @param type the resource type
		*/
		_init(uid, type) {
			if (type === "TIMERWRAP") return;
			const context = this._stack[this._stack.length - 1];
			if (context !== void 0) this._contexts.set(uid, context);
		}
		/**
		* Destroy hook will be called when a given context is no longer used so we can
		* remove its attached context.
		* @param uid uid of the async context
		*/
		_destroy(uid) {
			this._contexts.delete(uid);
		}
		/**
		* Before hook is called just before executing a async context.
		* @param uid uid of the async context
		*/
		_before(uid) {
			const context = this._contexts.get(uid);
			if (context !== void 0) this._enterContext(context);
		}
		/**
		* After hook is called just after completing the execution of a async context.
		*/
		_after() {
			this._exitContext();
		}
		/**
		* Set the given context as active
		*/
		_enterContext(context) {
			this._stack.push(context);
		}
		/**
		* Remove the context at the root of the stack
		*/
		_exitContext() {
			this._stack.pop();
		}
	};
	exports.AsyncHooksContextManager = AsyncHooksContextManager;
}));
//#endregion
//#region node_modules/@opentelemetry/context-async-hooks/build/src/AsyncLocalStorageContextManager.js
var require_AsyncLocalStorageContextManager = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AsyncLocalStorageContextManager = void 0;
	var api_1 = require_src$1();
	var async_hooks_1 = __require("async_hooks");
	var AbstractAsyncHooksContextManager_1 = require_AbstractAsyncHooksContextManager();
	var AsyncLocalStorageContextManager = class extends AbstractAsyncHooksContextManager_1.AbstractAsyncHooksContextManager {
		constructor() {
			super();
			this._asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
		}
		active() {
			var _a;
			return (_a = this._asyncLocalStorage.getStore()) !== null && _a !== void 0 ? _a : api_1.ROOT_CONTEXT;
		}
		with(context, fn, thisArg, ...args) {
			const cb = thisArg == null ? fn : fn.bind(thisArg);
			return this._asyncLocalStorage.run(context, cb, ...args);
		}
		enable() {
			return this;
		}
		disable() {
			this._asyncLocalStorage.disable();
			return this;
		}
	};
	exports.AsyncLocalStorageContextManager = AsyncLocalStorageContextManager;
}));
//#endregion
//#region node_modules/@opentelemetry/context-async-hooks/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AsyncLocalStorageContextManager = exports.AsyncHooksContextManager = void 0;
	var AsyncHooksContextManager_1 = require_AsyncHooksContextManager();
	Object.defineProperty(exports, "AsyncHooksContextManager", {
		enumerable: true,
		get: function() {
			return AsyncHooksContextManager_1.AsyncHooksContextManager;
		}
	});
	var AsyncLocalStorageContextManager_1 = require_AsyncLocalStorageContextManager();
	Object.defineProperty(exports, "AsyncLocalStorageContextManager", {
		enumerable: true,
		get: function() {
			return AsyncLocalStorageContextManager_1.AsyncLocalStorageContextManager;
		}
	});
}));
//#endregion
export { require_src as t };
