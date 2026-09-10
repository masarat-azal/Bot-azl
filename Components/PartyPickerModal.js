"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { moneyShort } from "../lib/theme";

/**
 * items: [{name, balance}]
 * kind: 'customer' | 'supplier' | 'warehouse' — يحدد الوجهة عند الاختيار
 */
export default function PartyPickerModal({ open, onClose, title, items, kind }) {
  const router = useRouter();
  if (!open) return null;

  function pick(name) {
    onClose();
    if (kind === "warehouse") router.push(`/warehouse/${encodeURIComponent(name)}`);
    else router.push(`/party/${kind}/${encodeURIComponent(name)}`);
  }

  return (
    <div className="pickmodal" onClick={onClose}>
      <div className="picksheet" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {(!items || items.length === 0) && <div className="empty-state">لا توجد عناصر بعد.</div>}
        {items &&
          items.map((it) => (
            <div key={it.name} className="pickitem" onClick={() => pick(it.name)}>
              <span>{it.name}</span>
              <span className="bal">{moneyShort(it.balance)}</span>
            </div>
          ))}
        <div className="closepick" onClick={onClose}>
          إلغاء
        </div>
      </div>
    </div>
  );
}
