"use client";
import React, { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import Crumb from "../../components/Crumb";
import OpsList from "../../components/OpsList";
import { api } from "../../lib/api";
import { fmtDate } from "../../lib/theme";

export default function DailyPage() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .daily(10)
      .then(setRows)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "عمليات اليوم (١٠ أيام)" }]} />
      <div className="page-pad">
        {err && <div className="error-state">تعذر التحميل: {err}</div>}
        {!err && rows === null && <div className="loading">⏳ جاري التحميل...</div>}
        {!err && rows !== null && (
          <OpsList
            title="كل عمليات آخر ١٠ أيام"
            rows={rows.map((d) => ({
              desc: d.desc || `${d.kind === "sale" ? "بيع" : "شراء"} — ${d.party}`,
              date: d.date,
              amount: d.amount,
              positive: d.kind === "sale",
            }))}
          />
        )}
      </div>
    </AppShell>
  );
}
