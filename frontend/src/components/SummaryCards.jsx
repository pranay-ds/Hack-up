function StatCard({ label, value, sub, color }) {
  return (
    <div className="panel hover-lift" style={{ padding: "14px 16px", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
      <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "'SF Mono', 'Fira Code', monospace", lineHeight: 1.05 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function SummaryCards({ stats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
      <StatCard label="Transactions" value={stats.total.toLocaleString()} color="#e5e5e5" />
      <StatCard label="Fraud Blocked" value={stats.fraud.toLocaleString()} color="#ef4444" sub={`${stats.fraudRate}% of total`} />
      <StatCard label="MFA Escalations" value={stats.mfa.toLocaleString()} color="#fbbf24" />
      <StatCard label="Approved" value={stats.approve.toLocaleString()} color="#4ade80" />
      <StatCard label="Avg Risk" value={stats.avgRisk} color="#60a5fa" />
      <StatCard label="Money Saved" value={`$${Math.round(stats.moneySaved).toLocaleString()}`} color="#4ade80" sub="Fraud losses prevented" />
    </div>
  );
}
