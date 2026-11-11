(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "d1116401-bf29-43cf-a21a-0e43ed0f6006", e._sentryDebugIdIdentifier = "sentry-dbid-d1116401-bf29-43cf-a21a-0e43ed0f6006");
	} catch {}
})();
import { $b4f18e3395fe64d7$export$3d96ec278d3efce4 as e, $b4f18e3395fe64d7$export$3e41faf802a29e71 as t, $b4f18e3395fe64d7$export$b2539bed5023c21c as n, $b4f18e3395fe64d7$export$e51a686c67fdaa2d as r, ButtonLink as i, DRIVE_SETTINGS_PATH as a, EmptyState as o, LOC as s, MEDIA_SOURCE_ICONS as c, MotionConfigContext as l, NR as u, Note as d, Progress as f, SEGMENT as p, SEGMENTED_TRACK as m, STATS_KEY as h, STAT_STRIP as g, SegmentedTabList as _, SourceMark as v, StatCard as y, StatusLabel as b, WithPromise as x, Xc as S, Xt as C, _8 as w, __commonJSMin as T, __exportAll as E, __toESM as D, asNumber as O, bandRows as k, calcGeneratorVelocity as A, cancelFrame as j, cardClass as M, clsx as N, collectMotionValues as ee, cx as te, errorMessage as ne, f1 as re, fetchStats as ie, fmtCount as ae, fmtSize as oe, frame as se, interpolate as ce, isMotionValue as le, known as ue, lengthRows as de, mM as fe, mediumRows as pe, motion as me, motionValue as he, percentText as ge, playedFor as _e, playedItemUrl as ve, radialArc as ye, radialBarSize as be, radialCeiling as xe, radialSlices as Se, reachedShare as Ce, replayRows as we, require_jsx_runtime as Te, require_react as Ee, require_react_dom as De, require_with_selector as Oe, resolveStartTime as ke, spring as Ae, statCardClass as je, time as Me, uo as Ne, useConstant as Pe, useIsomorphicLayoutEffect as Fe, useQuery as Ie, useReducedMotion as Le, watchNote as Re, watchedShare as ze } from "./peach-app.js";
import { ConnectionStatus as Be } from "./peach-app.connection-status-DI6kgn3i.js";
import { Page as Ve } from "./peach-app.page-QAncjzM1.js";
// ../../../peach/frontend/node_modules/motion-dom/dist/es/utils/transform.mjs
function He(...e) {
	let t = !Array.isArray(e[0]), n = t ? 0 : -1, r = e[0 + n], i = e[1 + n], a = e[2 + n], o = e[3 + n], s = ce(i, a, o);
	return t ? s(r) : s;
}
// ../../../peach/frontend/node_modules/motion-dom/dist/es/animation/FollowAnimation.mjs
var Ue = /* @__PURE__ */ new Set(), We = ({ timestamp: e }) => {
	Ue.forEach((t) => t.tick(e));
}, Ge = class extends x {
	constructor(e) {
		super(), this.state = "idle", this.startTime = 0, this.currentTime = 0, this.started = !1, this.hasNextTarget = !1, this.nextTarget = 0, this.stop = () => {
			this.state !== "idle" && (this.teardown(), this.options.onStop?.());
		}, this.options = e, this.factory = e.type, this.generator = this.factory(e);
		let { driver: t } = e;
		t && (this.driver = t((e) => this.tick(e))), this.startTime = this.now(), this.state = "running", this.driver ? this.driver.start() : (Ue.size || se.update(We, !0), Ue.add(this));
	}
	setTarget(e, t) {
		this.nextTarget = e, this.nextVelocity = t, this.hasNextTarget = !0;
	}
	retarget(e, t) {
		let { options: n, generator: r } = this;
		n.keyframes = e, n.velocity = t, this.startTime = this.now(), this.currentTime = 0, r.retarget ? r.retarget(e, t) : this.generator = this.factory(n);
	}
	tick(e) {
		let { options: t, hasNextTarget: n } = this, { delay: r = 0, onUpdate: i, onPlay: a } = t;
		this.started || (this.startTime = ke(this.startTime, e));
		let o = Math.round(e - this.startTime) - r, s = this.currentTime = Math.max(0, o), c = this.generator.next(s), l = o < 0 ? t.keyframes[0] : c.value;
		if (n) {
			this.hasNextTarget = !1;
			let { keyframes: e } = t;
			e[0] = l, e[1] = this.nextTarget, this.retarget(e, this.nextVelocity ?? this.getGeneratorVelocity());
		}
		(n || !this.started) && (this.started = !0, a?.()), this.state === "running" && (i?.(l), c.done && o >= 0 && !n && !this.hasNextTarget && this.state === "running" && (this.notifyFinished(), this.teardown(), this.state = "finished", t.onComplete?.()));
	}
	getGeneratorVelocity() {
		return A(this.generator, this.currentTime, this.options.velocity);
	}
	now() {
		return this.driver ? this.driver.now() : Me.now();
	}
	teardown() {
		this.state = "idle", this.driver ? this.driver.stop() : (Ue.delete(this), Ue.size || j(We));
	}
};
// ../../../peach/frontend/node_modules/motion-dom/dist/es/value/utils/follow.mjs
function Ke(e, t, n) {
	let r = e.get(), i = null, a, o = typeof r == "string" ? r.replace(/[\d.-]/g, "") : void 0, s = (e) => a(o ? e + o : e), c = () => e.events.animationStart?.notify(), l = () => {
		i &&= (i.stop(), null), e.animation = void 0;
	};
	if (e.attach((t, r) => {
		a = r;
		let o = O(t);
		if (i?.state === "running") {
			i.setTarget(o, n.velocity);
			return;
		}
		let u = O(e.get()), d = i ? i.getGeneratorVelocity() : e.getVelocity();
		if (l(), u === o) return;
		let f = i = new Ge({
			keyframes: [u, o],
			velocity: d,
			restDelta: .001,
			restSpeed: .01,
			...n,
			onUpdate: s,
			onPlay: c
		});
		e.animation = f, f.then(() => {
			i === f && (i = null, e.animation = void 0, e.events.animationComplete?.notify());
		});
	}, l), le(t)) {
		let r = n.skipInitialAnimation === !0, i = (t) => {
			r ? (r = !1, e.jump(qe(t, o), !1)) : e.set(qe(t, o));
		}, a = t.on("change", i), s = t.get();
		O(s) - O(e.get()) && i(s);
		let c = e.on("destroy", a);
		return () => {
			a(), c(), l();
		};
	}
	return l;
}
function qe(e, t) {
	return t ? e + t : e;
}
// ../../../peach/frontend/node_modules/motion-dom/dist/es/value/spring-value.mjs
function Je(e, t, n) {
	return Ke(e, t, {
		...n,
		type: Ae
	});
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/utils/use-motion-value-event.mjs
var P = /* @__PURE__ */ D(Ee(), 1);
function Ye(e, t, n) {
	(0, P.useInsertionEffect)(() => e.on(t, n), [
		e,
		t,
		n
	]);
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-motion-value.mjs
function Xe(e) {
	let t = Pe(() => he(e)), { isStatic: n } = (0, P.useContext)(l);
	if (n) {
		let [, n] = (0, P.useState)(e);
		(0, P.useEffect)(() => t.on("change", n), []);
	}
	return t;
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-combine-values.mjs
function Ze(e, t) {
	let n = Xe(t()), r = () => n.set(t());
	return r(), Fe(() => {
		let t = () => se.preRender(r, !1, !0), n = e.map((e) => e.on("change", t));
		return r(), () => {
			n.forEach((e) => e()), j(r);
		};
	}), n;
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-computed.mjs
function Qe(e) {
	ee.current = [], e();
	let t = Ze(ee.current, e);
	return ee.current = void 0, t;
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-follow-value.mjs
function $e(e, t, n) {
	let { isStatic: r } = (0, P.useContext)(l), i = () => le(e) ? e.get() : e;
	if (r) return Qe(i);
	let a = Xe(i());
	return (0, P.useInsertionEffect)(() => n(a, e, t), [a, JSON.stringify(t)]), a;
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-spring.mjs
function et(e, t = {}) {
	return $e(e, t, Je);
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-transform.mjs
function tt(e, t, n, r) {
	if (typeof e == "function") return Qe(e);
	if (n !== void 0 && !Array.isArray(n) && typeof t != "function") return rt(e, t, n, r);
	let i = typeof t == "function" ? t : He(t, n, r), a = Array.isArray(e) ? nt(e, i) : nt([e], ([e]) => i(e)), o = Array.isArray(e) ? void 0 : e.accelerate;
	if (o && !o.isTransformed && typeof t != "function" && Array.isArray(n) && r?.clamp !== !1 && !r?.mixer) {
		let e = r?.ease;
		a.accelerate = {
			...o,
			times: [
				0,
				...t,
				1
			],
			keyframes: [
				n[0],
				...n,
				n[n.length - 1]
			],
			isTransformed: !0,
			...e ? { ease: Array.isArray(e) ? [e[0], ...e] : e } : {}
		};
	}
	return a;
}
function nt(e, t) {
	let n = Pe(() => []);
	return Ze(e, () => {
		n.length = 0;
		let r = e.length;
		for (let t = 0; t < r; t++) n[t] = e[t].get();
		return t(n);
	});
}
function rt(e, t, n, r) {
	let i = Pe(() => Object.keys(n)), a = Pe(() => ({}));
	for (let o of i) a[o] = tt(e, t, n[o], r);
	return a;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/excludeEventProps.js
var it = /* @__PURE__ */ "dangerouslySetInnerHTML.onCopy.onCopyCapture.onCut.onCutCapture.onPaste.onPasteCapture.onCompositionEnd.onCompositionEndCapture.onCompositionStart.onCompositionStartCapture.onCompositionUpdate.onCompositionUpdateCapture.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onChangeCapture.onBeforeInput.onBeforeInputCapture.onInput.onInputCapture.onReset.onResetCapture.onSubmit.onSubmitCapture.onInvalid.onInvalidCapture.onLoad.onLoadCapture.onError.onErrorCapture.onKeyDown.onKeyDownCapture.onKeyPress.onKeyPressCapture.onKeyUp.onKeyUpCapture.onAbort.onAbortCapture.onCanPlay.onCanPlayCapture.onCanPlayThrough.onCanPlayThroughCapture.onDurationChange.onDurationChangeCapture.onEmptied.onEmptiedCapture.onEncrypted.onEncryptedCapture.onEnded.onEndedCapture.onLoadedData.onLoadedDataCapture.onLoadedMetadata.onLoadedMetadataCapture.onLoadStart.onLoadStartCapture.onPause.onPauseCapture.onPlay.onPlayCapture.onPlaying.onPlayingCapture.onProgress.onProgressCapture.onRateChange.onRateChangeCapture.onSeeked.onSeekedCapture.onSeeking.onSeekingCapture.onStalled.onStalledCapture.onSuspend.onSuspendCapture.onTimeUpdate.onTimeUpdateCapture.onVolumeChange.onVolumeChangeCapture.onWaiting.onWaitingCapture.onAuxClick.onAuxClickCapture.onClick.onClickCapture.onContextMenu.onContextMenuCapture.onDoubleClick.onDoubleClickCapture.onDrag.onDragCapture.onDragEnd.onDragEndCapture.onDragEnter.onDragEnterCapture.onDragExit.onDragExitCapture.onDragLeave.onDragLeaveCapture.onDragOver.onDragOverCapture.onDragStart.onDragStartCapture.onDrop.onDropCapture.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseMoveCapture.onMouseOut.onMouseOutCapture.onMouseOver.onMouseOverCapture.onMouseUp.onMouseUpCapture.onSelect.onSelectCapture.onTouchCancel.onTouchCancelCapture.onTouchEnd.onTouchEndCapture.onTouchMove.onTouchMoveCapture.onTouchStart.onTouchStartCapture.onPointerDown.onPointerDownCapture.onPointerMove.onPointerMoveCapture.onPointerUp.onPointerUpCapture.onPointerCancel.onPointerCancelCapture.onPointerEnter.onPointerEnterCapture.onPointerLeave.onPointerLeaveCapture.onPointerOver.onPointerOverCapture.onPointerOut.onPointerOutCapture.onGotPointerCapture.onGotPointerCaptureCapture.onLostPointerCapture.onLostPointerCaptureCapture.onScroll.onScrollCapture.onWheel.onWheelCapture.onAnimationStart.onAnimationStartCapture.onAnimationEnd.onAnimationEndCapture.onAnimationIteration.onAnimationIterationCapture.onTransitionEnd.onTransitionEndCapture".split(".");
function at(e) {
	return typeof e == "string" && it.includes(e);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/svgPropertiesNoEvents.js
var ot = /* @__PURE__ */ new Set(/* @__PURE__ */ "aria-activedescendant.aria-atomic.aria-autocomplete.aria-busy.aria-checked.aria-colcount.aria-colindex.aria-colspan.aria-controls.aria-current.aria-describedby.aria-details.aria-disabled.aria-errormessage.aria-expanded.aria-flowto.aria-haspopup.aria-hidden.aria-invalid.aria-keyshortcuts.aria-label.aria-labelledby.aria-level.aria-live.aria-modal.aria-multiline.aria-multiselectable.aria-orientation.aria-owns.aria-placeholder.aria-posinset.aria-pressed.aria-readonly.aria-relevant.aria-required.aria-roledescription.aria-rowcount.aria-rowindex.aria-rowspan.aria-selected.aria-setsize.aria-sort.aria-valuemax.aria-valuemin.aria-valuenow.aria-valuetext.className.color.height.id.lang.max.media.method.min.name.style.target.width.role.tabIndex.accentHeight.accumulate.additive.alignmentBaseline.allowReorder.alphabetic.amplitude.arabicForm.ascent.attributeName.attributeType.autoReverse.azimuth.baseFrequency.baselineShift.baseProfile.bbox.begin.bias.by.calcMode.capHeight.clip.clipPath.clipPathUnits.clipRule.colorInterpolation.colorInterpolationFilters.colorProfile.colorRendering.contentScriptType.contentStyleType.cursor.cx.cy.d.decelerate.descent.diffuseConstant.direction.display.divisor.dominantBaseline.dur.dx.dy.edgeMode.elevation.enableBackground.end.exponent.externalResourcesRequired.fill.fillOpacity.fillRule.filter.filterRes.filterUnits.floodColor.floodOpacity.focusable.fontFamily.fontSize.fontSizeAdjust.fontStretch.fontStyle.fontVariant.fontWeight.format.from.fx.fy.g1.g2.glyphName.glyphOrientationHorizontal.glyphOrientationVertical.glyphRef.gradientTransform.gradientUnits.hanging.horizAdvX.horizOriginX.href.ideographic.imageRendering.in2.in.intercept.k1.k2.k3.k4.k.kernelMatrix.kernelUnitLength.kerning.keyPoints.keySplines.keyTimes.lengthAdjust.letterSpacing.lightingColor.limitingConeAngle.local.markerEnd.markerHeight.markerMid.markerStart.markerUnits.markerWidth.mask.maskContentUnits.maskUnits.mathematical.mode.numOctaves.offset.opacity.operator.order.orient.orientation.origin.overflow.overlinePosition.overlineThickness.paintOrder.panose1.pathLength.patternContentUnits.patternTransform.patternUnits.pointerEvents.pointsAtX.pointsAtY.pointsAtZ.preserveAlpha.preserveAspectRatio.primitiveUnits.r.radius.refX.refY.renderingIntent.repeatCount.repeatDur.requiredExtensions.requiredFeatures.restart.result.rotate.rx.ry.seed.shapeRendering.slope.spacing.specularConstant.specularExponent.speed.spreadMethod.startOffset.stdDeviation.stemh.stemv.stitchTiles.stopColor.stopOpacity.strikethroughPosition.strikethroughThickness.string.stroke.strokeDasharray.strokeDashoffset.strokeLinecap.strokeLinejoin.strokeMiterlimit.strokeOpacity.strokeWidth.surfaceScale.systemLanguage.tableValues.targetX.targetY.textAnchor.textDecoration.textLength.textRendering.to.transform.u1.u2.underlinePosition.underlineThickness.unicode.unicodeBidi.unicodeRange.unitsPerEm.vAlphabetic.values.vectorEffect.version.vertAdvY.vertOriginX.vertOriginY.vHanging.vIdeographic.viewTarget.visibility.vMathematical.widths.wordSpacing.writingMode.x1.x2.x.xChannelSelector.xHeight.xlinkActuate.xlinkArcrole.xlinkHref.xlinkRole.xlinkShow.xlinkTitle.xlinkType.xmlBase.xmlLang.xmlns.xmlnsXlink.xmlSpace.y1.y2.y.yChannelSelector.z.zoomAndPan.ref.key.angle".split("."));
function st(e) {
	return typeof e == "string" && ot.has(e);
}
function ct(e) {
	return typeof e == "string" && e.startsWith("data-");
}
function lt(e) {
	if (typeof e != "object" || !e) return {};
	var t = {};
	for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (st(n) || ct(n)) && (t[n] = e[n]);
	return t;
}
function ut(e) {
	if (e == null) return null;
	if (/*#__PURE__*/ (0, P.isValidElement)(e) && typeof e.props == "object" && e.props !== null) {
		var t = e.props;
		return lt(t);
	}
	return typeof e == "object" && !Array.isArray(e) ? lt(e) : null;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/svgPropertiesAndEvents.js
function dt(e) {
	var t = {};
	for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (st(n) || ct(n) || at(n)) && (t[n] = e[n]);
	return t;
}
function ft(e) {
	return e == null ? null : /*#__PURE__*/ (0, P.isValidElement)(e) ? dt(e.props) : typeof e == "object" && !Array.isArray(e) ? dt(e) : null;
}
// ../../../peach/frontend/node_modules/recharts/es6/container/Surface.js
var pt = [
	"children",
	"width",
	"height",
	"viewBox",
	"className",
	"style",
	"title",
	"desc"
];
function mt() {
	return mt = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, mt.apply(null, arguments);
}
function ht(e, t) {
	if (e == null) return {};
	var n, r, i = gt(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function gt(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var _t = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.children, r = e.width, i = e.height, a = e.viewBox, o = e.className, s = e.style, c = e.title, l = e.desc, u = ht(e, pt), d = a || {
		width: r,
		height: i,
		x: 0,
		y: 0
	}, f = N("recharts-surface", o);
	return /*#__PURE__*/ P.createElement("svg", mt({}, dt(u), {
		className: f,
		width: r,
		height: i,
		style: s,
		viewBox: `${d.x} ${d.y} ${d.width} ${d.height}`,
		ref: t
	}), /*#__PURE__*/ P.createElement("title", null, c), /*#__PURE__*/ P.createElement("desc", null, l), n);
}), vt = ["children", "className"];
function yt() {
	return yt = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, yt.apply(null, arguments);
}
function bt(e, t) {
	if (e == null) return {};
	var n, r, i = xt(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function xt(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var F = /*#__PURE__*/ P.forwardRef((e, t) => {
	var n = e.children, r = e.className, i = bt(e, vt), a = N("recharts-layer", r);
	return /*#__PURE__*/ P.createElement("g", yt({ className: a }, dt(i), { ref: t }), n);
});
// ../../../peach/frontend/node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
function St(e) {
	return e === "__proto__";
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/isDeepKey.mjs
var Ct = /\.|(\[(?:[^[\]]*|(["'])(?:(?!\2)[^\\]|\\.)*?\2)\])/;
function wt(e) {
	switch (typeof e) {
		case "number":
		case "symbol": return !1;
		case "string": return e === "" || e.startsWith(".") || e.endsWith(".") ? !1 : Ct.test(e);
		default: return !1;
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/toKey.mjs
function Tt(e) {
	return typeof e == "string" || typeof e == "symbol" ? e : Object.is(e?.valueOf?.(), -0) ? "-0" : String(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isSymbol.mjs
function Et(e) {
	return typeof e == "symbol" || e instanceof Symbol;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/toString.mjs
function Dt(e) {
	return e == null ? "" : Ot(e);
}
function Ot(e) {
	if (typeof e == "string") return e;
	if (Array.isArray(e)) return e.map(Ot).join(",");
	if (Et(e)) return e.toString();
	let t = e + "";
	return t === "0" && Object.is(Number(e), -0) ? "-0" : t;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/toPath.mjs
function kt(e) {
	if (Array.isArray(e)) return e.map(Tt);
	if (typeof e == "symbol") return [e];
	e = Dt(e);
	let t = [], n = e.length;
	if (n === 0) return t;
	let r = 0, i = "", a = "", o = !1, s = !1, c = /^-?\d+(?:\.\d+)?$/;
	for (e.charCodeAt(0) === 46 && t.push(""); r < n;) {
		let l = e[r];
		if (a) l === "\\" && r + 1 < n ? (r++, i += e[r]) : l === a ? a = "" : i += l;
		else if (o) {
			if (l === "\"" || l === "'") a = l, s = !0;
			else if (l === "]") {
				if (o = !1, !s && i.includes(".") && !c.test(i)) {
					let e = i.split(".");
					for (let n = 0; n < e.length; n++) e[n] !== "" && t.push(e[n]);
				} else t.push(i);
				i = "";
			} else i += l;
		} else if (l === "[") o = !0, s = !1, i &&= (t.push(i), "");
		else if (l === ".") {
			i &&= (t.push(i), "");
			let n = e[r + 1];
			(n === void 0 || n === ".") && t.push("");
		} else i += l;
		r++;
	}
	return i && t.push(i), t;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/get.mjs
function At(e, t, n) {
	if (e == null) return n;
	switch (typeof t) {
		case "string": {
			if (St(t)) return n;
			let r = e[t];
			return r === void 0 ? wt(t) && !Object.hasOwn(e, t) ? At(e, kt(t), n) : n : r;
		}
		case "number":
		case "symbol": {
			typeof t == "number" && (t = Tt(t));
			let r = e[t];
			return r === void 0 ? n : r;
		}
		default: {
			if (Array.isArray(t)) return jt(e, t, n);
			if (t = Object.is(t?.valueOf(), -0) ? "-0" : String(t), St(t)) return n;
			let r = e[t];
			return r === void 0 ? n : r;
		}
	}
}
function jt(e, t, n) {
	if (t.length === 0) return n;
	let r = e;
	for (let e = 0; e < t.length; e++) {
		if (r == null || St(t[e])) return n;
		r = r[t[e]];
	}
	return r === void 0 ? n : r;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/round.js
var Mt = 4;
function Nt(e) {
	var t = 10 ** (arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Mt), n = Math.round(e * t) / t;
	return Object.is(n, -0) ? 0 : n;
}
function Pt(e) {
	var t = [...arguments].slice(1);
	return e.reduce((e, n, r) => {
		var i = t[r - 1];
		return typeof i == "string" ? e + i + n : i === void 0 ? e + n : e + Nt(i) + n;
	}, "");
}
// ../../../peach/frontend/node_modules/recharts/es6/util/DataUtils.js
var Ft = (e) => e === 0 ? 0 : e > 0 ? 1 : -1, It = (e) => typeof e == "number" && e != +e, Lt = (e) => typeof e == "string" && e.length > 1 && e.indexOf("%") === e.length - 1, I = (e) => (typeof e == "number" || e instanceof Number) && !It(e), Rt = (e) => I(e) || typeof e == "string", zt = 0, Bt = (e) => {
	var t = ++zt;
	return `${e || ""}${t}`;
}, Vt = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, r = arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
	if (!I(e) && typeof e != "string") return n;
	var i;
	if (Lt(e)) {
		if (t == null) return n;
		var a = e.indexOf("%");
		i = t * parseFloat(e.slice(0, a)) / 100;
	} else i = +e;
	return It(i) && (i = n), r && t != null && i > t && (i = t), i;
}, Ht = (e) => {
	if (!Array.isArray(e)) return !1;
	for (var t = e.length, n = {}, r = 0; r < t; r++) if (!n[String(e[r])]) n[String(e[r])] = !0;
	else return !0;
	return !1;
};
function L(e, t, n) {
	return I(e) && I(t) ? Nt(e + n * (t - e)) : t;
}
function Ut(e, t, n) {
	if (e && e.length) return e.find((e) => e && (typeof t == "function" ? t(e) : At(e, t)) === n);
}
var R = (e) => e == null, Wt = (e) => R(e) ? e : `${e.charAt(0).toUpperCase()}${e.slice(1)}`;
function Gt(e) {
	return e != null;
}
function Kt() {}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/cartesianViewBoxToTrapezoid.js
function qt(e) {
	if (e) return {
		x: e.x,
		y: e.y,
		upperWidth: "upperWidth" in e ? e.upperWidth : e.width,
		lowerWidth: "lowerWidth" in e ? e.lowerWidth : e.width,
		width: e.width,
		height: e.height
	};
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/getCartesianPosition.js
function Jt(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Yt(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Jt(Object(n), !0).forEach(function(t) {
			Xt(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Jt(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Xt(e, t, n) {
	return (t = Zt(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Zt(e) {
	var t = Qt(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Qt(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var $t = (e) => {
	var t = e.viewBox, n = e.position, r = e.offset, i = r === void 0 ? 0 : r, a = e.parentViewBox, o = e.clamp, s = qt(t), c = s.x, l = s.y, u = s.height, d = s.upperWidth, f = s.lowerWidth, p = c, m = c + (d - f) / 2, h = (p + m) / 2, g = (d + f) / 2, _ = p + d / 2, v = u >= 0 ? 1 : -1, y = v * i, b = v > 0 ? "end" : "start", x = v > 0 ? "start" : "end", S = d >= 0 ? 1 : -1, C = S * i, w = S > 0 ? "end" : "start", T = S > 0 ? "start" : "end", E = a;
	if (n === "top") {
		var D = {
			x: p + d / 2,
			y: l - y,
			horizontalAnchor: "middle",
			verticalAnchor: b
		};
		return o && E && (D.height = Math.max(l - E.y, 0), D.width = d), D;
	}
	if (n === "bottom") {
		var O = {
			x: m + f / 2,
			y: l + u + y,
			horizontalAnchor: "middle",
			verticalAnchor: x
		};
		return o && E && (O.height = Math.max(E.y + E.height - (l + u), 0), O.width = f), O;
	}
	if (n === "left") {
		var k = {
			x: h - C,
			y: l + u / 2,
			horizontalAnchor: w,
			verticalAnchor: "middle"
		};
		return o && E && (k.width = Math.max(k.x - E.x, 0), k.height = u), k;
	}
	if (n === "right") {
		var A = {
			x: h + g + C,
			y: l + u / 2,
			horizontalAnchor: T,
			verticalAnchor: "middle"
		};
		return o && E && (A.width = Math.max(E.x + E.width - A.x, 0), A.height = u), A;
	}
	var j = o && E ? {
		width: g,
		height: u
	} : {};
	return n === "insideLeft" ? Yt({
		x: h + C,
		y: l + u / 2,
		horizontalAnchor: T,
		verticalAnchor: "middle"
	}, j) : n === "insideRight" ? Yt({
		x: h + g - C,
		y: l + u / 2,
		horizontalAnchor: w,
		verticalAnchor: "middle"
	}, j) : n === "insideTop" ? Yt({
		x: p + d / 2,
		y: l + y,
		horizontalAnchor: "middle",
		verticalAnchor: x
	}, j) : n === "insideBottom" ? Yt({
		x: m + f / 2,
		y: l + u - y,
		horizontalAnchor: "middle",
		verticalAnchor: b
	}, j) : n === "insideTopLeft" ? Yt({
		x: p + C,
		y: l + y,
		horizontalAnchor: T,
		verticalAnchor: x
	}, j) : n === "insideTopRight" ? Yt({
		x: p + d - C,
		y: l + y,
		horizontalAnchor: w,
		verticalAnchor: x
	}, j) : n === "insideBottomLeft" ? Yt({
		x: m + C,
		y: l + u - y,
		horizontalAnchor: T,
		verticalAnchor: b
	}, j) : n === "insideBottomRight" ? Yt({
		x: m + f - C,
		y: l + u - y,
		horizontalAnchor: w,
		verticalAnchor: b
	}, j) : n && typeof n == "object" && (I(n.x) || Lt(n.x)) && (I(n.y) || Lt(n.y)) ? Yt({
		x: c + Vt(n.x, g),
		y: l + Vt(n.y, u),
		horizontalAnchor: "end",
		verticalAnchor: "end"
	}, j) : Yt({
		x: _,
		y: l + u / 2,
		horizontalAnchor: "middle",
		verticalAnchor: "middle"
	}, j);
}, en = [
	"top",
	"left",
	"right",
	"bottom"
];
function tn(e) {
	return e == null ? !1 : typeof e == "object" || en.includes(e);
}
// ../../../peach/frontend/node_modules/recharts/es6/context/legendPortalContext.js
var nn = /*#__PURE__*/ (0, P.createContext)(null), rn = () => (0, P.useContext)(nn);
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/constant.js
function z(e) {
	return function() {
		return e;
	};
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/math.js
var an = Math.cos, on = Math.sin, sn = Math.sqrt, cn = Math.PI;
cn / 2;
var ln = 2 * cn, un = Math.PI, dn = 2 * un, fn = 1e-6, pn = dn - fn;
function mn(e) {
	this._ += e[0];
	for (let t = 1, n = e.length; t < n; ++t) this._ += arguments[t] + e[t];
}
function hn(e) {
	let t = Math.floor(e);
	if (!(t >= 0)) throw Error(`invalid digits: ${e}`);
	if (t > 15) return mn;
	let n = 10 ** t;
	return function(e) {
		this._ += e[0];
		for (let t = 1, r = e.length; t < r; ++t) this._ += Math.round(arguments[t] * n) / n + e[t];
	};
}
var gn = class {
	constructor(e) {
		this._x0 = this._y0 = this._x1 = this._y1 = null, this._ = "", this._append = e == null ? mn : hn(e);
	}
	moveTo(e, t) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}`;
	}
	closePath() {
		this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
	}
	lineTo(e, t) {
		this._append`L${this._x1 = +e},${this._y1 = +t}`;
	}
	quadraticCurveTo(e, t, n, r) {
		this._append`Q${+e},${+t},${this._x1 = +n},${this._y1 = +r}`;
	}
	bezierCurveTo(e, t, n, r, i, a) {
		this._append`C${+e},${+t},${+n},${+r},${this._x1 = +i},${this._y1 = +a}`;
	}
	arcTo(e, t, n, r, i) {
		if (e = +e, t = +t, n = +n, r = +r, i = +i, i < 0) throw Error(`negative radius: ${i}`);
		let a = this._x1, o = this._y1, s = n - e, c = r - t, l = a - e, u = o - t, d = l * l + u * u;
		if (this._x1 === null) this._append`M${this._x1 = e},${this._y1 = t}`;
		else if (d > fn) {
			if (!(Math.abs(u * s - c * l) > fn) || !i) this._append`L${this._x1 = e},${this._y1 = t}`;
			else {
				let f = n - a, p = r - o, m = s * s + c * c, h = f * f + p * p, g = Math.sqrt(m), _ = Math.sqrt(d), v = i * Math.tan((un - Math.acos((m + d - h) / (2 * g * _))) / 2), y = v / _, b = v / g;
				Math.abs(y - 1) > fn && this._append`L${e + y * l},${t + y * u}`, this._append`A${i},${i},0,0,${+(u * f > l * p)},${this._x1 = e + b * s},${this._y1 = t + b * c}`;
			}
		}
	}
	arc(e, t, n, r, i, a) {
		if (e = +e, t = +t, n = +n, a = !!a, n < 0) throw Error(`negative radius: ${n}`);
		let o = n * Math.cos(r), s = n * Math.sin(r), c = e + o, l = t + s, u = 1 ^ a, d = a ? r - i : i - r;
		this._x1 === null ? this._append`M${c},${l}` : (Math.abs(this._x1 - c) > fn || Math.abs(this._y1 - l) > fn) && this._append`L${c},${l}`, n && (d < 0 && (d = d % dn + dn), d > pn ? this._append`A${n},${n},0,1,${u},${e - o},${t - s}A${n},${n},0,1,${u},${this._x1 = c},${this._y1 = l}` : d > fn && this._append`A${n},${n},0,${+(d >= un)},${u},${this._x1 = e + n * Math.cos(i)},${this._y1 = t + n * Math.sin(i)}`);
	}
	rect(e, t, n, r) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}h${n = +n}v${+r}h${-n}Z`;
	}
	toString() {
		return this._;
	}
};
gn.prototype;
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/path.js
function _n(e) {
	let t = 3;
	return e.digits = function(n) {
		if (!arguments.length) return t;
		if (n == null) t = null;
		else {
			let e = Math.floor(n);
			if (!(e >= 0)) throw RangeError(`invalid digits: ${n}`);
			t = e;
		}
		return e;
	}, () => new gn(t);
}
Array.prototype.slice;
function vn(e) {
	return typeof e == "object" && "length" in e ? e : Array.from(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/linear.js
function yn(e) {
	this._context = e;
}
yn.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: this._context.lineTo(e, t);
		}
	}
};
function bn(e) {
	return new yn(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/point.js
function xn(e) {
	return e[0];
}
function Sn(e) {
	return e[1];
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/line.js
function Cn(e, t) {
	var n = z(!0), r = null, i = bn, a = null, o = _n(s);
	e = typeof e == "function" ? e : e === void 0 ? xn : z(e), t = typeof t == "function" ? t : t === void 0 ? Sn : z(t);
	function s(s) {
		var c, l = (s = vn(s)).length, u, d = !1, f;
		for (r ?? (a = i(f = o())), c = 0; c <= l; ++c) !(c < l && n(u = s[c], c, s)) === d && ((d = !d) ? a.lineStart() : a.lineEnd()), d && a.point(+e(u, c, s), +t(u, c, s));
		if (f) return a = null, f + "" || null;
	}
	return s.x = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : z(+t), s) : e;
	}, s.y = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : z(+e), s) : t;
	}, s.defined = function(e) {
		return arguments.length ? (n = typeof e == "function" ? e : z(!!e), s) : n;
	}, s.curve = function(e) {
		return arguments.length ? (i = e, r != null && (a = i(r)), s) : i;
	}, s.context = function(e) {
		return arguments.length ? (e == null ? r = a = null : a = i(r = e), s) : r;
	}, s;
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/area.js
function wn(e, t, n) {
	var r = null, i = z(!0), a = null, o = bn, s = null, c = _n(l);
	e = typeof e == "function" ? e : e === void 0 ? xn : z(+e), t = typeof t == "function" ? t : z(t === void 0 ? 0 : +t), n = typeof n == "function" ? n : n === void 0 ? Sn : z(+n);
	function l(l) {
		var u, d, f, p = (l = vn(l)).length, m, h = !1, g, _ = Array(p), v = Array(p);
		for (a ?? (s = o(g = c())), u = 0; u <= p; ++u) {
			if (!(u < p && i(m = l[u], u, l)) === h) {
				if (h = !h) d = u, s.areaStart(), s.lineStart();
				else {
					for (s.lineEnd(), s.lineStart(), f = u - 1; f >= d; --f) s.point(_[f], v[f]);
					s.lineEnd(), s.areaEnd();
				}
			}
			h && (_[u] = +e(m, u, l), v[u] = +t(m, u, l), s.point(r ? +r(m, u, l) : _[u], n ? +n(m, u, l) : v[u]));
		}
		if (g) return s = null, g + "" || null;
	}
	function u() {
		return Cn().defined(i).curve(o).context(a);
	}
	return l.x = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : z(+t), r = null, l) : e;
	}, l.x0 = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : z(+t), l) : e;
	}, l.x1 = function(e) {
		return arguments.length ? (r = e == null ? null : typeof e == "function" ? e : z(+e), l) : r;
	}, l.y = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : z(+e), n = null, l) : t;
	}, l.y0 = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : z(+e), l) : t;
	}, l.y1 = function(e) {
		return arguments.length ? (n = e == null ? null : typeof e == "function" ? e : z(+e), l) : n;
	}, l.lineX0 = l.lineY0 = function() {
		return u().x(e).y(t);
	}, l.lineY1 = function() {
		return u().x(e).y(n);
	}, l.lineX1 = function() {
		return u().x(r).y(t);
	}, l.defined = function(e) {
		return arguments.length ? (i = typeof e == "function" ? e : z(!!e), l) : i;
	}, l.curve = function(e) {
		return arguments.length ? (o = e, a != null && (s = o(a)), l) : o;
	}, l.context = function(e) {
		return arguments.length ? (e == null ? a = s = null : s = o(a = e), l) : a;
	}, l;
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/bump.js
var Tn = class {
	constructor(e, t) {
		this._context = e, this._x = t;
	}
	areaStart() {
		this._line = 0;
	}
	areaEnd() {
		this._line = NaN;
	}
	lineStart() {
		this._point = 0;
	}
	lineEnd() {
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	}
	point(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: this._x ? this._context.bezierCurveTo(this._x0 = (this._x0 + e) / 2, this._y0, this._x0, t, e, t) : this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + t) / 2, e, this._y0, e, t);
		}
		this._x0 = e, this._y0 = t;
	}
};
function En(e) {
	return new Tn(e, !0);
}
function Dn(e) {
	return new Tn(e, !1);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/symbol/circle.js
var On = { draw(e, t) {
	let n = sn(t / cn);
	e.moveTo(n, 0), e.arc(0, 0, n, 0, ln);
} }, kn = { draw(e, t) {
	let n = sn(t / 5) / 2;
	e.moveTo(-3 * n, -n), e.lineTo(-n, -n), e.lineTo(-n, -3 * n), e.lineTo(n, -3 * n), e.lineTo(n, -n), e.lineTo(3 * n, -n), e.lineTo(3 * n, n), e.lineTo(n, n), e.lineTo(n, 3 * n), e.lineTo(-n, 3 * n), e.lineTo(-n, n), e.lineTo(-3 * n, n), e.closePath();
} }, An = sn(1 / 3), jn = An * 2, Mn = { draw(e, t) {
	let n = sn(t / jn), r = n * An;
	e.moveTo(0, -n), e.lineTo(r, 0), e.lineTo(0, n), e.lineTo(-r, 0), e.closePath();
} }, Nn = { draw(e, t) {
	let n = sn(t), r = -n / 2;
	e.rect(r, r, n, n);
} }, Pn = .8908130915292852, Fn = on(cn / 10) / on(7 * cn / 10), In = on(ln / 10) * Fn, Ln = -an(ln / 10) * Fn, Rn = { draw(e, t) {
	let n = sn(t * Pn), r = In * n, i = Ln * n;
	e.moveTo(0, -n), e.lineTo(r, i);
	for (let t = 1; t < 5; ++t) {
		let a = ln * t / 5, o = an(a), s = on(a);
		e.lineTo(s * n, -o * n), e.lineTo(o * r - s * i, s * r + o * i);
	}
	e.closePath();
} }, zn = sn(3), Bn = { draw(e, t) {
	let n = -sn(t / (zn * 3));
	e.moveTo(0, n * 2), e.lineTo(-zn * n, -n), e.lineTo(zn * n, -n), e.closePath();
} }, Vn = -.5, Hn = sn(3) / 2, Un = 1 / sn(12), Wn = (Un / 2 + 1) * 3, Gn = { draw(e, t) {
	let n = sn(t / Wn), r = n / 2, i = n * Un, a = r, o = n * Un + n, s = -a, c = o;
	e.moveTo(r, i), e.lineTo(a, o), e.lineTo(s, c), e.lineTo(Vn * r - Hn * i, Hn * r + Vn * i), e.lineTo(Vn * a - Hn * o, Hn * a + Vn * o), e.lineTo(Vn * s - Hn * c, Hn * s + Vn * c), e.lineTo(Vn * r + Hn * i, Vn * i - Hn * r), e.lineTo(Vn * a + Hn * o, Vn * o - Hn * a), e.lineTo(Vn * s + Hn * c, Vn * c - Hn * s), e.closePath();
} };
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/symbol.js
function Kn(e, t) {
	let n = null, r = _n(i);
	e = typeof e == "function" ? e : z(e || On), t = typeof t == "function" ? t : z(t === void 0 ? 64 : +t);
	function i() {
		let i;
		if (n ||= i = r(), e.apply(this, arguments).draw(n, +t.apply(this, arguments)), i) return n = null, i + "" || null;
	}
	return i.type = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : z(t), i) : e;
	}, i.size = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : z(+e), i) : t;
	}, i.context = function(e) {
		return arguments.length ? (n = e ?? null, i) : n;
	}, i;
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/noop.js
function qn() {}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/basis.js
function Jn(e, t, n) {
	e._context.bezierCurveTo((2 * e._x0 + e._x1) / 3, (2 * e._y0 + e._y1) / 3, (e._x0 + 2 * e._x1) / 3, (e._y0 + 2 * e._y1) / 3, (e._x0 + 4 * e._x1 + t) / 6, (e._y0 + 4 * e._y1 + n) / 6);
}
function Yn(e) {
	this._context = e;
}
Yn.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 3: Jn(this, this._x1, this._y1);
			case 2: this._context.lineTo(this._x1, this._y1);
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1:
				this._point = 2;
				break;
			case 2: this._point = 3, this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
			default: Jn(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function Xn(e) {
	return new Yn(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/basisClosed.js
function Zn(e) {
	this._context = e;
}
Zn.prototype = {
	areaStart: qn,
	areaEnd: qn,
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 1:
				this._context.moveTo(this._x2, this._y2), this._context.closePath();
				break;
			case 2:
				this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3), this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3), this._context.closePath();
				break;
			case 3: this.point(this._x2, this._y2), this.point(this._x3, this._y3), this.point(this._x4, this._y4);
		}
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._x2 = e, this._y2 = t;
				break;
			case 1:
				this._point = 2, this._x3 = e, this._y3 = t;
				break;
			case 2:
				this._point = 3, this._x4 = e, this._y4 = t, this._context.moveTo((this._x0 + 4 * this._x1 + e) / 6, (this._y0 + 4 * this._y1 + t) / 6);
				break;
			default: Jn(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function Qn(e) {
	return new Zn(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/basisOpen.js
function $n(e) {
	this._context = e;
}
$n.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1;
				break;
			case 1:
				this._point = 2;
				break;
			case 2:
				this._point = 3;
				var n = (this._x0 + 4 * this._x1 + e) / 6, r = (this._y0 + 4 * this._y1 + t) / 6;
				this._line ? this._context.lineTo(n, r) : this._context.moveTo(n, r);
				break;
			case 3: this._point = 4;
			default: Jn(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function er(e) {
	return new $n(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/linearClosed.js
function tr(e) {
	this._context = e;
}
tr.prototype = {
	areaStart: qn,
	areaEnd: qn,
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		this._point && this._context.closePath();
	},
	point: function(e, t) {
		e = +e, t = +t, this._point ? this._context.lineTo(e, t) : (this._point = 1, this._context.moveTo(e, t));
	}
};
function nr(e) {
	return new tr(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/monotone.js
function rr(e) {
	return e < 0 ? -1 : 1;
}
function ir(e, t, n) {
	var r = e._x1 - e._x0, i = t - e._x1, a = (e._y1 - e._y0) / (r || i < 0 && -0), o = (n - e._y1) / (i || r < 0 && -0), s = (a * i + o * r) / (r + i);
	return (rr(a) + rr(o)) * Math.min(Math.abs(a), Math.abs(o), .5 * Math.abs(s)) || 0;
}
function ar(e, t) {
	var n = e._x1 - e._x0;
	return n ? (3 * (e._y1 - e._y0) / n - t) / 2 : t;
}
function or(e, t, n) {
	var r = e._x0, i = e._y0, a = e._x1, o = e._y1, s = (a - r) / 3;
	e._context.bezierCurveTo(r + s, i + s * t, a - s, o - s * n, a, o);
}
function sr(e) {
	this._context = e;
}
sr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x1, this._y1);
				break;
			case 3: or(this, this._t0, ar(this, this._t0));
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		var n = NaN;
		if (e = +e, t = +t, e !== this._x1 || t !== this._y1) {
			switch (this._point) {
				case 0:
					this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
					break;
				case 1:
					this._point = 2;
					break;
				case 2:
					this._point = 3, or(this, ar(this, n = ir(this, e, t)), n);
					break;
				default: or(this, this._t0, n = ir(this, e, t));
			}
			this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t, this._t0 = n;
		}
	}
};
function cr(e) {
	this._context = new lr(e);
}
(cr.prototype = Object.create(sr.prototype)).point = function(e, t) {
	sr.prototype.point.call(this, t, e);
};
function lr(e) {
	this._context = e;
}
lr.prototype = {
	moveTo: function(e, t) {
		this._context.moveTo(t, e);
	},
	closePath: function() {
		this._context.closePath();
	},
	lineTo: function(e, t) {
		this._context.lineTo(t, e);
	},
	bezierCurveTo: function(e, t, n, r, i, a) {
		this._context.bezierCurveTo(t, e, r, n, a, i);
	}
};
function ur(e) {
	return new sr(e);
}
function dr(e) {
	return new cr(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/natural.js
function fr(e) {
	this._context = e;
}
fr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = [], this._y = [];
	},
	lineEnd: function() {
		var e = this._x, t = this._y, n = e.length;
		if (n) {
			if (this._line ? this._context.lineTo(e[0], t[0]) : this._context.moveTo(e[0], t[0]), n === 2) this._context.lineTo(e[1], t[1]);
			else for (var r = pr(e), i = pr(t), a = 0, o = 1; o < n; ++a, ++o) this._context.bezierCurveTo(r[0][a], i[0][a], r[1][a], i[1][a], e[o], t[o]);
		}
		(this._line || this._line !== 0 && n === 1) && this._context.closePath(), this._line = 1 - this._line, this._x = this._y = null;
	},
	point: function(e, t) {
		this._x.push(+e), this._y.push(+t);
	}
};
function pr(e) {
	var t, n = e.length - 1, r, i = Array(n), a = Array(n), o = Array(n);
	for (i[0] = 0, a[0] = 2, o[0] = e[0] + 2 * e[1], t = 1; t < n - 1; ++t) i[t] = 1, a[t] = 4, o[t] = 4 * e[t] + 2 * e[t + 1];
	for (i[n - 1] = 2, a[n - 1] = 7, o[n - 1] = 8 * e[n - 1] + e[n], t = 1; t < n; ++t) r = i[t] / a[t - 1], a[t] -= r, o[t] -= r * o[t - 1];
	for (i[n - 1] = o[n - 1] / a[n - 1], t = n - 2; t >= 0; --t) i[t] = (o[t] - i[t + 1]) / a[t];
	for (a[n - 1] = (e[n] + i[n - 1]) / 2, t = 0; t < n - 1; ++t) a[t] = 2 * e[t + 1] - i[t + 1];
	return [i, a];
}
function mr(e) {
	return new fr(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/step.js
function hr(e, t) {
	this._context = e, this._t = t;
}
hr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = this._y = NaN, this._point = 0;
	},
	lineEnd: function() {
		0 < this._t && this._t < 1 && this._point === 2 && this._context.lineTo(this._x, this._y), (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line >= 0 && (this._t = 1 - this._t, this._line = 1 - this._line);
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: if (this._t <= 0) this._context.lineTo(this._x, t), this._context.lineTo(e, t);
			else {
				var n = this._x * (1 - this._t) + e * this._t;
				this._context.lineTo(n, this._y), this._context.lineTo(n, t);
			}
		}
		this._x = e, this._y = t;
	}
};
function gr(e) {
	return new hr(e, .5);
}
function _r(e) {
	return new hr(e, 0);
}
function vr(e) {
	return new hr(e, 1);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/offset/none.js
function yr(e, t) {
	if ((o = e.length) > 1) for (var n = 1, r, i, a = e[t[0]], o, s = a.length; n < o; ++n) for (i = a, a = e[t[n]], r = 0; r < s; ++r) a[r][1] += a[r][0] = isNaN(i[r][1]) ? i[r][0] : i[r][1];
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/order/none.js
function br(e) {
	for (var t = e.length, n = Array(t); --t >= 0;) n[t] = t;
	return n;
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/stack.js
function xr(e, t) {
	return e[t];
}
function Sr(e) {
	let t = [];
	return t.key = e, t;
}
function Cr() {
	var e = z([]), t = br, n = yr, r = xr;
	function i(i) {
		var a = Array.from(e.apply(this, arguments), Sr), o, s = a.length, c = -1, l;
		for (let e of i) for (o = 0, ++c; o < s; ++o) (a[o][c] = [0, +r(e, a[o].key, c, i)]).data = e;
		for (o = 0, l = vn(t(a)); o < s; ++o) a[l[o]].index = o;
		return n(a, l), a;
	}
	return i.keys = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : z(Array.from(t)), i) : e;
	}, i.value = function(e) {
		return arguments.length ? (r = typeof e == "function" ? e : z(+e), i) : r;
	}, i.order = function(e) {
		return arguments.length ? (t = e == null ? br : typeof e == "function" ? e : z(Array.from(e)), i) : t;
	}, i.offset = function(e) {
		return arguments.length ? (n = e ?? yr, i) : n;
	}, i;
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/offset/expand.js
function wr(e, t) {
	if ((r = e.length) > 0) {
		for (var n, r, i = 0, a = e[0].length, o; i < a; ++i) {
			for (o = n = 0; n < r; ++n) o += e[n][i][1] || 0;
			if (o) for (n = 0; n < r; ++n) e[n][i][1] /= o;
		}
		yr(e, t);
	}
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/offset/silhouette.js
function Tr(e, t) {
	if ((i = e.length) > 0) {
		for (var n = 0, r = e[t[0]], i, a = r.length; n < a; ++n) {
			for (var o = 0, s = 0; o < i; ++o) s += e[o][n][1] || 0;
			r[n][1] += r[n][0] = -s / 2;
		}
		yr(e, t);
	}
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/offset/wiggle.js
function Er(e, t) {
	if ((o = e.length) > 0 && (a = (i = e[t[0]]).length) > 0) {
		for (var n = 0, r = 1, i, a, o; r < a; ++r) {
			for (var s = 0, c = 0, l = 0; s < o; ++s) {
				for (var u = e[t[s]], d = u[r][1] || 0, f = (d - (u[r - 1][1] || 0)) / 2, p = 0; p < s; ++p) {
					var m = e[t[p]], h = m[r][1] || 0, g = m[r - 1][1] || 0;
					f += h - g;
				}
				c += d, l += f * d;
			}
			i[r - 1][1] += i[r - 1][0] = n, c && (n -= l / c);
		}
		i[r - 1][1] += i[r - 1][0] = n, yr(e, t);
	}
}
// ../../../peach/frontend/node_modules/recharts/es6/shape/Symbols.js
var Dr = [
	"type",
	"size",
	"sizeType"
];
function Or() {
	return Or = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Or.apply(null, arguments);
}
function kr(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Ar(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? kr(Object(n), !0).forEach(function(t) {
			jr(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kr(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function jr(e, t, n) {
	return (t = Mr(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Mr(e) {
	var t = Nr(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Nr(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Pr(e, t) {
	if (e == null) return {};
	var n, r, i = Fr(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Fr(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var Ir = {
	symbolCircle: On,
	symbolCross: kn,
	symbolDiamond: Mn,
	symbolSquare: Nn,
	symbolStar: Rn,
	symbolTriangle: Bn,
	symbolWye: Gn
}, Lr = Math.PI / 180, Rr = (e) => Ir[`symbol${Wt(e)}`] || On, zr = (e, t, n) => {
	if (t === "area") return e;
	switch (n) {
		case "cross": return 5 * e * e / 9;
		case "diamond": return .5 * e * e / Math.sqrt(3);
		case "square": return e * e;
		case "star":
			var r = 18 * Lr;
			return 1.25 * e * e * (Math.tan(r) - Math.tan(r * 2) * Math.tan(r) ** 2);
		case "triangle": return Math.sqrt(3) * e * e / 4;
		case "wye": return (21 - 10 * Math.sqrt(3)) * e * e / 8;
		default: return Math.PI * e * e / 4;
	}
}, Br = (e, t) => {
	Ir[`symbol${Wt(e)}`] = t;
}, Vr = (e) => {
	var t = e.type, n = t === void 0 ? "circle" : t, r = e.size, i = r === void 0 ? 64 : r, a = e.sizeType, o = a === void 0 ? "area" : a, s = Ar(Ar({}, Pr(e, Dr)), {}, {
		type: n,
		size: i,
		sizeType: o
	}), c = "circle";
	typeof n == "string" && (c = n);
	var l = () => {
		var e = Rr(c), t = Kn().type(e).size(zr(i, o, c))();
		if (t !== null) return t;
	}, u = s.className, d = s.cx, f = s.cy, p = dt(s);
	return I(d) && I(f) && I(i) ? /*#__PURE__*/ P.createElement("path", Or({}, p, {
		className: N("recharts-symbols", u),
		transform: `translate(${d}, ${f})`,
		d: l()
	})) : null;
};
Vr.registerSymbol = Br;
// ../../../peach/frontend/node_modules/recharts/es6/util/types.js
var Hr = (e) => "radius" in e && "startAngle" in e && "endAngle" in e, Ur = (e, t) => {
	if (!e || typeof e == "function" || typeof e == "boolean") return null;
	var n = e;
	if (/*#__PURE__*/ (0, P.isValidElement)(e) && (n = e.props), typeof n != "object" && typeof n != "function") return null;
	var r = {};
	return Object.keys(n).forEach((e) => {
		at(e) && typeof n[e] == "function" && (r[e] = t || ((t) => n[e](n, t)));
	}), r;
}, Wr = (e, t, n) => (r) => (e(t, n, r), null), Gr = (e, t, n) => {
	if (e === null || typeof e != "object" && typeof e != "function") return null;
	var r = null;
	return Object.keys(e).forEach((i) => {
		var a = e[i];
		at(i) && typeof a == "function" && (r ||= {}, r[i] = Wr(a, t, n));
	}), r;
};
// ../../../peach/frontend/node_modules/recharts/es6/util/resolveDefaultProps.js
function Kr(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function qr(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Kr(Object(n), !0).forEach(function(t) {
			Jr(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Kr(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Jr(e, t, n) {
	return (t = Yr(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Yr(e) {
	var t = Xr(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Xr(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Zr(e, t) {
	var n = qr({}, e), r = t;
	return Object.keys(t).reduce((e, t) => (e[t] === void 0 && r[t] !== void 0 && (e[t] = r[t]), e), n);
}
// ../../../peach/frontend/node_modules/recharts/es6/component/DefaultLegendContent.js
function Qr() {
	return Qr = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Qr.apply(null, arguments);
}
function $r(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ei(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? $r(Object(n), !0).forEach(function(t) {
			ti(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $r(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function ti(e, t, n) {
	return (t = ni(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ni(e) {
	var t = ri(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ri(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var ii = 32, ai = {
	align: "center",
	iconSize: 14,
	inactiveColor: "#ccc",
	layout: "horizontal",
	verticalAlign: "middle",
	labelStyle: {}
};
function oi(e) {
	if (typeof e == "object" && e && "strokeDasharray" in e) return String(e.strokeDasharray);
}
function si(e) {
	var t = e.data, n = e.iconType, r = e.inactiveColor, i = ii / 2, a = ii / 6, o = ii / 3, s = t.inactive ? r : t.color, c = n ?? t.type;
	if (c === "none") return null;
	if (c === "plainline") return /*#__PURE__*/ P.createElement("line", {
		strokeWidth: 4,
		fill: "none",
		stroke: s,
		strokeDasharray: oi(t.payload),
		x1: 0,
		y1: i,
		x2: ii,
		y2: i,
		className: "recharts-legend-icon"
	});
	if (c === "line") return /*#__PURE__*/ P.createElement("path", {
		strokeWidth: 4,
		fill: "none",
		stroke: s,
		d: `M0,${i}h${o}
            A${a},${a},0,1,1,${2 * o},${i}
            H${ii}M${2 * o},${i}
            A${a},${a},0,1,1,${o},${i}`,
		className: "recharts-legend-icon"
	});
	if (c === "rect") return /*#__PURE__*/ P.createElement("path", {
		stroke: "none",
		fill: s,
		d: `M0,${ii / 8}h${ii}v${ii * 3 / 4}h${-ii}z`,
		className: "recharts-legend-icon"
	});
	if (/*#__PURE__*/ P.isValidElement(t.legendIcon)) {
		var l = ei({}, t);
		return delete l.legendIcon, /*#__PURE__*/ P.cloneElement(t.legendIcon, l);
	}
	return /*#__PURE__*/ P.createElement(Vr, {
		fill: s,
		cx: i,
		cy: i,
		size: ii,
		sizeType: "diameter",
		type: c
	});
}
function ci(e) {
	var t = e.payload, n = e.iconSize, r = e.layout, i = e.formatter, a = e.inactiveColor, o = e.iconType, s = e.labelStyle, c = {
		x: 0,
		y: 0,
		width: ii,
		height: ii
	}, l = {
		display: r === "horizontal" ? "inline-block" : "block",
		marginRight: 10,
		whiteSpace: "nowrap"
	}, u = {
		display: "inline-block",
		verticalAlign: "middle",
		marginRight: 4
	};
	return t.map((t, r) => {
		var d = t.formatter || i, f = N({
			"recharts-legend-item": !0,
			[`legend-item-${r}`]: !0,
			inactive: t.inactive
		});
		if (t.type === "none") return null;
		var p = typeof s == "object" ? ei({}, s) : {};
		p.color = t.inactive ? a : p.color || t.color, p.whiteSpace ??= "normal", p.overflowWrap ??= "break-word";
		var m = d ? d(t.value, t, r) : t.value;
		return /*#__PURE__*/ P.createElement("li", Qr({
			className: f,
			style: l,
			key: `legend-item-${r}`
		}, Gr(e, t, r)), /*#__PURE__*/ P.createElement(_t, {
			width: n,
			height: n,
			viewBox: c,
			style: u,
			"aria-label": t.value == null ? "legend icon" : `${t.value} legend icon`
		}, /*#__PURE__*/ P.createElement(si, {
			data: t,
			iconType: o,
			inactiveColor: a
		})), /*#__PURE__*/ P.createElement("span", {
			className: "recharts-legend-item-text",
			style: p
		}, m));
	});
}
var li = (e) => {
	var t = Zr(e, ai), n = t.payload, r = t.layout, i = t.align;
	if (!n || !n.length) return null;
	var a = {
		padding: 0,
		margin: 0,
		textAlign: r === "horizontal" ? i : "left"
	};
	return /*#__PURE__*/ P.createElement("ul", {
		className: "recharts-default-legend",
		style: a
	}, /*#__PURE__*/ P.createElement(ci, Qr({}, t, { payload: n })));
};
// ../../../peach/frontend/node_modules/es-toolkit/dist/array/uniqBy.mjs
function ui(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t(i, r, e);
		n.has(a) || n.set(a, i);
	}
	return Array.from(n.values());
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/function/ary.mjs
function di(e, t) {
	return function(...n) {
		return e.apply(this, n.slice(0, t));
	};
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/function/identity.mjs
function fi(e) {
	return e;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isLength.mjs
function pi(e) {
	return Number.isSafeInteger(e) && e >= 0;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isArrayLike.mjs
function mi(e) {
	return e != null && typeof e != "function" && pi(e.length);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/property.mjs
function hi(e) {
	return function(t) {
		return At(t, e);
	};
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function gi(e) {
	return e == null || typeof e != "object" && typeof e != "function";
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isTypedArray.mjs
function _i(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/getSymbols.mjs
function vi(e) {
	return Object.getOwnPropertySymbols(e).filter((t) => Object.prototype.propertyIsEnumerable.call(e, t));
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/getTag.mjs
function yi(e) {
	return e == null ? e === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/tags.mjs
var bi = "[object RegExp]", xi = "[object String]", Si = "[object Number]", Ci = "[object Boolean]", wi = "[object Arguments]", Ti = "[object Symbol]", Ei = "[object Date]", Di = "[object Map]", Oi = "[object Set]", ki = "[object Array]", Ai = "[object Function]", ji = "[object ArrayBuffer]", Mi = "[object Object]", Ni = "[object Error]", Pi = "[object DataView]", Fi = "[object Uint8Array]", Ii = "[object Uint8ClampedArray]", Li = "[object Uint16Array]", Ri = "[object Uint32Array]", zi = "[object BigUint64Array]", Bi = "[object Int8Array]", Vi = "[object Int16Array]", Hi = "[object Int32Array]", Ui = "[object BigInt64Array]", Wi = "[object Float32Array]", Gi = "[object Float64Array]", Ki = typeof globalThis == "object" && globalThis || typeof window == "object" && window || typeof self == "object" && self || typeof global == "object" && global || (function() {
	return this;
})();
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isBuffer.mjs
function qi(e) {
	return Ki.Buffer !== void 0 && Ki.Buffer.isBuffer(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/object/cloneDeepWith.mjs
function Ji(e, t) {
	return Yi(e, void 0, e, /* @__PURE__ */ new Map(), t);
}
function Yi(e, t, n, r = /* @__PURE__ */ new Map(), i = void 0) {
	let a = i?.(e, t, n, r);
	if (a !== void 0) return a;
	if (gi(e)) return e;
	if (r.has(e)) return r.get(e);
	if (Array.isArray(e)) {
		let t = Array(e.length);
		r.set(e, t);
		for (let a = 0; a < e.length; a++) t[a] = Yi(e[a], a, n, r, i);
		return Object.hasOwn(e, "index") && (t.index = e.index), Object.hasOwn(e, "input") && (t.input = e.input), t;
	}
	if (e instanceof Date) return new Date(e.getTime());
	if (e instanceof RegExp) {
		let t = new RegExp(e.source, e.flags);
		return t.lastIndex = e.lastIndex, t;
	}
	if (e instanceof Map) {
		let t = /* @__PURE__ */ new Map();
		r.set(e, t);
		for (let [a, o] of e) t.set(a, Yi(o, a, n, r, i));
		return t;
	}
	if (e instanceof Set) {
		let t = /* @__PURE__ */ new Set();
		r.set(e, t);
		for (let a of e) t.add(Yi(a, void 0, n, r, i));
		return t;
	}
	if (qi(e)) return e.subarray();
	if (_i(e)) {
		let t = new (Object.getPrototypeOf(e)).constructor(e.length);
		r.set(e, t);
		for (let a = 0; a < e.length; a++) t[a] = Yi(e[a], a, n, r, i);
		return t;
	}
	if (e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer) return e.slice(0);
	if (e instanceof DataView) {
		let t = new DataView(e.buffer.slice(0), e.byteOffset, e.byteLength);
		return r.set(e, t), Xi(t, e, n, r, i), t;
	}
	if (typeof File < "u" && e instanceof File) {
		let t = new File([e], e.name, { type: e.type });
		return r.set(e, t), Xi(t, e, n, r, i), t;
	}
	if (typeof Blob < "u" && e instanceof Blob) {
		let t = new Blob([e], { type: e.type });
		return r.set(e, t), Xi(t, e, n, r, i), t;
	}
	if (e instanceof Error) {
		let t = structuredClone(e);
		return r.set(e, t), t.message = e.message, t.name = e.name, t.stack = e.stack, t.cause = e.cause, t.constructor = e.constructor, Xi(t, e, n, r, i), t;
	}
	if (e instanceof Boolean) {
		let t = new Boolean(e.valueOf());
		return r.set(e, t), Xi(t, e, n, r, i), t;
	}
	if (e instanceof Number) {
		let t = new Number(e.valueOf());
		return r.set(e, t), Xi(t, e, n, r, i), t;
	}
	if (e instanceof String) {
		let t = new String(e.valueOf());
		return r.set(e, t), Xi(t, e, n, r, i), t;
	}
	if (typeof e == "object" && Zi(e)) {
		let t = Object.create(Object.getPrototypeOf(e));
		return r.set(e, t), Xi(t, e, n, r, i), t;
	}
	return e;
}
function Xi(e, t, n = e, r, i) {
	let a = [...Object.keys(t), ...vi(t)];
	for (let o = 0; o < a.length; o++) {
		let s = a[o], c = Object.getOwnPropertyDescriptor(e, s);
		(c == null || c.writable) && (e[s] = Yi(t[s], s, n, r, i));
	}
}
function Zi(e) {
	switch (yi(e)) {
		case wi:
		case ki:
		case ji:
		case Pi:
		case Ci:
		case Ei:
		case Wi:
		case Gi:
		case Bi:
		case Vi:
		case Hi:
		case Di:
		case Si:
		case Mi:
		case bi:
		case Oi:
		case xi:
		case Ti:
		case Fi:
		case Ii:
		case Li:
		case Ri: return !0;
		default: return !1;
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/object/cloneDeep.mjs
function Qi(e) {
	return Yi(e, void 0, e, /* @__PURE__ */ new Map(), void 0);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/eq.mjs
function $i(e, t) {
	return e === t || Number.isNaN(e) && Number.isNaN(t);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isObject.mjs
function ea(e) {
	return e !== null && (typeof e == "object" || typeof e == "function");
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isMatchWith.mjs
function ta(e, t, n) {
	return typeof n == "function" ? na(e, t, function e(t, r, i, a, o, s) {
		let c = n(t, r, i, a, o, s);
		return c === void 0 ? na(t, r, e, s, !1) : !!c;
	}, /* @__PURE__ */ new Map(), !0) : ta(e, t, () => void 0);
}
function na(e, t, n, r, i = !1) {
	if (t === e) return !0;
	switch (typeof t) {
		case "object": return ra(e, t, n, r, i);
		case "function": return Object.keys(t).length > 0 ? na(e, { ...t }, n, r, i) : $i(e, t);
		default: return ea(e) && i ? typeof t != "string" || t === "" : $i(e, t);
	}
}
function ra(e, t, n, r, i = !1) {
	if (t == null) return !0;
	if (Array.isArray(t)) return aa(e, t, n, r);
	if (t instanceof Map) return ia(e, t, n, r);
	if (t instanceof Set) return oa(e, t, n, r);
	let a = Object.keys(t);
	if (e == null) return i && a.length === 0;
	if (i) gi(e) && (e = Object(e));
	else {
		let t = yi(e);
		if (t !== "[object Object]" && t !== "[object Arguments]") return !1;
	}
	if (a.length === 0) return !0;
	if (r?.has(t)) return r.get(t) === e;
	r?.set(t, e);
	try {
		for (let i = 0; i < a.length; i++) {
			let o = a[i];
			if (!(o in e) || t[o] === void 0 && e[o] !== void 0 || t[o] === null && e[o] !== null || !n(e[o], t[o], o, e, t, r)) return !1;
		}
		return !0;
	} finally {
		r?.delete(t);
	}
}
function ia(e, t, n, r) {
	if (t.size === 0) return !0;
	if (!(e instanceof Map)) return !1;
	for (let [i, a] of t.entries()) if (n(e.get(i), a, i, e, t, r) === !1) return !1;
	return !0;
}
function aa(e, t, n, r) {
	if (t.length === 0) return !0;
	if (!Array.isArray(e)) return !1;
	let i = /* @__PURE__ */ new Set();
	for (let a = 0; a < t.length; a++) {
		let o = t[a], s = !1;
		for (let c = 0; c < e.length; c++) {
			if (i.has(c)) continue;
			let l = e[c], u = !1;
			if (n(l, o, a, e, t, r) && (u = !0), u) {
				i.add(c), s = !0;
				break;
			}
		}
		if (!s) return !1;
	}
	return !0;
}
function oa(e, t, n, r) {
	return t.size === 0 || e instanceof Set && aa([...e], [...t], n, r);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isMatch.mjs
function sa(e, t) {
	return ta(e, t, () => void 0);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/matches.mjs
function ca(e) {
	return e = Qi(e), (t) => sa(t, e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/cloneDeepWith.mjs
function la(e, t) {
	return Ji(e, (n, r, i, a) => {
		let o = t?.(n, r, i, a);
		if (o !== void 0) return o;
		if (typeof e == "object") {
			if (yi(e) === "[object Object]" && typeof e.constructor != "function") {
				let t = {};
				return a.set(e, t), Xi(t, e, i, a), t;
			}
			switch (Object.prototype.toString.call(e)) {
				case Si:
				case xi:
				case Ci: {
					let t = new e.constructor(e?.valueOf());
					return Xi(t, e), t;
				}
				case wi: {
					let t = {};
					return Xi(t, e), t.length = e.length, t[Symbol.iterator] = e[Symbol.iterator], t;
				}
				default: return;
			}
		}
	});
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/cloneDeep.mjs
function ua(e) {
	return la(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/isIndex.mjs
var da = /^(?:0|[1-9]\d*)$/;
function fa(e, t = 2 ** 53 - 1) {
	switch (typeof e) {
		case "number": return Number.isInteger(e) && e >= 0 && e < t;
		case "symbol": return !1;
		case "string": return da.test(e);
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isArguments.mjs
function pa(e) {
	return typeof e == "object" && !!e && yi(e) === "[object Arguments]";
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/has.mjs
function ma(e, t) {
	let n;
	if (n = Array.isArray(t) ? t : typeof t == "string" && wt(t) && !(t in Object(e)) ? kt(t) : [t], n.length === 0) return !1;
	let r = e;
	for (let e = 0; e < n.length; e++) {
		let t = Tt(n[e]);
		if ((r == null || !Object.hasOwn(r, t)) && !((Array.isArray(r) || pa(r)) && fa(t) && Number(t) < r.length)) return !1;
		r = r[t];
	}
	return !0;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/matchesProperty.mjs
function ha(e, t) {
	switch (typeof e) {
		case "object":
			Object.is(e?.valueOf(), -0) && (e = "-0");
			break;
		case "number": e = Tt(e);
	}
	return t = ua(t), function(n) {
		let r = At(n, e);
		return r === void 0 ? ma(n, e) : t === void 0 ? r === void 0 : sa(r, t);
	};
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/iteratee.mjs
function ga(e) {
	if (e == null) return fi;
	switch (typeof e) {
		case "function": return e;
		case "object": return Array.isArray(e) && e.length === 2 ? ha(e[0], e[1]) : ca(e);
		default: return hi(e);
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/normalizeZero.mjs
function _a(e) {
	return e === 0 ? 0 : e;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/array/uniqBy.mjs
function va(e, t = fi) {
	return mi(e) ? ui(Array.from(e), di(ga(t), 1)).map(_a) : [];
}
// ../../../peach/frontend/node_modules/recharts/es6/util/payload/getUniqPayload.js
function ya(e, t, n) {
	return t === !0 ? va(e, n) : typeof t == "function" ? va(e, t) : e;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/RechartsReduxContext.js
var ba = /*#__PURE__*/ (0, P.createContext)(null), xa = Oe(), Sa = (e) => e, B = () => {
	var e = (0, P.useContext)(ba);
	return e ? e.store.dispatch : Sa;
}, Ca = () => {}, wa = () => Ca, Ta = (e, t) => e === t;
function V(e) {
	var t = (0, P.useContext)(ba), n = (0, P.useMemo)(() => t ? (t) => {
		if (t != null) return e(t);
	} : Ca, [t, e]);
	return (0, xa.useSyncExternalStoreWithSelector)(t ? t.subscription.addNestedSub : wa, t ? t.store.getState : Ca, t ? t.store.getState : Ca, n, Ta);
}
// ../../../peach/frontend/node_modules/reselect/dist/reselect.mjs
function Ea(e, t = `expected a function, instead received ${typeof e}`) {
	if (typeof e != "function") throw TypeError(t);
}
function Da(e, t = "expected all items to be functions, instead received the following types: ") {
	if (!e.every((e) => typeof e == "function")) {
		let n = e.map((e) => typeof e == "function" ? `function ${e.name || "unnamed"}()` : typeof e).join(", ");
		throw TypeError(`${t}[${n}]`);
	}
}
var Oa = (e) => Array.isArray(e) ? e : [e];
function ka(e) {
	let t = Array.isArray(e[0]) ? e[0] : e;
	return Da(t, "createSelector expects all input-selectors to be functions, but received the following types: "), t;
}
function Aa(e, t) {
	let n = [], { length: r } = e;
	for (let i = 0; i < r; i++) n.push(e[i].apply(null, t));
	return n;
}
var ja = class {
	constructor(e) {
		this.value = e;
	}
	deref() {
		return this.value;
	}
}, Ma = typeof WeakRef > "u" ? ja : WeakRef, Na = 0, Pa = 1;
function Fa() {
	return {
		s: Na,
		v: void 0,
		o: null,
		p: null
	};
}
function Ia(e) {
	return e instanceof Ma ? e.deref() : e;
}
function La(e, t = {}) {
	let n = Fa(), { resultEqualityCheck: r } = t, i, a = 0;
	function o() {
		let t = n, { length: o } = arguments;
		for (let e = 0, n = o; e < n; e++) {
			let n = arguments[e];
			if (typeof n == "function" || typeof n == "object" && n) {
				let e = t.o;
				e === null && (t.o = e = /* @__PURE__ */ new WeakMap());
				let r = e.get(n);
				r === void 0 ? (t = Fa(), e.set(n, t)) : t = r;
			} else {
				let e = t.p;
				e === null && (t.p = e = /* @__PURE__ */ new Map());
				let r = e.get(n);
				r === void 0 ? (t = Fa(), e.set(n, t)) : t = r;
			}
		}
		let s = t, c;
		if (t.s === Pa) c = t.v;
		else if (c = e.apply(null, arguments), a++, r) {
			let e = Ia(i);
			e != null && r(e, c) && (c = e, a !== 0 && a--), i = typeof c == "object" && c || typeof c == "function" ? /* @__PURE__ */ new Ma(c) : c;
		}
		return s.s = Pa, s.v = c, c;
	}
	return o.clearCache = () => {
		n = Fa(), o.resetResultsCount();
	}, o.resultsCount = () => a, o.resetResultsCount = () => {
		a = 0;
	}, o;
}
function Ra(e, ...t) {
	let n = typeof e == "function" ? {
		memoize: e,
		memoizeOptions: t
	} : e, r = (...e) => {
		let t = 0, r = 0, i, a = {}, o = e.pop();
		typeof o == "object" && (a = o, o = e.pop()), Ea(o, `createSelector expects an output function after the inputs, but received: [${typeof o}]`);
		let { memoize: s, memoizeOptions: c = [], argsMemoize: l = La, argsMemoizeOptions: u = [] } = {
			...n,
			...a
		}, d = Oa(c), f = Oa(u), p = ka(e), m = s(function() {
			return t++, o.apply(null, arguments);
		}, ...d), h = l(function() {
			r++;
			let e = Aa(p, arguments);
			return i = m.apply(null, e), i;
		}, ...f);
		return Object.assign(h, {
			resultFunc: o,
			memoizedResultFunc: m,
			dependencies: p,
			dependencyRecomputations: () => r,
			resetDependencyRecomputations: () => {
				r = 0;
			},
			lastResult: () => i,
			recomputations: () => t,
			resetRecomputations: () => {
				t = 0;
			},
			memoize: s,
			argsMemoize: l
		});
	};
	return Object.assign(r, { withTypes: () => r }), r;
}
var H = /* @__PURE__ */ Ra(La);
// ../../../peach/frontend/node_modules/es-toolkit/dist/array/flatten.mjs
function za(e, t = 1) {
	let n = [], r = Math.floor(t), i = (e, t) => {
		for (let a = 0; a < e.length; a++) {
			let o = e[a];
			Array.isArray(o) && t < r ? i(o, t + 1) : n.push(o);
		}
	};
	return i(e, 0), n;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/isIterateeCall.mjs
function Ba(e, t, n) {
	return ea(n) && (typeof t == "number" && mi(n) && fa(t) && t < n.length || typeof t == "string" && t in n) ? $i(n[t], e) : !1;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/compareValues.mjs
function Va(e) {
	return typeof e == "symbol" ? 1 : e === null ? 2 : e === void 0 ? 3 : e === e ? 0 : 4;
}
var Ha = (e, t, n) => {
	if (e !== t) {
		let r = Va(e), i = Va(t);
		if (r === i && r === 0) {
			if (e < t) return n === "desc" ? 1 : -1;
			if (e > t) return n === "desc" ? -1 : 1;
		}
		return n === "desc" ? i - r : r - i;
	}
	return 0;
}, Ua = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Wa = /^\w*$/;
function Ga(e, t) {
	return Array.isArray(e) ? !1 : typeof e == "number" || typeof e == "boolean" || e == null || Et(e) ? !0 : typeof e == "string" && (Wa.test(e) || !Ua.test(e)) || t != null && Object.hasOwn(t, e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/array/orderBy.mjs
function Ka(e, t, n, r) {
	if (e == null) return [];
	n = r ? void 0 : n, Array.isArray(e) || (e = mi(e) ? Array.from(e) : Object.values(e)), Array.isArray(t) || (t = t == null ? [null] : [t]), t.length === 0 && (t = [null]), Array.isArray(n) || (n = n == null ? [] : [n]), n = n.map((e) => String(e));
	let i = (e, t) => {
		let n = e, r = 0;
		for (; r < t.length && n != null; ++r) n = n[t[r]];
		return r > 0 && r === t.length ? n : void 0;
	}, a = (e, t) => {
		if (e == null) return t;
		if (t != null) return typeof e == "object" && "key" in e ? Object.hasOwn(t, e.key) ? t[e.key] : i(t, e.path) : typeof e == "function" ? e(t) : Array.isArray(e) ? i(t, e) : t[e];
	}, o = t.map((e) => (Array.isArray(e) && e.length === 1 && (e = e[0]), e == null || typeof e == "function" || Array.isArray(e) || Ga(e) ? e : {
		key: e,
		path: kt(e)
	}));
	return e.map((e) => ({
		original: e,
		criteria: o.map((t) => a(t, e))
	})).slice().sort((e, t) => {
		for (let r = 0; r < o.length; r++) {
			let i = Ha(e.criteria[r], t.criteria[r], n[r]);
			if (i !== 0) return i;
		}
		return 0;
	}).map((e) => e.original);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/array/sortBy.mjs
function qa(e, ...t) {
	let n = t.length;
	return n > 1 && Ba(e, t[0], t[1]) ? t = [] : n > 2 && Ba(t[0], t[1], t[2]) && (t = [t[0]]), Ka(e, za(t), ["asc"]);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/legendSelectors.js
var Ja = (e) => e.legend.settings, Ya = (e) => e.legend.size, Xa = H([(e) => e.legend.payload, Ja], (e, t) => {
	var n = t.itemSorter, r = e.flat(1);
	return n ? qa(r, n) : r;
});
// ../../../peach/frontend/node_modules/recharts/es6/context/legendPayloadContext.js
function Za() {
	return V(Xa);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/useElementOffset.js
function Qa(e, t) {
	return ro(e) || no(e, t) || eo(e, t) || $a();
}
function $a() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function eo(e, t) {
	if (e) {
		if (typeof e == "string") return to(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? to(e, t) : void 0;
	}
}
function to(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function no(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ro(e) {
	if (Array.isArray(e)) return e;
}
var io = 1;
function ao(e, t) {
	return Math.abs(e.height - t.height) > io || Math.abs(e.left - t.left) > io || Math.abs(e.top - t.top) > io || Math.abs(e.width - t.width) > io;
}
function oo(e) {
	var t = e.getBoundingClientRect();
	return {
		height: t.height,
		left: t.left,
		top: t.top,
		width: t.width
	};
}
function so() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], t = Qa((0, P.useState)({
		height: 0,
		left: 0,
		top: 0,
		width: 0
	}), 2), n = t[0], r = t[1], i = (0, P.useRef)(null), a = (0, P.useRef)(n);
	a.current = n;
	var o = (0, P.useCallback)((e) => {
		if (i.current != null && (i.current.disconnect(), i.current = null), e != null) {
			var t = oo(e);
			if (ao(t, a.current) && r(t), typeof ResizeObserver < "u") {
				var n = new ResizeObserver(() => {
					var t = oo(e);
					ao(t, a.current) && r(t);
				});
				n.observe(e), i.current = n;
			}
		}
	}, [...e]);
	return (0, P.useEffect)(() => () => {
		var e;
		(e = i.current) == null || e.disconnect();
	}, []), [n, o];
}
// ../../../peach/frontend/node_modules/redux/dist/redux.mjs
function co(e) {
	return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var lo = typeof Symbol == "function" && Symbol.observable || "@@observable", uo = () => Math.random().toString(36).substring(7).split("").join("."), fo = {
	INIT: `@@redux/INIT${/* @__PURE__ */ uo()}`,
	REPLACE: `@@redux/REPLACE${/* @__PURE__ */ uo()}`,
	PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${uo()}`
};
function po(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e;
	for (; Object.getPrototypeOf(t) !== null;) t = Object.getPrototypeOf(t);
	return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function mo(e, t, n) {
	if (typeof e != "function") throw Error(co(2));
	if (typeof t == "function" && typeof n == "function" || typeof n == "function" && typeof arguments[3] == "function") throw Error(co(0));
	if (typeof t == "function" && n === void 0 && (n = t, t = void 0), n !== void 0) {
		if (typeof n != "function") throw Error(co(1));
		return n(mo)(e, t);
	}
	let r = e, i = t, a = /* @__PURE__ */ new Map(), o = a, s = 0, c = !1;
	function l() {
		o === a && (o = /* @__PURE__ */ new Map(), a.forEach((e, t) => {
			o.set(t, e);
		}));
	}
	function u() {
		if (c) throw Error(co(3));
		return i;
	}
	function d(e) {
		if (typeof e != "function") throw Error(co(4));
		if (c) throw Error(co(5));
		let t = !0;
		l();
		let n = s++;
		return o.set(n, e), function() {
			if (t) {
				if (c) throw Error(co(6));
				t = !1, l(), o.delete(n), a = null;
			}
		};
	}
	function f(e) {
		if (!po(e)) throw Error(co(7));
		if (e.type === void 0) throw Error(co(8));
		if (typeof e.type != "string") throw Error(co(17));
		if (c) throw Error(co(9));
		try {
			c = !0, i = r(i, e);
		} finally {
			c = !1;
		}
		return (a = o).forEach((e) => {
			e();
		}), e;
	}
	function p(e) {
		if (typeof e != "function") throw Error(co(10));
		r = e, f({ type: fo.REPLACE });
	}
	function m() {
		let e = d;
		return {
			subscribe(t) {
				if (typeof t != "object" || !t) throw Error(co(11));
				function n() {
					let e = t;
					e.next && e.next(u());
				}
				return n(), { unsubscribe: e(n) };
			},
			[lo]() {
				return this;
			}
		};
	}
	return f({ type: fo.INIT }), {
		dispatch: f,
		subscribe: d,
		getState: u,
		replaceReducer: p,
		[lo]: m
	};
}
function ho(e) {
	Object.keys(e).forEach((t) => {
		let n = e[t];
		if (n(void 0, { type: fo.INIT }) === void 0) throw Error(co(12));
		if (n(void 0, { type: fo.PROBE_UNKNOWN_ACTION() }) === void 0) throw Error(co(13));
	});
}
function go(e) {
	let t = Object.keys(e), n = {};
	for (let r = 0; r < t.length; r++) {
		let i = t[r];
		typeof e[i] == "function" && (n[i] = e[i]);
	}
	let r = Object.keys(n), i;
	try {
		ho(n);
	} catch (e) {
		i = e;
	}
	return function(e = {}, t) {
		if (i) throw i;
		let a = !1, o = {};
		for (let i = 0; i < r.length; i++) {
			let s = r[i], c = n[s], l = e[s], u = c(l, t);
			if (u === void 0) throw t && t.type, Error(co(14));
			o[s] = u, a ||= u !== l;
		}
		return a ||= r.length !== Object.keys(e).length, a ? o : e;
	};
}
function _o(...e) {
	return e.length === 0 ? (e) => e : e.length === 1 ? e[0] : e.reduce((e, t) => (...n) => e(t(...n)));
}
function vo(...e) {
	return (t) => (n, r) => {
		let i = t(n, r), a = () => {
			throw Error(co(15));
		}, o = {
			getState: i.getState,
			dispatch: (e, ...t) => a(e, ...t)
		};
		return a = _o(...e.map((e) => e(o)))(i.dispatch), {
			...i,
			dispatch: a
		};
	};
}
function yo(e) {
	return po(e) && "type" in e && typeof e.type == "string";
}
// ../../../peach/frontend/node_modules/immer/dist/immer.mjs
var bo = Symbol.for("immer-nothing"), xo = Symbol.for("immer-draftable"), So = Symbol.for("immer-state");
function Co(e, ...t) {
	throw Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`);
}
var wo = Object, To = wo.getPrototypeOf, Eo = "constructor", Do = "prototype", Oo = "configurable", ko = "enumerable", Ao = "writable", jo = "value", Mo = (e) => !!e && !!e[So];
function No(e) {
	return e ? Io(e) || Uo(e) || !!e[xo] || !!e[Eo]?.[xo] || Wo(e) || Go(e) : !1;
}
var Po = wo[Do][Eo].toString(), Fo = /* @__PURE__ */ new WeakMap();
function Io(e) {
	if (!e || !Ko(e)) return !1;
	let t = To(e);
	if (t === null || t === wo[Do]) return !0;
	let n = wo.hasOwnProperty.call(t, Eo) && t[Eo];
	if (n === Object) return !0;
	if (!qo(n)) return !1;
	let r = Fo.get(n);
	return r === void 0 && (r = Function.toString.call(n), Fo.set(n, r)), r === Po;
}
function Lo(e, t, n = !0) {
	Ro(e) === 0 ? (n ? Reflect.ownKeys(e) : wo.keys(e)).forEach((n) => {
		t(n, e[n], e);
	}) : e.forEach((n, r) => t(r, n, e));
}
function Ro(e) {
	let t = e[So];
	return t ? t.type_ : Uo(e) ? 1 : Wo(e) ? 2 : Go(e) ? 3 : 0;
}
var zo = (e, t, n = Ro(e)) => n === 2 ? e.has(t) : wo[Do].hasOwnProperty.call(e, t), Bo = (e, t, n = Ro(e)) => n === 2 ? e.get(t) : e[t], Vo = (e, t, n, r = Ro(e)) => {
	r === 2 ? e.set(t, n) : r === 3 ? e.add(n) : e[t] = n;
};
function Ho(e, t) {
	return e === t ? e !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
var Uo = Array.isArray, Wo = (e) => e instanceof Map, Go = (e) => e instanceof Set, Ko = (e) => typeof e == "object", qo = (e) => typeof e == "function", Jo = (e) => typeof e == "boolean";
function Yo(e) {
	let t = +e;
	return Number.isInteger(t) && String(t) === e;
}
var Xo = (e) => e.copy_ || e.base_, Zo = (e) => e.modified_ ? e.copy_ : e.base_;
function Qo(e, t) {
	if (Wo(e)) return new Map(e);
	if (Go(e)) return new Set(e);
	if (Uo(e)) return Array[Do].slice.call(e);
	let n = Io(e);
	if (t === !0 || t === "class_only" && !n) {
		let t = wo.getOwnPropertyDescriptors(e);
		delete t[So];
		let n = Reflect.ownKeys(t);
		for (let r = 0; r < n.length; r++) {
			let i = n[r], a = t[i];
			a[Ao] === !1 && (a[Ao] = !0, a[Oo] = !0), (a.get || a.set) && (t[i] = {
				[Oo]: !0,
				[Ao]: !0,
				[ko]: a[ko],
				[jo]: e[i]
			});
		}
		return wo.create(To(e), t);
	}
	{
		let t = To(e);
		if (t !== null && n) return { ...e };
		let r = wo.create(t);
		return wo.assign(r, e);
	}
}
function $o(e, t = !1) {
	return ns(e) || Mo(e) || !No(e) || (Ro(e) > 1 && wo.defineProperties(e, {
		set: ts,
		add: ts,
		clear: ts,
		delete: ts
	}), wo.freeze(e), t && Lo(e, (e, t) => {
		$o(t, !0);
	}, !1)), e;
}
function es() {
	Co(2);
}
var ts = { [jo]: es };
function ns(e) {
	return e === null || !Ko(e) || wo.isFrozen(e);
}
var rs = "MapSet", is = "Patches", as = "ArrayMethods", os = {};
function ss(e) {
	let t = os[e];
	return t || Co(0, e), t;
}
var cs = (e) => !!os[e], ls, us = () => ls, ds = (e, t) => ({
	drafts_: [],
	parent_: e,
	immer_: t,
	canAutoFreeze_: !0,
	unfinalizedDrafts_: 0,
	handledSet_: /* @__PURE__ */ new Set(),
	processedForPatches_: /* @__PURE__ */ new Set(),
	mapSetPlugin_: cs(rs) ? ss(rs) : void 0,
	arrayMethodsPlugin_: cs(as) ? ss(as) : void 0
});
function fs(e, t) {
	t && (e.patchPlugin_ = ss(is), e.patches_ = [], e.inversePatches_ = [], e.patchListener_ = t);
}
function ps(e) {
	ms(e), e.drafts_.forEach(gs), e.drafts_ = null;
}
function ms(e) {
	e === ls && (ls = e.parent_);
}
var hs = (e) => ls = ds(ls, e);
function gs(e) {
	let t = e[So];
	t.type_ === 0 || t.type_ === 1 ? t.revoke_() : t.revoked_ = !0;
}
function _s(e, t) {
	t.unfinalizedDrafts_ = t.drafts_.length;
	let n = t.drafts_[0];
	if (e !== void 0 && e !== n) {
		n[So].modified_ && (ps(t), Co(4)), No(e) && (e = vs(t, e));
		let { patchPlugin_: r } = t;
		r && r.generateReplacementPatches_(n[So].base_, e, t);
	} else e = vs(t, n);
	return ys(t, e, !0), ps(t), t.patches_ && t.patchListener_(t.patches_, t.inversePatches_), e === bo ? void 0 : e;
}
function vs(e, t) {
	if (ns(t)) return t;
	let n = t[So];
	if (!n) return Ds(t, e.handledSet_, e);
	if (!xs(n, e)) return t;
	if (!n.modified_) return n.base_;
	if (!n.finalized_) {
		let { callbacks_: t } = n;
		if (t) for (; t.length > 0;) t.pop()(e);
		Ts(n, e);
	}
	return n.copy_;
}
function ys(e, t, n = !1) {
	!e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && $o(t, n);
}
function bs(e) {
	e.finalized_ = !0, e.scope_.unfinalizedDrafts_--;
}
var xs = (e, t) => e.scope_ === t, Ss = [];
function Cs(e, t, n, r) {
	let i = Xo(e), a = e.type_;
	if (r !== void 0 && Bo(i, r, a) === t) {
		Vo(i, r, n, a);
		return;
	}
	if (!e.draftLocations_) {
		let t = e.draftLocations_ = /* @__PURE__ */ new Map();
		Lo(i, (e, n) => {
			if (Mo(n)) {
				let r = t.get(n) || [];
				r.push(e), t.set(n, r);
			}
		});
	}
	let o = e.draftLocations_.get(t) ?? Ss;
	for (let e of o) Vo(i, e, n, a);
}
function ws(e, t, n) {
	e.callbacks_.push(function(r) {
		let i = t;
		if (!i || !xs(i, r)) return;
		r.mapSetPlugin_?.fixSetContents(i);
		let a = Zo(i);
		Cs(e, i.draft_ ?? i, a, n), Ts(i, r);
	});
}
function Ts(e, t) {
	if (e.modified_ && !e.finalized_ && (e.type_ === 3 || e.type_ === 1 && e.allIndicesReassigned_ || (e.assigned_?.size ?? 0) > 0)) {
		let { patchPlugin_: n } = t;
		if (n) {
			let r = n.getPath(e);
			r && n.generatePatches_(e, r, t);
		}
		bs(e);
	}
}
function Es(e, t, n) {
	let { scope_: r } = e;
	if (Mo(n)) {
		let i = n[So];
		xs(i, r) && i.callbacks_.push(function() {
			Is(e), Cs(e, n, Zo(i), t);
		});
	} else No(n) && e.callbacks_.push(function() {
		let i = Xo(e);
		e.type_ === 3 ? i.has(n) && Ds(n, r.handledSet_, r) : Bo(i, t, e.type_) === n && r.drafts_.length > 1 && (e.assigned_.get(t) ?? !1) === !0 && e.copy_ && Ds(Bo(e.copy_, t, e.type_), r.handledSet_, r);
	});
}
function Ds(e, t, n) {
	return !n.immer_.autoFreeze_ && n.unfinalizedDrafts_ < 1 || Mo(e) || t.has(e) || !No(e) || ns(e) || (t.add(e), Lo(e, (r, i) => {
		if (Mo(i)) {
			let t = i[So];
			xs(t, n) && (Vo(e, r, Zo(t), e.type_), bs(t));
		} else No(i) && Ds(i, t, n);
	})), e;
}
function Os(e, t) {
	let n = Uo(e), r = {
		type_: +!!n,
		scope_: t ? t.scope_ : us(),
		modified_: !1,
		finalized_: !1,
		assigned_: void 0,
		parent_: t,
		base_: e,
		draft_: null,
		copy_: null,
		revoke_: null,
		isManual_: !1,
		callbacks_: void 0
	}, i = r, a = ks;
	n && (i = [r], a = As);
	let { revoke: o, proxy: s } = Proxy.revocable(i, a);
	return r.draft_ = s, r.revoke_ = o, [s, r];
}
var ks = {
	get(e, t) {
		if (t === So) return e;
		let n = e.scope_.arrayMethodsPlugin_, r = e.type_ === 1 && typeof t == "string";
		if (r && n?.isArrayOperationMethod(t)) return n.createMethodInterceptor(e, t);
		let i = Xo(e);
		if (!zo(i, t, e.type_)) return Ns(e, i, t);
		let a = i[t];
		if (e.finalized_ || !No(a) || r && e.operationMethod && n?.isMutatingArrayMethod(e.operationMethod) && Yo(t)) return a;
		if (a === js(e.base_, t) || Ms(e, t, a)) {
			Is(e);
			let n = e.type_ === 1 ? +t : t, r = Rs(e.scope_, a, e, n);
			return e.copy_[n] = r;
		}
		return a;
	},
	has(e, t) {
		return t in Xo(e);
	},
	ownKeys(e) {
		return Reflect.ownKeys(Xo(e));
	},
	set(e, t, n) {
		let r = Ps(Xo(e), t);
		if (r?.set) return r.set.call(e.draft_, n), !0;
		if (!e.modified_) {
			let r = js(Xo(e), t), i = r?.[So];
			if (i && i.base_ === n) return e.copy_[t] = n, e.assigned_.delete(t), !0;
			if (Ho(n, r) && (n !== void 0 || zo(e.base_, t, e.type_))) return !0;
			Is(e), Fs(e);
		}
		return e.copy_[t] === n && (n !== void 0 || zo(e.copy_, t, e.type_)) || Number.isNaN(n) && Number.isNaN(e.copy_[t]) || (e.copy_[t] = n, e.assigned_.set(t, !0), Es(e, t, n)), !0;
	},
	deleteProperty(e, t) {
		return Is(e), js(e.base_, t) !== void 0 || t in e.base_ ? (e.assigned_.set(t, !1), Fs(e)) : e.assigned_.delete(t), e.copy_ && delete e.copy_[t], !0;
	},
	getOwnPropertyDescriptor(e, t) {
		let n = Xo(e), r = Reflect.getOwnPropertyDescriptor(n, t);
		return r && {
			[Ao]: !0,
			[Oo]: e.type_ !== 1 || t !== "length",
			[ko]: r[ko],
			[jo]: n[t]
		};
	},
	defineProperty() {
		Co(11);
	},
	getPrototypeOf(e) {
		return To(e.base_);
	},
	setPrototypeOf() {
		Co(12);
	}
}, As = {};
for (let e in ks) {
	let t = ks[e];
	As[e] = function() {
		let e = arguments;
		return e[0] = e[0][0], t.apply(this, e);
	};
}
As.deleteProperty = function(e, t) {
	return As.set.call(this, e, t, void 0);
}, As.set = function(e, t, n) {
	return ks.set.call(this, e[0], t, n, e[0]);
};
function js(e, t) {
	let n = e[So];
	return (n ? Xo(n) : e)[t];
}
function Ms(e, t, n) {
	return e.type_ !== 1 || !e.allIndicesReassigned_ || e.assigned_?.get(t) || !No(n) || n[So] ? !1 : e.baseRefs_.has(n);
}
function Ns(e, t, n) {
	let r = Ps(t, n);
	return r ? jo in r ? r[jo] : r.get?.call(e.draft_) : void 0;
}
function Ps(e, t) {
	if (!(t in e)) return;
	let n = To(e);
	for (; n;) {
		let e = Object.getOwnPropertyDescriptor(n, t);
		if (e) return e;
		n = To(n);
	}
}
function Fs(e) {
	e.modified_ || (e.modified_ = !0, e.parent_ && Fs(e.parent_));
}
function Is(e) {
	e.copy_ ||= (e.assigned_ = /* @__PURE__ */ new Map(), Qo(e.base_, e.scope_.immer_.useStrictShallowCopy_));
}
var Ls = class {
	constructor(e) {
		this.autoFreeze_ = !0, this.useStrictShallowCopy_ = !1, this.useStrictIteration_ = !1, this.produce = (e, t, n) => {
			if (qo(e) && !qo(t)) {
				let n = t;
				t = e;
				let r = this;
				return function(e = n, ...i) {
					return r.produce(e, (e) => t.call(this, e, ...i));
				};
			}
			qo(t) || Co(6), n !== void 0 && !qo(n) && Co(7);
			let r;
			if (No(e)) {
				let i = hs(this), a = Rs(i, e, void 0), o = !0;
				try {
					r = t(a), o = !1;
				} finally {
					o ? ps(i) : ms(i);
				}
				return fs(i, n), _s(r, i);
			}
			if (!e || !Ko(e)) {
				if (r = t(e), r === void 0 && (r = e), r === bo && (r = void 0), this.autoFreeze_ && $o(r, !0), n) {
					let t = [], i = [];
					ss(is).generateReplacementPatches_(e, r, {
						patches_: t,
						inversePatches_: i
					}), n(t, i);
				}
				return r;
			}
			Co(1, e);
		}, this.produceWithPatches = (e, t) => {
			if (qo(e)) return (t, ...n) => this.produceWithPatches(t, (t) => e(t, ...n));
			let n, r;
			return [
				this.produce(e, t, (e, t) => {
					n = e, r = t;
				}),
				n,
				r
			];
		}, Jo(e?.autoFreeze) && this.setAutoFreeze(e.autoFreeze), Jo(e?.useStrictShallowCopy) && this.setUseStrictShallowCopy(e.useStrictShallowCopy), Jo(e?.useStrictIteration) && this.setUseStrictIteration(e.useStrictIteration);
	}
	createDraft(e) {
		No(e) || Co(8), Mo(e) && (e = zs(e));
		let t = hs(this), n = Rs(t, e, void 0);
		return n[So].isManual_ = !0, ms(t), n;
	}
	finishDraft(e, t) {
		let n = e && e[So];
		n && n.isManual_ || Co(9);
		let { scope_: r } = n;
		return fs(r, t), _s(void 0, r);
	}
	setAutoFreeze(e) {
		this.autoFreeze_ = e;
	}
	setUseStrictShallowCopy(e) {
		this.useStrictShallowCopy_ = e;
	}
	setUseStrictIteration(e) {
		this.useStrictIteration_ = e;
	}
	shouldUseStrictIteration() {
		return this.useStrictIteration_;
	}
	applyPatches(e, t) {
		let n;
		for (n = t.length - 1; n >= 0; n--) {
			let r = t[n];
			if (r.path.length === 0 && r.op === "replace") {
				e = r.value;
				break;
			}
		}
		n > -1 && (t = t.slice(n + 1));
		let r = ss(is).applyPatches_;
		return Mo(e) ? r(e, t) : this.produce(e, (e) => r(e, t));
	}
};
function Rs(e, t, n, r) {
	let [i, a] = Wo(t) ? ss(rs).proxyMap_(t, n) : Go(t) ? ss(rs).proxySet_(t, n) : Os(t, n);
	return (n?.scope_ ?? us()).drafts_.push(i), a.callbacks_ = n?.callbacks_ ?? [], a.key_ = r, n && r !== void 0 ? ws(n, a, r) : a.callbacks_.push(function(e) {
		e.mapSetPlugin_?.fixSetContents(a);
		let { patchPlugin_: t } = e;
		a.modified_ && t && t.generatePatches_(a, [], e);
	}), i;
}
function zs(e) {
	return Mo(e) || Co(10, e), Bs(e);
}
function Bs(e) {
	if (!No(e) || ns(e)) return e;
	let t = e[So], n, r = !0;
	if (t) {
		if (!t.modified_) return t.base_;
		t.finalized_ = !0, n = Qo(e, t.scope_.immer_.useStrictShallowCopy_), r = t.scope_.immer_.shouldUseStrictIteration();
	} else n = Qo(e, !0);
	return Lo(n, (e, t) => {
		Vo(n, e, Bs(t));
	}, r), t && (t.finalized_ = !1), n;
}
globalThis.Iterator?.from;
var Vs = new Ls().produce, U = (e) => e;
// ../../../peach/frontend/node_modules/redux-thunk/dist/redux-thunk.mjs
function Hs(e) {
	return ({ dispatch: t, getState: n }) => (r) => (i) => typeof i == "function" ? i(t, n, e) : r(i);
}
var Us = Hs(), Ws = Hs, Gs = typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
	if (arguments.length !== 0) return typeof arguments[0] == "object" ? _o : _o.apply(null, arguments);
};
typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__;
function Ks(e, t) {
	function n(...n) {
		if (t) {
			let r = t(...n);
			if (!r) throw Error(el(0));
			return {
				type: e,
				payload: r.payload,
				..."meta" in r && { meta: r.meta },
				..."error" in r && { error: r.error }
			};
		}
		return {
			type: e,
			payload: n[0]
		};
	}
	return n.toString = () => `${e}`, n.type = e, n.match = (t) => yo(t) && t.type === e, n;
}
var qs = class e extends Array {
	constructor(...t) {
		super(...t), Object.setPrototypeOf(this, e.prototype);
	}
	static get [Symbol.species]() {
		return e;
	}
	concat(...e) {
		return super.concat.apply(this, e);
	}
	prepend(...t) {
		return t.length === 1 && Array.isArray(t[0]) ? new e(...t[0].concat(this)) : new e(...t.concat(this));
	}
};
function Js(e) {
	return No(e) ? Vs(e, () => {}) : e;
}
function Ys(e, t, n) {
	return e.has(t) ? e.get(t) : e.set(t, n(t)).get(t);
}
function Xs(e) {
	return typeof e == "boolean";
}
var Zs = () => function(e) {
	let { thunk: t = !0, immutableCheck: n = !0, serializableCheck: r = !0, actionCreatorCheck: i = !0 } = e ?? {}, a = new qs();
	return t && (Xs(t) ? a.push(Us) : a.push(Ws(t.extraArgument))), a;
}, Qs = "RTK_autoBatch", W = () => (e) => ({
	payload: e,
	meta: { [Qs]: !0 }
}), $s = (e) => (t) => {
	setTimeout(t, e);
}, ec = (e, t) => (n) => {
	let r = !1, i = () => {
		r || (r = !0, cancelAnimationFrame(a), clearTimeout(o), n());
	}, a = e(i), o = setTimeout(i, t);
}, tc = (e = { type: "raf" }) => (t) => (...n) => {
	let r = t(...n), i = !0, a = !1, o = !1, s = /* @__PURE__ */ new Set(), c = e.type === "tick" ? queueMicrotask : e.type === "raf" ? typeof window < "u" && window.requestAnimationFrame ? ec(window.requestAnimationFrame, 100) : $s(10) : e.type === "callback" ? e.queueNotification : $s(e.timeout), l = () => {
		o = !1, a && (a = !1, s.forEach((e) => e()));
	};
	return Object.assign({}, r, {
		subscribe(e) {
			let t = r.subscribe(() => i && e());
			return s.add(e), () => {
				t(), s.delete(e);
			};
		},
		dispatch(e) {
			try {
				return i = !e?.meta?.[Qs], a = !i, a && (o || (o = !0, c(l))), r.dispatch(e);
			} finally {
				i = !0;
			}
		}
	});
}, nc = (e) => function(t) {
	let { autoBatch: n = !0 } = t ?? {}, r = new qs(e);
	return n && r.push(tc(typeof n == "object" ? n : void 0)), r;
};
function rc(e) {
	let t = Zs(), { reducer: n = void 0, middleware: r, devTools: i = !0, duplicateMiddlewareCheck: a = !0, preloadedState: o = void 0, enhancers: s = void 0 } = e || {}, c;
	if (typeof n == "function") c = n;
	else if (po(n)) c = go(n);
	else throw Error(el(1));
	let l;
	l = typeof r == "function" ? r(t) : t();
	let u = _o;
	i && (u = Gs({
		trace: !1,
		...typeof i == "object" && i
	}));
	let d = nc(vo(...l)), f = typeof s == "function" ? s(d) : d(), p = u(...f);
	return mo(c, o, p);
}
function ic(e) {
	let t = {}, n = [], r, i = {
		addCase(e, n) {
			let r = typeof e == "string" ? e : e.type;
			if (!r) throw Error(el(28));
			if (r in t) throw Error(el(29));
			return t[r] = n, i;
		},
		addAsyncThunk(e, r) {
			return r.pending && (t[e.pending.type] = r.pending), r.rejected && (t[e.rejected.type] = r.rejected), r.fulfilled && (t[e.fulfilled.type] = r.fulfilled), r.settled && n.push({
				matcher: e.settled,
				reducer: r.settled
			}), i;
		},
		addMatcher(e, t) {
			return n.push({
				matcher: e,
				reducer: t
			}), i;
		},
		addDefaultCase(e) {
			return r = e, i;
		}
	};
	return e(i), [
		t,
		n,
		r
	];
}
function ac(e) {
	return typeof e == "function";
}
function oc(e, t) {
	let [n, r, i] = ic(t), a;
	if (ac(e)) a = () => Js(e());
	else {
		let t = Js(e);
		a = () => t;
	}
	function o(e = a(), t) {
		let o = [n[t.type], ...r.filter(({ matcher: e }) => e(t)).map(({ reducer: e }) => e)];
		return o.filter((e) => !!e).length === 0 && (o = [i]), o.reduce((e, n) => {
			if (n) {
				if (Mo(e)) {
					let r = n(e, t);
					return r === void 0 ? e : r;
				}
				if (No(e)) return Vs(e, (e) => n(e, t));
				{
					let r = n(e, t);
					if (r === void 0) {
						if (e === null) return e;
						throw Error("A case reducer on a non-draftable value must not return undefined");
					}
					return r;
				}
			}
			return e;
		}, e);
	}
	return o.getInitialState = a, o;
}
var sc = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW", cc = (e = 21) => {
	let t = "", n = e;
	for (; n--;) t += sc[Math.random() * 64 | 0];
	return t;
}, lc = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
function uc(e, t) {
	return `${e}/${t}`;
}
function dc({ creators: e } = {}) {
	let t = e?.asyncThunk?.[lc];
	return function(e) {
		let { name: n, reducerPath: r = n } = e;
		if (!n) throw Error(el(11));
		let i = (typeof e.reducers == "function" ? e.reducers(mc()) : e.reducers) || {}, a = Object.keys(i), o = {
			sliceCaseReducersByName: {},
			sliceCaseReducersByType: {},
			actionCreators: {},
			sliceMatchers: []
		}, s = {
			addCase(e, t) {
				let n = typeof e == "string" ? e : e.type;
				if (!n) throw Error(el(12));
				if (n in o.sliceCaseReducersByType) throw Error(el(13));
				return o.sliceCaseReducersByType[n] = t, s;
			},
			addMatcher(e, t) {
				return o.sliceMatchers.push({
					matcher: e,
					reducer: t
				}), s;
			},
			exposeAction(e, t) {
				return o.actionCreators[e] = t, s;
			},
			exposeCaseReducer(e, t) {
				return o.sliceCaseReducersByName[e] = t, s;
			}
		};
		a.forEach((r) => {
			let a = i[r], o = {
				reducerName: r,
				type: uc(n, r),
				createNotation: typeof e.reducers == "function"
			};
			gc(a) ? vc(o, a, s, t) : hc(o, a, s);
		});
		function c() {
			let [t = {}, n = [], r = void 0] = typeof e.extraReducers == "function" ? ic(e.extraReducers) : [e.extraReducers], i = {
				...t,
				...o.sliceCaseReducersByType
			};
			return oc(e.initialState, (e) => {
				for (let t in i) e.addCase(t, i[t]);
				for (let t of o.sliceMatchers) e.addMatcher(t.matcher, t.reducer);
				for (let t of n) e.addMatcher(t.matcher, t.reducer);
				r && e.addDefaultCase(r);
			});
		}
		let l = (e) => e, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new WeakMap(), f;
		function p(e, t) {
			return f ||= c(), f(e, t);
		}
		function m() {
			return f ||= c(), f.getInitialState();
		}
		function h(t, n = !1) {
			function r(e) {
				let i = e[t];
				return i === void 0 && n && (i = Ys(d, r, m)), i;
			}
			function i(t = l) {
				return Ys(Ys(u, n, () => /* @__PURE__ */ new WeakMap()), t, () => {
					let r = {};
					for (let [i, a] of Object.entries(e.selectors ?? {})) r[i] = fc(a, t, () => Ys(d, t, m), n);
					return r;
				});
			}
			return {
				reducerPath: t,
				getSelectors: i,
				get selectors() {
					return i(r);
				},
				selectSlice: r
			};
		}
		let g = {
			name: n,
			reducer: p,
			actions: o.actionCreators,
			caseReducers: o.sliceCaseReducersByName,
			getInitialState: m,
			...h(r),
			injectInto(e, { reducerPath: t, ...n } = {}) {
				let i = t ?? r;
				return e.inject({
					reducerPath: i,
					reducer: p
				}, n), {
					...g,
					...h(i, !0)
				};
			}
		};
		return g;
	};
}
function fc(e, t, n, r) {
	function i(i, ...a) {
		let o = t(i);
		return o === void 0 && r && (o = n()), e(o, ...a);
	}
	return i.unwrapped = e, i;
}
var pc = /* @__PURE__ */ dc();
function mc() {
	function e(e, t) {
		return {
			_reducerDefinitionType: "asyncThunk",
			payloadCreator: e,
			...t
		};
	}
	return e.withTypes = () => e, {
		reducer(e) {
			return Object.assign({ [e.name](...t) {
				return e(...t);
			} }[e.name], { _reducerDefinitionType: "reducer" });
		},
		preparedReducer(e, t) {
			return {
				_reducerDefinitionType: "reducerWithPrepare",
				prepare: e,
				reducer: t
			};
		},
		asyncThunk: e
	};
}
function hc({ type: e, reducerName: t, createNotation: n }, r, i) {
	let a, o;
	if ("reducer" in r) {
		if (n && !_c(r)) throw Error(el(17));
		a = r.reducer, o = r.prepare;
	} else a = r;
	i.addCase(e, a).exposeCaseReducer(t, a).exposeAction(t, o ? Ks(e, o) : Ks(e));
}
function gc(e) {
	return e._reducerDefinitionType === "asyncThunk";
}
function _c(e) {
	return e._reducerDefinitionType === "reducerWithPrepare";
}
function vc({ type: e, reducerName: t }, n, r, i) {
	if (!i) throw Error(el(18));
	let { payloadCreator: a, fulfilled: o, pending: s, rejected: c, settled: l, options: u } = n, d = i(e, a, u);
	r.exposeAction(t, d), o && r.addCase(d.fulfilled, o), s && r.addCase(d.pending, s), c && r.addCase(d.rejected, c), l && r.addMatcher(d.settled, l), r.exposeCaseReducer(t, {
		fulfilled: o || yc,
		pending: s || yc,
		rejected: c || yc,
		settled: l || yc
	});
}
function yc() {}
var bc = "task", xc = "listener", Sc = "completed", Cc = "cancelled", wc = `task-${Cc}`, Tc = `task-${Sc}`, Ec = `${xc}-${Cc}`, Dc = `${xc}-${Sc}`, Oc = class {
	constructor(e) {
		this.code = e, this.message = `${bc} ${Cc} (reason: ${e})`;
	}
	code;
	name = "TaskAbortError";
	message;
}, kc = (e, t) => {
	if (typeof e != "function") throw TypeError(el(32));
}, Ac = () => {}, jc = (e, t = Ac) => (e.catch(t), e), Mc = (e, t) => (e.addEventListener("abort", t, { once: !0 }), () => e.removeEventListener("abort", t)), Nc = (e) => {
	if (e.aborted) throw new Oc(e.reason);
};
function Pc(e, t) {
	let n = Ac;
	return new Promise((r, i) => {
		let a = () => i(new Oc(e.reason));
		e.aborted ? a() : (n = Mc(e, a), t.finally(() => n()).then(r, i));
	}).finally(() => {
		n = Ac;
	});
}
var Fc = async (e, t) => {
	try {
		return await Promise.resolve(), {
			status: "ok",
			value: await e()
		};
	} catch (e) {
		return {
			status: e instanceof Oc ? "cancelled" : "rejected",
			error: e
		};
	} finally {
		t?.();
	}
}, Ic = (e) => (t) => jc(Pc(e, t).then((t) => (Nc(e), t))), Lc = (e) => {
	let t = Ic(e);
	return (e) => t(new Promise((t) => setTimeout(t, e)));
}, { assign: Rc } = Object, zc = {}, Bc = "listenerMiddleware", Vc = (e, t) => {
	let n = (t) => Mc(e, () => t.abort(e.reason));
	return (r, i) => {
		kc(r, "taskExecutor");
		let a = new AbortController();
		n(a);
		let o = Fc(async () => {
			Nc(e), Nc(a.signal);
			let t = await r({
				pause: Ic(a.signal),
				delay: Lc(a.signal),
				signal: a.signal
			});
			return Nc(a.signal), t;
		}, () => a.abort(Tc));
		return i?.autoJoin && t.push(o.catch(Ac)), {
			result: Ic(e)(o),
			cancel() {
				a.abort(wc);
			}
		};
	};
}, Hc = (e, t) => {
	let n = async (n, r) => {
		Nc(t);
		let i = () => {}, a = [new Promise((t, r) => {
			let a = e({
				predicate: n,
				effect: (e, n) => {
					n.unsubscribe(), t([
						e,
						n.getState(),
						n.getOriginalState()
					]);
				}
			});
			i = () => {
				a(), r();
			};
		})];
		r != null && a.push(new Promise((e) => setTimeout(e, r, null)));
		try {
			let e = await Pc(t, Promise.race(a));
			return Nc(t), e;
		} finally {
			i();
		}
	};
	return ((e, t) => jc(n(e, t)));
}, Uc = (e) => {
	let { type: t, actionCreator: n, matcher: r, predicate: i, effect: a } = e;
	if (t) i = Ks(t).match;
	else if (n) t = n.type, i = n.match;
	else if (r) i = r;
	else if (!i) throw Error(el(21));
	return kc(a, "options.listener"), {
		predicate: i,
		type: t,
		effect: a
	};
}, Wc = /* @__PURE__ */ Rc((e) => {
	let { type: t, predicate: n, effect: r } = Uc(e);
	return {
		id: cc(),
		effect: r,
		type: t,
		predicate: n,
		pending: /* @__PURE__ */ new Set(),
		unsubscribe: () => {
			throw Error(el(22));
		}
	};
}, { withTypes: () => Wc }), Gc = (e, t) => {
	let { type: n, effect: r, predicate: i } = Uc(t);
	return Array.from(e.values()).find((e) => (typeof n == "string" ? e.type === n : e.predicate === i) && e.effect === r);
}, Kc = (e) => {
	e.pending.forEach((e) => {
		e.abort(Ec);
	});
}, qc = (e, t) => () => {
	for (let e of t.keys()) Kc(e);
	e.clear();
}, Jc = (e, t, n) => {
	try {
		e(t, n);
	} catch (e) {
		setTimeout(() => {
			throw e;
		}, 0);
	}
}, Yc = /* @__PURE__ */ Rc(/* @__PURE__ */ Ks(`${Bc}/add`), { withTypes: () => Yc }), Xc = /* @__PURE__ */ Ks(`${Bc}/removeAll`), Zc = /* @__PURE__ */ Rc(/* @__PURE__ */ Ks(`${Bc}/remove`), { withTypes: () => Zc }), Qc = (...e) => {
	console.error(`${Bc}/error`, ...e);
}, $c = (e = {}) => {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e) => {
		let t = n.get(e) ?? 0;
		n.set(e, t + 1);
	}, i = (e) => {
		let t = n.get(e) ?? 1;
		t === 1 ? n.delete(e) : n.set(e, t - 1);
	}, { extra: a, onError: o = Qc } = e;
	kc(o, "onError");
	let s = (e) => (e.unsubscribe = () => t.delete(e.id), t.set(e.id, e), (t) => {
		e.unsubscribe(), t?.cancelActive && Kc(e);
	}), c = ((e) => {
		let n = Gc(t, e) ?? Wc(e);
		return s(n);
	});
	Rc(c, { withTypes: () => c });
	let l = (e) => {
		let n = Gc(t, e);
		return n && (n.unsubscribe(), e.cancelActive && Kc(n)), !!n;
	};
	Rc(l, { withTypes: () => l });
	let u = async (e, n, s, l) => {
		let u = new AbortController(), d = Hc(c, u.signal), f = [];
		try {
			e.pending.add(u), r(e), await Promise.resolve(e.effect(n, Rc({}, s, {
				getOriginalState: l,
				condition: (e, t) => d(e, t).then(Boolean),
				take: d,
				delay: Lc(u.signal),
				pause: Ic(u.signal),
				extra: a,
				signal: u.signal,
				fork: Vc(u.signal, f),
				unsubscribe: e.unsubscribe,
				subscribe: () => {
					t.set(e.id, e);
				},
				cancelActiveListeners: () => {
					e.pending.forEach((e, t, n) => {
						e !== u && (e.abort(Ec), n.delete(e));
					});
				},
				cancel: () => {
					u.abort(Ec), e.pending.delete(u);
				},
				throwIfCancelled: () => {
					Nc(u.signal);
				}
			})));
		} catch (e) {
			e instanceof Oc || Jc(o, e, { raisedBy: "effect" });
		} finally {
			await Promise.all(f), u.abort(Dc), i(e), e.pending.delete(u);
		}
	}, d = qc(t, n);
	return {
		middleware: (e) => (n) => (r) => {
			if (!yo(r)) return n(r);
			if (Yc.match(r)) return c(r.payload);
			if (Xc.match(r)) {
				d();
				return;
			}
			if (Zc.match(r)) return l(r.payload);
			let i = e.getState(), a = () => {
				if (i === zc) throw Error(el(23));
				return i;
			}, s;
			try {
				if (s = n(r), t.size > 0) {
					let n = e.getState(), s = Array.from(t.values());
					for (let t of s) {
						let s = !1;
						try {
							s = t.predicate(r, n, i);
						} catch (e) {
							s = !1, Jc(o, e, { raisedBy: "predicate" });
						}
						s && u(t, r, e, a);
					}
				}
			} finally {
				i = zc;
			}
			return s;
		},
		startListening: c,
		stopListening: l,
		clearListeners: d
	};
};
function el(e) {
	return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/layoutSlice.js
var tl = pc({
	name: "chartLayout",
	initialState: {
		layoutType: "horizontal",
		width: 0,
		height: 0,
		margin: {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		},
		scale: 1
	},
	reducers: {
		setLayout(e, t) {
			e.layoutType = t.payload;
		},
		setChartSize(e, t) {
			e.width = t.payload.width, e.height = t.payload.height;
		},
		setMargin(e, t) {
			e.margin.top = t.payload.top ?? 0, e.margin.right = t.payload.right ?? 0, e.margin.bottom = t.payload.bottom ?? 0, e.margin.left = t.payload.left ?? 0;
		},
		setScale(e, t) {
			e.scale = t.payload;
		}
	}
}), nl = tl.actions, rl = nl.setMargin, il = nl.setLayout, al = nl.setChartSize, ol = nl.setScale, sl = tl.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/util/getSliced.js
function cl(e, t, n) {
	return Array.isArray(e) && e && t + n !== 0 ? e.slice(t, n + 1) : e;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/isWellBehavedNumber.js
function G(e) {
	return Number.isFinite(e);
}
function ll(e) {
	return typeof e == "number" && e > 0 && Number.isFinite(e);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/ChartUtils.js
function ul(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function dl(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ul(Object(n), !0).forEach(function(t) {
			fl(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ul(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function fl(e, t, n) {
	return (t = pl(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function pl(e) {
	var t = ml(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ml(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function K(e, t, n) {
	return R(e) || R(t) ? n : Rt(t) ? At(e, t, n) : typeof t == "function" ? t(e) : n;
}
var hl = (e, t, n) => {
	if (t && n) {
		var r = n.width, i = n.height, a = t.align, o = t.verticalAlign, s = t.layout, c = t.position, l = t.offset, u = l === void 0 ? 0 : l;
		if (c != null) {
			if (tn(c)) {
				if (c === "top" && I(e.top)) return dl(dl({}, e), {}, { top: e.top + (i || 0) + u });
				if (c === "bottom" && I(e.bottom)) return dl(dl({}, e), {}, { bottom: e.bottom + (i || 0) + u });
				if (c === "left" && I(e.left)) return dl(dl({}, e), {}, { left: e.left + (r || 0) + u });
				if (c === "right" && I(e.right)) return dl(dl({}, e), {}, { right: e.right + (r || 0) + u });
			}
			return e;
		}
		if ((s === "vertical" || s === "horizontal" && o === "middle") && a !== "center" && I(e[a])) return dl(dl({}, e), {}, { [a]: e[a] + (r || 0) });
		if ((s === "horizontal" || s === "vertical" && a === "center") && o !== "middle" && I(e[o])) return dl(dl({}, e), {}, { [o]: e[o] + (i || 0) });
	}
	return e;
}, gl = (e, t) => e === "horizontal" && t === "xAxis" || e === "vertical" && t === "yAxis" || e === "centric" && t === "angleAxis" || e === "radial" && t === "radiusAxis", _l = (e, t, n, r) => {
	if (r) return e.map((e) => e.coordinate);
	var i, a, o = e.map((e) => (e.coordinate === t && (i = !0), e.coordinate === n && (a = !0), e.coordinate));
	return i || o.push(t), a || o.push(n), o;
}, vl = (e, t, n) => {
	if (!e) return null;
	var r = e.duplicateDomain, i = e.type, a = e.range, o = e.scale, s = e.realScaleType, c = e.isCategorical, l = e.categoricalDomain, u = e.tickCount, d = e.ticks, f = e.niceTicks, p = e.axisType;
	if (!o) return null;
	var m = s === "scaleBand" && o.bandwidth ? o.bandwidth() / 2 : 2, h = (t || n) && i === "category" && o.bandwidth ? o.bandwidth() / m : 0;
	return h = p === "angleAxis" && a && a.length >= 2 ? Ft(a[0] - a[1]) * 2 * h : h, t && (d || f) ? (d || f || []).map((e, t) => {
		var n = r ? r.indexOf(e) : e, i = o.map(n);
		return G(i) ? {
			coordinate: i + h,
			value: e,
			offset: h,
			index: t
		} : null;
	}).filter(Gt) : c && l ? l.map((e, t) => {
		var n = o.map(e);
		return G(n) ? {
			coordinate: n + h,
			value: e,
			index: t,
			offset: h
		} : null;
	}).filter(Gt) : o.ticks && !n && u != null ? o.ticks(u).map((e, t) => {
		var n = o.map(e);
		return G(n) ? {
			coordinate: n + h,
			value: e,
			index: t,
			offset: h
		} : null;
	}).filter(Gt) : o.domain().map((e, t) => {
		var n = o.map(e);
		return G(n) ? {
			coordinate: n + h,
			value: r ? r[e] : e,
			index: t,
			offset: h
		} : null;
	}).filter(Gt);
}, yl = (e, t) => {
	if (!t || t.length !== 2 || !I(t[0]) || !I(t[1])) return e;
	var n = Math.min(t[0], t[1]), r = Math.max(t[0], t[1]), i = [e[0], e[1]];
	return (!I(e[0]) || e[0] < n) && (i[0] = n), (!I(e[1]) || e[1] > r) && (i[1] = r), i[0] > r && (i[0] = r), i[1] < n && (i[1] = n), i;
}, bl = {
	sign: (e) => {
		var t = e.length;
		if (!(t <= 0)) {
			var n = e[0]?.length;
			if (!(n == null || n <= 0)) for (var r = 0; r < n; ++r) for (var i = 0, a = 0, o = 0; o < t; ++o) {
				var s = e[o]?.[r];
				if (s != null) {
					var c = s[1], l = s[0], u = It(c) ? l : c;
					u >= 0 ? (s[0] = i, i += u, s[1] = i) : (s[0] = a, a += u, s[1] = a);
				}
			}
		}
	},
	expand: wr,
	none: yr,
	silhouette: Tr,
	wiggle: Er,
	positive: (e) => {
		var t = e.length;
		if (!(t <= 0)) {
			var n = e[0]?.length;
			if (!(n == null || n <= 0)) for (var r = 0; r < n; ++r) for (var i = 0, a = 0; a < t; ++a) {
				var o = e[a]?.[r];
				if (o != null) {
					var s = It(o[1]) ? o[0] : o[1];
					s >= 0 ? (o[0] = i, i += s, o[1] = i) : (o[0] = 0, o[1] = 0);
				}
			}
		}
	}
}, xl = (e, t, n) => {
	var r = bl[n] ?? yr, i = Cr().keys(t).value((e, t) => Number(K(e, t, 0))).order(br).offset(r)(e);
	return i.forEach((n, r) => {
		n.forEach((n, i) => {
			var a = K(e[i], t[r], 0);
			Array.isArray(a) && a.length === 2 && I(a[0]) && I(a[1]) && (n[0] = a[0], n[1] = a[1]);
		});
	}), i;
};
function Sl(e) {
	return e == null ? void 0 : String(e);
}
function Cl(e) {
	var t = e.axis, n = e.ticks, r = e.bandSize, i = e.entry, a = e.index, o = e.dataKey;
	if (t.type === "category") {
		if (!t.allowDuplicatedCategory && t.dataKey && !R(i[t.dataKey])) {
			var s = Ut(n, "value", i[t.dataKey]);
			if (s) return s.coordinate + r / 2;
		}
		return n != null && n[a] ? n[a].coordinate + r / 2 : null;
	}
	var c = K(i, R(o) ? t.dataKey : o), l = t.scale.map(c);
	return I(l) ? l : null;
}
var wl = (e) => {
	var t = e.axis, n = e.ticks, r = e.offset, i = e.bandSize, a = e.entry, o = e.index;
	if (t.type === "category") return n[o] ? n[o].coordinate + r : null;
	var s = K(a, t.dataKey, t.scale.domain()[o]);
	if (R(s)) return null;
	var c = t.scale.map(s);
	return I(c) ? c - i / 2 + r : null;
}, Tl = (e) => {
	var t = e.numericAxis, n = t.scale.domain();
	if (t.type === "number") {
		var r = Math.min(n[0], n[1]), i = Math.max(n[0], n[1]);
		return r <= 0 && i >= 0 ? 0 : i < 0 ? i : r;
	}
	return n[0];
}, El = (e) => {
	var t = e.flat(2).filter(I);
	return [Math.min(...t), Math.max(...t)];
}, Dl = (e) => [e[0] === Infinity ? 0 : e[0], e[1] === -Infinity ? 0 : e[1]], Ol = (e, t, n) => {
	if (e != null && Object.keys(e).length !== 0) return Dl(Object.keys(e).reduce((r, i) => {
		var a = e[i];
		if (!a) return r;
		var o = a.stackedData.reduce((e, r) => {
			var i = El(cl(r, t, n));
			return !G(i[0]) || !G(i[1]) ? e : [Math.min(e[0], i[0]), Math.max(e[1], i[1])];
		}, [Infinity, -Infinity]);
		return [Math.min(o[0], r[0]), Math.max(o[1], r[1])];
	}, [Infinity, -Infinity]));
}, kl = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/, Al = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/, jl = (e, t, n) => {
	if (e && e.scale && e.scale.bandwidth) {
		var r = e.scale.bandwidth();
		if (!n || r > 0) return r;
	}
	if (e && t && t.length >= 2) {
		for (var i = qa(t, (e) => e.coordinate), a = [], o = 0, s = 1, c = i.length; s < c; s++) {
			var l = (i[s]?.coordinate || 0) - (i[s - 1]?.coordinate || 0);
			a.push(l), o = Math.max(l, o);
		}
		var u = o * 1e-4, d = Infinity;
		for (var f of a) f > u && (d = Math.min(f, d));
		return d === Infinity ? 0 : d;
	}
	return n ? void 0 : 0;
};
function Ml(e) {
	var t = e.tooltipEntrySettings, n = e.dataKey, r = e.payload, i = e.value, a = e.name;
	return dl(dl({}, t), {}, {
		dataKey: n,
		payload: r,
		value: i,
		name: a
	});
}
function Nl(e, t) {
	if (e != null) return String(e);
	if (typeof t == "string") return t;
}
var Pl = (e, t) => {
	if (t === "horizontal") return e.relativeX;
	if (t === "vertical") return e.relativeY;
}, Fl = (e, t) => t === "centric" ? e.angle : e.radius, Il = (e) => e.layout.width, Ll = (e) => e.layout.height, Rl = (e) => e.layout.scale, zl = (e) => e.layout.margin, Bl = H((e) => e.cartesianAxis.xAxis, (e) => Object.values(e)), Vl = H((e) => e.cartesianAxis.yAxis, (e) => Object.values(e)), Hl = "data-recharts-item-index";
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/selectChartOffsetInternal.js
function Ul(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Wl(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Ul(Object(n), !0).forEach(function(t) {
			Gl(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ul(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Gl(e, t, n) {
	return (t = Kl(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Kl(e) {
	var t = ql(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ql(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Jl = (e) => e.brush.height;
function Yl(e) {
	return Vl(e).reduce((e, t) => t.orientation === "left" && !t.mirror && !t.hide ? e + (typeof t.width == "number" ? t.width : 60) : e, 0);
}
function Xl(e) {
	return Vl(e).reduce((e, t) => t.orientation === "right" && !t.mirror && !t.hide ? e + (typeof t.width == "number" ? t.width : 60) : e, 0);
}
function Zl(e) {
	return Bl(e).reduce((e, t) => t.orientation === "top" && !t.mirror && !t.hide ? e + (typeof t.height == "number" ? t.height : 30) : e, 0);
}
function Ql(e) {
	return Bl(e).reduce((e, t) => t.orientation === "bottom" && !t.mirror && !t.hide ? e + (typeof t.height == "number" ? t.height : 30) : e, 0);
}
var $l = H([
	Il,
	Ll,
	zl,
	Jl,
	Yl,
	Xl,
	Zl,
	Ql,
	Ja,
	Ya
], (e, t, n, r, i, a, o, s, c, l) => {
	var u = {
		left: (n.left || 0) + i,
		right: (n.right || 0) + a
	}, d = Wl(Wl({}, {
		top: (n.top || 0) + o,
		bottom: (n.bottom || 0) + s
	}), u), f = d.bottom;
	d.bottom += r, d = hl(d, c, l);
	var p = e - d.left - d.right, m = t - d.top - d.bottom;
	return Wl(Wl({ brushBottom: f }, d), {}, {
		width: Math.max(p, 0),
		height: Math.max(m, 0)
	});
}), eu = H($l, (e) => ({
	x: e.left,
	y: e.top,
	width: e.width,
	height: e.height
})), tu = H(Il, Ll, (e, t) => ({
	x: 0,
	y: 0,
	width: e,
	height: t
})), nu = /*#__PURE__*/ (0, P.createContext)(null), ru = () => (0, P.useContext)(nu) != null, iu = (e) => e.brush, au = H([
	iu,
	$l,
	zl
], (e, t, n) => ({
	height: e.height,
	x: I(e.x) ? e.x : t.left,
	y: I(e.y) ? e.y : t.top + t.height + t.brushBottom - (n?.bottom || 0),
	width: I(e.width) ? e.width : t.width
}));
// ../../../peach/frontend/node_modules/es-toolkit/dist/function/debounce.mjs
function ou(e, t, { signal: n, edges: r } = {}) {
	let i, a = null, o = r != null && r.includes("leading"), s = r == null || r.includes("trailing"), c = () => {
		a !== null && (e.apply(i, a), i = void 0, a = null);
	}, l = () => {
		s && c(), p();
	}, u = null, d = () => {
		u != null && clearTimeout(u), u = setTimeout(() => {
			u = null, l();
		}, t);
	}, f = () => {
		u !== null && (clearTimeout(u), u = null);
	}, p = () => {
		f(), i = void 0, a = null;
	}, m = () => {
		c();
	}, h = function(...e) {
		if (n?.aborted) return;
		i = this, a = e;
		let t = u == null;
		d(), o && t && c();
	};
	return h.schedule = d, h.cancel = p, h.flush = m, n?.addEventListener("abort", p, { once: !0 }), h;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/function/debounce.mjs
function su(e, t = 0, n = {}) {
	typeof n != "object" && (n = {});
	let { leading: r = !1, trailing: i = !0, maxWait: a } = n, o = [, ,];
	r && (o[0] = "leading"), i && (o[1] = "trailing");
	let s, c = null, l = ou(function(...t) {
		s = e.apply(this, t), c = null;
	}, t, { edges: o }), u = function(...t) {
		return a != null && (c === null && (c = Date.now()), Date.now() - c >= a) ? ((r || i) && (s = e.apply(this, t)), c = Date.now(), l.cancel(), l.schedule(), s) : (l.apply(this, t), s);
	};
	return u.cancel = l.cancel, u.flush = () => (l.flush(), s), u;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/function/throttle.mjs
function cu(e, t = 0, n = {}) {
	let { leading: r = !0, trailing: i = !0 } = n;
	return su(e, t, {
		leading: r,
		maxWait: t,
		trailing: i
	});
}
// ../../../peach/frontend/node_modules/recharts/es6/util/LogUtils.js
var lu = function(e, t) {
	var n = [...arguments].slice(2);
	if (typeof console < "u" && console.warn && (t === void 0 && console.warn("LogUtils requires an error message argument"), !e)) {
		if (t === void 0) console.warn("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
		else {
			var r = 0;
			console.warn(t.replace(/%s/g, () => n[r++]));
		}
	}
}, uu = {
	width: "100%",
	height: "100%",
	debounce: 0,
	minWidth: 0,
	initialDimension: {
		width: -1,
		height: -1
	}
}, du = (e, t, n) => {
	var r = n.width, i = r === void 0 ? uu.width : r, a = n.height, o = a === void 0 ? uu.height : a, s = n.aspect, c = n.maxHeight, l = Lt(i) ? e : Number(i), u = Lt(o) ? t : Number(o);
	return s && s > 0 && (l ? u = l / s : u && (l = u * s), c && u != null && u > c && (u = c)), {
		calculatedWidth: l,
		calculatedHeight: u
	};
}, fu = {
	width: 0,
	height: 0,
	overflow: "visible"
}, pu = {
	width: 0,
	overflowX: "visible"
}, mu = {
	height: 0,
	overflowY: "visible"
}, hu = {}, gu = (e) => {
	var t = e.width, n = e.height, r = Lt(t), i = Lt(n);
	return r && i ? fu : r ? pu : i ? mu : hu;
};
function _u(e) {
	var t = e.width, n = e.height, r = e.aspect, i = t, a = n;
	return i === void 0 && a === void 0 ? (i = uu.width, a = uu.height) : i === void 0 ? i = r && r > 0 ? void 0 : uu.width : a === void 0 && (a = r && r > 0 ? void 0 : uu.height), {
		width: i,
		height: a
	};
}
// ../../../peach/frontend/node_modules/recharts/es6/component/ResponsiveContainer.js
var vu = [
	"aspect",
	"initialDimension",
	"width",
	"height",
	"minWidth",
	"minHeight",
	"maxHeight",
	"children",
	"debounce",
	"id",
	"className",
	"onResize",
	"style"
];
function yu() {
	return yu = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, yu.apply(null, arguments);
}
function bu(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function xu(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? bu(Object(n), !0).forEach(function(t) {
			Su(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : bu(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Su(e, t, n) {
	return (t = Cu(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Cu(e) {
	var t = wu(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function wu(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Tu(e, t) {
	return Au(e) || ku(e, t) || Du(e, t) || Eu();
}
function Eu() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Du(e, t) {
	if (e) {
		if (typeof e == "string") return Ou(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ou(e, t) : void 0;
	}
}
function Ou(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function ku(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Au(e) {
	if (Array.isArray(e)) return e;
}
function ju(e, t) {
	if (e == null) return {};
	var n, r, i = Mu(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Mu(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var Nu = /*#__PURE__*/ (0, P.createContext)(uu.initialDimension);
function Pu(e) {
	return ll(e.width) && ll(e.height);
}
function Fu(e) {
	var t = e.children, n = e.width, r = e.height, i = (0, P.useMemo)(() => ({
		width: n,
		height: r
	}), [n, r]);
	return Pu(i) ? /*#__PURE__*/ P.createElement(Nu.Provider, { value: i }, t) : null;
}
var Iu = () => (0, P.useContext)(Nu), Lu = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.aspect, r = e.initialDimension, i = r === void 0 ? uu.initialDimension : r, a = e.width, o = e.height, s = e.minWidth, c = s === void 0 ? uu.minWidth : s, l = e.minHeight, u = e.maxHeight, d = e.children, f = e.debounce, p = f === void 0 ? uu.debounce : f, m = e.id, h = e.className, g = e.onResize, _ = e.style, v = _ === void 0 ? {} : _, y = ju(e, vu), b = (0, P.useRef)(null), x = (0, P.useRef)();
	x.current = g, (0, P.useImperativeHandle)(t, () => b.current);
	var S = Tu((0, P.useState)({
		containerWidth: i.width,
		containerHeight: i.height
	}), 2), C = S[0], w = S[1], T = (0, P.useCallback)((e, t) => {
		w((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []);
	(0, P.useEffect)(() => {
		if (b.current == null || typeof ResizeObserver > "u") return Kt;
		var e = (e) => {
			var t, n = e[0];
			if (n != null) {
				var r = n.contentRect, i = r.width, a = r.height;
				T(i, a), (t = x.current) == null || t.call(x, i, a);
			}
		};
		p > 0 && (e = cu(e, p, {
			trailing: !0,
			leading: !1
		}));
		var t = new ResizeObserver(e), n = b.current.getBoundingClientRect(), r = n.width, i = n.height;
		return T(r, i), t.observe(b.current), () => {
			t.disconnect();
		};
	}, [T, p]);
	var E = C.containerWidth, D = C.containerHeight;
	lu(!n || n > 0, "The aspect(%s) must be greater than zero.", n);
	var O = du(E, D, {
		width: a,
		height: o,
		aspect: n,
		maxHeight: u
	}), k = O.calculatedWidth, A = O.calculatedHeight;
	return lu(E < 0 || D < 0 || k != null && k > 0 || A != null && A > 0, "The width(%s) and height(%s) of chart should be greater than 0,\n       please check the style of container, or the props width(%s) and height(%s),\n       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the\n       height and width.", k, A, a, o, c, l, n), /*#__PURE__*/ P.createElement("div", yu({
		id: m ? `${m}` : void 0,
		className: N("recharts-responsive-container", h),
		style: xu(xu({}, v), {}, {
			width: a,
			height: o,
			minWidth: c,
			minHeight: l,
			maxHeight: u
		}),
		ref: b
	}, y), /*#__PURE__*/ P.createElement("div", { style: gu({
		width: a,
		height: o
	}) }, /*#__PURE__*/ P.createElement(Fu, {
		width: k,
		height: A
	}, d)));
}), Ru = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = Iu();
	if (ll(n.width) && ll(n.height)) return e.children;
	var r = _u({
		width: e.width,
		height: e.height,
		aspect: e.aspect
	}), i = r.width, a = r.height, o = du(void 0, void 0, {
		width: i,
		height: a,
		aspect: e.aspect,
		maxHeight: e.maxHeight
	}), s = o.calculatedWidth, c = o.calculatedHeight;
	return I(s) && I(c) ? /*#__PURE__*/ P.createElement(Fu, {
		width: s,
		height: c
	}, e.children) : /*#__PURE__*/ P.createElement(Lu, yu({}, e, {
		width: i,
		height: a,
		ref: t
	}));
}), zu = () => {
	var e = ru(), t = V(eu), n = V(au), r = V(iu)?.padding;
	return !e || !n || !r ? t : {
		width: n.width - r.left - r.right,
		height: n.height - r.top - r.bottom,
		x: r.left,
		y: r.top
	};
}, Bu = {
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	width: 0,
	height: 0,
	brushBottom: 0
}, Vu = () => V($l) ?? Bu, Hu = () => V(Il), Uu = () => V(Ll), Wu = () => V((e) => e.layout.margin), q = (e) => e.layout.layoutType, Gu = () => V(q), Ku = () => {
	var e = Gu();
	if (e === "horizontal" || e === "vertical") return e;
}, qu = (e) => {
	var t = e.layout.layoutType;
	if (t === "centric" || t === "radial") return t;
}, Ju = () => V(qu), Yu = () => Gu() !== void 0, Xu = (e) => {
	var t = B(), n = ru(), r = e.width, i = e.height, a = Iu(), o = r, s = i;
	return a && (o = a.width > 0 ? a.width : r, s = a.height > 0 ? a.height : i), (0, P.useEffect)(() => {
		!n && ll(o) && ll(s) && t(al({
			width: o,
			height: s
		}));
	}, [
		t,
		n,
		o,
		s
	]), null;
}, Zu = pc({
	name: "legend",
	initialState: {
		settings: {
			layout: "horizontal",
			align: "center",
			verticalAlign: "bottom",
			itemSorter: "value",
			position: void 0,
			offset: 0
		},
		size: {
			width: 0,
			height: 0
		},
		payload: []
	},
	reducers: {
		setLegendSize(e, t) {
			e.size.width = t.payload.width, e.size.height = t.payload.height;
		},
		setLegendSettings(e, t) {
			e.settings.align = t.payload.align, e.settings.layout = t.payload.layout, e.settings.verticalAlign = t.payload.verticalAlign, e.settings.itemSorter = t.payload.itemSorter, e.settings.position = t.payload.position, e.settings.offset = t.payload.offset;
		},
		addLegendPayload: {
			reducer(e, t) {
				e.payload.push(U(t.payload));
			},
			prepare: W()
		},
		replaceLegendPayload: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = zs(e).payload.indexOf(U(r));
				a > -1 && (e.payload[a] = U(i));
			},
			prepare: W()
		},
		removeLegendPayload: {
			reducer(e, t) {
				var n = zs(e).payload.indexOf(U(t.payload));
				n > -1 && e.payload.splice(n, 1);
			},
			prepare: W()
		}
	}
}), Qu = Zu.actions, $u = Qu.setLegendSize, ed = Qu.setLegendSettings, td = Qu.addLegendPayload, nd = Qu.replaceLegendPayload, rd = Qu.removeLegendPayload, id = Zu.reducer, ad = /* @__PURE__ */ T(((e) => {
	var t = Ee();
	t.useSyncExternalStore, t.useRef, t.useEffect, t.useMemo, t.useDebugValue;
}));
(/* @__PURE__ */ T(((e, t) => {
	t.exports = ad();
})))();
function od(e) {
	e();
}
function sd() {
	let e = null, t = null;
	return {
		clear() {
			e = null, t = null;
		},
		notify() {
			od(() => {
				let t = e;
				for (; t;) t.callback(), t = t.next;
			});
		},
		get() {
			let t = [], n = e;
			for (; n;) t.push(n), n = n.next;
			return t;
		},
		subscribe(n) {
			let r = !0, i = t = {
				callback: n,
				next: null,
				prev: t
			};
			return i.prev ? i.prev.next = i : e = i, function() {
				r && e !== null && (r = !1, i.next ? i.next.prev = i.prev : t = i.prev, i.prev ? i.prev.next = i.next : e = i.next);
			};
		}
	};
}
var cd = {
	notify() {},
	get: () => []
};
function ld(e, t) {
	let n, r = cd, i = 0, a = !1;
	function o(e) {
		u();
		let t = r.subscribe(e), n = !1;
		return () => {
			n || (n = !0, t(), d());
		};
	}
	function s() {
		r.notify();
	}
	function c() {
		m.onStateChange && m.onStateChange();
	}
	function l() {
		return a;
	}
	function u() {
		i++, n || (n = t ? t.addNestedSub(c) : e.subscribe(c), r = sd());
	}
	function d() {
		i--, n && i === 0 && (n(), n = void 0, r.clear(), r = cd);
	}
	function f() {
		a || (a = !0, u());
	}
	function p() {
		a && (a = !1, d());
	}
	let m = {
		addNestedSub: o,
		notifyNestedSubs: s,
		handleChangeWrapper: c,
		isSubscribed: l,
		trySubscribe: f,
		tryUnsubscribe: p,
		getListeners: () => r
	};
	return m;
}
var ud = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, dd = typeof navigator < "u" && navigator.product === "ReactNative", fd = ud || dd ? P.useLayoutEffect : P.useEffect;
function pd(e, t) {
	return e === t ? e !== 0 || t !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
function md(e, t) {
	if (pd(e, t)) return !0;
	if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r = 0; r < n.length; r++) if (!Object.prototype.hasOwnProperty.call(t, n[r]) || !pd(e[n[r]], t[n[r]])) return !1;
	return !0;
}
var hd = /* @__PURE__ */ Symbol.for("react-redux-context"), gd = typeof globalThis < "u" ? globalThis : {};
function _d() {
	if (!P.createContext) return {};
	let e = gd[hd] ??= /* @__PURE__ */ new Map(), t = e.get(P.createContext);
	return t || (t = P.createContext(null), e.set(P.createContext, t)), t;
}
var vd = /* @__PURE__ */ _d();
function yd(e) {
	let { children: t, context: n, serverState: r, store: i } = e, a = P.useMemo(() => {
		let e = ld(i);
		return {
			store: i,
			subscription: e,
			getServerState: r ? () => r : void 0
		};
	}, [i, r]), o = P.useMemo(() => i.getState(), [i]);
	fd(() => {
		let { subscription: e } = a;
		return e.onStateChange = e.notifyNestedSubs, e.trySubscribe(), o !== i.getState() && e.notifyNestedSubs(), () => {
			e.tryUnsubscribe(), e.onStateChange = void 0;
		};
	}, [a, o]);
	let s = n || vd;
	return /* @__PURE__ */ P.createElement(s.Provider, { value: a }, t);
}
var bd = yd, xd = /* @__PURE__ */ new Set([
	"axisLine",
	"tickLine",
	"activeBar",
	"activeDot",
	"activeLabel",
	"activeShape",
	"allowEscapeViewBox",
	"background",
	"cursor",
	"dot",
	"label",
	"line",
	"margin",
	"padding",
	"position",
	"shape",
	"style",
	"tick",
	"wrapperStyle",
	"radius",
	"throttledEvents"
]);
function Sd(e, t) {
	return e == null && t == null ? !0 : typeof e == "number" && typeof t == "number" ? e === t || e !== e && t !== t : e === t;
}
function Cd(e, t) {
	for (var n of /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])) if (xd.has(n)) {
		if (e[n] == null && t[n] == null) continue;
		if (!md(e[n], t[n])) return !1;
	} else if (!Sd(e[n], t[n])) return !1;
	return !0;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/selectLegendArea.js
var wd = H([
	Il,
	Ll,
	zl
], (e, t, n) => ({
	x: n.left || 0,
	y: n.top || 0,
	width: Math.max(e - (n.left || 0) - (n.right || 0), 0),
	height: Math.max(t - (n.top || 0) - (n.bottom || 0), 0)
}));
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/cartesianPositionToCSSTranslate.js
function Td(e, t) {
	return e === "start" && t === "start" ? "" : `translate(${e === "inherit" ? "0" : {
		start: "0",
		middle: "-50%",
		end: "-100%"
	}[e]}, ${{
		start: "0",
		middle: "-50%",
		end: "-100%"
	}[t] ?? "0"})`;
}
// ../../../peach/frontend/node_modules/recharts/es6/component/Legend.js
var Ed = /* @__PURE__ */ D(De()), Dd = ["contextPayload"];
function Od() {
	return Od = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Od.apply(null, arguments);
}
function kd(e, t) {
	return Pd(e) || Nd(e, t) || jd(e, t) || Ad();
}
function Ad() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function jd(e, t) {
	if (e) {
		if (typeof e == "string") return Md(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Md(e, t) : void 0;
	}
}
function Md(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Nd(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Pd(e) {
	if (Array.isArray(e)) return e;
}
function Fd(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Id(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Fd(Object(n), !0).forEach(function(t) {
			Ld(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Fd(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Ld(e, t, n) {
	return (t = Rd(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Rd(e) {
	var t = zd(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function zd(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Bd(e, t) {
	if (e == null) return {};
	var n, r, i = Vd(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Vd(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function Hd(e) {
	return e.value;
}
function Ud(e) {
	var t = e.contextPayload, n = Bd(e, Dd), r = ya(t, e.payloadUniqBy, Hd), i = Id(Id({}, n), {}, { payload: r });
	return /*#__PURE__*/ P.isValidElement(e.content) ? /*#__PURE__*/ P.cloneElement(e.content, i) : typeof e.content == "function" ? /*#__PURE__*/ P.createElement(e.content, i) : /*#__PURE__*/ P.createElement(li, i);
}
function Wd(e) {
	return e === "left" || e === "right" || e === "insideLeft" || e === "insideRight" ? "vertical" : "horizontal";
}
function Gd(e, t) {
	return t == null ? null : tn(t) ? wd(e) : eu(e);
}
function Kd(e, t, n) {
	return e === "top" ? { top: n.height + t } : e === "bottom" ? { top: -n.height - t } : e === "left" ? { left: n.width + t } : e === "right" ? { left: -n.width - t } : {};
}
function qd(e, t, n, r, i, a) {
	var o = t.layout, s = t.align, c = t.verticalAlign, l, u;
	return e && (e.left !== void 0 && e.left !== null || e.right !== void 0 && e.right !== null) || (l = s === "center" && o === "vertical" ? { left: ((r || 0) - a.width) / 2 } : s === "right" ? { right: n && n.right || 0 } : { left: n && n.left || 0 }), e && (e.top !== void 0 && e.top !== null || e.bottom !== void 0 && e.bottom !== null) || (u = c === "middle" ? { top: ((i || 0) - a.height) / 2 } : c === "bottom" ? { bottom: n && n.bottom || 0 } : { top: n && n.top || 0 }), Id(Id({}, l), u);
}
function Jd(e) {
	var t = e.align, n = e.layout, r = e.verticalAlign, i = e.itemSorter, a = e.position, o = e.offset, s = B();
	return (0, P.useLayoutEffect)(() => {
		s(ed({
			align: t,
			layout: n,
			verticalAlign: r,
			itemSorter: i,
			position: a,
			offset: o
		}));
	}, [
		s,
		t,
		n,
		r,
		i,
		a,
		o
	]), null;
}
function Yd(e) {
	var t = e.width, n = e.height, r = B();
	return (0, P.useLayoutEffect)(() => {
		r($u({
			width: t,
			height: n
		}));
	}, [
		r,
		t,
		n
	]), (0, P.useLayoutEffect)(() => () => {
		r($u({
			width: 0,
			height: 0
		}));
	}, [r]), null;
}
function Xd(e, t, n, r) {
	return e === "vertical" && t != null ? { height: t } : e === "horizontal" ? { width: n || r } : null;
}
var Zd = {
	align: "center",
	iconSize: 14,
	inactiveColor: "#ccc",
	itemSorter: "value",
	labelStyle: {},
	layout: "auto",
	verticalAlign: "bottom",
	offset: 0
};
function Qd(e) {
	var t = Zr(e, Zd), n = e.layout && e.layout !== "auto" ? e.layout : Wd(t.position), r = Za(), i = rn(), a = Wu(), o = V((e) => Gd(e, t.position)), s = t.width, c = t.height, l = t.wrapperStyle, u = t.portal, d = u == null && (t.position == null || tn(t.position)), f = kd(so([r]), 2), p = f[0], m = f[1], h = Hu(), g = Uu();
	if (h == null || g == null || t.position != null && o == null) return null;
	var _ = Xd(n, c, s, h - (a?.left || 0) - (a?.right || 0)), v = t.position == null ? null : $t({
		viewBox: o ?? {
			x: 0,
			y: 0,
			width: h,
			height: g
		},
		position: t.position,
		offset: t.offset ?? 0
	}), y = Kd(t.position, t.offset ?? 0, p), b = n === "vertical" ? (o?.width ?? 0) / 2 : o?.width ?? 0, x = n === "horizontal" ? (o?.height ?? 0) / 2 : o?.height ?? 0, S = v ? {
		width: "max-content",
		height: "max-content",
		maxWidth: b,
		maxHeight: x,
		overflowY: "auto",
		top: v.y + (y.top ?? 0),
		left: v.x + (y.left ?? 0),
		transform: Td(v.horizontalAnchor, v.verticalAnchor)
	} : qd(l, t, a, h, g, p), C = u ? l : Id(Id({
		position: "absolute",
		width: _?.width || s || "auto",
		height: _?.height || c || "auto"
	}, S), l), w = u ?? i;
	if (w == null || r == null) return null;
	var T = /*#__PURE__*/ P.createElement("div", {
		className: "recharts-legend-wrapper",
		style: C,
		ref: m
	}, /*#__PURE__*/ P.createElement(Jd, {
		layout: n,
		align: t.align,
		verticalAlign: t.verticalAlign,
		itemSorter: t.itemSorter,
		position: t.position,
		offset: t.offset
	}), d && /*#__PURE__*/ P.createElement(Yd, p), /*#__PURE__*/ P.createElement(Ud, Od({}, t, { layout: n }, _, {
		margin: a,
		chartWidth: h,
		chartHeight: g,
		contextPayload: r
	})));
	return /*#__PURE__*/ (0, Ed.createPortal)(T, w);
}
var $d = /*#__PURE__*/ P.memo(Qd, Cd);
$d.displayName = "Legend";
// ../../../peach/frontend/node_modules/recharts/es6/component/DefaultTooltipContent.js
function ef() {
	return ef = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, ef.apply(null, arguments);
}
function tf(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function nf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? tf(Object(n), !0).forEach(function(t) {
			rf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tf(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function rf(e, t, n) {
	return (t = af(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function af(e) {
	var t = of(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function of(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function sf(e, t) {
	return ff(e) || df(e, t) || lf(e, t) || cf();
}
function cf() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function lf(e, t) {
	if (e) {
		if (typeof e == "string") return uf(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? uf(e, t) : void 0;
	}
}
function uf(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function df(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ff(e) {
	if (Array.isArray(e)) return e;
}
function pf(e) {
	return Array.isArray(e) && Rt(e[0]) && Rt(e[1]) ? e.join(" ~ ") : e;
}
var mf = {
	separator: " : ",
	contentStyle: {
		margin: 0,
		padding: 10,
		backgroundColor: "#fff",
		border: "1px solid #ccc",
		whiteSpace: "nowrap"
	},
	itemStyle: {
		display: "block",
		paddingTop: 4,
		paddingBottom: 4,
		color: "#000"
	},
	labelStyle: {},
	accessibilityLayer: !1
};
function hf(e, t) {
	return t == null ? e : qa(e, t);
}
var gf = (e) => {
	var t = e.separator, n = t === void 0 ? mf.separator : t, r = e.contentStyle, i = e.itemStyle, a = e.labelStyle, o = a === void 0 ? mf.labelStyle : a, s = e.payload, c = e.formatter, l = e.itemSorter, u = e.wrapperClassName, d = e.labelClassName, f = e.label, p = e.labelFormatter, m = e.accessibilityLayer, h = m === void 0 ? mf.accessibilityLayer : m, g = () => {
		if (s && s.length) {
			var e = {
				padding: 0,
				margin: 0
			}, t = hf(s, l).map((e, t) => {
				if (!e || e.type === "none") return null;
				var r = e.formatter || c || pf, a = e.value, o = e.name, l = a, u = o;
				if (r) {
					var d = r(a, o, e, t, s);
					if (Array.isArray(d)) {
						var f = sf(d, 2);
						l = f[0], u = f[1];
					} else if (d != null) l = d;
					else return null;
				}
				var p = nf(nf({}, mf.itemStyle), {}, { color: e.color || mf.itemStyle.color }, i);
				return /*#__PURE__*/ P.createElement("li", {
					className: "recharts-tooltip-item",
					key: `tooltip-item-${t}`,
					style: p
				}, Rt(u) ? /*#__PURE__*/ P.createElement("span", { className: "recharts-tooltip-item-name" }, u) : null, Rt(u) ? /*#__PURE__*/ P.createElement("span", { className: "recharts-tooltip-item-separator" }, n) : null, /*#__PURE__*/ P.createElement("span", { className: "recharts-tooltip-item-value" }, l), /*#__PURE__*/ P.createElement("span", { className: "recharts-tooltip-item-unit" }, e.unit || ""));
			});
			return /*#__PURE__*/ P.createElement("ul", {
				className: "recharts-tooltip-item-list",
				style: e
			}, t);
		}
		return null;
	}, _ = nf(nf({}, mf.contentStyle), r), v = nf({ margin: 0 }, o), y = !R(f), b = y ? f : "", x = N("recharts-default-tooltip", u), S = N("recharts-tooltip-label", d);
	y && p && s != null && (b = p(f, s));
	var C = h ? {
		role: "status",
		"aria-live": "assertive"
	} : {};
	return /*#__PURE__*/ P.createElement("div", ef({
		className: x,
		style: _
	}, C), /*#__PURE__*/ P.createElement("p", {
		className: S,
		style: v
	}, /*#__PURE__*/ P.isValidElement(b) ? b : `${b}`), g());
}, _f = "recharts-tooltip-wrapper", vf = { visibility: "hidden" };
function yf(e) {
	var t = e.coordinate, n = e.translateX, r = e.translateY;
	return N(_f, {
		[`${_f}-right`]: I(n) && t && I(t.x) && n >= t.x,
		[`${_f}-left`]: I(n) && t && I(t.x) && n < t.x,
		[`${_f}-bottom`]: I(r) && t && I(t.y) && r >= t.y,
		[`${_f}-top`]: I(r) && t && I(t.y) && r < t.y
	});
}
function bf(e) {
	var t = e.allowEscapeViewBox, n = e.coordinate, r = e.key, i = e.offset, a = e.position, o = e.reverseDirection, s = e.tooltipDimension, c = e.viewBox, l = e.viewBoxDimension;
	if (a && I(a[r])) return a[r];
	var u = n[r] - s - (i > 0 ? i : 0), d = n[r] + i;
	if (t[r]) return o[r] ? u : d;
	var f = c[r];
	return f == null ? 0 : o[r] ? Math.max(u < f ? d : u, f) : l == null ? 0 : d + s > f + l ? Math.max(u, f) : Math.max(d, f);
}
function xf(e) {
	var t = e.translateX, n = e.translateY;
	return { transform: e.useTranslate3d ? `translate3d(${t}px, ${n}px, 0)` : `translate(${t}px, ${n}px)` };
}
function Sf(e) {
	var t = e.allowEscapeViewBox, n = e.coordinate, r = e.offsetTop, i = e.offsetLeft, a = e.position, o = e.reverseDirection, s = e.tooltipBox, c = e.useTranslate3d, l = e.viewBox, u, d, f;
	return s && s.height > 0 && s.width > 0 && n ? (d = bf({
		allowEscapeViewBox: t,
		coordinate: n,
		key: "x",
		offset: i,
		position: a,
		reverseDirection: o,
		tooltipDimension: s.width,
		viewBox: l,
		viewBoxDimension: l.width
	}), f = bf({
		allowEscapeViewBox: t,
		coordinate: n,
		key: "y",
		offset: r,
		position: a,
		reverseDirection: o,
		tooltipDimension: s.height,
		viewBox: l,
		viewBoxDimension: l.height
	}), u = xf({
		translateX: d,
		translateY: f,
		useTranslate3d: c
	})) : u = vf, {
		cssProperties: u,
		cssClasses: yf({
			translateX: d,
			translateY: f,
			coordinate: n
		})
	};
}
var Cf = {
	devToolsEnabled: !0,
	isSsr: !(typeof window < "u" && window.document && window.document.createElement && window.setTimeout)
};
// ../../../peach/frontend/node_modules/recharts/es6/util/usePrefersReducedMotion.js
function wf(e, t) {
	return kf(e) || Of(e, t) || Ef(e, t) || Tf();
}
function Tf() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ef(e, t) {
	if (e) {
		if (typeof e == "string") return Df(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Df(e, t) : void 0;
	}
}
function Df(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Of(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function kf(e) {
	if (Array.isArray(e)) return e;
}
function Af() {
	var e = wf((0, P.useState)(() => Cf.isSsr || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches), 2), t = e[0], n = e[1];
	return (0, P.useEffect)(() => {
		if (window.matchMedia) {
			var e = window.matchMedia("(prefers-reduced-motion: reduce)"), t = () => {
				n(e.matches);
			};
			return e.addEventListener("change", t), () => {
				e.removeEventListener("change", t);
			};
		}
	}, []), t;
}
// ../../../peach/frontend/node_modules/recharts/es6/component/TooltipBoundingBox.js
function jf(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Mf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? jf(Object(n), !0).forEach(function(t) {
			Nf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jf(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Nf(e, t, n) {
	return (t = Pf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Pf(e) {
	var t = Ff(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Ff(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function If(e, t) {
	return Vf(e) || Bf(e, t) || Rf(e, t) || Lf();
}
function Lf() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Rf(e, t) {
	if (e) {
		if (typeof e == "string") return zf(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zf(e, t) : void 0;
	}
}
function zf(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Bf(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Vf(e) {
	if (Array.isArray(e)) return e;
}
function Hf(e) {
	if (!(e.prefersReducedMotion && e.isAnimationActive === "auto") && e.isAnimationActive && e.active) {
		var t = typeof e.animationEasing == "string" ? e.animationEasing : "ease";
		return `transform ${e.animationDuration}ms ${t}`;
	}
}
function Uf(e) {
	var t = Af(), n = If(P.useState(() => ({
		dismissed: !1,
		dismissedAtCoordinate: {
			x: 0,
			y: 0
		}
	})), 2), r = n[0], i = n[1];
	P.useEffect(() => {
		var t = (t) => {
			t.key === "Escape" && i({
				dismissed: !0,
				dismissedAtCoordinate: {
					x: e.coordinate?.x ?? 0,
					y: e.coordinate?.y ?? 0
				}
			});
		};
		return document.addEventListener("keydown", t), () => {
			document.removeEventListener("keydown", t);
		};
	}, [e.coordinate?.x, e.coordinate?.y]), r.dismissed && ((e.coordinate?.x ?? 0) !== r.dismissedAtCoordinate.x || (e.coordinate?.y ?? 0) !== r.dismissedAtCoordinate.y) && i(Mf(Mf({}, r), {}, { dismissed: !1 }));
	var a = Sf({
		allowEscapeViewBox: e.allowEscapeViewBox,
		coordinate: e.coordinate,
		offsetLeft: typeof e.offset == "number" ? e.offset : e.offset.x,
		offsetTop: typeof e.offset == "number" ? e.offset : e.offset.y,
		position: e.position,
		reverseDirection: e.reverseDirection,
		tooltipBox: e.lastBoundingBox,
		useTranslate3d: e.useTranslate3d,
		viewBox: e.viewBox
	}), o = a.cssClasses, s = a.cssProperties, c = Mf(Mf({}, e.hasPortalFromProps ? {} : Mf(Mf({ transition: Hf({
		prefersReducedMotion: t,
		isAnimationActive: e.isAnimationActive,
		active: e.active,
		animationDuration: e.animationDuration,
		animationEasing: e.animationEasing
	}) }, s), {}, {
		pointerEvents: "none",
		position: "absolute",
		top: 0,
		left: 0
	})), {}, { visibility: !r.dismissed && e.active && e.hasPayload ? "visible" : "hidden" }, e.wrapperStyle);
	return /*#__PURE__*/ P.createElement("div", {
		xmlns: "http://www.w3.org/1999/xhtml",
		tabIndex: -1,
		className: o,
		style: c,
		ref: e.innerRef
	}, e.children);
}
var Wf = /*#__PURE__*/ P.memo(Uf), Gf = () => V((e) => e.rootProps.accessibilityLayer) ?? !0;
// ../../../peach/frontend/node_modules/recharts/es6/shape/Curve.js
function Kf() {
	return Kf = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Kf.apply(null, arguments);
}
function qf(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Jf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? qf(Object(n), !0).forEach(function(t) {
			Yf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qf(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Yf(e, t, n) {
	return (t = Xf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Xf(e) {
	var t = Zf(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Zf(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Qf = {
	curveBasisClosed: Qn,
	curveBasisOpen: er,
	curveBasis: Xn,
	curveBumpX: En,
	curveBumpY: Dn,
	curveLinearClosed: nr,
	curveLinear: bn,
	curveMonotoneX: ur,
	curveMonotoneY: dr,
	curveNatural: mr,
	curveStep: gr,
	curveStepAfter: vr,
	curveStepBefore: _r
}, $f = (e) => G(e.x) && G(e.y), ep = (e) => e.base != null && $f(e.base) && $f(e), tp = (e) => e.x, np = (e) => e.y, rp = (e, t) => {
	if (typeof e == "function") return e;
	var n = `curve${Wt(e)}`;
	if ((n === "curveMonotone" || n === "curveBump") && t) {
		var r = Qf[`${n}${t === "vertical" ? "Y" : "X"}`];
		if (r) return r;
	}
	return Qf[n] || bn;
}, ip = {
	connectNulls: !1,
	type: "linear"
}, ap = (e) => {
	var t = e.type, n = t === void 0 ? ip.type : t, r = e.points, i = r === void 0 ? [] : r, a = e.baseLine, o = e.layout, s = e.connectNulls, c = s === void 0 ? ip.connectNulls : s, l = rp(n, o), u = c ? i.filter($f) : i;
	if (Array.isArray(a)) {
		var d, f = i.map((e, t) => Jf(Jf({}, e), {}, { base: a[t] }));
		return d = o === "vertical" ? wn().y(np).x1(tp).x0((e) => e.base.x) : wn().x(tp).y1(np).y0((e) => e.base.y), d.defined(ep).curve(l)(c ? f.filter(ep) : f);
	}
	return (o === "vertical" && I(a) ? wn().y(np).x1(tp).x0(a) : I(a) ? wn().x(tp).y1(np).y0(a) : Cn().x(tp).y(np)).defined($f).curve(l)(u);
}, op = (e) => {
	var t = e.className, n = e.points, r = e.path, i = e.pathRef, a = Gu();
	if ((!n || !n.length) && !r) return null;
	var o = {
		type: e.type,
		points: e.points,
		baseLine: e.baseLine,
		layout: e.layout || a,
		connectNulls: e.connectNulls
	}, s = n && n.length ? ap(o) : r;
	return /*#__PURE__*/ P.createElement("path", Kf({}, lt(e), Ur(e), {
		className: N("recharts-curve", t),
		d: s === null ? void 0 : s,
		ref: i
	}));
}, sp = [
	"x",
	"y",
	"top",
	"left",
	"width",
	"height",
	"className"
];
function cp() {
	return cp = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, cp.apply(null, arguments);
}
function lp(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function up(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? lp(Object(n), !0).forEach(function(t) {
			dp(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : lp(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function dp(e, t, n) {
	return (t = fp(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function fp(e) {
	var t = pp(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function pp(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function mp(e, t) {
	if (e == null) return {};
	var n, r, i = hp(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function hp(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var gp = (e, t, n, r, i, a) => `M${e},${i}v${r}M${a},${t}h${n}`, _p = (e) => {
	var t = e.x, n = t === void 0 ? 0 : t, r = e.y, i = r === void 0 ? 0 : r, a = e.top, o = a === void 0 ? 0 : a, s = e.left, c = s === void 0 ? 0 : s, l = e.width, u = l === void 0 ? 0 : l, d = e.height, f = d === void 0 ? 0 : d, p = e.className, m = mp(e, sp), h = up({
		x: n,
		y: i,
		top: o,
		left: c,
		width: u,
		height: f
	}, m);
	return !I(n) || !I(i) || !I(u) || !I(f) || !I(o) || !I(c) ? null : /*#__PURE__*/ P.createElement("path", cp({}, dt(h), {
		className: N("recharts-cross", p),
		d: gp(n, i, u, f, o, c)
	}));
};
// ../../../peach/frontend/node_modules/recharts/es6/util/cursor/getCursorRectangle.js
function vp(e, t, n, r) {
	var i = r / 2;
	return {
		stroke: "none",
		fill: "#ccc",
		x: e === "horizontal" ? t.x - i : n.left + .5,
		y: e === "horizontal" ? n.top + .5 : t.y - i,
		width: e === "horizontal" ? r : n.width - 1,
		height: e === "horizontal" ? n.height - 1 : r
	};
}
var yp = (e, t) => [
	0,
	3 * e,
	3 * t - 6 * e,
	3 * e - 3 * t + 1
], bp = (e, t) => e.map((e, n) => e * t ** n).reduce((e, t) => e + t), xp = (e, t) => (n) => bp(yp(e, t), n), Sp = (e, t) => (n) => bp([...yp(e, t).map((e, t) => e * t).slice(1), 0], n), Cp = (e) => {
	var t, n = e.split("(");
	if (n.length !== 2 || n[0] !== "cubic-bezier") return null;
	var r = (t = n[1]) == null || (t = t.split(")")[0]) == null ? void 0 : t.split(",");
	if (r == null || r.length !== 4) return null;
	var i = r.map((e) => parseFloat(e));
	return [
		i[0],
		i[1],
		i[2],
		i[3]
	];
}, wp = function() {
	var e = [...arguments];
	if (e.length === 1) switch (e[0]) {
		case "linear": return [
			0,
			0,
			1,
			1
		];
		case "ease": return [
			.25,
			.1,
			.25,
			1
		];
		case "ease-in": return [
			.42,
			0,
			1,
			1
		];
		case "ease-out": return [
			.42,
			0,
			.58,
			1
		];
		case "ease-in-out": return [
			0,
			0,
			.58,
			1
		];
		default:
			var t = Cp(e[0]);
			if (t) return t;
	}
	return e.length === 4 ? e : [
		0,
		0,
		1,
		1
	];
}, Tp = (e, t, n, r) => {
	var i = xp(e, n), a = xp(t, r), o = Sp(e, n), s = (e) => e > 1 ? 1 : e < 0 ? 0 : e, c = (e) => {
		for (var t = e > 1 ? 1 : e, n = t, r = 0; r < 8; ++r) {
			var c = i(n) - t, l = o(n);
			if (Math.abs(c - t) < 1e-4 || l < 1e-4) return a(n);
			n = s(n - c / l);
		}
		return a(n);
	};
	return c.isStepper = !1, c;
}, Ep = function() {
	return Tp(...wp(...arguments));
}, Dp = function() {
	for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, t = e.stiff, n = t === void 0 ? 100 : t, r = e.damping, i = r === void 0 ? 8 : r, a = e.dt, o = a === void 0 ? 16.67 : a, s = 1, c = [0], l = 0, u = 0, d = 1e4, f = 0; f < d;) {
		var p = -(l - s) * n, m = u * i;
		if (u += (p - m) * o / 1e3, l += u * o / 1e3, c.push(l), Math.abs(l - s) < 1e-4 && Math.abs(u) < 1e-4) break;
		f++;
	}
	c[c.length - 1] = s;
	var h = c.length - 1;
	return (e) => {
		if (e <= 0) return 0;
		if (e >= 1) return s;
		var t = e * h, n = Math.floor(t), r = t - n;
		return (c[n] ?? 0) + ((c[n + 1] ?? 0) - (c[n] ?? 0)) * r;
	};
}, Op = (e) => {
	if (typeof e == "string") switch (e) {
		case "ease":
		case "ease-in-out":
		case "ease-out":
		case "ease-in":
		case "linear": return Ep(e);
		case "spring": return Dp();
		default: if (e.split("(")[0] === "cubic-bezier") return Ep(e);
	}
	return typeof e == "function" ? e : null;
}, kp = /*#__PURE__*/ (0, P.createContext)((e, t, n) => {
	var r, i = (a) => {
		var o = t.tick(a);
		if (t.getState() === "active") {
			if (n(t.getInterpolated()), t.getProgress() === 1) {
				t.complete(), r = void 0;
				return;
			}
			r = e.setTimeout(i, o);
		} else r = e.setTimeout(i, o);
	};
	return r = e.setTimeout(i, 0), () => r?.();
});
kp.Provider;
function Ap(e) {
	var t = (0, P.useContext)(kp);
	return (0, P.useMemo)(() => e ?? t, [e, t]);
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/AnimationHandle.js
function jp(e, t, n) {
	return (t = Mp(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Mp(e) {
	var t = Np(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Np(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Pp = "init", Fp = "pending", Ip = "active", Lp = "completed";
function Rp(e) {
	return Math.max(0, e);
}
var zp = class {
	getAnimationStartedTime() {
		return this.animationStartedTime;
	}
	getBeginStartedTime() {
		return this.beginStartedTime;
	}
	constructor(e) {
		var t;
		jp(this, "state", Pp), this.animationId = e.animationId, this.onAnimationEnd = e.onAnimationEnd, this.animationDuration = Rp(e.animationDuration), this.animationBegin = Rp(e.animationBegin), this.progress = 0, this.from = e.from, this.to = e.to, this.easing = e.easing, (t = e.onAnimationStart) == null || t.call(e);
	}
	getState() {
		return this.state;
	}
	getEasing() {
		return this.easing;
	}
	getAnimationDuration() {
		return this.animationDuration;
	}
	tick(e) {
		if (this.getState() === Pp) return this.state = Fp, this.beginStartedTime = e, this.animationBegin;
		if (this.getState() === Fp) {
			if (this.beginStartedTime == null) throw Error();
			var t = e - this.beginStartedTime;
			return t >= this.animationBegin ? (this.state = Ip, this.animationStartedTime = e, this.nextAnimationUpdate(0)) : Rp(this.animationBegin - t);
		}
		if (this.getState() === Ip) {
			if (this.animationStartedTime == null) throw Error();
			var n = e - this.animationStartedTime;
			return this.setProgress(n / this.animationDuration), this.nextAnimationUpdate(n);
		}
		return 0;
	}
	setProgress(e) {
		this.progress = Math.min(1, Math.max(0, e));
	}
	getProgress() {
		return this.progress;
	}
	complete() {
		if (this.progress = 1, this.state === "active") {
			var e;
			(e = this.onAnimationEnd) == null || e.call(this);
		}
		this.state = Lp;
	}
	getFrom() {
		return this.from;
	}
	getTo() {
		return this.to;
	}
	getAnimationId() {
		return this.animationId;
	}
	getAnimationBegin() {
		return this.animationBegin;
	}
}, Bp = class extends zp {
	nextAnimationUpdate() {
		return 0;
	}
	getInterpolated() {
		return this.easing(L(this.getFrom(), this.getTo(), this.getProgress()));
	}
}, Vp = class {
	setTimeout(e) {
		var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, n = performance.now(), r = null, i = (a) => {
			a - n >= t ? e(a) : r = requestAnimationFrame(i);
		};
		return r = requestAnimationFrame(i), () => {
			r != null && cancelAnimationFrame(r);
		};
	}
};
// ../../../peach/frontend/node_modules/recharts/es6/animation/JavascriptAnimate.js
function Hp(e, t) {
	return qp(e) || Kp(e, t) || Wp(e, t) || Up();
}
function Up() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Wp(e, t) {
	if (e) {
		if (typeof e == "string") return Gp(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gp(e, t) : void 0;
	}
}
function Gp(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Kp(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function qp(e) {
	if (Array.isArray(e)) return e;
}
var Jp = {
	begin: 0,
	duration: 1e3,
	easing: "ease",
	isActive: !0,
	canBegin: !0,
	onAnimationEnd: () => {},
	onAnimationStart: () => {}
}, Yp = 0, Xp = 1;
function Zp(e) {
	var t = Zr(e, Jp), n = t.animationId, r = t.isActive, i = t.canBegin, a = t.duration, o = t.easing, s = t.begin, c = t.onAnimationEnd, l = t.onAnimationStart, u = t.children, d = Af(), f = r === "auto" ? !Cf.isSsr && !d : r, p = Ap(t.animationController), m = Hp((0, P.useState)(f ? Yp : Xp), 2), h = m[0], g = m[1];
	return (0, P.useEffect)(() => {
		f || g(Xp);
	}, [f]), (0, P.useEffect)(() => {
		var e = Op(o);
		return !f || !i || e == null ? Kt : p(new Vp(), new Bp({
			animationId: n,
			easing: e,
			animationDuration: a,
			animationBegin: s,
			onAnimationStart: l,
			onAnimationEnd: c,
			from: Yp,
			to: Xp
		}), g);
	}, [
		p,
		n,
		f,
		i,
		a,
		o,
		s,
		l,
		c
	]), u(Number(h));
}
// ../../../peach/frontend/node_modules/recharts/es6/util/useAnimationId.js
function Qp(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "animation-", n = (0, P.useRef)(Bt(t)), r = (0, P.useRef)(e);
	return r.current !== e && (n.current = Bt(t), r.current = e), n.current;
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/util.js
var $p = (e) => e.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`), em = (e, t, n) => e.map((e) => `${$p(e)} ${t}ms ${n}`).join(","), tm = ["radius"], nm = ["radius"], rm, im, am, om, sm, cm, lm, um, dm, fm;
function pm(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function mm(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? pm(Object(n), !0).forEach(function(t) {
			hm(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pm(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function hm(e, t, n) {
	return (t = gm(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function gm(e) {
	var t = _m(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function _m(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function vm() {
	return vm = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, vm.apply(null, arguments);
}
function ym(e, t) {
	if (e == null) return {};
	var n, r, i = bm(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function bm(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function xm(e, t) {
	return Em(e) || Tm(e, t) || Cm(e, t) || Sm();
}
function Sm() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Cm(e, t) {
	if (e) {
		if (typeof e == "string") return wm(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wm(e, t) : void 0;
	}
}
function wm(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Tm(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Em(e) {
	if (Array.isArray(e)) return e;
}
function Dm(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Om = (e, t, n, r, i) => {
	var a = Nt(n), o = Nt(r), s = Math.min(Math.abs(a) / 2, Math.abs(o) / 2), c = o >= 0 ? 1 : -1, l = a >= 0 ? 1 : -1, u = +(o >= 0 && a >= 0 || o < 0 && a < 0), d;
	if (s > 0 && Array.isArray(i)) {
		for (var f = [
			0,
			0,
			0,
			0
		], p = 0, m = 4; p < m; p++) {
			var h = i[p] ?? 0;
			f[p] = h > s ? s : h;
		}
		d = Pt(rm ||= Dm([
			"M",
			",",
			""
		]), e, t + c * f[0]), f[0] > 0 && (d += Pt(im ||= Dm([
			"A ",
			",",
			",0,0,",
			",",
			",",
			""
		]), f[0], f[0], u, e + l * f[0], t)), d += Pt(am ||= Dm([
			"L ",
			",",
			""
		]), e + n - l * f[1], t), f[1] > 0 && (d += Pt(om ||= Dm([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[1], f[1], u, e + n, t + c * f[1])), d += Pt(sm ||= Dm([
			"L ",
			",",
			""
		]), e + n, t + r - c * f[2]), f[2] > 0 && (d += Pt(cm ||= Dm([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[2], f[2], u, e + n - l * f[2], t + r)), d += Pt(lm ||= Dm([
			"L ",
			",",
			""
		]), e + l * f[3], t + r), f[3] > 0 && (d += Pt(um ||= Dm([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[3], f[3], u, e, t + r - c * f[3])), d += "Z";
	} else if (s > 0 && i === +i && i > 0) {
		var g = Math.min(s, i);
		d = Pt(dm ||= Dm(/* @__PURE__ */ "M .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,. Z".split(".")), e, t + c * g, g, g, u, e + l * g, t, e + n - l * g, t, g, g, u, e + n, t + c * g, e + n, t + r - c * g, g, g, u, e + n - l * g, t + r, e + l * g, t + r, g, g, u, e, t + r - c * g);
	} else d = Pt(fm ||= Dm([
		"M ",
		",",
		" h ",
		" v ",
		" h ",
		" Z"
	]), e, t, n, r, -n);
	return d;
}, km = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	radius: 0,
	isAnimationActive: !1,
	isUpdateAnimationActive: !1,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease"
}, Am = (e) => {
	var t = Zr(e, km), n = (0, P.useRef)(null), r = xm((0, P.useState)(-1), 2), i = r[0], a = r[1];
	(0, P.useEffect)(() => {
		if (n.current && n.current.getTotalLength) try {
			var e = n.current.getTotalLength();
			e && a(e);
		} catch {}
	}, []);
	var o = t.x, s = t.y, c = t.width, l = t.height, u = t.radius, d = t.className, f = t.animationEasing, p = t.animationDuration, m = t.animationBegin, h = t.isAnimationActive, g = t.isUpdateAnimationActive, _ = (0, P.useRef)(c), v = (0, P.useRef)(l), y = (0, P.useRef)(o), b = (0, P.useRef)(s), x = Qp((0, P.useMemo)(() => ({
		x: o,
		y: s,
		width: c,
		height: l,
		radius: u
	}), [
		o,
		s,
		c,
		l,
		u
	]), "rectangle-");
	if (o !== +o || s !== +s || c !== +c || l !== +l || c === 0 || l === 0) return null;
	var S = N("recharts-rectangle", d);
	if (!g) {
		var C = dt(t);
		C.radius;
		var w = ym(C, tm);
		return /*#__PURE__*/ P.createElement("path", vm({}, w, {
			x: Nt(o),
			y: Nt(s),
			width: Nt(c),
			height: Nt(l),
			radius: typeof u == "number" ? u : void 0,
			className: S,
			d: Om(o, s, c, l, u)
		}));
	}
	var T = _.current, E = v.current, D = y.current, O = b.current, k = `0px ${i === -1 ? 1 : i}px`, A = `${i}px ${i}px`, j = em(["strokeDasharray"], p, typeof f == "string" ? f : km.animationEasing);
	return /*#__PURE__*/ P.createElement(Zp, {
		animationId: x,
		key: x,
		canBegin: i > 0,
		duration: p,
		easing: f,
		isActive: g,
		begin: m
	}, (e) => {
		var r = L(T, c, e), i = L(E, l, e), a = L(D, o, e), d = L(O, s, e);
		n.current && (_.current = r, v.current = i, y.current = a, b.current = d);
		var f = h ? e > 0 ? {
			transition: j,
			strokeDasharray: A
		} : { strokeDasharray: k } : { strokeDasharray: A }, p = dt(t);
		p.radius;
		var m = ym(p, nm);
		return /*#__PURE__*/ P.createElement("path", vm({}, m, {
			radius: typeof u == "number" ? u : void 0,
			className: S,
			d: Om(a, d, r, i, u),
			ref: n,
			style: mm(mm({}, f), t.style)
		}));
	});
};
// ../../../peach/frontend/node_modules/recharts/es6/util/PolarUtils.js
function jm(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Mm(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? jm(Object(n), !0).forEach(function(t) {
			Nm(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jm(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Nm(e, t, n) {
	return (t = Pm(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Pm(e) {
	var t = Fm(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Fm(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Im = Math.PI / 180, Lm = (e) => e * Math.PI / 180, Rm = (e) => e * 180 / Math.PI, zm = (e, t, n, r) => ({
	x: e + Math.cos(-Im * r) * n,
	y: t + Math.sin(-Im * r) * n
}), Bm = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		width: 0,
		height: 0,
		brushBottom: 0
	};
	return Math.min(Math.abs(e - (n.left || 0) - (n.right || 0)), Math.abs(t - (n.top || 0) - (n.bottom || 0))) / 2;
}, Vm = (e, t) => {
	var n = e.x, r = e.y, i = t.x, a = t.y;
	return Math.sqrt((n - i) ** 2 + (r - a) ** 2);
}, Hm = (e, t) => {
	var n = e.x, r = e.y, i = t.cx, a = t.cy, o = Vm({
		x: n,
		y: r
	}, {
		x: i,
		y: a
	});
	if (o <= 0) return {
		radius: o,
		angle: 0
	};
	var s = (n - i) / o, c = Math.acos(s);
	return r > a && (c = 2 * Math.PI - c), {
		radius: o,
		angle: Rm(c),
		angleInRadian: c
	};
}, Um = (e) => {
	var t = e.startAngle, n = e.endAngle, r = Math.floor(t / 360), i = Math.floor(n / 360), a = Math.min(r, i);
	return {
		startAngle: t - a * 360,
		endAngle: n - a * 360
	};
}, Wm = (e, t) => {
	var n = t.startAngle, r = t.endAngle, i = Math.floor(n / 360), a = Math.floor(r / 360);
	return e + Math.min(i, a) * 360;
}, Gm = (e, t) => {
	var n = e.relativeX, r = e.relativeY, i = Hm({
		x: n,
		y: r
	}, t), a = i.radius, o = i.angle, s = t.innerRadius, c = t.outerRadius;
	if (a < s || a > c || a === 0) return null;
	var l = Um(t), u = l.startAngle, d = l.endAngle, f = o, p;
	if (u <= d) {
		for (; f > d;) f -= 360;
		for (; f < u;) f += 360;
		p = f >= u && f <= d;
	} else {
		for (; f > u;) f -= 360;
		for (; f < d;) f += 360;
		p = f >= d && f <= u;
	}
	return p ? Mm(Mm({}, t), {}, {
		radius: a,
		angle: Wm(f, t)
	}) : null;
};
// ../../../peach/frontend/node_modules/recharts/es6/util/cursor/getRadialCursorPoints.js
function Km(e) {
	var t = e.cx, n = e.cy, r = e.radius, i = e.startAngle, a = e.endAngle;
	return {
		points: [zm(t, n, r, i), zm(t, n, r, a)],
		cx: t,
		cy: n,
		radius: r,
		startAngle: i,
		endAngle: a
	};
}
// ../../../peach/frontend/node_modules/recharts/es6/shape/Sector.js
var qm, Jm, Ym, Xm, Zm, Qm, $m;
function eh() {
	return eh = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, eh.apply(null, arguments);
}
function th(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var nh = (e, t) => Ft(t - e) * Math.min(Math.abs(t - e), 359.999), rh = (e) => {
	var t = e.cx, n = e.cy, r = e.radius, i = e.angle, a = e.sign, o = e.isExternal, s = e.cornerRadius, c = e.cornerIsExternal, l = s * (o ? 1 : -1) + r, u = Math.asin(s / l) / Im, d = c ? i : i + a * u, f = zm(t, n, l, d), p = zm(t, n, r, d), m = c ? i - a * u : i;
	return {
		center: f,
		circleTangency: p,
		lineTangency: zm(t, n, l * Math.cos(u * Im), m),
		theta: u
	};
}, ih = (e) => {
	var t = e.cx, n = e.cy, r = e.innerRadius, i = e.outerRadius, a = e.startAngle, o = e.endAngle, s = nh(a, o), c = a + s, l = zm(t, n, i, a), u = zm(t, n, i, c), d = Pt(qm ||= th([
		"M ",
		",",
		"\n    A ",
		",",
		",0,\n    ",
		",",
		",\n    ",
		",",
		"\n  "
	]), l.x, l.y, i, i, +(Math.abs(s) > 180), +(a > c), u.x, u.y);
	if (r > 0) {
		var f = zm(t, n, r, a), p = zm(t, n, r, c);
		d += Pt(Jm ||= th([
			"L ",
			",",
			"\n            A ",
			",",
			",0,\n            ",
			",",
			",\n            ",
			",",
			" Z"
		]), p.x, p.y, r, r, +(Math.abs(s) > 180), +(a <= c), f.x, f.y);
	} else d += Pt(Ym ||= th([
		"L ",
		",",
		" Z"
	]), t, n);
	return d;
}, ah = (e) => {
	var t = e.cx, n = e.cy, r = e.innerRadius, i = e.outerRadius, a = e.cornerRadius, o = e.forceCornerRadius, s = e.cornerIsExternal, c = e.startAngle, l = e.endAngle, u = Ft(l - c), d = rh({
		cx: t,
		cy: n,
		radius: i,
		angle: c,
		sign: u,
		cornerRadius: a,
		cornerIsExternal: s
	}), f = d.circleTangency, p = d.lineTangency, m = d.theta, h = rh({
		cx: t,
		cy: n,
		radius: i,
		angle: l,
		sign: -u,
		cornerRadius: a,
		cornerIsExternal: s
	}), g = h.circleTangency, _ = h.lineTangency, v = h.theta, y = s ? Math.abs(c - l) : Math.abs(c - l) - m - v;
	if (y < 0) return o ? Pt(Xm ||= th([
		"M ",
		",",
		"\n        a",
		",",
		",0,0,1,",
		",0\n        a",
		",",
		",0,0,1,",
		",0\n      "
	]), p.x, p.y, a, a, a * 2, a, a, -a * 2) : ih({
		cx: t,
		cy: n,
		innerRadius: r,
		outerRadius: i,
		startAngle: c,
		endAngle: l
	});
	var b = Pt(Zm ||= th([
		"M ",
		",",
		"\n    A",
		",",
		",0,0,",
		",",
		",",
		"\n    A",
		",",
		",0,",
		",",
		",",
		",",
		"\n    A",
		",",
		",0,0,",
		",",
		",",
		"\n  "
	]), p.x, p.y, a, a, +(u < 0), f.x, f.y, i, i, +(y > 180), +(u < 0), g.x, g.y, a, a, +(u < 0), _.x, _.y);
	if (r > 0) {
		var x = rh({
			cx: t,
			cy: n,
			radius: r,
			angle: c,
			sign: u,
			isExternal: !0,
			cornerRadius: a,
			cornerIsExternal: s
		}), S = x.circleTangency, C = x.lineTangency, w = x.theta, T = rh({
			cx: t,
			cy: n,
			radius: r,
			angle: l,
			sign: -u,
			isExternal: !0,
			cornerRadius: a,
			cornerIsExternal: s
		}), E = T.circleTangency, D = T.lineTangency, O = T.theta, k = s ? Math.abs(c - l) : Math.abs(c - l) - w - O;
		if (k < 0 && a === 0) return `${b}L${t},${n}Z`;
		b += Pt(Qm ||= th([
			"L",
			",",
			"\n      A",
			",",
			",0,0,",
			",",
			",",
			"\n      A",
			",",
			",0,",
			",",
			",",
			",",
			"\n      A",
			",",
			",0,0,",
			",",
			",",
			"Z"
		]), D.x, D.y, a, a, +(u < 0), E.x, E.y, r, r, +(k > 180), +(u > 0), S.x, S.y, a, a, +(u < 0), C.x, C.y);
	} else b += Pt($m ||= th([
		"L",
		",",
		"Z"
	]), t, n);
	return b;
}, oh = {
	cx: 0,
	cy: 0,
	innerRadius: 0,
	outerRadius: 0,
	startAngle: 0,
	endAngle: 0,
	cornerRadius: 0,
	forceCornerRadius: !1,
	cornerIsExternal: !1
}, sh = (e) => {
	var t = Zr(e, oh), n = t.cx, r = t.cy, i = t.innerRadius, a = t.outerRadius, o = t.cornerRadius, s = t.forceCornerRadius, c = t.cornerIsExternal, l = t.startAngle, u = t.endAngle, d = t.className;
	if (a < i || l === u) return null;
	var f = N("recharts-sector", d), p = a - i, m = Vt(o, p, 0, !0), h = m > 0 && Math.abs(l - u) < 360 ? ah({
		cx: n,
		cy: r,
		innerRadius: i,
		outerRadius: a,
		cornerRadius: Math.min(m, p / 2),
		forceCornerRadius: s,
		cornerIsExternal: c,
		startAngle: l,
		endAngle: u
	}) : ih({
		cx: n,
		cy: r,
		innerRadius: i,
		outerRadius: a,
		startAngle: l,
		endAngle: u
	});
	return /*#__PURE__*/ P.createElement("path", eh({}, dt(t), {
		className: f,
		d: h
	}));
};
// ../../../peach/frontend/node_modules/recharts/es6/util/cursor/getCursorPoints.js
function ch(e, t, n) {
	if (e === "horizontal") return [{
		x: t.x,
		y: n.top
	}, {
		x: t.x,
		y: n.top + n.height
	}];
	if (e === "vertical") return [{
		x: n.left,
		y: t.y
	}, {
		x: n.left + n.width,
		y: t.y
	}];
	if (Hr(t)) {
		if (e === "centric") {
			var r = t.cx, i = t.cy, a = t.innerRadius, o = t.outerRadius, s = t.angle, c = zm(r, i, a, s), l = zm(r, i, o, s);
			return [{
				x: c.x,
				y: c.y
			}, {
				x: l.x,
				y: l.y
			}];
		}
		return Km(t);
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/toNumber.mjs
function lh(e) {
	return Et(e) ? NaN : Number(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/toFinite.mjs
function uh(e) {
	return e ? (e = lh(e), e === Infinity || e === -Infinity ? (e < 0 ? -1 : 1) * Number.MAX_VALUE : e === e ? e : 0) : e === 0 ? e : 0;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/math/range.mjs
function dh(e, t, n) {
	n && typeof n != "number" && Ba(e, t, n) && (t = n = void 0), e = uh(e), t === void 0 ? (t = e, e = 0) : t = uh(t), n = n === void 0 ? e < t ? 1 : -1 : uh(n);
	let r = Math.max(Math.ceil((t - e) / (n || 1)), 0), i = Array(r);
	for (let t = 0; t < r; t++) i[t] = e, e += n;
	return i;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/dataSelectors.js
var fh = (e) => e.chartData, ph = H([fh], (e) => {
	var t = e.chartData == null ? 0 : e.chartData.length - 1;
	return {
		chartData: e.chartData,
		computedData: e.computedData,
		dataEndIndex: t,
		dataStartIndex: 0
	};
}), mh = (e, t, n, r) => r ? ph(e) : fh(e), hh = (e, t, n) => n ? ph(e) : fh(e), gh = H([mh], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
}), _h = H([ph], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
}), vh = H([fh], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
});
// ../../../peach/frontend/node_modules/recharts/es6/util/isDomainSpecifiedByUser.js
function yh(e, t) {
	return wh(e) || Ch(e, t) || xh(e, t) || bh();
}
function bh() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function xh(e, t) {
	if (e) {
		if (typeof e == "string") return Sh(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Sh(e, t) : void 0;
	}
}
function Sh(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Ch(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function wh(e) {
	if (Array.isArray(e)) return e;
}
function Th(e) {
	if (Array.isArray(e) && e.length === 2) {
		var t = yh(e, 2), n = t[0], r = t[1];
		if (G(n) && G(r)) return !0;
	}
	return !1;
}
function Eh(e, t, n) {
	return n ? e : [Math.min(e[0], t[0]), Math.max(e[1], t[1])];
}
function Dh(e, t) {
	if (t && typeof e != "function" && Array.isArray(e) && e.length === 2) {
		var n = yh(e, 2), r = n[0], i = n[1], a, o;
		if (G(r)) a = r;
		else if (typeof r == "function") return;
		if (G(i)) o = i;
		else if (typeof i == "function") return;
		var s = [a, o];
		if (Th(s)) return s;
	}
}
function Oh(e, t, n) {
	if (n || t != null) {
		if (typeof e == "function" && t != null) try {
			var r = e(t, n);
			if (Th(r)) return Eh(r, t, n);
		} catch {}
		if (Array.isArray(e) && e.length === 2) {
			var i = yh(e, 2), a = i[0], o = i[1], s, c;
			if (a === "auto") t != null && (s = Math.min(...t));
			else if (I(a)) s = a;
			else if (typeof a == "function") try {
				t != null && (s = a(t?.[0]));
			} catch {}
			else if (typeof a == "string" && kl.test(a)) {
				var l = kl.exec(a);
				if (l == null || l[1] == null || t == null) s = void 0;
				else {
					var u = +l[1];
					s = t[0] - u;
				}
			} else s = t?.[0];
			if (o === "auto") t != null && (c = Math.max(...t));
			else if (I(o)) c = o;
			else if (typeof o == "function") try {
				t != null && (c = o(t?.[1]));
			} catch {}
			else if (typeof o == "string" && Al.test(o)) {
				var d = Al.exec(o);
				if (d == null || d[1] == null || t == null) c = void 0;
				else {
					var f = +d[1];
					c = t[1] + f;
				}
			} else c = t?.[1];
			var p = [s, c];
			if (Th(p)) return t == null ? p : Eh(p, t, n);
		}
	}
}
// ../../../peach/frontend/node_modules/recharts/es6/util/scale/util/arithmetic.js
var J = /* @__PURE__ */ D((/* @__PURE__ */ T(((e, t, n) => {
	(function(e) {
		var n = 1e9, r = {
			precision: 20,
			rounding: 4,
			toExpNeg: -7,
			toExpPos: 21,
			LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"
		}, i = !0, a = "[DecimalError] ", o = a + "Invalid argument: ", s = a + "Exponent out of range: ", c = Math.floor, l = Math.pow, u = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, d, f = 1e7, p = 7, m = 9007199254740991, h = c(m / p), g = {};
		g.absoluteValue = g.abs = function() {
			var e = new this.constructor(this);
			return e.s &&= 1, e;
		}, g.comparedTo = g.cmp = function(e) {
			var t, n, r, i, a = this;
			if (e = new a.constructor(e), a.s !== e.s) return a.s || -e.s;
			if (a.e !== e.e) return a.e > e.e ^ a.s < 0 ? 1 : -1;
			for (r = a.d.length, i = e.d.length, t = 0, n = r < i ? r : i; t < n; ++t) if (a.d[t] !== e.d[t]) return a.d[t] > e.d[t] ^ a.s < 0 ? 1 : -1;
			return r === i ? 0 : r > i ^ a.s < 0 ? 1 : -1;
		}, g.decimalPlaces = g.dp = function() {
			var e = this, t = e.d.length - 1, n = (t - e.e) * p;
			if (t = e.d[t], t) for (; t % 10 == 0; t /= 10) n--;
			return n < 0 ? 0 : n;
		}, g.dividedBy = g.div = function(e) {
			return b(this, new this.constructor(e));
		}, g.dividedToIntegerBy = g.idiv = function(e) {
			var t = this, n = t.constructor;
			return D(b(t, new n(e), 0, 1), n.precision);
		}, g.equals = g.eq = function(e) {
			return !this.cmp(e);
		}, g.exponent = function() {
			return S(this);
		}, g.greaterThan = g.gt = function(e) {
			return this.cmp(e) > 0;
		}, g.greaterThanOrEqualTo = g.gte = function(e) {
			return this.cmp(e) >= 0;
		}, g.isInteger = g.isint = function() {
			return this.e > this.d.length - 2;
		}, g.isNegative = g.isneg = function() {
			return this.s < 0;
		}, g.isPositive = g.ispos = function() {
			return this.s > 0;
		}, g.isZero = function() {
			return this.s === 0;
		}, g.lessThan = g.lt = function(e) {
			return this.cmp(e) < 0;
		}, g.lessThanOrEqualTo = g.lte = function(e) {
			return this.cmp(e) < 1;
		}, g.logarithm = g.log = function(e) {
			var t, n = this, r = n.constructor, o = r.precision, s = o + 5;
			if (e === void 0) e = new r(10);
			else if (e = new r(e), e.s < 1 || e.eq(d)) throw Error(a + "NaN");
			if (n.s < 1) throw Error(a + (n.s ? "NaN" : "-Infinity"));
			return n.eq(d) ? new r(0) : (i = !1, t = b(T(n, s), T(e, s), s), i = !0, D(t, o));
		}, g.minus = g.sub = function(e) {
			var t = this;
			return e = new t.constructor(e), t.s == e.s ? O(t, e) : _(t, (e.s = -e.s, e));
		}, g.modulo = g.mod = function(e) {
			var t, n = this, r = n.constructor, o = r.precision;
			if (e = new r(e), !e.s) throw Error(a + "NaN");
			return n.s ? (i = !1, t = b(n, e, 0, 1).times(e), i = !0, n.minus(t)) : D(new r(n), o);
		}, g.naturalExponential = g.exp = function() {
			return x(this);
		}, g.naturalLogarithm = g.ln = function() {
			return T(this);
		}, g.negated = g.neg = function() {
			var e = new this.constructor(this);
			return e.s = -e.s || 0, e;
		}, g.plus = g.add = function(e) {
			var t = this;
			return e = new t.constructor(e), t.s == e.s ? _(t, e) : O(t, (e.s = -e.s, e));
		}, g.precision = g.sd = function(e) {
			var t, n, r, i = this;
			if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(o + e);
			if (t = S(i) + 1, r = i.d.length - 1, n = r * p + 1, r = i.d[r], r) {
				for (; r % 10 == 0; r /= 10) n--;
				for (r = i.d[0]; r >= 10; r /= 10) n++;
			}
			return e && t > n ? t : n;
		}, g.squareRoot = g.sqrt = function() {
			var e, t, n, r, o, s, l, u = this, d = u.constructor;
			if (u.s < 1) {
				if (!u.s) return new d(0);
				throw Error(a + "NaN");
			}
			for (e = S(u), i = !1, o = Math.sqrt(+u), o == 0 || o == 1 / 0 ? (t = y(u.d), (t.length + e) % 2 == 0 && (t += "0"), o = Math.sqrt(t), e = c((e + 1) / 2) - (e < 0 || e % 2), o == 1 / 0 ? t = "5e" + e : (t = o.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + e), r = new d(t)) : r = new d(o.toString()), n = d.precision, o = l = n + 3;;) if (s = r, r = s.plus(b(u, s, l + 2)).times(.5), y(s.d).slice(0, l) === (t = y(r.d)).slice(0, l)) {
				if (t = t.slice(l - 3, l + 1), o == l && t == "4999") {
					if (D(s, n + 1, 0), s.times(s).eq(u)) {
						r = s;
						break;
					}
				} else if (t != "9999") break;
				l += 4;
			}
			return i = !0, D(r, n);
		}, g.times = g.mul = function(e) {
			var t, n, r, a, o, s, c, l, u, d = this, p = d.constructor, m = d.d, h = (e = new p(e)).d;
			if (!d.s || !e.s) return new p(0);
			for (e.s *= d.s, n = d.e + e.e, l = m.length, u = h.length, l < u && (o = m, m = h, h = o, s = l, l = u, u = s), o = [], s = l + u, r = s; r--;) o.push(0);
			for (r = u; --r >= 0;) {
				for (t = 0, a = l + r; a > r;) c = o[a] + h[r] * m[a - r - 1] + t, o[a--] = c % f | 0, t = c / f | 0;
				o[a] = (o[a] + t) % f | 0;
			}
			for (; !o[--s];) o.pop();
			return t ? ++n : o.shift(), e.d = o, e.e = n, i ? D(e, p.precision) : e;
		}, g.toDecimalPlaces = g.todp = function(e, t) {
			var r = this, i = r.constructor;
			return r = new i(r), e === void 0 ? r : (v(e, 0, n), t === void 0 ? t = i.rounding : v(t, 0, 8), D(r, e + S(r) + 1, t));
		}, g.toExponential = function(e, t) {
			var r, i = this, a = i.constructor;
			return e === void 0 ? r = k(i, !0) : (v(e, 0, n), t === void 0 ? t = a.rounding : v(t, 0, 8), i = D(new a(i), e + 1, t), r = k(i, !0, e + 1)), r;
		}, g.toFixed = function(e, t) {
			var r, i, a = this, o = a.constructor;
			return e === void 0 ? k(a) : (v(e, 0, n), t === void 0 ? t = o.rounding : v(t, 0, 8), i = D(new o(a), e + S(a) + 1, t), r = k(i.abs(), !1, e + S(i) + 1), a.isneg() && !a.isZero() ? "-" + r : r);
		}, g.toInteger = g.toint = function() {
			var e = this, t = e.constructor;
			return D(new t(e), S(e) + 1, t.rounding);
		}, g.toNumber = function() {
			return +this;
		}, g.toPower = g.pow = function(e) {
			var t, n, r, o, s, l, u = this, f = u.constructor, h = 12, g = +(e = new f(e));
			if (!e.s) return new f(d);
			if (u = new f(u), !u.s) {
				if (e.s < 1) throw Error(a + "Infinity");
				return u;
			}
			if (u.eq(d)) return u;
			if (r = f.precision, e.eq(d)) return D(u, r);
			if (t = e.e, n = e.d.length - 1, l = t >= n, s = u.s, !l) {
				if (s < 0) throw Error(a + "NaN");
			} else if ((n = g < 0 ? -g : g) <= m) {
				for (o = new f(d), t = Math.ceil(r / p + 4), i = !1; n % 2 && (o = o.times(u), A(o.d, t)), n = c(n / 2), n !== 0;) u = u.times(u), A(u.d, t);
				return i = !0, e.s < 0 ? new f(d).div(o) : D(o, r);
			}
			return s = s < 0 && e.d[Math.max(t, n)] & 1 ? -1 : 1, u.s = 1, i = !1, o = e.times(T(u, r + h)), i = !0, o = x(o), o.s = s, o;
		}, g.toPrecision = function(e, t) {
			var r, i, a = this, o = a.constructor;
			return e === void 0 ? (r = S(a), i = k(a, r <= o.toExpNeg || r >= o.toExpPos)) : (v(e, 1, n), t === void 0 ? t = o.rounding : v(t, 0, 8), a = D(new o(a), e, t), r = S(a), i = k(a, e <= r || r <= o.toExpNeg, e)), i;
		}, g.toSignificantDigits = g.tosd = function(e, t) {
			var r = this, i = r.constructor;
			return e === void 0 ? (e = i.precision, t = i.rounding) : (v(e, 1, n), t === void 0 ? t = i.rounding : v(t, 0, 8)), D(new i(r), e, t);
		}, g.toString = g.valueOf = g.val = g.toJSON = function() {
			var e = this, t = S(e), n = e.constructor;
			return k(e, t <= n.toExpNeg || t >= n.toExpPos);
		};
		function _(e, t) {
			var n, r, a, o, s, c, l, u, d = e.constructor, m = d.precision;
			if (!e.s || !t.s) return t.s || (t = new d(e)), i ? D(t, m) : t;
			if (l = e.d, u = t.d, s = e.e, a = t.e, l = l.slice(), o = s - a, o) {
				for (o < 0 ? (r = l, o = -o, c = u.length) : (r = u, a = s, c = l.length), s = Math.ceil(m / p), c = s > c ? s + 1 : c + 1, o > c && (o = c, r.length = 1), r.reverse(); o--;) r.push(0);
				r.reverse();
			}
			for (c = l.length, o = u.length, c - o < 0 && (o = c, r = u, u = l, l = r), n = 0; o;) n = (l[--o] = l[o] + u[o] + n) / f | 0, l[o] %= f;
			for (n && (l.unshift(n), ++a), c = l.length; l[--c] == 0;) l.pop();
			return t.d = l, t.e = a, i ? D(t, m) : t;
		}
		function v(e, t, n) {
			if (e !== ~~e || e < t || e > n) throw Error(o + e);
		}
		function y(e) {
			var t, n, r, i = e.length - 1, a = "", o = e[0];
			if (i > 0) {
				for (a += o, t = 1; t < i; t++) r = e[t] + "", n = p - r.length, n && (a += w(n)), a += r;
				o = e[t], r = o + "", n = p - r.length, n && (a += w(n));
			} else if (o === 0) return "0";
			for (; o % 10 == 0;) o /= 10;
			return a + o;
		}
		var b = (function() {
			function e(e, t) {
				var n, r = 0, i = e.length;
				for (e = e.slice(); i--;) n = e[i] * t + r, e[i] = n % f | 0, r = n / f | 0;
				return r && e.unshift(r), e;
			}
			function t(e, t, n, r) {
				var i, a;
				if (n != r) a = n > r ? 1 : -1;
				else for (i = a = 0; i < n; i++) if (e[i] != t[i]) {
					a = e[i] > t[i] ? 1 : -1;
					break;
				}
				return a;
			}
			function n(e, t, n) {
				for (var r = 0; n--;) e[n] -= r, r = +(e[n] < t[n]), e[n] = r * f + e[n] - t[n];
				for (; !e[0] && e.length > 1;) e.shift();
			}
			return function(r, i, o, s) {
				var c, l, u, d, m, h, g, _, v, y, b, x, C, w, T, E, O, k, A = r.constructor, j = r.s == i.s ? 1 : -1, M = r.d, N = i.d;
				if (!r.s) return new A(r);
				if (!i.s) throw Error(a + "Division by zero");
				for (l = r.e - i.e, O = N.length, T = M.length, g = new A(j), _ = g.d = [], u = 0; N[u] == (M[u] || 0);) ++u;
				if (N[u] > (M[u] || 0) && --l, x = o == null ? o = A.precision : s ? o + (S(r) - S(i)) + 1 : o, x < 0) return new A(0);
				if (x = x / p + 2 | 0, u = 0, O == 1) for (d = 0, N = N[0], x++; (u < T || d) && x--; u++) C = d * f + (M[u] || 0), _[u] = C / N | 0, d = C % N | 0;
				else {
					for (d = f / (N[0] + 1) | 0, d > 1 && (N = e(N, d), M = e(M, d), O = N.length, T = M.length), w = O, v = M.slice(0, O), y = v.length; y < O;) v[y++] = 0;
					k = N.slice(), k.unshift(0), E = N[0], N[1] >= f / 2 && ++E;
					do
						d = 0, c = t(N, v, O, y), c < 0 ? (b = v[0], O != y && (b = b * f + (v[1] || 0)), d = b / E | 0, d > 1 ? (d >= f && (d = f - 1), m = e(N, d), h = m.length, y = v.length, c = t(m, v, h, y), c == 1 && (d--, n(m, O < h ? k : N, h))) : (d == 0 && (c = d = 1), m = N.slice()), h = m.length, h < y && m.unshift(0), n(v, m, y), c == -1 && (y = v.length, c = t(N, v, O, y), c < 1 && (d++, n(v, O < y ? k : N, y))), y = v.length) : c === 0 && (d++, v = [0]), _[u++] = d, c && v[0] ? v[y++] = M[w] || 0 : (v = [M[w]], y = 1);
					while ((w++ < T || v[0] !== void 0) && x--);
				}
				return _[0] || _.shift(), g.e = l, D(g, s ? o + S(g) + 1 : o);
			};
		})();
		function x(e, t) {
			var n, r, a, o, c, u, f = 0, p = 0, m = e.constructor, h = m.precision;
			if (S(e) > 16) throw Error(s + S(e));
			if (!e.s) return new m(d);
			for (t == null ? (i = !1, u = h) : u = t, c = new m(.03125); e.abs().gte(.1);) e = e.times(c), p += 5;
			for (r = Math.log(l(2, p)) / Math.LN10 * 2 + 5 | 0, u += r, n = a = o = new m(d), m.precision = u;;) {
				if (a = D(a.times(e), u), n = n.times(++f), c = o.plus(b(a, n, u)), y(c.d).slice(0, u) === y(o.d).slice(0, u)) {
					for (; p--;) o = D(o.times(o), u);
					return m.precision = h, t == null ? (i = !0, D(o, h)) : o;
				}
				o = c;
			}
		}
		function S(e) {
			for (var t = e.e * p, n = e.d[0]; n >= 10; n /= 10) t++;
			return t;
		}
		function C(e, t, n) {
			if (t > e.LN10.sd()) throw i = !0, n && (e.precision = n), Error(a + "LN10 precision limit exceeded");
			return D(new e(e.LN10), t);
		}
		function w(e) {
			for (var t = ""; e--;) t += "0";
			return t;
		}
		function T(e, t) {
			var n, r, o, s, c, l, u, f, p, m = 1, h = 10, g = e, _ = g.d, v = g.constructor, x = v.precision;
			if (g.s < 1) throw Error(a + (g.s ? "NaN" : "-Infinity"));
			if (g.eq(d)) return new v(0);
			if (t == null ? (i = !1, f = x) : f = t, g.eq(10)) return t ?? (i = !0), C(v, f);
			if (f += h, v.precision = f, n = y(_), r = n.charAt(0), s = S(g), Math.abs(s) < 0x5543df729c000) {
				for (; r < 7 && r != 1 || r == 1 && n.charAt(1) > 3;) g = g.times(e), n = y(g.d), r = n.charAt(0), m++;
				s = S(g), r > 1 ? (g = new v("0." + n), s++) : g = new v(r + "." + n.slice(1));
			} else return u = C(v, f + 2, x).times(s + ""), g = T(new v(r + "." + n.slice(1)), f - h).plus(u), v.precision = x, t == null ? (i = !0, D(g, x)) : g;
			for (l = c = g = b(g.minus(d), g.plus(d), f), p = D(g.times(g), f), o = 3;;) {
				if (c = D(c.times(p), f), u = l.plus(b(c, new v(o), f)), y(u.d).slice(0, f) === y(l.d).slice(0, f)) return l = l.times(2), s !== 0 && (l = l.plus(C(v, f + 2, x).times(s + ""))), l = b(l, new v(m), f), v.precision = x, t == null ? (i = !0, D(l, x)) : l;
				l = u, o += 2;
			}
		}
		function E(e, t) {
			var n, r, a;
			for ((n = t.indexOf(".")) > -1 && (t = t.replace(".", "")), (r = t.search(/e/i)) > 0 ? (n < 0 && (n = r), n += +t.slice(r + 1), t = t.substring(0, r)) : n < 0 && (n = t.length), r = 0; t.charCodeAt(r) === 48;) ++r;
			for (a = t.length; t.charCodeAt(a - 1) === 48;) --a;
			if (t = t.slice(r, a), t) {
				if (a -= r, n = n - r - 1, e.e = c(n / p), e.d = [], r = (n + 1) % p, n < 0 && (r += p), r < a) {
					for (r && e.d.push(+t.slice(0, r)), a -= p; r < a;) e.d.push(+t.slice(r, r += p));
					t = t.slice(r), r = p - t.length;
				} else r -= a;
				for (; r--;) t += "0";
				if (e.d.push(+t), i && (e.e > h || e.e < -h)) throw Error(s + n);
			} else e.s = 0, e.e = 0, e.d = [0];
			return e;
		}
		function D(e, t, n) {
			var r, a, o, u, d, m, g, _, v = e.d;
			for (u = 1, o = v[0]; o >= 10; o /= 10) u++;
			if (r = t - u, r < 0) r += p, a = t, g = v[_ = 0];
			else {
				if (_ = Math.ceil((r + 1) / p), o = v.length, _ >= o) return e;
				for (g = o = v[_], u = 1; o >= 10; o /= 10) u++;
				r %= p, a = r - p + u;
			}
			if (n !== void 0 && (o = l(10, u - a - 1), d = g / o % 10 | 0, m = t < 0 || v[_ + 1] !== void 0 || g % o, m = n < 4 ? (d || m) && (n == 0 || n == (e.s < 0 ? 3 : 2)) : d > 5 || d == 5 && (n == 4 || m || n == 6 && (r > 0 ? a > 0 ? g / l(10, u - a) : 0 : v[_ - 1]) % 10 & 1 || n == (e.s < 0 ? 8 : 7))), t < 1 || !v[0]) return m ? (o = S(e), v.length = 1, t = t - o - 1, v[0] = l(10, (p - t % p) % p), e.e = c(-t / p) || 0) : (v.length = 1, v[0] = e.e = e.s = 0), e;
			if (r == 0 ? (v.length = _, o = 1, _--) : (v.length = _ + 1, o = l(10, p - r), v[_] = a > 0 ? (g / l(10, u - a) % l(10, a) | 0) * o : 0), m) for (;;) if (_ == 0) {
				(v[0] += o) == f && (v[0] = 1, ++e.e);
				break;
			} else {
				if (v[_] += o, v[_] != f) break;
				v[_--] = 0, o = 1;
			}
			for (r = v.length; v[--r] === 0;) v.pop();
			if (i && (e.e > h || e.e < -h)) throw Error(s + S(e));
			return e;
		}
		function O(e, t) {
			var n, r, a, o, s, c, l, u, d, m, h = e.constructor, g = h.precision;
			if (!e.s || !t.s) return t.s ? t.s = -t.s : t = new h(e), i ? D(t, g) : t;
			if (l = e.d, m = t.d, r = t.e, u = e.e, l = l.slice(), s = u - r, s) {
				for (d = s < 0, d ? (n = l, s = -s, c = m.length) : (n = m, r = u, c = l.length), a = Math.max(Math.ceil(g / p), c) + 2, s > a && (s = a, n.length = 1), n.reverse(), a = s; a--;) n.push(0);
				n.reverse();
			} else {
				for (a = l.length, c = m.length, d = a < c, d && (c = a), a = 0; a < c; a++) if (l[a] != m[a]) {
					d = l[a] < m[a];
					break;
				}
				s = 0;
			}
			for (d && (n = l, l = m, m = n, t.s = -t.s), c = l.length, a = m.length - c; a > 0; --a) l[c++] = 0;
			for (a = m.length; a > s;) {
				if (l[--a] < m[a]) {
					for (o = a; o && l[--o] === 0;) l[o] = f - 1;
					--l[o], l[a] += f;
				}
				l[a] -= m[a];
			}
			for (; l[--c] === 0;) l.pop();
			for (; l[0] === 0; l.shift()) --r;
			return l[0] ? (t.d = l, t.e = r, i ? D(t, g) : t) : new h(0);
		}
		function k(e, t, n) {
			var r, i = S(e), a = y(e.d), o = a.length;
			return t ? (n && (r = n - o) > 0 ? a = a.charAt(0) + "." + a.slice(1) + w(r) : o > 1 && (a = a.charAt(0) + "." + a.slice(1)), a = a + (i < 0 ? "e" : "e+") + i) : i < 0 ? (a = "0." + w(-i - 1) + a, n && (r = n - o) > 0 && (a += w(r))) : i >= o ? (a += w(i + 1 - o), n && (r = n - i - 1) > 0 && (a = a + "." + w(r))) : ((r = i + 1) < o && (a = a.slice(0, r) + "." + a.slice(r)), n && (r = n - o) > 0 && (i + 1 === o && (a += "."), a += w(r))), e.s < 0 ? "-" + a : a;
		}
		function A(e, t) {
			if (e.length > t) return e.length = t, !0;
		}
		function j(e) {
			var t, n, r;
			function i(e) {
				var t = this;
				if (!(t instanceof i)) return new i(e);
				if (t.constructor = i, e instanceof i) t.s = e.s, t.e = e.e, t.d = (e = e.d) ? e.slice() : e;
				else {
					if (typeof e == "number") {
						if (e * 0 != 0) throw Error(o + e);
						if (e > 0) t.s = 1;
						else if (e < 0) e = -e, t.s = -1;
						else {
							t.s = 0, t.e = 0, t.d = [0];
							return;
						}
						if (e === ~~e && e < 1e7) {
							t.e = 0, t.d = [e];
							return;
						}
						return E(t, e.toString());
					}
					if (typeof e != "string") throw Error(o + e);
					if (e.charCodeAt(0) === 45 ? (e = e.slice(1), t.s = -1) : t.s = 1, u.test(e)) E(t, e);
					else throw Error(o + e);
				}
			}
			if (i.prototype = g, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.clone = j, i.config = i.set = M, e === void 0 && (e = {}), e) for (r = [
				"precision",
				"rounding",
				"toExpNeg",
				"toExpPos",
				"LN10"
			], t = 0; t < r.length;) e.hasOwnProperty(n = r[t++]) || (e[n] = this[n]);
			return i.config(e), i;
		}
		function M(e) {
			if (!e || typeof e != "object") throw Error(a + "Object expected");
			var t, r, i, s = [
				"precision",
				1,
				n,
				"rounding",
				0,
				8,
				"toExpNeg",
				-1 / 0,
				0,
				"toExpPos",
				0,
				1 / 0
			];
			for (t = 0; t < s.length; t += 3) if ((i = e[r = s[t]]) !== void 0) {
				if (c(i) === i && i >= s[t + 1] && i <= s[t + 2]) this[r] = i;
				else throw Error(o + r + ": " + i);
			}
			if ((i = e[r = "LN10"]) !== void 0) {
				if (i == Math.LN10) this[r] = new this(i);
				else throw Error(o + r + ": " + i);
			}
			return this;
		}
		r = j(r), r.default = r.Decimal = r, d = new r(1), typeof define == "function" && define.amd ? define(function() {
			return r;
		}) : t !== void 0 && t.exports ? t.exports = r : (e ||= typeof self < "u" && self && self.self == self ? self : Function("return this")(), e.Decimal = r);
	})(n);
})))());
function kh(e) {
	return e === 0 ? 1 : Math.floor(new J.default(e).abs().log(10).toNumber()) + 1;
}
function Ah(e, t, n) {
	for (var r = new J.default(e), i = 0, a = []; r.lt(t) && i < 1e5;) a.push(r.toNumber()), r = r.add(n), i++;
	return a;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/scale/getNiceTickValues.js
function jh(e, t) {
	return Ih(e) || Fh(e, t) || Nh(e, t) || Mh();
}
function Mh() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Nh(e, t) {
	if (e) {
		if (typeof e == "string") return Ph(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ph(e, t) : void 0;
	}
}
function Ph(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Fh(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Ih(e) {
	if (Array.isArray(e)) return e;
}
var Lh = (e) => {
	var t = jh(e, 2), n = t[0], r = t[1], i = n, a = r;
	return n > r && (i = r, a = n), [i, a];
}, Rh = (e, t, n) => {
	if (e.lte(0)) return new J.default(0);
	var r = kh(e.toNumber()), i = new J.default(10).pow(r), a = e.div(i), o = r === 1 ? .1 : .05, s = new J.default(Math.ceil(a.div(o).toNumber())).add(n).mul(o).mul(i);
	return t ? new J.default(s.toNumber()) : new J.default(Math.ceil(s.toNumber()));
}, zh = (e, t, n) => {
	if (e.lte(0)) return new J.default(0);
	var r = [
		1,
		2,
		2.5,
		5
	], i = e.toNumber(), a = Math.floor(new J.default(i).abs().log(10).toNumber()), o = new J.default(10).pow(a), s = e.div(o).toNumber(), c = r.findIndex((e) => e >= s - 1e-10);
	if (c === -1 && (o = o.mul(10), c = 0), c += n, c >= r.length) {
		var l = Math.floor(c / r.length);
		c %= r.length, o = o.mul(new J.default(10).pow(l));
	}
	var u = r[c] ?? 1, d = new J.default(u).mul(o);
	return t ? d : new J.default(Math.ceil(d.toNumber()));
}, Bh = (e, t, n) => {
	var r = new J.default(1), i = new J.default(e);
	if (!i.isint() && n) {
		var a = Math.abs(e);
		a < 1 ? (r = new J.default(10).pow(kh(e) - 1), i = new J.default(Math.floor(i.div(r).toNumber())).mul(r)) : a > 1 && (i = new J.default(Math.floor(e)));
	} else e === 0 ? i = new J.default(Math.floor((t - 1) / 2)) : n || (i = new J.default(Math.floor(e)));
	for (var o = Math.floor((t - 1) / 2), s = [], c = 0; c < t; c++) s.push(i.add(new J.default(c - o).mul(r)).toNumber());
	return s;
}, Vh = function(e, t, n, r) {
	var i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0, a = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : Rh;
	if (!Number.isFinite((t - e) / (n - 1))) return {
		step: new J.default(0),
		tickMin: new J.default(0),
		tickMax: new J.default(0)
	};
	var o = a(new J.default(t).sub(e).div(n - 1), r, i), s;
	e <= 0 && t >= 0 ? s = new J.default(0) : (s = new J.default(e).add(t).div(2), s = s.sub(new J.default(s).mod(o)));
	var c = Math.ceil(s.sub(e).div(o).toNumber()), l = Math.ceil(new J.default(t).sub(s).div(o).toNumber()), u = c + l + 1;
	return u > n ? Vh(e, t, n, r, i + 1, a) : (u < n && (l = t > 0 ? l + (n - u) : l, c = t > 0 ? c : c + (n - u)), {
		step: o,
		tickMin: s.sub(new J.default(c).mul(o)),
		tickMax: s.add(new J.default(l).mul(o))
	});
}, Hh = function(e) {
	var t = jh(e, 2), n = t[0], r = t[1], i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto", s = Math.max(i, 2), c = jh(Lh([n, r]), 2), l = c[0], u = c[1];
	if (l === -Infinity || u === Infinity) {
		var d = u === Infinity ? [l, ...Array(i - 1).fill(Infinity)] : [...Array(i - 1).fill(-Infinity), u];
		return n > r ? d.reverse() : d;
	}
	if (l === u) return Bh(l, i, a);
	var f = Vh(l, u, s, a, 0, o === "snap125" ? zh : Rh), p = f.step, m = f.tickMin, h = f.tickMax, g = Ah(m, h.add(new J.default(.1).mul(p)), p);
	return n > r ? g.reverse() : g;
}, Uh = function(e, t) {
	var n = jh(e, 2), r = n[0], i = n[1], a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto", s = jh(Lh([r, i]), 2), c = s[0], l = s[1];
	if (c === -Infinity || l === Infinity) return [r, i];
	if (c === l) return [c];
	var u = o === "snap125" ? zh : Rh, d = Math.max(t, 2), f = u(new J.default(l).sub(c).div(d - 1), a, 0), p = [...Ah(new J.default(c), new J.default(l), f), l];
	if (a === !1) {
		p = p.map((e) => Math.round(e));
		var m = p.length - 1;
		m > 0 && p[m] === p[m - 1] && (p = p.slice(0, m));
	}
	return r > i ? p.reverse() : p;
}, Wh = (e) => e.rootProps.maxBarSize, Gh = (e) => e.rootProps.barGap, Kh = (e) => e.rootProps.barCategoryGap, qh = (e) => e.rootProps.barSize, Jh = (e) => e.rootProps.stackOffset, Yh = (e) => e.rootProps.reverseStackOrder, Xh = (e) => e.options.chartName, Zh = (e) => e.rootProps.syncId, Qh = (e) => e.rootProps.syncMethod, $h = (e) => e.options.eventEmitter, eg = (e) => e.rootProps.baseValue, Y = {
	grid: -100,
	barBackground: -50,
	area: 100,
	cursorRectangle: 200,
	bar: 300,
	line: 400,
	axis: 500,
	scatter: 600,
	activeBar: 1e3,
	cursorLine: 1100,
	activeDot: 1200,
	label: 2e3
}, tg = {
	allowDecimals: !1,
	allowDuplicatedCategory: !0,
	allowDataOverflow: !1,
	angle: 0,
	angleAxisId: 0,
	axisLine: !0,
	axisLineType: "polygon",
	cx: 0,
	cy: 0,
	hide: !1,
	includeHidden: !1,
	label: !1,
	niceTicks: "auto",
	orientation: "outer",
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickLine: !0,
	tickSize: 8,
	type: "auto",
	zIndex: Y.axis
}, ng = {
	allowDataOverflow: !1,
	allowDecimals: !1,
	allowDuplicatedCategory: !0,
	angle: 0,
	axisLine: !0,
	includeHidden: !1,
	hide: !1,
	niceTicks: "auto",
	label: !1,
	orientation: "right",
	radiusAxisId: 0,
	reversed: !1,
	scale: "auto",
	stroke: "#ccc",
	tick: !0,
	tickCount: 5,
	tickLine: !0,
	type: "auto",
	zIndex: Y.axis
}, rg = (e, t) => {
	if (e && t) return e != null && e.reversed ? [t[1], t[0]] : t;
};
// ../../../peach/frontend/node_modules/recharts/es6/util/getAxisTypeBasedOnLayout.js
function ig(e, t, n) {
	if (n !== "auto") return n;
	if (e != null) return gl(e, t) ? "category" : "number";
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
function ag(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function og(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ag(Object(n), !0).forEach(function(t) {
			sg(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ag(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function sg(e, t, n) {
	return (t = cg(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function cg(e) {
	var t = lg(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function lg(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var ug = {
	allowDataOverflow: tg.allowDataOverflow,
	allowDecimals: tg.allowDecimals,
	allowDuplicatedCategory: !1,
	dataKey: void 0,
	domain: void 0,
	id: tg.angleAxisId,
	includeHidden: !1,
	name: void 0,
	reversed: tg.reversed,
	scale: tg.scale,
	tick: tg.tick,
	tickCount: void 0,
	ticks: void 0,
	type: tg.type,
	unit: void 0,
	niceTicks: "auto"
}, dg = {
	allowDataOverflow: ng.allowDataOverflow,
	allowDecimals: ng.allowDecimals,
	allowDuplicatedCategory: ng.allowDuplicatedCategory,
	dataKey: void 0,
	domain: void 0,
	id: ng.radiusAxisId,
	includeHidden: ng.includeHidden,
	name: void 0,
	reversed: ng.reversed,
	scale: ng.scale,
	tick: ng.tick,
	tickCount: ng.tickCount,
	ticks: void 0,
	type: ng.type,
	unit: void 0,
	niceTicks: "auto"
}, fg = H([(e, t) => {
	if (t != null) return e.polarAxis.angleAxis[t];
}, qu], (e, t) => {
	if (e != null) return e;
	var n = ig(t, "angleAxis", ug.type) ?? "category";
	return og(og({}, ug), {}, { type: n });
}), pg = H([(e, t) => e.polarAxis.radiusAxis[t], qu], (e, t) => {
	if (e != null) return e;
	var n = ig(t, "radiusAxis", dg.type) ?? "category";
	return og(og({}, dg), {}, { type: n });
}), mg = (e) => e.polarOptions, hg = H([
	Il,
	Ll,
	$l
], Bm), gg = H([mg, hg], (e, t) => {
	if (e != null) return Vt(e.innerRadius, t, 0);
}), _g = H([mg, hg], (e, t) => {
	if (e != null) return Vt(e.outerRadius, t, t * .8);
}), vg = H([mg], (e) => e == null ? [0, 0] : [e.startAngle, e.endAngle]), yg = H([fg, vg], rg), bg = H([
	hg,
	gg,
	_g
], (e, t, n) => {
	if (e != null && t != null && n != null) return [t, n];
}), xg = H([pg, bg], rg), Sg = H([
	q,
	mg,
	gg,
	_g,
	Il,
	Ll
], (e, t, n, r, i, a) => {
	if (!(e !== "centric" && e !== "radial" || t == null || n == null || r == null)) {
		var o = t.cx, s = t.cy, c = t.startAngle, l = t.endAngle;
		return {
			cx: Vt(o, i, i / 2),
			cy: Vt(s, a, a / 2),
			innerRadius: n,
			outerRadius: r,
			startAngle: c,
			endAngle: l,
			clockWise: !1
		};
	}
}), X = (e, t) => t, Cg = (e, t, n) => n;
// ../../../peach/frontend/node_modules/recharts/es6/util/stacks/getStackSeriesIdentifier.js
function wg(e) {
	return e?.id;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineDisplayedStackedData.js
function Tg(e, t, n) {
	var r = t.chartData, i = r === void 0 ? [] : r, a = n.allowDuplicatedCategory, o = n.dataKey, s = /* @__PURE__ */ new Map();
	return e.forEach((e) => {
		var t = e.data ?? i;
		if (t != null && t.length !== 0) {
			var n = wg(e);
			t.forEach((t, r) => {
				var i = o == null || a ? r : String(K(t, o, null)), c = K(t, e.dataKey, 0), l = s.has(i) ? s.get(i) : {};
				Object.assign(l, { [n]: c }), s.set(i, l);
			});
		}
	}), Array.from(s.values());
}
// ../../../peach/frontend/node_modules/recharts/es6/state/types/StackedGraphicalItem.js
function Eg(e) {
	return "stackId" in e && e.stackId != null && e.dataKey != null;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/numberDomainEqualityCheck.js
var Dg = (e, t) => e === t ? !0 : e == null || t == null ? !1 : e[0] === t[0] && e[1] === t[1];
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/arrayEqualityCheck.js
function Og(e, t) {
	return Array.isArray(e) && Array.isArray(t) && e.length === 0 && t.length === 0 ? !0 : e === t;
}
function kg(e, t) {
	if (e.length === t.length) {
		for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
		return !0;
	}
	return !1;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/selectTooltipAxisType.js
var Ag = (e) => {
	var t = q(e);
	return t === "horizontal" ? "xAxis" : t === "vertical" ? "yAxis" : t === "centric" ? "angleAxis" : "radiusAxis";
}, jg = (e) => e.tooltip.settings.axisId;
// ../../../peach/frontend/node_modules/recharts/es6/util/scale/RechartsScale.js
function Mg(e) {
	if (e != null) {
		var t = e.ticks, n = e.bandwidth, r = e.range(), i = [Math.min(...r), Math.max(...r)];
		return {
			domain: () => e.domain(),
			range: function(e) {
				function t() {
					return e.apply(this, arguments);
				}
				return t.toString = function() {
					return e.toString();
				}, t;
			}(() => i),
			rangeMin: () => i[0],
			rangeMax: () => i[1],
			isInRange(e) {
				var t = i[0], n = i[1];
				return t <= n ? e >= t && e <= n : e >= n && e <= t;
			},
			bandwidth: n ? () => n.call(e) : void 0,
			ticks: t ? (n) => t.call(e, n) : void 0,
			map: (t, n) => {
				var r = e(t);
				if (r != null) {
					if (e.bandwidth && n != null && n.position) {
						var i = e.bandwidth();
						switch (n.position) {
							case "middle":
								r += i / 2;
								break;
							case "end": r += i;
						}
					}
					return r;
				}
			}
		};
	}
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineCheckedDomain.js
var Ng = (e, t) => {
	if (t != null) switch (e) {
		case "linear":
			if (!Th(t)) {
				for (var n, r, i = 0; i < t.length; i++) {
					var a = t[i];
					G(a) && ((n === void 0 || a < n) && (n = a), (r === void 0 || a > r) && (r = a));
				}
				return n !== void 0 && r !== void 0 ? [n, r] : void 0;
			}
			return t;
		default: return t;
	}
};
// ../../../peach/frontend/node_modules/d3-array/src/ascending.js
function Pg(e, t) {
	return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
// ../../../peach/frontend/node_modules/d3-array/src/bisector.js
function Fg(e) {
	let t = e, n = e;
	e.length === 1 && (t = (t, n) => e(t) - n, n = Ig(e));
	function r(e, t, r, i) {
		for (r ??= 0, i ??= e.length; r < i;) {
			let a = r + i >>> 1;
			n(e[a], t) < 0 ? r = a + 1 : i = a;
		}
		return r;
	}
	function i(e, t, r, i) {
		for (r ??= 0, i ??= e.length; r < i;) {
			let a = r + i >>> 1;
			n(e[a], t) > 0 ? i = a : r = a + 1;
		}
		return r;
	}
	function a(e, n, i, a) {
		i ??= 0, a ??= e.length;
		let o = r(e, n, i, a - 1);
		return o > i && t(e[o - 1], n) > -t(e[o], n) ? o - 1 : o;
	}
	return {
		left: r,
		center: a,
		right: i
	};
}
function Ig(e) {
	return (t, n) => Pg(e(t), n);
}
// ../../../peach/frontend/node_modules/d3-array/src/number.js
function Lg(e) {
	return e === null ? NaN : +e;
}
function* Rg(e, t) {
	if (t === void 0) for (let t of e) t != null && (t = +t) >= t && (yield t);
	else {
		let n = -1;
		for (let r of e) (r = t(r, ++n, e)) != null && (r = +r) >= r && (yield r);
	}
}
// ../../../peach/frontend/node_modules/d3-array/src/bisect.js
var zg = Fg(Pg), Bg = zg.right;
zg.left, Fg(Lg).center;
// ../../../peach/frontend/node_modules/internmap/src/index.js
var Vg = class extends Map {
	constructor(e, t = Gg) {
		if (super(), Object.defineProperties(this, {
			_intern: { value: /* @__PURE__ */ new Map() },
			_key: { value: t }
		}), e != null) for (let [t, n] of e) this.set(t, n);
	}
	get(e) {
		return super.get(Hg(this, e));
	}
	has(e) {
		return super.has(Hg(this, e));
	}
	set(e, t) {
		return super.set(Ug(this, e), t);
	}
	delete(e) {
		return super.delete(Wg(this, e));
	}
};
function Hg({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : n;
}
function Ug({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : (e.set(r, n), n);
}
function Wg({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) && (n = e.get(n), e.delete(r)), n;
}
function Gg(e) {
	return typeof e == "object" && e ? e.valueOf() : e;
}
// ../../../peach/frontend/node_modules/d3-array/src/ticks.js
var Kg = Math.sqrt(50), qg = Math.sqrt(10), Jg = Math.sqrt(2);
function Yg(e, t, n) {
	var r, i = -1, a, o, s;
	if (t = +t, e = +e, n = +n, e === t && n > 0) return [e];
	if ((r = t < e) && (a = e, e = t, t = a), (s = Xg(e, t, n)) === 0 || !isFinite(s)) return [];
	if (s > 0) {
		let n = Math.round(e / s), r = Math.round(t / s);
		for (n * s < e && ++n, r * s > t && --r, o = Array(a = r - n + 1); ++i < a;) o[i] = (n + i) * s;
	} else {
		s = -s;
		let n = Math.round(e * s), r = Math.round(t * s);
		for (n / s < e && ++n, r / s > t && --r, o = Array(a = r - n + 1); ++i < a;) o[i] = (n + i) / s;
	}
	return r && o.reverse(), o;
}
function Xg(e, t, n) {
	var r = (t - e) / Math.max(0, n), i = Math.floor(Math.log(r) / Math.LN10), a = r / 10 ** i;
	return i >= 0 ? (a >= Kg ? 10 : a >= qg ? 5 : a >= Jg ? 2 : 1) * 10 ** i : -(10 ** -i) / (a >= Kg ? 10 : a >= qg ? 5 : a >= Jg ? 2 : 1);
}
function Zg(e, t, n) {
	var r = Math.abs(t - e) / Math.max(0, n), i = 10 ** Math.floor(Math.log(r) / Math.LN10), a = r / i;
	return a >= Kg ? i *= 10 : a >= qg ? i *= 5 : a >= Jg && (i *= 2), t < e ? -i : i;
}
// ../../../peach/frontend/node_modules/d3-array/src/max.js
function Qg(e, t) {
	let n;
	if (t === void 0) for (let t of e) t != null && (n < t || n === void 0 && t >= t) && (n = t);
	else {
		let r = -1;
		for (let i of e) (i = t(i, ++r, e)) != null && (n < i || n === void 0 && i >= i) && (n = i);
	}
	return n;
}
// ../../../peach/frontend/node_modules/d3-array/src/min.js
function $g(e, t) {
	let n;
	if (t === void 0) for (let t of e) t != null && (n > t || n === void 0 && t >= t) && (n = t);
	else {
		let r = -1;
		for (let i of e) (i = t(i, ++r, e)) != null && (n > i || n === void 0 && i >= i) && (n = i);
	}
	return n;
}
// ../../../peach/frontend/node_modules/d3-array/src/quickselect.js
function e_(e, t, n = 0, r = e.length - 1, i = Pg) {
	for (; r > n;) {
		if (r - n > 600) {
			let a = r - n + 1, o = t - n + 1, s = Math.log(a), c = .5 * Math.exp(2 * s / 3), l = .5 * Math.sqrt(s * c * (a - c) / a) * (o - a / 2 < 0 ? -1 : 1);
			e_(e, t, Math.max(n, Math.floor(t - o * c / a + l)), Math.min(r, Math.floor(t + (a - o) * c / a + l)), i);
		}
		let a = e[t], o = n, s = r;
		for (t_(e, n, t), i(e[r], a) > 0 && t_(e, n, r); o < s;) {
			for (t_(e, o, s), ++o, --s; i(e[o], a) < 0;) ++o;
			for (; i(e[s], a) > 0;) --s;
		}
		i(e[n], a) === 0 ? t_(e, n, s) : (++s, t_(e, s, r)), s <= t && (n = s + 1), t <= s && (r = s - 1);
	}
	return e;
}
function t_(e, t, n) {
	let r = e[t];
	e[t] = e[n], e[n] = r;
}
// ../../../peach/frontend/node_modules/d3-array/src/quantile.js
function n_(e, t, n) {
	if (e = Float64Array.from(Rg(e, n)), r = e.length) {
		if ((t = +t) <= 0 || r < 2) return $g(e);
		if (t >= 1) return Qg(e);
		var r, i = (r - 1) * t, a = Math.floor(i), o = Qg(e_(e, a).subarray(0, a + 1));
		return o + ($g(e.subarray(a + 1)) - o) * (i - a);
	}
}
function r_(e, t, n = Lg) {
	if (r = e.length) {
		if ((t = +t) <= 0 || r < 2) return +n(e[0], 0, e);
		if (t >= 1) return +n(e[r - 1], r - 1, e);
		var r, i = (r - 1) * t, a = Math.floor(i), o = +n(e[a], a, e);
		return o + (+n(e[a + 1], a + 1, e) - o) * (i - a);
	}
}
// ../../../peach/frontend/node_modules/d3-array/src/range.js
function i_(e, t, n) {
	e = +e, t = +t, n = (i = arguments.length) < 2 ? (t = e, e = 0, 1) : i < 3 ? 1 : +n;
	for (var r = -1, i = Math.max(0, Math.ceil((t - e) / n)) | 0, a = Array(i); ++r < i;) a[r] = e + r * n;
	return a;
}
// ../../../peach/frontend/node_modules/d3-scale/src/init.js
function a_(e, t) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			this.range(e);
			break;
		default: this.range(t).domain(e);
	}
	return this;
}
function o_(e, t) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			typeof e == "function" ? this.interpolator(e) : this.range(e);
			break;
		default: this.domain(e), typeof t == "function" ? this.interpolator(t) : this.range(t);
	}
	return this;
}
// ../../../peach/frontend/node_modules/d3-scale/src/ordinal.js
var s_ = Symbol("implicit");
function c_() {
	var e = new Vg(), t = [], n = [], r = s_;
	function i(i) {
		let a = e.get(i);
		if (a === void 0) {
			if (r !== s_) return r;
			e.set(i, a = t.push(i) - 1);
		}
		return n[a % n.length];
	}
	return i.domain = function(n) {
		if (!arguments.length) return t.slice();
		t = [], e = new Vg();
		for (let r of n) e.has(r) || e.set(r, t.push(r) - 1);
		return i;
	}, i.range = function(e) {
		return arguments.length ? (n = Array.from(e), i) : n.slice();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return c_(t, n).unknown(r);
	}, a_.apply(i, arguments), i;
}
// ../../../peach/frontend/node_modules/d3-scale/src/band.js
function l_() {
	var e = c_().unknown(void 0), t = e.domain, n = e.range, r = 0, i = 1, a, o, s = !1, c = 0, l = 0, u = .5;
	delete e.unknown;
	function d() {
		var e = t().length, d = i < r, f = d ? i : r, p = d ? r : i;
		a = (p - f) / Math.max(1, e - c + l * 2), s && (a = Math.floor(a)), f += (p - f - a * (e - c)) * u, o = a * (1 - c), s && (f = Math.round(f), o = Math.round(o));
		var m = i_(e).map(function(e) {
			return f + a * e;
		});
		return n(d ? m.reverse() : m);
	}
	return e.domain = function(e) {
		return arguments.length ? (t(e), d()) : t();
	}, e.range = function(e) {
		return arguments.length ? ([r, i] = e, r = +r, i = +i, d()) : [r, i];
	}, e.rangeRound = function(e) {
		return [r, i] = e, r = +r, i = +i, s = !0, d();
	}, e.bandwidth = function() {
		return o;
	}, e.step = function() {
		return a;
	}, e.round = function(e) {
		return arguments.length ? (s = !!e, d()) : s;
	}, e.padding = function(e) {
		return arguments.length ? (c = Math.min(1, l = +e), d()) : c;
	}, e.paddingInner = function(e) {
		return arguments.length ? (c = Math.min(1, e), d()) : c;
	}, e.paddingOuter = function(e) {
		return arguments.length ? (l = +e, d()) : l;
	}, e.align = function(e) {
		return arguments.length ? (u = Math.max(0, Math.min(1, e)), d()) : u;
	}, e.copy = function() {
		return l_(t(), [r, i]).round(s).paddingInner(c).paddingOuter(l).align(u);
	}, a_.apply(d(), arguments);
}
function u_(e) {
	var t = e.copy;
	return e.padding = e.paddingOuter, delete e.paddingInner, delete e.paddingOuter, e.copy = function() {
		return u_(t());
	}, e;
}
function d_() {
	return u_(l_.apply(null, arguments).paddingInner(1));
}
// ../../../peach/frontend/node_modules/d3-color/src/define.js
function f_(e, t, n) {
	e.prototype = t.prototype = n, n.constructor = e;
}
function p_(e, t) {
	var n = Object.create(e.prototype);
	for (var r in t) n[r] = t[r];
	return n;
}
// ../../../peach/frontend/node_modules/d3-color/src/color.js
function m_() {}
var h_ = .7, g_ = 1 / h_, __ = "\\s*([+-]?\\d+)\\s*", v_ = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", y_ = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", b_ = /^#([0-9a-f]{3,8})$/, x_ = RegExp(`^rgb\\(${__},${__},${__}\\)$`), S_ = RegExp(`^rgb\\(${y_},${y_},${y_}\\)$`), C_ = RegExp(`^rgba\\(${__},${__},${__},${v_}\\)$`), w_ = RegExp(`^rgba\\(${y_},${y_},${y_},${v_}\\)$`), T_ = RegExp(`^hsl\\(${v_},${y_},${y_}\\)$`), E_ = RegExp(`^hsla\\(${v_},${y_},${y_},${v_}\\)$`), D_ = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
};
f_(m_, M_, {
	copy(e) {
		return Object.assign(new this.constructor(), this, e);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: O_,
	formatHex: O_,
	formatHex8: k_,
	formatHsl: A_,
	formatRgb: j_,
	toString: j_
});
function O_() {
	return this.rgb().formatHex();
}
function k_() {
	return this.rgb().formatHex8();
}
function A_() {
	return G_(this).formatHsl();
}
function j_() {
	return this.rgb().formatRgb();
}
function M_(e) {
	var t, n;
	return e = (e + "").trim().toLowerCase(), (t = b_.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? N_(t) : n === 3 ? new L_(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? P_(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? P_(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = x_.exec(e)) ? new L_(t[1], t[2], t[3], 1) : (t = S_.exec(e)) ? new L_(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = C_.exec(e)) ? P_(t[1], t[2], t[3], t[4]) : (t = w_.exec(e)) ? P_(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = T_.exec(e)) ? W_(t[1], t[2] / 100, t[3] / 100, 1) : (t = E_.exec(e)) ? W_(t[1], t[2] / 100, t[3] / 100, t[4]) : D_.hasOwnProperty(e) ? N_(D_[e]) : e === "transparent" ? new L_(NaN, NaN, NaN, 0) : null;
}
function N_(e) {
	return new L_(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function P_(e, t, n, r) {
	return r <= 0 && (e = t = n = NaN), new L_(e, t, n, r);
}
function F_(e) {
	return e instanceof m_ || (e = M_(e)), e ? (e = e.rgb(), new L_(e.r, e.g, e.b, e.opacity)) : new L_();
}
function I_(e, t, n, r) {
	return arguments.length === 1 ? F_(e) : new L_(e, t, n, r ?? 1);
}
function L_(e, t, n, r) {
	this.r = +e, this.g = +t, this.b = +n, this.opacity = +r;
}
f_(L_, I_, p_(m_, {
	brighter(e) {
		return e = e == null ? g_ : g_ ** +e, new L_(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? h_ : h_ ** +e, new L_(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	rgb() {
		return this;
	},
	clamp() {
		return new L_(H_(this.r), H_(this.g), H_(this.b), V_(this.opacity));
	},
	displayable() {
		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
	},
	hex: R_,
	formatHex: R_,
	formatHex8: z_,
	formatRgb: B_,
	toString: B_
}));
function R_() {
	return `#${U_(this.r)}${U_(this.g)}${U_(this.b)}`;
}
function z_() {
	return `#${U_(this.r)}${U_(this.g)}${U_(this.b)}${U_((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function B_() {
	let e = V_(this.opacity);
	return `${e === 1 ? "rgb(" : "rgba("}${H_(this.r)}, ${H_(this.g)}, ${H_(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function V_(e) {
	return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function H_(e) {
	return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function U_(e) {
	return e = H_(e), (e < 16 ? "0" : "") + e.toString(16);
}
function W_(e, t, n, r) {
	return r <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new q_(e, t, n, r);
}
function G_(e) {
	if (e instanceof q_) return new q_(e.h, e.s, e.l, e.opacity);
	if (e instanceof m_ || (e = M_(e)), !e) return new q_();
	if (e instanceof q_) return e;
	e = e.rgb();
	var t = e.r / 255, n = e.g / 255, r = e.b / 255, i = Math.min(t, n, r), a = Math.max(t, n, r), o = NaN, s = a - i, c = (a + i) / 2;
	return s ? (o = t === a ? (n - r) / s + (n < r) * 6 : n === a ? (r - t) / s + 2 : (t - n) / s + 4, s /= c < .5 ? a + i : 2 - a - i, o *= 60) : s = c > 0 && c < 1 ? 0 : o, new q_(o, s, c, e.opacity);
}
function K_(e, t, n, r) {
	return arguments.length === 1 ? G_(e) : new q_(e, t, n, r ?? 1);
}
function q_(e, t, n, r) {
	this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
f_(q_, K_, p_(m_, {
	brighter(e) {
		return e = e == null ? g_ : g_ ** +e, new q_(this.h, this.s, this.l * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? h_ : h_ ** +e, new q_(this.h, this.s, this.l * e, this.opacity);
	},
	rgb() {
		var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < .5 ? n : 1 - n) * t, i = 2 * n - r;
		return new L_(X_(e >= 240 ? e - 240 : e + 120, i, r), X_(e, i, r), X_(e < 120 ? e + 240 : e - 120, i, r), this.opacity);
	},
	clamp() {
		return new q_(J_(this.h), Y_(this.s), Y_(this.l), V_(this.opacity));
	},
	displayable() {
		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
	},
	formatHsl() {
		let e = V_(this.opacity);
		return `${e === 1 ? "hsl(" : "hsla("}${J_(this.h)}, ${Y_(this.s) * 100}%, ${Y_(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
	}
}));
function J_(e) {
	return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function Y_(e) {
	return Math.max(0, Math.min(1, e || 0));
}
function X_(e, t, n) {
	return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/constant.js
var Z_ = (e) => () => e;
// ../../../peach/frontend/node_modules/d3-interpolate/src/color.js
function Q_(e, t) {
	return function(n) {
		return e + n * t;
	};
}
function $_(e, t, n) {
	return e **= +n, t = t ** +n - e, n = 1 / n, function(r) {
		return (e + r * t) ** +n;
	};
}
function ev(e) {
	return (e = +e) == 1 ? tv : function(t, n) {
		return n - t ? $_(t, n, e) : Z_(isNaN(t) ? n : t);
	};
}
function tv(e, t) {
	var n = t - e;
	return n ? Q_(e, n) : Z_(isNaN(e) ? t : e);
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/rgb.js
var nv = (function e(t) {
	var n = ev(t);
	function r(e, t) {
		var r = n((e = I_(e)).r, (t = I_(t)).r), i = n(e.g, t.g), a = n(e.b, t.b), o = tv(e.opacity, t.opacity);
		return function(t) {
			return e.r = r(t), e.g = i(t), e.b = a(t), e.opacity = o(t), e + "";
		};
	}
	return r.gamma = e, r;
})(1);
// ../../../peach/frontend/node_modules/d3-interpolate/src/numberArray.js
function rv(e, t) {
	t ||= [];
	var n = e ? Math.min(t.length, e.length) : 0, r = t.slice(), i;
	return function(a) {
		for (i = 0; i < n; ++i) r[i] = e[i] * (1 - a) + t[i] * a;
		return r;
	};
}
function iv(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/array.js
function av(e, t) {
	for (var n = t ? t.length : 0, r = e ? Math.min(n, e.length) : 0, i = Array(r), a = Array(n), o = 0; o < r; ++o) i[o] = mv(e[o], t[o]);
	for (; o < n; ++o) a[o] = t[o];
	return function(e) {
		for (o = 0; o < r; ++o) a[o] = i[o](e);
		return a;
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/date.js
function ov(e, t) {
	var n = /* @__PURE__ */ new Date();
	return e = +e, t = +t, function(r) {
		return n.setTime(e * (1 - r) + t * r), n;
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/number.js
function sv(e, t) {
	return e = +e, t = +t, function(n) {
		return e * (1 - n) + t * n;
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/object.js
function cv(e, t) {
	var n = {}, r = {}, i;
	for (i in typeof e == "object" && e || (e = {}), typeof t == "object" && t || (t = {}), t) i in e ? n[i] = mv(e[i], t[i]) : r[i] = t[i];
	return function(e) {
		for (i in n) r[i] = n[i](e);
		return r;
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/string.js
var lv = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, uv = new RegExp(lv.source, "g");
function dv(e) {
	return function() {
		return e;
	};
}
function fv(e) {
	return function(t) {
		return e(t) + "";
	};
}
function pv(e, t) {
	var n = lv.lastIndex = uv.lastIndex = 0, r, i, a, o = -1, s = [], c = [];
	for (e += "", t += ""; (r = lv.exec(e)) && (i = uv.exec(t));) (a = i.index) > n && (a = t.slice(n, a), s[o] ? s[o] += a : s[++o] = a), (r = r[0]) === (i = i[0]) ? s[o] ? s[o] += i : s[++o] = i : (s[++o] = null, c.push({
		i: o,
		x: sv(r, i)
	})), n = uv.lastIndex;
	return n < t.length && (a = t.slice(n), s[o] ? s[o] += a : s[++o] = a), s.length < 2 ? c[0] ? fv(c[0].x) : dv(t) : (t = c.length, function(e) {
		for (var n = 0, r; n < t; ++n) s[(r = c[n]).i] = r.x(e);
		return s.join("");
	});
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/value.js
function mv(e, t) {
	var n = typeof t, r;
	return t == null || n === "boolean" ? Z_(t) : (n === "number" ? sv : n === "string" ? (r = M_(t)) ? (t = r, nv) : pv : t instanceof M_ ? nv : t instanceof Date ? ov : iv(t) ? rv : Array.isArray(t) ? av : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? cv : sv)(e, t);
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/round.js
function hv(e, t) {
	return e = +e, t = +t, function(n) {
		return Math.round(e * (1 - n) + t * n);
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/piecewise.js
function gv(e, t) {
	t === void 0 && (t = e, e = mv);
	for (var n = 0, r = t.length - 1, i = t[0], a = Array(r < 0 ? 0 : r); n < r;) a[n] = e(i, i = t[++n]);
	return function(e) {
		var t = Math.max(0, Math.min(r - 1, Math.floor(e *= r)));
		return a[t](e - t);
	};
}
// ../../../peach/frontend/node_modules/d3-scale/src/constant.js
function _v(e) {
	return function() {
		return e;
	};
}
// ../../../peach/frontend/node_modules/d3-scale/src/number.js
function vv(e) {
	return +e;
}
// ../../../peach/frontend/node_modules/d3-scale/src/continuous.js
var yv = [0, 1];
function bv(e) {
	return e;
}
function xv(e, t) {
	return (t -= e = +e) ? function(n) {
		return (n - e) / t;
	} : _v(isNaN(t) ? NaN : .5);
}
function Sv(e, t) {
	var n;
	return e > t && (n = e, e = t, t = n), function(n) {
		return Math.max(e, Math.min(t, n));
	};
}
function Cv(e, t, n) {
	var r = e[0], i = e[1], a = t[0], o = t[1];
	return i < r ? (r = xv(i, r), a = n(o, a)) : (r = xv(r, i), a = n(a, o)), function(e) {
		return a(r(e));
	};
}
function wv(e, t, n) {
	var r = Math.min(e.length, t.length) - 1, i = Array(r), a = Array(r), o = -1;
	for (e[r] < e[0] && (e = e.slice().reverse(), t = t.slice().reverse()); ++o < r;) i[o] = xv(e[o], e[o + 1]), a[o] = n(t[o], t[o + 1]);
	return function(t) {
		var n = Bg(e, t, 1, r) - 1;
		return a[n](i[n](t));
	};
}
function Tv(e, t) {
	return t.domain(e.domain()).range(e.range()).interpolate(e.interpolate()).clamp(e.clamp()).unknown(e.unknown());
}
function Ev() {
	var e = yv, t = yv, n = mv, r, i, a, o = bv, s, c, l;
	function u() {
		var n = Math.min(e.length, t.length);
		return o !== bv && (o = Sv(e[0], e[n - 1])), s = n > 2 ? wv : Cv, c = l = null, d;
	}
	function d(i) {
		return i == null || isNaN(i = +i) ? a : (c ||= s(e.map(r), t, n))(r(o(i)));
	}
	return d.invert = function(n) {
		return o(i((l ||= s(t, e.map(r), sv))(n)));
	}, d.domain = function(t) {
		return arguments.length ? (e = Array.from(t, vv), u()) : e.slice();
	}, d.range = function(e) {
		return arguments.length ? (t = Array.from(e), u()) : t.slice();
	}, d.rangeRound = function(e) {
		return t = Array.from(e), n = hv, u();
	}, d.clamp = function(e) {
		return arguments.length ? (o = e ? !0 : bv, u()) : o !== bv;
	}, d.interpolate = function(e) {
		return arguments.length ? (n = e, u()) : n;
	}, d.unknown = function(e) {
		return arguments.length ? (a = e, d) : a;
	}, function(e, t) {
		return r = e, i = t, u();
	};
}
function Dv() {
	return Ev()(bv, bv);
}
// ../../../peach/frontend/node_modules/d3-format/src/formatDecimal.js
function Ov(e) {
	return Math.abs(e = Math.round(e)) >= 1e21 ? e.toLocaleString("en").replace(/,/g, "") : e.toString(10);
}
function kv(e, t) {
	if (!isFinite(e) || e === 0) return null;
	var n = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf("e"), r = e.slice(0, n);
	return [r.length > 1 ? r[0] + r.slice(2) : r, +e.slice(n + 1)];
}
// ../../../peach/frontend/node_modules/d3-format/src/exponent.js
function Av(e) {
	return e = kv(Math.abs(e)), e ? e[1] : NaN;
}
// ../../../peach/frontend/node_modules/d3-format/src/formatGroup.js
function jv(e, t) {
	return function(n, r) {
		for (var i = n.length, a = [], o = 0, s = e[0], c = 0; i > 0 && s > 0 && (c + s + 1 > r && (s = Math.max(1, r - c)), a.push(n.substring(i -= s, i + s)), !((c += s + 1) > r));) s = e[o = (o + 1) % e.length];
		return a.reverse().join(t);
	};
}
// ../../../peach/frontend/node_modules/d3-format/src/formatNumerals.js
function Mv(e) {
	return function(t) {
		return t.replace(/[0-9]/g, function(t) {
			return e[+t];
		});
	};
}
// ../../../peach/frontend/node_modules/d3-format/src/formatSpecifier.js
var Nv = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function Pv(e) {
	if (!(t = Nv.exec(e))) throw Error("invalid format: " + e);
	var t;
	return new Fv({
		fill: t[1],
		align: t[2],
		sign: t[3],
		symbol: t[4],
		zero: t[5],
		width: t[6],
		comma: t[7],
		precision: t[8] && t[8].slice(1),
		trim: t[9],
		type: t[10]
	});
}
Pv.prototype = Fv.prototype;
function Fv(e) {
	this.fill = e.fill === void 0 ? " " : e.fill + "", this.align = e.align === void 0 ? ">" : e.align + "", this.sign = e.sign === void 0 ? "-" : e.sign + "", this.symbol = e.symbol === void 0 ? "" : e.symbol + "", this.zero = !!e.zero, this.width = e.width === void 0 ? void 0 : +e.width, this.comma = !!e.comma, this.precision = e.precision === void 0 ? void 0 : +e.precision, this.trim = !!e.trim, this.type = e.type === void 0 ? "" : e.type + "";
}
Fv.prototype.toString = function() {
	return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
// ../../../peach/frontend/node_modules/d3-format/src/formatTrim.js
function Iv(e) {
	out: for (var t = e.length, n = 1, r = -1, i; n < t; ++n) switch (e[n]) {
		case ".":
			r = i = n;
			break;
		case "0":
			r === 0 && (r = n), i = n;
			break;
		default:
			if (!+e[n]) break out;
			r > 0 && (r = 0);
	}
	return r > 0 ? e.slice(0, r) + e.slice(i + 1) : e;
}
// ../../../peach/frontend/node_modules/d3-format/src/formatPrefixAuto.js
var Lv;
function Rv(e, t) {
	var n = kv(e, t);
	if (!n) return Lv = void 0, e.toPrecision(t);
	var r = n[0], i = n[1], a = i - (Lv = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1, o = r.length;
	return a === o ? r : a > o ? r + Array(a - o + 1).join("0") : a > 0 ? r.slice(0, a) + "." + r.slice(a) : "0." + Array(1 - a).join("0") + kv(e, Math.max(0, t + a - 1))[0];
}
// ../../../peach/frontend/node_modules/d3-format/src/formatRounded.js
function zv(e, t) {
	var n = kv(e, t);
	if (!n) return e + "";
	var r = n[0], i = n[1];
	return i < 0 ? "0." + Array(-i).join("0") + r : r.length > i + 1 ? r.slice(0, i + 1) + "." + r.slice(i + 1) : r + Array(i - r.length + 2).join("0");
}
// ../../../peach/frontend/node_modules/d3-format/src/formatTypes.js
var Bv = {
	"%": (e, t) => (e * 100).toFixed(t),
	b: (e) => Math.round(e).toString(2),
	c: (e) => e + "",
	d: Ov,
	e: (e, t) => e.toExponential(t),
	f: (e, t) => e.toFixed(t),
	g: (e, t) => e.toPrecision(t),
	o: (e) => Math.round(e).toString(8),
	p: (e, t) => zv(e * 100, t),
	r: zv,
	s: Rv,
	X: (e) => Math.round(e).toString(16).toUpperCase(),
	x: (e) => Math.round(e).toString(16)
};
// ../../../peach/frontend/node_modules/d3-format/src/identity.js
function Vv(e) {
	return e;
}
// ../../../peach/frontend/node_modules/d3-format/src/locale.js
var Hv = Array.prototype.map, Uv = [
	"y",
	"z",
	"a",
	"f",
	"p",
	"n",
	"µ",
	"m",
	"",
	"k",
	"M",
	"G",
	"T",
	"P",
	"E",
	"Z",
	"Y"
];
function Wv(e) {
	var t = e.grouping === void 0 || e.thousands === void 0 ? Vv : jv(Hv.call(e.grouping, Number), e.thousands + ""), n = e.currency === void 0 ? "" : e.currency[0] + "", r = e.currency === void 0 ? "" : e.currency[1] + "", i = e.decimal === void 0 ? "." : e.decimal + "", a = e.numerals === void 0 ? Vv : Mv(Hv.call(e.numerals, String)), o = e.percent === void 0 ? "%" : e.percent + "", s = e.minus === void 0 ? "−" : e.minus + "", c = e.nan === void 0 ? "NaN" : e.nan + "";
	function l(e, l) {
		e = Pv(e);
		var u = e.fill, d = e.align, f = e.sign, p = e.symbol, m = e.zero, h = e.width, g = e.comma, _ = e.precision, v = e.trim, y = e.type;
		y === "n" ? (g = !0, y = "g") : Bv[y] || (_ === void 0 && (_ = 12), v = !0, y = "g"), (m || u === "0" && d === "=") && (m = !0, u = "0", d = "=");
		var b = (l && l.prefix !== void 0 ? l.prefix : "") + (p === "$" ? n : p === "#" && /[boxX]/.test(y) ? "0" + y.toLowerCase() : ""), x = (p === "$" ? r : /[%p]/.test(y) ? o : "") + (l && l.suffix !== void 0 ? l.suffix : ""), S = Bv[y], C = /[defgprs%]/.test(y);
		_ = _ === void 0 ? 6 : /[gprs]/.test(y) ? Math.max(1, Math.min(21, _)) : Math.max(0, Math.min(20, _));
		function w(e) {
			var n = b, r = x, o, l, p;
			if (y === "c") r = S(e) + r, e = "";
			else {
				e = +e;
				var w = e < 0 || 1 / e < 0;
				if (e = isNaN(e) ? c : S(Math.abs(e), _), v && (e = Iv(e)), w && +e == 0 && f !== "+" && (w = !1), n = (w ? f === "(" ? f : s : f === "-" || f === "(" ? "" : f) + n, r = (y === "s" && !isNaN(e) && Lv !== void 0 ? Uv[8 + Lv / 3] : "") + r + (w && f === "(" ? ")" : ""), C) {
					for (o = -1, l = e.length; ++o < l;) if (p = e.charCodeAt(o), 48 > p || p > 57) {
						r = (p === 46 ? i + e.slice(o + 1) : e.slice(o)) + r, e = e.slice(0, o);
						break;
					}
				}
			}
			g && !m && (e = t(e, Infinity));
			var T = n.length + e.length + r.length, E = T < h ? Array(h - T + 1).join(u) : "";
			switch (g && m && (e = t(E + e, E.length ? h - r.length : Infinity), E = ""), d) {
				case "<":
					e = n + e + r + E;
					break;
				case "=":
					e = n + E + e + r;
					break;
				case "^":
					e = E.slice(0, T = E.length >> 1) + n + e + r + E.slice(T);
					break;
				default: e = E + n + e + r;
			}
			return a(e);
		}
		return w.toString = function() {
			return e + "";
		}, w;
	}
	function u(e, t) {
		var n = Math.max(-8, Math.min(8, Math.floor(Av(t) / 3))) * 3, r = 10 ** -n, i = l((e = Pv(e), e.type = "f", e), { suffix: Uv[8 + n / 3] });
		return function(e) {
			return i(r * e);
		};
	}
	return {
		format: l,
		formatPrefix: u
	};
}
// ../../../peach/frontend/node_modules/d3-format/src/defaultLocale.js
var Gv, Kv, qv;
Jv({
	thousands: ",",
	grouping: [3],
	currency: ["$", ""]
});
function Jv(e) {
	return Gv = Wv(e), Kv = Gv.format, qv = Gv.formatPrefix, Gv;
}
// ../../../peach/frontend/node_modules/d3-format/src/precisionFixed.js
function Yv(e) {
	return Math.max(0, -Av(Math.abs(e)));
}
// ../../../peach/frontend/node_modules/d3-format/src/precisionPrefix.js
function Xv(e, t) {
	return Math.max(0, Math.max(-8, Math.min(8, Math.floor(Av(t) / 3))) * 3 - Av(Math.abs(e)));
}
// ../../../peach/frontend/node_modules/d3-format/src/precisionRound.js
function Zv(e, t) {
	return e = Math.abs(e), t = Math.abs(t) - e, Math.max(0, Av(t) - Av(e)) + 1;
}
// ../../../peach/frontend/node_modules/d3-scale/src/tickFormat.js
function Qv(e, t, n, r) {
	var i = Zg(e, t, n), a;
	switch (r = Pv(r ?? ",f"), r.type) {
		case "s":
			var o = Math.max(Math.abs(e), Math.abs(t));
			return r.precision == null && !isNaN(a = Xv(i, o)) && (r.precision = a), qv(r, o);
		case "":
		case "e":
		case "g":
		case "p":
		case "r":
			r.precision == null && !isNaN(a = Zv(i, Math.max(Math.abs(e), Math.abs(t)))) && (r.precision = a - (r.type === "e"));
			break;
		case "f":
		case "%": r.precision == null && !isNaN(a = Yv(i)) && (r.precision = a - (r.type === "%") * 2);
	}
	return Kv(r);
}
// ../../../peach/frontend/node_modules/d3-scale/src/linear.js
function $v(e) {
	var t = e.domain;
	return e.ticks = function(e) {
		var n = t();
		return Yg(n[0], n[n.length - 1], e ?? 10);
	}, e.tickFormat = function(e, n) {
		var r = t();
		return Qv(r[0], r[r.length - 1], e ?? 10, n);
	}, e.nice = function(n) {
		n ??= 10;
		var r = t(), i = 0, a = r.length - 1, o = r[i], s = r[a], c, l, u = 10;
		for (s < o && (l = o, o = s, s = l, l = i, i = a, a = l); u-- > 0;) {
			if (l = Xg(o, s, n), l === c) return r[i] = o, r[a] = s, t(r);
			if (l > 0) o = Math.floor(o / l) * l, s = Math.ceil(s / l) * l;
			else if (l < 0) o = Math.ceil(o * l) / l, s = Math.floor(s * l) / l;
			else break;
			c = l;
		}
		return e;
	}, e;
}
function ey() {
	var e = Dv();
	return e.copy = function() {
		return Tv(e, ey());
	}, a_.apply(e, arguments), $v(e);
}
// ../../../peach/frontend/node_modules/d3-scale/src/identity.js
function ty(e) {
	var t;
	function n(e) {
		return e == null || isNaN(e = +e) ? t : e;
	}
	return n.invert = n, n.domain = n.range = function(t) {
		return arguments.length ? (e = Array.from(t, vv), n) : e.slice();
	}, n.unknown = function(e) {
		return arguments.length ? (t = e, n) : t;
	}, n.copy = function() {
		return ty(e).unknown(t);
	}, e = arguments.length ? Array.from(e, vv) : [0, 1], $v(n);
}
// ../../../peach/frontend/node_modules/d3-scale/src/nice.js
function ny(e, t) {
	e = e.slice();
	var n = 0, r = e.length - 1, i = e[n], a = e[r], o;
	return a < i && (o = n, n = r, r = o, o = i, i = a, a = o), e[n] = t.floor(i), e[r] = t.ceil(a), e;
}
// ../../../peach/frontend/node_modules/d3-scale/src/log.js
function ry(e) {
	return Math.log(e);
}
function iy(e) {
	return Math.exp(e);
}
function ay(e) {
	return -Math.log(-e);
}
function oy(e) {
	return -Math.exp(-e);
}
function sy(e) {
	return isFinite(e) ? +("1e" + e) : e < 0 ? 0 : e;
}
function cy(e) {
	return e === 10 ? sy : e === Math.E ? Math.exp : (t) => e ** +t;
}
function ly(e) {
	return e === Math.E ? Math.log : e === 10 && Math.log10 || e === 2 && Math.log2 || (e = Math.log(e), (t) => Math.log(t) / e);
}
function uy(e) {
	return (t, n) => -e(-t, n);
}
function dy(e) {
	let t = e(ry, iy), n = t.domain, r = 10, i, a;
	function o() {
		return i = ly(r), a = cy(r), n()[0] < 0 ? (i = uy(i), a = uy(a), e(ay, oy)) : e(ry, iy), t;
	}
	return t.base = function(e) {
		return arguments.length ? (r = +e, o()) : r;
	}, t.domain = function(e) {
		return arguments.length ? (n(e), o()) : n();
	}, t.ticks = (e) => {
		let t = n(), o = t[0], s = t[t.length - 1], c = s < o;
		c && ([o, s] = [s, o]);
		let l = i(o), u = i(s), d, f, p = e == null ? 10 : +e, m = [];
		if (!(r % 1) && u - l < p) {
			if (l = Math.floor(l), u = Math.ceil(u), o > 0) {
				for (; l <= u; ++l) for (d = 1; d < r; ++d) if (f = l < 0 ? d / a(-l) : d * a(l), !(f < o)) {
					if (f > s) break;
					m.push(f);
				}
			} else for (; l <= u; ++l) for (d = r - 1; d >= 1; --d) if (f = l > 0 ? d / a(-l) : d * a(l), !(f < o)) {
				if (f > s) break;
				m.push(f);
			}
			m.length * 2 < p && (m = Yg(o, s, p));
		} else m = Yg(l, u, Math.min(u - l, p)).map(a);
		return c ? m.reverse() : m;
	}, t.tickFormat = (e, n) => {
		if (e ??= 10, n ??= r === 10 ? "s" : ",", typeof n != "function" && (!(r % 1) && (n = Pv(n)).precision == null && (n.trim = !0), n = Kv(n)), e === Infinity) return n;
		let o = Math.max(1, r * e / t.ticks().length);
		return (e) => {
			let t = e / a(Math.round(i(e)));
			return t * r < r - .5 && (t *= r), t <= o ? n(e) : "";
		};
	}, t.nice = () => n(ny(n(), {
		floor: (e) => a(Math.floor(i(e))),
		ceil: (e) => a(Math.ceil(i(e)))
	})), t;
}
function fy() {
	let e = dy(Ev()).domain([1, 10]);
	return e.copy = () => Tv(e, fy()).base(e.base()), a_.apply(e, arguments), e;
}
// ../../../peach/frontend/node_modules/d3-scale/src/symlog.js
function py(e) {
	return function(t) {
		return Math.sign(t) * Math.log1p(Math.abs(t / e));
	};
}
function my(e) {
	return function(t) {
		return Math.sign(t) * Math.expm1(Math.abs(t)) * e;
	};
}
function hy(e) {
	var t = 1, n = e(py(t), my(t));
	return n.constant = function(n) {
		return arguments.length ? e(py(t = +n), my(t)) : t;
	}, $v(n);
}
function gy() {
	var e = hy(Ev());
	return e.copy = function() {
		return Tv(e, gy()).constant(e.constant());
	}, a_.apply(e, arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/pow.js
function _y(e) {
	return function(t) {
		return t < 0 ? -((-t) ** +e) : t ** +e;
	};
}
function vy(e) {
	return e < 0 ? -Math.sqrt(-e) : Math.sqrt(e);
}
function yy(e) {
	return e < 0 ? -e * e : e * e;
}
function by(e) {
	var t = e(bv, bv), n = 1;
	function r() {
		return n === 1 ? e(bv, bv) : n === .5 ? e(vy, yy) : e(_y(n), _y(1 / n));
	}
	return t.exponent = function(e) {
		return arguments.length ? (n = +e, r()) : n;
	}, $v(t);
}
function xy() {
	var e = by(Ev());
	return e.copy = function() {
		return Tv(e, xy()).exponent(e.exponent());
	}, a_.apply(e, arguments), e;
}
function Sy() {
	return xy.apply(null, arguments).exponent(.5);
}
// ../../../peach/frontend/node_modules/d3-scale/src/radial.js
function Cy(e) {
	return Math.sign(e) * e * e;
}
function wy(e) {
	return Math.sign(e) * Math.sqrt(Math.abs(e));
}
function Ty() {
	var e = Dv(), t = [0, 1], n = !1, r;
	function i(t) {
		var i = wy(e(t));
		return isNaN(i) ? r : n ? Math.round(i) : i;
	}
	return i.invert = function(t) {
		return e.invert(Cy(t));
	}, i.domain = function(t) {
		return arguments.length ? (e.domain(t), i) : e.domain();
	}, i.range = function(n) {
		return arguments.length ? (e.range((t = Array.from(n, vv)).map(Cy)), i) : t.slice();
	}, i.rangeRound = function(e) {
		return i.range(e).round(!0);
	}, i.round = function(e) {
		return arguments.length ? (n = !!e, i) : n;
	}, i.clamp = function(t) {
		return arguments.length ? (e.clamp(t), i) : e.clamp();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return Ty(e.domain(), t).round(n).clamp(e.clamp()).unknown(r);
	}, a_.apply(i, arguments), $v(i);
}
// ../../../peach/frontend/node_modules/d3-scale/src/quantile.js
function Ey() {
	var e = [], t = [], n = [], r;
	function i() {
		var r = 0, i = Math.max(1, t.length);
		for (n = Array(i - 1); ++r < i;) n[r - 1] = r_(e, r / i);
		return a;
	}
	function a(e) {
		return e == null || isNaN(e = +e) ? r : t[Bg(n, e)];
	}
	return a.invertExtent = function(r) {
		var i = t.indexOf(r);
		return i < 0 ? [NaN, NaN] : [i > 0 ? n[i - 1] : e[0], i < n.length ? n[i] : e[e.length - 1]];
	}, a.domain = function(t) {
		if (!arguments.length) return e.slice();
		e = [];
		for (let n of t) n != null && !isNaN(n = +n) && e.push(n);
		return e.sort(Pg), i();
	}, a.range = function(e) {
		return arguments.length ? (t = Array.from(e), i()) : t.slice();
	}, a.unknown = function(e) {
		return arguments.length ? (r = e, a) : r;
	}, a.quantiles = function() {
		return n.slice();
	}, a.copy = function() {
		return Ey().domain(e).range(t).unknown(r);
	}, a_.apply(a, arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/quantize.js
function Dy() {
	var e = 0, t = 1, n = 1, r = [.5], i = [0, 1], a;
	function o(e) {
		return e != null && e <= e ? i[Bg(r, e, 0, n)] : a;
	}
	function s() {
		var i = -1;
		for (r = Array(n); ++i < n;) r[i] = ((i + 1) * t - (i - n) * e) / (n + 1);
		return o;
	}
	return o.domain = function(n) {
		return arguments.length ? ([e, t] = n, e = +e, t = +t, s()) : [e, t];
	}, o.range = function(e) {
		return arguments.length ? (n = (i = Array.from(e)).length - 1, s()) : i.slice();
	}, o.invertExtent = function(a) {
		var o = i.indexOf(a);
		return o < 0 ? [NaN, NaN] : o < 1 ? [e, r[0]] : o >= n ? [r[n - 1], t] : [r[o - 1], r[o]];
	}, o.unknown = function(e) {
		return arguments.length && (a = e), o;
	}, o.thresholds = function() {
		return r.slice();
	}, o.copy = function() {
		return Dy().domain([e, t]).range(i).unknown(a);
	}, a_.apply($v(o), arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/threshold.js
function Oy() {
	var e = [.5], t = [0, 1], n, r = 1;
	function i(i) {
		return i != null && i <= i ? t[Bg(e, i, 0, r)] : n;
	}
	return i.domain = function(n) {
		return arguments.length ? (e = Array.from(n), r = Math.min(e.length, t.length - 1), i) : e.slice();
	}, i.range = function(n) {
		return arguments.length ? (t = Array.from(n), r = Math.min(e.length, t.length - 1), i) : t.slice();
	}, i.invertExtent = function(n) {
		var r = t.indexOf(n);
		return [e[r - 1], e[r]];
	}, i.unknown = function(e) {
		return arguments.length ? (n = e, i) : n;
	}, i.copy = function() {
		return Oy().domain(e).range(t).unknown(n);
	}, a_.apply(i, arguments);
}
// ../../../peach/frontend/node_modules/d3-time/src/interval.js
var ky = /* @__PURE__ */ new Date(), Ay = /* @__PURE__ */ new Date();
function jy(e, t, n, r) {
	function i(t) {
		return e(t = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+t)), t;
	}
	return i.floor = (t) => (e(t = /* @__PURE__ */ new Date(+t)), t), i.ceil = (n) => (e(n = /* @__PURE__ */ new Date(n - 1)), t(n, 1), e(n), n), i.round = (e) => {
		let t = i(e), n = i.ceil(e);
		return e - t < n - e ? t : n;
	}, i.offset = (e, n) => (t(e = /* @__PURE__ */ new Date(+e), n == null ? 1 : Math.floor(n)), e), i.range = (n, r, a) => {
		let o = [];
		if (n = i.ceil(n), a = a == null ? 1 : Math.floor(a), !(n < r) || !(a > 0)) return o;
		let s;
		do
			o.push(s = /* @__PURE__ */ new Date(+n)), t(n, a), e(n);
		while (s < n && n < r);
		return o;
	}, i.filter = (n) => jy((t) => {
		if (t >= t) for (; e(t), !n(t);) t.setTime(t - 1);
	}, (e, r) => {
		if (e >= e) {
			if (r < 0) for (; ++r <= 0;) for (; t(e, -1), !n(e););
			else for (; --r >= 0;) for (; t(e, 1), !n(e););
		}
	}), n && (i.count = (t, r) => (ky.setTime(+t), Ay.setTime(+r), e(ky), e(Ay), Math.floor(n(ky, Ay))), i.every = (e) => (e = Math.floor(e), !isFinite(e) || !(e > 0) ? null : e > 1 ? i.filter(r ? (t) => r(t) % e === 0 : (t) => i.count(0, t) % e === 0) : i)), i;
}
// ../../../peach/frontend/node_modules/d3-time/src/millisecond.js
var My = jy(() => {}, (e, t) => {
	e.setTime(+e + t);
}, (e, t) => t - e);
My.every = (e) => (e = Math.floor(e), !isFinite(e) || !(e > 0) ? null : e > 1 ? jy((t) => {
	t.setTime(Math.floor(t / e) * e);
}, (t, n) => {
	t.setTime(+t + n * e);
}, (t, n) => (n - t) / e) : My), My.range;
// ../../../peach/frontend/node_modules/d3-time/src/duration.js
var Ny = 1e3, Py = Ny * 60, Fy = Py * 60, Iy = Fy * 24, Ly = Iy * 7, Ry = Iy * 30, zy = Iy * 365, By = jy((e) => {
	e.setTime(e - e.getMilliseconds());
}, (e, t) => {
	e.setTime(+e + t * Ny);
}, (e, t) => (t - e) / Ny, (e) => e.getUTCSeconds());
By.range;
// ../../../peach/frontend/node_modules/d3-time/src/minute.js
var Vy = jy((e) => {
	e.setTime(e - e.getMilliseconds() - e.getSeconds() * Ny);
}, (e, t) => {
	e.setTime(+e + t * Py);
}, (e, t) => (t - e) / Py, (e) => e.getMinutes());
Vy.range;
var Hy = jy((e) => {
	e.setUTCSeconds(0, 0);
}, (e, t) => {
	e.setTime(+e + t * Py);
}, (e, t) => (t - e) / Py, (e) => e.getUTCMinutes());
Hy.range;
// ../../../peach/frontend/node_modules/d3-time/src/hour.js
var Uy = jy((e) => {
	e.setTime(e - e.getMilliseconds() - e.getSeconds() * Ny - e.getMinutes() * Py);
}, (e, t) => {
	e.setTime(+e + t * Fy);
}, (e, t) => (t - e) / Fy, (e) => e.getHours());
Uy.range;
var Wy = jy((e) => {
	e.setUTCMinutes(0, 0, 0);
}, (e, t) => {
	e.setTime(+e + t * Fy);
}, (e, t) => (t - e) / Fy, (e) => e.getUTCHours());
Wy.range;
// ../../../peach/frontend/node_modules/d3-time/src/day.js
var Gy = jy((e) => e.setHours(0, 0, 0, 0), (e, t) => e.setDate(e.getDate() + t), (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * Py) / Iy, (e) => e.getDate() - 1);
Gy.range;
var Ky = jy((e) => {
	e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCDate(e.getUTCDate() + t);
}, (e, t) => (t - e) / Iy, (e) => e.getUTCDate() - 1);
Ky.range;
var qy = jy((e) => {
	e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCDate(e.getUTCDate() + t);
}, (e, t) => (t - e) / Iy, (e) => Math.floor(e / Iy));
qy.range;
// ../../../peach/frontend/node_modules/d3-time/src/week.js
function Jy(e) {
	return jy((t) => {
		t.setDate(t.getDate() - (t.getDay() + 7 - e) % 7), t.setHours(0, 0, 0, 0);
	}, (e, t) => {
		e.setDate(e.getDate() + t * 7);
	}, (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * Py) / Ly);
}
var Yy = Jy(0), Xy = Jy(1), Zy = Jy(2), Qy = Jy(3), $y = Jy(4), eb = Jy(5), tb = Jy(6);
Yy.range, Xy.range, Zy.range, Qy.range, $y.range, eb.range, tb.range;
function nb(e) {
	return jy((t) => {
		t.setUTCDate(t.getUTCDate() - (t.getUTCDay() + 7 - e) % 7), t.setUTCHours(0, 0, 0, 0);
	}, (e, t) => {
		e.setUTCDate(e.getUTCDate() + t * 7);
	}, (e, t) => (t - e) / Ly);
}
var rb = nb(0), ib = nb(1), ab = nb(2), ob = nb(3), sb = nb(4), cb = nb(5), lb = nb(6);
rb.range, ib.range, ab.range, ob.range, sb.range, cb.range, lb.range;
// ../../../peach/frontend/node_modules/d3-time/src/month.js
var ub = jy((e) => {
	e.setDate(1), e.setHours(0, 0, 0, 0);
}, (e, t) => {
	e.setMonth(e.getMonth() + t);
}, (e, t) => t.getMonth() - e.getMonth() + (t.getFullYear() - e.getFullYear()) * 12, (e) => e.getMonth());
ub.range;
var db = jy((e) => {
	e.setUTCDate(1), e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCMonth(e.getUTCMonth() + t);
}, (e, t) => t.getUTCMonth() - e.getUTCMonth() + (t.getUTCFullYear() - e.getUTCFullYear()) * 12, (e) => e.getUTCMonth());
db.range;
// ../../../peach/frontend/node_modules/d3-time/src/year.js
var fb = jy((e) => {
	e.setMonth(0, 1), e.setHours(0, 0, 0, 0);
}, (e, t) => {
	e.setFullYear(e.getFullYear() + t);
}, (e, t) => t.getFullYear() - e.getFullYear(), (e) => e.getFullYear());
fb.every = (e) => !isFinite(e = Math.floor(e)) || !(e > 0) ? null : jy((t) => {
	t.setFullYear(Math.floor(t.getFullYear() / e) * e), t.setMonth(0, 1), t.setHours(0, 0, 0, 0);
}, (t, n) => {
	t.setFullYear(t.getFullYear() + n * e);
}), fb.range;
var pb = jy((e) => {
	e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCFullYear(e.getUTCFullYear() + t);
}, (e, t) => t.getUTCFullYear() - e.getUTCFullYear(), (e) => e.getUTCFullYear());
pb.every = (e) => !isFinite(e = Math.floor(e)) || !(e > 0) ? null : jy((t) => {
	t.setUTCFullYear(Math.floor(t.getUTCFullYear() / e) * e), t.setUTCMonth(0, 1), t.setUTCHours(0, 0, 0, 0);
}, (t, n) => {
	t.setUTCFullYear(t.getUTCFullYear() + n * e);
}), pb.range;
// ../../../peach/frontend/node_modules/d3-time/src/ticks.js
function mb(e, t, n, r, i, a) {
	let o = [
		[
			By,
			1,
			Ny
		],
		[
			By,
			5,
			5 * Ny
		],
		[
			By,
			15,
			15 * Ny
		],
		[
			By,
			30,
			30 * Ny
		],
		[
			a,
			1,
			Py
		],
		[
			a,
			5,
			5 * Py
		],
		[
			a,
			15,
			15 * Py
		],
		[
			a,
			30,
			30 * Py
		],
		[
			i,
			1,
			Fy
		],
		[
			i,
			3,
			3 * Fy
		],
		[
			i,
			6,
			6 * Fy
		],
		[
			i,
			12,
			12 * Fy
		],
		[
			r,
			1,
			Iy
		],
		[
			r,
			2,
			2 * Iy
		],
		[
			n,
			1,
			Ly
		],
		[
			t,
			1,
			Ry
		],
		[
			t,
			3,
			3 * Ry
		],
		[
			e,
			1,
			zy
		]
	];
	function s(e, t, n) {
		let r = t < e;
		r && ([e, t] = [t, e]);
		let i = n && typeof n.range == "function" ? n : c(e, t, n), a = i ? i.range(e, +t + 1) : [];
		return r ? a.reverse() : a;
	}
	function c(t, n, r) {
		let i = Math.abs(n - t) / r, a = Fg(([, , e]) => e).right(o, i);
		if (a === o.length) return e.every(Zg(t / zy, n / zy, r));
		if (a === 0) return My.every(Math.max(Zg(t, n, r), 1));
		let [s, c] = o[i / o[a - 1][2] < o[a][2] / i ? a - 1 : a];
		return s.every(c);
	}
	return [s, c];
}
var [hb, gb] = mb(pb, db, rb, qy, Wy, Hy), [_b, vb] = mb(fb, ub, Yy, Gy, Uy, Vy);
// ../../../peach/frontend/node_modules/d3-time-format/src/locale.js
function yb(e) {
	if (0 <= e.y && e.y < 100) {
		var t = new Date(-1, e.m, e.d, e.H, e.M, e.S, e.L);
		return t.setFullYear(e.y), t;
	}
	return new Date(e.y, e.m, e.d, e.H, e.M, e.S, e.L);
}
function bb(e) {
	if (0 <= e.y && e.y < 100) {
		var t = new Date(Date.UTC(-1, e.m, e.d, e.H, e.M, e.S, e.L));
		return t.setUTCFullYear(e.y), t;
	}
	return new Date(Date.UTC(e.y, e.m, e.d, e.H, e.M, e.S, e.L));
}
function xb(e, t, n) {
	return {
		y: e,
		m: t,
		d: n,
		H: 0,
		M: 0,
		S: 0,
		L: 0
	};
}
function Sb(e) {
	var t = e.dateTime, n = e.date, r = e.time, i = e.periods, a = e.days, o = e.shortDays, s = e.months, c = e.shortMonths, l = Ob(i), u = kb(i), d = Ob(a), f = kb(a), p = Ob(o), m = kb(o), h = Ob(s), g = kb(s), _ = Ob(c), v = kb(c), y = {
		a: N,
		A: ee,
		b: te,
		B: ne,
		c: null,
		d: Xb,
		e: Xb,
		f: tx,
		g: fx,
		G: mx,
		H: Zb,
		I: Qb,
		j: $b,
		L: ex,
		m: nx,
		M: rx,
		p: re,
		q: ie,
		Q: Lx,
		s: Rx,
		S: ix,
		u: ax,
		U: ox,
		V: cx,
		w: lx,
		W: ux,
		x: null,
		X: null,
		y: dx,
		Y: px,
		Z: hx,
		"%": Ix
	}, b = {
		a: ae,
		A: oe,
		b: se,
		B: ce,
		c: null,
		d: gx,
		e: gx,
		f: xx,
		g: Mx,
		G: Px,
		H: _x,
		I: vx,
		j: yx,
		L: bx,
		m: Sx,
		M: Cx,
		p: le,
		q: ue,
		Q: Lx,
		s: Rx,
		S: wx,
		u: Tx,
		U: Ex,
		V: Ox,
		w: kx,
		W: Ax,
		x: null,
		X: null,
		y: jx,
		Y: Nx,
		Z: Fx,
		"%": Ix
	}, x = {
		a: E,
		A: D,
		b: O,
		B: k,
		c: A,
		d: Bb,
		e: Bb,
		f: Kb,
		g: Ib,
		G: Fb,
		H: Hb,
		I: Hb,
		j: Vb,
		L: Gb,
		m: zb,
		M: Ub,
		p: T,
		q: Rb,
		Q: Jb,
		s: Yb,
		S: Wb,
		u: jb,
		U: Mb,
		V: Nb,
		w: Ab,
		W: Pb,
		x: j,
		X: M,
		y: Ib,
		Y: Fb,
		Z: Lb,
		"%": qb
	};
	y.x = S(n, y), y.X = S(r, y), y.c = S(t, y), b.x = S(n, b), b.X = S(r, b), b.c = S(t, b);
	function S(e, t) {
		return function(n) {
			var r = [], i = -1, a = 0, o = e.length, s, c, l;
			for (n instanceof Date || (n = /* @__PURE__ */ new Date(+n)); ++i < o;) e.charCodeAt(i) === 37 && (r.push(e.slice(a, i)), (c = Cb[s = e.charAt(++i)]) == null ? c = s === "e" ? " " : "0" : s = e.charAt(++i), (l = t[s]) && (s = l(n, c)), r.push(s), a = i + 1);
			return r.push(e.slice(a, i)), r.join("");
		};
	}
	function C(e, t) {
		return function(n) {
			var r = xb(1900, void 0, 1), i = w(r, e, n += "", 0), a, o;
			if (i != n.length) return null;
			if ("Q" in r) return new Date(r.Q);
			if ("s" in r) return new Date(r.s * 1e3 + ("L" in r ? r.L : 0));
			if (t && !("Z" in r) && (r.Z = 0), "p" in r && (r.H = r.H % 12 + r.p * 12), r.m === void 0 && (r.m = "q" in r ? r.q : 0), "V" in r) {
				if (r.V < 1 || r.V > 53) return null;
				"w" in r || (r.w = 1), "Z" in r ? (a = bb(xb(r.y, 0, 1)), o = a.getUTCDay(), a = o > 4 || o === 0 ? ib.ceil(a) : ib(a), a = Ky.offset(a, (r.V - 1) * 7), r.y = a.getUTCFullYear(), r.m = a.getUTCMonth(), r.d = a.getUTCDate() + (r.w + 6) % 7) : (a = yb(xb(r.y, 0, 1)), o = a.getDay(), a = o > 4 || o === 0 ? Xy.ceil(a) : Xy(a), a = Gy.offset(a, (r.V - 1) * 7), r.y = a.getFullYear(), r.m = a.getMonth(), r.d = a.getDate() + (r.w + 6) % 7);
			} else ("W" in r || "U" in r) && ("w" in r || (r.w = "u" in r ? r.u % 7 : +("W" in r)), o = "Z" in r ? bb(xb(r.y, 0, 1)).getUTCDay() : yb(xb(r.y, 0, 1)).getDay(), r.m = 0, r.d = "W" in r ? (r.w + 6) % 7 + r.W * 7 - (o + 5) % 7 : r.w + r.U * 7 - (o + 6) % 7);
			return "Z" in r ? (r.H += r.Z / 100 | 0, r.M += r.Z % 100, bb(r)) : yb(r);
		};
	}
	function w(e, t, n, r) {
		for (var i = 0, a = t.length, o = n.length, s, c; i < a;) {
			if (r >= o) return -1;
			if (s = t.charCodeAt(i++), s === 37) {
				if (s = t.charAt(i++), c = x[s in Cb ? t.charAt(i++) : s], !c || (r = c(e, n, r)) < 0) return -1;
			} else if (s != n.charCodeAt(r++)) return -1;
		}
		return r;
	}
	function T(e, t, n) {
		var r = l.exec(t.slice(n));
		return r ? (e.p = u.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function E(e, t, n) {
		var r = p.exec(t.slice(n));
		return r ? (e.w = m.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function D(e, t, n) {
		var r = d.exec(t.slice(n));
		return r ? (e.w = f.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function O(e, t, n) {
		var r = _.exec(t.slice(n));
		return r ? (e.m = v.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function k(e, t, n) {
		var r = h.exec(t.slice(n));
		return r ? (e.m = g.get(r[0].toLowerCase()), n + r[0].length) : -1;
	}
	function A(e, n, r) {
		return w(e, t, n, r);
	}
	function j(e, t, r) {
		return w(e, n, t, r);
	}
	function M(e, t, n) {
		return w(e, r, t, n);
	}
	function N(e) {
		return o[e.getDay()];
	}
	function ee(e) {
		return a[e.getDay()];
	}
	function te(e) {
		return c[e.getMonth()];
	}
	function ne(e) {
		return s[e.getMonth()];
	}
	function re(e) {
		return i[+(e.getHours() >= 12)];
	}
	function ie(e) {
		return 1 + ~~(e.getMonth() / 3);
	}
	function ae(e) {
		return o[e.getUTCDay()];
	}
	function oe(e) {
		return a[e.getUTCDay()];
	}
	function se(e) {
		return c[e.getUTCMonth()];
	}
	function ce(e) {
		return s[e.getUTCMonth()];
	}
	function le(e) {
		return i[+(e.getUTCHours() >= 12)];
	}
	function ue(e) {
		return 1 + ~~(e.getUTCMonth() / 3);
	}
	return {
		format: function(e) {
			var t = S(e += "", y);
			return t.toString = function() {
				return e;
			}, t;
		},
		parse: function(e) {
			var t = C(e += "", !1);
			return t.toString = function() {
				return e;
			}, t;
		},
		utcFormat: function(e) {
			var t = S(e += "", b);
			return t.toString = function() {
				return e;
			}, t;
		},
		utcParse: function(e) {
			var t = C(e += "", !0);
			return t.toString = function() {
				return e;
			}, t;
		}
	};
}
var Cb = {
	"-": "",
	_: " ",
	0: "0"
}, wb = /^\s*\d+/, Tb = /^%/, Eb = /[\\^$*+?|[\]().{}]/g;
function Z(e, t, n) {
	var r = e < 0 ? "-" : "", i = (r ? -e : e) + "", a = i.length;
	return r + (a < n ? Array(n - a + 1).join(t) + i : i);
}
function Db(e) {
	return e.replace(Eb, "\\$&");
}
function Ob(e) {
	return RegExp("^(?:" + e.map(Db).join("|") + ")", "i");
}
function kb(e) {
	return new Map(e.map((e, t) => [e.toLowerCase(), t]));
}
function Ab(e, t, n) {
	var r = wb.exec(t.slice(n, n + 1));
	return r ? (e.w = +r[0], n + r[0].length) : -1;
}
function jb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 1));
	return r ? (e.u = +r[0], n + r[0].length) : -1;
}
function Mb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.U = +r[0], n + r[0].length) : -1;
}
function Nb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.V = +r[0], n + r[0].length) : -1;
}
function Pb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.W = +r[0], n + r[0].length) : -1;
}
function Fb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 4));
	return r ? (e.y = +r[0], n + r[0].length) : -1;
}
function Ib(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.y = +r[0] + (+r[0] > 68 ? 1900 : 2e3), n + r[0].length) : -1;
}
function Lb(e, t, n) {
	var r = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(n, n + 6));
	return r ? (e.Z = r[1] ? 0 : -(r[2] + (r[3] || "00")), n + r[0].length) : -1;
}
function Rb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 1));
	return r ? (e.q = r[0] * 3 - 3, n + r[0].length) : -1;
}
function zb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.m = r[0] - 1, n + r[0].length) : -1;
}
function Bb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.d = +r[0], n + r[0].length) : -1;
}
function Vb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 3));
	return r ? (e.m = 0, e.d = +r[0], n + r[0].length) : -1;
}
function Hb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.H = +r[0], n + r[0].length) : -1;
}
function Ub(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.M = +r[0], n + r[0].length) : -1;
}
function Wb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 2));
	return r ? (e.S = +r[0], n + r[0].length) : -1;
}
function Gb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 3));
	return r ? (e.L = +r[0], n + r[0].length) : -1;
}
function Kb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 6));
	return r ? (e.L = Math.floor(r[0] / 1e3), n + r[0].length) : -1;
}
function qb(e, t, n) {
	var r = Tb.exec(t.slice(n, n + 1));
	return r ? n + r[0].length : -1;
}
function Jb(e, t, n) {
	var r = wb.exec(t.slice(n));
	return r ? (e.Q = +r[0], n + r[0].length) : -1;
}
function Yb(e, t, n) {
	var r = wb.exec(t.slice(n));
	return r ? (e.s = +r[0], n + r[0].length) : -1;
}
function Xb(e, t) {
	return Z(e.getDate(), t, 2);
}
function Zb(e, t) {
	return Z(e.getHours(), t, 2);
}
function Qb(e, t) {
	return Z(e.getHours() % 12 || 12, t, 2);
}
function $b(e, t) {
	return Z(1 + Gy.count(fb(e), e), t, 3);
}
function ex(e, t) {
	return Z(e.getMilliseconds(), t, 3);
}
function tx(e, t) {
	return ex(e, t) + "000";
}
function nx(e, t) {
	return Z(e.getMonth() + 1, t, 2);
}
function rx(e, t) {
	return Z(e.getMinutes(), t, 2);
}
function ix(e, t) {
	return Z(e.getSeconds(), t, 2);
}
function ax(e) {
	var t = e.getDay();
	return t === 0 ? 7 : t;
}
function ox(e, t) {
	return Z(Yy.count(fb(e) - 1, e), t, 2);
}
function sx(e) {
	var t = e.getDay();
	return t >= 4 || t === 0 ? $y(e) : $y.ceil(e);
}
function cx(e, t) {
	return e = sx(e), Z($y.count(fb(e), e) + (fb(e).getDay() === 4), t, 2);
}
function lx(e) {
	return e.getDay();
}
function ux(e, t) {
	return Z(Xy.count(fb(e) - 1, e), t, 2);
}
function dx(e, t) {
	return Z(e.getFullYear() % 100, t, 2);
}
function fx(e, t) {
	return e = sx(e), Z(e.getFullYear() % 100, t, 2);
}
function px(e, t) {
	return Z(e.getFullYear() % 1e4, t, 4);
}
function mx(e, t) {
	var n = e.getDay();
	return e = n >= 4 || n === 0 ? $y(e) : $y.ceil(e), Z(e.getFullYear() % 1e4, t, 4);
}
function hx(e) {
	var t = e.getTimezoneOffset();
	return (t > 0 ? "-" : (t *= -1, "+")) + Z(t / 60 | 0, "0", 2) + Z(t % 60, "0", 2);
}
function gx(e, t) {
	return Z(e.getUTCDate(), t, 2);
}
function _x(e, t) {
	return Z(e.getUTCHours(), t, 2);
}
function vx(e, t) {
	return Z(e.getUTCHours() % 12 || 12, t, 2);
}
function yx(e, t) {
	return Z(1 + Ky.count(pb(e), e), t, 3);
}
function bx(e, t) {
	return Z(e.getUTCMilliseconds(), t, 3);
}
function xx(e, t) {
	return bx(e, t) + "000";
}
function Sx(e, t) {
	return Z(e.getUTCMonth() + 1, t, 2);
}
function Cx(e, t) {
	return Z(e.getUTCMinutes(), t, 2);
}
function wx(e, t) {
	return Z(e.getUTCSeconds(), t, 2);
}
function Tx(e) {
	var t = e.getUTCDay();
	return t === 0 ? 7 : t;
}
function Ex(e, t) {
	return Z(rb.count(pb(e) - 1, e), t, 2);
}
function Dx(e) {
	var t = e.getUTCDay();
	return t >= 4 || t === 0 ? sb(e) : sb.ceil(e);
}
function Ox(e, t) {
	return e = Dx(e), Z(sb.count(pb(e), e) + (pb(e).getUTCDay() === 4), t, 2);
}
function kx(e) {
	return e.getUTCDay();
}
function Ax(e, t) {
	return Z(ib.count(pb(e) - 1, e), t, 2);
}
function jx(e, t) {
	return Z(e.getUTCFullYear() % 100, t, 2);
}
function Mx(e, t) {
	return e = Dx(e), Z(e.getUTCFullYear() % 100, t, 2);
}
function Nx(e, t) {
	return Z(e.getUTCFullYear() % 1e4, t, 4);
}
function Px(e, t) {
	var n = e.getUTCDay();
	return e = n >= 4 || n === 0 ? sb(e) : sb.ceil(e), Z(e.getUTCFullYear() % 1e4, t, 4);
}
function Fx() {
	return "+0000";
}
function Ix() {
	return "%";
}
function Lx(e) {
	return +e;
}
function Rx(e) {
	return Math.floor(e / 1e3);
}
// ../../../peach/frontend/node_modules/d3-time-format/src/defaultLocale.js
var zx, Bx, Vx;
Hx({
	dateTime: "%x, %X",
	date: "%-m/%-d/%Y",
	time: "%-I:%M:%S %p",
	periods: ["AM", "PM"],
	days: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	],
	shortDays: [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	],
	months: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	shortMonths: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	]
});
function Hx(e) {
	return zx = Sb(e), Bx = zx.format, zx.parse, Vx = zx.utcFormat, zx.utcParse, zx;
}
// ../../../peach/frontend/node_modules/d3-scale/src/time.js
function Ux(e) {
	return new Date(e);
}
function Wx(e) {
	return e instanceof Date ? +e : +/* @__PURE__ */ new Date(+e);
}
function Gx(e, t, n, r, i, a, o, s, c, l) {
	var u = Dv(), d = u.invert, f = u.domain, p = l(".%L"), m = l(":%S"), h = l("%I:%M"), g = l("%I %p"), _ = l("%a %d"), v = l("%b %d"), y = l("%B"), b = l("%Y");
	function x(e) {
		return (c(e) < e ? p : s(e) < e ? m : o(e) < e ? h : a(e) < e ? g : r(e) < e ? i(e) < e ? _ : v : n(e) < e ? y : b)(e);
	}
	return u.invert = function(e) {
		return new Date(d(e));
	}, u.domain = function(e) {
		return arguments.length ? f(Array.from(e, Wx)) : f().map(Ux);
	}, u.ticks = function(t) {
		var n = f();
		return e(n[0], n[n.length - 1], t ?? 10);
	}, u.tickFormat = function(e, t) {
		return t == null ? x : l(t);
	}, u.nice = function(e) {
		var n = f();
		return e && typeof e.range == "function" || (e = t(n[0], n[n.length - 1], e ?? 10)), e ? f(ny(n, e)) : u;
	}, u.copy = function() {
		return Tv(u, Gx(e, t, n, r, i, a, o, s, c, l));
	}, u;
}
function Kx() {
	return a_.apply(Gx(_b, vb, fb, ub, Yy, Gy, Uy, Vy, By, Bx).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/utcTime.js
function qx() {
	return a_.apply(Gx(hb, gb, pb, db, rb, Ky, Wy, Hy, By, Vx).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/sequential.js
function Jx() {
	var e = 0, t = 1, n, r, i, a, o = bv, s = !1, c;
	function l(e) {
		return e == null || isNaN(e = +e) ? c : o(i === 0 ? .5 : (e = (a(e) - n) * i, s ? Math.max(0, Math.min(1, e)) : e));
	}
	l.domain = function(o) {
		return arguments.length ? ([e, t] = o, n = a(e = +e), r = a(t = +t), i = n === r ? 0 : 1 / (r - n), l) : [e, t];
	}, l.clamp = function(e) {
		return arguments.length ? (s = !!e, l) : s;
	}, l.interpolator = function(e) {
		return arguments.length ? (o = e, l) : o;
	};
	function u(e) {
		return function(t) {
			var n, r;
			return arguments.length ? ([n, r] = t, o = e(n, r), l) : [o(0), o(1)];
		};
	}
	return l.range = u(mv), l.rangeRound = u(hv), l.unknown = function(e) {
		return arguments.length ? (c = e, l) : c;
	}, function(o) {
		return a = o, n = o(e), r = o(t), i = n === r ? 0 : 1 / (r - n), l;
	};
}
function Yx(e, t) {
	return t.domain(e.domain()).interpolator(e.interpolator()).clamp(e.clamp()).unknown(e.unknown());
}
function Xx() {
	var e = $v(Jx()(bv));
	return e.copy = function() {
		return Yx(e, Xx());
	}, o_.apply(e, arguments);
}
function Zx() {
	var e = dy(Jx()).domain([1, 10]);
	return e.copy = function() {
		return Yx(e, Zx()).base(e.base());
	}, o_.apply(e, arguments);
}
function Qx() {
	var e = hy(Jx());
	return e.copy = function() {
		return Yx(e, Qx()).constant(e.constant());
	}, o_.apply(e, arguments);
}
function $x() {
	var e = by(Jx());
	return e.copy = function() {
		return Yx(e, $x()).exponent(e.exponent());
	}, o_.apply(e, arguments);
}
function eS() {
	return $x.apply(null, arguments).exponent(.5);
}
// ../../../peach/frontend/node_modules/d3-scale/src/sequentialQuantile.js
function tS() {
	var e = [], t = bv;
	function n(n) {
		if (n != null && !isNaN(n = +n)) return t((Bg(e, n, 1) - 1) / (e.length - 1));
	}
	return n.domain = function(t) {
		if (!arguments.length) return e.slice();
		e = [];
		for (let n of t) n != null && !isNaN(n = +n) && e.push(n);
		return e.sort(Pg), n;
	}, n.interpolator = function(e) {
		return arguments.length ? (t = e, n) : t;
	}, n.range = function() {
		return e.map((n, r) => t(r / (e.length - 1)));
	}, n.quantiles = function(t) {
		return Array.from({ length: t + 1 }, (n, r) => n_(e, r / t));
	}, n.copy = function() {
		return tS(t).domain(e);
	}, o_.apply(n, arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/diverging.js
function nS() {
	var e = 0, t = .5, n = 1, r = 1, i, a, o, s, c, l = bv, u, d = !1, f;
	function p(e) {
		return isNaN(e = +e) ? f : (e = .5 + ((e = +u(e)) - a) * (r * e < r * a ? s : c), l(d ? Math.max(0, Math.min(1, e)) : e));
	}
	p.domain = function(l) {
		return arguments.length ? ([e, t, n] = l, i = u(e = +e), a = u(t = +t), o = u(n = +n), s = i === a ? 0 : .5 / (a - i), c = a === o ? 0 : .5 / (o - a), r = a < i ? -1 : 1, p) : [
			e,
			t,
			n
		];
	}, p.clamp = function(e) {
		return arguments.length ? (d = !!e, p) : d;
	}, p.interpolator = function(e) {
		return arguments.length ? (l = e, p) : l;
	};
	function m(e) {
		return function(t) {
			var n, r, i;
			return arguments.length ? ([n, r, i] = t, l = gv(e, [
				n,
				r,
				i
			]), p) : [
				l(0),
				l(.5),
				l(1)
			];
		};
	}
	return p.range = m(mv), p.rangeRound = m(hv), p.unknown = function(e) {
		return arguments.length ? (f = e, p) : f;
	}, function(l) {
		return u = l, i = l(e), a = l(t), o = l(n), s = i === a ? 0 : .5 / (a - i), c = a === o ? 0 : .5 / (o - a), r = a < i ? -1 : 1, p;
	};
}
function rS() {
	var e = $v(nS()(bv));
	return e.copy = function() {
		return Yx(e, rS());
	}, o_.apply(e, arguments);
}
function iS() {
	var e = dy(nS()).domain([
		.1,
		1,
		10
	]);
	return e.copy = function() {
		return Yx(e, iS()).base(e.base());
	}, o_.apply(e, arguments);
}
function aS() {
	var e = hy(nS());
	return e.copy = function() {
		return Yx(e, aS()).constant(e.constant());
	}, o_.apply(e, arguments);
}
function oS() {
	var e = by(nS());
	return e.copy = function() {
		return Yx(e, oS()).exponent(e.exponent());
	}, o_.apply(e, arguments);
}
function sS() {
	return oS.apply(null, arguments).exponent(.5);
}
// ../../../peach/frontend/node_modules/victory-vendor/es/d3-scale.js
var cS = /* @__PURE__ */ E({
	scaleBand: () => l_,
	scaleDiverging: () => rS,
	scaleDivergingLog: () => iS,
	scaleDivergingPow: () => oS,
	scaleDivergingSqrt: () => sS,
	scaleDivergingSymlog: () => aS,
	scaleIdentity: () => ty,
	scaleImplicit: () => s_,
	scaleLinear: () => ey,
	scaleLog: () => fy,
	scaleOrdinal: () => c_,
	scalePoint: () => d_,
	scalePow: () => xy,
	scaleQuantile: () => Ey,
	scaleQuantize: () => Dy,
	scaleRadial: () => Ty,
	scaleSequential: () => Xx,
	scaleSequentialLog: () => Zx,
	scaleSequentialPow: () => $x,
	scaleSequentialQuantile: () => tS,
	scaleSequentialSqrt: () => eS,
	scaleSequentialSymlog: () => Qx,
	scaleSqrt: () => Sy,
	scaleSymlog: () => gy,
	scaleThreshold: () => Oy,
	scaleTime: () => Kx,
	scaleUtc: () => qx,
	tickFormat: () => Qv
});
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineConfiguredScale.js
function lS(e) {
	var t = cS;
	if (e in t && typeof t[e] == "function") return t[e]();
	var n = `scale${Wt(e)}`;
	if (n in t && typeof t[n] == "function") return t[n]();
}
function uS(e, t, n) {
	if (typeof e == "function") return e.copy().domain(t).range(n);
	if (e != null) {
		var r = lS(e);
		if (r != null) return r.domain(t).range(n), r;
	}
}
function dS(e, t, n, r) {
	if (n != null && r != null) return typeof e.scale == "function" ? uS(e.scale, n, r) : uS(t, n, r);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineRealScaleType.js
function fS(e) {
	return `scale${Wt(e)}`;
}
function pS(e) {
	return fS(e) in cS;
}
var mS = (e, t, n) => {
	if (e != null) {
		var r = e.scale, i = e.type;
		if (r === "auto") return i === "category" && n && (n.indexOf("LineChart") >= 0 || n.indexOf("AreaChart") >= 0 || n.indexOf("ComposedChart") >= 0 && !t) ? "point" : i === "category" ? "band" : "linear";
		if (typeof r == "string") return pS(r) ? r : "point";
	}
};
// ../../../peach/frontend/node_modules/recharts/es6/util/scale/createCategoricalInverse.js
function hS(e, t) {
	for (var n = 0, r = e.length, i = e[0] < e[e.length - 1]; n < r;) {
		var a = Math.floor((n + r) / 2);
		(i ? e[a] < t : e[a] > t) ? n = a + 1 : r = a;
	}
	return n;
}
function gS(e, t) {
	if (e) {
		var n = t ?? e.domain(), r = n.map((t) => e(t) ?? 0), i = e.range();
		if (!(n.length === 0 || i.length < 2)) return (e) => {
			var t = hS(r, e);
			if (t <= 0) return n[0];
			if (t >= n.length) return n[n.length - 1];
			var i = r[t - 1] ?? 0, a = r[t] ?? 0;
			return Math.abs(e - i) <= Math.abs(e - a) ? n[t - 1] : n[t];
		};
	}
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineInverseScaleFunction.js
function _S(e) {
	if (e != null) return "invert" in e && typeof e.invert == "function" ? e.invert.bind(e) : gS(e, void 0);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/axisSelectors.js
function vS(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function yS(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? vS(Object(n), !0).forEach(function(t) {
			bS(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : vS(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function bS(e, t, n) {
	return (t = xS(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function xS(e) {
	var t = SS(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function SS(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function CS(e, t) {
	return OS(e) || DS(e, t) || TS(e, t) || wS();
}
function wS() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function TS(e, t) {
	if (e) {
		if (typeof e == "string") return ES(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ES(e, t) : void 0;
	}
}
function ES(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function DS(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function OS(e) {
	if (Array.isArray(e)) return e;
}
var kS = [0, "auto"], AS = {
	allowDataOverflow: !1,
	allowDecimals: !0,
	allowDuplicatedCategory: !0,
	angle: 0,
	dataKey: void 0,
	domain: void 0,
	height: 30,
	hide: !0,
	id: 0,
	includeHidden: !1,
	interval: "preserveEnd",
	minTickGap: 5,
	mirror: !1,
	name: void 0,
	orientation: "bottom",
	padding: {
		left: 0,
		right: 0
	},
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickCount: 5,
	tickFormatter: void 0,
	ticks: void 0,
	type: "category",
	unit: void 0,
	niceTicks: "auto"
}, jS = (e, t) => e.cartesianAxis.xAxis[t], MS = (e, t) => jS(e, t) ?? AS, NS = {
	allowDataOverflow: !1,
	allowDecimals: !0,
	allowDuplicatedCategory: !0,
	angle: 0,
	dataKey: void 0,
	domain: kS,
	hide: !0,
	id: 0,
	includeHidden: !1,
	interval: "preserveEnd",
	minTickGap: 5,
	mirror: !1,
	name: void 0,
	orientation: "left",
	padding: {
		top: 0,
		bottom: 0
	},
	reversed: !1,
	scale: "auto",
	tick: !0,
	tickCount: 5,
	tickFormatter: void 0,
	ticks: void 0,
	type: "number",
	unit: void 0,
	niceTicks: "auto",
	width: 60
}, PS = (e, t) => e.cartesianAxis.yAxis[t], FS = (e, t) => PS(e, t) ?? NS, IS = {
	domain: [0, "auto"],
	includeHidden: !1,
	reversed: !1,
	allowDataOverflow: !1,
	allowDuplicatedCategory: !1,
	dataKey: void 0,
	id: 0,
	name: "",
	range: [64, 64],
	scale: "auto",
	type: "number",
	unit: ""
}, LS = (e, t) => e.cartesianAxis.zAxis[t] ?? IS, Q = (e, t, n) => {
	switch (t) {
		case "xAxis": return MS(e, n);
		case "yAxis": return FS(e, n);
		case "zAxis": return LS(e, n);
		case "angleAxis": return fg(e, n);
		case "radiusAxis": return pg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, RS = (e, t, n) => {
	switch (t) {
		case "xAxis": return MS(e, n);
		case "yAxis": return FS(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, zS = (e, t, n) => {
	switch (t) {
		case "xAxis": return MS(e, n);
		case "yAxis": return FS(e, n);
		case "angleAxis": return fg(e, n);
		case "radiusAxis": return pg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, BS = (e) => e.graphicalItems.cartesianItems.some((e) => e.type === "bar") || e.graphicalItems.polarItems.some((e) => e.type === "radialBar");
function VS(e, t) {
	return (n) => {
		switch (e) {
			case "xAxis": return "xAxisId" in n && n.xAxisId === t;
			case "yAxis": return "yAxisId" in n && n.yAxisId === t;
			case "zAxis": return "zAxisId" in n && n.zAxisId === t;
			case "angleAxis": return "angleAxisId" in n && n.angleAxisId === t;
			case "radiusAxis": return "radiusAxisId" in n && n.radiusAxisId === t;
			default: return !1;
		}
	};
}
var HS = (e) => e.graphicalItems.cartesianItems, US = H([X, Cg], VS), WS = (e, t, n) => e.filter(n).filter((e) => t?.includeHidden === !0 || !e.hide), GS = H([
	HS,
	Q,
	US
], WS, { memoizeOptions: { resultEqualityCheck: Og } }), KS = H([GS], (e) => e.filter((e) => e.type === "area" || e.type === "bar").filter(Eg)), qS = (e) => e.filter((e) => !("stackId" in e) || e.stackId === void 0), JS = H([GS], qS), YS = (e) => e.map((e) => e.data).filter(Boolean).flat(1), XS = H([GS], (e) => e.some((e) => !e.data)), ZS = H([GS], YS, { memoizeOptions: { resultEqualityCheck: Og } }), QS = (e, t) => {
	var n = t.chartData, r = n === void 0 ? [] : n, i = t.dataStartIndex, a = t.dataEndIndex;
	return e.length > 0 ? e : r.slice(i, a + 1);
}, $S = H([ZS, mh], QS), eC = (e, t, n) => t?.dataKey == null ? n.length > 0 ? n.map((e) => e.dataKey).flatMap((t) => e.map((e) => ({ value: K(e, t) }))) : e.map((e) => ({ value: e })) : e.map((e) => ({ value: K(e, t.dataKey) })), tC = (e, t, n, r, i, a) => {
	var o = r.chartData, s = o === void 0 ? [] : o, c = r.dataStartIndex, l = r.dataEndIndex, u = eC(e, t, n);
	return i && t?.dataKey != null && a.length > 0 ? [...s.slice(c, l + 1).map((e) => ({ value: K(e, t.dataKey) })).filter((e) => e.value != null), ...u] : u;
}, nC = H([
	$S,
	Q,
	GS,
	mh,
	XS,
	ZS
], tC);
function rC(e) {
	if (Rt(e) || e instanceof Date) {
		var t = Number(e);
		if (G(t)) return t;
	}
}
function iC(e) {
	if (Array.isArray(e)) {
		var t = [rC(e[0]), rC(e[1])];
		return Th(t) ? t : void 0;
	}
	var n = rC(e);
	if (n != null) return [n, n];
}
function aC(e) {
	return e.map(rC).filter(Gt);
}
function oC(e, t) {
	var n = rC(e), r = rC(t);
	return n == null && r == null ? 0 : n == null ? -1 : r == null ? 1 : n - r;
}
var sC = H([nC], (e) => e?.map((e) => e.value).sort(oC));
function cC(e, t) {
	switch (e) {
		case "xAxis": return t.direction === "x";
		case "yAxis": return t.direction === "y";
		default: return !1;
	}
}
function lC(e, t, n) {
	if (!n || !n.length) return [];
	var r;
	if (typeof t == "number" && !It(t)) r = t;
	else if (Array.isArray(t)) {
		var i = aC(t);
		i.length > 0 && (r = Math.max(...i));
	}
	return r == null ? [] : aC(n.flatMap((t) => {
		var n = K(e, t.dataKey), i, a;
		if (Array.isArray(n)) {
			var o = CS(n, 2);
			i = o[0], a = o[1];
		} else i = a = n;
		if (G(i) && G(a)) return [r - i, r + a];
	}));
}
var uC = (e) => zS(e, Ag(e), jg(e)), dC = H([uC], (e) => e?.dataKey), fC = H([
	KS,
	mh,
	uC
], Tg), pC = (e, t, n, r) => {
	var i = t.reduce((e, t) => {
		if (t.stackId == null) return e;
		var n = e[t.stackId];
		return n ??= [], n.push(t), e[t.stackId] = n, e;
	}, {});
	return Object.fromEntries(Object.entries(i).map((t) => {
		var i = CS(t, 2), a = i[0], o = i[1], s = r ? [...o].reverse() : o;
		return [a, {
			stackedData: xl(e, s.map(wg), n),
			graphicalItems: s
		}];
	}));
}, mC = H([
	fC,
	KS,
	Jh,
	Yh
], pC), hC = (e, t, n, r) => {
	var i = t.dataStartIndex, a = t.dataEndIndex;
	if (r == null && n !== "zAxis") return Ol(e, i, a);
}, gC = H([Q], (e) => e.allowDataOverflow), _C = (e) => {
	if (e == null || !("domain" in e)) return kS;
	if (e.domain != null) return e.domain;
	if ("ticks" in e && e.ticks != null) {
		if (e.type === "number") {
			var t = aC(e.ticks);
			return [Math.min(...t), Math.max(...t)];
		}
		if (e.type === "category") return e.ticks.map(String);
	}
	return e?.domain ?? kS;
}, vC = H([Q], _C), yC = H([vC, gC], Dh), bC = H([
	mC,
	fh,
	X,
	yC
], hC, { memoizeOptions: { resultEqualityCheck: Dg } }), xC = (e) => e.errorBars, SC = (e, t, n) => e.flatMap((e) => t[e.id]).filter(Boolean).filter((e) => cC(n, e)), CC = function() {
	var e = [...arguments].filter(Boolean);
	if (e.length !== 0) {
		var t = e.flat();
		return [Math.min(...t), Math.max(...t)];
	}
}, wC = function(e, t, n, r, i) {
	var a = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : [], o, s;
	if (n.length > 0 && n.forEach((e) => {
		var n = e.data == null ? a : [...e.data], c = r[e.id]?.filter((e) => cC(i, e));
		n.forEach((n) => {
			var r = K(n, t.dataKey ?? e.dataKey), i = lC(n, r, c);
			if (i.length >= 2) {
				var a = Math.min(...i), l = Math.max(...i);
				(o == null || a < o) && (o = a), (s == null || l > s) && (s = l);
			}
			var u = iC(r);
			u != null && (o = o == null ? u[0] : Math.min(o, u[0]), s = s == null ? u[1] : Math.max(s, u[1]));
		});
	}), t?.dataKey != null && n.length === 0 && e.forEach((e) => {
		var n = iC(K(e, t.dataKey));
		n != null && (o = o == null ? n[0] : Math.min(o, n[0]), s = s == null ? n[1] : Math.max(s, n[1]));
	}), G(o) && G(s)) return [o, s];
}, TC = H([
	$S,
	Q,
	JS,
	xC,
	X,
	gh
], wC, { memoizeOptions: { resultEqualityCheck: Dg } });
function EC(e) {
	var t = e.value;
	if (Rt(t) || t instanceof Date) return t;
}
var DC = (e, t, n) => {
	var r = e.map(EC).filter((e) => e != null);
	return n && (t.dataKey == null || t.allowDuplicatedCategory && Ht(r)) ? dh(0, e.length) : t.allowDuplicatedCategory ? r : Array.from(new Set(r));
}, OC = (e) => e.referenceElements.dots, kC = (e, t, n) => e.filter((e) => e.ifOverflow === "extendDomain").filter((e) => t === "xAxis" ? e.xAxisId === n : e.yAxisId === n), AC = H([
	OC,
	X,
	Cg
], kC), jC = (e) => e.referenceElements.areas, MC = H([
	jC,
	X,
	Cg
], kC), NC = (e) => e.referenceElements.lines, PC = H([
	NC,
	X,
	Cg
], kC), FC = (e, t) => {
	if (e != null) {
		var n = aC(e.map((e) => t === "xAxis" ? e.x : e.y));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, IC = H(AC, X, FC), LC = (e, t) => {
	if (e != null) {
		var n = aC(e.flatMap((e) => [t === "xAxis" ? e.x1 : e.y1, t === "xAxis" ? e.x2 : e.y2]));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, RC = H([MC, X], LC);
function zC(e) {
	if (e.x != null) return aC([e.x]);
	var t = e.segment?.map((e) => e.x);
	return t == null || t.length === 0 ? [] : aC(t);
}
function BC(e) {
	if (e.y != null) return aC([e.y]);
	var t = e.segment?.map((e) => e.y);
	return t == null || t.length === 0 ? [] : aC(t);
}
var VC = (e, t) => {
	if (e != null) {
		var n = e.flatMap((e) => t === "xAxis" ? zC(e) : BC(e));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, HC = H(IC, H([PC, X], VC), RC, (e, t, n) => CC(e, n, t)), UC = (e, t, n, r, i, a, o, s, c) => {
	if (n != null) return n;
	var l = o === "vertical" && s === "xAxis" || o === "horizontal" && s === "yAxis" ? CC(r, a, i) : CC(a, i), u = Oh(t, l, e.allowDataOverflow);
	return u == null && e.allowDataOverflow && l == null && c != null ? c : u;
}, WC = H([
	Q,
	vC,
	yC,
	bC,
	TC,
	HC,
	q,
	X,
	H([Q], (e) => {
		if (e != null && e.type === "number" && "ticks" in e && e.ticks != null) {
			var t = aC(e.ticks);
			if (t.length !== 0) return [Math.min(...t), Math.max(...t)];
		}
	}, { memoizeOptions: { resultEqualityCheck: Dg } })
], UC, { memoizeOptions: { resultEqualityCheck: Dg } }), GC = [0, 1], KC = (e, t, n, r, i, a, o) => {
	if (e != null && n != null && n.length !== 0 || o !== void 0) {
		var s = e.dataKey, c = e.type, l = gl(t, a);
		return l && s == null ? dh(0, n?.length ?? 0) : c === "category" ? DC(r, e, l) : i === "expand" && !l ? GC : o;
	}
}, qC = H([
	Q,
	q,
	$S,
	nC,
	Jh,
	X,
	WC
], KC), JC = H([
	Q,
	BS,
	Xh
], mS), YC = (e, t, n) => {
	var r = t.niceTicks;
	if (r !== "none") {
		var i = _C(t), a = Array.isArray(i) && (i[0] === "auto" || i[1] === "auto");
		if ((r === "snap125" || r === "adaptive") && t != null && t.tickCount && Th(e)) {
			if (a) return Hh(e, t.tickCount, t.allowDecimals, r);
			if (t.type === "number") return Uh(e, t.tickCount, t.allowDecimals, r);
		}
		if (r === "auto" && n === "linear" && t != null && t.tickCount) {
			if (a && Th(e)) return Hh(e, t.tickCount, t.allowDecimals, "adaptive");
			if (t.type === "number" && Th(e)) return Uh(e, t.tickCount, t.allowDecimals, "adaptive");
		}
	}
}, XC = H([
	qC,
	zS,
	JC
], YC), ZC = (e, t, n, r) => {
	if (r !== "angleAxis" && e?.type === "number" && Th(t) && Array.isArray(n) && n.length > 0) {
		var i = t[0], a = n[0] ?? 0, o = t[1], s = n[n.length - 1] ?? 0;
		return [Math.min(i, a), Math.max(o, s)];
	}
	return t;
}, QC = H([
	Q,
	qC,
	XC,
	X
], ZC), $C = H(H(nC, Q, (e, t) => {
	if (t && t.type === "number") {
		var n = Infinity, r = Array.from(aC(e.map((e) => e.value))).sort((e, t) => e - t), i = r[0], a = r[r.length - 1];
		if (i == null || a == null) return Infinity;
		var o = a - i;
		if (o === 0) return Infinity;
		for (var s = 0; s < r.length - 1; s++) {
			var c = r[s], l = r[s + 1];
			if (c != null && l != null) {
				var u = l - c;
				n = Math.min(n, u);
			}
		}
		return n / o;
	}
}), q, Kh, $l, (e, t, n, r, i) => i, (e, t, n, r, i) => {
	if (!G(e)) return 0;
	var a = t === "vertical" ? r.height : r.width;
	if (i === "gap") return e * a / 2;
	if (i === "no-gap") {
		var o = Vt(n, e * a), s = e * a / 2;
		return s - o - (s - o) / a * o;
	}
	return 0;
}), ew = (e, t, n) => {
	var r = MS(e, t);
	return r == null || typeof r.padding != "string" ? 0 : $C(e, "xAxis", t, n, r.padding);
}, tw = (e, t, n) => {
	var r = FS(e, t);
	return r == null || typeof r.padding != "string" ? 0 : $C(e, "yAxis", t, n, r.padding);
}, nw = H(MS, ew, (e, t) => {
	if (e == null) return {
		left: 0,
		right: 0
	};
	var n = e.padding;
	return typeof n == "string" ? {
		left: t,
		right: t
	} : {
		left: (n.left ?? 0) + t,
		right: (n.right ?? 0) + t
	};
}), rw = H(FS, tw, (e, t) => {
	if (e == null) return {
		top: 0,
		bottom: 0
	};
	var n = e.padding;
	return typeof n == "string" ? {
		top: t,
		bottom: t
	} : {
		top: (n.top ?? 0) + t,
		bottom: (n.bottom ?? 0) + t
	};
}), iw = H([
	$l,
	nw,
	au,
	iu,
	(e, t, n) => n
], (e, t, n, r, i) => {
	var a = r.padding;
	return i ? [a.left, n.width - a.right] : [e.left + t.left, e.left + e.width - t.right];
}), aw = H([
	$l,
	q,
	rw,
	au,
	iu,
	(e, t, n) => n
], (e, t, n, r, i, a) => {
	var o = i.padding;
	return a ? [r.height - o.bottom, o.top] : t === "horizontal" ? [e.top + e.height - n.bottom, e.top + n.top] : [e.top + n.top, e.top + e.height - n.bottom];
}), ow = (e, t, n, r) => {
	switch (t) {
		case "xAxis": return iw(e, n, r);
		case "yAxis": return aw(e, n, r);
		case "zAxis": return LS(e, n)?.range;
		case "angleAxis": return vg(e);
		case "radiusAxis": return bg(e, n);
		default: return;
	}
}, sw = H([Q, ow], rg), cw = H([
	Q,
	JC,
	H([JC, QC], Ng),
	sw
], dS), lw = (e, t, n, r) => {
	if (n != null && n.dataKey != null) {
		var i = n.type, a = n.scale;
		if (gl(e, r) && (i === "number" || a !== "auto")) return t.map((e) => e.value);
	}
}, uw = H([
	q,
	nC,
	zS,
	X
], lw), dw = H([cw], Mg);
H([cw], _S), H([cw, sC], gS), H([
	GS,
	xC,
	X
], SC);
function fw(e, t) {
	return e.id < t.id ? -1 : +(e.id > t.id);
}
var pw = (e, t) => t, mw = (e, t, n) => n, hw = H(Bl, pw, mw, (e, t, n) => e.filter((e) => e.orientation === t).filter((e) => e.mirror === n).sort(fw)), gw = H(Vl, pw, mw, (e, t, n) => e.filter((e) => e.orientation === t).filter((e) => e.mirror === n).sort(fw)), _w = (e, t) => {
	var n = typeof t.height == "number" ? t.height : 30;
	return {
		width: e.width,
		height: n
	};
}, vw = (e, t) => ({
	width: typeof t.width == "number" ? t.width : 60,
	height: e.height
}), yw = H($l, MS, _w), bw = (e, t, n) => {
	switch (t) {
		case "top": return e.top;
		case "bottom": return n - e.bottom;
		default: return 0;
	}
}, xw = (e, t, n) => {
	switch (t) {
		case "left": return e.left;
		case "right": return n - e.right;
		default: return 0;
	}
}, Sw = H(Ll, $l, hw, pw, mw, (e, t, n, r, i) => {
	var a = {}, o;
	return n.forEach((n) => {
		var s = _w(t, n);
		o ??= bw(t, r, e);
		var c = r === "top" && !i || r === "bottom" && i;
		a[n.id] = o - Number(c) * s.height, o += (c ? -1 : 1) * s.height;
	}), a;
}), Cw = H(Il, $l, gw, pw, mw, (e, t, n, r, i) => {
	var a = {}, o;
	return n.forEach((n) => {
		var s = vw(t, n);
		o ??= xw(t, r, e);
		var c = r === "left" && !i || r === "right" && i;
		a[n.id] = o - Number(c) * s.width, o += (c ? -1 : 1) * s.width;
	}), a;
}), ww = H([
	$l,
	MS,
	(e, t) => {
		var n = MS(e, t);
		if (n != null) return Sw(e, n.orientation, n.mirror);
	},
	(e, t) => t
], (e, t, n, r) => {
	if (t != null) {
		var i = n?.[r];
		return i == null ? {
			x: e.left,
			y: 0
		} : {
			x: e.left,
			y: i
		};
	}
}), Tw = H([
	$l,
	FS,
	(e, t) => {
		var n = FS(e, t);
		if (n != null) return Cw(e, n.orientation, n.mirror);
	},
	(e, t) => t
], (e, t, n, r) => {
	if (t != null) {
		var i = n?.[r];
		return i == null ? {
			x: 0,
			y: e.top
		} : {
			x: i,
			y: e.top
		};
	}
}), Ew = H($l, FS, (e, t) => ({
	width: typeof t.width == "number" ? t.width : 60,
	height: e.height
})), Dw = (e, t, n) => {
	switch (t) {
		case "xAxis": return yw(e, n).width;
		case "yAxis": return Ew(e, n).height;
		default: return;
	}
}, Ow = (e, t, n, r) => {
	if (n != null) {
		var i = n.allowDuplicatedCategory, a = n.type, o = n.dataKey, s = gl(e, r), c = t.map((e) => e.value), l = c.filter((e) => e != null);
		if (o && s && a === "category" && i && Ht(l)) return c;
	}
}, kw = H([
	q,
	nC,
	Q,
	X
], Ow), Aw = H([
	q,
	RS,
	JC,
	dw,
	kw,
	uw,
	ow,
	XC,
	X
], (e, t, n, r, i, a, o, s, c) => {
	if (t != null) {
		var l = gl(e, c);
		return {
			angle: t.angle,
			interval: t.interval,
			minTickGap: t.minTickGap,
			orientation: t.orientation,
			tick: t.tick,
			tickCount: t.tickCount,
			tickFormatter: t.tickFormatter,
			ticks: t.ticks,
			type: t.type,
			unit: t.unit,
			axisType: c,
			categoricalDomain: a,
			duplicateDomain: i,
			isCategorical: l,
			niceTicks: s,
			range: o,
			realScaleType: n,
			scale: r
		};
	}
}), jw = (e, t, n, r, i, a, o, s, c) => {
	if (t != null && r != null) {
		var l = gl(e, c), u = t.type, d = t.ticks, f = t.tickCount, p = n === "scaleBand" && typeof r.bandwidth == "function" ? r.bandwidth() / 2 : 2, m = u === "category" && r.bandwidth ? r.bandwidth() / p : 0;
		m = c === "angleAxis" && a != null && a.length >= 2 ? Ft(a[0] - a[1]) * 2 * m : m;
		var h = d || i;
		return h ? h.map((e, t) => {
			var n = o ? o.indexOf(e) : e, i = r.map(n);
			return G(i) ? {
				index: t,
				coordinate: i + m,
				value: e,
				offset: m
			} : null;
		}).filter(Gt) : l && s ? s.map((e, t) => {
			var n = r.map(e);
			return G(n) ? {
				coordinate: n + m,
				value: e,
				index: t,
				offset: m
			} : null;
		}).filter(Gt) : r.ticks ? r.ticks(f).map((e, t) => {
			var n = r.map(e);
			return G(n) ? {
				coordinate: n + m,
				value: e,
				index: t,
				offset: m
			} : null;
		}).filter(Gt) : r.domain().map((e, t) => {
			var n = r.map(e);
			return G(n) ? {
				coordinate: n + m,
				value: o ? o[e] : e,
				index: t,
				offset: m
			} : null;
		}).filter(Gt);
	}
}, Mw = H([
	q,
	zS,
	JC,
	dw,
	XC,
	ow,
	kw,
	uw,
	X
], jw), Nw = (e, t, n, r, i, a, o) => {
	if (t != null && n != null && r != null && r[0] !== r[1]) {
		var s = gl(e, o), c = t.tickCount, l = 0;
		return l = o === "angleAxis" && r?.length >= 2 ? Ft(r[0] - r[1]) * 2 * l : l, s && a ? a.map((e, t) => {
			var r = n.map(e);
			return G(r) ? {
				coordinate: r + l,
				value: e,
				index: t,
				offset: l
			} : null;
		}).filter(Gt) : n.ticks ? n.ticks(c).map((e, t) => {
			var r = n.map(e);
			return G(r) ? {
				coordinate: r + l,
				value: e,
				index: t,
				offset: l
			} : null;
		}).filter(Gt) : n.domain().map((e, t) => {
			var r = n.map(e);
			return G(r) ? {
				coordinate: r + l,
				value: i ? i[e] : e,
				index: t,
				offset: l
			} : null;
		}).filter(Gt);
	}
}, Pw = H([
	q,
	zS,
	dw,
	ow,
	kw,
	uw,
	X
], Nw), Fw = H(Q, dw, (e, t) => {
	if (e != null && t != null) return yS(yS({}, e), {}, { scale: t });
});
H((e, t, n) => LS(e, n), H([H([
	Q,
	JC,
	qC,
	sw
], dS)], Mg), (e, t) => {
	if (e != null && t != null) return yS(yS({}, e), {}, { scale: t });
});
var Iw = H([
	q,
	Bl,
	Vl
], (e, t, n) => {
	switch (e) {
		case "horizontal": return t.some((e) => e.reversed) ? "right-to-left" : "left-to-right";
		case "vertical": return n.some((e) => e.reversed) ? "bottom-to-top" : "top-to-bottom";
		case "centric":
		case "radial": return "left-to-right";
		default: return;
	}
});
H([(e, t, n) => e.renderedTicks[t]?.[n]], (e) => {
	if (e && e.length !== 0) return (t) => {
		var n = Infinity, r = e[0];
		for (var i of e) {
			var a = Math.abs(i.coordinate - t);
			a < n && (n = a, r = i);
		}
		return r?.value;
	};
});
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/selectTooltipEventType.js
var Lw = (e) => e.options.defaultTooltipEventType, Rw = (e) => e.options.validateTooltipEventTypes;
function zw(e, t, n) {
	if (e == null) return t;
	var r = e ? "axis" : "item";
	return n == null ? t : n.includes(r) ? r : t;
}
function Bw(e, t) {
	return zw(t, Lw(e), Rw(e));
}
function Vw(e) {
	return V((t) => Bw(t, e));
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineActiveLabel.js
var Hw = (e, t) => {
	var n, r = Number(t);
	if (!(It(r) || t == null)) return r >= 0 ? e == null || (n = e[r]) == null ? void 0 : n.value : void 0;
}, Uw = (e) => e.tooltip.settings, Ww = {
	active: !1,
	index: null,
	dataKey: void 0,
	graphicalItemId: void 0,
	coordinate: void 0
}, Gw = pc({
	name: "tooltip",
	initialState: {
		itemInteraction: {
			click: Ww,
			hover: Ww
		},
		axisInteraction: {
			click: Ww,
			hover: Ww
		},
		keyboardInteraction: Ww,
		syncInteraction: {
			active: !1,
			index: null,
			dataKey: void 0,
			label: void 0,
			coordinate: void 0,
			sourceViewBox: void 0,
			graphicalItemId: void 0
		},
		tooltipItemPayloads: [],
		settings: {
			shared: void 0,
			trigger: "hover",
			axisId: 0,
			active: !1,
			defaultIndex: void 0
		}
	},
	reducers: {
		addTooltipEntrySettings: {
			reducer(e, t) {
				e.tooltipItemPayloads.push(U(t.payload));
			},
			prepare: W()
		},
		replaceTooltipEntrySettings: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = zs(e).tooltipItemPayloads.indexOf(U(r));
				a > -1 && (e.tooltipItemPayloads[a] = U(i));
			},
			prepare: W()
		},
		removeTooltipEntrySettings: {
			reducer(e, t) {
				var n = zs(e).tooltipItemPayloads.indexOf(U(t.payload));
				n > -1 && e.tooltipItemPayloads.splice(n, 1);
			},
			prepare: W()
		},
		setTooltipSettingsState(e, t) {
			e.settings = t.payload;
		},
		setActiveMouseOverItemIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.keyboardInteraction.active = !1, e.itemInteraction.hover.active = !0, e.itemInteraction.hover.index = t.payload.activeIndex, e.itemInteraction.hover.dataKey = t.payload.activeDataKey, e.itemInteraction.hover.graphicalItemId = t.payload.activeGraphicalItemId, e.itemInteraction.hover.coordinate = t.payload.activeCoordinate;
		},
		mouseLeaveChart(e) {
			e.itemInteraction.hover.active = !1, e.axisInteraction.hover.active = !1;
		},
		mouseLeaveItem(e) {
			e.itemInteraction.hover.active = !1;
		},
		setActiveClickItemIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.itemInteraction.click.active = !0, e.keyboardInteraction.active = !1, e.itemInteraction.click.index = t.payload.activeIndex, e.itemInteraction.click.dataKey = t.payload.activeDataKey, e.itemInteraction.click.graphicalItemId = t.payload.activeGraphicalItemId, e.itemInteraction.click.coordinate = t.payload.activeCoordinate;
		},
		setMouseOverAxisIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.axisInteraction.hover.active = !0, e.keyboardInteraction.active = !1, e.axisInteraction.hover.index = t.payload.activeIndex, e.axisInteraction.hover.dataKey = t.payload.activeDataKey, e.axisInteraction.hover.coordinate = t.payload.activeCoordinate;
		},
		setMouseClickAxisIndex(e, t) {
			e.syncInteraction.active = !1, e.syncInteraction.sourceViewBox = void 0, e.keyboardInteraction.active = !1, e.axisInteraction.click.active = !0, e.axisInteraction.click.index = t.payload.activeIndex, e.axisInteraction.click.dataKey = t.payload.activeDataKey, e.axisInteraction.click.coordinate = t.payload.activeCoordinate;
		},
		setSyncInteraction(e, t) {
			e.syncInteraction = t.payload;
		},
		setKeyboardInteraction(e, t) {
			e.keyboardInteraction.active = t.payload.active, e.keyboardInteraction.index = t.payload.activeIndex, e.keyboardInteraction.coordinate = t.payload.activeCoordinate;
		}
	}
}), Kw = Gw.actions, qw = Kw.addTooltipEntrySettings, Jw = Kw.replaceTooltipEntrySettings, Yw = Kw.removeTooltipEntrySettings, Xw = Kw.setTooltipSettingsState, Zw = Kw.setActiveMouseOverItemIndex, Qw = Kw.mouseLeaveItem, $w = Kw.mouseLeaveChart, eT = Kw.setActiveClickItemIndex, tT = Kw.setMouseOverAxisIndex, nT = Kw.setMouseClickAxisIndex, rT = Kw.setSyncInteraction, iT = Kw.setKeyboardInteraction, aT = Gw.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineTooltipInteractionState.js
function oT(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function sT(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? oT(Object(n), !0).forEach(function(t) {
			cT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : oT(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function cT(e, t, n) {
	return (t = lT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function lT(e) {
	var t = uT(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function uT(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function dT(e, t, n) {
	return t === "axis" ? n === "click" ? e.axisInteraction.click : e.axisInteraction.hover : n === "click" ? e.itemInteraction.click : e.itemInteraction.hover;
}
function fT(e) {
	return e.index != null;
}
var pT = (e, t, n, r) => {
	if (t == null) return Ww;
	var i = dT(e, t, n);
	if (i == null) return Ww;
	if (i.active) return i;
	if (e.keyboardInteraction.active) return e.keyboardInteraction;
	if (e.syncInteraction.active && e.syncInteraction.index != null) return e.syncInteraction;
	var a = e.settings.active === !0;
	if (fT(i)) {
		if (a) return sT(sT({}, i), {}, { active: !0 });
	} else if (r != null) return {
		active: !0,
		coordinate: void 0,
		dataKey: void 0,
		index: r,
		graphicalItemId: void 0
	};
	return sT(sT({}, Ww), {}, { coordinate: i.coordinate });
};
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineActiveTooltipIndex.js
function mT(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : void 0;
	if (e instanceof Date) {
		var t = e.valueOf();
		return Number.isFinite(t) ? t : void 0;
	}
	var n = Number(e);
	return Number.isFinite(n) ? n : void 0;
}
function hT(e, t) {
	var n = mT(e), r = t[0], i = t[1];
	return n !== void 0 && n >= Math.min(r, i) && n <= Math.max(r, i);
}
function gT(e, t, n) {
	if (n == null || t == null) return !0;
	var r = K(e, t);
	return r == null || !Th(n) || hT(r, n);
}
var _T = (e, t, n, r) => {
	var i = e?.index;
	if (i == null) return null;
	var a = Number(i);
	if (!G(a)) return i;
	var o = 0, s = Infinity;
	t.length > 0 && (s = t.length - 1);
	var c = Math.max(o, Math.min(a, s)), l = t[c];
	return l == null || gT(l, n, r) ? String(c) : null;
}, vT = (e, t, n, r, i, a, o) => {
	if (a != null) {
		var s = o[0]?.getPosition(a);
		if (s != null) return s;
		var c = i?.[Number(a)];
		if (c) switch (n) {
			case "horizontal": return {
				x: c.coordinate,
				y: (r.top + t) / 2
			};
			default: return {
				x: (r.left + e) / 2,
				y: c.coordinate
			};
		}
	}
}, yT = (e, t, n, r) => {
	if (t === "axis") return e.tooltipItemPayloads;
	if (e.tooltipItemPayloads.length === 0) return [];
	var i = n === "hover" ? e.itemInteraction.hover.graphicalItemId : e.itemInteraction.click.graphicalItemId;
	if (e.syncInteraction.active && i == null) return e.tooltipItemPayloads;
	if (i == null && (r != null || e.keyboardInteraction.active)) {
		var a = e.tooltipItemPayloads[0];
		return a == null ? [] : [a];
	}
	return e.tooltipItemPayloads.filter((e) => e.settings?.graphicalItemId === i);
}, bT = (e) => e.options.tooltipPayloadSearcher, xT = (e) => e.tooltip;
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineTooltipPayload.js
function ST(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function CT(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ST(Object(n), !0).forEach(function(t) {
			wT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ST(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function wT(e, t, n) {
	return (t = TT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function TT(e) {
	var t = ET(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ET(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function DT(e) {
	if (typeof e == "string" || typeof e == "number") return e;
}
function OT(e) {
	if (typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
}
function kT(e) {
	if (typeof e == "string" || typeof e == "number") return e;
	if (typeof e == "function") return (t) => e(t);
}
function AT(e) {
	if (typeof e == "string") return e;
}
function jT(e) {
	if (typeof e == "object" && e) return {
		name: "name" in e ? DT(e.name) : void 0,
		unit: "unit" in e ? OT(e.unit) : void 0,
		dataKey: "dataKey" in e ? kT(e.dataKey) : void 0,
		payload: "payload" in e ? e.payload : void 0,
		color: "color" in e ? AT(e.color) : void 0,
		fill: "fill" in e ? AT(e.fill) : void 0
	};
}
function MT(e, t) {
	return e ?? t;
}
var NT = (e, t, n, r, i, a, o) => {
	if (t != null && a != null) {
		var s = n.chartData, c = n.computedData, l = n.dataStartIndex, u = n.dataEndIndex;
		return e.reduce((e, n) => {
			var d = n.dataDefinedOnItem, f = n.settings, p = MT(d, s), m = Array.isArray(p) ? cl(p, l, u) : p, h = f?.dataKey ?? r, g = f?.nameKey, _;
			return r && Array.isArray(m) && !Array.isArray(m[0]) && o === "axis" ? (_ = Ut(m, r, i), _ ??= a(m, t, c, g)) : _ = a(m, t, c, g), Array.isArray(_) ? _.forEach((t) => {
				var n = jT(t), r = n?.name, i = n?.dataKey, a = n?.payload, o = CT(CT({}, f), {}, {
					name: r,
					unit: n?.unit,
					color: n?.color ?? f?.color,
					fill: n?.fill ?? f?.fill
				});
				e.push(Ml({
					tooltipEntrySettings: o,
					dataKey: i,
					payload: a,
					value: K(a, i),
					name: r == null ? void 0 : String(r)
				}));
			}) : e.push(Ml({
				tooltipEntrySettings: f,
				dataKey: h,
				payload: _,
				value: K(_, h),
				name: K(_, g) ?? f?.name
			})), e;
		}, []);
	}
}, PT = H([
	uC,
	BS,
	Xh
], mS), FT = H([
	H([(e) => e.graphicalItems.cartesianItems, (e) => e.graphicalItems.polarItems], (e, t) => [...e, ...t]),
	uC,
	H([Ag, jg], VS)
], WS, { memoizeOptions: { resultEqualityCheck: Og } }), IT = H([FT], (e) => e.filter(Eg)), LT = H([FT], YS, { memoizeOptions: { resultEqualityCheck: Og } }), RT = H([FT], (e) => e.some((e) => !e.data)), zT = H([LT, fh], QS), BT = H([
	IT,
	fh,
	uC
], Tg), VT = H([
	zT,
	uC,
	FT,
	fh,
	RT,
	LT
], tC), HT = H([uC], _C), UT = H([HT, H([uC], (e) => e.allowDataOverflow)], Dh), WT = H([
	H([
		BT,
		H([FT], (e) => e.filter(Eg)),
		Jh,
		Yh
	], pC),
	fh,
	Ag,
	UT
], hC), GT = H([
	zT,
	uC,
	H([FT], qS),
	xC,
	Ag,
	vh
], wC, { memoizeOptions: { resultEqualityCheck: Dg } }), KT = H([H([
	OC,
	Ag,
	jg
], kC), Ag], FC), qT = H([H([
	jC,
	Ag,
	jg
], kC), Ag], LC), JT = H([
	uC,
	q,
	zT,
	VT,
	Jh,
	Ag,
	H([
		uC,
		HT,
		UT,
		WT,
		GT,
		H([
			KT,
			H([H([
				NC,
				Ag,
				jg
			], kC), Ag], VC),
			qT
		], CC),
		q,
		Ag
	], UC)
], KC), YT = H([
	uC,
	JT,
	H([
		JT,
		uC,
		PT
	], YC),
	Ag
], ZC), XT = (e) => ow(e, Ag(e), jg(e), !1), ZT = H([uC, XT], rg), QT = H([H([
	uC,
	PT,
	YT,
	ZT
], dS)], Mg), $T = H([
	q,
	uC,
	PT,
	QT,
	XT,
	H([
		q,
		VT,
		uC,
		Ag
	], Ow),
	H([
		q,
		VT,
		uC,
		Ag
	], lw),
	Ag
], (e, t, n, r, i, a, o, s) => {
	if (t) {
		var c = t.type, l = gl(e, s);
		if (r) {
			var u = n === "scaleBand" && r.bandwidth ? r.bandwidth() / 2 : 2, d = c === "category" && r.bandwidth ? r.bandwidth() / u : 0;
			return d = s === "angleAxis" && i != null && i?.length >= 2 ? Ft(i[0] - i[1]) * 2 * d : d, l && o ? o.map((e, t) => {
				var n = r.map(e);
				return G(n) ? {
					coordinate: n + d,
					value: e,
					index: t,
					offset: d
				} : null;
			}).filter(Gt) : r.domain().map((e, t) => {
				var n = r.map(e);
				return G(n) ? {
					coordinate: n + d,
					value: a ? a[e] : e,
					index: t,
					offset: d
				} : null;
			}).filter(Gt);
		}
	}
}), eE = H([
	Lw,
	Rw,
	Uw
], (e, t, n) => zw(n.shared, e, t)), tE = (e) => e.tooltip.settings.trigger, nE = (e) => e.tooltip.settings.defaultIndex, rE = H([
	xT,
	eE,
	tE,
	nE
], pT), iE = H([
	rE,
	zT,
	dC,
	JT
], _T), aE = H([$T, iE], Hw), oE = H([rE], (e) => {
	if (e) return e.dataKey;
}), sE = H([rE], (e) => {
	if (e) return e.graphicalItemId;
}), cE = H([
	xT,
	eE,
	tE,
	nE
], yT), lE = H([rE, H([
	Il,
	Ll,
	q,
	$l,
	$T,
	nE,
	cE
], vT)], (e, t) => e != null && e.coordinate ? e.coordinate : t), uE = H([rE], (e) => e?.active ?? !1), dE = H([H([
	cE,
	iE,
	fh,
	dC,
	aE,
	bT,
	eE
], NT)], (e) => {
	if (e != null) {
		var t = e.map((e) => e.payload).filter((e) => e != null);
		return Array.from(new Set(t));
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/context/useTooltipAxis.js
function fE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function pE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? fE(Object(n), !0).forEach(function(t) {
			mE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : fE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function mE(e, t, n) {
	return (t = hE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function hE(e) {
	var t = gE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function gE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var _E = () => V(uC), vE = () => {
	var e = _E(), t = V($T), n = V(QT);
	return jl(!e || !n ? void 0 : pE(pE({}, e), {}, { scale: n }), t);
};
// ../../../peach/frontend/node_modules/recharts/es6/util/getActiveCoordinate.js
function yE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function bE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? yE(Object(n), !0).forEach(function(t) {
			xE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function xE(e, t, n) {
	return (t = SE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function SE(e) {
	var t = CE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function CE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var wE = (e, t, n, r) => {
	var i = t.find((e) => e && e.index === n);
	if (i) {
		if (e === "horizontal") return {
			x: i.coordinate,
			y: r.relativeY
		};
		if (e === "vertical") return {
			x: r.relativeX,
			y: i.coordinate
		};
	}
	return {
		x: 0,
		y: 0
	};
}, TE = (e, t, n, r) => {
	var i = t.find((e) => e && e.index === n);
	if (i) {
		if (e === "centric") {
			var a = i.coordinate, o = r.radius;
			return bE(bE(bE({}, r), zm(r.cx, r.cy, o, a)), {}, {
				angle: a,
				radius: o
			});
		}
		var s = i.coordinate, c = r.angle;
		return bE(bE(bE({}, r), zm(r.cx, r.cy, s, c)), {}, {
			angle: c,
			radius: s
		});
	}
	return {
		angle: 0,
		clockWise: !1,
		cx: 0,
		cy: 0,
		endAngle: 0,
		innerRadius: 0,
		outerRadius: 0,
		radius: 0,
		startAngle: 0,
		x: 0,
		y: 0
	};
};
function EE(e, t) {
	var n = e.relativeX, r = e.relativeY;
	return n >= t.left && n <= t.left + t.width && r >= t.top && r <= t.top + t.height;
}
var DE = (e, t, n, r, i) => {
	var a = t?.length ?? 0;
	if (a <= 1 || e == null) return 0;
	if (r === "angleAxis" && i != null && Math.abs(Math.abs(i[1] - i[0]) - 360) <= 1e-6) for (var o = i[1] - i[0], s = (t, n, r) => [
		e,
		e + o,
		e - o
	].some((e) => (r ? e >= t : e > t) && e <= n), c = 0; c < a; c++) {
		var l = c > 0 ? n[c - 1]?.coordinate : n[a - 1]?.coordinate, u = n[c]?.coordinate, d = c >= a - 1 ? n[0]?.coordinate : n[c + 1]?.coordinate, f = void 0;
		if (l != null && u != null && d != null) {
			if (Ft(u - l) !== Ft(d - u)) {
				var p = [];
				if (Ft(d - u) === Ft(i[1] - i[0])) {
					f = d;
					var m = u + i[1] - i[0];
					p[0] = Math.min(m, (m + l) / 2), p[1] = Math.max(m, (m + l) / 2);
				} else {
					f = l;
					var h = d + i[1] - i[0];
					p[0] = Math.min(u, (h + u) / 2), p[1] = Math.max(u, (h + u) / 2);
				}
				var g = [Math.min(u, (f + u) / 2), Math.max(u, (f + u) / 2)];
				if (s(g[0], g[1], !1) || s(p[0], p[1], !0)) return n[c]?.index;
			} else {
				var _ = Math.min(l, d), v = Math.max(l, d);
				if (s((_ + u) / 2, (v + u) / 2, !1)) return n[c]?.index;
			}
		}
	}
	else if (t) for (var y = 0; y < a; y++) {
		var b = t[y];
		if (b != null) {
			var x = t[y + 1], S = t[y - 1];
			if (y === 0 && x != null && e <= (b.coordinate + x.coordinate) / 2 || y === a - 1 && S != null && e > (b.coordinate + S.coordinate) / 2 || y > 0 && y < a - 1 && S != null && x != null && e > (b.coordinate + S.coordinate) / 2 && e <= (b.coordinate + x.coordinate) / 2) return b.index;
		}
	}
	return -1;
}, OE = () => V(Xh), kE = (e, t) => t, AE = (e, t, n) => n, jE = (e, t, n, r) => r, ME = H($T, (e) => qa(e, (e) => e.coordinate)), NE = H([
	xT,
	kE,
	AE,
	jE
], pT), PE = H([
	NE,
	zT,
	dC,
	JT
], _T), FE = (e, t, n) => {
	if (t != null) {
		var r = xT(e);
		return t === "axis" ? n === "hover" ? r.axisInteraction.hover.dataKey : r.axisInteraction.click.dataKey : n === "hover" ? r.itemInteraction.hover.dataKey : r.itemInteraction.click.dataKey;
	}
}, IE = H([
	xT,
	kE,
	AE,
	jE
], yT), LE = H([
	Il,
	Ll,
	q,
	$l,
	$T,
	jE,
	IE
], vT), RE = H([NE, LE], (e, t) => e.coordinate ?? t), zE = H([$T, PE], Hw), BE = H([
	IE,
	PE,
	fh,
	dC,
	zE,
	bT,
	kE
], NT), VE = H([NE, PE], (e, t) => ({
	isActive: e.active && t != null,
	activeIndex: t
})), HE = (e, t, n, r, i, a, o) => {
	if (e && n && r && i && EE(e, o)) {
		var s = DE(Pl(e, t), a, i, n, r), c = wE(t, i, s, e);
		return {
			activeIndex: String(s),
			activeCoordinate: c
		};
	}
}, UE = (e, t, n, r, i, a, o) => {
	if (e && r && i && a && n) {
		var s = Gm(e, n);
		if (s) {
			var c = DE(Fl(s, t), o, a, r, i), l = TE(t, a, c, s);
			return {
				activeIndex: String(c),
				activeCoordinate: l
			};
		}
	}
}, WE = (e, t, n, r, i, a, o, s) => {
	if (e && t && r && i && a) return t === "horizontal" || t === "vertical" ? HE(e, t, r, i, a, o, s) : UE(e, t, n, r, i, a, o);
}, GE = H((e) => e.zIndex.zIndexMap, (e, t) => t, (e, t, n) => n, (e, t, n) => {
	if (t != null) {
		var r = e[t];
		if (r != null) return n ? r.panoramaElement : r.element;
	}
}), KE = H((e) => e.zIndex.zIndexMap, (e) => {
	var t = Object.keys(e).map((e) => parseInt(e, 10)).concat(Object.values(Y));
	return Array.from(new Set(t)).sort((e, t) => e - t);
}, { memoizeOptions: { resultEqualityCheck: kg } });
// ../../../peach/frontend/node_modules/recharts/es6/state/zIndexSlice.js
function qE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function JE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? qE(Object(n), !0).forEach(function(t) {
			YE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function YE(e, t, n) {
	return (t = XE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function XE(e) {
	var t = ZE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ZE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var QE = { zIndexMap: Object.values(Y).reduce((e, t) => JE(JE({}, e), {}, { [t]: {
	element: void 0,
	panoramaElement: void 0,
	consumers: 0
} }), {}) }, $E = new Set(Object.values(Y));
function eD(e) {
	return $E.has(e);
}
var tD = pc({
	name: "zIndex",
	initialState: QE,
	reducers: {
		registerZIndexPortal: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] ? e.zIndexMap[n].consumers += 1 : e.zIndexMap[n] = {
					consumers: 1,
					element: void 0,
					panoramaElement: void 0
				};
			},
			prepare: W()
		},
		unregisterZIndexPortal: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] && (--e.zIndexMap[n].consumers, e.zIndexMap[n].consumers <= 0 && !eD(n) && delete e.zIndexMap[n]);
			},
			prepare: W()
		},
		registerZIndexPortalElement: {
			reducer: (e, t) => {
				var n = t.payload, r = n.zIndex, i = n.element, a = n.isPanorama;
				e.zIndexMap[r] ? a ? e.zIndexMap[r].panoramaElement = U(i) : e.zIndexMap[r].element = U(i) : e.zIndexMap[r] = {
					consumers: 0,
					element: a ? void 0 : U(i),
					panoramaElement: a ? U(i) : void 0
				};
			},
			prepare: W()
		},
		unregisterZIndexPortalElement: {
			reducer: (e, t) => {
				var n = t.payload.zIndex;
				e.zIndexMap[n] && (t.payload.isPanorama ? e.zIndexMap[n].panoramaElement = void 0 : e.zIndexMap[n].element = void 0);
			},
			prepare: W()
		}
	}
}), nD = tD.actions, rD = nD.registerZIndexPortal, iD = nD.unregisterZIndexPortal, aD = nD.registerZIndexPortalElement, oD = nD.unregisterZIndexPortalElement, sD = tD.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/zIndex/ZIndexLayer.js
function cD(e) {
	var t = e.zIndex, n = e.children, r = Yu() && t !== void 0 && t !== 0, i = ru(), a = (0, P.useRef)(void 0), o = (0, P.useRef)(/* @__PURE__ */ new Set()), s = B(), c = V((e) => GE(e, t, i));
	if ((0, P.useLayoutEffect)(() => {
		if (!r) {
			var e = o.current;
			e.forEach((e) => {
				s(iD({ zIndex: e }));
			}), e.clear(), a.current = void 0;
		} else if (o.current.has(t) || (s(rD({ zIndex: t })), o.current.add(t)), c) {
			a.current = c;
			var n = o.current;
			n.forEach((e) => {
				e !== t && (s(iD({ zIndex: e })), n.delete(e));
			});
		}
	}, [
		s,
		t,
		r,
		c
	]), (0, P.useLayoutEffect)(() => {
		var e = o.current;
		return () => {
			e.forEach((e) => {
				s(iD({ zIndex: e }));
			}), e.clear();
		};
	}, [s]), !r) return n;
	var l = c ?? a.current;
	return l ? /*#__PURE__*/ (0, Ed.createPortal)(n, l) : null;
}
// ../../../peach/frontend/node_modules/recharts/es6/component/Cursor.js
function lD() {
	return lD = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, lD.apply(null, arguments);
}
function uD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function dD(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? uD(Object(n), !0).forEach(function(t) {
			fD(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : uD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function fD(e, t, n) {
	return (t = pD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function pD(e) {
	var t = mD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function mD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function hD(e) {
	var t = e.cursor, n = e.cursorComp, r = e.cursorProps;
	return /*#__PURE__*/ (0, P.isValidElement)(t) ? /*#__PURE__*/ (0, P.cloneElement)(t, r) : /*#__PURE__*/ (0, P.createElement)(n, r);
}
function gD(e) {
	var t = e.coordinate, n = e.payload, r = e.index, i = e.offset, a = e.tooltipAxisBandSize, o = e.layout, s = e.cursor, c = e.tooltipEventType, l = e.chartName, u = t, d = n, f = r;
	if (!s || !u || l !== "ScatterChart" && c !== "axis") return null;
	var p, m, h;
	if (l === "ScatterChart") p = u, m = _p, h = Y.cursorLine;
	else if (l === "BarChart") p = vp(o, u, i, a), m = Am, h = Y.cursorRectangle;
	else if (o === "radial" && Hr(u)) {
		var g = Km(u), _ = g.cx, v = g.cy, y = g.radius;
		p = {
			cx: _,
			cy: v,
			startAngle: g.startAngle,
			endAngle: g.endAngle,
			innerRadius: y,
			outerRadius: y
		}, m = sh, h = Y.cursorLine;
	} else p = { points: ch(o, u, i) }, m = op, h = Y.cursorLine;
	var b = typeof s == "object" && "className" in s ? s.className : void 0, x = dD(dD(dD(dD({
		stroke: "#ccc",
		pointerEvents: "none"
	}, i), p), ut(s)), {}, {
		payload: d,
		payloadIndex: f,
		className: N("recharts-tooltip-cursor", b)
	});
	return /*#__PURE__*/ P.createElement(cD, { zIndex: e.zIndex ?? h }, /*#__PURE__*/ P.createElement(hD, {
		cursor: s,
		cursorComp: m,
		cursorProps: x
	}));
}
function _D(e) {
	var t = vE(), n = Vu(), r = Gu(), i = OE();
	return t == null || n == null || r == null || i == null ? null : /*#__PURE__*/ P.createElement(gD, lD({}, e, {
		offset: n,
		layout: r,
		tooltipAxisBandSize: t,
		chartName: i
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/context/tooltipPortalContext.js
var vD = /*#__PURE__*/ (0, P.createContext)(null), yD = () => (0, P.useContext)(vD), bD = (/* @__PURE__ */ D((/* @__PURE__ */ T(((e, t) => {
	var n = Object.prototype.hasOwnProperty, r = "~";
	function i() {}
	Object.create && (i.prototype = Object.create(null), new i().__proto__ || (r = !1));
	function a(e, t, n) {
		this.fn = e, this.context = t, this.once = n || !1;
	}
	function o(e, t, n, i, o) {
		if (typeof n != "function") throw TypeError("The listener must be a function");
		var s = new a(n, i || e, o), c = r ? r + t : t;
		return e._events[c] ? e._events[c].fn ? e._events[c] = [e._events[c], s] : e._events[c].push(s) : (e._events[c] = s, e._eventsCount++), e;
	}
	function s(e, t) {
		--e._eventsCount === 0 ? e._events = new i() : delete e._events[t];
	}
	function c() {
		this._events = new i(), this._eventsCount = 0;
	}
	c.prototype.eventNames = function() {
		var e = [], t, i;
		if (this._eventsCount === 0) return e;
		for (i in t = this._events) n.call(t, i) && e.push(r ? i.slice(1) : i);
		return Object.getOwnPropertySymbols ? e.concat(Object.getOwnPropertySymbols(t)) : e;
	}, c.prototype.listeners = function(e) {
		var t = r ? r + e : e, n = this._events[t];
		if (!n) return [];
		if (n.fn) return [n.fn];
		for (var i = 0, a = n.length, o = Array(a); i < a; i++) o[i] = n[i].fn;
		return o;
	}, c.prototype.listenerCount = function(e) {
		var t = r ? r + e : e, n = this._events[t];
		return n ? n.fn ? 1 : n.length : 0;
	}, c.prototype.emit = function(e, t, n, i, a, o) {
		var s = r ? r + e : e;
		if (!this._events[s]) return !1;
		var c = this._events[s], l = arguments.length, u, d;
		if (c.fn) {
			switch (c.once && this.removeListener(e, c.fn, void 0, !0), l) {
				case 1: return c.fn.call(c.context), !0;
				case 2: return c.fn.call(c.context, t), !0;
				case 3: return c.fn.call(c.context, t, n), !0;
				case 4: return c.fn.call(c.context, t, n, i), !0;
				case 5: return c.fn.call(c.context, t, n, i, a), !0;
				case 6: return c.fn.call(c.context, t, n, i, a, o), !0;
			}
			for (d = 1, u = Array(l - 1); d < l; d++) u[d - 1] = arguments[d];
			c.fn.apply(c.context, u);
		} else {
			var f = c.length, p;
			for (d = 0; d < f; d++) switch (c[d].once && this.removeListener(e, c[d].fn, void 0, !0), l) {
				case 1:
					c[d].fn.call(c[d].context);
					break;
				case 2:
					c[d].fn.call(c[d].context, t);
					break;
				case 3:
					c[d].fn.call(c[d].context, t, n);
					break;
				case 4:
					c[d].fn.call(c[d].context, t, n, i);
					break;
				default:
					if (!u) for (p = 1, u = Array(l - 1); p < l; p++) u[p - 1] = arguments[p];
					c[d].fn.apply(c[d].context, u);
			}
		}
		return !0;
	}, c.prototype.on = function(e, t, n) {
		return o(this, e, t, n, !1);
	}, c.prototype.once = function(e, t, n) {
		return o(this, e, t, n, !0);
	}, c.prototype.removeListener = function(e, t, n, i) {
		var a = r ? r + e : e;
		if (!this._events[a]) return this;
		if (!t) return s(this, a), this;
		var o = this._events[a];
		if (o.fn) o.fn !== t || i && !o.once || n && o.context !== n || s(this, a);
		else {
			for (var c = 0, l = [], u = o.length; c < u; c++) (o[c].fn !== t || i && !o[c].once || n && o[c].context !== n) && l.push(o[c]);
			l.length ? this._events[a] = l.length === 1 ? l[0] : l : s(this, a);
		}
		return this;
	}, c.prototype.removeAllListeners = function(e) {
		var t;
		return e ? (t = r ? r + e : e, this._events[t] && s(this, t)) : (this._events = new i(), this._eventsCount = 0), this;
	}, c.prototype.off = c.prototype.removeListener, c.prototype.addListener = c.prototype.on, c.prefixed = r, c.EventEmitter = c, t !== void 0 && (t.exports = c);
})))(), 1)).default, xD = new bD(), SD = "recharts.syncEvent.tooltip", CD = "recharts.syncEvent.brush", wD = (e, t) => {
	if (t && Array.isArray(e)) {
		var n = Number.parseInt(t, 10);
		if (!It(n)) return e[n];
	}
}, TD = pc({
	name: "options",
	initialState: {
		chartName: "",
		tooltipPayloadSearcher: () => void 0,
		eventEmitter: void 0,
		defaultTooltipEventType: "axis"
	},
	reducers: { createEventEmitter: (e) => {
		e.eventEmitter ??= Symbol("rechartsEventEmitter");
	} }
}), ED = TD.reducer, DD = TD.actions.createEventEmitter;
// ../../../peach/frontend/node_modules/recharts/es6/synchronisation/syncSelectors.js
function OD(e) {
	return e.tooltip.syncInteraction;
}
var kD = pc({
	name: "chartData",
	initialState: {
		chartData: void 0,
		computedData: void 0,
		dataStartIndex: 0,
		dataEndIndex: 0
	},
	reducers: {
		setChartData(e, t) {
			e.chartData = U(t.payload), t.payload == null ? (e.dataStartIndex = 0, e.dataEndIndex = 0) : t.payload.length > 0 && e.dataEndIndex !== t.payload.length - 1 && (e.dataEndIndex = t.payload.length - 1);
		},
		setComputedData(e, t) {
			e.computedData = t.payload;
		},
		setDataStartEndIndexes(e, t) {
			var n = t.payload, r = n.startIndex, i = n.endIndex;
			r != null && (e.dataStartIndex = r), i != null && (e.dataEndIndex = i);
		}
	}
}), AD = kD.actions, jD = AD.setChartData, MD = AD.setDataStartEndIndexes;
AD.setComputedData;
var ND = kD.reducer, PD = ["x", "y"];
function FD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ID(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? FD(Object(n), !0).forEach(function(t) {
			LD(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : FD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function LD(e, t, n) {
	return (t = RD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function RD(e) {
	var t = zD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function zD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function BD(e, t) {
	if (e == null) return {};
	var n, r, i = VD(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function VD(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function HD() {
	var e = V(Zh), t = V($h), n = B(), r = V(Qh), i = V($T), a = Gu(), o = zu(), s = V((e) => e.rootProps.className);
	(0, P.useEffect)(() => {
		if (e == null) return Kt;
		var s = (s, c, l) => {
			if (t !== l && e === s) {
				if (c.payload.active === !1) n(rT({
					active: !1,
					coordinate: void 0,
					dataKey: void 0,
					index: null,
					label: void 0,
					sourceViewBox: void 0,
					graphicalItemId: void 0
				}));
				else if (r === "index") {
					var u;
					if (o && c != null && (u = c.payload) != null && u.coordinate && c.payload.sourceViewBox) {
						var d = c.payload.coordinate, f = d.x, p = d.y, m = BD(d, PD), h = c.payload.sourceViewBox, g = h.x, _ = h.y, v = h.width, y = h.height, b = ID(ID({}, m), {}, {
							x: o.x + (v ? (f - g) / v : 0) * o.width,
							y: o.y + (y ? (p - _) / y : 0) * o.height
						});
						n(ID(ID({}, c), {}, { payload: ID(ID({}, c.payload), {}, { coordinate: b }) }));
					} else n(c);
				} else if (i != null) {
					var x;
					typeof r == "function" ? x = i[r(i, {
						activeTooltipIndex: c.payload.index == null ? void 0 : Number(c.payload.index),
						isTooltipActive: c.payload.active,
						activeIndex: c.payload.index == null ? void 0 : Number(c.payload.index),
						activeLabel: c.payload.label,
						activeDataKey: c.payload.dataKey,
						activeCoordinate: c.payload.coordinate
					})] : r === "value" && (x = i.find((e) => String(e.value) === c.payload.label));
					var S = c.payload.coordinate;
					if (S == null || o == null) n(rT({
						active: !1,
						coordinate: void 0,
						dataKey: void 0,
						index: null,
						label: void 0,
						sourceViewBox: void 0,
						graphicalItemId: void 0
					}));
					else if (x == null) n(rT({
						active: !1,
						coordinate: void 0,
						dataKey: void 0,
						index: null,
						label: void 0,
						sourceViewBox: c.payload.sourceViewBox,
						graphicalItemId: void 0
					}));
					else {
						var C = S.x, w = S.y, T = Math.min(C, o.x + o.width), E = Math.min(w, o.y + o.height), D = {
							x: a === "horizontal" ? x.coordinate : T,
							y: a === "horizontal" ? E : x.coordinate
						};
						n(rT({
							active: c.payload.active,
							coordinate: D,
							dataKey: c.payload.dataKey,
							index: String(x.index),
							label: c.payload.label,
							sourceViewBox: c.payload.sourceViewBox,
							graphicalItemId: c.payload.graphicalItemId
						}));
					}
				}
			}
		};
		return xD.on(SD, s), () => {
			xD.off(SD, s);
		};
	}, [
		s,
		n,
		t,
		e,
		r,
		i,
		a,
		o
	]);
}
function UD() {
	var e = V(Zh), t = V($h), n = B();
	(0, P.useEffect)(() => {
		if (e == null) return Kt;
		var r = (r, i, a) => {
			t !== a && e === r && n(MD(i));
		};
		return xD.on(CD, r), () => {
			xD.off(CD, r);
		};
	}, [
		n,
		t,
		e
	]);
}
function WD() {
	var e = B();
	(0, P.useEffect)(() => {
		e(DD());
	}, [e]), HD(), UD();
}
function GD(e, t, n, r, i, a) {
	var o = V((n) => FE(n, e, t)), s = V(sE), c = V($h), l = V(Zh), u = V(Qh), d = V(OD)?.sourceViewBox != null, f = zu();
	(0, P.useEffect)(() => {
		if (!d && l != null && c != null) {
			var e = rT({
				active: a,
				coordinate: n,
				dataKey: o,
				index: i,
				label: typeof r == "number" ? String(r) : r,
				sourceViewBox: f,
				graphicalItemId: s
			});
			xD.emit(SD, l, e, c);
		}
	}, [
		d,
		n,
		o,
		s,
		i,
		r,
		c,
		l,
		u,
		a,
		f
	]);
}
// ../../../peach/frontend/node_modules/recharts/es6/component/Tooltip.js
function KD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function qD(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? KD(Object(n), !0).forEach(function(t) {
			JD(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : KD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function JD(e, t, n) {
	return (t = YD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function YD(e) {
	var t = XD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function XD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function ZD(e, t) {
	return nO(e) || tO(e, t) || $D(e, t) || QD();
}
function QD() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function $D(e, t) {
	if (e) {
		if (typeof e == "string") return eO(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? eO(e, t) : void 0;
	}
}
function eO(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function tO(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function nO(e) {
	if (Array.isArray(e)) return e;
}
function rO(e) {
	return e.dataKey;
}
function iO(e, t) {
	return /*#__PURE__*/ P.isValidElement(e) ? /*#__PURE__*/ P.cloneElement(e, t) : typeof e == "function" ? /*#__PURE__*/ P.createElement(e, t) : /*#__PURE__*/ P.createElement(gf, t);
}
var aO = [], oO = {
	allowEscapeViewBox: {
		x: !1,
		y: !1
	},
	animationDuration: 400,
	animationEasing: "ease",
	axisId: 0,
	contentStyle: {},
	cursor: !0,
	filterNull: !0,
	includeHidden: !1,
	isAnimationActive: "auto",
	itemSorter: "name",
	itemStyle: {},
	labelStyle: {},
	offset: 10,
	reverseDirection: {
		x: !1,
		y: !1
	},
	separator: " : ",
	trigger: "hover",
	useTranslate3d: !1,
	wrapperStyle: {}
};
function sO(e) {
	var t = Zr(e, oO), n = t.active, r = t.allowEscapeViewBox, i = t.animationDuration, a = t.animationEasing, o = t.content, s = t.filterNull, c = t.isAnimationActive, l = t.offset, u = t.payloadUniqBy, d = t.position, f = t.reverseDirection, p = t.useTranslate3d, m = t.wrapperStyle, h = t.cursor, g = t.shared, _ = t.trigger, v = t.defaultIndex, y = t.portal, b = t.axisId, x = B(), S = typeof v == "number" ? String(v) : v;
	(0, P.useEffect)(() => {
		x(Xw({
			shared: g,
			trigger: _,
			axisId: b,
			active: n,
			defaultIndex: S
		}));
	}, [
		x,
		g,
		_,
		b,
		n,
		S
	]);
	var C = zu(), w = Gf(), T = Vw(g), E = V((e) => VE(e, T, _, S)) ?? {}, D = E.activeIndex, O = E.isActive, k = V((e) => BE(e, T, _, S)), A = V((e) => zE(e, T, _, S)), j = V((e) => RE(e, T, _, S)), M = k, N = yD(), ee = n ?? O ?? !1, te = ZD(so([M, ee]), 2), ne = te[0], re = te[1], ie = T === "axis" ? A : void 0;
	GD(T, _, j, ie, D, ee);
	var ae = y ?? N;
	if (ae == null || C == null || T == null) return null;
	var oe = M ?? aO;
	ee || (oe = aO), s && oe.length && (oe = ya(oe.filter((e) => e.value != null && (e.hide !== !0 || t.includeHidden)), u, rO));
	var se = oe.length > 0, ce = qD(qD({}, t), {}, {
		payload: oe,
		label: ie,
		active: ee,
		activeIndex: D,
		coordinate: j,
		accessibilityLayer: w
	}), le = /*#__PURE__*/ P.createElement(Wf, {
		allowEscapeViewBox: r,
		animationDuration: i,
		animationEasing: a,
		isAnimationActive: c,
		active: ee,
		coordinate: j,
		hasPayload: se,
		offset: l,
		position: d,
		reverseDirection: f,
		useTranslate3d: p,
		viewBox: C,
		wrapperStyle: m,
		lastBoundingBox: ne,
		innerRef: re,
		hasPortalFromProps: !!y
	}, iO(o, ce));
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ (0, Ed.createPortal)(le, ae), ee && /*#__PURE__*/ P.createElement(_D, {
		cursor: h,
		tooltipEventType: T,
		coordinate: j,
		payload: oe,
		index: D
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/component/Cell.js
var cO = (e) => null;
cO.displayName = "Cell";
// ../../../peach/frontend/node_modules/recharts/es6/util/LRUCache.js
function lO(e, t, n) {
	return (t = uO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function uO(e) {
	var t = dO(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function dO(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var fO = class {
	constructor(e) {
		lO(this, "cache", /* @__PURE__ */ new Map()), this.maxSize = e;
	}
	get(e) {
		var t = this.cache.get(e);
		return t !== void 0 && (this.cache.delete(e), this.cache.set(e, t)), t;
	}
	set(e, t) {
		if (this.cache.has(e)) this.cache.delete(e);
		else if (this.cache.size >= this.maxSize) {
			var n = this.cache.keys().next().value;
			n != null && this.cache.delete(n);
		}
		this.cache.set(e, t);
	}
	clear() {
		this.cache.clear();
	}
	size() {
		return this.cache.size;
	}
};
// ../../../peach/frontend/node_modules/recharts/es6/util/DOMUtils.js
function pO(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function mO(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? pO(Object(n), !0).forEach(function(t) {
			hO(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pO(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function hO(e, t, n) {
	return (t = gO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function gO(e) {
	var t = _O(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function _O(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var vO = mO({}, {
	cacheSize: 2e3,
	enableCache: !0
}), yO = new fO(vO.cacheSize), bO = {
	position: "absolute",
	top: "-20000px",
	left: 0,
	padding: 0,
	margin: 0,
	border: "none",
	whiteSpace: "pre"
}, xO = "recharts_measurement_span";
function SO(e, t) {
	return `${e}|${t.fontSize || ""}|${t.fontFamily || ""}|${t.fontWeight || ""}|${t.fontStyle || ""}|${t.letterSpacing || ""}|${t.textTransform || ""}`;
}
var CO = (e, t) => {
	try {
		var n = document.getElementById(xO);
		n || (n = document.createElement("span"), n.setAttribute("id", xO), n.setAttribute("aria-hidden", "true"), document.body.appendChild(n)), Object.assign(n.style, bO, t), n.textContent = `${e}`;
		var r = n.getBoundingClientRect();
		return {
			width: r.width,
			height: r.height
		};
	} catch {
		return {
			width: 0,
			height: 0
		};
	}
}, wO = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
	if (e == null || Cf.isSsr) return {
		width: 0,
		height: 0
	};
	if (!vO.enableCache) return CO(e, t);
	var n = SO(e, t), r = yO.get(n);
	if (r) return r;
	var i = CO(e, t);
	return yO.set(n, i), i;
}, TO;
function EO(e, t) {
	return jO(e) || AO(e, t) || OO(e, t) || DO();
}
function DO() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function OO(e, t) {
	if (e) {
		if (typeof e == "string") return kO(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kO(e, t) : void 0;
	}
}
function kO(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function AO(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function jO(e) {
	if (Array.isArray(e)) return e;
}
function MO(e, t, n) {
	return (t = NO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function NO(e) {
	var t = PO(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function PO(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var FO = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/, IO = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/, LO = /^(px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q)$/, RO = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/, zO = {
	cm: 96 / 2.54,
	mm: 96 / 25.4,
	pt: 96 / 72,
	pc: 16,
	in: 96,
	Q: 96 / 101.6,
	px: 1
}, BO = [
	"cm",
	"mm",
	"pt",
	"pc",
	"in",
	"Q",
	"px"
];
function VO(e) {
	return BO.includes(e);
}
var HO = "NaN";
function UO(e, t) {
	return e * zO[t];
}
var WO = class e {
	static parse(t) {
		var n = EO(RO.exec(t) ?? [], 3), r = n[1], i = n[2];
		return r == null ? e.NaN : new e(parseFloat(r), i ?? "");
	}
	constructor(e, t) {
		this.num = e, this.unit = t, this.num = e, this.unit = t, It(e) && (this.unit = ""), t !== "" && !LO.test(t) && (this.num = NaN, this.unit = ""), VO(t) && (this.num = UO(e, t), this.unit = "px");
	}
	add(t) {
		return this.unit === t.unit ? new e(this.num + t.num, this.unit) : new e(NaN, "");
	}
	subtract(t) {
		return this.unit === t.unit ? new e(this.num - t.num, this.unit) : new e(NaN, "");
	}
	multiply(t) {
		return this.unit !== "" && t.unit !== "" && this.unit !== t.unit ? new e(NaN, "") : new e(this.num * t.num, this.unit || t.unit);
	}
	divide(t) {
		return this.unit !== "" && t.unit !== "" && this.unit !== t.unit ? new e(NaN, "") : new e(this.num / t.num, this.unit || t.unit);
	}
	toString() {
		return `${this.num}${this.unit}`;
	}
	isNaN() {
		return It(this.num);
	}
};
TO = WO, MO(WO, "NaN", new TO(NaN, ""));
function GO(e) {
	if (e == null || e.includes(HO)) return HO;
	for (var t = e; t.includes("*") || t.includes("/");) {
		var n = EO(FO.exec(t) ?? [], 4), r = n[1], i = n[2], a = n[3], o = WO.parse(r ?? ""), s = WO.parse(a ?? ""), c = i === "*" ? o.multiply(s) : o.divide(s);
		if (c.isNaN()) return HO;
		t = t.replace(FO, c.toString());
	}
	for (; t.includes("+") || /.-\d+(?:\.\d+)?/.test(t);) {
		var l = EO(IO.exec(t) ?? [], 4), u = l[1], d = l[2], f = l[3], p = WO.parse(u ?? ""), m = WO.parse(f ?? ""), h = d === "+" ? p.add(m) : p.subtract(m);
		if (h.isNaN()) return HO;
		t = t.replace(IO, h.toString());
	}
	return t;
}
var KO = /\(([^()]*)\)/;
function qO(e) {
	for (var t = e, n; (n = KO.exec(t)) != null;) {
		var r = EO(n, 2)[1];
		t = t.replace(KO, GO(r));
	}
	return t;
}
function JO(e) {
	var t = e.replace(/\s+/g, "");
	return t = qO(t), t = GO(t), t;
}
function YO(e) {
	try {
		return JO(e);
	} catch {
		return HO;
	}
}
function XO(e) {
	var t = YO(e.slice(5, -1));
	return t === HO ? "" : t;
}
// ../../../peach/frontend/node_modules/recharts/es6/component/Text.js
var ZO = [
	"x",
	"y",
	"lineHeight",
	"capHeight",
	"fill",
	"scaleToFit",
	"textAnchor",
	"verticalAnchor"
], QO = [
	"dx",
	"dy",
	"angle",
	"className",
	"breakAll"
];
function $O() {
	return $O = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, $O.apply(null, arguments);
}
function ek(e, t) {
	if (e == null) return {};
	var n, r, i = tk(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function tk(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function nk(e, t) {
	return sk(e) || ok(e, t) || ik(e, t) || rk();
}
function rk() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ik(e, t) {
	if (e) {
		if (typeof e == "string") return ak(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ak(e, t) : void 0;
	}
}
function ak(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function ok(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function sk(e) {
	if (Array.isArray(e)) return e;
}
var ck = /[ \f\n\r\t\v\u2028\u2029]+/, lk = (e) => {
	var t = e.children, n = e.breakAll, r = e.style;
	try {
		var i = [];
		return R(t) || (i = n ? t.toString().split("") : t.toString().split(ck)), {
			wordsWithComputedWidth: i.map((e) => ({
				word: e,
				width: wO(e, r).width
			})),
			spaceWidth: n ? 0 : wO("\xA0", r).width
		};
	} catch {
		return null;
	}
};
function uk(e) {
	return e === "start" || e === "middle" || e === "end" || e === "inherit";
}
function dk(e) {
	return R(e) || typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
var fk = (e, t, n, r) => e.reduce((e, i) => {
	var a = i.word, o = i.width, s = e[e.length - 1];
	if (s && o != null && (t == null || r || s.width + o + n < Number(t))) s.words.push(a), s.width += o + n;
	else {
		var c = {
			words: [a],
			width: o
		};
		e.push(c);
	}
	return e;
}, []), pk = (e) => e.reduce((e, t) => e.width > t.width ? e : t), mk = "…", hk = (e, t, n, r, i, a, o, s) => {
	var c = lk({
		breakAll: n,
		style: r,
		children: e.slice(0, t) + mk
	});
	if (!c) return [!1, []];
	var l = fk(c.wordsWithComputedWidth, a, o, s);
	return [l.length > i || pk(l).width > Number(a), l];
}, gk = (e, t, n, r, i) => {
	var a = e.maxLines, o = e.children, s = e.style, c = e.breakAll, l = I(a), u = String(o), d = fk(t, r, n, i);
	if (!l || i || !(d.length > a || pk(d).width > Number(r))) return d;
	for (var f = 0, p = u.length - 1, m = 0, h; f <= p && m <= u.length - 1;) {
		var g = Math.floor((f + p) / 2), _ = nk(hk(u, g - 1, c, s, a, r, n, i), 2), v = _[0], y = _[1], b = nk(hk(u, g, c, s, a, r, n, i), 1)[0];
		if (!v && !b && (f = g + 1), v && b && (p = g - 1), !v && b) {
			h = y;
			break;
		}
		m++;
	}
	return h || d;
}, _k = (e) => [{
	words: R(e) ? [] : e.toString().split(ck),
	width: void 0
}], vk = (e) => {
	var t = e.width, n = e.scaleToFit, r = e.children, i = e.style, a = e.breakAll, o = e.maxLines;
	if ((t || n) && !Cf.isSsr) {
		var s, c, l = lk({
			breakAll: a,
			children: r,
			style: i
		});
		if (l) {
			var u = l.wordsWithComputedWidth, d = l.spaceWidth;
			s = u, c = d;
		} else return _k(r);
		return gk({
			breakAll: a,
			children: r,
			maxLines: o,
			style: i
		}, s, c, t, !!n);
	}
	return _k(r);
}, yk = "#808080", bk = {
	angle: 0,
	breakAll: !1,
	capHeight: "0.71em",
	fill: yk,
	lineHeight: "1em",
	scaleToFit: !1,
	textAnchor: "start",
	verticalAnchor: "end",
	x: 0,
	y: 0
}, xk = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = Zr(e, bk), r = n.x, i = n.y, a = n.lineHeight, o = n.capHeight, s = n.fill, c = n.scaleToFit, l = n.textAnchor, u = n.verticalAnchor, d = ek(n, ZO), f = (0, P.useMemo)(() => vk({
		breakAll: d.breakAll,
		children: d.children,
		maxLines: d.maxLines,
		scaleToFit: c,
		style: d.style,
		width: d.width
	}), [
		d.breakAll,
		d.children,
		d.maxLines,
		c,
		d.style,
		d.width
	]), p = d.dx, m = d.dy, h = d.angle, g = d.className, _ = d.breakAll, v = ek(d, QO);
	if (!Rt(r) || !Rt(i) || f.length === 0) return null;
	var y = Number(r) + (I(p) ? p : 0), b = Number(i) + (I(m) ? m : 0);
	if (!G(y) || !G(b)) return null;
	var x;
	switch (u) {
		case "start":
			x = XO(`calc(${o})`);
			break;
		case "middle":
			x = XO(`calc(${(f.length - 1) / 2} * -${a} + (${o} / 2))`);
			break;
		default: x = XO(`calc(${f.length - 1} * -${a})`);
	}
	var S = [], C = f[0];
	if (c && C != null) {
		var w = C.width, T = d.width;
		S.push(`scale(${I(T) && I(w) ? T / w : 1})`);
	}
	return h && S.push(`rotate(${h}, ${y}, ${b})`), S.length && (v.transform = S.join(" ")), /*#__PURE__*/ P.createElement("text", $O({}, dt(v), {
		ref: t,
		x: y,
		y: b,
		className: N("recharts-text", g),
		textAnchor: l,
		fill: s.includes("url") ? yk : s
	}), f.map((e, t) => {
		var n = e.words.join(_ ? "" : " ");
		return /*#__PURE__*/ P.createElement("tspan", {
			x: y,
			dy: t === 0 ? x : a,
			key: `${n}-${t}`
		}, n);
	}));
});
xk.displayName = "Text";
// ../../../peach/frontend/node_modules/recharts/es6/component/Label.js
var Sk = ["labelRef"], Ck = ["content"];
function wk(e, t) {
	if (e == null) return {};
	var n, r, i = Tk(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Tk(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function Ek(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Dk(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Ek(Object(n), !0).forEach(function(t) {
			Ok(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ek(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Ok(e, t, n) {
	return (t = kk(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function kk(e) {
	var t = Ak(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Ak(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function jk() {
	return jk = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, jk.apply(null, arguments);
}
var Mk = /*#__PURE__*/ (0, P.createContext)(null), Nk = (e) => {
	var t = e.x, n = e.y, r = e.upperWidth, i = e.lowerWidth, a = e.width, o = e.height, s = e.children, c = (0, P.useMemo)(() => ({
		x: t,
		y: n,
		upperWidth: r,
		lowerWidth: i,
		width: a,
		height: o
	}), [
		t,
		n,
		r,
		i,
		a,
		o
	]);
	return /*#__PURE__*/ P.createElement(Mk.Provider, { value: c }, s);
}, Pk = () => {
	var e = (0, P.useContext)(Mk), t = zu();
	return e || (t ? qt(t) : void 0);
}, Fk = /*#__PURE__*/ (0, P.createContext)(null), Ik = () => {
	var e = (0, P.useContext)(Fk), t = V(Sg);
	return e || t;
}, Lk = (e) => {
	var t = e.value, n = e.formatter, r = R(e.children) ? t : e.children;
	return typeof n == "function" ? n(r) : r;
}, Rk = (e) => e != null && typeof e == "function", zk = (e, t) => Ft(t - e) * Math.min(Math.abs(t - e), 360), Bk = (e, t, n, r, i) => {
	var a = e.offset, o = e.className, s = i.cx, c = i.cy, l = i.innerRadius, u = i.outerRadius, d = i.startAngle, f = i.endAngle, p = i.clockWise, m = (l + u) / 2, h = zk(d, f), g = h >= 0 ? 1 : -1, _, v;
	switch (t) {
		case "insideStart":
			_ = d + g * a, v = p;
			break;
		case "insideEnd":
			_ = f - g * a, v = !p;
			break;
		case "end":
			_ = f + g * a, v = p;
			break;
		default: throw Error(`Unsupported position ${t}`);
	}
	v = h <= 0 ? v : !v;
	var y = zm(s, c, m, _), b = zm(s, c, m, _ + (v ? 1 : -1) * 359), x = `M${y.x},${y.y}
    A${m},${m},0,1,${+!v},
    ${b.x},${b.y}`, S = R(e.id) ? Bt("recharts-radial-line-") : e.id;
	return /*#__PURE__*/ P.createElement("text", jk({}, r, {
		dominantBaseline: "central",
		className: N("recharts-radial-bar-label", o)
	}), /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement("path", {
		id: S,
		d: x
	})), /*#__PURE__*/ P.createElement("textPath", { xlinkHref: `#${S}` }, n));
}, Vk = (e, t, n) => {
	var r = e.cx, i = e.cy, a = e.innerRadius, o = e.outerRadius, s = (e.startAngle + e.endAngle) / 2;
	if (n === "outside") {
		var c = zm(r, i, o + t, s), l = c.x;
		return {
			x: l,
			y: c.y,
			textAnchor: l >= r ? "start" : "end",
			verticalAnchor: "middle"
		};
	}
	if (n === "center") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "middle"
	};
	if (n === "centerTop") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "start"
	};
	if (n === "centerBottom") return {
		x: r,
		y: i,
		textAnchor: "middle",
		verticalAnchor: "end"
	};
	var u = zm(r, i, (a + o) / 2, s);
	return {
		x: u.x,
		y: u.y,
		textAnchor: "middle",
		verticalAnchor: "middle"
	};
}, Hk = (e) => e != null && "cx" in e && I(e.cx), Uk = {
	angle: 0,
	offset: 5,
	zIndex: Y.label,
	position: "middle",
	textBreakAll: !1
};
function Wk(e) {
	if (!Hk(e)) return e;
	var t = e.cx, n = e.cy, r = e.outerRadius, i = r * 2;
	return {
		x: t - r,
		y: n - r,
		width: i,
		upperWidth: i,
		lowerWidth: i,
		height: i
	};
}
function Gk(e) {
	var t = Zr(e, Uk), n = t.viewBox, r = t.parentViewBox, i = t.position, a = t.value, o = t.children, s = t.content, c = t.className, l = c === void 0 ? "" : c, u = t.textBreakAll, d = t.labelRef, f = Ik(), p = Pk(), m = n == null ? i === "center" ? p : f ?? p : Hk(n) ? n : qt(n), h, g, _ = Wk(m);
	if (!m || R(a) && R(o) && !/*#__PURE__*/ (0, P.isValidElement)(s) && typeof s != "function") return null;
	var v = Hk(m) && (i === "insideStart" || i === "insideEnd" || i === "end");
	if (Hk(m)) v || (g = Vk(m, t.offset, t.position));
	else if (_) {
		var y = $t({
			viewBox: _,
			position: i,
			offset: t.offset,
			parentViewBox: Hk(r) ? void 0 : r,
			clamp: !0
		});
		g = Dk(Dk({
			x: y.x,
			y: y.y,
			textAnchor: y.horizontalAnchor,
			verticalAnchor: y.verticalAnchor
		}, y.width === void 0 ? {} : { width: y.width }), y.height === void 0 ? {} : { height: y.height });
	}
	var b = Dk(Dk(Dk(Dk({}, g?.x === void 0 ? {} : { x: g.x }), g?.y === void 0 ? {} : { y: g.y }), t), {}, { viewBox: m });
	if (/*#__PURE__*/ (0, P.isValidElement)(s)) {
		b.labelRef;
		var x = wk(b, Sk);
		return /*#__PURE__*/ (0, P.cloneElement)(s, x);
	}
	if (typeof s == "function") {
		b.content;
		var S = wk(b, Ck);
		if (h = /*#__PURE__*/ (0, P.createElement)(s, S), /*#__PURE__*/ (0, P.isValidElement)(h)) return h;
	} else h = Lk(t);
	var C = dt(t);
	return v && Hk(m) ? Bk(t, i, h, C, m) : g == null ? null : /*#__PURE__*/ P.createElement(cD, { zIndex: t.zIndex }, /*#__PURE__*/ P.createElement(xk, jk({
		ref: d,
		className: N("recharts-label", l)
	}, C, g, {
		textAnchor: uk(C.textAnchor) ? C.textAnchor : g.textAnchor,
		breakAll: u
	}), h));
}
Gk.displayName = "Label";
var Kk = (e, t, n) => {
	if (!e) return null;
	var r = {
		viewBox: t,
		labelRef: n
	};
	return e === !0 ? /*#__PURE__*/ P.createElement(Gk, jk({ key: "label-implicit" }, r)) : Rt(e) ? /*#__PURE__*/ P.createElement(Gk, jk({
		key: "label-implicit",
		value: e
	}, r)) : /*#__PURE__*/ (0, P.isValidElement)(e) ? e.type === Gk ? /*#__PURE__*/ (0, P.cloneElement)(e, Dk({ key: "label-implicit" }, r)) : /*#__PURE__*/ P.createElement(Gk, jk({
		key: "label-implicit",
		content: e
	}, r)) : Rk(e) ? /*#__PURE__*/ P.createElement(Gk, jk({
		key: "label-implicit",
		content: e
	}, r)) : e && typeof e == "object" ? /*#__PURE__*/ P.createElement(Gk, jk({}, e, { key: "label-implicit" }, r)) : null;
};
function qk(e) {
	var t = e.label, n = e.labelRef;
	return Kk(t, Pk(), n) || null;
}
// ../../../peach/frontend/node_modules/recharts/es6/component/LabelList.js
var Jk = ["valueAccessor"], Yk = [
	"dataKey",
	"clockWise",
	"id",
	"textBreakAll",
	"zIndex"
];
function Xk() {
	return Xk = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Xk.apply(null, arguments);
}
function Zk(e, t) {
	if (e == null) return {};
	var n, r, i = Qk(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Qk(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var $k = (e) => {
	var t = Array.isArray(e.value) ? e.value[e.value.length - 1] : e.value;
	if (dk(t)) return t;
}, eA = /*#__PURE__*/ (0, P.createContext)(void 0), tA = eA.Provider, nA = /*#__PURE__*/ (0, P.createContext)(void 0), rA = nA.Provider;
function iA() {
	return (0, P.useContext)(eA);
}
function aA() {
	return (0, P.useContext)(nA);
}
function oA(e) {
	var t = e.valueAccessor, n = t === void 0 ? $k : t, r = Zk(e, Jk), i = r.dataKey;
	r.clockWise;
	var a = r.id, o = r.textBreakAll, s = r.zIndex, c = Zk(r, Yk), l = iA(), u = aA(), d = l || u;
	return !d || !d.length ? null : /*#__PURE__*/ P.createElement(cD, { zIndex: s ?? Y.label }, /*#__PURE__*/ P.createElement(F, { className: "recharts-label-list" }, d.map((e, t) => {
		var s = R(i) ? n(e, t) : K(e.payload, i), l = R(a) ? {} : { id: `${a}-${t}` };
		return /*#__PURE__*/ P.createElement(Gk, Xk({ key: `label-${t}` }, dt(e), c, l, {
			fill: r.fill ?? e.fill,
			parentViewBox: e.parentViewBox,
			value: s,
			textBreakAll: o,
			viewBox: e.viewBox,
			index: t,
			zIndex: 0
		}));
	})));
}
oA.displayName = "LabelList";
function sA(e) {
	var t = e.label;
	return t ? t === !0 ? /*#__PURE__*/ P.createElement(oA, { key: "labelList-implicit" }) : /*#__PURE__*/ P.isValidElement(t) || Rk(t) ? /*#__PURE__*/ P.createElement(oA, {
		key: "labelList-implicit",
		content: t
	}) : typeof t == "object" ? /*#__PURE__*/ P.createElement(oA, Xk({ key: "labelList-implicit" }, t, { type: String(t.type) })) : null : null;
}
// ../../../peach/frontend/node_modules/recharts/es6/shape/Polygon.js
var cA = [
	"points",
	"className",
	"baseLinePoints",
	"connectNulls"
], lA;
function uA() {
	return uA = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, uA.apply(null, arguments);
}
function dA(e, t) {
	if (e == null) return {};
	var n, r, i = fA(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function fA(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function pA(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var mA = (e) => e != null && e.x === +e.x && e.y === +e.y, hA = function() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], t = [[]];
	e.forEach((e) => {
		var n = t[t.length - 1];
		mA(e) ? n && n.push(e) : n && n.length > 0 && t.push([]);
	});
	var n = e[0], r = t[t.length - 1];
	mA(n) && r && r.push(n);
	var i = t[t.length - 1];
	return i && i.length <= 0 && (t = t.slice(0, -1)), t;
}, gA = (e, t) => {
	var n = hA(e);
	t && (n = [n.reduce((e, t) => [...e, ...t], [])]);
	var r = n.map((e) => e.reduce((e, t, n) => Pt(lA ||= pA([
		"",
		"",
		"",
		",",
		""
	]), e, n === 0 ? "M" : "L", t.x, t.y), "")).join("");
	return n.length === 1 ? `${r}Z` : r;
}, _A = (e, t, n) => {
	var r = gA(e, n);
	return `${r.slice(-1) === "Z" ? r.slice(0, -1) : r}L${gA(Array.from(t).reverse(), n).slice(1)}`;
}, vA = (e) => {
	var t = e.points, n = e.className, r = e.baseLinePoints, i = e.connectNulls, a = dA(e, cA);
	if (!t || !t.length) return null;
	var o = N("recharts-polygon", n);
	if (r && r.length) {
		var s = a.stroke && a.stroke !== "none", c = _A(t, r, i);
		return /*#__PURE__*/ P.createElement("g", { className: o }, /*#__PURE__*/ P.createElement("path", uA({}, dt(a), {
			fill: c.slice(-1) === "Z" ? a.fill : "none",
			stroke: "none",
			d: c
		})), s ? /*#__PURE__*/ P.createElement("path", uA({}, dt(a), {
			fill: "none",
			d: gA(t, i)
		})) : null, s ? /*#__PURE__*/ P.createElement("path", uA({}, dt(a), {
			fill: "none",
			d: gA(r, i)
		})) : null);
	}
	var l = gA(t, i);
	return /*#__PURE__*/ P.createElement("path", uA({}, dt(a), {
		fill: l.slice(-1) === "Z" ? a.fill : "none",
		className: o,
		d: l
	}));
};
// ../../../peach/frontend/node_modules/recharts/es6/shape/Dot.js
function yA() {
	return yA = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, yA.apply(null, arguments);
}
var bA = (e) => {
	var t = e.cx, n = e.cy, r = e.r, i = e.className, a = N("recharts-dot", i);
	return I(t) && I(n) && I(r) ? /*#__PURE__*/ P.createElement("circle", yA({}, lt(e), Ur(e), {
		className: a,
		cx: t,
		cy: n,
		r
	})) : null;
}, xA = (e) => e.graphicalItems.polarItems, SA = H([
	xA,
	Q,
	H([X, Cg], VS)
], WS), CA = H([H([SA], YS), ph], QS), wA = H([
	CA,
	Q,
	SA
], eC);
H([
	CA,
	Q,
	SA
], (e, t, n) => n.length > 0 ? e.flatMap((e) => n.flatMap((n) => ({
	value: K(e, t.dataKey ?? n.dataKey),
	errorDomain: []
}))).filter(Boolean) : t?.dataKey == null ? e.map((e) => ({
	value: e,
	errorDomain: []
})) : e.map((e) => ({
	value: K(e, t.dataKey),
	errorDomain: []
})));
var TA = () => void 0, EA = H([
	Q,
	q,
	CA,
	wA,
	Jh,
	X,
	H([
		Q,
		vC,
		yC,
		TA,
		H([
			CA,
			Q,
			SA,
			xC,
			X,
			_h
		], wC),
		TA,
		q,
		X
	], UC)
], KC), DA = H([
	EA,
	zS,
	JC
], YC), OA = H([JC, H([
	Q,
	EA,
	DA,
	X
], ZC)], Ng), kA = (e, t, n) => {
	switch (t) {
		case "angleAxis": return fg(e, n);
		case "radiusAxis": return pg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, AA = (e, t, n) => {
	switch (t) {
		case "angleAxis": return yg(e, n);
		case "radiusAxis": return xg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, jA = H([H([
	kA,
	JC,
	OA,
	AA
], dS)], Mg), MA = H([
	q,
	wA,
	zS,
	X
], lw), NA = H([
	q,
	kA,
	JC,
	jA,
	DA,
	AA,
	kw,
	MA,
	X
], jw), PA = H([NA], (e) => {
	if (e) {
		var t = /* @__PURE__ */ new Map();
		return e.forEach((e) => {
			var n = (e.coordinate + 360) % 360;
			t.has(n) || t.set(n, e);
		}), Array.from(t.values());
	}
}), FA = H([
	q,
	kA,
	jA,
	AA,
	kw,
	MA,
	X
], Nw), IA = pc({
	name: "polarAxis",
	initialState: {
		radiusAxis: {},
		angleAxis: {}
	},
	reducers: {
		addRadiusAxis(e, t) {
			e.radiusAxis[t.payload.id] = U(t.payload);
		},
		removeRadiusAxis(e, t) {
			delete e.radiusAxis[t.payload.id];
		},
		addAngleAxis(e, t) {
			e.angleAxis[t.payload.id] = U(t.payload);
		},
		removeAngleAxis(e, t) {
			delete e.angleAxis[t.payload.id];
		}
	}
}), LA = IA.actions;
LA.addRadiusAxis, LA.removeRadiusAxis;
var RA = LA.addAngleAxis, zA = LA.removeAngleAxis, BA = IA.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/util/getClassNameFromUnknown.js
function VA(e) {
	return e && typeof e == "object" && "className" in e && typeof e.className == "string" ? e.className : "";
}
// ../../../peach/frontend/node_modules/recharts/es6/polar/PolarAngleAxis.js
var HA = ["children", "type"], UA = ["ref"];
function WA() {
	return WA = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, WA.apply(null, arguments);
}
function GA(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function KA(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? GA(Object(n), !0).forEach(function(t) {
			qA(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : GA(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function qA(e, t, n) {
	return (t = JA(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function JA(e) {
	var t = YA(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function YA(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function XA(e, t) {
	if (e == null) return {};
	var n, r, i = ZA(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function ZA(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var QA = 1e-5, $A = Math.cos(Lm(45)), ej = "angleAxis";
function tj(e) {
	var t = B(), n = Ju(), r = (0, P.useMemo)(() => {
		e.children;
		var t = e.type, r = XA(e, HA), i = ig(n, "angleAxis", t);
		if (i != null) return KA(KA({}, r), {}, { type: i });
	}, [e, n]), i = r === V((e) => fg(e, r?.id));
	return (0, P.useEffect)(() => r == null ? Kt : (t(RA(r)), () => {
		t(zA(r));
	}), [t, r]), i ? e.children : null;
}
var nj = (e, t) => {
	var n = t.cx, r = t.cy, i = t.radius, a = t.orientation, o = t.tickSize || 8, s = zm(n, r, i, e.coordinate), c = zm(n, r, i + (a === "inner" ? -1 : 1) * o, e.coordinate);
	return {
		x1: s.x,
		y1: s.y,
		x2: c.x,
		y2: c.y
	};
}, rj = (e, t) => {
	var n = Math.cos(Lm(-e.coordinate));
	return n > QA ? t === "outer" ? "start" : "end" : n < -QA ? t === "outer" ? "end" : "start" : "middle";
}, ij = (e) => {
	var t = Math.cos(Lm(-e.coordinate)), n = Math.sin(Lm(-e.coordinate));
	return Math.abs(t) <= $A ? n > 0 ? "start" : "end" : "middle";
}, aj = (e) => {
	var t = e.cx, n = e.cy, r = e.radius, i = e.axisLineType, a = e.axisLine, o = e.ticks;
	if (!a) return null;
	var s = KA(KA({}, lt(e)), {}, { fill: "none" }, lt(a));
	if (i === "circle") return /*#__PURE__*/ P.createElement(bA, WA({ className: "recharts-polar-angle-axis-line" }, s, {
		cx: t,
		cy: n,
		r
	}));
	var c = o.map((e) => zm(t, n, r, e.coordinate));
	return /*#__PURE__*/ P.createElement(vA, WA({ className: "recharts-polar-angle-axis-line" }, s, { points: c }));
}, oj = (e) => {
	var t = e.tick, n = e.tickProps, r = e.value;
	return t ? /*#__PURE__*/ P.isValidElement(t) ? /*#__PURE__*/ P.cloneElement(t, n) : typeof t == "function" ? t(n) : /*#__PURE__*/ P.createElement(xk, WA({}, n, { className: "recharts-polar-angle-axis-tick-value" }), r) : null;
}, sj = (e) => {
	var t = e.tick, n = e.tickLine, r = e.tickFormatter, i = e.stroke, a = e.ticks, o = lt(e);
	o.ref;
	var s = XA(o, UA), c = ut(t), l = KA(KA({}, s), {}, { fill: "none" }, lt(n)), u = a.map((a, o) => {
		var u = nj(a, e), d = rj(a, e.orientation), f = ij(a), p = KA(KA(KA({}, s), {}, {
			textAnchor: d,
			verticalAnchor: f,
			stroke: "none",
			fill: i
		}, c), {}, {
			index: o,
			payload: a,
			x: u.x2,
			y: u.y2
		});
		return /*#__PURE__*/ P.createElement(F, WA({
			className: N("recharts-polar-angle-axis-tick", VA(t)),
			key: `tick-${a.coordinate}`
		}, Gr(e, a, o)), n && /*#__PURE__*/ P.createElement("line", WA({ className: "recharts-polar-angle-axis-tick-line" }, l, u)), /*#__PURE__*/ P.createElement(oj, {
			tick: t,
			tickProps: p,
			value: r ? r(a.value, o) : a.value
		}));
	});
	return /*#__PURE__*/ P.createElement(F, { className: "recharts-polar-angle-axis-ticks" }, u);
}, cj = (e) => {
	var t = e.angleAxisId, n = V(Sg), r = V((e) => jA(e, "angleAxis", t)), i = ru(), a = V((e) => PA(e, "angleAxis", t, i));
	if (n == null || !a || !a.length || r == null) return null;
	var o = KA(KA(KA({}, e), {}, { scale: r }, n), {}, {
		radius: n.outerRadius,
		ticks: a
	});
	return /*#__PURE__*/ P.createElement(cD, { zIndex: o.zIndex }, /*#__PURE__*/ P.createElement(F, { className: N("recharts-polar-angle-axis", ej, o.className) }, /*#__PURE__*/ P.createElement(aj, o), /*#__PURE__*/ P.createElement(sj, o)));
};
function lj(e) {
	var t = Zr(e, tg);
	return /*#__PURE__*/ P.createElement(tj, {
		id: t.angleAxisId,
		scale: t.scale,
		type: t.type,
		dataKey: t.dataKey,
		unit: void 0,
		name: t.name,
		allowDuplicatedCategory: !1,
		allowDataOverflow: !1,
		reversed: t.reversed,
		includeHidden: !1,
		allowDecimals: t.allowDecimals,
		tickCount: t.tickCount,
		niceTicks: t.niceTicks ?? "auto",
		ticks: t.ticks,
		tick: t.tick,
		domain: t.domain
	}, /*#__PURE__*/ P.createElement(cj, t));
}
lj.displayName = "PolarAngleAxis";
// ../../../peach/frontend/node_modules/react-is/cjs/react-is.production.js
var uj = /* @__PURE__ */ T(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.suspense_list"), d = Symbol.for("react.memo"), f = Symbol.for("react.lazy"), p = Symbol.for("react.view_transition");
	function m(e) {
		if (typeof e == "object" && e) {
			var m = e.$$typeof;
			switch (m) {
				case t: switch (e = e.type, e) {
					case r:
					case a:
					case i:
					case l:
					case u:
					case p: return e;
					default: switch (e &&= e.$$typeof, e) {
						case s:
						case c:
						case f:
						case d: return e;
						case o: return e;
						default: return m;
					}
				}
				case n: return m;
			}
		}
	}
	e.isFragment = function(e) {
		return m(e) === r;
	};
})), dj = (/* @__PURE__ */ T(((e, t) => {
	t.exports = uj();
})))(), fj = (e) => typeof e == "string" ? e : e ? e.displayName || e.name || "Component" : "", pj = null, mj = null, hj = (e) => {
	if (e === pj && Array.isArray(mj)) return mj;
	var t = [];
	return P.Children.forEach(e, (e) => {
		R(e) || ((0, dj.isFragment)(e) ? t = t.concat(hj(e.props.children)) : t.push(e));
	}), mj = t, pj = e, t;
};
function gj(e, t) {
	var n = [], r = [];
	return r = Array.isArray(t) ? t.map((e) => fj(e)) : [fj(t)], hj(e).forEach((e) => {
		var t = At(e, "type.displayName") || At(e, "type.name");
		t && r.indexOf(t) !== -1 && n.push(e);
	}), n;
}
var _j = (e) => e && typeof e == "object" && "clipDot" in e ? !!e.clipDot : !0;
// ../../../peach/frontend/node_modules/recharts/es6/util/ActiveShapeUtils.js
function vj(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function yj(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? vj(Object(n), !0).forEach(function(t) {
			bj(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : vj(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function bj(e, t, n) {
	return (t = xj(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function xj(e) {
	var t = Sj(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Sj(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Cj(e, t) {
	return yj(yj({}, t), e);
}
function wj(e) {
	return /*#__PURE__*/ (0, P.isValidElement)(e) ? e.props : e;
}
function Tj(e, t) {
	return /*#__PURE__*/ (0, P.cloneElement)(e, Cj(wj(e), t));
}
function Ej(e) {
	if ("index" in e) {
		var t = e.index;
		return typeof t == "number" || typeof t == "string" ? t : void 0;
	}
}
function Dj(e) {
	return "isActive" in e && e.isActive === !0;
}
function Oj(e) {
	var t = e.option, n = e.DefaultShape, r = e.shapeProps, i = e.activeClassName, a = i === void 0 ? "recharts-active-shape" : i, o = e.inActiveClassName, s = o === void 0 ? "recharts-shape" : o, c = Ej(r), l = /*#__PURE__*/ (0, P.isValidElement)(t) ? Tj(t, r) : t === n ? /*#__PURE__*/ P.createElement(n, r) : typeof t == "function" ? t(r, c) : typeof t == "object" ? /*#__PURE__*/ P.createElement(n, Cj(t, r)) : /*#__PURE__*/ P.createElement(n, r);
	return Dj(r) ? /*#__PURE__*/ P.createElement(F, { className: a }, l) : /*#__PURE__*/ P.createElement(F, { className: s }, l);
}
// ../../../peach/frontend/node_modules/recharts/es6/context/tooltipContext.js
var kj = (e, t, n) => {
	var r = B();
	return (i, a) => (o) => {
		e?.(i, a, o), r(Zw({
			activeIndex: String(a),
			activeDataKey: t,
			activeCoordinate: i.tooltipPosition,
			activeGraphicalItemId: n
		}));
	};
}, Aj = (e) => {
	var t = B();
	return (n, r) => (i) => {
		e?.(n, r, i), t(Qw());
	};
}, jj = (e, t, n) => {
	var r = B();
	return (i, a) => (o) => {
		e?.(i, a, o), r(eT({
			activeIndex: String(a),
			activeDataKey: t,
			activeCoordinate: i.tooltipPosition,
			activeGraphicalItemId: n
		}));
	};
};
// ../../../peach/frontend/node_modules/recharts/es6/state/SetTooltipEntrySettings.js
function Mj(e) {
	var t = e.tooltipEntrySettings, n = B(), r = ru(), i = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		r || (i.current === null ? n(qw(t)) : i.current !== t && n(Jw({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		t,
		n,
		r
	]), (0, P.useLayoutEffect)(() => () => {
		i.current &&= (n(Yw(i.current)), null);
	}, [n]), null;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/SetLegendPayload.js
function Nj(e) {
	var t = e.legendPayload, n = B(), r = ru(), i = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		r || (i.current === null ? n(td(t)) : i.current !== t && n(nd({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		n,
		r,
		t
	]), (0, P.useLayoutEffect)(() => () => {
		i.current &&= (n(rd(i.current)), null);
	}, [n]), null;
}
function Pj(e) {
	var t = e.legendPayload, n = B(), r = V(q), i = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		(r === "centric" || r === "radial") && (i.current === null ? n(td(t)) : i.current !== t && n(nd({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		n,
		r,
		t
	]), (0, P.useLayoutEffect)(() => () => {
		i.current &&= (n(rd(i.current)), null);
	}, [n]), null;
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/matchBy.js
function Fj(e, t) {
	return Bj(e) || zj(e, t) || Lj(e, t) || Ij();
}
function Ij() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Lj(e, t) {
	if (e) {
		if (typeof e == "string") return Rj(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rj(e, t) : void 0;
	}
}
function Rj(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function zj(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function Bj(e) {
	if (Array.isArray(e)) return e;
}
var Vj = "index", Hj = "append";
function Uj(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [], r = [];
	for (var i of n) r.push({
		status: "removed",
		prev: i
	});
	for (var a = 0; a < t.length; a++) {
		var o = e[a], s = t[a];
		o == null ? r.push({
			status: "added",
			next: s
		}) : r.push({
			status: "matched",
			prev: o,
			next: s
		});
	}
	return r;
}
function Wj(e, t) {
	var n = e.length / t.length;
	return Uj(t.map((t, r) => e[Math.floor(r * n)]), t);
}
function Gj(e, t) {
	return Uj(t.map((t, n) => e[n]), t);
}
function Kj(e, t) {
	for (var n = /* @__PURE__ */ new Map(), r = 0; r < e.length; r++) {
		var i = e[r];
		if (i != null) {
			var a = t(i, r);
			a != null && !n.has(a) && n.set(a, i);
		}
	}
	return n;
}
function qj(e, t, n) {
	var r = Kj(e, n), i = /* @__PURE__ */ new Set(), a = t.map((e, t) => {
		var a = n(e, t);
		if (a != null) {
			var o = r.get(a);
			if (o !== void 0) return i.add(a), o;
		}
	}), o = [];
	for (var s of r) {
		var c = Fj(s, 2), l = c[0], u = c[1];
		i.has(l) || o.push(u);
	}
	return Uj(a, t, o);
}
function Jj(e, t, n) {
	return t == null ? null : e == null ? t.map((e) => ({
		status: "added",
		next: e
	})) : n === "index" ? Wj(e, t) : n === "append" ? Gj(e, t) : qj(e, t, n);
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/useAnimationStartSnapshot.js
function Yj(e, t) {
	var n = (0, P.useRef)(e), r = (0, P.useRef)(t.current), i = (0, P.useRef)(!0);
	n.current !== e && (n.current = e, r.current = t.current, i.current = !1);
	var a = (0, P.useCallback)(function(e, n) {
		var a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
		n === 0 ? i.current = !0 : (n === 1 && (r.current = e), n > 0 && i.current && a && (t.current = e));
	}, [t]);
	return {
		startValue: r.current,
		syncStepValue: a
	};
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/AnimatedItems.js
function Xj(e, t) {
	return tM(e) || eM(e, t) || Qj(e, t) || Zj();
}
function Zj() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Qj(e, t) {
	if (e) {
		if (typeof e == "string") return $j(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $j(e, t) : void 0;
	}
}
function $j(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function eM(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function tM(e) {
	if (Array.isArray(e)) return e;
}
function nM(e, t) {
	var n = Xj((0, P.useState)(!1), 2), r = n[0], i = n[1];
	return {
		isAnimating: r,
		handleAnimationStart: (0, P.useCallback)(() => {
			typeof e == "function" && e(), i(!0);
		}, [e]),
		handleAnimationEnd: (0, P.useCallback)(() => {
			typeof t == "function" && t(), i(!1);
		}, [t])
	};
}
function rM(e) {
	var t = e.animationInput, n = e.animationIdPrefix, r = e.items, i = e.previousItemsRef, a = e.isAnimationActive, o = e.animationBegin, s = e.animationDuration, c = e.animationEasing, l = e.onAnimationStart, u = e.onAnimationEnd, d = e.animationInterpolateFn, f = e.animationMatchBy, p = e.shouldUpdatePreviousRef, m = e.children, h = e.layout, g = Qp(t, n), _ = Yj(g, i), v = _.startValue ?? null, y = Jj(v, r, f ?? Vj);
	return /*#__PURE__*/ P.createElement(Zp, {
		animationId: g,
		begin: o,
		duration: s,
		isActive: a,
		easing: c,
		onAnimationEnd: u,
		onAnimationStart: l,
		key: g
	}, (e) => {
		var t = v == null, n = r == null ? r : d(y, e, h), i = p ? p(e) : e > 0;
		return _.syncStepValue(n, e, i), n == null ? null : m(n, e, t);
	});
}
function iM(e, t) {
	return lM(e) || cM(e, t) || oM(e, t) || aM();
}
function aM() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function oM(e, t) {
	if (e) {
		if (typeof e == "string") return sM(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? sM(e, t) : void 0;
	}
}
function sM(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function cM(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function lM(e) {
	if (Array.isArray(e)) return e;
}
var uM = P.useId ?? (() => iM(P.useState(() => Bt("uid-")), 1)[0]);
// ../../../peach/frontend/node_modules/recharts/es6/util/useUniqueId.js
function dM(e, t) {
	var n = uM();
	return t || (e ? `${e}-${n}` : n);
}
// ../../../peach/frontend/node_modules/recharts/es6/context/RegisterGraphicalItemId.js
var fM = /*#__PURE__*/ (0, P.createContext)(void 0), pM = (e) => {
	var t = e.id, n = e.type, r = e.children, i = dM(`recharts-${n}`, t);
	return /*#__PURE__*/ P.createElement(fM.Provider, { value: i }, r(i));
}, mM = pc({
	name: "graphicalItems",
	initialState: {
		cartesianItems: [],
		polarItems: []
	},
	reducers: {
		addCartesianGraphicalItem: {
			reducer(e, t) {
				e.cartesianItems.push(U(t.payload));
			},
			prepare: W()
		},
		replaceCartesianGraphicalItem: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = zs(e).cartesianItems.indexOf(U(r));
				a > -1 && (e.cartesianItems[a] = U(i));
			},
			prepare: W()
		},
		removeCartesianGraphicalItem: {
			reducer(e, t) {
				var n = zs(e).cartesianItems.indexOf(U(t.payload));
				n > -1 && e.cartesianItems.splice(n, 1);
			},
			prepare: W()
		},
		addPolarGraphicalItem: {
			reducer(e, t) {
				e.polarItems.push(U(t.payload));
			},
			prepare: W()
		},
		removePolarGraphicalItem: {
			reducer(e, t) {
				var n = zs(e).polarItems.indexOf(U(t.payload));
				n > -1 && e.polarItems.splice(n, 1);
			},
			prepare: W()
		},
		replacePolarGraphicalItem: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = zs(e).polarItems.indexOf(U(r));
				a > -1 && (e.polarItems[a] = U(i));
			},
			prepare: W()
		}
	}
}), hM = mM.actions, gM = hM.addCartesianGraphicalItem, _M = hM.replaceCartesianGraphicalItem, vM = hM.removeCartesianGraphicalItem, yM = hM.addPolarGraphicalItem, bM = hM.removePolarGraphicalItem, xM = hM.replacePolarGraphicalItem, SM = mM.reducer, CM = /*#__PURE__*/ (0, P.memo)((e) => {
	var t = B(), n = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		n.current === null ? t(gM(e)) : n.current !== e && t(_M({
			prev: n.current,
			next: e
		})), n.current = e;
	}, [t, e]), (0, P.useLayoutEffect)(() => () => {
		n.current &&= (t(vM(n.current)), null);
	}, [t]), null;
}), wM = /*#__PURE__*/ (0, P.memo)((e) => {
	var t = B(), n = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		n.current === null ? t(yM(e)) : n.current !== e && t(xM({
			prev: n.current,
			next: e
		})), n.current = e;
	}, [t, e]), (0, P.useLayoutEffect)(() => () => {
		n.current &&= (t(bM(n.current)), null);
	}, [t]), null;
}), TM = ["points"];
function EM(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function DM(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? EM(Object(n), !0).forEach(function(t) {
			OM(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : EM(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function OM(e, t, n) {
	return (t = kM(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function kM(e) {
	var t = AM(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function AM(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function jM() {
	return jM = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, jM.apply(null, arguments);
}
function MM(e, t) {
	if (e == null) return {};
	var n, r, i = NM(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function NM(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function PM(e) {
	var t = e.option, n = e.dotProps, r = e.className;
	if (/*#__PURE__*/ (0, P.isValidElement)(t)) return /*#__PURE__*/ (0, P.cloneElement)(t, n);
	if (typeof t == "function") return t(n);
	var i = N(r, typeof t == "boolean" ? "" : t.className), a = n ?? {};
	a.points;
	var o = MM(a, TM);
	return /*#__PURE__*/ P.createElement(bA, jM({}, o, { className: i }));
}
function FM(e, t) {
	return e == null ? !1 : t ? !0 : e.length === 1;
}
function IM(e) {
	var t = e.points, n = e.dot, r = e.className, i = e.dotClassName, a = e.dataKey, o = e.baseProps, s = e.needClip, c = e.clipPathId, l = e.zIndex, u = l === void 0 ? Y.scatter : l;
	if (!FM(t, n)) return null;
	var d = _j(n), f = ft(n), p = t.map((e, r) => {
		var s = DM(DM(DM({ r: 3 }, o), f), {}, {
			index: r,
			cx: e.x ?? void 0,
			cy: e.y ?? void 0,
			dataKey: a,
			value: e.value,
			payload: e.payload,
			points: t
		});
		return /*#__PURE__*/ P.createElement(PM, {
			key: `dot-${r}`,
			option: n,
			dotProps: s,
			className: i
		});
	}), m = {};
	return s && c != null && (m.clipPath = `url(#clipPath-${d ? "" : "dots-"}${c})`), /*#__PURE__*/ P.createElement(cD, { zIndex: u }, /*#__PURE__*/ P.createElement(F, jM({ className: r }, m), p));
}
// ../../../peach/frontend/node_modules/recharts/es6/state/cartesianAxisSlice.js
function LM(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function RM(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? LM(Object(n), !0).forEach(function(t) {
			zM(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : LM(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function zM(e, t, n) {
	return (t = BM(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function BM(e) {
	var t = VM(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function VM(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var HM = pc({
	name: "cartesianAxis",
	initialState: {
		xAxis: {},
		yAxis: {},
		zAxis: {}
	},
	reducers: {
		addXAxis: {
			reducer(e, t) {
				e.xAxis[t.payload.id] = U(t.payload);
			},
			prepare: W()
		},
		replaceXAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.xAxis[r.id] !== void 0 && (r.id !== i.id && delete e.xAxis[r.id], e.xAxis[i.id] = U(i));
			},
			prepare: W()
		},
		removeXAxis: {
			reducer(e, t) {
				delete e.xAxis[t.payload.id];
			},
			prepare: W()
		},
		addYAxis: {
			reducer(e, t) {
				e.yAxis[t.payload.id] = U(t.payload);
			},
			prepare: W()
		},
		replaceYAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.yAxis[r.id] !== void 0 && (r.id !== i.id && delete e.yAxis[r.id], e.yAxis[i.id] = U(i));
			},
			prepare: W()
		},
		removeYAxis: {
			reducer(e, t) {
				delete e.yAxis[t.payload.id];
			},
			prepare: W()
		},
		addZAxis: {
			reducer(e, t) {
				e.zAxis[t.payload.id] = U(t.payload);
			},
			prepare: W()
		},
		replaceZAxis: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next;
				e.zAxis[r.id] !== void 0 && (r.id !== i.id && delete e.zAxis[r.id], e.zAxis[i.id] = U(i));
			},
			prepare: W()
		},
		removeZAxis: {
			reducer(e, t) {
				delete e.zAxis[t.payload.id];
			},
			prepare: W()
		},
		updateYAxisWidth(e, t) {
			var n = t.payload, r = n.id, i = n.width, a = e.yAxis[r];
			if (a) {
				var o = a.widthHistory || [];
				if (o.length === 3 && o[0] === o[2] && i === o[1] && i !== a.width && Math.abs(i - (o[0] ?? 0)) <= 1) return;
				var s = [...o, i].slice(-3);
				e.yAxis[r] = RM(RM({}, a), {}, {
					width: i,
					widthHistory: s
				});
			}
		},
		updateXAxisHeight(e, t) {
			var n = t.payload, r = n.id, i = n.height, a = e.xAxis[r];
			if (a) {
				var o = a.heightHistory || [];
				if (o.length === 3 && o[0] === o[2] && i === o[1] && i !== a.height && Math.abs(i - (o[0] ?? 0)) <= 1) return;
				var s = [...o, i].slice(-3);
				e.xAxis[r] = RM(RM({}, a), {}, {
					height: i,
					heightHistory: s
				});
			}
		}
	}
}), UM = HM.actions, WM = UM.addXAxis, GM = UM.replaceXAxis, KM = UM.removeXAxis, qM = UM.addYAxis, JM = UM.replaceYAxis, YM = UM.removeYAxis;
UM.addZAxis, UM.replaceZAxis, UM.removeZAxis;
var XM = UM.updateYAxisWidth, ZM = UM.updateXAxisHeight, QM = HM.reducer, $M = H([
	H([$l], (e) => ({
		top: e.top,
		bottom: e.bottom,
		left: e.left,
		right: e.right
	})),
	Il,
	Ll
], (e, t, n) => {
	if (e && t != null && n != null) return {
		x: e.left,
		y: e.top,
		width: Math.max(0, t - e.left - e.right),
		height: Math.max(0, n - e.top - e.bottom)
	};
}), eN = () => V($M), tN = () => V(dE);
// ../../../peach/frontend/node_modules/recharts/es6/component/ActivePoints.js
function nN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function rN(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? nN(Object(n), !0).forEach(function(t) {
			iN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : nN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function iN(e, t, n) {
	return (t = aN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function aN(e) {
	var t = oN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function oN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var sN = (e) => {
	var t = e.point, n = e.childIndex, r = e.mainColor, i = e.activeDot, a = e.dataKey, o = e.clipPath;
	if (i === !1 || t.x == null || t.y == null) return null;
	var s = rN(rN(rN({}, {
		index: n,
		dataKey: a,
		cx: t.x,
		cy: t.y,
		r: 4,
		fill: r ?? "none",
		strokeWidth: 2,
		stroke: "#fff",
		payload: t.payload,
		value: t.value
	}), ut(i)), Ur(i)), c = /*#__PURE__*/ (0, P.isValidElement)(i) ? /*#__PURE__*/ (0, P.cloneElement)(i, s) : typeof i == "function" ? i(s) : /*#__PURE__*/ P.createElement(bA, s);
	return /*#__PURE__*/ P.createElement(F, {
		className: "recharts-active-dot",
		clipPath: o
	}, c);
};
function cN(e) {
	var t = e.points, n = e.mainColor, r = e.activeDot, i = e.itemDataKey, a = e.clipPath, o = e.zIndex, s = o === void 0 ? Y.activeDot : o, c = V(iE), l = tN();
	if (t == null || l == null) return null;
	var u = t.find((e) => l.includes(e.payload));
	return R(u) ? null : /*#__PURE__*/ P.createElement(cD, { zIndex: s }, /*#__PURE__*/ P.createElement(sN, {
		point: u,
		childIndex: Number(c),
		mainColor: n,
		dataKey: i,
		activeDot: r,
		clipPath: a
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/util/RadialBarUtils.js
var lN = ["option"];
function uN(e, t) {
	if (e == null) return {};
	var n, r, i = dN(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function dN(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var fN = sh;
function pN(e) {
	return typeof e == "string" ? parseInt(e, 10) : e;
}
function mN(e) {
	var t = e.option, n = uN(e, lN);
	return /*#__PURE__*/ P.createElement(Oj, {
		option: t,
		DefaultShape: fN,
		shapeProps: n
	});
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineBarSizeList.js
function hN(e, t) {
	return bN(e) || yN(e, t) || _N(e, t) || gN();
}
function gN() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _N(e, t) {
	if (e) {
		if (typeof e == "string") return vN(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? vN(e, t) : void 0;
	}
}
function vN(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function yN(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function bN(e) {
	if (Array.isArray(e)) return e;
}
var xN = (e, t, n) => {
	var r = n ?? e;
	if (!R(r)) return Vt(r, t, 0);
}, SN = (e, t, n) => {
	var r = {}, i = e.filter(Eg), a = e.filter((e) => e.stackId == null), o = i.reduce((e, t) => {
		var n = e[t.stackId];
		return n ??= [], n.push(t), e[t.stackId] = n, e;
	}, r), s = Object.entries(o).map((e) => {
		var r = hN(e, 2), i = r[0], a = r[1];
		return {
			stackId: i,
			dataKeys: a.map((e) => e.dataKey),
			barSize: xN(t, n, a[0]?.barSize)
		};
	}), c = a.map((e) => ({
		stackId: void 0,
		dataKeys: [e.dataKey].filter((e) => e != null),
		barSize: xN(t, n, e.barSize)
	}));
	return [...s, ...c];
};
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineAllBarPositions.js
function CN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function wN(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? CN(Object(n), !0).forEach(function(t) {
			TN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : CN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function TN(e, t, n) {
	return (t = EN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function EN(e) {
	var t = DN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function DN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function ON(e, t, n, r, i) {
	var a = r.length;
	if (!(a < 1)) {
		var o = Vt(e, n, 0, !0), s, c = [];
		if (G(r[0]?.barSize)) {
			var l = !1, u = n / a, d = r.reduce((e, t) => e + (t.barSize || 0), 0);
			d += (a - 1) * o, d >= n && (d -= (a - 1) * o, o = 0), d >= n && u > 0 && (l = !0, u *= .9, d = a * u);
			var f = {
				offset: Math.round((n - d) / 2) - o,
				size: 0
			};
			s = r.reduce((e, t) => {
				var n = {
					stackId: t.stackId,
					dataKeys: t.dataKeys,
					position: {
						offset: f.offset + f.size + o,
						size: l ? u : t.barSize ?? 0
					}
				}, r = [...e, n];
				return f = n.position, r;
			}, c);
		} else {
			var p = Vt(t, n, 0, !0);
			n - 2 * p - (a - 1) * o <= 0 && (o = 0);
			var m = (n - 2 * p - (a - 1) * o) / a;
			m > 1 && (m = Math.round(m));
			var h = G(i) ? Math.min(m, i) : m;
			s = r.reduce((e, t, n) => [...e, {
				stackId: t.stackId,
				dataKeys: t.dataKeys,
				position: {
					offset: p + a * (m - h) / 2 + (h + o) * n,
					size: h
				}
			}], c);
		}
		return s;
	}
}
var kN = (e, t, n, r, i, a, o) => {
	var s = R(o) ? t : o, c = ON(n, r, i === a ? a : i, e, s);
	return i !== a && c != null && (c = c.map((e) => wN(wN({}, e), {}, { position: wN(wN({}, e.position), {}, { offset: e.position.offset - i / 2 }) }))), c;
}, AN = (e, t) => {
	var n = wg(t);
	if (e && n != null && t != null) {
		var r = t.stackId;
		if (r != null) {
			var i = e[r];
			if (i) {
				var a = i.stackedData;
				if (a) return a.find((e) => e.key === n);
			}
		}
	}
}, jN = (e, t) => {
	if (e != null && t != null) {
		var n = e.find((e) => e.stackId === t.stackId && t.dataKey != null && e.dataKeys.includes(t.dataKey));
		if (n != null) return n.position;
	}
};
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/radialBarSelectors.js
function MN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function NN(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? MN(Object(n), !0).forEach(function(t) {
			PN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : MN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function PN(e, t, n) {
	return (t = FN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function FN(e) {
	var t = IN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function IN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var LN = H([(e, t) => pg(e, t), (e, t) => jA(e, "radiusAxis", t)], (e, t) => {
	if (e != null && t != null) return NN(NN({}, e), {}, { scale: t });
}), RN = (e, t) => FA(e, "radiusAxis", t, !1), zN = H([(e, t, n) => fg(e, n), (e, t, n) => jA(e, "angleAxis", n)], (e, t) => {
	if (e != null && t != null) return NN(NN({}, e), {}, { scale: t });
}), BN = (e, t, n) => NA(e, "angleAxis", n, !1), VN = H([xA, (e, t, n, r) => r], (e, t) => {
	if (e.some((e) => e.type === "radialBar" && t.dataKey === e.dataKey && t.stackId === e.stackId)) return t;
}), HN = H([
	q,
	LN,
	RN,
	zN,
	BN
], (e, t, n, r, i) => gl(e, "radiusAxis") ? jl(t, n, !1) : jl(r, i, !1)), UN = H([
	zN,
	LN,
	q
], (e, t, n) => {
	var r = n === "radial" ? e : t;
	if (r != null && r.scale != null) return Tl({ numericAxis: r });
}), WN = (e, t, n, r, i) => i, GN = (e, t, n, r, i) => n, KN = (e, t, n, r, i) => t, qN = (e, t, n, r, i) => r.maxBarSize, JN = (e) => e.type === "radialBar", YN = H([H([
	H([
		H([
			q,
			xA,
			GN,
			KN
		], (e, t, n, r) => t.filter((t) => e === "centric" ? t.angleAxisId === n : t.radiusAxisId === r).filter((e) => e.hide === !1).filter(JN)),
		qh,
		() => void 0
	], SN),
	Wh,
	Gh,
	Kh,
	H([
		q,
		Wh,
		zN,
		BN,
		LN,
		RN,
		qN
	], (e, t, n, r, i, a, o) => {
		var s = R(o) ? t : o;
		return e === "centric" ? jl(n, r, !0) ?? s ?? 0 : jl(i, a, !0) ?? s ?? 0;
	}),
	HN,
	qN
], kN), VN], jN), XN = H([SA], (e) => e.filter(JN).filter(Eg)), ZN = H([
	H([
		XN,
		ph,
		uC
	], Tg),
	XN,
	Jh,
	Yh
], pC), QN = H([
	zN,
	BN,
	LN,
	RN,
	fh,
	VN,
	HN,
	q,
	UN,
	Sg,
	WN,
	YN,
	H([(e, t, n) => q(e) === "centric" ? ZN(e, "radiusAxis", t) : ZN(e, "angleAxis", n), VN], AN)
], (e, t, n, r, i, a, o, s, c, l, u, d, f) => {
	var p = i.chartData, m = i.dataStartIndex, h = i.dataEndIndex;
	if (a == null || n == null || e == null || p == null || o == null || d == null || s !== "centric" && s !== "radial" || r == null || l == null) return [];
	var g = a.dataKey, _ = a.minPointSize, v = l.cx, y = l.cy, b = l.startAngle, x = l.endAngle;
	return CP({
		angleAxis: e,
		angleAxisTicks: t,
		bandSize: o,
		baseValue: c,
		cells: u,
		cx: v,
		cy: y,
		dataKey: g,
		dataStartIndex: m,
		displayedData: p.slice(m, h + 1),
		endAngle: x,
		layout: s,
		minPointSize: _,
		pos: d,
		radiusAxis: n,
		radiusAxisTicks: r,
		stackedData: f,
		stackedDomain: f ? (s === "centric" ? n : e).scale.domain() : null,
		startAngle: b
	});
}), $N = H([ph, (e, t) => t], (e, t) => {
	var n = e.chartData, r = e.dataStartIndex, i = e.dataEndIndex;
	if (n == null) return [];
	var a = n.slice(r, i + 1);
	return a.length === 0 ? [] : a.map((e) => ({
		type: t,
		value: e.name,
		color: e.fill,
		payload: e
	}));
});
// ../../../peach/frontend/node_modules/recharts/es6/zIndex/getZIndexFromUnknown.js
function eP(e, t) {
	return e && typeof e == "object" && "zIndex" in e && typeof e.zIndex == "number" && G(e.zIndex) ? e.zIndex : t;
}
// ../../../peach/frontend/node_modules/recharts/es6/polar/RadialBar.js
var tP = [
	"shape",
	"activeShape",
	"cornerRadius",
	"id"
], nP = [
	"onMouseEnter",
	"onClick",
	"onMouseLeave"
], rP = ["value", "background"];
function iP() {
	return iP = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, iP.apply(null, arguments);
}
function aP(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function oP(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? aP(Object(n), !0).forEach(function(t) {
			sP(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : aP(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function sP(e, t, n) {
	return (t = cP(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function cP(e) {
	var t = lP(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function lP(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function uP(e, t) {
	if (e == null) return {};
	var n, r, i = dP(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function dP(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var fP = [];
function pP(e) {
	var t = e.showLabels, n = e.sectors, r = e.children, i = n.map((e) => ({
		value: e.value,
		payload: e.payload,
		parentViewBox: void 0,
		clockWise: !1,
		viewBox: {
			cx: e.cx,
			cy: e.cy,
			innerRadius: e.innerRadius,
			outerRadius: e.outerRadius,
			startAngle: e.startAngle,
			endAngle: e.endAngle,
			clockWise: !1
		},
		fill: e.fill
	}));
	return /*#__PURE__*/ P.createElement(rA, { value: t ? i : void 0 }, r);
}
function mP(e) {
	var t = e.sectors, n = e.allOtherRadialBarProps, r = e.showLabels, i = e.animationElapsedTime, a = e.isAnimating, o = e.isEntrance, s = n.shape, c = n.activeShape, l = n.cornerRadius, u = n.id, d = uP(n, tP), f = lt(d), p = V(iE), m = n.onMouseEnter, h = n.onClick, g = n.onMouseLeave, _ = uP(n, nP), v = kj(m, n.dataKey, u), y = Aj(g), b = jj(h, n.dataKey, u);
	return t == null ? null : /*#__PURE__*/ P.createElement(pP, {
		showLabels: r,
		sectors: t
	}, t.map((e, t) => {
		var n = !!(c && p === String(t)), r = v(e, t), u = y(e, t), m = b(e, t), h = oP(oP(oP(oP({}, f), {}, { cornerRadius: pN(l) }, e), Gr(_, e, t)), {}, {
			onMouseEnter: r,
			onMouseLeave: u,
			onClick: m,
			className: `recharts-radial-bar-sector ${e.className}`,
			forceCornerRadius: d.forceCornerRadius,
			cornerIsExternal: d.cornerIsExternal,
			animationElapsedTime: i,
			isAnimating: a,
			isEntrance: o,
			isActive: n,
			option: n && c != null ? c : s,
			index: t
		});
		return n ? /*#__PURE__*/ P.createElement(cD, {
			zIndex: Y.activeBar,
			key: `sector-${e.cx}-${e.cy}-${e.innerRadius}-${e.outerRadius}-${e.startAngle}-${e.endAngle}-${t}`
		}, /*#__PURE__*/ P.createElement(mN, h)) : /*#__PURE__*/ P.createElement(mN, iP({ key: `sector-${e.cx}-${e.cy}-${e.innerRadius}-${e.outerRadius}-${e.startAngle}-${e.endAngle}-${t}` }, h));
	}), /*#__PURE__*/ P.createElement(sA, { label: n.label }), n.children);
}
var hP = (e, t) => e == null ? [] : t === 1 ? e.flatMap((e) => e.status === "removed" ? [] : [e.next]) : e.flatMap((e) => e.status === "removed" ? [] : e.status === "matched" ? [oP(oP({}, e.next), {}, {
	startAngle: L(e.prev.startAngle, e.next.startAngle, t),
	endAngle: L(e.prev.endAngle, e.next.endAngle, t)
})] : [oP(oP({}, e.next), {}, { endAngle: L(e.next.startAngle, e.next.endAngle, t) })]);
function gP(e) {
	var t = e.props, n = e.previousSectorsRef, r = t.sectors, i = t.isAnimationActive, a = t.animationBegin, o = t.animationDuration, s = t.animationEasing, c = t.onAnimationStart, l = t.onAnimationEnd, u = nM(c, l), d = u.isAnimating, f = u.handleAnimationStart, p = u.handleAnimationEnd, m = Ju();
	return m == null ? null : /*#__PURE__*/ P.createElement(rM, {
		animationInput: t,
		animationIdPrefix: "recharts-radialbar-",
		items: r,
		previousItemsRef: n,
		isAnimationActive: i,
		animationBegin: a,
		animationDuration: o,
		animationEasing: s,
		onAnimationStart: f,
		onAnimationEnd: p,
		animationInterpolateFn: t.animationInterpolateFn,
		animationMatchBy: t.animationMatchBy,
		layout: m
	}, (e, n, r) => /*#__PURE__*/ P.createElement(mP, {
		sectors: e,
		allOtherRadialBarProps: t,
		showLabels: !d,
		animationElapsedTime: n,
		isAnimating: d || n < 1,
		isEntrance: r
	}));
}
function _P(e) {
	var t = (0, P.useRef)(null);
	return /*#__PURE__*/ P.createElement(gP, {
		props: e,
		previousSectorsRef: t
	});
}
function vP(e) {
	var t = V((t) => $N(t, e.legendType));
	return /*#__PURE__*/ P.createElement(Pj, { legendPayload: t ?? [] });
}
var yP = /*#__PURE__*/ P.memo((e) => {
	var t = e.dataKey, n = e.sectors, r = e.stroke, i = e.strokeWidth, a = e.name, o = e.hide, s = e.fill, c = e.tooltipType, l = e.formatter, u = {
		dataDefinedOnItem: n,
		getPosition: Kt,
		settings: {
			graphicalItemId: e.id,
			stroke: r,
			strokeWidth: i,
			fill: s,
			nameKey: void 0,
			dataKey: t,
			name: Nl(a, t),
			hide: o,
			type: c,
			color: s,
			unit: "",
			formatter: l
		}
	};
	return /*#__PURE__*/ P.createElement(Mj, { tooltipEntrySettings: u });
}), bP = class extends P.PureComponent {
	renderBackground(e) {
		if (e == null) return null;
		var t = this.props.cornerRadius, n = ut(this.props.background);
		return /*#__PURE__*/ P.createElement(cD, { zIndex: eP(this.props.background, Y.barBackground) }, e.map((e, r) => {
			e.value;
			var i = e.background, a = uP(e, rP);
			if (!i) return null;
			var o = oP(oP(oP(oP(oP({ cornerRadius: pN(t) }, a), {}, { fill: "#eee" }, i), n), Gr(this.props, e, r)), {}, {
				index: r,
				className: N("recharts-radial-bar-background-sector", String(n?.className)),
				option: i,
				isActive: !1
			});
			return /*#__PURE__*/ P.createElement(mN, iP({ key: `background-${a.cx}-${a.cy}-${a.innerRadius}-${a.outerRadius}-${a.startAngle}-${a.endAngle}-${r}` }, o));
		}));
	}
	render() {
		var e = this.props, t = e.hide, n = e.sectors, r = e.className, i = e.background;
		if (t) return null;
		var a = N("recharts-area", r);
		return /*#__PURE__*/ P.createElement(cD, { zIndex: this.props.zIndex }, /*#__PURE__*/ P.createElement(F, { className: a }, i && /*#__PURE__*/ P.createElement(F, { className: "recharts-radial-bar-background" }, this.renderBackground(n)), /*#__PURE__*/ P.createElement(F, { className: "recharts-radial-bar-sectors" }, /*#__PURE__*/ P.createElement(_P, this.props))));
	}
};
function xP(e) {
	var t = P.useMemo(() => gj(e.children, cO), [e.children]), n = P.useMemo(() => ({
		data: void 0,
		hide: !1,
		id: e.id,
		dataKey: e.dataKey,
		minPointSize: e.minPointSize,
		stackId: Sl(e.stackId),
		maxBarSize: e.maxBarSize,
		barSize: e.barSize,
		type: "radialBar",
		angleAxisId: e.angleAxisId,
		radiusAxisId: e.radiusAxisId
	}), [
		e.id,
		e.dataKey,
		e.minPointSize,
		e.stackId,
		e.maxBarSize,
		e.barSize,
		e.angleAxisId,
		e.radiusAxisId
	]), r = V((r) => QN(r, e.radiusAxisId, e.angleAxisId, n, t)) ?? fP;
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(yP, {
		dataKey: e.dataKey,
		sectors: r,
		stroke: e.stroke,
		strokeWidth: e.strokeWidth,
		name: e.name,
		hide: e.hide,
		fill: e.fill,
		tooltipType: e.tooltipType,
		formatter: e.formatter,
		id: e.id
	}), /*#__PURE__*/ P.createElement(bP, iP({}, e, { sectors: r })));
}
var SP = {
	angleAxisId: 0,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	animationMatchBy: Hj,
	animationInterpolateFn: hP,
	background: !1,
	cornerIsExternal: !1,
	cornerRadius: 0,
	forceCornerRadius: !1,
	hide: !1,
	isAnimationActive: "auto",
	label: !1,
	legendType: "rect",
	minPointSize: 0,
	radiusAxisId: 0,
	shape: fN,
	zIndex: Y.bar
};
function CP(e) {
	var t = e.displayedData, n = e.stackedData, r = e.dataStartIndex, i = e.stackedDomain, a = e.dataKey, o = e.baseValue, s = e.layout, c = e.radiusAxis, l = e.radiusAxisTicks, u = e.bandSize, d = e.pos, f = e.angleAxis, p = e.minPointSize, m = e.cx, h = e.cy, g = e.angleAxisTicks, _ = e.cells, v = e.startAngle, y = e.endAngle;
	return g == null || l == null ? fP : (t ?? []).map((e, t) => {
		var b, x, S, C, w, T;
		if (n ? b = yl(n[r + t], i) : (b = K(e, a), Array.isArray(b) || (b = [o, b])), s === "radial") {
			if (C = f.scale.map(b[0]) ?? v, w = f.scale.map(b[1]) ?? y, x = wl({
				axis: c,
				ticks: l,
				bandSize: u,
				offset: d.offset,
				entry: e,
				index: t
			}), x != null && w != null && C != null) {
				S = x + d.size;
				var E = w - C;
				if (Math.abs(p) > 0 && Math.abs(E) < Math.abs(p)) {
					var D = Ft(E || p) * (Math.abs(p) - Math.abs(E));
					w += D;
				}
				T = { background: {
					cx: m,
					cy: h,
					innerRadius: x,
					outerRadius: S,
					startAngle: v,
					endAngle: y
				} };
			}
		} else if (x = c.scale.map(b[0]), S = c.scale.map(b[1]), C = wl({
			axis: f,
			ticks: g,
			bandSize: u,
			offset: d.offset,
			entry: e,
			index: t
		}), x != null && S != null && C != null) {
			w = C + d.size;
			var O = S - x;
			if (Math.abs(p) > 0 && Math.abs(O) < Math.abs(p)) {
				var k = Ft(O || p) * (Math.abs(p) - Math.abs(O));
				S += k;
			}
		}
		return oP(oP(oP({}, e), T), {}, {
			payload: e,
			value: n ? b : b[1],
			cx: m,
			cy: h,
			innerRadius: x,
			outerRadius: S,
			startAngle: C,
			endAngle: w
		}, _ && _[t] && _[t].props);
	});
}
function wP(e) {
	var t = Zr(e, SP);
	return /*#__PURE__*/ P.createElement(pM, {
		id: t.id,
		type: "radialBar"
	}, (e) => /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(wM, {
		type: "radialBar",
		id: e,
		data: void 0,
		dataKey: t.dataKey,
		hide: t.hide ?? SP.hide,
		angleAxisId: t.angleAxisId ?? SP.angleAxisId,
		radiusAxisId: t.radiusAxisId ?? SP.radiusAxisId,
		stackId: Sl(t.stackId),
		barSize: t.barSize,
		minPointSize: t.minPointSize,
		maxBarSize: t.maxBarSize
	}), /*#__PURE__*/ P.createElement(vP, t), /*#__PURE__*/ P.createElement(xP, iP({}, t, { id: e }))));
}
wP.displayName = "RadialBar";
// ../../../peach/frontend/node_modules/recharts/es6/context/chartDataContext.js
var TP = (e) => {
	var t = e.chartData, n = B(), r = ru();
	return (0, P.useEffect)(() => r ? () => {} : (n(jD(t)), () => {
		n(jD(void 0));
	}), [
		t,
		n,
		r
	]), null;
}, EP = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	}
}, DP = pc({
	name: "brush",
	initialState: EP,
	reducers: { setBrushSettings(e, t) {
		return t.payload == null ? EP : t.payload;
	} }
});
DP.actions.setBrushSettings;
var OP = DP.reducer, kP = (e, t) => {
	var n = e.x, r = e.y, i = t.x, a = t.y;
	return {
		x: Math.min(n, i),
		y: Math.min(r, a),
		width: Math.abs(i - n),
		height: Math.abs(a - r)
	};
}, AP = (e) => {
	var t = e.x1, n = e.y1, r = e.x2, i = e.y2;
	return kP({
		x: t,
		y: n
	}, {
		x: r,
		y: i
	});
};
function jP(e) {
	return (e % 180 + 180) % 180;
}
var MP = function(e) {
	var t = e.width, n = e.height, r = jP(arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0) * Math.PI / 180, i = Math.atan(n / t), a = r > i && r < Math.PI - i ? n / Math.sin(r) : t / Math.cos(r);
	return Math.abs(a);
}, NP = pc({
	name: "referenceElements",
	initialState: {
		dots: [],
		areas: [],
		lines: []
	},
	reducers: {
		addDot: (e, t) => {
			e.dots.push(t.payload);
		},
		removeDot: (e, t) => {
			var n = zs(e).dots.findIndex((e) => e === t.payload);
			n !== -1 && e.dots.splice(n, 1);
		},
		addArea: (e, t) => {
			e.areas.push(t.payload);
		},
		removeArea: (e, t) => {
			var n = zs(e).areas.findIndex((e) => e === t.payload);
			n !== -1 && e.areas.splice(n, 1);
		},
		addLine: (e, t) => {
			e.lines.push(U(t.payload));
		},
		removeLine: (e, t) => {
			var n = zs(e).lines.findIndex((e) => e === t.payload);
			n !== -1 && e.lines.splice(n, 1);
		}
	}
}), PP = NP.actions;
PP.addDot, PP.removeDot, PP.addArea, PP.removeArea;
var FP = PP.addLine, IP = PP.removeLine, LP = NP.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/container/ClipPathProvider.js
function RP(e, t) {
	return UP(e) || HP(e, t) || BP(e, t) || zP();
}
function zP() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function BP(e, t) {
	if (e) {
		if (typeof e == "string") return VP(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? VP(e, t) : void 0;
	}
}
function VP(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function HP(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function UP(e) {
	if (Array.isArray(e)) return e;
}
var WP = /*#__PURE__*/ (0, P.createContext)(void 0), GP = (e) => {
	var t = e.children, n = RP((0, P.useState)(`${Bt("recharts")}-clip`), 1)[0], r = eN();
	if (r == null) return null;
	var i = r.x, a = r.y, o = r.width, s = r.height;
	return /*#__PURE__*/ P.createElement(WP.Provider, { value: n }, /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement("clipPath", { id: n }, /*#__PURE__*/ P.createElement("rect", {
		x: i,
		y: a,
		height: s,
		width: o
	}))), t);
}, KP = () => (0, P.useContext)(WP), qP = class {
	constructor(e) {
		var t = e.x, n = e.y;
		this.xAxisScale = t, this.yAxisScale = n;
	}
	map(e, t) {
		var n = t.position;
		return {
			x: this.xAxisScale.map(e.x, { position: n }) ?? 0,
			y: this.yAxisScale.map(e.y, { position: n }) ?? 0
		};
	}
	mapWithFallback(e, t) {
		var n = t.position, r = t.fallback, i = r === "rangeMin" ? this.yAxisScale.rangeMin() : r === "rangeMax" ? this.yAxisScale.rangeMax() : 0, a = r === "rangeMin" ? this.xAxisScale.rangeMin() : r === "rangeMax" ? this.xAxisScale.rangeMax() : 0;
		return {
			x: this.xAxisScale.map(e.x, { position: n }) ?? a,
			y: this.yAxisScale.map(e.y, { position: n }) ?? i
		};
	}
	isInRange(e) {
		var t = e.x, n = e.y, r = t == null || this.xAxisScale.isInRange(t), i = n == null || this.yAxisScale.isInRange(n);
		return r && i;
	}
};
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/ReferenceLine.js
function JP(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function YP(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? JP(Object(n), !0).forEach(function(t) {
			XP(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : JP(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function XP(e, t, n) {
	return (t = ZP(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ZP(e) {
	var t = QP(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function QP(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function $P() {
	return $P = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, $P.apply(null, arguments);
}
var eF = (e, t) => {
	var n;
	if (/*#__PURE__*/ P.isValidElement(e)) n = /*#__PURE__*/ P.cloneElement(e, t);
	else if (typeof e == "function") n = e(t);
	else {
		if (!G(t.x1) || !G(t.y1) || !G(t.x2) || !G(t.y2)) return null;
		n = /*#__PURE__*/ P.createElement("line", $P({}, t, { className: "recharts-reference-line-line" }));
	}
	return n;
}, tF = (e, t, n, r, i, a) => {
	var o = a.x, s = a.width, c = i.map(e, { position: n });
	if (!G(c) || t === "discard" && !i.isInRange(c)) return null;
	var l = [{
		x: o + s,
		y: c
	}, {
		x: o,
		y: c
	}];
	return r === "left" ? l.reverse() : l;
}, nF = (e, t, n, r, i, a) => {
	var o = a.y, s = a.height, c = i.map(e, { position: n });
	if (!G(c) || t === "discard" && !i.isInRange(c)) return null;
	var l = [{
		x: c,
		y: o + s
	}, {
		x: c,
		y: o
	}];
	return r === "top" ? l.reverse() : l;
}, rF = (e, t, n, r) => {
	var i = [r.mapWithFallback(e[0], {
		position: n,
		fallback: "rangeMin"
	}), r.mapWithFallback(e[1], {
		position: n,
		fallback: "rangeMax"
	})];
	return t === "discard" && i.some((e) => !r.isInRange(e)) ? null : i;
}, iF = (e, t, n, r, i, a, o) => {
	var s = o.x, c = o.y, l = o.segment, u = o.ifOverflow, d = Rt(s);
	return Rt(c) ? tF(c, u, r, a, t, n) : d ? nF(s, u, r, i, e, n) : l != null && l.length === 2 ? rF(l, u, r, new qP({
		x: e,
		y: t
	})) : null;
};
function aF(e) {
	var t = B();
	return (0, P.useEffect)(() => (t(FP(e)), () => {
		t(IP(e));
	})), null;
}
function oF(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.shape, i = e.className, a = e.ifOverflow, o = ru(), s = KP(), c = V((e) => MS(e, t)), l = V((e) => FS(e, n)), u = V((e) => dw(e, "xAxis", t, o)), d = V((e) => dw(e, "yAxis", n, o)), f = zu();
	if (!s || !f || c == null || l == null || u == null || d == null) return null;
	var p = iF(u, d, f, e.position, c.orientation, l.orientation, e);
	if (!p) return null;
	var m = p[0], h = p[1];
	if (m == null || h == null) return null;
	var g = m.x, _ = m.y, v = h.x, y = h.y, b = YP(YP({ clipPath: a === "hidden" ? `url(#${s})` : void 0 }, dt(e)), {}, {
		x1: g,
		y1: _,
		x2: v,
		y2: y
	}), x = AP({
		x1: g,
		y1: _,
		x2: v,
		y2: y
	});
	return /*#__PURE__*/ P.createElement(cD, { zIndex: e.zIndex }, /*#__PURE__*/ P.createElement(F, { className: N("recharts-reference-line", i) }, eF(r, b), /*#__PURE__*/ P.createElement(Nk, $P({}, x, {
		lowerWidth: x.width,
		upperWidth: x.width
	}), /*#__PURE__*/ P.createElement(qk, { label: e.label }), e.children)));
}
var sF = {
	ifOverflow: "discard",
	xAxisId: 0,
	yAxisId: 0,
	fill: "none",
	label: !1,
	stroke: "#ccc",
	fillOpacity: 1,
	strokeWidth: 1,
	position: "middle",
	zIndex: Y.line
};
function cF(e) {
	var t = Zr(e, sF);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(aF, {
		yAxisId: t.yAxisId,
		xAxisId: t.xAxisId,
		ifOverflow: t.ifOverflow,
		x: t.x,
		y: t.y,
		segment: t.segment
	}), /*#__PURE__*/ P.createElement(oF, t));
}
cF.displayName = "ReferenceLine";
// ../../../peach/frontend/node_modules/es-toolkit/dist/function/noop.mjs
function lF() {}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isPlainObject.mjs
function uF(e) {
	if (!e || typeof e != "object") return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null ? !1 : Object.prototype.toString.call(e) === "[object Object]";
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isEqualWith.mjs
function dF(e, t, n) {
	return fF(e, t, void 0, void 0, void 0, void 0, n);
}
function fF(e, t, n, r, i, a, o) {
	let s = o(e, t, n, r, i, a);
	if (s !== void 0) return s;
	if (typeof e == typeof t) switch (typeof e) {
		case "bigint":
		case "string":
		case "boolean":
		case "symbol":
		case "undefined": return e === t;
		case "number": return e === t || Object.is(e, t);
		case "function": return e === t;
		case "object": return pF(e, t, a, o);
	}
	return pF(e, t, a, o);
}
function pF(e, t, n, r) {
	if (Object.is(e, t)) return !0;
	let i = yi(e), a = yi(t);
	if (i === "[object Arguments]" && (i = Mi), a === "[object Arguments]" && (a = Mi), i !== a) return !1;
	switch (i) {
		case xi: return e.toString() === t.toString();
		case Si: return $i(e.valueOf(), t.valueOf());
		case Ci:
		case Ei:
		case Ti: return Object.is(e.valueOf(), t.valueOf());
		case bi: return e.source === t.source && e.flags === t.flags;
		case Ai: return e === t;
	}
	n ??= /* @__PURE__ */ new Map();
	let o = n.get(e), s = n.get(t);
	if (o != null && s != null) return o === t;
	n.set(e, t), n.set(t, e);
	try {
		switch (i) {
			case Di:
				if (e.size !== t.size) return !1;
				for (let [i, a] of e.entries()) if (!t.has(i) || !fF(a, t.get(i), i, e, t, n, r)) return !1;
				return !0;
			case Oi: {
				if (e.size !== t.size) return !1;
				let i = Array.from(e.values()), a = Array.from(t.values());
				for (let o = 0; o < i.length; o++) {
					let s = i[o], c = a.findIndex((i) => fF(s, i, void 0, e, t, n, r));
					if (c === -1) return !1;
					a.splice(c, 1);
				}
				return !0;
			}
			case ki:
			case Fi:
			case Ii:
			case Li:
			case Ri:
			case zi:
			case Bi:
			case Vi:
			case Hi:
			case Ui:
			case Wi:
			case Gi:
				if (qi(e) !== qi(t) || e.length !== t.length) return !1;
				for (let i = 0; i < e.length; i++) if (!fF(e[i], t[i], i, e, t, n, r)) return !1;
				return !0;
			case ji: return e.byteLength === t.byteLength && pF(new Uint8Array(e), new Uint8Array(t), n, r);
			case Pi: return e.byteLength !== t.byteLength || e.byteOffset !== t.byteOffset ? !1 : pF(new Uint8Array(e), new Uint8Array(t), n, r);
			case Ni: return e.name === t.name && e.message === t.message;
			case Mi: {
				if (!(pF(e.constructor, t.constructor, n, r) || uF(e) && uF(t))) return !1;
				let i = [...Object.keys(e), ...vi(e)], a = [...Object.keys(t), ...vi(t)];
				if (i.length !== a.length) return !1;
				for (let a = 0; a < i.length; a++) {
					let o = i[a], s = e[o];
					if (!Object.hasOwn(t, o)) return !1;
					let c = t[o];
					if (!fF(s, c, o, e, t, n, r)) return !1;
				}
				return !0;
			}
			default: return !1;
		}
	} finally {
		n.delete(e), n.delete(t);
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isEqual.mjs
function mF(e, t) {
	return dF(e, t, lF);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/getEveryNth.js
function hF(e, t) {
	if (t < 1) return [];
	if (t === 1) return e;
	for (var n = [], r = 0; r < e.length; r += t) {
		var i = e[r];
		i !== void 0 && n.push(i);
	}
	return n;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/TickUtils.js
function gF(e, t, n) {
	return MP({
		width: e.width + t.width,
		height: e.height + t.height
	}, n);
}
function _F(e, t, n) {
	var r = n === "width", i = e.x, a = e.y, o = e.width, s = e.height;
	return t === 1 ? {
		start: r ? i : a,
		end: r ? i + o : a + s
	} : {
		start: r ? i + o : a + s,
		end: r ? i : a
	};
}
function vF(e, t, n, r, i) {
	if (e * t < e * r || e * t > e * i) return !1;
	var a = n();
	return e * (t - e * a / 2 - r) >= 0 && e * (t + e * a / 2 - i) <= 0;
}
function yF(e, t) {
	return hF(e, t + 1);
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/getEquidistantTicks.js
function bF(e, t, n, r, i) {
	for (var a = (r || []).slice(), o = t.start, s = t.end, c = 0, l = 1, u = o, d = function() {
		var t = r?.[c];
		if (t === void 0) return { v: hF(r, l) };
		var a = c, d, f = () => (d === void 0 && (d = n(t, a)), d), p = t.coordinate, m = c === 0 || vF(e, p, f, u, s);
		m || (c = 0, u = o, l += 1), m && (u = p + e * (f() / 2 + i), c += l);
	}, f; l <= a.length;) if (f = d(), f) return f.v;
	return [];
}
function xF(e, t, n, r, i) {
	var a = (r || []).slice().length;
	if (a === 0) return [];
	for (var o = t.start, s = t.end, c = 1; c <= a; c++) {
		for (var l = (a - 1) % c, u = o, d = !0, f = function() {
			var t = r[m];
			if (t == null) return 0;
			var a = m, o, c = () => (o === void 0 && (o = n(t, a)), o), f = t.coordinate, p = m === l || vF(e, f, c, u, s);
			if (!p) return d = !1, 1;
			p && (u = f + e * (c() / 2 + i));
		}, p, m = l; m < a && (p = f(), p === 0 || p !== 1); m += c);
		if (d) {
			for (var h = [], g = l; g < a; g += c) {
				var _ = r[g];
				_ != null && h.push(_);
			}
			return h;
		}
	}
	return [];
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/getTicks.js
function SF(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function CF(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? SF(Object(n), !0).forEach(function(t) {
			wF(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : SF(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function wF(e, t, n) {
	return (t = TF(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function TF(e) {
	var t = EF(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function EF(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function DF(e, t, n, r, i) {
	for (var a = (r || []).slice(), o = a.length, s = t.start, c = t.end, l = function(t) {
		var r = a[t];
		if (r == null) return 1;
		var l = r, u, d = () => (u === void 0 && (u = n(r, t)), u);
		if (t === o - 1) {
			var f = e * (l.coordinate + e * d() / 2 - c);
			a[t] = l = CF(CF({}, l), {}, { tickCoord: f > 0 ? l.coordinate - f * e : l.coordinate });
		} else a[t] = l = CF(CF({}, l), {}, { tickCoord: l.coordinate });
		l.tickCoord != null && vF(e, l.tickCoord, d, s, c) && (c = l.tickCoord - e * (d() / 2 + i), a[t] = CF(CF({}, l), {}, { isShow: !0 }));
	}, u = o - 1; u >= 0; u--) if (l(u)) continue;
	return a;
}
function OF(e, t, n, r, i, a) {
	var o = (r || []).slice(), s = o.length, c = t.start, l = t.end;
	if (a) {
		var u = r[s - 1];
		if (u != null) {
			var d = n(u, s - 1), f = e * (u.coordinate + e * d / 2 - l);
			o[s - 1] = u = CF(CF({}, u), {}, { tickCoord: f > 0 ? u.coordinate - f * e : u.coordinate }), u.tickCoord != null && vF(e, u.tickCoord, () => d, c, l) && (l = u.tickCoord - e * (d / 2 + i), o[s - 1] = CF(CF({}, u), {}, { isShow: !0 }));
		}
	}
	for (var p = a ? s - 1 : s, m = function(t) {
		var r = o[t];
		if (r == null) return 1;
		var a = r, s, u = () => (s === void 0 && (s = n(r, t)), s);
		if (t === 0) {
			var d = e * (a.coordinate - e * u() / 2 - c);
			o[t] = a = CF(CF({}, a), {}, { tickCoord: d < 0 ? a.coordinate - d * e : a.coordinate });
		} else o[t] = a = CF(CF({}, a), {}, { tickCoord: a.coordinate });
		a.tickCoord != null && vF(e, a.tickCoord, u, c, l) && (c = a.tickCoord + e * (u() / 2 + i), o[t] = CF(CF({}, a), {}, { isShow: !0 }));
	}, h = 0; h < p; h++) if (m(h)) continue;
	return o;
}
function kF(e, t, n) {
	var r = e.tick, i = e.ticks, a = e.viewBox, o = e.minTickGap, s = e.orientation, c = e.interval, l = e.tickFormatter, u = e.unit, d = e.angle;
	if (!i || !i.length || !r) return [];
	if (I(c) || Cf.isSsr) return yF(i, I(c) ? c : 0) ?? [];
	var f = [], p = s === "top" || s === "bottom" ? "width" : "height", m = u && p === "width" ? wO(u, {
		fontSize: t,
		letterSpacing: n
	}) : {
		width: 0,
		height: 0
	}, h = (e, r) => {
		var i = typeof l == "function" ? l(e.value, r) : e.value;
		return p === "width" ? gF(wO(i, {
			fontSize: t,
			letterSpacing: n
		}), m, d) : wO(i, {
			fontSize: t,
			letterSpacing: n
		})[p];
	}, g = i[0], _ = i[1], v = i.length >= 2 && g != null && _ != null ? Ft(_.coordinate - g.coordinate) : 1, y = _F(a, v, p);
	return c === "equidistantPreserveStart" ? bF(v, y, h, i, o) : c === "equidistantPreserveEnd" ? xF(v, y, h, i, o) : (f = c === "preserveStart" || c === "preserveStartEnd" ? OF(v, y, h, i, o, c === "preserveStartEnd") : DF(v, y, h, i, o), f.filter((e) => e.isShow));
}
// ../../../peach/frontend/node_modules/recharts/es6/util/YAxisUtils.js
var AF = (e) => {
	var t = e.ticks, n = e.label, r = e.labelGapWithTick, i = r === void 0 ? 5 : r, a = e.tickSize, o = a === void 0 ? 0 : a, s = e.tickMargin, c = s === void 0 ? 0 : s, l = 0;
	if (t) {
		Array.from(t).forEach((e) => {
			if (e) {
				var t = e.getBoundingClientRect();
				t.width > l && (l = t.width);
			}
		});
		var u = n ? n.getBoundingClientRect().width : 0, d = o + c, f = l + d + u + (n ? i : 0);
		return Math.round(f);
	}
	return 0;
}, jF = (e) => {
	var t = e.ticks, n = e.label, r = e.labelGapWithTick, i = r === void 0 ? 5 : r, a = e.tickSize, o = a === void 0 ? 0 : a, s = e.tickMargin, c = s === void 0 ? 0 : s, l = 0;
	if (t) {
		Array.from(t).forEach((e) => {
			if (e) {
				var t = e.getBoundingClientRect();
				t.height > l && (l = t.height);
			}
		});
		var u = n ? n.getBoundingClientRect().height : 0, d = o + c, f = l + d + u + (n ? i : 0);
		return Math.round(f);
	}
	return 0;
}, MF = pc({
	name: "renderedTicks",
	initialState: {
		xAxis: {},
		yAxis: {}
	},
	reducers: {
		setRenderedTicks: (e, t) => {
			var n = t.payload, r = n.axisType, i = n.axisId, a = n.ticks;
			e[r][i] = U(a);
		},
		removeRenderedTicks: (e, t) => {
			var n = t.payload, r = n.axisType, i = n.axisId;
			delete e[r][i];
		}
	}
}), NF = MF.actions, PF = NF.setRenderedTicks, FF = NF.removeRenderedTicks, IF = MF.reducer, LF = [
	"axisLine",
	"width",
	"height",
	"className",
	"hide",
	"ticks",
	"axisType",
	"axisId"
];
function RF(e, t) {
	return UF(e) || HF(e, t) || BF(e, t) || zF();
}
function zF() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function BF(e, t) {
	if (e) {
		if (typeof e == "string") return VF(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? VF(e, t) : void 0;
	}
}
function VF(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function HF(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function UF(e) {
	if (Array.isArray(e)) return e;
}
function WF(e, t) {
	if (e == null) return {};
	var n, r, i = GF(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function GF(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function KF() {
	return KF = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, KF.apply(null, arguments);
}
function qF(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function JF(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? qF(Object(n), !0).forEach(function(t) {
			YF(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qF(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function YF(e, t, n) {
	return (t = XF(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function XF(e) {
	var t = ZF(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ZF(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var QF = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	viewBox: {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	},
	orientation: "bottom",
	ticks: [],
	stroke: "#666",
	tickLine: !0,
	axisLine: !0,
	tick: !0,
	mirror: !1,
	minTickGap: 5,
	tickSize: 6,
	tickMargin: 2,
	interval: "preserveEnd",
	zIndex: Y.axis
};
function $F(e) {
	var t = e.x, n = e.y, r = e.width, i = e.height, a = e.orientation, o = e.mirror, s = e.axisLine, c = e.otherSvgProps;
	if (!s) return null;
	var l = JF(JF(JF({}, c), lt(s)), {}, { fill: "none" });
	if (a === "top" || a === "bottom") {
		var u = +(a === "top" && !o || a === "bottom" && o);
		l = JF(JF({}, l), {}, {
			x1: t,
			y1: n + u * i,
			x2: t + r,
			y2: n + u * i
		});
	} else {
		var d = +(a === "left" && !o || a === "right" && o);
		l = JF(JF({}, l), {}, {
			x1: t + d * r,
			y1: n,
			x2: t + d * r,
			y2: n + i
		});
	}
	return /*#__PURE__*/ P.createElement("line", KF({}, l, { className: N("recharts-cartesian-axis-line", At(s, "className")) }));
}
function eI(e, t, n, r, i, a, o, s, c) {
	var l, u, d, f, p, m, h = s ? -1 : 1, g = e.tickSize || o, _ = I(e.tickCoord) ? e.tickCoord : e.coordinate;
	switch (a) {
		case "top":
			l = u = e.coordinate, f = n + +!s * i, d = f - h * g, m = d - h * c, p = _;
			break;
		case "left":
			d = f = e.coordinate, u = t + +!s * r, l = u - h * g, p = l - h * c, m = _;
			break;
		case "right":
			d = f = e.coordinate, u = t + +s * r, l = u + h * g, p = l + h * c, m = _;
			break;
		default: l = u = e.coordinate, f = n + +s * i, d = f + h * g, m = d + h * c, p = _;
	}
	return {
		line: {
			x1: l,
			y1: d,
			x2: u,
			y2: f
		},
		tick: {
			x: p,
			y: m
		}
	};
}
function tI(e, t) {
	switch (e) {
		case "left": return t ? "start" : "end";
		case "right": return t ? "end" : "start";
		default: return "middle";
	}
}
function nI(e, t) {
	switch (e) {
		case "left":
		case "right": return "middle";
		case "top": return t ? "start" : "end";
		default: return t ? "end" : "start";
	}
}
function rI(e) {
	var t = e.option, n = e.tickProps, r = e.value, i, a = N(n.className, "recharts-cartesian-axis-tick-value");
	if (/*#__PURE__*/ P.isValidElement(t)) i = /*#__PURE__*/ P.cloneElement(t, JF(JF({}, n), {}, { className: a }));
	else if (typeof t == "function") i = t(JF(JF({}, n), {}, { className: a }));
	else {
		var o = "recharts-cartesian-axis-tick-value";
		typeof t != "boolean" && (o = N(o, VA(t))), i = /*#__PURE__*/ P.createElement(xk, KF({}, n, { className: o }), r);
	}
	return i;
}
function iI(e) {
	var t = e.ticks, n = e.axisType, r = e.axisId, i = B(), a = (0, P.useRef)(null);
	return (0, P.useEffect)(() => {
		if (r != null && n != null) {
			var e = t.map((e) => ({
				value: e.value,
				coordinate: e.coordinate,
				offset: e.offset,
				index: e.index
			})), o = a.current;
			o != null && o.axisId === r && o.axisType === n && mF(o.ticks, e) || (a.current = {
				ticks: e,
				axisId: r,
				axisType: n
			}, i(PF({
				ticks: e,
				axisId: r,
				axisType: n
			})));
		}
	}, [
		i,
		t,
		r,
		n
	]), (0, P.useEffect)(() => r == null || n == null ? Kt : () => {
		i(FF({
			axisId: r,
			axisType: n
		}));
	}, [
		i,
		r,
		n
	]), null;
}
var aI = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.ticks, r = n === void 0 ? [] : n, i = e.tick, a = e.tickLine, o = e.stroke, s = e.tickFormatter, c = e.unit, l = e.padding, u = e.tickTextProps, d = e.orientation, f = e.mirror, p = e.x, m = e.y, h = e.width, g = e.height, _ = e.tickSize, v = e.tickMargin, y = e.fontSize, b = e.letterSpacing, x = e.getTicksConfig, S = e.events, C = e.axisType, w = e.axisId, T = kF(JF(JF({}, x), {}, { ticks: r }), y, b), E = lt(x), D = ut(i), O = uk(E.textAnchor) ? E.textAnchor : tI(d, f), k = nI(d, f), A = {};
	typeof a == "object" && (A = a);
	var j = JF(JF({}, E), {}, { fill: "none" }, A), M = T.map((e) => JF({ entry: e }, eI(e, p, m, h, g, d, _, f, v))), ee = M.map((e) => {
		var t = e.entry, n = e.line;
		return /*#__PURE__*/ P.createElement(F, {
			className: "recharts-cartesian-axis-tick",
			key: `tick-${t.value}-${t.coordinate}-${t.tickCoord}`
		}, a && /*#__PURE__*/ P.createElement("line", KF({}, j, n, { className: N("recharts-cartesian-axis-tick-line", At(a, "className")) })));
	}), te = M.map((e, t) => {
		var n = e.entry, r = e.tick, a = JF(JF({}, JF(JF(JF(JF({ verticalAnchor: k }, E), {}, {
			textAnchor: O,
			stroke: "none",
			fill: o
		}, r), {}, {
			index: t,
			payload: n,
			visibleTicksCount: T.length,
			tickFormatter: s,
			padding: l
		}, u), {}, { angle: u?.angle ?? E.angle ?? 0 })), D);
		return /*#__PURE__*/ P.createElement(F, KF({
			className: "recharts-cartesian-axis-tick-label",
			key: `tick-label-${n.value}-${n.coordinate}-${n.tickCoord}`
		}, Gr(S, n, t)), i && /*#__PURE__*/ P.createElement(rI, {
			option: i,
			tickProps: a,
			value: `${typeof s == "function" ? s(n.value, t) : n.value}${c || ""}`
		}));
	});
	return /*#__PURE__*/ P.createElement("g", { className: `recharts-cartesian-axis-ticks recharts-${C}-ticks` }, /*#__PURE__*/ P.createElement(iI, {
		ticks: T,
		axisId: w,
		axisType: C
	}), te.length > 0 && /*#__PURE__*/ P.createElement(cD, { zIndex: Y.label }, /*#__PURE__*/ P.createElement("g", {
		className: `recharts-cartesian-axis-tick-labels recharts-${C}-tick-labels`,
		ref: t
	}, te)), ee.length > 0 && /*#__PURE__*/ P.createElement("g", { className: `recharts-cartesian-axis-tick-lines recharts-${C}-tick-lines` }, ee));
}), oI = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.axisLine, r = e.width, i = e.height, a = e.className, o = e.hide, s = e.ticks, c = e.axisType, l = e.axisId, u = WF(e, LF), d = RF((0, P.useState)(""), 2), f = d[0], p = d[1], m = RF((0, P.useState)(""), 2), h = m[0], g = m[1], _ = (0, P.useRef)(null);
	(0, P.useImperativeHandle)(t, () => ({
		getCalculatedWidth: () => AF({
			ticks: _.current,
			label: e.labelRef?.current,
			labelGapWithTick: 5,
			tickSize: e.tickSize,
			tickMargin: e.tickMargin
		}),
		getCalculatedHeight: () => jF({
			ticks: _.current,
			label: e.labelRef?.current,
			labelGapWithTick: 5,
			tickSize: e.tickSize,
			tickMargin: e.tickMargin
		})
	}));
	var v = (0, P.useCallback)((e) => {
		if (e) {
			var t = e.getElementsByClassName("recharts-cartesian-axis-tick-value");
			_.current = t;
			var n = t[0];
			if (n) {
				var r = window.getComputedStyle(n), i = r.fontSize, a = r.letterSpacing;
				(i !== f || a !== h) && (p(i), g(a));
			}
		}
	}, [f, h]);
	return o || r != null && r <= 0 || i != null && i <= 0 ? null : /*#__PURE__*/ P.createElement(cD, { zIndex: e.zIndex }, /*#__PURE__*/ P.createElement(F, { className: N("recharts-cartesian-axis", a) }, /*#__PURE__*/ P.createElement($F, {
		x: e.x,
		y: e.y,
		width: r,
		height: i,
		orientation: e.orientation,
		mirror: e.mirror,
		axisLine: n,
		otherSvgProps: lt(e)
	}), /*#__PURE__*/ P.createElement(aI, {
		ref: v,
		axisType: c,
		events: u,
		fontSize: f,
		getTicksConfig: e,
		height: e.height,
		letterSpacing: h,
		mirror: e.mirror,
		orientation: e.orientation,
		padding: e.padding,
		stroke: e.stroke,
		tick: e.tick,
		tickFormatter: e.tickFormatter,
		tickLine: e.tickLine,
		tickMargin: e.tickMargin,
		tickSize: e.tickSize,
		tickTextProps: e.tickTextProps,
		ticks: s,
		unit: e.unit,
		width: e.width,
		x: e.x,
		y: e.y,
		axisId: l
	}), /*#__PURE__*/ P.createElement(Nk, {
		x: e.x,
		y: e.y,
		width: e.width,
		height: e.height,
		lowerWidth: e.width,
		upperWidth: e.width
	}, /*#__PURE__*/ P.createElement(qk, {
		label: e.label,
		labelRef: e.labelRef
	}), e.children)));
}), sI = /*#__PURE__*/ P.forwardRef((e, t) => {
	var n = Zr(e, QF);
	return /*#__PURE__*/ P.createElement(oI, KF({}, n, { ref: t }));
});
sI.displayName = "CartesianAxis";
// ../../../peach/frontend/node_modules/recharts/es6/theme/RechartsThemeContext.js
var cI = /*#__PURE__*/ (0, P.createContext)({ grid: {
	stroke: "#ccc",
	fill: "none"
} });
cI.Provider;
var lI = () => (0, P.useContext)(cI), uI = [
	"x1",
	"y1",
	"x2",
	"y2",
	"key"
], dI = ["offset"], fI = ["xAxisId", "yAxisId"], pI = ["xAxisId", "yAxisId"];
function mI(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function hI(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? mI(Object(n), !0).forEach(function(t) {
			gI(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : mI(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function gI(e, t, n) {
	return (t = _I(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function _I(e) {
	var t = vI(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function vI(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function yI() {
	return yI = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, yI.apply(null, arguments);
}
function bI(e, t) {
	if (e == null) return {};
	var n, r, i = xI(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function xI(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var SI = (e) => {
	var t = e.fill;
	if (!t || t === "none") return null;
	var n = e.fillOpacity, r = e.x, i = e.y, a = e.width, o = e.height, s = e.ry;
	return /*#__PURE__*/ P.createElement("rect", {
		x: r,
		y: i,
		ry: s,
		width: a,
		height: o,
		stroke: "none",
		fill: t,
		fillOpacity: n,
		className: "recharts-cartesian-grid-bg"
	});
};
function CI(e) {
	var t = e.option, n = e.lineItemProps, r;
	if (/*#__PURE__*/ P.isValidElement(t)) r = /*#__PURE__*/ P.cloneElement(t, n);
	else if (typeof t == "function") r = t(n);
	else {
		var i = n.x1, a = n.y1, o = n.x2, s = n.y2, c = n.key, l = lt(bI(n, uI)) ?? {};
		l.offset;
		var u = bI(l, dI), d = Array.isArray(u.strokeDasharray) ? u.strokeDasharray.join(",") : u.strokeDasharray;
		r = /*#__PURE__*/ P.createElement("line", yI({}, u, {
			strokeDasharray: d,
			x1: i,
			y1: a,
			x2: o,
			y2: s,
			fill: "none",
			key: c
		}));
	}
	return r;
}
function wI(e) {
	var t = e.x, n = e.width, r = e.horizontal, i = r === void 0 || r, a = e.horizontalPoints;
	if (!i || !a || !a.length) return null;
	e.xAxisId, e.yAxisId;
	var o = bI(e, fI), s = a.map((e, r) => {
		var a = hI(hI({}, o), {}, {
			x1: t,
			y1: e,
			x2: t + n,
			y2: e,
			key: `line-${r}`,
			index: r
		});
		return /*#__PURE__*/ P.createElement(CI, {
			key: `line-${r}`,
			option: i,
			lineItemProps: a
		});
	});
	return /*#__PURE__*/ P.createElement("g", { className: "recharts-cartesian-grid-horizontal" }, s);
}
function TI(e) {
	var t = e.y, n = e.height, r = e.vertical, i = r === void 0 || r, a = e.verticalPoints;
	if (!i || !a || !a.length) return null;
	e.xAxisId, e.yAxisId;
	var o = bI(e, pI), s = a.map((e, r) => {
		var a = hI(hI({}, o), {}, {
			x1: e,
			y1: t,
			x2: e,
			y2: t + n,
			key: `line-${r}`,
			index: r
		});
		return /*#__PURE__*/ P.createElement(CI, {
			option: i,
			lineItemProps: a,
			key: `line-${r}`
		});
	});
	return /*#__PURE__*/ P.createElement("g", { className: "recharts-cartesian-grid-vertical" }, s);
}
function EI(e) {
	var t = e.horizontalFill, n = e.fillOpacity, r = e.x, i = e.y, a = e.width, o = e.height, s = e.horizontalPoints, c = e.horizontal;
	if (!(c === void 0 || c) || !t || !t.length || s == null) return null;
	var l = s.map((e) => Math.round(e + i - i)).sort((e, t) => e - t);
	i !== l[0] && l.unshift(0);
	var u = l.map((e, s) => {
		var c = l[s + 1], u = c == null ? i + o - e : c - e;
		if (u <= 0) return null;
		var d = s % t.length;
		return /*#__PURE__*/ P.createElement("rect", {
			key: `react-${s}`,
			y: e,
			x: r,
			height: u,
			width: a,
			stroke: "none",
			fill: t[d],
			fillOpacity: n,
			className: "recharts-cartesian-grid-bg"
		});
	});
	return /*#__PURE__*/ P.createElement("g", { className: "recharts-cartesian-gridstripes-horizontal" }, u);
}
function DI(e) {
	var t = e.vertical, n = t === void 0 || t, r = e.verticalFill, i = e.fillOpacity, a = e.x, o = e.y, s = e.width, c = e.height, l = e.verticalPoints;
	if (!n || !r || !r.length) return null;
	var u = l.map((e) => Math.round(e + a - a)).sort((e, t) => e - t);
	a !== u[0] && u.unshift(0);
	var d = u.map((e, t) => {
		var n = u[t + 1], l = n == null ? a + s - e : n - e;
		if (l <= 0) return null;
		var d = t % r.length;
		return /*#__PURE__*/ P.createElement("rect", {
			key: `react-${t}`,
			x: e,
			y: o,
			width: l,
			height: c,
			stroke: "none",
			fill: r[d],
			fillOpacity: i,
			className: "recharts-cartesian-grid-bg"
		});
	});
	return /*#__PURE__*/ P.createElement("g", { className: "recharts-cartesian-gridstripes-vertical" }, d);
}
var OI = (e, t) => {
	var n = e.xAxis, r = e.width, i = e.height, a = e.offset;
	return _l(kF(hI(hI(hI({}, QF), n), {}, {
		ticks: vl(n, !0),
		viewBox: {
			x: 0,
			y: 0,
			width: r,
			height: i
		}
	})), a.left, a.left + a.width, t);
}, kI = (e, t) => {
	var n = e.yAxis, r = e.width, i = e.height, a = e.offset;
	return _l(kF(hI(hI(hI({}, QF), n), {}, {
		ticks: vl(n, !0),
		viewBox: {
			x: 0,
			y: 0,
			width: r,
			height: i
		}
	})), a.top, a.top + a.height, t);
}, AI = {
	horizontal: !0,
	vertical: !0,
	horizontalPoints: [],
	verticalPoints: [],
	verticalFill: [],
	horizontalFill: [],
	xAxisId: 0,
	yAxisId: 0,
	syncWithTicks: !1,
	zIndex: Y.grid
};
function jI(e) {
	var t = Hu(), n = Uu(), r = Vu(), i = hI(hI({}, Zr(e, AI)), {}, {
		x: I(e.x) ? e.x : r.left,
		y: I(e.y) ? e.y : r.top,
		width: I(e.width) ? e.width : r.width,
		height: I(e.height) ? e.height : r.height
	}), a = i.xAxisId, o = i.yAxisId, s = i.x, c = i.y, l = i.width, u = i.height, d = i.syncWithTicks, f = i.horizontalValues, p = i.verticalValues, m = ru(), h = V((e) => Aw(e, "xAxis", a, m)), g = V((e) => Aw(e, "yAxis", o, m)), _ = lI(), v = {
		stroke: i.stroke ?? _.grid.stroke,
		strokeWidth: i.strokeWidth ?? _.grid.strokeWidth,
		strokeOpacity: i.strokeOpacity ?? _.grid.strokeOpacity,
		strokeDasharray: i.strokeDasharray ?? _.grid.strokeDasharray
	};
	if (!ll(l) || !ll(u) || !I(s) || !I(c)) return null;
	var y = i.verticalCoordinatesGenerator || OI, b = i.horizontalCoordinatesGenerator || kI, x = i.horizontalPoints, S = i.verticalPoints;
	if ((!x || !x.length) && typeof b == "function") {
		var C = f && f.length, w = b({
			yAxis: g ? hI(hI({}, g), {}, { ticks: C ? f : g.ticks }) : void 0,
			width: t ?? l,
			height: n ?? u,
			offset: r
		}, C ? !0 : d);
		lu(Array.isArray(w), `horizontalCoordinatesGenerator should return Array but instead it returned [${typeof w}]`), Array.isArray(w) && (x = w);
	}
	if ((!S || !S.length) && typeof y == "function") {
		var T = p && p.length, E = y({
			xAxis: h ? hI(hI({}, h), {}, { ticks: T ? p : h.ticks }) : void 0,
			width: t ?? l,
			height: n ?? u,
			offset: r
		}, T ? !0 : d);
		lu(Array.isArray(E), `verticalCoordinatesGenerator should return Array but instead it returned [${typeof E}]`), Array.isArray(E) && (S = E);
	}
	return /*#__PURE__*/ P.createElement(cD, { zIndex: i.zIndex }, /*#__PURE__*/ P.createElement("g", { className: "recharts-cartesian-grid" }, /*#__PURE__*/ P.createElement(SI, {
		fill: i.fill ?? _.grid.fill,
		fillOpacity: i.fillOpacity ?? _.grid.fillOpacity,
		x: i.x,
		y: i.y,
		width: i.width,
		height: i.height,
		ry: i.ry
	}), /*#__PURE__*/ P.createElement(EI, yI({}, i, { horizontalPoints: x })), /*#__PURE__*/ P.createElement(DI, yI({}, i, { verticalPoints: S })), /*#__PURE__*/ P.createElement(wI, yI({}, i, v, {
		offset: r,
		horizontalPoints: x,
		xAxis: h,
		yAxis: g
	})), /*#__PURE__*/ P.createElement(TI, yI({}, i, v, {
		offset: r,
		verticalPoints: S,
		xAxis: h,
		yAxis: g
	}))));
}
jI.displayName = "CartesianGrid";
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/LineDrawShape.js
var MI = [
	"animationElapsedTime",
	"isAnimating",
	"isEntrance",
	"visibleLength",
	"strokeDasharray",
	"connectNulls"
];
function NI() {
	return NI = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, NI.apply(null, arguments);
}
function PI(e, t) {
	if (e == null) return {};
	var n, r, i = FI(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function FI(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function II(e) {
	try {
		return e && e.getTotalLength && e.getTotalLength() || 0;
	} catch {
		return 0;
	}
}
function LI(e, t) {
	return `${t}px ${e}px`;
}
function RI(e) {
	return e.length % 2 == 0 ? e : [...e, ...e];
}
function zI(e, t) {
	for (var n = [], r = 0; r < t; ++r) n.push(...e);
	return n;
}
function BI(e, t, n) {
	var r = RI(n), i = r.reduce((e, t) => e + t, 0);
	if (!i) return LI(t, e);
	for (var a = Math.floor(e / i), o = e % i, s = [], c = 0, l = 0; c < r.length; l += (u = r[c]) ?? 0, ++c) {
		var u, d = r[c];
		if (d != null && l + d > o) {
			s = [...r.slice(0, c), o - l];
			break;
		}
	}
	var f = s.length % 2 == 0 ? [0, t] : [t];
	return [
		...zI(r, a),
		...s,
		...f
	].map((e) => `${e}px`).join(", ");
}
function VI(e, t, n) {
	return e ? BI(n, t, `${e}`.split(/[,\s]+/gim).map((e) => parseFloat(e))) : LI(t, n);
}
function HI(e) {
	e.animationElapsedTime, e.isAnimating, e.isEntrance;
	var t = e.visibleLength, n = e.strokeDasharray, r = e.connectNulls, i = PI(e, MI), a = r ?? !1, o;
	if (t != null) {
		var s = i.pathRef;
		o = VI(n, II(s?.current ?? null), t);
	} else n != null && (o = String(n));
	return /*#__PURE__*/ P.createElement(op, NI({}, i, {
		connectNulls: a,
		strokeDasharray: o
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/useAnimatedLineLength.js
function UI(e) {
	var t = (0, P.useRef)(0), n = (0, P.useRef)(0), r = (0, P.useRef)(!1), i = (0, P.useRef)(e);
	return i.current !== e && (t.current = n.current, i.current = e), (0, P.useCallback)((e, i) => {
		if (r.current) return null;
		var a = Math.min(Nt(t.current + e * i), i);
		return e > 0 && i > 0 && (n.current = Math.max(n.current, a), a >= i) ? (r.current = !0, null) : a;
	}, []);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/errorBarSlice.js
var WI = pc({
	name: "errorBars",
	initialState: {},
	reducers: {
		addErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.errorBar;
			e[r] || (e[r] = []), e[r].push(i);
		},
		replaceErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.prev, a = n.next;
			e[r] && (e[r] = e[r].map((e) => e.dataKey === i.dataKey && e.direction === i.direction ? a : e));
		},
		removeErrorBar: (e, t) => {
			var n = t.payload, r = n.itemId, i = n.errorBar;
			e[r] && (e[r] = e[r].filter((e) => e.dataKey !== i.dataKey || e.direction !== i.direction));
		}
	}
}), GI = WI.actions;
GI.addErrorBar, GI.replaceErrorBar, GI.removeErrorBar;
var KI = WI.reducer, qI = ["children"];
function JI(e, t) {
	if (e == null) return {};
	var n, r, i = YI(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function YI(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var XI = /*#__PURE__*/ (0, P.createContext)({
	data: [],
	xAxisId: "xAxis-0",
	yAxisId: "yAxis-0",
	dataPointFormatter: () => ({
		x: 0,
		y: 0,
		value: 0
	}),
	errorBarOffset: 0
});
function ZI(e) {
	var t = e.children, n = JI(e, qI);
	return /*#__PURE__*/ P.createElement(XI.Provider, { value: n }, t);
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js
function QI(e, t) {
	var n = V((t) => MS(t, e)), r = V((e) => FS(e, t)), i = n?.allowDataOverflow ?? AS.allowDataOverflow, a = r?.allowDataOverflow ?? NS.allowDataOverflow;
	return {
		needClip: i || a,
		needClipX: i,
		needClipY: a
	};
}
function $I(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.clipPathId, i = eN(), a = QI(t, n), o = a.needClipX, s = a.needClipY, c = a.needClip, l = V((e) => iw(e, t, !1)), u = V((e) => aw(e, n, !1));
	if (!c || !i) return null;
	var d = i.x, f = i.y, p = i.width, m = i.height, h = o && l ? Math.min(l[0], l[1]) : d - p / 2, g = s && u ? Math.min(u[0], u[1]) : f - m / 2, _ = o && l ? Math.abs(l[1] - l[0]) : p * 2, v = s && u ? Math.abs(u[1] - u[0]) : m * 2;
	return /*#__PURE__*/ P.createElement("clipPath", { id: `clipPath-${r}` }, /*#__PURE__*/ P.createElement("rect", {
		x: h,
		y: g,
		width: _,
		height: v
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/lineSelectors.js
var eL = (e, t, n, r) => Fw(e, "xAxis", t, r), tL = (e, t, n, r) => Pw(e, "xAxis", t, r), nL = (e, t, n, r) => Fw(e, "yAxis", n, r), rL = (e, t, n, r) => Pw(e, "yAxis", n, r), iL = H([
	q,
	eL,
	nL,
	tL,
	rL
], (e, t, n, r, i) => gl(e, "xAxis") ? jl(t, r, !1) : jl(n, i, !1)), aL = (e, t, n, r, i) => i;
function oL(e) {
	return e.type === "line";
}
var sL = H([
	q,
	eL,
	nL,
	tL,
	rL,
	H([HS, aL], (e, t) => e.filter(oL).find((e) => e.id === t)),
	iL,
	mh
], (e, t, n, r, i, a, o, s) => {
	var c = s.chartData, l = s.dataStartIndex, u = s.dataEndIndex;
	if (!(a == null || t == null || n == null || r == null || i == null || r.length === 0 || i.length === 0 || o == null || e !== "horizontal" && e !== "vertical")) {
		var d = a.dataKey, f = a.data, p = f != null && f.length > 0 ? f : c?.slice(l, u + 1);
		if (p != null) return NL({
			layout: e,
			xAxis: t,
			yAxis: n,
			xAxisTicks: r,
			yAxisTicks: i,
			dataKey: d,
			bandSize: o,
			displayedData: p
		});
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/util/getRadiusAndStrokeWidthFromDot.js
function cL(e) {
	var t = ut(e), n = 3, r = 2;
	if (t != null) {
		var i = t.r, a = t.strokeWidth, o = Number(i), s = Number(a);
		return (Number.isNaN(o) || o < 0) && (o = n), (Number.isNaN(s) || s < 0) && (s = r), {
			r: o,
			strokeWidth: s
		};
	}
	return {
		r: n,
		strokeWidth: r
	};
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/Line.js
var lL = ["id"], uL = [
	"type",
	"layout",
	"connectNulls",
	"needClip",
	"shape",
	"strokeDasharray"
], dL = [
	"activeDot",
	"animateNewValues",
	"animationBegin",
	"animationDuration",
	"animationEasing",
	"connectNulls",
	"dot",
	"hide",
	"isAnimationActive",
	"label",
	"legendType",
	"xAxisId",
	"yAxisId",
	"id"
];
function fL() {
	return fL = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, fL.apply(null, arguments);
}
function pL(e, t) {
	if (e == null) return {};
	var n, r, i = mL(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function mL(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function hL(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function gL(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? hL(Object(n), !0).forEach(function(t) {
			_L(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : hL(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function _L(e, t, n) {
	return (t = vL(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function vL(e) {
	var t = yL(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function yL(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function bL(e) {
	try {
		return e && e.getTotalLength && e.getTotalLength() || 0;
	} catch {
		return 0;
	}
}
function xL(e) {
	var t = 0, n = 0;
	for (var r of e) r.status === "matched" && r.prev.x != null && r.next.x != null && (t += r.next.x - r.prev.x, n++);
	return n > 0 ? t / n : 0;
}
var SL = {
	activeDot: !0,
	animateNewValues: !0,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	animationInterpolateFn: (e, t) => {
		if (e == null) return [];
		if (t === 1) return e.flatMap((e) => e.status === "removed" ? [] : [e.next]);
		var n = xL(e), r = [];
		for (var i of e) if (i.status === "matched") r.push(gL(gL({}, i.next), {}, {
			x: L(i.prev.x, i.next.x, t),
			y: L(i.prev.y, i.next.y, t)
		}));
		else if (i.status === "added") {
			if (i.next.x != null) {
				var a = i.next.x - n;
				r.push(gL(gL({}, i.next), {}, {
					x: L(a, i.next.x, t),
					y: i.next.y
				}));
			} else r.push(i.next);
		} else if (i.status === "removed" && i.prev.x != null) {
			var o = i.prev.x + n;
			r.push(gL(gL({}, i.prev), {}, {
				x: L(i.prev.x, o, t),
				y: i.prev.y
			}));
		}
		return r;
	},
	animationMatchBy: Vj,
	connectNulls: !1,
	dot: !0,
	fill: "#fff",
	hide: !1,
	isAnimationActive: "auto",
	label: !1,
	legendType: "line",
	shape: HI,
	stroke: "#3182bd",
	strokeWidth: 1,
	xAxisId: 0,
	yAxisId: 0,
	zIndex: Y.line,
	type: "linear"
}, CL = (e) => {
	var t = e.dataKey, n = e.name, r = e.stroke, i = e.legendType;
	return [{
		inactive: e.hide,
		dataKey: t,
		type: i,
		color: r,
		value: Nl(n, t),
		payload: e
	}];
}, wL = /*#__PURE__*/ P.memo((e) => {
	var t = e.dataKey, n = e.data, r = e.stroke, i = e.strokeWidth, a = e.fill, o = e.name, s = e.hide, c = e.unit, l = e.formatter, u = e.tooltipType, d = e.id, f = {
		dataDefinedOnItem: n,
		getPosition: Kt,
		settings: {
			stroke: r,
			strokeWidth: i,
			fill: a,
			dataKey: t,
			nameKey: void 0,
			name: Nl(o, t),
			hide: s,
			type: u,
			color: r,
			unit: c,
			formatter: l,
			graphicalItemId: d
		}
	};
	return /*#__PURE__*/ P.createElement(Mj, { tooltipEntrySettings: f });
});
function TL(e) {
	var t = e.clipPathId, n = e.points, r = e.props, i = r.dot, a = r.dataKey, o = r.needClip;
	r.id;
	var s = lt(pL(r, lL));
	return /*#__PURE__*/ P.createElement(IM, {
		points: n,
		dot: i,
		className: "recharts-line-dots",
		dotClassName: "recharts-line-dot",
		dataKey: a,
		baseProps: s,
		needClip: o,
		clipPathId: t
	});
}
function EL(e) {
	var t = e.showLabels, n = e.children, r = e.points, i = (0, P.useMemo)(() => r?.map((e) => {
		var t = {
			x: e.x ?? 0,
			y: e.y ?? 0,
			width: 0,
			lowerWidth: 0,
			upperWidth: 0,
			height: 0
		};
		return gL(gL({}, t), {}, {
			value: e.value,
			payload: e.payload,
			viewBox: t,
			parentViewBox: void 0,
			fill: void 0
		});
	}), [r]);
	return /*#__PURE__*/ P.createElement(tA, { value: t ? i : void 0 }, n);
}
function DL(e) {
	var t = e.clipPathId, n = e.pathRef, r = e.points, i = e.props, a = e.animationElapsedTime, o = e.isAnimating, s = e.isEntrance, c = e.visibleLength, l = i.type, u = i.layout, d = i.connectNulls, f = i.needClip, p = i.shape, m = i.strokeDasharray, h = gL(gL({}, dt(pL(i, uL))), {}, {
		fill: "none",
		className: "recharts-line-curve",
		clipPath: f ? `url(#clipPath-${t})` : void 0,
		points: r,
		type: l,
		layout: u,
		connectNulls: d,
		strokeDasharray: m ?? i.strokeDasharray,
		pathRef: n,
		animationElapsedTime: a,
		isAnimating: o,
		isEntrance: i.animateNewValues ? s : !1,
		visibleLength: c
	});
	return /*#__PURE__*/ P.createElement(P.Fragment, null, r?.length > 1 && /*#__PURE__*/ P.createElement(Oj, {
		option: p,
		DefaultShape: SL.shape,
		shapeProps: h
	}), /*#__PURE__*/ P.createElement(TL, {
		points: r,
		clipPathId: t,
		props: i
	}));
}
function OL(e) {
	var t = e.clipPathId, n = e.props, r = e.pathRef, i = e.previousPointsRef, a = n.points, o = n.isAnimationActive, s = n.animationBegin, c = n.animationDuration, l = n.animationEasing, u = n.animationMatchBy, d = n.animationInterpolateFn, f = n.layout, p = bL(r.current), m = nM(n.onAnimationStart, n.onAnimationEnd), h = m.isAnimating, g = m.handleAnimationStart, _ = m.handleAnimationEnd, v = !h, y = UI(a), b = (0, P.useCallback)((e) => e > 0 && p > 0, [p]);
	return /*#__PURE__*/ P.createElement(EL, {
		points: a,
		showLabels: v
	}, n.children, /*#__PURE__*/ P.createElement(rM, {
		animationInput: a,
		animationIdPrefix: "recharts-line-",
		items: a,
		previousItemsRef: i,
		isAnimationActive: o,
		animationBegin: s,
		animationDuration: c,
		animationEasing: l,
		onAnimationStart: g,
		onAnimationEnd: _,
		animationInterpolateFn: d,
		animationMatchBy: u,
		shouldUpdatePreviousRef: b,
		layout: f
	}, (e, i, a) => {
		var o = h || i < 1, s = o ? y(i, p) : null;
		return /*#__PURE__*/ P.createElement(DL, {
			props: n,
			points: e,
			clipPathId: t,
			pathRef: r,
			animationElapsedTime: i,
			isAnimating: o,
			isEntrance: a,
			visibleLength: s
		});
	}), /*#__PURE__*/ P.createElement(sA, { label: n.label }));
}
function kL(e) {
	var t = e.clipPathId, n = e.props, r = (0, P.useRef)(null), i = (0, P.useRef)(null);
	return /*#__PURE__*/ P.createElement(OL, {
		props: n,
		clipPathId: t,
		previousPointsRef: r,
		pathRef: i
	});
}
var AL = (e, t) => ({
	x: e.x ?? void 0,
	y: e.y ?? void 0,
	value: e.value,
	errorVal: K(e.payload, t)
}), jL = class extends P.Component {
	render() {
		var e = this.props, t = e.hide, n = e.dot, r = e.points, i = e.className, a = e.xAxisId, o = e.yAxisId, s = e.top, c = e.left, l = e.width, u = e.height, d = e.id, f = e.needClip, p = e.zIndex;
		if (t) return null;
		var m = N("recharts-line", i), h = d, g = cL(n), _ = g.r, v = g.strokeWidth, y = _j(n), b = _ * 2 + v, x = f ? `url(#clipPath-${y ? "" : "dots-"}${h})` : void 0;
		return /*#__PURE__*/ P.createElement(cD, { zIndex: p }, /*#__PURE__*/ P.createElement(F, { className: m }, f && /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement($I, {
			clipPathId: h,
			xAxisId: a,
			yAxisId: o
		}), !y && /*#__PURE__*/ P.createElement("clipPath", { id: `clipPath-dots-${h}` }, /*#__PURE__*/ P.createElement("rect", {
			x: c - b / 2,
			y: s - b / 2,
			width: l + b,
			height: u + b
		}))), /*#__PURE__*/ P.createElement(ZI, {
			xAxisId: a,
			yAxisId: o,
			data: r,
			dataPointFormatter: AL,
			errorBarOffset: 0
		}, /*#__PURE__*/ P.createElement(kL, {
			props: this.props,
			clipPathId: h
		}))), /*#__PURE__*/ P.createElement(cN, {
			activeDot: this.props.activeDot,
			points: r,
			mainColor: this.props.stroke,
			itemDataKey: this.props.dataKey,
			clipPath: x
		}));
	}
};
function ML(e) {
	var t = Zr(e, SL), n = t.activeDot, r = t.animateNewValues, i = t.animationBegin, a = t.animationDuration, o = t.animationEasing, s = t.connectNulls, c = t.dot, l = t.hide, u = t.isAnimationActive, d = t.label, f = t.legendType, p = t.xAxisId, m = t.yAxisId, h = t.id, g = pL(t, dL), _ = QI(p, m).needClip, v = eN(), y = Gu(), b = ru(), x = V((e) => sL(e, p, m, b, h));
	if (y !== "horizontal" && y !== "vertical" || x == null || v == null) return null;
	var S = v.height, C = v.width, w = v.x, T = v.y;
	return /*#__PURE__*/ P.createElement(jL, fL({}, g, {
		id: h,
		connectNulls: s,
		dot: c,
		activeDot: n,
		animateNewValues: r,
		animationBegin: i,
		animationDuration: a,
		animationEasing: o,
		isAnimationActive: u,
		hide: l,
		label: d,
		legendType: f,
		xAxisId: p,
		yAxisId: m,
		points: x,
		layout: y,
		height: S,
		width: C,
		left: w,
		top: T,
		needClip: _
	}));
}
function NL(e) {
	var t = e.layout, n = e.xAxis, r = e.yAxis, i = e.xAxisTicks, a = e.yAxisTicks, o = e.dataKey, s = e.bandSize;
	return e.displayedData.map((e, c) => {
		var l = K(e, o);
		if (t === "horizontal") return {
			x: Cl({
				axis: n,
				ticks: i,
				bandSize: s,
				entry: e,
				index: c
			}),
			y: (R(l) ? null : r.scale.map(l)) ?? null,
			value: l,
			payload: e
		};
		var u = R(l) ? null : n.scale.map(l), d = Cl({
			axis: r,
			ticks: a,
			bandSize: s,
			entry: e,
			index: c
		});
		return u == null || d == null ? null : {
			x: u,
			y: d,
			value: l,
			payload: e
		};
	}).filter(Boolean);
}
function PL(e) {
	var t = Zr(e, SL), n = ru();
	return /*#__PURE__*/ P.createElement(pM, {
		id: t.id,
		type: "line"
	}, (e) => /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Nj, { legendPayload: CL(t) }), /*#__PURE__*/ P.createElement(wL, {
		dataKey: t.dataKey,
		data: t.data,
		stroke: t.stroke,
		strokeWidth: t.strokeWidth,
		fill: t.fill,
		name: t.name,
		hide: t.hide,
		unit: t.unit,
		formatter: t.formatter,
		tooltipType: t.tooltipType,
		id: e
	}), /*#__PURE__*/ P.createElement(CM, {
		type: "line",
		id: e,
		data: t.data,
		xAxisId: t.xAxisId,
		yAxisId: t.yAxisId,
		zAxisId: 0,
		dataKey: t.dataKey,
		hide: t.hide,
		isPanorama: n
	}), /*#__PURE__*/ P.createElement(ML, fL({}, t, { id: e }))));
}
var FL = /*#__PURE__*/ P.memo(PL, Cd);
FL.displayName = "Line";
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/graphicalItemSelectors.js
function IL(e, t) {
	return e.graphicalItems.cartesianItems.find((e) => e.id === t)?.xAxisId ?? 0;
}
function LL(e, t) {
	return e.graphicalItems.cartesianItems.find((e) => e.id === t)?.yAxisId ?? 0;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/areaSelectors.js
var RL = (e, t, n) => Fw(e, "xAxis", IL(e, t), n), zL = (e, t, n) => Pw(e, "xAxis", IL(e, t), n), BL = (e, t, n) => Fw(e, "yAxis", LL(e, t), n), VL = (e, t, n) => Pw(e, "yAxis", LL(e, t), n), HL = H([
	q,
	RL,
	BL,
	zL,
	VL
], (e, t, n, r, i) => gl(e, "xAxis") ? jl(t, r, !1) : jl(n, i, !1)), UL = H([HS, (e, t) => t], (e, t) => e.filter((e) => e.type === "area").find((e) => e.id === t)), WL = (e) => gl(q(e), "xAxis") ? "yAxis" : "xAxis", GL = (e, t) => WL(e) === "yAxis" ? LL(e, t) : IL(e, t), KL = (e, t, n) => mC(e, WL(e), GL(e, t), n), qL = H([
	q,
	RL,
	BL,
	zL,
	VL,
	H([UL, KL], (e, t) => {
		if (e != null && t != null) {
			var n = e.stackId, r = wg(e);
			if (n != null && r != null) {
				var i = (t[n]?.stackedData)?.find((e) => e.key === r);
				if (i != null) return i.map((e) => [e[0], e[1]]);
			}
		}
	}),
	hh,
	HL,
	UL,
	eg,
	H([UL, KL], (e, t) => {
		if (e != null && e.stackId != null && t != null) {
			var n = t[e.stackId];
			if (n != null) return n.graphicalItems.map((e) => e.dataKey).filter(Gt);
		}
	})
], (e, t, n, r, i, a, o, s, c, l, u) => {
	var d = o.chartData, f = o.dataStartIndex, p = o.dataEndIndex;
	if (!(c == null || e !== "horizontal" && e !== "vertical" || t == null || n == null || r == null || i == null || r.length === 0 || i.length === 0 || s == null)) {
		var m = c.data, h = m && m.length > 0 ? m : d?.slice(f, p + 1);
		if (h != null) return ER({
			layout: e,
			xAxis: t,
			yAxis: n,
			xAxisTicks: r,
			yAxisTicks: i,
			dataStartIndex: f,
			areaSettings: c,
			stackedData: a,
			displayedData: h,
			chartBaseValue: l,
			bandSize: s,
			stackDataKeys: u
		});
	}
}), JL = [
	"animationElapsedTime",
	"isAnimating",
	"isEntrance",
	"layout",
	"isRange",
	"stroke",
	"connectNulls"
], YL = ["id", "baseLine"];
function XL() {
	return XL = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, XL.apply(null, arguments);
}
function ZL(e, t) {
	if (e == null) return {};
	var n, r, i = QL(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function QL(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function $L(e) {
	var t = e.alpha, n = e.baseLine, r = e.points, i = e.strokeWidth, a = r[0]?.x, o = r[r.length - 1]?.x;
	if (!G(a) || !G(o)) return null;
	var s = t * Math.abs(a - o), c = Math.max(...r.map((e) => e.y || 0));
	return I(n) ? c = Math.max(n, c) : n && Array.isArray(n) && n.length && (c = Math.max(...n.map((e) => e.y || 0), c)), I(c) ? /*#__PURE__*/ P.createElement("rect", {
		x: a < o ? a : a - s,
		y: 0,
		width: s,
		height: Math.floor(c + (i ? parseInt(`${i}`, 10) : 1))
	}) : null;
}
function eR(e) {
	var t = e.alpha, n = e.baseLine, r = e.points, i = e.strokeWidth, a = r[0]?.y, o = r[r.length - 1]?.y;
	if (!G(a) || !G(o)) return null;
	var s = t * Math.abs(a - o), c = Math.max(...r.map((e) => e.x || 0));
	return I(n) ? c = Math.max(n, c) : n && Array.isArray(n) && n.length && (c = Math.max(...n.map((e) => e.x || 0), c)), I(c) ? /*#__PURE__*/ P.createElement("rect", {
		x: 0,
		y: a < o ? a : a - s,
		width: c + (i ? parseInt(`${i}`, 10) : 1),
		height: Math.floor(s)
	}) : null;
}
function tR(e) {
	var t = e.alpha, n = e.layout, r = e.points, i = e.baseLine, a = e.strokeWidth;
	return n === "vertical" ? /*#__PURE__*/ P.createElement(eR, {
		alpha: t,
		points: r,
		baseLine: i,
		strokeWidth: a
	}) : /*#__PURE__*/ P.createElement($L, {
		alpha: t,
		points: r,
		baseLine: i,
		strokeWidth: a
	});
}
function nR(e) {
	var t = e.animationElapsedTime, n = t === void 0 ? 1 : t, r = e.isAnimating, i = r !== void 0 && r, a = e.isEntrance, o = a !== void 0 && a, s = e.layout, c = e.isRange, l = e.stroke, u = e.connectNulls, d = ZL(e, JL), f = s === "vertical" ? "vertical" : "horizontal", p = u ?? !1, m = uM(), h = d.id, g = d.baseLine, _ = lt(ZL(d, YL)), v = /*#__PURE__*/ P.createElement(op, XL({}, d, {
		id: h,
		baseLine: g,
		connectNulls: p,
		stroke: "none",
		className: "recharts-area-area",
		layout: f
	})), y = l !== "none" && /*#__PURE__*/ P.createElement(op, XL({}, _, {
		className: "recharts-area-curve",
		layout: f,
		type: d.type,
		connectNulls: p,
		fill: "none",
		stroke: l,
		points: d.points
	})), b = l !== "none" && c && Array.isArray(g) && /*#__PURE__*/ P.createElement(op, XL({}, _, {
		className: "recharts-area-curve",
		layout: f,
		type: d.type,
		connectNulls: p,
		fill: "none",
		stroke: l,
		points: g
	}));
	return o && (i || n < 1) ? /*#__PURE__*/ P.createElement(F, null, /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement("clipPath", { id: m }, /*#__PURE__*/ P.createElement(tR, {
		alpha: n,
		points: d.points ?? [],
		baseLine: g,
		layout: f,
		strokeWidth: d.strokeWidth
	}))), /*#__PURE__*/ P.createElement(F, { clipPath: `url(#${m})` }, v, y, b)) : /*#__PURE__*/ P.createElement(P.Fragment, null, v, y, b);
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/Area.js
var rR = ["id"], iR = [
	"activeDot",
	"animationBegin",
	"animationDuration",
	"animationEasing",
	"connectNulls",
	"dot",
	"fill",
	"fillOpacity",
	"hide",
	"isAnimationActive",
	"legendType",
	"stroke",
	"xAxisId",
	"yAxisId"
];
function aR() {
	return aR = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, aR.apply(null, arguments);
}
function oR(e, t) {
	if (e == null) return {};
	var n, r, i = sR(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function sR(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function cR(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function lR(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? cR(Object(n), !0).forEach(function(t) {
			uR(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : cR(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function uR(e, t, n) {
	return (t = dR(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function dR(e) {
	var t = fR(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function fR(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var pR = {
	activeDot: !0,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	animationMatchBy: Vj,
	animationInterpolateFn: (e, t) => e == null ? [] : t === 1 ? e.flatMap((e) => e.status === "removed" ? [] : [e.next]) : e.flatMap((e) => e.status === "matched" ? [lR(lR({}, e.next), {}, {
		x: L(e.prev.x, e.next.x, t),
		y: L(e.prev.y, e.next.y, t)
	})] : e.status === "added" ? [e.next] : []),
	connectNulls: !1,
	dot: !1,
	fill: "#3182bd",
	fillOpacity: .6,
	hide: !1,
	isAnimationActive: "auto",
	legendType: "line",
	stroke: "#3182bd",
	strokeWidth: 1,
	type: "linear",
	label: !1,
	shape: nR,
	xAxisId: 0,
	yAxisId: 0,
	zIndex: Y.area
};
function mR(e, t) {
	return e && e !== "none" ? e : t;
}
var hR = (e) => {
	var t = e.dataKey, n = e.name, r = e.stroke, i = e.fill, a = e.legendType;
	return [{
		inactive: e.hide,
		dataKey: t,
		type: a,
		color: mR(r, i),
		value: Nl(n, t),
		payload: e
	}];
}, gR = /*#__PURE__*/ P.memo((e) => {
	var t = e.dataKey, n = e.data, r = e.stroke, i = e.strokeWidth, a = e.fill, o = e.name, s = e.hide, c = e.unit, l = e.formatter, u = e.tooltipType, d = e.id, f = {
		dataDefinedOnItem: n,
		getPosition: Kt,
		settings: {
			stroke: r,
			strokeWidth: i,
			fill: a,
			dataKey: t,
			nameKey: void 0,
			name: Nl(o, t),
			hide: s,
			type: u,
			color: mR(r, a),
			unit: c,
			formatter: l,
			graphicalItemId: d
		}
	};
	return /*#__PURE__*/ P.createElement(Mj, { tooltipEntrySettings: f });
});
function _R(e) {
	var t = e.clipPathId, n = e.points, r = e.props, i = r.needClip, a = r.dot, o = r.dataKey, s = lt(r);
	return /*#__PURE__*/ P.createElement(IM, {
		points: n,
		dot: a,
		className: "recharts-area-dots",
		dotClassName: "recharts-area-dot",
		dataKey: o,
		baseProps: s,
		needClip: i,
		clipPathId: t
	});
}
function vR(e) {
	var t = e.showLabels, n = e.children, r = e.points.map((e) => {
		var t = {
			x: e.x ?? 0,
			y: e.y ?? 0,
			width: 0,
			lowerWidth: 0,
			upperWidth: 0,
			height: 0
		};
		return lR(lR({}, t), {}, {
			value: e.value,
			payload: e.payload,
			parentViewBox: void 0,
			viewBox: t,
			fill: void 0
		});
	});
	return /*#__PURE__*/ P.createElement(tA, { value: t ? r : void 0 }, n);
}
function yR(e) {
	var t = e.points, n = e.baseLine, r = e.needClip, i = e.clipPathId, a = e.props, o = e.animationElapsedTime, s = e.isAnimating, c = e.isEntrance, l = a.layout, u = a.type, d = a.stroke, f = a.connectNulls, p = a.isRange, m = a.shape, h = a.id, g = oR(a, rR), _ = lR(lR({}, dt(g)), {}, {
		id: h,
		points: t,
		connectNulls: f,
		type: u,
		baseLine: n,
		layout: l,
		stroke: d,
		isRange: p,
		animationElapsedTime: o,
		isAnimating: s,
		isEntrance: c
	});
	return /*#__PURE__*/ P.createElement(P.Fragment, null, t?.length > 1 && /*#__PURE__*/ P.createElement(F, { clipPath: r ? `url(#clipPath-${i})` : void 0 }, /*#__PURE__*/ P.createElement(Oj, {
		option: m,
		DefaultShape: pR.shape,
		shapeProps: _
	})), /*#__PURE__*/ P.createElement(_R, {
		points: t,
		props: g,
		clipPathId: i
	}));
}
function bR(e, t, n) {
	return I(e) ? L(I(t) ? t : void 0, e, n) : R(e) || It(e) ? L(I(t) ? t : void 0, 0, n) : e;
}
function xR(e) {
	var t = e.needClip, n = e.clipPathId, r = e.props, i = e.previousPointsRef, a = e.previousBaselineRef, o = r.points, s = r.baseLine, c = r.isAnimationActive, l = r.animationBegin, u = r.animationDuration, d = r.animationEasing, f = r.animationMatchBy, p = r.animationInterpolateFn, m = (0, P.useMemo)(() => ({
		points: o,
		baseLine: s
	}), [o, s]), h = Yj(m, a), g = Ku(), _ = nM(r.onAnimationStart, r.onAnimationEnd), v = _.isAnimating, y = _.handleAnimationStart, b = _.handleAnimationEnd, x = h.startValue;
	if (g == null) return null;
	var S = Array.isArray(s) && Array.isArray(x) ? Jj(x, s, f) : Array.isArray(s) ? Jj(null, s, f) : null;
	return /*#__PURE__*/ P.createElement(rM, {
		animationInput: m,
		animationIdPrefix: "recharts-area-",
		items: o,
		previousItemsRef: i,
		isAnimationActive: c,
		animationBegin: l,
		animationDuration: u,
		animationEasing: d,
		onAnimationStart: y,
		onAnimationEnd: b,
		animationInterpolateFn: p,
		animationMatchBy: f,
		layout: g
	}, (e, i, a) => {
		var c = i === 1 ? s : Array.isArray(s) ? p(S, i, g) : a ? s : bR(s, x, i);
		return h.syncStepValue(c, i), /*#__PURE__*/ P.createElement(vR, {
			showLabels: !v,
			points: o
		}, r.children, /*#__PURE__*/ P.createElement(yR, {
			points: e,
			baseLine: c,
			needClip: t,
			clipPathId: n,
			props: r,
			animationElapsedTime: i,
			isAnimating: v || i < 1,
			isEntrance: a
		}), /*#__PURE__*/ P.createElement(sA, { label: r.label }));
	});
}
function SR(e) {
	var t = e.needClip, n = e.clipPathId, r = e.props, i = (0, P.useRef)(null), a = (0, P.useRef)();
	return /*#__PURE__*/ P.createElement(xR, {
		needClip: t,
		clipPathId: n,
		props: r,
		previousPointsRef: i,
		previousBaselineRef: a
	});
}
var CR = class extends P.PureComponent {
	render() {
		var e = this.props, t = e.hide, n = e.dot, r = e.points, i = e.className, a = e.top, o = e.left, s = e.needClip, c = e.xAxisId, l = e.yAxisId, u = e.width, d = e.height, f = e.id, p = e.baseLine, m = e.zIndex;
		if (t) return null;
		var h = N("recharts-area", i), g = f, _ = cL(n), v = _.r, y = _.strokeWidth, b = _j(n), x = v * 2 + y, S = s ? `url(#clipPath-${b ? "" : "dots-"}${g})` : void 0;
		return /*#__PURE__*/ P.createElement(cD, { zIndex: m }, /*#__PURE__*/ P.createElement(F, { className: h }, s && /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement($I, {
			clipPathId: g,
			xAxisId: c,
			yAxisId: l
		}), !b && /*#__PURE__*/ P.createElement("clipPath", { id: `clipPath-dots-${g}` }, /*#__PURE__*/ P.createElement("rect", {
			x: o - x / 2,
			y: a - x / 2,
			width: u + x,
			height: d + x
		}))), /*#__PURE__*/ P.createElement(SR, {
			needClip: s,
			clipPathId: g,
			props: this.props
		})), /*#__PURE__*/ P.createElement(cN, {
			points: r,
			mainColor: mR(this.props.stroke, this.props.fill),
			itemDataKey: this.props.dataKey,
			activeDot: this.props.activeDot,
			clipPath: S
		}), this.props.isRange && Array.isArray(p) && /*#__PURE__*/ P.createElement(cN, {
			points: p,
			mainColor: mR(this.props.stroke, this.props.fill),
			itemDataKey: this.props.dataKey,
			activeDot: this.props.activeDot,
			clipPath: S
		}));
	}
};
function wR(e) {
	var t = e.activeDot, n = e.animationBegin, r = e.animationDuration, i = e.animationEasing, a = e.connectNulls, o = e.dot, s = e.fill, c = e.fillOpacity, l = e.hide, u = e.isAnimationActive, d = e.legendType, f = e.stroke, p = e.xAxisId, m = e.yAxisId, h = oR(e, iR), g = Gu(), _ = OE(), v = QI(p, m).needClip, y = ru(), b = V((t) => qL(t, e.id, y)) ?? {}, x = b.points, S = b.isRange, C = b.baseLine, w = eN();
	if (g !== "horizontal" && g !== "vertical" || w == null || _ !== "AreaChart" && _ !== "ComposedChart") return null;
	var T = w.height, E = w.width, D = w.x, O = w.y;
	return !x || !x.length ? null : /*#__PURE__*/ P.createElement(CR, aR({}, h, {
		activeDot: t,
		animationBegin: n,
		animationDuration: r,
		animationEasing: i,
		baseLine: C,
		connectNulls: a,
		dot: o,
		fill: s,
		fillOpacity: c,
		height: T,
		hide: l,
		layout: g,
		isAnimationActive: u,
		isRange: S,
		legendType: d,
		needClip: v,
		points: x,
		stroke: f,
		width: E,
		left: D,
		top: O,
		xAxisId: p,
		yAxisId: m
	}));
}
var TR = (e, t, n, r, i) => {
	var a = n ?? t;
	if (I(a)) return a;
	var o = e === "horizontal" ? i : r, s = o.scale.domain();
	if (o.type === "number") {
		var c = Math.max(s[0], s[1]), l = Math.min(s[0], s[1]);
		return a === "dataMin" ? l : a === "dataMax" || c < 0 ? c : Math.max(Math.min(s[0], s[1]), 0);
	}
	return a === "dataMin" ? s[0] : a === "dataMax" ? s[1] : s[0];
};
function ER(e) {
	var t = e.areaSettings, n = t.connectNulls, r = t.baseValue, i = t.dataKey, a = e.stackedData, o = e.layout, s = e.chartBaseValue, c = e.xAxis, l = e.yAxis, u = e.displayedData, d = e.dataStartIndex, f = e.xAxisTicks, p = e.yAxisTicks, m = e.bandSize, h = e.stackDataKeys, g = a && a.length, _ = TR(o, s, r, c, l), v = o === "horizontal", y = !1, b = u.map((e, t) => {
		var r;
		if (g) r = a[d + t];
		else {
			var o = K(e, i);
			Array.isArray(o) ? (r = o, y = !0) : r = [_, o];
		}
		var s = r?.[1] ?? null, u = K(e, i), b = g && u == null && h != null && h.length > 0 && h.every((t) => K(e, t) == null), x = s == null || g && !n && u == null || b;
		return v ? {
			x: Cl({
				axis: c,
				ticks: f,
				bandSize: m,
				entry: e,
				index: t
			}),
			y: x ? null : l.scale.map(s) ?? null,
			value: r,
			payload: e
		} : {
			x: x ? null : c.scale.map(s) ?? null,
			y: Cl({
				axis: l,
				ticks: p,
				bandSize: m,
				entry: e,
				index: t
			}),
			value: r,
			payload: e
		};
	});
	return {
		points: b,
		baseLine: (g || y ? b.map((e) => {
			var t = Array.isArray(e.value) ? e.value[0] : null;
			return v ? {
				x: e.x,
				y: t != null && e.y != null ? l.scale.map(t) ?? null : null,
				payload: e.payload
			} : {
				x: t == null ? null : c.scale.map(t) ?? null,
				y: e.y,
				payload: e.payload
			};
		}) : v ? l.scale.map(_) : c.scale.map(_)) ?? 0,
		isRange: y
	};
}
function DR(e) {
	var t = Zr(e, pR), n = ru();
	return /*#__PURE__*/ P.createElement(pM, {
		id: t.id,
		type: "area"
	}, (e) => /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Nj, { legendPayload: hR(t) }), /*#__PURE__*/ P.createElement(gR, {
		dataKey: t.dataKey,
		data: t.data,
		stroke: t.stroke,
		strokeWidth: t.strokeWidth,
		fill: t.fill,
		name: t.name,
		hide: t.hide,
		unit: t.unit,
		formatter: t.formatter,
		tooltipType: t.tooltipType,
		id: e
	}), /*#__PURE__*/ P.createElement(CM, {
		type: "area",
		id: e,
		data: t.data,
		dataKey: t.dataKey,
		xAxisId: t.xAxisId,
		yAxisId: t.yAxisId,
		zAxisId: 0,
		stackId: Sl(t.stackId),
		hide: t.hide,
		barSize: void 0,
		baseValue: t.baseValue,
		isPanorama: n,
		connectNulls: t.connectNulls
	}), /*#__PURE__*/ P.createElement(wR, aR({}, t, { id: e }))));
}
var OR = /*#__PURE__*/ P.memo(DR, Cd);
OR.displayName = "Area";
// ../../../peach/frontend/node_modules/tiny-invariant/dist/esm/tiny-invariant.js
var kR = "Invariant failed";
function AR(e, t) {
	if (!e) throw Error(kR);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/BarUtils.js
var jR = ["option"];
function MR(e, t) {
	if (e == null) return {};
	var n, r, i = NR(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function NR(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var PR = Am;
function FR(e) {
	var t = e.option, n = MR(e, jR);
	return /*#__PURE__*/ P.createElement(Oj, {
		option: t,
		DefaultShape: PR,
		shapeProps: n,
		activeClassName: "recharts-active-bar",
		inActiveClassName: "recharts-inactive-bar"
	});
}
var IR = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
	return (n, r) => {
		if (I(e)) return e;
		var i = I(n) || R(n);
		return i ? e(n, r) : (!i && AR(!1, `minPointSize callback function received a value with type of ${typeof n}. Currently only numbers or null/undefined are supported.`), t);
	};
}, LR = (e, t, n) => n, RR = H([HS, (e, t) => t], (e, t) => e.filter((e) => e.type === "bar").find((e) => e.id === t)), zR = H([RR], (e) => e?.maxBarSize), BR = (e, t, n, r) => r, VR = H([
	q,
	HS,
	IL,
	LL,
	LR
], (e, t, n, r, i) => t.filter((t) => e === "horizontal" ? t.xAxisId === n : t.yAxisId === r).filter((e) => e.isPanorama === i).filter((e) => e.hide === !1).filter((e) => e.type === "bar")), HR = (e, t, n) => {
	var r = q(e), i = IL(e, t), a = LL(e, t);
	if (i != null && a != null) return r === "horizontal" ? mC(e, "yAxis", a, n) : mC(e, "xAxis", i, n);
}, UR = H([
	VR,
	qh,
	(e, t) => {
		var n = q(e), r = IL(e, t), i = LL(e, t);
		if (r != null && i != null) return n === "horizontal" ? Dw(e, "xAxis", r) : Dw(e, "yAxis", i);
	}
], SN), WR = (e, t, n) => {
	var r = RR(e, t);
	if (r == null) return 0;
	var i = IL(e, t), a = LL(e, t);
	if (i == null || a == null) return 0;
	var o = q(e), s = Wh(e), c = r.maxBarSize, l = R(c) ? s : c, u, d;
	return o === "horizontal" ? (u = Fw(e, "xAxis", i, n), d = Pw(e, "xAxis", i, n)) : (u = Fw(e, "yAxis", a, n), d = Pw(e, "yAxis", a, n)), jl(u, d, !0) ?? l ?? 0;
}, GR = (e, t, n) => {
	var r = q(e), i = IL(e, t), a = LL(e, t);
	if (i != null && a != null) {
		var o, s;
		return r === "horizontal" ? (o = Fw(e, "xAxis", i, n), s = Pw(e, "xAxis", i, n)) : (o = Fw(e, "yAxis", a, n), s = Pw(e, "yAxis", a, n)), jl(o, s);
	}
}, KR = H([
	$l,
	tu,
	(e, t, n) => {
		var r = IL(e, t);
		if (r != null) return Fw(e, "xAxis", r, n);
	},
	(e, t, n) => {
		var r = LL(e, t);
		if (r != null) return Fw(e, "yAxis", r, n);
	},
	(e, t, n) => {
		var r = IL(e, t);
		if (r != null) return Pw(e, "xAxis", r, n);
	},
	(e, t, n) => {
		var r = LL(e, t);
		if (r != null) return Pw(e, "yAxis", r, n);
	},
	H([H([
		UR,
		Wh,
		Gh,
		Kh,
		WR,
		GR,
		zR
	], kN), RR], jN),
	q,
	hh,
	GR,
	H([HR, RR], AN),
	RR,
	BR
], (e, t, n, r, i, a, o, s, c, l, u, d, f) => {
	var p = c.chartData, m = c.dataStartIndex, h = c.dataEndIndex;
	if (!(d == null || o == null || t == null || s !== "horizontal" && s !== "vertical" || n == null || r == null || i == null || a == null || l == null)) {
		var g = d.data, _ = g != null && g.length > 0 ? g : p?.slice(m, h + 1);
		if (_ != null) return Fz({
			layout: s,
			barSettings: d,
			pos: o,
			parentViewBox: t,
			bandSize: l,
			xAxis: n,
			yAxis: r,
			xAxisTicks: i,
			yAxisTicks: a,
			stackedData: u,
			displayedData: _,
			offset: e,
			cells: f,
			dataStartIndex: m
		});
	}
}), qR = ["index"];
function JR() {
	return JR = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, JR.apply(null, arguments);
}
function YR(e, t) {
	if (e == null) return {};
	var n, r, i = XR(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function XR(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var ZR = /*#__PURE__*/ (0, P.createContext)(void 0), QR = (e) => {
	var t = (0, P.useContext)(ZR);
	if (t != null) return t.stackId;
	if (e != null) return Sl(e);
}, $R = (e, t) => `recharts-bar-stack-clip-path-${e}-${t}`, ez = (e) => {
	var t = (0, P.useContext)(ZR);
	if (t != null) {
		var n = t.stackId;
		return `url(#${$R(n, e)})`;
	}
}, tz = (e) => {
	var t = e.index, n = YR(e, qR), r = ez(t);
	return /*#__PURE__*/ P.createElement(F, JR({
		className: "recharts-bar-stack-layer",
		clipPath: r
	}, n));
}, nz = [
	"onMouseEnter",
	"onMouseLeave",
	"onClick"
], rz = [
	"value",
	"background",
	"tooltipPosition"
], iz = ["id"], az = [
	"onMouseEnter",
	"onClick",
	"onMouseLeave"
];
function oz(e, t) {
	return dz(e) || uz(e, t) || cz(e, t) || sz();
}
function sz() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function cz(e, t) {
	if (e) {
		if (typeof e == "string") return lz(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? lz(e, t) : void 0;
	}
}
function lz(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function uz(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function dz(e) {
	if (Array.isArray(e)) return e;
}
function fz() {
	return fz = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, fz.apply(null, arguments);
}
function pz(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function mz(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? pz(Object(n), !0).forEach(function(t) {
			hz(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pz(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function hz(e, t, n) {
	return (t = gz(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function gz(e) {
	var t = _z(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function _z(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function vz(e, t) {
	if (e == null) return {};
	var n, r, i = yz(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function yz(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var bz = (e) => {
	var t = e.dataKey, n = e.name, r = e.fill, i = e.legendType;
	return [{
		inactive: e.hide,
		dataKey: t,
		type: i,
		color: r,
		value: Nl(n, t),
		payload: e
	}];
}, xz = /*#__PURE__*/ P.memo((e) => {
	var t = e.dataKey, n = e.stroke, r = e.strokeWidth, i = e.fill, a = e.name, o = e.hide, s = e.unit, c = e.formatter, l = e.tooltipType, u = e.id, d = {
		dataDefinedOnItem: void 0,
		getPosition: Kt,
		settings: {
			stroke: n,
			strokeWidth: r,
			fill: i,
			dataKey: t,
			nameKey: void 0,
			name: Nl(a, t),
			hide: o,
			type: l,
			color: i,
			unit: s,
			formatter: c,
			graphicalItemId: u
		}
	};
	return /*#__PURE__*/ P.createElement(Mj, { tooltipEntrySettings: d });
});
function Sz(e) {
	var t = V(iE), n = e.data, r = e.dataKey, i = e.background, a = e.allOtherBarProps, o = a.onMouseEnter, s = a.onMouseLeave, c = a.onClick, l = vz(a, nz), u = kj(o, r, a.id), d = Aj(s), f = jj(c, r, a.id);
	if (!i || n == null) return null;
	var p = ut(i);
	return /*#__PURE__*/ P.createElement(cD, { zIndex: eP(i, Y.barBackground) }, n.map((e, n) => {
		e.value;
		var a = e.background;
		e.tooltipPosition;
		var o = vz(e, rz);
		if (!a) return null;
		var s = u(e, e.originalDataIndex), c = d(e, e.originalDataIndex), m = f(e, e.originalDataIndex), h = mz(mz(mz(mz(mz({
			option: i,
			isActive: String(e.originalDataIndex) === t
		}, o), {}, { fill: "#eee" }, a), p), Gr(l, e, n)), {}, {
			onMouseEnter: s,
			onMouseLeave: c,
			onClick: m,
			dataKey: r,
			index: n,
			className: "recharts-bar-background-rectangle"
		});
		return /*#__PURE__*/ P.createElement(FR, fz({ key: `background-bar-${n}` }, h));
	}));
}
function Cz(e) {
	var t = e.showLabels, n = e.children, r = e.rects?.map((e) => {
		var t = {
			x: e.x,
			y: e.y,
			width: e.width,
			lowerWidth: e.width,
			upperWidth: e.width,
			height: e.height
		};
		return mz(mz({}, t), {}, {
			value: e.value,
			payload: e.payload,
			parentViewBox: e.parentViewBox,
			viewBox: t,
			fill: e.fill
		});
	});
	return /*#__PURE__*/ P.createElement(tA, { value: t ? r : void 0 }, n);
}
function wz(e) {
	var t = e.shape, n = e.activeBar, r = e.baseProps, i = e.entry, a = e.index, o = e.dataKey, s = V(iE), c = V(oE), l = n && String(i.originalDataIndex) === s && (c == null || o === c), u = s != null && (String(i.originalDataIndex) !== s || c != null && o !== c), d = oz((0, P.useState)(!1), 2), f = d[0], p = d[1], m = oz((0, P.useState)(!1), 2), h = m[0], g = m[1];
	(0, P.useEffect)(() => {
		var e;
		return l ? (p(!0), e = requestAnimationFrame(() => {
			g(!0);
		})) : (g(!1), u && p(!1)), () => {
			cancelAnimationFrame(e);
		};
	}, [l, u]);
	var _ = (0, P.useCallback)(() => {
		l || p(!1);
	}, [l]), v = l && h, y = l || f, b = l ? n === !0 ? t : n : t, x = /*#__PURE__*/ P.createElement(FR, fz({}, r, { name: String(r.name) }, i, {
		isActive: v,
		option: b,
		index: a,
		dataKey: o,
		animationElapsedTime: e.animationElapsedTime,
		isAnimating: e.isAnimating,
		isEntrance: e.isEntrance,
		onTransitionEnd: _
	}));
	return y ? /*#__PURE__*/ P.createElement(cD, { zIndex: Y.activeBar }, /*#__PURE__*/ P.createElement(tz, { index: i.originalDataIndex }, x)) : x;
}
function Tz(e) {
	var t = e.shape, n = e.baseProps, r = e.entry, i = e.index, a = e.dataKey;
	return /*#__PURE__*/ P.createElement(FR, fz({}, n, { name: String(n.name) }, r, {
		isActive: !1,
		option: t,
		index: i,
		dataKey: a,
		animationElapsedTime: e.animationElapsedTime,
		isAnimating: e.isAnimating,
		isEntrance: e.isEntrance
	}));
}
function Ez(e) {
	var t = e.data, n = e.props, r = e.animationElapsedTime, i = e.isAnimating, a = e.isEntrance, o = lt(n) ?? {}, s = o.id, c = vz(o, iz), l = n.shape, u = n.dataKey, d = n.activeBar, f = n.onMouseEnter, p = n.onClick, m = n.onMouseLeave, h = vz(n, az), g = kj(f, u, s), _ = Aj(m), v = jj(p, u, s);
	return t ? /*#__PURE__*/ P.createElement(P.Fragment, null, t.map((e, t) => /*#__PURE__*/ P.createElement(tz, fz({
		index: e.originalDataIndex,
		key: `rectangle-${e?.x}-${e?.y}-${e?.value}-${t}`,
		className: "recharts-bar-rectangle"
	}, Gr(h, e, t), {
		onMouseEnter: g(e, e.originalDataIndex),
		onMouseLeave: _(e, e.originalDataIndex),
		onClick: v(e, e.originalDataIndex)
	}), d ? /*#__PURE__*/ P.createElement(wz, {
		shape: l,
		activeBar: d,
		baseProps: c,
		entry: e,
		index: t,
		dataKey: u,
		animationElapsedTime: r,
		isAnimating: i,
		isEntrance: a
	}) : /*#__PURE__*/ P.createElement(Tz, {
		shape: l,
		baseProps: c,
		entry: e,
		index: t,
		dataKey: u,
		animationElapsedTime: r,
		isAnimating: i,
		isEntrance: a
	})))) : null;
}
var Dz = (e, t, n) => e == null ? [] : t === 1 ? e.flatMap((e) => e.status === "removed" ? [] : [e.next]) : e.flatMap((e) => {
	if (e.status === "removed") return n === "horizontal" ? [mz(mz({}, e.prev), {}, {
		height: L(e.prev.height, 0, t),
		y: L(e.prev.y, e.prev.y + e.prev.height, t)
	})] : [mz(mz({}, e.prev), {}, { width: L(e.prev.width, 0, t) })];
	if (e.status === "matched") return [mz(mz({}, e.next), {}, {
		x: L(e.prev.x, e.next.x, t),
		y: L(e.prev.y, e.next.y, t),
		width: L(e.prev.width, e.next.width, t),
		height: L(e.prev.height, e.next.height, t)
	})];
	var r = e.next;
	return n === "horizontal" ? [mz(mz({}, r), {}, {
		height: L(0, r.height, t),
		y: L(r.stackedBarStart, r.y, t)
	})] : [mz(mz({}, r), {}, {
		width: L(0, r.width, t),
		x: L(r.stackedBarStart, r.x, t)
	})];
});
function Oz(e) {
	var t = e.props, n = e.previousRectanglesRef, r = t.data, i = t.isAnimationActive, a = t.animationBegin, o = t.animationDuration, s = t.animationEasing, c = t.animationInterpolateFn, l = t.layout, u = nM(t.onAnimationStart, t.onAnimationEnd), d = u.isAnimating, f = u.handleAnimationStart, p = u.handleAnimationEnd;
	return /*#__PURE__*/ P.createElement(Cz, {
		showLabels: !d,
		rects: r
	}, /*#__PURE__*/ P.createElement(rM, {
		animationInput: r,
		animationIdPrefix: "recharts-bar-",
		items: r,
		previousItemsRef: n,
		isAnimationActive: i,
		animationBegin: a,
		animationDuration: o,
		animationEasing: s,
		onAnimationStart: f,
		onAnimationEnd: p,
		animationInterpolateFn: c,
		animationMatchBy: t.animationMatchBy,
		layout: l
	}, (e, n, r) => /*#__PURE__*/ P.createElement(F, null, /*#__PURE__*/ P.createElement(Ez, {
		props: t,
		data: e,
		animationElapsedTime: n,
		isAnimating: d || n < 1,
		isEntrance: r
	}))), /*#__PURE__*/ P.createElement(sA, { label: t.label }), t.children);
}
function kz(e) {
	var t = (0, P.useRef)(null);
	return /*#__PURE__*/ P.createElement(Oz, {
		previousRectanglesRef: t,
		props: e
	});
}
var Az = 0, jz = (e, t) => {
	var n = Array.isArray(e.value) ? e.value[1] : e.value;
	return {
		x: e.x,
		y: e.y,
		value: n,
		errorVal: K(e, t)
	};
}, Mz = class extends P.PureComponent {
	render() {
		var e = this.props, t = e.hide, n = e.data, r = e.dataKey, i = e.className, a = e.xAxisId, o = e.yAxisId, s = e.needClip, c = e.background, l = e.id;
		if (t || n == null) return null;
		var u = N("recharts-bar", i), d = l;
		return /*#__PURE__*/ P.createElement(F, {
			className: u,
			id: l
		}, s && /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement($I, {
			clipPathId: d,
			xAxisId: a,
			yAxisId: o
		})), /*#__PURE__*/ P.createElement(F, {
			className: "recharts-bar-rectangles",
			clipPath: s ? `url(#clipPath-${d})` : void 0
		}, /*#__PURE__*/ P.createElement(Sz, {
			data: n,
			dataKey: r,
			background: c,
			allOtherBarProps: this.props
		}), /*#__PURE__*/ P.createElement(kz, this.props)));
	}
}, Nz = {
	activeBar: !1,
	animationBegin: 0,
	animationDuration: 400,
	animationEasing: "ease",
	animationInterpolateFn: Dz,
	animationMatchBy: Hj,
	background: !1,
	hide: !1,
	isAnimationActive: "auto",
	label: !1,
	legendType: "rect",
	minPointSize: Az,
	shape: PR,
	xAxisId: 0,
	yAxisId: 0,
	zIndex: Y.bar
};
function Pz(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.hide, i = e.legendType, a = e.minPointSize, o = e.activeBar, s = e.animationBegin, c = e.animationDuration, l = e.animationEasing, u = e.isAnimationActive, d = QI(t, n).needClip, f = Gu(), p = ru(), m = gj(e.children, cO), h = V((t) => KR(t, e.id, p, m));
	if (f !== "vertical" && f !== "horizontal") return null;
	var g, _ = h?.[0];
	return g = _ == null || _.height == null || _.width == null ? 0 : f === "vertical" ? _.height / 2 : _.width / 2, /*#__PURE__*/ P.createElement(ZI, {
		xAxisId: t,
		yAxisId: n,
		data: h,
		dataPointFormatter: jz,
		errorBarOffset: g
	}, /*#__PURE__*/ P.createElement(Mz, fz({}, e, {
		layout: f,
		needClip: d,
		data: h,
		xAxisId: t,
		yAxisId: n,
		hide: r,
		legendType: i,
		minPointSize: a,
		activeBar: o,
		animationBegin: s,
		animationDuration: c,
		animationEasing: l,
		isAnimationActive: u
	})));
}
function Fz(e) {
	var t = e.layout, n = e.barSettings, r = n.dataKey, i = n.minPointSize, a = n.hasCustomShape, o = e.pos, s = e.bandSize, c = e.xAxis, l = e.yAxis, u = e.xAxisTicks, d = e.yAxisTicks, f = e.stackedData, p = e.displayedData, m = e.offset, h = e.cells, g = e.parentViewBox, _ = e.dataStartIndex, v = t === "horizontal" ? l : c, y = f ? v.scale.domain() : null, b = Tl({ numericAxis: v }), x = v.scale.map(b);
	return p.map((e, n) => {
		var p, v, S, C, w, T;
		if (f) {
			var E = f[n + _];
			if (E == null) return null;
			p = yl(E, y);
		} else p = K(e, r), Array.isArray(p) || (p = [b, p]);
		var D = IR(i, Az)(p[1], n);
		if (t === "horizontal") {
			var O = l.scale.map(p[0]), k = l.scale.map(p[1]);
			if (O == null || k == null) return null;
			v = wl({
				axis: c,
				ticks: u,
				bandSize: s,
				offset: o.offset,
				entry: e,
				index: n
			}), S = k ?? O ?? void 0, C = o.size;
			var A = O - k;
			if (w = It(A) ? 0 : A, T = {
				x: v,
				y: m.top,
				width: C,
				height: m.height
			}, Math.abs(D) > 0 && Math.abs(w) < Math.abs(D)) {
				var j = Ft(w || D) * (Math.abs(D) - Math.abs(w));
				S -= j, w += j;
			}
		} else {
			var M = c.scale.map(p[0]), N = c.scale.map(p[1]);
			if (M == null || N == null) return null;
			if (v = M, S = wl({
				axis: l,
				ticks: d,
				bandSize: s,
				offset: o.offset,
				entry: e,
				index: n
			}), C = N - M, w = o.size, T = {
				x: m.left,
				y: S,
				width: m.width,
				height: w
			}, Math.abs(D) > 0 && Math.abs(C) < Math.abs(D)) {
				var ee = Ft(C || D) * (Math.abs(D) - Math.abs(C));
				C += ee;
			}
		}
		return v == null || S == null || C == null || w == null || !a && (C === 0 || w === 0) ? null : mz(mz({}, e), {}, {
			stackedBarStart: x,
			x: v,
			y: S,
			width: C,
			height: w,
			value: f ? p : p[1],
			payload: e,
			background: T,
			tooltipPosition: {
				x: v + C / 2,
				y: S + w / 2
			},
			parentViewBox: g,
			originalDataIndex: n
		}, h && h[n] && h[n].props);
	}).filter(Boolean);
}
function Iz(e) {
	var t = Zr(e, Nz), n = QR(t.stackId), r = ru();
	return /*#__PURE__*/ P.createElement(pM, {
		id: t.id,
		type: "bar"
	}, (e) => /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Nj, { legendPayload: bz(t) }), /*#__PURE__*/ P.createElement(xz, {
		dataKey: t.dataKey,
		stroke: t.stroke,
		strokeWidth: t.strokeWidth,
		fill: t.fill,
		name: t.name,
		hide: t.hide,
		unit: t.unit,
		formatter: t.formatter,
		tooltipType: t.tooltipType,
		id: e
	}), /*#__PURE__*/ P.createElement(CM, {
		type: "bar",
		id: e,
		data: void 0,
		xAxisId: t.xAxisId,
		yAxisId: t.yAxisId,
		zAxisId: 0,
		dataKey: t.dataKey,
		stackId: n,
		hide: t.hide,
		barSize: t.barSize,
		minPointSize: t.minPointSize,
		maxBarSize: t.maxBarSize,
		isPanorama: r,
		hasCustomShape: t.shape != null && t.shape !== PR
	}), /*#__PURE__*/ P.createElement(cD, { zIndex: t.zIndex }, /*#__PURE__*/ P.createElement(Pz, fz({}, t, { id: e })))));
}
var Lz = /*#__PURE__*/ P.memo(Iz, Cd);
Lz.displayName = "Bar";
// ../../../peach/frontend/node_modules/recharts/es6/util/axisPropsAreEqual.js
var Rz = ["domain", "range"], zz = ["domain", "range"];
function Bz(e, t) {
	if (e == null) return {};
	var n, r, i = Vz(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Vz(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function Hz(e, t) {
	return e === t ? !0 : Array.isArray(e) && e.length === 2 && Array.isArray(t) && t.length === 2 ? e[0] === t[0] && e[1] === t[1] : !1;
}
function Uz(e, t) {
	if (e === t) return !0;
	var n = e.domain, r = e.range, i = Bz(e, Rz), a = t.domain, o = t.range, s = Bz(t, zz);
	return !Hz(n, a) || !Hz(r, o) ? !1 : Cd(i, s);
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/XAxis.js
var Wz = ["type"], Gz = [
	"dangerouslySetInnerHTML",
	"ticks",
	"scale"
], Kz = ["id", "scale"];
function qz() {
	return qz = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, qz.apply(null, arguments);
}
function Jz(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Yz(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Jz(Object(n), !0).forEach(function(t) {
			Xz(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Jz(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Xz(e, t, n) {
	return (t = Zz(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Zz(e) {
	var t = Qz(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Qz(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function $z(e, t) {
	if (e == null) return {};
	var n, r, i = eB(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function eB(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function tB(e) {
	var t = B(), n = (0, P.useRef)(null), r = Ku(), i = e.type, a = $z(e, Wz), o = ig(r, "xAxis", i), s = (0, P.useMemo)(() => {
		if (o != null) return Yz(Yz({}, a), {}, { type: o });
	}, [a, o]);
	return (0, P.useLayoutEffect)(() => {
		s != null && (n.current === null ? t(WM(s)) : n.current !== s && t(GM({
			prev: n.current,
			next: s
		})), n.current = s);
	}, [s, t]), (0, P.useLayoutEffect)(() => () => {
		n.current &&= (t(KM(n.current)), null);
	}, [t]), null;
}
var nB = (e) => {
	var t = e.xAxisId, n = e.className, r = e.height, i = e.label, a = (0, P.useRef)(null), o = (0, P.useRef)(null), s = V(tu), c = ru(), l = B(), u = "xAxis", d = V((e) => Mw(e, u, t, c)), f = V((e) => yw(e, t)), p = V((e) => ww(e, t)), m = V((e) => jS(e, t));
	if ((0, P.useLayoutEffect)(() => {
		if (!(r !== "auto" || !f || Rk(i) || /*#__PURE__*/ (0, P.isValidElement)(i) || m == null)) {
			var e = a.current;
			if (e) {
				var n = e.getCalculatedHeight();
				Math.round(f.height) !== Math.round(n) && l(ZM({
					id: t,
					height: n
				}));
			}
		}
	}, [
		d,
		f,
		l,
		i,
		t,
		r,
		m
	]), f == null || p == null || m == null) return null;
	e.dangerouslySetInnerHTML, e.ticks, e.scale;
	var h = $z(e, Gz);
	m.id, m.scale;
	var g = $z(m, Kz);
	return /*#__PURE__*/ P.createElement(sI, qz({}, h, g, {
		ref: a,
		labelRef: o,
		x: p.x,
		y: p.y,
		width: f.width,
		height: f.height,
		className: N(`recharts-${u} ${u}`, n),
		viewBox: s,
		ticks: d,
		axisType: u,
		axisId: t
	}));
}, rB = {
	allowDataOverflow: AS.allowDataOverflow,
	allowDecimals: AS.allowDecimals,
	allowDuplicatedCategory: AS.allowDuplicatedCategory,
	angle: AS.angle,
	axisLine: QF.axisLine,
	height: AS.height,
	hide: !1,
	includeHidden: AS.includeHidden,
	interval: AS.interval,
	label: !1,
	minTickGap: AS.minTickGap,
	mirror: AS.mirror,
	orientation: AS.orientation,
	padding: AS.padding,
	reversed: AS.reversed,
	scale: AS.scale,
	tick: AS.tick,
	tickCount: AS.tickCount,
	tickLine: QF.tickLine,
	tickSize: QF.tickSize,
	type: AS.type,
	niceTicks: AS.niceTicks,
	xAxisId: 0
}, iB = /*#__PURE__*/ P.memo((e) => {
	var t = Zr(e, rB);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(tB, {
		allowDataOverflow: t.allowDataOverflow,
		allowDecimals: t.allowDecimals,
		allowDuplicatedCategory: t.allowDuplicatedCategory,
		angle: t.angle,
		dataKey: t.dataKey,
		domain: t.domain,
		height: t.height,
		hide: t.hide,
		id: t.xAxisId,
		includeHidden: t.includeHidden,
		interval: t.interval,
		minTickGap: t.minTickGap,
		mirror: t.mirror,
		name: t.name,
		orientation: t.orientation,
		padding: t.padding,
		reversed: t.reversed,
		scale: t.scale,
		tick: t.tick,
		tickCount: t.tickCount,
		tickFormatter: t.tickFormatter,
		ticks: t.ticks,
		type: t.type,
		unit: t.unit,
		niceTicks: t.niceTicks
	}), /*#__PURE__*/ P.createElement(nB, t));
}, Uz);
iB.displayName = "XAxis";
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/YAxis.js
var aB = ["type"], oB = [
	"dangerouslySetInnerHTML",
	"ticks",
	"scale"
], sB = ["id", "scale"];
function cB() {
	return cB = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, cB.apply(null, arguments);
}
function lB(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function uB(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? lB(Object(n), !0).forEach(function(t) {
			dB(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : lB(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function dB(e, t, n) {
	return (t = fB(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function fB(e) {
	var t = pB(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function pB(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function mB(e, t) {
	if (e == null) return {};
	var n, r, i = hB(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function hB(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function gB(e) {
	var t = B(), n = (0, P.useRef)(null), r = Ku(), i = e.type, a = mB(e, aB), o = ig(r, "yAxis", i), s = (0, P.useMemo)(() => {
		if (o != null) return uB(uB({}, a), {}, { type: o });
	}, [o, a]);
	return (0, P.useLayoutEffect)(() => {
		s != null && (n.current === null ? t(qM(s)) : n.current !== s && t(JM({
			prev: n.current,
			next: s
		})), n.current = s);
	}, [s, t]), (0, P.useLayoutEffect)(() => () => {
		n.current &&= (t(YM(n.current)), null);
	}, [t]), null;
}
function _B(e) {
	var t = e.yAxisId, n = e.className, r = e.width, i = e.label, a = (0, P.useRef)(null), o = (0, P.useRef)(null), s = V(tu), c = ru(), l = B(), u = "yAxis", d = V((e) => Ew(e, t)), f = V((e) => Tw(e, t)), p = V((e) => Mw(e, u, t, c)), m = V((e) => PS(e, t));
	if ((0, P.useLayoutEffect)(() => {
		if (!(r !== "auto" || !d || Rk(i) || /*#__PURE__*/ (0, P.isValidElement)(i) || m == null)) {
			var e = a.current;
			if (e) {
				var n = e.getCalculatedWidth();
				Math.round(d.width) !== Math.round(n) && l(XM({
					id: t,
					width: n
				}));
			}
		}
	}, [
		p,
		d,
		l,
		i,
		t,
		r,
		m
	]), d == null || f == null || m == null) return null;
	e.dangerouslySetInnerHTML, e.ticks, e.scale;
	var h = mB(e, oB);
	m.id, m.scale;
	var g = mB(m, sB);
	return /*#__PURE__*/ P.createElement(sI, cB({}, h, g, {
		ref: a,
		labelRef: o,
		x: f.x,
		y: f.y,
		tickTextProps: r === "auto" ? { width: void 0 } : { width: r },
		width: d.width,
		height: d.height,
		className: N(`recharts-${u} ${u}`, n),
		viewBox: s,
		ticks: p,
		axisType: u,
		axisId: t
	}));
}
var vB = {
	allowDataOverflow: NS.allowDataOverflow,
	allowDecimals: NS.allowDecimals,
	allowDuplicatedCategory: NS.allowDuplicatedCategory,
	angle: NS.angle,
	axisLine: QF.axisLine,
	hide: !1,
	includeHidden: NS.includeHidden,
	interval: NS.interval,
	label: !1,
	minTickGap: NS.minTickGap,
	mirror: NS.mirror,
	orientation: NS.orientation,
	padding: NS.padding,
	reversed: NS.reversed,
	scale: NS.scale,
	tick: NS.tick,
	tickCount: NS.tickCount,
	tickLine: QF.tickLine,
	tickSize: QF.tickSize,
	type: NS.type,
	niceTicks: NS.niceTicks,
	width: NS.width,
	yAxisId: 0
}, yB = /*#__PURE__*/ P.memo((e) => {
	var t = Zr(e, vB);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(gB, {
		interval: t.interval,
		id: t.yAxisId,
		scale: t.scale,
		type: t.type,
		domain: t.domain,
		allowDataOverflow: t.allowDataOverflow,
		dataKey: t.dataKey,
		allowDuplicatedCategory: t.allowDuplicatedCategory,
		allowDecimals: t.allowDecimals,
		tickCount: t.tickCount,
		padding: t.padding,
		includeHidden: t.includeHidden,
		reversed: t.reversed,
		ticks: t.ticks,
		width: t.width,
		orientation: t.orientation,
		mirror: t.mirror,
		hide: t.hide,
		unit: t.unit,
		name: t.name,
		angle: t.angle,
		minTickGap: t.minTickGap,
		tick: t.tick,
		tickFormatter: t.tickFormatter,
		niceTicks: t.niceTicks
	}), /*#__PURE__*/ P.createElement(_B, t));
}, Uz);
yB.displayName = "YAxis";
var bB = H([
	(e, t) => t,
	q,
	Sg,
	Ag,
	ZT,
	$T,
	ME,
	$l
], WE);
// ../../../peach/frontend/node_modules/recharts/es6/util/getRelativeCoordinate.js
function xB(e) {
	return "getBBox" in e.currentTarget && typeof e.currentTarget.getBBox == "function";
}
function SB(e) {
	var t = e.currentTarget.getBoundingClientRect(), n, r;
	if (xB(e)) {
		var i = e.currentTarget.getBBox();
		n = i.width > 0 ? t.width / i.width : 1, r = i.height > 0 ? t.height / i.height : 1;
	} else {
		var a = e.currentTarget;
		n = a.offsetWidth > 0 ? t.width / a.offsetWidth : 1, r = a.offsetHeight > 0 ? t.height / a.offsetHeight : 1;
	}
	var o = (e, i) => ({
		relativeX: Math.round((e - t.left) / n),
		relativeY: Math.round((i - t.top) / r)
	});
	return "touches" in e ? Array.from(e.touches).map((e) => o(e.clientX, e.clientY)) : o(e.clientX, e.clientY);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/mouseEventsMiddleware.js
var CB = Ks("mouseClick"), wB = $c();
wB.startListening({
	actionCreator: CB,
	effect: (e, t) => {
		var n = e.payload, r = bB(t.getState(), SB(n));
		r?.activeIndex != null && t.dispatch(nT({
			activeIndex: r.activeIndex,
			activeDataKey: void 0,
			activeCoordinate: r.activeCoordinate
		}));
	}
});
var TB = Ks("mouseMove"), EB = $c(), DB = null, OB = null, kB = null;
EB.startListening({
	actionCreator: TB,
	effect: (e, t) => {
		var n = e.payload, r = t.getState().eventSettings, i = r.throttleDelay, a = r.throttledEvents, o = a === "all" || a?.includes("mousemove");
		DB !== null && (cancelAnimationFrame(DB), DB = null), OB === null || typeof i == "number" && o || (clearTimeout(OB), OB = null), kB = SB(n);
		var s = () => {
			var e = t.getState(), n = Bw(e, e.tooltip.settings.shared);
			if (!kB) DB = null, OB = null;
			else {
				if (n === "axis") {
					var r = bB(e, kB);
					r?.activeIndex == null ? t.dispatch($w()) : t.dispatch(tT({
						activeIndex: r.activeIndex,
						activeDataKey: void 0,
						activeCoordinate: r.activeCoordinate
					}));
				}
				DB = null, OB = null;
			}
		};
		o ? i === "raf" ? DB = requestAnimationFrame(s) : typeof i == "number" && OB === null && (OB = setTimeout(s, i)) : s();
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/state/reduxDevtoolsJsonStringifyReplacer.js
function AB(e, t) {
	return t instanceof HTMLElement ? `HTMLElement <${t.tagName} class="${t.className}">` : t === window ? "global.window" : e === "children" && typeof t == "object" && t ? "<<CHILDREN>>" : t;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/rootPropsSlice.js
var jB = {
	accessibilityLayer: !0,
	barCategoryGap: "10%",
	barGap: 4,
	barSize: void 0,
	className: void 0,
	maxBarSize: void 0,
	stackOffset: "none",
	syncId: void 0,
	syncMethod: "index",
	baseValue: void 0,
	reverseStackOrder: !1
}, MB = pc({
	name: "rootProps",
	initialState: jB,
	reducers: { updateOptions: (e, t) => {
		e.accessibilityLayer = t.payload.accessibilityLayer, e.barCategoryGap = t.payload.barCategoryGap, e.barGap = t.payload.barGap ?? jB.barGap, e.barSize = t.payload.barSize, e.maxBarSize = t.payload.maxBarSize, e.stackOffset = t.payload.stackOffset, e.syncId = t.payload.syncId, e.syncMethod = t.payload.syncMethod, e.className = t.payload.className, e.baseValue = t.payload.baseValue, e.reverseStackOrder = t.payload.reverseStackOrder;
	} }
}), NB = MB.reducer, PB = MB.actions.updateOptions, FB = pc({
	name: "polarOptions",
	initialState: null,
	reducers: { updatePolarOptions: (e, t) => e === null ? t.payload : (e.startAngle = t.payload.startAngle, e.endAngle = t.payload.endAngle, e.cx = t.payload.cx, e.cy = t.payload.cy, e.innerRadius = t.payload.innerRadius, e.outerRadius = t.payload.outerRadius, e) }
}), IB = FB.actions.updatePolarOptions, LB = FB.reducer, RB = Ks("keyDown"), zB = Ks("focus"), BB = Ks("blur"), VB = $c(), HB = null, UB = null, WB = null;
VB.startListening({
	actionCreator: RB,
	effect: (e, t) => {
		WB = e.payload, HB !== null && (cancelAnimationFrame(HB), HB = null);
		var n = t.getState().eventSettings, r = n.throttleDelay, i = n.throttledEvents, a = i === "all" || i.includes("keydown");
		UB === null || typeof r == "number" && a || (clearTimeout(UB), UB = null);
		var o = () => {
			try {
				var e = t.getState();
				if (e.rootProps.accessibilityLayer === !1) return;
				var n = e.tooltip.keyboardInteraction, r = WB;
				if (r !== "ArrowRight" && r !== "ArrowLeft" && r !== "Enter") return;
				var i = _T(n, zT(e), dC(e), JT(e)), a = i == null ? -1 : Number(i), o = !Number.isFinite(a) || a < 0, s = $T(e), c = zT(e), l = Bw(e, e.tooltip.settings.shared);
				if (r === "Enter") {
					if (o) return;
					var u = LE(e, l, "hover", String(n.index));
					t.dispatch(iT({
						active: !n.active,
						activeIndex: n.index,
						activeCoordinate: u
					}));
					return;
				}
				var d = Iw(e) === "left-to-right" ? 1 : -1, f = r === "ArrowRight" ? 1 : -1, p;
				if (o) {
					var m = dC(e), h = JT(e), g = f * d, _ = (e) => ({
						active: !1,
						index: String(e),
						dataKey: void 0,
						graphicalItemId: void 0,
						coordinate: void 0
					});
					if (p = -1, g > 0) {
						for (var v = 0; v < c.length; v++) if (_T(_(v), c, m, h) != null) {
							p = v;
							break;
						}
					} else for (var y = c.length - 1; y >= 0; y--) if (_T(_(y), c, m, h) != null) {
						p = y;
						break;
					}
					if (p < 0) return;
				} else {
					p = a + f * d;
					var b = s?.length || c.length;
					if (b === 0 || p >= b || p < 0) return;
				}
				var x = LE(e, l, "hover", String(p));
				t.dispatch(iT({
					active: !0,
					activeIndex: p.toString(),
					activeCoordinate: x
				}));
			} finally {
				HB = null, UB = null;
			}
		};
		a ? r === "raf" ? HB = requestAnimationFrame(o) : typeof r == "number" && UB === null && (o(), WB = null, UB = setTimeout(() => {
			WB ? o() : (UB = null, HB = null);
		}, r)) : o();
	}
}), VB.startListening({
	actionCreator: zB,
	effect: (e, t) => {
		var n = t.getState();
		if (n.rootProps.accessibilityLayer !== !1) {
			var r = n.tooltip.keyboardInteraction;
			if (!r.active && r.index == null) {
				var i = "0", a = LE(n, Bw(n, n.tooltip.settings.shared), "hover", String(i));
				t.dispatch(iT({
					active: !0,
					activeIndex: i,
					activeCoordinate: a
				}));
			}
		}
	}
}), VB.startListening({
	actionCreator: BB,
	effect: (e, t) => {
		var n = t.getState();
		if (n.rootProps.accessibilityLayer !== !1) {
			var r = n.tooltip.keyboardInteraction;
			r.active && t.dispatch(iT({
				active: !1,
				activeIndex: r.index,
				activeCoordinate: r.coordinate
			}));
		}
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/util/createEventProxy.js
function GB(e) {
	e.persist();
	var t = e.currentTarget;
	return new Proxy(e, { get: (e, n) => {
		if (n === "currentTarget") return t;
		var r = Reflect.get(e, n);
		return typeof r == "function" ? r.bind(e) : r;
	} });
}
// ../../../peach/frontend/node_modules/recharts/es6/state/externalEventsMiddleware.js
var KB = Ks("externalEvent"), qB = $c(), JB = /* @__PURE__ */ new Map(), YB = /* @__PURE__ */ new Map(), XB = /* @__PURE__ */ new Map();
qB.startListening({
	actionCreator: KB,
	effect: (e, t) => {
		var n = e.payload, r = n.handler, i = n.reactEvent;
		if (r != null) {
			var a = i.type, o = GB(i);
			XB.set(a, {
				handler: r,
				reactEvent: o
			});
			var s = JB.get(a);
			s !== void 0 && (cancelAnimationFrame(s), JB.delete(a));
			var c = t.getState().eventSettings, l = c.throttleDelay, u = c.throttledEvents, d = u === "all" || u?.includes(a), f = YB.get(a);
			f === void 0 || typeof l == "number" && d || (clearTimeout(f), YB.delete(a));
			var p = () => {
				var e = XB.get(a);
				try {
					if (!e) return;
					var n = e.handler, r = e.reactEvent, i = t.getState(), o = {
						activeCoordinate: lE(i),
						activeDataKey: oE(i),
						activeIndex: iE(i),
						activeLabel: aE(i),
						activeTooltipIndex: iE(i),
						isTooltipActive: uE(i)
					};
					n && n(o, r);
				} finally {
					JB.delete(a), YB.delete(a), XB.delete(a);
				}
			};
			if (!d) p();
			else if (l === "raf") {
				var m = requestAnimationFrame(p);
				JB.set(a, m);
			} else if (typeof l == "number") {
				if (!YB.has(a)) {
					p();
					var h = setTimeout(p, l);
					YB.set(a, h);
				}
			} else p();
		}
	}
});
var ZB = H([
	H([xT], (e) => e.tooltipItemPayloads),
	(e, t) => t,
	(e, t, n) => n
], (e, t, n) => {
	if (t != null) {
		var r = e.find((e) => e.settings.graphicalItemId === n);
		if (r != null) {
			var i = r.getPosition;
			if (i != null) return i(t);
		}
	}
}), QB = Ks("touchMove"), $B = $c(), eV = null, tV = null, nV = null, rV = null;
$B.startListening({
	actionCreator: QB,
	effect: (e, t) => {
		var n = e.payload;
		if (n.touches != null && n.touches.length !== 0) {
			rV = GB(n);
			var r = t.getState().eventSettings, i = r.throttleDelay, a = r.throttledEvents, o = a === "all" || a.includes("touchmove");
			eV !== null && (cancelAnimationFrame(eV), eV = null), tV === null || typeof i == "number" && o || (clearTimeout(tV), tV = null), nV = Array.from(n.touches).map((e) => SB({
				clientX: e.clientX,
				clientY: e.clientY,
				currentTarget: n.currentTarget
			}));
			var s = () => {
				if (rV != null) {
					var e = t.getState(), n = Bw(e, e.tooltip.settings.shared);
					if (n === "axis") {
						var r = nV?.[0];
						if (r == null) {
							eV = null, tV = null;
							return;
						}
						var i = bB(e, r);
						i?.activeIndex != null && t.dispatch(tT({
							activeIndex: i.activeIndex,
							activeDataKey: void 0,
							activeCoordinate: i.activeCoordinate
						}));
					} else if (n === "item") {
						var a = rV.touches[0];
						if (document.elementFromPoint == null || a == null) return;
						var o = document.elementFromPoint(a.clientX, a.clientY);
						if (!o || !o.getAttribute) return;
						var s = o.getAttribute(Hl), c = o.getAttribute("data-recharts-item-id") ?? void 0, l = FT(e).find((e) => e.id === c);
						if (s == null || l == null || c == null) return;
						var u = l.dataKey, d = ZB(e, s, c);
						t.dispatch(Zw({
							activeDataKey: u,
							activeIndex: s,
							activeCoordinate: d,
							activeGraphicalItemId: c
						}));
					}
					eV = null, tV = null;
				}
			};
			o ? i === "raf" ? eV = requestAnimationFrame(s) : typeof i == "number" && tV === null && (s(), rV = null, tV = setTimeout(() => {
				rV ? s() : (tV = null, eV = null);
			}, i)) : s();
		}
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/state/eventSettingsSlice.js
var iV = {
	throttleDelay: "raf",
	throttledEvents: [
		"mousemove",
		"touchmove",
		"pointermove",
		"scroll",
		"wheel"
	]
}, aV = pc({
	name: "eventSettings",
	initialState: iV,
	reducers: { setEventSettings: (e, t) => {
		t.payload.throttleDelay != null && (e.throttleDelay = t.payload.throttleDelay), t.payload.throttledEvents != null && (e.throttledEvents = U(t.payload.throttledEvents));
	} }
}), oV = aV.actions.setEventSettings, sV = aV.reducer, cV = go({
	brush: OP,
	cartesianAxis: QM,
	chartData: ND,
	errorBars: KI,
	eventSettings: sV,
	graphicalItems: SM,
	layout: sl,
	legend: id,
	options: ED,
	polarAxis: BA,
	polarOptions: LB,
	referenceElements: LP,
	renderedTicks: IF,
	rootProps: NB,
	tooltip: aT,
	zIndex: sD
}), lV = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Chart";
	return rc({
		reducer: cV,
		preloadedState: e,
		middleware: (e) => e({
			serializableCheck: !1,
			immutableCheck: ![
				"commonjs",
				"es6",
				"production"
			].includes("es6")
		}).concat([
			wB.middleware,
			EB.middleware,
			VB.middleware,
			qB.middleware,
			$B.middleware
		]),
		enhancers: (e) => {
			var t = e;
			return typeof e == "function" && (t = e()), t.concat(tc({ type: "raf" }));
		},
		devTools: Cf.devToolsEnabled && {
			serialize: { replacer: AB },
			name: `recharts-${t}`
		}
	});
};
// ../../../peach/frontend/node_modules/recharts/es6/state/RechartsStoreProvider.js
function uV(e) {
	var t = e.preloadedState, n = e.children, r = e.reduxStoreName, i = ru(), a = (0, P.useRef)(null);
	if (i) return n;
	a.current ??= lV(t, r);
	var o = ba;
	return /*#__PURE__*/ P.createElement(bd, {
		context: o,
		store: a.current
	}, n);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/ReportMainChartProps.js
function dV(e) {
	var t = e.layout, n = e.margin, r = B(), i = ru();
	return (0, P.useEffect)(() => {
		i || (r(il(t)), r(rl(n)));
	}, [
		r,
		i,
		t,
		n
	]), null;
}
var fV = /*#__PURE__*/ (0, P.memo)(dV, Cd);
// ../../../peach/frontend/node_modules/recharts/es6/state/ReportChartProps.js
function pV(e) {
	var t = B();
	return (0, P.useEffect)(() => {
		t(PB(e));
	}, [t, e]), null;
}
var mV = /*#__PURE__*/ (0, P.memo)((e) => {
	var t = B();
	return (0, P.useEffect)(() => {
		t(oV(e));
	}, [t, e]), null;
}, Cd);
// ../../../peach/frontend/node_modules/recharts/es6/zIndex/ZIndexPortal.js
function hV(e) {
	var t = e.zIndex, n = e.isPanorama, r = (0, P.useRef)(null), i = B();
	return (0, P.useLayoutEffect)(() => (r.current && i(aD({
		zIndex: t,
		element: r.current,
		isPanorama: n
	})), () => {
		i(oD({
			zIndex: t,
			isPanorama: n
		}));
	}), [
		i,
		t,
		n
	]), /*#__PURE__*/ P.createElement("g", {
		tabIndex: -1,
		ref: r,
		className: `recharts-zIndex-layer_${t}`
	});
}
function gV(e) {
	var t = e.children, n = e.isPanorama, r = V(KE);
	if (!r || r.length === 0) return t;
	var i = r.filter((e) => e < 0), a = r.filter((e) => e > 0);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, i.map((e) => /*#__PURE__*/ P.createElement(hV, {
		key: e,
		zIndex: e,
		isPanorama: n
	})), t, a.map((e) => /*#__PURE__*/ P.createElement(hV, {
		key: e,
		zIndex: e,
		isPanorama: n
	})));
}
// ../../../peach/frontend/node_modules/recharts/es6/container/RootSurface.js
var _V = ["children"];
function vV(e, t) {
	if (e == null) return {};
	var n, r, i = yV(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function yV(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function bV() {
	return bV = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, bV.apply(null, arguments);
}
var xV = {
	width: "100%",
	height: "100%",
	display: "block"
}, SV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = Hu(), r = Uu(), i = Gf();
	if (!ll(n) || !ll(r)) return null;
	var a = e.children, o = e.otherAttributes, s = e.title, c = e.desc, l, u;
	return o != null && (l = typeof o.tabIndex == "number" ? o.tabIndex : i ? 0 : void 0, u = typeof o.role == "string" ? o.role : i ? "application" : void 0), /*#__PURE__*/ P.createElement(_t, bV({}, o, {
		title: s,
		desc: c,
		role: u,
		tabIndex: l,
		width: n,
		height: r,
		style: xV,
		ref: t
	}), a);
}), CV = (e) => {
	var t = e.children, n = V(au);
	if (!n) return null;
	var r = n.width, i = n.height, a = n.y, o = n.x;
	return /*#__PURE__*/ P.createElement(_t, {
		width: r,
		height: i,
		x: o,
		y: a
	}, t);
}, wV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.children, r = vV(e, _V);
	return ru() ? /*#__PURE__*/ P.createElement(CV, null, /*#__PURE__*/ P.createElement(gV, { isPanorama: !0 }, n)) : /*#__PURE__*/ P.createElement(SV, bV({ ref: t }, r), /*#__PURE__*/ P.createElement(gV, { isPanorama: !1 }, n));
});
// ../../../peach/frontend/node_modules/recharts/es6/util/useReportScale.js
function TV(e, t) {
	return AV(e) || kV(e, t) || DV(e, t) || EV();
}
function EV() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function DV(e, t) {
	if (e) {
		if (typeof e == "string") return OV(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? OV(e, t) : void 0;
	}
}
function OV(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function kV(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function AV(e) {
	if (Array.isArray(e)) return e;
}
function jV() {
	var e = B(), t = TV((0, P.useState)(null), 2), n = t[0], r = t[1], i = V(Rl);
	return (0, P.useEffect)(() => {
		if (n != null) {
			var t = n.getBoundingClientRect().width / n.offsetWidth;
			G(t) && t !== i && e(ol(t));
		}
	}, [
		n,
		e,
		i
	]), r;
}
// ../../../peach/frontend/node_modules/recharts/es6/chart/RechartsWrapper.js
function MV(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function NV(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? MV(Object(n), !0).forEach(function(t) {
			PV(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : MV(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function PV(e, t, n) {
	return (t = FV(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function FV(e) {
	var t = IV(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function IV(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function LV() {
	return LV = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, LV.apply(null, arguments);
}
function RV(e, t) {
	return UV(e) || HV(e, t) || BV(e, t) || zV();
}
function zV() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function BV(e, t) {
	if (e) {
		if (typeof e == "string") return VV(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? VV(e, t) : void 0;
	}
}
function VV(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function HV(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function UV(e) {
	if (Array.isArray(e)) return e;
}
var WV = () => (WD(), null);
function GV(e) {
	if (typeof e == "number") return e;
	if (typeof e == "string") {
		var t = parseFloat(e);
		if (!Number.isNaN(t)) return t;
	}
	return 0;
}
var KV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = (0, P.useRef)(null), r = RV((0, P.useState)({
		containerWidth: GV(e.style?.width),
		containerHeight: GV(e.style?.height)
	}), 2), i = r[0], a = r[1], o = (0, P.useCallback)((e, t) => {
		a((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []), s = (0, P.useCallback)((e) => {
		if (typeof t == "function" && t(e), n.current != null && (n.current.disconnect(), n.current = null), e != null && typeof ResizeObserver < "u") {
			var r = e.getBoundingClientRect(), i = r.width, a = r.height;
			o(i, a);
			var s = new ResizeObserver((e) => {
				var t = e[0];
				if (t != null) {
					var n = t.contentRect, r = n.width, i = n.height;
					o(r, i);
				}
			});
			s.observe(e), n.current = s;
		}
	}, [t, o]);
	return (0, P.useEffect)(() => () => {
		n.current?.disconnect();
	}, [o]), /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Xu, {
		width: i.containerWidth,
		height: i.containerHeight
	}), /*#__PURE__*/ P.createElement("div", LV({ ref: s }, e)));
}), qV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.width, r = e.height, i = RV((0, P.useState)({
		containerWidth: GV(n),
		containerHeight: GV(r)
	}), 2), a = i[0], o = i[1], s = (0, P.useCallback)((e, t) => {
		o((n) => {
			var r = Math.round(e), i = Math.round(t);
			return n.containerWidth === r && n.containerHeight === i ? n : {
				containerWidth: r,
				containerHeight: i
			};
		});
	}, []), c = (0, P.useCallback)((e) => {
		if (typeof t == "function" && t(e), e != null) {
			var n = e.getBoundingClientRect(), r = n.width, i = n.height;
			s(r, i);
		}
	}, [t, s]);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Xu, {
		width: a.containerWidth,
		height: a.containerHeight
	}), /*#__PURE__*/ P.createElement("div", LV({ ref: c }, e)));
}), JV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.width, r = e.height;
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Xu, {
		width: n,
		height: r
	}), /*#__PURE__*/ P.createElement("div", LV({ ref: t }, e)));
}), YV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.width, r = e.height;
	return typeof n == "string" || typeof r == "string" ? /*#__PURE__*/ P.createElement(qV, LV({}, e, { ref: t })) : typeof n == "number" && typeof r == "number" ? /*#__PURE__*/ P.createElement(JV, LV({}, e, {
		width: n,
		height: r,
		ref: t
	})) : /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Xu, {
		width: n,
		height: r
	}), /*#__PURE__*/ P.createElement("div", LV({ ref: t }, e)));
});
function XV(e) {
	return e ? KV : YV;
}
var ZV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.children, r = e.className, i = e.height, a = e.onClick, o = e.onContextMenu, s = e.onDoubleClick, c = e.onMouseDown, l = e.onMouseEnter, u = e.onMouseLeave, d = e.onMouseMove, f = e.onMouseUp, p = e.onTouchEnd, m = e.onTouchMove, h = e.onTouchStart, g = e.style, _ = e.width, v = e.responsive, y = e.dispatchTouchEvents, b = y === void 0 || y, x = (0, P.useRef)(null), S = B(), C = RV((0, P.useState)(null), 2), w = C[0], T = C[1], E = RV((0, P.useState)(null), 2), D = E[0], O = E[1], k = jV(), A = Iu(), j = A?.width > 0 ? A.width : _, M = A?.height > 0 ? A.height : i, ee = (0, P.useCallback)((e) => {
		k(e), typeof t == "function" && t(e), T(e), O(e), e != null && (x.current = e);
	}, [
		k,
		t,
		T,
		O
	]), te = (0, P.useCallback)((e) => {
		S(CB(e)), S(KB({
			handler: a,
			reactEvent: e
		}));
	}, [S, a]), ne = (0, P.useCallback)((e) => {
		S(TB(e)), S(KB({
			handler: l,
			reactEvent: e
		}));
	}, [S, l]), re = (0, P.useCallback)((e) => {
		S($w()), S(KB({
			handler: u,
			reactEvent: e
		}));
	}, [S, u]), ie = (0, P.useCallback)((e) => {
		S(TB(e)), S(KB({
			handler: d,
			reactEvent: e
		}));
	}, [S, d]), ae = (0, P.useCallback)(() => {
		S(zB());
	}, [S]), oe = (0, P.useCallback)(() => {
		S(BB());
	}, [S]), se = (0, P.useCallback)((e) => {
		S(RB(e.key));
	}, [S]), ce = (0, P.useCallback)((e) => {
		S(KB({
			handler: o,
			reactEvent: e
		}));
	}, [S, o]), le = (0, P.useCallback)((e) => {
		S(KB({
			handler: s,
			reactEvent: e
		}));
	}, [S, s]), ue = (0, P.useCallback)((e) => {
		S(KB({
			handler: c,
			reactEvent: e
		}));
	}, [S, c]), de = (0, P.useCallback)((e) => {
		S(KB({
			handler: f,
			reactEvent: e
		}));
	}, [S, f]), fe = (0, P.useCallback)((e) => {
		S(KB({
			handler: h,
			reactEvent: e
		}));
	}, [S, h]), pe = (0, P.useCallback)((e) => {
		b && S(QB(e)), S(KB({
			handler: m,
			reactEvent: e
		}));
	}, [
		S,
		b,
		m
	]), me = (0, P.useCallback)((e) => {
		S(KB({
			handler: p,
			reactEvent: e
		}));
	}, [S, p]), he = XV(v);
	return /*#__PURE__*/ P.createElement(vD.Provider, { value: w }, /*#__PURE__*/ P.createElement(nn.Provider, { value: D }, /*#__PURE__*/ P.createElement(he, {
		width: j ?? g?.width,
		height: M ?? g?.height,
		className: N("recharts-wrapper", r),
		style: NV({
			position: "relative",
			cursor: "default",
			width: j,
			height: M
		}, g),
		onClick: te,
		onContextMenu: ce,
		onDoubleClick: le,
		onFocus: ae,
		onBlur: oe,
		onKeyDown: se,
		onMouseDown: ue,
		onMouseEnter: ne,
		onMouseLeave: re,
		onMouseMove: ie,
		onMouseUp: de,
		onTouchEnd: me,
		onTouchMove: pe,
		onTouchStart: fe,
		ref: ee
	}, /*#__PURE__*/ P.createElement(WV, null), n)));
}), QV = [
	"width",
	"height",
	"responsive",
	"children",
	"className",
	"style",
	"compact",
	"title",
	"desc"
];
function $V(e, t) {
	if (e == null) return {};
	var n, r, i = eH(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function eH(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var tH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.width, r = e.height, i = e.responsive, a = e.children, o = e.className, s = e.style, c = e.compact, l = e.title, u = e.desc, d = lt($V(e, QV));
	return c ? /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Xu, {
		width: n,
		height: r
	}), /*#__PURE__*/ P.createElement(wV, {
		otherAttributes: d,
		title: l,
		desc: u
	}, a)) : /*#__PURE__*/ P.createElement(ZV, {
		className: o,
		style: s,
		width: n,
		height: r,
		responsive: i ?? !1,
		onClick: e.onClick,
		onMouseLeave: e.onMouseLeave,
		onMouseEnter: e.onMouseEnter,
		onMouseMove: e.onMouseMove,
		onMouseDown: e.onMouseDown,
		onMouseUp: e.onMouseUp,
		onContextMenu: e.onContextMenu,
		onDoubleClick: e.onDoubleClick,
		onTouchStart: e.onTouchStart,
		onTouchMove: e.onTouchMove,
		onTouchEnd: e.onTouchEnd
	}, /*#__PURE__*/ P.createElement(wV, {
		otherAttributes: d,
		title: l,
		desc: u,
		ref: t
	}, /*#__PURE__*/ P.createElement(GP, null, a)));
});
// ../../../peach/frontend/node_modules/recharts/es6/chart/CartesianChart.js
function nH() {
	return nH = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, nH.apply(null, arguments);
}
function rH(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function iH(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? rH(Object(n), !0).forEach(function(t) {
			aH(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : rH(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function aH(e, t, n) {
	return (t = oH(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function oH(e) {
	var t = sH(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function sH(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var cH = iH({
	accessibilityLayer: !0,
	barCategoryGap: "10%",
	barGap: 4,
	layout: "horizontal",
	margin: {
		top: 5,
		right: 5,
		bottom: 5,
		left: 5
	},
	responsive: !1,
	reverseStackOrder: !1,
	stackOffset: "none",
	syncMethod: "index"
}, iV), lH = /*#__PURE__*/ (0, P.forwardRef)(function(e, t) {
	var n = Zr(e.categoricalChartProps, cH), r = e.chartName, i = e.defaultTooltipEventType, a = e.validateTooltipEventTypes, o = e.tooltipPayloadSearcher, s = e.categoricalChartProps, c = {
		chartName: r,
		defaultTooltipEventType: i,
		validateTooltipEventTypes: a,
		tooltipPayloadSearcher: o,
		eventEmitter: void 0
	};
	return /*#__PURE__*/ P.createElement(uV, {
		preloadedState: { options: c },
		reduxStoreName: s.id ?? r
	}, /*#__PURE__*/ P.createElement(TP, { chartData: s.data }), /*#__PURE__*/ P.createElement(fV, {
		layout: n.layout,
		margin: n.margin
	}), /*#__PURE__*/ P.createElement(mV, {
		throttleDelay: n.throttleDelay,
		throttledEvents: n.throttledEvents
	}), /*#__PURE__*/ P.createElement(pV, {
		baseValue: n.baseValue,
		accessibilityLayer: n.accessibilityLayer,
		barCategoryGap: n.barCategoryGap,
		maxBarSize: n.maxBarSize,
		stackOffset: n.stackOffset,
		barGap: n.barGap,
		barSize: n.barSize,
		syncId: n.syncId,
		syncMethod: n.syncMethod,
		className: n.className,
		reverseStackOrder: n.reverseStackOrder
	}), /*#__PURE__*/ P.createElement(tH, nH({}, n, { ref: t })));
}), uH = ["axis"], dH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => /*#__PURE__*/ P.createElement(lH, {
	chartName: "LineChart",
	defaultTooltipEventType: "axis",
	validateTooltipEventTypes: uH,
	tooltipPayloadSearcher: wD,
	categoricalChartProps: e,
	ref: t
})), fH = ["axis", "item"], pH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => /*#__PURE__*/ P.createElement(lH, {
	chartName: "BarChart",
	defaultTooltipEventType: "axis",
	validateTooltipEventTypes: fH,
	tooltipPayloadSearcher: wD,
	categoricalChartProps: e,
	ref: t
}));
// ../../../peach/frontend/node_modules/recharts/es6/state/ReportPolarOptions.js
function mH(e) {
	var t = B();
	return (0, P.useEffect)(() => {
		t(IB(e));
	}, [t, e]), null;
}
// ../../../peach/frontend/node_modules/recharts/es6/chart/PolarChart.js
var hH = ["layout"];
function gH() {
	return gH = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, gH.apply(null, arguments);
}
function _H(e, t) {
	if (e == null) return {};
	var n, r, i = vH(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function vH(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function yH(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function bH(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? yH(Object(n), !0).forEach(function(t) {
			xH(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yH(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function xH(e, t, n) {
	return (t = SH(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function SH(e) {
	var t = CH(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function CH(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var wH = bH({
	accessibilityLayer: !0,
	stackOffset: "none",
	barCategoryGap: "10%",
	barGap: 4,
	margin: {
		top: 5,
		right: 5,
		bottom: 5,
		left: 5
	},
	reverseStackOrder: !1,
	syncMethod: "index",
	layout: "radial",
	responsive: !1,
	cx: "50%",
	cy: "50%",
	innerRadius: 0,
	outerRadius: "80%"
}, iV), TH = /*#__PURE__*/ (0, P.forwardRef)(function(e, t) {
	var n = Zr(e.categoricalChartProps, wH), r = n.layout, i = _H(n, hH), a = e.chartName, o = {
		chartName: a,
		defaultTooltipEventType: e.defaultTooltipEventType,
		validateTooltipEventTypes: e.validateTooltipEventTypes,
		tooltipPayloadSearcher: e.tooltipPayloadSearcher,
		eventEmitter: void 0
	};
	return /*#__PURE__*/ P.createElement(uV, {
		preloadedState: { options: o },
		reduxStoreName: n.id ?? a
	}, /*#__PURE__*/ P.createElement(TP, { chartData: n.data }), /*#__PURE__*/ P.createElement(fV, {
		layout: r,
		margin: n.margin
	}), /*#__PURE__*/ P.createElement(mV, {
		throttleDelay: n.throttleDelay,
		throttledEvents: n.throttledEvents
	}), /*#__PURE__*/ P.createElement(pV, {
		baseValue: void 0,
		accessibilityLayer: n.accessibilityLayer,
		barCategoryGap: n.barCategoryGap,
		maxBarSize: n.maxBarSize,
		stackOffset: n.stackOffset,
		barGap: n.barGap,
		barSize: n.barSize,
		syncId: n.syncId,
		syncMethod: n.syncMethod,
		className: n.className,
		reverseStackOrder: n.reverseStackOrder
	}), /*#__PURE__*/ P.createElement(mH, {
		cx: n.cx,
		cy: n.cy,
		startAngle: n.startAngle,
		endAngle: n.endAngle,
		innerRadius: n.innerRadius,
		outerRadius: n.outerRadius
	}), /*#__PURE__*/ P.createElement(tH, gH({}, i, { ref: t })));
}), EH = ["axis"], DH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => /*#__PURE__*/ P.createElement(lH, {
	chartName: "AreaChart",
	defaultTooltipEventType: "axis",
	validateTooltipEventTypes: EH,
	tooltipPayloadSearcher: wD,
	categoricalChartProps: e,
	ref: t
}));
// ../../../peach/frontend/node_modules/recharts/es6/chart/RadialBarChart.js
function OH(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function kH(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? OH(Object(n), !0).forEach(function(t) {
			AH(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : OH(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function AH(e, t, n) {
	return (t = jH(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function jH(e) {
	var t = MH(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function MH(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var NH = ["axis", "item"], PH = kH(kH({}, wH), {}, {
	layout: "radial",
	startAngle: 0,
	endAngle: 360
}), FH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = Zr(e, PH);
	return /*#__PURE__*/ P.createElement(TH, {
		chartName: "RadialBarChart",
		defaultTooltipEventType: "axis",
		validateTooltipEventTypes: NH,
		tooltipPayloadSearcher: wD,
		categoricalChartProps: n,
		ref: t
	});
});
// src/react/charts/cn.ts
function IH(...e) {
	return te(N(e));
}
// src/react/evilcharts/registry/ui/recharts-chart.tsx
var $ = Te(), LH = {
	light: "",
	dark: ".dark"
}, RH = Object.keys(LH);
function zH(e) {
	for (let [t, n] of Object.entries(e)) if (n.colors && !RH.some((e) => n.colors?.[e] !== void 0)) throw Error(`[EvilCharts] Invalid chart config for "${t}": colors object must have at least one theme key (${RH.join(", ")}). Received empty object or invalid keys.`);
}
var BH = P.createContext(null);
function VH() {
	let e = P.useContext(BH);
	if (!e) throw Error("useChart must be used within a <ChartContainer />");
	return e;
}
function HH({ id: e, config: t, initialDimension: n = {
	width: 320,
	height: 200
}, className: r, children: i, footer: a, ...o }) {
	let s = P.useId(), c = `chart-${e ?? s.replace(/:/g, "")}`;
	return zH(t), /* @__PURE__ */ (0, $.jsx)(BH.Provider, {
		value: { config: t },
		children: /* @__PURE__ */ (0, $.jsxs)("div", {
			"data-slot": "chart",
			"data-chart": c,
			className: IH("min-h-0 w-full flex-1", "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border relative flex flex-col justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden", !a && "aspect-video", r),
			...o,
			children: [
				/* @__PURE__ */ (0, $.jsx)(GH, {
					id: c,
					config: t
				}),
				/* @__PURE__ */ (0, $.jsx)(Ru, {
					className: "min-h-0 w-full flex-1",
					initialDimension: n,
					children: i
				}),
				a
			]
		})
	});
}
function UH({ isLoading: e }) {
	return e ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center",
		children: /* @__PURE__ */ (0, $.jsxs)("div", {
			className: "text-primary bg-background flex items-center justify-center gap-2 rounded-md border px-2 py-0.5 text-sm",
			children: [/* @__PURE__ */ (0, $.jsx)("div", { className: "border-border border-t-primary h-3 w-3 animate-spin rounded-full border" }), /* @__PURE__ */ (0, $.jsx)("span", { children: "Loading" })]
		})
	}) : null;
}
function WH(e, t) {
	let n = e.length;
	if (n >= t) return e.slice(0, t);
	let r = [], i = Math.floor(t / n), a = t % n;
	for (let t = 0; t < n; t++) {
		let o = i + +(t >= n - a);
		for (let n = 0; n < o; n++) r.push(e[t]);
	}
	return r;
}
var GH = ({ id: e, config: t }) => {
	let n = Object.entries(t).filter(([, e]) => e.colors);
	if (!n.length) return null;
	let r = (e) => n.flatMap(([t, n]) => {
		let r = n.colors?.[e];
		return !r || !Array.isArray(r) || r.length === 0 ? [] : WH(r, qH(n)).map((e, n) => `  --color-${t}-${n}: ${e};`);
	}).filter(Boolean).join("\n"), i = Object.entries(LH).map(([t, n]) => `${n} [data-chart=${e}] {\n${r(t)}\n}`).join("\n");
	return /* @__PURE__ */ (0, $.jsx)("style", { dangerouslySetInnerHTML: { __html: i } });
};
function KH(e, t, n) {
	if (typeof t != "object" || !t) return;
	let r = "payload" in t && typeof t.payload == "object" && t.payload !== null ? t.payload : void 0, i = n;
	return n in t && typeof t[n] == "string" ? i = t[n] : r && n in r && typeof r[n] == "string" && (i = r[n]), i in e ? e[i] : e[n];
}
function qH(e) {
	if (!e.colors) return 1;
	let t = RH.map((t) => e.colors?.[t]?.length ?? 0);
	return Math.max(...t, 1);
}
var JH = (e = 10, t = 0, n = 70) => {
	let r = n - t;
	return Array.from({ length: e }, () => ({ loading: Math.floor(Math.random() * r) + t }));
}, YH = {
	sm: "rounded-sm",
	md: "rounded-md",
	lg: "rounded-lg",
	xl: "rounded-xl"
}, XH = {
	default: "bg-background",
	"frosted-glass": "bg-background/70 backdrop-blur-sm"
};
function ZH({ active: e, payload: t, className: n, indicator: r = "dot", hideLabel: i = !1, hideIndicator: a = !1, label: o, labelFormatter: s, labelClassName: c, formatter: l, nameKey: u, labelKey: d, selected: f, roundness: p = "lg", variant: m = "default" }) {
	let { config: h } = VH(), g = P.useMemo(() => {
		if (i || !t?.length) return null;
		let [e] = t, n = `${d ?? e?.dataKey ?? e?.name ?? "value"}`, r = KH(h, e, n), a = !d && typeof o == "string" ? h[o]?.label ?? o : r?.label;
		return s ? /* @__PURE__ */ (0, $.jsx)("div", {
			className: IH("font-medium", c),
			children: s(a, t)
		}) : a ? /* @__PURE__ */ (0, $.jsx)("div", {
			className: IH("font-medium", c),
			children: a
		}) : null;
	}, [
		o,
		s,
		t,
		i,
		c,
		h,
		d
	]);
	if (!e || !t?.length) return /* @__PURE__ */ (0, $.jsx)("span", { className: "p-4" });
	let _ = t.length === 1 && r !== "dot";
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: IH("border-border/50 grid min-w-32 items-start gap-1.5 border px-2.5 py-1.5 text-xs shadow-xl", YH[p], XH[m], n),
		children: [_ ? null : g, /* @__PURE__ */ (0, $.jsx)("div", {
			className: "grid gap-1.5",
			children: t.filter((e) => e.type !== "none").map((e, t) => {
				let n = `${(u && e.payload ? e.payload[u] : void 0) ?? e.name ?? e.dataKey ?? "value"}`, i = KH(h, e, n), o = i ? qH(i) : 1;
				return /* @__PURE__ */ (0, $.jsx)("div", {
					className: IH("[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5", r === "dot" && "items-center", f != null && f !== e.dataKey && "opacity-30"),
					children: l && e?.value !== void 0 && e.name ? l(e.value, e.name, e, t, e.payload) : /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [i?.icon ? /* @__PURE__ */ (0, $.jsx)(i.icon, {}) : !a && /* @__PURE__ */ (0, $.jsx)("div", {
						className: IH("shrink-0 rounded-[2px]", {
							"h-2.5 w-2.5": r === "dot",
							"w-1": r === "line",
							"w-0 border-[1.5px] border-dashed bg-transparent!": r === "dashed",
							"my-0.5": _ && r === "dashed"
						}),
						style: QH(n, o)
					}), /* @__PURE__ */ (0, $.jsxs)("div", {
						className: IH("flex flex-1 justify-between gap-4 leading-none", _ ? "items-end" : "items-center"),
						children: [/* @__PURE__ */ (0, $.jsxs)("div", {
							className: "grid gap-1.5",
							children: [_ ? g : null, /* @__PURE__ */ (0, $.jsx)("span", {
								className: "text-muted-foreground",
								children: i?.label ?? e.name
							})]
						}), e.value != null && /* @__PURE__ */ (0, $.jsx)("span", {
							className: "text-foreground font-mono font-medium tabular-nums",
							children: typeof e.value == "number" ? e.value.toLocaleString() : String(e.value)
						})]
					})] })
				}, t);
			})
		})]
	});
}
function QH(e, t) {
	return t <= 1 ? { background: `var(--color-${e}-0)` } : { background: `linear-gradient(to right, ${Array.from({ length: t }, (n, r) => `var(--color-${e}-${r}) ${r / (t - 1) * 100}%`).join(", ")})` };
}
var $H = ({ animationDuration: e = 200, ...t }) => /* @__PURE__ */ (0, $.jsx)(sO, {
	animationDuration: e,
	...t
});
// src/react/evilcharts/registry/ui/recharts-legend.tsx
function eU({ className: e, hideIcon: t = !1, nameKey: n, payload: r, verticalAlign: i, align: a = "right", selected: o, onSelectChange: s, isClickable: c, variant: l = "rounded-square" }) {
	let { config: u } = VH();
	return r?.length ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: IH("flex items-center gap-4 select-none", a === "left" && "justify-start", a === "center" && "justify-center", a === "right" && "justify-end", i === "top" ? "pb-4" : "pt-4", e),
		children: r.filter((e) => e.type !== "none").map((e) => {
			let r = `${(n && e.payload ? e.payload[n] : void 0) ?? e.value ?? e.dataKey ?? "value"}`, i = KH(u, e, r), a = o === null || o === r, d = i ? qH(i) : 1;
			return /* @__PURE__ */ (0, $.jsxs)("div", {
				className: IH("[&>svg]:text-muted-foreground flex items-center gap-1.5 transition-opacity [&>svg]:h-3 [&>svg]:w-3", !a && "opacity-30", c && "cursor-pointer"),
				onClick: () => {
					c && s?.(o === r ? null : r);
				},
				children: [i?.icon && !t ? /* @__PURE__ */ (0, $.jsx)(i.icon, {}) : /* @__PURE__ */ (0, $.jsx)(tU, {
					variant: l,
					dataKey: r,
					colorsCount: d
				}), i?.label]
			}, r);
		})
	}) : null;
}
function tU({ variant: e, dataKey: t, colorsCount: n }) {
	let r = nU(t, n), i = rU(t, n);
	switch (e) {
		case "square": return /* @__PURE__ */ (0, $.jsx)("div", {
			className: "h-2 w-2 shrink-0",
			style: r
		});
		case "circle": return /* @__PURE__ */ (0, $.jsx)("div", {
			className: "h-2 w-2 shrink-0 rounded-full",
			style: r
		});
		case "circle-outline": return /* @__PURE__ */ (0, $.jsx)("div", {
			className: "h-2.5 w-2.5 shrink-0 rounded-full p-[1.5px]",
			style: i
		});
		case "vertical-bar": return /* @__PURE__ */ (0, $.jsx)("div", {
			className: "h-3 w-1 shrink-0 rounded-[2px]",
			style: r
		});
		case "horizontal-bar": return /* @__PURE__ */ (0, $.jsx)("div", {
			className: "h-1 w-3 shrink-0 rounded-[2px]",
			style: r
		});
		case "rounded-square-outline": return /* @__PURE__ */ (0, $.jsx)("div", {
			className: "h-2.5 w-2.5 shrink-0 rounded-[3px] p-[1.5px]",
			style: i
		});
		default: return /* @__PURE__ */ (0, $.jsx)("div", {
			className: "h-2 w-2 shrink-0 rounded-[2px]",
			style: r
		});
	}
}
function nU(e, t) {
	return t <= 1 ? { backgroundColor: `var(--color-${e}-0)` } : { background: `linear-gradient(to right, ${Array.from({ length: t }, (n, r) => `var(--color-${e}-${r}) ${r / (t - 1) * 100}%`).join(", ")})` };
}
function rU(e, t) {
	let n = {
		WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
		WebkitMaskComposite: "xor",
		mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
		maskComposite: "exclude"
	};
	return t <= 1 ? {
		backgroundColor: `var(--color-${e}-0)`,
		...n
	} : {
		background: `linear-gradient(to right, ${Array.from({ length: t }, (n, r) => `var(--color-${e}-${r}) ${r / (t - 1) * 100}%`).join(", ")})`,
		...n
	};
}
var iU = $d, aU = () => null, oU = {
	stiffness: 300,
	damping: 35,
	mass: .8
};
function sU({ range: e, totalPoints: t, containerRef: n, commit: r }) {
	let i = P.useRef(null), [a, o] = P.useState(!1), s = (0, P.useCallback)((e) => !n.current || t <= 1 ? 0 : Math.round(e / n.current.getBoundingClientRect().width * (t - 1)), [t, n]), c = (0, P.useCallback)((t, n) => {
		t.preventDefault(), t.target.setPointerCapture(t.pointerId), i.current = {
			type: n,
			originX: t.clientX,
			originRange: { ...e }
		}, o(!0);
	}, [e]), l = (0, P.useCallback)((e) => {
		let n = i.current;
		if (!n) return;
		let a = s(e.clientX - n.originX), { type: o, originRange: c } = n;
		if (o === "left") r({
			startIndex: c.startIndex + a,
			endIndex: c.endIndex
		}, "left");
		else if (o === "right") r({
			startIndex: c.startIndex,
			endIndex: c.endIndex + a
		}, "right");
		else {
			let e = c.endIndex - c.startIndex, n = c.startIndex + a, i = n + e;
			n < 0 && (n = 0, i = e), i > t - 1 && (i = t - 1, n = Math.max(0, i - e)), r({
				startIndex: n,
				endIndex: i
			}, "middle");
		}
	}, [
		s,
		t,
		r
	]), u = (0, P.useCallback)((e) => {
		e.target.releasePointerCapture(e.pointerId), i.current = null, o(!1);
	}, []);
	return {
		isDragging: a,
		bind: (0, P.useCallback)((e) => ({
			onPointerDown: (t) => c(t, e),
			onPointerMove: l,
			onPointerUp: u
		}), [
			c,
			l,
			u
		])
	};
}
function cU({ data: e, chartConfig: t, dataKeys: n, xDataKey: r, variant: i = "area", height: a = 56, className: o, stacked: s = !1, strokeVariant: c = "solid", connectNulls: l = !1, barRadius: u, startIndex: d, endIndex: f, defaultStartIndex: p = 0, defaultEndIndex: m, onChange: h, formatLabel: g, curveType: _ = "monotone", minSpan: v = 2, showLabels: y = !0, skipStyle: b = !1 }) {
	let x = P.useRef(null), S = P.useMemo(() => n ?? Object.keys(t), [n, t]), C = e.length, w = P.useId().replace(/:/g, ""), T = d !== void 0 && f !== void 0, [E, D] = P.useState(() => ({
		startIndex: Math.max(0, Math.min(p, C - 1)),
		endIndex: Math.max(0, Math.min(m ?? C - 1, C - 1))
	})), O = P.useRef(E);
	(0, P.useEffect)(() => {
		T || D((e) => {
			let t = {
				startIndex: Math.min(e.startIndex, Math.max(0, C - 1)),
				endIndex: Math.min(e.endIndex, Math.max(0, C - 1))
			};
			return O.current = t, t;
		});
	}, [C, T]);
	let k = (0, P.useCallback)((e, t) => {
		let { startIndex: n, endIndex: r } = e, i = Math.max(0, C - 1);
		if (n = Math.max(0, Math.min(n, i)), r = Math.max(0, Math.min(r, i)), t === "left") {
			let e = Math.max(0, r - v);
			return n = Math.min(n, e), {
				startIndex: n,
				endIndex: r
			};
		}
		if (t === "right") {
			let e = Math.min(i, n + v);
			return r = Math.max(r, e), {
				startIndex: n,
				endIndex: r
			};
		}
		return r - n < v && (r = Math.min(n + v, i), r - n < v && (n = Math.max(0, r - v))), {
			startIndex: n,
			endIndex: r
		};
	}, [C, v]), { isDragging: A, bind: j } = sU({
		range: E,
		totalPoints: C,
		containerRef: x,
		commit: (0, P.useCallback)((e, t) => {
			let n = k(e, t), r = O.current;
			(r.startIndex !== n.startIndex || r.endIndex !== n.endIndex) && (O.current = n, D(n), P.startTransition(() => {
				h?.(n);
			}));
		}, [k, h])
	}), M = E;
	(0, P.useEffect)(() => {
		if (T && !A) {
			let e = {
				startIndex: d,
				endIndex: f
			};
			D(e), O.current = e;
		}
	}, [
		T,
		d,
		f,
		A
	]);
	let N = C > 1 ? M.startIndex / (C - 1) * 100 : 0, ee = C > 1 ? M.endIndex / (C - 1) * 100 : 100, te = Xe(N), ne = Xe(ee);
	te.get() !== N && te.set(N), ne.get() !== ee && ne.set(ee);
	let re = et(te, oU), ie = et(ne, oU), ae = tt(re, (e) => `${e}%`), oe = tt(ie, (e) => `${e}%`), se = tt(re, (e) => `${e}%`), ce = tt(ie, (e) => `${Math.max(0, 100 - e)}%`), le = Xe(`${Math.max(0, ee - N)}%`), ue = (0, P.useCallback)(() => {
		le.set(`${Math.max(0, ie.get() - re.get())}%`);
	}, [
		re,
		ie,
		le
	]);
	Ye(re, "change", ue), Ye(ie, "change", ue);
	let de = (0, P.useCallback)((t) => {
		if (!r) return String(t);
		let n = e[t]?.[r];
		return g ? g(n, t) : String(n ?? t);
	}, [
		e,
		r,
		g
	]);
	return C === 0 ? null : /* @__PURE__ */ (0, $.jsxs)("div", {
		ref: x,
		"data-chart": b ? void 0 : w,
		className: IH("group relative select-none", o),
		style: { height: a },
		children: [
			!b && /* @__PURE__ */ (0, $.jsx)(GH, {
				id: w,
				config: t
			}),
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: "absolute inset-0 overflow-hidden rounded-md",
				children: /* @__PURE__ */ (0, $.jsx)(uU, {
					data: e,
					keys: S,
					chartConfig: t,
					variant: i,
					curveType: _,
					chartId: w,
					stacked: s,
					strokeVariant: c === "animated-dashed" ? "dashed" : c,
					connectNulls: l,
					barRadius: u
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(me.div, {
				className: "bg-background/70 pointer-events-none absolute inset-y-0 left-0 rounded-l-md backdrop-blur-[2px]",
				style: { width: se }
			}),
			/* @__PURE__ */ (0, $.jsx)(me.div, {
				className: "bg-background/70 pointer-events-none absolute inset-y-0 right-0 rounded-r-md backdrop-blur-[2px]",
				style: { width: ce }
			}),
			/* @__PURE__ */ (0, $.jsx)(me.div, {
				className: "absolute inset-y-0 cursor-grab touch-none rounded-sm border active:cursor-grabbing",
				style: {
					left: ae,
					width: le
				},
				...j("middle")
			}),
			/* @__PURE__ */ (0, $.jsx)(lU, {
				side: "left",
				position: ae,
				label: y ? de(M.startIndex) : void 0,
				bind: j("left")
			}),
			/* @__PURE__ */ (0, $.jsx)(lU, {
				side: "right",
				position: oe,
				label: y ? de(M.endIndex) : void 0,
				bind: j("right")
			})
		]
	});
}
function lU({ side: e, position: t, label: n, bind: r }) {
	let i = e === "left";
	return /* @__PURE__ */ (0, $.jsxs)(me.div, {
		className: "absolute inset-y-0 z-10",
		style: { left: t },
		children: [/* @__PURE__ */ (0, $.jsx)("div", {
			className: IH("group absolute inset-y-0 flex w-3 cursor-ew-resize touch-none items-center justify-center after:absolute after:inset-y-0 after:-left-4 after:w-11 after:content-['']", i ? "" : "-translate-x-full"),
			...r,
			children: /* @__PURE__ */ (0, $.jsx)("div", {
				className: IH("bg-muted-foreground group-hover:bg-foreground relative flex h-4 w-1.5 items-center justify-center rounded-md transition-colors", i ? "-left-[5.5px]" : "-right-[5.5px]"),
				children: /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex flex-col gap-[2px]",
					children: [
						/* @__PURE__ */ (0, $.jsx)("div", { className: "bg-background/70 h-[2px] w-[2px] rounded-full" }),
						/* @__PURE__ */ (0, $.jsx)("div", { className: "bg-background/70 h-[2px] w-[2px] rounded-full" }),
						/* @__PURE__ */ (0, $.jsx)("div", { className: "bg-background/70 h-[2px] w-[2px] rounded-full" })
					]
				})
			})
		}), n && /* @__PURE__ */ (0, $.jsx)("div", {
			className: IH("bg-foreground text-background pointer-events-none absolute -bottom-3 -translate-y-1/2 rounded-[3px] px-1 py-px text-[8px] leading-tight font-medium whitespace-nowrap opacity-0 group-hover:opacity-100", i ? "left-1.5" : "right-1.5"),
			children: n
		})]
	});
}
function uU({ data: e, keys: t, chartConfig: n, variant: r, curveType: i, chartId: a, stacked: o, strokeVariant: s = "solid", connectNulls: c = !1, barRadius: l }) {
	let u = P.useMemo(() => Object.entries(n).filter(([e]) => t.includes(e)).map(([e, t]) => ({
		dataKey: e,
		colorsCount: qH(t)
	})), [n, t]), d = s === "dashed" || s === "animated-dashed" ? "4 4" : void 0, f = /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [r === "area" && /* @__PURE__ */ (0, $.jsxs)("linearGradient", {
		id: `${a}-zm-vertical-fade`,
		x1: "0",
		y1: "0",
		x2: "0",
		y2: "1",
		children: [/* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "0%",
			stopColor: "white",
			stopOpacity: .15
		}), /* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "100%",
			stopColor: "white",
			stopOpacity: 0
		})]
	}), u.map(({ dataKey: e, colorsCount: t }) => {
		let n = t === 1 ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "0%",
			stopColor: `var(--color-${e}-0)`
		}), /* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "100%",
			stopColor: `var(--color-${e}-0)`
		})] }) : Array.from({ length: t }, (n, r) => /* @__PURE__ */ (0, $.jsx)("stop", {
			offset: `${r / (t - 1) * 100}%`,
			stopColor: `var(--color-${e}-${r}, var(--color-${e}-0))`
		}, r));
		return /* @__PURE__ */ (0, $.jsxs)(P.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("linearGradient", {
			id: `${a}-zm-${e}`,
			x1: "0",
			y1: "0",
			x2: "0",
			y2: "1",
			children: n
		}), r === "area" && /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("mask", {
			id: `${a}-zm-fill-mask-${e}`,
			children: /* @__PURE__ */ (0, $.jsx)("rect", {
				width: "100%",
				height: "100%",
				fill: `url(#${a}-zm-vertical-fade)`
			})
		}), /* @__PURE__ */ (0, $.jsx)("pattern", {
			id: `${a}-zm-fill-${e}`,
			patternUnits: "userSpaceOnUse",
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, $.jsx)("rect", {
				width: "100%",
				height: "100%",
				fill: `url(#${a}-zm-${e})`,
				mask: `url(#${a}-zm-fill-mask-${e})`
			})
		})] })] }, e);
	})] });
	if (r === "line") return /* @__PURE__ */ (0, $.jsx)(Ru, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, $.jsxs)(dH, {
			data: e,
			margin: {
				top: 4,
				right: 0,
				bottom: 0,
				left: 0
			},
			children: [/* @__PURE__ */ (0, $.jsx)("defs", { children: f }), t.map((e) => /* @__PURE__ */ (0, $.jsx)(FL, {
				type: i,
				dataKey: e,
				stroke: `url(#${a}-zm-${e})`,
				strokeWidth: 1,
				strokeOpacity: .5,
				strokeDasharray: d,
				connectNulls: c,
				dot: !1,
				activeDot: !1,
				isAnimationActive: !1
			}, e))]
		})
	});
	if (r === "bar") {
		let n = l ?? 3;
		return /* @__PURE__ */ (0, $.jsx)(Ru, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, $.jsxs)(pH, {
				data: e,
				margin: {
					top: 2,
					right: 0,
					bottom: 0,
					left: 0
				},
				barGap: 2,
				barSize: 14,
				children: [/* @__PURE__ */ (0, $.jsx)("defs", { children: f }), t.map((e) => /* @__PURE__ */ (0, $.jsx)(Lz, {
					dataKey: e,
					fill: `url(#${a}-zm-${e})`,
					fillOpacity: .35,
					stackId: o ? "zm-stack" : void 0,
					isAnimationActive: !1,
					radius: [
						n,
						n,
						n,
						n
					]
				}, e))]
			})
		});
	}
	return /* @__PURE__ */ (0, $.jsx)(Ru, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, $.jsxs)(DH, {
			data: e,
			margin: {
				top: 4,
				right: 0,
				bottom: 0,
				left: 0
			},
			children: [/* @__PURE__ */ (0, $.jsx)("defs", { children: f }), t.map((e) => /* @__PURE__ */ (0, $.jsx)(OR, {
				type: i,
				dataKey: e,
				stroke: `url(#${a}-zm-${e})`,
				fill: `url(#${a}-zm-fill-${e})`,
				strokeWidth: 1,
				strokeOpacity: .5,
				strokeDasharray: d,
				connectNulls: c,
				fillOpacity: 1,
				stackId: o ? "zm-stack" : void 0,
				dot: !1,
				activeDot: !1,
				isAnimationActive: !1
			}, e))]
		})
	});
}
function dU({ data: e, defaultStartIndex: t = 0, defaultEndIndex: n }) {
	let [r, i] = P.useState({
		startIndex: t,
		endIndex: n ?? Math.max(0, e.length - 1)
	}), a = P.useDeferredValue(r);
	return (0, P.useEffect)(() => {
		i({
			startIndex: 0,
			endIndex: Math.max(0, e.length - 1)
		});
	}, [e.length]), {
		range: r,
		visibleData: P.useMemo(() => e.slice(a.startIndex, a.endIndex + 1), [
			e,
			a.startIndex,
			a.endIndex
		]),
		brushProps: {
			startIndex: r.startIndex,
			endIndex: r.endIndex,
			onChange: i
		}
	};
}
var fU = {
	dots: ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "20",
		height: "20",
		patternUnits: "userSpaceOnUse",
		children: /* @__PURE__ */ (0, $.jsx)("circle", {
			className: "text-border dark:text-border",
			cx: "2",
			cy: "2",
			r: "1",
			fill: "currentColor"
		})
	}),
	grid: ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "20",
		height: "20",
		patternUnits: "userSpaceOnUse",
		children: /* @__PURE__ */ (0, $.jsx)("path", {
			className: "text-border dark:text-border",
			d: "M 20 0 L 0 0 0 20",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "0.5"
		})
	}),
	plus: ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "16",
		height: "16",
		patternUnits: "userSpaceOnUse",
		children: /* @__PURE__ */ (0, $.jsx)("path", {
			className: "text-border dark:text-border",
			d: "M 8 4 L 8 12 M 4 8 L 12 8",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "0.5",
			strokeLinecap: "round"
		})
	}),
	bubbles: ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "100",
		height: "100",
		patternUnits: "userSpaceOnUse",
		patternTransform: "scale(0.6667)",
		children: /* @__PURE__ */ (0, $.jsx)("path", {
			className: "text-border dark:text-border",
			d: "M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z",
			fill: "currentColor",
			fillOpacity: "0.4",
			fillRule: "evenodd"
		})
	}),
	"cross-hatch": ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "20",
		height: "20",
		patternUnits: "userSpaceOnUse",
		children: /* @__PURE__ */ (0, $.jsx)("path", {
			className: "text-border/60 dark:text-border/50",
			d: "M 0 0 L 20 20 M 20 0 L 0 20",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "0.5"
		})
	}),
	"diagonal-lines": ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "6",
		height: "6",
		patternUnits: "userSpaceOnUse",
		patternTransform: "rotate(45)",
		children: /* @__PURE__ */ (0, $.jsx)("line", {
			className: "text-border dark:text-border",
			x1: "0",
			y1: "0",
			x2: "0",
			y2: "6",
			stroke: "currentColor",
			strokeWidth: "0.5"
		})
	}),
	"falling-triangles": ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "18",
		height: "36",
		patternUnits: "userSpaceOnUse",
		children: /* @__PURE__ */ (0, $.jsx)("path", {
			className: "text-border dark:text-border",
			d: "M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z",
			transform: "scale(0.5)",
			fill: "currentColor",
			fillOpacity: "0.4"
		})
	}),
	"4-pointed-star": ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "16",
		height: "16",
		patternUnits: "userSpaceOnUse",
		children: /* @__PURE__ */ (0, $.jsx)("polygon", {
			className: "text-border dark:text-border",
			fillRule: "evenodd",
			points: "5 3 8 4 5 5 4 8 3 5 0 4 3 3 4 0 5 3",
			fill: "currentColor",
			fillOpacity: "0.4"
		})
	}),
	"tiny-checkers": ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "8",
		height: "8",
		patternUnits: "userSpaceOnUse",
		children: /* @__PURE__ */ (0, $.jsx)("path", {
			className: "text-border dark:text-border",
			fillRule: "evenodd",
			d: "M0 0h4v4H0V0zm4 4h4v4H4V4z",
			fill: "currentColor",
			fillOpacity: "0.2"
		})
	}),
	"overlapping-circles": ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "40",
		height: "40",
		patternUnits: "userSpaceOnUse",
		children: /* @__PURE__ */ (0, $.jsx)("path", {
			className: "text-border dark:text-border",
			fillRule: "evenodd",
			d: "M25 25c0-2.762 2.238-5 5-5s5 2.238 5 5-2.238 5-5 5c0 2.762-2.238 5-5 5s-5-2.238-5-5 2.238-5 5-5zM5 5c0-2.762 2.238-5 5-5s5 2.238 5 5-2.238 5-5 5c0 2.762-2.238 5-5 5S0 12.762 0 10s2.238-5 5-5zm5 4c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm20 20c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4z",
			fill: "currentColor",
			fillOpacity: "0.4"
		})
	}),
	"wiggle-lines": ({ id: e }) => /* @__PURE__ */ (0, $.jsx)("pattern", {
		id: e,
		x: "0",
		y: "0",
		width: "52",
		height: "26",
		patternUnits: "userSpaceOnUse",
		patternTransform: "scale(0.6)",
		children: /* @__PURE__ */ (0, $.jsx)("path", {
			className: "text-border dark:text-border",
			d: "M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z",
			fill: "currentColor",
			fillOpacity: "0.4"
		})
	})
};
function pU({ variant: e }) {
	let t = (0, P.useId)().replace(/:/g, ""), n = `${t}-bg-${e}`, r = `${t}-bg-edge-fade`, i = `${t}-bg-blur`, a = fU[e];
	return /* @__PURE__ */ (0, $.jsxs)(cD, {
		zIndex: -1,
		children: [/* @__PURE__ */ (0, $.jsxs)("defs", { children: [
			/* @__PURE__ */ (0, $.jsx)(a, { id: n }),
			/* @__PURE__ */ (0, $.jsx)("filter", {
				id: i,
				children: /* @__PURE__ */ (0, $.jsx)("feGaussianBlur", { stdDeviation: "25" })
			}),
			/* @__PURE__ */ (0, $.jsx)("mask", {
				id: r,
				maskUnits: "userSpaceOnUse",
				children: /* @__PURE__ */ (0, $.jsx)("rect", {
					x: "8%",
					y: "20%",
					width: "85%",
					height: "60%",
					fill: "white",
					filter: `url(#${i})`
				})
			})
		] }), /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${n})`,
			mask: `url(#${r})`
		})]
	});
}
// src/react/evilcharts/registry/charts/recharts-bar-chart.tsx
var mU = 2, hU = "loading", gU = 2e3, _U = "evil-stacked", vU = .5, yU = .05, bU = [
	0,
	.7,
	.5,
	1
], xU = (0, P.createContext)(null);
function SU() {
	let e = (0, P.use)(xU);
	if (!e) throw Error("Bar chart parts (<Bar />, <XAxis />, …) must be used within <EvilBarChart />");
	return e;
}
function CU({ config: e, data: t, children: n, className: r, chartProps: i, stackType: a = "default", layout: o = "vertical", barRadius: s = mU, animationType: c = "left-to-right", barGap: l, barCategoryGap: u, backgroundVariant: d, defaultSelectedDataKey: f = null, onSelectionChange: p, isLoading: m = !1, loadingBars: h, xDataKey: g }) {
	let _ = (0, P.useId)().replace(/:/g, ""), [v] = (0, P.useState)(() => Date.now()), [y, b] = (0, P.useState)(f), [x, S] = (0, P.useState)(!1), { loadingData: C, onShimmerExit: w } = UU(m, h), { visibleData: T, brushProps: E } = dU({ data: t }), D = (0, P.useMemo)(() => {
		let e = P.Children.toArray(n), t = e.find((e) => (0, P.isValidElement)(e) && e.type === aU), r = (0, P.isValidElement)(t) ? t.props : {};
		return {
			slot: {
				present: (0, P.isValidElement)(t),
				height: r.height,
				formatLabel: r.formatLabel,
				onChange: r.onChange
			},
			chartChildren: e.filter((e) => !((0, P.isValidElement)(e) && e.type === aU))
		};
	}, [n]), O = D.slot.present, k = a === "stacked" || a === "percent", A = o === "horizontal", j = O && !m ? T : t, M = (0, P.useCallback)((e) => {
		b(e), p?.(e);
	}, [p]), N = (0, P.useMemo)(() => ({
		config: e,
		isStacked: k,
		isHorizontal: A,
		isLoading: m,
		barRadius: s,
		animationType: c,
		introStartedAt: v,
		dataLength: j.length,
		selectedDataKey: y,
		selectDataKey: M,
		isMouseInChart: x
	}), [
		e,
		k,
		A,
		m,
		s,
		c,
		v,
		j.length,
		y,
		M,
		x
	]);
	return /* @__PURE__ */ (0, $.jsx)(xU, {
		value: N,
		children: /* @__PURE__ */ (0, $.jsxs)(HH, {
			className: r,
			config: e,
			footer: O && !m && /* @__PURE__ */ (0, $.jsx)(cU, {
				data: t,
				chartConfig: e,
				xDataKey: g,
				variant: "bar",
				barRadius: s,
				height: D.slot.height,
				formatLabel: D.slot.formatLabel,
				stacked: k,
				skipStyle: !0,
				className: "mt-1",
				...E,
				onChange: (e) => {
					E.onChange(e), D.slot.onChange?.(e);
				}
			}),
			children: [/* @__PURE__ */ (0, $.jsx)(UH, { isLoading: m }), /* @__PURE__ */ (0, $.jsxs)(pH, {
				id: _,
				accessibilityLayer: !0,
				layout: A ? "vertical" : "horizontal",
				data: m ? C : j,
				barGap: l,
				barCategoryGap: u,
				stackOffset: a === "percent" ? "expand" : void 0,
				onMouseEnter: () => S(!0),
				onMouseLeave: () => S(!1),
				...i,
				children: [
					d && /* @__PURE__ */ (0, $.jsx)(pU, { variant: d }),
					/* @__PURE__ */ (0, $.jsx)(cF, { color: "white" }),
					D.chartChildren,
					m && /* @__PURE__ */ (0, $.jsx)(WU, {
						chartId: _,
						onShimmerExit: w
					})
				]
			})]
		})
	});
}
function wU({ dataKey: e, variant: t = "default", radius: n, animationType: r, isClickable: i = !1, enableHoverHighlight: a = !1, glowing: o = !1, bufferBar: s = !1, barProps: c }) {
	let { config: l, isStacked: u, isHorizontal: d, isLoading: f, barRadius: p, animationType: m, introStartedAt: h, dataLength: g, selectedDataKey: _, selectDataKey: v, isMouseInChart: y } = SU(), b = (0, P.useId)().replace(/:/g, ""), x = Le();
	if (f) return null;
	let S = n ?? p, C = _ === e, w = x ? "none" : r ?? m, T = {
		id: b,
		dataKey: e,
		variant: t,
		barRadius: S,
		glowing: o,
		bufferBar: s,
		isClickable: i,
		enableHoverHighlight: a,
		isMouseInChart: y,
		isHorizontal: d,
		introStartedAt: h,
		selectedDataKey: _,
		dataLength: g,
		onClick: () => {
			i && v(C ? null : e);
		}
	};
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(Lz, {
		dataKey: e,
		stackId: u ? _U : void 0,
		fill: `url(#${b}-colors-${e})`,
		radius: S,
		isAnimationActive: !1,
		style: i || a ? { cursor: "pointer" } : void 0,
		shape: (e) => /* @__PURE__ */ (0, $.jsx)(AU, {
			...e,
			...T,
			animationType: w
		}),
		activeBar: (e) => /* @__PURE__ */ (0, $.jsx)(AU, {
			...e,
			...T,
			animationType: "none"
		}),
		...c
	}), /* @__PURE__ */ (0, $.jsxs)("defs", { children: [
		/* @__PURE__ */ (0, $.jsx)(PU, {
			id: b,
			dataKey: e,
			config: l
		}),
		t === "hatched" && /* @__PURE__ */ (0, $.jsx)(FU, {
			id: b,
			dataKey: e
		}),
		t === "duotone" && /* @__PURE__ */ (0, $.jsx)(LU, {
			id: b,
			dataKey: e,
			config: l
		}),
		t === "duotone-reverse" && /* @__PURE__ */ (0, $.jsx)(RU, {
			id: b,
			dataKey: e,
			config: l
		}),
		t === "gradient" && /* @__PURE__ */ (0, $.jsx)(zU, {
			id: b,
			dataKey: e
		}),
		t === "stripped" && /* @__PURE__ */ (0, $.jsx)(BU, {
			id: b,
			dataKey: e
		}),
		s && /* @__PURE__ */ (0, $.jsx)(IU, {
			id: b,
			dataKey: e
		}),
		o && /* @__PURE__ */ (0, $.jsx)(VU, {
			id: b,
			dataKey: e
		})
	] })] });
}
function TU({ tickLine: e = !1, axisLine: t = !1, tickMargin: n = 8, minTickGap: r = 8, type: i, ...a }) {
	let { isLoading: o, isHorizontal: s } = SU();
	return o ? null : /* @__PURE__ */ (0, $.jsx)(iB, {
		tickLine: e,
		axisLine: t,
		tickMargin: n,
		minTickGap: r,
		type: i ?? (s ? "number" : "category"),
		...a
	});
}
function EU({ tickLine: e = !1, axisLine: t = !1, tickMargin: n = 8, minTickGap: r = 8, width: i = "auto", type: a, ...o }) {
	let { isLoading: s, isHorizontal: c } = SU();
	return s ? null : /* @__PURE__ */ (0, $.jsx)(yB, {
		tickLine: e,
		axisLine: t,
		tickMargin: n,
		minTickGap: r,
		width: i,
		type: a ?? (c ? "category" : "number"),
		...o
	});
}
function DU({ strokeDasharray: e = "3 3", vertical: t, horizontal: n, ...r }) {
	let { isHorizontal: i } = SU();
	return /* @__PURE__ */ (0, $.jsx)(jI, {
		strokeDasharray: e,
		vertical: t ?? i,
		horizontal: n ?? !i,
		...r
	});
}
function OU({ variant: e, roundness: t, defaultIndex: n }) {
	let { isLoading: r, selectedDataKey: i } = SU();
	return r ? null : /* @__PURE__ */ (0, $.jsx)($H, {
		cursor: !1,
		defaultIndex: n,
		content: /* @__PURE__ */ (0, $.jsx)(ZH, {
			selected: i,
			roundness: t,
			variant: e
		})
	});
}
function kU({ variant: e, align: t = "right", verticalAlign: n = "top", isClickable: r = !1 }) {
	let { selectedDataKey: i, selectDataKey: a } = SU();
	return /* @__PURE__ */ (0, $.jsx)(iU, {
		verticalAlign: n,
		align: t,
		content: /* @__PURE__ */ (0, $.jsx)(eU, {
			selected: i,
			onSelectChange: a,
			isClickable: r,
			variant: e
		})
	});
}
var AU = (e) => {
	let { x: t = 0, y: n = 0, width: r = 0, height: i = 0, id: a, dataKey: o, variant: s, barRadius: c, glowing: l, bufferBar: u, isClickable: d, enableHoverHighlight: f, isMouseInChart: p, isHorizontal: m = !1, animationType: h = "none", introStartedAt: g = 0, selectedDataKey: _, isActive: v, dataLength: y = 0, onClick: b } = e, x = typeof e.index == "number" ? e.index : -1, S = u && y > 0 && x === y - 1, C = s === "stripped", w = jU(h, x, y, m, g), T = S ? `url(#${a}-buffer-hatched-${o})` : MU(s, a, o), E = l ? `url(#${a}-bar-glow-${o})` : void 0, D = NU({
		isClickable: d,
		selectedDataKey: _,
		dataKey: o,
		enableHoverHighlight: f,
		isMouseInChart: p,
		isActive: v
	}), O = d || f ? { cursor: "pointer" } : void 0, k = C ? [
		c,
		c,
		0,
		0
	] : c, A = /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(Am, {
		x: t,
		y: n,
		width: r,
		opacity: D,
		height: Math.max(0, i - 3),
		radius: k,
		fill: T,
		filter: E,
		stroke: S ? `url(#${a}-colors-${o})` : void 0,
		strokeWidth: S ? 1 : void 0
	}), C && /* @__PURE__ */ (0, $.jsx)(Am, {
		x: t,
		y: n - 4,
		width: r,
		height: 2,
		radius: 1,
		fill: `url(#${a}-colors-${o})`
	})] });
	return /* @__PURE__ */ (0, $.jsxs)("g", {
		style: O,
		onClick: b,
		children: [/* @__PURE__ */ (0, $.jsx)(Am, {
			...e,
			fill: "transparent"
		}), w ? /* @__PURE__ */ (0, $.jsx)(me.g, {
			initial: w.initial,
			animate: w.animate,
			transition: w.transition,
			style: w.style,
			children: A
		}) : A]
	});
}, jU = (e, t, n, r, i) => {
	if (e === "none" || t < 0 || n <= 0) return null;
	let a = n - 1, o = a / 2, s;
	switch (e) {
		case "right-to-left":
			s = a - t;
			break;
		case "center-out":
			s = Math.abs(t - o);
			break;
		case "edges-in":
			s = o - Math.abs(t - o);
			break;
		default: s = t;
	}
	let c = s * yU * 1e3, l = vU * 1e3, u = c + l, d = Date.now() - i;
	if (d >= u) return null;
	let f = d <= c ? 0 : (d - c) / l, p = {
		duration: (u - Math.max(d, c)) / 1e3,
		ease: bU,
		delay: Math.max(0, c - d) / 1e3
	};
	return r ? {
		initial: { scaleX: f },
		animate: { scaleX: 1 },
		transition: p,
		style: { originX: 0 }
	} : {
		initial: { scaleY: f },
		animate: { scaleY: 1 },
		transition: p,
		style: { originY: 1 }
	};
}, MU = (e, t, n) => {
	switch (e) {
		case "hatched": return `url(#${t}-hatched-${n})`;
		case "duotone": return `url(#${t}-duotone-${n})`;
		case "duotone-reverse": return `url(#${t}-duotone-reverse-${n})`;
		case "gradient": return `url(#${t}-gradient-${n})`;
		case "stripped": return `url(#${t}-stripped-${n})`;
		default: return `url(#${t}-colors-${n})`;
	}
}, NU = ({ isClickable: e, selectedDataKey: t, dataKey: n, enableHoverHighlight: r, isMouseInChart: i, isActive: a }) => {
	let o = e && t !== null ? t === null || t === n ? 1 : .15 : 1;
	return r && i ? a ? o : o * .3 : o;
}, PU = ({ id: e, dataKey: t, config: n }) => {
	let r = qH(n[t] ?? {});
	return /* @__PURE__ */ (0, $.jsx)("linearGradient", {
		id: `${e}-colors-${t}`,
		x1: "0",
		y1: "0",
		x2: "0",
		y2: "1",
		children: r === 1 ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "0%",
			stopColor: `var(--color-${t}-0)`
		}), /* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "100%",
			stopColor: `var(--color-${t}-0)`
		})] }) : Array.from({ length: r }, (e, n) => {
			let i = `${n / (r - 1) * 100}%`;
			return /* @__PURE__ */ (0, $.jsx)("stop", {
				offset: i,
				stopColor: `var(--color-${t}-${n}, var(--color-${t}-0))`
			}, i);
		})
	});
}, FU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
	/* @__PURE__ */ (0, $.jsxs)("pattern", {
		id: `${e}-hatched-mask-pattern`,
		x: "0",
		y: "0",
		width: "5",
		height: "5",
		patternUnits: "userSpaceOnUse",
		patternTransform: "rotate(-45)",
		children: [/* @__PURE__ */ (0, $.jsx)("rect", {
			width: "5",
			height: "5",
			fill: "white",
			fillOpacity: .3
		}), /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "1.5",
			height: "5",
			fill: "white",
			fillOpacity: 1
		})]
	}),
	/* @__PURE__ */ (0, $.jsx)("mask", {
		id: `${e}-hatched-mask-${t}`,
		children: /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${e}-hatched-mask-pattern)`
		})
	}),
	/* @__PURE__ */ (0, $.jsx)("pattern", {
		id: `${e}-hatched-${t}`,
		patternUnits: "userSpaceOnUse",
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${e}-colors-${t})`,
			mask: `url(#${e}-hatched-mask-${t})`
		})
	})
] }), IU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
	/* @__PURE__ */ (0, $.jsxs)("pattern", {
		id: `${e}-buffer-hatched-mask-pattern`,
		x: "0",
		y: "0",
		width: "5",
		height: "5",
		patternUnits: "userSpaceOnUse",
		patternTransform: "rotate(-45)",
		children: [/* @__PURE__ */ (0, $.jsx)("rect", {
			width: "5",
			height: "5",
			fill: "black",
			fillOpacity: 0
		}), /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "1",
			height: "5",
			fill: "white",
			fillOpacity: 1
		})]
	}),
	/* @__PURE__ */ (0, $.jsx)("mask", {
		id: `${e}-buffer-hatched-mask-${t}`,
		children: /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${e}-buffer-hatched-mask-pattern)`
		})
	}),
	/* @__PURE__ */ (0, $.jsx)("pattern", {
		id: `${e}-buffer-hatched-${t}`,
		patternUnits: "userSpaceOnUse",
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${e}-colors-${t})`,
			mask: `url(#${e}-buffer-hatched-mask-${t})`
		})
	})
] }), LU = ({ id: e, dataKey: t, config: n }) => {
	let r = qH(n[t] ?? {});
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsxs)("linearGradient", {
			id: `${e}-duotone-mask-gradient-${t}`,
			gradientUnits: "objectBoundingBox",
			x1: "0",
			y1: "0",
			x2: "1",
			y2: "0",
			children: [/* @__PURE__ */ (0, $.jsx)("stop", {
				offset: "50%",
				stopColor: "white",
				stopOpacity: .4
			}), /* @__PURE__ */ (0, $.jsx)("stop", {
				offset: "50%",
				stopColor: "white",
				stopOpacity: 1
			})]
		}),
		/* @__PURE__ */ (0, $.jsx)("linearGradient", {
			id: `${e}-duotone-colors-${t}`,
			gradientUnits: "objectBoundingBox",
			x1: "0",
			y1: "0",
			x2: "0",
			y2: "1",
			children: r === 1 ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("stop", {
				offset: "0%",
				stopColor: `var(--color-${t}-0)`
			}), /* @__PURE__ */ (0, $.jsx)("stop", {
				offset: "100%",
				stopColor: `var(--color-${t}-0)`
			})] }) : Array.from({ length: r }, (e, n) => {
				let i = `${n / (r - 1) * 100}%`;
				return /* @__PURE__ */ (0, $.jsx)("stop", {
					offset: i,
					stopColor: `var(--color-${t}-${n}, var(--color-${t}-0))`
				}, i);
			})
		}),
		/* @__PURE__ */ (0, $.jsx)("mask", {
			id: `${e}-duotone-mask-${t}`,
			maskContentUnits: "objectBoundingBox",
			children: /* @__PURE__ */ (0, $.jsx)("rect", {
				x: "0",
				y: "0",
				width: "1",
				height: "1",
				fill: `url(#${e}-duotone-mask-gradient-${t})`
			})
		}),
		/* @__PURE__ */ (0, $.jsx)("pattern", {
			id: `${e}-duotone-${t}`,
			patternUnits: "objectBoundingBox",
			patternContentUnits: "objectBoundingBox",
			width: "1",
			height: "1",
			children: /* @__PURE__ */ (0, $.jsx)("rect", {
				x: "0",
				y: "0",
				width: "1",
				height: "1",
				fill: `url(#${e}-duotone-colors-${t})`,
				mask: `url(#${e}-duotone-mask-${t})`
			})
		})
	] });
}, RU = ({ id: e, dataKey: t, config: n }) => {
	let r = qH(n[t] ?? {});
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsxs)("linearGradient", {
			id: `${e}-duotone-reverse-mask-gradient-${t}`,
			gradientUnits: "objectBoundingBox",
			x1: "0",
			y1: "0",
			x2: "1",
			y2: "0",
			children: [/* @__PURE__ */ (0, $.jsx)("stop", {
				offset: "50%",
				stopColor: "white",
				stopOpacity: 1
			}), /* @__PURE__ */ (0, $.jsx)("stop", {
				offset: "50%",
				stopColor: "white",
				stopOpacity: .4
			})]
		}),
		/* @__PURE__ */ (0, $.jsx)("linearGradient", {
			id: `${e}-duotone-reverse-colors-${t}`,
			gradientUnits: "objectBoundingBox",
			x1: "0",
			y1: "0",
			x2: "0",
			y2: "1",
			children: r === 1 ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("stop", {
				offset: "0%",
				stopColor: `var(--color-${t}-0)`
			}), /* @__PURE__ */ (0, $.jsx)("stop", {
				offset: "100%",
				stopColor: `var(--color-${t}-0)`
			})] }) : Array.from({ length: r }, (e, n) => {
				let i = `${n / (r - 1) * 100}%`;
				return /* @__PURE__ */ (0, $.jsx)("stop", {
					offset: i,
					stopColor: `var(--color-${t}-${n}, var(--color-${t}-0))`
				}, i);
			})
		}),
		/* @__PURE__ */ (0, $.jsx)("mask", {
			id: `${e}-duotone-reverse-mask-${t}`,
			maskContentUnits: "objectBoundingBox",
			children: /* @__PURE__ */ (0, $.jsx)("rect", {
				x: "0",
				y: "0",
				width: "1",
				height: "1",
				fill: `url(#${e}-duotone-reverse-mask-gradient-${t})`
			})
		}),
		/* @__PURE__ */ (0, $.jsx)("pattern", {
			id: `${e}-duotone-reverse-${t}`,
			patternUnits: "objectBoundingBox",
			patternContentUnits: "objectBoundingBox",
			width: "1",
			height: "1",
			children: /* @__PURE__ */ (0, $.jsx)("rect", {
				x: "0",
				y: "0",
				width: "1",
				height: "1",
				fill: `url(#${e}-duotone-reverse-colors-${t})`,
				mask: `url(#${e}-duotone-reverse-mask-${t})`
			})
		})
	] });
}, zU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
	/* @__PURE__ */ (0, $.jsxs)("linearGradient", {
		id: `${e}-gradient-mask-gradient`,
		x1: "0",
		y1: "0",
		x2: "0",
		y2: "1",
		children: [/* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "20%",
			stopColor: "white",
			stopOpacity: 1
		}), /* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "90%",
			stopColor: "white",
			stopOpacity: 0
		})]
	}),
	/* @__PURE__ */ (0, $.jsx)("mask", {
		id: `${e}-gradient-mask-${t}`,
		children: /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${e}-gradient-mask-gradient)`
		})
	}),
	/* @__PURE__ */ (0, $.jsx)("pattern", {
		id: `${e}-gradient-${t}`,
		patternUnits: "userSpaceOnUse",
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${e}-colors-${t})`,
			mask: `url(#${e}-gradient-mask-${t})`
		})
	})
] }), BU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
	/* @__PURE__ */ (0, $.jsxs)("linearGradient", {
		id: `${e}-stripped-mask-gradient`,
		x1: "0",
		y1: "0",
		x2: "0",
		y2: "1",
		children: [/* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "0%",
			stopColor: "white",
			stopOpacity: .2
		}), /* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "100%",
			stopColor: "white",
			stopOpacity: .2
		})]
	}),
	/* @__PURE__ */ (0, $.jsx)("mask", {
		id: `${e}-stripped-mask-${t}`,
		children: /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${e}-stripped-mask-gradient)`
		})
	}),
	/* @__PURE__ */ (0, $.jsx)("pattern", {
		id: `${e}-stripped-${t}`,
		patternUnits: "userSpaceOnUse",
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, $.jsx)("rect", {
			width: "100%",
			height: "100%",
			fill: `url(#${e}-colors-${t})`,
			mask: `url(#${e}-stripped-mask-${t})`
		})
	})
] }), VU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)("filter", {
	id: `${e}-bar-glow-${t}`,
	x: "-100%",
	y: "-100%",
	width: "300%",
	height: "300%",
	children: [
		/* @__PURE__ */ (0, $.jsx)("feGaussianBlur", {
			in: "SourceGraphic",
			stdDeviation: "8",
			result: "blur"
		}),
		/* @__PURE__ */ (0, $.jsx)("feColorMatrix", {
			in: "blur",
			type: "matrix",
			values: "1 0 0 0 0\n                0 1 0 0 0\n                0 0 1 0 0\n                0 0 0 0.5 0",
			result: "glow"
		}),
		/* @__PURE__ */ (0, $.jsxs)("feMerge", { children: [/* @__PURE__ */ (0, $.jsx)("feMergeNode", { in: "glow" }), /* @__PURE__ */ (0, $.jsx)("feMergeNode", { in: "SourceGraphic" })] })
	]
}), HU = (e = 17, t = .05, n = .9) => Array.from({ length: e }, (r, i) => {
	let a = i / (e - 1), o = t + Math.sin(a * Math.PI) ** 2 * (n - t);
	return {
		offset: `${(a * 100).toFixed(0)}%`,
		opacity: Number(o.toFixed(3))
	};
});
function UU(e, t = 12) {
	let [n, r] = (0, P.useState)(!1), i = (0, P.useCallback)(() => {
		e && r((e) => !e);
	}, [e]);
	return {
		loadingData: (0, P.useMemo)(() => JH(t, 20, 80), [t, n]),
		onShimmerExit: i
	};
}
var WU = ({ chartId: e, onShimmerExit: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(Lz, {
	dataKey: hU,
	fill: "currentColor",
	fillOpacity: .15,
	radius: mU,
	isAnimationActive: !1,
	legendType: "none",
	style: { mask: `url(#${e}-loading-mask)` }
}), /* @__PURE__ */ (0, $.jsx)("defs", { children: /* @__PURE__ */ (0, $.jsx)(GU, {
	chartId: e,
	onShimmerExit: t
}) })] }), GU = ({ chartId: e, onShimmerExit: t }) => {
	let n = HU(), r = (0, P.useRef)(-1);
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsx)("linearGradient", {
			id: `${e}-loading-mask-gradient`,
			x1: "0",
			y1: "0",
			x2: "1",
			y2: "0",
			children: n.map(({ offset: e, opacity: t }) => /* @__PURE__ */ (0, $.jsx)("stop", {
				offset: e,
				stopColor: "white",
				stopOpacity: t
			}, e))
		}),
		/* @__PURE__ */ (0, $.jsx)("pattern", {
			id: `${e}-loading-mask-pattern`,
			patternUnits: "objectBoundingBox",
			patternContentUnits: "objectBoundingBox",
			patternTransform: "rotate(25)",
			width: 3,
			height: "1",
			x: "0",
			y: "0",
			children: /* @__PURE__ */ (0, $.jsx)(me.rect, {
				y: "0",
				width: "1",
				height: "1",
				fill: `url(#${e}-loading-mask-gradient)`,
				initial: { x: -1 },
				animate: { x: 2 },
				transition: {
					duration: gU / 1e3,
					ease: "linear",
					repeat: Infinity,
					repeatType: "loop"
				},
				onUpdate: (e) => {
					let n = typeof e.x == "number" ? e.x : -1, i = r.current;
					n >= 1 && i < 1 && t(), r.current = n;
				}
			})
		}),
		/* @__PURE__ */ (0, $.jsx)("mask", {
			id: `${e}-loading-mask`,
			maskUnits: "userSpaceOnUse",
			children: /* @__PURE__ */ (0, $.jsx)("rect", {
				width: "100%",
				height: "100%",
				fill: `url(#${e}-loading-mask-pattern)`
			})
		})
	] });
};
CU.Bar = wU, CU.XAxis = TU, CU.YAxis = EU, CU.Grid = DU, CU.Tooltip = OU, CU.Legend = kU, CU.Brush = aU;
// src/react/charts/chart-card.tsx
var KU = `${M({ radius: "chart" })} flex flex-col gap-4 max-sm:p-4`;
function qU({ title: e, children: t }) {
	return /* @__PURE__ */ (0, $.jsxs)("section", {
		className: KU,
		"aria-label": e,
		children: [/* @__PURE__ */ (0, $.jsx)("h3", {
			className: "text-title-2-medium text-text-primary",
			children: e
		}), /* @__PURE__ */ (0, $.jsx)("p", {
			className: "text-body-2-regular text-text-secondary",
			children: t
		})]
	});
}
var JU = (e) => (e.codePointAt(0) ?? 0) > 11903 ? 13 : 7, YU = (e) => [...new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(e)].map((e) => e.segment), XU;
function ZU(e) {
	if (XU === void 0) try {
		XU = document.createElement("canvas").getContext("2d"), XU && (XU.font = `12px ${getComputedStyle(document.body).fontFamily || "sans-serif"}`);
	} catch {
		XU = null;
	}
	return XU ? XU.measureText(e).width : null;
}
var QU = (e) => ZU(e) ?? YU(e).reduce((e, t) => e + JU(t), 0);
function $U(e, t) {
	if (QU(e) <= t) return e;
	let n = YU(e), r = 0;
	for (; r < n.length && QU(`${n.slice(0, r + 1).join("")}…`) <= t;) r += 1;
	return `${n.slice(0, r).join("")}…`;
}
var eW = (e, t = 104) => Math.min(t, Math.max(24, ...e.map(QU)) + 12);
function tW(e) {
	let { along: t, payload: n, width: r = 0, visibleTicksCount: i = 1, ...a } = e, o = String(n?.value ?? ""), s = t === "x" ? r / Math.max(1, i) - 2 : r - 8;
	return /* @__PURE__ */ (0, $.jsxs)("g", { children: [/* @__PURE__ */ (0, $.jsx)("title", { children: o }), /* @__PURE__ */ (0, $.jsx)(xk, {
		...a,
		children: $U(o, s)
	})] });
}
function nW({ title: e, figure: t, note: n }) {
	return /* @__PURE__ */ (0, $.jsxs)("header", {
		className: "flex flex-wrap items-end justify-between gap-x-4 gap-y-1",
		children: [/* @__PURE__ */ (0, $.jsxs)("span", {
			className: "flex min-w-0 flex-col gap-1",
			children: [/* @__PURE__ */ (0, $.jsx)("h3", {
				className: "text-title-2-medium text-text-primary",
				children: e
			}), /* @__PURE__ */ (0, $.jsx)("b", {
				className: "text-display-4-medium tabular-nums text-text-primary",
				children: t
			})]
		}), /* @__PURE__ */ (0, $.jsx)("small", {
			className: "min-w-0 text-caption-1-regular break-words text-text-secondary",
			children: n
		})]
	});
}
var rW = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)",
	"var(--color-chart-6)"
], iW = (e) => ({ light: [e] }), aW = (e) => `s${e}`;
function oW(e) {
	return Object.fromEntries(e.map((e, t) => [aW(t), {
		label: e,
		colors: iW(rW[t % rW.length])
	}]));
}
// src/react/charts/chart-tip.tsx
var sW = "flex min-w-32 flex-col gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl";
function cW({ swatch: e, name: t, value: n, format: r = (e) => e.toLocaleString() }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex w-full items-center gap-2",
		children: [e, /* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex flex-1 items-center justify-between gap-4 leading-none",
			children: [/* @__PURE__ */ (0, $.jsx)("span", {
				className: "text-muted-foreground",
				children: t
			}), /* @__PURE__ */ (0, $.jsx)("span", {
				className: "font-mono font-medium tabular-nums text-foreground",
				children: r(n)
			})]
		})]
	});
}
var lW = "size-2.5 shrink-0 rounded-xs";
function uW({ active: e, payload: t, label: n, nameKey: r, valueKey: i, hideLabel: a, format: o }) {
	let { config: s } = VH(), c = (t ?? []).filter((e) => e.type !== "none");
	if (!e || !c.length) return /* @__PURE__ */ (0, $.jsx)("span", { className: "p-4" });
	let l = a || typeof n != "string" ? null : s[n]?.label ?? n;
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: sW,
		children: [l ? /* @__PURE__ */ (0, $.jsx)("div", {
			className: "font-medium text-foreground",
			children: l
		}) : null, c.map((e, t) => {
			let n = e.payload ?? {}, a = `${(r ? n[r] : void 0) ?? e.name ?? e.dataKey ?? "value"}`, c = KH(s, e, a), l = i ? n[i] : e.value;
			return /* @__PURE__ */ (0, $.jsx)(cW, {
				name: c?.label ?? e.name,
				value: Number(l ?? 0),
				format: o,
				swatch: /* @__PURE__ */ (0, $.jsx)("i", {
					className: lW,
					style: { background: `var(--color-${a}-0)` }
				})
			}, a + t);
		})]
	});
}
function dW({ nameKey: e, valueKey: t, hideLabel: n, format: r }) {
	return /* @__PURE__ */ (0, $.jsx)($H, {
		cursor: !1,
		content: /* @__PURE__ */ (0, $.jsx)(uW, {
			nameKey: e,
			valueKey: t,
			hideLabel: n,
			format: r
		})
	});
}
// src/react/charts/bar-card.tsx
var fW = [0, (e) => e * 1.2];
function pW(e) {
	let t = Math.abs(e), n = (t, n) => {
		let r = e / t;
		return `${r.toLocaleString(void 0, { maximumFractionDigits: +(Math.abs(r) < 100) })}${n}`;
	};
	return t >= 1e8 ? n(1e8, "亿") : t >= 1e5 ? n(1e4, "万") : e.toLocaleString();
}
var mW = (e) => ({
	position: e,
	className: "fill-text-secondary",
	formatter: (e) => pW(Number(e))
});
function hW({ title: e, unit: t, series: n, rows: r, color: i, empty: a, layout: o = "vertical" }) {
	let s = r.filter((e) => Number.isFinite(e.value) && e.value >= 0).map((e) => ({
		name: e.name,
		value: e.value
	})), c = s.reduce((e, t) => e + t.value, 0);
	if (!c) return /* @__PURE__ */ (0, $.jsx)(qU, {
		title: e,
		children: a
	});
	let l = o === "horizontal";
	return /* @__PURE__ */ (0, $.jsxs)("section", {
		className: KU,
		"aria-label": e,
		children: [/* @__PURE__ */ (0, $.jsx)(nW, {
			title: e,
			figure: c.toLocaleString(),
			note: t
		}), /* @__PURE__ */ (0, $.jsxs)(CU, {
			data: s,
			config: { value: {
				label: n,
				colors: iW(i)
			} },
			layout: o,
			barRadius: 4,
			chartProps: l ? { margin: {
				top: 5,
				right: 56,
				bottom: 5,
				left: 5
			} } : void 0,
			className: l ? "aspect-auto h-64 flex-none text-text-secondary" : "aspect-auto h-56 flex-none text-text-secondary",
			children: [
				/* @__PURE__ */ (0, $.jsx)(CU.Grid, {}),
				l ? /* @__PURE__ */ (0, $.jsx)(CU.YAxis, {
					dataKey: "name",
					interval: 0,
					tick: /* @__PURE__ */ (0, $.jsx)(tW, { along: "y" }),
					width: eW(s.map((e) => e.name))
				}) : /* @__PURE__ */ (0, $.jsx)(CU.XAxis, {
					dataKey: "name",
					interval: 0,
					tick: /* @__PURE__ */ (0, $.jsx)(tW, { along: "x" })
				}),
				l ? /* @__PURE__ */ (0, $.jsx)(CU.XAxis, {
					hide: !0,
					domain: fW
				}) : /* @__PURE__ */ (0, $.jsx)(CU.YAxis, {
					hide: !0,
					domain: fW
				}),
				/* @__PURE__ */ (0, $.jsx)(CU.Bar, {
					dataKey: "value",
					enableHoverHighlight: !0,
					barProps: {
						dataKey: "value",
						label: mW(l ? "right" : "top")
					}
				}),
				/* @__PURE__ */ (0, $.jsx)(dW, {})
			]
		})]
	});
}
// src/react/charts/heat.ts
var gW = [
	"周一",
	"周二",
	"周三",
	"周四",
	"周五",
	"周六",
	"周日"
], _W = (e, t) => e ? Math.max(.12, e / t) : 0;
function vW(e) {
	let t = Array.from({ length: 7 }, () => Array(24).fill(0));
	for (let n of e?.hours || []) {
		let { weekday: e, hour: r, count: i } = n;
		!Number.isInteger(e) || e < 0 || e > 6 || !Number.isInteger(r) || r < 0 || r > 23 || !Number.isFinite(i) || i < 0 || (t[e][r] = (t[e][r] || 0) + i);
	}
	let n = t.flat(), r = Math.max(1, ...n);
	return {
		cells: t.flatMap((e, t) => e.map((e, n) => ({
			key: `${t}-${n}`,
			label: `${gW[t]} ${n}:00`,
			count: e,
			share: _W(e, r)
		}))),
		total: n.reduce((e, t) => e + t, 0)
	};
}
function yW(e) {
	let t = (e?.days || []).filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && Number.isFinite(e.count) && e.count >= 0).slice().sort((e, t) => e.date.localeCompare(t.date)), n = {
		cells: [],
		total: 0,
		start: "",
		end: ""
	};
	if (!t.length) return n;
	let r = /* @__PURE__ */ new Date(`${t.at(-1).date}T00:00:00Z`), i = new Date(r);
	i.setUTCDate(i.getUTCDate() - 90);
	let a = new Map(t.map((e) => [e.date, e.count])), o = Math.max(1, ...t.map((e) => e.count)), s = Array.from({ length: 91 }, (e, t) => {
		let n = new Date(i);
		n.setUTCDate(i.getUTCDate() + t);
		let r = n.toISOString().slice(0, 10), s = a.get(r) || 0;
		return {
			key: r,
			label: r,
			count: s,
			share: _W(s, o)
		};
	});
	return {
		cells: s,
		total: s.reduce((e, t) => e + t.count, 0),
		start: i.toISOString().slice(0, 10),
		end: t.at(-1).date
	};
}
// src/react/charts/heat-card.tsx
var bW = 14, xW = 17, SW = {
	4: {
		fill: "fill-chart-4",
		dot: "bg-chart-4"
	},
	5: {
		fill: "fill-chart-5",
		dot: "bg-chart-5"
	}
}, CW = {
	start: "translate-x-0",
	center: "-translate-x-1/2",
	end: "-translate-x-full"
};
function wW({ cell: e, series: t, tone: n, left: r, top: i, anchor: a }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		"aria-hidden": !0,
		style: {
			left: `${r}%`,
			top: `${i}%`
		},
		className: `pointer-events-none absolute z-10 -mt-2 -translate-y-full ${sW} ${CW[a]}`,
		children: [/* @__PURE__ */ (0, $.jsx)("div", {
			className: "font-medium text-foreground",
			children: e.label
		}), /* @__PURE__ */ (0, $.jsx)(cW, {
			name: t,
			value: e.count,
			swatch: /* @__PURE__ */ (0, $.jsx)("i", { className: `${lW} ${SW[n].dot}` })
		})]
	});
}
function TW({ title: e, words: t, cells: n, total: r, columns: i, rows: a, axis: o, footer: s, tone: c }) {
	let [l, u] = (0, P.useState)(-1), [d, f] = (0, P.useState)(0), p = (0, P.useRef)(null), m = d < n.length ? d : 0, h = o ? 30 : 0, g = o ? 18 : 0, _ = h + i * xW, v = g + a * xW, y = (e) => ({
		x: h + e % i * xW,
		y: g + Math.floor(e / i) * xW
	}), b = n[l], x = b ? y(l) : null, S = x ? (x.x + bW / 2) / _ : 0, C = S < .1 ? "start" : S > .9 ? "end" : "center", w = x ? {
		start: x.x,
		center: x.x + bW / 2,
		end: x.x + bW
	}[C] : 0, T = (e, t) => {
		let r = t - t % i, a = {
			ArrowLeft: t - 1,
			ArrowRight: t + 1,
			ArrowUp: t - i,
			ArrowDown: t + i,
			Home: r,
			End: Math.min(r + i, n.length) - 1
		}[e.key];
		a !== void 0 && (e.preventDefault(), a < 0 || a >= n.length || (f(a), p.current?.querySelector(`rect[data-cell="${a}"]`)?.focus()));
	};
	return /* @__PURE__ */ (0, $.jsxs)("section", {
		className: KU,
		children: [
			/* @__PURE__ */ (0, $.jsx)(nW, {
				title: e,
				figure: (b ? b.count : r).toLocaleString(),
				note: b ? b.label : t.unit
			}),
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, $.jsx)("div", {
					className: "min-w-0 overflow-x-auto",
					children: /* @__PURE__ */ (0, $.jsxs)("svg", {
						ref: p,
						role: "img",
						"aria-label": e,
						onPointerLeave: () => u(-1),
						viewBox: `0 0 ${_} ${v}`,
						className: o ? "block h-auto min-w-80 w-full" : "block h-auto w-full",
						children: [o, n.map((e, n) => {
							let { x: r, y: i } = y(n);
							return /* @__PURE__ */ (0, $.jsx)("rect", {
								"data-cell": n,
								tabIndex: n === m ? 0 : -1,
								role: "img",
								"aria-label": `${e.label}，${e.count} ${t.cellUnit}`,
								x: r,
								y: i,
								width: bW,
								height: bW,
								rx: 3,
								fillOpacity: e.share || 1,
								opacity: l >= 0 && l !== n ? .4 : 1,
								className: e.share ? `outline-none transition-opacity duration-200 focus-visible:stroke-border-focus-ring ${SW[c].fill}` : "fill-chart-track outline-none transition-opacity duration-200 focus-visible:stroke-border-focus-ring",
								onPointerEnter: () => u(n),
								onFocus: () => {
									u(n), f(n);
								},
								onBlur: () => u(-1),
								onKeyDown: (e) => T(e, n)
							}, e.key);
						})]
					})
				}), b && x ? /* @__PURE__ */ (0, $.jsx)(wW, {
					cell: b,
					series: t.series,
					tone: c,
					anchor: C,
					left: w / _ * 100,
					top: x.y / v * 100
				}) : null]
			}),
			/* @__PURE__ */ (0, $.jsx)("footer", {
				className: "flex flex-wrap justify-between gap-3 text-caption-1-regular text-text-secondary",
				children: s
			})
		]
	});
}
var EW = /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [gW.map((e, t) => /* @__PURE__ */ (0, $.jsx)("text", {
	x: 0,
	y: 18 + t * xW + 7,
	dominantBaseline: "middle",
	className: "fill-text-secondary text-caption-1-regular",
	children: e
}, e)), Array.from({ length: 24 }, (e, t) => t % 2 ? null : /* @__PURE__ */ (0, $.jsx)("text", {
	x: 30 + t * xW,
	y: 8,
	dominantBaseline: "middle",
	className: "fill-text-secondary text-caption-1-regular",
	children: t
}, t))] });
function DW({ activity: e, title: t, dailyTitle: n, words: r, tone: i, empty: a }) {
	let o = vW(e), s = yW(e);
	return s.cells.length ? /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "inline-grid w-full items-start gap-5 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, $.jsx)(TW, {
			title: t,
			words: r,
			tone: i,
			cells: o.cells,
			total: o.total,
			columns: 24,
			rows: 7,
			axis: EW,
			footer: /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("span", { children: "星期 × 小时" }), /* @__PURE__ */ (0, $.jsx)("span", { children: e?.timezone || "UTC+08:00" })] })
		}), /* @__PURE__ */ (0, $.jsx)(TW, {
			title: n,
			words: r,
			tone: i,
			cells: s.cells,
			total: s.total,
			columns: 13,
			rows: 7,
			footer: /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("span", { children: s.start }), /* @__PURE__ */ (0, $.jsx)("span", { children: s.end })] })
		})]
	}) : /* @__PURE__ */ (0, $.jsx)(qU, {
		title: t,
		children: a
	});
}
// src/react/components/expandable-ranking.tsx
function OW({ children: e, className: t = "", previewCount: n = 10 }) {
	let r = (0, P.useId)(), i = (0, P.useRef)(null), [a, o] = (0, P.useState)(!1), [s, c] = (0, P.useState)(!1), l = P.Children.toArray(e), u = l.length > n;
	(0, P.useLayoutEffect)(() => {
		let e = i.current;
		if (!e || !u) return;
		let t = () => {
			let t = e.children[Math.min(n, e.children.length) - 1];
			t && e.offsetWidth && (e.style.setProperty("--ranking-collapsed-height", `${t.offsetTop - e.offsetTop + t.offsetHeight}px`), e.style.setProperty("--ranking-expanded-height", `${e.scrollHeight}px`));
		};
		t();
		let r = new ResizeObserver(t);
		return r.observe(e), () => r.disconnect();
	}, [
		u,
		n,
		l.length
	]);
	let d = l.map((e, t) => !(0, P.isValidElement)(e) || t < n ? e : (0, P.cloneElement)(e, { inert: !a || void 0 }));
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		"data-expandable-ranking": !0,
		"data-expandable": u || void 0,
		"data-expanded": a || void 0,
		"data-animating": s || void 0,
		children: [/* @__PURE__ */ (0, $.jsx)("ol", {
			id: r,
			ref: i,
			"data-expandable-ranking-list": !0,
			className: t,
			onTransitionEnd: (e) => {
				e.target === i.current && e.propertyName === "max-height" && c(!1);
			},
			children: d
		}), u ? /* @__PURE__ */ (0, $.jsx)("button", {
			type: "button",
			"data-ranking-toggle": !0,
			"aria-controls": r,
			"aria-expanded": a,
			"aria-label": a ? "收起排名" : "展开更多排名",
			onClick: () => {
				c(!0), o((e) => !e);
			},
			children: /* @__PURE__ */ (0, $.jsx)(re, { "aria-hidden": !0 })
		}) : null]
	});
}
// src/react/evilcharts/registry/charts/recharts-radial-chart.tsx
var kW = "30%", AW = "100%", jW = 5, MW = 14, NW = 5, PW = 1500, FW = (0, P.createContext)(null);
function IW() {
	let e = (0, P.use)(FW);
	if (!e) throw Error("Radial chart parts (<RadialBar />, <Tooltip />, …) must be used within <EvilRadialChart />");
	return e;
}
function LW({ config: e, data: t, nameKey: n, children: r, className: i, chartProps: a, variant: o = "full", max: s, innerRadius: c = kW, outerRadius: l = AW, defaultSelectedDataKey: u = null, onSelectionChange: d, isLoading: f = !1, backgroundVariant: p }) {
	let m = (0, P.useId)().replace(/:/g, ""), [h, g] = (0, P.useState)(u), _ = WW(f), v = VW(o), y = (0, P.useCallback)((e, t) => {
		g(e), d?.(e === null ? null : {
			dataKey: e,
			value: t ?? 0
		});
	}, [d]), b = (0, P.useMemo)(() => t.map((e) => ({
		...e,
		fill: `url(#${m}-radial-colors-${e[n]})`
	})), [
		t,
		n,
		m
	]), x = (0, P.useMemo)(() => ({
		config: e,
		nameKey: n,
		chartId: m,
		isLoading: f,
		selectedBar: h,
		selectBar: y
	}), [
		e,
		n,
		m,
		f,
		h,
		y
	]);
	return /* @__PURE__ */ (0, $.jsx)(FW, {
		value: x,
		children: /* @__PURE__ */ (0, $.jsxs)(HH, {
			className: i,
			config: e,
			children: [/* @__PURE__ */ (0, $.jsx)(UH, { isLoading: f }), /* @__PURE__ */ (0, $.jsxs)(FH, {
				id: m,
				data: f ? _ : b,
				innerRadius: c,
				outerRadius: l,
				startAngle: v.startAngle,
				endAngle: v.endAngle,
				cx: v.cx,
				cy: v.cy,
				...a,
				children: [
					s != null && s > 0 && /* @__PURE__ */ (0, $.jsx)(lj, {
						type: "number",
						domain: [0, s],
						tick: !1,
						axisLine: !1
					}),
					p && /* @__PURE__ */ (0, $.jsx)(pU, { variant: p }),
					r,
					f && /* @__PURE__ */ (0, $.jsx)(GW, {}),
					/* @__PURE__ */ (0, $.jsx)("defs", { children: /* @__PURE__ */ (0, $.jsx)(HW, {
						config: e,
						chartId: m
					}) })
				]
			})]
		})
	});
}
function RW({ dataKey: e, cornerRadius: t = jW, barSize: n = MW, showBackground: r = !0, isClickable: i = !1, radialBarProps: a }) {
	let { nameKey: o, isLoading: s, selectedBar: c, selectBar: l } = IW();
	return s ? null : /* @__PURE__ */ (0, $.jsx)(wP, {
		dataKey: e,
		cornerRadius: t,
		barSize: n,
		background: r,
		className: "drop-shadow-sm",
		style: i ? { cursor: "pointer" } : void 0,
		onClick: (t, n) => {
			if (!i) return;
			let r = t, a = r?.[o] ?? String(n), s = Number(r?.[e] ?? 0);
			l(c === a ? null : a, s);
		},
		shape: (e) => {
			let t = e[o], n = c === null || c === t;
			return /* @__PURE__ */ (0, $.jsx)(sh, {
				...e,
				opacity: i && !n ? .15 : 1,
				className: "transition-opacity duration-200"
			});
		},
		...a
	});
}
function zW({ variant: e, roundness: t, defaultIndex: n }) {
	let { nameKey: r, isLoading: i } = IW();
	return i ? null : /* @__PURE__ */ (0, $.jsx)($H, {
		defaultIndex: n,
		cursor: !1,
		content: /* @__PURE__ */ (0, $.jsx)(ZH, {
			nameKey: r,
			hideLabel: !0,
			roundness: t,
			variant: e
		})
	});
}
function BW({ variant: e, align: t = "center", verticalAlign: n = "bottom", isClickable: r = !1 }) {
	let { nameKey: i, isLoading: a, selectedBar: o, selectBar: s } = IW();
	return a ? null : /* @__PURE__ */ (0, $.jsx)(iU, {
		verticalAlign: n,
		align: t,
		content: /* @__PURE__ */ (0, $.jsx)(eU, {
			selected: o,
			onSelectChange: s,
			isClickable: r,
			nameKey: i,
			variant: e
		})
	});
}
function VW(e) {
	switch (e) {
		case "semi": return {
			startAngle: 180,
			endAngle: 0,
			cx: "50%",
			cy: "70%"
		};
		default: return {
			startAngle: 90,
			endAngle: -270,
			cx: "50%",
			cy: "50%"
		};
	}
}
var HW = ({ config: e, chartId: t }) => /* @__PURE__ */ (0, $.jsx)($.Fragment, { children: Object.entries(e).map(([e, n]) => {
	let r = qH(n);
	return /* @__PURE__ */ (0, $.jsx)("linearGradient", {
		id: `${t}-radial-colors-${e}`,
		x1: "0",
		y1: "0",
		x2: "1",
		y2: "1",
		children: r === 1 ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "0%",
			stopColor: `var(--color-${e}-0)`
		}), /* @__PURE__ */ (0, $.jsx)("stop", {
			offset: "100%",
			stopColor: `var(--color-${e}-0)`
		})] }) : Array.from({ length: r }, (t, n) => {
			let i = `${n / (r - 1) * 100}%`;
			return /* @__PURE__ */ (0, $.jsx)("stop", {
				offset: i,
				stopColor: `var(--color-${e}-${n}, var(--color-${e}-0))`
			}, i);
		})
	}, `${t}-radial-colors-${e}`);
}) });
function UW() {
	return Array.from({ length: NW }, (e, t) => ({
		name: `loading${t}`,
		value: 40 + Math.random() * 60
	}));
}
function WW(e) {
	let [t, n] = (0, P.useState)(0);
	return (0, P.useEffect)(() => {
		if (!e) return;
		let t = setInterval(() => {
			n((e) => e + 1);
		}, PW);
		return () => clearInterval(t);
	}, [e]), (0, P.useMemo)(() => UW(), [t]);
}
var GW = () => /* @__PURE__ */ (0, $.jsx)(wP, {
	dataKey: "value",
	cornerRadius: jW,
	barSize: MW,
	background: !0,
	isAnimationActive: !0,
	animationDuration: PW,
	animationEasing: "ease-in-out",
	shape: (e) => /* @__PURE__ */ (0, $.jsx)(sh, {
		...e,
		fill: "currentColor",
		fillOpacity: .25
	})
});
LW.RadialBar = RW, LW.Tooltip = zW, LW.Legend = BW;
// src/react/stats/radial-card.tsx
var KW = [
	"bg-chart-1",
	"bg-chart-2",
	"bg-chart-3",
	"bg-chart-4",
	"bg-chart-5",
	"bg-chart-6"
], qW = [
	"aria-pressed:bg-chart-1/10 aria-pressed:ring-chart-1",
	"aria-pressed:bg-chart-2/10 aria-pressed:ring-chart-2",
	"aria-pressed:bg-chart-3/10 aria-pressed:ring-chart-3",
	"aria-pressed:bg-chart-4/10 aria-pressed:ring-chart-4",
	"aria-pressed:bg-chart-5/10 aria-pressed:ring-chart-5",
	"aria-pressed:bg-chart-6/10 aria-pressed:ring-chart-6"
];
function JW({ title: e, rows: t, empty: n, unit: r = "个视频" }) {
	let [i, a] = (0, P.useState)(-1), [o, s] = (0, P.useState)(-1), c = Se(t);
	if (!c.length) return /* @__PURE__ */ (0, $.jsx)(qU, {
		title: e,
		children: n
	});
	let l = o >= 0 ? o : i, u = c.reduce((e, t) => e + t.value, 0), d = c[l], f = (e) => a((t) => t === e ? -1 : e), p = xe(c.map((e) => e.value)), m = c.map((e, t) => ({
		slice: aW(t),
		count: e.value,
		arc: ye(e.value, p)
	}));
	return /* @__PURE__ */ (0, $.jsxs)("section", {
		className: KU,
		children: [
			/* @__PURE__ */ (0, $.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-x-4 gap-y-1",
				children: [/* @__PURE__ */ (0, $.jsxs)("span", {
					className: "flex min-w-0 flex-col gap-1",
					children: [/* @__PURE__ */ (0, $.jsxs)("h3", {
						className: "flex items-center gap-1.5 text-title-2-medium wrap-anywhere text-text-primary",
						children: [d?.mark ? /* @__PURE__ */ (0, $.jsx)(v, { mark: d.mark }) : null, d ? d.name : e]
					}), /* @__PURE__ */ (0, $.jsx)("b", {
						className: "text-display-4-medium tabular-nums text-text-primary",
						children: (d ? d.value : u).toLocaleString()
					})]
				}), /* @__PURE__ */ (0, $.jsx)("small", {
					className: "text-caption-1-regular text-text-secondary",
					children: r
				})]
			}),
			/* @__PURE__ */ (0, $.jsx)("div", {
				role: "img",
				"aria-label": e,
				onPointerLeave: () => s(-1),
				children: /* @__PURE__ */ (0, $.jsxs)(LW, {
					data: m,
					nameKey: "slice",
					config: oW(c.map((e) => e.name)),
					max: p,
					innerRadius: "22%",
					className: "aspect-auto h-75 max-sm:h-65",
					children: [/* @__PURE__ */ (0, $.jsx)(LW.RadialBar, {
						dataKey: "arc",
						barSize: be(c.length),
						radialBarProps: {
							shape: (e) => /* @__PURE__ */ (0, $.jsx)(sh, {
								...e,
								opacity: l >= 0 && l !== e.index ? .3 : 1,
								className: "cursor-pointer transition-opacity duration-200"
							}),
							onClick: (e, t) => f(t),
							onMouseEnter: (e, t) => s(t)
						}
					}), /* @__PURE__ */ (0, $.jsx)(dW, {
						nameKey: "slice",
						valueKey: "count",
						hideLabel: !0
					})]
				})
			}),
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: "inline-grid w-full grid-cols-3 gap-2 max-sm:grid-cols-2",
				children: c.map((e, t) => /* @__PURE__ */ (0, $.jsxs)("button", {
					type: "button",
					"aria-pressed": i === t,
					onClick: () => f(t),
					onPointerEnter: () => s(t),
					onPointerLeave: () => s(-1),
					onFocus: () => s(t),
					onBlur: () => s(-1),
					className: `flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-xl bg-background-tertiary-default p-2.5 text-left outline-none aria-pressed:ring-1 aria-pressed:ring-inset focus-visible:ring-2 focus-visible:ring-border-focus-ring ${qW[t % 6]}`,
					children: [
						/* @__PURE__ */ (0, $.jsxs)("span", {
							className: "flex min-w-0 max-w-full items-start gap-1.5 text-caption-1-regular text-text-secondary",
							children: [/* @__PURE__ */ (0, $.jsx)("i", {
								"aria-hidden": !0,
								className: `mt-0.5 size-3 shrink-0 rounded-sm ${KW[t % 6]}`
							}), /* @__PURE__ */ (0, $.jsxs)("span", {
								className: "inline-flex min-w-0 items-start gap-1.5 wrap-anywhere",
								children: [e.mark ? /* @__PURE__ */ (0, $.jsx)(v, { mark: e.mark }) : null, e.name]
							})]
						}),
						/* @__PURE__ */ (0, $.jsx)("b", {
							className: "text-title-2-medium tabular-nums text-text-primary",
							children: e.value.toLocaleString()
						}),
						e.bytes == null ? null : /* @__PURE__ */ (0, $.jsx)("small", {
							className: "text-caption-1-regular text-text-secondary",
							children: oe(e.bytes)
						})
					]
				}, aW(t)))
			})
		]
	});
}
// src/react/stats/stats-page.tsx
var YW = a, XW = 10, ZW = rW[5], QW = rW[4], $W = `${M()} flex flex-col gap-4`, eG = "添加媒体目录或关注来源后，这里会显示馆藏统计。", tG = "补全资料或添加标签后，这里会显示馆藏中的内容标签。", nG = "开始播放后，这里会显示最近的真实观看证据。", rG = "补充作品资料或手动添加标签后，这里会显示各个标签来源对应的视频数量。", iG = "添加媒体目录后，这里会显示存储空间。", aG = "把媒体目录归进媒体库后，这里会按库显示视频数。", oG = "探测时长后，这里会显示时长分布。", sG = "探测画质后，这里会显示画质分布。", cG = "开始播放后，这里会显示播放落在一周的哪些时段。", lG = "开始播放后，这里会显示每个作品播了几次。", uG = (e, t) => Math.min(Math.max(e, 0), t);
function dG({ term: e, value: t }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex min-h-16 min-w-0 flex-col gap-1.5 rounded-2lg bg-background-primary-default p-3",
		children: [/* @__PURE__ */ (0, $.jsx)("span", {
			className: "text-caption-1-regular text-text-secondary",
			children: e
		}), /* @__PURE__ */ (0, $.jsx)("b", {
			className: "text-title-3-medium tabular-nums text-text-primary",
			children: ae(t)
		})]
	});
}
function fG({ term: e, value: t, total: n }) {
	let r = Math.max(n, 1);
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col gap-1.5 border-b border-separator-border py-3 last:border-b-0",
		children: [/* @__PURE__ */ (0, $.jsxs)("p", {
			className: "flex items-baseline justify-between gap-3 text-body-2-regular text-text-primary",
			children: [/* @__PURE__ */ (0, $.jsx)("span", { children: e }), /* @__PURE__ */ (0, $.jsxs)("b", {
				className: "tabular-nums",
				children: [ae(t), ue(t) ? /* @__PURE__ */ (0, $.jsx)("span", {
					className: "ml-1.5 text-caption-1-regular text-text-secondary",
					children: ge(t, n)
				}) : null]
			})]
		}), /* @__PURE__ */ (0, $.jsx)(f, {
			meter: !0,
			label: `${e}：${ae(t)} / ${n.toLocaleString()}`,
			value: ue(t) ? uG(t, r) : 0,
			max: r
		})]
	});
}
function pG({ term: e, figure: t, unit: n }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex shrink-0 flex-col gap-0.5 pb-5 md:w-64 md:pr-6 md:pb-0",
		children: [
			/* @__PURE__ */ (0, $.jsx)("span", {
				className: "text-caption-1-regular text-text-secondary",
				children: e
			}),
			/* @__PURE__ */ (0, $.jsx)("b", {
				className: "text-display-4-medium tabular-nums text-text-primary",
				children: t
			}),
			/* @__PURE__ */ (0, $.jsx)("span", {
				className: "text-body-2-regular text-text-secondary",
				children: n
			})
		]
	});
}
function mG({ headline: e, children: t }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: `${$W} md:flex-row md:gap-6`,
		children: [e, /* @__PURE__ */ (0, $.jsx)("div", {
			className: "min-w-0 grow",
			children: t
		})]
	});
}
function hG({ data: e }) {
	return e.by_loc.reduce((e, t) => e + t.videos, 0) ? /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "inline-grid w-full gap-5 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, $.jsx)(JW, {
				title: "网盘与本地",
				empty: eG,
				rows: e.by_loc.map((e) => ({
					name: s[e.k] ?? e.k,
					value: e.videos,
					bytes: e.bytes,
					mark: c[e.k] || "database"
				}))
			}), /* @__PURE__ */ (0, $.jsx)(JW, {
				title: "媒体库",
				empty: aG,
				rows: e.by_library.map((e) => ({
					name: e.name,
					value: e.videos,
					bytes: e.bytes,
					mark: c[e.icon] || e.icon || "database"
				}))
			})]
		}), /* @__PURE__ */ (0, $.jsxs)("div", {
			className: "inline-grid w-full gap-5 md:grid-cols-2 xl:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, $.jsx)(hW, {
					title: "时长",
					unit: "个视频",
					series: "视频",
					color: ZW,
					rows: de(e.by_length),
					empty: oG
				}),
				/* @__PURE__ */ (0, $.jsx)(hW, {
					title: "画质",
					unit: "个视频",
					series: "视频",
					color: ZW,
					rows: k(e.by_quality),
					empty: sG
				}),
				/* @__PURE__ */ (0, $.jsx)(hW, {
					title: "文件类型",
					unit: "个条目",
					series: "条目",
					color: ZW,
					layout: "horizontal",
					rows: pe(e.by_medium),
					empty: eG
				})
			]
		})]
	}) : /* @__PURE__ */ (0, $.jsx)(o, {
		icon: u,
		title: "还没有视频",
		actions: /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(i, {
			variant: "secondary",
			href: "/subscriptions?tab=add",
			size: "small",
			children: "添加关注"
		}), /* @__PURE__ */ (0, $.jsx)(i, {
			variant: "primary",
			href: YW,
			size: "small",
			children: "添加媒体"
		})] }),
		children: eG
	});
}
function gG({ data: e }) {
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(DW, {
		activity: e.play_activity,
		title: "播放时间",
		dailyTitle: "每日播放",
		words: {
			unit: "个作品",
			series: "作品",
			cellUnit: "个作品"
		},
		tone: 5,
		empty: cG
	}), /* @__PURE__ */ (0, $.jsx)(hW, {
		title: "播放次数",
		unit: "个作品",
		series: "作品",
		color: QW,
		rows: we(e.replays),
		empty: lG
	})] });
}
function _G({ attribution: e }) {
	let t = e.videos;
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col",
		children: [
			/* @__PURE__ */ (0, $.jsx)(fG, {
				term: "有创作者",
				value: e.creator,
				total: t
			}),
			/* @__PURE__ */ (0, $.jsx)(fG, {
				term: "有番号",
				value: e.code,
				total: t
			}),
			/* @__PURE__ */ (0, $.jsx)(fG, {
				term: "有厂牌",
				value: e.studio,
				total: t
			}),
			/* @__PURE__ */ (0, $.jsx)(fG, {
				term: "已抽帧",
				value: e.thumb,
				total: t
			}),
			/* @__PURE__ */ (0, $.jsx)(fG, {
				term: "已探测时长",
				value: e.duration,
				total: t
			})
		]
	});
}
function vG({ volume: e }) {
	let t = e.total, n = e.used ?? 0;
	return /* @__PURE__ */ (0, $.jsxs)("article", {
		className: "flex min-w-0 flex-col gap-1.5 border-b border-separator-border py-3 last:border-b-0",
		children: [
			/* @__PURE__ */ (0, $.jsxs)("header", {
				className: "flex items-baseline justify-between gap-3 text-body-2-regular text-text-primary",
				children: [/* @__PURE__ */ (0, $.jsx)("h3", {
					className: "min-w-0 break-words",
					children: e.label
				}), t == null ? e.online ? /* @__PURE__ */ (0, $.jsx)(b, { children: "容量未取得" }) : /* @__PURE__ */ (0, $.jsx)(Be, { online: !1 }) : /* @__PURE__ */ (0, $.jsxs)("b", {
					className: "whitespace-nowrap tabular-nums",
					children: [oe(n), /* @__PURE__ */ (0, $.jsx)("span", {
						className: "ml-1.5 text-caption-1-regular text-text-secondary",
						children: ge(n, t)
					})]
				})]
			}),
			t == null ? null : /* @__PURE__ */ (0, $.jsx)(f, {
				meter: !0,
				label: `${e.label}空间使用率`,
				value: uG(n, Math.max(t, 1)),
				max: Math.max(t, 1)
			}),
			/* @__PURE__ */ (0, $.jsxs)("p", {
				className: "flex justify-between gap-3 text-caption-1-regular text-text-secondary",
				children: [/* @__PURE__ */ (0, $.jsx)("span", {
					className: "min-w-0 break-words",
					children: e.root ?? "未映射"
				}), t == null ? null : /* @__PURE__ */ (0, $.jsx)("span", {
					className: "whitespace-nowrap tabular-nums",
					children: `可用 ${oe(e.free ?? 0)} · 共 ${oe(t)}`
				})]
			})
		]
	});
}
function yG({ volumes: e }) {
	return e.length ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: "flex flex-col",
		children: e.map((e) => /* @__PURE__ */ (0, $.jsx)(vG, { volume: e }, `${e.kind}:${e.label}`))
	}) : /* @__PURE__ */ (0, $.jsx)(o, {
		icon: S,
		title: "还没有存储来源",
		actions: /* @__PURE__ */ (0, $.jsx)(i, {
			variant: "primary",
			href: YW,
			size: "small",
			children: "添加媒体"
		}),
		children: iG
	});
}
function bG({ tags: e, tagLabel: t, onTag: n, hasMedia: r }) {
	return e.length ? /* @__PURE__ */ (0, $.jsx)(OW, {
		previewCount: XW,
		className: "inline-grid w-full gap-x-6 gap-y-1 sm:grid-cols-2",
		children: e.map((e, r) => /* @__PURE__ */ (0, $.jsx)("li", {
			className: "min-w-0",
			children: /* @__PURE__ */ (0, $.jsxs)("button", {
				type: "button",
				onClick: () => n(e.k),
				className: "flex min-h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
				children: [
					/* @__PURE__ */ (0, $.jsx)("span", {
						className: "w-6 shrink-0 text-caption-1-regular tabular-nums text-text-secondary",
						children: r + 1
					}),
					/* @__PURE__ */ (0, $.jsx)("span", {
						className: "min-w-0 grow text-body-2-regular break-words text-text-primary",
						children: t(e.k)
					}),
					/* @__PURE__ */ (0, $.jsx)("b", {
						className: "text-body-2-medium tabular-nums text-text-secondary",
						children: e.n.toLocaleString()
					})
				]
			})
		}, `${e.k}:${r}`))
	}) : /* @__PURE__ */ (0, $.jsx)(o, {
		icon: fe,
		title: "还没有内容标签",
		actions: /* @__PURE__ */ (0, $.jsx)(i, {
			variant: "secondary",
			href: r ? "/data-cleanup" : YW,
			size: "small",
			children: r ? "补全资料" : "添加媒体"
		}),
		children: tG
	});
}
function xG({ rows: e, hasMedia: t }) {
	return e.length ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: "flex flex-col gap-5",
		children: e.map((e) => {
			let t = ze(e);
			return /* @__PURE__ */ (0, $.jsxs)("article", {
				className: "flex flex-wrap items-center gap-x-6 gap-y-2",
				children: [/* @__PURE__ */ (0, $.jsxs)("div", {
					className: "min-w-0 grow basis-64",
					children: [/* @__PURE__ */ (0, $.jsx)("h3", {
						className: "min-w-0 text-body-2-medium text-text-primary",
						children: /* @__PURE__ */ (0, $.jsx)("a", {
							href: ve(e),
							"data-middle-truncate": !0,
							className: "block max-w-full overflow-hidden whitespace-nowrap hover:underline",
							children: e.name
						})
					}), /* @__PURE__ */ (0, $.jsxs)("p", {
						className: "flex flex-wrap gap-3 text-caption-1-regular text-text-secondary",
						children: [e.creator ? /* @__PURE__ */ (0, $.jsx)("span", {
							className: "min-w-0 wrap-anywhere",
							children: e.creator
						}) : null, /* @__PURE__ */ (0, $.jsx)("span", { children: Re(e) })]
					})]
				}), /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "min-w-0 basis-40",
					children: [/* @__PURE__ */ (0, $.jsx)(f, {
						meter: !0,
						label: `真实观看 ${t.toFixed(0)}%`,
						value: t
					}), /* @__PURE__ */ (0, $.jsx)("small", {
						className: "mt-1.5 block text-caption-1-regular text-text-secondary",
						children: `真实 ${t.toFixed(0)}% · 到达 ${Ce(e).toFixed(0)}%`
					})]
				})]
			}, `${e.kind}:${e.id}`);
		})
	}) : /* @__PURE__ */ (0, $.jsx)(o, {
		icon: Ne,
		title: "还没有观看记录",
		actions: /* @__PURE__ */ (0, $.jsx)(i, {
			variant: "secondary",
			href: t ? "/" : YW,
			size: "small",
			children: t ? "浏览馆藏" : "添加媒体"
		}),
		children: nG
	});
}
function SG({ sources: e, videos: t }) {
	return e.length ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: "inline-grid w-full gap-x-8 gap-y-6 sm:grid-cols-2",
		children: e.map((e) => /* @__PURE__ */ (0, $.jsxs)("article", {
			className: "flex min-w-0 flex-col gap-1.5",
			children: [
				/* @__PURE__ */ (0, $.jsxs)("header", {
					className: "flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, $.jsx)("h3", {
						className: "min-w-0 text-body-2-medium break-words text-text-primary",
						children: e.k
					}), /* @__PURE__ */ (0, $.jsxs)("b", {
						className: "text-body-2-medium whitespace-nowrap text-text-primary",
						children: [e.assets.toLocaleString(), /* @__PURE__ */ (0, $.jsx)("small", {
							className: "ml-1 text-caption-1-regular font-normal text-text-secondary",
							children: "个视频"
						})]
					})]
				}),
				/* @__PURE__ */ (0, $.jsx)(f, {
					meter: !0,
					label: `${e.k} 覆盖视频`,
					value: uG(e.assets, Math.max(t, 1)),
					max: Math.max(t, 1)
				}),
				/* @__PURE__ */ (0, $.jsxs)("small", {
					className: "text-caption-1-regular text-text-secondary",
					children: [e.n.toLocaleString(), " 条标签"]
				})
			]
		}, e.k))
	}) : /* @__PURE__ */ (0, $.jsx)(o, {
		icon: fe,
		title: "还没有标签来源",
		actions: /* @__PURE__ */ (0, $.jsx)(i, {
			variant: "secondary",
			href: t ? "/data-cleanup" : YW,
			size: "small",
			children: t ? "补全资料" : "添加媒体"
		}),
		children: rG
	});
}
function CG({ id: e, label: n, figure: r, detail: i, icon: a, accent: o }) {
	return /* @__PURE__ */ (0, $.jsx)(t, {
		id: e,
		className: je({
			interactive: !0,
			selectable: !0
		}),
		children: /* @__PURE__ */ (0, $.jsx)(y, {
			label: n,
			icon: a,
			accent: o,
			figure: r,
			footer: i
		})
	});
}
function wG(i) {
	let a = Ie({
		queryKey: h,
		queryFn: ({ signal: e }) => ie(e)
	}), o = a.data;
	if (!o) return /* @__PURE__ */ (0, $.jsx)(Ve, { children: /* @__PURE__ */ (0, $.jsx)(d, {
		tone: "error",
		title: "馆藏统计读取失败",
		children: a.error ? ne(a.error) : "未取得统计数据，请刷新页面重试。"
	}) });
	let s = o.consumption, c = o.storage_summary, l = o.by_loc.reduce((e, t) => e + t.videos, 0), u = o.by_loc.reduce((e, t) => e + t.bytes, 0), f = ue(o.tag_cov) ? ge(o.tag_cov, o.attribution.videos) : "未取得", v = `${ae(o.tag_cov)} / ${o.attribution.videos.toLocaleString()}`;
	return /* @__PURE__ */ (0, $.jsxs)(Ve, { children: [/* @__PURE__ */ (0, $.jsxs)(n, {
		defaultSelectedKey: "inventory",
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, $.jsxs)(r, {
				"aria-label": "统计视图",
				className: g,
				children: [
					/* @__PURE__ */ (0, $.jsx)(CG, {
						id: "inventory",
						label: "馆藏视频",
						icon: w,
						accent: 0,
						figure: l.toLocaleString(),
						detail: oe(u)
					}),
					/* @__PURE__ */ (0, $.jsx)(CG, {
						id: "viewing",
						label: "看过",
						icon: C,
						accent: 1,
						figure: ae(s.played),
						detail: _e(s.play_seconds)
					}),
					/* @__PURE__ */ (0, $.jsx)(CG, {
						id: "coverage",
						label: "内容标签",
						icon: fe,
						accent: 2,
						figure: f,
						detail: v
					}),
					/* @__PURE__ */ (0, $.jsx)(CG, {
						id: "storage",
						label: "使用空间",
						icon: S,
						accent: 3,
						figure: `${c.online.toLocaleString()} 个卷`,
						detail: c.measured ? `已用 ${oe(c.used)}` : "容量未取得"
					})
				]
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "inventory",
				children: /* @__PURE__ */ (0, $.jsx)(hG, {
					data: o,
					...i
				})
			}),
			/* @__PURE__ */ (0, $.jsxs)(e, {
				id: "viewing",
				className: "flex flex-col gap-5",
				children: [/* @__PURE__ */ (0, $.jsx)(mG, {
					headline: /* @__PURE__ */ (0, $.jsx)(pG, {
						term: "观看",
						figure: ae(s.played),
						unit: "个作品有播放记录"
					}),
					children: /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "inline-grid w-full gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, $.jsx)(dG, {
								term: "馆藏观看",
								value: s.library_played
							}),
							/* @__PURE__ */ (0, $.jsx)(dG, {
								term: "在线直接观看",
								value: s.online_played
							}),
							/* @__PURE__ */ (0, $.jsx)(dG, {
								term: "高潮计数",
								value: s.o_total
							}),
							/* @__PURE__ */ (0, $.jsx)(dG, {
								term: "快进扫过",
								value: s.skimmed
							}),
							/* @__PURE__ */ (0, $.jsx)(dG, {
								term: "喜欢",
								value: s.liked
							}),
							/* @__PURE__ */ (0, $.jsx)(dG, {
								term: "明确不喜欢",
								value: s.dislike
							}),
							/* @__PURE__ */ (0, $.jsx)(dG, {
								term: "看过了",
								value: s.seen
							}),
							/* @__PURE__ */ (0, $.jsx)(dG, {
								term: "回收站",
								value: s.trash
							})
						]
					})
				}), /* @__PURE__ */ (0, $.jsx)(gG, { data: o })]
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "coverage",
				children: /* @__PURE__ */ (0, $.jsx)(mG, {
					headline: /* @__PURE__ */ (0, $.jsx)(pG, {
						term: "内容标签覆盖",
						figure: f,
						unit: v
					}),
					children: /* @__PURE__ */ (0, $.jsx)(_G, { attribution: o.attribution })
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "storage",
				children: /* @__PURE__ */ (0, $.jsx)(mG, {
					headline: /* @__PURE__ */ (0, $.jsx)(pG, {
						term: "使用空间",
						figure: c.measured.toLocaleString(),
						unit: "个卷已取得容量"
					}),
					children: /* @__PURE__ */ (0, $.jsx)(yG, {
						volumes: o.storage_volumes,
						...i
					})
				})
			})
		]
	}), /* @__PURE__ */ (0, $.jsxs)(n, {
		defaultSelectedKey: "tags",
		className: `${M({ padding: "none" })} flex flex-col`,
		children: [
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: "px-4 pt-3",
				children: /* @__PURE__ */ (0, $.jsxs)(_, {
					"aria-label": "统计维度",
					className: m,
					children: [
						/* @__PURE__ */ (0, $.jsx)(t, {
							id: "tags",
							className: p,
							children: "内容标签"
						}),
						/* @__PURE__ */ (0, $.jsx)(t, {
							id: "recent",
							className: p,
							children: "最近看过"
						}),
						/* @__PURE__ */ (0, $.jsx)(t, {
							id: "sources",
							className: p,
							children: "标签来源"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "tags",
				className: "px-4 pt-3.5 pb-4",
				children: /* @__PURE__ */ (0, $.jsx)(bG, {
					tags: o.top_tags,
					hasMedia: l > 0,
					...i
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "recent",
				className: "px-4 pt-3.5 pb-4",
				children: /* @__PURE__ */ (0, $.jsx)(xG, {
					rows: o.recent,
					hasMedia: l > 0
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "sources",
				className: "px-4 pt-3.5 pb-4",
				children: /* @__PURE__ */ (0, $.jsx)(SG, {
					sources: o.tag_source,
					videos: o.attribution.videos
				})
			})
		]
	})] });
}
export { wG as StatsPage };

//# debugId=d1116401-bf29-43cf-a21a-0e43ed0f6006