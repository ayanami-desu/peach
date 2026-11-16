// \0rolldown/runtime.js
(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "46559626-5975-4702-9d40-40abf6a463c9", e._sentryDebugIdIdentifier = "sentry-dbid-46559626-5975-4702-9d40-40abf6a463c9");
	} catch {}
})();
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = {
	h264: "video/mp4; codecs=\"avc1.42E01E\"",
	h264High: "video/mp4; codecs=\"avc1.640028\"",
	hevc: "video/mp4; codecs=\"hvc1.1.6.L93.B0\"",
	av1: "video/mp4; codecs=\"av01.0.05M.08\"",
	vp9: "video/webm; codecs=\"vp9\"",
	aac: "audio/mp4; codecs=\"mp4a.40.2\"",
	ac3: "audio/mp4; codecs=\"ac-3\"",
	opus: "audio/webm; codecs=\"opus\""
}, u = /^\/(?:stream(?:\/hls\/\d+\/(?:index\.m3u8|\d+\.ts))?|preview-stream|strm-resource\/\d+\/[a-f0-9]+)$/, d = (e) => {
	try {
		return e();
	} catch {
		return null;
	}
}, f = (e) => Number.isFinite(e) ? Math.round(e * 1e3) / 1e3 : null, p, m = { status: "not-requested" }, h;
async function g() {
	return h ??= (async () => {
		let e = navigator.userAgentData;
		if (!e?.getHighEntropyValues) {
			m = { status: "unsupported" };
			return;
		}
		let t;
		try {
			let n = await Promise.race([e.getHighEntropyValues([
				"fullVersionList",
				"architecture",
				"bitness",
				"platformVersion",
				"wow64"
			]), new Promise((e) => {
				t = setTimeout(() => e(null), 1e3);
			})]);
			m = n ? {
				...n,
				status: n.fullVersionList ? "available" : "restricted"
			} : { status: "timeout" };
		} catch {
			m = { status: "unavailable" };
		} finally {
			t && clearTimeout(t);
		}
	})(), await h, v();
}
function _() {
	if (p || (p = { status: "unavailable" }, typeof WebGLRenderingContext > "u")) return p;
	let e = d(() => document.createElement("canvas").getContext("webgl"));
	if (!e) return p;
	try {
		let t = e.getExtension("WEBGL_debug_renderer_info");
		p = {
			status: "available",
			vendor: String(e.getParameter(t?.UNMASKED_VENDOR_WEBGL ?? e.VENDOR)),
			renderer: String(e.getParameter(t?.UNMASKED_RENDERER_WEBGL ?? e.RENDERER))
		};
	} catch {} finally {
		d(() => e.getExtension("WEBGL_lose_context")?.loseContext());
	}
	return p;
}
function v() {
	let e = document.createElement("video"), t = navigator;
	return {
		user_agent: navigator.userAgent,
		platform: navigator.platform,
		language: navigator.language,
		brands: t.userAgentData?.brands,
		mobile: t.userAgentData?.mobile,
		client_hints: m,
		platform_hint: t.userAgentData?.platform,
		timezone: d(() => Intl.DateTimeFormat().resolvedOptions().timeZone),
		utc_offset_minutes: -(/* @__PURE__ */ new Date()).getTimezoneOffset(),
		secure_context: globalThis.isSecureContext,
		online: navigator.onLine,
		cookies_enabled: navigator.cookieEnabled,
		local_storage: d(() => (localStorage.getItem("peach.settings.v1"), !0)),
		protocol: location.protocol,
		viewport_width: innerWidth,
		viewport_height: innerHeight,
		pixel_ratio: devicePixelRatio,
		touch_points: navigator.maxTouchPoints,
		logical_processors: navigator.hardwareConcurrency,
		device_memory_gb: t.deviceMemory,
		media_source: typeof MediaSource < "u",
		media_capabilities: !!navigator.mediaCapabilities,
		web_codecs: "VideoDecoder" in globalThis,
		graphics: _(),
		fullscreen: document.fullscreenEnabled,
		picture_in_picture: document.pictureInPictureEnabled,
		native_codecs: Object.fromEntries(Object.entries(l).map(([t, n]) => [t, d(() => e.canPlayType(n))])),
		mse_codecs: Object.fromEntries(Object.entries(l).map(([e, t]) => [e, d(() => typeof MediaSource < "u" && MediaSource.isTypeSupported(t))])),
		connection: t.connection && {
			effective_type: t.connection.effectiveType,
			save_data: t.connection.saveData,
			rtt_ms: t.connection.rtt,
			downlink_mbps: t.connection.downlink
		}
	};
}
function y(e, t = e.error) {
	let n = d(() => new URL(e.currentSrc || e.src, location.href)), r = e.closest("hlsjs-video,dash-video"), i = d(() => new URL(r?.source?.src || "", location.href)), a = t, o = (d(() => performance.getEntriesByType("resource")) || []).filter((e) => {
		let t = d(() => new URL(e.name));
		return !!t && t.origin === location.origin && u.test(t.pathname);
	}).slice(-8).map((e) => {
		let t = e;
		return {
			route: new URL(e.name).pathname,
			duration_ms: f(e.duration),
			transfer_bytes: t.transferSize,
			body_bytes: t.encodedBodySize,
			status: t.responseStatus,
			initiator: t.initiatorType
		};
	});
	return {
		code: a?.code,
		message: typeof a?.message == "string" ? a.message.slice(0, 1e3) : void 0,
		network_state: e.networkState,
		ready_state: e.readyState,
		current_time: f(e.currentTime),
		duration: f(e.duration),
		paused: e.paused,
		ended: e.ended,
		muted: e.muted,
		volume: f(e.volume),
		playback_rate: f(e.playbackRate),
		preload: e.preload,
		video_width: e instanceof HTMLVideoElement ? e.videoWidth : void 0,
		video_height: e instanceof HTMLVideoElement ? e.videoHeight : void 0,
		source_protocol: n?.protocol,
		same_origin: n?.origin === location.origin,
		source_assigned: e.hasAttribute("src"),
		source_type: r?.source?.type,
		asset_id: n && n.origin === location.origin && u.test(n.pathname) && /^\d+$/.test(n.searchParams.get("id") || "") ? Number(n.searchParams.get("id")) : void 0,
		source_route: n && n.origin === location.origin && u.test(n.pathname) ? n.pathname : void 0,
		declared_route: i && i.origin === location.origin && u.test(i.pathname) ? i.pathname : void 0,
		buffered_ranges: d(() => Array.from({ length: Math.min(e.buffered.length, 8) }, (t, n) => [f(e.buffered.start(n)), f(e.buffered.end(n))])),
		recent_requests: o
	};
}
// src/error-reporting.ts
var b = !1, x = /* @__PURE__ */ new Set([
	"Error",
	"TypeError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"URIError",
	"EvalError",
	"AggregateError",
	"DOMException"
]), S = /^(?:peach-pages\.js|peach-app(?:\.[A-Za-z0-9_-]+)?\.js)$/, C = /(?:^|[/\\])(peach-pages\.js|peach-app(?:\.[A-Za-z0-9_-]+)?\.js)(?=[:?#)\s]|$)/m, w = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function T() {
	let e = globalThis, t = {};
	for (let [n, r] of Object.entries(e._sentryDebugIds ?? {})) {
		if (typeof r != "string" || !w.test(r)) continue;
		let e = n.match(C)?.[1];
		e && (t[e] = r);
	}
	return t;
}
function ee() {
	if (b || typeof window > "u") return;
	b = !0, /^\/(?:login|setup)(?:\/|$)/.test(location.pathname) || g().then((e) => fetch("/api/diagnostics/client-error", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "same-origin",
		body: JSON.stringify({
			kind: "context",
			message: "浏览器环境快照",
			browser: e
		})
	})).catch(() => {});
	let e = Date.now(), t = 0, n = /* @__PURE__ */ new Set(), r = (r, i, a = "", o, s) => {
		let c = i instanceof Error || i instanceof DOMException ? i.name : "";
		if (c === "AbortError") return;
		let l = x.has(c) ? c : i instanceof DOMException ? "DOMException" : "Error";
		if (Date.now() - e >= 6e4 && (e = Date.now(), t = 0, n.clear()), t >= 10) return;
		let u = (i instanceof Error ? i.message : typeof i == "string" ? i : a).slice(0, 2e3);
		if (!u) return;
		let d = i instanceof Error ? (i.stack ?? "").slice(0, 6e3) : "", f = `${r}:${u}:${d}:${s?.asset_id ?? ""}`;
		n.has(f) || (n.add(f), t += 1, fetch("/api/diagnostics/client-error", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				kind: r,
				message: u,
				stack: d,
				error_name: l,
				page: window.location.pathname,
				browser: v(),
				playback: s,
				bundle_debug_ids: T(),
				source_file: [o?.filename?.split("/").pop()?.split(/[?#]/)[0] ?? ""].find((e) => S.test(e)),
				line: o?.lineno,
				column: o?.colno
			}),
			credentials: "same-origin",
			keepalive: !0
		}).catch(() => {}));
	};
	window.addEventListener("error", (e) => r("error", e.error, e.message, e)), window.addEventListener("unhandledrejection", (e) => r("unhandledrejection", e.reason, "Promise 未处理的异常")), document.addEventListener("error", (e) => {
		let t = e.target, n = t instanceof HTMLMediaElement ? t : t instanceof HTMLElement && t.matches("hlsjs-video,dash-video") ? t.querySelector("video") : null, i = t?.error || e.error;
		if (!n || !i) return;
		let a = y(n, i);
		r("media", `媒体播放失败（${a.code}）`, "", void 0, a);
	}, !0);
}
// node_modules/scheduler/cjs/scheduler.production.js
var te = /* @__PURE__ */ o(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, S || (S = !0, ne());
			else {
				var t = n(l);
				t !== null && ae(x, t.startTime - e);
			}
		}
	}
	var S = !1, C = -1, w = 5, T = -1;
	function ee() {
		return g ? !0 : !(e.unstable_now() - T < w);
	}
	function te() {
		if (g = !1, S) {
			var t = e.unstable_now();
			T = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(C), C = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && ee());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && ae(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? ne() : S = !1;
			}
		}
	}
	var ne;
	if (typeof y == "function") ne = function() {
		y(te);
	};
	else if (typeof MessageChannel < "u") {
		var re = new MessageChannel(), ie = re.port2;
		re.port1.onmessage = te, ne = function() {
			ie.postMessage(null);
		};
	} else ne = function() {
		_(te, 0);
	};
	function ae(t, n) {
		C = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, ae(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, ne()))), r;
	}, e.unstable_shouldYield = ee, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), ne = /* @__PURE__ */ o(((e, t) => {
	t.exports = te();
})), re = /* @__PURE__ */ o(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var S = x.prototype = new b();
	S.constructor = x, _(S, y.prototype), S.isPureReactComponent = !0;
	var C = Array.isArray;
	function w() {}
	var T = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ee = Object.prototype.hasOwnProperty;
	function te(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function ne(e, t) {
		return te(e.type, t, e.props);
	}
	function re(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function ie(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var ae = /\/+/g;
	function oe(e, t) {
		return typeof e == "object" && e && e.key != null ? ie("" + e.key) : t.toString(36);
	}
	function se(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(w, w) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function ce(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, ce(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + oe(e, 0) : a, C(o) ? (i = "", c != null && (i = c.replace(ae, "$&/") + "/"), ce(o, r, i, "", function(e) {
			return e;
		})) : o != null && (re(o) && (o = ne(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ae, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (C(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + oe(a, u), c += ce(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + oe(a, u++), c += ce(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ce(se(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function E(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ce(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function D(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var le = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function ue(e) {
		var t = T.T, n = {};
		n.types = t === null ? null : t.types, T.T = n;
		try {
			var r = e(), i = T.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(w, le);
		} catch (e) {
			le(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), T.T = t;
		}
	}
	function de(e) {
		var t = T.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else ue(de.bind(null, e));
	}
	var fe = {
		map: E,
		forEach: function(e, t, n) {
			E(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return E(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return E(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!re(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = fe, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = T, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return T.H.useMemoCache(e);
		}
	}, e.addTransitionType = de, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ee.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return te(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ee.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return te(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = re, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: D
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = ue, e.unstable_useCacheRefresh = function() {
		return T.H.useCacheRefresh();
	}, e.use = function(e) {
		return T.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return T.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return T.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return T.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return T.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return T.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return T.H.useEffectEvent(e);
	}, e.useId = function() {
		return T.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return T.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return T.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return T.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return T.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return T.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return T.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return T.H.useRef(e);
	}, e.useState = function(e) {
		return T.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return T.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return T.H.useTransition();
	}, e.version = "19.3.1";
})), ie = /* @__PURE__ */ o(((e, t) => {
	t.exports = re();
})), ae = /* @__PURE__ */ o(((e) => {
	var t = ie();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, a = Symbol.for("react.portal"), o = Symbol.for("react.recoverable"), s = Symbol.for("react.optimistic_key");
	function c(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : r === s ? s : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var l = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function u(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.browser = function(e) {
		return {
			$$typeof: o,
			_reason: e
		};
	}, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return c(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = l.T, n = i.p;
		try {
			if (l.T = null, i.p = 2, e) return e();
		} finally {
			l.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = u(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0,
						fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = u(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = u(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return l.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return l.H.useHostTransitionStatus();
	}, e.version = "19.3.1";
})), oe = /* @__PURE__ */ o(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = ae();
})), se = /* @__PURE__ */ o(((e) => {
	var t = ne(), n = ie(), r = oe();
	function i(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function a(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function o(e) {
		for (var t = e, n = t; n && !n.alternate;) t = n, t.flags & 4098 && (e = t.return), n = t.return;
		for (; t.return;) t = t.return;
		return t.tag === 3 ? e : null;
	}
	function s(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function c(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function l(e) {
		if (o(e) !== e) throw Error(i(188));
	}
	function u(e) {
		var t = e.alternate;
		if (!t) {
			if (t = o(e), t === null) throw Error(i(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var a = n.return;
			if (a === null) break;
			var s = a.alternate;
			if (s === null) {
				if (r = a.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (a.child === s.child) {
				for (s = a.child; s;) {
					if (s === n) return l(a), e;
					if (s === r) return l(a), t;
					s = s.sibling;
				}
				throw Error(i(188));
			}
			if (n.return !== r.return) n = a, r = s;
			else {
				for (var c = !1, u = a.child; u;) {
					if (u === n) {
						c = !0, n = a, r = s;
						break;
					}
					if (u === r) {
						c = !0, r = a, n = s;
						break;
					}
					u = u.sibling;
				}
				if (!c) {
					for (u = s.child; u;) {
						if (u === n) {
							c = !0, n = s, r = a;
							break;
						}
						if (u === r) {
							c = !0, r = s, n = a;
							break;
						}
						u = u.sibling;
					}
					if (!c) throw Error(i(189));
				}
			}
			if (n.alternate !== r) throw Error(i(190));
		}
		if (n.tag !== 3) throw Error(i(188));
		return n.stateNode.current === n ? e : t;
	}
	function d(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = d(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	function f(e, t, n, r, i, a) {
		for (; e !== null;) {
			if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, r, i, a) || (e.tag !== 22 || e.memoizedState === null) && (t || e.tag !== 5 && e.tag !== 27) && f(e.child, t, n, r, i, a)) return !0;
			e = e.sibling;
		}
		return !1;
	}
	function p(e) {
		for (e = e.return; e !== null;) {
			if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
			e = e.return;
		}
		return null;
	}
	function m(e) {
		var t = !1;
		for (e = e.return; e !== null && (e.tag === 4 && (t = !0), e.tag !== 3 && e.tag !== 5 && e.tag !== 27);) e = e.return;
		return t;
	}
	function h(e) {
		var t = [null, null], n = p(e);
		return n === null || g(t, e, n.child, { foundSelf: !1 }), t;
	}
	function g(e, t, n, r) {
		for (; n !== null;) {
			if (n === t) r.foundSelf = !0;
			else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
				if (r.foundSelf) return e[1] = n, !0;
				e[0] = n;
			} else if ((n.tag !== 22 || n.memoizedState === null) && g(e, t, n.child, r)) return !0;
			n = n.sibling;
		}
		return !1;
	}
	function _(e) {
		switch (e.tag) {
			case 5:
			case 27:
			case 6: return e.stateNode;
			case 3: return e.stateNode.containerInfo;
			default: throw Error(i(559));
		}
	}
	var v = null, y = null;
	function b(e, t, n) {
		return e === n || e === t && (v = e, !0);
	}
	function x(e, t, n) {
		return e === n ? (y = e, !1) : e === t && (y !== null && (v = e), !0);
	}
	function S(e) {
		if (e === null) return null;
		do
			e = e === null ? null : e.return;
		while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
		return e || null;
	}
	function C(e, t, n) {
		for (var r = 0, i = e; i; i = n(i)) r++;
		i = 0;
		for (var a = t; a; a = n(a)) i++;
		for (; 0 < r - i;) e = n(e), r--;
		for (; 0 < i - r;) t = n(t), i--;
		for (; r--;) {
			if (e === t || t !== null && e === t.alternate) return e;
			e = n(e), t = n(t);
		}
		return null;
	}
	var w = Object.assign, T = Symbol.for("react.element"), ee = Symbol.for("react.transitional.element"), te = Symbol.for("react.portal"), re = Symbol.for("react.fragment"), ae = Symbol.for("react.strict_mode"), se = Symbol.for("react.profiler"), ce = Symbol.for("react.consumer"), E = Symbol.for("react.context"), D = Symbol.for("react.forward_ref"), le = Symbol.for("react.suspense"), ue = Symbol.for("react.suspense_list"), de = Symbol.for("react.memo"), fe = Symbol.for("react.lazy"), pe = Symbol.for("react.activity"), me = Symbol.for("react.legacy_hidden"), he = Symbol.for("react.memo_cache_sentinel"), ge = Symbol.for("react.view_transition"), _e = Symbol.for("react.recoverable"), ve = Symbol.iterator;
	function ye(e) {
		return typeof e != "object" || !e ? null : (e = ve && e[ve] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var be = Symbol.for("react.client.reference");
	function xe(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === be ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case re: return "Fragment";
			case se: return "Profiler";
			case ae: return "StrictMode";
			case le: return "Suspense";
			case ue: return "SuspenseList";
			case pe: return "Activity";
			case ge: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case te: return "Portal";
			case E: return e.displayName || "Context";
			case ce: return (e._context.displayName || "Context") + ".Consumer";
			case D:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case de: return t = e.displayName || null, t === null ? xe(e.type) || "Memo" : t;
			case fe:
				t = e._payload, e = e._init;
				try {
					return xe(e(t));
				} catch {}
		}
		return null;
	}
	var Se = Array.isArray, O = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, k = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Ce = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, we = [], Te = -1;
	function Ee(e) {
		return { current: e };
	}
	function De(e) {
		0 > Te || (e.current = we[Te], we[Te] = null, Te--);
	}
	function A(e, t) {
		Te++, we[Te] = e.current, e.current = t;
	}
	var Oe = Ee(null), ke = Ee(null), Ae = Ee(null), je = Ee(null);
	function Me(e, t) {
		switch (A(Ae, t), A(ke, e), A(Oe, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? up(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = up(t), e = dp(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		De(Oe), A(Oe, e);
	}
	function Ne() {
		De(Oe), De(ke), De(Ae);
	}
	function Pe(e) {
		var t = e.memoizedState;
		t !== null && (sh._currentValue = t.memoizedState, A(je, e)), t = Oe.current;
		var n = dp(t, e.type);
		t !== n && (A(ke, e), A(Oe, n));
	}
	function Fe(e) {
		ke.current === e && (De(Oe), De(ke)), je.current === e && (De(je), sh._currentValue = Ce);
	}
	var Ie, Le;
	function Re(e) {
		if (Ie === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			Ie = t && t[1] || "", Le = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + Ie + e + Le;
	}
	var ze = !1;
	function Be(e, t) {
		if (!e || ze) return "";
		ze = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							n = !1;
							try {
								var i = Object.getOwnPropertyDescriptor(e.prototype, "props");
								Object.defineProperty(e.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								}), n = !0, new e();
							} finally {
								n && (i === void 0 ? delete e.prototype.props : Object.defineProperty(e.prototype, "props", i));
							}
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			ze = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? Re(n) : "";
	}
	function Ve(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return Re(e.type);
			case 16: return Re("Lazy");
			case 13: return e.child !== t && t !== null ? Re("Suspense Fallback") : Re("Suspense");
			case 19: return Re("SuspenseList");
			case 0:
			case 15: return Be(e.type, !1);
			case 11: return Be(e.type.render, !1);
			case 1: return Be(e.type, !0);
			case 31: return Re("Activity");
			case 30: return Re("ViewTransition");
			default: return "";
		}
	}
	function He(e) {
		try {
			var t = "", n = null;
			do
				t += Ve(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Ue = Object.prototype.hasOwnProperty, We = t.unstable_scheduleCallback, Ge = t.unstable_cancelCallback, Ke = t.unstable_shouldYield, qe = t.unstable_requestPaint, Je = t.unstable_now, j = t.unstable_getCurrentPriorityLevel, Ye = t.unstable_ImmediatePriority, Xe = t.unstable_UserBlockingPriority, Ze = t.unstable_NormalPriority, Qe = t.unstable_LowPriority, $e = t.unstable_IdlePriority, et = t.log, tt = t.unstable_setDisableYieldValue, nt = null, rt = null;
	function it(e) {
		if (typeof et == "function" && tt(e), rt && typeof rt.setStrictMode == "function") try {
			rt.setStrictMode(nt, e);
		} catch {}
	}
	var at = Math.clz32 ? Math.clz32 : st, M = Math.log, ot = Math.LN2;
	function st(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (M(e) / ot | 0) | 0;
	}
	var ct = 256, lt = 262144, ut = 4194304;
	function dt(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & -e;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function ft(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = dt(n))) : i = dt(o) : i = dt(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = dt(n))) : i = dt(o)) : i = dt(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function N(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function pt(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - at(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function mt(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function ht() {
		var e = ut;
		return ut <<= 1, !(ut & 62914560) && (ut = 4194304), e;
	}
	function gt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function _t(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function vt(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - at(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && yt(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function yt(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - at(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function bt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - at(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function xt(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : St(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function St(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function Ct(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function wt() {
		var e = k.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : Ch(e.type)) : e;
	}
	function Tt(e, t) {
		var n = k.p;
		try {
			return k.p = e, t();
		} finally {
			k.p = n;
		}
	}
	var Et = Math.random().toString(36).slice(2), Dt = "__reactFiber$" + Et, Ot = "__reactProps$" + Et, kt = "__reactContainer$" + Et, At = "__reactEvents$" + Et, jt = "__reactListeners$" + Et, Mt = "__reactHandles$" + Et, Nt = "__reactResources$" + Et, Pt = "__reactMarker$" + Et, Ft = "__reactLoad$" + Et;
	function It(e) {
		delete e[Dt], delete e[Ot], delete e[jt], delete e[Mt];
	}
	function Lt(e) {
		var t;
		if (t = e[Dt]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[kt] || n[Dt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = fm(e); e !== null;) {
					if (n = e[Dt]) return n;
					e = fm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Rt(e) {
		if (e = e[Dt] || e[kt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function P(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function zt(e) {
		var t = e[Nt];
		return t ||= e[Nt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Bt(e) {
		e[Pt] = !0;
	}
	function F(e) {
		e[Ft] = void 0;
	}
	var Vt = /* @__PURE__ */ new Set(), Ht = {};
	function Ut(e, t) {
		Wt(e, t), Wt(e + "Capture", t);
	}
	function Wt(e, t) {
		for (Ht[e] = t, e = 0; e < t.length; e++) Vt.add(t[e]);
	}
	var Gt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Kt = {}, qt = {};
	function Jt(e) {
		return Ue.call(qt, e) ? !0 : Ue.call(Kt, e) ? !1 : Gt.test(e) ? qt[e] = !0 : (Kt[e] = !0, !1);
	}
	var I = !1;
	function Yt() {
		var e = I;
		return I = !1, e;
	}
	function Xt(e, t, n) {
		if (Jt(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, n);
			}
		}
	}
	function Zt(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, n);
		}
	}
	function Qt(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, r);
		}
	}
	function $t(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function en(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function tn(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function nn(e) {
		if (!e._valueTracker) {
			var t = en(e) ? "checked" : "value";
			e._valueTracker = tn(e, t, "" + e[t]);
		}
	}
	function rn(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = en(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var an = /[\n"\\]/g;
	function on(e) {
		return e.replace(an, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function sn(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + $t(t)) : e.value !== "" + $t(t) && (e.value = "" + $t(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : ln(e, $t(n)) : o === "number" && e.value == t ? ln(e, $t(e.value)) : ln(e, $t(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + $t(s) : e.removeAttribute("name");
	}
	function cn(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				nn(e);
				return;
			}
			n = n == null ? "" : "" + $t(n), t = t == null ? n : "" + $t(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), nn(e);
	}
	function ln(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function un(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + $t(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function dn(e, t, n) {
		t != null && (t = "" + $t(t), t !== e.value && (e.value = t), n == null) ? e.defaultValue !== t && (e.defaultValue = t) : e.defaultValue = n == null ? "" : "" + $t(n);
	}
	function fn(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (Se(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = $t(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), nn(e);
	}
	function pn(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var mn = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function hn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || mn.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function gn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", I = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (hn(e, a, r), I = !0);
		} else for (var o in t) t.hasOwnProperty(o) && hn(e, o, t[o]);
	}
	function _n(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var vn = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), yn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function bn(e) {
		return yn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function xn() {}
	var L = null;
	function Sn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Cn = null, wn = null;
	function Tn(e) {
		var t = Rt(e);
		if (t && (e = t.stateNode)) {
			var n = e[Ot] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (sn(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + on("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[Ot] || null;
								if (!a) throw Error(i(90));
								sn(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && rn(r);
					}
					break a;
				case "textarea":
					dn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && un(e, !!n.multiple, t, !1);
			}
		}
	}
	var En = !1;
	function Dn(e, t, n) {
		if (En) return e(t, n);
		En = !0;
		try {
			return e(t);
		} finally {
			if (En = !1, (Cn !== null || wn !== null) && (zd(), Cn && (t = Cn, e = wn, wn = Cn = null, Tn(t), e))) for (t = 0; t < e.length; t++) Tn(e[t]);
		}
	}
	function On(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[Ot] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(i(231, t, typeof n));
		return n;
	}
	var kn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, An = !1;
	if (kn) try {
		var jn = {};
		Object.defineProperty(jn, "passive", { get: function() {
			An = !0;
		} }), window.addEventListener("test", jn, jn), window.removeEventListener("test", jn, jn);
	} catch {
		An = !1;
	}
	var Mn = null, Nn = null, Pn = null;
	function Fn() {
		if (Pn) return Pn;
		var e, t = Nn, n = t.length, r, i = "value" in Mn ? Mn.value : Mn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return Pn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function In(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Ln() {
		return !0;
	}
	function Rn() {
		return !1;
	}
	function zn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Ln : Rn, this.isPropagationStopped = Rn, this;
		}
		return w(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Ln);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Ln);
			},
			persist: function() {},
			isPersistent: Ln
		}), t;
	}
	var Bn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Vn = zn(Bn), R = w({}, Bn, {
		view: 0,
		detail: 0
	}), Hn = zn(R), z, Un, Wn, Gn = w({}, R, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: nr,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Wn && (Wn && e.type === "mousemove" ? (z = e.screenX - Wn.screenX, Un = e.screenY - Wn.screenY) : Un = z = 0, Wn = e), z);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Un;
		}
	}), Kn = zn(Gn), qn = zn(w({}, Gn, { dataTransfer: 0 })), Jn = zn(w({}, R, { relatedTarget: 0 })), Yn = zn(w({}, Bn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Xn = zn(w({}, Bn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Zn = zn(w({}, Bn, { data: 0 })), Qn = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, $n = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, er = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function tr(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = er[e]) ? !!t[e] : !1;
	}
	function nr() {
		return tr;
	}
	var rr = zn(w({}, R, {
		key: function(e) {
			if (e.key) {
				var t = Qn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = In(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? $n[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: nr,
		charCode: function(e) {
			return e.type === "keypress" ? In(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? In(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), ir = zn(w({}, Gn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), ar = zn(w({}, Bn, { submitter: 0 })), or = zn(w({}, R, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: nr
	})), sr = zn(w({}, Bn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), cr = zn(w({}, Gn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), lr = zn(w({}, Bn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), ur = [
		9,
		13,
		27,
		32
	], dr = kn && "CompositionEvent" in window, fr = null;
	kn && "documentMode" in document && (fr = document.documentMode);
	var pr = kn && "TextEvent" in window && !fr, mr = kn && (!dr || fr && 8 < fr && 11 >= fr), hr = " ", gr = !1;
	function _r(e, t) {
		switch (e) {
			case "keyup": return ur.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function vr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var yr = !1;
	function br(e, t) {
		switch (e) {
			case "compositionend": return vr(t);
			case "keypress": return t.which === 32 ? (gr = !0, hr) : null;
			case "textInput": return e = t.data, e === hr && gr ? null : e;
			default: return null;
		}
	}
	function xr(e, t) {
		if (yr) return e === "compositionend" || !dr && _r(e, t) ? (e = Fn(), Pn = Nn = Mn = null, yr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return mr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Sr = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function Cr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Sr[e.type] : t === "textarea";
	}
	function wr(e, t, n, r) {
		Cn ? wn ? wn.push(r) : wn = [r] : Cn = r, t = Jf(t, "onChange"), 0 < t.length && (n = new Vn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Tr = null, Er = null;
	function Dr(e) {
		Vf(e, 0);
	}
	function Or(e) {
		if (rn(P(e))) return e;
	}
	function kr(e, t) {
		if (e === "change") return t;
	}
	var Ar = !1;
	if (kn) {
		var jr;
		if (kn) {
			var Mr = "oninput" in document;
			if (!Mr) {
				var Nr = document.createElement("div");
				Nr.setAttribute("oninput", "return;"), Mr = typeof Nr.oninput == "function";
			}
			jr = Mr;
		} else jr = !1;
		Ar = jr && (!document.documentMode || 9 < document.documentMode);
	}
	function Pr() {
		Tr && (Tr.detachEvent("onpropertychange", Fr), Er = Tr = null);
	}
	function Fr(e) {
		if (e.propertyName === "value" && Or(Er)) {
			var t = [];
			wr(t, Er, e, Sn(e)), Dn(Dr, t);
		}
	}
	function Ir(e, t, n) {
		e === "focusin" ? (Pr(), Tr = t, Er = n, Tr.attachEvent("onpropertychange", Fr)) : e === "focusout" && Pr();
	}
	function Lr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Or(Er);
	}
	function Rr(e, t) {
		if (e === "click") return Or(t);
	}
	function zr(e, t) {
		if (e === "input" || e === "change") return Or(t);
	}
	function Br(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Vr = typeof Object.is == "function" ? Object.is : Br;
	function Hr(e, t) {
		if (Vr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Ue.call(t, i) || !Vr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Ur(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Wr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Gr(e, t) {
		var n = Wr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Wr(n);
		}
	}
	function Kr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Kr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function qr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Ur(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Ur(e.document);
		}
		return t;
	}
	function Jr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Yr = kn && "documentMode" in document && 11 >= document.documentMode, Xr = null, Zr = null, Qr = null, $r = !1;
	function ei(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		$r || Xr == null || Xr !== Ur(r) || (r = Xr, "selectionStart" in r && Jr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Qr && Hr(Qr, r) || (Qr = r, r = Jf(Zr, "onSelect"), 0 < r.length && (t = new Vn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Xr)));
	}
	function ti(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var ni = {
		animationend: ti("Animation", "AnimationEnd"),
		animationiteration: ti("Animation", "AnimationIteration"),
		animationstart: ti("Animation", "AnimationStart"),
		transitionrun: ti("Transition", "TransitionRun"),
		transitionstart: ti("Transition", "TransitionStart"),
		transitioncancel: ti("Transition", "TransitionCancel"),
		transitionend: ti("Transition", "TransitionEnd")
	}, ri = {}, ii = {};
	kn && (ii = document.createElement("div").style, "AnimationEvent" in window || (delete ni.animationend.animation, delete ni.animationiteration.animation, delete ni.animationstart.animation), "TransitionEvent" in window || delete ni.transitionend.transition);
	function ai(e) {
		if (ri[e]) return ri[e];
		if (!ni[e]) return e;
		var t = ni[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in ii) return ri[e] = t[n];
		return e;
	}
	var oi = ai("animationend"), si = ai("animationiteration"), ci = ai("animationstart"), li = ai("transitionrun"), ui = ai("transitionstart"), di = ai("transitioncancel"), fi = ai("transitionend"), pi = /* @__PURE__ */ new Map(), mi = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	mi.push("scrollEnd");
	function hi(e, t) {
		pi.set(e, t), Ut(t, [e]);
	}
	var gi = 0;
	function _i(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = bd.identifierPrefix;
		var n = gi++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function vi(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = Od;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function yi(e, t) {
		return e = vi(e), t = vi(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var bi = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, xi = [], Si = 0, Ci = 0;
	function wi() {
		for (var e = Si, t = Ci = Si = 0; t < e;) {
			var n = xi[t];
			xi[t++] = null;
			var r = xi[t];
			xi[t++] = null;
			var i = xi[t];
			xi[t++] = null;
			var a = xi[t];
			if (xi[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Oi(n, i, a);
		}
	}
	function Ti(e, t, n, r) {
		xi[Si++] = e, xi[Si++] = t, xi[Si++] = n, xi[Si++] = r, Ci |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Ei(e, t, n, r) {
		return Ti(e, t, n, r), ki(e);
	}
	function Di(e, t) {
		return Ti(e, null, null, t), ki(e);
	}
	function Oi(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - at(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function ki(e) {
		if (50 < kd) throw kd = 0, Ad = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Ai = {};
	function ji(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function Mi(e, t, n, r) {
		return new ji(e, t, n, r);
	}
	function Ni(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Pi(e, t) {
		var n = e.alternate;
		return n === null ? (n = Mi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function Fi(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Ii(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Ni(r) && (s = 1);
		else if (typeof r == "string") s = qm(e, n, Oe.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case pe: return e = Mi(31, n, t, a), e.elementType = pe, e.lanes = o, e;
			case re: return Li(n.children, a, o, t);
			case ae:
				s = 8, a |= 24;
				break;
			case se: return e = Mi(12, n, t, a | 2), e.elementType = se, e.lanes = o, e;
			case le: return e = Mi(13, n, t, a), e.elementType = le, e.lanes = o, e;
			case ue: return e = Mi(19, n, t, a), e.elementType = ue, e.lanes = o, e;
			case me:
			case ge: return e = a | 32, e = Mi(30, n, t, e), e.elementType = ge, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case E:
						s = 10;
						break a;
					case ce:
						s = 9;
						break a;
					case D:
						s = 11;
						break a;
					case de:
						s = 14;
						break a;
					case fe:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = Mi(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Li(e, t, n, r) {
		return e = Mi(7, e, r, t), e.lanes = n, e;
	}
	function Ri(e, t, n) {
		return e = Mi(6, e, null, t), e.lanes = n, e;
	}
	function zi(e) {
		var t = Mi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Bi(e, t, n) {
		return t = Mi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Vi = /* @__PURE__ */ new WeakMap();
	function Hi(e, t) {
		if (typeof e == "object" && e) {
			var n = Vi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: He(t)
			}, Vi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: He(t)
		};
	}
	var Ui = [], Wi = 0, Gi = null, Ki = 0, qi = [], Ji = 0, Yi = null, Xi = 1, Zi = "";
	function Qi(e, t) {
		Ui[Wi++] = Ki, Ui[Wi++] = Gi, Gi = e, Ki = t;
	}
	function $i(e, t, n) {
		qi[Ji++] = Xi, qi[Ji++] = Zi, qi[Ji++] = Yi, Yi = e;
		var r = Xi;
		e = Zi;
		var i = 32 - at(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - at(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Xi = 1 << 32 - at(t) + i | n << i | r, Zi = a + e;
		} else Xi = 1 << a | n << i | r, Zi = e;
	}
	function ea(e) {
		e.return !== null && (Qi(e, 1), $i(e, 1, 0));
	}
	function ta(e) {
		for (; e === Gi;) Gi = Ui[--Wi], Ui[Wi] = null, Ki = Ui[--Wi], Ui[Wi] = null;
		for (; e === Yi;) Yi = qi[--Ji], qi[Ji] = null, Zi = qi[--Ji], qi[Ji] = null, Xi = qi[--Ji], qi[Ji] = null;
	}
	function na(e, t) {
		qi[Ji++] = Xi, qi[Ji++] = Zi, qi[Ji++] = Yi, Xi = t.id, Zi = t.overflow, Yi = e;
	}
	var ra = null, B = null, V = !1, ia = null, aa = !1, oa = Error(i(519));
	function sa(e) {
		throw pa(Hi(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), oa;
	}
	function ca(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[Dt] = e, t[Ot] = r, n) {
			case "dialog":
				Q("cancel", t), Q("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Q("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < zf.length; n++) Q(zf[n], t);
				break;
			case "source":
				Q("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Q("error", t), Q("load", t);
				break;
			case "details":
				Q("toggle", t);
				break;
			case "input":
				Q("invalid", t), cn(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), fn(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || ep(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = xn), t = !0) : t = !1, t || sa(e, !0);
	}
	function la(e) {
		for (ra = e.return; ra;) switch (ra.tag) {
			case 5:
			case 31:
			case 13:
				aa = !1;
				return;
			case 27:
			case 3:
				aa = !0;
				return;
			default: ra = ra.return;
		}
	}
	function ua(e) {
		if (e !== ra) return !1;
		if (!V) return la(e), V = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || pp(e.type, e.memoizedProps)), n = !n), n && B && sa(e), la(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			B = dm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			B = dm(e);
		} else t === 27 ? (t = B, Sp(e.type) ? (e = um, um = null, B = e) : B = t) : B = ra ? lm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function da() {
		B = ra = null, V = !1;
	}
	function fa() {
		var e = ia;
		return e !== null && (fd === null ? fd = e : fd.push.apply(fd, e), ia = null), e;
	}
	function pa(e) {
		ia === null ? ia = [e] : ia.push(e);
	}
	var ma = Ee(null), ha = null, ga = null;
	function _a(e, t, n) {
		A(ma, t._currentValue), t._currentValue = n;
	}
	function va(e) {
		e._currentValue = ma.current, De(ma);
	}
	function ya(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function ba(e, t, n, r) {
		var a = e.child;
		for (a !== null && (a.return = e); a !== null;) {
			var o = a.dependencies;
			if (o !== null) {
				var s = a.child;
				o = o.firstContext;
				a: for (; o !== null;) {
					var c = o;
					o = a;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), ya(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), ya(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), ya(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
			if (s !== null) s.return = a;
			else for (s = a; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (a = s.sibling, a !== null) {
					a.return = s.return, s = a;
					break;
				}
				s = s.return;
			}
			a = s;
		}
	}
	function xa(e, t, n, r) {
		e = null;
		for (var a = t, o = !1; a !== null;) {
			if (!o) {
				if (a.flags & 524288) o = !0;
				else if (a.flags & 262144) break;
			}
			if (a.tag === 10) {
				var s = a.alternate;
				if (s === null) throw Error(i(387));
				if (s = s.memoizedProps, s !== null) {
					var c = a.type;
					Vr(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === je.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [sh] : e.push(sh));
			}
			a = a.return;
		}
		return e !== null && ba(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function Sa(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Vr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Ca(e) {
		ha = e, ga = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function wa(e) {
		return Ea(ha, e);
	}
	function Ta(e, t) {
		return ha === null && Ca(e), Ea(e, t);
	}
	function Ea(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, ga === null) {
			if (e === null) throw Error(i(308));
			ga = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else ga = ga.next = t;
		return n;
	}
	var Da = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, Oa = t.unstable_scheduleCallback, ka = t.unstable_NormalPriority, Aa = {
		$$typeof: E,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function ja() {
		return {
			controller: new Da(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Ma(e) {
		e.refCount--, e.refCount === 0 && Oa(ka, function() {
			e.controller.abort();
		});
	}
	function Na(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var Pa = null;
	function Fa(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var Ia = null, La = 0, Ra = 0, za = null;
	function Ba(e, t) {
		if (Ia === null) {
			var n = Ia = [];
			La = 0, Ra = Pf(), za = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return La++, t.then(Va, Va), t;
	}
	function Va() {
		if (--La === 0 && (Pa = null, Ia !== null)) {
			za !== null && (za.status = "fulfilled");
			var e = Ia;
			Ia = null, Ra = 0, za = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Ha(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var Ua = O.S;
	O.S = function(e, t) {
		if (hd = Je(), typeof t == "object" && t && typeof t.then == "function" && Ba(e, t), Pa !== null) for (var n = bf; n !== null;) Na(n, Pa), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = bf; r !== null;) Na(r, n), r = r.next;
			if (Ra !== 0) {
				r = Pa, r === null && (r = Pa = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		Ua !== null && Ua(e, t);
	};
	var Wa = Ee(null);
	function Ga() {
		var e = Wa.current;
		return e === null ? q.pooledCache : e;
	}
	function Ka(e, t) {
		t === null ? A(Wa, Wa.current) : A(Wa, t.pool);
	}
	function qa() {
		var e = Ga();
		return e === null ? null : {
			parent: Aa._currentValue,
			pool: e
		};
	}
	var Ja = Error(i(460)), Ya = Error(i(474)), Xa = Error(i(542)), Za = { then: function() {} };
	function Qa(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function $a(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(xn, xn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, ro(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(xn, xn);
				else {
					if (e = q, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, ro(e), e;
				}
				throw to = t, Ja;
		}
	}
	function eo(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (to = e, Ja) : e;
		}
	}
	var to = null;
	function no() {
		if (to === null) throw Error(i(459));
		var e = to;
		return to = null, e;
	}
	function ro(e) {
		if (e === Ja || e === Xa) throw Error(i(483));
	}
	var io = null, ao = 0;
	function oo(e) {
		var t = ao;
		return ao += 1, io === null && (io = []), $a(io, e, t);
	}
	function so(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function co(e, t) {
		throw t.$$typeof === T ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function lo(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function a(e, t) {
			return e = Pi(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Ri(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === re ? (e = d(e, t, n.props.children, r, n.key), so(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === fe && eo(i) === t.type) ? (t = a(t, n.props), so(t, n), t.return = e, t) : (t = Ii(n.type, n.key, n.props, null, e.mode, r), so(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Bi(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = Li(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Ri("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case ee: return n = Ii(t.type, t.key, t.props, null, e.mode, n), so(n, t), n.return = e, n;
					case te: return t = Bi(t, e.mode, n), t.return = e, t;
					case fe: return t = eo(t), f(e, t, n);
				}
				if (Se(t) || ye(t)) return t = Li(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, oo(t), n);
				if (t.$$typeof === E) return f(e, Ta(e, t), n);
				co(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case ee: return n.key === i ? l(e, t, n, r) : null;
					case te: return n.key === i ? u(e, t, n, r) : null;
					case fe: return n = eo(n), p(e, t, n, r);
				}
				if (Se(n) || ye(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, oo(n), r);
				if (n.$$typeof === E) return p(e, t, Ta(e, n), r);
				co(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case ee: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case te: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case fe: return r = eo(r), m(e, t, n, r, i);
				}
				if (Se(r) || ye(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, oo(r), i);
				if (r.$$typeof === E) return m(e, t, n, Ta(t, r), i);
				co(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), V && Qi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return V && Qi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), V && Qi(i, h), l;
		}
		function g(a, s, c, l) {
			if (c == null) throw Error(i(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(a, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(a, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(a, h), V && Qi(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return V && Qi(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), V && Qi(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === re && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case ee:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === re) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), so(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === fe && eo(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), so(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === re ? (c = Li(o.props.children, e.mode, c, o.key), so(c, o), c.return = e, e = c) : (c = Ii(o.type, o.key, o.props, null, e.mode, c), so(c, o), c.return = e, e = c);
						}
						return s(e);
					case te:
						a: {
							for (l = o.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === o.containerInfo && r.stateNode.implementation === o.implementation) {
										n(e, r.sibling), c = a(r, o.children || []), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							c = Bi(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case fe: return o = eo(o), _(e, r, o, c);
				}
				if (Se(o)) return h(e, r, o, c);
				if (ye(o)) {
					if (l = ye(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, oo(o), c);
				if (o.$$typeof === E) return _(e, r, Ta(e, o), c);
				co(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Ri(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				ao = 0;
				var i = _(e, t, n, r);
				return io = null, i;
			} catch (t) {
				if (t === Ja || t === Xa) throw t;
				var a = Mi(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var uo = lo(!0), fo = lo(!1), po = !1;
	function mo(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function ho(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function go(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function _o(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, K & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = ki(e), Oi(e, null, n), t;
		}
		return Ti(e, r, t, n), ki(e);
	}
	function vo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, bt(e, n);
		}
	}
	function yo(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
		} else e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var bo = !1;
	function xo() {
		if (bo) {
			var e = za;
			if (e !== null) throw e;
		}
	}
	function So(e, t, n, r) {
		bo = !1;
		var i = e.updateQueue;
		po = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (Y & f) === f : (r & f) === f) {
					f !== 0 && f === Ra && (bo = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, h = s;
						f = t;
						var g = n;
						switch (h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(g, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(g, d, f) : m, f == null) break a;
								d = w({}, d, f);
								break a;
							case 2: po = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), od |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function Co(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function wo(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Co(n[e], t);
	}
	var To = Ee(null), Eo = Ee(0);
	function Do(e, t) {
		e = id, A(Eo, e), A(To, t), id = e | t.baseLanes;
	}
	function Oo() {
		A(Eo, id), A(To, To.current);
	}
	function ko() {
		id = Eo.current, De(To), De(Eo);
	}
	var Ao = Ee(null), jo = null;
	function Mo(e) {
		var t = e.alternate;
		A(Lo, Lo.current & 1), A(Ao, e), jo === null && (t === null || To.current !== null || t.memoizedState !== null) && (jo = e);
	}
	function No(e) {
		A(Lo, Lo.current), A(Ao, e), jo === null && (jo = e);
	}
	function Po(e) {
		e.tag === 22 ? (A(Lo, Lo.current), A(Ao, e), jo === null && (jo = e)) : Fo();
	}
	function Fo() {
		A(Lo, Lo.current), A(Ao, Ao.current);
	}
	function Io(e) {
		De(Ao), jo === e && (jo = null), De(Lo);
	}
	var Lo = Ee(0);
	function Ro(e, t) {
		A(Ao, Ao.current), A(Lo, t);
	}
	function zo(e) {
		De(Lo), De(Ao), jo === e && (jo = null);
	}
	function Bo(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || om(n) || sm(n))) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== "independent") {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var Vo = 0, H = null, U = null, Ho = null, Uo = !1, Wo = !1, Go = !1, Ko = 0, qo = 0, Jo = null, Yo = 0;
	function Xo() {
		throw Error(i(321));
	}
	function Zo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Vr(e[n], t[n])) return !1;
		return !0;
	}
	function Qo(e, t, n, r, i, a) {
		return Vo = a, H = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, O.H = e === null || e.memoizedState === null ? hc : gc, Go = !1, a = n(r, i), Go = !1, Wo && (a = es(t, n, r, i)), $o(e), a;
	}
	function $o(e) {
		O.H = mc;
		var t = U !== null && U.next !== null;
		if (Vo = 0, Ho = U = H = null, Uo = !1, qo = 0, Jo = null, t) throw Error(i(300));
		e === null || Nc || (e = e.dependencies, e !== null && Sa(e) && (Nc = !0));
	}
	function es(e, t, n, r) {
		H = e;
		var a = 0;
		do {
			if (Wo && (Jo = null), qo = 0, Wo = !1, 25 <= a) throw Error(i(301));
			if (a += 1, Ho = U = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			O.H = _c, o = t(n, r);
		} while (Wo);
		return o;
	}
	function ts() {
		var e = O.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? cs(t) : t, e = e.useState()[0], (U === null ? null : U.memoizedState) !== e && (H.flags |= 1024), t;
	}
	function ns() {
		var e = Ko !== 0;
		return Ko = 0, e;
	}
	function rs(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function is(e) {
		if (Uo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			Uo = !1;
		}
		Vo = 0, Ho = U = H = null, Wo = !1, qo = Ko = 0, Jo = null;
	}
	function as() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Ho === null ? H.memoizedState = Ho = e : Ho = Ho.next = e, Ho;
	}
	function os() {
		if (U === null) {
			var e = H.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = U.next;
		var t = Ho === null ? H.memoizedState : Ho.next;
		if (t !== null) Ho = t, U = e;
		else {
			if (e === null) throw H.alternate === null ? Error(i(467)) : Error(i(310));
			U = e, e = {
				memoizedState: U.memoizedState,
				baseState: U.baseState,
				baseQueue: U.baseQueue,
				queue: U.queue,
				next: null
			}, Ho === null ? H.memoizedState = Ho = e : Ho = Ho.next = e;
		}
		return Ho;
	}
	function ss() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function cs(e) {
		var t = qo;
		return qo += 1, Jo === null && (Jo = []), e = $a(Jo, e, t), t = H, (Ho === null ? t.memoizedState : Ho.next) === null && (t = t.alternate, O.H = t === null || t.memoizedState === null ? hc : gc), e;
	}
	function ls(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return cs(e);
			if (e.$$typeof === _e) return;
			if (e.$$typeof === E) return wa(e);
		}
		throw Error(i(438, String(e)));
	}
	function us(e) {
		var t = null, n = H.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = H.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = ss(), H.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = he;
		return t.index++, n;
	}
	function ds(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function fs(e) {
		return ps(os(), U, e);
	}
	function ps(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(i(311));
		r.lastRenderedReducer = n;
		var a = e.baseQueue, o = r.pending;
		if (o !== null) {
			if (a !== null) {
				var s = a.next;
				a.next = o.next, o.next = s;
			}
			t.baseQueue = a = o, r.pending = null;
		}
		if (o = e.baseState, a === null) e.memoizedState = o;
		else {
			t = a.next;
			var c = s = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (Vo & f) === f : (Y & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Ra && (d = !0);
					else if ((Vo & p) === p) {
						u = u.next, p === Ra && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, H.lanes |= p, od |= p;
					f = u.action, Go && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, H.lanes |= f, od |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !Vr(o, e.memoizedState) && (Nc = !0, d && (n = za, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function ms(e) {
		var t = os(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			Vr(o, t.memoizedState) || (Nc = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function hs(e, t, n) {
		var r = H, a = os(), o = V;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !Vr((U || a).memoizedState, n);
		if (s && (a.memoizedState = n, Nc = !0), a = a.queue, Bs(vs.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || Ho !== null && !!(Ho.memoizedState.tag & 1), Fs(e ? 9 : 8, { destroy: void 0 }, _s.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, q === null) throw Error(i(349));
			o || Vo & 127 || gs(r, t, n);
		}
		return n;
	}
	function gs(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = H.updateQueue, t === null ? (t = ss(), H.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function _s(e, t, n, r) {
		t.value = n, t.getSnapshot = r, ys(t) && bs(e);
	}
	function vs(e, t, n) {
		return n(function() {
			ys(t) && bs(e);
		});
	}
	function ys(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Vr(e, n);
		} catch {
			return !0;
		}
	}
	function bs(e) {
		var t = Di(e, 2);
		t !== null && Pd(t, e, 2);
	}
	function xs(e) {
		var t = as();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Go) {
				it(!0);
				try {
					n();
				} finally {
					it(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ds,
			lastRenderedState: e
		}, t;
	}
	function Ss(e, t, n, r) {
		return e.baseState = n, ps(e, U, typeof r == "function" ? r : ds);
	}
	function Cs(e, t, n, r, a) {
		if (dc(e)) throw Error(i(485));
		if (e = t.action, e !== null) {
			var o = {
				payload: a,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					o.listeners.push(e);
				}
			};
			O.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, ws(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function ws(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = O.T, o = {};
			o.types = a === null ? null : a.types, O.T = o;
			try {
				var s = n(i, r), c = O.S;
				c !== null && c(o, s), Ts(e, t, s);
			} catch (n) {
				Ds(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), O.T = a;
			}
		} else try {
			a = n(i, r), Ts(e, t, a);
		} catch (n) {
			Ds(e, t, n);
		}
	}
	function Ts(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Es(e, t, n);
		}, function(n) {
			return Ds(e, t, n);
		}) : Es(e, t, n);
	}
	function Es(e, t, n) {
		t.status = "fulfilled", t.value = n, Os(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, ws(e, n)));
	}
	function Ds(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Os(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Os(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function ks(e, t) {
		return t;
	}
	function As(e, t) {
		if (V) {
			var n = q.formState;
			if (n !== null) {
				a: {
					var r = H;
					if (V) {
						if (B) {
							b: {
								for (var i = B, a = aa; i.nodeType !== 8;) if (!a || (i = lm(i.nextSibling), i === null)) {
									i = null;
									break b;
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								B = lm(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						sa(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = as(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ks,
			lastRenderedState: t
		}, n.queue = r, n = cc.bind(null, H, r), r.dispatch = n, r = xs(!1), a = uc.bind(null, H, !1, r.queue), r = as(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Cs.bind(null, H, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function js(e) {
		return Ms(os(), U, e);
	}
	function Ms(e, t, n) {
		if (t = ps(e, t, ks)[0], e = fs(ds)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = cs(t);
		} catch (e) {
			throw e === Ja ? Xa : e;
		}
		else r = t;
		t = os();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (H.flags |= 2048, Fs(9, { destroy: void 0 }, Ns.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Ns(e, t) {
		e.action = t;
	}
	function Ps(e) {
		var t = os(), n = U;
		if (n !== null) return Ms(t, n, e);
		os(), t = t.memoizedState, n = os();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function Fs(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = H.updateQueue, t === null && (t = ss(), H.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function Is() {
		return os().memoizedState;
	}
	function Ls(e, t, n, r) {
		var i = as();
		H.flags |= e, i.memoizedState = Fs(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Rs(e, t, n, r) {
		var i = os();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		U !== null && r !== null && Zo(r, U.memoizedState.deps) ? i.memoizedState = Fs(t, a, n, r) : (H.flags |= e, i.memoizedState = Fs(1 | t, a, n, r));
	}
	function zs(e, t) {
		Ls(8390656, 8, e, t);
	}
	function Bs(e, t) {
		Rs(2048, 8, e, t);
	}
	function Vs(e) {
		H.flags |= 4;
		var t = H.updateQueue;
		if (t === null) t = ss(), H.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Hs(e) {
		var t = os().memoizedState;
		return Vs({
			ref: t,
			nextImpl: e
		}), function() {
			if (K & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Us(e, t) {
		return Rs(4, 2, e, t);
	}
	function Ws(e, t) {
		return Rs(4, 4, e, t);
	}
	function Gs(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function Ks(e, t, n) {
		n = n == null ? null : n.concat([e]), Rs(4, 4, Gs.bind(null, t, e), n);
	}
	function qs() {}
	function Js(e, t) {
		var n = os();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && Zo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Ys(e, t) {
		var n = os();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && Zo(t, r[1])) return r[0];
		if (r = e(), Go) {
			it(!0);
			try {
				e();
			} finally {
				it(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Xs(e, t, n) {
		return n === void 0 || Vo & 1073741824 && !(Y & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Md(), H.lanes |= e, od |= e, n);
	}
	function Zs(e, t, n, r) {
		return Vr(n, t) ? n : To.current === null ? !(Vo & 106) || Vo & 1073741824 && !(Y & 261930) ? (Nc = !0, e.memoizedState = n) : (e = Md(), H.lanes |= e, od |= e, t) : (e = Xs(e, n, r), Vr(e, t) || (Nc = !0), e);
	}
	function Qs(e, t, n, r, i) {
		var a = k.p;
		k.p = a !== 0 && 8 > a ? a : 8;
		var o = O.T, s = {};
		s.types = o === null ? null : o.types, O.T = s, uc(e, !1, t, n);
		try {
			var c = i(), l = O.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? lc(e, t, Ha(c, r), jd(e)) : lc(e, t, r, jd(e));
		} catch (n) {
			lc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, jd());
		} finally {
			k.p = a, o !== null && s.types !== null && (o.types = s.types), O.T = o;
		}
	}
	function $s() {}
	function ec(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = tc(e).queue;
		Qs(e, a, t, Ce, n === null ? $s : function() {
			return nc(e), n(r);
		});
	}
	function tc(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: Ce,
			baseState: Ce,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ds,
				lastRenderedState: Ce
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ds,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function nc(e) {
		var t = tc(e);
		t.next === null && (t = e.alternate.memoizedState), lc(e, t.next.queue, {}, jd());
	}
	function rc() {
		return wa(sh);
	}
	function ic() {
		return os().memoizedState;
	}
	function ac() {
		return os().memoizedState;
	}
	function oc(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = jd();
					e = go(n);
					var r = _o(t, e, n);
					r !== null && (Pd(r, t, n), vo(r, t, n)), t = { cache: ja() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function sc(e, t, n) {
		var r = jd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, dc(e) ? fc(t, n) : (n = Ei(e, t, n, r), n !== null && (Pd(n, e, r), pc(n, t, r)));
	}
	function cc(e, t, n) {
		lc(e, t, n, jd());
	}
	function lc(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (dc(e)) fc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Vr(s, o)) return Ti(e, t, i, 0), q === null && wi(), !1;
			} catch {}
			if (n = Ei(e, t, i, r), n !== null) return Pd(n, e, r), pc(n, t, r), !0;
		}
		return !1;
	}
	function uc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Pf(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, dc(e)) {
			if (t) throw Error(i(479));
		} else t = Ei(e, n, r, 2), t !== null && Pd(t, e, 2);
	}
	function dc(e) {
		var t = e.alternate;
		return e === H || t !== null && t === H;
	}
	function fc(e, t) {
		Wo = Uo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function pc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, bt(e, n);
		}
	}
	var mc = {
		readContext: wa,
		use: ls,
		useCallback: Xo,
		useContext: Xo,
		useEffect: Xo,
		useImperativeHandle: Xo,
		useLayoutEffect: Xo,
		useInsertionEffect: Xo,
		useMemo: Xo,
		useReducer: Xo,
		useRef: Xo,
		useState: Xo,
		useDebugValue: Xo,
		useDeferredValue: Xo,
		useTransition: Xo,
		useSyncExternalStore: Xo,
		useId: Xo,
		useHostTransitionStatus: Xo,
		useFormState: Xo,
		useActionState: Xo,
		useOptimistic: Xo,
		useMemoCache: Xo,
		useCacheRefresh: Xo,
		useEffectEvent: Xo
	}, hc = {
		readContext: wa,
		use: ls,
		useCallback: function(e, t) {
			return as().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: wa,
		useEffect: zs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Ls(4194308, 4, Gs.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Ls(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Ls(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = as();
			t = t === void 0 ? null : t;
			var r = e();
			if (Go) {
				it(!0);
				try {
					e();
				} finally {
					it(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = as();
			if (n !== void 0) {
				var i = n(t);
				if (Go) {
					it(!0);
					try {
						n(t);
					} finally {
						it(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = sc.bind(null, H, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = as();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = xs(e);
			var t = e.queue, n = cc.bind(null, H, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: qs,
		useDeferredValue: function(e, t) {
			return Xs(as(), e, t);
		},
		useTransition: function() {
			var e = xs(!1);
			return e = Qs.bind(null, H, e.queue, !0, !1), as().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = H, a = as();
			if (V) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), q === null) throw Error(i(349));
				Y & 127 || gs(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, zs(vs.bind(null, r, o, e), [e]), r.flags |= 2048, Fs(9, { destroy: void 0 }, _s.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = as(), t = q.identifierPrefix;
			if (V) {
				var n = Zi, r = Xi;
				n = (r & ~(1 << 32 - at(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Ko++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Yo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: rc,
		useFormState: As,
		useActionState: As,
		useOptimistic: function(e) {
			var t = as();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = uc.bind(null, H, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: us,
		useCacheRefresh: function() {
			return as().memoizedState = oc.bind(null, H);
		},
		useEffectEvent: function(e) {
			var t = as(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (K & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, gc = {
		readContext: wa,
		use: ls,
		useCallback: Js,
		useContext: wa,
		useEffect: Bs,
		useImperativeHandle: Ks,
		useInsertionEffect: Us,
		useLayoutEffect: Ws,
		useMemo: Ys,
		useReducer: fs,
		useRef: Is,
		useState: function() {
			return fs(ds);
		},
		useDebugValue: qs,
		useDeferredValue: function(e, t) {
			return Zs(os(), U.memoizedState, e, t);
		},
		useTransition: function() {
			var e = fs(ds)[0], t = os().memoizedState;
			return [typeof e == "boolean" ? e : cs(e), t];
		},
		useSyncExternalStore: hs,
		useId: ic,
		useHostTransitionStatus: rc,
		useFormState: js,
		useActionState: js,
		useOptimistic: function(e, t) {
			return Ss(os(), U, e, t);
		},
		useMemoCache: us,
		useCacheRefresh: ac,
		useEffectEvent: Hs
	}, _c = {
		readContext: wa,
		use: ls,
		useCallback: Js,
		useContext: wa,
		useEffect: Bs,
		useImperativeHandle: Ks,
		useInsertionEffect: Us,
		useLayoutEffect: Ws,
		useMemo: Ys,
		useReducer: ms,
		useRef: Is,
		useState: function() {
			return ms(ds);
		},
		useDebugValue: qs,
		useDeferredValue: function(e, t) {
			var n = os();
			return U === null ? Xs(n, e, t) : Zs(n, U.memoizedState, e, t);
		},
		useTransition: function() {
			var e = ms(ds)[0], t = os().memoizedState;
			return [typeof e == "boolean" ? e : cs(e), t];
		},
		useSyncExternalStore: hs,
		useId: ic,
		useHostTransitionStatus: rc,
		useFormState: Ps,
		useActionState: Ps,
		useOptimistic: function(e, t) {
			var n = os();
			return U === null ? (n.baseState = e, [e, n.queue.dispatch]) : Ss(n, U, e, t);
		},
		useMemoCache: us,
		useCacheRefresh: ac,
		useEffectEvent: Hs
	};
	function vc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : w({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var yc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = go(r);
			i.payload = t, n != null && (i.callback = n), t = _o(e, i, r), t !== null && (Pd(t, e, r), vo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = go(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = _o(e, i, r), t !== null && (Pd(t, e, r), vo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = jd(), r = go(n);
			r.tag = 2, t != null && (r.callback = t), t = _o(e, r, n), t !== null && (Pd(t, e, n), vo(t, e, n));
		}
	};
	function bc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Hr(n, r) || !Hr(i, a) : !0;
	}
	function xc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && yc.enqueueReplaceState(t, t.state, null);
	}
	function Sc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = w({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Cc(e) {
		bi(e);
	}
	function wc(e) {
		console.error(e);
	}
	function Tc(e) {
		bi(e);
	}
	function Ec(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Dc(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Oc(e, t, n) {
		return n = go(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Ec(e, t);
		}, n;
	}
	function kc(e) {
		return e = go(e), e.tag = 3, e;
	}
	function Ac(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Dc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Dc(t, n, r), typeof i != "function" && (vd === null ? vd = /* @__PURE__ */ new Set([this]) : vd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function jc(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && xa(t, n, a, !0), n = Ao.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return jo === null ? Kd() : n.alternate === null && ad === 0 && (ad = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === Za ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), mf(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === Za ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), mf(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return mf(e, r, a), Kd(), !1;
		}
		if (V) return t = Ao.current, t === null ? (r !== oa && (t = Error(i(423), { cause: r }), pa(Hi(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Hi(r, n), a = Oc(e.stateNode, r, a), yo(e, a), ad !== 4 && (ad = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== oa && (e = Error(i(422), { cause: r }), pa(Hi(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Hi(o, n), dd === null ? dd = [o] : dd.push(o), ad !== 4 && (ad = 2), t === null) return !0;
		r = Hi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = Oc(n.stateNode, r, e), yo(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (vd === null || !vd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = kc(a), Ac(a, e, n, r), yo(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Mc = Error(i(461)), Nc = !1;
	function Pc(e, t, n, r) {
		t.child = e === null ? fo(t, null, n, r) : uo(t, e.child, n, r);
	}
	function Fc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Ca(t), r = Qo(e, t, n, o, a, i), s = ns(), e !== null && !Nc ? (rs(e, t, i), ll(e, t, i)) : (V && s && ea(t), t.flags |= 1, Pc(e, t, r, i), t.child);
	}
	function Ic(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Ni(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Lc(e, t, a, r, i)) : (e = Ii(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !ul(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Hr : n, n(o, r) && e.ref === t.ref) return ll(e, t, i);
		}
		return t.flags |= 1, e = Pi(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Lc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Hr(a, r) && e.ref === t.ref) {
				if (Nc = !1, t.pendingProps = r = a, ul(e, i)) e.flags & 131072 && (Nc = !0);
				else return t.lanes = e.lanes, ll(e, t, i);
			}
		}
		return Gc(e, t, n, r, i);
	}
	function Rc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return Bc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Ka(t, a === null ? null : a.cachePool), a === null ? Oo() : Do(t, a), Po(t);
			else return r = t.lanes = 536870912, Bc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Ka(t, null), Oo(), Fo()) : (Ka(t, a.cachePool), Do(t, a), Fo(), t.memoizedState = null);
		return Pc(e, t, i, n), t.child;
	}
	function zc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Bc(e, t, n, r, i) {
		var a = Ga();
		return a = a === null ? null : {
			parent: Aa._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Ka(t, null), Oo(), Po(t), e !== null && xa(e, t, r, !0), t.childLanes = i, null;
	}
	function Vc(e, t) {
		return t = el({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Hc(e, t, n) {
		return uo(t, e.child, null, n), e = Vc(t, t.pendingProps), e.flags |= 2, Io(t), t.memoizedState = null, e;
	}
	function Uc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (V) {
				if (r.mode === "hidden") return e = Vc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, zc(null, e);
				if (No(t), (e = B) ? (e = am(e, aa), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Yi === null ? null : {
						id: Xi,
						overflow: Zi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = zi(e), n.return = t, t.child = n, ra = t, B = null)) : e = null, e === null) throw sa(t);
				return t.lanes = 536870912, null;
			}
			return Vc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (No(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Hc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (Nc || xa(e, t, n, !1), a = (n & e.childLanes) !== 0, Nc || a) {
				if (To.current === null) {
					if (r = q, r !== null && (s = xt(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, Di(e, s), Pd(r, e, s), Mc;
					Kd();
				}
				t = Hc(e, t, n);
			} else e = o.treeContext, B = lm(s.nextSibling), ra = t, V = !0, ia = null, aa = !1, e !== null && na(t, e), t = Vc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Pi(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function Wc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Gc(e, t, n, r, i) {
		return Ca(t), n = Qo(e, t, n, r, void 0, i), r = ns(), e !== null && !Nc ? (rs(e, t, i), ll(e, t, i)) : (V && r && ea(t), t.flags |= 1, Pc(e, t, n, i), t.child);
	}
	function Kc(e, t, n, r, i, a) {
		return Ca(t), t.updateQueue = null, n = es(t, r, n, i), $o(e), r = ns(), e !== null && !Nc ? (rs(e, t, a), ll(e, t, a)) : (V && r && ea(t), t.flags |= 1, Pc(e, t, n, a), t.child);
	}
	function qc(e, t, n, r, i) {
		if (Ca(t), t.stateNode === null) {
			var a = Ai, o = n.contextType;
			typeof o == "object" && o && (a = wa(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = yc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, mo(t), o = n.contextType, a.context = typeof o == "object" && o ? wa(o) : Ai, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (vc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && yc.enqueueReplaceState(a, a.state, null), So(t, r, a, i), xo(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Sc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Ai, typeof u == "object" && u && (o = wa(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && xc(t, a, r, o), po = !1;
			var f = t.memoizedState;
			a.state = f, So(t, r, a, i), xo(), l = t.memoizedState, s || f !== l || po ? (typeof d == "function" && (vc(t, n, d, r), l = t.memoizedState), (c = po || bc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, ho(e, t), o = t.memoizedProps, u = Sc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Ai, typeof l == "object" && l && (c = wa(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && xc(t, a, r, c), po = !1, f = t.memoizedState, a.state = f, So(t, r, a, i), xo();
			var p = t.memoizedState;
			o !== d || f !== p || po || e !== null && e.dependencies !== null && Sa(e.dependencies) ? (typeof s == "function" && (vc(t, n, s, r), p = t.memoizedState), (u = po || bc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Sa(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, Wc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = uo(t, e.child, null, i), t.child = uo(t, null, n, i)) : Pc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = ll(e, t, i), e;
	}
	function Jc(e, t, n, r) {
		return da(), t.flags |= 256, Pc(e, t, n, r), t.child;
	}
	var Yc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Xc(e) {
		return {
			baseLanes: e,
			cachePool: qa()
		};
	}
	function Zc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ld), e;
	}
	function Qc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Lo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (V) {
				if (i ? Mo(t) : Fo(), (e = B) ? (e = am(e, aa), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Yi === null ? null : {
						id: Xi,
						overflow: Zi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = zi(e), n.return = t, t.child = n, ra = t, B = null)) : e = null, e === null) throw sa(t);
				return t.lanes = sm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Fo(), i = t.mode, a = el({
				mode: "hidden",
				children: a
			}, i), r = Li(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = Xc(n), r.childLanes = Zc(e, o, n), t.memoizedState = Yc, zc(null, r)) : (Mo(t), $c(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return nl(e, t, a, o, r, c, s, n);
		}
		return i ? (Fo(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Pi(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Li(i, a, n, null), i.flags |= 2) : i = Pi(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, zc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = Xc(n) : (a = i.cachePool, a === null ? a = qa() : (s = Aa._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = Zc(e, o, n), t.memoizedState = Yc, zc(e.child, r)) : (Mo(t), n = e.child, e = n.sibling, n = Pi(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function $c(e, t) {
		return t = el({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function el(e, t) {
		return e = Mi(22, e, null, t), e.lanes = 0, e;
	}
	function tl(e, t, n) {
		return uo(t, e.child, null, n), e = $c(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function nl(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (Mo(t), t.flags &= -257, tl(e, t, c)) : t.memoizedState === null ? (Fo(), o = a.fallback, s = t.mode, a = el({
			mode: "visible",
			children: a.children
		}, s), o = Li(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, uo(t, e.child, null, c), a = t.child, a.memoizedState = Xc(c), a.childLanes = Zc(e, r, c), t.memoizedState = Yc, zc(null, a)) : (Fo(), t.child = e.child, t.flags |= 128, null);
		if (Mo(t), sm(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, pa({
				value: a,
				source: null,
				stack: null
			})), tl(e, t, c);
		}
		if (Nc || xa(e, t, c, !1), r = (c & e.childLanes) !== 0, Nc || r) {
			if (To.current !== null) return tl(e, t, c);
			if (r = q, r !== null && (a = xt(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, Di(e, a), Pd(r, e, a), Mc;
			return om(o) || Kd(), tl(e, t, c);
		}
		return om(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, B = lm(o.nextSibling), ra = t, V = !0, ia = null, aa = !1, e !== null && na(t, e), t = $c(t, a.children), t.flags |= 134221824, t);
	}
	function rl(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), ya(e.return, t, n);
	}
	function il(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Bo(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function al(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function ol(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function sl(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = Lo.current;
		if (t.flags & 128) return Ro(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, Ro(t, o), i === "backwards" && e !== null ? (ol(e), Pc(e, t, r, n), ol(e)) : Pc(e, t, r, n), r = V ? Ki : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && rl(e, n, t);
			else if (e.tag === 19) rl(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "backwards":
				n = il(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, ol(t)), al(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Bo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				al(t, !0, n, null, a, r);
				break;
			case "together":
				al(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = il(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), al(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function cl(e, t, n) {
		var r = t.pendingProps;
		return _a(t, t.type, r.value), Pc(e, t, r.children, n), t.child;
	}
	function ll(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), od |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (xa(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Pi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Pi(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function ul(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && Sa(e)));
	}
	function dl(e, t, n) {
		switch (t.tag) {
			case 3:
				Me(t, t.stateNode.containerInfo), _a(t, Aa, e.memoizedState.cache), da();
				break;
			case 27:
			case 5:
				Pe(t);
				break;
			case 4:
				Me(t, t.stateNode.containerInfo);
				break;
			case 10:
				_a(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, No(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return Mo(t), t.flags |= 128, null;
					r = xa(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? Qc(e, t, n) : (Mo(t), e = ll(e, t, n), e === null ? null : e.sibling);
				}
				Mo(t);
				break;
			case 19:
				if (t.flags & 128) return sl(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (xa(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return sl(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Ro(t, Lo.current), r) break;
				return null;
			case 22: return t.lanes = 0, Rc(e, t, n, t.pendingProps);
			case 24: _a(t, Aa, e.memoizedState.cache);
		}
		return ll(e, t, n);
	}
	function fl(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Nc = !0;
			else {
				if (!ul(e, n) && !(t.flags & 128)) return Nc = !1, dl(e, t, n);
				Nc = !!(e.flags & 131072);
			}
		} else Nc = !1, V && t.flags & 1048576 && $i(t, Ki, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = eo(t.elementType), t.type = e, typeof e == "function") Ni(e) ? (r = Sc(e, r), t.tag = 1, t = qc(null, t, e, r, n)) : (t.tag = 0, t = Gc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === D) {
								t.tag = 11, t = Fc(null, t, e, r, n);
								break a;
							}
							if (a === de) {
								t.tag = 14, t = Ic(null, t, e, r, n);
								break a;
							}
							if (a === E) {
								t.tag = 10, t.type = e, t = cl(null, t, n);
								break a;
							}
						}
						throw t = xe(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Gc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = Sc(r, t.pendingProps), qc(e, t, r, a, n);
			case 3:
				a: {
					if (Me(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, ho(e, t), So(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, _a(t, Aa, r), r !== o.cache && ba(t, [Aa], n, !0), xo(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = Jc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Hi(Error(i(424)), t), pa(a), t = Jc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (B = lm(e.firstChild), ra = t, V = !0, ia = null, aa = !0, n = fo(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (da(), r === a) {
							t = ll(e, t, n);
							break a;
						}
						Pc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return Wc(e, t), e === null ? (n = Nm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : V || (t.stateNode = fp(t.type, t.pendingProps, Ae.current, t)) : t.memoizedState = Nm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Pe(t), e === null && V && (r = t.stateNode = hm(t.type, t.pendingProps, Ae.current), ra = t, aa = !0, a = B, Sp(t.type) ? (um = a, B = lm(r.firstChild)) : B = a), Pc(e, t, t.pendingProps.children, n), Wc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && V && ((a = r = B) && (r = rm(r, t.type, t.pendingProps, aa), r === null ? a = !1 : (t.stateNode = r, ra = t, B = lm(r.firstChild), aa = !1, a = !0)), a || sa(t)), Pe(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, pp(a, o) ? r = null : s !== null && pp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = Qo(e, t, ts, null, null, n), sh._currentValue = a), Wc(e, t), Pc(e, t, r, n), t.child;
			case 6: return e === null && V && ((e = n = B) && (n = im(n, t.pendingProps, aa), n === null ? e = !1 : (t.stateNode = n, ra = t, B = null, e = !0)), e || sa(t)), null;
			case 13: return Qc(e, t, n);
			case 4: return Me(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = uo(t, null, r, n) : Pc(e, t, r, n), t.child;
			case 11: return Fc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, Wc(e, t), Pc(e, t, r, n), t.child;
			case 8: return Pc(e, t, t.pendingProps.children, n), t.child;
			case 12: return Pc(e, t, t.pendingProps.children, n), t.child;
			case 10: return cl(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, Ca(t), a = wa(a), r = r(a), t.flags |= 1, Pc(e, t, r, n), t.child;
			case 14: return Ic(e, t, t.type, t.pendingProps, n);
			case 15: return Lc(e, t, t.type, t.pendingProps, n);
			case 19: return sl(e, t, n);
			case 31: return Uc(e, t, n);
			case 22: return Rc(e, t, n, t.pendingProps);
			case 24: return Ca(t), r = wa(Aa), e === null ? (a = Ga(), a === null && (a = q, o = ja(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, mo(t), _a(t, Aa, a)) : ((e.lanes & n) !== 0 && (ho(e, t), So(t, null, null, n), xo()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, _a(t, Aa, r), r !== a.cache && ba(t, [Aa], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), _a(t, Aa, r))), Pc(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : V && ea(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : Wc(e, t), Pc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function pl(e) {
		e.flags |= 4;
	}
	function ml(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Jm(t, r) : Jm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Ud()) e.flags |= 8192;
				else throw to = Za, Ya;
			}
		} else e.flags &= -16777217;
	}
	function hl(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Ym(t)) {
			if (Ud()) e.flags |= 8192;
			else throw to = Za, Ya;
		}
	}
	function gl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : ht(), e.lanes |= t, ud |= t);
	}
	function _l(e, t) {
		if (!V) switch (e.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var n = e.tail, r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
				break;
			default:
				for (t = e.tail, n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
		}
	}
	function W(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function vl(e, t, n) {
		var r = t.pendingProps;
		switch (ta(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return W(t), null;
			case 1: return W(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), va(Aa), Ne(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (ua(t) ? pl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, fa())), W(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (pl(t), o === null ? (W(t), ml(t, a, null, r, n)) : (W(t), hl(t, o))) : o ? o === e.memoizedState ? (W(t), t.flags &= -16777217) : (pl(t), W(t), hl(t, o)) : (e = e.memoizedProps, e !== r && pl(t), W(t), ml(t, a, e, r, n)), null;
			case 27:
				if (Fe(t), n = Ae.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return W(t), t.subtreeFlags &= -33554433, null;
					}
					e = Oe.current, ua(t) ? ca(t, e) : (e = hm(a, r, n), t.stateNode = e, pl(t));
				}
				return W(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Fe(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return W(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = Oe.current, ua(t)) ca(t, o);
					else {
						var s = lp(Ae.current);
						switch (o) {
							case 1:
								o = s.createElementNS("http://www.w3.org/2000/svg", a);
								break;
							case 2:
								o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
								break;
							default: switch (a) {
								case "svg":
									o = s.createElementNS("http://www.w3.org/2000/svg", a);
									break;
								case "math":
									o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
									break;
								case "script":
									o = s.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(o.firstChild);
									break;
								case "select":
									o = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? o.multiple = !0 : r.size && (o.size = r.size);
									break;
								default: o = typeof r.is == "string" ? s.createElement(a, { is: r.is }) : s.createElement(a);
							}
						}
						o[Dt] = t, o[Ot] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = o;
						a: switch (np(o, a, r), a) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && pl(t);
					}
				}
				return W(t), t.subtreeFlags &= -33554433, ml(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && pl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Ae.current, ua(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = ra, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[Dt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || ep(e.nodeValue, n)), e || sa(t, !0);
					} else e = lp(e).createTextNode(r), e[Dt] = t, t.stateNode = e;
				}
				return W(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = ua(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[Dt] = t;
						} else da(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						W(t), e = !1;
					} else n = fa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Io(t), t) : (Io(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return W(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = ua(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[Dt] = t;
						} else da(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						W(t), a = !1;
					} else a = fa(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (Io(t), t) : (Io(t), null);
				}
				return Io(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), gl(t, t.updateQueue), W(t), null);
			case 4: return Ne(), e === null && Wf(t.stateNode.containerInfo), t.flags |= 67108864, W(t), null;
			case 10: return va(t.type), W(t), null;
			case 19:
				if (zo(t), r = t.memoizedState, r === null) return W(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) _l(r, !1);
					else {
						if (ad !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Bo(e), o !== null) {
								for (t.flags |= 128, _l(r, !1), e = o.updateQueue, t.updateQueue = e, gl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Fi(n, e), n = n.sibling;
								return Ro(t, Lo.current & 1 | 2), V && Qi(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Je() > gd && (t.flags |= 128, a = !0, _l(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Bo(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, gl(t, e), _l(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !V) return W(t), null;
						} else 2 * Je() - r.renderingStartTime > gd && n !== 536870912 && (t.flags |= 128, a = !0, _l(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (o.sibling = t.child, t.child = o) : (e = r.last, e === null ? t.child = o : e.sibling = o, r.last = o);
				}
				if (r.tail !== null) {
					e = r.tail;
					a: {
						for (n = e; n !== null;) {
							if (n.alternate !== null) {
								n = !1;
								break a;
							}
							n = n.sibling;
						}
						n = !0;
					}
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Je(), e.sibling = null, o = Lo.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || V ? Ro(t, o) : (n = o, A(Ao, t), A(Lo, n), jo === null && (jo = t)), V && Qi(t, r.treeForkCount), e;
				}
				return W(t), null;
			case 22:
			case 23: return Io(t), ko(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (W(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : W(t), n = t.updateQueue, n !== null && gl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && De(Wa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), va(Aa), W(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, W(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function yl(e, t) {
		switch (ta(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return va(Aa), Ne(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Fe(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (Io(t), t.alternate === null) throw Error(i(340));
					da();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (Io(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					da();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return zo(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Ne(), null;
			case 10: return va(t.type), null;
			case 22:
			case 23: return Io(t), ko(), e !== null && De(Wa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return va(Aa), null;
			case 25: return null;
			default: return null;
		}
	}
	function bl(e, t) {
		switch (ta(t), t.tag) {
			case 3:
				va(Aa), Ne();
				break;
			case 26:
			case 27:
			case 5:
				Fe(t);
				break;
			case 4:
				Ne();
				break;
			case 31:
				t.memoizedState !== null && Io(t);
				break;
			case 13:
				Io(t);
				break;
			case 19:
				zo(t);
				break;
			case 10:
				va(t.type);
				break;
			case 22:
			case 23:
				Io(t), ko(), e !== null && De(Wa);
				break;
			case 24: va(Aa);
		}
	}
	function xl(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Sl(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								Z(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Cl(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				wo(t, n);
			} catch (t) {
				Z(e, e.return, t);
			}
		}
	}
	function wl(e, t, n) {
		n.props = Sc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Z(e, t, n);
		}
	}
	function Tl(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						var i = e.stateNode, a = _i(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Pp(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Fp(e);
							f(e.child, !1, Qp, o, void 0, void 0), e.stateNode = o;
						}
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			Z(e, t, n);
		}
	}
	function El(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				Z(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				Z(e, t, n);
			}
			else n.current = null;
		}
	}
	function Dl(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) em(e.stateNode, t[n]);
	}
	function Ol(e) {
		for (var t = e.return; t !== null && (jl(t) && em(e.stateNode, t.stateNode), !Al(t));) t = t.return;
	}
	function kl(e) {
		for (var t = e.return; t !== null && (jl(t) && tm(e.stateNode, t.stateNode), !Al(t));) t = t.return;
	}
	function Al(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function jl(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function Ml(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Nl(e, t, n) {
		try {
			var r = e.stateNode;
			ip(r, e.type, n, t), r[Ot] = t;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Pl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Sp(e.type) || e.tag === 4;
	}
	function Fl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Pl(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Sp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Il(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = xn)), Dl(e, r), I = !0;
		else if (i !== 4 && (i === 27 && (Dl(e, r), r = null, Sp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (Il(e, t, n, r), e = e.sibling; e !== null;) Il(e, t, n, r), e = e.sibling;
	}
	function Ll(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), Dl(e, r), I = !0;
		else if (i !== 4 && (i === 27 && (Dl(e, r), r = null, Sp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Ll(e, t, n, r), e = e.sibling; e !== null;) Ll(e, t, n, r), e = e.sibling;
	}
	function Rl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			np(t, r, n), t[Dt] = e, t[Ot] = n;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	var zl = !1, Bl = null;
	function Vl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (zl = !0);
	}
	var Hl = null;
	function Ul() {
		var e = Hl;
		return Hl = null, e;
	}
	var Wl = 0;
	function Gl(e, t, n, r, i) {
		return Wl = 0, Kl(e.child, t, n, r, i);
	}
	function Kl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = Op(o);
					r.push(s), s.view && (a = !0);
				} else a || Op(o).view && (a = !0);
				zl = !0, Tp(o, Wl === 0 ? t : t + "_" + Wl, n), Wl++;
			} else e.tag === 22 && e.memoizedState !== null || e.tag === 30 && i || Kl(e.child, t, n, r, i) && (a = !0);
			e = e.sibling;
		}
		return a;
	}
	function ql(e, t) {
		for (; e !== null;) e.tag === 5 ? Ep(e.stateNode, e.memoizedProps) : e.tag === 22 && e.memoizedState !== null || e.tag === 30 && t || ql(e.child, t), e = e.sibling;
	}
	function Jl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Jl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = yi(t.default, t.share), t !== "none" && (Gl(e, n, t, null, !1) || ql(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Yl(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = _i(r, n), a = yi(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Jl(e) : Gl(e, i, a, null, !1) ? (Jl(e), n.paired || t || Nd(e, r.onEnter)) : ql(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Yl(e, t), e = e.sibling;
		else Jl(e);
	}
	function Xl(e) {
		if (Bl !== null && Bl.size !== 0) {
			var t = Bl;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = yi(n.default, n.share);
								if (a !== "none" && (Gl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Nd(e, n.onShare)) : ql(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					Xl(e);
				}
				e = e.sibling;
			}
		}
	}
	function Zl(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = _i(t, e.stateNode), r = Bl === null ? void 0 : Bl.get(n), i = yi(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Gl(e, n, i, null, !1) ? r === void 0 ? Nd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Bl.delete(n), Nd(e, t.onShare)) : ql(e.child, !1)), Bl !== null && Xl(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Zl(e), e = e.sibling;
		else Bl !== null && Xl(e);
	}
	function Ql(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = _i(t, e.stateNode);
				t = yi(t.default, t.update), e.flags &= -5, t !== "none" && Gl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && Ql(e);
			e = e.sibling;
		}
	}
	function $l(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, ql(e.child, !1));
				}
				$l(e);
			}
			e = e.sibling;
		}
	}
	function eu(e) {
		if (e.tag === 30) e.stateNode.paired = null, ql(e.child, !1), $l(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) eu(e), e = e.sibling;
		else $l(e);
	}
	function tu(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? ql(e.child, !1) : e.subtreeFlags & 33554432 && tu(e), e = e.sibling;
	}
	function nu(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && Wl < a.length) {
					var l = a[Wl], u = Op(c);
					(l.view || u.view) && (s = !0);
					var d;
					if (d = !(e.flags & 4)) {
						if (u.clip) d = !0;
						else {
							d = l.rect;
							var f = u.rect;
							d = d.y !== f.y || d.x !== f.x || d.height !== f.height || d.width !== f.width;
						}
					}
					d && (e.flags |= 4), u.abs ? u = !l.abs : (l = l.rect, u = u.rect, u = l.height !== u.height || l.width !== u.width), u && (e.flags |= 32);
				} else e.flags |= 32;
				e.flags & 4 && Tp(c, Wl === 0 ? n : n + "_" + Wl, i), s && e.flags & 4 || (Hl === null && (Hl = []), Hl.push(c, Wl === 0 ? r : r + "_" + Wl, t.memoizedProps)), Wl++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : nu(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function ru(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = _i(n, r), a = yi(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(kp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				Wl = 0, i = nu(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Nd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && ru(e, t);
			e = e.sibling;
		}
	}
	var iu = !1, G = !1, au = !1, ou = !1, su = typeof WeakSet == "function" ? WeakSet : Set, cu = null, lu = !1, uu = !1, du = !1, fu = !1;
	function pu(e, t, n) {
		if (e = e.containerInfo, sp = gh, e = qr(e), Jr(e)) {
			if ("selectionStart" in e) var r = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				r = (r = e.ownerDocument) && r.defaultView || window;
				var i = r.getSelection && r.getSelection();
				if (i && i.rangeCount !== 0) {
					r = i.anchorNode;
					var a = i.anchorOffset, o = i.focusNode;
					i = i.focusOffset;
					try {
						r.nodeType, o.nodeType;
					} catch {
						r = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== r || a !== 0 && f.nodeType !== 3 || (c = s + a), f !== o || i !== 0 && f.nodeType !== 3 || (l = s + i), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === r && ++u === a && (c = s), p === o && ++d === i && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					r = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else r = null;
			}
			r ||= {
				start: 0,
				end: 0
			};
		} else r = null;
		for (cp = {
			focusedElem: e,
			selectionRange: r
		}, gh = !1, n = (n & 335544064) === n, cu = t, t = n ? 9270 : 1024; cu !== null;) {
			if (e = cu, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && Zl(r[a]);
			if (e.alternate === null && e.flags & 2) n && Vl(e), mu(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && Zl(r), mu(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Vl(e), mu(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, cu = r) : (n && Ql(e), mu(n));
			}
		}
		Bl = null;
	}
	function mu(e) {
		for (; cu !== null;) {
			var t = cu, n = e, r = t.alternate, a = t.flags;
			switch (t.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (a & 1024 && r !== null) {
						n = void 0, a = r.memoizedProps, r = r.memoizedState;
						var o = t.stateNode;
						try {
							var s = Sc(t.type, a);
							n = o.getSnapshotBeforeUpdate(s, r), o.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							Z(t, t.return, e);
						}
					}
					break;
				case 3:
					if (a & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) nm(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								nm(r);
								break;
							default: r.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					n && r !== null && (n = _i(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = yi(a.default, a.update), a !== "none" && Gl(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, cu = r;
				break;
			}
			cu = t.return;
		}
	}
	function hu(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Fu(e, n), r & 4 && xl(5, n);
				break;
			case 1:
				if (Fu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						Z(n, n.return, e);
					}
					else {
						var i = Sc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							Z(n, n.return, e);
						}
					}
				}
				r & 64 && Cl(n), r & 512 && Tl(n, n.return);
				break;
			case 3:
				if (Fu(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						wo(e, t);
					} catch (e) {
						Z(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Rl(n);
			case 26:
			case 5:
				Fu(e, n), t === null && r & 4 && Ml(n), r & 512 && Tl(n, n.return);
				break;
			case 12:
				Fu(e, n);
				break;
			case 31:
				Fu(e, n), r & 4 && wu(e, n);
				break;
			case 13:
				Fu(e, n), r & 4 && Tu(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = _f.bind(null, n), cm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || iu, !r) {
					var a = t !== null && t.memoizedState !== null || G;
					t = iu, i = G, iu = r, (G = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), Lu(e, n, r)) : Fu(e, n), iu = t, G = i;
				}
				break;
			case 30:
				Fu(e, n), r & 512 && Tl(n, n.return);
				break;
			case 7: r & 512 && Tl(n, n.return);
			default: Fu(e, n);
		}
	}
	function gu(e, t) {
		for (e = e.child; e !== null;) _u(e, t), e = e.sibling;
	}
	function _u(e, t) {
		switch (e.tag) {
			case 5:
			case 26:
				try {
					var n = e.stateNode;
					if (t) {
						var r = n.style;
						typeof r.setProperty == "function" ? r.setProperty("display", "none", "important") : r.display = "none";
					} else {
						var i = e.stateNode, a = e.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null;
						i.style.display = o == null || typeof o == "boolean" ? "" : ("" + o).trim();
					}
				} catch (t) {
					Z(e, e.return, t);
				}
				vu(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, I = !0;
				} catch (t) {
					Z(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? wp(s, !0) : wp(e.stateNode, !1);
				} catch (t) {
					Z(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && gu(e, t);
				break;
			default: gu(e, t);
		}
	}
	function vu(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						_u(n, r);
						break a;
					case 22:
						n.memoizedState === null && vu(n, r);
						break a;
					default: vu(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function yu(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, yu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && It(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var bu = null, xu = !1;
	function Su(e, t, n) {
		for (n = n.child; n !== null;) Cu(e, t, n), n = n.sibling;
	}
	function Cu(e, t, n) {
		if (rt && typeof rt.onCommitFiberUnmount == "function") try {
			rt.onCommitFiberUnmount(nt, n);
		} catch {}
		switch (n.tag) {
			case 26:
				G || El(n, t), Su(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !G && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				G || El(n, t), kl(n);
				var r = bu, i = xu;
				Sp(n.type) && (bu = n.stateNode, xu = !1), Su(e, t, n), gm(n.stateNode, n.type, n.memoizedProps), bu = r, xu = i;
				break;
			case 5: G || El(n, t), kl(n);
			case 6:
				if (n.tag === 6 && kl(n), r = bu, i = xu, bu = null, Su(e, t, n), bu = r, xu = i, bu !== null) {
					if (xu) try {
						(bu.nodeType === 9 ? bu.body : bu.nodeName === "HTML" ? bu.ownerDocument.body : bu).removeChild(n.stateNode), I = !0;
					} catch (e) {
						Z(n, t, e);
					}
					else try {
						bu.removeChild(n.stateNode), I = !0;
					} catch (e) {
						Z(n, t, e);
					}
				}
				break;
			case 18:
				bu !== null && (xu ? (e = bu, Cp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Hh(e)) : Cp(bu, n.stateNode));
				break;
			case 4:
				r = bu, i = xu, bu = n.stateNode.containerInfo, xu = !0, Su(e, t, n), bu = r, xu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Sl(2, n, t), G || Sl(4, n, t), Su(e, t, n);
				break;
			case 1:
				G || (El(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && wl(n, t, r)), Su(e, t, n);
				break;
			case 21:
				Su(e, t, n);
				break;
			case 22:
				G = (r = G) || n.memoizedState !== null, Su(e, t, n), G = r;
				break;
			case 30:
				El(n, t), Su(e, t, n);
				break;
			case 7:
				G || El(n, t), Su(e, t, n);
				break;
			default: Su(e, t, n);
		}
	}
	function wu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Hh(e);
			} catch (e) {
				Z(t, t.return, e);
			}
		}
	}
	function Tu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Hh(e);
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Eu(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new su()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new su()), t;
			default: throw Error(i(435, e.tag));
		}
	}
	function Du(e, t) {
		var n = Eu(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = vf.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function Ou(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var a = 0; a < r.length; a++) {
			var o = r[a], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (Sp(l.type)) {
							bu = l.stateNode, xu = !1;
							break a;
						}
						break;
					case 5:
						bu = l.stateNode, xu = !1;
						break a;
					case 3:
					case 4:
						bu = l.stateNode.containerInfo, xu = !0;
						break a;
				}
				l = l.return;
			}
			if (bu === null) throw Error(i(160));
			Cu(s, c, o), bu = null, xu = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) Au(t, e, n), t = t.sibling;
	}
	var ku = null;
	function Au(e, t, n) {
		var r = e.alternate, a = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (a & 4 && (r = e.updateQueue, r = r === null ? null : r.events, r !== null)) for (var o = 0; o < r.length; o++) {
					var s = r[o];
					s.ref.impl = s.nextImpl;
				}
				Ou(t, e, n), ju(e), a & 4 && (Sl(3, e, e.return), xl(3, e), Sl(5, e, e.return));
				break;
			case 1:
				Ou(t, e, n), ju(e), a & 512 && (G || r === null || El(r, r.return)), a & 64 && iu && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = ku, Ou(t, e, n), ju(e), a & 512 && (G || r === null || El(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (iu) e.stateNode = fp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[Pt] || r[Dt] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), np(r, t, n), r[Dt] = e, Bt(r), t = r;
												break a;
											case "link":
												if (o = Gm("link", "href", a).get(t + (n.href || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), np(r, t, n), a.head.appendChild(r);
												break;
											case "meta":
												if (o = Gm("meta", "content", a).get(t + (n.content || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), np(r, t, n), a.head.appendChild(r);
												break;
											default: throw Error(i(468, t));
										}
										r[Dt] = e, Bt(r), t = r;
									}
									e.stateNode = t;
								}
							} else iu || Km(o, e.type, e.stateNode);
						} else e.stateNode = Bm(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Nl(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || G || t.parentNode.removeChild(t)) : a.count--, n === null ? iu || Km(o, e.type, e.stateNode) : Bm(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Ou(t, e, n), ju(e), a & 512 && (G || r === null || El(r, r.return)), r !== null && a & 4 && Nl(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = au, au = !1, Ou(t, e, n), au = o, ju(e), a & 512 && (G || r === null || El(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						pn(t, ""), I = !0;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Nl(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (ou = !0);
				break;
			case 6:
				if (Ou(t, e, n), ju(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, I = !0;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				break;
			case 3:
				if (I = !1, Wm = null, o = ku, ku = bm(t.containerInfo), Ou(t, e, n), ku = o, ju(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Hh(t.containerInfo);
				} catch (t) {
					Z(e, e.return, t);
				}
				ou && (ou = !1, Mu(e)), I = !1;
				break;
			case 4:
				a = au, au = iu, r = Yt(), o = ku, ku = bm(e.stateNode.containerInfo), Ou(t, e, n), ju(e), ku = o, I && uu && (du = !0), I = r, au = a;
				break;
			case 12:
				Ou(t, e, n), ju(e);
				break;
			case 31:
				Ou(t, e, n), ju(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Du(e, t)));
				break;
			case 13:
				Ou(t, e, n), ju(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (md = Je()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Du(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = iu, l = G, u = au;
				iu = c || o, au = u || o, G = l || s, Ou(t, e, n), G = l, au = u, iu = c, ju(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || iu || G || (t = s || G, n = iu, r = G, iu = o || iu, G = t, Iu(e, 2), iu = n, G = r), !o && au || gu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, Du(e, n))));
				break;
			case 19:
				Ou(t, e, n), ju(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, Du(e, t)));
				break;
			case 30:
				a & 512 && (G || r === null || El(r, r.return)), a = Yt(), o = uu, s = (n & 335544064) === n, c = e.memoizedProps, uu = s && yi(c.default, c.update) !== "none", Ou(t, e, n), ju(e), s && r !== null && I && (e.flags |= 4), uu = o, I = a;
				break;
			case 21: break;
			case 7: a & 512 && (G || r === null || El(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Ou(t, e, n), ju(e);
		}
	}
	function ju(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Pl(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (jl(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (Al(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Ll(e, Fl(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (pn(l, ""), n.flags &= -33), Ll(e, Fl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						Il(e, Fl(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				Z(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Mu(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			Mu(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, gh = !0, t.reset(), gh = !1), e = e.sibling;
		}
	}
	function Nu(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Pu(t, e), t = t.sibling;
		else ru(t, !1);
	}
	function Pu(e, t) {
		var n = e.alternate;
		if (n === null) Yl(e, !1);
		else switch (e.tag) {
			case 3:
				if (fu = lu = !1, Ul(), Nu(t, e), !lu && !du) {
					if (e = Hl, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						Ep(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + i + ")"
						});
					}
					e = t.containerInfo, e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "" && (e.style.viewTransitionName = "none", e.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), e.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					})), fu = !0;
				}
				Hl = null;
				break;
			case 5:
				Nu(t, e);
				break;
			case 4:
				r = lu, lu = !1, Nu(t, e), lu && (du = !0), lu = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Nu(t, e) : Yl(e, !1));
				break;
			case 30:
				r = lu, i = Ul(), lu = !1, Nu(t, e), lu && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = _i(a, o), o = _i(n.memoizedProps, o);
				var s = yi(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, Wl = 0, t = nu(e, n, t, o, s, a, !0), Wl !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Nd(e, e.memoizedProps.onUpdate), Hl = i) : i !== null && (i.push.apply(i, Hl), Hl = i), lu = e.flags & 32 ? !0 : r;
				break;
			default: Nu(t, e);
		}
	}
	function Fu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) hu(e, t.alternate, t), t = t.sibling;
	}
	function Iu(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Sl(4, n, n.return), Iu(n, r);
					break;
				case 1:
					El(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && wl(n, n.return, i), Iu(n, r);
					break;
				case 27: r & 2 && gm(n.stateNode, n.type, n.memoizedProps);
				case 5:
					El(n, n.return), n.tag !== 5 && n.tag !== 27 || kl(n), Iu(n, r);
					break;
				case 6:
					kl(n);
					break;
				case 26:
					El(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || G || i.parentNode.removeChild(i), Iu(n, r);
					break;
				case 22:
					n.memoizedState === null && Iu(n, r);
					break;
				case 30:
					El(n, n.return), Iu(n, r);
					break;
				case 7: El(n, n.return);
				default: Iu(n, r);
			}
			e = e.sibling;
		}
	}
	function Lu(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Lu(i, a, n), xl(4, a);
					break;
				case 1:
					if (Lu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Z(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) Co(l[i], c);
						} catch (e) {
							Z(r, r.return, e);
						}
					}
					s && o & 64 && Cl(a), Tl(a, a.return);
					break;
				case 27: n & 2 && Rl(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || Ol(a), Lu(i, a, n), s && r === null && o & 4 && Ml(a), Tl(a, a.return);
					break;
				case 6:
					Ol(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || iu || Km(bm(c.ownerDocument), a.type, c), Lu(i, a, n), s && r === null && o & 4 && Ml(a), Tl(a, a.return);
					break;
				case 12:
					Lu(i, a, n);
					break;
				case 31:
					Lu(i, a, n), s && o & 4 && wu(i, a);
					break;
				case 13:
					Lu(i, a, n), s && o & 4 && Tu(i, a);
					break;
				case 22:
					a.memoizedState === null && Lu(i, a, n), Tl(a, a.return);
					break;
				case 30:
					Lu(i, a, n), Tl(a, a.return);
					break;
				case 7: Tl(a, a.return);
				default: Lu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Ru(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Ma(n));
	}
	function zu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Ma(e));
	}
	function Bu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Vu(e, t, n, r), t = t.sibling;
		else i && tu(t);
	}
	function Vu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && eu(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Bu(e, t, n, r), a & 2048 && xl(9, t);
				break;
			case 1:
				Bu(e, t, n, r);
				break;
			case 3:
				Bu(e, t, n, r), i && fu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Ma(a)));
				break;
			case 12:
				if (a & 2048) {
					Bu(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						Z(t, t.return, e);
					}
				} else Bu(e, t, n, r);
				break;
			case 31:
				Bu(e, t, n, r);
				break;
			case 13:
				Bu(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && eu(t), o._visibility & 2 ? Bu(e, t, n, r) : (o._visibility |= 2, Hu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && eu(s), o._visibility & 2 ? Bu(e, t, n, r) : Uu(e, t)), a & 2048 && Ru(s, t);
				break;
			case 24:
				Bu(e, t, n, r), a & 2048 && zu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (ql(a.child, !0), ql(t.child, !0))), Bu(e, t, n, r);
				break;
			default: Bu(e, t, n, r);
		}
	}
	function Hu(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Hu(a, o, s, c, i), xl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Hu(a, o, s, c, i)) : u._visibility & 2 ? Hu(a, o, s, c, i) : Uu(a, o), i && l & 2048 && Ru(o.alternate, o);
					break;
				case 24:
					Hu(a, o, s, c, i), i && l & 2048 && zu(o.alternate, o);
					break;
				default: Hu(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Uu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Uu(n, r), i & 2048 && Ru(r.alternate, r);
					break;
				case 24:
					Uu(n, r), i & 2048 && zu(r.alternate, r);
					break;
				default: Uu(n, r);
			}
			t = t.sibling;
		}
	}
	var Wu = 8192;
	function Gu(e, t, n) {
		if (e.subtreeFlags & Wu) for (e = e.child; e !== null;) Ku(e, t, n), e = e.sibling;
	}
	function Ku(e, t, n) {
		switch (e.tag) {
			case 26:
				Gu(e, t, n), e.flags & Wu && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && Zm(n, e)) : Qm(n, ku, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				Gu(e, t, n), e.flags & Wu && (e = e.stateNode, (t & 335544128) === t && Zm(n, e));
				break;
			case 3:
			case 4:
				var r = ku;
				ku = bm(e.stateNode.containerInfo), Gu(e, t, n), ku = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Wu, Wu = 16777216, Gu(e, t, n), Wu = r) : Gu(e, t, n));
				break;
			case 30:
				if ((e.flags & Wu) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Bl === null && (Bl = /* @__PURE__ */ new Map()), Bl.set(r, i);
				}
				Gu(e, t, n);
				break;
			default: Gu(e, t, n);
		}
	}
	function qu(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Ju(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				cu = r, Zu(r, e);
			}
			qu(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Yu(e), e = e.sibling;
	}
	function Yu(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Ju(e), e.flags & 2048 && Sl(9, e, e.return);
				break;
			case 3:
				Ju(e);
				break;
			case 12:
				Ju(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Xu(e)) : Ju(e);
				break;
			default: Ju(e);
		}
	}
	function Xu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				cu = r, Zu(r, e);
			}
			qu(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Sl(8, t, t.return), Xu(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Xu(t));
					break;
				default: Xu(t);
			}
			e = e.sibling;
		}
	}
	function Zu(e, t) {
		for (; cu !== null;) {
			var n = cu;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Sl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Ma(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, cu = r;
			else a: for (n = e; cu !== null;) {
				r = cu;
				var i = r.sibling, a = r.return;
				if (yu(r), r === n) {
					cu = null;
					break a;
				}
				if (i !== null) {
					i.return = a, cu = i;
					break a;
				}
				cu = a;
			}
		}
	}
	var Qu = {
		getCacheForType: function(e) {
			var t = wa(Aa), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return wa(Aa).controller.signal;
		}
	}, $u = typeof WeakMap == "function" ? WeakMap : Map, K = 0, q = null, J = null, Y = 0, X = 0, ed = null, td = !1, nd = !1, rd = !1, id = 0, ad = 0, od = 0, sd = 0, cd = 0, ld = 0, ud = 0, dd = null, fd = null, pd = !1, md = 0, hd = 0, gd = Infinity, _d = null, vd = null, yd = 0, bd = null, xd = null, Sd = 0, Cd = 0, wd = null, Td = null, Ed = null, Dd = null, Od = null, kd = 0, Ad = null;
	function jd() {
		return K & 2 && Y !== 0 ? Y & -Y : O.T === null ? wt() : Pf();
	}
	function Md() {
		if (ld === 0) {
			if (!(Y & 536870912) || V) {
				var e = lt;
				lt <<= 1, !(lt & 3932160) && (lt = 262144), ld = e;
			} else ld = 536870912;
		}
		return e = Ao.current, e !== null && (e.flags |= 32), ld;
	}
	function Nd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Pp(_i(e.memoizedProps, n))), Dd === null && (Dd = []), Dd.push(t.bind(null, r));
		}
	}
	function Pd(e, t, n) {
		(e === q && (X === 2 || X === 9) || e.cancelPendingCommit !== null) && (Vd(e, 0), Rd(e, Y, ld, !1)), _t(e, n), K & 2 && e === q || (e === q && (!(K & 2) && (sd |= n), ad === 4 && Rd(e, Y, ld, !1)), Ef(e));
	}
	function Fd(e, t, n) {
		if (K & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || N(e, t), a = r ? Yd(e, t) : qd(e, t, !0), o = r;
		do {
			if (a === 0) {
				nd && !r && Rd(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !Ld(n)) a = qd(e, t, !1), o = !1;
			else {
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = dd;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (Vd(c, s).flags |= 256), s = qd(c, s, !1), s !== 2 && s !== 6) {
								if (rd && !l) {
									c.errorRecoveryDisabledLanes |= o, sd |= o, a = 4;
									break a;
								}
								o = fd, fd = a, o !== null && (fd === null ? fd = o : fd.push.apply(fd, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					Vd(e, 0), Rd(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
						case 6:
							Rd(r, t, ld, !td);
							break a;
						case 2:
							fd = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = md + 300 - Je(), 10 < a)) {
						if (Rd(r, t, ld, !td), ft(r, 0, !0) !== 0) break a;
						Sd = t, r.timeoutHandle = gp(Id.bind(null, r, n, fd, _d, pd, t, ld, sd, ud, td, o, "Throttled", -0, 0), a);
						break a;
					}
					Id(r, n, fd, _d, pd, t, ld, sd, ud, td, o, null, -0, 0);
				}
				break;
			}
		} while (1);
		Ef(e);
	}
	function Id(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.timeoutHandle = -1;
		var m = t.subtreeFlags, h = (a & 335544064) === a;
		d = null, (h || m & 8192 || (m & 16785408) == 16785408) && (d = {
			stylesheets: null,
			count: 0,
			imgCount: 0,
			imgBytes: 0,
			suspenseyImages: [],
			waitingForImages: !0,
			waitingForViewTransition: !1,
			unsuspend: xn
		}, Bl = null, Ku(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = nh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? md - Je() : (a & 4194048) === a ? hd - Je() : 0, m = eh(d, m), m !== null) ? (Sd = a, e.cancelPendingCommit = m(nf.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Rd(e, a, o, !l)) : nf(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Ld(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Vr(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function Rd(e, t, n, r) {
		t = pt(e, t), t &= ~cd, t &= ~sd, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - at(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && yt(e, n, t);
	}
	function zd() {
		return K & 6 ? !0 : (Df(0, !1), !1);
	}
	function Bd() {
		if (J !== null) {
			if (X === 0) var e = J.return;
			else e = J, ga = ha = null, is(e), io = null, ao = 0, e = J;
			for (; e !== null;) bl(e.alternate, e), e = e.return;
			J = null;
		}
	}
	function Vd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, _p(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Sd = 0, Bd(), q = e, J = n = Pi(e.current, null), Y = t, X = 0, ed = null, td = !1, nd = N(e, t), rd = !1, ud = ld = cd = sd = od = ad = 0, fd = dd = null, pd = !1, id = pt(e, t), wi(), n;
	}
	function Hd(e, t) {
		H = null, O.H = mc, t === Ja || t === Xa ? (t = no(), X = 3) : t === Ya ? (t = no(), X = 4) : X = t === Mc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, ed = t, J === null && (ad = 1, Ec(e, Hi(t, e.current)));
	}
	function Ud() {
		var e = Ao.current;
		return e === null ? !0 : (Y & 4194048) === Y ? jo === null : (Y & 62914560) === Y || Y & 536870912 ? e === jo : !1;
	}
	function Wd() {
		var e = O.H;
		return O.H = mc, e === null ? mc : e;
	}
	function Gd() {
		var e = O.A;
		return O.A = Qu, e;
	}
	function Kd() {
		ad = 4, td || (Y & 4194048) !== Y && Ao.current !== null || (nd = !0), !(od & 134217727) && !(sd & 134217727) || q === null || Rd(q, Y, ld, !1);
	}
	function qd(e, t, n) {
		var r = K;
		K |= 2;
		var i = Wd(), a = Gd();
		(q !== e || Y !== t) && (_d = null, Vd(e, t)), t = !1;
		var o = ad;
		a: do
			try {
				if (X !== 0 && J !== null) {
					var s = J, c = ed;
					switch (X) {
						case 8:
							Bd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Ao.current === null && (t = !0);
							var l = X;
							if (X = 0, ed = null, $d(e, s, c, l), n && nd) {
								o = 0;
								break a;
							}
							break;
						default: l = X, X = 0, ed = null, $d(e, s, c, l);
					}
				}
				Jd(), o = ad;
				break;
			} catch (t) {
				Hd(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, ga = ha = null, K = r, O.H = i, O.A = a, J === null && (q = null, Y = 0, wi()), o;
	}
	function Jd() {
		for (; J !== null;) Zd(J);
	}
	function Yd(e, t) {
		var n = K;
		K |= 2;
		var r = Wd(), a = Gd();
		q !== e || Y !== t ? (_d = null, gd = Je() + 500, Vd(e, t)) : nd = N(e, t);
		a: do
			try {
				if (X !== 0 && J !== null) {
					t = J;
					var o = ed;
					b: switch (X) {
						case 1:
							X = 0, ed = null, $d(e, t, o, 1);
							break;
						case 2:
						case 9:
							if (Qa(o)) {
								X = 0, ed = null, Qd(t);
								break;
							}
							t = function() {
								X !== 2 && X !== 9 || q !== e || (X = 7), Ef(e);
							}, o.then(t, t);
							break a;
						case 3:
							X = 7;
							break a;
						case 4:
							X = 5;
							break a;
						case 7:
							Qa(o) ? (X = 0, ed = null, Qd(t)) : (X = 0, ed = null, $d(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (J.tag) {
								case 26: s = J.memoizedState;
								case 5:
								case 27:
									var c = J;
									if (s ? Ym(s) : c.stateNode.complete) {
										X = 0, ed = null;
										var l = c.sibling;
										if (l !== null) J = l;
										else {
											var u = c.return;
											u === null ? J = null : (J = u, ef(u));
										}
										break b;
									}
							}
							X = 0, ed = null, $d(e, t, o, 5);
							break;
						case 6:
							X = 0, ed = null, $d(e, t, o, 6);
							break;
						case 8:
							Bd(), ad = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Xd();
				break;
			} catch (t) {
				Hd(e, t);
			}
		while (1);
		return ga = ha = null, O.H = r, O.A = a, K = n, J === null ? (q = null, Y = 0, wi(), ad) : 0;
	}
	function Xd() {
		for (; J !== null && !Ke();) Zd(J);
	}
	function Zd(e) {
		var t = fl(e.alternate, e, id);
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : J = t;
	}
	function Qd(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Kc(n, t, t.pendingProps, t.type, void 0, Y);
				break;
			case 11:
				t = Kc(n, t, t.pendingProps, t.type.render, t.ref, Y);
				break;
			case 5:
				is(t);
				var r = t;
				r === ra && (V ? (la(r), r.tag === 5 && r.stateNode != null && (B = r.stateNode)) : (la(r), V = !0));
			default: bl(n, t), t = J = Fi(t, id), t = fl(n, t, id);
		}
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : J = t;
	}
	function $d(e, t, n, r) {
		ga = ha = null, is(t), io = null, ao = 0;
		var i = t.return;
		try {
			if (jc(e, i, t, n, Y)) {
				ad = 1, Ec(e, Hi(n, e.current)), J = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw J = i, t;
			ad = 1, Ec(e, Hi(n, e.current)), J = null;
			return;
		}
		t.flags & 32768 ? (V || r === 1 ? e = !0 : nd || Y & 536870912 ? e = !1 : (td = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Ao.current, r !== null && r.tag === 13 && (r.flags |= 16384))), tf(t, e)) : ef(t);
	}
	function ef(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				tf(t, td);
				return;
			}
			e = t.return;
			var n = vl(t.alternate, t, id);
			if (n !== null) {
				J = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				J = t;
				return;
			}
			J = t = e;
		} while (t !== null);
		ad === 0 && (ad = 5);
	}
	function tf(e, t) {
		do {
			var n = yl(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, J = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				J = e;
				return;
			}
			J = e = n;
		} while (e !== null);
		ad = 6, J = null;
	}
	function nf(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			df();
		while (yd !== 0);
		if (K & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === q && (J = q = null, Y = 0), xd = t, bd = e, Sd = n, wd = a, Td = r, rf(e, t, n, s, c, l, f);
		}
	}
	function rf(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (Cd = s, s |= Ci, vt(e, n, s, r, i, a), Dd = null, (n & 335544064) === n ? (Od = Fa(e), r = 10262) : (Od = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, yf(Ze, function() {
			return ff(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), zl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = O.T, O.T = null, i = k.p, k.p = 2, a = K, K |= 4;
			try {
				pu(e, t, n);
			} finally {
				K = a, k.p = i, O.T = r;
			}
		}
		yd = 1, zl ? Ed = Mp(o, e.containerInfo, Od, sf, cf, of, lf, ff, af, null, null) : (sf(), cf(), lf());
	}
	function af(e) {
		if (yd !== 0) {
			var t = bd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function of() {
		yd === 3 && (yd = 0, Pu(xd, bd), yd = 4);
	}
	function sf() {
		if (yd === 1) {
			yd = 0;
			var e = bd, t = xd, n = Sd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = O.T, O.T = null;
				var i = k.p;
				k.p = 2;
				var a = K;
				K |= 4;
				try {
					uu = du = !1, Au(t, e, n), n = cp;
					var o = qr(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && Kr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Jr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Gr(s, h), v = Gr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					gh = !!sp, cp = sp = null;
				} finally {
					K = a, k.p = i, O.T = r;
				}
			}
			e.current = t, yd = 2;
		}
	}
	function cf() {
		if (yd === 2) {
			yd = 0;
			var e = bd, t = xd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = O.T, O.T = null;
				var r = k.p;
				k.p = 2;
				var i = K;
				K |= 4;
				try {
					hu(e, t.alternate, t);
				} finally {
					K = i, k.p = r, O.T = n;
				}
			}
			yd = 3;
		}
	}
	function lf() {
		if (yd === 4 || yd === 3) {
			yd = 0;
			var e = Ed;
			Ed = null, qe();
			var t = bd, n = xd, r = Sd, i = Td, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? yd = 5 : (yd = 0, xd = bd = null, uf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (vd = null), Ct(r), n = n.stateNode, rt && typeof rt.onCommitFiberRoot == "function") try {
				rt.onCommitFiberRoot(nt, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = O.T, a = k.p, k.p = 2, O.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					O.T = n, k.p = a;
				}
			}
			if (i = Dd, o = Od, Od = null, i !== null && (Dd = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			Sd & 3 && df(), Ef(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Ad ? kd++ : (kd = 0, Ad = t) : (kd = 0, Ad = null), Df(0, !1);
		}
	}
	function uf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Ma(t)));
	}
	function df() {
		return Ed !== null && (Ed.skipTransition(), Ed = null), sf(), cf(), lf(), ff();
	}
	function ff() {
		if (yd !== 5) return !1;
		var e = bd, t = Cd;
		Cd = 0;
		var n = Ct(Sd), r = O.T, a = k.p;
		try {
			k.p = 32 > n ? 32 : n, O.T = null, n = wd, wd = null;
			var o = bd, s = Sd;
			if (yd = 0, xd = bd = null, Sd = 0, K & 6) throw Error(i(331));
			var c = K;
			if (K |= 4, Yu(o.current), Vu(o, o.current, s, n), K = c, Df(0, !1), rt && typeof rt.onPostCommitFiberRoot == "function") try {
				rt.onPostCommitFiberRoot(nt, o);
			} catch {}
			return !0;
		} finally {
			k.p = a, O.T = r, uf(e, t);
		}
	}
	function pf(e, t, n) {
		t = Hi(n, t), t = Oc(e.stateNode, t, 2), e = _o(e, t, 2), e !== null && (_t(e, 2), Ef(e));
	}
	function Z(e, t, n) {
		if (e.tag === 3) pf(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				pf(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (vd === null || !vd.has(r))) {
					e = Hi(n, e), n = kc(2), r = _o(t, n, 2), r !== null && (Ac(n, r, t, e), _t(r, 2), Ef(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function mf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new $u();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (rd = !0, i.add(n), e = hf.bind(null, e, t, n), t.then(e, e));
	}
	function hf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, q === e && (Y & n) === n && (ad === 4 || ad === 3 && (Y & 62914560) === Y && 300 > Je() - md ? K & 2 ? cd |= n : Vd(e, 0) : cd |= n, ud === Y && (ud = 0)), Ef(e);
	}
	function gf(e, t) {
		t === 0 && (t = ht()), e = Di(e, t), e !== null && (_t(e, t), Ef(e));
	}
	function _f(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), gf(e, n);
	}
	function vf(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, a = e.memoizedState;
				a !== null && (n = a.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(i(314));
		}
		r !== null && r.delete(t), gf(e, n);
	}
	function yf(e, t) {
		return We(e, t);
	}
	var bf = null, xf = null, Sf = !1, Cf = !1, wf = !1, Tf = 0;
	function Ef(e) {
		e !== xf && e.next === null && (xf === null ? bf = xf = e : xf = xf.next = e), Cf = !0, Sf || (Sf = !0, Nf());
	}
	function Df(e, t) {
		if (!wf && Cf) {
			wf = !0;
			do
				for (var n = !1, r = bf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - at(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Mf(r, a));
						} else a = Y, a = ft(r, r === q ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || N(r, a) || (n = !0, Mf(r, a));
					}
					r = r.next;
				}
			while (n);
			wf = !1;
		}
	}
	function Of() {
		kf();
	}
	function kf() {
		Cf = Sf = !1;
		var e = 0;
		Tf !== 0 && hp() && (e = Tf);
		for (var t = Je(), n = null, r = bf; r !== null;) {
			var i = r.next, a = Af(r, t);
			a === 0 ? (r.next = null, n === null ? bf = i : n.next = i, i === null && (xf = n)) : (n = r, (e !== 0 || a & 3) && (Cf = !0)), r = i;
		}
		yd !== 0 && yd !== 5 || Df(e, !1), Tf !== 0 && (Tf = 0);
	}
	function Af(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - at(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = mt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = q, n = Y, n = ft(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (X === 2 || X === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Ge(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || N(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Ge(r), Ct(n)) {
				case 2:
				case 8:
					n = Xe;
					break;
				case 32:
					n = Ze;
					break;
				case 268435456:
					n = $e;
					break;
				default: n = Ze;
			}
			return r = jf.bind(null, e), n = We(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Ge(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function jf(e, t) {
		if (yd !== 0 && yd !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (df() && e.callbackNode !== n) return null;
		var r = Y;
		return r = ft(e, e === q ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Fd(e, r, t), Af(e, Je()), e.callbackNode != null && e.callbackNode === n ? jf.bind(null, e) : null);
	}
	function Mf(e, t) {
		if (df()) return null;
		Fd(e, t, !0);
	}
	function Nf() {
		bp(function() {
			K & 6 ? We(Ye, Of) : kf();
		});
	}
	function Pf() {
		if (Tf === 0) {
			var e = Ra;
			e === 0 && (e = ct, ct <<= 1, !(ct & 261888) && (ct = 256)), Tf = e;
		}
		return Tf;
	}
	function Ff(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : bn(e);
	}
	function If(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Ff((i[Ot] || null).action), o = r.submitter;
			o && (t = (t = o[Ot] || null) ? Ff(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Vn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Tf !== 0) {
								var e = new FormData(i, o);
								ec(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), ec(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var Lf = 0; Lf < mi.length; Lf++) {
		var Rf = mi[Lf];
		hi(Rf.toLowerCase(), "on" + (Rf[0].toUpperCase() + Rf.slice(1)));
	}
	hi(oi, "onAnimationEnd"), hi(si, "onAnimationIteration"), hi(ci, "onAnimationStart"), hi("dblclick", "onDoubleClick"), hi("focusin", "onFocus"), hi("focusout", "onBlur"), hi(li, "onTransitionRun"), hi(ui, "onTransitionStart"), hi(di, "onTransitionCancel"), hi(fi, "onTransitionEnd"), Wt("onMouseEnter", ["mouseout", "mouseover"]), Wt("onMouseLeave", ["mouseout", "mouseover"]), Wt("onPointerEnter", ["pointerout", "pointerover"]), Wt("onPointerLeave", ["pointerout", "pointerover"]), Ut("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Ut("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Ut("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), Ut("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Ut("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Ut("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var zf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Bf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(zf));
	function Vf(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						bi(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						bi(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[At];
		n === void 0 && (n = t[At] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Gf(t, e, 2, !1), n.add(r));
	}
	function Hf(e, t, n) {
		var r = 0;
		t && (r |= 4), Gf(n, e, r, t);
	}
	var Uf = "_reactListening" + Math.random().toString(36).slice(2);
	function Wf(e) {
		if (!e[Uf]) {
			e[Uf] = !0, Vt.forEach(function(t) {
				t !== "selectionchange" && (Bf.has(t) || Hf(t, !1, e), Hf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Uf] || (t[Uf] = !0, Hf("selectionchange", !1, t));
		}
	}
	function Gf(e, t, n, r) {
		switch (Ch(t)) {
			case 2:
				var i = _h;
				break;
			case 8:
				i = vh;
				break;
			default: i = yh;
		}
		n = i.bind(null, t, n, e), i = void 0, !An || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Kf(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var s = r.tag;
			if (s === 3 || s === 4) {
				var c = r.stateNode.containerInfo;
				if (c === i) break;
				if (s === 4) for (s = r.return; s !== null;) {
					var l = s.tag;
					if ((l === 3 || l === 4) && s.stateNode.containerInfo === i) return;
					s = s.return;
				}
				for (; c !== null;) {
					if (s = Lt(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		Dn(function() {
			var r = a, i = Sn(n), s = [];
			a: {
				var c = pi.get(e);
				if (c !== void 0) {
					var l = Vn, u = e;
					switch (e) {
						case "keypress": if (In(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = rr;
							break;
						case "focusin":
							u = "focus", l = Jn;
							break;
						case "focusout":
							u = "blur", l = Jn;
							break;
						case "beforeblur":
						case "afterblur":
							l = Jn;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							l = Kn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = qn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = or;
							break;
						case oi:
						case si:
						case ci:
							l = Yn;
							break;
						case fi:
							l = sr;
							break;
						case "scroll":
						case "scrollend":
							l = Hn;
							break;
						case "wheel":
							l = cr;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = Xn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = ir;
							break;
						case "submit":
							l = ar;
							break;
						case "toggle":
						case "beforetoggle": l = lr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = On(m, p), g != null && d.push(qf(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (c = new l(c, u, null, n, i), s.push({
						event: c,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== L && (u = n.relatedTarget || n.fromElement) && (Lt(u) || u[kt])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Lt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = Kn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = ir, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : P(c), h = l == null ? u : P(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, Lt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? C(c, l, Yf) : null, c !== null && Xf(s, u, c, d, !1), l !== null && f !== null && Xf(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? P(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = kr;
					else if (Cr(c)) {
						if (Ar) _ = zr;
						else {
							_ = Lr;
							var v = Ir;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && _n(r.elementType) && (_ = kr) : _ = Rr;
					if (_ &&= _(e, r)) {
						wr(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? P(r) : window, e) {
					case "focusin":
						(Cr(v) || v.contentEditable === "true") && (Xr = v, Zr = r, Qr = null);
						break;
					case "focusout":
						Qr = Zr = Xr = null;
						break;
					case "mousedown":
						$r = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						$r = !1, ei(s, n, i);
						break;
					case "selectionchange": if (Yr) break;
					case "keydown":
					case "keyup": ei(s, n, i);
				}
				var y;
				if (dr) b: {
					switch (e) {
						case "compositionstart":
							var b = "onCompositionStart";
							break b;
						case "compositionend":
							b = "onCompositionEnd";
							break b;
						case "compositionupdate":
							b = "onCompositionUpdate";
							break b;
					}
					b = void 0;
				}
				else yr ? _r(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (mr && n.locale !== "ko" && (yr || b !== "onCompositionStart" ? b === "onCompositionEnd" && yr && (y = Fn()) : (Mn = i, Nn = "value" in Mn ? Mn.value : Mn.textContent, yr = !0)), v = Jf(r, b), 0 < v.length && (b = new Zn(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = vr(n), y !== null && (b.data = y)))), (y = pr ? br(e, n) : xr(e, n)) && (b = Jf(r, "onBeforeInput"), 0 < b.length && (v = new Zn("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), If(s, e, r, n, i);
			}
			Vf(s, t);
		});
	}
	function qf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Jf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = On(e, n), i != null && r.unshift(qf(e, i, a)), i = On(e, t), i != null && r.push(qf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Yf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Xf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = On(n, a), l != null && o.unshift(qf(n, l, c))) : i || (l = On(n, a), l != null && o.push(qf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Zf = /\r\n?/g, Qf = /\u0000|\uFFFD/g;
	function $f(e) {
		return (typeof e == "string" ? e : "" + e).replace(Zf, "\n").replace(Qf, "");
	}
	function ep(e, t) {
		return t = $f(t), $f(e) === t;
	}
	function $(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || pn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && pn(e, "" + r);
				else return;
				break;
			case "className":
				Zt(e, "class", r);
				break;
			case "tabIndex":
				Zt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Zt(e, n, r);
				break;
			case "style":
				gn(e, r, o);
				return;
			case "data": if (t !== "object") {
				Zt(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href") || r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = bn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && $(e, t, "name", a.name, a, null), $(e, t, "formEncType", a.formEncType, a, null), $(e, t, "formMethod", a.formMethod, a, null), $(e, t, "formTarget", a.formTarget, a, null)) : ($(e, t, "encType", a.encType, a, null), $(e, t, "method", a.method, a, null), $(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = bn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = xn);
				return;
			case "onScroll":
				r != null && Q("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = bn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				Q("beforetoggle", e), Q("toggle", e), Xt(e, "popover", r);
				break;
			case "xlinkActuate":
				Qt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Qt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Qt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Qt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Qt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Qt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Qt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Qt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Qt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				Xt(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = vn.get(n) || n, Xt(e, n, r);
			else return;
		}
		I = !0;
	}
	function tp(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				gn(e, r, o);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "children":
				if (typeof r == "string") pn(e, r);
				else if (typeof r == "number" || typeof r == "bigint") pn(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = xn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Ht.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), o = n.slice(2, a ? n.length - 7 : void 0), t = e[Ot] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(o, t, a), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(o, r, a);
						break a;
					}
					I = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Xt(e, n, r);
				}
				return;
		}
		I = !0;
	}
	function np(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				Q("error", e), Q("load", e);
				var r = !1, a = !1, o;
				for (o in n) if (n.hasOwnProperty(o)) {
					var s = n[o];
					if (s != null) switch (o) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							a = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(i(137, t));
						default: $(e, t, o, s, n, null);
					}
				}
				a && $(e, t, "srcSet", n.srcSet, n, null), r && $(e, t, "src", n.src, n, null);
				return;
			case "input":
				Q("invalid", e);
				var c = o = s = a = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							a = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							o = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(i(137, t));
							break;
						default: $(e, t, r, d, n, null);
					}
				}
				cn(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in Q("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: $(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && un(e, !!r, n, !0) : un(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Q("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						a = c;
						break;
					case "children":
						o = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(i(91));
						break;
					default: $(e, t, s, c, n, null);
				}
				fn(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: $(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Q("beforetoggle", e), Q("toggle", e), Q("cancel", e), Q("close", e);
				break;
			case "iframe":
			case "object":
				Q("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < zf.length; r++) Q(zf[r], e);
				break;
			case "image":
				Q("error", e), Q("load", e);
				break;
			case "details":
				Q("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Q("error", e), Q("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(i(137, t));
					default: $(e, t, u, r, n, null);
				}
				return;
			default: if (_n(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && tp(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && $(e, t, c, r, n, null));
	}
	var rp = {};
	function ip(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var a = null, o = null, s = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || $(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (I = !0), o = m;
							break;
						case "name":
							m !== f && (I = !0), a = m;
							break;
						case "checked":
							m !== f && (I = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (I = !0), d = m;
							break;
						case "value":
							m !== f && (I = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (I = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && $(e, t, p, m, r, f);
					}
				}
				sn(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || $(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (I = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (I = !0), c = o;
						break;
					case "multiple": o !== l && (I = !0), s = o;
					default: o !== l && $(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? un(e, !!n, n ? [] : "", !1) : un(e, !!n, t, !0)) : un(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: $(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && (I = !0), p = a;
						break;
					case "defaultValue":
						a !== o && (I = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && $(e, t, s, a, r, o);
				}
				dn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: $(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (I = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: $(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && $(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: $(e, t, u, p, r, m);
				}
				return;
			default: if (_n(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && tp(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || tp(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && $(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || $(e, t, f, p, r, m);
	}
	function ap(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function op() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && ap(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && ap(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var sp = null, cp = null;
	function lp(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function up(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function dp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function fp(e, t, n, r) {
		return n = lp(n).createElement(e), n[Dt] = r, n[Ot] = t, np(n, e, t), Bt(n), n;
	}
	function pp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var mp = null;
	function hp() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== mp && (mp = e, !0) : (mp = null, !1);
	}
	var gp = typeof setTimeout == "function" ? setTimeout : void 0, _p = typeof clearTimeout == "function" ? clearTimeout : void 0, vp = typeof Promise == "function" ? Promise : void 0, yp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : gp, bp = typeof queueMicrotask == "function" ? queueMicrotask : vp === void 0 ? gp : function(e) {
		return vp.resolve(null).then(e).catch(xp);
	};
	function xp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Sp(e) {
		return e === "head";
	}
	function Cp(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Hh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") _m(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, _m(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[Pt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && _m(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Hh(t);
	}
	function wp(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function Tp(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function Ep(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function Dp(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function Op(e) {
		return Dp(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function kp(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return Dp(t, n, e);
	}
	function Ap(e) {
		return e.documentElement.clientHeight;
	}
	function jp(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Mp(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (Ap(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += Xm(f), u > $m) {
									s.length = o;
									break;
								}
								f = new Promise(jp.bind(f)), s.push(f);
							}
						}
					}
					if (0 < s.length) return t = Promise.race([Promise.all(s), new Promise(function(e) {
						return setTimeout(e, 500);
					})]).then(i, i), (n ? Promise.allSettled([n.finished, t]) : t).then(a, a);
					if (i(), n) return n.finished.then(a, a);
					a();
				},
				types: n
			});
			l.__reactViewTransition = u;
			var d = [];
			return u.ready.then(function() {
				for (var e = l.documentElement.getAnimations({ subtree: !0 }), t = 0; t < e.length; t++) {
					var n = e[t], r = n.effect, i = r.pseudoElement;
					if (i != null && i.startsWith("::view-transition")) {
						d.push(n), n = r.getKeyframes();
						for (var a = i = void 0, s = !0, c = 0; c < n.length; c++) {
							var u = n[c], f = u.width;
							if (i === void 0) i = f;
							else if (i !== f) {
								s = !1;
								break;
							}
							if (f = u.height, a === void 0) a = f;
							else if (a !== f) {
								s = !1;
								break;
							}
							delete u.width, delete u.height, u.transform === "none" && delete u.transform;
						}
						s && i !== void 0 && a !== void 0 && (r.setKeyframes(n), s = getComputedStyle(r.target, r.pseudoElement), s.width !== i || s.height !== a) && (s = n[0], s.width = i, s.height = a, s = n[n.length - 1], s.width = i, s.height = a, r.setKeyframes(n));
					}
				}
				o();
			}, function(e) {
				l.__reactViewTransition === u && (l.__reactViewTransition = null);
				try {
					if (typeof e == "object" && e) switch (e.name) {
						case "InvalidStateError": (e.message === "View transition was skipped because document visibility state is hidden." || e.message === "Skipping view transition because document visibility state has become hidden." || e.message === "Skipping view transition because viewport size changed." || e.message === "Transition was aborted because of invalid state") && (e = null);
					}
					e !== null && c(e);
				} finally {
					r(), i(), o();
				}
			}), u.finished.finally(function() {
				for (var e = 0; e < d.length; e++) d[e].cancel();
				l.__reactViewTransition === u && (l.__reactViewTransition = null), s();
			}), u;
		} catch {
			return r(), i(), o(), null;
		}
	}
	function Np(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Np.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : w({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Np.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Np.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Pp(e) {
		return {
			name: e,
			group: new Np("group", e),
			imagePair: new Np("image-pair", e),
			old: new Np("old", e),
			new: new Np("new", e)
		};
	}
	function Fp(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Fp.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Bp(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = Rp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), f(this._fragmentFiber.child, !1, Ip, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function Ip(e, t, n, r) {
		return _(e).addEventListener(t, n, r), !1;
	}
	Fp.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Bp(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = Rp(i.optionsOrUseCapture), f(this._fragmentFiber.child, !1, Lp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function Lp(e, t, n, r) {
		return _(e).removeEventListener(t, n, r), !1;
	}
	function Rp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function zp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Bp(e, t, n, r) {
		if (e.length === 0) return -1;
		r = zp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && zp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Fp.prototype.dispatchEvent = function(e) {
		var t = p(this._fragmentFiber);
		if (t === null) return !0;
		t = _(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Fp.prototype.focus = function(e) {
		f(this._fragmentFiber.child, !0, Vp, e, void 0, void 0);
	};
	function Vp(e, t) {
		return e.tag !== 6 && (e = _(e), pm(e, t));
	}
	Fp.prototype.focusLast = function(e) {
		var t = [];
		f(this._fragmentFiber.child, !0, Hp, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Vp(t[n], e); n--);
	};
	function Hp(e, t) {
		return t.push(e), !1;
	}
	Fp.prototype.blur = function() {
		var e = p(this._fragmentFiber);
		e !== null && (e = _(e), e = lp(e).activeElement, e !== null && f(this._fragmentFiber.child, !1, Up, e, void 0, void 0));
	};
	function Up(e, t) {
		return e.tag !== 6 && (e = _(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Fp.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), f(this._fragmentFiber.child, !1, Wp, e, void 0, void 0);
	};
	function Wp(e, t) {
		return e.tag === 6 || (e = _(e), t.observe(e)), !1;
	}
	Fp.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), f(this._fragmentFiber.child, !1, Gp, e, void 0, void 0);
			for (var n = t = 0; n < Kp.length; n++) {
				var r = Kp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : Kp[t++] = r;
			}
			Kp.length = t;
		}
	};
	function Gp(e, t) {
		return e.tag === 6 || (e = _(e), t.unobserve(e)), !1;
	}
	var Kp = [], qp = !1;
	function Jp(e, t, n) {
		Kp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), qp || (qp = !0, mm(function() {
			qp = !1;
			var e = Kp;
			Kp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Fp.prototype.getClientRects = function() {
		var e = [];
		return f(this._fragmentFiber.child, !1, Yp, e, void 0, void 0), e;
	};
	function Yp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = _(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Fp.prototype.getRootNode = function(e) {
		var t = p(this._fragmentFiber);
		return t === null ? this : _(t).getRootNode(e);
	}, Fp.prototype.compareDocumentPosition = function(e) {
		var t = p(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		f(this._fragmentFiber.child, !1, Hp, n, void 0, void 0);
		var r = _(t);
		if (n.length === 0) {
			if (n = r, m(this._fragmentFiber)) {
				a: {
					for (t = this._fragmentFiber.return; t !== null;) {
						if (t.tag === 4) {
							t = t.stateNode.containerInfo;
							break a;
						}
						if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
						t = t.return;
					}
					t = null;
				}
				t != null && (n = t);
			}
			t = this._fragmentFiber;
			var i = r = n.compareDocumentPosition(e);
			return n === e ? i = Node.DOCUMENT_POSITION_CONTAINS : r & Node.DOCUMENT_POSITION_CONTAINED_BY && (n = h(t)[1], n === null ? i = Node.DOCUMENT_POSITION_PRECEDING : (e = _(n).compareDocumentPosition(e), i = e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		t = _(n[0]), i = _(n[n.length - 1]);
		var a = m(this._fragmentFiber) ? t.parentElement : r;
		if (a == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		r = a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY, a = a.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var o = t.compareDocumentPosition(e), s = i.compareDocumentPosition(e), c = o & Node.DOCUMENT_POSITION_CONTAINED_BY || s & Node.DOCUMENT_POSITION_CONTAINED_BY;
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Xp(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function Xp(e, t, n, r, i) {
		var a = Lt(i);
		if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (n = !!a) a: {
				for (; a !== null;) {
					if (a.tag === 7 && (a === t || a.alternate === t)) {
						n = !0;
						break a;
					}
					a = a.return;
				}
				n = !1;
			}
			return n;
		}
		if (e & Node.DOCUMENT_POSITION_CONTAINS) {
			if (a === null) return a = i.ownerDocument, i === a || i === a.documentElement || i === a.body;
			a: {
				for (a = t, t = p(t); a !== null;) {
					if (!(a.tag !== 5 && a.tag !== 3 && a.tag !== 27 || a !== t && a.alternate !== t)) {
						a = !0;
						break a;
					}
					a = a.return;
				}
				a = !1;
			}
			return a;
		}
		return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!a) && !(t = a === n) && (t = C(n, a, S), t === null ? t = !1 : (f(t, !0, b, a, n), a = v, v = null, t = a !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!a) && !(t = a === r) && (t = C(r, a, S), t === null ? t = !1 : (f(t, !0, x, a, r), a = v, y = v = null, t = a !== null)), t) : !1;
	}
	function Zp(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Fp.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(i(566));
		var t = [];
		f(this._fragmentFiber.child, !1, Hp, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = h(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || p(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = _(r), Zp(e, n);
				return;
			}
			if (r = _(r), r.nodeType !== 9) {
				if (r.nodeType === 11) {
					n = "host" in r ? r.host : null, n !== null && n.scrollIntoView(e);
					return;
				}
				r.scrollIntoView(e);
			}
		}
		for (r = n ? t.length - 1 : 0; r !== (n ? -1 : t.length);) {
			var a = t[r];
			a.tag === 6 ? (a = _(a), Zp(a, n)) : _(a).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function Qp(e, t) {
		return e = _(e), $p(e, t), !1;
	}
	function $p(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function em(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < Kp.length; i++) {
				var a = Kp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (Kp[r++] = a);
			}
			Kp.length = r, n.observe(e);
		}), $p(e, t));
	}
	function tm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Jp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function nm(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					nm(n), It(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function rm(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[Pt]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = lm(e.nextSibling), e === null) break;
		}
		return null;
	}
	function im(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function am(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function om(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function sm(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function cm(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function lm(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var um = null;
	function dm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return lm(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function fm(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function pm(e, t) {
		function n() {
			r = !0;
		}
		if (e.ownerDocument.activeElement === e) return !0;
		var r = !1;
		try {
			e.ownerDocument.addEventListener("focus", n, !0), (e.focus || HTMLElement.prototype.focus).call(e, t);
		} finally {
			e.ownerDocument.removeEventListener("focus", n, !0);
		}
		return r;
	}
	function mm(e) {
		yp(function() {
			yp(function(t) {
				return e(t);
			});
		});
	}
	function hm(e, t, n) {
		switch (t = lp(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(i(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(i(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(i(454));
				return e;
			default: throw Error(i(451));
		}
	}
	function gm(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && $(e, t, r, null, rp, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === xn && (e.onclick = null), It(e);
	}
	function _m(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		It(e);
	}
	var vm = /* @__PURE__ */ new Map(), ym = /* @__PURE__ */ new Set();
	function bm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var xm = k.d;
	k.d = {
		f: Sm,
		r: Cm,
		D: Em,
		C: Dm,
		L: Om,
		m: km,
		X: jm,
		S: Am,
		M: Mm
	};
	function Sm() {
		var e = xm.f(), t = zd();
		return e || t;
	}
	function Cm(e) {
		var t = Rt(e);
		t !== null && t.tag === 5 && t.type === "form" ? nc(t) : xm.r(e);
	}
	var wm = typeof document > "u" ? null : document;
	function Tm(e, t, n) {
		var r = wm;
		if (r && typeof t == "string" && t) {
			var i = on(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), ym.has(i) || (ym.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), np(t, "link", e), Bt(t), r.head.appendChild(t)));
		}
	}
	function Em(e) {
		xm.D(e), Tm("dns-prefetch", e, null);
	}
	function Dm(e, t) {
		xm.C(e, t), Tm("preconnect", e, t);
	}
	function Om(e, t, n) {
		xm.L(e, t, n);
		var r = wm;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + on(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + on(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + on(n.imageSizes) + "\"]")) : i += "[href=\"" + on(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Pm(e);
					break;
				case "script": a = Rm(e);
			}
			if (!(vm.has(a) || (e = w({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), vm.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Fm(a)) || t === "script" && r.querySelector(zm(a))))) {
				var o = r.createElement("link");
				np(o, "link", e), t === "style" && (o[Ft] = !0, o.onload = o.onerror = function() {
					F(o);
				}), Bt(o), r.head.appendChild(o);
			}
		}
	}
	function km(e, t) {
		xm.m(e, t);
		var n = wm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + on(r) + "\"][href=\"" + on(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Rm(e);
			}
			if (!vm.has(a) && (e = w({
				rel: "modulepreload",
				href: e
			}, t), vm.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(zm(a))) return;
				}
				r = n.createElement("link"), np(r, "link", e), Bt(r), n.head.appendChild(r);
			}
		}
	}
	function Am(e, t, n) {
		xm.S(e, t, n);
		var r = wm;
		if (r && e) {
			var i = zt(r).hoistableStyles, a = Pm(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Fm(a))) s.loading = 5;
				else {
					e = w({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = vm.get(a)) && Hm(e, n);
					var c = o = r.createElement("link");
					Bt(c), np(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Vm(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function jm(e, t) {
		xm.X(e, t);
		var n = wm;
		if (n && e) {
			var r = zt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = w({
				src: e,
				async: !0
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), Bt(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Mm(e, t) {
		xm.M(e, t);
		var n = wm;
		if (n && e) {
			var r = zt(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = w({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), Bt(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Nm(e, t, n, r) {
		var a = (a = Ae.current) ? bm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Pm(n.href), t = zt(a).hoistableStyles, r = t.get(n), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = Pm(n.href);
					var o = zt(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Fm(e))) ? o._p || (s.instance = o, s.state.loading = 5) : (o = vm.get(e), o || (o = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, vm.set(e, o)), Lm(a, e, o, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Rm(n), t = zt(a).hoistableScripts, r = t.get(n), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(i(444, e));
		}
	}
	function Pm(e) {
		return "href=\"" + on(e) + "\"";
	}
	function Fm(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Im(e) {
		return w({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Lm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[Ft]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[Ft] = !0, t.onload = t.onerror = F.bind(null, t), np(t, "link", n), Bt(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function Rm(e) {
		return "[src=\"" + on(e) + "\"]";
	}
	function zm(e) {
		return "script[async]" + e;
	}
	function Bm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + on(n.href) + "\"]");
				if (r) return t.instance = r, Bt(r), r;
				var a = w({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Bt(r), np(r, "style", a), Vm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Pm(n.href);
				var o = e.querySelector(Fm(a));
				if (o) return t.state.loading |= 4, t.instance = o, Bt(o), o;
				r = Im(n), (a = vm.get(a)) && Hm(r, a), o = (e.ownerDocument || e).createElement("link"), Bt(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), np(o, "link", r), t.state.loading |= 4, Vm(o, n.precedence, e), t.instance = o;
			case "script": return o = Rm(n.src), (a = e.querySelector(zm(o))) ? (t.instance = a, Bt(a), a) : (r = n, (a = vm.get(o)) && (r = w({}, n), Um(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), Bt(a), np(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Vm(r, n.precedence, e));
		return t.instance;
	}
	function Vm(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Hm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Um(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Wm = null;
	function Gm(e, t, n) {
		if (Wm === null) {
			var r = /* @__PURE__ */ new Map(), i = Wm = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Wm, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[Pt] || a[Dt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Km(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function qm(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Jm(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Ym(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Xm(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function Zm(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += Xm(t), e.suspenseyImages.push(t)), e = rh.bind(e), t.decode().then(e, e));
	}
	function Qm(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Pm(r.href), a = t.querySelector(Fm(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = nh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Bt(a);
					return;
				}
				a = t.ownerDocument || t, r = Im(r), (i = vm.get(i)) && Hm(r, i), a = a.createElement("link"), Bt(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), np(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = nh.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var $m = 0;
	function eh(e, t) {
		return e.stylesheets && e.count === 0 && ah(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && ah(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && $m === 0 && ($m = 62500 * op());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && ah(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > $m ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function th(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) ah(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function nh() {
		this.count--, th(this);
	}
	function rh() {
		this.imgCount--, th(this);
	}
	var ih = null;
	function ah(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, ih = /* @__PURE__ */ new Map(), t.forEach(oh, e), ih = null, nh.call(e));
	}
	function oh(e, t) {
		if (!(t.state.loading & 4)) {
			var n = ih.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), ih.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = nh.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var sh = {
		$$typeof: E,
		Provider: null,
		Consumer: null,
		_currentValue: Ce,
		_currentValue2: Ce,
		_threadCount: 0
	};
	function ch(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = gt(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = gt(0), this.hiddenUpdates = gt(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function lh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ch(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = Mi(3, null, null, t), e.current = a, a.stateNode = e, t = ja(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, mo(a), e;
	}
	function uh(e) {
		return e ? (e = Ai, e) : Ai;
	}
	function dh(e, t, n, r, i, a) {
		i = uh(i), r.context === null ? r.context = i : r.pendingContext = i, r = go(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = _o(e, r, t), n !== null && (Pd(n, e, t), vo(n, e, t));
	}
	function fh(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ph(e, t) {
		fh(e, t), (e = e.alternate) && fh(e, t);
	}
	function mh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Di(e, 67108864);
			t !== null && Pd(t, e, 67108864), ph(e, 67108864);
		}
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = jd();
			t = St(t);
			var n = Di(e, t);
			n !== null && Pd(n, e, t), ph(e, t);
		}
	}
	var gh = !0;
	function _h(e, t, n, r) {
		var i = O.T;
		O.T = null;
		var a = k.p;
		try {
			k.p = 2, yh(e, t, n, r);
		} finally {
			k.p = a, O.T = i;
		}
	}
	function vh(e, t, n, r) {
		var i = O.T;
		O.T = null;
		var a = k.p;
		try {
			k.p = 8, yh(e, t, n, r);
		} finally {
			k.p = a, O.T = i;
		}
	}
	function yh(e, t, n, r) {
		if (gh) {
			var i = bh(r);
			if (i === null) Kf(e, t, r, xh, n), Mh(e, r);
			else if (Ph(i, e, t, n, r)) r.stopPropagation();
			else if (Mh(e, r), t & 4 && -1 < jh.indexOf(e)) {
				for (; i !== null;) {
					var a = Rt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = dt(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - at(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Ef(a), !(K & 6) && (gd = Je() + 500, Df(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Di(a, 2), s !== null && Pd(s, a, 2), zd(), ph(a, 2);
					}
					if (a = bh(r), a === null && Kf(e, t, r, xh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Kf(e, t, r, null, n);
		}
	}
	function bh(e) {
		return e = Sn(e), Sh(e);
	}
	var xh = null;
	function Sh(e) {
		if (xh = null, e = Lt(e), e !== null) {
			var t = o(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = s(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = c(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return xh = e, null;
	}
	function Ch(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (j()) {
				case Ye: return 2;
				case Xe: return 8;
				case Ze:
				case Qe: return 32;
				case $e: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var wh = !1, Th = null, Eh = null, Dh = null, Oh = /* @__PURE__ */ new Map(), kh = /* @__PURE__ */ new Map(), Ah = [], jh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Mh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Th = null;
				break;
			case "dragenter":
			case "dragleave":
				Eh = null;
				break;
			case "mouseover":
			case "mouseout":
				Dh = null;
				break;
			case "pointerover":
			case "pointerout":
				Oh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": kh.delete(t.pointerId);
		}
	}
	function Nh(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Rt(t), t !== null && mh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Ph(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Th = Nh(Th, e, t, n, r, i), !0;
			case "dragenter": return Eh = Nh(Eh, e, t, n, r, i), !0;
			case "mouseover": return Dh = Nh(Dh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return Oh.set(a, Nh(Oh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, kh.set(a, Nh(kh.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Fh(e) {
		var t = Lt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, Tt(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, Tt(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Ih(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = bh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				L = r, n.target.dispatchEvent(r), L = null;
			} else return t = Rt(n), t !== null && mh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Lh(e, t, n) {
		Ih(e) && n.delete(t);
	}
	function Rh() {
		wh = !1, Th !== null && Ih(Th) && (Th = null), Eh !== null && Ih(Eh) && (Eh = null), Dh !== null && Ih(Dh) && (Dh = null), Oh.forEach(Lh), kh.forEach(Lh);
	}
	function zh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, wh || (wh = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, Rh)));
	}
	var Bh = null;
	function Vh(e) {
		Bh !== e && (Bh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Bh === e && (Bh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Sh(r || n) === null) continue;
					break;
				}
				var a = Rt(n);
				a !== null && (e.splice(t, 3), t -= 3, ec(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Hh(e) {
		function t(t) {
			return zh(t, e);
		}
		Th !== null && zh(Th, e), Eh !== null && zh(Eh, e), Dh !== null && zh(Dh, e), Oh.forEach(t), kh.forEach(t);
		for (var n = 0; n < Ah.length; n++) {
			var r = Ah[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < Ah.length && (n = Ah[0], n.blockedOn === null);) Fh(n), n.blockedOn === null && Ah.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[Ot] || null;
			if (typeof a == "function") o || Vh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[Ot] || null) s = o.formAction;
					else if (Sh(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Vh(n);
			}
		}
	}
	function Uh() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Wh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.render = Wh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(i(409));
		var n = t.current;
		dh(n, jd(), e, t, null, null);
	}, Gh.prototype.unmount = Wh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			dh(e.current, 2, null, e, null, null), zd(), t[kt] = null;
		}
	};
	function Gh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = wt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Ah.length && t !== 0 && t < Ah[n].priority; n++);
			Ah.splice(n, 0, e), n === 0 && Fh(e);
		}
	};
	var Kh = n.version;
	if (Kh !== "19.3.1") throw Error(i(527, Kh, "19.3.1"));
	k.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = u(t), e = e === null ? null : d(e), e = e === null ? null : e.stateNode, e;
	};
	var qh = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: O,
		reconcilerVersion: "19.3.1"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Jh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Jh.isDisabled && Jh.supportsFiber) try {
			nt = Jh.inject(qh), rt = Jh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = Cc, s = wc, c = Tc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = lh(e, 1, !1, null, null, n, r, null, o, s, c, Uh), e[kt] = t.current, Wf(e), new Wh(t);
	};
})), ce = /* @__PURE__ */ o(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = se();
})), E = /* @__PURE__ */ c(ie(), 1), D = ce(), le = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, ue = (e, t) => ({
	classGroupId: e,
	validator: t
}), de = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), fe = "-", pe = [], me = "arbitrary..", he = (e) => {
	let t = ve(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return _e(e);
			let n = e.split(fe);
			return ge(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? le(i, t) : t : i || pe;
			}
			return n[e] || pe;
		}
	};
}, ge = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = ge(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(fe) : e.slice(t).join(fe), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, _e = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? me + r : void 0;
})(), ve = (e) => {
	let { theme: t, classGroups: n } = e;
	return ye(n, t);
}, ye = (e, t) => {
	let n = de();
	for (let r in e) {
		let i = e[r];
		be(i, n, r, t);
	}
	return n;
}, be = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		xe(i, t, n, r);
	}
}, xe = (e, t, n, r) => {
	typeof e == "string" ? Se(e, t, n) : typeof e == "function" ? O(e, t, n, r) : k(e, t, n, r);
}, Se = (e, t, n) => {
	let r = e === "" ? t : Ce(t, e);
	r.classGroupId = n;
}, O = (e, t, n, r) => {
	we(e) ? be(e(r), t, n, r) : (t.validators === null && (t.validators = []), t.validators.push(ue(n, e)));
}, k = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		be(o, Ce(t, a), n, r);
	}
}, Ce = (e, t) => {
	let n = e, r = t.split(fe), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = de(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, we = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Te = (e) => {
	if (e < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let t = 0, n = Object.create(null), r = Object.create(null), i = (i, a) => {
		n[i] = a, t++, t > e && (t = 0, r = n, n = Object.create(null));
	};
	return {
		get(e) {
			let t = n[e];
			if (t !== void 0) return t;
			if ((t = r[e]) !== void 0) return i(e, t), t;
		},
		set(e, t) {
			e in n ? n[e] = t : i(e, t);
		}
	};
}, Ee = "!", De = ":", A = [], Oe = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), ke = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === De) {
					t.push(e.slice(i, s)), i = s + 1;
					continue;
				}
				if (o === "/") {
					a = s;
					continue;
				}
			}
			o === "[" ? n++ : o === "]" ? n-- : o === "(" ? r++ : o === ")" && r--;
		}
		let s = t.length === 0 ? e : e.slice(i), c = s, l = !1;
		s.endsWith(Ee) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Ee) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Oe(t, l, c, u);
	};
	if (t) {
		let e = t + De, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Oe(A, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Ae = (e) => {
	let t = /* @__PURE__ */ new Map();
	return e.orderSensitiveModifiers.forEach((e, n) => {
		t.set(e, 1e6 + n);
	}), (e) => {
		let n = [], r = [];
		for (let i = 0; i < e.length; i++) {
			let a = e[i], o = a[0] === "[", s = t.has(a);
			o || s ? (r.length > 0 && (r.sort(), n.push(...r), r = []), n.push(a)) : r.push(a);
		}
		return r.length > 0 && (r.sort(), n.push(...r)), n;
	};
}, je = (e) => ({
	cache: Te(e.cacheSize),
	parseClassName: ke(e),
	sortModifiers: Ae(e),
	postfixLookupClassGroupIds: Me(e),
	...he(e)
}), Me = (e) => {
	let t = Object.create(null), n = e.postfixLookupClassGroups;
	if (n) for (let e = 0; e < n.length; e++) t[n[e]] = !0;
	return t;
}, Ne = /\s+/, Pe = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a, postfixLookupClassGroupIds: o } = t, s = [], c = e.trim().split(Ne), l = "";
	for (let e = c.length - 1; e >= 0; --e) {
		let t = c[e], { isExternal: u, modifiers: d, hasImportantModifier: f, baseClassName: p, maybePostfixModifierPosition: m } = n(t);
		if (u) {
			l = t + (l.length > 0 ? " " + l : l);
			continue;
		}
		let h = !!m, g;
		if (h) {
			g = r(p.substring(0, m));
			let e = g && o[g] ? r(p) : void 0;
			e && e !== g && (g = e, h = !1);
		} else g = r(p);
		if (!g) {
			if (!h || (g = r(p), !g)) {
				l = t + (l.length > 0 ? " " + l : l);
				continue;
			}
			h = !1;
		}
		let _ = d.length === 0 ? "" : d.length === 1 ? d[0] : a(d).join(":"), v = f ? _ + Ee : _, y = v + g;
		if (s.indexOf(y) > -1) continue;
		s.push(y);
		let b = i(g, h);
		for (let e = 0; e < b.length; ++e) {
			let t = b[e];
			s.push(v + t);
		}
		l = t + (l.length > 0 ? " " + l : l);
	}
	return l;
}, Fe = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Ie(n)) && (i && (i += " "), i += r);
	return i;
}, Ie = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Ie(e[r])) && (n && (n += " "), n += t);
	return n;
}, Le = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = je(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Pe(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Fe(...e));
}, Re = [], ze = (e) => {
	let t = (t) => t[e] || Re;
	return t.isThemeGetter = !0, t.themeKey = e, t;
}, Be = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Ve = /^\((?:(\w[\w-]*):)?(.+)\)$/i, He = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, Ue = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, We = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Ge = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix|color|light-dark)\(.+\)$/, Ke = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, qe = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Je = (e) => He.test(e), j = (e) => !!e && !Number.isNaN(Number(e)), Ye = (e) => !!e && Number.isInteger(Number(e)), Xe = (e) => e.endsWith("%") && j(e.slice(0, -1)), Ze = (e) => Ue.test(e), Qe = () => !0, $e = (e) => We.test(e) && !Ge.test(e), et = () => !1, tt = (e) => Ke.test(e), nt = (e) => qe.test(e), rt = (e) => !M(e) && !N(e), it = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), at = (e) => bt(e, wt, et), M = (e) => Be.test(e), ot = (e) => bt(e, Tt, $e), st = (e) => bt(e, Et, j), ct = (e) => bt(e, Ot, Qe), lt = (e) => bt(e, Dt, et), ut = (e) => bt(e, St, et), dt = (e) => bt(e, Ct, nt), ft = (e) => bt(e, kt, tt), N = (e) => Ve.test(e), pt = (e) => xt(e, Tt), mt = (e) => xt(e, Dt), ht = (e) => xt(e, St), gt = (e) => xt(e, wt), _t = (e) => xt(e, Ct), vt = (e) => xt(e, kt, !0), yt = (e) => xt(e, Ot, !0), bt = (e, t, n) => {
	let r = Be.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, xt = (e, t, n = !1) => {
	let r = Ve.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, St = (e) => e === "position" || e === "percentage", Ct = (e) => e === "image" || e === "url", wt = (e) => e === "length" || e === "size" || e === "bg-size", Tt = (e) => e === "length", Et = (e) => e === "number", Dt = (e) => e === "family-name", Ot = (e) => e === "number" || e === "weight", kt = (e) => e === "shadow", At = () => {
	let e = ze("color"), t = ze("font"), n = ze("text"), r = ze("font-weight"), i = ze("tracking"), a = ze("leading"), o = ze("breakpoint"), s = ze("container"), c = ze("spacing"), l = ze("radius"), u = ze("shadow"), d = ze("inset-shadow"), f = ze("text-shadow"), p = ze("drop-shadow"), m = ze("blur"), h = ze("perspective"), g = ze("aspect"), _ = ze("ease"), v = ze("animate"), y = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	], b = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	], x = () => [
		...b(),
		N,
		M
	], S = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	], C = () => [
		"auto",
		"contain",
		"none"
	], w = () => [
		N,
		M,
		c
	], T = () => [
		Je,
		"full",
		"auto",
		...w()
	], ee = () => [
		Ye,
		"none",
		"subgrid",
		N,
		M
	], te = () => [
		"auto",
		{ span: [
			"full",
			Ye,
			N,
			M
		] },
		Ye,
		N,
		M
	], ne = () => [
		Ye,
		"auto",
		N,
		M
	], re = () => [
		"auto",
		"min",
		"max",
		"fr",
		N,
		M
	], ie = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	], ae = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], oe = () => ["auto", ...w()], se = () => [
		Je,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...w()
	], ce = () => [
		s,
		Je,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], E = () => [
		Je,
		"screen",
		"full",
		"lh",
		"dvh",
		"lvh",
		"svh",
		"min",
		"max",
		"fit",
		...w()
	], D = () => [
		e,
		N,
		M
	], le = () => [
		...b(),
		ht,
		ut,
		{ position: [N, M] }
	], ue = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], de = () => [
		"auto",
		"cover",
		"contain",
		gt,
		at,
		{ size: [N, M] }
	], fe = () => [
		Xe,
		pt,
		ot
	], pe = () => [
		"",
		"none",
		"full",
		l,
		N,
		M
	], me = () => [
		"",
		j,
		pt,
		ot
	], he = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], ge = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	], _e = () => [
		j,
		Xe,
		ht,
		ut
	], ve = () => [
		"",
		"none",
		m,
		N,
		M
	], ye = () => [
		"none",
		j,
		N,
		M
	], be = () => [
		"none",
		j,
		N,
		M
	], xe = () => [
		j,
		N,
		M
	], Se = () => [
		Je,
		"full",
		...w()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [Ze],
			breakpoint: [Ze],
			color: [Qe],
			container: [Ze],
			"drop-shadow": [Ze],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [rt],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [Ze],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [Ze],
			shadow: [Ze],
			spacing: ["px", j],
			text: [Ze],
			"text-shadow": [Ze],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			aspect: [{ aspect: [
				"auto",
				"square",
				Je,
				M,
				N,
				g
			] }],
			container: ["container"],
			"container-type": [{ "@container": [
				"",
				"normal",
				"size",
				N,
				M
			] }],
			"container-named": [it],
			columns: [{ columns: [
				j,
				"auto",
				M,
				N,
				s
			] }],
			"break-after": [{ "break-after": y() }],
			"break-before": [{ "break-before": y() }],
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			box: [{ box: ["border", "content"] }],
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			sr: ["sr-only", "not-sr-only"],
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			isolation: ["isolate", "isolation-auto"],
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			"object-position": [{ object: x() }],
			overflow: [{ overflow: S() }],
			"overflow-x": [{ "overflow-x": S() }],
			"overflow-y": [{ "overflow-y": S() }],
			overscroll: [{ overscroll: C() }],
			"overscroll-x": [{ "overscroll-x": C() }],
			"overscroll-y": [{ "overscroll-y": C() }],
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			inset: [{ inset: T() }],
			"inset-x": [{ "inset-x": T() }],
			"inset-y": [{ "inset-y": T() }],
			start: [{
				"inset-s": T(),
				start: T()
			}],
			end: [{
				"inset-e": T(),
				end: T()
			}],
			"inset-bs": [{ "inset-bs": T() }],
			"inset-be": [{ "inset-be": T() }],
			top: [{ top: T() }],
			right: [{ right: T() }],
			bottom: [{ bottom: T() }],
			left: [{ left: T() }],
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			z: [{ z: [
				Ye,
				"auto",
				N,
				M
			] }],
			basis: [{ basis: [
				Je,
				"full",
				"auto",
				s,
				...w()
			] }],
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			flex: [{ flex: [
				j,
				Je,
				"auto",
				"initial",
				"none",
				M
			] }],
			grow: [{ grow: [
				"",
				j,
				N,
				M
			] }],
			shrink: [{ shrink: [
				"",
				j,
				N,
				M
			] }],
			order: [{ order: [
				Ye,
				"first",
				"last",
				"none",
				N,
				M
			] }],
			"grid-cols": [{ "grid-cols": ee() }],
			"col-start-end": [{ col: te() }],
			"col-start": [{ "col-start": ne() }],
			"col-end": [{ "col-end": ne() }],
			"grid-rows": [{ "grid-rows": ee() }],
			"row-start-end": [{ row: te() }],
			"row-start": [{ "row-start": ne() }],
			"row-end": [{ "row-end": ne() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": re() }],
			"auto-rows": [{ "auto-rows": re() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...ie(), "normal"] }],
			"justify-items": [{ "justify-items": [...ae(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...ae()] }],
			"align-content": [{ content: ["normal", ...ie()] }],
			"align-items": [{ items: [...ae(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...ae(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": ie() }],
			"place-items": [{ "place-items": [...ae(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...ae()] }],
			p: [{ p: w() }],
			px: [{ px: w() }],
			py: [{ py: w() }],
			ps: [{ ps: w() }],
			pe: [{ pe: w() }],
			pbs: [{ pbs: w() }],
			pbe: [{ pbe: w() }],
			pt: [{ pt: w() }],
			pr: [{ pr: w() }],
			pb: [{ pb: w() }],
			pl: [{ pl: w() }],
			m: [{ m: oe() }],
			mx: [{ mx: oe() }],
			my: [{ my: oe() }],
			ms: [{ ms: oe() }],
			me: [{ me: oe() }],
			mbs: [{ mbs: oe() }],
			mbe: [{ mbe: oe() }],
			mt: [{ mt: oe() }],
			mr: [{ mr: oe() }],
			mb: [{ mb: oe() }],
			ml: [{ ml: oe() }],
			"space-x": [{ "space-x": w() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": w() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: se() }],
			"inline-size": [{ inline: ["auto", ...ce()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...ce()] }],
			"max-inline-size": [{ "max-inline": ["none", ...ce()] }],
			"block-size": [{ block: ["auto", ...E()] }],
			"min-block-size": [{ "min-block": ["auto", ...E()] }],
			"max-block-size": [{ "max-block": ["none", ...E()] }],
			w: [{ w: [
				s,
				"screen",
				...se()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...se()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...se()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...se()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...se()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				"none",
				...se()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				pt,
				ot
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				yt,
				ct
			] }],
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				Xe,
				M
			] }],
			"font-family": [{ font: [
				mt,
				lt,
				t
			] }],
			"font-features": [{ "font-features": [M] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				N,
				M
			] }],
			"line-clamp": [{ "line-clamp": [
				j,
				"none",
				N,
				st
			] }],
			leading: [{ leading: [
				"none",
				a,
				...w()
			] }],
			"list-image": [{ "list-image": [
				"none",
				N,
				M
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				N,
				M
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: D() }],
			"text-color": [{ text: D() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...he(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				j,
				"from-font",
				"auto",
				N,
				ot
			] }],
			"text-decoration-color": [{ decoration: D() }],
			"underline-offset": [{ "underline-offset": [
				j,
				"auto",
				N,
				M
			] }],
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			indent: [{ indent: w() }],
			"tab-size": [{ tab: [
				Ye,
				N,
				M
			] }],
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				N,
				M
			] }],
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			content: [{ content: [
				"none",
				N,
				M
			] }],
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			"bg-position": [{ bg: le() }],
			"bg-repeat": [{ bg: ue() }],
			"bg-size": [{ bg: de() }],
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						Ye,
						N,
						M
					],
					radial: [
						"",
						N,
						M
					],
					conic: [
						"",
						Ye,
						N,
						M
					]
				},
				_t,
				dt
			] }],
			"bg-color": [{ bg: D() }],
			"gradient-from-pos": [{ from: fe() }],
			"gradient-via-pos": [{ via: fe() }],
			"gradient-to-pos": [{ to: fe() }],
			"gradient-from": [{ from: D() }],
			"gradient-via": [{ via: D() }],
			"gradient-to": [{ to: D() }],
			rounded: [{ rounded: pe() }],
			"rounded-s": [{ "rounded-s": pe() }],
			"rounded-e": [{ "rounded-e": pe() }],
			"rounded-t": [{ "rounded-t": pe() }],
			"rounded-r": [{ "rounded-r": pe() }],
			"rounded-b": [{ "rounded-b": pe() }],
			"rounded-l": [{ "rounded-l": pe() }],
			"rounded-ss": [{ "rounded-ss": pe() }],
			"rounded-se": [{ "rounded-se": pe() }],
			"rounded-ee": [{ "rounded-ee": pe() }],
			"rounded-es": [{ "rounded-es": pe() }],
			"rounded-tl": [{ "rounded-tl": pe() }],
			"rounded-tr": [{ "rounded-tr": pe() }],
			"rounded-br": [{ "rounded-br": pe() }],
			"rounded-bl": [{ "rounded-bl": pe() }],
			"border-w": [{ border: me() }],
			"border-w-x": [{ "border-x": me() }],
			"border-w-y": [{ "border-y": me() }],
			"border-w-s": [{ "border-s": me() }],
			"border-w-e": [{ "border-e": me() }],
			"border-w-bs": [{ "border-bs": me() }],
			"border-w-be": [{ "border-be": me() }],
			"border-w-t": [{ "border-t": me() }],
			"border-w-r": [{ "border-r": me() }],
			"border-w-b": [{ "border-b": me() }],
			"border-w-l": [{ "border-l": me() }],
			"divide-x": [{ "divide-x": me() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": me() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...he(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...he(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: D() }],
			"border-color-x": [{ "border-x": D() }],
			"border-color-y": [{ "border-y": D() }],
			"border-color-s": [{ "border-s": D() }],
			"border-color-e": [{ "border-e": D() }],
			"border-color-bs": [{ "border-bs": D() }],
			"border-color-be": [{ "border-be": D() }],
			"border-color-t": [{ "border-t": D() }],
			"border-color-r": [{ "border-r": D() }],
			"border-color-b": [{ "border-b": D() }],
			"border-color-l": [{ "border-l": D() }],
			"divide-color": [{ divide: D() }],
			"outline-style": [{ outline: [
				...he(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				j,
				N,
				M
			] }],
			"outline-w": [{ outline: [
				"",
				j,
				pt,
				ot
			] }],
			"outline-color": [{ outline: D() }],
			shadow: [{ shadow: [
				"",
				"inner",
				"none",
				u,
				vt,
				ft
			] }],
			"shadow-color": [{ shadow: D() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				vt,
				ft
			] }],
			"inset-shadow-color": [{ "inset-shadow": D() }],
			"ring-w": [{ ring: me() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: D() }],
			"ring-offset-w": [{ "ring-offset": [j, ot] }],
			"ring-offset-color": [{ "ring-offset": D() }],
			"inset-ring-w": [{ "inset-ring": me() }],
			"inset-ring-color": [{ "inset-ring": D() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				vt,
				ft
			] }],
			"text-shadow-color": [{ "text-shadow": D() }],
			opacity: [{ opacity: [
				j,
				N,
				M
			] }],
			"mix-blend": [{ "mix-blend": [
				...ge(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": ge() }],
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			"mask-image-linear-pos": [{ "mask-linear": [j] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": _e() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": _e() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": D() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": D() }],
			"mask-image-t-from-pos": [{ "mask-t-from": _e() }],
			"mask-image-t-to-pos": [{ "mask-t-to": _e() }],
			"mask-image-t-from-color": [{ "mask-t-from": D() }],
			"mask-image-t-to-color": [{ "mask-t-to": D() }],
			"mask-image-r-from-pos": [{ "mask-r-from": _e() }],
			"mask-image-r-to-pos": [{ "mask-r-to": _e() }],
			"mask-image-r-from-color": [{ "mask-r-from": D() }],
			"mask-image-r-to-color": [{ "mask-r-to": D() }],
			"mask-image-b-from-pos": [{ "mask-b-from": _e() }],
			"mask-image-b-to-pos": [{ "mask-b-to": _e() }],
			"mask-image-b-from-color": [{ "mask-b-from": D() }],
			"mask-image-b-to-color": [{ "mask-b-to": D() }],
			"mask-image-l-from-pos": [{ "mask-l-from": _e() }],
			"mask-image-l-to-pos": [{ "mask-l-to": _e() }],
			"mask-image-l-from-color": [{ "mask-l-from": D() }],
			"mask-image-l-to-color": [{ "mask-l-to": D() }],
			"mask-image-x-from-pos": [{ "mask-x-from": _e() }],
			"mask-image-x-to-pos": [{ "mask-x-to": _e() }],
			"mask-image-x-from-color": [{ "mask-x-from": D() }],
			"mask-image-x-to-color": [{ "mask-x-to": D() }],
			"mask-image-y-from-pos": [{ "mask-y-from": _e() }],
			"mask-image-y-to-pos": [{ "mask-y-to": _e() }],
			"mask-image-y-from-color": [{ "mask-y-from": D() }],
			"mask-image-y-to-color": [{ "mask-y-to": D() }],
			"mask-image-radial": [{ "mask-radial": [N, M] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": _e() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": _e() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": D() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": D() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [j] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": _e() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": _e() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": D() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": D() }],
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			"mask-position": [{ mask: le() }],
			"mask-repeat": [{ mask: ue() }],
			"mask-size": [{ mask: de() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				N,
				M
			] }],
			filter: [{ filter: [
				"",
				"none",
				N,
				M
			] }],
			blur: [{ blur: ve() }],
			brightness: [{ brightness: [
				j,
				N,
				M
			] }],
			contrast: [{ contrast: [
				j,
				N,
				M
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				vt,
				ft
			] }],
			"drop-shadow-color": [{ "drop-shadow": D() }],
			grayscale: [{ grayscale: [
				"",
				j,
				N,
				M
			] }],
			"hue-rotate": [{ "hue-rotate": [
				j,
				N,
				M
			] }],
			invert: [{ invert: [
				"",
				j,
				N,
				M
			] }],
			saturate: [{ saturate: [
				j,
				N,
				M
			] }],
			sepia: [{ sepia: [
				"",
				j,
				N,
				M
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				N,
				M
			] }],
			"backdrop-blur": [{ "backdrop-blur": ve() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				j,
				N,
				M
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				j,
				N,
				M
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				j,
				N,
				M
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				j,
				N,
				M
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				j,
				N,
				M
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				j,
				N,
				M
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				j,
				N,
				M
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				j,
				N,
				M
			] }],
			"border-collapse": [{ border: ["collapse", "separate"] }],
			"border-spacing": [{ "border-spacing": w() }],
			"border-spacing-x": [{ "border-spacing-x": w() }],
			"border-spacing-y": [{ "border-spacing-y": w() }],
			"table-layout": [{ table: ["auto", "fixed"] }],
			caption: [{ caption: ["top", "bottom"] }],
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				N,
				M
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				j,
				"initial",
				N,
				M
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				N,
				M
			] }],
			delay: [{ delay: [
				j,
				N,
				M
			] }],
			animate: [{ animate: [
				"none",
				v,
				N,
				M
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				N,
				M
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: ye() }],
			"rotate-x": [{ "rotate-x": ye() }],
			"rotate-y": [{ "rotate-y": ye() }],
			"rotate-z": [{ "rotate-z": ye() }],
			scale: [{ scale: be() }],
			"scale-x": [{ "scale-x": be() }],
			"scale-y": [{ "scale-y": be() }],
			"scale-z": [{ "scale-z": be() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: xe() }],
			"skew-x": [{ "skew-x": xe() }],
			"skew-y": [{ "skew-y": xe() }],
			transform: [{ transform: [
				N,
				M,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: Se() }],
			"translate-x": [{ "translate-x": Se() }],
			"translate-y": [{ "translate-y": Se() }],
			"translate-z": [{ "translate-z": Se() }],
			"translate-none": ["translate-none"],
			zoom: [{ zoom: [
				Ye,
				N,
				M
			] }],
			accent: [{ accent: D() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: D() }],
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				N,
				M
			] }],
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			"scrollbar-thumb-color": [{ "scrollbar-thumb": D() }],
			"scrollbar-track-color": [{ "scrollbar-track": D() }],
			"scrollbar-gutter": [{ "scrollbar-gutter": [
				"auto",
				"stable",
				"both"
			] }],
			"scrollbar-w": [{ scrollbar: [
				"auto",
				"thin",
				"none"
			] }],
			"scroll-m": [{ "scroll-m": w() }],
			"scroll-mx": [{ "scroll-mx": w() }],
			"scroll-my": [{ "scroll-my": w() }],
			"scroll-ms": [{ "scroll-ms": w() }],
			"scroll-me": [{ "scroll-me": w() }],
			"scroll-mbs": [{ "scroll-mbs": w() }],
			"scroll-mbe": [{ "scroll-mbe": w() }],
			"scroll-mt": [{ "scroll-mt": w() }],
			"scroll-mr": [{ "scroll-mr": w() }],
			"scroll-mb": [{ "scroll-mb": w() }],
			"scroll-ml": [{ "scroll-ml": w() }],
			"scroll-p": [{ "scroll-p": w() }],
			"scroll-px": [{ "scroll-px": w() }],
			"scroll-py": [{ "scroll-py": w() }],
			"scroll-ps": [{ "scroll-ps": w() }],
			"scroll-pe": [{ "scroll-pe": w() }],
			"scroll-pbs": [{ "scroll-pbs": w() }],
			"scroll-pbe": [{ "scroll-pbe": w() }],
			"scroll-pt": [{ "scroll-pt": w() }],
			"scroll-pr": [{ "scroll-pr": w() }],
			"scroll-pb": [{ "scroll-pb": w() }],
			"scroll-pl": [{ "scroll-pl": w() }],
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			"snap-stop": [{ snap: ["normal", "always"] }],
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			"touch-pz": ["touch-pinch-zoom"],
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				N,
				M
			] }],
			fill: [{ fill: ["none", ...D()] }],
			"stroke-w": [{ stroke: [
				j,
				pt,
				ot,
				st
			] }],
			stroke: [{ stroke: ["none", ...D()] }],
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			"container-named": ["container-type"],
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"inset-bs",
				"inset-be",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": [
				"start",
				"end",
				"right",
				"left"
			],
			"inset-y": [
				"inset-bs",
				"inset-be",
				"top",
				"bottom"
			],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pbs",
				"pbe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: [
				"ps",
				"pe",
				"pr",
				"pl"
			],
			py: [
				"pbs",
				"pbe",
				"pt",
				"pb"
			],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mbs",
				"mbe",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: [
				"ms",
				"me",
				"mr",
				"ml"
			],
			my: [
				"mbs",
				"mbe",
				"mt",
				"mb"
			],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": [
				"border-w-s",
				"border-w-e",
				"border-w-r",
				"border-w-l"
			],
			"border-w-y": [
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-b"
			],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": [
				"border-color-s",
				"border-color-e",
				"border-color-r",
				"border-color-l"
			],
			"border-color-y": [
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-b"
			],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": [
				"scroll-ms",
				"scroll-me",
				"scroll-mr",
				"scroll-ml"
			],
			"scroll-my": [
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mb"
			],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": [
				"scroll-ps",
				"scroll-pe",
				"scroll-pr",
				"scroll-pl"
			],
			"scroll-py": [
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pb"
			],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		postfixLookupClassGroups: ["container-type"],
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
}, jt = (e, { cacheSize: t, prefix: n, experimentalParseClassName: r, extend: i = {}, override: a = {} }) => (Mt(e, "cacheSize", t), Mt(e, "prefix", n), Mt(e, "experimentalParseClassName", r), Nt(e.theme, a.theme), Nt(e.classGroups, a.classGroups), Nt(e.conflictingClassGroups, a.conflictingClassGroups), Nt(e.conflictingClassGroupModifiers, a.conflictingClassGroupModifiers), Mt(e, "postfixLookupClassGroups", a.postfixLookupClassGroups), Mt(e, "orderSensitiveModifiers", a.orderSensitiveModifiers), Pt(e.theme, i.theme), Pt(e.classGroups, i.classGroups), Pt(e.conflictingClassGroups, i.conflictingClassGroups), Pt(e.conflictingClassGroupModifiers, i.conflictingClassGroupModifiers), Ft(e, i, "postfixLookupClassGroups"), Ft(e, i, "orderSensitiveModifiers"), e), Mt = (e, t, n) => {
	n !== void 0 && (e[t] = n);
}, Nt = (e, t) => {
	if (t) for (let n in t) Mt(e, n, t[n]);
}, Pt = (e, t) => {
	if (t) for (let n in t) Ft(e, t, n);
}, Ft = (e, t, n) => {
	let r = t[n];
	r !== void 0 && (e[n] = e[n] ? e[n].concat(r) : r);
}, It = (e, ...t) => typeof e == "function" ? Le(At, e, ...t) : Le(() => jt(At(), e), ...t), Lt = [
	"large-title",
	"display-1",
	"display-2",
	"display-3",
	"display-4",
	"title-1",
	"title-2",
	"title-3",
	"headline",
	"body",
	"body-2",
	"caption-1",
	"caption-2"
], Rt = [
	"regular",
	"medium",
	"semibold",
	"bold"
], P = It({ extend: { classGroups: { "font-size": [{ text: Lt.flatMap((e) => Rt.map((t) => `${e}-${t}`)) }] } } });
function zt(e) {
	return e;
}
// node_modules/react/cjs/react-jsx-runtime.production.js
var Bt = /* @__PURE__ */ o(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), F = (/* @__PURE__ */ o(((e, t) => {
	t.exports = Bt();
})))(), Vt = zt({
	base: "inline-flex items-center justify-center gap-0.5 whitespace-nowrap overflow-hidden font-sans select-none cursor-pointer button-press-motion outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus-ring disabled:cursor-not-allowed aria-disabled:cursor-not-allowed",
	size: {
		medium: "h-9 rounded-2lg p-2 text-body-medium",
		small: "h-8 rounded-lg px-2 py-1.5 text-body-medium",
		xs: "h-6 rounded-sm px-2 text-caption-1-semibold"
	},
	iconOnlySize: {
		medium: "",
		small: "size-8 p-0",
		xs: "size-6 p-0"
	},
	icon: {
		medium: "size-5 shrink-0",
		small: "size-[18px] shrink-0",
		xs: "size-3.5 shrink-0"
	},
	label: {
		medium: "inline-flex items-center justify-center px-1 shrink-0",
		small: "inline-flex items-center justify-center px-0.5 shrink-0",
		xs: "inline-flex items-center justify-center px-0.5 shrink-0"
	},
	variant: {
		primary: "bg-button-primary text-text-white shadow-xs disabled:text-button-primary-disabled-foreground disabled:shadow-none aria-disabled:text-button-primary-disabled-foreground aria-disabled:shadow-none",
		danger: "bg-button-danger text-text-white shadow-xs disabled:text-foreground-disabled-danger disabled:shadow-none aria-disabled:text-foreground-disabled-danger aria-disabled:shadow-none",
		secondary: "bg-background-primary-default text-text-primary border border-border-button-default shadow-xs hover:bg-background-primary-hover  hover:border-border-button-hover active:bg-background-primary-active active:border-border-button-active disabled:bg-background-primary-disabled disabled:border-border-button-default disabled:text-text-tertiary disabled:shadow-none aria-disabled:bg-background-primary-disabled aria-disabled:border-border-button-default aria-disabled:text-text-tertiary aria-disabled:shadow-none",
		ghost: "bg-button-ghost-background text-button-ghost-foreground hover:bg-button-ghost-hover active:bg-button-ghost-active disabled:bg-button-ghost-disabled disabled:text-button-ghost-disabled-foreground disabled:shadow-none aria-disabled:bg-button-ghost-disabled aria-disabled:text-button-ghost-disabled-foreground aria-disabled:shadow-none"
	}
});
function Ht({ variant: e = "primary", size: t = "medium", iconOnly: n = !1, leadingIcon: r, trailingIcon: i, children: a, className: o, type: s = "button", ref: c, ...l }) {
	return /* @__PURE__ */ (0, F.jsxs)("button", {
		ref: c,
		type: s,
		className: P(Vt.base, Vt.size[t], Vt.variant[e], n && Vt.iconOnlySize[t], o),
		...l,
		children: [
			r ? /* @__PURE__ */ (0, F.jsx)(r, {
				className: Vt.icon[t],
				"aria-hidden": !0
			}) : null,
			!n && a != null && /* @__PURE__ */ (0, F.jsx)("span", {
				className: Vt.label[t],
				children: a
			}),
			!n && i ? /* @__PURE__ */ (0, F.jsx)(i, {
				className: Vt.icon[t],
				"aria-hidden": !0
			}) : null
		]
	});
}
function Ut({ variant: e = "primary", size: t = "medium", iconOnly: n = !1, leadingIcon: r, trailingIcon: i, children: a, className: o, ref: s, ...c }) {
	return /* @__PURE__ */ (0, F.jsxs)("a", {
		ref: s,
		className: P(Vt.base, Vt.size[t], Vt.variant[e], n && Vt.iconOnlySize[t], o),
		...c,
		children: [
			r ? /* @__PURE__ */ (0, F.jsx)(r, {
				className: Vt.icon[t],
				"aria-hidden": !0
			}) : null,
			!n && a != null && /* @__PURE__ */ (0, F.jsx)("span", {
				className: Vt.label[t],
				children: a
			}),
			!n && i ? /* @__PURE__ */ (0, F.jsx)(i, {
				className: Vt.icon[t],
				"aria-hidden": !0
			}) : null
		]
	});
}
// src/react/pages/auth-card.tsx
function Wt({ title: e, lede: t, busy: n = !1, children: r }) {
	return /* @__PURE__ */ (0, F.jsx)("main", {
		className: "flex justify-center px-6 py-12 max-sm:px-4 max-sm:py-6",
		children: /* @__PURE__ */ (0, F.jsxs)("section", {
			"aria-labelledby": "auth-card-title",
			"aria-busy": n || void 0,
			className: "flex w-full max-w-140 flex-col gap-6 rounded-3xl border border-separator-border bg-background-secondary-default p-8 max-sm:p-5",
			children: [/* @__PURE__ */ (0, F.jsxs)("header", {
				className: "flex flex-col gap-1",
				children: [
					/* @__PURE__ */ (0, F.jsx)("img", {
						src: "/peach-logo-128.png",
						srcSet: "/peach-logo-64.png 64w, /peach-logo-128.png 128w",
						sizes: "40px",
						alt: "",
						width: 40,
						height: 40,
						decoding: "async",
						className: "mb-4 size-10"
					}),
					/* @__PURE__ */ (0, F.jsx)("h1", {
						id: "auth-card-title",
						className: "text-title-2-medium text-text-primary",
						children: e
					}),
					t ? /* @__PURE__ */ (0, F.jsx)("p", {
						className: "whitespace-pre-line text-body-2-regular text-text-secondary wrap-anywhere",
						children: t
					}) : null
				]
			}), r]
		})
	});
}
function Gt({ first: e = !1, labelledBy: t, children: n }) {
	return /* @__PURE__ */ (0, F.jsx)("section", {
		"aria-labelledby": t,
		className: e ? "flex flex-col gap-4" : "flex flex-col gap-4 border-t border-separator-border pt-6",
		children: n
	});
}
function Kt({ id: e, children: t }) {
	return /* @__PURE__ */ (0, F.jsx)("h2", {
		id: e,
		className: "text-body-semibold text-text-primary",
		children: t
	});
}
// src/react/pages/error/error-page.tsx
var qt = {
	403: "这里不能打开",
	404: "四〇四",
	409: "现在不能这样做"
};
function Jt(e) {
	return qt[e ?? ""] ?? "出了点问题";
}
function I({ data: e }) {
	let t = Jt(e.status);
	return (0, E.useEffect)(() => {
		document.title = `Peach · ${t}`;
	}, [t]), /* @__PURE__ */ (0, F.jsx)(Wt, {
		title: t,
		lede: e.status === "404" ? void 0 : e.detail,
		children: /* @__PURE__ */ (0, F.jsx)(Ut, {
			href: "/",
			className: "self-start",
			children: "返回首页"
		})
	});
}
// node_modules/react-aria/dist/private/utils/chain.mjs
function Yt(...e) {
	return (...t) => {
		for (let n of e) typeof n == "function" && n(...t);
	};
}
// node_modules/react-aria/dist/private/utils/useLayoutEffect.mjs
var Xt = typeof document < "u" ? E.useLayoutEffect : () => {}, Zt = {
	prefix: String(Math.round(Math.random() * 1e10)),
	current: 0
}, Qt = /*#__PURE__*/ E.createContext(Zt), $t = /*#__PURE__*/ E.createContext(!1);
typeof window < "u" && window.document && window.document.createElement;
var en = /* @__PURE__ */ new WeakMap();
function tn(e = !1) {
	let t = (0, E.useContext)(Qt), n = (0, E.useRef)(null);
	if (n.current === null && !e) {
		let e = E.default.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current;
		if (e) {
			let n = en.get(e);
			n == null ? en.set(e, {
				id: t.current,
				state: e.memoizedState
			}) : e.memoizedState !== n.state && (t.current = n.id, en.delete(e));
		}
		n.current = ++t.current;
	}
	return n.current;
}
function nn(e) {
	let t = (0, E.useContext)(Qt), n = tn(!!e), r = `react-aria${t.prefix}`;
	return e || `${r}-${n}`;
}
function rn(e) {
	let t = E.useId(), [n] = (0, E.useState)(ln()), r = n ? "react-aria" : `react-aria${Zt.prefix}`;
	return e || `${r}-${t}`;
}
var an = typeof E.useId == "function" ? rn : nn;
function on() {
	return !1;
}
function sn() {
	return !0;
}
function cn(e) {
	return () => {};
}
function ln() {
	return typeof E.useSyncExternalStore == "function" ? E.useSyncExternalStore(cn, on, sn) : (0, E.useContext)($t);
}
// node_modules/react-aria/dist/private/utils/useValueEffect.mjs
function un(e) {
	let [t, n] = (0, E.useState)(e), r = (0, E.useRef)(t), i = (0, E.useRef)(null), a = (0, E.useRef)(() => {
		if (!i.current) return;
		let e = i.current.next();
		e.done ? i.current = null : r.current === e.value ? a.current() : n(e.value);
	});
	return Xt(() => {
		r.current = t, i.current && a.current();
	}), [t, (0, E.useCallback)((e) => {
		i.current = e(r.current), a.current();
	}, [a])];
}
// node_modules/react-aria/dist/private/utils/useId.mjs
var dn = !!(typeof window < "u" && window.document && window.document.createElement), fn = /* @__PURE__ */ new Map(), pn;
typeof FinalizationRegistry < "u" && (pn = new FinalizationRegistry((e) => {
	fn.delete(e);
}));
var mn = /* @__PURE__ */ new WeakMap();
function hn(e) {
	let [t, n] = (0, E.useState)(e), r = (0, E.useRef)(null), i = an(t), a = (0, E.useRef)(null), o = mn.get(a);
	if (pn && o !== i && (o != null && pn.unregister(a), pn.register(a, i, a), mn.set(a, i)), dn) {
		let e = fn.get(i);
		e && !e.includes(r) ? e.push(r) : fn.set(i, [r]);
	}
	return Xt(() => {
		let e = i;
		return () => {
			pn && (pn.unregister(a), mn.delete(a)), fn.delete(e);
		};
	}, [i]), (0, E.useEffect)(() => {
		let e = r.current;
		return e && n(e), () => {
			e && (r.current = null);
		};
	}), i;
}
function gn(e, t) {
	if (e === t) return e;
	let n = fn.get(e);
	if (n) return n.forEach((e) => e.current = t), t;
	let r = fn.get(t);
	return r ? (r.forEach((t) => t.current = e), e) : t;
}
function _n(e = []) {
	let t = hn(), [n, r] = un(t), i = (0, E.useCallback)(() => {
		r(function* () {
			yield t, yield document.getElementById(t) ? t : void 0;
		});
	}, [t, r]);
	return Xt(i, [
		t,
		i,
		...e
	]), n;
}
// node_modules/react-aria/dist/private/utils/mergeRefs.mjs
function vn(...e) {
	return e.length === 1 && e[0] ? e[0] : (t) => {
		let n = !1, r = e.map((e) => {
			let r = yn(e, t);
			return n ||= typeof r == "function", r;
		});
		if (n) return () => {
			r.forEach((t, n) => {
				typeof t == "function" ? t() : yn(e[n], null);
			});
		};
	};
}
function yn(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
// node_modules/clsx/dist/clsx.mjs
function bn(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = bn(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function xn() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = bn(e)) && (r && (r += " "), r += t);
	return r;
}
// node_modules/react-aria/dist/private/utils/mergeProps.mjs
function L(...e) {
	let t = { ...e[0] };
	for (let n = 1; n < e.length; n++) {
		let r = e[n];
		for (let e in r) {
			let n = t[e], i = r[e];
			typeof n == "function" && typeof i == "function" && e[0] === "o" && e[1] === "n" && e.charCodeAt(2) >= 65 && e.charCodeAt(2) <= 90 ? t[e] = Yt(n, i) : (e === "className" || e === "UNSAFE_className") && typeof n == "string" && typeof i == "string" ? t[e] = xn(n, i) : e === "id" && n && i ? t.id = gn(n, i) : e === "ref" && n && i ? t.ref = vn(n, i) : t[e] = i === void 0 ? n : i;
		}
	}
	return t;
}
// node_modules/react-aria/dist/private/utils/useObjectRef.mjs
function Sn(e) {
	let t = (0, E.useRef)(null), n = (0, E.useRef)(void 0), r = (0, E.useCallback)((t) => {
		if (typeof e == "function") {
			let n = e, r = n(t);
			return () => {
				typeof r == "function" ? r() : n(null);
			};
		}
		if (e) return e.current = t, () => {
			e.current = null;
		};
	}, [e]);
	return (0, E.useMemo)(() => ({
		get current() {
			return t.current;
		},
		set current(e) {
			t.current = e, n.current &&= (n.current(), void 0), e != null && (n.current = r(e));
		}
	}), [r]);
}
// node_modules/react-aria-components/dist/private/utils.mjs
var Cn = Symbol("default");
function wn({ values: e, children: t }) {
	for (let [n, r] of e) t = /*#__PURE__*/ E.createElement(n.Provider, { value: r }, t);
	return t;
}
function Tn(e) {
	let { className: t, style: n, children: r, defaultClassName: i, defaultChildren: a, defaultStyle: o, values: s, render: c } = e;
	return (0, E.useMemo)(() => {
		let e, l, u;
		return e = typeof t == "function" ? t({
			...s,
			defaultClassName: i
		}) : t, l = typeof n == "function" ? n({
			...s,
			defaultStyle: o || {}
		}) : n, u = typeof r == "function" ? r({
			...s,
			defaultChildren: a
		}) : r ?? a, {
			className: e ?? i,
			style: l || o ? {
				...o,
				...l
			} : void 0,
			children: u ?? a,
			"data-rac": "",
			render: c ? (e) => c(e, s) : void 0
		};
	}, [
		t,
		n,
		r,
		i,
		a,
		o,
		s,
		c
	]);
}
function En(e, t) {
	let n = (0, E.useContext)(e);
	if (t === null) return null;
	if (n && typeof n == "object" && "slots" in n && n.slots) {
		let e = t || Cn;
		if (!n.slots[e]) {
			let e = new Intl.ListFormat().format(Object.keys(n.slots).map((e) => `"${e}"`)), r = t ? `Invalid slot "${t}".` : "A slot prop is required.";
			throw Error(`${r} Valid slot names are ${e}.`);
		}
		return n.slots[e];
	}
	return n;
}
function Dn(e, t, n) {
	let { ref: r, ...i } = En(n, e.slot) || {}, a = Sn((0, E.useMemo)(() => vn(t, r), [t, r])), o = L(i, e);
	return "style" in i && i.style && "style" in e && e.style && (o.style = typeof i.style == "function" || typeof e.style == "function" ? (t) => {
		let n = typeof i.style == "function" ? i.style(t) : i.style, r = {
			...t.defaultStyle,
			...n
		}, a = typeof e.style == "function" ? e.style({
			...t,
			defaultStyle: r
		}) : e.style;
		return {
			...r,
			...a
		};
	} : {
		...i.style,
		...e.style
	}), [o, a];
}
function On(e = !0) {
	let [t, n] = (0, E.useState)(e), r = (0, E.useRef)(!1), i = (0, E.useCallback)((e) => {
		r.current = !0, n(!!e);
	}, []);
	return Xt(() => {
		r.current || n(!1);
	}, []), [i, t];
}
function kn(e) {
	let t = /^(data-.*)$/, n = {};
	for (let r in e) t.test(r) || (n[r] = e[r]);
	return n;
}
function An(e, t, n) {
	let { render: r, ...i } = t, a = (0, E.useRef)(null), o = (0, E.useMemo)(() => vn(n, a), [n, a]);
	Xt(() => {}, [e, r]);
	let s = {
		...i,
		ref: o
	};
	return r ? r(s, void 0) : /*#__PURE__*/ E.createElement(e, s);
}
var jn = {}, Mn = new Proxy({}, { get(e, t) {
	if (typeof t != "string") return;
	let n = jn[t];
	return n || (n = /*#__PURE__*/ (0, E.forwardRef)(An.bind(null, t)), jn[t] = n), n;
} }), Nn = (e) => In(e) ? e.document : Ln(e) ? e : e?.ownerDocument ?? (typeof document < "u" ? document : void 0), Pn = (e) => Nn(e)?.defaultView ?? (typeof window < "u" ? window : void 0);
function Fn(e) {
	return typeof e == "object" && !!e && "nodeType" in e && typeof e.nodeType == "number";
}
function In(e) {
	return typeof e == "object" && !!e && "window" in e && e.window === e;
}
function Ln(e) {
	return Fn(e) && e.nodeType === 9;
}
function Rn(e) {
	return Fn(e) && e.nodeType === 11 && "host" in e;
}
function zn(e, t, n, r) {
	if (n == null || e == null) return () => {};
	let i = Array.isArray(e) ? e : [e];
	for (let e of i) e.addEventListener(t, n, r);
	return () => {
		for (let e of i) e.removeEventListener(t, n, r);
	};
}
// node_modules/react-stately/dist/private/flags/flags.mjs
var Bn = !1;
function Vn() {
	return Bn;
}
// node_modules/react-aria/dist/private/utils/shadowdom/DOMFunctions.mjs
function R(e, t) {
	if (!Vn()) return t && e ? e.contains(t) : !1;
	if (!e || !t) return !1;
	let n = t;
	for (; n != null;) {
		if (n === e) return !0;
		n = typeof n.assignedElements != "function" && n.assignedSlot?.parentNode ? n.assignedSlot.parentNode : Rn(n) ? n.host : n.parentNode;
	}
	return !1;
}
var Hn = (e = document) => {
	if (!Vn()) return e.activeElement;
	let t = e.activeElement;
	for (; t && "shadowRoot" in t && t.shadowRoot?.activeElement;) t = t.shadowRoot.activeElement;
	return t;
};
function z(e) {
	if (Vn() && e.target instanceof Element && e.target.shadowRoot) {
		if ("composedPath" in e) return e.composedPath()[0] ?? null;
		if ("composedPath" in e.nativeEvent) return e.nativeEvent.composedPath()[0] ?? null;
	}
	return e.target;
}
// node_modules/react-aria/dist/private/utils/focusWithoutScrolling.mjs
function Un(e) {
	e.focus({ preventScroll: !0 });
}
// node_modules/react-aria/dist/private/utils/isElementVisible.mjs
var Wn = typeof Element < "u" && "checkVisibility" in Element.prototype;
function Gn(e) {
	let t = Pn(e);
	if (!(e instanceof t.HTMLElement) && !(e instanceof t.SVGElement)) return !1;
	let { display: n, visibility: r } = e.style, i = n !== "none" && r !== "hidden" && r !== "collapse";
	if (i) {
		let { getComputedStyle: t } = Pn(e), { display: n, visibility: r } = t(e);
		i = n !== "none" && r !== "hidden" && r !== "collapse";
	}
	return i;
}
function Kn(e, t) {
	return !e.hasAttribute("hidden") && !e.hasAttribute("data-react-aria-prevent-focus") && (e.nodeName === "DETAILS" && t && t.nodeName !== "SUMMARY" ? e.hasAttribute("open") : !0);
}
function qn(e, t) {
	return Wn ? e.checkVisibility({ visibilityProperty: !0 }) && !e.closest("[data-react-aria-prevent-focus]") : e.nodeName !== "#comment" && Gn(e) && Kn(e, t) && (!e.parentElement || qn(e.parentElement, e));
}
// node_modules/react-aria/dist/private/utils/isFocusable.mjs
var Jn = [
	"input:not([disabled]):not([type=hidden])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"button:not([disabled])",
	"a[href]",
	"area[href]",
	"summary",
	"iframe",
	"object",
	"embed",
	"audio[controls]",
	"video[controls]",
	"[contenteditable]:not([contenteditable^=\"false\"])",
	"permission"
], Yn = Jn.join(":not([hidden]),") + ",[tabindex]:not([disabled]):not([hidden])";
Jn.push("[tabindex]:not([tabindex=\"-1\"]):not([disabled])");
var Xn = Jn.join(":not([hidden]):not([tabindex=\"-1\"]),");
function Zn(e, t) {
	return e.matches(Yn) && !$n(e) && (t?.skipVisibilityCheck || qn(e));
}
function Qn(e) {
	return e.matches(Xn) && qn(e) && !$n(e);
}
function $n(e) {
	let t = e;
	for (; t != null;) {
		if (t instanceof Pn(t).HTMLElement && t.inert) return !0;
		t = t.parentElement;
	}
	return !1;
}
// node_modules/react-aria/dist/private/interactions/utils.mjs
function er(e) {
	let t = e;
	return t.nativeEvent = e, t.isDefaultPrevented = () => t.defaultPrevented, t.isPropagationStopped = () => t.cancelBubble, t.persist = () => {}, t;
}
function tr(e, t) {
	Object.defineProperty(e, "target", { value: t }), Object.defineProperty(e, "currentTarget", { value: t });
}
function nr(e) {
	let t = (0, E.useRef)({
		isFocused: !1,
		observer: null
	});
	return Xt(() => {
		let e = t.current;
		return () => {
			e.observer &&= (e.observer.disconnect(), null);
		};
	}, []), (0, E.useCallback)((n) => {
		let r = z(n);
		if (r instanceof HTMLButtonElement || r instanceof HTMLInputElement || r instanceof HTMLTextAreaElement || r instanceof HTMLSelectElement) {
			t.current.isFocused = !0;
			let n = r;
			n.addEventListener("focusout", (r) => {
				if (t.current.isFocused = !1, n.disabled) {
					let t = er(r);
					e?.(t);
				}
				t.current.observer && (t.current.observer.disconnect(), t.current.observer = null);
			}, { once: !0 }), t.current.observer = new MutationObserver(() => {
				if (t.current.isFocused && n.disabled) {
					t.current.observer?.disconnect();
					let e = n === Hn() ? null : Hn();
					n.dispatchEvent(new FocusEvent("blur", { relatedTarget: e })), n.dispatchEvent(new FocusEvent("focusout", {
						bubbles: !0,
						relatedTarget: e
					}));
				}
			}), t.current.observer.observe(n, {
				attributes: !0,
				attributeFilter: ["disabled"]
			});
		}
	}, [e]);
}
var rr = !1;
function ir(e) {
	for (; e && !Zn(e, { skipVisibilityCheck: !0 });) e = e.parentElement;
	let t = Hn(Pn(e).document);
	if (!t || t === e) return;
	let n = e?.getRootNode(), r = n != null && Rn(n) ? n : Pn(e), i = (t) => t === e || Fn(t) && R(e, t), a = (e) => e === t || t != null && Fn(e) && R(t, e);
	rr = !0;
	let o = !1, s = (e) => {
		(a(z(e)) || o) && e.stopImmediatePropagation();
	}, c = (n) => {
		(a(z(n)) || o) && (n.stopImmediatePropagation(), !e && !o && (o = !0, Un(t), d()));
	}, l = (e) => {
		(i(z(e)) || o) && e.stopImmediatePropagation();
	}, u = (e) => {
		(i(z(e)) || o) && (e.stopImmediatePropagation(), o || (o = !0, Un(t), d()));
	};
	r.addEventListener("blur", s, !0), r.addEventListener("focusout", c, !0), r.addEventListener("focusin", u, !0), r.addEventListener("focus", l, !0);
	let d = () => {
		cancelAnimationFrame(f), r.removeEventListener("blur", s, !0), r.removeEventListener("focusout", c, !0), r.removeEventListener("focusin", u, !0), r.removeEventListener("focus", l, !0), rr = !1, o = !1;
	}, f = requestAnimationFrame(d);
	return d;
}
// node_modules/react-aria/dist/private/utils/platform.mjs
function ar(e) {
	if (typeof window > "u" || window.navigator == null) return !1;
	let t = window.navigator.userAgentData?.brands;
	return Array.isArray(t) && t.some((t) => e.test(t.brand)) || e.test(window.navigator.userAgent);
}
function or(e) {
	return typeof window < "u" && window.navigator != null && e.test(window.navigator.userAgentData?.platform || window.navigator.platform);
}
function sr(e) {
	let t = null;
	return () => (t ??= e(), t);
}
var cr = sr(function() {
	return or(/^Mac/i);
}), lr = sr(function() {
	return or(/^iPhone/i);
}), ur = sr(function() {
	return or(/^iPad/i) || cr() && navigator.maxTouchPoints > 1;
}), dr = sr(function() {
	return lr() || ur();
}), fr = sr(function() {
	return ar(/AppleWebKit/i) && (dr() || !pr());
}), pr = sr(function() {
	return ar(/Chrome|CriOS|CrMo/i);
}), mr = sr(function() {
	return ar(/Android/i);
});
// node_modules/react-aria/dist/private/utils/isVirtualEvent.mjs
function hr(e) {
	return e.pointerType === "" && e.isTrusted ? !0 : mr() && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
function gr(e) {
	return !mr() && e.width === 0 && e.height === 0 || mr() && e.width === 1 && e.height === 1 && e.pressure === 0 && e.detail === 0 && e.pointerType === "mouse";
}
// node_modules/react-aria/dist/private/utils/openLink.mjs
function _r(e, t, n = !0) {
	let { metaKey: r, ctrlKey: i, altKey: a, shiftKey: o } = t, s = fr() && cr() && !ur() ? new KeyboardEvent("keydown", {
		keyIdentifier: "Enter",
		metaKey: r,
		ctrlKey: i,
		altKey: a,
		shiftKey: o
	}) : new MouseEvent("click", {
		metaKey: r,
		ctrlKey: i,
		altKey: a,
		shiftKey: o,
		detail: 1,
		bubbles: !0,
		cancelable: !0
	});
	_r.isOpening = n, Un(e), e.dispatchEvent(s), _r.isOpening = !1;
}
_r.isOpening = !1;
// node_modules/react-aria/dist/private/interactions/useFocusVisible.mjs
var vr = null, yr = /* @__PURE__ */ new Set(), br = /* @__PURE__ */ new Map(), xr = !1, Sr = !1, Cr = {
	Tab: !0,
	Escape: !0
};
function wr(e, t) {
	for (let n of yr) n(e, t);
}
function Tr(e) {
	return !(e.metaKey || !cr() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
function Er(e) {
	xr = !0, !_r.isOpening && Tr(e) && (vr = "keyboard", wr("keyboard", e));
}
function Dr(e) {
	vr = "pointer", "pointerType" in e && e.pointerType, (e.type === "mousedown" || e.type === "pointerdown") && (xr = !0, wr("pointer", e));
}
function Or(e) {
	!_r.isOpening && hr(e) && (xr = !0, vr = "virtual");
}
function kr(e) {
	if (rr) return;
	let t = z(e), n = Pn(t), r = Nn(t);
	t === n ? Sr = !0 : t !== r && e.isTrusted && (!xr && !Sr && (vr = "virtual", wr("virtual", e)), xr = !1, Sr = !1);
}
function Ar() {
	rr || (xr = !1, Sr = !0);
}
function jr(e) {
	let t = Hn(Nn(z(e)));
	queueMicrotask(() => {
		Hn(Nn(z(e))) !== t && Lr("keyboard");
	});
}
function Mr(e) {
	if (typeof window > "u" || typeof document > "u") return;
	let t = Pn(e), n = Nn(e);
	if (br.get(t)) return;
	let r = t.HTMLElement.prototype.focus;
	Reflect.defineProperty(t.HTMLElement.prototype, "focus", {
		configurable: !0,
		writable: !0,
		value: function() {
			xr = !0, r.apply(this, arguments);
		}
	}), n.addEventListener("keydown", Er, !0), n.addEventListener("keyup", Er, !0), n.addEventListener("click", Or, !0), n.addEventListener("invalid", jr, !0), t.addEventListener("focus", kr, !0), t.addEventListener("blur", Ar, !1), typeof PointerEvent < "u" && (n.addEventListener("pointerdown", Dr, !0), n.addEventListener("pointermove", Dr, !0), n.addEventListener("pointerup", Dr, !0)), t.addEventListener("beforeunload", () => {
		Nr(e);
	}, { once: !0 }), br.set(t, { focus: r });
}
var Nr = (e, t) => {
	let n = Pn(e), r = Nn(e);
	t && r.removeEventListener("DOMContentLoaded", t), br.has(n) && (Reflect.defineProperty(n.HTMLElement.prototype, "focus", {
		configurable: !0,
		writable: !0,
		value: br.get(n).focus
	}), r.removeEventListener("keydown", Er, !0), r.removeEventListener("keyup", Er, !0), r.removeEventListener("click", Or, !0), r.removeEventListener("invalid", jr, !0), n.removeEventListener("focus", kr, !0), n.removeEventListener("blur", Ar, !1), typeof PointerEvent < "u" && (r.removeEventListener("pointerdown", Dr, !0), r.removeEventListener("pointermove", Dr, !0), r.removeEventListener("pointerup", Dr, !0)), br.delete(n));
};
function Pr(e) {
	let t = Nn(e), n;
	return t.readyState === "loading" ? (n = () => {
		Mr(e);
	}, t.addEventListener("DOMContentLoaded", n)) : Mr(e), () => Nr(e, n);
}
typeof document < "u" && Pr();
function Fr() {
	return vr !== "pointer";
}
function Ir() {
	return vr;
}
function Lr(e) {
	vr = e, wr(e, null);
}
var Rr = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset"
]);
function zr(e, t, n) {
	let r = n ? z(n) : void 0, i = Nn(r), a = Pn(r), o = a === void 0 ? HTMLInputElement : a.HTMLInputElement, s = a === void 0 ? HTMLTextAreaElement : a.HTMLTextAreaElement, c = a === void 0 ? HTMLElement : a.HTMLElement, l = a === void 0 ? KeyboardEvent : a.KeyboardEvent, u = Hn(i);
	return e = e || u instanceof o && !Rr.has(u.type) || u instanceof s || u instanceof c && u.isContentEditable, !(e && t === "keyboard" && n instanceof l && !Cr[n.key]);
}
function Br(e, t, n) {
	Mr(), (0, E.useEffect)(() => {
		if (n?.enabled === !1) return;
		let t = (t, r) => {
			zr(!!n?.isTextInput, t, r) && e(Fr());
		};
		return yr.add(t), () => {
			yr.delete(t);
		};
	}, t);
}
// node_modules/react-aria/dist/private/utils/getMetaValue.mjs
function Vr(e, t) {
	let n = Pn(t), r = Nn(t);
	if (r == null || n == null) return;
	let i, a = `meta[name="${CSS.escape(e)}"], meta[property="${CSS.escape(e)}"]`, o = r.querySelector(a);
	return o && o instanceof n.HTMLMetaElement && (e === "csp-nonce" && o.nonce && (i ??= o.nonce || void 0), o.content && (i ??= o.content || void 0)), e === "csp-nonce" && (i ??= n.__webpack_nonce__ || globalThis.__webpack_nonce__ || void 0), i;
}
// node_modules/react-aria/dist/private/utils/useEffectEvent.mjs
var Hr = E.useInsertionEffect ?? Xt;
function Ur(e) {
	let t = (0, E.useRef)(null);
	return Hr(() => {
		t.current = e;
	}, [e]), (0, E.useCallback)((...e) => {
		let n = t.current;
		return n?.(...e);
	}, []);
}
// node_modules/react-aria/dist/private/utils/useLabels.mjs
function Wr(e, t) {
	let { id: n, "aria-label": r, "aria-labelledby": i } = e;
	return n = hn(n), i && r ? i = [.../* @__PURE__ */ new Set([n, ...i.trim().split(/\s+/)])].join(" ") : i &&= i.trim().split(/\s+/).join(" "), !r && !i && t && (r = t), {
		id: n,
		"aria-label": r,
		"aria-labelledby": i
	};
}
// node_modules/react-aria/dist/private/i18n/utils.mjs
var Gr = /* @__PURE__ */ new Set([
	"Arab",
	"Syrc",
	"Samr",
	"Mand",
	"Thaa",
	"Mend",
	"Nkoo",
	"Adlm",
	"Rohg",
	"Hebr"
]), Kr = /* @__PURE__ */ new Set([
	"ae",
	"ar",
	"arc",
	"bcc",
	"bqi",
	"ckb",
	"dv",
	"fa",
	"glk",
	"he",
	"ku",
	"mzn",
	"nqo",
	"pnb",
	"ps",
	"sd",
	"ug",
	"ur",
	"yi"
]);
function qr(e) {
	if (Intl.Locale) {
		let t = new Intl.Locale(e).maximize(), n = typeof t.getTextInfo == "function" ? t.getTextInfo() : t.textInfo;
		if (n) return n.direction === "rtl";
		if (t.script) return Gr.has(t.script);
	}
	let t = e.split("-")[0];
	return Kr.has(t);
}
// node_modules/react-aria/dist/private/i18n/useDefaultLocale.mjs
var Jr = Symbol.for("react-aria.i18n.locale");
function Yr() {
	let e = typeof window < "u" && window[Jr] || typeof navigator < "u" && (navigator.language || navigator.userLanguage) || "en-US";
	try {
		Intl.DateTimeFormat.supportedLocalesOf([e]);
	} catch {
		e = "en-US";
	}
	return {
		locale: e,
		direction: qr(e) ? "rtl" : "ltr"
	};
}
var Xr = Yr(), Zr = /* @__PURE__ */ new Set();
function Qr() {
	Xr = Yr();
	for (let e of Zr) e(Xr);
}
function $r() {
	let e = ln(), [t, n] = (0, E.useState)(Xr);
	return (0, E.useEffect)(() => (Zr.size === 0 && window.addEventListener("languagechange", Qr), Zr.add(n), () => {
		Zr.delete(n), Zr.size === 0 && window.removeEventListener("languagechange", Qr);
	}), []), e ? {
		locale: typeof window < "u" && window[Jr] || "en-US",
		direction: "ltr"
	} : t;
}
// node_modules/react-aria/dist/private/i18n/I18nProvider.mjs
var ei = /*#__PURE__*/ E.createContext(null);
function ti() {
	let e = $r();
	return (0, E.useContext)(ei) || e;
}
// node_modules/react-stately/dist/private/utils/useControlledState.mjs
var ni = E.useInsertionEffect ?? E.useLayoutEffect;
function ri(e, t, n) {
	let [r, i] = (0, E.useState)(e || t), a = (0, E.useRef)(r), o = (0, E.useRef)(e !== void 0), s = e !== void 0;
	(0, E.useEffect)(() => {
		o.current, o.current = s;
	}, [s]);
	let c = s ? e : r;
	ni(() => {
		a.current = c;
	});
	let [, l] = (0, E.useReducer)(() => ({}), {});
	return [c, (0, E.useCallback)((e, ...t) => {
		let r = typeof e == "function" ? e(a.current) : e;
		Object.is(a.current, r) || (a.current = r, i(r), l(), n?.(r, ...t));
	}, [n])];
}
// node_modules/react-aria-components/dist/private/Autocomplete.mjs
var ii = /*#__PURE__*/ (0, E.createContext)(null), ai = /* @__PURE__ */ new Map(), oi = /* @__PURE__ */ new Set();
function si(e) {
	return "propertyName" in e;
}
function ci(e) {
	let t = z(e);
	if (!si(e) || !t) return;
	let n = ai.get(t);
	n || (n = /* @__PURE__ */ new Set(), ai.set(t, n), t.addEventListener("transitioncancel", li, { once: !0 })), n.add(e.propertyName);
}
function li(e) {
	let t = z(e);
	if (!si(e) || !t) return;
	let n = ai.get(t);
	if (n && (n.delete(e.propertyName), n.size === 0 && (t.removeEventListener("transitioncancel", li), ai.delete(t)), ai.size === 0)) for (let e of oi) e(!0), oi.delete(e);
}
function ui() {
	zn(document, "transitionrun", ci), zn(document, "transitionend", li);
}
function di() {
	for (let [e] of ai) "isConnected" in e && !e.isConnected && ai.delete(e);
}
typeof document < "u" && (document.readyState === "loading" ? zn(document, "DOMContentLoaded", ui) : ui());
function fi(e) {
	let t = window.requestAnimationFrame(() => {
		if (di(), ai.size === 0) return e(!1);
		oi.add(e);
	});
	return () => {
		window.cancelAnimationFrame(t), oi.delete(e);
	};
}
// node_modules/react-aria/dist/private/interactions/focusSafely.mjs
function pi(e) {
	if (!e.isConnected) return;
	let t = Nn(e);
	if (Ir() === "virtual") {
		let n = Hn(t);
		fi(() => {
			let r = Hn(t);
			(r === n || r === t.body) && e.isConnected && Un(e);
		});
	} else Un(e);
}
// node_modules/react-aria/dist/private/interactions/useFocus.mjs
function mi(e) {
	let { isDisabled: t, onFocus: n, onBlur: r, onFocusChange: i } = e, a = (0, E.useCallback)((e) => {
		if (z(e) === e.currentTarget) return r && r(e), i && i(!1), !0;
	}, [r, i]), o = nr(a), s = (0, E.useCallback)((e) => {
		let t = z(e), r = Nn(t), a = r ? Hn(r) : Hn();
		t === e.currentTarget && t === a && (n && n(e), i && i(!0), o(e));
	}, [
		i,
		n,
		o
	]);
	return { focusProps: {
		onFocus: !t && (n || i || r) ? s : void 0,
		onBlur: !t && (r || i) ? a : void 0
	} };
}
// node_modules/react-aria/dist/private/interactions/createEventHandler.mjs
function hi(e) {
	if (e) return (t) => {
		let n = !0;
		e({
			...t,
			preventDefault() {
				t.preventDefault();
			},
			isDefaultPrevented() {
				return t.isDefaultPrevented();
			},
			stopPropagation() {
				n = !0;
			},
			continuePropagation() {
				n = !1, typeof t.continuePropagation == "function" && t.continuePropagation();
			},
			isPropagationStopped() {
				return n;
			}
		}), n && !(typeof t.isPropagationStopped == "function" && t.isPropagationStopped()) && t.stopPropagation();
	};
}
// node_modules/react-aria/dist/private/interactions/createKeyboardShortcutHandler.mjs
var gi = /* @__PURE__ */ new Set([
	"shift",
	"alt",
	"control",
	"meta",
	"mod"
]), _i = [
	"Alt",
	"Control",
	"Meta",
	"Shift"
];
function vi(e) {
	let t = /* @__PURE__ */ new Set();
	return e.alt && t.add("Alt"), e.shift && t.add("Shift"), e.ctrl && t.add("Control"), e.meta && t.add("Meta"), e.mod && t.add(cr() ? "Meta" : "Control"), t;
}
function yi(e) {
	let t = /* @__PURE__ */ new Set();
	return e.altKey && t.add("Alt"), e.ctrlKey && t.add("Control"), e.metaKey && t.add("Meta"), e.shiftKey && t.add("Shift"), t;
}
function bi(e) {
	return _i.filter((t) => e.has(t));
}
function xi(e) {
	let t = e.split("+").reduce((e, t) => {
		let n = t.toLowerCase();
		return gi.has(n) ? n === "shift" ? e.shift = !0 : n === "alt" ? e.alt = !0 : n === "control" ? e.ctrl = !0 : n === "meta" ? e.meta = !0 : n === "mod" && (e.mod = !0) : e.key = t, e;
	}, {
		shift: !1,
		alt: !1,
		ctrl: !1,
		meta: !1,
		mod: !1,
		key: ""
	});
	if (t.key === "") throw Error(`Invalid keyboard shortcut: "${e}". Must include exactly one non-modifier key (e.g. "a", "Enter", "ArrowDown"). Combine any of Shift, Alt, Ctrl, Meta, and Mod.`);
	return t;
}
function Si(e) {
	return e.toLowerCase();
}
var Ci = {
	space: " ",
	esc: "escape",
	del: "delete",
	ins: "insert",
	left: "arrowleft",
	right: "arrowright",
	up: "arrowup",
	down: "arrowdown",
	pageup: "pageup",
	pagedown: "pagedown"
};
function wi(e) {
	let t = Si(e);
	return Ci[t] ?? t;
}
function Ti(e) {
	let t = bi(vi(e)), n = wi(e.key);
	return t.length > 0 ? `${t.join("+")}+${n}` : n;
}
function Ei(e) {
	let t = bi(yi(e)), n = Si(e.key);
	return (t.length > 0 ? `${t.join("+")}+` : "") + n;
}
function Di(e) {
	let t = /* @__PURE__ */ new Map();
	for (let [n, r] of Object.entries(e)) {
		let e = xi(n);
		t.set(Ti(e), r);
	}
	return (e) => {
		let n = Ei(e), r = t.get(n), i = r?.(e);
		i === void 0 && r !== void 0 ? i = {
			shouldContinuePropagation: !1,
			shouldPreventDefault: !0
		} : typeof i == "boolean" && (i = {
			shouldContinuePropagation: !i,
			shouldPreventDefault: i
		}), i?.shouldPreventDefault && e.preventDefault(), (!r || i?.shouldContinuePropagation) && e.continuePropagation();
	};
}
// node_modules/react-aria/dist/private/interactions/useKeyboard.mjs
function Oi(e) {
	let { shortcuts: t, allowRepeats: n = !1, allowComposing: r = !1 } = e, i, a;
	if (t) {
		let o = Di(t), s = hi((e) => {
			R(e.currentTarget, z(e)) ? e.nativeEvent?.repeat && !n || e.nativeEvent?.isComposing && !r ? e.continuePropagation() : o(e) : e.continuePropagation();
		}), c = hi((e) => {
			R(e.currentTarget, z(e)) && (e.nativeEvent?.repeat && !n || e.nativeEvent?.isComposing), e.continuePropagation();
		});
		i = e.onKeyDown ? Yt(e.onKeyDown, s) : s, a = e.onKeyUp ? Yt(e.onKeyUp, c) : c;
	} else i = hi(e.onKeyDown), a = hi(e.onKeyUp);
	return { keyboardProps: e.isDisabled ? {} : {
		onKeyDown: i,
		onKeyUp: a
	} };
}
// node_modules/react-aria/dist/private/utils/useSyncRef.mjs
function ki(e, t) {
	Xt(() => {
		if (e && e.ref && t) return e.ref.current = t.current, () => {
			e.ref && (e.ref.current = null);
		};
	});
}
// node_modules/react-aria/dist/private/interactions/useFocusable.mjs
var Ai = /*#__PURE__*/ E.createContext(null);
function ji(e) {
	let t = (0, E.useContext)(Ai) || {};
	ki(t, e);
	let { ref: n, ...r } = t;
	return r;
}
function Mi(e, t) {
	let { focusProps: n } = mi(e), { keyboardProps: r } = Oi(e), i = L(n, r), a = ji(t), o = e.isDisabled ? {} : a, s = (0, E.useRef)(e.autoFocus);
	(0, E.useEffect)(() => {
		s.current && t.current && pi(t.current), s.current = !1;
	}, [t]);
	let c = e.excludeFromTabOrder ? -1 : 0;
	return e.isDisabled && (c = void 0), { focusableProps: L({
		...i,
		tabIndex: c
	}, o) };
}
// node_modules/react-aria/dist/private/collections/Hidden.mjs
typeof HTMLTemplateElement < "u" && (Object.defineProperty(HTMLTemplateElement.prototype, "firstChild", {
	configurable: !0,
	enumerable: !0,
	get: function() {
		return this.content.firstChild;
	}
}), Object.defineProperty(HTMLTemplateElement.prototype, "appendChild", {
	configurable: !0,
	enumerable: !0,
	value: function(e) {
		return this.content.appendChild(e);
	}
}), Object.defineProperty(HTMLTemplateElement.prototype, "removeChild", {
	configurable: !0,
	enumerable: !0,
	value: function(e) {
		return this.content.removeChild(e);
	}
}), Object.defineProperty(HTMLTemplateElement.prototype, "insertBefore", {
	configurable: !0,
	enumerable: !0,
	value: function(e, t) {
		return this.content.insertBefore(e, t);
	}
}));
var Ni = /*#__PURE__*/ (0, E.createContext)(!1);
function Pi(e) {
	let t = (t, n) => (0, E.useContext)(Ni) ? null : e(t, n);
	return t.displayName = e.displayName || e.name, (0, E.forwardRef)(t);
}
// node_modules/react-aria/dist/private/utils/filterDOMProps.mjs
var Fi = /* @__PURE__ */ new Set(["id"]), Ii = /* @__PURE__ */ new Set([
	"aria-label",
	"aria-labelledby",
	"aria-describedby",
	"aria-details"
]), Li = /* @__PURE__ */ new Set([
	"href",
	"hrefLang",
	"target",
	"rel",
	"download",
	"ping",
	"referrerPolicy"
]), Ri = /* @__PURE__ */ new Set([
	"dir",
	"lang",
	"hidden",
	"inert",
	"translate",
	"suppressHydrationWarning"
]), zi = /* @__PURE__ */ new Set(/* @__PURE__ */ "onClick.onAuxClick.onContextMenu.onDoubleClick.onMouseDown.onMouseEnter.onMouseLeave.onMouseMove.onMouseOut.onMouseOver.onMouseUp.onTouchCancel.onTouchEnd.onTouchMove.onTouchStart.onPointerDown.onPointerMove.onPointerUp.onPointerCancel.onPointerEnter.onPointerLeave.onPointerOver.onPointerOut.onGotPointerCapture.onLostPointerCapture.onScroll.onWheel.onAnimationStart.onAnimationEnd.onAnimationIteration.onTransitionCancel.onTransitionEnd.onTransitionRun.onTransitionStart".split(".")), Bi = /^(data-.*)$/;
function Vi(e, t = {}) {
	let { labelable: n, isLink: r, global: i, events: a = i, propNames: o } = t, s = {};
	for (let t in e) Object.prototype.hasOwnProperty.call(e, t) && (Fi.has(t) || n && Ii.has(t) || r && Li.has(t) || i && Ri.has(t) || a && (zi.has(t) || t.endsWith("Capture") && zi.has(t.slice(0, -7))) || o?.has(t) || Bi.test(t)) && (s[t] = e[t]);
	return s;
}
// node_modules/react-aria/dist/private/interactions/textSelection.mjs
var Hi = "default", Ui = "", Wi = /* @__PURE__ */ new WeakMap();
function Gi(e) {
	if (dr() && fr()) {
		if (Hi === "default") {
			let t = Nn(e);
			Ui = t.documentElement.style.webkitUserSelect, t.documentElement.style.webkitUserSelect = "none";
		}
		Hi = "disabled";
	} else if (e instanceof HTMLElement || e instanceof SVGElement) {
		let t = "userSelect" in e.style ? "userSelect" : "webkitUserSelect";
		Wi.set(e, e.style[t]), e.style[t] = "none";
	}
}
function Ki(e) {
	if (dr() && fr()) {
		if (Hi !== "disabled") return;
		Hi = "restoring", setTimeout(() => {
			fi(() => {
				if (Hi === "restoring") {
					let t = Nn(e);
					t.documentElement.style.webkitUserSelect === "none" && (t.documentElement.style.webkitUserSelect = Ui || ""), Ui = "", Hi = "default";
				}
			});
		}, 300);
	} else if ((e instanceof HTMLElement || e instanceof SVGElement) && e && Wi.has(e)) {
		let t = Wi.get(e), n = "userSelect" in e.style ? "userSelect" : "webkitUserSelect";
		e.style[n] === "none" && (e.style[n] = t), e.getAttribute("style") === "" && e.removeAttribute("style"), Wi.delete(e);
	}
}
// node_modules/react-aria/dist/private/utils/getNonce.mjs
var qi = /* @__PURE__ */ new WeakMap();
function Ji(e) {
	let t = Nn(e), n = qi.get(t);
	return n ??= Vr("csp-nonce", t), n !== void 0 && qi.set(t, n), n;
}
// node_modules/react-aria/dist/private/interactions/context.mjs
var Yi = E.createContext({ register: () => {} });
Yi.displayName = "PressResponderContext";
// node_modules/react-aria/dist/private/utils/useGlobalListeners.mjs
function Xi() {
	let e = (0, E.useRef)(/* @__PURE__ */ new Map()), t = (0, E.useCallback)((t, n, r, i) => {
		let a = i?.once ? (...t) => {
			e.current.delete(r), r(...t);
		} : r;
		e.current.set(r, {
			type: n,
			eventTarget: t,
			fn: a,
			options: i
		}), t.addEventListener(n, a, i);
	}, []), n = (0, E.useCallback)((t, n, r, i) => {
		let a = e.current.get(r)?.fn || r;
		t.removeEventListener(n, a, i), e.current.delete(r);
	}, []), r = (0, E.useCallback)(() => {
		e.current.forEach((e, t) => {
			n(e.eventTarget, e.type, t, e.options);
		});
	}, [n]);
	return (0, E.useEffect)(() => r, [r]), {
		addGlobalListener: t,
		removeGlobalListener: n,
		removeAllGlobalListeners: r
	};
}
oe();
function Zi(e) {
	let t = (0, E.useContext)(Yi);
	if (t) {
		let { register: n, ref: r, ...i } = t;
		e = L(i, e), n();
	}
	return ki(t, e.ref), e;
}
var Qi = class {
	#e;
	constructor(e, t, n, r) {
		this.#e = !0;
		let i = (r?.target ?? n.currentTarget)?.getBoundingClientRect(), a, o = 0, s, c = null;
		n.clientX != null && n.clientY != null && (s = n.clientX, c = n.clientY), i && (s != null && c != null ? (a = s - i.left, o = c - i.top) : (a = i.width / 2, o = i.height / 2)), this.type = e, this.pointerType = t, this.target = n.currentTarget, this.shiftKey = n.shiftKey, this.metaKey = n.metaKey, this.ctrlKey = n.ctrlKey, this.altKey = n.altKey, this.x = a, this.y = o, this.key = n.key;
	}
	continuePropagation() {
		this.#e = !1;
	}
	get shouldStopPropagation() {
		return this.#e;
	}
}, $i = Symbol("linkClicked"), ea = "react-aria-pressable-style", ta = "data-react-aria-pressable";
function na(e) {
	let { onPress: t, onPressChange: n, onPressStart: r, onPressEnd: i, onPressUp: a, onClick: o, isDisabled: s, isPressed: c, preventFocusOnPress: l, shouldCancelOnPointerExit: u, allowTextSelectionOnPress: d, ref: f, ...p } = Zi(e), [m, h] = (0, E.useState)(!1), g = (0, E.useRef)({
		isPressed: !1,
		ignoreEmulatedMouseEvents: !1,
		didFirePressStart: !1,
		isTriggeringEvent: !1,
		activePointerId: null,
		target: null,
		isOverTarget: !1,
		pointerType: null,
		disposables: []
	}), { addGlobalListener: _, removeAllGlobalListeners: v } = Xi(), y = (0, E.useCallback)((e, t) => {
		let i = g.current;
		if (s || i.didFirePressStart) return !1;
		let a = !0;
		if (i.isTriggeringEvent = !0, r) {
			let n = new Qi("pressstart", t, e);
			r(n), a = n.shouldStopPropagation;
		}
		return n && n(!0), i.isTriggeringEvent = !1, i.didFirePressStart = !0, h(!0), a;
	}, [
		s,
		r,
		n
	]), b = (0, E.useCallback)((e, r, a = !0) => {
		let o = g.current;
		if (!o.didFirePressStart) return !1;
		o.didFirePressStart = !1, o.isTriggeringEvent = !0;
		let c = !0;
		if (i) {
			let t = new Qi("pressend", r, e);
			i(t), c = t.shouldStopPropagation;
		}
		if (n && n(!1), h(!1), t && a && !s) {
			let n = new Qi("press", r, e);
			t(n), c &&= n.shouldStopPropagation;
		}
		return o.isTriggeringEvent = !1, c;
	}, [
		s,
		i,
		n,
		t
	]), x = Ur(b), S = Ur((0, E.useCallback)((e, t) => {
		let n = g.current;
		if (s) return !1;
		if (a) {
			n.isTriggeringEvent = !0;
			let r = new Qi("pressup", t, e);
			return a(r), n.isTriggeringEvent = !1, r.shouldStopPropagation;
		}
		return !0;
	}, [s, a])), C = (0, E.useCallback)((e) => {
		let t = g.current;
		if (t.isPressed && t.target) {
			t.didFirePressStart && t.pointerType != null && b(V(t.target, e), t.pointerType, !1), t.isPressed = !1, t.isOverTarget = !1, t.activePointerId = null, t.pointerType = null, v(), d || Ki(t.target);
			for (let e of t.disposables) e();
			t.disposables = [];
		}
	}, [
		d,
		v,
		b
	]), w = Ur(C);
	(0, E.useEffect)(() => {
		s && g.current.isPressed && w({
			currentTarget: g.current.target,
			shiftKey: !1,
			ctrlKey: !1,
			metaKey: !1,
			altKey: !1
		});
	}, [s]);
	let T = (0, E.useCallback)((e) => {
		u && C(e);
	}, [u, C]), ee = (0, E.useCallback)((e) => {
		s || o?.(e);
	}, [s, o]), te = (0, E.useCallback)((e, t) => {
		if (!s && o) {
			let n = new MouseEvent("click", e);
			tr(n, t), o(er(n));
		}
	}, [s, o]), ne = (0, E.useMemo)(() => {
		let e = g.current, t = {
			onKeyDown(t) {
				if (B(t.nativeEvent, t.currentTarget) && R(t.currentTarget, z(t))) {
					aa(z(t), t.key) && t.preventDefault();
					let r = !0;
					!e.isPressed && !t.repeat && (e.target = t.currentTarget, e.isPressed = !0, e.pointerType = "keyboard", r = y(t, "keyboard"));
					let i = t.currentTarget;
					_(Nn(t.currentTarget), "keyup", Yt((t) => {
						B(t, i) && !t.repeat && R(i, z(t)) && e.target && S(V(e.target, t), "keyboard");
					}, n), !0), r && t.stopPropagation(), t.metaKey && cr() && e.metaKeyEvents?.set(t.key, t.nativeEvent);
				} else t.key === "Meta" && (e.metaKeyEvents = /* @__PURE__ */ new Map());
			},
			onClick(t) {
				if ((!t || R(t.currentTarget, z(t))) && t && t.button === 0 && !e.isTriggeringEvent && !_r.isOpening) {
					let n = !0;
					if (s && t.preventDefault(), !e.ignoreEmulatedMouseEvents && !e.isPressed && (e.pointerType === "virtual" || hr(t.nativeEvent))) {
						let e = y(t, "virtual"), r = S(t, "virtual"), i = x(t, "virtual");
						ee(t), n = e && r && i;
					} else if (e.isPressed && e.pointerType !== "keyboard") {
						let r = e.pointerType || t.nativeEvent.pointerType || "virtual", i = S(V(t.currentTarget, t), r), a = x(V(t.currentTarget, t), r, !0);
						n = i && a, e.isOverTarget = !1, ee(t), w(t);
					}
					e.ignoreEmulatedMouseEvents = !1, n && t.stopPropagation();
				}
			}
		}, n = (t) => {
			if (e.isPressed && e.target && B(t, e.target)) {
				aa(z(t), t.key) && t.preventDefault();
				let n = z(t), r = R(e.target, n);
				x(V(e.target, t), "keyboard", r), r && te(t, e.target), v(), t.key !== "Enter" && ra(e.target) && R(e.target, n) && !t[$i] && (t[$i] = !0, _r(e.target, t, !1)), e.isPressed = !1, e.metaKeyEvents?.delete(t.key);
			} else if (t.key === "Meta" && e.metaKeyEvents?.size) {
				let t = e.metaKeyEvents;
				e.metaKeyEvents = void 0;
				for (let n of t.values()) e.target?.dispatchEvent(new KeyboardEvent("keyup", n));
			}
		};
		if (typeof PointerEvent < "u") {
			t.onPointerDown = (t) => {
				if (t.button !== 0 || !R(t.currentTarget, z(t))) return;
				if (gr(t.nativeEvent)) {
					e.pointerType = "virtual";
					return;
				}
				e.pointerType = t.pointerType;
				let i = !0;
				if (!e.isPressed) {
					e.isPressed = !0, e.isOverTarget = !0, e.activePointerId = t.pointerId, e.target = t.currentTarget, d || Gi(e.target), i = y(t, e.pointerType);
					let a = z(t);
					"releasePointerCapture" in a && ("hasPointerCapture" in a ? a.hasPointerCapture(t.pointerId) && a.releasePointerCapture(t.pointerId) : a.releasePointerCapture(t.pointerId)), _(Nn(t.currentTarget), "pointerup", n, !1), _(Nn(t.currentTarget), "pointercancel", r, !1);
				}
				i && t.stopPropagation();
			}, t.onMouseDown = (t) => {
				if (R(t.currentTarget, z(t)) && t.button === 0) {
					if (l) {
						let n = ir(t.target);
						n && e.disposables.push(n);
					}
					t.stopPropagation();
				}
			}, t.onPointerUp = (t) => {
				R(t.currentTarget, z(t)) && e.pointerType !== "virtual" && t.button === 0 && !e.isPressed && S(t, e.pointerType || t.pointerType);
			}, t.onPointerEnter = (t) => {
				t.pointerId === e.activePointerId && e.target && !e.isOverTarget && e.pointerType != null && (e.isOverTarget = !0, y(V(e.target, t), e.pointerType));
			}, t.onPointerLeave = (t) => {
				t.pointerId === e.activePointerId && e.target && e.isOverTarget && e.pointerType != null && (e.isOverTarget = !1, x(V(e.target, t), e.pointerType, !1), T(t));
			};
			let n = (t) => {
				if (t.pointerId === e.activePointerId && e.isPressed && t.button === 0 && e.target) {
					if (R(e.target, z(t)) && e.pointerType != null) {
						let n = !1, r = setTimeout(() => {
							e.isPressed && e.target instanceof HTMLElement && (n ? w(t) : (Un(e.target), e.target.click()));
						}, 80);
						_(t.currentTarget, "click", () => n = !0, !0), e.disposables.push(() => clearTimeout(r));
					} else w(t);
					e.isOverTarget = !1;
				}
			}, r = (e) => {
				w(e);
			};
			t.onDragStart = (e) => {
				R(e.currentTarget, z(e)) && w(e);
			};
		}
		return t;
	}, [
		_,
		s,
		l,
		v,
		d,
		T,
		y,
		ee,
		te
	]);
	return (0, E.useEffect)(() => {
		if (!f) return;
		let e = Nn(f.current);
		if (!e || !e.head || e.getElementById(ea)) return;
		let t = e.createElement("style");
		t.id = ea;
		let n = Ji(e);
		n && (t.nonce = n), t.textContent = `
@layer {
  [${ta}] {
    touch-action: pan-x pan-y pinch-zoom;
  }
}
    `.trim(), e.head.prepend(t);
	}, [f]), (0, E.useEffect)(() => {
		let e = g.current;
		return () => {
			d || Ki(e.target ?? void 0);
			for (let t of e.disposables) t();
			e.disposables = [];
		};
	}, [d]), {
		isPressed: c || m,
		pressProps: L(p, ne, { [ta]: !0 })
	};
}
function ra(e) {
	return e.tagName === "A" && e.hasAttribute("href");
}
function B(e, t) {
	let { key: n, code: r } = e, i = t, a = i.getAttribute("role");
	return (n === "Enter" || n === " " || n === "Spacebar" || r === "Space") && !(i instanceof Pn(i).HTMLInputElement && !sa(i, n) || i instanceof Pn(i).HTMLTextAreaElement || i.isContentEditable) && !((a === "link" || !a && ra(i)) && n !== "Enter");
}
function V(e, t) {
	let n = t.clientX, r = t.clientY;
	return {
		currentTarget: e,
		shiftKey: t.shiftKey,
		ctrlKey: t.ctrlKey,
		metaKey: t.metaKey,
		altKey: t.altKey,
		clientX: n,
		clientY: r,
		key: t.key
	};
}
function ia(e) {
	return e instanceof HTMLInputElement ? !1 : e instanceof HTMLButtonElement ? e.type !== "submit" && e.type !== "reset" : !ra(e);
}
function aa(e, t) {
	return cr() && t === "Enter" ? !1 : e instanceof HTMLInputElement ? t === "Enter" && (e.type === "checkbox" || e.type === "radio") ? !1 : !sa(e, t) : ia(e);
}
var oa = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset"
]);
function sa(e, t) {
	return e.type === "checkbox" || e.type === "radio" ? t === " " : oa.has(e.type);
}
// node_modules/react-aria/dist/private/interactions/useFocusWithin.mjs
function ca(e) {
	let { isDisabled: t, onBlurWithin: n, onFocusWithin: r, onFocusWithinChange: i } = e, a = (0, E.useRef)({ isFocusWithin: !1 }), { addGlobalListener: o, removeAllGlobalListeners: s } = Xi(), c = (0, E.useCallback)((e) => {
		R(e.currentTarget, z(e)) && a.current.isFocusWithin && !R(e.currentTarget, e.relatedTarget) && (a.current.isFocusWithin = !1, s(), n && n(e), i && i(!1));
	}, [
		n,
		i,
		a,
		s
	]), l = nr(c), u = (0, E.useCallback)((e) => {
		if (!R(e.currentTarget, z(e))) return;
		let t = z(e), n = Nn(t), s = Hn(n);
		if (!a.current.isFocusWithin && s === t) {
			r && r(e), i && i(!0), a.current.isFocusWithin = !0, l(e);
			let t = e.currentTarget;
			o(n, "focus", (e) => {
				let r = z(e);
				if (a.current.isFocusWithin && !R(t, r)) {
					let e = new n.defaultView.FocusEvent("blur", { relatedTarget: r });
					tr(e, t);
					let i = er(e);
					c(i);
				}
			}, { capture: !0 });
		}
	}, [
		r,
		i,
		l,
		o,
		c
	]);
	return t ? { focusWithinProps: {
		onFocus: void 0,
		onBlur: void 0
	} } : { focusWithinProps: {
		onFocus: u,
		onBlur: c
	} };
}
// node_modules/react-aria/dist/private/focus/useFocusRing.mjs
function la(e = {}) {
	let { autoFocus: t = !1, isTextInput: n, within: r } = e, i = (0, E.useRef)({
		isFocused: !1,
		isFocusVisible: t || Fr()
	}), [a, o] = (0, E.useState)(!1), [s, c] = (0, E.useState)(() => i.current.isFocused && i.current.isFocusVisible), l = (0, E.useCallback)(() => c(i.current.isFocused && i.current.isFocusVisible), []), u = (0, E.useCallback)((e) => {
		i.current.isFocused = e, i.current.isFocusVisible = Fr(), o(e), l();
	}, [l]);
	Br((e) => {
		i.current.isFocusVisible = e, l();
	}, [n, a], {
		enabled: a,
		isTextInput: n
	});
	let { focusProps: d } = mi({
		isDisabled: r,
		onFocusChange: u
	}), { focusWithinProps: f } = ca({
		isDisabled: !r,
		onFocusWithinChange: u
	});
	return {
		isFocused: a,
		isFocusVisible: s,
		focusProps: r ? f : d
	};
}
// node_modules/react-aria/dist/private/interactions/useHover.mjs
var ua = !1, da = 0;
function fa() {
	ua = !0, setTimeout(() => {
		ua = !1;
	}, 500);
}
function pa(e) {
	e.pointerType === "touch" && fa();
}
function ma() {
	let e = Nn(null);
	if (e !== void 0) return da === 0 && typeof PointerEvent < "u" && e.addEventListener("pointerup", pa), da++, () => {
		da--, da > 0 || typeof PointerEvent < "u" && e.removeEventListener("pointerup", pa);
	};
}
function ha(e) {
	let { onHoverStart: t, onHoverChange: n, onHoverEnd: r, isDisabled: i } = e, [a, o] = (0, E.useState)(!1), s = (0, E.useRef)({
		isHovered: !1,
		ignoreEmulatedMouseEvents: !1,
		pointerType: "",
		target: null
	}).current;
	(0, E.useEffect)(ma, []);
	let { addGlobalListener: c, removeAllGlobalListeners: l } = Xi(), { hoverProps: u, triggerHoverEnd: d } = (0, E.useMemo)(() => {
		let e = (e, r) => {
			if (s.pointerType = r, i || r === "touch" || s.isHovered || !R(e.currentTarget, z(e))) return;
			s.isHovered = !0;
			let l = e.currentTarget;
			s.target = l, c(Nn(z(e)), "pointerover", (e) => {
				s.isHovered && s.target && !R(s.target, z(e)) && a(e, e.pointerType);
			}, { capture: !0 }), t && t({
				type: "hoverstart",
				target: l,
				pointerType: r
			}), n && n(!0), o(!0);
		}, a = (e, t) => {
			let i = s.target;
			s.pointerType = "", s.target = null, t !== "touch" && s.isHovered && i && (s.isHovered = !1, l(), r && r({
				type: "hoverend",
				target: i,
				pointerType: t
			}), n && n(!1), o(!1));
		}, u = {};
		return typeof PointerEvent < "u" && (u.onPointerEnter = (t) => {
			ua && t.pointerType === "mouse" || e(t, t.pointerType);
		}, u.onPointerLeave = (e) => {
			!i && R(e.currentTarget, z(e)) && a(e, e.pointerType);
		}), {
			hoverProps: u,
			triggerHoverEnd: a
		};
	}, [
		t,
		n,
		r,
		i,
		s,
		c,
		l
	]);
	return (0, E.useEffect)(() => {
		i && d({ currentTarget: s.target }, s.pointerType);
	}, [i]), {
		hoverProps: u,
		isHovered: a
	};
}
// node_modules/react-aria-components/dist/private/Label.mjs
var ga = /*#__PURE__*/ (0, E.createContext)({}), _a = /*#__PURE__*/ Pi(function(e, t) {
	[e, t] = Dn(e, t, ga);
	let { elementType: n = "label", ...r } = e, i = Mn[n];
	return /*#__PURE__*/ E.createElement(i, {
		className: "react-aria-Label",
		...r,
		ref: t
	});
});
// node_modules/react-aria/dist/private/label/useLabel.mjs
function va(e) {
	let { id: t, label: n, "aria-labelledby": r, "aria-label": i, labelElementType: a = "label" } = e;
	t = hn(t);
	let o = hn(), s = {};
	n && (r = r ? `${o} ${r}` : o, s = {
		id: o,
		htmlFor: a === "label" ? t : void 0
	});
	let c = Wr({
		id: t,
		"aria-label": i,
		"aria-labelledby": r
	});
	return {
		labelProps: s,
		fieldProps: c
	};
}
// node_modules/react-aria-components/dist/private/Text.mjs
var ya = /*#__PURE__*/ (0, E.createContext)({}), ba = /*#__PURE__*/ Pi(function(e, t) {
	[e, t] = Dn(e, t, ya);
	let { elementType: n = "span", ...r } = e, i = Mn[n];
	return /*#__PURE__*/ E.createElement(i, {
		className: "react-aria-Text",
		...r,
		ref: t
	});
}), xa = {
	border: 0,
	clip: "rect(0 0 0 0)",
	clipPath: "inset(50%)",
	height: "1px",
	margin: "-1px",
	overflow: "hidden",
	padding: 0,
	position: "absolute",
	width: "1px",
	whiteSpace: "nowrap"
};
function Sa(e = {}) {
	let { style: t, isFocusable: n } = e, [r, i] = (0, E.useState)(!1), { focusWithinProps: a } = ca({
		isDisabled: !n,
		onFocusWithinChange: (e) => i(e)
	}), o = (0, E.useMemo)(() => r ? t : t ? {
		...xa,
		...t
	} : xa, [r]);
	return { visuallyHiddenProps: {
		...a,
		style: o
	} };
}
function Ca(e) {
	let { children: t, elementType: n = "div", isFocusable: r, style: i, ...a } = e, { visuallyHiddenProps: o } = Sa(e);
	return /*#__PURE__*/ E.createElement(n, L(a, o), t);
}
// node_modules/react-aria-components/dist/private/FieldError.mjs
var wa = /*#__PURE__*/ (0, E.createContext)(null), Ta = {
	badInput: !1,
	customError: !1,
	patternMismatch: !1,
	rangeOverflow: !1,
	rangeUnderflow: !1,
	stepMismatch: !1,
	tooLong: !1,
	tooShort: !1,
	typeMismatch: !1,
	valueMissing: !1,
	valid: !0
}, Ea = {
	...Ta,
	customError: !0,
	valid: !1
}, Da = {
	isInvalid: !1,
	validationDetails: Ta,
	validationErrors: []
}, Oa = (0, E.createContext)({}), ka = "__reactAriaFormValidationState";
function Aa(e) {
	if (e.__reactAriaFormValidationState) {
		let { realtimeValidation: t, displayValidation: n, updateValidation: r, resetValidation: i, commitValidation: a } = e[ka];
		return {
			realtimeValidation: t,
			displayValidation: n,
			updateValidation: r,
			resetValidation: i,
			commitValidation: a
		};
	}
	return ja(e);
}
function ja(e) {
	let { isInvalid: t, validationState: n, name: r, value: i, builtinValidation: a, validate: o, validationBehavior: s = "aria" } = e;
	n && (t ||= n === "invalid");
	let c = t === void 0 ? null : {
		isInvalid: t,
		validationErrors: [],
		validationDetails: Ea
	}, l = (0, E.useMemo)(() => !o || i == null ? null : Pa(Na(o, i)), [o, i]);
	a?.validationDetails.valid && (a = void 0);
	let u = (0, E.useContext)(Oa), d = (0, E.useMemo)(() => r ? Array.isArray(r) ? r.flatMap((e) => Ma(u[e])) : Ma(u[r]) : [], [u, r]), [f, p] = (0, E.useState)(u), [m, h] = (0, E.useState)(!1);
	u !== f && (p(u), h(!1));
	let g = (0, E.useMemo)(() => Pa(m ? [] : d), [m, d]), _ = (0, E.useRef)(Da), [v, y] = (0, E.useState)(Da), b = (0, E.useRef)(Da), x = () => {
		if (!S) return;
		C(!1);
		let e = l || a || _.current;
		Fa(e, b.current) || (b.current = e, y(e));
	}, [S, C] = (0, E.useState)(!1);
	return (0, E.useEffect)(x), {
		realtimeValidation: c || g || l || a || Da,
		displayValidation: s === "native" ? c || g || v : c || g || l || a || v,
		updateValidation(e) {
			s === "aria" && !Fa(v, e) ? y(e) : _.current = e;
		},
		resetValidation() {
			let e = Da;
			Fa(e, b.current) || (b.current = e, y(e)), s === "native" && C(!1), h(!0);
		},
		commitValidation() {
			s === "native" && C(!0), h(!0);
		}
	};
}
function Ma(e) {
	return e ? Array.isArray(e) ? e : [e] : [];
}
function Na(e, t) {
	if (typeof e == "function") {
		let n = e(t);
		if (n && typeof n != "boolean") return Ma(n);
	}
	return [];
}
function Pa(e) {
	return e.length ? {
		isInvalid: !0,
		validationErrors: e,
		validationDetails: Ea
	} : null;
}
function Fa(e, t) {
	return e === t || !!e && !!t && e.isInvalid === t.isInvalid && e.validationErrors.length === t.validationErrors.length && e.validationErrors.every((e, n) => e === t.validationErrors[n]) && Object.entries(e.validationDetails).every(([e, n]) => t.validationDetails[e] === n);
}
// node_modules/react-aria-components/dist/private/Form.mjs
var Ia = /*#__PURE__*/ (0, E.createContext)(null), La = /* @__PURE__ */ new WeakMap();
// node_modules/react-aria/dist/private/label/useField.mjs
function Ra(e) {
	let { description: t, errorMessage: n, isInvalid: r, validationState: i } = e, { labelProps: a, fieldProps: o } = va(e), s = _n([
		!!t,
		!!n,
		r,
		i
	]), c = _n([
		!!t,
		!!n,
		r,
		i
	]);
	return o = L(o, { "aria-describedby": [
		s,
		c,
		e["aria-describedby"]
	].filter(Boolean).join(" ") || void 0 }), {
		labelProps: a,
		fieldProps: o,
		descriptionProps: { id: s },
		errorMessageProps: { id: c }
	};
}
// node_modules/react-aria/dist/private/utils/useFormReset.mjs
function za(e, t, n) {
	let r = Ur((e) => {
		n && !e.defaultPrevented && n(t);
	});
	(0, E.useEffect)(() => {
		let t = e?.current?.form;
		return t?.addEventListener("reset", r), () => {
			t?.removeEventListener("reset", r);
		};
	}, [e]);
}
// node_modules/react-aria/dist/private/form/useFormValidation.mjs
function Ba(e, t, n) {
	let { validationBehavior: r, focus: i } = e;
	Xt(() => {
		if (r === "native" && n?.current && "setCustomValidity" in n.current && !n.current.disabled) {
			let e = t.realtimeValidation.isInvalid ? t.realtimeValidation.validationErrors.join(" ") || "Invalid value." : "";
			n.current.setCustomValidity(e), n.current.hasAttribute("title") || (n.current.title = ""), t.realtimeValidation.isInvalid || t.updateValidation(Ha(n.current));
		}
	});
	let a = (0, E.useRef)(!1), o = Ur(() => {
		a.current || t.resetValidation();
	}), s = Ur((e) => {
		t.displayValidation.isInvalid || t.commitValidation();
		let r = n?.current?.form;
		!e.defaultPrevented && n && r && Ua(r) === n.current && (i ? i() : n.current?.focus(), Lr("keyboard")), e.preventDefault();
	}), c = Ur(() => {
		t.commitValidation();
	});
	(0, E.useEffect)(() => {
		let e = n?.current;
		if (!e) return;
		let t = e.form, r = t?.reset;
		return t && (t.reset = () => {
			a.current = !window.event || window.event.type === "message" && z(window.event) instanceof MessagePort, r?.call(t), a.current = !1;
		}), e.addEventListener("invalid", s), e.addEventListener("change", c), t?.addEventListener("reset", o), () => {
			e.removeEventListener("invalid", s), e.removeEventListener("change", c), t?.removeEventListener("reset", o), t && (t.reset = r);
		};
	}, [n, r]);
}
function Va(e) {
	let t = e.validity;
	return {
		badInput: t.badInput,
		customError: t.customError,
		patternMismatch: t.patternMismatch,
		rangeOverflow: t.rangeOverflow,
		rangeUnderflow: t.rangeUnderflow,
		stepMismatch: t.stepMismatch,
		tooLong: t.tooLong,
		tooShort: t.tooShort,
		typeMismatch: t.typeMismatch,
		valueMissing: t.valueMissing,
		valid: t.valid
	};
}
function Ha(e) {
	return {
		isInvalid: !e.validity.valid,
		validationDetails: Va(e),
		validationErrors: e.validationMessage ? [e.validationMessage] : []
	};
}
function Ua(e) {
	for (let t = 0; t < e.elements.length; t++) {
		let n = e.elements[t];
		if (n.validity?.valid === !1) return n;
	}
	return null;
}
// node_modules/react-aria/dist/private/utils/useSlot.mjs
function Wa(e = !0) {
	let [t, n] = (0, E.useState)(e), r = (0, E.useRef)(!1), i = (0, E.useCallback)((e) => {
		r.current = !0, n(!!e);
	}, []);
	return Xt(() => {
		r.current || n(!1);
	}, []), [i, t];
}
function Ga(e = !0) {
	let t = hn(), [n, r] = Wa(e);
	return {
		id: r ? t : void 0,
		ref: n
	};
}
// node_modules/react-aria/dist/private/toggle/useToggle.mjs
function Ka(e, t, n) {
	let { isDisabled: r = !1, isReadOnly: i = !1, value: a, name: o, form: s, children: c, isRequired: l, validationBehavior: u = "aria", "aria-label": d, "aria-labelledby": f, "aria-describedby": p, onPressStart: m, onPressEnd: h, onPressChange: g, onPress: _, onPressUp: v, onClick: y } = e, b = Aa({
		...e,
		value: t.isSelected
	}), { isInvalid: x, validationErrors: S, validationDetails: C } = b.displayValidation;
	Ba(e, b, n);
	let w = (e) => {
		e.stopPropagation(), t.setSelected(z(e).checked);
	}, { pressProps: T, isPressed: ee } = na({
		onPressStart: m,
		onPressEnd: h,
		onPressChange: g,
		onPress: _,
		onPressUp: v,
		onClick: y,
		isDisabled: r
	}), [te, ne] = (0, E.useState)(!1), { pressProps: re } = na({
		onPressStart(e) {
			e.pointerType === "keyboard" || e.pointerType === "virtual" ? e.continuePropagation() : (m?.(e), g?.(!0), ne(!0));
		},
		onPressEnd(e) {
			e.pointerType === "keyboard" || e.pointerType === "virtual" ? e.continuePropagation() : (h?.(e), g?.(!1), ne(!1));
		},
		onPressUp(e) {
			e.pointerType === "keyboard" || e.pointerType === "virtual" ? e.continuePropagation() : v?.(e);
		},
		onClick: y,
		onPress(r) {
			if (r.pointerType === "keyboard" || r.pointerType === "virtual") {
				r.continuePropagation();
				return;
			}
			_?.(r), t.toggle(), n.current?.focus();
			let { [ka]: i } = e, { commitValidation: a } = i || b;
			a();
		},
		isDisabled: r || i
	}), { focusableProps: ie } = Mi(e, n), ae = L(T, ie), oe = Vi(e, { labelable: !0 });
	za(n, t.defaultSelected, t.setSelected);
	let se = Ga(), ce = Ga();
	return {
		labelProps: L(re, { onClick: (e) => e.preventDefault() }),
		inputProps: L(oe, {
			checked: t.isSelected,
			"aria-required": l && u === "aria" || void 0,
			required: l && u === "native",
			"aria-invalid": x || e.validationState === "invalid" || void 0,
			"aria-errormessage": e["aria-errormessage"],
			"aria-controls": e["aria-controls"],
			"aria-readonly": i || void 0,
			"aria-describedby": [
				se.id,
				ce.id,
				p
			].filter(Boolean).join(" ") || void 0,
			onChange: w,
			disabled: r,
			...a == null ? {} : { value: a },
			name: o,
			form: s,
			type: "checkbox",
			...ae
		}),
		descriptionProps: se,
		errorMessageProps: ce,
		isSelected: t.isSelected,
		isPressed: ee || te,
		isDisabled: r,
		isReadOnly: i,
		isInvalid: x || e.validationState === "invalid",
		validationErrors: S,
		validationDetails: C
	};
}
// node_modules/react-aria/dist/private/checkbox/useCheckbox.mjs
function qa(e, t, n) {
	let { labelProps: r, inputProps: i, descriptionProps: a, errorMessageProps: o, isSelected: s, isPressed: c, isDisabled: l, isReadOnly: u, isInvalid: d, validationErrors: f, validationDetails: p } = Ka(e, t, n), { isIndeterminate: m } = e;
	return (0, E.useEffect)(() => {
		n.current && (n.current.indeterminate = !!m);
	}), {
		labelProps: L(r, (0, E.useMemo)(() => ({ onMouseDown: (e) => e.preventDefault() }), [])),
		inputProps: i,
		descriptionProps: a,
		errorMessageProps: o,
		isSelected: s,
		isPressed: c,
		isDisabled: l,
		isReadOnly: u,
		isInvalid: d,
		validationErrors: f,
		validationDetails: p
	};
}
// node_modules/react-stately/dist/private/toggle/useToggleState.mjs
function Ja(e = {}) {
	let { isReadOnly: t } = e, [n, r] = ri(e.isSelected, e.defaultSelected || !1, e.onChange), [i] = (0, E.useState)(n);
	function a(e) {
		t || r(e);
	}
	function o() {
		t || r(!n);
	}
	return {
		isSelected: n,
		defaultSelected: e.defaultSelected ?? i,
		setSelected: a,
		toggle: o
	};
}
// node_modules/react-aria/dist/private/checkbox/useCheckboxGroupItem.mjs
function Ya(e, t, n) {
	let r = Ja({
		isReadOnly: e.isReadOnly || t.isReadOnly,
		isSelected: t.isSelected(e.value),
		defaultSelected: t.defaultValue.includes(e.value),
		onChange(n) {
			n ? t.addValue(e.value) : t.removeValue(e.value), e.onChange && e.onChange(n);
		}
	}), { name: i, form: a, descriptionId: o, errorMessageId: s, validationBehavior: c } = La.get(t);
	c = e.validationBehavior ?? c;
	let { realtimeValidation: l } = Aa({
		...e,
		value: r.isSelected,
		name: void 0,
		validationBehavior: "aria"
	}), u = (0, E.useRef)(Da), d = () => {
		t.setInvalid(e.value, l.isInvalid ? l : u.current);
	};
	(0, E.useEffect)(d);
	let f = t.realtimeValidation.isInvalid ? t.realtimeValidation : l, p = c === "native" ? t.displayValidation : f, m = qa({
		...e,
		isReadOnly: e.isReadOnly || t.isReadOnly,
		isDisabled: e.isDisabled || t.isDisabled,
		name: e.name || i,
		form: e.form || a,
		isRequired: e.isRequired ?? t.isRequired,
		validationBehavior: c,
		[ka]: {
			realtimeValidation: f,
			displayValidation: p,
			resetValidation: t.resetValidation,
			commitValidation: t.commitValidation,
			updateValidation(e) {
				u.current = e, d();
			}
		}
	}, r, n);
	return {
		...m,
		inputProps: {
			...m.inputProps,
			"aria-describedby": [
				m.inputProps["aria-describedby"],
				t.isInvalid ? s : null,
				o
			].filter(Boolean).join(" ") || void 0
		}
	};
}
// node_modules/react-aria-components/dist/private/Checkbox.mjs
var Xa = /*#__PURE__*/ (0, E.createContext)(null), Za = /*#__PURE__*/ (0, E.createContext)(null), Qa = /*#__PURE__*/ (0, E.createContext)(null);
function $a(e, t) {
	let { validationBehavior: n } = En(Ia) || {}, r = e.validationBehavior ?? n ?? "native", i = (0, E.useContext)(Za), a = Sn((0, E.useMemo)(() => vn(t, e.inputRef === void 0 ? null : e.inputRef), [t, e.inputRef])), o = {
		...kn(e),
		children: typeof e.children == "function" || e.children,
		value: e.value,
		validationBehavior: r
	};
	return [i ? Ya(o, i, a) : qa(o, Ja(e), a), a];
}
var eo = /*#__PURE__*/ (0, E.forwardRef)(function(e, t) {
	let { inputRef: n = null, ...r } = e;
	[e, t] = Dn(r, t, Xa);
	let [i, a] = $a(e, n);
	return /*#__PURE__*/ E.createElement(Qa.Provider, { value: {
		...i,
		inputRef: a,
		defaultClassName: "react-aria-Checkbox",
		isIndeterminate: e.isIndeterminate,
		isRequired: e.isRequired
	} }, /*#__PURE__*/ E.createElement(to, {
		...e,
		ref: t
	}));
}), to = /*#__PURE__*/ (0, E.forwardRef)(function(e, t) {
	let { labelProps: n, inputProps: r, isSelected: i, isDisabled: a, isReadOnly: o, isPressed: s, isInvalid: c, inputRef: l, defaultClassName: u, isIndeterminate: d, isRequired: f } = (0, E.useContext)(Qa), { isFocused: p, isFocusVisible: m, focusProps: h } = la(), g = a || o, { hoverProps: _, isHovered: v } = ha({
		...e,
		isDisabled: g
	}), y = Tn({
		...e,
		defaultClassName: u,
		values: {
			isSelected: i,
			isIndeterminate: d || !1,
			isPressed: s,
			isHovered: v,
			isFocused: p,
			isFocusVisible: m,
			isDisabled: a,
			isReadOnly: o,
			isInvalid: c,
			isRequired: f || !1
		}
	}), b = Vi(e, { global: !0 });
	return delete b.id, delete b.onClick, /*#__PURE__*/ E.createElement(Mn.label, {
		...L(b, n, _, y),
		ref: t,
		slot: e.slot || void 0,
		"data-selected": i || void 0,
		"data-indeterminate": d || void 0,
		"data-pressed": s || void 0,
		"data-hovered": v || void 0,
		"data-focused": p || void 0,
		"data-focus-visible": m || void 0,
		"data-disabled": a || void 0,
		"data-readonly": o || void 0,
		"data-invalid": c || void 0,
		"data-required": f || void 0
	}, /*#__PURE__*/ E.createElement(Ca, { elementType: "span" }, /*#__PURE__*/ E.createElement("input", {
		...L(r, h),
		ref: l
	})), y.children);
}), no = /*#__PURE__*/ (0, E.createContext)({}), ro = /*#__PURE__*/ (0, E.forwardRef)(function(e, t) {
	[e, t] = Dn(e, t, no);
	let { isDisabled: n, isInvalid: r, isReadOnly: i, onHoverStart: a, onHoverChange: o, onHoverEnd: s, ...c } = e;
	n ??= !!e["aria-disabled"] && e["aria-disabled"] !== "false", r ??= !!e["aria-invalid"] && e["aria-invalid"] !== "false";
	let { hoverProps: l, isHovered: u } = ha({
		onHoverStart: a,
		onHoverChange: o,
		onHoverEnd: s,
		isDisabled: n
	}), { isFocused: d, isFocusVisible: f, focusProps: p } = la({ within: !0 }), m = Tn({
		...e,
		values: {
			isHovered: u,
			isFocusWithin: d,
			isFocusVisible: f,
			isDisabled: n,
			isInvalid: r
		},
		defaultClassName: "react-aria-Group"
	});
	return /*#__PURE__*/ E.createElement(Mn.div, {
		...L(c, p, l),
		...m,
		ref: t,
		role: e.role ?? "group",
		slot: e.slot ?? void 0,
		"data-focus-within": d || void 0,
		"data-hovered": u || void 0,
		"data-focus-visible": f || void 0,
		"data-disabled": n || void 0,
		"data-invalid": r || void 0,
		"data-readonly": i || void 0
	}, m.children);
}), io = /*#__PURE__*/ (0, E.createContext)({}), ao = (e) => {
	let { onHoverStart: t, onHoverChange: n, onHoverEnd: r, ...i } = e;
	return i;
}, oo = /*#__PURE__*/ Pi(function(e, t) {
	[e, t] = Dn(e, t, io);
	let { hoverProps: n, isHovered: r } = ha({
		...e,
		isDisabled: e.disabled
	}), { isFocused: i, isFocusVisible: a, focusProps: o } = la({
		isTextInput: !0,
		autoFocus: e.autoFocus
	}), s = !!e["aria-invalid"] && e["aria-invalid"] !== "false", c = Tn({
		...e,
		values: {
			isHovered: r,
			isFocused: i,
			isFocusVisible: a,
			isDisabled: e.disabled || !1,
			isInvalid: s
		},
		defaultClassName: "react-aria-Input"
	});
	return /*#__PURE__*/ E.createElement(Mn.input, {
		...L(ao(e), o, n),
		...c,
		ref: t,
		"data-focused": i || void 0,
		"data-disabled": e.disabled || void 0,
		"data-hovered": r || void 0,
		"data-focus-visible": a || void 0,
		"data-invalid": s || void 0
	});
});
// node_modules/react-aria/dist/private/textfield/useTextField.mjs
function so(e, t) {
	let { inputElementType: n = "input", isDisabled: r = !1, isRequired: i = !1, isReadOnly: a = !1, type: o = "text", validationBehavior: s = "aria" } = e, [c, l] = ri(e.value, e.defaultValue || "", e.onChange), { focusableProps: u } = Mi(e, t), d = Aa({
		...e,
		value: c
	}), { isInvalid: f, validationErrors: p, validationDetails: m } = d.displayValidation, { labelProps: h, fieldProps: g, descriptionProps: _, errorMessageProps: v } = Ra({
		...e,
		isInvalid: f,
		errorMessage: e.errorMessage || p
	}), y = Vi(e, { labelable: !0 }), b = {
		type: o,
		pattern: e.pattern
	}, [x] = (0, E.useState)(c);
	return za(t, e.defaultValue ?? x, l), Ba(e, d, t), {
		labelProps: h,
		inputProps: L(y, n === "input" ? b : void 0, {
			disabled: r,
			readOnly: a,
			required: i && s === "native",
			"aria-required": i && s === "aria" || void 0,
			"aria-invalid": f || void 0,
			"aria-errormessage": e["aria-errormessage"],
			"aria-activedescendant": e["aria-activedescendant"],
			"aria-autocomplete": e["aria-autocomplete"],
			"aria-haspopup": e["aria-haspopup"],
			"aria-controls": e["aria-controls"],
			value: c,
			onChange: (e) => l(z(e).value),
			autoComplete: e.autoComplete,
			autoCapitalize: e.autoCapitalize,
			maxLength: e.maxLength,
			minLength: e.minLength,
			name: e.name,
			form: e.form,
			placeholder: e.placeholder,
			inputMode: e.inputMode,
			autoCorrect: e.autoCorrect,
			spellCheck: e.spellCheck,
			enterKeyHint: e.enterKeyHint,
			onCopy: e.onCopy,
			onCut: e.onCut,
			onPaste: e.onPaste,
			onCompositionEnd: e.onCompositionEnd,
			onCompositionStart: e.onCompositionStart,
			onCompositionUpdate: e.onCompositionUpdate,
			onSelect: e.onSelect,
			onBeforeInput: e.onBeforeInput,
			onInput: e.onInput,
			...u,
			...g
		}),
		descriptionProps: _,
		errorMessageProps: v,
		isInvalid: f,
		validationErrors: p,
		validationDetails: m
	};
}
// node_modules/react-aria-components/dist/private/SharedElementTransition.mjs
var co = /*#__PURE__*/ (0, E.createContext)(null);
function lo(e) {
	let t = (0, E.useRef)({});
	return /*#__PURE__*/ E.createElement(co.Provider, { value: t }, e.children);
}
// node_modules/react-aria/dist/private/utils/shadowdom/ShadowTreeWalker.mjs
var uo = class {
	constructor(e, t, n, r) {
		this._walkerStack = [], this._currentSetFor = /* @__PURE__ */ new Set(), this._acceptNode = (e) => {
			if (e.nodeType === Node.ELEMENT_NODE) {
				let t = e.shadowRoot;
				if (t) {
					let e = this._doc.createTreeWalker(t, this.whatToShow, { acceptNode: this._acceptNode });
					return this._walkerStack.unshift(e), NodeFilter.FILTER_ACCEPT;
				}
				if (typeof this.filter == "function") return this.filter(e);
				if (this.filter?.acceptNode) return this.filter.acceptNode(e);
				if (this.filter === null) return NodeFilter.FILTER_ACCEPT;
			}
			return NodeFilter.FILTER_SKIP;
		}, this._doc = e, this.root = t, this.filter = r ?? null, this.whatToShow = n ?? NodeFilter.SHOW_ALL, this._currentNode = t, this._walkerStack.unshift(e.createTreeWalker(t, n, this._acceptNode));
		let i = t.shadowRoot;
		if (i) {
			let e = this._doc.createTreeWalker(i, this.whatToShow, { acceptNode: this._acceptNode });
			this._walkerStack.unshift(e);
		}
	}
	get currentNode() {
		return this._currentNode;
	}
	set currentNode(e) {
		if (!R(this.root, e)) throw Error("Cannot set currentNode to a node that is not contained by the root node.");
		let t = [], n = e, r = e;
		for (this._currentNode = e; n && n !== this.root;) if (n.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
			let e = n, i = this._doc.createTreeWalker(e, this.whatToShow, { acceptNode: this._acceptNode });
			t.push(i), i.currentNode = r, this._currentSetFor.add(i), n = r = e.host;
		} else n = n.parentNode;
		let i = this._doc.createTreeWalker(this.root, this.whatToShow, { acceptNode: this._acceptNode });
		t.push(i), i.currentNode = r, this._currentSetFor.add(i), this._walkerStack = t;
	}
	get doc() {
		return this._doc;
	}
	firstChild() {
		let e = this.currentNode, t = this.nextNode();
		return R(e, t) ? (t && (this.currentNode = t), t) : (this.currentNode = e, null);
	}
	lastChild() {
		let e = this._walkerStack[0].lastChild();
		return e && (this.currentNode = e), e;
	}
	nextNode() {
		let e = this._walkerStack[0].nextNode();
		if (e) {
			if (e.shadowRoot) {
				let t;
				if (typeof this.filter == "function" ? t = this.filter(e) : this.filter?.acceptNode && (t = this.filter.acceptNode(e)), t === NodeFilter.FILTER_ACCEPT) return this.currentNode = e, e;
				let n = this.nextNode();
				return n && (this.currentNode = n), n;
			}
			return e && (this.currentNode = e), e;
		}
		if (this._walkerStack.length > 1) {
			this._walkerStack.shift();
			let e = this.nextNode();
			return e && (this.currentNode = e), e;
		}
		return null;
	}
	previousNode() {
		let e = this._walkerStack[0];
		if (e.currentNode === e.root) {
			if (this._currentSetFor.has(e)) {
				if (this._currentSetFor.delete(e), this._walkerStack.length > 1) {
					this._walkerStack.shift();
					let e = this.previousNode();
					return e && (this.currentNode = e), e;
				}
				return null;
			}
			return null;
		}
		let t = e.previousNode();
		if (t) {
			if (t.shadowRoot) {
				let e;
				if (typeof this.filter == "function" ? e = this.filter(t) : this.filter?.acceptNode && (e = this.filter.acceptNode(t)), e === NodeFilter.FILTER_ACCEPT) return t && (this.currentNode = t), t;
				let n = this.lastChild();
				return n && (this.currentNode = n), n;
			}
			return t && (this.currentNode = t), t;
		}
		if (this._walkerStack.length > 1) {
			this._walkerStack.shift();
			let e = this.previousNode();
			return e && (this.currentNode = e), e;
		}
		return null;
	}
	nextSibling() {
		return null;
	}
	previousSibling() {
		return null;
	}
	parentNode() {
		return null;
	}
};
function fo(e, t, n, r) {
	return Vn() ? new uo(e, t, n, r) : e.createTreeWalker(t, n, r);
}
// node_modules/react-aria/dist/private/focus/FocusScope.mjs
function po(e) {
	if (!e.form) return Array.from(Nn(e).querySelectorAll(`input[type="radio"][name="${CSS.escape(e.name)}"]`)).filter((e) => !e.form);
	let t = e.form.elements.namedItem(e.name), n = Pn(e);
	return t instanceof n.RadioNodeList ? Array.from(t).filter((e) => e instanceof n.HTMLInputElement) : t instanceof n.HTMLInputElement ? [t] : [];
}
function mo(e) {
	if (e.checked) return !0;
	let t = po(e);
	return t.length > 0 && !t.some((e) => e.checked);
}
function ho(e, t) {
	return !e || !t ? !1 : t.some((t) => R(t, e));
}
function go(e, t, n) {
	let r = t?.tabbable ? Qn : Zn, i = Nn(e?.nodeType === Node.ELEMENT_NODE ? e : null), a = fo(i, e || i, NodeFilter.SHOW_ELEMENT, { acceptNode(e) {
		return R(t?.from, e) || t?.tabbable && e.tagName === "INPUT" && e.getAttribute("type") === "radio" && (!mo(e) || a.currentNode.tagName === "INPUT" && a.currentNode.type === "radio" && a.currentNode.name === e.name) ? NodeFilter.FILTER_REJECT : r(e) && (!n || ho(e, n)) && (!t?.accept || t.accept(e)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	} });
	return t?.from && (a.currentNode = t.from), a;
}
var _o = class e {
	constructor() {
		this.fastMap = /* @__PURE__ */ new Map(), this.root = new vo({ scopeRef: null }), this.fastMap.set(null, this.root);
	}
	get size() {
		return this.fastMap.size;
	}
	getTreeNode(e) {
		return this.fastMap.get(e);
	}
	addTreeNode(e, t, n) {
		let r = this.fastMap.get(t ?? null);
		if (!r) return;
		let i = new vo({ scopeRef: e });
		r.addChild(i), i.parent = r, this.fastMap.set(e, i), n && (i.nodeToRestore = n);
	}
	addNode(e) {
		this.fastMap.set(e.scopeRef, e);
	}
	removeTreeNode(e) {
		if (e === null) return;
		let t = this.fastMap.get(e);
		if (!t) return;
		let n = t.parent;
		for (let e of this.traverse()) e !== t && t.nodeToRestore && e.nodeToRestore && t.scopeRef && t.scopeRef.current && ho(e.nodeToRestore, t.scopeRef.current) && (e.nodeToRestore = t.nodeToRestore);
		let r = t.children;
		n && (n.removeChild(t), r.size > 0 && r.forEach((e) => n && n.addChild(e))), this.fastMap.delete(t.scopeRef);
	}
	*traverse(e = this.root) {
		if (e.scopeRef != null && (yield e), e.children.size > 0) for (let t of e.children) yield* this.traverse(t);
	}
	clone() {
		let t = new e();
		for (let e of this.traverse()) t.addTreeNode(e.scopeRef, e.parent?.scopeRef ?? null, e.nodeToRestore);
		return t;
	}
}, vo = class {
	constructor(e) {
		this.children = /* @__PURE__ */ new Set(), this.contain = !1, this.scopeRef = e.scopeRef;
	}
	addChild(e) {
		this.children.add(e), e.parent = this;
	}
	removeChild(e) {
		this.children.delete(e), e.parent = void 0;
	}
};
new _o();
// node_modules/react-aria/dist/private/radio/utils.mjs
var yo = /* @__PURE__ */ new WeakMap();
// node_modules/react-aria/dist/private/radio/useRadio.mjs
function bo(e, t, n) {
	let { value: r, children: i, "aria-label": a, "aria-labelledby": o, onPressStart: s, onPressEnd: c, onPressChange: l, onPress: u, onPressUp: d, onClick: f } = e, p = e.isDisabled || t.isDisabled, m = t.selectedValue === r, h = (e) => {
		e.stopPropagation(), t.setSelectedValue(r);
	}, { pressProps: g, isPressed: _ } = na({
		onPressStart: s,
		onPressEnd: c,
		onPressChange: l,
		onPress: u,
		onPressUp: d,
		onClick: f,
		isDisabled: p
	}), { pressProps: v, isPressed: y } = na({
		onPressStart: s,
		onPressEnd: c,
		onPressChange: l,
		onPressUp: d,
		onClick: f,
		isDisabled: p,
		onPress(e) {
			u?.(e), t.setSelectedValue(r), n.current?.focus();
		}
	}), { focusableProps: b } = Mi(L(e, { onFocus: () => t.setLastFocusedValue(r) }), n), x = L(g, b), S = Vi(e, { labelable: !0 }), C = -1;
	t.selectedValue == null ? (t.lastFocusedValue === r || t.lastFocusedValue == null) && (C = 0) : t.selectedValue === r && (C = 0), p && (C = void 0);
	let { name: w, form: T, descriptionId: ee, errorMessageId: te, validationBehavior: ne } = yo.get(t);
	za(n, t.defaultSelectedValue, t.setSelectedValue), Ba({ validationBehavior: ne }, t, n);
	let re = Ga();
	return {
		labelProps: L(v, (0, E.useMemo)(() => ({
			onClick: (e) => e.preventDefault(),
			onMouseDown: (e) => e.preventDefault()
		}), [])),
		inputProps: L(S, {
			...x,
			type: "radio",
			name: w,
			form: T,
			tabIndex: C,
			disabled: p,
			required: t.isRequired && ne === "native",
			checked: m,
			value: r,
			onChange: h,
			"aria-describedby": [
				e["aria-describedby"],
				re.id,
				t.isInvalid ? te : null,
				ee
			].filter(Boolean).join(" ") || void 0
		}),
		descriptionProps: re,
		isDisabled: p,
		isSelected: m,
		isPressed: _ || y
	};
}
// node_modules/react-aria/dist/private/radio/useRadioGroup.mjs
function xo(e, t) {
	let { name: n, form: r, isReadOnly: i, isRequired: a, isDisabled: o, orientation: s = "vertical", validationBehavior: c = "aria" } = e, { direction: l } = ti(), { isInvalid: u, validationErrors: d, validationDetails: f } = t.displayValidation, { labelProps: p, fieldProps: m, descriptionProps: h, errorMessageProps: g } = Ra({
		...e,
		labelElementType: "span",
		isInvalid: t.isInvalid,
		errorMessage: e.errorMessage || d
	}), _ = Vi(e, { labelable: !0 }), { focusWithinProps: v } = ca({
		onBlurWithin(n) {
			e.onBlur?.(n), t.selectedValue || t.setLastFocusedValue(null);
		},
		onFocusWithin: e.onFocus,
		onFocusWithinChange: e.onFocusChange
	});
	function y(e, n) {
		let r = go(n.currentTarget, {
			from: z(n),
			accept: (e) => e instanceof Pn(e).HTMLInputElement && e.type === "radio"
		}), i;
		return e === "next" ? (i = r.nextNode(), i ||= (r.currentNode = n.currentTarget, r.firstChild())) : (i = r.previousNode(), i ||= (r.currentNode = n.currentTarget, r.lastChild())), i ? (i.focus(), t.setSelectedValue(i.value), !0) : !1;
	}
	let { keyboardProps: b } = Oi({
		shortcuts: {
			ArrowRight: (e) => y(l === "rtl" && s !== "vertical" ? "prev" : "next", e),
			ArrowLeft: (e) => y(l === "rtl" && s !== "vertical" ? "next" : "prev", e),
			ArrowDown: (e) => y("next", e),
			ArrowUp: (e) => y("prev", e)
		},
		allowRepeats: !0
	}), x = hn(n);
	return yo.set(t, {
		name: x,
		form: r,
		descriptionId: h.id,
		errorMessageId: g.id,
		validationBehavior: c
	}), {
		radioGroupProps: L(_, {
			role: "radiogroup",
			...b,
			"aria-invalid": t.isInvalid || void 0,
			"aria-errormessage": e["aria-errormessage"],
			"aria-readonly": i || void 0,
			"aria-required": a || void 0,
			"aria-disabled": o || void 0,
			"aria-orientation": s,
			...m,
			...v
		}),
		labelProps: p,
		descriptionProps: h,
		errorMessageProps: g,
		isInvalid: u,
		validationErrors: d,
		validationDetails: f
	};
}
// node_modules/react-stately/dist/private/radio/useRadioGroupState.mjs
var So = Math.round(Math.random() * 1e10), Co = 0;
function wo(e) {
	let t = (0, E.useMemo)(() => e.name || `radio-group-${So}-${++Co}`, [e.name]), [n, r] = ri(e.value, e.defaultValue ?? null, e.onChange), [i] = (0, E.useState)(n), [a, o] = (0, E.useState)(null), s = Aa({
		...e,
		value: n
	}), c = (t) => {
		!e.isReadOnly && !e.isDisabled && (r(t), s.commitValidation());
	}, l = s.displayValidation.isInvalid;
	return {
		...s,
		name: t,
		selectedValue: n,
		defaultSelectedValue: e.value === void 0 ? e.defaultValue ?? null : i,
		setSelectedValue: c,
		lastFocusedValue: a,
		setLastFocusedValue: o,
		isDisabled: e.isDisabled || !1,
		isReadOnly: e.isReadOnly || !1,
		isRequired: e.isRequired || !1,
		validationState: e.validationState || (l ? "invalid" : null),
		isInvalid: l
	};
}
// node_modules/react-aria-components/dist/private/RadioGroup.mjs
var To = /*#__PURE__*/ (0, E.createContext)(null), Eo = /*#__PURE__*/ (0, E.createContext)(null), Do = /*#__PURE__*/ (0, E.createContext)(null), Oo = /*#__PURE__*/ (0, E.forwardRef)(function(e, t) {
	[e, t] = Dn(e, t, To);
	let { validationBehavior: n } = En(Ia) || {}, r = e.validationBehavior ?? n ?? "native", i = wo({
		...e,
		validationBehavior: r
	}), [a, o] = On(!e["aria-label"] && !e["aria-labelledby"]), { radioGroupProps: s, labelProps: c, descriptionProps: l, errorMessageProps: u, ...d } = xo({
		...e,
		label: o,
		validationBehavior: r
	}, i), f = Tn({
		...e,
		values: {
			orientation: e.orientation || "vertical",
			isDisabled: i.isDisabled,
			isReadOnly: i.isReadOnly,
			isRequired: i.isRequired,
			isInvalid: i.isInvalid,
			state: i
		},
		defaultClassName: "react-aria-RadioGroup"
	}), p = Vi(e, { global: !0 });
	return /*#__PURE__*/ E.createElement(Mn.div, {
		...L(p, f, s),
		ref: t,
		slot: e.slot || void 0,
		"data-orientation": e.orientation || "vertical",
		"data-invalid": i.isInvalid || void 0,
		"data-disabled": i.isDisabled || void 0,
		"data-readonly": i.isReadOnly || void 0,
		"data-required": i.isRequired || void 0
	}, /*#__PURE__*/ E.createElement(wn, { values: [
		[Do, i],
		[ga, {
			...c,
			ref: a,
			elementType: "span"
		}],
		[ya, { slots: {
			description: l,
			errorMessage: u
		} }],
		[wa, d]
	] }, /*#__PURE__*/ E.createElement(lo, null, f.children)));
}), ko = /*#__PURE__*/ (0, E.forwardRef)(function(e, t) {
	let { inputRef: n = null, ...r } = e;
	[e, t] = Dn(r, t, Eo);
	let i = E.useContext(Do), a = Sn((0, E.useMemo)(() => vn(n, e.inputRef === void 0 ? null : e.inputRef), [n, e.inputRef])), o = bo({
		...kn(e),
		children: typeof e.children == "function" || e.children
	}, i, a);
	return /*#__PURE__*/ E.createElement(Ao.Provider, { value: {
		...o,
		inputRef: a,
		defaultClassName: "react-aria-Radio"
	} }, /*#__PURE__*/ E.createElement(jo, {
		...e,
		ref: t
	}));
}), Ao = /*#__PURE__*/ (0, E.createContext)(null), jo = /*#__PURE__*/ (0, E.forwardRef)(function(e, t) {
	let { labelProps: n, inputProps: r, isSelected: i, isDisabled: a, isPressed: o, defaultClassName: s, inputRef: c } = (0, E.useContext)(Ao), l = E.useContext(Do), { isFocused: u, isFocusVisible: d, focusProps: f } = la(), p = a || l.isReadOnly, { hoverProps: m, isHovered: h } = ha({
		...e,
		isDisabled: p
	}), g = Tn({
		...e,
		defaultClassName: s,
		values: {
			isSelected: i,
			isPressed: o,
			isHovered: h,
			isFocused: u,
			isFocusVisible: d,
			isDisabled: a,
			isReadOnly: l.isReadOnly,
			isInvalid: l.isInvalid,
			isRequired: l.isRequired
		}
	}), _ = Vi(e, { global: !0 });
	return delete _.id, delete _.onClick, /*#__PURE__*/ E.createElement(Mn.label, {
		...L(_, n, m, g),
		ref: t,
		"data-selected": i || void 0,
		"data-pressed": o || void 0,
		"data-hovered": h || void 0,
		"data-focused": u || void 0,
		"data-focus-visible": d || void 0,
		"data-disabled": a || void 0,
		"data-readonly": l.isReadOnly || void 0,
		"data-invalid": l.isInvalid || void 0,
		"data-required": l.isRequired || void 0
	}, /*#__PURE__*/ E.createElement(Ca, { elementType: "span" }, /*#__PURE__*/ E.createElement("input", {
		...L(r, f),
		ref: c
	})), g.children);
});
// node_modules/react-aria/dist/private/switch/useSwitch.mjs
function Mo(e, t, n) {
	let { labelProps: r, inputProps: i, isSelected: a, ...o } = Ka(e, t, n);
	return {
		labelProps: r,
		inputProps: {
			...i,
			role: "switch",
			checked: a
		},
		isSelected: a,
		...o
	};
}
// node_modules/react-aria-components/dist/private/Switch.mjs
var No = /*#__PURE__*/ (0, E.createContext)(null), Po = /*#__PURE__*/ (0, E.createContext)(null), Fo = /*#__PURE__*/ (0, E.forwardRef)(function(e, t) {
	let { inputRef: n = null, ...r } = e;
	[e, t] = Dn(r, t, No);
	let i = Sn((0, E.useMemo)(() => vn(n, e.inputRef === void 0 ? null : e.inputRef), [n, e.inputRef])), a = Ja(e), o = Mo({
		...kn(e),
		children: typeof e.children == "function" || e.children
	}, a, i);
	return /*#__PURE__*/ E.createElement(wn, { values: [[Po, a], [Io, {
		...o,
		inputRef: i,
		defaultClassName: "react-aria-Switch"
	}]] }, /*#__PURE__*/ E.createElement(Lo, {
		...e,
		ref: t
	}));
}), Io = /*#__PURE__*/ (0, E.createContext)(null), Lo = /*#__PURE__*/ (0, E.forwardRef)(function(e, t) {
	let { labelProps: n, inputProps: r, isSelected: i, isDisabled: a, isReadOnly: o, isPressed: s, isInvalid: c, inputRef: l, defaultClassName: u, isRequired: d } = (0, E.useContext)(Io), { isFocused: f, isFocusVisible: p, focusProps: m } = la(), h = a || o, g = (0, E.useContext)(Po), { hoverProps: _, isHovered: v } = ha({
		...e,
		isDisabled: h
	}), y = Tn({
		...e,
		defaultClassName: u,
		values: {
			isSelected: i,
			isPressed: s,
			isHovered: v,
			isFocused: f,
			isFocusVisible: p,
			isDisabled: a,
			isReadOnly: o,
			isInvalid: c,
			isRequired: d || !1,
			state: g
		}
	}), b = Vi(e, { global: !0 });
	return delete b.id, delete b.onClick, /*#__PURE__*/ E.createElement(Mn.label, {
		...L(b, n, _, y),
		ref: t,
		slot: e.slot || void 0,
		"data-selected": i || void 0,
		"data-pressed": s || void 0,
		"data-hovered": v || void 0,
		"data-focused": f || void 0,
		"data-focus-visible": p || void 0,
		"data-disabled": a || void 0,
		"data-readonly": o || void 0,
		"data-invalid": c || void 0,
		"data-required": d || void 0
	}, /*#__PURE__*/ E.createElement(Ca, { elementType: "span" }, /*#__PURE__*/ E.createElement("input", {
		...L(r, m),
		ref: l
	})), y.children);
}), Ro = /*#__PURE__*/ (0, E.createContext)({}), zo = /*#__PURE__*/ (0, E.createContext)(null), Bo = /*#__PURE__*/ Pi(function(e, t) {
	[e, t] = Dn(e, t, zo);
	let { validationBehavior: n } = En(Ia) || {}, r = e.validationBehavior ?? n ?? "native", i = (0, E.useRef)(null);
	[e, i] = Dn(e, i, ii);
	let [a, o] = On(!e["aria-label"] && !e["aria-labelledby"]), [s, c] = (0, E.useState)("input"), { labelProps: l, inputProps: u, descriptionProps: d, errorMessageProps: f, ...p } = so({
		...kn(e),
		inputElementType: s,
		label: o,
		validationBehavior: r
	}, i), m = (0, E.useCallback)((e) => {
		i.current = e, e && c(e instanceof HTMLTextAreaElement ? "textarea" : "input");
	}, [i]), h = Tn({
		...e,
		values: {
			isDisabled: e.isDisabled || !1,
			isInvalid: p.isInvalid,
			isReadOnly: e.isReadOnly || !1,
			isRequired: e.isRequired || !1
		},
		defaultClassName: "react-aria-TextField"
	}), g = Vi(e, { global: !0 });
	return delete g.id, /*#__PURE__*/ E.createElement(Mn.div, {
		...g,
		...h,
		ref: t,
		slot: e.slot || void 0,
		"data-disabled": e.isDisabled || void 0,
		"data-invalid": p.isInvalid || void 0,
		"data-readonly": e.isReadOnly || void 0,
		"data-required": e.isRequired || void 0
	}, /*#__PURE__*/ E.createElement(wn, { values: [
		[ga, {
			...l,
			ref: a
		}],
		[io, {
			...u,
			ref: m
		}],
		[Ro, {
			...u,
			ref: m
		}],
		[no, {
			role: "presentation",
			isInvalid: p.isInvalid,
			isDisabled: e.isDisabled || !1
		}],
		[ya, { slots: {
			description: d,
			errorMessage: f
		} }],
		[wa, p]
	] }, h.children));
}), Vo = {
	md: {
		box: "size-4",
		glyph: "size-4",
		label: "text-body-medium",
		gap: "gap-2"
	},
	sm: {
		box: "size-3.5",
		glyph: "size-3.5",
		label: "text-body-2-medium",
		gap: "gap-1.5"
	}
};
function H({ state: e, size: t = "md" }) {
	let { isSelected: n, isIndeterminate: r, isFocusVisible: i, isDisabled: a, isHovered: o } = e, s = Vo[t], c = n || r, l = o && !a;
	return /* @__PURE__ */ (0, F.jsx)("span", {
		"aria-hidden": !0,
		className: P("flex shrink-0 items-center justify-center rounded-sm", "transition-[background-color,border-color,box-shadow] duration-150 ease", s.box, c ? P("bg-linear-to-b shadow-checkbox-selected", l ? "from-accent-400 to-accent-500" : "from-accent-500 to-accent-600") : P("border bg-background-primary-default shadow-xs", l ? "border-border-checkbox-hover" : "border-border-checkbox-default"), a && "opacity-50", i && "ring-2 ring-border-focus-ring ring-offset-2"),
		children: /* @__PURE__ */ (0, F.jsx)("svg", {
			viewBox: "0 0 16 16",
			fill: "none",
			className: s.glyph,
			children: r ? /* @__PURE__ */ (0, F.jsx)("path", {
				d: "M4.5 8H8H11.5",
				stroke: "white",
				strokeWidth: "2",
				strokeLinecap: "round"
			}) : n ? /* @__PURE__ */ (0, F.jsx)("path", {
				d: "M4 7.7002L6.64645 10.3466C6.84171 10.5419 7.15829 10.5419 7.35355 10.3466L12 5.7002",
				stroke: "white",
				strokeWidth: "2",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				pathLength: 1,
				className: "animate-check-draw"
			}) : null
		})
	});
}
// src/react/boardui/components/base/checkbox/checkbox.tsx
function U({ className: e, children: t, size: n = "md", ref: r, ...i }) {
	let a = Vo[n];
	return /* @__PURE__ */ (0, F.jsx)(eo, {
		ref: r,
		...i,
		className: (t) => P("group inline-flex items-center select-none", a.gap, t.isDisabled ? "cursor-not-allowed" : "cursor-pointer", typeof e == "function" ? e(t) : e),
		children: (e) => /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)(H, {
			state: e,
			size: n
		}), t != null && /* @__PURE__ */ (0, F.jsx)("span", {
			className: P(a.label, "text-text-primary"),
			children: t
		})] })
	});
}
// node_modules/@remixicon/react/index.mjs
var Ho = ({ color: e = "currentColor", size: t = 24, className: n, ...r }) => E.createElement("svg", {
	viewBox: "0 0 24 24",
	xmlns: "http://www.w3.org/2000/svg",
	width: t,
	height: t,
	fill: e,
	...r,
	className: "remixicon " + (n || "")
}, E.createElement("path", { d: "M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" })), Uo = ({ color: e = "currentColor", size: t = 24, className: n, ...r }) => E.createElement("svg", {
	viewBox: "0 0 24 24",
	xmlns: "http://www.w3.org/2000/svg",
	width: t,
	height: t,
	fill: e,
	...r,
	className: "remixicon " + (n || "")
}, E.createElement("path", { d: "M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z" })), Wo = ({ color: e = "currentColor", size: t = 24, className: n, ...r }) => E.createElement("svg", {
	viewBox: "0 0 24 24",
	xmlns: "http://www.w3.org/2000/svg",
	width: t,
	height: t,
	fill: e,
	...r,
	className: "remixicon " + (n || "")
}, E.createElement("path", { d: "M4 5V19H20V7H11.5858L9.58579 5H4ZM12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5Z" })), Go = ({ color: e = "currentColor", size: t = 24, className: n, ...r }) => E.createElement("svg", {
	viewBox: "0 0 24 24",
	xmlns: "http://www.w3.org/2000/svg",
	width: t,
	height: t,
	fill: e,
	...r,
	className: "remixicon " + (n || "")
}, E.createElement("path", { d: "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z" })), Ko = ({ color: e = "currentColor", size: t = 24, className: n, ...r }) => E.createElement("svg", {
	viewBox: "0 0 24 24",
	xmlns: "http://www.w3.org/2000/svg",
	width: t,
	height: t,
	fill: e,
	...r,
	className: "remixicon " + (n || "")
}, E.createElement("path", { d: "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM10.6219 8.41459L15.5008 11.6672C15.6846 11.7897 15.7343 12.0381 15.6117 12.2219C15.5824 12.2658 15.5447 12.3035 15.5008 12.3328L10.6219 15.5854C10.4381 15.708 10.1897 15.6583 10.0672 15.4745C10.0234 15.4088 10 15.3316 10 15.2526V8.74741C10 8.52649 10.1791 8.34741 10.4 8.34741C10.479 8.34741 10.5562 8.37078 10.6219 8.41459Z" })), qo = ({ color: e = "currentColor", size: t = 24, className: n, ...r }) => E.createElement("svg", {
	viewBox: "0 0 24 24",
	xmlns: "http://www.w3.org/2000/svg",
	width: t,
	height: t,
	fill: e,
	...r,
	className: "remixicon " + (n || "")
}, E.createElement("path", { d: "M19.376 12.4161L8.77735 19.4818C8.54759 19.635 8.23715 19.5729 8.08397 19.3432C8.02922 19.261 8 19.1645 8 19.0658V4.93433C8 4.65818 8.22386 4.43433 8.5 4.43433C8.59871 4.43433 8.69522 4.46355 8.77735 4.5183L19.376 11.584C19.6057 11.7372 19.6678 12.0477 19.5146 12.2774C19.478 12.3323 19.4309 12.3795 19.376 12.4161Z" })), Jo = ({ color: e = "currentColor", size: t = 24, className: n, ...r }) => E.createElement("svg", {
	viewBox: "0 0 24 24",
	xmlns: "http://www.w3.org/2000/svg",
	width: t,
	height: t,
	fill: e,
	...r,
	className: "remixicon " + (n || "")
}, E.createElement("path", { d: "M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" }));
// src/react/boardui/components/base/input/label.tsx
function Yo({ isRequired: e = !1, isInvalid: t, tooltip: n, className: r, children: i, ...a }) {
	return /* @__PURE__ */ (0, F.jsxs)(_a, {
		"data-label": "true",
		...a,
		className: P("flex cursor-default items-center gap-0.5", "text-body-medium text-text-primary", r),
		children: [
			i,
			e && /* @__PURE__ */ (0, F.jsx)("span", {
				"aria-hidden": "true",
				className: "text-body-medium text-text-error-primary",
				children: "*"
			}),
			n && /* @__PURE__ */ (0, F.jsx)(Go, {
				className: "size-4 shrink-0 text-foreground-icon-quaternary",
				"aria-hidden": !0
			})
		]
	});
}
// src/react/boardui/components/base/input/hint-text.tsx
function Xo({ isInvalid: e = !1, className: t, ...n }) {
	return /* @__PURE__ */ (0, F.jsx)(ba, {
		slot: e ? "errorMessage" : "description",
		...n,
		className: P("pt-px text-caption-1-medium text-text-secondary", e && "text-text-error-primary", t)
	});
}
// src/react/boardui/components/base/input/input.tsx
var Zo = (0, E.createContext)({});
function Qo({ size: e = "medium", fieldClassName: t, inputClassName: n, className: r, children: i, ...a }) {
	return /* @__PURE__ */ (0, F.jsx)(Zo.Provider, {
		value: {
			size: e,
			fieldClassName: t,
			inputClassName: n
		},
		children: /* @__PURE__ */ (0, F.jsx)(Bo, {
			...a,
			"data-input-size": e,
			className: P("group flex h-max w-full flex-col items-start gap-1", r),
			children: i
		})
	});
}
Qo.displayName = "TextField";
var $o = zt({
	field: "relative flex w-full items-center rounded-2lg bg-background-tertiary-default text-foreground-icon-tertiary ring-2 ring-inset ring-transparent transition-[background-color,box-shadow,color] duration-[var(--input-transition-ms)] ease",
	fieldSize: {
		medium: "p-2",
		small: "h-8 px-1.5 py-2"
	},
	fieldWithAddonSize: {
		medium: "h-9 pl-1 pr-2 py-2",
		small: "h-8 pl-1 pr-1.5 py-2"
	},
	content: "flex w-full items-center gap-2 min-w-0",
	leftSection: "flex flex-1 items-center gap-0.5 min-w-0",
	input: "min-w-0 flex-1 bg-transparent border-0 outline-none p-0 m-0 font-sans text-body-regular text-text-primary pl-1 placeholder:text-text-tertiary focus:placeholder:text-text-primary disabled:text-input-disabled-text disabled:placeholder:text-input-disabled-text disabled:cursor-not-allowed aria-invalid:placeholder:text-text-error-placeholder",
	icon: "size-5 shrink-0"
});
function es({ size: e, leadingIcon: t, trailingIcon: n, leadingAddon: r, fieldClassName: i, className: a, ref: o, groupRef: s, ...c }) {
	let l = (0, E.useContext)(Zo), u = e ?? l.size ?? "medium", d = r != null;
	return /* @__PURE__ */ (0, F.jsx)(ro, {
		ref: s,
		className: ({ isFocusWithin: e, isHovered: t, isDisabled: n, isInvalid: r }) => P($o.field, d ? $o.fieldWithAddonSize[u] : $o.fieldSize[u], t && !e && !n && !r && "ring-border-button-hover", e && !n && !r && "ring-border-button-active", n && "bg-input-disabled-background text-input-disabled-foreground", r && "bg-background-tertiary-error text-foreground-icon-error", l.fieldClassName, i),
		children: /* @__PURE__ */ (0, F.jsxs)("div", {
			className: $o.content,
			children: [/* @__PURE__ */ (0, F.jsxs)("div", {
				className: $o.leftSection,
				children: [d ? r : t ? /* @__PURE__ */ (0, F.jsx)(t, {
					className: $o.icon,
					"aria-hidden": !0
				}) : null, /* @__PURE__ */ (0, F.jsx)(oo, {
					ref: o,
					...c,
					className: P($o.input, l.inputClassName, a)
				})]
			}), n ? /* @__PURE__ */ (0, F.jsx)(n, {
				className: $o.icon,
				"aria-hidden": !0
			}) : null]
		})
	});
}
es.displayName = "InputBase";
function ts({ label: e, hint: t, tooltip: n, placeholder: r, leadingIcon: i, trailingIcon: a, leadingAddon: o, fieldClassName: s, ref: c, groupRef: l, className: u, ...d }) {
	return /* @__PURE__ */ (0, F.jsx)(Qo, {
		...d,
		className: u,
		"aria-label": d["aria-label"] ?? (!e && typeof r == "string" ? r : void 0),
		children: ({ isRequired: u, isInvalid: d }) => /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [
			e && /* @__PURE__ */ (0, F.jsx)(Yo, {
				isRequired: u,
				isInvalid: d,
				tooltip: n,
				children: e
			}),
			/* @__PURE__ */ (0, F.jsx)(es, {
				ref: c,
				groupRef: l,
				placeholder: r,
				leadingIcon: i,
				trailingIcon: a,
				leadingAddon: o,
				fieldClassName: s
			}),
			t && /* @__PURE__ */ (0, F.jsx)(Xo, {
				isInvalid: d,
				children: t
			})
		] })
	});
}
ts.displayName = "Input";
// src/react/components/note.tsx
function ns({ tone: e, title: t, action: n, extra: r, children: i, actionLayout: a = "inline", className: o }) {
	let s = /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsxs)("div", {
		"data-note-layout": "",
		className: P("flex gap-3", a === "inline" ? "flex-wrap items-center justify-between" : "flex-col items-start"),
		children: [/* @__PURE__ */ (0, F.jsxs)("div", {
			className: P("flex min-w-0 flex-auto flex-col justify-center gap-0.5", a === "below" && "w-full"),
			children: [t ? /* @__PURE__ */ (0, F.jsx)("p", {
				className: "text-body-medium wrap-anywhere",
				children: t
			}) : null, /* @__PURE__ */ (0, F.jsx)("p", {
				className: "whitespace-pre-line text-body-2-regular wrap-anywhere",
				children: i
			})]
		}), n ? /* @__PURE__ */ (0, F.jsx)("div", {
			"data-note-action": "",
			className: "max-w-full shrink-0",
			children: n
		}) : null]
	}), r] });
	switch (e) {
		case "info": return /* @__PURE__ */ (0, F.jsx)("div", {
			role: "status",
			className: P("@container flex flex-col gap-2 rounded-2lg bg-notification-information-background px-3 py-2 text-notification-information-foreground", o),
			children: s
		});
		case "success": return /* @__PURE__ */ (0, F.jsx)("div", {
			role: "status",
			className: P("@container flex flex-col gap-2 rounded-2lg bg-notification-success-background px-3 py-2 text-notification-success-foreground", o),
			children: s
		});
		case "warning": return /* @__PURE__ */ (0, F.jsx)("div", {
			role: "note",
			className: P("@container flex flex-col gap-2 rounded-2lg bg-status-yellow-background px-3 py-2 text-status-yellow-text", o),
			children: s
		});
		case "error": return /* @__PURE__ */ (0, F.jsx)("div", {
			role: "alert",
			className: P("@container flex flex-col gap-2 rounded-2lg bg-background-tertiary-error px-3 py-2 text-text-error-primary", o),
			children: s
		});
		default: return /* @__PURE__ */ (0, F.jsx)("div", {
			role: "note",
			className: P("@container flex flex-col gap-2 rounded-2lg bg-background-tertiary-default px-3 py-2 text-text-secondary", o),
			children: s
		});
	}
}
// src/react/pages/first-access.ts
var rs = "请从部署 Peach 的机器或同一局域网打开 Peach 完成设置，或在启动容器时设置 PEACH_ACCESS_PASSWORD。", is = zt({
	sm: {
		track: "h-4 w-7",
		trackRadius: {
			pill: "rounded-full",
			rectangle: "rounded-[3px]"
		},
		onShadow: "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25),inset_0_0_0_0.5px_var(--color-accent-500)]",
		thumb: "size-3",
		thumbRadius: {
			pill: "rounded-full",
			rectangle: "rounded-[1px]"
		},
		offset: "left-0.5 top-0.5",
		travel: "translate-x-3",
		chip: "size-[5px] border-[0.25px] shadow-[0_2px_2px_0_rgb(0_0_0/0.03)]",
		chipRadius: {
			pill: "rounded-full",
			rectangle: "rounded-[0.5px]"
		}
	},
	md: {
		track: "h-6 w-[42px]",
		trackRadius: {
			pill: "rounded-full",
			rectangle: "rounded-[4.5px]"
		},
		onShadow: "shadow-[inset_0_1.5px_0_0_rgb(255_255_255/0.25),inset_0_0_0_0.75px_var(--color-accent-500)]",
		thumb: "size-[18px]",
		thumbRadius: {
			pill: "rounded-full",
			rectangle: "rounded-[1.5px]"
		},
		offset: "left-[3px] top-[3px]",
		travel: "translate-x-[18px]",
		chip: "size-[7.5px] border-[0.375px] shadow-[0_3px_3px_0_rgb(0_0_0/0.03)]",
		chipRadius: {
			pill: "rounded-full",
			rectangle: "rounded-[0.75px]"
		}
	},
	lg: {
		track: "h-8 w-14",
		trackRadius: {
			pill: "rounded-full",
			rectangle: "rounded-md"
		},
		onShadow: "shadow-checkbox-selected",
		thumb: "size-6",
		thumbRadius: {
			pill: "rounded-full",
			rectangle: "rounded-xs"
		},
		offset: "left-1 top-1",
		travel: "translate-x-6",
		chip: "size-[10px] border-[0.5px] shadow-[0_4px_4px_0_rgb(0_0_0/0.03)]",
		chipRadius: {
			pill: "rounded-full",
			rectangle: "rounded-[1px]"
		}
	}
});
function as({ state: e, size: t = "md", shape: n = "pill" }) {
	let r = is[t];
	return /* @__PURE__ */ (0, F.jsx)("span", {
		"aria-hidden": !0,
		className: P("relative shrink-0 transition-colors duration-200 ease", r.track, r.trackRadius[n], e.isSelected ? P("bg-linear-to-b from-accent-500 to-accent-600", r.onShadow) : "bg-background-tertiary-default", e.isDisabled && "opacity-50", e.isFocusVisible && "ring-2 ring-border-focus-ring ring-offset-2"),
		children: /* @__PURE__ */ (0, F.jsx)("span", {
			className: P("absolute flex items-center justify-center", "bg-linear-to-b from-control-indicator-background from-[43.837%] to-control-indicator-background-subtle", "shadow-[0_3px_3px_0_rgb(0_0_0/0.03),0_0.75px_0_0_rgb(0_0_0/0.05)]", "transition-transform duration-200 ease", r.thumb, r.thumbRadius[n], r.offset, e.isSelected && r.travel),
			children: /* @__PURE__ */ (0, F.jsx)("span", { className: P("border-solid bg-linear-to-t from-[43.837%]", r.chip, r.chipRadius[n], e.isSelected ? "border-accent-600 from-switch-on-chip-start to-switch-on-chip-end" : "border-border-button-default/50 from-switch-off-chip-start to-switch-off-chip-end") })
		})
	});
}
function os({ className: e, children: t, size: n = "md", shape: r = "pill", ref: i, ...a }) {
	return /* @__PURE__ */ (0, F.jsx)(Fo, {
		ref: i,
		...a,
		className: (t) => P("group inline-flex items-center gap-2 select-none", t.isDisabled ? "cursor-not-allowed" : "cursor-pointer", typeof e == "function" ? e(t) : e),
		children: (e) => /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)(as, {
			state: e,
			size: n,
			shape: r
		}), t != null && t !== !1 && /* @__PURE__ */ (0, F.jsx)("span", {
			className: "text-body-medium text-text-primary",
			children: t
		})] })
	});
}
// src/react/settings/password-pair.tsx
function ss({ label: e, password: t, confirmation: n, onPassword: r, onConfirmation: i, disabled: a = !1, passwordError: o, passwordHint: s, confirmationError: c, confirmationInvalid: l = !1 }) {
	return /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)(ts, {
		id: "access-password",
		type: "password",
		label: e,
		autoComplete: "new-password",
		maxLength: 256,
		value: t,
		onChange: r,
		isDisabled: a,
		isRequired: !a,
		validationBehavior: "aria",
		isInvalid: !a && !!o,
		hint: a ? s : o || s
	}), /* @__PURE__ */ (0, F.jsx)(ts, {
		id: "access-confirm",
		type: "password",
		label: "确认访问密码",
		autoComplete: "new-password",
		maxLength: 256,
		value: n,
		onChange: i,
		isDisabled: a,
		isRequired: !a,
		validationBehavior: "aria",
		isInvalid: !a && (!!c || l),
		hint: a ? void 0 : c
	})] });
}
// src/react/settings/busy-props.ts
function cs(e) {
	return e ? {
		"aria-busy": !0,
		"aria-disabled": !0
	} : {};
}
// src/ui-kit/collapse.ts
var ls = /* @__PURE__ */ new WeakMap();
function us(e, t, n) {
	ds(t, n, () => e.open, (t) => {
		e.open = t;
	});
}
function ds(e, t, n, r) {
	e.classList.add("ui-fcollapse");
	let i = (ls.get(e) || 0) + 1;
	ls.set(e, i);
	let a = () => ls.get(e) === i;
	if (t) {
		e.inert = !1;
		let t = n() ? e.getBoundingClientRect().height : 0;
		r(!0), ps(e, t, a);
	} else e.inert = !0, e.classList.remove("ui-fcollapse-settled"), e.style.height = e.getBoundingClientRect().height + "px", e.getBoundingClientRect(), e.style.height = "0px", fs(e, () => {
		a() && (r(!1), e.style.height = "");
	});
}
function fs(e, t) {
	let n = !1, r, i = (a) => {
		a && a.propertyName !== "height" || n || (n = !0, e.removeEventListener("transitionend", i), clearTimeout(r), t());
	};
	e.addEventListener("transitionend", i), r = setTimeout(i, 260);
}
function ps(e, t, n = () => !0) {
	e.classList.remove("ui-fcollapse-settled"), e.style.height = t + "px", e.getBoundingClientRect(), e.style.height = e.scrollHeight + "px", fs(e, () => {
		n() && (e.style.height = "auto", e.classList.add("ui-fcollapse-settled"));
	});
}
// ../resources/media-sources.json
var ms = [{
	id: "gdrive",
	name: "Google Drive",
	label: "Google Drive",
	cloud: !0,
	icon: "database"
}, {
	id: "onedrive",
	name: "OneDrive",
	label: "OneDrive",
	cloud: !0,
	icon: "database"
}], hs = ms;
ms.map((e) => [e.id, e.label]), ms.map((e) => e.id), ms.filter((e) => e.cloud).map((e) => e.id);
var gs = Object.fromEntries(ms.map((e) => [e.id, e.name])), _s = {
	local: "hard-drive",
	guangya: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEWUlEQVR42sWXT2hcVRTGf/fNYCZdNNPGTaHaSUXFVQZSLLowoe3GdpEERHFhYqTQRBATcWlpSly56YQu4ipNZivYxCK46Z9EsBGkHdwItdhXrLixzaASo2bucXHve/feNzOagqQXHnPf/XPOd77z3XPfKLwmkxTZit4lkiEiykQK8wA5+5v0c5i5nNj3ZJ03nwPyKpmvEekFpGNZvV6PE58qdT7BEIoLRKqYOo0g6PtOogQEDkDWeS4DVgQ0MVpNqbGNpRSATDCEcLHJYcAAzWz4QHIqZCcdswwloWr7iBpWJzeWlIxTAq4CJSK7MNmQOhXrSGXeWzj205AGAiiLQAAt0JA6HZ09eRRDCKV0UmGoUsq8SzJoKRS7DgFJxpQxmjhRXsRg5pU4AAKIKvL7xmQeGPVWerJIHBACSX9TQw5EAlB75lLnnm1t18NgHqHsAPjGvCj8KHN27rEuONgPnV3w96/wVx3urZrotefMj0n5DABalfME59CjUXwGPGDlEegbgZ5+mtpmHW5fgusz8NtdF30AwKZCa9AKJeNIYERZ4anM0esuwWvzJurttK8+hLUZY1B5gaUpMIHlW+8Wh0YL7O2BU5dhb4lttxc/sEBmnE3lmba6yrf0re1RE7vj7RbOf1iBWhXqdw1D+3rh8DtQLIUgNuvwzXmaUm3T25yCJA3Kgjg+DS+fcXMPYvjkLYhXw1Ql/YHT0H861MXcs7C5bo+2BCzkpg8x3ZpDZTa8cQE6i274XB/8/K0TVt8oPDcI67FxFq9AYQ/sP2zm8wXIdcDWn7D7AOwuGdZsRWzNQFJMegfh1EU3tjoLy+85oR4agVfnzdydFZg/ZuY6izD1PRSKzXbjFageS2tF1FZEIvD0QDj29aKt41bJHV0Z7YiZ31iH7z5rbfdmFRruTsj/q5K7D4TvP9Ys9fZofXkeuntgz5Nw6X1jNDn363FzjbgyAzeqnhCzKXhmAKauuk2LY7C2YAWJExyJ6CyQ5LL5aMvtvVE1YlWZtBIexTAF9zOonyg7tCn1Ht2JohsCPS+Fe3+quas3eRpi6G9o82hpAWCj7t5fGIVdxRCE9mt5ereb0+C3ezWnCS1eXweAmkW4tuj6nUU4fiZTQPCMmijY1wvPj4a14vaKi1pjhScOsG6VAoArlZCFo5NwIgvCA/JUP5z8NLTxxVnn2Hx8uPUND1TbOnB0El45R1N6Ls8aagEeL5kUZY/qgximD3riU5n7Jbz62xeikQXj4GHa/RhmjxgQqkV5F3sSRKfA2hei6pvw+dntO791DSpH4Jc7nuCyAhT3NWTT0Z6BtBiV4MR0ezZuXTPCvb7Q8jpJo/aveNyF9N8AkrarCPvL7lr+o270kK0dD9mUTHAz/C7cwSbUIoRlHlWLWIwoUEGoPwL3McJSpCrUiRjbcfeKKfUxcQSg5lhCMQzEO5D3OophNcdS8O8YQMYpoRkix+j/LkxFDWGZAhVVcSn/Bw2n+w/oK+fWAAAAAElFTkSuQmCC",
	115: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAHB0lEQVR4nO2bbUwURxjH/zN38qIcb4JWoIoHFYumWhDbRquNiSlYC4ZGjVYrotHWD1VTLdY00X7zbA22Na21KWqsUMHYSiygJjaRQDW+VK2YioBarVZBQA9QDm6nedajCuxxHrfH7dX+kiXcvszM8+zO7DPP/JfBzcQmfx4O1jpJEmKUgBTHwUYIIAyAwbYRZtoYUCdBVDLwi5yxCgjfo1Uly2vd2T7mjkJj3vgsUVitcwWkqQxstAv1CAFxnoEfZjpdbvXPq05p1gFxqSZDexuWCIhMCMTDHTBcYGA5+n7YdrEwy6xOkS4yJi07uMliWSGEeB9ACPqGBsbYFwE+PpvP7l/Z6BEHCCFYzDRTBgATBMLhCRhofMiqLsrawRgTvSuiFxinbxjK2pErgAnQAAwoE3rMrTmw5s9eXOscxpSNE5iQ9glgEDQEA24LxtNrij8sc+Y67szJscmmTAjpiNaMJ+Q2CemI3Ea1n4CZM/N1p5pqPoXASngDDNmJAcbVBQWzrI5PfRLjzTX7AKTCuyhMNBjTHTmBOypFvvPeZzyRamt775+A2GRTpgTxHbwYDraoqiQrx2kHGFM2TqBBBYAPvBsLGJ9i7+3AenjPn9DiaN/rV6QeSUpxgl4pwotNMeWqbXw/PceYuAiEBvk7dZ2/Xz8MCQvE2JERGB4ZgteXOt8jyRY5cBPi1a4Ro77rybbwVtUIzzDAF7mmOYiPGexSOZt2Hu31tRS12mzbbvctMCYtO1iO7VVmUXqSy8bX323Bjp9OutoUk81GZQc0WSwr1J7YBAb4IiNtnMvlbCs4jpYHba4VIhAu26jkgLhUk8E2pVWVRenj5S7QWyxtVhQcOoecH0+o0h6ykWztNga0t2GJ2vP5oAA/ZKQldtv/1Q+/Yv8vFWg0P3BYhrm5Fa2WdjWbFWKzdVMnB8iZHJVZ/NZ4BPTvfPfzis64NJipgc1W2QG8I4endhor2OCHd1ITOu27/6AN2btK4XEE4mWbYXMAJTD74u5/f+A07jS2QAt02MzlH5Cmqn/3u/d9vV6HyeOM8nFP02Ezo7y9hPu31MwQr86YjHdnv9zjOTXX7+D4uWsoKv0D5WeuwgMIDv/Belq0gFDP+JBAf8zv0veVMEYNlLc508bir1t3sffw78g/eA5/16mS7X4SGNnOacVG7b4/wN+5CWTk4CAsnzcRh79djPlvOnaeWkhCjOK0XKVmoXWNzdhTchalpy7Ld9YZ+vv5YP2yqfK8YfDAALgbASmOxSRvoGmv67GqHcJCBuDFkRHybC5pdBQSno8EY457XPW1O5i9ajca7t13V9Oo359kxuQNlwFEo494JsyAGVNGYeGMcbJzeuLcxZt4e02e63MA+1yh1+C/cXFfQIPc1vxjmJSxFZt3lcJqleye+0LcEKyYP9GdzTH0uQM6oPj+y9xyzM3Kw83ae3bPmzc9ARGDAt3qAI9ysuI6Zn2wG7X1TYrHfX30WDb7FbfVz23iBI9yo/YeFq/bK88VlJicZHRX1WZNOIA4X3ULuw6cVjwWER6I6Ai3rLybOclSoBFy9p2wO/ePHTpQ9foYUMdJkwONUNvQjIuXlSVBOp36w5UEUclJkAQNcdPOXIDTs6oyjMRYshpLQ1gl5big5nq96nVxxio4SdEeps21QVx0uGJesPKK6mo5QbZz0uGRFA0agMLk4ZGh3faX/XaF9HKqQjZXlSyvlUcW0uFBA9BUWKmvUxZZbTps5vIPnS4XHoZecwsU0mgHyypRUU0JK3XpsJnTH1mByXABHoKySFvWzpAXQrtOiT/aXKx+hQwXOlSn/NE+ZldE4E6GDQlGwaZ5eG4YyYcfcbu+CRkf5+Nuk+PFE2d53Fbe8Q/JT0mBiT6CJjlLZ76Eoq8zMTyq88B36WodFqzdgxu37c8SXaDBZqtMpxEnJsW0XgixDm6CNAKUGaLU+OzkMQgN6t/peLtVwjf5x7Alr1xeE3QHjLFPqouz1ivqAwJ8fDabLa3LXF0hHjEsDBMSoqHjHH4+egwM7g9jVCgS46O69XOC0l6Hyiuxs/CU3VBYFRhqycbOu7pgTNmwEAI5aiyMvjbeiEkJRhifDUXkoCB5qbyt3YrmFguu3mxE5dVaHCq7hPIzV2CV+iAWY8isKV6zvUcHiIcSmVKt6IDV1BNXFWd1k8jwbicyJkh4TMIi/EewiaTmKinKudIFpKYi4bEsMfN+LLKI2o6SnNu7inR1HOw9eDlkQ08Kct7TxbLCkiEb3gpDdk8qUcJhmoVU1yQ8hvdRaGs7XHJAQcEsK6muvepJILn8EyjFCafyTDbx9Nca1g9bqM87euwfhzlbw1P9yQxBFZDwmAILaATbR1NJzhpP/P/ZHFzkqf1wsitP7aezSjyVH0/DDlr/fP4fOwTeE5lpP+gAAAAASUVORK5CYII=",
	pikpak: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACY0lEQVR4nNWXy2tTQRSHv7m5RUWttqlNW1OairhKNbrU+lhE/AOkdCOIIO7arty0QhSxCIIQ7VJwIfgfCIJdFB+rgC32AVIflD5CbFUsoohJRiZzb5Ne05p4kxv94HCTc+bO+c0MM3eOoICD/TJswAAQBdoBH5UhA8wDo1mIv7ojpuyAsH9EBuQgkmuASXVJI4lN3BXDawIifXIQwQ28RDA0ERfDwpr2cQ9G7iSdhcOGteZeJ1eYKreB5DS1I2oiCJba2hDQVA9tjdDaCHMfICuhMwDJz5D8BMtftK9E2s2NttrJMOxvzSdT1rIb6goW69KIXsjr5/K+nxlIWWKWrOebJIxNFhXgK7r20QjcPL+59PllGH8LarDvU3oWFHU+CDZpK+TKA3j88vd+zGKd93av/y8lrKxao7Ls6bROrrj6EE6E9WzZppZKrJ0y0Hu8RAGhZuhohqk5nShp2Y/0+nZqxPaoFQsr2my2mNDSkBe01w/7AvAu9QcB/nrYs0vboU4qSsNOwCHAoMYY/5WAsckNt1NJ8WKY5TS+fF8/E7f/Lu5aQDrjLu5agOlzF3ct4NYFd3HXAk51uYv/k9vQLPeFr9/h4gh0dcCBNu17vaiP7nt9sGNblQVs3wo9x+DZNCRm9aUyFICebh0rF9PpWP22+QvqC3f2qLZyKda34XTMLsGLGSrO8xndtxMR6ZfqQ+tz7uczRyDor0zyxY/6LlDkoMqYVsUSKvSqho8SVB/JglqCUWqF4ImharVcueQ96j4bN3KFoiDmeXpJTOXO7QJVoyEZ8mgm0rm6sLA4talFef4LaurBZfZxNPMAAAAASUVORK5CYII=",
	onedrive: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAL30lEQVR42u2aa4xd11XHf2ufez2v6/GMY2dix4nHbRw7tI5TmyZgFToKtCKokitoigT9kAopFEFFGqkSAUrDowiJD614SEj5EEG/VUXllQgQLbQVCNqIokoVQmmVKKiNgELcUGfuPXuvtfiw9z73zPUjduxAC3dJW/uc0Zk7Z/3Xf/3XWvsOzG1uc5vb3OY2t7nNbW5z+/9o8r/xR898Kp1txb7fAriABcTFRAKhafwfhkv6x39/YvSv/2cAuO9J3z92e1cc2E+qcDQFRwNYY1gAGkcChMYhgDQOyLPi/tTyYPArnz2x8MVvSwDuf9L3fyPZB2LgvSpOCpCCowLWOCaONo402WkJEIJDAxKcEEDEIfEUxgc+f3r0Z982ANz3CX+oEf/lFnZHcRIQmwyCBScVELxxJDgyyE5Lk0GQUAABwPKLTvyJke7+iU+dka9+ywJw/5O+P415DOfsRCCKE4EY8m6hx4QGpLEc7WaaCtJAECeII5JZIBgAnnheUvPg586s/Om3HAD3P+n7mwl/m+C21iAaRIGJOFGK00BqsgZ4yfnQGDQZhBp5AgxwRAzBwcm7OO42aV5s3vt3b1l97FrfeXAtv7z5I184mybtXTHGtYWF8Eb5z8mpZrSwlAzcQB1UwUSw4JjJFATL6AfAEYJkB90F3AkGLpLLhIBgeOYA4izYUvqtu//iha9/7q3rn/gfZcDr3/P0Vrvd/kxs49tTG9E2kdrI6fvuYOPIPsYKrcHYYKIwcUgCLZDEu+hbcJpmmvcEp6l6UGkvjpDpL57dF3EcA3FwWraHP/rUD+z+g1edAXc99PxmGp9/PLZxS9XwskyV4/dscui12Xl1SJojnAzUIDrZaYGEYOY0jeA4UiIuQTCdpkEXHvfMBBwozgP5R7bLPf4u8IoBCFfy0KmHn3tA4/YzqrplxWlVRdVYWVvk+OmDRKVbybPjavk6ASlBVMETeBIsgUTBk+MRPDqSBItAufeJl+ctP9M6HgWiY9GxCI7uO/Hx/3jiVQPg1MPPfTi1+rgmRZNiKWFJu3X6rcew0GTBU4gJ2lSA0KwBqmAKnkCTgIJEsOhQQCDle0ngE6AtDreOTwogKe/WgrfgEayFZpf+4Os+9uKbrnsKnHr4Xx5NMT2kMdGtpGjK+8Hb97N6w4hxglaL4zZlQSwMUPLPTMg3ASxkGps6TdEECY4nx7w0QFKoXkpiTQME3Ot9ThPS5HeAk9dNBE89/NwDqdXHNSZScT61CY2R1CaaAdz7rruxpmGSyEszEBOF1qdlMBUg3PILh07ocimQxgjBaapDQQl4LgBiU/HbJcRRwIZCGoVcEsWRVmlaVxo5+/T37nnimgG466HnNy1ufyHFtKYxRzw7n0gxK//xrds5dPsG0XLkdzhveSUvouiQ3EvAHHHPJTA4BMtgBCO4IyEr/hQgx3Y3pBuHxJUGD56X5J6A4ITGGTS5irjxtVab33j2+PJHXrEGxPH5R+MkrqU2kmIktTFHvji/sm+FA0c3mCiMe863Wmjfy301SOqIgpgjmlHxZFhrOd/HuW7aWLGxYxPDJoZHJx1aIt6yTFoa4A5mZTkognnuFays0HBwZSl9+NhXXvzy4S+fv++qGfD69zy9Fdv0V1pErsv7mgYx8YYfOs3u/atoiXasANT8L12gaol86eRwz2Wt7GK9Oi+KeE4HdyesNsjRZXShQcVzIyV5UVkQcq/QlOg3hQ1NGaoEJufHwwefObb0+1csgu1LkwdUFU2l3M0AcPCuwyztXWWSprU+zjifDDSBVmcB8RI29253c0yNxi3X+CJ0zXpgeHyFtgkZM8lR93p+UD4GL52kg5nkaJaOEoQQfGG01P7ekX/e9meOLX30ygCI8WwucZYZkCoASjMUDty5Sau9Gm895S+1XxXMHbMaecsCWJx3s5IOmc+mhRFiNHsDiydHpOK8Ghi5glhxFMkfa5BHZ8tOm+QHpbTM7oIHWNqVHtv8p/G/PXvH4p9fFoDNd3x+K43jmqlianRpkBIalcNvvhMLTaZ26fVrxCsYSXPkO+etPFgTWJ1gjpti5ohqBsCMZhcsn9iND0J21ovzLtNr8XyIUhAwkTw8dYhkyriDhPxnRVgYDNJvAscuK4Jtm7ZSG0mT3ir3owPr7DlyICt8EbtYrqvjnfNaXqgIXq7Tlmt8SSdvDW8TNlG8VaxVll63Qlgdds5Xn1JpsWt36SYkLcJXRdEENcE07911WUG4/dCXxj99WQakNm5qUlwN1ZoCiptx8Lu/IzczpbGpL5WqIpd7M3bkuVh+c1PLlI+V9oZnlcTVWLh5yOJrl0hd1NnJAhNUsg6YFRaY9JTcqwDkHsKliORUG4Zi7wd++5IMGO4dnUiTSJxE0qQltRE3Y+P0bTRroxzxWaX3aTpY763FnGB1IMjC4Mnw0k57zJHXmAiNsX5mT3aUndGv9xXoVKNvsiPyeYF6ibpNo1+vHW7d+OLkxCUBWLp5Yzu1mfamuQNbXF/mhpO35T6/p/qxl/dqWfTEneBO8BxlT1URM1peBgSfGD5J3Qct3znClwc7I06vaFBZJ5l5VgGYgtAtFdTzdQUg9XYxfuySACwc2L96wxuOTu/Xljl473eSpEHNy0Q3zXfX3OR4ysIm6rj6VCBUy6BTqJ4SFhVXxZOirSLBGN2x0jmts9TvpUMqDKiptiPy/Yj3Iz+z3LnlkhrgItujY69h9fhrsrKWipqid9N4fUEtNA21wdGS70WVxLw4bx31iRmM2gWaKnvfsh8fNt1nzgKhfiEIoevfSt57J/54KGcl3SCV9+lvyPFLAiDOE2Z2twbp+nb3DIJJPuaqL9edURj5tKbU90x9R1JWTFfFa+ub8rWWfrnZHVg6OppqyGWiX++dUglKqXMvDZI7Ich0rwDQ2ylHzJdshIRPJvVfysdPUp6u0S/1uNdDS2ly8EL/Uu5ELQtipX6sjZV1OWSq7Nu6EdNpb2/9qPvMz8t1NaueBceLw15HbIHQj/7Ohv/SAHzpfcO/ue1D2980kVH2DlQyG6yjXBYOoUMFJ+e+mGUNKEXbk2OqeOdlLn+WjMVDCyzcskKK03ZBZ5y/GBCznjhCCNM2WQoILl1V7FIBwE0+fdlWOLl90k3OulNg7P1V6VXckiL9eu/JwUtnp9MSWFPAUzlLNGPvvQfQeBHq9523HiPs4sOM1zMWkY4BlQVysTSw8JXLAjAc2iOTl+Ssi2SnKnouID4VE+eCwUaKc7W5ccszgJdGyC0/t+e79iGLA1KaOthh5jPOXyL6s9alpshF6d/tA/7yZQ9Ebv3g+T9xs7d1LdTMVukv3i/UiueWLQteYYAnRaOXBkhpRg03veNwd1DSHZjYzuvovRnjCgC46Kxf1V+69/5Meqe8+WXPBIcj+/H2BXvGYXkHfJUMdebwPM/XMLrV4/J8b2ln5N1g/U03llF5GuHZ6z4DZsXvasx3JjA4H7ziM8HDv/hfPxwn6eNS4KuFIXQlM0deyFG30giZaQEgA2Epa4InY/XkGit3rO8QvB1TZe++32m+Qv9n7dO8W7au6puhm3/h3CO2rb/WTwWRWv58WgatnNJqzf06AOWx19XYtW+B9e85uDPnZ6jfP2Pog3Ed7BsM2OTdcu6qvxq7+WfP/byO4696EZjy/WRHsGCemxGtYpjTAM2nPWbOrj1D9p65CRtMO74+3S/GgrpfF+cbtnhQ/vEVfzd468+d+772m/Fjbra3+6V61GW5AfKy14R2Myw5u9Z2sX7PBtY0OxqdPgizAFQmmF8H5wNb/NTFnb+qL0cPf+jfD0xekF/3l9I73XyRrgvMYEzPAUrumzNcHbL3jTfhPeeNndHvpmW/cL9G+yPgAd53Ie2v6dvhw4+eO9Weiw+mcXq7tWmjdoOUbtDdkUZYvnUPK0fWulbBekPNLAAXsMCu2fGP8H7561f9HyQ2H/n6PZOxnrSJv01dgyBhsDxYWdwYHQnLC0ojLyAyrpOjWk6cVHXSp31TaRhJhvvVAVAdfZZF/vDlIj63uc1tbnOb29zmNre5zW1ucwP+G1ME77lSc/kUAAAAAElFTkSuQmCC"
};
({ ...Object.fromEntries(hs.map((e) => [e.id, _s[e.id] || e.icon])) });
// src/react/boardui/components/base/buttons/link-button.tsx
var vs = zt({
	base: "inline-flex items-center justify-center gap-1 whitespace-nowrap font-sans select-none cursor-pointer rounded-sm underline-offset-3 hover:underline transition-colors duration-150 ease outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus-ring disabled:cursor-not-allowed disabled:no-underline aria-disabled:cursor-not-allowed aria-disabled:no-underline",
	size: {
		medium: "text-body-medium",
		small: "text-body-medium",
		xs: "text-caption-1-semibold"
	},
	icon: {
		medium: "size-5 shrink-0",
		small: "size-[18px] shrink-0",
		xs: "size-3.5 shrink-0"
	},
	variant: {
		primary: "text-accent-600 active:text-accent-800 disabled:text-text-tertiary aria-disabled:text-text-tertiary",
		secondary: "text-text-secondary active:text-text-primary disabled:text-text-tertiary aria-disabled:text-text-tertiary"
	}
});
function ys({ variant: e = "primary", size: t = "medium", leadingIcon: n, trailingIcon: r, children: i, className: a, disabled: o = !1, ...s }) {
	let c = P(vs.base, vs.size[t], vs.variant[e], a), l = /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [
		n ? /* @__PURE__ */ (0, F.jsx)(n, {
			className: vs.icon[t],
			"aria-hidden": !0
		}) : null,
		i != null && /* @__PURE__ */ (0, F.jsx)("span", { children: i }),
		r ? /* @__PURE__ */ (0, F.jsx)(r, {
			className: vs.icon[t],
			"aria-hidden": !0
		}) : null
	] });
	if (s.href !== void 0) {
		let { ref: e, href: t, ...n } = s;
		return /* @__PURE__ */ (0, F.jsx)("a", {
			ref: e,
			href: o ? void 0 : t,
			"aria-disabled": o || void 0,
			className: c,
			...n,
			children: l
		});
	}
	let { ref: u, type: d = "button", ...f } = s;
	return /* @__PURE__ */ (0, F.jsx)("button", {
		ref: u,
		type: d,
		disabled: o,
		className: c,
		...f,
		children: l
	});
}
// src/react/settings/section.tsx
function bs({ role: e, children: t }) {
	return /* @__PURE__ */ (0, F.jsx)("p", {
		role: e,
		className: "text-body-2-regular text-text-secondary",
		children: t
	});
}
function xs({ children: e }) {
	return /* @__PURE__ */ (0, F.jsx)("p", {
		role: "alert",
		className: "text-body-2-regular text-text-error-primary",
		children: e
	});
}
function Ss({ href: e, children: t, leadingIcon: n }) {
	return /* @__PURE__ */ (0, F.jsx)(ys, {
		href: e,
		target: "_blank",
		rel: "noopener noreferrer",
		size: "small",
		leadingIcon: n,
		trailingIcon: Uo,
		className: "min-w-0 max-w-full",
		children: /* @__PURE__ */ (0, F.jsx)("span", {
			className: "min-w-0 whitespace-normal break-all",
			children: t
		})
	});
}
function Cs({ children: e }) {
	return /* @__PURE__ */ (0, F.jsx)("dl", {
		className: "ui-settings-facts flex flex-col empty:hidden",
		children: e
	});
}
function ws({ term: e, children: t }) {
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "flex min-h-11 items-center justify-between gap-4 border-b border-separator-border py-2.5 pr-3 last:border-b-0",
		children: [/* @__PURE__ */ (0, F.jsx)("dt", {
			className: "flex max-w-1/2 min-w-0 shrink-0 items-center gap-2 text-body-regular text-text-secondary",
			children: e
		}), /* @__PURE__ */ (0, F.jsx)("dd", {
			className: "flex min-w-0 flex-wrap items-center justify-end gap-2 text-left text-body-regular break-all text-text-primary",
			children: t
		})]
	});
}
function Ts({ summary: e, defaultOpen: t = !1, isOpen: n, children: r, trailing: i = !1, row: a = !1, onOpenChange: o, contentClassName: s }) {
	let c = (0, E.useId)(), l = (0, E.useRef)(null), u = (0, E.useRef)(null), d = (0, E.useRef)(!1), [f, p] = (0, E.useState)(n ?? t);
	return (0, E.useLayoutEffect)(() => {
		n !== void 0 && n !== f && l.current && u.current && (us(l.current, u.current, n), p(n));
	}, [n, f]), /* @__PURE__ */ (0, F.jsxs)("details", {
		ref: (e) => {
			l.current = e, e && (n ?? t) && !d.current && (d.current = !0, e.open = !0);
		},
		children: [/* @__PURE__ */ (0, F.jsxs)("summary", {
			"aria-expanded": f,
			"aria-controls": c,
			onClick: (e) => {
				e.preventDefault(), l.current && u.current && (us(l.current, u.current, !f), p(!f), o?.(!f));
			},
			className: P("flex w-full cursor-pointer list-none items-center gap-1 rounded-sm text-body-2-medium text-text-secondary outline-none select-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring", a && "px-5 py-2.5"),
			children: [
				i ? null : /* @__PURE__ */ (0, F.jsx)(Ho, {
					"aria-hidden": !0,
					className: f ? "size-(--icon-inline) shrink-0 rotate-90 transition-transform" : "size-(--icon-inline) shrink-0 transition-transform"
				}),
				e,
				i ? /* @__PURE__ */ (0, F.jsx)(Ho, {
					"aria-hidden": !0,
					className: f ? "ml-auto size-(--icon-inline) shrink-0 -rotate-90 transition-transform" : "ml-auto size-(--icon-inline) shrink-0 rotate-90 transition-transform"
				}) : null
			]
		}), /* @__PURE__ */ (0, F.jsx)("div", {
			ref: u,
			id: c,
			inert: !f,
			children: /* @__PURE__ */ (0, F.jsx)("div", {
				className: P("flex flex-col gap-2", a ? "px-5 pt-0.5" : "pt-3", s),
				children: r
			})
		})]
	});
}
// src/react/pages/login/access-setup.tsx
var Es = "/api/configuration/access/first", Ds = (e) => window.location.assign(e);
function Os({ data: e, navigate: t = Ds }) {
	let [n, r] = (0, E.useState)(!0), [i, a] = (0, E.useState)(""), [o, s] = (0, E.useState)(""), [c, l] = (0, E.useState)({}), [u, d] = (0, E.useState)(""), [f, p] = (0, E.useState)(!1);
	return /* @__PURE__ */ (0, F.jsx)(Wt, {
		title: "访问设置",
		lede: "这台 Peach 还没有访问设置，先决定打开时要不要登录。",
		children: /* @__PURE__ */ (0, F.jsxs)("form", {
			"aria-labelledby": "auth-card-title",
			className: "flex flex-col gap-6",
			onSubmit: async (r) => {
				if (r.preventDefault(), f) return;
				p(!0), d(""), l({});
				let a = n ? {
					mode: "password",
					password: i,
					confirmation: o,
					next: e.next || "/"
				} : {
					mode: "open",
					next: e.next || "/"
				};
				try {
					let e = await fetch(Es, {
						method: "POST",
						credentials: "same-origin",
						body: JSON.stringify(a),
						headers: {
							Accept: "application/json",
							"Content-Type": "application/json"
						}
					}), n = await e.json().catch(() => null);
					if (e.ok) {
						t(n?.url || "/");
						return;
					}
					n?.errors && Object.keys(n.errors).length ? l(n.errors) : d(n?.error || "没能保存访问设置，请重试");
				} catch {
					d("连接不到 Peach，请确认它仍在运行后重试");
				}
				p(!1);
			},
			noValidate: !0,
			children: [
				/* @__PURE__ */ (0, F.jsxs)(Gt, {
					first: !0,
					children: [
						/* @__PURE__ */ (0, F.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, F.jsxs)("div", {
								className: "flex min-w-0 flex-col gap-0.5",
								children: [/* @__PURE__ */ (0, F.jsx)(Yo, {
									id: "access-setup-title",
									elementType: "span",
									children: "访问密码"
								}), /* @__PURE__ */ (0, F.jsx)("p", {
									id: "access-setup-description",
									className: "text-body-2-regular text-text-secondary",
									children: "开启后，访问 Peach 需要先登录。"
								})]
							}), /* @__PURE__ */ (0, F.jsx)(os, {
								"aria-labelledby": "access-setup-title",
								"aria-describedby": "access-setup-description",
								isSelected: n,
								onChange: (e) => {
									r(e), l({});
								}
							})]
						}),
						/* @__PURE__ */ (0, F.jsx)(bs, { children: "局域网访问推荐设置密码。未设置时，同一网络中能连接 Peach 的设备可直接进入。" }),
						n ? /* @__PURE__ */ (0, F.jsx)(ss, {
							label: "访问密码",
							password: i,
							confirmation: o,
							onPassword: (e) => {
								a(e), l({});
							},
							onConfirmation: (e) => {
								s(e), l({});
							},
							passwordError: c.password ? /* @__PURE__ */ (0, F.jsx)("span", {
								role: "alert",
								children: c.password
							}) : void 0,
							passwordHint: "请输入 8–256 个字符。",
							confirmationError: c.confirmation ? /* @__PURE__ */ (0, F.jsx)("span", {
								role: "alert",
								children: c.confirmation
							}) : void 0
						}) : null
					]
				}),
				u ? /* @__PURE__ */ (0, F.jsx)(ns, {
					tone: "error",
					children: u
				}) : null,
				/* @__PURE__ */ (0, F.jsx)(Ht, {
					type: "submit",
					className: "w-full",
					...cs(f),
					children: n ? "设置密码并进入" : "免登录进入"
				})
			]
		})
	});
}
var ks = (e) => /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [
	"在",
	e ? "宿主机" : "运行 Peach 的环境中",
	"执行 ",
	/* @__PURE__ */ (0, F.jsx)("code", {
		className: "wrap-anywhere",
		children: e ? "docker compose exec peach peach token" : "peach token"
	}),
	" 查看。"
] });
function As({ data: e }) {
	return e.mode === "setup" ? /* @__PURE__ */ (0, F.jsx)(Os, { data: e }) : /* @__PURE__ */ (0, F.jsx)(js, { data: e });
}
function js({ data: e }) {
	let t = e.mode === "legacy" || e.mode === "denied", [n, r] = (0, E.useState)(e.error || (e.invalid === "true" ? t ? "访问口令不正确" : "访问密码不正确" : ""));
	return /* @__PURE__ */ (0, F.jsxs)(Wt, {
		title: "Peach",
		children: [e.mode === "denied" ? /* @__PURE__ */ (0, F.jsx)(ns, {
			tone: "warning",
			children: rs
		}) : null, /* @__PURE__ */ (0, F.jsxs)("form", {
			method: "post",
			action: "/login",
			"aria-labelledby": "auth-card-title",
			className: "flex flex-col gap-6",
			children: [
				/* @__PURE__ */ (0, F.jsx)(ts, {
					id: "login-token",
					label: t ? "访问口令" : "访问密码",
					name: "token",
					type: "password",
					maxLength: 256,
					autoComplete: "current-password",
					autoFocus: e.mode !== "denied",
					isRequired: !0,
					isInvalid: n ? !0 : void 0,
					onChange: () => r(""),
					hint: n ? /* @__PURE__ */ (0, F.jsx)("span", {
						role: "alert",
						children: n
					}) : t ? ks(e.mode === "denied") : void 0
				}),
				/* @__PURE__ */ (0, F.jsx)("input", {
					type: "hidden",
					name: "next",
					value: e.next || "/"
				}),
				/* @__PURE__ */ (0, F.jsx)(U, {
					name: "days",
					value: "30",
					defaultSelected: !0,
					children: "保持登录"
				}),
				/* @__PURE__ */ (0, F.jsx)(Ht, {
					type: "submit",
					className: "w-full",
					children: "登录"
				})
			]
		})]
	});
}
// src/configuration-endpoints.ts
var Ms = "/api/pick-folder", Ns = "/api/setup/questions", Ps = "/api/setup", Fs = class extends Error {
	status;
	errors;
	docker;
	constructor(e, t, n, r = !1) {
		super(t), this.status = e, this.errors = n, this.docker = r;
	}
};
async function Is(e, t, n) {
	let r;
	try {
		r = await fetch(e, {
			credentials: "same-origin",
			...t,
			headers: {
				Accept: "application/json",
				...t.body ? { "Content-Type": "application/json" } : {}
			}
		});
	} catch (e) {
		throw t.signal?.aborted ? e : new Fs(0, "连接不到 Peach，请确认它仍在运行后重试");
	}
	let i = await r.json().catch(() => null);
	if (!r.ok) throw new Fs(r.status, i?.error || n, i?.errors, i?.docker === !0);
	return i;
}
var Ls = (e) => Is(Ns, { signal: e }, "没能读取设置题目"), Rs = (e) => Is(Ps, {
	method: "POST",
	body: JSON.stringify(e)
}, "没能完成设置"), zs = (e) => Is(`${Ps}/restore`, {
	method: "POST",
	body: JSON.stringify({ data_root: e })
}, "没能使用此数据目录"), Bs = async (e) => (await Is(Ms, {
	method: "POST",
	body: JSON.stringify({ initial: e })
}, "没能打开文件夹对话框")).path, Vs = (e) => e instanceof Error && e.message || "请求失败，请重试", Hs = 8e3;
// src/react/pages/setup/peach-silhouette.tsx
function Us({ variant: e }) {
	return /* @__PURE__ */ (0, F.jsx)("svg", {
		"data-setup-mark": e,
		viewBox: "0 0 1024 1024",
		fill: "currentColor",
		"aria-hidden": "true",
		focusable: "false",
		children: /* @__PURE__ */ (0, F.jsx)("path", { d: "M274 178C263 155 255 133 250 114C330 67 432 79 502 164C557 72 666 20 774 61C769 105 754 147 730 179C861 202 950 324 956 477C969 682 812 855 512 977C211 851 54 674 68 475C76 321 144 215 274 178Z" })
	});
}
// src/react/pages/setup/setup-scene.tsx
function Ws() {
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		"data-setup-mini-library": "",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("div", {
				"data-setup-mini-toolbar": "",
				children: [
					/* @__PURE__ */ (0, F.jsx)("span", {}),
					/* @__PURE__ */ (0, F.jsx)("span", {}),
					/* @__PURE__ */ (0, F.jsx)("span", {}),
					/* @__PURE__ */ (0, F.jsx)(Jo, {})
				]
			}),
			/* @__PURE__ */ (0, F.jsxs)("div", {
				"data-setup-mini-posters": "",
				children: [
					/* @__PURE__ */ (0, F.jsx)("div", { children: /* @__PURE__ */ (0, F.jsx)(qo, {}) }),
					/* @__PURE__ */ (0, F.jsx)("div", {}),
					/* @__PURE__ */ (0, F.jsx)("div", {})
				]
			}),
			/* @__PURE__ */ (0, F.jsxs)("div", {
				"data-setup-mini-lines": "",
				children: [/* @__PURE__ */ (0, F.jsx)("span", {}), /* @__PURE__ */ (0, F.jsx)("span", {})]
			})
		]
	});
}
function Gs({ step: e }) {
	let t = e === 0 ? "你的私人媒体空间。" : e === 1 ? "让文件成为馆藏。" : e === 2 ? "从书桌，到手边。" : e === 3 ? "全都准备好了。" : e === "restore" ? "从熟悉的地方继续。" : "馆藏，准备开启。", n = e === 0 ? "把喜欢的内容，整理成自己的收藏。" : e === 1 ? "按媒体库归类，文件保留在原来的位置。" : e === 2 ? "电脑与手机，连接同一套 Peach。" : e === 3 ? "确认后保存，扫描按你的选择开始。" : e === "restore" ? "沿用原来的配置与记录，接着使用。" : "进入 Peach，开始探索你的收藏。";
	return /* @__PURE__ */ (0, F.jsxs)("aside", {
		"data-setup-scene": "",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("div", {
				"data-setup-scene-brand": "",
				children: [/* @__PURE__ */ (0, F.jsx)(Us, { variant: "brand" }), /* @__PURE__ */ (0, F.jsx)("span", { children: "Peach" })]
			}),
			/* @__PURE__ */ (0, F.jsx)("div", {
				"data-setup-scene-art": "",
				"aria-hidden": "true",
				children: e === 0 ? /* @__PURE__ */ (0, F.jsx)(Us, { variant: "welcome" }) : e === 3 || e === "done" ? /* @__PURE__ */ (0, F.jsx)("img", {
					"data-setup-original-mark": "",
					src: "/peach-logo.png",
					alt: "",
					width: 148,
					height: 148
				}) : e === 2 ? /* @__PURE__ */ (0, F.jsxs)("div", {
					"data-setup-devices": "",
					children: [/* @__PURE__ */ (0, F.jsxs)("div", {
						"data-setup-macbook": "",
						children: [/* @__PURE__ */ (0, F.jsx)("img", {
							src: "/setup-assets/1/macbook-640.webp",
							srcSet: "/setup-assets/1/macbook-320.webp 320w, /setup-assets/1/macbook-640.webp 640w",
							sizes: "(max-width: 700px) 130px, 312px",
							width: 640,
							height: 421,
							alt: "",
							loading: "lazy",
							decoding: "async"
						}), /* @__PURE__ */ (0, F.jsx)("div", {
							"data-setup-device-screen": "",
							children: /* @__PURE__ */ (0, F.jsx)(Ws, {})
						})]
					}), /* @__PURE__ */ (0, F.jsxs)("div", {
						"data-setup-iphone": "",
						children: [/* @__PURE__ */ (0, F.jsx)("img", {
							src: "/setup-assets/1/iphone-320.webp",
							srcSet: "/setup-assets/1/iphone-160.webp 160w, /setup-assets/1/iphone-320.webp 320w",
							sizes: "(max-width: 700px) 36px, 81px",
							width: 320,
							height: 654,
							alt: "",
							loading: "lazy",
							decoding: "async"
						}), /* @__PURE__ */ (0, F.jsx)("div", {
							"data-setup-device-screen": "",
							children: /* @__PURE__ */ (0, F.jsx)(Ws, {})
						})]
					})]
				}) : /* @__PURE__ */ (0, F.jsxs)("div", {
					"data-setup-library-scene": "",
					children: [/* @__PURE__ */ (0, F.jsx)(Ws, {}), /* @__PURE__ */ (0, F.jsxs)("div", {
						"data-setup-scene-badge": "",
						children: [/* @__PURE__ */ (0, F.jsx)(Wo, {}), /* @__PURE__ */ (0, F.jsx)("span", { children: "你的媒体库" })]
					})]
				})
			}, e),
			/* @__PURE__ */ (0, F.jsxs)("div", {
				"data-setup-scene-caption": "",
				children: [/* @__PURE__ */ (0, F.jsx)("p", {
					className: "text-title-2-medium",
					"data-copy-key": `setup.scene.title.${e}`,
					children: t
				}), /* @__PURE__ */ (0, F.jsx)("p", {
					className: "text-body-2-regular",
					"data-copy-key": `setup.scene.description.${e}`,
					children: n
				})]
			}, `caption-${e}`)
		]
	});
}
function Ks({ step: e, children: t }) {
	return /* @__PURE__ */ (0, F.jsx)("main", {
		"data-setup-page": "",
		children: /* @__PURE__ */ (0, F.jsxs)("div", {
			"data-setup-window": "",
			"data-setup-step": e,
			children: [/* @__PURE__ */ (0, F.jsx)(Gs, { step: e }), t]
		})
	});
}
// src/react/pages/setup/setup-done.tsx
function qs({ done: e }) {
	let t = (0, E.useRef)(null);
	return (0, E.useEffect)(() => {
		document.title = "Peach · 设置完成", t.current?.focus();
	}, []), (0, E.useEffect)(() => {
		let t = e.redirect;
		if (!t) return;
		let n = setTimeout(() => location.assign(t), Hs);
		return () => clearTimeout(n);
	}, [e.redirect]), /* @__PURE__ */ (0, F.jsx)(Ks, {
		step: "done",
		children: /* @__PURE__ */ (0, F.jsxs)("section", {
			"data-setup-form-panel": "",
			"aria-labelledby": "auth-card-title",
			children: [
				/* @__PURE__ */ (0, F.jsx)("div", {
					"data-setup-top": "",
					children: /* @__PURE__ */ (0, F.jsx)("span", {
						className: "text-body-2-regular text-text-secondary",
						children: "设置完成"
					})
				}),
				/* @__PURE__ */ (0, F.jsx)("div", {
					"data-setup-step-scroll": "",
					children: /* @__PURE__ */ (0, F.jsxs)("div", {
						"data-setup-step-content": "",
						children: [/* @__PURE__ */ (0, F.jsxs)("header", {
							"data-setup-step-heading": "",
							children: [/* @__PURE__ */ (0, F.jsx)("h1", {
								id: "auth-card-title",
								className: "text-title-1-semibold text-text-primary",
								children: "可以开始使用了"
							}), /* @__PURE__ */ (0, F.jsx)("p", {
								className: "text-body-regular text-text-secondary",
								children: "你的 Peach 已准备就绪。"
							})]
						}), /* @__PURE__ */ (0, F.jsxs)("div", { children: [/* @__PURE__ */ (0, F.jsx)("p", {
							className: "text-body-regular text-text-primary",
							children: e.restored ? "已连接已有数据目录。" : "设置已保存，之后可以在配置页里改。"
						}), /* @__PURE__ */ (0, F.jsx)(Ts, {
							summary: "运行信息",
							children: /* @__PURE__ */ (0, F.jsx)(Cs, { children: e.facts.map((e) => /* @__PURE__ */ (0, F.jsxs)(ws, {
								term: e.term,
								children: [e.value, e.install_tool ? /* @__PURE__ */ (0, F.jsx)("span", {
									className: "text-text-secondary",
									children: "可在配置页「应用与维护」里安装。"
								}) : e.download_url ? /* @__PURE__ */ (0, F.jsx)(Ss, {
									href: e.download_url,
									children: e.download_label ?? e.download_url
								}) : null]
							}, e.term)) })
						})] })]
					})
				}),
				/* @__PURE__ */ (0, F.jsx)("footer", {
					"data-setup-footer": "",
					"data-setup-footer-end": "",
					"data-copy-interact": !0,
					children: /* @__PURE__ */ (0, F.jsx)(Ut, {
						ref: t,
						href: e.url,
						children: "进入 Peach"
					})
				})
			]
		})
	});
}
// src/react/boardui/components/base/buttons/icon-button.tsx
var Js = zt({
	base: "relative inline-flex shrink-0 items-center justify-center overflow-visible rounded-2lg bg-background-primary-default text-foreground-icon-primary border border-border-button-default shadow-xs select-none cursor-pointer transition-[background-color,border-color,box-shadow,color] duration-150 ease outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus-ring hover:bg-background-primary-hover hover:border-border-button-hover active:bg-background-primary-active active:border-border-button-active disabled:cursor-not-allowed disabled:bg-background-primary-disabled disabled:border-border-button-default disabled:text-icon-button-disabled-foreground disabled:opacity-60 disabled:shadow-none",
	size: {
		medium: "size-9",
		small: "size-8"
	},
	icon: {
		medium: "size-5 shrink-0",
		small: "size-4 shrink-0"
	}
});
function Ys({ icon: e, size: t = "medium", className: n, type: r = "button", ref: i, ...a }) {
	return /* @__PURE__ */ (0, F.jsx)("button", {
		ref: i,
		type: r,
		className: P(Js.base, Js.size[t], n),
		...a,
		children: /* @__PURE__ */ (0, F.jsx)(e, {
			className: Js.icon[t],
			"aria-hidden": !0
		})
	});
}
// node_modules/motion-utils/dist/es/clamp.mjs
var Xs = (e, t, n) => n > t ? t : n < e ? e : n, Zs = {};
// node_modules/motion-utils/dist/es/memo.mjs
/*#__NO_SIDE_EFFECTS__*/
function Qs(e) {
	let t;
	return () => (t === void 0 && (t = e()), t);
}
// node_modules/motion-utils/dist/es/noop.mjs
var $s = /* @__NO_SIDE_EFFECTS__ */ (e) => e, ec = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, tc = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, nc = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", rc = {
	delta: 0,
	timestamp: 0,
	isProcessing: !1
}, ic;
function ac() {
	ic = void 0;
}
var oc = {
	now: () => (ic === void 0 && oc.set(rc.isProcessing || Zs.useManualTiming ? rc.timestamp : performance.now()), ic),
	set: (e) => {
		ic = e, queueMicrotask(ac);
	}
}, sc = (e, t, n = 10) => {
	let r = "", i = Math.max(Math.round(t / n), 2);
	for (let t = 0; t < i; t++) r += Math.round(e(t / (i - 1)) * 1e4) / 1e4 + ", ";
	return `linear(${r.substring(0, r.length - 2)})`;
}, cc = 2e4;
function lc(e, t = 50, n = cc, r) {
	let i = 0, a = e.next(i);
	for (r?.push(a.value); !a.done && i < n;) i += t, a = e.next(i), r?.push(a.value);
	return i >= n ? Infinity : i;
}
// node_modules/motion-dom/dist/es/animation/generators/utils/create-generator-easing.mjs
function uc(e, t = 100, n) {
	let { keyframes: r, velocity: i } = e, a = r && r[r.length - 1] - r[0], o = n({
		...e,
		velocity: i && a ? i * t / a : i,
		keyframes: [0, t]
	}), s = Math.min(lc(o), cc);
	return {
		type: "keyframes",
		ease: (e) => o.next(s * e).value / t,
		duration: /* @__PURE__ */ tc(s)
	};
}
// node_modules/motion-dom/dist/es/animation/generators/spring.mjs
var dc = 100, fc = 10, pc = 1, mc = 800, hc = .3, gc = .3, _c = .01, vc = 2, yc = .005, bc = .5, xc = .01, Sc = 10, Cc = .05, wc = (e) => e < 0 ? 1 / Math.max(1 + e, Cc) : Math.max(1 - e, Cc);
function Tc(e, t) {
	if (!(e > 1)) return 1;
	let n = Math.sqrt(e * e - 1), r = e - n, i = e + n, a = 2 * n * Math.exp(-t) * (1 + t);
	return Oc((e) => i * Math.exp(-r * e) - r * Math.exp(-i * e) - a, (e) => Math.exp(-i * e) - Math.exp(-r * e), t) / t;
}
function Ec(e, t) {
	return e * Math.sqrt(1 - t * t);
}
var Dc = 12;
function Oc(e, t, n) {
	let r = n;
	for (let n = 1; n < Dc; n++) r -= e(r) / t(r);
	return r;
}
var kc = .001;
function Ac({ duration: e = mc, bounce: t = hc }) {
	let n, r, i = wc(t);
	e = Xs(xc, Sc, /* @__PURE__ */ tc(e)), i < 1 ? (n = (t) => {
		let n = t * i, r = n * e, a = Ec(t, i), o = Math.exp(-r);
		return kc - n / a * o;
	}, r = (t) => {
		let r = t * i * e, a = i * i * t * t * e, o = Math.exp(-r), s = Ec(t * t, i);
		return (-n(t) + kc > 0 ? -1 : 1) * -a * o / s;
	}) : (n = (t) => -.001 + Math.exp(-t * e) * (t * e + 1), r = (t) => Math.exp(-t * e) * (-t * (e * e)));
	let a = 5 / e, o = Oc(n, r, a), s = o * Tc(i, o * e), c = s * s;
	return {
		stiffness: c,
		damping: i * 2 * Math.sqrt(c),
		duration: /* @__PURE__ */ ec(e)
	};
}
var jc = (e, t) => (t ? e >= 0 : e > 0) && e < Infinity;
function Mc(e, t) {
	if (jc(e, t)) return e;
}
function Nc(e) {
	let t = Mc(e.stiffness), n = Mc(e.damping, !0), r = Mc(e.mass), i = {
		...e,
		stiffness: t ?? dc,
		damping: n ?? fc,
		mass: r ?? pc,
		isResolvedFromDuration: !1,
		isTimeDefined: (t ?? n ?? r) === void 0 && (e.duration !== void 0 || e.bounce !== void 0)
	};
	if (i.isTimeDefined) {
		if (e.visualDuration) {
			let t = wc(e.bounce || 0), n = 2 * Math.PI / (e.visualDuration * 1.2) * Tc(t, 2 * Math.PI / 1.2);
			i.stiffness = n * n, i.damping = 2 * t * Math.sqrt(i.stiffness);
		} else Object.assign(i, Ac(i)), i.isResolvedFromDuration = !0;
		jc(i.stiffness) && jc(i.damping, !0) || (i.stiffness = dc, i.damping = fc);
	}
	return i;
}
function Pc(e = gc, t = hc) {
	let n = typeof e == "object" ? e : {
		visualDuration: e,
		keyframes: [0, 1],
		bounce: t
	}, r = n.keyframes[0], i = n.keyframes[n.keyframes.length - 1], a = {
		done: !1,
		value: r
	}, { stiffness: o, damping: s, mass: c, duration: l, isResolvedFromDuration: u, isTimeDefined: d } = Nc({ ...n }), f = (e) => d ? 0 : -/* @__PURE__ */ tc(e), p = s / (2 * Math.sqrt(o * c)), m = /* @__PURE__ */ tc(Math.sqrt(o / c)), h = p * m, g = {
		target: i,
		delta: i - r,
		velocity: f(n.velocity || 0) || 0,
		restSpeed: 0,
		restDelta: 0
	}, _ = () => {
		let e = Math.abs(g.delta) < 5;
		g.restSpeed = n.restSpeed || (e ? _c : vc), g.restDelta = n.restDelta || (e ? yc : bc);
	};
	_();
	let v, y, b;
	if (p < 1) {
		let e = Ec(m, p), t = {
			A: 0,
			sinC: 0,
			cosC: 0,
			t: -1,
			env: 0,
			sin: 0,
			cos: 0
		};
		b = () => {
			t.A = (g.velocity + h * g.delta) / e, t.sinC = h * t.A + g.delta * e, t.cosC = h * g.delta - t.A * e;
		};
		let n = (n) => {
			n !== t.t && (t.t = n, t.env = Math.exp(-h * n), t.sin = Math.sin(e * n), t.cos = Math.cos(e * n));
		};
		v = (e) => (n(e), g.target - t.env * (t.A * t.sin + g.delta * t.cos)), y = (e) => (n(e), t.env * (t.sinC * t.sin + t.cosC * t.cos));
	} else if (p === 1) {
		v = (e) => g.target - Math.exp(-m * e) * (g.delta + (g.velocity + m * g.delta) * e);
		let e = { C: 0 };
		b = () => {
			e.C = g.velocity + m * g.delta;
		}, y = (t) => Math.exp(-m * t) * (m * e.C * t - g.velocity);
	} else {
		let e = m * Math.sqrt(p * p - 1), t = h - e, n = h + e, r = e < 1 || d ? Infinity : 300 / e, i = (e, t) => Math.exp(t > r ? (h - e) * r - h * t : -e * t), a = {
			S: 0,
			F: 0
		};
		b = () => {
			let t = (g.velocity + h * g.delta) / e;
			a.S = (g.delta + t) / 2, a.F = (g.delta - t) / 2;
		}, v = (e) => g.target - a.S * i(t, e) - a.F * i(n, e), y = (e) => t * a.S * i(t, e) + n * a.F * i(n, e);
	}
	b();
	let x = u && l || null, S = {
		calculatedDuration: x,
		retarget: (e, t) => {
			g.target = e[e.length - 1], g.delta = g.target - e[0], g.velocity = f(t), n.restSpeed && n.restDelta || _(), S.calculatedDuration = x, a.done = !1, b();
		},
		velocity: (e) => /* @__PURE__ */ ec(y(e)),
		next: (e) => {
			let t = v(e);
			if (u) a.done = e >= l;
			else {
				let n = /* @__PURE__ */ ec(y(e));
				a.done = Math.abs(n) <= g.restSpeed && Math.abs(g.target - t) <= g.restDelta;
			}
			return a.value = a.done ? g.target : t, a;
		},
		toString: () => {
			let e = Math.min(lc(S), cc), t = sc((t) => S.next(e * t).value, e, 30);
			return e + "ms " + t;
		},
		toTransition: () => {}
	};
	return S;
}
var Fc = /* @__PURE__ */ Object.assign(Pc, { applyToOptions: (e) => {
	let t = uc(e, 100, Pc);
	return e.ease = t.ease, e.duration = /* @__PURE__ */ ec(t.duration), e.type = "keyframes", e;
} });
// node_modules/motion-dom/dist/es/animation/keyframes/get-final.mjs
function Ic(e, { repeat: t, repeatType: n = "loop" }, r, i = 1) {
	let a, o, s = 0;
	for (let t = 0; t < e.length; t++) {
		let n = e[t];
		n !== null && (s++ || (a = n), o = n);
	}
	let c = i < 0 || t && n !== "loop" && t % 2 == 1 ? 0 : s - 1;
	return !c || r === void 0 ? c ? o : a : r;
}
// node_modules/motion-dom/dist/es/animation/utils/notify-inspector.mjs
function Lc(e, t) {
	return {
		kind: e,
		animation: t,
		timestamp: oc.now(),
		frameTimestamp: rc.timestamp,
		frameIsProcessing: rc.isProcessing
	};
}
function Rc(e, t, n) {
	let r = globalThis.__MOTION_INSPECT__;
	if (r) try {
		r({
			...Lc("animation-start", e),
			options: n ? {
				...t,
				...n
			} : t
		});
	} catch {}
}
// node_modules/motion-dom/dist/es/animation/utils/WithPromise.mjs
var zc = class {
	constructor() {
		this.isResolved = !1;
	}
	get finished() {
		return this._finished ||= this.isResolved ? Promise.resolve() : new Promise((e) => {
			this._resolve = e;
		}), this._finished;
	}
	updateFinished() {
		this._finished = this._resolve = void 0, this.isResolved = !1;
	}
	notifyFinished() {
		this.isResolved = !0, this._resolve?.();
	}
	then(e, t) {
		return this.finished.then(e, t);
	}
};
// node_modules/motion-dom/dist/es/animation/keyframes/utils/fill-wildcards.mjs
function Bc(e) {
	for (let t = 1; t < e.length; t++) e[t] ?? (e[t] = e[t - 1]);
}
// node_modules/motion-dom/dist/es/render/dom/is-css-var.mjs
var Vc = (e) => e.startsWith("--");
// node_modules/motion-dom/dist/es/render/dom/style-set.mjs
function Hc(e, t, n) {
	Vc(t) ? e.style.setProperty(t, n) : e.style[t] = n;
}
// node_modules/motion-dom/dist/es/utils/supports/flags.mjs
var Uc = {};
// node_modules/motion-dom/dist/es/utils/supports/memo.mjs
function Wc(e, t) {
	let n = /* @__PURE__ */ Qs(e);
	return () => Uc[t] ?? n();
}
// node_modules/motion-dom/dist/es/utils/supports/scroll-timeline.mjs
var Gc = /* @__PURE__ */ Wc(() => window.ScrollTimeline !== void 0, "scrollTimeline"), Kc = /*@__PURE__*/ Wc(() => {
	try {
		document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
	} catch {
		return !1;
	}
	return !0;
}, "linearEasing"), qc = ([e, t, n, r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`, Jc = {
	linear: "linear",
	ease: "ease",
	easeIn: "ease-in",
	easeOut: "ease-out",
	easeInOut: "ease-in-out",
	circIn: /*@__PURE__*/ qc([
		0,
		.65,
		.55,
		1
	]),
	circOut: /*@__PURE__*/ qc([
		.55,
		0,
		1,
		.45
	]),
	backIn: /*@__PURE__*/ qc([
		.31,
		.01,
		.66,
		-.59
	]),
	backOut: /*@__PURE__*/ qc([
		.33,
		1.53,
		.69,
		.99
	])
};
// node_modules/motion-dom/dist/es/animation/waapi/easing/map-easing.mjs
function Yc(e, t) {
	if (e) return typeof e == "function" ? Kc() ? sc(e, t) : "ease-out" : /* @__PURE__ */ nc(e) ? qc(e) : Array.isArray(e) ? e.map((e) => Yc(e, t) || Jc.easeOut) : Jc[e];
}
// node_modules/motion-dom/dist/es/animation/waapi/start-waapi-animation.mjs
function Xc(e, t, n, { delay: r = 0, duration: i = 300, repeat: a = 0, repeatType: o = "loop", ease: s = "easeOut", times: c } = {}, l = void 0) {
	let u = { [t]: n };
	c && (u.offset = c);
	let d = Yc(s, i);
	Array.isArray(d) && (u.easing = d);
	let f = {
		delay: r,
		duration: i,
		easing: Array.isArray(d) ? "linear" : d,
		fill: "both",
		iterations: a + 1,
		direction: o === "reverse" ? "alternate" : "normal"
	};
	return l && (f.pseudoElement = l), e.animate(u, f);
}
// node_modules/motion-dom/dist/es/animation/generators/utils/is-generator.mjs
function Zc(e) {
	return typeof e == "function" && "applyToOptions" in e;
}
// node_modules/motion-dom/dist/es/animation/waapi/utils/apply-generator.mjs
function Qc({ type: e, ...t }) {
	return Zc(e) && Kc() ? e.applyToOptions(t) : (t.duration ??= 300, t.ease ??= "easeOut", t);
}
// node_modules/motion-dom/dist/es/animation/NativeAnimation.mjs
var $c = class extends zc {
	constructor(e) {
		if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !e) return;
		let { element: t, name: n, keyframes: r, pseudoElement: i, allowFlatten: a = !1, finalKeyframe: o, onComplete: s } = e;
		this.isPseudoElement = !!i, this.allowFlatten = a, this.options = e;
		let c = Qc(e);
		this.animation = Xc(t, n, r, c, i), c.autoplay === !1 && this.animation.pause(), this.animation.onfinish = this.onFinish = () => {
			if (this.animation.onfinish = null, this.finishedTime = this.time, !i) {
				let e = Ic(r, this.options, o, this.speed);
				this.updateMotionValue?.(e), Hc(t, n, e), this.animation.cancel();
			}
			s?.(), this.notifyFinished();
		}, Rc(this, e, c);
	}
	play() {
		this.isStopped || (this.manualStartTime = null, this.animation.onfinish = this.onFinish, this.animation.play(), this.state === "finished" && this.updateFinished());
	}
	pause() {
		this.animation.pause();
	}
	complete() {
		this.isStopped || (this.animation.onfinish = this.onFinish), this.animation.finish?.();
	}
	cancel() {
		this.animation.onfinish = null;
		try {
			this.animation.cancel();
		} catch {}
	}
	stop() {
		this.isStopped || (this.isStopped = !0, this.state !== "idle" && this.finishedTime === null && (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel()));
	}
	commitStyles() {
		let e = this.options?.element;
		!this.isPseudoElement && e?.isConnected && this.animation.commitStyles?.();
	}
	get duration() {
		let e = this.animation.effect?.getComputedTiming?.().duration || 0;
		return /* @__PURE__ */ tc(Number(e));
	}
	get iterationDuration() {
		let { delay: e = 0 } = this.options || {};
		return this.duration + /* @__PURE__ */ tc(e);
	}
	get time() {
		return /* @__PURE__ */ tc(Number(this.animation.currentTime) || 0);
	}
	set time(e) {
		let t = this.finishedTime !== null;
		this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ ec(e), t && (this.animation.pause(), this.updateFinished());
	}
	get speed() {
		return this.animation.playbackRate;
	}
	set speed(e) {
		e < 0 && (this.finishedTime = null), this.animation.playbackRate = e;
	}
	get state() {
		return this.finishedTime === null ? this.animation.playState : "finished";
	}
	get startTime() {
		return this.manualStartTime ?? Number(this.animation.startTime);
	}
	set startTime(e) {
		this.manualStartTime = this.animation.startTime = e;
	}
	attachTimeline({ timeline: e, onAttach: t, observe: n }) {
		return this.allowFlatten && this.animation.effect?.updateTiming({ easing: "linear" }), this.animation.onfinish = this.onFinish = null, e && Gc() ? (this.animation.timeline = e, t?.(this.animation), $s) : n(this);
	}
}, el = class {
	constructor(e) {
		this.stop = () => {
			for (let e of this.animations) e.stop();
		}, this.animations = e.filter(Boolean);
	}
	get finished() {
		return Promise.all(this.animations.map((e) => e.finished));
	}
	getAll(e) {
		return this.animations[0][e];
	}
	attachTimeline(e) {
		let t = this.animations.map((t) => t.attachTimeline(e));
		return () => {
			t.forEach((e, t) => {
				e && e(), this.animations[t].stop();
			});
		};
	}
	get time() {
		return this.getAll("time");
	}
	set time(e) {
		for (let t of this.animations) t.time = e;
	}
	get speed() {
		return this.getAll("speed");
	}
	set speed(e) {
		for (let t of this.animations) t.speed = e;
	}
	get state() {
		return this.getAll("state");
	}
	get startTime() {
		return this.getAll("startTime");
	}
	get duration() {
		return tl(this.animations, "duration");
	}
	get iterationDuration() {
		return tl(this.animations, "iterationDuration");
	}
	play() {
		for (let e of this.animations) e.play();
	}
	pause() {
		for (let e of this.animations) e.pause();
	}
	cancel() {
		for (let e of this.animations) e.cancel();
	}
	complete() {
		for (let e of this.animations) e.complete();
	}
};
function tl(e, t) {
	let n = 0;
	for (let r = 0; r < e.length; r++) {
		let i = e[r][t];
		i !== null && i > n && (n = i);
	}
	return n;
}
// node_modules/motion-dom/dist/es/animation/GroupAnimationWithThen.mjs
var nl = class extends el {
	then(e, t) {
		return this.finished.finally(e).then(() => {});
	}
}, rl = /* @__PURE__ */ new WeakMap(), il = (e, t = "") => `${e}:${t}`;
function al(e) {
	let t = rl.get(e);
	return t || (t = /* @__PURE__ */ new Map(), rl.set(e, t)), t;
}
// node_modules/motion-dom/dist/es/animation/utils/resolve-transition.mjs
function ol(e, t) {
	if (e?.inherit && t) {
		let { inherit: n, ...r } = e;
		return {
			...t,
			...r
		};
	}
	return e;
}
// node_modules/motion-dom/dist/es/animation/utils/get-value-transition.mjs
function sl(e, t) {
	let n = e?.[t] ?? e?.default ?? e;
	return n === e ? n : ol(n, e);
}
// node_modules/motion-dom/dist/es/animation/waapi/utils/px-values.mjs
var cl = /* @__PURE__ */ new Set(/* @__PURE__ */ "borderWidth.borderTopWidth.borderRightWidth.borderBottomWidth.borderLeftWidth.borderRadius.borderTopLeftRadius.borderTopRightRadius.borderBottomRightRadius.borderBottomLeftRadius.width.maxWidth.height.maxHeight.top.right.bottom.left.inset.insetBlock.insetBlockStart.insetBlockEnd.insetInline.insetInlineStart.insetInlineEnd.padding.paddingTop.paddingRight.paddingBottom.paddingLeft.paddingBlock.paddingBlockStart.paddingBlockEnd.paddingInline.paddingInlineStart.paddingInlineEnd.margin.marginTop.marginRight.marginBottom.marginLeft.marginBlock.marginBlockStart.marginBlockEnd.marginInline.marginInlineStart.marginInlineEnd.fontSize.backgroundPositionX.backgroundPositionY".split("."));
// node_modules/motion-dom/dist/es/animation/keyframes/utils/apply-px-defaults.mjs
function ll(e, t) {
	for (let n = 0; n < e.length; n++) typeof e[n] == "number" && cl.has(t) && (e[n] = e[n] + "px");
}
// node_modules/motion-dom/dist/es/scope/active.mjs
var ul = {};
// node_modules/motion-dom/dist/es/utils/resolve-elements.mjs
function dl(e, t, n) {
	if (e == null) return [];
	if (e instanceof EventTarget) return [e];
	if (typeof e == "string") {
		let r = t ? t.current : ul.current?.root || document, i = n?.[e] ?? r.querySelectorAll(e);
		return i ? Array.from(i) : [];
	}
	return Array.from(e).filter((e) => e != null);
}
// node_modules/motion-dom/dist/es/render/dom/style-computed.mjs
function fl(e, t) {
	let n = window.getComputedStyle(e);
	return Vc(t) ? n.getPropertyValue(t) : n[t];
}
// node_modules/framer-motion/dist/es/animation/animators/waapi/animate-elements.mjs
function pl(e, t, n, r) {
	let i = [];
	return ml(i, e, t, n, r), hl(i);
}
function ml(e, t, n, r, i) {
	if (t == null) return;
	let a = dl(t, i), o = a.length;
	for (let t = 0; t < o; t++) {
		let i = a[t], s = { ...r };
		typeof s.delay == "function" && (s.delay = s.delay(t, o));
		for (let t in n) {
			let r = n[t];
			Array.isArray(r) || (r = [r]);
			let a = { ...sl(s, t) };
			a.duration &&= /* @__PURE__ */ ec(a.duration), a.delay &&= /* @__PURE__ */ ec(a.delay);
			let o = al(i), c = il(t, a.pseudoElement || ""), l = o.get(c);
			l && l.stop(), e.push({
				map: o,
				key: c,
				unresolvedKeyframes: r,
				options: {
					...a,
					element: i,
					name: t,
					allowFlatten: !s.type && !s.ease
				}
			});
		}
	}
}
function hl(e) {
	for (let t = 0; t < e.length; t++) {
		let { unresolvedKeyframes: n, options: r } = e[t], { element: i, name: a, pseudoElement: o } = r;
		!o && n[0] === null && (n[0] = fl(i, a)), Bc(n), ll(n, a), !o && n.length < 2 && n.unshift(fl(i, a)), r.keyframes = n;
	}
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let { map: r, key: i, options: a } = e[n], o = new $c(a);
		r.set(i, o), o.finished.finally(() => r.delete(i)), t.push(o);
	}
	return t;
}
var gl = /*@__PURE__*/ ((e) => {
	function t(t, n, r) {
		return new nl(pl(t, n, r, e));
	}
	return t;
})(), _l = {
	selection: {
		type: Fc,
		duration: .16,
		bounce: 0
	},
	hover: {
		type: Fc,
		duration: .08,
		bounce: 0
	}
};
function W(e) {
	let [t, n] = (0, E.useState)(null);
	return (0, E.useLayoutEffect)(() => {
		if (!t) return;
		let n = document.createElement("span");
		n.setAttribute("aria-hidden", "true"), n.dataset.movingSurface = e, n.hidden = !0, t.prepend(n), t.dataset.surfaceHost = e;
		let r = matchMedia("(prefers-reduced-motion: reduce)"), i = matchMedia("(hover: hover) and (pointer: fine)"), a = !1, o = null, s = null, c = "", l, u = e === "selection" ? "[role=\"tab\"],label[data-rac]" : "[role=\"option\"],button", d = () => [...t.querySelectorAll(u)].filter((e) => e.getBoundingClientRect().width > 0), f = () => {
			l?.cancel(), n.hidden = !0, s = null, c = "", delete t.dataset.surfaceReady;
		}, p = (u = !1) => {
			let p = d(), m = p.find((e) => e.hasAttribute("data-selected") || e.getAttribute("aria-selected") === "true"), h = e === "selection" ? m : o;
			if (!h || !t.contains(h) || !p.includes(h) || e === "hover" && (!i.matches || !a || p.length > 8 || h.matches(":disabled,[aria-disabled=\"true\"],[data-disabled]"))) {
				f();
				return;
			}
			let g = h.getBoundingClientRect(), _ = t.getBoundingClientRect(), v = _.width / t.offsetWidth || 1, y = _.height / t.offsetHeight || 1, b = (g.left - _.left) / v + t.scrollLeft - t.clientLeft, x = (g.top - _.top) / y + t.scrollTop - t.clientTop, S = g.width / v, C = g.height / y, w = `${b},${x},${S},${C}`;
			if (a && i.matches && !r.matches && s === h && c === w) return;
			let T = n.hidden ? null : n.getBoundingClientRect();
			l?.cancel(), n.hidden = !1, n.style.width = `${S}px`, n.style.height = `${C}px`;
			let ee = `translate(${b}px, ${x}px) scale(1, 1)`;
			if (u && a && !r.matches && T && s !== h) {
				let r = `translate(${(T.left - _.left) / v + t.scrollLeft - t.clientLeft}px, ${(T.top - _.top) / y + t.scrollTop - t.clientTop}px) scale(${T.width / v / S}, ${T.height / y / C})`;
				l = gl(n, { transform: [r, ee] }, _l[e]);
			} else n.style.transform = ee;
			s = h, c = w, t.dataset.surfaceReady = "";
		}, m = (t) => {
			if (a = t.pointerType === "mouse" && i.matches, e === "hover") {
				let e = t.target instanceof Element ? t.target.closest(u) : null;
				if (e === o && a) return;
				o = e, p(!0);
			}
		}, h = () => {
			a = !1, e === "hover" ? f() : p();
		}, g = () => {
			o = null, e === "hover" && f();
		}, _ = () => p(), v = new MutationObserver(() => p(!0)), y = new ResizeObserver(_), b = () => {
			y.disconnect(), y.observe(t), d().forEach((e) => y.observe(e));
		}, x = new MutationObserver(() => {
			b(), p();
		});
		return v.observe(t, {
			subtree: !0,
			attributes: !0,
			attributeFilter: [
				"data-selected",
				"aria-selected",
				"data-disabled",
				"aria-disabled"
			]
		}), x.observe(t, {
			childList: !0,
			subtree: !0
		}), b(), p(), t.addEventListener("pointerdown", m, !0), t.addEventListener("pointermove", m), t.addEventListener("pointerleave", g), t.addEventListener("keydown", h, !0), t.addEventListener("scroll", _, !0), r.addEventListener("change", _), i.addEventListener("change", _), () => {
			l?.cancel(), v.disconnect(), x.disconnect(), y.disconnect(), t.removeEventListener("pointerdown", m, !0), t.removeEventListener("pointermove", m), t.removeEventListener("pointerleave", g), t.removeEventListener("keydown", h, !0), t.removeEventListener("scroll", _, !0), r.removeEventListener("change", _), i.removeEventListener("change", _), n.remove(), delete t.dataset.surfaceHost, delete t.dataset.surfaceReady;
		};
	}, [t, e]), n;
}
Object.fromEntries(Object.entries({
	fresh: "/unseen",
	later: "/watch-later",
	flagged: "/flagged",
	ads: "/junk-files"
}).map(([e, t]) => [t, e])), typeof Intl < "u" && typeof Intl.Segmenter == "function" && new Intl.Segmenter(void 0, { granularity: "grapheme" }), { ...gs };
// src/ui-kit/scroll.ts
var vl = /* @__PURE__ */ new Map(), yl, bl = 240, xl = 50, Sl = 70, Cl = .55, wl = .35, Tl = 480;
function El(e, t) {
	return !e || !(t > 0) ? 0 : Math.sign(e) * (1 - 1 / (Math.abs(e) * Cl / t + 1)) * t;
}
function Dl(e) {
	let t = null, n = 0, r = () => typeof e.animate != "function" || matchMedia("(prefers-reduced-motion:reduce)").matches, i = () => {
		t = null, n || e.classList.remove("edgepull");
	}, a = (n, r) => {
		t?.cancel(), e.classList.add("edgepull"), t = e.animate(n, { duration: r }), t.onfinish = i;
	};
	return {
		drag(i) {
			r() || (t?.cancel(), t = null, n = -El(i, e.clientWidth), e.classList.toggle("edgepull", !!n), n ? e.style.setProperty("--edge-pull", `${n}px`) : e.style.removeProperty("--edge-pull"));
		},
		release() {
			if (!n) return;
			let t = n, r = Al();
			n = 0, e.style.removeProperty("--edge-pull"), a([{
				"--edge-pull": `${t}px`,
				easing: r.easing
			}, { "--edge-pull": "0px" }], r.duration);
		},
		kick(t) {
			if (r() || n) return;
			let i = -El(t * wl, Math.min(e.clientWidth, Tl));
			if (!i) return;
			let o = Al();
			a([
				{
					"--edge-pull": "0px",
					easing: "cubic-bezier(.2,.8,.4,1)"
				},
				{
					"--edge-pull": `${i}px`,
					offset: .3,
					easing: o.easing
				},
				{ "--edge-pull": "0px" }
			], o.duration * 1.6);
		}
	};
}
function Ol(e, { drag: t = !1, fade: n = !0, wheel: r = !0, elastic: i = !0, dragIgnore: a = "" } = {}) {
	if (!e) return;
	n && (e.dataset.scrollGesture = "");
	let o = vl.get(e);
	if (o) return o.options.drag ||= t, o.options.fade ||= n, o.update(), o;
	let s = {
		drag: t,
		fade: n,
		wheel: r,
		elastic: i,
		dragIgnore: a
	}, c = new AbortController(), l = Dl(e), u = null, d = 0, f = 0, p = 0, m = !1, h = 0, g = 0, _ = 0, v = 0, y = (t, n) => {
		e.dataset[t] !== n && (e.dataset[t] = n);
	}, b = "", x = () => (b ||= getComputedStyle(e).overflowX, [
		"auto",
		"scroll",
		"hidden"
	].includes(b)), S = () => {
		if (s.fade) {
			let t = x();
			y("overflowLeft", String(t && e.scrollLeft > 1)), y("overflowRight", String(t && e.scrollLeft + e.clientWidth < e.scrollWidth - 1));
		}
	}, C = 0, w = () => {
		C ||= requestAnimationFrame(() => {
			C = 0, S();
		});
	}, T = (e, t, n, r = {}) => e.addEventListener(t, n, {
		...r,
		signal: c.signal
	});
	T(e, "scroll", w, { passive: !0 });
	let ee = (e) => {
		s.elastic && !m && (m = !0, l.kick(e));
	}, te = () => {
		cancelAnimationFrame(h), h = 0, v = 0;
	}, ne = (t) => {
		let n = Math.min(Math.max(t - g, 0), 64);
		if (g = t, _ += (p - _) * (1 - Math.exp(-n / Sl)), Math.abs(p - _) < .5 && (_ = p), e.scrollLeft = _, _ !== p) h = requestAnimationFrame(ne);
		else if (h = 0, v) {
			let e = v;
			v = 0, ee(e);
		}
	};
	T(e, "wheel", (t) => {
		if (!s.wheel) return;
		let n = e.scrollWidth - e.clientWidth;
		if (t.defaultPrevented || !t.cancelable || Math.abs(t.deltaY) <= Math.abs(t.deltaX) || n <= 0 || !x()) return;
		t.preventDefault();
		let r = performance.now(), i = Math.abs(t.deltaY);
		r > f && (m = !1), f = r + bl;
		let a = h ? p : e.scrollLeft, o = a + t.deltaY;
		p = Math.min(n, Math.max(0, o));
		let c = o === p ? 0 : t.deltaY;
		i < xl || p === a ? (p !== a && (te(), e.scrollLeft = p), c && !h ? ee(c) : c && (v = c)) : (c && (v = c), h ||= (_ = e.scrollLeft, g = performance.now(), requestAnimationFrame(ne)));
	}, { passive: !1 }), T(e, "mousedown", (t) => {
		d = 0, !s.drag || t.button !== 0 || e.scrollWidth - e.clientWidth <= 1 || s.dragIgnore && (t.shiftKey || t.ctrlKey || t.metaKey || t.altKey || t.target.closest?.(s.dragIgnore)) || (t.stopPropagation(), te(), u = {
			x: t.pageX,
			left: e.scrollLeft
		}, d = 0, document.documentElement.dataset.dragScrolling = "");
	}), T(window, "mousemove", (t) => {
		if (!u) return;
		let n = t.pageX - u.x, r = u.left - n, i = e.scrollWidth - e.clientWidth;
		d = Math.max(d, Math.abs(n)), e.scrollLeft = r, s.elastic && l.drag(r < 0 ? r : r > i ? r - i : 0), t.preventDefault();
	});
	let re = () => {
		u && s.elastic && l.release(), u && delete document.documentElement.dataset.dragScrolling, u = null;
	};
	T(window, "mouseup", re), T(window, "blur", re), T(e, "keydown", () => {
		d = 0;
	}), T(e, "click", (e) => {
		d > 6 && (e.stopPropagation(), e.preventDefault(), d = 0);
	}, { capture: !0 });
	let ie = new ResizeObserver(() => {
		b = "", S();
	}), ae = () => {
		ie.observe(e);
		for (let t of e.children) ie.observe(t);
	}, oe = new MutationObserver(() => {
		ie.disconnect(), ae(), w();
	});
	oe.observe(e, {
		childList: !0,
		characterData: !0,
		subtree: !0
	}), ae();
	let se = {
		options: s,
		update() {
			b = "", S();
		},
		destroy() {
			c.abort(), te(), cancelAnimationFrame(C), C = 0, ie.disconnect(), oe.disconnect(), vl.delete(e), delete e.dataset.scrollGesture, u && delete document.documentElement.dataset.dragScrolling, vl.size || (yl?.disconnect(), yl = null);
		}
	};
	return vl.set(e, se), yl || (yl = new MutationObserver(() => {
		for (let [e, t] of vl) e.isConnected || t.destroy();
	}), yl.observe(document.body, {
		childList: !0,
		subtree: !0
	})), se;
}
var kl = null;
function Al() {
	if (!kl) {
		let e = getComputedStyle(document.documentElement);
		kl = {
			easing: e.getPropertyValue("--spring-pane").trim() || "ease",
			duration: parseFloat(e.getPropertyValue("--spring-pane-ms")) || 300
		};
	}
	return kl;
}
// src/react/components/use-horizontal-scroller.ts
function jl(e, t = !0) {
	let [n, r] = (0, E.useState)(null), i = (0, E.useCallback)((t) => {
		r(t), typeof e == "function" ? e(t) : e && (e.current = t);
	}, [e]);
	return (0, E.useLayoutEffect)(() => {
		if (!n || !t) return;
		n.dataset.horizontalScroll = "";
		let e = Ol(n);
		return () => {
			e.destroy(), delete n.dataset.horizontalScroll, delete n.dataset.overflowLeft, delete n.dataset.overflowRight;
		};
	}, [n, t]), i;
}
// src/react/components/segmented.tsx
function Ml(e) {
	let t = jl(W("selection"));
	return /* @__PURE__ */ (0, F.jsx)(Oo, {
		...e,
		ref: t
	});
}
var Nl = "inline-flex w-max max-w-full items-center gap-0.5 overflow-x-auto overscroll-x-contain rounded-2lg bg-background-tertiary-default p-1", Pl = "flex min-h-7 flex-none cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 max-sm:px-2 text-body-medium whitespace-nowrap text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring data-focus-visible:ring-2 data-focus-visible:ring-border-focus-ring data-selected:bg-background-primary-default data-selected:text-text-primary data-selected:shadow-card dark:data-selected:bg-background-primary-hover";
// src/react/components/configuration-fields.tsx
function Fl({ id: e, label: t, value: n, onChange: r, options: i, isDisabled: a, isInvalid: o, children: s }) {
	let c = `${e}-label`;
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "flex flex-col gap-1.5",
		children: [
			/* @__PURE__ */ (0, F.jsx)(Yo, {
				id: c,
				elementType: "span",
				children: t
			}),
			/* @__PURE__ */ (0, F.jsx)(Ml, {
				id: e,
				"aria-labelledby": c,
				orientation: "horizontal",
				className: Nl,
				value: n,
				onChange: r,
				isDisabled: a,
				isInvalid: o,
				children: i.map((e) => /* @__PURE__ */ (0, F.jsx)(ko, {
					value: e.value,
					className: Pl,
					children: e.label
				}, e.value))
			}),
			s
		]
	});
}
function Il({ prefix: e, suffix: t, unit: n, fieldClassName: r, ...i }) {
	let a = () => /* @__PURE__ */ (0, F.jsx)("span", {
		"aria-hidden": n ? !0 : void 0,
		className: P("shrink-0 text-body-regular text-text-secondary", n ? "w-10" : "pr-1"),
		children: n ? /* @__PURE__ */ (0, F.jsx)("span", {
			className: "absolute inset-y-0 right-0 flex items-center border-l border-border-button-default px-2",
			children: n
		}) : t
	});
	return /* @__PURE__ */ (0, F.jsx)(ts, {
		...i,
		fieldClassName: r,
		leadingAddon: e ? /* @__PURE__ */ (0, F.jsx)("span", {
			className: "shrink-0 pl-1 text-body-regular text-text-secondary",
			children: e
		}) : void 0,
		trailingIcon: n || t ? a : void 0
	});
}
// src/react/pages/setup/setup-form.tsx
var Ll = ["port", "mdns_name"], Rl = (e) => Array.isArray(e) ? e.filter(Boolean).join(" ") : e ?? "";
function zl({ setup: e, onDone: t, onRestore: n }) {
	let [r, i] = (0, E.useState)(0), [a, o] = (0, E.useState)(1), s = (0, E.useRef)(null), c = (0, E.useRef)(null), l = (e) => {
		o(e > r ? 1 : -1), i(e);
	};
	(0, E.useEffect)(() => {
		s.current?.focus({ preventScroll: !0 }), c.current?.scrollTo({ top: 0 });
	}, [r]);
	let u = e.questions.find((e) => e.input === "folder"), d = e.questions.filter((e) => e.input !== "folders"), f = d.find((e) => e.key === "host"), p = d.filter((e) => e.input !== "folder" && e.key !== "host"), [m, h] = (0, E.useState)(() => Object.fromEntries(d.map((e) => [e.key, e.default]))), [g, _] = (0, E.useState)(!1), [v, y] = (0, E.useState)(""), b = !!e.access_preset, [x, S] = (0, E.useState)(e.access_enabled && !b), [C, w] = (0, E.useState)(""), [T, ee] = (0, E.useState)(""), [te, ne] = (0, E.useState)({}), [re, ie] = (0, E.useState)(""), [ae, oe] = (0, E.useState)(!1), [se, ce] = (0, E.useState)(0), D = (0, E.useRef)(null), [le, ue] = (0, E.useState)(0);
	(0, E.useEffect)(() => {
		le && [...D.current?.querySelectorAll("input[aria-invalid=\"true\"]") ?? []].find((e) => !e.closest("[hidden]"))?.focus();
	}, [le]);
	let de = (e) => e ? /* @__PURE__ */ (0, F.jsx)("span", {
		role: "alert",
		children: e
	}, le) : void 0, fe = (e) => !e.visible_when || Object.entries(e.visible_when).every(([e, t]) => m[e] === t), pe = (e, t) => h((n) => ({
		...n,
		[e]: t
	})), me = async (e) => {
		if (e.preventDefault(), ae) return;
		if (r < 3) {
			l(r + 1);
			return;
		}
		oe(!0), ie("");
		let n = { access_enabled: x };
		for (let e of d) fe(e) && (n[e.key] = m[e.key] ?? "");
		x && Object.assign(n, {
			access_password: C,
			access_confirm: T
		});
		try {
			t(await Rs(n));
		} catch (e) {
			if (e instanceof Fs && e.status === 400 && e.errors) {
				let t = e.errors;
				ne(t), Ll.some((e) => t[e]) && ce((e) => e + 1), t.access_password && S(!0), l(u && t[u.key] ? 1 : 2), ue((e) => e + 1);
			} else ie(Vs(e));
		} finally {
			oe(!1);
		}
	}, he = (e) => {
		let t = Rl(te[e.key]), n = e.help.join("");
		return e.input === "choice" ? /* @__PURE__ */ (0, F.jsxs)(Fl, {
			id: `setup-${e.key}`,
			label: e.label,
			value: m[e.key] ?? e.default,
			onChange: (t) => pe(e.key, t),
			options: e.options ?? [],
			isInvalid: !!t,
			children: [n ? /* @__PURE__ */ (0, F.jsx)(bs, { children: n }) : null, t ? /* @__PURE__ */ (0, F.jsx)(xs, { children: t }, le) : null]
		}, e.key) : /* @__PURE__ */ (0, F.jsx)(Il, {
			id: `f-${e.key}`,
			label: e.label,
			isRequired: e.required,
			inputMode: e.input === "number" ? "numeric" : void 0,
			autoComplete: "off",
			spellCheck: "false",
			value: m[e.key] ?? "",
			onChange: (t) => pe(e.key, t),
			prefix: e.prefix,
			suffix: e.suffix,
			validationBehavior: "aria",
			isInvalid: !!t,
			hint: de(t) ?? (n || void 0)
		}, e.key);
	}, ge = async () => {
		if (u && !g) {
			_(!0), y("");
			try {
				let e = await Bs(m[u.key] ?? "");
				e && pe(u.key, e);
			} catch (e) {
				y(Vs(e));
			} finally {
				_(!1);
			}
		}
	}, _e = u ? Rl(te[u.key]) || v : "", ve = m.host === "2", ye = ve ? `https://${m.mdns_name || "peach"}.local/` : `http://127.0.0.1:${m.port || "8900"}/`;
	return /* @__PURE__ */ (0, F.jsx)(Ks, {
		step: r,
		children: /* @__PURE__ */ (0, F.jsxs)("form", {
			ref: D,
			noValidate: !0,
			onSubmit: (e) => void me(e),
			"aria-labelledby": "auth-card-title",
			"data-setup-form-panel": "",
			children: [
				/* @__PURE__ */ (0, F.jsxs)("div", {
					"data-setup-top": "",
					children: [/* @__PURE__ */ (0, F.jsx)("div", {
						"data-setup-progress": "",
						role: "img",
						"aria-label": `首次设置，第 ${r + 1} 步，共 4 步`,
						children: [
							0,
							1,
							2,
							3
						].map((e) => /* @__PURE__ */ (0, F.jsx)("span", {
							"data-active": e === r || void 0,
							"data-complete": e < r || void 0
						}, e))
					}), /* @__PURE__ */ (0, F.jsx)("span", {
						className: "text-body-2-regular text-text-secondary",
						children: "首次设置"
					})]
				}),
				/* @__PURE__ */ (0, F.jsx)("div", {
					"data-setup-step-scroll": "",
					ref: c,
					children: /* @__PURE__ */ (0, F.jsxs)("div", {
						"data-setup-step-content": "",
						style: { "--setup-direction": `${a * 20}px` },
						children: [
							/* @__PURE__ */ (0, F.jsxs)("header", {
								"data-setup-step-heading": "",
								children: [/* @__PURE__ */ (0, F.jsx)("h1", {
									id: "auth-card-title",
									"data-copy-key": `setup.title.${r}`,
									ref: s,
									tabIndex: -1,
									className: "text-title-1-semibold text-text-primary",
									children: r === 0 ? "欢迎使用 Peach" : r === 1 ? "数据目录放在哪里？" : r === 2 ? e.docker ? "访问与网络" : "在哪里使用 Peach？" : "准备好开始了"
								}), /* @__PURE__ */ (0, F.jsx)("p", {
									"data-copy-key": `setup.description.${r}`,
									className: "text-body-regular text-text-secondary",
									children: r === 0 ? "花一点时间，让 Peach 更适合你。" : r === 1 ? "数据库、缓存和设置文件都放在这个目录。" : r === 2 ? e.docker ? "为馆藏设置访问密码；网盘授权回调的基址在高级设置里。" : "选择访问范围，也可以为馆藏设置密码。" : "确认这些选择，剩下的交给 Peach。"
								})]
							}, r),
							/* @__PURE__ */ (0, F.jsx)("div", {
								hidden: r !== 0,
								children: /* @__PURE__ */ (0, F.jsxs)("ul", {
									"data-setup-welcome-points": "",
									children: [
										/* @__PURE__ */ (0, F.jsxs)("li", { children: [/* @__PURE__ */ (0, F.jsx)(Wo, {}), /* @__PURE__ */ (0, F.jsxs)("div", {
											"data-setup-welcome-copy": "",
											children: [/* @__PURE__ */ (0, F.jsx)("strong", {
												className: "text-body-medium",
												children: "先确认数据目录"
											}), /* @__PURE__ */ (0, F.jsx)("p", {
												className: "text-body-2-regular text-text-secondary",
												children: "数据库、缓存和设置文件都存在这里，之后可以在设置里改动。"
											})]
										})] }),
										/* @__PURE__ */ (0, F.jsxs)("li", { children: [/* @__PURE__ */ (0, F.jsx)(Jo, {}), /* @__PURE__ */ (0, F.jsxs)("div", {
											"data-setup-welcome-copy": "",
											children: [/* @__PURE__ */ (0, F.jsx)("strong", {
												className: "text-body-medium",
												children: "更快找到想看的"
											}), /* @__PURE__ */ (0, F.jsx)("p", {
												className: "text-body-2-regular text-text-secondary",
												children: "用搜索、标签和收藏浏览馆藏。"
											})]
										})] }),
										/* @__PURE__ */ (0, F.jsxs)("li", { children: [/* @__PURE__ */ (0, F.jsx)(Ko, {}), /* @__PURE__ */ (0, F.jsxs)("div", {
											"data-setup-welcome-copy": "",
											children: [/* @__PURE__ */ (0, F.jsx)("strong", {
												className: "text-body-medium",
												children: "按你的习惯播放"
											}), /* @__PURE__ */ (0, F.jsx)("p", {
												className: "text-body-2-regular text-text-secondary",
												children: "播放与外观偏好，可以随时在设置里调整。"
											})]
										})] })
									]
								})
							}),
							/* @__PURE__ */ (0, F.jsx)("div", {
								hidden: r !== 1,
								children: u ? /* @__PURE__ */ (0, F.jsxs)(Gt, {
									labelledBy: "setup-data-title",
									children: [
										/* @__PURE__ */ (0, F.jsxs)(Kt, {
											id: "setup-data-title",
											children: [u.label, /* @__PURE__ */ (0, F.jsx)("span", {
												"aria-hidden": !0,
												className: "ml-0.5 text-text-error-primary",
												children: "*"
											})]
										}),
										/* @__PURE__ */ (0, F.jsxs)("div", {
											className: "flex items-start gap-2",
											children: [/* @__PURE__ */ (0, F.jsx)(ts, {
												className: "min-w-0 flex-1",
												id: `f-${u.key}`,
												"aria-label": u.label,
												isRequired: !0,
												autoComplete: "off",
												spellCheck: "false",
												value: m[u.key] ?? "",
												onChange: (e) => pe(u.key, e),
												validationBehavior: "aria",
												isInvalid: !!_e,
												hint: de(_e)
											}), /* @__PURE__ */ (0, F.jsx)(Ys, {
												icon: Wo,
												"aria-label": "选择数据目录",
												onClick: () => void ge(),
												...cs(g)
											})]
										}),
										u.help.map((e) => /* @__PURE__ */ (0, F.jsx)(bs, { children: e }, e))
									]
								}) : null
							}),
							/* @__PURE__ */ (0, F.jsxs)("div", {
								hidden: r !== 2,
								children: [/* @__PURE__ */ (0, F.jsxs)(Gt, {
									first: !0,
									labelledBy: "auth-card-title",
									children: [
										f ? he(f) : null,
										b ? /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsx)(Yo, {
											elementType: "span",
											children: "访问密码"
										}), /* @__PURE__ */ (0, F.jsx)(ns, {
											tone: "info",
											children: "已按 PEACH_ACCESS_PASSWORD 设置访问密码，可在配置页「网络与访问」修改。"
										})] }) : /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsxs)("div", {
											className: "flex items-start justify-between gap-4",
											children: [/* @__PURE__ */ (0, F.jsxs)("div", {
												className: "flex min-w-0 flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, F.jsx)(Yo, {
													id: "setup-password-title",
													elementType: "span",
													children: "访问密码"
												}), /* @__PURE__ */ (0, F.jsx)("p", {
													id: "setup-access-description",
													className: "text-body-2-regular text-text-secondary",
													children: "开启后，访问 Peach 需要先登录。"
												})]
											}), /* @__PURE__ */ (0, F.jsx)(os, {
												"aria-labelledby": "setup-password-title",
												"aria-describedby": "setup-access-description",
												isSelected: x,
												onChange: S
											})]
										}), /* @__PURE__ */ (0, F.jsx)(bs, { children: ve || e.docker ? "局域网访问推荐设置密码。未设置时，同一网络中能连接 Peach 的设备可直接进入。" : "只监听回环地址；设置密码后，打开 Peach 仍需登录。" })] }),
										x ? /* @__PURE__ */ (0, F.jsx)(ss, {
											label: "访问密码",
											password: C,
											confirmation: T,
											onPassword: w,
											onConfirmation: ee,
											passwordError: de(Rl(te.access_password)),
											passwordHint: "请输入 8–256 个字符。",
											confirmationInvalid: !!te.access_password
										}) : null
									]
								}), e.docker ? null : /* @__PURE__ */ (0, F.jsxs)(Gt, { children: [/* @__PURE__ */ (0, F.jsx)(Ts, {
									summary: "高级设置",
									defaultOpen: se > 0,
									children: /* @__PURE__ */ (0, F.jsx)("div", {
										className: "flex flex-col gap-4",
										children: p.filter(fe).map(he)
									})
								}, se), /* @__PURE__ */ (0, F.jsx)(bs, { children: /* @__PURE__ */ (0, F.jsxs)("span", {
									className: "break-all",
									children: ["访问地址：", ye]
								}) })] })]
							}),
							/* @__PURE__ */ (0, F.jsxs)("div", {
								hidden: r !== 3,
								children: [re ? /* @__PURE__ */ (0, F.jsx)(xs, { children: re }) : null, /* @__PURE__ */ (0, F.jsxs)(Gt, {
									first: !0,
									labelledBy: "setup-summary-title",
									children: [/* @__PURE__ */ (0, F.jsx)(Kt, {
										id: "setup-summary-title",
										children: "确认设置"
									}), /* @__PURE__ */ (0, F.jsxs)(Cs, { children: [/* @__PURE__ */ (0, F.jsx)(ws, {
										term: "数据目录",
										children: /* @__PURE__ */ (0, F.jsx)("span", {
											className: "break-all",
											children: u ? m[u.key] || "尚未填写" : e.data_root || "未取得"
										})
									}), /* @__PURE__ */ (0, F.jsxs)(ws, {
										term: "访问范围",
										children: [
											e.docker ? "按 Compose 端口映射" : ve ? "同一局域网的设备" : "只监听回环地址",
											" · ",
											b ? "已按 PEACH_ACCESS_PASSWORD 设置访问密码" : x ? "使用访问密码" : "未设置访问密码"
										]
									})] })]
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, F.jsxs)("footer", {
					"data-setup-footer": "",
					"data-setup-footer-end": r === 0 && !n ? "" : void 0,
					"data-copy-interact": !0,
					children: [r > 0 ? /* @__PURE__ */ (0, F.jsx)(Ht, {
						variant: "ghost",
						onClick: () => {
							ae || l(r - 1);
						},
						"aria-disabled": ae || void 0,
						children: "返回"
					}) : n ? /* @__PURE__ */ (0, F.jsx)(Ht, {
						variant: "ghost",
						onClick: n,
						children: "使用已有数据"
					}) : null, /* @__PURE__ */ (0, F.jsx)(Ht, {
						type: "submit",
						...cs(ae),
						children: r === 0 ? "开始设置" : r === 3 ? "完成设置" : "继续"
					})]
				}, r)
			]
		})
	});
}
// src/react/pages/setup/setup-restore.tsx
function Bl({ onDone: e, onBack: t }) {
	let [n, r] = (0, E.useState)(""), [i, a] = (0, E.useState)(""), [o, s] = (0, E.useState)(!1), c = (0, E.useRef)(null);
	return (0, E.useEffect)(() => {
		c.current?.focus({ preventScroll: !0 });
	}, []), /* @__PURE__ */ (0, F.jsx)(Ks, {
		step: "restore",
		children: /* @__PURE__ */ (0, F.jsxs)("form", {
			"data-setup-form-panel": "",
			onSubmit: async (t) => {
				if (t.preventDefault(), !o) {
					s(!0), a("");
					try {
						e(await zs(n));
					} catch (e) {
						let t = e instanceof Fs ? e.errors?.data_root : void 0;
						a(typeof t == "string" ? t : Vs(e));
					} finally {
						s(!1);
					}
				}
			},
			noValidate: !0,
			"aria-labelledby": "auth-card-title",
			children: [
				/* @__PURE__ */ (0, F.jsx)("div", {
					"data-setup-top": "",
					children: /* @__PURE__ */ (0, F.jsx)("span", {
						className: "text-body-2-regular text-text-secondary",
						children: "连接已有数据"
					})
				}),
				/* @__PURE__ */ (0, F.jsx)("div", {
					"data-setup-step-scroll": "",
					children: /* @__PURE__ */ (0, F.jsxs)("div", {
						"data-setup-step-content": "",
						children: [/* @__PURE__ */ (0, F.jsxs)("header", {
							"data-setup-step-heading": "",
							children: [/* @__PURE__ */ (0, F.jsx)("h1", {
								id: "auth-card-title",
								ref: c,
								tabIndex: -1,
								className: "text-title-1-semibold text-text-primary",
								children: "使用已有数据"
							}), /* @__PURE__ */ (0, F.jsx)("p", {
								className: "text-body-regular text-text-secondary",
								children: "连接 Peach 数据目录，继续使用原来的配置与馆藏。"
							})]
						}), /* @__PURE__ */ (0, F.jsx)("div", { children: /* @__PURE__ */ (0, F.jsx)(ts, {
							label: "已有数据目录",
							value: n,
							onChange: r,
							isRequired: !0,
							autoComplete: "off",
							spellCheck: "false",
							validationBehavior: "aria",
							isInvalid: !!i,
							hint: i ? /* @__PURE__ */ (0, F.jsx)("span", {
								role: "alert",
								children: i
							}) : "选择包含 config.toml 和 database 文件夹的数据目录。"
						}) })]
					})
				}),
				/* @__PURE__ */ (0, F.jsxs)("footer", {
					"data-setup-footer": "",
					"data-copy-interact": !0,
					children: [/* @__PURE__ */ (0, F.jsx)(Ht, {
						variant: "ghost",
						onClick: () => {
							o || t();
						},
						"aria-disabled": o || void 0,
						children: "返回首次设置"
					}), /* @__PURE__ */ (0, F.jsx)(Ht, {
						type: "submit",
						...cs(o),
						children: o ? "正在连接数据目录…" : "使用此目录"
					})]
				})
			]
		})
	});
}
// src/react/pages/setup/setup-page.tsx
function Vl() {
	let [e, t] = (0, E.useState)({ kind: "loading" }), [n, r] = (0, E.useState)(0), [i, a] = (0, E.useState)(!1);
	return (0, E.useEffect)(() => {
		let e = new AbortController();
		return Ls(e.signal).then((e) => t({
			kind: "form",
			setup: e
		}), (n) => {
			e.signal.aborted || t(n instanceof Fs && n.status === 403 ? {
				kind: "denied",
				docker: n.docker
			} : {
				kind: "failed",
				message: Vs(n)
			});
		}), () => e.abort();
	}, [n]), e.kind === "done" ? /* @__PURE__ */ (0, F.jsx)(qs, { done: e.done }) : e.kind === "form" && !i ? /* @__PURE__ */ (0, F.jsx)(zl, {
		setup: e.setup,
		onRestore: e.setup.docker ? void 0 : () => a(!0),
		onDone: (e) => t({
			kind: "done",
			done: e
		})
	}) : e.kind === "form" ? /* @__PURE__ */ (0, F.jsx)(Bl, {
		onBack: () => a(!1),
		onDone: (e) => t({
			kind: "done",
			done: e
		})
	}) : /* @__PURE__ */ (0, F.jsx)(Ks, {
		step: 0,
		children: /* @__PURE__ */ (0, F.jsxs)("section", {
			"data-setup-form-panel": "",
			"aria-labelledby": "auth-card-title",
			"aria-busy": e.kind === "loading" || void 0,
			children: [/* @__PURE__ */ (0, F.jsx)("div", {
				"data-setup-top": "",
				children: /* @__PURE__ */ (0, F.jsx)("span", {
					className: "text-body-2-regular text-text-secondary",
					children: "首次设置"
				})
			}), /* @__PURE__ */ (0, F.jsx)("div", {
				"data-setup-step-scroll": "",
				children: /* @__PURE__ */ (0, F.jsxs)("div", {
					"data-setup-step-content": "",
					children: [
						/* @__PURE__ */ (0, F.jsxs)("header", {
							"data-setup-step-heading": "",
							children: [/* @__PURE__ */ (0, F.jsx)("h1", {
								id: "auth-card-title",
								className: "text-title-1-semibold text-text-primary",
								children: "欢迎使用 Peach"
							}), /* @__PURE__ */ (0, F.jsx)("p", {
								className: "text-body-regular text-text-secondary",
								children: "花一点时间，让 Peach 更适合你。"
							})]
						}),
						e.kind === "loading" ? /* @__PURE__ */ (0, F.jsxs)("div", {
							"data-setup-loading": "",
							"data-skeleton": "",
							role: "status",
							"aria-label": "正在读取设置",
							children: [
								/* @__PURE__ */ (0, F.jsx)("span", {}),
								/* @__PURE__ */ (0, F.jsx)("span", {}),
								/* @__PURE__ */ (0, F.jsx)("span", {})
							]
						}) : null,
						e.kind === "denied" ? /* @__PURE__ */ (0, F.jsx)(ns, {
							tone: "error",
							children: e.docker ? rs : "请在运行 Peach 的服务器上打开设置。"
						}) : null,
						e.kind === "failed" ? /* @__PURE__ */ (0, F.jsx)(ns, {
							tone: "error",
							action: /* @__PURE__ */ (0, F.jsx)(Ht, {
								variant: "secondary",
								onClick: () => {
									t({ kind: "loading" }), r((e) => e + 1);
								},
								children: "立即重试"
							}),
							children: e.message
						}) : null
					]
				})
			})]
		})
	});
}
// src/react/pages/index.tsx
var Hl = {
	setup: Vl,
	login: As,
	error: I
};
ee();
var Ul = document.getElementById("peach-page"), Wl = Ul ? Hl[Ul.dataset.page ?? ""] : void 0;
Ul && Wl && (0, D.createRoot)(Ul).render(/* @__PURE__ */ (0, F.jsx)(Wl, { data: { ...Ul.dataset } }));

//# debugId=46559626-5975-4702-9d40-40abf6a463c9