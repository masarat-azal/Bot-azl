"use client";
import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../../components/AppShell";
import Crumb from "../../components/Crumb";
import { api } from "../../lib/api";
import { money, fmtDate, balanceDirection, STATEMENT_THEMES } from "../../lib/theme";
import { generateStatementPDF, generateStatementImage } from "../../lib/pdfGenerator";

const ALL_COLUMNS = [
  { key: "num", ar: "#" },
  { key: "date", ar: "التاريخ" },
  { key: "op", ar: "رقم العملية" },
  { key: "opText", ar: "العملية" },
  { key: "location", ar: "الموقع" },
  { key: "item", ar: "الصنف" },
  { key: "qty", ar: "الكمية" },
  { key: "price", ar: "السعر" },
  { key: "total", ar: "الإجمالي" },
  { key: "fees", ar: "الرسوم" },
  { key: "paid", ar: "المدفوع" },
  { key: "due", ar: "المتبقي" },
  { key: "invoice", ar: "رقم المستند" },
  { key: "notes", ar: "ملاحظات" },
  { key: "__doc__", ar: "المستندات" },
];
const DEFAULT_COLS = ALL_COLUMNS.map((c) => c.key);

const TITLES = ["كشف عام", "كشف مختصر", "كشف مطابقة", "كشف مراجعة وتدقيق"];

const TOTAL_OPTIONS = ["إجمالي المستحق", "إجمالي المدفوع", "الرصيد", "النص (مدين/دائن)", "إجمالي كل صنف", "✏️ بطاقة نصية حرة"];
const DEFAULT_TOTALS = ["إجمالي المستحق", "إجمالي المدفوع", "الرصيد", "النص (مدين/دائن)"];

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="loading">⏳ جاري التحميل...</div>}>
      <BuilderInner />
    </Suspense>
  );
}

function BuilderInner() {
  const searchParams = useSearchParams();
  const preselectedParty = searchParams.get("party") || "";

  const [allParties, setAllParties] = useState(null);
  const [party, setParty] = useState(preselectedParty);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [title, setTitle] = useState(TITLES[0]);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [totalsSel, setTotalsSel] = useState(DEFAULT_TOTALS);
  const [freeText, setFreeText] = useState("");
const [themeKey, setThemeKey] = useState("light");
  const [format, setFormat] = useState("pdf");
  const [orientation, setOrientation] = useState("landscape");
  const [opStyle, setOpStyle] = useState("full");
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    Promise.all([api.customers(), api.suppliers(), api.warehouses()])
      .then(([c, s, w]) => {
        const list = [
          ...c.map((x) => ({ name: x.name, kind: "customer" })),
          ...s.map((x) => ({ name: x.name, kind: "supplier" })),
          ...w.map((x) => ({ name: x.name, kind: "warehouse" })),
        ];
        setAllParties(list);
        if (!party && list.length) setParty(list[0].name);
      })
      .catch((e) => setErrMsg(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleCol(key) {
    setCols((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  }
  function toggleTotal(t) {
    setTotalsSel((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  }

  async function generate() {
    if (!party) return;
    setBusy(true);
    setErrMsg("");
    try {
      const selectedParty = allParties.find((p) => p.name === party);
      const isWarehouse = selectedParty?.kind === "warehouse";
      const isSupplier = selectedParty?.kind === "supplier";

      let rows, totalDue, totalPaid, balance, byItem, periodText;

      if (isWarehouse) {
        const data = await api.warehouse(party);
                const filtered = filterByPeriod(data.rows, from, to);
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        rows = filtered.map((r, i) => ({
          num: i + 1, date: fmtDate(r.date), op: r.op, opText: r.type, location: "—", item: "—",
          qty: r.qty.toLocaleString("en-US"), price: "—", total: r.qty.toLocaleString("en-US") + " لتر",
          fees: "—", paid: "—", due: "—", invoice: "—", notes: r.notes || "—", docUrl: null,
        }));
        totalDue = data.totalAdded; totalPaid = data.totalWithdrawn; balance = data.balance; byItem = {};
        periodText = periodLabel(from, to, filtered);
      } else {
        const data = await api.party(party);
                const filtered = filterByPeriod(data.rows, from, to);
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        byItem = {};
        filtered.forEach((r) => {
          if (!r.item) return;
          if (!byItem[r.item]) byItem[r.item] = { qty: 0, amount: 0 };
          byItem[r.item].qty += Number(r.qty) || 0;
          byItem[r.item].amount += r.total;
        });
        rows = filtered.map((r, i) => ({
          num: i + 1, date: fmtDate(r.date), op: r.op || "—",
          opText: composeOpText(r, party, isSupplier, opStyle),
          location: r.location || "—", item: r.item || "—", qty: r.qty ? Number(r.qty).toLocaleString("en-US") : "—",
          price: r.price || "—", total: money(r.total), fees: money(r.fees || 0), paid: money(r.paid),
          due: money(r.due), invoice: r.invoice || "—", notes: r.notes || "—", docUrl: r.docUrl,
        }));
        totalDue = filtered.reduce((s, r) => s + r.total, 0);
        totalPaid = filtered.reduce((s, r) => s + r.paid, 0);
        balance = totalDue - totalPaid;
        periodText = periodLabel(from, to, filtered);
      }

      const columns = ALL_COLUMNS.filter((c) => cols.includes(c.key));
      const totalsCards = [];
      if (totalsSel.includes("إجمالي المستحق")) totalsCards.push({ icon: "due", label: "إجمالي المستحق", value: isWarehouse ? `${totalDue.toLocaleString("en-US")} لتر` : money(totalDue), highlight: true });
      if (totalsSel.includes("إجمالي المدفوع")) totalsCards.push({ icon: "paid", label: isWarehouse ? "إجمالي المسحوب" : "إجمالي المدفوع", value: isWarehouse ? `${totalPaid.toLocaleString("en-US")} لتر` : money(totalPaid) });
      if (totalsSel.includes("الرصيد") && !isWarehouse) totalsCards.push({ icon: "notes", label: "الرصيد", value: money(balance) });
      if (totalsSel.includes("النص (مدين/دائن)") && !isWarehouse) {
        const dir = balanceDirection(isSupplier, balance);
        totalsCards.push({ icon: "notes", label: dir.text, value: money(dir.amount) });
      }
      if (totalsSel.includes("إجمالي كل صنف")) {
        Object.entries(byItem).forEach(([item, v]) => {
          totalsCards.push({ icon: "qty", label: `إجمالي ${item}`, value: `${v.qty.toLocaleString("en-US")} لتر · ${money(v.amount)}` });
        });
      }
      if (totalsSel.includes("✏️ بطاقة نصية حرة") && freeText.trim()) {
        totalsCards.push({ icon: "notes", label: freeText.trim(), value: "" });
      }

      const fileBase = `${title} - ${party} - ${new Date().toISOString().slice(0, 10)}`;
      if (format === "image") {
        await generateStatementImage({ partyName: party, columns, rows, totalsCards, themeKey });
      } else {
        await generateStatementPDF({
          fileName: `${fileBase}.pdf`, partyName: party, partyLabel: isWarehouse ? "المخزن" : isSupplier ? "المورد" : "العميل",
          periodText, titleText: `${title} — ${party}`, columns, rows, totalsCards,
          landscape: orientation === "landscape", themeKey,
        });
      }
    } catch (e) {
      setErrMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "صناعة الكشوف" }]} />
      <div className="page-pad">
        {errMsg && <div className="error-state">{errMsg}</div>}

        <div className="wizrow">
          <h4>عنوان الكشف</h4>
          <select className="selectlike" value={title} onChange={(e) => setTitle(e.target.value)}>
            {TITLES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="wizrow">
          <h4>الطرف والفترة</h4>
          <select className="selectlike" style={{ marginBottom: 8 }} value={party} onChange={(e) => setParty(e.target.value)}>
            {!allParties && <option>⏳ جاري التحميل...</option>}
            {allParties &&
              allParties.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="date" className="selectlike" style={{ fontSize: 11 }} value={from} onChange={(e) => setFrom(e.target.value)} />
            <input type="date" className="selectlike" style={{ fontSize: 11 }} value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "var(--textDim)" }}>فارغان = الكشف كامل بلا فترة محددة</div>
        </div>

        <div className="wizrow">
          <h4>الأعمدة</h4>
          <div className="chiplist">
            {ALL_COLUMNS.map((c) => (
              <span key={c.key} className={`chip${cols.includes(c.key) ? " on" : ""}`} onClick={() => toggleCol(c.key)}>
                {c.ar}
              </span>
            ))}
          </div>
        </div>

        <div className="wizrow">
          <h4>بطاقات الإجمالي</h4>
          <div className="chiplist">
            {TOTAL_OPTIONS.map((t) => (
              <span key={t} className={`chip${totalsSel.includes(t) ? " on" : ""}`} onClick={() => toggleTotal(t)}>
                {t}
              </span>
            ))}
          </div>
          {totalsSel.includes("✏️ بطاقة نصية حرة") && (
            <input className="selectlike" style={{ marginTop: 10 }} placeholder="اكتب نص البطاقة الحرة..." value={freeText} onChange={(e) => setFreeText(e.target.value)} />
          )}
        </div>

        <div className="wizrow">
          <h4>الثيم (خاص بالكشف فقط)</h4>
          <div className="themeswatches">
            {Object.entries(STATEMENT_THEMES).map(([k, t]) => (
              <div
                key={k}
                className={`sw${themeKey === k ? " on" : ""}`}
                style={{ background: `linear-gradient(135deg, ${t.head}, ${t.accent})` }}
                onClick={() => setThemeKey(k)}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div className="wizrow">
          <h4>الصيغة والاتجاه</h4>
          <div className="chiplist">
            <span className={`chip${format === "pdf" ? " on" : ""}`} onClick={() => setFormat("pdf")}>PDF</span>
            <span className={`chip${format === "image" ? " on" : ""}`} onClick={() => setFormat("image")}>صورة</span>
            <span className={`chip${orientation === "landscape" ? " on" : ""}`} onClick={() => setOrientation("landscape")}>أفقي</span>
            <span className={`chip${orientation === "portrait" ? " on" : ""}`} onClick={() => setOrientation("portrait")}>عمودي</span>
            <span className={`chip${opStyle === "full" ? " on" : ""}`} onClick={() => setOpStyle("full")}>صيغة كاملة</span>
            <span className={`chip${opStyle === "short" ? " on" : ""}`} onClick={() => setOpStyle("short")}>صيغة مختصرة</span>
          </div>
        </div>

        <button className="bigbtn" onClick={generate} disabled={busy || !party}>
          {busy ? "⏳ جاري الإنشاء..." : "✅ إنشاء الكشف"}
        </button>
      </div>
    </AppShell>
  );
}

function filterByPeriod(rows, from, to) {
  if (!from && !to) return rows;
  return rows.filter((r) => {
    const d = new Date(r.date);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to)) return false;
    return true;
  });
}

function periodLabel(from, to, rows) {
  if (from || to) return `${from ? fmtDate(from) : "البداية"} — ${to ? fmtDate(to) : "اليوم"}`;
  if (!rows.length) return "—";
  const dates = rows.map((r) => new Date(r.date)).sort((a, b) => a - b);
  return `${fmtDate(dates[0])} — ${fmtDate(dates[dates.length - 1])}`;
}

function composeOpText(r, partyName, isSupplier, style) {
  if (!r.item) return r.type || "—";
  const verb = isSupplier ? "شراء" : "بيع";
  const base = `${verb} ${r.item}${r.qty ? " " + Number(r.qty).toLocaleString("en-US") + " لتر" : ""}${r.price ? " بسعر " + r.price : ""}`;
  if (style === "short") return base;
  return `${verb} ${isSupplier ? "من " : "لـ"}${partyName} ${r.item}${r.qty ? " " + Number(r.qty).toLocaleString("en-US") + " لتر" : ""}${r.total ? " بقيمة " + money(r.total) : ""}`;
}
