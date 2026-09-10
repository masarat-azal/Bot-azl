import Link from "next/link";

export default function Crumb({ trail }) {
  // trail: [{label, href?}] — آخر عنصر بلا href يُعرض كنص حالي
  return (
    <div className="crumbbar">
      {trail.map((t, i) => (
        <span key={i}>
          {t.href ? (
            <Link href={t.href} style={{ background: "none", border: "none", color: "var(--gold)", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
              {t.label}
            </Link>
          ) : (
            <span>{t.label}</span>
          )}
          {i < trail.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
}
