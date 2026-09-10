const BASE = process.env.NEXT_PUBLIC_API_BASE;
const KEY = process.env.NEXT_PUBLIC_API_KEY;

async function call(action, params = {}) {
  if (!BASE) throw new Error("NEXT_PUBLIC_API_BASE غير مضبوط");
  const qs = new URLSearchParams({ action, key: KEY || "", ...params });
  const res = await fetch(`${BASE}?${qs.toString()}`, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
  return json.data;
}

export const api = {
  ping: () => call("ping"),
  customers: () => call("customers"),
  suppliers: () => call("suppliers"),
  warehouses: () => call("warehouses"),
  party: (name) => call("party", { name }),
  warehouse: (name) => call("warehouse", { name }),
  sales: () => call("sales"),
  purchases: () => call("purchases"),
  daily: (limit = 10) => call("daily", { limit }),
  settings: () => call("settings"),
  archive: (kind, party) => call("archive", { kind: kind || "", party: party || "" }),
};
