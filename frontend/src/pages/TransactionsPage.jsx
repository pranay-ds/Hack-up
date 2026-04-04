import { useMemo, useState } from "react";

const panel = {
  background: "#fff",
  border: "1px solid #e6e8eb",
  borderRadius: 10,
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function decisionStyle(decision) {
  if (decision === "BLOCK") return { color: "#b91c1c", bg: "#fee2e2" };
  if (decision === "MFA") return { color: "#b45309", bg: "#fef3c7" };
  return { color: "#166534", bg: "#dcfce7" };
}

function actionBtn(color) {
  return {
    border: `1px solid ${color}33`,
    color,
    background: "#fff",
    borderRadius: 6,
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}

export default function TransactionsPage({ transactions, overrideDecision, markAsFraud, markAsLegitimate, session, loading }) {
  const [query, setQuery] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("ALL");

  const totals = useMemo(() => {
    const total = transactions.length;
    const blocked = transactions.filter((tx) => tx.decision === "BLOCK").length;
    const mfa = transactions.filter((tx) => tx.decision === "MFA").length;
    const approved = transactions.filter((tx) => tx.decision === "APPROVE").length;
    return { total, blocked, mfa, approved };
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (decisionFilter !== "ALL" && tx.decision !== decisionFilter) return false;
      if (!q) return true;
      return [tx.id, tx.user_id, tx.merchant, tx.location, tx.device].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [transactions, query, decisionFilter]);

  const visible = filtered.slice(0, 80);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div className="section-title">Transactions</div>
          <div className="section-subtitle">Execution tape and manual intervention view</div>
        </div>
        <div style={{ ...panel, height: 420 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="section-title">Transactions</div>
        <div className="section-subtitle">Execution tape and manual intervention view</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        <Stat title="Total" value={totals.total} tone="#111827" />
        <Stat title="Blocked" value={totals.blocked} tone="#dc2626" />
        <Stat title="MFA" value={totals.mfa} tone="#d97706" />
        <Stat title="Approved" value={totals.approved} tone="#16a34a" />
      </div>

      <div style={{ ...panel, padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "ALL", label: "All" },
              { key: "APPROVE", label: "Approved" },
              { key: "MFA", label: "MFA" },
              { key: "BLOCK", label: "Blocked" },
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() => setDecisionFilter(chip.key)}
                style={{
                  border: `1px solid ${decisionFilter === chip.key ? "#f97316" : "#e1e5ea"}`,
                  background: decisionFilter === chip.key ? "#fff7ed" : "#fff",
                  color: decisionFilter === chip.key ? "#c2410c" : "#475569",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 11px",
                  cursor: "pointer",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by txn, user, merchant..."
            style={{
              width: 280,
              maxWidth: "100%",
              border: "1px solid #d9dee5",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 12,
              color: "#0f172a",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ ...panel, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #edf0f3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Live Transaction Tape</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{visible.length} / {filtered.length} rows</div>
        </div>

        <div style={{ overflowX: "auto", padding: "2px 12px 10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1020 }}>
            <thead>
              <tr style={{ fontSize: 11, color: "#64748b", textAlign: "left" }}>
                <th style={{ padding: "10px 8px" }}>Transaction</th>
                <th style={{ padding: "10px 8px" }}>User</th>
                <th style={{ padding: "10px 8px" }}>Amount</th>
                <th style={{ padding: "10px 8px" }}>Context</th>
                <th style={{ padding: "10px 8px" }}>Risk</th>
                <th style={{ padding: "10px 8px" }}>Decision</th>
                <th style={{ padding: "10px 8px" }}>Analyst Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((tx) => {
                const pill = decisionStyle(tx.decision);
                return (
                  <tr key={tx.id} style={{ borderTop: "1px solid #f0f2f5" }}>
                    <td style={{ padding: "11px 8px", fontSize: 12, color: "#111827", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{tx.id}</td>
                    <td style={{ padding: "11px 8px", fontSize: 12, color: "#334155" }}>{tx.user_id}</td>
                    <td style={{ padding: "11px 8px", fontSize: 12, color: "#111827", fontWeight: 600 }}>{formatCurrency(tx.amount)}</td>
                    <td style={{ padding: "11px 8px", fontSize: 11, color: "#64748b" }}>{tx.merchant} • {tx.device} • {tx.location}</td>
                    <td style={{ padding: "11px 8px", fontSize: 12, color: tx.risk_score > 0.7 ? "#dc2626" : tx.risk_score > 0.45 ? "#d97706" : "#16a34a", fontWeight: 700 }}>{(tx.risk_score || 0).toFixed(2)}</td>
                    <td style={{ padding: "11px 8px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pill.color, background: pill.bg, borderRadius: 999, padding: "4px 8px" }}>{tx.decision}</span>
                    </td>
                    <td style={{ padding: "11px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => overrideDecision(tx.id, "APPROVE")} style={actionBtn("#16a34a")}>Approve</button>
                      <button onClick={() => overrideDecision(tx.id, "MFA")} style={actionBtn("#d97706")}>MFA</button>
                      <button onClick={() => overrideDecision(tx.id, "BLOCK")} style={actionBtn("#dc2626")}>Block</button>
                      {session?.role === "admin" && (
                        <>
                          <button onClick={() => markAsLegitimate(tx.id)} style={actionBtn("#0f766e")}>Mark Legit</button>
                          <button onClick={() => markAsFraud(tx.id)} style={actionBtn("#991b1b")}>Mark Fraud</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, tone }) {
  return (
    <div style={{ ...panel, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.45 }}>{title}</div>
      <div style={{ fontSize: 34, lineHeight: 1.1, marginTop: 8, fontWeight: 800, color: tone }}>{value}</div>
    </div>
  );
}
