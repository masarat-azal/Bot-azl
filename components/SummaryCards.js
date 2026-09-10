export default function SummaryCards({ items }) {
  // items: [{icon, label, value, wide}]
  return (
    <div className="sumgrid">
      {items.map((it, i) => (
        <div key={i} className={`sumcard${it.wide ? " wide" : ""}`}>
          {it.icon && <div className="ic">{it.icon}</div>}
          <div className="l">{it.label}</div>
          <div className="v">{it.value}</div>
        </div>
      ))}
    </div>
  );
}
