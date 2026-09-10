"use client";
import React, { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import Crumb from "../../components/Crumb";
import { api } from "../../lib/api";

export default function ArchivePage() {
  const [kind, setKind] = useState("voucher"); // 'voucher' | 'transfer'
  const [party, setParty] = useState("");
  const [parties, setParties] = useState([]);
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    Promise.all([api.customers(), api.suppliers()])
      .then(([c, s]) => setParties([...c, ...s].map((p) => p.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setItems(null);
    api
      .archive(kind, party)
      .then(setItems)
      .catch((e) => setErr(e.message));
  }, [kind, party]);

  const filtered = items ? items.filter((it) => it.name.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "الأرشيف" }]} />
      <div className="page-pad">
        <div className="tabs2">
          <div className={`tab2${kind === "voucher" ? " on" : ""}`} onClick={() => setKind("voucher")}>
            🧾 السندات/الفواتير
          </div>
          <div className={`tab2${kind === "transfer" ? " on" : ""}`} onClick={() => setKind("transfer")}>
            💳 إيصالات التحويل
          </div>
        </div>

        <div className="search" style={{ marginTop: 12 }}>
          <span className="ic">🔍</span>
          <input placeholder="بحث باسم الملف..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="minisearch" style={{ padding: 0, marginTop: 10 }}>
          <select className="selectlike" value={party} onChange={(e) => setParty(e.target.value)}>
            <option value="">كل الأطراف (اختياري)</option>
            {parties.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {err && <div className="error-state">تعذر التحميل: {err}</div>}
        {!err && items === null && <div className="loading">⏳ جاري التحميل...</div>}

        {!err && items !== null && (
          <div className="doclist" style={{ marginTop: 12 }}>
            {filtered.length === 0 && <div className="empty-state">لا مستندات مطابقة.</div>}
            {filtered.map((it, i) => (
              <a key={i} className="docitem" href={it.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                <span className="ic">📄</span> {it.name}
                <span style={{ marginRight: "auto", color: "var(--textDim)", fontSize: 10 }}>{it.date}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
