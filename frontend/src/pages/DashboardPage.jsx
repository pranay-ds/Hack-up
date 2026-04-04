const cardStyle = {
  background: "#fff",
  border: "1px solid #e6e8eb",
  borderRadius: 10,
};

function metricCard(label, value, sub, tone) {
  return { label, value, sub, tone };
}

function decisionPill(decision) {
  if (decision === "BLOCK") return { color: "#b91c1c", bg: "#fee2e2" };
  if (decision === "MFA") return { color: "#b45309", bg: "#fef3c7" };
  return { color: "#166534", bg: "#dcfce7" };
}

function currency(v) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);
}

export default function DashboardPage({ stats, alerts, transactions, mfaTransactions, userProfiles, fraudRings, fraudChains, modelMetrics, loading, overrideDecision, markAsFraud, markAsLegitimate, applyUserAction }) {
  const metrics = [
    metricCard("Transactions", stats.total, "today", "#1f2937"),
    metricCard("Fraud blocked", stats.fraud, `${stats.fraudRate}% of flow`, "#dc2626"),
    metricCard("MFA escalations", stats.mfa, "requires review", "#d97706"),
    metricCard("Approved", stats.approve, "auto-cleared", "#16a34a"),
    metricCard("Avg risk", stats.avgRisk, "rolling window", "#2563eb"),
    metricCard("Money saved", currency(stats.moneySaved), "fraud prevented", "#0d9488"),
  ];

  const recent = transactions.slice(0, 9);
  const blocked = transactions.filter((t) => t.decision === "BLOCK").slice(0, 6);
  const mfaQueue = mfaTransactions.slice(0, 6);
  const decisionMix = {
    approve: Math.max(1, stats.approve || 1),
    mfa: Math.max(1, stats.mfa || 1),
    block: Math.max(1, stats.fraud || 1),
  };
  const decisionTotal = decisionMix.approve + decisionMix.mfa + decisionMix.block;

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div className="section-title">Dashboard</div>
          <div className="section-subtitle">Real-time fraud operations overview and analyst intelligence</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ ...cardStyle, height: 92, background: "linear-gradient(90deg,#fff,#f5f7fa,#fff)" }} />
          ))}
        </div>
        <div style={{ ...cardStyle, height: 300 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ ...cardStyle, height: 260 }} />
          <div style={{ ...cardStyle, height: 260 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="section-title">Dashboard</div>
        <div className="section-subtitle">Clean operations view inspired by trading terminal workflows</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ ...cardStyle, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.45 }}>{m.label}</div>
            <div style={{ fontSize: 37, lineHeight: 1.1, marginTop: 8, fontWeight: 800, color: m.tone }}>{m.value}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #edf0f3", display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Live Transactions</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{recent.length} visible</div>
          </div>
          <div style={{ padding: "2px 12px 10px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ fontSize: 11, color: "#64748b", textAlign: "left" }}>
                  <th style={{ padding: "10px 8px" }}>Transaction</th>
                  <th style={{ padding: "10px 8px" }}>User</th>
                  <th style={{ padding: "10px 8px" }}>Amount</th>
                  <th style={{ padding: "10px 8px" }}>Decision</th>
                  <th style={{ padding: "10px 8px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => {
                  const pill = decisionPill(tx.decision);
                  return (
                    <tr key={tx.id} style={{ borderTop: "1px solid #f0f2f5" }}>
                      <td style={{ padding: "10px 8px", fontSize: 12, color: "#111827", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{tx.id}</td>
                      <td style={{ padding: "10px 8px", fontSize: 12, color: "#334155" }}>{tx.user_id}</td>
                      <td style={{ padding: "10px 8px", fontSize: 12, color: "#111827", fontWeight: 600 }}>{currency(tx.amount)}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: pill.color, background: pill.bg, borderRadius: 999, padding: "4px 8px" }}>{tx.decision}</span>
                      </td>
                      <td style={{ padding: "10px 8px", display: "flex", gap: 6 }}>
                        <button onClick={() => overrideDecision(tx.id, "APPROVE")} style={actionBtn("#16a34a")}>Approve</button>
                        <button onClick={() => overrideDecision(tx.id, "MFA")} style={actionBtn("#d97706")}>MFA</button>
                        <button onClick={() => overrideDecision(tx.id, "BLOCK")} style={actionBtn("#dc2626")}>Block</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...cardStyle, padding: "14px 16px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Decision Mix</div>
            <div style={{ height: 10, borderRadius: 999, overflow: "hidden", display: "flex", border: "1px solid #e5e7eb" }}>
              <div style={{ width: `${(decisionMix.approve / decisionTotal) * 100}%`, background: "#22c55e" }} />
              <div style={{ width: `${(decisionMix.mfa / decisionTotal) * 100}%`, background: "#f59e0b" }} />
              <div style={{ width: `${(decisionMix.block / decisionTotal) * 100}%`, background: "#ef4444" }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#475569", display: "flex", justifyContent: "space-between" }}>
              <span>Approve {stats.approve}</span>
              <span>MFA {stats.mfa}</span>
              <span>Block {stats.fraud}</span>
            </div>
          </div>

          <div style={{ ...cardStyle }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #edf0f3", fontSize: 15, fontWeight: 700, color: "#111827" }}>
              MFA Action Queue
            </div>
            <div style={{ padding: "8px 12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
              {mfaQueue.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", padding: "8px 4px" }}>No pending MFA reviews.</div>}
              {mfaQueue.map((tx) => (
                <div key={tx.id} style={{ border: "1px solid #eef0f4", borderRadius: 8, padding: "10px 10px" }}>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{tx.user_id} • {currency(tx.amount)}</div>
                  <div style={{ marginTop: 7, display: "flex", gap: 6 }}>
                    <button onClick={() => markAsLegitimate(tx.id)} style={actionBtn("#16a34a")}>Mark Legit</button>
                    <button onClick={() => markAsFraud(tx.id)} style={actionBtn("#dc2626")}>Mark Fraud</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ ...cardStyle }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #edf0f3", fontSize: 15, fontWeight: 700, color: "#111827" }}>
            Live Alerts
          </div>
          <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
            {alerts.slice(0, 8).map((alert) => (
              <div key={alert.id} style={{ border: "1px solid #edf1f5", borderRadius: 8, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>{alert.merchant}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{alert.user_id} • {alert.time}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: decisionPill(alert.decision).color, background: decisionPill(alert.decision).bg, borderRadius: 999, padding: "4px 8px" }}>{alert.decision}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #edf0f3", fontSize: 15, fontWeight: 700, color: "#111827" }}>
            Blocked Reasons
          </div>
          <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
            {blocked.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", padding: "8px 4px" }}>No blocked transactions yet.</div>}
            {blocked.map((tx) => (
              <div key={tx.id} style={{ border: "1px solid #fee2e2", background: "#fff7f7", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7f1d1d" }}>{tx.id} • {currency(tx.amount)}</div>
                <div style={{ fontSize: 11, color: "#991b1b", marginTop: 4 }}>{tx.reasons?.[0] || "High-risk profile detected"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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
