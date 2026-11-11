(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "094cdb74-4042-4e19-a8b9-7e5b6b47aeb8", e._sentryDebugIdIdentifier = "sentry-dbid-094cdb74-4042-4e19-a8b9-7e5b6b47aeb8");
	} catch {}
})();
import { $ea3928288112382f$export$439d29a4e110a164 as e, $fe21c36db05242bb$export$a98f0dcb43a68a25 as t, $fe21c36db05242bb$export$d7b12c4107be0d61 as n, Button as r, ButtonLink as i, Checkbox as a, CheckboxGlyph as o, Chip as s, CollapseChevron as c, CollapseRegion as l, DEFAULT_CATEGORY as u, DataTableFooter as d, ENTITY_REVIEW_KINDS as f, Ea as p, EmptyState as m, ExternalLink as h, FIELDSET_FOOT as ee, FilterGlassRows as g, Gg as _, InputBase as v, LinkButton as te, Note as y, REVIEW_CATEGORIES as b, REVIEW_DECISION_LABELS as ne, REVIEW_KEY as re, REVIEW_LABELS as ie, REVIEW_QUEUES as ae, REVIEW_QUEUE_LABELS as x, Select as S, SelectItem as C, SelectionActions as w, SelectionDock as oe, SortableBoardTabs as T, TextField as E, Wt as D, __toESM as O, avatarInner as k, busyProps as A, canApprove as se, cardClass as j, commonReviewSources as M, composingKey as N, currentReviewRow as ce, cx as P, decisionPayload as le, decisionReceipt as ue, defaultChoice as de, errorMessage as fe, fetchReview as pe, filterReviewRows as me, groupReviewRows as he, isReviewCategory as ge, l7 as _e, m7 as ve, mirrorText as ye, pendingGenres as F, recordGenre as be, reloadReview as I, require_jsx_runtime as xe, require_react as Se, reviewGroupingOptions as Ce, reviewQueueData as we, reviewQueueOf as Te, reviewWindow as Ee, rowEvidence as De, rowFieldName as Oe, rowSubject as ke, rowTags as Ae, rowTitle as L, selectReviewRange as je, settleReviewRows as Me, spinnerHtml as Ne, submitDecision as Pe, useMutation as Fe, useNavigationOrder as Ie, useOverlayScrollbar as Le, useQuery as Re, useViewGlide as ze } from "./peach-app.js";
import { Page as Be } from "./peach-app.page-QAncjzM1.js";
import { LEGACY_AVATAR_IMG as R } from "./peach-app.legacy-avatar-NSITxLRS.js";
// src/react/review/bulk-toolbar.tsx
var z = /* @__PURE__ */ O(Se(), 1), B = xe();
function Ve(e) {
	let { groupOptions: t, groupBy: n, onGroupBy: i, groups: a, filter: o, onFilter: s, pageKeys: c, selected: l, onSelected: u, selectedRows: d, metadata: f, approvable: p, busy: m, feedback: h, onUnifySource: ee, onRun: _, queueView: v = "pending", queueCounts: te, onQueueChange: y, locked: b, fields: ne, fieldFilter: re, onFieldFilter: ie } = e, w = c.filter((e) => l.has(e)), T = w.length > 0 && w.length === c.length, E = M(d), D = f && d.some((e) => (e.candidates?.length || 0) > 1), O = E.length ? "统一选择来源" : "所选项目无共同来源", k = (0, z.useRef)(null), A = (0, z.useRef)(null), se = (0, z.useRef)(null), [j, N] = (0, z.useState)(!1), ce = ze(k, A, "[data-entity-state][aria-pressed=\"true\"]", v);
	return (0, z.useLayoutEffect)(() => {
		let e = A.current, t = se.current, n = e?.parentElement, r = e?.closest("[data-review-filter]");
		if (!e || !t || !n || !r) return;
		let i = () => N(t.offsetHeight > 0 && Math.abs(n.getBoundingClientRect().top - t.getBoundingClientRect().top) < 1), a = new ResizeObserver(i);
		for (let n of [
			r,
			e,
			t
		]) a.observe(n);
		return i(), () => a.disconnect();
	}, []), /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [/* @__PURE__ */ (0, B.jsx)(g, {
		label: "复核筛选",
		topLabel: "处理状态",
		attrs: { "data-review-filter": "" },
		className: "mb-0 flex-row flex-wrap",
		topClassName: "max-w-full flex-none",
		bottomClassName: c.length ? "min-h-12 max-w-full flex-none flex-wrap" : "hidden",
		bottomRef: se,
		panes: /* @__PURE__ */ (0, B.jsx)("span", {
			ref: k,
			"data-view-glide": "",
			"aria-hidden": "true"
		}),
		top: /* @__PURE__ */ (0, B.jsxs)("div", {
			ref: A,
			role: "group",
			"aria-label": "复核状态",
			"data-entity-states": "",
			onPointerLeave: ce.leave,
			children: [ae.map((e) => /* @__PURE__ */ (0, B.jsxs)("button", {
				type: "button",
				"data-entity-state": e,
				"data-entity-press": "",
				disabled: m,
				"aria-pressed": v === e,
				onPointerEnter: ce.hover,
				onClick: () => {
					e !== v && y(e);
				},
				children: [
					/* @__PURE__ */ (0, B.jsx)("span", {
						"data-copy-key": `review.queue.${e}`,
						children: x[e]
					}),
					" ",
					/* @__PURE__ */ (0, B.jsx)("span", {
						className: "ms-1.5 tabular-nums text-caption-1-medium text-text-secondary",
						children: te ? te[e].toLocaleString() : "…"
					})
				]
			}, e)), /* @__PURE__ */ (0, B.jsx)("span", {
				"data-entity-sep": "",
				"aria-hidden": "true",
				className: j ? void 0 : "invisible"
			})]
		}),
		bottom: c.length ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [
			f && ne.length ? /* @__PURE__ */ (0, B.jsxs)(S, {
				"aria-label": "筛选资料字段",
				size: "sm",
				prefix: /* @__PURE__ */ (0, B.jsx)("span", {
					"data-copy-key": "review.filter.field",
					className: "pointer-events-auto",
					children: "字段"
				}),
				selectedKey: re || "*",
				isDisabled: m,
				onSelectionChange: (e) => {
					e !== null && ie(String(e) === "*" ? "" : String(e));
				},
				children: [/* @__PURE__ */ (0, B.jsx)(C, {
					id: "*",
					children: "全部"
				}), ne.map((e) => /* @__PURE__ */ (0, B.jsx)(C, {
					id: e.key,
					children: `${e.title} · ${e.rows.length}`
				}, e.key))]
			}) : null,
			/* @__PURE__ */ (0, B.jsx)(S, {
				"aria-label": "筛选分组方式",
				size: "sm",
				selectedKey: n,
				onSelectionChange: (e) => {
					e !== null && i(String(e));
				},
				children: t.map(([e, t]) => /* @__PURE__ */ (0, B.jsx)(C, {
					id: e,
					children: t
				}, e))
			}),
			a.length > 1 ? /* @__PURE__ */ (0, B.jsxs)(S, {
				"aria-label": n === "field" ? "筛选字段分类" : "筛选当前分类",
				size: "sm",
				prefix: "分类",
				selectedKey: o || "*",
				onSelectionChange: (e) => {
					e !== null && s(String(e) === "*" ? "" : String(e));
				},
				children: [/* @__PURE__ */ (0, B.jsx)(C, {
					id: "*",
					children: "全部"
				}), a.map((e) => /* @__PURE__ */ (0, B.jsx)(C, {
					id: e.key,
					children: `${e.title} · ${e.rows.length}`
				}, e.key))]
			}) : null,
			b ? null : /* @__PURE__ */ (0, B.jsx)(r, {
				variant: "secondary",
				size: "small",
				leadingIcon: _e,
				"aria-pressed": T,
				disabled: m,
				onClick: () => {
					let e = new Set(l);
					for (let t of c) T ? e.delete(t) : e.add(t);
					u(e);
				},
				children: T ? "清空当前选择" : o ? "全选当前分类" : "全选本页"
			})
		] }) : null
	}), /* @__PURE__ */ (0, B.jsxs)(oe, {
		label: "复核所选项目",
		visible: !b && l.size > 0,
		count: `已选 ${l.size} 项`,
		children: [
			D && v !== "ignored" ? /* @__PURE__ */ (0, B.jsxs)(S, {
				"aria-label": "统一选择来源",
				size: "sm",
				selectedKey: "",
				isDisabled: m || !E.length,
				onSelectionChange: (e) => {
					e !== null && e !== "" && ee(String(e));
				},
				children: [/* @__PURE__ */ (0, B.jsx)(C, {
					id: "",
					children: O
				}), E.map((e) => /* @__PURE__ */ (0, B.jsx)(C, {
					id: e,
					children: e
				}, e))]
			}) : null,
			v === "ignored" ? null : /* @__PURE__ */ (0, B.jsx)(r, {
				variant: "ghost",
				size: "small",
				disabled: m || !l.size,
				onClick: () => _("rejected"),
				children: "忽略所选"
			}),
			v === "pending" ? /* @__PURE__ */ (0, B.jsx)(r, {
				variant: "secondary",
				size: "small",
				disabled: m || !l.size,
				onClick: () => _("skipped"),
				children: "稍后处理所选"
			}) : /* @__PURE__ */ (0, B.jsx)(r, {
				variant: v === "ignored" ? "primary" : "secondary",
				size: "small",
				disabled: m || !l.size,
				onClick: () => _("restore"),
				children: "恢复所选"
			}),
			v === "ignored" ? null : /* @__PURE__ */ (0, B.jsx)(r, {
				variant: "primary",
				size: "small",
				disabled: m || !l.size || !p,
				onClick: () => _("approved"),
				children: "通过所选"
			}),
			/* @__PURE__ */ (0, B.jsx)(r, {
				variant: "ghost",
				size: "small",
				disabled: m,
				onClick: () => u(/* @__PURE__ */ new Set()),
				children: "取消选择"
			}),
			h ? /* @__PURE__ */ (0, B.jsx)("p", {
				role: "status",
				className: "w-full text-body-2-regular text-text-secondary",
				children: h
			}) : null
		]
	})] });
}
// src/react/boardui/components/base/radio/radio.tsx
var V = {
	sm: {
		dot: "size-3.5",
		inner: "size-[5px]",
		selected: "bg-gradient-to-b from-accent-500 to-accent-600 shadow-[inset_0px_0px_0px_0.875px_var(--color-accent-500),inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)]",
		border: "border-[0.875px]",
		gap: "gap-2",
		label: "text-body-2-medium"
	},
	md: {
		dot: "size-4",
		inner: "size-1.5",
		selected: "bg-gradient-to-b from-accent-500 to-accent-600 shadow-[inset_0px_0px_0px_1px_var(--color-accent-500),inset_0px_2px_0px_0px_rgba(255,255,255,0.25)]",
		border: "border",
		gap: "gap-2",
		label: "text-body-medium"
	}
};
function He({ selected: e = !1, size: t = "sm", focusVisible: n = !1, className: r }) {
	let i = V[t];
	return /* @__PURE__ */ (0, B.jsxs)("span", {
		"aria-hidden": !0,
		className: P("relative flex shrink-0 items-center justify-center rounded-full", i.dot, n && "ring-2 ring-border-focus-ring ring-offset-2", r),
		children: [
			/* @__PURE__ */ (0, B.jsx)("span", { className: P("absolute inset-0 rounded-full border-border-checkbox-default bg-background-primary-default shadow-xs", "transition-opacity duration-200 ease", i.border, e && "opacity-0") }),
			/* @__PURE__ */ (0, B.jsx)("span", { className: P("absolute inset-0 rounded-full", "transition-opacity duration-200 ease", i.selected, !e && "opacity-0") }),
			/* @__PURE__ */ (0, B.jsx)("span", { className: P("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-control-indicator-background", "transition-[scale,opacity] duration-200 ease", i.inner, e ? "scale-100 opacity-100" : "scale-0 opacity-0") })
		]
	});
}
function Ue({ className: e, children: n, ref: r, ...i }) {
	return /* @__PURE__ */ (0, B.jsx)(t, {
		ref: r,
		...i,
		className: (t) => P("flex flex-col gap-2", typeof e == "function" ? e(t) : e),
		children: n
	});
}
// src/react/boardui/components/base/radio/radio-card.tsx
function We({ className: e, title: t, description: r, ref: i, ...a }) {
	return /* @__PURE__ */ (0, B.jsx)(n, {
		ref: i,
		...a,
		className: (t) => P("group flex w-full items-center justify-between gap-3 rounded-2lg border border-border-button-default py-3 pe-5 ps-4 select-none", "transition-colors duration-150 ease", t.isHovered && !t.isDisabled ? "bg-background-primary-hover" : "bg-background-primary-default", t.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer", typeof e == "function" ? e(t) : e),
		children: (e) => /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [/* @__PURE__ */ (0, B.jsxs)("span", {
			className: "flex min-w-0 flex-col gap-0.5",
			children: [/* @__PURE__ */ (0, B.jsx)("span", {
				className: "truncate text-body-medium text-text-primary",
				children: t
			}), r != null && /* @__PURE__ */ (0, B.jsx)("span", {
				className: "truncate text-body-regular text-text-secondary",
				children: r
			})]
		}), /* @__PURE__ */ (0, B.jsx)("span", {
			className: "flex shrink-0 items-center py-1",
			children: /* @__PURE__ */ (0, B.jsx)(He, {
				size: "md",
				selected: e.isSelected,
				focusVisible: e.isFocusVisible
			})
		})] })
	});
}
// ../../../peach/frontend/node_modules/diff/libesm/diff/base.js
var H = class {
	diff(e, t, n = {}) {
		let r;
		typeof n == "function" ? (r = n, n = {}) : "callback" in n && (r = n.callback);
		let i = this.castInput(e, n), a = this.castInput(t, n), o = this.removeEmpty(this.tokenize(i, n)), s = this.removeEmpty(this.tokenize(a, n));
		return this.diffWithOptionsObj(o, s, n, r);
	}
	diffWithOptionsObj(e, t, n, r) {
		let i = (e) => {
			if (e = this.postProcess(e, n), r) setTimeout(function() {
				r(e);
			}, 0);
			else return e;
		}, a = t.length, o = e.length, s = 1, c = a + o;
		n.maxEditLength != null && (c = Math.min(c, n.maxEditLength));
		let l = n.timeout ?? Infinity, u = Date.now() + l, d = [{
			oldPos: -1,
			lastComponent: void 0
		}], f = this.extractCommon(d[0], t, e, 0, n);
		if (d[0].oldPos + 1 >= o && f + 1 >= a) return i(this.buildValues(d[0].lastComponent, t, e));
		let p = -Infinity, m = Infinity, h = () => {
			for (let r = Math.max(p, -s); r <= Math.min(m, s); r += 2) {
				let s, c = d[r - 1], l = d[r + 1];
				c && (d[r - 1] = void 0);
				let u = !1;
				if (l) {
					let e = l.oldPos - r;
					u = l && 0 <= e && e < a;
				}
				let h = c && c.oldPos + 1 < o;
				if (!u && !h) d[r] = void 0;
				else {
					if (s = !h || u && c.oldPos < l.oldPos ? this.addToPath(l, !0, !1, 0, n) : this.addToPath(c, !1, !0, 1, n), f = this.extractCommon(s, t, e, r, n), s.oldPos + 1 >= o && f + 1 >= a) return i(this.buildValues(s.lastComponent, t, e)) || !0;
					d[r] = s, s.oldPos + 1 >= o && (m = Math.min(m, r - 1)), f + 1 >= a && (p = Math.max(p, r + 1));
				}
			}
			s++;
		};
		if (r) (function e() {
			setTimeout(function() {
				if (s > c || Date.now() > u) return r(void 0);
				h() || e();
			}, 0);
		})();
		else for (; s <= c && Date.now() <= u;) {
			let e = h();
			if (e) return e;
		}
	}
	addToPath(e, t, n, r, i) {
		let a = e.lastComponent;
		return a && !i.oneChangePerToken && a.added === t && a.removed === n ? {
			oldPos: e.oldPos + r,
			lastComponent: {
				count: a.count + 1,
				added: t,
				removed: n,
				previousComponent: a.previousComponent
			}
		} : {
			oldPos: e.oldPos + r,
			lastComponent: {
				count: 1,
				added: t,
				removed: n,
				previousComponent: a
			}
		};
	}
	extractCommon(e, t, n, r, i) {
		let a = t.length, o = n.length, s = e.oldPos, c = s - r, l = 0;
		for (; c + 1 < a && s + 1 < o && this.equals(n[s + 1], t[c + 1], i);) c++, s++, l++, i.oneChangePerToken && (e.lastComponent = {
			count: 1,
			previousComponent: e.lastComponent,
			added: !1,
			removed: !1
		});
		return l && !i.oneChangePerToken && (e.lastComponent = {
			count: l,
			previousComponent: e.lastComponent,
			added: !1,
			removed: !1
		}), e.oldPos = s, c;
	}
	equals(e, t, n) {
		return n.comparator ? n.comparator(e, t) : e === t || !!n.ignoreCase && e.toLowerCase() === t.toLowerCase();
	}
	removeEmpty(e) {
		let t = [];
		for (let n = 0; n < e.length; n++) e[n] && t.push(e[n]);
		return t;
	}
	castInput(e, t) {
		return e;
	}
	tokenize(e, t) {
		return Array.from(e);
	}
	join(e) {
		return e.join("");
	}
	postProcess(e, t) {
		return e;
	}
	get useLongestToken() {
		return !1;
	}
	buildValues(e, t, n) {
		let r = [], i;
		for (; e;) r.push(e), i = e.previousComponent, delete e.previousComponent, e = i;
		r.reverse();
		let a = r.length, o = 0, s = 0, c = 0;
		for (; o < a; o++) {
			let e = r[o];
			if (e.removed) e.value = this.join(n.slice(c, c + e.count)), c += e.count;
			else {
				if (!e.added && this.useLongestToken) {
					let r = t.slice(s, s + e.count);
					r = r.map(function(e, t) {
						let r = n[c + t];
						return r.length > e.length ? r : e;
					}), e.value = this.join(r);
				} else e.value = this.join(t.slice(s, s + e.count));
				s += e.count, e.added || (c += e.count);
			}
		}
		return r;
	}
}, Ge = new class extends H {}();
function U(e, t, n) {
	return Ge.diff(e, t, n);
}
// ../../../peach/frontend/node_modules/diff/libesm/util/string.js
function Ke(e, t) {
	let n = 0;
	for (; n < e.length && n < t.length; n++) if (e[n] != t[n]) return e.slice(0, n);
	return e.slice(0, n);
}
function qe(e, t) {
	let n;
	if (!e || !t || e[e.length - 1] != t[t.length - 1]) return "";
	for (n = 0; n < e.length && n < t.length; n++) if (e[e.length - (n + 1)] != t[t.length - (n + 1)]) return e.slice(-n);
	return e.slice(-n);
}
function W(e, t, n) {
	if (e.slice(0, t.length) != t) throw Error(`string ${JSON.stringify(e)} doesn't start with prefix ${JSON.stringify(t)}; this is a bug`);
	return n + e.slice(t.length);
}
function G(e, t, n) {
	if (!t) return e + n;
	if (e.slice(-t.length) != t) throw Error(`string ${JSON.stringify(e)} doesn't end with suffix ${JSON.stringify(t)}; this is a bug`);
	return e.slice(0, -t.length) + n;
}
function K(e, t) {
	return W(e, t, "");
}
function Je(e, t) {
	return G(e, t, "");
}
function Ye(e, t) {
	return t.slice(0, q(e, t));
}
function q(e, t) {
	let n = 0;
	e.length > t.length && (n = e.length - t.length);
	let r = t.length;
	e.length < t.length && (r = e.length);
	let i = Array(r), a = 0;
	i[0] = 0;
	for (let e = 1; e < r; e++) {
		for (t[e] == t[a] ? i[e] = i[a] : i[e] = a; a > 0 && t[e] != t[a];) a = i[a];
		t[e] == t[a] && a++;
	}
	a = 0;
	for (let r = n; r < e.length; r++) {
		for (; a > 0 && e[r] != t[a];) a = i[a];
		e[r] == t[a] && a++;
	}
	return a;
}
function J(e, t) {
	let n = [];
	for (let r of Array.from(t.segment(e))) {
		let e = r.segment;
		n.length && /\s/.test(n[n.length - 1]) && /\s/.test(e) ? n[n.length - 1] += e : n.push(e);
	}
	return n;
}
function Xe(e, t) {
	if (t) return X(e, t)[1];
	let n;
	for (n = e.length - 1; n >= 0 && e[n].match(/\s/); n--);
	return e.substring(n + 1);
}
function Y(e, t) {
	if (t) return X(e, t)[0];
	let n = e.match(/^\s*/);
	return n ? n[0] : "";
}
function X(e, t) {
	if (!t) return [Y(e), Xe(e)];
	if (t.resolvedOptions().granularity != "word") throw Error("The segmenter passed must have a granularity of \"word\"");
	let n = J(e, t), r = n[0], i = n[n.length - 1];
	return [/\s/.test(r) ? r : "", /\s/.test(i) ? i : ""];
}
// ../../../peach/frontend/node_modules/diff/libesm/diff/word.js
var Z = "a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}", Ze = RegExp(`[${Z}]+|\\s+|[^${Z}]`, "ug");
new class extends H {
	equals(e, t, n) {
		return n.ignoreCase && (e = e.toLowerCase(), t = t.toLowerCase()), e.trim() === t.trim();
	}
	tokenize(e, t = {}) {
		let n;
		if (t.intlSegmenter) {
			let r = t.intlSegmenter;
			if (r.resolvedOptions().granularity != "word") throw Error("The segmenter passed must have a granularity of \"word\"");
			n = J(e, r);
		} else n = e.match(Ze) || [];
		let r = [], i = null;
		return n.forEach((e) => {
			/\s/.test(e) ? i == null ? r.push(e) : r.push(r.pop() + e) : i != null && /\s/.test(i) ? r[r.length - 1] == i ? r.push(r.pop() + e) : r.push(i + e) : r.push(e), i = e;
		}), r;
	}
	join(e) {
		return e.map((e, t) => t == 0 ? e : e.replace(/^\s+/, "")).join("");
	}
	postProcess(e, t) {
		if (!e || t.oneChangePerToken) return e;
		let n = null, r = null, i = null;
		return e.forEach((e) => {
			e.added ? r = e : e.removed ? i = e : ((r || i) && Q(n, i, r, e, t.intlSegmenter), n = e, r = null, i = null);
		}), (r || i) && Q(n, i, r, null, t.intlSegmenter), e;
	}
}();
function Q(e, t, n, r, i) {
	if (t && n) {
		let [a, o] = X(t.value, i), [s, c] = X(n.value, i);
		if (e) {
			let r = Ke(a, s);
			e.value = G(e.value, s, r), t.value = K(t.value, r), n.value = K(n.value, r);
		}
		if (r) {
			let e = qe(o, c);
			r.value = W(r.value, c, e), t.value = Je(t.value, e), n.value = Je(n.value, e);
		}
	} else if (n) {
		if (e) {
			let e = Y(n.value, i);
			n.value = n.value.substring(e.length);
		}
		if (r) {
			let e = Y(r.value, i);
			r.value = r.value.substring(e.length);
		}
	} else if (e && r) {
		let n = Y(r.value, i), [a, o] = X(t.value, i), s = Ke(n, a);
		t.value = K(t.value, s);
		let c = qe(K(n, s), o);
		t.value = Je(t.value, c), r.value = W(r.value, n, c), e.value = G(e.value, n, n.slice(0, n.length - c.length));
	} else if (r) {
		let e = Y(r.value, i), n = Ye(Xe(t.value, i), e);
		t.value = Je(t.value, n);
	} else if (e) {
		let n = Ye(Xe(e.value, i), Y(t.value, i));
		t.value = K(t.value, n);
	}
}
new class extends H {
	tokenize(e) {
		let t = RegExp(`(\\r?\\n)|[${Z}]+|[^\\S\\n\\r]+|[^${Z}]`, "ug");
		return e.match(t) || [];
	}
}(), new class extends H {
	constructor() {
		super(...arguments), this.tokenize = $;
	}
	equals(e, t, n) {
		return n.ignoreWhitespace ? (n.newlineIsToken && e.includes("\n") || (e = e.trim()), n.newlineIsToken && t.includes("\n") || (t = t.trim())) : n.ignoreNewlineAtEof && !n.newlineIsToken && (e.endsWith("\n") && (e = e.slice(0, -1)), t.endsWith("\n") && (t = t.slice(0, -1))), super.equals(e, t, n);
	}
}();
function $(e, t) {
	t.stripTrailingCr && (e = e.replace(/\r\n/g, "\n"));
	let n = [], r = e.split(/(\n|\r\n)/);
	r[r.length - 1] || r.pop();
	for (let e = 0; e < r.length; e++) {
		let i = r[e];
		e % 2 && !t.newlineIsToken ? n[n.length - 1] += i : n.push(i);
	}
	return n;
}
// ../../../peach/frontend/node_modules/diff/libesm/diff/sentence.js
function Qe(e) {
	return e == "." || e == "!" || e == "?";
}
new class extends H {
	tokenize(e) {
		let t = [], n = 0;
		for (let r = 0; r < e.length; r++) {
			if (r == e.length - 1) {
				t.push(e.slice(n));
				break;
			}
			if (Qe(e[r]) && e[r + 1].match(/\s/)) {
				for (t.push(e.slice(n, r + 1)), r = n = r + 1; e[r + 1]?.match(/\s/);) r++;
				t.push(e.slice(n, r + 1)), n = r + 1;
			}
		}
		return t;
	}
}(), new class extends H {
	tokenize(e) {
		return e.split(/([{}:;,]|\s+)/);
	}
}(), new class extends H {
	constructor() {
		super(...arguments), this.tokenize = $;
	}
	get useLongestToken() {
		return !0;
	}
	castInput(e, t) {
		let { undefinedReplacement: n, stringifyReplacer: r = (e, t) => t === void 0 ? n : t } = t;
		return typeof e == "string" ? e : JSON.stringify($e(e, null, null, r), null, "  ");
	}
	equals(e, t, n) {
		return super.equals(e.replace(/,([\r\n])/g, "$1"), t.replace(/,([\r\n])/g, "$1"), n);
	}
}();
function $e(e, t, n, r, i) {
	t ||= [], n ||= [], r && (e = r(i === void 0 ? "" : i, e));
	let a = 0;
	for (; a < t.length; a += 1) if (t[a] === e) return n[a];
	let o;
	if (Object.prototype.toString.call(e) === "[object Array]") {
		for (t.push(e), o = Array(e.length), n.push(o), a = 0; a < e.length; a += 1) o[a] = $e(e[a], t, n, r, String(a));
		return t.pop(), n.pop(), o;
	}
	if (e && e.toJSON && (e = e.toJSON()), typeof e == "object" && e) {
		t.push(e), o = {}, n.push(o);
		let i = [], s;
		for (s in e)
 /* istanbul ignore else */
		Object.prototype.hasOwnProperty.call(e, s) && i.push(s);
		for (i.sort(), a = 0; a < i.length; a += 1) s = i[a], o[s] = $e(e[s], t, n, r, s);
		t.pop(), n.pop();
	} else o = e;
	return o;
}
new class extends H {
	tokenize(e) {
		return e.slice();
	}
	join(e) {
		return e;
	}
	removeEmpty(e) {
		return e;
	}
}();
// src/react/review/comparison-text.tsx
function et({ value: e, reference: t }) {
	let n = (0, z.useMemo)(() => t ? U(t, e).filter((e) => !e.removed) : [{
		value: e,
		added: !1
	}], [e, t]);
	return /* @__PURE__ */ (0, B.jsx)(B.Fragment, { children: n.map((e, t) => e.added ? /* @__PURE__ */ (0, B.jsx)("mark", {
		"data-review-difference": "",
		className: "rounded-sm bg-status-yellow-background text-status-yellow-text",
		children: e.value
	}, t) : /* @__PURE__ */ (0, B.jsx)("span", { children: e.value }, t)) });
}
// src/react/review/candidate-form.tsx
var tt = {
	title: "标题",
	original_title: "原标题",
	runtime: "来源时长",
	director: "导演",
	label: "Label",
	poster_url: "海报",
	cover_url: "封面",
	screenshot_urls: "截图",
	trailer_url: "预告片"
}, nt = "reviewgenretags";
function rt({ tags: e }) {
	return e.length ? /* @__PURE__ */ (0, B.jsx)("datalist", {
		id: nt,
		children: e.map((e) => /* @__PURE__ */ (0, B.jsx)("option", { value: e }, e))
	}) : null;
}
function it({ candidate: e, row: t }) {
	let [n, i] = (0, z.useState)(!1), a = (0, z.useId)(), o = Object.entries(e.catalog_evidence || {}).filter(([, e]) => e && e.display_value);
	return o.length ? /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, B.jsxs)(r, {
			variant: "secondary",
			size: "small",
			leadingIcon: c,
			"aria-expanded": n,
			"aria-controls": a,
			"aria-label": `${n ? "收起" : "展开"} ${e.source || "该来源"} 的来源依据`,
			onClick: () => i(!n),
			children: [/* @__PURE__ */ (0, B.jsx)("span", {
				"data-copy-key": "review.card.source_evidence",
				children: "来源依据"
			}), ` · ${o.length}`]
		}), /* @__PURE__ */ (0, B.jsx)(l, {
			id: a,
			open: n,
			children: /* @__PURE__ */ (0, B.jsx)("dl", {
				className: "flex min-w-0 flex-col gap-2 px-3 pt-2 pb-1",
				children: o.map(([n, r]) => /* @__PURE__ */ (0, B.jsxs)("div", {
					className: "flex min-w-0 flex-wrap gap-x-2",
					children: [
						/* @__PURE__ */ (0, B.jsx)("dt", {
							className: "text-caption-1-regular text-text-tertiary",
							children: tt[n] || n
						}),
						/* @__PURE__ */ (0, B.jsx)("dd", {
							className: "min-w-0 text-body-2-regular break-words text-text-primary",
							children: /* @__PURE__ */ (0, B.jsx)(et, {
								value: r.display_value || "",
								reference: n === t.field && t.current_value ? t.current_value : t.candidates?.find((t) => t.candidate_key !== e.candidate_key && t.catalog_evidence?.[n]?.display_value)?.catalog_evidence?.[n]?.display_value
							})
						}),
						(r.warnings || []).map((e) => /* @__PURE__ */ (0, B.jsx)("small", {
							className: "w-full text-caption-1-regular text-status-yellow-text",
							children: e
						}, e))
					]
				}, n))
			})
		})]
	}) : null;
}
function at(e) {
	let t = e.content_id || e.provider_id;
	return `${e.source || "未标注来源"}${e.official ? " · 官方优先" : ""}${t ? ` · ID ${t}` : ""}`;
}
function ot({ candidate: e, reference: t }) {
	return /* @__PURE__ */ (0, B.jsxs)("span", {
		className: "flex min-w-0 flex-col gap-2 whitespace-normal wrap-anywhere",
		children: [/* @__PURE__ */ (0, B.jsx)("span", {
			className: "text-body-regular text-text-primary",
			children: /* @__PURE__ */ (0, B.jsx)(et, {
				value: e.display_value || "",
				reference: t
			})
		}), (e.warnings || []).map((e) => /* @__PURE__ */ (0, B.jsx)("span", {
			className: "text-body-2-regular text-status-yellow-text",
			children: e
		}, e))]
	});
}
function st({ row: e, fieldName: t, value: n, onChange: r, locked: i }) {
	let a = e.candidates || [];
	return a.length ? a.length === 1 ? /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-2",
		children: [/* @__PURE__ */ (0, B.jsxs)("div", {
			className: "flex min-w-0 flex-col gap-2 rounded-2lg bg-background-primary-default px-4 py-3",
			children: [/* @__PURE__ */ (0, B.jsx)("p", {
				className: "text-body-medium text-text-primary",
				children: at(a[0])
			}), /* @__PURE__ */ (0, B.jsx)(ot, {
				candidate: a[0],
				reference: e.current_value || void 0
			})]
		}), /* @__PURE__ */ (0, B.jsx)(it, {
			candidate: a[0],
			row: e
		})]
	}) : /* @__PURE__ */ (0, B.jsx)(Ue, {
		"aria-label": `${t || "资料"}的来源`,
		value: n,
		isDisabled: i,
		onChange: r,
		children: /* @__PURE__ */ (0, B.jsx)("div", {
			className: "flex min-w-0 flex-col gap-3",
			children: a.map((t) => /* @__PURE__ */ (0, B.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-1",
				children: [/* @__PURE__ */ (0, B.jsx)(We, {
					value: t.candidate_key,
					className: "relative items-start",
					title: /* @__PURE__ */ (0, B.jsx)("span", {
						title: at(t),
						children: at(t)
					}),
					description: /* @__PURE__ */ (0, B.jsx)(ot, {
						candidate: t,
						reference: e.current_value || a.find((e) => e.candidate_key !== t.candidate_key)?.display_value
					})
				}), /* @__PURE__ */ (0, B.jsx)(it, {
					candidate: t,
					row: e
				})]
			}, t.candidate_key))
		})
	}) : null;
}
function ct({ genre: e, tags: t, locked: n, toast: i }) {
	let [a, o] = (0, z.useState)(""), [s, c] = (0, z.useState)(""), l = Fe({
		mutationFn: (t) => be(e, t),
		onSuccess: async (t, n) => {
			t.ok ? (i(n ? `已把「${e}」收录为标签「${n}」` : `已把「${e}」判为非内容标签`), await I()) : c(t.error || "服务端拒绝了这次收录");
		},
		onError: (e) => c(fe(e))
	}), u = () => {
		let e = a.trim();
		e ? (c(""), l.mutate(e)) : c("先给它一个中文标签");
	};
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, B.jsx)("b", {
				lang: "ja",
				className: "text-body-medium text-text-primary",
				children: e
			}),
			/* @__PURE__ */ (0, B.jsx)(E, {
				"aria-label": `「${e}」收录成的中文标签`,
				value: a,
				onChange: o,
				maxLength: 40,
				isDisabled: n || l.isPending,
				className: "min-w-40 flex-1",
				children: /* @__PURE__ */ (0, B.jsx)(v, {
					size: "small",
					list: t.length ? nt : void 0,
					autoComplete: "off",
					placeholder: "中文标签",
					onKeyDown: (e) => {
						e.key !== "Enter" || N(e.nativeEvent) || (e.preventDefault(), u());
					}
				})
			}),
			/* @__PURE__ */ (0, B.jsx)(r, {
				variant: "secondary",
				size: "small",
				disabled: n || l.isPending,
				onClick: u,
				children: "收录"
			}),
			/* @__PURE__ */ (0, B.jsx)(r, {
				variant: "secondary",
				size: "small",
				disabled: n || l.isPending,
				onClick: () => {
					c(""), l.mutate("");
				},
				children: "不是内容"
			}),
			s ? /* @__PURE__ */ (0, B.jsx)("p", {
				role: "status",
				className: "w-full text-body-2-regular text-text-error-primary",
				children: s
			}) : null
		]
	});
}
function lt({ row: e, tags: t, locked: n, toast: r }) {
	let i = F(e);
	return i.length ? /* @__PURE__ */ (0, B.jsxs)("div", {
		role: "group",
		"aria-label": "未收录 genre",
		className: "flex flex-col gap-2 border-t border-separator-border pt-4",
		children: [/* @__PURE__ */ (0, B.jsx)("h5", {
			className: "text-body-2-medium text-text-secondary",
			children: `未收录 genre · ${i.length}`
		}), /* @__PURE__ */ (0, B.jsx)("div", {
			role: "list",
			className: "flex flex-col",
			children: i.map((e, i) => /* @__PURE__ */ (0, B.jsx)("div", {
				role: "listitem",
				className: `py-3 first:pt-0 last:pb-0 ${i ? "border-t border-separator-border" : ""}`,
				children: /* @__PURE__ */ (0, B.jsx)(ct, {
					genre: e,
					tags: t,
					locked: n,
					toast: r
				})
			}, e))
		})]
	}) : null;
}
// src/react/review/review-evidence.tsx
var ut = (e = "") => /^https?:\/\//i.test(e) ? e : "", dt = (e = "") => ut(e) || (e.startsWith("/") && !e.startsWith("//") ? e : "");
function ft({ url: e }) {
	let t = dt(e || "");
	return /* @__PURE__ */ (0, B.jsx)(pt, { source: t }, t);
}
function pt({ source: e }) {
	let [t, n] = (0, z.useState)("idle");
	return (0, z.useEffect)(() => {
		if (t !== "loading") return;
		let e = setTimeout(() => n("failed"), 3e4);
		return () => clearTimeout(e);
	}, [t]), /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "relative flex h-review-image items-center justify-center overflow-hidden rounded-surface bg-background-secondary-default",
		children: [t === "loading" ? /* @__PURE__ */ (0, B.jsxs)("span", {
			role: "status",
			className: "absolute flex items-center gap-2 text-body-2-regular text-text-secondary",
			children: [/* @__PURE__ */ (0, B.jsx)("span", { dangerouslySetInnerHTML: { __html: Ne("正在加载图片") } }), "正在加载图片"]
		}) : null, e && (t === "loading" || t === "ready") ? /* @__PURE__ */ (0, B.jsx)("img", {
			src: e,
			alt: "来源提供的备选图片",
			referrerPolicy: "no-referrer",
			decoding: "async",
			className: `size-full object-contain ${t === "loading" ? "invisible" : ""}`,
			onLoad: () => n("ready"),
			onError: () => n("failed")
		}) : e ? /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "flex flex-col items-center gap-2",
			children: [t === "failed" ? /* @__PURE__ */ (0, B.jsx)("span", {
				className: "text-body-2-regular text-text-secondary",
				children: "未取得来源图片"
			}) : null, /* @__PURE__ */ (0, B.jsx)(r, {
				variant: "secondary",
				size: "small",
				"aria-label": t === "failed" ? "立即重试加载来源图片" : void 0,
				onClick: () => n("loading"),
				children: t === "failed" ? "立即重试" : "查看来源图片"
			})]
		}) : /* @__PURE__ */ (0, B.jsx)("span", {
			className: "text-body-2-regular text-text-secondary",
			children: "未取得来源图片"
		})]
	});
}
function mt({ asset: t, openItem: n }) {
	let i = t.name || "";
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "flex min-w-0 items-center gap-3",
		children: [/* @__PURE__ */ (0, B.jsxs)("button", {
			type: "button",
			onClick: () => n(t.id),
			className: "flex aspect-card-cover w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2lg bg-background-tertiary-default outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
			children: [t.preview_url ? /* @__PURE__ */ (0, B.jsx)("img", {
				src: t.preview_url,
				alt: "",
				loading: "lazy",
				className: "size-full object-cover"
			}) : /* @__PURE__ */ (0, B.jsx)("span", {
				className: "text-caption-1-regular text-text-secondary",
				children: "无封面"
			}), /* @__PURE__ */ (0, B.jsx)(e, { children: `打开原视频 ${i}` })]
		}), /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "flex min-w-0 flex-col items-start gap-1",
			children: [/* @__PURE__ */ (0, B.jsx)("b", {
				title: i,
				className: "w-full truncate text-body-medium text-text-primary",
				children: t.code || i || "原视频"
			}), /* @__PURE__ */ (0, B.jsx)(r, {
				variant: "secondary",
				size: "small",
				leadingIcon: _,
				onClick: () => n(t.id),
				children: "打开原视频"
			})]
		})]
	});
}
function ht({ kind: e, name: t, works: n, avatar: r, openEntity: i }) {
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "flex min-w-0 items-center gap-3",
		children: [/* @__PURE__ */ (0, B.jsx)("button", {
			type: "button",
			"aria-label": `打开创作者页：${t}`,
			onClick: () => i(e, t),
			className: `relative inline-grid size-11 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-background-secondary-default text-caption-1-medium text-text-secondary outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring ${R}`,
			dangerouslySetInnerHTML: { __html: r }
		}), /* @__PURE__ */ (0, B.jsxs)("div", {
			className: "flex min-w-0 flex-col items-start",
			children: [/* @__PURE__ */ (0, B.jsx)("button", {
				type: "button",
				onClick: () => i(e, t),
				className: "max-w-full cursor-pointer truncate text-body-medium text-text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-border-focus-ring",
				children: t
			}), n ? /* @__PURE__ */ (0, B.jsx)("small", {
				className: "tabular-nums text-body-2-regular text-text-secondary",
				children: `${n.toLocaleString()} 部作品`
			}) : null]
		})]
	});
}
function gt({ row: e, openItem: t, openEntity: n, onReveal: a, revealing: o, note: s }) {
	let c = ut(e.profile_url || ""), l = (e.preview_assets || []).slice(0, 6), u = Math.max(0, Number(e.video_count || e.videos || 0));
	return /* @__PURE__ */ (0, B.jsxs)("section", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, B.jsx)("h5", {
				className: "text-body-medium text-text-primary",
				children: `待确认人物：${e.babepedia_name || "未标注"}`
			}),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [c ? /* @__PURE__ */ (0, B.jsx)(i, {
					variant: "secondary",
					size: "small",
					trailingIcon: D,
					href: c,
					target: "_blank",
					rel: "noopener noreferrer",
					children: "来源资料"
				}) : null, /* @__PURE__ */ (0, B.jsx)(r, {
					variant: "secondary",
					size: "small",
					onClick: () => n("creator", e.creator || ""),
					children: `查看全部 ${u.toLocaleString()} 部作品`
				})]
			}),
			/* @__PURE__ */ (0, B.jsx)(ft, { url: e.preview_url }),
			l.length ? /* @__PURE__ */ (0, B.jsxs)(B.Fragment, { children: [/* @__PURE__ */ (0, B.jsx)("h5", {
				className: "text-body-medium text-text-primary",
				children: "本地作品样本"
			}), /* @__PURE__ */ (0, B.jsx)("ul", {
				className: "flex flex-col gap-1",
				children: l.map((e) => /* @__PURE__ */ (0, B.jsxs)("li", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, B.jsx)(r, {
						variant: "ghost",
						size: "small",
						className: "min-w-0",
						onClick: () => t(e.id),
						children: /* @__PURE__ */ (0, B.jsx)("span", {
							title: e.name,
							className: "block max-w-full truncate",
							children: e.name
						})
					}), /* @__PURE__ */ (0, B.jsx)(r, {
						variant: "ghost",
						size: "small",
						"aria-label": `打开 ${e.name} 的文件位置`,
						...A(o === e.id),
						onClick: () => a(e.id),
						children: "文件位置"
					})]
				}, e.id))
			})] }) : /* @__PURE__ */ (0, B.jsx)("p", {
				className: "text-body-2-regular text-text-secondary",
				children: "暂无本地作品样本，打开全部作品核对。"
			}),
			s ? /* @__PURE__ */ (0, B.jsx)("p", {
				role: "status",
				className: "text-body-2-regular text-text-error-primary",
				children: s
			}) : null
		]
	});
}
function _t({ assets: t, picked: n, onPicked: r, locked: i }) {
	let [a, s] = (0, z.useState)(null), c = new Set(n), l = (e, n) => {
		if (i) return;
		let o = new Set(c);
		if (n && a !== null) {
			let [n, r] = [Math.min(a, e), Math.max(a, e)];
			for (let e = n; e <= r; e++) o.add(t[e].id);
		} else {
			let n = t[e].id;
			o.has(n) ? o.delete(n) : o.add(n);
		}
		s(e), r(t.filter((e) => o.has(e.id)).map((e) => e.id));
	};
	return /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, B.jsx)(w, {
			prefix: /* @__PURE__ */ (0, B.jsx)("span", {
				className: "tabular-nums text-body-2-regular text-text-secondary",
				children: `已选 ${c.size} / ${t.length}`
			}),
			actions: [{
				label: "全选",
				disabled: i,
				onPress: () => r(t.map((e) => e.id))
			}, {
				label: "清空",
				disabled: i,
				onPress: () => r([])
			}]
		}), /* @__PURE__ */ (0, B.jsx)("div", {
			className: "review-asset-grid gap-1.5",
			children: t.map((t, n) => {
				let r = c.has(t.id);
				return /* @__PURE__ */ (0, B.jsxs)("button", {
					type: "button",
					"aria-pressed": r,
					title: t.name,
					onClick: (e) => l(n, e.shiftKey),
					className: `relative aspect-card-cover cursor-pointer overflow-hidden rounded-surface bg-background-tertiary-default outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-border-focus-ring ${r ? "opacity-100 ring-2 ring-border-button-active ring-inset" : "opacity-50"}`,
					children: [
						/* @__PURE__ */ (0, B.jsx)("img", {
							src: `/poster?id=${t.id}&c=4`,
							alt: "",
							loading: "lazy",
							className: "size-full object-cover"
						}),
						/* @__PURE__ */ (0, B.jsx)("span", {
							className: "absolute top-1 right-1",
							children: /* @__PURE__ */ (0, B.jsx)(o, {
								size: "sm",
								state: {
									isSelected: r,
									isIndeterminate: !1,
									isFocusVisible: !1,
									isDisabled: i,
									isHovered: !1
								}
							})
						}),
						/* @__PURE__ */ (0, B.jsx)(e, { children: `${r ? "已选" : "未选"} ${t.name || t.id}` })
					]
				}, t.id);
			})
		})]
	});
}
// src/react/review/review-card.tsx
var vt = j({
	variant: "filled",
	padding: "none",
	className: "flex flex-col overflow-hidden"
}), yt = "flex min-h-6 min-w-0 items-center", bt = 2, xt = (e) => e === "western_identity" ? "h-review-card-tall" : "h-review-card";
function St(e) {
	let { category: t, row: n, choice: i, onChoice: o, selected: c, onSelect: l, locked: u, busy: d, problem: h, genreTags: g, onDecide: _, handlers: v, queueView: y = "pending" } = e, b = (0, z.useRef)(!1), re = Le(), ie = t === "metadata_fields", ae = f[t] || "", x = String(n.creator || "").trim(), S = !!ae && !!x, C = L(t, n), w = Oe(t, n), oe = ke(t, n), T = De(n), E = Ae(n), D = se(t, n), O = n.comparison_assets || [], j = n.preview_assets || [], M = ne[n.decision || ""], N = O.length > 1 ? /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [O.slice(0, bt).map((e) => /* @__PURE__ */ (0, B.jsx)(mt, {
			asset: e,
			openItem: v.openItem
		}, e.id)), O.length > bt ? /* @__PURE__ */ (0, B.jsx)("p", {
			className: "text-body-2-regular text-text-secondary",
			children: `另有 ${(O.length - bt).toLocaleString()} 部对照作品`
		}) : null]
	}) : S ? /* @__PURE__ */ (0, B.jsx)(ht, {
		kind: ae,
		name: x,
		works: Number(n.video_count || n.videos || 0),
		openEntity: v.openEntity,
		avatar: k(x, n.entity_id ? {
			id: n.entity_id,
			has_image: !!n.has_image,
			image_version: n.image_version,
			avatar_focus: n.avatar_focus
		} : null, null, ae)
	}) : n.asset_id ? /* @__PURE__ */ (0, B.jsx)(mt, {
		openItem: v.openItem,
		asset: {
			id: n.asset_id,
			name: n.asset_name,
			code: n.code,
			preview_url: n.asset_preview_url
		}
	}) : null, ce = ie ? /* @__PURE__ */ (0, B.jsx)(st, {
		row: n,
		fieldName: w,
		value: i.candidateKey,
		onChange: (e) => o({
			...i,
			candidateKey: e
		}),
		locked: u
	}) : t === "creator_tags" ? j.length ? /* @__PURE__ */ (0, B.jsx)(_t, {
		assets: j,
		picked: i.assets,
		locked: u,
		onPicked: (e) => o({
			...i,
			assets: e
		})
	}) : /* @__PURE__ */ (0, B.jsx)(m, {
		size: "compact",
		icon: p,
		title: "这批作品尚未抽帧",
		children: `${n.video_count || ""} 条作品还没有可用预览；批准后仍会按所选资料写入标签。`
	}) : t === "fc2_similarity" ? null : t === "western_identity" ? /* @__PURE__ */ (0, B.jsx)(gt, {
		row: n,
		openItem: v.openItem,
		openEntity: v.openEntity,
		onReveal: v.onReveal,
		revealing: v.revealing,
		note: v.revealNote
	}) : /* @__PURE__ */ (0, B.jsx)(ft, { url: n.preview_url }), le = S ? N : w ? /* @__PURE__ */ (0, B.jsxs)("h4", {
		className: P(yt, "flex-wrap gap-2"),
		children: [/* @__PURE__ */ (0, B.jsx)("span", {
			title: w,
			className: "flex max-w-full min-w-0 overflow-hidden rounded-md",
			children: /* @__PURE__ */ (0, B.jsx)(s, {
				variant: "caption",
				color: "neutral",
				children: w
			})
		}), /* @__PURE__ */ (0, B.jsx)("span", {
			title: oe,
			className: "min-w-0 truncate text-body-medium text-text-primary",
			children: oe
		})]
	}) : /* @__PURE__ */ (0, B.jsx)("h4", {
		className: yt,
		children: /* @__PURE__ */ (0, B.jsx)("span", {
			title: C,
			className: "min-w-0 truncate text-body-medium text-text-primary",
			children: C
		})
	});
	return /* @__PURE__ */ (0, B.jsxs)("section", {
		"aria-label": C,
		"data-review-key": n.item_key,
		className: P(vt, xt(t)),
		children: [
			/* @__PURE__ */ (0, B.jsxs)("header", {
				className: "flex min-w-0 shrink-0 items-center gap-2 border-b border-separator-border px-5 py-4",
				children: [
					u ? null : /* @__PURE__ */ (0, B.jsx)("span", {
						className: P(yt, "shrink-0"),
						onPointerDownCapture: (e) => {
							b.current = e.shiftKey;
						},
						onKeyDownCapture: (e) => {
							b.current = e.shiftKey;
						},
						children: /* @__PURE__ */ (0, B.jsx)(a, {
							isSelected: c,
							"aria-label": `选择 ${C}`,
							onChange: (e) => l(b.current, e)
						})
					}),
					/* @__PURE__ */ (0, B.jsx)("div", {
						className: "min-w-0 flex-1",
						children: le
					}),
					M ? /* @__PURE__ */ (0, B.jsx)(s, {
						variant: "caption",
						color: "neutral",
						children: M
					}) : null
				]
			}),
			/* @__PURE__ */ (0, B.jsx)("div", {
				className: "relative mx-5 flex min-w-0 min-h-0 flex-1 flex-col",
				children: /* @__PURE__ */ (0, B.jsxs)("div", {
					ref: re,
					className: "flex min-w-0 min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4",
					children: [
						n.source_name ? /* @__PURE__ */ (0, B.jsx)("p", {
							className: "text-body-2-regular text-text-secondary",
							children: `来源写法：${n.source_name}`
						}) : null,
						!S && (n.board || n.assets) ? /* @__PURE__ */ (0, B.jsx)("p", {
							className: "text-body-2-regular text-text-secondary",
							children: `对照文件：${Number(n.video_count || n.assets || 0).toLocaleString()}`
						}) : null,
						!S && N ? N : null,
						ie && (T || n.current_value !== void 0) ? /* @__PURE__ */ (0, B.jsxs)("div", {
							role: "region",
							"aria-label": "当前信息",
							className: "flex min-w-0 flex-col gap-1 border-b border-separator-border pb-4",
							children: [
								/* @__PURE__ */ (0, B.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, B.jsx)("h5", {
										"data-copy-key": "review.card.current_value",
										className: "text-caption-1-medium text-text-secondary",
										children: "当前值"
									}), n.current_owner?.startsWith("user:") || n.current_owner?.startsWith("review:") ? /* @__PURE__ */ (0, B.jsx)(s, {
										variant: "caption",
										color: "neutral",
										children: "人工确认"
									}) : null]
								}),
								/* @__PURE__ */ (0, B.jsx)("p", {
									className: "text-body-2-regular text-text-primary wrap-anywhere",
									children: n.current_value === void 0 ? T : n.current_value ? /* @__PURE__ */ (0, B.jsx)(et, {
										value: n.current_value,
										reference: (n.candidates?.find((e) => e.candidate_key === i.candidateKey) || n.candidates?.[0])?.display_value
									}) : "尚无资料"
								}),
								n.videos === void 0 ? null : /* @__PURE__ */ (0, B.jsx)("p", {
									className: "text-caption-1-regular text-text-secondary",
									children: `${Number(n.videos).toLocaleString()} 个${n.asset_path ? "匹配文件" : "同番号文件"}`
								})
							]
						}) : null,
						E.length || t === "creator_tags" ? /* @__PURE__ */ (0, B.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: E.length ? E.map((e) => /* @__PURE__ */ (0, B.jsx)(s, {
								variant: "caption",
								color: "soft",
								children: e
							}, e)) : /* @__PURE__ */ (0, B.jsx)("small", {
								className: "text-body-2-regular text-text-secondary",
								children: "暂无待确认标签"
							})
						}) : null,
						ie ? /* @__PURE__ */ (0, B.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, B.jsxs)("h5", {
								className: "text-caption-1-medium text-text-secondary",
								children: [/* @__PURE__ */ (0, B.jsx)("span", {
									"data-copy-key": "review.card.candidate_sources",
									children: "候选来源"
								}), ` · ${n.candidates?.length || 0}`]
							}), n.current_value || (n.candidates?.length || 0) > 1 ? /* @__PURE__ */ (0, B.jsx)("span", {
								"data-copy-key": n.current_value ? "review.card.compare_current" : "review.card.compare_sources",
								className: "text-caption-1-regular text-text-tertiary",
								children: n.current_value ? "与当前值比较" : "来源间差异"
							}) : null]
						}) : null,
						ce,
						/* @__PURE__ */ (0, B.jsx)(lt, {
							row: n,
							tags: g,
							locked: u,
							toast: v.toast
						}),
						!ie && T ? /* @__PURE__ */ (0, B.jsx)("p", {
							className: "text-body-2-regular text-text-secondary wrap-anywhere",
							children: T
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, B.jsxs)("footer", {
				className: P(ee.stack, "shrink-0"),
				children: [
					y === "ignored" ? null : /* @__PURE__ */ (0, B.jsx)(te, {
						variant: "secondary",
						size: "small",
						className: "me-auto",
						disabled: u,
						...A(d),
						onClick: () => _("rejected"),
						children: "忽略"
					}),
					y === "pending" ? /* @__PURE__ */ (0, B.jsx)(r, {
						variant: "secondary",
						size: "small",
						disabled: u,
						...A(d),
						onClick: () => _("skipped"),
						children: "稍后处理"
					}) : /* @__PURE__ */ (0, B.jsx)(r, {
						variant: y === "ignored" ? "primary" : "secondary",
						size: "small",
						disabled: u,
						...A(d),
						onClick: () => _("restore"),
						children: "恢复待处理"
					}),
					y === "ignored" ? null : /* @__PURE__ */ (0, B.jsx)(r, {
						variant: "primary",
						size: "small",
						disabled: u || !D,
						...A(d),
						title: D ? void 0 : "没有可采用的资料，可先保留或忽略",
						onClick: () => _("approved"),
						children: D ? "通过" : "不可通过"
					}),
					h ? /* @__PURE__ */ (0, B.jsx)("p", {
						role: "status",
						className: "w-full text-body-2-regular text-text-error-primary",
						children: h
					}) : null
				]
			})
		]
	});
}
// src/react/review/review-page.tsx
var Ct = "flex cursor-pointer items-center justify-between gap-2";
function wt(e) {
	let t = Ie("review").keys.filter(ge), [n, i] = (0, z.useState)(() => matchMedia("(max-width:900px)").matches);
	(0, z.useEffect)(() => {
		let e = matchMedia("(max-width:900px)"), t = () => i(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let { route: a, openItem: o, openEntity: s, revealSource: c, toast: l, readOnly: f, readOnlyMessage: p, writerUrl: ee } = e, [g, _] = (0, z.useState)(ge(e.category) ? e.category : u), [v, te] = (0, z.useState)(() => Te(e.queue)), [ne, S] = (0, z.useState)("candidates"), [C, w] = (0, z.useState)(""), [oe, E] = (0, z.useState)(""), [D, O] = (0, z.useState)(1), [k, A] = (0, z.useState)(20), [j, M] = (0, z.useState)(/* @__PURE__ */ new Set()), [N, P] = (0, z.useState)(/* @__PURE__ */ new Map()), [_e, F] = (0, z.useState)(/* @__PURE__ */ new Map()), [be, I] = (0, z.useState)(""), xe = (0, z.useRef)(null), [Se, De] = (0, z.useState)(0), [Oe, ke] = (0, z.useState)(""), Ae = (0, z.useRef)(!0);
	(0, z.useEffect)(() => () => {
		Ae.current = !1;
	}, []);
	let L = Re({
		queryKey: re,
		queryFn: ({ signal: e }) => pe(e)
	}), Ne = L.data || {
		sections: {},
		counts: {},
		queues: {
			later: {
				sections: {},
				counts: {}
			},
			ignored: {
				sections: {},
				counts: {}
			}
		}
	}, Le = we(Ne, v), ze = L.data ? Object.fromEntries(ae.map((e) => [e, b.reduce((t, n) => t + Number(we(Ne, e).counts[n] || 0), 0)])) : void 0, R = Le.sections[g] || [], V = g === "metadata_fields", He = f;
	(0, z.useEffect)(() => {
		let e = new Set(R.map((e) => e.item_key));
		M((t) => {
			let n = [...t].filter((t) => e.has(t));
			return n.length === t.size ? t : new Set(n);
		}), P((t) => {
			let n = [...t].filter(([t]) => e.has(t));
			return n.length === t.size ? t : new Map(n);
		}), F((t) => {
			let n = [...t].filter(([t]) => e.has(t));
			return n.length === t.size ? t : new Map(n);
		});
	}, [R]);
	let Ue = (0, z.useMemo)(() => V ? he(R, "field") : [], [R, V]), We = Ue.some((e) => e.key === oe) ? oe : "", H = (0, z.useMemo)(() => V ? me(R, "field", We) : R, [
		R,
		V,
		We
	]), Ge = (0, z.useMemo)(() => Ce(H, V), [H, V]), U = Ge.some(([e]) => e === ne) ? ne : "candidates", Ke = (0, z.useMemo)(() => he(H, U), [H, U]), qe = Ke.some((e) => e.key === C) ? C : "", W = (0, z.useMemo)(() => me(H, U, qe), [
		H,
		U,
		qe
	]), G = (0, z.useMemo)(() => Ee(W, D, k), [
		W,
		D,
		k
	]), K = G.rows.map((e) => e.item_key), Je = new Set(K), Ye = Ke.map((e) => ({
		...e,
		rows: e.rows.filter((e) => Je.has(e.item_key))
	})).filter((e) => e.rows.length), q = (e) => N.get(e.item_key) || de(e), J = (0, z.useMemo)(() => R.filter((e) => j.has(e.item_key)), [R, j]), Xe = (e) => {
		let t = new Set(e);
		M((e) => new Set([...e].filter((e) => !t.has(e)))), P((e) => new Map([...e].filter(([e]) => !t.has(e)))), F((e) => new Map([...e].filter(([e]) => !t.has(e))));
	}, Y = (e, t) => F((n) => new Map(n).set(e, t)), X = () => {
		S("candidates"), w(""), E(""), O(1), M(/* @__PURE__ */ new Set()), P(/* @__PURE__ */ new Map()), F(/* @__PURE__ */ new Map()), I(""), xe.current = null;
	}, Z = (e) => {
		_(e), X(), a({
			category: e === "metadata_fields" ? "" : e,
			queue: v === "pending" ? "" : v
		});
	}, Ze = (e) => {
		te(e), X(), a({
			category: g === "metadata_fields" ? "" : g,
			queue: e === "pending" ? "" : e
		});
	}, Q = Fe({
		mutationFn: ({ row: e, status: t, category: n }) => Pe(le(n, ce(n, e), t, q(e))),
		onSuccess: (e, { row: t, status: n, category: r }) => {
			e.ok ? (Me(r, [t.item_key], n), Xe([t.item_key]), l(ue(n))) : Y(t.item_key, e.error || "服务端拒绝了这次判定");
		},
		onError: (e, { row: t }) => Y(t.item_key, fe(e))
	}), $ = Fe({
		mutationFn: async ({ status: e, category: t, rows: n }) => {
			let r = [], i = [];
			for (let [a, o] of n.entries()) {
				if (!Ae.current) break;
				I(`正在处理 ${a} / ${n.length}`);
				try {
					let n = await Pe(le(t, ce(t, o), e, q(o)));
					if (!n.ok) throw Error(n.error || "服务端未采用该项");
					r.push(o.item_key);
				} catch (e) {
					i.push([o.item_key, fe(e)]);
				}
			}
			return {
				status: e,
				category: t,
				done: r,
				failures: i
			};
		},
		onSuccess: ({ status: e, category: t, done: n, failures: r }) => {
			Me(t, n, e), Xe(n), r.forEach(([e, t]) => Y(e, t)), I("");
			let i = {
				approved: "通过",
				rejected: "忽略",
				skipped: "移至稍后处理",
				restore: "恢复待处理"
			}[e];
			l(`已${i} ${n.length} 项` + (r.length ? `，${r.length} 项未完成` : ""));
		},
		onError: (e) => {
			I(fe(e));
		}
	}), Qe = (e) => {
		!$.isPending && J.length && (e === "approved" && V && J.some((e) => !q(e).candidateKey) ? I("请先为所选资料选择要采用的来源。") : (I(""), $.mutate({
			status: e,
			category: g,
			rows: J
		})));
	}, $e = (e) => {
		P((t) => {
			let n = new Map(t);
			for (let t of J) {
				let r = t.candidates?.find((t) => t.source === e);
				r && n.set(t.item_key, {
					...q(t),
					candidateKey: r.candidate_key
				});
			}
			return n;
		}), I(`已选择 ${e}，点击通过所选采用。`);
	}, et = async (e) => {
		if (Se) return;
		De(e), ke("");
		let t = await c(e);
		Ae.current && (De(0), ke(t));
	}, tt = ye(Ne.mirror, p), nt = Ne.genre_tags || [], it = {
		openItem: o,
		openEntity: s,
		onReveal: et,
		revealing: Se,
		revealNote: Oe,
		toast: l
	};
	return /* @__PURE__ */ (0, B.jsx)(Be, { children: /* @__PURE__ */ (0, B.jsxs)("div", {
		className: "flex flex-col gap-5 pb-10",
		children: [
			He ? /* @__PURE__ */ (0, B.jsx)(y, {
				tone: "warning",
				title: "本机只能浏览",
				extra: ee ? /* @__PURE__ */ (0, B.jsx)("p", {
					className: "text-body-2-regular",
					children: /* @__PURE__ */ (0, B.jsx)(h, {
						href: ee,
						children: "前往写入端复核"
					})
				}) : void 0,
				children: tt
			}) : null,
			/* @__PURE__ */ (0, B.jsx)(rt, { tags: nt }),
			/* @__PURE__ */ (0, B.jsxs)("div", {
				className: "flex flex-col gap-5 review-split:flex-row review-split:items-start review-split:gap-6",
				children: [/* @__PURE__ */ (0, B.jsxs)("div", {
					"data-section-nav": !0,
					className: "w-full min-w-0 review-split:sticky review-split:top-topbar review-split:w-review-tabs review-split:shrink-0",
					children: [/* @__PURE__ */ (0, B.jsx)("h2", {
						id: "reviewcategories",
						children: "复核分类"
					}), /* @__PURE__ */ (0, B.jsx)(T, {
						group: "review",
						label: "复核分类",
						value: g,
						onChange: Z,
						orientation: n ? "horizontal" : "vertical",
						panelPrefix: "review",
						sectionItems: !0,
						className: "",
						itemClassName: Ct,
						disabled: Q.isPending || $.isPending,
						tabs: b.map((e) => {
							let t = Number(Le.counts[e] || 0);
							return {
								value: e,
								label: ie[e],
								badge: t ? /* @__PURE__ */ (0, B.jsx)("span", {
									className: "tabular-nums text-caption-1-medium text-text-secondary",
									children: t.toLocaleString()
								}) : null
							};
						})
					})]
				}), /* @__PURE__ */ (0, B.jsxs)("div", {
					role: "tabpanel",
					id: `review-panel-${g}`,
					"aria-labelledby": `review-tab-${g}`,
					className: "flex min-w-0 flex-1 flex-col gap-5",
					children: [
						/* @__PURE__ */ (0, B.jsx)(Ve, {
							queueView: v,
							queueCounts: ze,
							onQueueChange: Ze,
							locked: He,
							fields: Ue,
							fieldFilter: We,
							onFieldFilter: (e) => {
								E(e), w(""), O(1);
							},
							groupOptions: Ge,
							groupBy: U,
							onGroupBy: (e) => {
								S(e), w(""), O(1);
							},
							groups: Ke,
							filter: qe,
							onFilter: (e) => {
								w(e), O(1);
							},
							pageKeys: K,
							selected: j,
							onSelected: M,
							selectedRows: J,
							metadata: V,
							approvable: J.every((e) => se(g, e)),
							busy: $.isPending || Q.isPending,
							feedback: be,
							onUnifySource: $e,
							onRun: Qe
						}),
						G.rows.length ? Ye.map((e) => /* @__PURE__ */ (0, B.jsxs)("section", {
							className: "flex flex-col gap-3",
							children: [Ye.length > 1 || U !== "candidates" ? /* @__PURE__ */ (0, B.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, B.jsx)("h3", {
									className: "text-body-medium text-text-primary",
									children: `${e.title} · ${e.rows.length}`
								}), He ? null : /* @__PURE__ */ (0, B.jsx)(r, {
									variant: "ghost",
									size: "small",
									onClick: () => {
										let t = e.rows.map((e) => e.item_key), n = t.every((e) => j.has(e)), r = new Set(j);
										for (let e of t) n ? r.delete(e) : r.add(e);
										M(r);
									},
									children: e.rows.every((e) => j.has(e.item_key)) ? "清空本组" : "全选本组"
								})]
							}) : null, /* @__PURE__ */ (0, B.jsx)("div", {
								className: "review-grid gap-5",
								children: e.rows.map((e) => /* @__PURE__ */ (0, B.jsx)(St, {
									category: g,
									row: e,
									queueView: v,
									choice: q(e),
									onChoice: (t) => P((n) => new Map(n).set(e.item_key, t)),
									selected: j.has(e.item_key),
									onSelect: (t, n) => M((r) => {
										let i = new Set(r);
										return xe.current = je(i, K, xe.current, e.item_key, t, n), i;
									}),
									locked: He,
									busy: $.isPending || Q.isPending && Q.variables?.row.item_key === e.item_key,
									problem: _e.get(e.item_key) || "",
									genreTags: nt,
									onDecide: (t) => {
										Q.isPending || $.isPending || (F((t) => new Map([...t].filter(([t]) => t !== e.item_key))), Q.mutate({
											row: e,
											status: t,
											category: g
										}));
									},
									handlers: it
								}, e.item_key))
							})]
						}, e.key)) : L.isError && !L.data ? /* @__PURE__ */ (0, B.jsx)(y, {
							tone: "error",
							title: "复核队列读取失败",
							action: /* @__PURE__ */ (0, B.jsx)(r, {
								variant: "secondary",
								size: "small",
								disabled: L.isFetching,
								onClick: () => void L.refetch(),
								children: "立即重试"
							}),
							children: fe(L.error)
						}) : /* @__PURE__ */ (0, B.jsx)(m, {
							icon: ve,
							title: `此分类没有${x[v]}项目`,
							actions: b.some((e) => e !== g && Number(Le.counts[e] || 0) > 0) ? /* @__PURE__ */ (0, B.jsx)(r, {
								size: "small",
								onClick: () => {
									let e = t.find((e) => e !== g && Number(Le.counts[e] || 0) > 0);
									e && Z(e);
								},
								children: "查看其他分类"
							}) : void 0,
							children: v === "pending" ? "可切换分类查看其他待确认资料。" : `${x[v]}的资料会保留在这里，可恢复到待处理。`
						}),
						W.length ? /* @__PURE__ */ (0, B.jsx)(d, {
							label: "复核",
							total: W.length,
							pagination: {
								pageIndex: G.page - 1,
								pageSize: k
							},
							onChange: (e) => {
								O(e.pageIndex + 1), A(e.pageSize);
							}
						}) : null
					]
				})]
			})
		]
	}) });
}
export { wt as ReviewPage };

//# debugId=094cdb74-4042-4e19-a8b9-7e5b6b47aeb8