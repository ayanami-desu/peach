(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "4b196502-d837-44d0-a528-e9c4c31473db", e._sentryDebugIdIdentifier = "sentry-dbid-4b196502-d837-44d0-a528-e9c4c31473db");
	} catch {}
})();
import { $b4f18e3395fe64d7$export$3d96ec278d3efce4 as e, $b4f18e3395fe64d7$export$3e41faf802a29e71 as t, $b4f18e3395fe64d7$export$b2539bed5023c21c as n, $b4f18e3395fe64d7$export$e51a686c67fdaa2d as r, ButtonLink as i, DRIVE_SETTINGS_PATH as a, EmptyState as o, LOC as s, MEDIA_SOURCE_ICONS as c, MotionConfigContext as l, NR as u, Note as d, Progress as f, SEGMENT as p, SEGMENTED_TRACK as m, STATS_KEY as h, STAT_STRIP as g, SegmentedTabList as _, SourceMark as v, StatCard as y, StatusLabel as b, WithPromise as x, Xc as S, Xt as C, _8 as w, __commonJSMin as T, __exportAll as E, __toESM as D, asNumber as O, bandRows as k, calcGeneratorVelocity as A, cancelFrame as j, cardClass as M, clsx as N, collectMotionValues as ee, cx as te, errorMessage as ne, f1 as re, fetchStats as ie, fmtCount as ae, fmtSize as oe, frame as se, interpolate as ce, isMotionValue as le, known as ue, lengthRows as de, mM as fe, mediumRows as pe, motion as me, motionValue as he, percentText as ge, playedFor as _e, playedItemUrl as ve, radialArc as ye, radialBarSize as be, radialCeiling as xe, radialSlices as Se, reachedShare as Ce, replayRows as we, require_jsx_runtime as Te, require_react as Ee, require_react_dom as De, require_with_selector as Oe, resolveStartTime as ke, spring as Ae, statCardClass as je, time as Me, uo as Ne, useConstant as Pe, useIsomorphicLayoutEffect as Fe, useQuery as Ie, useReducedMotion as Le, watchNote as Re, watchedShare as ze } from "./peach-app.js";
import { Page as Be } from "./peach-app.page-QAncjzM1.js";
// ../../../peach/frontend/node_modules/motion-dom/dist/es/utils/transform.mjs
function Ve(...e) {
	let t = !Array.isArray(e[0]), n = t ? 0 : -1, r = e[0 + n], i = e[1 + n], a = e[2 + n], o = e[3 + n], s = ce(i, a, o);
	return t ? s(r) : s;
}
// ../../../peach/frontend/node_modules/motion-dom/dist/es/animation/FollowAnimation.mjs
var He = /* @__PURE__ */ new Set(), Ue = ({ timestamp: e }) => {
	He.forEach((t) => t.tick(e));
}, We = class extends x {
	constructor(e) {
		super(), this.state = "idle", this.startTime = 0, this.currentTime = 0, this.started = !1, this.hasNextTarget = !1, this.nextTarget = 0, this.stop = () => {
			this.state !== "idle" && (this.teardown(), this.options.onStop?.());
		}, this.options = e, this.factory = e.type, this.generator = this.factory(e);
		let { driver: t } = e;
		t && (this.driver = t((e) => this.tick(e))), this.startTime = this.now(), this.state = "running", this.driver ? this.driver.start() : (He.size || se.update(Ue, !0), He.add(this));
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
		this.state = "idle", this.driver ? this.driver.stop() : (He.delete(this), He.size || j(Ue));
	}
};
// ../../../peach/frontend/node_modules/motion-dom/dist/es/value/utils/follow.mjs
function Ge(e, t, n) {
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
		let f = i = new We({
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
			r ? (r = !1, e.jump(Ke(t, o), !1)) : e.set(Ke(t, o));
		}, a = t.on("change", i), s = t.get();
		O(s) - O(e.get()) && i(s);
		let c = e.on("destroy", a);
		return () => {
			a(), c(), l();
		};
	}
	return l;
}
function Ke(e, t) {
	return t ? e + t : e;
}
// ../../../peach/frontend/node_modules/motion-dom/dist/es/value/spring-value.mjs
function qe(e, t, n) {
	return Ge(e, t, {
		...n,
		type: Ae
	});
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/utils/use-motion-value-event.mjs
var P = /* @__PURE__ */ D(Ee(), 1);
function Je(e, t, n) {
	(0, P.useInsertionEffect)(() => e.on(t, n), [
		e,
		t,
		n
	]);
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-motion-value.mjs
function Ye(e) {
	let t = Pe(() => he(e)), { isStatic: n } = (0, P.useContext)(l);
	if (n) {
		let [, n] = (0, P.useState)(e);
		(0, P.useEffect)(() => t.on("change", n), []);
	}
	return t;
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-combine-values.mjs
function Xe(e, t) {
	let n = Ye(t()), r = () => n.set(t());
	return r(), Fe(() => {
		let t = () => se.preRender(r, !1, !0), n = e.map((e) => e.on("change", t));
		return r(), () => {
			n.forEach((e) => e()), j(r);
		};
	}), n;
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-computed.mjs
function Ze(e) {
	ee.current = [], e();
	let t = Xe(ee.current, e);
	return ee.current = void 0, t;
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-follow-value.mjs
function Qe(e, t, n) {
	let { isStatic: r } = (0, P.useContext)(l), i = () => le(e) ? e.get() : e;
	if (r) return Ze(i);
	let a = Ye(i());
	return (0, P.useInsertionEffect)(() => n(a, e, t), [a, JSON.stringify(t)]), a;
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-spring.mjs
function $e(e, t = {}) {
	return Qe(e, t, qe);
}
// ../../../peach/frontend/node_modules/framer-motion/dist/es/value/use-transform.mjs
function et(e, t, n, r) {
	if (typeof e == "function") return Ze(e);
	if (n !== void 0 && !Array.isArray(n) && typeof t != "function") return nt(e, t, n, r);
	let i = typeof t == "function" ? t : Ve(t, n, r), a = Array.isArray(e) ? tt(e, i) : tt([e], ([e]) => i(e)), o = Array.isArray(e) ? void 0 : e.accelerate;
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
function tt(e, t) {
	let n = Pe(() => []);
	return Xe(e, () => {
		n.length = 0;
		let r = e.length;
		for (let t = 0; t < r; t++) n[t] = e[t].get();
		return t(n);
	});
}
function nt(e, t, n, r) {
	let i = Pe(() => Object.keys(n)), a = Pe(() => ({}));
	for (let o of i) a[o] = et(e, t, n[o], r);
	return a;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/excludeEventProps.js
var rt = /* @__PURE__ */ "dangerouslySetInnerHTML.onCopy.onCopyCapture.onCut.onCutCapture.onPaste.onPasteCapture.onCompositionEnd.onCompositionEndCapture.onCompositionStart.onCompositionStartCapture.onCompositionUpdate.onCompositionUpdateCapture.onFocus.onFocusCapture.onBlur.onBlurCapture.onChange.onChangeCapture.onBeforeInput.onBeforeInputCapture.onInput.onInputCapture.onReset.onResetCapture.onSubmit.onSubmitCapture.onInvalid.onInvalidCapture.onLoad.onLoadCapture.onError.onErrorCapture.onKeyDown.onKeyDownCapture.onKeyPress.onKeyPressCapture.onKeyUp.onKeyUpCapture.onAbort.onAbortCapture.onCanPlay.onCanPlayCapture.onCanPlayThrough.onCanPlayThroughCapture.onDurationChange.onDurationChangeCapture.onEmptied.onEmptiedCapture.onEncrypted.onEncryptedCapture.onEnded.onEndedCapture.onLoadedData.onLoadedDataCapture.onLoadedMetadata.onLoadedMetadataCapture.onLoadStart.onLoadStartCapture.onPause.onPauseCapture.onPlay.onPlayCapture.onPlaying.onPlayingCapture.onProgress.onProgressCapture.onRateChange.onRateChangeCapture.onSeeked.onSeekedCapture.onSeeking.onSeekingCapture.onStalled.onStalledCapture.onSuspend.onSuspendCapture.onTimeUpdate.onTimeUpdateCapture.onVolumeChange.onVolumeChangeCapture.onWaiting.onWaitingCapture.onAuxClick.onAuxClickCapture.onClick.onClickCapture.onContextMenu.onContextMenuCapture.onDoubleClick.onDoubleClickCapture.onDrag.onDragCapture.onDragEnd.onDragEndCapture.onDragEnter.onDragEnterCapture.onDragExit.onDragExitCapture.onDragLeave.onDragLeaveCapture.onDragOver.onDragOverCapture.onDragStart.onDragStartCapture.onDrop.onDropCapture.onMouseDown.onMouseDownCapture.onMouseEnter.onMouseLeave.onMouseMove.onMouseMoveCapture.onMouseOut.onMouseOutCapture.onMouseOver.onMouseOverCapture.onMouseUp.onMouseUpCapture.onSelect.onSelectCapture.onTouchCancel.onTouchCancelCapture.onTouchEnd.onTouchEndCapture.onTouchMove.onTouchMoveCapture.onTouchStart.onTouchStartCapture.onPointerDown.onPointerDownCapture.onPointerMove.onPointerMoveCapture.onPointerUp.onPointerUpCapture.onPointerCancel.onPointerCancelCapture.onPointerEnter.onPointerEnterCapture.onPointerLeave.onPointerLeaveCapture.onPointerOver.onPointerOverCapture.onPointerOut.onPointerOutCapture.onGotPointerCapture.onGotPointerCaptureCapture.onLostPointerCapture.onLostPointerCaptureCapture.onScroll.onScrollCapture.onWheel.onWheelCapture.onAnimationStart.onAnimationStartCapture.onAnimationEnd.onAnimationEndCapture.onAnimationIteration.onAnimationIterationCapture.onTransitionEnd.onTransitionEndCapture".split(".");
function it(e) {
	return typeof e == "string" && rt.includes(e);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/svgPropertiesNoEvents.js
var at = /* @__PURE__ */ new Set(/* @__PURE__ */ "aria-activedescendant.aria-atomic.aria-autocomplete.aria-busy.aria-checked.aria-colcount.aria-colindex.aria-colspan.aria-controls.aria-current.aria-describedby.aria-details.aria-disabled.aria-errormessage.aria-expanded.aria-flowto.aria-haspopup.aria-hidden.aria-invalid.aria-keyshortcuts.aria-label.aria-labelledby.aria-level.aria-live.aria-modal.aria-multiline.aria-multiselectable.aria-orientation.aria-owns.aria-placeholder.aria-posinset.aria-pressed.aria-readonly.aria-relevant.aria-required.aria-roledescription.aria-rowcount.aria-rowindex.aria-rowspan.aria-selected.aria-setsize.aria-sort.aria-valuemax.aria-valuemin.aria-valuenow.aria-valuetext.className.color.height.id.lang.max.media.method.min.name.style.target.width.role.tabIndex.accentHeight.accumulate.additive.alignmentBaseline.allowReorder.alphabetic.amplitude.arabicForm.ascent.attributeName.attributeType.autoReverse.azimuth.baseFrequency.baselineShift.baseProfile.bbox.begin.bias.by.calcMode.capHeight.clip.clipPath.clipPathUnits.clipRule.colorInterpolation.colorInterpolationFilters.colorProfile.colorRendering.contentScriptType.contentStyleType.cursor.cx.cy.d.decelerate.descent.diffuseConstant.direction.display.divisor.dominantBaseline.dur.dx.dy.edgeMode.elevation.enableBackground.end.exponent.externalResourcesRequired.fill.fillOpacity.fillRule.filter.filterRes.filterUnits.floodColor.floodOpacity.focusable.fontFamily.fontSize.fontSizeAdjust.fontStretch.fontStyle.fontVariant.fontWeight.format.from.fx.fy.g1.g2.glyphName.glyphOrientationHorizontal.glyphOrientationVertical.glyphRef.gradientTransform.gradientUnits.hanging.horizAdvX.horizOriginX.href.ideographic.imageRendering.in2.in.intercept.k1.k2.k3.k4.k.kernelMatrix.kernelUnitLength.kerning.keyPoints.keySplines.keyTimes.lengthAdjust.letterSpacing.lightingColor.limitingConeAngle.local.markerEnd.markerHeight.markerMid.markerStart.markerUnits.markerWidth.mask.maskContentUnits.maskUnits.mathematical.mode.numOctaves.offset.opacity.operator.order.orient.orientation.origin.overflow.overlinePosition.overlineThickness.paintOrder.panose1.pathLength.patternContentUnits.patternTransform.patternUnits.pointerEvents.pointsAtX.pointsAtY.pointsAtZ.preserveAlpha.preserveAspectRatio.primitiveUnits.r.radius.refX.refY.renderingIntent.repeatCount.repeatDur.requiredExtensions.requiredFeatures.restart.result.rotate.rx.ry.seed.shapeRendering.slope.spacing.specularConstant.specularExponent.speed.spreadMethod.startOffset.stdDeviation.stemh.stemv.stitchTiles.stopColor.stopOpacity.strikethroughPosition.strikethroughThickness.string.stroke.strokeDasharray.strokeDashoffset.strokeLinecap.strokeLinejoin.strokeMiterlimit.strokeOpacity.strokeWidth.surfaceScale.systemLanguage.tableValues.targetX.targetY.textAnchor.textDecoration.textLength.textRendering.to.transform.u1.u2.underlinePosition.underlineThickness.unicode.unicodeBidi.unicodeRange.unitsPerEm.vAlphabetic.values.vectorEffect.version.vertAdvY.vertOriginX.vertOriginY.vHanging.vIdeographic.viewTarget.visibility.vMathematical.widths.wordSpacing.writingMode.x1.x2.x.xChannelSelector.xHeight.xlinkActuate.xlinkArcrole.xlinkHref.xlinkRole.xlinkShow.xlinkTitle.xlinkType.xmlBase.xmlLang.xmlns.xmlnsXlink.xmlSpace.y1.y2.y.yChannelSelector.z.zoomAndPan.ref.key.angle".split("."));
function ot(e) {
	return typeof e == "string" && at.has(e);
}
function st(e) {
	return typeof e == "string" && e.startsWith("data-");
}
function ct(e) {
	if (typeof e != "object" || !e) return {};
	var t = {};
	for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (ot(n) || st(n)) && (t[n] = e[n]);
	return t;
}
function lt(e) {
	if (e == null) return null;
	if (/*#__PURE__*/ (0, P.isValidElement)(e) && typeof e.props == "object" && e.props !== null) {
		var t = e.props;
		return ct(t);
	}
	return typeof e == "object" && !Array.isArray(e) ? ct(e) : null;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/svgPropertiesAndEvents.js
function ut(e) {
	var t = {};
	for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (ot(n) || st(n) || it(n)) && (t[n] = e[n]);
	return t;
}
function dt(e) {
	return e == null ? null : /*#__PURE__*/ (0, P.isValidElement)(e) ? ut(e.props) : typeof e == "object" && !Array.isArray(e) ? ut(e) : null;
}
// ../../../peach/frontend/node_modules/recharts/es6/container/Surface.js
var ft = [
	"children",
	"width",
	"height",
	"viewBox",
	"className",
	"style",
	"title",
	"desc"
];
function pt() {
	return pt = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, pt.apply(null, arguments);
}
function mt(e, t) {
	if (e == null) return {};
	var n, r, i = ht(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function ht(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var gt = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.children, r = e.width, i = e.height, a = e.viewBox, o = e.className, s = e.style, c = e.title, l = e.desc, u = mt(e, ft), d = a || {
		width: r,
		height: i,
		x: 0,
		y: 0
	}, f = N("recharts-surface", o);
	return /*#__PURE__*/ P.createElement("svg", pt({}, ut(u), {
		className: f,
		width: r,
		height: i,
		style: s,
		viewBox: `${d.x} ${d.y} ${d.width} ${d.height}`,
		ref: t
	}), /*#__PURE__*/ P.createElement("title", null, c), /*#__PURE__*/ P.createElement("desc", null, l), n);
}), _t = ["children", "className"];
function vt() {
	return vt = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, vt.apply(null, arguments);
}
function yt(e, t) {
	if (e == null) return {};
	var n, r, i = bt(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function bt(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var F = /*#__PURE__*/ P.forwardRef((e, t) => {
	var n = e.children, r = e.className, i = yt(e, _t), a = N("recharts-layer", r);
	return /*#__PURE__*/ P.createElement("g", vt({ className: a }, ut(i), { ref: t }), n);
});
// ../../../peach/frontend/node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
function xt(e) {
	return e === "__proto__";
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/isDeepKey.mjs
var St = /\.|(\[(?:[^[\]]*|(["'])(?:(?!\2)[^\\]|\\.)*?\2)\])/;
function Ct(e) {
	switch (typeof e) {
		case "number":
		case "symbol": return !1;
		case "string": return e === "" || e.startsWith(".") || e.endsWith(".") ? !1 : St.test(e);
		default: return !1;
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/toKey.mjs
function wt(e) {
	return typeof e == "string" || typeof e == "symbol" ? e : Object.is(e?.valueOf?.(), -0) ? "-0" : String(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isSymbol.mjs
function Tt(e) {
	return typeof e == "symbol" || e instanceof Symbol;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/toString.mjs
function Et(e) {
	return e == null ? "" : Dt(e);
}
function Dt(e) {
	if (typeof e == "string") return e;
	if (Array.isArray(e)) return e.map(Dt).join(",");
	if (Tt(e)) return e.toString();
	let t = e + "";
	return t === "0" && Object.is(Number(e), -0) ? "-0" : t;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/toPath.mjs
function Ot(e) {
	if (Array.isArray(e)) return e.map(wt);
	if (typeof e == "symbol") return [e];
	e = Et(e);
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
function kt(e, t, n) {
	if (e == null) return n;
	switch (typeof t) {
		case "string": {
			if (xt(t)) return n;
			let r = e[t];
			return r === void 0 ? Ct(t) && !Object.hasOwn(e, t) ? kt(e, Ot(t), n) : n : r;
		}
		case "number":
		case "symbol": {
			typeof t == "number" && (t = wt(t));
			let r = e[t];
			return r === void 0 ? n : r;
		}
		default: {
			if (Array.isArray(t)) return At(e, t, n);
			if (t = Object.is(t?.valueOf(), -0) ? "-0" : String(t), xt(t)) return n;
			let r = e[t];
			return r === void 0 ? n : r;
		}
	}
}
function At(e, t, n) {
	if (t.length === 0) return n;
	let r = e;
	for (let e = 0; e < t.length; e++) {
		if (r == null || xt(t[e])) return n;
		r = r[t[e]];
	}
	return r === void 0 ? n : r;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/round.js
var jt = 4;
function Mt(e) {
	var t = 10 ** (arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : jt), n = Math.round(e * t) / t;
	return Object.is(n, -0) ? 0 : n;
}
function Nt(e) {
	var t = [...arguments].slice(1);
	return e.reduce((e, n, r) => {
		var i = t[r - 1];
		return typeof i == "string" ? e + i + n : i === void 0 ? e + n : e + Mt(i) + n;
	}, "");
}
// ../../../peach/frontend/node_modules/recharts/es6/util/DataUtils.js
var Pt = (e) => e === 0 ? 0 : e > 0 ? 1 : -1, Ft = (e) => typeof e == "number" && e != +e, It = (e) => typeof e == "string" && e.length > 1 && e.indexOf("%") === e.length - 1, I = (e) => (typeof e == "number" || e instanceof Number) && !Ft(e), Lt = (e) => I(e) || typeof e == "string", Rt = 0, zt = (e) => {
	var t = ++Rt;
	return `${e || ""}${t}`;
}, Bt = function(e, t) {
	var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, r = arguments.length > 3 && arguments[3] !== void 0 && arguments[3];
	if (!I(e) && typeof e != "string") return n;
	var i;
	if (It(e)) {
		if (t == null) return n;
		var a = e.indexOf("%");
		i = t * parseFloat(e.slice(0, a)) / 100;
	} else i = +e;
	return Ft(i) && (i = n), r && t != null && i > t && (i = t), i;
}, Vt = (e) => {
	if (!Array.isArray(e)) return !1;
	for (var t = e.length, n = {}, r = 0; r < t; r++) if (!n[String(e[r])]) n[String(e[r])] = !0;
	else return !0;
	return !1;
};
function L(e, t, n) {
	return I(e) && I(t) ? Mt(e + n * (t - e)) : t;
}
function Ht(e, t, n) {
	if (e && e.length) return e.find((e) => e && (typeof t == "function" ? t(e) : kt(e, t)) === n);
}
var R = (e) => e == null, Ut = (e) => R(e) ? e : `${e.charAt(0).toUpperCase()}${e.slice(1)}`;
function Wt(e) {
	return e != null;
}
function Gt() {}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/cartesianViewBoxToTrapezoid.js
function Kt(e) {
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
function qt(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Jt(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? qt(Object(n), !0).forEach(function(t) {
			Yt(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qt(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Yt(e, t, n) {
	return (t = Xt(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Xt(e) {
	var t = Zt(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Zt(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Qt = (e) => {
	var t = e.viewBox, n = e.position, r = e.offset, i = r === void 0 ? 0 : r, a = e.parentViewBox, o = e.clamp, s = Kt(t), c = s.x, l = s.y, u = s.height, d = s.upperWidth, f = s.lowerWidth, p = c, m = c + (d - f) / 2, h = (p + m) / 2, g = (d + f) / 2, _ = p + d / 2, v = u >= 0 ? 1 : -1, y = v * i, b = v > 0 ? "end" : "start", x = v > 0 ? "start" : "end", S = d >= 0 ? 1 : -1, C = S * i, w = S > 0 ? "end" : "start", T = S > 0 ? "start" : "end", E = a;
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
	return n === "insideLeft" ? Jt({
		x: h + C,
		y: l + u / 2,
		horizontalAnchor: T,
		verticalAnchor: "middle"
	}, j) : n === "insideRight" ? Jt({
		x: h + g - C,
		y: l + u / 2,
		horizontalAnchor: w,
		verticalAnchor: "middle"
	}, j) : n === "insideTop" ? Jt({
		x: p + d / 2,
		y: l + y,
		horizontalAnchor: "middle",
		verticalAnchor: x
	}, j) : n === "insideBottom" ? Jt({
		x: m + f / 2,
		y: l + u - y,
		horizontalAnchor: "middle",
		verticalAnchor: b
	}, j) : n === "insideTopLeft" ? Jt({
		x: p + C,
		y: l + y,
		horizontalAnchor: T,
		verticalAnchor: x
	}, j) : n === "insideTopRight" ? Jt({
		x: p + d - C,
		y: l + y,
		horizontalAnchor: w,
		verticalAnchor: x
	}, j) : n === "insideBottomLeft" ? Jt({
		x: m + C,
		y: l + u - y,
		horizontalAnchor: T,
		verticalAnchor: b
	}, j) : n === "insideBottomRight" ? Jt({
		x: m + f - C,
		y: l + u - y,
		horizontalAnchor: w,
		verticalAnchor: b
	}, j) : n && typeof n == "object" && (I(n.x) || It(n.x)) && (I(n.y) || It(n.y)) ? Jt({
		x: c + Bt(n.x, g),
		y: l + Bt(n.y, u),
		horizontalAnchor: "end",
		verticalAnchor: "end"
	}, j) : Jt({
		x: _,
		y: l + u / 2,
		horizontalAnchor: "middle",
		verticalAnchor: "middle"
	}, j);
}, $t = [
	"top",
	"left",
	"right",
	"bottom"
];
function en(e) {
	return e == null ? !1 : typeof e == "object" || $t.includes(e);
}
// ../../../peach/frontend/node_modules/recharts/es6/context/legendPortalContext.js
var tn = /*#__PURE__*/ (0, P.createContext)(null), nn = () => (0, P.useContext)(tn);
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/constant.js
function z(e) {
	return function() {
		return e;
	};
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/math.js
var rn = Math.cos, an = Math.sin, on = Math.sqrt, sn = Math.PI;
sn / 2;
var cn = 2 * sn, ln = Math.PI, un = 2 * ln, dn = 1e-6, fn = un - dn;
function pn(e) {
	this._ += e[0];
	for (let t = 1, n = e.length; t < n; ++t) this._ += arguments[t] + e[t];
}
function mn(e) {
	let t = Math.floor(e);
	if (!(t >= 0)) throw Error(`invalid digits: ${e}`);
	if (t > 15) return pn;
	let n = 10 ** t;
	return function(e) {
		this._ += e[0];
		for (let t = 1, r = e.length; t < r; ++t) this._ += Math.round(arguments[t] * n) / n + e[t];
	};
}
var hn = class {
	constructor(e) {
		this._x0 = this._y0 = this._x1 = this._y1 = null, this._ = "", this._append = e == null ? pn : mn(e);
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
		else if (d > dn) {
			if (!(Math.abs(u * s - c * l) > dn) || !i) this._append`L${this._x1 = e},${this._y1 = t}`;
			else {
				let f = n - a, p = r - o, m = s * s + c * c, h = f * f + p * p, g = Math.sqrt(m), _ = Math.sqrt(d), v = i * Math.tan((ln - Math.acos((m + d - h) / (2 * g * _))) / 2), y = v / _, b = v / g;
				Math.abs(y - 1) > dn && this._append`L${e + y * l},${t + y * u}`, this._append`A${i},${i},0,0,${+(u * f > l * p)},${this._x1 = e + b * s},${this._y1 = t + b * c}`;
			}
		}
	}
	arc(e, t, n, r, i, a) {
		if (e = +e, t = +t, n = +n, a = !!a, n < 0) throw Error(`negative radius: ${n}`);
		let o = n * Math.cos(r), s = n * Math.sin(r), c = e + o, l = t + s, u = 1 ^ a, d = a ? r - i : i - r;
		this._x1 === null ? this._append`M${c},${l}` : (Math.abs(this._x1 - c) > dn || Math.abs(this._y1 - l) > dn) && this._append`L${c},${l}`, n && (d < 0 && (d = d % un + un), d > fn ? this._append`A${n},${n},0,1,${u},${e - o},${t - s}A${n},${n},0,1,${u},${this._x1 = c},${this._y1 = l}` : d > dn && this._append`A${n},${n},0,${+(d >= ln)},${u},${this._x1 = e + n * Math.cos(i)},${this._y1 = t + n * Math.sin(i)}`);
	}
	rect(e, t, n, r) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}h${n = +n}v${+r}h${-n}Z`;
	}
	toString() {
		return this._;
	}
};
hn.prototype;
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/path.js
function gn(e) {
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
	}, () => new hn(t);
}
Array.prototype.slice;
function _n(e) {
	return typeof e == "object" && "length" in e ? e : Array.from(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/linear.js
function vn(e) {
	this._context = e;
}
vn.prototype = {
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
function yn(e) {
	return new vn(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/point.js
function bn(e) {
	return e[0];
}
function xn(e) {
	return e[1];
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/line.js
function Sn(e, t) {
	var n = z(!0), r = null, i = yn, a = null, o = gn(s);
	e = typeof e == "function" ? e : e === void 0 ? bn : z(e), t = typeof t == "function" ? t : t === void 0 ? xn : z(t);
	function s(s) {
		var c, l = (s = _n(s)).length, u, d = !1, f;
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
function Cn(e, t, n) {
	var r = null, i = z(!0), a = null, o = yn, s = null, c = gn(l);
	e = typeof e == "function" ? e : e === void 0 ? bn : z(+e), t = typeof t == "function" ? t : z(t === void 0 ? 0 : +t), n = typeof n == "function" ? n : n === void 0 ? xn : z(+n);
	function l(l) {
		var u, d, f, p = (l = _n(l)).length, m, h = !1, g, _ = Array(p), v = Array(p);
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
		return Sn().defined(i).curve(o).context(a);
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
var wn = class {
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
function Tn(e) {
	return new wn(e, !0);
}
function En(e) {
	return new wn(e, !1);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/symbol/circle.js
var Dn = { draw(e, t) {
	let n = on(t / sn);
	e.moveTo(n, 0), e.arc(0, 0, n, 0, cn);
} }, On = { draw(e, t) {
	let n = on(t / 5) / 2;
	e.moveTo(-3 * n, -n), e.lineTo(-n, -n), e.lineTo(-n, -3 * n), e.lineTo(n, -3 * n), e.lineTo(n, -n), e.lineTo(3 * n, -n), e.lineTo(3 * n, n), e.lineTo(n, n), e.lineTo(n, 3 * n), e.lineTo(-n, 3 * n), e.lineTo(-n, n), e.lineTo(-3 * n, n), e.closePath();
} }, kn = on(1 / 3), An = kn * 2, jn = { draw(e, t) {
	let n = on(t / An), r = n * kn;
	e.moveTo(0, -n), e.lineTo(r, 0), e.lineTo(0, n), e.lineTo(-r, 0), e.closePath();
} }, Mn = { draw(e, t) {
	let n = on(t), r = -n / 2;
	e.rect(r, r, n, n);
} }, Nn = .8908130915292852, Pn = an(sn / 10) / an(7 * sn / 10), Fn = an(cn / 10) * Pn, In = -rn(cn / 10) * Pn, Ln = { draw(e, t) {
	let n = on(t * Nn), r = Fn * n, i = In * n;
	e.moveTo(0, -n), e.lineTo(r, i);
	for (let t = 1; t < 5; ++t) {
		let a = cn * t / 5, o = rn(a), s = an(a);
		e.lineTo(s * n, -o * n), e.lineTo(o * r - s * i, s * r + o * i);
	}
	e.closePath();
} }, Rn = on(3), zn = { draw(e, t) {
	let n = -on(t / (Rn * 3));
	e.moveTo(0, n * 2), e.lineTo(-Rn * n, -n), e.lineTo(Rn * n, -n), e.closePath();
} }, Bn = -.5, Vn = on(3) / 2, Hn = 1 / on(12), Un = (Hn / 2 + 1) * 3, Wn = { draw(e, t) {
	let n = on(t / Un), r = n / 2, i = n * Hn, a = r, o = n * Hn + n, s = -a, c = o;
	e.moveTo(r, i), e.lineTo(a, o), e.lineTo(s, c), e.lineTo(Bn * r - Vn * i, Vn * r + Bn * i), e.lineTo(Bn * a - Vn * o, Vn * a + Bn * o), e.lineTo(Bn * s - Vn * c, Vn * s + Bn * c), e.lineTo(Bn * r + Vn * i, Bn * i - Vn * r), e.lineTo(Bn * a + Vn * o, Bn * o - Vn * a), e.lineTo(Bn * s + Vn * c, Bn * c - Vn * s), e.closePath();
} };
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/symbol.js
function Gn(e, t) {
	let n = null, r = gn(i);
	e = typeof e == "function" ? e : z(e || Dn), t = typeof t == "function" ? t : z(t === void 0 ? 64 : +t);
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
function Kn() {}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/basis.js
function qn(e, t, n) {
	e._context.bezierCurveTo((2 * e._x0 + e._x1) / 3, (2 * e._y0 + e._y1) / 3, (e._x0 + 2 * e._x1) / 3, (e._y0 + 2 * e._y1) / 3, (e._x0 + 4 * e._x1 + t) / 6, (e._y0 + 4 * e._y1 + n) / 6);
}
function Jn(e) {
	this._context = e;
}
Jn.prototype = {
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
			case 3: qn(this, this._x1, this._y1);
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
			default: qn(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function Yn(e) {
	return new Jn(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/basisClosed.js
function Xn(e) {
	this._context = e;
}
Xn.prototype = {
	areaStart: Kn,
	areaEnd: Kn,
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
			default: qn(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function Zn(e) {
	return new Xn(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/basisOpen.js
function Qn(e) {
	this._context = e;
}
Qn.prototype = {
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
			default: qn(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function $n(e) {
	return new Qn(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/linearClosed.js
function er(e) {
	this._context = e;
}
er.prototype = {
	areaStart: Kn,
	areaEnd: Kn,
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
function tr(e) {
	return new er(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/monotone.js
function nr(e) {
	return e < 0 ? -1 : 1;
}
function rr(e, t, n) {
	var r = e._x1 - e._x0, i = t - e._x1, a = (e._y1 - e._y0) / (r || i < 0 && -0), o = (n - e._y1) / (i || r < 0 && -0), s = (a * i + o * r) / (r + i);
	return (nr(a) + nr(o)) * Math.min(Math.abs(a), Math.abs(o), .5 * Math.abs(s)) || 0;
}
function ir(e, t) {
	var n = e._x1 - e._x0;
	return n ? (3 * (e._y1 - e._y0) / n - t) / 2 : t;
}
function ar(e, t, n) {
	var r = e._x0, i = e._y0, a = e._x1, o = e._y1, s = (a - r) / 3;
	e._context.bezierCurveTo(r + s, i + s * t, a - s, o - s * n, a, o);
}
function or(e) {
	this._context = e;
}
or.prototype = {
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
			case 3: ar(this, this._t0, ir(this, this._t0));
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
					this._point = 3, ar(this, ir(this, n = rr(this, e, t)), n);
					break;
				default: ar(this, this._t0, n = rr(this, e, t));
			}
			this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t, this._t0 = n;
		}
	}
};
function sr(e) {
	this._context = new cr(e);
}
(sr.prototype = Object.create(or.prototype)).point = function(e, t) {
	or.prototype.point.call(this, t, e);
};
function cr(e) {
	this._context = e;
}
cr.prototype = {
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
function lr(e) {
	return new or(e);
}
function ur(e) {
	return new sr(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/natural.js
function dr(e) {
	this._context = e;
}
dr.prototype = {
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
			else for (var r = fr(e), i = fr(t), a = 0, o = 1; o < n; ++a, ++o) this._context.bezierCurveTo(r[0][a], i[0][a], r[1][a], i[1][a], e[o], t[o]);
		}
		(this._line || this._line !== 0 && n === 1) && this._context.closePath(), this._line = 1 - this._line, this._x = this._y = null;
	},
	point: function(e, t) {
		this._x.push(+e), this._y.push(+t);
	}
};
function fr(e) {
	var t, n = e.length - 1, r, i = Array(n), a = Array(n), o = Array(n);
	for (i[0] = 0, a[0] = 2, o[0] = e[0] + 2 * e[1], t = 1; t < n - 1; ++t) i[t] = 1, a[t] = 4, o[t] = 4 * e[t] + 2 * e[t + 1];
	for (i[n - 1] = 2, a[n - 1] = 7, o[n - 1] = 8 * e[n - 1] + e[n], t = 1; t < n; ++t) r = i[t] / a[t - 1], a[t] -= r, o[t] -= r * o[t - 1];
	for (i[n - 1] = o[n - 1] / a[n - 1], t = n - 2; t >= 0; --t) i[t] = (o[t] - i[t + 1]) / a[t];
	for (a[n - 1] = (e[n] + i[n - 1]) / 2, t = 0; t < n - 1; ++t) a[t] = 2 * e[t + 1] - i[t + 1];
	return [i, a];
}
function pr(e) {
	return new dr(e);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/curve/step.js
function mr(e, t) {
	this._context = e, this._t = t;
}
mr.prototype = {
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
function hr(e) {
	return new mr(e, .5);
}
function gr(e) {
	return new mr(e, 0);
}
function _r(e) {
	return new mr(e, 1);
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/offset/none.js
function vr(e, t) {
	if ((o = e.length) > 1) for (var n = 1, r, i, a = e[t[0]], o, s = a.length; n < o; ++n) for (i = a, a = e[t[n]], r = 0; r < s; ++r) a[r][1] += a[r][0] = isNaN(i[r][1]) ? i[r][0] : i[r][1];
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/order/none.js
function yr(e) {
	for (var t = e.length, n = Array(t); --t >= 0;) n[t] = t;
	return n;
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/stack.js
function br(e, t) {
	return e[t];
}
function xr(e) {
	let t = [];
	return t.key = e, t;
}
function Sr() {
	var e = z([]), t = yr, n = vr, r = br;
	function i(i) {
		var a = Array.from(e.apply(this, arguments), xr), o, s = a.length, c = -1, l;
		for (let e of i) for (o = 0, ++c; o < s; ++o) (a[o][c] = [0, +r(e, a[o].key, c, i)]).data = e;
		for (o = 0, l = _n(t(a)); o < s; ++o) a[l[o]].index = o;
		return n(a, l), a;
	}
	return i.keys = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : z(Array.from(t)), i) : e;
	}, i.value = function(e) {
		return arguments.length ? (r = typeof e == "function" ? e : z(+e), i) : r;
	}, i.order = function(e) {
		return arguments.length ? (t = e == null ? yr : typeof e == "function" ? e : z(Array.from(e)), i) : t;
	}, i.offset = function(e) {
		return arguments.length ? (n = e ?? vr, i) : n;
	}, i;
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/offset/expand.js
function Cr(e, t) {
	if ((r = e.length) > 0) {
		for (var n, r, i = 0, a = e[0].length, o; i < a; ++i) {
			for (o = n = 0; n < r; ++n) o += e[n][i][1] || 0;
			if (o) for (n = 0; n < r; ++n) e[n][i][1] /= o;
		}
		vr(e, t);
	}
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/offset/silhouette.js
function wr(e, t) {
	if ((i = e.length) > 0) {
		for (var n = 0, r = e[t[0]], i, a = r.length; n < a; ++n) {
			for (var o = 0, s = 0; o < i; ++o) s += e[o][n][1] || 0;
			r[n][1] += r[n][0] = -s / 2;
		}
		vr(e, t);
	}
}
// ../../../peach/frontend/node_modules/victory-vendor/node_modules/d3-shape/src/offset/wiggle.js
function Tr(e, t) {
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
		i[r - 1][1] += i[r - 1][0] = n, vr(e, t);
	}
}
// ../../../peach/frontend/node_modules/recharts/es6/shape/Symbols.js
var Er = [
	"type",
	"size",
	"sizeType"
];
function Dr() {
	return Dr = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Dr.apply(null, arguments);
}
function Or(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function kr(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Or(Object(n), !0).forEach(function(t) {
			Ar(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Or(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Ar(e, t, n) {
	return (t = jr(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function jr(e) {
	var t = Mr(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Mr(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Nr(e, t) {
	if (e == null) return {};
	var n, r, i = Pr(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Pr(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var Fr = {
	symbolCircle: Dn,
	symbolCross: On,
	symbolDiamond: jn,
	symbolSquare: Mn,
	symbolStar: Ln,
	symbolTriangle: zn,
	symbolWye: Wn
}, Ir = Math.PI / 180, Lr = (e) => Fr[`symbol${Ut(e)}`] || Dn, Rr = (e, t, n) => {
	if (t === "area") return e;
	switch (n) {
		case "cross": return 5 * e * e / 9;
		case "diamond": return .5 * e * e / Math.sqrt(3);
		case "square": return e * e;
		case "star":
			var r = 18 * Ir;
			return 1.25 * e * e * (Math.tan(r) - Math.tan(r * 2) * Math.tan(r) ** 2);
		case "triangle": return Math.sqrt(3) * e * e / 4;
		case "wye": return (21 - 10 * Math.sqrt(3)) * e * e / 8;
		default: return Math.PI * e * e / 4;
	}
}, zr = (e, t) => {
	Fr[`symbol${Ut(e)}`] = t;
}, Br = (e) => {
	var t = e.type, n = t === void 0 ? "circle" : t, r = e.size, i = r === void 0 ? 64 : r, a = e.sizeType, o = a === void 0 ? "area" : a, s = kr(kr({}, Nr(e, Er)), {}, {
		type: n,
		size: i,
		sizeType: o
	}), c = "circle";
	typeof n == "string" && (c = n);
	var l = () => {
		var e = Lr(c), t = Gn().type(e).size(Rr(i, o, c))();
		if (t !== null) return t;
	}, u = s.className, d = s.cx, f = s.cy, p = ut(s);
	return I(d) && I(f) && I(i) ? /*#__PURE__*/ P.createElement("path", Dr({}, p, {
		className: N("recharts-symbols", u),
		transform: `translate(${d}, ${f})`,
		d: l()
	})) : null;
};
Br.registerSymbol = zr;
// ../../../peach/frontend/node_modules/recharts/es6/util/types.js
var Vr = (e) => "radius" in e && "startAngle" in e && "endAngle" in e, Hr = (e, t) => {
	if (!e || typeof e == "function" || typeof e == "boolean") return null;
	var n = e;
	if (/*#__PURE__*/ (0, P.isValidElement)(e) && (n = e.props), typeof n != "object" && typeof n != "function") return null;
	var r = {};
	return Object.keys(n).forEach((e) => {
		it(e) && typeof n[e] == "function" && (r[e] = t || ((t) => n[e](n, t)));
	}), r;
}, Ur = (e, t, n) => (r) => (e(t, n, r), null), Wr = (e, t, n) => {
	if (e === null || typeof e != "object" && typeof e != "function") return null;
	var r = null;
	return Object.keys(e).forEach((i) => {
		var a = e[i];
		it(i) && typeof a == "function" && (r ||= {}, r[i] = Ur(a, t, n));
	}), r;
};
// ../../../peach/frontend/node_modules/recharts/es6/util/resolveDefaultProps.js
function Gr(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Kr(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Gr(Object(n), !0).forEach(function(t) {
			qr(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Gr(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function qr(e, t, n) {
	return (t = Jr(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Jr(e) {
	var t = Yr(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Yr(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Xr(e, t) {
	var n = Kr({}, e), r = t;
	return Object.keys(t).reduce((e, t) => (e[t] === void 0 && r[t] !== void 0 && (e[t] = r[t]), e), n);
}
// ../../../peach/frontend/node_modules/recharts/es6/component/DefaultLegendContent.js
function Zr() {
	return Zr = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Zr.apply(null, arguments);
}
function Qr(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function $r(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Qr(Object(n), !0).forEach(function(t) {
			ei(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Qr(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function ei(e, t, n) {
	return (t = ti(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ti(e) {
	var t = ni(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ni(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var ri = 32, ii = {
	align: "center",
	iconSize: 14,
	inactiveColor: "#ccc",
	layout: "horizontal",
	verticalAlign: "middle",
	labelStyle: {}
};
function ai(e) {
	if (typeof e == "object" && e && "strokeDasharray" in e) return String(e.strokeDasharray);
}
function oi(e) {
	var t = e.data, n = e.iconType, r = e.inactiveColor, i = ri / 2, a = ri / 6, o = ri / 3, s = t.inactive ? r : t.color, c = n ?? t.type;
	if (c === "none") return null;
	if (c === "plainline") return /*#__PURE__*/ P.createElement("line", {
		strokeWidth: 4,
		fill: "none",
		stroke: s,
		strokeDasharray: ai(t.payload),
		x1: 0,
		y1: i,
		x2: ri,
		y2: i,
		className: "recharts-legend-icon"
	});
	if (c === "line") return /*#__PURE__*/ P.createElement("path", {
		strokeWidth: 4,
		fill: "none",
		stroke: s,
		d: `M0,${i}h${o}
            A${a},${a},0,1,1,${2 * o},${i}
            H${ri}M${2 * o},${i}
            A${a},${a},0,1,1,${o},${i}`,
		className: "recharts-legend-icon"
	});
	if (c === "rect") return /*#__PURE__*/ P.createElement("path", {
		stroke: "none",
		fill: s,
		d: `M0,${ri / 8}h${ri}v${ri * 3 / 4}h${-ri}z`,
		className: "recharts-legend-icon"
	});
	if (/*#__PURE__*/ P.isValidElement(t.legendIcon)) {
		var l = $r({}, t);
		return delete l.legendIcon, /*#__PURE__*/ P.cloneElement(t.legendIcon, l);
	}
	return /*#__PURE__*/ P.createElement(Br, {
		fill: s,
		cx: i,
		cy: i,
		size: ri,
		sizeType: "diameter",
		type: c
	});
}
function si(e) {
	var t = e.payload, n = e.iconSize, r = e.layout, i = e.formatter, a = e.inactiveColor, o = e.iconType, s = e.labelStyle, c = {
		x: 0,
		y: 0,
		width: ri,
		height: ri
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
		var p = typeof s == "object" ? $r({}, s) : {};
		p.color = t.inactive ? a : p.color || t.color, p.whiteSpace ??= "normal", p.overflowWrap ??= "break-word";
		var m = d ? d(t.value, t, r) : t.value;
		return /*#__PURE__*/ P.createElement("li", Zr({
			className: f,
			style: l,
			key: `legend-item-${r}`
		}, Wr(e, t, r)), /*#__PURE__*/ P.createElement(gt, {
			width: n,
			height: n,
			viewBox: c,
			style: u,
			"aria-label": t.value == null ? "legend icon" : `${t.value} legend icon`
		}, /*#__PURE__*/ P.createElement(oi, {
			data: t,
			iconType: o,
			inactiveColor: a
		})), /*#__PURE__*/ P.createElement("span", {
			className: "recharts-legend-item-text",
			style: p
		}, m));
	});
}
var ci = (e) => {
	var t = Xr(e, ii), n = t.payload, r = t.layout, i = t.align;
	if (!n || !n.length) return null;
	var a = {
		padding: 0,
		margin: 0,
		textAlign: r === "horizontal" ? i : "left"
	};
	return /*#__PURE__*/ P.createElement("ul", {
		className: "recharts-default-legend",
		style: a
	}, /*#__PURE__*/ P.createElement(si, Zr({}, t, { payload: n })));
};
// ../../../peach/frontend/node_modules/es-toolkit/dist/array/uniqBy.mjs
function li(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t(i, r, e);
		n.has(a) || n.set(a, i);
	}
	return Array.from(n.values());
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/function/ary.mjs
function ui(e, t) {
	return function(...n) {
		return e.apply(this, n.slice(0, t));
	};
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/function/identity.mjs
function di(e) {
	return e;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isLength.mjs
function fi(e) {
	return Number.isSafeInteger(e) && e >= 0;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isArrayLike.mjs
function pi(e) {
	return e != null && typeof e != "function" && fi(e.length);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/property.mjs
function mi(e) {
	return function(t) {
		return kt(t, e);
	};
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function hi(e) {
	return e == null || typeof e != "object" && typeof e != "function";
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isTypedArray.mjs
function gi(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/getSymbols.mjs
function _i(e) {
	return Object.getOwnPropertySymbols(e).filter((t) => Object.prototype.propertyIsEnumerable.call(e, t));
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/getTag.mjs
function vi(e) {
	return e == null ? e === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/tags.mjs
var yi = "[object RegExp]", bi = "[object String]", xi = "[object Number]", Si = "[object Boolean]", Ci = "[object Arguments]", wi = "[object Symbol]", Ti = "[object Date]", Ei = "[object Map]", Di = "[object Set]", Oi = "[object Array]", ki = "[object Function]", Ai = "[object ArrayBuffer]", ji = "[object Object]", Mi = "[object Error]", Ni = "[object DataView]", Pi = "[object Uint8Array]", Fi = "[object Uint8ClampedArray]", Ii = "[object Uint16Array]", Li = "[object Uint32Array]", Ri = "[object BigUint64Array]", zi = "[object Int8Array]", Bi = "[object Int16Array]", Vi = "[object Int32Array]", Hi = "[object BigInt64Array]", Ui = "[object Float32Array]", Wi = "[object Float64Array]", Gi = typeof globalThis == "object" && globalThis || typeof window == "object" && window || typeof self == "object" && self || typeof global == "object" && global || (function() {
	return this;
})();
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isBuffer.mjs
function Ki(e) {
	return Gi.Buffer !== void 0 && Gi.Buffer.isBuffer(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/object/cloneDeepWith.mjs
function qi(e, t) {
	return Ji(e, void 0, e, /* @__PURE__ */ new Map(), t);
}
function Ji(e, t, n, r = /* @__PURE__ */ new Map(), i = void 0) {
	let a = i?.(e, t, n, r);
	if (a !== void 0) return a;
	if (hi(e)) return e;
	if (r.has(e)) return r.get(e);
	if (Array.isArray(e)) {
		let t = Array(e.length);
		r.set(e, t);
		for (let a = 0; a < e.length; a++) t[a] = Ji(e[a], a, n, r, i);
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
		for (let [a, o] of e) t.set(a, Ji(o, a, n, r, i));
		return t;
	}
	if (e instanceof Set) {
		let t = /* @__PURE__ */ new Set();
		r.set(e, t);
		for (let a of e) t.add(Ji(a, void 0, n, r, i));
		return t;
	}
	if (Ki(e)) return e.subarray();
	if (gi(e)) {
		let t = new (Object.getPrototypeOf(e)).constructor(e.length);
		r.set(e, t);
		for (let a = 0; a < e.length; a++) t[a] = Ji(e[a], a, n, r, i);
		return t;
	}
	if (e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer) return e.slice(0);
	if (e instanceof DataView) {
		let t = new DataView(e.buffer.slice(0), e.byteOffset, e.byteLength);
		return r.set(e, t), Yi(t, e, n, r, i), t;
	}
	if (typeof File < "u" && e instanceof File) {
		let t = new File([e], e.name, { type: e.type });
		return r.set(e, t), Yi(t, e, n, r, i), t;
	}
	if (typeof Blob < "u" && e instanceof Blob) {
		let t = new Blob([e], { type: e.type });
		return r.set(e, t), Yi(t, e, n, r, i), t;
	}
	if (e instanceof Error) {
		let t = structuredClone(e);
		return r.set(e, t), t.message = e.message, t.name = e.name, t.stack = e.stack, t.cause = e.cause, t.constructor = e.constructor, Yi(t, e, n, r, i), t;
	}
	if (e instanceof Boolean) {
		let t = new Boolean(e.valueOf());
		return r.set(e, t), Yi(t, e, n, r, i), t;
	}
	if (e instanceof Number) {
		let t = new Number(e.valueOf());
		return r.set(e, t), Yi(t, e, n, r, i), t;
	}
	if (e instanceof String) {
		let t = new String(e.valueOf());
		return r.set(e, t), Yi(t, e, n, r, i), t;
	}
	if (typeof e == "object" && Xi(e)) {
		let t = Object.create(Object.getPrototypeOf(e));
		return r.set(e, t), Yi(t, e, n, r, i), t;
	}
	return e;
}
function Yi(e, t, n = e, r, i) {
	let a = [...Object.keys(t), ..._i(t)];
	for (let o = 0; o < a.length; o++) {
		let s = a[o], c = Object.getOwnPropertyDescriptor(e, s);
		(c == null || c.writable) && (e[s] = Ji(t[s], s, n, r, i));
	}
}
function Xi(e) {
	switch (vi(e)) {
		case Ci:
		case Oi:
		case Ai:
		case Ni:
		case Si:
		case Ti:
		case Ui:
		case Wi:
		case zi:
		case Bi:
		case Vi:
		case Ei:
		case xi:
		case ji:
		case yi:
		case Di:
		case bi:
		case wi:
		case Pi:
		case Fi:
		case Ii:
		case Li: return !0;
		default: return !1;
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/object/cloneDeep.mjs
function Zi(e) {
	return Ji(e, void 0, e, /* @__PURE__ */ new Map(), void 0);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/eq.mjs
function Qi(e, t) {
	return e === t || Number.isNaN(e) && Number.isNaN(t);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isObject.mjs
function $i(e) {
	return e !== null && (typeof e == "object" || typeof e == "function");
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isMatchWith.mjs
function ea(e, t, n) {
	return typeof n == "function" ? ta(e, t, function e(t, r, i, a, o, s) {
		let c = n(t, r, i, a, o, s);
		return c === void 0 ? ta(t, r, e, s, !1) : !!c;
	}, /* @__PURE__ */ new Map(), !0) : ea(e, t, () => void 0);
}
function ta(e, t, n, r, i = !1) {
	if (t === e) return !0;
	switch (typeof t) {
		case "object": return na(e, t, n, r, i);
		case "function": return Object.keys(t).length > 0 ? ta(e, { ...t }, n, r, i) : Qi(e, t);
		default: return $i(e) && i ? typeof t != "string" || t === "" : Qi(e, t);
	}
}
function na(e, t, n, r, i = !1) {
	if (t == null) return !0;
	if (Array.isArray(t)) return ia(e, t, n, r);
	if (t instanceof Map) return ra(e, t, n, r);
	if (t instanceof Set) return aa(e, t, n, r);
	let a = Object.keys(t);
	if (e == null) return i && a.length === 0;
	if (i) hi(e) && (e = Object(e));
	else {
		let t = vi(e);
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
function ra(e, t, n, r) {
	if (t.size === 0) return !0;
	if (!(e instanceof Map)) return !1;
	for (let [i, a] of t.entries()) if (n(e.get(i), a, i, e, t, r) === !1) return !1;
	return !0;
}
function ia(e, t, n, r) {
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
function aa(e, t, n, r) {
	return t.size === 0 || e instanceof Set && ia([...e], [...t], n, r);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isMatch.mjs
function oa(e, t) {
	return ea(e, t, () => void 0);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/matches.mjs
function sa(e) {
	return e = Zi(e), (t) => oa(t, e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/cloneDeepWith.mjs
function ca(e, t) {
	return qi(e, (n, r, i, a) => {
		let o = t?.(n, r, i, a);
		if (o !== void 0) return o;
		if (typeof e == "object") {
			if (vi(e) === "[object Object]" && typeof e.constructor != "function") {
				let t = {};
				return a.set(e, t), Yi(t, e, i, a), t;
			}
			switch (Object.prototype.toString.call(e)) {
				case xi:
				case bi:
				case Si: {
					let t = new e.constructor(e?.valueOf());
					return Yi(t, e), t;
				}
				case Ci: {
					let t = {};
					return Yi(t, e), t.length = e.length, t[Symbol.iterator] = e[Symbol.iterator], t;
				}
				default: return;
			}
		}
	});
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/cloneDeep.mjs
function la(e) {
	return ca(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/isIndex.mjs
var ua = /^(?:0|[1-9]\d*)$/;
function da(e, t = 2 ** 53 - 1) {
	switch (typeof e) {
		case "number": return Number.isInteger(e) && e >= 0 && e < t;
		case "symbol": return !1;
		case "string": return ua.test(e);
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/isArguments.mjs
function fa(e) {
	return typeof e == "object" && !!e && vi(e) === "[object Arguments]";
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/object/has.mjs
function pa(e, t) {
	let n;
	if (n = Array.isArray(t) ? t : typeof t == "string" && Ct(t) && !(t in Object(e)) ? Ot(t) : [t], n.length === 0) return !1;
	let r = e;
	for (let e = 0; e < n.length; e++) {
		let t = wt(n[e]);
		if ((r == null || !Object.hasOwn(r, t)) && !((Array.isArray(r) || fa(r)) && da(t) && Number(t) < r.length)) return !1;
		r = r[t];
	}
	return !0;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/predicate/matchesProperty.mjs
function ma(e, t) {
	switch (typeof e) {
		case "object":
			Object.is(e?.valueOf(), -0) && (e = "-0");
			break;
		case "number": e = wt(e);
	}
	return t = la(t), function(n) {
		let r = kt(n, e);
		return r === void 0 ? pa(n, e) : t === void 0 ? r === void 0 : oa(r, t);
	};
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/iteratee.mjs
function ha(e) {
	if (e == null) return di;
	switch (typeof e) {
		case "function": return e;
		case "object": return Array.isArray(e) && e.length === 2 ? ma(e[0], e[1]) : sa(e);
		default: return mi(e);
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/normalizeZero.mjs
function ga(e) {
	return e === 0 ? 0 : e;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/array/uniqBy.mjs
function _a(e, t = di) {
	return pi(e) ? li(Array.from(e), ui(ha(t), 1)).map(ga) : [];
}
// ../../../peach/frontend/node_modules/recharts/es6/util/payload/getUniqPayload.js
function va(e, t, n) {
	return t === !0 ? _a(e, n) : typeof t == "function" ? _a(e, t) : e;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/RechartsReduxContext.js
var ya = /*#__PURE__*/ (0, P.createContext)(null), ba = Oe(), xa = (e) => e, B = () => {
	var e = (0, P.useContext)(ya);
	return e ? e.store.dispatch : xa;
}, Sa = () => {}, Ca = () => Sa, wa = (e, t) => e === t;
function V(e) {
	var t = (0, P.useContext)(ya), n = (0, P.useMemo)(() => t ? (t) => {
		if (t != null) return e(t);
	} : Sa, [t, e]);
	return (0, ba.useSyncExternalStoreWithSelector)(t ? t.subscription.addNestedSub : Ca, t ? t.store.getState : Sa, t ? t.store.getState : Sa, n, wa);
}
// ../../../peach/frontend/node_modules/reselect/dist/reselect.mjs
function Ta(e, t = `expected a function, instead received ${typeof e}`) {
	if (typeof e != "function") throw TypeError(t);
}
function Ea(e, t = "expected all items to be functions, instead received the following types: ") {
	if (!e.every((e) => typeof e == "function")) {
		let n = e.map((e) => typeof e == "function" ? `function ${e.name || "unnamed"}()` : typeof e).join(", ");
		throw TypeError(`${t}[${n}]`);
	}
}
var Da = (e) => Array.isArray(e) ? e : [e];
function Oa(e) {
	let t = Array.isArray(e[0]) ? e[0] : e;
	return Ea(t, "createSelector expects all input-selectors to be functions, but received the following types: "), t;
}
function ka(e, t) {
	let n = [], { length: r } = e;
	for (let i = 0; i < r; i++) n.push(e[i].apply(null, t));
	return n;
}
var Aa = class {
	constructor(e) {
		this.value = e;
	}
	deref() {
		return this.value;
	}
}, ja = typeof WeakRef > "u" ? Aa : WeakRef, Ma = 0, Na = 1;
function Pa() {
	return {
		s: Ma,
		v: void 0,
		o: null,
		p: null
	};
}
function Fa(e) {
	return e instanceof ja ? e.deref() : e;
}
function Ia(e, t = {}) {
	let n = Pa(), { resultEqualityCheck: r } = t, i, a = 0;
	function o() {
		let t = n, { length: o } = arguments;
		for (let e = 0, n = o; e < n; e++) {
			let n = arguments[e];
			if (typeof n == "function" || typeof n == "object" && n) {
				let e = t.o;
				e === null && (t.o = e = /* @__PURE__ */ new WeakMap());
				let r = e.get(n);
				r === void 0 ? (t = Pa(), e.set(n, t)) : t = r;
			} else {
				let e = t.p;
				e === null && (t.p = e = /* @__PURE__ */ new Map());
				let r = e.get(n);
				r === void 0 ? (t = Pa(), e.set(n, t)) : t = r;
			}
		}
		let s = t, c;
		if (t.s === Na) c = t.v;
		else if (c = e.apply(null, arguments), a++, r) {
			let e = Fa(i);
			e != null && r(e, c) && (c = e, a !== 0 && a--), i = typeof c == "object" && c || typeof c == "function" ? /* @__PURE__ */ new ja(c) : c;
		}
		return s.s = Na, s.v = c, c;
	}
	return o.clearCache = () => {
		n = Pa(), o.resetResultsCount();
	}, o.resultsCount = () => a, o.resetResultsCount = () => {
		a = 0;
	}, o;
}
function La(e, ...t) {
	let n = typeof e == "function" ? {
		memoize: e,
		memoizeOptions: t
	} : e, r = (...e) => {
		let t = 0, r = 0, i, a = {}, o = e.pop();
		typeof o == "object" && (a = o, o = e.pop()), Ta(o, `createSelector expects an output function after the inputs, but received: [${typeof o}]`);
		let { memoize: s, memoizeOptions: c = [], argsMemoize: l = Ia, argsMemoizeOptions: u = [] } = {
			...n,
			...a
		}, d = Da(c), f = Da(u), p = Oa(e), m = s(function() {
			return t++, o.apply(null, arguments);
		}, ...d), h = l(function() {
			r++;
			let e = ka(p, arguments);
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
var H = /* @__PURE__ */ La(Ia);
// ../../../peach/frontend/node_modules/es-toolkit/dist/array/flatten.mjs
function Ra(e, t = 1) {
	let n = [], r = Math.floor(t), i = (e, t) => {
		for (let a = 0; a < e.length; a++) {
			let o = e[a];
			Array.isArray(o) && t < r ? i(o, t + 1) : n.push(o);
		}
	};
	return i(e, 0), n;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/isIterateeCall.mjs
function za(e, t, n) {
	return $i(n) && (typeof t == "number" && pi(n) && da(t) && t < n.length || typeof t == "string" && t in n) ? Qi(n[t], e) : !1;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/_internal/compareValues.mjs
function Ba(e) {
	return typeof e == "symbol" ? 1 : e === null ? 2 : e === void 0 ? 3 : e === e ? 0 : 4;
}
var Va = (e, t, n) => {
	if (e !== t) {
		let r = Ba(e), i = Ba(t);
		if (r === i && r === 0) {
			if (e < t) return n === "desc" ? 1 : -1;
			if (e > t) return n === "desc" ? -1 : 1;
		}
		return n === "desc" ? i - r : r - i;
	}
	return 0;
}, Ha = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Ua = /^\w*$/;
function Wa(e, t) {
	return Array.isArray(e) ? !1 : typeof e == "number" || typeof e == "boolean" || e == null || Tt(e) ? !0 : typeof e == "string" && (Ua.test(e) || !Ha.test(e)) || t != null && Object.hasOwn(t, e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/array/orderBy.mjs
function Ga(e, t, n, r) {
	if (e == null) return [];
	n = r ? void 0 : n, Array.isArray(e) || (e = pi(e) ? Array.from(e) : Object.values(e)), Array.isArray(t) || (t = t == null ? [null] : [t]), t.length === 0 && (t = [null]), Array.isArray(n) || (n = n == null ? [] : [n]), n = n.map((e) => String(e));
	let i = (e, t) => {
		let n = e, r = 0;
		for (; r < t.length && n != null; ++r) n = n[t[r]];
		return r > 0 && r === t.length ? n : void 0;
	}, a = (e, t) => {
		if (e == null) return t;
		if (t != null) return typeof e == "object" && "key" in e ? Object.hasOwn(t, e.key) ? t[e.key] : i(t, e.path) : typeof e == "function" ? e(t) : Array.isArray(e) ? i(t, e) : t[e];
	}, o = t.map((e) => (Array.isArray(e) && e.length === 1 && (e = e[0]), e == null || typeof e == "function" || Array.isArray(e) || Wa(e) ? e : {
		key: e,
		path: Ot(e)
	}));
	return e.map((e) => ({
		original: e,
		criteria: o.map((t) => a(t, e))
	})).slice().sort((e, t) => {
		for (let r = 0; r < o.length; r++) {
			let i = Va(e.criteria[r], t.criteria[r], n[r]);
			if (i !== 0) return i;
		}
		return 0;
	}).map((e) => e.original);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/array/sortBy.mjs
function Ka(e, ...t) {
	let n = t.length;
	return n > 1 && za(e, t[0], t[1]) ? t = [] : n > 2 && za(t[0], t[1], t[2]) && (t = [t[0]]), Ga(e, Ra(t), ["asc"]);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/legendSelectors.js
var qa = (e) => e.legend.settings, Ja = (e) => e.legend.size, Ya = H([(e) => e.legend.payload, qa], (e, t) => {
	var n = t.itemSorter, r = e.flat(1);
	return n ? Ka(r, n) : r;
});
// ../../../peach/frontend/node_modules/recharts/es6/context/legendPayloadContext.js
function Xa() {
	return V(Ya);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/useElementOffset.js
function Za(e, t) {
	return no(e) || to(e, t) || $a(e, t) || Qa();
}
function Qa() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function $a(e, t) {
	if (e) {
		if (typeof e == "string") return eo(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? eo(e, t) : void 0;
	}
}
function eo(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function to(e, t) {
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
function no(e) {
	if (Array.isArray(e)) return e;
}
var ro = 1;
function io(e, t) {
	return Math.abs(e.height - t.height) > ro || Math.abs(e.left - t.left) > ro || Math.abs(e.top - t.top) > ro || Math.abs(e.width - t.width) > ro;
}
function ao(e) {
	var t = e.getBoundingClientRect();
	return {
		height: t.height,
		left: t.left,
		top: t.top,
		width: t.width
	};
}
function oo() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], t = Za((0, P.useState)({
		height: 0,
		left: 0,
		top: 0,
		width: 0
	}), 2), n = t[0], r = t[1], i = (0, P.useRef)(null), a = (0, P.useRef)(n);
	a.current = n;
	var o = (0, P.useCallback)((e) => {
		if (i.current != null && (i.current.disconnect(), i.current = null), e != null) {
			var t = ao(e);
			if (io(t, a.current) && r(t), typeof ResizeObserver < "u") {
				var n = new ResizeObserver(() => {
					var t = ao(e);
					io(t, a.current) && r(t);
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
function so(e) {
	return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var co = typeof Symbol == "function" && Symbol.observable || "@@observable", lo = () => Math.random().toString(36).substring(7).split("").join("."), uo = {
	INIT: `@@redux/INIT${/* @__PURE__ */ lo()}`,
	REPLACE: `@@redux/REPLACE${/* @__PURE__ */ lo()}`,
	PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${lo()}`
};
function fo(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e;
	for (; Object.getPrototypeOf(t) !== null;) t = Object.getPrototypeOf(t);
	return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function po(e, t, n) {
	if (typeof e != "function") throw Error(so(2));
	if (typeof t == "function" && typeof n == "function" || typeof n == "function" && typeof arguments[3] == "function") throw Error(so(0));
	if (typeof t == "function" && n === void 0 && (n = t, t = void 0), n !== void 0) {
		if (typeof n != "function") throw Error(so(1));
		return n(po)(e, t);
	}
	let r = e, i = t, a = /* @__PURE__ */ new Map(), o = a, s = 0, c = !1;
	function l() {
		o === a && (o = /* @__PURE__ */ new Map(), a.forEach((e, t) => {
			o.set(t, e);
		}));
	}
	function u() {
		if (c) throw Error(so(3));
		return i;
	}
	function d(e) {
		if (typeof e != "function") throw Error(so(4));
		if (c) throw Error(so(5));
		let t = !0;
		l();
		let n = s++;
		return o.set(n, e), function() {
			if (t) {
				if (c) throw Error(so(6));
				t = !1, l(), o.delete(n), a = null;
			}
		};
	}
	function f(e) {
		if (!fo(e)) throw Error(so(7));
		if (e.type === void 0) throw Error(so(8));
		if (typeof e.type != "string") throw Error(so(17));
		if (c) throw Error(so(9));
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
		if (typeof e != "function") throw Error(so(10));
		r = e, f({ type: uo.REPLACE });
	}
	function m() {
		let e = d;
		return {
			subscribe(t) {
				if (typeof t != "object" || !t) throw Error(so(11));
				function n() {
					let e = t;
					e.next && e.next(u());
				}
				return n(), { unsubscribe: e(n) };
			},
			[co]() {
				return this;
			}
		};
	}
	return f({ type: uo.INIT }), {
		dispatch: f,
		subscribe: d,
		getState: u,
		replaceReducer: p,
		[co]: m
	};
}
function mo(e) {
	Object.keys(e).forEach((t) => {
		let n = e[t];
		if (n(void 0, { type: uo.INIT }) === void 0) throw Error(so(12));
		if (n(void 0, { type: uo.PROBE_UNKNOWN_ACTION() }) === void 0) throw Error(so(13));
	});
}
function ho(e) {
	let t = Object.keys(e), n = {};
	for (let r = 0; r < t.length; r++) {
		let i = t[r];
		typeof e[i] == "function" && (n[i] = e[i]);
	}
	let r = Object.keys(n), i;
	try {
		mo(n);
	} catch (e) {
		i = e;
	}
	return function(e = {}, t) {
		if (i) throw i;
		let a = !1, o = {};
		for (let i = 0; i < r.length; i++) {
			let s = r[i], c = n[s], l = e[s], u = c(l, t);
			if (u === void 0) throw t && t.type, Error(so(14));
			o[s] = u, a ||= u !== l;
		}
		return a ||= r.length !== Object.keys(e).length, a ? o : e;
	};
}
function go(...e) {
	return e.length === 0 ? (e) => e : e.length === 1 ? e[0] : e.reduce((e, t) => (...n) => e(t(...n)));
}
function _o(...e) {
	return (t) => (n, r) => {
		let i = t(n, r), a = () => {
			throw Error(so(15));
		}, o = {
			getState: i.getState,
			dispatch: (e, ...t) => a(e, ...t)
		};
		return a = go(...e.map((e) => e(o)))(i.dispatch), {
			...i,
			dispatch: a
		};
	};
}
function vo(e) {
	return fo(e) && "type" in e && typeof e.type == "string";
}
// ../../../peach/frontend/node_modules/immer/dist/immer.mjs
var yo = Symbol.for("immer-nothing"), bo = Symbol.for("immer-draftable"), xo = Symbol.for("immer-state");
function So(e, ...t) {
	throw Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`);
}
var Co = Object, wo = Co.getPrototypeOf, To = "constructor", Eo = "prototype", Do = "configurable", Oo = "enumerable", ko = "writable", Ao = "value", jo = (e) => !!e && !!e[xo];
function Mo(e) {
	return e ? Fo(e) || Ho(e) || !!e[bo] || !!e[To]?.[bo] || Uo(e) || Wo(e) : !1;
}
var No = Co[Eo][To].toString(), Po = /* @__PURE__ */ new WeakMap();
function Fo(e) {
	if (!e || !Go(e)) return !1;
	let t = wo(e);
	if (t === null || t === Co[Eo]) return !0;
	let n = Co.hasOwnProperty.call(t, To) && t[To];
	if (n === Object) return !0;
	if (!Ko(n)) return !1;
	let r = Po.get(n);
	return r === void 0 && (r = Function.toString.call(n), Po.set(n, r)), r === No;
}
function Io(e, t, n = !0) {
	Lo(e) === 0 ? (n ? Reflect.ownKeys(e) : Co.keys(e)).forEach((n) => {
		t(n, e[n], e);
	}) : e.forEach((n, r) => t(r, n, e));
}
function Lo(e) {
	let t = e[xo];
	return t ? t.type_ : Ho(e) ? 1 : Uo(e) ? 2 : Wo(e) ? 3 : 0;
}
var Ro = (e, t, n = Lo(e)) => n === 2 ? e.has(t) : Co[Eo].hasOwnProperty.call(e, t), zo = (e, t, n = Lo(e)) => n === 2 ? e.get(t) : e[t], Bo = (e, t, n, r = Lo(e)) => {
	r === 2 ? e.set(t, n) : r === 3 ? e.add(n) : e[t] = n;
};
function Vo(e, t) {
	return e === t ? e !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
var Ho = Array.isArray, Uo = (e) => e instanceof Map, Wo = (e) => e instanceof Set, Go = (e) => typeof e == "object", Ko = (e) => typeof e == "function", qo = (e) => typeof e == "boolean";
function Jo(e) {
	let t = +e;
	return Number.isInteger(t) && String(t) === e;
}
var Yo = (e) => e.copy_ || e.base_, Xo = (e) => e.modified_ ? e.copy_ : e.base_;
function Zo(e, t) {
	if (Uo(e)) return new Map(e);
	if (Wo(e)) return new Set(e);
	if (Ho(e)) return Array[Eo].slice.call(e);
	let n = Fo(e);
	if (t === !0 || t === "class_only" && !n) {
		let t = Co.getOwnPropertyDescriptors(e);
		delete t[xo];
		let n = Reflect.ownKeys(t);
		for (let r = 0; r < n.length; r++) {
			let i = n[r], a = t[i];
			a[ko] === !1 && (a[ko] = !0, a[Do] = !0), (a.get || a.set) && (t[i] = {
				[Do]: !0,
				[ko]: !0,
				[Oo]: a[Oo],
				[Ao]: e[i]
			});
		}
		return Co.create(wo(e), t);
	}
	{
		let t = wo(e);
		if (t !== null && n) return { ...e };
		let r = Co.create(t);
		return Co.assign(r, e);
	}
}
function Qo(e, t = !1) {
	return ts(e) || jo(e) || !Mo(e) || (Lo(e) > 1 && Co.defineProperties(e, {
		set: es,
		add: es,
		clear: es,
		delete: es
	}), Co.freeze(e), t && Io(e, (e, t) => {
		Qo(t, !0);
	}, !1)), e;
}
function $o() {
	So(2);
}
var es = { [Ao]: $o };
function ts(e) {
	return e === null || !Go(e) || Co.isFrozen(e);
}
var ns = "MapSet", rs = "Patches", is = "ArrayMethods", as = {};
function os(e) {
	let t = as[e];
	return t || So(0, e), t;
}
var ss = (e) => !!as[e], cs, ls = () => cs, us = (e, t) => ({
	drafts_: [],
	parent_: e,
	immer_: t,
	canAutoFreeze_: !0,
	unfinalizedDrafts_: 0,
	handledSet_: /* @__PURE__ */ new Set(),
	processedForPatches_: /* @__PURE__ */ new Set(),
	mapSetPlugin_: ss(ns) ? os(ns) : void 0,
	arrayMethodsPlugin_: ss(is) ? os(is) : void 0
});
function ds(e, t) {
	t && (e.patchPlugin_ = os(rs), e.patches_ = [], e.inversePatches_ = [], e.patchListener_ = t);
}
function fs(e) {
	ps(e), e.drafts_.forEach(hs), e.drafts_ = null;
}
function ps(e) {
	e === cs && (cs = e.parent_);
}
var ms = (e) => cs = us(cs, e);
function hs(e) {
	let t = e[xo];
	t.type_ === 0 || t.type_ === 1 ? t.revoke_() : t.revoked_ = !0;
}
function gs(e, t) {
	t.unfinalizedDrafts_ = t.drafts_.length;
	let n = t.drafts_[0];
	if (e !== void 0 && e !== n) {
		n[xo].modified_ && (fs(t), So(4)), Mo(e) && (e = _s(t, e));
		let { patchPlugin_: r } = t;
		r && r.generateReplacementPatches_(n[xo].base_, e, t);
	} else e = _s(t, n);
	return vs(t, e, !0), fs(t), t.patches_ && t.patchListener_(t.patches_, t.inversePatches_), e === yo ? void 0 : e;
}
function _s(e, t) {
	if (ts(t)) return t;
	let n = t[xo];
	if (!n) return Es(t, e.handledSet_, e);
	if (!bs(n, e)) return t;
	if (!n.modified_) return n.base_;
	if (!n.finalized_) {
		let { callbacks_: t } = n;
		if (t) for (; t.length > 0;) t.pop()(e);
		ws(n, e);
	}
	return n.copy_;
}
function vs(e, t, n = !1) {
	!e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && Qo(t, n);
}
function ys(e) {
	e.finalized_ = !0, e.scope_.unfinalizedDrafts_--;
}
var bs = (e, t) => e.scope_ === t, xs = [];
function Ss(e, t, n, r) {
	let i = Yo(e), a = e.type_;
	if (r !== void 0 && zo(i, r, a) === t) {
		Bo(i, r, n, a);
		return;
	}
	if (!e.draftLocations_) {
		let t = e.draftLocations_ = /* @__PURE__ */ new Map();
		Io(i, (e, n) => {
			if (jo(n)) {
				let r = t.get(n) || [];
				r.push(e), t.set(n, r);
			}
		});
	}
	let o = e.draftLocations_.get(t) ?? xs;
	for (let e of o) Bo(i, e, n, a);
}
function Cs(e, t, n) {
	e.callbacks_.push(function(r) {
		let i = t;
		if (!i || !bs(i, r)) return;
		r.mapSetPlugin_?.fixSetContents(i);
		let a = Xo(i);
		Ss(e, i.draft_ ?? i, a, n), ws(i, r);
	});
}
function ws(e, t) {
	if (e.modified_ && !e.finalized_ && (e.type_ === 3 || e.type_ === 1 && e.allIndicesReassigned_ || (e.assigned_?.size ?? 0) > 0)) {
		let { patchPlugin_: n } = t;
		if (n) {
			let r = n.getPath(e);
			r && n.generatePatches_(e, r, t);
		}
		ys(e);
	}
}
function Ts(e, t, n) {
	let { scope_: r } = e;
	if (jo(n)) {
		let i = n[xo];
		bs(i, r) && i.callbacks_.push(function() {
			Fs(e), Ss(e, n, Xo(i), t);
		});
	} else Mo(n) && e.callbacks_.push(function() {
		let i = Yo(e);
		e.type_ === 3 ? i.has(n) && Es(n, r.handledSet_, r) : zo(i, t, e.type_) === n && r.drafts_.length > 1 && (e.assigned_.get(t) ?? !1) === !0 && e.copy_ && Es(zo(e.copy_, t, e.type_), r.handledSet_, r);
	});
}
function Es(e, t, n) {
	return !n.immer_.autoFreeze_ && n.unfinalizedDrafts_ < 1 || jo(e) || t.has(e) || !Mo(e) || ts(e) || (t.add(e), Io(e, (r, i) => {
		if (jo(i)) {
			let t = i[xo];
			bs(t, n) && (Bo(e, r, Xo(t), e.type_), ys(t));
		} else Mo(i) && Es(i, t, n);
	})), e;
}
function Ds(e, t) {
	let n = Ho(e), r = {
		type_: +!!n,
		scope_: t ? t.scope_ : ls(),
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
	}, i = r, a = Os;
	n && (i = [r], a = ks);
	let { revoke: o, proxy: s } = Proxy.revocable(i, a);
	return r.draft_ = s, r.revoke_ = o, [s, r];
}
var Os = {
	get(e, t) {
		if (t === xo) return e;
		let n = e.scope_.arrayMethodsPlugin_, r = e.type_ === 1 && typeof t == "string";
		if (r && n?.isArrayOperationMethod(t)) return n.createMethodInterceptor(e, t);
		let i = Yo(e);
		if (!Ro(i, t, e.type_)) return Ms(e, i, t);
		let a = i[t];
		if (e.finalized_ || !Mo(a) || r && e.operationMethod && n?.isMutatingArrayMethod(e.operationMethod) && Jo(t)) return a;
		if (a === As(e.base_, t) || js(e, t, a)) {
			Fs(e);
			let n = e.type_ === 1 ? +t : t, r = Ls(e.scope_, a, e, n);
			return e.copy_[n] = r;
		}
		return a;
	},
	has(e, t) {
		return t in Yo(e);
	},
	ownKeys(e) {
		return Reflect.ownKeys(Yo(e));
	},
	set(e, t, n) {
		let r = Ns(Yo(e), t);
		if (r?.set) return r.set.call(e.draft_, n), !0;
		if (!e.modified_) {
			let r = As(Yo(e), t), i = r?.[xo];
			if (i && i.base_ === n) return e.copy_[t] = n, e.assigned_.delete(t), !0;
			if (Vo(n, r) && (n !== void 0 || Ro(e.base_, t, e.type_))) return !0;
			Fs(e), Ps(e);
		}
		return e.copy_[t] === n && (n !== void 0 || Ro(e.copy_, t, e.type_)) || Number.isNaN(n) && Number.isNaN(e.copy_[t]) || (e.copy_[t] = n, e.assigned_.set(t, !0), Ts(e, t, n)), !0;
	},
	deleteProperty(e, t) {
		return Fs(e), As(e.base_, t) !== void 0 || t in e.base_ ? (e.assigned_.set(t, !1), Ps(e)) : e.assigned_.delete(t), e.copy_ && delete e.copy_[t], !0;
	},
	getOwnPropertyDescriptor(e, t) {
		let n = Yo(e), r = Reflect.getOwnPropertyDescriptor(n, t);
		return r && {
			[ko]: !0,
			[Do]: e.type_ !== 1 || t !== "length",
			[Oo]: r[Oo],
			[Ao]: n[t]
		};
	},
	defineProperty() {
		So(11);
	},
	getPrototypeOf(e) {
		return wo(e.base_);
	},
	setPrototypeOf() {
		So(12);
	}
}, ks = {};
for (let e in Os) {
	let t = Os[e];
	ks[e] = function() {
		let e = arguments;
		return e[0] = e[0][0], t.apply(this, e);
	};
}
ks.deleteProperty = function(e, t) {
	return ks.set.call(this, e, t, void 0);
}, ks.set = function(e, t, n) {
	return Os.set.call(this, e[0], t, n, e[0]);
};
function As(e, t) {
	let n = e[xo];
	return (n ? Yo(n) : e)[t];
}
function js(e, t, n) {
	return e.type_ !== 1 || !e.allIndicesReassigned_ || e.assigned_?.get(t) || !Mo(n) || n[xo] ? !1 : e.baseRefs_.has(n);
}
function Ms(e, t, n) {
	let r = Ns(t, n);
	return r ? Ao in r ? r[Ao] : r.get?.call(e.draft_) : void 0;
}
function Ns(e, t) {
	if (!(t in e)) return;
	let n = wo(e);
	for (; n;) {
		let e = Object.getOwnPropertyDescriptor(n, t);
		if (e) return e;
		n = wo(n);
	}
}
function Ps(e) {
	e.modified_ || (e.modified_ = !0, e.parent_ && Ps(e.parent_));
}
function Fs(e) {
	e.copy_ ||= (e.assigned_ = /* @__PURE__ */ new Map(), Zo(e.base_, e.scope_.immer_.useStrictShallowCopy_));
}
var Is = class {
	constructor(e) {
		this.autoFreeze_ = !0, this.useStrictShallowCopy_ = !1, this.useStrictIteration_ = !1, this.produce = (e, t, n) => {
			if (Ko(e) && !Ko(t)) {
				let n = t;
				t = e;
				let r = this;
				return function(e = n, ...i) {
					return r.produce(e, (e) => t.call(this, e, ...i));
				};
			}
			Ko(t) || So(6), n !== void 0 && !Ko(n) && So(7);
			let r;
			if (Mo(e)) {
				let i = ms(this), a = Ls(i, e, void 0), o = !0;
				try {
					r = t(a), o = !1;
				} finally {
					o ? fs(i) : ps(i);
				}
				return ds(i, n), gs(r, i);
			}
			if (!e || !Go(e)) {
				if (r = t(e), r === void 0 && (r = e), r === yo && (r = void 0), this.autoFreeze_ && Qo(r, !0), n) {
					let t = [], i = [];
					os(rs).generateReplacementPatches_(e, r, {
						patches_: t,
						inversePatches_: i
					}), n(t, i);
				}
				return r;
			}
			So(1, e);
		}, this.produceWithPatches = (e, t) => {
			if (Ko(e)) return (t, ...n) => this.produceWithPatches(t, (t) => e(t, ...n));
			let n, r;
			return [
				this.produce(e, t, (e, t) => {
					n = e, r = t;
				}),
				n,
				r
			];
		}, qo(e?.autoFreeze) && this.setAutoFreeze(e.autoFreeze), qo(e?.useStrictShallowCopy) && this.setUseStrictShallowCopy(e.useStrictShallowCopy), qo(e?.useStrictIteration) && this.setUseStrictIteration(e.useStrictIteration);
	}
	createDraft(e) {
		Mo(e) || So(8), jo(e) && (e = Rs(e));
		let t = ms(this), n = Ls(t, e, void 0);
		return n[xo].isManual_ = !0, ps(t), n;
	}
	finishDraft(e, t) {
		let n = e && e[xo];
		n && n.isManual_ || So(9);
		let { scope_: r } = n;
		return ds(r, t), gs(void 0, r);
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
		let r = os(rs).applyPatches_;
		return jo(e) ? r(e, t) : this.produce(e, (e) => r(e, t));
	}
};
function Ls(e, t, n, r) {
	let [i, a] = Uo(t) ? os(ns).proxyMap_(t, n) : Wo(t) ? os(ns).proxySet_(t, n) : Ds(t, n);
	return (n?.scope_ ?? ls()).drafts_.push(i), a.callbacks_ = n?.callbacks_ ?? [], a.key_ = r, n && r !== void 0 ? Cs(n, a, r) : a.callbacks_.push(function(e) {
		e.mapSetPlugin_?.fixSetContents(a);
		let { patchPlugin_: t } = e;
		a.modified_ && t && t.generatePatches_(a, [], e);
	}), i;
}
function Rs(e) {
	return jo(e) || So(10, e), zs(e);
}
function zs(e) {
	if (!Mo(e) || ts(e)) return e;
	let t = e[xo], n, r = !0;
	if (t) {
		if (!t.modified_) return t.base_;
		t.finalized_ = !0, n = Zo(e, t.scope_.immer_.useStrictShallowCopy_), r = t.scope_.immer_.shouldUseStrictIteration();
	} else n = Zo(e, !0);
	return Io(n, (e, t) => {
		Bo(n, e, zs(t));
	}, r), t && (t.finalized_ = !1), n;
}
globalThis.Iterator?.from;
var Bs = new Is().produce, U = (e) => e;
// ../../../peach/frontend/node_modules/redux-thunk/dist/redux-thunk.mjs
function Vs(e) {
	return ({ dispatch: t, getState: n }) => (r) => (i) => typeof i == "function" ? i(t, n, e) : r(i);
}
var Hs = Vs(), Us = Vs, Ws = typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
	if (arguments.length !== 0) return typeof arguments[0] == "object" ? go : go.apply(null, arguments);
};
typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__;
function Gs(e, t) {
	function n(...n) {
		if (t) {
			let r = t(...n);
			if (!r) throw Error($c(0));
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
	return n.toString = () => `${e}`, n.type = e, n.match = (t) => vo(t) && t.type === e, n;
}
var Ks = class e extends Array {
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
function qs(e) {
	return Mo(e) ? Bs(e, () => {}) : e;
}
function Js(e, t, n) {
	return e.has(t) ? e.get(t) : e.set(t, n(t)).get(t);
}
function Ys(e) {
	return typeof e == "boolean";
}
var Xs = () => function(e) {
	let { thunk: t = !0, immutableCheck: n = !0, serializableCheck: r = !0, actionCreatorCheck: i = !0 } = e ?? {}, a = new Ks();
	return t && (Ys(t) ? a.push(Hs) : a.push(Us(t.extraArgument))), a;
}, Zs = "RTK_autoBatch", W = () => (e) => ({
	payload: e,
	meta: { [Zs]: !0 }
}), Qs = (e) => (t) => {
	setTimeout(t, e);
}, $s = (e, t) => (n) => {
	let r = !1, i = () => {
		r || (r = !0, cancelAnimationFrame(a), clearTimeout(o), n());
	}, a = e(i), o = setTimeout(i, t);
}, ec = (e = { type: "raf" }) => (t) => (...n) => {
	let r = t(...n), i = !0, a = !1, o = !1, s = /* @__PURE__ */ new Set(), c = e.type === "tick" ? queueMicrotask : e.type === "raf" ? typeof window < "u" && window.requestAnimationFrame ? $s(window.requestAnimationFrame, 100) : Qs(10) : e.type === "callback" ? e.queueNotification : Qs(e.timeout), l = () => {
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
				return i = !e?.meta?.[Zs], a = !i, a && (o || (o = !0, c(l))), r.dispatch(e);
			} finally {
				i = !0;
			}
		}
	});
}, tc = (e) => function(t) {
	let { autoBatch: n = !0 } = t ?? {}, r = new Ks(e);
	return n && r.push(ec(typeof n == "object" ? n : void 0)), r;
};
function nc(e) {
	let t = Xs(), { reducer: n = void 0, middleware: r, devTools: i = !0, duplicateMiddlewareCheck: a = !0, preloadedState: o = void 0, enhancers: s = void 0 } = e || {}, c;
	if (typeof n == "function") c = n;
	else if (fo(n)) c = ho(n);
	else throw Error($c(1));
	let l;
	l = typeof r == "function" ? r(t) : t();
	let u = go;
	i && (u = Ws({
		trace: !1,
		...typeof i == "object" && i
	}));
	let d = tc(_o(...l)), f = typeof s == "function" ? s(d) : d(), p = u(...f);
	return po(c, o, p);
}
function rc(e) {
	let t = {}, n = [], r, i = {
		addCase(e, n) {
			let r = typeof e == "string" ? e : e.type;
			if (!r) throw Error($c(28));
			if (r in t) throw Error($c(29));
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
function ic(e) {
	return typeof e == "function";
}
function ac(e, t) {
	let [n, r, i] = rc(t), a;
	if (ic(e)) a = () => qs(e());
	else {
		let t = qs(e);
		a = () => t;
	}
	function o(e = a(), t) {
		let o = [n[t.type], ...r.filter(({ matcher: e }) => e(t)).map(({ reducer: e }) => e)];
		return o.filter((e) => !!e).length === 0 && (o = [i]), o.reduce((e, n) => {
			if (n) {
				if (jo(e)) {
					let r = n(e, t);
					return r === void 0 ? e : r;
				}
				if (Mo(e)) return Bs(e, (e) => n(e, t));
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
var oc = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW", sc = (e = 21) => {
	let t = "", n = e;
	for (; n--;) t += oc[Math.random() * 64 | 0];
	return t;
}, cc = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
function lc(e, t) {
	return `${e}/${t}`;
}
function uc({ creators: e } = {}) {
	let t = e?.asyncThunk?.[cc];
	return function(e) {
		let { name: n, reducerPath: r = n } = e;
		if (!n) throw Error($c(11));
		let i = (typeof e.reducers == "function" ? e.reducers(pc()) : e.reducers) || {}, a = Object.keys(i), o = {
			sliceCaseReducersByName: {},
			sliceCaseReducersByType: {},
			actionCreators: {},
			sliceMatchers: []
		}, s = {
			addCase(e, t) {
				let n = typeof e == "string" ? e : e.type;
				if (!n) throw Error($c(12));
				if (n in o.sliceCaseReducersByType) throw Error($c(13));
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
				type: lc(n, r),
				createNotation: typeof e.reducers == "function"
			};
			hc(a) ? _c(o, a, s, t) : mc(o, a, s);
		});
		function c() {
			let [t = {}, n = [], r = void 0] = typeof e.extraReducers == "function" ? rc(e.extraReducers) : [e.extraReducers], i = {
				...t,
				...o.sliceCaseReducersByType
			};
			return ac(e.initialState, (e) => {
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
				return i === void 0 && n && (i = Js(d, r, m)), i;
			}
			function i(t = l) {
				return Js(Js(u, n, () => /* @__PURE__ */ new WeakMap()), t, () => {
					let r = {};
					for (let [i, a] of Object.entries(e.selectors ?? {})) r[i] = dc(a, t, () => Js(d, t, m), n);
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
function dc(e, t, n, r) {
	function i(i, ...a) {
		let o = t(i);
		return o === void 0 && r && (o = n()), e(o, ...a);
	}
	return i.unwrapped = e, i;
}
var fc = /* @__PURE__ */ uc();
function pc() {
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
function mc({ type: e, reducerName: t, createNotation: n }, r, i) {
	let a, o;
	if ("reducer" in r) {
		if (n && !gc(r)) throw Error($c(17));
		a = r.reducer, o = r.prepare;
	} else a = r;
	i.addCase(e, a).exposeCaseReducer(t, a).exposeAction(t, o ? Gs(e, o) : Gs(e));
}
function hc(e) {
	return e._reducerDefinitionType === "asyncThunk";
}
function gc(e) {
	return e._reducerDefinitionType === "reducerWithPrepare";
}
function _c({ type: e, reducerName: t }, n, r, i) {
	if (!i) throw Error($c(18));
	let { payloadCreator: a, fulfilled: o, pending: s, rejected: c, settled: l, options: u } = n, d = i(e, a, u);
	r.exposeAction(t, d), o && r.addCase(d.fulfilled, o), s && r.addCase(d.pending, s), c && r.addCase(d.rejected, c), l && r.addMatcher(d.settled, l), r.exposeCaseReducer(t, {
		fulfilled: o || vc,
		pending: s || vc,
		rejected: c || vc,
		settled: l || vc
	});
}
function vc() {}
var yc = "task", bc = "listener", xc = "completed", Sc = "cancelled", Cc = `task-${Sc}`, wc = `task-${xc}`, Tc = `${bc}-${Sc}`, Ec = `${bc}-${xc}`, Dc = class {
	constructor(e) {
		this.code = e, this.message = `${yc} ${Sc} (reason: ${e})`;
	}
	code;
	name = "TaskAbortError";
	message;
}, Oc = (e, t) => {
	if (typeof e != "function") throw TypeError($c(32));
}, kc = () => {}, Ac = (e, t = kc) => (e.catch(t), e), jc = (e, t) => (e.addEventListener("abort", t, { once: !0 }), () => e.removeEventListener("abort", t)), Mc = (e) => {
	if (e.aborted) throw new Dc(e.reason);
};
function Nc(e, t) {
	let n = kc;
	return new Promise((r, i) => {
		let a = () => i(new Dc(e.reason));
		e.aborted ? a() : (n = jc(e, a), t.finally(() => n()).then(r, i));
	}).finally(() => {
		n = kc;
	});
}
var Pc = async (e, t) => {
	try {
		return await Promise.resolve(), {
			status: "ok",
			value: await e()
		};
	} catch (e) {
		return {
			status: e instanceof Dc ? "cancelled" : "rejected",
			error: e
		};
	} finally {
		t?.();
	}
}, Fc = (e) => (t) => Ac(Nc(e, t).then((t) => (Mc(e), t))), Ic = (e) => {
	let t = Fc(e);
	return (e) => t(new Promise((t) => setTimeout(t, e)));
}, { assign: Lc } = Object, Rc = {}, zc = "listenerMiddleware", Bc = (e, t) => {
	let n = (t) => jc(e, () => t.abort(e.reason));
	return (r, i) => {
		Oc(r, "taskExecutor");
		let a = new AbortController();
		n(a);
		let o = Pc(async () => {
			Mc(e), Mc(a.signal);
			let t = await r({
				pause: Fc(a.signal),
				delay: Ic(a.signal),
				signal: a.signal
			});
			return Mc(a.signal), t;
		}, () => a.abort(wc));
		return i?.autoJoin && t.push(o.catch(kc)), {
			result: Fc(e)(o),
			cancel() {
				a.abort(Cc);
			}
		};
	};
}, Vc = (e, t) => {
	let n = async (n, r) => {
		Mc(t);
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
			let e = await Nc(t, Promise.race(a));
			return Mc(t), e;
		} finally {
			i();
		}
	};
	return ((e, t) => Ac(n(e, t)));
}, Hc = (e) => {
	let { type: t, actionCreator: n, matcher: r, predicate: i, effect: a } = e;
	if (t) i = Gs(t).match;
	else if (n) t = n.type, i = n.match;
	else if (r) i = r;
	else if (!i) throw Error($c(21));
	return Oc(a, "options.listener"), {
		predicate: i,
		type: t,
		effect: a
	};
}, Uc = /* @__PURE__ */ Lc((e) => {
	let { type: t, predicate: n, effect: r } = Hc(e);
	return {
		id: sc(),
		effect: r,
		type: t,
		predicate: n,
		pending: /* @__PURE__ */ new Set(),
		unsubscribe: () => {
			throw Error($c(22));
		}
	};
}, { withTypes: () => Uc }), Wc = (e, t) => {
	let { type: n, effect: r, predicate: i } = Hc(t);
	return Array.from(e.values()).find((e) => (typeof n == "string" ? e.type === n : e.predicate === i) && e.effect === r);
}, Gc = (e) => {
	e.pending.forEach((e) => {
		e.abort(Tc);
	});
}, Kc = (e, t) => () => {
	for (let e of t.keys()) Gc(e);
	e.clear();
}, qc = (e, t, n) => {
	try {
		e(t, n);
	} catch (e) {
		setTimeout(() => {
			throw e;
		}, 0);
	}
}, Jc = /* @__PURE__ */ Lc(/* @__PURE__ */ Gs(`${zc}/add`), { withTypes: () => Jc }), Yc = /* @__PURE__ */ Gs(`${zc}/removeAll`), Xc = /* @__PURE__ */ Lc(/* @__PURE__ */ Gs(`${zc}/remove`), { withTypes: () => Xc }), Zc = (...e) => {
	console.error(`${zc}/error`, ...e);
}, Qc = (e = {}) => {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e) => {
		let t = n.get(e) ?? 0;
		n.set(e, t + 1);
	}, i = (e) => {
		let t = n.get(e) ?? 1;
		t === 1 ? n.delete(e) : n.set(e, t - 1);
	}, { extra: a, onError: o = Zc } = e;
	Oc(o, "onError");
	let s = (e) => (e.unsubscribe = () => t.delete(e.id), t.set(e.id, e), (t) => {
		e.unsubscribe(), t?.cancelActive && Gc(e);
	}), c = ((e) => {
		let n = Wc(t, e) ?? Uc(e);
		return s(n);
	});
	Lc(c, { withTypes: () => c });
	let l = (e) => {
		let n = Wc(t, e);
		return n && (n.unsubscribe(), e.cancelActive && Gc(n)), !!n;
	};
	Lc(l, { withTypes: () => l });
	let u = async (e, n, s, l) => {
		let u = new AbortController(), d = Vc(c, u.signal), f = [];
		try {
			e.pending.add(u), r(e), await Promise.resolve(e.effect(n, Lc({}, s, {
				getOriginalState: l,
				condition: (e, t) => d(e, t).then(Boolean),
				take: d,
				delay: Ic(u.signal),
				pause: Fc(u.signal),
				extra: a,
				signal: u.signal,
				fork: Bc(u.signal, f),
				unsubscribe: e.unsubscribe,
				subscribe: () => {
					t.set(e.id, e);
				},
				cancelActiveListeners: () => {
					e.pending.forEach((e, t, n) => {
						e !== u && (e.abort(Tc), n.delete(e));
					});
				},
				cancel: () => {
					u.abort(Tc), e.pending.delete(u);
				},
				throwIfCancelled: () => {
					Mc(u.signal);
				}
			})));
		} catch (e) {
			e instanceof Dc || qc(o, e, { raisedBy: "effect" });
		} finally {
			await Promise.all(f), u.abort(Ec), i(e), e.pending.delete(u);
		}
	}, d = Kc(t, n);
	return {
		middleware: (e) => (n) => (r) => {
			if (!vo(r)) return n(r);
			if (Jc.match(r)) return c(r.payload);
			if (Yc.match(r)) {
				d();
				return;
			}
			if (Xc.match(r)) return l(r.payload);
			let i = e.getState(), a = () => {
				if (i === Rc) throw Error($c(23));
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
							s = !1, qc(o, e, { raisedBy: "predicate" });
						}
						s && u(t, r, e, a);
					}
				}
			} finally {
				i = Rc;
			}
			return s;
		},
		startListening: c,
		stopListening: l,
		clearListeners: d
	};
};
function $c(e) {
	return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/layoutSlice.js
var el = fc({
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
}), tl = el.actions, nl = tl.setMargin, rl = tl.setLayout, il = tl.setChartSize, al = tl.setScale, ol = el.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/util/getSliced.js
function sl(e, t, n) {
	return Array.isArray(e) && e && t + n !== 0 ? e.slice(t, n + 1) : e;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/isWellBehavedNumber.js
function G(e) {
	return Number.isFinite(e);
}
function cl(e) {
	return typeof e == "number" && e > 0 && Number.isFinite(e);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/ChartUtils.js
function ll(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ul(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ll(Object(n), !0).forEach(function(t) {
			dl(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ll(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function dl(e, t, n) {
	return (t = fl(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function fl(e) {
	var t = pl(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function pl(e, t) {
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
	return R(e) || R(t) ? n : Lt(t) ? kt(e, t, n) : typeof t == "function" ? t(e) : n;
}
var ml = (e, t, n) => {
	if (t && n) {
		var r = n.width, i = n.height, a = t.align, o = t.verticalAlign, s = t.layout, c = t.position, l = t.offset, u = l === void 0 ? 0 : l;
		if (c != null) {
			if (en(c)) {
				if (c === "top" && I(e.top)) return ul(ul({}, e), {}, { top: e.top + (i || 0) + u });
				if (c === "bottom" && I(e.bottom)) return ul(ul({}, e), {}, { bottom: e.bottom + (i || 0) + u });
				if (c === "left" && I(e.left)) return ul(ul({}, e), {}, { left: e.left + (r || 0) + u });
				if (c === "right" && I(e.right)) return ul(ul({}, e), {}, { right: e.right + (r || 0) + u });
			}
			return e;
		}
		if ((s === "vertical" || s === "horizontal" && o === "middle") && a !== "center" && I(e[a])) return ul(ul({}, e), {}, { [a]: e[a] + (r || 0) });
		if ((s === "horizontal" || s === "vertical" && a === "center") && o !== "middle" && I(e[o])) return ul(ul({}, e), {}, { [o]: e[o] + (i || 0) });
	}
	return e;
}, hl = (e, t) => e === "horizontal" && t === "xAxis" || e === "vertical" && t === "yAxis" || e === "centric" && t === "angleAxis" || e === "radial" && t === "radiusAxis", gl = (e, t, n, r) => {
	if (r) return e.map((e) => e.coordinate);
	var i, a, o = e.map((e) => (e.coordinate === t && (i = !0), e.coordinate === n && (a = !0), e.coordinate));
	return i || o.push(t), a || o.push(n), o;
}, _l = (e, t, n) => {
	if (!e) return null;
	var r = e.duplicateDomain, i = e.type, a = e.range, o = e.scale, s = e.realScaleType, c = e.isCategorical, l = e.categoricalDomain, u = e.tickCount, d = e.ticks, f = e.niceTicks, p = e.axisType;
	if (!o) return null;
	var m = s === "scaleBand" && o.bandwidth ? o.bandwidth() / 2 : 2, h = (t || n) && i === "category" && o.bandwidth ? o.bandwidth() / m : 0;
	return h = p === "angleAxis" && a && a.length >= 2 ? Pt(a[0] - a[1]) * 2 * h : h, t && (d || f) ? (d || f || []).map((e, t) => {
		var n = r ? r.indexOf(e) : e, i = o.map(n);
		return G(i) ? {
			coordinate: i + h,
			value: e,
			offset: h,
			index: t
		} : null;
	}).filter(Wt) : c && l ? l.map((e, t) => {
		var n = o.map(e);
		return G(n) ? {
			coordinate: n + h,
			value: e,
			index: t,
			offset: h
		} : null;
	}).filter(Wt) : o.ticks && !n && u != null ? o.ticks(u).map((e, t) => {
		var n = o.map(e);
		return G(n) ? {
			coordinate: n + h,
			value: e,
			index: t,
			offset: h
		} : null;
	}).filter(Wt) : o.domain().map((e, t) => {
		var n = o.map(e);
		return G(n) ? {
			coordinate: n + h,
			value: r ? r[e] : e,
			index: t,
			offset: h
		} : null;
	}).filter(Wt);
}, vl = (e, t) => {
	if (!t || t.length !== 2 || !I(t[0]) || !I(t[1])) return e;
	var n = Math.min(t[0], t[1]), r = Math.max(t[0], t[1]), i = [e[0], e[1]];
	return (!I(e[0]) || e[0] < n) && (i[0] = n), (!I(e[1]) || e[1] > r) && (i[1] = r), i[0] > r && (i[0] = r), i[1] < n && (i[1] = n), i;
}, yl = {
	sign: (e) => {
		var t = e.length;
		if (!(t <= 0)) {
			var n = e[0]?.length;
			if (!(n == null || n <= 0)) for (var r = 0; r < n; ++r) for (var i = 0, a = 0, o = 0; o < t; ++o) {
				var s = e[o]?.[r];
				if (s != null) {
					var c = s[1], l = s[0], u = Ft(c) ? l : c;
					u >= 0 ? (s[0] = i, i += u, s[1] = i) : (s[0] = a, a += u, s[1] = a);
				}
			}
		}
	},
	expand: Cr,
	none: vr,
	silhouette: wr,
	wiggle: Tr,
	positive: (e) => {
		var t = e.length;
		if (!(t <= 0)) {
			var n = e[0]?.length;
			if (!(n == null || n <= 0)) for (var r = 0; r < n; ++r) for (var i = 0, a = 0; a < t; ++a) {
				var o = e[a]?.[r];
				if (o != null) {
					var s = Ft(o[1]) ? o[0] : o[1];
					s >= 0 ? (o[0] = i, i += s, o[1] = i) : (o[0] = 0, o[1] = 0);
				}
			}
		}
	}
}, bl = (e, t, n) => {
	var r = yl[n] ?? vr, i = Sr().keys(t).value((e, t) => Number(K(e, t, 0))).order(yr).offset(r)(e);
	return i.forEach((n, r) => {
		n.forEach((n, i) => {
			var a = K(e[i], t[r], 0);
			Array.isArray(a) && a.length === 2 && I(a[0]) && I(a[1]) && (n[0] = a[0], n[1] = a[1]);
		});
	}), i;
};
function xl(e) {
	return e == null ? void 0 : String(e);
}
function Sl(e) {
	var t = e.axis, n = e.ticks, r = e.bandSize, i = e.entry, a = e.index, o = e.dataKey;
	if (t.type === "category") {
		if (!t.allowDuplicatedCategory && t.dataKey && !R(i[t.dataKey])) {
			var s = Ht(n, "value", i[t.dataKey]);
			if (s) return s.coordinate + r / 2;
		}
		return n != null && n[a] ? n[a].coordinate + r / 2 : null;
	}
	var c = K(i, R(o) ? t.dataKey : o), l = t.scale.map(c);
	return I(l) ? l : null;
}
var Cl = (e) => {
	var t = e.axis, n = e.ticks, r = e.offset, i = e.bandSize, a = e.entry, o = e.index;
	if (t.type === "category") return n[o] ? n[o].coordinate + r : null;
	var s = K(a, t.dataKey, t.scale.domain()[o]);
	if (R(s)) return null;
	var c = t.scale.map(s);
	return I(c) ? c - i / 2 + r : null;
}, wl = (e) => {
	var t = e.numericAxis, n = t.scale.domain();
	if (t.type === "number") {
		var r = Math.min(n[0], n[1]), i = Math.max(n[0], n[1]);
		return r <= 0 && i >= 0 ? 0 : i < 0 ? i : r;
	}
	return n[0];
}, Tl = (e) => {
	var t = e.flat(2).filter(I);
	return [Math.min(...t), Math.max(...t)];
}, El = (e) => [e[0] === Infinity ? 0 : e[0], e[1] === -Infinity ? 0 : e[1]], Dl = (e, t, n) => {
	if (e != null && Object.keys(e).length !== 0) return El(Object.keys(e).reduce((r, i) => {
		var a = e[i];
		if (!a) return r;
		var o = a.stackedData.reduce((e, r) => {
			var i = Tl(sl(r, t, n));
			return !G(i[0]) || !G(i[1]) ? e : [Math.min(e[0], i[0]), Math.max(e[1], i[1])];
		}, [Infinity, -Infinity]);
		return [Math.min(o[0], r[0]), Math.max(o[1], r[1])];
	}, [Infinity, -Infinity]));
}, Ol = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/, kl = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/, Al = (e, t, n) => {
	if (e && e.scale && e.scale.bandwidth) {
		var r = e.scale.bandwidth();
		if (!n || r > 0) return r;
	}
	if (e && t && t.length >= 2) {
		for (var i = Ka(t, (e) => e.coordinate), a = [], o = 0, s = 1, c = i.length; s < c; s++) {
			var l = (i[s]?.coordinate || 0) - (i[s - 1]?.coordinate || 0);
			a.push(l), o = Math.max(l, o);
		}
		var u = o * 1e-4, d = Infinity;
		for (var f of a) f > u && (d = Math.min(f, d));
		return d === Infinity ? 0 : d;
	}
	return n ? void 0 : 0;
};
function jl(e) {
	var t = e.tooltipEntrySettings, n = e.dataKey, r = e.payload, i = e.value, a = e.name;
	return ul(ul({}, t), {}, {
		dataKey: n,
		payload: r,
		value: i,
		name: a
	});
}
function Ml(e, t) {
	if (e != null) return String(e);
	if (typeof t == "string") return t;
}
var Nl = (e, t) => {
	if (t === "horizontal") return e.relativeX;
	if (t === "vertical") return e.relativeY;
}, Pl = (e, t) => t === "centric" ? e.angle : e.radius, Fl = (e) => e.layout.width, Il = (e) => e.layout.height, Ll = (e) => e.layout.scale, Rl = (e) => e.layout.margin, zl = H((e) => e.cartesianAxis.xAxis, (e) => Object.values(e)), Bl = H((e) => e.cartesianAxis.yAxis, (e) => Object.values(e)), Vl = "data-recharts-item-index";
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/selectChartOffsetInternal.js
function Hl(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Ul(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Hl(Object(n), !0).forEach(function(t) {
			Wl(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Hl(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Wl(e, t, n) {
	return (t = Gl(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Gl(e) {
	var t = Kl(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Kl(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var ql = (e) => e.brush.height;
function Jl(e) {
	return Bl(e).reduce((e, t) => t.orientation === "left" && !t.mirror && !t.hide ? e + (typeof t.width == "number" ? t.width : 60) : e, 0);
}
function Yl(e) {
	return Bl(e).reduce((e, t) => t.orientation === "right" && !t.mirror && !t.hide ? e + (typeof t.width == "number" ? t.width : 60) : e, 0);
}
function Xl(e) {
	return zl(e).reduce((e, t) => t.orientation === "top" && !t.mirror && !t.hide ? e + (typeof t.height == "number" ? t.height : 30) : e, 0);
}
function Zl(e) {
	return zl(e).reduce((e, t) => t.orientation === "bottom" && !t.mirror && !t.hide ? e + (typeof t.height == "number" ? t.height : 30) : e, 0);
}
var Ql = H([
	Fl,
	Il,
	Rl,
	ql,
	Jl,
	Yl,
	Xl,
	Zl,
	qa,
	Ja
], (e, t, n, r, i, a, o, s, c, l) => {
	var u = {
		left: (n.left || 0) + i,
		right: (n.right || 0) + a
	}, d = Ul(Ul({}, {
		top: (n.top || 0) + o,
		bottom: (n.bottom || 0) + s
	}), u), f = d.bottom;
	d.bottom += r, d = ml(d, c, l);
	var p = e - d.left - d.right, m = t - d.top - d.bottom;
	return Ul(Ul({ brushBottom: f }, d), {}, {
		width: Math.max(p, 0),
		height: Math.max(m, 0)
	});
}), $l = H(Ql, (e) => ({
	x: e.left,
	y: e.top,
	width: e.width,
	height: e.height
})), eu = H(Fl, Il, (e, t) => ({
	x: 0,
	y: 0,
	width: e,
	height: t
})), tu = /*#__PURE__*/ (0, P.createContext)(null), nu = () => (0, P.useContext)(tu) != null, ru = (e) => e.brush, iu = H([
	ru,
	Ql,
	Rl
], (e, t, n) => ({
	height: e.height,
	x: I(e.x) ? e.x : t.left,
	y: I(e.y) ? e.y : t.top + t.height + t.brushBottom - (n?.bottom || 0),
	width: I(e.width) ? e.width : t.width
}));
// ../../../peach/frontend/node_modules/es-toolkit/dist/function/debounce.mjs
function au(e, t, { signal: n, edges: r } = {}) {
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
function ou(e, t = 0, n = {}) {
	typeof n != "object" && (n = {});
	let { leading: r = !1, trailing: i = !0, maxWait: a } = n, o = [, ,];
	r && (o[0] = "leading"), i && (o[1] = "trailing");
	let s, c = null, l = au(function(...t) {
		s = e.apply(this, t), c = null;
	}, t, { edges: o }), u = function(...t) {
		return a != null && (c === null && (c = Date.now()), Date.now() - c >= a) ? ((r || i) && (s = e.apply(this, t)), c = Date.now(), l.cancel(), l.schedule(), s) : (l.apply(this, t), s);
	};
	return u.cancel = l.cancel, u.flush = () => (l.flush(), s), u;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/function/throttle.mjs
function su(e, t = 0, n = {}) {
	let { leading: r = !0, trailing: i = !0 } = n;
	return ou(e, t, {
		leading: r,
		maxWait: t,
		trailing: i
	});
}
// ../../../peach/frontend/node_modules/recharts/es6/util/LogUtils.js
var cu = function(e, t) {
	var n = [...arguments].slice(2);
	if (typeof console < "u" && console.warn && (t === void 0 && console.warn("LogUtils requires an error message argument"), !e)) {
		if (t === void 0) console.warn("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
		else {
			var r = 0;
			console.warn(t.replace(/%s/g, () => n[r++]));
		}
	}
}, lu = {
	width: "100%",
	height: "100%",
	debounce: 0,
	minWidth: 0,
	initialDimension: {
		width: -1,
		height: -1
	}
}, uu = (e, t, n) => {
	var r = n.width, i = r === void 0 ? lu.width : r, a = n.height, o = a === void 0 ? lu.height : a, s = n.aspect, c = n.maxHeight, l = It(i) ? e : Number(i), u = It(o) ? t : Number(o);
	return s && s > 0 && (l ? u = l / s : u && (l = u * s), c && u != null && u > c && (u = c)), {
		calculatedWidth: l,
		calculatedHeight: u
	};
}, du = {
	width: 0,
	height: 0,
	overflow: "visible"
}, fu = {
	width: 0,
	overflowX: "visible"
}, pu = {
	height: 0,
	overflowY: "visible"
}, mu = {}, hu = (e) => {
	var t = e.width, n = e.height, r = It(t), i = It(n);
	return r && i ? du : r ? fu : i ? pu : mu;
};
function gu(e) {
	var t = e.width, n = e.height, r = e.aspect, i = t, a = n;
	return i === void 0 && a === void 0 ? (i = lu.width, a = lu.height) : i === void 0 ? i = r && r > 0 ? void 0 : lu.width : a === void 0 && (a = r && r > 0 ? void 0 : lu.height), {
		width: i,
		height: a
	};
}
// ../../../peach/frontend/node_modules/recharts/es6/component/ResponsiveContainer.js
var _u = [
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
function vu() {
	return vu = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, vu.apply(null, arguments);
}
function yu(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function bu(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? yu(Object(n), !0).forEach(function(t) {
			xu(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yu(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function xu(e, t, n) {
	return (t = Su(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Su(e) {
	var t = Cu(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Cu(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function wu(e, t) {
	return ku(e) || Ou(e, t) || Eu(e, t) || Tu();
}
function Tu() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Eu(e, t) {
	if (e) {
		if (typeof e == "string") return Du(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Du(e, t) : void 0;
	}
}
function Du(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Ou(e, t) {
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
function ku(e) {
	if (Array.isArray(e)) return e;
}
function Au(e, t) {
	if (e == null) return {};
	var n, r, i = ju(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function ju(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var Mu = /*#__PURE__*/ (0, P.createContext)(lu.initialDimension);
function Nu(e) {
	return cl(e.width) && cl(e.height);
}
function Pu(e) {
	var t = e.children, n = e.width, r = e.height, i = (0, P.useMemo)(() => ({
		width: n,
		height: r
	}), [n, r]);
	return Nu(i) ? /*#__PURE__*/ P.createElement(Mu.Provider, { value: i }, t) : null;
}
var Fu = () => (0, P.useContext)(Mu), Iu = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.aspect, r = e.initialDimension, i = r === void 0 ? lu.initialDimension : r, a = e.width, o = e.height, s = e.minWidth, c = s === void 0 ? lu.minWidth : s, l = e.minHeight, u = e.maxHeight, d = e.children, f = e.debounce, p = f === void 0 ? lu.debounce : f, m = e.id, h = e.className, g = e.onResize, _ = e.style, v = _ === void 0 ? {} : _, y = Au(e, _u), b = (0, P.useRef)(null), x = (0, P.useRef)();
	x.current = g, (0, P.useImperativeHandle)(t, () => b.current);
	var S = wu((0, P.useState)({
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
		if (b.current == null || typeof ResizeObserver > "u") return Gt;
		var e = (e) => {
			var t, n = e[0];
			if (n != null) {
				var r = n.contentRect, i = r.width, a = r.height;
				T(i, a), (t = x.current) == null || t.call(x, i, a);
			}
		};
		p > 0 && (e = su(e, p, {
			trailing: !0,
			leading: !1
		}));
		var t = new ResizeObserver(e), n = b.current.getBoundingClientRect(), r = n.width, i = n.height;
		return T(r, i), t.observe(b.current), () => {
			t.disconnect();
		};
	}, [T, p]);
	var E = C.containerWidth, D = C.containerHeight;
	cu(!n || n > 0, "The aspect(%s) must be greater than zero.", n);
	var O = uu(E, D, {
		width: a,
		height: o,
		aspect: n,
		maxHeight: u
	}), k = O.calculatedWidth, A = O.calculatedHeight;
	return cu(E < 0 || D < 0 || k != null && k > 0 || A != null && A > 0, "The width(%s) and height(%s) of chart should be greater than 0,\n       please check the style of container, or the props width(%s) and height(%s),\n       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the\n       height and width.", k, A, a, o, c, l, n), /*#__PURE__*/ P.createElement("div", vu({
		id: m ? `${m}` : void 0,
		className: N("recharts-responsive-container", h),
		style: bu(bu({}, v), {}, {
			width: a,
			height: o,
			minWidth: c,
			minHeight: l,
			maxHeight: u
		}),
		ref: b
	}, y), /*#__PURE__*/ P.createElement("div", { style: hu({
		width: a,
		height: o
	}) }, /*#__PURE__*/ P.createElement(Pu, {
		width: k,
		height: A
	}, d)));
}), Lu = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = Fu();
	if (cl(n.width) && cl(n.height)) return e.children;
	var r = gu({
		width: e.width,
		height: e.height,
		aspect: e.aspect
	}), i = r.width, a = r.height, o = uu(void 0, void 0, {
		width: i,
		height: a,
		aspect: e.aspect,
		maxHeight: e.maxHeight
	}), s = o.calculatedWidth, c = o.calculatedHeight;
	return I(s) && I(c) ? /*#__PURE__*/ P.createElement(Pu, {
		width: s,
		height: c
	}, e.children) : /*#__PURE__*/ P.createElement(Iu, vu({}, e, {
		width: i,
		height: a,
		ref: t
	}));
}), Ru = () => {
	var e = nu(), t = V($l), n = V(iu), r = V(ru)?.padding;
	return !e || !n || !r ? t : {
		width: n.width - r.left - r.right,
		height: n.height - r.top - r.bottom,
		x: r.left,
		y: r.top
	};
}, zu = {
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	width: 0,
	height: 0,
	brushBottom: 0
}, Bu = () => V(Ql) ?? zu, Vu = () => V(Fl), Hu = () => V(Il), Uu = () => V((e) => e.layout.margin), q = (e) => e.layout.layoutType, Wu = () => V(q), Gu = () => {
	var e = Wu();
	if (e === "horizontal" || e === "vertical") return e;
}, Ku = (e) => {
	var t = e.layout.layoutType;
	if (t === "centric" || t === "radial") return t;
}, qu = () => V(Ku), Ju = () => Wu() !== void 0, Yu = (e) => {
	var t = B(), n = nu(), r = e.width, i = e.height, a = Fu(), o = r, s = i;
	return a && (o = a.width > 0 ? a.width : r, s = a.height > 0 ? a.height : i), (0, P.useEffect)(() => {
		!n && cl(o) && cl(s) && t(il({
			width: o,
			height: s
		}));
	}, [
		t,
		n,
		o,
		s
	]), null;
}, Xu = fc({
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
				var n = t.payload, r = n.prev, i = n.next, a = Rs(e).payload.indexOf(U(r));
				a > -1 && (e.payload[a] = U(i));
			},
			prepare: W()
		},
		removeLegendPayload: {
			reducer(e, t) {
				var n = Rs(e).payload.indexOf(U(t.payload));
				n > -1 && e.payload.splice(n, 1);
			},
			prepare: W()
		}
	}
}), Zu = Xu.actions, Qu = Zu.setLegendSize, $u = Zu.setLegendSettings, ed = Zu.addLegendPayload, td = Zu.replaceLegendPayload, nd = Zu.removeLegendPayload, rd = Xu.reducer, id = /* @__PURE__ */ T(((e) => {
	var t = Ee();
	t.useSyncExternalStore, t.useRef, t.useEffect, t.useMemo, t.useDebugValue;
}));
(/* @__PURE__ */ T(((e, t) => {
	t.exports = id();
})))();
function ad(e) {
	e();
}
function od() {
	let e = null, t = null;
	return {
		clear() {
			e = null, t = null;
		},
		notify() {
			ad(() => {
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
var sd = {
	notify() {},
	get: () => []
};
function cd(e, t) {
	let n, r = sd, i = 0, a = !1;
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
		i++, n || (n = t ? t.addNestedSub(c) : e.subscribe(c), r = od());
	}
	function d() {
		i--, n && i === 0 && (n(), n = void 0, r.clear(), r = sd);
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
var ld = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, ud = typeof navigator < "u" && navigator.product === "ReactNative", dd = ld || ud ? P.useLayoutEffect : P.useEffect;
function fd(e, t) {
	return e === t ? e !== 0 || t !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
function pd(e, t) {
	if (fd(e, t)) return !0;
	if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r = 0; r < n.length; r++) if (!Object.prototype.hasOwnProperty.call(t, n[r]) || !fd(e[n[r]], t[n[r]])) return !1;
	return !0;
}
var md = /* @__PURE__ */ Symbol.for("react-redux-context"), hd = typeof globalThis < "u" ? globalThis : {};
function gd() {
	if (!P.createContext) return {};
	let e = hd[md] ??= /* @__PURE__ */ new Map(), t = e.get(P.createContext);
	return t || (t = P.createContext(null), e.set(P.createContext, t)), t;
}
var _d = /* @__PURE__ */ gd();
function vd(e) {
	let { children: t, context: n, serverState: r, store: i } = e, a = P.useMemo(() => {
		let e = cd(i);
		return {
			store: i,
			subscription: e,
			getServerState: r ? () => r : void 0
		};
	}, [i, r]), o = P.useMemo(() => i.getState(), [i]);
	dd(() => {
		let { subscription: e } = a;
		return e.onStateChange = e.notifyNestedSubs, e.trySubscribe(), o !== i.getState() && e.notifyNestedSubs(), () => {
			e.tryUnsubscribe(), e.onStateChange = void 0;
		};
	}, [a, o]);
	let s = n || _d;
	return /* @__PURE__ */ P.createElement(s.Provider, { value: a }, t);
}
var yd = vd, bd = /* @__PURE__ */ new Set([
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
function xd(e, t) {
	return e == null && t == null ? !0 : typeof e == "number" && typeof t == "number" ? e === t || e !== e && t !== t : e === t;
}
function Sd(e, t) {
	for (var n of /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])) if (bd.has(n)) {
		if (e[n] == null && t[n] == null) continue;
		if (!pd(e[n], t[n])) return !1;
	} else if (!xd(e[n], t[n])) return !1;
	return !0;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/selectLegendArea.js
var Cd = H([
	Fl,
	Il,
	Rl
], (e, t, n) => ({
	x: n.left || 0,
	y: n.top || 0,
	width: Math.max(e - (n.left || 0) - (n.right || 0), 0),
	height: Math.max(t - (n.top || 0) - (n.bottom || 0), 0)
}));
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/cartesianPositionToCSSTranslate.js
function wd(e, t) {
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
var Td = /* @__PURE__ */ D(De()), Ed = ["contextPayload"];
function Dd() {
	return Dd = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Dd.apply(null, arguments);
}
function Od(e, t) {
	return Nd(e) || Md(e, t) || Ad(e, t) || kd();
}
function kd() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ad(e, t) {
	if (e) {
		if (typeof e == "string") return jd(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jd(e, t) : void 0;
	}
}
function jd(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Md(e, t) {
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
function Nd(e) {
	if (Array.isArray(e)) return e;
}
function Pd(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Fd(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Pd(Object(n), !0).forEach(function(t) {
			Id(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pd(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Id(e, t, n) {
	return (t = Ld(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Ld(e) {
	var t = Rd(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Rd(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function zd(e, t) {
	if (e == null) return {};
	var n, r, i = Bd(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Bd(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function Vd(e) {
	return e.value;
}
function Hd(e) {
	var t = e.contextPayload, n = zd(e, Ed), r = va(t, e.payloadUniqBy, Vd), i = Fd(Fd({}, n), {}, { payload: r });
	return /*#__PURE__*/ P.isValidElement(e.content) ? /*#__PURE__*/ P.cloneElement(e.content, i) : typeof e.content == "function" ? /*#__PURE__*/ P.createElement(e.content, i) : /*#__PURE__*/ P.createElement(ci, i);
}
function Ud(e) {
	return e === "left" || e === "right" || e === "insideLeft" || e === "insideRight" ? "vertical" : "horizontal";
}
function Wd(e, t) {
	return t == null ? null : en(t) ? Cd(e) : $l(e);
}
function Gd(e, t, n) {
	return e === "top" ? { top: n.height + t } : e === "bottom" ? { top: -n.height - t } : e === "left" ? { left: n.width + t } : e === "right" ? { left: -n.width - t } : {};
}
function Kd(e, t, n, r, i, a) {
	var o = t.layout, s = t.align, c = t.verticalAlign, l, u;
	return e && (e.left !== void 0 && e.left !== null || e.right !== void 0 && e.right !== null) || (l = s === "center" && o === "vertical" ? { left: ((r || 0) - a.width) / 2 } : s === "right" ? { right: n && n.right || 0 } : { left: n && n.left || 0 }), e && (e.top !== void 0 && e.top !== null || e.bottom !== void 0 && e.bottom !== null) || (u = c === "middle" ? { top: ((i || 0) - a.height) / 2 } : c === "bottom" ? { bottom: n && n.bottom || 0 } : { top: n && n.top || 0 }), Fd(Fd({}, l), u);
}
function qd(e) {
	var t = e.align, n = e.layout, r = e.verticalAlign, i = e.itemSorter, a = e.position, o = e.offset, s = B();
	return (0, P.useLayoutEffect)(() => {
		s($u({
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
function Jd(e) {
	var t = e.width, n = e.height, r = B();
	return (0, P.useLayoutEffect)(() => {
		r(Qu({
			width: t,
			height: n
		}));
	}, [
		r,
		t,
		n
	]), (0, P.useLayoutEffect)(() => () => {
		r(Qu({
			width: 0,
			height: 0
		}));
	}, [r]), null;
}
function Yd(e, t, n, r) {
	return e === "vertical" && t != null ? { height: t } : e === "horizontal" ? { width: n || r } : null;
}
var Xd = {
	align: "center",
	iconSize: 14,
	inactiveColor: "#ccc",
	itemSorter: "value",
	labelStyle: {},
	layout: "auto",
	verticalAlign: "bottom",
	offset: 0
};
function Zd(e) {
	var t = Xr(e, Xd), n = e.layout && e.layout !== "auto" ? e.layout : Ud(t.position), r = Xa(), i = nn(), a = Uu(), o = V((e) => Wd(e, t.position)), s = t.width, c = t.height, l = t.wrapperStyle, u = t.portal, d = u == null && (t.position == null || en(t.position)), f = Od(oo([r]), 2), p = f[0], m = f[1], h = Vu(), g = Hu();
	if (h == null || g == null || t.position != null && o == null) return null;
	var _ = Yd(n, c, s, h - (a?.left || 0) - (a?.right || 0)), v = t.position == null ? null : Qt({
		viewBox: o ?? {
			x: 0,
			y: 0,
			width: h,
			height: g
		},
		position: t.position,
		offset: t.offset ?? 0
	}), y = Gd(t.position, t.offset ?? 0, p), b = n === "vertical" ? (o?.width ?? 0) / 2 : o?.width ?? 0, x = n === "horizontal" ? (o?.height ?? 0) / 2 : o?.height ?? 0, S = v ? {
		width: "max-content",
		height: "max-content",
		maxWidth: b,
		maxHeight: x,
		overflowY: "auto",
		top: v.y + (y.top ?? 0),
		left: v.x + (y.left ?? 0),
		transform: wd(v.horizontalAnchor, v.verticalAnchor)
	} : Kd(l, t, a, h, g, p), C = u ? l : Fd(Fd({
		position: "absolute",
		width: _?.width || s || "auto",
		height: _?.height || c || "auto"
	}, S), l), w = u ?? i;
	if (w == null || r == null) return null;
	var T = /*#__PURE__*/ P.createElement("div", {
		className: "recharts-legend-wrapper",
		style: C,
		ref: m
	}, /*#__PURE__*/ P.createElement(qd, {
		layout: n,
		align: t.align,
		verticalAlign: t.verticalAlign,
		itemSorter: t.itemSorter,
		position: t.position,
		offset: t.offset
	}), d && /*#__PURE__*/ P.createElement(Jd, p), /*#__PURE__*/ P.createElement(Hd, Dd({}, t, { layout: n }, _, {
		margin: a,
		chartWidth: h,
		chartHeight: g,
		contextPayload: r
	})));
	return /*#__PURE__*/ (0, Td.createPortal)(T, w);
}
var Qd = /*#__PURE__*/ P.memo(Zd, Sd);
Qd.displayName = "Legend";
// ../../../peach/frontend/node_modules/recharts/es6/component/DefaultTooltipContent.js
function $d() {
	return $d = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, $d.apply(null, arguments);
}
function ef(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function tf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ef(Object(n), !0).forEach(function(t) {
			nf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ef(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function nf(e, t, n) {
	return (t = rf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function rf(e) {
	var t = af(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function af(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function of(e, t) {
	return df(e) || uf(e, t) || cf(e, t) || sf();
}
function sf() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function cf(e, t) {
	if (e) {
		if (typeof e == "string") return lf(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? lf(e, t) : void 0;
	}
}
function lf(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function uf(e, t) {
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
function df(e) {
	if (Array.isArray(e)) return e;
}
function ff(e) {
	return Array.isArray(e) && Lt(e[0]) && Lt(e[1]) ? e.join(" ~ ") : e;
}
var pf = {
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
function mf(e, t) {
	return t == null ? e : Ka(e, t);
}
var hf = (e) => {
	var t = e.separator, n = t === void 0 ? pf.separator : t, r = e.contentStyle, i = e.itemStyle, a = e.labelStyle, o = a === void 0 ? pf.labelStyle : a, s = e.payload, c = e.formatter, l = e.itemSorter, u = e.wrapperClassName, d = e.labelClassName, f = e.label, p = e.labelFormatter, m = e.accessibilityLayer, h = m === void 0 ? pf.accessibilityLayer : m, g = () => {
		if (s && s.length) {
			var e = {
				padding: 0,
				margin: 0
			}, t = mf(s, l).map((e, t) => {
				if (!e || e.type === "none") return null;
				var r = e.formatter || c || ff, a = e.value, o = e.name, l = a, u = o;
				if (r) {
					var d = r(a, o, e, t, s);
					if (Array.isArray(d)) {
						var f = of(d, 2);
						l = f[0], u = f[1];
					} else if (d != null) l = d;
					else return null;
				}
				var p = tf(tf({}, pf.itemStyle), {}, { color: e.color || pf.itemStyle.color }, i);
				return /*#__PURE__*/ P.createElement("li", {
					className: "recharts-tooltip-item",
					key: `tooltip-item-${t}`,
					style: p
				}, Lt(u) ? /*#__PURE__*/ P.createElement("span", { className: "recharts-tooltip-item-name" }, u) : null, Lt(u) ? /*#__PURE__*/ P.createElement("span", { className: "recharts-tooltip-item-separator" }, n) : null, /*#__PURE__*/ P.createElement("span", { className: "recharts-tooltip-item-value" }, l), /*#__PURE__*/ P.createElement("span", { className: "recharts-tooltip-item-unit" }, e.unit || ""));
			});
			return /*#__PURE__*/ P.createElement("ul", {
				className: "recharts-tooltip-item-list",
				style: e
			}, t);
		}
		return null;
	}, _ = tf(tf({}, pf.contentStyle), r), v = tf({ margin: 0 }, o), y = !R(f), b = y ? f : "", x = N("recharts-default-tooltip", u), S = N("recharts-tooltip-label", d);
	y && p && s != null && (b = p(f, s));
	var C = h ? {
		role: "status",
		"aria-live": "assertive"
	} : {};
	return /*#__PURE__*/ P.createElement("div", $d({
		className: x,
		style: _
	}, C), /*#__PURE__*/ P.createElement("p", {
		className: S,
		style: v
	}, /*#__PURE__*/ P.isValidElement(b) ? b : `${b}`), g());
}, gf = "recharts-tooltip-wrapper", _f = { visibility: "hidden" };
function vf(e) {
	var t = e.coordinate, n = e.translateX, r = e.translateY;
	return N(gf, {
		[`${gf}-right`]: I(n) && t && I(t.x) && n >= t.x,
		[`${gf}-left`]: I(n) && t && I(t.x) && n < t.x,
		[`${gf}-bottom`]: I(r) && t && I(t.y) && r >= t.y,
		[`${gf}-top`]: I(r) && t && I(t.y) && r < t.y
	});
}
function yf(e) {
	var t = e.allowEscapeViewBox, n = e.coordinate, r = e.key, i = e.offset, a = e.position, o = e.reverseDirection, s = e.tooltipDimension, c = e.viewBox, l = e.viewBoxDimension;
	if (a && I(a[r])) return a[r];
	var u = n[r] - s - (i > 0 ? i : 0), d = n[r] + i;
	if (t[r]) return o[r] ? u : d;
	var f = c[r];
	return f == null ? 0 : o[r] ? Math.max(u < f ? d : u, f) : l == null ? 0 : d + s > f + l ? Math.max(u, f) : Math.max(d, f);
}
function bf(e) {
	var t = e.translateX, n = e.translateY;
	return { transform: e.useTranslate3d ? `translate3d(${t}px, ${n}px, 0)` : `translate(${t}px, ${n}px)` };
}
function xf(e) {
	var t = e.allowEscapeViewBox, n = e.coordinate, r = e.offsetTop, i = e.offsetLeft, a = e.position, o = e.reverseDirection, s = e.tooltipBox, c = e.useTranslate3d, l = e.viewBox, u, d, f;
	return s && s.height > 0 && s.width > 0 && n ? (d = yf({
		allowEscapeViewBox: t,
		coordinate: n,
		key: "x",
		offset: i,
		position: a,
		reverseDirection: o,
		tooltipDimension: s.width,
		viewBox: l,
		viewBoxDimension: l.width
	}), f = yf({
		allowEscapeViewBox: t,
		coordinate: n,
		key: "y",
		offset: r,
		position: a,
		reverseDirection: o,
		tooltipDimension: s.height,
		viewBox: l,
		viewBoxDimension: l.height
	}), u = bf({
		translateX: d,
		translateY: f,
		useTranslate3d: c
	})) : u = _f, {
		cssProperties: u,
		cssClasses: vf({
			translateX: d,
			translateY: f,
			coordinate: n
		})
	};
}
var Sf = {
	devToolsEnabled: !0,
	isSsr: !(typeof window < "u" && window.document && window.document.createElement && window.setTimeout)
};
// ../../../peach/frontend/node_modules/recharts/es6/util/usePrefersReducedMotion.js
function Cf(e, t) {
	return Of(e) || Df(e, t) || Tf(e, t) || wf();
}
function wf() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Tf(e, t) {
	if (e) {
		if (typeof e == "string") return Ef(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ef(e, t) : void 0;
	}
}
function Ef(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Df(e, t) {
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
function Of(e) {
	if (Array.isArray(e)) return e;
}
function kf() {
	var e = Cf((0, P.useState)(() => Sf.isSsr || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches), 2), t = e[0], n = e[1];
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
function Af(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function jf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Af(Object(n), !0).forEach(function(t) {
			Mf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Af(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Mf(e, t, n) {
	return (t = Nf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Nf(e) {
	var t = Pf(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Pf(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Ff(e, t) {
	return Bf(e) || zf(e, t) || Lf(e, t) || If();
}
function If() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Lf(e, t) {
	if (e) {
		if (typeof e == "string") return Rf(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rf(e, t) : void 0;
	}
}
function Rf(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function zf(e, t) {
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
function Bf(e) {
	if (Array.isArray(e)) return e;
}
function Vf(e) {
	if (!(e.prefersReducedMotion && e.isAnimationActive === "auto") && e.isAnimationActive && e.active) {
		var t = typeof e.animationEasing == "string" ? e.animationEasing : "ease";
		return `transform ${e.animationDuration}ms ${t}`;
	}
}
function Hf(e) {
	var t = kf(), n = Ff(P.useState(() => ({
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
	}, [e.coordinate?.x, e.coordinate?.y]), r.dismissed && ((e.coordinate?.x ?? 0) !== r.dismissedAtCoordinate.x || (e.coordinate?.y ?? 0) !== r.dismissedAtCoordinate.y) && i(jf(jf({}, r), {}, { dismissed: !1 }));
	var a = xf({
		allowEscapeViewBox: e.allowEscapeViewBox,
		coordinate: e.coordinate,
		offsetLeft: typeof e.offset == "number" ? e.offset : e.offset.x,
		offsetTop: typeof e.offset == "number" ? e.offset : e.offset.y,
		position: e.position,
		reverseDirection: e.reverseDirection,
		tooltipBox: e.lastBoundingBox,
		useTranslate3d: e.useTranslate3d,
		viewBox: e.viewBox
	}), o = a.cssClasses, s = a.cssProperties, c = jf(jf({}, e.hasPortalFromProps ? {} : jf(jf({ transition: Vf({
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
var Uf = /*#__PURE__*/ P.memo(Hf), Wf = () => V((e) => e.rootProps.accessibilityLayer) ?? !0;
// ../../../peach/frontend/node_modules/recharts/es6/shape/Curve.js
function Gf() {
	return Gf = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Gf.apply(null, arguments);
}
function Kf(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function qf(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Kf(Object(n), !0).forEach(function(t) {
			Jf(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Kf(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Jf(e, t, n) {
	return (t = Yf(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Yf(e) {
	var t = Xf(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Xf(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Zf = {
	curveBasisClosed: Zn,
	curveBasisOpen: $n,
	curveBasis: Yn,
	curveBumpX: Tn,
	curveBumpY: En,
	curveLinearClosed: tr,
	curveLinear: yn,
	curveMonotoneX: lr,
	curveMonotoneY: ur,
	curveNatural: pr,
	curveStep: hr,
	curveStepAfter: _r,
	curveStepBefore: gr
}, Qf = (e) => G(e.x) && G(e.y), $f = (e) => e.base != null && Qf(e.base) && Qf(e), ep = (e) => e.x, tp = (e) => e.y, np = (e, t) => {
	if (typeof e == "function") return e;
	var n = `curve${Ut(e)}`;
	if ((n === "curveMonotone" || n === "curveBump") && t) {
		var r = Zf[`${n}${t === "vertical" ? "Y" : "X"}`];
		if (r) return r;
	}
	return Zf[n] || yn;
}, rp = {
	connectNulls: !1,
	type: "linear"
}, ip = (e) => {
	var t = e.type, n = t === void 0 ? rp.type : t, r = e.points, i = r === void 0 ? [] : r, a = e.baseLine, o = e.layout, s = e.connectNulls, c = s === void 0 ? rp.connectNulls : s, l = np(n, o), u = c ? i.filter(Qf) : i;
	if (Array.isArray(a)) {
		var d, f = i.map((e, t) => qf(qf({}, e), {}, { base: a[t] }));
		return d = o === "vertical" ? Cn().y(tp).x1(ep).x0((e) => e.base.x) : Cn().x(ep).y1(tp).y0((e) => e.base.y), d.defined($f).curve(l)(c ? f.filter($f) : f);
	}
	return (o === "vertical" && I(a) ? Cn().y(tp).x1(ep).x0(a) : I(a) ? Cn().x(ep).y1(tp).y0(a) : Sn().x(ep).y(tp)).defined(Qf).curve(l)(u);
}, ap = (e) => {
	var t = e.className, n = e.points, r = e.path, i = e.pathRef, a = Wu();
	if ((!n || !n.length) && !r) return null;
	var o = {
		type: e.type,
		points: e.points,
		baseLine: e.baseLine,
		layout: e.layout || a,
		connectNulls: e.connectNulls
	}, s = n && n.length ? ip(o) : r;
	return /*#__PURE__*/ P.createElement("path", Gf({}, ct(e), Hr(e), {
		className: N("recharts-curve", t),
		d: s === null ? void 0 : s,
		ref: i
	}));
}, op = [
	"x",
	"y",
	"top",
	"left",
	"width",
	"height",
	"className"
];
function sp() {
	return sp = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, sp.apply(null, arguments);
}
function cp(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function lp(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? cp(Object(n), !0).forEach(function(t) {
			up(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : cp(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function up(e, t, n) {
	return (t = dp(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function dp(e) {
	var t = fp(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function fp(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function pp(e, t) {
	if (e == null) return {};
	var n, r, i = mp(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function mp(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var hp = (e, t, n, r, i, a) => `M${e},${i}v${r}M${a},${t}h${n}`, gp = (e) => {
	var t = e.x, n = t === void 0 ? 0 : t, r = e.y, i = r === void 0 ? 0 : r, a = e.top, o = a === void 0 ? 0 : a, s = e.left, c = s === void 0 ? 0 : s, l = e.width, u = l === void 0 ? 0 : l, d = e.height, f = d === void 0 ? 0 : d, p = e.className, m = pp(e, op), h = lp({
		x: n,
		y: i,
		top: o,
		left: c,
		width: u,
		height: f
	}, m);
	return !I(n) || !I(i) || !I(u) || !I(f) || !I(o) || !I(c) ? null : /*#__PURE__*/ P.createElement("path", sp({}, ut(h), {
		className: N("recharts-cross", p),
		d: hp(n, i, u, f, o, c)
	}));
};
// ../../../peach/frontend/node_modules/recharts/es6/util/cursor/getCursorRectangle.js
function _p(e, t, n, r) {
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
var vp = (e, t) => [
	0,
	3 * e,
	3 * t - 6 * e,
	3 * e - 3 * t + 1
], yp = (e, t) => e.map((e, n) => e * t ** n).reduce((e, t) => e + t), bp = (e, t) => (n) => yp(vp(e, t), n), xp = (e, t) => (n) => yp([...vp(e, t).map((e, t) => e * t).slice(1), 0], n), Sp = (e) => {
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
}, Cp = function() {
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
			var t = Sp(e[0]);
			if (t) return t;
	}
	return e.length === 4 ? e : [
		0,
		0,
		1,
		1
	];
}, wp = (e, t, n, r) => {
	var i = bp(e, n), a = bp(t, r), o = xp(e, n), s = (e) => e > 1 ? 1 : e < 0 ? 0 : e, c = (e) => {
		for (var t = e > 1 ? 1 : e, n = t, r = 0; r < 8; ++r) {
			var c = i(n) - t, l = o(n);
			if (Math.abs(c - t) < 1e-4 || l < 1e-4) return a(n);
			n = s(n - c / l);
		}
		return a(n);
	};
	return c.isStepper = !1, c;
}, Tp = function() {
	return wp(...Cp(...arguments));
}, Ep = function() {
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
}, Dp = (e) => {
	if (typeof e == "string") switch (e) {
		case "ease":
		case "ease-in-out":
		case "ease-out":
		case "ease-in":
		case "linear": return Tp(e);
		case "spring": return Ep();
		default: if (e.split("(")[0] === "cubic-bezier") return Tp(e);
	}
	return typeof e == "function" ? e : null;
}, Op = /*#__PURE__*/ (0, P.createContext)((e, t, n) => {
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
Op.Provider;
function kp(e) {
	var t = (0, P.useContext)(Op);
	return (0, P.useMemo)(() => e ?? t, [e, t]);
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/AnimationHandle.js
function Ap(e, t, n) {
	return (t = jp(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function jp(e) {
	var t = Mp(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Mp(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Np = "init", Pp = "pending", Fp = "active", Ip = "completed";
function Lp(e) {
	return Math.max(0, e);
}
var Rp = class {
	getAnimationStartedTime() {
		return this.animationStartedTime;
	}
	getBeginStartedTime() {
		return this.beginStartedTime;
	}
	constructor(e) {
		var t;
		Ap(this, "state", Np), this.animationId = e.animationId, this.onAnimationEnd = e.onAnimationEnd, this.animationDuration = Lp(e.animationDuration), this.animationBegin = Lp(e.animationBegin), this.progress = 0, this.from = e.from, this.to = e.to, this.easing = e.easing, (t = e.onAnimationStart) == null || t.call(e);
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
		if (this.getState() === Np) return this.state = Pp, this.beginStartedTime = e, this.animationBegin;
		if (this.getState() === Pp) {
			if (this.beginStartedTime == null) throw Error();
			var t = e - this.beginStartedTime;
			return t >= this.animationBegin ? (this.state = Fp, this.animationStartedTime = e, this.nextAnimationUpdate(0)) : Lp(this.animationBegin - t);
		}
		if (this.getState() === Fp) {
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
		this.state = Ip;
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
}, zp = class extends Rp {
	nextAnimationUpdate() {
		return 0;
	}
	getInterpolated() {
		return this.easing(L(this.getFrom(), this.getTo(), this.getProgress()));
	}
}, Bp = class {
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
function Vp(e, t) {
	return Kp(e) || Gp(e, t) || Up(e, t) || Hp();
}
function Hp() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Up(e, t) {
	if (e) {
		if (typeof e == "string") return Wp(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wp(e, t) : void 0;
	}
}
function Wp(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Gp(e, t) {
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
function Kp(e) {
	if (Array.isArray(e)) return e;
}
var qp = {
	begin: 0,
	duration: 1e3,
	easing: "ease",
	isActive: !0,
	canBegin: !0,
	onAnimationEnd: () => {},
	onAnimationStart: () => {}
}, Jp = 0, Yp = 1;
function Xp(e) {
	var t = Xr(e, qp), n = t.animationId, r = t.isActive, i = t.canBegin, a = t.duration, o = t.easing, s = t.begin, c = t.onAnimationEnd, l = t.onAnimationStart, u = t.children, d = kf(), f = r === "auto" ? !Sf.isSsr && !d : r, p = kp(t.animationController), m = Vp((0, P.useState)(f ? Jp : Yp), 2), h = m[0], g = m[1];
	return (0, P.useEffect)(() => {
		f || g(Yp);
	}, [f]), (0, P.useEffect)(() => {
		var e = Dp(o);
		return !f || !i || e == null ? Gt : p(new Bp(), new zp({
			animationId: n,
			easing: e,
			animationDuration: a,
			animationBegin: s,
			onAnimationStart: l,
			onAnimationEnd: c,
			from: Jp,
			to: Yp
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
function Zp(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "animation-", n = (0, P.useRef)(zt(t)), r = (0, P.useRef)(e);
	return r.current !== e && (n.current = zt(t), r.current = e), n.current;
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/util.js
var Qp = (e) => e.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`), $p = (e, t, n) => e.map((e) => `${Qp(e)} ${t}ms ${n}`).join(","), em = ["radius"], tm = ["radius"], nm, rm, im, am, om, sm, cm, lm, um, dm;
function fm(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function pm(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? fm(Object(n), !0).forEach(function(t) {
			mm(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : fm(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function mm(e, t, n) {
	return (t = hm(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function hm(e) {
	var t = gm(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function gm(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function _m() {
	return _m = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, _m.apply(null, arguments);
}
function vm(e, t) {
	if (e == null) return {};
	var n, r, i = ym(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function ym(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function bm(e, t) {
	return Tm(e) || wm(e, t) || Sm(e, t) || xm();
}
function xm() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Sm(e, t) {
	if (e) {
		if (typeof e == "string") return Cm(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Cm(e, t) : void 0;
	}
}
function Cm(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function wm(e, t) {
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
function Tm(e) {
	if (Array.isArray(e)) return e;
}
function Em(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Dm = (e, t, n, r, i) => {
	var a = Mt(n), o = Mt(r), s = Math.min(Math.abs(a) / 2, Math.abs(o) / 2), c = o >= 0 ? 1 : -1, l = a >= 0 ? 1 : -1, u = +(o >= 0 && a >= 0 || o < 0 && a < 0), d;
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
		d = Nt(nm ||= Em([
			"M",
			",",
			""
		]), e, t + c * f[0]), f[0] > 0 && (d += Nt(rm ||= Em([
			"A ",
			",",
			",0,0,",
			",",
			",",
			""
		]), f[0], f[0], u, e + l * f[0], t)), d += Nt(im ||= Em([
			"L ",
			",",
			""
		]), e + n - l * f[1], t), f[1] > 0 && (d += Nt(am ||= Em([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[1], f[1], u, e + n, t + c * f[1])), d += Nt(om ||= Em([
			"L ",
			",",
			""
		]), e + n, t + r - c * f[2]), f[2] > 0 && (d += Nt(sm ||= Em([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[2], f[2], u, e + n - l * f[2], t + r)), d += Nt(cm ||= Em([
			"L ",
			",",
			""
		]), e + l * f[3], t + r), f[3] > 0 && (d += Nt(lm ||= Em([
			"A ",
			",",
			",0,0,",
			",\n        ",
			",",
			""
		]), f[3], f[3], u, e, t + r - c * f[3])), d += "Z";
	} else if (s > 0 && i === +i && i > 0) {
		var g = Math.min(s, i);
		d = Nt(um ||= Em(/* @__PURE__ */ "M .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,.\n            L .,.\n            A .,.,0,0,.,.,. Z".split(".")), e, t + c * g, g, g, u, e + l * g, t, e + n - l * g, t, g, g, u, e + n, t + c * g, e + n, t + r - c * g, g, g, u, e + n - l * g, t + r, e + l * g, t + r, g, g, u, e, t + r - c * g);
	} else d = Nt(dm ||= Em([
		"M ",
		",",
		" h ",
		" v ",
		" h ",
		" Z"
	]), e, t, n, r, -n);
	return d;
}, Om = {
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
}, km = (e) => {
	var t = Xr(e, Om), n = (0, P.useRef)(null), r = bm((0, P.useState)(-1), 2), i = r[0], a = r[1];
	(0, P.useEffect)(() => {
		if (n.current && n.current.getTotalLength) try {
			var e = n.current.getTotalLength();
			e && a(e);
		} catch {}
	}, []);
	var o = t.x, s = t.y, c = t.width, l = t.height, u = t.radius, d = t.className, f = t.animationEasing, p = t.animationDuration, m = t.animationBegin, h = t.isAnimationActive, g = t.isUpdateAnimationActive, _ = (0, P.useRef)(c), v = (0, P.useRef)(l), y = (0, P.useRef)(o), b = (0, P.useRef)(s), x = Zp((0, P.useMemo)(() => ({
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
		var C = ut(t);
		C.radius;
		var w = vm(C, em);
		return /*#__PURE__*/ P.createElement("path", _m({}, w, {
			x: Mt(o),
			y: Mt(s),
			width: Mt(c),
			height: Mt(l),
			radius: typeof u == "number" ? u : void 0,
			className: S,
			d: Dm(o, s, c, l, u)
		}));
	}
	var T = _.current, E = v.current, D = y.current, O = b.current, k = `0px ${i === -1 ? 1 : i}px`, A = `${i}px ${i}px`, j = $p(["strokeDasharray"], p, typeof f == "string" ? f : Om.animationEasing);
	return /*#__PURE__*/ P.createElement(Xp, {
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
		} : { strokeDasharray: k } : { strokeDasharray: A }, p = ut(t);
		p.radius;
		var m = vm(p, tm);
		return /*#__PURE__*/ P.createElement("path", _m({}, m, {
			radius: typeof u == "number" ? u : void 0,
			className: S,
			d: Dm(a, d, r, i, u),
			ref: n,
			style: pm(pm({}, f), t.style)
		}));
	});
};
// ../../../peach/frontend/node_modules/recharts/es6/util/PolarUtils.js
function Am(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function jm(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Am(Object(n), !0).forEach(function(t) {
			Mm(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Am(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Mm(e, t, n) {
	return (t = Nm(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Nm(e) {
	var t = Pm(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Pm(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var Fm = Math.PI / 180, Im = (e) => e * Math.PI / 180, Lm = (e) => e * 180 / Math.PI, Rm = (e, t, n, r) => ({
	x: e + Math.cos(-Fm * r) * n,
	y: t + Math.sin(-Fm * r) * n
}), zm = function(e, t) {
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
}, Bm = (e, t) => {
	var n = e.x, r = e.y, i = t.x, a = t.y;
	return Math.sqrt((n - i) ** 2 + (r - a) ** 2);
}, Vm = (e, t) => {
	var n = e.x, r = e.y, i = t.cx, a = t.cy, o = Bm({
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
		angle: Lm(c),
		angleInRadian: c
	};
}, Hm = (e) => {
	var t = e.startAngle, n = e.endAngle, r = Math.floor(t / 360), i = Math.floor(n / 360), a = Math.min(r, i);
	return {
		startAngle: t - a * 360,
		endAngle: n - a * 360
	};
}, Um = (e, t) => {
	var n = t.startAngle, r = t.endAngle, i = Math.floor(n / 360), a = Math.floor(r / 360);
	return e + Math.min(i, a) * 360;
}, Wm = (e, t) => {
	var n = e.relativeX, r = e.relativeY, i = Vm({
		x: n,
		y: r
	}, t), a = i.radius, o = i.angle, s = t.innerRadius, c = t.outerRadius;
	if (a < s || a > c || a === 0) return null;
	var l = Hm(t), u = l.startAngle, d = l.endAngle, f = o, p;
	if (u <= d) {
		for (; f > d;) f -= 360;
		for (; f < u;) f += 360;
		p = f >= u && f <= d;
	} else {
		for (; f > u;) f -= 360;
		for (; f < d;) f += 360;
		p = f >= d && f <= u;
	}
	return p ? jm(jm({}, t), {}, {
		radius: a,
		angle: Um(f, t)
	}) : null;
};
// ../../../peach/frontend/node_modules/recharts/es6/util/cursor/getRadialCursorPoints.js
function Gm(e) {
	var t = e.cx, n = e.cy, r = e.radius, i = e.startAngle, a = e.endAngle;
	return {
		points: [Rm(t, n, r, i), Rm(t, n, r, a)],
		cx: t,
		cy: n,
		radius: r,
		startAngle: i,
		endAngle: a
	};
}
// ../../../peach/frontend/node_modules/recharts/es6/shape/Sector.js
var Km, qm, Jm, Ym, Xm, Zm, Qm;
function $m() {
	return $m = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, $m.apply(null, arguments);
}
function eh(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var th = (e, t) => Pt(t - e) * Math.min(Math.abs(t - e), 359.999), nh = (e) => {
	var t = e.cx, n = e.cy, r = e.radius, i = e.angle, a = e.sign, o = e.isExternal, s = e.cornerRadius, c = e.cornerIsExternal, l = s * (o ? 1 : -1) + r, u = Math.asin(s / l) / Fm, d = c ? i : i + a * u, f = Rm(t, n, l, d), p = Rm(t, n, r, d), m = c ? i - a * u : i;
	return {
		center: f,
		circleTangency: p,
		lineTangency: Rm(t, n, l * Math.cos(u * Fm), m),
		theta: u
	};
}, rh = (e) => {
	var t = e.cx, n = e.cy, r = e.innerRadius, i = e.outerRadius, a = e.startAngle, o = e.endAngle, s = th(a, o), c = a + s, l = Rm(t, n, i, a), u = Rm(t, n, i, c), d = Nt(Km ||= eh([
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
		var f = Rm(t, n, r, a), p = Rm(t, n, r, c);
		d += Nt(qm ||= eh([
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
	} else d += Nt(Jm ||= eh([
		"L ",
		",",
		" Z"
	]), t, n);
	return d;
}, ih = (e) => {
	var t = e.cx, n = e.cy, r = e.innerRadius, i = e.outerRadius, a = e.cornerRadius, o = e.forceCornerRadius, s = e.cornerIsExternal, c = e.startAngle, l = e.endAngle, u = Pt(l - c), d = nh({
		cx: t,
		cy: n,
		radius: i,
		angle: c,
		sign: u,
		cornerRadius: a,
		cornerIsExternal: s
	}), f = d.circleTangency, p = d.lineTangency, m = d.theta, h = nh({
		cx: t,
		cy: n,
		radius: i,
		angle: l,
		sign: -u,
		cornerRadius: a,
		cornerIsExternal: s
	}), g = h.circleTangency, _ = h.lineTangency, v = h.theta, y = s ? Math.abs(c - l) : Math.abs(c - l) - m - v;
	if (y < 0) return o ? Nt(Ym ||= eh([
		"M ",
		",",
		"\n        a",
		",",
		",0,0,1,",
		",0\n        a",
		",",
		",0,0,1,",
		",0\n      "
	]), p.x, p.y, a, a, a * 2, a, a, -a * 2) : rh({
		cx: t,
		cy: n,
		innerRadius: r,
		outerRadius: i,
		startAngle: c,
		endAngle: l
	});
	var b = Nt(Xm ||= eh([
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
		var x = nh({
			cx: t,
			cy: n,
			radius: r,
			angle: c,
			sign: u,
			isExternal: !0,
			cornerRadius: a,
			cornerIsExternal: s
		}), S = x.circleTangency, C = x.lineTangency, w = x.theta, T = nh({
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
		b += Nt(Zm ||= eh([
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
	} else b += Nt(Qm ||= eh([
		"L",
		",",
		"Z"
	]), t, n);
	return b;
}, ah = {
	cx: 0,
	cy: 0,
	innerRadius: 0,
	outerRadius: 0,
	startAngle: 0,
	endAngle: 0,
	cornerRadius: 0,
	forceCornerRadius: !1,
	cornerIsExternal: !1
}, oh = (e) => {
	var t = Xr(e, ah), n = t.cx, r = t.cy, i = t.innerRadius, a = t.outerRadius, o = t.cornerRadius, s = t.forceCornerRadius, c = t.cornerIsExternal, l = t.startAngle, u = t.endAngle, d = t.className;
	if (a < i || l === u) return null;
	var f = N("recharts-sector", d), p = a - i, m = Bt(o, p, 0, !0), h = m > 0 && Math.abs(l - u) < 360 ? ih({
		cx: n,
		cy: r,
		innerRadius: i,
		outerRadius: a,
		cornerRadius: Math.min(m, p / 2),
		forceCornerRadius: s,
		cornerIsExternal: c,
		startAngle: l,
		endAngle: u
	}) : rh({
		cx: n,
		cy: r,
		innerRadius: i,
		outerRadius: a,
		startAngle: l,
		endAngle: u
	});
	return /*#__PURE__*/ P.createElement("path", $m({}, ut(t), {
		className: f,
		d: h
	}));
};
// ../../../peach/frontend/node_modules/recharts/es6/util/cursor/getCursorPoints.js
function sh(e, t, n) {
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
	if (Vr(t)) {
		if (e === "centric") {
			var r = t.cx, i = t.cy, a = t.innerRadius, o = t.outerRadius, s = t.angle, c = Rm(r, i, a, s), l = Rm(r, i, o, s);
			return [{
				x: c.x,
				y: c.y
			}, {
				x: l.x,
				y: l.y
			}];
		}
		return Gm(t);
	}
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/toNumber.mjs
function ch(e) {
	return Tt(e) ? NaN : Number(e);
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/util/toFinite.mjs
function lh(e) {
	return e ? (e = ch(e), e === Infinity || e === -Infinity ? (e < 0 ? -1 : 1) * Number.MAX_VALUE : e === e ? e : 0) : e === 0 ? e : 0;
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/compat/math/range.mjs
function uh(e, t, n) {
	n && typeof n != "number" && za(e, t, n) && (t = n = void 0), e = lh(e), t === void 0 ? (t = e, e = 0) : t = lh(t), n = n === void 0 ? e < t ? 1 : -1 : lh(n);
	let r = Math.max(Math.ceil((t - e) / (n || 1)), 0), i = Array(r);
	for (let t = 0; t < r; t++) i[t] = e, e += n;
	return i;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/dataSelectors.js
var dh = (e) => e.chartData, fh = H([dh], (e) => {
	var t = e.chartData == null ? 0 : e.chartData.length - 1;
	return {
		chartData: e.chartData,
		computedData: e.computedData,
		dataEndIndex: t,
		dataStartIndex: 0
	};
}), ph = (e, t, n, r) => r ? fh(e) : dh(e), mh = (e, t, n) => n ? fh(e) : dh(e), hh = H([ph], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
}), gh = H([fh], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
}), _h = H([dh], (e) => {
	var t = e.chartData, n = e.dataStartIndex, r = e.dataEndIndex;
	return t == null ? [] : t.slice(n, r + 1);
});
// ../../../peach/frontend/node_modules/recharts/es6/util/isDomainSpecifiedByUser.js
function vh(e, t) {
	return Ch(e) || Sh(e, t) || bh(e, t) || yh();
}
function yh() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function bh(e, t) {
	if (e) {
		if (typeof e == "string") return xh(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xh(e, t) : void 0;
	}
}
function xh(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Sh(e, t) {
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
function Ch(e) {
	if (Array.isArray(e)) return e;
}
function wh(e) {
	if (Array.isArray(e) && e.length === 2) {
		var t = vh(e, 2), n = t[0], r = t[1];
		if (G(n) && G(r)) return !0;
	}
	return !1;
}
function Th(e, t, n) {
	return n ? e : [Math.min(e[0], t[0]), Math.max(e[1], t[1])];
}
function Eh(e, t) {
	if (t && typeof e != "function" && Array.isArray(e) && e.length === 2) {
		var n = vh(e, 2), r = n[0], i = n[1], a, o;
		if (G(r)) a = r;
		else if (typeof r == "function") return;
		if (G(i)) o = i;
		else if (typeof i == "function") return;
		var s = [a, o];
		if (wh(s)) return s;
	}
}
function Dh(e, t, n) {
	if (n || t != null) {
		if (typeof e == "function" && t != null) try {
			var r = e(t, n);
			if (wh(r)) return Th(r, t, n);
		} catch {}
		if (Array.isArray(e) && e.length === 2) {
			var i = vh(e, 2), a = i[0], o = i[1], s, c;
			if (a === "auto") t != null && (s = Math.min(...t));
			else if (I(a)) s = a;
			else if (typeof a == "function") try {
				t != null && (s = a(t?.[0]));
			} catch {}
			else if (typeof a == "string" && Ol.test(a)) {
				var l = Ol.exec(a);
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
			else if (typeof o == "string" && kl.test(o)) {
				var d = kl.exec(o);
				if (d == null || d[1] == null || t == null) c = void 0;
				else {
					var f = +d[1];
					c = t[1] + f;
				}
			} else c = t?.[1];
			var p = [s, c];
			if (wh(p)) return t == null ? p : Th(p, t, n);
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
function Oh(e) {
	return e === 0 ? 1 : Math.floor(new J.default(e).abs().log(10).toNumber()) + 1;
}
function kh(e, t, n) {
	for (var r = new J.default(e), i = 0, a = []; r.lt(t) && i < 1e5;) a.push(r.toNumber()), r = r.add(n), i++;
	return a;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/scale/getNiceTickValues.js
function Ah(e, t) {
	return Fh(e) || Ph(e, t) || Mh(e, t) || jh();
}
function jh() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Mh(e, t) {
	if (e) {
		if (typeof e == "string") return Nh(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nh(e, t) : void 0;
	}
}
function Nh(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Ph(e, t) {
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
function Fh(e) {
	if (Array.isArray(e)) return e;
}
var Ih = (e) => {
	var t = Ah(e, 2), n = t[0], r = t[1], i = n, a = r;
	return n > r && (i = r, a = n), [i, a];
}, Lh = (e, t, n) => {
	if (e.lte(0)) return new J.default(0);
	var r = Oh(e.toNumber()), i = new J.default(10).pow(r), a = e.div(i), o = r === 1 ? .1 : .05, s = new J.default(Math.ceil(a.div(o).toNumber())).add(n).mul(o).mul(i);
	return t ? new J.default(s.toNumber()) : new J.default(Math.ceil(s.toNumber()));
}, Rh = (e, t, n) => {
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
}, zh = (e, t, n) => {
	var r = new J.default(1), i = new J.default(e);
	if (!i.isint() && n) {
		var a = Math.abs(e);
		a < 1 ? (r = new J.default(10).pow(Oh(e) - 1), i = new J.default(Math.floor(i.div(r).toNumber())).mul(r)) : a > 1 && (i = new J.default(Math.floor(e)));
	} else e === 0 ? i = new J.default(Math.floor((t - 1) / 2)) : n || (i = new J.default(Math.floor(e)));
	for (var o = Math.floor((t - 1) / 2), s = [], c = 0; c < t; c++) s.push(i.add(new J.default(c - o).mul(r)).toNumber());
	return s;
}, Bh = function(e, t, n, r) {
	var i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0, a = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : Lh;
	if (!Number.isFinite((t - e) / (n - 1))) return {
		step: new J.default(0),
		tickMin: new J.default(0),
		tickMax: new J.default(0)
	};
	var o = a(new J.default(t).sub(e).div(n - 1), r, i), s;
	e <= 0 && t >= 0 ? s = new J.default(0) : (s = new J.default(e).add(t).div(2), s = s.sub(new J.default(s).mod(o)));
	var c = Math.ceil(s.sub(e).div(o).toNumber()), l = Math.ceil(new J.default(t).sub(s).div(o).toNumber()), u = c + l + 1;
	return u > n ? Bh(e, t, n, r, i + 1, a) : (u < n && (l = t > 0 ? l + (n - u) : l, c = t > 0 ? c : c + (n - u)), {
		step: o,
		tickMin: s.sub(new J.default(c).mul(o)),
		tickMax: s.add(new J.default(l).mul(o))
	});
}, Vh = function(e) {
	var t = Ah(e, 2), n = t[0], r = t[1], i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto", s = Math.max(i, 2), c = Ah(Ih([n, r]), 2), l = c[0], u = c[1];
	if (l === -Infinity || u === Infinity) {
		var d = u === Infinity ? [l, ...Array(i - 1).fill(Infinity)] : [...Array(i - 1).fill(-Infinity), u];
		return n > r ? d.reverse() : d;
	}
	if (l === u) return zh(l, i, a);
	var f = Bh(l, u, s, a, 0, o === "snap125" ? Rh : Lh), p = f.step, m = f.tickMin, h = f.tickMax, g = kh(m, h.add(new J.default(.1).mul(p)), p);
	return n > r ? g.reverse() : g;
}, Hh = function(e, t) {
	var n = Ah(e, 2), r = n[0], i = n[1], a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto", s = Ah(Ih([r, i]), 2), c = s[0], l = s[1];
	if (c === -Infinity || l === Infinity) return [r, i];
	if (c === l) return [c];
	var u = o === "snap125" ? Rh : Lh, d = Math.max(t, 2), f = u(new J.default(l).sub(c).div(d - 1), a, 0), p = [...kh(new J.default(c), new J.default(l), f), l];
	if (a === !1) {
		p = p.map((e) => Math.round(e));
		var m = p.length - 1;
		m > 0 && p[m] === p[m - 1] && (p = p.slice(0, m));
	}
	return r > i ? p.reverse() : p;
}, Uh = (e) => e.rootProps.maxBarSize, Wh = (e) => e.rootProps.barGap, Gh = (e) => e.rootProps.barCategoryGap, Kh = (e) => e.rootProps.barSize, qh = (e) => e.rootProps.stackOffset, Jh = (e) => e.rootProps.reverseStackOrder, Yh = (e) => e.options.chartName, Xh = (e) => e.rootProps.syncId, Zh = (e) => e.rootProps.syncMethod, Qh = (e) => e.options.eventEmitter, $h = (e) => e.rootProps.baseValue, Y = {
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
}, eg = {
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
}, tg = {
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
}, ng = (e, t) => {
	if (e && t) return e != null && e.reversed ? [t[1], t[0]] : t;
};
// ../../../peach/frontend/node_modules/recharts/es6/util/getAxisTypeBasedOnLayout.js
function rg(e, t, n) {
	if (n !== "auto") return n;
	if (e != null) return hl(e, t) ? "category" : "number";
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
function ig(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ag(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ig(Object(n), !0).forEach(function(t) {
			og(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ig(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function og(e, t, n) {
	return (t = sg(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function sg(e) {
	var t = cg(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function cg(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var lg = {
	allowDataOverflow: eg.allowDataOverflow,
	allowDecimals: eg.allowDecimals,
	allowDuplicatedCategory: !1,
	dataKey: void 0,
	domain: void 0,
	id: eg.angleAxisId,
	includeHidden: !1,
	name: void 0,
	reversed: eg.reversed,
	scale: eg.scale,
	tick: eg.tick,
	tickCount: void 0,
	ticks: void 0,
	type: eg.type,
	unit: void 0,
	niceTicks: "auto"
}, ug = {
	allowDataOverflow: tg.allowDataOverflow,
	allowDecimals: tg.allowDecimals,
	allowDuplicatedCategory: tg.allowDuplicatedCategory,
	dataKey: void 0,
	domain: void 0,
	id: tg.radiusAxisId,
	includeHidden: tg.includeHidden,
	name: void 0,
	reversed: tg.reversed,
	scale: tg.scale,
	tick: tg.tick,
	tickCount: tg.tickCount,
	ticks: void 0,
	type: tg.type,
	unit: void 0,
	niceTicks: "auto"
}, dg = H([(e, t) => {
	if (t != null) return e.polarAxis.angleAxis[t];
}, Ku], (e, t) => {
	if (e != null) return e;
	var n = rg(t, "angleAxis", lg.type) ?? "category";
	return ag(ag({}, lg), {}, { type: n });
}), fg = H([(e, t) => e.polarAxis.radiusAxis[t], Ku], (e, t) => {
	if (e != null) return e;
	var n = rg(t, "radiusAxis", ug.type) ?? "category";
	return ag(ag({}, ug), {}, { type: n });
}), pg = (e) => e.polarOptions, mg = H([
	Fl,
	Il,
	Ql
], zm), hg = H([pg, mg], (e, t) => {
	if (e != null) return Bt(e.innerRadius, t, 0);
}), gg = H([pg, mg], (e, t) => {
	if (e != null) return Bt(e.outerRadius, t, t * .8);
}), _g = H([pg], (e) => e == null ? [0, 0] : [e.startAngle, e.endAngle]), vg = H([dg, _g], ng), yg = H([
	mg,
	hg,
	gg
], (e, t, n) => {
	if (e != null && t != null && n != null) return [t, n];
}), bg = H([fg, yg], ng), xg = H([
	q,
	pg,
	hg,
	gg,
	Fl,
	Il
], (e, t, n, r, i, a) => {
	if (!(e !== "centric" && e !== "radial" || t == null || n == null || r == null)) {
		var o = t.cx, s = t.cy, c = t.startAngle, l = t.endAngle;
		return {
			cx: Bt(o, i, i / 2),
			cy: Bt(s, a, a / 2),
			innerRadius: n,
			outerRadius: r,
			startAngle: c,
			endAngle: l,
			clockWise: !1
		};
	}
}), X = (e, t) => t, Sg = (e, t, n) => n;
// ../../../peach/frontend/node_modules/recharts/es6/util/stacks/getStackSeriesIdentifier.js
function Cg(e) {
	return e?.id;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineDisplayedStackedData.js
function wg(e, t, n) {
	var r = t.chartData, i = r === void 0 ? [] : r, a = n.allowDuplicatedCategory, o = n.dataKey, s = /* @__PURE__ */ new Map();
	return e.forEach((e) => {
		var t = e.data ?? i;
		if (t != null && t.length !== 0) {
			var n = Cg(e);
			t.forEach((t, r) => {
				var i = o == null || a ? r : String(K(t, o, null)), c = K(t, e.dataKey, 0), l = s.has(i) ? s.get(i) : {};
				Object.assign(l, { [n]: c }), s.set(i, l);
			});
		}
	}), Array.from(s.values());
}
// ../../../peach/frontend/node_modules/recharts/es6/state/types/StackedGraphicalItem.js
function Tg(e) {
	return "stackId" in e && e.stackId != null && e.dataKey != null;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/numberDomainEqualityCheck.js
var Eg = (e, t) => e === t ? !0 : e == null || t == null ? !1 : e[0] === t[0] && e[1] === t[1];
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/arrayEqualityCheck.js
function Dg(e, t) {
	return Array.isArray(e) && Array.isArray(t) && e.length === 0 && t.length === 0 ? !0 : e === t;
}
function Og(e, t) {
	if (e.length === t.length) {
		for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
		return !0;
	}
	return !1;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/selectTooltipAxisType.js
var kg = (e) => {
	var t = q(e);
	return t === "horizontal" ? "xAxis" : t === "vertical" ? "yAxis" : t === "centric" ? "angleAxis" : "radiusAxis";
}, Ag = (e) => e.tooltip.settings.axisId;
// ../../../peach/frontend/node_modules/recharts/es6/util/scale/RechartsScale.js
function jg(e) {
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
var Mg = (e, t) => {
	if (t != null) switch (e) {
		case "linear":
			if (!wh(t)) {
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
function Ng(e, t) {
	return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
// ../../../peach/frontend/node_modules/d3-array/src/bisector.js
function Pg(e) {
	let t = e, n = e;
	e.length === 1 && (t = (t, n) => e(t) - n, n = Fg(e));
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
function Fg(e) {
	return (t, n) => Ng(e(t), n);
}
// ../../../peach/frontend/node_modules/d3-array/src/number.js
function Ig(e) {
	return e === null ? NaN : +e;
}
function* Lg(e, t) {
	if (t === void 0) for (let t of e) t != null && (t = +t) >= t && (yield t);
	else {
		let n = -1;
		for (let r of e) (r = t(r, ++n, e)) != null && (r = +r) >= r && (yield r);
	}
}
// ../../../peach/frontend/node_modules/d3-array/src/bisect.js
var Rg = Pg(Ng), zg = Rg.right;
Rg.left, Pg(Ig).center;
// ../../../peach/frontend/node_modules/internmap/src/index.js
var Bg = class extends Map {
	constructor(e, t = Wg) {
		if (super(), Object.defineProperties(this, {
			_intern: { value: /* @__PURE__ */ new Map() },
			_key: { value: t }
		}), e != null) for (let [t, n] of e) this.set(t, n);
	}
	get(e) {
		return super.get(Vg(this, e));
	}
	has(e) {
		return super.has(Vg(this, e));
	}
	set(e, t) {
		return super.set(Hg(this, e), t);
	}
	delete(e) {
		return super.delete(Ug(this, e));
	}
};
function Vg({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : n;
}
function Hg({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : (e.set(r, n), n);
}
function Ug({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) && (n = e.get(n), e.delete(r)), n;
}
function Wg(e) {
	return typeof e == "object" && e ? e.valueOf() : e;
}
// ../../../peach/frontend/node_modules/d3-array/src/ticks.js
var Gg = Math.sqrt(50), Kg = Math.sqrt(10), qg = Math.sqrt(2);
function Jg(e, t, n) {
	var r, i = -1, a, o, s;
	if (t = +t, e = +e, n = +n, e === t && n > 0) return [e];
	if ((r = t < e) && (a = e, e = t, t = a), (s = Yg(e, t, n)) === 0 || !isFinite(s)) return [];
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
function Yg(e, t, n) {
	var r = (t - e) / Math.max(0, n), i = Math.floor(Math.log(r) / Math.LN10), a = r / 10 ** i;
	return i >= 0 ? (a >= Gg ? 10 : a >= Kg ? 5 : a >= qg ? 2 : 1) * 10 ** i : -(10 ** -i) / (a >= Gg ? 10 : a >= Kg ? 5 : a >= qg ? 2 : 1);
}
function Xg(e, t, n) {
	var r = Math.abs(t - e) / Math.max(0, n), i = 10 ** Math.floor(Math.log(r) / Math.LN10), a = r / i;
	return a >= Gg ? i *= 10 : a >= Kg ? i *= 5 : a >= qg && (i *= 2), t < e ? -i : i;
}
// ../../../peach/frontend/node_modules/d3-array/src/max.js
function Zg(e, t) {
	let n;
	if (t === void 0) for (let t of e) t != null && (n < t || n === void 0 && t >= t) && (n = t);
	else {
		let r = -1;
		for (let i of e) (i = t(i, ++r, e)) != null && (n < i || n === void 0 && i >= i) && (n = i);
	}
	return n;
}
// ../../../peach/frontend/node_modules/d3-array/src/min.js
function Qg(e, t) {
	let n;
	if (t === void 0) for (let t of e) t != null && (n > t || n === void 0 && t >= t) && (n = t);
	else {
		let r = -1;
		for (let i of e) (i = t(i, ++r, e)) != null && (n > i || n === void 0 && i >= i) && (n = i);
	}
	return n;
}
// ../../../peach/frontend/node_modules/d3-array/src/quickselect.js
function $g(e, t, n = 0, r = e.length - 1, i = Ng) {
	for (; r > n;) {
		if (r - n > 600) {
			let a = r - n + 1, o = t - n + 1, s = Math.log(a), c = .5 * Math.exp(2 * s / 3), l = .5 * Math.sqrt(s * c * (a - c) / a) * (o - a / 2 < 0 ? -1 : 1);
			$g(e, t, Math.max(n, Math.floor(t - o * c / a + l)), Math.min(r, Math.floor(t + (a - o) * c / a + l)), i);
		}
		let a = e[t], o = n, s = r;
		for (e_(e, n, t), i(e[r], a) > 0 && e_(e, n, r); o < s;) {
			for (e_(e, o, s), ++o, --s; i(e[o], a) < 0;) ++o;
			for (; i(e[s], a) > 0;) --s;
		}
		i(e[n], a) === 0 ? e_(e, n, s) : (++s, e_(e, s, r)), s <= t && (n = s + 1), t <= s && (r = s - 1);
	}
	return e;
}
function e_(e, t, n) {
	let r = e[t];
	e[t] = e[n], e[n] = r;
}
// ../../../peach/frontend/node_modules/d3-array/src/quantile.js
function t_(e, t, n) {
	if (e = Float64Array.from(Lg(e, n)), r = e.length) {
		if ((t = +t) <= 0 || r < 2) return Qg(e);
		if (t >= 1) return Zg(e);
		var r, i = (r - 1) * t, a = Math.floor(i), o = Zg($g(e, a).subarray(0, a + 1));
		return o + (Qg(e.subarray(a + 1)) - o) * (i - a);
	}
}
function n_(e, t, n = Ig) {
	if (r = e.length) {
		if ((t = +t) <= 0 || r < 2) return +n(e[0], 0, e);
		if (t >= 1) return +n(e[r - 1], r - 1, e);
		var r, i = (r - 1) * t, a = Math.floor(i), o = +n(e[a], a, e);
		return o + (+n(e[a + 1], a + 1, e) - o) * (i - a);
	}
}
// ../../../peach/frontend/node_modules/d3-array/src/range.js
function r_(e, t, n) {
	e = +e, t = +t, n = (i = arguments.length) < 2 ? (t = e, e = 0, 1) : i < 3 ? 1 : +n;
	for (var r = -1, i = Math.max(0, Math.ceil((t - e) / n)) | 0, a = Array(i); ++r < i;) a[r] = e + r * n;
	return a;
}
// ../../../peach/frontend/node_modules/d3-scale/src/init.js
function i_(e, t) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			this.range(e);
			break;
		default: this.range(t).domain(e);
	}
	return this;
}
function a_(e, t) {
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
var o_ = Symbol("implicit");
function s_() {
	var e = new Bg(), t = [], n = [], r = o_;
	function i(i) {
		let a = e.get(i);
		if (a === void 0) {
			if (r !== o_) return r;
			e.set(i, a = t.push(i) - 1);
		}
		return n[a % n.length];
	}
	return i.domain = function(n) {
		if (!arguments.length) return t.slice();
		t = [], e = new Bg();
		for (let r of n) e.has(r) || e.set(r, t.push(r) - 1);
		return i;
	}, i.range = function(e) {
		return arguments.length ? (n = Array.from(e), i) : n.slice();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return s_(t, n).unknown(r);
	}, i_.apply(i, arguments), i;
}
// ../../../peach/frontend/node_modules/d3-scale/src/band.js
function c_() {
	var e = s_().unknown(void 0), t = e.domain, n = e.range, r = 0, i = 1, a, o, s = !1, c = 0, l = 0, u = .5;
	delete e.unknown;
	function d() {
		var e = t().length, d = i < r, f = d ? i : r, p = d ? r : i;
		a = (p - f) / Math.max(1, e - c + l * 2), s && (a = Math.floor(a)), f += (p - f - a * (e - c)) * u, o = a * (1 - c), s && (f = Math.round(f), o = Math.round(o));
		var m = r_(e).map(function(e) {
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
		return c_(t(), [r, i]).round(s).paddingInner(c).paddingOuter(l).align(u);
	}, i_.apply(d(), arguments);
}
function l_(e) {
	var t = e.copy;
	return e.padding = e.paddingOuter, delete e.paddingInner, delete e.paddingOuter, e.copy = function() {
		return l_(t());
	}, e;
}
function u_() {
	return l_(c_.apply(null, arguments).paddingInner(1));
}
// ../../../peach/frontend/node_modules/d3-color/src/define.js
function d_(e, t, n) {
	e.prototype = t.prototype = n, n.constructor = e;
}
function f_(e, t) {
	var n = Object.create(e.prototype);
	for (var r in t) n[r] = t[r];
	return n;
}
// ../../../peach/frontend/node_modules/d3-color/src/color.js
function p_() {}
var m_ = .7, h_ = 1 / m_, g_ = "\\s*([+-]?\\d+)\\s*", __ = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", v_ = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", y_ = /^#([0-9a-f]{3,8})$/, b_ = RegExp(`^rgb\\(${g_},${g_},${g_}\\)$`), x_ = RegExp(`^rgb\\(${v_},${v_},${v_}\\)$`), S_ = RegExp(`^rgba\\(${g_},${g_},${g_},${__}\\)$`), C_ = RegExp(`^rgba\\(${v_},${v_},${v_},${__}\\)$`), w_ = RegExp(`^hsl\\(${__},${v_},${v_}\\)$`), T_ = RegExp(`^hsla\\(${__},${v_},${v_},${__}\\)$`), E_ = {
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
d_(p_, j_, {
	copy(e) {
		return Object.assign(new this.constructor(), this, e);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: D_,
	formatHex: D_,
	formatHex8: O_,
	formatHsl: k_,
	formatRgb: A_,
	toString: A_
});
function D_() {
	return this.rgb().formatHex();
}
function O_() {
	return this.rgb().formatHex8();
}
function k_() {
	return W_(this).formatHsl();
}
function A_() {
	return this.rgb().formatRgb();
}
function j_(e) {
	var t, n;
	return e = (e + "").trim().toLowerCase(), (t = y_.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? M_(t) : n === 3 ? new I_(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? N_(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? N_(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = b_.exec(e)) ? new I_(t[1], t[2], t[3], 1) : (t = x_.exec(e)) ? new I_(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = S_.exec(e)) ? N_(t[1], t[2], t[3], t[4]) : (t = C_.exec(e)) ? N_(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = w_.exec(e)) ? U_(t[1], t[2] / 100, t[3] / 100, 1) : (t = T_.exec(e)) ? U_(t[1], t[2] / 100, t[3] / 100, t[4]) : E_.hasOwnProperty(e) ? M_(E_[e]) : e === "transparent" ? new I_(NaN, NaN, NaN, 0) : null;
}
function M_(e) {
	return new I_(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function N_(e, t, n, r) {
	return r <= 0 && (e = t = n = NaN), new I_(e, t, n, r);
}
function P_(e) {
	return e instanceof p_ || (e = j_(e)), e ? (e = e.rgb(), new I_(e.r, e.g, e.b, e.opacity)) : new I_();
}
function F_(e, t, n, r) {
	return arguments.length === 1 ? P_(e) : new I_(e, t, n, r ?? 1);
}
function I_(e, t, n, r) {
	this.r = +e, this.g = +t, this.b = +n, this.opacity = +r;
}
d_(I_, F_, f_(p_, {
	brighter(e) {
		return e = e == null ? h_ : h_ ** +e, new I_(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? m_ : m_ ** +e, new I_(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	rgb() {
		return this;
	},
	clamp() {
		return new I_(V_(this.r), V_(this.g), V_(this.b), B_(this.opacity));
	},
	displayable() {
		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
	},
	hex: L_,
	formatHex: L_,
	formatHex8: R_,
	formatRgb: z_,
	toString: z_
}));
function L_() {
	return `#${H_(this.r)}${H_(this.g)}${H_(this.b)}`;
}
function R_() {
	return `#${H_(this.r)}${H_(this.g)}${H_(this.b)}${H_((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function z_() {
	let e = B_(this.opacity);
	return `${e === 1 ? "rgb(" : "rgba("}${V_(this.r)}, ${V_(this.g)}, ${V_(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function B_(e) {
	return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function V_(e) {
	return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function H_(e) {
	return e = V_(e), (e < 16 ? "0" : "") + e.toString(16);
}
function U_(e, t, n, r) {
	return r <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new K_(e, t, n, r);
}
function W_(e) {
	if (e instanceof K_) return new K_(e.h, e.s, e.l, e.opacity);
	if (e instanceof p_ || (e = j_(e)), !e) return new K_();
	if (e instanceof K_) return e;
	e = e.rgb();
	var t = e.r / 255, n = e.g / 255, r = e.b / 255, i = Math.min(t, n, r), a = Math.max(t, n, r), o = NaN, s = a - i, c = (a + i) / 2;
	return s ? (o = t === a ? (n - r) / s + (n < r) * 6 : n === a ? (r - t) / s + 2 : (t - n) / s + 4, s /= c < .5 ? a + i : 2 - a - i, o *= 60) : s = c > 0 && c < 1 ? 0 : o, new K_(o, s, c, e.opacity);
}
function G_(e, t, n, r) {
	return arguments.length === 1 ? W_(e) : new K_(e, t, n, r ?? 1);
}
function K_(e, t, n, r) {
	this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
d_(K_, G_, f_(p_, {
	brighter(e) {
		return e = e == null ? h_ : h_ ** +e, new K_(this.h, this.s, this.l * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? m_ : m_ ** +e, new K_(this.h, this.s, this.l * e, this.opacity);
	},
	rgb() {
		var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < .5 ? n : 1 - n) * t, i = 2 * n - r;
		return new I_(Y_(e >= 240 ? e - 240 : e + 120, i, r), Y_(e, i, r), Y_(e < 120 ? e + 240 : e - 120, i, r), this.opacity);
	},
	clamp() {
		return new K_(q_(this.h), J_(this.s), J_(this.l), B_(this.opacity));
	},
	displayable() {
		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
	},
	formatHsl() {
		let e = B_(this.opacity);
		return `${e === 1 ? "hsl(" : "hsla("}${q_(this.h)}, ${J_(this.s) * 100}%, ${J_(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
	}
}));
function q_(e) {
	return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function J_(e) {
	return Math.max(0, Math.min(1, e || 0));
}
function Y_(e, t, n) {
	return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/constant.js
var X_ = (e) => () => e;
// ../../../peach/frontend/node_modules/d3-interpolate/src/color.js
function Z_(e, t) {
	return function(n) {
		return e + n * t;
	};
}
function Q_(e, t, n) {
	return e **= +n, t = t ** +n - e, n = 1 / n, function(r) {
		return (e + r * t) ** +n;
	};
}
function $_(e) {
	return (e = +e) == 1 ? ev : function(t, n) {
		return n - t ? Q_(t, n, e) : X_(isNaN(t) ? n : t);
	};
}
function ev(e, t) {
	var n = t - e;
	return n ? Z_(e, n) : X_(isNaN(e) ? t : e);
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/rgb.js
var tv = (function e(t) {
	var n = $_(t);
	function r(e, t) {
		var r = n((e = F_(e)).r, (t = F_(t)).r), i = n(e.g, t.g), a = n(e.b, t.b), o = ev(e.opacity, t.opacity);
		return function(t) {
			return e.r = r(t), e.g = i(t), e.b = a(t), e.opacity = o(t), e + "";
		};
	}
	return r.gamma = e, r;
})(1);
// ../../../peach/frontend/node_modules/d3-interpolate/src/numberArray.js
function nv(e, t) {
	t ||= [];
	var n = e ? Math.min(t.length, e.length) : 0, r = t.slice(), i;
	return function(a) {
		for (i = 0; i < n; ++i) r[i] = e[i] * (1 - a) + t[i] * a;
		return r;
	};
}
function rv(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/array.js
function iv(e, t) {
	for (var n = t ? t.length : 0, r = e ? Math.min(n, e.length) : 0, i = Array(r), a = Array(n), o = 0; o < r; ++o) i[o] = pv(e[o], t[o]);
	for (; o < n; ++o) a[o] = t[o];
	return function(e) {
		for (o = 0; o < r; ++o) a[o] = i[o](e);
		return a;
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/date.js
function av(e, t) {
	var n = /* @__PURE__ */ new Date();
	return e = +e, t = +t, function(r) {
		return n.setTime(e * (1 - r) + t * r), n;
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/number.js
function ov(e, t) {
	return e = +e, t = +t, function(n) {
		return e * (1 - n) + t * n;
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/object.js
function sv(e, t) {
	var n = {}, r = {}, i;
	for (i in typeof e == "object" && e || (e = {}), typeof t == "object" && t || (t = {}), t) i in e ? n[i] = pv(e[i], t[i]) : r[i] = t[i];
	return function(e) {
		for (i in n) r[i] = n[i](e);
		return r;
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/string.js
var cv = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, lv = new RegExp(cv.source, "g");
function uv(e) {
	return function() {
		return e;
	};
}
function dv(e) {
	return function(t) {
		return e(t) + "";
	};
}
function fv(e, t) {
	var n = cv.lastIndex = lv.lastIndex = 0, r, i, a, o = -1, s = [], c = [];
	for (e += "", t += ""; (r = cv.exec(e)) && (i = lv.exec(t));) (a = i.index) > n && (a = t.slice(n, a), s[o] ? s[o] += a : s[++o] = a), (r = r[0]) === (i = i[0]) ? s[o] ? s[o] += i : s[++o] = i : (s[++o] = null, c.push({
		i: o,
		x: ov(r, i)
	})), n = lv.lastIndex;
	return n < t.length && (a = t.slice(n), s[o] ? s[o] += a : s[++o] = a), s.length < 2 ? c[0] ? dv(c[0].x) : uv(t) : (t = c.length, function(e) {
		for (var n = 0, r; n < t; ++n) s[(r = c[n]).i] = r.x(e);
		return s.join("");
	});
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/value.js
function pv(e, t) {
	var n = typeof t, r;
	return t == null || n === "boolean" ? X_(t) : (n === "number" ? ov : n === "string" ? (r = j_(t)) ? (t = r, tv) : fv : t instanceof j_ ? tv : t instanceof Date ? av : rv(t) ? nv : Array.isArray(t) ? iv : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? sv : ov)(e, t);
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/round.js
function mv(e, t) {
	return e = +e, t = +t, function(n) {
		return Math.round(e * (1 - n) + t * n);
	};
}
// ../../../peach/frontend/node_modules/d3-interpolate/src/piecewise.js
function hv(e, t) {
	t === void 0 && (t = e, e = pv);
	for (var n = 0, r = t.length - 1, i = t[0], a = Array(r < 0 ? 0 : r); n < r;) a[n] = e(i, i = t[++n]);
	return function(e) {
		var t = Math.max(0, Math.min(r - 1, Math.floor(e *= r)));
		return a[t](e - t);
	};
}
// ../../../peach/frontend/node_modules/d3-scale/src/constant.js
function gv(e) {
	return function() {
		return e;
	};
}
// ../../../peach/frontend/node_modules/d3-scale/src/number.js
function _v(e) {
	return +e;
}
// ../../../peach/frontend/node_modules/d3-scale/src/continuous.js
var vv = [0, 1];
function yv(e) {
	return e;
}
function bv(e, t) {
	return (t -= e = +e) ? function(n) {
		return (n - e) / t;
	} : gv(isNaN(t) ? NaN : .5);
}
function xv(e, t) {
	var n;
	return e > t && (n = e, e = t, t = n), function(n) {
		return Math.max(e, Math.min(t, n));
	};
}
function Sv(e, t, n) {
	var r = e[0], i = e[1], a = t[0], o = t[1];
	return i < r ? (r = bv(i, r), a = n(o, a)) : (r = bv(r, i), a = n(a, o)), function(e) {
		return a(r(e));
	};
}
function Cv(e, t, n) {
	var r = Math.min(e.length, t.length) - 1, i = Array(r), a = Array(r), o = -1;
	for (e[r] < e[0] && (e = e.slice().reverse(), t = t.slice().reverse()); ++o < r;) i[o] = bv(e[o], e[o + 1]), a[o] = n(t[o], t[o + 1]);
	return function(t) {
		var n = zg(e, t, 1, r) - 1;
		return a[n](i[n](t));
	};
}
function wv(e, t) {
	return t.domain(e.domain()).range(e.range()).interpolate(e.interpolate()).clamp(e.clamp()).unknown(e.unknown());
}
function Tv() {
	var e = vv, t = vv, n = pv, r, i, a, o = yv, s, c, l;
	function u() {
		var n = Math.min(e.length, t.length);
		return o !== yv && (o = xv(e[0], e[n - 1])), s = n > 2 ? Cv : Sv, c = l = null, d;
	}
	function d(i) {
		return i == null || isNaN(i = +i) ? a : (c ||= s(e.map(r), t, n))(r(o(i)));
	}
	return d.invert = function(n) {
		return o(i((l ||= s(t, e.map(r), ov))(n)));
	}, d.domain = function(t) {
		return arguments.length ? (e = Array.from(t, _v), u()) : e.slice();
	}, d.range = function(e) {
		return arguments.length ? (t = Array.from(e), u()) : t.slice();
	}, d.rangeRound = function(e) {
		return t = Array.from(e), n = mv, u();
	}, d.clamp = function(e) {
		return arguments.length ? (o = e ? !0 : yv, u()) : o !== yv;
	}, d.interpolate = function(e) {
		return arguments.length ? (n = e, u()) : n;
	}, d.unknown = function(e) {
		return arguments.length ? (a = e, d) : a;
	}, function(e, t) {
		return r = e, i = t, u();
	};
}
function Ev() {
	return Tv()(yv, yv);
}
// ../../../peach/frontend/node_modules/d3-format/src/formatDecimal.js
function Dv(e) {
	return Math.abs(e = Math.round(e)) >= 1e21 ? e.toLocaleString("en").replace(/,/g, "") : e.toString(10);
}
function Ov(e, t) {
	if (!isFinite(e) || e === 0) return null;
	var n = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf("e"), r = e.slice(0, n);
	return [r.length > 1 ? r[0] + r.slice(2) : r, +e.slice(n + 1)];
}
// ../../../peach/frontend/node_modules/d3-format/src/exponent.js
function kv(e) {
	return e = Ov(Math.abs(e)), e ? e[1] : NaN;
}
// ../../../peach/frontend/node_modules/d3-format/src/formatGroup.js
function Av(e, t) {
	return function(n, r) {
		for (var i = n.length, a = [], o = 0, s = e[0], c = 0; i > 0 && s > 0 && (c + s + 1 > r && (s = Math.max(1, r - c)), a.push(n.substring(i -= s, i + s)), !((c += s + 1) > r));) s = e[o = (o + 1) % e.length];
		return a.reverse().join(t);
	};
}
// ../../../peach/frontend/node_modules/d3-format/src/formatNumerals.js
function jv(e) {
	return function(t) {
		return t.replace(/[0-9]/g, function(t) {
			return e[+t];
		});
	};
}
// ../../../peach/frontend/node_modules/d3-format/src/formatSpecifier.js
var Mv = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function Nv(e) {
	if (!(t = Mv.exec(e))) throw Error("invalid format: " + e);
	var t;
	return new Pv({
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
Nv.prototype = Pv.prototype;
function Pv(e) {
	this.fill = e.fill === void 0 ? " " : e.fill + "", this.align = e.align === void 0 ? ">" : e.align + "", this.sign = e.sign === void 0 ? "-" : e.sign + "", this.symbol = e.symbol === void 0 ? "" : e.symbol + "", this.zero = !!e.zero, this.width = e.width === void 0 ? void 0 : +e.width, this.comma = !!e.comma, this.precision = e.precision === void 0 ? void 0 : +e.precision, this.trim = !!e.trim, this.type = e.type === void 0 ? "" : e.type + "";
}
Pv.prototype.toString = function() {
	return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
// ../../../peach/frontend/node_modules/d3-format/src/formatTrim.js
function Fv(e) {
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
var Iv;
function Lv(e, t) {
	var n = Ov(e, t);
	if (!n) return Iv = void 0, e.toPrecision(t);
	var r = n[0], i = n[1], a = i - (Iv = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1, o = r.length;
	return a === o ? r : a > o ? r + Array(a - o + 1).join("0") : a > 0 ? r.slice(0, a) + "." + r.slice(a) : "0." + Array(1 - a).join("0") + Ov(e, Math.max(0, t + a - 1))[0];
}
// ../../../peach/frontend/node_modules/d3-format/src/formatRounded.js
function Rv(e, t) {
	var n = Ov(e, t);
	if (!n) return e + "";
	var r = n[0], i = n[1];
	return i < 0 ? "0." + Array(-i).join("0") + r : r.length > i + 1 ? r.slice(0, i + 1) + "." + r.slice(i + 1) : r + Array(i - r.length + 2).join("0");
}
// ../../../peach/frontend/node_modules/d3-format/src/formatTypes.js
var zv = {
	"%": (e, t) => (e * 100).toFixed(t),
	b: (e) => Math.round(e).toString(2),
	c: (e) => e + "",
	d: Dv,
	e: (e, t) => e.toExponential(t),
	f: (e, t) => e.toFixed(t),
	g: (e, t) => e.toPrecision(t),
	o: (e) => Math.round(e).toString(8),
	p: (e, t) => Rv(e * 100, t),
	r: Rv,
	s: Lv,
	X: (e) => Math.round(e).toString(16).toUpperCase(),
	x: (e) => Math.round(e).toString(16)
};
// ../../../peach/frontend/node_modules/d3-format/src/identity.js
function Bv(e) {
	return e;
}
// ../../../peach/frontend/node_modules/d3-format/src/locale.js
var Vv = Array.prototype.map, Hv = [
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
function Uv(e) {
	var t = e.grouping === void 0 || e.thousands === void 0 ? Bv : Av(Vv.call(e.grouping, Number), e.thousands + ""), n = e.currency === void 0 ? "" : e.currency[0] + "", r = e.currency === void 0 ? "" : e.currency[1] + "", i = e.decimal === void 0 ? "." : e.decimal + "", a = e.numerals === void 0 ? Bv : jv(Vv.call(e.numerals, String)), o = e.percent === void 0 ? "%" : e.percent + "", s = e.minus === void 0 ? "−" : e.minus + "", c = e.nan === void 0 ? "NaN" : e.nan + "";
	function l(e, l) {
		e = Nv(e);
		var u = e.fill, d = e.align, f = e.sign, p = e.symbol, m = e.zero, h = e.width, g = e.comma, _ = e.precision, v = e.trim, y = e.type;
		y === "n" ? (g = !0, y = "g") : zv[y] || (_ === void 0 && (_ = 12), v = !0, y = "g"), (m || u === "0" && d === "=") && (m = !0, u = "0", d = "=");
		var b = (l && l.prefix !== void 0 ? l.prefix : "") + (p === "$" ? n : p === "#" && /[boxX]/.test(y) ? "0" + y.toLowerCase() : ""), x = (p === "$" ? r : /[%p]/.test(y) ? o : "") + (l && l.suffix !== void 0 ? l.suffix : ""), S = zv[y], C = /[defgprs%]/.test(y);
		_ = _ === void 0 ? 6 : /[gprs]/.test(y) ? Math.max(1, Math.min(21, _)) : Math.max(0, Math.min(20, _));
		function w(e) {
			var n = b, r = x, o, l, p;
			if (y === "c") r = S(e) + r, e = "";
			else {
				e = +e;
				var w = e < 0 || 1 / e < 0;
				if (e = isNaN(e) ? c : S(Math.abs(e), _), v && (e = Fv(e)), w && +e == 0 && f !== "+" && (w = !1), n = (w ? f === "(" ? f : s : f === "-" || f === "(" ? "" : f) + n, r = (y === "s" && !isNaN(e) && Iv !== void 0 ? Hv[8 + Iv / 3] : "") + r + (w && f === "(" ? ")" : ""), C) {
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
		var n = Math.max(-8, Math.min(8, Math.floor(kv(t) / 3))) * 3, r = 10 ** -n, i = l((e = Nv(e), e.type = "f", e), { suffix: Hv[8 + n / 3] });
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
var Wv, Gv, Kv;
qv({
	thousands: ",",
	grouping: [3],
	currency: ["$", ""]
});
function qv(e) {
	return Wv = Uv(e), Gv = Wv.format, Kv = Wv.formatPrefix, Wv;
}
// ../../../peach/frontend/node_modules/d3-format/src/precisionFixed.js
function Jv(e) {
	return Math.max(0, -kv(Math.abs(e)));
}
// ../../../peach/frontend/node_modules/d3-format/src/precisionPrefix.js
function Yv(e, t) {
	return Math.max(0, Math.max(-8, Math.min(8, Math.floor(kv(t) / 3))) * 3 - kv(Math.abs(e)));
}
// ../../../peach/frontend/node_modules/d3-format/src/precisionRound.js
function Xv(e, t) {
	return e = Math.abs(e), t = Math.abs(t) - e, Math.max(0, kv(t) - kv(e)) + 1;
}
// ../../../peach/frontend/node_modules/d3-scale/src/tickFormat.js
function Zv(e, t, n, r) {
	var i = Xg(e, t, n), a;
	switch (r = Nv(r ?? ",f"), r.type) {
		case "s":
			var o = Math.max(Math.abs(e), Math.abs(t));
			return r.precision == null && !isNaN(a = Yv(i, o)) && (r.precision = a), Kv(r, o);
		case "":
		case "e":
		case "g":
		case "p":
		case "r":
			r.precision == null && !isNaN(a = Xv(i, Math.max(Math.abs(e), Math.abs(t)))) && (r.precision = a - (r.type === "e"));
			break;
		case "f":
		case "%": r.precision == null && !isNaN(a = Jv(i)) && (r.precision = a - (r.type === "%") * 2);
	}
	return Gv(r);
}
// ../../../peach/frontend/node_modules/d3-scale/src/linear.js
function Qv(e) {
	var t = e.domain;
	return e.ticks = function(e) {
		var n = t();
		return Jg(n[0], n[n.length - 1], e ?? 10);
	}, e.tickFormat = function(e, n) {
		var r = t();
		return Zv(r[0], r[r.length - 1], e ?? 10, n);
	}, e.nice = function(n) {
		n ??= 10;
		var r = t(), i = 0, a = r.length - 1, o = r[i], s = r[a], c, l, u = 10;
		for (s < o && (l = o, o = s, s = l, l = i, i = a, a = l); u-- > 0;) {
			if (l = Yg(o, s, n), l === c) return r[i] = o, r[a] = s, t(r);
			if (l > 0) o = Math.floor(o / l) * l, s = Math.ceil(s / l) * l;
			else if (l < 0) o = Math.ceil(o * l) / l, s = Math.floor(s * l) / l;
			else break;
			c = l;
		}
		return e;
	}, e;
}
function $v() {
	var e = Ev();
	return e.copy = function() {
		return wv(e, $v());
	}, i_.apply(e, arguments), Qv(e);
}
// ../../../peach/frontend/node_modules/d3-scale/src/identity.js
function ey(e) {
	var t;
	function n(e) {
		return e == null || isNaN(e = +e) ? t : e;
	}
	return n.invert = n, n.domain = n.range = function(t) {
		return arguments.length ? (e = Array.from(t, _v), n) : e.slice();
	}, n.unknown = function(e) {
		return arguments.length ? (t = e, n) : t;
	}, n.copy = function() {
		return ey(e).unknown(t);
	}, e = arguments.length ? Array.from(e, _v) : [0, 1], Qv(n);
}
// ../../../peach/frontend/node_modules/d3-scale/src/nice.js
function ty(e, t) {
	e = e.slice();
	var n = 0, r = e.length - 1, i = e[n], a = e[r], o;
	return a < i && (o = n, n = r, r = o, o = i, i = a, a = o), e[n] = t.floor(i), e[r] = t.ceil(a), e;
}
// ../../../peach/frontend/node_modules/d3-scale/src/log.js
function ny(e) {
	return Math.log(e);
}
function ry(e) {
	return Math.exp(e);
}
function iy(e) {
	return -Math.log(-e);
}
function ay(e) {
	return -Math.exp(-e);
}
function oy(e) {
	return isFinite(e) ? +("1e" + e) : e < 0 ? 0 : e;
}
function sy(e) {
	return e === 10 ? oy : e === Math.E ? Math.exp : (t) => e ** +t;
}
function cy(e) {
	return e === Math.E ? Math.log : e === 10 && Math.log10 || e === 2 && Math.log2 || (e = Math.log(e), (t) => Math.log(t) / e);
}
function ly(e) {
	return (t, n) => -e(-t, n);
}
function uy(e) {
	let t = e(ny, ry), n = t.domain, r = 10, i, a;
	function o() {
		return i = cy(r), a = sy(r), n()[0] < 0 ? (i = ly(i), a = ly(a), e(iy, ay)) : e(ny, ry), t;
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
			m.length * 2 < p && (m = Jg(o, s, p));
		} else m = Jg(l, u, Math.min(u - l, p)).map(a);
		return c ? m.reverse() : m;
	}, t.tickFormat = (e, n) => {
		if (e ??= 10, n ??= r === 10 ? "s" : ",", typeof n != "function" && (!(r % 1) && (n = Nv(n)).precision == null && (n.trim = !0), n = Gv(n)), e === Infinity) return n;
		let o = Math.max(1, r * e / t.ticks().length);
		return (e) => {
			let t = e / a(Math.round(i(e)));
			return t * r < r - .5 && (t *= r), t <= o ? n(e) : "";
		};
	}, t.nice = () => n(ty(n(), {
		floor: (e) => a(Math.floor(i(e))),
		ceil: (e) => a(Math.ceil(i(e)))
	})), t;
}
function dy() {
	let e = uy(Tv()).domain([1, 10]);
	return e.copy = () => wv(e, dy()).base(e.base()), i_.apply(e, arguments), e;
}
// ../../../peach/frontend/node_modules/d3-scale/src/symlog.js
function fy(e) {
	return function(t) {
		return Math.sign(t) * Math.log1p(Math.abs(t / e));
	};
}
function py(e) {
	return function(t) {
		return Math.sign(t) * Math.expm1(Math.abs(t)) * e;
	};
}
function my(e) {
	var t = 1, n = e(fy(t), py(t));
	return n.constant = function(n) {
		return arguments.length ? e(fy(t = +n), py(t)) : t;
	}, Qv(n);
}
function hy() {
	var e = my(Tv());
	return e.copy = function() {
		return wv(e, hy()).constant(e.constant());
	}, i_.apply(e, arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/pow.js
function gy(e) {
	return function(t) {
		return t < 0 ? -((-t) ** +e) : t ** +e;
	};
}
function _y(e) {
	return e < 0 ? -Math.sqrt(-e) : Math.sqrt(e);
}
function vy(e) {
	return e < 0 ? -e * e : e * e;
}
function yy(e) {
	var t = e(yv, yv), n = 1;
	function r() {
		return n === 1 ? e(yv, yv) : n === .5 ? e(_y, vy) : e(gy(n), gy(1 / n));
	}
	return t.exponent = function(e) {
		return arguments.length ? (n = +e, r()) : n;
	}, Qv(t);
}
function by() {
	var e = yy(Tv());
	return e.copy = function() {
		return wv(e, by()).exponent(e.exponent());
	}, i_.apply(e, arguments), e;
}
function xy() {
	return by.apply(null, arguments).exponent(.5);
}
// ../../../peach/frontend/node_modules/d3-scale/src/radial.js
function Sy(e) {
	return Math.sign(e) * e * e;
}
function Cy(e) {
	return Math.sign(e) * Math.sqrt(Math.abs(e));
}
function wy() {
	var e = Ev(), t = [0, 1], n = !1, r;
	function i(t) {
		var i = Cy(e(t));
		return isNaN(i) ? r : n ? Math.round(i) : i;
	}
	return i.invert = function(t) {
		return e.invert(Sy(t));
	}, i.domain = function(t) {
		return arguments.length ? (e.domain(t), i) : e.domain();
	}, i.range = function(n) {
		return arguments.length ? (e.range((t = Array.from(n, _v)).map(Sy)), i) : t.slice();
	}, i.rangeRound = function(e) {
		return i.range(e).round(!0);
	}, i.round = function(e) {
		return arguments.length ? (n = !!e, i) : n;
	}, i.clamp = function(t) {
		return arguments.length ? (e.clamp(t), i) : e.clamp();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return wy(e.domain(), t).round(n).clamp(e.clamp()).unknown(r);
	}, i_.apply(i, arguments), Qv(i);
}
// ../../../peach/frontend/node_modules/d3-scale/src/quantile.js
function Ty() {
	var e = [], t = [], n = [], r;
	function i() {
		var r = 0, i = Math.max(1, t.length);
		for (n = Array(i - 1); ++r < i;) n[r - 1] = n_(e, r / i);
		return a;
	}
	function a(e) {
		return e == null || isNaN(e = +e) ? r : t[zg(n, e)];
	}
	return a.invertExtent = function(r) {
		var i = t.indexOf(r);
		return i < 0 ? [NaN, NaN] : [i > 0 ? n[i - 1] : e[0], i < n.length ? n[i] : e[e.length - 1]];
	}, a.domain = function(t) {
		if (!arguments.length) return e.slice();
		e = [];
		for (let n of t) n != null && !isNaN(n = +n) && e.push(n);
		return e.sort(Ng), i();
	}, a.range = function(e) {
		return arguments.length ? (t = Array.from(e), i()) : t.slice();
	}, a.unknown = function(e) {
		return arguments.length ? (r = e, a) : r;
	}, a.quantiles = function() {
		return n.slice();
	}, a.copy = function() {
		return Ty().domain(e).range(t).unknown(r);
	}, i_.apply(a, arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/quantize.js
function Ey() {
	var e = 0, t = 1, n = 1, r = [.5], i = [0, 1], a;
	function o(e) {
		return e != null && e <= e ? i[zg(r, e, 0, n)] : a;
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
		return Ey().domain([e, t]).range(i).unknown(a);
	}, i_.apply(Qv(o), arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/threshold.js
function Dy() {
	var e = [.5], t = [0, 1], n, r = 1;
	function i(i) {
		return i != null && i <= i ? t[zg(e, i, 0, r)] : n;
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
		return Dy().domain(e).range(t).unknown(n);
	}, i_.apply(i, arguments);
}
// ../../../peach/frontend/node_modules/d3-time/src/interval.js
var Oy = /* @__PURE__ */ new Date(), ky = /* @__PURE__ */ new Date();
function Ay(e, t, n, r) {
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
	}, i.filter = (n) => Ay((t) => {
		if (t >= t) for (; e(t), !n(t);) t.setTime(t - 1);
	}, (e, r) => {
		if (e >= e) {
			if (r < 0) for (; ++r <= 0;) for (; t(e, -1), !n(e););
			else for (; --r >= 0;) for (; t(e, 1), !n(e););
		}
	}), n && (i.count = (t, r) => (Oy.setTime(+t), ky.setTime(+r), e(Oy), e(ky), Math.floor(n(Oy, ky))), i.every = (e) => (e = Math.floor(e), !isFinite(e) || !(e > 0) ? null : e > 1 ? i.filter(r ? (t) => r(t) % e === 0 : (t) => i.count(0, t) % e === 0) : i)), i;
}
// ../../../peach/frontend/node_modules/d3-time/src/millisecond.js
var jy = Ay(() => {}, (e, t) => {
	e.setTime(+e + t);
}, (e, t) => t - e);
jy.every = (e) => (e = Math.floor(e), !isFinite(e) || !(e > 0) ? null : e > 1 ? Ay((t) => {
	t.setTime(Math.floor(t / e) * e);
}, (t, n) => {
	t.setTime(+t + n * e);
}, (t, n) => (n - t) / e) : jy), jy.range;
// ../../../peach/frontend/node_modules/d3-time/src/duration.js
var My = 1e3, Ny = My * 60, Py = Ny * 60, Fy = Py * 24, Iy = Fy * 7, Ly = Fy * 30, Ry = Fy * 365, zy = Ay((e) => {
	e.setTime(e - e.getMilliseconds());
}, (e, t) => {
	e.setTime(+e + t * My);
}, (e, t) => (t - e) / My, (e) => e.getUTCSeconds());
zy.range;
// ../../../peach/frontend/node_modules/d3-time/src/minute.js
var By = Ay((e) => {
	e.setTime(e - e.getMilliseconds() - e.getSeconds() * My);
}, (e, t) => {
	e.setTime(+e + t * Ny);
}, (e, t) => (t - e) / Ny, (e) => e.getMinutes());
By.range;
var Vy = Ay((e) => {
	e.setUTCSeconds(0, 0);
}, (e, t) => {
	e.setTime(+e + t * Ny);
}, (e, t) => (t - e) / Ny, (e) => e.getUTCMinutes());
Vy.range;
// ../../../peach/frontend/node_modules/d3-time/src/hour.js
var Hy = Ay((e) => {
	e.setTime(e - e.getMilliseconds() - e.getSeconds() * My - e.getMinutes() * Ny);
}, (e, t) => {
	e.setTime(+e + t * Py);
}, (e, t) => (t - e) / Py, (e) => e.getHours());
Hy.range;
var Uy = Ay((e) => {
	e.setUTCMinutes(0, 0, 0);
}, (e, t) => {
	e.setTime(+e + t * Py);
}, (e, t) => (t - e) / Py, (e) => e.getUTCHours());
Uy.range;
// ../../../peach/frontend/node_modules/d3-time/src/day.js
var Wy = Ay((e) => e.setHours(0, 0, 0, 0), (e, t) => e.setDate(e.getDate() + t), (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * Ny) / Fy, (e) => e.getDate() - 1);
Wy.range;
var Gy = Ay((e) => {
	e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCDate(e.getUTCDate() + t);
}, (e, t) => (t - e) / Fy, (e) => e.getUTCDate() - 1);
Gy.range;
var Ky = Ay((e) => {
	e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCDate(e.getUTCDate() + t);
}, (e, t) => (t - e) / Fy, (e) => Math.floor(e / Fy));
Ky.range;
// ../../../peach/frontend/node_modules/d3-time/src/week.js
function qy(e) {
	return Ay((t) => {
		t.setDate(t.getDate() - (t.getDay() + 7 - e) % 7), t.setHours(0, 0, 0, 0);
	}, (e, t) => {
		e.setDate(e.getDate() + t * 7);
	}, (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * Ny) / Iy);
}
var Jy = qy(0), Yy = qy(1), Xy = qy(2), Zy = qy(3), Qy = qy(4), $y = qy(5), eb = qy(6);
Jy.range, Yy.range, Xy.range, Zy.range, Qy.range, $y.range, eb.range;
function tb(e) {
	return Ay((t) => {
		t.setUTCDate(t.getUTCDate() - (t.getUTCDay() + 7 - e) % 7), t.setUTCHours(0, 0, 0, 0);
	}, (e, t) => {
		e.setUTCDate(e.getUTCDate() + t * 7);
	}, (e, t) => (t - e) / Iy);
}
var nb = tb(0), rb = tb(1), ib = tb(2), ab = tb(3), ob = tb(4), sb = tb(5), cb = tb(6);
nb.range, rb.range, ib.range, ab.range, ob.range, sb.range, cb.range;
// ../../../peach/frontend/node_modules/d3-time/src/month.js
var lb = Ay((e) => {
	e.setDate(1), e.setHours(0, 0, 0, 0);
}, (e, t) => {
	e.setMonth(e.getMonth() + t);
}, (e, t) => t.getMonth() - e.getMonth() + (t.getFullYear() - e.getFullYear()) * 12, (e) => e.getMonth());
lb.range;
var ub = Ay((e) => {
	e.setUTCDate(1), e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCMonth(e.getUTCMonth() + t);
}, (e, t) => t.getUTCMonth() - e.getUTCMonth() + (t.getUTCFullYear() - e.getUTCFullYear()) * 12, (e) => e.getUTCMonth());
ub.range;
// ../../../peach/frontend/node_modules/d3-time/src/year.js
var db = Ay((e) => {
	e.setMonth(0, 1), e.setHours(0, 0, 0, 0);
}, (e, t) => {
	e.setFullYear(e.getFullYear() + t);
}, (e, t) => t.getFullYear() - e.getFullYear(), (e) => e.getFullYear());
db.every = (e) => !isFinite(e = Math.floor(e)) || !(e > 0) ? null : Ay((t) => {
	t.setFullYear(Math.floor(t.getFullYear() / e) * e), t.setMonth(0, 1), t.setHours(0, 0, 0, 0);
}, (t, n) => {
	t.setFullYear(t.getFullYear() + n * e);
}), db.range;
var fb = Ay((e) => {
	e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0);
}, (e, t) => {
	e.setUTCFullYear(e.getUTCFullYear() + t);
}, (e, t) => t.getUTCFullYear() - e.getUTCFullYear(), (e) => e.getUTCFullYear());
fb.every = (e) => !isFinite(e = Math.floor(e)) || !(e > 0) ? null : Ay((t) => {
	t.setUTCFullYear(Math.floor(t.getUTCFullYear() / e) * e), t.setUTCMonth(0, 1), t.setUTCHours(0, 0, 0, 0);
}, (t, n) => {
	t.setUTCFullYear(t.getUTCFullYear() + n * e);
}), fb.range;
// ../../../peach/frontend/node_modules/d3-time/src/ticks.js
function pb(e, t, n, r, i, a) {
	let o = [
		[
			zy,
			1,
			My
		],
		[
			zy,
			5,
			5 * My
		],
		[
			zy,
			15,
			15 * My
		],
		[
			zy,
			30,
			30 * My
		],
		[
			a,
			1,
			Ny
		],
		[
			a,
			5,
			5 * Ny
		],
		[
			a,
			15,
			15 * Ny
		],
		[
			a,
			30,
			30 * Ny
		],
		[
			i,
			1,
			Py
		],
		[
			i,
			3,
			3 * Py
		],
		[
			i,
			6,
			6 * Py
		],
		[
			i,
			12,
			12 * Py
		],
		[
			r,
			1,
			Fy
		],
		[
			r,
			2,
			2 * Fy
		],
		[
			n,
			1,
			Iy
		],
		[
			t,
			1,
			Ly
		],
		[
			t,
			3,
			3 * Ly
		],
		[
			e,
			1,
			Ry
		]
	];
	function s(e, t, n) {
		let r = t < e;
		r && ([e, t] = [t, e]);
		let i = n && typeof n.range == "function" ? n : c(e, t, n), a = i ? i.range(e, +t + 1) : [];
		return r ? a.reverse() : a;
	}
	function c(t, n, r) {
		let i = Math.abs(n - t) / r, a = Pg(([, , e]) => e).right(o, i);
		if (a === o.length) return e.every(Xg(t / Ry, n / Ry, r));
		if (a === 0) return jy.every(Math.max(Xg(t, n, r), 1));
		let [s, c] = o[i / o[a - 1][2] < o[a][2] / i ? a - 1 : a];
		return s.every(c);
	}
	return [s, c];
}
var [mb, hb] = pb(fb, ub, nb, Ky, Uy, Vy), [gb, _b] = pb(db, lb, Jy, Wy, Hy, By);
// ../../../peach/frontend/node_modules/d3-time-format/src/locale.js
function vb(e) {
	if (0 <= e.y && e.y < 100) {
		var t = new Date(-1, e.m, e.d, e.H, e.M, e.S, e.L);
		return t.setFullYear(e.y), t;
	}
	return new Date(e.y, e.m, e.d, e.H, e.M, e.S, e.L);
}
function yb(e) {
	if (0 <= e.y && e.y < 100) {
		var t = new Date(Date.UTC(-1, e.m, e.d, e.H, e.M, e.S, e.L));
		return t.setUTCFullYear(e.y), t;
	}
	return new Date(Date.UTC(e.y, e.m, e.d, e.H, e.M, e.S, e.L));
}
function bb(e, t, n) {
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
function xb(e) {
	var t = e.dateTime, n = e.date, r = e.time, i = e.periods, a = e.days, o = e.shortDays, s = e.months, c = e.shortMonths, l = Db(i), u = Ob(i), d = Db(a), f = Ob(a), p = Db(o), m = Ob(o), h = Db(s), g = Ob(s), _ = Db(c), v = Ob(c), y = {
		a: N,
		A: ee,
		b: te,
		B: ne,
		c: null,
		d: Yb,
		e: Yb,
		f: ex,
		g: dx,
		G: px,
		H: Xb,
		I: Zb,
		j: Qb,
		L: $b,
		m: tx,
		M: nx,
		p: re,
		q: ie,
		Q: Ix,
		s: Lx,
		S: rx,
		u: ix,
		U: ax,
		V: sx,
		w: cx,
		W: lx,
		x: null,
		X: null,
		y: ux,
		Y: fx,
		Z: mx,
		"%": Fx
	}, b = {
		a: ae,
		A: oe,
		b: se,
		B: ce,
		c: null,
		d: hx,
		e: hx,
		f: bx,
		g: jx,
		G: Nx,
		H: gx,
		I: _x,
		j: vx,
		L: yx,
		m: xx,
		M: Sx,
		p: le,
		q: ue,
		Q: Ix,
		s: Lx,
		S: Cx,
		u: wx,
		U: Tx,
		V: Dx,
		w: Ox,
		W: kx,
		x: null,
		X: null,
		y: Ax,
		Y: Mx,
		Z: Px,
		"%": Fx
	}, x = {
		a: E,
		A: D,
		b: O,
		B: k,
		c: A,
		d: zb,
		e: zb,
		f: Gb,
		g: Fb,
		G: Pb,
		H: Vb,
		I: Vb,
		j: Bb,
		L: Wb,
		m: Rb,
		M: Hb,
		p: T,
		q: Lb,
		Q: qb,
		s: Jb,
		S: Ub,
		u: Ab,
		U: jb,
		V: Mb,
		w: kb,
		W: Nb,
		x: j,
		X: M,
		y: Fb,
		Y: Pb,
		Z: Ib,
		"%": Kb
	};
	y.x = S(n, y), y.X = S(r, y), y.c = S(t, y), b.x = S(n, b), b.X = S(r, b), b.c = S(t, b);
	function S(e, t) {
		return function(n) {
			var r = [], i = -1, a = 0, o = e.length, s, c, l;
			for (n instanceof Date || (n = /* @__PURE__ */ new Date(+n)); ++i < o;) e.charCodeAt(i) === 37 && (r.push(e.slice(a, i)), (c = Sb[s = e.charAt(++i)]) == null ? c = s === "e" ? " " : "0" : s = e.charAt(++i), (l = t[s]) && (s = l(n, c)), r.push(s), a = i + 1);
			return r.push(e.slice(a, i)), r.join("");
		};
	}
	function C(e, t) {
		return function(n) {
			var r = bb(1900, void 0, 1), i = w(r, e, n += "", 0), a, o;
			if (i != n.length) return null;
			if ("Q" in r) return new Date(r.Q);
			if ("s" in r) return new Date(r.s * 1e3 + ("L" in r ? r.L : 0));
			if (t && !("Z" in r) && (r.Z = 0), "p" in r && (r.H = r.H % 12 + r.p * 12), r.m === void 0 && (r.m = "q" in r ? r.q : 0), "V" in r) {
				if (r.V < 1 || r.V > 53) return null;
				"w" in r || (r.w = 1), "Z" in r ? (a = yb(bb(r.y, 0, 1)), o = a.getUTCDay(), a = o > 4 || o === 0 ? rb.ceil(a) : rb(a), a = Gy.offset(a, (r.V - 1) * 7), r.y = a.getUTCFullYear(), r.m = a.getUTCMonth(), r.d = a.getUTCDate() + (r.w + 6) % 7) : (a = vb(bb(r.y, 0, 1)), o = a.getDay(), a = o > 4 || o === 0 ? Yy.ceil(a) : Yy(a), a = Wy.offset(a, (r.V - 1) * 7), r.y = a.getFullYear(), r.m = a.getMonth(), r.d = a.getDate() + (r.w + 6) % 7);
			} else ("W" in r || "U" in r) && ("w" in r || (r.w = "u" in r ? r.u % 7 : +("W" in r)), o = "Z" in r ? yb(bb(r.y, 0, 1)).getUTCDay() : vb(bb(r.y, 0, 1)).getDay(), r.m = 0, r.d = "W" in r ? (r.w + 6) % 7 + r.W * 7 - (o + 5) % 7 : r.w + r.U * 7 - (o + 6) % 7);
			return "Z" in r ? (r.H += r.Z / 100 | 0, r.M += r.Z % 100, yb(r)) : vb(r);
		};
	}
	function w(e, t, n, r) {
		for (var i = 0, a = t.length, o = n.length, s, c; i < a;) {
			if (r >= o) return -1;
			if (s = t.charCodeAt(i++), s === 37) {
				if (s = t.charAt(i++), c = x[s in Sb ? t.charAt(i++) : s], !c || (r = c(e, n, r)) < 0) return -1;
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
var Sb = {
	"-": "",
	_: " ",
	0: "0"
}, Cb = /^\s*\d+/, wb = /^%/, Tb = /[\\^$*+?|[\]().{}]/g;
function Z(e, t, n) {
	var r = e < 0 ? "-" : "", i = (r ? -e : e) + "", a = i.length;
	return r + (a < n ? Array(n - a + 1).join(t) + i : i);
}
function Eb(e) {
	return e.replace(Tb, "\\$&");
}
function Db(e) {
	return RegExp("^(?:" + e.map(Eb).join("|") + ")", "i");
}
function Ob(e) {
	return new Map(e.map((e, t) => [e.toLowerCase(), t]));
}
function kb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 1));
	return r ? (e.w = +r[0], n + r[0].length) : -1;
}
function Ab(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 1));
	return r ? (e.u = +r[0], n + r[0].length) : -1;
}
function jb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.U = +r[0], n + r[0].length) : -1;
}
function Mb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.V = +r[0], n + r[0].length) : -1;
}
function Nb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.W = +r[0], n + r[0].length) : -1;
}
function Pb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 4));
	return r ? (e.y = +r[0], n + r[0].length) : -1;
}
function Fb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.y = +r[0] + (+r[0] > 68 ? 1900 : 2e3), n + r[0].length) : -1;
}
function Ib(e, t, n) {
	var r = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(n, n + 6));
	return r ? (e.Z = r[1] ? 0 : -(r[2] + (r[3] || "00")), n + r[0].length) : -1;
}
function Lb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 1));
	return r ? (e.q = r[0] * 3 - 3, n + r[0].length) : -1;
}
function Rb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.m = r[0] - 1, n + r[0].length) : -1;
}
function zb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.d = +r[0], n + r[0].length) : -1;
}
function Bb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 3));
	return r ? (e.m = 0, e.d = +r[0], n + r[0].length) : -1;
}
function Vb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.H = +r[0], n + r[0].length) : -1;
}
function Hb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.M = +r[0], n + r[0].length) : -1;
}
function Ub(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 2));
	return r ? (e.S = +r[0], n + r[0].length) : -1;
}
function Wb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 3));
	return r ? (e.L = +r[0], n + r[0].length) : -1;
}
function Gb(e, t, n) {
	var r = Cb.exec(t.slice(n, n + 6));
	return r ? (e.L = Math.floor(r[0] / 1e3), n + r[0].length) : -1;
}
function Kb(e, t, n) {
	var r = wb.exec(t.slice(n, n + 1));
	return r ? n + r[0].length : -1;
}
function qb(e, t, n) {
	var r = Cb.exec(t.slice(n));
	return r ? (e.Q = +r[0], n + r[0].length) : -1;
}
function Jb(e, t, n) {
	var r = Cb.exec(t.slice(n));
	return r ? (e.s = +r[0], n + r[0].length) : -1;
}
function Yb(e, t) {
	return Z(e.getDate(), t, 2);
}
function Xb(e, t) {
	return Z(e.getHours(), t, 2);
}
function Zb(e, t) {
	return Z(e.getHours() % 12 || 12, t, 2);
}
function Qb(e, t) {
	return Z(1 + Wy.count(db(e), e), t, 3);
}
function $b(e, t) {
	return Z(e.getMilliseconds(), t, 3);
}
function ex(e, t) {
	return $b(e, t) + "000";
}
function tx(e, t) {
	return Z(e.getMonth() + 1, t, 2);
}
function nx(e, t) {
	return Z(e.getMinutes(), t, 2);
}
function rx(e, t) {
	return Z(e.getSeconds(), t, 2);
}
function ix(e) {
	var t = e.getDay();
	return t === 0 ? 7 : t;
}
function ax(e, t) {
	return Z(Jy.count(db(e) - 1, e), t, 2);
}
function ox(e) {
	var t = e.getDay();
	return t >= 4 || t === 0 ? Qy(e) : Qy.ceil(e);
}
function sx(e, t) {
	return e = ox(e), Z(Qy.count(db(e), e) + (db(e).getDay() === 4), t, 2);
}
function cx(e) {
	return e.getDay();
}
function lx(e, t) {
	return Z(Yy.count(db(e) - 1, e), t, 2);
}
function ux(e, t) {
	return Z(e.getFullYear() % 100, t, 2);
}
function dx(e, t) {
	return e = ox(e), Z(e.getFullYear() % 100, t, 2);
}
function fx(e, t) {
	return Z(e.getFullYear() % 1e4, t, 4);
}
function px(e, t) {
	var n = e.getDay();
	return e = n >= 4 || n === 0 ? Qy(e) : Qy.ceil(e), Z(e.getFullYear() % 1e4, t, 4);
}
function mx(e) {
	var t = e.getTimezoneOffset();
	return (t > 0 ? "-" : (t *= -1, "+")) + Z(t / 60 | 0, "0", 2) + Z(t % 60, "0", 2);
}
function hx(e, t) {
	return Z(e.getUTCDate(), t, 2);
}
function gx(e, t) {
	return Z(e.getUTCHours(), t, 2);
}
function _x(e, t) {
	return Z(e.getUTCHours() % 12 || 12, t, 2);
}
function vx(e, t) {
	return Z(1 + Gy.count(fb(e), e), t, 3);
}
function yx(e, t) {
	return Z(e.getUTCMilliseconds(), t, 3);
}
function bx(e, t) {
	return yx(e, t) + "000";
}
function xx(e, t) {
	return Z(e.getUTCMonth() + 1, t, 2);
}
function Sx(e, t) {
	return Z(e.getUTCMinutes(), t, 2);
}
function Cx(e, t) {
	return Z(e.getUTCSeconds(), t, 2);
}
function wx(e) {
	var t = e.getUTCDay();
	return t === 0 ? 7 : t;
}
function Tx(e, t) {
	return Z(nb.count(fb(e) - 1, e), t, 2);
}
function Ex(e) {
	var t = e.getUTCDay();
	return t >= 4 || t === 0 ? ob(e) : ob.ceil(e);
}
function Dx(e, t) {
	return e = Ex(e), Z(ob.count(fb(e), e) + (fb(e).getUTCDay() === 4), t, 2);
}
function Ox(e) {
	return e.getUTCDay();
}
function kx(e, t) {
	return Z(rb.count(fb(e) - 1, e), t, 2);
}
function Ax(e, t) {
	return Z(e.getUTCFullYear() % 100, t, 2);
}
function jx(e, t) {
	return e = Ex(e), Z(e.getUTCFullYear() % 100, t, 2);
}
function Mx(e, t) {
	return Z(e.getUTCFullYear() % 1e4, t, 4);
}
function Nx(e, t) {
	var n = e.getUTCDay();
	return e = n >= 4 || n === 0 ? ob(e) : ob.ceil(e), Z(e.getUTCFullYear() % 1e4, t, 4);
}
function Px() {
	return "+0000";
}
function Fx() {
	return "%";
}
function Ix(e) {
	return +e;
}
function Lx(e) {
	return Math.floor(e / 1e3);
}
// ../../../peach/frontend/node_modules/d3-time-format/src/defaultLocale.js
var Rx, zx, Bx;
Vx({
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
function Vx(e) {
	return Rx = xb(e), zx = Rx.format, Rx.parse, Bx = Rx.utcFormat, Rx.utcParse, Rx;
}
// ../../../peach/frontend/node_modules/d3-scale/src/time.js
function Hx(e) {
	return new Date(e);
}
function Ux(e) {
	return e instanceof Date ? +e : +/* @__PURE__ */ new Date(+e);
}
function Wx(e, t, n, r, i, a, o, s, c, l) {
	var u = Ev(), d = u.invert, f = u.domain, p = l(".%L"), m = l(":%S"), h = l("%I:%M"), g = l("%I %p"), _ = l("%a %d"), v = l("%b %d"), y = l("%B"), b = l("%Y");
	function x(e) {
		return (c(e) < e ? p : s(e) < e ? m : o(e) < e ? h : a(e) < e ? g : r(e) < e ? i(e) < e ? _ : v : n(e) < e ? y : b)(e);
	}
	return u.invert = function(e) {
		return new Date(d(e));
	}, u.domain = function(e) {
		return arguments.length ? f(Array.from(e, Ux)) : f().map(Hx);
	}, u.ticks = function(t) {
		var n = f();
		return e(n[0], n[n.length - 1], t ?? 10);
	}, u.tickFormat = function(e, t) {
		return t == null ? x : l(t);
	}, u.nice = function(e) {
		var n = f();
		return e && typeof e.range == "function" || (e = t(n[0], n[n.length - 1], e ?? 10)), e ? f(ty(n, e)) : u;
	}, u.copy = function() {
		return wv(u, Wx(e, t, n, r, i, a, o, s, c, l));
	}, u;
}
function Gx() {
	return i_.apply(Wx(gb, _b, db, lb, Jy, Wy, Hy, By, zy, zx).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/utcTime.js
function Kx() {
	return i_.apply(Wx(mb, hb, fb, ub, nb, Gy, Uy, Vy, zy, Bx).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/sequential.js
function qx() {
	var e = 0, t = 1, n, r, i, a, o = yv, s = !1, c;
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
	return l.range = u(pv), l.rangeRound = u(mv), l.unknown = function(e) {
		return arguments.length ? (c = e, l) : c;
	}, function(o) {
		return a = o, n = o(e), r = o(t), i = n === r ? 0 : 1 / (r - n), l;
	};
}
function Jx(e, t) {
	return t.domain(e.domain()).interpolator(e.interpolator()).clamp(e.clamp()).unknown(e.unknown());
}
function Yx() {
	var e = Qv(qx()(yv));
	return e.copy = function() {
		return Jx(e, Yx());
	}, a_.apply(e, arguments);
}
function Xx() {
	var e = uy(qx()).domain([1, 10]);
	return e.copy = function() {
		return Jx(e, Xx()).base(e.base());
	}, a_.apply(e, arguments);
}
function Zx() {
	var e = my(qx());
	return e.copy = function() {
		return Jx(e, Zx()).constant(e.constant());
	}, a_.apply(e, arguments);
}
function Qx() {
	var e = yy(qx());
	return e.copy = function() {
		return Jx(e, Qx()).exponent(e.exponent());
	}, a_.apply(e, arguments);
}
function $x() {
	return Qx.apply(null, arguments).exponent(.5);
}
// ../../../peach/frontend/node_modules/d3-scale/src/sequentialQuantile.js
function eS() {
	var e = [], t = yv;
	function n(n) {
		if (n != null && !isNaN(n = +n)) return t((zg(e, n, 1) - 1) / (e.length - 1));
	}
	return n.domain = function(t) {
		if (!arguments.length) return e.slice();
		e = [];
		for (let n of t) n != null && !isNaN(n = +n) && e.push(n);
		return e.sort(Ng), n;
	}, n.interpolator = function(e) {
		return arguments.length ? (t = e, n) : t;
	}, n.range = function() {
		return e.map((n, r) => t(r / (e.length - 1)));
	}, n.quantiles = function(t) {
		return Array.from({ length: t + 1 }, (n, r) => t_(e, r / t));
	}, n.copy = function() {
		return eS(t).domain(e);
	}, a_.apply(n, arguments);
}
// ../../../peach/frontend/node_modules/d3-scale/src/diverging.js
function tS() {
	var e = 0, t = .5, n = 1, r = 1, i, a, o, s, c, l = yv, u, d = !1, f;
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
			return arguments.length ? ([n, r, i] = t, l = hv(e, [
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
	return p.range = m(pv), p.rangeRound = m(mv), p.unknown = function(e) {
		return arguments.length ? (f = e, p) : f;
	}, function(l) {
		return u = l, i = l(e), a = l(t), o = l(n), s = i === a ? 0 : .5 / (a - i), c = a === o ? 0 : .5 / (o - a), r = a < i ? -1 : 1, p;
	};
}
function nS() {
	var e = Qv(tS()(yv));
	return e.copy = function() {
		return Jx(e, nS());
	}, a_.apply(e, arguments);
}
function rS() {
	var e = uy(tS()).domain([
		.1,
		1,
		10
	]);
	return e.copy = function() {
		return Jx(e, rS()).base(e.base());
	}, a_.apply(e, arguments);
}
function iS() {
	var e = my(tS());
	return e.copy = function() {
		return Jx(e, iS()).constant(e.constant());
	}, a_.apply(e, arguments);
}
function aS() {
	var e = yy(tS());
	return e.copy = function() {
		return Jx(e, aS()).exponent(e.exponent());
	}, a_.apply(e, arguments);
}
function oS() {
	return aS.apply(null, arguments).exponent(.5);
}
// ../../../peach/frontend/node_modules/victory-vendor/es/d3-scale.js
var sS = /* @__PURE__ */ E({
	scaleBand: () => c_,
	scaleDiverging: () => nS,
	scaleDivergingLog: () => rS,
	scaleDivergingPow: () => aS,
	scaleDivergingSqrt: () => oS,
	scaleDivergingSymlog: () => iS,
	scaleIdentity: () => ey,
	scaleImplicit: () => o_,
	scaleLinear: () => $v,
	scaleLog: () => dy,
	scaleOrdinal: () => s_,
	scalePoint: () => u_,
	scalePow: () => by,
	scaleQuantile: () => Ty,
	scaleQuantize: () => Ey,
	scaleRadial: () => wy,
	scaleSequential: () => Yx,
	scaleSequentialLog: () => Xx,
	scaleSequentialPow: () => Qx,
	scaleSequentialQuantile: () => eS,
	scaleSequentialSqrt: () => $x,
	scaleSequentialSymlog: () => Zx,
	scaleSqrt: () => xy,
	scaleSymlog: () => hy,
	scaleThreshold: () => Dy,
	scaleTime: () => Gx,
	scaleUtc: () => Kx,
	tickFormat: () => Zv
});
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineConfiguredScale.js
function cS(e) {
	var t = sS;
	if (e in t && typeof t[e] == "function") return t[e]();
	var n = `scale${Ut(e)}`;
	if (n in t && typeof t[n] == "function") return t[n]();
}
function lS(e, t, n) {
	if (typeof e == "function") return e.copy().domain(t).range(n);
	if (e != null) {
		var r = cS(e);
		if (r != null) return r.domain(t).range(n), r;
	}
}
function uS(e, t, n, r) {
	if (n != null && r != null) return typeof e.scale == "function" ? lS(e.scale, n, r) : lS(t, n, r);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineRealScaleType.js
function dS(e) {
	return `scale${Ut(e)}`;
}
function fS(e) {
	return dS(e) in sS;
}
var pS = (e, t, n) => {
	if (e != null) {
		var r = e.scale, i = e.type;
		if (r === "auto") return i === "category" && n && (n.indexOf("LineChart") >= 0 || n.indexOf("AreaChart") >= 0 || n.indexOf("ComposedChart") >= 0 && !t) ? "point" : i === "category" ? "band" : "linear";
		if (typeof r == "string") return fS(r) ? r : "point";
	}
};
// ../../../peach/frontend/node_modules/recharts/es6/util/scale/createCategoricalInverse.js
function mS(e, t) {
	for (var n = 0, r = e.length, i = e[0] < e[e.length - 1]; n < r;) {
		var a = Math.floor((n + r) / 2);
		(i ? e[a] < t : e[a] > t) ? n = a + 1 : r = a;
	}
	return n;
}
function hS(e, t) {
	if (e) {
		var n = t ?? e.domain(), r = n.map((t) => e(t) ?? 0), i = e.range();
		if (!(n.length === 0 || i.length < 2)) return (e) => {
			var t = mS(r, e);
			if (t <= 0) return n[0];
			if (t >= n.length) return n[n.length - 1];
			var i = r[t - 1] ?? 0, a = r[t] ?? 0;
			return Math.abs(e - i) <= Math.abs(e - a) ? n[t - 1] : n[t];
		};
	}
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineInverseScaleFunction.js
function gS(e) {
	if (e != null) return "invert" in e && typeof e.invert == "function" ? e.invert.bind(e) : hS(e, void 0);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/axisSelectors.js
function _S(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function vS(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? _S(Object(n), !0).forEach(function(t) {
			yS(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _S(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function yS(e, t, n) {
	return (t = bS(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function bS(e) {
	var t = xS(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function xS(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function SS(e, t) {
	return DS(e) || ES(e, t) || wS(e, t) || CS();
}
function CS() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function wS(e, t) {
	if (e) {
		if (typeof e == "string") return TS(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? TS(e, t) : void 0;
	}
}
function TS(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function ES(e, t) {
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
function DS(e) {
	if (Array.isArray(e)) return e;
}
var OS = [0, "auto"], kS = {
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
}, AS = (e, t) => e.cartesianAxis.xAxis[t], jS = (e, t) => AS(e, t) ?? kS, MS = {
	allowDataOverflow: !1,
	allowDecimals: !0,
	allowDuplicatedCategory: !0,
	angle: 0,
	dataKey: void 0,
	domain: OS,
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
}, NS = (e, t) => e.cartesianAxis.yAxis[t], PS = (e, t) => NS(e, t) ?? MS, FS = {
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
}, IS = (e, t) => e.cartesianAxis.zAxis[t] ?? FS, Q = (e, t, n) => {
	switch (t) {
		case "xAxis": return jS(e, n);
		case "yAxis": return PS(e, n);
		case "zAxis": return IS(e, n);
		case "angleAxis": return dg(e, n);
		case "radiusAxis": return fg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, LS = (e, t, n) => {
	switch (t) {
		case "xAxis": return jS(e, n);
		case "yAxis": return PS(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, RS = (e, t, n) => {
	switch (t) {
		case "xAxis": return jS(e, n);
		case "yAxis": return PS(e, n);
		case "angleAxis": return dg(e, n);
		case "radiusAxis": return fg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, zS = (e) => e.graphicalItems.cartesianItems.some((e) => e.type === "bar") || e.graphicalItems.polarItems.some((e) => e.type === "radialBar");
function BS(e, t) {
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
var VS = (e) => e.graphicalItems.cartesianItems, HS = H([X, Sg], BS), US = (e, t, n) => e.filter(n).filter((e) => t?.includeHidden === !0 || !e.hide), WS = H([
	VS,
	Q,
	HS
], US, { memoizeOptions: { resultEqualityCheck: Dg } }), GS = H([WS], (e) => e.filter((e) => e.type === "area" || e.type === "bar").filter(Tg)), KS = (e) => e.filter((e) => !("stackId" in e) || e.stackId === void 0), qS = H([WS], KS), JS = (e) => e.map((e) => e.data).filter(Boolean).flat(1), YS = H([WS], (e) => e.some((e) => !e.data)), XS = H([WS], JS, { memoizeOptions: { resultEqualityCheck: Dg } }), ZS = (e, t) => {
	var n = t.chartData, r = n === void 0 ? [] : n, i = t.dataStartIndex, a = t.dataEndIndex;
	return e.length > 0 ? e : r.slice(i, a + 1);
}, QS = H([XS, ph], ZS), $S = (e, t, n) => t?.dataKey == null ? n.length > 0 ? n.map((e) => e.dataKey).flatMap((t) => e.map((e) => ({ value: K(e, t) }))) : e.map((e) => ({ value: e })) : e.map((e) => ({ value: K(e, t.dataKey) })), eC = (e, t, n, r, i, a) => {
	var o = r.chartData, s = o === void 0 ? [] : o, c = r.dataStartIndex, l = r.dataEndIndex, u = $S(e, t, n);
	return i && t?.dataKey != null && a.length > 0 ? [...s.slice(c, l + 1).map((e) => ({ value: K(e, t.dataKey) })).filter((e) => e.value != null), ...u] : u;
}, tC = H([
	QS,
	Q,
	WS,
	ph,
	YS,
	XS
], eC);
function nC(e) {
	if (Lt(e) || e instanceof Date) {
		var t = Number(e);
		if (G(t)) return t;
	}
}
function rC(e) {
	if (Array.isArray(e)) {
		var t = [nC(e[0]), nC(e[1])];
		return wh(t) ? t : void 0;
	}
	var n = nC(e);
	if (n != null) return [n, n];
}
function iC(e) {
	return e.map(nC).filter(Wt);
}
function aC(e, t) {
	var n = nC(e), r = nC(t);
	return n == null && r == null ? 0 : n == null ? -1 : r == null ? 1 : n - r;
}
var oC = H([tC], (e) => e?.map((e) => e.value).sort(aC));
function sC(e, t) {
	switch (e) {
		case "xAxis": return t.direction === "x";
		case "yAxis": return t.direction === "y";
		default: return !1;
	}
}
function cC(e, t, n) {
	if (!n || !n.length) return [];
	var r;
	if (typeof t == "number" && !Ft(t)) r = t;
	else if (Array.isArray(t)) {
		var i = iC(t);
		i.length > 0 && (r = Math.max(...i));
	}
	return r == null ? [] : iC(n.flatMap((t) => {
		var n = K(e, t.dataKey), i, a;
		if (Array.isArray(n)) {
			var o = SS(n, 2);
			i = o[0], a = o[1];
		} else i = a = n;
		if (G(i) && G(a)) return [r - i, r + a];
	}));
}
var lC = (e) => RS(e, kg(e), Ag(e)), uC = H([lC], (e) => e?.dataKey), dC = H([
	GS,
	ph,
	lC
], wg), fC = (e, t, n, r) => {
	var i = t.reduce((e, t) => {
		if (t.stackId == null) return e;
		var n = e[t.stackId];
		return n ??= [], n.push(t), e[t.stackId] = n, e;
	}, {});
	return Object.fromEntries(Object.entries(i).map((t) => {
		var i = SS(t, 2), a = i[0], o = i[1], s = r ? [...o].reverse() : o;
		return [a, {
			stackedData: bl(e, s.map(Cg), n),
			graphicalItems: s
		}];
	}));
}, pC = H([
	dC,
	GS,
	qh,
	Jh
], fC), mC = (e, t, n, r) => {
	var i = t.dataStartIndex, a = t.dataEndIndex;
	if (r == null && n !== "zAxis") return Dl(e, i, a);
}, hC = H([Q], (e) => e.allowDataOverflow), gC = (e) => {
	if (e == null || !("domain" in e)) return OS;
	if (e.domain != null) return e.domain;
	if ("ticks" in e && e.ticks != null) {
		if (e.type === "number") {
			var t = iC(e.ticks);
			return [Math.min(...t), Math.max(...t)];
		}
		if (e.type === "category") return e.ticks.map(String);
	}
	return e?.domain ?? OS;
}, _C = H([Q], gC), vC = H([_C, hC], Eh), yC = H([
	pC,
	dh,
	X,
	vC
], mC, { memoizeOptions: { resultEqualityCheck: Eg } }), bC = (e) => e.errorBars, xC = (e, t, n) => e.flatMap((e) => t[e.id]).filter(Boolean).filter((e) => sC(n, e)), SC = function() {
	var e = [...arguments].filter(Boolean);
	if (e.length !== 0) {
		var t = e.flat();
		return [Math.min(...t), Math.max(...t)];
	}
}, CC = function(e, t, n, r, i) {
	var a = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : [], o, s;
	if (n.length > 0 && n.forEach((e) => {
		var n = e.data == null ? a : [...e.data], c = r[e.id]?.filter((e) => sC(i, e));
		n.forEach((n) => {
			var r = K(n, t.dataKey ?? e.dataKey), i = cC(n, r, c);
			if (i.length >= 2) {
				var a = Math.min(...i), l = Math.max(...i);
				(o == null || a < o) && (o = a), (s == null || l > s) && (s = l);
			}
			var u = rC(r);
			u != null && (o = o == null ? u[0] : Math.min(o, u[0]), s = s == null ? u[1] : Math.max(s, u[1]));
		});
	}), t?.dataKey != null && n.length === 0 && e.forEach((e) => {
		var n = rC(K(e, t.dataKey));
		n != null && (o = o == null ? n[0] : Math.min(o, n[0]), s = s == null ? n[1] : Math.max(s, n[1]));
	}), G(o) && G(s)) return [o, s];
}, wC = H([
	QS,
	Q,
	qS,
	bC,
	X,
	hh
], CC, { memoizeOptions: { resultEqualityCheck: Eg } });
function TC(e) {
	var t = e.value;
	if (Lt(t) || t instanceof Date) return t;
}
var EC = (e, t, n) => {
	var r = e.map(TC).filter((e) => e != null);
	return n && (t.dataKey == null || t.allowDuplicatedCategory && Vt(r)) ? uh(0, e.length) : t.allowDuplicatedCategory ? r : Array.from(new Set(r));
}, DC = (e) => e.referenceElements.dots, OC = (e, t, n) => e.filter((e) => e.ifOverflow === "extendDomain").filter((e) => t === "xAxis" ? e.xAxisId === n : e.yAxisId === n), kC = H([
	DC,
	X,
	Sg
], OC), AC = (e) => e.referenceElements.areas, jC = H([
	AC,
	X,
	Sg
], OC), MC = (e) => e.referenceElements.lines, NC = H([
	MC,
	X,
	Sg
], OC), PC = (e, t) => {
	if (e != null) {
		var n = iC(e.map((e) => t === "xAxis" ? e.x : e.y));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, FC = H(kC, X, PC), IC = (e, t) => {
	if (e != null) {
		var n = iC(e.flatMap((e) => [t === "xAxis" ? e.x1 : e.y1, t === "xAxis" ? e.x2 : e.y2]));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, LC = H([jC, X], IC);
function RC(e) {
	if (e.x != null) return iC([e.x]);
	var t = e.segment?.map((e) => e.x);
	return t == null || t.length === 0 ? [] : iC(t);
}
function zC(e) {
	if (e.y != null) return iC([e.y]);
	var t = e.segment?.map((e) => e.y);
	return t == null || t.length === 0 ? [] : iC(t);
}
var BC = (e, t) => {
	if (e != null) {
		var n = e.flatMap((e) => t === "xAxis" ? RC(e) : zC(e));
		if (n.length !== 0) return [Math.min(...n), Math.max(...n)];
	}
}, VC = H(FC, H([NC, X], BC), LC, (e, t, n) => SC(e, n, t)), HC = (e, t, n, r, i, a, o, s, c) => {
	if (n != null) return n;
	var l = o === "vertical" && s === "xAxis" || o === "horizontal" && s === "yAxis" ? SC(r, a, i) : SC(a, i), u = Dh(t, l, e.allowDataOverflow);
	return u == null && e.allowDataOverflow && l == null && c != null ? c : u;
}, UC = H([
	Q,
	_C,
	vC,
	yC,
	wC,
	VC,
	q,
	X,
	H([Q], (e) => {
		if (e != null && e.type === "number" && "ticks" in e && e.ticks != null) {
			var t = iC(e.ticks);
			if (t.length !== 0) return [Math.min(...t), Math.max(...t)];
		}
	}, { memoizeOptions: { resultEqualityCheck: Eg } })
], HC, { memoizeOptions: { resultEqualityCheck: Eg } }), WC = [0, 1], GC = (e, t, n, r, i, a, o) => {
	if (e != null && n != null && n.length !== 0 || o !== void 0) {
		var s = e.dataKey, c = e.type, l = hl(t, a);
		return l && s == null ? uh(0, n?.length ?? 0) : c === "category" ? EC(r, e, l) : i === "expand" && !l ? WC : o;
	}
}, KC = H([
	Q,
	q,
	QS,
	tC,
	qh,
	X,
	UC
], GC), qC = H([
	Q,
	zS,
	Yh
], pS), JC = (e, t, n) => {
	var r = t.niceTicks;
	if (r !== "none") {
		var i = gC(t), a = Array.isArray(i) && (i[0] === "auto" || i[1] === "auto");
		if ((r === "snap125" || r === "adaptive") && t != null && t.tickCount && wh(e)) {
			if (a) return Vh(e, t.tickCount, t.allowDecimals, r);
			if (t.type === "number") return Hh(e, t.tickCount, t.allowDecimals, r);
		}
		if (r === "auto" && n === "linear" && t != null && t.tickCount) {
			if (a && wh(e)) return Vh(e, t.tickCount, t.allowDecimals, "adaptive");
			if (t.type === "number" && wh(e)) return Hh(e, t.tickCount, t.allowDecimals, "adaptive");
		}
	}
}, YC = H([
	KC,
	RS,
	qC
], JC), XC = (e, t, n, r) => {
	if (r !== "angleAxis" && e?.type === "number" && wh(t) && Array.isArray(n) && n.length > 0) {
		var i = t[0], a = n[0] ?? 0, o = t[1], s = n[n.length - 1] ?? 0;
		return [Math.min(i, a), Math.max(o, s)];
	}
	return t;
}, ZC = H([
	Q,
	KC,
	YC,
	X
], XC), QC = H(H(tC, Q, (e, t) => {
	if (t && t.type === "number") {
		var n = Infinity, r = Array.from(iC(e.map((e) => e.value))).sort((e, t) => e - t), i = r[0], a = r[r.length - 1];
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
}), q, Gh, Ql, (e, t, n, r, i) => i, (e, t, n, r, i) => {
	if (!G(e)) return 0;
	var a = t === "vertical" ? r.height : r.width;
	if (i === "gap") return e * a / 2;
	if (i === "no-gap") {
		var o = Bt(n, e * a), s = e * a / 2;
		return s - o - (s - o) / a * o;
	}
	return 0;
}), $C = (e, t, n) => {
	var r = jS(e, t);
	return r == null || typeof r.padding != "string" ? 0 : QC(e, "xAxis", t, n, r.padding);
}, ew = (e, t, n) => {
	var r = PS(e, t);
	return r == null || typeof r.padding != "string" ? 0 : QC(e, "yAxis", t, n, r.padding);
}, tw = H(jS, $C, (e, t) => {
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
}), nw = H(PS, ew, (e, t) => {
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
}), rw = H([
	Ql,
	tw,
	iu,
	ru,
	(e, t, n) => n
], (e, t, n, r, i) => {
	var a = r.padding;
	return i ? [a.left, n.width - a.right] : [e.left + t.left, e.left + e.width - t.right];
}), iw = H([
	Ql,
	q,
	nw,
	iu,
	ru,
	(e, t, n) => n
], (e, t, n, r, i, a) => {
	var o = i.padding;
	return a ? [r.height - o.bottom, o.top] : t === "horizontal" ? [e.top + e.height - n.bottom, e.top + n.top] : [e.top + n.top, e.top + e.height - n.bottom];
}), aw = (e, t, n, r) => {
	switch (t) {
		case "xAxis": return rw(e, n, r);
		case "yAxis": return iw(e, n, r);
		case "zAxis": return IS(e, n)?.range;
		case "angleAxis": return _g(e);
		case "radiusAxis": return yg(e, n);
		default: return;
	}
}, ow = H([Q, aw], ng), sw = H([
	Q,
	qC,
	H([qC, ZC], Mg),
	ow
], uS), cw = (e, t, n, r) => {
	if (n != null && n.dataKey != null) {
		var i = n.type, a = n.scale;
		if (hl(e, r) && (i === "number" || a !== "auto")) return t.map((e) => e.value);
	}
}, lw = H([
	q,
	tC,
	RS,
	X
], cw), uw = H([sw], jg);
H([sw], gS), H([sw, oC], hS), H([
	WS,
	bC,
	X
], xC);
function dw(e, t) {
	return e.id < t.id ? -1 : +(e.id > t.id);
}
var fw = (e, t) => t, pw = (e, t, n) => n, mw = H(zl, fw, pw, (e, t, n) => e.filter((e) => e.orientation === t).filter((e) => e.mirror === n).sort(dw)), hw = H(Bl, fw, pw, (e, t, n) => e.filter((e) => e.orientation === t).filter((e) => e.mirror === n).sort(dw)), gw = (e, t) => {
	var n = typeof t.height == "number" ? t.height : 30;
	return {
		width: e.width,
		height: n
	};
}, _w = (e, t) => ({
	width: typeof t.width == "number" ? t.width : 60,
	height: e.height
}), vw = H(Ql, jS, gw), yw = (e, t, n) => {
	switch (t) {
		case "top": return e.top;
		case "bottom": return n - e.bottom;
		default: return 0;
	}
}, bw = (e, t, n) => {
	switch (t) {
		case "left": return e.left;
		case "right": return n - e.right;
		default: return 0;
	}
}, xw = H(Il, Ql, mw, fw, pw, (e, t, n, r, i) => {
	var a = {}, o;
	return n.forEach((n) => {
		var s = gw(t, n);
		o ??= yw(t, r, e);
		var c = r === "top" && !i || r === "bottom" && i;
		a[n.id] = o - Number(c) * s.height, o += (c ? -1 : 1) * s.height;
	}), a;
}), Sw = H(Fl, Ql, hw, fw, pw, (e, t, n, r, i) => {
	var a = {}, o;
	return n.forEach((n) => {
		var s = _w(t, n);
		o ??= bw(t, r, e);
		var c = r === "left" && !i || r === "right" && i;
		a[n.id] = o - Number(c) * s.width, o += (c ? -1 : 1) * s.width;
	}), a;
}), Cw = H([
	Ql,
	jS,
	(e, t) => {
		var n = jS(e, t);
		if (n != null) return xw(e, n.orientation, n.mirror);
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
}), ww = H([
	Ql,
	PS,
	(e, t) => {
		var n = PS(e, t);
		if (n != null) return Sw(e, n.orientation, n.mirror);
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
}), Tw = H(Ql, PS, (e, t) => ({
	width: typeof t.width == "number" ? t.width : 60,
	height: e.height
})), Ew = (e, t, n) => {
	switch (t) {
		case "xAxis": return vw(e, n).width;
		case "yAxis": return Tw(e, n).height;
		default: return;
	}
}, Dw = (e, t, n, r) => {
	if (n != null) {
		var i = n.allowDuplicatedCategory, a = n.type, o = n.dataKey, s = hl(e, r), c = t.map((e) => e.value), l = c.filter((e) => e != null);
		if (o && s && a === "category" && i && Vt(l)) return c;
	}
}, Ow = H([
	q,
	tC,
	Q,
	X
], Dw), kw = H([
	q,
	LS,
	qC,
	uw,
	Ow,
	lw,
	aw,
	YC,
	X
], (e, t, n, r, i, a, o, s, c) => {
	if (t != null) {
		var l = hl(e, c);
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
}), Aw = (e, t, n, r, i, a, o, s, c) => {
	if (t != null && r != null) {
		var l = hl(e, c), u = t.type, d = t.ticks, f = t.tickCount, p = n === "scaleBand" && typeof r.bandwidth == "function" ? r.bandwidth() / 2 : 2, m = u === "category" && r.bandwidth ? r.bandwidth() / p : 0;
		m = c === "angleAxis" && a != null && a.length >= 2 ? Pt(a[0] - a[1]) * 2 * m : m;
		var h = d || i;
		return h ? h.map((e, t) => {
			var n = o ? o.indexOf(e) : e, i = r.map(n);
			return G(i) ? {
				index: t,
				coordinate: i + m,
				value: e,
				offset: m
			} : null;
		}).filter(Wt) : l && s ? s.map((e, t) => {
			var n = r.map(e);
			return G(n) ? {
				coordinate: n + m,
				value: e,
				index: t,
				offset: m
			} : null;
		}).filter(Wt) : r.ticks ? r.ticks(f).map((e, t) => {
			var n = r.map(e);
			return G(n) ? {
				coordinate: n + m,
				value: e,
				index: t,
				offset: m
			} : null;
		}).filter(Wt) : r.domain().map((e, t) => {
			var n = r.map(e);
			return G(n) ? {
				coordinate: n + m,
				value: o ? o[e] : e,
				index: t,
				offset: m
			} : null;
		}).filter(Wt);
	}
}, jw = H([
	q,
	RS,
	qC,
	uw,
	YC,
	aw,
	Ow,
	lw,
	X
], Aw), Mw = (e, t, n, r, i, a, o) => {
	if (t != null && n != null && r != null && r[0] !== r[1]) {
		var s = hl(e, o), c = t.tickCount, l = 0;
		return l = o === "angleAxis" && r?.length >= 2 ? Pt(r[0] - r[1]) * 2 * l : l, s && a ? a.map((e, t) => {
			var r = n.map(e);
			return G(r) ? {
				coordinate: r + l,
				value: e,
				index: t,
				offset: l
			} : null;
		}).filter(Wt) : n.ticks ? n.ticks(c).map((e, t) => {
			var r = n.map(e);
			return G(r) ? {
				coordinate: r + l,
				value: e,
				index: t,
				offset: l
			} : null;
		}).filter(Wt) : n.domain().map((e, t) => {
			var r = n.map(e);
			return G(r) ? {
				coordinate: r + l,
				value: i ? i[e] : e,
				index: t,
				offset: l
			} : null;
		}).filter(Wt);
	}
}, Nw = H([
	q,
	RS,
	uw,
	aw,
	Ow,
	lw,
	X
], Mw), Pw = H(Q, uw, (e, t) => {
	if (e != null && t != null) return vS(vS({}, e), {}, { scale: t });
});
H((e, t, n) => IS(e, n), H([H([
	Q,
	qC,
	KC,
	ow
], uS)], jg), (e, t) => {
	if (e != null && t != null) return vS(vS({}, e), {}, { scale: t });
});
var Fw = H([
	q,
	zl,
	Bl
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
var Iw = (e) => e.options.defaultTooltipEventType, Lw = (e) => e.options.validateTooltipEventTypes;
function Rw(e, t, n) {
	if (e == null) return t;
	var r = e ? "axis" : "item";
	return n == null ? t : n.includes(r) ? r : t;
}
function zw(e, t) {
	return Rw(t, Iw(e), Lw(e));
}
function Bw(e) {
	return V((t) => zw(t, e));
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineActiveLabel.js
var Vw = (e, t) => {
	var n, r = Number(t);
	if (!(Ft(r) || t == null)) return r >= 0 ? e == null || (n = e[r]) == null ? void 0 : n.value : void 0;
}, Hw = (e) => e.tooltip.settings, Uw = {
	active: !1,
	index: null,
	dataKey: void 0,
	graphicalItemId: void 0,
	coordinate: void 0
}, Ww = fc({
	name: "tooltip",
	initialState: {
		itemInteraction: {
			click: Uw,
			hover: Uw
		},
		axisInteraction: {
			click: Uw,
			hover: Uw
		},
		keyboardInteraction: Uw,
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
				var n = t.payload, r = n.prev, i = n.next, a = Rs(e).tooltipItemPayloads.indexOf(U(r));
				a > -1 && (e.tooltipItemPayloads[a] = U(i));
			},
			prepare: W()
		},
		removeTooltipEntrySettings: {
			reducer(e, t) {
				var n = Rs(e).tooltipItemPayloads.indexOf(U(t.payload));
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
}), Gw = Ww.actions, Kw = Gw.addTooltipEntrySettings, qw = Gw.replaceTooltipEntrySettings, Jw = Gw.removeTooltipEntrySettings, Yw = Gw.setTooltipSettingsState, Xw = Gw.setActiveMouseOverItemIndex, Zw = Gw.mouseLeaveItem, Qw = Gw.mouseLeaveChart, $w = Gw.setActiveClickItemIndex, eT = Gw.setMouseOverAxisIndex, tT = Gw.setMouseClickAxisIndex, nT = Gw.setSyncInteraction, rT = Gw.setKeyboardInteraction, iT = Ww.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineTooltipInteractionState.js
function aT(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function oT(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? aT(Object(n), !0).forEach(function(t) {
			sT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : aT(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function sT(e, t, n) {
	return (t = cT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function cT(e) {
	var t = lT(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function lT(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function uT(e, t, n) {
	return t === "axis" ? n === "click" ? e.axisInteraction.click : e.axisInteraction.hover : n === "click" ? e.itemInteraction.click : e.itemInteraction.hover;
}
function dT(e) {
	return e.index != null;
}
var fT = (e, t, n, r) => {
	if (t == null) return Uw;
	var i = uT(e, t, n);
	if (i == null) return Uw;
	if (i.active) return i;
	if (e.keyboardInteraction.active) return e.keyboardInteraction;
	if (e.syncInteraction.active && e.syncInteraction.index != null) return e.syncInteraction;
	var a = e.settings.active === !0;
	if (dT(i)) {
		if (a) return oT(oT({}, i), {}, { active: !0 });
	} else if (r != null) return {
		active: !0,
		coordinate: void 0,
		dataKey: void 0,
		index: r,
		graphicalItemId: void 0
	};
	return oT(oT({}, Uw), {}, { coordinate: i.coordinate });
};
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineActiveTooltipIndex.js
function pT(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : void 0;
	if (e instanceof Date) {
		var t = e.valueOf();
		return Number.isFinite(t) ? t : void 0;
	}
	var n = Number(e);
	return Number.isFinite(n) ? n : void 0;
}
function mT(e, t) {
	var n = pT(e), r = t[0], i = t[1];
	return n !== void 0 && n >= Math.min(r, i) && n <= Math.max(r, i);
}
function hT(e, t, n) {
	if (n == null || t == null) return !0;
	var r = K(e, t);
	return r == null || !wh(n) || mT(r, n);
}
var gT = (e, t, n, r) => {
	var i = e?.index;
	if (i == null) return null;
	var a = Number(i);
	if (!G(a)) return i;
	var o = 0, s = Infinity;
	t.length > 0 && (s = t.length - 1);
	var c = Math.max(o, Math.min(a, s)), l = t[c];
	return l == null || hT(l, n, r) ? String(c) : null;
}, _T = (e, t, n, r, i, a, o) => {
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
}, vT = (e, t, n, r) => {
	if (t === "axis") return e.tooltipItemPayloads;
	if (e.tooltipItemPayloads.length === 0) return [];
	var i = n === "hover" ? e.itemInteraction.hover.graphicalItemId : e.itemInteraction.click.graphicalItemId;
	if (e.syncInteraction.active && i == null) return e.tooltipItemPayloads;
	if (i == null && (r != null || e.keyboardInteraction.active)) {
		var a = e.tooltipItemPayloads[0];
		return a == null ? [] : [a];
	}
	return e.tooltipItemPayloads.filter((e) => e.settings?.graphicalItemId === i);
}, yT = (e) => e.options.tooltipPayloadSearcher, bT = (e) => e.tooltip;
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineTooltipPayload.js
function xT(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ST(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? xT(Object(n), !0).forEach(function(t) {
			CT(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xT(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function CT(e, t, n) {
	return (t = wT(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function wT(e) {
	var t = TT(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function TT(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function ET(e) {
	if (typeof e == "string" || typeof e == "number") return e;
}
function DT(e) {
	if (typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
}
function OT(e) {
	if (typeof e == "string" || typeof e == "number") return e;
	if (typeof e == "function") return (t) => e(t);
}
function kT(e) {
	if (typeof e == "string") return e;
}
function AT(e) {
	if (typeof e == "object" && e) return {
		name: "name" in e ? ET(e.name) : void 0,
		unit: "unit" in e ? DT(e.unit) : void 0,
		dataKey: "dataKey" in e ? OT(e.dataKey) : void 0,
		payload: "payload" in e ? e.payload : void 0,
		color: "color" in e ? kT(e.color) : void 0,
		fill: "fill" in e ? kT(e.fill) : void 0
	};
}
function jT(e, t) {
	return e ?? t;
}
var MT = (e, t, n, r, i, a, o) => {
	if (t != null && a != null) {
		var s = n.chartData, c = n.computedData, l = n.dataStartIndex, u = n.dataEndIndex;
		return e.reduce((e, n) => {
			var d = n.dataDefinedOnItem, f = n.settings, p = jT(d, s), m = Array.isArray(p) ? sl(p, l, u) : p, h = f?.dataKey ?? r, g = f?.nameKey, _;
			return r && Array.isArray(m) && !Array.isArray(m[0]) && o === "axis" ? (_ = Ht(m, r, i), _ ??= a(m, t, c, g)) : _ = a(m, t, c, g), Array.isArray(_) ? _.forEach((t) => {
				var n = AT(t), r = n?.name, i = n?.dataKey, a = n?.payload, o = ST(ST({}, f), {}, {
					name: r,
					unit: n?.unit,
					color: n?.color ?? f?.color,
					fill: n?.fill ?? f?.fill
				});
				e.push(jl({
					tooltipEntrySettings: o,
					dataKey: i,
					payload: a,
					value: K(a, i),
					name: r == null ? void 0 : String(r)
				}));
			}) : e.push(jl({
				tooltipEntrySettings: f,
				dataKey: h,
				payload: _,
				value: K(_, h),
				name: K(_, g) ?? f?.name
			})), e;
		}, []);
	}
}, NT = H([
	lC,
	zS,
	Yh
], pS), PT = H([
	H([(e) => e.graphicalItems.cartesianItems, (e) => e.graphicalItems.polarItems], (e, t) => [...e, ...t]),
	lC,
	H([kg, Ag], BS)
], US, { memoizeOptions: { resultEqualityCheck: Dg } }), FT = H([PT], (e) => e.filter(Tg)), IT = H([PT], JS, { memoizeOptions: { resultEqualityCheck: Dg } }), LT = H([PT], (e) => e.some((e) => !e.data)), RT = H([IT, dh], ZS), zT = H([
	FT,
	dh,
	lC
], wg), BT = H([
	RT,
	lC,
	PT,
	dh,
	LT,
	IT
], eC), VT = H([lC], gC), HT = H([VT, H([lC], (e) => e.allowDataOverflow)], Eh), UT = H([
	H([
		zT,
		H([PT], (e) => e.filter(Tg)),
		qh,
		Jh
	], fC),
	dh,
	kg,
	HT
], mC), WT = H([
	RT,
	lC,
	H([PT], KS),
	bC,
	kg,
	_h
], CC, { memoizeOptions: { resultEqualityCheck: Eg } }), GT = H([H([
	DC,
	kg,
	Ag
], OC), kg], PC), KT = H([H([
	AC,
	kg,
	Ag
], OC), kg], IC), qT = H([
	lC,
	q,
	RT,
	BT,
	qh,
	kg,
	H([
		lC,
		VT,
		HT,
		UT,
		WT,
		H([
			GT,
			H([H([
				MC,
				kg,
				Ag
			], OC), kg], BC),
			KT
		], SC),
		q,
		kg
	], HC)
], GC), JT = H([
	lC,
	qT,
	H([
		qT,
		lC,
		NT
	], JC),
	kg
], XC), YT = (e) => aw(e, kg(e), Ag(e), !1), XT = H([lC, YT], ng), ZT = H([H([
	lC,
	NT,
	JT,
	XT
], uS)], jg), QT = H([
	q,
	lC,
	NT,
	ZT,
	YT,
	H([
		q,
		BT,
		lC,
		kg
	], Dw),
	H([
		q,
		BT,
		lC,
		kg
	], cw),
	kg
], (e, t, n, r, i, a, o, s) => {
	if (t) {
		var c = t.type, l = hl(e, s);
		if (r) {
			var u = n === "scaleBand" && r.bandwidth ? r.bandwidth() / 2 : 2, d = c === "category" && r.bandwidth ? r.bandwidth() / u : 0;
			return d = s === "angleAxis" && i != null && i?.length >= 2 ? Pt(i[0] - i[1]) * 2 * d : d, l && o ? o.map((e, t) => {
				var n = r.map(e);
				return G(n) ? {
					coordinate: n + d,
					value: e,
					index: t,
					offset: d
				} : null;
			}).filter(Wt) : r.domain().map((e, t) => {
				var n = r.map(e);
				return G(n) ? {
					coordinate: n + d,
					value: a ? a[e] : e,
					index: t,
					offset: d
				} : null;
			}).filter(Wt);
		}
	}
}), $T = H([
	Iw,
	Lw,
	Hw
], (e, t, n) => Rw(n.shared, e, t)), eE = (e) => e.tooltip.settings.trigger, tE = (e) => e.tooltip.settings.defaultIndex, nE = H([
	bT,
	$T,
	eE,
	tE
], fT), rE = H([
	nE,
	RT,
	uC,
	qT
], gT), iE = H([QT, rE], Vw), aE = H([nE], (e) => {
	if (e) return e.dataKey;
}), oE = H([nE], (e) => {
	if (e) return e.graphicalItemId;
}), sE = H([
	bT,
	$T,
	eE,
	tE
], vT), cE = H([nE, H([
	Fl,
	Il,
	q,
	Ql,
	QT,
	tE,
	sE
], _T)], (e, t) => e != null && e.coordinate ? e.coordinate : t), lE = H([nE], (e) => e?.active ?? !1), uE = H([H([
	sE,
	rE,
	dh,
	uC,
	iE,
	yT,
	$T
], MT)], (e) => {
	if (e != null) {
		var t = e.map((e) => e.payload).filter((e) => e != null);
		return Array.from(new Set(t));
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/context/useTooltipAxis.js
function dE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function fE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? dE(Object(n), !0).forEach(function(t) {
			pE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : dE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function pE(e, t, n) {
	return (t = mE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function mE(e) {
	var t = hE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function hE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var gE = () => V(lC), _E = () => {
	var e = gE(), t = V(QT), n = V(ZT);
	return Al(!e || !n ? void 0 : fE(fE({}, e), {}, { scale: n }), t);
};
// ../../../peach/frontend/node_modules/recharts/es6/util/getActiveCoordinate.js
function vE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function yE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? vE(Object(n), !0).forEach(function(t) {
			bE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : vE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function bE(e, t, n) {
	return (t = xE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function xE(e) {
	var t = SE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function SE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var CE = (e, t, n, r) => {
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
}, wE = (e, t, n, r) => {
	var i = t.find((e) => e && e.index === n);
	if (i) {
		if (e === "centric") {
			var a = i.coordinate, o = r.radius;
			return yE(yE(yE({}, r), Rm(r.cx, r.cy, o, a)), {}, {
				angle: a,
				radius: o
			});
		}
		var s = i.coordinate, c = r.angle;
		return yE(yE(yE({}, r), Rm(r.cx, r.cy, s, c)), {}, {
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
function TE(e, t) {
	var n = e.relativeX, r = e.relativeY;
	return n >= t.left && n <= t.left + t.width && r >= t.top && r <= t.top + t.height;
}
var EE = (e, t, n, r, i) => {
	var a = t?.length ?? 0;
	if (a <= 1 || e == null) return 0;
	if (r === "angleAxis" && i != null && Math.abs(Math.abs(i[1] - i[0]) - 360) <= 1e-6) for (var o = i[1] - i[0], s = (t, n, r) => [
		e,
		e + o,
		e - o
	].some((e) => (r ? e >= t : e > t) && e <= n), c = 0; c < a; c++) {
		var l = c > 0 ? n[c - 1]?.coordinate : n[a - 1]?.coordinate, u = n[c]?.coordinate, d = c >= a - 1 ? n[0]?.coordinate : n[c + 1]?.coordinate, f = void 0;
		if (l != null && u != null && d != null) {
			if (Pt(u - l) !== Pt(d - u)) {
				var p = [];
				if (Pt(d - u) === Pt(i[1] - i[0])) {
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
}, DE = () => V(Yh), OE = (e, t) => t, kE = (e, t, n) => n, AE = (e, t, n, r) => r, jE = H(QT, (e) => Ka(e, (e) => e.coordinate)), ME = H([
	bT,
	OE,
	kE,
	AE
], fT), NE = H([
	ME,
	RT,
	uC,
	qT
], gT), PE = (e, t, n) => {
	if (t != null) {
		var r = bT(e);
		return t === "axis" ? n === "hover" ? r.axisInteraction.hover.dataKey : r.axisInteraction.click.dataKey : n === "hover" ? r.itemInteraction.hover.dataKey : r.itemInteraction.click.dataKey;
	}
}, FE = H([
	bT,
	OE,
	kE,
	AE
], vT), IE = H([
	Fl,
	Il,
	q,
	Ql,
	QT,
	AE,
	FE
], _T), LE = H([ME, IE], (e, t) => e.coordinate ?? t), RE = H([QT, NE], Vw), zE = H([
	FE,
	NE,
	dh,
	uC,
	RE,
	yT,
	OE
], MT), BE = H([ME, NE], (e, t) => ({
	isActive: e.active && t != null,
	activeIndex: t
})), VE = (e, t, n, r, i, a, o) => {
	if (e && n && r && i && TE(e, o)) {
		var s = EE(Nl(e, t), a, i, n, r), c = CE(t, i, s, e);
		return {
			activeIndex: String(s),
			activeCoordinate: c
		};
	}
}, HE = (e, t, n, r, i, a, o) => {
	if (e && r && i && a && n) {
		var s = Wm(e, n);
		if (s) {
			var c = EE(Pl(s, t), o, a, r, i), l = wE(t, a, c, s);
			return {
				activeIndex: String(c),
				activeCoordinate: l
			};
		}
	}
}, UE = (e, t, n, r, i, a, o, s) => {
	if (e && t && r && i && a) return t === "horizontal" || t === "vertical" ? VE(e, t, r, i, a, o, s) : HE(e, t, n, r, i, a, o);
}, WE = H((e) => e.zIndex.zIndexMap, (e, t) => t, (e, t, n) => n, (e, t, n) => {
	if (t != null) {
		var r = e[t];
		if (r != null) return n ? r.panoramaElement : r.element;
	}
}), GE = H((e) => e.zIndex.zIndexMap, (e) => {
	var t = Object.keys(e).map((e) => parseInt(e, 10)).concat(Object.values(Y));
	return Array.from(new Set(t)).sort((e, t) => e - t);
}, { memoizeOptions: { resultEqualityCheck: Og } });
// ../../../peach/frontend/node_modules/recharts/es6/state/zIndexSlice.js
function KE(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function qE(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? KE(Object(n), !0).forEach(function(t) {
			JE(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : KE(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function JE(e, t, n) {
	return (t = YE(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function YE(e) {
	var t = XE(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function XE(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var ZE = { zIndexMap: Object.values(Y).reduce((e, t) => qE(qE({}, e), {}, { [t]: {
	element: void 0,
	panoramaElement: void 0,
	consumers: 0
} }), {}) }, QE = new Set(Object.values(Y));
function $E(e) {
	return QE.has(e);
}
var eD = fc({
	name: "zIndex",
	initialState: ZE,
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
				e.zIndexMap[n] && (--e.zIndexMap[n].consumers, e.zIndexMap[n].consumers <= 0 && !$E(n) && delete e.zIndexMap[n]);
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
}), tD = eD.actions, nD = tD.registerZIndexPortal, rD = tD.unregisterZIndexPortal, iD = tD.registerZIndexPortalElement, aD = tD.unregisterZIndexPortalElement, oD = eD.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/zIndex/ZIndexLayer.js
function sD(e) {
	var t = e.zIndex, n = e.children, r = Ju() && t !== void 0 && t !== 0, i = nu(), a = (0, P.useRef)(void 0), o = (0, P.useRef)(/* @__PURE__ */ new Set()), s = B(), c = V((e) => WE(e, t, i));
	if ((0, P.useLayoutEffect)(() => {
		if (!r) {
			var e = o.current;
			e.forEach((e) => {
				s(rD({ zIndex: e }));
			}), e.clear(), a.current = void 0;
		} else if (o.current.has(t) || (s(nD({ zIndex: t })), o.current.add(t)), c) {
			a.current = c;
			var n = o.current;
			n.forEach((e) => {
				e !== t && (s(rD({ zIndex: e })), n.delete(e));
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
				s(rD({ zIndex: e }));
			}), e.clear();
		};
	}, [s]), !r) return n;
	var l = c ?? a.current;
	return l ? /*#__PURE__*/ (0, Td.createPortal)(n, l) : null;
}
// ../../../peach/frontend/node_modules/recharts/es6/component/Cursor.js
function cD() {
	return cD = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, cD.apply(null, arguments);
}
function lD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function uD(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? lD(Object(n), !0).forEach(function(t) {
			dD(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : lD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function dD(e, t, n) {
	return (t = fD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function fD(e) {
	var t = pD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function pD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function mD(e) {
	var t = e.cursor, n = e.cursorComp, r = e.cursorProps;
	return /*#__PURE__*/ (0, P.isValidElement)(t) ? /*#__PURE__*/ (0, P.cloneElement)(t, r) : /*#__PURE__*/ (0, P.createElement)(n, r);
}
function hD(e) {
	var t = e.coordinate, n = e.payload, r = e.index, i = e.offset, a = e.tooltipAxisBandSize, o = e.layout, s = e.cursor, c = e.tooltipEventType, l = e.chartName, u = t, d = n, f = r;
	if (!s || !u || l !== "ScatterChart" && c !== "axis") return null;
	var p, m, h;
	if (l === "ScatterChart") p = u, m = gp, h = Y.cursorLine;
	else if (l === "BarChart") p = _p(o, u, i, a), m = km, h = Y.cursorRectangle;
	else if (o === "radial" && Vr(u)) {
		var g = Gm(u), _ = g.cx, v = g.cy, y = g.radius;
		p = {
			cx: _,
			cy: v,
			startAngle: g.startAngle,
			endAngle: g.endAngle,
			innerRadius: y,
			outerRadius: y
		}, m = oh, h = Y.cursorLine;
	} else p = { points: sh(o, u, i) }, m = ap, h = Y.cursorLine;
	var b = typeof s == "object" && "className" in s ? s.className : void 0, x = uD(uD(uD(uD({
		stroke: "#ccc",
		pointerEvents: "none"
	}, i), p), lt(s)), {}, {
		payload: d,
		payloadIndex: f,
		className: N("recharts-tooltip-cursor", b)
	});
	return /*#__PURE__*/ P.createElement(sD, { zIndex: e.zIndex ?? h }, /*#__PURE__*/ P.createElement(mD, {
		cursor: s,
		cursorComp: m,
		cursorProps: x
	}));
}
function gD(e) {
	var t = _E(), n = Bu(), r = Wu(), i = DE();
	return t == null || n == null || r == null || i == null ? null : /*#__PURE__*/ P.createElement(hD, cD({}, e, {
		offset: n,
		layout: r,
		tooltipAxisBandSize: t,
		chartName: i
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/context/tooltipPortalContext.js
var _D = /*#__PURE__*/ (0, P.createContext)(null), vD = () => (0, P.useContext)(_D), yD = (/* @__PURE__ */ D((/* @__PURE__ */ T(((e, t) => {
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
})))(), 1)).default, bD = new yD(), xD = "recharts.syncEvent.tooltip", SD = "recharts.syncEvent.brush", CD = (e, t) => {
	if (t && Array.isArray(e)) {
		var n = Number.parseInt(t, 10);
		if (!Ft(n)) return e[n];
	}
}, wD = fc({
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
}), TD = wD.reducer, ED = wD.actions.createEventEmitter;
// ../../../peach/frontend/node_modules/recharts/es6/synchronisation/syncSelectors.js
function DD(e) {
	return e.tooltip.syncInteraction;
}
var OD = fc({
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
}), kD = OD.actions, AD = kD.setChartData, jD = kD.setDataStartEndIndexes;
kD.setComputedData;
var MD = OD.reducer, ND = ["x", "y"];
function PD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function FD(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? PD(Object(n), !0).forEach(function(t) {
			ID(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : PD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function ID(e, t, n) {
	return (t = LD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function LD(e) {
	var t = RD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function RD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function zD(e, t) {
	if (e == null) return {};
	var n, r, i = BD(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function BD(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function VD() {
	var e = V(Xh), t = V(Qh), n = B(), r = V(Zh), i = V(QT), a = Wu(), o = Ru(), s = V((e) => e.rootProps.className);
	(0, P.useEffect)(() => {
		if (e == null) return Gt;
		var s = (s, c, l) => {
			if (t !== l && e === s) {
				if (c.payload.active === !1) n(nT({
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
						var d = c.payload.coordinate, f = d.x, p = d.y, m = zD(d, ND), h = c.payload.sourceViewBox, g = h.x, _ = h.y, v = h.width, y = h.height, b = FD(FD({}, m), {}, {
							x: o.x + (v ? (f - g) / v : 0) * o.width,
							y: o.y + (y ? (p - _) / y : 0) * o.height
						});
						n(FD(FD({}, c), {}, { payload: FD(FD({}, c.payload), {}, { coordinate: b }) }));
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
					if (S == null || o == null) n(nT({
						active: !1,
						coordinate: void 0,
						dataKey: void 0,
						index: null,
						label: void 0,
						sourceViewBox: void 0,
						graphicalItemId: void 0
					}));
					else if (x == null) n(nT({
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
						n(nT({
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
		return bD.on(xD, s), () => {
			bD.off(xD, s);
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
function HD() {
	var e = V(Xh), t = V(Qh), n = B();
	(0, P.useEffect)(() => {
		if (e == null) return Gt;
		var r = (r, i, a) => {
			t !== a && e === r && n(jD(i));
		};
		return bD.on(SD, r), () => {
			bD.off(SD, r);
		};
	}, [
		n,
		t,
		e
	]);
}
function UD() {
	var e = B();
	(0, P.useEffect)(() => {
		e(ED());
	}, [e]), VD(), HD();
}
function WD(e, t, n, r, i, a) {
	var o = V((n) => PE(n, e, t)), s = V(oE), c = V(Qh), l = V(Xh), u = V(Zh), d = V(DD)?.sourceViewBox != null, f = Ru();
	(0, P.useEffect)(() => {
		if (!d && l != null && c != null) {
			var e = nT({
				active: a,
				coordinate: n,
				dataKey: o,
				index: i,
				label: typeof r == "number" ? String(r) : r,
				sourceViewBox: f,
				graphicalItemId: s
			});
			bD.emit(xD, l, e, c);
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
function GD(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function KD(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? GD(Object(n), !0).forEach(function(t) {
			qD(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : GD(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function qD(e, t, n) {
	return (t = JD(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function JD(e) {
	var t = YD(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function YD(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function XD(e, t) {
	return tO(e) || eO(e, t) || QD(e, t) || ZD();
}
function ZD() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function QD(e, t) {
	if (e) {
		if (typeof e == "string") return $D(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? $D(e, t) : void 0;
	}
}
function $D(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function eO(e, t) {
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
function tO(e) {
	if (Array.isArray(e)) return e;
}
function nO(e) {
	return e.dataKey;
}
function rO(e, t) {
	return /*#__PURE__*/ P.isValidElement(e) ? /*#__PURE__*/ P.cloneElement(e, t) : typeof e == "function" ? /*#__PURE__*/ P.createElement(e, t) : /*#__PURE__*/ P.createElement(hf, t);
}
var iO = [], aO = {
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
function oO(e) {
	var t = Xr(e, aO), n = t.active, r = t.allowEscapeViewBox, i = t.animationDuration, a = t.animationEasing, o = t.content, s = t.filterNull, c = t.isAnimationActive, l = t.offset, u = t.payloadUniqBy, d = t.position, f = t.reverseDirection, p = t.useTranslate3d, m = t.wrapperStyle, h = t.cursor, g = t.shared, _ = t.trigger, v = t.defaultIndex, y = t.portal, b = t.axisId, x = B(), S = typeof v == "number" ? String(v) : v;
	(0, P.useEffect)(() => {
		x(Yw({
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
	var C = Ru(), w = Wf(), T = Bw(g), E = V((e) => BE(e, T, _, S)) ?? {}, D = E.activeIndex, O = E.isActive, k = V((e) => zE(e, T, _, S)), A = V((e) => RE(e, T, _, S)), j = V((e) => LE(e, T, _, S)), M = k, N = vD(), ee = n ?? O ?? !1, te = XD(oo([M, ee]), 2), ne = te[0], re = te[1], ie = T === "axis" ? A : void 0;
	WD(T, _, j, ie, D, ee);
	var ae = y ?? N;
	if (ae == null || C == null || T == null) return null;
	var oe = M ?? iO;
	ee || (oe = iO), s && oe.length && (oe = va(oe.filter((e) => e.value != null && (e.hide !== !0 || t.includeHidden)), u, nO));
	var se = oe.length > 0, ce = KD(KD({}, t), {}, {
		payload: oe,
		label: ie,
		active: ee,
		activeIndex: D,
		coordinate: j,
		accessibilityLayer: w
	}), le = /*#__PURE__*/ P.createElement(Uf, {
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
	}, rO(o, ce));
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ (0, Td.createPortal)(le, ae), ee && /*#__PURE__*/ P.createElement(gD, {
		cursor: h,
		tooltipEventType: T,
		coordinate: j,
		payload: oe,
		index: D
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/component/Cell.js
var sO = (e) => null;
sO.displayName = "Cell";
// ../../../peach/frontend/node_modules/recharts/es6/util/LRUCache.js
function cO(e, t, n) {
	return (t = lO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function lO(e) {
	var t = uO(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function uO(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var dO = class {
	constructor(e) {
		cO(this, "cache", /* @__PURE__ */ new Map()), this.maxSize = e;
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
function fO(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function pO(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? fO(Object(n), !0).forEach(function(t) {
			mO(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : fO(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function mO(e, t, n) {
	return (t = hO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function hO(e) {
	var t = gO(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function gO(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var _O = pO({}, {
	cacheSize: 2e3,
	enableCache: !0
}), vO = new dO(_O.cacheSize), yO = {
	position: "absolute",
	top: "-20000px",
	left: 0,
	padding: 0,
	margin: 0,
	border: "none",
	whiteSpace: "pre"
}, bO = "recharts_measurement_span";
function xO(e, t) {
	return `${e}|${t.fontSize || ""}|${t.fontFamily || ""}|${t.fontWeight || ""}|${t.fontStyle || ""}|${t.letterSpacing || ""}|${t.textTransform || ""}`;
}
var SO = (e, t) => {
	try {
		var n = document.getElementById(bO);
		n || (n = document.createElement("span"), n.setAttribute("id", bO), n.setAttribute("aria-hidden", "true"), document.body.appendChild(n)), Object.assign(n.style, yO, t), n.textContent = `${e}`;
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
}, CO = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
	if (e == null || Sf.isSsr) return {
		width: 0,
		height: 0
	};
	if (!_O.enableCache) return SO(e, t);
	var n = xO(e, t), r = vO.get(n);
	if (r) return r;
	var i = SO(e, t);
	return vO.set(n, i), i;
}, wO;
function TO(e, t) {
	return AO(e) || kO(e, t) || DO(e, t) || EO();
}
function EO() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function DO(e, t) {
	if (e) {
		if (typeof e == "string") return OO(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? OO(e, t) : void 0;
	}
}
function OO(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function kO(e, t) {
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
function AO(e) {
	if (Array.isArray(e)) return e;
}
function jO(e, t, n) {
	return (t = MO(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function MO(e) {
	var t = NO(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function NO(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var PO = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/, FO = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/, IO = /^(px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q)$/, LO = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/, RO = {
	cm: 96 / 2.54,
	mm: 96 / 25.4,
	pt: 96 / 72,
	pc: 16,
	in: 96,
	Q: 96 / 101.6,
	px: 1
}, zO = [
	"cm",
	"mm",
	"pt",
	"pc",
	"in",
	"Q",
	"px"
];
function BO(e) {
	return zO.includes(e);
}
var VO = "NaN";
function HO(e, t) {
	return e * RO[t];
}
var UO = class e {
	static parse(t) {
		var n = TO(LO.exec(t) ?? [], 3), r = n[1], i = n[2];
		return r == null ? e.NaN : new e(parseFloat(r), i ?? "");
	}
	constructor(e, t) {
		this.num = e, this.unit = t, this.num = e, this.unit = t, Ft(e) && (this.unit = ""), t !== "" && !IO.test(t) && (this.num = NaN, this.unit = ""), BO(t) && (this.num = HO(e, t), this.unit = "px");
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
		return Ft(this.num);
	}
};
wO = UO, jO(UO, "NaN", new wO(NaN, ""));
function WO(e) {
	if (e == null || e.includes(VO)) return VO;
	for (var t = e; t.includes("*") || t.includes("/");) {
		var n = TO(PO.exec(t) ?? [], 4), r = n[1], i = n[2], a = n[3], o = UO.parse(r ?? ""), s = UO.parse(a ?? ""), c = i === "*" ? o.multiply(s) : o.divide(s);
		if (c.isNaN()) return VO;
		t = t.replace(PO, c.toString());
	}
	for (; t.includes("+") || /.-\d+(?:\.\d+)?/.test(t);) {
		var l = TO(FO.exec(t) ?? [], 4), u = l[1], d = l[2], f = l[3], p = UO.parse(u ?? ""), m = UO.parse(f ?? ""), h = d === "+" ? p.add(m) : p.subtract(m);
		if (h.isNaN()) return VO;
		t = t.replace(FO, h.toString());
	}
	return t;
}
var GO = /\(([^()]*)\)/;
function KO(e) {
	for (var t = e, n; (n = GO.exec(t)) != null;) {
		var r = TO(n, 2)[1];
		t = t.replace(GO, WO(r));
	}
	return t;
}
function qO(e) {
	var t = e.replace(/\s+/g, "");
	return t = KO(t), t = WO(t), t;
}
function JO(e) {
	try {
		return qO(e);
	} catch {
		return VO;
	}
}
function YO(e) {
	var t = JO(e.slice(5, -1));
	return t === VO ? "" : t;
}
// ../../../peach/frontend/node_modules/recharts/es6/component/Text.js
var XO = [
	"x",
	"y",
	"lineHeight",
	"capHeight",
	"fill",
	"scaleToFit",
	"textAnchor",
	"verticalAnchor"
], ZO = [
	"dx",
	"dy",
	"angle",
	"className",
	"breakAll"
];
function QO() {
	return QO = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, QO.apply(null, arguments);
}
function $O(e, t) {
	if (e == null) return {};
	var n, r, i = ek(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function ek(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function tk(e, t) {
	return ok(e) || ak(e, t) || rk(e, t) || nk();
}
function nk() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function rk(e, t) {
	if (e) {
		if (typeof e == "string") return ik(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ik(e, t) : void 0;
	}
}
function ik(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function ak(e, t) {
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
function ok(e) {
	if (Array.isArray(e)) return e;
}
var sk = /[ \f\n\r\t\v\u2028\u2029]+/, ck = (e) => {
	var t = e.children, n = e.breakAll, r = e.style;
	try {
		var i = [];
		return R(t) || (i = n ? t.toString().split("") : t.toString().split(sk)), {
			wordsWithComputedWidth: i.map((e) => ({
				word: e,
				width: CO(e, r).width
			})),
			spaceWidth: n ? 0 : CO("\xA0", r).width
		};
	} catch {
		return null;
	}
};
function lk(e) {
	return e === "start" || e === "middle" || e === "end" || e === "inherit";
}
function uk(e) {
	return R(e) || typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
var dk = (e, t, n, r) => e.reduce((e, i) => {
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
}, []), fk = (e) => e.reduce((e, t) => e.width > t.width ? e : t), pk = "…", mk = (e, t, n, r, i, a, o, s) => {
	var c = ck({
		breakAll: n,
		style: r,
		children: e.slice(0, t) + pk
	});
	if (!c) return [!1, []];
	var l = dk(c.wordsWithComputedWidth, a, o, s);
	return [l.length > i || fk(l).width > Number(a), l];
}, hk = (e, t, n, r, i) => {
	var a = e.maxLines, o = e.children, s = e.style, c = e.breakAll, l = I(a), u = String(o), d = dk(t, r, n, i);
	if (!l || i || !(d.length > a || fk(d).width > Number(r))) return d;
	for (var f = 0, p = u.length - 1, m = 0, h; f <= p && m <= u.length - 1;) {
		var g = Math.floor((f + p) / 2), _ = tk(mk(u, g - 1, c, s, a, r, n, i), 2), v = _[0], y = _[1], b = tk(mk(u, g, c, s, a, r, n, i), 1)[0];
		if (!v && !b && (f = g + 1), v && b && (p = g - 1), !v && b) {
			h = y;
			break;
		}
		m++;
	}
	return h || d;
}, gk = (e) => [{
	words: R(e) ? [] : e.toString().split(sk),
	width: void 0
}], _k = (e) => {
	var t = e.width, n = e.scaleToFit, r = e.children, i = e.style, a = e.breakAll, o = e.maxLines;
	if ((t || n) && !Sf.isSsr) {
		var s, c, l = ck({
			breakAll: a,
			children: r,
			style: i
		});
		if (l) {
			var u = l.wordsWithComputedWidth, d = l.spaceWidth;
			s = u, c = d;
		} else return gk(r);
		return hk({
			breakAll: a,
			children: r,
			maxLines: o,
			style: i
		}, s, c, t, !!n);
	}
	return gk(r);
}, vk = "#808080", yk = {
	angle: 0,
	breakAll: !1,
	capHeight: "0.71em",
	fill: vk,
	lineHeight: "1em",
	scaleToFit: !1,
	textAnchor: "start",
	verticalAnchor: "end",
	x: 0,
	y: 0
}, bk = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = Xr(e, yk), r = n.x, i = n.y, a = n.lineHeight, o = n.capHeight, s = n.fill, c = n.scaleToFit, l = n.textAnchor, u = n.verticalAnchor, d = $O(n, XO), f = (0, P.useMemo)(() => _k({
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
	]), p = d.dx, m = d.dy, h = d.angle, g = d.className, _ = d.breakAll, v = $O(d, ZO);
	if (!Lt(r) || !Lt(i) || f.length === 0) return null;
	var y = Number(r) + (I(p) ? p : 0), b = Number(i) + (I(m) ? m : 0);
	if (!G(y) || !G(b)) return null;
	var x;
	switch (u) {
		case "start":
			x = YO(`calc(${o})`);
			break;
		case "middle":
			x = YO(`calc(${(f.length - 1) / 2} * -${a} + (${o} / 2))`);
			break;
		default: x = YO(`calc(${f.length - 1} * -${a})`);
	}
	var S = [], C = f[0];
	if (c && C != null) {
		var w = C.width, T = d.width;
		S.push(`scale(${I(T) && I(w) ? T / w : 1})`);
	}
	return h && S.push(`rotate(${h}, ${y}, ${b})`), S.length && (v.transform = S.join(" ")), /*#__PURE__*/ P.createElement("text", QO({}, ut(v), {
		ref: t,
		x: y,
		y: b,
		className: N("recharts-text", g),
		textAnchor: l,
		fill: s.includes("url") ? vk : s
	}), f.map((e, t) => {
		var n = e.words.join(_ ? "" : " ");
		return /*#__PURE__*/ P.createElement("tspan", {
			x: y,
			dy: t === 0 ? x : a,
			key: `${n}-${t}`
		}, n);
	}));
});
bk.displayName = "Text";
// ../../../peach/frontend/node_modules/recharts/es6/component/Label.js
var xk = ["labelRef"], Sk = ["content"];
function Ck(e, t) {
	if (e == null) return {};
	var n, r, i = wk(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function wk(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function Tk(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Ek(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Tk(Object(n), !0).forEach(function(t) {
			Dk(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Tk(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Dk(e, t, n) {
	return (t = Ok(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Ok(e) {
	var t = kk(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function kk(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Ak() {
	return Ak = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Ak.apply(null, arguments);
}
var jk = /*#__PURE__*/ (0, P.createContext)(null), Mk = (e) => {
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
	return /*#__PURE__*/ P.createElement(jk.Provider, { value: c }, s);
}, Nk = () => {
	var e = (0, P.useContext)(jk), t = Ru();
	return e || (t ? Kt(t) : void 0);
}, Pk = /*#__PURE__*/ (0, P.createContext)(null), Fk = () => {
	var e = (0, P.useContext)(Pk), t = V(xg);
	return e || t;
}, Ik = (e) => {
	var t = e.value, n = e.formatter, r = R(e.children) ? t : e.children;
	return typeof n == "function" ? n(r) : r;
}, Lk = (e) => e != null && typeof e == "function", Rk = (e, t) => Pt(t - e) * Math.min(Math.abs(t - e), 360), zk = (e, t, n, r, i) => {
	var a = e.offset, o = e.className, s = i.cx, c = i.cy, l = i.innerRadius, u = i.outerRadius, d = i.startAngle, f = i.endAngle, p = i.clockWise, m = (l + u) / 2, h = Rk(d, f), g = h >= 0 ? 1 : -1, _, v;
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
	var y = Rm(s, c, m, _), b = Rm(s, c, m, _ + (v ? 1 : -1) * 359), x = `M${y.x},${y.y}
    A${m},${m},0,1,${+!v},
    ${b.x},${b.y}`, S = R(e.id) ? zt("recharts-radial-line-") : e.id;
	return /*#__PURE__*/ P.createElement("text", Ak({}, r, {
		dominantBaseline: "central",
		className: N("recharts-radial-bar-label", o)
	}), /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement("path", {
		id: S,
		d: x
	})), /*#__PURE__*/ P.createElement("textPath", { xlinkHref: `#${S}` }, n));
}, Bk = (e, t, n) => {
	var r = e.cx, i = e.cy, a = e.innerRadius, o = e.outerRadius, s = (e.startAngle + e.endAngle) / 2;
	if (n === "outside") {
		var c = Rm(r, i, o + t, s), l = c.x;
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
	var u = Rm(r, i, (a + o) / 2, s);
	return {
		x: u.x,
		y: u.y,
		textAnchor: "middle",
		verticalAnchor: "middle"
	};
}, Vk = (e) => e != null && "cx" in e && I(e.cx), Hk = {
	angle: 0,
	offset: 5,
	zIndex: Y.label,
	position: "middle",
	textBreakAll: !1
};
function Uk(e) {
	if (!Vk(e)) return e;
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
function Wk(e) {
	var t = Xr(e, Hk), n = t.viewBox, r = t.parentViewBox, i = t.position, a = t.value, o = t.children, s = t.content, c = t.className, l = c === void 0 ? "" : c, u = t.textBreakAll, d = t.labelRef, f = Fk(), p = Nk(), m = n == null ? i === "center" ? p : f ?? p : Vk(n) ? n : Kt(n), h, g, _ = Uk(m);
	if (!m || R(a) && R(o) && !/*#__PURE__*/ (0, P.isValidElement)(s) && typeof s != "function") return null;
	var v = Vk(m) && (i === "insideStart" || i === "insideEnd" || i === "end");
	if (Vk(m)) v || (g = Bk(m, t.offset, t.position));
	else if (_) {
		var y = Qt({
			viewBox: _,
			position: i,
			offset: t.offset,
			parentViewBox: Vk(r) ? void 0 : r,
			clamp: !0
		});
		g = Ek(Ek({
			x: y.x,
			y: y.y,
			textAnchor: y.horizontalAnchor,
			verticalAnchor: y.verticalAnchor
		}, y.width === void 0 ? {} : { width: y.width }), y.height === void 0 ? {} : { height: y.height });
	}
	var b = Ek(Ek(Ek(Ek({}, g?.x === void 0 ? {} : { x: g.x }), g?.y === void 0 ? {} : { y: g.y }), t), {}, { viewBox: m });
	if (/*#__PURE__*/ (0, P.isValidElement)(s)) {
		b.labelRef;
		var x = Ck(b, xk);
		return /*#__PURE__*/ (0, P.cloneElement)(s, x);
	}
	if (typeof s == "function") {
		b.content;
		var S = Ck(b, Sk);
		if (h = /*#__PURE__*/ (0, P.createElement)(s, S), /*#__PURE__*/ (0, P.isValidElement)(h)) return h;
	} else h = Ik(t);
	var C = ut(t);
	return v && Vk(m) ? zk(t, i, h, C, m) : g == null ? null : /*#__PURE__*/ P.createElement(sD, { zIndex: t.zIndex }, /*#__PURE__*/ P.createElement(bk, Ak({
		ref: d,
		className: N("recharts-label", l)
	}, C, g, {
		textAnchor: lk(C.textAnchor) ? C.textAnchor : g.textAnchor,
		breakAll: u
	}), h));
}
Wk.displayName = "Label";
var Gk = (e, t, n) => {
	if (!e) return null;
	var r = {
		viewBox: t,
		labelRef: n
	};
	return e === !0 ? /*#__PURE__*/ P.createElement(Wk, Ak({ key: "label-implicit" }, r)) : Lt(e) ? /*#__PURE__*/ P.createElement(Wk, Ak({
		key: "label-implicit",
		value: e
	}, r)) : /*#__PURE__*/ (0, P.isValidElement)(e) ? e.type === Wk ? /*#__PURE__*/ (0, P.cloneElement)(e, Ek({ key: "label-implicit" }, r)) : /*#__PURE__*/ P.createElement(Wk, Ak({
		key: "label-implicit",
		content: e
	}, r)) : Lk(e) ? /*#__PURE__*/ P.createElement(Wk, Ak({
		key: "label-implicit",
		content: e
	}, r)) : e && typeof e == "object" ? /*#__PURE__*/ P.createElement(Wk, Ak({}, e, { key: "label-implicit" }, r)) : null;
};
function Kk(e) {
	var t = e.label, n = e.labelRef;
	return Gk(t, Nk(), n) || null;
}
// ../../../peach/frontend/node_modules/recharts/es6/component/LabelList.js
var qk = ["valueAccessor"], Jk = [
	"dataKey",
	"clockWise",
	"id",
	"textBreakAll",
	"zIndex"
];
function Yk() {
	return Yk = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Yk.apply(null, arguments);
}
function Xk(e, t) {
	if (e == null) return {};
	var n, r, i = Zk(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Zk(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var Qk = (e) => {
	var t = Array.isArray(e.value) ? e.value[e.value.length - 1] : e.value;
	if (uk(t)) return t;
}, $k = /*#__PURE__*/ (0, P.createContext)(void 0), eA = $k.Provider, tA = /*#__PURE__*/ (0, P.createContext)(void 0), nA = tA.Provider;
function rA() {
	return (0, P.useContext)($k);
}
function iA() {
	return (0, P.useContext)(tA);
}
function aA(e) {
	var t = e.valueAccessor, n = t === void 0 ? Qk : t, r = Xk(e, qk), i = r.dataKey;
	r.clockWise;
	var a = r.id, o = r.textBreakAll, s = r.zIndex, c = Xk(r, Jk), l = rA(), u = iA(), d = l || u;
	return !d || !d.length ? null : /*#__PURE__*/ P.createElement(sD, { zIndex: s ?? Y.label }, /*#__PURE__*/ P.createElement(F, { className: "recharts-label-list" }, d.map((e, t) => {
		var s = R(i) ? n(e, t) : K(e.payload, i), l = R(a) ? {} : { id: `${a}-${t}` };
		return /*#__PURE__*/ P.createElement(Wk, Yk({ key: `label-${t}` }, ut(e), c, l, {
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
aA.displayName = "LabelList";
function oA(e) {
	var t = e.label;
	return t ? t === !0 ? /*#__PURE__*/ P.createElement(aA, { key: "labelList-implicit" }) : /*#__PURE__*/ P.isValidElement(t) || Lk(t) ? /*#__PURE__*/ P.createElement(aA, {
		key: "labelList-implicit",
		content: t
	}) : typeof t == "object" ? /*#__PURE__*/ P.createElement(aA, Yk({ key: "labelList-implicit" }, t, { type: String(t.type) })) : null : null;
}
// ../../../peach/frontend/node_modules/recharts/es6/shape/Polygon.js
var sA = [
	"points",
	"className",
	"baseLinePoints",
	"connectNulls"
], cA;
function lA() {
	return lA = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, lA.apply(null, arguments);
}
function uA(e, t) {
	if (e == null) return {};
	var n, r, i = dA(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function dA(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function fA(e, t) {
	return t ||= e.slice(0), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var pA = (e) => e != null && e.x === +e.x && e.y === +e.y, mA = function() {
	var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [], t = [[]];
	e.forEach((e) => {
		var n = t[t.length - 1];
		pA(e) ? n && n.push(e) : n && n.length > 0 && t.push([]);
	});
	var n = e[0], r = t[t.length - 1];
	pA(n) && r && r.push(n);
	var i = t[t.length - 1];
	return i && i.length <= 0 && (t = t.slice(0, -1)), t;
}, hA = (e, t) => {
	var n = mA(e);
	t && (n = [n.reduce((e, t) => [...e, ...t], [])]);
	var r = n.map((e) => e.reduce((e, t, n) => Nt(cA ||= fA([
		"",
		"",
		"",
		",",
		""
	]), e, n === 0 ? "M" : "L", t.x, t.y), "")).join("");
	return n.length === 1 ? `${r}Z` : r;
}, gA = (e, t, n) => {
	var r = hA(e, n);
	return `${r.slice(-1) === "Z" ? r.slice(0, -1) : r}L${hA(Array.from(t).reverse(), n).slice(1)}`;
}, _A = (e) => {
	var t = e.points, n = e.className, r = e.baseLinePoints, i = e.connectNulls, a = uA(e, sA);
	if (!t || !t.length) return null;
	var o = N("recharts-polygon", n);
	if (r && r.length) {
		var s = a.stroke && a.stroke !== "none", c = gA(t, r, i);
		return /*#__PURE__*/ P.createElement("g", { className: o }, /*#__PURE__*/ P.createElement("path", lA({}, ut(a), {
			fill: c.slice(-1) === "Z" ? a.fill : "none",
			stroke: "none",
			d: c
		})), s ? /*#__PURE__*/ P.createElement("path", lA({}, ut(a), {
			fill: "none",
			d: hA(t, i)
		})) : null, s ? /*#__PURE__*/ P.createElement("path", lA({}, ut(a), {
			fill: "none",
			d: hA(r, i)
		})) : null);
	}
	var l = hA(t, i);
	return /*#__PURE__*/ P.createElement("path", lA({}, ut(a), {
		fill: l.slice(-1) === "Z" ? a.fill : "none",
		className: o,
		d: l
	}));
};
// ../../../peach/frontend/node_modules/recharts/es6/shape/Dot.js
function vA() {
	return vA = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, vA.apply(null, arguments);
}
var yA = (e) => {
	var t = e.cx, n = e.cy, r = e.r, i = e.className, a = N("recharts-dot", i);
	return I(t) && I(n) && I(r) ? /*#__PURE__*/ P.createElement("circle", vA({}, ct(e), Hr(e), {
		className: a,
		cx: t,
		cy: n,
		r
	})) : null;
}, bA = (e) => e.graphicalItems.polarItems, xA = H([
	bA,
	Q,
	H([X, Sg], BS)
], US), SA = H([H([xA], JS), fh], ZS), CA = H([
	SA,
	Q,
	xA
], $S);
H([
	SA,
	Q,
	xA
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
var wA = () => void 0, TA = H([
	Q,
	q,
	SA,
	CA,
	qh,
	X,
	H([
		Q,
		_C,
		vC,
		wA,
		H([
			SA,
			Q,
			xA,
			bC,
			X,
			gh
		], CC),
		wA,
		q,
		X
	], HC)
], GC), EA = H([
	TA,
	RS,
	qC
], JC), DA = H([qC, H([
	Q,
	TA,
	EA,
	X
], XC)], Mg), OA = (e, t, n) => {
	switch (t) {
		case "angleAxis": return dg(e, n);
		case "radiusAxis": return fg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, kA = (e, t, n) => {
	switch (t) {
		case "angleAxis": return vg(e, n);
		case "radiusAxis": return bg(e, n);
		default: throw Error(`Unexpected axis type: ${t}`);
	}
}, AA = H([H([
	OA,
	qC,
	DA,
	kA
], uS)], jg), jA = H([
	q,
	CA,
	RS,
	X
], cw), MA = H([
	q,
	OA,
	qC,
	AA,
	EA,
	kA,
	Ow,
	jA,
	X
], Aw), NA = H([MA], (e) => {
	if (e) {
		var t = /* @__PURE__ */ new Map();
		return e.forEach((e) => {
			var n = (e.coordinate + 360) % 360;
			t.has(n) || t.set(n, e);
		}), Array.from(t.values());
	}
}), PA = H([
	q,
	OA,
	AA,
	kA,
	Ow,
	jA,
	X
], Mw), FA = fc({
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
}), IA = FA.actions;
IA.addRadiusAxis, IA.removeRadiusAxis;
var LA = IA.addAngleAxis, RA = IA.removeAngleAxis, zA = FA.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/util/getClassNameFromUnknown.js
function BA(e) {
	return e && typeof e == "object" && "className" in e && typeof e.className == "string" ? e.className : "";
}
// ../../../peach/frontend/node_modules/recharts/es6/polar/PolarAngleAxis.js
var VA = ["children", "type"], HA = ["ref"];
function UA() {
	return UA = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, UA.apply(null, arguments);
}
function WA(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function GA(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? WA(Object(n), !0).forEach(function(t) {
			KA(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : WA(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function KA(e, t, n) {
	return (t = qA(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function qA(e) {
	var t = JA(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function JA(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function YA(e, t) {
	if (e == null) return {};
	var n, r, i = XA(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function XA(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var ZA = 1e-5, QA = Math.cos(Im(45)), $A = "angleAxis";
function ej(e) {
	var t = B(), n = qu(), r = (0, P.useMemo)(() => {
		e.children;
		var t = e.type, r = YA(e, VA), i = rg(n, "angleAxis", t);
		if (i != null) return GA(GA({}, r), {}, { type: i });
	}, [e, n]), i = r === V((e) => dg(e, r?.id));
	return (0, P.useEffect)(() => r == null ? Gt : (t(LA(r)), () => {
		t(RA(r));
	}), [t, r]), i ? e.children : null;
}
var tj = (e, t) => {
	var n = t.cx, r = t.cy, i = t.radius, a = t.orientation, o = t.tickSize || 8, s = Rm(n, r, i, e.coordinate), c = Rm(n, r, i + (a === "inner" ? -1 : 1) * o, e.coordinate);
	return {
		x1: s.x,
		y1: s.y,
		x2: c.x,
		y2: c.y
	};
}, nj = (e, t) => {
	var n = Math.cos(Im(-e.coordinate));
	return n > ZA ? t === "outer" ? "start" : "end" : n < -ZA ? t === "outer" ? "end" : "start" : "middle";
}, rj = (e) => {
	var t = Math.cos(Im(-e.coordinate)), n = Math.sin(Im(-e.coordinate));
	return Math.abs(t) <= QA ? n > 0 ? "start" : "end" : "middle";
}, ij = (e) => {
	var t = e.cx, n = e.cy, r = e.radius, i = e.axisLineType, a = e.axisLine, o = e.ticks;
	if (!a) return null;
	var s = GA(GA({}, ct(e)), {}, { fill: "none" }, ct(a));
	if (i === "circle") return /*#__PURE__*/ P.createElement(yA, UA({ className: "recharts-polar-angle-axis-line" }, s, {
		cx: t,
		cy: n,
		r
	}));
	var c = o.map((e) => Rm(t, n, r, e.coordinate));
	return /*#__PURE__*/ P.createElement(_A, UA({ className: "recharts-polar-angle-axis-line" }, s, { points: c }));
}, aj = (e) => {
	var t = e.tick, n = e.tickProps, r = e.value;
	return t ? /*#__PURE__*/ P.isValidElement(t) ? /*#__PURE__*/ P.cloneElement(t, n) : typeof t == "function" ? t(n) : /*#__PURE__*/ P.createElement(bk, UA({}, n, { className: "recharts-polar-angle-axis-tick-value" }), r) : null;
}, oj = (e) => {
	var t = e.tick, n = e.tickLine, r = e.tickFormatter, i = e.stroke, a = e.ticks, o = ct(e);
	o.ref;
	var s = YA(o, HA), c = lt(t), l = GA(GA({}, s), {}, { fill: "none" }, ct(n)), u = a.map((a, o) => {
		var u = tj(a, e), d = nj(a, e.orientation), f = rj(a), p = GA(GA(GA({}, s), {}, {
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
		return /*#__PURE__*/ P.createElement(F, UA({
			className: N("recharts-polar-angle-axis-tick", BA(t)),
			key: `tick-${a.coordinate}`
		}, Wr(e, a, o)), n && /*#__PURE__*/ P.createElement("line", UA({ className: "recharts-polar-angle-axis-tick-line" }, l, u)), /*#__PURE__*/ P.createElement(aj, {
			tick: t,
			tickProps: p,
			value: r ? r(a.value, o) : a.value
		}));
	});
	return /*#__PURE__*/ P.createElement(F, { className: "recharts-polar-angle-axis-ticks" }, u);
}, sj = (e) => {
	var t = e.angleAxisId, n = V(xg), r = V((e) => AA(e, "angleAxis", t)), i = nu(), a = V((e) => NA(e, "angleAxis", t, i));
	if (n == null || !a || !a.length || r == null) return null;
	var o = GA(GA(GA({}, e), {}, { scale: r }, n), {}, {
		radius: n.outerRadius,
		ticks: a
	});
	return /*#__PURE__*/ P.createElement(sD, { zIndex: o.zIndex }, /*#__PURE__*/ P.createElement(F, { className: N("recharts-polar-angle-axis", $A, o.className) }, /*#__PURE__*/ P.createElement(ij, o), /*#__PURE__*/ P.createElement(oj, o)));
};
function cj(e) {
	var t = Xr(e, eg);
	return /*#__PURE__*/ P.createElement(ej, {
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
	}, /*#__PURE__*/ P.createElement(sj, t));
}
cj.displayName = "PolarAngleAxis";
// ../../../peach/frontend/node_modules/react-is/cjs/react-is.production.js
var lj = /* @__PURE__ */ T(((e) => {
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
})), uj = (/* @__PURE__ */ T(((e, t) => {
	t.exports = lj();
})))(), dj = (e) => typeof e == "string" ? e : e ? e.displayName || e.name || "Component" : "", fj = null, pj = null, mj = (e) => {
	if (e === fj && Array.isArray(pj)) return pj;
	var t = [];
	return P.Children.forEach(e, (e) => {
		R(e) || ((0, uj.isFragment)(e) ? t = t.concat(mj(e.props.children)) : t.push(e));
	}), pj = t, fj = e, t;
};
function hj(e, t) {
	var n = [], r = [];
	return r = Array.isArray(t) ? t.map((e) => dj(e)) : [dj(t)], mj(e).forEach((e) => {
		var t = kt(e, "type.displayName") || kt(e, "type.name");
		t && r.indexOf(t) !== -1 && n.push(e);
	}), n;
}
var gj = (e) => e && typeof e == "object" && "clipDot" in e ? !!e.clipDot : !0;
// ../../../peach/frontend/node_modules/recharts/es6/util/ActiveShapeUtils.js
function _j(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function vj(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? _j(Object(n), !0).forEach(function(t) {
			yj(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _j(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function yj(e, t, n) {
	return (t = bj(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function bj(e) {
	var t = xj(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function xj(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Sj(e, t) {
	return vj(vj({}, t), e);
}
function Cj(e) {
	return /*#__PURE__*/ (0, P.isValidElement)(e) ? e.props : e;
}
function wj(e, t) {
	return /*#__PURE__*/ (0, P.cloneElement)(e, Sj(Cj(e), t));
}
function Tj(e) {
	if ("index" in e) {
		var t = e.index;
		return typeof t == "number" || typeof t == "string" ? t : void 0;
	}
}
function Ej(e) {
	return "isActive" in e && e.isActive === !0;
}
function Dj(e) {
	var t = e.option, n = e.DefaultShape, r = e.shapeProps, i = e.activeClassName, a = i === void 0 ? "recharts-active-shape" : i, o = e.inActiveClassName, s = o === void 0 ? "recharts-shape" : o, c = Tj(r), l = /*#__PURE__*/ (0, P.isValidElement)(t) ? wj(t, r) : t === n ? /*#__PURE__*/ P.createElement(n, r) : typeof t == "function" ? t(r, c) : typeof t == "object" ? /*#__PURE__*/ P.createElement(n, Sj(t, r)) : /*#__PURE__*/ P.createElement(n, r);
	return Ej(r) ? /*#__PURE__*/ P.createElement(F, { className: a }, l) : /*#__PURE__*/ P.createElement(F, { className: s }, l);
}
// ../../../peach/frontend/node_modules/recharts/es6/context/tooltipContext.js
var Oj = (e, t, n) => {
	var r = B();
	return (i, a) => (o) => {
		e?.(i, a, o), r(Xw({
			activeIndex: String(a),
			activeDataKey: t,
			activeCoordinate: i.tooltipPosition,
			activeGraphicalItemId: n
		}));
	};
}, kj = (e) => {
	var t = B();
	return (n, r) => (i) => {
		e?.(n, r, i), t(Zw());
	};
}, Aj = (e, t, n) => {
	var r = B();
	return (i, a) => (o) => {
		e?.(i, a, o), r($w({
			activeIndex: String(a),
			activeDataKey: t,
			activeCoordinate: i.tooltipPosition,
			activeGraphicalItemId: n
		}));
	};
};
// ../../../peach/frontend/node_modules/recharts/es6/state/SetTooltipEntrySettings.js
function jj(e) {
	var t = e.tooltipEntrySettings, n = B(), r = nu(), i = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		r || (i.current === null ? n(Kw(t)) : i.current !== t && n(qw({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		t,
		n,
		r
	]), (0, P.useLayoutEffect)(() => () => {
		i.current &&= (n(Jw(i.current)), null);
	}, [n]), null;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/SetLegendPayload.js
function Mj(e) {
	var t = e.legendPayload, n = B(), r = nu(), i = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		r || (i.current === null ? n(ed(t)) : i.current !== t && n(td({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		n,
		r,
		t
	]), (0, P.useLayoutEffect)(() => () => {
		i.current &&= (n(nd(i.current)), null);
	}, [n]), null;
}
function Nj(e) {
	var t = e.legendPayload, n = B(), r = V(q), i = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		(r === "centric" || r === "radial") && (i.current === null ? n(ed(t)) : i.current !== t && n(td({
			prev: i.current,
			next: t
		})), i.current = t);
	}, [
		n,
		r,
		t
	]), (0, P.useLayoutEffect)(() => () => {
		i.current &&= (n(nd(i.current)), null);
	}, [n]), null;
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/matchBy.js
function Pj(e, t) {
	return zj(e) || Rj(e, t) || Ij(e, t) || Fj();
}
function Fj() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ij(e, t) {
	if (e) {
		if (typeof e == "string") return Lj(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lj(e, t) : void 0;
	}
}
function Lj(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Rj(e, t) {
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
function zj(e) {
	if (Array.isArray(e)) return e;
}
var Bj = "index", Vj = "append";
function Hj(e, t) {
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
function Uj(e, t) {
	var n = e.length / t.length;
	return Hj(t.map((t, r) => e[Math.floor(r * n)]), t);
}
function Wj(e, t) {
	return Hj(t.map((t, n) => e[n]), t);
}
function Gj(e, t) {
	for (var n = /* @__PURE__ */ new Map(), r = 0; r < e.length; r++) {
		var i = e[r];
		if (i != null) {
			var a = t(i, r);
			a != null && !n.has(a) && n.set(a, i);
		}
	}
	return n;
}
function Kj(e, t, n) {
	var r = Gj(e, n), i = /* @__PURE__ */ new Set(), a = t.map((e, t) => {
		var a = n(e, t);
		if (a != null) {
			var o = r.get(a);
			if (o !== void 0) return i.add(a), o;
		}
	}), o = [];
	for (var s of r) {
		var c = Pj(s, 2), l = c[0], u = c[1];
		i.has(l) || o.push(u);
	}
	return Hj(a, t, o);
}
function qj(e, t, n) {
	return t == null ? null : e == null ? t.map((e) => ({
		status: "added",
		next: e
	})) : n === "index" ? Uj(e, t) : n === "append" ? Wj(e, t) : Kj(e, t, n);
}
// ../../../peach/frontend/node_modules/recharts/es6/animation/useAnimationStartSnapshot.js
function Jj(e, t) {
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
function Yj(e, t) {
	return eM(e) || $j(e, t) || Zj(e, t) || Xj();
}
function Xj() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Zj(e, t) {
	if (e) {
		if (typeof e == "string") return Qj(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qj(e, t) : void 0;
	}
}
function Qj(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function $j(e, t) {
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
function eM(e) {
	if (Array.isArray(e)) return e;
}
function tM(e, t) {
	var n = Yj((0, P.useState)(!1), 2), r = n[0], i = n[1];
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
function nM(e) {
	var t = e.animationInput, n = e.animationIdPrefix, r = e.items, i = e.previousItemsRef, a = e.isAnimationActive, o = e.animationBegin, s = e.animationDuration, c = e.animationEasing, l = e.onAnimationStart, u = e.onAnimationEnd, d = e.animationInterpolateFn, f = e.animationMatchBy, p = e.shouldUpdatePreviousRef, m = e.children, h = e.layout, g = Zp(t, n), _ = Jj(g, i), v = _.startValue ?? null, y = qj(v, r, f ?? Bj);
	return /*#__PURE__*/ P.createElement(Xp, {
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
function rM(e, t) {
	return cM(e) || sM(e, t) || aM(e, t) || iM();
}
function iM() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function aM(e, t) {
	if (e) {
		if (typeof e == "string") return oM(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? oM(e, t) : void 0;
	}
}
function oM(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function sM(e, t) {
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
function cM(e) {
	if (Array.isArray(e)) return e;
}
var lM = P.useId ?? (() => rM(P.useState(() => zt("uid-")), 1)[0]);
// ../../../peach/frontend/node_modules/recharts/es6/util/useUniqueId.js
function uM(e, t) {
	var n = lM();
	return t || (e ? `${e}-${n}` : n);
}
// ../../../peach/frontend/node_modules/recharts/es6/context/RegisterGraphicalItemId.js
var dM = /*#__PURE__*/ (0, P.createContext)(void 0), fM = (e) => {
	var t = e.id, n = e.type, r = e.children, i = uM(`recharts-${n}`, t);
	return /*#__PURE__*/ P.createElement(dM.Provider, { value: i }, r(i));
}, pM = fc({
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
				var n = t.payload, r = n.prev, i = n.next, a = Rs(e).cartesianItems.indexOf(U(r));
				a > -1 && (e.cartesianItems[a] = U(i));
			},
			prepare: W()
		},
		removeCartesianGraphicalItem: {
			reducer(e, t) {
				var n = Rs(e).cartesianItems.indexOf(U(t.payload));
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
				var n = Rs(e).polarItems.indexOf(U(t.payload));
				n > -1 && e.polarItems.splice(n, 1);
			},
			prepare: W()
		},
		replacePolarGraphicalItem: {
			reducer(e, t) {
				var n = t.payload, r = n.prev, i = n.next, a = Rs(e).polarItems.indexOf(U(r));
				a > -1 && (e.polarItems[a] = U(i));
			},
			prepare: W()
		}
	}
}), mM = pM.actions, hM = mM.addCartesianGraphicalItem, gM = mM.replaceCartesianGraphicalItem, _M = mM.removeCartesianGraphicalItem, vM = mM.addPolarGraphicalItem, yM = mM.removePolarGraphicalItem, bM = mM.replacePolarGraphicalItem, xM = pM.reducer, SM = /*#__PURE__*/ (0, P.memo)((e) => {
	var t = B(), n = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		n.current === null ? t(hM(e)) : n.current !== e && t(gM({
			prev: n.current,
			next: e
		})), n.current = e;
	}, [t, e]), (0, P.useLayoutEffect)(() => () => {
		n.current &&= (t(_M(n.current)), null);
	}, [t]), null;
}), CM = /*#__PURE__*/ (0, P.memo)((e) => {
	var t = B(), n = (0, P.useRef)(null);
	return (0, P.useLayoutEffect)(() => {
		n.current === null ? t(vM(e)) : n.current !== e && t(bM({
			prev: n.current,
			next: e
		})), n.current = e;
	}, [t, e]), (0, P.useLayoutEffect)(() => () => {
		n.current &&= (t(yM(n.current)), null);
	}, [t]), null;
}), wM = ["points"];
function TM(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function EM(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? TM(Object(n), !0).forEach(function(t) {
			DM(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : TM(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function DM(e, t, n) {
	return (t = OM(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function OM(e) {
	var t = kM(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function kM(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function AM() {
	return AM = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, AM.apply(null, arguments);
}
function jM(e, t) {
	if (e == null) return {};
	var n, r, i = MM(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function MM(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function NM(e) {
	var t = e.option, n = e.dotProps, r = e.className;
	if (/*#__PURE__*/ (0, P.isValidElement)(t)) return /*#__PURE__*/ (0, P.cloneElement)(t, n);
	if (typeof t == "function") return t(n);
	var i = N(r, typeof t == "boolean" ? "" : t.className), a = n ?? {};
	a.points;
	var o = jM(a, wM);
	return /*#__PURE__*/ P.createElement(yA, AM({}, o, { className: i }));
}
function PM(e, t) {
	return e == null ? !1 : t ? !0 : e.length === 1;
}
function FM(e) {
	var t = e.points, n = e.dot, r = e.className, i = e.dotClassName, a = e.dataKey, o = e.baseProps, s = e.needClip, c = e.clipPathId, l = e.zIndex, u = l === void 0 ? Y.scatter : l;
	if (!PM(t, n)) return null;
	var d = gj(n), f = dt(n), p = t.map((e, r) => {
		var s = EM(EM(EM({ r: 3 }, o), f), {}, {
			index: r,
			cx: e.x ?? void 0,
			cy: e.y ?? void 0,
			dataKey: a,
			value: e.value,
			payload: e.payload,
			points: t
		});
		return /*#__PURE__*/ P.createElement(NM, {
			key: `dot-${r}`,
			option: n,
			dotProps: s,
			className: i
		});
	}), m = {};
	return s && c != null && (m.clipPath = `url(#clipPath-${d ? "" : "dots-"}${c})`), /*#__PURE__*/ P.createElement(sD, { zIndex: u }, /*#__PURE__*/ P.createElement(F, AM({ className: r }, m), p));
}
// ../../../peach/frontend/node_modules/recharts/es6/state/cartesianAxisSlice.js
function IM(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function LM(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? IM(Object(n), !0).forEach(function(t) {
			RM(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : IM(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function RM(e, t, n) {
	return (t = zM(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function zM(e) {
	var t = BM(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function BM(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var VM = fc({
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
				e.yAxis[r] = LM(LM({}, a), {}, {
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
				e.xAxis[r] = LM(LM({}, a), {}, {
					height: i,
					heightHistory: s
				});
			}
		}
	}
}), HM = VM.actions, UM = HM.addXAxis, WM = HM.replaceXAxis, GM = HM.removeXAxis, KM = HM.addYAxis, qM = HM.replaceYAxis, JM = HM.removeYAxis;
HM.addZAxis, HM.replaceZAxis, HM.removeZAxis;
var YM = HM.updateYAxisWidth, XM = HM.updateXAxisHeight, ZM = VM.reducer, QM = H([
	H([Ql], (e) => ({
		top: e.top,
		bottom: e.bottom,
		left: e.left,
		right: e.right
	})),
	Fl,
	Il
], (e, t, n) => {
	if (e && t != null && n != null) return {
		x: e.left,
		y: e.top,
		width: Math.max(0, t - e.left - e.right),
		height: Math.max(0, n - e.top - e.bottom)
	};
}), $M = () => V(QM), eN = () => V(uE);
// ../../../peach/frontend/node_modules/recharts/es6/component/ActivePoints.js
function tN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function nN(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? tN(Object(n), !0).forEach(function(t) {
			rN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function rN(e, t, n) {
	return (t = iN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function iN(e) {
	var t = aN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function aN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var oN = (e) => {
	var t = e.point, n = e.childIndex, r = e.mainColor, i = e.activeDot, a = e.dataKey, o = e.clipPath;
	if (i === !1 || t.x == null || t.y == null) return null;
	var s = nN(nN(nN({}, {
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
	}), lt(i)), Hr(i)), c = /*#__PURE__*/ (0, P.isValidElement)(i) ? /*#__PURE__*/ (0, P.cloneElement)(i, s) : typeof i == "function" ? i(s) : /*#__PURE__*/ P.createElement(yA, s);
	return /*#__PURE__*/ P.createElement(F, {
		className: "recharts-active-dot",
		clipPath: o
	}, c);
};
function sN(e) {
	var t = e.points, n = e.mainColor, r = e.activeDot, i = e.itemDataKey, a = e.clipPath, o = e.zIndex, s = o === void 0 ? Y.activeDot : o, c = V(rE), l = eN();
	if (t == null || l == null) return null;
	var u = t.find((e) => l.includes(e.payload));
	return R(u) ? null : /*#__PURE__*/ P.createElement(sD, { zIndex: s }, /*#__PURE__*/ P.createElement(oN, {
		point: u,
		childIndex: Number(c),
		mainColor: n,
		dataKey: i,
		activeDot: r,
		clipPath: a
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/util/RadialBarUtils.js
var cN = ["option"];
function lN(e, t) {
	if (e == null) return {};
	var n, r, i = uN(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function uN(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var dN = oh;
function fN(e) {
	return typeof e == "string" ? parseInt(e, 10) : e;
}
function pN(e) {
	var t = e.option, n = lN(e, cN);
	return /*#__PURE__*/ P.createElement(Dj, {
		option: t,
		DefaultShape: dN,
		shapeProps: n
	});
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineBarSizeList.js
function mN(e, t) {
	return yN(e) || vN(e, t) || gN(e, t) || hN();
}
function hN() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function gN(e, t) {
	if (e) {
		if (typeof e == "string") return _N(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _N(e, t) : void 0;
	}
}
function _N(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function vN(e, t) {
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
function yN(e) {
	if (Array.isArray(e)) return e;
}
var bN = (e, t, n) => {
	var r = n ?? e;
	if (!R(r)) return Bt(r, t, 0);
}, xN = (e, t, n) => {
	var r = {}, i = e.filter(Tg), a = e.filter((e) => e.stackId == null), o = i.reduce((e, t) => {
		var n = e[t.stackId];
		return n ??= [], n.push(t), e[t.stackId] = n, e;
	}, r), s = Object.entries(o).map((e) => {
		var r = mN(e, 2), i = r[0], a = r[1];
		return {
			stackId: i,
			dataKeys: a.map((e) => e.dataKey),
			barSize: bN(t, n, a[0]?.barSize)
		};
	}), c = a.map((e) => ({
		stackId: void 0,
		dataKeys: [e.dataKey].filter((e) => e != null),
		barSize: bN(t, n, e.barSize)
	}));
	return [...s, ...c];
};
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/combiners/combineAllBarPositions.js
function SN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function CN(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? SN(Object(n), !0).forEach(function(t) {
			wN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : SN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function wN(e, t, n) {
	return (t = TN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function TN(e) {
	var t = EN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function EN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function DN(e, t, n, r, i) {
	var a = r.length;
	if (!(a < 1)) {
		var o = Bt(e, n, 0, !0), s, c = [];
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
			var p = Bt(t, n, 0, !0);
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
var ON = (e, t, n, r, i, a, o) => {
	var s = R(o) ? t : o, c = DN(n, r, i === a ? a : i, e, s);
	return i !== a && c != null && (c = c.map((e) => CN(CN({}, e), {}, { position: CN(CN({}, e.position), {}, { offset: e.position.offset - i / 2 }) }))), c;
}, kN = (e, t) => {
	var n = Cg(t);
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
}, AN = (e, t) => {
	if (e != null && t != null) {
		var n = e.find((e) => e.stackId === t.stackId && t.dataKey != null && e.dataKeys.includes(t.dataKey));
		if (n != null) return n.position;
	}
};
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/radialBarSelectors.js
function jN(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function MN(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? jN(Object(n), !0).forEach(function(t) {
			NN(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jN(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function NN(e, t, n) {
	return (t = PN(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function PN(e) {
	var t = FN(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function FN(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var IN = H([(e, t) => fg(e, t), (e, t) => AA(e, "radiusAxis", t)], (e, t) => {
	if (e != null && t != null) return MN(MN({}, e), {}, { scale: t });
}), LN = (e, t) => PA(e, "radiusAxis", t, !1), RN = H([(e, t, n) => dg(e, n), (e, t, n) => AA(e, "angleAxis", n)], (e, t) => {
	if (e != null && t != null) return MN(MN({}, e), {}, { scale: t });
}), zN = (e, t, n) => MA(e, "angleAxis", n, !1), BN = H([bA, (e, t, n, r) => r], (e, t) => {
	if (e.some((e) => e.type === "radialBar" && t.dataKey === e.dataKey && t.stackId === e.stackId)) return t;
}), VN = H([
	q,
	IN,
	LN,
	RN,
	zN
], (e, t, n, r, i) => hl(e, "radiusAxis") ? Al(t, n, !1) : Al(r, i, !1)), HN = H([
	RN,
	IN,
	q
], (e, t, n) => {
	var r = n === "radial" ? e : t;
	if (r != null && r.scale != null) return wl({ numericAxis: r });
}), UN = (e, t, n, r, i) => i, WN = (e, t, n, r, i) => n, GN = (e, t, n, r, i) => t, KN = (e, t, n, r, i) => r.maxBarSize, qN = (e) => e.type === "radialBar", JN = H([H([
	H([
		H([
			q,
			bA,
			WN,
			GN
		], (e, t, n, r) => t.filter((t) => e === "centric" ? t.angleAxisId === n : t.radiusAxisId === r).filter((e) => e.hide === !1).filter(qN)),
		Kh,
		() => void 0
	], xN),
	Uh,
	Wh,
	Gh,
	H([
		q,
		Uh,
		RN,
		zN,
		IN,
		LN,
		KN
	], (e, t, n, r, i, a, o) => {
		var s = R(o) ? t : o;
		return e === "centric" ? Al(n, r, !0) ?? s ?? 0 : Al(i, a, !0) ?? s ?? 0;
	}),
	VN,
	KN
], ON), BN], AN), YN = H([xA], (e) => e.filter(qN).filter(Tg)), XN = H([
	H([
		YN,
		fh,
		lC
	], wg),
	YN,
	qh,
	Jh
], fC), ZN = H([
	RN,
	zN,
	IN,
	LN,
	dh,
	BN,
	VN,
	q,
	HN,
	xg,
	UN,
	JN,
	H([(e, t, n) => q(e) === "centric" ? XN(e, "radiusAxis", t) : XN(e, "angleAxis", n), BN], kN)
], (e, t, n, r, i, a, o, s, c, l, u, d, f) => {
	var p = i.chartData, m = i.dataStartIndex, h = i.dataEndIndex;
	if (a == null || n == null || e == null || p == null || o == null || d == null || s !== "centric" && s !== "radial" || r == null || l == null) return [];
	var g = a.dataKey, _ = a.minPointSize, v = l.cx, y = l.cy, b = l.startAngle, x = l.endAngle;
	return SP({
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
}), QN = H([fh, (e, t) => t], (e, t) => {
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
function $N(e, t) {
	return e && typeof e == "object" && "zIndex" in e && typeof e.zIndex == "number" && G(e.zIndex) ? e.zIndex : t;
}
// ../../../peach/frontend/node_modules/recharts/es6/polar/RadialBar.js
var eP = [
	"shape",
	"activeShape",
	"cornerRadius",
	"id"
], tP = [
	"onMouseEnter",
	"onClick",
	"onMouseLeave"
], nP = ["value", "background"];
function rP() {
	return rP = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, rP.apply(null, arguments);
}
function iP(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function aP(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? iP(Object(n), !0).forEach(function(t) {
			oP(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : iP(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function oP(e, t, n) {
	return (t = sP(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function sP(e) {
	var t = cP(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function cP(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function lP(e, t) {
	if (e == null) return {};
	var n, r, i = uP(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function uP(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var dP = [];
function fP(e) {
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
	return /*#__PURE__*/ P.createElement(nA, { value: t ? i : void 0 }, r);
}
function pP(e) {
	var t = e.sectors, n = e.allOtherRadialBarProps, r = e.showLabels, i = e.animationElapsedTime, a = e.isAnimating, o = e.isEntrance, s = n.shape, c = n.activeShape, l = n.cornerRadius, u = n.id, d = lP(n, eP), f = ct(d), p = V(rE), m = n.onMouseEnter, h = n.onClick, g = n.onMouseLeave, _ = lP(n, tP), v = Oj(m, n.dataKey, u), y = kj(g), b = Aj(h, n.dataKey, u);
	return t == null ? null : /*#__PURE__*/ P.createElement(fP, {
		showLabels: r,
		sectors: t
	}, t.map((e, t) => {
		var n = !!(c && p === String(t)), r = v(e, t), u = y(e, t), m = b(e, t), h = aP(aP(aP(aP({}, f), {}, { cornerRadius: fN(l) }, e), Wr(_, e, t)), {}, {
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
		return n ? /*#__PURE__*/ P.createElement(sD, {
			zIndex: Y.activeBar,
			key: `sector-${e.cx}-${e.cy}-${e.innerRadius}-${e.outerRadius}-${e.startAngle}-${e.endAngle}-${t}`
		}, /*#__PURE__*/ P.createElement(pN, h)) : /*#__PURE__*/ P.createElement(pN, rP({ key: `sector-${e.cx}-${e.cy}-${e.innerRadius}-${e.outerRadius}-${e.startAngle}-${e.endAngle}-${t}` }, h));
	}), /*#__PURE__*/ P.createElement(oA, { label: n.label }), n.children);
}
var mP = (e, t) => e == null ? [] : t === 1 ? e.flatMap((e) => e.status === "removed" ? [] : [e.next]) : e.flatMap((e) => e.status === "removed" ? [] : e.status === "matched" ? [aP(aP({}, e.next), {}, {
	startAngle: L(e.prev.startAngle, e.next.startAngle, t),
	endAngle: L(e.prev.endAngle, e.next.endAngle, t)
})] : [aP(aP({}, e.next), {}, { endAngle: L(e.next.startAngle, e.next.endAngle, t) })]);
function hP(e) {
	var t = e.props, n = e.previousSectorsRef, r = t.sectors, i = t.isAnimationActive, a = t.animationBegin, o = t.animationDuration, s = t.animationEasing, c = t.onAnimationStart, l = t.onAnimationEnd, u = tM(c, l), d = u.isAnimating, f = u.handleAnimationStart, p = u.handleAnimationEnd, m = qu();
	return m == null ? null : /*#__PURE__*/ P.createElement(nM, {
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
	}, (e, n, r) => /*#__PURE__*/ P.createElement(pP, {
		sectors: e,
		allOtherRadialBarProps: t,
		showLabels: !d,
		animationElapsedTime: n,
		isAnimating: d || n < 1,
		isEntrance: r
	}));
}
function gP(e) {
	var t = (0, P.useRef)(null);
	return /*#__PURE__*/ P.createElement(hP, {
		props: e,
		previousSectorsRef: t
	});
}
function _P(e) {
	var t = V((t) => QN(t, e.legendType));
	return /*#__PURE__*/ P.createElement(Nj, { legendPayload: t ?? [] });
}
var vP = /*#__PURE__*/ P.memo((e) => {
	var t = e.dataKey, n = e.sectors, r = e.stroke, i = e.strokeWidth, a = e.name, o = e.hide, s = e.fill, c = e.tooltipType, l = e.formatter, u = {
		dataDefinedOnItem: n,
		getPosition: Gt,
		settings: {
			graphicalItemId: e.id,
			stroke: r,
			strokeWidth: i,
			fill: s,
			nameKey: void 0,
			dataKey: t,
			name: Ml(a, t),
			hide: o,
			type: c,
			color: s,
			unit: "",
			formatter: l
		}
	};
	return /*#__PURE__*/ P.createElement(jj, { tooltipEntrySettings: u });
}), yP = class extends P.PureComponent {
	renderBackground(e) {
		if (e == null) return null;
		var t = this.props.cornerRadius, n = lt(this.props.background);
		return /*#__PURE__*/ P.createElement(sD, { zIndex: $N(this.props.background, Y.barBackground) }, e.map((e, r) => {
			e.value;
			var i = e.background, a = lP(e, nP);
			if (!i) return null;
			var o = aP(aP(aP(aP(aP({ cornerRadius: fN(t) }, a), {}, { fill: "#eee" }, i), n), Wr(this.props, e, r)), {}, {
				index: r,
				className: N("recharts-radial-bar-background-sector", String(n?.className)),
				option: i,
				isActive: !1
			});
			return /*#__PURE__*/ P.createElement(pN, rP({ key: `background-${a.cx}-${a.cy}-${a.innerRadius}-${a.outerRadius}-${a.startAngle}-${a.endAngle}-${r}` }, o));
		}));
	}
	render() {
		var e = this.props, t = e.hide, n = e.sectors, r = e.className, i = e.background;
		if (t) return null;
		var a = N("recharts-area", r);
		return /*#__PURE__*/ P.createElement(sD, { zIndex: this.props.zIndex }, /*#__PURE__*/ P.createElement(F, { className: a }, i && /*#__PURE__*/ P.createElement(F, { className: "recharts-radial-bar-background" }, this.renderBackground(n)), /*#__PURE__*/ P.createElement(F, { className: "recharts-radial-bar-sectors" }, /*#__PURE__*/ P.createElement(gP, this.props))));
	}
};
function bP(e) {
	var t = P.useMemo(() => hj(e.children, sO), [e.children]), n = P.useMemo(() => ({
		data: void 0,
		hide: !1,
		id: e.id,
		dataKey: e.dataKey,
		minPointSize: e.minPointSize,
		stackId: xl(e.stackId),
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
	]), r = V((r) => ZN(r, e.radiusAxisId, e.angleAxisId, n, t)) ?? dP;
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(vP, {
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
	}), /*#__PURE__*/ P.createElement(yP, rP({}, e, { sectors: r })));
}
var xP = {
	angleAxisId: 0,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	animationMatchBy: Vj,
	animationInterpolateFn: mP,
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
	shape: dN,
	zIndex: Y.bar
};
function SP(e) {
	var t = e.displayedData, n = e.stackedData, r = e.dataStartIndex, i = e.stackedDomain, a = e.dataKey, o = e.baseValue, s = e.layout, c = e.radiusAxis, l = e.radiusAxisTicks, u = e.bandSize, d = e.pos, f = e.angleAxis, p = e.minPointSize, m = e.cx, h = e.cy, g = e.angleAxisTicks, _ = e.cells, v = e.startAngle, y = e.endAngle;
	return g == null || l == null ? dP : (t ?? []).map((e, t) => {
		var b, x, S, C, w, T;
		if (n ? b = vl(n[r + t], i) : (b = K(e, a), Array.isArray(b) || (b = [o, b])), s === "radial") {
			if (C = f.scale.map(b[0]) ?? v, w = f.scale.map(b[1]) ?? y, x = Cl({
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
					var D = Pt(E || p) * (Math.abs(p) - Math.abs(E));
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
		} else if (x = c.scale.map(b[0]), S = c.scale.map(b[1]), C = Cl({
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
				var k = Pt(O || p) * (Math.abs(p) - Math.abs(O));
				S += k;
			}
		}
		return aP(aP(aP({}, e), T), {}, {
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
function CP(e) {
	var t = Xr(e, xP);
	return /*#__PURE__*/ P.createElement(fM, {
		id: t.id,
		type: "radialBar"
	}, (e) => /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(CM, {
		type: "radialBar",
		id: e,
		data: void 0,
		dataKey: t.dataKey,
		hide: t.hide ?? xP.hide,
		angleAxisId: t.angleAxisId ?? xP.angleAxisId,
		radiusAxisId: t.radiusAxisId ?? xP.radiusAxisId,
		stackId: xl(t.stackId),
		barSize: t.barSize,
		minPointSize: t.minPointSize,
		maxBarSize: t.maxBarSize
	}), /*#__PURE__*/ P.createElement(_P, t), /*#__PURE__*/ P.createElement(bP, rP({}, t, { id: e }))));
}
CP.displayName = "RadialBar";
// ../../../peach/frontend/node_modules/recharts/es6/context/chartDataContext.js
var wP = (e) => {
	var t = e.chartData, n = B(), r = nu();
	return (0, P.useEffect)(() => r ? () => {} : (n(AD(t)), () => {
		n(AD(void 0));
	}), [
		t,
		n,
		r
	]), null;
}, TP = {
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
}, EP = fc({
	name: "brush",
	initialState: TP,
	reducers: { setBrushSettings(e, t) {
		return t.payload == null ? TP : t.payload;
	} }
});
EP.actions.setBrushSettings;
var DP = EP.reducer, OP = (e, t) => {
	var n = e.x, r = e.y, i = t.x, a = t.y;
	return {
		x: Math.min(n, i),
		y: Math.min(r, a),
		width: Math.abs(i - n),
		height: Math.abs(a - r)
	};
}, kP = (e) => {
	var t = e.x1, n = e.y1, r = e.x2, i = e.y2;
	return OP({
		x: t,
		y: n
	}, {
		x: r,
		y: i
	});
};
function AP(e) {
	return (e % 180 + 180) % 180;
}
var jP = function(e) {
	var t = e.width, n = e.height, r = AP(arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0) * Math.PI / 180, i = Math.atan(n / t), a = r > i && r < Math.PI - i ? n / Math.sin(r) : t / Math.cos(r);
	return Math.abs(a);
}, MP = fc({
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
			var n = Rs(e).dots.findIndex((e) => e === t.payload);
			n !== -1 && e.dots.splice(n, 1);
		},
		addArea: (e, t) => {
			e.areas.push(t.payload);
		},
		removeArea: (e, t) => {
			var n = Rs(e).areas.findIndex((e) => e === t.payload);
			n !== -1 && e.areas.splice(n, 1);
		},
		addLine: (e, t) => {
			e.lines.push(U(t.payload));
		},
		removeLine: (e, t) => {
			var n = Rs(e).lines.findIndex((e) => e === t.payload);
			n !== -1 && e.lines.splice(n, 1);
		}
	}
}), NP = MP.actions;
NP.addDot, NP.removeDot, NP.addArea, NP.removeArea;
var PP = NP.addLine, FP = NP.removeLine, IP = MP.reducer;
// ../../../peach/frontend/node_modules/recharts/es6/container/ClipPathProvider.js
function LP(e, t) {
	return HP(e) || VP(e, t) || zP(e, t) || RP();
}
function RP() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function zP(e, t) {
	if (e) {
		if (typeof e == "string") return BP(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? BP(e, t) : void 0;
	}
}
function BP(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function VP(e, t) {
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
function HP(e) {
	if (Array.isArray(e)) return e;
}
var UP = /*#__PURE__*/ (0, P.createContext)(void 0), WP = (e) => {
	var t = e.children, n = LP((0, P.useState)(`${zt("recharts")}-clip`), 1)[0], r = $M();
	if (r == null) return null;
	var i = r.x, a = r.y, o = r.width, s = r.height;
	return /*#__PURE__*/ P.createElement(UP.Provider, { value: n }, /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement("clipPath", { id: n }, /*#__PURE__*/ P.createElement("rect", {
		x: i,
		y: a,
		height: s,
		width: o
	}))), t);
}, GP = () => (0, P.useContext)(UP), KP = class {
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
function qP(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function JP(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? qP(Object(n), !0).forEach(function(t) {
			YP(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qP(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function YP(e, t, n) {
	return (t = XP(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function XP(e) {
	var t = ZP(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function ZP(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function QP() {
	return QP = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, QP.apply(null, arguments);
}
var $P = (e, t) => {
	var n;
	if (/*#__PURE__*/ P.isValidElement(e)) n = /*#__PURE__*/ P.cloneElement(e, t);
	else if (typeof e == "function") n = e(t);
	else {
		if (!G(t.x1) || !G(t.y1) || !G(t.x2) || !G(t.y2)) return null;
		n = /*#__PURE__*/ P.createElement("line", QP({}, t, { className: "recharts-reference-line-line" }));
	}
	return n;
}, eF = (e, t, n, r, i, a) => {
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
}, tF = (e, t, n, r, i, a) => {
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
}, nF = (e, t, n, r) => {
	var i = [r.mapWithFallback(e[0], {
		position: n,
		fallback: "rangeMin"
	}), r.mapWithFallback(e[1], {
		position: n,
		fallback: "rangeMax"
	})];
	return t === "discard" && i.some((e) => !r.isInRange(e)) ? null : i;
}, rF = (e, t, n, r, i, a, o) => {
	var s = o.x, c = o.y, l = o.segment, u = o.ifOverflow, d = Lt(s);
	return Lt(c) ? eF(c, u, r, a, t, n) : d ? tF(s, u, r, i, e, n) : l != null && l.length === 2 ? nF(l, u, r, new KP({
		x: e,
		y: t
	})) : null;
};
function iF(e) {
	var t = B();
	return (0, P.useEffect)(() => (t(PP(e)), () => {
		t(FP(e));
	})), null;
}
function aF(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.shape, i = e.className, a = e.ifOverflow, o = nu(), s = GP(), c = V((e) => jS(e, t)), l = V((e) => PS(e, n)), u = V((e) => uw(e, "xAxis", t, o)), d = V((e) => uw(e, "yAxis", n, o)), f = Ru();
	if (!s || !f || c == null || l == null || u == null || d == null) return null;
	var p = rF(u, d, f, e.position, c.orientation, l.orientation, e);
	if (!p) return null;
	var m = p[0], h = p[1];
	if (m == null || h == null) return null;
	var g = m.x, _ = m.y, v = h.x, y = h.y, b = JP(JP({ clipPath: a === "hidden" ? `url(#${s})` : void 0 }, ut(e)), {}, {
		x1: g,
		y1: _,
		x2: v,
		y2: y
	}), x = kP({
		x1: g,
		y1: _,
		x2: v,
		y2: y
	});
	return /*#__PURE__*/ P.createElement(sD, { zIndex: e.zIndex }, /*#__PURE__*/ P.createElement(F, { className: N("recharts-reference-line", i) }, $P(r, b), /*#__PURE__*/ P.createElement(Mk, QP({}, x, {
		lowerWidth: x.width,
		upperWidth: x.width
	}), /*#__PURE__*/ P.createElement(Kk, { label: e.label }), e.children)));
}
var oF = {
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
function sF(e) {
	var t = Xr(e, oF);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(iF, {
		yAxisId: t.yAxisId,
		xAxisId: t.xAxisId,
		ifOverflow: t.ifOverflow,
		x: t.x,
		y: t.y,
		segment: t.segment
	}), /*#__PURE__*/ P.createElement(aF, t));
}
sF.displayName = "ReferenceLine";
// ../../../peach/frontend/node_modules/es-toolkit/dist/function/noop.mjs
function cF() {}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isPlainObject.mjs
function lF(e) {
	if (!e || typeof e != "object") return !1;
	let t = Object.getPrototypeOf(e);
	return t !== null && t !== Object.prototype && Object.getPrototypeOf(t) !== null ? !1 : Object.prototype.toString.call(e) === "[object Object]";
}
// ../../../peach/frontend/node_modules/es-toolkit/dist/predicate/isEqualWith.mjs
function uF(e, t, n) {
	return dF(e, t, void 0, void 0, void 0, void 0, n);
}
function dF(e, t, n, r, i, a, o) {
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
		case "object": return fF(e, t, a, o);
	}
	return fF(e, t, a, o);
}
function fF(e, t, n, r) {
	if (Object.is(e, t)) return !0;
	let i = vi(e), a = vi(t);
	if (i === "[object Arguments]" && (i = ji), a === "[object Arguments]" && (a = ji), i !== a) return !1;
	switch (i) {
		case bi: return e.toString() === t.toString();
		case xi: return Qi(e.valueOf(), t.valueOf());
		case Si:
		case Ti:
		case wi: return Object.is(e.valueOf(), t.valueOf());
		case yi: return e.source === t.source && e.flags === t.flags;
		case ki: return e === t;
	}
	n ??= /* @__PURE__ */ new Map();
	let o = n.get(e), s = n.get(t);
	if (o != null && s != null) return o === t;
	n.set(e, t), n.set(t, e);
	try {
		switch (i) {
			case Ei:
				if (e.size !== t.size) return !1;
				for (let [i, a] of e.entries()) if (!t.has(i) || !dF(a, t.get(i), i, e, t, n, r)) return !1;
				return !0;
			case Di: {
				if (e.size !== t.size) return !1;
				let i = Array.from(e.values()), a = Array.from(t.values());
				for (let o = 0; o < i.length; o++) {
					let s = i[o], c = a.findIndex((i) => dF(s, i, void 0, e, t, n, r));
					if (c === -1) return !1;
					a.splice(c, 1);
				}
				return !0;
			}
			case Oi:
			case Pi:
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
				if (Ki(e) !== Ki(t) || e.length !== t.length) return !1;
				for (let i = 0; i < e.length; i++) if (!dF(e[i], t[i], i, e, t, n, r)) return !1;
				return !0;
			case Ai: return e.byteLength === t.byteLength && fF(new Uint8Array(e), new Uint8Array(t), n, r);
			case Ni: return e.byteLength !== t.byteLength || e.byteOffset !== t.byteOffset ? !1 : fF(new Uint8Array(e), new Uint8Array(t), n, r);
			case Mi: return e.name === t.name && e.message === t.message;
			case ji: {
				if (!(fF(e.constructor, t.constructor, n, r) || lF(e) && lF(t))) return !1;
				let i = [...Object.keys(e), ..._i(e)], a = [...Object.keys(t), ..._i(t)];
				if (i.length !== a.length) return !1;
				for (let a = 0; a < i.length; a++) {
					let o = i[a], s = e[o];
					if (!Object.hasOwn(t, o)) return !1;
					let c = t[o];
					if (!dF(s, c, o, e, t, n, r)) return !1;
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
function pF(e, t) {
	return uF(e, t, cF);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/getEveryNth.js
function mF(e, t) {
	if (t < 1) return [];
	if (t === 1) return e;
	for (var n = [], r = 0; r < e.length; r += t) {
		var i = e[r];
		i !== void 0 && n.push(i);
	}
	return n;
}
// ../../../peach/frontend/node_modules/recharts/es6/util/TickUtils.js
function hF(e, t, n) {
	return jP({
		width: e.width + t.width,
		height: e.height + t.height
	}, n);
}
function gF(e, t, n) {
	var r = n === "width", i = e.x, a = e.y, o = e.width, s = e.height;
	return t === 1 ? {
		start: r ? i : a,
		end: r ? i + o : a + s
	} : {
		start: r ? i + o : a + s,
		end: r ? i : a
	};
}
function _F(e, t, n, r, i) {
	if (e * t < e * r || e * t > e * i) return !1;
	var a = n();
	return e * (t - e * a / 2 - r) >= 0 && e * (t + e * a / 2 - i) <= 0;
}
function vF(e, t) {
	return mF(e, t + 1);
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/getEquidistantTicks.js
function yF(e, t, n, r, i) {
	for (var a = (r || []).slice(), o = t.start, s = t.end, c = 0, l = 1, u = o, d = function() {
		var t = r?.[c];
		if (t === void 0) return { v: mF(r, l) };
		var a = c, d, f = () => (d === void 0 && (d = n(t, a)), d), p = t.coordinate, m = c === 0 || _F(e, p, f, u, s);
		m || (c = 0, u = o, l += 1), m && (u = p + e * (f() / 2 + i), c += l);
	}, f; l <= a.length;) if (f = d(), f) return f.v;
	return [];
}
function bF(e, t, n, r, i) {
	var a = (r || []).slice().length;
	if (a === 0) return [];
	for (var o = t.start, s = t.end, c = 1; c <= a; c++) {
		for (var l = (a - 1) % c, u = o, d = !0, f = function() {
			var t = r[m];
			if (t == null) return 0;
			var a = m, o, c = () => (o === void 0 && (o = n(t, a)), o), f = t.coordinate, p = m === l || _F(e, f, c, u, s);
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
function xF(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function SF(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? xF(Object(n), !0).forEach(function(t) {
			CF(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xF(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function CF(e, t, n) {
	return (t = wF(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function wF(e) {
	var t = TF(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function TF(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function EF(e, t, n, r, i) {
	for (var a = (r || []).slice(), o = a.length, s = t.start, c = t.end, l = function(t) {
		var r = a[t];
		if (r == null) return 1;
		var l = r, u, d = () => (u === void 0 && (u = n(r, t)), u);
		if (t === o - 1) {
			var f = e * (l.coordinate + e * d() / 2 - c);
			a[t] = l = SF(SF({}, l), {}, { tickCoord: f > 0 ? l.coordinate - f * e : l.coordinate });
		} else a[t] = l = SF(SF({}, l), {}, { tickCoord: l.coordinate });
		l.tickCoord != null && _F(e, l.tickCoord, d, s, c) && (c = l.tickCoord - e * (d() / 2 + i), a[t] = SF(SF({}, l), {}, { isShow: !0 }));
	}, u = o - 1; u >= 0; u--) if (l(u)) continue;
	return a;
}
function DF(e, t, n, r, i, a) {
	var o = (r || []).slice(), s = o.length, c = t.start, l = t.end;
	if (a) {
		var u = r[s - 1];
		if (u != null) {
			var d = n(u, s - 1), f = e * (u.coordinate + e * d / 2 - l);
			o[s - 1] = u = SF(SF({}, u), {}, { tickCoord: f > 0 ? u.coordinate - f * e : u.coordinate }), u.tickCoord != null && _F(e, u.tickCoord, () => d, c, l) && (l = u.tickCoord - e * (d / 2 + i), o[s - 1] = SF(SF({}, u), {}, { isShow: !0 }));
		}
	}
	for (var p = a ? s - 1 : s, m = function(t) {
		var r = o[t];
		if (r == null) return 1;
		var a = r, s, u = () => (s === void 0 && (s = n(r, t)), s);
		if (t === 0) {
			var d = e * (a.coordinate - e * u() / 2 - c);
			o[t] = a = SF(SF({}, a), {}, { tickCoord: d < 0 ? a.coordinate - d * e : a.coordinate });
		} else o[t] = a = SF(SF({}, a), {}, { tickCoord: a.coordinate });
		a.tickCoord != null && _F(e, a.tickCoord, u, c, l) && (c = a.tickCoord + e * (u() / 2 + i), o[t] = SF(SF({}, a), {}, { isShow: !0 }));
	}, h = 0; h < p; h++) if (m(h)) continue;
	return o;
}
function OF(e, t, n) {
	var r = e.tick, i = e.ticks, a = e.viewBox, o = e.minTickGap, s = e.orientation, c = e.interval, l = e.tickFormatter, u = e.unit, d = e.angle;
	if (!i || !i.length || !r) return [];
	if (I(c) || Sf.isSsr) return vF(i, I(c) ? c : 0) ?? [];
	var f = [], p = s === "top" || s === "bottom" ? "width" : "height", m = u && p === "width" ? CO(u, {
		fontSize: t,
		letterSpacing: n
	}) : {
		width: 0,
		height: 0
	}, h = (e, r) => {
		var i = typeof l == "function" ? l(e.value, r) : e.value;
		return p === "width" ? hF(CO(i, {
			fontSize: t,
			letterSpacing: n
		}), m, d) : CO(i, {
			fontSize: t,
			letterSpacing: n
		})[p];
	}, g = i[0], _ = i[1], v = i.length >= 2 && g != null && _ != null ? Pt(_.coordinate - g.coordinate) : 1, y = gF(a, v, p);
	return c === "equidistantPreserveStart" ? yF(v, y, h, i, o) : c === "equidistantPreserveEnd" ? bF(v, y, h, i, o) : (f = c === "preserveStart" || c === "preserveStartEnd" ? DF(v, y, h, i, o, c === "preserveStartEnd") : EF(v, y, h, i, o), f.filter((e) => e.isShow));
}
// ../../../peach/frontend/node_modules/recharts/es6/util/YAxisUtils.js
var kF = (e) => {
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
}, AF = (e) => {
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
}, jF = fc({
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
}), MF = jF.actions, NF = MF.setRenderedTicks, PF = MF.removeRenderedTicks, FF = jF.reducer, IF = [
	"axisLine",
	"width",
	"height",
	"className",
	"hide",
	"ticks",
	"axisType",
	"axisId"
];
function LF(e, t) {
	return HF(e) || VF(e, t) || zF(e, t) || RF();
}
function RF() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function zF(e, t) {
	if (e) {
		if (typeof e == "string") return BF(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? BF(e, t) : void 0;
	}
}
function BF(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function VF(e, t) {
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
function HF(e) {
	if (Array.isArray(e)) return e;
}
function UF(e, t) {
	if (e == null) return {};
	var n, r, i = WF(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function WF(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function GF() {
	return GF = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, GF.apply(null, arguments);
}
function KF(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function qF(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? KF(Object(n), !0).forEach(function(t) {
			JF(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : KF(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function JF(e, t, n) {
	return (t = YF(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function YF(e) {
	var t = XF(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function XF(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var ZF = {
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
function QF(e) {
	var t = e.x, n = e.y, r = e.width, i = e.height, a = e.orientation, o = e.mirror, s = e.axisLine, c = e.otherSvgProps;
	if (!s) return null;
	var l = qF(qF(qF({}, c), ct(s)), {}, { fill: "none" });
	if (a === "top" || a === "bottom") {
		var u = +(a === "top" && !o || a === "bottom" && o);
		l = qF(qF({}, l), {}, {
			x1: t,
			y1: n + u * i,
			x2: t + r,
			y2: n + u * i
		});
	} else {
		var d = +(a === "left" && !o || a === "right" && o);
		l = qF(qF({}, l), {}, {
			x1: t + d * r,
			y1: n,
			x2: t + d * r,
			y2: n + i
		});
	}
	return /*#__PURE__*/ P.createElement("line", GF({}, l, { className: N("recharts-cartesian-axis-line", kt(s, "className")) }));
}
function $F(e, t, n, r, i, a, o, s, c) {
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
function eI(e, t) {
	switch (e) {
		case "left": return t ? "start" : "end";
		case "right": return t ? "end" : "start";
		default: return "middle";
	}
}
function tI(e, t) {
	switch (e) {
		case "left":
		case "right": return "middle";
		case "top": return t ? "start" : "end";
		default: return t ? "end" : "start";
	}
}
function nI(e) {
	var t = e.option, n = e.tickProps, r = e.value, i, a = N(n.className, "recharts-cartesian-axis-tick-value");
	if (/*#__PURE__*/ P.isValidElement(t)) i = /*#__PURE__*/ P.cloneElement(t, qF(qF({}, n), {}, { className: a }));
	else if (typeof t == "function") i = t(qF(qF({}, n), {}, { className: a }));
	else {
		var o = "recharts-cartesian-axis-tick-value";
		typeof t != "boolean" && (o = N(o, BA(t))), i = /*#__PURE__*/ P.createElement(bk, GF({}, n, { className: o }), r);
	}
	return i;
}
function rI(e) {
	var t = e.ticks, n = e.axisType, r = e.axisId, i = B(), a = (0, P.useRef)(null);
	return (0, P.useEffect)(() => {
		if (r != null && n != null) {
			var e = t.map((e) => ({
				value: e.value,
				coordinate: e.coordinate,
				offset: e.offset,
				index: e.index
			})), o = a.current;
			o != null && o.axisId === r && o.axisType === n && pF(o.ticks, e) || (a.current = {
				ticks: e,
				axisId: r,
				axisType: n
			}, i(NF({
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
	]), (0, P.useEffect)(() => r == null || n == null ? Gt : () => {
		i(PF({
			axisId: r,
			axisType: n
		}));
	}, [
		i,
		r,
		n
	]), null;
}
var iI = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.ticks, r = n === void 0 ? [] : n, i = e.tick, a = e.tickLine, o = e.stroke, s = e.tickFormatter, c = e.unit, l = e.padding, u = e.tickTextProps, d = e.orientation, f = e.mirror, p = e.x, m = e.y, h = e.width, g = e.height, _ = e.tickSize, v = e.tickMargin, y = e.fontSize, b = e.letterSpacing, x = e.getTicksConfig, S = e.events, C = e.axisType, w = e.axisId, T = OF(qF(qF({}, x), {}, { ticks: r }), y, b), E = ct(x), D = lt(i), O = lk(E.textAnchor) ? E.textAnchor : eI(d, f), k = tI(d, f), A = {};
	typeof a == "object" && (A = a);
	var j = qF(qF({}, E), {}, { fill: "none" }, A), M = T.map((e) => qF({ entry: e }, $F(e, p, m, h, g, d, _, f, v))), ee = M.map((e) => {
		var t = e.entry, n = e.line;
		return /*#__PURE__*/ P.createElement(F, {
			className: "recharts-cartesian-axis-tick",
			key: `tick-${t.value}-${t.coordinate}-${t.tickCoord}`
		}, a && /*#__PURE__*/ P.createElement("line", GF({}, j, n, { className: N("recharts-cartesian-axis-tick-line", kt(a, "className")) })));
	}), te = M.map((e, t) => {
		var n = e.entry, r = e.tick, a = qF(qF({}, qF(qF(qF(qF({ verticalAnchor: k }, E), {}, {
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
		return /*#__PURE__*/ P.createElement(F, GF({
			className: "recharts-cartesian-axis-tick-label",
			key: `tick-label-${n.value}-${n.coordinate}-${n.tickCoord}`
		}, Wr(S, n, t)), i && /*#__PURE__*/ P.createElement(nI, {
			option: i,
			tickProps: a,
			value: `${typeof s == "function" ? s(n.value, t) : n.value}${c || ""}`
		}));
	});
	return /*#__PURE__*/ P.createElement("g", { className: `recharts-cartesian-axis-ticks recharts-${C}-ticks` }, /*#__PURE__*/ P.createElement(rI, {
		ticks: T,
		axisId: w,
		axisType: C
	}), te.length > 0 && /*#__PURE__*/ P.createElement(sD, { zIndex: Y.label }, /*#__PURE__*/ P.createElement("g", {
		className: `recharts-cartesian-axis-tick-labels recharts-${C}-tick-labels`,
		ref: t
	}, te)), ee.length > 0 && /*#__PURE__*/ P.createElement("g", { className: `recharts-cartesian-axis-tick-lines recharts-${C}-tick-lines` }, ee));
}), aI = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.axisLine, r = e.width, i = e.height, a = e.className, o = e.hide, s = e.ticks, c = e.axisType, l = e.axisId, u = UF(e, IF), d = LF((0, P.useState)(""), 2), f = d[0], p = d[1], m = LF((0, P.useState)(""), 2), h = m[0], g = m[1], _ = (0, P.useRef)(null);
	(0, P.useImperativeHandle)(t, () => ({
		getCalculatedWidth: () => kF({
			ticks: _.current,
			label: e.labelRef?.current,
			labelGapWithTick: 5,
			tickSize: e.tickSize,
			tickMargin: e.tickMargin
		}),
		getCalculatedHeight: () => AF({
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
	return o || r != null && r <= 0 || i != null && i <= 0 ? null : /*#__PURE__*/ P.createElement(sD, { zIndex: e.zIndex }, /*#__PURE__*/ P.createElement(F, { className: N("recharts-cartesian-axis", a) }, /*#__PURE__*/ P.createElement(QF, {
		x: e.x,
		y: e.y,
		width: r,
		height: i,
		orientation: e.orientation,
		mirror: e.mirror,
		axisLine: n,
		otherSvgProps: ct(e)
	}), /*#__PURE__*/ P.createElement(iI, {
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
	}), /*#__PURE__*/ P.createElement(Mk, {
		x: e.x,
		y: e.y,
		width: e.width,
		height: e.height,
		lowerWidth: e.width,
		upperWidth: e.width
	}, /*#__PURE__*/ P.createElement(Kk, {
		label: e.label,
		labelRef: e.labelRef
	}), e.children)));
}), oI = /*#__PURE__*/ P.forwardRef((e, t) => {
	var n = Xr(e, ZF);
	return /*#__PURE__*/ P.createElement(aI, GF({}, n, { ref: t }));
});
oI.displayName = "CartesianAxis";
// ../../../peach/frontend/node_modules/recharts/es6/theme/RechartsThemeContext.js
var sI = /*#__PURE__*/ (0, P.createContext)({ grid: {
	stroke: "#ccc",
	fill: "none"
} });
sI.Provider;
var cI = () => (0, P.useContext)(sI), lI = [
	"x1",
	"y1",
	"x2",
	"y2",
	"key"
], uI = ["offset"], dI = ["xAxisId", "yAxisId"], fI = ["xAxisId", "yAxisId"];
function pI(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function mI(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? pI(Object(n), !0).forEach(function(t) {
			hI(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pI(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function hI(e, t, n) {
	return (t = gI(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function gI(e) {
	var t = _I(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function _I(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function vI() {
	return vI = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, vI.apply(null, arguments);
}
function yI(e, t) {
	if (e == null) return {};
	var n, r, i = bI(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function bI(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var xI = (e) => {
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
function SI(e) {
	var t = e.option, n = e.lineItemProps, r;
	if (/*#__PURE__*/ P.isValidElement(t)) r = /*#__PURE__*/ P.cloneElement(t, n);
	else if (typeof t == "function") r = t(n);
	else {
		var i = n.x1, a = n.y1, o = n.x2, s = n.y2, c = n.key, l = ct(yI(n, lI)) ?? {};
		l.offset;
		var u = yI(l, uI), d = Array.isArray(u.strokeDasharray) ? u.strokeDasharray.join(",") : u.strokeDasharray;
		r = /*#__PURE__*/ P.createElement("line", vI({}, u, {
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
function CI(e) {
	var t = e.x, n = e.width, r = e.horizontal, i = r === void 0 || r, a = e.horizontalPoints;
	if (!i || !a || !a.length) return null;
	e.xAxisId, e.yAxisId;
	var o = yI(e, dI), s = a.map((e, r) => {
		var a = mI(mI({}, o), {}, {
			x1: t,
			y1: e,
			x2: t + n,
			y2: e,
			key: `line-${r}`,
			index: r
		});
		return /*#__PURE__*/ P.createElement(SI, {
			key: `line-${r}`,
			option: i,
			lineItemProps: a
		});
	});
	return /*#__PURE__*/ P.createElement("g", { className: "recharts-cartesian-grid-horizontal" }, s);
}
function wI(e) {
	var t = e.y, n = e.height, r = e.vertical, i = r === void 0 || r, a = e.verticalPoints;
	if (!i || !a || !a.length) return null;
	e.xAxisId, e.yAxisId;
	var o = yI(e, fI), s = a.map((e, r) => {
		var a = mI(mI({}, o), {}, {
			x1: e,
			y1: t,
			x2: e,
			y2: t + n,
			key: `line-${r}`,
			index: r
		});
		return /*#__PURE__*/ P.createElement(SI, {
			option: i,
			lineItemProps: a,
			key: `line-${r}`
		});
	});
	return /*#__PURE__*/ P.createElement("g", { className: "recharts-cartesian-grid-vertical" }, s);
}
function TI(e) {
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
function EI(e) {
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
var DI = (e, t) => {
	var n = e.xAxis, r = e.width, i = e.height, a = e.offset;
	return gl(OF(mI(mI(mI({}, ZF), n), {}, {
		ticks: _l(n, !0),
		viewBox: {
			x: 0,
			y: 0,
			width: r,
			height: i
		}
	})), a.left, a.left + a.width, t);
}, OI = (e, t) => {
	var n = e.yAxis, r = e.width, i = e.height, a = e.offset;
	return gl(OF(mI(mI(mI({}, ZF), n), {}, {
		ticks: _l(n, !0),
		viewBox: {
			x: 0,
			y: 0,
			width: r,
			height: i
		}
	})), a.top, a.top + a.height, t);
}, kI = {
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
function AI(e) {
	var t = Vu(), n = Hu(), r = Bu(), i = mI(mI({}, Xr(e, kI)), {}, {
		x: I(e.x) ? e.x : r.left,
		y: I(e.y) ? e.y : r.top,
		width: I(e.width) ? e.width : r.width,
		height: I(e.height) ? e.height : r.height
	}), a = i.xAxisId, o = i.yAxisId, s = i.x, c = i.y, l = i.width, u = i.height, d = i.syncWithTicks, f = i.horizontalValues, p = i.verticalValues, m = nu(), h = V((e) => kw(e, "xAxis", a, m)), g = V((e) => kw(e, "yAxis", o, m)), _ = cI(), v = {
		stroke: i.stroke ?? _.grid.stroke,
		strokeWidth: i.strokeWidth ?? _.grid.strokeWidth,
		strokeOpacity: i.strokeOpacity ?? _.grid.strokeOpacity,
		strokeDasharray: i.strokeDasharray ?? _.grid.strokeDasharray
	};
	if (!cl(l) || !cl(u) || !I(s) || !I(c)) return null;
	var y = i.verticalCoordinatesGenerator || DI, b = i.horizontalCoordinatesGenerator || OI, x = i.horizontalPoints, S = i.verticalPoints;
	if ((!x || !x.length) && typeof b == "function") {
		var C = f && f.length, w = b({
			yAxis: g ? mI(mI({}, g), {}, { ticks: C ? f : g.ticks }) : void 0,
			width: t ?? l,
			height: n ?? u,
			offset: r
		}, C ? !0 : d);
		cu(Array.isArray(w), `horizontalCoordinatesGenerator should return Array but instead it returned [${typeof w}]`), Array.isArray(w) && (x = w);
	}
	if ((!S || !S.length) && typeof y == "function") {
		var T = p && p.length, E = y({
			xAxis: h ? mI(mI({}, h), {}, { ticks: T ? p : h.ticks }) : void 0,
			width: t ?? l,
			height: n ?? u,
			offset: r
		}, T ? !0 : d);
		cu(Array.isArray(E), `verticalCoordinatesGenerator should return Array but instead it returned [${typeof E}]`), Array.isArray(E) && (S = E);
	}
	return /*#__PURE__*/ P.createElement(sD, { zIndex: i.zIndex }, /*#__PURE__*/ P.createElement("g", { className: "recharts-cartesian-grid" }, /*#__PURE__*/ P.createElement(xI, {
		fill: i.fill ?? _.grid.fill,
		fillOpacity: i.fillOpacity ?? _.grid.fillOpacity,
		x: i.x,
		y: i.y,
		width: i.width,
		height: i.height,
		ry: i.ry
	}), /*#__PURE__*/ P.createElement(TI, vI({}, i, { horizontalPoints: x })), /*#__PURE__*/ P.createElement(EI, vI({}, i, { verticalPoints: S })), /*#__PURE__*/ P.createElement(CI, vI({}, i, v, {
		offset: r,
		horizontalPoints: x,
		xAxis: h,
		yAxis: g
	})), /*#__PURE__*/ P.createElement(wI, vI({}, i, v, {
		offset: r,
		verticalPoints: S,
		xAxis: h,
		yAxis: g
	}))));
}
AI.displayName = "CartesianGrid";
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/LineDrawShape.js
var jI = [
	"animationElapsedTime",
	"isAnimating",
	"isEntrance",
	"visibleLength",
	"strokeDasharray",
	"connectNulls"
];
function MI() {
	return MI = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, MI.apply(null, arguments);
}
function NI(e, t) {
	if (e == null) return {};
	var n, r, i = PI(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function PI(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function FI(e) {
	try {
		return e && e.getTotalLength && e.getTotalLength() || 0;
	} catch {
		return 0;
	}
}
function II(e, t) {
	return `${t}px ${e}px`;
}
function LI(e) {
	return e.length % 2 == 0 ? e : [...e, ...e];
}
function RI(e, t) {
	for (var n = [], r = 0; r < t; ++r) n.push(...e);
	return n;
}
function zI(e, t, n) {
	var r = LI(n), i = r.reduce((e, t) => e + t, 0);
	if (!i) return II(t, e);
	for (var a = Math.floor(e / i), o = e % i, s = [], c = 0, l = 0; c < r.length; l += (u = r[c]) ?? 0, ++c) {
		var u, d = r[c];
		if (d != null && l + d > o) {
			s = [...r.slice(0, c), o - l];
			break;
		}
	}
	var f = s.length % 2 == 0 ? [0, t] : [t];
	return [
		...RI(r, a),
		...s,
		...f
	].map((e) => `${e}px`).join(", ");
}
function BI(e, t, n) {
	return e ? zI(n, t, `${e}`.split(/[,\s]+/gim).map((e) => parseFloat(e))) : II(t, n);
}
function VI(e) {
	e.animationElapsedTime, e.isAnimating, e.isEntrance;
	var t = e.visibleLength, n = e.strokeDasharray, r = e.connectNulls, i = NI(e, jI), a = r ?? !1, o;
	if (t != null) {
		var s = i.pathRef;
		o = BI(n, FI(s?.current ?? null), t);
	} else n != null && (o = String(n));
	return /*#__PURE__*/ P.createElement(ap, MI({}, i, {
		connectNulls: a,
		strokeDasharray: o
	}));
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/useAnimatedLineLength.js
function HI(e) {
	var t = (0, P.useRef)(0), n = (0, P.useRef)(0), r = (0, P.useRef)(!1), i = (0, P.useRef)(e);
	return i.current !== e && (t.current = n.current, i.current = e), (0, P.useCallback)((e, i) => {
		if (r.current) return null;
		var a = Math.min(Mt(t.current + e * i), i);
		return e > 0 && i > 0 && (n.current = Math.max(n.current, a), a >= i) ? (r.current = !0, null) : a;
	}, []);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/errorBarSlice.js
var UI = fc({
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
}), WI = UI.actions;
WI.addErrorBar, WI.replaceErrorBar, WI.removeErrorBar;
var GI = UI.reducer, KI = ["children"];
function qI(e, t) {
	if (e == null) return {};
	var n, r, i = JI(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function JI(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var YI = /*#__PURE__*/ (0, P.createContext)({
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
function XI(e) {
	var t = e.children, n = qI(e, KI);
	return /*#__PURE__*/ P.createElement(YI.Provider, { value: n }, t);
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js
function ZI(e, t) {
	var n = V((t) => jS(t, e)), r = V((e) => PS(e, t)), i = n?.allowDataOverflow ?? kS.allowDataOverflow, a = r?.allowDataOverflow ?? MS.allowDataOverflow;
	return {
		needClip: i || a,
		needClipX: i,
		needClipY: a
	};
}
function QI(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.clipPathId, i = $M(), a = ZI(t, n), o = a.needClipX, s = a.needClipY, c = a.needClip, l = V((e) => rw(e, t, !1)), u = V((e) => iw(e, n, !1));
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
var $I = (e, t, n, r) => Pw(e, "xAxis", t, r), eL = (e, t, n, r) => Nw(e, "xAxis", t, r), tL = (e, t, n, r) => Pw(e, "yAxis", n, r), nL = (e, t, n, r) => Nw(e, "yAxis", n, r), rL = H([
	q,
	$I,
	tL,
	eL,
	nL
], (e, t, n, r, i) => hl(e, "xAxis") ? Al(t, r, !1) : Al(n, i, !1)), iL = (e, t, n, r, i) => i;
function aL(e) {
	return e.type === "line";
}
var oL = H([
	q,
	$I,
	tL,
	eL,
	nL,
	H([VS, iL], (e, t) => e.filter(aL).find((e) => e.id === t)),
	rL,
	ph
], (e, t, n, r, i, a, o, s) => {
	var c = s.chartData, l = s.dataStartIndex, u = s.dataEndIndex;
	if (!(a == null || t == null || n == null || r == null || i == null || r.length === 0 || i.length === 0 || o == null || e !== "horizontal" && e !== "vertical")) {
		var d = a.dataKey, f = a.data, p = f != null && f.length > 0 ? f : c?.slice(l, u + 1);
		if (p != null) return ML({
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
function sL(e) {
	var t = lt(e), n = 3, r = 2;
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
var cL = ["id"], lL = [
	"type",
	"layout",
	"connectNulls",
	"needClip",
	"shape",
	"strokeDasharray"
], uL = [
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
function dL() {
	return dL = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, dL.apply(null, arguments);
}
function fL(e, t) {
	if (e == null) return {};
	var n, r, i = pL(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function pL(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function mL(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function hL(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? mL(Object(n), !0).forEach(function(t) {
			gL(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : mL(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function gL(e, t, n) {
	return (t = _L(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function _L(e) {
	var t = vL(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function vL(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function yL(e) {
	try {
		return e && e.getTotalLength && e.getTotalLength() || 0;
	} catch {
		return 0;
	}
}
function bL(e) {
	var t = 0, n = 0;
	for (var r of e) r.status === "matched" && r.prev.x != null && r.next.x != null && (t += r.next.x - r.prev.x, n++);
	return n > 0 ? t / n : 0;
}
var xL = {
	activeDot: !0,
	animateNewValues: !0,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	animationInterpolateFn: (e, t) => {
		if (e == null) return [];
		if (t === 1) return e.flatMap((e) => e.status === "removed" ? [] : [e.next]);
		var n = bL(e), r = [];
		for (var i of e) if (i.status === "matched") r.push(hL(hL({}, i.next), {}, {
			x: L(i.prev.x, i.next.x, t),
			y: L(i.prev.y, i.next.y, t)
		}));
		else if (i.status === "added") {
			if (i.next.x != null) {
				var a = i.next.x - n;
				r.push(hL(hL({}, i.next), {}, {
					x: L(a, i.next.x, t),
					y: i.next.y
				}));
			} else r.push(i.next);
		} else if (i.status === "removed" && i.prev.x != null) {
			var o = i.prev.x + n;
			r.push(hL(hL({}, i.prev), {}, {
				x: L(i.prev.x, o, t),
				y: i.prev.y
			}));
		}
		return r;
	},
	animationMatchBy: Bj,
	connectNulls: !1,
	dot: !0,
	fill: "#fff",
	hide: !1,
	isAnimationActive: "auto",
	label: !1,
	legendType: "line",
	shape: VI,
	stroke: "#3182bd",
	strokeWidth: 1,
	xAxisId: 0,
	yAxisId: 0,
	zIndex: Y.line,
	type: "linear"
}, SL = (e) => {
	var t = e.dataKey, n = e.name, r = e.stroke, i = e.legendType;
	return [{
		inactive: e.hide,
		dataKey: t,
		type: i,
		color: r,
		value: Ml(n, t),
		payload: e
	}];
}, CL = /*#__PURE__*/ P.memo((e) => {
	var t = e.dataKey, n = e.data, r = e.stroke, i = e.strokeWidth, a = e.fill, o = e.name, s = e.hide, c = e.unit, l = e.formatter, u = e.tooltipType, d = e.id, f = {
		dataDefinedOnItem: n,
		getPosition: Gt,
		settings: {
			stroke: r,
			strokeWidth: i,
			fill: a,
			dataKey: t,
			nameKey: void 0,
			name: Ml(o, t),
			hide: s,
			type: u,
			color: r,
			unit: c,
			formatter: l,
			graphicalItemId: d
		}
	};
	return /*#__PURE__*/ P.createElement(jj, { tooltipEntrySettings: f });
});
function wL(e) {
	var t = e.clipPathId, n = e.points, r = e.props, i = r.dot, a = r.dataKey, o = r.needClip;
	r.id;
	var s = ct(fL(r, cL));
	return /*#__PURE__*/ P.createElement(FM, {
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
function TL(e) {
	var t = e.showLabels, n = e.children, r = e.points, i = (0, P.useMemo)(() => r?.map((e) => {
		var t = {
			x: e.x ?? 0,
			y: e.y ?? 0,
			width: 0,
			lowerWidth: 0,
			upperWidth: 0,
			height: 0
		};
		return hL(hL({}, t), {}, {
			value: e.value,
			payload: e.payload,
			viewBox: t,
			parentViewBox: void 0,
			fill: void 0
		});
	}), [r]);
	return /*#__PURE__*/ P.createElement(eA, { value: t ? i : void 0 }, n);
}
function EL(e) {
	var t = e.clipPathId, n = e.pathRef, r = e.points, i = e.props, a = e.animationElapsedTime, o = e.isAnimating, s = e.isEntrance, c = e.visibleLength, l = i.type, u = i.layout, d = i.connectNulls, f = i.needClip, p = i.shape, m = i.strokeDasharray, h = hL(hL({}, ut(fL(i, lL))), {}, {
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
	return /*#__PURE__*/ P.createElement(P.Fragment, null, r?.length > 1 && /*#__PURE__*/ P.createElement(Dj, {
		option: p,
		DefaultShape: xL.shape,
		shapeProps: h
	}), /*#__PURE__*/ P.createElement(wL, {
		points: r,
		clipPathId: t,
		props: i
	}));
}
function DL(e) {
	var t = e.clipPathId, n = e.props, r = e.pathRef, i = e.previousPointsRef, a = n.points, o = n.isAnimationActive, s = n.animationBegin, c = n.animationDuration, l = n.animationEasing, u = n.animationMatchBy, d = n.animationInterpolateFn, f = n.layout, p = yL(r.current), m = tM(n.onAnimationStart, n.onAnimationEnd), h = m.isAnimating, g = m.handleAnimationStart, _ = m.handleAnimationEnd, v = !h, y = HI(a), b = (0, P.useCallback)((e) => e > 0 && p > 0, [p]);
	return /*#__PURE__*/ P.createElement(TL, {
		points: a,
		showLabels: v
	}, n.children, /*#__PURE__*/ P.createElement(nM, {
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
		return /*#__PURE__*/ P.createElement(EL, {
			props: n,
			points: e,
			clipPathId: t,
			pathRef: r,
			animationElapsedTime: i,
			isAnimating: o,
			isEntrance: a,
			visibleLength: s
		});
	}), /*#__PURE__*/ P.createElement(oA, { label: n.label }));
}
function OL(e) {
	var t = e.clipPathId, n = e.props, r = (0, P.useRef)(null), i = (0, P.useRef)(null);
	return /*#__PURE__*/ P.createElement(DL, {
		props: n,
		clipPathId: t,
		previousPointsRef: r,
		pathRef: i
	});
}
var kL = (e, t) => ({
	x: e.x ?? void 0,
	y: e.y ?? void 0,
	value: e.value,
	errorVal: K(e.payload, t)
}), AL = class extends P.Component {
	render() {
		var e = this.props, t = e.hide, n = e.dot, r = e.points, i = e.className, a = e.xAxisId, o = e.yAxisId, s = e.top, c = e.left, l = e.width, u = e.height, d = e.id, f = e.needClip, p = e.zIndex;
		if (t) return null;
		var m = N("recharts-line", i), h = d, g = sL(n), _ = g.r, v = g.strokeWidth, y = gj(n), b = _ * 2 + v, x = f ? `url(#clipPath-${y ? "" : "dots-"}${h})` : void 0;
		return /*#__PURE__*/ P.createElement(sD, { zIndex: p }, /*#__PURE__*/ P.createElement(F, { className: m }, f && /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement(QI, {
			clipPathId: h,
			xAxisId: a,
			yAxisId: o
		}), !y && /*#__PURE__*/ P.createElement("clipPath", { id: `clipPath-dots-${h}` }, /*#__PURE__*/ P.createElement("rect", {
			x: c - b / 2,
			y: s - b / 2,
			width: l + b,
			height: u + b
		}))), /*#__PURE__*/ P.createElement(XI, {
			xAxisId: a,
			yAxisId: o,
			data: r,
			dataPointFormatter: kL,
			errorBarOffset: 0
		}, /*#__PURE__*/ P.createElement(OL, {
			props: this.props,
			clipPathId: h
		}))), /*#__PURE__*/ P.createElement(sN, {
			activeDot: this.props.activeDot,
			points: r,
			mainColor: this.props.stroke,
			itemDataKey: this.props.dataKey,
			clipPath: x
		}));
	}
};
function jL(e) {
	var t = Xr(e, xL), n = t.activeDot, r = t.animateNewValues, i = t.animationBegin, a = t.animationDuration, o = t.animationEasing, s = t.connectNulls, c = t.dot, l = t.hide, u = t.isAnimationActive, d = t.label, f = t.legendType, p = t.xAxisId, m = t.yAxisId, h = t.id, g = fL(t, uL), _ = ZI(p, m).needClip, v = $M(), y = Wu(), b = nu(), x = V((e) => oL(e, p, m, b, h));
	if (y !== "horizontal" && y !== "vertical" || x == null || v == null) return null;
	var S = v.height, C = v.width, w = v.x, T = v.y;
	return /*#__PURE__*/ P.createElement(AL, dL({}, g, {
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
function ML(e) {
	var t = e.layout, n = e.xAxis, r = e.yAxis, i = e.xAxisTicks, a = e.yAxisTicks, o = e.dataKey, s = e.bandSize;
	return e.displayedData.map((e, c) => {
		var l = K(e, o);
		if (t === "horizontal") return {
			x: Sl({
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
		var u = R(l) ? null : n.scale.map(l), d = Sl({
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
function NL(e) {
	var t = Xr(e, xL), n = nu();
	return /*#__PURE__*/ P.createElement(fM, {
		id: t.id,
		type: "line"
	}, (e) => /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Mj, { legendPayload: SL(t) }), /*#__PURE__*/ P.createElement(CL, {
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
	}), /*#__PURE__*/ P.createElement(SM, {
		type: "line",
		id: e,
		data: t.data,
		xAxisId: t.xAxisId,
		yAxisId: t.yAxisId,
		zAxisId: 0,
		dataKey: t.dataKey,
		hide: t.hide,
		isPanorama: n
	}), /*#__PURE__*/ P.createElement(jL, dL({}, t, { id: e }))));
}
var PL = /*#__PURE__*/ P.memo(NL, Sd);
PL.displayName = "Line";
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/graphicalItemSelectors.js
function FL(e, t) {
	return e.graphicalItems.cartesianItems.find((e) => e.id === t)?.xAxisId ?? 0;
}
function IL(e, t) {
	return e.graphicalItems.cartesianItems.find((e) => e.id === t)?.yAxisId ?? 0;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/selectors/areaSelectors.js
var LL = (e, t, n) => Pw(e, "xAxis", FL(e, t), n), RL = (e, t, n) => Nw(e, "xAxis", FL(e, t), n), zL = (e, t, n) => Pw(e, "yAxis", IL(e, t), n), BL = (e, t, n) => Nw(e, "yAxis", IL(e, t), n), VL = H([
	q,
	LL,
	zL,
	RL,
	BL
], (e, t, n, r, i) => hl(e, "xAxis") ? Al(t, r, !1) : Al(n, i, !1)), HL = H([VS, (e, t) => t], (e, t) => e.filter((e) => e.type === "area").find((e) => e.id === t)), UL = (e) => hl(q(e), "xAxis") ? "yAxis" : "xAxis", WL = (e, t) => UL(e) === "yAxis" ? IL(e, t) : FL(e, t), GL = (e, t, n) => pC(e, UL(e), WL(e, t), n), KL = H([
	q,
	LL,
	zL,
	RL,
	BL,
	H([HL, GL], (e, t) => {
		if (e != null && t != null) {
			var n = e.stackId, r = Cg(e);
			if (n != null && r != null) {
				var i = (t[n]?.stackedData)?.find((e) => e.key === r);
				if (i != null) return i.map((e) => [e[0], e[1]]);
			}
		}
	}),
	mh,
	VL,
	HL,
	$h,
	H([HL, GL], (e, t) => {
		if (e != null && e.stackId != null && t != null) {
			var n = t[e.stackId];
			if (n != null) return n.graphicalItems.map((e) => e.dataKey).filter(Wt);
		}
	})
], (e, t, n, r, i, a, o, s, c, l, u) => {
	var d = o.chartData, f = o.dataStartIndex, p = o.dataEndIndex;
	if (!(c == null || e !== "horizontal" && e !== "vertical" || t == null || n == null || r == null || i == null || r.length === 0 || i.length === 0 || s == null)) {
		var m = c.data, h = m && m.length > 0 ? m : d?.slice(f, p + 1);
		if (h != null) return TR({
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
}), qL = [
	"animationElapsedTime",
	"isAnimating",
	"isEntrance",
	"layout",
	"isRange",
	"stroke",
	"connectNulls"
], JL = ["id", "baseLine"];
function YL() {
	return YL = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, YL.apply(null, arguments);
}
function XL(e, t) {
	if (e == null) return {};
	var n, r, i = ZL(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function ZL(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function QL(e) {
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
function $L(e) {
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
function eR(e) {
	var t = e.alpha, n = e.layout, r = e.points, i = e.baseLine, a = e.strokeWidth;
	return n === "vertical" ? /*#__PURE__*/ P.createElement($L, {
		alpha: t,
		points: r,
		baseLine: i,
		strokeWidth: a
	}) : /*#__PURE__*/ P.createElement(QL, {
		alpha: t,
		points: r,
		baseLine: i,
		strokeWidth: a
	});
}
function tR(e) {
	var t = e.animationElapsedTime, n = t === void 0 ? 1 : t, r = e.isAnimating, i = r !== void 0 && r, a = e.isEntrance, o = a !== void 0 && a, s = e.layout, c = e.isRange, l = e.stroke, u = e.connectNulls, d = XL(e, qL), f = s === "vertical" ? "vertical" : "horizontal", p = u ?? !1, m = lM(), h = d.id, g = d.baseLine, _ = ct(XL(d, JL)), v = /*#__PURE__*/ P.createElement(ap, YL({}, d, {
		id: h,
		baseLine: g,
		connectNulls: p,
		stroke: "none",
		className: "recharts-area-area",
		layout: f
	})), y = l !== "none" && /*#__PURE__*/ P.createElement(ap, YL({}, _, {
		className: "recharts-area-curve",
		layout: f,
		type: d.type,
		connectNulls: p,
		fill: "none",
		stroke: l,
		points: d.points
	})), b = l !== "none" && c && Array.isArray(g) && /*#__PURE__*/ P.createElement(ap, YL({}, _, {
		className: "recharts-area-curve",
		layout: f,
		type: d.type,
		connectNulls: p,
		fill: "none",
		stroke: l,
		points: g
	}));
	return o && (i || n < 1) ? /*#__PURE__*/ P.createElement(F, null, /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement("clipPath", { id: m }, /*#__PURE__*/ P.createElement(eR, {
		alpha: n,
		points: d.points ?? [],
		baseLine: g,
		layout: f,
		strokeWidth: d.strokeWidth
	}))), /*#__PURE__*/ P.createElement(F, { clipPath: `url(#${m})` }, v, y, b)) : /*#__PURE__*/ P.createElement(P.Fragment, null, v, y, b);
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/Area.js
var nR = ["id"], rR = [
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
function iR() {
	return iR = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, iR.apply(null, arguments);
}
function aR(e, t) {
	if (e == null) return {};
	var n, r, i = oR(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function oR(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function sR(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function cR(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? sR(Object(n), !0).forEach(function(t) {
			lR(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : sR(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function lR(e, t, n) {
	return (t = uR(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function uR(e) {
	var t = dR(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function dR(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var fR = {
	activeDot: !0,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	animationMatchBy: Bj,
	animationInterpolateFn: (e, t) => e == null ? [] : t === 1 ? e.flatMap((e) => e.status === "removed" ? [] : [e.next]) : e.flatMap((e) => e.status === "matched" ? [cR(cR({}, e.next), {}, {
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
	shape: tR,
	xAxisId: 0,
	yAxisId: 0,
	zIndex: Y.area
};
function pR(e, t) {
	return e && e !== "none" ? e : t;
}
var mR = (e) => {
	var t = e.dataKey, n = e.name, r = e.stroke, i = e.fill, a = e.legendType;
	return [{
		inactive: e.hide,
		dataKey: t,
		type: a,
		color: pR(r, i),
		value: Ml(n, t),
		payload: e
	}];
}, hR = /*#__PURE__*/ P.memo((e) => {
	var t = e.dataKey, n = e.data, r = e.stroke, i = e.strokeWidth, a = e.fill, o = e.name, s = e.hide, c = e.unit, l = e.formatter, u = e.tooltipType, d = e.id, f = {
		dataDefinedOnItem: n,
		getPosition: Gt,
		settings: {
			stroke: r,
			strokeWidth: i,
			fill: a,
			dataKey: t,
			nameKey: void 0,
			name: Ml(o, t),
			hide: s,
			type: u,
			color: pR(r, a),
			unit: c,
			formatter: l,
			graphicalItemId: d
		}
	};
	return /*#__PURE__*/ P.createElement(jj, { tooltipEntrySettings: f });
});
function gR(e) {
	var t = e.clipPathId, n = e.points, r = e.props, i = r.needClip, a = r.dot, o = r.dataKey, s = ct(r);
	return /*#__PURE__*/ P.createElement(FM, {
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
function _R(e) {
	var t = e.showLabels, n = e.children, r = e.points.map((e) => {
		var t = {
			x: e.x ?? 0,
			y: e.y ?? 0,
			width: 0,
			lowerWidth: 0,
			upperWidth: 0,
			height: 0
		};
		return cR(cR({}, t), {}, {
			value: e.value,
			payload: e.payload,
			parentViewBox: void 0,
			viewBox: t,
			fill: void 0
		});
	});
	return /*#__PURE__*/ P.createElement(eA, { value: t ? r : void 0 }, n);
}
function vR(e) {
	var t = e.points, n = e.baseLine, r = e.needClip, i = e.clipPathId, a = e.props, o = e.animationElapsedTime, s = e.isAnimating, c = e.isEntrance, l = a.layout, u = a.type, d = a.stroke, f = a.connectNulls, p = a.isRange, m = a.shape, h = a.id, g = aR(a, nR), _ = cR(cR({}, ut(g)), {}, {
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
	return /*#__PURE__*/ P.createElement(P.Fragment, null, t?.length > 1 && /*#__PURE__*/ P.createElement(F, { clipPath: r ? `url(#clipPath-${i})` : void 0 }, /*#__PURE__*/ P.createElement(Dj, {
		option: m,
		DefaultShape: fR.shape,
		shapeProps: _
	})), /*#__PURE__*/ P.createElement(gR, {
		points: t,
		props: g,
		clipPathId: i
	}));
}
function yR(e, t, n) {
	return I(e) ? L(I(t) ? t : void 0, e, n) : R(e) || Ft(e) ? L(I(t) ? t : void 0, 0, n) : e;
}
function bR(e) {
	var t = e.needClip, n = e.clipPathId, r = e.props, i = e.previousPointsRef, a = e.previousBaselineRef, o = r.points, s = r.baseLine, c = r.isAnimationActive, l = r.animationBegin, u = r.animationDuration, d = r.animationEasing, f = r.animationMatchBy, p = r.animationInterpolateFn, m = (0, P.useMemo)(() => ({
		points: o,
		baseLine: s
	}), [o, s]), h = Jj(m, a), g = Gu(), _ = tM(r.onAnimationStart, r.onAnimationEnd), v = _.isAnimating, y = _.handleAnimationStart, b = _.handleAnimationEnd, x = h.startValue;
	if (g == null) return null;
	var S = Array.isArray(s) && Array.isArray(x) ? qj(x, s, f) : Array.isArray(s) ? qj(null, s, f) : null;
	return /*#__PURE__*/ P.createElement(nM, {
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
		var c = i === 1 ? s : Array.isArray(s) ? p(S, i, g) : a ? s : yR(s, x, i);
		return h.syncStepValue(c, i), /*#__PURE__*/ P.createElement(_R, {
			showLabels: !v,
			points: o
		}, r.children, /*#__PURE__*/ P.createElement(vR, {
			points: e,
			baseLine: c,
			needClip: t,
			clipPathId: n,
			props: r,
			animationElapsedTime: i,
			isAnimating: v || i < 1,
			isEntrance: a
		}), /*#__PURE__*/ P.createElement(oA, { label: r.label }));
	});
}
function xR(e) {
	var t = e.needClip, n = e.clipPathId, r = e.props, i = (0, P.useRef)(null), a = (0, P.useRef)();
	return /*#__PURE__*/ P.createElement(bR, {
		needClip: t,
		clipPathId: n,
		props: r,
		previousPointsRef: i,
		previousBaselineRef: a
	});
}
var SR = class extends P.PureComponent {
	render() {
		var e = this.props, t = e.hide, n = e.dot, r = e.points, i = e.className, a = e.top, o = e.left, s = e.needClip, c = e.xAxisId, l = e.yAxisId, u = e.width, d = e.height, f = e.id, p = e.baseLine, m = e.zIndex;
		if (t) return null;
		var h = N("recharts-area", i), g = f, _ = sL(n), v = _.r, y = _.strokeWidth, b = gj(n), x = v * 2 + y, S = s ? `url(#clipPath-${b ? "" : "dots-"}${g})` : void 0;
		return /*#__PURE__*/ P.createElement(sD, { zIndex: m }, /*#__PURE__*/ P.createElement(F, { className: h }, s && /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement(QI, {
			clipPathId: g,
			xAxisId: c,
			yAxisId: l
		}), !b && /*#__PURE__*/ P.createElement("clipPath", { id: `clipPath-dots-${g}` }, /*#__PURE__*/ P.createElement("rect", {
			x: o - x / 2,
			y: a - x / 2,
			width: u + x,
			height: d + x
		}))), /*#__PURE__*/ P.createElement(xR, {
			needClip: s,
			clipPathId: g,
			props: this.props
		})), /*#__PURE__*/ P.createElement(sN, {
			points: r,
			mainColor: pR(this.props.stroke, this.props.fill),
			itemDataKey: this.props.dataKey,
			activeDot: this.props.activeDot,
			clipPath: S
		}), this.props.isRange && Array.isArray(p) && /*#__PURE__*/ P.createElement(sN, {
			points: p,
			mainColor: pR(this.props.stroke, this.props.fill),
			itemDataKey: this.props.dataKey,
			activeDot: this.props.activeDot,
			clipPath: S
		}));
	}
};
function CR(e) {
	var t = e.activeDot, n = e.animationBegin, r = e.animationDuration, i = e.animationEasing, a = e.connectNulls, o = e.dot, s = e.fill, c = e.fillOpacity, l = e.hide, u = e.isAnimationActive, d = e.legendType, f = e.stroke, p = e.xAxisId, m = e.yAxisId, h = aR(e, rR), g = Wu(), _ = DE(), v = ZI(p, m).needClip, y = nu(), b = V((t) => KL(t, e.id, y)) ?? {}, x = b.points, S = b.isRange, C = b.baseLine, w = $M();
	if (g !== "horizontal" && g !== "vertical" || w == null || _ !== "AreaChart" && _ !== "ComposedChart") return null;
	var T = w.height, E = w.width, D = w.x, O = w.y;
	return !x || !x.length ? null : /*#__PURE__*/ P.createElement(SR, iR({}, h, {
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
var wR = (e, t, n, r, i) => {
	var a = n ?? t;
	if (I(a)) return a;
	var o = e === "horizontal" ? i : r, s = o.scale.domain();
	if (o.type === "number") {
		var c = Math.max(s[0], s[1]), l = Math.min(s[0], s[1]);
		return a === "dataMin" ? l : a === "dataMax" || c < 0 ? c : Math.max(Math.min(s[0], s[1]), 0);
	}
	return a === "dataMin" ? s[0] : a === "dataMax" ? s[1] : s[0];
};
function TR(e) {
	var t = e.areaSettings, n = t.connectNulls, r = t.baseValue, i = t.dataKey, a = e.stackedData, o = e.layout, s = e.chartBaseValue, c = e.xAxis, l = e.yAxis, u = e.displayedData, d = e.dataStartIndex, f = e.xAxisTicks, p = e.yAxisTicks, m = e.bandSize, h = e.stackDataKeys, g = a && a.length, _ = wR(o, s, r, c, l), v = o === "horizontal", y = !1, b = u.map((e, t) => {
		var r;
		if (g) r = a[d + t];
		else {
			var o = K(e, i);
			Array.isArray(o) ? (r = o, y = !0) : r = [_, o];
		}
		var s = r?.[1] ?? null, u = K(e, i), b = g && u == null && h != null && h.length > 0 && h.every((t) => K(e, t) == null), x = s == null || g && !n && u == null || b;
		return v ? {
			x: Sl({
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
			y: Sl({
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
function ER(e) {
	var t = Xr(e, fR), n = nu();
	return /*#__PURE__*/ P.createElement(fM, {
		id: t.id,
		type: "area"
	}, (e) => /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Mj, { legendPayload: mR(t) }), /*#__PURE__*/ P.createElement(hR, {
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
	}), /*#__PURE__*/ P.createElement(SM, {
		type: "area",
		id: e,
		data: t.data,
		dataKey: t.dataKey,
		xAxisId: t.xAxisId,
		yAxisId: t.yAxisId,
		zAxisId: 0,
		stackId: xl(t.stackId),
		hide: t.hide,
		barSize: void 0,
		baseValue: t.baseValue,
		isPanorama: n,
		connectNulls: t.connectNulls
	}), /*#__PURE__*/ P.createElement(CR, iR({}, t, { id: e }))));
}
var DR = /*#__PURE__*/ P.memo(ER, Sd);
DR.displayName = "Area";
// ../../../peach/frontend/node_modules/tiny-invariant/dist/esm/tiny-invariant.js
var OR = "Invariant failed";
function kR(e, t) {
	if (!e) throw Error(OR);
}
// ../../../peach/frontend/node_modules/recharts/es6/util/BarUtils.js
var AR = ["option"];
function jR(e, t) {
	if (e == null) return {};
	var n, r, i = MR(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function MR(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var NR = km;
function PR(e) {
	var t = e.option, n = jR(e, AR);
	return /*#__PURE__*/ P.createElement(Dj, {
		option: t,
		DefaultShape: NR,
		shapeProps: n,
		activeClassName: "recharts-active-bar",
		inActiveClassName: "recharts-inactive-bar"
	});
}
var FR = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
	return (n, r) => {
		if (I(e)) return e;
		var i = I(n) || R(n);
		return i ? e(n, r) : (!i && kR(!1, `minPointSize callback function received a value with type of ${typeof n}. Currently only numbers or null/undefined are supported.`), t);
	};
}, IR = (e, t, n) => n, LR = H([VS, (e, t) => t], (e, t) => e.filter((e) => e.type === "bar").find((e) => e.id === t)), RR = H([LR], (e) => e?.maxBarSize), zR = (e, t, n, r) => r, BR = H([
	q,
	VS,
	FL,
	IL,
	IR
], (e, t, n, r, i) => t.filter((t) => e === "horizontal" ? t.xAxisId === n : t.yAxisId === r).filter((e) => e.isPanorama === i).filter((e) => e.hide === !1).filter((e) => e.type === "bar")), VR = (e, t, n) => {
	var r = q(e), i = FL(e, t), a = IL(e, t);
	if (i != null && a != null) return r === "horizontal" ? pC(e, "yAxis", a, n) : pC(e, "xAxis", i, n);
}, HR = H([
	BR,
	Kh,
	(e, t) => {
		var n = q(e), r = FL(e, t), i = IL(e, t);
		if (r != null && i != null) return n === "horizontal" ? Ew(e, "xAxis", r) : Ew(e, "yAxis", i);
	}
], xN), UR = (e, t, n) => {
	var r = LR(e, t);
	if (r == null) return 0;
	var i = FL(e, t), a = IL(e, t);
	if (i == null || a == null) return 0;
	var o = q(e), s = Uh(e), c = r.maxBarSize, l = R(c) ? s : c, u, d;
	return o === "horizontal" ? (u = Pw(e, "xAxis", i, n), d = Nw(e, "xAxis", i, n)) : (u = Pw(e, "yAxis", a, n), d = Nw(e, "yAxis", a, n)), Al(u, d, !0) ?? l ?? 0;
}, WR = (e, t, n) => {
	var r = q(e), i = FL(e, t), a = IL(e, t);
	if (i != null && a != null) {
		var o, s;
		return r === "horizontal" ? (o = Pw(e, "xAxis", i, n), s = Nw(e, "xAxis", i, n)) : (o = Pw(e, "yAxis", a, n), s = Nw(e, "yAxis", a, n)), Al(o, s);
	}
}, GR = H([
	Ql,
	eu,
	(e, t, n) => {
		var r = FL(e, t);
		if (r != null) return Pw(e, "xAxis", r, n);
	},
	(e, t, n) => {
		var r = IL(e, t);
		if (r != null) return Pw(e, "yAxis", r, n);
	},
	(e, t, n) => {
		var r = FL(e, t);
		if (r != null) return Nw(e, "xAxis", r, n);
	},
	(e, t, n) => {
		var r = IL(e, t);
		if (r != null) return Nw(e, "yAxis", r, n);
	},
	H([H([
		HR,
		Uh,
		Wh,
		Gh,
		UR,
		WR,
		RR
	], ON), LR], AN),
	q,
	mh,
	WR,
	H([VR, LR], kN),
	LR,
	zR
], (e, t, n, r, i, a, o, s, c, l, u, d, f) => {
	var p = c.chartData, m = c.dataStartIndex, h = c.dataEndIndex;
	if (!(d == null || o == null || t == null || s !== "horizontal" && s !== "vertical" || n == null || r == null || i == null || a == null || l == null)) {
		var g = d.data, _ = g != null && g.length > 0 ? g : p?.slice(m, h + 1);
		if (_ != null) return Pz({
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
}), KR = ["index"];
function qR() {
	return qR = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, qR.apply(null, arguments);
}
function JR(e, t) {
	if (e == null) return {};
	var n, r, i = YR(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function YR(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var XR = /*#__PURE__*/ (0, P.createContext)(void 0), ZR = (e) => {
	var t = (0, P.useContext)(XR);
	if (t != null) return t.stackId;
	if (e != null) return xl(e);
}, QR = (e, t) => `recharts-bar-stack-clip-path-${e}-${t}`, $R = (e) => {
	var t = (0, P.useContext)(XR);
	if (t != null) {
		var n = t.stackId;
		return `url(#${QR(n, e)})`;
	}
}, ez = (e) => {
	var t = e.index, n = JR(e, KR), r = $R(t);
	return /*#__PURE__*/ P.createElement(F, qR({
		className: "recharts-bar-stack-layer",
		clipPath: r
	}, n));
}, tz = [
	"onMouseEnter",
	"onMouseLeave",
	"onClick"
], nz = [
	"value",
	"background",
	"tooltipPosition"
], rz = ["id"], iz = [
	"onMouseEnter",
	"onClick",
	"onMouseLeave"
];
function az(e, t) {
	return uz(e) || lz(e, t) || sz(e, t) || oz();
}
function oz() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function sz(e, t) {
	if (e) {
		if (typeof e == "string") return cz(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? cz(e, t) : void 0;
	}
}
function cz(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function lz(e, t) {
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
function uz(e) {
	if (Array.isArray(e)) return e;
}
function dz() {
	return dz = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, dz.apply(null, arguments);
}
function fz(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function pz(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? fz(Object(n), !0).forEach(function(t) {
			mz(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : fz(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function mz(e, t, n) {
	return (t = hz(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function hz(e) {
	var t = gz(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function gz(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function _z(e, t) {
	if (e == null) return {};
	var n, r, i = vz(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function vz(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var yz = (e) => {
	var t = e.dataKey, n = e.name, r = e.fill, i = e.legendType;
	return [{
		inactive: e.hide,
		dataKey: t,
		type: i,
		color: r,
		value: Ml(n, t),
		payload: e
	}];
}, bz = /*#__PURE__*/ P.memo((e) => {
	var t = e.dataKey, n = e.stroke, r = e.strokeWidth, i = e.fill, a = e.name, o = e.hide, s = e.unit, c = e.formatter, l = e.tooltipType, u = e.id, d = {
		dataDefinedOnItem: void 0,
		getPosition: Gt,
		settings: {
			stroke: n,
			strokeWidth: r,
			fill: i,
			dataKey: t,
			nameKey: void 0,
			name: Ml(a, t),
			hide: o,
			type: l,
			color: i,
			unit: s,
			formatter: c,
			graphicalItemId: u
		}
	};
	return /*#__PURE__*/ P.createElement(jj, { tooltipEntrySettings: d });
});
function xz(e) {
	var t = V(rE), n = e.data, r = e.dataKey, i = e.background, a = e.allOtherBarProps, o = a.onMouseEnter, s = a.onMouseLeave, c = a.onClick, l = _z(a, tz), u = Oj(o, r, a.id), d = kj(s), f = Aj(c, r, a.id);
	if (!i || n == null) return null;
	var p = lt(i);
	return /*#__PURE__*/ P.createElement(sD, { zIndex: $N(i, Y.barBackground) }, n.map((e, n) => {
		e.value;
		var a = e.background;
		e.tooltipPosition;
		var o = _z(e, nz);
		if (!a) return null;
		var s = u(e, e.originalDataIndex), c = d(e, e.originalDataIndex), m = f(e, e.originalDataIndex), h = pz(pz(pz(pz(pz({
			option: i,
			isActive: String(e.originalDataIndex) === t
		}, o), {}, { fill: "#eee" }, a), p), Wr(l, e, n)), {}, {
			onMouseEnter: s,
			onMouseLeave: c,
			onClick: m,
			dataKey: r,
			index: n,
			className: "recharts-bar-background-rectangle"
		});
		return /*#__PURE__*/ P.createElement(PR, dz({ key: `background-bar-${n}` }, h));
	}));
}
function Sz(e) {
	var t = e.showLabels, n = e.children, r = e.rects?.map((e) => {
		var t = {
			x: e.x,
			y: e.y,
			width: e.width,
			lowerWidth: e.width,
			upperWidth: e.width,
			height: e.height
		};
		return pz(pz({}, t), {}, {
			value: e.value,
			payload: e.payload,
			parentViewBox: e.parentViewBox,
			viewBox: t,
			fill: e.fill
		});
	});
	return /*#__PURE__*/ P.createElement(eA, { value: t ? r : void 0 }, n);
}
function Cz(e) {
	var t = e.shape, n = e.activeBar, r = e.baseProps, i = e.entry, a = e.index, o = e.dataKey, s = V(rE), c = V(aE), l = n && String(i.originalDataIndex) === s && (c == null || o === c), u = s != null && (String(i.originalDataIndex) !== s || c != null && o !== c), d = az((0, P.useState)(!1), 2), f = d[0], p = d[1], m = az((0, P.useState)(!1), 2), h = m[0], g = m[1];
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
	}, [l]), v = l && h, y = l || f, b = l ? n === !0 ? t : n : t, x = /*#__PURE__*/ P.createElement(PR, dz({}, r, { name: String(r.name) }, i, {
		isActive: v,
		option: b,
		index: a,
		dataKey: o,
		animationElapsedTime: e.animationElapsedTime,
		isAnimating: e.isAnimating,
		isEntrance: e.isEntrance,
		onTransitionEnd: _
	}));
	return y ? /*#__PURE__*/ P.createElement(sD, { zIndex: Y.activeBar }, /*#__PURE__*/ P.createElement(ez, { index: i.originalDataIndex }, x)) : x;
}
function wz(e) {
	var t = e.shape, n = e.baseProps, r = e.entry, i = e.index, a = e.dataKey;
	return /*#__PURE__*/ P.createElement(PR, dz({}, n, { name: String(n.name) }, r, {
		isActive: !1,
		option: t,
		index: i,
		dataKey: a,
		animationElapsedTime: e.animationElapsedTime,
		isAnimating: e.isAnimating,
		isEntrance: e.isEntrance
	}));
}
function Tz(e) {
	var t = e.data, n = e.props, r = e.animationElapsedTime, i = e.isAnimating, a = e.isEntrance, o = ct(n) ?? {}, s = o.id, c = _z(o, rz), l = n.shape, u = n.dataKey, d = n.activeBar, f = n.onMouseEnter, p = n.onClick, m = n.onMouseLeave, h = _z(n, iz), g = Oj(f, u, s), _ = kj(m), v = Aj(p, u, s);
	return t ? /*#__PURE__*/ P.createElement(P.Fragment, null, t.map((e, t) => /*#__PURE__*/ P.createElement(ez, dz({
		index: e.originalDataIndex,
		key: `rectangle-${e?.x}-${e?.y}-${e?.value}-${t}`,
		className: "recharts-bar-rectangle"
	}, Wr(h, e, t), {
		onMouseEnter: g(e, e.originalDataIndex),
		onMouseLeave: _(e, e.originalDataIndex),
		onClick: v(e, e.originalDataIndex)
	}), d ? /*#__PURE__*/ P.createElement(Cz, {
		shape: l,
		activeBar: d,
		baseProps: c,
		entry: e,
		index: t,
		dataKey: u,
		animationElapsedTime: r,
		isAnimating: i,
		isEntrance: a
	}) : /*#__PURE__*/ P.createElement(wz, {
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
var Ez = (e, t, n) => e == null ? [] : t === 1 ? e.flatMap((e) => e.status === "removed" ? [] : [e.next]) : e.flatMap((e) => {
	if (e.status === "removed") return n === "horizontal" ? [pz(pz({}, e.prev), {}, {
		height: L(e.prev.height, 0, t),
		y: L(e.prev.y, e.prev.y + e.prev.height, t)
	})] : [pz(pz({}, e.prev), {}, { width: L(e.prev.width, 0, t) })];
	if (e.status === "matched") return [pz(pz({}, e.next), {}, {
		x: L(e.prev.x, e.next.x, t),
		y: L(e.prev.y, e.next.y, t),
		width: L(e.prev.width, e.next.width, t),
		height: L(e.prev.height, e.next.height, t)
	})];
	var r = e.next;
	return n === "horizontal" ? [pz(pz({}, r), {}, {
		height: L(0, r.height, t),
		y: L(r.stackedBarStart, r.y, t)
	})] : [pz(pz({}, r), {}, {
		width: L(0, r.width, t),
		x: L(r.stackedBarStart, r.x, t)
	})];
});
function Dz(e) {
	var t = e.props, n = e.previousRectanglesRef, r = t.data, i = t.isAnimationActive, a = t.animationBegin, o = t.animationDuration, s = t.animationEasing, c = t.animationInterpolateFn, l = t.layout, u = tM(t.onAnimationStart, t.onAnimationEnd), d = u.isAnimating, f = u.handleAnimationStart, p = u.handleAnimationEnd;
	return /*#__PURE__*/ P.createElement(Sz, {
		showLabels: !d,
		rects: r
	}, /*#__PURE__*/ P.createElement(nM, {
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
	}, (e, n, r) => /*#__PURE__*/ P.createElement(F, null, /*#__PURE__*/ P.createElement(Tz, {
		props: t,
		data: e,
		animationElapsedTime: n,
		isAnimating: d || n < 1,
		isEntrance: r
	}))), /*#__PURE__*/ P.createElement(oA, { label: t.label }), t.children);
}
function Oz(e) {
	var t = (0, P.useRef)(null);
	return /*#__PURE__*/ P.createElement(Dz, {
		previousRectanglesRef: t,
		props: e
	});
}
var kz = 0, Az = (e, t) => {
	var n = Array.isArray(e.value) ? e.value[1] : e.value;
	return {
		x: e.x,
		y: e.y,
		value: n,
		errorVal: K(e, t)
	};
}, jz = class extends P.PureComponent {
	render() {
		var e = this.props, t = e.hide, n = e.data, r = e.dataKey, i = e.className, a = e.xAxisId, o = e.yAxisId, s = e.needClip, c = e.background, l = e.id;
		if (t || n == null) return null;
		var u = N("recharts-bar", i), d = l;
		return /*#__PURE__*/ P.createElement(F, {
			className: u,
			id: l
		}, s && /*#__PURE__*/ P.createElement("defs", null, /*#__PURE__*/ P.createElement(QI, {
			clipPathId: d,
			xAxisId: a,
			yAxisId: o
		})), /*#__PURE__*/ P.createElement(F, {
			className: "recharts-bar-rectangles",
			clipPath: s ? `url(#clipPath-${d})` : void 0
		}, /*#__PURE__*/ P.createElement(xz, {
			data: n,
			dataKey: r,
			background: c,
			allOtherBarProps: this.props
		}), /*#__PURE__*/ P.createElement(Oz, this.props)));
	}
}, Mz = {
	activeBar: !1,
	animationBegin: 0,
	animationDuration: 400,
	animationEasing: "ease",
	animationInterpolateFn: Ez,
	animationMatchBy: Vj,
	background: !1,
	hide: !1,
	isAnimationActive: "auto",
	label: !1,
	legendType: "rect",
	minPointSize: kz,
	shape: NR,
	xAxisId: 0,
	yAxisId: 0,
	zIndex: Y.bar
};
function Nz(e) {
	var t = e.xAxisId, n = e.yAxisId, r = e.hide, i = e.legendType, a = e.minPointSize, o = e.activeBar, s = e.animationBegin, c = e.animationDuration, l = e.animationEasing, u = e.isAnimationActive, d = ZI(t, n).needClip, f = Wu(), p = nu(), m = hj(e.children, sO), h = V((t) => GR(t, e.id, p, m));
	if (f !== "vertical" && f !== "horizontal") return null;
	var g, _ = h?.[0];
	return g = _ == null || _.height == null || _.width == null ? 0 : f === "vertical" ? _.height / 2 : _.width / 2, /*#__PURE__*/ P.createElement(XI, {
		xAxisId: t,
		yAxisId: n,
		data: h,
		dataPointFormatter: Az,
		errorBarOffset: g
	}, /*#__PURE__*/ P.createElement(jz, dz({}, e, {
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
function Pz(e) {
	var t = e.layout, n = e.barSettings, r = n.dataKey, i = n.minPointSize, a = n.hasCustomShape, o = e.pos, s = e.bandSize, c = e.xAxis, l = e.yAxis, u = e.xAxisTicks, d = e.yAxisTicks, f = e.stackedData, p = e.displayedData, m = e.offset, h = e.cells, g = e.parentViewBox, _ = e.dataStartIndex, v = t === "horizontal" ? l : c, y = f ? v.scale.domain() : null, b = wl({ numericAxis: v }), x = v.scale.map(b);
	return p.map((e, n) => {
		var p, v, S, C, w, T;
		if (f) {
			var E = f[n + _];
			if (E == null) return null;
			p = vl(E, y);
		} else p = K(e, r), Array.isArray(p) || (p = [b, p]);
		var D = FR(i, kz)(p[1], n);
		if (t === "horizontal") {
			var O = l.scale.map(p[0]), k = l.scale.map(p[1]);
			if (O == null || k == null) return null;
			v = Cl({
				axis: c,
				ticks: u,
				bandSize: s,
				offset: o.offset,
				entry: e,
				index: n
			}), S = k ?? O ?? void 0, C = o.size;
			var A = O - k;
			if (w = Ft(A) ? 0 : A, T = {
				x: v,
				y: m.top,
				width: C,
				height: m.height
			}, Math.abs(D) > 0 && Math.abs(w) < Math.abs(D)) {
				var j = Pt(w || D) * (Math.abs(D) - Math.abs(w));
				S -= j, w += j;
			}
		} else {
			var M = c.scale.map(p[0]), N = c.scale.map(p[1]);
			if (M == null || N == null) return null;
			if (v = M, S = Cl({
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
				var ee = Pt(C || D) * (Math.abs(D) - Math.abs(C));
				C += ee;
			}
		}
		return v == null || S == null || C == null || w == null || !a && (C === 0 || w === 0) ? null : pz(pz({}, e), {}, {
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
function Fz(e) {
	var t = Xr(e, Mz), n = ZR(t.stackId), r = nu();
	return /*#__PURE__*/ P.createElement(fM, {
		id: t.id,
		type: "bar"
	}, (e) => /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Mj, { legendPayload: yz(t) }), /*#__PURE__*/ P.createElement(bz, {
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
	}), /*#__PURE__*/ P.createElement(SM, {
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
		hasCustomShape: t.shape != null && t.shape !== NR
	}), /*#__PURE__*/ P.createElement(sD, { zIndex: t.zIndex }, /*#__PURE__*/ P.createElement(Nz, dz({}, t, { id: e })))));
}
var Iz = /*#__PURE__*/ P.memo(Fz, Sd);
Iz.displayName = "Bar";
// ../../../peach/frontend/node_modules/recharts/es6/util/axisPropsAreEqual.js
var Lz = ["domain", "range"], Rz = ["domain", "range"];
function zz(e, t) {
	if (e == null) return {};
	var n, r, i = Bz(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function Bz(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function Vz(e, t) {
	return e === t ? !0 : Array.isArray(e) && e.length === 2 && Array.isArray(t) && t.length === 2 ? e[0] === t[0] && e[1] === t[1] : !1;
}
function Hz(e, t) {
	if (e === t) return !0;
	var n = e.domain, r = e.range, i = zz(e, Lz), a = t.domain, o = t.range, s = zz(t, Rz);
	return !Vz(n, a) || !Vz(r, o) ? !1 : Sd(i, s);
}
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/XAxis.js
var Uz = ["type"], Wz = [
	"dangerouslySetInnerHTML",
	"ticks",
	"scale"
], Gz = ["id", "scale"];
function Kz() {
	return Kz = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, Kz.apply(null, arguments);
}
function qz(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function Jz(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? qz(Object(n), !0).forEach(function(t) {
			Yz(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qz(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function Yz(e, t, n) {
	return (t = Xz(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Xz(e) {
	var t = Zz(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function Zz(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Qz(e, t) {
	if (e == null) return {};
	var n, r, i = $z(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function $z(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function eB(e) {
	var t = B(), n = (0, P.useRef)(null), r = Gu(), i = e.type, a = Qz(e, Uz), o = rg(r, "xAxis", i), s = (0, P.useMemo)(() => {
		if (o != null) return Jz(Jz({}, a), {}, { type: o });
	}, [a, o]);
	return (0, P.useLayoutEffect)(() => {
		s != null && (n.current === null ? t(UM(s)) : n.current !== s && t(WM({
			prev: n.current,
			next: s
		})), n.current = s);
	}, [s, t]), (0, P.useLayoutEffect)(() => () => {
		n.current &&= (t(GM(n.current)), null);
	}, [t]), null;
}
var tB = (e) => {
	var t = e.xAxisId, n = e.className, r = e.height, i = e.label, a = (0, P.useRef)(null), o = (0, P.useRef)(null), s = V(eu), c = nu(), l = B(), u = "xAxis", d = V((e) => jw(e, u, t, c)), f = V((e) => vw(e, t)), p = V((e) => Cw(e, t)), m = V((e) => AS(e, t));
	if ((0, P.useLayoutEffect)(() => {
		if (!(r !== "auto" || !f || Lk(i) || /*#__PURE__*/ (0, P.isValidElement)(i) || m == null)) {
			var e = a.current;
			if (e) {
				var n = e.getCalculatedHeight();
				Math.round(f.height) !== Math.round(n) && l(XM({
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
	var h = Qz(e, Wz);
	m.id, m.scale;
	var g = Qz(m, Gz);
	return /*#__PURE__*/ P.createElement(oI, Kz({}, h, g, {
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
}, nB = {
	allowDataOverflow: kS.allowDataOverflow,
	allowDecimals: kS.allowDecimals,
	allowDuplicatedCategory: kS.allowDuplicatedCategory,
	angle: kS.angle,
	axisLine: ZF.axisLine,
	height: kS.height,
	hide: !1,
	includeHidden: kS.includeHidden,
	interval: kS.interval,
	label: !1,
	minTickGap: kS.minTickGap,
	mirror: kS.mirror,
	orientation: kS.orientation,
	padding: kS.padding,
	reversed: kS.reversed,
	scale: kS.scale,
	tick: kS.tick,
	tickCount: kS.tickCount,
	tickLine: ZF.tickLine,
	tickSize: ZF.tickSize,
	type: kS.type,
	niceTicks: kS.niceTicks,
	xAxisId: 0
}, rB = /*#__PURE__*/ P.memo((e) => {
	var t = Xr(e, nB);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(eB, {
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
	}), /*#__PURE__*/ P.createElement(tB, t));
}, Hz);
rB.displayName = "XAxis";
// ../../../peach/frontend/node_modules/recharts/es6/cartesian/YAxis.js
var iB = ["type"], aB = [
	"dangerouslySetInnerHTML",
	"ticks",
	"scale"
], oB = ["id", "scale"];
function sB() {
	return sB = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, sB.apply(null, arguments);
}
function cB(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function lB(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? cB(Object(n), !0).forEach(function(t) {
			uB(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : cB(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function uB(e, t, n) {
	return (t = dB(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function dB(e) {
	var t = fB(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function fB(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function pB(e, t) {
	if (e == null) return {};
	var n, r, i = mB(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function mB(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function hB(e) {
	var t = B(), n = (0, P.useRef)(null), r = Gu(), i = e.type, a = pB(e, iB), o = rg(r, "yAxis", i), s = (0, P.useMemo)(() => {
		if (o != null) return lB(lB({}, a), {}, { type: o });
	}, [o, a]);
	return (0, P.useLayoutEffect)(() => {
		s != null && (n.current === null ? t(KM(s)) : n.current !== s && t(qM({
			prev: n.current,
			next: s
		})), n.current = s);
	}, [s, t]), (0, P.useLayoutEffect)(() => () => {
		n.current &&= (t(JM(n.current)), null);
	}, [t]), null;
}
function gB(e) {
	var t = e.yAxisId, n = e.className, r = e.width, i = e.label, a = (0, P.useRef)(null), o = (0, P.useRef)(null), s = V(eu), c = nu(), l = B(), u = "yAxis", d = V((e) => Tw(e, t)), f = V((e) => ww(e, t)), p = V((e) => jw(e, u, t, c)), m = V((e) => NS(e, t));
	if ((0, P.useLayoutEffect)(() => {
		if (!(r !== "auto" || !d || Lk(i) || /*#__PURE__*/ (0, P.isValidElement)(i) || m == null)) {
			var e = a.current;
			if (e) {
				var n = e.getCalculatedWidth();
				Math.round(d.width) !== Math.round(n) && l(YM({
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
	var h = pB(e, aB);
	m.id, m.scale;
	var g = pB(m, oB);
	return /*#__PURE__*/ P.createElement(oI, sB({}, h, g, {
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
var _B = {
	allowDataOverflow: MS.allowDataOverflow,
	allowDecimals: MS.allowDecimals,
	allowDuplicatedCategory: MS.allowDuplicatedCategory,
	angle: MS.angle,
	axisLine: ZF.axisLine,
	hide: !1,
	includeHidden: MS.includeHidden,
	interval: MS.interval,
	label: !1,
	minTickGap: MS.minTickGap,
	mirror: MS.mirror,
	orientation: MS.orientation,
	padding: MS.padding,
	reversed: MS.reversed,
	scale: MS.scale,
	tick: MS.tick,
	tickCount: MS.tickCount,
	tickLine: ZF.tickLine,
	tickSize: ZF.tickSize,
	type: MS.type,
	niceTicks: MS.niceTicks,
	width: MS.width,
	yAxisId: 0
}, vB = /*#__PURE__*/ P.memo((e) => {
	var t = Xr(e, _B);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(hB, {
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
	}), /*#__PURE__*/ P.createElement(gB, t));
}, Hz);
vB.displayName = "YAxis";
var yB = H([
	(e, t) => t,
	q,
	xg,
	kg,
	XT,
	QT,
	jE,
	Ql
], UE);
// ../../../peach/frontend/node_modules/recharts/es6/util/getRelativeCoordinate.js
function bB(e) {
	return "getBBox" in e.currentTarget && typeof e.currentTarget.getBBox == "function";
}
function xB(e) {
	var t = e.currentTarget.getBoundingClientRect(), n, r;
	if (bB(e)) {
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
var SB = Gs("mouseClick"), CB = Qc();
CB.startListening({
	actionCreator: SB,
	effect: (e, t) => {
		var n = e.payload, r = yB(t.getState(), xB(n));
		r?.activeIndex != null && t.dispatch(tT({
			activeIndex: r.activeIndex,
			activeDataKey: void 0,
			activeCoordinate: r.activeCoordinate
		}));
	}
});
var wB = Gs("mouseMove"), TB = Qc(), EB = null, DB = null, OB = null;
TB.startListening({
	actionCreator: wB,
	effect: (e, t) => {
		var n = e.payload, r = t.getState().eventSettings, i = r.throttleDelay, a = r.throttledEvents, o = a === "all" || a?.includes("mousemove");
		EB !== null && (cancelAnimationFrame(EB), EB = null), DB === null || typeof i == "number" && o || (clearTimeout(DB), DB = null), OB = xB(n);
		var s = () => {
			var e = t.getState(), n = zw(e, e.tooltip.settings.shared);
			if (!OB) EB = null, DB = null;
			else {
				if (n === "axis") {
					var r = yB(e, OB);
					r?.activeIndex == null ? t.dispatch(Qw()) : t.dispatch(eT({
						activeIndex: r.activeIndex,
						activeDataKey: void 0,
						activeCoordinate: r.activeCoordinate
					}));
				}
				EB = null, DB = null;
			}
		};
		o ? i === "raf" ? EB = requestAnimationFrame(s) : typeof i == "number" && DB === null && (DB = setTimeout(s, i)) : s();
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/state/reduxDevtoolsJsonStringifyReplacer.js
function kB(e, t) {
	return t instanceof HTMLElement ? `HTMLElement <${t.tagName} class="${t.className}">` : t === window ? "global.window" : e === "children" && typeof t == "object" && t ? "<<CHILDREN>>" : t;
}
// ../../../peach/frontend/node_modules/recharts/es6/state/rootPropsSlice.js
var AB = {
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
}, jB = fc({
	name: "rootProps",
	initialState: AB,
	reducers: { updateOptions: (e, t) => {
		e.accessibilityLayer = t.payload.accessibilityLayer, e.barCategoryGap = t.payload.barCategoryGap, e.barGap = t.payload.barGap ?? AB.barGap, e.barSize = t.payload.barSize, e.maxBarSize = t.payload.maxBarSize, e.stackOffset = t.payload.stackOffset, e.syncId = t.payload.syncId, e.syncMethod = t.payload.syncMethod, e.className = t.payload.className, e.baseValue = t.payload.baseValue, e.reverseStackOrder = t.payload.reverseStackOrder;
	} }
}), MB = jB.reducer, NB = jB.actions.updateOptions, PB = fc({
	name: "polarOptions",
	initialState: null,
	reducers: { updatePolarOptions: (e, t) => e === null ? t.payload : (e.startAngle = t.payload.startAngle, e.endAngle = t.payload.endAngle, e.cx = t.payload.cx, e.cy = t.payload.cy, e.innerRadius = t.payload.innerRadius, e.outerRadius = t.payload.outerRadius, e) }
}), FB = PB.actions.updatePolarOptions, IB = PB.reducer, LB = Gs("keyDown"), RB = Gs("focus"), zB = Gs("blur"), BB = Qc(), VB = null, HB = null, UB = null;
BB.startListening({
	actionCreator: LB,
	effect: (e, t) => {
		UB = e.payload, VB !== null && (cancelAnimationFrame(VB), VB = null);
		var n = t.getState().eventSettings, r = n.throttleDelay, i = n.throttledEvents, a = i === "all" || i.includes("keydown");
		HB === null || typeof r == "number" && a || (clearTimeout(HB), HB = null);
		var o = () => {
			try {
				var e = t.getState();
				if (e.rootProps.accessibilityLayer === !1) return;
				var n = e.tooltip.keyboardInteraction, r = UB;
				if (r !== "ArrowRight" && r !== "ArrowLeft" && r !== "Enter") return;
				var i = gT(n, RT(e), uC(e), qT(e)), a = i == null ? -1 : Number(i), o = !Number.isFinite(a) || a < 0, s = QT(e), c = RT(e), l = zw(e, e.tooltip.settings.shared);
				if (r === "Enter") {
					if (o) return;
					var u = IE(e, l, "hover", String(n.index));
					t.dispatch(rT({
						active: !n.active,
						activeIndex: n.index,
						activeCoordinate: u
					}));
					return;
				}
				var d = Fw(e) === "left-to-right" ? 1 : -1, f = r === "ArrowRight" ? 1 : -1, p;
				if (o) {
					var m = uC(e), h = qT(e), g = f * d, _ = (e) => ({
						active: !1,
						index: String(e),
						dataKey: void 0,
						graphicalItemId: void 0,
						coordinate: void 0
					});
					if (p = -1, g > 0) {
						for (var v = 0; v < c.length; v++) if (gT(_(v), c, m, h) != null) {
							p = v;
							break;
						}
					} else for (var y = c.length - 1; y >= 0; y--) if (gT(_(y), c, m, h) != null) {
						p = y;
						break;
					}
					if (p < 0) return;
				} else {
					p = a + f * d;
					var b = s?.length || c.length;
					if (b === 0 || p >= b || p < 0) return;
				}
				var x = IE(e, l, "hover", String(p));
				t.dispatch(rT({
					active: !0,
					activeIndex: p.toString(),
					activeCoordinate: x
				}));
			} finally {
				VB = null, HB = null;
			}
		};
		a ? r === "raf" ? VB = requestAnimationFrame(o) : typeof r == "number" && HB === null && (o(), UB = null, HB = setTimeout(() => {
			UB ? o() : (HB = null, VB = null);
		}, r)) : o();
	}
}), BB.startListening({
	actionCreator: RB,
	effect: (e, t) => {
		var n = t.getState();
		if (n.rootProps.accessibilityLayer !== !1) {
			var r = n.tooltip.keyboardInteraction;
			if (!r.active && r.index == null) {
				var i = "0", a = IE(n, zw(n, n.tooltip.settings.shared), "hover", String(i));
				t.dispatch(rT({
					active: !0,
					activeIndex: i,
					activeCoordinate: a
				}));
			}
		}
	}
}), BB.startListening({
	actionCreator: zB,
	effect: (e, t) => {
		var n = t.getState();
		if (n.rootProps.accessibilityLayer !== !1) {
			var r = n.tooltip.keyboardInteraction;
			r.active && t.dispatch(rT({
				active: !1,
				activeIndex: r.index,
				activeCoordinate: r.coordinate
			}));
		}
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/util/createEventProxy.js
function WB(e) {
	e.persist();
	var t = e.currentTarget;
	return new Proxy(e, { get: (e, n) => {
		if (n === "currentTarget") return t;
		var r = Reflect.get(e, n);
		return typeof r == "function" ? r.bind(e) : r;
	} });
}
// ../../../peach/frontend/node_modules/recharts/es6/state/externalEventsMiddleware.js
var GB = Gs("externalEvent"), KB = Qc(), qB = /* @__PURE__ */ new Map(), JB = /* @__PURE__ */ new Map(), YB = /* @__PURE__ */ new Map();
KB.startListening({
	actionCreator: GB,
	effect: (e, t) => {
		var n = e.payload, r = n.handler, i = n.reactEvent;
		if (r != null) {
			var a = i.type, o = WB(i);
			YB.set(a, {
				handler: r,
				reactEvent: o
			});
			var s = qB.get(a);
			s !== void 0 && (cancelAnimationFrame(s), qB.delete(a));
			var c = t.getState().eventSettings, l = c.throttleDelay, u = c.throttledEvents, d = u === "all" || u?.includes(a), f = JB.get(a);
			f === void 0 || typeof l == "number" && d || (clearTimeout(f), JB.delete(a));
			var p = () => {
				var e = YB.get(a);
				try {
					if (!e) return;
					var n = e.handler, r = e.reactEvent, i = t.getState(), o = {
						activeCoordinate: cE(i),
						activeDataKey: aE(i),
						activeIndex: rE(i),
						activeLabel: iE(i),
						activeTooltipIndex: rE(i),
						isTooltipActive: lE(i)
					};
					n && n(o, r);
				} finally {
					qB.delete(a), JB.delete(a), YB.delete(a);
				}
			};
			if (!d) p();
			else if (l === "raf") {
				var m = requestAnimationFrame(p);
				qB.set(a, m);
			} else if (typeof l == "number") {
				if (!JB.has(a)) {
					p();
					var h = setTimeout(p, l);
					JB.set(a, h);
				}
			} else p();
		}
	}
});
var XB = H([
	H([bT], (e) => e.tooltipItemPayloads),
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
}), ZB = Gs("touchMove"), QB = Qc(), $B = null, eV = null, tV = null, nV = null;
QB.startListening({
	actionCreator: ZB,
	effect: (e, t) => {
		var n = e.payload;
		if (n.touches != null && n.touches.length !== 0) {
			nV = WB(n);
			var r = t.getState().eventSettings, i = r.throttleDelay, a = r.throttledEvents, o = a === "all" || a.includes("touchmove");
			$B !== null && (cancelAnimationFrame($B), $B = null), eV === null || typeof i == "number" && o || (clearTimeout(eV), eV = null), tV = Array.from(n.touches).map((e) => xB({
				clientX: e.clientX,
				clientY: e.clientY,
				currentTarget: n.currentTarget
			}));
			var s = () => {
				if (nV != null) {
					var e = t.getState(), n = zw(e, e.tooltip.settings.shared);
					if (n === "axis") {
						var r = tV?.[0];
						if (r == null) {
							$B = null, eV = null;
							return;
						}
						var i = yB(e, r);
						i?.activeIndex != null && t.dispatch(eT({
							activeIndex: i.activeIndex,
							activeDataKey: void 0,
							activeCoordinate: i.activeCoordinate
						}));
					} else if (n === "item") {
						var a = nV.touches[0];
						if (document.elementFromPoint == null || a == null) return;
						var o = document.elementFromPoint(a.clientX, a.clientY);
						if (!o || !o.getAttribute) return;
						var s = o.getAttribute(Vl), c = o.getAttribute("data-recharts-item-id") ?? void 0, l = PT(e).find((e) => e.id === c);
						if (s == null || l == null || c == null) return;
						var u = l.dataKey, d = XB(e, s, c);
						t.dispatch(Xw({
							activeDataKey: u,
							activeIndex: s,
							activeCoordinate: d,
							activeGraphicalItemId: c
						}));
					}
					$B = null, eV = null;
				}
			};
			o ? i === "raf" ? $B = requestAnimationFrame(s) : typeof i == "number" && eV === null && (s(), nV = null, eV = setTimeout(() => {
				nV ? s() : (eV = null, $B = null);
			}, i)) : s();
		}
	}
});
// ../../../peach/frontend/node_modules/recharts/es6/state/eventSettingsSlice.js
var rV = {
	throttleDelay: "raf",
	throttledEvents: [
		"mousemove",
		"touchmove",
		"pointermove",
		"scroll",
		"wheel"
	]
}, iV = fc({
	name: "eventSettings",
	initialState: rV,
	reducers: { setEventSettings: (e, t) => {
		t.payload.throttleDelay != null && (e.throttleDelay = t.payload.throttleDelay), t.payload.throttledEvents != null && (e.throttledEvents = U(t.payload.throttledEvents));
	} }
}), aV = iV.actions.setEventSettings, oV = iV.reducer, sV = ho({
	brush: DP,
	cartesianAxis: ZM,
	chartData: MD,
	errorBars: GI,
	eventSettings: oV,
	graphicalItems: xM,
	layout: ol,
	legend: rd,
	options: TD,
	polarAxis: zA,
	polarOptions: IB,
	referenceElements: IP,
	renderedTicks: FF,
	rootProps: MB,
	tooltip: iT,
	zIndex: oD
}), cV = function(e) {
	var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Chart";
	return nc({
		reducer: sV,
		preloadedState: e,
		middleware: (e) => e({
			serializableCheck: !1,
			immutableCheck: ![
				"commonjs",
				"es6",
				"production"
			].includes("es6")
		}).concat([
			CB.middleware,
			TB.middleware,
			BB.middleware,
			KB.middleware,
			QB.middleware
		]),
		enhancers: (e) => {
			var t = e;
			return typeof e == "function" && (t = e()), t.concat(ec({ type: "raf" }));
		},
		devTools: Sf.devToolsEnabled && {
			serialize: { replacer: kB },
			name: `recharts-${t}`
		}
	});
};
// ../../../peach/frontend/node_modules/recharts/es6/state/RechartsStoreProvider.js
function lV(e) {
	var t = e.preloadedState, n = e.children, r = e.reduxStoreName, i = nu(), a = (0, P.useRef)(null);
	if (i) return n;
	a.current ??= cV(t, r);
	var o = ya;
	return /*#__PURE__*/ P.createElement(yd, {
		context: o,
		store: a.current
	}, n);
}
// ../../../peach/frontend/node_modules/recharts/es6/state/ReportMainChartProps.js
function uV(e) {
	var t = e.layout, n = e.margin, r = B(), i = nu();
	return (0, P.useEffect)(() => {
		i || (r(rl(t)), r(nl(n)));
	}, [
		r,
		i,
		t,
		n
	]), null;
}
var dV = /*#__PURE__*/ (0, P.memo)(uV, Sd);
// ../../../peach/frontend/node_modules/recharts/es6/state/ReportChartProps.js
function fV(e) {
	var t = B();
	return (0, P.useEffect)(() => {
		t(NB(e));
	}, [t, e]), null;
}
var pV = /*#__PURE__*/ (0, P.memo)((e) => {
	var t = B();
	return (0, P.useEffect)(() => {
		t(aV(e));
	}, [t, e]), null;
}, Sd);
// ../../../peach/frontend/node_modules/recharts/es6/zIndex/ZIndexPortal.js
function mV(e) {
	var t = e.zIndex, n = e.isPanorama, r = (0, P.useRef)(null), i = B();
	return (0, P.useLayoutEffect)(() => (r.current && i(iD({
		zIndex: t,
		element: r.current,
		isPanorama: n
	})), () => {
		i(aD({
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
function hV(e) {
	var t = e.children, n = e.isPanorama, r = V(GE);
	if (!r || r.length === 0) return t;
	var i = r.filter((e) => e < 0), a = r.filter((e) => e > 0);
	return /*#__PURE__*/ P.createElement(P.Fragment, null, i.map((e) => /*#__PURE__*/ P.createElement(mV, {
		key: e,
		zIndex: e,
		isPanorama: n
	})), t, a.map((e) => /*#__PURE__*/ P.createElement(mV, {
		key: e,
		zIndex: e,
		isPanorama: n
	})));
}
// ../../../peach/frontend/node_modules/recharts/es6/container/RootSurface.js
var gV = ["children"];
function _V(e, t) {
	if (e == null) return {};
	var n, r, i = vV(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function vV(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function yV() {
	return yV = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, yV.apply(null, arguments);
}
var bV = {
	width: "100%",
	height: "100%",
	display: "block"
}, xV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = Vu(), r = Hu(), i = Wf();
	if (!cl(n) || !cl(r)) return null;
	var a = e.children, o = e.otherAttributes, s = e.title, c = e.desc, l, u;
	return o != null && (l = typeof o.tabIndex == "number" ? o.tabIndex : i ? 0 : void 0, u = typeof o.role == "string" ? o.role : i ? "application" : void 0), /*#__PURE__*/ P.createElement(gt, yV({}, o, {
		title: s,
		desc: c,
		role: u,
		tabIndex: l,
		width: n,
		height: r,
		style: bV,
		ref: t
	}), a);
}), SV = (e) => {
	var t = e.children, n = V(iu);
	if (!n) return null;
	var r = n.width, i = n.height, a = n.y, o = n.x;
	return /*#__PURE__*/ P.createElement(gt, {
		width: r,
		height: i,
		x: o,
		y: a
	}, t);
}, CV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.children, r = _V(e, gV);
	return nu() ? /*#__PURE__*/ P.createElement(SV, null, /*#__PURE__*/ P.createElement(hV, { isPanorama: !0 }, n)) : /*#__PURE__*/ P.createElement(xV, yV({ ref: t }, r), /*#__PURE__*/ P.createElement(hV, { isPanorama: !1 }, n));
});
// ../../../peach/frontend/node_modules/recharts/es6/util/useReportScale.js
function wV(e, t) {
	return kV(e) || OV(e, t) || EV(e, t) || TV();
}
function TV() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function EV(e, t) {
	if (e) {
		if (typeof e == "string") return DV(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? DV(e, t) : void 0;
	}
}
function DV(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function OV(e, t) {
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
function kV(e) {
	if (Array.isArray(e)) return e;
}
function AV() {
	var e = B(), t = wV((0, P.useState)(null), 2), n = t[0], r = t[1], i = V(Ll);
	return (0, P.useEffect)(() => {
		if (n != null) {
			var t = n.getBoundingClientRect().width / n.offsetWidth;
			G(t) && t !== i && e(al(t));
		}
	}, [
		n,
		e,
		i
	]), r;
}
// ../../../peach/frontend/node_modules/recharts/es6/chart/RechartsWrapper.js
function jV(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function MV(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? jV(Object(n), !0).forEach(function(t) {
			NV(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jV(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function NV(e, t, n) {
	return (t = PV(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function PV(e) {
	var t = FV(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function FV(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function IV() {
	return IV = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, IV.apply(null, arguments);
}
function LV(e, t) {
	return HV(e) || VV(e, t) || zV(e, t) || RV();
}
function RV() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function zV(e, t) {
	if (e) {
		if (typeof e == "string") return BV(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? BV(e, t) : void 0;
	}
}
function BV(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function VV(e, t) {
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
function HV(e) {
	if (Array.isArray(e)) return e;
}
var UV = () => (UD(), null);
function WV(e) {
	if (typeof e == "number") return e;
	if (typeof e == "string") {
		var t = parseFloat(e);
		if (!Number.isNaN(t)) return t;
	}
	return 0;
}
var GV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = (0, P.useRef)(null), r = LV((0, P.useState)({
		containerWidth: WV(e.style?.width),
		containerHeight: WV(e.style?.height)
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
	}, [o]), /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Yu, {
		width: i.containerWidth,
		height: i.containerHeight
	}), /*#__PURE__*/ P.createElement("div", IV({ ref: s }, e)));
}), KV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.width, r = e.height, i = LV((0, P.useState)({
		containerWidth: WV(n),
		containerHeight: WV(r)
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
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Yu, {
		width: a.containerWidth,
		height: a.containerHeight
	}), /*#__PURE__*/ P.createElement("div", IV({ ref: c }, e)));
}), qV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.width, r = e.height;
	return /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Yu, {
		width: n,
		height: r
	}), /*#__PURE__*/ P.createElement("div", IV({ ref: t }, e)));
}), JV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.width, r = e.height;
	return typeof n == "string" || typeof r == "string" ? /*#__PURE__*/ P.createElement(KV, IV({}, e, { ref: t })) : typeof n == "number" && typeof r == "number" ? /*#__PURE__*/ P.createElement(qV, IV({}, e, {
		width: n,
		height: r,
		ref: t
	})) : /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Yu, {
		width: n,
		height: r
	}), /*#__PURE__*/ P.createElement("div", IV({ ref: t }, e)));
});
function YV(e) {
	return e ? GV : JV;
}
var XV = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.children, r = e.className, i = e.height, a = e.onClick, o = e.onContextMenu, s = e.onDoubleClick, c = e.onMouseDown, l = e.onMouseEnter, u = e.onMouseLeave, d = e.onMouseMove, f = e.onMouseUp, p = e.onTouchEnd, m = e.onTouchMove, h = e.onTouchStart, g = e.style, _ = e.width, v = e.responsive, y = e.dispatchTouchEvents, b = y === void 0 || y, x = (0, P.useRef)(null), S = B(), C = LV((0, P.useState)(null), 2), w = C[0], T = C[1], E = LV((0, P.useState)(null), 2), D = E[0], O = E[1], k = AV(), A = Fu(), j = A?.width > 0 ? A.width : _, M = A?.height > 0 ? A.height : i, ee = (0, P.useCallback)((e) => {
		k(e), typeof t == "function" && t(e), T(e), O(e), e != null && (x.current = e);
	}, [
		k,
		t,
		T,
		O
	]), te = (0, P.useCallback)((e) => {
		S(SB(e)), S(GB({
			handler: a,
			reactEvent: e
		}));
	}, [S, a]), ne = (0, P.useCallback)((e) => {
		S(wB(e)), S(GB({
			handler: l,
			reactEvent: e
		}));
	}, [S, l]), re = (0, P.useCallback)((e) => {
		S(Qw()), S(GB({
			handler: u,
			reactEvent: e
		}));
	}, [S, u]), ie = (0, P.useCallback)((e) => {
		S(wB(e)), S(GB({
			handler: d,
			reactEvent: e
		}));
	}, [S, d]), ae = (0, P.useCallback)(() => {
		S(RB());
	}, [S]), oe = (0, P.useCallback)(() => {
		S(zB());
	}, [S]), se = (0, P.useCallback)((e) => {
		S(LB(e.key));
	}, [S]), ce = (0, P.useCallback)((e) => {
		S(GB({
			handler: o,
			reactEvent: e
		}));
	}, [S, o]), le = (0, P.useCallback)((e) => {
		S(GB({
			handler: s,
			reactEvent: e
		}));
	}, [S, s]), ue = (0, P.useCallback)((e) => {
		S(GB({
			handler: c,
			reactEvent: e
		}));
	}, [S, c]), de = (0, P.useCallback)((e) => {
		S(GB({
			handler: f,
			reactEvent: e
		}));
	}, [S, f]), fe = (0, P.useCallback)((e) => {
		S(GB({
			handler: h,
			reactEvent: e
		}));
	}, [S, h]), pe = (0, P.useCallback)((e) => {
		b && S(ZB(e)), S(GB({
			handler: m,
			reactEvent: e
		}));
	}, [
		S,
		b,
		m
	]), me = (0, P.useCallback)((e) => {
		S(GB({
			handler: p,
			reactEvent: e
		}));
	}, [S, p]), he = YV(v);
	return /*#__PURE__*/ P.createElement(_D.Provider, { value: w }, /*#__PURE__*/ P.createElement(tn.Provider, { value: D }, /*#__PURE__*/ P.createElement(he, {
		width: j ?? g?.width,
		height: M ?? g?.height,
		className: N("recharts-wrapper", r),
		style: MV({
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
	}, /*#__PURE__*/ P.createElement(UV, null), n)));
}), ZV = [
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
function QV(e, t) {
	if (e == null) return {};
	var n, r, i = $V(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function $V(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
var eH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = e.width, r = e.height, i = e.responsive, a = e.children, o = e.className, s = e.style, c = e.compact, l = e.title, u = e.desc, d = ct(QV(e, ZV));
	return c ? /*#__PURE__*/ P.createElement(P.Fragment, null, /*#__PURE__*/ P.createElement(Yu, {
		width: n,
		height: r
	}), /*#__PURE__*/ P.createElement(CV, {
		otherAttributes: d,
		title: l,
		desc: u
	}, a)) : /*#__PURE__*/ P.createElement(XV, {
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
	}, /*#__PURE__*/ P.createElement(CV, {
		otherAttributes: d,
		title: l,
		desc: u,
		ref: t
	}, /*#__PURE__*/ P.createElement(WP, null, a)));
});
// ../../../peach/frontend/node_modules/recharts/es6/chart/CartesianChart.js
function tH() {
	return tH = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, tH.apply(null, arguments);
}
function nH(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function rH(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? nH(Object(n), !0).forEach(function(t) {
			iH(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : nH(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function iH(e, t, n) {
	return (t = aH(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function aH(e) {
	var t = oH(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function oH(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var sH = rH({
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
}, rV), cH = /*#__PURE__*/ (0, P.forwardRef)(function(e, t) {
	var n = Xr(e.categoricalChartProps, sH), r = e.chartName, i = e.defaultTooltipEventType, a = e.validateTooltipEventTypes, o = e.tooltipPayloadSearcher, s = e.categoricalChartProps, c = {
		chartName: r,
		defaultTooltipEventType: i,
		validateTooltipEventTypes: a,
		tooltipPayloadSearcher: o,
		eventEmitter: void 0
	};
	return /*#__PURE__*/ P.createElement(lV, {
		preloadedState: { options: c },
		reduxStoreName: s.id ?? r
	}, /*#__PURE__*/ P.createElement(wP, { chartData: s.data }), /*#__PURE__*/ P.createElement(dV, {
		layout: n.layout,
		margin: n.margin
	}), /*#__PURE__*/ P.createElement(pV, {
		throttleDelay: n.throttleDelay,
		throttledEvents: n.throttledEvents
	}), /*#__PURE__*/ P.createElement(fV, {
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
	}), /*#__PURE__*/ P.createElement(eH, tH({}, n, { ref: t })));
}), lH = ["axis"], uH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => /*#__PURE__*/ P.createElement(cH, {
	chartName: "LineChart",
	defaultTooltipEventType: "axis",
	validateTooltipEventTypes: lH,
	tooltipPayloadSearcher: CD,
	categoricalChartProps: e,
	ref: t
})), dH = ["axis", "item"], fH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => /*#__PURE__*/ P.createElement(cH, {
	chartName: "BarChart",
	defaultTooltipEventType: "axis",
	validateTooltipEventTypes: dH,
	tooltipPayloadSearcher: CD,
	categoricalChartProps: e,
	ref: t
}));
// ../../../peach/frontend/node_modules/recharts/es6/state/ReportPolarOptions.js
function pH(e) {
	var t = B();
	return (0, P.useEffect)(() => {
		t(FB(e));
	}, [t, e]), null;
}
// ../../../peach/frontend/node_modules/recharts/es6/chart/PolarChart.js
var mH = ["layout"];
function hH() {
	return hH = Object.assign ? Object.assign.bind() : function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}, hH.apply(null, arguments);
}
function gH(e, t) {
	if (e == null) return {};
	var n, r, i = _H(e, t);
	if (Object.getOwnPropertySymbols) {
		var a = Object.getOwnPropertySymbols(e);
		for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
	}
	return i;
}
function _H(e, t) {
	if (e == null) return {};
	var n = {};
	for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
		if (t.indexOf(r) !== -1) continue;
		n[r] = e[r];
	}
	return n;
}
function vH(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function yH(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? vH(Object(n), !0).forEach(function(t) {
			bH(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : vH(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function bH(e, t, n) {
	return (t = xH(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function xH(e) {
	var t = SH(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function SH(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var CH = yH({
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
}, rV), wH = /*#__PURE__*/ (0, P.forwardRef)(function(e, t) {
	var n = Xr(e.categoricalChartProps, CH), r = n.layout, i = gH(n, mH), a = e.chartName, o = {
		chartName: a,
		defaultTooltipEventType: e.defaultTooltipEventType,
		validateTooltipEventTypes: e.validateTooltipEventTypes,
		tooltipPayloadSearcher: e.tooltipPayloadSearcher,
		eventEmitter: void 0
	};
	return /*#__PURE__*/ P.createElement(lV, {
		preloadedState: { options: o },
		reduxStoreName: n.id ?? a
	}, /*#__PURE__*/ P.createElement(wP, { chartData: n.data }), /*#__PURE__*/ P.createElement(dV, {
		layout: r,
		margin: n.margin
	}), /*#__PURE__*/ P.createElement(pV, {
		throttleDelay: n.throttleDelay,
		throttledEvents: n.throttledEvents
	}), /*#__PURE__*/ P.createElement(fV, {
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
	}), /*#__PURE__*/ P.createElement(pH, {
		cx: n.cx,
		cy: n.cy,
		startAngle: n.startAngle,
		endAngle: n.endAngle,
		innerRadius: n.innerRadius,
		outerRadius: n.outerRadius
	}), /*#__PURE__*/ P.createElement(eH, hH({}, i, { ref: t })));
}), TH = ["axis"], EH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => /*#__PURE__*/ P.createElement(cH, {
	chartName: "AreaChart",
	defaultTooltipEventType: "axis",
	validateTooltipEventTypes: TH,
	tooltipPayloadSearcher: CD,
	categoricalChartProps: e,
	ref: t
}));
// ../../../peach/frontend/node_modules/recharts/es6/chart/RadialBarChart.js
function DH(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function OH(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? DH(Object(n), !0).forEach(function(t) {
			kH(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : DH(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
function kH(e, t, n) {
	return (t = AH(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function AH(e) {
	var t = jH(e, "string");
	return typeof t == "symbol" ? t : t + "";
}
function jH(e, t) {
	if (typeof e != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (typeof r != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
var MH = ["axis", "item"], NH = OH(OH({}, CH), {}, {
	layout: "radial",
	startAngle: 0,
	endAngle: 360
}), PH = /*#__PURE__*/ (0, P.forwardRef)((e, t) => {
	var n = Xr(e, NH);
	return /*#__PURE__*/ P.createElement(wH, {
		chartName: "RadialBarChart",
		defaultTooltipEventType: "axis",
		validateTooltipEventTypes: MH,
		tooltipPayloadSearcher: CD,
		categoricalChartProps: n,
		ref: t
	});
});
// src/react/charts/cn.ts
function FH(...e) {
	return te(N(e));
}
// src/react/evilcharts/registry/ui/recharts-chart.tsx
var $ = Te(), IH = {
	light: "",
	dark: ".dark"
}, LH = Object.keys(IH);
function RH(e) {
	for (let [t, n] of Object.entries(e)) if (n.colors && !LH.some((e) => n.colors?.[e] !== void 0)) throw Error(`[EvilCharts] Invalid chart config for "${t}": colors object must have at least one theme key (${LH.join(", ")}). Received empty object or invalid keys.`);
}
var zH = P.createContext(null);
function BH() {
	let e = P.useContext(zH);
	if (!e) throw Error("useChart must be used within a <ChartContainer />");
	return e;
}
function VH({ id: e, config: t, initialDimension: n = {
	width: 320,
	height: 200
}, className: r, children: i, footer: a, ...o }) {
	let s = P.useId(), c = `chart-${e ?? s.replace(/:/g, "")}`;
	return RH(t), /* @__PURE__ */ (0, $.jsx)(zH.Provider, {
		value: { config: t },
		children: /* @__PURE__ */ (0, $.jsxs)("div", {
			"data-slot": "chart",
			"data-chart": c,
			className: FH("min-h-0 w-full flex-1", "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border relative flex flex-col justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden", !a && "aspect-video", r),
			...o,
			children: [
				/* @__PURE__ */ (0, $.jsx)(WH, {
					id: c,
					config: t
				}),
				/* @__PURE__ */ (0, $.jsx)(Lu, {
					className: "min-h-0 w-full flex-1",
					initialDimension: n,
					children: i
				}),
				a
			]
		})
	});
}
function HH({ isLoading: e }) {
	return e ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: "pointer-events-none absolute inset-0 z-20 flex items-center justify-center",
		children: /* @__PURE__ */ (0, $.jsxs)("div", {
			className: "text-primary bg-background flex items-center justify-center gap-2 rounded-md border px-2 py-0.5 text-sm",
			children: [/* @__PURE__ */ (0, $.jsx)("div", { className: "border-border border-t-primary h-3 w-3 animate-spin rounded-full border" }), /* @__PURE__ */ (0, $.jsx)("span", { children: "Loading" })]
		})
	}) : null;
}
function UH(e, t) {
	let n = e.length;
	if (n >= t) return e.slice(0, t);
	let r = [], i = Math.floor(t / n), a = t % n;
	for (let t = 0; t < n; t++) {
		let o = i + +(t >= n - a);
		for (let n = 0; n < o; n++) r.push(e[t]);
	}
	return r;
}
var WH = ({ id: e, config: t }) => {
	let n = Object.entries(t).filter(([, e]) => e.colors);
	if (!n.length) return null;
	let r = (e) => n.flatMap(([t, n]) => {
		let r = n.colors?.[e];
		return !r || !Array.isArray(r) || r.length === 0 ? [] : UH(r, KH(n)).map((e, n) => `  --color-${t}-${n}: ${e};`);
	}).filter(Boolean).join("\n"), i = Object.entries(IH).map(([t, n]) => `${n} [data-chart=${e}] {\n${r(t)}\n}`).join("\n");
	return /* @__PURE__ */ (0, $.jsx)("style", { dangerouslySetInnerHTML: { __html: i } });
};
function GH(e, t, n) {
	if (typeof t != "object" || !t) return;
	let r = "payload" in t && typeof t.payload == "object" && t.payload !== null ? t.payload : void 0, i = n;
	return n in t && typeof t[n] == "string" ? i = t[n] : r && n in r && typeof r[n] == "string" && (i = r[n]), i in e ? e[i] : e[n];
}
function KH(e) {
	if (!e.colors) return 1;
	let t = LH.map((t) => e.colors?.[t]?.length ?? 0);
	return Math.max(...t, 1);
}
var qH = (e = 10, t = 0, n = 70) => {
	let r = n - t;
	return Array.from({ length: e }, () => ({ loading: Math.floor(Math.random() * r) + t }));
}, JH = {
	sm: "rounded-sm",
	md: "rounded-md",
	lg: "rounded-lg",
	xl: "rounded-xl"
}, YH = {
	default: "bg-background",
	"frosted-glass": "bg-background/70 backdrop-blur-sm"
};
function XH({ active: e, payload: t, className: n, indicator: r = "dot", hideLabel: i = !1, hideIndicator: a = !1, label: o, labelFormatter: s, labelClassName: c, formatter: l, nameKey: u, labelKey: d, selected: f, roundness: p = "lg", variant: m = "default" }) {
	let { config: h } = BH(), g = P.useMemo(() => {
		if (i || !t?.length) return null;
		let [e] = t, n = `${d ?? e?.dataKey ?? e?.name ?? "value"}`, r = GH(h, e, n), a = !d && typeof o == "string" ? h[o]?.label ?? o : r?.label;
		return s ? /* @__PURE__ */ (0, $.jsx)("div", {
			className: FH("font-medium", c),
			children: s(a, t)
		}) : a ? /* @__PURE__ */ (0, $.jsx)("div", {
			className: FH("font-medium", c),
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
		className: FH("border-border/50 grid min-w-32 items-start gap-1.5 border px-2.5 py-1.5 text-xs shadow-xl", JH[p], YH[m], n),
		children: [_ ? null : g, /* @__PURE__ */ (0, $.jsx)("div", {
			className: "grid gap-1.5",
			children: t.filter((e) => e.type !== "none").map((e, t) => {
				let n = `${(u && e.payload ? e.payload[u] : void 0) ?? e.name ?? e.dataKey ?? "value"}`, i = GH(h, e, n), o = i ? KH(i) : 1;
				return /* @__PURE__ */ (0, $.jsx)("div", {
					className: FH("[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5", r === "dot" && "items-center", f != null && f !== e.dataKey && "opacity-30"),
					children: l && e?.value !== void 0 && e.name ? l(e.value, e.name, e, t, e.payload) : /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [i?.icon ? /* @__PURE__ */ (0, $.jsx)(i.icon, {}) : !a && /* @__PURE__ */ (0, $.jsx)("div", {
						className: FH("shrink-0 rounded-[2px]", {
							"h-2.5 w-2.5": r === "dot",
							"w-1": r === "line",
							"w-0 border-[1.5px] border-dashed bg-transparent!": r === "dashed",
							"my-0.5": _ && r === "dashed"
						}),
						style: ZH(n, o)
					}), /* @__PURE__ */ (0, $.jsxs)("div", {
						className: FH("flex flex-1 justify-between gap-4 leading-none", _ ? "items-end" : "items-center"),
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
function ZH(e, t) {
	return t <= 1 ? { background: `var(--color-${e}-0)` } : { background: `linear-gradient(to right, ${Array.from({ length: t }, (n, r) => `var(--color-${e}-${r}) ${r / (t - 1) * 100}%`).join(", ")})` };
}
var QH = ({ animationDuration: e = 200, ...t }) => /* @__PURE__ */ (0, $.jsx)(oO, {
	animationDuration: e,
	...t
});
// src/react/evilcharts/registry/ui/recharts-legend.tsx
function $H({ className: e, hideIcon: t = !1, nameKey: n, payload: r, verticalAlign: i, align: a = "right", selected: o, onSelectChange: s, isClickable: c, variant: l = "rounded-square" }) {
	let { config: u } = BH();
	return r?.length ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: FH("flex items-center gap-4 select-none", a === "left" && "justify-start", a === "center" && "justify-center", a === "right" && "justify-end", i === "top" ? "pb-4" : "pt-4", e),
		children: r.filter((e) => e.type !== "none").map((e) => {
			let r = `${(n && e.payload ? e.payload[n] : void 0) ?? e.value ?? e.dataKey ?? "value"}`, i = GH(u, e, r), a = o === null || o === r, d = i ? KH(i) : 1;
			return /* @__PURE__ */ (0, $.jsxs)("div", {
				className: FH("[&>svg]:text-muted-foreground flex items-center gap-1.5 transition-opacity [&>svg]:h-3 [&>svg]:w-3", !a && "opacity-30", c && "cursor-pointer"),
				onClick: () => {
					c && s?.(o === r ? null : r);
				},
				children: [i?.icon && !t ? /* @__PURE__ */ (0, $.jsx)(i.icon, {}) : /* @__PURE__ */ (0, $.jsx)(eU, {
					variant: l,
					dataKey: r,
					colorsCount: d
				}), i?.label]
			}, r);
		})
	}) : null;
}
function eU({ variant: e, dataKey: t, colorsCount: n }) {
	let r = tU(t, n), i = nU(t, n);
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
function tU(e, t) {
	return t <= 1 ? { backgroundColor: `var(--color-${e}-0)` } : { background: `linear-gradient(to right, ${Array.from({ length: t }, (n, r) => `var(--color-${e}-${r}) ${r / (t - 1) * 100}%`).join(", ")})` };
}
function nU(e, t) {
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
var rU = Qd, iU = () => null, aU = {
	stiffness: 300,
	damping: 35,
	mass: .8
};
function oU({ range: e, totalPoints: t, containerRef: n, commit: r }) {
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
function sU({ data: e, chartConfig: t, dataKeys: n, xDataKey: r, variant: i = "area", height: a = 56, className: o, stacked: s = !1, strokeVariant: c = "solid", connectNulls: l = !1, barRadius: u, startIndex: d, endIndex: f, defaultStartIndex: p = 0, defaultEndIndex: m, onChange: h, formatLabel: g, curveType: _ = "monotone", minSpan: v = 2, showLabels: y = !0, skipStyle: b = !1 }) {
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
	}, [C, v]), { isDragging: A, bind: j } = oU({
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
	let N = C > 1 ? M.startIndex / (C - 1) * 100 : 0, ee = C > 1 ? M.endIndex / (C - 1) * 100 : 100, te = Ye(N), ne = Ye(ee);
	te.get() !== N && te.set(N), ne.get() !== ee && ne.set(ee);
	let re = $e(te, aU), ie = $e(ne, aU), ae = et(re, (e) => `${e}%`), oe = et(ie, (e) => `${e}%`), se = et(re, (e) => `${e}%`), ce = et(ie, (e) => `${Math.max(0, 100 - e)}%`), le = Ye(`${Math.max(0, ee - N)}%`), ue = (0, P.useCallback)(() => {
		le.set(`${Math.max(0, ie.get() - re.get())}%`);
	}, [
		re,
		ie,
		le
	]);
	Je(re, "change", ue), Je(ie, "change", ue);
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
		className: FH("group relative select-none", o),
		style: { height: a },
		children: [
			!b && /* @__PURE__ */ (0, $.jsx)(WH, {
				id: w,
				config: t
			}),
			/* @__PURE__ */ (0, $.jsx)("div", {
				className: "absolute inset-0 overflow-hidden rounded-md",
				children: /* @__PURE__ */ (0, $.jsx)(lU, {
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
			/* @__PURE__ */ (0, $.jsx)(cU, {
				side: "left",
				position: ae,
				label: y ? de(M.startIndex) : void 0,
				bind: j("left")
			}),
			/* @__PURE__ */ (0, $.jsx)(cU, {
				side: "right",
				position: oe,
				label: y ? de(M.endIndex) : void 0,
				bind: j("right")
			})
		]
	});
}
function cU({ side: e, position: t, label: n, bind: r }) {
	let i = e === "left";
	return /* @__PURE__ */ (0, $.jsxs)(me.div, {
		className: "absolute inset-y-0 z-10",
		style: { left: t },
		children: [/* @__PURE__ */ (0, $.jsx)("div", {
			className: FH("group absolute inset-y-0 flex w-3 cursor-ew-resize touch-none items-center justify-center after:absolute after:inset-y-0 after:-left-4 after:w-11 after:content-['']", i ? "" : "-translate-x-full"),
			...r,
			children: /* @__PURE__ */ (0, $.jsx)("div", {
				className: FH("bg-muted-foreground group-hover:bg-foreground relative flex h-4 w-1.5 items-center justify-center rounded-md transition-colors", i ? "-left-[5.5px]" : "-right-[5.5px]"),
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
			className: FH("bg-foreground text-background pointer-events-none absolute -bottom-3 -translate-y-1/2 rounded-[3px] px-1 py-px text-[8px] leading-tight font-medium whitespace-nowrap opacity-0 group-hover:opacity-100", i ? "left-1.5" : "right-1.5"),
			children: n
		})]
	});
}
function lU({ data: e, keys: t, chartConfig: n, variant: r, curveType: i, chartId: a, stacked: o, strokeVariant: s = "solid", connectNulls: c = !1, barRadius: l }) {
	let u = P.useMemo(() => Object.entries(n).filter(([e]) => t.includes(e)).map(([e, t]) => ({
		dataKey: e,
		colorsCount: KH(t)
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
	if (r === "line") return /* @__PURE__ */ (0, $.jsx)(Lu, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, $.jsxs)(uH, {
			data: e,
			margin: {
				top: 4,
				right: 0,
				bottom: 0,
				left: 0
			},
			children: [/* @__PURE__ */ (0, $.jsx)("defs", { children: f }), t.map((e) => /* @__PURE__ */ (0, $.jsx)(PL, {
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
		return /* @__PURE__ */ (0, $.jsx)(Lu, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, $.jsxs)(fH, {
				data: e,
				margin: {
					top: 2,
					right: 0,
					bottom: 0,
					left: 0
				},
				barGap: 2,
				barSize: 14,
				children: [/* @__PURE__ */ (0, $.jsx)("defs", { children: f }), t.map((e) => /* @__PURE__ */ (0, $.jsx)(Iz, {
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
	return /* @__PURE__ */ (0, $.jsx)(Lu, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, $.jsxs)(EH, {
			data: e,
			margin: {
				top: 4,
				right: 0,
				bottom: 0,
				left: 0
			},
			children: [/* @__PURE__ */ (0, $.jsx)("defs", { children: f }), t.map((e) => /* @__PURE__ */ (0, $.jsx)(DR, {
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
function uU({ data: e, defaultStartIndex: t = 0, defaultEndIndex: n }) {
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
var dU = {
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
function fU({ variant: e }) {
	let t = (0, P.useId)().replace(/:/g, ""), n = `${t}-bg-${e}`, r = `${t}-bg-edge-fade`, i = `${t}-bg-blur`, a = dU[e];
	return /* @__PURE__ */ (0, $.jsxs)(sD, {
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
var pU = 2, mU = "loading", hU = 2e3, gU = "evil-stacked", _U = .5, vU = .05, yU = [
	0,
	.7,
	.5,
	1
], bU = (0, P.createContext)(null);
function xU() {
	let e = (0, P.use)(bU);
	if (!e) throw Error("Bar chart parts (<Bar />, <XAxis />, …) must be used within <EvilBarChart />");
	return e;
}
function SU({ config: e, data: t, children: n, className: r, chartProps: i, stackType: a = "default", layout: o = "vertical", barRadius: s = pU, animationType: c = "left-to-right", barGap: l, barCategoryGap: u, backgroundVariant: d, defaultSelectedDataKey: f = null, onSelectionChange: p, isLoading: m = !1, loadingBars: h, xDataKey: g }) {
	let _ = (0, P.useId)().replace(/:/g, ""), [v] = (0, P.useState)(() => Date.now()), [y, b] = (0, P.useState)(f), [x, S] = (0, P.useState)(!1), { loadingData: C, onShimmerExit: w } = HU(m, h), { visibleData: T, brushProps: E } = uU({ data: t }), D = (0, P.useMemo)(() => {
		let e = P.Children.toArray(n), t = e.find((e) => (0, P.isValidElement)(e) && e.type === iU), r = (0, P.isValidElement)(t) ? t.props : {};
		return {
			slot: {
				present: (0, P.isValidElement)(t),
				height: r.height,
				formatLabel: r.formatLabel,
				onChange: r.onChange
			},
			chartChildren: e.filter((e) => !((0, P.isValidElement)(e) && e.type === iU))
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
	return /* @__PURE__ */ (0, $.jsx)(bU, {
		value: N,
		children: /* @__PURE__ */ (0, $.jsxs)(VH, {
			className: r,
			config: e,
			footer: O && !m && /* @__PURE__ */ (0, $.jsx)(sU, {
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
			children: [/* @__PURE__ */ (0, $.jsx)(HH, { isLoading: m }), /* @__PURE__ */ (0, $.jsxs)(fH, {
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
					d && /* @__PURE__ */ (0, $.jsx)(fU, { variant: d }),
					/* @__PURE__ */ (0, $.jsx)(sF, { color: "white" }),
					D.chartChildren,
					m && /* @__PURE__ */ (0, $.jsx)(UU, {
						chartId: _,
						onShimmerExit: w
					})
				]
			})]
		})
	});
}
function CU({ dataKey: e, variant: t = "default", radius: n, animationType: r, isClickable: i = !1, enableHoverHighlight: a = !1, glowing: o = !1, bufferBar: s = !1, barProps: c }) {
	let { config: l, isStacked: u, isHorizontal: d, isLoading: f, barRadius: p, animationType: m, introStartedAt: h, dataLength: g, selectedDataKey: _, selectDataKey: v, isMouseInChart: y } = xU(), b = (0, P.useId)().replace(/:/g, ""), x = Le();
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
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(Iz, {
		dataKey: e,
		stackId: u ? gU : void 0,
		fill: `url(#${b}-colors-${e})`,
		radius: S,
		isAnimationActive: !1,
		style: i || a ? { cursor: "pointer" } : void 0,
		shape: (e) => /* @__PURE__ */ (0, $.jsx)(kU, {
			...e,
			...T,
			animationType: w
		}),
		activeBar: (e) => /* @__PURE__ */ (0, $.jsx)(kU, {
			...e,
			...T,
			animationType: "none"
		}),
		...c
	}), /* @__PURE__ */ (0, $.jsxs)("defs", { children: [
		/* @__PURE__ */ (0, $.jsx)(NU, {
			id: b,
			dataKey: e,
			config: l
		}),
		t === "hatched" && /* @__PURE__ */ (0, $.jsx)(PU, {
			id: b,
			dataKey: e
		}),
		t === "duotone" && /* @__PURE__ */ (0, $.jsx)(IU, {
			id: b,
			dataKey: e,
			config: l
		}),
		t === "duotone-reverse" && /* @__PURE__ */ (0, $.jsx)(LU, {
			id: b,
			dataKey: e,
			config: l
		}),
		t === "gradient" && /* @__PURE__ */ (0, $.jsx)(RU, {
			id: b,
			dataKey: e
		}),
		t === "stripped" && /* @__PURE__ */ (0, $.jsx)(zU, {
			id: b,
			dataKey: e
		}),
		s && /* @__PURE__ */ (0, $.jsx)(FU, {
			id: b,
			dataKey: e
		}),
		o && /* @__PURE__ */ (0, $.jsx)(BU, {
			id: b,
			dataKey: e
		})
	] })] });
}
function wU({ tickLine: e = !1, axisLine: t = !1, tickMargin: n = 8, minTickGap: r = 8, type: i, ...a }) {
	let { isLoading: o, isHorizontal: s } = xU();
	return o ? null : /* @__PURE__ */ (0, $.jsx)(rB, {
		tickLine: e,
		axisLine: t,
		tickMargin: n,
		minTickGap: r,
		type: i ?? (s ? "number" : "category"),
		...a
	});
}
function TU({ tickLine: e = !1, axisLine: t = !1, tickMargin: n = 8, minTickGap: r = 8, width: i = "auto", type: a, ...o }) {
	let { isLoading: s, isHorizontal: c } = xU();
	return s ? null : /* @__PURE__ */ (0, $.jsx)(vB, {
		tickLine: e,
		axisLine: t,
		tickMargin: n,
		minTickGap: r,
		width: i,
		type: a ?? (c ? "category" : "number"),
		...o
	});
}
function EU({ strokeDasharray: e = "3 3", vertical: t, horizontal: n, ...r }) {
	let { isHorizontal: i } = xU();
	return /* @__PURE__ */ (0, $.jsx)(AI, {
		strokeDasharray: e,
		vertical: t ?? i,
		horizontal: n ?? !i,
		...r
	});
}
function DU({ variant: e, roundness: t, defaultIndex: n }) {
	let { isLoading: r, selectedDataKey: i } = xU();
	return r ? null : /* @__PURE__ */ (0, $.jsx)(QH, {
		cursor: !1,
		defaultIndex: n,
		content: /* @__PURE__ */ (0, $.jsx)(XH, {
			selected: i,
			roundness: t,
			variant: e
		})
	});
}
function OU({ variant: e, align: t = "right", verticalAlign: n = "top", isClickable: r = !1 }) {
	let { selectedDataKey: i, selectDataKey: a } = xU();
	return /* @__PURE__ */ (0, $.jsx)(rU, {
		verticalAlign: n,
		align: t,
		content: /* @__PURE__ */ (0, $.jsx)($H, {
			selected: i,
			onSelectChange: a,
			isClickable: r,
			variant: e
		})
	});
}
var kU = (e) => {
	let { x: t = 0, y: n = 0, width: r = 0, height: i = 0, id: a, dataKey: o, variant: s, barRadius: c, glowing: l, bufferBar: u, isClickable: d, enableHoverHighlight: f, isMouseInChart: p, isHorizontal: m = !1, animationType: h = "none", introStartedAt: g = 0, selectedDataKey: _, isActive: v, dataLength: y = 0, onClick: b } = e, x = typeof e.index == "number" ? e.index : -1, S = u && y > 0 && x === y - 1, C = s === "stripped", w = AU(h, x, y, m, g), T = S ? `url(#${a}-buffer-hatched-${o})` : jU(s, a, o), E = l ? `url(#${a}-bar-glow-${o})` : void 0, D = MU({
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
	] : c, A = /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(km, {
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
	}), C && /* @__PURE__ */ (0, $.jsx)(km, {
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
		children: [/* @__PURE__ */ (0, $.jsx)(km, {
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
}, AU = (e, t, n, r, i) => {
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
	let c = s * vU * 1e3, l = _U * 1e3, u = c + l, d = Date.now() - i;
	if (d >= u) return null;
	let f = d <= c ? 0 : (d - c) / l, p = {
		duration: (u - Math.max(d, c)) / 1e3,
		ease: yU,
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
}, jU = (e, t, n) => {
	switch (e) {
		case "hatched": return `url(#${t}-hatched-${n})`;
		case "duotone": return `url(#${t}-duotone-${n})`;
		case "duotone-reverse": return `url(#${t}-duotone-reverse-${n})`;
		case "gradient": return `url(#${t}-gradient-${n})`;
		case "stripped": return `url(#${t}-stripped-${n})`;
		default: return `url(#${t}-colors-${n})`;
	}
}, MU = ({ isClickable: e, selectedDataKey: t, dataKey: n, enableHoverHighlight: r, isMouseInChart: i, isActive: a }) => {
	let o = e && t !== null ? t === null || t === n ? 1 : .15 : 1;
	return r && i ? a ? o : o * .3 : o;
}, NU = ({ id: e, dataKey: t, config: n }) => {
	let r = KH(n[t] ?? {});
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
}, PU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
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
] }), FU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
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
] }), IU = ({ id: e, dataKey: t, config: n }) => {
	let r = KH(n[t] ?? {});
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
}, LU = ({ id: e, dataKey: t, config: n }) => {
	let r = KH(n[t] ?? {});
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
}, RU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
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
] }), zU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
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
] }), BU = ({ id: e, dataKey: t }) => /* @__PURE__ */ (0, $.jsxs)("filter", {
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
}), VU = (e = 17, t = .05, n = .9) => Array.from({ length: e }, (r, i) => {
	let a = i / (e - 1), o = t + Math.sin(a * Math.PI) ** 2 * (n - t);
	return {
		offset: `${(a * 100).toFixed(0)}%`,
		opacity: Number(o.toFixed(3))
	};
});
function HU(e, t = 12) {
	let [n, r] = (0, P.useState)(!1), i = (0, P.useCallback)(() => {
		e && r((e) => !e);
	}, [e]);
	return {
		loadingData: (0, P.useMemo)(() => qH(t, 20, 80), [t, n]),
		onShimmerExit: i
	};
}
var UU = ({ chartId: e, onShimmerExit: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(Iz, {
	dataKey: mU,
	fill: "currentColor",
	fillOpacity: .15,
	radius: pU,
	isAnimationActive: !1,
	legendType: "none",
	style: { mask: `url(#${e}-loading-mask)` }
}), /* @__PURE__ */ (0, $.jsx)("defs", { children: /* @__PURE__ */ (0, $.jsx)(WU, {
	chartId: e,
	onShimmerExit: t
}) })] }), WU = ({ chartId: e, onShimmerExit: t }) => {
	let n = VU(), r = (0, P.useRef)(-1);
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
					duration: hU / 1e3,
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
SU.Bar = CU, SU.XAxis = wU, SU.YAxis = TU, SU.Grid = EU, SU.Tooltip = DU, SU.Legend = OU, SU.Brush = iU;
// src/react/charts/chart-card.tsx
var GU = `${M({ radius: "chart" })} flex flex-col gap-4 max-sm:p-4`;
function KU({ title: e, children: t }) {
	return /* @__PURE__ */ (0, $.jsxs)("section", {
		className: GU,
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
var qU = (e) => (e.codePointAt(0) ?? 0) > 11903 ? 13 : 7, JU = (e) => [...new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(e)].map((e) => e.segment), YU;
function XU(e) {
	if (YU === void 0) try {
		YU = document.createElement("canvas").getContext("2d"), YU && (YU.font = `12px ${getComputedStyle(document.body).fontFamily || "sans-serif"}`);
	} catch {
		YU = null;
	}
	return YU ? YU.measureText(e).width : null;
}
var ZU = (e) => XU(e) ?? JU(e).reduce((e, t) => e + qU(t), 0);
function QU(e, t) {
	if (ZU(e) <= t) return e;
	let n = JU(e), r = 0;
	for (; r < n.length && ZU(`${n.slice(0, r + 1).join("")}…`) <= t;) r += 1;
	return `${n.slice(0, r).join("")}…`;
}
var $U = (e, t = 104) => Math.min(t, Math.max(24, ...e.map(ZU)) + 12);
function eW(e) {
	let { along: t, payload: n, width: r = 0, visibleTicksCount: i = 1, ...a } = e, o = String(n?.value ?? ""), s = t === "x" ? r / Math.max(1, i) - 2 : r - 8;
	return /* @__PURE__ */ (0, $.jsxs)("g", { children: [/* @__PURE__ */ (0, $.jsx)("title", { children: o }), /* @__PURE__ */ (0, $.jsx)(bk, {
		...a,
		children: QU(o, s)
	})] });
}
function tW({ title: e, figure: t, note: n }) {
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
var nW = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)",
	"var(--color-chart-6)"
], rW = (e) => ({ light: [e] }), iW = (e) => `s${e}`;
function aW(e) {
	return Object.fromEntries(e.map((e, t) => [iW(t), {
		label: e,
		colors: rW(nW[t % nW.length])
	}]));
}
// src/react/charts/chart-tip.tsx
var oW = "flex min-w-32 flex-col gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl";
function sW({ swatch: e, name: t, value: n, format: r = (e) => e.toLocaleString() }) {
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
var cW = "size-2.5 shrink-0 rounded-xs";
function lW({ active: e, payload: t, label: n, nameKey: r, valueKey: i, hideLabel: a, format: o }) {
	let { config: s } = BH(), c = (t ?? []).filter((e) => e.type !== "none");
	if (!e || !c.length) return /* @__PURE__ */ (0, $.jsx)("span", { className: "p-4" });
	let l = a || typeof n != "string" ? null : s[n]?.label ?? n;
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: oW,
		children: [l ? /* @__PURE__ */ (0, $.jsx)("div", {
			className: "font-medium text-foreground",
			children: l
		}) : null, c.map((e, t) => {
			let n = e.payload ?? {}, a = `${(r ? n[r] : void 0) ?? e.name ?? e.dataKey ?? "value"}`, c = GH(s, e, a), l = i ? n[i] : e.value;
			return /* @__PURE__ */ (0, $.jsx)(sW, {
				name: c?.label ?? e.name,
				value: Number(l ?? 0),
				format: o,
				swatch: /* @__PURE__ */ (0, $.jsx)("i", {
					className: cW,
					style: { background: `var(--color-${a}-0)` }
				})
			}, a + t);
		})]
	});
}
function uW({ nameKey: e, valueKey: t, hideLabel: n, format: r }) {
	return /* @__PURE__ */ (0, $.jsx)(QH, {
		cursor: !1,
		content: /* @__PURE__ */ (0, $.jsx)(lW, {
			nameKey: e,
			valueKey: t,
			hideLabel: n,
			format: r
		})
	});
}
// src/react/charts/bar-card.tsx
var dW = [0, (e) => e * 1.2];
function fW(e) {
	let t = Math.abs(e), n = (t, n) => {
		let r = e / t;
		return `${r.toLocaleString(void 0, { maximumFractionDigits: +(Math.abs(r) < 100) })}${n}`;
	};
	return t >= 1e8 ? n(1e8, "亿") : t >= 1e5 ? n(1e4, "万") : e.toLocaleString();
}
var pW = (e) => ({
	position: e,
	className: "fill-text-secondary",
	formatter: (e) => fW(Number(e))
});
function mW({ title: e, unit: t, series: n, rows: r, color: i, empty: a, layout: o = "vertical" }) {
	let s = r.filter((e) => Number.isFinite(e.value) && e.value >= 0).map((e) => ({
		name: e.name,
		value: e.value
	})), c = s.reduce((e, t) => e + t.value, 0);
	if (!c) return /* @__PURE__ */ (0, $.jsx)(KU, {
		title: e,
		children: a
	});
	let l = o === "horizontal";
	return /* @__PURE__ */ (0, $.jsxs)("section", {
		className: GU,
		"aria-label": e,
		children: [/* @__PURE__ */ (0, $.jsx)(tW, {
			title: e,
			figure: c.toLocaleString(),
			note: t
		}), /* @__PURE__ */ (0, $.jsxs)(SU, {
			data: s,
			config: { value: {
				label: n,
				colors: rW(i)
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
				/* @__PURE__ */ (0, $.jsx)(SU.Grid, {}),
				l ? /* @__PURE__ */ (0, $.jsx)(SU.YAxis, {
					dataKey: "name",
					interval: 0,
					tick: /* @__PURE__ */ (0, $.jsx)(eW, { along: "y" }),
					width: $U(s.map((e) => e.name))
				}) : /* @__PURE__ */ (0, $.jsx)(SU.XAxis, {
					dataKey: "name",
					interval: 0,
					tick: /* @__PURE__ */ (0, $.jsx)(eW, { along: "x" })
				}),
				l ? /* @__PURE__ */ (0, $.jsx)(SU.XAxis, {
					hide: !0,
					domain: dW
				}) : /* @__PURE__ */ (0, $.jsx)(SU.YAxis, {
					hide: !0,
					domain: dW
				}),
				/* @__PURE__ */ (0, $.jsx)(SU.Bar, {
					dataKey: "value",
					enableHoverHighlight: !0,
					barProps: {
						dataKey: "value",
						label: pW(l ? "right" : "top")
					}
				}),
				/* @__PURE__ */ (0, $.jsx)(uW, {})
			]
		})]
	});
}
// src/react/charts/heat.ts
var hW = [
	"周一",
	"周二",
	"周三",
	"周四",
	"周五",
	"周六",
	"周日"
], gW = (e, t) => e ? Math.max(.12, e / t) : 0;
function _W(e) {
	let t = Array.from({ length: 7 }, () => Array(24).fill(0));
	for (let n of e?.hours || []) {
		let { weekday: e, hour: r, count: i } = n;
		!Number.isInteger(e) || e < 0 || e > 6 || !Number.isInteger(r) || r < 0 || r > 23 || !Number.isFinite(i) || i < 0 || (t[e][r] = (t[e][r] || 0) + i);
	}
	let n = t.flat(), r = Math.max(1, ...n);
	return {
		cells: t.flatMap((e, t) => e.map((e, n) => ({
			key: `${t}-${n}`,
			label: `${hW[t]} ${n}:00`,
			count: e,
			share: gW(e, r)
		}))),
		total: n.reduce((e, t) => e + t, 0)
	};
}
function vW(e) {
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
			share: gW(s, o)
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
var yW = 14, bW = 17, xW = {
	4: {
		fill: "fill-chart-4",
		dot: "bg-chart-4"
	},
	5: {
		fill: "fill-chart-5",
		dot: "bg-chart-5"
	}
}, SW = {
	start: "translate-x-0",
	center: "-translate-x-1/2",
	end: "-translate-x-full"
};
function CW({ cell: e, series: t, tone: n, left: r, top: i, anchor: a }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		"aria-hidden": !0,
		style: {
			left: `${r}%`,
			top: `${i}%`
		},
		className: `pointer-events-none absolute z-10 -mt-2 -translate-y-full ${oW} ${SW[a]}`,
		children: [/* @__PURE__ */ (0, $.jsx)("div", {
			className: "font-medium text-foreground",
			children: e.label
		}), /* @__PURE__ */ (0, $.jsx)(sW, {
			name: t,
			value: e.count,
			swatch: /* @__PURE__ */ (0, $.jsx)("i", { className: `${cW} ${xW[n].dot}` })
		})]
	});
}
function wW({ title: e, words: t, cells: n, total: r, columns: i, rows: a, axis: o, footer: s, tone: c }) {
	let [l, u] = (0, P.useState)(-1), [d, f] = (0, P.useState)(0), p = (0, P.useRef)(null), m = d < n.length ? d : 0, h = o ? 30 : 0, g = o ? 18 : 0, _ = h + i * bW, v = g + a * bW, y = (e) => ({
		x: h + e % i * bW,
		y: g + Math.floor(e / i) * bW
	}), b = n[l], x = b ? y(l) : null, S = x ? (x.x + yW / 2) / _ : 0, C = S < .1 ? "start" : S > .9 ? "end" : "center", w = x ? {
		start: x.x,
		center: x.x + yW / 2,
		end: x.x + yW
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
		className: GU,
		children: [
			/* @__PURE__ */ (0, $.jsx)(tW, {
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
								width: yW,
								height: yW,
								rx: 3,
								fillOpacity: e.share || 1,
								opacity: l >= 0 && l !== n ? .4 : 1,
								className: e.share ? `outline-none transition-opacity duration-200 focus-visible:stroke-border-focus-ring ${xW[c].fill}` : "fill-chart-track outline-none transition-opacity duration-200 focus-visible:stroke-border-focus-ring",
								onPointerEnter: () => u(n),
								onFocus: () => {
									u(n), f(n);
								},
								onBlur: () => u(-1),
								onKeyDown: (e) => T(e, n)
							}, e.key);
						})]
					})
				}), b && x ? /* @__PURE__ */ (0, $.jsx)(CW, {
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
var TW = /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [hW.map((e, t) => /* @__PURE__ */ (0, $.jsx)("text", {
	x: 0,
	y: 18 + t * bW + 7,
	dominantBaseline: "middle",
	className: "fill-text-secondary text-caption-1-regular",
	children: e
}, e)), Array.from({ length: 24 }, (e, t) => t % 2 ? null : /* @__PURE__ */ (0, $.jsx)("text", {
	x: 30 + t * bW,
	y: 8,
	dominantBaseline: "middle",
	className: "fill-text-secondary text-caption-1-regular",
	children: t
}, t))] });
function EW({ activity: e, title: t, dailyTitle: n, words: r, tone: i, empty: a }) {
	let o = _W(e), s = vW(e);
	return s.cells.length ? /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "inline-grid w-full items-start gap-5 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, $.jsx)(wW, {
			title: t,
			words: r,
			tone: i,
			cells: o.cells,
			total: o.total,
			columns: 24,
			rows: 7,
			axis: TW,
			footer: /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("span", { children: "星期 × 小时" }), /* @__PURE__ */ (0, $.jsx)("span", { children: e?.timezone || "UTC+08:00" })] })
		}), /* @__PURE__ */ (0, $.jsx)(wW, {
			title: n,
			words: r,
			tone: i,
			cells: s.cells,
			total: s.total,
			columns: 13,
			rows: 7,
			footer: /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)("span", { children: s.start }), /* @__PURE__ */ (0, $.jsx)("span", { children: s.end })] })
		})]
	}) : /* @__PURE__ */ (0, $.jsx)(KU, {
		title: t,
		children: a
	});
}
// src/react/components/expandable-ranking.tsx
function DW({ children: e, className: t = "", previewCount: n = 10 }) {
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
var OW = "30%", kW = "100%", AW = 5, jW = 14, MW = 5, NW = 1500, PW = (0, P.createContext)(null);
function FW() {
	let e = (0, P.use)(PW);
	if (!e) throw Error("Radial chart parts (<RadialBar />, <Tooltip />, …) must be used within <EvilRadialChart />");
	return e;
}
function IW({ config: e, data: t, nameKey: n, children: r, className: i, chartProps: a, variant: o = "full", max: s, innerRadius: c = OW, outerRadius: l = kW, defaultSelectedDataKey: u = null, onSelectionChange: d, isLoading: f = !1, backgroundVariant: p }) {
	let m = (0, P.useId)().replace(/:/g, ""), [h, g] = (0, P.useState)(u), _ = UW(f), v = BW(o), y = (0, P.useCallback)((e, t) => {
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
	return /* @__PURE__ */ (0, $.jsx)(PW, {
		value: x,
		children: /* @__PURE__ */ (0, $.jsxs)(VH, {
			className: i,
			config: e,
			children: [/* @__PURE__ */ (0, $.jsx)(HH, { isLoading: f }), /* @__PURE__ */ (0, $.jsxs)(PH, {
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
					s != null && s > 0 && /* @__PURE__ */ (0, $.jsx)(cj, {
						type: "number",
						domain: [0, s],
						tick: !1,
						axisLine: !1
					}),
					p && /* @__PURE__ */ (0, $.jsx)(fU, { variant: p }),
					r,
					f && /* @__PURE__ */ (0, $.jsx)(WW, {}),
					/* @__PURE__ */ (0, $.jsx)("defs", { children: /* @__PURE__ */ (0, $.jsx)(VW, {
						config: e,
						chartId: m
					}) })
				]
			})]
		})
	});
}
function LW({ dataKey: e, cornerRadius: t = AW, barSize: n = jW, showBackground: r = !0, isClickable: i = !1, radialBarProps: a }) {
	let { nameKey: o, isLoading: s, selectedBar: c, selectBar: l } = FW();
	return s ? null : /* @__PURE__ */ (0, $.jsx)(CP, {
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
			return /* @__PURE__ */ (0, $.jsx)(oh, {
				...e,
				opacity: i && !n ? .15 : 1,
				className: "transition-opacity duration-200"
			});
		},
		...a
	});
}
function RW({ variant: e, roundness: t, defaultIndex: n }) {
	let { nameKey: r, isLoading: i } = FW();
	return i ? null : /* @__PURE__ */ (0, $.jsx)(QH, {
		defaultIndex: n,
		cursor: !1,
		content: /* @__PURE__ */ (0, $.jsx)(XH, {
			nameKey: r,
			hideLabel: !0,
			roundness: t,
			variant: e
		})
	});
}
function zW({ variant: e, align: t = "center", verticalAlign: n = "bottom", isClickable: r = !1 }) {
	let { nameKey: i, isLoading: a, selectedBar: o, selectBar: s } = FW();
	return a ? null : /* @__PURE__ */ (0, $.jsx)(rU, {
		verticalAlign: n,
		align: t,
		content: /* @__PURE__ */ (0, $.jsx)($H, {
			selected: o,
			onSelectChange: s,
			isClickable: r,
			nameKey: i,
			variant: e
		})
	});
}
function BW(e) {
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
var VW = ({ config: e, chartId: t }) => /* @__PURE__ */ (0, $.jsx)($.Fragment, { children: Object.entries(e).map(([e, n]) => {
	let r = KH(n);
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
function HW() {
	return Array.from({ length: MW }, (e, t) => ({
		name: `loading${t}`,
		value: 40 + Math.random() * 60
	}));
}
function UW(e) {
	let [t, n] = (0, P.useState)(0);
	return (0, P.useEffect)(() => {
		if (!e) return;
		let t = setInterval(() => {
			n((e) => e + 1);
		}, NW);
		return () => clearInterval(t);
	}, [e]), (0, P.useMemo)(() => HW(), [t]);
}
var WW = () => /* @__PURE__ */ (0, $.jsx)(CP, {
	dataKey: "value",
	cornerRadius: AW,
	barSize: jW,
	background: !0,
	isAnimationActive: !0,
	animationDuration: NW,
	animationEasing: "ease-in-out",
	shape: (e) => /* @__PURE__ */ (0, $.jsx)(oh, {
		...e,
		fill: "currentColor",
		fillOpacity: .25
	})
});
IW.RadialBar = LW, IW.Tooltip = RW, IW.Legend = zW;
// src/react/stats/radial-card.tsx
var GW = [
	"bg-chart-1",
	"bg-chart-2",
	"bg-chart-3",
	"bg-chart-4",
	"bg-chart-5",
	"bg-chart-6"
], KW = [
	"aria-pressed:bg-chart-1/10 aria-pressed:ring-chart-1",
	"aria-pressed:bg-chart-2/10 aria-pressed:ring-chart-2",
	"aria-pressed:bg-chart-3/10 aria-pressed:ring-chart-3",
	"aria-pressed:bg-chart-4/10 aria-pressed:ring-chart-4",
	"aria-pressed:bg-chart-5/10 aria-pressed:ring-chart-5",
	"aria-pressed:bg-chart-6/10 aria-pressed:ring-chart-6"
];
function qW({ title: e, rows: t, empty: n, unit: r = "个视频" }) {
	let [i, a] = (0, P.useState)(-1), [o, s] = (0, P.useState)(-1), c = Se(t);
	if (!c.length) return /* @__PURE__ */ (0, $.jsx)(KU, {
		title: e,
		children: n
	});
	let l = o >= 0 ? o : i, u = c.reduce((e, t) => e + t.value, 0), d = c[l], f = (e) => a((t) => t === e ? -1 : e), p = xe(c.map((e) => e.value)), m = c.map((e, t) => ({
		slice: iW(t),
		count: e.value,
		arc: ye(e.value, p)
	}));
	return /* @__PURE__ */ (0, $.jsxs)("section", {
		className: GU,
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
				children: /* @__PURE__ */ (0, $.jsxs)(IW, {
					data: m,
					nameKey: "slice",
					config: aW(c.map((e) => e.name)),
					max: p,
					innerRadius: "22%",
					className: "aspect-auto h-75 max-sm:h-65",
					children: [/* @__PURE__ */ (0, $.jsx)(IW.RadialBar, {
						dataKey: "arc",
						barSize: be(c.length),
						radialBarProps: {
							shape: (e) => /* @__PURE__ */ (0, $.jsx)(oh, {
								...e,
								opacity: l >= 0 && l !== e.index ? .3 : 1,
								className: "cursor-pointer transition-opacity duration-200"
							}),
							onClick: (e, t) => f(t),
							onMouseEnter: (e, t) => s(t)
						}
					}), /* @__PURE__ */ (0, $.jsx)(uW, {
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
					className: `flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-xl bg-background-tertiary-default p-2.5 text-left outline-none aria-pressed:ring-1 aria-pressed:ring-inset focus-visible:ring-2 focus-visible:ring-border-focus-ring ${KW[t % 6]}`,
					children: [
						/* @__PURE__ */ (0, $.jsxs)("span", {
							className: "flex min-w-0 max-w-full items-start gap-1.5 text-caption-1-regular text-text-secondary",
							children: [/* @__PURE__ */ (0, $.jsx)("i", {
								"aria-hidden": !0,
								className: `mt-0.5 size-3 shrink-0 rounded-sm ${GW[t % 6]}`
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
				}, iW(t)))
			})
		]
	});
}
// src/react/stats/stats-page.tsx
var JW = a, YW = 10, XW = nW[5], ZW = nW[4], QW = `${M()} flex flex-col gap-4`, $W = "添加媒体目录后，这里会显示馆藏统计。", eG = "补全资料或添加标签后，这里会显示馆藏中的内容标签。", tG = "开始播放后，这里会显示最近的真实观看证据。", nG = "补充作品资料或手动添加标签后，这里会显示各个标签来源对应的视频数量。", rG = "添加媒体目录后，这里会显示存储空间。", iG = "把媒体目录归进媒体库后，这里会按库显示视频数。", aG = "探测时长后，这里会显示时长分布。", oG = "探测画质后，这里会显示画质分布。", sG = "开始播放后，这里会显示播放落在一周的哪些时段。", cG = "开始播放后，这里会显示每个作品播了几次。", lG = (e, t) => Math.min(Math.max(e, 0), t);
function uG({ term: e, value: t }) {
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
function dG({ term: e, value: t, total: n }) {
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
			value: ue(t) ? lG(t, r) : 0,
			max: r
		})]
	});
}
function fG({ term: e, figure: t, unit: n }) {
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
function pG({ headline: e, children: t }) {
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: `${QW} md:flex-row md:gap-6`,
		children: [e, /* @__PURE__ */ (0, $.jsx)("div", {
			className: "min-w-0 grow",
			children: t
		})]
	});
}
function mG({ data: e }) {
	return e.by_loc.reduce((e, t) => e + t.videos, 0) ? /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "inline-grid w-full gap-5 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, $.jsx)(qW, {
				title: "网盘与本地",
				empty: $W,
				rows: e.by_loc.map((e) => ({
					name: s[e.k] ?? e.k,
					value: e.videos,
					bytes: e.bytes,
					mark: c[e.k] || "database"
				}))
			}), /* @__PURE__ */ (0, $.jsx)(qW, {
				title: "媒体库",
				empty: iG,
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
				/* @__PURE__ */ (0, $.jsx)(mW, {
					title: "时长",
					unit: "个视频",
					series: "视频",
					color: XW,
					rows: de(e.by_length),
					empty: aG
				}),
				/* @__PURE__ */ (0, $.jsx)(mW, {
					title: "画质",
					unit: "个视频",
					series: "视频",
					color: XW,
					rows: k(e.by_quality),
					empty: oG
				}),
				/* @__PURE__ */ (0, $.jsx)(mW, {
					title: "文件类型",
					unit: "个条目",
					series: "条目",
					color: XW,
					layout: "horizontal",
					rows: pe(e.by_medium),
					empty: $W
				})
			]
		})]
	}) : /* @__PURE__ */ (0, $.jsx)(o, {
		icon: u,
		title: "还没有视频",
		actions: /* @__PURE__ */ (0, $.jsx)(i, {
			variant: "primary",
			href: JW,
			size: "small",
			children: "添加媒体"
		}),
		children: $W
	});
}
function hG({ data: e }) {
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(EW, {
		activity: e.play_activity,
		title: "播放时间",
		dailyTitle: "每日播放",
		words: {
			unit: "个作品",
			series: "作品",
			cellUnit: "个作品"
		},
		tone: 5,
		empty: sG
	}), /* @__PURE__ */ (0, $.jsx)(mW, {
		title: "播放次数",
		unit: "个作品",
		series: "作品",
		color: ZW,
		rows: we(e.replays),
		empty: cG
	})] });
}
function gG({ attribution: e }) {
	let t = e.videos;
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex flex-col",
		children: [
			/* @__PURE__ */ (0, $.jsx)(dG, {
				term: "有创作者",
				value: e.creator,
				total: t
			}),
			/* @__PURE__ */ (0, $.jsx)(dG, {
				term: "有番号",
				value: e.code,
				total: t
			}),
			/* @__PURE__ */ (0, $.jsx)(dG, {
				term: "有厂牌",
				value: e.studio,
				total: t
			}),
			/* @__PURE__ */ (0, $.jsx)(dG, {
				term: "已抽帧",
				value: e.thumb,
				total: t
			}),
			/* @__PURE__ */ (0, $.jsx)(dG, {
				term: "已探测时长",
				value: e.duration,
				total: t
			})
		]
	});
}
function _G({ volume: e }) {
	let t = e.total, n = e.used ?? 0;
	return /* @__PURE__ */ (0, $.jsxs)("article", {
		className: "flex min-w-0 flex-col gap-1.5 border-b border-separator-border py-3 last:border-b-0",
		children: [
			/* @__PURE__ */ (0, $.jsxs)("header", {
				className: "flex items-baseline justify-between gap-3 text-body-2-regular text-text-primary",
				children: [/* @__PURE__ */ (0, $.jsx)("h3", {
					className: "min-w-0 break-words",
					children: e.label
				}), t == null ? /* @__PURE__ */ (0, $.jsx)(b, { children: "容量未取得" }) : /* @__PURE__ */ (0, $.jsxs)("b", {
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
				value: lG(n, Math.max(t, 1)),
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
function vG({ volumes: e }) {
	return e.length ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: "flex flex-col",
		children: e.map((e) => /* @__PURE__ */ (0, $.jsx)(_G, { volume: e }, `${e.kind}:${e.label}`))
	}) : /* @__PURE__ */ (0, $.jsx)(o, {
		icon: S,
		title: "还没有存储来源",
		actions: /* @__PURE__ */ (0, $.jsx)(i, {
			variant: "primary",
			href: JW,
			size: "small",
			children: "添加媒体"
		}),
		children: rG
	});
}
function yG({ tags: e, tagLabel: t, onTag: n, hasMedia: r }) {
	return e.length ? /* @__PURE__ */ (0, $.jsx)(DW, {
		previewCount: YW,
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
			href: r ? "/data-cleanup" : JW,
			size: "small",
			children: r ? "补全资料" : "添加媒体"
		}),
		children: eG
	});
}
function bG({ rows: e, hasMedia: t }) {
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
			}, e.id);
		})
	}) : /* @__PURE__ */ (0, $.jsx)(o, {
		icon: Ne,
		title: "还没有观看记录",
		actions: /* @__PURE__ */ (0, $.jsx)(i, {
			variant: "secondary",
			href: t ? "/" : JW,
			size: "small",
			children: t ? "浏览馆藏" : "添加媒体"
		}),
		children: tG
	});
}
function xG({ sources: e, videos: t }) {
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
					value: lG(e.assets, Math.max(t, 1)),
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
			href: t ? "/data-cleanup" : JW,
			size: "small",
			children: t ? "补全资料" : "添加媒体"
		}),
		children: nG
	});
}
function SG({ id: e, label: n, figure: r, detail: i, icon: a, accent: o }) {
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
function CG(i) {
	let a = Ie({
		queryKey: h,
		queryFn: ({ signal: e }) => ie(e)
	}), o = a.data;
	if (!o) return /* @__PURE__ */ (0, $.jsx)(Be, { children: /* @__PURE__ */ (0, $.jsx)(d, {
		tone: "error",
		title: "馆藏统计读取失败",
		children: a.error ? ne(a.error) : "未取得统计数据，请刷新页面重试。"
	}) });
	let s = o.consumption, c = o.storage_summary, l = o.by_loc.reduce((e, t) => e + t.videos, 0), u = o.by_loc.reduce((e, t) => e + t.bytes, 0), f = ue(o.tag_cov) ? ge(o.tag_cov, o.attribution.videos) : "未取得", v = `${ae(o.tag_cov)} / ${o.attribution.videos.toLocaleString()}`;
	return /* @__PURE__ */ (0, $.jsxs)(Be, { children: [/* @__PURE__ */ (0, $.jsxs)(n, {
		defaultSelectedKey: "inventory",
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, $.jsxs)(r, {
				"aria-label": "统计视图",
				className: g,
				children: [
					/* @__PURE__ */ (0, $.jsx)(SG, {
						id: "inventory",
						label: "馆藏视频",
						icon: w,
						accent: 0,
						figure: l.toLocaleString(),
						detail: oe(u)
					}),
					/* @__PURE__ */ (0, $.jsx)(SG, {
						id: "viewing",
						label: "看过",
						icon: C,
						accent: 1,
						figure: ae(s.played),
						detail: _e(s.play_seconds)
					}),
					/* @__PURE__ */ (0, $.jsx)(SG, {
						id: "coverage",
						label: "内容标签",
						icon: fe,
						accent: 2,
						figure: f,
						detail: v
					}),
					/* @__PURE__ */ (0, $.jsx)(SG, {
						id: "storage",
						label: "使用空间",
						icon: S,
						accent: 3,
						figure: `${c.volumes.toLocaleString()} 个卷`,
						detail: c.measured ? `已用 ${oe(c.used)}` : "容量未取得"
					})
				]
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "inventory",
				children: /* @__PURE__ */ (0, $.jsx)(mG, {
					data: o,
					...i
				})
			}),
			/* @__PURE__ */ (0, $.jsxs)(e, {
				id: "viewing",
				className: "flex flex-col gap-5",
				children: [/* @__PURE__ */ (0, $.jsx)(pG, {
					headline: /* @__PURE__ */ (0, $.jsx)(fG, {
						term: "观看",
						figure: ae(s.played),
						unit: "个作品有播放记录"
					}),
					children: /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "inline-grid w-full gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, $.jsx)(uG, {
								term: "高潮计数",
								value: s.o_total
							}),
							/* @__PURE__ */ (0, $.jsx)(uG, {
								term: "快进扫过",
								value: s.skimmed
							}),
							/* @__PURE__ */ (0, $.jsx)(uG, {
								term: "喜欢",
								value: s.liked
							}),
							/* @__PURE__ */ (0, $.jsx)(uG, {
								term: "明确不喜欢",
								value: s.dislike
							}),
							/* @__PURE__ */ (0, $.jsx)(uG, {
								term: "看过了",
								value: s.seen
							}),
							/* @__PURE__ */ (0, $.jsx)(uG, {
								term: "回收站",
								value: s.trash
							})
						]
					})
				}), /* @__PURE__ */ (0, $.jsx)(hG, { data: o })]
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "coverage",
				children: /* @__PURE__ */ (0, $.jsx)(pG, {
					headline: /* @__PURE__ */ (0, $.jsx)(fG, {
						term: "内容标签覆盖",
						figure: f,
						unit: v
					}),
					children: /* @__PURE__ */ (0, $.jsx)(gG, { attribution: o.attribution })
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "storage",
				children: /* @__PURE__ */ (0, $.jsx)(pG, {
					headline: /* @__PURE__ */ (0, $.jsx)(fG, {
						term: "使用空间",
						figure: c.measured.toLocaleString(),
						unit: "个卷已取得容量"
					}),
					children: /* @__PURE__ */ (0, $.jsx)(vG, {
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
				children: /* @__PURE__ */ (0, $.jsx)(yG, {
					tags: o.top_tags,
					hasMedia: l > 0,
					...i
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "recent",
				className: "px-4 pt-3.5 pb-4",
				children: /* @__PURE__ */ (0, $.jsx)(bG, {
					rows: o.recent,
					hasMedia: l > 0
				})
			}),
			/* @__PURE__ */ (0, $.jsx)(e, {
				id: "sources",
				className: "px-4 pt-3.5 pb-4",
				children: /* @__PURE__ */ (0, $.jsx)(xG, {
					sources: o.tag_source,
					videos: o.attribution.videos
				})
			})
		]
	})] });
}
export { CG as StatsPage };

//# debugId=4b196502-d837-44d0-a528-e9c4c31473db