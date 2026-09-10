"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { THEMES } from "./theme";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("dark");

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("masarat_theme");
    if (saved === "light" || saved === "dark") setMode(saved);
  }, []);

  function toggle() {
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("masarat_theme", next);
      } catch (e) {}
      return next;
    });
  }

  const tokens = THEMES[mode];
  const cssVars = {};
  Object.entries(tokens).forEach(([k, v]) => {
    cssVars[`--${k}`] = v;
  });

  return (
    <ThemeCtx.Provider value={{ mode, toggle, tokens }}>
      <div data-theme={mode} style={{ ...cssVars, minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme يجب استخدامه داخل ThemeProvider");
  return ctx;
}
