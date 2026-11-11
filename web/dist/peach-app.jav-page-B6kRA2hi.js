(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "95894fb3-5400-451b-a12e-1d79aa1fbced", e._sentryDebugIdIdentifier = "sentry-dbid-95894fb3-5400-451b-a12e-1d79aa1fbced");
	} catch {}
})();
import { ArtSlot as e, Button as t, ButtonLink as n, DISCOVERY_SORTS as r, E3 as i, EmptyState as a, FilterGlassRows as o, FilterPill as s, GlassPill as c, IndexSearch as l, JAV_LAYOUTS as u, JAV_RECOMMENDATION_GRID as d, JavHeader as f, LibraryShortcuts as p, Note as m, Segments as h, SortKeys as g, SourceAvatar as _, Wt as v, __toESM as y, appSettingsStore as b, avatarInner as x, cardRatio as S, coverArrived as C, coverFetching as w, discoveryArtwork as T, discoveryKey as E, entityDisplayName as D, entityPath as O, errorMessage as k, fetchCoverNow as A, fetchDiscoveries as j, gaugeHtml as M, gridLayout as N, javContentSkeleton as P, javLayout as F, javTagSkeleton as I, relayoutCovers as L, require_jsx_runtime as R, require_react as z, storeJavLayout as B, textLang as V, useAction as H, useEntityNames as U, useQuery as W, wireHorizontalScroller as G, writeJavQuery as K } from "./peach-app.js";
// src/react/jav/discovery-faces.tsx
var q = /* @__PURE__ */ y(z(), 1), J = R();
function Y({ item: e }) {
	U();
	let t = e.performer_refs?.length ? e.performer_refs : [...new Set(e.performers.split(/[,，、;/]/).filter(Boolean))].map((e) => ({ name: e })), n = t.slice(0, 5).map((t, n) => {
		let r = { "--media-avatar-index": n }, i = t.source_avatar && t.source_actor_id && !t.has_image ? { children: /* @__PURE__ */ (0, J.jsx)(_, {
			code: e.code,
			person: t
		}) } : { dangerouslySetInnerHTML: { __html: x(t.name, t, null) } };
		return t.id ? /* @__PURE__ */ (0, J.jsx)("a", {
			"data-media-avatar": "",
			style: r,
			href: O("performer", t.name, t.id),
			"aria-label": `打开女优页：${D("performer", t.name, t.id)}`,
			...i
		}, t.name) : /* @__PURE__ */ (0, J.jsx)("span", {
			"data-media-avatar": "",
			style: r,
			title: D("performer", t.name),
			...i
		}, t.name);
	});
	return t.length > 1 ? /* @__PURE__ */ (0, J.jsx)("div", {
		"data-media-avatars": "",
		style: { "--media-avatar-count": Math.min(5, t.length) },
		children: n
	}) : n[0] || null;
}
// src/react/jav/discovery-card.tsx
var X = "relative inline-grid place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default";
function Z({ item: e, readOnly: n }) {
	let r = H(), [i, a] = (0, q.useState)("");
	if ((0, q.useSyncExternalStore)(w.subscribe, w.revision), w.has(e.code)) return /* @__PURE__ */ (0, J.jsxs)("span", {
		"data-cover-state": "fetching",
		className: "flex max-w-full flex-col items-center gap-1.5 px-4 text-center",
		children: [/* @__PURE__ */ (0, J.jsx)("span", { dangerouslySetInnerHTML: { __html: M("正在取封面", 0, 1, { indeterminate: !0 }) } }), /* @__PURE__ */ (0, J.jsx)("span", {
			"data-media-nopic": "",
			children: "抓取中"
		})]
	});
	let o = () => {
		r.run("cover", (t) => A(e.code, t), (t) => {
			t.has_cover ? C(e.code, t) : a(t.message || "没有找到可用的官方封面");
		});
	}, s = r.error || i;
	return /* @__PURE__ */ (0, J.jsxs)("div", {
		"data-cover-state": "missing",
		className: "flex max-w-full flex-col items-center gap-1.5 px-4 text-center",
		children: [
			/* @__PURE__ */ (0, J.jsx)("span", {
				"data-media-nopic": "",
				children: "无封面"
			}),
			s ? /* @__PURE__ */ (0, J.jsx)("span", {
				className: "line-clamp-3 text-caption-1-regular text-text-secondary",
				title: s,
				children: s
			}) : null,
			n ? null : /* @__PURE__ */ (0, J.jsx)(t, {
				size: "small",
				variant: "secondary",
				className: "mt-1",
				onClick: o,
				children: "立即重试"
			})
		]
	});
}
function Q({ item: t, layout: r, javImage: i, readOnly: a, navigate: o, tag: s, onTag: c }) {
	let l = t.performer_refs?.length ? t.performer_refs.map((e) => e.name).join("、") : t.performers, u = T(t, r, i), d = t.asset_id ? `/assets/${t.asset_id}` : `/works/${encodeURIComponent(t.code)}`;
	return /* @__PURE__ */ (0, J.jsxs)("article", {
		"data-media-card": "",
		"data-jav-card": "",
		onClick: (e) => {
			e.target.closest("a,button,input") || o(d);
		},
		children: [
			u ? /* @__PURE__ */ (0, J.jsx)("a", {
				href: d,
				"aria-label": `查看 ${t.code} 详情`,
				onClick: (e) => {
					e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 || (e.preventDefault(), o(d));
				},
				"data-media-pic": "",
				"data-jav-cover-box": "",
				className: X,
				children: /* @__PURE__ */ (0, J.jsx)(e, {
					artwork: {
						kind: "cover",
						html: u
					},
					identity: T(t, "small", i),
					relayout: (e) => L(e, r)
				})
			}) : /* @__PURE__ */ (0, J.jsx)("div", {
				"data-media-pic": "",
				"data-jav-cover-box": "",
				className: X,
				children: /* @__PURE__ */ (0, J.jsx)(Z, {
					item: t,
					readOnly: a
				})
			}),
			/* @__PURE__ */ (0, J.jsxs)("div", {
				"data-media-meta": "",
				children: [/* @__PURE__ */ (0, J.jsx)(Y, { item: t }), /* @__PURE__ */ (0, J.jsxs)("div", {
					"data-media-text": "",
					children: [
						/* @__PURE__ */ (0, J.jsxs)("h3", {
							"data-jav-title": "",
							"data-media-title": "",
							title: `${t.code} · ${t.title || "标题未取得"}`,
							children: [
								/* @__PURE__ */ (0, J.jsx)("b", { children: t.code }),
								" ",
								t.title ? /* @__PURE__ */ (0, J.jsx)("span", {
									lang: V(t.title),
									children: t.title
								}) : "标题未取得"
							]
						}),
						/* @__PURE__ */ (0, J.jsxs)("div", {
							"data-media-byline": "",
							children: [
								t.performer_refs?.[0]?.id ? /* @__PURE__ */ (0, J.jsxs)("a", {
									"data-media-who": "",
									href: O("performer", t.performer_refs[0].name),
									title: l,
									children: [/* @__PURE__ */ (0, J.jsx)("svg", {
										viewBox: "0 0 24 24",
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, J.jsx)("use", { href: "#i-user-round" })
									}), /* @__PURE__ */ (0, J.jsx)("span", { children: t.performer_refs[0].name })]
								}) : /* @__PURE__ */ (0, J.jsxs)("span", {
									"data-media-who": "",
									title: l,
									children: [/* @__PURE__ */ (0, J.jsx)("svg", {
										viewBox: "0 0 24 24",
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, J.jsx)("use", { href: "#i-user-round" })
									}), /* @__PURE__ */ (0, J.jsx)("span", { children: t.performer_refs?.[0]?.name || l })]
								}),
								(t.performer_refs?.length || 0) > 1 ? /* @__PURE__ */ (0, J.jsxs)("span", {
									"data-media-who-more": "",
									children: [
										"等 ",
										t.performer_refs.length,
										" 人"
									]
								}) : null,
								t.release_date ? /* @__PURE__ */ (0, J.jsx)("span", {
									"data-media-facts": "",
									children: /* @__PURE__ */ (0, J.jsxs)("time", {
										"data-media-release": "",
										dateTime: t.release_date,
										children: [/* @__PURE__ */ (0, J.jsx)("svg", {
											viewBox: "0 0 24 24",
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, J.jsx)("use", { href: "#i-calendar" })
										}), t.release_date]
									})
								}) : null
							]
						}),
						/* @__PURE__ */ (0, J.jsx)("div", {
							"data-jav-tags": "",
							"data-media-tags": "",
							children: (t.tags || []).slice(0, 4).map((e) => /* @__PURE__ */ (0, J.jsx)("button", {
								type: "button",
								"data-media-tag": "",
								"aria-pressed": s === e,
								onClick: () => c(s === e ? "" : e),
								children: e
							}, e))
						})
					]
				})]
			}),
			t.link ? /* @__PURE__ */ (0, J.jsx)("div", {
				"data-jav-actions": "",
				"data-has-source": "",
				className: "flex flex-wrap gap-2",
				children: /* @__PURE__ */ (0, J.jsx)(n, {
					"data-button-link": "",
					"data-jav-source": "",
					variant: "secondary",
					size: "medium",
					"aria-label": "作品来源",
					title: "作品来源",
					trailingIcon: v,
					href: t.link,
					target: "_blank",
					rel: "noopener noreferrer",
					children: "作品来源"
				})
			}) : null
		]
	});
}
// src/react/jav/jav-page.tsx
var $ = "筛选推荐";
function ee({ readOnly: e, navigate: t }) {
	let [n, r] = (0, q.useState)(() => new URLSearchParams(location.search).get("q") || ""), i = (e) => {
		r(e), K({ q: e });
	};
	return /* @__PURE__ */ (0, J.jsxs)("div", {
		className: "flex w-full flex-col gap-6",
		children: [/* @__PURE__ */ (0, J.jsx)(f, { search: /* @__PURE__ */ (0, J.jsx)(l, {
			label: $,
			value: n,
			onQuery: i
		}) }), /* @__PURE__ */ (0, J.jsx)(te, {
			query: n.trim(),
			navigate: t,
			clearText: () => i(""),
			readOnly: e
		})]
	});
}
function te({ query: e, navigate: n, clearText: l, readOnly: f }) {
	let _ = new URLSearchParams(location.search), [v, y] = (0, q.useState)(() => _.get("tag") || ""), [x, C] = (0, q.useState)(() => r.some(([e]) => e === _.get("sort")) ? _.get("sort") : "release_date"), [w, T] = (0, q.useState)(() => _.get("dir") === "asc"), D = (e) => {
		y(e), K({ tag: e });
	}, O = (e) => {
		C(e), K({ sort: e === "release_date" ? "" : e });
	}, A = (e) => {
		T(e), K({ dir: e ? "asc" : "" });
	}, M = (0, q.useRef)(null);
	(0, q.useEffect)(() => {
		let e = [...M.current?.querySelectorAll("[data-catalog-scroll],[data-catalog-tags],[data-filter-row=\"bottom\"]") || []].map((e) => G(e, { drag: !0 }));
		return () => e.forEach((e) => e.destroy());
	}, []);
	let L = b();
	(0, q.useSyncExternalStore)(L.subscribe, L.version, L.version);
	let R = F(), z = S(N({
		active: !0,
		home: !1,
		portrait: !1
	})), V = w ? "asc" : "desc", H = W({
		queryKey: E(x, V),
		retry: !1,
		refetchOnWindowFocus: !1,
		queryFn: ({ signal: e }) => j(e, {
			sort: x,
			direction: V
		})
	}), U = H.data?.items || [], Y = [...new Set(U.flatMap((e) => e.tags || []))], X = U.filter((t) => (!v || t.tags?.includes(v)) && (!e || [
		t.code,
		t.title,
		t.performers,
		t.studio,
		...t.tags || [],
		...(t.performer_refs || []).map((e) => e.name)
	].join(" ").toLocaleLowerCase().includes(e.toLocaleLowerCase()))), Z = H.isPending;
	return /* @__PURE__ */ (0, J.jsxs)("section", {
		ref: M,
		"aria-label": "馆藏探索",
		"aria-busy": Z,
		className: "flex min-w-0 flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, J.jsx)(o, {
				label: "探索筛选与排序",
				topLabel: "标签",
				attrs: {
					"data-filter-frame": "",
					"data-jav-filter": "",
					"data-catalog-frame": ""
				},
				busy: Z,
				topClassName: "gap-1.5 overflow-visible",
				bottomClassName: "min-h-12",
				top: /* @__PURE__ */ (0, J.jsx)("div", {
					"data-catalog-scroll": "",
					children: /* @__PURE__ */ (0, J.jsx)("div", {
						"data-catalog-tags": "",
						dangerouslySetInnerHTML: Z ? { __html: I() } : void 0,
						children: Z ? null : Y.map((e) => /* @__PURE__ */ (0, J.jsxs)(s, {
							"data-catalog-tag": e,
							"data-entity-press": "",
							pressed: v === e,
							onPress: () => D(v === e ? "" : e),
							children: [e, /* @__PURE__ */ (0, J.jsx)("span", {
								"data-count-badge": "",
								children: U.filter((t) => t.tags?.includes(e)).length
							})]
						}, e))
					})
				}),
				bottom: /* @__PURE__ */ (0, J.jsxs)(J.Fragment, { children: [
					/* @__PURE__ */ (0, J.jsx)("span", {
						"data-catalog-readout": "",
						children: Z ? /* @__PURE__ */ (0, J.jsx)("span", {
							"data-skeleton": "count",
							"aria-hidden": !0,
							className: "relative inline-block h-3.5 w-37.5 rounded-md align-middle skeleton-sheen"
						}) : `${X.length} 部`
					}),
					/* @__PURE__ */ (0, J.jsx)(p, { currentHref: () => location.pathname + location.search }),
					e || v ? /* @__PURE__ */ (0, J.jsx)(c, {
						onPress: () => {
							D(""), l();
						},
						children: "清除筛选"
					}) : null,
					/* @__PURE__ */ (0, J.jsxs)("span", {
						"data-entity-sorts": "",
						children: [/* @__PURE__ */ (0, J.jsx)(h, {
							label: "JAV 卡片版式",
							value: R,
							options: u,
							onChange: B
						}), /* @__PURE__ */ (0, J.jsx)(g, {
							sorts: r.map(([e, t, n]) => ({
								key: e,
								label: t,
								ariaLabel: n,
								pressed: e === x,
								dir: V
							})),
							onSort: (e) => {
								e === x ? A(!w) : (O(e), A(e === "code"));
							}
						})]
					})
				] })
			}),
			Z ? /* @__PURE__ */ (0, J.jsx)("div", {
				role: "status",
				"aria-label": "正在读取探索结果",
				dangerouslySetInnerHTML: { __html: P(R) }
			}) : null,
			H.error ? /* @__PURE__ */ (0, J.jsx)(m, {
				tone: "error",
				title: "探索未取得",
				children: k(H.error)
			}) : null,
			!Z && !H.error && !X.length ? /* @__PURE__ */ (0, J.jsx)(a, {
				icon: i,
				title: e || v ? "没有符合条件的作品" : "暂无待探索的作品",
				actions: e || v ? /* @__PURE__ */ (0, J.jsx)(t, {
					variant: "primary",
					size: "small",
					onClick: () => {
						l(), y(""), K({
							q: "",
							tag: ""
						});
					},
					children: "清除筛选"
				}) : null,
				children: e || v ? "清除筛选后查看其他作品。" : "馆藏里还没有看过的作品会出现在这里。"
			}) : null,
			/* @__PURE__ */ (0, J.jsx)("div", {
				"data-media-grid": "",
				className: d,
				style: { "--card-ratio": z },
				children: X.map((e) => /* @__PURE__ */ (0, J.jsx)(Q, {
					item: e,
					layout: R,
					javImage: L.value.javImage,
					readOnly: f,
					navigate: n,
					tag: v,
					onTag: D
				}, e.id))
			})
		]
	});
}
export { ee as JavPage };

//# debugId=95894fb3-5400-451b-a12e-1d79aa1fbced