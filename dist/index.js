import { memo as e, useEffect as t, useMemo as n, useRef as r, useState as i } from "react";
import { Box as a, CircularProgress as o, IconButton as s, LinearProgress as ee, Paper as te, Stack as c, Table as ne, TableBody as re, TableCell as l, TableContainer as ie, TableHead as ae, TablePagination as oe, TableRow as u, TableSortLabel as d, Tooltip as se, Typography as f, useMediaQuery as p, useTheme as ce } from "@mui/material";
import m from "@mui/icons-material/EditOutlined";
import h from "@mui/icons-material/DeleteOutlined";
import { jsx as g, jsxs as _ } from "react/jsx-runtime";
// src/data-table/index.jsx
var le = [
	10,
	20,
	50,
	100
], v = {
	edit: {
		key: "edit",
		label: "ویرایش",
		icon: /* @__PURE__ */ g(m, {}),
		color: "default",
		visible: !0,
		disabled: !1
	},
	delete: {
		key: "delete",
		label: "حذف",
		icon: /* @__PURE__ */ g(h, {}),
		color: "error",
		visible: !0,
		disabled: !1
	}
}, y = 150, b = 40, ue = 16, x = () => {};
function S(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function C(e, t, n, r) {
	if (e == null || e === "") return "—";
	let i = {
		column: t,
		selected: r
	}, a = t.format;
	if (typeof a == "function") return a(e, n, i);
	let o = typeof a == "string" ? a : typeof a == "object" && a ? a.type : "text", s = typeof a == "object" && a ? { ...a } : {};
	switch (delete s.type, o) {
		case "number": return new Intl.NumberFormat("fa-IR", s).format(Number(e));
		case "currency": return new Intl.NumberFormat("fa-IR", {
			style: "currency",
			currency: t.currency || "IRR",
			maximumFractionDigits: 0,
			...s
		}).format(Number(e));
		case "percent": return new Intl.NumberFormat("fa-IR", {
			style: "percent",
			maximumFractionDigits: 2,
			...s
		}).format(Number(e));
		case "date":
		case "datetime": {
			let t = new Date(e);
			if (Number.isNaN(t.getTime())) return e;
			let n = {
				year: "numeric",
				month: "2-digit",
				day: "2-digit"
			};
			return o === "datetime" && (n.hour = "2-digit", n.minute = "2-digit"), new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
				...n,
				...s
			}).format(t);
		}
		default: return String(e);
	}
}
function w(e) {
	if (e.minWidth == null) return 0;
	let t = Number(e.minWidth);
	return Number.isFinite(t) ? Math.max(0, t) : 0;
}
function T(e) {
	if (e.maxWidth == null) return Infinity;
	let t = Number(e.maxWidth);
	return Number.isFinite(t) ? Math.max(w(e), t) : Infinity;
}
function E(e) {
	let t = w(e), n = T(e), r = e.width == null ? y : Number(e.width);
	return Math.min(Math.max(Number.isFinite(r) ? r : y, t), n);
}
function de(e, t, n) {
	let r = [...e], i = n - r.reduce((e, t) => e + t, 0);
	for (; i > .01;) {
		let n = t.map((e, t) => ({
			index: t,
			maxWidth: T(e)
		})).filter(({ index: e, maxWidth: t }) => r[e] < t - .01);
		if (n.length === 0) break;
		let a = n.reduce((t, { index: n }) => t + Math.max(e[n], 1), 0);
		if (a <= 0) break;
		let o = n.filter(({ index: t, maxWidth: n }) => i * Math.max(e[t], 1) / a >= n - r[t] - .01);
		if (o.length === 0) {
			for (let { index: t } of n) {
				let n = i * Math.max(e[t], 1) / a;
				r[t] += n;
			}
			i = 0;
			break;
		}
		let s = 0;
		for (let { index: e } of o) {
			let n = T(t[e]) - r[e];
			r[e] += n, s += n;
		}
		if (s <= 0) break;
		i -= s;
	}
	return r;
}
function fe(e, t, n) {
	let r = [...e], i = t.map(w), a = r.reduce((e, t) => e + t, 0) - n;
	for (; a > .01;) {
		let e = r.map((e, t) => ({
			index: t,
			width: e,
			minWidth: i[t]
		})).filter(({ width: e, minWidth: t }) => e > t + .01);
		if (e.length === 0) break;
		let t = e.reduce((e, t) => e + t.width, 0);
		if (t <= 0) break;
		let n = e.filter((e) => a * e.width / t >= e.width - e.minWidth - .01);
		if (n.length === 0) {
			for (let n of e) {
				let e = a * n.width / t;
				r[n.index] -= e;
			}
			a = 0;
			break;
		}
		let o = 0;
		for (let e of n) {
			let t = e.width - e.minWidth;
			r[e.index] = e.minWidth, o += t;
		}
		if (o <= 0) break;
		a -= o;
	}
	return r;
}
function D({ columns: e = [], rows: m = [], getRowId: h = (e) => e.id, loading: y = !1, fetching: w = !1, error: T = !1, errorMessage: D = "خطایی در دریافت اطلاعات رخ داده است.", emptyMessage: O = "اطلاعاتی برای نمایش وجود ندارد", pagination: k = {
	page: 1,
	pageSize: 20,
	total: 0
}, onPaginationChange: A = x, sorting: pe = [], onSortChange: me = x, selectedRowId: j = null, onRowSelect: M = x, getRowSx: N = null, operations: P = ["edit", "delete"], onOperation: he = x, columnFit: F = "scroll", showHeader: ge = !0 }) {
	let [I, L] = i(null), [R, _e] = i(0), z = r(null), B = ce(), V = p(B.breakpoints.up("sm")), H = p(B.breakpoints.up("md")), U = p(B.breakpoints.up("lg")), W = p(B.breakpoints.up("xl")), ve = {
		xs: !0,
		sm: V,
		md: H,
		lg: U,
		xl: W
	}, G = n(() => {
		let e = ["scroll", "shrink"];
		if (typeof F == "string") return e.includes(F) ? F : "scroll";
		if (!F || typeof F != "object") return "scroll";
		let t = [
			"xs",
			"sm",
			"md",
			"lg",
			"xl"
		], n = "scroll";
		for (let r of t) {
			let t = F[r];
			ve[r] && e.includes(t) && (n = t);
		}
		return n;
	}, [
		F,
		V,
		H,
		U,
		W
	]);
	t(() => {
		let e = z.current;
		if (!e) return;
		let t = () => {
			let t = e.clientWidth;
			_e((e) => e === t ? e : t);
		};
		if (t(), typeof ResizeObserver < "u") {
			let n = new ResizeObserver(t);
			return n.observe(e), () => {
				n.disconnect();
			};
		}
		return window.addEventListener("resize", t), () => {
			window.removeEventListener("resize", t);
		};
	}, []);
	let K = n(() => e.filter((e) => !e.hidden), [e]), q = n(() => P.map((e) => typeof e == "string" ? v[e] || null : typeof e == "object" && e ? {
		color: "default",
		visible: !0,
		disabled: !1,
		...v[e.key] || {},
		...e
	} : null).filter(Boolean), [P]), J = q.length > 0, Y = J ? Math.max(b, q.length * b) + ue : 0, X = n(() => {
		let e = K.map(E);
		if (R <= 0 || K.length === 0) return e;
		let t = Math.max(0, R - Y), n = e.reduce((e, t) => e + t, 0);
		return n < t ? de(e, K, t) : n > t && G === "shrink" ? fe(e, K, t) : e;
	}, [
		K,
		R,
		Y,
		G
	]), Z = X.reduce((e, t) => e + t, 0) + Y, Q = pe[0] || null, ye = (e, t) => {
		A({
			page: t + 1,
			pageSize: k.pageSize
		});
	}, be = (e) => {
		A({
			page: 1,
			pageSize: Number(e.target.value)
		});
	}, xe = (e) => {
		let t = [];
		!Q || Q.field !== e ? t = [{
			field: e,
			direction: "asc"
		}] : Q.direction === "asc" && (t = [{
			field: e,
			direction: "desc"
		}]), me(t), k && k.page !== 1 && A({
			page: 1,
			pageSize: k.pageSize
		});
	}, Se = (e) => {
		let t = h(e);
		j === t ? M(null, null) : M(t, e);
	}, Ce = (e, t, n) => {
		e.stopPropagation();
		let r = h(n);
		j !== r && M(r, n), he(t.key, n);
	}, we = (e, t, n) => {
		let r = t[e.field], i = {
			column: e,
			selected: n,
			formatValue: (i = r) => C(i, e, t, n)
		};
		return typeof e.renderCell == "function" ? e.renderCell(r, t, i) : C(r, e, t, n);
	}, Te = (e, t, n) => typeof N == "function" ? N(e, {
		selected: t,
		hovered: n,
		formatValue: (n, r) => C(n, r, e, t)
	}) || {} : {
		cursor: "pointer",
		transition: "background-color 150ms ease",
		backgroundColor: t ? "action.selected" : "background.paper",
		"&:hover": { backgroundColor: "action.hover" }
	}, $ = (e) => /* @__PURE__ */ g(u, { children: /* @__PURE__ */ g(l, {
		colSpan: Math.max(1, K.length + +!!J),
		align: "center",
		sx: { py: 5 },
		children: e
	}) });
	return /* @__PURE__ */ _(a, {
		sx: {
			width: "100%",
			minWidth: 0
		},
		children: [
			w && !y && !T && m.length > 0 && /* @__PURE__ */ g(ee, { sx: {
				borderRadius: 1,
				mb: .5
			} }),
			/* @__PURE__ */ g(a, {
				ref: z,
				sx: {
					width: "100%",
					minWidth: 0
				},
				children: /* @__PURE__ */ g(ie, {
					component: te,
					variant: "outlined",
					sx: {
						width: "100%",
						minWidth: 0,
						overflowX: "auto",
						borderRadius: 1
					},
					children: /* @__PURE__ */ _(ne, {
						size: "small",
						sx: {
							width: `${Z} px`,
							minWidth: `${Z} px`,
							tableLayout: "fixed"
						},
						children: [
							/* @__PURE__ */ _("colgroup", { children: [K.map((e, t) => /* @__PURE__ */ g("col", { style: { width: `${X[t]} px` } }, e.field)), J && /* @__PURE__ */ g("col", { style: { width: `${Y} px` } })] }),
							ge && /* @__PURE__ */ g(ae, { children: /* @__PURE__ */ _(u, { children: [K.map((e, t) => {
								let n = Q?.field === e.field;
								return /* @__PURE__ */ g(l, {
									sx: {
										width: X[t],
										fontWeight: 700,
										whiteSpace: "nowrap",
										textAlign: e.alignment || "start"
									},
									children: e.sortable ? /* @__PURE__ */ g(d, {
										active: n,
										direction: n ? Q.direction : "asc",
										onClick: () => xe(e.field),
										children: e.caption
									}) : e.caption
								}, e.field);
							}), J && /* @__PURE__ */ g(l, {
								align: "center",
								sx: {
									width: Y,
									whiteSpace: "nowrap",
									fontWeight: 700
								},
								children: "عملیات"
							})] }) }),
							/* @__PURE__ */ g(re, { children: y ? $(/* @__PURE__ */ _(c, {
								direction: "row",
								spacing: 1.5,
								alignItems: "center",
								justifyContent: "center",
								children: [/* @__PURE__ */ g(o, { size: 24 }), /* @__PURE__ */ g(f, {
									variant: "body2",
									children: "در حال دریافت اطلاعات..."
								})]
							})) : T ? $(/* @__PURE__ */ g(f, {
								color: "error",
								variant: "body2",
								children: D
							})) : m.length === 0 ? $(/* @__PURE__ */ g(f, {
								color: "text.secondary",
								variant: "body2",
								children: O
							})) : m.map((e) => {
								let t = h(e), n = j === t;
								return /* @__PURE__ */ _(u, {
									onClick: () => Se(e),
									onMouseEnter: () => L(t),
									onMouseLeave: () => L(null),
									sx: Te(e, n, I === t),
									children: [K.map((t, r) => /* @__PURE__ */ g(l, {
										sx: {
											width: X[r],
											direction: t.dir || "auto",
											textAlign: t.alignment || "start"
										},
										children: we(t, e, n)
									}, t.field)), J && /* @__PURE__ */ g(l, {
										align: "center",
										sx: { width: Y },
										children: /* @__PURE__ */ g(c, {
											direction: "row",
											spacing: .5,
											justifyContent: "center",
											children: q.map((t) => {
												let n = S(t.visible, e), r = S(t.disabled, e);
												return n ? /* @__PURE__ */ g(se, {
													title: t.label,
													arrow: !0,
													children: /* @__PURE__ */ g("span", { children: /* @__PURE__ */ g(s, {
														size: "small",
														color: t.color || "default",
														disabled: !!r,
														onClick: (n) => Ce(n, t, e),
														children: t.icon
													}) })
												}, t.key) : null;
											})
										})
									})]
								}, t);
							}) })
						]
					})
				})
			}),
			k && /* @__PURE__ */ g(oe, {
				component: "div",
				count: k.total,
				page: Math.max(0, k.page - 1),
				rowsPerPage: k.pageSize,
				rowsPerPageOptions: le,
				onPageChange: ye,
				onRowsPerPageChange: be,
				labelRowsPerPage: "تعداد در هر صفحه:",
				labelDisplayedRows: ({ from: e, to: t, count: n }) => `${e.toLocaleString("fa-IR")} تا ${t.toLocaleString("fa-IR")} از ${n === -1 ? "بیشتر" : n.toLocaleString("fa-IR")} `
			})
		]
	});
}
var O = e(D);
export { O as DataTable };
