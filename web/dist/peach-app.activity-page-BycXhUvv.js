(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "8820e079-f352-4979-9ec7-a12141ff92cd", e._sentryDebugIdIdentifier = "sentry-dbid-8820e079-f352-4979-9ec7-a12141ff92cd");
	} catch {}
})();
import { Button as e, Chip as t, DataTableFooter as n, Disclosure as r, EmptyState as i, Gg as a, HN as o, IssueRow as s, LinkButton as c, Lo as l, LoadingDots as u, M6 as d, Ma as f, NameLink as p, Note as m, OV as h, Pf as g, ProcessingMode as _, Progress as v, RB as y, Rk as b, Su as x, TASKS_KEY as S, TRIGGER_LABELS as C, Xl as w, __toESM as T, apiGet as E, apiSend as D, busyProps as O, cardClass as k, clearFinishedTasks as ee, confirmModal as A, controlTask as j, cx as M, deleteTask as te, elapsedText as N, errorMessage as P, fetchTasks as ne, foldByKind as re, foldRoutine as ie, followupDetail as F, followupTally as I, groupFollowups as ae, hasResultProblems as oe, i2 as L, isActive as R, isRoutine as se, latestOfKind as ce, momentText as z, notifyManager as le, oe as ue, pollInterval as de, problemDestination as fe, progressText as pe, readableErrorHeadline as me, replaceEqualDeep as he, require_jsx_runtime as ge, require_react as _e, setTaskSpeed as ve, statusLabel as ye, summaryItems as be, t as B, taskIssues as xe, taskSubject as V, um as Se, uo as Ce, useMutation as H, useQuery as U, useQueryClient as W, vl as we } from "./peach-app.js";
import { CodeBlock as Te } from "./peach-app.code-block-5D8eSV-F.js";
import { Page as Ee } from "./peach-app.page-QAncjzM1.js";
import { ErrorDetails as De, ErrorExcerpt as Oe } from "./peach-app.error-excerpt-B8v2xEIP.js";
// ../../../peach/frontend/node_modules/@tanstack/react-query/build/modern/useMutationState.js
var G = /* @__PURE__ */ T(_e(), 1);
function ke() {
	let e;
	return (t, n) => {
		let r = [], i;
		return () => {
			let a = t.findAll(n.filters), o = a.flatMap((e) => [e, e.state]);
			return (!i || o.length !== r.length || o.some((e, t) => !Object.is(e, r[t]))) && (r = o, i = he(e, a.map((e) => n.select ? n.select(e) : e.state)), e = i), i;
		};
	};
}
function Ae(e = {}, t) {
	let n = W(t).getMutationCache(), [r] = G.useState(() => ke()), i = r(n, e);
	return G.useSyncExternalStore(G.useCallback((e) => n.subscribe(le.batchCalls(e)), [n]), i, i);
}
// src/react/activity/background-issues.tsx
var K = ge(), q = ["background-issues"];
function je() {
	let e = (0, G.useId)(), t = U({
		queryKey: q,
		queryFn: ({ signal: e }) => E("/api/background-issues", e),
		refetchInterval: 3e4
	}).data?.issues || [];
	return t.length ? /* @__PURE__ */ (0, K.jsxs)("section", {
		"aria-labelledby": e,
		className: "flex min-w-0 flex-col gap-3",
		children: [/* @__PURE__ */ (0, K.jsx)("h3", {
			id: e,
			className: "text-title-2-medium text-text-primary",
			children: "需要处理"
		}), /* @__PURE__ */ (0, K.jsx)("ul", {
			className: "flex min-w-0 flex-col gap-3",
			children: t.map((e) => /* @__PURE__ */ (0, K.jsx)("li", { children: /* @__PURE__ */ (0, K.jsx)(Me, { issue: e }) }, e.key))
		})]
	}) : null;
}
function Me({ issue: t }) {
	let n = W(), r = H({
		mutationFn: () => D(t.retry, {}),
		onSuccess: () => {
			n.invalidateQueries({ queryKey: q });
		}
	}), i = t.since ? `自 ${z(t.since)} 起` : `发现于 ${z(t.noticed_at)}`;
	return /* @__PURE__ */ (0, K.jsx)(m, {
		tone: "error",
		title: t.title,
		action: /* @__PURE__ */ (0, K.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, K.jsx)(c, {
				href: t.href,
				size: "small",
				trailingIcon: L,
				children: t.link_label
			}), t.retry ? /* @__PURE__ */ (0, K.jsx)(e, {
				variant: "secondary",
				size: "small",
				disabled: !t.retry_available,
				...O(r.isPending),
				onClick: () => r.mutate(),
				children: "立即重试"
			}) : null]
		}),
		children: r.error ? `${i}\n没有重试：${P(r.error)}` : i
	});
}
// src/react/activity/task-controls.tsx
var J = ["task-control"], Ne = {
	pause: h,
	resume: a,
	cancel: o
}, Pe = {
	pause: "暂停",
	resume: "继续",
	cancel: "取消"
}, Fe = {
	pause: "暂停后续任务",
	resume: "继续后续任务",
	cancel: "取消后续任务"
};
function Ie() {
	let e = Ae({
		filters: { mutationKey: J },
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
	return n.length ? /* @__PURE__ */ (0, K.jsx)("div", {
		"data-task-control-feedback": "",
		className: "flex min-w-0 flex-col gap-2",
		children: n.map(({ command: e, error: t }) => /* @__PURE__ */ (0, K.jsx)(m, {
			tone: "error",
			title: `${e.label}：${(e.followups ? Fe : Pe)[e.action]}未完成`,
			children: P(t)
		}, e.id))
	}) : null;
}
function Le({ run: t, runs: n = [t], deletable: r = !1, toast: i }) {
	let a = W(), o = (0, G.useRef)({
		change: !1,
		cancel: !1,
		confirmation: !1
	}), s = () => {
		a.invalidateQueries({ queryKey: S });
	}, c = async (e) => {
		let t = null;
		for (let r of n) try {
			await j(r.id, e.action);
		} catch (e) {
			t ??= e;
		}
		if (t !== null) throw t;
	}, l = n.length > 1 ? `这 ${n.length} 批` : "这轮", u = H({
		mutationKey: [
			...J,
			t.id,
			"change"
		],
		mutationFn: c,
		onSettled: () => {
			o.current.change = !1, s();
		}
	}), f = H({
		mutationKey: [
			...J,
			t.id,
			"cancel"
		],
		mutationFn: c,
		onSettled: () => {
			o.current.cancel = !1, s();
		}
	}), p = H({
		mutationFn: async (e) => {
			let t = (await Promise.allSettled(n.map((t) => ve(t.id, e)))).find((e) => e.status === "rejected");
			if (t?.status === "rejected") throw t.reason;
		},
		onSettled: s
	}), h = H({
		mutationFn: async () => {
			let e = (await Promise.allSettled(n.map((e) => te(e.id)))).find((e) => e.status === "rejected");
			if (e?.status === "rejected") throw e.reason;
		},
		onSuccess: () => {
			i?.(B("activity:delete.done")), s();
		}
	}), g = (t.control?.actions || []).filter((e) => e !== "set_speed"), v = !!(t.control?.actions.includes("set_speed") && t.control.speed_mode), y = !R(t), b = f.isPending || f.isSuccess;
	if (!g.length && !v && !r) return null;
	let x = () => {
		h.isPending || A({
			title: B("activity:delete.title"),
			body: B("activity:delete.body", { name: t.task_label }),
			confirmLabel: B("activity:delete.confirm"),
			danger: !0,
			onConfirm: () => h.mutateAsync()
		});
	}, C = (e) => {
		let n = {
			id: t.id,
			label: t.task_label,
			action: e,
			followups: y
		};
		if (e === "cancel") {
			if (o.current.cancel || o.current.confirmation || f.isSuccess) return;
			o.current.confirmation = !0, A({
				title: y ? `取消「${t.task_label}」的全部后续任务` : `取消任务「${t.task_label}」`,
				body: y ? `将停止${l}已派出的全部后续任务，包括正在处理和排队的项目。已保存的资料和结果会保留。这些后续任务取消后不能继续，需要时重新发起。` : "将停止这轮剩余的处理及其后续任务。已保存的资料和结果会保留。这轮任务取消后不能继续，需要时重新发起。",
				confirmLabel: y ? "取消后续任务" : "取消任务",
				danger: !0,
				onConfirm: async () => (o.current.cancel = !0, await f.mutateAsync(n))
			}).finally(() => {
				o.current.confirmation = !1;
			});
		} else {
			if (o.current.change || o.current.cancel || b) return;
			o.current.change = !0, u.mutate(n);
		}
	};
	return /* @__PURE__ */ (0, K.jsxs)("div", {
		className: "ml-auto min-w-0",
		"data-task-controls": t.id,
		children: [
			/* @__PURE__ */ (0, K.jsxs)("div", {
				role: "group",
				"aria-label": `${t.task_label}${y ? "后续任务" : "任务"}控制`,
				className: "flex flex-wrap items-center justify-end gap-2",
				children: [
					v ? /* @__PURE__ */ (0, K.jsx)(_, {
						value: t.control.speed_mode,
						busy: p.isPending || b,
						animate: t.control?.state === "running",
						onChange: (e) => p.mutate(e)
					}) : null,
					g.map((t) => {
						let n = (y ? Fe : Pe)[t], r = t === "cancel" ? f.isPending : u.isPending && u.variables?.action === t, i = t === "cancel" ? b : u.isPending || b;
						return /* @__PURE__ */ (0, K.jsx)(e, {
							type: "button",
							variant: "secondary",
							size: "small",
							iconOnly: !0,
							leadingIcon: Ne[t],
							"aria-label": n,
							title: n,
							...O(r),
							"aria-disabled": i || void 0,
							onClick: () => C(t),
							"data-tooltip-copy-key": `tasks.control.action.${y ? "followups." : ""}${t}`
						}, t);
					}),
					r ? /* @__PURE__ */ (0, K.jsx)(e, {
						type: "button",
						variant: "secondary",
						size: "small",
						iconOnly: !0,
						leadingIcon: d,
						"aria-label": B("activity:delete.action"),
						title: B("activity:delete.action"),
						...O(h.isPending),
						onClick: x,
						"data-tooltip-copy-key": "tasks.delete"
					}) : null
				]
			}),
			p.error ? /* @__PURE__ */ (0, K.jsx)(m, {
				tone: "error",
				children: P(p.error)
			}) : null,
			h.error ? /* @__PURE__ */ (0, K.jsx)(m, {
				tone: "error",
				children: P(h.error)
			}) : null
		]
	});
}
// src/react/activity/task-icon.tsx
var Re = new Map([
	[b, [
		"library-processing",
		"organize",
		"batch",
		"resource-scan",
		"resource-apply",
		"seed-import"
	]],
	[we, ["scrape-codes", "upgrade-library"]],
	[f, [
		"scraping-cover",
		"jav-covers",
		"code-samples",
		"timeline-thumbnails",
		"entity-avatar"
	]],
	[g, [
		"performer-profile",
		"performer-alias",
		"creator-identity",
		"studio-mark"
	]],
	[w, ["media-repair", "mp4-header-repair"]],
	[Se, ["link-check", "link-prune"]],
	[ue, ["download-postprocess"]],
	[l, ["taste-refresh"]],
	[y, [
		"upgrade-repairs",
		"diagnostic-export",
		"amane-bridge",
		"face-models",
		"ledger-backup",
		"ledger-restore"
	]]
].flatMap(([e, t]) => t.map((t) => [t, e])));
function ze({ taskKey: e, className: t }) {
	let n = Re.get(e) ?? x;
	return /* @__PURE__ */ (0, K.jsx)(n, {
		className: t,
		"aria-hidden": !0
	});
}
// src/react/activity/resource-chip.tsx
var Be = {
	blue: "bg-status-blue-text text-background-primary-default",
	purple: "bg-status-purple-text text-background-primary-default",
	cyan: "bg-status-cyan-text text-background-primary-default"
};
function Ve({ color: e, high: n, ...r }) {
	return n ? /* @__PURE__ */ (0, K.jsx)("span", {
		...r,
		className: M("inline-flex items-center justify-center rounded-md px-1.5 py-1 whitespace-nowrap text-caption-1-medium", Be[e])
	}) : /* @__PURE__ */ (0, K.jsx)(t, {
		variant: "caption",
		color: e,
		...r
	});
}
// src/react/activity/task-resources.tsx
function He(e) {
	return e.state === "sampling" ? "采样中" : "未取得";
}
function Ue(e) {
	return e === 0 ? "未使用" : `${e.toLocaleString(void 0, { maximumFractionDigits: 1 })}%`;
}
function We({ run: e, active: t = R(e) || !!e.control }) {
	if (!t || !e.resources) return null;
	let { cpu: n } = e.resources, r = n.percent, i = n.state === "ready" && r !== null, a = i && n.high, o = i ? Ue(r) : He(n), s = [n.reason, a ? "当前为高占用。" : ""].filter(Boolean).join("\n");
	return /* @__PURE__ */ (0, K.jsx)("div", {
		"data-task-resources": e.id,
		className: "flex min-w-0 flex-wrap items-center gap-2",
		children: /* @__PURE__ */ (0, K.jsxs)(Ve, {
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
var Ge = /* @__PURE__ */ new Set(["upgrade-repairs"]), Ke = /* @__PURE__ */ new Set(["asset_id", "name"]), qe = {
	succeeded: "lime",
	failed: "rose",
	cancelled: "rose",
	interrupted: "yellow",
	running: "blue",
	pending: "neutral"
}, Y = {
	running: "进行中",
	pausing: "正在暂停",
	paused: "已暂停",
	cancelling: "正在取消"
};
function X({ run: e }) {
	let n = e.control?.state;
	if (n && (n !== "running" || !R(e))) return /* @__PURE__ */ (0, K.jsx)(t, {
		color: n === "running" ? "blue" : "neutral",
		children: /* @__PURE__ */ (0, K.jsx)("span", {
			"data-copy-key": `tasks.control.state.${n}`,
			children: Y[n]
		})
	});
	let r = e.status === "failed" && e.task_key === "library-processing" && e.result_summary?.outcome === "partial", i = r || e.status === "succeeded" && oe(e);
	return /* @__PURE__ */ (0, K.jsx)(t, {
		color: i ? "yellow" : qe[e.status] ?? "neutral",
		children: r ? "部分项目需处理" : i ? "发现问题" : ye(e.status)
	});
}
function Je({ rows: e }) {
	let [t, i] = (0, G.useState)({
		pageIndex: 0,
		pageSize: 20
	}), { pageSize: a } = t, o = Math.min(t.pageIndex, Math.max(0, Math.ceil(e.length / a) - 1));
	return /* @__PURE__ */ (0, K.jsxs)(K.Fragment, { children: [/* @__PURE__ */ (0, K.jsx)("ul", {
		className: "-mr-5 flex min-w-0 flex-col",
		children: e.slice(o * a, (o + 1) * a).map((e) => {
			let t = F(e);
			return /* @__PURE__ */ (0, K.jsxs)("li", {
				"data-status": e.status,
				"data-followup-key": e.followup_key,
				className: "flex min-w-0 flex-col gap-1 border-t border-separator-border py-2.5 pr-10 pl-5",
				children: [
					/* @__PURE__ */ (0, K.jsxs)("div", {
						className: "flex min-w-0 flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, K.jsxs)("div", {
							className: "flex min-w-0 flex-1 basis-40 flex-wrap items-center gap-x-2 gap-y-1",
							children: [
								/* @__PURE__ */ (0, K.jsx)(ze, {
									taskKey: e.task_key,
									className: "size-4 shrink-0 text-text-secondary"
								}),
								/* @__PURE__ */ (0, K.jsx)("span", {
									className: "min-w-0 break-words text-caption-1-regular text-text-primary",
									children: e.task_label
								}),
								/* @__PURE__ */ (0, K.jsx)(X, { run: e }),
								t ? /* @__PURE__ */ (0, K.jsx)("span", {
									className: "min-w-0 break-words text-caption-1-regular text-text-secondary",
									children: t
								}) : null
							]
						}), /* @__PURE__ */ (0, K.jsx)(Le, { run: e })]
					}),
					/* @__PURE__ */ (0, K.jsx)(We, { run: e }),
					Object.keys(e.result_summary || {}).length ? /* @__PURE__ */ (0, K.jsx)("div", {
						className: "w-full min-w-0",
						children: /* @__PURE__ */ (0, K.jsx)(r, {
							summary: "技术详情",
							contentClassName: "pb-2.5",
							children: /* @__PURE__ */ (0, K.jsx)(Te, {
								code: JSON.stringify(e.result_summary, null, 2),
								language: "json",
								label: `${e.task_label}技术详情`
							})
						})
					}) : null
				]
			}, e.id);
		})
	}), /* @__PURE__ */ (0, K.jsx)(n, {
		label: "任务明细",
		total: e.length,
		pagination: {
			...t,
			pageIndex: o
		},
		onChange: i
	})] });
}
function Z({ run: e, meta: t, children: n, error: i, issues: a, followups: o, followupTotal: s = 0, badge: c, resourceActive: l, controlled: u, deletable: d, toast: f }) {
	let [h, g] = (0, G.useState)(!!o?.some(R)), _ = (u || [e]).map((e) => e.id), v = s > (o?.length || 0), y = U({
		queryKey: [
			...S,
			"followups",
			_
		],
		enabled: h && v,
		queryFn: async ({ signal: e }) => (await Promise.all(_.map((t) => E(`/api/tasks/${t}`, e)))).flatMap((e) => e.followups),
		refetchInterval: l ? 2e3 : !1
	}), b = (e) => e.status === "running" ? 3 : e.status === "pending" ? 2 : +(e.status === "failed" || e.status === "interrupted"), x = [...(v ? y.data : void 0) || o || []].sort((e, t) => b(t) - b(e) || t.id - e.id), C = x.length, w = Math.max(o?.length || 0, s), T = V(e), D = String(i || "").trim(), O = me(D);
	return /* @__PURE__ */ (0, K.jsxs)("li", {
		id: `run-${e.id}`,
		"data-status": e.status,
		"data-task-key": e.task_key,
		"data-run-id": e.id,
		className: k({
			padding: "none",
			bordered: e.status === "failed" ? "error" : void 0,
			className: "flex flex-col"
		}),
		children: [
			/* @__PURE__ */ (0, K.jsxs)("div", {
				className: "flex flex-col gap-2 px-5 py-4",
				children: [
					/* @__PURE__ */ (0, K.jsxs)("div", {
						className: "flex min-w-0 flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, K.jsxs)("div", {
							className: "flex min-w-0 flex-1 basis-48 flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, K.jsx)(ze, {
									taskKey: e.task_key,
									className: "size-5 shrink-0 text-text-secondary"
								}),
								/* @__PURE__ */ (0, K.jsx)("strong", {
									className: "min-w-0 break-words text-title-3-medium text-text-primary",
									children: e.task_label
								}),
								c ?? /* @__PURE__ */ (0, K.jsx)(X, { run: e })
							]
						}), /* @__PURE__ */ (0, K.jsx)(Le, {
							run: e,
							runs: u,
							deletable: d,
							toast: f
						})]
					}),
					/* @__PURE__ */ (0, K.jsx)("p", {
						className: "text-caption-1-regular text-text-secondary",
						children: t
					}),
					/* @__PURE__ */ (0, K.jsx)(We, {
						run: e,
						active: l
					}),
					T ? /* @__PURE__ */ (0, K.jsx)(p, {
						href: T.href,
						"data-task-subject": e.id,
						title: T.label,
						className: "min-w-0 max-w-full self-start truncate text-text-primary",
						children: T.label
					}) : null,
					O ? /* @__PURE__ */ (0, K.jsx)("p", {
						"data-task-error": "",
						className: "text-caption-1-regular text-text-secondary wrap-anywhere",
						children: O
					}) : null,
					n
				]
			}),
			a ? /* @__PURE__ */ (0, K.jsx)("div", {
				className: "border-t border-separator-border",
				children: a
			}) : null,
			O && D !== O ? /* @__PURE__ */ (0, K.jsx)("div", {
				className: "border-t border-separator-border",
				children: /* @__PURE__ */ (0, K.jsx)(r, {
					row: !0,
					summary: "错误详情",
					contentClassName: "pb-5",
					children: /* @__PURE__ */ (0, K.jsx)(De, {
						label: `${e.task_label}错误详情`,
						children: D
					})
				})
			}) : null,
			w ? /* @__PURE__ */ (0, K.jsx)("div", {
				className: "border-t border-separator-border",
				children: /* @__PURE__ */ (0, K.jsxs)(r, {
					row: !0,
					summary: `任务明细 · ${w.toLocaleString()} 项`,
					contentClassName: "pb-5",
					isOpen: h,
					onOpenChange: g,
					children: [
						y.error ? /* @__PURE__ */ (0, K.jsx)(m, {
							tone: "error",
							children: P(y.error)
						}) : null,
						C < w ? /* @__PURE__ */ (0, K.jsxs)("p", {
							className: "text-caption-1-regular text-text-secondary",
							children: [
								"列出其中 ",
								C.toLocaleString(),
								" 项"
							]
						}) : null,
						/* @__PURE__ */ (0, K.jsx)(Je, { rows: x })
					]
				})
			}) : null,
			Object.keys(e.result_summary || {}).some((e) => !(T && Ke.has(e))) ? /* @__PURE__ */ (0, K.jsx)("div", {
				className: "border-t border-separator-border",
				children: /* @__PURE__ */ (0, K.jsx)(r, {
					row: !0,
					summary: "技术详情",
					contentClassName: "pb-5",
					children: /* @__PURE__ */ (0, K.jsx)(Te, {
						code: JSON.stringify(e.result_summary, null, 2),
						language: "json",
						label: `${e.task_label}技术详情`
					})
				})
			}) : null
		]
	});
}
function Ye({ run: e, followups: t, followupTotal: n }) {
	let r = e.progress_total || 0, i = e.progress_current || 0, a = e.control?.state, o = a && a !== "running", s = o ? Y[a] : e.progress_label || "正在进行", c = N(e.elapsed_seconds), l = [C[e.trigger] || e.trigger, c && `已跑 ${c}`].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, K.jsx)(Z, {
		run: e,
		meta: l,
		followups: t,
		followupTotal: n,
		children: r > 0 ? /* @__PURE__ */ (0, K.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ (0, K.jsx)(v, {
				label: s,
				value: Math.min(i, r),
				max: r
			}), /* @__PURE__ */ (0, K.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary wrap-anywhere",
				children: [
					s,
					" · ",
					pe(i, r),
					" 项"
				]
			})]
		}) : o ? /* @__PURE__ */ (0, K.jsx)("p", {
			"data-copy-key": `tasks.control.state.${a}`,
			className: "text-caption-1-regular text-text-secondary",
			children: s
		}) : /* @__PURE__ */ (0, K.jsx)(u, { label: s })
	});
}
function Xe({ run: e, followups: n, runs: i, latest: a, followupTotal: o, followupFailed: l = 0, followupCancelled: u = 0, toast: d }) {
	let f = !!(i && i.length > 1 && o), p = f ? [`共处理 ${o.toLocaleString()} 项`, l ? `其中 ${l.toLocaleString()} 项失败` : ""].filter(Boolean) : be(V(e) ? {
		...e.result_summary,
		name: ""
	} : e.result_summary).filter((t) => t !== e.error && t !== me(e.error)), m = xe(e), h = fe(e, a), g = N(e.elapsed_seconds), _ = i && i.length > 1 ? i[i.length - 1] : void 0, v = (_ ? [
		C[e.trigger] || e.trigger,
		`近 ${i.length} 轮`,
		`${z(_.finished_at)} – ${z(e.finished_at)}`
	] : [
		C[e.trigger] || e.trigger,
		z(e.finished_at),
		g && `用时 ${g}`
	]).filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, K.jsxs)(Z, {
		run: e,
		meta: v,
		error: e.error,
		followups: n,
		followupTotal: o,
		controlled: i,
		deletable: !0,
		toast: d,
		issues: m.length ? /* @__PURE__ */ (0, K.jsx)(r, {
			row: !0,
			summary: `问题详情 · ${m.length} 项`,
			contentClassName: "pb-5",
			children: /* @__PURE__ */ (0, K.jsx)(De, {
				label: "任务问题详情",
				children: /* @__PURE__ */ (0, K.jsx)("ul", {
					className: "flex min-w-0 flex-col whitespace-normal",
					"data-task-issues": "",
					children: m.map((e, t) => /* @__PURE__ */ (0, K.jsx)(s, {
						title: /* @__PURE__ */ (0, K.jsxs)(K.Fragment, { children: [e.label, e.provider || e.kind ? /* @__PURE__ */ (0, K.jsxs)("span", {
							className: "text-body-2-regular text-text-secondary",
							children: [" · ", [e.provider, e.kind].filter(Boolean).join(" · ")]
						}) : null] }),
						children: /* @__PURE__ */ (0, K.jsx)(Oe, {
							text: e.error,
							className: "text-caption-1-regular text-text-secondary"
						})
					}, `${e.source}-${t}`))
				})
			})
		}) : void 0,
		badge: u && e.status === "succeeded" ? /* @__PURE__ */ (0, K.jsx)(t, {
			color: "rose",
			children: /* @__PURE__ */ (0, K.jsx)("span", {
				"data-copy-key": `tasks.followups.cancelled.${u === o ? "all" : "partial"}`,
				children: u === o ? "后续任务已取消" : "部分后续任务已取消"
			})
		}) : f && l ? /* @__PURE__ */ (0, K.jsx)(t, {
			color: "yellow",
			children: "发现问题"
		}) : void 0,
		children: [
			u ? /* @__PURE__ */ (0, K.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary",
				children: [
					"后续任务已取消 ",
					u.toLocaleString(),
					" 项"
				]
			}) : null,
			p.length === 1 ? /* @__PURE__ */ (0, K.jsx)("p", {
				className: "text-caption-1-regular text-text-secondary wrap-anywhere",
				children: p[0]
			}) : p.length ? /* @__PURE__ */ (0, K.jsx)("ul", {
				className: "flex list-disc flex-col gap-1 pl-5 text-caption-1-regular text-text-secondary wrap-anywhere",
				children: p.map((e, t) => /* @__PURE__ */ (0, K.jsx)("li", { children: e }, t))
			}) : null,
			h ? /* @__PURE__ */ (0, K.jsx)(c, {
				href: h.href,
				size: "small",
				trailingIcon: L,
				className: "self-start",
				children: h.label
			}) : null
		]
	});
}
function Ze({ runs: e, followups: n, counts: r }) {
	let i = e[0], a = e[e.length - 1], o = I(r, e), s = Math.max(o.total, n.length), c = o.total ? o.settled : n.filter((e) => !R(e)).length, l = o.total ? o.failed : n.filter((e) => e.status === "failed" || e.status === "interrupted").length, u = [
		C[i.trigger] || i.trigger,
		e.length > 1 ? `${e.length} 批` : "",
		`${z(a.started_at || a.finished_at)} 开始`
	].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, K.jsx)(Z, {
		run: i,
		meta: u,
		followups: n,
		followupTotal: s,
		resourceActive: !0,
		controlled: e,
		badge: i.control ? /* @__PURE__ */ (0, K.jsx)(X, { run: i }) : /* @__PURE__ */ (0, K.jsx)(t, {
			color: "blue",
			children: "进行中"
		}),
		children: /* @__PURE__ */ (0, K.jsxs)("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ (0, K.jsx)(v, {
				label: `${i.task_label}进度`,
				value: c,
				max: s
			}), /* @__PURE__ */ (0, K.jsxs)("p", {
				className: "text-caption-1-regular text-text-secondary",
				children: [
					"已处理 ",
					pe(c, s),
					" 项",
					l ? ` · 其中 ${l.toLocaleString()} 项失败` : ""
				]
			})]
		})
	});
}
function Q({ title: e, action: t, children: n }) {
	let r = (0, G.useId)();
	return /* @__PURE__ */ (0, K.jsxs)("section", {
		"aria-labelledby": r,
		className: "flex min-w-0 flex-col gap-3",
		children: [/* @__PURE__ */ (0, K.jsxs)("div", {
			className: "flex min-w-0 flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, K.jsx)("h3", {
				id: r,
				className: "text-title-2-medium text-text-primary",
				children: e
			}), t]
		}), n]
	});
}
function $({ live: e = !1, paginate: t = !0, children: r }) {
	let [i, a] = (0, G.useState)({
		pageIndex: 0,
		pageSize: 20
	}), o = G.Children.toArray(r), { pageSize: s } = i, c = Math.min(i.pageIndex, Math.max(0, Math.ceil(o.length / s) - 1));
	return /* @__PURE__ */ (0, K.jsxs)(K.Fragment, { children: [/* @__PURE__ */ (0, K.jsx)("ul", {
		"aria-live": e ? "polite" : void 0,
		className: "flex min-w-0 flex-col gap-3",
		children: t ? o.slice(c * s, (c + 1) * s) : o
	}), t ? /* @__PURE__ */ (0, K.jsx)(n, {
		label: "任务列表",
		total: o.length,
		pagination: {
			...i,
			pageIndex: c
		},
		onChange: a
	}) : null] });
}
function Qe({ toast: t } = {}) {
	let [r, a] = (0, G.useState)(1), [o, s] = (0, G.useState)(20), c = U({
		queryKey: r === 1 && o === 20 ? S : [
			...S,
			"page",
			r,
			o
		],
		queryFn: ({ signal: e }) => ne(e, r, o),
		refetchInterval: (e) => de(e.state.data),
		placeholderData: (e) => e
	}), [l, u] = (0, G.useState)(c.data);
	c.data && c.data !== l && u(c.data);
	let f = c.data || l, p = c.error ? P(c.error) : "", h = H({
		mutationFn: () => ee(),
		onSuccess: (e) => {
			t?.(B("activity:clear.done", { count: e.deleted })), c.refetch();
		}
	});
	if (!f) return /* @__PURE__ */ (0, K.jsx)(Ee, { children: /* @__PURE__ */ (0, K.jsx)(m, {
		tone: "error",
		children: p || "读取任务中心失败"
	}) });
	let g = f.finished || [], _ = () => {
		h.isPending || A({
			title: B("activity:clear.title"),
			body: B("activity:clear.body"),
			confirmLabel: B("activity:clear.confirm"),
			danger: !0,
			onConfirm: () => h.mutateAsync()
		});
	}, v = f.working_parents || [], y = [
		...f.running || [],
		...f.skipped || [],
		...g,
		...v
	], b = ae(y), x = new Set(y.map((e) => e.id)), C = (e) => e.filter((e) => !(e.followup_key && e.parent_run_id != null && x.has(e.parent_run_id))), w = C(g), T = f.followup_counts || {}, E = (e) => e.flatMap((e) => b.get(e.id) || []), D = [...w, ...C(v)].filter((e) => I(T, [e]).active > 0 || b.get(e.id)?.some(R)).sort((e, t) => t.id - e.id), O = C(f.running || []), k = C(f.skipped || []), j = w.filter((e) => !D.includes(e) && !k.some((t) => t.id === e.id)), M = (e) => (b.get(e.id) || []).every((e) => e.status === "succeeded" && !oe(e)) && I(T, [e]).failed === 0, te = ie(j, (e) => se(e) && (M(e) || Ge.has(e.task_key))), N = re(D, (e) => e.control?.state || "").sort((e, t) => t.run.id - e.run.id), F = ce(y), L = !O.length && !D.length && !k.length && !j.length;
	return /* @__PURE__ */ (0, K.jsxs)(Ee, { children: [
		p ? /* @__PURE__ */ (0, K.jsx)(m, {
			tone: "error",
			children: p
		}) : null,
		/* @__PURE__ */ (0, K.jsx)(Ie, {}),
		f.available === !1 ? /* @__PURE__ */ (0, K.jsx)(m, {
			tone: "warning",
			children: f.message || "数据库尚未准备好任务记录表"
		}) : null,
		/* @__PURE__ */ (0, K.jsx)(je, {}),
		L ? /* @__PURE__ */ (0, K.jsx)(i, {
			icon: Ce,
			title: "还没有任务记录",
			children: "扫描、追更检查、批量操作和命令行批处理跑起来之后，这里会显示它们的进度与结果。"
		}) : /* @__PURE__ */ (0, K.jsxs)(K.Fragment, { children: [
			/* @__PURE__ */ (0, K.jsx)(Q, {
				title: "正在进行",
				children: O.length || D.length ? /* @__PURE__ */ (0, K.jsxs)($, {
					live: !0,
					children: [O.map((e) => /* @__PURE__ */ (0, K.jsx)(Ye, {
						run: e,
						followups: b.get(e.id),
						followupTotal: I(T, [e]).total
					}, e.id)), N.map(({ run: e, runs: t }) => /* @__PURE__ */ (0, K.jsx)(Ze, {
						runs: t,
						followups: E(t),
						counts: T
					}, e.id))]
				}) : /* @__PURE__ */ (0, K.jsx)(m, {
					tone: "neutral",
					children: "没有任务在跑。"
				})
			}),
			k.length ? /* @__PURE__ */ (0, K.jsx)(Q, {
				title: "本次未执行",
				children: /* @__PURE__ */ (0, K.jsx)($, { children: k.map((e) => /* @__PURE__ */ (0, K.jsx)(Xe, {
					run: e,
					latest: F.has(e.id),
					followups: b.get(e.id),
					toast: t
				}, e.id)) })
			}) : null,
			j.length || f.finished_total ? /* @__PURE__ */ (0, K.jsxs)(Q, {
				title: "最近完成",
				action: f.finished_total ? /* @__PURE__ */ (0, K.jsx)(e, {
					variant: "danger",
					size: "small",
					leadingIcon: d,
					disabled: h.isPending,
					onClick: _,
					children: B("activity:clear.action")
				}) : void 0,
				children: [
					h.error ? /* @__PURE__ */ (0, K.jsx)(m, {
						tone: "error",
						children: P(h.error)
					}) : null,
					j.length ? /* @__PURE__ */ (0, K.jsx)($, {
						paginate: !1,
						children: te.map(({ run: e, runs: n }) => {
							let r = I(T, n);
							return /* @__PURE__ */ (0, K.jsx)(Xe, {
								run: e,
								runs: n,
								latest: F.has(e.id),
								followups: E(n),
								followupTotal: r.total,
								followupFailed: r.failed,
								followupCancelled: r.cancelled,
								toast: t
							}, e.id);
						})
					}) : null,
					/* @__PURE__ */ (0, K.jsx)(n, {
						label: "最近完成",
						total: f.finished_total ?? w.length,
						unit: "轮任务",
						pageUnit: "轮",
						pagination: {
							pageIndex: (f.finished_page || r) - 1,
							pageSize: o
						},
						onChange: (e) => {
							e.pageIndex + 1 === r && e.pageSize === o ? c.refetch() : (a(e.pageIndex + 1), s(e.pageSize));
						}
					})
				]
			}) : null
		] })
	] });
}
export { Qe as ActivityPage };

//# debugId=8820e079-f352-4979-9ec7-a12141ff92cd