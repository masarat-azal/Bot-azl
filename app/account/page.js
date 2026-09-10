"use client";
import React from "react";
import AppShell from "../../components/AppShell";
import Crumb from "../../components/Crumb";

export default function AccountPage() {
  return (
    <AppShell>
      <Crumb trail={[{ label: "← الرئيسية", href: "/" }, { label: "الحساب" }]} />
      <div className="page-pad">
        <div className="wizrow">
          <h4>البريد الإلكتروني</h4>
          <div style={{ fontSize: 13 }}>samih@masaratazal.sa</div>
        </div>
        <div className="wizrow">
          <h4>تسجيل الخروج</h4>
          <button className="bigbtn dangerbtn" style={{ marginTop: 0 }}>
            تسجيل الخروج
          </button>
        </div>
      </div>
    </AppShell>
  );
}
