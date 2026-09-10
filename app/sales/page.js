"use client";
import React, { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import Crumb from "../../components/Crumb";
import SearchableTable from "../../components/SearchableTable";
import { api } from "../../lib/api";
import { fmtDate, money } from "../../lib/theme";

const COLUMNS = [
  { key: "op", label: "رقم العملية" },
  { key: "date", label: "التاريخ" },
  { key: "party", label: "العميل" },
  { key: "location", label: "الموقع" },
  { key: "item", label: "الصنف" },
  { key: "qty", label: "الكمية" },
  { key: "price", label: "السعر" },
  { key: "total", label: "الإجمالي" },
  { key: "fees", label: "الرسوم" },
  { key: "net", label: "الصافي" },
  { key: "paid", label: "المدفوع" },
  { key: "due", label: "المتبقي" },
  { key: "invoice", label: "رقم المستند" },
  { key: "notes", label: "ملاحظات" },
];

export default function SalesPage() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .sales()
      .then((data) =>
        setRows(
          data.map((r) => ({
            ...r,
            date: fmtDate(r.date),
            total: money(r.total),
            fees: money(r.fees),
            net: money(r.net),
            paid: money(r.paid),
            due: money(r.due),
          }))
        )
      )
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "المبيعات" }]} />
      <div className="page-pad">
        {err && <div className="error-state">تعذر تحميل المبيعات: {err}</div>}
        {!err && rows === null && <div className="loading">⏳ جاري التحميل...</div>}
        {!err && rows !== null && <SearchableTable columns={COLUMNS} rows={rows} />}
      </div>
    </AppShell>
  );
}
