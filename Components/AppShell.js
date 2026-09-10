"use client";
import React from "react";
import Logo from "./Logo";
import { useTheme } from "../lib/ThemeProvider";

const TELEGRAM_BOT_URL = "https://t.me/masaratazal_acc_bot";

export default function AppShell({ children, showTopbar = true }) {
  const { toggle } = useTheme();

  return (
    <>
      <div className="deco-shape deco1" />
      <div className="deco-shape deco2" />
      <div className="deco-shape deco3" />

      <div className="app">
        {showTopbar && (
          <div className="topbar">
            <div className="brand">
              <Logo size={42} />
              <div className="name">
                مسارات أزل<span>Masarat Azal</span>
              </div>
            </div>
            <button className="themebtn" onClick={toggle}>
              🌓 الثيم
            </button>
          </div>
        )}

        {children}
      </div>

      <a className="fab" href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer" aria-label="فتح بوت تليجرام">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
          <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
        </svg>
      </a>
    </>
  );
}
