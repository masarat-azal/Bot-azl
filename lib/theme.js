export const THEMES = {
  dark: {
    bg: "#0B3B35",
    panel: "#0F4A42",
    panel2: "#124A42",
    text: "#F4F1E8",
    textDim: "#AFC3BE",
    line: "rgba(255,255,255,0.12)",
    green: "#174A3A",
    greenDk: "#0B3B35",
    greenMid: "#124A42",
    gold: "#D4A72C",
    goldLt: "#E2B83D",
    red: "#B94A48",
    band: "#F3F5F6",
    positive: "#3EAE7E",
  },
  light: {
    bg: "#F4F1E8",
    panel: "#FFFFFF",
    panel2: "#FBFAF6",
    text: "#1B2E29",
    textDim: "#5B6D67",
    line: "#E7E2D3",
    green: "#174A3A",
    greenDk: "#0B3B35",
    greenMid: "#124A42",
    gold: "#D4A72C",
    goldLt: "#E2B83D",
    red: "#B94A48",
    band: "#F3F5F6",
    positive: "#3EAE7E",
  },
};

/** ٦ ثيمات خاصة بملفات الكشوفات فقط — منفصلة تمامًا عن ثيمي التطبيق. */
export const STATEMENT_THEMES = {
  "1": { label: "الأخضر الداكن + الذهبي", head: "#174A3A", accent: "#D4A72C", accentTxt: "#FFFFFF" },
  "2": { label: "الكحلي + الأزرق السماوي", head: "#0D2B4E", accent: "#2E9BD6", accentTxt: "#FFFFFF" },
  "3": { label: "الأسود + الذهبي", head: "#1A1A1A", accent: "#D4A72C", accentTxt: "#1A1A1A" },
  "4": { label: "البنفسجي + الأبيض", head: "#4B2E83", accent: "#FFFFFF", accentTxt: "#4B2E83" },
  "5": { label: "البيج + البني الداكن", head: "#5C4033", accent: "#C9A876", accentTxt: "#3A2A1E" },
  "6": { label: "الأخضر الزمردي", head: "#0F5F4A", accent: "#3FBFA0", accentTxt: "#FFFFFF" },
};

export function money(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " ريال";
}

export function moneyShort(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-GB");
}

/** يبني نص اتجاه الرصيد بصيغة واضحة لا لبس فيها — نفس صيغة البوت بالضبط. */
export function balanceDirection(isSupplier, balance) {
  if (Math.abs(balance) < 0.001) return { text: "لا يوجد رصيد مستحق", amount: 0, positive: true };
  if (isSupplier) {
    return balance > 0
      ? { text: "نحن مدينون للمورد بمبلغ", amount: balance, positive: false }
      : { text: "المورد مدين لنا بمبلغ", amount: -balance, positive: true };
  }
  return balance > 0
    ? { text: "العميل مدين لنا بمبلغ", amount: balance, positive: true }
    : { text: "نحن مدينون للعميل بمبلغ", amount: -balance, positive: false };
}
