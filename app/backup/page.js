"use client";
import React, { useEffect, useMemo, useState, Suspense } from "react";

import AppShell from "../../components/AppShell";
import Crumb from "../../components/Crumb";
import { api } from "../../lib/api";
import { money, fmtDate, balanceDirection } from "../../lib/theme";
import { generateStatementPDF } from "../../lib/pdfGenerator";

export default function BackupPage() {
  const [names, setNames] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    Promise.all([api.customers(), api.suppliers(), api.warehouses()])
      .then(([c, s, w]) => setNames({ customers: c.map((x) => x.name), suppliers: s.map((x) => x.name), warehouses: w.map((x) => x.name) }))
      .catch((e) => setErr(e.message));
  }, []);

  async function runBackup() {
    if (!names) return;
    setBusy(true);
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    try {
      // ١) كشوف الأطراف الفردية (عملاء + موردون) — كاملة بجدول إجمالي وكشف نصي
      const allParties = [
        ...names.customers.map((n) => ({ name: n, isSupplier: false })),
        ...names.suppliers.map((n) => ({ name: n, isSupplier: true })),
      ];
      for (const p of allParties) {
        setProgress(`جاري تجهيز ${p.name}...`);
        const data = await api.party(p.name);
        const dir = balanceDirection(p.isSupplier, data.balance);
        const columns = [
          { key: "op", ar: "رقم العملية" }, { key: "date", ar: "التاريخ" }, { key: "type", ar: "العملية" },
          { key: "location", ar: "الموقع" }, { key: "item", ar: "الصنف" }, { key: "qty", ar: "الكمية" },
          { key: "price", ar: "السعر" }, { key: "total", ar: "الإجمالي" }, { key: "paid", ar: "المدفوع" },
          { key: "due", ar: "المتبقي" }, { key: "invoice", ar: "رقم المستند" }, { key: "notes", ar: "ملاحظات" },
          { key: "__doc__", ar: "المستندات" },
        ];
        const rows = data.rows.map((r) => ({ ...r, date: fmtDate(r.date), total: money(r.total), paid: money(r.paid), due: money(r.due) }));
        const blob = await generateStatementPDF({
          fileName: `${p.name}.pdf`, partyName: p.name, partyLabel: p.isSupplier ? "المورد" : "العميل",
          periodText: data.rows.length ? `${fmtDate(data.rows[data.rows.length - 1].date)} — ${fmtDate(data.rows[0].date)}` : "—",
          titleText: `كشف عام — ${p.name}`, columns, rows,
          totalsCards: [
            { icon: "paid", label: "إجمالي المدفوع", value: money(data.totalPaid) },
            { icon: "due", label: "إجمالي المستحق", value: money(data.totalDue), highlight: true },
            { icon: "notes", label: dir.text, value: money(dir.amount) },
          ],
          landscape: true, themeKey: "1",
        }).then((b) => b, () => null);
        if (blob) zip.file(`${p.name}.pdf`, blob);
      }

      // ٢) كشفا المبيعات والمشتريات العامّان — بلا مستندات وبلا جدول إجمالي
      setProgress("جاري تجهيز المبيعات...");
      const sales = await api.sales();
      const salesCols = [
        { key: "op", ar: "رقم العملية" }, { key: "date", ar: "التاريخ" }, { key: "party", ar: "العميل" },
        { key: "location", ar: "الموقع" }, { key: "item", ar: "الصنف" }, { key: "qty", ar: "الكمية" },
        { key: "price", ar: "السعر" }, { key: "total", ar: "الإجمالي" }, { key: "paid", ar: "المدفوع" },
        { key: "due", ar: "المتبقي" }, { key: "invoice", ar: "رقم المستند" }, { key: "notes", ar: "ملاحظات" },
      ];
      const salesBlob = await generateStatementPDF({
        fileName: "المبيعات.pdf", partyName: "كل العملاء", partyLabel: "التقرير",
        periodText: "كامل السجل", titleText: "كشف عام — المبيعات", columns: salesCols,
        rows: sales.map((r) => ({ ...r, date: fmtDate(r.date), total: money(r.total), paid: money(r.paid), due: money(r.due) })),
        totalsCards: [], landscape: true, themeKey: "1",
      }).then((b) => b, () => null);
      if (salesBlob) zip.file("المبيعات.pdf", salesBlob);

      setProgress("جاري تجهيز المشتريات...");
      const purchases = await api.purchases();
      const buysCols = [
        { key: "op", ar: "رقم العملية" }, { key: "date", ar: "التاريخ" }, { key: "party", ar: "المورد" },
        { key: "item", ar: "الصنف" }, { key: "qty", ar: "الكمية" }, { key: "price", ar: "السعر" },
        { key: "amount", ar: "الإجمالي" }, { key: "balance", ar: "الرصيد" }, { key: "invoice", ar: "رقم المستند" }, { key: "notes", ar: "ملاحظات" },
      ];
      const buysBlob = await generateStatementPDF({
        fileName: "المشتريات.pdf", partyName: "كل الموردين", partyLabel: "التقرير",
        periodText: "كامل السجل", titleText: "كشف عام — المشتريات", columns: buysCols,
        rows: purchases.map((r) => ({ ...r, date: fmtDate(r.date), amount: money(r.amount), balance: money(r.balance) })),
        totalsCards: [], landscape: true, themeKey: "1",
      }).then((b) => b, () => null);
      if (buysBlob) zip.file("المشتريات.pdf", buysBlob);

      // ٣) المخازن
      for (const w of names.warehouses) {
        setProgress(`جاري تجهيز ${w}...`);
        const data = await api.warehouse(w);
        const cols = [
          { key: "op", ar: "رقم العملية" }, { key: "date", ar: "التاريخ" }, { key: "type", ar: "نوع الحركة" },
          { key: "qty", ar: "الكمية" }, { key: "source", ar: "المصدر/الوجهة" }, { key: "balance", ar: "الرصيد" }, { key: "notes", ar: "ملاحظات" },
        ];
        const blob = await generateStatementPDF({
          fileName: `${w}.pdf`, partyName: w, partyLabel: "المخزن", periodText: "كامل السجل",
          titleText: `كشف مخزون — ${w}`, columns: cols,
          rows: data.rows.map((r) => ({ ...r, date: fmtDate(r.date), qty: r.qty.toLocaleString("en-US"), balance: r.balance.toLocaleString("en-US") })),
          totalsCards: [
            { icon: "qty", label: "إجمالي المضاف", value: `${data.totalAdded.toLocaleString("en-US")} لتر` },
            { icon: "qty", label: "إجمالي المسحوب", value: `${data.totalWithdrawn.toLocaleString("en-US")} لتر`, highlight: true },
          ],
          landscape: true, themeKey: "1",
        }).then((b) => b, () => null);
        if (blob) zip.file(`${w}.pdf`, blob);
      }

      setProgress("جاري ضغط الملفات...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `نسخة-احتياطية-مسارات-أزل-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setProgress("✅ اكتملت النسخة الاحتياطية.");
    } catch (e) {
      setProgress("⚠️ حدث خطأ: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "نسخة احتياطية" }]} />
      <div className="page-pad">
        {err && <div className="error-state">تعذر تحميل قائمة الأطراف: {err}</div>}
        <div className="wizrow">
          <h4>ستُنشأ حزمة واحدة (ZIP) تحتوي:</h4>
          <div className="chiplist">
            <span className="chip on">المبيعات.pdf</span>
            <span className="chip on">المشتريات.pdf</span>
            {names?.customers.map((n) => (
              <span className="chip on" key={n}>{n}.pdf</span>
            ))}
            {names?.suppliers.map((n) => (
              <span className="chip on" key={n}>{n}.pdf</span>
            ))}
            {names?.warehouses.map((n) => (
              <span className="chip on" key={n}>{n}.pdf</span>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--textDim)" }}>
            كل السجل الكامل بلا فترة محددة — بلا نسخ من ملفات درايف (محفوظة هناك أصلًا)
          </div>
        </div>

        {progress && <div className="wizrow" style={{ textAlign: "center", color: "var(--gold)", fontWeight: 700 }}>{progress}</div>}

        <button className="bigbtn" onClick={runBackup} disabled={busy || !names}>
          {busy ? "⏳ جاري التجهيز..." : "☁️ إنشاء النسخة الاحتياطية الآن"}
        </button>
      </div>
    </AppShell>
  );
}
