"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";
import Logo from "../components/Logo";
import PartyPickerModal from "../components/PartyPickerModal";
import OpsList from "../components/OpsList";
import { api } from "../lib/api";

const SERVICES = [
  { key: "sales", label: "المبيعات", icon: "📈", href: "/sales" },
  { key: "purchases", label: "المشتريات", icon: "📉", href: "/purchases" },
  { key: "customers", label: "العملاء", icon: "👥", picker: "customer" },
  { key: "suppliers", label: "الموردون", icon: "🚚", picker: "supplier" },
  { key: "warehouses", label: "المخزون", icon: "📦", picker: "warehouse" },
  { key: "daily", label: "عمليات اليوم", icon: "🗓️", href: "/daily" },
  { key: "backup", label: "نسخة احتياطية", icon: "☁️", href: "/backup" },
  { key: "builder", label: "صناعة الكشوف", icon: "🧩", href: "/builder" },
  { key: "archive", label: "الأرشيف", icon: "🗂", href: "/archive" },
  { key: "settings", label: "الإعدادات", icon: "⚙️", href: "/settings" },
  { key: "account", label: "الحساب", icon: "👤", href: "/account" },
];

export default function HomePage() {
  const [picker, setPicker] = useState(null);
  const [pickerItems, setPickerItems] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [daily, setDaily] = useState(null);
  const [dailyErr, setDailyErr] = useState("");

  useEffect(() => {
    api
      .daily(10)
      .then(setDaily)
      .catch((e) => setDailyErr(e.message));
  }, []);

  async function openPicker(kind) {
    setPicker(kind);
    setPickerLoading(true);
    try {
      const fn = kind === "customer" ? api.customers : kind === "supplier" ? api.suppliers : api.warehouses;
      const items = await fn();
      setPickerItems(items);
    } catch (e) {
      setPickerItems([]);
    } finally {
      setPickerLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="page-pad">
        <div className="hero">
          <img className="hero-banner-img" src="/images/banner-truck.jpg" alt="" />
          <div className="hero-inner">
            <Logo size={54} />
            <div>
              <h1>أهلًا وسهلًا 👋</h1>
              <p>نظام إدارة أعمالك — بيانات حيّة من جوجل شيت</p>
            </div>
          </div>
        </div>

        <div className="search">
          <span className="ic">🔍</span>
          <input placeholder="بحث سريع..." disabled />
        </div>

        <div className="sectitle">الخدمات</div>
        <div className="grid-services">
          {SERVICES.map((s) =>
            s.picker ? (
              <div className="svc" key={s.key} onClick={() => openPicker(s.picker)}>
                <div className="ico">{s.icon}</div>
                <span>{s.label}</span>
              </div>
            ) : (
              <Link href={s.href} key={s.key} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="svc">
                  <div className="ico">{s.icon}</div>
                  <span>{s.label}</span>
                </div>
              </Link>
            )
          )}
        </div>

        {dailyErr && <div className="error-state">تعذر تحميل عمليات اليوم: {dailyErr}</div>}
        {!dailyErr && (
          <OpsList
            title="آخر ١٠ أيام — كل الشركة"
            rows={
              daily
                ? daily.map((d) => ({
                    desc: d.desc || (d.kind === "sale" ? "بيع" : "شراء") + " — " + d.party,
                    date: d.date,
                    amount: d.amount,
                    positive: d.kind === "sale",
                  }))
                : []
            }
            emptyText={daily ? "لا توجد عمليات في آخر ١٠ أيام." : "⏳ جاري التحميل..."}
          />
        )}
      </div>

      <PartyPickerModal
        open={!!picker}
        onClose={() => setPicker(null)}
        title={picker === "customer" ? "اختر عميلًا" : picker === "supplier" ? "اختر موردًا" : "اختر مخزنًا"}
        items={pickerLoading ? [] : pickerItems}
        kind={picker}
      />
    </AppShell>
  );
}
