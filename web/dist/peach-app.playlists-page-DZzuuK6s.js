(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "8196d254-bf9b-44eb-91c3-7e251e33e6d3", e._sentryDebugIdIdentifier = "sentry-dbid-8196d254-bf9b-44eb-91c3-7e251e33e6d3");
	} catch {}
})();
import { $2ec61d1d4f780267$export$a8a3e93435678ff9 as e, $542a13ca2fa5b484$export$5b6b19405a83ff9d as t, Button as n, EmptyFocusButton as r, EmptyState as i, Input as a, MENU_ITEM as o, MENU_ITEM_INTERACTIVE as s, MENU_POPOVER_SURFACE as c, MenuDialog as l, ModalFrame as u, ObjectOrderDialog as d, PLAYLISTS_KEY as f, RetryNote as p, __toESM as m, avatarInner as h, busyProps as g, confirmModal as _, createPlaylist as v, cx as y, deletePlaylist as b, errorMessage as x, fetchPlaylist as S, fetchPlaylists as C, firstGrapheme as w, keepPlaylist as T, posterUrl as E, recreatePlaylist as D, refreshPlaylists as O, renamePlaylist as k, reorderPlaylist as A, representativeOf as j, require_jsx_runtime as ee, require_react as te, resumeAssetId as ne, spriteGlyph as M, useMutation as N, useQuery as P } from "./peach-app.js";
// src/react/components/use-stack-flip.ts
var F = /* @__PURE__ */ m(te(), 1), I = 1100, L = 340, R = 5e3;
function z(e, t, n) {
	return new Promise((r) => {
		let i = new Image();
		n && (i.referrerPolicy = n);
		let a = !1, o = (e) => {
			a || (a = !0, clearTimeout(c), i.onload = null, i.onerror = null, t.cancels.delete(s), r(e));
		}, s = () => o(!1), c = setTimeout(s, R);
		t.cancels.add(s), i.onerror = s, i.onload = () => {
			i.naturalWidth ? typeof i.decode == "function" ? i.decode().then(() => o(!0), s) : o(!0) : o(!1);
		}, i.src = e;
	});
}
function B({ load: e, canFlip: t, referrerPolicy: n }) {
	let [r, i] = (0, F.useState)([]), [a, o] = (0, F.useState)(0), [s, c] = (0, F.useState)(null), l = (0, F.useRef)({
		live: !1,
		generation: 0,
		timers: /* @__PURE__ */ new Set(),
		cycle: null,
		cancels: /* @__PURE__ */ new Set(),
		armed: null,
		count: 0,
		at: 0
	}), u = (0, F.useRef)({
		load: e,
		canFlip: t
	});
	u.current = {
		load: e,
		canFlip: t
	};
	let d = (0, F.useCallback)(() => {
		let e = l.current;
		e.live = !1, e.generation += 1, e.timers.forEach(clearTimeout), e.timers.clear(), e.armed = null, e.cycle !== null && clearInterval(e.cycle), e.cycle = null, e.cancels.forEach((e) => e()), e.count = 0, e.at = 0;
	}, []), f = (e, t) => {
		let n = setTimeout(() => {
			l.current.timers.delete(n), t();
		}, e);
		return l.current.timers.add(n), n;
	}, p = () => {
		let e = l.current;
		if (!e.live || e.count < 2) return;
		let t = e.at;
		e.at = (t + 1) % e.count, c(t), o(e.at), f(980, () => c((e) => e === t ? null : e));
	}, m = async () => {
		let e = l.current;
		if (e.live || !u.current.canFlip()) return;
		e.live = !0;
		let t = ++e.generation, r = () => e.live && t === e.generation, a = [];
		try {
			a = (await u.current.load()).slice(0, 9);
		} catch {
			return;
		}
		if (!r() || !u.current.canFlip() || a.length < 2) return;
		let s = await Promise.all(a.map((t) => z(t, e, n)));
		if (!r() || !u.current.canFlip()) return;
		let d = a.filter((e, t) => s[t]);
		d.length < 2 || (e.count = d.length, e.at = 0, i(d), o(0), c(null), f(420, () => {
			p(), e.cycle = setInterval(p, I);
		}));
	};
	return (0, F.useEffect)(() => d, [d]), {
		faces: r,
		current: a,
		leaving: s,
		onPointerEnter: () => {
			let e = l.current;
			e.armed !== null && (clearTimeout(e.armed), e.timers.delete(e.armed)), e.armed = f(L, () => {
				e.armed = null, m();
			});
		},
		onPointerLeave: () => {
			d(), i([]), o(0), c(null);
		}
	};
}
// src/react/components/playlist-card.tsx
var V = ee(), H = M("play");
function U({ src: e }) {
	let [t, n] = (0, F.useState)(!1);
	return t ? null : /* @__PURE__ */ (0, V.jsx)("img", {
		"data-playlist-poster": "",
		src: e,
		width: 640,
		height: 360,
		alt: "",
		loading: "lazy",
		onError: () => n(!0),
		className: "absolute inset-0 block size-full object-contain"
	});
}
var W = "relative inline-grid size-9.5 flex-none place-items-center overflow-hidden rounded-full bg-background-secondary-default text-body-2-regular text-text-secondary [&_img]:absolute [&_img]:inset-0 [&_img]:block [&_img]:size-full [&_img]:object-cover";
function G({ faces: e, fallback: t, onOpenEntity: n }) {
	return e.length ? /* @__PURE__ */ (0, V.jsx)("div", {
		"data-playlist-avatars": "",
		children: e.slice(0, 5).map((e) => /* @__PURE__ */ (0, V.jsx)("button", {
			type: "button",
			title: `打开资料页：${e.name}`,
			"aria-label": `打开资料页：${e.name}`,
			onClick: () => n(e.kind, e.name),
			className: `${W} cursor-pointer outline-none`,
			dangerouslySetInnerHTML: { __html: h(e.name, e, j(e.name), e.kind) }
		}, `${e.kind}:${e.id}`))
	}) : /* @__PURE__ */ (0, V.jsx)("span", {
		"data-playlist-initial": "",
		"aria-hidden": !0,
		className: `${W} mt-0.5`,
		children: t
	});
}
function K({ name: e, count: t, poster: n, flipImages: r, canFlip: i, faces: a, onOpenEntity: o, onOpen: s, openLabel: c, menu: l, ...u }) {
	let d = B({
		load: r,
		canFlip: i
	}), f = (0, F.useRef)(d.onPointerLeave);
	f.current = d.onPointerLeave;
	let p = (0, F.useRef)(null), m = (0, F.useCallback)((e) => {
		p.current = e, e && (e._stopHover = () => f.current());
	}, []), h = s ? () => {
		p.current && s(p.current);
	} : void 0;
	return /* @__PURE__ */ (0, V.jsxs)("article", {
		...u,
		ref: m,
		onMouseEnter: d.onPointerEnter,
		onMouseLeave: d.onPointerLeave,
		className: "relative flex min-w-0 cursor-pointer flex-col gap-2",
		children: [/* @__PURE__ */ (0, V.jsx)("div", {
			"data-playlist-stack": "",
			className: "relative isolate rounded-surface",
			children: /* @__PURE__ */ (0, V.jsxs)("div", {
				"data-playlist-cover": "",
				className: "relative z-1 flex aspect-video items-center justify-center overflow-hidden",
				children: [
					n ? /* @__PURE__ */ (0, V.jsx)(U, { src: n }, n) : /* @__PURE__ */ (0, V.jsx)("span", {
						className: "text-caption-1-regular tracking-caps text-text-secondary uppercase",
						children: "无预览"
					}),
					/* @__PURE__ */ (0, V.jsx)("div", {
						"data-playlist-faces": "",
						hidden: !d.faces.length,
						children: d.faces.map((e, t) => /* @__PURE__ */ (0, V.jsx)("div", {
							"data-playlist-face": t === d.current ? "on" : t === d.leaving ? "off" : "",
							children: /* @__PURE__ */ (0, V.jsx)("img", {
								src: e,
								alt: "",
								loading: "eager"
							})
						}, e))
					}),
					/* @__PURE__ */ (0, V.jsx)("button", {
						type: "button",
						"data-playlist-open": "",
						"aria-label": c,
						disabled: !s,
						onClick: h,
						className: "absolute inset-0 z-1 cursor-pointer rounded-surface outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus-ring disabled:cursor-default"
					}),
					/* @__PURE__ */ (0, V.jsxs)("span", {
						"data-playlist-badge": "",
						className: "absolute right-2.25 bottom-2.25 z-6 flex min-h-7 items-center gap-1.5 rounded-2lg px-2.25 py-1 text-caption-1-semibold text-text-white",
						children: [/* @__PURE__ */ (0, V.jsx)(H, {
							"aria-hidden": !0,
							className: "size-(--icon-inline)"
						}), `${t.toLocaleString()} 个视频`]
					})
				]
			})
		}), /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "flex min-w-0 items-start gap-2.25",
			children: [
				/* @__PURE__ */ (0, V.jsx)(G, {
					faces: a,
					fallback: w(e),
					onOpenEntity: o
				}),
				/* @__PURE__ */ (0, V.jsx)("div", {
					className: "flex min-w-0 flex-1 flex-col",
					children: /* @__PURE__ */ (0, V.jsx)("b", {
						"data-playlist-title": "",
						className: "truncate text-body-bold text-text-primary",
						children: e
					})
				}),
				l
			]
		})]
	});
}
// src/react/playlists/playlists-page.tsx
var q = M("ellipsis"), J = M("pencil"), Y = M("trash"), X = M("playlist"), Z = y(o, s, "text-body-2-medium"), Q = "播放列表名称不能为空", $ = (e) => async () => {
	try {
		await e();
	} finally {
		O();
	}
};
function re({ toast: e }) {
	let [t, r] = (0, F.useState)(""), [i, o] = (0, F.useState)(""), s = N({
		mutationFn: (e) => v(e),
		onSuccess: (t) => {
			r(""), o(""), O(), e("已新建播放列表", { undo: $(() => b(t.playlist.id)) });
		},
		onError: (e) => o(x(e) || "新建失败")
	});
	return /* @__PURE__ */ (0, V.jsxs)("form", {
		"data-playlist-create": "",
		"aria-label": "新建播放列表",
		onSubmit: (e) => {
			e.preventDefault(), s.isPending || (t.trim() ? s.mutate(t) : o(Q));
		},
		className: "flex flex-wrap items-end gap-2",
		children: [/* @__PURE__ */ (0, V.jsx)("div", {
			className: "min-w-50 max-w-80 flex-1 basis-50 max-board-narrow:min-w-0 max-board-narrow:max-w-none",
			children: /* @__PURE__ */ (0, V.jsx)(a, {
				label: "新播放列表",
				placeholder: "输入名称",
				maxLength: 80,
				value: t,
				onChange: (e) => {
					r(e), o("");
				},
				validationBehavior: "aria",
				isInvalid: !!i,
				hint: i || void 0
			})
		}), /* @__PURE__ */ (0, V.jsx)(n, {
			type: "submit",
			...g(s.isPending),
			children: "新建"
		})]
	});
}
function ie({ target: t, close: r, toast: i }) {
	let [o, s] = (0, F.useState)(""), [c, l] = (0, F.useState)(""), d = (0, F.useRef)(null);
	(0, F.useEffect)(() => {
		if (!t) return;
		s(t.name), l("");
		let e = requestAnimationFrame(() => {
			d.current?.focus(), d.current?.select();
		});
		return () => cancelAnimationFrame(e);
	}, [t]);
	let f = N({
		mutationFn: ({ row: e, value: t }) => k(e.id, t),
		onSuccess: (e, { row: t }) => {
			r(), O(), i("已重命名播放列表", { undo: $(() => k(t.id, t.name)) });
		},
		onError: (e) => l(x(e))
	});
	return /* @__PURE__ */ (0, V.jsx)(u, {
		isOpen: !!t,
		onOpenChange: (e) => {
			e || r();
		},
		width: "form",
		children: /* @__PURE__ */ (0, V.jsxs)("form", {
			"data-playlist-rename": "",
			onSubmit: (e) => {
				if (e.preventDefault(), !t || f.isPending) return;
				let n = o.trim();
				n ? f.mutate({
					row: t,
					value: n
				}) : l(Q);
			},
			className: "flex min-h-0 flex-col",
			children: [/* @__PURE__ */ (0, V.jsxs)("div", {
				className: "flex flex-col gap-4 p-5",
				children: [/* @__PURE__ */ (0, V.jsx)(e, {
					slot: "title",
					className: "text-title-2-semibold text-text-primary",
					children: "编辑名称"
				}), /* @__PURE__ */ (0, V.jsx)(a, {
					ref: d,
					label: "名称",
					placeholder: "输入名称",
					maxLength: 80,
					value: o,
					onChange: (e) => {
						s(e), l("");
					},
					validationBehavior: "aria",
					isInvalid: !!c,
					hint: c || void 0
				})]
			}), /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "flex justify-between gap-4 p-3",
				children: [/* @__PURE__ */ (0, V.jsx)(n, {
					variant: "secondary",
					onClick: r,
					children: "取消"
				}), /* @__PURE__ */ (0, V.jsx)(n, {
					type: "submit",
					...g(f.isPending),
					children: "保存名称"
				})]
			})]
		})
	});
}
function ae({ name: e, onRename: n, onDelete: r, onSort: i }) {
	let a = (0, F.useRef)(null), [o, s] = (0, F.useState)(!1), u = (e) => {
		s(!1), e();
	};
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)("button", {
		ref: a,
		type: "button",
		title: "更多操作",
		"aria-label": `播放列表操作：${e}`,
		"aria-haspopup": "dialog",
		"aria-expanded": o,
		"data-playlist-menu": "",
		onClick: () => s(!0),
		className: "flex size-7.5 flex-none cursor-pointer items-center justify-center rounded-2lg text-foreground-icon-secondary outline-none transition-colors hover:bg-background-primary-hover hover:text-foreground-icon-primary aria-expanded:bg-background-primary-hover aria-expanded:text-foreground-icon-primary focus-visible:ring-2 focus-visible:ring-border-focus-ring",
		children: /* @__PURE__ */ (0, V.jsx)(q, {
			"aria-hidden": !0,
			className: "size-4.5"
		})
	}), /* @__PURE__ */ (0, V.jsx)(t, {
		triggerRef: a,
		isOpen: o,
		onOpenChange: s,
		placement: "bottom end",
		offset: 4,
		className: c,
		children: /* @__PURE__ */ (0, V.jsxs)(l, {
			"aria-label": `播放列表操作：${e}`,
			className: "flex w-37.5 flex-col gap-0.5 outline-none",
			children: [
				/* @__PURE__ */ (0, V.jsxs)("button", {
					type: "button",
					className: Z,
					onClick: () => u(n),
					children: [/* @__PURE__ */ (0, V.jsx)(J, {
						"aria-hidden": !0,
						className: "size-(--icon-inline) shrink-0"
					}), "编辑名称"]
				}),
				/* @__PURE__ */ (0, V.jsxs)("button", {
					type: "button",
					className: Z,
					onClick: () => u(i),
					children: [/* @__PURE__ */ (0, V.jsx)(X, {
						"aria-hidden": !0,
						className: "size-(--icon-inline) shrink-0"
					}), "调整播放顺序"]
				}),
				/* @__PURE__ */ (0, V.jsxs)("button", {
					type: "button",
					className: Z,
					onClick: () => u(r),
					children: [/* @__PURE__ */ (0, V.jsx)(Y, {
						"aria-hidden": !0,
						className: "size-(--icon-inline) shrink-0"
					}), "删除播放列表"]
				})
			]
		})
	})] });
}
function oe({ openPlaylist: e, openEntity: t, canFlip: n, toast: a, revision: o }) {
	let s = P({
		queryKey: f,
		queryFn: ({ signal: e }) => C(e)
	}), [c, l] = (0, F.useState)(null), [u, d] = (0, F.useState)(null), m = (0, F.useRef)(o);
	(0, F.useEffect)(() => {
		m.current !== o && (m.current = o, O());
	}, [o]);
	let h = s.data, g = h?.items ?? [], v = (e) => {
		_({
			title: "删除播放列表",
			body: "这个播放列表将被删除，视频文件保留。",
			confirmLabel: "删除播放列表",
			danger: !0,
			onConfirm: async () => {
				let t = await T(e.id);
				await b(e.id), O(), a("已删除播放列表", t ? { undo: $(() => D(t)) } : void 0);
			}
		});
	};
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "w-full pt-1 pb-10.5",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("header", {
				className: "mb-4 flex items-start justify-between gap-4.5 max-board-narrow:flex-col max-board-narrow:items-stretch",
				children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h2", {
					className: "mb-1 text-display-4-medium! text-text-primary",
					children: "播放列表"
				}), /* @__PURE__ */ (0, V.jsx)("p", {
					className: "text-body-2-regular text-text-secondary",
					children: "按自己的顺序继续播放。"
				})] }), /* @__PURE__ */ (0, V.jsx)(re, { toast: a })]
			}),
			/* @__PURE__ */ (0, V.jsx)("div", {
				className: "mx-auto w-full max-w-board",
				children: h ? g.length ? /* @__PURE__ */ (0, V.jsx)("div", {
					"data-playlist-grid": "",
					className: "card-grid-cover gap-4.5",
					children: g.map((r) => {
						let i = ne(r), a = r.name.trim() || "未命名播放列表";
						return /* @__PURE__ */ (0, V.jsx)(K, {
							"data-playlist-card": String(r.id),
							name: a,
							count: r.item_count,
							poster: r.preview_asset_id ? E(r.preview_asset_id) : null,
							flipImages: async () => (r.preview_ids || []).map(E),
							canFlip: n,
							faces: r.faces || [],
							onOpenEntity: t,
							...i ? { onOpen: () => e(r.id, i) } : {},
							openLabel: `打开播放列表 ${a}`,
							menu: /* @__PURE__ */ (0, V.jsx)(ae, {
								name: a,
								onRename: () => l(r),
								onDelete: () => v(r),
								onSort: () => d(r)
							})
						}, r.id);
					})
				}) : /* @__PURE__ */ (0, V.jsx)(i, {
					icon: X,
					title: "还没有播放列表",
					actions: /* @__PURE__ */ (0, V.jsx)(r, {
						target: "[data-playlist-create] input",
						children: "新建播放列表"
					}),
					children: "新建列表后，会在这里按自己的顺序继续播放。"
				}) : s.isError ? /* @__PURE__ */ (0, V.jsx)(p, {
					message: x(s.error) || "播放列表读取失败",
					onRetry: () => void s.refetch()
				}) : null
			}),
			/* @__PURE__ */ (0, V.jsx)(ie, {
				target: c,
				close: () => l(null),
				toast: a
			}),
			u ? /* @__PURE__ */ (0, V.jsx)(se, {
				row: u,
				close: () => d(null),
				toast: a
			}, u.id) : null
		]
	});
}
function se({ row: e, close: t, toast: r }) {
	let i = P({
		queryKey: ["playlist-order", e.id],
		queryFn: ({ signal: t }) => S(e.id, t),
		staleTime: 0,
		refetchOnWindowFocus: !1,
		refetchOnReconnect: !1
	}), a = i.data;
	return !a || i.isFetching ? /* @__PURE__ */ (0, V.jsx)(u, {
		isOpen: !0,
		onOpenChange: (e) => {
			e || t();
		},
		width: "form",
		label: "调整播放顺序",
		children: /* @__PURE__ */ (0, V.jsxs)("div", {
			className: "p-5",
			children: [i.isError ? /* @__PURE__ */ (0, V.jsx)(p, {
				message: x(i.error),
				onRetry: () => void i.refetch()
			}) : /* @__PURE__ */ (0, V.jsx)("p", {
				role: "status",
				children: "正在读取播放列表"
			}), /* @__PURE__ */ (0, V.jsx)(n, {
				variant: "secondary",
				onClick: t,
				children: "取消"
			})]
		})
	}) : /* @__PURE__ */ (0, V.jsx)(d, {
		title: `调整播放顺序 · ${e.name}`,
		close: t,
		items: a.items.map((e) => ({
			id: String(e.id),
			name: e.title || e.name || `影片 ${e.id}`
		})),
		save: async (t) => {
			await A(e.id, t.map(Number)), O(), r("播放顺序已保存", { undo: $(() => A(e.id, a.items.map((e) => e.id))) });
		}
	});
}
export { oe as PlaylistsPage };

//# debugId=8196d254-bf9b-44eb-91c3-7e251e33e6d3