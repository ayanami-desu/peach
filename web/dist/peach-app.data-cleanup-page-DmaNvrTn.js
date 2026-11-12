(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "cbaab6bb-e39e-40d1-a3da-7be0218edfa3", e._sentryDebugIdIdentifier = "sentry-dbid-cbaab6bb-e39e-40d1-a3da-7be0218edfa3");
	} catch {}
})();
import { BATCH_DELETE_TEXT as e, Button as t, CLEANUP_ENTRY as n, CLEANUP_ENTRY_GRID as r, CLEANUP_HASH_REDIRECTS as i, CLEANUP_TOOLS as a, Chip as o, DIRECTORY_TEMPLATE_ERROR as s, DUPLICATES_KEY as c, Fieldset as l, FieldsetTitle as u, IndexSearch as d, Input as f, JUNK_KEY as p, LINKS_KEY as ee, LINK_CHECK_KEY as te, LINK_KINDS as m, LINK_PRUNE_KEY as ne, LOC as h, LibraryProcessingCard as g, MEDIA_SOURCE_ICONS as _, Note as v, ORGANIZE_KEY as y, ORGANIZE_PARAMETER_HINT as b, ORGANIZE_SCOPE_HINT as x, ORGANIZE_TEXT as re, ORPHAN_RECORDS_KEY as S, ORPHAN_RECORDS_TEXT as C, PERFORMER_DELETE_KEY as w, PLAIN_STAT_STRIP as T, PlainStat as E, QUALITY_GOALS_KEY as D, RESULT_PANEL as O, RESULT_SECTION as k, REVIEW_COUNTS_KEY as A, SectionHeading as j, Select as M, SelectItem as ie, SourceMark as ae, StatusLabel as oe, TRASH_KEY as N, TaskProgress as se, Wt as P, __toESM as ce, attachOrphan as F, baseName as I, busyProps as L, candidateText as R, checkLine as le, confirmModal as z, cx as B, deletePerformerVideos as ue, entityDisplayName as V, entityFaceImg as H, entityPath as de, errorMessage as U, esc as fe, fetchDeletePerformers as pe, fetchDeletePlan as me, fetchDuplicates as W, fetchJunkSummary as he, fetchLinkCheck as G, fetchLinkPrune as K, fetchLinkStats as ge, fetchOrganize as _e, fetchOrganizeExample as ve, fetchOrphanRecords as ye, fetchQualityGoals as be, fetchReviewCounts as xe, fetchTrashSummary as Se, firstGrapheme as Ce, fmtSize as we, junkBreakdown as Te, organizeOutcome as Ee, peachHistory$1 as De, plainStatClass as Oe, planSummary as ke, previewOrganize as Ae, pruneText as je, purgeOrphan as Me, queryClient as q, recordsText as Ne, rememberTemplates as Pe, require_jsx_runtime as Fe, require_react as Ie, reviewSummary as Le, spriteGlyph as J, startLinkCheck as Re, startLinkPrune as ze, startOrganize as Be, t as Y, useEntityNames as Ve, useMutation as He, useQuery as X, withOrganizeJob as Ue } from "./peach-app.js";
import { Page as We } from "./peach-app.page-QAncjzM1.js";
import { ErrorExcerpt as Ge } from "./peach-app.error-excerpt-B8v2xEIP.js";
import { useBackgroundJob as Ke } from "./peach-app.background-job-Dz7YRY81.js";
import { DataTable as qe } from "./peach-app.data-table-BOmPe3iV.js";
import { SiteMark as Je } from "./peach-app.site-mark-BaBDADIA.js";
import { LEGACY_AVATAR_IMG as Ye } from "./peach-app.legacy-avatar-NSITxLRS.js";
// src/react/data-cleanup/cleanup-entry-card.tsx
var Z = /* @__PURE__ */ ce(Ie(), 1), Q = Fe(), Xe = J("chevron-right");
function Ze({ label: e, icon: t, summary: r, detail: i, state: a, attributes: o, onOpen: s }) {
	return /* @__PURE__ */ (0, Q.jsxs)("button", {
		type: "button",
		...o,
		className: n.face,
		onClick: s,
		"data-entry-state": a,
		"aria-busy": a === "loading" || void 0,
		children: [
			/* @__PURE__ */ (0, Q.jsx)("span", {
				"aria-hidden": !0,
				className: n.icon,
				children: /* @__PURE__ */ (0, Q.jsx)(t, {
					"aria-hidden": !0,
					className: "size-5"
				})
			}),
			/* @__PURE__ */ (0, Q.jsxs)("span", {
				className: n.body,
				children: [
					/* @__PURE__ */ (0, Q.jsx)("span", {
						className: n.title,
						children: e
					}),
					/* @__PURE__ */ (0, Q.jsx)("span", {
						className: B(n.summary, a === "error" && "text-text-error-primary"),
						children: r
					}),
					i ? /* @__PURE__ */ (0, Q.jsx)("span", {
						className: n.detail,
						children: i
					}) : null
				]
			}),
			/* @__PURE__ */ (0, Q.jsx)(Xe, {
				"aria-hidden": !0,
				className: n.arrow
			})
		]
	});
}
// src/react/data-cleanup/link-check-icon.tsx
function Qe({ className: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)("svg", {
		"aria-hidden": !0,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		className: e,
		"data-link-check-icon": "",
		children: [
			/* @__PURE__ */ (0, Q.jsx)("path", { d: "m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" }),
			/* @__PURE__ */ (0, Q.jsx)("path", { d: "m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" }),
			/* @__PURE__ */ (0, Q.jsxs)("g", {
				"data-link-check-rays": "",
				children: [
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M8 2v3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M2 8h3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M16 19v3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M19 16h3" })
				]
			})
		]
	});
}
// src/react/data-cleanup/link-manager.tsx
var $e = J("rotate-cw"), et = Y("cleanup:links.goneHint"), tt = Y("cleanup:links.unclearHint"), nt = Y("cleanup:links.pruneHint"), rt = Y("cleanup:shared.reconnecting"), it = (e) => Number(e || 0).toLocaleString();
function at({ label: e, value: t, note: n }) {
	return /* @__PURE__ */ (0, Q.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-0.5",
		children: [
			/* @__PURE__ */ (0, Q.jsx)("span", {
				className: "text-caption-1-regular leading-5 text-text-secondary",
				children: e
			}),
			/* @__PURE__ */ (0, Q.jsx)("b", {
				className: "text-title-2-semibold font-bold leading-5 tabular-nums text-text-primary",
				children: t
			}),
			n ? /* @__PURE__ */ (0, Q.jsx)("small", {
				className: "text-caption-1-regular leading-5 text-text-secondary",
				children: n
			}) : null
		]
	});
}
function ot({ title: e, items: t, hint: n, picked: r, onPick: i, children: a, footer: o, confirmed: s = !1 }) {
	if (!t.length) return null;
	let c = [
		{
			id: "entity",
			label: Y("cleanup:links.columnEntry"),
			width: 180,
			min: 128,
			value: (e) => e.entity,
			render: (e) => /* @__PURE__ */ (0, Q.jsxs)("a", {
				className: "flex min-w-24 items-center gap-2 text-text-secondary hover:text-text-primary hover:underline",
				href: e.entity_id && e.entity_kind ? de(e.entity_kind, e.entity, e.entity_id) : void 0,
				"data-link-identity": "",
				children: [/* @__PURE__ */ (0, Q.jsx)("span", {
					"data-link-avatar": "",
					className: `relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-quaternary-default text-caption-1-medium text-text-primary ${Ye}`,
					"aria-hidden": !0,
					dangerouslySetInnerHTML: { __html: `<span>${fe(Ce(e.entity))}</span>` + H({
						kind: e.entity_kind,
						id: e.entity_id,
						hasImage: e.face?.has_image,
						version: e.face?.image_version,
						focus: e.face?.avatar_focus,
						thumb: !0,
						mark: e.entity_kind === "studio" || e.entity_kind === "agency" ? e.id : null
					}) }
				}), /* @__PURE__ */ (0, Q.jsx)("span", {
					className: "min-w-0 wrap-anywhere",
					children: e.entity
				})]
			})
		},
		{
			id: "kind",
			label: Y("cleanup:shared.type"),
			width: 128,
			value: (e) => m[e.link_kind] || e.link_kind,
			render: (e) => m[e.link_kind] || e.link_kind
		},
		{
			id: "label",
			label: Y("cleanup:links.columnName"),
			min: 128,
			value: (e) => e.label || "",
			render: (e) => /* @__PURE__ */ (0, Q.jsx)("span", {
				className: "flex min-w-24 items-center gap-2",
				"data-link-name": "",
				children: /* @__PURE__ */ (0, Q.jsx)("span", {
					className: "min-w-0 wrap-anywhere",
					children: e.label || new URL(e.url).hostname
				})
			})
		},
		{
			id: "note",
			label: Y("cleanup:links.columnResult"),
			width: 320,
			min: 192,
			value: (e) => e.note,
			render: (e) => /* @__PURE__ */ (0, Q.jsx)("div", {
				className: "min-w-0 w-full",
				"data-link-result": s ? "gone" : "unclear",
				children: /^(?:HTTP\s+)?[1-5]\d{2}$/.test(e.note.trim()) ? /* @__PURE__ */ (0, Q.jsx)(oe, {
					tone: s || /^(?:HTTP\s+)?5\d{2}$/.test(e.note.trim()) ? "error" : "warning",
					"data-link-code": "",
					children: e.note.trim()
				}) : /* @__PURE__ */ (0, Q.jsxs)("div", {
					className: "flex flex-col items-start gap-1",
					children: [/* @__PURE__ */ (0, Q.jsx)(oe, {
						tone: s ? "error" : "warning",
						children: Y(s ? "cleanup:links.dead" : "cleanup:links.inconclusive")
					}), /* @__PURE__ */ (0, Q.jsx)(Ge, {
						text: e.note,
						className: "tabular-nums text-text-secondary"
					})]
				})
			})
		},
		{
			id: "url",
			label: Y("cleanup:links.columnUrl"),
			width: 360,
			min: 180,
			value: (e) => e.url,
			render: (e) => /* @__PURE__ */ (0, Q.jsxs)("a", {
				href: e.url,
				target: "_blank",
				rel: "noopener noreferrer",
				title: e.url,
				"data-link-address": "",
				className: "flex min-w-0 items-center gap-1 text-text-secondary hover:text-text-primary",
				children: [
					/* @__PURE__ */ (0, Q.jsx)(Je, { linkId: e.id }),
					/* @__PURE__ */ (0, Q.jsx)("span", {
						"data-middle-truncate": !0,
						className: "min-w-0 truncate",
						children: e.url
					}),
					/* @__PURE__ */ (0, Q.jsx)(P, {
						"aria-hidden": !0,
						className: "size-(--icon-inline) shrink-0"
					})
				]
			})
		}
	];
	return /* @__PURE__ */ (0, Q.jsx)("div", {
		className: k,
		"data-link-results": s ? "gone" : "unclear",
		children: /* @__PURE__ */ (0, Q.jsx)(qe, {
			label: e,
			items: t,
			columns: c,
			rowId: (e) => String(e.id),
			description: n,
			unit: Y("cleanup:links.unit"),
			panel: !1,
			footerActions: o,
			rowLabel: (e) => Y("cleanup:links.rowLabel", {
				entity: e.entity,
				link: e.label || e.url
			}),
			selected: r.map(String),
			onSelected: (e) => i(e.map(Number)),
			actions: () => a
		})
	});
}
function st() {
	let e = X({
		queryKey: ee,
		queryFn: ({ signal: e }) => ge(e)
	}), [n, r] = (0, Z.useState)([]), [i, a] = (0, Z.useState)([]), s = Ke({
		queryKey: ne,
		queryFn: ({ signal: e }) => K(e),
		start: ze,
		onFinish: () => {
			q.invalidateQueries({
				queryKey: ee,
				exact: !0
			}), q.invalidateQueries({
				queryKey: te,
				exact: !0
			});
		}
	}), c = Ke({
		queryKey: te,
		queryFn: ({ signal: e }) => G(e),
		start: Re,
		onStarted: () => {
			s.dismiss(), r([]), a([]);
		}
	}), d = c.job, f = d?.check_id ?? "";
	(0, Z.useEffect)(() => {
		r([]), a([]);
	}, [f]);
	let p = c.running || c.start.isPending, h = s.running || s.start.isPending, g = !!c.job && !!s.job, _ = d?.status === "complete", y = d?.gone ?? [], b = d?.unclear ?? [], x = _ ? b : [], re = y.filter((e) => i.includes(e.id)).map((e) => e.id), S = x.filter((e) => n.includes(e.id)).map((e) => e.id), C = e.data, w = (C?.top_hosts ?? []).slice(0, 3), T = (e) => {
		!g || p || e && !e.length || c.start.mutate(e ? {
			retry: e,
			checkId: f
		} : {});
	}, E = (e) => {
		g && !h && y.length && z({
			title: Y("cleanup:links.deleteDead"),
			body: Y("cleanup:links.deleteDeadBody", { count: e?.length ?? y.length }),
			confirmLabel: Y("cleanup:links.deleteDead"),
			danger: !0,
			onConfirm: () => s.start.mutateAsync({
				checkId: f,
				ids: e
			})
		});
	}, D = s.outcome, A = c.start.error ?? s.start.error, j = null, M = null;
	if (D?.status === "failed") M = /* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "error",
		title: Y("cleanup:links.pruneIncomplete"),
		children: D.error || Y("cleanup:links.checkTaskLog")
	});
	else if (D && !y.length && !b.length) M = /* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "success",
		title: Y("cleanup:links.pruneDone"),
		children: je(D)
	});
	else if (A) M = /* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "error",
		title: Y("cleanup:links.checkFailed"),
		children: U(A)
	});
	else if (c.query.isError && d) M = /* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "neutral",
		title: Y("cleanup:shared.taskStatus"),
		children: rt
	});
	else if (d?.status === "failed") M = /* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "error",
		title: Y("cleanup:links.checkFailed"),
		children: d.error || Y("cleanup:links.checkFailed")
	});
	else if (d && d.status !== "idle") {
		j = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [d.status === "running" ? /* @__PURE__ */ (0, Q.jsx)(se, {
			embedded: !0,
			label: le(d),
			value: Math.min(d.checked || 0, d.total || 0),
			total: d.total
		}) : null, h ? /* @__PURE__ */ (0, Q.jsx)(se, {
			embedded: !0,
			label: s.job?.message || Y("cleanup:links.pruning"),
			value: Math.min(s.job?.checked || 0, s.job?.total || 0),
			total: s.job?.total
		}) : null] });
		let e = Y("cleanup:links.retrySelected", { count: S.length });
		M = _ || y.length || b.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
			className: O,
			children: [
				D?.status === "complete" ? /* @__PURE__ */ (0, Q.jsx)(v, {
					tone: "success",
					title: Y("cleanup:links.pruneDone"),
					children: je(D)
				}) : null,
				/* @__PURE__ */ (0, Q.jsx)(ot, {
					title: Y("cleanup:links.dead"),
					items: y,
					hint: et,
					picked: i,
					onPick: a,
					confirmed: !0,
					footer: _ && y.length ? /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "mr-auto min-w-0 text-caption-1-regular text-text-secondary",
						children: nt
					}), /* @__PURE__ */ (0, Q.jsx)(t, {
						variant: "danger",
						...L(h),
						onClick: () => E(),
						children: Y("cleanup:links.deleteDeadCount", { count: y.length })
					})] }) : null,
					children: /* @__PURE__ */ (0, Q.jsx)(t, {
						variant: "danger",
						size: "small",
						disabled: !_ || !re.length,
						...L(h),
						onClick: () => E(re),
						children: Y("cleanup:links.deleteSelected", { count: re.length })
					})
				}),
				/* @__PURE__ */ (0, Q.jsx)(ot, {
					title: Y("cleanup:links.unreached"),
					items: b,
					hint: tt,
					picked: n,
					onPick: r,
					footer: x.length ? /* @__PURE__ */ (0, Q.jsx)(t, {
						variant: "primary",
						leadingIcon: $e,
						...L(p),
						onClick: () => T(x.map((e) => e.id)),
						children: Y("cleanup:links.retryAll", { count: x.length })
					}) : null,
					children: x.length ? /* @__PURE__ */ (0, Q.jsx)(Q.Fragment, { children: /* @__PURE__ */ (0, Q.jsx)(t, {
						variant: "secondary",
						leadingIcon: $e,
						disabled: !S.length,
						...L(p),
						onClick: () => T(S),
						children: e
					}) }) : null
				}),
				_ && !y.length && !b.length ? /* @__PURE__ */ (0, Q.jsx)("p", {
					className: `${k} text-body-regular text-notification-success-foreground`,
					children: Y("cleanup:links.allReachable")
				}) : null
			]
		}) : null;
	}
	return /* @__PURE__ */ (0, Q.jsxs)("section", {
		id: "link-manager",
		"aria-labelledby": "link-manager-title",
		className: "flex scroll-mt-20 flex-col gap-4",
		children: [/* @__PURE__ */ (0, Q.jsxs)(l, {
			layout: "stack",
			labelledBy: "link-manager-title",
			footer: /* @__PURE__ */ (0, Q.jsx)(t, {
				"data-link-check": "",
				leadingIcon: Qe,
				disabled: !g,
				...L(p),
				onClick: () => T(),
				children: Y(p ? "cleanup:links.checking" : _ ? "cleanup:links.checkAgain" : "cleanup:links.checkLinks")
			}),
			children: [
				/* @__PURE__ */ (0, Q.jsx)(u, {
					id: "link-manager-title",
					gap: "small",
					children: Y("cleanup:tools.links")
				}),
				e.isError ? /* @__PURE__ */ (0, Q.jsx)(v, {
					tone: "error",
					title: Y("cleanup:links.statsLoadFailed"),
					children: U(e.error)
				}) : C ? /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsxs)("div", {
					className: "link-stat-grid mt-4 gap-x-8 gap-y-3",
					children: [/* @__PURE__ */ (0, Q.jsx)(at, {
						label: Y("cleanup:links.totalLinks"),
						value: it(C.total),
						note: Y("cleanup:links.entitySpread", { count: Number(C.entities || 0) })
					}), Object.entries(C.by_kind ?? {}).map(([e, t]) => /* @__PURE__ */ (0, Q.jsx)(at, {
						label: m[e] || e,
						value: it(t)
					}, e))]
				}), w.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
					className: "mt-4 flex min-w-0 flex-col gap-0.5",
					children: [/* @__PURE__ */ (0, Q.jsx)("span", {
						className: "text-caption-1-regular text-text-secondary",
						children: Y("cleanup:links.topSites")
					}), /* @__PURE__ */ (0, Q.jsx)("div", {
						className: "flex min-w-0 flex-wrap gap-x-5 gap-y-2",
						children: w.map(([e, t]) => /* @__PURE__ */ (0, Q.jsxs)("span", {
							"data-top-host": "",
							className: "inline-flex min-w-0 max-w-full items-center gap-1.5",
							children: [/* @__PURE__ */ (0, Q.jsxs)("a", {
								href: `https://${e}`,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex min-w-0 items-center gap-1.5 text-body-2-medium text-text-primary",
								children: [
									/* @__PURE__ */ (0, Q.jsx)(Je, { linkId: C.top_host_link_ids?.[e] }),
									/* @__PURE__ */ (0, Q.jsx)("span", {
										className: "min-w-0 wrap-anywhere",
										children: e
									}),
									/* @__PURE__ */ (0, Q.jsx)(P, {
										"aria-hidden": !0,
										className: "size-(--icon-inline) shrink-0"
									})
								]
							}), /* @__PURE__ */ (0, Q.jsx)(o, {
								variant: "caption",
								color: "neutral",
								children: /* @__PURE__ */ (0, Q.jsx)("span", {
									className: "tabular-nums",
									children: it(t)
								})
							})]
						}, e))
					})]
				}) : null] }) : null,
				/* @__PURE__ */ (0, Q.jsx)("div", {
					"aria-live": "polite",
					className: "mt-4 flex flex-col gap-3 empty:hidden",
					children: j
				})
			]
		}), /* @__PURE__ */ (0, Q.jsx)("div", {
			"aria-live": "polite",
			className: "empty:hidden",
			children: M
		})]
	});
}
// src/react/data-cleanup/organize-card.tsx
var ct = (e, t) => t ? Y("cleanup:organize.applyBodyPath", {
	name: e,
	path: t
}) : Y("cleanup:organize.applyBodyAll", { name: e }), lt = Y("cleanup:organize.rollbackBody"), $ = "整个网盘", ut = 8;
function dt({ plan: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)("ol", {
		className: "mt-2 flex min-w-0 flex-col gap-1",
		children: e.rows.slice(0, ut).map((e) => /* @__PURE__ */ (0, Q.jsxs)("li", {
			className: "flex min-w-0 items-center gap-2 text-caption-1-regular text-text-secondary",
			children: [
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"data-middle-truncate": !0,
					title: e.current_path,
					className: "min-w-0 truncate",
					children: I(e.current_path)
				}),
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"aria-hidden": !0,
					children: "→"
				}),
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"data-middle-truncate": !0,
					title: e.target_path,
					className: "min-w-0 truncate text-text-primary",
					children: I(e.target_path)
				})
			]
		}, e.current_path))
	}), e.truncated || e.rows.length > ut ? /* @__PURE__ */ (0, Q.jsx)("p", {
		className: "text-caption-1-regular text-text-secondary",
		children: Y("cleanup:organize.planTruncated")
	}) : null] });
}
function ft({ toast: e, failure: n }) {
	let r = X({
		queryKey: y,
		queryFn: ({ signal: e }) => _e(e)
	}), i = r.data, a = i?.locations ?? [], [o, c] = (0, Z.useState)(""), d = a.some((e) => e.location === o) ? o : a[0]?.location ?? "", p = i?.templates?.[d], [ee, te] = (0, Z.useState)(null), m = ee?.location === d ? ee : {
		location: d,
		file: p?.file ?? "",
		dir: p?.dir ?? ""
	}, ne = (e) => {
		te({
			...m,
			...e
		}), F.reset();
	}, [g, S] = (0, Z.useState)({
		location: "",
		root: $
	}), C = g.location === d ? g.root : $, w = [.../* @__PURE__ */ new Set([$, ...a.find((e) => e.location === d)?.roots ?? []])], T = C === $ ? "" : `${d}:/${C}`, [E, D] = (0, Z.useState)(null), O = (0, Z.useRef)(null), k = (0, Z.useRef)(null), A = X({
		queryKey: [
			"organize-example",
			m.file,
			m.dir
		],
		queryFn: ({ signal: e }) => ve(m.file, m.dir, e),
		enabled: !!i
	}), [j, oe] = (0, Z.useState)("file"), N = (0, Z.useRef)(!1), P = (0, Z.useRef)(null);
	(0, Z.useLayoutEffect)(() => {
		let e = P.current;
		if (!e) return;
		P.current = null;
		let t = (e.field === "file" ? O : k).current;
		t?.focus(), t?.setSelectionRange(e.caret, e.caret);
	});
	let ce = () => ({
		location: d,
		path: T,
		file_template: m.file.trim(),
		dir_template: m.dir.trim()
	}), F = He({
		mutationFn: Ae,
		onError: (e) => {
			let t = U(e);
			if (/整理路径/.test(t)) {
				D(null);
				return;
			}
			let n = s.test(t) ? "dir" : "file";
			D(n), (n === "dir" ? k : O).current?.focus();
		}
	}), I = Ke({
		queryKey: y,
		queryFn: ({ signal: e }) => _e(e),
		start: Be,
		jobOf: (e) => e,
		withJob: Ue,
		onStarted: () => F.reset(),
		onFinish: (t) => {
			if (q.invalidateQueries({
				queryKey: y,
				exact: !0
			}), t.status !== "complete") return;
			let { text: r, failed: i } = Ee(t);
			i ? n(Y("cleanup:tools.organize"), Error(Y("cleanup:organize.rowsFailed", { count: i }))) : e(r.replace(/。$/, ""));
		}
	}), R = I.running || I.start.isPending, le = JSON.stringify(F.variables) === JSON.stringify(ce()), B = le ? F.data : void 0, ue = Number(B?.counts?.change || 0), V = h[d] || d, H = (e) => {
		ne(e), D(null), F.reset();
	}, de = (e) => {
		let t = (j === "file" ? O : k).current, n = m[j], r = N.current ? t?.selectionStart ?? n.length : n.length, i = N.current ? t?.selectionEnd ?? r : r, a = `{${e}}`;
		P.current = {
			field: j,
			caret: r + a.length
		}, H({ [j]: n.slice(0, r) + a + n.slice(i) });
	}, fe = () => {
		F.isPending || R || !d || (I.dismiss(), I.start.reset(), D(null), F.mutate(ce()));
	}, pe = () => {
		let e = F.variables;
		e && B && ue && z({
			title: Y("cleanup:tools.organize"),
			body: ct(V, e.path),
			confirmLabel: Y("cleanup:tools.organize"),
			onConfirm: async () => {
				await I.start.mutateAsync({
					kind: "apply",
					request: e
				}), Pe({
					...i?.templates ?? {},
					[e.location]: {
						file: e.file_template,
						dir: e.dir_template
					}
				});
			}
		});
	}, me = () => void z({
		title: Y("cleanup:organize.rollbackTitle"),
		body: lt,
		confirmLabel: Y("cleanup:organize.rollbackConfirm"),
		onConfirm: () => I.start.mutateAsync({ kind: "rollback" })
	}), W = null, he = !!ue && !R && !I.outcome, G = I.job, K = I.outcome;
	if (G?.status === "running") {
		let e = G.message || G.stage || Y("cleanup:organize.running");
		W = /* @__PURE__ */ (0, Q.jsx)(se, {
			embedded: !0,
			label: e,
			value: Math.min(G.checked || 0, G.total || 0),
			total: G.total
		});
	} else if (K?.status === "failed") W = /* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "error",
		title: Y("cleanup:organize.incomplete"),
		children: K.error || Y("cleanup:shared.checkTaskLogFiles")
	});
	else if (K) {
		let { text: e, failed: t } = Ee(K);
		W = /* @__PURE__ */ (0, Q.jsx)(v, {
			tone: t ? "warning" : "success",
			title: Y(t ? "cleanup:shared.partiallyCompleted" : "cleanup:organize.result"),
			children: e
		});
	} else I.start.isError ? W = /* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "error",
		title: Y("cleanup:organize.failed"),
		children: U(I.start.error)
	}) : F.isPending ? W = /* @__PURE__ */ (0, Q.jsx)(se, {
		embedded: !0,
		label: Y("cleanup:organize.checkingPlan")
	}) : F.isError && le ? W = /* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "error",
		title: Y("cleanup:organize.previewFailed"),
		children: U(F.error)
	}) : B && (W = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)(v, {
		tone: "neutral",
		title: Y("cleanup:organize.previewResult"),
		children: ke(B)
	}), ue ? /* @__PURE__ */ (0, Q.jsx)(dt, { plan: B }) : null] }));
	return /* @__PURE__ */ (0, Q.jsxs)(l, {
		layout: "stack",
		id: "organize",
		labelledBy: "cleanup-organize-title",
		attributes: { "data-cleanup-organize": "" },
		footer: /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [
			i?.last_batch ? /* @__PURE__ */ (0, Q.jsx)(t, {
				variant: "secondary",
				...L(R),
				onClick: me,
				children: Y("cleanup:organize.rollbackLastBatch")
			}) : null,
			/* @__PURE__ */ (0, Q.jsx)(t, {
				variant: he ? "secondary" : "primary",
				disabled: !a.length || R,
				...L(F.isPending),
				onClick: fe,
				children: Y("cleanup:organize.preview")
			}),
			he ? /* @__PURE__ */ (0, Q.jsx)(t, {
				variant: "primary",
				onClick: pe,
				children: Y("cleanup:organize.apply")
			}) : null
		] }),
		children: [
			/* @__PURE__ */ (0, Q.jsx)(u, {
				id: "cleanup-organize-title",
				gap: "medium",
				children: Y("cleanup:organize.title")
			}),
			/* @__PURE__ */ (0, Q.jsx)("p", {
				className: "text-body-regular text-text-secondary",
				children: re
			}),
			r.isError ? /* @__PURE__ */ (0, Q.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, Q.jsx)(v, {
					tone: "error",
					title: Y("cleanup:organize.settingsLoadFailed"),
					children: U(r.error)
				})
			}) : null,
			/* @__PURE__ */ (0, Q.jsxs)("div", {
				className: "mt-3 flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, Q.jsxs)("div", {
						"data-organize-scope": !0,
						className: "flex min-w-0 flex-wrap items-start gap-2",
						children: [a.length ? /* @__PURE__ */ (0, Q.jsx)(M, {
							"aria-label": Y("cleanup:organize.storageLabel"),
							prefix: Y("cleanup:organize.storagePrefix"),
							className: "w-fit min-w-25",
							selectedKey: d || null,
							onSelectionChange: (e) => {
								e !== null && (c(String(e)), S({
									location: String(e),
									root: $
								}), D(null), F.reset(), N.current = !1);
							},
							children: a.map((e) => /* @__PURE__ */ (0, Q.jsxs)(ie, {
								id: e.location,
								textValue: h[e.location] || e.location,
								children: [/* @__PURE__ */ (0, Q.jsx)(ae, { mark: _[e.location] || "database" }), h[e.location] || e.location]
							}, e.location))
						}) : null, /* @__PURE__ */ (0, Q.jsx)(M, {
							"aria-label": Y("cleanup:organize.scopeLabel"),
							prefix: Y("cleanup:organize.scopePrefix"),
							className: "w-fit min-w-25",
							selectedKey: C,
							isDisabled: !a.length,
							onSelectionChange: (e) => {
								e !== null && (S({
									location: d,
									root: String(e)
								}), D(null), F.reset());
							},
							children: w.map((e) => /* @__PURE__ */ (0, Q.jsx)(ie, {
								id: e,
								textValue: e === $ ? Y("cleanup:organize.wholeDrive") : e,
								children: e === $ ? Y("cleanup:organize.wholeDrive") : e
							}, e))
						})]
					}),
					/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "text-caption-1-regular text-text-secondary",
						children: x
					}),
					/* @__PURE__ */ (0, Q.jsx)(f, {
						label: Y("cleanup:organize.fileTemplate"),
						placeholder: "{code}[ {title}]",
						value: m.file,
						ref: O,
						spellCheck: "false",
						isInvalid: E === "file",
						onFocus: () => {
							oe("file"), N.current = !0;
						},
						onChange: (e) => H({ file: e })
					}),
					/* @__PURE__ */ (0, Q.jsx)(f, {
						label: Y("cleanup:organize.dirTemplate"),
						placeholder: Y("cleanup:organize.dirTemplatePlaceholder"),
						value: m.dir,
						ref: k,
						spellCheck: "false",
						isInvalid: E === "dir",
						onFocus: () => {
							oe("dir"), N.current = !0;
						},
						onChange: (e) => H({ dir: e })
					}),
					i?.presets?.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
						className: "flex flex-col gap-2",
						role: "group",
						"aria-label": Y("cleanup:organize.applyPreset"),
						children: [/* @__PURE__ */ (0, Q.jsx)("p", {
							className: "text-caption-1-medium text-text-secondary",
							children: Y("cleanup:organize.applyPreset")
						}), /* @__PURE__ */ (0, Q.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: i.presets.map((e) => /* @__PURE__ */ (0, Q.jsx)(t, {
								variant: "secondary",
								size: "small",
								title: e.example || e.label,
								className: "max-w-full [&>span]:min-w-0 [&>span]:shrink",
								onClick: () => {
									H({
										file: e.file,
										dir: e.dir
									}), N.current = !1;
								},
								children: /* @__PURE__ */ (0, Q.jsx)("span", {
									className: "truncate",
									children: e.label
								})
							}, e.label))
						})]
					}) : null,
					/* @__PURE__ */ (0, Q.jsxs)("p", {
						"aria-live": "polite",
						"aria-busy": A.isFetching,
						"data-organize-example": "",
						className: "text-caption-1-regular text-text-secondary",
						children: [Y("cleanup:organize.examplePath"), /* @__PURE__ */ (0, Q.jsx)("code", {
							className: "wrap-anywhere",
							children: A.data?.example || A.data?.error || (A.isError ? U(A.error) : Y("cleanup:organize.previewLoading"))
						})]
					}),
					i?.placeholders?.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
						className: "flex flex-col gap-2",
						role: "group",
						"aria-label": Y("cleanup:organize.insertParameter"),
						children: [/* @__PURE__ */ (0, Q.jsxs)("p", {
							className: "text-caption-1-regular text-text-secondary",
							"aria-live": "polite",
							children: [/* @__PURE__ */ (0, Q.jsx)("strong", {
								className: "text-caption-1-semibold text-text-primary",
								children: Y("cleanup:organize.insertParameter")
							}), Y("cleanup:organize.insertTarget", { target: Y(j === "file" ? "cleanup:organize.fileTemplate" : "cleanup:organize.dirTemplate") })]
						}), /* @__PURE__ */ (0, Q.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: i.placeholders.map((e) => /* @__PURE__ */ (0, Q.jsx)(t, {
								variant: "ghost",
								size: "small",
								"aria-label": `${e.label} {${e.key}}`,
								onClick: () => de(e.key),
								children: /* @__PURE__ */ (0, Q.jsxs)("span", {
									className: "inline-flex flex-wrap items-center gap-x-1.5",
									children: [/* @__PURE__ */ (0, Q.jsx)("code", { children: `{${e.key}}` }), /* @__PURE__ */ (0, Q.jsx)("span", {
										className: "text-text-secondary",
										children: e.label
									})]
								})
							}, e.key))
						})]
					}) : null,
					/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "text-caption-1-regular leading-4.5 text-text-secondary",
						children: b
					})
				]
			}),
			/* @__PURE__ */ (0, Q.jsx)("div", {
				"aria-live": "polite",
				className: "mt-3 flex flex-col gap-2 empty:hidden",
				children: W
			})
		]
	});
}
// src/react/data-cleanup/orphan-records-card.tsx
var pt = J("play"), mt = () => q.invalidateQueries({
	queryKey: S,
	exact: !0
});
function ht({ item: e, toast: n }) {
	let [r, i] = (0, Z.useState)(e.candidates[0]?.id ?? null), a = He({
		mutationFn: () => F(e.id, Number(r)),
		onSuccess: () => {
			let t = e.candidates.find((e) => e.id === r);
			n(Y("cleanup:orphans.attached", {
				name: e.name,
				target: t?.name ?? Y("cleanup:orphans.selectedFile")
			})), mt();
		},
		onError: (e) => n(U(e))
	}), o = He({
		mutationFn: () => Me(e.id),
		onSuccess: (t) => {
			n(t.blocked.length ? Y("cleanup:orphans.fileRestored", { name: e.name }) : Y("cleanup:orphans.recordDeleted", { name: e.name })), mt();
		}
	}), s = () => {
		z({
			title: Y("cleanup:orphans.deleteRecord"),
			body: Ne(e.records) ? Y("cleanup:orphans.deleteBodyWithActivity", {
				name: e.name,
				records: Ne(e.records)
			}) : Y("cleanup:orphans.deleteBody", { name: e.name }),
			confirmLabel: Y("cleanup:orphans.deleteRecord"),
			danger: !0,
			onConfirm: () => o.mutateAsync()
		});
	}, c = a.isPending || o.isPending;
	return /* @__PURE__ */ (0, Q.jsxs)("span", {
		className: "flex min-w-0 flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, Q.jsx)(t, {
				variant: "danger",
				size: "small",
				...L(c),
				onClick: s,
				children: Y("cleanup:orphans.deleteRecord")
			}),
			e.candidates.length ? /* @__PURE__ */ (0, Q.jsx)(M, {
				"aria-label": Y("cleanup:orphans.targetLabel", { name: e.name }),
				prefix: Y("cleanup:orphans.targetPrefix"),
				className: "w-52",
				selectedKey: r,
				onSelectionChange: (e) => {
					e !== null && i(Number(e));
				},
				children: e.candidates.map((e) => /* @__PURE__ */ (0, Q.jsx)(ie, {
					id: e.id,
					textValue: R(e),
					children: R(e)
				}, e.id))
			}) : null,
			e.candidates.length ? /* @__PURE__ */ (0, Q.jsx)(t, {
				variant: "primary",
				size: "small",
				disabled: r === null,
				...L(c),
				onClick: () => a.mutate(),
				children: Y("cleanup:orphans.moveActivity")
			}) : null
		]
	});
}
function gt({ item: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)("span", {
		className: "flex min-w-0 items-center gap-3",
		children: [/* @__PURE__ */ (0, Q.jsxs)("span", {
			className: "relative inline-grid aspect-16/10 w-24 flex-none place-items-center max-cleanup-tight:hidden overflow-hidden rounded-lg border border-separator-border bg-background-tertiary-default text-text-tertiary",
			children: [/* @__PURE__ */ (0, Q.jsx)(pt, {
				"aria-hidden": !0,
				className: "size-5"
			}), e.has_thumb ? /* @__PURE__ */ (0, Q.jsx)("img", {
				src: `/thumb?id=${e.id}&c=4`,
				alt: "",
				loading: "lazy",
				onError: (e) => e.currentTarget.remove(),
				className: "absolute inset-0 size-full object-contain"
			}) : null]
		}), /* @__PURE__ */ (0, Q.jsxs)("span", {
			className: "flex min-w-0 flex-1 flex-col gap-0.5",
			children: [/* @__PURE__ */ (0, Q.jsx)("span", {
				title: e.name,
				className: "truncate text-body-regular text-text-primary",
				children: e.name
			}), /* @__PURE__ */ (0, Q.jsx)("small", {
				className: "truncate text-caption-1-regular text-text-secondary",
				children: [e.code, h[e.location] || e.location].filter(Boolean).join(" · ")
			})]
		})]
	});
}
function _t({ toast: e }) {
	let [n, r] = (0, Z.useState)([]), i = X({
		queryKey: S,
		queryFn: ({ signal: e }) => ye(e)
	}), a = i.data?.items ?? [], o = He({
		mutationFn: (e) => Me(e),
		onSuccess: (t) => {
			e(Y("cleanup:orphans.purged", { count: t.purged }) + (t.blocked.length ? Y("cleanup:orphans.purgedBlocked", { count: t.blocked.length }) : "")), r([]), mt();
		}
	}), s = (e) => void z({
		title: Y("cleanup:orphans.deleteSelectedTitle"),
		body: Y("cleanup:orphans.deleteSelectedBody", { count: e.length }),
		items: e.map((e) => e.name),
		confirmLabel: Y("cleanup:orphans.deleteSelectedTitle"),
		danger: !0,
		onConfirm: () => o.mutateAsync(e.map((e) => e.id))
	}), c = [
		{
			id: "item",
			label: Y("cleanup:shared.video"),
			width: 480,
			min: 320,
			value: (e) => e.name,
			render: (e) => /* @__PURE__ */ (0, Q.jsx)(gt, { item: e })
		},
		{
			id: "records",
			label: Y("cleanup:orphans.columnActivity"),
			width: 176,
			min: 144,
			value: (e) => Ne(e.records),
			render: (e) => /* @__PURE__ */ (0, Q.jsx)("span", {
				className: "block min-w-0 whitespace-normal wrap-anywhere",
				children: Ne(e.records) || Y("cleanup:shared.none")
			})
		},
		{
			id: "target",
			label: Y("cleanup:shared.actions"),
			width: a.some((e) => e.candidates.length) ? 360 : 128,
			min: 128,
			value: (e) => e.candidates.length,
			render: (t) => /* @__PURE__ */ (0, Q.jsx)(ht, {
				item: t,
				toast: e
			})
		}
	];
	return /* @__PURE__ */ (0, Q.jsx)("section", {
		id: "orphan-records",
		"aria-labelledby": "orphan-records-title",
		className: "flex scroll-mt-20 flex-col gap-4",
		children: i.isError ? /* @__PURE__ */ (0, Q.jsxs)(l, {
			layout: "stack",
			labelledBy: "orphan-records-title",
			children: [/* @__PURE__ */ (0, Q.jsx)(u, {
				id: "orphan-records-title",
				children: Y("cleanup:tools.orphanRecords")
			}), /* @__PURE__ */ (0, Q.jsx)(v, {
				tone: "error",
				title: Y("cleanup:orphans.loadFailed"),
				children: U(i.error)
			})]
		}) : /* @__PURE__ */ (0, Q.jsx)(qe, {
			label: Y("cleanup:orphans.tableLabel"),
			items: a,
			columns: c,
			title: Y("cleanup:tools.orphanRecords"),
			titleId: "orphan-records-title",
			unit: Y("cleanup:orphans.unit"),
			description: C,
			rowId: (e) => String(e.id),
			rowLabel: (e) => e.name,
			selected: n,
			onSelected: r,
			actions: (e) => /* @__PURE__ */ (0, Q.jsx)(t, {
				variant: "danger",
				size: "small",
				disabled: !e.length,
				...L(o.isPending),
				onClick: () => s(e),
				children: Y("cleanup:orphans.deleteSelectedCount", { count: e.length })
			})
		})
	});
}
// src/react/data-cleanup/performer-delete-card.tsx
function vt({ person: e }) {
	let t = V("performer", e.k, e.entity_id);
	return /* @__PURE__ */ (0, Q.jsxs)("a", {
		href: de("performer", e.k, e.entity_id),
		title: t,
		className: "flex min-w-0 items-center gap-3 text-text-primary",
		children: [/* @__PURE__ */ (0, Q.jsx)("span", {
			"aria-hidden": !0,
			className: B("relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-quaternary-default text-caption-1-medium", Ye),
			dangerouslySetInnerHTML: { __html: `<span>${fe(Ce(t))}</span>` + H({
				kind: "performer",
				id: e.entity_id,
				hasImage: e.has_image,
				version: e.image_version,
				focus: e.avatar_focus,
				thumb: !0
			}) }
		}), /* @__PURE__ */ (0, Q.jsx)("span", {
			className: "min-w-0 wrap-anywhere",
			children: t
		})]
	});
}
function yt(e, t, n) {
	let r = (e) => e.slice(0, 5).join(Y("cleanup:shared.listSeparator")), i = e.length > 5 ? Y("cleanup:performerDelete.moreNames", {
		names: r(e),
		total: e.length
	}) : r(e), a = t.length > 5 ? Y("cleanup:performerDelete.moreExamples", {
		examples: r(t),
		total: t.length
	}) : r(t);
	return [
		Y("cleanup:performerDelete.bodyScope", {
			names: i,
			count: n.total,
			size: we(n.bytes)
		}),
		Y("cleanup:performerDelete.bodyWarning"),
		...n.shared ? [Y("cleanup:performerDelete.sharedFiles", { count: n.shared })] : [],
		Y("cleanup:performerDelete.bodyExamples", { examples: a })
	].join(Y("cleanup:shared.sentenceGap"));
}
function bt({ toast: n }) {
	Ve();
	let r = X({
		queryKey: w,
		queryFn: ({ signal: e }) => pe(e)
	}), [i, a] = (0, Z.useState)([]), [o, s] = (0, Z.useState)(""), [c, f] = (0, Z.useState)(!1), [p, ee] = (0, Z.useState)(null), [te, m] = (0, Z.useState)(""), ne = (0, Z.useRef)(null);
	(0, Z.useEffect)(() => () => ne.current?.abort(), []);
	let h = (0, Z.useMemo)(() => [
		{
			id: "name",
			label: Y("cleanup:shared.actress"),
			width: 280,
			min: 160,
			value: (e) => e.k,
			render: (e) => /* @__PURE__ */ (0, Q.jsx)(vt, { person: e })
		},
		{
			id: "works",
			label: Y("cleanup:shared.videos"),
			width: 104,
			min: 80,
			value: (e) => e.n,
			render: (e) => Y("cleanup:performerDelete.videoCount", { count: e.n })
		},
		{
			id: "files",
			label: Y("cleanup:shared.files"),
			width: 104,
			min: 80,
			value: (e) => e.file_count,
			render: (e) => Y("cleanup:performerDelete.fileCount", { count: e.file_count })
		},
		{
			id: "bytes",
			label: Y("cleanup:performerDelete.columnSize"),
			width: 136,
			min: 104,
			value: (e) => e.bytes,
			render: (e) => we(e.bytes)
		}
	], []), g = o.toLocaleLowerCase(), _ = (r.data?.items || []).filter((e) => !g || [
		e.k,
		V("performer", e.k, e.entity_id),
		...e.aliases
	].some((e) => e.toLocaleLowerCase().includes(g))), y = async (e, t) => {
		if (c) return;
		f(!0), m("");
		let r = new AbortController();
		ne.current = r;
		try {
			let i = await me(e.map((e) => e.entity_id), r.signal);
			if (r.signal.throwIfAborted(), !i.total) {
				n(Y("cleanup:performerDelete.nothingToDelete"));
				return;
			}
			let a = i.performers.map((e) => V("performer", e.name, e.id)), o = [...new Set(i.items.map((e) => e.code || e.name || `#${e.id}`))], s = await z({
				title: Y("cleanup:performerDelete.confirmTitle"),
				body: yt(a, o, i),
				confirmLabel: Y("cleanup:performerDelete.confirm"),
				danger: !0,
				onConfirm: () => ue(i)
			});
			if (!s.confirmed) return;
			let c = s.result;
			ee(c), t(), await Promise.all([q.invalidateQueries({
				queryKey: w,
				exact: !0
			}), q.invalidateQueries({
				queryKey: N,
				exact: !0
			})]), n(Y("cleanup:performerDelete.purged", { count: c.purged }) + (c.blocked.length ? Y("cleanup:performerDelete.doneBlocked", { count: c.blocked.length }) : ""));
		} catch (e) {
			r.signal.aborted || m(U(e));
		} finally {
			r.signal.aborted || f(!1);
		}
	}, b = p ? [...p.blocked] : [];
	return /* @__PURE__ */ (0, Q.jsxs)("section", {
		id: "batch-delete",
		className: "flex min-w-0 scroll-mt-20 flex-col gap-3",
		"aria-label": Y("cleanup:tools.bulkDelete"),
		children: [
			r.isPending || r.isError ? /* @__PURE__ */ (0, Q.jsxs)(l, {
				layout: "stack",
				labelledBy: "batch-delete-title",
				children: [/* @__PURE__ */ (0, Q.jsx)(u, {
					id: "batch-delete-title",
					children: Y("cleanup:tools.bulkDelete")
				}), r.isError ? /* @__PURE__ */ (0, Q.jsx)(v, {
					tone: "error",
					title: Y("cleanup:performerDelete.loadFailed"),
					action: /* @__PURE__ */ (0, Q.jsx)(t, {
						variant: "secondary",
						size: "small",
						onClick: () => void r.refetch(),
						children: Y("cleanup:shared.retry")
					}),
					children: U(r.error)
				}) : /* @__PURE__ */ (0, Q.jsx)("p", {
					role: "status",
					className: "text-body-regular text-text-secondary",
					children: Y("cleanup:performerDelete.loading")
				})]
			}) : /* @__PURE__ */ (0, Q.jsx)(qe, {
				label: Y("cleanup:performerDelete.tableLabel"),
				title: Y("cleanup:tools.bulkDelete"),
				titleId: "batch-delete-title",
				unit: Y("cleanup:performerDelete.unit"),
				description: e,
				items: _,
				columns: h,
				rowId: (e) => String(e.entity_id),
				rowLabel: (e) => V("performer", e.k, e.entity_id),
				selected: i,
				onSelected: a,
				toolbarActions: /* @__PURE__ */ (0, Q.jsx)(d, {
					label: Y("cleanup:performerDelete.search"),
					value: o,
					onQuery: (e) => {
						s(e), a([]);
					}
				}),
				actions: (e, n) => /* @__PURE__ */ (0, Q.jsx)(t, {
					variant: "danger",
					size: "small",
					...L(c),
					onClick: () => void y(e, n),
					children: Y("cleanup:performerDelete.deleteSelected")
				})
			}),
			te ? /* @__PURE__ */ (0, Q.jsx)(v, {
				tone: "error",
				title: Y("cleanup:performerDelete.planFailed"),
				children: te
			}) : null,
			p ? /* @__PURE__ */ (0, Q.jsx)(v, {
				tone: b.length ? "warning" : "info",
				title: Y("cleanup:performerDelete.purged", { count: p.purged }),
				extra: b.length ? /* @__PURE__ */ (0, Q.jsx)("div", {
					className: "flex flex-col gap-2 text-body-2-regular wrap-anywhere",
					children: b.slice(0, 5).map((e, t) => /* @__PURE__ */ (0, Q.jsxs)("p", { children: [
						e.path,
						"（",
						e.reason,
						"）"
					] }, t))
				}) : null,
				children: b.length ? Y("cleanup:performerDelete.partialFailure", { count: p.blocked.length }) : Y("cleanup:performerDelete.done")
			}) : null
		]
	});
}
// src/react/data-cleanup/data-cleanup-tool-page.tsx
function xt({ tool: e, toast: t, failure: n }) {
	let r;
	switch (e) {
		case "organize":
			r = /* @__PURE__ */ (0, Q.jsx)(ft, {
				toast: t,
				failure: n
			});
			break;
		case "orphan-records":
			r = /* @__PURE__ */ (0, Q.jsx)(_t, { toast: t });
			break;
		case "links":
			r = /* @__PURE__ */ (0, Q.jsx)(st, {});
			break;
		case "batch-delete": r = /* @__PURE__ */ (0, Q.jsx)(bt, { toast: t });
	}
	return /* @__PURE__ */ (0, Q.jsx)(We, { children: r });
}
// src/react/data-cleanup/data-cleanup-page.tsx
function St(e, t) {
	return e.data === void 0 ? e.isError ? {
		figure: Y("cleanup:overview.loadFailed"),
		state: "error"
	} : {
		figure: Y("cleanup:overview.loading"),
		state: "loading"
	} : t(e.data);
}
function Ct({ section: e, label: t, icon: n, value: r, open: i }) {
	return /* @__PURE__ */ (0, Q.jsx)("button", {
		type: "button",
		className: Oe({ interactive: !0 }),
		"data-cleanup-go": e,
		"data-entry-state": r.state,
		"aria-busy": r.state === "loading" || void 0,
		onClick: () => i(e),
		children: /* @__PURE__ */ (0, Q.jsx)(E, {
			label: t,
			icon: n,
			figure: r.figure,
			meta: r.meta
		})
	});
}
function wt({ tool: e, navigate: t }) {
	let n = J(e.icon);
	return /* @__PURE__ */ (0, Q.jsx)(Ze, {
		label: e.title,
		icon: n,
		summary: e.description,
		attributes: { "data-cleanup-tool": e.key },
		onOpen: () => t(e.path + location.search)
	});
}
var Tt = J("square-check-big"), Et = J("sparkles"), Dt = J("file-stack"), Ot = J("file-archive"), kt = J("trash"), At = () => {
	for (let e of [
		A,
		D,
		c,
		p
	]) q.invalidateQueries({
		queryKey: e,
		exact: !0
	});
};
function jt({ toast: e, open: t, navigate: n }) {
	let o = X({
		queryKey: A,
		queryFn: ({ signal: e }) => xe(e)
	}), s = X({
		queryKey: D,
		queryFn: ({ signal: e }) => be(e)
	}), l = X({
		queryKey: c,
		queryFn: ({ signal: e }) => W(e)
	}), u = X({
		queryKey: p,
		queryFn: ({ signal: e }) => he(e)
	}), d = X({
		queryKey: N,
		queryFn: ({ signal: e }) => Se(e)
	});
	return (0, Z.useEffect)(() => {
		let e = i[location.hash];
		e && De.replace(e + location.search);
	}, []), /* @__PURE__ */ (0, Q.jsxs)(We, { children: [
		/* @__PURE__ */ (0, Q.jsxs)("section", {
			"aria-labelledby": "cleanup-pending",
			className: "flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, Q.jsx)(j, {
				id: "cleanup-pending",
				children: Y("cleanup:overview.needsAttention")
			}), /* @__PURE__ */ (0, Q.jsxs)("div", {
				className: T,
				children: [
					/* @__PURE__ */ (0, Q.jsx)(Ct, {
						section: "review",
						label: Y("cleanup:overview.review"),
						icon: Tt,
						open: t,
						value: St(o, Le)
					}),
					/* @__PURE__ */ (0, Q.jsx)(Ct, {
						section: "duplicates",
						label: Y("cleanup:overview.duplicates"),
						icon: Dt,
						open: t,
						value: St(l, (e) => Number(e.total || 0) ? {
							figure: Y("cleanup:overview.duplicateGroups", {
								count: Number(e.total),
								files: Number(e.files || 0).toLocaleString()
							}),
							meta: Y("cleanup:overview.reclaimable", { size: we(e.reclaimable || 0) })
						} : { figure: Y("cleanup:overview.noDuplicates") })
					}),
					/* @__PURE__ */ (0, Q.jsx)(Ct, {
						section: "ads",
						label: Y("cleanup:overview.junkFiles"),
						icon: Ot,
						open: t,
						value: St(u, (e) => ({
							figure: Y("cleanup:overview.junkUndecided", { count: Number(e.pending_total || 0) }),
							meta: Te(e)
						}))
					}),
					/* @__PURE__ */ (0, Q.jsx)(Ct, {
						section: "quality",
						label: Y("cleanup:overview.hdUpgrades"),
						icon: Et,
						open: t,
						value: St(s, (e) => ({ figure: Y("cleanup:overview.upgradesPending", { count: Number(e.total || 0) }) }))
					}),
					/* @__PURE__ */ (0, Q.jsx)(Ct, {
						section: "trash",
						label: Y("cleanup:overview.trash"),
						icon: kt,
						open: t,
						value: St(d, (e) => ({
							figure: Y("cleanup:overview.trashCount", { count: Number(e.total || 0) }),
							meta: e.total ? Y("cleanup:overview.trashSize", { size: we(e.bytes || 0) }) : Y("cleanup:overview.trashEmptyHint")
						}))
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, Q.jsx)("div", {
			id: "libraryProcessing",
			className: "scroll-mt-20",
			children: /* @__PURE__ */ (0, Q.jsx)(g, {
				toast: (t) => e(t),
				monitor: !0,
				onComplete: At
			})
		}),
		/* @__PURE__ */ (0, Q.jsxs)("section", {
			"aria-labelledby": "cleanup-maintenance",
			className: "flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, Q.jsx)(j, {
				id: "cleanup-maintenance",
				children: Y("cleanup:overview.maintenanceSection")
			}), /* @__PURE__ */ (0, Q.jsx)("div", {
				className: r,
				children: a.filter((e) => e.key !== "batch-delete").map((e) => /* @__PURE__ */ (0, Q.jsx)(wt, {
					tool: e,
					navigate: n
				}, e.key))
			})]
		}),
		/* @__PURE__ */ (0, Q.jsxs)("section", {
			"aria-labelledby": "cleanup-deletion",
			className: "flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, Q.jsx)(j, {
				id: "cleanup-deletion",
				children: Y("cleanup:overview.deletionSection")
			}), /* @__PURE__ */ (0, Q.jsx)("div", {
				className: r,
				children: a.filter((e) => e.key === "batch-delete").map((e) => /* @__PURE__ */ (0, Q.jsx)(wt, {
					tool: e,
					navigate: n
				}, e.key))
			})]
		})
	] });
}
export { jt as DataCleanupPage, xt as DataCleanupToolPage };

//# debugId=cbaab6bb-e39e-40d1-a3da-7be0218edfa3