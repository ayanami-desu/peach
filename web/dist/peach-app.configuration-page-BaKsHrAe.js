(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "ae830ce6-f31e-467d-8d1d-acf474bfc077", e._sentryDebugIdIdentifier = "sentry-dbid-ae830ce6-f31e-467d-8d1d-acf474bfc077");
	} catch {}
})();
import { ACCENT_CHOICES as e, ApiError as t, Button as n, CONFIGURATION_KEY as r, Checkbox as i, Chip as a, DRIVE_KEY as o, DRIVE_URL as s, E3 as c, ErrorText as l, Eu as u, Fact as d, FactList as f, Footer as p, Help as m, Input as h, L1 as g, LoadingDots as _, Note as v, ProcessingMode as y, Progress as b, Rows as x, SETTINGS_KEY as S, Section as C, SectionSkeleton as w, Select$1 as T, SelectItem as E, SettingsRow as D, SortableBoardTabs as O, Stack as k, Switch as A, TaskCenterLink as ee, Uz as te, __toESM as ne, _p as re, apiGet as j, apiSend as M, busyProps as N, confirmModal as P, cx as ie, d6 as ae, devicesSkeleton as oe, errorMessage as F, fetchConfiguration as se, fetchDrives as ce, fetchSettings as le, fmtSize as I, l1 as ue, rememberShape as de, require_jsx_runtime as fe, require_react as pe, t as L, useAction as R, useQuery as z, useQueryClient as B, useSaveSettings as me, z3 as V } from "./peach-app.js";
// src/react/settings/password-pair.tsx
var H = /* @__PURE__ */ ne(pe(), 1), U = fe();
function he({ label: e, password: t, confirmation: n, onPassword: r, onConfirmation: i, disabled: a = !1, passwordError: o, passwordHint: s, confirmationError: c, confirmationInvalid: l = !1 }) {
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)(h, {
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
	}), /* @__PURE__ */ (0, U.jsx)(h, {
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
var ge = {
	legacy: "当前使用系统生成的访问口令。改设自己的密码，或关闭登录要求。",
	locked: "访问设置无法读取，请到服务器上检查配置文件。",
	password: "已设置密码。新设备需要登录，登录时勾选「保持登录」可保持 30 天。"
};
function _e({ initial: e, receipt: r, devices: a, after: o }) {
	let [s, c] = (0, H.useState)(e), [u, d] = (0, H.useState)(""), [f, g] = (0, H.useState)(""), [_, y] = (0, H.useState)(""), [b, x] = (0, H.useState)(!1), [S, w] = (0, H.useState)({}), T = (0, H.useRef)(null), E = R(), D = (e) => {
		e.preventDefault();
		let n = {};
		s.mode === "password" && !u && (n.current_password = "请输入当前访问密码"), b || ((f.length < 8 || f.length > 256) && (n.password = "访问密码需为 8–256 个字符"), f !== _ && (n.confirmation = "两次输入的密码不一致")), w(n), Object.keys(n).length ? requestAnimationFrame(() => T.current?.querySelector("input[aria-invalid=\"true\"]")?.focus()) : E.run("save", (e) => M("/api/configuration/access", {
			revision: s.revision,
			action: b ? "disable" : "set",
			confirm_disable: b,
			current_password: u,
			password: b ? "" : f,
			confirmation: b ? "" : _
		}, "POST", e), (e) => {
			c(e), d(""), g(""), y(""), x(!1), w({}), r(e.mode === "open" ? "已关闭访问密码" : "已保存配置");
		}, (e) => {
			let n = e instanceof t ? e.body : null, r = n?.errors || n?.detail?.errors;
			r ? w(r) : E.setError(F(e));
		});
	}, O = ge[s.mode], A = s.mode !== "locked";
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		/* @__PURE__ */ (0, U.jsxs)(C, {
			guide: "access",
			title: "访问密码",
			onSubmit: D,
			children: [/* @__PURE__ */ (0, U.jsx)("div", {
				ref: T,
				children: /* @__PURE__ */ (0, U.jsxs)(k, { children: [
					O ? /* @__PURE__ */ (0, U.jsx)(m, { children: O }) : null,
					s.mode === "open" ? /* @__PURE__ */ (0, U.jsx)(v, {
						tone: "warning",
						title: "未设置访问密码",
						children: "能连接到 Peach 的设备打开地址就能看馆藏，不需要登录。"
					}) : null,
					s.mode === "password" || s.mode === "legacy" ? /* @__PURE__ */ (0, U.jsx)(i, {
						isSelected: b,
						onChange: x,
						children: "关闭访问密码"
					}) : null,
					s.mode === "password" ? /* @__PURE__ */ (0, U.jsx)(h, {
						id: "access-current",
						type: "password",
						label: "当前访问密码",
						autoComplete: "current-password",
						maxLength: 256,
						value: u,
						onChange: d,
						isRequired: !0,
						validationBehavior: "aria",
						isInvalid: !!S.current_password,
						hint: S.current_password
					}) : null,
					A && !b ? /* @__PURE__ */ (0, U.jsx)(he, {
						label: s.mode === "password" ? "新访问密码" : "设置访问密码",
						password: f,
						confirmation: _,
						onPassword: g,
						onConfirmation: y,
						passwordError: S.password,
						confirmationError: S.confirmation,
						passwordHint: "至少 8 个字符。保存后其他设备需要重新登录。"
					}) : null,
					b ? /* @__PURE__ */ (0, U.jsx)(v, {
						tone: "warning",
						title: "访问范围",
						children: "保存后，能连接到 Peach 的设备将直接访问馆藏。"
					}) : null,
					E.error ? /* @__PURE__ */ (0, U.jsx)(l, { children: E.error }) : null
				] })
			}), A ? /* @__PURE__ */ (0, U.jsx)(p, { children: /* @__PURE__ */ (0, U.jsx)(n, {
				type: "submit",
				...N(E.busy === "save"),
				children: "保存配置"
			}) }) : null]
		}),
		a && (s.mode === "password" || s.mode === "legacy") ? a(s) : null,
		o ? o(s) : null
	] });
}
// src/react/settings/api-token-settings.tsx
var ve = "/api/configuration/access/token/rotate";
function ye(e, t) {
	let n = "用旧口令的脚本和 API 调用会立即失效。", r = e === "legacy" ? `其他浏览器现在用这串口令登录，会全部退出，需要输入新口令重新登录；本机保持登录。${n}` : e === "open" ? `浏览器不需要登录，不受影响。${n}` : `用访问密码登录的浏览器不受影响。${n}`;
	return t ? `${r}另一台电脑要换成同一份口令文件，两台之间才能继续互取复核结果。` : r;
}
function be({ initial: e, mode: t, receipt: r }) {
	let [i, a] = (0, H.useState)(e), [o, s] = (0, H.useState)(null), c = R(), l = B();
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "token",
		title: "访问口令",
		children: [/* @__PURE__ */ (0, U.jsxs)(k, { children: [
			/* @__PURE__ */ (0, U.jsx)(m, { children: "脚本和 API 调用在 X-Token 请求头里携带访问口令。口令只存在服务端，页面不显示。" }),
			o ? /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, U.jsxs)("div", {
						className: "flex min-w-0 flex-wrap items-end gap-2",
						children: [/* @__PURE__ */ (0, U.jsx)(h, {
							className: "min-w-0 flex-1",
							label: "新访问口令",
							value: o.token,
							isReadOnly: !0,
							autoComplete: "off"
						}), /* @__PURE__ */ (0, U.jsx)(n, {
							variant: "secondary",
							"aria-label": "复制新访问口令",
							onClick: () => void c.run("copy", () => navigator.clipboard.writeText(o.token), () => r("已复制口令")),
							children: "复制口令"
						})]
					}),
					c.error ? /* @__PURE__ */ (0, U.jsx)(m, {
						role: "status",
						children: "复制失败，请选中口令复制。"
					}) : null,
					/* @__PURE__ */ (0, U.jsx)(v, {
						tone: "info",
						title: "新口令只显示这一次",
						children: "已经生效，不用重启。离开本页后不再显示，之后在终端运行 peach token 查看。"
					})
				]
			}) : null,
			o?.relogin ? /* @__PURE__ */ (0, U.jsx)(v, {
				tone: "warning",
				title: "本机需要重新登录",
				children: "刷新页面后用新口令登录。"
			}) : null,
			i.rotatable ? null : /* @__PURE__ */ (0, U.jsx)(m, { children: i.reason })
		] }), i.rotatable ? /* @__PURE__ */ (0, U.jsx)(p, {
			status: "更换后立即生效。",
			children: /* @__PURE__ */ (0, U.jsx)(n, {
				variant: "secondary",
				onClick: () => void P({
					title: "更换访问口令",
					body: ye(t, i.paired),
					confirmLabel: "更换口令",
					onConfirm: async () => {
						let e = await M(ve, {});
						a(e), s(e), e.mode === "legacy" && l.invalidateQueries({ queryKey: ["access-sessions"] }), r(e.signed_out ? `已更换访问口令，${e.signed_out} 台设备需要重新登录` : "已更换访问口令");
					}
				}),
				children: "更换口令"
			})
		}) : null]
	});
}
// src/react/settings/configuration-panel.ts
var W = "flex flex-col gap-6";
function G(e) {
	return e ? {
		className: e.active ? `${W} ui-board-group-active` : W,
		"data-board-group": String(e.index),
		id: e.id,
		role: "tabpanel",
		"aria-labelledby": e.labelledBy
	} : { className: W };
}
var xe = {
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
}, Se = (e) => e.normalize("NFKC").toLowerCase().replace(/[\s_-]/g, ""), Ce = new Map(xe.icons.flatMap((e) => e.aliases.map((t) => [Se(t), e.id])));
function we(e) {
	return Ce.get(Se(e));
}
function Te({ name: e, className: t }) {
	let [n, r] = (0, H.useState)(""), i = we(e);
	return i && n !== i ? /* @__PURE__ */ (0, U.jsx)("img", {
		src: `/browser-icon/${i}`,
		width: 24,
		height: 24,
		alt: "",
		"aria-hidden": !0,
		loading: "lazy",
		className: `${t ?? "size-6 shrink-0"} object-contain`,
		onError: () => r(i)
	}) : /* @__PURE__ */ (0, U.jsx)(c, {
		"aria-hidden": !0,
		className: `${t ?? "size-5 shrink-0"} text-foreground-icon-secondary`
	});
}
// src/react/settings/device-sessions.tsx
var K = "/api/configuration/access/sessions", q = (e) => e.device || "未识别的浏览器", Ee = {
	glyph: g,
	brand: "apple"
}, De = {
	glyph: ue,
	brand: "android"
}, Oe = {
	iPhone: {
		platform: Ee,
		terminal: re
	},
	iPad: {
		platform: Ee,
		terminal: u
	},
	Android: {
		platform: De,
		terminal: re
	},
	"Android 平板": {
		platform: De,
		terminal: u
	},
	ChromeOS: {
		platform: { browser: "chrome" },
		terminal: V
	},
	Windows: {
		platform: {
			glyph: te,
			brand: "windows"
		},
		terminal: V
	},
	macOS: {
		platform: Ee,
		terminal: V
	},
	Linux: { terminal: V }
}, ke = "inline size-4 -mt-0.5 mr-1 align-middle";
function Ae({ platform: e }) {
	if ("browser" in e) return /* @__PURE__ */ (0, U.jsx)(Te, {
		name: e.browser,
		className: ke
	});
	let { glyph: t, brand: n } = e;
	return /* @__PURE__ */ (0, U.jsx)(t, {
		"aria-hidden": !0,
		"data-platform-mark": n,
		className: ke
	});
}
function je({ row: e }) {
	if (!e.device) return q(e);
	let t = e.device.split(" · "), n = Oe[t.at(-1) ?? ""] ? t.pop() : "", r = t.join(" · "), i = n ? Oe[n].platform : void 0;
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		r ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [we(r) ? /* @__PURE__ */ (0, U.jsx)(Te, {
			name: r,
			className: ke
		}) : null, r] }) : null,
		r && n ? " · " : null,
		n ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [i ? /* @__PURE__ */ (0, U.jsx)(Ae, { platform: i }) : null, n] }) : null
	] });
}
function Me({ row: e }) {
	let t = Oe[e.device.split(" · ").at(-1) ?? ""]?.terminal ?? ae;
	return /* @__PURE__ */ (0, U.jsx)(t, {
		"aria-hidden": !0,
		className: "size-5 shrink-0 text-foreground-icon-secondary"
	});
}
function Ne({ row: e, children: t }) {
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "flex min-h-13 w-full items-center justify-between gap-4 border-b border-separator-border py-2.5 pr-2.5 last:border-b-0",
		children: [/* @__PURE__ */ (0, U.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3",
			children: [/* @__PURE__ */ (0, U.jsx)(Me, { row: e }), /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "flex min-w-0 flex-col",
				children: [/* @__PURE__ */ (0, U.jsx)("p", {
					className: "text-body-regular text-text-primary",
					children: /* @__PURE__ */ (0, U.jsx)(je, { row: e })
				}), /* @__PURE__ */ (0, U.jsx)("p", {
					className: "text-body-2-regular text-text-secondary",
					children: Ie(e)
				})]
			})]
		}), t]
	});
}
function Pe(e, t = Date.now() / 1e3) {
	let n = Math.max(0, t - e);
	return n < 60 ? "刚刚" : n < 3600 ? `${Math.floor(n / 60)} 分钟前` : n < 86400 ? `${Math.floor(n / 3600)} 小时前` : n < 2592e3 ? `${Math.floor(n / 86400)} 天前` : (/* @__PURE__ */ new Date(e * 1e3)).toLocaleDateString("zh-CN");
}
function Fe(e) {
	return e.network === "loopback" ? "运行 Peach 的电脑" : e.network ? e.remote ? `公网入口 · ${e.network}` : e.network : "";
}
var Ie = (e) => [`最近活动 ${Pe(e.last_seen)}`, Fe(e)].filter(Boolean).join(" · ");
function Le({ revision: e, receipt: t }) {
	let n = z({
		queryKey: ["access-sessions", e],
		refetchOnMount: "always",
		queryFn: ({ signal: e }) => j(K, e)
	});
	return n.error ? /* @__PURE__ */ (0, U.jsx)(C, {
		guide: "devices",
		title: "已登录的设备",
		children: /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(l, { children: F(n.error) }) })
	}) : n.isFetching || !n.data ? /* @__PURE__ */ (0, U.jsx)(w, {
		label: "正在读取已登录的设备",
		html: oe
	}) : /* @__PURE__ */ (0, U.jsx)(Re, {
		initial: n.data,
		receipt: t
	});
}
function Re({ initial: e, receipt: t }) {
	let [r, i] = (0, H.useState)(e);
	(0, H.useEffect)(() => i(e), [e]);
	let o = r.sessions.filter((e) => !e.current);
	(0, H.useEffect)(() => {
		de("devices", {
			rows: Math.min(r.sessions.length, 8),
			manageable: r.manageable && o.length > 0
		});
	}, [r, o.length]);
	let s = (e) => void P({
		title: "撤销这台设备的登录",
		body: `${q(e)}（${Ie(e)}）下次打开 Peach 需要重新输入访问密码。`,
		confirmLabel: "撤销登录",
		onConfirm: async () => {
			i(await M(`${K}/revoke`, {
				revision: r.revision,
				id: e.id
			})), t("已撤销登录");
		}
	});
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "devices",
		title: "已登录的设备",
		children: [
			r.sessions.length ? /* @__PURE__ */ (0, U.jsx)(x, { children: r.sessions.map((e) => /* @__PURE__ */ (0, U.jsx)(Ne, {
				row: e,
				children: e.current ? /* @__PURE__ */ (0, U.jsx)(a, {
					color: "blue",
					variant: "caption",
					children: "本机"
				}) : r.manageable ? /* @__PURE__ */ (0, U.jsx)(n, {
					size: "small",
					variant: "secondary",
					"aria-label": `撤销 ${q(e)} 的登录`,
					onClick: () => s(e),
					children: "撤销"
				}) : null
			}, e.id)) }) : /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, { children: "还没有浏览器用访问密码登录过。" }) }),
			!r.manageable && o.length ? /* @__PURE__ */ (0, U.jsx)(k, {
				divided: !0,
				children: /* @__PURE__ */ (0, U.jsx)(m, { children: "在运行 Peach 的电脑上打开这一页才能撤销。" })
			}) : null,
			r.manageable && o.length ? /* @__PURE__ */ (0, U.jsx)(p, {
				status: "修改访问密码会让全部设备退出。",
				children: /* @__PURE__ */ (0, U.jsx)(n, {
					variant: "secondary",
					onClick: () => void P({
						title: "撤销其他设备的登录",
						body: `除本机以外的 ${o.length} 台设备下次打开 Peach 需要重新输入访问密码。`,
						confirmLabel: "撤销登录",
						onConfirm: async () => {
							let e = await M(`${K}/revoke`, {
								revision: r.revision,
								scope: "others"
							});
							i(e), t(`已撤销 ${e.removed} 台设备的登录`);
						}
					}),
					children: "撤销其他设备"
				})
			}) : null
		]
	});
}
// src/react/settings/drive-settings.tsx
var ze = {
	redirect: {
		label: L("settings:drive.mode.redirect"),
		help: L("settings:drive.mode.redirectHelp")
	},
	proxy: {
		label: L("settings:drive.mode.proxy"),
		help: L("settings:drive.mode.proxyHelp")
	}
}, Be = (e) => ze[e]?.label ?? e, Ve = (e) => e.email || e.display_name || e.key;
function He({ receipt: e }) {
	let t = B(), r = z({
		queryKey: o,
		refetchOnMount: "always",
		queryFn: ({ signal: e }) => ce(e)
	});
	if (r.error) return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "drives",
		title: "网盘",
		children: [/* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(l, { children: F(r.error) }) }), /* @__PURE__ */ (0, U.jsx)(p, { children: /* @__PURE__ */ (0, U.jsx)(n, {
			variant: "secondary",
			onClick: () => {
				r.refetch();
			},
			...N(r.isFetching),
			children: "重新读取"
		}) })]
	});
	let i = r.data;
	if (!i) return /* @__PURE__ */ (0, U.jsx)(C, {
		guide: "drives",
		title: "网盘",
		children: /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, {
			role: "status",
			children: "正在读取网盘状态…"
		}) })
	});
	let a = () => {
		t.invalidateQueries({ queryKey: o });
	};
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)(Ue, {
		publicUrl: i.public_url,
		receipt: e,
		reloaded: a
	}), i.locations.map((t) => /* @__PURE__ */ (0, U.jsx)(We, {
		connection: t,
		publicUrl: i.public_url,
		receipt: e,
		reloaded: a
	}, t.location))] });
}
function Ue({ publicUrl: e, receipt: t, reloaded: r }) {
	let i = R(), [a, o] = (0, H.useState)(e);
	return (0, H.useEffect)(() => o(e), [e]), /* @__PURE__ */ (0, U.jsxs)(C, {
		title: L("settings:drive.callback.title"),
		children: [/* @__PURE__ */ (0, U.jsxs)(k, { children: [/* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:drive.callback.help") }), /* @__PURE__ */ (0, U.jsx)(h, {
			id: "drive-public-url",
			label: L("settings:drive.callback.label"),
			value: a,
			placeholder: L("settings:drive.callback.placeholder"),
			onChange: (e) => o(e)
		})] }), /* @__PURE__ */ (0, U.jsx)(p, { children: /* @__PURE__ */ (0, U.jsx)(n, {
			onClick: () => {
				i.run("callback", (e) => M(`${s}/public-url`, { public_url: a }, "POST", e), ({ public_url: e }) => {
					o(e), t(e ? L("settings:drive.callback.saved", { url: e }) : L("settings:drive.callback.cleared")), r();
				});
			},
			...N(i.busy === "callback"),
			children: L("settings:drive.callback.save")
		}) })]
	});
}
function We({ connection: e, publicUrl: t, receipt: r, reloaded: i }) {
	let [a, o] = (0, H.useState)(e);
	(0, H.useEffect)(() => o(e), [e]);
	let c = R(), [u, d] = (0, H.useState)(!1), [f, g] = (0, H.useState)({
		key: "",
		client_id: "",
		client_secret: "",
		refresh_token: "",
		root: ""
	}), _ = (e) => ({
		id: `drive-${a.location}-${e}`,
		name: e,
		value: f[e],
		autoComplete: "off",
		onChange: (t) => g((n) => ({
			...n,
			[e]: t
		}))
	}), y = () => g({
		key: "",
		client_id: "",
		client_secret: "",
		refresh_token: "",
		root: ""
	}), b = () => {
		let e = f.key.trim() || a.location;
		c.run("credentials", (t) => M(`${s}/${encodeURIComponent(e)}/credentials`, {
			client_id: f.client_id,
			client_secret: f.client_secret,
			refresh_token: f.refresh_token,
			root: f.root,
			location: a.location
		}, "POST", t), (t) => {
			o(t), d(!1), y(), r(L("settings:drive.account.added", { name: e })), i();
		});
	}, S = (e) => void c.run("mode", (t) => M(`${s}/${a.location}/mode`, { mode: e }, "POST", t), ({ mode: e }) => {
		o({
			...a,
			mode: e
		}), r(L("settings:drive.mode.switched", {
			label: a.label,
			mode: Be(e)
		}));
	});
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "account",
		title: a.label,
		children: [
			/* @__PURE__ */ (0, U.jsxs)(k, { children: [
				a.configured ? null : /* @__PURE__ */ (0, U.jsx)(v, {
					tone: "warning",
					title: `${a.label} 还没有接入`,
					children: "在下面「添加账号」里填 client_id、client_secret 与 refresh token 就能接上，名字会写进设置文件的 [drive.accounts.<账号名>]；要走浏览器授权，还得在 [drive] 段填上这台 Peach 的 https 地址 public_url。"
				}),
				a.accounts.length ? null : /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:drive.account.empty") }),
				a.last_error ? /* @__PURE__ */ (0, U.jsx)(v, {
					tone: "warning",
					title: "上次同步失败",
					children: a.last_error
				}) : null,
				c.error ? /* @__PURE__ */ (0, U.jsx)(l, { children: c.error }) : null
			] }),
			a.modes.length > 1 ? /* @__PURE__ */ (0, U.jsx)(x, { children: a.modes.map((e) => /* @__PURE__ */ (0, U.jsx)(D, {
				label: Be(e),
				description: ze[e]?.help ?? e,
				children: /* @__PURE__ */ (0, U.jsx)(n, {
					size: "small",
					variant: e === a.mode ? "primary" : "secondary",
					"aria-pressed": e === a.mode,
					disabled: e === a.mode,
					"aria-label": `${L("settings:drive.mode.switchTo")} ${Be(e)}`,
					onClick: () => S(e),
					...N(c.busy === "mode"),
					children: e === a.mode ? L("settings:drive.mode.inUse") : L("settings:drive.mode.switchTo")
				})
			}, e)) }) : null,
			a.accounts.map((e) => /* @__PURE__ */ (0, U.jsx)(Ge, {
				account: e,
				publicUrl: t,
				apply: (e) => o(e),
				receipt: r,
				reloaded: i
			}, e.key)),
			u ? /* @__PURE__ */ (0, U.jsxs)(k, { children: [
				/* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:drive.manual.help") }),
				/* @__PURE__ */ (0, U.jsx)(h, {
					label: L("settings:drive.account.name"),
					hint: L("settings:drive.account.nameHelp"),
					..._("key")
				}),
				/* @__PURE__ */ (0, U.jsx)(h, {
					label: L("settings:drive.manual.clientId"),
					..._("client_id")
				}),
				/* @__PURE__ */ (0, U.jsx)(h, {
					type: "password",
					label: L("settings:drive.manual.clientSecret"),
					..._("client_secret")
				}),
				/* @__PURE__ */ (0, U.jsx)(h, {
					type: "password",
					label: L("settings:drive.manual.refreshToken"),
					..._("refresh_token")
				}),
				/* @__PURE__ */ (0, U.jsx)(h, {
					label: L("settings:drive.manual.root"),
					hint: L("settings:drive.manual.rootHelp"),
					..._("root")
				}),
				/* @__PURE__ */ (0, U.jsx)(n, {
					onClick: b,
					...N(c.busy === "credentials"),
					children: L("settings:drive.manual.submit")
				})
			] }) : null,
			/* @__PURE__ */ (0, U.jsx)(p, { children: /* @__PURE__ */ (0, U.jsx)(n, {
				variant: "secondary",
				onClick: () => d(!u),
				children: L(u ? "settings:drive.manual.hide" : "settings:drive.account.add")
			}) })
		]
	});
}
function Ge({ account: e, publicUrl: t, apply: r, receipt: i, reloaded: a }) {
	let o = R(), c = `${s}/${encodeURIComponent(e.key)}`, u = t ? `${t.replace(/\/+$/, "")}/oauth/${e.key}/callback` : "", m = Ve(e), h = () => void o.run("refresh", (e) => M(`${c}/refresh`, {}, "POST", e), (e) => {
		r(e), i(L("settings:drive.account.refreshed", { name: m }));
	}), g = () => void o.run("authorize", (e) => M(`${c}/authorize`, {}, "POST", e), ({ url: e }) => {
		window.location.assign(e);
	}), _ = () => void P({
		title: L("settings:drive.account.forgetTitle", { name: m }),
		body: L("settings:drive.account.forgetBody", { name: m }),
		confirmLabel: L("settings:drive.account.disconnect"),
		danger: !0,
		onConfirm: async () => {
			await M(c, {}, "DELETE"), i(L("settings:drive.account.forgotten", { name: m })), a();
		}
	});
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		title: m,
		nested: !0,
		children: [/* @__PURE__ */ (0, U.jsxs)(k, { children: [
			/* @__PURE__ */ (0, U.jsxs)(f, { children: [
				/* @__PURE__ */ (0, U.jsx)(d, {
					term: L("settings:drive.account.name"),
					children: e.key
				}),
				/* @__PURE__ */ (0, U.jsx)(d, {
					term: "账号",
					children: e.connected ? e.email || e.display_name || "已授权" : "未授权"
				}),
				/* @__PURE__ */ (0, U.jsx)(d, {
					term: "媒体库",
					children: e.roots.length ? `${e.roots.length} 个目录` : "还没建媒体库"
				}),
				/* @__PURE__ */ (0, U.jsx)(d, {
					term: "上次同步",
					children: e.synced_at || "还没有同步过"
				})
			] }),
			e.last_error ? /* @__PURE__ */ (0, U.jsx)(v, {
				tone: "warning",
				title: "上次同步失败",
				children: e.last_error
			}) : null,
			e.configured && !e.connected && !u ? /* @__PURE__ */ (0, U.jsx)(v, {
				tone: "warning",
				title: "没有配置回调基址",
				children: `浏览器授权要回到这台 Peach：先在 [drive] 段填好 public_url（https 地址），网盘后台登记的回调地址是 public_url 加上 /oauth/${e.key}/callback。不想开公网回调就直接填认证信息，那条路不用 public_url。`
			}) : null,
			o.error ? /* @__PURE__ */ (0, U.jsx)(l, { children: o.error }) : null
		] }), /* @__PURE__ */ (0, U.jsxs)(p, {
			nested: !0,
			status: e.connected ? null : L("settings:drive.account.callback", { url: u || "未配置" }),
			children: [
				e.connected ? /* @__PURE__ */ (0, U.jsx)(n, {
					variant: "secondary",
					onClick: h,
					...N(o.busy === "refresh"),
					children: L("settings:drive.account.refresh")
				}) : null,
				e.connected ? /* @__PURE__ */ (0, U.jsx)(n, {
					variant: "secondary",
					onClick: _,
					children: L("settings:drive.account.disconnect")
				}) : null,
				e.configured ? /* @__PURE__ */ (0, U.jsx)(n, {
					onClick: g,
					disabled: !u,
					...N(o.busy === "authorize"),
					children: e.connected ? L("settings:drive.account.reauthorize") : L("settings:drive.account.authorize")
				}) : null
			]
		})]
	});
}
// src/react/settings/ledger-backup-settings.tsx
var Ke = "/api/configuration/ledger-backups", qe = ["configuration-ledger-backups"], Je = 1500, Ye = (e) => e ? (/* @__PURE__ */ new Date(e * 1e3)).toLocaleString() : "—", J = (e, t) => e?.[t];
function Xe({ receipt: e }) {
	let t = B(), r = R(), i = z({
		queryKey: qe,
		refetchOnMount: "always",
		queryFn: ({ signal: e }) => j(Ke, e),
		refetchInterval: (e) => J(e.state.data, "backup")?.status === "running" || J(e.state.data, "restore")?.status === "running" ? Je : !1
	}), a = (e) => {
		t.setQueryData(qe, e);
	};
	if (i.error) return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "data",
		title: L("settings:ledgerBackup.title"),
		children: [/* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(l, { children: F(i.error) }) }), /* @__PURE__ */ (0, U.jsx)(p, { children: /* @__PURE__ */ (0, U.jsx)(n, {
			variant: "secondary",
			onClick: () => {
				i.refetch();
			},
			...N(i.isFetching),
			children: L("settings:ledgerBackup.reload")
		}) })]
	});
	let o = i.data;
	if (!o) return /* @__PURE__ */ (0, U.jsx)(C, {
		guide: "data",
		title: L("settings:ledgerBackup.title"),
		children: /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, {
			role: "status",
			children: L("settings:ledgerBackup.loading")
		}) })
	});
	let s = J(o, "backup"), c = J(o, "restore"), u = s?.status === "running" || c?.status === "running", d = o.backups ?? [], f = () => {
		r.run("backup", (e) => M(`${Ke}/backup`, {}, "POST", e), (t) => {
			a(t), e(L("settings:ledgerBackup.backedUp"));
		});
	}, h = (t) => void P({
		title: L("settings:ledgerBackup.restoreTitle"),
		body: L("settings:ledgerBackup.restoreBody", {
			name: t.name,
			time: Ye(t.modified_at)
		}),
		confirmLabel: L("settings:ledgerBackup.restoreConfirm"),
		onConfirm: async () => {
			let n = await M(`${Ke}/restore`, {
				confirm: !0,
				id: t.id
			});
			a(n), e(L("settings:ledgerBackup.restored"));
		}
	});
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "data",
		title: L("settings:ledgerBackup.title"),
		children: [
			/* @__PURE__ */ (0, U.jsxs)(k, { children: [/* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:ledgerBackup.help") }), o.last_restore ? /* @__PURE__ */ (0, U.jsx)(v, {
				tone: o.last_restore.state === "error" ? "error" : "success",
				title: L("settings:ledgerBackup.lastRestore"),
				children: o.last_restore.message || L("settings:ledgerBackup.lastRestoreAt", { time: Ye(o.last_restore.finished_at) })
			}) : null] }),
			d.length ? /* @__PURE__ */ (0, U.jsx)(x, { children: d.map((e) => /* @__PURE__ */ (0, U.jsx)(Ze, {
				row: e,
				disabled: u,
				onRestore: () => h(e)
			}, e.id)) }) : /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:ledgerBackup.empty") }) }),
			u ? /* @__PURE__ */ (0, U.jsxs)(k, {
				divided: !0,
				children: [/* @__PURE__ */ (0, U.jsx)(Qe, {
					job: s?.status === "running" ? s : c,
					label: s?.status === "running" ? L("settings:ledgerBackup.backupRunning") : L("settings:ledgerBackup.restoreRunning")
				}), (s?.status === "running" ? s.stage : c?.stage) ? /* @__PURE__ */ (0, U.jsx)(m, {
					role: "status",
					children: s?.status === "running" ? s.stage : c?.stage
				}) : null]
			}) : null,
			r.error ? /* @__PURE__ */ (0, U.jsx)(k, {
				divided: !0,
				children: /* @__PURE__ */ (0, U.jsx)(l, { children: r.error })
			}) : null,
			/* @__PURE__ */ (0, U.jsxs)(p, {
				status: u ? L("settings:ledgerBackup.busyHint") : null,
				children: [/* @__PURE__ */ (0, U.jsx)(ee, {}), /* @__PURE__ */ (0, U.jsx)(n, {
					onClick: f,
					disabled: u,
					...N(r.busy === "backup"),
					children: L("settings:ledgerBackup.backupNow")
				})]
			})
		]
	});
}
function Ze({ row: e, disabled: t, onRestore: r }) {
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "flex items-center gap-3 border-b border-separator-border py-2.5 pr-3 last:border-b-0",
		children: [/* @__PURE__ */ (0, U.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col gap-0.5",
			children: [/* @__PURE__ */ (0, U.jsx)("p", {
				className: "text-body-regular wrap-anywhere text-text-primary",
				children: e.name
			}), /* @__PURE__ */ (0, U.jsx)("p", {
				className: "text-body-2-regular text-text-secondary",
				children: L("settings:ledgerBackup.modifiedAt", {
					time: Ye(e.modified_at),
					size: I(e.bytes),
					source: e.source === "manual" ? L("settings:ledgerBackup.sourceManual") : L("settings:ledgerBackup.sourceAuto", { purpose: e.purpose || "—" })
				})
			})]
		}), /* @__PURE__ */ (0, U.jsx)(n, {
			size: "small",
			variant: "secondary",
			disabled: t,
			"aria-label": `${L("settings:ledgerBackup.restore")} ${e.name}`,
			onClick: r,
			children: L("settings:ledgerBackup.restore")
		})]
	});
}
function Qe({ job: e, label: t }) {
	return e?.total && e.total > 0 ? /* @__PURE__ */ (0, U.jsx)(b, {
		label: t,
		value: e.done ?? 0,
		max: e.total
	}) : /* @__PURE__ */ (0, U.jsx)(_, { label: t });
}
// src/react/settings/folder-picker.tsx
function $e({ account: e, onPick: t, onClose: r }) {
	let [i, a] = (0, H.useState)([]), o = i.length ? i[i.length - 1] : null, c = z({
		queryKey: [
			"drive-folders",
			e,
			o?.remote_id ?? ""
		],
		queryFn: ({ signal: t }) => j(`${s}/${encodeURIComponent(e)}/folders` + (o ? `?parent_id=${encodeURIComponent(o.remote_id)}` : ""), t)
	}), u = [L("settings:library.folder.root"), ...i.map((e) => e.name)].join(" / ");
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		/* @__PURE__ */ (0, U.jsxs)(k, {
			divided: !0,
			children: [
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, U.jsx)(m, {
						role: "status",
						children: u
					}), /* @__PURE__ */ (0, U.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, U.jsx)(n, {
							size: "small",
							variant: "secondary",
							disabled: !i.length,
							onClick: () => a(i.slice(0, -1)),
							children: L("settings:library.folder.up")
						}), /* @__PURE__ */ (0, U.jsx)(n, {
							size: "small",
							variant: "secondary",
							onClick: r,
							children: L("settings:library.folder.close")
						})]
					})]
				}),
				c.error ? /* @__PURE__ */ (0, U.jsx)(l, { children: F(c.error) }) : null,
				c.data && !c.data.folders.length ? /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:library.folder.empty") }) : null
			]
		}),
		c.data?.folders.length ? /* @__PURE__ */ (0, U.jsx)(x, { children: c.data.folders.map((e) => /* @__PURE__ */ (0, U.jsx)(D, {
			label: e.name,
			children: /* @__PURE__ */ (0, U.jsx)(n, {
				size: "small",
				variant: "secondary",
				"aria-label": L("settings:library.folder.openLabel", { name: e.name }),
				onClick: () => a([...i, e]),
				children: L("settings:library.folder.open")
			})
		}, e.remote_id)) }) : null,
		/* @__PURE__ */ (0, U.jsx)(k, {
			divided: !0,
			children: o ? /* @__PURE__ */ (0, U.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:library.folder.hint") }), /* @__PURE__ */ (0, U.jsx)(n, {
					onClick: () => t(o),
					children: L("settings:library.folder.use", { name: o.name })
				})]
			}) : /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:library.folder.start") })
		})
	] });
}
// src/react/settings/library-settings.tsx
var Y = "/api/libraries", et = ["libraries"], tt = {
	auto: L("settings:library.policyAuto"),
	custom: L("settings:library.policyCustom")
}, nt = {
	probe: L("settings:library.stageProbe"),
	metadata: L("settings:library.stageMetadata"),
	cover: L("settings:library.stageCover"),
	people: L("settings:library.stagePeople"),
	preview: L("settings:library.stagePreview")
}, X = "none", rt = (e) => e.split(",").map((e) => e.trim()).filter(Boolean), it = (t) => {
	let n = e.find((e) => e[0] === t);
	return n ? String(n[1]) : t;
};
function at({ receipt: e }) {
	let t = B(), r = z({
		queryKey: et,
		refetchOnMount: "always",
		queryFn: ({ signal: e }) => j(Y, e)
	}), [i, a] = (0, H.useState)(!1), o = () => {
		t.invalidateQueries({ queryKey: et });
	};
	if (r.error) return /* @__PURE__ */ (0, U.jsx)(C, {
		guide: "libraries",
		title: L("settings:library.title"),
		children: /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(l, { children: F(r.error) }) })
	});
	let s = r.data;
	return s ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		/* @__PURE__ */ (0, U.jsxs)(C, {
			guide: "libraries",
			title: L("settings:library.title"),
			children: [/* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:library.intro") }) }), s.libraries.length ? null : /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, {
				role: "status",
				children: L("settings:library.empty")
			}) })]
		}),
		s.libraries.map((n) => /* @__PURE__ */ (0, U.jsx)(ot, {
			library: n,
			options: s.options,
			onSaved: (n) => {
				t.setQueryData(et, (e) => e && {
					...e,
					libraries: e.libraries.map((e) => e.id === n.id ? n : e)
				}), e(L("settings:library.saved", { name: n.name }));
			},
			onDeleted: () => {
				o(), e(L("settings:library.removed", { name: n.name }));
			},
			onMoved: (t) => {
				o(), e(L("settings:library.moved", { name: t.name }));
			}
		}, n.id)),
		/* @__PURE__ */ (0, U.jsxs)(C, {
			title: L("settings:library.add.title"),
			children: [i ? /* @__PURE__ */ (0, U.jsx)(st, {
				onClose: () => a(!1),
				onAdded: (t) => {
					a(!1), o(), e(L("settings:library.added", { name: t }));
				}
			}) : null, /* @__PURE__ */ (0, U.jsx)(p, { children: /* @__PURE__ */ (0, U.jsx)(n, {
				variant: "secondary",
				onClick: () => a(!i),
				children: L(i ? "settings:library.add.collapse" : "settings:library.add.open")
			}) })]
		})
	] }) : /* @__PURE__ */ (0, U.jsx)(C, {
		guide: "libraries",
		title: L("settings:library.title"),
		children: /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, {
			role: "status",
			children: L("settings:library.loading")
		}) })
	});
}
function ot({ library: t, options: r, onSaved: a, onDeleted: o, onMoved: s }) {
	let c = R(), [u, m] = (0, H.useState)(!1), [g, _] = (0, H.useState)(() => ({
		name: t.name,
		icon: t.icon || X,
		color: t.color,
		policy: t.policy,
		stages: rt(t.stages)
	})), v = g.policy === "custom", y = () => void c.run("save", (e) => M(`${Y}/${encodeURIComponent(t.id)}`, {
		name: g.name,
		icon: g.icon === X ? "" : g.icon,
		color: g.color,
		policy: g.policy,
		stages: v ? g.stages.join(",") : ""
	}, "POST", e), (e) => {
		_((t) => ({
			...t,
			name: e.name,
			icon: e.icon || X,
			color: e.color,
			policy: e.policy,
			stages: rt(e.stages)
		})), a(e);
	}), b = () => void P({
		title: L("settings:library.removeTitle", { name: t.name }),
		body: L("settings:library.removeBody"),
		confirmLabel: L("settings:library.removeConfirm"),
		danger: !0,
		onConfirm: async () => {
			await M(`${Y}/${encodeURIComponent(t.id)}`, {}, "DELETE"), o();
		}
	}), S = (e, t) => _((n) => ({
		...n,
		stages: t ? [...n.stages, e] : n.stages.filter((t) => t !== e)
	}));
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		title: t.name,
		children: [
			/* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsxs)(f, { children: [
				/* @__PURE__ */ (0, U.jsx)(d, {
					term: L("settings:library.videos"),
					children: `${t.videos}`
				}),
				/* @__PURE__ */ (0, U.jsx)(d, {
					term: L("settings:library.missing"),
					children: `${t.missing}`
				}),
				/* @__PURE__ */ (0, U.jsx)(d, {
					term: L("settings:library.synced"),
					children: t.synced_at || L("settings:library.never")
				}),
				/* @__PURE__ */ (0, U.jsx)(d, {
					term: L("settings:library.root"),
					children: /* @__PURE__ */ (0, U.jsx)("span", {
						title: t.root_id,
						children: `${t.account} · ${t.root_name}`
					})
				})
			] }) }),
			/* @__PURE__ */ (0, U.jsxs)(x, { children: [
				/* @__PURE__ */ (0, U.jsx)(D, {
					label: L("settings:library.name"),
					description: L("settings:library.nameHelp"),
					children: /* @__PURE__ */ (0, U.jsx)(h, {
						"aria-label": L("settings:library.nameLabel"),
						value: g.name,
						onChange: (e) => _({
							...g,
							name: e
						})
					})
				}),
				/* @__PURE__ */ (0, U.jsx)(D, {
					label: L("settings:library.icon"),
					description: L("settings:library.iconHelp"),
					children: /* @__PURE__ */ (0, U.jsxs)(T, {
						"aria-label": L("settings:library.icon"),
						selectedKey: g.icon,
						onSelectionChange: (e) => {
							e !== null && _({
								...g,
								icon: String(e)
							});
						},
						children: [/* @__PURE__ */ (0, U.jsx)(E, {
							id: X,
							children: L("settings:library.iconNone")
						}), r.icons.map((e) => /* @__PURE__ */ (0, U.jsx)(E, {
							id: e,
							children: e
						}, e))]
					})
				}),
				/* @__PURE__ */ (0, U.jsx)(D, {
					label: L("settings:library.color"),
					description: L("settings:library.colorHelp"),
					children: /* @__PURE__ */ (0, U.jsxs)(T, {
						"aria-label": L("settings:library.color"),
						selectedKey: g.color || X,
						onSelectionChange: (e) => {
							e !== null && _({
								...g,
								color: String(e) === X ? "" : String(e)
							});
						},
						children: [/* @__PURE__ */ (0, U.jsx)(E, {
							id: X,
							children: L("settings:library.colorNone")
						}), e.map((e) => /* @__PURE__ */ (0, U.jsx)(E, {
							id: String(e[0]),
							children: it(String(e[0]))
						}, String(e[0])))]
					})
				}),
				/* @__PURE__ */ (0, U.jsx)(D, {
					label: L("settings:library.policy"),
					description: L("settings:library.policyHelp"),
					children: /* @__PURE__ */ (0, U.jsx)(T, {
						"aria-label": L("settings:library.policy"),
						selectedKey: g.policy,
						onSelectionChange: (e) => {
							e !== null && _({
								...g,
								policy: String(e)
							});
						},
						children: r.policies.map((e) => /* @__PURE__ */ (0, U.jsx)(E, {
							id: e,
							children: tt[e] ?? e
						}, e))
					})
				}),
				v ? /* @__PURE__ */ (0, U.jsx)(D, {
					label: L("settings:library.stages"),
					description: L("settings:library.stagesHelp"),
					children: /* @__PURE__ */ (0, U.jsx)("div", {
						className: "flex flex-wrap gap-3",
						children: r.stages.map((e) => /* @__PURE__ */ (0, U.jsx)(i, {
							size: "sm",
							isSelected: g.stages.includes(e),
							onChange: (t) => S(e, t),
							children: nt[e] ?? e
						}, e))
					})
				}) : null
			] }),
			c.error ? /* @__PURE__ */ (0, U.jsx)(k, {
				divided: !0,
				children: /* @__PURE__ */ (0, U.jsx)(l, { children: c.error })
			}) : null,
			u ? /* @__PURE__ */ (0, U.jsx)($e, {
				account: t.account,
				onClose: () => m(!1),
				onPick: (e) => void c.run("move", (n) => M(`${Y}/${encodeURIComponent(t.id)}/move`, { remote_id: e.remote_id }, "POST", n), (e) => {
					m(!1), s(e);
				})
			}) : null,
			/* @__PURE__ */ (0, U.jsxs)(p, {
				status: t.folders > 1 ? L("settings:library.foldersMore", { count: t.folders - 1 }) : null,
				children: [
					/* @__PURE__ */ (0, U.jsx)(n, {
						onClick: y,
						...N(c.busy === "save"),
						children: L("settings:library.save")
					}),
					/* @__PURE__ */ (0, U.jsx)(n, {
						variant: "secondary",
						onClick: () => m(!u),
						...N(c.busy === "move"),
						children: L(u ? "settings:library.movePicking" : "settings:library.move")
					}),
					/* @__PURE__ */ (0, U.jsx)(n, {
						variant: "secondary",
						onClick: b,
						children: L("settings:library.remove")
					})
				]
			})
		]
	});
}
function st({ onAdded: e, onClose: t }) {
	let r = ct(z({
		queryKey: o,
		refetchOnMount: "always",
		queryFn: ({ signal: e }) => ce(e)
	}).data), [i, a] = (0, H.useState)(""), [s, c] = (0, H.useState)(!1), u = R(), d = i || r[0]?.key || "";
	return r.length ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		/* @__PURE__ */ (0, U.jsx)(x, { children: /* @__PURE__ */ (0, U.jsx)(D, {
			label: L("settings:library.add.account"),
			description: L("settings:library.add.accountHelp"),
			children: /* @__PURE__ */ (0, U.jsx)(T, {
				"aria-label": L("settings:library.add.accountLabel"),
				selectedKey: d,
				onSelectionChange: (e) => {
					e !== null && (a(String(e)), c(!1));
				},
				children: r.map((e) => /* @__PURE__ */ (0, U.jsx)(E, {
					id: e.key,
					children: e.label
				}, e.key))
			})
		}) }),
		s ? /* @__PURE__ */ (0, U.jsx)($e, {
			account: d,
			onClose: () => c(!1),
			onPick: (t) => void u.run("add", (e) => M(Y, {
				account: d,
				remote_id: t.remote_id
			}, "POST", e), (n) => e(n.name || t.name))
		}) : null,
		u.error ? /* @__PURE__ */ (0, U.jsx)(k, {
			divided: !0,
			children: /* @__PURE__ */ (0, U.jsx)(l, { children: u.error })
		}) : null,
		/* @__PURE__ */ (0, U.jsxs)(p, { children: [/* @__PURE__ */ (0, U.jsx)(n, {
			onClick: () => c(!s),
			disabled: !d,
			...N(u.busy === "add"),
			children: L(s ? "settings:library.add.picking" : "settings:library.add.pick")
		}), /* @__PURE__ */ (0, U.jsx)(n, {
			variant: "secondary",
			onClick: t,
			children: L("settings:library.add.cancel")
		})] }),
		/* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:library.add.idempotent") }) })
	] }) : /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, {
		role: "status",
		children: L("settings:library.add.noAccount")
	}) });
}
function ct(e) {
	return (e?.locations ?? []).flatMap((e) => e.accounts.filter((e) => e.connected).map((t) => ({
		key: t.key,
		label: `${e.label} · ${t.email || t.display_name || t.key}`
	})));
}
// src/react/settings/service-preferences.tsx
function lt({ receipt: e }) {
	let t = z({
		queryKey: S,
		queryFn: ({ signal: e }) => le(e)
	}), n = me(), r = n.error || t.error;
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "speed",
		title: "后台任务",
		children: [/* @__PURE__ */ (0, U.jsx)(x, { children: /* @__PURE__ */ (0, U.jsx)(D, {
			label: "默认处理速度",
			description: "新任务使用此档位。运行中的任务可在活动页单独调整。",
			children: /* @__PURE__ */ (0, U.jsx)(y, {
				value: t.data?.taskSpeedMode || "standard",
				busy: !t.data || n.isPending,
				onChange: (t) => n.mutate({ taskSpeedMode: t }, { onSuccess: () => e("已保存默认处理速度") })
			})
		}) }), r ? /* @__PURE__ */ (0, U.jsx)(k, {
			divided: !0,
			children: /* @__PURE__ */ (0, U.jsx)(l, { children: F(r) })
		}) : null]
	});
}
// src/react/components/configuration-fields.tsx
function Z({ prefix: e, suffix: t, unit: n, fieldClassName: r, ...i }) {
	let a = () => /* @__PURE__ */ (0, U.jsx)("span", {
		"aria-hidden": n ? !0 : void 0,
		className: ie("shrink-0 text-body-regular text-text-secondary", n ? "w-10" : "pr-1"),
		children: n ? /* @__PURE__ */ (0, U.jsx)("span", {
			className: "absolute inset-y-0 right-0 flex items-center border-l border-border-button-default px-2",
			children: n
		}) : t
	});
	return /* @__PURE__ */ (0, U.jsx)(h, {
		...i,
		fieldClassName: r,
		leadingAddon: e ? /* @__PURE__ */ (0, U.jsx)("span", {
			className: "shrink-0 pl-1 text-body-regular text-text-secondary",
			children: e
		}) : void 0,
		trailingIcon: n || t ? a : void 0
	});
}
// src/react/settings/storage-settings.tsx
var Q = "/api/configuration/storage", ut = ["configuration-storage"], dt = 1500, ft = {
	enabled: !1,
	minimum_free_gib: 0,
	data_max_gib: 0,
	cache_max_gib: 0,
	auto_clean: !1,
	external_cache_path: "",
	external_cache_max_gib: 0
}, pt = (e) => e?.job?.state ?? "idle", mt = (e) => pt(e) !== "idle", ht = (e) => ({
	minimum_free_gib: String(e.minimum_free_gib),
	data_max_gib: String(e.data_max_gib),
	cache_max_gib: String(e.cache_max_gib),
	external_cache_max_gib: String(e.external_cache_max_gib),
	enabled: e.enabled,
	auto_clean: e.auto_clean,
	external_cache_path: e.external_cache_path
}), $ = (e) => {
	let t = Number(e);
	return Number.isFinite(t) && t > 0 ? t : 0;
}, gt = (e) => ({
	enabled: e.enabled,
	auto_clean: e.auto_clean,
	minimum_free_gib: $(e.minimum_free_gib),
	data_max_gib: $(e.data_max_gib),
	cache_max_gib: $(e.cache_max_gib),
	external_cache_max_gib: $(e.external_cache_max_gib),
	external_cache_path: e.external_cache_path.trim()
}), _t = (e) => e ? (/* @__PURE__ */ new Date(e * 1e3)).toLocaleString() : "—";
function vt({ receipt: e }) {
	let t = B(), r = z({
		queryKey: ut,
		refetchOnMount: "always",
		queryFn: ({ signal: e }) => j(Q, e),
		refetchInterval: (e) => mt(e.state.data) ? dt : !1
	}), i = (e) => {
		t.setQueryData(ut, e);
	};
	if (r.error) return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "data",
		title: L("settings:storage.title"),
		children: [/* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(l, { children: F(r.error) }) }), /* @__PURE__ */ (0, U.jsx)(p, { children: /* @__PURE__ */ (0, U.jsx)(n, {
			variant: "secondary",
			onClick: () => {
				r.refetch();
			},
			...N(r.isFetching),
			children: L("settings:storage.reload")
		}) })]
	});
	let a = r.data;
	return a ? /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)(yt, {
		state: a,
		receipt: e,
		apply: i
	}), /* @__PURE__ */ (0, U.jsx)(St, {
		state: a,
		receipt: e,
		apply: i
	})] }) : /* @__PURE__ */ (0, U.jsx)(C, {
		guide: "data",
		title: L("settings:storage.title"),
		children: /* @__PURE__ */ (0, U.jsx)(k, { children: /* @__PURE__ */ (0, U.jsx)(m, {
			role: "status",
			children: L("settings:storage.loading")
		}) })
	});
}
function yt({ state: e, receipt: t, apply: r }) {
	let i = R(), a = e.usage ?? null, o = e.job, s = mt(e), c = a?.categories ?? [], [u, h] = (0, H.useState)([]), g = c.filter((e) => e.cleanable && e.reclaimable > 0), _ = u.filter((e) => g.some((t) => t.key === e)), y = (e) => h((t) => t.includes(e) ? t.filter((t) => t !== e) : [...t, e]), b = () => {
		i.run("measure", (e) => M(`${Q}/measure`, {}, "POST", e), (e) => {
			r(e), t(L("settings:storage.measured"));
		});
	}, S = () => {
		let e = g.filter((e) => _.includes(e.key));
		if (!e.length) return;
		let n = e.reduce((e, t) => e + t.reclaimable, 0);
		P({
			title: L("settings:storage.cleanTitle"),
			body: L("settings:storage.cleanBody", {
				labels: e.map((e) => e.label).join(L("settings:storage.listSeparator")),
				size: I(n)
			}),
			confirmLabel: L("settings:storage.cleanConfirm"),
			onConfirm: async () => {
				r(await M(`${Q}/clean`, { categories: e.map((e) => e.key) }, "POST")), h([]), t(L("settings:storage.cleaned"));
			}
		});
	};
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "data",
		title: L("settings:storage.title"),
		children: [
			/* @__PURE__ */ (0, U.jsxs)(k, { children: [
				/* @__PURE__ */ (0, U.jsxs)(f, { children: [/* @__PURE__ */ (0, U.jsx)(d, {
					term: L("settings:storage.dataRoot"),
					children: e.data_root || "—"
				}), /* @__PURE__ */ (0, U.jsx)(d, {
					term: L("settings:storage.disk"),
					children: /* @__PURE__ */ (0, U.jsx)("span", {
						className: "text-left",
						children: L("settings:storage.diskFree", {
							free: I(e.free_bytes),
							total: I(e.total_bytes)
						})
					})
				})] }),
				e.system_drive ? /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:storage.systemDrive") }) : null,
				a?.capacity_error ? /* @__PURE__ */ (0, U.jsx)(v, {
					tone: "warning",
					title: L("settings:storage.capacityErrorTitle"),
					children: a.capacity_error
				}) : null,
				a ? /* @__PURE__ */ (0, U.jsxs)(f, { children: [
					/* @__PURE__ */ (0, U.jsx)(d, {
						term: L("settings:storage.usageTotal"),
						children: I(a.total_bytes)
					}),
					/* @__PURE__ */ (0, U.jsx)(d, {
						term: L("settings:storage.usageFiles"),
						children: L("settings:storage.usageFilesValue", { files: a.total_files.toLocaleString() })
					}),
					/* @__PURE__ */ (0, U.jsx)(d, {
						term: L("settings:storage.usageMeasured"),
						children: _t(a.measured_at)
					})
				] }) : /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:storage.usageEmpty") })
			] }),
			c.length ? /* @__PURE__ */ (0, U.jsx)(x, { children: c.map((e) => /* @__PURE__ */ (0, U.jsx)(bt, {
				item: e,
				selected: _.includes(e.key),
				onToggle: () => y(e.key)
			}, e.key)) }) : null,
			s || o?.error ? /* @__PURE__ */ (0, U.jsxs)(k, {
				divided: !0,
				children: [
					s ? /* @__PURE__ */ (0, U.jsx)(xt, { state: e }) : null,
					o?.message && !o.error ? /* @__PURE__ */ (0, U.jsx)(m, {
						role: "status",
						children: o.message
					}) : null,
					o?.error ? /* @__PURE__ */ (0, U.jsx)(l, { children: o.message }) : null
				]
			}) : null,
			i.error ? /* @__PURE__ */ (0, U.jsx)(k, {
				divided: !0,
				children: /* @__PURE__ */ (0, U.jsx)(l, { children: i.error })
			}) : null,
			/* @__PURE__ */ (0, U.jsxs)(p, {
				status: _.length ? L("settings:storage.cleanStatus", { size: I(g.filter((e) => _.includes(e.key)).reduce((e, t) => e + t.reclaimable, 0)) }) : null,
				children: [/* @__PURE__ */ (0, U.jsx)(n, {
					variant: "secondary",
					onClick: b,
					disabled: s,
					...N(i.busy === "measure"),
					children: L("settings:storage.measure")
				}), /* @__PURE__ */ (0, U.jsx)(n, {
					variant: "secondary",
					onClick: S,
					disabled: s || !_.length,
					...N(i.busy === "clean"),
					children: L("settings:storage.clean")
				})]
			})
		]
	});
}
function bt({ item: e, selected: t, onToggle: n }) {
	let r = e.cleanable && e.reclaimable > 0;
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		className: "flex items-start gap-3 border-b border-separator-border py-2.5 pr-3 last:border-b-0",
		children: [
			/* @__PURE__ */ (0, U.jsx)("div", {
				className: "pt-0.5",
				children: /* @__PURE__ */ (0, U.jsx)(i, {
					size: "sm",
					"aria-label": e.label,
					isSelected: t,
					isDisabled: !r,
					onChange: n
				})
			}),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col gap-0.5",
				children: [
					/* @__PURE__ */ (0, U.jsx)("p", {
						className: "text-body-regular text-text-primary",
						children: e.label
					}),
					e.description ? /* @__PURE__ */ (0, U.jsx)("p", {
						className: "text-body-2-regular wrap-anywhere text-text-secondary",
						children: e.description
					}) : null,
					!e.cleanable && e.note ? /* @__PURE__ */ (0, U.jsx)("p", {
						className: "text-caption-1-regular wrap-anywhere text-text-secondary",
						children: L("settings:storage.cleanableReason", { note: e.note })
					}) : null
				]
			}),
			/* @__PURE__ */ (0, U.jsxs)("div", {
				className: "shrink-0 text-right text-body-2-regular text-text-secondary",
				children: [/* @__PURE__ */ (0, U.jsx)("p", {
					className: "text-text-primary",
					children: I(e.bytes)
				}), e.reclaimable > 0 ? /* @__PURE__ */ (0, U.jsx)("p", { children: L("settings:storage.reclaimable", { size: I(e.reclaimable) }) }) : null]
			})
		]
	});
}
function xt({ state: e }) {
	let t = e.job, n = t?.state === "cleaning" ? L("settings:storage.cleaning") : L("settings:storage.measuring"), r = t?.state === "measuring" ? t.expected_files : null;
	return r && r > 0 ? /* @__PURE__ */ (0, U.jsx)(b, {
		label: n,
		value: t?.files ?? 0,
		max: r
	}) : /* @__PURE__ */ (0, U.jsx)(_, { label: n });
}
function St({ state: e, receipt: t, apply: r }) {
	let i = R(), a = e.budget, [o, s] = (0, H.useState)(() => ht(a?.policy ?? ft)), c = a?.policy ?? ft, u = JSON.stringify(c);
	(0, H.useEffect)(() => {
		s(ht(c));
	}, [u]);
	let d = (e, t) => s((n) => ({
		...n,
		[e]: t
	})), f = (e) => ({
		id: `storage-policy-${e}`,
		type: "number",
		min: 0,
		step: 1,
		inputMode: "numeric",
		value: o[e],
		onChange: (t) => d(e, t)
	}), g = () => {
		i.run("policy", (e) => M(`${Q}/policy`, gt(o), "POST", e), (e) => {
			r(e), t(L("settings:storage.policySaved"));
		});
	};
	return /* @__PURE__ */ (0, U.jsxs)(C, {
		guide: "data",
		title: L("settings:storage.policyTitle"),
		children: [
			/* @__PURE__ */ (0, U.jsxs)(k, { children: [
				/* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:storage.policyHelp") }),
				/* @__PURE__ */ (0, U.jsxs)(x, { children: [/* @__PURE__ */ (0, U.jsx)(D, {
					label: L("settings:storage.policyEnabled"),
					children: /* @__PURE__ */ (0, U.jsx)(A, {
						"aria-label": L("settings:storage.policyEnabled"),
						isSelected: o.enabled,
						onChange: (e) => d("enabled", e)
					})
				}), /* @__PURE__ */ (0, U.jsx)(D, {
					label: L("settings:storage.policyAutoClean"),
					children: /* @__PURE__ */ (0, U.jsx)(A, {
						"aria-label": L("settings:storage.policyAutoClean"),
						isSelected: o.auto_clean,
						onChange: (e) => d("auto_clean", e)
					})
				})] }),
				/* @__PURE__ */ (0, U.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, U.jsx)(Z, {
							label: L("settings:storage.policyMinimumFree"),
							unit: "GiB",
							...f("minimum_free_gib")
						}),
						/* @__PURE__ */ (0, U.jsx)(Z, {
							label: L("settings:storage.policyDataMax"),
							unit: "GiB",
							...f("data_max_gib")
						}),
						/* @__PURE__ */ (0, U.jsx)(Z, {
							label: L("settings:storage.policyCacheMax"),
							unit: "GiB",
							...f("cache_max_gib")
						}),
						/* @__PURE__ */ (0, U.jsx)(Z, {
							label: L("settings:storage.policyExternalMax"),
							unit: "GiB",
							...f("external_cache_max_gib")
						}),
						/* @__PURE__ */ (0, U.jsxs)("div", {
							className: "flex flex-col gap-1.5",
							children: [/* @__PURE__ */ (0, U.jsx)(h, {
								id: "storage-policy-external-path",
								label: L("settings:storage.policyExternalPath"),
								value: o.external_cache_path,
								autoComplete: "off",
								placeholder: L("settings:storage.policyExternalPathPlaceholder"),
								onChange: (e) => d("external_cache_path", e)
							}), /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:storage.policyExternalPathHelp") })]
						})
					]
				}),
				/* @__PURE__ */ (0, U.jsx)(Ct, { budget: a })
			] }),
			i.error ? /* @__PURE__ */ (0, U.jsx)(k, {
				divided: !0,
				children: /* @__PURE__ */ (0, U.jsx)(l, { children: i.error })
			}) : null,
			/* @__PURE__ */ (0, U.jsx)(p, {
				status: a?.last_check ? L("settings:storage.policyCheckedAt", { time: _t(a.last_check.checked_at) }) : null,
				children: /* @__PURE__ */ (0, U.jsx)(n, {
					onClick: g,
					...N(i.busy === "policy"),
					children: L("settings:storage.policySave")
				})
			})
		]
	});
}
function Ct({ budget: e }) {
	if (!e) return null;
	let t = e.last_check;
	return /* @__PURE__ */ (0, U.jsxs)(U.Fragment, { children: [
		e.error ? /* @__PURE__ */ (0, U.jsx)(l, { children: L("settings:storage.policyError", { error: e.error }) }) : null,
		t?.paused && t.reasons.length ? /* @__PURE__ */ (0, U.jsx)(v, {
			tone: "warning",
			title: L("settings:storage.policyPaused"),
			children: t.reasons.join(L("settings:storage.listSeparator"))
		}) : null,
		t && t.freed_bytes > 0 ? /* @__PURE__ */ (0, U.jsx)(m, { children: L("settings:storage.policyFreed", { size: I(t.freed_bytes) }) }) : null
	] });
}
// src/react/settings/configuration-page.tsx
var wt = "存储与备份", Tt = [
	{
		id: "drives",
		title: "网盘"
	},
	{
		id: "libraries",
		title: "媒体库"
	},
	{
		id: "data",
		title: wt
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
], Et = new Map(Tt.map(({ id: e, title: t }) => [`#${e}`, t]));
function Dt({ receipt: e, section: t = "", diagnostics: n }) {
	let i = z({
		queryKey: r,
		queryFn: ({ signal: e }) => se(e)
	}), a = i.data;
	return a ? /* @__PURE__ */ (0, U.jsx)(At, {
		data: a,
		receipt: e,
		section: t,
		diagnostics: n,
		refreshing: i.isFetching,
		reload: () => {
			i.refetch({ cancelRefetch: !1 });
		}
	}) : /* @__PURE__ */ (0, U.jsx)("div", {
		className: "ui-configpage",
		children: /* @__PURE__ */ (0, U.jsx)(v, {
			tone: "error",
			title: L("settings:configuration.loadFailedTitle"),
			children: i.error ? F(i.error) : L("settings:configuration.loadFailedBody")
		})
	});
}
function Ot({ data: e, sections: t, reload: r, refreshing: i }) {
	return /* @__PURE__ */ (0, U.jsx)(U.Fragment, { children: t.map((t) => {
		let a = e.section_errors?.[t];
		return a ? /* @__PURE__ */ (0, U.jsx)(v, {
			tone: "error",
			title: a.title,
			action: /* @__PURE__ */ (0, U.jsx)(n, {
				variant: "secondary",
				size: "small",
				onClick: r,
				...N(i),
				children: "重新读取"
			}),
			children: a.message
		}, t) : null;
	}) });
}
var kt = 0;
function At({ data: e, receipt: t, section: n, diagnostics: r, reload: i, refreshing: a }) {
	let [o] = (0, H.useState)(() => `board-tabs-${++kt}`), [s, c] = (0, H.useState)(() => Et.get(window.location.hash) ?? n), l = (0, H.useRef)(null), u = (0, H.useRef)(s);
	(0, H.useEffect)(() => {
		c(Et.get(window.location.hash) ?? n);
	}, [n]), (0, H.useEffect)(() => {
		let e = () => {
			let e = Et.get(window.location.hash);
			e && c(e);
		};
		return window.addEventListener("hashchange", e), () => window.removeEventListener("hashchange", e);
	}, []), (0, H.useLayoutEffect)(() => {
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
		let t = Tt.find((t) => t.title === e)?.id;
		t && window.location.hash !== `#${t}` && window.history.replaceState(window.history.state, "", `#${t}`);
	}, [f, p] = (0, H.useState)(() => matchMedia("(max-width:900px)").matches);
	(0, H.useEffect)(() => {
		let e = matchMedia("(max-width:900px)"), t = () => p(e.matches);
		return e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []);
	let m = (t) => /* @__PURE__ */ (0, U.jsx)(Ot, {
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
			body: (e) => /* @__PURE__ */ (0, U.jsx)("div", {
				...G(e),
				"data-guide-target": "drives",
				children: /* @__PURE__ */ (0, U.jsx)(He, { receipt: t })
			})
		},
		{
			id: "libraries",
			title: "媒体库",
			body: (e) => /* @__PURE__ */ (0, U.jsx)("div", {
				...G(e),
				"data-guide-target": "libraries",
				children: /* @__PURE__ */ (0, U.jsx)(at, { receipt: t })
			})
		},
		{
			id: "data",
			title: wt,
			body: (e) => /* @__PURE__ */ (0, U.jsxs)("div", {
				...G(e),
				"data-guide-target": "data",
				children: [/* @__PURE__ */ (0, U.jsx)(vt, { receipt: t }), /* @__PURE__ */ (0, U.jsx)(Xe, { receipt: t })]
			})
		},
		...g ? [
			{
				id: "access",
				title: "访问与安全",
				body: (e) => /* @__PURE__ */ (0, U.jsxs)("div", {
					...G(e),
					"data-guide-target": "access",
					children: [m(["access"]), /* @__PURE__ */ (0, U.jsx)(_e, {
						initial: g,
						receipt: h
					})]
				})
			},
			..._ ? [{
				id: "token",
				title: "API 令牌",
				body: (e) => /* @__PURE__ */ (0, U.jsxs)("div", {
					...G(e),
					"data-guide-target": "token",
					children: [m(["api_token"]), /* @__PURE__ */ (0, U.jsx)(be, {
						initial: _,
						mode: g.mode,
						receipt: t
					})]
				})
			}] : [],
			{
				id: "devices",
				title: "设备会话",
				body: (e) => /* @__PURE__ */ (0, U.jsx)("div", {
					...G(e),
					"data-guide-target": "devices",
					children: /* @__PURE__ */ (0, U.jsx)(Le, {
						revision: g.revision,
						receipt: t
					})
				})
			}
		] : [],
		{
			id: "speed",
			title: "任务速度",
			body: (e) => /* @__PURE__ */ (0, U.jsx)("div", {
				...G(e),
				"data-guide-target": "speed",
				children: /* @__PURE__ */ (0, U.jsx)(lt, { receipt: t })
			})
		},
		{
			id: "diagnostics",
			title: "系统诊断",
			body: (e) => /* @__PURE__ */ (0, U.jsx)("div", {
				...G(e),
				"data-guide-target": "diagnostics",
				children: e.active ? r : null
			})
		}
	], y = Math.max(0, v.findIndex((e) => e.title === s));
	return /* @__PURE__ */ (0, U.jsxs)("div", {
		ref: l,
		className: "ui-configpage",
		children: [/* @__PURE__ */ (0, U.jsx)("div", {
			className: "ui-board-local-nav",
			"data-section-nav": "",
			children: /* @__PURE__ */ (0, U.jsx)(O, {
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
		}), v.map(({ id: e, title: t, body: n }, r) => /* @__PURE__ */ (0, U.jsxs)(H.Fragment, { children: [/* @__PURE__ */ (0, U.jsx)("h2", {
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
export { Dt as ConfigurationPage };

//# debugId=ae830ce6-f31e-467d-8d1d-acf474bfc077