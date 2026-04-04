export default function AlertsPanel({ alerts }) {
  if (alerts.length === 0) {
    return (
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, padding: "16px 20px" }}>
        <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Live Alerts</div>
        <div style={{ fontSize: 11, color: "#bbb" }}>No active alerts</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Live Alerts</div>
        <div style={{ fontSize: 9, color: "#999" }}>{alerts.length} active</div>
      </div>
      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        {alerts.map((tx, i) => (
          <div key={tx.id + i} className={i === 0 ? "animate-slide-in" : ""} style={{
            padding: "8px 16px", borderBottom: "1px solid #1a1a1a",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: tx.decision === "BLOCK" ? "rgba(239,68,68,0.03)" : "rgba(234,179,8,0.03)",
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, fontFamily: "'SF Mono', monospace", color: "#ccc" }}>{tx.id}</div>
              <div style={{ fontSize: 9, color: "#999", marginTop: 1 }}>${tx.amount.toFixed(2)} · {tx.merchant} · {tx.time}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 2, letterSpacing: 0.5,
                color: tx.decision === "BLOCK" ? "#ef4444" : "#fbbf24",
                background: tx.decision === "BLOCK" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
                border: `1px solid ${tx.decision === "BLOCK" ? "rgba(239,68,68,0.2)" : "rgba(234,179,8,0.2)"}`,
              }}>
                {tx.decision}
              </span>
              {i === 0 && (
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: tx.decision === "BLOCK" ? "#ef4444" : "#fbbf24",
                  animation: "pulse 1s ease-in-out infinite",
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
