(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "927b4cdf-badf-4de6-9fd2-0ac754ae4818", e._sentryDebugIdIdentifier = "sentry-dbid-927b4cdf-badf-4de6-9fd2-0ac754ae4818");
	} catch {}
})();
import { Button as e, CollectionSummary as t, DRIVE_KEY as n, DUPLICATES_KEY as r, EmptyState as i, FilterGlass as a, GlassPill as o, LOC as s, MEDIA_SOURCE_ICONS as c, Note as l, SourceMark as u, TRASH_KEY as d, __toESM as f, batchOperate as p, bulkCloudPreferences as m, busyProps as h, cardClass as g, configuredLocations as _, confirmModal as v, distinctName as y, duplicateVictims as b, errorMessage as x, fetchDrives as S, fetchDuplicates as C, fmtDur as w, fmtSize as T, keepGroup as E, keepRuleLabel as D, mixedCloudPreferences as O, queryClient as k, require_jsx_runtime as A, require_react as j, sharedNamePrefix as M, spriteGlyph as N, t as P, useMutation as F, useQuery as I, victimBytes as L } from "./peach-app.js";
// src/react/components/source-label.tsx
var R = /* @__PURE__ */ f(j(), 1), z = A(), B = (e) => e.startsWith("clouddrive:") ? e.split(":")[1] : e;
Object.fromEntries(Object.entries(c).map(([e, t]) => [e, function({ className: e }) {
	return /* @__PURE__ */ (0, z.jsx)("span", {
		className: e,
		children: /* @__PURE__ */ (0, z.jsx)(u, { mark: t })
	});
}]));
function V({ source: e, label: t }) {
	let n = B(e);
	return /* @__PURE__ */ (0, z.jsxs)("span", {
		className: "inline-flex min-w-0 items-center gap-1.5",
		children: [/* @__PURE__ */ (0, z.jsx)(u, { mark: c[n] || (n === "local" ? "hard-drive" : "database") }), /* @__PURE__ */ (0, z.jsx)("span", {
			className: "min-w-0 truncate",
			children: t
		})]
	});
}
// src/react/duplicates/duplicates-page.tsx
var H = N("play"), U = N("file-stack"), W = g({
	padding: "none",
	radius: "surface",
	className: "mb-6 overflow-hidden dark:bg-background-primary-default"
}), G = "rounded-sm px-1.5 py-px text-caption-1-regular leading-5", K = "rounded-sm px-2 py-0.5 text-caption-1-regular leading-5", q = "font-mono text-caption-1-regular leading-5 text-text-secondary", J = () => {
	k.invalidateQueries({
		queryKey: r,
		exact: !0
	}), k.invalidateQueries({
		queryKey: d,
		exact: !0
	});
};
function Y(e) {
	return e.identical ? /* @__PURE__ */ (0, z.jsx)("span", {
		className: `${K} text-(--keep)`,
		children: P("cleanup:duplicates.sha1Match")
	}) : /* @__PURE__ */ (0, z.jsx)("span", {
		className: `${K} text-text-secondary`,
		children: e.evidence === "same_code_short_copy" ? P("cleanup:duplicates.sameCodeShorter") : P("cleanup:duplicates.byDuration")
	});
}
function X({ file: e, prefix: t, openItem: n }) {
	let r = () => n(e.id), i = s[e.location] || e.location || e.drive;
	return /* @__PURE__ */ (0, z.jsxs)("div", {
		className: "duplicate-row items-center gap-3 border-t border-separator-border px-5 py-4 max-compact:p-4",
		children: [
			/* @__PURE__ */ (0, z.jsxs)("button", {
				type: "button",
				onClick: r,
				"aria-label": P("cleanup:duplicates.previewFile", { name: e.name }),
				className: "relative row-span-2 inline-grid aspect-16/10 w-full cursor-pointer place-items-center overflow-hidden rounded-2lg bg-background-tertiary-default text-text-secondary",
				children: [/* @__PURE__ */ (0, z.jsx)(H, {
					"aria-hidden": !0,
					className: "size-6"
				}), /* @__PURE__ */ (0, z.jsx)("img", {
					src: `/thumb?id=${e.id}&c=4`,
					alt: "",
					loading: "lazy",
					onError: (e) => e.currentTarget.remove(),
					className: "absolute inset-0 size-full object-contain"
				})]
			}),
			/* @__PURE__ */ (0, z.jsxs)("span", {
				className: "flex min-w-0 items-center gap-2 max-duplicate-narrow:col-start-2 max-duplicate-narrow:-col-end-1",
				children: [/* @__PURE__ */ (0, z.jsx)("button", {
					type: "button",
					onClick: r,
					title: e.name,
					"data-middle-truncate": !0,
					"data-middle-truncate-within": !0,
					className: "min-w-0 shrink cursor-pointer truncate text-left text-body-regular hover:text-text-secondary",
					children: y(e.name, t)
				}), e.is_largest || e.is_longest ? /* @__PURE__ */ (0, z.jsxs)("span", {
					className: "flex flex-none gap-1",
					children: [e.is_largest ? /* @__PURE__ */ (0, z.jsx)("i", {
						className: `${G} not-italic bg-background-primary-hover text-text-secondary`,
						children: P("cleanup:duplicates.largest")
					}) : null, e.is_longest ? /* @__PURE__ */ (0, z.jsx)("i", {
						className: `${G} not-italic bg-(--keep)/22 text-(--keep)`,
						children: P("cleanup:duplicates.longest")
					}) : null]
				}) : null]
			}),
			/* @__PURE__ */ (0, z.jsxs)("span", {
				className: `${q} flex min-w-0 items-center gap-1.5`,
				children: [/* @__PURE__ */ (0, z.jsx)(u, { mark: c[e.location] || "database" }), /* @__PURE__ */ (0, z.jsx)("span", {
					title: i,
					className: "min-w-0 truncate",
					children: i
				})]
			}),
			/* @__PURE__ */ (0, z.jsx)("span", {
				className: q,
				children: T(e.size || 0)
			}),
			/* @__PURE__ */ (0, z.jsx)("span", {
				className: q,
				children: w(e.duration)
			}),
			/* @__PURE__ */ (0, z.jsx)("span", {
				className: `${q} col-start-2 -col-end-1 min-w-0 pt-0.5 wrap-anywhere max-duplicate-narrow:col-span-full`,
				children: e.path ?? ""
			})
		]
	});
}
function Z({ openItem: c, toast: u, failure: d }) {
	let f = I({
		queryKey: r,
		queryFn: ({ signal: e }) => C(e)
	}), g = I({
		queryKey: n,
		queryFn: ({ signal: e }) => S(e)
	}), [y, w] = (0, R.useState)(""), k = F({
		mutationFn: (e) => p(e, "dispose"),
		onSuccess: (e, t) => {
			J(), u(P("cleanup:duplicates.movedToTrash", { count: t.length }), { undo: async () => {
				try {
					await p(t, "restore");
				} catch (e) {
					d(P("cleanup:duplicates.undoTrash"), e);
				} finally {
					J();
				}
			} });
		},
		onSettled: () => w("")
	}), A = F({
		mutationFn: (e) => E(e.files.map((e) => e.id), !0),
		onSuccess: (e, t) => {
			J(), u(P("cleanup:duplicates.keptAll", { code: t.code }), { undo: async () => {
				try {
					await E(t.files.map((e) => e.id), !1);
				} catch (e) {
					d(P("cleanup:duplicates.undoKeepAll"), e);
				} finally {
					J();
				}
			} });
		},
		onError: (e) => d(P("cleanup:duplicates.markKeepAll"), e),
		onSettled: () => w("")
	}), j = f.data;
	if (!j) return /* @__PURE__ */ (0, z.jsx)("div", {
		className: "mx-auto w-full max-w-board",
		children: /* @__PURE__ */ (0, z.jsx)(l, {
			tone: "error",
			title: P("cleanup:duplicates.loadFailed"),
			children: f.error ? x(f.error) : P("cleanup:duplicates.listUnavailable")
		})
	});
	let N = j.groups ?? [], B = _(g.data), H = ({ groups: e, keep: t, key: n }) => {
		if (k.isPending) return;
		let r = b(e, t);
		r.length && v({
			title: P("cleanup:duplicates.moveToTrash"),
			body: P("cleanup:duplicates.trashBody", {
				count: r.length,
				keep: D(t),
				size: T(L(e, r))
			}),
			confirmLabel: P("cleanup:duplicates.moveToTrash"),
			onConfirm: () => (w(n), k.mutateAsync(r))
		});
	}, G = (e) => h(y === e && (k.isPending || A.isPending)), q = (e, t) => {
		A.isPending || k.isPending || (w(t), A.mutate(e));
	};
	return /* @__PURE__ */ (0, z.jsxs)("div", {
		className: "mx-auto w-full max-w-board pb-10.5",
		children: [
			/* @__PURE__ */ (0, z.jsx)(t, {
				label: P("cleanup:duplicates.summaryLabel"),
				figure: P("cleanup:duplicates.groupCount", { count: Number(j.total || 0) }),
				detail: P("cleanup:duplicates.summaryDetail", {
					count: Number(j.files || 0),
					size: T(j.reclaimable)
				})
			}),
			N.length ? /* @__PURE__ */ (0, z.jsxs)(a, {
				title: P("cleanup:duplicates.bulkKeep"),
				children: [
					/* @__PURE__ */ (0, z.jsx)(o, {
						busy: y === "all:largest",
						onPress: () => H({
							groups: N,
							keep: "largest",
							key: "all:largest"
						}),
						children: P("cleanup:duplicates.allKeepLargest")
					}),
					/* @__PURE__ */ (0, z.jsx)(o, {
						busy: y === "all:longest",
						onPress: () => H({
							groups: N,
							keep: "longest",
							key: "all:longest"
						}),
						children: P("cleanup:duplicates.allKeepLongest")
					}),
					m(N, B).map((e) => /* @__PURE__ */ (0, z.jsx)(o, {
						busy: y === `all:${e}`,
						onPress: () => H({
							groups: N,
							keep: e,
							key: `all:${e}`
						}),
						children: /* @__PURE__ */ (0, z.jsx)(V, {
							source: e,
							label: P("cleanup:duplicates.allPreferStorage", { storage: s[e] || e })
						})
					}, e))
				]
			}) : null,
			k.isError ? /* @__PURE__ */ (0, z.jsx)("div", {
				className: "mb-5",
				children: /* @__PURE__ */ (0, z.jsx)(l, {
					tone: "error",
					title: P("cleanup:duplicates.trashFailed"),
					children: x(k.error)
				})
			}) : null,
			N.length ? N.map((t, n) => {
				let r = [t], i = M(t.files.map((e) => e.name)), a = (e) => `${n}:${e}`;
				return /* @__PURE__ */ (0, z.jsxs)("section", {
					"aria-label": t.code,
					className: W,
					children: [/* @__PURE__ */ (0, z.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 bg-background-tertiary-default p-5 max-compact:p-4 dark:bg-background-secondary-default",
						children: [
							/* @__PURE__ */ (0, z.jsx)("b", {
								className: "text-title-2-medium text-text-primary",
								children: t.code
							}),
							/* @__PURE__ */ (0, z.jsx)("span", {
								className: "font-mono text-caption-1-regular leading-5 text-text-primary",
								children: P("cleanup:duplicates.groupDetail", {
									count: Number(t.count || 0),
									size: T(t.reclaimable)
								})
							}),
							Y(t),
							t.cross_drive ? /* @__PURE__ */ (0, z.jsx)("span", {
								className: `${K} text-text-secondary`,
								children: P("cleanup:duplicates.crossDrive", { drives: t.drives.join(" ") })
							}) : null,
							/* @__PURE__ */ (0, z.jsxs)("span", {
								className: "ml-auto flex flex-wrap gap-2 max-compact:ml-0 max-compact:w-full",
								children: [
									/* @__PURE__ */ (0, z.jsx)(e, {
										variant: "secondary",
										size: "small",
										...G(a("largest")),
										onClick: () => H({
											groups: r,
											keep: "largest",
											key: a("largest")
										}),
										children: P("cleanup:duplicates.keepLargest")
									}),
									/* @__PURE__ */ (0, z.jsx)(e, {
										variant: "secondary",
										size: "small",
										...G(a("longest")),
										onClick: () => H({
											groups: r,
											keep: "longest",
											key: a("longest")
										}),
										children: P("cleanup:duplicates.keepLongest")
									}),
									O(t.files, B).map((t) => /* @__PURE__ */ (0, z.jsx)(e, {
										variant: "secondary",
										size: "small",
										...G(a(t)),
										onClick: () => H({
											groups: r,
											keep: t,
											key: a(t)
										}),
										children: /* @__PURE__ */ (0, z.jsx)(V, {
											source: t,
											label: P("cleanup:duplicates.keepStorage", { storage: s[t] || t })
										})
									}, t)),
									/* @__PURE__ */ (0, z.jsx)(e, {
										variant: "secondary",
										size: "small",
										...G(a("keep")),
										onClick: () => q(t, a("keep")),
										children: P("cleanup:duplicates.keepAll")
									}),
									/* @__PURE__ */ (0, z.jsx)(e, {
										variant: "danger",
										size: "small",
										...G(a("all")),
										onClick: () => H({
											groups: r,
											keep: "all",
											key: a("all")
										}),
										children: P("cleanup:duplicates.trashGroup")
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, z.jsx)("div", { children: t.files.map((e) => /* @__PURE__ */ (0, z.jsx)(X, {
						file: e,
						prefix: i,
						openItem: c
					}, e.id)) })]
				}, `${t.code}-${n}`);
			}) : /* @__PURE__ */ (0, z.jsx)(i, {
				icon: U,
				title: P("cleanup:duplicates.emptyTitle"),
				children: P("cleanup:duplicates.emptyBody")
			}),
			N.length > 0 && j.total > N.length ? /* @__PURE__ */ (0, z.jsx)("p", {
				className: "text-center text-caption-1-regular text-text-secondary",
				children: P("cleanup:duplicates.topGroups", {
					shown: N.length.toLocaleString(),
					count: Number(j.total)
				})
			}) : null,
			j.kept ? /* @__PURE__ */ (0, z.jsx)("p", {
				className: "mt-2 text-center text-caption-1-regular text-text-secondary",
				children: P("cleanup:duplicates.keptHidden", { count: j.kept })
			}) : null
		]
	});
}
export { Z as DuplicatesPage };

//# debugId=927b4cdf-badf-4de6-9fd2-0ac754ae4818