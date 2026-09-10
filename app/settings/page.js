"use client";
import React, { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import Crumb from "../../components/Crumb";
import { api } from "../../lib/api";
import { useTheme } from "../../lib/ThemeProvider";

export default function SettingsPage() {
  const { mode, toggle } = useTheme();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .settings()
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "الإعدادات (عرض فقط)" }]} />
      <div className="page-pad">
        <div className="wizrow">
          <h4>الثيم</h4>
          <div className="tabs2">
            <div className={`tab2${mode === "dark" ? " on" : ""}`} onClick={() => mode !== "dark" && toggle()}>
              🌙 داكن
            </div>
            <div className={`tab2${mode === "light" ? " on" : ""}`} onClick={() => mode !== "light" && toggle()}>
              ☀️ فاتح
            </div>
          </div>
        </div>

        {err && <div className="error-state">تعذر تحميل الإعدادات: {err}</div>}
        {!err && !data && <div className="loading">⏳ جاري التحميل...</div>}

        {data && (
          <>
            <div className="wizrow">
              <h4>الأصناف</h4>
              <div className="chiplist">
                {data.products.length === 0 && <span style={{ color: "var(--textDim)", fontSize: 12 }}>لا أصناف مسجّلة.</span>}
                {data.products.map((p) => (
                  <span className="chip on" key={p}>
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="wizrow">
              <h4>المواقع والأسعار</h4>
              {data.locations.length === 0 && <div style={{ color: "var(--textDim)", fontSize: 12 }}>لا مواقع مسجّلة.</div>}
              {data.locations.map((l, i) => (
                <div className="oprow" key={i}>
                  <span>{l.location}</span>
                  <span>{l.price}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
