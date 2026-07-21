import { a as __toCommonJS, n as __esmMin, r as __exportAll, t as __commonJSMin } from "../../_runtime.mjs";
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/core/LanternError.js
var LanternError = class extends Error {};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/core/NetworkAnalyzer.js
var UrlUtils = class {
	/**
	* There is fancy URL rewriting logic for the chrome://settings page that we need to work around.
	* Why? Special handling was added by Chrome team to allow a pushState transition between chrome:// pages.
	* As a result, the network URL (chrome://chrome/settings/) doesn't match the final document URL (chrome://settings/).
	*/
	static rewriteChromeInternalUrl(url) {
		if (!url?.startsWith("chrome://")) return url;
		if (url.endsWith("/")) url = url.replace(/\/$/, "");
		return url.replace(/^chrome:\/\/chrome\//, "chrome://");
	}
	/**
	* Determine if url1 equals url2, ignoring URL fragments.
	*/
	static equalWithExcludedFragments(url1, url2) {
		[url1, url2] = [url1, url2].map(this.rewriteChromeInternalUrl);
		try {
			const urla = new URL(url1);
			urla.hash = "";
			const urlb = new URL(url2);
			urlb.hash = "";
			return urla.href === urlb.href;
		} catch {
			return false;
		}
	}
};
var INITIAL_CWD = 14 * 1024;
var DEFAULT_SERVER_RESPONSE_PERCENTAGE = .4;
/**
* For certain resource types, server response time takes up a greater percentage of TTFB (dynamic
* assets like HTML documents, XHR/API calls, etc)
*/
var SERVER_RESPONSE_PERCENTAGE_OF_TTFB = {
	Document: .9,
	XHR: .9,
	Fetch: .9
};
var NetworkAnalyzer = class NetworkAnalyzer {
	static get summary() {
		return "__SUMMARY__";
	}
	static groupByOrigin(records) {
		const grouped = /* @__PURE__ */ new Map();
		records.forEach((item) => {
			const key = item.parsedURL.securityOrigin;
			const group = grouped.get(key) || [];
			group.push(item);
			grouped.set(key, group);
		});
		return grouped;
	}
	static getSummary(values) {
		values.sort((a, b) => a - b);
		let median;
		if (values.length === 0) median = values[0];
		else if (values.length % 2 === 0) median = (values[Math.floor((values.length - 1) / 2)] + values[Math.floor((values.length - 1) / 2) + 1]) / 2;
		else median = values[Math.floor((values.length - 1) / 2)];
		return {
			min: values[0],
			max: values[values.length - 1],
			avg: values.reduce((a, b) => a + b, 0) / values.length,
			median
		};
	}
	static summarize(values) {
		const summaryByKey = /* @__PURE__ */ new Map();
		const allEstimates = [];
		for (const [key, estimates] of values) {
			summaryByKey.set(key, NetworkAnalyzer.getSummary(estimates));
			allEstimates.push(...estimates);
		}
		summaryByKey.set(NetworkAnalyzer.summary, NetworkAnalyzer.getSummary(allEstimates));
		return summaryByKey;
	}
	static estimateValueByOrigin(requests, iteratee) {
		const connectionWasReused = NetworkAnalyzer.estimateIfConnectionWasReused(requests);
		const groupedByOrigin = NetworkAnalyzer.groupByOrigin(requests);
		const estimates = /* @__PURE__ */ new Map();
		for (const [origin, originRequests] of groupedByOrigin.entries()) {
			let originEstimates = [];
			for (const request of originRequests) {
				const timing = request.timing;
				if (!timing) continue;
				const value = iteratee({
					request,
					timing,
					connectionReused: connectionWasReused.get(request.requestId)
				});
				if (typeof value !== "undefined") originEstimates = originEstimates.concat(value);
			}
			if (!originEstimates.length) continue;
			estimates.set(origin, originEstimates);
		}
		return estimates;
	}
	/**
	* Estimates the observed RTT to each origin based on how long the connection setup.
	* For h1 and h2, this could includes two estimates - one for the TCP handshake, another for
	* SSL negotiation.
	* For h3, we get only one estimate since QUIC establishes a secure connection in a
	* single handshake.
	* This is the most accurate and preferred method of measurement when the data is available.
	*/
	static estimateRTTViaConnectionTiming(info) {
		const { timing, connectionReused, request } = info;
		if (connectionReused) return;
		const { connectStart, sslStart, sslEnd, connectEnd } = timing;
		if (connectEnd >= 0 && connectStart >= 0 && request.protocol.startsWith("h3")) return connectEnd - connectStart;
		if (sslStart >= 0 && sslEnd >= 0 && sslStart !== connectStart) return [connectEnd - sslStart, sslStart - connectStart];
		if (connectStart >= 0 && connectEnd >= 0) return connectEnd - connectStart;
	}
	/**
	* Estimates the observed RTT to each origin based on how long a download took on a fresh connection.
	* NOTE: this will tend to overestimate the actual RTT quite significantly as the download can be
	* slow for other reasons as well such as bandwidth constraints.
	*/
	static estimateRTTViaDownloadTiming(info) {
		const { timing, connectionReused, request } = info;
		if (connectionReused) return;
		if (request.transferSize <= INITIAL_CWD) return;
		if (!Number.isFinite(timing.receiveHeadersEnd) || timing.receiveHeadersEnd < 0) return;
		const downloadTimeAfterFirstByte = request.networkEndTime - request.networkRequestTime - timing.receiveHeadersEnd;
		const numberOfRoundTrips = Math.log2(request.transferSize / INITIAL_CWD);
		if (numberOfRoundTrips > 5) return;
		return downloadTimeAfterFirstByte / numberOfRoundTrips;
	}
	/**
	* Estimates the observed RTT to each origin based on how long it took until Chrome could
	* start sending the actual request when a new connection was required.
	* NOTE: this will tend to overestimate the actual RTT as the request can be delayed for other
	* reasons as well such as more SSL handshakes if TLS False Start is not enabled.
	*/
	static estimateRTTViaSendStartTiming(info) {
		const { timing, connectionReused, request } = info;
		if (connectionReused) return;
		if (!Number.isFinite(timing.sendStart) || timing.sendStart < 0) return;
		let roundTrips = 1;
		if (!request.protocol.startsWith("h3")) roundTrips += 1;
		if (request.parsedURL.scheme === "https") roundTrips += 1;
		return timing.sendStart / roundTrips;
	}
	/**
	* Estimates the observed RTT to each origin based on how long it took until Chrome received the
	* headers of the response (~TTFB).
	* NOTE: this is the most inaccurate way to estimate the RTT, but in some environments it's all
	* we have access to :(
	*/
	static estimateRTTViaHeadersEndTiming(info) {
		const { timing, connectionReused, request } = info;
		if (!Number.isFinite(timing.receiveHeadersEnd) || timing.receiveHeadersEnd < 0) return;
		if (!request.resourceType) return;
		const serverResponseTimePercentage = SERVER_RESPONSE_PERCENTAGE_OF_TTFB[request.resourceType] || DEFAULT_SERVER_RESPONSE_PERCENTAGE;
		const estimatedServerResponseTime = timing.receiveHeadersEnd * serverResponseTimePercentage;
		let roundTrips = 1;
		if (!connectionReused) {
			roundTrips += 1;
			if (!request.protocol.startsWith("h3")) roundTrips += 1;
			if (request.parsedURL.scheme === "https") roundTrips += 1;
		}
		return Math.max((timing.receiveHeadersEnd - estimatedServerResponseTime) / roundTrips, 3);
	}
	/**
	* Given the RTT to each origin, estimates the observed server response times.
	*/
	static estimateResponseTimeByOrigin(records, rttByOrigin) {
		return NetworkAnalyzer.estimateValueByOrigin(records, ({ request, timing }) => {
			if (request.serverResponseTime !== void 0) return request.serverResponseTime;
			if (!Number.isFinite(timing.receiveHeadersEnd) || timing.receiveHeadersEnd < 0) return;
			if (!Number.isFinite(timing.sendEnd) || timing.sendEnd < 0) return;
			const ttfb = timing.receiveHeadersEnd - timing.sendEnd;
			const origin = request.parsedURL.securityOrigin;
			const rtt = rttByOrigin.get(origin) || rttByOrigin.get(NetworkAnalyzer.summary) || 0;
			return Math.max(ttfb - rtt, 0);
		});
	}
	static canTrustConnectionInformation(requests) {
		const connectionIdWasStarted = /* @__PURE__ */ new Map();
		for (const request of requests) {
			const started = connectionIdWasStarted.get(request.connectionId) || !request.connectionReused;
			connectionIdWasStarted.set(request.connectionId, started);
		}
		if (connectionIdWasStarted.size <= 1) return false;
		return Array.from(connectionIdWasStarted.values()).every((started) => started);
	}
	/**
	* Returns a map of requestId -> connectionReused, estimating the information if the information
	* available in the records themselves appears untrustworthy.
	*/
	static estimateIfConnectionWasReused(records, options) {
		const { forceCoarseEstimates = false } = options || {};
		if (!forceCoarseEstimates && NetworkAnalyzer.canTrustConnectionInformation(records)) return new Map(records.map((request) => [request.requestId, Boolean(request.connectionReused)]));
		const connectionWasReused = /* @__PURE__ */ new Map();
		const groupedByOrigin = NetworkAnalyzer.groupByOrigin(records);
		for (const originRecords of groupedByOrigin.values()) {
			const earliestReusePossible = originRecords.map((request) => request.networkEndTime).reduce((a, b) => Math.min(a, b), Infinity);
			for (const request of originRecords) connectionWasReused.set(request.requestId, request.networkRequestTime >= earliestReusePossible || request.protocol === "h2");
			const firstRecord = originRecords.reduce((a, b) => {
				return a.networkRequestTime > b.networkRequestTime ? b : a;
			});
			connectionWasReused.set(firstRecord.requestId, false);
		}
		return connectionWasReused;
	}
	/**
	* Estimates the RTT to each origin by examining observed network timing information.
	* Attempts to use the most accurate information first and falls back to coarser estimates when it
	* is unavailable.
	*/
	static estimateRTTByOrigin(records, options) {
		const { forceCoarseEstimates = false, coarseEstimateMultiplier = .3, useDownloadEstimates = true, useSendStartEstimates = true, useHeadersEndEstimates = true } = options || {};
		const connectionWasReused = NetworkAnalyzer.estimateIfConnectionWasReused(records);
		const groupedByOrigin = NetworkAnalyzer.groupByOrigin(records);
		const estimatesByOrigin = /* @__PURE__ */ new Map();
		for (const [origin, originRequests] of groupedByOrigin.entries()) {
			const originEstimates = [];
			function collectEstimates(estimator, multiplier = 1) {
				for (const request of originRequests) {
					const timing = request.timing;
					if (!timing || !request.transferSize) continue;
					const estimates = estimator({
						request,
						timing,
						connectionReused: connectionWasReused.get(request.requestId)
					});
					if (estimates === void 0) continue;
					if (!Array.isArray(estimates)) originEstimates.push(estimates * multiplier);
					else originEstimates.push(...estimates.map((e) => e * multiplier));
				}
			}
			if (!forceCoarseEstimates) collectEstimates(this.estimateRTTViaConnectionTiming);
			if (!originEstimates.length) {
				if (useDownloadEstimates) collectEstimates(this.estimateRTTViaDownloadTiming, coarseEstimateMultiplier);
				if (useSendStartEstimates) collectEstimates(this.estimateRTTViaSendStartTiming, coarseEstimateMultiplier);
				if (useHeadersEndEstimates) collectEstimates(this.estimateRTTViaHeadersEndTiming, coarseEstimateMultiplier);
			}
			if (originEstimates.length) estimatesByOrigin.set(origin, originEstimates);
		}
		if (!estimatesByOrigin.size) throw new LanternError("No timing information available");
		return NetworkAnalyzer.summarize(estimatesByOrigin);
	}
	/**
	* Estimates the server response time of each origin. RTT times can be passed in or will be
	* estimated automatically if not provided.
	*/
	static estimateServerResponseTimeByOrigin(records, options) {
		let rttByOrigin = options?.rttByOrigin;
		if (!rttByOrigin) {
			rttByOrigin = /* @__PURE__ */ new Map();
			const rttSummaryByOrigin = NetworkAnalyzer.estimateRTTByOrigin(records, options);
			for (const [origin, summary] of rttSummaryByOrigin.entries()) rttByOrigin.set(origin, summary.min);
		}
		const estimatesByOrigin = NetworkAnalyzer.estimateResponseTimeByOrigin(records, rttByOrigin);
		return NetworkAnalyzer.summarize(estimatesByOrigin);
	}
	/**
	* Computes the average throughput for the given requests in bits/second.
	* Excludes data URI, failed or otherwise incomplete, and cached requests.
	* Returns null if there were no analyzable network requests.
	*/
	static estimateThroughput(records) {
		let totalBytes = 0;
		const timeBoundaries = records.reduce((boundaries, request) => {
			if (request.parsedURL?.scheme === "data" || request.failed || !request.finished || request.statusCode > 300 || !request.transferSize) return boundaries;
			totalBytes += request.transferSize;
			boundaries.push({
				time: request.responseHeadersEndTime / 1e3,
				isStart: true
			});
			boundaries.push({
				time: request.networkEndTime / 1e3,
				isStart: false
			});
			return boundaries;
		}, []).sort((a, b) => a.time - b.time);
		if (!timeBoundaries.length) return null;
		let inflight = 0;
		let currentStart = 0;
		let totalDuration = 0;
		timeBoundaries.forEach((boundary) => {
			if (boundary.isStart) {
				if (inflight === 0) currentStart = boundary.time;
				inflight++;
			} else {
				inflight--;
				if (inflight === 0) totalDuration += boundary.time - currentStart;
			}
		});
		return totalBytes * 8 / totalDuration;
	}
	static computeRTTAndServerResponseTime(records) {
		const rttByOrigin = /* @__PURE__ */ new Map();
		for (const [origin, summary] of NetworkAnalyzer.estimateRTTByOrigin(records).entries()) rttByOrigin.set(origin, summary.min);
		const minimumRtt = Math.min(...Array.from(rttByOrigin.values()));
		const responseTimeSummaries = NetworkAnalyzer.estimateServerResponseTimeByOrigin(records, { rttByOrigin });
		const additionalRttByOrigin = /* @__PURE__ */ new Map();
		const serverResponseTimeByOrigin = /* @__PURE__ */ new Map();
		for (const [origin, summary] of responseTimeSummaries.entries()) {
			const rttForOrigin = rttByOrigin.get(origin) || minimumRtt;
			additionalRttByOrigin.set(origin, rttForOrigin - minimumRtt);
			serverResponseTimeByOrigin.set(origin, summary.median);
		}
		return {
			rtt: minimumRtt,
			additionalRttByOrigin,
			serverResponseTimeByOrigin
		};
	}
	static analyze(records) {
		const throughput = NetworkAnalyzer.estimateThroughput(records);
		if (throughput === null) return null;
		return {
			throughput,
			...NetworkAnalyzer.computeRTTAndServerResponseTime(records)
		};
	}
	static findResourceForUrl(records, resourceUrl) {
		return records.find((request) => resourceUrl.startsWith(request.url) && UrlUtils.equalWithExcludedFragments(request.url, resourceUrl));
	}
	static findLastDocumentForUrl(records, resourceUrl) {
		const matchingRequests = records.filter((request) => request.resourceType === "Document" && !request.failed && resourceUrl.startsWith(request.url) && UrlUtils.equalWithExcludedFragments(request.url, resourceUrl));
		return matchingRequests[matchingRequests.length - 1];
	}
	/**
	* Resolves redirect chain given a main document.
	* See: {@link NetworkAnalyzer.findLastDocumentForUrl} for how to retrieve main document.
	*/
	static resolveRedirects(request) {
		while (request.redirectDestination) request = request.redirectDestination;
		return request;
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/graph/BaseNode.js
/**
* @file This class encapsulates logic for handling resources and tasks used to model the
* execution dependency graph of the page. A node has a unique identifier and can depend on other
* nodes/be depended on. The construction of the graph maintains some important invariants that are
* inherent to the model:
*
*    1. The graph is a DAG, there are no cycles.
*    2. There is always a root node upon which all other nodes eventually depend.
*
* This allows particular optimizations in this class so that we do no need to check for cycles as
* these methods are called and we can always start traversal at the root node.
*/
var BaseNode = class BaseNode {
	static types = {
		NETWORK: "network",
		CPU: "cpu"
	};
	_id;
	_isMainDocument;
	dependents;
	dependencies;
	constructor(id) {
		this._id = id;
		this._isMainDocument = false;
		this.dependents = [];
		this.dependencies = [];
	}
	get id() {
		return this._id;
	}
	get type() {
		throw new LanternError("Unimplemented");
	}
	/**
	* In microseconds
	*/
	get startTime() {
		throw new LanternError("Unimplemented");
	}
	/**
	* In microseconds
	*/
	get endTime() {
		throw new LanternError("Unimplemented");
	}
	setIsMainDocument(value) {
		this._isMainDocument = value;
	}
	isMainDocument() {
		return this._isMainDocument;
	}
	getDependents() {
		return this.dependents.slice();
	}
	getNumberOfDependents() {
		return this.dependents.length;
	}
	getDependencies() {
		return this.dependencies.slice();
	}
	getNumberOfDependencies() {
		return this.dependencies.length;
	}
	getRootNode() {
		let rootNode = this;
		while (rootNode.dependencies.length) rootNode = rootNode.dependencies[0];
		return rootNode;
	}
	addDependent(node) {
		node.addDependency(this);
	}
	addDependency(node) {
		if (node === this) throw new LanternError("Cannot add dependency on itself");
		if (this.dependencies.includes(node)) return;
		node.dependents.push(this);
		this.dependencies.push(node);
	}
	removeDependent(node) {
		node.removeDependency(this);
	}
	removeDependency(node) {
		if (!this.dependencies.includes(node)) return;
		const thisIndex = node.dependents.indexOf(this);
		node.dependents.splice(thisIndex, 1);
		this.dependencies.splice(this.dependencies.indexOf(node), 1);
	}
	removeAllDependencies() {
		for (const node of this.dependencies.slice()) this.removeDependency(node);
	}
	/**
	* Computes whether the given node is anywhere in the dependency graph of this node.
	* While this method can prevent cycles, it walks the graph and should be used sparingly.
	* Nodes are always considered dependent on themselves for the purposes of cycle detection.
	*/
	isDependentOn(node) {
		let isDependentOnNode = false;
		this.traverse((currentNode) => {
			if (isDependentOnNode) return;
			isDependentOnNode = currentNode === node;
		}, (currentNode) => {
			if (isDependentOnNode) return [];
			return currentNode.getDependencies();
		});
		return isDependentOnNode;
	}
	/**
	* Clones the node's information without adding any dependencies/dependents.
	*/
	cloneWithoutRelationships() {
		const node = new BaseNode(this.id);
		node.setIsMainDocument(this._isMainDocument);
		return node;
	}
	/**
	* Clones the entire graph connected to this node filtered by the optional predicate. If a node is
	* included by the predicate, all nodes along the paths between the node and the root will be included. If the
	* node this was called on is not included in the resulting filtered graph, the method will throw.
	*
	* This does not clone NetworkNode's `record` or `rawRecord` fields. It may be reasonable to clone the former,
	* to assist in graph construction, but the latter should never be cloned as one constraint of Lantern is that
	* the underlying data records are accessible for plain object reference equality checks.
	*/
	cloneWithRelationships(predicate) {
		const rootNode = this.getRootNode();
		const idsToIncludedClones = /* @__PURE__ */ new Map();
		rootNode.traverse((node) => {
			if (idsToIncludedClones.has(node.id)) return;
			if (predicate === void 0) {
				idsToIncludedClones.set(node.id, node.cloneWithoutRelationships());
				return;
			}
			if (predicate(node)) node.traverse((node) => idsToIncludedClones.set(node.id, node.cloneWithoutRelationships()), (node) => node.dependencies.filter((parent) => !idsToIncludedClones.has(parent.id)));
		});
		rootNode.traverse((originalNode) => {
			const clonedNode = idsToIncludedClones.get(originalNode.id);
			if (!clonedNode) return;
			for (const dependency of originalNode.dependencies) {
				const clonedDependency = idsToIncludedClones.get(dependency.id);
				if (!clonedDependency) throw new LanternError("Dependency somehow not cloned");
				clonedNode.addDependency(clonedDependency);
			}
		});
		const clonedThisNode = idsToIncludedClones.get(this.id);
		if (!clonedThisNode) throw new LanternError("Cloned graph missing node");
		return clonedThisNode;
	}
	/**
	* Traverses all connected nodes in BFS order, calling `callback` exactly once
	* on each. `traversalPath` is the shortest (though not necessarily unique)
	* path from `node` to the root of the iteration.
	*
	* The `getNextNodes` function takes a visited node and returns which nodes to
	* visit next. It defaults to returning the node's dependents.
	*/
	traverse(callback, getNextNodes) {
		for (const { node, traversalPath } of this.traverseGenerator(getNextNodes)) callback(node, traversalPath);
	}
	/**
	* @see BaseNode.traverse
	*/
	*traverseGenerator(getNextNodes) {
		if (!getNextNodes) getNextNodes = (node) => node.getDependents();
		const queue = [[this]];
		const visited = /* @__PURE__ */ new Set([this.id]);
		while (queue.length) {
			const traversalPath = queue.shift();
			const node = traversalPath[0];
			yield {
				node,
				traversalPath
			};
			for (const nextNode of getNextNodes(node)) {
				if (visited.has(nextNode.id)) continue;
				visited.add(nextNode.id);
				queue.push([nextNode, ...traversalPath]);
			}
		}
	}
	/**
	* If the given node has a cycle, returns a path representing that cycle.
	* Else returns null.
	*
	* Does a DFS on in its dependent graph.
	*/
	static findCycle(node, direction = "both") {
		if (direction === "both") return BaseNode.findCycle(node, "dependents") || BaseNode.findCycle(node, "dependencies");
		const visited = /* @__PURE__ */ new Set();
		const currentPath = [];
		const toVisit = [node];
		const depthAdded = /* @__PURE__ */ new Map([[node, 0]]);
		while (toVisit.length) {
			const currentNode = toVisit.pop();
			if (currentPath.includes(currentNode)) return currentPath;
			if (visited.has(currentNode)) continue;
			while (currentPath.length > depthAdded.get(currentNode)) currentPath.pop();
			visited.add(currentNode);
			currentPath.push(currentNode);
			const nodesToExplore = direction === "dependents" ? currentNode.dependents : currentNode.dependencies;
			for (const nextNode of nodesToExplore) {
				if (toVisit.includes(nextNode)) continue;
				toVisit.push(nextNode);
				depthAdded.set(nextNode, currentPath.length);
			}
		}
		return null;
	}
	canDependOn(node) {
		return node.startTime <= this.startTime;
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/graph/CPUNode.js
var CPUNode = class CPUNode extends BaseNode {
	_event;
	_childEvents;
	correctedEndTs;
	constructor(parentEvent, childEvents = [], correctedEndTs) {
		const nodeId = `${parentEvent.tid}.${parentEvent.ts}`;
		super(nodeId);
		this._event = parentEvent;
		this._childEvents = childEvents;
		this.correctedEndTs = correctedEndTs;
	}
	get type() {
		return BaseNode.types.CPU;
	}
	get startTime() {
		return this._event.ts;
	}
	get endTime() {
		if (this.correctedEndTs) return this.correctedEndTs;
		return this._event.ts + this._event.dur;
	}
	get duration() {
		return this.endTime - this.startTime;
	}
	get event() {
		return this._event;
	}
	get childEvents() {
		return this._childEvents;
	}
	/**
	* Returns true if this node contains a Layout task.
	*/
	didPerformLayout() {
		return this._childEvents.some((evt) => evt.name === "Layout");
	}
	/**
	* Returns the script URLs that had their EvaluateScript events occur in this task.
	*/
	getEvaluateScriptURLs() {
		const urls = /* @__PURE__ */ new Set();
		for (const event of this._childEvents) {
			if (event.name !== "EvaluateScript") continue;
			if (!event.args.data?.url) continue;
			urls.add(event.args.data.url);
		}
		return urls;
	}
	cloneWithoutRelationships() {
		return new CPUNode(this._event, this._childEvents, this.correctedEndTs);
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/graph/NetworkNode.js
var NON_NETWORK_SCHEMES = [
	"blob",
	"data",
	"intent",
	"file",
	"filesystem",
	"chrome-extension"
];
/**
* Note: the `protocol` field from CDP can be 'h2', 'http', (not 'https'!) or it'll be url's scheme.
*   https://source.chromium.org/chromium/chromium/src/+/main:content/browser/devtools/protocol/network_handler.cc;l=598-611;drc=56d4a9a9deb30be73adcee8737c73bcb2a5ab64f
* However, a `new URL(href).protocol` has a colon suffix.
*   https://url.spec.whatwg.org/#dom-url-protocol
* A URL's `scheme` is specced as the `protocol` sans-colon, but isn't exposed on a URL object.
* This method can take all 3 of these string types as a parameter.
*
* @param protocol Either a networkRequest's `protocol` per CDP or a `new URL(href).protocol`
*/
function isNonNetworkProtocol(protocol) {
	const urlScheme = protocol.includes(":") ? protocol.slice(0, protocol.indexOf(":")) : protocol;
	return NON_NETWORK_SCHEMES.includes(urlScheme);
}
var NetworkNode = class NetworkNode extends BaseNode {
	_request;
	constructor(networkRequest) {
		super(networkRequest.requestId);
		this._request = networkRequest;
	}
	get type() {
		return BaseNode.types.NETWORK;
	}
	get startTime() {
		return this._request.rendererStartTime * 1e3;
	}
	get endTime() {
		return this._request.networkEndTime * 1e3;
	}
	get rawRequest() {
		return this._request.rawRequest;
	}
	get request() {
		return this._request;
	}
	get initiatorType() {
		return this._request.initiator.type;
	}
	get fromDiskCache() {
		return Boolean(this._request.fromDiskCache);
	}
	get isNonNetworkProtocol() {
		return isNonNetworkProtocol(this.request.protocol) || isNonNetworkProtocol(this.request.parsedURL.scheme);
	}
	/**
	* Returns whether this network request can be downloaded without a TCP connection.
	* During simulation we treat data coming in over a network connection separately from on-device data.
	*/
	get isConnectionless() {
		return this.fromDiskCache || this.isNonNetworkProtocol;
	}
	hasRenderBlockingPriority() {
		const priority = this._request.priority;
		const isScript = this._request.resourceType === "Script";
		const isDocument = this._request.resourceType === "Document";
		return priority === "VeryHigh" || priority === "High" && isScript || priority === "High" && isDocument;
	}
	cloneWithoutRelationships() {
		const node = new NetworkNode(this._request);
		node.setIsMainDocument(this._isMainDocument);
		return node;
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/graph/PageDependencyGraph.js
var SCHEDULABLE_TASK_TITLE_LH = "RunTask";
var SCHEDULABLE_TASK_TITLE_ALT1 = "ThreadControllerImpl::RunTask";
var SCHEDULABLE_TASK_TITLE_ALT2 = "ThreadControllerImpl::DoWork";
var SCHEDULABLE_TASK_TITLE_ALT3 = "TaskQueueManager::ProcessTaskFromWorkQueue";
var SIGNIFICANT_DUR_THRESHOLD_MS = 10;
var IGNORED_MIME_TYPES_REGEX = /^video/;
var PageDependencyGraph = class PageDependencyGraph {
	static getNetworkInitiators(request) {
		if (!request.initiator) return [];
		if (request.initiator.url) return [request.initiator.url];
		if (request.initiator.type === "script") {
			const scriptURLs = /* @__PURE__ */ new Set();
			let stack = request.initiator.stack;
			while (stack) {
				const callFrames = stack.callFrames || [];
				for (const frame of callFrames) if (frame.url) scriptURLs.add(frame.url);
				stack = stack.parent;
			}
			return Array.from(scriptURLs);
		}
		return [];
	}
	static getNetworkNodeOutput(networkRequests) {
		const nodes = [];
		const idToNodeMap = /* @__PURE__ */ new Map();
		const urlToNodeMap = /* @__PURE__ */ new Map();
		const frameIdToNodeMap = /* @__PURE__ */ new Map();
		networkRequests.forEach((request) => {
			if (IGNORED_MIME_TYPES_REGEX.test(request.mimeType)) return;
			if (request.fromWorker) return;
			while (idToNodeMap.has(request.requestId)) request.requestId += ":duplicate";
			const node = new NetworkNode(request);
			nodes.push(node);
			const urlList = urlToNodeMap.get(request.url) || [];
			urlList.push(node);
			idToNodeMap.set(request.requestId, node);
			urlToNodeMap.set(request.url, urlList);
			if (request.frameId && request.resourceType === "Document" && request.documentURL === request.url) {
				const value = frameIdToNodeMap.has(request.frameId) ? null : node;
				frameIdToNodeMap.set(request.frameId, value);
			}
		});
		return {
			nodes,
			idToNodeMap,
			urlToNodeMap,
			frameIdToNodeMap
		};
	}
	static isScheduleableTask(evt) {
		return evt.name === SCHEDULABLE_TASK_TITLE_LH || evt.name === SCHEDULABLE_TASK_TITLE_ALT1 || evt.name === SCHEDULABLE_TASK_TITLE_ALT2 || evt.name === SCHEDULABLE_TASK_TITLE_ALT3;
	}
	/**
	* There should *always* be at least one top level event, having 0 typically means something is
	* drastically wrong with the trace and we should just give up early and loudly.
	*/
	static assertHasToplevelEvents(events) {
		if (!events.some(this.isScheduleableTask)) throw new LanternError("Could not find any top level events");
	}
	static getCPUNodes(mainThreadEvents) {
		const nodes = [];
		let i = 0;
		PageDependencyGraph.assertHasToplevelEvents(mainThreadEvents);
		while (i < mainThreadEvents.length) {
			const evt = mainThreadEvents[i];
			i++;
			if (!PageDependencyGraph.isScheduleableTask(evt) || !evt.dur) continue;
			let correctedEndTs = void 0;
			const children = [];
			for (const endTime = evt.ts + evt.dur; i < mainThreadEvents.length && mainThreadEvents[i].ts < endTime; i++) {
				const event = mainThreadEvents[i];
				if (PageDependencyGraph.isScheduleableTask(event) && event.dur) {
					correctedEndTs = event.ts - 1;
					break;
				}
				children.push(event);
			}
			nodes.push(new CPUNode(evt, children, correctedEndTs));
		}
		return nodes;
	}
	static linkNetworkNodes(rootNode, networkNodeOutput) {
		networkNodeOutput.nodes.forEach((node) => {
			const directInitiatorRequest = node.request.initiatorRequest || rootNode.request;
			const directInitiatorNode = networkNodeOutput.idToNodeMap.get(directInitiatorRequest.requestId) || rootNode;
			const canDependOnInitiator = !directInitiatorNode.isDependentOn(node) && node.canDependOn(directInitiatorNode);
			const initiators = PageDependencyGraph.getNetworkInitiators(node.request);
			if (initiators.length) initiators.forEach((initiator) => {
				const parentCandidates = networkNodeOutput.urlToNodeMap.get(initiator) || [];
				if (parentCandidates.length === 1 && parentCandidates[0].startTime <= node.startTime && !parentCandidates[0].isDependentOn(node)) node.addDependency(parentCandidates[0]);
				else if (canDependOnInitiator) directInitiatorNode.addDependent(node);
			});
			else if (canDependOnInitiator) directInitiatorNode.addDependent(node);
			if (node !== rootNode && node.getDependencies().length === 0 && node.canDependOn(rootNode)) node.addDependency(rootNode);
			if (!node.request.redirects) return;
			const redirects = [...node.request.redirects, node.request];
			for (let i = 1; i < redirects.length; i++) {
				const redirectNode = networkNodeOutput.idToNodeMap.get(redirects[i - 1].requestId);
				const actualNode = networkNodeOutput.idToNodeMap.get(redirects[i].requestId);
				if (actualNode && redirectNode) actualNode.addDependency(redirectNode);
			}
		});
	}
	static linkCPUNodes(rootNode, networkNodeOutput, cpuNodes) {
		const linkableResourceTypes = /* @__PURE__ */ new Set([
			"XHR",
			"Fetch",
			"Script"
		]);
		function addDependentNetworkRequest(cpuNode, reqId) {
			const networkNode = networkNodeOutput.idToNodeMap.get(reqId);
			if (!networkNode || networkNode.startTime <= cpuNode.startTime) return;
			const { request } = networkNode;
			const resourceType = request.resourceType || request.redirectDestination?.resourceType;
			if (!linkableResourceTypes.has(resourceType)) return;
			cpuNode.addDependent(networkNode);
		}
		/**
		* If the node has an associated frameId, then create a dependency on the root document request
		* for the frame. The task obviously couldn't have started before the frame was even downloaded.
		*/
		function addDependencyOnFrame(cpuNode, frameId) {
			if (!frameId) return;
			const networkNode = networkNodeOutput.frameIdToNodeMap.get(frameId);
			if (!networkNode) return;
			if (networkNode.startTime >= cpuNode.startTime) return;
			cpuNode.addDependency(networkNode);
		}
		function addDependencyOnUrl(cpuNode, url) {
			if (!url) return;
			const minimumAllowableTimeSinceNetworkNodeEnd = -100 * 1e3;
			const candidates = networkNodeOutput.urlToNodeMap.get(url) || [];
			let minCandidate = null;
			let minDistance = Infinity;
			for (const candidate of candidates) {
				if (cpuNode.startTime <= candidate.startTime) return;
				const distance = cpuNode.startTime - candidate.endTime;
				if (distance >= minimumAllowableTimeSinceNetworkNodeEnd && distance < minDistance) {
					minCandidate = candidate;
					minDistance = distance;
				}
			}
			if (!minCandidate) return;
			cpuNode.addDependency(minCandidate);
		}
		const timers = /* @__PURE__ */ new Map();
		for (const node of cpuNodes) {
			for (const evt of node.childEvents) {
				if (!evt.args.data) continue;
				const argsUrl = evt.args.data.url;
				const stackTraceUrls = (evt.args.data.stackTrace || []).map((l) => l.url).filter(Boolean);
				switch (evt.name) {
					case "TimerInstall":
						timers.set(evt.args.data.timerId, node);
						stackTraceUrls.forEach((url) => addDependencyOnUrl(node, url));
						break;
					case "TimerFire": {
						const installer = timers.get(evt.args.data.timerId);
						if (!installer || installer.endTime > node.startTime) break;
						installer.addDependent(node);
						break;
					}
					case "InvalidateLayout":
					case "ScheduleStyleRecalculation":
						addDependencyOnFrame(node, evt.args.data.frame);
						stackTraceUrls.forEach((url) => addDependencyOnUrl(node, url));
						break;
					case "EvaluateScript":
						addDependencyOnFrame(node, evt.args.data.frame);
						addDependencyOnUrl(node, argsUrl);
						stackTraceUrls.forEach((url) => addDependencyOnUrl(node, url));
						break;
					case "XHRReadyStateChange":
						if (evt.args.data.readyState !== 4) break;
						addDependencyOnUrl(node, argsUrl);
						stackTraceUrls.forEach((url) => addDependencyOnUrl(node, url));
						break;
					case "FunctionCall":
					case "v8.compile":
						addDependencyOnFrame(node, evt.args.data.frame);
						addDependencyOnUrl(node, argsUrl);
						break;
					case "ParseAuthorStyleSheet":
						addDependencyOnFrame(node, evt.args.data.frame);
						addDependencyOnUrl(node, evt.args.data.styleSheetUrl);
						break;
					case "ResourceSendRequest":
						addDependencyOnFrame(node, evt.args.data.frame);
						addDependentNetworkRequest(node, evt.args.data.requestId);
						stackTraceUrls.forEach((url) => addDependencyOnUrl(node, url));
						break;
				}
			}
			if (node.getNumberOfDependencies() === 0 && node.canDependOn(rootNode)) node.addDependency(rootNode);
		}
		const minimumEvtDur = SIGNIFICANT_DUR_THRESHOLD_MS * 1e3;
		let foundFirstLayout = false;
		let foundFirstPaint = false;
		let foundFirstParse = false;
		for (const node of cpuNodes) {
			let isFirst = false;
			if (!foundFirstLayout && node.childEvents.some((evt) => evt.name === "Layout")) isFirst = foundFirstLayout = true;
			if (!foundFirstPaint && node.childEvents.some((evt) => evt.name === "Paint")) isFirst = foundFirstPaint = true;
			if (!foundFirstParse && node.childEvents.some((evt) => evt.name === "ParseHTML")) isFirst = foundFirstParse = true;
			if (isFirst || node.duration >= minimumEvtDur) continue;
			if (node.getNumberOfDependencies() === 1 || node.getNumberOfDependents() <= 1) PageDependencyGraph.pruneNode(node);
		}
	}
	/**
	* Removes the given node from the graph, but retains all paths between its dependencies and
	* dependents.
	*/
	static pruneNode(node) {
		const dependencies = node.getDependencies();
		const dependents = node.getDependents();
		for (const dependency of dependencies) {
			node.removeDependency(dependency);
			for (const dependent of dependents) dependency.addDependent(dependent);
		}
		for (const dependent of dependents) node.removeDependent(dependent);
	}
	/**
	* TODO: remove when CDT backend in Lighthouse is gone. Until then, this is a useful debugging tool
	* to find delta between using CDP or the trace to create the network requests.
	*
	* When a test fails using the trace backend, I enabled this debug method and copied the network
	* requests when CDP was used, then when trace is used, and diff'd them. This method helped
	* remove non-logical differences from the comparison (order of properties, slight rounding
	* discrepancies, removing object cycles, etc).
	*
	* When using for a unit test, make sure to do `.only` so you are getting what you expect.
	*/
	static debugNormalizeRequests(lanternRequests) {
		for (const request of lanternRequests) {
			request.rendererStartTime = Math.round(request.rendererStartTime * 1e3) / 1e3;
			request.networkRequestTime = Math.round(request.networkRequestTime * 1e3) / 1e3;
			request.responseHeadersEndTime = Math.round(request.responseHeadersEndTime * 1e3) / 1e3;
			request.networkEndTime = Math.round(request.networkEndTime * 1e3) / 1e3;
		}
		for (const r of lanternRequests) {
			delete r.rawRequest;
			if (r.initiatorRequest) r.initiatorRequest = { id: r.initiatorRequest.requestId };
			if (r.redirectDestination) r.redirectDestination = { id: r.redirectDestination.requestId };
			if (r.redirectSource) r.redirectSource = { id: r.redirectSource.requestId };
			if (r.redirects) r.redirects = r.redirects.map((r2) => r2.requestId);
		}
		const debug = lanternRequests.map((r) => ({
			requestId: r.requestId,
			connectionId: r.connectionId,
			connectionReused: r.connectionReused,
			url: r.url,
			protocol: r.protocol,
			parsedURL: r.parsedURL,
			documentURL: r.documentURL,
			rendererStartTime: r.rendererStartTime,
			networkRequestTime: r.networkRequestTime,
			responseHeadersEndTime: r.responseHeadersEndTime,
			networkEndTime: r.networkEndTime,
			transferSize: r.transferSize,
			resourceSize: r.resourceSize,
			fromDiskCache: r.fromDiskCache,
			fromMemoryCache: r.fromMemoryCache,
			finished: r.finished,
			statusCode: r.statusCode,
			redirectSource: r.redirectSource,
			redirectDestination: r.redirectDestination,
			redirects: r.redirects,
			failed: r.failed,
			initiator: r.initiator,
			timing: r.timing ? {
				requestTime: r.timing.requestTime,
				proxyStart: r.timing.proxyStart,
				proxyEnd: r.timing.proxyEnd,
				dnsStart: r.timing.dnsStart,
				dnsEnd: r.timing.dnsEnd,
				connectStart: r.timing.connectStart,
				connectEnd: r.timing.connectEnd,
				sslStart: r.timing.sslStart,
				sslEnd: r.timing.sslEnd,
				workerStart: r.timing.workerStart,
				workerReady: r.timing.workerReady,
				workerFetchStart: r.timing.workerFetchStart,
				workerRespondWithSettled: r.timing.workerRespondWithSettled,
				sendStart: r.timing.sendStart,
				sendEnd: r.timing.sendEnd,
				pushStart: r.timing.pushStart,
				pushEnd: r.timing.pushEnd,
				receiveHeadersStart: r.timing.receiveHeadersStart,
				receiveHeadersEnd: r.timing.receiveHeadersEnd
			} : r.timing,
			resourceType: r.resourceType,
			mimeType: r.mimeType,
			priority: r.priority,
			initiatorRequest: r.initiatorRequest,
			frameId: r.frameId,
			fromWorker: r.fromWorker,
			isLinkPreload: r.isLinkPreload,
			serverResponseTime: r.serverResponseTime
		})).filter((r) => !r.fromWorker);
		console.log(debug);
	}
	static createGraph(mainThreadEvents, networkRequests, url) {
		const networkNodeOutput = PageDependencyGraph.getNetworkNodeOutput(networkRequests);
		const cpuNodes = PageDependencyGraph.getCPUNodes(mainThreadEvents);
		const { requestedUrl, mainDocumentUrl } = url;
		if (!requestedUrl) throw new LanternError("requestedUrl is required to get the root request");
		if (!mainDocumentUrl) throw new LanternError("mainDocumentUrl is required to get the main resource");
		const rootRequest = NetworkAnalyzer.findResourceForUrl(networkRequests, requestedUrl);
		if (!rootRequest) throw new LanternError("rootRequest not found");
		const rootNode = networkNodeOutput.idToNodeMap.get(rootRequest.requestId);
		if (!rootNode) throw new LanternError("rootNode not found");
		const mainDocumentRequest = NetworkAnalyzer.findLastDocumentForUrl(networkRequests, mainDocumentUrl);
		if (!mainDocumentRequest) throw new LanternError("mainDocumentRequest not found");
		const mainDocumentNode = networkNodeOutput.idToNodeMap.get(mainDocumentRequest.requestId);
		if (!mainDocumentNode) throw new LanternError("mainDocumentNode not found");
		PageDependencyGraph.linkNetworkNodes(rootNode, networkNodeOutput);
		PageDependencyGraph.linkCPUNodes(rootNode, networkNodeOutput, cpuNodes);
		mainDocumentNode.setIsMainDocument(true);
		if (NetworkNode.findCycle(rootNode)) throw new LanternError("Invalid dependency graph created, cycle detected");
		return rootNode;
	}
	static printGraph(rootNode, widthInCharacters = 80) {
		function padRight(str, target, padChar = " ") {
			return str + padChar.repeat(Math.max(target - str.length, 0));
		}
		const nodes = [];
		rootNode.traverse((node) => nodes.push(node));
		nodes.sort((a, b) => a.startTime - b.startTime);
		const nodeToLabel = /* @__PURE__ */ new Map();
		rootNode.traverse((node) => {
			const ascii = 65 + nodeToLabel.size;
			let label;
			if (ascii > 90) label = `Z${ascii - 90}`;
			else label = String.fromCharCode(ascii);
			nodeToLabel.set(node, label);
		});
		const min = nodes[0].startTime;
		const timePerCharacter = (nodes.reduce((max, node) => Math.max(max, node.endTime), 0) - min) / widthInCharacters;
		nodes.forEach((node) => {
			const offset = Math.round((node.startTime - min) / timePerCharacter);
			const length = Math.ceil((node.endTime - node.startTime) / timePerCharacter);
			const bar = padRight("", offset) + padRight("", length, "=");
			const displayName = node.request ? node.request.url : node.type;
			console.log(padRight(bar, widthInCharacters), `| ${displayName.slice(0, 50)}`);
		});
		console.log();
		nodes.forEach((node) => {
			const displayName = node.request ? node.request.url : node.type;
			console.log(nodeToLabel.get(node), displayName.slice(0, widthInCharacters - 5));
			for (const child of node.dependents) {
				const displayName = child.request ? child.request.url : child.type;
				console.log("  ->", nodeToLabel.get(child), displayName.slice(0, widthInCharacters - 10));
			}
			console.log();
		});
		const cyclePath = NetworkNode.findCycle(rootNode);
		console.log("Cycle?", cyclePath ? "yes" : "no");
		if (cyclePath) {
			const path = [...cyclePath];
			path.push(path[0]);
			console.log(path.map((node) => nodeToLabel.get(node)).join(" -> "));
		}
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/simulation/TCPConnection.js
var INITIAL_CONGESTION_WINDOW = 10;
var TCP_SEGMENT_SIZE = 1460;
var TCPConnection = class TCPConnection {
	warmed;
	ssl;
	h2;
	rtt;
	throughput;
	serverLatency;
	_congestionWindow;
	h2OverflowBytesDownloaded;
	constructor(rtt, throughput, serverLatency = 0, ssl = true, h2 = false) {
		this.warmed = false;
		this.ssl = ssl;
		this.h2 = h2;
		this.rtt = rtt;
		this.throughput = throughput;
		this.serverLatency = serverLatency;
		this._congestionWindow = INITIAL_CONGESTION_WINDOW;
		this.h2OverflowBytesDownloaded = 0;
	}
	static maximumSaturatedConnections(rtt, availableThroughput) {
		const minimumThroughputRequiredPerRequest = 1e3 / rtt * TCP_SEGMENT_SIZE * 8;
		return Math.floor(availableThroughput / minimumThroughputRequiredPerRequest);
	}
	computeMaximumCongestionWindowInSegments() {
		const bytesPerRoundTrip = this.throughput / 8 * (this.rtt / 1e3);
		return Math.floor(bytesPerRoundTrip / TCP_SEGMENT_SIZE);
	}
	setThroughput(throughput) {
		this.throughput = throughput;
	}
	setCongestionWindow(congestion) {
		this._congestionWindow = congestion;
	}
	setWarmed(warmed) {
		this.warmed = warmed;
	}
	isH2() {
		return this.h2;
	}
	get congestionWindow() {
		return this._congestionWindow;
	}
	/**
	* Sets the number of excess bytes that are available to this connection on future downloads, only
	* applies to H2 connections.
	*/
	setH2OverflowBytesDownloaded(bytes) {
		if (!this.h2) return;
		this.h2OverflowBytesDownloaded = bytes;
	}
	clone() {
		return Object.assign(new TCPConnection(this.rtt, this.throughput), this);
	}
	/**
	* Simulates a network download of a particular number of bytes over an optional maximum amount of time
	* and returns information about the ending state.
	*
	* See https://hpbn.co/building-blocks-of-tcp/#three-way-handshake and
	*  https://hpbn.co/transport-layer-security-tls/#tls-handshake for details.
	*/
	simulateDownloadUntil(bytesToDownload, options) {
		const { timeAlreadyElapsed = 0, maximumTimeToElapse = Infinity, dnsResolutionTime = 0 } = options || {};
		if (this.warmed && this.h2) bytesToDownload -= this.h2OverflowBytesDownloaded;
		const twoWayLatency = this.rtt;
		const oneWayLatency = twoWayLatency / 2;
		const maximumCongestionWindow = this.computeMaximumCongestionWindowInSegments();
		let handshakeAndRequest = oneWayLatency;
		if (!this.warmed) handshakeAndRequest = dnsResolutionTime + oneWayLatency + oneWayLatency + oneWayLatency + (this.ssl ? twoWayLatency : 0);
		let roundTrips = Math.ceil(handshakeAndRequest / twoWayLatency);
		let timeToFirstByte = handshakeAndRequest + this.serverLatency + oneWayLatency;
		if (this.warmed && this.h2) timeToFirstByte = 0;
		const timeElapsedForTTFB = Math.max(timeToFirstByte - timeAlreadyElapsed, 0);
		const maximumDownloadTimeToElapse = maximumTimeToElapse - timeElapsedForTTFB;
		let congestionWindow = Math.min(this._congestionWindow, maximumCongestionWindow);
		let totalBytesDownloaded = 0;
		if (timeElapsedForTTFB > 0) totalBytesDownloaded = congestionWindow * TCP_SEGMENT_SIZE;
		else roundTrips = 0;
		let downloadTimeElapsed = 0;
		let bytesRemaining = bytesToDownload - totalBytesDownloaded;
		while (bytesRemaining > 0 && downloadTimeElapsed <= maximumDownloadTimeToElapse) {
			roundTrips++;
			downloadTimeElapsed += twoWayLatency;
			congestionWindow = Math.max(Math.min(maximumCongestionWindow, congestionWindow * 2), 1);
			const bytesDownloadedInWindow = congestionWindow * TCP_SEGMENT_SIZE;
			totalBytesDownloaded += bytesDownloadedInWindow;
			bytesRemaining -= bytesDownloadedInWindow;
		}
		const timeElapsed = timeElapsedForTTFB + downloadTimeElapsed;
		const extraBytesDownloaded = this.h2 ? Math.max(totalBytesDownloaded - bytesToDownload, 0) : 0;
		const bytesDownloaded = Math.max(Math.min(totalBytesDownloaded, bytesToDownload), 0);
		let connectionTiming;
		if (!this.warmed) connectionTiming = {
			dnsResolutionTime,
			connectionTime: handshakeAndRequest - dnsResolutionTime,
			sslTime: this.ssl ? twoWayLatency : void 0,
			timeToFirstByte
		};
		else if (this.h2) connectionTiming = { timeToFirstByte };
		else connectionTiming = {
			connectionTime: handshakeAndRequest,
			timeToFirstByte
		};
		return {
			roundTrips,
			timeElapsed,
			bytesDownloaded,
			extraBytesDownloaded,
			congestionWindow,
			connectionTiming
		};
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/simulation/ConnectionPool.js
var DEFAULT_SERVER_RESPONSE_TIME = 30;
var TLS_SCHEMES = ["https", "wss"];
var CONNECTIONS_PER_ORIGIN = 6;
var ConnectionPool = class {
	options;
	records;
	connectionsByOrigin;
	connectionsByRequest;
	_connectionsInUse;
	connectionReusedByRequestId;
	constructor(records, options) {
		this.options = options;
		this.records = records;
		this.connectionsByOrigin = /* @__PURE__ */ new Map();
		this.connectionsByRequest = /* @__PURE__ */ new Map();
		this._connectionsInUse = /* @__PURE__ */ new Set();
		this.connectionReusedByRequestId = NetworkAnalyzer.estimateIfConnectionWasReused(records, { forceCoarseEstimates: true });
		this.initializeConnections();
	}
	connectionsInUse() {
		return Array.from(this._connectionsInUse);
	}
	initializeConnections() {
		const connectionReused = this.connectionReusedByRequestId;
		const additionalRttByOrigin = this.options.additionalRttByOrigin;
		const serverResponseTimeByOrigin = this.options.serverResponseTimeByOrigin;
		const recordsByOrigin = NetworkAnalyzer.groupByOrigin(this.records);
		for (const [origin, requests] of recordsByOrigin.entries()) {
			const connections = [];
			const additionalRtt = additionalRttByOrigin.get(origin) || 0;
			const responseTime = serverResponseTimeByOrigin.get(origin) || DEFAULT_SERVER_RESPONSE_TIME;
			for (const request of requests) {
				if (connectionReused.get(request.requestId)) continue;
				const isTLS = TLS_SCHEMES.includes(request.parsedURL.scheme);
				const isH2 = request.protocol === "h2";
				const connection = new TCPConnection(this.options.rtt + additionalRtt, this.options.throughput, responseTime, isTLS, isH2);
				connections.push(connection);
			}
			if (!connections.length) throw new LanternError(`Could not find a connection for origin: ${origin}`);
			const minConnections = connections[0].isH2() ? 1 : CONNECTIONS_PER_ORIGIN;
			while (connections.length < minConnections) connections.push(connections[0].clone());
			this.connectionsByOrigin.set(origin, connections);
		}
	}
	findAvailableConnectionWithLargestCongestionWindow(connections) {
		let maxConnection = null;
		for (let i = 0; i < connections.length; i++) {
			const connection = connections[i];
			if (this._connectionsInUse.has(connection)) continue;
			const currentMax = maxConnection?.congestionWindow || -Infinity;
			if (connection.congestionWindow > currentMax) maxConnection = connection;
		}
		return maxConnection;
	}
	/**
	* This method finds an available connection to the origin specified by the network request or null
	* if no connection was available. If returned, connection will not be available for other network
	* records until release is called.
	*/
	acquire(request) {
		if (this.connectionsByRequest.has(request)) throw new LanternError("Record already has a connection");
		const origin = request.parsedURL.securityOrigin;
		const connections = this.connectionsByOrigin.get(origin) || [];
		const connectionToUse = this.findAvailableConnectionWithLargestCongestionWindow(connections);
		if (!connectionToUse) return null;
		this._connectionsInUse.add(connectionToUse);
		this.connectionsByRequest.set(request, connectionToUse);
		return connectionToUse;
	}
	/**
	* Return the connection currently being used to fetch a request. If no connection
	* currently being used for this request, an error will be thrown.
	*/
	acquireActiveConnectionFromRequest(request) {
		const activeConnection = this.connectionsByRequest.get(request);
		if (!activeConnection) throw new LanternError("Could not find an active connection for request");
		return activeConnection;
	}
	release(request) {
		const connection = this.connectionsByRequest.get(request);
		this.connectionsByRequest.delete(request);
		if (connection) this._connectionsInUse.delete(connection);
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/simulation/Constants.js
var DEVTOOLS_RTT_ADJUSTMENT_FACTOR = 3.75;
var DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR = .9;
var Constants = { throttling: {
	DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
	DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
	mobileSlow4G: {
		rttMs: 150,
		throughputKbps: 1.6 * 1024,
		requestLatencyMs: 150 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
		downloadThroughputKbps: 1.6 * 1024 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
		uploadThroughputKbps: 750 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
		cpuSlowdownMultiplier: 4
	},
	mobileRegular3G: {
		rttMs: 300,
		throughputKbps: 700,
		requestLatencyMs: 300 * DEVTOOLS_RTT_ADJUSTMENT_FACTOR,
		downloadThroughputKbps: 700 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
		uploadThroughputKbps: 700 * DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR,
		cpuSlowdownMultiplier: 4
	},
	desktopDense4G: {
		rttMs: 40,
		throughputKbps: 10 * 1024,
		cpuSlowdownMultiplier: 1,
		requestLatencyMs: 0,
		downloadThroughputKbps: 0,
		uploadThroughputKbps: 0
	}
} };
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/simulation/DNSCache.js
var DNS_RESOLUTION_RTT_MULTIPLIER = 2;
var DNSCache = class DNSCache {
	static rttMultiplier = DNS_RESOLUTION_RTT_MULTIPLIER;
	rtt;
	resolvedDomainNames;
	constructor({ rtt }) {
		this.rtt = rtt;
		this.resolvedDomainNames = /* @__PURE__ */ new Map();
	}
	getTimeUntilResolution(request, options) {
		const { requestedAt = 0, shouldUpdateCache = false } = options || {};
		const domain = request.parsedURL.host;
		const cacheEntry = this.resolvedDomainNames.get(domain);
		let timeUntilResolved = this.rtt * DNSCache.rttMultiplier;
		if (cacheEntry) {
			const timeUntilCachedIsResolved = Math.max(cacheEntry.resolvedAt - requestedAt, 0);
			timeUntilResolved = Math.min(timeUntilCachedIsResolved, timeUntilResolved);
		}
		const resolvedAt = requestedAt + timeUntilResolved;
		if (shouldUpdateCache) this.updateCacheResolvedAtIfNeeded(request, resolvedAt);
		return timeUntilResolved;
	}
	updateCacheResolvedAtIfNeeded(request, resolvedAt) {
		const domain = request.parsedURL.host;
		const cacheEntry = this.resolvedDomainNames.get(domain) || { resolvedAt };
		cacheEntry.resolvedAt = Math.min(cacheEntry.resolvedAt, resolvedAt);
		this.resolvedDomainNames.set(domain, cacheEntry);
	}
	/**
	* Forcefully sets the DNS resolution time for a request.
	* Useful for testing and alternate execution simulations.
	*/
	setResolvedAt(domain, resolvedAt) {
		this.resolvedDomainNames.set(domain, { resolvedAt });
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/simulation/SimulationTimingMap.js
/**
* @file
*
* This class encapsulates the type-related validation logic for moving timing information for nodes
* through the different simulation phases. Methods here ensure that the invariants of simulation hold
* as nodes are queued, partially simulated, and completed.
*/
var SimulatorTimingMap = class {
	nodeTimings;
	constructor() {
		this.nodeTimings = /* @__PURE__ */ new Map();
	}
	getNodes() {
		return Array.from(this.nodeTimings.keys());
	}
	setReadyToStart(node, values) {
		this.nodeTimings.set(node, values);
	}
	setInProgress(node, values) {
		const nodeTiming = {
			...this.getQueued(node),
			startTime: values.startTime,
			timeElapsed: 0
		};
		this.nodeTimings.set(node, node.type === BaseNode.types.NETWORK ? {
			...nodeTiming,
			timeElapsedOvershoot: 0,
			bytesDownloaded: 0
		} : nodeTiming);
	}
	setCompleted(node, values) {
		const nodeTiming = {
			...this.getInProgress(node),
			endTime: values.endTime,
			connectionTiming: values.connectionTiming
		};
		this.nodeTimings.set(node, nodeTiming);
	}
	setCpu(node, values) {
		const nodeTiming = {
			...this.getCpuStarted(node),
			timeElapsed: values.timeElapsed
		};
		this.nodeTimings.set(node, nodeTiming);
	}
	setCpuEstimated(node, values) {
		const nodeTiming = {
			...this.getCpuStarted(node),
			estimatedTimeElapsed: values.estimatedTimeElapsed
		};
		this.nodeTimings.set(node, nodeTiming);
	}
	setNetwork(node, values) {
		const nodeTiming = {
			...this.getNetworkStarted(node),
			timeElapsed: values.timeElapsed,
			timeElapsedOvershoot: values.timeElapsedOvershoot,
			bytesDownloaded: values.bytesDownloaded
		};
		this.nodeTimings.set(node, nodeTiming);
	}
	setNetworkEstimated(node, values) {
		const nodeTiming = {
			...this.getNetworkStarted(node),
			estimatedTimeElapsed: values.estimatedTimeElapsed
		};
		this.nodeTimings.set(node, nodeTiming);
	}
	getQueued(node) {
		const timing = this.nodeTimings.get(node);
		if (!timing) throw new LanternError(`Node ${node.id} not yet queued`);
		return timing;
	}
	getCpuStarted(node) {
		const timing = this.nodeTimings.get(node);
		if (!timing) throw new LanternError(`Node ${node.id} not yet queued`);
		if (!("startTime" in timing)) throw new LanternError(`Node ${node.id} not yet started`);
		if ("bytesDownloaded" in timing) throw new LanternError(`Node ${node.id} timing not valid`);
		return timing;
	}
	getNetworkStarted(node) {
		const timing = this.nodeTimings.get(node);
		if (!timing) throw new LanternError(`Node ${node.id} not yet queued`);
		if (!("startTime" in timing)) throw new LanternError(`Node ${node.id} not yet started`);
		if (!("bytesDownloaded" in timing)) throw new LanternError(`Node ${node.id} timing not valid`);
		return timing;
	}
	getInProgress(node) {
		const timing = this.nodeTimings.get(node);
		if (!timing) throw new LanternError(`Node ${node.id} not yet queued`);
		if (!("startTime" in timing)) throw new LanternError(`Node ${node.id} not yet started`);
		if (!("estimatedTimeElapsed" in timing)) throw new LanternError(`Node ${node.id} not yet in progress`);
		return timing;
	}
	getCompleted(node) {
		const timing = this.nodeTimings.get(node);
		if (!timing) throw new LanternError(`Node ${node.id} not yet queued`);
		if (!("startTime" in timing)) throw new LanternError(`Node ${node.id} not yet started`);
		if (!("estimatedTimeElapsed" in timing)) throw new LanternError(`Node ${node.id} not yet in progress`);
		if (!("endTime" in timing)) throw new LanternError(`Node ${node.id} not yet completed`);
		return timing;
	}
};
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/lantern/simulation/Simulator.js
var defaultThrottling = Constants.throttling.mobileSlow4G;
var DEFAULT_MAXIMUM_CONCURRENT_REQUESTS = 10;
var DEFAULT_LAYOUT_TASK_MULTIPLIER = .5;
var DEFAULT_MAXIMUM_CPU_TASK_DURATION = 1e4;
var NodeState = {
	NotReadyToStart: 0,
	ReadyToStart: 1,
	InProgress: 2,
	Complete: 3
};
var PriorityStartTimePenalty = {
	VeryHigh: 0,
	High: .25,
	Medium: .5,
	Low: 1,
	VeryLow: 2
};
var ALL_SIMULATION_NODE_TIMINGS = /* @__PURE__ */ new Map();
var Simulator = class Simulator {
	static createSimulator(settings) {
		const { throttlingMethod, throttling, precomputedLanternData, networkAnalysis } = settings;
		const options = {
			additionalRttByOrigin: networkAnalysis.additionalRttByOrigin,
			serverResponseTimeByOrigin: networkAnalysis.serverResponseTimeByOrigin,
			observedThroughput: networkAnalysis.throughput
		};
		if (precomputedLanternData) {
			options.additionalRttByOrigin = new Map(Object.entries(precomputedLanternData.additionalRttByOrigin));
			options.serverResponseTimeByOrigin = new Map(Object.entries(precomputedLanternData.serverResponseTimeByOrigin));
		}
		switch (throttlingMethod) {
			case "provided":
				options.rtt = networkAnalysis.rtt;
				options.throughput = networkAnalysis.throughput;
				options.cpuSlowdownMultiplier = 1;
				options.layoutTaskMultiplier = 1;
				break;
			case "devtools":
				if (throttling) {
					options.rtt = throttling.requestLatencyMs / Constants.throttling.DEVTOOLS_RTT_ADJUSTMENT_FACTOR;
					options.throughput = throttling.downloadThroughputKbps * 1024 / Constants.throttling.DEVTOOLS_THROUGHPUT_ADJUSTMENT_FACTOR;
				}
				options.cpuSlowdownMultiplier = 1;
				options.layoutTaskMultiplier = 1;
				break;
			case "simulate":
				if (throttling) {
					options.rtt = throttling.rttMs;
					options.throughput = throttling.throughputKbps * 1024;
					options.cpuSlowdownMultiplier = throttling.cpuSlowdownMultiplier;
				}
				break;
			default: break;
		}
		return new Simulator(options);
	}
	options;
	_rtt;
	throughput;
	maximumConcurrentRequests;
	cpuSlowdownMultiplier;
	layoutTaskMultiplier;
	cachedNodeListByStartPosition;
	nodeTimings;
	numberInProgressByType;
	nodes;
	dns;
	connectionPool;
	constructor(options) {
		this.options = Object.assign({
			rtt: defaultThrottling.rttMs,
			throughput: defaultThrottling.throughputKbps * 1024,
			maximumConcurrentRequests: DEFAULT_MAXIMUM_CONCURRENT_REQUESTS,
			cpuSlowdownMultiplier: defaultThrottling.cpuSlowdownMultiplier,
			layoutTaskMultiplier: DEFAULT_LAYOUT_TASK_MULTIPLIER,
			additionalRttByOrigin: /* @__PURE__ */ new Map(),
			serverResponseTimeByOrigin: /* @__PURE__ */ new Map()
		}, options);
		this._rtt = this.options.rtt;
		this.throughput = this.options.throughput;
		this.maximumConcurrentRequests = Math.max(Math.min(TCPConnection.maximumSaturatedConnections(this._rtt, this.throughput), this.options.maximumConcurrentRequests), 1);
		this.cpuSlowdownMultiplier = this.options.cpuSlowdownMultiplier;
		this.layoutTaskMultiplier = this.cpuSlowdownMultiplier * this.options.layoutTaskMultiplier;
		this.cachedNodeListByStartPosition = [];
		this.nodeTimings = new SimulatorTimingMap();
		this.numberInProgressByType = /* @__PURE__ */ new Map();
		this.nodes = {};
		this.dns = new DNSCache({ rtt: this._rtt });
		this.connectionPool = null;
		if (!Number.isFinite(this._rtt)) throw new LanternError(`Invalid rtt ${this._rtt}`);
		if (!Number.isFinite(this.throughput)) throw new LanternError(`Invalid throughput ${this.throughput}`);
	}
	get rtt() {
		return this._rtt;
	}
	initializeConnectionPool(graph) {
		const records = [];
		graph.getRootNode().traverse((node) => {
			if (node.type === BaseNode.types.NETWORK) records.push(node.request);
		});
		this.connectionPool = new ConnectionPool(records, this.options);
	}
	/**
	* Initializes the various state data structures such _nodeTimings and the _node Sets by state.
	*/
	initializeAuxiliaryData() {
		this.nodeTimings = new SimulatorTimingMap();
		this.numberInProgressByType = /* @__PURE__ */ new Map();
		this.nodes = {};
		this.cachedNodeListByStartPosition = [];
		for (const state of Object.values(NodeState)) this.nodes[state] = /* @__PURE__ */ new Set();
	}
	numberInProgress(type) {
		return this.numberInProgressByType.get(type) || 0;
	}
	markNodeAsReadyToStart(node, queuedTime) {
		const nodeStartPosition = Simulator.computeNodeStartPosition(node);
		const firstNodeIndexWithGreaterStartPosition = this.cachedNodeListByStartPosition.findIndex((candidate) => Simulator.computeNodeStartPosition(candidate) > nodeStartPosition);
		const insertionIndex = firstNodeIndexWithGreaterStartPosition === -1 ? this.cachedNodeListByStartPosition.length : firstNodeIndexWithGreaterStartPosition;
		this.cachedNodeListByStartPosition.splice(insertionIndex, 0, node);
		this.nodes[NodeState.ReadyToStart].add(node);
		this.nodes[NodeState.NotReadyToStart].delete(node);
		this.nodeTimings.setReadyToStart(node, { queuedTime });
	}
	markNodeAsInProgress(node, startTime) {
		const indexOfNodeToStart = this.cachedNodeListByStartPosition.indexOf(node);
		this.cachedNodeListByStartPosition.splice(indexOfNodeToStart, 1);
		this.nodes[NodeState.InProgress].add(node);
		this.nodes[NodeState.ReadyToStart].delete(node);
		this.numberInProgressByType.set(node.type, this.numberInProgress(node.type) + 1);
		this.nodeTimings.setInProgress(node, { startTime });
	}
	markNodeAsComplete(node, endTime, connectionTiming) {
		this.nodes[NodeState.Complete].add(node);
		this.nodes[NodeState.InProgress].delete(node);
		this.numberInProgressByType.set(node.type, this.numberInProgress(node.type) - 1);
		this.nodeTimings.setCompleted(node, {
			endTime,
			connectionTiming
		});
		for (const dependent of node.getDependents()) {
			if (dependent.getDependencies().some((dep) => !this.nodes[NodeState.Complete].has(dep))) continue;
			this.markNodeAsReadyToStart(dependent, endTime);
		}
	}
	acquireConnection(request) {
		return this.connectionPool.acquire(request);
	}
	getNodesSortedByStartPosition() {
		return Array.from(this.cachedNodeListByStartPosition);
	}
	startNodeIfPossible(node, totalElapsedTime) {
		if (node.type === BaseNode.types.CPU) {
			if (this.numberInProgress(node.type) === 0) this.markNodeAsInProgress(node, totalElapsedTime);
			return;
		}
		if (node.type !== BaseNode.types.NETWORK) throw new LanternError("Unsupported");
		if (!node.isConnectionless) {
			if (this.numberInProgress(node.type) >= this.maximumConcurrentRequests) return;
			if (!this.acquireConnection(node.request)) return;
		}
		this.markNodeAsInProgress(node, totalElapsedTime);
	}
	/**
	* Updates each connection in use with the available throughput based on the number of network requests
	* currently in flight.
	*/
	updateNetworkCapacity() {
		const inFlight = this.numberInProgress(BaseNode.types.NETWORK);
		if (inFlight === 0) return;
		for (const connection of this.connectionPool.connectionsInUse()) connection.setThroughput(this.throughput / inFlight);
	}
	/**
	* Estimates the number of milliseconds remaining given current conditions before the node is complete.
	*/
	estimateTimeRemaining(node) {
		if (node.type === BaseNode.types.CPU) return this.estimateCPUTimeRemaining(node);
		if (node.type === BaseNode.types.NETWORK) return this.estimateNetworkTimeRemaining(node);
		throw new LanternError("Unsupported");
	}
	estimateCPUTimeRemaining(cpuNode) {
		const timingData = this.nodeTimings.getCpuStarted(cpuNode);
		const multiplier = cpuNode.didPerformLayout() ? this.layoutTaskMultiplier : this.cpuSlowdownMultiplier;
		const estimatedTimeElapsed = Math.min(Math.round(cpuNode.duration / 1e3 * multiplier), DEFAULT_MAXIMUM_CPU_TASK_DURATION) - timingData.timeElapsed;
		this.nodeTimings.setCpuEstimated(cpuNode, { estimatedTimeElapsed });
		return estimatedTimeElapsed;
	}
	estimateNetworkTimeRemaining(networkNode) {
		const request = networkNode.request;
		const timingData = this.nodeTimings.getNetworkStarted(networkNode);
		let timeElapsed = 0;
		if (networkNode.fromDiskCache) timeElapsed = 8 + 20 * ((request.resourceSize || 0) / 1024 / 1024) - timingData.timeElapsed;
		else if (networkNode.isNonNetworkProtocol) timeElapsed = 2 + 10 * ((request.resourceSize || 0) / 1024 / 1024) - timingData.timeElapsed;
		else {
			const connection = this.connectionPool.acquireActiveConnectionFromRequest(request);
			const dnsResolutionTime = this.dns.getTimeUntilResolution(request, {
				requestedAt: timingData.startTime,
				shouldUpdateCache: true
			});
			const timeAlreadyElapsed = timingData.timeElapsed;
			timeElapsed = connection.simulateDownloadUntil(request.transferSize - timingData.bytesDownloaded, {
				timeAlreadyElapsed,
				dnsResolutionTime,
				maximumTimeToElapse: Infinity
			}).timeElapsed;
		}
		const estimatedTimeElapsed = timeElapsed + timingData.timeElapsedOvershoot;
		this.nodeTimings.setNetworkEstimated(networkNode, { estimatedTimeElapsed });
		return estimatedTimeElapsed;
	}
	/**
	* Computes and returns the minimum estimated completion time of the nodes currently in progress.
	*/
	findNextNodeCompletionTime() {
		let minimumTime = Infinity;
		for (const node of this.nodes[NodeState.InProgress]) minimumTime = Math.min(minimumTime, this.estimateTimeRemaining(node));
		return minimumTime;
	}
	/**
	* Given a time period, computes the progress toward completion that the node made during that time.
	*/
	updateProgressMadeInTimePeriod(node, timePeriodLength, totalElapsedTime) {
		const timingData = this.nodeTimings.getInProgress(node);
		const isFinished = timingData.estimatedTimeElapsed === timePeriodLength;
		if (node.type === BaseNode.types.CPU || node.isConnectionless) {
			if (isFinished) this.markNodeAsComplete(node, totalElapsedTime);
			else timingData.timeElapsed += timePeriodLength;
			return;
		}
		if (node.type !== BaseNode.types.NETWORK) throw new LanternError("Unsupported");
		if (!("bytesDownloaded" in timingData)) throw new LanternError("Invalid timing data");
		const request = node.request;
		const connection = this.connectionPool.acquireActiveConnectionFromRequest(request);
		const dnsResolutionTime = this.dns.getTimeUntilResolution(request, {
			requestedAt: timingData.startTime,
			shouldUpdateCache: true
		});
		const calculation = connection.simulateDownloadUntil(request.transferSize - timingData.bytesDownloaded, {
			dnsResolutionTime,
			timeAlreadyElapsed: timingData.timeElapsed,
			maximumTimeToElapse: timePeriodLength - timingData.timeElapsedOvershoot
		});
		connection.setCongestionWindow(calculation.congestionWindow);
		connection.setH2OverflowBytesDownloaded(calculation.extraBytesDownloaded);
		if (isFinished) {
			connection.setWarmed(true);
			this.connectionPool.release(request);
			this.markNodeAsComplete(node, totalElapsedTime, calculation.connectionTiming);
		} else {
			timingData.timeElapsed += calculation.timeElapsed;
			timingData.timeElapsedOvershoot += calculation.timeElapsed - timePeriodLength;
			timingData.bytesDownloaded += calculation.bytesDownloaded;
		}
	}
	computeFinalNodeTimings() {
		const completeNodeTimingEntries = this.nodeTimings.getNodes().map((node) => {
			return [node, this.nodeTimings.getCompleted(node)];
		});
		completeNodeTimingEntries.sort((a, b) => a[1].startTime - b[1].startTime);
		const nodeTimingEntries = completeNodeTimingEntries.map(([node, timing]) => {
			return [node, {
				startTime: timing.startTime,
				endTime: timing.endTime,
				duration: timing.endTime - timing.startTime
			}];
		});
		return {
			nodeTimings: new Map(nodeTimingEntries),
			completeNodeTimings: new Map(completeNodeTimingEntries)
		};
	}
	getOptions() {
		return this.options;
	}
	/**
	* Estimates the time taken to process all of the graph's nodes, returns the overall time along with
	* each node annotated by start/end times.
	*
	* Simulator/connection pool are allowed to deviate from what was
	* observed in the trace/devtoolsLog and start requests as soon as they are queued (i.e. do not
	* wait around for a warm connection to be available if the original request was fetched on a warm
	* connection).
	*/
	simulate(graph, options) {
		if (BaseNode.findCycle(graph)) throw new LanternError("Cannot simulate graph with cycle");
		options = Object.assign({ label: void 0 }, options);
		this.dns = new DNSCache({ rtt: this._rtt });
		this.initializeConnectionPool(graph);
		this.initializeAuxiliaryData();
		const nodesNotReadyToStart = this.nodes[NodeState.NotReadyToStart];
		const nodesReadyToStart = this.nodes[NodeState.ReadyToStart];
		const nodesInProgress = this.nodes[NodeState.InProgress];
		const rootNode = graph.getRootNode();
		rootNode.traverse((node) => nodesNotReadyToStart.add(node));
		let totalElapsedTime = 0;
		let iteration = 0;
		this.markNodeAsReadyToStart(rootNode, totalElapsedTime);
		while (nodesReadyToStart.size || nodesInProgress.size) {
			for (const node of this.getNodesSortedByStartPosition()) this.startNodeIfPossible(node, totalElapsedTime);
			if (!nodesInProgress.size) throw new LanternError("Failed to start a node");
			this.updateNetworkCapacity();
			const minimumTime = this.findNextNodeCompletionTime();
			totalElapsedTime += minimumTime;
			if (!Number.isFinite(minimumTime) || iteration > 1e5) throw new LanternError("Simulation failed, depth exceeded");
			iteration++;
			for (const node of nodesInProgress) this.updateProgressMadeInTimePeriod(node, minimumTime, totalElapsedTime);
		}
		const { nodeTimings, completeNodeTimings } = this.computeFinalNodeTimings();
		ALL_SIMULATION_NODE_TIMINGS.set(options.label || "unlabeled", completeNodeTimings);
		return {
			timeInMs: totalElapsedTime,
			nodeTimings
		};
	}
	computeWastedMsFromWastedBytes(wastedBytes) {
		const { throughput, observedThroughput } = this.options;
		const bitsPerSecond = throughput === 0 ? observedThroughput : throughput;
		if (bitsPerSecond === 0) return 0;
		const wastedMs = wastedBytes * 8 / bitsPerSecond * 1e3;
		return Math.round(wastedMs / 10) * 10;
	}
	static get allNodeTimings() {
		return ALL_SIMULATION_NODE_TIMINGS;
	}
	/**
	* We attempt to start nodes by their observed start time using the request priority as a tie breaker.
	* When simulating, just because a low priority image started 5ms before a high priority image doesn't mean
	* it would have happened like that when the network was slower.
	*/
	static computeNodeStartPosition(node) {
		if (node.type === "cpu") return node.startTime;
		return node.startTime + (PriorityStartTimePenalty[node.request.priority] * 1e3 * 1e3 || 0);
	}
};
//#endregion
//#region node_modules/third-party-web/lib/create-entity-finder-api.js
var require_create_entity_finder_api = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var DOMAIN_IN_URL_REGEX = /:\/\/(\S*?)(:\d+)?(\/|$)/;
	var DOMAIN_CHARACTERS = /(?:[a-z0-9.-]+\.[a-z0-9]+|localhost)/i;
	var IP_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
	var ROOT_DOMAIN_REGEX = /[^.]+\.([^.]+|(gov|com|co|ne)\.\w{2})$/i;
	/**
	* @param {string} originOrURL
	* @return {[string|null, string|null]} - The first item is the root domain, the second item is the domain.
	*/
	function parseDomains(originOrURL) {
		if (typeof originOrURL !== "string") return [null, null];
		if (originOrURL.length > 1e4 || originOrURL.startsWith("data:")) return [null, null];
		let m = originOrURL.match(DOMAIN_IN_URL_REGEX);
		let domain;
		if (m) domain = m[1];
		m = originOrURL.match(DOMAIN_CHARACTERS);
		if (m) domain = m[0];
		if (!domain) return [null, null];
		if (IP_REGEX.test(domain)) return [domain, domain];
		m = domain.match(ROOT_DOMAIN_REGEX);
		return [m && m[0] || domain, domain];
	}
	function getRootDomain(originOrURL) {
		return parseDomains(originOrURL)[0];
	}
	function sliceSubdomainFromDomain(domain, rootDomain) {
		if (domain.length <= rootDomain.length) return domain;
		return domain.split(".").slice(1).join(".");
	}
	function getEntityInDataset(entityByDomain, entityBySubDomain, entityByRootDomain, originOrURL) {
		const [rootDomain, domain] = parseDomains(originOrURL);
		if (!domain || !rootDomain) return void 0;
		if (entityByDomain.has(domain)) return entityByDomain.get(domain);
		for (let subdomain = domain; subdomain.length > rootDomain.length; subdomain = sliceSubdomainFromDomain(subdomain, rootDomain)) if (entityBySubDomain.has(subdomain)) return entityBySubDomain.get(subdomain);
		if (entityByRootDomain.has(rootDomain)) return entityByRootDomain.get(rootDomain);
	}
	function getProductInDataset(entityByDomain, entityBySubDomain, entityByRootDomain, originOrURL) {
		const entity = getEntityInDataset(entityByDomain, entityBySubDomain, entityByRootDomain, originOrURL);
		const products = entity && entity.products;
		if (!products) return void 0;
		if (typeof originOrURL !== "string") return void 0;
		for (const product of products) for (const pattern of product.urlPatterns) {
			if (pattern instanceof RegExp && pattern.test(originOrURL)) return product;
			if (typeof pattern === "string" && originOrURL.includes(pattern)) return product;
		}
	}
	function cloneEntities(entities) {
		return entities.map((entity_) => {
			const entity = {
				company: entity_.name,
				categories: [entity_.category],
				...entity_
			};
			entity.products = (entity_.products || []).map((product) => ({
				company: entity.company,
				category: entity.category,
				categories: [entity.category],
				facades: [],
				...product,
				urlPatterns: (product.urlPatterns || []).map((s) => s.startsWith("REGEXP:") ? new RegExp(s.slice(7)) : s)
			}));
			return entity;
		});
	}
	function createAPIFromDataset(entities_) {
		const entities = cloneEntities(entities_);
		const entityByDomain = /* @__PURE__ */ new Map();
		const entityByRootDomain = /* @__PURE__ */ new Map();
		const entityBySubDomain = /* @__PURE__ */ new Map();
		for (const entity of entities) {
			entity.totalExecutionTime = Number(entity.totalExecutionTime) || 0;
			entity.totalOccurrences = Number(entity.totalOccurrences) || 0;
			entity.averageExecutionTime = entity.totalExecutionTime / entity.totalOccurrences;
			for (const domain of entity.domains) {
				if (entityByDomain.has(domain)) {
					const duplicate = entityByDomain.get(domain);
					throw new Error(`Duplicate domain ${domain} (${entity.name} and ${duplicate.name})`);
				}
				entityByDomain.set(domain, entity);
				const rootDomain = getRootDomain(domain);
				if (domain.startsWith("*.")) {
					const wildcardDomain = domain.slice(2);
					if (wildcardDomain === rootDomain) entityByRootDomain.set(rootDomain, entity);
					else entityBySubDomain.set(wildcardDomain, entity);
				}
			}
		}
		for (const [rootDomain, entity] of entityByRootDomain.entries()) if (!entity) entityByRootDomain.delete(rootDomain);
		return {
			getEntity: getEntityInDataset.bind(null, entityByDomain, entityBySubDomain, entityByRootDomain),
			getProduct: getProductInDataset.bind(null, entityByDomain, entityBySubDomain, entityByRootDomain),
			getRootDomain,
			entities
		};
	}
	module.exports = { createAPIFromDataset };
}));
//#endregion
//#region node_modules/third-party-web/dist/entities.json
var entities_exports = /* @__PURE__ */ __exportAll({ default: () => entities_default });
var entities_default;
var init_entities = __esmMin((() => {
	entities_default = /*#__PURE__*/ JSON.parse("[{\"name\":\"Google/Doubleclick Ads\",\"company\":\"Google\",\"homepage\":\"https://marketingplatform.google.com/about/enterprise/\",\"category\":\"ad\",\"domains\":[\"adservice.google.com\",\"adservice.google.com.au\",\"adservice.google.com.sg\",\"adservice.google.com.br\",\"adservice.google.com.ua\",\"adservice.google.co.uk\",\"adservice.google.co.jp\",\"adservice.google.co.in\",\"adservice.google.co.kr\",\"adservice.google.co.id\",\"adservice.google.co.nz\",\"adservice.google.ie\",\"adservice.google.se\",\"adservice.google.de\",\"adservice.google.ca\",\"adservice.google.be\",\"adservice.google.es\",\"adservice.google.ch\",\"adservice.google.fr\",\"adservice.google.nl\",\"*.googleadservices.com\",\"*.googlesyndication.com\",\"*.googletagservices.com\",\"*.2mdn.net\",\"*.doubleclick.net\"],\"examples\":[\"pagead2.googlesyndication.com\",\"tpc.googlesyndication.com\",\"ade.googlesyndication.com\",\"googleads.g.doubleclick.net\",\"googleads4.g.doubleclick.net\",\"securepubads.g.doubleclick.net\",\"pubads.g.doubleclick.net\",\"static.doubleclick.net\",\"cm.g.doubleclick.net\",\"bid.g.doubleclick.net\",\"s0.2mdn.net\",\"stats.g.doubleclick.net\",\"survey.g.doubleclick.net\",\"fls.doubleclick.net\",\"ad.doubleclick.net\",\"www.googleadservices.com\",\"https://www.googletagservices.com/tag/js/gpt.js\"],\"totalExecutionTime\":1895364543,\"totalOccurrences\":1089340},{\"name\":\"Facebook\",\"homepage\":\"https://www.facebook.com\",\"category\":\"social\",\"domains\":[\"*.facebook.com\",\"*.atlassbx.com\",\"*.fbsbx.com\",\"fbcdn-photos-e-a.akamaihd.net\",\"*.facebook.net\",\"*.fbcdn.net\"],\"examples\":[\"www.facebook.com\",\"connect.facebook.net\",\"staticxx.facebook.com\",\"static.xx.fbcdn.net\",\"m.facebook.com\",\"an.facebook.com\",\"platform-lookaside.fbsbx.com\"],\"products\":[{\"name\":\"Facebook Messenger Customer Chat\",\"urlPatterns\":[\"REGEXP:connect\\\\.facebook\\\\.net\\\\/.*\\\\/sdk\\\\/xfbml\\\\.customerchat\\\\.js\"],\"facades\":[{\"name\":\"React Live Chat Loader\",\"repo\":\"https://github.com/calibreapp/react-live-chat-loader\"}]}],\"totalExecutionTime\":1094635985,\"totalOccurrences\":2995341},{\"name\":\"Instagram\",\"homepage\":\"https://www.instagram.com\",\"category\":\"social\",\"domains\":[\"*.cdninstagram.com\",\"*.instagram.com\"],\"examples\":[\"scontent.cdninstagram.com\"],\"totalExecutionTime\":30750153,\"totalOccurrences\":21928},{\"name\":\"Google CDN\",\"company\":\"Google\",\"homepage\":\"https://developers.google.com/speed/libraries/\",\"category\":\"cdn\",\"domains\":[\"ajax.googleapis.com\",\"commondatastorage.googleapis.com\",\"www.gstatic.com\",\"ssl.gstatic.com\"],\"totalExecutionTime\":4506685986,\"totalOccurrences\":3074172},{\"name\":\"Google Maps\",\"company\":\"Google\",\"homepage\":\"https://www.google.com/maps\",\"category\":\"utility\",\"domains\":[\"maps.google.com\",\"maps-api-ssl.google.com\",\"maps.googleapis.com\",\"mts.googleapis.com\",\"mt.googleapis.com\",\"mt0.googleapis.com\",\"mt1.googleapis.com\",\"mt2.googleapis.com\",\"mt3.googleapis.com\",\"khm0.googleapis.com\",\"khm1.googleapis.com\",\"khms.googleapis.com\",\"khms1.googleapis.com\",\"khms2.googleapis.com\",\"maps.gstatic.com\"],\"totalExecutionTime\":756843145,\"totalOccurrences\":1111403},{\"name\":\"Other Google APIs/SDKs\",\"company\":\"Google\",\"homepage\":\"https://developers.google.com/apis-explorer/#p/\",\"category\":\"utility\",\"domains\":[\"accounts.google.com\",\"apis.google.com\",\"calendar.google.com\",\"clients2.google.com\",\"cse.google.com\",\"news.google.com\",\"pay.google.com\",\"payments.google.com\",\"play.google.com\",\"smartlock.google.com\",\"www.google.com\",\"www.google.de\",\"www.google.co.jp\",\"www.google.com.au\",\"www.google.co.uk\",\"www.google.ie\",\"www.google.com.sg\",\"www.google.co.in\",\"www.google.com.br\",\"www.google.ca\",\"www.google.co.kr\",\"www.google.co.nz\",\"www.google.co.id\",\"www.google.fr\",\"www.google.be\",\"www.google.com.ua\",\"www.google.nl\",\"www.google.ru\",\"www.google.se\",\"www.googleapis.com\",\"imasdk.googleapis.com\",\"storage.googleapis.com\",\"translate.googleapis.com\",\"translate.google.com\",\"translate-pa.googleapis.com\",\"lh3.googleusercontent.com\",\"jnn-pa.googleapis.com\",\"csi.gstatic.com\"],\"totalExecutionTime\":1157046365,\"totalOccurrences\":2800118},{\"name\":\"Firebase\",\"homepage\":\"https://developers.google.com/apis-explorer/#p/\",\"category\":\"utility\",\"domains\":[\"firebasestorage.googleapis.com\",\"firestore.googleapis.com\",\"firebaseinstallations.googleapis.com\",\"firebase.googleapis.com\",\"firebaseremoteconfig.googleapis.com\"],\"totalExecutionTime\":133058,\"totalOccurrences\":342},{\"name\":\"Google Analytics\",\"company\":\"Google\",\"homepage\":\"https://marketingplatform.google.com/about/analytics/\",\"category\":\"analytics\",\"domains\":[\"*.google-analytics.com\",\"*.urchin.com\",\"analytics.google.com\"],\"examples\":[\"www.google-analytics.com\",\"ssl.google-analytics.com\",\"analytics.google.com/g/collect\"],\"totalExecutionTime\":353272728,\"totalOccurrences\":3318143},{\"name\":\"Google Optimize\",\"company\":\"Google\",\"homepage\":\"https://marketingplatform.google.com/about/optimize/\",\"category\":\"analytics\",\"domains\":[\"www.googleoptimize.com\"],\"examples\":[\"https://www.googleoptimize.com/optimize.js?id=\"],\"totalExecutionTime\":9309358,\"totalOccurrences\":32737},{\"name\":\"Google AMP\",\"company\":\"Google\",\"homepage\":\"https://github.com/google/amp-client-id-library\",\"category\":\"analytics\",\"domains\":[\"ampcid.google.com\"]},{\"name\":\"Google Tag Manager\",\"company\":\"Google\",\"homepage\":\"https://marketingplatform.google.com/about/tag-manager/\",\"category\":\"tag-manager\",\"domains\":[\"*.googletagmanager.com\"],\"examples\":[\"www.googletagmanager.com\"],\"totalExecutionTime\":7389291769,\"totalOccurrences\":7961625},{\"name\":\"Google Fonts\",\"company\":\"Google\",\"homepage\":\"https://fonts.google.com/\",\"category\":\"cdn\",\"domains\":[\"fonts.googleapis.com\",\"fonts.gstatic.com\"],\"totalExecutionTime\":37964,\"totalOccurrences\":121454},{\"name\":\"Adobe TypeKit\",\"company\":\"Adobe\",\"homepage\":\"https://fonts.adobe.com/\",\"category\":\"cdn\",\"domains\":[\"*.typekit.com\",\"*.typekit.net\"],\"examples\":[\"use.typekit.net\",\"p.typekit.net\"],\"totalExecutionTime\":68158652,\"totalOccurrences\":99069},{\"name\":\"YouTube\",\"homepage\":\"https://youtube.com\",\"category\":\"video\",\"domains\":[\"*.youtube.com\",\"*.ggpht.com\",\"*.youtube-nocookie.com\",\"*.ytimg.com\"],\"examples\":[\"www.youtube.com\",\"s.ytimg.com\",\"yt3.ggpht.com\",\"img.youtube.com\",\"fcmatch.youtube.com\"],\"products\":[{\"name\":\"YouTube Embedded Player\",\"urlPatterns\":[\"youtube.com/embed/\"],\"facades\":[{\"name\":\"Lite YouTube\",\"repo\":\"https://github.com/paulirish/lite-youtube-embed\"},{\"name\":\"Ngx Lite Video\",\"repo\":\"https://github.com/karim-mamdouh/ngx-lite-video\"}]}],\"totalExecutionTime\":5665857707,\"totalOccurrences\":895895},{\"name\":\"Twitter\",\"homepage\":\"https://twitter.com\",\"category\":\"social\",\"domains\":[\"*.vine.co\",\"*.twimg.com\",\"*.twitpic.com\",\"platform.twitter.com\",\"syndication.twitter.com\"],\"examples\":[\"cdn.syndication.twimg.com\",\"abs.twimg.com\",\"pbs.twimg.com\"],\"totalExecutionTime\":492676993,\"totalOccurrences\":256383},{\"name\":\"AddThis\",\"homepage\":\"https://www.addthis.com/\",\"category\":\"social\",\"domains\":[\"*.addthis.com\",\"*.addthiscdn.com\",\"*.addthisedge.com\"],\"examples\":[\"s7.addthis.com\",\"r.dlx.addthis.com\",\"su.addthis.com\",\"x.dlx.addthis.com\"]},{\"name\":\"AddToAny\",\"homepage\":\"https://www.addtoany.com/\",\"category\":\"social\",\"domains\":[\"*.addtoany.com\"],\"examples\":[\"static.addtoany.com\"],\"totalExecutionTime\":9795237,\"totalOccurrences\":57831},{\"name\":\"Akamai\",\"homepage\":\"https://www.akamai.com/\",\"category\":\"cdn\",\"domains\":[\"23.62.3.183\",\"*.akamaitechnologies.com\",\"*.akamaitechnologies.fr\",\"*.akamai.net\",\"*.akamaiedge.net\",\"*.akamaihd.net\",\"*.akamaized.net\",\"*.edgefcs.net\",\"*.edgekey.net\",\"edgesuite.net\",\"*.srip.net\"],\"totalExecutionTime\":3283551,\"totalOccurrences\":8485},{\"name\":\"Blogger\",\"homepage\":\"https://www.blogger.com/\",\"category\":\"hosting\",\"domains\":[\"*.blogblog.com\",\"*.blogger.com\",\"*.blogspot.com\",\"images-blogger-opensocial.googleusercontent.com\"],\"examples\":[\"1.bp.blogspot.com\",\"www.blogger.com\"],\"totalExecutionTime\":63370853,\"totalOccurrences\":189000},{\"name\":\"Gravatar\",\"homepage\":\"https://en.gravatar.com/\",\"category\":\"social\",\"domains\":[\"*.gravatar.com\"],\"examples\":[\"secure.gravatar.com\",\"www.gravatar.com\"],\"totalExecutionTime\":16106,\"totalOccurrences\":56},{\"name\":\"Yandex Metrica\",\"company\":\"Yandex\",\"homepage\":\"https://metrica.yandex.com/about?\",\"category\":\"analytics\",\"domains\":[\"mc.yandex.ru\",\"mc.yandex.com\",\"d31j93rd8oukbv.cloudfront.net\"],\"totalExecutionTime\":1512305701,\"totalOccurrences\":588700},{\"name\":\"Hotjar\",\"homepage\":\"https://www.hotjar.com/\",\"category\":\"analytics\",\"domains\":[\"*.hotjar.com\",\"*.hotjar.io\"],\"examples\":[\"script.hotjar.com\",\"static.hotjar.com\",\"in.hotjar.com\",\"vc.hotjar.io\",\"vars.hotjar.com\"],\"totalExecutionTime\":208154299,\"totalOccurrences\":313324},{\"name\":\"Baidu Analytics\",\"homepage\":\"https://tongji.baidu.com/web/welcome/login\",\"category\":\"analytics\",\"domains\":[\"hm.baidu.com\",\"hmcdn.baidu.com\"],\"examples\":[\"hm.baidu.com\",\"hmcdn.baidu.com\"],\"totalExecutionTime\":6116889,\"totalOccurrences\":28203},{\"name\":\"Insider\",\"homepage\":\"\",\"category\":\"analytics\",\"domains\":[\"*.useinsider.com\"],\"examples\":[\"hit.api.useinsider.com\"],\"totalExecutionTime\":1968001,\"totalOccurrences\":1868},{\"name\":\"Adobe Experience Cloud\",\"company\":\"Adobe\",\"homepage\":\"\",\"category\":\"analytics\",\"domains\":[\"*.2o7.net\",\"du8783wkf05yr.cloudfront.net\",\"*.hitbox.com\",\"*.imageg.net\",\"*.nedstat.com\",\"*.omtrdc.net\"],\"examples\":[\"audiag.112.2o7.net\",\"du8783wkf05yr.cloudfront.net/NS_mbox.js\"],\"totalExecutionTime\":1078,\"totalOccurrences\":11},{\"name\":\"Adobe Tag Manager\",\"company\":\"Adobe\",\"homepage\":\"https://www.adobe.com/experience-platform/\",\"category\":\"tag-manager\",\"domains\":[\"*.adobedtm.com\",\"*.demdex.net\",\"*.everesttech.net\",\"sstats.adobe.com\",\"hbrt.adobe.com\"],\"examples\":[\"assets.adobedtm.com\",\"sync-tm.everesttech.net\",\"cm.everesttech.net\"],\"totalExecutionTime\":33688290,\"totalOccurrences\":62377},{\"name\":\"jQuery CDN\",\"homepage\":\"https://code.jquery.com/\",\"category\":\"cdn\",\"domains\":[\"*.jquery.com\"],\"examples\":[\"code.jquery.com\"],\"totalExecutionTime\":291645418,\"totalOccurrences\":702447},{\"name\":\"Cloudflare CDN\",\"homepage\":\"https://cdnjs.com/\",\"category\":\"cdn\",\"domains\":[\"cdnjs.cloudflare.com\",\"amp.cloudflare.com\"],\"totalExecutionTime\":323951660,\"totalOccurrences\":669023},{\"name\":\"Cloudflare\",\"homepage\":\"https://www.cloudflare.com/website-optimization/\",\"category\":\"utility\",\"domains\":[\"ajax.cloudflare.com\",\"*.nel.cloudflare.com\",\"static.cloudflareinsights.com\"],\"totalExecutionTime\":51317445,\"totalOccurrences\":475952},{\"name\":\"WordPress\",\"company\":\"Automattic\",\"homepage\":\"https://wp.com/\",\"category\":\"hosting\",\"domains\":[\"*.wordpress.com\",\"s0.wp.com\",\"s2.wp.com\",\"*.w.org\",\"c0.wp.com\",\"s1.wp.com\",\"i0.wp.com\",\"i1.wp.com\",\"i2.wp.com\",\"widgets.wp.com\"],\"examples\":[\"s.w.org\"],\"totalExecutionTime\":115263914,\"totalOccurrences\":164616},{\"name\":\"WordPress Site Stats\",\"company\":\"Automattic\",\"homepage\":\"https://wp.com/\",\"category\":\"analytics\",\"domains\":[\"pixel.wp.com\",\"stats.wp.com\"],\"totalExecutionTime\":1499582,\"totalOccurrences\":21766},{\"name\":\"Hatena Blog\",\"homepage\":\"https://hatenablog.com/\",\"category\":\"hosting\",\"domains\":[\"*.st-hatena.com\",\"*.hatena.ne.jp\"],\"examples\":[\"cdn.blog.st-hatena.com\",\"cdn.pool.st-hatena.com\",\"cdn7.www.st-hatena.com\",\"s.hatena.ne.jp\",\"b.st-hatena.com\"],\"totalExecutionTime\":86085886,\"totalOccurrences\":36828},{\"name\":\"Shopify\",\"homepage\":\"https://www.shopify.com/\",\"category\":\"hosting\",\"domains\":[\"*.shopify.com\",\"*.shopifyapps.com\",\"*.shopifycdn.com\",\"*.shopifysvc.com\"],\"examples\":[\"cdn.shopify.com\",\"productreviews.shopifycdn.com\",\"monorail-edge.shopifysvc.com\"],\"totalExecutionTime\":327120306,\"totalOccurrences\":363104},{\"name\":\"Dealer\",\"homepage\":\"https://www.dealer.com/\",\"category\":\"hosting\",\"domains\":[\"*.dealer.com\"],\"examples\":[\"static.dealer.com\"],\"totalExecutionTime\":1290049,\"totalOccurrences\":2881},{\"name\":\"PIXNET\",\"homepage\":\"https://www.pixnet.net/\",\"category\":\"social\",\"domains\":[\"*.pixfs.net\",\"*.pixnet.net\"],\"examples\":[\"front.pixfs.net\",\"falcon-asset.pixfs.net\",\"pixgame-asset.pixfs.net\"],\"totalExecutionTime\":8239260,\"totalOccurrences\":9427},{\"name\":\"Moat\",\"homepage\":\"https://moat.com/\",\"category\":\"ad\",\"domains\":[\"*.moatads.com\",\"*.moatpixel.com\"],\"examples\":[\"z.moatads.com\",\"px.moatads.com\",\"geo.moatads.com\",\"sejs.moatads.com\",\"mb.moatads.com\",\"v4.moatads.com\"]},{\"name\":\"33 Across\",\"homepage\":\"https://33across.com/\",\"category\":\"ad\",\"domains\":[\"*.33across.com\"],\"examples\":[\"sic.33across.com\",\"cdn-sic.33across.com\"],\"totalExecutionTime\":9001941,\"totalOccurrences\":137073},{\"name\":\"OpenX\",\"homepage\":\"https://www.openx.com/\",\"category\":\"ad\",\"domains\":[\"*.deliverimp.com\",\"*.openxadexchange.com\",\"*.servedbyopenx.com\",\"*.jump-time.net\",\"*.openx.net\",\"*.openxcdn.net\"],\"examples\":[\"uk-ads.openx.net\",\"us-ads.openx.net\",\"33across-d.openx.net\",\"rtb.openx.net\",\"us-u.openx.net\",\"eu-u.openx.net\",\"u.openx.net\"],\"totalExecutionTime\":2559981,\"totalOccurrences\":33536},{\"name\":\"Amazon Ads\",\"homepage\":\"https://ad.amazon.com/\",\"category\":\"ad\",\"domains\":[\"*.amazon-adsystem.com\"],\"examples\":[\"s.amazon-adsystem.com\",\"c.amazon-adsystem.com\",\"aax.amazon-adsystem.com\",\"z-na.amazon-adsystem.com\",\"fls-na.amazon-adsystem.com\",\"aax-us-east.amazon-adsystem.com\",\"ir-na.amazon-adsystem.com\"],\"totalExecutionTime\":111013924,\"totalOccurrences\":193576},{\"name\":\"Rubicon Project\",\"homepage\":\"https://rubiconproject.com/\",\"category\":\"ad\",\"domains\":[\"*.rubiconproject.com\",\"*.chango.com\",\"*.fimserve.com\"],\"examples\":[\"pixel.rubiconproject.com\",\"fastlane.rubiconproject.com\",\"secure-assets.rubiconproject.com\",\"eus.rubiconproject.com\",\"pixel-us-east.rubiconproject.com\",\"token.rubiconproject.com\",\"ads.rubiconproject.com\"],\"totalExecutionTime\":121387956,\"totalOccurrences\":140787},{\"name\":\"The Trade Desk\",\"homepage\":\"https://www.thetradedesk.com/\",\"category\":\"ad\",\"domains\":[\"*.adsrvr.org\",\"d1eoo1tco6rr5e.cloudfront.net\"],\"examples\":[\"js.adsrvr.org\",\"match.adsrvr.org\",\"insight.adsrvr.org\",\"usw-lax.adsrvr.org\",\"data.adsrvr.org\",\"snap.adsrvr.org\"],\"totalExecutionTime\":1955832,\"totalOccurrences\":25512},{\"name\":\"Bidswitch\",\"homepage\":\"https://www.bidswitch.com/\",\"category\":\"ad\",\"domains\":[\"*.bidswitch.net\"],\"examples\":[\"x.bidswitch.net\"],\"totalExecutionTime\":6094,\"totalOccurrences\":14171},{\"name\":\"LiveRamp IdentityLink\",\"homepage\":\"https://liveramp.com/discover-identitylink/\",\"category\":\"analytics\",\"domains\":[\"*.circulate.com\",\"*.rlcdn.com\"],\"examples\":[\"idsync.rlcdn.com\",\"id.rlcdn.com\",\"api.rlcdn.com\",\"cdn.rlcdn.com\"],\"totalExecutionTime\":99045,\"totalOccurrences\":1085},{\"name\":\"Drawbridge\",\"homepage\":\"https://www.drawbridge.com/\",\"category\":\"ad\",\"domains\":[\"*.adsymptotic.com\"]},{\"name\":\"AOL / Oath / Verizon Media\",\"homepage\":\"https://www.oath.com/\",\"category\":\"ad\",\"domains\":[\"*.advertising.com\",\"*.aol.com\",\"*.aolcdn.com\",\"*.blogsmithmedia.com\",\"*.oath.com\",\"*.aol.net\",\"*.tacoda.net\",\"*.aol.co.uk\"],\"examples\":[\"pixel.advertising.com\",\"dtm.advertising.com\",\"tag.sp.advertising.com\",\"service.sp.advertising.com\",\"adtech.advertising.com\",\"adaptv.advertising.com\",\"mighty.aol.net\",\"consent.cmp.oath.com\"],\"totalExecutionTime\":198951,\"totalOccurrences\":324},{\"name\":\"Xaxis\",\"homepage\":\"https://www.xaxis.com/\",\"category\":\"ad\",\"domains\":[\"*.247realmedia.com\",\"*.mookie1.com\",\"*.gmads.net\"],\"examples\":[\"t.mookie1.com\",\"odr.mookie1.com\"],\"totalExecutionTime\":12702,\"totalOccurrences\":214},{\"name\":\"Freshdesk\",\"company\":\"Freshworks\",\"homepage\":\"https://freshdesk.com/\",\"category\":\"customer-success\",\"domains\":[\"d36mpcpuzc4ztk.cloudfront.net\"],\"totalExecutionTime\":46274,\"totalOccurrences\":179},{\"name\":\"Help Scout\",\"homepage\":\"https://www.helpscout.net/\",\"category\":\"customer-success\",\"domains\":[\"djtflbt20bdde.cloudfront.net\",\"*.helpscout.net\"],\"examples\":[\"beacon-v2.helpscout.net\"],\"products\":[{\"name\":\"Help Scout Beacon\",\"urlPatterns\":[\"beacon-v2.helpscout.net\"],\"facades\":[{\"name\":\"React Live Chat Loader\",\"repo\":\"https://github.com/calibreapp/react-live-chat-loader\"}]}],\"totalExecutionTime\":1942024,\"totalOccurrences\":4719},{\"name\":\"Alexa\",\"homepage\":\"https://www.alexa.com/\",\"category\":\"analytics\",\"domains\":[\"*.alexametrics.com\",\"d31qbv1cthcecs.cloudfront.net\"],\"examples\":[\"certify.alexametrics.com\"]},{\"name\":\"OneSignal\",\"homepage\":\"https://onesignal.com/\",\"category\":\"utility\",\"domains\":[\"*.onesignal.com\"],\"examples\":[\"cdn.onesignal.com\",\"https://onesignal.com/api/v1/sync/\"],\"totalExecutionTime\":12857705,\"totalOccurrences\":65764},{\"name\":\"Lucky Orange\",\"homepage\":\"https://www.luckyorange.com/\",\"category\":\"analytics\",\"domains\":[\"*.luckyorange.com\",\"d10lpsik1i8c69.cloudfront.net\",\"*.luckyorange.net\"],\"totalExecutionTime\":10238853,\"totalOccurrences\":18203},{\"name\":\"Crazy Egg\",\"homepage\":\"https://www.crazyegg.com/\",\"category\":\"analytics\",\"domains\":[\"*.cetrk.com\",\"*.crazyegg.com\",\"dnn506yrbagrg.cloudfront.net\"],\"totalExecutionTime\":10994001,\"totalOccurrences\":16490},{\"name\":\"Hello Bar\",\"homepage\":\"https://www.hellobar.com/\",\"category\":\"marketing\",\"domains\":[\"*.hellobar.com\"],\"totalExecutionTime\":1338487,\"totalOccurrences\":3821},{\"name\":\"Yandex Ads\",\"company\":\"Yandex\",\"homepage\":\"https://yandex.com/adv/\",\"category\":\"ad\",\"domains\":[\"an.yandex.ru\"],\"totalExecutionTime\":5496948,\"totalOccurrences\":7548},{\"name\":\"Salesforce\",\"homepage\":\"https://www.salesforce.com/products/marketing-cloud/\",\"category\":\"analytics\",\"domains\":[\"*.krxd.net\"],\"examples\":[\"cdn.krxd.net\",\"beacon.krxd.net\",\"consumer.krxd.net\",\"usermatch.krxd.net\"]},{\"name\":\"Salesforce Commerce Cloud\",\"homepage\":\"https://www.salesforce.com/products/commerce-cloud/overview/\",\"category\":\"hosting\",\"domains\":[\"*.cquotient.com\",\"*.demandware.net\",\"demandware.edgesuite.net\"],\"totalExecutionTime\":2007201,\"totalOccurrences\":4213},{\"name\":\"Optimizely\",\"homepage\":\"https://www.optimizely.com/\",\"category\":\"analytics\",\"domains\":[\"*.optimizely.com\"],\"examples\":[\"cdn.optimizely.com\",\"cdn-pci.optimizely.com\",\"logx.optimizely.com\",\"cdn3.optimizely.com\"],\"totalExecutionTime\":12934049,\"totalOccurrences\":16429},{\"name\":\"LiveChat\",\"homepage\":\"https://www.livechat.com/\",\"category\":\"customer-success\",\"domains\":[\"*.livechatinc.com\",\"*.livechat.com\",\"*.livechat-static.com\"],\"examples\":[\"cdn.livechatinc.com\",\"secure.livechatinc.com\"],\"totalExecutionTime\":43410008,\"totalOccurrences\":40228},{\"name\":\"VK\",\"homepage\":\"https://vk.com/\",\"category\":\"social\",\"domains\":[\"*.vk.com\"],\"totalExecutionTime\":93583750,\"totalOccurrences\":20105},{\"name\":\"Tumblr\",\"homepage\":\"https://tumblr.com/\",\"category\":\"social\",\"domains\":[\"*.tumblr.com\"],\"examples\":[\"assets.tumblr.com\",\"static.tumblr.com\"],\"totalExecutionTime\":35220770,\"totalOccurrences\":13203},{\"name\":\"Wistia\",\"homepage\":\"https://wistia.com/\",\"category\":\"video\",\"domains\":[\"*.wistia.com\",\"embedwistia-a.akamaihd.net\",\"*.wistia.net\"],\"examples\":[\"fast.wistia.com\",\"fast.wistia.net\",\"distillery.wistia.com\",\"pipedream.wistia.com\"],\"totalExecutionTime\":103373064,\"totalOccurrences\":24186},{\"name\":\"Brightcove\",\"homepage\":\"https://www.brightcove.com/en/\",\"category\":\"video\",\"domains\":[\"*.brightcove.com\",\"*.brightcove.net\",\"*.zencdn.net\"],\"examples\":[\"vjs.zencdn.net\",\"players.brightcove.net\"],\"totalExecutionTime\":13466981,\"totalOccurrences\":12668},{\"name\":\"JSDelivr CDN\",\"homepage\":\"https://www.jsdelivr.com/\",\"category\":\"cdn\",\"domains\":[\"*.jsdelivr.net\"],\"examples\":[\"cdn.jsdelivr.net\"],\"totalExecutionTime\":290846822,\"totalOccurrences\":450223},{\"name\":\"Sumo\",\"homepage\":\"https://sumo.com/\",\"category\":\"marketing\",\"domains\":[\"*.sumo.com\",\"*.sumome.com\",\"sumo.b-cdn.net\"],\"examples\":[\"sumo.b-cdn.net\",\"load.sumo.com\",\"load.sumome.com\"],\"totalExecutionTime\":12667670,\"totalOccurrences\":9197},{\"name\":\"Vimeo\",\"homepage\":\"https://vimeo.com/\",\"category\":\"video\",\"domains\":[\"*.vimeo.com\",\"*.vimeocdn.com\"],\"examples\":[\"f.vimeocdn.com\",\"player.vimeo.com\",\"i.vimeocdn.com\"],\"products\":[{\"name\":\"Vimeo Embedded Player\",\"urlPatterns\":[\"player.vimeo.com/video/\"],\"facades\":[{\"name\":\"Lite Vimeo\",\"repo\":\"https://github.com/slightlyoff/lite-vimeo\"},{\"name\":\"Lite Vimeo Embed\",\"repo\":\"https://github.com/luwes/lite-vimeo-embed\"},{\"name\":\"Ngx Lite Video\",\"repo\":\"https://github.com/karim-mamdouh/ngx-lite-video\"}]}],\"totalExecutionTime\":184143442,\"totalOccurrences\":100059},{\"name\":\"Disqus\",\"homepage\":\"https://disqus.com/\",\"category\":\"social\",\"domains\":[\"*.disqus.com\",\"*.disquscdn.com\"],\"examples\":[\"c.disquscdn.com\"],\"totalExecutionTime\":3050274,\"totalOccurrences\":1428},{\"name\":\"Yandex APIs\",\"company\":\"Yandex\",\"homepage\":\"https://yandex.ru/\",\"category\":\"utility\",\"domains\":[\"api-maps.yandex.ru\",\"money.yandex.ru\"],\"totalExecutionTime\":38207379,\"totalOccurrences\":50389},{\"name\":\"Yandex CDN\",\"company\":\"Yandex\",\"homepage\":\"https://yandex.ru/\",\"category\":\"cdn\",\"domains\":[\"*.yandex.st\",\"*.yastatic.net\"],\"examples\":[\"https://yastatic.net/share2/share.js\",\"https://yastatic.net/jquery/2.1.4/jquery.min.js\"]},{\"name\":\"Integral Ad Science\",\"homepage\":\"https://integralads.com/uk/\",\"category\":\"ad\",\"domains\":[\"*.adsafeprotected.com\",\"*.iasds01.com\"],\"examples\":[\"pixel.adsafeprotected.com\",\"static.adsafeprotected.com\",\"fw.adsafeprotected.com\",\"cdn.adsafeprotected.com\",\"dt.adsafeprotected.com\"],\"totalExecutionTime\":50743445,\"totalOccurrences\":22842},{\"name\":\"Tealium\",\"homepage\":\"https://tealium.com/\",\"category\":\"tag-manager\",\"domains\":[\"*.aniview.com\",\"*.delvenetworks.com\",\"*.limelight.com\",\"*.tiqcdn.com\",\"*.llnwd.net\",\"*.tealiumiq.com\"],\"examples\":[\"tags.tiqcdn.com\",\"tealium.hs.llnwd.net\",\"link.videoplatform.limelight.com\",\"datacloud.tealiumiq.com\"],\"totalExecutionTime\":21201047,\"totalOccurrences\":38244},{\"name\":\"Pubmatic\",\"homepage\":\"https://pubmatic.com/\",\"category\":\"ad\",\"domains\":[\"*.pubmatic.com\"],\"examples\":[\"image6.pubmatic.com\",\"ads.pubmatic.com\",\"image2.pubmatic.com\",\"simage2.pubmatic.com\",\"image4.pubmatic.com\",\"simage4.pubmatic.com\",\"image5.pubmatic.com\",\"hbopenbid.pubmatic.com\"],\"totalExecutionTime\":175543567,\"totalOccurrences\":154853},{\"name\":\"Olark\",\"homepage\":\"https://www.olark.com/\",\"category\":\"customer-success\",\"domains\":[\"*.olark.com\"],\"examples\":[\"static.olark.com\"],\"totalExecutionTime\":8140072,\"totalOccurrences\":5718},{\"name\":\"Tawk.to\",\"homepage\":\"https://www.tawk.to/\",\"category\":\"customer-success\",\"domains\":[\"*.tawk.to\"],\"examples\":[\"embed.tawk.to\"],\"totalExecutionTime\":40939520,\"totalOccurrences\":103045},{\"name\":\"OptinMonster\",\"homepage\":\"https://optinmonster.com/\",\"category\":\"marketing\",\"domains\":[\"*.opmnstr.com\",\"*.optmnstr.com\",\"*.optmstr.com\"],\"examples\":[\"a.optmstr.com\",\"api.opmnstr.com\",\"a.optmnstr.com\"],\"totalExecutionTime\":979410,\"totalOccurrences\":1993},{\"name\":\"ZenDesk\",\"homepage\":\"https://zendesk.com/\",\"category\":\"customer-success\",\"domains\":[\"*.zdassets.com\",\"*.zendesk.com\",\"*.zopim.com\"],\"examples\":[\"assets.zendesk.com\",\"static.zdassets.com\",\"v2.zopim.com\"],\"totalExecutionTime\":90954192,\"totalOccurrences\":70039},{\"name\":\"Pusher\",\"homepage\":\"https://pusher.com/\",\"category\":\"utility\",\"domains\":[\"*.pusher.com\",\"*.pusherapp.com\"],\"examples\":[\"stats.pusher.com\"],\"totalExecutionTime\":163818,\"totalOccurrences\":2114},{\"name\":\"Drift\",\"homepage\":\"https://www.drift.com/\",\"category\":\"marketing\",\"domains\":[\"*.drift.com\",\"*.driftt.com\"],\"examples\":[\"js.driftt.com\",\"api.drift.com\"],\"products\":[{\"name\":\"Drift Live Chat\",\"urlPatterns\":[\"REGEXP:js\\\\.driftt\\\\.com\\\\/include\\\\/.*\\\\/.*\\\\.js\"],\"facades\":[{\"name\":\"React Live Chat Loader\",\"repo\":\"https://github.com/calibreapp/react-live-chat-loader\"}]}],\"totalExecutionTime\":16346406,\"totalOccurrences\":3595},{\"name\":\"Sentry\",\"homepage\":\"https://sentry.io/\",\"category\":\"utility\",\"domains\":[\"*.getsentry.com\",\"*.ravenjs.com\",\"*.sentry-cdn.com\",\"*.sentry.io\"],\"examples\":[\"cdn.ravenjs.com\",\"browser.sentry-cdn.com\"],\"totalExecutionTime\":53849115,\"totalOccurrences\":161265},{\"name\":\"Amazon Web Services\",\"homepage\":\"https://aws.amazon.com/s3/\",\"category\":\"other\",\"domains\":[\"*.amazon.com\",\"*.amazonaws.com\",\"*.amazonwebapps.com\",\"*.amazonwebservices.com\",\"*.elasticbeanstalk.com\",\"*.images-amazon.com\",\"*.amazon.co.uk\"],\"examples\":[\"s3.amazonaws.com\",\"us-east-1.amazonaws.com\",\"api-cdn.amazon.com\",\"ecx.images-amazon.com\",\"ws.amazon.co.uk\"],\"totalExecutionTime\":37444864,\"totalOccurrences\":109967},{\"name\":\"Amazon Pay\",\"homepage\":\"https://pay.amazon.com\",\"category\":\"utility\",\"domains\":[\"payments.amazon.com\",\"*.payments-amazon.com\"],\"totalExecutionTime\":1219112,\"totalOccurrences\":7172},{\"name\":\"Media.net\",\"homepage\":\"https://www.media.net/\",\"category\":\"ad\",\"domains\":[\"*.media.net\",\"*.mnet-ad.net\"],\"examples\":[\"contextual.media.net\",\"cdnwest-xch.media.net\",\"hbx.media.net\",\"cs.media.net\",\"hblg.media.net\"],\"totalExecutionTime\":5902185,\"totalOccurrences\":21412},{\"name\":\"Yahoo!\",\"homepage\":\"https://www.yahoo.com/\",\"category\":\"ad\",\"domains\":[\"*.bluelithium.com\",\"*.hostingprod.com\",\"*.lexity.com\",\"*.yahoo.com\",\"*.yahooapis.com\",\"*.yimg.com\",\"*.zenfs.com\",\"*.yahoo.net\"],\"examples\":[\"ads.yahoo.com\",\"analytics.yahoo.com\",\"geo.yahoo.com\",\"udc.yahoo.com\",\"ganon.yahoo.com\",\"ads.yap.yahoo.com\"],\"totalExecutionTime\":1913845,\"totalOccurrences\":12373},{\"name\":\"Adroll\",\"homepage\":\"https://www.adroll.com/\",\"category\":\"ad\",\"domains\":[\"*.adroll.com\"],\"examples\":[\"d.adroll.com\",\"s.adroll.com\"],\"totalExecutionTime\":10797117,\"totalOccurrences\":30347},{\"name\":\"Twitch\",\"homepage\":\"https://twitch.tv/\",\"category\":\"video\",\"domains\":[\"*.twitch.tv\"],\"examples\":[\"player.twitch.tv\"],\"totalExecutionTime\":22670443,\"totalOccurrences\":1298},{\"name\":\"Taboola\",\"homepage\":\"https://www.taboola.com/\",\"category\":\"ad\",\"domains\":[\"*.taboola.com\",\"*.taboolasyndication.com\"],\"examples\":[\"cdn.taboola.com\",\"trc.taboola.com\",\"vidstat.taboola.com\",\"images.taboola.com\"],\"totalExecutionTime\":31382437,\"totalOccurrences\":43108},{\"name\":\"Sizmek\",\"homepage\":\"https://www.sizmek.com/\",\"category\":\"ad\",\"domains\":[\"*.serving-sys.com\",\"*.peer39.net\"],\"examples\":[\"secure-ds.serving-sys.com\",\"ds.serving-sys.com\",\"bs.serving-sys.com\"]},{\"name\":\"Scorecard Research\",\"homepage\":\"https://www.scorecardresearch.com/\",\"category\":\"ad\",\"domains\":[\"*.scorecardresearch.com\"],\"examples\":[\"sb.scorecardresearch.com\",\"sa.scorecardresearch.com\",\"b.scorecardresearch.com\"],\"totalExecutionTime\":4328628,\"totalOccurrences\":58963},{\"name\":\"Criteo\",\"homepage\":\"https://www.criteo.com/\",\"category\":\"ad\",\"domains\":[\"*.criteo.com\",\"*.emailretargeting.com\",\"*.criteo.net\"],\"examples\":[\"static.criteo.net\",\"bidder.criteo.com\",\"dis.criteo.com\",\"gum.criteo.com\",\"sslwidget.criteo.com\",\"dis.us.criteo.com\"],\"totalExecutionTime\":19768066,\"totalOccurrences\":141624},{\"name\":\"Segment\",\"homepage\":\"https://segment.com/\",\"category\":\"analytics\",\"domains\":[\"*.segment.com\",\"*.segment.io\"],\"examples\":[\"cdn.segment.com\",\"api.segment.io\"],\"totalExecutionTime\":8873052,\"totalOccurrences\":26262},{\"name\":\"ShareThis\",\"homepage\":\"https://www.sharethis.com/\",\"category\":\"social\",\"domains\":[\"*.sharethis.com\"],\"examples\":[\"w.sharethis.com\",\"ws.sharethis.com\",\"t.sharethis.com\"],\"totalExecutionTime\":24069034,\"totalOccurrences\":79526},{\"name\":\"Distil Networks\",\"homepage\":\"https://www.distilnetworks.com/\",\"category\":\"utility\",\"domains\":[\"*.areyouahuman.com\"],\"examples\":[\"n-cdn.areyouahuman.com\"]},{\"name\":\"Connexity\",\"homepage\":\"https://connexity.com/\",\"category\":\"analytics\",\"domains\":[\"*.connexity.net\"]},{\"name\":\"Popads\",\"homepage\":\"https://www.popads.net/\",\"category\":\"ad\",\"domains\":[\"*.popads.net\"],\"examples\":[\"serve.popads.net\",\"c1.popads.net\"],\"totalExecutionTime\":519951,\"totalOccurrences\":335},{\"name\":\"CreateJS CDN\",\"homepage\":\"https://code.createjs.com/\",\"category\":\"cdn\",\"domains\":[\"*.createjs.com\"],\"examples\":[\"code.createjs.com\"],\"totalExecutionTime\":13180116,\"totalOccurrences\":4132},{\"name\":\"Squarespace\",\"homepage\":\"https://www.squarespace.com/\",\"category\":\"hosting\",\"domains\":[\"*.squarespace.com\"],\"examples\":[\"static.squarespace.com\",\"static1.squarespace.com\"],\"totalExecutionTime\":868857685,\"totalOccurrences\":242555},{\"name\":\"Media Math\",\"homepage\":\"https://www.mediamath.com/\",\"category\":\"ad\",\"domains\":[\"*.mathads.com\",\"*.mathtag.com\"],\"examples\":[\"mathid.mathtag.com\",\"sync.mathtag.com\",\"pixel.mathtag.com\"],\"totalExecutionTime\":19234,\"totalOccurrences\":195},{\"name\":\"Mixpanel\",\"homepage\":\"https://mixpanel.com/\",\"category\":\"analytics\",\"domains\":[\"*.mixpanel.com\",\"*.mxpnl.com\"],\"examples\":[\"cdn.mxpnl.com\"],\"totalExecutionTime\":4042274,\"totalOccurrences\":20159},{\"name\":\"FontAwesome CDN\",\"homepage\":\"https://fontawesome.com/\",\"category\":\"cdn\",\"domains\":[\"*.fontawesome.com\"],\"examples\":[\"use.fontawesome.com\"],\"totalExecutionTime\":54629529,\"totalOccurrences\":261491},{\"name\":\"Hubspot\",\"homepage\":\"https://hubspot.com/\",\"category\":\"marketing\",\"domains\":[\"*.hs-scripts.com\",\"*.hubspot.com\",\"*.leadin.com\",\"*.hs-analytics.net\",\"*.hscollectedforms.net\",\"*.hscta.net\",\"*.hsforms.net\",\"*.hsleadflows.net\",\"*.hsstatic.net\",\"*.hubspot.net\",\"*.hsforms.com\",\"*.hs-banner.com\",\"*.hs-embed-reporting.com\",\"*.hs-growth-metrics.com\",\"*.hs-data.com\",\"*.hsadspixel.net\",\"*.hubapi.com\"],\"examples\":[\"forms.hubspot.com\",\"js.hsforms.net\",\"js.hs-analytics.net\",\"js.leadin.com\"],\"totalExecutionTime\":74199838,\"totalOccurrences\":153435},{\"name\":\"Mailchimp\",\"homepage\":\"https://mailchimp.com/\",\"category\":\"marketing\",\"domains\":[\"*.chimpstatic.com\",\"*.list-manage.com\",\"*.mailchimp.com\"],\"examples\":[\"downloads.mailchimp.com\"],\"totalExecutionTime\":19257194,\"totalOccurrences\":41885},{\"name\":\"MGID\",\"homepage\":\"https://www.mgid.com/\",\"category\":\"ad\",\"domains\":[\"*.mgid.com\",\"*.dt07.net\"],\"examples\":[\"servicer.mgid.com\"],\"totalExecutionTime\":26630342,\"totalOccurrences\":15911},{\"name\":\"Stripe\",\"homepage\":\"https://stripe.com\",\"category\":\"utility\",\"domains\":[\"*.stripe.com\",\"*.stripecdn.com\",\"*.stripe.network\"],\"examples\":[\"m.stripe.network\",\"js.stripe.com\"],\"totalExecutionTime\":167153892,\"totalOccurrences\":144318},{\"name\":\"PayPal\",\"homepage\":\"https://paypal.com\",\"category\":\"utility\",\"domains\":[\"*.paypal.com\",\"*.paypalobjects.com\"],\"examples\":[\"www.paypalobjects.com\"],\"totalExecutionTime\":50122285,\"totalOccurrences\":62538},{\"name\":\"Market GID\",\"homepage\":\"https://www.marketgid.com/\",\"category\":\"ad\",\"domains\":[\"*.marketgid.com\"],\"examples\":[\"jsc.marketgid.com\"]},{\"name\":\"Pinterest\",\"homepage\":\"https://pinterest.com/\",\"category\":\"social\",\"domains\":[\"*.pinimg.com\",\"*.pinterest.com\"],\"examples\":[\"assets.pinterest.com\",\"ct.pinterest.com\",\"log.pinterest.com\"],\"totalExecutionTime\":14665438,\"totalOccurrences\":131471},{\"name\":\"New Relic\",\"homepage\":\"https://newrelic.com/\",\"category\":\"utility\",\"domains\":[\"*.newrelic.com\",\"*.nr-data.net\"],\"examples\":[\"js-agent.newrelic.com\",\"bam.nr-data.net\"],\"totalExecutionTime\":48761439,\"totalOccurrences\":193544},{\"name\":\"AppDynamics\",\"homepage\":\"https://www.appdynamics.com/\",\"category\":\"utility\",\"domains\":[\"*.appdynamics.com\",\"*.eum-appdynamics.com\",\"d3tjaysgumg9lf.cloudfront.net\"],\"examples\":[\"cdn.appdynamics.com\"],\"totalExecutionTime\":1828614,\"totalOccurrences\":2010},{\"name\":\"Parking Crew\",\"homepage\":\"https://parkingcrew.net/\",\"category\":\"other\",\"domains\":[\"d1lxhc4jvstzrp.cloudfront.net\",\"*.parkingcrew.net\"],\"totalExecutionTime\":7,\"totalOccurrences\":1},{\"name\":\"WordAds\",\"company\":\"Automattic\",\"homepage\":\"https://wordads.co/\",\"category\":\"ad\",\"domains\":[\"*.pubmine.com\"],\"examples\":[\"s.pubmine.com\"],\"totalExecutionTime\":3203318,\"totalOccurrences\":5254},{\"name\":\"AppNexus\",\"homepage\":\"https://www.appnexus.com/\",\"category\":\"ad\",\"domains\":[\"*.adnxs.com\",\"*.ctasnet.com\",\"*.adrdgt.com\"],\"examples\":[\"acdn.adnxs.com\",\"secure.adnxs.com\",\"ib.adnxs.com\",\"sharethrough.adnxs.com\",\"cdn.adnxs.com\",\"vcdn.adnxs.com\"],\"totalExecutionTime\":3708349,\"totalOccurrences\":127992},{\"name\":\"Histats\",\"homepage\":\"https://www.histats.com/\",\"category\":\"analytics\",\"domains\":[\"*.histats.com\"],\"examples\":[\"s10.histats.com\"],\"totalExecutionTime\":3373,\"totalOccurrences\":59},{\"name\":\"DoubleVerify\",\"homepage\":\"https://www.doubleverify.com/\",\"category\":\"ad\",\"domains\":[\"*.doubleverify.com\",\"*.dvtps.com\",\"*.iqfp1.com\"],\"examples\":[\"cdn.doubleverify.com\",\"cdn3.doubleverify.com\",\"tps.doubleverify.com\",\"tps712.doubleverify.com\",\"tps714.doubleverify.com\",\"tps706.doubleverify.com\",\"tps700.doubleverify.com\",\"tps707.doubleverify.com\",\"rtb2.doubleverify.com\",\"rtb0.doubleverify.com\",\"rtbcdn.doubleverify.com\",\"tps11020.doubleverify.com\",\"tm.iqfp1.com\"],\"totalExecutionTime\":36462962,\"totalOccurrences\":17023},{\"name\":\"Mediavine\",\"homepage\":\"https://www.mediavine.com/\",\"category\":\"ad\",\"domains\":[\"*.mediavine.com\"],\"examples\":[\"scripts.mediavine.com\",\"video.mediavine.com\"],\"totalExecutionTime\":49605322,\"totalOccurrences\":9449},{\"name\":\"Wix\",\"homepage\":\"https://www.wix.com/\",\"category\":\"hosting\",\"domains\":[\"*.parastorage.com\",\"*.wix.com\",\"*.wixstatic.com\",\"*.wixapps.net\"],\"examples\":[\"static.parastorage.com\",\"static.wixstatic.com\",\"www.wix.com\",\"instagram.codev.wixapps.net\"],\"totalExecutionTime\":1955055690,\"totalOccurrences\":441917},{\"name\":\"Webflow\",\"homepage\":\"https://webflow.com/\",\"category\":\"hosting\",\"domains\":[\"*.uploads-ssl.webflow.com\",\"*.assets-global.website-files.com\",\"*.assets.website-files.com\"],\"examples\":[\"uploads-ssl.webflow.com\",\"assets-global.website-files.com\",\"assets.website-files.com\"]},{\"name\":\"Weebly\",\"homepage\":\"https://www.weebly.com/\",\"category\":\"hosting\",\"domains\":[\"*.editmysite.com\"],\"totalExecutionTime\":376798579,\"totalOccurrences\":61497},{\"name\":\"LinkedIn\",\"homepage\":\"https://www.linkedin.com/\",\"category\":\"social\",\"domains\":[\"*.bizographics.com\",\"platform.linkedin.com\",\"*.slideshare.com\",\"*.slidesharecdn.com\",\"*.oribi.io\"],\"totalExecutionTime\":3872299,\"totalOccurrences\":12524},{\"name\":\"LinkedIn Ads\",\"category\":\"ad\",\"domains\":[\"*.licdn.com\",\"*.ads.linkedin.com\",\"ads.linkedin.com\",\"www.linkedin.com\"],\"examples\":[\"snap.licdn.com\"],\"totalExecutionTime\":29854646,\"totalOccurrences\":194634},{\"name\":\"Vox Media\",\"homepage\":\"https://www.voxmedia.com/\",\"category\":\"content\",\"domains\":[\"*.vox-cdn.com\",\"*.voxmedia.com\"],\"examples\":[\"cdn.vox-cdn.com\"],\"totalExecutionTime\":705789,\"totalOccurrences\":308},{\"name\":\"Hotmart\",\"homepage\":\"https://www.hotmart.com/\",\"category\":\"content\",\"domains\":[\"*.hotmart.com\"],\"examples\":[\"launchermodule.hotmart.com\"],\"totalExecutionTime\":6543965,\"totalOccurrences\":2722},{\"name\":\"SoundCloud\",\"homepage\":\"https://www.soundcloud.com/\",\"category\":\"content\",\"domains\":[\"*.sndcdn.com\",\"*.soundcloud.com\",\"*.stratus.sc\"],\"examples\":[\"widget.sndcdn.com\"],\"totalExecutionTime\":9991221,\"totalOccurrences\":4305},{\"name\":\"Spotify\",\"homepage\":\"https://www.spotify.com/\",\"category\":\"content\",\"domains\":[\"*.scdn.co\",\"*.spotify.com\"],\"examples\":[\"open.spotify.com\",\"open.scdn.co\",\"i.scdn.co\"],\"totalExecutionTime\":108082,\"totalOccurrences\":9797},{\"name\":\"AMP\",\"homepage\":\"https://amp.dev/\",\"category\":\"content\",\"domains\":[\"*.ampproject.org\"],\"examples\":[\"cdn.ampproject.org\"],\"totalExecutionTime\":53961695,\"totalOccurrences\":55263},{\"name\":\"Beeketing\",\"homepage\":\"https://beeketing.com/\",\"category\":\"marketing\",\"domains\":[\"*.beeketing.com\"],\"examples\":[\"sdk-cdn.beeketing.com\",\"sdk.beeketing.com\"],\"totalExecutionTime\":1467136,\"totalOccurrences\":1456},{\"name\":\"Albacross\",\"homepage\":\"https://albacross.com/\",\"category\":\"marketing\",\"domains\":[\"*.albacross.com\"],\"examples\":[\"serve.albacross.com\"],\"totalExecutionTime\":85071,\"totalOccurrences\":1298},{\"name\":\"TrafficJunky\",\"homepage\":\"https://www.trafficjunky.com/\",\"category\":\"ad\",\"domains\":[\"*.contentabc.com\",\"*.trafficjunky.net\"],\"examples\":[\"ads2.contentabc.com\",\"hw-cdn.contentabc.com\",\"media.trafficjunky.net\",\"ads.trafficjunky.net\",\"hw-cdn.trafficjunky.net\"],\"totalExecutionTime\":1711,\"totalOccurrences\":50},{\"name\":\"Bootstrap CDN\",\"homepage\":\"https://www.bootstrapcdn.com/\",\"category\":\"cdn\",\"domains\":[\"*.bootstrapcdn.com\"],\"examples\":[\"maxcdn.bootstrapcdn.com\",\"stackpath.bootstrapcdn.com\"],\"totalExecutionTime\":1532302,\"totalOccurrences\":29759},{\"name\":\"Shareaholic\",\"homepage\":\"https://www.shareaholic.com/\",\"category\":\"social\",\"domains\":[\"*.shareaholic.com\",\"dsms0mj1bbhn4.cloudfront.net\"],\"totalExecutionTime\":83488,\"totalOccurrences\":1049},{\"name\":\"Snowplow\",\"homepage\":\"https://snowplowanalytics.com/\",\"category\":\"analytics\",\"domains\":[\"d32hwlnfiv2gyn.cloudfront.net\"],\"totalExecutionTime\":6379198,\"totalOccurrences\":59133},{\"name\":\"RD Station\",\"homepage\":\"https://www.rdstation.com/en/\",\"category\":\"marketing\",\"domains\":[\"d335luupugsy2.cloudfront.net\"],\"totalExecutionTime\":6631799,\"totalOccurrences\":20660},{\"name\":\"Jivochat\",\"homepage\":\"https://www.jivochat.com/\",\"category\":\"customer-success\",\"domains\":[\"*.jivosite.com\"],\"examples\":[\"cdn-ca.jivosite.com\",\"code.jivosite.com\"],\"totalExecutionTime\":28974965,\"totalOccurrences\":48455},{\"name\":\"Listrak\",\"homepage\":\"https://www.listrak.com/\",\"category\":\"marketing\",\"domains\":[\"*.listrak.com\",\"*.listrakbi.com\"],\"examples\":[\"cdn.listrakbi.com\",\"s1.listrakbi.com\"],\"totalExecutionTime\":376553,\"totalOccurrences\":959},{\"name\":\"Ontame\",\"homepage\":\"https://www.ontame.io\",\"category\":\"analytics\",\"domains\":[\"*.ontame.io\"],\"examples\":[\"cdn.ontame.io\",\"collector.ontame.io\"],\"totalExecutionTime\":18102,\"totalOccurrences\":126},{\"name\":\"Ipify\",\"homepage\":\"https://www.ipify.org\",\"category\":\"utility\",\"domains\":[\"*.ipify.org\"],\"examples\":[\"api.ipify.org\",\"geo.ipify.org\"],\"totalExecutionTime\":394085,\"totalOccurrences\":2542},{\"name\":\"Ensighten\",\"homepage\":\"https://www.ensighten.com/\",\"category\":\"tag-manager\",\"domains\":[\"*.ensighten.com\"],\"examples\":[\"nexus.ensighten.com\"],\"totalExecutionTime\":1477587,\"totalOccurrences\":3029},{\"name\":\"EpiServer\",\"homepage\":\"https://www.episerver.com\",\"category\":\"content\",\"domains\":[\"*.episerver.net\"],\"examples\":[\"dl.episerver.net\"],\"totalExecutionTime\":7936,\"totalOccurrences\":74},{\"name\":\"mPulse\",\"homepage\":\"https://developer.akamai.com/akamai-mpulse\",\"category\":\"analytics\",\"domains\":[\"*.akstat.io\",\"*.go-mpulse.net\",\"*.mpulse.net\",\"*.mpstat.us\"],\"examples\":[\"c.go-mpulse.net\",\"0211c83c.akstat.io\"],\"totalExecutionTime\":3098058,\"totalOccurrences\":34200},{\"name\":\"Pingdom RUM\",\"homepage\":\"https://www.pingdom.com/product/performance-monitoring/\",\"category\":\"analytics\",\"domains\":[\"*.pingdom.net\"],\"examples\":[\"rum-static.pingdom.net\",\"rum-collector-2.pingdom.net\"],\"totalExecutionTime\":47582,\"totalOccurrences\":683},{\"name\":\"SpeedCurve RUM\",\"company\":\"SpeedCurve\",\"homepage\":\"https://www.speedcurve.com/features/performance-monitoring/\",\"category\":\"analytics\",\"domains\":[\"*.speedcurve.com\"],\"examples\":[\"cdn.speedcurve.com\",\"lux.speedcurve.com\"],\"totalExecutionTime\":282224,\"totalOccurrences\":4850},{\"name\":\"Radar\",\"company\":\"Cedexis\",\"homepage\":\"https://www.cedexis.com/radar/\",\"category\":\"analytics\",\"domains\":[\"*.cedexis-test.com\",\"*.cedexis.com\",\"*.cmdolb.com\",\"cedexis.leasewebcdn.com\",\"*.cedexis-radar.net\",\"*.cedexis.net\",\"cedexis-test01.insnw.net\",\"cedexisakamaitest.azureedge.net\",\"cedexispub.cdnetworks.net\",\"cs600.wac.alphacdn.net\",\"cs600.wpc.edgecastdns.net\",\"global2.cmdolb.com\",\"img-cedexis.mncdn.com\",\"a-cedexis.msedge.net\",\"zn3vgszfh.fastestcdn.net\"],\"examples\":[\"radar.cedexis.com\",\"rpt.cedexis.com\",\"2-01-49cd-0002.cdx.cedexis.net\",\"bench.cedexis-test.com\"],\"totalExecutionTime\":143006,\"totalOccurrences\":1012},{\"name\":\"Byside\",\"homepage\":\"https://byside.com\",\"category\":\"analytics\",\"domains\":[\"*.byside.com\"],\"examples\":[\"byce2.byside.com\",\"wce2.byside.com\"],\"totalExecutionTime\":31339,\"totalOccurrences\":75},{\"name\":\"VWO\",\"homepage\":\"https://vwo.com\",\"category\":\"analytics\",\"domains\":[\"*.vwo.com\",\"*.visualwebsiteoptimizer.com\",\"d5phz18u4wuww.cloudfront.net\",\"*.wingify.com\"],\"examples\":[\"dev.visualwebsiteoptimizer.com\"],\"totalExecutionTime\":4483732,\"totalOccurrences\":6984},{\"name\":\"Bing Ads\",\"homepage\":\"https://bingads.microsoft.com\",\"category\":\"ad\",\"domains\":[\"*.bing.com\",\"*.microsoft.com\",\"*.msn.com\",\"*.s-msft.com\",\"*.s-msn.com\",\"*.msads.net\",\"*.msecnd.net\"],\"examples\":[\"bat.bing.com\",\"c.bing.com\",\"bat.r.msn.com\",\"ajax.microsoft.com\"],\"totalExecutionTime\":24241651,\"totalOccurrences\":240142},{\"name\":\"GoSquared\",\"homepage\":\"https://www.gosquared.com\",\"category\":\"analytics\",\"domains\":[\"*.gosquared.com\",\"d1l6p2sc9645hc.cloudfront.net\"],\"examples\":[\"data.gosquared.com\",\"data2.gosquared.com\"],\"totalExecutionTime\":30162,\"totalOccurrences\":419},{\"name\":\"Usabilla\",\"homepage\":\"https://usabilla.com\",\"category\":\"analytics\",\"domains\":[\"*.usabilla.com\",\"d6tizftlrpuof.cloudfront.net\"],\"examples\":[\"w.usabilla.com\"],\"totalExecutionTime\":112001,\"totalOccurrences\":828},{\"name\":\"Fastly Insights\",\"homepage\":\"https://insights.fastlylabs.com\",\"category\":\"analytics\",\"domains\":[\"*.fastly-insights.com\"],\"examples\":[\"www.fastly-insights.com\"],\"totalExecutionTime\":707806,\"totalOccurrences\":6738},{\"name\":\"Visual IQ\",\"homepage\":\"https://www.visualiq.com\",\"category\":\"analytics\",\"domains\":[\"*.myvisualiq.net\"],\"examples\":[\"t.myvisualiq.net\"]},{\"name\":\"Snapchat\",\"homepage\":\"https://www.snapchat.com\",\"category\":\"analytics\",\"domains\":[\"*.snapchat.com\",\"*.sc-static.net\"],\"examples\":[\"tr.snapchat.com\"],\"totalExecutionTime\":114336,\"totalOccurrences\":1234},{\"name\":\"Atlas Solutions\",\"homepage\":\"https://atlassolutions.com\",\"category\":\"analytics\",\"domains\":[\"*.atdmt.com\"],\"examples\":[\"ad.atdmt.com\",\"cx.atdmt.com\"]},{\"name\":\"Quantcast\",\"homepage\":\"https://www.quantcast.com\",\"category\":\"analytics\",\"domains\":[\"*.brtstats.com\",\"*.quantcount.com\",\"*.quantserve.com\",\"*.semantictec.com\",\"*.ntv.io\"],\"examples\":[\"pixel.quantserve.com\",\"secure.quantserve.com\",\"cms.quantserve.com\",\"rules.quantcount.com\"],\"totalExecutionTime\":11078258,\"totalOccurrences\":44552},{\"name\":\"Spiceworks\",\"homepage\":\"https://www.spiceworks.com\",\"category\":\"analytics\",\"domains\":[\"*.spiceworks.com\"],\"examples\":[\"px.spiceworks.com\"]},{\"name\":\"Marketo\",\"homepage\":\"https://www.marketo.com\",\"category\":\"analytics\",\"domains\":[\"*.marketo.com\",\"*.mktoresp.com\",\"*.marketo.net\"],\"examples\":[\"munchkin.marketo.net\"],\"totalExecutionTime\":591309,\"totalOccurrences\":1541},{\"name\":\"Intercom\",\"homepage\":\"https://www.intercom.com\",\"category\":\"customer-success\",\"domains\":[\"*.intercomcdn.com\",\"*.intercom.io\"],\"examples\":[\"js.intercomcdn.com\",\"api-iam.intercom.io\",\"widget.intercom.io\",\"nexus-websocket-a.intercom.io\"],\"products\":[{\"name\":\"Intercom Widget\",\"urlPatterns\":[\"widget.intercom.io\",\"js.intercomcdn.com/shim.latest.js\"],\"facades\":[{\"name\":\"React Live Chat Loader\",\"repo\":\"https://github.com/calibreapp/react-live-chat-loader\"},{\"name\":\"Intercom Facade\",\"repo\":\"https://github.com/danielbachhuber/intercom-facade/\"}]}],\"totalExecutionTime\":44150718,\"totalOccurrences\":35458},{\"name\":\"Unpkg\",\"homepage\":\"https://unpkg.com\",\"category\":\"cdn\",\"domains\":[\"*.unpkg.com\",\"*.npmcdn.com\"],\"totalExecutionTime\":147537,\"totalOccurrences\":515},{\"name\":\"ESM>CDN\",\"homepage\":\"https://esm.sh\",\"category\":\"cdn\",\"domains\":[\"esm.sh\"],\"totalExecutionTime\":163141,\"totalOccurrences\":520},{\"name\":\"JSPM\",\"homepage\":\"https://jspm.org/\",\"category\":\"cdn\",\"domains\":[\"ga.jspm.io\"],\"totalExecutionTime\":453264,\"totalOccurrences\":1152},{\"name\":\"ReadSpeaker\",\"homepage\":\"https://www.readspeaker.com\",\"category\":\"other\",\"domains\":[\"*.readspeaker.com\"],\"examples\":[\"sf1-eu.readspeaker.com\"],\"totalExecutionTime\":577692,\"totalOccurrences\":6388},{\"name\":\"Browsealoud\",\"homepage\":\"https://www.texthelp.com/en-gb/products/browsealoud/\",\"category\":\"other\",\"domains\":[\"*.browsealoud.com\",\"*.texthelp.com\"],\"examples\":[\"www.browsealoud.com\"],\"totalExecutionTime\":465128,\"totalOccurrences\":1700},{\"name\":\"15gifts\",\"category\":\"customer-success\",\"domains\":[\"*.15gifts.com\",\"*.primefuse.com\"],\"examples\":[\"www.primefuse.com\"]},{\"name\":\"1xRUN\",\"category\":\"utility\",\"domains\":[\"*.1xrun.com\"]},{\"name\":\"2AdPro Media Solutions\",\"category\":\"ad\",\"domains\":[\"*.2adpro.com\"]},{\"name\":\"301 Digital Media\",\"category\":\"content\",\"domains\":[\"*.301ads.com\",\"*.301network.com\"]},{\"name\":\"360 picnic platform\",\"company\":\"MediaV\",\"category\":\"ad\",\"domains\":[\"*.mediav.com\"],\"totalExecutionTime\":3677,\"totalOccurrences\":45},{\"name\":\"365 Media Group\",\"category\":\"content\",\"domains\":[\"*.365dm.com\"]},{\"name\":\"365 Tech Services\",\"category\":\"hosting\",\"domains\":[\"*.365webservices.co.uk\"]},{\"name\":\"3D Issue\",\"category\":\"utility\",\"domains\":[\"*.3dissue.com\",\"*.pressjack.com\"]},{\"name\":\"47Line Technologies\",\"category\":\"other\",\"domains\":[\"*.pejs.net\"]},{\"name\":\"4finance\",\"category\":\"utility\",\"domains\":[\"*.4finance.com\"]},{\"name\":\"5miles\",\"category\":\"content\",\"domains\":[\"*.5milesapp.com\"]},{\"name\":\"77Tool\",\"company\":\"77Agency\",\"category\":\"analytics\",\"domains\":[\"*.77tracking.com\"]},{\"name\":\"9xb\",\"category\":\"ad\",\"domains\":[\"*.9xb.com\"]},{\"name\":\"@UK\",\"category\":\"hosting\",\"domains\":[\"*.uk-plc.net\"]},{\"name\":\"A Perfect Pocket\",\"category\":\"hosting\",\"domains\":[\"*.aperfectpocketdata.com\"]},{\"name\":\"A-FIS PTE\",\"category\":\"analytics\",\"domains\":[\"*.websta.me\"]},{\"name\":\"AB Tasty\",\"homepage\":\"https://www.abtasty.com/\",\"category\":\"analytics\",\"domains\":[\"*.abtasty.com\",\"d1447tq2m68ekg.cloudfront.net\"],\"examples\":[\"try.abtasty.com\"],\"totalExecutionTime\":1492410,\"totalOccurrences\":3098},{\"name\":\"ABA RESEARCH\",\"category\":\"analytics\",\"domains\":[\"*.abaresearch.uk\",\"qmodal.azurewebsites.net\"]},{\"name\":\"ADMIZED\",\"category\":\"ad\",\"domains\":[\"*.admized.com\"]},{\"name\":\"ADNOLOGIES\",\"category\":\"ad\",\"domains\":[\"*.heias.com\"]},{\"name\":\"ADventori\",\"category\":\"ad\",\"domains\":[\"*.adventori.com\"],\"totalExecutionTime\":3758,\"totalOccurrences\":14},{\"name\":\"AI Media Group\",\"category\":\"ad\",\"domains\":[\"*.aimediagroup.com\"]},{\"name\":\"AIR.TV\",\"category\":\"ad\",\"domains\":[\"*.air.tv\"]},{\"name\":\"AKQA\",\"category\":\"ad\",\"domains\":[\"*.srtk.net\"]},{\"name\":\"AOL ad\",\"company\":\"AOL\",\"category\":\"ad\",\"domains\":[\"*.atwola.com\"]},{\"name\":\"AOL On\",\"company\":\"AOL\",\"category\":\"content\",\"domains\":[\"*.5min.com\"]},{\"name\":\"AOL Sponsored Listiings\",\"company\":\"AOL\",\"category\":\"ad\",\"domains\":[\"*.adsonar.com\"]},{\"name\":\"APSIS Lead\",\"company\":\"APSIS International AB\",\"category\":\"ad\",\"domains\":[\"*.prospecteye.com\"]},{\"name\":\"APSIS Profile Cloud\",\"company\":\"APSIS\",\"category\":\"analytics\",\"domains\":[\"*.innomdc.com\"]},{\"name\":\"APSIS Forms\",\"company\":\"APSIS\",\"category\":\"other\",\"domains\":[\"*.apsisforms.com\"],\"examples\":[\"forms.apsisforms.com\"]},{\"name\":\"ARENA\",\"company\":\"Altitude\",\"category\":\"ad\",\"domains\":[\"*.altitude-arena.com\"]},{\"name\":\"ARM\",\"category\":\"analytics\",\"domains\":[\"*.tag4arm.com\"],\"totalExecutionTime\":5734,\"totalOccurrences\":86},{\"name\":\"ASAPP\",\"category\":\"other\",\"domains\":[\"*.asapp.com\"],\"totalExecutionTime\":42651,\"totalOccurrences\":36},{\"name\":\"ASP\",\"category\":\"hosting\",\"domains\":[\"*.goshowoff.com\"]},{\"name\":\"AT Internet\",\"category\":\"analytics\",\"domains\":[\"*.ati-host.net\"]},{\"name\":\"ATTRAQT\",\"category\":\"utility\",\"domains\":[\"*.attraqt.com\",\"*.locayta.com\"]},{\"name\":\"AVANSER\",\"category\":\"analytics\",\"domains\":[\"*.avanser.com.au\"]},{\"name\":\"AVG\",\"company\":\"AVG Technologies\",\"category\":\"utility\",\"domains\":[\"*.avg.com\"],\"examples\":[\"omni.avg.com\"]},{\"name\":\"AWeber\",\"category\":\"ad\",\"domains\":[\"*.aweber.com\"],\"totalExecutionTime\":34264,\"totalOccurrences\":235},{\"name\":\"AXS\",\"category\":\"content\",\"domains\":[\"*.axs.com\"],\"totalExecutionTime\":40454,\"totalOccurrences\":13},{\"name\":\"Accentuate\",\"company\":\"Accentuate Digital\",\"category\":\"utility\",\"homepage\":\"https://www.accentuate.io/\",\"domains\":[\"*.accentuate.io\"],\"examples\":[\"cdn.accentuate.io\",\"original.accentuate.io\"],\"totalExecutionTime\":1052,\"totalOccurrences\":1},{\"name\":\"Accenture\",\"category\":\"analytics\",\"domains\":[\"*.tmvtp.com\"]},{\"name\":\"Accord Holdings\",\"category\":\"ad\",\"domains\":[\"*.agcdn.com\"]},{\"name\":\"Accordant Media\",\"category\":\"ad\",\"domains\":[\"*.a3cloud.net\"],\"examples\":[\"segment.a3cloud.net\"]},{\"name\":\"Account Kit\",\"category\":\"other\",\"domains\":[\"*.accountkit.com\"]},{\"name\":\"Accuen Media (Omnicom Media Group)\",\"category\":\"content\",\"domains\":[\"*.p-td.com\"]},{\"name\":\"Accuweather\",\"category\":\"content\",\"domains\":[\"*.accuweather.com\"],\"totalExecutionTime\":230757,\"totalOccurrences\":1280},{\"name\":\"Acquisio\",\"category\":\"ad\",\"domains\":[\"*.acq.io\"],\"totalExecutionTime\":1705,\"totalOccurrences\":22},{\"name\":\"Act-On Software\",\"category\":\"marketing\",\"domains\":[\"*.actonsoftware.com\"],\"totalExecutionTime\":254,\"totalOccurrences\":5},{\"name\":\"ActBlue\",\"category\":\"other\",\"domains\":[\"*.actblue.com\"],\"totalExecutionTime\":36709,\"totalOccurrences\":50},{\"name\":\"Active Agent\",\"category\":\"ad\",\"domains\":[\"*.active-agent.com\"]},{\"name\":\"ActiveCampaign\",\"category\":\"ad\",\"domains\":[\"*.trackcmp.net\",\"app-us1.com\",\"*.app-us1.com\"],\"examples\":[\"trackcmp.net\",\"prism.app-us1.com\",\"diffuser-cdn.app-us1.com\"],\"totalExecutionTime\":1074630,\"totalOccurrences\":14778},{\"name\":\"AcuityAds\",\"category\":\"ad\",\"domains\":[\"*.acuityplatform.com\"],\"totalExecutionTime\":4607,\"totalOccurrences\":28},{\"name\":\"Acxiom\",\"category\":\"ad\",\"domains\":[\"*.acxiom-online.com\",\"*.acxiomapac.com\",\"*.delivery.net\"]},{\"name\":\"Ad4Screen\",\"category\":\"ad\",\"domains\":[\"*.a4.tl\"]},{\"name\":\"Ad6Media\",\"category\":\"ad\",\"domains\":[\"*.ad6media.fr\"],\"totalExecutionTime\":34601,\"totalOccurrences\":324},{\"name\":\"AdCurve\",\"category\":\"ad\",\"domains\":[\"*.shop2market.com\"]},{\"name\":\"AdEasy\",\"category\":\"ad\",\"domains\":[\"*.adeasy.ru\"]},{\"name\":\"AdExtent\",\"category\":\"ad\",\"domains\":[\"*.adextent.com\"]},{\"name\":\"AdForge Edge\",\"company\":\"AdForge\",\"category\":\"ad\",\"domains\":[\"*.adforgeinc.com\"]},{\"name\":\"AdGear\",\"company\":\"Samsung Electronics\",\"category\":\"ad\",\"domains\":[\"*.adgear.com\",\"*.adgrx.com\"],\"totalExecutionTime\":5327,\"totalOccurrences\":9372},{\"name\":\"AdInMedia\",\"category\":\"ad\",\"domains\":[\"*.fastapi.net\"]},{\"name\":\"AdJug\",\"category\":\"ad\",\"domains\":[\"*.adjug.com\"],\"examples\":[\"tracking.adjug.com\",\"uk.view.adjug.com\"]},{\"name\":\"AdMatic\",\"category\":\"ad\",\"domains\":[\"*.admatic.com.tr\"],\"totalExecutionTime\":1900028,\"totalOccurrences\":1004},{\"name\":\"AdMedia\",\"category\":\"ad\",\"domains\":[\"*.admedia.com\"],\"examples\":[\"pixel.admedia.com\"]},{\"name\":\"AdRecover\",\"category\":\"ad\",\"domains\":[\"*.adrecover.com\"],\"totalExecutionTime\":8190,\"totalOccurrences\":148},{\"name\":\"AdRiver\",\"category\":\"ad\",\"domains\":[\"*.adriver.ru\"],\"totalExecutionTime\":934463,\"totalOccurrences\":4004},{\"name\":\"AdSniper\",\"category\":\"ad\",\"domains\":[\"*.adsniper.ru\",\"*.sniperlog.ru\"]},{\"name\":\"AdSpeed\",\"category\":\"ad\",\"domains\":[\"*.adspeed.net\"],\"totalExecutionTime\":3427,\"totalOccurrences\":15},{\"name\":\"AdSpruce\",\"category\":\"ad\",\"domains\":[\"*.adspruce.com\"]},{\"name\":\"AdSupply\",\"category\":\"ad\",\"domains\":[\"*.doublepimp.com\"]},{\"name\":\"AdTheorent\",\"category\":\"ad\",\"domains\":[\"*.adentifi.com\"],\"totalExecutionTime\":65,\"totalOccurrences\":6},{\"name\":\"AdThink AudienceInsights\",\"company\":\"AdThink Media\",\"category\":\"analytics\",\"domains\":[\"*.audienceinsights.net\"]},{\"name\":\"AdTrue\",\"company\":\"FPT AdTrue\",\"category\":\"ad\",\"domains\":[\"*.adtrue.com\"],\"totalExecutionTime\":27291,\"totalOccurrences\":49},{\"name\":\"AdYapper\",\"category\":\"ad\",\"domains\":[\"*.adyapper.com\"]},{\"name\":\"Adacado\",\"category\":\"ad\",\"domains\":[\"*.adacado.com\"],\"totalExecutionTime\":2913,\"totalOccurrences\":35},{\"name\":\"Adap.tv\",\"category\":\"ad\",\"domains\":[\"*.adap.tv\"]},{\"name\":\"Adapt Services\",\"category\":\"hosting\",\"domains\":[\"*.adcmps.com\"]},{\"name\":\"Adaptive Web\",\"category\":\"hosting\",\"domains\":[\"*.adaptive.co.uk\"]},{\"name\":\"Adara Media\",\"category\":\"ad\",\"domains\":[\"*.yieldoptimizer.com\"],\"totalExecutionTime\":192,\"totalOccurrences\":5},{\"name\":\"Adblade\",\"category\":\"ad\",\"domains\":[\"*.adblade.com\"]},{\"name\":\"Adbrain\",\"category\":\"ad\",\"domains\":[\"*.adbrn.com\"]},{\"name\":\"AddEvent\",\"category\":\"utility\",\"domains\":[\"*.addevent.com\"],\"examples\":[\"www.addevent.com\"],\"totalExecutionTime\":70925,\"totalOccurrences\":190},{\"name\":\"AddShoppers\",\"category\":\"social\",\"domains\":[\"*.addshoppers.com\",\"d3rr3d0n31t48m.cloudfront.net\",\"*.shop.pe\"],\"totalExecutionTime\":29845,\"totalOccurrences\":453},{\"name\":\"AddThisEvent\",\"category\":\"hosting\",\"domains\":[\"*.addthisevent.com\"]},{\"name\":\"Addoox MetaNetwork\",\"company\":\"Addoox\",\"category\":\"ad\",\"domains\":[\"*.metanetwork.net\"]},{\"name\":\"Addvantage Media\",\"category\":\"ad\",\"domains\":[\"*.addvantagemedia.com\",\"*.simplytechnology.net\"]},{\"name\":\"AD EBis\",\"category\":\"analytics\",\"homepage\":\"https://www.ebis.ne.jp/\",\"domains\":[\"*.ebis.ne.jp\"],\"examples\":[\"taj1.ebis.ne.jp\"],\"totalExecutionTime\":55811,\"totalOccurrences\":563},{\"name\":\"Adecs\",\"category\":\"customer-success\",\"domains\":[\"*.adecs.co.uk\"],\"examples\":[\"www.adecs.co.uk\"]},{\"name\":\"Adelphic\",\"category\":\"ad\",\"domains\":[\"*.ipredictive.com\"],\"totalExecutionTime\":9792,\"totalOccurrences\":84},{\"name\":\"Adestra\",\"category\":\"ad\",\"domains\":[\"*.adestra.com\",\"*.msgfocus.com\"]},{\"name\":\"Adform\",\"category\":\"ad\",\"domains\":[\"*.adform.net\",\"*.adformdsp.net\"],\"totalExecutionTime\":1470857,\"totalOccurrences\":88789},{\"name\":\"Adkontekst\",\"category\":\"ad\",\"domains\":[\"*.adkontekst.pl\"]},{\"name\":\"Adlead\",\"category\":\"ad\",\"domains\":[\"*.webelapp.com\"]},{\"name\":\"Adledge\",\"category\":\"utility\",\"domains\":[\"*.adledge.com\"]},{\"name\":\"Adloox\",\"category\":\"ad\",\"domains\":[\"*.adlooxtracking.com\"],\"totalExecutionTime\":648498,\"totalOccurrences\":285},{\"name\":\"Adlux\",\"category\":\"ad\",\"domains\":[\"*.adlux.com\"]},{\"name\":\"Admedo\",\"category\":\"ad\",\"domains\":[\"*.a8723.com\",\"*.adizio.com\",\"*.admedo.com\"],\"examples\":[\"pool.a8723.com\"],\"totalExecutionTime\":5340,\"totalOccurrences\":75},{\"name\":\"Admeta\",\"company\":\"Wideorbit\",\"category\":\"ad\",\"domains\":[\"*.atemda.com\"]},{\"name\":\"Admetrics\",\"company\":\"Next Tuesday\",\"category\":\"analytics\",\"domains\":[\"*.nt.vc\"],\"examples\":[\"metrics.nt.vc\"]},{\"name\":\"Admiral\",\"category\":\"ad\",\"domains\":[\"*.unknowntray.com\"]},{\"name\":\"Admitad\",\"category\":\"ad\",\"domains\":[\"*.lenmit.com\"],\"totalExecutionTime\":1106,\"totalOccurrences\":14},{\"name\":\"Admixer for Publishers\",\"company\":\"Admixer\",\"category\":\"ad\",\"domains\":[\"*.admixer.net\"],\"totalExecutionTime\":1365737,\"totalOccurrences\":755},{\"name\":\"Adnium\",\"category\":\"ad\",\"domains\":[\"*.adnium.com\"]},{\"name\":\"Adnostic\",\"company\":\"Dennis Publishing\",\"category\":\"ad\",\"domains\":[\"*.adnostic.co.uk\"]},{\"name\":\"Adobe Marketing Cloud\",\"company\":\"Adobe Systems\",\"category\":\"ad\",\"domains\":[\"*.adobetag.com\"]},{\"name\":\"Adobe Scene7\",\"company\":\"Adobe Systems\",\"category\":\"content\",\"domains\":[\"wwwimages.adobe.com\",\"*.scene7.com\",\"*.everestads.net\",\"*.everestjs.net\"],\"totalExecutionTime\":715189,\"totalOccurrences\":649},{\"name\":\"Adobe Systems\",\"category\":\"content\",\"domains\":[\"adobe.com\",\"www.adobe.com\"],\"totalExecutionTime\":35222,\"totalOccurrences\":194},{\"name\":\"Adobe Business Catalyst\",\"homepage\":\"https://www.businesscatalyst.com/\",\"category\":\"hosting\",\"domains\":[\"*.businesscatalyst.com\"]},{\"name\":\"Adocean\",\"company\":\"Gemius\",\"category\":\"ad\",\"domains\":[\"*.adocean.pl\"],\"totalExecutionTime\":864700,\"totalOccurrences\":1977},{\"name\":\"Adometry\",\"company\":\"Google\",\"category\":\"ad\",\"domains\":[\"*.dmtry.com\"]},{\"name\":\"Adomik\",\"category\":\"analytics\",\"domains\":[\"*.adomik.com\"]},{\"name\":\"Adotmob\",\"category\":\"ad\",\"domains\":[\"*.adotmob.com\"]},{\"name\":\"Adrian Quevedo\",\"category\":\"hosting\",\"domains\":[\"*.adrianquevedo.com\"]},{\"name\":\"Adroit Digital Solutions\",\"category\":\"ad\",\"domains\":[\"*.imiclk.com\",\"*.abmr.net\"]},{\"name\":\"AdsNative\",\"category\":\"ad\",\"domains\":[\"*.adsnative.com\"]},{\"name\":\"AdsWizz\",\"category\":\"ad\",\"domains\":[\"*.adswizz.com\"],\"totalExecutionTime\":372966,\"totalOccurrences\":2073},{\"name\":\"Adscale\",\"category\":\"ad\",\"domains\":[\"*.adscale.de\"],\"totalExecutionTime\":271657,\"totalOccurrences\":5701},{\"name\":\"Adschoom\",\"company\":\"JSWeb Production\",\"category\":\"ad\",\"domains\":[\"*.adschoom.com\"]},{\"name\":\"Adscience\",\"category\":\"ad\",\"domains\":[\"*.adscience.nl\"]},{\"name\":\"Adsiduous\",\"category\":\"ad\",\"domains\":[\"*.adsiduous.com\"]},{\"name\":\"Adsty\",\"category\":\"ad\",\"domains\":[\"*.adx1.com\"],\"totalExecutionTime\":373,\"totalOccurrences\":4},{\"name\":\"Adtech (AOL)\",\"category\":\"ad\",\"domains\":[\"*.adtechus.com\"]},{\"name\":\"Adtegrity\",\"category\":\"ad\",\"domains\":[\"*.adtpix.com\"],\"totalExecutionTime\":1456,\"totalOccurrences\":19},{\"name\":\"Adthink\",\"company\":\"Adthink Media\",\"category\":\"ad\",\"domains\":[\"*.adxcore.com\",\"*.dcoengine.com\"],\"examples\":[\"d.adxcore.com\"]},{\"name\":\"AdultWebmasterEmpire.Com\",\"category\":\"ad\",\"domains\":[\"*.awempire.com\"],\"totalExecutionTime\":50270,\"totalOccurrences\":33},{\"name\":\"Adunity\",\"category\":\"ad\",\"domains\":[\"*.adunity.com\"]},{\"name\":\"Advance Magazine Group\",\"category\":\"content\",\"domains\":[\"*.condenastdigital.com\",\"*.condenet.com\",\"*.condenast.co.uk\"],\"totalExecutionTime\":5472,\"totalOccurrences\":8},{\"name\":\"Adverline Board\",\"company\":\"Adverline\",\"category\":\"ad\",\"domains\":[\"*.adverline.com\",\"*.adnext.fr\"]},{\"name\":\"AdvertServe\",\"category\":\"ad\",\"domains\":[\"*.advertserve.com\"],\"totalExecutionTime\":83845,\"totalOccurrences\":365},{\"name\":\"Advolution\",\"category\":\"utility\",\"domains\":[\"*.advolution.de\"]},{\"name\":\"Adwise\",\"category\":\"ad\",\"domains\":[\"*.adwise.bg\"],\"totalExecutionTime\":154,\"totalOccurrences\":2},{\"name\":\"Adyen\",\"category\":\"utility\",\"domains\":[\"*.adyen.com\"],\"totalExecutionTime\":6397909,\"totalOccurrences\":2436},{\"name\":\"Adyoulike\",\"category\":\"ad\",\"domains\":[\"*.adyoulike.com\",\"*.omnitagjs.com\",\"*.adyoulike.net\"],\"totalExecutionTime\":381321,\"totalOccurrences\":7413},{\"name\":\"Adzerk\",\"category\":\"ad\",\"domains\":[\"*.adzerk.net\"],\"totalExecutionTime\":24727,\"totalOccurrences\":81},{\"name\":\"Adzip\",\"company\":\"Adbox Digital\",\"category\":\"ad\",\"domains\":[\"*.adzip.co\"]},{\"name\":\"AerServ\",\"category\":\"ad\",\"domains\":[\"*.aerserv.com\"]},{\"name\":\"Affectv\",\"category\":\"ad\",\"domains\":[\"*.affectv.com\",\"*.affec.tv\"],\"totalExecutionTime\":385,\"totalOccurrences\":5},{\"name\":\"Affiliate Window\",\"company\":\"Digital Window\",\"category\":\"ad\",\"domains\":[\"*.dwin1.com\"],\"totalExecutionTime\":528389,\"totalOccurrences\":5989},{\"name\":\"Affiliatly\",\"category\":\"ad\",\"domains\":[\"*.affiliatly.com\"],\"examples\":[\"www.affiliatly.com\"],\"totalExecutionTime\":26281,\"totalOccurrences\":109},{\"name\":\"Affino\",\"category\":\"ad\",\"domains\":[\"affino.com\"]},{\"name\":\"Affirm\",\"category\":\"utility\",\"domains\":[\"*.affirm.com\"],\"totalExecutionTime\":4262860,\"totalOccurrences\":6727},{\"name\":\"Afterpay\",\"company\":\"Block\",\"category\":\"utility\",\"homepage\":\"https://www.afterpay.com/\",\"domains\":[\"*.afterpay.com\"],\"examples\":[\"static-us.afterpay.com\"],\"totalExecutionTime\":814109,\"totalOccurrences\":7138},{\"name\":\"Agenda Media\",\"category\":\"ad\",\"domains\":[\"*.agendamedia.co.uk\"]},{\"name\":\"Aggregate Knowledge\",\"company\":\"Neustar\",\"category\":\"ad\",\"domains\":[\"*.agkn.com\"],\"totalExecutionTime\":11729,\"totalOccurrences\":351},{\"name\":\"AgilOne\",\"category\":\"marketing\",\"domains\":[\"*.agilone.com\"],\"totalExecutionTime\":31155,\"totalOccurrences\":68},{\"name\":\"Agility\",\"category\":\"hosting\",\"domains\":[\"*.agilitycms.com\"],\"totalExecutionTime\":1180,\"totalOccurrences\":3},{\"name\":\"Ahalogy\",\"category\":\"social\",\"domains\":[\"*.ahalogy.com\"]},{\"name\":\"Aheadworks\",\"category\":\"utility\",\"domains\":[\"*.aheadworks.com\"]},{\"name\":\"AirPR\",\"category\":\"analytics\",\"domains\":[\"*.airpr.com\"]},{\"name\":\"Aira\",\"category\":\"ad\",\"domains\":[\"*.aira.net\"],\"examples\":[\"www.aira.net\"]},{\"name\":\"Airport Parking and Hotels\",\"category\":\"content\",\"domains\":[\"*.aph.com\"],\"totalExecutionTime\":160,\"totalOccurrences\":3},{\"name\":\"Akanoo\",\"category\":\"analytics\",\"domains\":[\"*.akanoo.com\"]},{\"name\":\"Alchemy\",\"company\":\"AndBeyond.Media\",\"category\":\"ad\",\"domains\":[\"*.andbeyond.media\"],\"totalExecutionTime\":362784,\"totalOccurrences\":151},{\"name\":\"AlephD\",\"company\":\"AOL\",\"category\":\"ad\",\"domains\":[\"*.alephd.com\"]},{\"name\":\"AliveChat\",\"company\":\"AYU Technology Solutions\",\"category\":\"customer-success\",\"domains\":[\"*.websitealive.com\",\"*.websitealive7.com\"]},{\"name\":\"All Access\",\"category\":\"other\",\"domains\":[\"*.allaccess.com.ph\"]},{\"name\":\"Alliance for Audited Media\",\"category\":\"ad\",\"domains\":[\"*.aamsitecertifier.com\"]},{\"name\":\"Allyde\",\"category\":\"marketing\",\"domains\":[\"*.mautic.com\"]},{\"name\":\"AlphaSSL\",\"category\":\"utility\",\"domains\":[\"*.alphassl.com\"],\"totalExecutionTime\":1264,\"totalOccurrences\":14},{\"name\":\"Altitude\",\"category\":\"ad\",\"domains\":[\"*.altitudeplatform.com\"]},{\"name\":\"Altocloud\",\"category\":\"analytics\",\"domains\":[\"*.altocloud.com\"]},{\"name\":\"Amadeus\",\"category\":\"content\",\"domains\":[\"*.e-travel.com\"]},{\"name\":\"Amazon CloudFront\",\"company\":\"Amazon\",\"category\":\"utility\",\"domains\":[\"cloudfront.net\"]},{\"name\":\"Ambassador\",\"category\":\"ad\",\"domains\":[\"*.getambassador.com\"],\"totalExecutionTime\":13932,\"totalOccurrences\":84},{\"name\":\"Ambient\",\"company\":\"Ericcson\",\"category\":\"other\",\"domains\":[\"*.adnetwork.vn\",\"*.ambientplatform.vn\"]},{\"name\":\"Amelia Communication\",\"category\":\"hosting\",\"domains\":[\"*.sara.media\"]},{\"name\":\"Amobee\",\"category\":\"marketing\",\"domains\":[\"*.amgdgt.com\",\"*.kontera.com\"]},{\"name\":\"Amplience\",\"category\":\"marketing\",\"domains\":[\"*.10cms.com\",\"*.amplience.com\",\"*.amplience.net\",\"*.bigcontent.io\",\"*.adis.ws\"],\"totalExecutionTime\":5154,\"totalOccurrences\":17},{\"name\":\"Amplitude Mobile Analytics\",\"company\":\"Amplitude\",\"category\":\"analytics\",\"domains\":[\"*.amplitude.com\",\"d24n15hnbwhuhn.cloudfront.net\"],\"totalExecutionTime\":10199887,\"totalOccurrences\":50356},{\"name\":\"Anametrix\",\"company\":\"Ensighten\",\"category\":\"analytics\",\"domains\":[\"*.anametrix.com\"]},{\"name\":\"Ancora Platform\",\"company\":\"Ancora Media Solutions\",\"category\":\"ad\",\"domains\":[\"*.ancoraplatform.com\"]},{\"name\":\"Anedot\",\"category\":\"other\",\"domains\":[\"*.anedot.com\"]},{\"name\":\"AnimateJS\",\"category\":\"utility\",\"domains\":[\"*.animatedjs.com\"]},{\"name\":\"AnswerDash\",\"category\":\"customer-success\",\"domains\":[\"*.answerdash.com\"],\"examples\":[\"p1.answerdash.com\"]},{\"name\":\"Answers\",\"category\":\"analytics\",\"domains\":[\"*.answcdn.com\",\"*.answers.com\",\"*.dsply.com\"]},{\"name\":\"Apester\",\"category\":\"analytics\",\"domains\":[\"*.apester.com\",\"*.qmerce.com\"],\"totalExecutionTime\":12486,\"totalOccurrences\":122},{\"name\":\"Apligraf SmartWeb\",\"company\":\"Apligraf\",\"category\":\"utility\",\"domains\":[\"*.apligraf.com.br\"]},{\"name\":\"Appier\",\"category\":\"ad\",\"domains\":[\"*.appier.net\"],\"totalExecutionTime\":106016,\"totalOccurrences\":816},{\"name\":\"Appsolute\",\"category\":\"utility\",\"homepage\":\"https://appsolute.us/\",\"domains\":[\"dropahint.love\"],\"examples\":[\"dropahint.love\"],\"totalExecutionTime\":8272,\"totalOccurrences\":84},{\"name\":\"Apptus eSales\",\"company\":\"Apptus\",\"category\":\"analytics\",\"domains\":[\"*.apptus.com\"]},{\"name\":\"Arbor\",\"company\":\"LiveRamp\",\"category\":\"other\",\"domains\":[\"*.pippio.com\"]},{\"name\":\"Ardent Creative\",\"category\":\"hosting\",\"domains\":[\"*.ardentcreative.co.uk\"]},{\"name\":\"Arnold Clark Automobiles\",\"category\":\"content\",\"domains\":[\"*.arnoldclark.com\"]},{\"name\":\"Atom Content Marketing\",\"category\":\"content\",\"domains\":[\"*.atomvault.net\"],\"examples\":[\"danu.atomvault.net\"]},{\"name\":\"Atom Data\",\"category\":\"other\",\"domains\":[\"*.atomdata.io\"]},{\"name\":\"Attribution\",\"category\":\"ad\",\"domains\":[\"*.attributionapp.com\"],\"totalExecutionTime\":54765,\"totalOccurrences\":107},{\"name\":\"Audience 360\",\"company\":\"Datapoint Media\",\"category\":\"ad\",\"domains\":[\"*.dpmsrv.com\"],\"totalExecutionTime\":667552,\"totalOccurrences\":393},{\"name\":\"Audience Science\",\"category\":\"ad\",\"domains\":[\"*.revsci.net\"]},{\"name\":\"AudienceSearch\",\"company\":\"Intimate Merger\",\"category\":\"ad\",\"domains\":[\"*.im-apps.net\"],\"totalExecutionTime\":8608313,\"totalOccurrences\":44827},{\"name\":\"Auditorius\",\"category\":\"ad\",\"domains\":[\"*.audtd.com\"]},{\"name\":\"Augur\",\"category\":\"analytics\",\"domains\":[\"*.augur.io\"]},{\"name\":\"Auto Link Maker\",\"company\":\"Apple\",\"category\":\"ad\",\"domains\":[\"*.apple.com\"],\"examples\":[\"autolinkmaker.itunes.apple.com\"],\"totalExecutionTime\":576462,\"totalOccurrences\":2101},{\"name\":\"Autopilot\",\"category\":\"ad\",\"domains\":[\"*.autopilothq.com\"],\"totalExecutionTime\":8333,\"totalOccurrences\":43},{\"name\":\"Avail\",\"company\":\"RichRelevance\",\"category\":\"ad\",\"domains\":[\"*.avail.net\"]},{\"name\":\"AvantLink\",\"category\":\"ad\",\"domains\":[\"*.avmws.com\"],\"totalExecutionTime\":1325,\"totalOccurrences\":8},{\"name\":\"Avco Systems\",\"category\":\"utility\",\"domains\":[\"*.avcosystems.com\"]},{\"name\":\"Avid Media\",\"category\":\"customer-success\",\"domains\":[\"*.adspdbl.com\",\"*.metadsp.co.uk\"]},{\"name\":\"Avocet Systems\",\"category\":\"ad\",\"domains\":[\"*.avocet.io\",\"ads.avct.cloud\"]},{\"name\":\"Avora\",\"category\":\"analytics\",\"domains\":[\"*.truedash.com\"],\"examples\":[\"truetag.truedash.com\"]},{\"name\":\"Azure Traffic Manager\",\"company\":\"Microsoft\",\"category\":\"other\",\"domains\":[\"*.gateway.net\",\"*.trafficmanager.net\"],\"examples\":[\"analytics.gateway.net\"],\"totalExecutionTime\":7917,\"totalOccurrences\":99},{\"name\":\"Azure Web Services\",\"company\":\"Microsoft\",\"category\":\"cdn\",\"domains\":[\"*.azurewebsites.net\",\"*.azureedge.net\",\"*.msedge.net\",\"*.windows.net\"],\"totalExecutionTime\":22763500,\"totalOccurrences\":32027},{\"name\":\"BAM\",\"category\":\"analytics\",\"domains\":[\"*.bam-x.com\"]},{\"name\":\"Baifendian Technology\",\"category\":\"marketing\",\"domains\":[\"*.baifendian.com\"]},{\"name\":\"Bankrate\",\"category\":\"utility\",\"domains\":[\"*.bankrate.com\"],\"totalExecutionTime\":11387,\"totalOccurrences\":8},{\"name\":\"BannerFlow\",\"company\":\"Nordic Factory Solutions\",\"category\":\"ad\",\"domains\":[\"*.bannerflow.com\"],\"totalExecutionTime\":38744,\"totalOccurrences\":20},{\"name\":\"Barclaycard SmartPay\",\"company\":\"Barclaycard\",\"category\":\"utility\",\"domains\":[\"*.barclaycardsmartpay.com\"]},{\"name\":\"Barilliance\",\"category\":\"analytics\",\"domains\":[\"*.barilliance.net\",\"dn3y71tq7jf07.cloudfront.net\"],\"totalExecutionTime\":3719,\"totalOccurrences\":17},{\"name\":\"Barnebys\",\"category\":\"other\",\"domains\":[\"*.barnebys.com\"],\"totalExecutionTime\":80806,\"totalOccurrences\":56},{\"name\":\"Basis\",\"company\":\"Basis Technologies\",\"category\":\"ad\",\"homepage\":\"https://basis.net/\",\"domains\":[\"*.basis.net\"],\"examples\":[\"cdn01.basis.net\"],\"totalExecutionTime\":243397,\"totalOccurrences\":3101},{\"name\":\"Batch Media\",\"category\":\"ad\",\"domains\":[\"*.t4ft.de\"]},{\"name\":\"Bauer Consumer Media\",\"category\":\"content\",\"domains\":[\"*.bauercdn.com\",\"*.greatmagazines.co.uk\"],\"examples\":[\"www.greatmagazines.co.uk\"]},{\"name\":\"Baynote\",\"category\":\"analytics\",\"domains\":[\"*.baynote.net\"]},{\"name\":\"Bazaarvoice\",\"category\":\"analytics\",\"domains\":[\"*.bazaarvoice.com\",\"*.feedmagnet.com\"],\"totalExecutionTime\":1608301,\"totalOccurrences\":3620},{\"name\":\"Beachfront Media\",\"category\":\"ad\",\"domains\":[\"*.bfmio.com\"],\"totalExecutionTime\":8644,\"totalOccurrences\":1151},{\"name\":\"BeamPulse\",\"category\":\"analytics\",\"domains\":[\"*.beampulse.com\"]},{\"name\":\"Beeswax\",\"category\":\"ad\",\"domains\":[\"*.bidr.io\"],\"totalExecutionTime\":114833,\"totalOccurrences\":6793},{\"name\":\"Beetailer\",\"category\":\"social\",\"domains\":[\"*.beetailer.com\"],\"examples\":[\"www.beetailer.com\"]},{\"name\":\"Best Of Media S.A.\",\"category\":\"content\",\"domains\":[\"*.servebom.com\"],\"totalExecutionTime\":73,\"totalOccurrences\":55},{\"name\":\"Bet365\",\"category\":\"ad\",\"domains\":[\"*.bet365affiliates.com\"]},{\"name\":\"Betfair\",\"category\":\"other\",\"domains\":[\"*.cdnbf.net\"]},{\"name\":\"Betgenius\",\"company\":\"Genius Sports\",\"category\":\"content\",\"domains\":[\"*.connextra.com\"],\"totalExecutionTime\":113379,\"totalOccurrences\":334},{\"name\":\"Better Banners\",\"category\":\"ad\",\"domains\":[\"*.betterbannerscloud.com\"]},{\"name\":\"Better Business Bureau\",\"category\":\"analytics\",\"domains\":[\"*.bbb.org\"],\"totalExecutionTime\":6130,\"totalOccurrences\":57},{\"name\":\"Between Digital\",\"category\":\"ad\",\"domains\":[\"*.betweendigital.com\"],\"totalExecutionTime\":150821,\"totalOccurrences\":2666},{\"name\":\"BidTheatre\",\"category\":\"ad\",\"domains\":[\"*.bidtheatre.com\"],\"totalExecutionTime\":18619,\"totalOccurrences\":235},{\"name\":\"Bidtellect\",\"category\":\"ad\",\"domains\":[\"*.bttrack.com\"],\"totalExecutionTime\":1219,\"totalOccurrences\":13},{\"name\":\"Bigcommerce\",\"category\":\"marketing\",\"domains\":[\"*.bigcommerce.com\"],\"totalExecutionTime\":39470295,\"totalOccurrences\":18688},{\"name\":\"BitGravity\",\"company\":\"Tata Communications\",\"category\":\"content\",\"domains\":[\"*.bitgravity.com\"]},{\"name\":\"Bitly\",\"category\":\"utility\",\"domains\":[\"*.bitly.com\",\"*.lemde.fr\",\"*.bit.ly\"],\"totalExecutionTime\":874,\"totalOccurrences\":4},{\"name\":\"Bizible\",\"category\":\"ad\",\"domains\":[\"*.bizible.com\",\"*.bizibly.com\"],\"totalExecutionTime\":675749,\"totalOccurrences\":1278},{\"name\":\"Bizrate\",\"category\":\"analytics\",\"domains\":[\"*.bizrate.com\"],\"totalExecutionTime\":11503,\"totalOccurrences\":52},{\"name\":\"BlastCasta\",\"category\":\"social\",\"domains\":[\"*.poweringnews.com\"],\"examples\":[\"www.poweringnews.com\"]},{\"name\":\"Blindado\",\"category\":\"utility\",\"domains\":[\"*.siteblindado.com\"],\"totalExecutionTime\":1016,\"totalOccurrences\":5},{\"name\":\"Blis\",\"category\":\"ad\",\"domains\":[\"*.blismedia.com\"]},{\"name\":\"Blogg.se\",\"category\":\"hosting\",\"domains\":[\"*.cdnme.se\",\"*.publishme.se\"]},{\"name\":\"BloomReach\",\"category\":\"ad\",\"domains\":[\"*.brcdn.com\",\"*.brsrvr.com\",\"*.brsvr.com\"],\"totalExecutionTime\":2304,\"totalOccurrences\":33},{\"name\":\"Bloomberg\",\"category\":\"content\",\"domains\":[\"*.gotraffic.net\"]},{\"name\":\"Shop Logic\",\"company\":\"BloomReach\",\"category\":\"marketing\",\"domains\":[\"*.goshoplogic.com\"]},{\"name\":\"Blue State Digital\",\"category\":\"ad\",\"domains\":[\"*.bsd.net\"]},{\"name\":\"Blue Triangle Technologies\",\"category\":\"analytics\",\"domains\":[\"*.btttag.com\"],\"totalExecutionTime\":112735,\"totalOccurrences\":201},{\"name\":\"BlueCava\",\"category\":\"ad\",\"domains\":[\"*.bluecava.com\"],\"totalExecutionTime\":391615,\"totalOccurrences\":5001},{\"name\":\"BlueKai\",\"company\":\"Oracle\",\"category\":\"ad\",\"domains\":[\"*.bkrtx.com\",\"*.bluekai.com\"]},{\"name\":\"Bluecore\",\"category\":\"analytics\",\"domains\":[\"*.bluecore.com\"],\"examples\":[\"www.bluecore.com\"],\"totalExecutionTime\":80014,\"totalOccurrences\":229},{\"name\":\"Bluegg\",\"category\":\"hosting\",\"domains\":[\"d1va5oqn59yrvt.cloudfront.net\"]},{\"name\":\"Bold Commerce\",\"category\":\"utility\",\"domains\":[\"*.shappify-cdn.com\",\"*.shappify.com\",\"*.boldapps.net\"],\"totalExecutionTime\":4111931,\"totalOccurrences\":7864},{\"name\":\"BoldChat\",\"company\":\"LogMeIn\",\"category\":\"customer-success\",\"domains\":[\"*.boldchat.com\"]},{\"name\":\"Bombora\",\"category\":\"ad\",\"domains\":[\"*.mlno6.com\"]},{\"name\":\"Bonnier\",\"category\":\"content\",\"domains\":[\"*.bonniercorp.com\"]},{\"name\":\"Bookatable\",\"category\":\"content\",\"domains\":[\"*.bookatable.com\",\"*.livebookings.com\"]},{\"name\":\"Booking.com\",\"category\":\"content\",\"domains\":[\"*.bstatic.com\"],\"totalExecutionTime\":1507023,\"totalOccurrences\":2092},{\"name\":\"Boomtrain\",\"category\":\"ad\",\"domains\":[\"*.boomtrain.com\",\"*.boomtrain.net\"],\"totalExecutionTime\":160921,\"totalOccurrences\":1057},{\"name\":\"BoostSuite\",\"category\":\"ad\",\"domains\":[\"*.poweredbyeden.com\"]},{\"name\":\"Boostable\",\"category\":\"ad\",\"domains\":[\"*.boostable.com\"]},{\"name\":\"Bootstrap Chinese network\",\"category\":\"cdn\",\"domains\":[\"*.bootcss.com\"],\"totalExecutionTime\":898073,\"totalOccurrences\":556},{\"name\":\"Booxscale\",\"category\":\"ad\",\"domains\":[\"*.booxscale.com\"]},{\"name\":\"Borderfree\",\"company\":\"pitney bowes\",\"category\":\"utility\",\"domains\":[\"*.borderfree.com\",\"*.fiftyone.com\"]},{\"name\":\"BowNow\",\"category\":\"analytics\",\"homepage\":\"https://bow-now.jp/\",\"domains\":[\"*.bownow.jp\"],\"examples\":[\"contents.bownow.jp\"],\"totalExecutionTime\":1168444,\"totalOccurrences\":2415},{\"name\":\"Box\",\"category\":\"hosting\",\"domains\":[\"*.box.com\"],\"totalExecutionTime\":11443,\"totalOccurrences\":92},{\"name\":\"Boxever\",\"category\":\"analytics\",\"domains\":[\"*.boxever.com\"]},{\"name\":\"Braintree Payments\",\"company\":\"Paypal\",\"category\":\"utility\",\"domains\":[\"*.braintreegateway.com\"],\"totalExecutionTime\":149141,\"totalOccurrences\":1058},{\"name\":\"Branch Metrics\",\"category\":\"ad\",\"domains\":[\"*.branch.io\",\"*.app.link\"],\"totalExecutionTime\":249496,\"totalOccurrences\":5393},{\"name\":\"Brand Finance\",\"category\":\"other\",\"domains\":[\"*.brandirectory.com\"]},{\"name\":\"Brand View\",\"category\":\"analytics\",\"domains\":[\"*.brandview.com\"]},{\"name\":\"Brandscreen\",\"category\":\"ad\",\"domains\":[\"*.rtbidder.net\"],\"examples\":[\"match.rtbidder.net\"]},{\"name\":\"BridgeTrack\",\"company\":\"Sapient\",\"category\":\"ad\",\"domains\":[\"*.bridgetrack.com\"]},{\"name\":\"BrightRoll\",\"company\":\"Yahoo!\",\"category\":\"ad\",\"domains\":[\"*.btrll.com\"]},{\"name\":\"BrightTag / Signal\",\"company\":\"Signal\",\"homepage\":\"https://www.signal.co\",\"category\":\"tag-manager\",\"domains\":[\"*.btstatic.com\",\"*.thebrighttag.com\"]},{\"name\":\"Brightcove ZenCoder\",\"company\":\"Brightcove\",\"category\":\"other\",\"domains\":[\"*.zencoder.net\"]},{\"name\":\"Bronto Software\",\"category\":\"marketing\",\"domains\":[\"*.bm23.com\",\"*.bronto.com\",\"*.brontops.com\"]},{\"name\":\"Browser-Update.org\",\"category\":\"other\",\"domains\":[\"*.browser-update.org\"]},{\"name\":\"Buffer\",\"category\":\"social\",\"domains\":[\"*.bufferapp.com\"],\"totalExecutionTime\":269,\"totalOccurrences\":7},{\"name\":\"Bugsnag\",\"category\":\"utility\",\"domains\":[\"*.bugsnag.com\",\"d2wy8f7a9ursnm.cloudfront.net\"],\"examples\":[\"notify.bugsnag.com\"],\"totalExecutionTime\":5633687,\"totalOccurrences\":16269},{\"name\":\"Burst Media\",\"category\":\"ad\",\"domains\":[\"*.burstnet.com\",\"*.1rx.io\"],\"examples\":[\"usermatch.burstnet.com\"],\"totalExecutionTime\":631,\"totalOccurrences\":89},{\"name\":\"Burt\",\"category\":\"analytics\",\"domains\":[\"*.richmetrics.com\",\"*.burt.io\"]},{\"name\":\"Business Message\",\"category\":\"ad\",\"domains\":[\"*.message-business.com\"],\"totalExecutionTime\":5619,\"totalOccurrences\":22},{\"name\":\"Business Week\",\"company\":\"Bloomberg\",\"category\":\"social\",\"domains\":[\"*.bwbx.io\"],\"totalExecutionTime\":66372,\"totalOccurrences\":8},{\"name\":\"Buto\",\"company\":\"Big Button\",\"category\":\"ad\",\"domains\":[\"*.buto.tv\"]},{\"name\":\"Button\",\"category\":\"ad\",\"domains\":[\"*.btncdn.com\"]},{\"name\":\"BuySellAds\",\"category\":\"ad\",\"domains\":[\"*.buysellads.com\",\"*.buysellads.net\"],\"totalExecutionTime\":265477,\"totalOccurrences\":240},{\"name\":\"BuySight (AOL)\",\"category\":\"ad\",\"domains\":[\"*.pulsemgr.com\"]},{\"name\":\"Buyapowa\",\"category\":\"ad\",\"domains\":[\"*.co-buying.com\"],\"totalExecutionTime\":1443,\"totalOccurrences\":17},{\"name\":\"BuzzFeed\",\"category\":\"social\",\"domains\":[\"*.buzzfed.com\",\"*.buzzfeed.com\"],\"totalExecutionTime\":24149,\"totalOccurrences\":2},{\"name\":\"C1X\",\"category\":\"ad\",\"domains\":[\"*.c1exchange.com\"]},{\"name\":\"C3 Metrics\",\"category\":\"analytics\",\"domains\":[\"*.c3tag.com\"],\"totalExecutionTime\":60962,\"totalOccurrences\":265},{\"name\":\"CANDDi\",\"company\":\"Campaign and Digital Intelligence\",\"category\":\"ad\",\"domains\":[\"*.canddi.com\"],\"totalExecutionTime\":64444,\"totalOccurrences\":140},{\"name\":\"CCM benchmark Group\",\"category\":\"social\",\"domains\":[\"*.ccm2.net\"]},{\"name\":\"CD Networks\",\"category\":\"utility\",\"domains\":[\"*.gccdn.net\"]},{\"name\":\"CDN Planet\",\"category\":\"analytics\",\"domains\":[\"*.cdnplanet.com\"]},{\"name\":\"InAuth\",\"category\":\"utility\",\"homepage\":\"https://www.inauth.com/\",\"domains\":[\"*.cdn-net.com\"],\"examples\":[\"uk.cdn-net.com\"],\"totalExecutionTime\":69261,\"totalOccurrences\":51},{\"name\":\"CJ Affiliate\",\"company\":\"Conversant\",\"category\":\"ad\",\"domains\":[\"*.cj.com\",\"*.dpbolvw.net\"],\"totalExecutionTime\":4767,\"totalOccurrences\":11},{\"name\":\"CJ Affiliate by Conversant\",\"company\":\"Conversant\",\"category\":\"ad\",\"domains\":[\"*.ftjcfx.com\"],\"totalExecutionTime\":609,\"totalOccurrences\":8},{\"name\":\"CNBC\",\"category\":\"content\",\"domains\":[\"*.cnbc.com\"],\"totalExecutionTime\":30369,\"totalOccurrences\":14},{\"name\":\"CNET Content Solutions\",\"company\":\"CBS Interactive\",\"category\":\"content\",\"domains\":[\"*.cnetcontent.com\"],\"examples\":[\"cdn.cnetcontent.com\",\"ws.cnetcontent.com\"]},{\"name\":\"CPEx\",\"category\":\"content\",\"domains\":[\"*.cpex.cz\"],\"totalExecutionTime\":1102627,\"totalOccurrences\":1066},{\"name\":\"CPXi\",\"category\":\"ad\",\"domains\":[\"*.cpxinteractive.com\"]},{\"name\":\"CUBED Attribution\",\"company\":\"CUBED\",\"category\":\"ad\",\"domains\":[\"*.withcubed.com\"],\"examples\":[\"data.withcubed.com\"]},{\"name\":\"Cachefly\",\"category\":\"utility\",\"domains\":[\"*.cachefly.net\"],\"totalExecutionTime\":138750,\"totalOccurrences\":261},{\"name\":\"Calendly\",\"category\":\"other\",\"domains\":[\"*.calendly.com\"],\"totalExecutionTime\":9224336,\"totalOccurrences\":4749},{\"name\":\"CallRail\",\"category\":\"analytics\",\"domains\":[\"*.callrail.com\"],\"totalExecutionTime\":7494773,\"totalOccurrences\":30157},{\"name\":\"CallTrackingMetrics\",\"category\":\"analytics\",\"domains\":[\"*.tctm.co\"],\"totalExecutionTime\":1915317,\"totalOccurrences\":8100},{\"name\":\"Canned Banners\",\"category\":\"ad\",\"domains\":[\"*.cannedbanners.com\"]},{\"name\":\"Canopy Labs\",\"category\":\"analytics\",\"domains\":[\"*.canopylabs.com\"]},{\"name\":\"Capita\",\"category\":\"utility\",\"domains\":[\"*.crcom.co.uk\"],\"examples\":[\"emmsrep.crcom.co.uk\"]},{\"name\":\"Captify Media\",\"category\":\"ad\",\"domains\":[\"*.cpx.to\"],\"totalExecutionTime\":17083,\"totalOccurrences\":57},{\"name\":\"Captiify\",\"category\":\"ad\",\"domains\":[\"*.captifymedia.com\"]},{\"name\":\"Captivate Ai\",\"category\":\"ad\",\"domains\":[\"*.captivate.ai\"]},{\"name\":\"Captora\",\"category\":\"marketing\",\"domains\":[\"*.captora.com\"]},{\"name\":\"Carcloud\",\"category\":\"other\",\"domains\":[\"*.carcloud.co.uk\"]},{\"name\":\"Cardlytics\",\"category\":\"ad\",\"domains\":[\"*.cardlytics.com\"]},{\"name\":\"Cardosa Enterprises\",\"category\":\"analytics\",\"domains\":[\"*.y-track.com\"],\"totalExecutionTime\":538,\"totalOccurrences\":11},{\"name\":\"Caspian Media\",\"category\":\"ad\",\"domains\":[\"*.caspianmedia.com\"]},{\"name\":\"Cast\",\"category\":\"utility\",\"domains\":[\"*.cast.rocks\"]},{\"name\":\"Catch\",\"category\":\"other\",\"domains\":[\"*.getcatch.com\"],\"examples\":[\"app.getcatch.com\",\"assets.getcatch.com\",\"js.getcatch.com\"],\"totalExecutionTime\":16008,\"totalOccurrences\":38},{\"name\":\"Cavisson\",\"category\":\"analytics\",\"domains\":[\"*.cavisson.com\"]},{\"name\":\"Cedato\",\"category\":\"ad\",\"domains\":[\"*.algovid.com\",\"*.vdoserv.com\"]},{\"name\":\"Celebrus Technologies\",\"category\":\"analytics\",\"domains\":[\"*.celebrus.com\"]},{\"name\":\"Celtra\",\"category\":\"ad\",\"domains\":[\"*.celtra.com\"],\"totalExecutionTime\":255941,\"totalOccurrences\":217},{\"name\":\"Centro\",\"category\":\"ad\",\"domains\":[\"*.brand-server.com\"]},{\"name\":\"Ceros\",\"category\":\"other\",\"domains\":[\"ceros.com\",\"view.ceros.com\"],\"totalExecutionTime\":37499,\"totalOccurrences\":141},{\"name\":\"Ceros Analytics\",\"company\":\"Ceros\",\"category\":\"analytics\",\"domains\":[\"api.ceros.com\"]},{\"name\":\"Certona\",\"category\":\"analytics\",\"domains\":[\"*.certona.net\"]},{\"name\":\"Certum\",\"category\":\"utility\",\"domains\":[\"*.ocsp-certum.com\",\"*.certum.pl\"],\"totalExecutionTime\":8511,\"totalOccurrences\":4},{\"name\":\"Cgrdirect\",\"category\":\"other\",\"domains\":[\"*.cgrdirect.co.uk\"]},{\"name\":\"Channel 5 Media\",\"category\":\"ad\",\"domains\":[\"*.five.tv\"]},{\"name\":\"Channel.me\",\"category\":\"customer-success\",\"domains\":[\"*.channel.me\"]},{\"name\":\"ChannelAdvisor\",\"category\":\"ad\",\"domains\":[\"*.channeladvisor.com\",\"*.searchmarketing.com\"],\"totalExecutionTime\":3947,\"totalOccurrences\":17},{\"name\":\"ChannelApe\",\"company\":\"ChannelApe\",\"category\":\"other\",\"homepage\":\"https://www.channelape.com/\",\"domains\":[\"*.channelape.com\"],\"examples\":[\"callbacks.channelape.com\"]},{\"name\":\"Chargeads Oscar\",\"company\":\"Chargeads\",\"category\":\"ad\",\"domains\":[\"*.chargeads.com\"]},{\"name\":\"Charities Aid Foundation\",\"category\":\"utility\",\"domains\":[\"*.cafonline.org\"],\"totalExecutionTime\":21324,\"totalOccurrences\":24},{\"name\":\"Chartbeat\",\"category\":\"analytics\",\"domains\":[\"*.chartbeat.com\",\"*.chartbeat.net\"],\"totalExecutionTime\":1094000,\"totalOccurrences\":5626},{\"name\":\"Cheapflights Media\",\"company\":\"Momondo\",\"category\":\"content\",\"domains\":[\"*.momondo.net\"]},{\"name\":\"CheckM8\",\"category\":\"ad\",\"domains\":[\"*.checkm8.com\"]},{\"name\":\"CheckRate\",\"company\":\"FreeStart\",\"category\":\"utility\",\"domains\":[\"*.checkrate.co.uk\"]},{\"name\":\"Checkfront\",\"category\":\"other\",\"domains\":[\"*.checkfront.com\",\"dcg3jth5savst.cloudfront.net\"],\"totalExecutionTime\":213931,\"totalOccurrences\":127},{\"name\":\"CheetahMail\",\"company\":\"Experian\",\"category\":\"ad\",\"domains\":[\"*.chtah.com\"]},{\"name\":\"Chitika\",\"category\":\"ad\",\"domains\":[\"*.chitika.net\"]},{\"name\":\"ChoiceStream\",\"category\":\"ad\",\"domains\":[\"*.choicestream.com\"]},{\"name\":\"Cint\",\"category\":\"social\",\"domains\":[\"*.cint.com\"],\"totalExecutionTime\":71080,\"totalOccurrences\":33},{\"name\":\"Civic\",\"category\":\"hosting\",\"domains\":[\"*.civiccomputing.com\"],\"totalExecutionTime\":2517692,\"totalOccurrences\":6901},{\"name\":\"ClearRise\",\"category\":\"customer-success\",\"domains\":[\"*.clearrise.com\"]},{\"name\":\"Clearstream\",\"category\":\"ad\",\"domains\":[\"*.clrstm.com\"]},{\"name\":\"Clerk.io ApS\",\"category\":\"analytics\",\"domains\":[\"*.clerk.io\"],\"totalExecutionTime\":1014363,\"totalOccurrences\":1865},{\"name\":\"CleverDATA\",\"category\":\"ad\",\"domains\":[\"*.1dmp.io\"]},{\"name\":\"CleverTap\",\"category\":\"analytics\",\"domains\":[\"d2r1yp2w7bby2u.cloudfront.net\"],\"totalExecutionTime\":238815,\"totalOccurrences\":1601},{\"name\":\"Click Density\",\"category\":\"analytics\",\"domains\":[\"*.clickdensity.com\"]},{\"name\":\"Click4Assistance\",\"category\":\"customer-success\",\"domains\":[\"*.click4assistance.co.uk\"],\"totalExecutionTime\":18240,\"totalOccurrences\":140},{\"name\":\"ClickDesk\",\"category\":\"customer-success\",\"domains\":[\"*.clickdesk.com\",\"d1gwclp1pmzk26.cloudfront.net\"],\"totalExecutionTime\":56221,\"totalOccurrences\":491},{\"name\":\"ClickDimensions\",\"category\":\"ad\",\"domains\":[\"*.clickdimensions.com\"],\"totalExecutionTime\":143491,\"totalOccurrences\":250},{\"name\":\"Clickadu (Winner Solutions)\",\"category\":\"ad\",\"domains\":[\"*.clickadu.com\"],\"totalExecutionTime\":12504,\"totalOccurrences\":4},{\"name\":\"Clickagy Audience Lab\",\"company\":\"Clickagy\",\"category\":\"ad\",\"domains\":[\"*.clickagy.com\"],\"examples\":[\"aorta.clickagy.com\"],\"totalExecutionTime\":58482,\"totalOccurrences\":988},{\"name\":\"Clickio\",\"category\":\"ad\",\"domains\":[]},{\"name\":\"Clicktale\",\"category\":\"analytics\",\"domains\":[\"*.cdngc.net\",\"*.clicktale.net\"],\"examples\":[\"clicktalecdn.sslcs.cdngc.net\"],\"totalExecutionTime\":301503,\"totalOccurrences\":227},{\"name\":\"Clicktripz\",\"category\":\"content\",\"domains\":[\"*.clicktripz.com\"],\"examples\":[\"static.clicktripz.com\",\"www.clicktripz.com\"],\"totalExecutionTime\":780170,\"totalOccurrences\":458},{\"name\":\"Clik.com Websites\",\"category\":\"content\",\"domains\":[\"*.clikpic.com\"]},{\"name\":\"Cloud Technologies\",\"category\":\"ad\",\"domains\":[\"*.behavioralengine.com\",\"*.behavioralmailing.com\"]},{\"name\":\"Cloud-A\",\"category\":\"other\",\"domains\":[\"*.bulkstorage.ca\"]},{\"name\":\"Cloud.typography\",\"company\":\"Hoefler &amp; Co\",\"category\":\"cdn\",\"domains\":[\"*.typography.com\"],\"totalExecutionTime\":3646,\"totalOccurrences\":191},{\"name\":\"CloudSponge\",\"category\":\"ad\",\"domains\":[\"*.cloudsponge.com\"]},{\"name\":\"CloudVPS\",\"category\":\"other\",\"domains\":[\"*.adoftheyear.com\",\"*.objectstore.eu\"]},{\"name\":\"Cloudinary\",\"category\":\"content\",\"domains\":[\"*.cloudinary.com\"],\"totalExecutionTime\":1188010,\"totalOccurrences\":2011},{\"name\":\"Cloudqp\",\"company\":\"Cloudwp\",\"category\":\"other\",\"domains\":[\"*.cloudwp.io\"]},{\"name\":\"Cludo\",\"category\":\"utility\",\"domains\":[\"*.cludo.com\"],\"totalExecutionTime\":40466,\"totalOccurrences\":1044},{\"name\":\"Cognesia\",\"category\":\"marketing\",\"domains\":[\"*.intelli-direct.com\"]},{\"name\":\"CogoCast\",\"company\":\"Cogo Labs\",\"category\":\"ad\",\"domains\":[\"*.cogocast.net\"]},{\"name\":\"Colbenson\",\"category\":\"utility\",\"domains\":[\"*.colbenson.com\"]},{\"name\":\"Collective\",\"category\":\"ad\",\"domains\":[\"*.collective-media.net\"]},{\"name\":\"Com Laude\",\"category\":\"other\",\"domains\":[\"*.gdimg.net\"]},{\"name\":\"Comm100\",\"category\":\"customer-success\",\"domains\":[\"*.comm100.com\"],\"totalExecutionTime\":392311,\"totalOccurrences\":893},{\"name\":\"CommerceHub\",\"category\":\"marketing\",\"domains\":[\"*.mercent.com\"]},{\"name\":\"Commission Factory\",\"category\":\"ad\",\"domains\":[\"*.cfjump.com\"],\"totalExecutionTime\":443,\"totalOccurrences\":7},{\"name\":\"Communicator\",\"category\":\"ad\",\"domains\":[\"*.communicatorcorp.com\",\"*.communicatoremail.com\"]},{\"name\":\"Comodo\",\"category\":\"utility\",\"domains\":[\"*.comodo.com\",\"*.trust-provider.com\",\"*.trustlogo.com\",\"*.usertrust.com\",\"*.comodo.net\"],\"examples\":[\"ocsp.trust-provider.com\"],\"totalExecutionTime\":24720,\"totalOccurrences\":28},{\"name\":\"Comodo Certificate Authority\",\"company\":\"Comodo\",\"category\":\"utility\",\"domains\":[\"crt.comodoca.com\",\"*.comodoca4.com\",\"ocsp.comodoca.com\",\"ocsp.usertrust.com\",\"crt.usertrust.com\"],\"examples\":[\"ocsp.comodoca4.com\"]},{\"name\":\"Compete\",\"company\":\"Millwood Brown Digital\",\"category\":\"analytics\",\"domains\":[\"*.c-col.com\",\"*.compete.com\"]},{\"name\":\"Compuware\",\"category\":\"analytics\",\"domains\":[\"*.axf8.net\"]},{\"name\":\"Conductrics\",\"category\":\"analytics\",\"domains\":[\"*.conductrics.com\"],\"examples\":[\"cdn-v3.conductrics.com\"],\"totalExecutionTime\":14433,\"totalOccurrences\":75},{\"name\":\"Confirmit\",\"category\":\"analytics\",\"domains\":[\"*.confirmit.com\"],\"totalExecutionTime\":24130,\"totalOccurrences\":186},{\"name\":\"Connatix\",\"category\":\"ad\",\"domains\":[\"*.connatix.com\"],\"totalExecutionTime\":1217368,\"totalOccurrences\":423},{\"name\":\"Connect Events\",\"category\":\"hosting\",\"domains\":[\"*.connectevents.com.au\"]},{\"name\":\"Constant Contact\",\"category\":\"ad\",\"domains\":[\"*.ctctcdn.com\"],\"totalExecutionTime\":520916,\"totalOccurrences\":16904},{\"name\":\"Constructor.io\",\"category\":\"utility\",\"domains\":[\"*.cnstrc.com\"],\"totalExecutionTime\":388,\"totalOccurrences\":2},{\"name\":\"Contabo\",\"category\":\"hosting\",\"domains\":[\"185.2.100.179\"]},{\"name\":\"Content Media Corporation\",\"category\":\"content\",\"domains\":[\"*.contentmedia.eu\"]},{\"name\":\"ContentSquare\",\"category\":\"analytics\",\"domains\":[\"d1m6l9dfulcyw7.cloudfront.net\",\"*.content-square.net\",\"*.contentsquare.net\"],\"totalExecutionTime\":10092520,\"totalOccurrences\":7832},{\"name\":\"ContextWeb\",\"category\":\"ad\",\"domains\":[\"*.contextweb.com\"],\"totalExecutionTime\":22831,\"totalOccurrences\":864},{\"name\":\"Continental Exchange Solutions\",\"category\":\"utility\",\"domains\":[\"*.hifx.com\"]},{\"name\":\"Converge-Digital\",\"category\":\"ad\",\"domains\":[\"*.converge-digital.com\"],\"examples\":[\"ads.converge-digital.com\"]},{\"name\":\"Conversant\",\"category\":\"analytics\",\"domains\":[\"*.dotomi.com\",\"*.dtmpub.com\",\"*.emjcd.com\",\"mediaplex.com\",\"*.tqlkg.com\",\"*.fastclick.net\"],\"examples\":[\"www.tqlkg.com\"],\"totalExecutionTime\":9006403,\"totalOccurrences\":79976},{\"name\":\"Conversant Ad Server\",\"company\":\"Conversant\",\"category\":\"ad\",\"domains\":[\"adfarm.mediaplex.com\",\"*.mediaplex.com\"],\"totalExecutionTime\":1,\"totalOccurrences\":8},{\"name\":\"Conversant Tag Manager\",\"company\":\"Conversant\",\"category\":\"tag-manager\",\"domains\":[\"*.mplxtms.com\"],\"totalExecutionTime\":15664,\"totalOccurrences\":54},{\"name\":\"Conversio\",\"category\":\"ad\",\"domains\":[\"*.conversio.com\"]},{\"name\":\"Conversion Labs\",\"category\":\"ad\",\"domains\":[\"*.net.pl\"],\"examples\":[\"conversionlabs.net.pl\"],\"totalExecutionTime\":3409183,\"totalOccurrences\":1912},{\"name\":\"Conversion Logic\",\"category\":\"ad\",\"domains\":[\"*.conversionlogic.net\"]},{\"name\":\"Convert Insights\",\"category\":\"analytics\",\"domains\":[\"*.convertexperiments.com\"],\"totalExecutionTime\":2581755,\"totalOccurrences\":4550},{\"name\":\"ConvertMedia\",\"category\":\"ad\",\"domains\":[\"*.admailtiser.com\",\"*.basebanner.com\",\"*.cmbestsrv.com\",\"*.vidfuture.com\",\"*.zorosrv.com\"],\"examples\":[\"www.cmbestsrv.com\"]},{\"name\":\"Convertro\",\"category\":\"ad\",\"domains\":[\"*.convertro.com\"]},{\"name\":\"Conviva\",\"category\":\"content\",\"domains\":[\"*.conviva.com\"],\"totalExecutionTime\":6526,\"totalOccurrences\":1},{\"name\":\"Cookie Reports\",\"category\":\"utility\",\"domains\":[\"*.cookiereports.com\"],\"totalExecutionTime\":280055,\"totalOccurrences\":683},{\"name\":\"Cookie-Script.com\",\"category\":\"utility\",\"domains\":[\"*.cookie-script.com\"],\"totalExecutionTime\":16036035,\"totalOccurrences\":62455},{\"name\":\"CookieQ\",\"company\":\"Baycloud Systems\",\"category\":\"utility\",\"domains\":[\"*.cookieq.com\"]},{\"name\":\"CoolaData\",\"category\":\"analytics\",\"domains\":[\"*.cooladata.com\"]},{\"name\":\"CopperEgg\",\"category\":\"analytics\",\"domains\":[\"*.copperegg.com\",\"d2vig74li2resi.cloudfront.net\"]},{\"name\":\"Council ad Network\",\"category\":\"ad\",\"domains\":[\"*.counciladvertising.net\"],\"totalExecutionTime\":17849,\"totalOccurrences\":81},{\"name\":\"Covert Pics\",\"category\":\"content\",\"domains\":[\"*.covet.pics\"],\"totalExecutionTime\":3971,\"totalOccurrences\":40},{\"name\":\"Cox Digital Solutions\",\"category\":\"ad\",\"domains\":[\"*.afy11.net\"]},{\"name\":\"Creafi Online Media\",\"category\":\"ad\",\"domains\":[\"*.creafi-online-media.com\"]},{\"name\":\"Creators\",\"category\":\"content\",\"domains\":[\"*.creators.co\"]},{\"name\":\"Crimson Hexagon Analytics\",\"company\":\"Crimson Hexagon\",\"category\":\"analytics\",\"domains\":[\"*.hexagon-analytics.com\"]},{\"name\":\"Crimtan\",\"category\":\"ad\",\"domains\":[\"*.ctnsnet.com\"],\"totalExecutionTime\":37644,\"totalOccurrences\":26161},{\"name\":\"Cross Pixel Media\",\"category\":\"ad\",\"domains\":[\"*.crsspxl.com\"],\"totalExecutionTime\":575,\"totalOccurrences\":8},{\"name\":\"Crosswise\",\"category\":\"ad\",\"domains\":[\"*.univide.com\"],\"examples\":[\"p.univide.com\"]},{\"name\":\"Crowd Control\",\"company\":\"Lotame\",\"category\":\"ad\",\"domains\":[\"*.crwdcntrl.net\"],\"totalExecutionTime\":14837144,\"totalOccurrences\":118253},{\"name\":\"Crowd Ignite\",\"category\":\"ad\",\"domains\":[\"*.crowdignite.com\"]},{\"name\":\"CrowdTwist\",\"category\":\"ad\",\"domains\":[\"*.crowdtwist.com\"]},{\"name\":\"Crowdskout\",\"category\":\"ad\",\"domains\":[\"*.crowdskout.com\"]},{\"name\":\"Crowdynews\",\"category\":\"social\",\"domains\":[\"*.breakingburner.com\"]},{\"name\":\"Curalate\",\"category\":\"marketing\",\"domains\":[\"*.curalate.com\",\"d116tqlcqfmz3v.cloudfront.net\"],\"totalExecutionTime\":489850,\"totalOccurrences\":670},{\"name\":\"Customer Acquisition Cloud\",\"company\":\"[24]7\",\"category\":\"ad\",\"domains\":[\"*.campanja.com\"]},{\"name\":\"Customer.io\",\"category\":\"ad\",\"domains\":[\"*.customer.io\"],\"totalExecutionTime\":273654,\"totalOccurrences\":1415},{\"name\":\"Custora\",\"category\":\"analytics\",\"domains\":[\"*.custora.com\"]},{\"name\":\"Cxense\",\"category\":\"ad\",\"domains\":[\"*.cxense.com\",\"*.cxpublic.com\",\"*.emediate.dk\",\"*.emediate.eu\"],\"totalExecutionTime\":1731204,\"totalOccurrences\":3470},{\"name\":\"CyberKnight\",\"company\":\"Namogoo\",\"category\":\"utility\",\"domains\":[\"*.namogoo.com\"]},{\"name\":\"CyberSource (Visa)\",\"category\":\"utility\",\"domains\":[\"*.authorize.net\"],\"totalExecutionTime\":339958,\"totalOccurrences\":2662},{\"name\":\"Cybernet Quest\",\"category\":\"analytics\",\"domains\":[\"*.cqcounter.com\"]},{\"name\":\"D.A. Consortium\",\"category\":\"ad\",\"domains\":[\"*.eff1.net\"]},{\"name\":\"D4t4 Solutions\",\"category\":\"analytics\",\"domains\":[\"*.u5e.com\"]},{\"name\":\"DCSL Software\",\"category\":\"hosting\",\"domains\":[\"*.dcslsoftware.com\"]},{\"name\":\"DMG Media\",\"category\":\"content\",\"domains\":[\"*.mol.im\",\"*.and.co.uk\",\"*.anm.co.uk\",\"*.dailymail.co.uk\"],\"totalExecutionTime\":38755,\"totalOccurrences\":25},{\"name\":\"DTSCOUT\",\"category\":\"ad\",\"domains\":[\"*.dtscout.com\"],\"totalExecutionTime\":633930,\"totalOccurrences\":7864},{\"name\":\"Dailykarma\",\"category\":\"utility\",\"homepage\":\"https://www.dailykarma.com/\",\"domains\":[\"*.dailykarma.io\"],\"examples\":[\"assets.dailykarma.io\"],\"totalExecutionTime\":84377,\"totalOccurrences\":451},{\"name\":\"Dailymotion\",\"category\":\"content\",\"domains\":[\"*.dailymotion.com\",\"*.dmxleo.com\",\"*.dm.gg\",\"*.pxlad.io\",\"*.dmcdn.net\",\"*.sublimevideo.net\"],\"examples\":[\"ad.pxlad.io\",\"www.dailymotion.com\"],\"totalExecutionTime\":42446632,\"totalOccurrences\":4694},{\"name\":\"Dash Hudson\",\"company\":\"Dash Hudson\",\"category\":\"content\",\"domains\":[\"*.dashhudson.com\"],\"examples\":[\"cdn.dashhudson.com\"],\"totalExecutionTime\":121878,\"totalOccurrences\":93},{\"name\":\"Datacamp\",\"category\":\"utility\",\"domains\":[\"*.cdn77.org\"],\"totalExecutionTime\":3334605,\"totalOccurrences\":1274},{\"name\":\"Datalicious\",\"category\":\"tag-manager\",\"domains\":[\"*.supert.ag\",\"*.optimahub.com\"]},{\"name\":\"Datalogix\",\"category\":\"ad\",\"domains\":[\"*.nexac.com\"]},{\"name\":\"Datawrapper\",\"category\":\"utility\",\"domains\":[\"*.datawrapper.de\",\"*.dwcdn.net\"],\"examples\":[\"www.datawrapper.de\"],\"totalExecutionTime\":924732,\"totalOccurrences\":256},{\"name\":\"Dataxu\",\"category\":\"marketing\",\"domains\":[\"*.w55c.net\"],\"totalExecutionTime\":95,\"totalOccurrences\":4},{\"name\":\"DatoCMS\",\"homepage\":\"https://www.datocms.com/\",\"category\":\"content\",\"domains\":[\"*.datocms-assets.com\"],\"examples\":[\"www.datocms-assets.com\"]},{\"name\":\"Datonics\",\"category\":\"ad\",\"domains\":[\"*.pro-market.net\"],\"examples\":[\"pbid.pro-market.net\"],\"totalExecutionTime\":16516,\"totalOccurrences\":238},{\"name\":\"Dealtime\",\"category\":\"content\",\"domains\":[\"*.dealtime.com\"]},{\"name\":\"Debenhams Geo Location\",\"company\":\"Debenhams\",\"category\":\"utility\",\"domains\":[\"176.74.183.134\"]},{\"name\":\"Decibel Insight\",\"category\":\"analytics\",\"domains\":[\"*.decibelinsight.net\"],\"totalExecutionTime\":835617,\"totalOccurrences\":612},{\"name\":\"Deep Forest Media\",\"company\":\"Rakuten\",\"category\":\"ad\",\"domains\":[\"*.dpclk.com\"]},{\"name\":\"DeepIntent\",\"category\":\"ad\",\"domains\":[\"*.deepintent.com\"],\"totalExecutionTime\":3703,\"totalOccurrences\":211},{\"name\":\"Delicious Media\",\"category\":\"social\",\"domains\":[\"*.delicious.com\"]},{\"name\":\"Delineo\",\"category\":\"ad\",\"domains\":[\"*.delineo.com\"],\"examples\":[\"www.delineo.com\"]},{\"name\":\"Delta Projects AB\",\"category\":\"ad\",\"domains\":[\"*.de17a.com\"],\"totalExecutionTime\":81881,\"totalOccurrences\":344},{\"name\":\"Demand Media\",\"category\":\"content\",\"domains\":[\"*.dmtracker.com\"]},{\"name\":\"DemandBase\",\"category\":\"marketing\",\"domains\":[\"*.demandbase.com\"],\"totalExecutionTime\":335098,\"totalOccurrences\":1954},{\"name\":\"DemandJump\",\"category\":\"analytics\",\"domains\":[\"*.demandjump.com\"]},{\"name\":\"Dennis Publishing\",\"category\":\"content\",\"domains\":[\"*.alphr.com\"]},{\"name\":\"Devatics\",\"category\":\"analytics\",\"domains\":[\"*.devatics.com\",\"*.devatics.io\"]},{\"name\":\"Developer Media\",\"category\":\"ad\",\"domains\":[\"*.developermedia.com\"]},{\"name\":\"DialogTech\",\"category\":\"ad\",\"domains\":[\"*.dialogtech.com\"]},{\"name\":\"DialogTech SourceTrak\",\"company\":\"DialogTech\",\"category\":\"ad\",\"domains\":[\"d31y97ze264gaa.cloudfront.net\"]},{\"name\":\"DigiCert\",\"category\":\"utility\",\"domains\":[\"*.digicert.com\"],\"examples\":[\"ocsp.digicert.com\"],\"totalExecutionTime\":28065,\"totalOccurrences\":72},{\"name\":\"Digioh\",\"category\":\"ad\",\"domains\":[\"*.lightboxcdn.com\"],\"totalExecutionTime\":1491426,\"totalOccurrences\":1463},{\"name\":\"Digital Look\",\"category\":\"content\",\"domains\":[\"*.digitallook.com\"]},{\"name\":\"Digital Media Exchange\",\"company\":\"NDN\",\"category\":\"content\",\"domains\":[\"*.newsinc.com\"]},{\"name\":\"Digital Millennium Copyright Act Services\",\"category\":\"utility\",\"domains\":[\"*.dmca.com\"],\"totalExecutionTime\":8702,\"totalOccurrences\":75},{\"name\":\"Digital Ocean\",\"category\":\"other\",\"domains\":[\"95.85.62.56\"]},{\"name\":\"Digital Remedy\",\"category\":\"ad\",\"domains\":[\"*.consumedmedia.com\"]},{\"name\":\"Digital Window\",\"category\":\"ad\",\"domains\":[\"*.awin1.com\",\"*.zenaps.com\"],\"totalExecutionTime\":92,\"totalOccurrences\":3},{\"name\":\"DigitalScirocco\",\"category\":\"analytics\",\"domains\":[\"*.digitalscirocco.net\"]},{\"name\":\"Digitial Point\",\"category\":\"utility\",\"domains\":[\"*.dpstatic.com\"]},{\"name\":\"Diligent (Adnetik)\",\"category\":\"ad\",\"domains\":[\"*.wtp101.com\"]},{\"name\":\"Directed Edge\",\"category\":\"social\",\"domains\":[\"*.directededge.com\"],\"examples\":[\"shopify.directededge.com\"],\"totalExecutionTime\":2372,\"totalOccurrences\":35},{\"name\":\"Distribute Travel\",\"category\":\"ad\",\"domains\":[\"*.dtrck.net\"]},{\"name\":\"District M\",\"category\":\"ad\",\"domains\":[\"*.districtm.io\"]},{\"name\":\"DistroScale\",\"category\":\"ad\",\"domains\":[\"*.jsrdn.com\"],\"totalExecutionTime\":192484,\"totalOccurrences\":235},{\"name\":\"Divido\",\"category\":\"utility\",\"domains\":[\"*.divido.com\"]},{\"name\":\"Dow Jones\",\"category\":\"content\",\"domains\":[\"*.dowjones.com\",\"*.dowjoneson.com\"],\"totalExecutionTime\":2441,\"totalOccurrences\":2},{\"name\":\"Drifty Co\",\"category\":\"utility\",\"domains\":[\"*.onicframework.com\"]},{\"name\":\"Drip\",\"company\":\"The Numa Group\",\"category\":\"ad\",\"domains\":[\"*.getdrip.com\"],\"totalExecutionTime\":111802,\"totalOccurrences\":1460},{\"name\":\"Dropbox\",\"category\":\"utility\",\"domains\":[\"*.dropboxusercontent.com\"],\"totalExecutionTime\":84131,\"totalOccurrences\":124},{\"name\":\"Dyn Real User Monitoring\",\"company\":\"Dyn\",\"category\":\"analytics\",\"domains\":[\"*.jisusaiche.biz\",\"*.dynapis.com\",\"*.jisusaiche.com\",\"*.dynapis.info\"],\"examples\":[\"beacon.rum.dynapis.com\"]},{\"name\":\"DynAdmic\",\"category\":\"ad\",\"domains\":[\"*.dyntrk.com\"]},{\"name\":\"Dynamic Converter\",\"category\":\"utility\",\"domains\":[\"*.dynamicconverter.com\"],\"totalExecutionTime\":40375,\"totalOccurrences\":89},{\"name\":\"Dynamic Dummy Image Generator\",\"company\":\"Open Source\",\"category\":\"utility\",\"domains\":[\"*.dummyimage.com\"]},{\"name\":\"Dynamic Logic\",\"category\":\"ad\",\"domains\":[\"*.dl-rms.com\",\"*.questionmarket.com\"]},{\"name\":\"Dynamic Yield\",\"category\":\"customer-success\",\"domains\":[\"*.dynamicyield.com\"],\"totalExecutionTime\":2824349,\"totalOccurrences\":1799},{\"name\":\"Dynatrace\",\"category\":\"analytics\",\"domains\":[\"*.ruxit.com\",\"js-cdn.dynatrace.com\"],\"totalExecutionTime\":1747247,\"totalOccurrences\":1355},{\"name\":\"ec-concier\",\"homepage\":\"https://ec-concier.com/\",\"category\":\"marketing\",\"domains\":[\"*.ec-concier.com\"],\"examples\":[\"s.ec-concier.com\",\"gsync.ec-concier.com\"]},{\"name\":\"ECT News Network\",\"category\":\"content\",\"domains\":[\"*.ectnews.com\"]},{\"name\":\"ELITechGroup\",\"category\":\"analytics\",\"domains\":[\"*.elitechnology.com\"]},{\"name\":\"EMAP\",\"category\":\"content\",\"domains\":[\"*.emap.com\"]},{\"name\":\"EMedia Solutions\",\"category\":\"ad\",\"domains\":[\"*.e-shots.eu\"],\"examples\":[\"www.e-shots.eu\"]},{\"name\":\"EQ works\",\"category\":\"ad\",\"domains\":[\"*.eqads.com\"]},{\"name\":\"ESV Digital\",\"category\":\"analytics\",\"domains\":[\"*.esearchvision.com\"]},{\"name\":\"Ebiquity\",\"category\":\"analytics\",\"domains\":[\"*.ebiquitymedia.com\"]},{\"name\":\"Eco Rebates\",\"category\":\"ad\",\"domains\":[\"*.ecorebates.com\"]},{\"name\":\"Ecwid\",\"category\":\"hosting\",\"domains\":[\"*.ecwid.com\",\"*.shopsettings.com\",\"d3fi9i0jj23cau.cloudfront.net\",\"d3j0zfs7paavns.cloudfront.net\"],\"totalExecutionTime\":917711,\"totalOccurrences\":3409},{\"name\":\"Edge Web Fonts\",\"company\":\"Adobe Systems\",\"category\":\"cdn\",\"domains\":[\"*.edgefonts.net\"],\"examples\":[\"use.edgefonts.net\"]},{\"name\":\"Edition Digital\",\"category\":\"ad\",\"domains\":[\"*.editiondigital.com\"]},{\"name\":\"Edot Web Technologies\",\"category\":\"hosting\",\"domains\":[\"*.edot.co.za\"]},{\"name\":\"Effective Measure\",\"category\":\"ad\",\"domains\":[\"*.effectivemeasure.net\"]},{\"name\":\"Effiliation sa\",\"category\":\"ad\",\"domains\":[\"*.effiliation.com\"],\"totalExecutionTime\":70,\"totalOccurrences\":1},{\"name\":\"Ekm Systems\",\"category\":\"analytics\",\"domains\":[\"*.ekmsecure.com\",\"*.ekmpinpoint.co.uk\"],\"examples\":[\"globalstats.ekmsecure.com\"],\"totalExecutionTime\":57121,\"totalOccurrences\":580},{\"name\":\"Elastera\",\"category\":\"hosting\",\"domains\":[\"*.elastera.net\"]},{\"name\":\"Elastic Ad\",\"category\":\"ad\",\"domains\":[\"*.elasticad.net\"],\"totalExecutionTime\":14451,\"totalOccurrences\":77},{\"name\":\"Elastic Load Balancing\",\"company\":\"Amazon Web Services\",\"category\":\"hosting\",\"domains\":[\"*.105app.com\"],\"examples\":[\"rhpury.105app.com\",\"rhxtd.105app.com\"]},{\"name\":\"Elecard StreamEye\",\"company\":\"Elecard\",\"category\":\"other\",\"domains\":[\"*.streameye.net\"]},{\"name\":\"Elevate\",\"company\":\"Elevate Technology Solutions\",\"category\":\"utility\",\"domains\":[\"*.elevaate.technology\"]},{\"name\":\"Elicit\",\"category\":\"utility\",\"domains\":[\"*.elicitapp.com\"]},{\"name\":\"Elogia\",\"category\":\"ad\",\"domains\":[\"*.elogia.net\"]},{\"name\":\"Email Attitude\",\"company\":\"1000mercis\",\"category\":\"ad\",\"domains\":[\"*.email-attitude.com\"]},{\"name\":\"EmailCenter\",\"category\":\"ad\",\"domains\":[\"*.emailcenteruk.com\"]},{\"name\":\"Embedly\",\"category\":\"content\",\"domains\":[\"*.embedly.com\",\"*.embed.ly\"],\"totalExecutionTime\":4160802,\"totalOccurrences\":10490},{\"name\":\"EmpathyBroker Site Search\",\"company\":\"EmpathyBroker\",\"category\":\"utility\",\"domains\":[\"*.empathybroker.com\"]},{\"name\":\"Enfusen\",\"category\":\"analytics\",\"domains\":[\"*.enfusen.com\"]},{\"name\":\"Engadget\",\"company\":\"Engadget (AOL)\",\"category\":\"content\",\"domains\":[\"*.gdgt.com\"],\"examples\":[\"media.gdgt.com\"]},{\"name\":\"Engagio\",\"category\":\"marketing\",\"domains\":[\"*.engagio.com\"]},{\"name\":\"Ensighten Manage\",\"company\":\"Ensighten\",\"category\":\"tag-manager\",\"domains\":[\"*.levexis.com\"]},{\"name\":\"EntityLink\",\"category\":\"other\",\"domains\":[\"*.entitytag.co.uk\"]},{\"name\":\"Entrust Datacard\",\"category\":\"utility\",\"domains\":[\"*.entrust.com\",\"*.entrust.net\"],\"examples\":[\"ocsp.entrust.com\",\"ocsp.entrust.net\"],\"totalExecutionTime\":33597,\"totalOccurrences\":5},{\"name\":\"Equiniti\",\"category\":\"utility\",\"domains\":[\"*.equiniti.com\"]},{\"name\":\"Errorception\",\"category\":\"utility\",\"domains\":[\"*.errorception.com\"]},{\"name\":\"Esri ArcGIS\",\"company\":\"Esri\",\"category\":\"utility\",\"domains\":[\"*.arcgis.com\",\"*.arcgisonline.com\"],\"totalExecutionTime\":30850871,\"totalOccurrences\":4361},{\"name\":\"Ethnio\",\"category\":\"analytics\",\"domains\":[\"*.ethn.io\"]},{\"name\":\"Eulerian Technologies\",\"category\":\"ad\",\"domains\":[\"*.eolcdn.com\"]},{\"name\":\"Euroland\",\"category\":\"utility\",\"domains\":[\"*.euroland.com\"],\"totalExecutionTime\":90921,\"totalOccurrences\":49},{\"name\":\"European Interactive Digital ad Alli\",\"category\":\"utility\",\"domains\":[\"*.edaa.eu\"]},{\"name\":\"Eventbrite\",\"category\":\"hosting\",\"domains\":[\"*.evbuc.com\",\"*.eventbrite.co.uk\"],\"totalExecutionTime\":3188,\"totalOccurrences\":28},{\"name\":\"Everflow\",\"category\":\"analytics\",\"domains\":[\"*.tp88trk.com\"],\"examples\":[\"www.tp88trk.com\"],\"totalExecutionTime\":92226,\"totalOccurrences\":159},{\"name\":\"Evergage\",\"category\":\"analytics\",\"domains\":[\"*.evergage.com\",\"*.evgnet.com\"],\"examples\":[\"cdn.evgnet.com\"],\"totalExecutionTime\":1076466,\"totalOccurrences\":2947},{\"name\":\"Everquote\",\"category\":\"content\",\"domains\":[\"*.evq1.com\"]},{\"name\":\"Everyday Health\",\"category\":\"ad\",\"domains\":[\"*.agoramedia.com\"]},{\"name\":\"Evidon\",\"category\":\"analytics\",\"domains\":[\"*.evidon.com\"],\"totalExecutionTime\":1512945,\"totalOccurrences\":2355},{\"name\":\"Evolve Media\",\"category\":\"content\",\"domains\":[\"*.evolvemediallc.com\"]},{\"name\":\"Exactag\",\"category\":\"ad\",\"domains\":[\"*.exactag.com\"],\"totalExecutionTime\":1695,\"totalOccurrences\":11},{\"name\":\"ExoClick\",\"category\":\"ad\",\"domains\":[\"*.exoclick.com\"],\"totalExecutionTime\":43116,\"totalOccurrences\":403},{\"name\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.travel-assets.com\",\"*.trvl-media.com\",\"*.trvl-px.com\",\"*.uciservice.com\"],\"examples\":[\"www.trvl-px.com\",\"www.uciservice.com\"],\"totalExecutionTime\":166039,\"totalOccurrences\":138},{\"name\":\"Expedia Australia\",\"company\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.expedia.com.au\"],\"examples\":[\"www.expedia.com.au\"]},{\"name\":\"Expedia Canada\",\"company\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.expedia.ca\"],\"examples\":[\"www.expedia.ca\"]},{\"name\":\"Expedia France\",\"company\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.expedia.fr\"],\"examples\":[\"www.expedia.fr\"]},{\"name\":\"Expedia Germany\",\"company\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.expedia.de\"],\"examples\":[\"www.expedia.de\"]},{\"name\":\"Expedia Italy\",\"company\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.expedia.it\"],\"examples\":[\"www.expedia.it\"]},{\"name\":\"Expedia Japan\",\"company\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.expedia.co.jp\"],\"examples\":[\"www.expedia.co.jp\"]},{\"name\":\"Expedia USA\",\"company\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.expedia.com\"],\"examples\":[\"www.expedia.com\"],\"totalExecutionTime\":25413,\"totalOccurrences\":18},{\"name\":\"Expedia United Kingdom\",\"company\":\"Expedia\",\"category\":\"content\",\"domains\":[\"*.expedia.co.uk\"],\"examples\":[\"www.expedia.co.uk\"]},{\"name\":\"Experian\",\"category\":\"utility\",\"domains\":[\"*.audienceiq.com\",\"*.experian.com\",\"*.experianmarketingservices.digital\"]},{\"name\":\"Experian Cross-Channel Marketing Platform\",\"company\":\"Experian\",\"category\":\"marketing\",\"domains\":[\"*.eccmp.com\",\"*.ccmp.eu\"],\"totalExecutionTime\":564,\"totalOccurrences\":10},{\"name\":\"Exponea\",\"category\":\"analytics\",\"domains\":[\"*.exponea.com\"],\"totalExecutionTime\":108573,\"totalOccurrences\":1254},{\"name\":\"Exponential Interactive\",\"category\":\"ad\",\"domains\":[\"*.exponential.com\"],\"totalExecutionTime\":4862,\"totalOccurrences\":116},{\"name\":\"Extensis WebInk\",\"category\":\"cdn\",\"domains\":[\"*.webink.com\"]},{\"name\":\"Extole\",\"category\":\"ad\",\"domains\":[\"*.extole.com\",\"*.extole.io\"],\"examples\":[\"origin.extole.io\"],\"totalExecutionTime\":13504,\"totalOccurrences\":40},{\"name\":\"Ey-Seren\",\"category\":\"analytics\",\"domains\":[\"*.webabacus.com\"]},{\"name\":\"EyeView\",\"category\":\"ad\",\"domains\":[\"*.eyeviewads.com\"]},{\"name\":\"Eyeota\",\"category\":\"ad\",\"domains\":[\"*.eyeota.net\"],\"totalExecutionTime\":110026,\"totalOccurrences\":1448},{\"name\":\"Ezakus Pretargeting\",\"company\":\"Ezakus\",\"category\":\"ad\",\"domains\":[\"*.ezakus.net\"]},{\"name\":\"Ezoic\",\"category\":\"analytics\",\"domains\":[\"*.ezoic.net\"],\"totalExecutionTime\":299804,\"totalOccurrences\":736},{\"name\":\"FLXone\",\"company\":\"Teradata\",\"category\":\"ad\",\"domains\":[\"*.pangolin.blue\",\"*.flx1.com\",\"d2hlpp31teaww3.cloudfront.net\",\"*.flxpxl.com\"]},{\"name\":\"Fairfax Media\",\"category\":\"content\",\"domains\":[\"ads.fairfax.com.au\",\"resources.fairfax.com.au\"]},{\"name\":\"Fairfax Media Analtics\",\"company\":\"Fairfax Media\",\"category\":\"analytics\",\"domains\":[\"analytics.fairfax.com.au\"]},{\"name\":\"Falk Technologies\",\"category\":\"ad\",\"domains\":[\"*.angsrvr.com\"]},{\"name\":\"Fanplayr\",\"category\":\"analytics\",\"domains\":[\"*.fanplayr.com\",\"d38nbbai6u794i.cloudfront.net\"],\"totalExecutionTime\":64614,\"totalOccurrences\":144},{\"name\":\"Fast Thinking\",\"company\":\"NE Marketing\",\"category\":\"marketing\",\"domains\":[\"*.fast-thinking.co.uk\"]},{\"name\":\"Fastest Forward\",\"category\":\"analytics\",\"domains\":[\"*.gaug.es\"],\"totalExecutionTime\":7631,\"totalOccurrences\":189},{\"name\":\"Fastly\",\"category\":\"utility\",\"domains\":[\"*.fastly.net\"],\"totalExecutionTime\":3648740,\"totalOccurrences\":2790},{\"name\":\"Feedbackify\",\"company\":\"InsideMetrics\",\"category\":\"analytics\",\"domains\":[\"*.feedbackify.com\"],\"totalExecutionTime\":36326,\"totalOccurrences\":163},{\"name\":\"Feefo.com\",\"company\":\"Feefo\",\"category\":\"analytics\",\"domains\":[\"*.feefo.com\"],\"totalExecutionTime\":1121482,\"totalOccurrences\":1968},{\"name\":\"Fidelity Media\",\"category\":\"ad\",\"domains\":[\"*.fidelity-media.com\"],\"examples\":[\"x.fidelity-media.com\"]},{\"name\":\"Filestack\",\"category\":\"content\",\"domains\":[\"*.filepicker.io\"],\"examples\":[\"api.filepicker.io\",\"dialog.filepicker.io\",\"www.filepicker.io\"],\"totalExecutionTime\":23946,\"totalOccurrences\":167},{\"name\":\"Finsbury Media\",\"category\":\"ad\",\"domains\":[\"*.finsburymedia.com\"],\"totalExecutionTime\":1075,\"totalOccurrences\":9},{\"name\":\"Firepush\",\"category\":\"utility\",\"domains\":[\"*.firepush.io\"]},{\"name\":\"FirstImpression\",\"category\":\"ad\",\"domains\":[\"*.firstimpression.io\"],\"totalExecutionTime\":140951,\"totalOccurrences\":106},{\"name\":\"Fit Analytics\",\"category\":\"other\",\"domains\":[\"*.fitanalytics.com\"],\"examples\":[\"integrations.fitanalytics.com\",\"widget.fitanalytics.com\",\"metrics.fitanalytics.com\"]},{\"name\":\"Fits Me\",\"category\":\"analytics\",\"domains\":[\"*.fits.me\"]},{\"name\":\"Fivetran\",\"category\":\"analytics\",\"domains\":[\"*.fivetran.com\"],\"totalExecutionTime\":1145,\"totalOccurrences\":3},{\"name\":\"FlexShopper\",\"category\":\"utility\",\"domains\":[\"*.flexshopper.com\"]},{\"name\":\"Flickr\",\"category\":\"content\",\"domains\":[\"*.flickr.com\",\"*.staticflickr.com\"],\"totalExecutionTime\":156130,\"totalOccurrences\":339},{\"name\":\"Flipboard\",\"category\":\"social\",\"domains\":[\"*.flipboard.com\"],\"totalExecutionTime\":46212,\"totalOccurrences\":58},{\"name\":\"Flipdesk\",\"category\":\"customer-success\",\"homepage\":\"https://flipdesk.jp/\",\"domains\":[\"*.flipdesk.jp\"],\"examples\":[\"api.flipdesk.jp\"],\"totalExecutionTime\":297942,\"totalOccurrences\":417},{\"name\":\"Flipp\",\"category\":\"analytics\",\"domains\":[\"*.wishabi.com\",\"d2e0sxz09bo7k2.cloudfront.net\",\"*.wishabi.net\"]},{\"name\":\"Flite\",\"category\":\"ad\",\"domains\":[\"*.flite.com\"]},{\"name\":\"Flixmedia\",\"category\":\"analytics\",\"domains\":[\"*.flix360.com\",\"*.flixcar.com\",\"*.flixfacts.com\",\"*.flixsyndication.net\",\"*.flixfacts.co.uk\"],\"totalExecutionTime\":31082,\"totalOccurrences\":45},{\"name\":\"Flockler\",\"category\":\"ad\",\"domains\":[\"*.flockler.com\"],\"totalExecutionTime\":472336,\"totalOccurrences\":1314},{\"name\":\"Flowplayer\",\"category\":\"content\",\"domains\":[\"*.flowplayer.org\"],\"totalExecutionTime\":152674,\"totalOccurrences\":819},{\"name\":\"Flowzymes Ky\",\"category\":\"cdn\",\"domains\":[\"*.jquerytools.org\"]},{\"name\":\"Fomo\",\"category\":\"ad\",\"domains\":[\"*.notifyapp.io\"]},{\"name\":\"Fonecall\",\"category\":\"analytics\",\"domains\":[\"*.web-call-analytics.com\"]},{\"name\":\"Fontdeck\",\"category\":\"cdn\",\"domains\":[\"*.fontdeck.com\"]},{\"name\":\"Foodity Technologies\",\"category\":\"ad\",\"domains\":[\"*.foodity.com\"]},{\"name\":\"Force24\",\"category\":\"ad\",\"domains\":[\"*.force24.co.uk\"],\"totalExecutionTime\":7050,\"totalOccurrences\":72},{\"name\":\"ForeSee\",\"company\":\"Answers\",\"category\":\"analytics\",\"domains\":[\"*.4seeresults.com\",\"*.answerscloud.com\",\"*.foresee.com\",\"*.foreseeresults.com\"],\"totalExecutionTime\":85019,\"totalOccurrences\":208},{\"name\":\"Forensiq\",\"category\":\"utility\",\"domains\":[\"*.fqtag.com\"],\"totalExecutionTime\":16537,\"totalOccurrences\":146},{\"name\":\"Fort Awesome\",\"category\":\"cdn\",\"domains\":[\"*.fortawesome.com\"],\"totalExecutionTime\":609656,\"totalOccurrences\":3657},{\"name\":\"Forter\",\"category\":\"utility\",\"domains\":[\"*.forter.com\"],\"totalExecutionTime\":1678360,\"totalOccurrences\":2639},{\"name\":\"Forward Internet Group\",\"category\":\"hosting\",\"domains\":[\"*.f3d.io\"]},{\"name\":\"Forward3D\",\"category\":\"ad\",\"domains\":[\"*.forward3d.com\"]},{\"name\":\"Fospha\",\"category\":\"analytics\",\"domains\":[\"*.fospha.com\"],\"examples\":[\"router.fospha.com\"]},{\"name\":\"Foursixty\",\"category\":\"customer-success\",\"domains\":[\"*.foursixty.com\"]},{\"name\":\"FoxyCart\",\"category\":\"utility\",\"domains\":[\"*.foxycart.com\"],\"totalExecutionTime\":338786,\"totalOccurrences\":652},{\"name\":\"Framer CDN\",\"company\":\"Framer\",\"homepage\":\"https://www.framer.com\",\"category\":\"hosting\",\"domains\":[\"framerusercontent.com\",\"*.framerstatic.com\",\"events.framer.com\",\"framer.com\"],\"examples\":[\"app.framerstatic.com\",\"framer.com/edit\"],\"totalExecutionTime\":108740719,\"totalOccurrences\":11994},{\"name\":\"Fraudlogix\",\"category\":\"utility\",\"domains\":[\"*.yabidos.com\"],\"totalExecutionTime\":65535,\"totalOccurrences\":433},{\"name\":\"FreakOut\",\"category\":\"ad\",\"domains\":[\"*.fout.jp\"],\"totalExecutionTime\":74831,\"totalOccurrences\":1676},{\"name\":\"Freespee\",\"category\":\"customer-success\",\"domains\":[\"*.freespee.com\"],\"examples\":[\"analytics.freespee.com\"],\"totalExecutionTime\":54576,\"totalOccurrences\":478},{\"name\":\"Freetobook\",\"category\":\"content\",\"domains\":[\"*.freetobook.com\"],\"examples\":[\"www.freetobook.com\"],\"totalExecutionTime\":244349,\"totalOccurrences\":586},{\"name\":\"Fresh 8 Gaming\",\"category\":\"ad\",\"domains\":[\"*.fresh8.co\"],\"totalExecutionTime\":275447,\"totalOccurrences\":91},{\"name\":\"Fresh Relevance\",\"category\":\"analytics\",\"domains\":[\"*.freshrelevance.com\",\"*.cloudfront.ne\",\"d1y9qtn9cuc3xw.cloudfront.net\",\"d81mfvml8p5ml.cloudfront.net\",\"dkpklk99llpj0.cloudfront.net\"],\"examples\":[\"d1y9qtn9cuc3xw.cloudfront.ne\"],\"totalExecutionTime\":67876,\"totalOccurrences\":276},{\"name\":\"Friendbuy\",\"category\":\"ad\",\"domains\":[\"*.friendbuy.com\",\"djnf6e5yyirys.cloudfront.net\"],\"totalExecutionTime\":15649,\"totalOccurrences\":128},{\"name\":\"Frienefit\",\"category\":\"ad\",\"domains\":[\"*.frienefit.com\"]},{\"name\":\"FuelX\",\"category\":\"ad\",\"domains\":[\"*.fuelx.com\"]},{\"name\":\"Full Circle Studies\",\"category\":\"analytics\",\"domains\":[\"*.securestudies.com\"]},{\"name\":\"FullStory\",\"category\":\"analytics\",\"domains\":[\"*.fullstory.com\"],\"examples\":[\"rs.fullstory.com\"],\"totalExecutionTime\":12019832,\"totalOccurrences\":13153},{\"name\":\"Fyber\",\"category\":\"ad\",\"domains\":[\"*.fyber.com\"]},{\"name\":\"G-Forces Web Management\",\"category\":\"hosting\",\"domains\":[\"*.gforcesinternal.co.uk\"]},{\"name\":\"G4 Native\",\"company\":\"Gravity4\",\"category\":\"ad\",\"domains\":[\"*.triggit.com\"]},{\"name\":\"GET ME IN!  (TicketMaster)\",\"category\":\"content\",\"domains\":[\"*.getmein.com\"]},{\"name\":\"GIPHY\",\"category\":\"content\",\"domains\":[\"*.giphy.com\"],\"totalExecutionTime\":6355,\"totalOccurrences\":5},{\"name\":\"GainCloud\",\"company\":\"GainCloud Systems\",\"category\":\"other\",\"domains\":[\"*.egaincloud.net\"]},{\"name\":\"Gath Adams\",\"category\":\"content\",\"domains\":[\"*.iwantthatflight.com.au\"]},{\"name\":\"Gecko Tribe\",\"category\":\"social\",\"domains\":[\"*.geckotribe.com\"]},{\"name\":\"Gemius\",\"category\":\"ad\",\"domains\":[\"*.gemius.pl\"],\"totalExecutionTime\":3008436,\"totalOccurrences\":15527},{\"name\":\"Genesis Media\",\"category\":\"ad\",\"domains\":[\"*.bzgint.com\",\"*.genesismedia.com\",\"*.genesismediaus.com\"]},{\"name\":\"Genie Ventures\",\"category\":\"ad\",\"domains\":[\"*.genieventures.co.uk\"]},{\"name\":\"Geniee\",\"category\":\"ad\",\"domains\":[\"*.href.asia\",\"*.genieessp.jp\",\"*.genieesspv.jp\",\"*.gssprt.jp\"],\"examples\":[\"cs.gssprt.jp\"],\"totalExecutionTime\":9149492,\"totalOccurrences\":9734},{\"name\":\"Geniuslink\",\"category\":\"analytics\",\"domains\":[\"*.geni.us\"],\"totalExecutionTime\":939,\"totalOccurrences\":3},{\"name\":\"GeoRiot\",\"category\":\"other\",\"domains\":[\"*.georiot.com\"]},{\"name\":\"GeoTrust\",\"category\":\"utility\",\"domains\":[\"*.geotrust.com\"],\"totalExecutionTime\":5171,\"totalOccurrences\":1},{\"name\":\"Geoplugin\",\"category\":\"utility\",\"domains\":[\"*.geoplugin.com\",\"*.geoplugin.net\"],\"totalExecutionTime\":303,\"totalOccurrences\":2},{\"name\":\"Georeferencer\",\"company\":\"Klokan Technologies\",\"category\":\"utility\",\"domains\":[\"*.georeferencer.com\"]},{\"name\":\"GetIntent RTBSuite\",\"company\":\"GetIntent\",\"category\":\"ad\",\"domains\":[\"*.adhigh.net\"],\"totalExecutionTime\":937,\"totalOccurrences\":274},{\"name\":\"GetResponse\",\"category\":\"ad\",\"domains\":[\"*.getresponse.com\"],\"totalExecutionTime\":177665,\"totalOccurrences\":871},{\"name\":\"GetSiteControl\",\"company\":\"GetWebCraft\",\"category\":\"utility\",\"domains\":[\"*.getsitecontrol.com\"],\"totalExecutionTime\":1632212,\"totalOccurrences\":3080},{\"name\":\"GetSocial\",\"category\":\"social\",\"domains\":[\"*.getsocial.io\"],\"totalExecutionTime\":1615,\"totalOccurrences\":20},{\"name\":\"Getty Images\",\"category\":\"content\",\"domains\":[\"*.gettyimages.com\",\"*.gettyimages.co.uk\"],\"examples\":[\"www.gettyimages.com\"],\"totalExecutionTime\":15383,\"totalOccurrences\":43},{\"name\":\"Gfycat\",\"company\":\"Gycat\",\"category\":\"utility\",\"domains\":[\"*.gfycat.com\"]},{\"name\":\"Ghostery Enterprise\",\"company\":\"Ghostery\",\"category\":\"marketing\",\"domains\":[\"*.betrad.com\"],\"totalExecutionTime\":4658,\"totalOccurrences\":12},{\"name\":\"Giant Media\",\"category\":\"ad\",\"domains\":[\"*.videostat.com\"]},{\"name\":\"Gigya\",\"category\":\"analytics\",\"domains\":[\"*.gigya.com\"],\"totalExecutionTime\":2006710,\"totalOccurrences\":1955},{\"name\":\"GitHub\",\"category\":\"utility\",\"domains\":[\"*.github.com\",\"*.githubusercontent.com\",\"*.github.io\",\"*.rawgit.com\"],\"examples\":[\"raw.githubusercontent.com\",\"cdn.rawgit.com\"],\"totalExecutionTime\":7395419,\"totalOccurrences\":14958},{\"name\":\"Gladly\",\"company\":\"Gladly\",\"homepage\":\"https://www.gladly.com/\",\"category\":\"customer-success\",\"domains\":[\"*.gladly.com\"],\"examples\":[\"cdn.gladly.com\"],\"totalExecutionTime\":277832,\"totalOccurrences\":507},{\"name\":\"Glassdoor\",\"category\":\"content\",\"domains\":[\"*.glassdoor.com\"],\"totalExecutionTime\":93680,\"totalOccurrences\":18},{\"name\":\"Gleam\",\"category\":\"marketing\",\"domains\":[\"*.gleam.io\"],\"totalExecutionTime\":40428,\"totalOccurrences\":196},{\"name\":\"Global Digital Markets\",\"category\":\"ad\",\"domains\":[\"*.gdmdigital.com\"]},{\"name\":\"Global-e\",\"category\":\"hosting\",\"domains\":[\"*.global-e.com\"],\"totalExecutionTime\":717696,\"totalOccurrences\":1366},{\"name\":\"GlobalSign\",\"category\":\"utility\",\"domains\":[\"*.globalsign.com\",\"*.globalsign.net\"],\"totalExecutionTime\":10040,\"totalOccurrences\":41},{\"name\":\"GlobalWebIndex\",\"category\":\"analytics\",\"domains\":[\"*.globalwebindex.net\"]},{\"name\":\"Globase International\",\"category\":\"ad\",\"domains\":[\"*.globase.com\"]},{\"name\":\"GoDataFeed\",\"category\":\"other\",\"domains\":[\"*.godatafeed.com\"]},{\"name\":\"Google APIs\",\"company\":\"Google\",\"category\":\"utility\",\"domains\":[\"googleapis.com\"]},{\"name\":\"Google Ad Block Detection\",\"company\":\"Google\",\"category\":\"ad\",\"domains\":[\"*.0emn.com\",\"*.0fmm.com\"]},{\"name\":\"Google Analytics Experiments\",\"company\":\"Google\",\"category\":\"analytics\",\"domains\":[\"*.gexperiments1.com\"]},{\"name\":\"Google DoubleClick Ad Exchange\",\"company\":\"Google\",\"category\":\"ad\",\"domains\":[\"*.admeld.com\"]},{\"name\":\"Google IPV6 Metrics\",\"company\":\"Google\",\"category\":\"analytics\",\"domains\":[\"*.ipv6test.net\"]},{\"name\":\"Google Plus\",\"company\":\"Google\",\"category\":\"social\",\"domains\":[\"plus.google.com\"],\"totalExecutionTime\":38150,\"totalOccurrences\":377},{\"name\":\"Google Trusted Stores\",\"company\":\"Google\",\"category\":\"utility\",\"domains\":[\"*.googlecommerce.com\"]},{\"name\":\"Google Video\",\"company\":\"Google\",\"category\":\"content\",\"domains\":[\"*.googlevideo.com\"],\"totalExecutionTime\":1,\"totalOccurrences\":3},{\"name\":\"Google reCAPTCHA\",\"company\":\"Google\",\"category\":\"utility\",\"domains\":[\"*.recaptcha.net\"],\"examples\":[\"api.recaptcha.net\"],\"totalExecutionTime\":14910807,\"totalOccurrences\":34378},{\"name\":\"GovMetric\",\"company\":\"ROL Solutions\",\"category\":\"analytics\",\"domains\":[\"*.govmetric.com\"],\"totalExecutionTime\":510,\"totalOccurrences\":6},{\"name\":\"Granify\",\"category\":\"analytics\",\"domains\":[\"*.granify.com\"],\"totalExecutionTime\":16573,\"totalOccurrences\":24},{\"name\":\"Grapeshot\",\"category\":\"ad\",\"domains\":[\"*.gscontxt.net\",\"*.grapeshot.co.uk\"]},{\"name\":\"Gravity (AOL)\",\"category\":\"analytics\",\"domains\":[\"*.grvcdn.com\"]},{\"name\":\"Groovy Gecko\",\"category\":\"content\",\"domains\":[\"*.ggwebcast.com\",\"*.groovygecko.net\"]},{\"name\":\"GroupM\",\"category\":\"ad\",\"domains\":[\"*.qservz.com\"]},{\"name\":\"Guardian Media\",\"category\":\"ad\",\"domains\":[\"*.theguardian.com\",\"*.guardian.co.uk\"],\"examples\":[\"oas.theguardian.com\"]},{\"name\":\"GumGum\",\"category\":\"ad\",\"domains\":[\"*.gumgum.com\"],\"totalExecutionTime\":3322524,\"totalOccurrences\":48208},{\"name\":\"Gumtree\",\"category\":\"content\",\"domains\":[\"*.gumtree.com\"]},{\"name\":\"H264 Codec\",\"company\":\"Cisco\",\"category\":\"other\",\"domains\":[\"*.openh264.org\"]},{\"name\":\"HERE\",\"category\":\"analytics\",\"domains\":[\"*.medio.com\"]},{\"name\":\"HP Optimost\",\"company\":\"Hewlett-Packard Development Company\",\"category\":\"marketing\",\"domains\":[\"*.hp.com\",\"d2uncb19xzxhzx.cloudfront.net\"],\"examples\":[\"by.marketinghub.hp.com\",\"marketinghub.hp.com\"],\"totalExecutionTime\":315671,\"totalOccurrences\":101},{\"name\":\"Has Offers\",\"company\":\"TUNE\",\"category\":\"ad\",\"domains\":[\"*.go2cloud.org\"],\"totalExecutionTime\":2,\"totalOccurrences\":14},{\"name\":\"Hawk Search\",\"category\":\"utility\",\"domains\":[\"*.hawksearch.com\"],\"totalExecutionTime\":12168,\"totalOccurrences\":112},{\"name\":\"Haymarket Media Group\",\"category\":\"content\",\"domains\":[\"*.brandrepublic.com\",\"*.hbpl.co.uk\"]},{\"name\":\"Heap\",\"category\":\"analytics\",\"domains\":[\"*.heapanalytics.com\"],\"totalExecutionTime\":2693108,\"totalOccurrences\":11100},{\"name\":\"Hearst Communications\",\"category\":\"content\",\"domains\":[\"*.h-cdn.co\",\"*.hearstdigital.com\",\"*.hearstlabs.com\",\"*.hearst.io\",\"*.cdnds.net\"]},{\"name\":\"Heatmap\",\"category\":\"analytics\",\"domains\":[\"*.heatmap.it\"],\"totalExecutionTime\":2972,\"totalOccurrences\":54},{\"name\":\"Heroku\",\"category\":\"other\",\"domains\":[\"*.herokuapp.com\"],\"totalExecutionTime\":8087084,\"totalOccurrences\":10222},{\"name\":\"Hexton\",\"category\":\"utility\",\"domains\":[\"*.hextom.com\"],\"totalExecutionTime\":9360868,\"totalOccurrences\":25983},{\"name\":\"Hibernia Networks\",\"category\":\"utility\",\"domains\":[\"*.hiberniacdn.com\"]},{\"name\":\"High Impact Media\",\"category\":\"ad\",\"domains\":[\"*.reactx.com\"]},{\"name\":\"Highcharts\",\"category\":\"utility\",\"domains\":[\"*.highcharts.com\"],\"totalExecutionTime\":1424311,\"totalOccurrences\":3738},{\"name\":\"Highwinds\",\"category\":\"utility\",\"domains\":[\"*.hwcdn.net\"],\"totalExecutionTime\":349,\"totalOccurrences\":2},{\"name\":\"HitsLink\",\"category\":\"analytics\",\"domains\":[\"*.hitslink.com\"],\"totalExecutionTime\":497,\"totalOccurrences\":11},{\"name\":\"Hola Networks\",\"category\":\"other\",\"domains\":[\"*.h-cdn.com\"],\"totalExecutionTime\":66139,\"totalOccurrences\":48},{\"name\":\"Hootsuite\",\"category\":\"analytics\",\"domains\":[\"*.hootsuite.com\"]},{\"name\":\"HotUKDeals\",\"category\":\"analytics\",\"domains\":[\"*.hotukdeals.com\"]},{\"name\":\"HotWords\",\"company\":\"Media Response Group\",\"category\":\"ad\",\"domains\":[\"*.hotwords.com.br\"]},{\"name\":\"HotelsCombined\",\"category\":\"content\",\"domains\":[\"*.datahc.com\"],\"totalExecutionTime\":475,\"totalOccurrences\":8},{\"name\":\"Hoverr\",\"category\":\"ad\",\"domains\":[\"*.hoverr.media\"]},{\"name\":\"Hull.js\",\"category\":\"utility\",\"domains\":[\"*.hull.io\",\"*.hullapp.io\"]},{\"name\":\"Hupso Website Analyzer\",\"company\":\"Hupso\",\"category\":\"analytics\",\"domains\":[\"*.hupso.com\"],\"totalExecutionTime\":17567,\"totalOccurrences\":208},{\"name\":\"I-Behavior\",\"company\":\"WPP\",\"category\":\"ad\",\"domains\":[\"*.ib-ibi.com\"]},{\"name\":\"i-mobile\",\"company\":\"i-mobile\",\"category\":\"ad\",\"domains\":[\"*.i-mobile.co.jp\"],\"examples\":[\"ssp-sync.i-mobile.co.jp\"],\"totalExecutionTime\":1774376,\"totalOccurrences\":12536},{\"name\":\"IBM Digital Analytics\",\"company\":\"IBM\",\"category\":\"analytics\",\"domains\":[\"*.cmcore.com\",\"coremetrics.com\",\"data.coremetrics.com\",\"data.de.coremetrics.com\",\"libs.de.coremetrics.com\",\"tmscdn.de.coremetrics.com\",\"iocdn.coremetrics.com\",\"libs.coremetrics.com\",\"tmscdn.coremetrics.com\",\"*.s81c.com\",\"*.unica.com\",\"*.coremetrics.eu\"],\"examples\":[\"data.coremetrics.eu\"],\"totalExecutionTime\":77231,\"totalOccurrences\":103},{\"name\":\"IBM Digital Data Exchange\",\"company\":\"IBM\",\"category\":\"tag-manager\",\"domains\":[\"tagmanager.coremetrics.com\"]},{\"name\":\"IBM Tealeaf\",\"company\":\"IBM\",\"category\":\"analytics\",\"domains\":[\"*.ibmcloud.com\"],\"examples\":[\"uscollector.tealeaf.ibmcloud.com\"]},{\"name\":\"IBM Acoustic Campaign\",\"company\":\"IBM\",\"category\":\"analytics\",\"domains\":[\"www.sc.pages01.net\",\"www.sc.pages02.net\",\"www.sc.pages03.net\",\"www.sc.pages04.net\",\"www.sc.pages05.net\",\"www.sc.pages06.net\",\"www.sc.pages07.net\",\"www.sc.pages08.net\",\"www.sc.pages09.net\",\"www.sc.pagesA.net\"],\"examples\":[\"https://www.sc.pages01.net/lp/static/js/iMAWebCookie.js\"],\"totalExecutionTime\":32564,\"totalOccurrences\":290},{\"name\":\"ICF Technology\",\"category\":\"content\",\"domains\":[\"*.camads.net\"]},{\"name\":\"IFDNRG\",\"category\":\"hosting\",\"domains\":[\"*.ifdnrg.com\"]},{\"name\":\"IMRG\",\"category\":\"analytics\",\"domains\":[\"*.peermap.com\",\"*.imrg.org\"],\"examples\":[\"benchmarking.imrg.org\"]},{\"name\":\"IPONWEB\",\"category\":\"ad\",\"domains\":[\"*.company-target.com\",\"*.liadm.com\",\"*.iponweb.net\",\"*.p161.net\"],\"examples\":[\"pool.udsp.iponweb.net\"],\"totalExecutionTime\":11725444,\"totalOccurrences\":51964},{\"name\":\"IQ Mobile\",\"category\":\"utility\",\"domains\":[\"*.iqm.cc\"]},{\"name\":\"IS Group\",\"category\":\"hosting\",\"domains\":[\"*.creative-serving.com\"],\"totalExecutionTime\":937,\"totalOccurrences\":13},{\"name\":\"IT Dienstleistungen Tim Prinzkosky\",\"category\":\"utility\",\"domains\":[\"*.flaticons.net\"]},{\"name\":\"IXI Digital\",\"company\":\"Equifax\",\"category\":\"ad\",\"domains\":[\"*.ixiaa.com\"]},{\"name\":\"IcoMoon\",\"category\":\"cdn\",\"domains\":[\"d19ayerf5ehaab.cloudfront.net\",\"d1azc1qln24ryf.cloudfront.net\"],\"totalExecutionTime\":44232,\"totalOccurrences\":133},{\"name\":\"IdenTrust\",\"category\":\"utility\",\"domains\":[\"*.identrust.com\"]},{\"name\":\"Ido\",\"category\":\"customer-success\",\"domains\":[\"*.idio.co\"],\"totalExecutionTime\":577,\"totalOccurrences\":8},{\"name\":\"Ignition One\",\"category\":\"marketing\",\"domains\":[\"*.searchignite.com\"]},{\"name\":\"ImageShack\",\"category\":\"content\",\"domains\":[\"*.yfrog.com\"]},{\"name\":\"Imagen Studio\",\"category\":\"utility\",\"domains\":[\"*.telephonesky.com\"]},{\"name\":\"Imagini Holdings\",\"category\":\"ad\",\"domains\":[\"*.vdna-assets.com\"]},{\"name\":\"Img Safe\",\"category\":\"content\",\"domains\":[\"*.imgsafe.org\"]},{\"name\":\"Imgur\",\"category\":\"utility\",\"domains\":[\"*.imgur.com\"],\"totalExecutionTime\":6464,\"totalOccurrences\":6},{\"name\":\"Impact Radius\",\"category\":\"ad\",\"domains\":[\"*.impactradius-event.com\",\"*.impactradius-go.com\",\"*.7eer.net\",\"d3cxv97fi8q177.cloudfront.net\",\"*.evyy.net\",\"*.ojrq.net\",\"utt.impactcdn.com\",\"*.sjv.io\"],\"examples\":[\"a.impactradius-go.com\",\"microsoft-uk.evyy.net\"],\"totalExecutionTime\":644065,\"totalOccurrences\":4528},{\"name\":\"Improve Digital\",\"category\":\"ad\",\"domains\":[\"*.360yield.com\"],\"totalExecutionTime\":192961,\"totalOccurrences\":401},{\"name\":\"Improvely\",\"category\":\"analytics\",\"domains\":[\"*.iljmp.com\"],\"totalExecutionTime\":197,\"totalOccurrences\":4},{\"name\":\"InMobi\",\"category\":\"ad\",\"domains\":[\"*.inmobi.com\"],\"totalExecutionTime\":18140829,\"totalOccurrences\":39712},{\"name\":\"InSkin Media\",\"category\":\"ad\",\"domains\":[\"*.inskinad.com\",\"*.inskinmedia.com\"]},{\"name\":\"Inbenta\",\"category\":\"customer-success\",\"domains\":[\"*.inbenta.com\"],\"totalExecutionTime\":6015,\"totalOccurrences\":6},{\"name\":\"Incisive Media\",\"category\":\"content\",\"domains\":[\"*.incisivemedia.com\"]},{\"name\":\"Indeed\",\"category\":\"content\",\"domains\":[\"*.indeed.com\"],\"totalExecutionTime\":13225,\"totalOccurrences\":14},{\"name\":\"Index Exchange\",\"company\":\"WPP\",\"category\":\"ad\",\"domains\":[\"*.casalemedia.com\",\"*.indexww.com\"],\"totalExecutionTime\":843457,\"totalOccurrences\":20361},{\"name\":\"Indoona\",\"category\":\"other\",\"domains\":[\"*.indoona.com\"]},{\"name\":\"Infectious Media\",\"category\":\"ad\",\"domains\":[\"*.impdesk.com\",\"*.impressiondesk.com\",\"*.inmz.net\"]},{\"name\":\"Inference Mobile\",\"category\":\"ad\",\"domains\":[\"*.inferencemobile.com\"]},{\"name\":\"Infinity Tracking\",\"category\":\"analytics\",\"domains\":[\"*.infinity-tracking.net\"],\"totalExecutionTime\":18933,\"totalOccurrences\":221},{\"name\":\"Infoline\",\"category\":\"analytics\",\"domains\":[\"*.ioam.de\"],\"totalExecutionTime\":6521,\"totalOccurrences\":80},{\"name\":\"Infolinks\",\"category\":\"ad\",\"domains\":[\"*.infolinks.com\"],\"totalExecutionTime\":9806241,\"totalOccurrences\":8002},{\"name\":\"Infopark\",\"category\":\"hosting\",\"domains\":[\"*.scrvt.com\"]},{\"name\":\"Infusionsoft\",\"category\":\"ad\",\"domains\":[\"*.infusionsoft.com\"],\"totalExecutionTime\":267513,\"totalOccurrences\":565},{\"name\":\"Ink\",\"category\":\"ad\",\"domains\":[\"*.inktad.com\"]},{\"name\":\"Inktel Contact Center Solutions\",\"company\":\"Inktel\",\"category\":\"customer-success\",\"domains\":[\"*.inktel.com\"]},{\"name\":\"Inneractive\",\"category\":\"ad\",\"domains\":[\"*.inner-active.mobi\"]},{\"name\":\"Innovid\",\"category\":\"ad\",\"homepage\":\"https://www.innovid.com/\",\"domains\":[\"*.innovid.com\"],\"examples\":[\"ag.innovid.com\",\"rtr.innovid.com\"],\"totalExecutionTime\":411826,\"totalOccurrences\":548},{\"name\":\"Insight Express\",\"category\":\"analytics\",\"domains\":[\"*.insightexpressai.com\"],\"totalExecutionTime\":94,\"totalOccurrences\":1},{\"name\":\"Insipio\",\"category\":\"other\",\"domains\":[\"*.insipio.com\"]},{\"name\":\"Inspectlet\",\"category\":\"analytics\",\"domains\":[\"*.inspectlet.com\"],\"totalExecutionTime\":6346217,\"totalOccurrences\":4722},{\"name\":\"Instansive\",\"category\":\"utility\",\"domains\":[\"*.instansive.com\"]},{\"name\":\"Instart\",\"homepage\":\"https://www.instart.com/\",\"category\":\"utility\",\"domains\":[\"*.insnw.net\"]},{\"name\":\"Instembedder\",\"category\":\"content\",\"domains\":[\"*.instaembedder.com\"]},{\"name\":\"Instinctive\",\"category\":\"ad\",\"domains\":[\"*.instinctiveads.com\"]},{\"name\":\"Intelligent Reach\",\"category\":\"ad\",\"domains\":[\"*.ist-track.com\"]},{\"name\":\"Intent HQ\",\"category\":\"analytics\",\"domains\":[\"*.intenthq.com\"]},{\"name\":\"Intent IQ\",\"category\":\"ad\",\"domains\":[\"*.intentiq.com\"],\"totalExecutionTime\":15662,\"totalOccurrences\":464},{\"name\":\"Intercept Interactive\",\"category\":\"ad\",\"domains\":[\"*.undertone.com\"],\"totalExecutionTime\":1545380,\"totalOccurrences\":21601},{\"name\":\"Interest Graph\",\"company\":\"AOL\",\"category\":\"ad\",\"domains\":[\"*.gravity.com\"]},{\"name\":\"Internet Brands\",\"category\":\"content\",\"domains\":[\"*.ibpxl.com\"]},{\"name\":\"Interpublic Group\",\"category\":\"ad\",\"domains\":[\"*.mbww.com\"]},{\"name\":\"Interstate\",\"category\":\"analytics\",\"domains\":[\"*.interstateanalytics.com\"]},{\"name\":\"Interview\",\"category\":\"analytics\",\"domains\":[\"*.efm.me\"]},{\"name\":\"Intilery\",\"category\":\"customer-success\",\"domains\":[\"*.intilery-analytics.com\"]},{\"name\":\"Investis\",\"category\":\"utility\",\"domains\":[\"*.investis.com\"],\"totalExecutionTime\":153425,\"totalOccurrences\":274},{\"name\":\"Investis Flife\",\"category\":\"hosting\",\"domains\":[\"*.quartalflife.com\"]},{\"name\":\"Invodo\",\"category\":\"ad\",\"domains\":[\"*.invodo.com\"],\"examples\":[\"e.invodo.com\"]},{\"name\":\"iSite\",\"category\":\"analytics\",\"domains\":[\"*.isitetv.com\"],\"examples\":[\"static.isitetv.com\",\"events.isitetv.com\"]},{\"name\":\"Issue\",\"category\":\"content\",\"domains\":[\"*.issue.by\"]},{\"name\":\"J.D. Williams & Co\",\"category\":\"content\",\"domains\":[\"*.drct2u.com\"]},{\"name\":\"Janrain\",\"category\":\"analytics\",\"domains\":[\"*.janrain.com\",\"*.janrainbackplane.com\",\"*.rpxnow.com\",\"d3hmp0045zy3cs.cloudfront.net\"],\"totalExecutionTime\":2255,\"totalOccurrences\":13},{\"name\":\"Jellyfish\",\"category\":\"ad\",\"domains\":[\"*.jellyfish.net\"]},{\"name\":\"JetStream\",\"category\":\"content\",\"domains\":[\"*.xlcdn.com\"]},{\"name\":\"JingDong\",\"category\":\"content\",\"domains\":[\"*.3.com\",\"*.jd.com\"],\"totalExecutionTime\":181098,\"totalOccurrences\":98},{\"name\":\"Jivox\",\"category\":\"ad\",\"domains\":[\"*.jivox.com\"],\"totalExecutionTime\":6745,\"totalOccurrences\":16},{\"name\":\"Jobvite\",\"category\":\"content\",\"domains\":[\"*.jobvite.com\"],\"totalExecutionTime\":12114,\"totalOccurrences\":23},{\"name\":\"Johnston Press\",\"category\":\"content\",\"domains\":[\"*.johnstonpress.co.uk\",\"*.jpress.co.uk\"]},{\"name\":\"Join the Dots (Research)\",\"category\":\"social\",\"domains\":[\"*.jtdiscuss.com\"]},{\"name\":\"JotForm\",\"category\":\"utility\",\"domains\":[\"*.jotformpro.com\"]},{\"name\":\"JuicyAds\",\"category\":\"ad\",\"domains\":[\"*.juicyads.com\"],\"totalExecutionTime\":456927,\"totalOccurrences\":2495},{\"name\":\"JustPremium\",\"category\":\"ad\",\"domains\":[\"*.net.net\"],\"examples\":[\"d2nvliyzbo36lk.cloudfrontd2nvliyzbo36lk.cloudfront.net.net\"]},{\"name\":\"JustPremium Ads\",\"company\":\"JustPremium\",\"category\":\"ad\",\"domains\":[\"*.justpremium.com\"],\"totalExecutionTime\":70,\"totalOccurrences\":3},{\"name\":\"JustUno\",\"category\":\"ad\",\"domains\":[\"*.justuno.com\",\"d2j3qa5nc37287.cloudfront.net\"],\"totalExecutionTime\":512792,\"totalOccurrences\":1128},{\"name\":\"KINX (Korea Internet Neutral eXchange)\",\"category\":\"other\",\"domains\":[\"*.kinxcdn.com\"],\"totalExecutionTime\":1949,\"totalOccurrences\":5},{\"name\":\"KISSmetrics\",\"category\":\"analytics\",\"domains\":[\"*.kissmetrics.com\",\"doug1izaerwt3.cloudfront.net\",\"dsyszv14g9ymi.cloudfront.net\"],\"totalExecutionTime\":2664,\"totalOccurrences\":41},{\"name\":\"Kaizen Platform\",\"category\":\"analytics\",\"domains\":[\"*.kaizenplatform.net\"],\"examples\":[\"cdn.kaizenplatform.net\",\"log-v4.kaizenplatform.net\"],\"totalExecutionTime\":90621,\"totalOccurrences\":200},{\"name\":\"Kakao\",\"category\":\"social\",\"domains\":[\"*.daum.net\",\"*.daumcdn.net\"],\"totalExecutionTime\":46235545,\"totalOccurrences\":64055},{\"name\":\"Kaltura Video Platform\",\"company\":\"Kaltura\",\"category\":\"content\",\"domains\":[\"*.kaltura.com\"],\"examples\":[\"cdnsecakmi.kaltura.com\"],\"totalExecutionTime\":3033075,\"totalOccurrences\":1030},{\"name\":\"Kameleoon\",\"homepage\":\"https://www.kameleoon.com/\",\"category\":\"analytics\",\"domains\":[\"*.kameleoon.com\",\"*.kameleoon.eu\",\"*.kameleoon.io\"],\"examples\":[\"data.kameleoon.io\",\"kdm3fpv6il.kameleoon.eu\"],\"totalExecutionTime\":1855935,\"totalOccurrences\":2418},{\"name\":\"Kampyle\",\"category\":\"analytics\",\"domains\":[\"*.kampyle.com\"],\"totalExecutionTime\":412877,\"totalOccurrences\":801},{\"name\":\"Kantar\",\"category\":\"analytics\",\"domains\":[\"*.sesamestats.com\"]},{\"name\":\"Kargo\",\"category\":\"marketing\",\"domains\":[\"*.kargo.com\"],\"totalExecutionTime\":336406,\"totalOccurrences\":930},{\"name\":\"KARTE\",\"company\":\"Plaid\",\"homepage\":\"https://karte.io/\",\"category\":\"marketing\",\"domains\":[\"*.karte.io\"],\"examples\":[\"static.karte.io\",\"t.karte.io\"],\"totalExecutionTime\":1609759,\"totalOccurrences\":1583},{\"name\":\"Kauli\",\"category\":\"ad\",\"domains\":[\"*.kau.li\"]},{\"name\":\"Keen\",\"company\":\"Keen\",\"homepage\":\"https://keen.io/\",\"category\":\"analytics\",\"domains\":[\"*.keen.io\",\"d26b395fwzu5fz.cloudfront.net\"],\"totalExecutionTime\":38233,\"totalOccurrences\":144},{\"name\":\"Kelkoo\",\"category\":\"hosting\",\"domains\":[\"*.kelkoo.com\"]},{\"name\":\"Kenshoo\",\"category\":\"marketing\",\"domains\":[\"*.xg4ken.com\"],\"totalExecutionTime\":248,\"totalOccurrences\":8},{\"name\":\"Key CDN\",\"category\":\"utility\",\"domains\":[\"*.kxcdn.com\"],\"totalExecutionTime\":4227194,\"totalOccurrences\":11086},{\"name\":\"Keynote\",\"company\":\"Dynatrace\",\"category\":\"analytics\",\"domains\":[\"*.keynote.com\"]},{\"name\":\"Keywee\",\"category\":\"ad\",\"domains\":[\"*.keywee.co\"],\"totalExecutionTime\":15001,\"totalOccurrences\":125},{\"name\":\"Kiosked\",\"category\":\"ad\",\"domains\":[\"*.kiosked.com\"],\"totalExecutionTime\":88623,\"totalOccurrences\":73},{\"name\":\"Klarna\",\"category\":\"utility\",\"domains\":[\"*.klarna.com\"],\"totalExecutionTime\":5024239,\"totalOccurrences\":9864},{\"name\":\"Klaviyo\",\"category\":\"ad\",\"domains\":[\"*.klaviyo.com\"],\"totalExecutionTime\":108884476,\"totalOccurrences\":160346},{\"name\":\"Klevu Search\",\"company\":\"Klevu\",\"category\":\"utility\",\"domains\":[\"*.klevu.com\"],\"totalExecutionTime\":921846,\"totalOccurrences\":1255},{\"name\":\"Klick2Contact\",\"category\":\"customer-success\",\"domains\":[\"*.klick2contact.com\"]},{\"name\":\"Knight Lab\",\"company\":\"Northwestern University\",\"category\":\"utility\",\"domains\":[\"*.knightlab.com\"],\"totalExecutionTime\":350425,\"totalOccurrences\":413},{\"name\":\"Kodajo\",\"category\":\"other\",\"domains\":[\"*.kodajo.com\"]},{\"name\":\"Komoona\",\"category\":\"ad\",\"domains\":[\"*.komoona.com\"]},{\"name\":\"Korrelate\",\"company\":\"JD Power\",\"category\":\"analytics\",\"domains\":[\"*.korrelate.net\"]},{\"name\":\"LKQD\",\"category\":\"ad\",\"domains\":[\"*.lkqd.net\"]},{\"name\":\"Layer0\",\"category\":\"cdn\",\"domains\":[\"*.layer0.co\"],\"examples\":[\"rum.layer0.co\"]},{\"name\":\"Layershift\",\"category\":\"hosting\",\"domains\":[\"109.109.138.174\"]},{\"name\":\"Lead Forensics\",\"category\":\"ad\",\"domains\":[\"*.200summit.com\",\"*.baw5tracker.com\",\"*.business-path-55.com\",\"*.bux1le001.com\",\"*.central-core-7.com\",\"*.direct-azr-78.com\",\"*.explore-123.com\",\"*.forensics1000.com\",\"*.gldsta-02-or.com\",\"*.green-bloc9.com\",\"*.lansrv040.com\",\"*.lead-123.com\",\"*.leadforensics.com\",\"*.mavic852.com\",\"*.mon-com-net.com\",\"*.peak-ip-54.com\",\"*.snta0034.com\",\"*.svr-prc-01.com\",\"*.syntace-094.com\",\"*.tghbn12.com\",\"*.trail-web.com\",\"*.web-01-gbl.com\",\"*.web-cntr-07.com\",\"*.trackdiscovery.net\"],\"examples\":[\"www.baw5tracker.com\",\"www.lansrv040.com\",\"www.mon-com-net.com\",\"www.peak-ip-54.com\",\"www.tghbn12.com\",\"www.web-01-gbl.com\"],\"totalExecutionTime\":70292,\"totalOccurrences\":671},{\"name\":\"Lead Intelligence\",\"company\":\"Magnetise Solutions\",\"category\":\"ad\",\"domains\":[\"*.leadintelligence.co.uk\"]},{\"name\":\"LeadLander\",\"category\":\"analytics\",\"domains\":[\"*.formalyzer.com\",\"*.trackalyzer.com\"]},{\"name\":\"Leaflet\",\"category\":\"utility\",\"domains\":[\"*.leafletjs.com\"]},{\"name\":\"LeasdBoxer\",\"company\":\"LeadBoxer\",\"category\":\"ad\",\"domains\":[\"*.leadboxer.com\"],\"totalExecutionTime\":7268,\"totalOccurrences\":98},{\"name\":\"LeaseWeb\",\"homepage\":\"https://www.leaseweb.com/\",\"category\":\"cdn\",\"domains\":[\"*.lswcdn.net\",\"*.leasewebcdn.com\"]},{\"name\":\"Leboncoin\",\"category\":\"content\",\"domains\":[\"*.leboncoin.fr\"]},{\"name\":\"Lengow\",\"category\":\"hosting\",\"domains\":[\"*.lengow.com\"]},{\"name\":\"Lessbuttons\",\"category\":\"social\",\"domains\":[\"*.lessbuttons.com\"]},{\"name\":\"Letter Press\",\"category\":\"ad\",\"domains\":[\"*.getletterpress.com\"]},{\"name\":\"Level 3 Communications\",\"category\":\"utility\",\"domains\":[\"footprint.net\"]},{\"name\":\"Level3\",\"category\":\"other\",\"domains\":[\"secure.footprint.net\"]},{\"name\":\"Lifestreet Media\",\"category\":\"social\",\"domains\":[\"*.lfstmedia.com\"]},{\"name\":\"LiftSuggest\",\"category\":\"analytics\",\"domains\":[\"d2blwevgjs7yom.cloudfront.net\"]},{\"name\":\"Ligatus\",\"category\":\"ad\",\"domains\":[\"*.ligadx.com\"]},{\"name\":\"LightStep\",\"category\":\"analytics\",\"domains\":[\"*.lightstep.com\"]},{\"name\":\"LightWidget\",\"category\":\"utility\",\"domains\":[\"*.lightwidget.com\"],\"totalExecutionTime\":1473036,\"totalOccurrences\":8453},{\"name\":\"Likelihood\",\"company\":\"LIkeihood\",\"category\":\"hosting\",\"domains\":[\"*.likelihood.com\"],\"examples\":[\"client.likelihood.com\"]},{\"name\":\"LikeShop\",\"company\":\"Dash Hudson\",\"category\":\"content\",\"domains\":[\"likeshop.me\"],\"examples\":[\"likeshop.me\"],\"totalExecutionTime\":2220,\"totalOccurrences\":1},{\"name\":\"LINE Corporation\",\"category\":\"ad\",\"domains\":[\"*.line-scdn.net\",\"*.line.me\"],\"examples\":[\"d.line-scdn.net\",\"tr.line.me\"],\"totalExecutionTime\":1571883,\"totalOccurrences\":24937},{\"name\":\"Linkcious\",\"category\":\"analytics\",\"domains\":[\"*.linkcious.com\"]},{\"name\":\"Linking Mobile\",\"category\":\"ad\",\"domains\":[\"*.linkingmobile.com\"]},{\"name\":\"LittleData\",\"category\":\"analytics\",\"homepage\":\"https://www.littledata.io/\",\"domains\":[\"*.littledata.io\"],\"examples\":[\"transactions.littledata.io\"],\"totalExecutionTime\":2223,\"totalOccurrences\":2},{\"name\":\"LiveBurst\",\"category\":\"ad\",\"domains\":[\"*.liveburst.com\"]},{\"name\":\"LiveClicker\",\"category\":\"ad\",\"domains\":[\"*.liveclicker.net\"]},{\"name\":\"LiveHelpNow\",\"category\":\"customer-success\",\"domains\":[\"*.livehelpnow.net\"],\"totalExecutionTime\":253697,\"totalOccurrences\":802},{\"name\":\"LiveInternet\",\"category\":\"analytics\",\"domains\":[\"*.yadro.ru\"],\"totalExecutionTime\":0,\"totalOccurrences\":1},{\"name\":\"LiveJournal\",\"category\":\"social\",\"domains\":[\"*.livejournal.com\",\"*.livejournal.net\"],\"totalExecutionTime\":48805430,\"totalOccurrences\":7951},{\"name\":\"LivePerson\",\"category\":\"customer-success\",\"homepage\":\"https://www.liveperson.com/\",\"domains\":[\"*.liveperson.com\",\"*.look.io\",\"*.liveperson.net\",\"*.lpsnmedia.net\"],\"totalExecutionTime\":1874053,\"totalOccurrences\":2684},{\"name\":\"LiveRail\",\"company\":\"Facebook\",\"category\":\"ad\",\"domains\":[\"*.liverail.com\",\"*.lrcdn.net\"],\"examples\":[\"scontent.lrcdn.net\"]},{\"name\":\"LiveTex\",\"category\":\"customer-success\",\"domains\":[\"*.livetex.ru\"],\"totalExecutionTime\":468923,\"totalOccurrences\":1788},{\"name\":\"Livefyre\",\"category\":\"content\",\"domains\":[\"*.fyre.co\",\"*.livefyre.com\"]},{\"name\":\"Living Map Company\",\"category\":\"utility\",\"domains\":[\"*.livingmap.com\"]},{\"name\":\"Local World\",\"category\":\"content\",\"domains\":[\"*.thelocalpeople.co.uk\"]},{\"name\":\"LockerDome\",\"category\":\"analytics\",\"domains\":[\"*.lockerdome.com\"]},{\"name\":\"Logentries\",\"company\":\"Rapid\",\"category\":\"utility\",\"domains\":[\"*.logentries.com\"],\"examples\":[\"js.logentries.com\"]},{\"name\":\"Logicalis\",\"category\":\"analytics\",\"domains\":[\"*.trovus.co.uk\"]},{\"name\":\"LoginRadius\",\"company\":\"LoginRadius\",\"homepage\":\"https://www.loginradius.com/\",\"category\":\"ad\",\"domains\":[\"*.loginradius.com\",\"*.lrcontent.com\"],\"examples\":[\"config.lrcontent.com\"],\"totalExecutionTime\":27732,\"totalOccurrences\":193},{\"name\":\"LongTail Ad Solutions\",\"category\":\"ad\",\"domains\":[\"*.jwpcdn.com\",\"*.jwplatform.com\",\"*.jwplayer.com\",\"*.jwpltx.com\",\"*.jwpsrv.com\",\"*.longtailvideo.com\"],\"totalExecutionTime\":3964226,\"totalOccurrences\":4595},{\"name\":\"Loop Commerce\",\"category\":\"other\",\"domains\":[\"*.loopassets.net\"]},{\"name\":\"Loop11\",\"category\":\"analytics\",\"domains\":[\"*.loop11.com\"],\"totalExecutionTime\":20404,\"totalOccurrences\":28},{\"name\":\"LoopMe\",\"category\":\"ad\",\"domains\":[\"*.loopme.biz\",\"*.loopme.com\",\"*.vntsm.com\",\"*.loopme.me\"],\"totalExecutionTime\":1978364,\"totalOccurrences\":2845},{\"name\":\"Looper\",\"category\":\"content\",\"domains\":[\"*.looper.com\"]},{\"name\":\"Loyalty Point\",\"category\":\"ad\",\"domains\":[\"*.loyaltypoint.pl\"]},{\"name\":\"LoyaltyLion\",\"category\":\"ad\",\"domains\":[\"*.loyaltylion.com\",\"*.loyaltylion.net\",\"dg1f2pfrgjxdq.cloudfront.net\"],\"totalExecutionTime\":2653902,\"totalOccurrences\":3910},{\"name\":\"Luma Tag\",\"category\":\"analytics\",\"domains\":[\"*.lumatag.co.uk\"]},{\"name\":\"Lumesse\",\"category\":\"content\",\"domains\":[\"*.recruitmentplatform.com\"]},{\"name\":\"Luminate\",\"category\":\"ad\",\"domains\":[\"*.luminate.com\"]},{\"name\":\"Lynchpin Analytics\",\"category\":\"analytics\",\"domains\":[\"*.lypn.net\"]},{\"name\":\"Lyris\",\"category\":\"ad\",\"domains\":[\"*.clicktracks.com\"]},{\"name\":\"Lytics\",\"category\":\"ad\",\"domains\":[\"*.lytics.io\"],\"totalExecutionTime\":237537,\"totalOccurrences\":624},{\"name\":\"MEC WebTrack\",\"company\":\"MEC\",\"category\":\"ad\",\"domains\":[\"*.e-webtrack.net\"]},{\"name\":\"MECLABS Institute\",\"category\":\"analytics\",\"domains\":[\"*.meclabs.com\",\"*.meclabsdata.com\"]},{\"name\":\"MLveda\",\"category\":\"utility\",\"domains\":[\"*.mlveda.com\"],\"examples\":[\"www.mlveda.com\"],\"totalExecutionTime\":56900,\"totalOccurrences\":211},{\"name\":\"Macromill\",\"company\":\"Macromill\",\"category\":\"analytics\",\"homepage\":\"https://group.macromill.com/\",\"domains\":[\"*.macromill.com\"],\"examples\":[\"img.macromill.com/js/us000131vfg/4000000570-56/lognos.js\"],\"totalExecutionTime\":3200,\"totalOccurrences\":8},{\"name\":\"Macropod BugHerd\",\"company\":\"Macropod\",\"category\":\"utility\",\"domains\":[\"*.bugherd.com\"],\"examples\":[\"www.bugherd.com\"],\"totalExecutionTime\":423942,\"totalOccurrences\":3236},{\"name\":\"Madison Logic\",\"category\":\"marketing\",\"domains\":[\"*.ml314.com\"],\"totalExecutionTime\":407,\"totalOccurrences\":5},{\"name\":\"Madmetrics\",\"company\":\"Keyade\",\"category\":\"analytics\",\"domains\":[\"*.keyade.com\"]},{\"name\":\"Magnetic\",\"category\":\"ad\",\"domains\":[\"*.domdex.com\",\"d3ezl4ajpp2zy8.cloudfront.net\"]},{\"name\":\"Magnetic Platform\",\"company\":\"Magnetic\",\"category\":\"ad\",\"domains\":[\"*.magnetic.is\"]},{\"name\":\"MailMunch\",\"category\":\"ad\",\"domains\":[\"*.mailmunch.co\"],\"totalExecutionTime\":1089187,\"totalOccurrences\":17039},{\"name\":\"MailPlus\",\"category\":\"ad\",\"domains\":[\"*.mailplus.nl\"],\"totalExecutionTime\":93797,\"totalOccurrences\":295},{\"name\":\"Mapbox\",\"category\":\"utility\",\"domains\":[\"*.mapbox.com\"],\"totalExecutionTime\":10677347,\"totalOccurrences\":17782},{\"name\":\"Maptive\",\"category\":\"utility\",\"domains\":[\"*.maptive.com\"]},{\"name\":\"Marcaria.com\",\"category\":\"other\",\"domains\":[\"*.gooo.al\"]},{\"name\":\"Marchex\",\"category\":\"analytics\",\"domains\":[\"*.voicestar.com\",\"*.marchex.io\"],\"totalExecutionTime\":744342,\"totalOccurrences\":4391},{\"name\":\"Mark and Mini\",\"category\":\"ad\",\"domains\":[\"*.markandmini.com\"],\"examples\":[\"www.markandmini.com\"]},{\"name\":\"Marker\",\"category\":\"utility\",\"domains\":[\"*.marker.io\"],\"examples\":[\"edge.marker.io\"],\"totalExecutionTime\":2153355,\"totalOccurrences\":1932},{\"name\":\"Marketing Dashboards\",\"company\":\"GroupM\",\"category\":\"analytics\",\"domains\":[\"*.m-decision.com\"]},{\"name\":\"Marketizator\",\"category\":\"analytics\",\"domains\":[\"*.marketizator.com\"]},{\"name\":\"Marketplace Web Service\",\"company\":\"Amazon\",\"category\":\"other\",\"domains\":[\"*.ssl-images-amazon.com\"],\"totalExecutionTime\":1408016,\"totalOccurrences\":2259},{\"name\":\"Mashable\",\"category\":\"social\",\"domains\":[\"*.mshcdn.com\"]},{\"name\":\"MatchWork\",\"category\":\"utility\",\"domains\":[\"*.matchwork.com\"]},{\"name\":\"MathJax\",\"category\":\"utility\",\"domains\":[\"*.mathjax.org\"],\"totalExecutionTime\":80991,\"totalOccurrences\":757},{\"name\":\"Mather Economics\",\"category\":\"analytics\",\"domains\":[\"*.matheranalytics.com\"],\"totalExecutionTime\":173182,\"totalOccurrences\":436},{\"name\":\"MaxCDN Enterprise\",\"company\":\"MaxCDN\",\"category\":\"utility\",\"domains\":[\"*.netdna-cdn.com\",\"*.netdna-ssl.com\"]},{\"name\":\"MaxMind\",\"category\":\"utility\",\"domains\":[\"*.maxmind.com\"],\"totalExecutionTime\":700278,\"totalOccurrences\":725},{\"name\":\"MaxPoint Interactive\",\"category\":\"ad\",\"domains\":[\"*.mxptint.net\"],\"totalExecutionTime\":5413,\"totalOccurrences\":8082},{\"name\":\"Maxsi\",\"category\":\"analytics\",\"domains\":[\"*.evisitanalyst.com\"]},{\"name\":\"Maxymiser\",\"category\":\"analytics\",\"domains\":[\"*.maxymiser.net\",\"maxymiser.hs.llnwd.net\"]},{\"name\":\"McAffee\",\"category\":\"utility\",\"domains\":[\"*.mcafeesecure.com\",\"*.scanalert.com\"],\"totalExecutionTime\":0,\"totalOccurrences\":1},{\"name\":\"Measured\",\"category\":\"analytics\",\"domains\":[\"*.measured.com\"],\"examples\":[\"tag.measured.com\"],\"homepage\":\"https://www.measured.com/\"},{\"name\":\"Media IQ\",\"category\":\"analytics\",\"domains\":[\"*.mediaiqdigital.com\"]},{\"name\":\"Media Management Technologies\",\"category\":\"ad\",\"domains\":[\"*.speedshiftmedia.com\"],\"totalExecutionTime\":27416,\"totalOccurrences\":152},{\"name\":\"Media Temple\",\"category\":\"hosting\",\"domains\":[\"*.goodlayers2.com\"]},{\"name\":\"Mediabong\",\"category\":\"ad\",\"domains\":[\"*.mediabong.net\"]},{\"name\":\"Mediahawk\",\"category\":\"analytics\",\"domains\":[\"*.mediahawk.co.uk\"],\"totalExecutionTime\":18881,\"totalOccurrences\":131},{\"name\":\"Mediahub\",\"category\":\"ad\",\"domains\":[\"*.hubverifyandoptimize.com\",\"*.projectwatchtower.com\"]},{\"name\":\"Mediasyndicator\",\"category\":\"ad\",\"domains\":[\"*.creativesyndicator.com\"]},{\"name\":\"Medium\",\"category\":\"content\",\"domains\":[\"*.medium.com\"],\"totalExecutionTime\":159090478,\"totalOccurrences\":10725},{\"name\":\"Meetrics\",\"category\":\"ad\",\"domains\":[\"*.de.com\",\"*.meetrics.net\",\"*.mxcdn.net\"],\"examples\":[\"research.de.com\"],\"totalExecutionTime\":50839,\"totalOccurrences\":38},{\"name\":\"Mega\",\"company\":\"Mega Information Technology\",\"category\":\"other\",\"domains\":[\"*.mgcdn.com\"]},{\"name\":\"Melt\",\"category\":\"ad\",\"domains\":[\"*.meltdsp.com\",\"*.mesp.com\"]},{\"name\":\"Meltwater Group\",\"category\":\"customer-success\",\"domains\":[\"*.meltwaternews.com\"]},{\"name\":\"Meme\",\"category\":\"ad\",\"domains\":[\"*.viewwonder.com\"]},{\"name\":\"MentAd\",\"category\":\"ad\",\"domains\":[\"*.mentad.com\"]},{\"name\":\"Mention Me\",\"category\":\"ad\",\"domains\":[\"*.mention-me.com\"],\"examples\":[\"tag.mention-me.com\"],\"totalExecutionTime\":11738,\"totalOccurrences\":29},{\"name\":\"Merchant Equipment Store\",\"category\":\"utility\",\"domains\":[\"*.merchantequip.com\"],\"totalExecutionTime\":150,\"totalOccurrences\":1},{\"name\":\"Merchenta\",\"category\":\"customer-success\",\"domains\":[\"*.merchenta.com\"]},{\"name\":\"Merkle Digital Data Exchange\",\"company\":\"Merkle\",\"category\":\"ad\",\"domains\":[\"*.brilig.com\"]},{\"name\":\"Merkle Paid Search\",\"company\":\"Merkle\",\"category\":\"ad\",\"domains\":[\"*.rkdms.com\"],\"totalExecutionTime\":61108,\"totalOccurrences\":439},{\"name\":\"Met Office\",\"category\":\"content\",\"domains\":[\"*.metoffice.gov.uk\"]},{\"name\":\"Meta Broadcast\",\"category\":\"social\",\"domains\":[\"*.metabroadcast.com\"],\"examples\":[\"voila.metabroadcast.com\"]},{\"name\":\"Michael Associates\",\"category\":\"ad\",\"domains\":[\"*.checktestsite.com\"],\"examples\":[\"www.checktestsite.com\"]},{\"name\":\"Michelin\",\"category\":\"content\",\"domains\":[\"*.viamichelin.com\"],\"totalExecutionTime\":5195,\"totalOccurrences\":2},{\"name\":\"Microad\",\"category\":\"ad\",\"domains\":[\"*.microad.jp\"],\"totalExecutionTime\":12794895,\"totalOccurrences\":21561},{\"name\":\"Microsoft Certificate Services\",\"company\":\"Microsoft\",\"category\":\"utility\",\"domains\":[\"*.msocsp.com\"]},{\"name\":\"Microsoft Hosted Libs\",\"company\":\"Microsoft\",\"category\":\"cdn\",\"domains\":[\"*.aspnetcdn.com\"],\"examples\":[\"ajax.aspnetcdn.com\"],\"totalExecutionTime\":4094745,\"totalOccurrences\":20077},{\"name\":\"Microsoft XBox Live\",\"company\":\"Microsoft\",\"category\":\"marketing\",\"domains\":[\"*.xboxlive.com\"]},{\"name\":\"Mightypop\",\"category\":\"ad\",\"domains\":[\"*.mightypop.ca\"]},{\"name\":\"Mika Tuupola\",\"category\":\"utility\",\"domains\":[\"*.appelsiini.net\"]},{\"name\":\"Millennial Media\",\"category\":\"ad\",\"domains\":[\"*.jumptap.com\"]},{\"name\":\"Mirror Image Internet\",\"category\":\"utility\",\"domains\":[\"*.miisolutions.net\"]},{\"name\":\"Mobify\",\"category\":\"utility\",\"domains\":[\"*.mobify.com\",\"*.mobify.net\"]},{\"name\":\"Mobile Nations\",\"category\":\"social\",\"domains\":[\"*.mobilenations.com\"]},{\"name\":\"Mobivate\",\"category\":\"ad\",\"domains\":[\"*.mobivatebulksms.com\"]},{\"name\":\"Momondo\",\"category\":\"content\",\"domains\":[\"*.momondo.dk\"]},{\"name\":\"Momondo Group\",\"category\":\"content\",\"domains\":[\"*.momondogrouo.com\",\"*.momondogroup.com\"]},{\"name\":\"Monarch Ads\",\"category\":\"ad\",\"domains\":[\"*.monarchads.com\"]},{\"name\":\"Monetate\",\"category\":\"analytics\",\"domains\":[\"*.monetate.net\"],\"totalExecutionTime\":235012,\"totalOccurrences\":631},{\"name\":\"MonetizeMore\",\"category\":\"ad\",\"domains\":[\"*.m2.ai\"],\"totalExecutionTime\":5645,\"totalOccurrences\":26},{\"name\":\"Monitor\",\"company\":\"Econda\",\"category\":\"analytics\",\"domains\":[\"*.econda-monitor.de\"],\"examples\":[\"www.econda-monitor.de\"]},{\"name\":\"Monkey Frog Media\",\"category\":\"content\",\"domains\":[\"*.monkeyfrogmedia.com\"]},{\"name\":\"Monotype\",\"category\":\"cdn\",\"domains\":[\"*.fonts.com\",\"*.fonts.net\"],\"totalExecutionTime\":541350,\"totalOccurrences\":2674},{\"name\":\"Moore-Wilson\",\"category\":\"ad\",\"domains\":[\"*.mwdev.co.uk\"]},{\"name\":\"Moovweb\",\"category\":\"utility\",\"domains\":[\"*.moovweb.net\"]},{\"name\":\"Mopinion\",\"category\":\"analytics\",\"domains\":[\"*.mopinion.com\"],\"totalExecutionTime\":182601,\"totalOccurrences\":375},{\"name\":\"MotionPoint\",\"category\":\"other\",\"domains\":[\"*.convertlanguage.com\"],\"totalExecutionTime\":10777,\"totalOccurrences\":34},{\"name\":\"Mouse3K\",\"category\":\"analytics\",\"domains\":[\"*.mouse3k.com\"]},{\"name\":\"MouseStats\",\"category\":\"analytics\",\"domains\":[\"*.mousestats.com\"]},{\"name\":\"Mouseflow\",\"homepage\":\"https://mouseflow.com/\",\"category\":\"analytics\",\"domains\":[\"*.mouseflow.com\"],\"totalExecutionTime\":365284,\"totalOccurrences\":7440},{\"name\":\"Movable Ink\",\"category\":\"analytics\",\"domains\":[\"*.micpn.com\"],\"totalExecutionTime\":255811,\"totalOccurrences\":4201},{\"name\":\"MovingIMAGE24\",\"category\":\"content\",\"domains\":[\"*.edge-cdn.net\"]},{\"name\":\"Moxielinks\",\"category\":\"ad\",\"domains\":[\"*.moxielinks.com\"]},{\"name\":\"Moz Recommended Companies\",\"company\":\"Moz\",\"category\":\"analytics\",\"domains\":[\"d2eeipcrcdle6.cloudfront.net\"]},{\"name\":\"Mozilla\",\"category\":\"utility\",\"domains\":[\"*.mozilla.org\"],\"examples\":[\"aus5.mozilla.org\"],\"totalExecutionTime\":20923,\"totalOccurrences\":31},{\"name\":\"Multiview\",\"category\":\"content\",\"domains\":[\"*.multiview.com\",\"*.track-mv.com\"],\"totalExecutionTime\":7767,\"totalOccurrences\":57},{\"name\":\"Mux\",\"category\":\"analytics\",\"domains\":[\"*.litix.io\"],\"totalExecutionTime\":73065,\"totalOccurrences\":207},{\"name\":\"MyAds\",\"company\":\"MyBuys\",\"category\":\"analytics\",\"domains\":[\"*.veruta.com\"]},{\"name\":\"MyBuys\",\"category\":\"analytics\",\"domains\":[\"*.mybuys.com\"]},{\"name\":\"MyFonts\",\"category\":\"cdn\",\"domains\":[\"*.myfonts.net\"],\"totalExecutionTime\":88,\"totalOccurrences\":3},{\"name\":\"MyRegistry\",\"category\":\"other\",\"domains\":[\"*.myregistry.com\"],\"totalExecutionTime\":163734,\"totalOccurrences\":603},{\"name\":\"MySpace\",\"company\":\"Specific Media\",\"category\":\"social\",\"domains\":[\"*.myspace.com\"]},{\"name\":\"Mynewsdesk\",\"category\":\"utility\",\"domains\":[\"*.mynewsdesk.com\"],\"totalExecutionTime\":3010,\"totalOccurrences\":33},{\"name\":\"NAVIS\",\"category\":\"content\",\"domains\":[\"*.navistechnologies.info\"]},{\"name\":\"NCC Group Real User Monitoring\",\"company\":\"NCC Group\",\"category\":\"analytics\",\"domains\":[\"*.nccgroup-webperf.com\"],\"examples\":[\"beacon-rumlive.rum.nccgroup-webperf.com\",\"config-rumlive.rum.nccgroup-webperf.com\",\"script-rumlive.rum.nccgroup-webperf.com\"]},{\"name\":\"NEORY Marketing Cloud\",\"company\":\"NEORY\",\"category\":\"marketing\",\"domains\":[\"*.ad-srv.net\"],\"totalExecutionTime\":8113,\"totalOccurrences\":195},{\"name\":\"Nanigans\",\"category\":\"ad\",\"domains\":[\"*.nanigans.com\"]},{\"name\":\"Nano Interactive\",\"category\":\"ad\",\"domains\":[\"*.audiencemanager.de\"],\"totalExecutionTime\":1734,\"totalOccurrences\":24},{\"name\":\"Nanorep\",\"company\":\"Nanorep Technologies\",\"category\":\"customer-success\",\"domains\":[\"*.nanorep.com\"]},{\"name\":\"Narrative\",\"category\":\"ad\",\"domains\":[\"*.narrative.io\"],\"totalExecutionTime\":929,\"totalOccurrences\":1},{\"name\":\"Native Ads\",\"category\":\"ad\",\"domains\":[\"*.nativeads.com\"]},{\"name\":\"Nativo\",\"category\":\"ad\",\"domains\":[\"*.postrelease.com\"],\"totalExecutionTime\":10882,\"totalOccurrences\":2971},{\"name\":\"Navegg\",\"category\":\"ad\",\"domains\":[\"*.navdmp.com\"],\"totalExecutionTime\":26200,\"totalOccurrences\":438},{\"name\":\"NaviStone\",\"category\":\"ad\",\"domains\":[\"*.murdoog.com\"]},{\"name\":\"Naytev\",\"category\":\"analytics\",\"domains\":[\"*.naytev.com\"]},{\"name\":\"Needle\",\"category\":\"analytics\",\"domains\":[\"*.needle.com\"]},{\"name\":\"Neiman Marcus\",\"category\":\"content\",\"domains\":[\"*.ctscdn.com\"]},{\"name\":\"Nend\",\"category\":\"ad\",\"domains\":[\"*.nend.net\"]},{\"name\":\"Neodata\",\"category\":\"ad\",\"domains\":[\"*.neodatagroup.com\"],\"totalExecutionTime\":13201,\"totalOccurrences\":110},{\"name\":\"Net Applications\",\"category\":\"analytics\",\"domains\":[\"*.hitsprocessor.com\"]},{\"name\":\"Net Reviews\",\"category\":\"analytics\",\"domains\":[\"*.avis-verifies.com\"],\"examples\":[\"www.avis-verifies.com\"],\"totalExecutionTime\":777069,\"totalOccurrences\":1888},{\"name\":\"NetAffiliation\",\"company\":\"Kwanco\",\"category\":\"ad\",\"domains\":[\"*.metaffiliation.com\"],\"totalExecutionTime\":14139,\"totalOccurrences\":118},{\"name\":\"NetDirector\",\"company\":\"G-Forces Web Management\",\"category\":\"other\",\"domains\":[\"*.netdirector.co.uk\"],\"totalExecutionTime\":2919,\"totalOccurrences\":1},{\"name\":\"NetFlix\",\"category\":\"content\",\"domains\":[\"*.nflxext.com\",\"*.nflximg.net\"],\"totalExecutionTime\":5017,\"totalOccurrences\":10},{\"name\":\"Nielsen NetRatings SiteCensus\",\"company\":\"The Nielsen Company\",\"homepage\":\"http://www.nielsen-online.com/intlpage.html\",\"category\":\"analytics\",\"domains\":[\"*.imrworldwide.com\"],\"totalExecutionTime\":6827361,\"totalOccurrences\":21206},{\"name\":\"NetSeer\",\"category\":\"ad\",\"domains\":[\"*.netseer.com\",\"*.ns-cdn.com\"]},{\"name\":\"NetShelter\",\"company\":\"Ziff Davis Tech\",\"category\":\"ad\",\"domains\":[\"*.netshelter.net\"]},{\"name\":\"Netmining\",\"company\":\"Ignition One\",\"category\":\"ad\",\"domains\":[\"*.netmng.com\"]},{\"name\":\"Netop\",\"category\":\"customer-success\",\"domains\":[\"*.netop.com\"]},{\"name\":\"Network Solutions\",\"category\":\"utility\",\"domains\":[\"*.netsolssl.com\",\"*.networksolutions.com\"],\"examples\":[\"ocsp.netsolssl.com\"],\"totalExecutionTime\":2017,\"totalOccurrences\":1},{\"name\":\"Neustar AdAdvisor\",\"company\":\"Neustar\",\"category\":\"ad\",\"domains\":[\"*.adadvisor.net\"]},{\"name\":\"New Approach Media\",\"category\":\"ad\",\"domains\":[\"*.newapproachmedia.co.uk\"]},{\"name\":\"NewShareCounts\",\"category\":\"social\",\"domains\":[\"*.newsharecounts.com\"]},{\"name\":\"News\",\"category\":\"social\",\"domains\":[\"*.news.com.au\",\"*.newsanalytics.com.au\",\"*.newsapi.com.au\",\"*.newscdn.com.au\",\"*.newsdata.com.au\",\"*.newsdiscover.com.au\",\"*.news-static.com\"],\"totalExecutionTime\":100625,\"totalOccurrences\":47},{\"name\":\"Newsquest\",\"category\":\"content\",\"domains\":[\"*.newsquestdigital.co.uk\"]},{\"name\":\"Newzulu\",\"category\":\"content\",\"domains\":[\"*.filemobile.com\",\"*.projects.fm\"]},{\"name\":\"Nexcess.Net\",\"category\":\"hosting\",\"domains\":[\"*.nexcesscdn.net\"]},{\"name\":\"Nexstar Media Group\",\"category\":\"ad\",\"domains\":[\"*.yashi.com\"]},{\"name\":\"NextPerf\",\"company\":\"Rakuten Marketing\",\"category\":\"ad\",\"domains\":[\"*.nxtck.com\"]},{\"name\":\"Nine.com.au\",\"company\":\"Nine Digital\",\"category\":\"content\",\"domains\":[\"*.9msn.com.au\"]},{\"name\":\"NitroSell\",\"category\":\"hosting\",\"domains\":[\"*.nitrosell.com\"]},{\"name\":\"Nochex\",\"category\":\"utility\",\"domains\":[\"*.nochex.com\"]},{\"name\":\"Northern &amp; Shell Media Group\",\"category\":\"content\",\"domains\":[\"*.northernandshell.co.uk\"]},{\"name\":\"Nosto\",\"category\":\"analytics\",\"domains\":[\"*.nosto.com\"],\"totalExecutionTime\":484243,\"totalOccurrences\":1104},{\"name\":\"Now Interact\",\"category\":\"analytics\",\"domains\":[\"*.nowinteract.com\"]},{\"name\":\"Numberly\",\"company\":\"1000mercis\",\"category\":\"ad\",\"domains\":[\"*.mmtro.com\",\"*.nzaza.com\"],\"totalExecutionTime\":1026,\"totalOccurrences\":10},{\"name\":\"NyaConcepts\",\"category\":\"analytics\",\"domains\":[\"*.xclusive.ly\"]},{\"name\":\"O2\",\"category\":\"other\",\"domains\":[\"*.o2.co.uk\"],\"examples\":[\"servedby.o2.co.uk\"]},{\"name\":\"GoDaddy\",\"homepage\":\"https://www.godaddy.com/\",\"category\":\"utility\",\"domains\":[\"*.godaddy.com\",\"*.wsimg.com\"],\"examples\":[\"ocsp.godaddy.com\",\"seal.godaddy.com\"],\"totalExecutionTime\":206546652,\"totalOccurrences\":131240},{\"name\":\"ObjectPlanet\",\"category\":\"analytics\",\"domains\":[\"*.easypolls.net\"],\"totalExecutionTime\":36690,\"totalOccurrences\":89},{\"name\":\"OhMyAd\",\"category\":\"ad\",\"domains\":[\"*.ohmyad.co\"],\"examples\":[\"pr.ohmyad.co\"]},{\"name\":\"Okas Concepts\",\"category\":\"utility\",\"domains\":[\"*.okasconcepts.com\"],\"totalExecutionTime\":1069031,\"totalOccurrences\":616},{\"name\":\"Okta\",\"category\":\"analytics\",\"domains\":[\"*.okta.com\"],\"totalExecutionTime\":478716,\"totalOccurrences\":2302},{\"name\":\"Olapic\",\"category\":\"content\",\"domains\":[\"*.photorank.me\"]},{\"name\":\"Ometria\",\"category\":\"analytics\",\"domains\":[\"*.ometria.com\"],\"totalExecutionTime\":13700,\"totalOccurrences\":158},{\"name\":\"Omniconvert\",\"category\":\"analytics\",\"domains\":[\"*.omniconvert.com\",\"d2tgfbvjf3q6hn.cloudfront.net\",\"d3vbj265bmdenw.cloudfront.net\"],\"totalExecutionTime\":120182,\"totalOccurrences\":417},{\"name\":\"Omniroot\",\"company\":\"Verizon\",\"category\":\"utility\",\"domains\":[\"*.omniroot.com\"],\"examples\":[\"ocsp.omniroot.com\",\"vassg142.ocsp.omniroot.com\"]},{\"name\":\"OnAudience\",\"company\":\"Cloud Technologies\",\"category\":\"ad\",\"domains\":[\"*.onaudience.com\"],\"totalExecutionTime\":2100,\"totalOccurrences\":1},{\"name\":\"OnScroll\",\"category\":\"ad\",\"domains\":[\"*.onscroll.com\"]},{\"name\":\"OnState\",\"category\":\"ad\",\"domains\":[\"*.onstate.co.uk\"]},{\"name\":\"OnYourMap\",\"category\":\"utility\",\"domains\":[\"*.onyourmap.com\"]},{\"name\":\"One by AOL\",\"company\":\"AOL\",\"category\":\"ad\",\"domains\":[\"*.adtechjp.com\",\"*.adtech.de\"]},{\"name\":\"One by AOL:Mobile\",\"company\":\"AOL\",\"category\":\"ad\",\"domains\":[\"*.nexage.com\"],\"examples\":[\"ads.nexage.com\",\"hb.nexage.com\"]},{\"name\":\"OneAll\",\"category\":\"analytics\",\"domains\":[\"*.oneall.com\"],\"totalExecutionTime\":114672,\"totalOccurrences\":543},{\"name\":\"OneSoon\",\"category\":\"analytics\",\"domains\":[\"*.adalyser.com\"],\"totalExecutionTime\":35094,\"totalOccurrences\":524},{\"name\":\"OneTag\",\"category\":\"ad\",\"domains\":[\"*.onetag-sys.com\"]},{\"name\":\"Onet\",\"category\":\"ad\",\"domains\":[\"*.onet.pl\"],\"totalExecutionTime\":554932,\"totalOccurrences\":831},{\"name\":\"Online Rewards\",\"company\":\"Mastercard\",\"category\":\"ad\",\"domains\":[\"*.loyaltygateway.com\"]},{\"name\":\"Online republic\",\"category\":\"content\",\"domains\":[\"*.imallcdn.net\"],\"totalExecutionTime\":66818,\"totalOccurrences\":57},{\"name\":\"Ooyala\",\"category\":\"ad\",\"domains\":[\"*.ooyala.com\"]},{\"name\":\"OpenTable\",\"company\":\"Priceline Group\",\"category\":\"content\",\"domains\":[\"*.opentable.com\",\"*.opentable.co.uk\",\"*.toptable.co.uk\"],\"examples\":[\"www.toptable.co.uk\"],\"totalExecutionTime\":352275,\"totalOccurrences\":4404},{\"name\":\"OpenX Ad Exchange\",\"company\":\"OpenX Technologies\",\"category\":\"ad\",\"domains\":[\"*.liftdna.com\"]},{\"name\":\"Opinion Stage\",\"category\":\"analytics\",\"domains\":[\"*.opinionstage.com\"],\"examples\":[\"www.opinionstage.com\"],\"totalExecutionTime\":73703,\"totalOccurrences\":115},{\"name\":\"OpinionBar\",\"category\":\"analytics\",\"domains\":[\"*.opinionbar.com\"]},{\"name\":\"Opta\",\"company\":\"Perform Group\",\"category\":\"content\",\"domains\":[\"*.opta.net\"],\"totalExecutionTime\":238500,\"totalOccurrences\":238},{\"name\":\"OptiMonk\",\"category\":\"ad\",\"domains\":[\"*.optimonk.com\"],\"totalExecutionTime\":9755332,\"totalOccurrences\":10689},{\"name\":\"Optilead\",\"category\":\"analytics\",\"domains\":[\"*.dyn-img.com\",\"*.leadcall.co.uk\",\"*.optilead.co.uk\"]},{\"name\":\"Optimatic\",\"category\":\"ad\",\"domains\":[\"*.optimatic.com\"],\"examples\":[\"synch.optimatic.com\"]},{\"name\":\"Optimise Media Group\",\"category\":\"utility\",\"domains\":[\"*.omguk.com\"],\"totalExecutionTime\":2137,\"totalOccurrences\":16},{\"name\":\"Optimost\",\"company\":\"OpenText\",\"category\":\"ad\",\"domains\":[\"*.optimost.com\"]},{\"name\":\"Optimove\",\"company\":\"Mobius Solutions\",\"category\":\"analytics\",\"domains\":[\"*.optimove.net\"],\"totalExecutionTime\":33623,\"totalOccurrences\":340},{\"name\":\"Optorb\",\"category\":\"ad\",\"domains\":[\"*.optorb.com\"]},{\"name\":\"Oracle\",\"category\":\"marketing\",\"domains\":[\"*.custhelp.com\",\"*.eloqua.com\",\"*.en25.com\",\"*.estara.com\",\"*.instantservice.com\"],\"totalExecutionTime\":481234,\"totalOccurrences\":475},{\"name\":\"Oracle Recommendations On Demand\",\"company\":\"Oracle\",\"category\":\"analytics\",\"domains\":[\"*.atgsvcs.com\"],\"totalExecutionTime\":8605,\"totalOccurrences\":97},{\"name\":\"Oracle Responsys\",\"company\":\"Oracle\",\"category\":\"marketing\",\"domains\":[\"*.adrsp.net\",\"*.responsys.net\"]},{\"name\":\"Order Security-VOID\",\"company\":\"Order Security\",\"category\":\"analytics\",\"domains\":[\"*.order-security.com\"]},{\"name\":\"Oriel\",\"category\":\"ad\",\"domains\":[\"*.oriel.io\"]},{\"name\":\"Outbrain\",\"homepage\":\"https://www.outbrain.com/\",\"category\":\"ad\",\"domains\":[\"*.outbrain.com\",\"*.outbrainimg.com\",\"*.visualrevenue.com\"],\"totalExecutionTime\":2784793,\"totalOccurrences\":14147},{\"name\":\"OverStream\",\"company\":\"Coull\",\"category\":\"ad\",\"domains\":[\"*.coull.com\"],\"examples\":[\"ex1.coull.com\"]},{\"name\":\"Overdrive\",\"category\":\"content\",\"domains\":[\"*.contentreserve.com\"]},{\"name\":\"Overstock\",\"category\":\"utility\",\"domains\":[\"*.ostkcdn.com\"]},{\"name\":\"OwnerIQ\",\"category\":\"ad\",\"domains\":[\"*.owneriq.net\"],\"totalExecutionTime\":246134,\"totalOccurrences\":1787},{\"name\":\"OzCart\",\"category\":\"utility\",\"domains\":[\"*.ozcart.com.au\"]},{\"name\":\"Ozone Media\",\"category\":\"ad\",\"domains\":[\"*.adadyn.com\"]},{\"name\":\"Loqate\",\"company\":\"Loqate\",\"category\":\"other\",\"domains\":[\"*.pcapredict.com\",\"*.postcodeanywhere.co.uk\"],\"totalExecutionTime\":113456,\"totalOccurrences\":846},{\"name\":\"PEER 1 Hosting\",\"category\":\"hosting\",\"domains\":[\"*.peer1.com\"]},{\"name\":\"PERFORM\",\"category\":\"content\",\"domains\":[\"*.performgroup.com\"]},{\"name\":\"PICnet\",\"category\":\"hosting\",\"domains\":[\"*.nonprofitsoapbox.com\"]},{\"name\":\"Pacnet\",\"company\":\"Telstra\",\"category\":\"other\",\"domains\":[\"*.cdndelivery.net\"],\"examples\":[\"682968324.r.cdndelivery.net\"]},{\"name\":\"Pagefair\",\"category\":\"ad\",\"domains\":[\"*.pagefair.com\",\"*.pagefair.net\"]},{\"name\":\"Pagely\",\"category\":\"other\",\"domains\":[\"*.optnmstr.com\"],\"totalExecutionTime\":84207,\"totalOccurrences\":399},{\"name\":\"Pagesuite\",\"category\":\"ad\",\"domains\":[\"*.pagesuite-professional.co.uk\"],\"totalExecutionTime\":6,\"totalOccurrences\":1},{\"name\":\"Pardot\",\"category\":\"marketing\",\"domains\":[\"*.pardot.com\"],\"totalExecutionTime\":64404,\"totalOccurrences\":475},{\"name\":\"Parse.ly\",\"category\":\"analytics\",\"domains\":[\"*.parsely.com\",\"d1z2jf7jlzjs58.cloudfront.net\"],\"totalExecutionTime\":982313,\"totalOccurrences\":5079},{\"name\":\"Pay per Click\",\"company\":\"Eysys\",\"category\":\"ad\",\"domains\":[\"*.eysys.com\"],\"examples\":[\"pla27.eysys.com\"]},{\"name\":\"PayPal Ads\",\"category\":\"ad\",\"domains\":[\"*.where.com\"]},{\"name\":\"Peaks & Pies\",\"category\":\"analytics\",\"domains\":[\"*.bunchbox.co\"]},{\"name\":\"PebblePost\",\"category\":\"ad\",\"domains\":[\"*.pbbl.co\"],\"totalExecutionTime\":105528,\"totalOccurrences\":542},{\"name\":\"Peerius\",\"category\":\"analytics\",\"domains\":[\"*.peerius.com\"]},{\"name\":\"Peermap\",\"company\":\"IMRG\",\"category\":\"analytics\",\"domains\":[\"peermapcontent.affino.com\"]},{\"name\":\"Penske Media\",\"category\":\"content\",\"domains\":[\"*.pmc.com\"]},{\"name\":\"Penton\",\"category\":\"utility\",\"domains\":[\"*.pisces-penton.com\"]},{\"name\":\"Pepper\",\"category\":\"ad\",\"domains\":[\"*.peppercorp.com\"]},{\"name\":\"Perfect Audience\",\"company\":\"Marin Software\",\"category\":\"ad\",\"domains\":[\"*.prfct.co\",\"*.marinsm.com\",\"*.perfectaudience.com\"],\"totalExecutionTime\":182,\"totalOccurrences\":3},{\"name\":\"Perfect Market\",\"category\":\"ad\",\"domains\":[\"*.perfectmarket.com\"]},{\"name\":\"Perfect Privacy\",\"category\":\"other\",\"domains\":[\"*.suitesmart.com\"]},{\"name\":\"Perform Group\",\"category\":\"content\",\"domains\":[\"*.performfeeds.com\",\"*.premiumtv.co.uk\"]},{\"name\":\"Performio\",\"category\":\"ad\",\"domains\":[\"*.performax.cz\"],\"examples\":[\"ut.performax.cz\"],\"totalExecutionTime\":198159,\"totalOccurrences\":585},{\"name\":\"PerimeterX Bot Defender\",\"company\":\"PerimeterX\",\"category\":\"utility\",\"domains\":[\"*.perimeterx.net\",\"*.pxi.pub\"],\"totalExecutionTime\":19185,\"totalOccurrences\":16},{\"name\":\"Periscope\",\"category\":\"content\",\"domains\":[\"*.periscope.tv\"]},{\"name\":\"Permutive\",\"category\":\"ad\",\"domains\":[\"*.permutive.com\",\"d3alqb8vzo7fun.cloudfront.net\"],\"totalExecutionTime\":1157225,\"totalOccurrences\":1030},{\"name\":\"Petametrics\",\"category\":\"analytics\",\"domains\":[\"*.petametrics.com\"]},{\"name\":\"PhotoBucket\",\"category\":\"content\",\"domains\":[\"*.photobucket.com\"],\"totalExecutionTime\":28191,\"totalOccurrences\":16},{\"name\":\"Picreel\",\"category\":\"analytics\",\"domains\":[\"*.pcrl.co\",\"*.picreel.com\"],\"totalExecutionTime\":36005,\"totalOccurrences\":290},{\"name\":\"Pictela (AOL)\",\"category\":\"analytics\",\"domains\":[\"*.pictela.net\"]},{\"name\":\"PistonHeads\",\"category\":\"social\",\"domains\":[\"*.pistonheads.com\"]},{\"name\":\"Piwik\",\"category\":\"analytics\",\"domains\":[\"*.drtvtracker.com\",\"*.piwikpro.com\",\"*.raac33.net\"]},{\"name\":\"Pixalate\",\"category\":\"utility\",\"domains\":[\"*.adrta.com\"],\"totalExecutionTime\":84287,\"totalOccurrences\":57},{\"name\":\"Pixlee\",\"category\":\"social\",\"domains\":[\"*.pixlee.com\"],\"totalExecutionTime\":122114,\"totalOccurrences\":347},{\"name\":\"Placed\",\"category\":\"analytics\",\"domains\":[\"*.placed.com\"],\"totalExecutionTime\":545,\"totalOccurrences\":1},{\"name\":\"Planning-inc\",\"category\":\"analytics\",\"domains\":[\"*.planning-inc.co.uk\"]},{\"name\":\"PlayAd Media Group\",\"category\":\"ad\",\"domains\":[\"*.youplay.se\"]},{\"name\":\"Playbuzz\",\"category\":\"hosting\",\"domains\":[\"*.playbuzz.com\"],\"totalExecutionTime\":29608,\"totalOccurrences\":60},{\"name\":\"Pleenq\",\"category\":\"ad\",\"domains\":[\"*.pleenq.com\"]},{\"name\":\"Plentific\",\"category\":\"content\",\"domains\":[\"*.plentific.com\"]},{\"name\":\"PluginDetect\",\"category\":\"other\",\"domains\":[\"dtlilztwypawv.cloudfront.net\"]},{\"name\":\"Po.st\",\"company\":\"RadiumOne\",\"category\":\"utility\",\"domains\":[\"*.po.st\"],\"totalExecutionTime\":1985,\"totalOccurrences\":16},{\"name\":\"Pointpin\",\"category\":\"utility\",\"domains\":[\"*.pointp.in\"]},{\"name\":\"Pointroll (Garnett)\",\"category\":\"ad\",\"domains\":[\"*.pointroll.com\"]},{\"name\":\"Polar\",\"homepage\":\"https://polar.me/\",\"category\":\"ad\",\"domains\":[\"*.polarmobile.ca\",\"*.mediaeverywhere.com\",\"*.mediavoice.com\",\"*.plrsrvcs.com\",\"*.polarcdn-engine.com\",\"*.polarcdn-meraxes.com\",\"*.polarcdn-pentos.com\",\"*.polarcdn-static.com\",\"*.polarcdn-terrax.com\",\"*.polarcdn.com\",\"*.polarmobile.com\",\"*.poweredbypolar.com\",\"*.mediaconductor.me\",\"*.polaracademy.me\"],\"totalExecutionTime\":228005,\"totalOccurrences\":448},{\"name\":\"PollDaddy (Automattic)\",\"category\":\"ad\",\"domains\":[\"static.polldaddy.com\",\"*.poll.fm\"],\"totalExecutionTime\":2918,\"totalOccurrences\":42},{\"name\":\"Polldaddy\",\"company\":\"Automattic\",\"category\":\"analytics\",\"domains\":[\"polldaddy.com\",\"*.polldaddy.com\"],\"totalExecutionTime\":9116,\"totalOccurrences\":74},{\"name\":\"Polyfill service\",\"company\":\"Polyfill.io\",\"category\":\"other\",\"domains\":[\"*.polyfill.io\"]},{\"name\":\"MegaPopAds\",\"category\":\"ad\",\"domains\":[\"*.megapopads.com\"]},{\"name\":\"Populis\",\"category\":\"ad\",\"domains\":[\"*.populisengage.com\"]},{\"name\":\"Postimage.org\",\"category\":\"content\",\"domains\":[\"*.postimg.org\"]},{\"name\":\"PowerFront\",\"category\":\"hosting\",\"domains\":[\"*.inside-graph.com\"],\"totalExecutionTime\":220344,\"totalOccurrences\":387},{\"name\":\"PowerReviews\",\"category\":\"analytics\",\"domains\":[\"*.powerreviews.com\"],\"totalExecutionTime\":1108688,\"totalOccurrences\":1433},{\"name\":\"Powerlinks.com\",\"category\":\"ad\",\"domains\":[\"*.powerlinks.com\"]},{\"name\":\"Press+\",\"category\":\"ad\",\"domains\":[\"*.pipol.com\",\"*.ppjol.com\",\"*.ppjol.net\"]},{\"name\":\"PressArea\",\"category\":\"utility\",\"domains\":[\"*.pressarea.com\"],\"examples\":[\"www.pressarea.com\"]},{\"name\":\"Pretio Interactive\",\"category\":\"ad\",\"domains\":[\"*.pretio.in\"]},{\"name\":\"Prezi\",\"category\":\"utility\",\"domains\":[\"*.prezi.com\"],\"totalExecutionTime\":51849,\"totalOccurrences\":67},{\"name\":\"PriceGrabber\",\"category\":\"content\",\"domains\":[\"*.pgcdn.com\",\"*.pricegrabber.com\"]},{\"name\":\"PriceRunner\",\"category\":\"content\",\"domains\":[\"*.pricerunner.com\"],\"totalExecutionTime\":919,\"totalOccurrences\":3},{\"name\":\"PrintFriendly\",\"category\":\"utility\",\"domains\":[\"*.printfriendly.com\"],\"totalExecutionTime\":49913,\"totalOccurrences\":428},{\"name\":\"Privy\",\"category\":\"ad\",\"domains\":[\"*.privy.com\",\"*.privymktg.com\"],\"totalExecutionTime\":23092373,\"totalOccurrences\":17061},{\"name\":\"Proclivity Media\",\"category\":\"analytics\",\"domains\":[\"*.pswec.com\"]},{\"name\":\"Profitshare\",\"category\":\"ad\",\"domains\":[\"*.profitshare.ro\"],\"totalExecutionTime\":37598,\"totalOccurrences\":153},{\"name\":\"Programattik\",\"category\":\"ad\",\"domains\":[\"*.programattik.com\"],\"totalExecutionTime\":29,\"totalOccurrences\":4},{\"name\":\"Proper Media\",\"category\":\"content\",\"domains\":[\"*.proper.io\"],\"totalExecutionTime\":64562,\"totalOccurrences\":37},{\"name\":\"Property Week\",\"category\":\"content\",\"domains\":[\"*.propertyweek.com\"],\"examples\":[\"www.propertyweek.com\"]},{\"name\":\"Provide Support\",\"category\":\"customer-success\",\"domains\":[\"*.providesupport.com\"],\"totalExecutionTime\":83280,\"totalOccurrences\":1181},{\"name\":\"Proweb Uk\",\"category\":\"hosting\",\"domains\":[\"*.proweb.net\"]},{\"name\":\"Proximic (ComScore)\",\"category\":\"ad\",\"domains\":[\"*.proximic.com\"]},{\"name\":\"Psyma\",\"category\":\"ad\",\"domains\":[\"*.psyma.com\"],\"totalExecutionTime\":2828,\"totalOccurrences\":3},{\"name\":\"PubFactory\",\"company\":\"Safari Books Online\",\"category\":\"content\",\"domains\":[\"*.pubfactory.com\"]},{\"name\":\"PubNation\",\"category\":\"ad\",\"domains\":[\"*.pubnation.com\"],\"totalExecutionTime\":1117875,\"totalOccurrences\":144},{\"name\":\"Publicidad.net\",\"category\":\"ad\",\"domains\":[\"*.publicidad.tv\"]},{\"name\":\"PublishThis\",\"company\":\"Ultra Unlimited\",\"category\":\"ad\",\"domains\":[\"*.publishthis.com\"]},{\"name\":\"Pulse Insights\",\"category\":\"analytics\",\"domains\":[\"*.pulseinsights.com\"],\"totalExecutionTime\":6211,\"totalOccurrences\":60},{\"name\":\"Pulsepoint\",\"category\":\"marketing\",\"domains\":[\"*.displaymarketplace.com\"]},{\"name\":\"Purch\",\"category\":\"ad\",\"domains\":[\"*.bestofmedia.com\",\"*.purch.com\"],\"examples\":[\"ramp.purch.com\"]},{\"name\":\"Pure Chat\",\"category\":\"customer-success\",\"domains\":[\"*.purechat.com\"],\"totalExecutionTime\":863946,\"totalOccurrences\":2589},{\"name\":\"PushCrew\",\"category\":\"ad\",\"domains\":[\"*.pushcrew.com\"],\"totalExecutionTime\":136004,\"totalOccurrences\":721},{\"name\":\"Q1Media\",\"category\":\"ad\",\"domains\":[\"*.q1media.com\",\"*.q1mediahydraplatform.com\"]},{\"name\":\"Qbase Software Development\",\"category\":\"hosting\",\"domains\":[\"*.smartwebportal.co.uk\"]},{\"name\":\"Qeryz\",\"category\":\"analytics\",\"domains\":[\"*.qeryz.com\"]},{\"name\":\"Qode Interactive\",\"category\":\"hosting\",\"domains\":[\"*.qodeinteractive.com\"],\"totalExecutionTime\":2070659,\"totalOccurrences\":119},{\"name\":\"Qrius\",\"category\":\"social\",\"domains\":[\"*.qrius.me\"]},{\"name\":\"Qualaroo\",\"category\":\"analytics\",\"domains\":[\"*.qualaroo.com\"],\"totalExecutionTime\":49381,\"totalOccurrences\":364},{\"name\":\"Qualtrics\",\"category\":\"analytics\",\"domains\":[\"*.qualtrics.com\"],\"totalExecutionTime\":5030949,\"totalOccurrences\":7061},{\"name\":\"Qubit\",\"company\":\"Qubit\",\"category\":\"analytics\",\"domains\":[\"*.qubit.com\",\"*.qutics.com\",\"d3c3cq33003psk.cloudfront.net\",\"*.goqubit.com\",\"*.qubitproducts.com\"],\"totalExecutionTime\":67499,\"totalOccurrences\":63},{\"name\":\"Qubit Deliver\",\"company\":\"Qubit\",\"category\":\"analytics\",\"domains\":[\"d1m54pdnjzjnhe.cloudfront.net\",\"d22rutvoghj3db.cloudfront.net\",\"dd6zx4ibq538k.cloudfront.net\"]},{\"name\":\"QuestionPro\",\"category\":\"analytics\",\"domains\":[\"*.questionpro.com\"],\"totalExecutionTime\":54663,\"totalOccurrences\":140},{\"name\":\"Queue-it\",\"category\":\"other\",\"domains\":[\"*.queue-it.net\"],\"totalExecutionTime\":66067,\"totalOccurrences\":199},{\"name\":\"QuinStreet\",\"category\":\"ad\",\"domains\":[\"*.Quinstreet.com\",\"*.b2btechleadform.com\",\"*.qnsr.com\",\"*.qsstats.com\"],\"examples\":[\"www.qsstats.com\"]},{\"name\":\"QuoVadis\",\"category\":\"utility\",\"domains\":[\"*.quovadisglobal.com\"]},{\"name\":\"Qzzr\",\"category\":\"analytics\",\"domains\":[\"*.movementventures.com\",\"*.qzzr.com\"],\"examples\":[\"www.qzzr.com\"]},{\"name\":\"RapidAPI\",\"category\":\"utility\",\"domains\":[\"*.rapidapi.com\"],\"examples\":[\"telize-v1.p.rapidapi.com\"],\"totalExecutionTime\":43,\"totalOccurrences\":2},{\"name\":\"RCS Media Group\",\"category\":\"ad\",\"domains\":[\"*.rcsadv.it\"]},{\"name\":\"REVIVVE\",\"category\":\"ad\",\"domains\":[\"*.revivve.com\"]},{\"name\":\"RSSinclude\",\"category\":\"social\",\"domains\":[\"*.rssinclude.com\"]},{\"name\":\"RTB House AdPilot\",\"company\":\"RTB House\",\"category\":\"ad\",\"domains\":[\"*.erne.co\",\"*.creativecdn.com\"],\"totalExecutionTime\":978791,\"totalOccurrences\":8247},{\"name\":\"RTB Media\",\"category\":\"ad\",\"domains\":[\"*.rtb-media.me\"]},{\"name\":\"RUN\",\"category\":\"ad\",\"domains\":[\"*.runadtag.com\",\"*.rundsp.com\"]},{\"name\":\"Rackspace\",\"category\":\"hosting\",\"domains\":[\"*.rackcdn.com\",\"*.rackspacecloud.com\",\"*.raxcdn.com\",\"*.websitetestlink.com\"],\"totalExecutionTime\":3326196,\"totalOccurrences\":2405},{\"name\":\"RadiumOne\",\"category\":\"ad\",\"domains\":[\"*.gwallet.com\",\"*.r1-cdn.net\"]},{\"name\":\"Rakuten DC Storm\",\"company\":\"Rakuten\",\"category\":\"analytics\",\"domains\":[\"*.dc-storm.com\",\"*.h4k5.com\",\"*.stormiq.com\"]},{\"name\":\"Rakuten LinkShare\",\"company\":\"Rakuten\",\"category\":\"ad\",\"domains\":[\"*.linksynergy.com\"],\"totalExecutionTime\":16039,\"totalOccurrences\":133},{\"name\":\"Rakuten Marketing\",\"company\":\"Rakuten\",\"category\":\"ad\",\"domains\":[\"*.rakuten-static.com\",\"*.rmtag.com\",\"tag.rmp.rakuten.com\"],\"totalExecutionTime\":401632,\"totalOccurrences\":3257},{\"name\":\"Rakuten MediaForge\",\"company\":\"Rakuten\",\"category\":\"ad\",\"domains\":[\"*.mediaforge.com\"]},{\"name\":\"Rambler\",\"company\":\"Rambler & Co\",\"category\":\"utility\",\"domains\":[\"*.rambler.ru\"],\"totalExecutionTime\":24283103,\"totalOccurrences\":13681},{\"name\":\"Ranker\",\"category\":\"content\",\"domains\":[\"*.ranker.com\",\"*.rnkr-static.com\"]},{\"name\":\"Ravelin\",\"category\":\"utility\",\"domains\":[\"*.ravelin.com\"]},{\"name\":\"Raygun\",\"category\":\"utility\",\"domains\":[\"*.raygun.io\",\"*.rapidzebra.io\"],\"totalExecutionTime\":206706,\"totalOccurrences\":2102},{\"name\":\"ReCollect\",\"category\":\"utility\",\"domains\":[\"*.recollect.net\"],\"totalExecutionTime\":198653,\"totalOccurrences\":129},{\"name\":\"ReSRC\",\"category\":\"utility\",\"domains\":[\"*.resrc.it\"]},{\"name\":\"ReTargeter\",\"category\":\"ad\",\"domains\":[\"*.retargeter.com\"]},{\"name\":\"Reach Group\",\"category\":\"ad\",\"domains\":[\"*.redintelligence.net\"],\"totalExecutionTime\":1024,\"totalOccurrences\":161},{\"name\":\"ReachDynamics\",\"category\":\"ad\",\"domains\":[\"*.rdcdn.com\"]},{\"name\":\"ReachForce\",\"category\":\"ad\",\"domains\":[\"*.reachforce.com\"]},{\"name\":\"ReachLocal\",\"category\":\"ad\",\"domains\":[\"*.rtrk.co.nz\"],\"examples\":[\"rtsys.rtrk.co.nz\"]},{\"name\":\"ReachMee\",\"category\":\"content\",\"domains\":[\"*.reachmee.com\"],\"totalExecutionTime\":126303,\"totalOccurrences\":44},{\"name\":\"Reactful\",\"category\":\"analytics\",\"domains\":[\"*.reactful.com\"],\"totalExecutionTime\":8266,\"totalOccurrences\":34},{\"name\":\"Realtime\",\"company\":\"internet business technologies\",\"category\":\"utility\",\"domains\":[\"*.realtime.co\"]},{\"name\":\"Realtime Media (Brian Communications)\",\"category\":\"ad\",\"domains\":[\"*.rtm.com\"]},{\"name\":\"Realtime Targeting\",\"category\":\"ad\",\"domains\":[\"*.idtargeting.com\"]},{\"name\":\"Realytics\",\"category\":\"analytics\",\"domains\":[\"dcniko1cv0rz.cloudfront.net\",\"*.realytics.net\"],\"totalExecutionTime\":31200,\"totalOccurrences\":260},{\"name\":\"RebelMouse\",\"category\":\"ad\",\"domains\":[\"*.rebelmouse.com\",\"*.rbl.ms\"],\"examples\":[\"www.rebelmouse.com\"],\"totalExecutionTime\":3204,\"totalOccurrences\":16},{\"name\":\"Receiptful\",\"category\":\"utility\",\"domains\":[\"*.receiptful.com\"],\"totalExecutionTime\":42011,\"totalOccurrences\":315},{\"name\":\"Recite Me\",\"category\":\"other\",\"domains\":[\"*.reciteme.com\"],\"totalExecutionTime\":35649,\"totalOccurrences\":134},{\"name\":\"RecoBell\",\"category\":\"analytics\",\"domains\":[\"*.recobell.io\"]},{\"name\":\"Recommend\",\"category\":\"analytics\",\"domains\":[\"*.recommend.pro\"]},{\"name\":\"Red Eye International\",\"category\":\"ad\",\"domains\":[\"*.pajmc.com\"]},{\"name\":\"Redfish Group\",\"category\":\"ad\",\"domains\":[\"*.wmps.com\"]},{\"name\":\"Reevoo\",\"category\":\"analytics\",\"domains\":[\"*.reevoo.com\"],\"totalExecutionTime\":56157,\"totalOccurrences\":126},{\"name\":\"Refersion\",\"category\":\"ad\",\"domains\":[\"*.refersion.com\"],\"totalExecutionTime\":153203,\"totalOccurrences\":903},{\"name\":\"Refined Ads\",\"category\":\"ad\",\"domains\":[\"*.refinedads.com\"]},{\"name\":\"Reflektion\",\"category\":\"analytics\",\"domains\":[\"*.reflektion.com\",\"d26opx5dl8t69i.cloudfront.net\"]},{\"name\":\"Reflow\",\"company\":\"Scenestealer\",\"category\":\"ad\",\"domains\":[\"*.reflow.tv\"]},{\"name\":\"Reklama\",\"category\":\"ad\",\"domains\":[\"*.o2.pl\",\"*.wp.pl\"],\"examples\":[\"dot.wp.pl\",\"px.o2.pl\",\"px.wp.pl\"],\"totalExecutionTime\":494604,\"totalOccurrences\":1133},{\"name\":\"Relevad ReleStar\",\"company\":\"Relevad\",\"category\":\"ad\",\"domains\":[\"*.relestar.com\"]},{\"name\":\"Remarketing Pixel\",\"company\":\"Adsterra Network\",\"category\":\"ad\",\"domains\":[\"*.datadbs.com\",\"*.remarketingpixel.com\"]},{\"name\":\"Remintrex\",\"company\":\"SmartUp Venture\",\"category\":\"ad\",\"domains\":[\"*.remintrex.com\"]},{\"name\":\"Republer\",\"category\":\"ad\",\"domains\":[\"*.republer.com\"],\"examples\":[\"sync.republer.com\"]},{\"name\":\"Research Now\",\"category\":\"analytics\",\"domains\":[\"*.researchgnow.com\",\"*.researchnow.com\"],\"examples\":[\"tag.researchgnow.com\"],\"totalExecutionTime\":126,\"totalOccurrences\":1},{\"name\":\"Research Online\",\"company\":\"Skills Development Scotland\",\"category\":\"content\",\"domains\":[\"*.researchonline.org.uk\"],\"examples\":[\"www.researchonline.org.uk\"]},{\"name\":\"Resonance Insights\",\"category\":\"analytics\",\"domains\":[\"*.res-x.com\"],\"totalExecutionTime\":138,\"totalOccurrences\":1},{\"name\":\"Resonate Networks\",\"category\":\"analytics\",\"domains\":[\"*.reson8.com\"],\"totalExecutionTime\":1897,\"totalOccurrences\":1},{\"name\":\"Response Team\",\"category\":\"ad\",\"domains\":[\"*.i-transactads.com\"]},{\"name\":\"ResponseTap\",\"category\":\"analytics\",\"domains\":[\"*.adinsight.com\",\"*.responsetap.com\"],\"totalExecutionTime\":55228,\"totalOccurrences\":219},{\"name\":\"ResponsiveVoice\",\"category\":\"other\",\"domains\":[\"*.responsivevoice.org\"],\"totalExecutionTime\":709521,\"totalOccurrences\":6819},{\"name\":\"Retention Science\",\"category\":\"ad\",\"domains\":[\"*.retentionscience.com\",\"d1stxfv94hrhia.cloudfront.net\"],\"totalExecutionTime\":13751,\"totalOccurrences\":181},{\"name\":\"Revcontent\",\"category\":\"content\",\"domains\":[\"*.revcontent.com\"],\"totalExecutionTime\":1023233,\"totalOccurrences\":1284},{\"name\":\"Revee\",\"category\":\"ad\",\"domains\":[\"*.revee.com\"]},{\"name\":\"Revenue Conduit\",\"category\":\"utility\",\"domains\":[\"*.revenueconduit.com\"]},{\"name\":\"RevenueMantra\",\"category\":\"ad\",\"domains\":[\"*.revenuemantra.com\"]},{\"name\":\"Reviews.co.uk\",\"category\":\"analytics\",\"domains\":[\"*.reviews.co.uk\"],\"totalExecutionTime\":370250,\"totalOccurrences\":1840},{\"name\":\"Reviews.io\",\"category\":\"analytics\",\"domains\":[\"*.reviews.io\"],\"totalExecutionTime\":1763358,\"totalOccurrences\":4739},{\"name\":\"Revolver Maps\",\"category\":\"analytics\",\"domains\":[\"*.revolvermaps.com\"]},{\"name\":\"Revv\",\"category\":\"utility\",\"domains\":[\"*.revv.co\"],\"totalExecutionTime\":31301,\"totalOccurrences\":16},{\"name\":\"RichRelevance\",\"category\":\"analytics\",\"domains\":[\"*.richrelevance.com\"],\"totalExecutionTime\":14044,\"totalOccurrences\":12},{\"name\":\"RightNow Service Cloud\",\"company\":\"Oracle\",\"category\":\"customer-success\",\"domains\":[\"*.rightnowtech.com\",\"*.rnengage.com\"],\"totalExecutionTime\":5127,\"totalOccurrences\":73},{\"name\":\"Rightster\",\"category\":\"ad\",\"domains\":[\"*.ads-creativesyndicator.com\"]},{\"name\":\"Riskified\",\"category\":\"utility\",\"domains\":[\"*.riskified.com\"],\"totalExecutionTime\":336079,\"totalOccurrences\":1644},{\"name\":\"Rockerbox\",\"category\":\"analytics\",\"homepage\":\"https://www.rockerbox.com/\",\"domains\":[\"getrockerbox.com\"],\"examples\":[\"getrockerbox.com\"],\"totalExecutionTime\":14549,\"totalOccurrences\":176},{\"name\":\"Rocket Fuel\",\"category\":\"ad\",\"domains\":[\"*.rfihub.com\",\"*.ru4.com\",\"*.rfihub.net\",\"*.ad1x.com\"],\"totalExecutionTime\":239663,\"totalOccurrences\":1951},{\"name\":\"Rollbar\",\"category\":\"utility\",\"domains\":[\"*.rollbar.com\",\"d37gvrvc0wt4s1.cloudfront.net\"],\"examples\":[\"api.rollbar.com\"],\"totalExecutionTime\":205929,\"totalOccurrences\":2508},{\"name\":\"RomanCart\",\"category\":\"utility\",\"domains\":[\"*.romancart.com\"],\"totalExecutionTime\":232,\"totalOccurrences\":4},{\"name\":\"Rondavu\",\"category\":\"ad\",\"domains\":[\"*.rondavu.com\"]},{\"name\":\"Roomkey\",\"category\":\"content\",\"domains\":[\"*.roomkey.com\"],\"examples\":[\"www.roomkey.com\"]},{\"name\":\"Roost\",\"category\":\"utility\",\"domains\":[\"*.goroost.com\"]},{\"name\":\"Roxot\",\"category\":\"ad\",\"domains\":[\"*.rxthdr.com\"]},{\"name\":\"Roxr Software\",\"category\":\"analytics\",\"domains\":[\"*.getclicky.com\"],\"totalExecutionTime\":677637,\"totalOccurrences\":11135},{\"name\":\"Rtoaster\",\"company\":\"Brainpad\",\"homepage\":\"https://www.brainpad.co.jp/rtoaster/\",\"category\":\"marketing\",\"domains\":[\"*.rtoaster.jp\"],\"examples\":[\"rt.rtoaster.jp\"],\"totalExecutionTime\":15537,\"totalOccurrences\":95},{\"name\":\"Rubikloud.com\",\"category\":\"analytics\",\"domains\":[\"*.rubikloud.com\"]},{\"name\":\"Ruler Analytics\",\"company\":\"Ruler\",\"category\":\"analytics\",\"domains\":[\"*.nyltx.com\",\"*.ruleranalytics.com\"],\"examples\":[\"www.ruleranalytics.com\"],\"totalExecutionTime\":33140,\"totalOccurrences\":434},{\"name\":\"Runner\",\"company\":\"Rambler & Co\",\"category\":\"content\",\"domains\":[\"*.begun.ru\"]},{\"name\":\"S4M\",\"category\":\"ad\",\"domains\":[\"*.sam4m.com\"]},{\"name\":\"SAP Hybris Marketing Convert\",\"company\":\"SAP\",\"category\":\"ad\",\"domains\":[\"*.seewhy.com\"]},{\"name\":\"SAS Institute\",\"category\":\"ad\",\"domains\":[\"*.aimatch.com\",\"*.sas.com\"],\"totalExecutionTime\":65629,\"totalOccurrences\":23},{\"name\":\"SATORI\",\"homepage\":\"https://satori.marketing/\",\"category\":\"marketing\",\"domains\":[\"satori.segs.jp\"],\"examples\":[\"satori.segs.jp/s.js\"],\"totalExecutionTime\":55620,\"totalOccurrences\":757},{\"name\":\"SC ShopMania Net SRL\",\"category\":\"content\",\"domains\":[\"*.shopmania.com\"]},{\"name\":\"SDL Media Manager\",\"company\":\"SDL\",\"category\":\"other\",\"domains\":[\"*.sdlmedia.com\"]},{\"name\":\"SFR\",\"category\":\"other\",\"domains\":[\"*.sfr.fr\"],\"examples\":[\"elr.sfr.fr\"]},{\"name\":\"SLI Systems\",\"category\":\"utility\",\"domains\":[\"*.resultslist.com\",\"*.resultspage.com\",\"*.sli-spark.com\"],\"totalExecutionTime\":2346,\"totalOccurrences\":28},{\"name\":\"SMARTASSISTANT\",\"company\":\"Smart Information Systems\",\"category\":\"customer-success\",\"domains\":[\"*.smartassistant.com\"]},{\"name\":\"SMARTSTREAM.TV\",\"category\":\"ad\",\"domains\":[\"*.smartstream.tv\"]},{\"name\":\"SPX\",\"company\":\"Smaato\",\"category\":\"ad\",\"domains\":[\"*.smaato.net\"],\"totalExecutionTime\":146,\"totalOccurrences\":5},{\"name\":\"Sabio\",\"category\":\"customer-success\",\"domains\":[\"*.sabio.co.uk\"],\"examples\":[\"www.sabio.co.uk\"]},{\"name\":\"Sailthru\",\"category\":\"analytics\",\"domains\":[\"*.sail-horizon.com\",\"*.sail-personalize.com\",\"*.sail-track.com\"],\"totalExecutionTime\":124792,\"totalOccurrences\":1328},{\"name\":\"Sailthru Sightlines\",\"company\":\"Sailthru\",\"category\":\"marketing\",\"domains\":[\"*.sailthru.com\"],\"totalExecutionTime\":7530,\"totalOccurrences\":29},{\"name\":\"Sajari Pty\",\"category\":\"utility\",\"domains\":[\"*.sajari.com\"],\"totalExecutionTime\":32211,\"totalOccurrences\":130},{\"name\":\"SaleCycle\",\"category\":\"ad\",\"domains\":[\"*.salecycle.com\",\"d16fk4ms6rqz1v.cloudfront.net\",\"d22j4fzzszoii2.cloudfront.net\",\"d30ke5tqu2tkyx.cloudfront.net\",\"dn1i8v75r669j.cloudfront.net\"],\"totalExecutionTime\":113684,\"totalOccurrences\":453},{\"name\":\"Salesforce Live Agent\",\"company\":\"Salesforce.com\",\"category\":\"customer-success\",\"domains\":[\"*.salesforceliveagent.com\"],\"totalExecutionTime\":112980,\"totalOccurrences\":697},{\"name\":\"Salesforce.com\",\"category\":\"ad\",\"domains\":[\"*.force.com\",\"*.salesforce.com\"],\"examples\":[\"secure.force.com\"],\"totalExecutionTime\":1694077,\"totalOccurrences\":4825},{\"name\":\"Samba TV\",\"company\":\"Samba\",\"category\":\"content\",\"domains\":[\"*.samba.tv\"],\"totalExecutionTime\":310,\"totalOccurrences\":6},{\"name\":\"Samplicio.us\",\"category\":\"analytics\",\"domains\":[\"*.samplicio.us\"],\"totalExecutionTime\":2029,\"totalOccurrences\":2},{\"name\":\"Say Media\",\"category\":\"ad\",\"domains\":[\"*.saymedia.com\"]},{\"name\":\"Scenario\",\"category\":\"analytics\",\"domains\":[\"*.getscenario.com\"]},{\"name\":\"Schuh (image shard)\",\"company\":\"Schuh\",\"category\":\"other\",\"domains\":[\"d2ob0iztsaxy5v.cloudfront.net\"]},{\"name\":\"Science Rockstars\",\"category\":\"analytics\",\"domains\":[\"*.persuasionapi.com\"]},{\"name\":\"ScientiaMobile\",\"category\":\"analytics\",\"domains\":[\"*.wurflcloud.com\",\"*.wurfl.io\"],\"totalExecutionTime\":163,\"totalOccurrences\":1},{\"name\":\"Scoota\",\"category\":\"ad\",\"domains\":[\"*.rockabox.co\",\"*.scoota.co\",\"d31i2625d5nv27.cloudfront.net\",\"dyjnzf8evxrp2.cloudfront.net\"]},{\"name\":\"ScribbleLive\",\"category\":\"ad\",\"domains\":[\"*.scribblelive.com\"]},{\"name\":\"SearchForce\",\"category\":\"ad\",\"domains\":[\"*.searchforce.net\"],\"totalExecutionTime\":24,\"totalOccurrences\":1},{\"name\":\"SearchSpring\",\"category\":\"utility\",\"domains\":[\"*.searchspring.net\"],\"totalExecutionTime\":814265,\"totalOccurrences\":282},{\"name\":\"Searchanise\",\"category\":\"analytics\",\"domains\":[\"*.searchanise.com\"],\"examples\":[\"www.searchanise.com\"],\"totalExecutionTime\":48948,\"totalOccurrences\":361},{\"name\":\"Sears Holdings\",\"category\":\"content\",\"domains\":[\"*.shld.net\"]},{\"name\":\"Secomapp\",\"category\":\"utility\",\"domains\":[\"*.secomapp.com\"],\"totalExecutionTime\":1591791,\"totalOccurrences\":1895},{\"name\":\"SecuredVisit\",\"company\":\"4Cite Marketing\",\"category\":\"ad\",\"domains\":[\"*.securedvisit.com\"],\"totalExecutionTime\":32963,\"totalOccurrences\":339},{\"name\":\"SecurityMetrics\",\"category\":\"utility\",\"domains\":[\"*.securitymetrics.com\"],\"totalExecutionTime\":6346,\"totalOccurrences\":2},{\"name\":\"Segmento\",\"category\":\"ad\",\"domains\":[\"*.rutarget.ru\"],\"totalExecutionTime\":10387,\"totalOccurrences\":219},{\"name\":\"Segmint\",\"category\":\"analytics\",\"domains\":[\"*.segmint.net\"],\"totalExecutionTime\":13768,\"totalOccurrences\":121},{\"name\":\"Sekindo\",\"category\":\"content\",\"domains\":[\"*.sekindo.com\"],\"totalExecutionTime\":354,\"totalOccurrences\":5},{\"name\":\"Seldon\",\"category\":\"analytics\",\"domains\":[\"*.rummblelabs.com\"]},{\"name\":\"SelectMedia International\",\"category\":\"content\",\"domains\":[\"*.selectmedia.asia\"],\"totalExecutionTime\":203405,\"totalOccurrences\":63},{\"name\":\"Selligent\",\"category\":\"ad\",\"domains\":[\"*.emsecure.net\",\"*.slgnt.eu\",\"targetemsecure.blob.core.windows.net\"],\"totalExecutionTime\":129811,\"totalOccurrences\":461},{\"name\":\"Sellpoints\",\"category\":\"analytics\",\"domains\":[\"*.sellpoints.com\"]},{\"name\":\"Semantics3\",\"category\":\"analytics\",\"domains\":[\"*.hits.io\"]},{\"name\":\"Semasio\",\"category\":\"analytics\",\"domains\":[\"*.semasio.net\"]},{\"name\":\"Semcasting Site Visitor Attribution\",\"company\":\"Semcasting\",\"category\":\"ad\",\"domains\":[\"*.smartzonessva.com\"]},{\"name\":\"Sentifi\",\"category\":\"social\",\"domains\":[\"*.sentifi.com\"]},{\"name\":\"ServMetric\",\"category\":\"analytics\",\"domains\":[\"*.servmetric.com\"]},{\"name\":\"ServiceSource International\",\"category\":\"marketing\",\"domains\":[\"*.scoutanalytics.net\"],\"examples\":[\"scout.scoutanalytics.net\"]},{\"name\":\"ServiceTick\",\"category\":\"analytics\",\"domains\":[\"*.servicetick.com\"]},{\"name\":\"Servo\",\"company\":\"Xervo\",\"category\":\"hosting\",\"domains\":[\"*.onmodulus.net\"]},{\"name\":\"SessionCam\",\"company\":\"ServiceTick\",\"category\":\"analytics\",\"domains\":[\"*.sessioncam.com\",\"d2oh4tlt9mrke9.cloudfront.net\"]},{\"name\":\"Seznam\",\"category\":\"utility\",\"domains\":[\"*.imedia.cz\"],\"totalExecutionTime\":1500542,\"totalOccurrences\":6333},{\"name\":\"Sharethrough\",\"category\":\"ad\",\"domains\":[\"*.sharethrough.com\"],\"totalExecutionTime\":36886,\"totalOccurrences\":705},{\"name\":\"SharpSpring\",\"category\":\"marketing\",\"domains\":[\"*.sharpspring.com\",\"*.marketingautomation.services\"],\"totalExecutionTime\":555029,\"totalOccurrences\":1573},{\"name\":\"ShopRunner\",\"category\":\"content\",\"domains\":[\"*.shoprunner.com\",\"*.s-9.us\"],\"totalExecutionTime\":31754,\"totalOccurrences\":30},{\"name\":\"ShopStorm\",\"category\":\"utility\",\"domains\":[\"*.shopstorm.com\"]},{\"name\":\"Shopatron\",\"category\":\"hosting\",\"domains\":[\"*.shopatron.com\"]},{\"name\":\"Shopgate\",\"category\":\"utility\",\"domains\":[\"*.shopgate.com\"],\"totalExecutionTime\":12387,\"totalOccurrences\":20},{\"name\":\"ShopiMind\",\"company\":\"ShopIMind\",\"category\":\"ad\",\"domains\":[\"*.shopimind.com\"]},{\"name\":\"Shopkeeper Tools\",\"category\":\"utility\",\"domains\":[\"*.shopkeepertools.com\"],\"totalExecutionTime\":627,\"totalOccurrences\":7},{\"name\":\"Sidecar\",\"category\":\"other\",\"domains\":[\"*.getsidecar.com\",\"d3v27wwd40f0xu.cloudfront.net\"]},{\"name\":\"Sidereel\",\"category\":\"analytics\",\"domains\":[\"*.sidereel.com\"]},{\"name\":\"Sift Science\",\"category\":\"utility\",\"domains\":[\"*.siftscience.com\"],\"totalExecutionTime\":91569,\"totalOccurrences\":253},{\"name\":\"Signal\",\"category\":\"tag-manager\",\"domains\":[\"*.sitetagger.co.uk\"]},{\"name\":\"Signyfyd\",\"category\":\"utility\",\"domains\":[\"*.signifyd.com\"],\"totalExecutionTime\":4958799,\"totalOccurrences\":2620},{\"name\":\"Silktide\",\"category\":\"hosting\",\"domains\":[\"*.silktide.com\"],\"totalExecutionTime\":131283,\"totalOccurrences\":494},{\"name\":\"Silverpop\",\"company\":\"IBM\",\"category\":\"ad\",\"domains\":[\"*.mkt912.com\",\"*.mkt922.com\",\"*.mkt932.com\",\"*.mkt941.com\",\"*.mkt51.net\",\"*.mkt61.net\",\"*.pages01.net\",\"*.pages02.net\",\"*.pages03.net\",\"*.pages04.net\",\"*.pages05.net\"],\"totalExecutionTime\":4098,\"totalOccurrences\":52},{\"name\":\"Simplaex\",\"category\":\"marketing\",\"domains\":[\"*.simplaex.net\"]},{\"name\":\"SimpleReach\",\"category\":\"analytics\",\"domains\":[\"*.simplereach.com\",\"d8rk54i4mohrb.cloudfront.net\"]},{\"name\":\"Simplestream\",\"category\":\"content\",\"domains\":[\"*.simplestream.com\"],\"examples\":[\"player.simplestream.com\"]},{\"name\":\"Simpli.fi\",\"category\":\"ad\",\"domains\":[\"*.simpli.fi\"],\"totalExecutionTime\":203012,\"totalOccurrences\":3663},{\"name\":\"Simplicity Marketing\",\"category\":\"ad\",\"domains\":[\"*.flashtalking.com\"],\"totalExecutionTime\":359478,\"totalOccurrences\":1637},{\"name\":\"SinnerSchrader Deutschland\",\"category\":\"ad\",\"domains\":[\"*.s2Betrieb.de\"]},{\"name\":\"Sirv\",\"category\":\"other\",\"domains\":[\"*.sirv.com\"],\"totalExecutionTime\":561200,\"totalOccurrences\":995},{\"name\":\"Site Meter\",\"category\":\"analytics\",\"domains\":[\"*.sitemeter.com\"]},{\"name\":\"Site24x7 Real User Monitoring\",\"company\":\"Site24x7\",\"category\":\"analytics\",\"domains\":[\"*.site24x7rum.com\"],\"totalExecutionTime\":113521,\"totalOccurrences\":858},{\"name\":\"SiteGainer\",\"category\":\"analytics\",\"domains\":[\"*.sitegainer.com\",\"d191y0yd6d0jy4.cloudfront.net\"]},{\"name\":\"SiteScout\",\"company\":\"Centro\",\"category\":\"ad\",\"domains\":[\"*.pixel.ad\",\"*.sitescout.com\"],\"totalExecutionTime\":213582,\"totalOccurrences\":2975},{\"name\":\"Siteimprove\",\"category\":\"utility\",\"domains\":[\"*.siteimprove.com\",\"*.siteimproveanalytics.com\"],\"totalExecutionTime\":20792,\"totalOccurrences\":302},{\"name\":\"Six Degrees Group\",\"category\":\"hosting\",\"domains\":[\"*.fstech.co.uk\"]},{\"name\":\"Skimbit\",\"category\":\"ad\",\"domains\":[\"*.redirectingat.com\",\"*.skimresources.com\",\"*.skimresources.net\"],\"totalExecutionTime\":2205925,\"totalOccurrences\":6957},{\"name\":\"Skimlinks\",\"category\":\"ad\",\"domains\":[\"*.skimlinks.com\"]},{\"name\":\"SkyGlue Technology\",\"category\":\"analytics\",\"domains\":[\"*.skyglue.com\"],\"totalExecutionTime\":1599,\"totalOccurrences\":17},{\"name\":\"SkyScanner\",\"category\":\"content\",\"domains\":[\"*.skyscanner.net\"],\"examples\":[\"api.skyscanner.net\"],\"totalExecutionTime\":123839,\"totalOccurrences\":374},{\"name\":\"Skybet\",\"company\":\"Bonne Terre t/a Sky Vegas (Sky)\",\"category\":\"other\",\"domains\":[\"*.skybet.com\"]},{\"name\":\"Skype\",\"category\":\"other\",\"domains\":[\"*.skype.com\"],\"totalExecutionTime\":79048,\"totalOccurrences\":352},{\"name\":\"Slate Group\",\"category\":\"content\",\"domains\":[\"*.cdnslate.com\"]},{\"name\":\"SlimCut Media Outstream\",\"company\":\"SlimCut Media\",\"category\":\"ad\",\"domains\":[\"*.freeskreen.com\"]},{\"name\":\"Smart Insight Tracking\",\"company\":\"Emarsys\",\"category\":\"analytics\",\"domains\":[\"*.scarabresearch.com\"],\"totalExecutionTime\":330199,\"totalOccurrences\":1767},{\"name\":\"Smart AdServer\",\"category\":\"ad\",\"domains\":[\"*.01net.com\",\"*.sascdn.com\",\"*.sasqos.com\",\"*.smartadserver.com\"],\"examples\":[\"securite.01net.com\"],\"totalExecutionTime\":12104413,\"totalOccurrences\":23029},{\"name\":\"SmartFocus\",\"category\":\"analytics\",\"domains\":[\"*.emv2.com\",\"*.emv3.com\",\"*.predictiveintent.com\",\"*.smartfocus.com\",\"*.themessagecloud.com\"]},{\"name\":\"Smarter Click\",\"category\":\"ad\",\"domains\":[\"*.smct.co\",\"*.smarterclick.co.uk\"],\"totalExecutionTime\":472,\"totalOccurrences\":6},{\"name\":\"SmarterHQ\",\"category\":\"analytics\",\"domains\":[\"*.smarterhq.io\",\"d1n00d49gkbray.cloudfront.net\",\"*.smarterremarketer.net\"],\"totalExecutionTime\":1762,\"totalOccurrences\":25},{\"name\":\"Smarttools\",\"category\":\"customer-success\",\"domains\":[\"*.smartertrack.com\"]},{\"name\":\"Smartzer\",\"category\":\"ad\",\"domains\":[\"*.smartzer.com\"]},{\"name\":\"Snack Media\",\"category\":\"content\",\"domains\":[\"*.snack-media.com\"],\"totalExecutionTime\":475760,\"totalOccurrences\":379},{\"name\":\"Snacktools\",\"category\":\"ad\",\"domains\":[\"*.bannersnack.com\"],\"totalExecutionTime\":130299,\"totalOccurrences\":244},{\"name\":\"SnapEngage\",\"category\":\"customer-success\",\"domains\":[\"*.snapengage.com\"],\"totalExecutionTime\":127351,\"totalOccurrences\":941},{\"name\":\"SnapWidget\",\"category\":\"content\",\"domains\":[\"*.snapwidget.com\"]},{\"name\":\"Soasta\",\"category\":\"analytics\",\"domains\":[\"*.lognormal.net\"]},{\"name\":\"SociableLabs\",\"category\":\"ad\",\"domains\":[\"*.sociablelabs.net\",\"*.sociablelabs.com\"]},{\"name\":\"Social Annex\",\"category\":\"customer-success\",\"domains\":[\"*.socialannex.com\"]},{\"name\":\"SocialShopWave\",\"category\":\"social\",\"domains\":[\"*.socialshopwave.com\"],\"totalExecutionTime\":3156913,\"totalOccurrences\":2715},{\"name\":\"Socialphotos\",\"category\":\"social\",\"domains\":[\"*.slpht.com\"],\"totalExecutionTime\":21508,\"totalOccurrences\":113},{\"name\":\"Sociomantic Labs\",\"company\":\"DunnHumby\",\"category\":\"ad\",\"domains\":[\"*.sociomantic.com\"]},{\"name\":\"SodaHead\",\"category\":\"analytics\",\"domains\":[\"*.sodahead.com\"],\"examples\":[\"pollware-cdn.sodahead.com\"]},{\"name\":\"Softwebzone\",\"category\":\"hosting\",\"domains\":[\"*.softwebzone.com\"],\"examples\":[\"www.softwebzone.com\"]},{\"name\":\"Sojern\",\"category\":\"marketing\",\"domains\":[\"*.sojern.com\"],\"totalExecutionTime\":1851437,\"totalOccurrences\":3809},{\"name\":\"Sokrati\",\"category\":\"marketing\",\"domains\":[\"*.sokrati.com\"]},{\"name\":\"Sonobi\",\"category\":\"ad\",\"domains\":[\"*.sonobi.com\"],\"totalExecutionTime\":187455,\"totalOccurrences\":4647},{\"name\":\"Sooqr Search\",\"company\":\"Sooqr\",\"category\":\"utility\",\"domains\":[\"*.sooqr.com\"],\"totalExecutionTime\":121556,\"totalOccurrences\":309},{\"name\":\"Sophus3\",\"category\":\"analytics\",\"domains\":[\"*.s3ae.com\",\"*.sophus3.com\"]},{\"name\":\"Sorenson Media\",\"category\":\"content\",\"domains\":[\"*.sorensonmedia.com\"]},{\"name\":\"Sortable\",\"category\":\"ad\",\"domains\":[\"*.deployads.com\"]},{\"name\":\"Sotic\",\"category\":\"hosting\",\"domains\":[\"*.sotic.net\",\"*.soticservers.net\"]},{\"name\":\"Soundest\",\"category\":\"ad\",\"domains\":[\"*.soundestlink.com\",\"*.soundest.net\"],\"totalExecutionTime\":798,\"totalOccurrences\":98},{\"name\":\"Sourcepoint\",\"category\":\"ad\",\"domains\":[\"*.decenthat.com\",\"*.fallingfalcon.com\",\"*.summerhamster.com\",\"d2lv4zbk7v5f93.cloudfront.net\",\"d3qxwzhswv93jk.cloudfront.net\"],\"examples\":[\"www.decenthat.com\",\"www.fallingfalcon.com\",\"www.summerhamster.com\"]},{\"name\":\"SourceKnowledge\",\"homepage\":\"https://www.sourceknowledge.com\",\"category\":\"ad\",\"domains\":[\"*.provenpixel.com\"],\"totalExecutionTime\":712,\"totalOccurrences\":8},{\"name\":\"SpaceNet\",\"category\":\"hosting\",\"domains\":[\"*.nmm.de\"]},{\"name\":\"Sparkflow\",\"company\":\"Intercept Interactive\",\"category\":\"ad\",\"domains\":[\"*.sparkflow.net\"]},{\"name\":\"Specific Media\",\"category\":\"ad\",\"domains\":[\"*.specificmedia.com\",\"*.adviva.net\",\"*.specificclick.net\"]},{\"name\":\"Spicy\",\"company\":\"Data-Centric Alliance\",\"category\":\"ad\",\"domains\":[\"*.sspicy.ru\"]},{\"name\":\"Spoke\",\"category\":\"customer-success\",\"domains\":[\"*.121d8.com\"]},{\"name\":\"Spongecell\",\"category\":\"ad\",\"domains\":[\"*.spongecell.com\"]},{\"name\":\"Spot.IM\",\"category\":\"social\",\"domains\":[\"*.spot.im\",\"*.spotim.market\"],\"totalExecutionTime\":228491,\"totalOccurrences\":175},{\"name\":\"SpotXchange\",\"category\":\"ad\",\"domains\":[\"*.spotxcdn.com\",\"*.spotxchange.com\",\"*.spotx.tv\"]},{\"name\":\"SpringServer\",\"category\":\"ad\",\"domains\":[\"*.springserve.com\"],\"totalExecutionTime\":2667777,\"totalOccurrences\":1460},{\"name\":\"Spylight\",\"category\":\"other\",\"domains\":[\"*.spylight.com\"]},{\"name\":\"SreamAMG\",\"company\":\"StreamAMG\",\"category\":\"other\",\"domains\":[\"*.streamamg.com\"],\"totalExecutionTime\":38366,\"totalOccurrences\":41},{\"name\":\"StackAdapt\",\"category\":\"ad\",\"domains\":[\"*.stackadapt.com\"],\"totalExecutionTime\":1205271,\"totalOccurrences\":15700},{\"name\":\"StackExchange\",\"category\":\"social\",\"domains\":[\"*.sstatic.net\"],\"totalExecutionTime\":191968,\"totalOccurrences\":212},{\"name\":\"Stackla PTY\",\"category\":\"social\",\"domains\":[\"*.stackla.com\"],\"totalExecutionTime\":145820,\"totalOccurrences\":127},{\"name\":\"Stailamedia\",\"category\":\"ad\",\"domains\":[\"*.stailamedia.com\"]},{\"name\":\"Stamped.io\",\"category\":\"analytics\",\"domains\":[\"*.stamped.io\"],\"totalExecutionTime\":1460942,\"totalOccurrences\":12157},{\"name\":\"Starfield Services Root Certificate Authority\",\"company\":\"Starfield Technologies\",\"category\":\"utility\",\"domains\":[\"*.starfieldtech.com\",\"ss2.us\",\"*.ss2.us\"],\"examples\":[\"ocsp.starfieldtech.com\"],\"totalExecutionTime\":14905,\"totalOccurrences\":42},{\"name\":\"Starfield Technologies\",\"category\":\"utility\",\"domains\":[\"*.websiteprotection.com\"],\"examples\":[\"seals.websiteprotection.com\"]},{\"name\":\"StatCounter\",\"category\":\"analytics\",\"domains\":[\"*.statcounter.com\"],\"totalExecutionTime\":4030381,\"totalOccurrences\":49348},{\"name\":\"Statful\",\"category\":\"analytics\",\"domains\":[\"*.statful.com\"]},{\"name\":\"Steelhouse\",\"category\":\"ad\",\"domains\":[\"*.steelhousemedia.com\"],\"totalExecutionTime\":68777,\"totalOccurrences\":417},{\"name\":\"Steepto\",\"category\":\"ad\",\"domains\":[\"*.steepto.com\"],\"totalExecutionTime\":206,\"totalOccurrences\":1},{\"name\":\"StellaService\",\"category\":\"analytics\",\"domains\":[\"*.stellaservice.com\"]},{\"name\":\"StickyADS.tv\",\"category\":\"ad\",\"domains\":[\"*.stickyadstv.com\"],\"totalExecutionTime\":7536456,\"totalOccurrences\":7547},{\"name\":\"STINGRAY\",\"company\":\"FlexOne\",\"category\":\"ad\",\"domains\":[\"*.impact-ad.jp\"],\"examples\":[\"y.one.impact-ad.jp\"],\"totalExecutionTime\":1326919,\"totalOccurrences\":8916},{\"name\":\"Storify\",\"company\":\"Adobe Systems\",\"category\":\"social\",\"domains\":[\"*.storify.com\"]},{\"name\":\"Storm Tag Manager\",\"company\":\"Rakuten\",\"category\":\"tag-manager\",\"domains\":[\"*.stormcontainertag.com\"]},{\"name\":\"Storygize\",\"category\":\"ad\",\"domains\":[\"*.storygize.net\"],\"examples\":[\"www.storygize.net\"],\"totalExecutionTime\":53261,\"totalOccurrences\":158},{\"name\":\"Strands\",\"category\":\"utility\",\"domains\":[\"*.strands.com\"]},{\"name\":\"StreamRail\",\"category\":\"ad\",\"domains\":[\"*.streamrail.com\",\"*.streamrail.net\"]},{\"name\":\"StrikeAd\",\"category\":\"ad\",\"domains\":[\"*.strikead.com\"]},{\"name\":\"Struq\",\"company\":\"Quantcast\",\"category\":\"ad\",\"domains\":[\"*.struq.com\"]},{\"name\":\"StrÃ¶er Digital Media\",\"category\":\"ad\",\"domains\":[\"*.stroeerdigitalmedia.de\"]},{\"name\":\"StumbleUpon\",\"category\":\"content\",\"domains\":[\"*.stumble-upon.com\",\"*.stumbleupon.com\"],\"totalExecutionTime\":11002,\"totalOccurrences\":10},{\"name\":\"Sub2 Technologies\",\"category\":\"analytics\",\"domains\":[\"*.sub2tech.com\"],\"totalExecutionTime\":7474,\"totalOccurrences\":50},{\"name\":\"SublimeSkinz\",\"category\":\"ad\",\"domains\":[\"*.ayads.co\"],\"totalExecutionTime\":279432,\"totalOccurrences\":774},{\"name\":\"Sumo Logic\",\"category\":\"utility\",\"domains\":[\"*.sumologic.com\"],\"totalExecutionTime\":21667,\"totalOccurrences\":11},{\"name\":\"Sunday Times Driving\",\"category\":\"content\",\"domains\":[\"*.driving.co.uk\"]},{\"name\":\"SundaySky\",\"category\":\"ad\",\"domains\":[\"*.sundaysky.com\",\"dds6m601du5ji.cloudfront.net\"],\"totalExecutionTime\":5450,\"totalOccurrences\":7},{\"name\":\"Sunrise Integration\",\"category\":\"utility\",\"domains\":[\"*.sunriseintegration.com\"]},{\"name\":\"Supertool Network Technology\",\"category\":\"analytics\",\"domains\":[\"*.miaozhen.com\"],\"totalExecutionTime\":7211,\"totalOccurrences\":50},{\"name\":\"Survata\",\"category\":\"analytics\",\"domains\":[\"*.survata.com\"]},{\"name\":\"SurveyGizmo\",\"category\":\"analytics\",\"domains\":[\"*.surveygizmo.eu\"],\"examples\":[\"www.surveygizmo.eu\"]},{\"name\":\"SurveyMonkey\",\"category\":\"analytics\",\"domains\":[\"*.surveymonkey.com\"],\"totalExecutionTime\":26974,\"totalOccurrences\":261},{\"name\":\"Survicate\",\"category\":\"analytics\",\"domains\":[\"*.survicate.com\"],\"totalExecutionTime\":304968,\"totalOccurrences\":976},{\"name\":\"Sweet Tooth\",\"category\":\"ad\",\"domains\":[\"*.sweettooth.io\"],\"totalExecutionTime\":1914,\"totalOccurrences\":33},{\"name\":\"Swiftype\",\"category\":\"utility\",\"domains\":[\"*.swiftype.com\",\"*.swiftypecdn.com\"],\"totalExecutionTime\":298376,\"totalOccurrences\":850},{\"name\":\"Switch Concepts\",\"category\":\"ad\",\"domains\":[\"*.switchadhub.com\"]},{\"name\":\"SwitchAds\",\"company\":\"Switch Concepts\",\"category\":\"ad\",\"domains\":[\"*.switchads.com\"]},{\"name\":\"Swogo\",\"category\":\"analytics\",\"domains\":[\"*.xsellapp.com\"]},{\"name\":\"Swoop\",\"category\":\"ad\",\"domains\":[\"*.swoop.com\"],\"totalExecutionTime\":8237,\"totalOccurrences\":49},{\"name\":\"Symantec\",\"category\":\"utility\",\"domains\":[\"*.norton.com\",\"*.symantec.com\",\"*.symcb.com\",\"*.symcd.com\"],\"examples\":[\"extended-validation-ssl.websecurity.symantec.com\"],\"totalExecutionTime\":191460,\"totalOccurrences\":308},{\"name\":\"Syncapse\",\"category\":\"social\",\"domains\":[\"*.clickable.net\"]},{\"name\":\"Synergetic\",\"category\":\"ad\",\"domains\":[\"*.synergetic.ag\"]},{\"name\":\"Synthetix\",\"category\":\"customer-success\",\"domains\":[\"*.syn-finity.com\",\"*.synthetix-ec1.com\",\"*.synthetix.com\"],\"examples\":[\"www.synthetix-ec1.com\"],\"totalExecutionTime\":3349,\"totalOccurrences\":21},{\"name\":\"Syte\",\"category\":\"other\",\"domains\":[\"*.syteapi.com\"],\"examples\":[\"cdn.syteapi.com\"],\"totalExecutionTime\":85100,\"totalOccurrences\":86},{\"name\":\"TINT\",\"category\":\"content\",\"domains\":[\"*.71n7.com\",\"d33w9bm0n1egwm.cloudfront.net\",\"d36hc0p18k1aoc.cloudfront.net\",\"d3l7tj34e9fc43.cloudfront.net\"],\"examples\":[\"www.71n7.com\"]},{\"name\":\"TNS (Kantar Group)\",\"category\":\"analytics\",\"domains\":[\"*.tns-counter.ru\"],\"totalExecutionTime\":40,\"totalOccurrences\":1},{\"name\":\"TRUSTe\",\"category\":\"utility\",\"domains\":[\"*.truste.com\"],\"totalExecutionTime\":111146,\"totalOccurrences\":613},{\"name\":\"TV Genius\",\"company\":\"Ericcson Media Services\",\"category\":\"content\",\"domains\":[\"*.tvgenius.net\"]},{\"name\":\"TVSquared\",\"category\":\"ad\",\"domains\":[\"*.tvsquared.com\"],\"totalExecutionTime\":468801,\"totalOccurrences\":3463},{\"name\":\"TVTY\",\"category\":\"ad\",\"domains\":[\"*.distribeo.com\",\"*.ogigl.com\"]},{\"name\":\"Tactics bvba\",\"category\":\"hosting\",\"domains\":[\"*.influid.co\"]},{\"name\":\"Tag Inspector\",\"company\":\"InfoTrust\",\"category\":\"analytics\",\"domains\":[\"d22xmn10vbouk4.cloudfront.net\"],\"totalExecutionTime\":47747,\"totalOccurrences\":200},{\"name\":\"TagCommander\",\"category\":\"tag-manager\",\"domains\":[\"*.commander1.com\",\"*.tagcommander.com\"],\"totalExecutionTime\":377933,\"totalOccurrences\":1432},{\"name\":\"Tagboard\",\"category\":\"social\",\"domains\":[\"*.tagboard.com\"],\"totalExecutionTime\":35501,\"totalOccurrences\":37},{\"name\":\"Taggstar\",\"company\":\"Taggstar UK\",\"category\":\"ad\",\"domains\":[\"*.taggstar.com\"],\"totalExecutionTime\":17255,\"totalOccurrences\":89},{\"name\":\"Tail Target\",\"company\":\"Tail\",\"category\":\"ad\",\"domains\":[\"*.tailtarget.com\"],\"totalExecutionTime\":119102,\"totalOccurrences\":755},{\"name\":\"Tailored\",\"category\":\"other\",\"domains\":[\"d24qm7bu56swjs.cloudfront.net\",\"dw3vahmen1rfy.cloudfront.net\",\"*.tailored.to\"]},{\"name\":\"Taleo Enterprise Cloud Service\",\"company\":\"Oracle\",\"category\":\"content\",\"domains\":[\"*.taleo.net\"],\"totalExecutionTime\":3831,\"totalOccurrences\":62},{\"name\":\"Talkable\",\"category\":\"ad\",\"domains\":[\"*.talkable.com\",\"d2jjzw81hqbuqv.cloudfront.net\"],\"examples\":[\"www.talkable.com\"],\"totalExecutionTime\":114067,\"totalOccurrences\":490},{\"name\":\"TapSense\",\"category\":\"ad\",\"domains\":[\"*.tapsense.com\"]},{\"name\":\"Tapad\",\"category\":\"ad\",\"domains\":[\"*.tapad.com\"],\"totalExecutionTime\":1101,\"totalOccurrences\":59},{\"name\":\"Teads\",\"category\":\"ad\",\"domains\":[\"*.teads.tv\"],\"totalExecutionTime\":1251394,\"totalOccurrences\":3670},{\"name\":\"Team Internet Tonic\",\"company\":\"Team Internet\",\"category\":\"ad\",\"domains\":[\"*.dntrax.com\"]},{\"name\":\"TechTarget\",\"category\":\"content\",\"domains\":[\"*.techtarget.com\",\"*.ttgtmedia.com\"],\"totalExecutionTime\":12565,\"totalOccurrences\":28},{\"name\":\"Technorati\",\"company\":\"Synacor\",\"category\":\"ad\",\"domains\":[\"*.technoratimedia.com\"],\"totalExecutionTime\":1898845,\"totalOccurrences\":11185},{\"name\":\"Teedhaze\",\"category\":\"content\",\"domains\":[\"*.fuel451.com\"]},{\"name\":\"Tell Apart\",\"category\":\"analytics\",\"domains\":[\"*.tellapart.com\",\"*.tellaparts.com\"]},{\"name\":\"Tencent\",\"category\":\"content\",\"domains\":[\"*.qq.com\",\"*.ywxi.net\"],\"totalExecutionTime\":2032388,\"totalOccurrences\":7313},{\"name\":\"Thanx Media\",\"category\":\"utility\",\"domains\":[\"*.hawksearch.info\"]},{\"name\":\"Thawte\",\"category\":\"utility\",\"domains\":[\"*.thawte.com\"],\"examples\":[\"ocsp.thawte.com\",\"seal.thawte.com\"],\"totalExecutionTime\":3018,\"totalOccurrences\":1},{\"name\":\"Thesis\",\"category\":\"analytics\",\"homepage\":\"https://www.thesistesting.com/\",\"domains\":[\"*.ttsep.com\"],\"examples\":[\"thix.ttsep.com\"]},{\"name\":\"The AA\",\"category\":\"ad\",\"domains\":[\"*.adstheaa.com\"]},{\"name\":\"The ADEX\",\"category\":\"ad\",\"domains\":[\"*.theadex.com\"],\"totalExecutionTime\":4644,\"totalOccurrences\":62},{\"name\":\"The Best Day\",\"category\":\"social\",\"domains\":[\"*.thebestday.com\"]},{\"name\":\"The Filter\",\"company\":\"Exabre\",\"category\":\"analytics\",\"domains\":[\"*.thefilter.com\"]},{\"name\":\"The Guardian\",\"category\":\"analytics\",\"domains\":[\"*.ophan.co.uk\"]},{\"name\":\"The Hut Group\",\"category\":\"content\",\"domains\":[\"*.thcdn.com\"],\"totalExecutionTime\":428481,\"totalOccurrences\":184},{\"name\":\"The Numa Group\",\"category\":\"other\",\"domains\":[\"*.hittail.com\"]},{\"name\":\"The Publisher Desk\",\"category\":\"ad\",\"domains\":[\"*.206ads.com\",\"*.publisherdesk.com\"]},{\"name\":\"The Sydney Morning Herald\",\"company\":\"Fairfax Media\",\"category\":\"content\",\"domains\":[\"*.smh.com.au\"]},{\"name\":\"The Wall Street Jounal\",\"category\":\"content\",\"domains\":[\"*.wsj.net\"],\"totalExecutionTime\":3034,\"totalOccurrences\":4},{\"name\":\"The Wall Street Journal\",\"category\":\"content\",\"domains\":[\"*.marketwatch.com\"]},{\"name\":\"TheFind\",\"category\":\"content\",\"domains\":[\"*.thefind.com\"]},{\"name\":\"Thinglink\",\"category\":\"utility\",\"domains\":[\"*.thinglink.com\"],\"totalExecutionTime\":1673,\"totalOccurrences\":44},{\"name\":\"Thirdpresence\",\"category\":\"ad\",\"domains\":[\"*.thirdpresence.com\"]},{\"name\":\"ThreatMetrix\",\"category\":\"utility\",\"domains\":[\"*.online-metrix.net\"],\"totalExecutionTime\":2283925,\"totalOccurrences\":3843},{\"name\":\"Throtle\",\"homepage\":\"https://throtle.io/\",\"category\":\"analytics\",\"domains\":[\"*.thrtle.com\",\"*.v12group.com\"]},{\"name\":\"TicketMaster\",\"category\":\"content\",\"domains\":[\"*.t-x.io\",\"*.tmcs.net\"]},{\"name\":\"TikTok\",\"company\":\"ByteDance Ltd\",\"homepage\":\"https://www.tiktok.com/en/\",\"category\":\"social\",\"domains\":[\"*.tiktok.com\",\"*.ipstatp.com\"],\"examples\":[\"analytics.tiktok.com\",\"https://s0.ipstatp.com/ad/business/track-log.js\"],\"totalExecutionTime\":82781404,\"totalOccurrences\":201875},{\"name\":\"Tidio Live Chat\",\"company\":\"Tidio\",\"homepage\":\"https://www.tidiochat.com/en/\",\"category\":\"customer-success\",\"domains\":[\"*.tidiochat.com\"],\"totalExecutionTime\":24326007,\"totalOccurrences\":22983},{\"name\":\"Tiledesk Live Chat\",\"company\":\"Tiledesk SRL\",\"homepage\":\"https://www.tiledesk.com/\",\"category\":\"customer-success\",\"domains\":[\"*.tiledesk.com\"],\"examples\":[\"widget.tiledesk.com\"],\"totalExecutionTime\":272591,\"totalOccurrences\":119},{\"name\":\"Time\",\"category\":\"content\",\"domains\":[\"*.timeinc.net\"]},{\"name\":\"Time2Perf\",\"category\":\"ad\",\"domains\":[\"*.time2perf.com\"]},{\"name\":\"TinyURL\",\"category\":\"utility\",\"domains\":[\"*.tinyurl.com\"]},{\"name\":\"Tivo\",\"category\":\"analytics\",\"domains\":[\"*.rovicorp.com\"]},{\"name\":\"Tom&Co\",\"category\":\"hosting\",\"domains\":[\"*.tomandco.uk\"]},{\"name\":\"Toms Native Ads\",\"company\":\"Purch\",\"category\":\"ad\",\"domains\":[\"*.natoms.com\"]},{\"name\":\"ToneMedia\",\"category\":\"ad\",\"domains\":[\"*.clickfuse.com\"]},{\"name\":\"Tonic\",\"company\":\"Team Internet\",\"category\":\"ad\",\"domains\":[\"*.dntx.com\"]},{\"name\":\"Touch Commerce\",\"category\":\"customer-success\",\"domains\":[\"*.inq.com\",\"*.touchcommerce.com\"],\"totalExecutionTime\":14129,\"totalOccurrences\":54},{\"name\":\"ToutApp\",\"category\":\"ad\",\"domains\":[\"*.toutapp.com\"]},{\"name\":\"TraceView\",\"company\":\"Solarwinds\",\"category\":\"analytics\",\"domains\":[\"*.tracelytics.com\",\"d2gfdmu30u15x7.cloudfront.net\"]},{\"name\":\"TrackJS\",\"category\":\"analytics\",\"domains\":[\"*.trackjs.com\",\"d2zah9y47r7bi2.cloudfront.net\"],\"examples\":[\"usage.trackjs.com\"],\"totalExecutionTime\":2237765,\"totalOccurrences\":2339},{\"name\":\"Tradedoubler\",\"category\":\"ad\",\"domains\":[\"*.pvnsolutions.com\",\"*.tradedoubler.com\"],\"totalExecutionTime\":31791,\"totalOccurrences\":149},{\"name\":\"Tradelab\",\"category\":\"ad\",\"domains\":[\"*.tradelab.fr\"],\"totalExecutionTime\":2039,\"totalOccurrences\":27},{\"name\":\"TrafficFactory\",\"category\":\"ad\",\"domains\":[\"*.trafficfactory.biz\"]},{\"name\":\"TrafficHunt\",\"category\":\"ad\",\"domains\":[\"*.traffichunt.com\"]},{\"name\":\"TrafficStars\",\"category\":\"ad\",\"domains\":[\"*.trafficstars.com\",\"*.tsyndicate.com\"],\"totalExecutionTime\":3392951,\"totalOccurrences\":7654},{\"name\":\"Transifex\",\"category\":\"utility\",\"domains\":[\"*.transifex.com\"],\"totalExecutionTime\":158070,\"totalOccurrences\":536},{\"name\":\"Travelex\",\"category\":\"utility\",\"domains\":[\"*.travelex.net\",\"*.travelex.co.uk\"],\"examples\":[\"api.travelex.net\",\"travelmoney.travelex.co.uk\"]},{\"name\":\"Travelocity Canada\",\"company\":\"Travelocity\",\"category\":\"content\",\"domains\":[\"*.travelocity.ca\"],\"examples\":[\"www.travelocity.ca\"]},{\"name\":\"Travelocity USA\",\"company\":\"Travelocity\",\"category\":\"content\",\"domains\":[\"*.travelocity.com\"],\"examples\":[\"www.travelocity.com\"]},{\"name\":\"Travelzoo\",\"category\":\"content\",\"domains\":[\"*.travelzoo.com\"]},{\"name\":\"Treasure Data\",\"category\":\"analytics\",\"domains\":[\"*.treasuredata.com\"],\"totalExecutionTime\":1292443,\"totalOccurrences\":12832},{\"name\":\"Tremor Video\",\"category\":\"ad\",\"domains\":[\"*.tremorhub.com\",\"*.videohub.tv\"]},{\"name\":\"Trialfire\",\"category\":\"analytics\",\"domains\":[\"*.trialfire.com\"],\"totalExecutionTime\":52173,\"totalOccurrences\":271},{\"name\":\"Tribal Fusion\",\"company\":\"Exponential Interactive\",\"category\":\"ad\",\"domains\":[\"*.tribalfusion.com\"],\"totalExecutionTime\":12262,\"totalOccurrences\":173},{\"name\":\"Triblio\",\"category\":\"marketing\",\"domains\":[\"*.tribl.io\"]},{\"name\":\"Triggered Messaging\",\"company\":\"Fresh Relevance\",\"category\":\"ad\",\"domains\":[\"*.triggeredmessaging.com\"]},{\"name\":\"Trinity Mirror\",\"category\":\"content\",\"domains\":[\"*.mirror.co.uk\"],\"totalExecutionTime\":24751,\"totalOccurrences\":27},{\"name\":\"Trinity Mirror Digital Media\",\"category\":\"social\",\"domains\":[\"*.tm-aws.com\",\"*.icnetwork.co.uk\"]},{\"name\":\"TripAdvisor\",\"category\":\"content\",\"domains\":[\"*.jscache.com\",\"*.tacdn.com\",\"*.tamgrt.com\",\"*.tripadvisor.com\",\"*.viator.com\",\"*.tripadvisor.co.uk\"],\"examples\":[\"www.jscache.com\",\"www.tamgrt.com\"],\"totalExecutionTime\":776258,\"totalOccurrences\":1402},{\"name\":\"TripleLift\",\"category\":\"ad\",\"domains\":[\"*.3lift.com\"],\"totalExecutionTime\":5449,\"totalOccurrences\":2482},{\"name\":\"Tru Optik\",\"category\":\"ad\",\"domains\":[\"*.truoptik.com\"]},{\"name\":\"TruConversion\",\"category\":\"analytics\",\"domains\":[\"*.truconversion.com\"],\"totalExecutionTime\":287173,\"totalOccurrences\":674},{\"name\":\"Trueffect\",\"category\":\"marketing\",\"domains\":[\"*.adlegend.com\"]},{\"name\":\"Truefit\",\"category\":\"analytics\",\"domains\":[\"*.truefitcorp.com\"],\"examples\":[\"cdn.truefitcorp.com\",\"fitrec.truefitcorp.com\",\"sch-cdn.truefitcorp.com\"],\"totalExecutionTime\":1374,\"totalOccurrences\":24},{\"name\":\"Trust Guard\",\"category\":\"utility\",\"domains\":[\"*.trust-guard.com\"],\"totalExecutionTime\":2693,\"totalOccurrences\":30},{\"name\":\"Trust Pilot\",\"category\":\"analytics\",\"domains\":[\"*.trustpilot.com\"],\"totalExecutionTime\":13492108,\"totalOccurrences\":54710},{\"name\":\"Amazon Trust Services\",\"company\":\"Amazon\",\"category\":\"utility\",\"domains\":[\"*.amazontrust.com\",\"o.ss2.us\"],\"examples\":[\"ocsp.rootca1.amazontrust.com\"],\"totalExecutionTime\":78,\"totalOccurrences\":1},{\"name\":\"Google Trust Services\",\"company\":\"Google\",\"category\":\"utility\",\"domains\":[\"*.pki.goog\"],\"examples\":[\"ocsp.pki.goog\"],\"totalExecutionTime\":19,\"totalOccurrences\":1},{\"name\":\"Let's Encrypt\",\"homepage\":\"https://letsencrypt.org/\",\"category\":\"utility\",\"domains\":[\"*.letsencrypt.org\"],\"examples\":[\"ocsp.int-x3.letsencrypt.org\"],\"totalExecutionTime\":7,\"totalOccurrences\":2},{\"name\":\"TrustX\",\"category\":\"ad\",\"domains\":[\"*.trustx.org\"]},{\"name\":\"Trusted Shops\",\"category\":\"utility\",\"domains\":[\"*.trustedshops.com\"],\"totalExecutionTime\":7200209,\"totalOccurrences\":16922},{\"name\":\"Trustev\",\"company\":\"TransUnion\",\"category\":\"utility\",\"domains\":[\"*.trustev.com\"],\"totalExecutionTime\":2160,\"totalOccurrences\":18},{\"name\":\"Trustwave\",\"category\":\"utility\",\"domains\":[\"*.trustwave.com\"],\"totalExecutionTime\":4100,\"totalOccurrences\":4},{\"name\":\"Tryzens TradeState\",\"company\":\"Tryzens\",\"category\":\"analytics\",\"domains\":[\"*.tryzens-analytics.com\"],\"totalExecutionTime\":3161,\"totalOccurrences\":27},{\"name\":\"TubeMogul\",\"category\":\"ad\",\"domains\":[\"*.tubemogul.com\"],\"totalExecutionTime\":10733,\"totalOccurrences\":40},{\"name\":\"Turn\",\"category\":\"ad\",\"domains\":[\"*.turn.com\"],\"totalExecutionTime\":3623,\"totalOccurrences\":47},{\"name\":\"Tutorialize\",\"category\":\"customer-success\",\"domains\":[\"*.tutorialize.me\"]},{\"name\":\"Twenga\",\"category\":\"content\",\"domains\":[\"*.twenga.fr\",\"*.c4tw.net\",\"*.twenga.co.uk\"],\"examples\":[\"tracker.twenga.co.uk\"]},{\"name\":\"Twitframe\",\"company\":\"Superblock\",\"category\":\"utility\",\"domains\":[\"*.twitframe.com\"]},{\"name\":\"Twitter Online Conversion Tracking\",\"company\":\"Twitter\",\"category\":\"ad\",\"domains\":[\"*.ads-twitter.com\",\"analytics.twitter.com\"],\"examples\":[\"static.ads-twitter.com\"],\"totalExecutionTime\":7489819,\"totalOccurrences\":70777},{\"name\":\"Twitter Short URL\",\"company\":\"Twitter\",\"category\":\"social\",\"domains\":[\"*.t.co\"]},{\"name\":\"Twyn Group\",\"category\":\"ad\",\"domains\":[\"*.twyn.com\"]},{\"name\":\"Tynt\",\"company\":\"33 Across\",\"category\":\"ad\",\"domains\":[\"*.tynt.com\"],\"totalExecutionTime\":11398962,\"totalOccurrences\":71821},{\"name\":\"Typepad\",\"category\":\"hosting\",\"domains\":[\"*.typepad.com\"],\"totalExecutionTime\":1419447,\"totalOccurrences\":621},{\"name\":\"TyrbooBytes\",\"category\":\"utility\",\"domains\":[\"*.turbobytes.net\"]},{\"name\":\"UPS i-parcel\",\"company\":\"UPS\",\"category\":\"other\",\"domains\":[\"*.i-parcel.com\"]},{\"name\":\"US Media Consulting\",\"category\":\"ad\",\"domains\":[\"*.mediade.sk\"]},{\"name\":\"Ubertags\",\"category\":\"tag-manager\",\"domains\":[\"*.ubertags.com\"]},{\"name\":\"Umbel\",\"category\":\"analytics\",\"domains\":[\"*.umbel.com\"]},{\"name\":\"Unanimis\",\"company\":\"Switch\",\"category\":\"ad\",\"domains\":[\"*.unanimis.co.uk\"]},{\"name\":\"Unbounce\",\"category\":\"ad\",\"domains\":[\"*.ubembed.com\",\"*.unbounce.com\",\"d2xxq4ijfwetlm.cloudfront.net\",\"d9hhrg4mnvzow.cloudfront.net\"],\"totalExecutionTime\":2250443,\"totalOccurrences\":7759},{\"name\":\"Underdog Media\",\"category\":\"ad\",\"domains\":[\"*.underdog.media\",\"*.udmserve.net\"],\"totalExecutionTime\":417880,\"totalOccurrences\":274},{\"name\":\"Understand Digital\",\"category\":\"ad\",\"domains\":[\"*.redirecting2.net\"]},{\"name\":\"Undertone\",\"company\":\"Perion\",\"category\":\"ad\",\"domains\":[\"*.legolas-media.com\"],\"examples\":[\"rt.legolas-media.com\"]},{\"name\":\"Unidays\",\"category\":\"ad\",\"domains\":[\"*.myunidays.com\",\"*.unidays.world\"]},{\"name\":\"Uniqodo\",\"category\":\"ad\",\"domains\":[\"*.uniqodo.com\"],\"totalExecutionTime\":6998,\"totalOccurrences\":48},{\"name\":\"Unite\",\"category\":\"ad\",\"domains\":[\"*.uadx.com\"]},{\"name\":\"United Card Services\",\"category\":\"utility\",\"domains\":[\"*.ucs.su\"]},{\"name\":\"United Internet\",\"category\":\"hosting\",\"domains\":[\"*.uicdn.com\"],\"totalExecutionTime\":12023,\"totalOccurrences\":68},{\"name\":\"United Internet Media\",\"category\":\"ad\",\"domains\":[\"*.ui-portal.de\"],\"totalExecutionTime\":13797,\"totalOccurrences\":55},{\"name\":\"United Internet Media AG\",\"category\":\"hosting\",\"domains\":[\"*.tifbs.net\",\"*.uicdn.net\",\"*.uimserv.net\"],\"totalExecutionTime\":1779,\"totalOccurrences\":50},{\"name\":\"Unknown\",\"category\":\"other\",\"domains\":[]},{\"name\":\"Unruly Media\",\"category\":\"ad\",\"domains\":[\"*.unrulymedia.com\"],\"totalExecutionTime\":755,\"totalOccurrences\":1577},{\"name\":\"UpBuild\",\"category\":\"ad\",\"domains\":[\"*.upbuild.io\"],\"examples\":[\"www.upbuild.io\"]},{\"name\":\"UpSellit\",\"category\":\"analytics\",\"domains\":[\"*.upsellit.com\"],\"examples\":[\"www.upsellit.com\"],\"totalExecutionTime\":586800,\"totalOccurrences\":2817},{\"name\":\"Upland Software\",\"category\":\"hosting\",\"domains\":[\"*.clickability.com\"]},{\"name\":\"Airship\",\"category\":\"marketing\",\"domains\":[\"*.urbanairship.com\",\"*.aswpsdkus.com\"],\"totalExecutionTime\":3205,\"totalOccurrences\":32},{\"name\":\"UsabilityTools\",\"category\":\"analytics\",\"domains\":[\"*.usabilitytools.com\"]},{\"name\":\"Usablenet.net\",\"category\":\"utility\",\"domains\":[\"*.usablenet.net\"]},{\"name\":\"Use It Better\",\"category\":\"analytics\",\"domains\":[\"*.useitbetter.com\"]},{\"name\":\"User Replay\",\"category\":\"analytics\",\"domains\":[\"*.userreplay.net\"]},{\"name\":\"UserReport\",\"category\":\"analytics\",\"domains\":[\"*.userreport.com\"],\"totalExecutionTime\":97841,\"totalOccurrences\":392},{\"name\":\"Userneeds\",\"category\":\"analytics\",\"domains\":[\"*.userneeds.dk\"]},{\"name\":\"Userzoom\",\"category\":\"analytics\",\"domains\":[\"*.userzoom.com\"],\"totalExecutionTime\":6848,\"totalOccurrences\":6},{\"name\":\"V12 Retail Finance\",\"category\":\"utility\",\"domains\":[\"*.v12finance.com\"]},{\"name\":\"Vacaciones eDreams\",\"category\":\"content\",\"domains\":[\"*.odistatic.net\"]},{\"name\":\"Varick Media Management\",\"category\":\"ad\",\"domains\":[\"*.vmmpxl.com\"]},{\"name\":\"Vdopia Chocolate\",\"company\":\"Vdopia\",\"category\":\"ad\",\"domains\":[\"*.vdopia.com\"]},{\"name\":\"Ve\",\"company\":\"Ve\",\"homepage\":\"https://www.ve.com/\",\"category\":\"marketing\",\"domains\":[\"*.veinteractive.com\",\"*.ve.com\"]},{\"name\":\"Ve Interactive\",\"company\":\"Ve\",\"category\":\"ad\",\"domains\":[\"*.vepxl1.net\",\"*.adgenie.co.uk\"]},{\"name\":\"Vee24\",\"category\":\"customer-success\",\"domains\":[\"*.vee24.com\"],\"totalExecutionTime\":17935,\"totalOccurrences\":34},{\"name\":\"Veeseo\",\"category\":\"content\",\"domains\":[\"*.veeseo.com\"]},{\"name\":\"Venatus Media\",\"category\":\"marketing\",\"domains\":[\"*.alcvid.com\",\"*.venatusmedia.com\"]},{\"name\":\"Veoxa\",\"category\":\"ad\",\"domains\":[\"*.veoxa.com\"]},{\"name\":\"Vergic AB\",\"category\":\"customer-success\",\"domains\":[\"*.psplugin.com\"],\"totalExecutionTime\":39919,\"totalOccurrences\":61},{\"name\":\"Vergic Engage Platform\",\"company\":\"Vergic\",\"category\":\"customer-success\",\"domains\":[\"*.vergic.com\"],\"totalExecutionTime\":15245,\"totalOccurrences\":27},{\"name\":\"Verisign (Symantec)\",\"category\":\"utility\",\"domains\":[\"*.verisign.com\"]},{\"name\":\"Verizon\",\"category\":\"utility\",\"domains\":[\"*.public-trust.com\"],\"examples\":[\"www.public-trust.com\"]},{\"name\":\"Verizon Digital Media CDN\",\"homepage\":\"https://www.verizondigitalmedia.com/\",\"category\":\"cdn\",\"domains\":[\"*.edgecastcdn.net\",\"*.edgecastdns.net\"]},{\"name\":\"Verizon Uplynk\",\"company\":\"Verizon\",\"category\":\"content\",\"domains\":[\"*.uplynk.com\"],\"totalExecutionTime\":957,\"totalOccurrences\":5},{\"name\":\"Vero\",\"company\":\"Semblance\",\"category\":\"ad\",\"domains\":[\"*.getvero.com\",\"d3qxef4rp70elm.cloudfront.net\"],\"totalExecutionTime\":462,\"totalOccurrences\":7},{\"name\":\"VertaMedia\",\"category\":\"ad\",\"domains\":[\"*.vertamedia.com\"]},{\"name\":\"Vertical Mass\",\"category\":\"ad\",\"domains\":[\"*.vmweb.net\"]},{\"name\":\"Vestorly\",\"category\":\"ad\",\"domains\":[\"*.oodalab.com\"]},{\"name\":\"Vextras\",\"category\":\"other\",\"domains\":[\"*.vextras.com\"],\"totalExecutionTime\":464,\"totalOccurrences\":9},{\"name\":\"Viacom\",\"category\":\"content\",\"domains\":[\"*.mtvnservices.com\"],\"totalExecutionTime\":10024,\"totalOccurrences\":20},{\"name\":\"Vibrant Media\",\"category\":\"ad\",\"domains\":[\"*.intellitxt.com\",\"*.picadmedia.com\"]},{\"name\":\"VidPulse\",\"category\":\"analytics\",\"domains\":[\"*.vidpulse.com\"]},{\"name\":\"Video Media Groep\",\"category\":\"ad\",\"domains\":[\"*.vmg.host\",\"*.inpagevideo.nl\"]},{\"name\":\"VideoHub\",\"company\":\"Tremor Video\",\"category\":\"ad\",\"domains\":[\"*.scanscout.com\"],\"examples\":[\"dt.scanscout.com\"]},{\"name\":\"Videology\",\"category\":\"ad\",\"domains\":[\"*.tidaltv.com\"]},{\"name\":\"Vidible\",\"category\":\"ad\",\"domains\":[\"*.vidible.tv\"]},{\"name\":\"VigLink\",\"category\":\"ad\",\"domains\":[\"*.viglink.com\"],\"totalExecutionTime\":3157066,\"totalOccurrences\":5359},{\"name\":\"Vindico\",\"company\":\"Viant\",\"category\":\"ad\",\"domains\":[\"*.vindicosuite.com\"]},{\"name\":\"Viocorp International\",\"category\":\"content\",\"domains\":[\"*.vioapi.com\"]},{\"name\":\"ViralNinjas\",\"category\":\"ad\",\"domains\":[\"*.viralninjas.com\"]},{\"name\":\"Virool\",\"category\":\"ad\",\"domains\":[\"*.virool.com\"]},{\"name\":\"Virtual Earth\",\"company\":\"Microsoft\",\"category\":\"utility\",\"domains\":[\"*.virtualearth.net\"],\"totalExecutionTime\":58149,\"totalOccurrences\":289},{\"name\":\"Visely\",\"company\":\"Visely\",\"category\":\"other\",\"homepage\":\"https://visely.io/\",\"domains\":[\"*.visely.io\"]},{\"name\":\"VisScore\",\"category\":\"analytics\",\"domains\":[\"*.visscore.com\",\"d2hkbi3gan6yg6.cloudfront.net\"]},{\"name\":\"Visible Measures\",\"category\":\"ad\",\"domains\":[\"*.visiblemeasures.com\"]},{\"name\":\"Visual Studio\",\"company\":\"Microsoft\",\"category\":\"utility\",\"domains\":[\"*.visualstudio.com\"],\"totalExecutionTime\":7285,\"totalOccurrences\":4},{\"name\":\"VisualDNA\",\"category\":\"ad\",\"domains\":[\"*.visualdna.com\"]},{\"name\":\"VisualVisitor\",\"category\":\"ad\",\"domains\":[\"*.id-visitors.com\"],\"examples\":[\"frontend.id-visitors.com\"],\"totalExecutionTime\":1093,\"totalOccurrences\":18},{\"name\":\"Vivocha S.p.A\",\"category\":\"customer-success\",\"domains\":[\"*.vivocha.com\"],\"totalExecutionTime\":44384,\"totalOccurrences\":31},{\"name\":\"Vizu (Nielsen)\",\"category\":\"analytics\",\"domains\":[\"*.vizu.com\"]},{\"name\":\"Vizury\",\"category\":\"ad\",\"domains\":[\"*.vizury.com\"],\"totalExecutionTime\":328,\"totalOccurrences\":6},{\"name\":\"VoiceFive\",\"category\":\"analytics\",\"domains\":[\"*.voicefive.com\"]},{\"name\":\"Volvelle\",\"company\":\"Optomaton\",\"category\":\"ad\",\"domains\":[\"*.volvelle.tech\"]},{\"name\":\"VouchedFor\",\"category\":\"analytics\",\"domains\":[\"*.vouchedfor.co.uk\"],\"totalExecutionTime\":15720,\"totalOccurrences\":19},{\"name\":\"WARPCACHE\",\"category\":\"utility\",\"domains\":[\"*.warpcache.net\"]},{\"name\":\"WISHLIST\",\"company\":\"Shopapps\",\"category\":\"social\",\"domains\":[\"*.shopapps.in\"]},{\"name\":\"WP Engine\",\"category\":\"hosting\",\"domains\":[\"*.wpengine.com\"],\"totalExecutionTime\":508241,\"totalOccurrences\":288},{\"name\":\"WalkMe\",\"category\":\"customer-success\",\"domains\":[\"*.walkme.com\"],\"totalExecutionTime\":568446,\"totalOccurrences\":459},{\"name\":\"Watching That\",\"category\":\"other\",\"domains\":[\"*.watchingthat.com\"]},{\"name\":\"Wayfair\",\"category\":\"analytics\",\"domains\":[\"*.wayfair.com\"],\"examples\":[\"t.wayfair.com\"]},{\"name\":\"Web CEO\",\"category\":\"other\",\"domains\":[\"*.websiteceo.com\"],\"examples\":[\"www.websiteceo.com\"]},{\"name\":\"Web Dissector\",\"company\":\"Beijing Gridsum Technologies\",\"category\":\"analytics\",\"domains\":[\"*.gridsumdissector.com\",\"*.webdissector.com\"],\"examples\":[\"www.webdissector.com\"]},{\"name\":\"Web Forensics\",\"category\":\"analytics\",\"domains\":[\"*.webforensics.co.uk\"]},{\"name\":\"Web Security and Performance\",\"company\":\"NCC Group\",\"category\":\"utility\",\"domains\":[\"*.nccgroup.trust\"]},{\"name\":\"WebEngage\",\"category\":\"customer-success\",\"domains\":[\"*.webengage.co\",\"*.webengage.com\",\"d23nd6ymopvz52.cloudfront.net\",\"d3701cc9l7v9a6.cloudfront.net\"],\"totalExecutionTime\":582399,\"totalOccurrences\":2321},{\"name\":\"WebInsight\",\"company\":\"dotMailer\",\"category\":\"analytics\",\"domains\":[\"*.trackedlink.net\",\"*.trackedweb.net\"],\"totalExecutionTime\":30632,\"totalOccurrences\":349},{\"name\":\"WebPageOne Solutions\",\"category\":\"other\",\"domains\":[\"*.webpageone.com\"]},{\"name\":\"WebSpectator\",\"category\":\"ad\",\"domains\":[\"*.webspectator.com\"]},{\"name\":\"WebTuna\",\"company\":\"Application Performance\",\"category\":\"analytics\",\"domains\":[\"*.webtuna.com\"]},{\"name\":\"WebVideoCore\",\"company\":\"StreamingVideoProvider\",\"category\":\"content\",\"domains\":[\"*.webvideocore.net\"],\"totalExecutionTime\":57103,\"totalOccurrences\":37},{\"name\":\"WebWombat\",\"category\":\"utility\",\"domains\":[\"*.ic.com.au\"]},{\"name\":\"Webcollage\",\"category\":\"customer-success\",\"domains\":[\"*.webcollage.net\"]},{\"name\":\"Webcore\",\"category\":\"ad\",\"domains\":[\"*.onefeed.co.uk\"]},{\"name\":\"Webkul\",\"company\":\"Webkul Software\",\"category\":\"utility\",\"domains\":[\"*.webkul.com\"],\"totalExecutionTime\":123009,\"totalOccurrences\":888},{\"name\":\"Webmarked\",\"category\":\"utility\",\"domains\":[\"*.webmarked.net\"],\"totalExecutionTime\":63823,\"totalOccurrences\":1113},{\"name\":\"Weborama\",\"category\":\"ad\",\"domains\":[\"*.weborama.com\",\"*.weborama.fr\"],\"totalExecutionTime\":74941,\"totalOccurrences\":597},{\"name\":\"WebpageFX\",\"category\":\"ad\",\"domains\":[\"*.leadmanagerfx.com\"],\"totalExecutionTime\":97872,\"totalOccurrences\":639},{\"name\":\"Webphone\",\"company\":\"IP WEB SERVICES\",\"category\":\"customer-success\",\"domains\":[\"*.webphone.net\"],\"totalExecutionTime\":2760,\"totalOccurrences\":8},{\"name\":\"Webselect selectcommerce\",\"company\":\"Webselect Internet\",\"category\":\"hosting\",\"domains\":[\"*.webselect.net\"]},{\"name\":\"Webthinking\",\"category\":\"hosting\",\"domains\":[\"*.webthinking.co.uk\"]},{\"name\":\"Webtrekk\",\"category\":\"analytics\",\"domains\":[\"*.wbtrk.net\",\"*.webtrekk-asia.net\",\"*.webtrekk.net\",\"*.wt-eu02.net\",\"*.wt-safetag.com\"],\"totalExecutionTime\":76850,\"totalOccurrences\":430},{\"name\":\"Webtrends\",\"category\":\"analytics\",\"domains\":[\"*.webtrends.com\",\"*.webtrendslive.com\",\"d1q62gfb8siqnm.cloudfront.net\"],\"totalExecutionTime\":1433,\"totalOccurrences\":4},{\"name\":\"Webtype\",\"category\":\"cdn\",\"domains\":[\"*.webtype.com\"]},{\"name\":\"White Ops\",\"category\":\"utility\",\"domains\":[\"*.acexedge.com\",\"*.tagsrvcs.com\"]},{\"name\":\"Whitespace\",\"category\":\"ad\",\"domains\":[\"*.whitespacers.com\"]},{\"name\":\"WhosOn Live Chat Software\",\"category\":\"customer-success\",\"domains\":[\"*.whoson.com\"],\"totalExecutionTime\":13022,\"totalOccurrences\":76},{\"name\":\"Wibbitz\",\"category\":\"other\",\"domains\":[\"*.wibbitz.com\"]},{\"name\":\"Wide Area Communications\",\"category\":\"hosting\",\"domains\":[\"*.widearea.co.uk\"]},{\"name\":\"WideOrbit\",\"category\":\"marketing\",\"domains\":[\"*.admaym.com\"]},{\"name\":\"William Reed\",\"category\":\"content\",\"domains\":[\"*.wrbm.com\"]},{\"name\":\"WillyFogg.com\",\"category\":\"content\",\"domains\":[\"*.willyfogg.com\"]},{\"name\":\"Windows\",\"company\":\"Microsoft\",\"category\":\"utility\",\"domains\":[\"*.windowsupdate.com\"],\"examples\":[\"ctldl.windowsupdate.com\"]},{\"name\":\"WisePops\",\"category\":\"utility\",\"domains\":[\"*.wisepops.com\"],\"totalExecutionTime\":2115966,\"totalOccurrences\":1663},{\"name\":\"Wishlist King\",\"company\":\"Appmate\",\"category\":\"other\",\"homepage\":\"https://appmate.io/\",\"domains\":[\"*.appmate.io\"],\"examples\":[\"api.appmate.io\"],\"totalExecutionTime\":106749,\"totalOccurrences\":206},{\"name\":\"Wishpond Technologies\",\"category\":\"marketing\",\"domains\":[\"*.wishpond.com\",\"*.wishpond.net\"],\"totalExecutionTime\":621002,\"totalOccurrences\":1537},{\"name\":\"WizRocket Technologies\",\"category\":\"analytics\",\"domains\":[\"*.wzrkt.com\"],\"totalExecutionTime\":78,\"totalOccurrences\":1},{\"name\":\"Woopra\",\"category\":\"analytics\",\"domains\":[\"*.woopra.com\"],\"totalExecutionTime\":93098,\"totalOccurrences\":1189},{\"name\":\"Woosmap\",\"category\":\"utility\",\"domains\":[\"*.woosmap.com\"],\"totalExecutionTime\":79379,\"totalOccurrences\":152},{\"name\":\"WorkCast\",\"category\":\"hosting\",\"domains\":[\"*.workcast.net\"]},{\"name\":\"World News Media\",\"category\":\"content\",\"domains\":[\"*.wnmedia.co.uk\"]},{\"name\":\"Worldpay\",\"category\":\"utility\",\"domains\":[\"*.worldpay.com\"],\"totalExecutionTime\":40850,\"totalOccurrences\":18},{\"name\":\"Wow Analytics\",\"category\":\"analytics\",\"domains\":[\"*.wowanalytics.co.uk\"],\"totalExecutionTime\":13419,\"totalOccurrences\":65},{\"name\":\"Wowcher\",\"category\":\"ad\",\"domains\":[\"*.wowcher.co.uk\"]},{\"name\":\"Wufoo\",\"category\":\"utility\",\"domains\":[\"*.wufoo.com\"],\"totalExecutionTime\":417351,\"totalOccurrences\":2022},{\"name\":\"Wunderkind\",\"category\":\"marketing\",\"homepage\":\"https://www.wunderkind.co/\",\"domains\":[\"*.bounceexchange.com\",\"*.bouncex.net\",\"*.wknd.ai\",\"*.cdnbasket.net\",\"*.cdnwidget.com\"],\"examples\":[\"events.bouncex.net\",\"tag.wknd.ai\",\"data.cdnbasket.net\",\"pix.cdnwidget.com\"],\"totalExecutionTime\":2061355,\"totalOccurrences\":1331},{\"name\":\"Wyng\",\"category\":\"ad\",\"domains\":[\"*.offerpop.com\"]},{\"name\":\"XMLSHOP\",\"category\":\"hosting\",\"domains\":[\"*.xmlshop.biz\"]},{\"name\":\"XiTi\",\"company\":\"AT Internet\",\"category\":\"analytics\",\"domains\":[\"*.xiti.com\",\"*.aticdn.net\"],\"homepage\":\"https://www.atinternet.com/en/\",\"examples\":[\"tag.aticdn.net/123456789/smarttag.js\"],\"totalExecutionTime\":862255,\"totalOccurrences\":9293},{\"name\":\"YUDU\",\"category\":\"content\",\"domains\":[\"*.yudu.com\"]},{\"name\":\"Yahoo! Ad Exchange\",\"company\":\"Yahoo!\",\"category\":\"ad\",\"domains\":[\"*.yieldmanager.com\",\"*.browsiprod.com\"],\"examples\":[\"yield-manager.browsiprod.com\"],\"totalExecutionTime\":11588589,\"totalOccurrences\":5695},{\"name\":\"Yahoo! JAPAN Ads\",\"company\":\"Yahoo! JAPAN\",\"category\":\"ad\",\"homepage\":\"https://marketing.yahoo.co.jp/service/yahooads/\",\"domains\":[\"yads.c.yimg.jp\",\"s.yimg.jp\",\"b92.yahoo.co.jp\"],\"examples\":[\"yads.c.yimg.jp/js/yads-async.js\",\"s.yimg.jp/images/listing/tool/yads/ydn/creative/video/ytop_video_timeline_sp.min.js\",\"b92.yahoo.co.jp/js/s_retargeting.js\"],\"totalExecutionTime\":5435754,\"totalOccurrences\":38628},{\"name\":\"Yahoo! Tag Manager\",\"company\":\"Yahoo! JAPAN\",\"category\":\"tag-manager\",\"homepage\":\"https://marketing.yahoo.co.jp/service/tagmanager/\",\"domains\":[\"*.yjtag.jp\"],\"examples\":[\"s.yjtag.jp/tag.js\"]},{\"name\":\"Yahoo! Small Business\",\"company\":\"Yahoo!\",\"category\":\"hosting\",\"domains\":[\"*.aabacosmallbusiness.com\"]},{\"name\":\"Yellow Robot\",\"category\":\"ad\",\"domains\":[\"*.backinstock.org\"],\"totalExecutionTime\":42026,\"totalOccurrences\":2492},{\"name\":\"YieldPartners\",\"category\":\"ad\",\"domains\":[\"*.yieldpartners.com\"]},{\"name\":\"Yieldbot\",\"category\":\"ad\",\"domains\":[\"*.yldbt.com\"]},{\"name\":\"Yieldify\",\"category\":\"ad\",\"domains\":[\"*.yieldify.com\",\"*.yieldifylabs.com\",\"d33wq5gej88ld6.cloudfront.net\",\"dwmvwp56lzq5t.cloudfront.net\"],\"examples\":[\"geo.yieldifylabs.com\"],\"totalExecutionTime\":303817,\"totalOccurrences\":153},{\"name\":\"Yieldlab\",\"category\":\"ad\",\"domains\":[\"*.yieldlab.net\"]},{\"name\":\"Yieldmo\",\"category\":\"ad\",\"domains\":[\"*.yieldmo.com\"],\"totalExecutionTime\":84300,\"totalOccurrences\":2109},{\"name\":\"Yieldr\",\"category\":\"ad\",\"domains\":[\"*.254a.com\"]},{\"name\":\"Yo\",\"category\":\"utility\",\"domains\":[\"*.yopify.com\"]},{\"name\":\"YoYo\",\"category\":\"utility\",\"domains\":[\"*.goadservices.com\"]},{\"name\":\"Yotpo\",\"homepage\":\"https://www.yotpo.com/\",\"category\":\"marketing\",\"domains\":[\"*.yotpo.com\",\"*.swellrewards.com\"],\"totalExecutionTime\":17242505,\"totalOccurrences\":25584},{\"name\":\"Yottaa\",\"category\":\"hosting\",\"domains\":[\"*.yottaa.com\",\"*.yottaa.net\"],\"totalExecutionTime\":783641,\"totalOccurrences\":684},{\"name\":\"YourAmigo\",\"category\":\"utility\",\"domains\":[\"*.youramigo.com\"]},{\"name\":\"YuMe\",\"category\":\"ad\",\"domains\":[\"*.yume.com\",\"*.yumenetworks.com\"],\"examples\":[\"cks.yumenetworks.com\"]},{\"name\":\"Yummley\",\"category\":\"other\",\"domains\":[\"*.yummly.com\"]},{\"name\":\"ZEDO\",\"category\":\"ad\",\"domains\":[\"*.zedo.com\"]},{\"name\":\"Zafu\",\"category\":\"analytics\",\"domains\":[\"*.zafu.com\"]},{\"name\":\"Zaius\",\"category\":\"ad\",\"domains\":[\"*.zaius.com\"]},{\"name\":\"Zamplus ad\",\"category\":\"ad\",\"domains\":[\"*.zampda.net\"]},{\"name\":\"Zanox\",\"category\":\"ad\",\"domains\":[\"*.zanox.com\",\"*.zanox.ws\"]},{\"name\":\"Zapper\",\"category\":\"utility\",\"domains\":[\"*.zapper.com\"]},{\"name\":\"Zarget\",\"category\":\"analytics\",\"domains\":[\"*.zarget.com\"]},{\"name\":\"Zemanta\",\"category\":\"ad\",\"domains\":[\"*.zemanta.com\"],\"totalExecutionTime\":28987,\"totalOccurrences\":471},{\"name\":\"Zen Internet\",\"category\":\"other\",\"domains\":[\"*.zyen.com\"]},{\"name\":\"Zenovia Digital Exchange\",\"category\":\"ad\",\"domains\":[\"*.rhythmxchange.com\",\"*.zenoviaexchange.com\"]},{\"name\":\"ZergNet\",\"category\":\"content\",\"domains\":[\"*.zergnet.com\"],\"totalExecutionTime\":40,\"totalOccurrences\":1},{\"name\":\"Zerogrey\",\"category\":\"hosting\",\"domains\":[\"*.zerogrey.com\"]},{\"name\":\"Ziff Davis Tech\",\"category\":\"ad\",\"domains\":[\"*.adziff.com\",\"*.zdbb.net\"],\"totalExecutionTime\":23843,\"totalOccurrences\":106},{\"name\":\"Zmags\",\"category\":\"marketing\",\"domains\":[\"*.zmags.com\"],\"totalExecutionTime\":182231,\"totalOccurrences\":120},{\"name\":\"Zolando\",\"category\":\"content\",\"domains\":[\"*.ztat.net\"],\"totalExecutionTime\":240932,\"totalOccurrences\":48},{\"name\":\"Zoover\",\"category\":\"analytics\",\"domains\":[\"*.zoover.nl\",\"*.zoover.co.uk\"],\"totalExecutionTime\":10559,\"totalOccurrences\":1},{\"name\":\"Zopim\",\"category\":\"customer-success\",\"domains\":[\"*.zopim.io\"]},{\"name\":\"[24]7\",\"category\":\"customer-success\",\"domains\":[\"*.247-inc.net\",\"*.247inc.net\",\"d1af033869koo7.cloudfront.net\"]},{\"name\":\"adKernel\",\"category\":\"ad\",\"domains\":[\"*.adkernel.com\"],\"totalExecutionTime\":7045,\"totalOccurrences\":2038},{\"name\":\"adMarketplace\",\"company\":\"AMPexchange\",\"category\":\"ad\",\"domains\":[\"*.ampxchange.com\",\"*.admarketplace.net\"]},{\"name\":\"addtocalendar\",\"category\":\"utility\",\"domains\":[\"*.addtocalendar.com\"]},{\"name\":\"adnanny\",\"category\":\"ad\",\"domains\":[\"*.adserver01.de\"]},{\"name\":\"affilinet\",\"category\":\"ad\",\"domains\":[\"*.reussissonsensemble.fr\",\"*.successfultogether.co.uk\"]},{\"name\":\"audioBoom\",\"category\":\"social\",\"domains\":[\"*.audioboom.com\",\"*.audioboo.fm\"],\"totalExecutionTime\":103356,\"totalOccurrences\":51},{\"name\":\"bPay by Barclaycard\",\"company\":\"Barclays Bank\",\"category\":\"utility\",\"domains\":[\"*.bpay.co.uk\"]},{\"name\":\"bRealTime\",\"category\":\"ad\",\"domains\":[\"*.brealtime.com\"],\"totalExecutionTime\":1598,\"totalOccurrences\":24},{\"name\":\"bd4travel\",\"category\":\"analytics\",\"domains\":[\"*.bd4travel.com\"]},{\"name\":\"bizinformation-VOID\",\"company\":\"bizinformation\",\"category\":\"analytics\",\"domains\":[\"*.bizinformation.org\"]},{\"name\":\"carrot\",\"category\":\"social\",\"domains\":[\"*.sharebutton.co\"]},{\"name\":\"cloudIQ\",\"category\":\"analytics\",\"domains\":[\"*.cloud-iq.com\"]},{\"name\":\"comScore\",\"category\":\"analytics\",\"domains\":[\"*.adxpose.com\",\"*.comscore.com\",\"*.sitestat.com\",\"*.zqtk.net\"],\"totalExecutionTime\":5680,\"totalOccurrences\":3},{\"name\":\"content.ad\",\"category\":\"ad\",\"domains\":[\"*.content.ad\"]},{\"name\":\"d3 Media\",\"company\":\"d3 Technologies\",\"category\":\"other\",\"domains\":[\"*.d3sv.net\"]},{\"name\":\"dexiMEDIA\",\"category\":\"ad\",\"domains\":[\"*.deximedia.com\"]},{\"name\":\"dianomi\",\"category\":\"ad\",\"domains\":[\"*.dianomi.com\",\"*.dianomioffers.co.uk\"],\"totalExecutionTime\":77375,\"totalOccurrences\":50},{\"name\":\"donReach\",\"category\":\"social\",\"domains\":[\"*.donreach.com\"]},{\"name\":\"dotMailer\",\"category\":\"ad\",\"domains\":[\"*.dmtrk.com\",\"*.dotmailer.com\",\"*.emlfiles.com\"]},{\"name\":\"dotMailer Surveys\",\"company\":\"dotMailer\",\"category\":\"analytics\",\"domains\":[\"*.dotmailer-surveys.com\"]},{\"name\":\"dstillery\",\"category\":\"ad\",\"domains\":[\"*.dstillery.com\",\"*.media6degrees.com\"],\"totalExecutionTime\":140,\"totalOccurrences\":9},{\"name\":\"eBay\",\"category\":\"ad\",\"domains\":[\"*.ebay.com\",\"*.ebayimg.com\",\"*.fetchback.com\"],\"totalExecutionTime\":586733,\"totalOccurrences\":1041},{\"name\":\"eBay Enterprise\",\"category\":\"hosting\",\"domains\":[\"*.csdata1.com\",\"*.gsipartners.com\"]},{\"name\":\"eBuzzing\",\"company\":\"Teads Managed Services\",\"category\":\"ad\",\"domains\":[\"*.ebz.io\"]},{\"name\":\"eDigital Research\",\"category\":\"customer-success\",\"domains\":[\"*.edigitalresearch.com\",\"*.edigitalsurvey.com\",\"*.edrcdn.com\",\"*.ecustomeropinions.com\"]},{\"name\":\"eGain\",\"category\":\"analytics\",\"domains\":[\"*.analytics-egain.com\",\"*.egain.com\"],\"totalExecutionTime\":6506,\"totalOccurrences\":56},{\"name\":\"eHost\",\"category\":\"hosting\",\"domains\":[\"*.ehosts.net\"]},{\"name\":\"eKomi\",\"category\":\"analytics\",\"domains\":[\"*.ekomi.com\",\"*.ekomi.de\"],\"totalExecutionTime\":43204,\"totalOccurrences\":14},{\"name\":\"eWAY\",\"company\":\"Web Active Pty\",\"category\":\"utility\",\"domains\":[\"*.eway.com.au\"],\"examples\":[\"www.eway.com.au\"],\"totalExecutionTime\":20851,\"totalOccurrences\":1},{\"name\":\"eXTReMe digital\",\"category\":\"analytics\",\"domains\":[\"*.extreme-dm.com\"],\"totalExecutionTime\":2598,\"totalOccurrences\":61},{\"name\":\"eXelate\",\"category\":\"ad\",\"domains\":[\"*.exelator.com\"],\"totalExecutionTime\":4643,\"totalOccurrences\":77},{\"name\":\"ecommercefeed.net\",\"category\":\"marketing\",\"domains\":[\"*.ecommercefeed.net\"]},{\"name\":\"engage:BDR\",\"category\":\"ad\",\"domains\":[\"*.bnmla.com\",\"*.ebdr3.com\"]},{\"name\":\"epago\",\"category\":\"ad\",\"domains\":[\"*.adaos-ads.net\"]},{\"name\":\"epoq internet services\",\"category\":\"analytics\",\"domains\":[\"*.epoq.de\"],\"totalExecutionTime\":59579,\"totalOccurrences\":99},{\"name\":\"etouches\",\"category\":\"hosting\",\"domains\":[\"*.etouches.com\"],\"examples\":[\"www.etouches.com\"]},{\"name\":\"etracker\",\"category\":\"analytics\",\"domains\":[\"*.etracker.com\",\"*.etracker.de\"],\"examples\":[\"www.etracker.com\"],\"totalExecutionTime\":1769765,\"totalOccurrences\":5651},{\"name\":\"everestads.com\",\"category\":\"content\",\"domains\":[\"*.verestads.net\"]},{\"name\":\"exebid.DCA\",\"company\":\"Data-Centric Alliance\",\"category\":\"ad\",\"domains\":[\"*.exe.bid\"]},{\"name\":\"eyeReturn Marketing\",\"category\":\"marketing\",\"domains\":[\"*.eyereturn.com\"]},{\"name\":\"feedoptimise\",\"category\":\"hosting\",\"domains\":[\"*.feedoptimise.com\",\"d1w78njrm56n7g.cloudfront.net\"],\"totalExecutionTime\":129,\"totalOccurrences\":2},{\"name\":\"fifty-five\",\"category\":\"ad\",\"domains\":[\"*.55labs.com\"]},{\"name\":\"fluct\",\"category\":\"ad\",\"domains\":[\"*.adingo.jp\"],\"totalExecutionTime\":4495280,\"totalOccurrences\":10900},{\"name\":\"freegeoip.net\",\"company\":\"(community-funded)\",\"category\":\"utility\",\"domains\":[\"*.freegeoip.net\"]},{\"name\":\"freewheel.tv\",\"category\":\"content\",\"domains\":[\"*.fwmrm.net\"],\"totalExecutionTime\":18401,\"totalOccurrences\":121},{\"name\":\"gnatta\",\"category\":\"customer-success\",\"domains\":[\"*.gnatta.com\"]},{\"name\":\"home.pl\",\"category\":\"hosting\",\"domains\":[\"*.nscontext.eu\"]},{\"name\":\"hyfn\",\"category\":\"ad\",\"domains\":[\"*.hyfn.com\"]},{\"name\":\"iAdvize SAS\",\"category\":\"customer-success\",\"domains\":[\"*.iadvize.com\"],\"totalExecutionTime\":205940,\"totalOccurrences\":708},{\"name\":\"iBillboard\",\"category\":\"ad\",\"domains\":[\"*.ibillboard.com\"]},{\"name\":\"iCrossing\",\"category\":\"ad\",\"domains\":[\"*.ic-live.com\"]},{\"name\":\"iFactory\",\"company\":\"RDW Group\",\"category\":\"hosting\",\"domains\":[\"*.ifactory.com\"]},{\"name\":\"iGoDigital\",\"category\":\"analytics\",\"domains\":[\"*.igodigital.com\"],\"totalExecutionTime\":1462,\"totalOccurrences\":18},{\"name\":\"iJento\",\"company\":\"Fopsha\",\"category\":\"ad\",\"domains\":[\"*.ijento.com\"]},{\"name\":\"iPage\",\"category\":\"hosting\",\"domains\":[\"*.ipage.com\"],\"examples\":[\"www.ipage.com\"],\"totalExecutionTime\":414,\"totalOccurrences\":5},{\"name\":\"iPerceptions\",\"category\":\"customer-success\",\"domains\":[\"*.iperceptions.com\"],\"totalExecutionTime\":453667,\"totalOccurrences\":3798},{\"name\":\"iTunes\",\"company\":\"Apple\",\"category\":\"content\",\"domains\":[\"*.mzstatic.com\"]},{\"name\":\"imgix\",\"company\":\"Zebrafish Labs\",\"category\":\"utility\",\"domains\":[\"*.imgix.net\"],\"totalExecutionTime\":36494,\"totalOccurrences\":52},{\"name\":\"infogr.am\",\"category\":\"utility\",\"domains\":[\"*.infogr.am\",\"*.jifo.co\"],\"totalExecutionTime\":1423508,\"totalOccurrences\":204},{\"name\":\"iotec\",\"category\":\"analytics\",\"domains\":[\"*.dsp.io\"]},{\"name\":\"iovation\",\"category\":\"utility\",\"domains\":[\"*.iesnare.com\"],\"totalExecutionTime\":665950,\"totalOccurrences\":2218},{\"name\":\"ipinfo.io\",\"category\":\"utility\",\"domains\":[\"*.ipinfo.io\"]},{\"name\":\"issuu\",\"category\":\"content\",\"domains\":[\"*.issuu.com\",\"*.isu.pub\"],\"totalExecutionTime\":5087035,\"totalOccurrences\":2343},{\"name\":\"iubenda\",\"category\":\"utility\",\"domains\":[\"*.iubenda.com\"],\"examples\":[\"www.iubenda.com\"],\"totalExecutionTime\":71011113,\"totalOccurrences\":100759},{\"name\":\"j2 Cloud Services\",\"category\":\"ad\",\"domains\":[\"*.campaigner.com\"],\"totalExecutionTime\":21910,\"totalOccurrences\":36},{\"name\":\"jsonip.com\",\"category\":\"analytics\",\"domains\":[\"*.jsonip.com\"]},{\"name\":\"linkpulse\",\"category\":\"analytics\",\"domains\":[\"*.lp4.io\"]},{\"name\":\"loGo_net\",\"category\":\"analytics\",\"domains\":[\"*.logo-net.co.uk\"]},{\"name\":\"mainADV\",\"category\":\"ad\",\"domains\":[\"*.httptrack.com\",\"*.solocpm.com\"]},{\"name\":\"mbr targeting\",\"category\":\"ad\",\"domains\":[\"*.m6r.eu\"],\"totalExecutionTime\":99,\"totalOccurrences\":2},{\"name\":\"media.ventive\",\"category\":\"ad\",\"domains\":[\"*.contentspread.net\"]},{\"name\":\"metrigo\",\"category\":\"ad\",\"domains\":[\"*.metrigo.com\"]},{\"name\":\"minicabit.com\",\"category\":\"content\",\"domains\":[\"*.minicabit.com\"]},{\"name\":\"mobiManage\",\"category\":\"hosting\",\"domains\":[\"*.mobimanage.com\"]},{\"name\":\"moving-pictures\",\"category\":\"other\",\"domains\":[\"*.moving-pictures.biz\",\"*.v6-moving-pictures.com\",\"*.vtstat.com\",\"*.moving-pictures.de\"]},{\"name\":\"my6sense\",\"category\":\"ad\",\"domains\":[\"*.mynativeplatform.com\"]},{\"name\":\"myThings\",\"category\":\"ad\",\"domains\":[\"*.mythings.com\",\"*.mythingsmedia.net\"]},{\"name\":\"mymovies\",\"category\":\"content\",\"domains\":[\"*.mymovies.net\"]},{\"name\":\"nRelate-VOID\",\"company\":\"nRelate\",\"category\":\"content\",\"domains\":[\"*.nrelate.com\"]},{\"name\":\"nToklo\",\"category\":\"analytics\",\"domains\":[\"*.ntoklo.com\"]},{\"name\":\"neXeps\",\"category\":\"ad\",\"domains\":[\"*.nexeps.com\"]},{\"name\":\"ninemsn Pty.\",\"category\":\"utility\",\"domains\":[\"*.ninemsn.com.au\"]},{\"name\":\"nugg.ad\",\"category\":\"ad\",\"domains\":[\"*.nuggad.net\"]},{\"name\":\"numero interactive\",\"company\":\"numero\",\"category\":\"ad\",\"domains\":[\"*.numerointeractive.com\"]},{\"name\":\"optMD\",\"company\":\"Optimax Media Delivery\",\"category\":\"ad\",\"domains\":[\"*.optmd.com\"]},{\"name\":\"otracking.com\",\"category\":\"analytics\",\"domains\":[\"*.otracking.com\"]},{\"name\":\"paysafecard\",\"company\":\"Paysafe Group\",\"category\":\"utility\",\"domains\":[\"*.paysafecard.com\"]},{\"name\":\"piano\",\"category\":\"ad\",\"domains\":[\"*.npttech.com\",\"*.tinypass.com\"],\"examples\":[\"www.npttech.com\"],\"totalExecutionTime\":890245,\"totalOccurrences\":1157},{\"name\":\"piclike\",\"category\":\"ad\",\"domains\":[\"*.piclike.us\"]},{\"name\":\"placehold.it\",\"category\":\"utility\",\"domains\":[\"*.placehold.it\"]},{\"name\":\"plista\",\"category\":\"ad\",\"domains\":[\"*.plista.com\"]},{\"name\":\"prebid.org\",\"category\":\"utility\",\"domains\":[\"*.prebid.org\"],\"totalExecutionTime\":479,\"totalOccurrences\":1},{\"name\":\"reEmbed\",\"category\":\"other\",\"domains\":[\"*.reembed.com\"]},{\"name\":\"reddit\",\"category\":\"social\",\"domains\":[\"*.reddit.com\",\"*.redditstatic.com\"],\"examples\":[\"www.redditstatic.com\"],\"totalExecutionTime\":3383386,\"totalOccurrences\":22740},{\"name\":\"rewardStyle.com\",\"category\":\"ad\",\"domains\":[\"*.rewardstyle.com\"],\"totalExecutionTime\":180100,\"totalOccurrences\":1279},{\"name\":\"rss2json\",\"category\":\"utility\",\"domains\":[\"*.rss2json.com\"],\"totalExecutionTime\":1424,\"totalOccurrences\":38},{\"name\":\"sage Pay\",\"company\":\"Sage Pay Europe\",\"category\":\"utility\",\"domains\":[\"*.sagepay.com\"]},{\"name\":\"section.io\",\"category\":\"utility\",\"domains\":[\"*.squixa.net\"],\"examples\":[\"beacon.squixa.net\",\"s.squixa.net\"]},{\"name\":\"smartclip\",\"category\":\"ad\",\"domains\":[\"*.smartclip.net\"],\"totalExecutionTime\":30274,\"totalOccurrences\":20},{\"name\":\"sovrn\",\"category\":\"ad\",\"domains\":[\"*.lijit.com\"],\"totalExecutionTime\":3924160,\"totalOccurrences\":26075},{\"name\":\"stackpile.io\",\"company\":\"StackPile\",\"category\":\"tag-manager\",\"domains\":[\"*.stackpile.io\"]},{\"name\":\"template-help.com\",\"category\":\"hosting\",\"domains\":[\"*.template-help.com\"],\"totalExecutionTime\":15926,\"totalOccurrences\":15},{\"name\":\"test\",\"company\":\"test only\",\"category\":\"other\",\"domains\":[\"*.testtesttest.com\"]},{\"name\":\"trueAnthem\",\"category\":\"social\",\"domains\":[\"*.tru.am\"]},{\"name\":\"tweetmeme-VOID\",\"company\":\"tweetmeme\",\"category\":\"analytics\",\"domains\":[\"*.tweetmeme.com\"]},{\"name\":\"uLogin\",\"category\":\"other\",\"domains\":[\"*.ulogin.ru\"]},{\"name\":\"uLogix\",\"category\":\"ad\",\"domains\":[\"*.ulogix.ru\"]},{\"name\":\"ucfunnel ucX\",\"company\":\"ucfunnel\",\"category\":\"ad\",\"domains\":[\"*.aralego.com\"],\"totalExecutionTime\":16500,\"totalOccurrences\":113},{\"name\":\"up-value\",\"category\":\"ad\",\"domains\":[\"*.up-value.de\"]},{\"name\":\"wywy\",\"category\":\"ad\",\"domains\":[\"*.wywy.com\",\"*.wywyuserservice.com\"]},{\"name\":\"CDK Dealer Management\",\"company\":\"CDK Global\",\"homepage\":\"https://www.cdkglobal.com/us\",\"category\":\"hosting\",\"domains\":[\"*.assets-cdk.com\"],\"examples\":[\"media-cf.assets-cdk.com\"]},{\"name\":\"fam\",\"company\":\"Fing Co Ltd.\",\"homepage\":\"http://admin.fam-ad.com/report/\",\"category\":\"ad\",\"domains\":[\"*.fam-ad.com\"],\"examples\":[\"img.fam-ad.com\"],\"totalExecutionTime\":381,\"totalOccurrences\":5},{\"name\":\"zypmedia\",\"category\":\"ad\",\"domains\":[\"*.extend.tv\"]},{\"name\":\"codigo\",\"homepage\":\"https://www.codigo.se\",\"category\":\"analytics\",\"domains\":[\"*.codigo.se\"],\"examples\":[\"analytics.codigo.se\"],\"totalExecutionTime\":344,\"totalOccurrences\":7},{\"name\":\"Playground\",\"homepage\":\"https://playground.xyz\",\"category\":\"ad\",\"domains\":[\"*.playground.xyz\"],\"examples\":[\"ads.playground.xyz\"],\"totalExecutionTime\":1995,\"totalOccurrences\":50},{\"name\":\"RAM\",\"homepage\":\"https://www2.rampanel.com/\",\"category\":\"analytics\",\"domains\":[\"*.rampanel.com\"],\"examples\":[\"inviso.rampanel.com\"],\"totalExecutionTime\":25005,\"totalOccurrences\":1},{\"name\":\"Adition\",\"homepage\":\"https://www.adition.com\",\"category\":\"ad\",\"domains\":[\"*.adition.com\"],\"examples\":[\"dsp.adfarm1.adition.com\"],\"totalExecutionTime\":77335,\"totalOccurrences\":504},{\"name\":\"Widespace\",\"homepage\":\"https://www.widespace.com\",\"category\":\"ad\",\"domains\":[\"*.widespace.com\"],\"examples\":[\"sync.widespace.com\"]},{\"name\":\"Colpirio\",\"homepage\":\"https://www.widespace.com\",\"category\":\"analytics\",\"domains\":[\"*.colpirio.com\"],\"examples\":[\"proxy-tracker.colpirio.com\"]},{\"name\":\"Brandmetrics\",\"homepage\":\"https://www.brandmetrics.com\",\"category\":\"analytics\",\"domains\":[\"*.brandmetrics.com\"],\"examples\":[\"collector.brandmetrics.com\",\"cdn.brandmetrics.com\"],\"totalExecutionTime\":3051079,\"totalOccurrences\":32452},{\"name\":\"EasyAd\",\"homepage\":\"https://web.easy-ads.com/\",\"category\":\"ad\",\"domains\":[\"*.easy-ads.com\"],\"examples\":[\"ads.easy-ads.com\"]},{\"name\":\"Glimr\",\"homepage\":\"https://glimr.io/\",\"category\":\"analytics\",\"domains\":[\"*.glimr.io\"],\"examples\":[\"pixel.glimr.io\"]},{\"name\":\"Webtreck\",\"homepage\":\"https://www.webtrekk.com/en/home/\",\"category\":\"analytics\",\"domains\":[\"*.wcfbc.net\"],\"examples\":[\"fbc.wcfbc.net\"]},{\"name\":\"DigiTrust\",\"homepage\":\"http://www.digitru.st/\",\"category\":\"analytics\",\"domains\":[\"*.digitru.st\"],\"examples\":[\"cdn.digitru.st\"]},{\"name\":\"Kantar Sifo\",\"homepage\":\"https://www.kantarsifo.se\",\"category\":\"analytics\",\"domains\":[\"*.research-int.se\"],\"examples\":[\"trafficgateway.research-int.se\"],\"totalExecutionTime\":572,\"totalOccurrences\":1},{\"name\":\"Concert\",\"homepage\":\"https://concert.io/\",\"category\":\"ad\",\"domains\":[\"*.concert.io\"],\"examples\":[\"cdn.concert.io\"],\"totalExecutionTime\":425643,\"totalOccurrences\":343},{\"name\":\"Emerse\",\"homepage\":\"https://www.emerse.com/\",\"category\":\"ad\",\"domains\":[\"*.emerse.com\"],\"examples\":[\"tracking.emerse.com\"],\"totalExecutionTime\":2701,\"totalOccurrences\":18},{\"name\":\"Iterate\",\"homepage\":\"https://iteratehq.com/\",\"category\":\"analytics\",\"domains\":[\"*.iteratehq.com\"],\"totalExecutionTime\":13148,\"totalOccurrences\":95},{\"name\":\"Cookiebot\",\"homepage\":\"https://www.cookiebot.com/\",\"category\":\"utility\",\"domains\":[\"*.cookiebot.com\"],\"examples\":[\"consent.cookiebot.com\"],\"totalExecutionTime\":68343938,\"totalOccurrences\":190786},{\"name\":\"Netlify\",\"homepage\":\"https://www.netlify.com/\",\"category\":\"utility\",\"domains\":[\"*.netlify.com\",\"*.netlifyusercontent.com\"],\"examples\":[\"cloud.netlifyusercontent.com\"],\"totalExecutionTime\":250941,\"totalOccurrences\":1208},{\"name\":\"Scroll\",\"homepage\":\"https://scroll.com/\",\"category\":\"utility\",\"domains\":[\"*.scroll.com\"],\"examples\":[\"static.scroll.com\",\"connect.scroll.com\"]},{\"name\":\"Consumable\",\"homepage\":\"https://consumable.com/\",\"category\":\"ad\",\"domains\":[\"*.serverbid.com\"],\"totalExecutionTime\":9731,\"totalOccurrences\":228},{\"name\":\"DMD Marketing\",\"homepage\":\"https://www.dmdconnects.com/\",\"category\":\"ad\",\"domains\":[\"*.medtargetsystem.com\"],\"totalExecutionTime\":196049,\"totalOccurrences\":858},{\"name\":\"Catchpoint\",\"homepage\":\"https://www.catchpoint.com/\",\"category\":\"analytics\",\"domains\":[\"*.3gl.net\",\"*.3genlabs.net\"],\"totalExecutionTime\":24555,\"totalOccurrences\":210},{\"name\":\"Terminus\",\"homepage\":\"https://terminus.com/\",\"category\":\"ad\",\"domains\":[\"*.terminus.services\"],\"totalExecutionTime\":22975,\"totalOccurrences\":176},{\"name\":\"Acceptable Ads\",\"homepage\":\"https://acceptableads.com/\",\"category\":\"ad\",\"domains\":[\"*.aaxads.com\",\"*.aaxdetect.com\"],\"totalExecutionTime\":3259,\"totalOccurrences\":43},{\"name\":\"ClearBrain\",\"homepage\":\"https://www.clearbrain.com/\",\"category\":\"analytics\",\"domains\":[\"*.clearbrain.com\"],\"examples\":[\"api.clearbrain.com\"]},{\"name\":\"Optanon\",\"homepage\":\"https://www.cookielaw.org/\",\"category\":\"consent-provider\",\"domains\":[\"*.onetrust.com\",\"*.cookielaw.org\"],\"examples\":[\"cdn.cookielaw.org\",\"geolocation.onetrust.com\"],\"totalExecutionTime\":72050355,\"totalOccurrences\":149745},{\"name\":\"TrustArc\",\"homepage\":\"https://www.trustarc.com/\",\"category\":\"utility\",\"domains\":[\"*.trustarc.com\"],\"examples\":[\"choices.trustarc.com\",\"consent.trustarc.com\"],\"totalExecutionTime\":2173682,\"totalOccurrences\":6594},{\"name\":\"iSpot.tv\",\"homepage\":\"https://www.ispot.tv/\",\"category\":\"ad\",\"domains\":[\"*.ispot.tv\"],\"examples\":[\"pt.ispot.tv\"],\"totalExecutionTime\":2080,\"totalOccurrences\":12},{\"name\":\"RevJet\",\"homepage\":\"https://www.revjet.com/\",\"category\":\"ad\",\"domains\":[\"*.revjet.com\"],\"examples\":[\"pix.revjet.com\",\"ads.revjet.com\"],\"totalExecutionTime\":4047,\"totalOccurrences\":8},{\"name\":\"atlasRTX\",\"homepage\":\"https://www.atlasrtx.com/\",\"category\":\"customer-success\",\"domains\":[\"*.atlasrtx.com\"],\"examples\":[\"app.atlasrtx.com\",\"cdn.atlasrtx.com\",\"dev.atlasrtx.com\"],\"totalExecutionTime\":38813,\"totalOccurrences\":39},{\"name\":\"ContactAtOnce\",\"homepage\":\"https://www.contactatonce.com/\",\"category\":\"customer-success\",\"domains\":[\"*.contactatonce.com\"],\"examples\":[\"tag.contactatonce.com\",\"agentpresence.contactatonce.com\"]},{\"name\":\"Algolia\",\"homepage\":\"https://www.algolia.com/\",\"category\":\"utility\",\"domains\":[\"*.algolianet.com\",\"*.algolia.net\",\"*.algolia.io\"],\"totalExecutionTime\":10292,\"totalOccurrences\":28},{\"name\":\"EMX Digital\",\"homepage\":\"https://emxdigital.com\",\"category\":\"ad\",\"domains\":[\"*.emxdgt.com\"],\"totalExecutionTime\":411,\"totalOccurrences\":69},{\"name\":\"Moxie\",\"homepage\":\"https://www.gomoxie.com/\",\"category\":\"utility\",\"domains\":[\"*.gomoxie.solutions\"],\"totalExecutionTime\":8905,\"totalOccurrences\":17},{\"name\":\"Scripps Network Digital\",\"homepage\":\"https://www.scrippsnetworksdigital.com/\",\"category\":\"ad\",\"domains\":[\"*.snidigital.com\"]},{\"name\":\"TurnTo\",\"homepage\":\"https://www.turntonetworks.com/\",\"category\":\"utility\",\"domains\":[\"*.turnto.com\"],\"totalExecutionTime\":3844,\"totalOccurrences\":33},{\"name\":\"Quantum Metric\",\"homepage\":\"https://www.quantummetric.com/\",\"category\":\"analytics\",\"domains\":[\"*.quantummetric.com\"],\"totalExecutionTime\":1519630,\"totalOccurrences\":1119},{\"name\":\"Carbon Ads\",\"homepage\":\"https://www.carbonads.net/\",\"category\":\"ad\",\"domains\":[\"*.carbonads.net\",\"*.carbonads.com\"],\"totalExecutionTime\":14556,\"totalOccurrences\":267},{\"name\":\"Ably\",\"homepage\":\"https://www.ably.io/\",\"category\":\"utility\",\"domains\":[\"*.ably.io\"],\"totalExecutionTime\":11969,\"totalOccurrences\":130},{\"name\":\"Sectigo\",\"homepage\":\"https://sectigo.com/\",\"category\":\"utility\",\"domains\":[\"*.sectigo.com\"],\"totalExecutionTime\":2595,\"totalOccurrences\":3},{\"name\":\"Specless\",\"homepage\":\"https://gospecless.com/\",\"category\":\"ad\",\"domains\":[\"*.specless.tech\"]},{\"name\":\"Loggly\",\"homepage\":\"https://www.loggly.com/\",\"category\":\"analytics\",\"domains\":[\"*.loggly.com\",\"d9jmv9u00p0mv.cloudfront.net\"],\"examples\":[\"logs-01.loggly.com\"],\"totalExecutionTime\":899,\"totalOccurrences\":6},{\"name\":\"Intent Media\",\"homepage\":\"https://intent.com/\",\"category\":\"ad\",\"domains\":[\"*.intentmedia.net\"]},{\"name\":\"Supership\",\"homepage\":\"https://supership.jp/\",\"category\":\"ad\",\"domains\":[\"*.socdm.com\"],\"totalExecutionTime\":6561009,\"totalOccurrences\":13620},{\"name\":\"F@N Communications\",\"homepage\":\"https://www.fancs.com/\",\"category\":\"ad\",\"domains\":[\"*.ladsp.com\"],\"examples\":[\"px.ladsp.com\"],\"totalExecutionTime\":631877,\"totalOccurrences\":5851},{\"name\":\"Vidyard\",\"homepage\":\"https://www.vidyard.com/\",\"category\":\"utility\",\"domains\":[\"*.vidyard.com\"],\"totalExecutionTime\":1173138,\"totalOccurrences\":1121},{\"name\":\"RapidSSL\",\"homepage\":\"https://www.rapidssl.com/\",\"category\":\"utility\",\"domains\":[\"*.rapidssl.com\"],\"totalExecutionTime\":734,\"totalOccurrences\":2},{\"name\":\"Coherent Path\",\"homepage\":\"https://coherentpath.com/\",\"category\":\"utility\",\"domains\":[\"*.coherentpath.com\"]},{\"name\":\"Attentive\",\"homepage\":\"https://attentivemobile.com/\",\"category\":\"ad\",\"domains\":[\"*.attn.tv\",\"*.attentivemobile.com\"],\"totalExecutionTime\":4645658,\"totalOccurrences\":8667},{\"name\":\"emetriq\",\"homepage\":\"https://www.emetriq.com/\",\"category\":\"ad\",\"domains\":[\"*.emetriq.de\",\"*.xplosion.de\"],\"totalExecutionTime\":940,\"totalOccurrences\":13},{\"name\":\"Bonzai\",\"homepage\":\"https://www.bonzai.co/\",\"category\":\"ad\",\"domains\":[\"*.bonzai.co\"]},{\"name\":\"Freshchat\",\"homepage\":\"https://www.freshworks.com/live-chat-software/\",\"category\":\"customer-success\",\"domains\":[\"*.freshchat.com\",\"*.freshworksapi.com\"],\"products\":[{\"name\":\"Freshdesk Messaging\",\"urlPatterns\":[\"wchat.freshchat.com\"],\"facades\":[{\"name\":\"Freshdesk Messaging (formerly Freshchat) Facade\",\"repo\":\"https://github.com/coliff/freshdesk-messaging-facade/\"}]}],\"totalExecutionTime\":19618913,\"totalOccurrences\":6759},{\"name\":\"Contentful\",\"homepage\":\"https://www.contentful.com/\",\"category\":\"utility\",\"domains\":[\"*.contentful.com\"],\"examples\":[\"cdn.contentful.com\"],\"totalExecutionTime\":6403,\"totalOccurrences\":2},{\"name\":\"PureCars\",\"homepage\":\"https://www.purecars.com/\",\"category\":\"marketing\",\"domains\":[\"*.purecars.com\"],\"examples\":[\"cdn.purecars.com\"],\"totalExecutionTime\":655352,\"totalOccurrences\":1181},{\"name\":\"Tray Commerce\",\"homepage\":\"https://www.tray.com.br/\",\"category\":\"marketing\",\"domains\":[\"*.tcdn.com.br\"],\"examples\":[\"images.tcdn.com.br\"],\"totalExecutionTime\":64998488,\"totalOccurrences\":13735},{\"name\":\"AdScore\",\"homepage\":\"https://www.adscore.com/\",\"category\":\"ad\",\"domains\":[\"*.adsco.re\"],\"examples\":[\"c.adsco.re\"],\"totalExecutionTime\":2694692,\"totalOccurrences\":4165},{\"name\":\"WebsiteBuilder.com\",\"homepage\":\"https://www.websitebuilder.com\",\"category\":\"hosting\",\"domains\":[\"*.mywebsitebuilder.com\"],\"totalExecutionTime\":18682712,\"totalOccurrences\":4285},{\"name\":\"mParticle\",\"homepage\":\"https://www.mparticle.com/\",\"category\":\"utility\",\"domains\":[\"*.mparticle.com\"],\"examples\":[\"jssdks.mparticle.com\",\"identity.mparticle.com\"],\"totalExecutionTime\":223163,\"totalOccurrences\":1029},{\"name\":\"Ada\",\"homepage\":\"https://www.ada.support/\",\"category\":\"customer-success\",\"domains\":[\"*.ada.support\"],\"examples\":[\"static.ada.support\"],\"totalExecutionTime\":591032,\"totalOccurrences\":965},{\"name\":\"Quora Ads\",\"homepage\":\"https://www.quora.com/business/\",\"category\":\"ad\",\"domains\":[\"*.quora.com\"],\"examples\":[\"q.quora.com\"],\"totalExecutionTime\":3087051,\"totalOccurrences\":8587},{\"name\":\"Auth0\",\"homepage\":\"https://auth0.com/\",\"category\":\"utility\",\"domains\":[\"*.auth0.com\"],\"examples\":[\"cdn.auth0.com\"],\"totalExecutionTime\":239965,\"totalOccurrences\":894},{\"name\":\"Bridgewell DSP\",\"homepage\":\"https://www.bridgewell.com/\",\"category\":\"ad\",\"domains\":[\"*.scupio.com\"],\"examples\":[\"img.scupio.com\"],\"totalExecutionTime\":50823,\"totalOccurrences\":302},{\"name\":\"Wicked Reports\",\"homepage\":\"https://www.wickedreports.com/\",\"category\":\"marketing\",\"domains\":[\"*.wickedreports.com\"],\"examples\":[\"widget.wickedreports.com\"],\"totalExecutionTime\":205991,\"totalOccurrences\":510},{\"name\":\"Jaywing\",\"homepage\":\"https://jaywing.com/\",\"category\":\"marketing\",\"domains\":[\"*.jaywing.com\"],\"examples\":[\"amazon.almanac.jaywing.com\"]},{\"name\":\"Holimetrix\",\"homepage\":\"https://u360.d-bi.fr/\",\"category\":\"marketing\",\"domains\":[\"*.d-bi.fr\"],\"examples\":[\"u360.d-bi.fr\"]},{\"name\":\"iZooto\",\"homepage\":\"https://www.izooto.com\",\"category\":\"marketing\",\"domains\":[\"*.izooto.com\"],\"examples\":[\"cdn.izooto.com\"],\"totalExecutionTime\":958658,\"totalOccurrences\":1949},{\"name\":\"Ordergroove\",\"homepage\":\"https://www.ordergroove.com/\",\"category\":\"marketing\",\"domains\":[\"*.ordergroove.com\"],\"examples\":[\"static.ordergroove.com\"],\"totalExecutionTime\":72854,\"totalOccurrences\":271},{\"name\":\"PageSense\",\"homepage\":\"https://www.zoho.com/pagesense/\",\"category\":\"analytics\",\"domains\":[\"*.pagesense.io\"],\"examples\":[\"cdn.pagesense.io\"],\"totalExecutionTime\":2495398,\"totalOccurrences\":7510},{\"name\":\"Vizzit\",\"homepage\":\"https://www.vizzit.se\",\"category\":\"analytics\",\"domains\":[\"*.vizzit.se\"],\"examples\":[\"www.vizzit.se\",\"tag.vizzit.se\"],\"totalExecutionTime\":449,\"totalOccurrences\":9},{\"name\":\"Click Guardian\",\"homepage\":\"https://www.clickguardian.co.uk/\",\"category\":\"ad\",\"domains\":[\"*.clickguardian.app\",\"*.clickguardian.co.uk\"],\"examples\":[\"v2.clickguardian.app\",\"protection.clickguardian.co.uk\"],\"totalExecutionTime\":194442,\"totalOccurrences\":1102},{\"name\":\"Smartsupp\",\"company\":\"Smartsupp.com\",\"homepage\":\"https://www.smartsupp.com\",\"category\":\"customer-success\",\"domains\":[\"*.smartsuppchat.com\",\"*.smartsupp.com\",\"smartsupp-widget-161959.c.cdn77.org\",\"*.smartsuppcdn.com\"],\"examples\":[\"widget-v1.smartsuppcdn.com\"],\"totalExecutionTime\":12092500,\"totalOccurrences\":20654},{\"name\":\"Smartlook\",\"company\":\"Smartsupp.com\",\"homepage\":\"https://www.smartlook.com/\",\"category\":\"analytics\",\"domains\":[\"*.smartlook.com\"],\"totalExecutionTime\":1200867,\"totalOccurrences\":15329},{\"name\":\"Luigis Box\",\"company\":\"Luigis Box\",\"homepage\":\"https://www.luigisbox.com/\",\"category\":\"utility\",\"domains\":[\"*.luigisbox.com\"],\"totalExecutionTime\":3649850,\"totalOccurrences\":2556},{\"name\":\"Targito\",\"company\":\"VIVmail.cz\",\"homepage\":\"https://www.targito.com\",\"category\":\"marketing\",\"domains\":[\"*.targito.com\"],\"totalExecutionTime\":2078,\"totalOccurrences\":25},{\"name\":\"Foxentry\",\"company\":\"AVANTRO\",\"homepage\":\"https://foxentry.cz/\",\"category\":\"utility\",\"domains\":[\"*.foxentry.cz\"],\"totalExecutionTime\":619308,\"totalOccurrences\":2396},{\"name\":\"Pendo\",\"homepage\":\"https://www.pendo.io\",\"category\":\"analytics\",\"domains\":[\"*.pendo.io\"],\"examples\":[\"app.pendo.io\"],\"totalExecutionTime\":6289271,\"totalOccurrences\":14389},{\"name\":\"Braze\",\"homepage\":\"https://www.braze.com\",\"category\":\"analytics\",\"domains\":[\"*.appboycdn.com\"],\"examples\":[\"js.appboycdn.com\"],\"totalExecutionTime\":343957,\"totalOccurrences\":2314},{\"name\":\"Usersnap\",\"homepage\":\"https://usersnap.com\",\"category\":\"customer-success\",\"domains\":[\"*.usersnap.com\"],\"examples\":[\"api.usersnap.com\",\"cdn.usersnap.com\"],\"totalExecutionTime\":270690,\"totalOccurrences\":455},{\"name\":\"Rewardful\",\"homepage\":\"https://www.getrewardful.com\",\"category\":\"analytics\",\"domains\":[\"*.wdfl.co\"],\"examples\":[\"r.wdfl.co\"],\"totalExecutionTime\":8584,\"totalOccurrences\":172},{\"name\":\"Launch Darkly\",\"homepage\":\"https://launchdarkly.com\",\"category\":\"utility\",\"domains\":[\"*.launchdarkly.com\"],\"examples\":[\"app.launchdarkly.com\",\"events.launchdarkly.com\"],\"totalExecutionTime\":3579,\"totalOccurrences\":5},{\"name\":\"Statuspage\",\"company\":\"Atlassian\",\"homepage\":\"https://www.statuspage.io\",\"category\":\"utility\",\"domains\":[\"*.statuspage.io\"],\"examples\":[\"1k6wzpspjf99.statuspage.io\"],\"totalExecutionTime\":40098,\"totalOccurrences\":1340},{\"name\":\"HyperInzerce\",\"homepage\":\"https://hyperinzerce.cz\",\"category\":\"ad\",\"domains\":[\"*.hyperinzerce.cz\"],\"examples\":[\"motorky.hyperinzerce.cz\"],\"totalExecutionTime\":723,\"totalOccurrences\":39},{\"name\":\"POWr\",\"homepage\":\"https://www.powr.io\",\"category\":\"utility\",\"domains\":[\"*.powr.io\"],\"examples\":[\"www.powr.io\"],\"totalExecutionTime\":171026972,\"totalOccurrences\":35803},{\"name\":\"Coral\",\"company\":\"Coral\",\"homepage\":\"https://coralproject.net\",\"category\":\"content\",\"domains\":[\"*.coral.coralproject.net\"],\"examples\":[\"company.coral.coralproject.net\"],\"totalExecutionTime\":51473,\"totalOccurrences\":263},{\"name\":\"Bolt\",\"homepage\":\"https://www.bolt.com/\",\"category\":\"utility\",\"domains\":[\"*.bolt.com\"],\"examples\":[\"connect.bolt.com\"],\"totalExecutionTime\":427966,\"totalOccurrences\":188},{\"name\":\"Judge.me\",\"homepage\":\"https://judge.me/\",\"category\":\"marketing\",\"domains\":[\"*.judge.me\"],\"examples\":[\"cdn.judge.me\"],\"totalExecutionTime\":28441183,\"totalOccurrences\":30070},{\"name\":\"Tilda\",\"homepage\":\"https://tilda.cc/\",\"category\":\"hosting\",\"domains\":[\"*.tildacdn.com\"],\"examples\":[\"stat.tildacdn.com\",\"static.tildacdn.com\",\"upwidget.tildacdn.com\"],\"totalExecutionTime\":94700608,\"totalOccurrences\":74879},{\"name\":\"SalesLoft\",\"homepage\":\"https://salesloft.com/\",\"category\":\"marketing\",\"domains\":[\"*.salesloft.com\"],\"examples\":[\"scout-cdn.salesloft.com\"],\"totalExecutionTime\":29881,\"totalOccurrences\":408},{\"name\":\"Accessibe Accessibility Overlay\",\"company\":\"Accessibe\",\"homepage\":\"https://accessibe.com/\",\"category\":\"utility\",\"domains\":[\"*.accessibe.com\",\"*.acsbapp.com\",\"*.acsbap.com\"],\"examples\":[\"accessibe.com\",\"acsbapp.com\"],\"totalExecutionTime\":501586,\"totalOccurrences\":1018},{\"name\":\"Builder\",\"homepage\":\"https://www.builder.io/\",\"category\":\"hosting\",\"domains\":[\"*.builder.io\"],\"examples\":[\"cdn.builder.io\"],\"totalExecutionTime\":362733,\"totalOccurrences\":256},{\"name\":\"Pepperjam\",\"homepage\":\"https://www.pepperjam.com/\",\"category\":\"marketing\",\"domains\":[\"*.pepperjam.com\",\"*.affiliatetechnology.com\"],\"examples\":[\"container.pepperjam.com\"],\"totalExecutionTime\":1411,\"totalOccurrences\":24},{\"name\":\"Reach\",\"homepage\":\"https://withreach.com/\",\"category\":\"utility\",\"domains\":[\"*.gointerpay.net\"],\"examples\":[\"checkout.gointerpay.net\"]},{\"name\":\"Chameleon\",\"homepage\":\"https://www.trychameleon.com/\",\"category\":\"marketing\",\"domains\":[\"*.trychameleon.com\"],\"examples\":[\"fast.trychameleon.com\"],\"totalExecutionTime\":16790,\"totalOccurrences\":8},{\"name\":\"Matomo\",\"company\":\"InnoCraft\",\"homepage\":\"https://matomo.org/\",\"category\":\"analytics\",\"domains\":[\"*.matomo.cloud\"],\"totalExecutionTime\":2796841,\"totalOccurrences\":14938},{\"name\":\"Segmanta\",\"homepage\":\"https://segmanta.com/\",\"category\":\"marketing\",\"domains\":[\"*.segmanta.com\"],\"examples\":[\"clientName.segmanta.com\"]},{\"name\":\"Podsights\",\"homepage\":\"https://podsights.com/\",\"category\":\"marketing\",\"domains\":[\"*.pdst.fm\",\"us-central1-adaptive-growth.cloudfunctions.net\"],\"examples\":[\"cdn.pdst.fm\",\"sink.pdst.fm\"],\"totalExecutionTime\":50718,\"totalOccurrences\":859},{\"name\":\"Chatwoot\",\"homepage\":\"https://www.chatwoot.com/\",\"category\":\"customer-success\",\"domains\":[\"*.chatwoot.com\"],\"examples\":[\"cdn.chatwoot.com\",\"app.chatwoot.com\"],\"totalExecutionTime\":31614,\"totalOccurrences\":717},{\"name\":\"Crisp\",\"homepage\":\"https://crisp.chat/\",\"category\":\"customer-success\",\"domains\":[\"*.crisp.chat\"],\"examples\":[\"client.crisp.chat\",\"client.relay.crisp.chat\"],\"totalExecutionTime\":42488,\"totalOccurrences\":1577},{\"name\":\"Admiral CMP\",\"homepage\":\"https://www.getadmiral.com\",\"category\":\"consent-provider\",\"domains\":[\"admiral.mgr.consensu.org\",\"*.admiral.mgr.consensu.org\"]},{\"name\":\"Adnuntius CMP\",\"homepage\":\"https://adnuntius.com\",\"category\":\"consent-provider\",\"domains\":[\"adnuntiusconsent.mgr.consensu.org\",\"*.adnuntiusconsent.mgr.consensu.org\"]},{\"name\":\"Clickio CMP\",\"homepage\":\"https://clickio.com\",\"category\":\"consent-provider\",\"domains\":[\"clickio.mgr.consensu.org\",\"*.clickio.mgr.consensu.org\"]},{\"name\":\"AppConsent CMP\",\"homepage\":\"https://appconsent.io/en\",\"category\":\"consent-provider\",\"domains\":[\"appconsent.mgr.consensu.org\",\"*.appconsent.mgr.consensu.org\"]},{\"name\":\"DMG Media CMP\",\"homepage\":\"https://www.dmgmedia.co.uk\",\"category\":\"consent-provider\",\"domains\":[\"dmgmedia.mgr.consensu.org\",\"*.dmgmedia.mgr.consensu.org\"]},{\"name\":\"Axel Springer CMP\",\"homepage\":\"https://www.axelspringer.com\",\"category\":\"consent-provider\",\"domains\":[\"axelspringer.mgr.consensu.org\",\"*.axelspringer.mgr.consensu.org\"]},{\"name\":\"Bedrock CMP\",\"homepage\":\"https://www.bedrockstreaming.com\",\"category\":\"consent-provider\",\"domains\":[\"bedrock.mgr.consensu.org\",\"*.bedrock.mgr.consensu.org\"]},{\"name\":\"BMIND CMP\",\"homepage\":\"https://www.bmind.es\",\"category\":\"consent-provider\",\"domains\":[\"bmind.mgr.consensu.org\",\"*.bmind.mgr.consensu.org\"]},{\"name\":\"Borlabs CMP\",\"homepage\":\"https://borlabs.io\",\"category\":\"consent-provider\",\"domains\":[\"borlabs.mgr.consensu.org\",\"*.borlabs.mgr.consensu.org\"]},{\"name\":\"Civic CMP\",\"homepage\":\"https://www.civicuk.com\",\"category\":\"consent-provider\",\"domains\":[\"cookiecontrol.mgr.consensu.org\",\"*.cookiecontrol.mgr.consensu.org\"]},{\"name\":\"Commanders Act CMP\",\"homepage\":\"https://www.commandersact.com\",\"category\":\"consent-provider\",\"domains\":[\"commandersact.mgr.consensu.org\",\"*.commandersact.mgr.consensu.org\"]},{\"name\":\"Complianz CMP\",\"homepage\":\"https://complianz.io/\",\"category\":\"consent-provider\",\"domains\":[\"complianz.mgr.consensu.org\",\"*.complianz.mgr.consensu.org\"]},{\"name\":\"Consent Desk CMP\",\"homepage\":\"https://www.consentdesk.com/\",\"category\":\"consent-provider\",\"domains\":[\"consentdesk.mgr.consensu.org\",\"*.consentdesk.mgr.consensu.org\"]},{\"name\":\"Consent Manager CMP\",\"homepage\":\"https://consentmanager.net\",\"category\":\"consent-provider\",\"domains\":[\"consentmanager.mgr.consensu.org\",\"*.consentmanager.mgr.consensu.org\"]},{\"name\":\"Conversant CMP\",\"homepage\":\"https://www.conversantmedia.eu/\",\"category\":\"consent-provider\",\"domains\":[\"conversant.mgr.consensu.org\",\"*.conversant.mgr.consensu.org\"]},{\"name\":\"Cookie Information CMP\",\"homepage\":\"https://www.cookieinformation.com/\",\"category\":\"consent-provider\",\"domains\":[\"cookieinformation.mgr.consensu.org\",\"*.cookieinformation.mgr.consensu.org\"]},{\"name\":\"Cookiebot CMP\",\"homepage\":\"https://www.cookiebot.com\",\"category\":\"consent-provider\",\"domains\":[\"cookiebot.mgr.consensu.org\",\"*.cookiebot.mgr.consensu.org\"]},{\"name\":\"Truendo CMP\",\"homepage\":\"https://truendo.com/\",\"category\":\"consent-provider\",\"domains\":[\"truendo.mgr.consensu.org\",\"*.truendo.mgr.consensu.org\"]},{\"name\":\"Dentsu CMP\",\"homepage\":\"https://www.dentsuaegisnetwork.de/\",\"category\":\"consent-provider\",\"domains\":[\"dan.mgr.consensu.org\",\"*.dan.mgr.consensu.org\"]},{\"name\":\"Didomi CMP\",\"homepage\":\"https://www.didomi.io/en/\",\"category\":\"consent-provider\",\"domains\":[\"didomi.mgr.consensu.org\",\"*.didomi.mgr.consensu.org\"]},{\"name\":\"Ensighten CMP\",\"homepage\":\"https://www.ensighten.com/\",\"category\":\"consent-provider\",\"domains\":[\"ensighten.mgr.consensu.org\",\"*.ensighten.mgr.consensu.org\"]},{\"name\":\"Evidon CMP\",\"homepage\":\"https://evidon.com\",\"category\":\"consent-provider\",\"domains\":[\"evidon.mgr.consensu.org\",\"*.evidon.mgr.consensu.org\"]},{\"name\":\"Ezoic CMP\",\"homepage\":\"https://www.ezoic.com/\",\"category\":\"consent-provider\",\"domains\":[\"ezoic.mgr.consensu.org\",\"*.ezoic.mgr.consensu.org\"]},{\"name\":\"Gemius CMP\",\"homepage\":\"https://www.gemius.com\",\"category\":\"consent-provider\",\"domains\":[\"gemius.mgr.consensu.org\",\"*.gemius.mgr.consensu.org\"]},{\"name\":\"NitroPay CMP\",\"homepage\":\"https://nitropay.com/\",\"category\":\"consent-provider\",\"domains\":[\"nitropay.mgr.consensu.org\",\"*.nitropay.mgr.consensu.org\"]},{\"name\":\"Google FundingChoices\",\"homepage\":\"https://fundingchoices.google.com/start/\",\"category\":\"consent-provider\",\"domains\":[\"fundingchoices.mgr.consensu.org\",\"*.fundingchoices.mgr.consensu.org\",\"fundingchoicesmessages.google.com\",\"*.fundingchoicesmessages.google.com\"],\"totalExecutionTime\":224218823,\"totalOccurrences\":377764},{\"name\":\"Gravito CMP\",\"homepage\":\"https://www.gravito.net/\",\"category\":\"consent-provider\",\"domains\":[\"gravito.mgr.consensu.org\",\"*.gravito.mgr.consensu.org\"]},{\"name\":\"ID Ward CMP\",\"homepage\":\"https://id-ward.com/enterprise\",\"category\":\"consent-provider\",\"domains\":[\"idward.mgr.consensu.org\",\"*.idward.mgr.consensu.org\"]},{\"name\":\"iubenda CMP\",\"homepage\":\"https://www.iubenda.com\",\"category\":\"consent-provider\",\"domains\":[\"iubenda.mgr.consensu.org\",\"*.iubenda.mgr.consensu.org\"]},{\"name\":\"Jump CMP\",\"homepage\":\"https://jumpgroup.it/\",\"category\":\"consent-provider\",\"domains\":[\"avacy.mgr.consensu.org\",\"*.avacy.mgr.consensu.org\"]},{\"name\":\"LiveRamp CMP\",\"homepage\":\"https://liveramp.com/\",\"category\":\"consent-provider\",\"domains\":[\"faktor.mgr.consensu.org\",\"*.faktor.mgr.consensu.org\"]},{\"name\":\"Madvertise CMP\",\"homepage\":\"https://madvertise.com/en/\",\"category\":\"consent-provider\",\"domains\":[\"madvertise.mgr.consensu.org\",\"*.madvertise.mgr.consensu.org\"]},{\"name\":\"Mairdumont Netletic CMP\",\"homepage\":\"https://www.mairdumont-netletix.com/\",\"category\":\"consent-provider\",\"domains\":[\"mdnxmp.mgr.consensu.org\",\"*.mdnxmp.mgr.consensu.org\"]},{\"name\":\"Marfeel CMP\",\"homepage\":\"https://www.marfeel.com/\",\"category\":\"consent-provider\",\"domains\":[\"marfeel.mgr.consensu.org\",\"*.marfeel.mgr.consensu.org\"]},{\"name\":\"Mediavine CMP\",\"homepage\":\"https://www.mediavine.com/\",\"category\":\"consent-provider\",\"domains\":[\"mediavine.mgr.consensu.org\",\"*.mediavine.mgr.consensu.org\"]},{\"name\":\"ConsentServe CMP\",\"homepage\":\"https://www.consentserve.com/\",\"category\":\"consent-provider\",\"domains\":[\"consentserve.mgr.consensu.org\",\"*.consentserve.mgr.consensu.org\"]},{\"name\":\"Next14 CMP\",\"homepage\":\"https://www.next14.com/\",\"category\":\"consent-provider\",\"domains\":[\"next14.mgr.consensu.org\",\"*.next14.mgr.consensu.org\"]},{\"name\":\"AdRoll CMP\",\"homepage\":\"https://www.adroll.com/\",\"category\":\"consent-provider\",\"domains\":[\"adroll.mgr.consensu.org\",\"*.adroll.mgr.consensu.org\"]},{\"name\":\"Ogury CMP\",\"homepage\":\"https://www.ogury.com/\",\"category\":\"consent-provider\",\"domains\":[\"ogury.mgr.consensu.org\",\"*.ogury.mgr.consensu.org\"]},{\"name\":\"OneTag CMP\",\"homepage\":\"https://onetag.net\",\"category\":\"consent-provider\",\"domains\":[\"onetag.mgr.consensu.org\",\"*.onetag.mgr.consensu.org\"]},{\"name\":\"OneTrust CMP\",\"homepage\":\"https://onetrust.com\",\"category\":\"consent-provider\",\"domains\":[\"onetrust.mgr.consensu.org\",\"*.onetrust.mgr.consensu.org\"]},{\"name\":\"optAd360 CMP\",\"homepage\":\"https://www.optad360.com/\",\"category\":\"consent-provider\",\"domains\":[\"optad360.mgr.consensu.org\",\"*.optad360.mgr.consensu.org\"]},{\"name\":\"Osano CMP\",\"homepage\":\"https://www.osano.com\",\"category\":\"consent-provider\",\"domains\":[\"osano.mgr.consensu.org\",\"*.osano.mgr.consensu.org\",\"cmp.osano.com\",\"*.api.osano.com\"],\"totalExecutionTime\":19672712,\"totalOccurrences\":11631},{\"name\":\"Playwire CMP\",\"homepage\":\"https://www.playwire.com\",\"category\":\"consent-provider\",\"domains\":[\"playwire.mgr.consensu.org\",\"*.playwire.mgr.consensu.org\"]},{\"name\":\"Pulselive CMP\",\"homepage\":\"https://www.pulselive.com\",\"category\":\"consent-provider\",\"domains\":[\"pulselive.mgr.consensu.org\",\"*.pulselive.mgr.consensu.org\"]},{\"name\":\"Quantcast Choice\",\"homepage\":\"https://quantcast.com\",\"category\":\"consent-provider\",\"domains\":[\"quantcast.mgr.consensu.org\",\"*.quantcast.mgr.consensu.org\"]},{\"name\":\"RCS Pubblicita CMP\",\"homepage\":\"http://www.rcspubblicita.it/site/home.html\",\"category\":\"consent-provider\",\"domains\":[\"rcsmediagroup.mgr.consensu.org\",\"*.rcsmediagroup.mgr.consensu.org\"]},{\"name\":\"Rich Audience CMP\",\"homepage\":\"https://richaudience.com\",\"category\":\"consent-provider\",\"domains\":[\"richaudience.mgr.consensu.org\",\"*.richaudience.mgr.consensu.org\"]},{\"name\":\"Ringier Axel Springer CMP\",\"homepage\":\"https://www.ringieraxelspringer.pl/en/home/\",\"category\":\"consent-provider\",\"domains\":[\"rasp.mgr.consensu.org\",\"*.rasp.mgr.consensu.org\"]},{\"name\":\"Secure Privacy CMP\",\"homepage\":\"https://secureprivacy.ai/\",\"category\":\"consent-provider\",\"domains\":[\"secureprivacy.mgr.consensu.org\",\"*.secureprivacy.mgr.consensu.org\"]},{\"name\":\"Securiti CMP\",\"homepage\":\"https://securiti.ai/\",\"category\":\"consent-provider\",\"domains\":[\"securiti.mgr.consensu.org\",\"*.securiti.mgr.consensu.org\"]},{\"name\":\"Seznam.cz CMP\",\"homepage\":\"https://www.seznam.cz/\",\"category\":\"consent-provider\",\"domains\":[\"seznam.mgr.consensu.org\",\"*.seznam.mgr.consensu.org\"]},{\"name\":\"ShareThis CMP\",\"homepage\":\"https://sharethis.com\",\"category\":\"consent-provider\",\"domains\":[\"sharethis.mgr.consensu.org\",\"*.sharethis.mgr.consensu.org\"]},{\"name\":\"ShinyStat CMP\",\"homepage\":\"https://www.shinystat.com\",\"category\":\"consent-provider\",\"domains\":[\"shinystat.mgr.consensu.org\",\"*.shinystat.mgr.consensu.org\"]},{\"name\":\"Sibbo CMP\",\"homepage\":\"https://sibboventures.com/en/\",\"category\":\"consent-provider\",\"domains\":[\"sibboventures.mgr.consensu.org\",\"*.sibboventures.mgr.consensu.org\"]},{\"name\":\"Singlespot CMP\",\"homepage\":\"https://www.singlespot.com/en\",\"category\":\"consent-provider\",\"domains\":[\"singlespot.mgr.consensu.org\",\"*.singlespot.mgr.consensu.org\"]},{\"name\":\"Sirdata CMP\",\"homepage\":\"https://www.sirdata.com\",\"category\":\"consent-provider\",\"domains\":[\"sddan.mgr.consensu.org\",\"*.sddan.mgr.consensu.org\"]},{\"name\":\"Snigel CMP\",\"homepage\":\"https://snigel.com\",\"category\":\"consent-provider\",\"domains\":[\"snigelweb.mgr.consensu.org\",\"*.snigelweb.mgr.consensu.org\"]},{\"name\":\"Sourcepoint CMP\",\"homepage\":\"https://sourcepoint.com\",\"category\":\"consent-provider\",\"domains\":[\"sourcepoint.mgr.consensu.org\",\"*.sourcepoint.mgr.consensu.org\"]},{\"name\":\"Pubtech CMP\",\"homepage\":\"https://www.pubtech.ai/\",\"category\":\"consent-provider\",\"domains\":[\"pubtech.mgr.consensu.org\",\"*.pubtech.mgr.consensu.org\"]},{\"name\":\"AdMetrics Pro CMP\",\"homepage\":\"https://admetricspro.com\",\"category\":\"consent-provider\",\"domains\":[\"cmp.mgr.consensu.org\",\"*.cmp.mgr.consensu.org\"]},{\"name\":\"Traffective CMP\",\"homepage\":\"https://traffective.com\",\"category\":\"consent-provider\",\"domains\":[\"traffective.mgr.consensu.org\",\"*.traffective.mgr.consensu.org\"]},{\"name\":\"UniConsent CMP\",\"homepage\":\"https://www.uniconsent.com\",\"category\":\"consent-provider\",\"domains\":[\"uniconsent.mgr.consensu.org\",\"*.uniconsent.mgr.consensu.org\",\"cmp.uniconsent.com\",\"*.uniconsent.com\"],\"totalExecutionTime\":658531,\"totalOccurrences\":1253},{\"name\":\"TrustArc CMP\",\"homepage\":\"https://trustarc.com/\",\"category\":\"consent-provider\",\"domains\":[\"trustarc.mgr.consensu.org\",\"*.trustarc.mgr.consensu.org\"]},{\"name\":\"Usercentrics CMP\",\"homepage\":\"https://usercentrics.com\",\"category\":\"consent-provider\",\"domains\":[\"usercentrics.mgr.consensu.org\",\"*.usercentrics.mgr.consensu.org\",\"*.usercentrics.eu\",\"*.services.usercentrics.eu\"],\"totalExecutionTime\":45652636,\"totalOccurrences\":49164},{\"name\":\"WebAds CMP\",\"homepage\":\"https://www.webads.nl/\",\"category\":\"consent-provider\",\"domains\":[\"webads.mgr.consensu.org\",\"*.webads.mgr.consensu.org\"]},{\"name\":\"Trustcommander\",\"company\":\"Commandersact\",\"homepage\":\"https://www.commandersact.com\",\"category\":\"consent-provider\",\"domains\":[\"*.trustcommander.net\"],\"examples\":[\"cdn.trustcommander.net\",\"privacy.trustcommander.net\"],\"totalExecutionTime\":322842,\"totalOccurrences\":1689},{\"name\":\"Hubvisor\",\"homepage\":\"https://www.hubvisor.io\",\"category\":\"ad\",\"domains\":[\"*.hubvisor.io\"],\"examples\":[\"cdn.hubvisor.io\",\"stream.hubvisor.io\"],\"totalExecutionTime\":142958,\"totalOccurrences\":108},{\"name\":\"Castle\",\"homepage\":\"https://castle.io\",\"category\":\"utility\",\"domains\":[\"*.castle.io\",\"d2t77mnxyo7adj.cloudfront.net\"],\"examples\":[\"t.castle.io\"]},{\"name\":\"Wigzo\",\"homepage\":\"https://www.wigzo.com/\",\"category\":\"marketing\",\"domains\":[\"*.wigzo.com\",\"*.wigzopush.com\"],\"examples\":[\"app.wigzo.com\",\"tracker.wigzopush.com\"],\"totalExecutionTime\":948978,\"totalOccurrences\":1608},{\"name\":\"Convertful\",\"homepage\":\"https://convertful.com/\",\"category\":\"marketing\",\"domains\":[\"*.convertful.com\"],\"examples\":[\"app.convertful.com\"],\"totalExecutionTime\":128311,\"totalOccurrences\":1289},{\"name\":\"OpenLink\",\"company\":\"MediaWallah\",\"homepage\":\"https://www.mediawallah.com/\",\"category\":\"ad\",\"domains\":[\"*.mediawallahscript.com\"],\"examples\":[\"partner.mediawallahscript.com\"],\"totalExecutionTime\":96,\"totalOccurrences\":1},{\"name\":\"TPMN\",\"company\":\"TPMN\",\"homepage\":\"http://tpmn.io/\",\"category\":\"ad\",\"domains\":[\"*.tpmn.co.kr\"],\"examples\":[\"ad.tpmn.co.kr\"],\"totalExecutionTime\":404,\"totalOccurrences\":11},{\"name\":\"HERO\",\"company\":\"Klarna\",\"homepage\":\"https://www.usehero.com/\",\"category\":\"customer-success\",\"domains\":[\"*.usehero.com\"],\"examples\":[\"api.usehero.com\",\"cdn.usehero.com\"],\"totalExecutionTime\":29230,\"totalOccurrences\":39},{\"name\":\"Zync\",\"company\":\"Zeta Global\",\"homepage\":\"https://zetaglobal.com/\",\"category\":\"marketing\",\"domains\":[\"*.rezync.com\"],\"examples\":[\"live.rezync.com\"],\"totalExecutionTime\":28205,\"totalOccurrences\":270},{\"name\":\"AdFuel Video\",\"company\":\"AdFuel\",\"homepage\":\"https://goadfuel.com/\",\"category\":\"ad\",\"domains\":[\"*.videoplayerhub.com\"],\"examples\":[\"customer.videoplayerhub.com\"],\"totalExecutionTime\":81215,\"totalOccurrences\":984},{\"name\":\"Prefix Box AI Search\",\"company\":\"Prefix Box\",\"homepage\":\"https://www.prefixbox.com/\",\"category\":\"utility\",\"domains\":[\"*.prefixbox.com\"],\"examples\":[\"cdn.prefixbox.com\"],\"totalExecutionTime\":67264,\"totalOccurrences\":81},{\"name\":\"SpeedSize Service Worker\",\"company\":\"SpeedSize\",\"homepage\":\"https://speedsize.com/\",\"category\":\"utility\",\"domains\":[\"di6367dava8ow.cloudfront.net\",\"d2d22nphq0yz8t.cloudfront.net\"],\"examples\":[\"di6367dava8ow.cloudfront.net\"]},{\"name\":\"Vonage Video API\",\"company\":\"Vonage\",\"homepage\":\"https://www.vonage.com/communications-apis/video/\",\"category\":\"video\",\"domains\":[\"*.opentok.com\"],\"examples\":[\"static.opentok.com\"],\"totalExecutionTime\":196565,\"totalOccurrences\":272},{\"name\":\"Checkout.com\",\"company\":\"Checkout.com\",\"homepage\":\"https://www.checkout.com\",\"category\":\"utility\",\"domains\":[\"*.checkout.com\"],\"examples\":[\"cdn.checkout.com\"],\"totalExecutionTime\":122370,\"totalOccurrences\":1413},{\"name\":\"Noibu\",\"company\":\"Noibu\",\"homepage\":\"https://www.noibu.com\",\"category\":\"utility\",\"domains\":[\"*.noibu.com\"],\"examples\":[\"input.noibu.com\"],\"totalExecutionTime\":914430,\"totalOccurrences\":594},{\"name\":\"Clarity\",\"company\":\"Microsoft\",\"homepage\":\"https://clarity.microsoft.com/\",\"category\":\"utility\",\"domains\":[\"*.clarity.ms\"],\"examples\":[\"c.clarity.ms\"],\"totalExecutionTime\":214511086,\"totalOccurrences\":517427},{\"name\":\"goinstore\",\"company\":\"Emplifi\",\"homepage\":\"https://goinstore.com/\",\"category\":\"customer-success\",\"domains\":[\"*.goinstore.com\"],\"examples\":[\"gis.goinstore.com\"]},{\"name\":\"SegmentStream\",\"company\":\"SegmentStream\",\"homepage\":\"https://segmentstream.com/\",\"category\":\"marketing\",\"domains\":[\"*.segmentstream.com\"],\"examples\":[\"track.segmentstream.com\"],\"totalExecutionTime\":7604,\"totalOccurrences\":46},{\"name\":\"Amazon Associates\",\"company\":\"Amazon\",\"homepage\":\"https://affiliate-program.amazon.co.uk/\",\"category\":\"marketing\",\"domains\":[\"*.associates-amazon.com\"],\"examples\":[\"assoc-na.associates-amazon.com\"]},{\"name\":\"DotMetrics\",\"company\":\"Ipsos\",\"homepage\":\"https://www.dotmetrics.net/\",\"category\":\"analytics\",\"domains\":[\"*.dotmetrics.net\"],\"examples\":[\"uk-script.dotmetrics.net\"],\"totalExecutionTime\":119707,\"totalOccurrences\":905},{\"name\":\"Truffle Bid\",\"company\":\"Truffle\",\"homepage\":\"https://truffle.bid/\",\"category\":\"ad\",\"domains\":[\"*.truffle.bid\"],\"examples\":[\"matching.truffle.bid\"]},{\"name\":\"Hybrid\",\"company\":\"Hybrid\",\"homepage\":\"https://hybrid.ai/\",\"category\":\"ad\",\"domains\":[\"*.hybrid.ai\"],\"examples\":[\"dm-eu.hybrid.ai\"],\"totalExecutionTime\":234694,\"totalOccurrences\":2624},{\"name\":\"AdMan Media\",\"company\":\"AdMan\",\"homepage\":\"https://admanmedia.com/\",\"category\":\"video\",\"domains\":[\"*.admanmedia.com\"],\"examples\":[\"cs.admanmedia.com\"],\"totalExecutionTime\":123,\"totalOccurrences\":36},{\"name\":\"ID5 Identity Cloud\",\"company\":\"ID5\",\"homepage\":\"https://id5.io/\",\"category\":\"ad\",\"domains\":[\"id5-sync.com\",\"*.id5-sync.com\"],\"examples\":[\"id5-sync.com\"],\"totalExecutionTime\":63370496,\"totalOccurrences\":169672},{\"name\":\"Audience Rate\",\"company\":\"Audience Rate Limited\",\"homepage\":\"https://www.audiencerate.com/\",\"category\":\"ad\",\"domains\":[\"*.audrte.com\"],\"examples\":[\"a.audrte.com\"]},{\"name\":\"Seedtag\",\"company\":\"Seedtag Advertising\",\"homepage\":\"https://www.seedtag.com/\",\"category\":\"ad\",\"domains\":[\"*.seedtag.com\"],\"examples\":[\"s.seedtag.com\"],\"totalExecutionTime\":4320550,\"totalOccurrences\":1650},{\"name\":\"IVI\",\"company\":\"IVI Technologies\",\"homepage\":\"http://ivitechnologies.com/\",\"category\":\"ad\",\"domains\":[\"*.ivitrack.com\"],\"examples\":[\"matching.ivitrack.com\"],\"totalExecutionTime\":4029,\"totalOccurrences\":35},{\"name\":\"Sportradar\",\"company\":\"Sportradar\",\"homepage\":\"https://www.sportradar.com/\",\"category\":\"ad\",\"domains\":[\"*.sportradarserving.com\"],\"examples\":[\"a.sportradarserving.com\"],\"totalExecutionTime\":250,\"totalOccurrences\":5},{\"name\":\"ZEOTAP\",\"company\":\"ZEOTAP\",\"homepage\":\"https://zeotap.com/\",\"category\":\"ad\",\"domains\":[\"*.zeotap.com\"],\"examples\":[\"spl.zeotap.com\"],\"totalExecutionTime\":5627,\"totalOccurrences\":42},{\"name\":\"Web Content Assessor\",\"company\":\"TMT Digital\",\"homepage\":\"https://mediatrust.com/\",\"category\":\"ad\",\"domains\":[\"*.webcontentassessor.com\"],\"examples\":[\"scripts.webcontentassessor.com\"],\"totalExecutionTime\":1796155,\"totalOccurrences\":948},{\"name\":\"Genie\",\"company\":\"Media Force\",\"homepage\":\"https://hellogenie.com/\",\"category\":\"ad\",\"domains\":[\"*.mfadsrvr.com\"],\"examples\":[\"rtb.mfadsrvr.com\"],\"totalExecutionTime\":0,\"totalOccurrences\":4},{\"name\":\"mediarithmics\",\"company\":\"mediarithmics\",\"homepage\":\"https://www.mediarithmics.com/\",\"category\":\"ad\",\"domains\":[\"*.mediarithmics.com\"],\"examples\":[\"cookie-matching.mediarithmics.com\"],\"totalExecutionTime\":33434,\"totalOccurrences\":232},{\"name\":\"Ozone Project\",\"company\":\"The Ozone Project\",\"homepage\":\"https://www.ozoneproject.com/\",\"category\":\"ad\",\"domains\":[\"*.the-ozone-project.com\"],\"examples\":[\"elb.the-ozone-project.com\"],\"totalExecutionTime\":1330879,\"totalOccurrences\":15372},{\"name\":\"FiftyAurora\",\"company\":\"Fifty\",\"homepage\":\"https://fifty.io/\",\"category\":\"ad\",\"domains\":[\"*.fiftyt.com\"],\"examples\":[\"visitor.fiftyt.com\"]},{\"name\":\"smadex\",\"company\":\"entravision\",\"homepage\":\"https://smadex.com/\",\"category\":\"ad\",\"domains\":[\"*.smadex.com\"],\"examples\":[\"cm.smadex.com\"],\"totalExecutionTime\":4232,\"totalOccurrences\":11},{\"name\":\"AWX\",\"company\":\"Trinity Mirror\",\"category\":\"ad\",\"domains\":[\"*.tm-awx.com\"],\"examples\":[\"felix.data.tm-awx.com\"],\"totalExecutionTime\":62038,\"totalOccurrences\":59},{\"name\":\"XPO\",\"company\":\"Knorex\",\"category\":\"ad\",\"homepage\":\"https://www.knorex.com/\",\"domains\":[\"*.brand-display.com\"],\"examples\":[\"dmp.brand-display.com\"],\"totalExecutionTime\":402134,\"totalOccurrences\":481},{\"name\":\"Viafoura\",\"company\":\"Viafoura\",\"category\":\"ad\",\"homepage\":\"https://viafoura.com/\",\"domains\":[\"*.viafoura.co\",\"*.viafoura.net\"],\"examples\":[\"api.viafoura.co\",\"cdn.viafoura.net\"],\"totalExecutionTime\":293705,\"totalOccurrences\":457},{\"name\":\"Adnami\",\"company\":\"Adnami\",\"category\":\"ad\",\"homepage\":\"https://www.adnami.io/\",\"domains\":[\"*.adnami.io\"],\"examples\":[\"macro.adnami.io\"],\"totalExecutionTime\":261382,\"totalOccurrences\":1711},{\"name\":\"LiveRamp Privacy Manager\",\"company\":\"LiveRamp\",\"category\":\"ad\",\"homepage\":\"https://liveramp.com/privacy-legal-compliance/\",\"domains\":[\"*.privacymanager.io\"],\"examples\":[\"geo.privacymanager.io\"],\"totalExecutionTime\":6760920,\"totalOccurrences\":25608},{\"name\":\"Onfocus\",\"company\":\"Onfocus SAS\",\"category\":\"ad\",\"domains\":[\"*.4dex.io\"],\"examples\":[\"script.4dex.io\"],\"totalExecutionTime\":28640954,\"totalOccurrences\":43586},{\"name\":\"viewTag\",\"company\":\"Advanced Store\",\"category\":\"ad\",\"domains\":[\"*.ad4m.at\"],\"examples\":[\"ad4m.at\",\"as.ad4m.at\"],\"totalExecutionTime\":149,\"totalOccurrences\":12},{\"name\":\"MRP Prelytics\",\"company\":\"Market Resource Partners\",\"category\":\"ad\",\"homepage\":\"https://www.mrpfd.com/\",\"domains\":[\"*.mrpdata.net\"],\"examples\":[\"j.mrpdata.net\"]},{\"name\":\"iPROM\",\"company\":\"iPROM\",\"category\":\"ad\",\"homepage\":\"https://iprom.eu/\",\"domains\":[\"*.iprom.net\"],\"examples\":[\"core.iprom.net\"],\"totalExecutionTime\":102229,\"totalOccurrences\":21803},{\"name\":\"Plausible\",\"company\":\"Plausible\",\"homepage\":\"https://plausible.io/\",\"category\":\"analytics\",\"domains\":[\"*.plausible.io\"]},{\"name\":\"Micro Analytics\",\"company\":\"Micro Analytics\",\"homepage\":\"https://microanalytics.io/\",\"category\":\"analytics\",\"domains\":[\"padmin.microanalytics.io\",\"www.microanalytics.io\",\"dev.microanalytics.io\",\"status.microanalytics.io\"]},{\"name\":\"Scale8\",\"company\":\"Scale8\",\"homepage\":\"https://scale8.com/\",\"category\":\"analytics\",\"domains\":[\"www.scale8.com\",\"api-dev.scale8.com\",\"cdn.scale8.com\",\"ui.scale8.com\"]},{\"name\":\"Cabin\",\"company\":\"Cabin\",\"homepage\":\"https://withcabin.com/\",\"category\":\"analytics\",\"domains\":[\"*.withcabin.com\"],\"totalExecutionTime\":5007,\"totalOccurrences\":67},{\"name\":\"Appcues\",\"company\":\"Appcues\",\"homepage\":\"https://www.appcues.com/\",\"category\":\"analytics\",\"domains\":[\"*.appcues.com\"],\"totalExecutionTime\":2122572,\"totalOccurrences\":2944},{\"name\":\"Fathom Analytics\",\"company\":\"Fathom\",\"homepage\":\"https://usefathom.com/\",\"category\":\"analytics\",\"domains\":[\"*.usefathom.com\"],\"totalExecutionTime\":162776,\"totalOccurrences\":1123},{\"name\":\"Clearbit\",\"company\":\"Clearbit\",\"homepage\":\"https://clearbit.com/\",\"category\":\"analytics\",\"domains\":[\"*.clearbitjs.com\",\"*.clearbitscripts.com\",\"*.clearbit.com\"],\"totalExecutionTime\":744911,\"totalOccurrences\":3384},{\"name\":\"G2\",\"company\":\"G2\",\"homepage\":\"https://www.g2.com/\",\"category\":\"utility\",\"domains\":[\"*.g2.com\",\"*.g2crowd.com\"],\"totalExecutionTime\":162991,\"totalOccurrences\":391},{\"name\":\"Navu\",\"company\":\"Navu\",\"homepage\":\"https://navu.co/\",\"category\":\"ad\",\"domains\":[\"*.navu.co\"],\"totalExecutionTime\":12660,\"totalOccurrences\":29},{\"name\":\"InZynk\",\"company\":\"InZynk\",\"homepage\":\"https://inzynk.com/\",\"category\":\"ad\",\"domains\":[\"*.inzynk.com\",\"*.inzynk.io\"],\"totalExecutionTime\":466,\"totalOccurrences\":9},{\"name\":\"Integrate\",\"company\":\"Integrate\",\"homepage\":\"https://www.integrate.com/\",\"category\":\"ad\",\"domains\":[\"*.integrate.com\",\"*.listenloop.com\"],\"totalExecutionTime\":5133,\"totalOccurrences\":17},{\"name\":\"Ad Lightning\",\"company\":\"Boltive\",\"homepage\":\"https://www.adlightning.com/\",\"category\":\"ad\",\"domains\":[\"*.adlightning.com\"],\"totalExecutionTime\":5493368,\"totalOccurrences\":3508},{\"name\":\"GeoEdge\",\"company\":\"GeoEdge\",\"homepage\":\"https://www.geoedge.com/\",\"category\":\"ad\",\"domains\":[\"*.geoedge.com\",\"*.geoedge.be\"],\"totalExecutionTime\":1175027,\"totalOccurrences\":1779},{\"name\":\"Doofinder\",\"company\":\"Doofinder\",\"homepage\":\"https://www.doofinder.com/\",\"category\":\"utility\",\"domains\":[\"cdn.doofinder.com\"],\"totalExecutionTime\":1670377,\"totalOccurrences\":13531},{\"name\":\"Revlifter\",\"company\":\"Revlifter\",\"homepage\":\"https://www.revlifter.com/\",\"category\":\"utility\",\"domains\":[\"assets.revlifter.com\"]},{\"name\":\"Didomi\",\"company\":\"Didomi\",\"homepage\":\"https://www.didomi.io/\",\"category\":\"consent-provider\",\"domains\":[\"sdk.privacy-center.org\",\"api.privacy-center.org\"],\"totalExecutionTime\":43759922,\"totalOccurrences\":90361},{\"name\":\"Pubperf Analytics\",\"company\":\"Pubperf\",\"homepage\":\"https://www.pubperf.com/\",\"category\":\"analytics\",\"domains\":[\"*.pubperf.com\"],\"totalExecutionTime\":29187,\"totalOccurrences\":380}]");
}));
(/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { createAPIFromDataset } = require_create_entity_finder_api();
	module.exports = createAPIFromDataset((init_entities(), __toCommonJS(entities_exports).default));
})))();
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/types/Configuration.js
var defaults = () => ({
	includeRuntimeCallStats: false,
	showAllEvents: false,
	debugMode: false,
	maxInvalidationEventsPerEvent: 20,
	enableAnimationsFrameHandler: false
});
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/types/File.js
var DataOrigin;
(function(DataOrigin) {
	DataOrigin["CPU_PROFILE"] = "CPUProfile";
	DataOrigin["TRACE_EVENTS"] = "TraceEvents";
})(DataOrigin || (DataOrigin = {}));
/**
* The Entries link can have 3 stated:
*  1. The Link creation is not started yet, meaning only the button that needs to be clicked to start creating the link is visible.
*  2. Pending to event - the creation is started, but the entry that the link points to has not been chosen yet
*  3. Link connected - final state, both entries present
*/
var EntriesLinkState;
(function(EntriesLinkState) {
	EntriesLinkState["CREATION_NOT_STARTED"] = "creation_not_started";
	EntriesLinkState["PENDING_TO_EVENT"] = "pending_to_event";
	EntriesLinkState["CONNECTED"] = "connected";
})(EntriesLinkState || (EntriesLinkState = {}));
var EventKeyType;
(function(EventKeyType) {
	EventKeyType["RAW_EVENT"] = "r";
	EventKeyType["SYNTHETIC_EVENT"] = "s";
	EventKeyType["PROFILE_CALL"] = "p";
	EventKeyType["LEGACY_TIMELINE_FRAME"] = "l";
})(EventKeyType || (EventKeyType = {}));
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/types/Timing.js
function Micro(value) {
	return value;
}
function Milli(value) {
	return value;
}
function Seconds(value) {
	return value;
}
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/types/TraceEvents.js
var Phase;
(function(Phase) {
	Phase["BEGIN"] = "B";
	Phase["END"] = "E";
	Phase["COMPLETE"] = "X";
	Phase["INSTANT"] = "I";
	Phase["COUNTER"] = "C";
	Phase["ASYNC_NESTABLE_START"] = "b";
	Phase["ASYNC_NESTABLE_INSTANT"] = "n";
	Phase["ASYNC_NESTABLE_END"] = "e";
	Phase["ASYNC_STEP_INTO"] = "T";
	Phase["ASYNC_BEGIN"] = "S";
	Phase["ASYNC_END"] = "F";
	Phase["ASYNC_STEP_PAST"] = "p";
	Phase["FLOW_START"] = "s";
	Phase["FLOW_STEP"] = "t";
	Phase["FLOW_END"] = "f";
	Phase["SAMPLE"] = "P";
	Phase["OBJECT_CREATED"] = "N";
	Phase["OBJECT_SNAPSHOT"] = "O";
	Phase["OBJECT_DESTROYED"] = "D";
	Phase["METADATA"] = "M";
	Phase["MEMORY_DUMP_GLOBAL"] = "V";
	Phase["MEMORY_DUMP_PROCESS"] = "v";
	Phase["MARK"] = "R";
	Phase["CLOCK_SYNC"] = "c";
})(Phase || (Phase = {}));
var Scope;
(function(Scope) {
	Scope["THREAD"] = "t";
	Scope["PROCESS"] = "p";
	Scope["GLOBAL"] = "g";
})(Scope || (Scope = {}));
var AuctionWorkletType;
(function(AuctionWorkletType) {
	AuctionWorkletType["BIDDER"] = "bidder";
	AuctionWorkletType["SELLER"] = "seller";
	AuctionWorkletType["UNKNOWN"] = "unknown";
})(AuctionWorkletType || (AuctionWorkletType = {}));
var LayoutInvalidationReason;
(function(LayoutInvalidationReason) {
	LayoutInvalidationReason["SIZE_CHANGED"] = "Size changed";
	LayoutInvalidationReason["ATTRIBUTE"] = "Attribute";
	LayoutInvalidationReason["ADDED_TO_LAYOUT"] = "Added to layout";
	LayoutInvalidationReason["SCROLLBAR_CHANGED"] = "Scrollbar changed";
	LayoutInvalidationReason["REMOVED_FROM_LAYOUT"] = "Removed from layout";
	LayoutInvalidationReason["STYLE_CHANGED"] = "Style changed";
	LayoutInvalidationReason["FONTS_CHANGED"] = "Fonts changed";
	LayoutInvalidationReason["UNKNOWN"] = "Unknown";
})(LayoutInvalidationReason || (LayoutInvalidationReason = {}));
var StyleRecalcInvalidationReason;
(function(StyleRecalcInvalidationReason) {
	StyleRecalcInvalidationReason["ANIMATION"] = "Animation";
	StyleRecalcInvalidationReason["RELATED_STYLE_RULE"] = "Related style rule";
})(StyleRecalcInvalidationReason || (StyleRecalcInvalidationReason = {}));
var InvalidationEventType;
(function(InvalidationEventType) {
	InvalidationEventType["StyleInvalidatorInvalidationTracking"] = "StyleInvalidatorInvalidationTracking";
	InvalidationEventType["StyleRecalcInvalidationTracking"] = "StyleRecalcInvalidationTracking";
})(InvalidationEventType || (InvalidationEventType = {}));
var SelectorTimingsKey;
(function(SelectorTimingsKey) {
	SelectorTimingsKey["Elapsed"] = "elapsed (us)";
	SelectorTimingsKey["RejectPercentage"] = "reject_percentage";
	SelectorTimingsKey["FastRejectCount"] = "fast_reject_count";
	SelectorTimingsKey["MatchAttempts"] = "match_attempts";
	SelectorTimingsKey["MatchCount"] = "match_count";
	SelectorTimingsKey["Selector"] = "selector";
	SelectorTimingsKey["StyleSheetId"] = "style_sheet_id";
	SelectorTimingsKey["InvalidationCount"] = "invalidation_count";
})(SelectorTimingsKey || (SelectorTimingsKey = {}));
function ProcessID(value) {
	return value;
}
function isSyntheticCpuProfile(event) {
	return event.name === Name.CPU_PROFILE;
}
function isProfileCall(event) {
	return "callFrame" in event;
}
/**
* Generally, before JS is executed, a trace event is dispatched that
* parents the JS calls. These we call "invocation" events. This
* function determines if an event is one of such. Note: these are also
* commonly referred to as "JS entry points".
*/
function isJSInvocationEvent(event) {
	switch (event.name) {
		case Name.RUN_MICROTASKS:
		case Name.FUNCTION_CALL:
		case Name.EVALUATE_SCRIPT:
		case Name.EVALUATE_MODULE:
		case Name.EVENT_DISPATCH:
		case Name.V8_EXECUTE:
		case Name.V8_CONSOLE_RUN_TASK: return true;
	}
	if (event.name.startsWith("v8") || event.name.startsWith("V8")) return true;
	if (isConsoleRunTask(event)) return true;
	return false;
}
function isConsoleRunTask(event) {
	return event.name === Name.V8_CONSOLE_RUN_TASK;
}
/**
* This is an exhaustive list of events we track in the Performance
* panel. Note not all of them are necessarliry shown in the flame
* chart, some of them we only use for parsing.
* TODO(crbug.com/1428024): Complete this enum.
*/
var Name;
(function(Name) {
	Name["THREAD_NAME"] = "thread_name";
	Name["PROGRAM"] = "Program";
	Name["RUN_TASK"] = "RunTask";
	Name["ASYNC_TASK"] = "AsyncTask";
	Name["RUN_MICROTASKS"] = "RunMicrotasks";
	Name["XHR_LOAD"] = "XHRLoad";
	Name["XHR_READY_STATE_CHANGED"] = "XHRReadyStateChange";
	Name["PARSE_HTML"] = "ParseHTML";
	Name["PARSE_CSS"] = "ParseAuthorStyleSheet";
	Name["COMPILE_CODE"] = "V8.CompileCode";
	Name["COMPILE_MODULE"] = "V8.CompileModule";
	Name["COMPILE"] = "v8.compile";
	Name["COMPILE_SCRIPT"] = "V8.CompileScript";
	Name["OPTIMIZE"] = "V8.OptimizeCode";
	Name["WASM_STREAM_FROM_RESPONSE_CALLBACK"] = "v8.wasm.streamFromResponseCallback";
	Name["WASM_COMPILED_MODULE"] = "v8.wasm.compiledModule";
	Name["WASM_CACHED_MODULE"] = "v8.wasm.cachedModule";
	Name["WASM_MODULE_CACHE_HIT"] = "v8.wasm.moduleCacheHit";
	Name["WASM_MODULE_CACHE_INVALID"] = "v8.wasm.moduleCacheInvalid";
	Name["PROFILE_CALL"] = "ProfileCall";
	Name["EVALUATE_SCRIPT"] = "EvaluateScript";
	Name["FUNCTION_CALL"] = "FunctionCall";
	Name["EVENT_DISPATCH"] = "EventDispatch";
	Name["EVALUATE_MODULE"] = "v8.evaluateModule";
	Name["REQUEST_MAIN_THREAD_FRAME"] = "RequestMainThreadFrame";
	Name["REQUEST_ANIMATION_FRAME"] = "RequestAnimationFrame";
	Name["CANCEL_ANIMATION_FRAME"] = "CancelAnimationFrame";
	Name["FIRE_ANIMATION_FRAME"] = "FireAnimationFrame";
	Name["REQUEST_IDLE_CALLBACK"] = "RequestIdleCallback";
	Name["CANCEL_IDLE_CALLBACK"] = "CancelIdleCallback";
	Name["FIRE_IDLE_CALLBACK"] = "FireIdleCallback";
	Name["TIMER_INSTALL"] = "TimerInstall";
	Name["TIMER_REMOVE"] = "TimerRemove";
	Name["TIMER_FIRE"] = "TimerFire";
	Name["WEB_SOCKET_CREATE"] = "WebSocketCreate";
	Name["WEB_SOCKET_SEND_HANDSHAKE"] = "WebSocketSendHandshakeRequest";
	Name["WEB_SOCKET_RECEIVE_HANDSHAKE"] = "WebSocketReceiveHandshakeResponse";
	Name["WEB_SOCKET_DESTROY"] = "WebSocketDestroy";
	Name["WEB_SOCKET_SEND"] = "WebSocketSend";
	Name["WEB_SOCKET_RECEIVE"] = "WebSocketReceive";
	Name["CRYPTO_DO_ENCRYPT"] = "DoEncrypt";
	Name["CRYPTO_DO_ENCRYPT_REPLY"] = "DoEncryptReply";
	Name["CRYPTO_DO_DECRYPT"] = "DoDecrypt";
	Name["CRYPTO_DO_DECRYPT_REPLY"] = "DoDecryptReply";
	Name["CRYPTO_DO_DIGEST"] = "DoDigest";
	Name["CRYPTO_DO_DIGEST_REPLY"] = "DoDigestReply";
	Name["CRYPTO_DO_SIGN"] = "DoSign";
	Name["CRYPTO_DO_SIGN_REPLY"] = "DoSignReply";
	Name["CRYPTO_DO_VERIFY"] = "DoVerify";
	Name["CRYPTO_DO_VERIFY_REPLY"] = "DoVerifyReply";
	Name["V8_EXECUTE"] = "V8.Execute";
	Name["V8_CONSOLE_RUN_TASK"] = "V8Console::runTask";
	Name["SCHEDULE_POST_TASK_CALLBACK"] = "SchedulePostTaskCallback";
	Name["RUN_POST_TASK_CALLBACK"] = "RunPostTaskCallback";
	Name["ABORT_POST_TASK_CALLBACK"] = "AbortPostTaskCallback";
	Name["DEBUGGER_ASYNC_TASK_RUN"] = "v8::Debugger::AsyncTaskRun";
	Name["DEBUGGER_ASYNC_TASK_SCHEDULED"] = "v8::Debugger::AsyncTaskScheduled";
	Name["GC"] = "GCEvent";
	Name["DOMGC"] = "BlinkGC.AtomicPhase";
	Name["MAJOR_GC"] = "MajorGC";
	Name["MINOR_GC"] = "MinorGC";
	Name["GC_COLLECT_GARBARGE"] = "BlinkGC.AtomicPhase";
	Name["CPPGC_SWEEP"] = "CppGC.IncrementalSweep";
	Name["SCHEDULE_STYLE_RECALCULATION"] = "ScheduleStyleRecalculation";
	Name["LAYOUT"] = "Layout";
	Name["UPDATE_LAYOUT_TREE"] = "UpdateLayoutTree";
	Name["INVALIDATE_LAYOUT"] = "InvalidateLayout";
	Name["LAYOUT_INVALIDATION_TRACKING"] = "LayoutInvalidationTracking";
	Name["COMPUTE_INTERSECTION"] = "ComputeIntersections";
	Name["HIT_TEST"] = "HitTest";
	Name["PRE_PAINT"] = "PrePaint";
	Name["LAYERIZE"] = "Layerize";
	Name["LAYOUT_SHIFT"] = "LayoutShift";
	Name["SYNTHETIC_LAYOUT_SHIFT"] = "SyntheticLayoutShift";
	Name["SYNTHETIC_LAYOUT_SHIFT_CLUSTER"] = "SyntheticLayoutShiftCluster";
	Name["UPDATE_LAYER_TREE"] = "UpdateLayerTree";
	Name["SCHEDULE_STYLE_INVALIDATION_TRACKING"] = "ScheduleStyleInvalidationTracking";
	Name["STYLE_RECALC_INVALIDATION_TRACKING"] = "StyleRecalcInvalidationTracking";
	Name["STYLE_INVALIDATOR_INVALIDATION_TRACKING"] = "StyleInvalidatorInvalidationTracking";
	Name["SELECTOR_STATS"] = "SelectorStats";
	Name["BEGIN_COMMIT_COMPOSITOR_FRAME"] = "BeginCommitCompositorFrame";
	Name["PARSE_META_VIEWPORT"] = "ParseMetaViewport";
	Name["SCROLL_LAYER"] = "ScrollLayer";
	Name["UPDATE_LAYER"] = "UpdateLayer";
	Name["PAINT_SETUP"] = "PaintSetup";
	Name["PAINT"] = "Paint";
	Name["PAINT_IMAGE"] = "PaintImage";
	Name["COMMIT"] = "Commit";
	Name["COMPOSITE_LAYERS"] = "CompositeLayers";
	Name["RASTER_TASK"] = "RasterTask";
	Name["IMAGE_DECODE_TASK"] = "ImageDecodeTask";
	Name["IMAGE_UPLOAD_TASK"] = "ImageUploadTask";
	Name["DECODE_IMAGE"] = "Decode Image";
	Name["DRAW_LAZY_PIXEL_REF"] = "Draw LazyPixelRef";
	Name["DECODE_LAZY_PIXEL_REF"] = "Decode LazyPixelRef";
	Name["GPU_TASK"] = "GPUTask";
	Name["RASTERIZE"] = "Rasterize";
	Name["EVENT_TIMING"] = "EventTiming";
	Name["OPTIMIZE_CODE"] = "V8.OptimizeCode";
	Name["CACHE_SCRIPT"] = "v8.produceCache";
	Name["CACHE_MODULE"] = "v8.produceModuleCache";
	Name["V8_SAMPLE"] = "V8Sample";
	Name["JIT_CODE_ADDED"] = "JitCodeAdded";
	Name["JIT_CODE_MOVED"] = "JitCodeMoved";
	Name["STREAMING_COMPILE_SCRIPT"] = "v8.parseOnBackground";
	Name["STREAMING_COMPILE_SCRIPT_WAITING"] = "v8.parseOnBackgroundWaiting";
	Name["STREAMING_COMPILE_SCRIPT_PARSING"] = "v8.parseOnBackgroundParsing";
	Name["BACKGROUND_DESERIALIZE"] = "v8.deserializeOnBackground";
	Name["FINALIZE_DESERIALIZATION"] = "V8.FinalizeDeserialization";
	Name["COMMIT_LOAD"] = "CommitLoad";
	Name["MARK_LOAD"] = "MarkLoad";
	Name["MARK_DOM_CONTENT"] = "MarkDOMContent";
	Name["MARK_FIRST_PAINT"] = "firstPaint";
	Name["MARK_FCP"] = "firstContentfulPaint";
	Name["MARK_LCP_CANDIDATE"] = "largestContentfulPaint::Candidate";
	Name["MARK_LCP_INVALIDATE"] = "largestContentfulPaint::Invalidate";
	Name["NAVIGATION_START"] = "navigationStart";
	Name["CONSOLE_TIME"] = "ConsoleTime";
	Name["USER_TIMING"] = "UserTiming";
	Name["INTERACTIVE_TIME"] = "InteractiveTime";
	Name["TIME_STAMP"] = "TimeStamp";
	Name["BEGIN_FRAME"] = "BeginFrame";
	Name["NEEDS_BEGIN_FRAME_CHANGED"] = "NeedsBeginFrameChanged";
	Name["BEGIN_MAIN_THREAD_FRAME"] = "BeginMainThreadFrame";
	Name["ACTIVATE_LAYER_TREE"] = "ActivateLayerTree";
	Name["DRAW_FRAME"] = "DrawFrame";
	Name["DROPPED_FRAME"] = "DroppedFrame";
	Name["FRAME_STARTED_LOADING"] = "FrameStartedLoading";
	Name["PIPELINE_REPORTER"] = "PipelineReporter";
	Name["SCREENSHOT"] = "Screenshot";
	Name["RESOURCE_WILL_SEND_REQUEST"] = "ResourceWillSendRequest";
	Name["RESOURCE_SEND_REQUEST"] = "ResourceSendRequest";
	Name["RESOURCE_RECEIVE_RESPONSE"] = "ResourceReceiveResponse";
	Name["RESOURCE_RECEIVE_DATA"] = "ResourceReceivedData";
	Name["RESOURCE_FINISH"] = "ResourceFinish";
	Name["RESOURCE_MARK_AS_CACHED"] = "ResourceMarkAsCached";
	Name["WEB_SOCKET_SEND_HANDSHAKE_REQUEST"] = "WebSocketSendHandshakeRequest";
	Name["WEB_SOCKET_RECEIVE_HANDSHAKE_REQUEST"] = "WebSocketReceiveHandshakeResponse";
	Name["CPU_PROFILE"] = "CpuProfile";
	Name["PROFILE"] = "Profile";
	Name["START_PROFILING"] = "CpuProfiler::StartProfiling";
	Name["PROFILE_CHUNK"] = "ProfileChunk";
	Name["UPDATE_COUNTERS"] = "UpdateCounters";
	Name["JS_SAMPLE"] = "JSSample";
	Name["ANIMATION"] = "Animation";
	Name["PARSE_AUTHOR_STYLE_SHEET"] = "ParseAuthorStyleSheet";
	Name["EMBEDDER_CALLBACK"] = "EmbedderCallback";
	Name["SET_LAYER_TREE_ID"] = "SetLayerTreeId";
	Name["TRACING_STARTED_IN_PAGE"] = "TracingStartedInPage";
	Name["TRACING_STARTED_IN_BROWSER"] = "TracingStartedInBrowser";
	Name["TRACING_SESSION_ID_FOR_WORKER"] = "TracingSessionIdForWorker";
	Name["LAZY_PIXEL_REF"] = "LazyPixelRef";
	Name["LAYER_TREE_HOST_IMPL_SNAPSHOT"] = "cc::LayerTreeHostImpl";
	Name["PICTURE_SNAPSHOT"] = "cc::Picture";
	Name["DISPLAY_ITEM_LIST_SNAPSHOT"] = "cc::DisplayItemList";
	Name["INPUT_LATENCY_MOUSE_MOVE"] = "InputLatency::MouseMove";
	Name["INPUT_LATENCY_MOUSE_WHEEL"] = "InputLatency::MouseWheel";
	Name["IMPL_SIDE_FLING"] = "InputHandlerProxy::HandleGestureFling::started";
	Name["SCHEDULE_POST_MESSAGE"] = "SchedulePostMessage";
	Name["HANDLE_POST_MESSAGE"] = "HandlePostMessage";
	Name["RENDER_FRAME_IMPL_CREATE_CHILD_FRAME"] = "RenderFrameImpl::createChildFrame";
	Name["LAYOUT_IMAGE_UNSIZED"] = "LayoutImageUnsized";
	Name["DOM_LOADING"] = "domLoading";
	Name["BEGIN_REMOTE_FONT_LOAD"] = "BeginRemoteFontLoad";
	Name["REMOTE_FONT_LOADED"] = "RemoteFontLoaded";
	Name["ANIMATION_FRAME"] = "AnimationFrame";
	Name["ANIMATION_FRAME_PRESENTATION"] = "AnimationFrame::Presentation";
	Name["SYNTHETIC_NETWORK_REQUEST"] = "SyntheticNetworkRequest";
	Name["USER_TIMING_MEASURE"] = "UserTiming::Measure";
	Name["LINK_PRECONNECT"] = "LinkPreconnect";
})(Name || (Name = {}));
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/helpers/Timing.js
var milliToMicro = (value) => Micro(value * 1e3);
var secondsToMilli = (value) => Milli(value * 1e3);
var secondsToMicro = (value) => milliToMicro(secondsToMilli(value));
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/helpers/Trace.js
function compareBeginAndEnd(aBeginTime, bBeginTime, aEndTime, bEndTime) {
	if (aBeginTime < bBeginTime) return -1;
	if (aBeginTime > bBeginTime) return 1;
	if (aEndTime > bEndTime) return -1;
	if (aEndTime < bEndTime) return 1;
	return 0;
}
function eventTimeComparator(a, b) {
	const aBeginTime = a.ts;
	const bBeginTime = b.ts;
	const aDuration = a.dur ?? 0;
	const bDuration = b.dur ?? 0;
	const timeDifference = compareBeginAndEnd(aBeginTime, bBeginTime, aBeginTime + aDuration, bBeginTime + bDuration);
	if (timeDifference) return timeDifference;
	if (isProfileCall(a) && !isProfileCall(b)) return -1;
	if (isProfileCall(b) && !isProfileCall(a)) return 1;
	return 0;
}
/**
* Sorts all the events in place, in order, by their start time. If they have
* the same start time, orders them by longest first.
*/
function sortTraceEventsInPlace(events) {
	events.sort(eventTimeComparator);
}
/**
* Returns an array of ordered events that results after merging the two
* ordered input arrays.
*/
function mergeEventsInOrder(eventsArray1, eventsArray2) {
	const result = [];
	let i = 0;
	let j = 0;
	while (i < eventsArray1.length && j < eventsArray2.length) {
		const event1 = eventsArray1[i];
		const event2 = eventsArray2[j];
		const compareValue = eventTimeComparator(event1, event2);
		if (compareValue <= 0) {
			result.push(event1);
			i++;
		}
		if (compareValue === 1) {
			result.push(event2);
			j++;
		}
	}
	while (i < eventsArray1.length) result.push(eventsArray1[i++]);
	while (j < eventsArray2.length) result.push(eventsArray2[j++]);
	return result;
}
/**
* @param node the node attached to the profile call. Here a node represents a function in the call tree.
* @param profileId the profile ID that the sample came from that backs this call.
* @param sampleIndex the index of the sample in the given profile that this call was created from
* @param ts the timestamp of the profile call
* @param pid the process ID of the profile call
* @param tid the thread ID of the profile call
*
* See `panels/timeline/docs/profile_calls.md` for more context on how these events are created.
*/
function makeProfileCall(node, profileId, sampleIndex, ts, pid, tid) {
	return {
		cat: "",
		name: "ProfileCall",
		nodeId: node.id,
		args: {},
		ph: Phase.COMPLETE,
		pid,
		tid,
		ts,
		dur: Micro(0),
		callFrame: node.callFrame,
		sampleIndex,
		profileId
	};
}
function extractSampleTraceId(event) {
	if (!event.args) return null;
	if ("beginData" in event.args) return event.args["beginData"].sampleTraceId ?? null;
	return event.args?.sampleTraceId ?? event.args?.data?.sampleTraceId ?? null;
}
Name.ABORT_POST_TASK_CALLBACK, Name.ANIMATION, Name.ASYNC_TASK, Name.BACKGROUND_DESERIALIZE, Name.CACHE_MODULE, Name.CACHE_SCRIPT, Name.CANCEL_ANIMATION_FRAME, Name.CANCEL_IDLE_CALLBACK, Name.COMMIT, Name.COMPILE_CODE, Name.COMPILE_MODULE, Name.COMPILE, Name.COMPOSITE_LAYERS, Name.COMPUTE_INTERSECTION, Name.CONSOLE_TIME, Name.CPPGC_SWEEP, Name.CRYPTO_DO_DECRYPT_REPLY, Name.CRYPTO_DO_DECRYPT, Name.CRYPTO_DO_DIGEST_REPLY, Name.CRYPTO_DO_DIGEST, Name.CRYPTO_DO_ENCRYPT_REPLY, Name.CRYPTO_DO_ENCRYPT, Name.CRYPTO_DO_SIGN_REPLY, Name.CRYPTO_DO_SIGN, Name.CRYPTO_DO_VERIFY_REPLY, Name.CRYPTO_DO_VERIFY, Name.DECODE_IMAGE, Name.EMBEDDER_CALLBACK, Name.EVALUATE_MODULE, Name.EVALUATE_SCRIPT, Name.EVENT_DISPATCH, Name.EVENT_TIMING, Name.FINALIZE_DESERIALIZATION, Name.FIRE_ANIMATION_FRAME, Name.FIRE_IDLE_CALLBACK, Name.FUNCTION_CALL, Name.GC_COLLECT_GARBARGE, Name.GC, Name.GPU_TASK, Name.HANDLE_POST_MESSAGE, Name.HIT_TEST, Name.JS_SAMPLE, Name.LAYERIZE, Name.LAYOUT, Name.MAJOR_GC, Name.MINOR_GC, Name.OPTIMIZE_CODE, Name.PAINT_SETUP, Name.PAINT, Name.PARSE_AUTHOR_STYLE_SHEET, Name.PARSE_HTML, Name.PRE_PAINT, Name.PROFILE_CALL, Name.PROGRAM, Name.RASTER_TASK, Name.REQUEST_ANIMATION_FRAME, Name.REQUEST_IDLE_CALLBACK, Name.RESOURCE_FINISH, Name.RESOURCE_RECEIVE_DATA, Name.RESOURCE_RECEIVE_RESPONSE, Name.RESOURCE_SEND_REQUEST, Name.RESOURCE_WILL_SEND_REQUEST, Name.RUN_MICROTASKS, Name.RUN_POST_TASK_CALLBACK, Name.RUN_TASK, Name.SCHEDULE_POST_MESSAGE, Name.SCHEDULE_POST_TASK_CALLBACK, Name.SCHEDULE_STYLE_RECALCULATION, Name.SCROLL_LAYER, Name.START_PROFILING, Name.STREAMING_COMPILE_SCRIPT_PARSING, Name.STREAMING_COMPILE_SCRIPT_WAITING, Name.STREAMING_COMPILE_SCRIPT, Name.SYNTHETIC_LAYOUT_SHIFT_CLUSTER, Name.SYNTHETIC_LAYOUT_SHIFT, Name.TIME_STAMP, Name.TIMER_FIRE, Name.TIMER_INSTALL, Name.TIMER_REMOVE, Name.UPDATE_LAYER_TREE, Name.UPDATE_LAYOUT_TREE, Name.USER_TIMING, Name.V8_CONSOLE_RUN_TASK, Name.WASM_CACHED_MODULE, Name.WASM_COMPILED_MODULE, Name.WASM_MODULE_CACHE_HIT, Name.WASM_MODULE_CACHE_INVALID, Name.WASM_STREAM_FROM_RESPONSE_CALLBACK, Name.WEB_SOCKET_CREATE, Name.WEB_SOCKET_DESTROY, Name.WEB_SOCKET_RECEIVE_HANDSHAKE_REQUEST, Name.WEB_SOCKET_RECEIVE, Name.WEB_SOCKET_SEND_HANDSHAKE_REQUEST, Name.WEB_SOCKET_SEND, Name.XHR_LOAD, Name.XHR_READY_STATE_CHANGED;
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/helpers/SamplesIntegrator.js
/**
* This is a helper that integrates CPU profiling data coming in the
* shape of samples, with trace events. Samples indicate what the JS
* stack trace looked at a given point in time, but they don't have
* duration. The SamplesIntegrator task is to make an approximation
* of what the duration of each JS call was, given the sample data and
* given the trace events profiled during that time. At the end of its
* execution, the SamplesIntegrator returns an array of ProfileCalls
* (under SamplesIntegrator::buildProfileCalls()), which
* represent JS calls, with a call frame and duration. These calls have
* the shape of a complete trace events and can be treated as flame
* chart entries in the timeline.
*
* The approach to build the profile calls consists in tracking the
* current stack as the following events happen (in order):
* 1. A sample was done.
* 2. A trace event started.
* 3. A trace event ended.
* Depending on the event and on the data that's coming with it the
* stack is updated by adding or removing JS calls to it and updating
* the duration of the calls in the tracking stack.
*
* note: Although this approach has been implemented since long ago, and
* is relatively efficient (adds a complexity over the trace parsing of
* O(n) where n is the number of samples) it has proven to be faulty.
* It might be worthwhile experimenting with improvements or with a
* completely different approach. Improving the approach is tracked in
* crbug.com/1417439
*/
var SamplesIntegrator = class SamplesIntegrator {
	/**
	* The result of running the samples integrator. Holds the JS calls
	* with their approximated duration after integrating samples into the
	* trace event tree.
	*/
	#constructedProfileCalls = [];
	/**
	* tracks the state of the JS stack at each point in time to update
	* the profile call durations as new events arrive. This doesn't only
	* happen with new profile calls (in which case we would compare the
	* stack in them) but also with trace events (in which case we would
	* update the duration of the events we are tracking at the moment).
	*/
	#currentJSStack = [];
	/**
	* Process holding the CPU profile and trace events.
	*/
	#processId;
	/**
	* Thread holding the CPU profile and trace events.
	*/
	#threadId;
	/**
	* Tracks the depth of the JS stack at the moment a trace event starts
	* or ends. It is assumed that for the duration of a trace event, the
	* JS stack's depth cannot decrease, since JS calls that started
	* before a trace event cannot end during the trace event. So as trace
	* events arrive, we store the "locked" amount of JS frames that were
	* in the stack before the event came.
	*/
	#lockedJsStackDepth = [];
	/**
	* Used to keep track when samples should be integrated even if they
	* are not children of invocation trace events. This is useful in
	* cases where we can be missing the start of JS invocation events if
	* we start tracing half-way through.
	*/
	#fakeJSInvocation = false;
	/**
	* The parsed CPU profile, holding the tree hierarchy of JS frames and
	* the sample data.
	*/
	#profileModel;
	/**
	* Because GC nodes don't have a stack, we artificially add a stack to
	* them which corresponds to that of the previous sample. This map
	* tracks which node is used for the stack of a GC call.
	* Note that GC samples are not shown in the flamechart, however they
	* are used during the construction of for profile calls, as we can
	* infer information about the duration of the executed code when a
	* GC node is sampled.
	*/
	#nodeForGC = /* @__PURE__ */ new Map();
	#engineConfig;
	#profileId;
	/**
	* Keeps track of the individual samples from the CPU Profile.
	* Only used with Debug Mode experiment enabled.
	*/
	jsSampleEvents = [];
	constructor(profileModel, profileId, pid, tid, configuration) {
		this.#profileModel = profileModel;
		this.#threadId = tid;
		this.#processId = pid;
		this.#engineConfig = configuration || defaults();
		this.#profileId = profileId;
	}
	buildProfileCalls(traceEvents) {
		const mergedEvents = mergeEventsInOrder(traceEvents, this.callsFromProfileSamples());
		const stack = [];
		for (let i = 0; i < mergedEvents.length; i++) {
			const event = mergedEvents[i];
			if (event.ph === Phase.INSTANT && !extractSampleTraceId(event)) continue;
			if (stack.length === 0) {
				if (isProfileCall(event)) {
					this.#onProfileCall(event);
					continue;
				}
				stack.push(event);
				this.#onTraceEventStart(event);
				continue;
			}
			const parentEvent = stack.at(-1);
			if (parentEvent === void 0) continue;
			if (event.ts >= parentEvent.ts + (parentEvent.dur || 0)) {
				this.#onTraceEventEnd(parentEvent);
				stack.pop();
				i--;
				continue;
			}
			if (isProfileCall(event)) {
				this.#onProfileCall(event, parentEvent);
				continue;
			}
			this.#onTraceEventStart(event);
			stack.push(event);
		}
		while (stack.length) {
			const last = stack.pop();
			if (last) this.#onTraceEventEnd(last);
		}
		sortTraceEventsInPlace(this.jsSampleEvents);
		return this.#constructedProfileCalls;
	}
	#onTraceEventStart(event) {
		if (event.name === Name.RUN_MICROTASKS || event.name === Name.RUN_TASK) {
			this.#lockedJsStackDepth = [];
			this.#truncateJSStack(0, event.ts);
			this.#fakeJSInvocation = false;
		}
		if (this.#fakeJSInvocation) {
			this.#truncateJSStack(this.#lockedJsStackDepth.pop() || 0, event.ts);
			this.#fakeJSInvocation = false;
		}
		this.#extractStackTrace(event);
		this.#lockedJsStackDepth.push(this.#currentJSStack.length);
	}
	#onProfileCall(event, parent) {
		if (parent && isJSInvocationEvent(parent) || this.#fakeJSInvocation) this.#extractStackTrace(event);
		else if (isProfileCall(event) && this.#currentJSStack.length === 0) {
			this.#fakeJSInvocation = true;
			const stackDepthBefore = this.#currentJSStack.length;
			this.#extractStackTrace(event);
			this.#lockedJsStackDepth.push(stackDepthBefore);
		}
	}
	#onTraceEventEnd(event) {
		const endTime = Micro(event.ts + (event.dur ?? 0));
		this.#truncateJSStack(this.#lockedJsStackDepth.pop() || 0, endTime);
	}
	/**
	* Builds the initial calls with no duration from samples. Their
	* purpose is to be merged with the trace event array being parsed so
	* that they can be traversed in order with them and their duration
	* can be updated as the SampleIntegrator callbacks are invoked.
	*/
	callsFromProfileSamples() {
		const samples = this.#profileModel.samples;
		const timestamps = this.#profileModel.timestamps;
		if (!samples) return [];
		const calls = [];
		let prevNode;
		for (let i = 0; i < samples.length; i++) {
			const node = this.#profileModel.nodeByIndex(i);
			const timestamp = milliToMicro(Milli(timestamps[i]));
			if (!node) continue;
			const call = makeProfileCall(node, this.#profileId, i, timestamp, this.#processId, this.#threadId);
			calls.push(call);
			if (this.#engineConfig.debugMode) {
				const traceId = this.#profileModel.traceIds?.[i];
				this.jsSampleEvents.push(this.#makeJSSampleEvent(call, timestamp, traceId));
			}
			if (node.id === this.#profileModel.gcNode?.id && prevNode) {
				this.#nodeForGC.set(call, prevNode);
				continue;
			}
			prevNode = node;
		}
		return calls;
	}
	/**
	* Given a synthetic profile call, returns an array of profile calls
	* representing the stack trace that profile call belongs to based on
	* its nodeId. The input profile call will be at the top of the
	* returned stack (last position), meaning that any other frames that
	* were effectively above it are omitted.
	* @param profileCall
	* @param overrideTimeStamp a custom timestamp to use for the returned
	* profile calls. If not defined, the timestamp of the input
	* profileCall is used instead. This param is useful for example when
	* creating the profile calls for a sample with a trace id, since the
	* timestamp of the corresponding trace event should be used instead
	* of the sample's.
	*/
	#makeProfileCallsForStack(profileCall, overrideTimeStamp) {
		let node = this.#profileModel.nodeById(profileCall.nodeId);
		const isGarbageCollection = node?.id === this.#profileModel.gcNode?.id;
		if (isGarbageCollection) node = this.#nodeForGC.get(profileCall) || null;
		if (!node) return [];
		const callFrames = new Array(node.depth + 1 + Number(isGarbageCollection));
		let i = callFrames.length - 1;
		if (isGarbageCollection) callFrames[i--] = profileCall;
		while (node) {
			callFrames[i--] = makeProfileCall(node, profileCall.profileId, profileCall.sampleIndex, overrideTimeStamp ?? profileCall.ts, this.#processId, this.#threadId);
			node = node.parent;
		}
		return callFrames;
	}
	#getStackForSampleTraceId(traceId, timestamp) {
		const nodeId = this.#profileModel.traceIds?.[traceId];
		const node = nodeId && this.#profileModel.nodeById(nodeId);
		const maybeCallForTraceId = node && makeProfileCall(node, this.#profileId, -1, timestamp, this.#processId, this.#threadId);
		if (!maybeCallForTraceId) return null;
		if (this.#engineConfig.debugMode) this.jsSampleEvents.push(this.#makeJSSampleEvent(maybeCallForTraceId, timestamp, traceId));
		return this.#makeProfileCallsForStack(maybeCallForTraceId);
	}
	/**
	* Update tracked stack using this event's call stack.
	*/
	#extractStackTrace(event) {
		let stackTrace = this.#currentJSStack;
		if (isProfileCall(event)) stackTrace = this.#makeProfileCallsForStack(event);
		const traceId = extractSampleTraceId(event);
		const maybeCallForTraceId = traceId && this.#getStackForSampleTraceId(traceId, event.ts);
		if (maybeCallForTraceId) stackTrace = maybeCallForTraceId;
		SamplesIntegrator.filterStackFrames(stackTrace, this.#engineConfig);
		const endTime = event.ts + (event.dur || 0);
		const minFrames = Math.min(stackTrace.length, this.#currentJSStack.length);
		let i;
		for (i = this.#lockedJsStackDepth.at(-1) || 0; i < minFrames; ++i) {
			const newFrame = stackTrace[i].callFrame;
			const oldFrame = this.#currentJSStack[i].callFrame;
			if (!SamplesIntegrator.framesAreEqual(newFrame, oldFrame)) break;
			this.#currentJSStack[i].dur = Micro(Math.max(this.#currentJSStack[i].dur || 0, endTime - this.#currentJSStack[i].ts));
		}
		this.#truncateJSStack(i, event.ts);
		for (; i < stackTrace.length; ++i) {
			const call = stackTrace[i];
			if (call.nodeId === this.#profileModel.programNode?.id || call.nodeId === this.#profileModel.root?.id || call.nodeId === this.#profileModel.idleNode?.id || call.nodeId === this.#profileModel.gcNode?.id) continue;
			this.#currentJSStack.push(call);
			this.#constructedProfileCalls.push(call);
		}
	}
	/**
	* When a call stack that differs from the one we are tracking has
	* been detected in the samples, the latter is "truncated" by
	* setting the ending time of its call frames and removing the top
	* call frames that aren't shared with the new call stack. This way,
	* we can update the tracked stack with the new call frames on top.
	* @param depth the amount of call frames from bottom to top that
	* should be kept in the tracking stack trace. AKA amount of shared
	* call frames between two stacks.
	* @param time the new end of the call frames in the stack.
	*/
	#truncateJSStack(depth, time) {
		if (this.#lockedJsStackDepth.length) {
			const lockedDepth = this.#lockedJsStackDepth.at(-1);
			if (lockedDepth && depth < lockedDepth) {
				console.error(`Child stack is shallower (${depth}) than the parent stack (${lockedDepth}) at ${time}`);
				depth = lockedDepth;
			}
		}
		if (this.#currentJSStack.length < depth) {
			console.error(`Trying to truncate higher than the current stack size at ${time}`);
			depth = this.#currentJSStack.length;
		}
		for (let k = 0; k < this.#currentJSStack.length; ++k) this.#currentJSStack[k].dur = Micro(Math.max(time - this.#currentJSStack[k].ts, 0));
		this.#currentJSStack.length = depth;
	}
	#makeJSSampleEvent(call, timestamp, traceId) {
		return {
			name: Name.JS_SAMPLE,
			cat: "devtools.timeline",
			args: { data: {
				traceId,
				stackTrace: this.#makeProfileCallsForStack(call).map((e) => e.callFrame)
			} },
			ph: Phase.INSTANT,
			ts: timestamp,
			dur: Micro(0),
			pid: this.#processId,
			tid: this.#threadId
		};
	}
	static framesAreEqual(frame1, frame2) {
		return frame1.scriptId === frame2.scriptId && frame1.functionName === frame2.functionName && frame1.lineNumber === frame2.lineNumber;
	}
	static showNativeName(name, runtimeCallStatsEnabled) {
		return runtimeCallStatsEnabled && Boolean(SamplesIntegrator.nativeGroup(name));
	}
	static nativeGroup(nativeName) {
		if (nativeName.startsWith("Parse")) return SamplesIntegrator.NativeGroups.PARSE;
		if (nativeName.startsWith("Compile") || nativeName.startsWith("Recompile")) return SamplesIntegrator.NativeGroups.COMPILE;
		return null;
	}
	static isNativeRuntimeFrame(frame) {
		return frame.url === "native V8Runtime";
	}
	static filterStackFrames(stack, engineConfig) {
		if (engineConfig.showAllEvents) return;
		let previousNativeFrameName = null;
		let j = 0;
		for (let i = 0; i < stack.length; ++i) {
			const frame = stack[i].callFrame;
			const nativeRuntimeFrame = SamplesIntegrator.isNativeRuntimeFrame(frame);
			if (nativeRuntimeFrame && !SamplesIntegrator.showNativeName(frame.functionName, engineConfig.includeRuntimeCallStats)) continue;
			const nativeFrameName = nativeRuntimeFrame ? SamplesIntegrator.nativeGroup(frame.functionName) : null;
			if (previousNativeFrameName && previousNativeFrameName === nativeFrameName) continue;
			previousNativeFrameName = nativeFrameName;
			stack[j++] = stack[i];
		}
		stack.length = j;
	}
	static createFakeTraceFromCpuProfile(profile, tid) {
		if (!profile) return {
			traceEvents: [],
			metadata: {}
		};
		return {
			traceEvents: [{
				cat: "disabled-by-default-devtools.timeline",
				name: Name.CPU_PROFILE,
				ph: Phase.COMPLETE,
				pid: ProcessID(1),
				tid,
				ts: Micro(profile.startTime),
				dur: Micro(profile.endTime - profile.startTime),
				args: { data: { cpuProfile: profile } },
				id: "0x1"
			}],
			metadata: { dataOrigin: DataOrigin.CPU_PROFILE }
		};
	}
	static extractCpuProfileFromFakeTrace(traceEvents) {
		const profile = traceEvents.find((e) => isSyntheticCpuProfile(e))?.args.data.cpuProfile;
		if (!profile) throw new Error("Missing cpuProfile data");
		return profile;
	}
};
(function(SamplesIntegrator) {
	(function(NativeGroups) {
		NativeGroups["COMPILE"] = "Compile";
		NativeGroups["PARSE"] = "Parse";
	})(SamplesIntegrator.NativeGroups || (SamplesIntegrator.NativeGroups = {}));
})(SamplesIntegrator || (SamplesIntegrator = {}));
Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY;
Phase.BEGIN, Phase.END, Phase.COMPLETE, Phase.INSTANT;
Name.TRACING_STARTED_IN_PAGE, Name.TRACING_SESSION_ID_FOR_WORKER, Name.TRACING_STARTED_IN_BROWSER, Name.CPU_PROFILE;
Array();
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/handlers/UserTimingsHandler.js
var resourceTimingNames = [
	"workerStart",
	"redirectStart",
	"redirectEnd",
	"fetchStart",
	"domainLookupStart",
	"domainLookupEnd",
	"connectStart",
	"connectEnd",
	"secureConnectionStart",
	"requestStart",
	"responseStart",
	"responseEnd"
];
var navTimingNames = [
	"navigationStart",
	"unloadEventStart",
	"unloadEventEnd",
	"redirectStart",
	"redirectEnd",
	"fetchStart",
	"commitNavigationEnd",
	"domainLookupStart",
	"domainLookupEnd",
	"connectStart",
	"connectEnd",
	"secureConnectionStart",
	"requestStart",
	"responseStart",
	"responseEnd",
	"domLoading",
	"domInteractive",
	"domContentLoadedEventStart",
	"domContentLoadedEventEnd",
	"domComplete",
	"loadEventStart",
	"loadEventEnd"
];
[...resourceTimingNames, ...navTimingNames];
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/handlers/Threads.js
var ThreadType;
(function(ThreadType) {
	ThreadType["MAIN_THREAD"] = "MAIN_THREAD";
	ThreadType["WORKER"] = "WORKER";
	ThreadType["RASTERIZER"] = "RASTERIZER";
	ThreadType["AUCTION_WORKLET"] = "AUCTION_WORKLET";
	ThreadType["OTHER"] = "OTHER";
	ThreadType["CPU_PROFILE"] = "CPU_PROFILE";
	ThreadType["THREAD_POOL"] = "THREAD_POOL";
})(ThreadType || (ThreadType = {}));
Name.SCHEDULE_STYLE_RECALCULATION, Name.INVALIDATE_LAYOUT, Name.BEGIN_MAIN_THREAD_FRAME, Name.SCROLL_LAYER;
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/handlers/PageLoadMetricsHandler.js
var ScoreClassification;
(function(ScoreClassification) {
	ScoreClassification["GOOD"] = "good";
	ScoreClassification["OK"] = "ok";
	ScoreClassification["BAD"] = "bad";
	ScoreClassification["UNCLASSIFIED"] = "unclassified";
})(ScoreClassification || (ScoreClassification = {}));
var MetricName;
(function(MetricName) {
	MetricName["FCP"] = "FCP";
	MetricName["FP"] = "FP";
	MetricName["L"] = "L";
	MetricName["LCP"] = "LCP";
	MetricName["DCL"] = "DCL";
	MetricName["TTI"] = "TTI";
	MetricName["TBT"] = "TBT";
	MetricName["CLS"] = "CLS";
	MetricName["NAV"] = "Nav";
})(MetricName || (MetricName = {}));
milliToMicro(Milli(5e3));
milliToMicro(Milli(1e3));
var LayoutShiftsThreshold;
(function(LayoutShiftsThreshold) {
	LayoutShiftsThreshold[LayoutShiftsThreshold["GOOD"] = 0] = "GOOD";
	LayoutShiftsThreshold[LayoutShiftsThreshold["NEEDS_IMPROVEMENT"] = .1] = "NEEDS_IMPROVEMENT";
	LayoutShiftsThreshold[LayoutShiftsThreshold["BAD"] = .25] = "BAD";
})(LayoutShiftsThreshold || (LayoutShiftsThreshold = {}));
new Array();
milliToMicro(Milli(200));
milliToMicro(Milli(500));
milliToMicro(Milli(30));
milliToMicro(Milli(50));
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/extras/extras.js
(() => {
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __commonJS = (cb, mod) => function __require() {
		return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
	};
	var require_isArguments = __commonJS({ "node_modules/object-keys/isArguments.js"(exports, module) {
		"use strict";
		var toStr = Object.prototype.toString;
		module.exports = function isArguments(value) {
			var str = toStr.call(value);
			var isArgs = str === "[object Arguments]";
			if (!isArgs) isArgs = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr.call(value.callee) === "[object Function]";
			return isArgs;
		};
	} });
	var require_implementation = __commonJS({ "node_modules/object-keys/implementation.js"(exports, module) {
		"use strict";
		var keysShim;
		if (!Object.keys) {
			has = Object.prototype.hasOwnProperty;
			toStr = Object.prototype.toString;
			isArgs = require_isArguments();
			isEnumerable = Object.prototype.propertyIsEnumerable;
			hasDontEnumBug = !isEnumerable.call({ toString: null }, "toString");
			hasProtoEnumBug = isEnumerable.call(function() {}, "prototype");
			dontEnums = [
				"toString",
				"toLocaleString",
				"valueOf",
				"hasOwnProperty",
				"isPrototypeOf",
				"propertyIsEnumerable",
				"constructor"
			];
			equalsConstructorPrototype = function(o) {
				var ctor = o.constructor;
				return ctor && ctor.prototype === o;
			};
			excludedKeys = {
				$applicationCache: true,
				$console: true,
				$external: true,
				$frame: true,
				$frameElement: true,
				$frames: true,
				$innerHeight: true,
				$innerWidth: true,
				$onmozfullscreenchange: true,
				$onmozfullscreenerror: true,
				$outerHeight: true,
				$outerWidth: true,
				$pageXOffset: true,
				$pageYOffset: true,
				$parent: true,
				$scrollLeft: true,
				$scrollTop: true,
				$scrollX: true,
				$scrollY: true,
				$self: true,
				$webkitIndexedDB: true,
				$webkitStorageInfo: true,
				$window: true
			};
			hasAutomationEqualityBug = function() {
				if (typeof window === "undefined") return false;
				for (var k in window) try {
					if (!excludedKeys["$" + k] && has.call(window, k) && window[k] !== null && typeof window[k] === "object") try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				} catch (e) {
					return true;
				}
				return false;
			}();
			equalsConstructorPrototypeIfNotBuggy = function(o) {
				if (typeof window === "undefined" || !hasAutomationEqualityBug) return equalsConstructorPrototype(o);
				try {
					return equalsConstructorPrototype(o);
				} catch (e) {
					return false;
				}
			};
			keysShim = function keys(object) {
				var isObject = object !== null && typeof object === "object";
				var isFunction = toStr.call(object) === "[object Function]";
				var isArguments = isArgs(object);
				var isString = isObject && toStr.call(object) === "[object String]";
				var theKeys = [];
				if (!isObject && !isFunction && !isArguments) throw new TypeError("Object.keys called on a non-object");
				var skipProto = hasProtoEnumBug && isFunction;
				if (isString && object.length > 0 && !has.call(object, 0)) for (var i = 0; i < object.length; ++i) theKeys.push(String(i));
				if (isArguments && object.length > 0) for (var j = 0; j < object.length; ++j) theKeys.push(String(j));
				else for (var name in object) if (!(skipProto && name === "prototype") && has.call(object, name)) theKeys.push(String(name));
				if (hasDontEnumBug) {
					var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
					for (var k = 0; k < dontEnums.length; ++k) if (!(skipConstructor && dontEnums[k] === "constructor") && has.call(object, dontEnums[k])) theKeys.push(dontEnums[k]);
				}
				return theKeys;
			};
		}
		var has;
		var toStr;
		var isArgs;
		var isEnumerable;
		var hasDontEnumBug;
		var hasProtoEnumBug;
		var dontEnums;
		var equalsConstructorPrototype;
		var excludedKeys;
		var hasAutomationEqualityBug;
		var equalsConstructorPrototypeIfNotBuggy;
		module.exports = keysShim;
	} });
	var require_object_keys = __commonJS({ "node_modules/object-keys/index.js"(exports, module) {
		"use strict";
		var slice = Array.prototype.slice;
		var isArgs = require_isArguments();
		var origKeys = Object.keys;
		var keysShim = origKeys ? function keys(o) {
			return origKeys(o);
		} : require_implementation();
		var originalKeys = Object.keys;
		keysShim.shim = function shimObjectKeys() {
			if (Object.keys) {
				if (!function() {
					var args = Object.keys(arguments);
					return args && args.length === arguments.length;
				}(1, 2)) Object.keys = function keys(object) {
					if (isArgs(object)) return originalKeys(slice.call(object));
					return originalKeys(object);
				};
			} else Object.keys = keysShim;
			return Object.keys || keysShim;
		};
		module.exports = keysShim;
	} });
	var require_es_define_property = __commonJS({ "node_modules/es-define-property/index.js"(exports, module) {
		"use strict";
		var $defineProperty = Object.defineProperty || false;
		if ($defineProperty) try {
			$defineProperty({}, "a", { value: 1 });
		} catch (e) {
			$defineProperty = false;
		}
		module.exports = $defineProperty;
	} });
	var require_syntax = __commonJS({ "node_modules/es-errors/syntax.js"(exports, module) {
		"use strict";
		module.exports = SyntaxError;
	} });
	var require_type = __commonJS({ "node_modules/es-errors/type.js"(exports, module) {
		"use strict";
		module.exports = TypeError;
	} });
	var require_gOPD = __commonJS({ "node_modules/gopd/gOPD.js"(exports, module) {
		"use strict";
		module.exports = Object.getOwnPropertyDescriptor;
	} });
	var require_gopd = __commonJS({ "node_modules/gopd/index.js"(exports, module) {
		"use strict";
		var $gOPD = require_gOPD();
		if ($gOPD) try {
			$gOPD([], "length");
		} catch (e) {
			$gOPD = null;
		}
		module.exports = $gOPD;
	} });
	var require_define_data_property = __commonJS({ "node_modules/define-data-property/index.js"(exports, module) {
		"use strict";
		var $defineProperty = require_es_define_property();
		var $SyntaxError = require_syntax();
		var $TypeError = require_type();
		var gopd = require_gopd();
		module.exports = function defineDataProperty(obj, property, value) {
			if (!obj || typeof obj !== "object" && typeof obj !== "function") throw new $TypeError("`obj` must be an object or a function`");
			if (typeof property !== "string" && typeof property !== "symbol") throw new $TypeError("`property` must be a string or a symbol`");
			if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) throw new $TypeError("`nonEnumerable`, if provided, must be a boolean or null");
			if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) throw new $TypeError("`nonWritable`, if provided, must be a boolean or null");
			if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) throw new $TypeError("`nonConfigurable`, if provided, must be a boolean or null");
			if (arguments.length > 6 && typeof arguments[6] !== "boolean") throw new $TypeError("`loose`, if provided, must be a boolean");
			var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
			var nonWritable = arguments.length > 4 ? arguments[4] : null;
			var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
			var loose = arguments.length > 6 ? arguments[6] : false;
			var desc = !!gopd && gopd(obj, property);
			if ($defineProperty) $defineProperty(obj, property, {
				configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
				enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
				value,
				writable: nonWritable === null && desc ? desc.writable : !nonWritable
			});
			else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) obj[property] = value;
			else throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
		};
	} });
	var require_has_property_descriptors = __commonJS({ "node_modules/has-property-descriptors/index.js"(exports, module) {
		"use strict";
		var $defineProperty = require_es_define_property();
		var hasPropertyDescriptors = function hasPropertyDescriptors2() {
			return !!$defineProperty;
		};
		hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
			if (!$defineProperty) return null;
			try {
				return $defineProperty([], "length", { value: 1 }).length !== 1;
			} catch (e) {
				return true;
			}
		};
		module.exports = hasPropertyDescriptors;
	} });
	var require_define_properties = __commonJS({ "node_modules/define-properties/index.js"(exports, module) {
		"use strict";
		var keys = require_object_keys();
		var hasSymbols = typeof Symbol === "function" && typeof Symbol("foo") === "symbol";
		var toStr = Object.prototype.toString;
		var concat = Array.prototype.concat;
		var defineDataProperty = require_define_data_property();
		var isFunction = function(fn) {
			return typeof fn === "function" && toStr.call(fn) === "[object Function]";
		};
		var supportsDescriptors = require_has_property_descriptors()();
		var defineProperty = function(object, name, value, predicate) {
			if (name in object) {
				if (predicate === true) {
					if (object[name] === value) return;
				} else if (!isFunction(predicate) || !predicate()) return;
			}
			if (supportsDescriptors) defineDataProperty(object, name, value, true);
			else defineDataProperty(object, name, value);
		};
		var defineProperties = function(object, map) {
			var predicates = arguments.length > 2 ? arguments[2] : {};
			var props = keys(map);
			if (hasSymbols) props = concat.call(props, Object.getOwnPropertySymbols(map));
			for (var i = 0; i < props.length; i += 1) defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
		};
		defineProperties.supportsDescriptors = !!supportsDescriptors;
		module.exports = defineProperties;
	} });
	var require_es_object_atoms = __commonJS({ "node_modules/es-object-atoms/index.js"(exports, module) {
		"use strict";
		module.exports = Object;
	} });
	var require_es_errors = __commonJS({ "node_modules/es-errors/index.js"(exports, module) {
		"use strict";
		module.exports = Error;
	} });
	var require_eval = __commonJS({ "node_modules/es-errors/eval.js"(exports, module) {
		"use strict";
		module.exports = EvalError;
	} });
	var require_range = __commonJS({ "node_modules/es-errors/range.js"(exports, module) {
		"use strict";
		module.exports = RangeError;
	} });
	var require_ref = __commonJS({ "node_modules/es-errors/ref.js"(exports, module) {
		"use strict";
		module.exports = ReferenceError;
	} });
	var require_uri = __commonJS({ "node_modules/es-errors/uri.js"(exports, module) {
		"use strict";
		module.exports = URIError;
	} });
	var require_abs = __commonJS({ "node_modules/math-intrinsics/abs.js"(exports, module) {
		"use strict";
		module.exports = Math.abs;
	} });
	var require_floor = __commonJS({ "node_modules/math-intrinsics/floor.js"(exports, module) {
		"use strict";
		module.exports = Math.floor;
	} });
	var require_max = __commonJS({ "node_modules/math-intrinsics/max.js"(exports, module) {
		"use strict";
		module.exports = Math.max;
	} });
	var require_min = __commonJS({ "node_modules/math-intrinsics/min.js"(exports, module) {
		"use strict";
		module.exports = Math.min;
	} });
	var require_pow = __commonJS({ "node_modules/math-intrinsics/pow.js"(exports, module) {
		"use strict";
		module.exports = Math.pow;
	} });
	var require_round = __commonJS({ "node_modules/math-intrinsics/round.js"(exports, module) {
		"use strict";
		module.exports = Math.round;
	} });
	var require_isNaN = __commonJS({ "node_modules/math-intrinsics/isNaN.js"(exports, module) {
		"use strict";
		module.exports = Number.isNaN || function isNaN2(a) {
			return a !== a;
		};
	} });
	var require_sign = __commonJS({ "node_modules/math-intrinsics/sign.js"(exports, module) {
		"use strict";
		var $isNaN = require_isNaN();
		module.exports = function sign(number) {
			if ($isNaN(number) || number === 0) return number;
			return number < 0 ? -1 : 1;
		};
	} });
	var require_shams = __commonJS({ "node_modules/has-symbols/shams.js"(exports, module) {
		"use strict";
		module.exports = function hasSymbols() {
			if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") return false;
			if (typeof Symbol.iterator === "symbol") return true;
			var obj = {};
			var sym = Symbol("test");
			var symObj = Object(sym);
			if (typeof sym === "string") return false;
			if (Object.prototype.toString.call(sym) !== "[object Symbol]") return false;
			if (Object.prototype.toString.call(symObj) !== "[object Symbol]") return false;
			var symVal = 42;
			obj[sym] = symVal;
			for (var _ in obj) return false;
			if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) return false;
			if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) return false;
			var syms = Object.getOwnPropertySymbols(obj);
			if (syms.length !== 1 || syms[0] !== sym) return false;
			if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) return false;
			if (typeof Object.getOwnPropertyDescriptor === "function") {
				var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
				if (descriptor.value !== symVal || descriptor.enumerable !== true) return false;
			}
			return true;
		};
	} });
	var require_has_symbols = __commonJS({ "node_modules/has-symbols/index.js"(exports, module) {
		"use strict";
		var origSymbol = typeof Symbol !== "undefined" && Symbol;
		var hasSymbolSham = require_shams();
		module.exports = function hasNativeSymbols() {
			if (typeof origSymbol !== "function") return false;
			if (typeof Symbol !== "function") return false;
			if (typeof origSymbol("foo") !== "symbol") return false;
			if (typeof Symbol("bar") !== "symbol") return false;
			return hasSymbolSham();
		};
	} });
	var require_Reflect_getPrototypeOf = __commonJS({ "node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
		"use strict";
		module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
	} });
	var require_Object_getPrototypeOf = __commonJS({ "node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
		"use strict";
		module.exports = require_es_object_atoms().getPrototypeOf || null;
	} });
	var require_implementation2 = __commonJS({ "node_modules/function-bind/implementation.js"(exports, module) {
		"use strict";
		var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
		var toStr = Object.prototype.toString;
		var max = Math.max;
		var funcType = "[object Function]";
		var concatty = function concatty2(a, b) {
			var arr = [];
			for (var i = 0; i < a.length; i += 1) arr[i] = a[i];
			for (var j = 0; j < b.length; j += 1) arr[j + a.length] = b[j];
			return arr;
		};
		var slicy = function slicy2(arrLike, offset) {
			var arr = [];
			for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) arr[j] = arrLike[i];
			return arr;
		};
		var joiny = function(arr, joiner) {
			var str = "";
			for (var i = 0; i < arr.length; i += 1) {
				str += arr[i];
				if (i + 1 < arr.length) str += joiner;
			}
			return str;
		};
		module.exports = function bind(that) {
			var target = this;
			if (typeof target !== "function" || toStr.apply(target) !== funcType) throw new TypeError(ERROR_MESSAGE + target);
			var args = slicy(arguments, 1);
			var bound;
			var binder = function() {
				if (this instanceof bound) {
					var result = target.apply(this, concatty(args, arguments));
					if (Object(result) === result) return result;
					return this;
				}
				return target.apply(that, concatty(args, arguments));
			};
			var boundLength = max(0, target.length - args.length);
			var boundArgs = [];
			for (var i = 0; i < boundLength; i++) boundArgs[i] = "$" + i;
			bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
			if (target.prototype) {
				var Empty = function Empty2() {};
				Empty.prototype = target.prototype;
				bound.prototype = new Empty();
				Empty.prototype = null;
			}
			return bound;
		};
	} });
	var require_function_bind = __commonJS({ "node_modules/function-bind/index.js"(exports, module) {
		"use strict";
		var implementation = require_implementation2();
		module.exports = Function.prototype.bind || implementation;
	} });
	var require_functionCall = __commonJS({ "node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
		"use strict";
		module.exports = Function.prototype.call;
	} });
	var require_functionApply = __commonJS({ "node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
		"use strict";
		module.exports = Function.prototype.apply;
	} });
	var require_reflectApply = __commonJS({ "node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
		"use strict";
		module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
	} });
	var require_actualApply = __commonJS({ "node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
		"use strict";
		var bind = require_function_bind();
		var $apply = require_functionApply();
		var $call = require_functionCall();
		module.exports = require_reflectApply() || bind.call($call, $apply);
	} });
	var require_call_bind_apply_helpers = __commonJS({ "node_modules/call-bind-apply-helpers/index.js"(exports, module) {
		"use strict";
		var bind = require_function_bind();
		var $TypeError = require_type();
		var $call = require_functionCall();
		var $actualApply = require_actualApply();
		module.exports = function callBindBasic(args) {
			if (args.length < 1 || typeof args[0] !== "function") throw new $TypeError("a function is required");
			return $actualApply(bind, $call, args);
		};
	} });
	var require_get = __commonJS({ "node_modules/dunder-proto/get.js"(exports, module) {
		"use strict";
		var callBind = require_call_bind_apply_helpers();
		var gOPD = require_gopd();
		var hasProtoAccessor;
		try {
			hasProtoAccessor = [].__proto__ === Array.prototype;
		} catch (e) {
			if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") throw e;
		}
		var desc = !!hasProtoAccessor && gOPD && gOPD(
			Object.prototype,
			/** @type {keyof typeof Object.prototype} */
			"__proto__"
		);
		var $Object = Object;
		var $getPrototypeOf = $Object.getPrototypeOf;
		module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
		/** @type {import('./get')} */
function getDunder(value) {
			return $getPrototypeOf(value == null ? value : $Object(value));
		}) : false;
	} });
	var require_get_proto = __commonJS({ "node_modules/get-proto/index.js"(exports, module) {
		"use strict";
		var reflectGetProto = require_Reflect_getPrototypeOf();
		var originalGetProto = require_Object_getPrototypeOf();
		var getDunderProto = require_get();
		module.exports = reflectGetProto ? function getProto(O) {
			return reflectGetProto(O);
		} : originalGetProto ? function getProto(O) {
			if (!O || typeof O !== "object" && typeof O !== "function") throw new TypeError("getProto: not an object");
			return originalGetProto(O);
		} : getDunderProto ? function getProto(O) {
			return getDunderProto(O);
		} : null;
	} });
	var require_hasown = __commonJS({ "node_modules/hasown/index.js"(exports, module) {
		"use strict";
		var call = Function.prototype.call;
		var $hasOwn = Object.prototype.hasOwnProperty;
		module.exports = require_function_bind().call(call, $hasOwn);
	} });
	var require_get_intrinsic = __commonJS({ "node_modules/get-intrinsic/index.js"(exports, module) {
		"use strict";
		var undefined2;
		var $Object = require_es_object_atoms();
		var $Error = require_es_errors();
		var $EvalError = require_eval();
		var $RangeError = require_range();
		var $ReferenceError = require_ref();
		var $SyntaxError = require_syntax();
		var $TypeError = require_type();
		var $URIError = require_uri();
		var abs = require_abs();
		var floor = require_floor();
		var max = require_max();
		var min = require_min();
		var pow = require_pow();
		var round = require_round();
		var sign = require_sign();
		var $Function = Function;
		var getEvalledConstructor = function(expressionSyntax) {
			try {
				return $Function("\"use strict\"; return (" + expressionSyntax + ").constructor;")();
			} catch (e) {}
		};
		var $gOPD = require_gopd();
		var $defineProperty = require_es_define_property();
		var throwTypeError = function() {
			throw new $TypeError();
		};
		var ThrowTypeError = $gOPD ? function() {
			try {
				arguments.callee;
				return throwTypeError;
			} catch (calleeThrows) {
				try {
					return $gOPD(arguments, "callee").get;
				} catch (gOPDthrows) {
					return throwTypeError;
				}
			}
		}() : throwTypeError;
		var hasSymbols = require_has_symbols()();
		var getProto = require_get_proto();
		var $ObjectGPO = require_Object_getPrototypeOf();
		var $ReflectGPO = require_Reflect_getPrototypeOf();
		var $apply = require_functionApply();
		var $call = require_functionCall();
		var needsEval = {};
		var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
		var INTRINSICS = {
			__proto__: null,
			"%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
			"%Array%": Array,
			"%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
			"%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
			"%AsyncFromSyncIteratorPrototype%": undefined2,
			"%AsyncFunction%": needsEval,
			"%AsyncGenerator%": needsEval,
			"%AsyncGeneratorFunction%": needsEval,
			"%AsyncIteratorPrototype%": needsEval,
			"%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
			"%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
			"%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
			"%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
			"%Boolean%": Boolean,
			"%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
			"%Date%": Date,
			"%decodeURI%": decodeURI,
			"%decodeURIComponent%": decodeURIComponent,
			"%encodeURI%": encodeURI,
			"%encodeURIComponent%": encodeURIComponent,
			"%Error%": $Error,
			"%eval%": eval,
			"%EvalError%": $EvalError,
			"%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
			"%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
			"%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
			"%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
			"%Function%": $Function,
			"%GeneratorFunction%": needsEval,
			"%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
			"%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
			"%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
			"%isFinite%": isFinite,
			"%isNaN%": isNaN,
			"%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
			"%JSON%": typeof JSON === "object" ? JSON : undefined2,
			"%Map%": typeof Map === "undefined" ? undefined2 : Map,
			"%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
			"%Math%": Math,
			"%Number%": Number,
			"%Object%": $Object,
			"%Object.getOwnPropertyDescriptor%": $gOPD,
			"%parseFloat%": parseFloat,
			"%parseInt%": parseInt,
			"%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
			"%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
			"%RangeError%": $RangeError,
			"%ReferenceError%": $ReferenceError,
			"%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
			"%RegExp%": RegExp,
			"%Set%": typeof Set === "undefined" ? undefined2 : Set,
			"%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
			"%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
			"%String%": String,
			"%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
			"%Symbol%": hasSymbols ? Symbol : undefined2,
			"%SyntaxError%": $SyntaxError,
			"%ThrowTypeError%": ThrowTypeError,
			"%TypedArray%": TypedArray,
			"%TypeError%": $TypeError,
			"%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
			"%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
			"%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
			"%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
			"%URIError%": $URIError,
			"%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
			"%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
			"%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
			"%Function.prototype.call%": $call,
			"%Function.prototype.apply%": $apply,
			"%Object.defineProperty%": $defineProperty,
			"%Object.getPrototypeOf%": $ObjectGPO,
			"%Math.abs%": abs,
			"%Math.floor%": floor,
			"%Math.max%": max,
			"%Math.min%": min,
			"%Math.pow%": pow,
			"%Math.round%": round,
			"%Math.sign%": sign,
			"%Reflect.getPrototypeOf%": $ReflectGPO
		};
		if (getProto) try {
			null.error;
		} catch (e) {
			errorProto = getProto(getProto(e));
			INTRINSICS["%Error.prototype%"] = errorProto;
		}
		var errorProto;
		var doEval = function doEval2(name) {
			var value;
			if (name === "%AsyncFunction%") value = getEvalledConstructor("async function () {}");
			else if (name === "%GeneratorFunction%") value = getEvalledConstructor("function* () {}");
			else if (name === "%AsyncGeneratorFunction%") value = getEvalledConstructor("async function* () {}");
			else if (name === "%AsyncGenerator%") {
				var fn = doEval2("%AsyncGeneratorFunction%");
				if (fn) value = fn.prototype;
			} else if (name === "%AsyncIteratorPrototype%") {
				var gen = doEval2("%AsyncGenerator%");
				if (gen && getProto) value = getProto(gen.prototype);
			}
			INTRINSICS[name] = value;
			return value;
		};
		var LEGACY_ALIASES = {
			__proto__: null,
			"%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
			"%ArrayPrototype%": ["Array", "prototype"],
			"%ArrayProto_entries%": [
				"Array",
				"prototype",
				"entries"
			],
			"%ArrayProto_forEach%": [
				"Array",
				"prototype",
				"forEach"
			],
			"%ArrayProto_keys%": [
				"Array",
				"prototype",
				"keys"
			],
			"%ArrayProto_values%": [
				"Array",
				"prototype",
				"values"
			],
			"%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
			"%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
			"%AsyncGeneratorPrototype%": [
				"AsyncGeneratorFunction",
				"prototype",
				"prototype"
			],
			"%BooleanPrototype%": ["Boolean", "prototype"],
			"%DataViewPrototype%": ["DataView", "prototype"],
			"%DatePrototype%": ["Date", "prototype"],
			"%ErrorPrototype%": ["Error", "prototype"],
			"%EvalErrorPrototype%": ["EvalError", "prototype"],
			"%Float32ArrayPrototype%": ["Float32Array", "prototype"],
			"%Float64ArrayPrototype%": ["Float64Array", "prototype"],
			"%FunctionPrototype%": ["Function", "prototype"],
			"%Generator%": ["GeneratorFunction", "prototype"],
			"%GeneratorPrototype%": [
				"GeneratorFunction",
				"prototype",
				"prototype"
			],
			"%Int8ArrayPrototype%": ["Int8Array", "prototype"],
			"%Int16ArrayPrototype%": ["Int16Array", "prototype"],
			"%Int32ArrayPrototype%": ["Int32Array", "prototype"],
			"%JSONParse%": ["JSON", "parse"],
			"%JSONStringify%": ["JSON", "stringify"],
			"%MapPrototype%": ["Map", "prototype"],
			"%NumberPrototype%": ["Number", "prototype"],
			"%ObjectPrototype%": ["Object", "prototype"],
			"%ObjProto_toString%": [
				"Object",
				"prototype",
				"toString"
			],
			"%ObjProto_valueOf%": [
				"Object",
				"prototype",
				"valueOf"
			],
			"%PromisePrototype%": ["Promise", "prototype"],
			"%PromiseProto_then%": [
				"Promise",
				"prototype",
				"then"
			],
			"%Promise_all%": ["Promise", "all"],
			"%Promise_reject%": ["Promise", "reject"],
			"%Promise_resolve%": ["Promise", "resolve"],
			"%RangeErrorPrototype%": ["RangeError", "prototype"],
			"%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
			"%RegExpPrototype%": ["RegExp", "prototype"],
			"%SetPrototype%": ["Set", "prototype"],
			"%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
			"%StringPrototype%": ["String", "prototype"],
			"%SymbolPrototype%": ["Symbol", "prototype"],
			"%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
			"%TypedArrayPrototype%": ["TypedArray", "prototype"],
			"%TypeErrorPrototype%": ["TypeError", "prototype"],
			"%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
			"%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
			"%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
			"%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
			"%URIErrorPrototype%": ["URIError", "prototype"],
			"%WeakMapPrototype%": ["WeakMap", "prototype"],
			"%WeakSetPrototype%": ["WeakSet", "prototype"]
		};
		var bind = require_function_bind();
		var hasOwn = require_hasown();
		var $concat = bind.call($call, Array.prototype.concat);
		var $spliceApply = bind.call($apply, Array.prototype.splice);
		var $replace = bind.call($call, String.prototype.replace);
		var $strSlice = bind.call($call, String.prototype.slice);
		var $exec = bind.call($call, RegExp.prototype.exec);
		var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
		var reEscapeChar = /\\(\\)?/g;
		var stringToPath = function stringToPath2(string) {
			var first = $strSlice(string, 0, 1);
			var last = $strSlice(string, -1);
			if (first === "%" && last !== "%") throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
			else if (last === "%" && first !== "%") throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
			var result = [];
			$replace(string, rePropName, function(match, number, quote, subString) {
				result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
			});
			return result;
		};
		var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
			var intrinsicName = name;
			var alias;
			if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
				alias = LEGACY_ALIASES[intrinsicName];
				intrinsicName = "%" + alias[0] + "%";
			}
			if (hasOwn(INTRINSICS, intrinsicName)) {
				var value = INTRINSICS[intrinsicName];
				if (value === needsEval) value = doEval(intrinsicName);
				if (typeof value === "undefined" && !allowMissing) throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
				return {
					alias,
					name: intrinsicName,
					value
				};
			}
			throw new $SyntaxError("intrinsic " + name + " does not exist!");
		};
		module.exports = function GetIntrinsic(name, allowMissing) {
			if (typeof name !== "string" || name.length === 0) throw new $TypeError("intrinsic name must be a non-empty string");
			if (arguments.length > 1 && typeof allowMissing !== "boolean") throw new $TypeError("\"allowMissing\" argument must be a boolean");
			if ($exec(/^%?[^%]*%?$/, name) === null) throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
			var parts = stringToPath(name);
			var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
			var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
			var intrinsicRealName = intrinsic.name;
			var value = intrinsic.value;
			var skipFurtherCaching = false;
			var alias = intrinsic.alias;
			if (alias) {
				intrinsicBaseName = alias[0];
				$spliceApply(parts, $concat([0, 1], alias));
			}
			for (var i = 1, isOwn = true; i < parts.length; i += 1) {
				var part = parts[i];
				var first = $strSlice(part, 0, 1);
				var last = $strSlice(part, -1);
				if ((first === "\"" || first === "'" || first === "`" || last === "\"" || last === "'" || last === "`") && first !== last) throw new $SyntaxError("property names with quotes must have matching quotes");
				if (part === "constructor" || !isOwn) skipFurtherCaching = true;
				intrinsicBaseName += "." + part;
				intrinsicRealName = "%" + intrinsicBaseName + "%";
				if (hasOwn(INTRINSICS, intrinsicRealName)) value = INTRINSICS[intrinsicRealName];
				else if (value != null) {
					if (!(part in value)) {
						if (!allowMissing) throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
						return;
					}
					if ($gOPD && i + 1 >= parts.length) {
						var desc = $gOPD(value, part);
						isOwn = !!desc;
						if (isOwn && "get" in desc && !("originalValue" in desc.get)) value = desc.get;
						else value = value[part];
					} else {
						isOwn = hasOwn(value, part);
						value = value[part];
					}
					if (isOwn && !skipFurtherCaching) INTRINSICS[intrinsicRealName] = value;
				}
			}
			return value;
		};
	} });
	var require_call_bound = __commonJS({ "node_modules/call-bound/index.js"(exports, module) {
		"use strict";
		var GetIntrinsic = require_get_intrinsic();
		var callBindBasic = require_call_bind_apply_helpers();
		var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
		module.exports = function callBoundIntrinsic(name, allowMissing) {
			var intrinsic = GetIntrinsic(name, !!allowMissing);
			if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) return callBindBasic(
				/** @type {const} */
				[intrinsic]
			);
			return intrinsic;
		};
	} });
	var require_IsArray = __commonJS({ "node_modules/es-abstract/helpers/IsArray.js"(exports, module) {
		"use strict";
		var $Array = require_get_intrinsic()("%Array%");
		var toStr = !$Array.isArray && require_call_bound()("Object.prototype.toString");
		module.exports = $Array.isArray || function IsArray(argument) {
			return toStr(argument) === "[object Array]";
		};
	} });
	var require_IsArray2 = __commonJS({ "node_modules/es-abstract/2024/IsArray.js"(exports, module) {
		"use strict";
		module.exports = require_IsArray();
	} });
	var require_Call = __commonJS({ "node_modules/es-abstract/2024/Call.js"(exports, module) {
		"use strict";
		var GetIntrinsic = require_get_intrinsic();
		var callBound = require_call_bound();
		var $TypeError = require_type();
		var IsArray = require_IsArray2();
		var $apply = GetIntrinsic("%Reflect.apply%", true) || callBound("Function.prototype.apply");
		module.exports = function Call(F, V) {
			var argumentsList = arguments.length > 2 ? arguments[2] : [];
			if (!IsArray(argumentsList)) throw new $TypeError("Assertion failed: optional `argumentsList`, if provided, must be a List");
			return $apply(F, V, argumentsList);
		};
	} });
	var require_util = __commonJS({ "(disabled):node_modules/object-inspect/util.inspect"() {} });
	var require_object_inspect = __commonJS({ "node_modules/object-inspect/index.js"(exports, module) {
		var hasMap = typeof Map === "function" && Map.prototype;
		var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
		var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
		var mapForEach = hasMap && Map.prototype.forEach;
		var hasSet = typeof Set === "function" && Set.prototype;
		var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
		var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
		var setForEach = hasSet && Set.prototype.forEach;
		var weakMapHas = typeof WeakMap === "function" && WeakMap.prototype ? WeakMap.prototype.has : null;
		var weakSetHas = typeof WeakSet === "function" && WeakSet.prototype ? WeakSet.prototype.has : null;
		var weakRefDeref = typeof WeakRef === "function" && WeakRef.prototype ? WeakRef.prototype.deref : null;
		var booleanValueOf = Boolean.prototype.valueOf;
		var objectToString = Object.prototype.toString;
		var functionToString = Function.prototype.toString;
		var $match = String.prototype.match;
		var $slice = String.prototype.slice;
		var $replace = String.prototype.replace;
		var $toUpperCase = String.prototype.toUpperCase;
		var $toLowerCase = String.prototype.toLowerCase;
		var $test = RegExp.prototype.test;
		var $concat = Array.prototype.concat;
		var $join = Array.prototype.join;
		var $arrSlice = Array.prototype.slice;
		var $floor = Math.floor;
		var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
		var gOPS = Object.getOwnPropertySymbols;
		var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
		var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
		var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
		var isEnumerable = Object.prototype.propertyIsEnumerable;
		var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
			return O.__proto__;
		} : null);
		function addNumericSeparator(num, str) {
			if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) return str;
			var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
			if (typeof num === "number") {
				var int = num < 0 ? -$floor(-num) : $floor(num);
				if (int !== num) {
					var intStr = String(int);
					var dec = $slice.call(str, intStr.length + 1);
					return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
				}
			}
			return $replace.call(str, sepRegex, "$&_");
		}
		var utilInspect = require_util();
		var inspectCustom = utilInspect.custom;
		var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
		var quotes = {
			__proto__: null,
			"double": "\"",
			single: "'"
		};
		var quoteREs = {
			__proto__: null,
			"double": /(["\\])/g,
			single: /(['\\])/g
		};
		module.exports = function inspect_(obj, options, depth, seen) {
			var opts = options || {};
			if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) throw new TypeError("option \"quoteStyle\" must be \"single\" or \"double\"");
			if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) throw new TypeError("option \"maxStringLength\", if provided, must be a positive integer, Infinity, or `null`");
			var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
			if (typeof customInspect !== "boolean" && customInspect !== "symbol") throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
			if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) throw new TypeError("option \"indent\" must be \"\\t\", an integer > 0, or `null`");
			if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") throw new TypeError("option \"numericSeparator\", if provided, must be `true` or `false`");
			var numericSeparator = opts.numericSeparator;
			if (typeof obj === "undefined") return "undefined";
			if (obj === null) return "null";
			if (typeof obj === "boolean") return obj ? "true" : "false";
			if (typeof obj === "string") return inspectString(obj, opts);
			if (typeof obj === "number") {
				if (obj === 0) return Infinity / obj > 0 ? "0" : "-0";
				var str = String(obj);
				return numericSeparator ? addNumericSeparator(obj, str) : str;
			}
			if (typeof obj === "bigint") {
				var bigIntStr = String(obj) + "n";
				return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
			}
			var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
			if (typeof depth === "undefined") depth = 0;
			if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") return isArray(obj) ? "[Array]" : "[Object]";
			var indent = getIndent(opts, depth);
			if (typeof seen === "undefined") seen = [];
			else if (indexOf(seen, obj) >= 0) return "[Circular]";
			function inspect(value, from, noIndent) {
				if (from) {
					seen = $arrSlice.call(seen);
					seen.push(from);
				}
				if (noIndent) {
					var newOpts = { depth: opts.depth };
					if (has(opts, "quoteStyle")) newOpts.quoteStyle = opts.quoteStyle;
					return inspect_(value, newOpts, depth + 1, seen);
				}
				return inspect_(value, opts, depth + 1, seen);
			}
			if (typeof obj === "function" && !isRegExp(obj)) {
				var name = nameOf(obj);
				var keys = arrObjKeys(obj, inspect);
				return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
			}
			if (isSymbol(obj)) {
				var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
				return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
			}
			if (isElement(obj)) {
				var s = "<" + $toLowerCase.call(String(obj.nodeName));
				var attrs = obj.attributes || [];
				for (var i = 0; i < attrs.length; i++) s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
				s += ">";
				if (obj.childNodes && obj.childNodes.length) s += "...";
				s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
				return s;
			}
			if (isArray(obj)) {
				if (obj.length === 0) return "[]";
				var xs = arrObjKeys(obj, inspect);
				if (indent && !singleLineValues(xs)) return "[" + indentedJoin(xs, indent) + "]";
				return "[ " + $join.call(xs, ", ") + " ]";
			}
			if (isError(obj)) {
				var parts = arrObjKeys(obj, inspect);
				if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
				if (parts.length === 0) return "[" + String(obj) + "]";
				return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
			}
			if (typeof obj === "object" && customInspect) {
				if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) return utilInspect(obj, { depth: maxDepth - depth });
				else if (customInspect !== "symbol" && typeof obj.inspect === "function") return obj.inspect();
			}
			if (isMap(obj)) {
				var mapParts = [];
				if (mapForEach) mapForEach.call(obj, function(value, key) {
					mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
				});
				return collectionOf("Map", mapSize.call(obj), mapParts, indent);
			}
			if (isSet(obj)) {
				var setParts = [];
				if (setForEach) setForEach.call(obj, function(value) {
					setParts.push(inspect(value, obj));
				});
				return collectionOf("Set", setSize.call(obj), setParts, indent);
			}
			if (isWeakMap(obj)) return weakCollectionOf("WeakMap");
			if (isWeakSet(obj)) return weakCollectionOf("WeakSet");
			if (isWeakRef(obj)) return weakCollectionOf("WeakRef");
			if (isNumber(obj)) return markBoxed(inspect(Number(obj)));
			if (isBigInt(obj)) return markBoxed(inspect(bigIntValueOf.call(obj)));
			if (isBoolean(obj)) return markBoxed(booleanValueOf.call(obj));
			if (isString(obj)) return markBoxed(inspect(String(obj)));
			if (typeof window !== "undefined" && obj === window) return "{ [object Window] }";
			if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) return "{ [object globalThis] }";
			if (!isDate(obj) && !isRegExp(obj)) {
				var ys = arrObjKeys(obj, inspect);
				var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
				var protoTag = obj instanceof Object ? "" : "null prototype";
				var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
				var tag = (isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "") + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
				if (ys.length === 0) return tag + "{}";
				if (indent) return tag + "{" + indentedJoin(ys, indent) + "}";
				return tag + "{ " + $join.call(ys, ", ") + " }";
			}
			return String(obj);
		};
		function wrapQuotes(s, defaultStyle, opts) {
			var quoteChar = quotes[opts.quoteStyle || defaultStyle];
			return quoteChar + s + quoteChar;
		}
		function quote(s) {
			return $replace.call(String(s), /"/g, "&quot;");
		}
		function canTrustToString(obj) {
			return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
		}
		function isArray(obj) {
			return toStr(obj) === "[object Array]" && canTrustToString(obj);
		}
		function isDate(obj) {
			return toStr(obj) === "[object Date]" && canTrustToString(obj);
		}
		function isRegExp(obj) {
			return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
		}
		function isError(obj) {
			return toStr(obj) === "[object Error]" && canTrustToString(obj);
		}
		function isString(obj) {
			return toStr(obj) === "[object String]" && canTrustToString(obj);
		}
		function isNumber(obj) {
			return toStr(obj) === "[object Number]" && canTrustToString(obj);
		}
		function isBoolean(obj) {
			return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
		}
		function isSymbol(obj) {
			if (hasShammedSymbols) return obj && typeof obj === "object" && obj instanceof Symbol;
			if (typeof obj === "symbol") return true;
			if (!obj || typeof obj !== "object" || !symToString) return false;
			try {
				symToString.call(obj);
				return true;
			} catch (e) {}
			return false;
		}
		function isBigInt(obj) {
			if (!obj || typeof obj !== "object" || !bigIntValueOf) return false;
			try {
				bigIntValueOf.call(obj);
				return true;
			} catch (e) {}
			return false;
		}
		var hasOwn = Object.prototype.hasOwnProperty || function(key) {
			return key in this;
		};
		function has(obj, key) {
			return hasOwn.call(obj, key);
		}
		function toStr(obj) {
			return objectToString.call(obj);
		}
		function nameOf(f) {
			if (f.name) return f.name;
			var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
			if (m) return m[1];
			return null;
		}
		function indexOf(xs, x) {
			if (xs.indexOf) return xs.indexOf(x);
			for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
			return -1;
		}
		function isMap(x) {
			if (!mapSize || !x || typeof x !== "object") return false;
			try {
				mapSize.call(x);
				try {
					setSize.call(x);
				} catch (s) {
					return true;
				}
				return x instanceof Map;
			} catch (e) {}
			return false;
		}
		function isWeakMap(x) {
			if (!weakMapHas || !x || typeof x !== "object") return false;
			try {
				weakMapHas.call(x, weakMapHas);
				try {
					weakSetHas.call(x, weakSetHas);
				} catch (s) {
					return true;
				}
				return x instanceof WeakMap;
			} catch (e) {}
			return false;
		}
		function isWeakRef(x) {
			if (!weakRefDeref || !x || typeof x !== "object") return false;
			try {
				weakRefDeref.call(x);
				return true;
			} catch (e) {}
			return false;
		}
		function isSet(x) {
			if (!setSize || !x || typeof x !== "object") return false;
			try {
				setSize.call(x);
				try {
					mapSize.call(x);
				} catch (m) {
					return true;
				}
				return x instanceof Set;
			} catch (e) {}
			return false;
		}
		function isWeakSet(x) {
			if (!weakSetHas || !x || typeof x !== "object") return false;
			try {
				weakSetHas.call(x, weakSetHas);
				try {
					weakMapHas.call(x, weakMapHas);
				} catch (s) {
					return true;
				}
				return x instanceof WeakSet;
			} catch (e) {}
			return false;
		}
		function isElement(x) {
			if (!x || typeof x !== "object") return false;
			if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) return true;
			return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
		}
		function inspectString(str, opts) {
			if (str.length > opts.maxStringLength) {
				var remaining = str.length - opts.maxStringLength;
				var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
				return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
			}
			var quoteRE = quoteREs[opts.quoteStyle || "single"];
			quoteRE.lastIndex = 0;
			return wrapQuotes($replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte), "single", opts);
		}
		function lowbyte(c) {
			var n = c.charCodeAt(0);
			var x = {
				8: "b",
				9: "t",
				10: "n",
				12: "f",
				13: "r"
			}[n];
			if (x) return "\\" + x;
			return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
		}
		function markBoxed(str) {
			return "Object(" + str + ")";
		}
		function weakCollectionOf(type) {
			return type + " { ? }";
		}
		function collectionOf(type, size, entries, indent) {
			var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
			return type + " (" + size + ") {" + joinedEntries + "}";
		}
		function singleLineValues(xs) {
			for (var i = 0; i < xs.length; i++) if (indexOf(xs[i], "\n") >= 0) return false;
			return true;
		}
		function getIndent(opts, depth) {
			var baseIndent;
			if (opts.indent === "	") baseIndent = "	";
			else if (typeof opts.indent === "number" && opts.indent > 0) baseIndent = $join.call(Array(opts.indent + 1), " ");
			else return null;
			return {
				base: baseIndent,
				prev: $join.call(Array(depth + 1), baseIndent)
			};
		}
		function indentedJoin(xs, indent) {
			if (xs.length === 0) return "";
			var lineJoiner = "\n" + indent.prev + indent.base;
			return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
		}
		function arrObjKeys(obj, inspect) {
			var isArr = isArray(obj);
			var xs = [];
			if (isArr) {
				xs.length = obj.length;
				for (var i = 0; i < obj.length; i++) xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
			}
			var syms = typeof gOPS === "function" ? gOPS(obj) : [];
			var symMap;
			if (hasShammedSymbols) {
				symMap = {};
				for (var k = 0; k < syms.length; k++) symMap["$" + syms[k]] = syms[k];
			}
			for (var key in obj) {
				if (!has(obj, key)) continue;
				if (isArr && String(Number(key)) === key && key < obj.length) continue;
				if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) continue;
				else if ($test.call(/[^\w$]/, key)) xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
				else xs.push(key + ": " + inspect(obj[key], obj));
			}
			if (typeof gOPS === "function") {
				for (var j = 0; j < syms.length; j++) if (isEnumerable.call(obj, syms[j])) xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
			}
			return xs;
		}
	} });
	var require_isObject = __commonJS({ "node_modules/es-abstract/helpers/isObject.js"(exports, module) {
		"use strict";
		module.exports = function isObject(x) {
			return !!x && (typeof x === "function" || typeof x === "object");
		};
	} });
	var require_isPropertyKey = __commonJS({ "node_modules/es-abstract/helpers/isPropertyKey.js"(exports, module) {
		"use strict";
		module.exports = function isPropertyKey(argument) {
			return typeof argument === "string" || typeof argument === "symbol";
		};
	} });
	var require_Get = __commonJS({ "node_modules/es-abstract/2024/Get.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var inspect = require_object_inspect();
		var isObject = require_isObject();
		var isPropertyKey = require_isPropertyKey();
		module.exports = function Get(O, P) {
			if (!isObject(O)) throw new $TypeError("Assertion failed: Type(O) is not Object");
			if (!isPropertyKey(P)) throw new $TypeError("Assertion failed: P is not a Property Key, got " + inspect(P));
			return O[P];
		};
	} });
	var require_Type = __commonJS({ "node_modules/es-abstract/5/Type.js"(exports, module) {
		"use strict";
		var isObject = require_isObject();
		module.exports = function Type(x) {
			if (x === null) return "Null";
			if (typeof x === "undefined") return "Undefined";
			if (isObject(x)) return "Object";
			if (typeof x === "number") return "Number";
			if (typeof x === "boolean") return "Boolean";
			if (typeof x === "string") return "String";
		};
	} });
	var require_Type2 = __commonJS({ "node_modules/es-abstract/2024/Type.js"(exports, module) {
		"use strict";
		var ES5Type = require_Type();
		module.exports = function Type(x) {
			if (typeof x === "symbol") return "Symbol";
			if (typeof x === "bigint") return "BigInt";
			return ES5Type(x);
		};
	} });
	var require_GetIteratorDirect = __commonJS({ "node_modules/es-iterator-helpers/aos/GetIteratorDirect.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Get = require_Get();
		var Type = require_Type2();
		module.exports = function GetIteratorDirect(obj) {
			if (Type(obj) !== "Object") throw new $TypeError("Assertion failed: `obj` must be an Object");
			return {
				"[[Iterator]]": obj,
				"[[NextMethod]]": Get(obj, "next"),
				"[[Done]]": false
			};
		};
	} });
	var require_is_callable = __commonJS({ "node_modules/is-callable/index.js"(exports, module) {
		"use strict";
		var fnToStr = Function.prototype.toString;
		var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
		var badArrayLike;
		var isCallableMarker;
		if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") try {
			badArrayLike = Object.defineProperty({}, "length", { get: function() {
				throw isCallableMarker;
			} });
			isCallableMarker = {};
			reflectApply(function() {
				throw 42;
			}, null, badArrayLike);
		} catch (_) {
			if (_ !== isCallableMarker) reflectApply = null;
		}
		else reflectApply = null;
		var constructorRegex = /^\s*class\b/;
		var isES6ClassFn = function isES6ClassFunction(value) {
			try {
				var fnStr = fnToStr.call(value);
				return constructorRegex.test(fnStr);
			} catch (e) {
				return false;
			}
		};
		var tryFunctionObject = function tryFunctionToStr(value) {
			try {
				if (isES6ClassFn(value)) return false;
				fnToStr.call(value);
				return true;
			} catch (e) {
				return false;
			}
		};
		var toStr = Object.prototype.toString;
		var objectClass = "[object Object]";
		var fnClass = "[object Function]";
		var genClass = "[object GeneratorFunction]";
		var ddaClass = "[object HTMLAllCollection]";
		var ddaClass2 = "[object HTML document.all class]";
		var ddaClass3 = "[object HTMLCollection]";
		var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
		var isIE68 = !(0 in [,]);
		var isDDA = function isDocumentDotAll() {
			return false;
		};
		if (typeof document === "object") {
			all = document.all;
			if (toStr.call(all) === toStr.call(document.all)) isDDA = function isDocumentDotAll(value) {
				if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) try {
					var str = toStr.call(value);
					return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
				} catch (e) {}
				return false;
			};
		}
		var all;
		module.exports = reflectApply ? function isCallable(value) {
			if (isDDA(value)) return true;
			if (!value) return false;
			if (typeof value !== "function" && typeof value !== "object") return false;
			try {
				reflectApply(value, null, badArrayLike);
			} catch (e) {
				if (e !== isCallableMarker) return false;
			}
			return !isES6ClassFn(value) && tryFunctionObject(value);
		} : function isCallable(value) {
			if (isDDA(value)) return true;
			if (!value) return false;
			if (typeof value !== "function" && typeof value !== "object") return false;
			if (hasToStringTag) return tryFunctionObject(value);
			if (isES6ClassFn(value)) return false;
			var strClass = toStr.call(value);
			if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) return false;
			return tryFunctionObject(value);
		};
	} });
	var require_IsCallable = __commonJS({ "node_modules/es-abstract/2024/IsCallable.js"(exports, module) {
		"use strict";
		module.exports = require_is_callable();
	} });
	var require_side_channel_list = __commonJS({ "node_modules/side-channel-list/index.js"(exports, module) {
		"use strict";
		var inspect = require_object_inspect();
		var $TypeError = require_type();
		var listGetNode = function(list, key, isDelete) {
			var prev = list;
			var curr;
			for (; (curr = prev.next) != null; prev = curr) if (curr.key === key) {
				prev.next = curr.next;
				if (!isDelete) {
					curr.next = list.next;
					list.next = curr;
				}
				return curr;
			}
		};
		var listGet = function(objects, key) {
			if (!objects) return;
			var node = listGetNode(objects, key);
			return node && node.value;
		};
		var listSet = function(objects, key, value) {
			var node = listGetNode(objects, key);
			if (node) node.value = value;
			else objects.next = {
				key,
				next: objects.next,
				value
			};
		};
		var listHas = function(objects, key) {
			if (!objects) return false;
			return !!listGetNode(objects, key);
		};
		var listDelete = function(objects, key) {
			if (objects) return listGetNode(objects, key, true);
		};
		module.exports = function getSideChannelList() {
			var $o;
			var channel = {
				assert: function(key) {
					if (!channel.has(key)) throw new $TypeError("Side channel does not contain " + inspect(key));
				},
				"delete": function(key) {
					var root = $o && $o.next;
					var deletedNode = listDelete($o, key);
					if (deletedNode && root && root === deletedNode) $o = void 0;
					return !!deletedNode;
				},
				get: function(key) {
					return listGet($o, key);
				},
				has: function(key) {
					return listHas($o, key);
				},
				set: function(key, value) {
					if (!$o) $o = { next: void 0 };
					listSet(
						/** @type {NonNullable<typeof $o>} */
						$o,
						key,
						value
					);
				}
			};
			return channel;
		};
	} });
	var require_side_channel_map = __commonJS({ "node_modules/side-channel-map/index.js"(exports, module) {
		"use strict";
		var GetIntrinsic = require_get_intrinsic();
		var callBound = require_call_bound();
		var inspect = require_object_inspect();
		var $TypeError = require_type();
		var $Map = GetIntrinsic("%Map%", true);
		var $mapGet = callBound("Map.prototype.get", true);
		var $mapSet = callBound("Map.prototype.set", true);
		var $mapHas = callBound("Map.prototype.has", true);
		var $mapDelete = callBound("Map.prototype.delete", true);
		var $mapSize = callBound("Map.prototype.size", true);
		module.exports = !!$Map && function getSideChannelMap() {
			var $m;
			var channel = {
				assert: function(key) {
					if (!channel.has(key)) throw new $TypeError("Side channel does not contain " + inspect(key));
				},
				"delete": function(key) {
					if ($m) {
						var result = $mapDelete($m, key);
						if ($mapSize($m) === 0) $m = void 0;
						return result;
					}
					return false;
				},
				get: function(key) {
					if ($m) return $mapGet($m, key);
				},
				has: function(key) {
					if ($m) return $mapHas($m, key);
					return false;
				},
				set: function(key, value) {
					if (!$m) $m = new $Map();
					$mapSet($m, key, value);
				}
			};
			return channel;
		};
	} });
	var require_side_channel_weakmap = __commonJS({ "node_modules/side-channel-weakmap/index.js"(exports, module) {
		"use strict";
		var GetIntrinsic = require_get_intrinsic();
		var callBound = require_call_bound();
		var inspect = require_object_inspect();
		var getSideChannelMap = require_side_channel_map();
		var $TypeError = require_type();
		var $WeakMap = GetIntrinsic("%WeakMap%", true);
		var $weakMapGet = callBound("WeakMap.prototype.get", true);
		var $weakMapSet = callBound("WeakMap.prototype.set", true);
		var $weakMapHas = callBound("WeakMap.prototype.has", true);
		var $weakMapDelete = callBound("WeakMap.prototype.delete", true);
		module.exports = $WeakMap ? (
		/** @type {Exclude<import('.'), false>} */
function getSideChannelWeakMap() {
			var $wm;
			var $m;
			var channel = {
				assert: function(key) {
					if (!channel.has(key)) throw new $TypeError("Side channel does not contain " + inspect(key));
				},
				"delete": function(key) {
					if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
						if ($wm) return $weakMapDelete($wm, key);
					} else if (getSideChannelMap) {
						if ($m) return $m["delete"](key);
					}
					return false;
				},
				get: function(key) {
					if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
						if ($wm) return $weakMapGet($wm, key);
					}
					return $m && $m.get(key);
				},
				has: function(key) {
					if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
						if ($wm) return $weakMapHas($wm, key);
					}
					return !!$m && $m.has(key);
				},
				set: function(key, value) {
					if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
						if (!$wm) $wm = new $WeakMap();
						$weakMapSet($wm, key, value);
					} else if (getSideChannelMap) {
						if (!$m) $m = getSideChannelMap();
						$m.set(key, value);
					}
				}
			};
			return channel;
		}) : getSideChannelMap;
	} });
	var require_side_channel = __commonJS({ "node_modules/side-channel/index.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var inspect = require_object_inspect();
		var getSideChannelList = require_side_channel_list();
		var getSideChannelMap = require_side_channel_map();
		var makeChannel = require_side_channel_weakmap() || getSideChannelMap || getSideChannelList;
		module.exports = function getSideChannel() {
			var $channelData;
			var channel = {
				assert: function(key) {
					if (!channel.has(key)) throw new $TypeError("Side channel does not contain " + inspect(key));
				},
				"delete": function(key) {
					return !!$channelData && $channelData["delete"](key);
				},
				get: function(key) {
					return $channelData && $channelData.get(key);
				},
				has: function(key) {
					return !!$channelData && $channelData.has(key);
				},
				set: function(key, value) {
					if (!$channelData) $channelData = makeChannel();
					$channelData.set(key, value);
				}
			};
			return channel;
		};
	} });
	var require_internal_slot = __commonJS({ "node_modules/internal-slot/index.js"(exports, module) {
		"use strict";
		var hasOwn = require_hasown();
		var channel = require_side_channel()();
		var $TypeError = require_type();
		var SLOT = {
			assert: function(O, slot) {
				if (!O || typeof O !== "object" && typeof O !== "function") throw new $TypeError("`O` is not an object");
				if (typeof slot !== "string") throw new $TypeError("`slot` must be a string");
				channel.assert(O);
				if (!SLOT.has(O, slot)) throw new $TypeError("`" + slot + "` is not present on `O`");
			},
			get: function(O, slot) {
				if (!O || typeof O !== "object" && typeof O !== "function") throw new $TypeError("`O` is not an object");
				if (typeof slot !== "string") throw new $TypeError("`slot` must be a string");
				var slots = channel.get(O);
				return slots && slots["$" + slot];
			},
			has: function(O, slot) {
				if (!O || typeof O !== "object" && typeof O !== "function") throw new $TypeError("`O` is not an object");
				if (typeof slot !== "string") throw new $TypeError("`slot` must be a string");
				var slots = channel.get(O);
				return !!slots && hasOwn(
					slots,
					/** @type {SaltedInternalSlot} */
					"$" + slot
				);
			},
			set: function(O, slot, V) {
				if (!O || typeof O !== "object" && typeof O !== "function") throw new $TypeError("`O` is not an object");
				if (typeof slot !== "string") throw new $TypeError("`slot` must be a string");
				var slots = channel.get(O);
				if (!slots) {
					slots = {};
					channel.set(O, slots);
				}
				slots["$" + slot] = V;
			}
		};
		if (Object.freeze) Object.freeze(SLOT);
		module.exports = SLOT;
	} });
	var require_CompletionRecord = __commonJS({ "node_modules/es-abstract/2024/CompletionRecord.js"(exports, module) {
		"use strict";
		var $SyntaxError = require_syntax();
		var SLOT = require_internal_slot();
		var CompletionRecord = function CompletionRecord2(type, value) {
			if (!(this instanceof CompletionRecord2)) return new CompletionRecord2(type, value);
			if (type !== "normal" && type !== "break" && type !== "continue" && type !== "return" && type !== "throw") throw new $SyntaxError("Assertion failed: `type` must be one of \"normal\", \"break\", \"continue\", \"return\", or \"throw\"");
			SLOT.set(this, "[[Type]]", type);
			SLOT.set(this, "[[Value]]", value);
		};
		CompletionRecord.prototype.type = function Type() {
			return SLOT.get(this, "[[Type]]");
		};
		CompletionRecord.prototype.value = function Value() {
			return SLOT.get(this, "[[Value]]");
		};
		CompletionRecord.prototype["?"] = function ReturnIfAbrupt() {
			var type = SLOT.get(this, "[[Type]]");
			var value = SLOT.get(this, "[[Value]]");
			if (type === "throw") throw value;
			return value;
		};
		CompletionRecord.prototype["!"] = function assert() {
			if (SLOT.get(this, "[[Type]]") !== "normal") throw new $SyntaxError("Assertion failed: Completion Record is not of type \"normal\"");
			return SLOT.get(this, "[[Value]]");
		};
		module.exports = CompletionRecord;
	} });
	var require_GetV = __commonJS({ "node_modules/es-abstract/2024/GetV.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var inspect = require_object_inspect();
		var isPropertyKey = require_isPropertyKey();
		module.exports = function GetV(V, P) {
			if (!isPropertyKey(P)) throw new $TypeError("Assertion failed: P is not a Property Key, got " + inspect(P));
			return V[P];
		};
	} });
	var require_GetMethod = __commonJS({ "node_modules/es-abstract/2024/GetMethod.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var GetV = require_GetV();
		var IsCallable = require_IsCallable();
		var isPropertyKey = require_isPropertyKey();
		var inspect = require_object_inspect();
		module.exports = function GetMethod(O, P) {
			if (!isPropertyKey(P)) throw new $TypeError("Assertion failed: P is not a Property Key");
			var func = GetV(O, P);
			if (func == null) return;
			if (!IsCallable(func)) throw new $TypeError(inspect(P) + " is not a function: " + inspect(func));
			return func;
		};
	} });
	var require_iterator_record = __commonJS({ "node_modules/es-abstract/helpers/records/iterator-record.js"(exports, module) {
		"use strict";
		var hasOwn = require_hasown();
		module.exports = function isIteratorRecord(value) {
			return !!value && typeof value === "object" && hasOwn(value, "[[Iterator]]") && hasOwn(value, "[[NextMethod]]") && hasOwn(value, "[[Done]]") && typeof value["[[Done]]"] === "boolean";
		};
	} });
	var require_IteratorClose = __commonJS({ "node_modules/es-abstract/2024/IteratorClose.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Call = require_Call();
		var CompletionRecord = require_CompletionRecord();
		var GetMethod = require_GetMethod();
		var IsCallable = require_IsCallable();
		var isObject = require_isObject();
		var isIteratorRecord = require_iterator_record();
		module.exports = function IteratorClose(iteratorRecord, completion) {
			if (!isIteratorRecord(iteratorRecord)) throw new $TypeError("Assertion failed: `iteratorRecord` must be an Iterator Record");
			if (!isObject(iteratorRecord["[[Iterator]]"])) throw new $TypeError("Assertion failed: iteratorRecord.[[Iterator]] must be an Object");
			if (!IsCallable(completion) && !(completion instanceof CompletionRecord)) throw new $TypeError("Assertion failed: completion is not a thunk representing a Completion Record, nor a Completion Record instance");
			var completionThunk = completion instanceof CompletionRecord ? function() {
				return completion["?"]();
			} : completion;
			var iterator = iteratorRecord["[[Iterator]]"];
			var iteratorReturn;
			try {
				iteratorReturn = GetMethod(iterator, "return");
			} catch (e) {
				completionThunk();
				completionThunk = null;
				throw e;
			}
			if (typeof iteratorReturn === "undefined") return completionThunk();
			var innerResult;
			try {
				innerResult = Call(iteratorReturn, iterator, []);
			} catch (e) {
				completionThunk();
				completionThunk = null;
				throw e;
			}
			var completionRecord = completionThunk();
			completionThunk = null;
			if (!isObject(innerResult)) throw new $TypeError("iterator .return must return an object");
			return completionRecord;
		};
	} });
	var require_ToBoolean = __commonJS({ "node_modules/es-abstract/2024/ToBoolean.js"(exports, module) {
		"use strict";
		module.exports = function ToBoolean(value) {
			return !!value;
		};
	} });
	var require_IteratorComplete = __commonJS({ "node_modules/es-abstract/2024/IteratorComplete.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Get = require_Get();
		var ToBoolean = require_ToBoolean();
		var isObject = require_isObject();
		module.exports = function IteratorComplete(iterResult) {
			if (!isObject(iterResult)) throw new $TypeError("Assertion failed: Type(iterResult) is not Object");
			return ToBoolean(Get(iterResult, "done"));
		};
	} });
	var require_IteratorNext = __commonJS({ "node_modules/es-abstract/2024/IteratorNext.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Call = require_Call();
		var isObject = require_isObject();
		var isIteratorRecord = require_iterator_record();
		module.exports = function IteratorNext(iteratorRecord) {
			if (!isIteratorRecord(iteratorRecord)) throw new $TypeError("Assertion failed: `iteratorRecord` must be an Iterator Record");
			var result;
			if (arguments.length < 2) result = Call(iteratorRecord["[[NextMethod]]"], iteratorRecord["[[Iterator]]"]);
			else result = Call(iteratorRecord["[[NextMethod]]"], iteratorRecord["[[Iterator]]"], [arguments[1]]);
			if (!isObject(result)) throw new $TypeError("iterator next must return an object");
			return result;
		};
	} });
	var require_IteratorStepValue = __commonJS({ "node_modules/es-abstract/2024/IteratorStepValue.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Get = require_Get();
		var IteratorComplete = require_IteratorComplete();
		var IteratorNext = require_IteratorNext();
		var isIteratorRecord = require_iterator_record();
		module.exports = function IteratorStepValue(iteratorRecord) {
			if (!isIteratorRecord(iteratorRecord)) throw new $TypeError("Assertion failed: `iteratorRecord` must be an Iterator Record");
			var result;
			try {
				result = IteratorNext(iteratorRecord);
			} catch (e) {
				iteratorRecord["[[Done]]"] = true;
				throw e;
			}
			var done;
			try {
				done = IteratorComplete(result);
			} catch (e) {
				iteratorRecord["[[Done]]"] = true;
				throw e;
			}
			if (done) {
				iteratorRecord["[[Done]]"] = true;
				return "DONE";
			}
			var value;
			try {
				value = Get(result, "value");
			} catch (e) {
				iteratorRecord["[[Done]]"] = true;
				throw e;
			}
			return value;
		};
	} });
	var require_NormalCompletion = __commonJS({ "node_modules/es-abstract/2024/NormalCompletion.js"(exports, module) {
		"use strict";
		var CompletionRecord = require_CompletionRecord();
		module.exports = function NormalCompletion(value) {
			return new CompletionRecord("normal", value);
		};
	} });
	var require_ThrowCompletion = __commonJS({ "node_modules/es-abstract/2024/ThrowCompletion.js"(exports, module) {
		"use strict";
		var CompletionRecord = require_CompletionRecord();
		module.exports = function ThrowCompletion(argument) {
			return new CompletionRecord("throw", argument);
		};
	} });
	var require_implementation3 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.find/implementation.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Call = require_Call();
		var GetIteratorDirect = require_GetIteratorDirect();
		var IsCallable = require_IsCallable();
		var IteratorClose = require_IteratorClose();
		var IteratorStepValue = require_IteratorStepValue();
		var NormalCompletion = require_NormalCompletion();
		var ThrowCompletion = require_ThrowCompletion();
		var ToBoolean = require_ToBoolean();
		var Type = require_Type2();
		module.exports = function find(predicate) {
			if (this instanceof find) throw new $TypeError("`find` is not a constructor");
			var O = this;
			if (Type(O) !== "Object") throw new $TypeError("`this` value must be an Object");
			if (!IsCallable(predicate)) throw new $TypeError("`predicate` must be a function");
			var iterated = GetIteratorDirect(O);
			var counter = 0;
			while (true) {
				var value = IteratorStepValue(iterated);
				if (iterated["[[Done]]"]) return;
				var result;
				try {
					result = Call(predicate, void 0, [value, counter]);
				} catch (e) {
					IteratorClose(iterated, ThrowCompletion(e));
				} finally {
					counter += 1;
				}
				if (ToBoolean(result)) return IteratorClose(iterated, NormalCompletion(value));
			}
		};
	} });
	var require_polyfill = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.find/polyfill.js"(exports, module) {
		"use strict";
		var implementation = require_implementation3();
		module.exports = function getPolyfill() {
			return typeof Iterator === "function" && typeof Iterator.prototype.find === "function" ? Iterator.prototype.find : implementation;
		};
	} });
	var require_functions_have_names = __commonJS({ "node_modules/functions-have-names/index.js"(exports, module) {
		"use strict";
		var functionsHaveNames = function functionsHaveNames2() {
			return typeof function f() {}.name === "string";
		};
		var gOPD = Object.getOwnPropertyDescriptor;
		if (gOPD) try {
			gOPD([], "length");
		} catch (e) {
			gOPD = null;
		}
		functionsHaveNames.functionsHaveConfigurableNames = function functionsHaveConfigurableNames() {
			if (!functionsHaveNames() || !gOPD) return false;
			var desc = gOPD(function() {}, "name");
			return !!desc && !!desc.configurable;
		};
		var $bind = Function.prototype.bind;
		functionsHaveNames.boundFunctionsHaveNames = function boundFunctionsHaveNames() {
			return functionsHaveNames() && typeof $bind === "function" && function f() {}.bind().name !== "";
		};
		module.exports = functionsHaveNames;
	} });
	var require_set_function_name = __commonJS({ "node_modules/set-function-name/index.js"(exports, module) {
		"use strict";
		var define = require_define_data_property();
		var hasDescriptors = require_has_property_descriptors()();
		var functionsHaveConfigurableNames = require_functions_have_names().functionsHaveConfigurableNames();
		var $TypeError = require_type();
		module.exports = function setFunctionName(fn, name) {
			if (typeof fn !== "function") throw new $TypeError("`fn` is not a function");
			if (!(arguments.length > 2 && !!arguments[2]) || functionsHaveConfigurableNames) if (hasDescriptors) define(
				/** @type {Parameters<define>[0]} */
				fn,
				"name",
				name,
				true,
				true
			);
			else define(
				/** @type {Parameters<define>[0]} */
				fn,
				"name",
				name
			);
			return fn;
		};
	} });
	var require_iterator = __commonJS({ "node_modules/iterator.prototype/index.js"(exports, module) {
		"use strict";
		var GetIntrinsic = require_get_intrinsic();
		var gPO = require_get_proto();
		var hasSymbols = require_has_symbols();
		var setFunctionName = require_set_function_name();
		var defineDataProperty = require_define_data_property();
		var $Object = require_es_object_atoms();
		var arrayIterProto = GetIntrinsic("%ArrayIteratorPrototype%", true);
		var iterProto = arrayIterProto && gPO(arrayIterProto);
		var result = iterProto !== $Object.prototype && iterProto || {};
		if (hasSymbols()) {
			if (!(Symbol.iterator in result)) {
				iter = setFunctionName(function SymbolIterator() {
					return this;
				}, "[Symbol.iterator]", true);
				defineDataProperty(result, Symbol.iterator, iter, true);
			}
		}
		var iter;
		module.exports = result;
	} });
	var require_implementation4 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype/implementation.js"(exports, module) {
		"use strict";
		module.exports = require_iterator();
	} });
	var require_shim = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.find/shim.js"(exports, module) {
		"use strict";
		var define = require_define_properties();
		var getPolyfill = require_polyfill();
		var $IteratorPrototype = require_implementation4();
		module.exports = function shimIteratorPrototypeFind() {
			var polyfill = getPolyfill();
			define($IteratorPrototype, { find: polyfill }, { find: function() {
				return $IteratorPrototype.find !== polyfill;
			} });
			return polyfill;
		};
	} });
	var require_CreateIterResultObject = __commonJS({ "node_modules/es-abstract/2024/CreateIterResultObject.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		module.exports = function CreateIterResultObject(value, done) {
			if (typeof done !== "boolean") throw new $TypeError("Assertion failed: Type(done) is not Boolean");
			return {
				value,
				done
			};
		};
	} });
	var require_GeneratorStart = __commonJS({ "node_modules/es-iterator-helpers/aos/GeneratorStart.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var CreateIterResultObject = require_CreateIterResultObject();
		var IsCallable = require_IsCallable();
		var Type = require_Type2();
		var SLOT = require_internal_slot();
		module.exports = function GeneratorStart(generator, closure) {
			SLOT.assert(generator, "[[GeneratorState]]");
			SLOT.assert(generator, "[[GeneratorContext]]");
			SLOT.assert(generator, "[[GeneratorBrand]]");
			SLOT.assert(generator, "[[Sentinel]]");
			SLOT.assert(generator, "[[CloseIfAbrupt]]");
			if (!IsCallable(closure) || closure.length !== 0) throw new $TypeError("`closure` must be a function that takes no arguments");
			var sentinel = SLOT.get(closure, "[[Sentinel]]");
			if (Type(sentinel) !== "Object") throw new $TypeError("`closure.[[Sentinel]]` must be an object");
			SLOT.set(generator, "[[GeneratorContext]]", function() {
				try {
					var result = closure();
					if (result === sentinel) {
						SLOT.set(generator, "[[GeneratorState]]", "completed");
						SLOT.set(generator, "[[GeneratorContext]]", null);
						return CreateIterResultObject(void 0, true);
					}
					SLOT.set(generator, "[[GeneratorState]]", "suspendedYield");
					return CreateIterResultObject(result, false);
				} catch (e) {
					SLOT.set(generator, "[[GeneratorState]]", "completed");
					SLOT.set(generator, "[[GeneratorContext]]", null);
					throw e;
				}
			});
			SLOT.set(generator, "[[GeneratorState]]", "suspendedStart");
		};
	} });
	var require_forEach = __commonJS({ "node_modules/es-abstract/helpers/forEach.js"(exports, module) {
		"use strict";
		module.exports = function forEach(array, callback) {
			for (var i = 0; i < array.length; i += 1) callback(array[i], i, array);
		};
	} });
	var require_has_proto = __commonJS({ "node_modules/has-proto/index.js"(exports, module) {
		"use strict";
		var test = {
			__proto__: null,
			foo: {}
		};
		var result = { __proto__: test }.foo === test.foo && !(test instanceof Object);
		module.exports = function hasProto() {
			return result;
		};
	} });
	var require_OrdinaryObjectCreate = __commonJS({ "node_modules/es-abstract/2024/OrdinaryObjectCreate.js"(exports, module) {
		"use strict";
		var $ObjectCreate = require_get_intrinsic()("%Object.create%", true);
		var $TypeError = require_type();
		var $SyntaxError = require_syntax();
		var IsArray = require_IsArray2();
		var forEach = require_forEach();
		var isObject = require_isObject();
		var SLOT = require_internal_slot();
		var hasProto = require_has_proto()();
		module.exports = function OrdinaryObjectCreate(proto) {
			if (proto !== null && !isObject(proto)) throw new $TypeError("Assertion failed: `proto` must be null or an object");
			var additionalInternalSlotsList = arguments.length < 2 ? [] : arguments[1];
			if (!IsArray(additionalInternalSlotsList)) throw new $TypeError("Assertion failed: `additionalInternalSlotsList` must be an Array");
			var O;
			if ($ObjectCreate) O = $ObjectCreate(proto);
			else if (hasProto) O = { __proto__: proto };
			else {
				if (proto === null) throw new $SyntaxError("native Object.create support is required to create null objects");
				var T = function T2() {};
				T.prototype = proto;
				O = new T();
			}
			if (additionalInternalSlotsList.length > 0) forEach(additionalInternalSlotsList, function(slot) {
				SLOT.set(O, slot, void 0);
			});
			return O;
		};
	} });
	var require_every = __commonJS({ "node_modules/es-abstract/helpers/every.js"(exports, module) {
		"use strict";
		module.exports = function every(array, predicate) {
			for (var i = 0; i < array.length; i += 1) if (!predicate(array[i], i, array)) return false;
			return true;
		};
	} });
	var require_set_function_length = __commonJS({ "node_modules/set-function-length/index.js"(exports, module) {
		"use strict";
		var GetIntrinsic = require_get_intrinsic();
		var define = require_define_data_property();
		var hasDescriptors = require_has_property_descriptors()();
		var gOPD = require_gopd();
		var $TypeError = require_type();
		var $floor = GetIntrinsic("%Math.floor%");
		module.exports = function setFunctionLength(fn, length) {
			if (typeof fn !== "function") throw new $TypeError("`fn` is not a function");
			if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor(length) !== length) throw new $TypeError("`length` must be a positive 32-bit integer");
			var loose = arguments.length > 2 && !!arguments[2];
			var functionLengthIsConfigurable = true;
			var functionLengthIsWritable = true;
			if ("length" in fn && gOPD) {
				var desc = gOPD(fn, "length");
				if (desc && !desc.configurable) functionLengthIsConfigurable = false;
				if (desc && !desc.writable) functionLengthIsWritable = false;
			}
			if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) if (hasDescriptors) define(
				/** @type {Parameters<define>[0]} */
				fn,
				"length",
				length,
				true,
				true
			);
			else define(
				/** @type {Parameters<define>[0]} */
				fn,
				"length",
				length
			);
			return fn;
		};
	} });
	var require_applyBind = __commonJS({ "node_modules/call-bind-apply-helpers/applyBind.js"(exports, module) {
		"use strict";
		var bind = require_function_bind();
		var $apply = require_functionApply();
		var actualApply = require_actualApply();
		module.exports = function applyBind() {
			return actualApply(bind, $apply, arguments);
		};
	} });
	var require_call_bind = __commonJS({ "node_modules/call-bind/index.js"(exports, module) {
		"use strict";
		var setFunctionLength = require_set_function_length();
		var $defineProperty = require_es_define_property();
		var callBindBasic = require_call_bind_apply_helpers();
		var applyBind = require_applyBind();
		module.exports = function callBind(originalFunction) {
			var func = callBindBasic(arguments);
			var adjustedLength = originalFunction.length - (arguments.length - 1);
			return setFunctionLength(func, 1 + (adjustedLength > 0 ? adjustedLength : 0), true);
		};
		if ($defineProperty) $defineProperty(module.exports, "apply", { value: applyBind });
		else module.exports.apply = applyBind;
	} });
	var require_isarray = __commonJS({ "node_modules/isarray/index.js"(exports, module) {
		var toString = {}.toString;
		module.exports = Array.isArray || function(arr) {
			return toString.call(arr) == "[object Array]";
		};
	} });
	var require_safe_array_concat = __commonJS({ "node_modules/safe-array-concat/index.js"(exports, module) {
		"use strict";
		var $concat = require_get_intrinsic()("%Array.prototype.concat%");
		var callBind = require_call_bind();
		var $slice = require_call_bound()("Array.prototype.slice");
		var isConcatSpreadable = require_shams()() && Symbol.isConcatSpreadable;
		var empty = [];
		var $concatApply = isConcatSpreadable ? callBind.apply($concat, empty) : null;
		var isArray = isConcatSpreadable ? require_isarray() : null;
		module.exports = isConcatSpreadable ? function safeArrayConcat(item) {
			for (var i = 0; i < arguments.length; i += 1) {
				var arg = arguments[i];
				if (arg && typeof arg === "object" && typeof arg[isConcatSpreadable] === "boolean") {
					if (!empty[isConcatSpreadable]) empty[isConcatSpreadable] = true;
					var arr = isArray(arg) ? $slice(arg) : [arg];
					arr[isConcatSpreadable] = true;
					arguments[i] = arr;
				}
			}
			return $concatApply(arguments);
		} : callBind($concat, empty);
	} });
	var require_CreateIteratorFromClosure = __commonJS({ "node_modules/es-iterator-helpers/aos/CreateIteratorFromClosure.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var GeneratorStart = require_GeneratorStart();
		var IsArray = require_IsArray2();
		var IsCallable = require_IsCallable();
		var OrdinaryObjectCreate = require_OrdinaryObjectCreate();
		var every = require_every();
		var SLOT = require_internal_slot();
		var safeConcat = require_safe_array_concat();
		var isString = function isString2(slot) {
			return typeof slot === "string";
		};
		module.exports = function CreateIteratorFromClosure(closure, generatorBrand, proto) {
			if (!IsCallable(closure)) throw new $TypeError("`closure` must be a function");
			if (typeof generatorBrand !== "string") throw new $TypeError("`generatorBrand` must be a string");
			var extraSlots = arguments.length > 3 ? arguments[3] : [];
			if (arguments.length > 3) {
				if (!IsArray(extraSlots) || !every(extraSlots, isString)) throw new $TypeError("`extraSlots` must be a List of String internal slot names");
			}
			var generator = OrdinaryObjectCreate(proto, safeConcat(extraSlots, [
				"[[GeneratorContext]]",
				"[[GeneratorBrand]]",
				"[[GeneratorState]]"
			]));
			SLOT.set(generator, "[[GeneratorBrand]]", generatorBrand);
			SLOT.assert(closure, "[[Sentinel]]");
			SLOT.set(generator, "[[Sentinel]]", SLOT.get(closure, "[[Sentinel]]"));
			SLOT.assert(closure, "[[CloseIfAbrupt]]");
			SLOT.set(generator, "[[CloseIfAbrupt]]", SLOT.get(closure, "[[CloseIfAbrupt]]"));
			GeneratorStart(generator, closure);
			return generator;
		};
	} });
	var require_isLeadingSurrogate = __commonJS({ "node_modules/es-abstract/helpers/isLeadingSurrogate.js"(exports, module) {
		"use strict";
		module.exports = function isLeadingSurrogate(charCode) {
			return typeof charCode === "number" && charCode >= 55296 && charCode <= 56319;
		};
	} });
	var require_isTrailingSurrogate = __commonJS({ "node_modules/es-abstract/helpers/isTrailingSurrogate.js"(exports, module) {
		"use strict";
		module.exports = function isTrailingSurrogate(charCode) {
			return typeof charCode === "number" && charCode >= 56320 && charCode <= 57343;
		};
	} });
	var require_UTF16SurrogatePairToCodePoint = __commonJS({ "node_modules/es-abstract/2024/UTF16SurrogatePairToCodePoint.js"(exports, module) {
		"use strict";
		var GetIntrinsic = require_get_intrinsic();
		var $TypeError = require_type();
		var $fromCharCode = GetIntrinsic("%String.fromCharCode%");
		var isLeadingSurrogate = require_isLeadingSurrogate();
		var isTrailingSurrogate = require_isTrailingSurrogate();
		module.exports = function UTF16SurrogatePairToCodePoint(lead, trail) {
			if (!isLeadingSurrogate(lead) || !isTrailingSurrogate(trail)) throw new $TypeError("Assertion failed: `lead` must be a leading surrogate char code, and `trail` must be a trailing surrogate char code");
			return $fromCharCode(lead) + $fromCharCode(trail);
		};
	} });
	var require_CodePointAt = __commonJS({ "node_modules/es-abstract/2024/CodePointAt.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var callBound = require_call_bound();
		var isLeadingSurrogate = require_isLeadingSurrogate();
		var isTrailingSurrogate = require_isTrailingSurrogate();
		var UTF16SurrogatePairToCodePoint = require_UTF16SurrogatePairToCodePoint();
		var $charAt = callBound("String.prototype.charAt");
		var $charCodeAt = callBound("String.prototype.charCodeAt");
		module.exports = function CodePointAt(string, position) {
			if (typeof string !== "string") throw new $TypeError("Assertion failed: `string` must be a String");
			var size = string.length;
			if (position < 0 || position >= size) throw new $TypeError("Assertion failed: `position` must be >= 0, and < the length of `string`");
			var first = $charCodeAt(string, position);
			var cp = $charAt(string, position);
			var firstIsLeading = isLeadingSurrogate(first);
			var firstIsTrailing = isTrailingSurrogate(first);
			if (!firstIsLeading && !firstIsTrailing) return {
				"[[CodePoint]]": cp,
				"[[CodeUnitCount]]": 1,
				"[[IsUnpairedSurrogate]]": false
			};
			if (firstIsTrailing || position + 1 === size) return {
				"[[CodePoint]]": cp,
				"[[CodeUnitCount]]": 1,
				"[[IsUnpairedSurrogate]]": true
			};
			var second = $charCodeAt(string, position + 1);
			if (!isTrailingSurrogate(second)) return {
				"[[CodePoint]]": cp,
				"[[CodeUnitCount]]": 1,
				"[[IsUnpairedSurrogate]]": true
			};
			return {
				"[[CodePoint]]": UTF16SurrogatePairToCodePoint(first, second),
				"[[CodeUnitCount]]": 2,
				"[[IsUnpairedSurrogate]]": false
			};
		};
	} });
	var require_isFinite = __commonJS({ "node_modules/math-intrinsics/isFinite.js"(exports, module) {
		"use strict";
		var $isNaN = require_isNaN();
		module.exports = function isFinite2(x) {
			return (typeof x === "number" || typeof x === "bigint") && !$isNaN(x) && x !== Infinity && x !== -Infinity;
		};
	} });
	var require_isInteger = __commonJS({ "node_modules/math-intrinsics/isInteger.js"(exports, module) {
		"use strict";
		var $abs = require_abs();
		var $floor = require_floor();
		var $isNaN = require_isNaN();
		var $isFinite = require_isFinite();
		module.exports = function isInteger(argument) {
			if (typeof argument !== "number" || $isNaN(argument) || !$isFinite(argument)) return false;
			var absValue = $abs(argument);
			return $floor(absValue) === absValue;
		};
	} });
	var require_maxSafeInteger = __commonJS({ "node_modules/math-intrinsics/constants/maxSafeInteger.js"(exports, module) {
		"use strict";
		module.exports = Number.MAX_SAFE_INTEGER || 9007199254740991;
	} });
	var require_AdvanceStringIndex = __commonJS({ "node_modules/es-abstract/2024/AdvanceStringIndex.js"(exports, module) {
		"use strict";
		var CodePointAt = require_CodePointAt();
		var $TypeError = require_type();
		var isInteger = require_isInteger();
		var MAX_SAFE_INTEGER = require_maxSafeInteger();
		module.exports = function AdvanceStringIndex(S, index, unicode) {
			if (typeof S !== "string") throw new $TypeError("Assertion failed: `S` must be a String");
			if (!isInteger(index) || index < 0 || index > MAX_SAFE_INTEGER) throw new $TypeError("Assertion failed: `length` must be an integer >= 0 and <= 2**53");
			if (typeof unicode !== "boolean") throw new $TypeError("Assertion failed: `unicode` must be a Boolean");
			if (!unicode) return index + 1;
			var length = S.length;
			if (index + 1 >= length) return index + 1;
			return index + CodePointAt(S, index)["[[CodeUnitCount]]"];
		};
	} });
	var require_shams2 = __commonJS({ "node_modules/has-tostringtag/shams.js"(exports, module) {
		"use strict";
		var hasSymbols = require_shams();
		module.exports = function hasToStringTagShams() {
			return hasSymbols() && !!Symbol.toStringTag;
		};
	} });
	var require_is_string = __commonJS({ "node_modules/is-string/index.js"(exports, module) {
		"use strict";
		var callBound = require_call_bound();
		var $strValueOf = callBound("String.prototype.valueOf");
		var tryStringObject = function tryStringObject2(value) {
			try {
				$strValueOf(value);
				return true;
			} catch (e) {
				return false;
			}
		};
		var $toString = callBound("Object.prototype.toString");
		var strClass = "[object String]";
		var hasToStringTag = require_shams2()();
		module.exports = function isString(value) {
			if (typeof value === "string") return true;
			if (!value || typeof value !== "object") return false;
			return hasToStringTag ? tryStringObject(value) : $toString(value) === strClass;
		};
	} });
	var require_getIteratorMethod = __commonJS({ "node_modules/es-abstract/helpers/getIteratorMethod.js"(exports, module) {
		"use strict";
		var hasSymbols = require_has_symbols()();
		var GetIntrinsic = require_get_intrinsic();
		var callBound = require_call_bound();
		var isString = require_is_string();
		var $iterator = GetIntrinsic("%Symbol.iterator%", true);
		var $stringSlice = callBound("String.prototype.slice");
		var $String = GetIntrinsic("%String%");
		module.exports = function getIteratorMethod(ES, iterable) {
			var usingIterator;
			if (hasSymbols) usingIterator = ES.GetMethod(iterable, $iterator);
			else if (ES.IsArray(iterable)) usingIterator = function() {
				var i = -1;
				var arr = this;
				return { next: function() {
					i += 1;
					return {
						done: i >= arr.length,
						value: arr[i]
					};
				} };
			};
			else if (isString(iterable)) usingIterator = function() {
				var i = 0;
				return { next: function() {
					var nextIndex = ES.AdvanceStringIndex($String(iterable), i, true);
					var value = $stringSlice(iterable, i, nextIndex);
					i = nextIndex;
					return {
						done: nextIndex > iterable.length,
						value
					};
				} };
			};
			return usingIterator;
		};
	} });
	var require_GetIteratorFlattenable = __commonJS({ "node_modules/es-iterator-helpers/aos/GetIteratorFlattenable.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var AdvanceStringIndex = require_AdvanceStringIndex();
		var Call = require_Call();
		var GetIteratorDirect = require_GetIteratorDirect();
		var GetMethod = require_GetMethod();
		var IsArray = require_IsArray2();
		var Type = require_Type2();
		var getIteratorMethod = require_getIteratorMethod();
		module.exports = function GetIteratorFlattenable(obj, stringHandling) {
			if (stringHandling !== "REJECT-STRINGS" && stringHandling !== "ITERATE-STRINGS") throw new $TypeError("Assertion failed: `stringHandling` must be \"REJECT-STRINGS\" or \"ITERATE-STRINGS\"");
			if (Type(obj) !== "Object") {
				if (stringHandling === "REJECT-STRINGS" || typeof obj !== "string") throw new $TypeError("obj must be an Object");
			}
			var method = void 0;
			method = getIteratorMethod({
				AdvanceStringIndex,
				GetMethod,
				IsArray
			}, obj);
			var iterator;
			if (typeof method === "undefined") iterator = obj;
			else iterator = Call(method, obj);
			if (Type(iterator) !== "Object") throw new $TypeError("iterator must be an Object");
			return GetIteratorDirect(iterator);
		};
	} });
	var require_es_set_tostringtag = __commonJS({ "node_modules/es-set-tostringtag/index.js"(exports, module) {
		"use strict";
		var $defineProperty = require_get_intrinsic()("%Object.defineProperty%", true);
		var hasToStringTag = require_shams2()();
		var hasOwn = require_hasown();
		var $TypeError = require_type();
		var toStringTag = hasToStringTag ? Symbol.toStringTag : null;
		module.exports = function setToStringTag(object, value) {
			var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
			var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
			if (typeof overrideIfSet !== "undefined" && typeof overrideIfSet !== "boolean" || typeof nonConfigurable !== "undefined" && typeof nonConfigurable !== "boolean") throw new $TypeError("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
			if (toStringTag && (overrideIfSet || !hasOwn(object, toStringTag))) if ($defineProperty) $defineProperty(object, toStringTag, {
				configurable: !nonConfigurable,
				enumerable: false,
				value,
				writable: false
			});
			else object[toStringTag] = value;
		};
	} });
	var require_GeneratorValidate = __commonJS({ "node_modules/es-iterator-helpers/aos/GeneratorValidate.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var SLOT = require_internal_slot();
		module.exports = function GeneratorValidate(generator, generatorBrand) {
			SLOT.assert(generator, "[[GeneratorState]]");
			SLOT.assert(generator, "[[GeneratorBrand]]");
			var brand = SLOT.get(generator, "[[GeneratorBrand]]");
			if (brand !== generatorBrand) throw new $TypeError("Assertion failed: generator brand is unexpected: " + brand);
			SLOT.assert(generator, "[[GeneratorContext]]");
			var state = SLOT.get(generator, "[[GeneratorState]]");
			if (state === "executing") throw new $TypeError("generator is executing");
			return state;
		};
	} });
	var require_GeneratorResume = __commonJS({ "node_modules/es-iterator-helpers/aos/GeneratorResume.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var CreateIterResultObject = require_CreateIterResultObject();
		var GeneratorValidate = require_GeneratorValidate();
		var SLOT = require_internal_slot();
		module.exports = function GeneratorResume(generator, value, generatorBrand) {
			var state = GeneratorValidate(generator, generatorBrand);
			if (state === "completed") return CreateIterResultObject(void 0, true);
			if (state !== "suspendedStart" && state !== "suspendedYield") throw new $TypeError("Assertion failed: generator state is unexpected: " + state);
			var genContext = SLOT.get(generator, "[[GeneratorContext]]");
			SLOT.set(generator, "[[GeneratorState]]", "executing");
			return genContext(value);
		};
	} });
	var require_GeneratorResumeAbrupt = __commonJS({ "node_modules/es-iterator-helpers/aos/GeneratorResumeAbrupt.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var CompletionRecord = require_CompletionRecord();
		var CreateIterResultObject = require_CreateIterResultObject();
		var GeneratorValidate = require_GeneratorValidate();
		var NormalCompletion = require_NormalCompletion();
		var SLOT = require_internal_slot();
		module.exports = function GeneratorResumeAbrupt(generator, abruptCompletion, generatorBrand) {
			if (!(abruptCompletion instanceof CompletionRecord)) throw new $TypeError("Assertion failed: abruptCompletion must be a Completion Record");
			var state = GeneratorValidate(generator, generatorBrand);
			if (state === "suspendedStart") {
				SLOT.set(generator, "[[GeneratorState]]", "completed");
				SLOT.set(generator, "[[GeneratorContext]]", null);
				state = "completed";
			}
			var value = abruptCompletion.value();
			if (state === "completed") return CreateIterResultObject(value, true);
			if (state !== "suspendedYield") throw new $TypeError("Assertion failed: generator state is unexpected: " + state);
			if (abruptCompletion.type() === "return") return CreateIterResultObject(SLOT.get(generator, "[[CloseIfAbrupt]]")(NormalCompletion(abruptCompletion.value())), true);
			var genContext = SLOT.get(generator, "[[GeneratorContext]]");
			SLOT.set(generator, "[[GeneratorState]]", "executing");
			return genContext(value);
		};
	} });
	var require_IteratorCloseAll = __commonJS({ "node_modules/es-iterator-helpers/aos/IteratorCloseAll.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var CompletionRecord = require_CompletionRecord();
		var IteratorClose = require_IteratorClose();
		var ThrowCompletion = require_ThrowCompletion();
		var IsArray = require_IsArray();
		var every = require_every();
		var isIteratorRecord = require_iterator_record();
		module.exports = function IteratorCloseAll(iters, completion) {
			if (!IsArray(iters) || !every(iters, isIteratorRecord)) throw new $TypeError("Assertion failed: `iters` must be a List of IteratorRecords");
			if (!(completion instanceof CompletionRecord)) throw new $TypeError("Assertion failed: `completion` must be a Completion Record");
			for (var i = iters.length - 1; i >= 0; i -= 1) try {
				IteratorClose(iters[i], completion);
			} catch (e) {
				completion = ThrowCompletion(e);
			}
			return completion["?"]();
		};
	} });
	var require_ReturnCompletion = __commonJS({ "node_modules/es-iterator-helpers/aos/ReturnCompletion.js"(exports, module) {
		"use strict";
		var CompletionRecord = require_CompletionRecord();
		module.exports = function ReturnCompletion(value) {
			return new CompletionRecord("return", value);
		};
	} });
	var require_IteratorHelperPrototype = __commonJS({ "node_modules/es-iterator-helpers/IteratorHelperPrototype/index.js"(exports, module) {
		"use strict";
		var setToStringTag = require_es_set_tostringtag();
		var hasProto = require_has_proto()();
		var iterProto = require_implementation4();
		var SLOT = require_internal_slot();
		var CreateIterResultObject = require_CreateIterResultObject();
		var GeneratorResume = require_GeneratorResume();
		var GeneratorResumeAbrupt = require_GeneratorResumeAbrupt();
		var IteratorCloseAll = require_IteratorCloseAll();
		var ReturnCompletion = require_ReturnCompletion();
		var implementation;
		var o = { "return": function() {
			var O = this;
			SLOT.assert(O, "[[UnderlyingIterators]]");
			SLOT.assert(O, "[[GeneratorState]]");
			if (SLOT.get(O, "[[GeneratorState]]") === "suspendedStart") {
				SLOT.set(O, "[[GeneratorState]]", "completed");
				IteratorCloseAll(SLOT.get(O, "[[UnderlyingIterators]]"), ReturnCompletion(void 0));
				return CreateIterResultObject(void 0, true);
			}
			return GeneratorResumeAbrupt(O, ReturnCompletion(void 0), "Iterator Helper");
		} };
		if (hasProto) {
			implementation = {
				__proto__: iterProto,
				next: function next() {
					return GeneratorResume(this, void 0, "Iterator Helper");
				},
				"return": o["return"]
			};
			setToStringTag(implementation, "Iterator Helper");
		} else {
			IteratorHelper = function IteratorHelper2() {};
			IteratorHelper.prototype = iterProto;
			implementation = new IteratorHelper();
			delete implementation.constructor;
			implementation.next = function next() {
				return GeneratorResume(this, void 0, "Iterator Helper");
			};
			implementation["return"] = o["return"];
		}
		var IteratorHelper;
		module.exports = implementation;
	} });
	var require_implementation5 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.flatMap/implementation.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Call = require_Call();
		var CompletionRecord = require_CompletionRecord();
		var CreateIteratorFromClosure = require_CreateIteratorFromClosure();
		var GetIteratorDirect = require_GetIteratorDirect();
		var GetIteratorFlattenable = require_GetIteratorFlattenable();
		var IsCallable = require_IsCallable();
		var IteratorClose = require_IteratorClose();
		var IteratorStepValue = require_IteratorStepValue();
		var ThrowCompletion = require_ThrowCompletion();
		var Type = require_Type2();
		var iterHelperProto = require_IteratorHelperPrototype();
		var SLOT = require_internal_slot();
		module.exports = function flatMap(mapper) {
			if (this instanceof flatMap) throw new $TypeError("`flatMap` is not a constructor");
			var O = this;
			if (Type(O) !== "Object") throw new $TypeError("`this` value must be an Object");
			if (!IsCallable(mapper)) throw new $TypeError("`mapper` must be a function");
			var iterated = GetIteratorDirect(O);
			var sentinel = { sentinel: true };
			var innerIterator = sentinel;
			var closeIfAbrupt = function(abruptCompletion) {
				if (!(abruptCompletion instanceof CompletionRecord)) throw new $TypeError("`abruptCompletion` must be a Completion Record");
				try {
					if (innerIterator !== sentinel) IteratorClose(innerIterator, abruptCompletion);
				} finally {
					innerIterator = sentinel;
					IteratorClose(iterated, abruptCompletion);
				}
			};
			var counter = 0;
			var innerAlive = false;
			var closure = function() {
				if (innerIterator === sentinel) {
					var value = IteratorStepValue(iterated);
					if (iterated["[[Done]]"]) {
						innerAlive = false;
						innerIterator = sentinel;
						return sentinel;
					}
				}
				if (innerIterator === sentinel) {
					innerAlive = true;
					try {
						innerIterator = GetIteratorFlattenable(Call(mapper, void 0, [value, counter]), "REJECT-STRINGS");
					} catch (e) {
						innerAlive = false;
						innerIterator = sentinel;
						closeIfAbrupt(ThrowCompletion(e));
					} finally {
						counter += 1;
					}
				}
				if (innerAlive) {
					var innerValue;
					try {
						innerValue = IteratorStepValue(innerIterator);
					} catch (e) {
						innerAlive = false;
						innerIterator = sentinel;
						closeIfAbrupt(ThrowCompletion(e));
					}
					if (innerIterator["[[Done]]"]) {
						innerAlive = false;
						innerIterator = sentinel;
						return closure();
					}
					return innerValue;
				}
				return sentinel;
			};
			SLOT.set(closure, "[[Sentinel]]", sentinel);
			SLOT.set(closure, "[[CloseIfAbrupt]]", closeIfAbrupt);
			var result = CreateIteratorFromClosure(closure, "Iterator Helper", iterHelperProto, ["[[UnderlyingIterators]]"]);
			SLOT.set(result, "[[UnderlyingIterators]]", [iterated]);
			return result;
		};
	} });
	var require_polyfill2 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.flatMap/polyfill.js"(exports, module) {
		"use strict";
		var implementation = require_implementation5();
		module.exports = function getPolyfill() {
			if (typeof Iterator === "function" && typeof Iterator.prototype.flatMap === "function") try {
				Iterator.prototype.flatMap.call({ next: null }, function() {}).next();
			} catch (e) {
				return Iterator.prototype.flatMap;
			}
			return implementation;
		};
	} });
	var require_shim2 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.flatMap/shim.js"(exports, module) {
		"use strict";
		var define = require_define_properties();
		var getPolyfill = require_polyfill2();
		var $IteratorPrototype = require_implementation4();
		module.exports = function shimIteratorPrototypeFlatMap() {
			var polyfill = getPolyfill();
			define($IteratorPrototype, { flatMap: polyfill }, { flatMap: function() {
				return $IteratorPrototype.flatMap !== polyfill;
			} });
			return polyfill;
		};
	} });
	var require_implementation6 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.map/implementation.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Call = require_Call();
		var CompletionRecord = require_CompletionRecord();
		var CreateIteratorFromClosure = require_CreateIteratorFromClosure();
		var GetIteratorDirect = require_GetIteratorDirect();
		var IsCallable = require_IsCallable();
		var IteratorClose = require_IteratorClose();
		var IteratorStepValue = require_IteratorStepValue();
		var ThrowCompletion = require_ThrowCompletion();
		var Type = require_Type2();
		var iterHelperProto = require_IteratorHelperPrototype();
		var SLOT = require_internal_slot();
		module.exports = function map(mapper) {
			if (this instanceof map) throw new $TypeError("`map` is not a constructor");
			var O = this;
			if (Type(O) !== "Object") throw new $TypeError("`this` value must be an Object");
			if (!IsCallable(mapper)) throw new $TypeError("`mapper` must be a function");
			var iterated = GetIteratorDirect(O);
			var closeIfAbrupt = function(abruptCompletion) {
				if (!(abruptCompletion instanceof CompletionRecord)) throw new $TypeError("`abruptCompletion` must be a Completion Record");
				IteratorClose(iterated, abruptCompletion);
			};
			var sentinel = {};
			var counter = 0;
			var closure = function() {
				var value = IteratorStepValue(iterated);
				if (iterated["[[Done]]"]) return sentinel;
				var mapped;
				try {
					mapped = Call(mapper, void 0, [value, counter]);
					return mapped;
				} catch (e) {
					closeIfAbrupt(ThrowCompletion(e));
					throw e;
				} finally {
					counter += 1;
				}
			};
			SLOT.set(closure, "[[Sentinel]]", sentinel);
			SLOT.set(closure, "[[CloseIfAbrupt]]", closeIfAbrupt);
			var result = CreateIteratorFromClosure(closure, "Iterator Helper", iterHelperProto, ["[[UnderlyingIterators]]"]);
			SLOT.set(result, "[[UnderlyingIterators]]", [iterated]);
			return result;
		};
	} });
	var require_polyfill3 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.map/polyfill.js"(exports, module) {
		"use strict";
		var implementation = require_implementation6();
		module.exports = function getPolyfill() {
			if (typeof Iterator === "function" && typeof Iterator.prototype.map === "function") try {
				Iterator.prototype.map.call({ next: null }, function() {}).next();
			} catch (e) {
				return Iterator.prototype.map;
			}
			return implementation;
		};
	} });
	var require_shim3 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.map/shim.js"(exports, module) {
		"use strict";
		var define = require_define_properties();
		var getPolyfill = require_polyfill3();
		var $IteratorPrototype = require_implementation4();
		module.exports = function shimIteratorPrototypeMap() {
			var polyfill = getPolyfill();
			define($IteratorPrototype, { map: polyfill }, { map: function() {
				return $IteratorPrototype.map !== polyfill;
			} });
			return polyfill;
		};
	} });
	var require_implementation7 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.reduce/implementation.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var Call = require_Call();
		var GetIteratorDirect = require_GetIteratorDirect();
		var IsCallable = require_IsCallable();
		var IteratorClose = require_IteratorClose();
		var IteratorStepValue = require_IteratorStepValue();
		var ThrowCompletion = require_ThrowCompletion();
		var Type = require_Type2();
		module.exports = function reduce(reducer) {
			if (this instanceof reduce) throw new $TypeError("`reduce` is not a constructor");
			var O = this;
			if (Type(O) !== "Object") throw new $TypeError("`this` value must be an Object");
			if (!IsCallable(reducer)) throw new $TypeError("`reducer` must be a function");
			var iterated = GetIteratorDirect(O);
			var accumulator;
			var counter;
			if (arguments.length < 2) {
				accumulator = IteratorStepValue(iterated);
				if (iterated["[[Done]]"]) throw new $TypeError("Reduce of empty iterator with no initial value");
				counter = 1;
			} else {
				accumulator = arguments[1];
				counter = 0;
			}
			while (true) {
				var value = IteratorStepValue(iterated);
				if (iterated["[[Done]]"]) return accumulator;
				try {
					accumulator = Call(reducer, void 0, [
						accumulator,
						value,
						counter
					]);
				} catch (e) {
					IteratorClose(iterated, ThrowCompletion(e));
				}
				counter += 1;
			}
		};
	} });
	var require_polyfill4 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.reduce/polyfill.js"(exports, module) {
		"use strict";
		var implementation = require_implementation7();
		module.exports = function getPolyfill() {
			return typeof Iterator === "function" && typeof Iterator.prototype.reduce === "function" ? Iterator.prototype.reduce : implementation;
		};
	} });
	var require_shim4 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.reduce/shim.js"(exports, module) {
		"use strict";
		var define = require_define_properties();
		var getPolyfill = require_polyfill4();
		var $IteratorPrototype = require_implementation4();
		module.exports = function shimIteratorPrototypeReduce() {
			var polyfill = getPolyfill();
			define($IteratorPrototype, { reduce: polyfill }, { reduce: function() {
				return $IteratorPrototype.reduce !== polyfill;
			} });
			return polyfill;
		};
	} });
	var require_implementation8 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.toArray/implementation.js"(exports, module) {
		"use strict";
		var $TypeError = require_type();
		var GetIteratorDirect = require_GetIteratorDirect();
		var IteratorStepValue = require_IteratorStepValue();
		var Type = require_Type2();
		module.exports = function toArray() {
			if (this instanceof toArray) throw new $TypeError("`toArray` is not a constructor");
			var O = this;
			if (Type(O) !== "Object") throw new $TypeError("`this` value must be an Object");
			var iterated = GetIteratorDirect(O);
			var items = [];
			while (true) {
				var value = IteratorStepValue(iterated);
				if (iterated["[[Done]]"]) return items;
				items[items.length] = value;
			}
		};
	} });
	var require_polyfill5 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.toArray/polyfill.js"(exports, module) {
		"use strict";
		var implementation = require_implementation8();
		module.exports = function getPolyfill() {
			return typeof Iterator === "function" && typeof Iterator.prototype.toArray === "function" ? Iterator.prototype.toArray : implementation;
		};
	} });
	var require_shim5 = __commonJS({ "node_modules/es-iterator-helpers/Iterator.prototype.toArray/shim.js"(exports, module) {
		"use strict";
		var define = require_define_properties();
		var getPolyfill = require_polyfill5();
		var $IteratorPrototype = require_implementation4();
		module.exports = function shimIteratorPrototypeToArray() {
			var polyfill = getPolyfill();
			define($IteratorPrototype, { toArray: polyfill }, { toArray: function() {
				return $IteratorPrototype.toArray !== polyfill;
			} });
			return polyfill;
		};
	} });
	require_shim()();
	require_shim2()();
	require_shim3()();
	require_shim4()();
	require_shim5()();
})();
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/insights/types.js
var InsightWarning;
(function(InsightWarning) {
	InsightWarning["NO_FP"] = "NO_FP";
	InsightWarning["NO_LCP"] = "NO_LCP";
	InsightWarning["NO_DOCUMENT_REQUEST"] = "NO_DOCUMENT_REQUEST";
	InsightWarning["NO_LAYOUT"] = "NO_LAYOUT";
})(InsightWarning || (InsightWarning = {}));
var InsightCategory;
(function(InsightCategory) {
	InsightCategory["ALL"] = "All";
	InsightCategory["INP"] = "INP";
	InsightCategory["LCP"] = "LCP";
	InsightCategory["CLS"] = "CLS";
})(InsightCategory || (InsightCategory = {}));
var InsightKeys;
(function(InsightKeys) {
	InsightKeys["LCP_BREAKDOWN"] = "LCPBreakdown";
	InsightKeys["INP_BREAKDOWN"] = "INPBreakdown";
	InsightKeys["CLS_CULPRITS"] = "CLSCulprits";
	InsightKeys["THIRD_PARTIES"] = "ThirdParties";
	InsightKeys["DOCUMENT_LATENCY"] = "DocumentLatency";
	InsightKeys["DOM_SIZE"] = "DOMSize";
	InsightKeys["DUPLICATE_JAVASCRIPT"] = "DuplicatedJavaScript";
	InsightKeys["FONT_DISPLAY"] = "FontDisplay";
	InsightKeys["FORCED_REFLOW"] = "ForcedReflow";
	InsightKeys["IMAGE_DELIVERY"] = "ImageDelivery";
	InsightKeys["LCP_DISCOVERY"] = "LCPDiscovery";
	InsightKeys["LEGACY_JAVASCRIPT"] = "LegacyJavaScript";
	InsightKeys["NETWORK_DEPENDENCY_TREE"] = "NetworkDependencyTree";
	InsightKeys["RENDER_BLOCKING"] = "RenderBlocking";
	InsightKeys["SLOW_CSS_SELECTOR"] = "SlowCSSSelector";
	InsightKeys["VIEWPORT"] = "Viewport";
	InsightKeys["MODERN_HTTP"] = "ModernHTTP";
})(InsightKeys || (InsightKeys = {}));
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/insights/CLSCulprits.js
var AnimationFailureReasons;
(function(AnimationFailureReasons) {
	AnimationFailureReasons["ACCELERATED_ANIMATIONS_DISABLED"] = "ACCELERATED_ANIMATIONS_DISABLED";
	AnimationFailureReasons["EFFECT_SUPPRESSED_BY_DEVTOOLS"] = "EFFECT_SUPPRESSED_BY_DEVTOOLS";
	AnimationFailureReasons["INVALID_ANIMATION_OR_EFFECT"] = "INVALID_ANIMATION_OR_EFFECT";
	AnimationFailureReasons["EFFECT_HAS_UNSUPPORTED_TIMING_PARAMS"] = "EFFECT_HAS_UNSUPPORTED_TIMING_PARAMS";
	AnimationFailureReasons["EFFECT_HAS_NON_REPLACE_COMPOSITE_MODE"] = "EFFECT_HAS_NON_REPLACE_COMPOSITE_MODE";
	AnimationFailureReasons["TARGET_HAS_INVALID_COMPOSITING_STATE"] = "TARGET_HAS_INVALID_COMPOSITING_STATE";
	AnimationFailureReasons["TARGET_HAS_INCOMPATIBLE_ANIMATIONS"] = "TARGET_HAS_INCOMPATIBLE_ANIMATIONS";
	AnimationFailureReasons["TARGET_HAS_CSS_OFFSET"] = "TARGET_HAS_CSS_OFFSET";
	AnimationFailureReasons["ANIMATION_AFFECTS_NON_CSS_PROPERTIES"] = "ANIMATION_AFFECTS_NON_CSS_PROPERTIES";
	AnimationFailureReasons["TRANSFORM_RELATED_PROPERTY_CANNOT_BE_ACCELERATED_ON_TARGET"] = "TRANSFORM_RELATED_PROPERTY_CANNOT_BE_ACCELERATED_ON_TARGET";
	AnimationFailureReasons["TRANSFROM_BOX_SIZE_DEPENDENT"] = "TRANSFROM_BOX_SIZE_DEPENDENT";
	AnimationFailureReasons["FILTER_RELATED_PROPERTY_MAY_MOVE_PIXELS"] = "FILTER_RELATED_PROPERTY_MAY_MOVE_PIXELS";
	AnimationFailureReasons["UNSUPPORTED_CSS_PROPERTY"] = "UNSUPPORTED_CSS_PROPERTY";
	AnimationFailureReasons["MIXED_KEYFRAME_VALUE_TYPES"] = "MIXED_KEYFRAME_VALUE_TYPES";
	AnimationFailureReasons["TIMELINE_SOURCE_HAS_INVALID_COMPOSITING_STATE"] = "TIMELINE_SOURCE_HAS_INVALID_COMPOSITING_STATE";
	AnimationFailureReasons["ANIMATION_HAS_NO_VISIBLE_CHANGE"] = "ANIMATION_HAS_NO_VISIBLE_CHANGE";
	AnimationFailureReasons["AFFECTS_IMPORTANT_PROPERTY"] = "AFFECTS_IMPORTANT_PROPERTY";
	AnimationFailureReasons["SVG_TARGET_HAS_INDEPENDENT_TRANSFORM_PROPERTY"] = "SVG_TARGET_HAS_INDEPENDENT_TRANSFORM_PROPERTY";
})(AnimationFailureReasons || (AnimationFailureReasons = {}));
var LayoutShiftType;
(function(LayoutShiftType) {
	LayoutShiftType[LayoutShiftType["WEB_FONT"] = 0] = "WEB_FONT";
	LayoutShiftType[LayoutShiftType["IFRAMES"] = 1] = "IFRAMES";
	LayoutShiftType[LayoutShiftType["ANIMATIONS"] = 2] = "ANIMATIONS";
	LayoutShiftType[LayoutShiftType["UNSIZED_IMAGE"] = 3] = "UNSIZED_IMAGE";
})(LayoutShiftType || (LayoutShiftType = {}));
AnimationFailureReasons.ACCELERATED_ANIMATIONS_DISABLED, AnimationFailureReasons.EFFECT_SUPPRESSED_BY_DEVTOOLS, AnimationFailureReasons.INVALID_ANIMATION_OR_EFFECT, AnimationFailureReasons.EFFECT_HAS_UNSUPPORTED_TIMING_PARAMS, AnimationFailureReasons.EFFECT_HAS_NON_REPLACE_COMPOSITE_MODE, AnimationFailureReasons.TARGET_HAS_INVALID_COMPOSITING_STATE, AnimationFailureReasons.TARGET_HAS_INCOMPATIBLE_ANIMATIONS, AnimationFailureReasons.TARGET_HAS_CSS_OFFSET, AnimationFailureReasons.ANIMATION_AFFECTS_NON_CSS_PROPERTIES, AnimationFailureReasons.TRANSFORM_RELATED_PROPERTY_CANNOT_BE_ACCELERATED_ON_TARGET, AnimationFailureReasons.TRANSFROM_BOX_SIZE_DEPENDENT, AnimationFailureReasons.FILTER_RELATED_PROPERTY_MAY_MOVE_PIXELS, AnimationFailureReasons.UNSUPPORTED_CSS_PROPERTY, AnimationFailureReasons.MIXED_KEYFRAME_VALUE_TYPES, AnimationFailureReasons.TIMELINE_SOURCE_HAS_INVALID_COMPOSITING_STATE, AnimationFailureReasons.ANIMATION_HAS_NO_VISIBLE_CHANGE, AnimationFailureReasons.AFFECTS_IMPORTANT_PROPERTY, AnimationFailureReasons.SVG_TARGET_HAS_INDEPENDENT_TRANSFORM_PROPERTY;
secondsToMicro(Seconds(.5));
milliToMicro(Milli(40));
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/insights/ImageDelivery.js
var ImageOptimizationType;
(function(ImageOptimizationType) {
	ImageOptimizationType["ADJUST_COMPRESSION"] = "ADJUST_COMPRESSION";
	ImageOptimizationType["MODERN_FORMAT_OR_COMPRESSION"] = "MODERN_FORMAT_OR_COMPRESSION";
	ImageOptimizationType["VIDEO_FORMAT"] = "VIDEO_FORMAT";
	ImageOptimizationType["RESPONSIVE_SIZE"] = "RESPONSIVE_SIZE";
})(ImageOptimizationType || (ImageOptimizationType = {}));
//#endregion
//#region node_modules/legacy-javascript/legacy-javascript.js
var legacy_javascript_exports = /* @__PURE__ */ __exportAll({
	detectLegacyJavaScript: () => detectLegacyJavaScript$1,
	getCoreJsPolyfillData: () => getCoreJsPolyfillData,
	getTransformPatterns: () => getTransformPatterns
});
var polyfill_module_data_default = [
	{
		name: "focus-visible",
		modules: ["focus-visible"]
	},
	{
		name: "Error.prototype.cause",
		modules: ["es.error.cause"]
	},
	{
		name: "Array.prototype.at",
		modules: ["es.array.at", "esnext.array.at"],
		corejs: true
	},
	{
		name: "Array.prototype.concat",
		modules: ["es.array.concat"],
		corejs: true
	},
	{
		name: "Array.prototype.copyWithin",
		modules: ["es.array.copy-within"],
		corejs: true
	},
	{
		name: "Array.prototype.every",
		modules: ["es.array.every"],
		corejs: true
	},
	{
		name: "Array.prototype.fill",
		modules: ["es.array.fill"],
		corejs: true
	},
	{
		name: "Array.prototype.filter",
		modules: ["es.array.filter"],
		corejs: true
	},
	{
		name: "Array.prototype.find",
		modules: ["es.array.find"],
		corejs: true
	},
	{
		name: "Array.prototype.findIndex",
		modules: ["es.array.find-index"],
		corejs: true
	},
	{
		name: "Array.prototype.findLast",
		modules: ["es.array.find-last", "esnext.array.find-last"],
		corejs: true
	},
	{
		name: "Array.prototype.findLastIndex",
		modules: ["es.array.find-last-index", "esnext.array.find-last-index"],
		corejs: true
	},
	{
		name: "Array.prototype.flat",
		modules: ["es.array.flat"],
		corejs: true
	},
	{
		name: "Array.prototype.flatMap",
		modules: ["es.array.flat-map"],
		corejs: true
	},
	{
		name: "Array.prototype.forEach",
		modules: ["es.array.for-each"],
		corejs: true
	},
	{
		name: "Array.from",
		modules: ["es.array.from"],
		corejs: true
	},
	{
		name: "Array.prototype.includes",
		modules: ["es.array.includes"],
		corejs: true
	},
	{
		name: "Array.prototype.indexOf",
		modules: ["es.array.index-of"],
		corejs: true
	},
	{
		name: "Array.isArray",
		modules: ["es.array.is-array"],
		corejs: true
	},
	{
		name: "Array.prototype.join",
		modules: ["es.array.join"],
		corejs: true
	},
	{
		name: "Array.prototype.map",
		modules: ["es.array.map"],
		corejs: true
	},
	{
		name: "Array.of",
		modules: ["es.array.of"],
		corejs: true
	},
	{
		name: "Array.prototype.slice",
		modules: ["es.array.slice"],
		corejs: true
	},
	{
		name: "Array.prototype.some",
		modules: ["es.array.some"],
		corejs: true
	},
	{
		name: "Array.prototype.sort",
		modules: ["es.array.sort"],
		corejs: true
	},
	{
		name: "Array.prototype.unshift",
		modules: ["es.array.unshift"],
		corejs: true
	},
	{
		name: "Math.acosh",
		modules: ["es.math.acosh"],
		corejs: true
	},
	{
		name: "Math.asinh",
		modules: ["es.math.asinh"],
		corejs: true
	},
	{
		name: "Math.atanh",
		modules: ["es.math.atanh"],
		corejs: true
	},
	{
		name: "Math.cbrt",
		modules: ["es.math.cbrt"],
		corejs: true
	},
	{
		name: "Math.clz32",
		modules: ["es.math.clz32"],
		corejs: true
	},
	{
		name: "Math.cosh",
		modules: ["es.math.cosh"],
		corejs: true
	},
	{
		name: "Math.expm1",
		modules: ["es.math.expm1"],
		corejs: true
	},
	{
		name: "Math.fround",
		modules: ["es.math.fround"],
		corejs: true
	},
	{
		name: "Math.hypot",
		modules: ["es.math.hypot"],
		corejs: true
	},
	{
		name: "Math.imul",
		modules: ["es.math.imul"],
		corejs: true
	},
	{
		name: "Math.log10",
		modules: ["es.math.log10"],
		corejs: true
	},
	{
		name: "Math.log1p",
		modules: ["es.math.log1p"],
		corejs: true
	},
	{
		name: "Math.log2",
		modules: ["es.math.log2"],
		corejs: true
	},
	{
		name: "Math.sign",
		modules: ["es.math.sign"],
		corejs: true
	},
	{
		name: "Math.sinh",
		modules: ["es.math.sinh"],
		corejs: true
	},
	{
		name: "Math.tanh",
		modules: ["es.math.tanh"],
		corejs: true
	},
	{
		name: "Math.trunc",
		modules: ["es.math.trunc"],
		corejs: true
	},
	{
		name: "Object.assign",
		modules: ["es.object.assign"],
		corejs: true
	},
	{
		name: "Object.create",
		modules: ["es.object.create"],
		corejs: true
	},
	{
		name: "Object.entries",
		modules: ["es.object.entries"],
		corejs: true
	},
	{
		name: "Object.freeze",
		modules: ["es.object.freeze"],
		corejs: true
	},
	{
		name: "Object.fromEntries",
		modules: ["es.object.from-entries"],
		corejs: true
	},
	{
		name: "Object.getOwnPropertyDescriptor",
		modules: ["es.object.get-own-property-descriptor"],
		corejs: true
	},
	{
		name: "Object.getOwnPropertyDescriptors",
		modules: ["es.object.get-own-property-descriptors"],
		corejs: true
	},
	{
		name: "Object.getPrototypeOf",
		modules: ["es.object.get-prototype-of"],
		corejs: true
	},
	{
		name: "Object.hasOwn",
		modules: ["es.object.has-own", "esnext.object.has-own"],
		corejs: true
	},
	{
		name: "Object.is",
		modules: ["es.object.is"],
		corejs: true
	},
	{
		name: "Object.isExtensible",
		modules: ["es.object.is-extensible"],
		corejs: true
	},
	{
		name: "Object.isFrozen",
		modules: ["es.object.is-frozen"],
		corejs: true
	},
	{
		name: "Object.isSealed",
		modules: ["es.object.is-sealed"],
		corejs: true
	},
	{
		name: "Object.keys",
		modules: ["es.object.keys"],
		corejs: true
	},
	{
		name: "Object.preventExtensions",
		modules: ["es.object.prevent-extensions"],
		corejs: true
	},
	{
		name: "Object.seal",
		modules: ["es.object.seal"],
		corejs: true
	},
	{
		name: "Object.setPrototypeOf",
		modules: ["es.object.set-prototype-of"],
		corejs: true
	},
	{
		name: "Object.values",
		modules: ["es.object.values"],
		corejs: true
	},
	{
		name: "Promise.any",
		modules: ["es.promise.any", "esnext.promise.any"],
		corejs: true
	},
	{
		name: "Reflect.apply",
		modules: ["es.reflect.apply"],
		corejs: true
	},
	{
		name: "Reflect.construct",
		modules: ["es.reflect.construct"],
		corejs: true
	},
	{
		name: "Reflect.deleteProperty",
		modules: ["es.reflect.delete-property"],
		corejs: true
	},
	{
		name: "Reflect.get",
		modules: ["es.reflect.get"],
		corejs: true
	},
	{
		name: "Reflect.getOwnPropertyDescriptor",
		modules: ["es.reflect.get-own-property-descriptor"],
		corejs: true
	},
	{
		name: "Reflect.getPrototypeOf",
		modules: ["es.reflect.get-prototype-of"],
		corejs: true
	},
	{
		name: "Reflect.has",
		modules: ["es.reflect.has"],
		corejs: true
	},
	{
		name: "Reflect.isExtensible",
		modules: ["es.reflect.is-extensible"],
		corejs: true
	},
	{
		name: "Reflect.ownKeys",
		modules: ["es.reflect.own-keys"],
		corejs: true
	},
	{
		name: "Reflect.preventExtensions",
		modules: ["es.reflect.prevent-extensions"],
		corejs: true
	},
	{
		name: "Reflect.setPrototypeOf",
		modules: ["es.reflect.set-prototype-of"],
		corejs: true
	},
	{
		name: "String.prototype.codePointAt",
		modules: ["es.string.code-point-at"],
		corejs: true
	},
	{
		name: "String.prototype.endsWith",
		modules: ["es.string.ends-with"],
		corejs: true
	},
	{
		name: "String.fromCodePoint",
		modules: ["es.string.from-code-point"],
		corejs: true
	},
	{
		name: "String.prototype.includes",
		modules: ["es.string.includes"],
		corejs: true
	},
	{
		name: "String.prototype.matchAll",
		modules: ["es.string.match-all", "esnext.string.match-all"],
		corejs: true
	},
	{
		name: "String.raw",
		modules: ["es.string.raw"],
		corejs: true
	},
	{
		name: "String.prototype.repeat",
		modules: ["es.string.repeat"],
		corejs: true
	},
	{
		name: "String.prototype.replaceAll",
		modules: ["es.string.replace-all", "esnext.string.replace-all"],
		corejs: true
	},
	{
		name: "String.prototype.startsWith",
		modules: ["es.string.starts-with"],
		corejs: true
	},
	{
		name: "String.prototype.substr",
		modules: ["es.string.substr"],
		corejs: true
	},
	{
		name: "String.prototype.trim",
		modules: ["es.string.trim"],
		corejs: true
	},
	{
		name: "String.prototype.trimEnd",
		modules: ["es.string.trim-end"],
		corejs: true
	},
	{
		name: "String.prototype.trimStart",
		modules: ["es.string.trim-start"],
		corejs: true
	},
	{
		name: "String.prototype.link",
		modules: ["es.string.link"],
		corejs: true
	},
	{
		name: "Promise.allSettled",
		modules: ["esnext.promise.all-settled"],
		corejs: true
	}
];
var polyfill_graph_data_default = {
	moduleSizes: [
		26070,
		498,
		282,
		294,
		281,
		467,
		161,
		236,
		229,
		765,
		546,
		339,
		1608,
		723,
		729,
		1545,
		438,
		214,
		657,
		111,
		759,
		537,
		209,
		281,
		685,
		217,
		757,
		631,
		293,
		182,
		475,
		79,
		407,
		140,
		366,
		792,
		269,
		222,
		158,
		280,
		188,
		137,
		158,
		105,
		189,
		543,
		160,
		742,
		1436,
		88,
		904,
		146,
		314,
		375,
		183,
		1083,
		195,
		503,
		269,
		208,
		334,
		350,
		460,
		568,
		229,
		1155,
		334,
		266,
		30,
		120,
		309,
		370,
		358,
		1952,
		1638,
		304,
		153,
		274,
		1288,
		192,
		543,
		74,
		144,
		137,
		33,
		336,
		457,
		2122,
		535,
		711,
		1323,
		117,
		1961,
		244,
		557,
		318,
		119,
		124,
		108,
		144,
		96,
		133,
		441,
		210,
		1627,
		1956,
		693,
		1426,
		863,
		637,
		301,
		51,
		708,
		583,
		119,
		600,
		221,
		370,
		728,
		1085,
		552,
		629,
		125,
		1746,
		97,
		441,
		543,
		2756,
		371,
		447,
		548,
		243,
		266,
		217,
		99,
		440,
		183,
		546,
		137,
		464,
		207,
		983,
		503,
		237,
		382,
		249,
		675,
		402,
		254,
		223,
		164,
		214,
		191,
		831,
		218,
		202,
		232,
		124,
		249,
		160,
		251,
		217,
		717,
		78,
		561,
		1627,
		256,
		386,
		225,
		432,
		499,
		394,
		364,
		445,
		634,
		667,
		177,
		346,
		470,
		663,
		142,
		588,
		414,
		617,
		1559,
		380,
		2520,
		1040,
		417,
		289,
		238,
		220,
		214,
		303,
		163,
		141,
		510,
		397,
		137,
		137,
		133,
		133,
		390,
		266,
		137,
		183,
		215,
		191,
		485,
		328,
		575,
		799,
		533,
		148,
		215,
		589,
		589,
		130,
		362,
		562,
		471,
		179,
		186,
		1266,
		1456,
		521,
		1536,
		427,
		444,
		406,
		912,
		150,
		283,
		144,
		485,
		470,
		205,
		1268,
		796,
		658,
		306,
		3751,
		814,
		146,
		2328,
		1226,
		922,
		237,
		206,
		198,
		250,
		283,
		60,
		3e3
	],
	dependencies: {
		"Array.prototype.at": [
			0,
			5,
			69,
			105,
			106,
			116,
			164
		],
		"Array.prototype.concat": [
			0,
			16,
			21,
			22,
			26,
			34,
			40,
			76,
			78,
			155,
			165
		],
		"Array.prototype.copyWithin": [
			0,
			5,
			9,
			37,
			69,
			105,
			106,
			116,
			166
		],
		"Array.prototype.every": [
			0,
			15,
			17,
			21,
			22,
			26,
			53,
			59,
			76,
			78,
			155,
			167
		],
		"Array.prototype.fill": [
			0,
			5,
			10,
			69,
			105,
			106,
			116,
			168
		],
		"Array.prototype.filter": [
			0,
			15,
			16,
			21,
			22,
			26,
			53,
			59,
			76,
			78,
			155,
			169
		],
		"Array.prototype.find": [
			0,
			5,
			15,
			21,
			22,
			26,
			53,
			59,
			69,
			76,
			78,
			105,
			106,
			116,
			155,
			173
		],
		"Array.prototype.findIndex": [
			0,
			5,
			15,
			21,
			22,
			26,
			53,
			59,
			69,
			76,
			78,
			105,
			106,
			116,
			155,
			170
		],
		"Array.prototype.findLast": [
			0,
			5,
			14,
			53,
			59,
			69,
			105,
			106,
			116,
			172
		],
		"Array.prototype.findLastIndex": [
			0,
			5,
			14,
			53,
			59,
			69,
			105,
			106,
			116,
			171
		],
		"Array.prototype.flat": [
			0,
			21,
			22,
			26,
			40,
			50,
			53,
			59,
			76,
			78,
			155,
			175
		],
		"Array.prototype.flatMap": [
			0,
			21,
			22,
			26,
			40,
			50,
			53,
			59,
			76,
			78,
			155,
			174
		],
		"Array.prototype.forEach": [
			0,
			11,
			15,
			17,
			21,
			22,
			26,
			53,
			59,
			76,
			78,
			155,
			176
		],
		"Array.from": [
			0,
			12,
			23,
			24,
			26,
			34,
			53,
			59,
			62,
			63,
			75,
			78,
			88,
			155,
			177
		],
		"Array.prototype.includes": [
			0,
			5,
			69,
			105,
			106,
			116,
			178
		],
		"Array.prototype.indexOf": [
			0,
			17,
			59,
			179
		],
		"Array.isArray": [
			0,
			76,
			180
		],
		"Array.prototype.join": [
			0,
			17,
			181
		],
		"Array.prototype.map": [
			0,
			15,
			16,
			21,
			22,
			26,
			53,
			59,
			76,
			78,
			155,
			182
		],
		"Array.of": [
			0,
			26,
			34,
			78,
			155,
			183
		],
		"Array.prototype.slice": [
			0,
			16,
			19,
			26,
			34,
			76,
			78,
			155,
			184
		],
		"Array.prototype.some": [
			0,
			15,
			17,
			21,
			22,
			26,
			53,
			59,
			76,
			78,
			155,
			185
		],
		"Array.prototype.sort": [
			0,
			17,
			19,
			20,
			26,
			37,
			42,
			43,
			46,
			155,
			156,
			186
		],
		"Array.prototype.unshift": [
			0,
			18,
			37,
			40,
			76,
			187
		],
		"Math.acosh": [
			0,
			97,
			188
		],
		"Math.asinh": [0, 189],
		"Math.atanh": [0, 190],
		"Math.cbrt": [
			0,
			100,
			191
		],
		"Math.clz32": [0, 192],
		"Math.cosh": [
			0,
			93,
			193
		],
		"Math.expm1": [
			0,
			93,
			194
		],
		"Math.fround": [
			0,
			94,
			95,
			99,
			100,
			195
		],
		"Math.hypot": [0, 196],
		"Math.imul": [0, 197],
		"Math.log10": [
			0,
			96,
			198
		],
		"Math.log1p": [
			0,
			97,
			199
		],
		"Math.log2": [
			0,
			98,
			200
		],
		"Math.sign": [
			0,
			100,
			201
		],
		"Math.sinh": [
			0,
			93,
			202
		],
		"Math.tanh": [
			0,
			93,
			203
		],
		"Math.trunc": [0, 204],
		"Object.assign": [
			0,
			104,
			116,
			205
		],
		"Object.create": [
			0,
			69,
			105,
			106,
			116,
			206
		],
		"Object.entries": [
			0,
			29,
			112,
			116,
			119,
			207
		],
		"Object.freeze": [
			0,
			8,
			19,
			51,
			73,
			109,
			113,
			208
		],
		"Object.fromEntries": [
			0,
			26,
			34,
			53,
			59,
			62,
			63,
			75,
			87,
			88,
			155,
			209
		],
		"Object.getOwnPropertyDescriptor": [0, 210],
		"Object.getOwnPropertyDescriptors": [
			0,
			34,
			211
		],
		"Object.getPrototypeOf": [
			0,
			29,
			112,
			212
		],
		"Object.hasOwn": [0, 213],
		"Object.is": [
			0,
			134,
			217
		],
		"Object.isExtensible": [
			0,
			8,
			113,
			214
		],
		"Object.isFrozen": [
			0,
			8,
			215
		],
		"Object.isSealed": [
			0,
			8,
			216
		],
		"Object.keys": [
			0,
			116,
			218
		],
		"Object.preventExtensions": [
			0,
			8,
			19,
			51,
			73,
			109,
			113,
			219
		],
		"Object.seal": [
			0,
			8,
			19,
			51,
			73,
			109,
			113,
			220
		],
		"Object.setPrototypeOf": [
			0,
			4,
			58,
			83,
			118,
			221
		],
		"Object.values": [
			0,
			29,
			112,
			116,
			119,
			222
		],
		"Promise.any": [
			0,
			24,
			26,
			47,
			53,
			59,
			62,
			63,
			75,
			87,
			88,
			102,
			122,
			123,
			124,
			125,
			155,
			224
		],
		"Reflect.apply": [
			0,
			52,
			225
		],
		"Reflect.construct": [
			0,
			3,
			19,
			26,
			52,
			55,
			69,
			78,
			105,
			106,
			116,
			155,
			226
		],
		"Reflect.deleteProperty": [0, 227],
		"Reflect.get": [
			0,
			29,
			79,
			112,
			230
		],
		"Reflect.getOwnPropertyDescriptor": [0, 228],
		"Reflect.getPrototypeOf": [
			0,
			29,
			112,
			229
		],
		"Reflect.has": [0, 231],
		"Reflect.isExtensible": [
			0,
			8,
			113,
			232
		],
		"Reflect.ownKeys": [0, 233],
		"Reflect.preventExtensions": [
			0,
			51,
			234
		],
		"Reflect.setPrototypeOf": [
			0,
			4,
			58,
			83,
			118,
			235
		],
		"String.prototype.codePointAt": [
			0,
			26,
			141,
			155,
			156,
			236
		],
		"String.prototype.endsWith": [
			0,
			26,
			28,
			59,
			85,
			103,
			155,
			156,
			237
		],
		"String.fromCodePoint": [0, 238],
		"String.prototype.includes": [
			0,
			26,
			28,
			85,
			103,
			155,
			156,
			239
		],
		"String.prototype.matchAll": [
			0,
			3,
			6,
			26,
			29,
			31,
			59,
			69,
			78,
			85,
			89,
			90,
			105,
			106,
			112,
			116,
			126,
			127,
			128,
			129,
			130,
			131,
			132,
			135,
			139,
			141,
			155,
			156,
			241
		],
		"String.raw": [
			0,
			26,
			155,
			156,
			242
		],
		"String.prototype.repeat": [
			0,
			26,
			142,
			155,
			156,
			243
		],
		"String.prototype.replaceAll": [
			0,
			26,
			65,
			85,
			128,
			129,
			155,
			156,
			244
		],
		"String.prototype.startsWith": [
			0,
			26,
			28,
			59,
			85,
			103,
			155,
			156,
			245
		],
		"String.prototype.substr": [
			0,
			26,
			155,
			156,
			246
		],
		"String.prototype.trim": [
			0,
			26,
			144,
			146,
			155,
			156,
			163,
			251
		],
		"String.prototype.trimEnd": [
			0,
			26,
			143,
			144,
			146,
			155,
			156,
			163,
			247,
			249
		],
		"String.prototype.trimStart": [
			0,
			26,
			144,
			145,
			146,
			155,
			156,
			163,
			248,
			250
		],
		"String.prototype.link": [
			0,
			26,
			30,
			140,
			155,
			156,
			240
		],
		"Promise.allSettled": [
			0,
			24,
			26,
			47,
			53,
			59,
			62,
			63,
			75,
			87,
			88,
			102,
			122,
			123,
			124,
			125,
			155,
			223,
			252
		],
		"focus-visible": [253]
	},
	maxSize: 155835
};
var polyfillModuleData = polyfill_module_data_default;
var graph = polyfill_graph_data_default;
var CodePatternMatcher = class {
	/**
	* @param {Pattern[]} patterns
	*/
	constructor(patterns) {
		this.patterns = patterns;
	}
	/**
	* @param {string} code
	* @return {PatternMatchResult[]}
	*/
	match(code) {
		if (!this.re) {
			const patternsExpression = this.patterns.map((pattern) => `(${pattern.expression})`).join("|");
			this.re = new RegExp(`(^\r
|\r|
)|${patternsExpression}`, "g");
		}
		this.re.lastIndex = 0;
		const seen = /* @__PURE__ */ new Set();
		const matches = [];
		let result;
		let line = 0;
		let lineBeginsAtIndex = 0;
		while ((result = this.re.exec(code)) !== null) {
			const [isNewline, ...patternExpressionMatches] = result.slice(1);
			if (isNewline) {
				line++;
				lineBeginsAtIndex = result.index + 1;
				continue;
			}
			const pattern = this.patterns[patternExpressionMatches.findIndex(Boolean)];
			if (seen.has(pattern)) continue;
			seen.add(pattern);
			matches.push({
				name: pattern.name,
				line,
				column: result.index - lineBeginsAtIndex
			});
		}
		return matches;
	}
};
function buildPolyfillExpression(object, property, coreJs3Module) {
	const qt = (token) => `['"]${token}['"]`;
	let expression = "";
	if (object) expression += `${object}\\.${property}\\s?=[^=]`;
	else expression += `(?:window\\.|[\\s;]+)${property}\\s?=[^=]`;
	if (object) expression += `|${object}\\[${qt(property)}\\]\\s?=[^=]`;
	expression += `|defineProperty\\(${object || "window"},\\s?${qt(property)}`;
	if (object) expression += `|\\(${object},\\s*{${property}:.*},\\s*{${property}`;
	if (object) {
		const objectWithoutPrototype = object.replace(".prototype", "");
		expression += `|{target:${qt(objectWithoutPrototype)}[^;]*},{${property}:`;
	}
	expression += `|${coreJs3Module.replaceAll(".", "\\.")}(?:\\.js)?"`;
	return expression;
}
function getCoreJsPolyfillData() {
	return polyfillModuleData.filter((d) => d.corejs).map((d) => {
		return {
			name: d.name,
			coreJs3Module: d.modules[0]
		};
	});
}
function getPolyfillPatterns() {
	const patterns = [];
	for (const { name, coreJs3Module } of getCoreJsPolyfillData()) {
		const parts = name.split(".");
		const object = parts.length > 1 ? parts.slice(0, parts.length - 1).join(".") : null;
		const property = parts[parts.length - 1];
		patterns.push({
			name,
			expression: buildPolyfillExpression(object, property, coreJs3Module)
		});
	}
	return patterns;
}
function getTransformPatterns() {
	const count = (content, pattern) => {
		if (typeof pattern === "string") return content.split(pattern).length - 1;
		return (content.match(pattern) ?? []).length;
	};
	return [
		{
			name: "@babel/plugin-transform-classes",
			expression: "Cannot call a class as a function",
			estimateBytes: (content) => {
				return 1e3 + (count(content, "_classCallCheck") - 1) * 17;
			}
		},
		{
			name: "@babel/plugin-transform-regenerator",
			expression: "Generator is already running|regeneratorRuntime",
			estimateBytes: (content) => {
				return count(content, /regeneratorRuntime\(?\)?\.a?wrap/g) * 80;
			}
		},
		{
			name: "@babel/plugin-transform-spread",
			expression: "Invalid attempt to spread non-iterable instance",
			estimateBytes: (content) => {
				return 1169 + count(content, /\.apply\(void 0,\s?_toConsumableArray/g) * 20;
			}
		}
	];
}
function estimateWastedBytes(content, matches) {
	const polyfillResults = matches.filter((m) => !m.name.startsWith("@"));
	const transformResults = matches.filter((m) => m.name.startsWith("@"));
	let estimatedWastedBytesFromPolyfills = 0;
	const modulesSeen = /* @__PURE__ */ new Set();
	for (const result of polyfillResults) {
		const modules = graph.dependencies[result.name];
		if (!modules) continue;
		for (const module of modules) modulesSeen.add(module);
	}
	estimatedWastedBytesFromPolyfills += [...modulesSeen].reduce((acc, moduleIndex) => {
		return acc + graph.moduleSizes[moduleIndex];
	}, 0);
	estimatedWastedBytesFromPolyfills = Math.min(estimatedWastedBytesFromPolyfills, graph.maxSize);
	let estimatedWastedBytesFromTransforms = 0;
	for (const result of transformResults) {
		const pattern = getTransformPatterns().find((p) => p.name === result.name);
		if (!pattern || !pattern.estimateBytes || !content) continue;
		estimatedWastedBytesFromTransforms += pattern.estimateBytes(content);
	}
	return estimatedWastedBytesFromPolyfills + estimatedWastedBytesFromTransforms;
}
var matcher = new CodePatternMatcher([...getPolyfillPatterns(), ...getTransformPatterns()]);
function detectLegacyJavaScript$1(content, map) {
	if (!content) return {
		matches: [],
		estimatedByteSavings: 0
	};
	let matches = matcher.match(content);
	if (map) for (const { name, modules } of polyfillModuleData) {
		if (matches.some((m) => m.name === name)) continue;
		const source = map.sourceURLs().find((source2) => modules.some((module) => {
			return source2.endsWith(`/${module}.js`) || source2.includes(`node_modules/${module}/`);
		}));
		if (!source) continue;
		const mapping = map.mappings().find((m) => m.sourceURL === source);
		if (mapping) matches.push({
			name,
			line: mapping.lineNumber,
			column: mapping.columnNumber
		});
		else matches.push({
			name,
			line: 0,
			column: 0
		});
	}
	matches = matches.sort((a, b) => a.name > b.name ? 1 : a.name === b.name ? 0 : -1);
	return {
		matches,
		estimatedByteSavings: estimateWastedBytes(content, matches)
	};
}
/**
* @license
* Copyright 2025 Google LLC
* SPDX-License-Identifier: Apache-2.0
*/
//#endregion
//#region node_modules/@paulirish/trace_engine/models/trace/insights/LegacyJavaScript.js
var { detectLegacyJavaScript } = legacy_javascript_exports;
//#endregion
export { NetworkAnalyzer as a, PageDependencyGraph as i, Simulator as n, Constants as r, require_create_entity_finder_api as t };
