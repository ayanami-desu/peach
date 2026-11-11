(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "a14017a2-12fe-47ec-8883-25d622e5e2d2", e._sentryDebugIdIdentifier = "sentry-dbid-a14017a2-12fe-47ec-8883-25d622e5e2d2");
	} catch {}
})();
import { __toESM as e, queryClient as t, require_react as n, useMutation as r, useQuery as i } from "./peach-app.js";
// src/react/background-job.ts
var a = /* @__PURE__ */ e(n(), 1), o = 2e3, s = (e) => e, c = (e, t) => t;
function l(e) {
	let { queryKey: n, jobOf: l = s, withJob: u = c, idlePollMs: d } = e, [f, p] = (0, a.useState)(!1), [m, h] = (0, a.useState)(null), g = (0, a.useRef)(e);
	(0, a.useEffect)(() => {
		g.current = e;
	});
	let _ = i({
		queryKey: n,
		queryFn: ({ signal: e }) => g.current.queryFn({ signal: e }),
		refetchInterval: (e) => {
			let t = e.state.data;
			return t !== void 0 && l(t)?.status === "running" ? o : d ?? !1;
		}
	}), v = r({
		mutationFn: (e) => g.current.start(e),
		onSuccess: (e) => {
			p(!0), h(null), g.current.onStarted?.(e), t.setQueryData(n, (t) => u(t, e)), t.invalidateQueries({
				queryKey: n,
				exact: !0
			});
		},
		onError: (e) => g.current.onError?.(e)
	}), y = _.data === void 0 ? void 0 : l(_.data), b = y?.status === "running";
	return (0, a.useEffect)(() => {
		y && (y.status === "running" ? f || p(!0) : f && (p(!1), h(y), g.current.onFinish?.(y)));
	}, [y, f]), {
		query: _,
		job: y,
		running: b,
		outcome: m,
		start: v,
		dismiss: () => h(null)
	};
}
export { l as useBackgroundJob };

//# debugId=a14017a2-12fe-47ec-8883-25d622e5e2d2