import { useState, useMemo } from "react";
import TransactionDetail from "./TransactionDetail";

const ITEMS_PER_PAGE = 15;

export default function TransactionTable({ transactions, overrideDecision, markAsFraud, markAsLegitimate, session }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortCol, setSortCol] = useState("timestamp");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [selectedTx, setSelectedTx] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const isAdmin = session?.role === "admin";

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filter === "fraud") list = list.filter(t => t.decision === "BLOCK");
    else if (filter === "approve") list = list.filter(t => t.decision === "APPROVE");
    else if (filter === "high-risk") list = list.filter(t => t.risk_score > 0.7);
    else if (filter === "mfa") list = list.filter(t => t.decision === "MFA");

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) || t.user_id.toLowerCase().includes(q) ||
        t.merchant.toLowerCase().includes(q) || t.device.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === "amount" || sortCol === "risk_score") {
        va = Number(va); vb = Number(vb);
      } else {
        va = String(va).toLowerCase(); vb = String(vb).toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [transactions, filter, search, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
    setPage(0);
  };

  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handleOverride = (id, decision) => {
    overrideDecision(id, decision);
    setSelectedTx(prev => prev && prev.id === id ? { ...prev, decision, user_override: decision } : prev);
    showFeedback(`${id} → ${decision}`);
  };

  const handleMarkFraud = (id) => {
    markAsFraud(id);
    setSelectedTx(prev => prev && prev.id === id ? { ...prev, decision: "BLOCK", user_override: "BLOCK", marked_fraud: true } : prev);
    showFeedback(`${id} flagged as fraud`);
  };

  const handleMarkLegit = (id) => {
    markAsLegitimate(id);
    setSelectedTx(prev => prev && prev.id === id ? { ...prev, decision: "APPROVE", user_override: "APPROVE", marked_legit: true } : prev);
    showFeedback(`${id} marked as legitimate`);
  };

  const sortIcon = (col) => sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {actionFeedback && (
        <div style={{
          padding: "6px 12px", background: "#111", border: "1px solid #4ade80", borderRadius: 3,
          fontSize: 11, color: "#4ade80", animation: "slideIn 0.2s ease-out",
        }}>
          ✓ {actionFeedback}
        </div>
      )}

      {selectedTx && (
        <TransactionDetail
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
          onOverride={handleOverride}
          onMarkFraud={handleMarkFraud}
          onMarkLegit={handleMarkLegit}
          isAdmin={isAdmin}
        />
      )}

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{ flex: "1 1 200px", padding: "5px 10px", fontSize: 11, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, color: "#e5e5e5", outline: "none" }} />
        {[["all","All"],["approve","Approved"],["fraud","Blocked"],["mfa","MFA"],["high-risk","High Risk"]].map(([k,l]) => (
          <button key={k} onClick={() => { setFilter(k); setPage(0); }}
            style={{ padding: "4px 10px", fontSize: 10, fontWeight: 500, background: filter === k ? "#1a1a1a" : "transparent", color: filter === k ? "#e5e5e5" : "#888", border: "1px solid #1a1a1a", borderRadius: 3, cursor: "pointer", transition: "all 0.15s" }}>
            {l}
          </button>
        ))}
        <span style={{ fontSize: 10, color: "#999", marginLeft: "auto" }}>{filtered.length} results</span>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #1a1a1a", borderRadius: 4 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              {[["id","ID"],["amount","Amount"],["user_id","User"],["device","Device"],["location","Loc"],["merchant","Merchant"],["timestamp","Time"],["risk_score","Risk"],["decision","Decision"]].map(([k,l]) => (
                <th key={k} onClick={() => handleSort(k)} style={{
                  padding: "7px 10px", textAlign: "left", fontWeight: 500, color: "#777", fontSize: 9,
                  textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
                  background: sortCol === k ? "#0f0f0f" : "transparent", transition: "background 0.15s",
                }}>
                  {l}{sortIcon(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(tx => (
              <tr key={tx.id} onClick={() => setSelectedTx(tx)}
                style={{
                  borderBottom: "1px solid #1a1a1a", cursor: "pointer", transition: "background 0.15s",
                  background: tx.risk_score > 0.7 ? "rgba(239,68,68,0.04)" : selectedTx?.id === tx.id ? "rgba(15,15,15,0.9)" : "transparent",
                }}
                onMouseEnter={e => { if (tx.risk_score <= 0.7 && selectedTx?.id !== tx.id) e.currentTarget.style.background = "#0f0f0f"; }}
                onMouseLeave={e => { if (tx.risk_score <= 0.7 && selectedTx?.id !== tx.id) e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "6px 10px", fontFamily: "'SF Mono', monospace", fontSize: 10, color: "#ccc" }}>{tx.id}</td>
                <td style={{ padding: "6px 10px", fontFamily: "'SF Mono', monospace", color: "#e5e5e5" }}>${tx.amount.toFixed(2)}</td>
                <td style={{ padding: "6px 10px", fontFamily: "'SF Mono', monospace", fontSize: 10, color: "#777" }}>{tx.user_id}</td>
                <td style={{ padding: "6px 10px", color: "#777", fontSize: 10 }}>{tx.device}</td>
                <td style={{ padding: "6px 10px", color: "#777", fontSize: 10 }}>{tx.location}</td>
                <td style={{ padding: "6px 10px", color: "#777", fontSize: 10 }}>{tx.merchant}</td>
                <td style={{ padding: "6px 10px", color: "#777", fontSize: 9 }}>{tx.time}</td>
                <td style={{ padding: "6px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 32, height: 2, background: "#1a1a1a", borderRadius: 1, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(tx.risk_score * 100, 100)}%`, height: "100%", background: tx.risk_score > 0.7 ? "#ef4444" : tx.risk_score > 0.45 ? "#fbbf24" : "#4ade80", transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: tx.risk_score > 0.7 ? "#ef4444" : "#777" }}>{tx.risk_score.toFixed(2)}</span>
                  </div>
                </td>
                <td style={{ padding: "6px 10px" }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 2, letterSpacing: 0.5,
                    color: tx.decision === "APPROVE" ? "#4ade80" : tx.decision === "BLOCK" ? "#ef4444" : "#fbbf24",
                    background: tx.decision === "APPROVE" ? "rgba(34,197,94,0.06)" : tx.decision === "BLOCK" ? "rgba(239,68,68,0.06)" : "rgba(234,179,8,0.06)",
                    border: `1px solid ${tx.decision === "APPROVE" ? "rgba(34,197,94,0.15)" : tx.decision === "BLOCK" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)"}`,
                  }}>
                    {tx.decision}
                  </span>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={9} style={{ padding: "32px 12px", textAlign: "center", color: "#999", fontSize: 11 }}>No transactions match your filters.</td></tr>
            )}
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
