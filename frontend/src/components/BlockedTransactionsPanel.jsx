import { useState, useMemo } from "react";

export default function BlockedTransactionsPanel({ transactions }) {
  const [expandedId, setExpandedId] = useState(null);

  const blockedTxns = useMemo(() => {
    return transactions
      .filter(t => t.decision === "BLOCK")
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 15);
  }, [transactions]);

  const totalBlocked = transactions.filter(t => t.decision === "BLOCK").length;
  const totalSaved = transactions.filter(t => t.decision === "BLOCK").reduce((s, t) => s + t.amount, 0);

  if (blockedTxns.length === 0) {
    return (
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, padding: "10px 16px" }}>
        <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 12 }}>Blocked Transactions</div>
        <div style={{ textAlign: "center", color: "#bbb", fontSize: 11, padding: 24 }}>No blocked transactions yet</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
          Blocked Transactions
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 9 }}>
          <span style={{ color: "#ef4444", fontWeight: 600 }}>{totalBlocked} blocked</span>
          <span style={{ color: "#4ade80", fontFamily: "'SF Mono', monospace" }}>${Math.round(totalSaved).toLocaleString()} saved</span>
        </div>
      </div>

      <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4, maxHeight: 500, overflowY: "auto" }}>
        {blockedTxns.map(tx => {
          const isExpanded = expandedId === tx.id;
          const reasons = tx.reasons && tx.reasons.length > 0
            ? tx.reasons
            : tx.risk_score > 0.8
              ? ["High risk score from ML model", "Amount exceeds normal pattern"]
              : ["Suspicious activity detected"];

          return (
            <div
              key={tx.id}
              onClick={() => setExpandedId(isExpanded ? null : tx.id)}
              style={{
                background: isExpanded ? "rgba(239,68,68,0.04)" : "#0f0f0f",
                border: `1px solid ${isExpanded ? "rgba(239,68,68,0.25)" : "#1a1a1a"}`,
                borderRadius: 4,
                padding: "8px 12px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, flexShrink: 0,
                  }}>
                    ✕
                  </span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, fontFamily: "'SF Mono', monospace", color: "#ef4444", marginBottom: 1 }}>
                      {tx.id}
                    </div>
                    <div style={{ fontSize: 9, color: "#777" }}>
                      ${tx.amount.toFixed(2)} · {tx.user_id} · {tx.merchant}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: "#ef4444" }}>
                    {tx.risk_score.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 10, color: "#999", transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                    ▶
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(239,68,68,0.1)", animation: "fadeIn 0.15s" }}>
                  <div style={{ fontSize: 8, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, fontWeight: 600 }}>
                    Reason for Blocking
                  </div>
                  {reasons.map((r, i) => (
                    <div key={i} style={{ fontSize: 10, color: "#ccc", marginBottom: 4, display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }}>•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 6, fontSize: 9, color: "#777", lineHeight: 1.5, background: "#0f0f0f", padding: "6px 8px", borderRadius: 3, border: "1px solid #1a1a1a" }}>
                    <span style={{ color: "#999" }}>Details:</span> {tx.device} device · {tx.location} · {tx.time}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
