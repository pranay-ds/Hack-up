export default function TransactionDetail({ tx, onClose, onOverride, onMarkFraud, onMarkLegit, isAdmin }) {
  const featureImportance = [
    { feature: "Transaction Amount", importance: tx.amount > 5000 ? 0.35 : 0.12 },
    { feature: "Risk Score", importance: tx.risk_score * 0.3 },
    { feature: "Device Anomaly", importance: tx.device === "API" ? 0.2 : 0.05 },
    { feature: "Location Risk", importance: ["IN", "BR", "NG"].includes(tx.location) ? 0.18 : 0.04 },
    { feature: "Merchant Category", importance: ["Crypto", "Wire Transfer", "Jewelry"].includes(tx.merchant) ? 0.22 : 0.06 },
    { feature: "Time of Day", importance: 0.08 },
  ].sort((a, b) => b.importance - a.importance);

  const explanation = tx.decision === "BLOCK"
    ? `Transaction flagged due to ${tx.risk_score > 0.7 ? "high risk score" : "anomalous behavior"} combined with ${tx.amount > 5000 ? "unusually high amount" : "suspicious pattern"}.`
    : tx.decision === "MFA"
      ? `Moderate risk detected. Additional verification recommended due to ${tx.reasons[0]?.toLowerCase() || "unusual activity pattern"}.`
      : `Transaction appears legitimate. No significant risk factors detected.`;

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, animation: "slideIn 0.2s ease-out" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e5e5e5", marginBottom: 3 }}>{tx.id}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#888" }}>
            <span>{tx.user_id}</span><span>${tx.amount.toFixed(2)}</span><span>{tx.device}</span><span>{tx.location}</span><span>{tx.merchant}</span><span>{tx.time}</span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, color: "#888", cursor: "pointer", padding: "2px 8px", fontSize: 10 }}>Close</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        <div style={{ padding: "12px 16px", borderRight: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Risk Score</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: tx.risk_score > 0.7 ? "#ef4444" : tx.risk_score > 0.45 ? "#fbbf24" : "#4ade80" }}>
            {tx.risk_score.toFixed(2)}
          </div>
          <div style={{ marginTop: 4, width: "100%", height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${tx.risk_score * 100}%`, height: "100%", background: tx.risk_score > 0.7 ? "#ef4444" : tx.risk_score > 0.45 ? "#fbbf24" : "#4ade80", transition: "width 0.3s" }} />
          </div>
        </div>
        <div style={{ padding: "12px 16px", borderRight: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Decision</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: tx.decision === "BLOCK" ? "#ef4444" : tx.decision === "MFA" ? "#fbbf24" : "#4ade80" }}>{tx.decision}</div>
          {tx.user_override && <div style={{ fontSize: 9, color: "#60a5fa", marginTop: 3 }}>Overridden by analyst</div>}
          {tx.marked_fraud && <div style={{ fontSize: 9, color: "#ef4444", marginTop: 3 }}>Marked as fraud</div>}
          {tx.marked_legit && <div style={{ fontSize: 9, color: "#4ade80", marginTop: 3 }}>Marked as legitimate</div>}
        </div>
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Explanation</div>
          <div style={{ fontSize: 10, color: "#666", lineHeight: 1.5 }}>{explanation}</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1a1a1a", padding: "12px 16px" }}>
        <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Feature Importance</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {featureImportance.map(f => (
            <div key={f.feature} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#666", width: 120, flexShrink: 0 }}>{f.feature}</span>
              <div style={{ flex: 1, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(f.importance * 200, 100)}%`, height: "100%", background: f.importance > 0.2 ? "#ef4444" : f.importance > 0.1 ? "#fbbf24" : "#4ade80", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 9, fontFamily: "'SF Mono', monospace", color: "#666", width: 30, textAlign: "right" }}>{(f.importance * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1a1a1a", padding: "12px 16px" }}>
        <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Full Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 16px" }}>
          {[["Transaction ID", tx.id], ["User", tx.user_id], ["Amount", `$${tx.amount.toFixed(2)}`],
            ["Currency", tx.currency], ["Device", tx.device], ["Location", tx.location],
            ["Merchant", tx.merchant], ["Timestamp", tx.timestamp], ["Risk Score", tx.risk_score.toFixed(4)],
            ["Decision", tx.decision], ["Override", tx.user_override || "None"], ["Marked Fraud", tx.marked_fraud ? "Yes" : "No"],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 8, color: "#bbb", textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
              <div style={{ fontSize: 10, color: "#aaa", fontFamily: l.includes("ID") || l.includes("Score") ? "'SF Mono', monospace" : "inherit" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div style={{ borderTop: "1px solid #1a1a1a", padding: "12px 16px" }}>
          <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Analyst Actions</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[["APPROVE", "#4ade80"], ["MFA", "#fbbf24"], ["BLOCK", "#ef4444"]].map(([d, c]) => (
              <button key={d} onClick={() => onOverride(tx.id, d)} style={{ padding: "4px 12px", fontSize: 10, background: "transparent", border: `1px solid ${c}33`, borderRadius: 3, color: c, cursor: "pointer" }}>Override: {d}</button>
            ))}
            <button onClick={() => onMarkFraud(tx.id)} style={{ padding: "4px 12px", fontSize: 10, background: "rgba(239,68,68,0.06)", border: "1px solid #ef444433", borderRadius: 3, color: "#ef4444", cursor: "pointer" }}>Flag Fraud</button>
            <button onClick={() => onMarkLegit(tx.id)} style={{ padding: "4px 12px", fontSize: 10, background: "rgba(74,222,128,0.06)", border: "1px solid #4ade8033", borderRadius: 3, color: "#4ade80", cursor: "pointer" }}>Mark Legit</button>
          </div>
        </div>
      )}
    </div>
  );
}
