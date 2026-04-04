import { useState, useMemo } from "react";

const ITEMS_PER_PAGE = 10;

export default function MFAReviewPage({ mfaTransactions, overrideDecision, markAsFraud, markAsLegitimate }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedTx, setSelectedTx] = useState(null);
  const [filterRisk, setFilterRisk] = useState("all");
  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const filtered = useMemo(() => {
    let list = mfaTransactions;
    if (filterRisk === "high") list = list.filter(t => t.risk_score > 0.65);
    else if (filterRisk === "medium") list = list.filter(t => t.risk_score <= 0.65);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.id.toLowerCase().includes(q) || t.user_id.toLowerCase().includes(q) || t.merchant.toLowerCase().includes(q));
    }
    return list;
  }, [mfaTransactions, search, filterRisk]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleAction = (id, action) => {
    if (action === "approve") { overrideDecision(id, "APPROVE"); showFeedback(`${id} approved`); }
    else if (action === "block") { overrideDecision(id, "BLOCK"); showFeedback(`${id} blocked`); }
    else if (action === "fraud") { markAsFraud(id); showFeedback(`${id} flagged as fraud`); }
    else if (action === "legit") { markAsLegitimate(id); showFeedback(`${id} marked as legitimate`); }
    setSelectedTx(prev => prev && prev.id === id ? null : prev);
    setPage(0);
  };

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      {actionFeedback && (
        <div style={{ padding: "6px 12px", background: "#111", border: "1px solid #4ade80", borderRadius: 3, fontSize: 11, color: "#4ade80", animation: "slideIn 0.2s ease-out" }}>
          ✓ {actionFeedback}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e5e5" }}>MFA Review Queue</div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Transactions flagged for manual review</div>
        </div>
        <div style={{ fontSize: 11, color: "#fbbf24", fontFamily: "'SF Mono', monospace" }}>{mfaTransactions.length} pending</div>
      </div>

      {selectedTx && (
        <div style={{ background: "#111", border: "1px solid #fbbf24", borderRadius: 4, padding: "12px 16px", animation: "slideIn 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fbbf24", marginBottom: 3 }}>MFA Review: {selectedTx.id}</div>
              <div style={{ display: "flex", gap: 12, fontSize: 9, color: "#888" }}>
                <span>{selectedTx.user_id}</span><span>${selectedTx.amount.toFixed(2)}</span><span>{selectedTx.device}</span><span>{selectedTx.location}</span><span>{selectedTx.merchant}</span><span>{selectedTx.time}</span>
              </div>
            </div>
            <button onClick={() => setSelectedTx(null)} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, color: "#888", cursor: "pointer", padding: "2px 6px", fontSize: 9 }}>Close</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, padding: "8px 12px" }}>
              <div style={{ fontSize: 8, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Risk Score</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: selectedTx.risk_score > 0.65 ? "#ef4444" : "#fbbf24" }}>{selectedTx.risk_score.toFixed(2)}</div>
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, padding: "8px 12px" }}>
              <div style={{ fontSize: 8, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Decision</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>MFA - Pending Review</div>
            </div>
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, padding: "8px 12px" }}>
              <div style={{ fontSize: 8, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Reasons</div>
              {selectedTx.reasons.length > 0 ? selectedTx.reasons.map((r, i) => <div key={i} style={{ fontSize: 9, color: "#fbbf24" }}>&#8226; {r}</div>) : <div style={{ fontSize: 9, color: "#666" }}>No specific reasons</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => handleAction(selectedTx.id, "approve")} style={{ padding: "5px 16px", fontSize: 10, fontWeight: 600, background: "rgba(74,222,128,0.06)", border: "1px solid #4ade8033", borderRadius: 3, color: "#4ade80", cursor: "pointer" }}>✓ Approve</button>
            <button onClick={() => handleAction(selectedTx.id, "block")} style={{ padding: "5px 16px", fontSize: 10, fontWeight: 600, background: "rgba(239,68,68,0.06)", border: "1px solid #ef444433", borderRadius: 3, color: "#ef4444", cursor: "pointer" }}>✕ Block</button>
            <button onClick={() => handleAction(selectedTx.id, "fraud")} style={{ padding: "5px 16px", fontSize: 10, fontWeight: 600, background: "rgba(239,68,68,0.12)", border: "1px solid #ef444433", borderRadius: 3, color: "#ef4444", cursor: "pointer" }}>⚑ Flag Fraud</button>
            <button onClick={() => handleAction(selectedTx.id, "legit")} style={{ padding: "5px 16px", fontSize: 10, fontWeight: 600, background: "rgba(74,222,128,0.12)", border: "1px solid #4ade8033", borderRadius: 3, color: "#4ade80", cursor: "pointer" }}>✓ Mark Legit</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ flex: "1 1 200px", padding: "5px 10px", fontSize: 11, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, color: "#e5e5e5", outline: "none" }} />
        {[["all","All Risk"],["high","High Risk"],["medium","Medium Risk"]].map(([k,l]) => (
          <button key={k} onClick={() => { setFilterRisk(k); setPage(0); }} style={{ padding: "4px 10px", fontSize: 10, fontWeight: 500, background: filterRisk === k ? "#1a1a1a" : "transparent", color: filterRisk === k ? "#e5e5e5" : "#666", border: "1px solid #1a1a1a", borderRadius: 3, cursor: "pointer" }}>{l}</button>
        ))}
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #1a1a1a", borderRadius: 4 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              {["ID","User","Amount","Merchant","Device","Time","Risk","Reasons","Actions"].map(h => (
                <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontWeight: 500, color: "#666", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(tx => (
              <tr key={tx.id} style={{ borderBottom: "1px solid #1a1a1a", background: selectedTx?.id === tx.id ? "rgba(234,179,8,0.03)" : "transparent" }}>
                <td style={{ padding: "6px 10px", fontFamily: "'SF Mono', monospace", fontSize: 10, color: "#ccc", cursor: "pointer" }} onClick={() => setSelectedTx(tx)}>{tx.id}</td>
                <td style={{ padding: "6px 10px", fontFamily: "'SF Mono', monospace", fontSize: 10, color: "#666" }}>{tx.user_id}</td>
                <td style={{ padding: "6px 10px", fontFamily: "'SF Mono', monospace", color: "#e5e5e5" }}>${tx.amount.toFixed(2)}</td>
                <td style={{ padding: "6px 10px", color: "#666", fontSize: 10 }}>{tx.merchant}</td>
                <td style={{ padding: "6px 10px", color: "#666", fontSize: 10 }}>{tx.device}</td>
                <td style={{ padding: "6px 10px", color: "#666", fontSize: 9 }}>{tx.time}</td>
                <td style={{ padding: "6px 10px" }}><span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: tx.risk_score > 0.65 ? "#ef4444" : "#fbbf24" }}>{tx.risk_score.toFixed(2)}</span></td>
                <td style={{ padding: "6px 10px", maxWidth: 180 }}><div style={{ fontSize: 9, color: "#666" }}>{tx.reasons.length > 0 ? tx.reasons.slice(0, 2).join("; ") : "—"}</div></td>
                <td style={{ padding: "6px 10px" }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    <button onClick={() => handleAction(tx.id, "approve")} style={{ padding: "2px 6px", fontSize: 9, background: "transparent", border: "1px solid #4ade8033", borderRadius: 2, color: "#4ade80", cursor: "pointer" }}>Approve</button>
                    <button onClick={() => handleAction(tx.id, "block")} style={{ padding: "2px 6px", fontSize: 9, background: "transparent", border: "1px solid #ef444433", borderRadius: 2, color: "#ef4444", cursor: "pointer" }}>Block</button>
                    <button onClick={() => setSelectedTx(tx)} style={{ padding: "2px 6px", fontSize: 9, background: "transparent", border: "1px solid #60a5fa33", borderRadius: 2, color: "#60a5fa", cursor: "pointer" }}>Details</button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && <tr><td colSpan={9} style={{ padding: "24px 12px", textAlign: "center", color: "#999", fontSize: 11 }}>No MFA transactions match your filters.</td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}>
          <span style={{ color: "#999" }}>Page {page + 1} of {totalPages}</span>
          <div style={{ display: "flex", gap: 4 }}>
             <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: "3px 8px", fontSize: 10, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, color: page === 0 ? "#666" : "#ccc", cursor: page === 0 ? "default" : "pointer" }}>Prev</button>
             <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding: "3px 8px", fontSize: 10, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, color: page >= totalPages - 1 ? "#666" : "#ccc", cursor: page >= totalPages - 1 ? "default" : "pointer" }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
