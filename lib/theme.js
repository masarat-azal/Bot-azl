export const THEMES = {
  dark: {
    bg: "#05130F",
    bgGradient: "linear-gradient(180deg, #05130F 0%, #0B241C 60%, #0F2E24 100%)",
    panel: "#0F2E24",
    panel2: "#123527",
    text: "#F4F1E8",
    textDim: "#AFC3BE",
    line: "rgba(212,167,44,0.18)",
    lineStrong: "rgba(212,167,44,0.35)",
    green: "#174A3A",
    greenDeep: "#063C32",
    greenTeal: "#087F70",
    greenDk: "#05130F",
    greenMid: "#123527",
    gold: "#D4A72C",
    goldLt: "#E7C15A",
    goldGlow: "rgba(212,167,44,0.35)",
    silver: "#D9DEE1",
    charcoal: "#263238",
    grey: "#68747A",
    red: "#C0564F",
    band: "#123527",
    positive: "#3EAE7E",
    shadow: "0 8px 24px rgba(0,0,0,0.45)",
    shadowSoft: "0 4px 14px rgba(0,0,0,0.3)",
  },
  light: {
    bg: "#F7F5EF",
    bgGradient: "linear-gradient(180deg, #FBFAF6 0%, #F4F1E8 100%)",
    panel: "#FFFFFF",
    panel2: "#FBFAF6",
    text: "#1B2E29",
    textDim: "#5B6D67",
    line: "#E7E2D3",
    lineStrong: "#D9DEE1",
    green: "#174A3A",
    greenDeep: "#063C32",
    greenTeal: "#087F70",
    greenDk: "#0B3B35",
    greenMid: "#124A42",
    gold: "#D4A72C",
    goldLt: "#E7C15A",
    goldGlow: "rgba(212,167,44,0.22)",
    silver: "#D9DEE1",
    charcoal: "#263238",
    grey: "#68747A",
    red: "#B94A48",
    band: "#F3F5F6",
    positive: "#3EAE7E",
    shadow: "0 6px 18px rgba(23,74,58,0.10)",
    shadowSoft: "0 3px 10px rgba(23,74,58,0.06)",
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
