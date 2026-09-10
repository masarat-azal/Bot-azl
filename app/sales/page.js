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
  { key: "party", label: "المورد" },
  { key: "item", label: "الصنف" },
  { key: "qty", label: "الكمية" },
  { key: "price", label: "السعر" },
  { key: "amount", label: "الإجمالي" },
  { key: "balance", label: "الرصيد" },
  { key: "invoice", label: "رقم المستند" },
  { key: "notes", label: "ملاحظات" },
];

export default function PurchasesPage() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .purchases()
      .then((data) =>
        setRows(
          data.map((r) => ({
            ...r,
            date: fmtDate(r.date),
            amount: money(r.amount),
            balance: money(r.balance),
          }))
        )
      )
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "المشتريات" }]} />
      <div className="page-pad">
        {err && <div className="error-state">تعذر تحميل المشتريات: {err}</div>}
        {!err && rows === null && <div className="loading">⏳ جاري التحميل...</div>}
        {!err && rows !== null && <SearchableTable columns={COLUMNS} rows={rows} />}
      </div>
    </AppShell>
  );
}
