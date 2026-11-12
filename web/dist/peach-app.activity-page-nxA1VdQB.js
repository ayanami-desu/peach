(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "b62eb987-3fae-4b43-8128-2dab85aac00e", e._sentryDebugIdIdentifier = "sentry-dbid-b62eb987-3fae-4b43-8128-2dab85aac00e");
	} catch {}
})();
import { Button as e, Chip as t, DataTableFooter as n, Disclosure as r, EmptyState as i, Gg as a, HN as o, IssueRow as s, LinkButton as c, Lo as l, LoadingDots as u, Ma as d, NameLink as f, Note as p, OV as m, Pf as h, ProcessingMode as g, Progress as _, RB as v, Rk as y, Su as b, TASKS_KEY as x, TRIGGER_LABELS as S, Xl as C, __toESM as w, apiGet as T, apiSend as E, busyProps as D, cardClass as O, confirmModal as k, controlTask as A, cx as ee, elapsedText as j, errorMessage as M, fetchTasks as te, foldByKind as ne, foldRoutine as re, followupDetail as ie, followupTally as N, groupFollowups as ae, hasResultProblems as P, i2 as oe, isActive as F, isRoutine as se, latestOfKind as ce, momentText as I, notifyManager as le, oe as ue, pollInterval as de, problemDestination as fe, progressText as L, readableErrorHeadline as R, replaceEqualDeep as pe, require_jsx_runtime as me, require_react as he, setTaskSpeed as ge, statusLabel as _e, summaryItems as ve, taskIssues as ye, taskSubject as z, um as be, uo as xe, useMutation as B, useQuery as V, useQueryClient as H, vl as Se } from "./peach-app.js";
import { CodeBlock as U } from "./peach-app.code-block-5D8eSV-F.js";
import { Page as W } from "./peach-app.page-QAncjzM1.js";
import { ErrorDetails as G, ErrorExcerpt as Ce } from "./peach-app.error-excerpt-B8v2xEIP.js";
// node_modules/@tanstack/react-query/build/modern/useMutationState.js
var K = /* @__PURE__ */ w(he(), 1);
function we() {
	let e;
	return (t, n) => {
		let r = [], i;
		return () => {
			let a = t.findAll(n.filters), o = a.flatMap((e) => [e, e.state]);
			return (!i || o.length !== r.length || o.some((e, t) => !Object.is(e, r[t]))) && (r = o, i = pe(e, a.map((e) => n.select ? n.select(e) : e.state)), e = i), i;
		};
	};
}
function Te(e = {}, t) {
	let n = H(t).getMutationCache(), [r] = K.useState(() => we()), i = r(n, e);
	return K.useSyncExternalStore(K.useCallback((e) => n.subscribe(le.batchCalls(e)), [n]), i, i);
}
// src/react/activity/background-issues.tsx
var q = me(), J = ["background-issues"];
function Ee() {
	let e = (0, K.useId)(), t = V({
		queryKey: J,
		queryFn: ({ signal: e }) => T("/api/background-issues", e),
		refetchInterval: 3e4
	}).data?.issues || [];
	return t.length ? /* @__PURE__ */ (0, q.jsxs)("section", {
		"aria-labelledby": e,
		className: "flex min-w-0 flex-col gap-3",
		children: [/* @__PURE__ */ (0, q.jsx)("h3", {
			id: e,
			className: "text-title-2-medium text-text-primary",
			children: "需要处理"
		}), /* @__PURE__ */ (0, q.jsx)("ul", {
			className: "flex min-w-0 flex-col gap-3",
			children: t.map((e) => /* @__PURE__ */ (0, q.jsx)("li", { children: /* @__PURE__ */ (0, q.jsx)(De, { issue: e }) }, e.key))
		})]
	}) : null;
}
function De({ issue: t }) {
	let n = H(), r = B({
		mutationFn: () => E(t.retry, {}),
		onSuccess: () => {
			n.invalidateQueries({ queryKey: J });
		}
	}), i = t.since ? `自 ${I(t.since)} 起` : `发现于 ${I(t.noticed_at)}`;
	return /* @__PURE__ */ (0, q.jsx)(p, {
		tone: "error",
		title: t.title,
		action: /* @__PURE__ */ (0, q.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, q.jsx)(c, {
				href: t.href,
				size: "small",
				trailingIcon: oe,
				children: t.link_label
			}), t.retry ? /* @__PURE__ */ (0, q.jsx)(e, {
				variant: "secondary",
				size: "small",
				disabled: !t.retry_available,
				...D(r.isPending),
				onClick: () => r.mutate(),
				children: "立即重试"
			}) : null]
		}),
		children: r.error ? `${i}\n没有重试：${M(r.error)}` : i
	});
}
// src/react/activity/task-controls.tsx
var Y = ["task-control"], Oe = {
	pause: m,
	resume: a,
	cancel: o
}, ke = {
	pause: "暂停",
	resume: "继续",
	cancel: "取消"
}, Ae = {
	pause: "暂停后续任务",
	resume: "继续后续任务",
	cancel: "取消后续任务"
};
function je() {
	let e = Te({
		filters: { mutationKey: Y },
		select: (e) => ({
			id: e.mutationId,
			command: e.state.variables,
			status: e.state.status,
			error: e.state.error
		})
	}), t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = n.command;
		if (!e) continue;
		let r = t.get(e.id);
		(!r || r.id < n.id) && t.set(e.id, {
			...n,
			command: e
		});
	}
	let n = [...t.values()].filter((e) => e.status === "error");
	return n.length ? /* @__PURE__ */ (0, q.jsx)("div", {
		"data-task-control-feedback": "",
		className: "flex min-w-0 flex-col gap-2",
		children: n.map(({ command: e, error: t }) => /* @__PURE__ */ (0, q.jsx)(p, {
			tone: "error",
			title: `${e.label}：${(e.followups ? Ae : ke)[e.action]}未完成`,
			children: M(t)
		}, e.id))
	}) : null;
}
function Me({ run: t, runs: n = [t] }) {
	let r = H(), i = (0, K.useRef)({
		change: !1,
		cancel: !1,
		confirmation: !1
	}), a = () => {
		r.invalidateQueries({ queryKey: x });
	}, o = async (e) => {
		let t = null;
		for (let r of n) try {
			await A(r.id, e.action);
		} catch (e) {
			t ??= e;
		}
		if (t !== null) throw t;
	}, s = n.length > 1 ? `这 ${n.length} 批` : "这轮", c = B({
		mutationKey: [
			...Y,
			t.id,
			"change"
		],
		mutationFn: o,
		onSettled: () => {
			i.current.change = !1, a();
		}
	}), l = B({
		mutationKey: [
			...Y,
			t.id,
			"cancel"
		],
		mutationFn: o,
		onSettled: () => {
			i.current.cancel = !1, a();
		}
	}), u = B({
		mutationFn: async (e) => {
			let t = (await Promise.allSettled(n.map((t) => ge(t.id, e)))).find((e) => e.status === "rejected");
			if (t?.status === "rejected") throw t.reason;
		},
		onSettled: a
	}), d = (t.control?.actions || []).filter((e) => e !== "set_speed"), f = !!(t.control?.actions.includes("set_speed") && t.control.speed_mode), m = !F(t), h = l.isPending || l.isSuccess;
	if (!d.length && !f) return null;
	let _ = (e) => {
		let n = {
			id: t.id,
			label: t.task_label,
			action: e,
			followups: m
		};
		if (e === "cancel") {
			if (i.current.cancel || i.current.confirmation || l.isSuccess) return;
			i.current.confirmation = !0, k({
				title: m ? `取消「${t.task_label}」的全部后续任务` : `取消任务「${t.task_label}」`,
				body: m ? `将停止${s}已派出的全部后续任务，包括正在处理和排队的项目。已保存的资料和结果会保留。这些后续任务取消后不能继续，需要时重新发起。` : "将停止这轮剩余的处理及其后续任务。已保存的资料和结果会保留。这轮任务取消后不能继续，需要时重新发起。",
				confirmLabel: m ? "取消后续任务" : "取消任务",
				danger: !0,
				onConfirm: async () => (i.current.cancel = !0, await l.mutateAsync(n))
			}).finally(() => {
				i.current.confirmation = !1;
			});
		} else {
			if (i.current.change || i.current.cancel || h) return;
			i.current.change = !0, c.mutate(n);
		}
	};
	return /* @__PURE__ */ (0, q.jsxs)("div", {
		className: "ml-auto min-w-0",
		"data-task-controls": t.id,
		children: [/* @__PURE__ */ (0, q.jsxs)("div", {
			role: "group",
			"aria-label": `${t.task_label}${m ? "后续任务" : "任务"}控制`,
			className: "flex flex-wrap items-center justify-end gap-2",
			children: [f ? /* @__PURE__ */ (0, q.jsx)(g, {
				value: t.control.speed_mode,
				busy: u.isPending || h,
				animate: t.control?.state === "running",
				onChange: (e) => u.mutate(e)
			}) : null, d.map((t) => {
				let n = (m ? Ae : ke)[t], r = t === "cancel" ? l.isPending : c.isPending && c.variables?.action === t, i = t === "cancel" ? h : c.isPending || h;
				return /* @__PURE__ */ (0, q.jsx)(e, {
					type: "button",
					variant: "secondary",
					size: "small",
					iconOnly: !0,
					leadingIcon: Oe[t],
					"aria-label": n,
					title: n,
					...D(r),
					"aria-disabled": i || void 0,
					onClick: () => _(t),
					"data-tooltip-copy-key": `tasks.control.action.${m ? "followups." : ""}${t}`
				}, t);
			})]
		}), u.error ? /* @__PURE__ */ (0, q.jsx)(p, {
			tone: "error",
			children: M(u.error)
		}) : null]
	});
}
// src/react/activity/task-icon.tsx
var Ne = new Map([
	[y, [
		"library-processing",
		"organize",
		"batch",
		"resource-scan",
		"resource-apply",
		"seed-import"
	]],
	[Se, ["scrape-codes", "upgrade-library"]],
	[d, [
		"scraping-cover",
		"jav-covers",
		"code-samples",
		"timeline-thumbnails",
		"entity-avatar"
	]],
	[h, [
		"performer-profile",
		"performer-alias",
		"creator-identity",
		"studio-mark"
	]],
	[C, ["media-repair", "mp4-header-repair"]],
	[be, ["link-check", "link-prune"]],
	[ue, ["download-postprocess"]],
	[l, ["taste-refresh"]],
	[v, [
		"upgrade-repairs",
		"diagnostic-export",
		"amane-bridge",
		"face-models",
		"ledger-backup",
		"ledger-restore"
	]]
].flatMap(([e, t]) => t.map((t) => [t, e])));
function Pe({ taskKey: e, className: t }) {
	let n = Ne.get(e) ?? b;
	return /* @__PURE__ */ (0, q.jsx)(n, {
		className: t,
		"aria-hidden": !0
	});
}
// src/react/activity/resource-chip.tsx
var Fe = {
	blue: "bg-status-blue-text text-background-primary-default",
	purple: "bg-status-purple-text text-background-primary-default",
	cyan: "bg-status-cyan-text text-background-primary-default"
};
function Ie({ color: e, high: n, ...r }) {
	return n ? /* @__PURE__ */ (0, q.jsx)("span", {
		...r,
		className: ee("inline-flex items-center justify-center rounded-md px-1.5 py-1 whitespace-nowrap text-caption-1-medium", Fe[e])
	}) : /* @__PURE__ */ (0, q.jsx)(t, {
		variant: "caption",
		color: e,
		...r
	});
}
// src/react/activity/task-resources.tsx
function Le(e) {
	return e.state === "sampling" ? "采样中" : "未取得";
}
function Re(e) {
	return e === 0 ? "未使用" : `${e.toLocaleString(void 0, { maximumFractionDigits: 1 })}%`;
}
function ze({ run: e, active: t = F(e) || !!e.control }) {
	if (!t || !e.resources) return null;
	let { cpu: n } = e.resources, r = n.percent, i = n.state === "ready" && r !== null, a = i && n.high, o = i ? Re(r) : Le(n), s = [n.reason, a ? "当前为高占用。" : ""].filter(Boolean).join("\n");
	return /* @__PURE__ */ (0, q.jsx)("div", {
		"data-task-resources": e.id,
		className: "flex min-w-0 flex-wrap items-center gap-2",
		children: /* @__PURE__ */ (0, q.jsxs)(Ie, {
			color: "blue",
			high: a,
			tabIndex: s ? 0 : void 0,
			title: s || void 0,
			"data-task-resource": "cpu",
			"data-resource-state": n.state,
			"data-resource-high": a || void 0,
			"data-resource-idle": i && r === 0 || void 0,
			"data-copy-ignore": "",
			children: ["CPU ", o]
		})
	});
}
// src/react/activity/activity-page.tsx
var Be = /* @__PURE__ */ new Set(["upgrade-repairs"]), Ve = /* @__PURE__ */ new Set(["asset_id", "name"]), He = {
	succeeded: "lime",
	failed: "rose",
	cancelled: "rose",
	interrupted: "yellow",
	running: "blue",
	pending: "neutral"
}, Ue = {
	running: "进行中",
	pausing: "正在暂停",
	paused: "已暂停",
	cancelling: "正在取消"
};
function X({ run: e }) {
	let n = e.control?.state;
	if (n && (n !== "running" || !F(e))) return /* @__PURE__ */ (0, q.jsx)(t, {
		color: n === "running" ? "blue" : "neutral",
		children: /* @__PURE__ */ (0, q.jsx)("span", {
			"data-copy-key": `tasks.control.state.${n}`,
			children: Ue[n]
		})
	});
	let r = e.status === "failed" && e.task_key === "library-processing" && e.result_summary?.outcome === "partial", i = r || e.status === "succeeded" && P(e);
	return /* @__PURE__ */ (0, q.jsx)(t, {
		color: i ? "yellow" : He[e.status] ?? "neutral",
		children: r ? "部分项目需处理" : i ? "发现问题" : _e(e.status)
	});
}
function We({ rows: e }) {
	let [t, i] = (0, K.useState)({
		pageIndex: 0,
		pageSize: 20
	}), { pageSize: a } = t, o = Math.min(t.pageIndex, Math.max(0, Math.ceil(e.length / a) - 1));
	return /* @__PURE__ */ (0, q.jsxs)(q.Fragment, { children: [/* @__PURE__ */ (0, q.jsx)("ul", {
		className: "-mr-5 flex min-w-0 flex-col",
		children: e.slice(o * a, (o + 1) * a).map((e) => {
			let t = ie(e);
			return /* @__PURE__ */ (0, q.jsxs)("li", {
				"data-status": e.status,
				"data-followup-key": e.followup_key,
				className: "flex min-w-0 flex-col gap-1 border-t border-separator-border py-2.5 pr-10 pl-5",
				children: [
					/* @__PURE__ */ (0, q.jsxs)("div", {
						className: "flex min-w-0 flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, q.jsxs)("div", {
							className: "flex min-w-0 flex-1 basis-40 flex-wrap items-center gap-x-2 gap-y-1",
							children: [
								/* @__PURE__ */ (0, q.jsx)(Pe, {
									taskKey: e.task_key,
									className: "size-4 shrink-0 text-text-secondary"
								}),
								/* @__PURE__ */ (0, q.jsx)("span", {
									className: "min-w-0 break-words text-caption-1-regular text-text-primary",
									children: e.task_label
								}),
								/* @__PURE__ */ (0, q.jsx)(X, { run: e }),
								t ? /* @__PURE__ */ (0, q.jsx)("span", {
									className: "min-w-0 break-words text-caption-1-regular text-text-secondary",
									children: t
								}) : null
							]
						}), /* @__PURE__ */ (0, q.jsx)(Me, { run: e })]
					}),
					/* @__PURE__ */ (0, q.jsx)(ze, { run: e }),
					Object.keys(e.result_summary || {}).length ? /* @__PURE__ */ (0, q.jsx)("div", {
						className: "w-full min-w-0",
						children: /* @__PURE__ */ (0, q.jsx)(r, {
							summary: "技术详情",
							contentClassName: "pb-2.5",
							children: /* @__PURE__ */ (0, q.jsx)(U, {
								code: JSON.stringify(e.result_summary, null, 2),
								language: "json",
								label: `${e.task_label}技术详情`
							})
						})
					}) : null
				]
			}, e.id);
		})
	}), /* @__PURE__ */ (0, q.jsx)(n, {
		label: "任务明细",
		total: e.length,
		pagination: {
			...t,
			pageIndex: o
		},
		onChange: i
	})] });
}
function Z({ run: e, meta: t, children: n, error: i, issues: a, followups: o, followupTotal: s = 0, badge: c, resourceActive: l, controlled: u }) {
	let [d, m] = (0, K.useState)(!!o?.some(F)), h = (u || [e]).map((e) => e.id), g = s > (o?.length || 0), _ = V({
		queryKey: [
			...x,
			"followups",
			h
		],
		enabled: d && g,
		queryFn: async ({ signal: e }) => (await Promise.all(h.map((t) => T(`/api/tasks/${t}`, e)))).flatMap((e) => e.followups),
		refetchInterval: l ? 2e3 : !1
	}), v = (e) => e.status === "running" ? 3 : e.status === "pending" ? 2 : +(e.status === "failed" || e.status === "interrupted"), y = [...(g ? _.data : void 0) || o || []].sort((e, t) => v(t) - v(e) || t.id - e.id), b = y.length, S = Math.max(o?.length || 0, s), C = z(e), w = String(i || "").trim(), E = R(w);
	return /* @__PURE__ */ (0, q.jsxs)("li", {
		id: `run-${e.id}`,
		"data-status": e.status,
		"data-task-key": e.task_key,
		"data-run-id": e.id,
		className: O({
			padding: "none",
			bordered: e.status === "failed" ? "error" : void 0,
			className: "flex flex-col"
		}),
		children: [
			/* @__PURE__ */ (0, q.jsxs)("div", {
				className: "flex flex-col gap-2 px-5 py-4",
				children: [
					/* @__PURE__ */ (0, q.jsxs)("div", {
						className: "flex min-w-0 flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, q.jsxs)("div", {
							className: "flex min-w-0 flex-1 basis-48 flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, q.jsx)(Pe, {
									taskKey: e.task_key,
									className: "size-5 shrink-0 text-text-secondary"
								}),
								/* @__PURE__ */ (0, q.jsx)("strong", {
									className: "min-w-0 break-words text-title-3-medium text-text-primary",
									children: e.task_label
								}),
								c ?? /* @__PURE__ */ (0, q.jsx)(X, { run: e })
							]
						}), /* @__PURE__ */ (0, q.jsx)(Me, {
							run: e,
							runs: u
						})]
					}),
					/* @__PURE__ */ (0, q.jsx)("p", {
						className: "text-caption-1-regular text-text-secondary",
						children: t
					}),
					/* @__PURE__ */ (0, q.jsx)(ze, {
						run: e,
						active: l
					}),
					C ? /* @__PURE__ */ (0, q.jsx)(f, {
						href: C.href,
						"data-task-subject": e.id,
						title: C.label,
						className: "min-w-0 max-w-full self-start truncate text-text-primary",
						children: C.label
					}) : null,
					E ? /* @__PURE__ */ (0, q.jsx)("p", {
						"data-task-error": "",
						className: "text-caption-1-regular text-text-secondary wrap-anywhere",
						children: E
					}) : null,
					n
				]
			}),
			a ? /* @__PURE__ */ (0, q.jsx)("div", {
				className: "border-t border-separator-border",
				children: a
			}) : null,
			E && w !== E ? /* @__PURE__ */ (0, q.jsx)("div", {
				className: "border-t border-separator-border",
				children: /* @__PURE__ */ (0, q.jsx)(r, {
					row: !0,
					summary: "错误详情",
					contentClassName: "pb-5",
					children: /* @__PURE__ */ (0, q.jsx)(G, {
						label: `${e.task_label}错误详情`,
						children: w
					})
				})
			}) : null,
			S ? /* @__PURE__ */ (0, q.jsx)("div", {
				className: "border-t border-separator-border",
				children: /* @__PURE__ */ (0, q.jsxs)(r, {
					row: !0,
					summary: `任务明细 · ${S.toLocaleString()} 项`,
					contentClassName: "pb-5",
					isOpen: d,
					onOpenChange: m,
					children: [
						_.error ? /* @__PURE__ */ (0, q.jsx)(p, {
							tone: "error",
							children: M(_.error)
						}) : null,
						b < S ? /* @__PURE__ */ (0, q.jsxs)("p", {
							className: "text-caption-1-regular text-text-secondary",
							children: [
								"列出其中 ",
								b.toLocaleString(),
								" 项"
							]
						}) : null,
						/* @__PURE__ */ (0, q.jsx)(We, { rows: y })
					]
				})
			}) : null,
			Object.keys(e.result_summary || {}).some((e) => !(C && Ve.has(e))) ? /* @__PURE__ */ (0, q.jsx)("div", {
				className: "border-t border-separator-border",
				children: /* @__PURE__ */ (0, q.jsx)(r, {
					row: !0,
					summary: "技术详情",
					contentClassName: "pb-5",
					children: /* @__PURE__ */ (0, q.jsx)(U, {
						code: JSON.stringify(e.result_summary, null, 2),
						language: "json",
						label: `${e.task_label}技术详情`
					})
				})
			}) : null
		]
	});
}
function Ge({ run: e, followups: t, followupTotal: n }) {
	let r = e.progress_total || 0, i = e.progress_current || 0, a = e.control?.state, o = a && a !== "running", s = o ? Ue[a] : e.progress_label || "正在进行", c = j(e.elapsed_seconds), l = [S[e.trigger] || e.trigger, c && `已跑 ${c}`].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, q.jsx)(Z, {
		run: e,
		meta: l,
		followups: t,
		followupTotal: n,
		children: r > 0 ? /* @__PURE__ */ (0, q.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ (0, q.jsx)(_, {
				label: s,
				value: Math.min(i, r),
				max: r
			}), /* @__PURE__ */ (0, q.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary wrap-anywhere",
				children: [
					s,
					" · ",
					L(i, r),
					" 项"
				]
			})]
		}) : o ? /* @__PURE__ */ (0, q.jsx)("p", {
			"data-copy-key": `tasks.control.state.${a}`,
			className: "text-caption-1-regular text-text-secondary",
			children: s
		}) : /* @__PURE__ */ (0, q.jsx)(u, { label: s })
	});
}
function Ke({ run: e, followups: n, runs: i, latest: a, followupTotal: o, followupFailed: l = 0, followupCancelled: u = 0 }) {
	let d = !!(i && i.length > 1 && o), f = d ? [`共处理 ${o.toLocaleString()} 项`, l ? `其中 ${l.toLocaleString()} 项失败` : ""].filter(Boolean) : ve(z(e) ? {
		...e.result_summary,
		name: ""
	} : e.result_summary).filter((t) => t !== e.error && t !== R(e.error)), p = ye(e), m = fe(e, a), h = j(e.elapsed_seconds), g = i && i.length > 1 ? i[i.length - 1] : void 0, _ = (g ? [
		S[e.trigger] || e.trigger,
		`近 ${i.length} 轮`,
		`${I(g.finished_at)} – ${I(e.finished_at)}`
	] : [
		S[e.trigger] || e.trigger,
		I(e.finished_at),
		h && `用时 ${h}`
	]).filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, q.jsxs)(Z, {
		run: e,
		meta: _,
		error: e.error,
		followups: n,
		followupTotal: o,
		controlled: i,
		issues: p.length ? /* @__PURE__ */ (0, q.jsx)(r, {
			row: !0,
			summary: `问题详情 · ${p.length} 项`,
			contentClassName: "pb-5",
			children: /* @__PURE__ */ (0, q.jsx)(G, {
				label: "任务问题详情",
				children: /* @__PURE__ */ (0, q.jsx)("ul", {
					className: "flex min-w-0 flex-col whitespace-normal",
					"data-task-issues": "",
					children: p.map((e, t) => /* @__PURE__ */ (0, q.jsx)(s, {
						title: /* @__PURE__ */ (0, q.jsxs)(q.Fragment, { children: [e.label, e.provider || e.kind ? /* @__PURE__ */ (0, q.jsxs)("span", {
							className: "text-body-2-regular text-text-secondary",
							children: [" · ", [e.provider, e.kind].filter(Boolean).join(" · ")]
						}) : null] }),
						children: /* @__PURE__ */ (0, q.jsx)(Ce, {
							text: e.error,
							className: "text-caption-1-regular text-text-secondary"
						})
					}, `${e.source}-${t}`))
				})
			})
		}) : void 0,
		badge: u && e.status === "succeeded" ? /* @__PURE__ */ (0, q.jsx)(t, {
			color: "rose",
			children: /* @__PURE__ */ (0, q.jsx)("span", {
				"data-copy-key": `tasks.followups.cancelled.${u === o ? "all" : "partial"}`,
				children: u === o ? "后续任务已取消" : "部分后续任务已取消"
			})
		}) : d && l ? /* @__PURE__ */ (0, q.jsx)(t, {
			color: "yellow",
			children: "发现问题"
		}) : void 0,
		children: [
			u ? /* @__PURE__ */ (0, q.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary",
				children: [
					"后续任务已取消 ",
					u.toLocaleString(),
					" 项"
				]
			}) : null,
			f.length === 1 ? /* @__PURE__ */ (0, q.jsx)("p", {
				className: "text-caption-1-regular text-text-secondary wrap-anywhere",
				children: f[0]
			}) : f.length ? /* @__PURE__ */ (0, q.jsx)("ul", {
				className: "flex list-disc flex-col gap-1 pl-5 text-caption-1-regular text-text-secondary wrap-anywhere",
				children: f.map((e, t) => /* @__PURE__ */ (0, q.jsx)("li", { children: e }, t))
			}) : null,
			m ? /* @__PURE__ */ (0, q.jsx)(c, {
				href: m.href,
				size: "small",
				trailingIcon: oe,
				className: "self-start",
				children: m.label
			}) : null
		]
	});
}
function qe({ runs: e, followups: n, counts: r }) {
	let i = e[0], a = e[e.length - 1], o = N(r, e), s = Math.max(o.total, n.length), c = o.total ? o.settled : n.filter((e) => !F(e)).length, l = o.total ? o.failed : n.filter((e) => e.status === "failed" || e.status === "interrupted").length, u = [
		S[i.trigger] || i.trigger,
		e.length > 1 ? `${e.length} 批` : "",
		`${I(a.started_at || a.finished_at)} 开始`
	].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, q.jsx)(Z, {
		run: i,
		meta: u,
		followups: n,
		followupTotal: s,
		resourceActive: !0,
		controlled: e,
		badge: i.control ? /* @__PURE__ */ (0, q.jsx)(X, { run: i }) : /* @__PURE__ */ (0, q.jsx)(t, {
			color: "blue",
			children: "进行中"
		}),
		children: /* @__PURE__ */ (0, q.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ (0, q.jsx)(_, {
				label: `${i.task_label}进度`,
				value: c,
				max: s
			}), /* @__PURE__ */ (0, q.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary",
				children: [
					"已处理 ",
					L(c, s),
					" 项",
					l ? ` · 其中 ${l.toLocaleString()} 项失败` : ""
				]
			})]
		})
	});
}
function Q({ title: e, children: t }) {
	let n = (0, K.useId)();
	return /* @__PURE__ */ (0, q.jsxs)("section", {
		"aria-labelledby": n,
		className: "flex min-w-0 flex-col gap-3",
		children: [/* @__PURE__ */ (0, q.jsx)("h3", {
			id: n,
			className: "text-title-2-medium text-text-primary",
			children: e
		}), t]
	});
}
function $({ live: e = !1, paginate: t = !0, children: r }) {
	let [i, a] = (0, K.useState)({
		pageIndex: 0,
		pageSize: 20
	}), o = K.Children.toArray(r), { pageSize: s } = i, c = Math.min(i.pageIndex, Math.max(0, Math.ceil(o.length / s) - 1));
	return /* @__PURE__ */ (0, q.jsxs)(q.Fragment, { children: [/* @__PURE__ */ (0, q.jsx)("ul", {
		"aria-live": e ? "polite" : void 0,
		className: "flex min-w-0 flex-col gap-3",
		children: t ? o.slice(c * s, (c + 1) * s) : o
	}), t ? /* @__PURE__ */ (0, q.jsx)(n, {
		label: "任务列表",
		total: o.length,
		pagination: {
			...i,
			pageIndex: c
		},
		onChange: a
	}) : null] });
}
function Je() {
	let [e, t] = (0, K.useState)(1), [r, a] = (0, K.useState)(20), o = V({
		queryKey: e === 1 && r === 20 ? x : [
			...x,
			"page",
			e,
			r
		],
		queryFn: ({ signal: t }) => te(t, e, r),
		refetchInterval: (e) => de(e.state.data),
		placeholderData: (e) => e
	}), [s, c] = (0, K.useState)(o.data);
	o.data && o.data !== s && c(o.data);
	let l = o.data || s, u = o.error ? M(o.error) : "";
	if (!l) return /* @__PURE__ */ (0, q.jsx)(W, { children: /* @__PURE__ */ (0, q.jsx)(p, {
		tone: "error",
		children: u || "读取任务中心失败"
	}) });
	let d = l.finished || [], f = l.working_parents || [], m = [
		...l.running || [],
		...l.skipped || [],
		...d,
		...f
	], h = ae(m), g = new Set(m.map((e) => e.id)), _ = (e) => e.filter((e) => !(e.followup_key && e.parent_run_id != null && g.has(e.parent_run_id))), v = _(d), y = l.followup_counts || {}, b = (e) => e.flatMap((e) => h.get(e.id) || []), S = [...v, ..._(f)].filter((e) => N(y, [e]).active > 0 || h.get(e.id)?.some(F)).sort((e, t) => t.id - e.id), C = _(l.running || []), w = _(l.skipped || []), T = v.filter((e) => !S.includes(e) && !w.some((t) => t.id === e.id)), E = (e) => (h.get(e.id) || []).every((e) => e.status === "succeeded" && !P(e)) && N(y, [e]).failed === 0, D = re(T, (e) => se(e) && (E(e) || Be.has(e.task_key))), O = ne(S, (e) => e.control?.state || "").sort((e, t) => t.run.id - e.run.id), k = ce(m), A = !C.length && !S.length && !w.length && !T.length;
	return /* @__PURE__ */ (0, q.jsxs)(W, { children: [
		u ? /* @__PURE__ */ (0, q.jsx)(p, {
			tone: "error",
			children: u
		}) : null,
		/* @__PURE__ */ (0, q.jsx)(je, {}),
		l.available === !1 ? /* @__PURE__ */ (0, q.jsx)(p, {
			tone: "warning",
			children: l.message || "数据库尚未准备好任务记录表"
		}) : null,
		/* @__PURE__ */ (0, q.jsx)(Ee, {}),
		A ? /* @__PURE__ */ (0, q.jsx)(i, {
			icon: xe,
			title: "还没有任务记录",
			children: "扫描、追更检查、批量操作和命令行批处理跑起来之后，这里会显示它们的进度与结果。"
		}) : /* @__PURE__ */ (0, q.jsxs)(q.Fragment, { children: [
			/* @__PURE__ */ (0, q.jsx)(Q, {
				title: "正在进行",
				children: C.length || S.length ? /* @__PURE__ */ (0, q.jsxs)($, {
					live: !0,
					children: [C.map((e) => /* @__PURE__ */ (0, q.jsx)(Ge, {
						run: e,
						followups: h.get(e.id),
						followupTotal: N(y, [e]).total
					}, e.id)), O.map(({ run: e, runs: t }) => /* @__PURE__ */ (0, q.jsx)(qe, {
						runs: t,
						followups: b(t),
						counts: y
					}, e.id))]
				}) : /* @__PURE__ */ (0, q.jsx)(p, {
					tone: "neutral",
					children: "没有任务在跑。"
				})
			}),
			w.length ? /* @__PURE__ */ (0, q.jsx)(Q, {
				title: "本次未执行",
				children: /* @__PURE__ */ (0, q.jsx)($, { children: w.map((e) => /* @__PURE__ */ (0, q.jsx)(Ke, {
					run: e,
					latest: k.has(e.id),
					followups: h.get(e.id)
				}, e.id)) })
			}) : null,
			T.length || l.finished_total ? /* @__PURE__ */ (0, q.jsxs)(Q, {
				title: "最近完成",
				children: [T.length ? /* @__PURE__ */ (0, q.jsx)($, {
					paginate: !1,
					children: D.map(({ run: e, runs: t }) => {
						let n = N(y, t);
						return /* @__PURE__ */ (0, q.jsx)(Ke, {
							run: e,
							runs: t,
							latest: k.has(e.id),
							followups: b(t),
							followupTotal: n.total,
							followupFailed: n.failed,
							followupCancelled: n.cancelled
						}, e.id);
					})
				}) : null, /* @__PURE__ */ (0, q.jsx)(n, {
					label: "最近完成",
					total: l.finished_total ?? v.length,
					unit: "轮任务",
					pageUnit: "轮",
					pagination: {
						pageIndex: (l.finished_page || e) - 1,
						pageSize: r
					},
					onChange: (n) => {
						n.pageIndex + 1 === e && n.pageSize === r ? o.refetch() : (t(n.pageIndex + 1), a(n.pageSize));
					}
				})]
			}) : null
		] })
	] });
}
export { Je as ActivityPage };

//# debugId=b62eb987-3fae-4b43-8128-2dab85aac00e