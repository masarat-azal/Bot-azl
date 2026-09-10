import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { STATEMENT_THEMES } from "./theme";

const ICONS = {
  paid: `<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>`,
  due: `<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>`,
  qty: `<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;"><path d="M6 4h12l1 4-1 12H6L5 8z"/><path d="M5 8h14"/></svg>`,
  notes: `<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;"><path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  period: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M3 12h18M8 6l-5 6 5 6M16 6l5 6-5 6"/></svg>`,
  user: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#fff;fill:none;stroke-width:2;"><path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6"/></svg>`,
  statement: `<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2;"><path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6M9 18h3"/></svg>`,
};

const LOGO_URL = "/images/logo.png";
const BANNER_URL = "/images/banner-truck.jpg";

function buildHeaderCells(columns) {
  return columns.map((c) => `<th style="padding:9px 6px;">${c.ar}</th>`).join("");
}

function buildRowsHtml(columns, rows, theme) {
  return rows
    .map((r, i) => {
      const cells = columns
        .map((c) => {
          if (c.key === "__doc__") {
            return `<td style="padding:7px 6px;">${
              r.docUrl
                ? `<span style="display:inline-flex;align-items:center;gap:5px;background:${theme.accent};color:${theme.accentTxt};border-radius:20px;padding:5px 11px;font-size:9.5px;font-weight:700;">${ICONS.doc.replace("#fff", theme.accentTxt)} عرض الإرسال</span>`
                : `<span style="color:${theme.textDim};font-size:9.5px;">لا يوجد</span>`
            }</td>`;
          }
          return `<td style="padding:8px 6px;">${r[c.key] ?? "—"}</td>`;
        })
        .join("");
      return `<tr style="background:${i % 2 === 0 ? theme.panel : theme.rowAlt};color:${theme.text};">${cells}</tr>`;
    })
    .join("");
}

function buildCardsHtml(totalsCards, theme) {
  return totalsCards
    .map(
      (c) => `<div style="background:${c.highlight ? theme.accent : theme.cardBg};border:1px solid ${c.highlight ? theme.accent : theme.cardBorder};border-radius:14px;padding:12px 8px;text-align:center;">
      <div style="width:30px;height:30px;border-radius:50%;background:${c.highlight ? "rgba(255,255,255,.3)" : theme.head};display:flex;align-items:center;justify-content:center;margin:0 auto 6px;">${ICONS[c.icon] || ""}</div>
      <div style="font-size:9px;color:${c.highlight ? theme.accentTxt : theme.textDim};">${c.label}</div>
      <div style="font-size:13px;font-weight:800;margin-top:4px;color:${c.highlight ? theme.accentTxt : theme.text};">${c.value}</div>
    </div>`
    )
    .join("");
}

function buildHeaderBar(theme, partyName, partyLabel, periodText) {
  return `
    <div style="background:${theme.panel};padding:14px 26px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${theme.line};">
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="${LOGO_URL}" style="width:44px;height:44px;object-fit:contain;" />
        <div><div style="font-weight:800;font-size:17px;color:${theme.text};">مسارات أزل</div><div style="font-size:10px;color:${theme.textDim};">Masarat Azal</div></div>
      </div>
      <div style="text-align:left;font-size:10.5px;color:${theme.textDim};line-height:1.9;">
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">تاريخ الإصدار: ${new Date().toLocaleDateString("en-GB")} <span style="color:${theme.accent};">${ICONS.calendar}</span></div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">الفترة: ${periodText} <span style="color:${theme.accent};">${ICONS.period}</span></div>
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">المستخدم: مدير النظام <span style="color:${theme.accent};">${ICONS.user}</span></div>
      </div>
    </div>`;
}

function buildBanner(theme) {
  return `
    <div style="position:relative;margin:18px 26px 0;border-radius:20px;overflow:hidden;height:150px;border:1px solid ${theme.line};box-shadow:0 10px 26px rgba(0,0,0,.18);">
      <img src="${BANNER_URL}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />
      <div style="position:absolute;inset:0;background:linear-gradient(90deg, ${theme.head}CC 0%, ${theme.head}55 40%, transparent 75%);"></div>
      <div style="position:absolute;top:22px;right:24px;color:#fff;">
        <div style="font-size:17px;font-weight:800;">شريكك في نقل الطاقة ..</div>
        <div style="font-size:12px;color:#E7E2D3;margin-top:4px;">بأمان .. في الوقت المحدد</div>
      </div>
      <div style="position:absolute;bottom:-20px;right:24px;background:${theme.head};border:1.5px solid ${theme.accent};border-radius:16px;padding:9px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 18px rgba(0,0,0,.22);">
        <div style="text-align:right;">
          <div style="color:#fff;font-weight:800;font-size:12.5px;">كشف حساب / عميل</div>
          <div style="color:${theme.accent};font-size:9px;">Matching Statement / Customer</div>
        </div>
        <div style="width:30px;height:30px;border-radius:9px;background:${theme.accent};display:flex;align-items:center;justify-content:center;">${ICONS.statement.replace("#fff", theme.accentTxt)}</div>
      </div>
    </div>`;
}

/**
 * يبني كشف PDF بتصميم موحّد (بانر + هيدر + شارة + جدول + بطاقات إجمالي).
 * columns: [{key, ar}]   rows: [{...}]   totalsCards: [{icon, label, value, highlight}]
 * themeKey: "light" | "dark"
 */
export async function generateStatementPDF({ fileName, partyName, partyLabel, periodText, titleText, columns, rows, totalsCards, landscape, themeKey }) {
  const theme = STATEMENT_THEMES[themeKey] || STATEMENT_THEMES.light;
  const pageWidthPx = landscape ? 1180 : 820;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = pageWidthPx + "px";
  container.style.background = theme.bg;
  container.style.fontFamily = "'Noto Sans Arabic', Cairo, Tahoma, sans-serif";
  container.dir = "rtl";

  container.innerHTML = `
    ${buildHeaderBar(theme, partyName, partyLabel, periodText)}
    ${buildBanner(theme)}
    <div style="padding:38px 26px 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;border-radius:10px;overflow:hidden;">
        <thead><tr style="background:${theme.head};color:#fff;font-weight:700;">${buildHeaderCells(columns)}</tr></thead>
        <tbody>${buildRowsHtml(columns, rows, theme)}</tbody>
      </table>
      ${totalsCards.length ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(totalsCards.length, 3)},1fr);gap:10px;margin-top:18px;">${buildCardsHtml(totalsCards, theme)}</div>` : ""}
      <div style="text-align:center;margin-top:20px;padding-top:12px;border-top:1px solid ${theme.line};color:${theme.textDim};font-size:9.5px;">
        هذا الكشف تمت مراجعته من قِبل المختص<br>This statement has been reviewed by the specialist — Masarat Azal
      </div>
    </div>
  `;
  document.body.appendChild(container);

  try {
    const scale = 2;
    const canvas = await html2canvas(container, { scale, useCORS: true, backgroundColor: theme.bg });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: landscape ? "landscape" : "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(fileName);
    return pdf.output("blob");
  } finally {
    document.body.removeChild(container);
  }
}

/** نسخة "صورة" من نفس الكشف — بلا ترقيم صفحات، تُصدَّر كـPNG واحد. */
export async function generateStatementImage({ partyName, partyLabel, periodText, columns, rows, totalsCards, themeKey }) {
  const theme = STATEMENT_THEMES[themeKey] || STATEMENT_THEMES.light;
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.width = "820px";
  container.style.background = theme.bg;
  container.style.fontFamily = "'Noto Sans Arabic', Cairo, Tahoma, sans-serif";
  container.dir = "rtl";

  container.innerHTML = `
    ${buildHeaderBar(theme, partyName, partyLabel, periodText || "")}
    ${buildBanner(theme)}
    <div style="padding:38px 20px 20px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead><tr style="background:${theme.head};color:#fff;">${buildHeaderCells(columns)}</tr></thead>
        <tbody>${buildRowsHtml(columns, rows, theme)}</tbody>
      </table>
      ${totalsCards.length ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(totalsCards.length, 3)},1fr);gap:10px;margin-top:14px;">${buildCardsHtml(totalsCards, theme)}</div>` : ""}
    </div>
  `;
  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: theme.bg });
    const link = document.createElement("a");
    link.download = `كشف-${partyName}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } finally {
    document.body.removeChild(container);
  }
}
