import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { STATEMENT_THEMES } from "./theme";

const LOGO_SVG = `<svg viewBox="0 0 100 100" width="100%" height="100%">
  <circle cx="50" cy="50" r="48" fill="#0B3B35" stroke="#D4A72C" stroke-width="2.5"/>
  <path d="M28 32 Q38 55 50 68" stroke="#D4A72C" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M50 26 Q50 48 50 68" stroke="#E2B83D" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M72 32 Q62 55 50 68" stroke="#D4A72C" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="50" cy="71" r="4.5" fill="#E2B83D"/>
</svg>`;

const LOGO_SVG_OUTLINE = LOGO_SVG.replace('fill="#0B3B35"', 'fill="none"');

const ICONS = {
  paid: `<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>`,
  due: `<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>`,
  qty: `<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;"><path d="M6 4h12l1 4-1 12H6L5 8z"/><path d="M5 8h14"/></svg>`,
  notes: `<svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;fill:none;stroke-width:2;"><path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6"/></svg>`,
};

function buildHeaderCells(columns) {
  return columns.map((c) => `<th style="padding:9px 6px;">${c.ar}</th>`).join("");
}

function buildRowsHtml(columns, rows) {
  return rows
    .map((r, i) => {
      const cells = columns
        .map((c) => {
          if (c.key === "__doc__") return `<td style="padding:8px 6px;">${r.docUrl ? "👁️" : "—"}</td>`;
          return `<td style="padding:8px 6px;">${r[c.key] ?? "—"}</td>`;
        })
        .join("");
      return `<tr style="background:${i % 2 === 0 ? "#ffffff" : "#F3F5F1"};">${cells}</tr>`;
    })
    .join("");
}

function buildCardsHtml(totalsCards, theme) {
  return totalsCards
    .map(
      (c) => `<div style="background:${c.highlight ? theme.accent : "#F3F5F1"};border-radius:14px;padding:12px 8px;text-align:center;">
      <div style="width:30px;height:30px;border-radius:50%;background:${c.highlight ? "rgba(255,255,255,.3)" : "#fff"};display:flex;align-items:center;justify-content:center;margin:0 auto 6px;">${ICONS[c.icon] || ""}</div>
      <div style="font-size:9px;color:${c.highlight ? "#fff" : "#5B6D67"};">${c.label}</div>
      <div style="font-size:13px;font-weight:800;margin-top:4px;color:${c.highlight ? "#fff" : "#1B2E29"};">${c.value}</div>
    </div>`
    )
    .join("");
}

/**
 * يبني كشف PDF بتصميم موحّد (ترويسة + شعار + علامة مائية + بطاقات إجمالي بأيقونات صحيحة).
 * columns: [{key, ar}]   rows: [{...}]   totalsCards: [{icon, label, value, highlight}]
 */
export async function generateStatementPDF({ fileName, partyName, partyLabel, periodText, titleText, columns, rows, totalsCards, landscape, themeKey }) {
  const theme = STATEMENT_THEMES[themeKey] || STATEMENT_THEMES["1"];
  const pageWidthPx = landscape ? 1180 : 820;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = pageWidthPx + "px";
  container.style.background = "#ffffff";
  container.style.fontFamily = "Cairo, Tahoma, sans-serif";
  container.dir = "rtl";

  container.innerHTML = `
    <div style="background:linear-gradient(135deg, ${theme.head}, #0A2A25);padding:20px 28px;display:flex;justify-content:space-between;align-items:flex-start;color:#fff;">
      <div style="text-align:left;font-size:11px;color:#CFE3DC;line-height:1.9;">
        تاريخ الإصدار / Issued: ${new Date().toLocaleDateString("en-GB")}<br>
        الفترة / Period: ${periodText}<br>
        ${partyLabel}: ${partyName}
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div><div style="font-weight:800;font-size:19px;">مسارات أزل</div><div style="font-size:11px;color:#DDEDE6;">Masarat Azal</div></div>
        <div style="width:52px;height:52px;">${LOGO_SVG}</div>
      </div>
    </div>
    <div style="padding:22px 26px;position:relative;">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.06;pointer-events:none;">
        <div style="width:240px;height:240px;">${LOGO_SVG_OUTLINE}</div>
      </div>
      <div style="position:relative;">
        <div style="background:#F3F5F1;border-right:5px solid ${theme.accent};border-radius:10px;padding:9px 16px;font-weight:800;font-size:14px;color:${theme.head};margin-bottom:16px;">${titleText}</div>
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <thead><tr style="background:${theme.head};color:#fff;font-weight:700;">${buildHeaderCells(columns)}</tr></thead>
          <tbody>${buildRowsHtml(columns, rows)}</tbody>
        </table>
        ${totalsCards.length ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(totalsCards.length, 4)},1fr);gap:10px;margin-top:18px;">${buildCardsHtml(totalsCards, theme)}</div>` : ""}
        <div style="text-align:center;margin-top:20px;padding-top:12px;border-top:1px solid #eee;color:#8a9490;font-size:9.5px;">
          هذا الكشف تمت مراجعته من قِبل المختص<br>This statement has been reviewed by the specialist — Masarat Azal
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  try {
    const scale = 2;
    const canvas = await html2canvas(container, { scale, useCORS: true, backgroundColor: "#ffffff" });
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
export async function generateStatementImage({ partyName, columns, rows, totalsCards, themeKey }) {
  const theme = STATEMENT_THEMES[themeKey] || STATEMENT_THEMES["1"];
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.width = "820px";
  container.style.background = "#ffffff";
  container.style.fontFamily = "Cairo, Tahoma, sans-serif";
  container.dir = "rtl";

  container.innerHTML = `
    <div style="background:${theme.head};padding:16px 20px;color:#fff;font-weight:800;font-size:15px;display:flex;align-items:center;gap:10px;">
      <div style="width:30px;height:30px;">${LOGO_SVG}</div> مسارات أزل — ${partyName}
    </div>
    <div style="padding:16px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead><tr style="background:${theme.head};color:#fff;">${buildHeaderCells(columns)}</tr></thead>
        <tbody>${buildRowsHtml(columns, rows)}</tbody>
      </table>
      ${totalsCards.length ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(totalsCards.length, 4)},1fr);gap:10px;margin-top:14px;">${buildCardsHtml(totalsCards, theme)}</div>` : ""}
    </div>
  `;
  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    link.download = `كشف-${partyName}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } finally {
    document.body.removeChild(container);
  }
}
