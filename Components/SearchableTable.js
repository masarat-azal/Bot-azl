"use client";
import React, { useMemo, useState } from "react";

/**
 * columns: [{key, label}]
 * rows: [{...}]
 * renderCell: optional (row, col) => node, for custom rendering (like doc links)
 */
export default function SearchableTable({ columns, rows, renderCell, title, headerAction }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(needle)));
  }, [q, rows, columns]);

  return (
    <div className="tablewrap">
      {(title || headerAction) && (
        <div className="tablehead">
          {title && <h3>{title}</h3>}
          {headerAction}
        </div>
      )}
      <div className="minisearch">
        <input placeholder="🔍 بحث في الجدول..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="scrolltable">
        {filtered.length === 0 ? (
          <div className="empty-state">لا توجد نتائج.</div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key}>{renderCell ? renderCell(r, c) ?? r[c.key] ?? "—" : r[c.key] ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
