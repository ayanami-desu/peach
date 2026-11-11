(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "5bb14a87-8f80-4aad-9e5e-95aec36bc79a", e._sentryDebugIdIdentifier = "sentry-dbid-5bb14a87-8f80-4aad-9e5e-95aec36bc79a");
	} catch {}
})();
import { ApiError as e, Button as t, CONFIGURATION_KEY as n, Checkbox as r, Chip as i, E3 as a, ErrorText as o, Eu as s, Fact as c, FactList as l, Footer as u, Help as d, Input as f, L1 as p, Note as m, ProcessingMode as h, Rows as g, SETTINGS_KEY as _, Section as v, SectionSkeleton as y, SettingsRow as b, SortableBoardTabs as x, Stack as S, Uz as C, __toESM as w, _p as T, apiGet as E, apiSend as D, busyProps as O, confirmModal as k, d6 as A, devicesSkeleton as j, errorMessage as M, fetchConfiguration as N, fetchSettings as ee, l1 as te, rememberShape as ne, require_jsx_runtime as re, require_react as ie, useAction as P, useQuery as F, useQueryClient as I, useSaveSettings as ae, z3 as L } from "./peach-app.js";
// src/react/settings/password-pair.tsx
var R = /* @__PURE__ */ w(ie(), 1), z = re();
function oe({ label: e, password: t, confirmation: n, onPassword: r, onConfirmation: i, disabled: a = !1, passwordError: o, passwordHint: s, confirmationError: c, confirmationInvalid: l = !1 }) {
	return /* @__PURE__ */ (0, z.jsxs)(z.Fragment, { children: [/* @__PURE__ */ (0, z.jsx)(f, {
		id: "access-password",
		type: "password",
		label: e,
		autoComplete: "new-password",
		maxLength: 256,
		value: t,
		onChange: r,
		isDisabled: a,
		isRequired: !a,
		validationBehavior: "aria",
		isInvalid: !a && !!o,
		hint: a ? s : o || s
	}), /* @__PURE__ */ (0, z.jsx)(f, {
		id: "access-confirm",
		type: "password",
		label: "确认访问密码",
		autoComplete: "new-password",
		maxLength: 256,
		value: n,
		onChange: i,
		isDisabled: a,
		isRequired: !a,
		validationBehavior: "aria",
		isInvalid: !a && (!!c || l),
		hint: a ? void 0 : c
	})] });
}
// src/react/settings/access-settings.tsx
var se = {
	legacy: "当前使用系统生成的访问口令。改设自己的密码，或关闭登录要求。",
	locked: "访问设置无法读取，请在本机检查配置文件。",
	password: "已设置密码。新设备需要登录，登录时勾选「保持登录」可保持 30 天。"
};
function ce({ initial: n, receipt: i, devices: a, after: s }) {
	let [c, l] = (0, R.useState)(n), [p, h] = (0, R.useState)(""), [g, _] = (0, R.useState)(""), [y, b] = (0, R.useState)(""), [x, C] = (0, R.useState)(!1), [w, T] = (0, R.useState)({}), E = (0, R.useRef)(null), k = P(), A = (t) => {
		t.preventDefault();
		let n = {};
		c.mode === "password" && !p && (n.current_password = "请输入当前访问密码"), x || ((g.length < 8 || g.length > 256) && (n.password = "访问密码需为 8–256 个字符"), g !== y && (n.confirmation = "两次输入的密码不一致")), T(n), Object.keys(n).length ? requestAnimationFrame(() => E.current?.querySelector("input[aria-invalid=\"true\"]")?.focus()) : k.run("save", (e) => D("/api/configuration/access", {
			revision: c.revision,
			action: x ? "disable" : "set",
			confirm_disable: x,
			current_password: p,
			password: x ? "" : g,
			confirmation: x ? "" : y
		}, "POST", e), (e) => {
			l(e), h(""), _(""), b(""), C(!1), T({}), i(e.mode === "open" ? "已关闭访问密码" : "已保存配置");
		}, (t) => {
			let n = t instanceof e ? t.body : null, r = n?.errors || n?.detail?.errors;
			r ? T(r) : k.setError(M(t));
		});
	}, j = se[c.mode], N = c.mode !== "locked";
	return /* @__PURE__ */ (0, z.jsxs)(z.Fragment, { children: [
		/* @__PURE__ */ (0, z.jsxs)(v, {
			guide: "access",
			title: "访问密码",
			onSubmit: A,
			children: [/* @__PURE__ */ (0, z.jsx)("div", {
				ref: E,
				children: /* @__PURE__ */ (0, z.jsxs)(S, { children: [
					j ? /* @__PURE__ */ (0, z.jsx)(d, { children: j }) : null,
					c.mode === "open" ? /* @__PURE__ */ (0, z.jsx)(m, {
						tone: "warning",
						title: "未设置访问密码",
						children: "能连接到 Peach 的设备打开地址就能看馆藏，不需要登录。"
					}) : null,
					c.mode === "password" || c.mode === "legacy" ? /* @__PURE__ */ (0, z.jsx)(r, {
						isSelected: x,
						onChange: C,
						children: "关闭访问密码"
					}) : null,
					c.mode === "password" ? /* @__PURE__ */ (0, z.jsx)(f, {
						id: "access-current",
						type: "password",
						label: "当前访问密码",
						autoComplete: "current-password",
						maxLength: 256,
						value: p,
						onChange: h,
						isRequired: !0,
						validationBehavior: "aria",
						isInvalid: !!w.current_password,
						hint: w.current_password
					}) : null,
					N && !x ? /* @__PURE__ */ (0, z.jsx)(oe, {
						label: c.mode === "password" ? "新访问密码" : "设置访问密码",
						password: g,
						confirmation: y,
						onPassword: _,
						onConfirmation: b,
						passwordError: w.password,
						confirmationError: w.confirmation,
						passwordHint: "至少 8 个字符。保存后其他设备需要重新登录。"
					}) : null,
					x ? /* @__PURE__ */ (0, z.jsx)(m, {
						tone: "warning",
						title: "访问范围",
						children: "保存后，能连接到 Peach 的设备将直接访问馆藏。"
					}) : null,
					k.error ? /* @__PURE__ */ (0, z.jsx)(o, { children: k.error }) : null
				] })
			}), N ? /* @__PURE__ */ (0, z.jsx)(u, { children: /* @__PURE__ */ (0, z.jsx)(t, {
				type: "submit",
				...O(k.busy === "save"),
				children: "保存配置"
			}) }) : null]
		}),
		a && (c.mode === "password" || c.mode === "legacy") ? a(c) : null,
		s ? s(c) : null
	] });
}
// src/react/settings/api-token-settings.tsx
var le = "/api/configuration/access/token/rotate";
function ue(e, t) {
	let n = "用旧口令的脚本和 API 调用会立即失效。", r = e === "legacy" ? `其他浏览器现在用这串口令登录，会全部退出，需要输入新口令重新登录；本机保持登录。${n}` : e === "open" ? `浏览器不需要登录，不受影响。${n}` : `用访问密码登录的浏览器不受影响。${n}`;
	return t ? `${r}另一台电脑要换成同一份口令文件，两台之间才能继续互取复核结果。` : r;
}
function de({ initial: e, mode: n, receipt: r }) {
	let [i, a] = (0, R.useState)(e), [o, s] = (0, R.useState)(null), c = P(), l = I();
	return /* @__PURE__ */ (0, z.jsxs)(v, {
		guide: "token",
		title: "访问口令",
		children: [/* @__PURE__ */ (0, z.jsxs)(S, { children: [
			/* @__PURE__ */ (0, z.jsx)(d, { children: "脚本和 API 调用在 X-Token 请求头里携带访问口令。口令只存在这台电脑上，页面不显示。" }),
			o ? /* @__PURE__ */ (0, z.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, z.jsxs)("div", {
						className: "flex min-w-0 flex-wrap items-end gap-2",
						children: [/* @__PURE__ */ (0, z.jsx)(f, {
							className: "min-w-0 flex-1",
							label: "新访问口令",
							value: o.token,
							isReadOnly: !0,
							autoComplete: "off"
						}), /* @__PURE__ */ (0, z.jsx)(t, {
							variant: "secondary",
							"aria-label": "复制新访问口令",
							onClick: () => void c.run("copy", () => navigator.clipboard.writeText(o.token), () => r("已复制口令")),
							children: "复制口令"
						})]
					}),
					c.error ? /* @__PURE__ */ (0, z.jsx)(d, {
						role: "status",
						children: "复制失败，请选中口令复制。"
					}) : null,
					/* @__PURE__ */ (0, z.jsx)(m, {
						tone: "info",
						title: "新口令只显示这一次",
						children: "已经生效，不用重启。离开本页后不再显示，之后在终端运行 peach token 查看。"
					})
				]
			}) : null,
			o?.relogin ? /* @__PURE__ */ (0, z.jsx)(m, {
				tone: "warning",
				title: "本机需要重新登录",
				children: "刷新页面后用新口令登录。"
			}) : null,
			i.rotatable ? null : /* @__PURE__ */ (0, z.jsx)(d, { children: i.reason })
		] }), i.rotatable ? /* @__PURE__ */ (0, z.jsx)(u, {
			status: "更换后立即生效。",
			children: /* @__PURE__ */ (0, z.jsx)(t, {
				variant: "secondary",
				onClick: () => void k({
					title: "更换访问口令",
					body: ue(n, i.paired),
					confirmLabel: "更换口令",
					onConfirm: async () => {
						let e = await D(le, {});
						a(e), s(e), e.mode === "legacy" && l.invalidateQueries({ queryKey: ["access-sessions"] }), r(e.signed_out ? `已更换访问口令，${e.signed_out} 台设备需要重新登录` : "已更换访问口令");
					}
				}),
				children: "更换口令"
			})
		}) : null]
	});
}
// src/react/settings/configuration-panel.ts
var B = "flex flex-col gap-6";
function V(e) {
	return e ? {
		className: e.active ? `${B} ui-board-group-active` : B,
		"data-board-group": String(e.index),
		id: e.id,
		role: "tabpanel",
		"aria-labelledby": e.labelledBy
	} : { className: B };
}
var fe = {
	version: 1,
	note: "浏览器品牌标识仅用于识别相应数据源；商标归各自所有者。",
	icons: [
		{
			id: "chrome",
			aliases: [
				"chrome",
				"Google Chrome",
				"谷歌浏览器"
			],
			file: "chrome.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/chrome/chrome_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "eccdfe9d867373e2da66eedfcaaab40cbcdf6a221b83d6ee1400895a3e4c8046",
			bytes: 3166
		},
		{
			id: "chrome-beta",
			aliases: ["chrome-beta", "chrome beta"],
			file: "chrome-beta.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/chrome-beta/chrome-beta_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "34d7c73511f666e282e6ffca64315b53c287402de0e594976574a20e9031434f",
			bytes: 3731
		},
		{
			id: "chrome-dev",
			aliases: ["chrome-dev", "chrome dev"],
			file: "chrome-dev.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/chrome-dev/chrome-dev_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "3cc498eae83afeefb6f3ab5d24f4edead0ce6597e3afb91e4dcdaff923bb5a0a",
			bytes: 3706
		},
		{
			id: "chrome-canary",
			aliases: ["chrome-canary", "chrome canary"],
			file: "chrome-canary.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/chrome-canary/chrome-canary_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "590d38919b0c3df5dffeb1d4cbe9a24b211920932bcc367778f4962270e0997c",
			bytes: 1858
		},
		{
			id: "chromium",
			aliases: ["chromium", "Chromium浏览器"],
			file: "chromium.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/chromium/chromium_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "9fc23dba1ec6765aee3e6c200ee1b77a7e4ac56a25dd5a89027d3b01f3389d21",
			bytes: 2035
		},
		{
			id: "edge",
			aliases: [
				"edge",
				"Microsoft Edge",
				"微软Edge"
			],
			file: "edge.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/edge/edge_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "a189a6054451f74073ba27c9e0ff35f46402263a2f883a74b9f6a89bb42b7975",
			bytes: 3574
		},
		{
			id: "edge-beta",
			aliases: ["edge-beta", "edge beta"],
			file: "edge-beta.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/edge-beta/edge-beta_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "074d4b135e89f1621d55a48831196b5c95b27084e15ffeee7bd3ef869a06e394",
			bytes: 3820
		},
		{
			id: "edge-dev",
			aliases: ["edge-dev", "edge dev"],
			file: "edge-dev.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/edge-dev/edge-dev_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "70df54bb62d68ae61f042b54bced912ba87f334675b625963fa82bba172e2501",
			bytes: 3671
		},
		{
			id: "edge-canary",
			aliases: ["edge-canary", "edge canary"],
			file: "edge-canary.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/edge-canary/edge-canary_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "b0ec80dc2b855f7dc6b4ecee8735c3a397d5803a7a4801011c545d765e5ac705",
			bytes: 3728
		},
		{
			id: "firefox",
			aliases: [
				"firefox",
				"Mozilla Firefox",
				"火狐浏览器"
			],
			file: "firefox.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/firefox/firefox_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "98c4837a6cdce28d66cd51ea1e13cf130a5ac7bd097579a6714ad8345c16d3c9",
			bytes: 3943
		},
		{
			id: "firefox-beta",
			aliases: ["firefox-beta", "firefox beta"],
			file: "firefox-beta.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/firefox-beta/firefox-beta_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "2f25600de1c538cdf5965541c1f4960ef0a0da76fc0030b5a36af8288b9dac94",
			bytes: 4365
		},
		{
			id: "firefox-developer-edition",
			aliases: [
				"firefox-developer-edition",
				"firefox developer edition",
				"Firefox Developer Edition",
				"Firefox Dev"
			],
			file: "firefox-developer-edition.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/firefox-developer-edition/firefox-developer-edition_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "482ee0acf9deccbaf0253801f0a2ded2798b33166e3696fc1ae97f15788a335c",
			bytes: 4463
		},
		{
			id: "firefox-nightly",
			aliases: ["firefox-nightly", "firefox nightly"],
			file: "firefox-nightly.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/firefox-nightly/firefox-nightly_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "4082cba90a03962cd7be1ef6a8e7b3915d8b8e5411f919fbeb4d4f62684aa4cb",
			bytes: 4124
		},
		{
			id: "brave",
			aliases: ["brave"],
			file: "brave.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/brave/brave_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "fc67ee59d32612dc08eac9461fae8840441e888cceae7c07465ebdbfa58c5d63",
			bytes: 2416
		},
		{
			id: "brave-beta",
			aliases: ["brave-beta", "brave beta"],
			file: "brave-beta.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/brave-beta/brave-beta_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "fb029b4501f68c803429385b496bee9c3ce16710f8f12f9bae9f7db74bce2e1a",
			bytes: 3085
		},
		{
			id: "brave-dev",
			aliases: ["brave-dev", "brave dev"],
			file: "brave-dev.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/brave-dev/brave-dev_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "1797ab7fc86b1952851082f1dbeb7ff6816525d2654cdc0e455f7dd6d109a0da",
			bytes: 3837
		},
		{
			id: "brave-nightly",
			aliases: ["brave-nightly", "brave nightly"],
			file: "brave-nightly.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/brave-nightly/brave-nightly_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "e2f0e7506642d7491521f10250d0ede60c2a1e89ea7fdb6f8a2a366189643de4",
			bytes: 3929
		},
		{
			id: "vivaldi",
			aliases: ["vivaldi"],
			file: "vivaldi.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/vivaldi/vivaldi_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "2cef8b72a605bfd4b3a665e88773ff6e915972db1e874fd3373f34d8e43c03d1",
			bytes: 2657
		},
		{
			id: "vivaldi-snapshot",
			aliases: ["vivaldi-snapshot", "vivaldi snapshot"],
			file: "vivaldi-snapshot.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/vivaldi-snapshot/vivaldi-snapshot_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "d7adcb47765e5982d50565a4db328c6656d19503252f49855ae891dc655df22e",
			bytes: 2286
		},
		{
			id: "opera",
			aliases: ["opera"],
			file: "opera.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/opera/opera_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "907f47f584ca0f83446680a2ce1b4dc4dc81ac2e2bec0090e5b4ac98ccade4d4",
			bytes: 2152
		},
		{
			id: "opera-beta",
			aliases: ["opera-beta", "opera beta"],
			file: "opera-beta.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/opera-beta/opera-beta_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "1a5164ba569241ac87ceb2878190a261d52a63e4218ee16290f6adde7fe1380e",
			bytes: 4225
		},
		{
			id: "opera-developer",
			aliases: ["opera-developer", "opera developer"],
			file: "opera-developer.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/opera-developer/opera-developer_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "b5f0fbb90b11daa64b1642beddb00ae73120f46184f6a31e83584a6d2c91efc2",
			bytes: 3854
		},
		{
			id: "opera-gx",
			aliases: ["opera-gx", "opera gx"],
			file: "opera-gx.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/opera-gx/opera-gx_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "d92a6e2dbecfdbc0e4986d6eabce5f7c75804699fe8a7b64fe0c0167617a7d0e",
			bytes: 1504
		},
		{
			id: "opera-neon",
			aliases: ["opera-neon", "opera neon"],
			file: "opera-neon.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/opera-neon/opera-neon_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "12d0a029aa3f3b5e70805bb2c39304efdb1db75e59e9ba89f05f880dc0b6aa1a",
			bytes: 3385
		},
		{
			id: "opera-mini",
			aliases: ["opera-mini", "opera mini"],
			file: "opera-mini.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/opera-mini/opera-mini_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "2509f1615ead4c8ddb25dfcc6024ba2e2b98f4da2a012a4039882597903646f9",
			bytes: 3009
		},
		{
			id: "safari",
			aliases: ["safari", "Apple Safari"],
			file: "safari.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/safari/safari_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "5a4608283c36615ebcfb0762f64cfe5706b03bfdcedc5810fe10ee883ca4fff0",
			bytes: 4497
		},
		{
			id: "safari-technology-preview",
			aliases: ["safari-technology-preview", "safari technology preview"],
			file: "safari-technology-preview.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/safari-technology-preview/safari-technology-preview_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "29a6403e566b4b53f125bcdb7381d86eb14558e84d7ff4eb9f74e559fd4d8c72",
			bytes: 4404
		},
		{
			id: "samsung-internet",
			aliases: [
				"samsung-internet",
				"samsung internet",
				"Samsung Internet Browser"
			],
			file: "samsung-internet.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/samsung-internet/samsung-internet_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "239c8d26b38cba9fa9468555a93637b29de64d2f0f2769ddd007d78c564288b0",
			bytes: 1814
		},
		{
			id: "tor",
			aliases: ["tor"],
			file: "tor.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/tor/tor_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "54bae0a77f813c2c9bf7594b52e98931630a450a5ea42dced26e0df3f432fe01",
			bytes: 3685
		},
		{
			id: "tor-alpha",
			aliases: ["tor-alpha", "tor alpha"],
			file: "tor-alpha.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/tor-alpha/tor-alpha_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "9b8b2dfae28ac7fcb452e25225ce337b954ab9c8dc7939364ed1219c9c42864a",
			bytes: 3643
		},
		{
			id: "yandex",
			aliases: ["yandex"],
			file: "yandex.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/yandex/yandex_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "803d73b46b135e783ef9984a35ffcb0b43f31cfe8d6be4a1371598ebdc549f89",
			bytes: 3139
		},
		{
			id: "uc",
			aliases: ["uc", "UC浏览器"],
			file: "uc.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/uc/uc_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "7bfd919258b12a5900a8d19eabe1a16a0f7f50eaebe872fb7f13f6929cdf4c1e",
			bytes: 2853
		},
		{
			id: "dolphin",
			aliases: ["dolphin"],
			file: "dolphin.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/dolphin/dolphin_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "2c796d4a3ac4303edc73e33c3a36d709fbaa644b701d98ca1460aa6679c19aa9",
			bytes: 2018
		},
		{
			id: "maxthon",
			aliases: [
				"maxthon",
				"傲游",
				"傲游浏览器"
			],
			file: "maxthon.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/maxthon/maxthon_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "f807f58b4a0550a5470a713a4737054c5d5ecebe61687c77e77b2bfab1c544c5",
			bytes: 1375
		},
		{
			id: "midori",
			aliases: ["midori"],
			file: "midori.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/midori/midori_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "b3149a3d9dcbe8158078f8c47a39e839c2609f2dbce574e6175d4ef7f381f0d4",
			bytes: 4288
		},
		{
			id: "falkon",
			aliases: ["falkon"],
			file: "falkon.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/falkon/falkon_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "93992beb736d43622ddc085b41955aea13a735c011928c56076b5ed5c74d694c",
			bytes: 4285
		},
		{
			id: "pale-moon",
			aliases: ["pale-moon", "pale moon"],
			file: "pale-moon.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/pale-moon/pale-moon_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "6ffacc33960787e0411897a33524bb03c78df9204cf7dbfc5f063f4b5e73d5e1",
			bytes: 4771
		},
		{
			id: "seamonkey",
			aliases: ["seamonkey"],
			file: "seamonkey.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/seamonkey/seamonkey_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "37dd8ccb6700d83b030614329253af2ac68c44084c887a2d5ca10ea91aa066a5",
			bytes: 4525
		},
		{
			id: "web",
			aliases: [
				"web",
				"Epiphany",
				"GNOME Web"
			],
			file: "web.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/web/web_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "3f149719ecd35cefa8dae87a699550fbfa44b4d2d3b4b4c90ade545c3b9754a8",
			bytes: 2678
		},
		{
			id: "qutebrowser",
			aliases: ["qutebrowser"],
			file: "qutebrowser.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/qutebrowser/qutebrowser_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "8134a7f55a2ca191361ba3ecc5219e3d707a945c7e91e38da310ee12ffeee3eb",
			bytes: 3818
		},
		{
			id: "epic",
			aliases: ["epic"],
			file: "epic.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/epic/epic_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "53dfd851e21ab4f0727891cb2e330503cc250c05216d825be016e84e98ea4dd4",
			bytes: 5534
		},
		{
			id: "icecat",
			aliases: ["icecat"],
			file: "icecat.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/icecat/icecat_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "828718a56d67123abe3526fd42835ffbbb05769791922c2a0564dae92762ecc9",
			bytes: 5700
		},
		{
			id: "basilisk",
			aliases: ["basilisk"],
			file: "basilisk.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/basilisk/basilisk_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "9a0b3f467fe972e7a3e805fcc4b719eccfb1bb1d29d9a9f3afec7cc9dc2349f3",
			bytes: 2331
		},
		{
			id: "avant",
			aliases: ["avant"],
			file: "avant.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/avant/avant_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "a4c66ad8bc25ce59f71713f7c93629cd17b989d886cb8beacf178730631b01a5",
			bytes: 4586
		},
		{
			id: "otter",
			aliases: ["otter"],
			file: "otter.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/otter/otter_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "8fea2736a78b36e8c9eabfd5c47e7b46f28209aa9f1e2a199a54cfeeac290812",
			bytes: 5220
		},
		{
			id: "netsurf",
			aliases: ["netsurf"],
			file: "netsurf.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/netsurf/netsurf_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "d57d4ff6fb7052d5228932da17955232ecc5051908cf6580d73c6db3d2b248bd",
			bytes: 4003
		},
		{
			id: "puffin",
			aliases: ["puffin"],
			file: "puffin.png",
			content_type: "image/png",
			source_url: "https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/puffin/puffin_48x48.png",
			source_page: "https://github.com/alrra/browser-logos",
			revision: "58881b84c4d73adc03c06fa2c275a7abee02d935",
			license: "Logo and trademark belong to the browser owner",
			sha256: "e182c2f54a37e0e1ff6a9469f1cb65bb8299f9b5eaca162c29b7cb9f6cc79768",
			bytes: 3697
		},
		{
			id: "aside",
			aliases: ["aside", "Aside Browser"],
			file: "aside.png",
			content_type: "image/png",
			source_url: "https://aside.com/icon.png?icon.0lfc1q-r_ms2e.png",
			source_page: "https://aside.com/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "949971a69f8643358bd52875a02a53e60136a88790487c83e42a24cb39f0adea",
			bytes: 27423
		},
		{
			id: "zen",
			aliases: ["zen", "Zen Browser"],
			file: "zen.svg",
			content_type: "image/svg+xml",
			source_url: "https://zen-browser.app/favicon.svg",
			source_page: "https://zen-browser.app/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "090a9ce0283dc66359be584bd1db9227faf4f15fc666f261759852e2519c7c68",
			bytes: 531
		},
		{
			id: "qq",
			aliases: [
				"qq",
				"QQBrowser",
				"QQ浏览器"
			],
			file: "qq.ico",
			content_type: "image/x-icon",
			source_url: "https://browser.qq.com/favicon.ico",
			source_page: "https://browser.qq.com/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "0c4cfdc5683b15f0b3b1019db71edfa975cadccbd61ce2f340acbdc4b114dbed",
			bytes: 2047
		},
		{
			id: "360se",
			aliases: ["360se", "360安全浏览器"],
			file: "360se.png",
			content_type: "image/png",
			source_url: "https://p4.ssl.qhimg.com/t110b9a93016f838be146a5b14d.png",
			source_page: "https://browser.360.cn/se/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "3363c9c2dd239ab6ac3a59501bf609cc2a94664ab5a1b8f0f0a2bec21aaab34a",
			bytes: 2219
		},
		{
			id: "360chrome",
			aliases: ["360chrome", "360极速浏览器"],
			file: "360chrome.ico",
			content_type: "image/x-icon",
			source_url: "https://browser.360.cn/ee/favicon.ico",
			source_page: "https://browser.360.cn/ee/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "eb11e02318a389cf4b9e06a8ca66694d2d544fbe8bfd28555e2189727675bd8e",
			bytes: 5430
		},
		{
			id: "sogou",
			aliases: [
				"sogou",
				"搜狗",
				"搜狗浏览器",
				"Sogou Explorer"
			],
			file: "sogou.ico",
			content_type: "image/x-icon",
			source_url: "https://sogou.browser.qq.com/favicon.ico",
			source_page: "https://ie.sogou.com/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "d9b78205c61561e23594886cc7bd24a5842a36602384f059efe670455c40c74f",
			bytes: 5430
		},
		{
			id: "arc",
			aliases: ["arc"],
			file: "arc.png",
			content_type: "image/png",
			source_url: "https://arc.net/favicon.png",
			source_page: "https://arc.net/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "2e6881ee4ea7b22e3bdd97f2432b7ce5bb3e3d5bbbdb5457a4a4f8b69a43e7bd",
			bytes: 1586
		},
		{
			id: "librewolf",
			aliases: ["librewolf"],
			file: "librewolf.svg",
			content_type: "image/svg+xml",
			source_url: "https://librewolf.net/icon.svg",
			source_page: "https://librewolf.net/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "b85d68f1b5b47b9b2c3a3e6b5f5a0f887577e0eb6ee8387fb7b81f5f8e4017c4",
			bytes: 5916
		},
		{
			id: "floorp",
			aliases: ["floorp"],
			file: "floorp.svg",
			content_type: "image/svg+xml",
			source_url: "https://floorp.app/icon.svg?51b46abeef3fc9d9",
			source_page: "https://floorp.app/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "15cf85f15cd722524008cb621763eb8560561048df210cf3a6180732c254f49b",
			bytes: 2199
		},
		{
			id: "waterfox",
			aliases: ["waterfox"],
			file: "waterfox.svg",
			content_type: "image/svg+xml",
			source_url: "https://www.waterfox.com/favicons/favicon.svg",
			source_page: "https://www.waterfox.net/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "05294e9a22b85b32fa632657ac3c2258f56d37f30931ababc494fe8a4b86ea7a",
			bytes: 9266
		},
		{
			id: "duckduckgo",
			aliases: ["duckduckgo"],
			file: "duckduckgo.png",
			content_type: "image/png",
			source_url: "https://duckduckgo.com/static-assets/favicons/DDG-iOS-icon_152x152.png",
			source_page: "https://duckduckgo.com/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "f6e52a35e8854ebf14c9b8442302f6f7d5d0063f0215b7210edf4676d7fd7369",
			bytes: 3576
		},
		{
			id: "115",
			aliases: [
				"115",
				"115浏览器",
				"115 Browser"
			],
			file: "115.ico",
			content_type: "image/x-icon",
			source_url: "https://115.com/",
			source_page: "https://115.com/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "fba0c364bb745bef18683be03f08b086cb5e46498b8c1dbd32ecdee6624303fe",
			bytes: 63051,
			extraction: {
				method: "PE resource extraction",
				executable: "115chrome.exe",
				executable_sha256: "31d3c29ffade6eb30504173b299d396a42758b2093c442b2adebe83f03750ae9",
				resource_group: "IDR_MAINFRAME"
			}
		},
		{
			id: "360chromex",
			aliases: [
				"360chromex",
				"360极速X",
				"360极速浏览器X"
			],
			file: "360chrome.ico",
			content_type: "image/x-icon",
			source_url: "https://browser.360.cn/ee/favicon.ico",
			source_page: "https://browser.360.cn/ee/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "eb11e02318a389cf4b9e06a8ca66694d2d544fbe8bfd28555e2189727675bd8e",
			bytes: 5430
		},
		{
			id: "quark",
			aliases: [
				"quark",
				"夸克",
				"夸克浏览器"
			],
			file: "quark.png",
			content_type: "image/png",
			source_url: "https://gw.alicdn.com/imgextra/i3/O1CN018r2tKf28YP7ev0fPF_!!6000000007944-2-tps-48-48.png",
			source_page: "https://www.quark.cn/",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "824e079d7d987305f2a0d15de5b1dfe0dc8cb7131afe1dbdaf1ea3ae3dd2d740",
			bytes: 1210
		},
		{
			id: "2345",
			aliases: [
				"2345",
				"2345浏览器",
				"2345加速浏览器"
			],
			file: "2345.png",
			content_type: "image/png",
			source_url: "https://img.onlinedown.net/download/202306/190435-649ac2436780c.png",
			source_page: "https://www.onlinedown.net/soft/111609.htm",
			revision: "",
			license: "Logo and trademark belong to the browser owner",
			sha256: "4c7a1b786d1208c89e00027c46544debe27a6f684b859cfd116b4e796703d38e",
			bytes: 29648
		}
	]
}, H = (e) => e.normalize("NFKC").toLowerCase().replace(/[\s_-]/g, ""), pe = new Map(fe.icons.flatMap((e) => e.aliases.map((t) => [H(t), e.id])));
function U(e) {
	return pe.get(H(e));
}
function W({ name: e, className: t }) {
	let [n, r] = (0, R.useState)(""), i = U(e);
	return i && n !== i ? /* @__PURE__ */ (0, z.jsx)("img", {
		src: `/browser-icon/${i}`,
		width: 24,
		height: 24,
		alt: "",
		"aria-hidden": !0,
		loading: "lazy",
		className: `${t ?? "size-6 shrink-0"} object-contain`,
		onError: () => r(i)
	}) : /* @__PURE__ */ (0, z.jsx)(a, {
		"aria-hidden": !0,
		className: `${t ?? "size-5 shrink-0"} text-foreground-icon-secondary`
	});
}
// src/react/settings/device-sessions.tsx
var G = "/api/configuration/access/sessions", K = (e) => e.device || "未识别的浏览器", q = {
	glyph: p,
	brand: "apple"
}, J = {
	glyph: te,
	brand: "android"
}, Y = {
	iPhone: {
		platform: q,
		terminal: T
	},
	iPad: {
		platform: q,
		terminal: s
	},
	Android: {
		platform: J,
		terminal: T
	},
	"Android 平板": {
		platform: J,
		terminal: s
	},
	ChromeOS: {
		platform: { browser: "chrome" },
		terminal: L
	},
	Windows: {
		platform: {
			glyph: C,
			brand: "windows"
		},
		terminal: L
	},
	macOS: {
		platform: q,
		terminal: L
	},
	Linux: { terminal: L }
}, X = "inline size-4 -mt-0.5 mr-1 align-middle";
function me({ platform: e }) {
	if ("browser" in e) return /* @__PURE__ */ (0, z.jsx)(W, {
		name: e.browser,
		className: X
	});
	let { glyph: t, brand: n } = e;
	return /* @__PURE__ */ (0, z.jsx)(t, {
		"aria-hidden": !0,
		"data-platform-mark": n,
		className: X
	});
}
function he({ row: e }) {
	if (!e.device) return K(e);
	let t = e.device.split(" · "), n = Y[t.at(-1) ?? ""] ? t.pop() : "", r = t.join(" · "), i = n ? Y[n].platform : void 0;
	return /* @__PURE__ */ (0, z.jsxs)(z.Fragment, { children: [
		r ? /* @__PURE__ */ (0, z.jsxs)(z.Fragment, { children: [U(r) ? /* @__PURE__ */ (0, z.jsx)(W, {
			name: r,
			className: X
		}) : null, r] }) : null,
		r && n ? " · " : null,
		n ? /* @__PURE__ */ (0, z.jsxs)(z.Fragment, { children: [i ? /* @__PURE__ */ (0, z.jsx)(me, { platform: i }) : null, n] }) : null
	] });
}
function ge({ row: e }) {
	let t = Y[e.device.split(" · ").at(-1) ?? ""]?.terminal ?? A;
	return /* @__PURE__ */ (0, z.jsx)(t, {
		"aria-hidden": !0,
		className: "size-5 shrink-0 text-foreground-icon-secondary"
	});
}
function _e({ row: e, children: t }) {
	return /* @__PURE__ */ (0, z.jsxs)("div", {
		className: "flex min-h-13 w-full items-center justify-between gap-4 border-b border-separator-border py-2.5 pr-2.5 last:border-b-0",
		children: [/* @__PURE__ */ (0, z.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3",
			children: [/* @__PURE__ */ (0, z.jsx)(ge, { row: e }), /* @__PURE__ */ (0, z.jsxs)("div", {
				className: "flex min-w-0 flex-col",
				children: [/* @__PURE__ */ (0, z.jsx)("p", {
					className: "text-body-regular text-text-primary",
					children: /* @__PURE__ */ (0, z.jsx)(he, { row: e })
				}), /* @__PURE__ */ (0, z.jsx)("p", {
					className: "text-body-2-regular text-text-secondary",
					children: Z(e)
				})]
			})]
		}), t]
	});
}
function ve(e, t = Date.now() / 1e3) {
	let n = Math.max(0, t - e);
	return n < 60 ? "刚刚" : n < 3600 ? `${Math.floor(n / 60)} 分钟前` : n < 86400 ? `${Math.floor(n / 3600)} 小时前` : n < 2592e3 ? `${Math.floor(n / 86400)} 天前` : (/* @__PURE__ */ new Date(e * 1e3)).toLocaleDateString("zh-CN");
}
function ye(e) {
	return e.network === "loopback" ? "运行 Peach 的电脑" : e.network ? e.remote ? `公网入口 · ${e.network}` : e.network : "";
}
var Z = (e) => [`最近活动 ${ve(e.last_seen)}`, ye(e)].filter(Boolean).join(" · ");
function be({ revision: e, receipt: t }) {
	let n = F({
		queryKey: ["access-sessions", e],
		refetchOnMount: "always",
		queryFn: ({ signal: e }) => E(G, e)
	});
	return n.error ? /* @__PURE__ */ (0, z.jsx)(v, {
		guide: "devices",
		title: "已登录的设备",
		children: /* @__PURE__ */ (0, z.jsx)(S, { children: /* @__PURE__ */ (0, z.jsx)(o, { children: M(n.error) }) })
	}) : n.isFetching || !n.data ? /* @__PURE__ */ (0, z.jsx)(y, {
		label: "正在读取已登录的设备",
		html: j
	}) : /* @__PURE__ */ (0, z.jsx)(xe, {
		initial: n.data,
		receipt: t
	});
}
function xe({ initial: e, receipt: n }) {
	let [r, a] = (0, R.useState)(e);
	(0, R.useEffect)(() => a(e), [e]);
	let o = r.sessions.filter((e) => !e.current);
	(0, R.useEffect)(() => {
		ne("devices", {
			rows: Math.min(r.sessions.length, 8),
			manageable: r.manageable && o.length > 0
		});
	}, [r, o.length]);
	let s = (e) => void k({
		title: "撤销这台设备的登录",
		body: `${K(e)}（${Z(e)}）下次打开 Peach 需要重新输入访问密码。`,
		confirmLabel: "撤销登录",
		onConfirm: async () => {
			a(await D(`${G}/revoke`, {
				revision: r.revision,
				id: e.id
			})), n("已撤销登录");
		}
	});
	return /* @__PURE__ */ (0, z.jsxs)(v, {
		guide: "devices",
		title: "已登录的设备",
		children: [
			r.sessions.length ? /* @__PURE__ */ (0, z.jsx)(g, { children: r.sessions.map((e) => /* @__PURE__ */ (0, z.jsx)(_e, {
				row: e,
				children: e.current ? /* @__PURE__ */ (0, z.jsx)(i, {
					color: "blue",
					variant: "caption",
					children: "本机"
				}) : r.manageable ? /* @__PURE__ */ (0, z.jsx)(t, {
					size: "small",
					variant: "secondary",
					"aria-label": `撤销 ${K(e)} 的登录`,
					onClick: () => s(e),
					children: "撤销"
				}) : null
			}, e.id)) }) : /* @__PURE__ */ (0, z.jsx)(S, { children: /* @__PURE__ */ (0, z.jsx)(d, { children: "还没有浏览器用访问密码登录过。" }) }),
			!r.manageable && o.length ? /* @__PURE__ */ (0, z.jsx)(S, {
				divided: !0,
				children: /* @__PURE__ */ (0, z.jsx)(d, { children: "在运行 Peach 的电脑上打开这一页才能撤销。" })
			}) : null,
			r.manageable && o.length ? /* @__PURE__ */ (0, z.jsx)(u, {
				status: "修改访问密码会让全部设备退出。",
				children: /* @__PURE__ */ (0, z.jsx)(t, {
					variant: "secondary",
					onClick: () => void k({
						title: "撤销其他设备的登录",
						body: `除本机以外的 ${o.length} 台设备下次打开 Peach 需要重新输入访问密码。`,
						confirmLabel: "撤销登录",
						onConfirm: async () => {
							let e = await D(`${G}/revoke`, {
								revision: r.revision,
								scope: "others"
							});
							a(e), n(`已撤销 ${e.removed} 台设备的登录`);
						}
					}),
					children: "撤销其他设备"
				})
			}) : null
		]
	});
}
// src/react/settings/drive-settings.tsx
var Se = ["drive"], Q = "/api/drive";
function Ce({ receipt: e }) {
	let n = I(), r = F({
		queryKey: Se,
		refetchOnMount: "always",
		queryFn: ({ signal: e }) => E(Q, e)
	});
	if (r.error) return /* @__PURE__ */ (0, z.jsxs)(v, {
		guide: "drives",
		title: "网盘",
		children: [/* @__PURE__ */ (0, z.jsx)(S, { children: /* @__PURE__ */ (0, z.jsx)(o, { children: M(r.error) }) }), /* @__PURE__ */ (0, z.jsx)(u, { children: /* @__PURE__ */ (0, z.jsx)(t, {
			variant: "secondary",
			onClick: () => {
				r.refetch();
			},
			...O(r.isFetching),
			children: "重新读取"
		}) })]
	});
	let i = r.data;
	if (!i) return /* @__PURE__ */ (0, z.jsx)(v, {
		guide: "drives",
		title: "网盘",
		children: /* @__PURE__ */ (0, z.jsx)(S, { children: /* @__PURE__ */ (0, z.jsx)(d, {
			role: "status",
			children: "正在读取网盘状态…"
		}) })
	});
	let a = () => {
		n.invalidateQueries({ queryKey: Se });
	};
	return /* @__PURE__ */ (0, z.jsx)(z.Fragment, { children: i.locations.map((t) => /* @__PURE__ */ (0, z.jsx)(we, {
		connection: t,
		publicUrl: i.public_url,
		receipt: e,
		reloaded: a
	}, t.location)) });
}
function we({ connection: e, publicUrl: n, receipt: r, reloaded: i }) {
	let [a, s] = (0, R.useState)(e);
	(0, R.useEffect)(() => s(e), [e]);
	let d = P(), [f, p] = (0, R.useState)(!1), h = `${Q}/${a.location}`, _ = n ? `${n.replace(/\/+$/, "")}/oauth/${a.location}/callback` : "", y = () => void d.run("authorize", (e) => D(`${h}/authorize`, {}, "POST", e), ({ url: e }) => {
		window.location.assign(e);
	}), x = () => void d.run("refresh", (e) => D(`${h}/refresh`, {}, "POST", e), (e) => {
		s(e), r(`已安排刷新 ${e.label}，下一轮同步先做这个来源`);
	}), C = (e) => void d.run("roots", (t) => D(`${h}/roots`, { roots: e }, "POST", t), () => {
		p(!1), r("已保存扫描起点"), i();
	});
	return /* @__PURE__ */ (0, z.jsxs)(v, {
		guide: "account",
		title: a.label,
		children: [
			/* @__PURE__ */ (0, z.jsxs)(S, { children: [
				a.configured ? null : /* @__PURE__ */ (0, z.jsx)(m, {
					tone: "warning",
					title: `${a.label} 还没有接入`,
					children: `在设置文件的 [drive.accounts.${a.location}] 段填好 client_id 与 client_secret，并在 [drive] 段的 public_url 填上这台 Peach 的 https 地址，保存后回到这一页授权。`
				}),
				a.configured && !a.connected && !_ ? /* @__PURE__ */ (0, z.jsx)(m, {
					tone: "warning",
					title: "没有配置回调基址",
					children: `网盘授权要回到这台 Peach：先在设置文件的 [drive] 段填好 public_url（https 地址），网盘后台登记的回调地址是 public_url 加上 /oauth/${a.location}/callback。`
				}) : null,
				/* @__PURE__ */ (0, z.jsxs)(l, { children: [
					/* @__PURE__ */ (0, z.jsx)(c, {
						term: "账号",
						children: a.connected ? a.email || a.display_name || "已授权" : "未授权"
					}),
					/* @__PURE__ */ (0, z.jsx)(c, {
						term: "扫描起点",
						children: a.roots.length ? `${a.roots.length} 个目录` : "账号根目录"
					}),
					/* @__PURE__ */ (0, z.jsx)(c, {
						term: "上次同步",
						children: a.synced_at || "还没有同步过"
					})
				] }),
				a.last_error ? /* @__PURE__ */ (0, z.jsx)(m, {
					tone: "warning",
					title: "上次同步失败",
					children: a.last_error
				}) : null,
				d.error ? /* @__PURE__ */ (0, z.jsx)(o, { children: d.error }) : null
			] }),
			a.roots.length ? /* @__PURE__ */ (0, z.jsx)(g, { children: a.roots.map((e) => /* @__PURE__ */ (0, z.jsx)(b, {
				label: e.name,
				description: e.remote_id,
				children: /* @__PURE__ */ (0, z.jsx)(t, {
					size: "small",
					variant: "secondary",
					"aria-label": `移除扫描起点 ${e.name}`,
					onClick: () => C(a.roots.filter((t) => t.remote_id !== e.remote_id)),
					...O(d.busy === "roots"),
					children: "移除"
				})
			}, e.remote_id)) }) : null,
			f && a.connected ? /* @__PURE__ */ (0, z.jsx)(Te, {
				connection: a,
				receipt: r,
				onClose: () => p(!1),
				onSaved: () => {
					p(!1), i();
				}
			}) : null,
			/* @__PURE__ */ (0, z.jsxs)(u, {
				status: a.connected ? null : `回调地址 ${_ || "未配置"}`,
				children: [
					a.connected ? /* @__PURE__ */ (0, z.jsx)(t, {
						variant: "secondary",
						onClick: () => p(!f),
						children: f ? "收起目录" : "选择扫描起点"
					}) : null,
					a.connected ? /* @__PURE__ */ (0, z.jsx)(t, {
						variant: "secondary",
						onClick: () => void k({
							title: `断开 ${a.label}`,
							body: `Peach 会忘掉 ${a.email || a.display_name || "这个网盘"} 的账号与扫描起点，之后不再同步它。已经登记进馆藏的条目不动；重新授权后可以接着同步。`,
							confirmLabel: "断开",
							danger: !0,
							onConfirm: async () => {
								await D(h, {}, "DELETE"), r(`已断开 ${a.label}`), i();
							}
						}),
						children: "断开"
					}) : null,
					a.connected ? /* @__PURE__ */ (0, z.jsx)(t, {
						variant: "secondary",
						onClick: x,
						...O(d.busy === "refresh"),
						children: "立即刷新"
					}) : null,
					a.configured ? /* @__PURE__ */ (0, z.jsx)(t, {
						onClick: y,
						disabled: !_,
						...O(d.busy === "authorize"),
						children: a.connected ? "重新授权" : "开始授权"
					}) : null
				]
			})
		]
	});
}
function Te({ connection: e, receipt: n, onSaved: r, onClose: i }) {
	let [a, s] = (0, R.useState)([]), c = a[a.length - 1], l = F({
		queryKey: [
			"drive-folders",
			e.location,
			c?.remote_id ?? ""
		],
		refetchOnMount: "always",
		queryFn: ({ signal: t }) => E(`${Q}/${e.location}/folders?parent_id=${encodeURIComponent(c?.remote_id ?? "")}`, t)
	}), u = P(), f = !!(c && e.roots.some((e) => e.remote_id === c.remote_id)), p = l.data?.parent_id, m = [p ? e.roots.find((e) => e.remote_id === p)?.name ?? p : "账号根目录", ...a.map((e) => e.name)].join(" / ");
	return /* @__PURE__ */ (0, z.jsxs)(z.Fragment, { children: [
		/* @__PURE__ */ (0, z.jsxs)(S, {
			divided: !0,
			children: [
				/* @__PURE__ */ (0, z.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, z.jsx)(d, {
						role: "status",
						children: m
					}), /* @__PURE__ */ (0, z.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, z.jsx)(t, {
							size: "small",
							variant: "secondary",
							disabled: !a.length,
							onClick: () => s(a.slice(0, -1)),
							children: "上一级"
						}), /* @__PURE__ */ (0, z.jsx)(t, {
							size: "small",
							variant: "secondary",
							onClick: i,
							children: "收起"
						})]
					})]
				}),
				l.error ? /* @__PURE__ */ (0, z.jsx)(o, { children: M(l.error) }) : null,
				l.data && !l.data.folders.length ? /* @__PURE__ */ (0, z.jsx)(d, { children: "这个目录里没有子目录。" }) : null
			]
		}),
		l.data?.folders.length ? /* @__PURE__ */ (0, z.jsx)(g, { children: l.data.folders.map((e) => /* @__PURE__ */ (0, z.jsx)(b, {
			label: e.name,
			children: /* @__PURE__ */ (0, z.jsx)(t, {
				size: "small",
				variant: "secondary",
				"aria-label": `打开目录 ${e.name}`,
				onClick: () => s([...a, e]),
				children: "打开"
			})
		}, e.remote_id)) }) : null,
		/* @__PURE__ */ (0, z.jsxs)(S, {
			divided: !0,
			children: [c ? /* @__PURE__ */ (0, z.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, z.jsx)(d, { children: "设为扫描起点后，这一层的子目录都会同步。" }), /* @__PURE__ */ (0, z.jsx)(t, {
					disabled: f,
					onClick: () => {
						if (!c) return;
						let t = [...e.roots, c].map(({ remote_id: e, name: t }) => ({
							remote_id: e,
							name: t
						}));
						u.run("save", (n) => D(`${Q}/${e.location}/roots`, { roots: t }, "POST", n), () => {
							n(`已把「${c.name}」设为扫描起点`), r();
						});
					},
					...O(u.busy === "save"),
					children: f ? "这一层已经是扫描起点" : `设为扫描起点：${c.name}`
				})]
			}) : /* @__PURE__ */ (0, z.jsx)(d, { children: "打开要用的目录，再把它设为扫描起点。一个都不设时，同步从账号根目录开始。" }), u.error ? /* @__PURE__ */ (0, z.jsx)(o, { children: u.error }) : null]
		})
	] });
}
// src/react/settings/service-preferences.tsx
function Ee({ receipt: e }) {
	let t = F({
		queryKey: _,
		queryFn: ({ signal: e }) => ee(e)
	}), n = ae(), r = n.error || t.error;
	return /* @__PURE__ */ (0, z.jsxs)(v, {
		guide: "speed",
		title: "后台任务",
		children: [/* @__PURE__ */ (0, z.jsx)(g, { children: /* @__PURE__ */ (0, z.jsx)(b, {
			label: "默认处理速度",
			description: "新任务使用此档位。运行中的任务可在活动页单独调整。",
			children: /* @__PURE__ */ (0, z.jsx)(h, {
				value: t.data?.taskSpeedMode || "standard",
				busy: !t.data || n.isPending,
				onChange: (t) => n.mutate({ taskSpeedMode: t }, { onSuccess: () => e("已保存默认处理速度") })
			})
		}) }), r ? /* @__PURE__ */ (0, z.jsx)(S, {
			divided: !0,
			children: /* @__PURE__ */ (0, z.jsx)(o, { children: M(r) })
		}) : null]
	});
}
// src/react/settings/configuration-page.tsx
var De = [
	{
		id: "drives",
		title: "网盘"
	},
	{
		id: "access",
		title: "访问与安全"
	},
	{
		id: "token",
		title: "API 令牌"
	},
	{
		id: "devices",
		title: "设备会话"
	},
	{
		id: "speed",
		title: "任务速度"
	},
	{
		id: "diagnostics",
		title: "系统诊断"
	}
], $ = new Map(De.map(({ id: e, title: t }) => [`#${e}`, t]));
function Oe({ receipt: e, section: t = "", diagnostics: r }) {
	let i = F({
		queryKey: n,
		queryFn: ({ signal: e }) => N(e)
	}), a = i.data;
	return a ? /* @__PURE__ */ (0, z.jsx)(je, {
		data: a,
		receipt: e,
		section: t,
		diagnostics: r,
		refreshing: i.isFetching,
		reload: () => {
			i.refetch({ cancelRefetch: !1 });
		}
	}) : /* @__PURE__ */ (0, z.jsx)("div", {
		className: "ui-configpage",
		children: /* @__PURE__ */ (0, z.jsx)(m, {
			tone: "error",
			title: "配置读取失败",
			children: i.error ? M(i.error) : "未取得配置，请刷新页面重试。"
		})
	});
}
function ke({ data: e, sections: n, reload: r, refreshing: i }) {
	return /* @__PURE__ */ (0, z.jsx)(z.Fragment, { children: n.map((n) => {
		let a = e.section_errors?.[n];
		return a ? /* @__PURE__ */ (0, z.jsx)(m, {
			tone: "error",
			title: a.title,
			action: /* @__PURE__ */ (0, z.jsx)(t, {
				variant: "secondary",
				size: "small",
				onClick: r,
				...O(i),
				children: "重新读取"
			}),
			children: a.message
		}, n) : null;
	}) });
}
var Ae = 0;
function je({ data: e, receipt: t, section: n, diagnostics: r, reload: i, refreshing: a }) {
	let [o] = (0, R.useState)(() => `board-tabs-${++Ae}`), [s, c] = (0, R.useState)(() => $.get(window.location.hash) ?? n), l = (0, R.useRef)(null), u = (0, R.useRef)(s);
	(0, R.useEffect)(() => {
		c(n);
	}, [n]), (0, R.useEffect)(() => {
		let e = () => c($.get(window.location.hash) ?? "");
		return window.addEventListener("hashchange", e), () => window.removeEventListener("hashchange", e);
	}, []), (0, R.useLayoutEffect)(() => {
		if (u.current === s) return;
		u.current = s;
		let e = l.current?.querySelector(".ui-board-local-nav"), t = l.current?.querySelector(".ui-board-group-active");
		if (!e || !t) return;
		let n = parseFloat(getComputedStyle(e).top);
		if (!Number.isFinite(n) || e.getBoundingClientRect().top > n + 1) return;
		let r = matchMedia("(max-width:900px)").matches ? e.getBoundingClientRect().bottom + 8 : n;
		window.scrollTo(0, Math.max(0, window.scrollY + t.getBoundingClientRect().top - r));
	}, [s]);
	let d = (e) => {
		c(e);
		let t = De.find((t) => t.title === e)?.id;
		t && window.location.hash !== `#${t}` && window.history.replaceState(window.history.state, "", `#${t}`);
	}, [f, p] = (0, R.useState)(() => matchMedia("(max-width:900px)").matches);
	(0, R.useEffect)(() => {
		let e = matchMedia("(max-width:900px)"), t = () => p(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let m = (t) => /* @__PURE__ */ (0, z.jsx)(ke, {
		data: e,
		sections: t,
		reload: i,
		refreshing: a
	}), h = (e) => {
		t(e), i();
	}, g = e.access, _ = e.api_token, v = [
		{
			id: "drives",
			title: "网盘",
			body: (e) => /* @__PURE__ */ (0, z.jsx)("div", {
				...V(e),
				"data-guide-target": "drives",
				children: /* @__PURE__ */ (0, z.jsx)(Ce, { receipt: t })
			})
		},
		...g ? [
			{
				id: "access",
				title: "访问与安全",
				body: (e) => /* @__PURE__ */ (0, z.jsxs)("div", {
					...V(e),
					"data-guide-target": "access",
					children: [m(["access"]), /* @__PURE__ */ (0, z.jsx)(ce, {
						initial: g,
						receipt: h
					})]
				})
			},
			..._ ? [{
				id: "token",
				title: "API 令牌",
				body: (e) => /* @__PURE__ */ (0, z.jsxs)("div", {
					...V(e),
					"data-guide-target": "token",
					children: [m(["api_token"]), /* @__PURE__ */ (0, z.jsx)(de, {
						initial: _,
						mode: g.mode,
						receipt: t
					})]
				})
			}] : [],
			{
				id: "devices",
				title: "设备会话",
				body: (e) => /* @__PURE__ */ (0, z.jsx)("div", {
					...V(e),
					"data-guide-target": "devices",
					children: /* @__PURE__ */ (0, z.jsx)(be, {
						revision: g.revision,
						receipt: t
					})
				})
			}
		] : [],
		{
			id: "speed",
			title: "任务速度",
			body: (e) => /* @__PURE__ */ (0, z.jsx)("div", {
				...V(e),
				"data-guide-target": "speed",
				children: /* @__PURE__ */ (0, z.jsx)(Ee, { receipt: t })
			})
		},
		{
			id: "diagnostics",
			title: "系统诊断",
			body: (e) => /* @__PURE__ */ (0, z.jsx)("div", {
				...V(e),
				"data-guide-target": "diagnostics",
				children: e.active ? r : null
			})
		}
	], y = Math.max(0, v.findIndex((e) => e.title === s));
	return /* @__PURE__ */ (0, z.jsxs)("div", {
		ref: l,
		className: "ui-configpage",
		children: [/* @__PURE__ */ (0, z.jsx)("div", {
			className: "ui-board-local-nav",
			"data-section-nav": "",
			children: /* @__PURE__ */ (0, z.jsx)(x, {
				group: "configuration",
				label: "配置分区",
				value: v[y].id,
				tabs: v.map(({ id: e, title: t }) => ({
					value: e,
					label: t
				})),
				sectionItems: !0,
				panelPrefix: o,
				orientation: f ? "horizontal" : "vertical",
				className: "",
				onChange: (e) => d(v.find((t) => t.id === e).title)
			})
		}), v.map(({ id: e, title: t, body: n }, r) => /* @__PURE__ */ (0, z.jsxs)(R.Fragment, { children: [/* @__PURE__ */ (0, z.jsx)("h2", {
			className: "ui-configgroup",
			children: t
		}), n({
			index: r,
			id: `${o}-panel-${e}`,
			labelledBy: `${o}-tab-${e}`,
			active: r === y
		})] }, t))]
	});
}
export { Oe as ConfigurationPage };

//# debugId=5bb14a87-8f80-4aad-9e5e-95aec36bc79a