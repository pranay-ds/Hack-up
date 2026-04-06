import { useState } from "react";

export default function MFAReviewSection({ mfaTransactions, overrideDecision, markAsFraud, markAsLegitimate }) {
  const [selectedTx, setSelectedTx] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handleAction = (id, action) => {
    if (action === "approve") { overrideDecision(id, "APPROVE"); showFeedback(`${id} approved`); }
    else if (action === "block") { overrideDecision(id, "BLOCK"); showFeedback(`${id} blocked`); }
    else if (action === "fraud") { markAsFraud(id); showFeedback(`${id} flagged as fraud`); }
    else if (action === "legit") { markAsLegitimate(id); showFeedback(`${id} marked as legitimate`); }
    setSelectedTx(null);
  };

  if (mfaTransactions.length === 0) return null;

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>MFA Review Queue</div>
          <div style={{ fontSize: 9, color: "#555", marginTop: 1 }}>Transactions requiring manual review</div>
        </div>
        <div style={{ fontSize: 11, color: "#fbbf24", fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>{mfaTransactions.length} pending</div>
      </div>

      {actionFeedback && (
        <div style={{ padding: "6px 16px", background: "rgba(74,222,128,0.06)", borderBottom: "1px solid #1a1a1a", fontSize: 10, color: "#4ade80", animation: "slideIn 0.2s" }}>
          ✓ {actionFeedback}
        </div>
      )}

      {selectedTx && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", background: "rgba(234,179,8,0.03)", animation: "slideIn 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24", marginBottom: 2 }}>MFA Review: {selectedTx.id}</div>
              <div style={{ display: "flex", gap: 10, fontSize: 9, color: "#555" }}>
                <span>{selectedTx.user_id}</span><span>${selectedTx.amount.toFixed(2)}</span><span>{selectedTx.device}</span><span>{selectedTx.merchant}</span><span>{selectedTx.time}</span>
              </div>
            </div>
            <button onClick={() => setSelectedTx(null)} style={{ background: "none", border: "1px solid #1a1a1a", borderRadius: 3, color: "#555", cursor: "pointer", padding: "2px 6px", fontSize: 9 }}>Close</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 3, padding: "6px 10px" }}>
              <div style={{ fontSize: 8, color: "#444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Risk Score</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: selectedTx.risk_score > 0.65 ? "#ef4444" : "#fbbf24" }}>{selectedTx.risk_score.toFixed(2)}</div>
            </div>
            <div style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 3, padding: "6px 10px" }}>
              <div style={{ fontSize: 8, color: "#444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Reasons</div>
              {selectedTx.reasons.length > 0 ? selectedTx.reasons.map((r, i) => <div key={i} style={{ fontSize: 8, color: "#fbbf24" }}>&#8226; {r}</div>) : <div style={{ fontSize: 8, color: "#555" }}>None</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => handleAction(selectedTx.id, "approve")} style={{ padding: "4px 14px", fontSize: 10, fontWeight: 600, background: "rgba(74,222,128,0.08)", border: "1px solid #4ade8033", borderRadius: 3, color: "#4ade80", cursor: "pointer" }}>✓ Approve</button>
            <button onClick={() => handleAction(selectedTx.id, "block")} style={{ padding: "4px 14px", fontSize: 10, fontWeight: 600, background: "rgba(239,68,68,0.08)", border: "1px solid #ef444433", borderRadius: 3, color: "#ef4444", cursor: "pointer" }}>✕ Block</button>
            <button onClick={() => handleAction(selectedTx.id, "fraud")} style={{ padding: "4px 14px", fontSize: 10, fontWeight: 600, background: "rgba(239,68,68,0.12)", border: "1px solid #ef444433", borderRadius: 3, color: "#ef4444", cursor: "pointer" }}>⚑ Flag Fraud</button>
            <button onClick={() => handleAction(selectedTx.id, "legit")} style={{ padding: "4px 14px", fontSize: 10, fontWeight: 600, background: "rgba(74,222,128,0.12)", border: "1px solid #4ade8033", borderRadius: 3, color: "#4ade80", cursor: "pointer" }}>✓ Mark Legit</button>
          </div>
        </div>
      )}

      <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4, maxHeight: 300, overflowY: "auto" }}>
        {mfaTransactions.map(tx => (
          <div key={tx.id} style={{
            background: selectedTx?.id === tx.id ? "rgba(234,179,8,0.04)" : "#0a0a0a",
            border: `1px solid ${selectedTx?.id === tx.id ? "rgba(234,179,8,0.2)" : "#1a1a1a"}`,
            borderRadius: 4, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
            cursor: "pointer", transition: "all 0.15s",
          }} onClick={() => setSelectedTx(tx)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>?</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, fontFamily: "'SF Mono', monospace", color: "#fbbf24", marginBottom: 1 }}>{tx.id}</div>
                <div style={{ fontSize: 8, color: "#555" }}>${tx.amount.toFixed(2)} · {tx.user_id} · {tx.merchant}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: tx.risk_score > 0.65 ? "#ef4444" : "#fbbf24" }}>{tx.risk_score.toFixed(2)}</span>
              <span style={{ fontSize: 9, color: "#555" }}>▶</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
