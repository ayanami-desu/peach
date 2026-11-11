(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "85d619c1-751a-46b3-a452-6f350ec1f382", e._sentryDebugIdIdentifier = "sentry-dbid-85d619c1-751a-46b3-a452-6f350ec1f382");
	} catch {}
})();
import { $2ec61d1d4f780267$export$a8a3e93435678ff9 as e, $76d00c5a4edb230a$export$76ccd210b9029917 as t, $76d00c5a4edb230a$export$816b5d811295e6bc as n, $76d00c5a4edb230a$export$b59bdbef9ce70de2 as r, $76d00c5a4edb230a$export$f6f0c3fe4ec306ea as i, $76d00c5a4edb230a$export$f850895b287ef28e as a, $fe21c36db05242bb$export$d7b12c4107be0d61 as o, ArtSlot as s, Button as c, ButtonLink as l, Bx as u, COVER_STATE_TITLE as d, CatalogViewToggle as f, Checkbox as p, ChevronSortDown as m, Chip as h, CoverQueue as g, DISCOVERY_METADATA_KEY as _, DISCOVERY_REFRESH_MS as v, DISCOVERY_SORTS as y, DataTableFooter as b, DataTableFrame as x, E3 as S, EmptyFocusButton as C, EmptyState as w, FilterGlassRows as ee, FilterIconButton as T, FilterPill as te, GlassPill as ne, Help as re, IndexSearch as ie, Input as E, JAV_LAYOUTS as ae, JAV_RECOMMENDATION_GRID as oe, JAV_SELECTION_EVENT as D, JavHeader as se, LibraryShortcuts as ce, M6 as O, ModalFrame as k, Note as A, P7 as j, PHASES as M, RELEASE_COLUMN_VISIBILITY_KEY as N, RELEASE_COLUMN_WIDTHS_KEY as P, RELEASE_PAGE_SIZES as F, RELEASE_SORTS as le, RELEASE_SORT_COLUMNS as I, SEGMENT as L, SEGMENTED_TRACK as R, SegmentedRadioGroup as z, Segments as ue, SelectionDock as B, Shuffle as de, SortKeys as fe, SourceAvatar as V, Table as H, TableColumnControls as pe, TableColumnResizer as me, TaskProgress as he, WANTS_KEY as ge, WantMagnets as U, Wt as W, __toESM as _e, addWant as ve, appSettingsStore as ye, avatarInner as be, busyProps as G, cachedMagnetStates as xe, cardClass as Se, cardRatio as Ce, catalogListSkeletonCellHtml as we, composingKey as Te, controlDiscoveryMetadata as Ee, controlReleaseMetadata as De, coverArrived as Oe, coverFetching as ke, coverFetchingHtml as Ae, coverStateAction as je, discoveryArtwork as Me, discoveryKey as Ne, discoveryScore as Pe, entityDisplayName as K, entityFaceImg as Fe, entityPath as Ie, errorMessage as Le, esc as Re, facePos as ze, fetchCoverNow as Be, fetchDiscoveries as Ve, fetchDiscoveryMetadata as He, fetchReleases as Ue, fetchWants as We, firstGrapheme as Ge, fmtDur as Ke, gridLayout as qe, invalidateWants as q, javContentSkeleton as Je, javLayout as Ye, javTagSkeleton as Xe, keepPreviousData as Ze, leadingGraphemes as Qe, logoUrl as $e, pageWindow as et, qE as tt, queryClient as J, recommendationScore as nt, relayoutCovers as rt, releaseColumns as it, releaseFilters as at, releaseKey as ot, removeWants as st, require_jsx_runtime as ct, require_react as lt, resetWants as ut, searchNote as dt, selectRange as ft, selectionSummary as pt, spriteGlyph as mt, storeJavLayout as ht, suppressShiftTextSelection as gt, textLang as _t, tierPlaceholdersHtml as vt, useAction as Y, useCatalogView as yt, useEntityNames as bt, useQuery as xt, useTablePreferences as St, wantName as X, wireHorizontalScroller as Ct, writeJavQuery as Z } from "./peach-app.js";
import { ErrorLine as wt } from "./peach-app.source-view-DalWfDkm.js";
// src/react/wants/want-list.tsx
var Q = /* @__PURE__ */ _e(lt(), 1), $ = ct(), Tt = {
	code: "手动添加",
	feed: "订阅新作",
	follow: "关注"
}, Et = [
	["all", "全部"],
	["available", "有磁链"],
	["missing", "没磁链"]
], Dt = (e) => [
	e.release_date,
	e.studio,
	e.performers,
	Tt[e.origin]
].filter(Boolean).join(" · ");
function Ot({ want: e }) {
	return /* @__PURE__ */ (0, $.jsxs)("span", {
		className: "relative inline-grid w-card-cover shrink-0 aspect-card-cover place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default max-sm:w-24",
		children: [/* @__PURE__ */ (0, $.jsx)("span", {
			className: "text-caption-1-regular text-text-secondary",
			children: "无封面"
		}), e.cover ? /* @__PURE__ */ (0, $.jsx)("img", {
			src: e.cover,
			alt: "",
			loading: "lazy",
			referrerPolicy: e.remote_cover ? "no-referrer" : void 0,
			onError: (e) => e.currentTarget.remove(),
			className: "absolute inset-0 size-full object-cover"
		}) : null]
	});
}
function kt({ want: e, readOnly: t, busy: n, onReset: r, onRemove: i, toast: a }) {
	let [o, s] = (0, Q.useState)(""), u = e.link || o || (e.code ? `https://javdb.com/search?q=${encodeURIComponent(e.code)}&f=all` : "");
	return /* @__PURE__ */ (0, $.jsxs)("li", {
		"data-want-id": e.id,
		className: Se({ className: "flex flex-col gap-4 max-sm:p-4" }),
		children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex min-w-0 items-start gap-4 max-sm:gap-3",
			children: [/* @__PURE__ */ (0, $.jsx)(Ot, { want: e }), /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col gap-1",
				children: [
					/* @__PURE__ */ (0, $.jsxs)("p", {
						className: "flex min-w-0 flex-wrap items-baseline gap-x-2",
						children: [/* @__PURE__ */ (0, $.jsx)("b", {
							className: "min-w-0 text-headline-medium wrap-anywhere text-text-primary",
							children: X(e)
						}), e.code && e.title ? /* @__PURE__ */ (0, $.jsx)("span", {
							className: "min-w-0 truncate text-body-2-regular text-text-secondary",
							children: e.title
						}) : null]
					}),
					Dt(e) ? /* @__PURE__ */ (0, $.jsx)("p", {
						className: "text-body-2-regular text-text-secondary",
						children: Dt(e)
					}) : null,
					!e.code || e.phase === "unreleased" || e.phase === "acquired" ? /* @__PURE__ */ (0, $.jsx)("p", {
						"data-want-note": "",
						className: "text-caption-1-regular text-text-secondary",
						children: dt(e)
					}) : null,
					e.scrape_error ? /* @__PURE__ */ (0, $.jsx)(wt, {
						text: e.scrape_error,
						prefix: "资料未取得：",
						tone: "muted"
					}) : null,
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "mt-1 flex flex-wrap items-center gap-2",
						children: [
							u ? /* @__PURE__ */ (0, $.jsx)(l, {
								"data-button-link": "",
								variant: "secondary",
								size: "small",
								trailingIcon: W,
								href: u,
								target: "_blank",
								rel: "noopener noreferrer",
								children: "来源页"
							}) : null,
							/* @__PURE__ */ (0, $.jsx)(c, {
								variant: "secondary",
								size: "small",
								leadingIcon: O,
								disabled: t,
								...G(n === `remove:${e.id}`),
								onClick: i,
								children: "移除"
							}),
							e.phase === "given_up" ? /* @__PURE__ */ (0, $.jsx)(c, {
								variant: "secondary",
								size: "small",
								disabled: t,
								...G(n === `reset:${e.id}`),
								onClick: r,
								children: "重新查找"
							}) : null
						]
					})
				]
			})]
		}), e.code && (e.phase === "searching" || e.phase === "given_up") ? /* @__PURE__ */ (0, $.jsx)(U, {
			want: e,
			toast: a,
			onSource: s
		}) : null]
	});
}
function At({ phase: e, label: t, rows: n, row: r }) {
	let [i, a] = (0, Q.useState)(1), [s, l] = (0, Q.useState)(20), [u, d] = (0, Q.useState)("all"), f = xe(n), p = (e) => e.has_magnets ?? f.get(e.code || "") ?? !1, m = n.filter(p), h = e !== "searching" || u === "all" ? n : n.filter((e) => p(e) === (u === "available")), g = et(h.length, s, i);
	return /* @__PURE__ */ (0, $.jsxs)("section", {
		"aria-label": t,
		"data-want-phase": e,
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, $.jsxs)("h3", {
					className: "flex items-baseline gap-2 text-title-2-medium text-text-primary",
					children: [t, /* @__PURE__ */ (0, $.jsx)("span", {
						className: "text-body-2-regular tabular-nums text-text-secondary",
						children: n.length.toLocaleString()
					})]
				}), e === "searching" ? /* @__PURE__ */ (0, $.jsx)(z, {
					name: "want-magnet-filter",
					"aria-label": "待找磁链筛选",
					orientation: "horizontal",
					value: u,
					className: R,
					onChange: (e) => {
						d(e), a(1);
					},
					children: Et.map(([e, t]) => /* @__PURE__ */ (0, $.jsxs)(o, {
						value: e,
						"aria-label": t,
						className: L,
						children: [t, /* @__PURE__ */ (0, $.jsx)("span", {
							className: "text-caption-1-regular tabular-nums text-text-tertiary",
							children: (e === "all" ? n.length : e === "available" ? m.length : n.length - m.length).toLocaleString()
						})]
					}, e))
				}) : null]
			}),
			h.length ? null : /* @__PURE__ */ (0, $.jsx)(w, {
				size: "compact",
				icon: tt,
				title: "暂无符合条件的作品",
				actions: /* @__PURE__ */ (0, $.jsx)(c, {
					size: "small",
					onClick: () => {
						d("all"), a(1);
					},
					children: "查看全部"
				}),
				children: null
			}),
			/* @__PURE__ */ (0, $.jsx)("ul", {
				className: "flex flex-col gap-4",
				children: h.slice(g.start, g.end).map(r)
			}),
			/* @__PURE__ */ (0, $.jsx)("div", {
				"data-want-pager": "",
				children: /* @__PURE__ */ (0, $.jsx)(b, {
					label: t,
					total: g.total,
					pagination: {
						pageIndex: g.page - 1,
						pageSize: s
					},
					onChange: (e) => {
						l(e.pageSize), a(e.pageIndex + 1);
					},
					unit: "条"
				})
			})
		]
	});
}
function jt({ readOnly: e, toast: t, query: n = "", clearQuery: r }) {
	let [i, a] = (0, Q.useState)(""), o = Y(), s = xt({
		queryKey: ge,
		queryFn: ({ signal: e }) => We(e),
		staleTime: 3e4,
		refetchInterval: (e) => e.state.data?.scraping ? 3e3 : !1
	}), l = () => {
		let n = i.trim();
		n && !e && o.run("add", (e) => ve({ code: n }, e), (e) => {
			t(e.created ? `已加入想要：${X(e.want)}` : `${X(e.want)} 已经在想要里`), a(""), q();
		});
	}, u = (e) => {
		e.key === "Enter" && !Te(e.nativeEvent) && (e.preventDefault(), l());
	}, d = (e) => {
		o.run(`remove:${e.id}`, (t) => st([e.id], t), () => {
			t(`已移除：${X(e)}`), q();
		});
	}, f = (e) => {
		o.run(`reset:${e.id}`, (t) => ut([e.id], t), () => {
			t(`${X(e)} 回到待找`), q();
		});
	}, p = s.data, m = (p?.items || []).filter((e) => !n || [
		e.code,
		e.title,
		e.performers
	].join(" ").toLocaleLowerCase().includes(n.toLocaleLowerCase()));
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		"aria-busy": s.isPending,
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: Se({
					padding: "none",
					className: "flex flex-col gap-4 px-6 py-5 max-sm:px-4"
				}),
				children: [
					/* @__PURE__ */ (0, $.jsx)("h3", {
						className: "text-title-2-medium text-text-primary",
						children: "按番号添加"
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex flex-wrap items-end gap-2",
						children: [/* @__PURE__ */ (0, $.jsx)("div", {
							className: "min-w-64 grow max-sm:min-w-0",
							children: /* @__PURE__ */ (0, $.jsx)(E, {
								"aria-label": "番号",
								placeholder: "输入番号，例如 SSIS-950",
								value: i,
								isDisabled: e,
								onChange: a,
								onKeyDown: u
							})
						}), /* @__PURE__ */ (0, $.jsx)(c, {
							variant: "primary",
							disabled: e || !i.trim(),
							...G(o.busy === "add"),
							onClick: l,
							children: "添加"
						})]
					}),
					o.error ? /* @__PURE__ */ (0, $.jsx)(A, {
						tone: "error",
						title: "这一次没有完成",
						children: o.error
					}) : null
				]
			}),
			s.error ? /* @__PURE__ */ (0, $.jsx)(A, {
				tone: "error",
				title: "想要清单读取失败",
				children: Le(s.error)
			}) : null,
			s.isPending ? /* @__PURE__ */ (0, $.jsx)("div", {
				role: "status",
				"aria-label": "正在读取想要",
				dangerouslySetInnerHTML: { __html: Je("wants") }
			}) : null,
			p?.scraping ? /* @__PURE__ */ (0, $.jsx)(re, {
				role: "status",
				children: "正在给刚加入的番号取资料与封面。"
			}) : null,
			p && !m.length ? /* @__PURE__ */ (0, $.jsx)(w, {
				size: "compact",
				icon: tt,
				title: n ? "没有符合条件的作品" : "还没有想要的作品",
				actions: n && r ? /* @__PURE__ */ (0, $.jsx)(c, {
					size: "small",
					onClick: r,
					children: "清除搜索"
				}) : !n && !e ? /* @__PURE__ */ (0, $.jsx)(C, {
					target: "input[aria-label=\"番号\"]",
					children: "添加作品"
				}) : void 0,
				children: n ? "试试其他番号、女优或标题。" : "输入番号，添加想看的作品。"
			}) : null,
			M.map(([n, r]) => {
				let i = m.filter((e) => e.phase === n);
				return i.length ? /* @__PURE__ */ (0, $.jsx)(At, {
					phase: n,
					label: r,
					rows: i,
					row: (n) => /* @__PURE__ */ (0, $.jsx)(kt, {
						want: n,
						readOnly: e,
						busy: o.busy,
						toast: t,
						onReset: () => f(n),
						onRemove: () => d(n)
					}, n.id)
				}, n) : null;
			})
		]
	});
}
// src/react/jav/jav-batch-resources.tsx
function Mt({ items: t, close: n, receipt: r }) {
	return /* @__PURE__ */ (0, $.jsxs)(k, {
		isOpen: !!t,
		onOpenChange: (e) => {
			e || n();
		},
		width: "collections",
		children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-separator-border bg-background-full px-5 py-4",
			children: [/* @__PURE__ */ (0, $.jsxs)(e, {
				slot: "title",
				className: "text-title-2-medium text-text-primary",
				children: [
					/* @__PURE__ */ (0, $.jsx)("span", {
						"data-copy-key": "jav.resources.title",
						children: "查找所选资源"
					}),
					" · ",
					t?.length || 0,
					" 部"
				]
			}), /* @__PURE__ */ (0, $.jsx)(c, {
				iconOnly: !0,
				variant: "ghost",
				leadingIcon: j,
				"aria-label": "关闭批量资源查找",
				onClick: n
			})]
		}), /* @__PURE__ */ (0, $.jsx)("div", {
			className: "flex min-w-0 flex-col gap-6 p-5",
			children: t?.map((e) => /* @__PURE__ */ (0, $.jsxs)("section", {
				"aria-label": e.code,
				className: "flex min-w-0 flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, $.jsx)("h3", {
						className: "text-headline-medium text-text-primary",
						children: e.code
					}),
					e.title ? /* @__PURE__ */ (0, $.jsx)("p", {
						className: "text-body-2-regular text-text-secondary",
						children: e.title
					}) : null,
					/* @__PURE__ */ (0, $.jsx)(U, {
						want: {
							id: e.id,
							code: e.code,
							title: e.title,
							release_date: e.release_date || null
						},
						queryUrl: `/api/jav/resources?code=${encodeURIComponent(e.code)}`,
						eager: !0,
						toast: r
					})
				]
			}, e.code))
		})]
	});
}
// src/react/jav/jav-selection.tsx
function Nt(e) {
	let t = new MutationObserver(e);
	return t.observe(document.body, {
		attributes: !0,
		attributeFilter: ["data-density"]
	}), () => t.disconnect();
}
var Pt = () => document.body.dataset.density === "dense", Ft = (0, Q.createContext)(null), It = () => (0, Q.useContext)(Ft);
function Lt(e) {
	let t = It()?.visible;
	(0, Q.useEffect)(() => {
		t?.(e);
	}, [e, t]);
}
function Rt({ children: e, readOnly: t, receipt: n }) {
	let r = (0, Q.useSyncExternalStore)(Nt, Pt, () => !1), [i, a] = (0, Q.useState)(!1), [o, s] = (0, Q.useState)(/* @__PURE__ */ new Map()), [l, u] = (0, Q.useState)([]), [d, f] = (0, Q.useState)(null), p = (0, Q.useRef)(null), m = Y(), h = new Set(o.keys()), g = pt(h, l.map((e) => e.code)), _ = (0, Q.useCallback)((e) => {
		u((t) => t.length === e.length && t.every((t, n) => t === e[n]) ? t : e), s((t) => {
			let n = e.filter((e) => t.has(e.code) && t.get(e.code) !== e);
			return n.length ? new Map([...t, ...n.map((e) => [e.code, e])]) : t;
		});
	}, []), v = m.cancel, y = (0, Q.useCallback)(() => {
		v(), a(!1), s(/* @__PURE__ */ new Map()), p.current = null;
	}, [v]), b = () => s((e) => {
		let t = new Map(e);
		return l.forEach((e) => g.all ? t.delete(e.code) : t.set(e.code, e)), t;
	});
	(0, Q.useEffect)(() => {
		let e = () => {
			i ? y() : a(!0);
		};
		return window.addEventListener(D, e), () => window.removeEventListener(D, e);
	}, [i, y]), (0, Q.useEffect)(() => (i || (s(/* @__PURE__ */ new Map()), p.current = null), document.getElementById("selectMode")?.setAttribute("aria-pressed", String(i)), () => document.getElementById("selectMode")?.setAttribute("aria-pressed", "false")), [i]), (0, Q.useEffect)(() => {
		if (!i) return;
		let e = (e) => {
			e.target.closest("input,textarea,[contenteditable]:not([contenteditable=\"false\"]),[role=\"dialog\"]") || (e.key === "Escape" && (e.preventDefault(), y()), (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && (e.preventDefault(), s((e) => new Map([...e, ...l.map((e) => [e.code, e])]))));
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [
		i,
		y,
		l
	]);
	let x = (e, t = !1) => {
		a(!0);
		let n = p.current;
		p.current = e.code, s((r) => {
			let i = new Set(r.keys());
			ft(i, l.map((e) => e.code), n, e.code, t);
			let a = new Map([
				...r,
				...l.map((e) => [e.code, e]),
				[e.code, e]
			]);
			return new Map([...i].map((e) => [e, a.get(e)]));
		});
	}, S = [...o.values()].filter((e) => !e.wanted && !e.asset_id), C = () => {
		m.run("want", async (e) => {
			let t = 0;
			try {
				for (let n of S) {
					e.throwIfAborted();
					try {
						await ve({ code: n.code }, e);
					} catch (e) {
						throw Error(`已加入 ${t} 部；${n.code} 未完成：${Le(e)}`);
					}
					e.throwIfAborted(), t++, s((e) => {
						let t = new Map(e);
						return t.delete(n.code), t;
					});
				}
				return t;
			} finally {
				q();
			}
		}, (e) => n(`已加入想要 ${e} 部`));
	};
	return /* @__PURE__ */ (0, $.jsxs)(Ft.Provider, {
		value: {
			dense: r,
			mode: i,
			selected: h,
			toggle: x,
			visible: _,
			selectPage: b,
			all: g.all,
			mixed: g.mixed
		},
		children: [
			/* @__PURE__ */ (0, $.jsx)("div", {
				"data-jav-selection": "",
				"data-select-mode": i ? "" : void 0,
				className: "flex min-w-0 flex-col gap-4",
				children: e
			}),
			/* @__PURE__ */ (0, $.jsxs)(B, {
				visible: i,
				count: `已选 ${o.size} 部`,
				label: "作品批量操作",
				children: [
					m.error ? /* @__PURE__ */ (0, $.jsx)("p", {
						role: "alert",
						className: "w-full px-2 text-caption-1-regular text-text-error-primary",
						children: m.error
					}) : null,
					/* @__PURE__ */ (0, $.jsx)(c, {
						size: "small",
						variant: "secondary",
						disabled: !l.length || !!m.busy,
						onClick: b,
						children: /* @__PURE__ */ (0, $.jsx)("span", {
							"data-copy-key": `jav.selection.page.${g.all ? "clear" : "all"}`,
							children: g.all ? "取消本页" : "全选本页"
						})
					}),
					/* @__PURE__ */ (0, $.jsx)(c, {
						size: "small",
						variant: "secondary",
						disabled: t || !S.length,
						...G(m.busy === "want"),
						onClick: C,
						children: "加入想要"
					}),
					/* @__PURE__ */ (0, $.jsx)(c, {
						size: "small",
						variant: "secondary",
						disabled: !o.size || !!m.busy,
						onClick: () => f([...o.values()]),
						children: "查找资源"
					}),
					/* @__PURE__ */ (0, $.jsx)(c, {
						size: "small",
						variant: "ghost",
						onClick: y,
						children: "取消选择"
					})
				]
			}),
			/* @__PURE__ */ (0, $.jsx)(Mt, {
				items: d,
				close: () => f(null),
				receipt: n
			})
		]
	});
}
// src/react/jav/discovery-faces.tsx
function zt({ item: e }) {
	bt();
	let t = e.performer_refs?.length ? e.performer_refs : [...new Set(e.performers.split(/[,，、;/]/).filter(Boolean))].map((e) => ({ name: e })), n = t.slice(0, 5).map((t, n) => {
		let r = { "--media-avatar-index": n }, i = t.source_avatar && t.source_actor_id && !t.has_image ? { children: /* @__PURE__ */ (0, $.jsx)(V, {
			code: e.code,
			person: t
		}) } : { dangerouslySetInnerHTML: { __html: be(t.name, t, null) } };
		return t.id ? /* @__PURE__ */ (0, $.jsx)("a", {
			"data-media-avatar": "",
			style: r,
			href: Ie("performer", t.name, t.id),
			"aria-label": `打开女优页：${K("performer", t.name, t.id)}`,
			...i
		}, t.name) : /* @__PURE__ */ (0, $.jsx)("span", {
			"data-media-avatar": "",
			style: r,
			title: K("performer", t.name),
			...i
		}, t.name);
	});
	return t.length > 1 ? /* @__PURE__ */ (0, $.jsx)("div", {
		"data-media-avatars": "",
		style: { "--media-avatar-count": Math.min(5, t.length) },
		children: n
	}) : n[0] || null;
}
// src/react/jav/discovery-card.tsx
var Bt = "relative inline-grid place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default";
function Vt({ item: e, readOnly: t }) {
	let n = Y(), [r, i] = (0, Q.useState)("");
	(0, Q.useSyncExternalStore)(ke.subscribe, ke.revision);
	let a = e.cover_state;
	if (!a) return /* @__PURE__ */ (0, $.jsx)("span", {
		"data-media-nopic": "",
		children: "无封面"
	});
	if (a === "fetching" || ke.has(e.code)) return /* @__PURE__ */ (0, $.jsx)("span", { dangerouslySetInnerHTML: { __html: Ae() } });
	let o = () => {
		n.run("cover", (t) => Be(e.code, t), (t) => {
			t.has_cover ? Oe(e.code, t) : i(t.message || "没有找到可用的官方封面");
		});
	}, s = r || n.error ? "missing" : a, l = n.error || r || e.cover_reason;
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		"data-cover-state": s,
		className: "flex max-w-full flex-col items-center gap-1.5 px-4 text-center",
		children: [
			/* @__PURE__ */ (0, $.jsx)("span", {
				"data-media-nopic": "",
				children: d[s]
			}),
			l ? /* @__PURE__ */ (0, $.jsx)("span", {
				className: "line-clamp-3 text-caption-1-regular text-text-secondary",
				title: l,
				children: l
			}) : null,
			t ? null : /* @__PURE__ */ (0, $.jsx)(c, {
				size: "small",
				variant: "secondary",
				className: "mt-1",
				onClick: o,
				children: je(s)
			})
		]
	});
}
function Ht({ item: e, layout: t, javImage: n, readOnly: r, navigate: i, tag: a, onTag: o, wanting: u, onWant: d, badge: f }) {
	let p = It(), m = p?.selected.has(e.code), h = !!p?.dense, g = e.performer_refs?.length ? e.performer_refs.map((e) => e.name).join("、") : e.performers, _ = Me(e, t, n), v = e.asset_id ? `/assets/${e.asset_id}` : `/works/${encodeURIComponent(e.code)}`;
	return /* @__PURE__ */ (0, $.jsxs)("article", {
		"data-media-card": "",
		"data-jav-card": "",
		"data-selected": m ? "" : void 0,
		onMouseDown: gt,
		onClickCapture: (t) => {
			p && (p.mode || t.shiftKey || t.ctrlKey || t.metaKey) && (t.preventDefault(), t.stopPropagation(), p.toggle(e, t.shiftKey));
		},
		onClick: (e) => {
			e.target.closest("a,button,input") || i(v);
		},
		children: [
			_ ? /* @__PURE__ */ (0, $.jsx)("a", {
				href: v,
				"aria-label": `查看 ${e.code} 详情`,
				onClick: (e) => {
					e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 || (e.preventDefault(), i(v));
				},
				"data-media-pic": "",
				"data-jav-cover-box": "",
				className: Bt,
				children: /* @__PURE__ */ (0, $.jsx)(s, {
					artwork: {
						kind: "cover",
						html: _
					},
					identity: Me(e, "small", n),
					relayout: (e) => rt(e, t)
				})
			}) : /* @__PURE__ */ (0, $.jsx)("div", {
				"data-media-pic": "",
				"data-jav-cover-box": "",
				className: Bt,
				children: /* @__PURE__ */ (0, $.jsx)(Vt, {
					item: e,
					readOnly: r
				})
			}),
			p?.mode ? /* @__PURE__ */ (0, $.jsx)("button", {
				type: "button",
				"data-media-check": "",
				"aria-label": `选择 ${e.code}`,
				"aria-pressed": !!m,
				children: /* @__PURE__ */ (0, $.jsx)("svg", {
					viewBox: "0 0 24 24",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, $.jsx)("use", { href: "#i-check" })
				})
			}) : null,
			/* @__PURE__ */ (0, $.jsxs)("div", {
				"data-media-meta": "",
				children: [/* @__PURE__ */ (0, $.jsx)(zt, { item: e }), /* @__PURE__ */ (0, $.jsxs)("div", {
					"data-media-text": "",
					children: [
						/* @__PURE__ */ (0, $.jsxs)("h3", {
							"data-jav-title": "",
							"data-media-title": "",
							title: `${e.code} · ${e.title || "标题未取得"}`,
							children: [
								/* @__PURE__ */ (0, $.jsx)("b", { children: e.code }),
								" ",
								e.title ? /* @__PURE__ */ (0, $.jsx)("span", {
									lang: _t(e.title),
									children: e.title
								}) : "标题未取得"
							]
						}),
						/* @__PURE__ */ (0, $.jsxs)("div", {
							"data-media-byline": "",
							children: [
								e.performer_refs?.[0]?.id ? /* @__PURE__ */ (0, $.jsxs)("a", {
									"data-media-who": "",
									href: Ie("performer", e.performer_refs[0].name),
									title: g,
									children: [/* @__PURE__ */ (0, $.jsx)("svg", {
										viewBox: "0 0 24 24",
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, $.jsx)("use", { href: "#i-user-round" })
									}), /* @__PURE__ */ (0, $.jsx)("span", { children: e.performer_refs[0].name })]
								}) : /* @__PURE__ */ (0, $.jsxs)("span", {
									"data-media-who": "",
									title: g,
									children: [/* @__PURE__ */ (0, $.jsx)("svg", {
										viewBox: "0 0 24 24",
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, $.jsx)("use", { href: "#i-user-round" })
									}), /* @__PURE__ */ (0, $.jsx)("span", { children: e.performer_refs?.[0]?.name || g })]
								}),
								(e.performer_refs?.length || 0) > 1 ? /* @__PURE__ */ (0, $.jsxs)("span", {
									"data-media-who-more": "",
									children: [
										"等 ",
										e.performer_refs.length,
										" 人"
									]
								}) : null,
								e.release_date ? /* @__PURE__ */ (0, $.jsx)("span", {
									"data-media-facts": "",
									children: /* @__PURE__ */ (0, $.jsxs)("time", {
										"data-media-release": "",
										dateTime: e.release_date,
										children: [/* @__PURE__ */ (0, $.jsx)("svg", {
											viewBox: "0 0 24 24",
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, $.jsx)("use", { href: "#i-calendar" })
										}), e.release_date]
									})
								}) : null
							]
						}),
						/* @__PURE__ */ (0, $.jsxs)("div", {
							"data-jav-tags": "",
							"data-media-tags": "",
							children: [f, (e.tags || []).slice(0, 4).map((e) => /* @__PURE__ */ (0, $.jsx)("button", {
								type: "button",
								"data-media-tag": "",
								"aria-pressed": a === e,
								onClick: () => o(a === e ? "" : e),
								children: e
							}, e))]
						})
					]
				})]
			}),
			p?.mode ? null : /* @__PURE__ */ (0, $.jsxs)("div", {
				"data-jav-actions": "",
				"data-compact": h ? "" : void 0,
				"data-has-source": e.link ? "" : void 0,
				className: "flex flex-wrap gap-2",
				children: [e.link ? /* @__PURE__ */ (0, $.jsx)(l, {
					"data-button-link": "",
					"data-jav-source": "",
					variant: "secondary",
					size: h ? "small" : "medium",
					iconOnly: h,
					"aria-label": "作品来源",
					title: "作品来源",
					leadingIcon: h ? W : void 0,
					trailingIcon: h ? void 0 : W,
					href: e.link,
					target: "_blank",
					rel: "noopener noreferrer",
					children: h ? null : "作品来源"
				}) : null, /* @__PURE__ */ (0, $.jsx)(c, {
					variant: "ghost",
					size: h ? "small" : "medium",
					disabled: r || e.wanted || !!e.asset_id,
					...G(u),
					onClick: d,
					children: e.asset_id ? "已入库" : e.wanted ? "已想要" : "想要"
				})]
			})
		]
	});
}
// src/react/jav/jav-release-table.tsx
var Ut = {
	widths: P,
	visibility: N
};
function Wt({ studio: e }) {
	let [t, n] = (0, Q.useState)(!1);
	return e?.has_logo && !t ? /* @__PURE__ */ (0, $.jsx)("img", {
		"data-list-studio-mark": "",
		src: $e(e.name, "icon", e.logo_version),
		alt: "",
		width: 16,
		height: 16,
		loading: "lazy",
		decoding: "async",
		onError: () => n(!0)
	}) : /* @__PURE__ */ (0, $.jsx)("span", {
		"data-list-studio-mark": "",
		"aria-hidden": "true",
		children: Qe(e?.name || "", 1)
	});
}
function Gt({ items: e, waiting: o, filters: l, studios: u, javImage: f, readOnly: h, navigate: g, onTag: _, onSort: v, wanting: y, onWant: b }) {
	let S = It(), C = St("jav-releases", it, Ut), w = it.filter((e) => e.required || C.visibility[e.id] !== !1), ee = Object.entries(I).find(([, e]) => e === l.sort)?.[0], T = new Map(u.map((e) => [e.name, e])), te = (e) => (t) => {
		t.preventDefault(), S?.mode || t.shiftKey || t.ctrlKey || t.metaKey ? S?.toggle(e, t.shiftKey) : g(`/works/${encodeURIComponent(e.code)}`);
	}, ne = (e, t) => {
		let n = t.performer_refs?.[0]?.name || t.performers.split(/[,，、;/]/)[0] || "";
		switch (e) {
			case "name": {
				let e = Me(t, "small", f);
				return /* @__PURE__ */ (0, $.jsxs)("div", {
					"data-list-identity": "",
					children: [/* @__PURE__ */ (0, $.jsx)("button", {
						type: "button",
						"data-list-open": "",
						tabIndex: -1,
						"aria-hidden": "true",
						onClick: te(t),
						children: /* @__PURE__ */ (0, $.jsx)("span", {
							"data-list-picture": "",
							children: e ? /* @__PURE__ */ (0, $.jsx)(s, {
								artwork: {
									kind: "cover",
									html: e
								},
								relayout: (e) => rt(e, "small")
							}) : /* @__PURE__ */ (0, $.jsx)("span", {
								title: t.cover_reason || void 0,
								children: t.cover_state ? d[t.cover_state] : "无封面"
							})
						})
					}), /* @__PURE__ */ (0, $.jsx)("span", {
						"data-list-text": "",
						children: /* @__PURE__ */ (0, $.jsxs)("button", {
							type: "button",
							"data-list-name": "",
							title: `${t.code} · ${t.title || "标题未取得"}`,
							"aria-label": `查看 ${t.code} 详情`,
							onClick: te(t),
							children: [
								/* @__PURE__ */ (0, $.jsx)("b", { children: t.code }),
								" ",
								t.title ? /* @__PURE__ */ (0, $.jsx)("span", {
									lang: _t(t.title),
									children: t.title
								}) : "标题未取得"
							]
						})
					})]
				});
			}
			case "people": return n ? /* @__PURE__ */ (0, $.jsxs)("div", {
				"data-list-people": "",
				children: [
					/* @__PURE__ */ (0, $.jsx)(zt, { item: t }),
					t.performer_refs?.[0]?.id ? /* @__PURE__ */ (0, $.jsx)("a", {
						"data-media-who": "",
						href: Ie("performer", n),
						children: /* @__PURE__ */ (0, $.jsx)("span", { children: n })
					}) : /* @__PURE__ */ (0, $.jsx)("span", {
						"data-media-who": "",
						children: /* @__PURE__ */ (0, $.jsx)("span", { children: n })
					}),
					(t.performer_refs?.length || 0) > 1 ? /* @__PURE__ */ (0, $.jsxs)("span", {
						"data-media-who-more": "",
						children: [
							"等 ",
							t.performer_refs.length,
							" 人"
						]
					}) : null
				]
			}) : "—";
			case "studio": return t.studio ? /* @__PURE__ */ (0, $.jsxs)("span", {
				"data-list-library": "",
				title: t.studio,
				children: [/* @__PURE__ */ (0, $.jsx)(Wt, { studio: T.get(t.studio) }), /* @__PURE__ */ (0, $.jsx)("span", { children: t.studio })]
			}) : "—";
			case "tags": return t.tags?.length ? /* @__PURE__ */ (0, $.jsx)("div", {
				"data-media-tags": "",
				"data-list-tags": "",
				children: t.tags.map((e) => /* @__PURE__ */ (0, $.jsx)("button", {
					type: "button",
					"data-media-tag": "",
					"aria-pressed": l.tag === e,
					onClick: () => _(l.tag === e ? "" : e),
					children: e
				}, e))
			}) : "—";
			case "code": return t.code;
			case "dur": return Ke(t.duration) || "—";
			case "score": return t.source_score == null ? "—" : `${t.source_score.toFixed(2)} / 5`;
			case "release": return t.release_date || "—";
			default: return /* @__PURE__ */ (0, $.jsx)("div", {
				"data-release-actions": "",
				className: "flex gap-2",
				children: /* @__PURE__ */ (0, $.jsx)(c, {
					size: "small",
					variant: "ghost",
					disabled: h || t.wanted || !!t.asset_id,
					...G(y(t)),
					onClick: () => b(t),
					children: t.wanted ? "已想要" : "想要"
				})
			});
		}
	};
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		"data-catalog-table": "",
		"data-release-table": "",
		className: "flex min-w-0 flex-col gap-4",
		children: [/* @__PURE__ */ (0, $.jsx)("div", {
			className: "flex flex-wrap justify-end gap-2",
			role: "toolbar",
			"aria-label": "新作列表工具栏",
			children: /* @__PURE__ */ (0, $.jsx)("div", {
				"data-toolbar-actions": "",
				children: /* @__PURE__ */ (0, $.jsx)(pe, {
					preferences: C,
					label: "新作列表"
				})
			})
		}), /* @__PURE__ */ (0, $.jsx)(x, {
			follow: !0,
			preferences: C,
			children: /* @__PURE__ */ (0, $.jsxs)(H, {
				"aria-label": "新作列表",
				size: "sm",
				sortDescriptor: ee ? {
					column: ee,
					direction: l.dir === "asc" ? "ascending" : "descending"
				} : void 0,
				onSortChange: (e) => {
					let t = I[String(e.column)];
					t && v(t, e.direction === "ascending" ? "asc" : "desc");
				},
				children: [/* @__PURE__ */ (0, $.jsxs)(a, { children: [
					S?.mode ? /* @__PURE__ */ (0, $.jsx)(n, {
						id: "selection",
						width: 44,
						"aria-label": "选择作品",
						children: /* @__PURE__ */ (0, $.jsx)(p, {
							slot: null,
							"aria-label": "全选本页作品",
							isSelected: S.all,
							isIndeterminate: S.mixed,
							isDisabled: o || !e.length,
							onChange: S.selectPage
						})
					}) : null,
					w.map((e) => /* @__PURE__ */ (0, $.jsx)(n, {
						id: e.id,
						isRowHeader: e.id === "name",
						allowsSorting: e.id in I,
						...C.columnProps(e.id),
						children: ({ sortDirection: t }) => /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsxs)("span", {
							className: "flex items-center gap-0.5",
							children: [e.label, e.id in I ? /* @__PURE__ */ (0, $.jsx)("span", {
								"data-sort-indicator": !0,
								"data-direction": t || void 0,
								children: /* @__PURE__ */ (0, $.jsx)(m, {})
							}) : null]
						}), /* @__PURE__ */ (0, $.jsx)(me, {
							preferences: C,
							id: e.id
						})] })
					}, e.id)),
					/* @__PURE__ */ (0, $.jsx)(n, {
						id: "remaining-space",
						"aria-label": "行空白区域",
						"data-table-space": "",
						width: C.spaceWidth,
						minWidth: 0
					})
				] }), /* @__PURE__ */ (0, $.jsx)(t, {
					renderEmptyState: () => "没有符合条件的新作",
					children: o ? Array.from({ length: 6 }, (e, t) => /* @__PURE__ */ (0, $.jsxs)(r, {
						id: `skeleton-${t}`,
						"data-list-skeleton-row": "",
						"aria-hidden": "true",
						children: [
							S?.mode ? /* @__PURE__ */ (0, $.jsx)(i, {}) : null,
							w.map((e) => /* @__PURE__ */ (0, $.jsx)(i, { children: /* @__PURE__ */ (0, $.jsx)("span", { dangerouslySetInnerHTML: { __html: we(e.id) } }) }, e.id)),
							/* @__PURE__ */ (0, $.jsx)(i, { "data-table-space": "" })
						]
					}, `skeleton-${t}`)) : e.map((e) => /* @__PURE__ */ (0, $.jsxs)(r, {
						id: String(e.id),
						"data-catalog-row": "",
						"data-release-row": "",
						children: [
							S?.mode ? /* @__PURE__ */ (0, $.jsx)(i, { children: /* @__PURE__ */ (0, $.jsx)(p, {
								slot: null,
								"aria-label": `选择 ${e.code}`,
								isSelected: S.selected.has(e.code),
								onChange: () => S.toggle(e)
							}) }) : null,
							w.map((t) => /* @__PURE__ */ (0, $.jsx)(i, { children: ne(t.id, e) }, t.id)),
							/* @__PURE__ */ (0, $.jsx)(i, { "data-table-space": "" })
						]
					}, e.id))
				})]
			})
		})]
	});
}
// src/react/jav/jav-releases.tsx
var Kt = `<div data-catalog-tier="performers" data-skeleton="tiers">${vt("performer")}</div><div data-catalog-tier="studios">${vt("studio")}</div>`, qt = (e) => `<span data-tier-initial>${Re(Ge(K("performer", e.name, e.id)))}</span>${Fe({
	id: e.id,
	hasImage: e.has_image,
	version: e.image_version,
	style: ze(e.avatar_focus),
	focus: e.avatar_focus,
	standIn: e.avatar_stand_in
})}`;
function Jt({ value: e }) {
	let t = nt(e);
	return /* @__PURE__ */ (0, $.jsx)("span", {
		"data-jav-taste-score": "",
		title: `口味 ${t.score}`,
		children: /* @__PURE__ */ (0, $.jsx)(h, {
			color: t.color,
			children: t.label
		})
	});
}
function Yt({ studio: e }) {
	let [t, n] = (0, Q.useState)(!1);
	return /* @__PURE__ */ (0, $.jsx)("span", {
		"data-tier-mark": "",
		children: e.has_logo && !t ? /* @__PURE__ */ (0, $.jsx)("img", {
			src: $e(e.name, "icon", e.logo_version),
			alt: "",
			width: 28,
			height: 28,
			loading: "lazy",
			decoding: "async",
			onError: () => n(!0)
		}) : Qe(e.name, 2)
	});
}
var Xt = (e) => Be(e).then((t) => (t.has_cover && Oe(e, t), t.has_cover));
function Zt({ readOnly: e, receipt: t, query: n, navigate: r, clearText: i }) {
	bt();
	let [a, o] = (0, Q.useState)(() => at(location.search));
	(0, Q.useEffect)(() => {
		n !== a.q && (o((e) => ({
			...e,
			q: n,
			page: 1
		})), Z({ page: "" }));
	}, [n, a.q]);
	let s = (e, t) => {
		let n = a[e] === t ? "" : t;
		o((t) => ({
			...t,
			[e]: n,
			page: 1
		})), Z({
			[e]: n,
			page: ""
		});
	}, d = (0, Q.useRef)(null), p = ({ pageIndex: e, pageSize: t }) => {
		let n = e + 1;
		o((e) => ({
			...e,
			page: n,
			size: t
		})), Z({
			page: n > 1 ? String(n) : "",
			size: t === 24 ? "" : String(t)
		}), d.current?.scrollIntoView({ block: "start" });
	}, m = () => {
		o((e) => ({
			...e,
			performer: "",
			studio: "",
			tag: "",
			q: "",
			page: 1
		})), Z({
			performer: "",
			studio: "",
			tag: "",
			page: ""
		}), i();
	}, h = (e) => y(e, e === a.sort ? a.dir === "asc" ? "desc" : "asc" : e === "code" ? "asc" : "desc"), y = (e, t) => {
		o((n) => ({
			...n,
			sort: e,
			dir: t,
			seed: "",
			page: 1
		})), Z({
			sort: e === "release_date" ? "" : e,
			dir: t === "asc" ? "asc" : "",
			seed: "",
			page: ""
		});
	}, x = () => {
		let e = Math.random().toString(36).slice(2, 10);
		o((t) => ({
			...t,
			sort: "random",
			dir: "desc",
			seed: e,
			page: 1
		})), Z({
			sort: "random",
			dir: "",
			seed: e,
			page: ""
		});
	};
	(0, Q.useEffect)(() => {
		let e = [...d.current?.querySelectorAll("[data-catalog-tier],[data-catalog-tags],[data-filter-row=\"bottom\"]") || []].map((e) => Ct(e, { drag: !0 }));
		return () => e.forEach((e) => e.destroy());
	}, []);
	let S = ye();
	(0, Q.useSyncExternalStore)(S.subscribe, S.version, S.version);
	let C = Ye(), T = yt(), re = Ce(qe({
		active: !0,
		home: !1,
		portrait: !1
	})), ie = (0, Q.useRef)(!1), E = xt({
		queryKey: ot(a),
		queryFn: ({ signal: e }) => Ue(a, e),
		placeholderData: Ze,
		retry: !1,
		refetchOnWindowFocus: !1,
		refetchInterval: () => ie.current ? v : !1
	}), D = E.data?.metadata_job, se = (0, Q.useRef)(!1);
	se.current = D?.status === "running";
	let ce = J.getQueryData(_)?.metadata_job, O = xt({
		queryKey: _,
		retry: !1,
		refetchOnWindowFocus: !1,
		enabled: D?.status === "running" || ce?.status === "running",
		queryFn: ({ signal: e }) => He(e),
		refetchInterval: (e) => e.state.data?.metadata_job?.status === "running" || se.current ? Math.max(1e3, e.state.data?.poll_after_ms || 3e3) : !1
	}), k = O.data && O.dataUpdatedAt >= E.dataUpdatedAt ? O.data.metadata_job : D, j = k?.status === "running";
	ie.current = j;
	let M = (0, Q.useRef)(!1);
	(0, Q.useEffect)(() => {
		M.current && !j && E.refetch(), M.current = j;
	}, [j, E]);
	let N = (0, Q.useRef)(""), P = JSON.stringify([
		a.performer,
		a.studio,
		a.tag,
		a.q,
		a.sort,
		a.dir,
		a.seed
	]), I = !E.isPlaceholderData && (E.data?.metadata_unread || 0) > 0 && !j;
	(0, Q.useEffect)(() => {
		I && N.current !== P && (N.current = P, De("start", a).then(async (e) => {
			await J.cancelQueries({ queryKey: _ }), J.setQueryData(_, e);
		}).catch(() => {}));
	}, [I, P]);
	let L = Y(), R = (e) => {
		L.run(String(e.id), (t) => ve({ code: e.code }, t), () => {
			t("已加入想要"), q(), E.refetch();
		});
	}, z = E.data;
	Lt(z?.items || []);
	let B = E.isPending, V = !!(a.performer || a.studio || a.tag || a.q), H = Math.max(1, Math.ceil((z?.total || 0) / a.size));
	return (0, Q.useEffect)(() => {
		!z || E.isPlaceholderData || a.page <= H || (o((e) => ({
			...e,
			page: H
		})), Z({ page: H > 1 ? String(H) : "" }));
	}, [
		z,
		E.isPlaceholderData,
		a.page,
		H
	]), /* @__PURE__ */ (0, $.jsxs)("section", {
		ref: d,
		"aria-label": "订阅新作",
		"aria-busy": B || E.isFetching,
		className: "flex min-w-0 scroll-mt-24 flex-col gap-4",
		children: [
			B ? /* @__PURE__ */ (0, $.jsx)("div", {
				"data-catalog-tiers": "",
				"aria-busy": "true",
				dangerouslySetInnerHTML: { __html: Kt }
			}) : null,
			z && (z.facets.performers.length || z.facets.studios.length) ? /* @__PURE__ */ (0, $.jsxs)("div", {
				"data-catalog-tiers": "",
				"data-release-tiers": "",
				children: [z.facets.performers.length ? /* @__PURE__ */ (0, $.jsx)("div", {
					"data-catalog-tier": "performers",
					role: "group",
					"aria-label": "按女优筛选",
					children: z.facets.performers.map((e) => /* @__PURE__ */ (0, $.jsxs)("button", {
						type: "button",
						"data-tier-performer": "",
						"aria-pressed": a.performer === e.name,
						title: `${K("performer", e.name, e.id)} · ${e.count} 部`,
						onClick: () => s("performer", e.name),
						children: [/* @__PURE__ */ (0, $.jsx)("span", {
							"data-tier-ring": "",
							dangerouslySetInnerHTML: { __html: qt(e) }
						}), /* @__PURE__ */ (0, $.jsx)("span", {
							"data-tier-name": "",
							children: K("performer", e.name, e.id)
						})]
					}, e.name))
				}) : null, z.facets.studios.length ? /* @__PURE__ */ (0, $.jsx)("div", {
					"data-catalog-tier": "studios",
					role: "group",
					"aria-label": "按厂牌筛选",
					children: z.facets.studios.map((e) => /* @__PURE__ */ (0, $.jsxs)("button", {
						type: "button",
						"data-tier-studio": "",
						"aria-pressed": a.studio === e.name,
						title: `${e.name} · ${e.count} 部`,
						onClick: () => s("studio", e.name),
						children: [
							/* @__PURE__ */ (0, $.jsx)(Yt, { studio: e }),
							e.name,
							/* @__PURE__ */ (0, $.jsx)("span", {
								"data-count-badge": "",
								children: e.count
							})
						]
					}, e.name))
				}) : null]
			}) : null,
			/* @__PURE__ */ (0, $.jsx)(ee, {
				label: "新作筛选",
				topLabel: "新作标签",
				attrs: {
					"data-filter-frame": "",
					"data-jav-filter": "",
					"data-catalog-frame": ""
				},
				busy: B,
				topClassName: "gap-1.5 overflow-visible",
				bottomClassName: "min-h-12",
				top: /* @__PURE__ */ (0, $.jsx)("div", {
					"data-catalog-scroll": "",
					children: /* @__PURE__ */ (0, $.jsx)("div", {
						"data-catalog-tags": "",
						dangerouslySetInnerHTML: B ? { __html: Xe() } : void 0,
						children: B ? null : z?.facets.tags.map((e) => /* @__PURE__ */ (0, $.jsxs)(te, {
							"data-catalog-tag": e.name,
							"data-entity-press": "",
							pressed: a.tag === e.name,
							onPress: () => s("tag", e.name),
							children: [e.name, /* @__PURE__ */ (0, $.jsx)("span", {
								"data-count-badge": "",
								children: e.count
							})]
						}, e.name))
					})
				}),
				bottom: /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
					/* @__PURE__ */ (0, $.jsx)("span", {
						"data-catalog-readout": "",
						children: B ? /* @__PURE__ */ (0, $.jsx)("span", {
							"data-skeleton": "count",
							"aria-hidden": !0,
							className: "relative inline-block h-3.5 w-37.5 rounded-md align-middle skeleton-sheen"
						}) : V ? `${z?.total || 0} / ${z?.candidate_total || 0} 部` : `${z?.total || 0} 部`
					}),
					V ? /* @__PURE__ */ (0, $.jsx)(ne, {
						onPress: m,
						children: "清除筛选"
					}) : null,
					/* @__PURE__ */ (0, $.jsxs)("span", {
						"data-entity-sorts": "",
						children: [
							/* @__PURE__ */ (0, $.jsx)(de, {
								onPress: x,
								busy: a.sort === "random" && E.isFetching
							}),
							T === "cards" ? /* @__PURE__ */ (0, $.jsx)(ue, {
								label: "JAV 卡片版式",
								value: C,
								options: ae,
								onChange: ht
							}) : null,
							/* @__PURE__ */ (0, $.jsx)(f, {}),
							/* @__PURE__ */ (0, $.jsx)(fe, {
								sorts: le.map(([e, t, n]) => ({
									key: e,
									label: t,
									ariaLabel: n,
									pressed: e === a.sort,
									dir: a.dir
								})),
								onSort: (e) => h(e)
							})
						]
					})
				] })
			}),
			B && T === "cards" ? /* @__PURE__ */ (0, $.jsx)("div", {
				role: "status",
				"aria-label": "正在读取新作",
				dangerouslySetInnerHTML: { __html: Je("discover", C) }
			}) : null,
			E.error ? /* @__PURE__ */ (0, $.jsx)(A, {
				tone: "error",
				title: "新作未取得",
				children: Le(E.error)
			}) : null,
			j && k ? /* @__PURE__ */ (0, $.jsx)("div", {
				"data-jav-metadata": "",
				className: "min-w-0",
				children: /* @__PURE__ */ (0, $.jsx)(he, {
					label: `正在读取作品资料 · ${k.completed} / ${k.total} 部`,
					value: k.completed,
					total: k.total
				})
			}) : null,
			e ? null : /* @__PURE__ */ (0, $.jsx)(g, {
				scope: "本页",
				fetchOne: Xt,
				codes: (z?.items || []).filter((e) => e.cover_state === "queued" && !e.cover_url).map((e) => e.code),
				settled: (e, n) => {
					t(e === n ? `已取到 ${n} 部封面` : `已取到 ${e} / ${n} 部封面，没取到的在卡上写了原因`), E.refetch();
				}
			}),
			!B && !E.error && !z?.items.length ? /* @__PURE__ */ (0, $.jsx)(w, {
				icon: u,
				title: V ? "没有符合条件的新作" : "暂无未入库的新作",
				actions: V ? /* @__PURE__ */ (0, $.jsx)(c, {
					size: "small",
					onClick: m,
					children: "清除筛选"
				}) : /* @__PURE__ */ (0, $.jsx)(l, {
					size: "small",
					href: "/subscriptions?tab=add",
					children: "添加订阅"
				}),
				children: V ? "清除筛选后查看全部新作。" : "订阅女优或厂牌后，还没入库的新作会出现在这里。"
			}) : null,
			L.error ? /* @__PURE__ */ (0, $.jsx)(A, {
				tone: "error",
				children: L.error
			}) : null,
			T === "list" ? B || z?.items.length ? /* @__PURE__ */ (0, $.jsx)(Gt, {
				items: z?.items || [],
				waiting: B,
				filters: a,
				studios: z?.facets.studios || [],
				javImage: S.value.javImage,
				readOnly: e,
				navigate: r,
				onTag: (e) => s("tag", e || a.tag),
				onSort: y,
				wanting: (e) => L.busy === String(e.id),
				onWant: R
			}) : null : /* @__PURE__ */ (0, $.jsx)("div", {
				"data-media-grid": "",
				className: oe,
				style: { "--card-ratio": re },
				children: (z?.items || []).map((t) => /* @__PURE__ */ (0, $.jsx)(Ht, {
					item: t,
					layout: C,
					javImage: S.value.javImage,
					readOnly: e,
					navigate: r,
					tag: a.tag,
					onTag: (e) => s("tag", e || a.tag),
					wanting: L.busy === String(t.id),
					onWant: () => R(t),
					badge: a.sort === "taste" ? /* @__PURE__ */ (0, $.jsx)(Jt, { value: t.taste_score }) : void 0
				}, t.id))
			}),
			z ? /* @__PURE__ */ (0, $.jsx)(b, {
				label: "新作",
				total: z.total,
				pagination: {
					pageIndex: a.page - 1,
					pageSize: a.size
				},
				onChange: p,
				unit: "部作品",
				pageUnit: "部",
				pageSizes: F
			}) : null
		]
	});
}
// src/react/jav/jav-page.tsx
var Qt = mt("x"), $t = mt("refresh-cw"), en = {
	releases: "筛选新作",
	discover: "筛选推荐",
	wants: "筛选想要"
};
function tn({ tab: e, readOnly: t, navigate: n, receipt: r }) {
	let [i, a] = (0, Q.useState)(() => new URLSearchParams(location.search).get("q") || ""), o = (e) => {
		a(e), Z({ q: e });
	};
	return /* @__PURE__ */ (0, $.jsx)(Rt, {
		readOnly: t,
		receipt: r,
		children: /* @__PURE__ */ (0, $.jsxs)("div", {
			className: "flex w-full flex-col gap-6",
			children: [/* @__PURE__ */ (0, $.jsx)(se, {
				tab: e,
				navigate: n,
				search: /* @__PURE__ */ (0, $.jsx)(ie, {
					label: en[e] || "筛选",
					value: i,
					onQuery: o
				})
			}), e === "releases" ? /* @__PURE__ */ (0, $.jsx)(Zt, {
				readOnly: t,
				receipt: r,
				query: i.trim(),
				navigate: n,
				clearText: () => o("")
			}) : e === "discover" ? /* @__PURE__ */ (0, $.jsx)(nn, {
				readOnly: t,
				receipt: r,
				query: i.trim(),
				navigate: n,
				clearText: () => o("")
			}) : /* @__PURE__ */ (0, $.jsx)(jt, {
				readOnly: t,
				toast: r,
				query: i.trim(),
				clearQuery: () => o("")
			})]
		})
	}, e);
}
function nn({ readOnly: e, receipt: t, query: n, navigate: r, clearText: i }) {
	let a = new URLSearchParams(location.search), [o, s] = (0, Q.useState)(() => a.get("scope") === "library" ? "library" : "external"), [u, d] = (0, Q.useState)(() => a.get("tag") || ""), [f, p] = (0, Q.useState)(() => y.some(([e]) => e === a.get("sort")) ? a.get("sort") : "taste"), [m, g] = (0, Q.useState)(() => a.get("dir") === "asc"), b = (e) => {
		s(e), Z({ scope: e === "external" ? "" : e });
	}, x = (e) => {
		d(e), Z({ tag: e });
	}, C = (e) => {
		p(e), Z({ sort: e === "taste" ? "" : e });
	}, re = (e) => {
		g(e), Z({ dir: e ? "asc" : "" });
	}, ie = (0, Q.useRef)(null);
	(0, Q.useEffect)(() => {
		let e = [...ie.current?.querySelectorAll("[data-catalog-scroll],[data-catalog-tags],[data-filter-row=\"bottom\"]") || []].map((e) => Ct(e, { drag: !0 }));
		return () => e.forEach((e) => e.destroy());
	}, []);
	let E = ye();
	(0, Q.useSyncExternalStore)(E.subscribe, E.version, E.version);
	let D = Ye(), se = Ce(qe({
		active: !0,
		home: !1,
		portrait: !1
	})), O = m ? "asc" : "desc", k = (0, Q.useRef)(!1), j = xt({
		queryKey: Ne(o, f, O),
		retry: !1,
		refetchOnWindowFocus: !1,
		queryFn: ({ signal: e }) => Ve(o, e, {
			sort: f,
			direction: O
		}),
		refetchInterval: () => k.current ? v : !1
	}), M = j.data?.metadata_job, N = (0, Q.useRef)(!1);
	N.current = M?.status === "running";
	let P = xt({
		queryKey: _,
		retry: !1,
		refetchOnWindowFocus: !1,
		enabled: o === "external",
		queryFn: ({ signal: e }) => He(e),
		refetchInterval: (e) => e.state.data?.metadata_job?.status === "running" || N.current ? Math.max(1e3, e.state.data?.poll_after_ms || 3e3) : !1
	}), F = P.data && P.dataUpdatedAt >= j.dataUpdatedAt ? P.data.metadata_job : M;
	k.current = o === "external" && F?.status === "running";
	let le = (e) => e ? `${e.job_id}:${e.status}` : "", I = (0, Q.useRef)(""), L = (0, Q.useRef)(""), R = P.data?.metadata_job;
	(0, Q.useEffect)(() => {
		let e = le(R), t = L.current.endsWith(":running") && R && R.status !== "running";
		L.current = e, t && e !== I.current && j.refetch();
	}, [le(R)]);
	let z = Y(), B = Y(), de = async (e, t) => {
		let n = await Ee(e, {
			sort: f,
			direction: O,
			jobId: F?.job_id
		}, t);
		e !== "start" && await j.refetch({
			cancelRefetch: !0,
			throwOnError: !0
		}), await J.cancelQueries({ queryKey: _ }), I.current = le(n.metadata_job), J.setQueryData(_, n);
	}, V = (e) => {
		B.run(e, (t) => de(e === "stop" ? "cancel" : "refresh", t), () => {});
	}, H = (0, Q.useRef)(!1), pe = o === "external" && F?.status !== "running" && (j.data?.items || []).some((e) => e.metadata_state === "pending" || e.metadata_state === "stale");
	(0, Q.useEffect)(() => {
		pe && !H.current && (H.current = !0, de("start").catch(() => {}));
	}, [pe]);
	let me = j.data?.items || [], ge = [...new Set(me.flatMap((e) => e.tags || []))], U = me.filter((e) => (!u || e.tags?.includes(u)) && (!n || [
		e.code,
		e.title,
		e.performers,
		e.studio,
		...e.tags || [],
		...(e.performer_refs || []).map((e) => e.name)
	].join(" ").toLocaleLowerCase().includes(n.toLocaleLowerCase()))), W = j.isPending;
	return Lt(U), /* @__PURE__ */ (0, $.jsxs)("section", {
		ref: ie,
		"aria-label": "为你推荐",
		"aria-busy": W,
		className: "flex min-w-0 flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, $.jsx)(ee, {
				label: "发现筛选与排序",
				topLabel: "发现范围与标签",
				attrs: {
					"data-filter-frame": "",
					"data-jav-filter": "",
					"data-catalog-frame": ""
				},
				busy: W,
				topClassName: "gap-1.5 overflow-visible",
				bottomClassName: "min-h-12",
				top: /* @__PURE__ */ (0, $.jsxs)("div", {
					"data-catalog-scroll": "",
					children: [/* @__PURE__ */ (0, $.jsxs)("div", {
						"data-catalog-views": "",
						children: [[["external", "库外发现"], ["library", "馆藏探索"]].map(([e, t]) => /* @__PURE__ */ (0, $.jsx)(te, {
							"data-entity-tag": e,
							"data-entity-press": "",
							pressed: o === e,
							onPress: () => {
								b(e), x("");
							},
							children: t
						}, e)), /* @__PURE__ */ (0, $.jsx)("span", {
							"data-entity-sep": "",
							"aria-hidden": "true"
						})]
					}), /* @__PURE__ */ (0, $.jsx)("div", {
						"data-catalog-tags": "",
						dangerouslySetInnerHTML: W ? { __html: Xe() } : void 0,
						children: W ? null : ge.map((e) => /* @__PURE__ */ (0, $.jsxs)(te, {
							"data-catalog-tag": e,
							"data-entity-press": "",
							pressed: u === e,
							onPress: () => x(u === e ? "" : e),
							children: [e, /* @__PURE__ */ (0, $.jsx)("span", {
								"data-count-badge": "",
								children: me.filter((t) => t.tags?.includes(e)).length
							})]
						}, e))
					})]
				}),
				bottom: /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
					/* @__PURE__ */ (0, $.jsx)("span", {
						"data-catalog-readout": "",
						children: W ? /* @__PURE__ */ (0, $.jsx)("span", {
							"data-skeleton": "count",
							"aria-hidden": !0,
							className: "relative inline-block h-3.5 w-37.5 rounded-md align-middle skeleton-sheen"
						}) : `${U.length} 部`
					}),
					/* @__PURE__ */ (0, $.jsx)(ce, { currentHref: () => location.pathname + location.search }),
					n || u ? /* @__PURE__ */ (0, $.jsx)(ne, {
						onPress: () => {
							x(""), i();
						},
						children: "清除筛选"
					}) : null,
					/* @__PURE__ */ (0, $.jsxs)("span", {
						"data-entity-sorts": "",
						children: [
							o === "external" ? /* @__PURE__ */ (0, $.jsx)(T, {
								"data-entity-batch": "",
								"data-jav-metadata-update": "",
								label: F?.status === "running" ? "停止读取" : "更新资料",
								disabled: W,
								"data-skeleton-action": W ? "" : void 0,
								busy: !!B.busy,
								icon: F?.status === "running" ? Qt : $t,
								onPress: () => V(F?.status === "running" ? "stop" : "update")
							}) : null,
							/* @__PURE__ */ (0, $.jsx)(ue, {
								label: "JAV 卡片版式",
								value: D,
								options: ae,
								onChange: ht
							}),
							/* @__PURE__ */ (0, $.jsx)(fe, {
								sorts: y.map(([e, t, n]) => ({
									key: e,
									label: t,
									ariaLabel: n,
									pressed: e === f,
									dir: O
								})),
								onSort: (e) => {
									e === f ? re(!m) : (C(e), re(e === "code"));
								}
							})
						]
					})
				] })
			}),
			W ? /* @__PURE__ */ (0, $.jsx)("div", {
				role: "status",
				"aria-label": "正在读取推荐",
				dangerouslySetInnerHTML: { __html: Je("discover", D) }
			}) : null,
			j.error ? /* @__PURE__ */ (0, $.jsx)(A, {
				tone: "error",
				title: "推荐未取得",
				children: Le(j.error)
			}) : null,
			o === "external" && F?.status === "running" ? /* @__PURE__ */ (0, $.jsx)("div", {
				"data-jav-metadata": "",
				className: "min-w-0",
				children: /* @__PURE__ */ (0, $.jsx)(he, {
					label: `正在读取作品资料 · ${F.completed} / ${F.total} 部`,
					value: F.completed,
					total: F.total
				})
			}) : null,
			F && F.status !== "running" && (F.status !== "complete" || F.failed > 0) ? /* @__PURE__ */ (0, $.jsx)(A, {
				tone: "neutral",
				action: /* @__PURE__ */ (0, $.jsx)(c, {
					variant: "secondary",
					...G(B.busy === "retry"),
					"aria-label": "立即重试读取作品资料",
					onClick: () => V("retry"),
					children: "立即重试"
				}),
				children: F.message || `作品资料 ${F.completed} / ${F.total} 部`
			}) : null,
			B.error ? /* @__PURE__ */ (0, $.jsx)(A, {
				tone: "error",
				children: B.error
			}) : null,
			!W && !j.error && !U.length ? /* @__PURE__ */ (0, $.jsx)(w, {
				icon: S,
				title: n || u ? "没有符合条件的推荐" : "暂无推荐的作品",
				actions: /* @__PURE__ */ (0, $.jsx)($.Fragment, { children: n || u ? /* @__PURE__ */ (0, $.jsx)(c, {
					variant: "primary",
					size: "small",
					onClick: () => {
						i(), d(""), Z({
							q: "",
							tag: ""
						});
					},
					children: "清除筛选"
				}) : o === "library" ? /* @__PURE__ */ (0, $.jsx)(l, {
					variant: "primary",
					size: "small",
					href: "/",
					children: "浏览馆藏"
				}) : null }),
				children: n || u ? "清除筛选后查看其他作品。" : o === "library" ? "观看或标记作品后，这里会按你的记录推荐。" : "可以查找番号，或更新关注来源。"
			}) : null,
			z.error ? /* @__PURE__ */ (0, $.jsx)(A, {
				tone: "error",
				children: z.error
			}) : null,
			/* @__PURE__ */ (0, $.jsx)("div", {
				"data-media-grid": "",
				className: oe,
				style: { "--card-ratio": se },
				children: U.map((n) => {
					let i = nt(n.taste_score ?? n.score), a = [
						i.label,
						`口味 ${Pe(n.taste_score ?? n.score)}`,
						j.data?.ranking_method === "mmr" && n.ranking_score != null ? `排序 ${Pe(n.ranking_score)}` : "",
						n.source_score == null ? "" : `来源评分 ${n.source_score.toFixed(1)} / 5`,
						...n.reasons || []
					].filter(Boolean).join(" · ");
					return /* @__PURE__ */ (0, $.jsx)(Ht, {
						item: n,
						layout: D,
						javImage: E.value.javImage,
						readOnly: e,
						navigate: r,
						tag: u,
						onTag: x,
						wanting: z.busy === String(n.id),
						onWant: () => {
							z.run(String(n.id), (e) => ve({ code: n.code }, e), () => {
								t("已加入想要"), q(), j.refetch();
							});
						},
						badge: /* @__PURE__ */ (0, $.jsx)("button", {
							"data-jav-taste-score": "",
							type: "button",
							title: a,
							"aria-label": `推荐分 ${i.score}，${i.label}`,
							className: "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
							children: /* @__PURE__ */ (0, $.jsx)(h, {
								color: i.color,
								children: i.label
							})
						})
					}, n.id);
				})
			})
		]
	});
}
export { tn as JavPage };

//# debugId=85d619c1-751a-46b3-a452-6f350ec1f382