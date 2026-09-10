export default function OpsList({ title, rows, emptyText = "لا توجد عمليات." }) {
  // rows: [{desc, date, amount, positive}]
  return (
    <div className="ops10">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <div className="empty-state">{emptyText}</div>
      ) : (
        rows.map((r, i) => (
          <div className="oprow" key={i}>
            <span>
              {r.desc}
              <br />
              <span className="l">{r.date}</span>
            </span>
            <span className={r.positive ? "amt-pos" : "amt-neg"}>
              {r.positive ? "+" : "-"}
              {Math.abs(r.amount).toLocaleString("en-US")}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
