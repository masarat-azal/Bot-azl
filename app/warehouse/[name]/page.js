"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "../../../components/AppShell";
import Crumb from "../../../components/Crumb";
import SummaryCards from "../../../components/SummaryCards";
import SearchableTable from "../../../components/SearchableTable";
import OpsList from "../../../components/OpsList";
import { api } from "../../../lib/api";
import { fmtDate } from "../../../lib/theme";

const COLUMNS = [
  { key: "op", label: "رقم العملية" },
  { key: "date", label: "التاريخ" },
  { key: "type", label: "نوع الحركة" },
  { key: "qty", label: "الكمية" },
  { key: "source", label: "المصدر/الوجهة" },
  { key: "balance", label: "الرصيد" },
  { key: "notes", label: "ملاحظات" },
];

export default function WarehouseDetailPage() {
  const params = useParams();
  const name = decodeURIComponent(params.name);

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .warehouse(name)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [name]);

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "المخزون" }, { label: name }]} />
      <div className="page-pad">
        {err && <div className="error-state">تعذر تحميل بيانات {name}: {err}</div>}
        {!err && !data && <div className="loading">⏳ جاري التحميل...</div>}

        {data && (
          <>
            <SummaryCards
              items={[
                { icon: "➕", label: "إجمالي المضاف", value: `${data.totalAdded.toLocaleString("en-US")} لتر` },
                { icon: "➖", label: "إجمالي المسحوب", value: `${data.totalWithdrawn.toLocaleString("en-US")} لتر` },
                { label: "الرصيد الحالي", value: `${data.balance.toLocaleString("en-US")} لتر`, wide: true },
                { icon: "🧾", label: "عدد العمليات", value: data.opsCount },
                { icon: "📅", label: "آخر عملية", value: data.lastOpDate ? fmtDate(data.lastOpDate) : "—" },
              ]}
            />

            <SearchableTable
              title="جدول المعاينة"
              columns={COLUMNS}
              rows={data.rows.map((r) => ({ ...r, date: fmtDate(r.date), qty: r.qty.toLocaleString("en-US"), balance: r.balance.toLocaleString("en-US") }))}
            />

            <div className="sectitle">إجمالي حسب المصدر/الوجهة</div>
            <div className="totalcards">
              {data.bySource.length === 0 && <div className="empty-state">لا بيانات بعد.</div>}
              {data.bySource.map((s, i) => (
                <div className="tc" key={i}>
                  {s.added > 0 && (
                    <>
                      <div className="l">إضافة من {s.source}</div>
                      <div className="v">{s.added.toLocaleString("en-US")} لتر</div>
                    </>
                  )}
                  {s.withdrawn > 0 && (
                    <>
                      <div className="l" style={{ marginTop: s.added > 0 ? 8 : 0 }}>سحب لـ{s.source}</div>
                      <div className="v">{s.withdrawn.toLocaleString("en-US")} لتر</div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <OpsList
              title="آخر ١٠ أيام — خاصة بهذا المخزن"
              rows={data.rows.slice(0, 10).map((r) => ({
                desc: `${r.type} — ${r.source}`,
                date: fmtDate(r.date),
                amount: r.qty,
                positive: r.type === "إضافة",
              }))}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
