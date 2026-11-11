(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "1745845c-e367-4c04-9952-009d534304a0", e._sentryDebugIdIdentifier = "sentry-dbid-1745845c-e367-4c04-9952-009d534304a0");
	} catch {}
})();
import { Button as e, CollectionSummary as t, EmptyState as n, LOC as r, Note as i, OA as a, QUALITY_GOALS_KEY as o, cardClass as s, errorMessage as c, fetchQualityGoals as l, fmtDur as u, fmtSize as d, previewUrl as f, require_jsx_runtime as p, useQuery as m } from "./peach-app.js";
import { Page as h } from "./peach-app.page-QAncjzM1.js";
// src/react/quality-goals/quality-goals-page.tsx
var g = p();
function _({ item: t, openItem: n, javTitleHtml: i, javDisplayName: a, srcBadge: o }) {
	let c = () => n(t.id);
	return /* @__PURE__ */ (0, g.jsxs)("li", {
		"data-goal-id": t.id,
		className: s({
			padding: "none",
			className: "flex flex-col gap-3 p-3"
		}),
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "flex min-w-0 gap-4",
			children: [/* @__PURE__ */ (0, g.jsxs)("button", {
				type: "button",
				onClick: c,
				"aria-label": `打开 ${a(t)}`,
				className: "relative inline-grid w-card-cover shrink-0 self-start aspect-card-cover cursor-pointer place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default",
				children: [/* @__PURE__ */ (0, g.jsx)("span", {
					className: "text-caption-1-regular text-text-secondary",
					children: "暂无预览"
				}), /* @__PURE__ */ (0, g.jsx)("img", {
					src: f(t),
					alt: "",
					loading: "lazy",
					onError: (e) => e.currentTarget.remove(),
					className: "absolute inset-0 size-full object-contain"
				})]
			}), /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, g.jsx)("h3", {
						className: "text-headline-medium text-text-primary",
						children: /* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							onClick: c,
							title: a(t),
							className: "line-clamp-2 w-full cursor-pointer text-left wrap-anywhere",
							dangerouslySetInnerHTML: { __html: i(t) }
						})
					}),
					/* @__PURE__ */ (0, g.jsxs)("p", {
						className: "flex flex-wrap items-center gap-2 text-body-2-regular text-text-secondary",
						children: [
							/* @__PURE__ */ (0, g.jsx)("span", {
								className: "contents",
								dangerouslySetInnerHTML: { __html: o(t.location, t.cost) }
							}),
							/* @__PURE__ */ (0, g.jsx)("span", { children: r[t.location] ?? t.location }),
							/* @__PURE__ */ (0, g.jsx)("span", { children: u(t.duration) }),
							/* @__PURE__ */ (0, g.jsx)("span", { children: Number(t.size) > 0 ? d(Number(t.size)) : "大小未知" })
						]
					}),
					t.reason ? /* @__PURE__ */ (0, g.jsx)("p", {
						className: "border-t border-separator-border pt-3 text-body-2-regular text-text-secondary wrap-anywhere",
						children: t.reason
					}) : null
				]
			})]
		}), /* @__PURE__ */ (0, g.jsx)("footer", {
			className: "flex flex-wrap justify-end gap-2",
			children: /* @__PURE__ */ (0, g.jsx)(e, {
				variant: "secondary",
				size: "small",
				onClick: c,
				children: "查看版本"
			})
		})]
	});
}
function v(e) {
	let r = m({
		queryKey: o,
		queryFn: ({ signal: e }) => l(e)
	}), s = r.data;
	if (!s) return /* @__PURE__ */ (0, g.jsx)(h, { children: /* @__PURE__ */ (0, g.jsx)(i, {
		tone: "error",
		title: "高清版目标读取失败",
		children: r.error ? c(r.error) : "未取得高清版目标，请刷新页面重试。"
	}) });
	let u = s.items || [];
	return u.length ? /* @__PURE__ */ (0, g.jsxs)(h, { children: [
		/* @__PURE__ */ (0, g.jsx)(t, {
			label: "待升级",
			figure: `${Number(s.total || 0).toLocaleString()} 部作品`,
			flush: !0
		}),
		/* @__PURE__ */ (0, g.jsx)("ul", {
			className: "card-grid-cover gap-5",
			children: u.map((t) => /* @__PURE__ */ (0, g.jsx)(_, {
				item: t,
				...e
			}, t.id))
		}),
		Number(s.total || 0) > u.length ? /* @__PURE__ */ (0, g.jsx)("p", {
			className: "mt-6 text-center text-caption-1-regular text-text-secondary",
			children: `显示前 ${u.length.toLocaleString()} 部，共 ${Number(s.total).toLocaleString()} 部。`
		}) : null
	] }) : /* @__PURE__ */ (0, g.jsx)(h, { children: /* @__PURE__ */ (0, g.jsx)(n, {
		icon: a,
		title: "没有标记中的高清版目标",
		children: "现有版本都已满足条件，或还没有加入追踪。"
	}) });
}
export { v as QualityGoalsPage };

//# debugId=1745845c-e367-4c04-9952-009d534304a0