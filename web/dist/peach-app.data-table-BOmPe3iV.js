(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "9f0a15f8-7d3c-4ace-ad3e-7dc8ef88e5af", e._sentryDebugIdIdentifier = "sentry-dbid-9f0a15f8-7d3c-4ace-ad3e-7dc8ef88e5af");
	} catch {}
})();
import { $76d00c5a4edb230a$export$76ccd210b9029917 as e, $76d00c5a4edb230a$export$816b5d811295e6bc as t, $76d00c5a4edb230a$export$b59bdbef9ce70de2 as n, $76d00c5a4edb230a$export$f6f0c3fe4ec306ea as r, $76d00c5a4edb230a$export$f850895b287ef28e as i, Button as a, Checkbox as o, ChevronSortDown as s, DataTableFooter as c, DataTableFrame as l, DataTableSort as u, SelectionDock as d, Table as f, TableColumnControls as p, TableColumnResizer as m, TableSelectionHeader as h, __toESM as g, autoResetPageIndex as _, cardClass as v, columnVisibilityFeature as y, column_getCanSort as b, column_getSortFn as x, copyInstancePropertiesWithoutMemos as S, createColumnHelper as C, expandRowModel as w, flexRender as T, getDefaultPaginationState as E, require_jsx_runtime as D, require_react as O, rowPaginationFeature as k, rowSelectionFeature as A, rowSortingFeature as j, skipFirstRun as M, tableFeatures as N, tableMemo as P, useTable as F, useTablePreferences as I } from "./peach-app.js";
// node_modules/@tanstack/table-core/dist/features/row-pagination/createPaginatedRowModel.js
function L() {
	return (e) => {
		let t = e;
		return P({
			feature: "rowPaginationFeature",
			table: t,
			fnName: "table.getPaginatedRowModel",
			memoDeps: () => [
				t.getPrePaginatedRowModel(),
				t.atoms.pagination?.get(),
				t.options.paginateExpandedRows ? void 0 : t.atoms.expanded?.get()
			],
			fn: () => R(t)
		});
	};
}
function R(e) {
	let t = e.getPrePaginatedRowModel(), n = e.atoms.pagination?.get();
	if (!t.rows.length) return t;
	let { pageSize: r, pageIndex: i } = n ?? E(), { rows: a, flatRows: o, rowsById: s } = t, c = a;
	if (r !== Infinity || i !== 0) {
		let e = r * i, t = e + r;
		c = a.slice(e, t);
	}
	let l;
	l = e.options.paginateExpandedRows ? {
		rows: c,
		flatRows: o,
		rowsById: s
	} : w(e, {
		rows: c,
		flatRows: o,
		rowsById: s
	}), l.flatRows = [];
	let u = /* @__PURE__ */ new Set(), d = (e) => {
		u.has(e.id) || (u.add(e.id), l.flatRows.push(e), e.subRows.length && e.subRows.forEach(d));
	};
	return l.rows.forEach(d), l;
}
// node_modules/@tanstack/table-core/dist/features/row-sorting/createSortedRowModel.js
function z() {
	return (e) => {
		let t = e;
		return P({
			feature: "rowSortingFeature",
			table: t,
			fnName: "table.getSortedRowModel",
			memoDeps: () => [t.atoms.sorting?.get(), t.getPreSortedRowModel()],
			fn: () => B(t),
			onAfterUpdate: M(() => _(t))
		});
	};
}
function B(e) {
	let t = e.getPreSortedRowModel(), n = e.atoms.sorting?.get();
	if (!t.rows.length || !n?.length) return t;
	let r = [], i = n.filter((t) => {
		let n = e.getColumn(t.id);
		return n ? b(n) : !1;
	});
	if (!i.length) return t;
	let a = [];
	for (let t = 0; t < i.length; t++) {
		let n = i[t], r = e.getColumn(n.id);
		r && a.push({
			id: n.id,
			desc: n.desc,
			sortUndefined: r.columnDef.sortUndefined,
			invertSorting: r.columnDef.invertSorting,
			sortFn: x(r)
		});
	}
	let o = (e, t) => {
		for (let n = 0; n < a.length; n++) {
			let r = a[n], i = r.sortUndefined, o = r.desc, s = 0;
			if (i) {
				let n = e.getValue(r.id), a = t.getValue(r.id), o = n === void 0, c = a === void 0;
				if (o && c) continue;
				if (o || c) {
					if (i === "first") return o ? -1 : 1;
					if (i === "last") return o ? 1 : -1;
					s = o ? i : -i;
				}
			}
			if (s === 0 && (s = r.sortFn(e, t, r.id)), s !== 0) return o && (s *= -1), r.invertSorting && (s *= -1), s;
		}
		return e.index - t.index;
	}, s = (e) => {
		let t = e.slice();
		t.sort(o);
		let n = !1;
		for (let i = 0; i < t.length; i++) {
			let a = t[i];
			a !== e[i] && (n = !0);
			let o = r.length;
			if (r.push(a), a.subRows.length) {
				let e = s(a.subRows);
				if (e.changed) {
					let s = Object.create(Object.getPrototypeOf(a));
					S(s, a), s.subRows = e.rows, t[i] = s, r[o] = s, n = !0;
				}
			}
		}
		return {
			rows: t,
			changed: n
		};
	};
	return {
		rows: s(t.rows).rows,
		flatRows: r,
		rowsById: t.rowsById
	};
}
// src/react/components/use-table-selection.ts
var V = /* @__PURE__ */ g(O(), 1), H = /* @__PURE__ */ new Map();
function U(e) {
	let t = (0, V.useId)(), n = (0, V.useRef)(e);
	return n.current = e, (0, V.useEffect)(() => (H.set(t, () => n.current()), () => {
		H.delete(t);
	}), [t]), (0, V.useCallback)(() => {
		for (let [e, n] of H) e !== t && n();
	}, [t]);
}
// src/react/components/data-table.tsx
var W = D(), G = N({
	rowSortingFeature: j,
	rowSelectionFeature: A,
	rowPaginationFeature: k,
	columnVisibilityFeature: y,
	sortedRowModel: z(),
	paginatedRowModel: L()
});
function K({ label: g, items: _, columns: y, rowId: b, rowLabel: x, selected: S, onSelected: w, actions: E, title: D = g, titleId: O, description: k, footerActions: A, toolbarActions: j, panel: M = !0, unit: N = "条记录" }) {
	let [P, L] = (0, V.useState)([]), R = (0, V.useMemo)(() => [{
		id: "select",
		label: "选择",
		width: 48,
		min: 48,
		max: 48,
		required: !0
	}, ...y.map((e, t) => ({
		...e,
		width: e.width ?? (t === 0 ? 320 : 160),
		min: e.min ?? (t === 0 ? 320 : 96),
		flex: e.flex ?? t === 0,
		required: t === 0
	}))], [y]), z = I(`data:${g}`, R), [B, H] = (0, V.useState)({
		pageIndex: 0,
		pageSize: 20
	}), K = U(() => w([])), q = Math.max(1, Math.ceil(_.length / B.pageSize)), J = Math.min(B.pageIndex, q - 1), Y = Object.fromEntries(S.map((e) => [e, !0])), X = (0, V.useMemo)(() => {
		let e = C();
		return e.columns([e.display({
			id: "select",
			header: ({ table: e }) => /* @__PURE__ */ (0, W.jsx)(h, {
				table: e,
				label: `全选${g}`
			}),
			cell: ({ row: e }) => /* @__PURE__ */ (0, W.jsx)(o, {
				slot: null,
				"aria-label": `选择 ${x(e.original)}`,
				isSelected: e.getIsSelected(),
				onChange: (t) => e.toggleSelected(t)
			})
		}), ...y.map((t) => e.accessor((e) => t.value?.(e) ?? "", {
			id: t.id,
			header: t.label,
			enableSorting: !!t.value,
			sortFn: (e, n) => {
				let r = t.value(e.original), i = t.value(n.original);
				return typeof r == "number" && typeof i == "number" ? r - i : String(r).localeCompare(String(i), "zh-CN", { numeric: !0 });
			},
			cell: ({ row: e }) => t.render(e.original)
		}))]);
	}, [
		y,
		g,
		x
	]), Z = F({
		features: G,
		data: _,
		columns: X,
		getRowId: b,
		state: {
			sorting: P,
			rowSelection: Y,
			pagination: {
				...B,
				pageIndex: J
			},
			columnVisibility: z.visibility
		},
		onColumnVisibilityChange: z.change,
		onSortingChange: (e) => {
			L(e), H((e) => ({
				...e,
				pageIndex: 0
			}));
		},
		onPaginationChange: H,
		enableRowSelection: !0,
		onRowSelectionChange: (e) => {
			let t = typeof e == "function" ? e(Y) : e;
			Object.values(t).some(Boolean) && K(), w(_.filter((e) => t[b(e)]).map(b));
		}
	}), Q = Z.getSelectedRowModel().rows.map((e) => e.original);
	return /* @__PURE__ */ (0, W.jsxs)("div", {
		"data-data-table-panel": M || void 0,
		className: M ? v({
			padding: "none",
			className: "flex flex-col gap-4 px-6 py-5 max-sm:px-4"
		}) : "flex min-w-0 flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, W.jsxs)("div", {
				"data-responsive-toolbar": "",
				role: "toolbar",
				"aria-label": `${g}工具栏`,
				children: [/* @__PURE__ */ (0, W.jsxs)("div", {
					"data-toolbar-heading": "",
					children: [/* @__PURE__ */ (0, W.jsx)("h3", {
						id: O,
						className: "text-title-2-medium text-text-primary",
						children: D
					}), /* @__PURE__ */ (0, W.jsx)("span", {
						className: "text-body-2-regular tabular-nums text-text-secondary",
						children: `${_.length.toLocaleString()} ${N}`
					})]
				}), /* @__PURE__ */ (0, W.jsxs)("div", {
					"data-toolbar-actions": "",
					children: [
						j,
						/* @__PURE__ */ (0, W.jsx)(p, {
							preferences: z,
							label: g
						}),
						/* @__PURE__ */ (0, W.jsx)(u, {
							label: g,
							options: y.filter((e) => e.value).map((e) => ({
								id: e.id,
								label: e.label
							})),
							sorting: P,
							onChange: (e) => {
								L(e), H((e) => ({
									...e,
									pageIndex: 0
								}));
							}
						})
					]
				})]
			}),
			k ? /* @__PURE__ */ (0, W.jsx)("p", {
				className: "text-body-2-regular text-text-secondary",
				children: k
			}) : null,
			/* @__PURE__ */ (0, W.jsxs)(d, {
				label: `${g}批量操作`,
				visible: Q.length > 0,
				count: `已选 ${Q.length.toLocaleString()} ${N}`,
				children: [E(Q, () => w([])), /* @__PURE__ */ (0, W.jsx)(a, {
					variant: "ghost",
					size: "small",
					onClick: () => w([]),
					children: "取消选择"
				})]
			}),
			/* @__PURE__ */ (0, W.jsx)(l, {
				sortable: !0,
				preferences: z,
				onRowClick: (e) => Z.getRow(e)?.toggleSelected(),
				children: /* @__PURE__ */ (0, W.jsxs)(f, {
					"aria-label": g,
					size: "sm",
					sortDescriptor: P[0] ? {
						column: P[0].id,
						direction: P[0].desc ? "descending" : "ascending"
					} : void 0,
					onSortChange: (e) => Z.getColumn(String(e.column))?.toggleSorting(e.direction === "descending"),
					children: [/* @__PURE__ */ (0, W.jsxs)(i, { children: [Z.getHeaderGroups()[0].headers.map((e) => /* @__PURE__ */ (0, W.jsx)(t, {
						id: e.id,
						isRowHeader: e.id === y[0].id,
						allowsSorting: e.column.getCanSort(),
						...z.columnProps(e.id),
						children: ({ sortDirection: t }) => /* @__PURE__ */ (0, W.jsxs)(W.Fragment, { children: [/* @__PURE__ */ (0, W.jsxs)("span", {
							className: "flex items-center gap-0.5",
							children: [T(e.column.columnDef.header, e.getContext()), e.column.getCanSort() ? /* @__PURE__ */ (0, W.jsx)("span", {
								"data-sort-indicator": !0,
								"data-direction": t || void 0,
								children: /* @__PURE__ */ (0, W.jsx)(s, {})
							}) : null]
						}), /* @__PURE__ */ (0, W.jsx)(m, {
							preferences: z,
							id: e.id
						})] })
					}, e.id)), /* @__PURE__ */ (0, W.jsx)(t, {
						id: "remaining-space",
						"aria-label": "行空白区域",
						"data-table-space": "",
						width: z.spaceWidth,
						minWidth: 0
					})] }), /* @__PURE__ */ (0, W.jsx)(e, {
						renderEmptyState: () => "没有记录",
						children: Z.getRowModel().rows.map((e) => /* @__PURE__ */ (0, W.jsxs)(n, {
							id: e.id,
							"data-board-selected": e.getIsSelected() || void 0,
							children: [e.getVisibleCells().map((e) => /* @__PURE__ */ (0, W.jsx)(r, { children: T(e.column.columnDef.cell, e.getContext()) }, e.id)), /* @__PURE__ */ (0, W.jsx)(r, { "data-table-space": "" })]
						}, e.id))
					})]
				})
			}),
			/* @__PURE__ */ (0, W.jsx)(c, {
				label: g,
				total: _.length,
				pagination: {
					...B,
					pageIndex: J
				},
				onChange: H,
				unit: N
			}),
			A ? /* @__PURE__ */ (0, W.jsx)("div", {
				className: "flex flex-wrap items-center justify-end gap-2 border-t border-separator-border pt-4",
				children: A
			}) : null
		]
	});
}
export { K as DataTable };

//# debugId=9f0a15f8-7d3c-4ace-ad3e-7dc8ef88e5af