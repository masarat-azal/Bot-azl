"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../../components/AppShell";
import Crumb from "../../../../components/Crumb";
import SummaryCards from "../../../../components/SummaryCards";
import OpsList from "../../../../components/OpsList";
import { api } from "../../../../lib/api";
import { fmtDate, money, balanceDirection } from "../../../../lib/theme";

const ALL_COLUMNS = [
  { key: "date", label: "التاريخ" },
  { key: "location", label: "الموقع" },
  { key: "item", label: "الصنف" },
  { key: "qty", label: "الكمية" },
  { key: "price", label: "السعر" },
  { key: "total", label: "الإجمالي" },
  { key: "fees", label: "الرسوم" },
  { key: "paid", label: "المدفوع" },
  { key: "due", label: "المتبقي" },
  { key: "invoice", label: "رقم المستند" },
  { key: "notes", label: "ملاحظات" },
  { key: "docs", label: "المستندات" },
];
const DEFAULT_VISIBLE = ["date", "location", "item", "qty", "price", "total", "paid", "due", "docs"];
const COLS_PREF_KEY = "masarat_party_cols";

export default function PartyDetailPage() {
  const params = useParams();
  const type = params.type; // 'customer' | 'supplier'
  const name = decodeURIComponent(params.name);
  const isSupplier = type === "supplier";

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [showColPicker, setShowColPicker] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem(COLS_PREF_KEY);
    if (saved) {
      try {
        setVisibleCols(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    api
      .party(name)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [name]);

  function toggleCol(key) {
    setVisibleCols((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        localStorage.setItem(COLS_PREF_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }

  const filteredRows = useMemo(() => {
    if (!data) return [];
    if (!q.trim()) return data.rows;
    const needle = q.trim().toLowerCase();
    return data.rows.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(needle)));
  }, [q, data]);

  const columns = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key));
  const label = isSupplier ? "الموردون" : "العملاء";

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label }, { label: name }]} />
      <div className="page-pad">
        {err && <div className="error-state">تعذر تحميل بيانات {name}: {err}</div>}
        {!err && !data && <div className="loading">⏳ جاري التحميل...</div>}

        {data && (
          <>
            {(() => {
              const dir = balanceDirection(isSupplier, data.balance);
              return (
                <SummaryCards
                  items={[
                    { icon: "💰", label: "المدفوع", value: money(data.totalPaid) },
                    { icon: "📌", label: "المستحق", value: money(data.totalDue) },
                    { label: `الرصيد — ${dir.text}`, value: money(dir.amount), wide: true },
                    { icon: "🧾", label: "عدد العمليات", value: data.opsCount },
                    { icon: "📅", label: "آخر عملية", value: data.lastOpDate ? fmtDate(data.lastOpDate) : "—" },
                  ]}
                />
              );
            })()}

            <div className="tablewrap">
              <div className="tablehead">
                <h3>الكشف العام</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="flexbtn" onClick={() => setShowColPicker((s) => !s)} style={{ background: "var(--panel2)", color: "var(--text)", border: "1px solid var(--line)" }}>
                    ⚙️ الأعمدة
                  </button>
                  <Link href={`/builder?party=${encodeURIComponent(name)}`}>
                    <span className="flexbtn" style={{ display: "inline-block" }}>🧩 كشف مرن</span>
                  </Link>
                </div>
              </div>

              {showColPicker && (
                <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }} className="chiplist">
                  {ALL_COLUMNS.map((c) => (
                    <span key={c.key} className={`chip${visibleCols.includes(c.key) ? " on" : ""}`} onClick={() => toggleCol(c.key)}>
                      {c.label}
                    </span>
                  ))}
                </div>
              )}

              <div className="minisearch">
                <input placeholder="🔍 بحث..." value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="scrolltable">
                {filteredRows.length === 0 ? (
                  <div className="empty-state">لا توجد عمليات.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        {columns.map((c) => (
                          <th key={c.key}>{c.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((r, i) => (
                        <tr key={i}>
                          {columns.map((c) => {
                            if (c.key === "docs") {
                              return (
                                <td key={c.key}>
                                  {r.docUrl ? (
                                    <a className="doclink" href={r.docUrl} target="_blank" rel="noreferrer">
                                      👁️
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              );
                            }
                            if (["total", "paid", "due", "fees"].includes(c.key)) return <td key={c.key}>{money(r[c.key])}</td>;
                            if (c.key === "date") return <td key={c.key}>{fmtDate(r.date)}</td>;
                            return <td key={c.key}>{r[c.key] ?? "—"}</td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <OpsList
              title="آخر ١٠ أيام — خاصة بهذا الطرف"
              rows={data.rows.slice(0, 10).map((r) => ({
                desc: `${r.type} ${r.item ? r.item : ""} ${r.location ? "— " + r.location : ""}`.trim(),
                date: fmtDate(r.date),
                amount: r.total,
                positive: !isSupplier,
              }))}
            />

            <div className="doclist">
              {data.rows.filter((r) => r.docUrl).length === 0 && <div className="empty-state">لا مستندات بعد.</div>}
              {data.rows
                .filter((r) => r.docUrl)
                .map((r, i) => (
                  <div className="docitem" key={i}>
                    <span className="ic">📄</span> مستند العملية {r.op} — {fmtDate(r.date)}
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
