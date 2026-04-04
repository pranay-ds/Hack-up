import { useMemo } from "react";

const panel = {
  background: "#fff",
  border: "1px solid #e6e8eb",
  borderRadius: 10,
};

function formatInr(v) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v || 0));
}

export default function AnalyticsPage({ transactions, userProfiles, fraudRings, fraudChains, modelMetrics }) {
  const analytics = useMemo(() => {
    const total = transactions.length || 1;
    const blocked = transactions.filter((t) => t.decision === "BLOCK");
    const mfa = transactions.filter((t) => t.decision === "MFA");
    const approved = transactions.filter((t) => t.decision === "APPROVE");

    const blockedAmount = blocked.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const avgRisk = transactions.reduce((sum, tx) => sum + Number(tx.risk_score || 0), 0) / total;

    const byMerchant = new Map();
    transactions.forEach((tx) => {
      const key = tx.merchant || "Unknown";
      byMerchant.set(key, (byMerchant.get(key) || 0) + 1);
    });
    const topMerchants = Array.from(byMerchant.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([merchant, count]) => ({ merchant, count }));

    const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0, block: 0 }));
    transactions.forEach((tx) => {
      const d = tx.timestamp ? new Date(tx.timestamp) : null;
      const hour = Number.isFinite(d?.getHours?.()) ? d.getHours() : new Date().getHours();
      byHour[hour].count += 1;
      if (tx.decision === "BLOCK") byHour[hour].block += 1;
    });

    const hotUsers = Object.values(userProfiles || {})
      .map((u) => ({
        id: u.user_id,
        score: u.risk_trend?.length ? u.risk_trend[u.risk_trend.length - 1].score : 0,
        flags: u.anomaly_flags?.length || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return {
      total,
      blockedCount: blocked.length,
      mfaCount: mfa.length,
      approvedCount: approved.length,
      blockedAmount,
      avgRisk,
      topMerchants,
      byHour,
      hotUsers,
    };
  }, [transactions, userProfiles]);

  const maxHourCount = Math.max(1, ...analytics.byHour.map((h) => h.count));
  const maxMerchant = Math.max(1, ...analytics.topMerchants.map((m) => m.count));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="section-title">Analytics</div>
        <div className="section-subtitle">Risk intelligence in a simplified trade-desk style layout</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12 }}>
        <Kpi title="Total flow" value={analytics.total} tone="#0f172a" />
        <Kpi title="Blocked" value={analytics.blockedCount} tone="#dc2626" />
        <Kpi title="MFA" value={analytics.mfaCount} tone="#d97706" />
        <Kpi title="Avg risk" value={analytics.avgRisk.toFixed(2)} tone="#2563eb" />
        <Kpi title="Blocked value" value={formatInr(analytics.blockedAmount)} tone="#0d9488" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
        <div style={{ ...panel, padding: "14px 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Hourly Activity + Fraud Hotspots</div>
          <div style={{ display: "flex", alignItems: "end", gap: 6, height: 220, padding: "0 2px" }}>
            {analytics.byHour.map((h) => {
              const hPct = (h.count / maxHourCount) * 100;
              const bPct = h.count ? (h.block / h.count) * 100 : 0;
              return (
                <div key={h.hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", maxWidth: 22, background: "#eef2f7", borderRadius: 6, height: 180, display: "flex", alignItems: "end", overflow: "hidden" }}>
                    <div style={{ width: "100%", height: `${Math.max(4, hPct)}%`, background: bPct > 25 ? "#ef4444" : "#60a5fa", transition: "height 0.2s" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{String(h.hour).padStart(2, "0")}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>Blue = flow volume, Red-leaning hours = higher block ratio.</div>
        </div>

        <div style={{ ...panel, padding: "14px 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Top Merchants by Activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {analytics.topMerchants.map((m) => (
              <div key={m.merchant}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#334155", fontWeight: 600 }}>{m.merchant}</span>
                  <span style={{ color: "#64748b" }}>{m.count}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "#eef2f7", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(m.count / maxMerchant) * 100}%`, background: "#2563eb" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ ...panel, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #edf0f3", fontSize: 15, fontWeight: 700, color: "#111827" }}>High-Risk User Radar</div>
          <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {analytics.hotUsers.map((u) => (
              <div key={u.id} style={{ border: "1px solid #edf1f5", borderRadius: 8, padding: "9px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{u.id}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{u.flags} anomaly flags</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: u.score > 0.7 ? "#dc2626" : u.score > 0.45 ? "#d97706" : "#16a34a" }}>{u.score.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...panel, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #edf0f3", fontSize: 15, fontWeight: 700, color: "#111827" }}>System Snapshot</div>
          <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Mini title="Model accuracy" value={`${(modelMetrics?.accuracy || 0).toFixed(3)}`} />
            <Mini title="Drift" value={`${(modelMetrics?.drift_score || 0).toFixed(3)}`} />
            <Mini title="Fraud rings" value={fraudRings?.length || 0} />
            <Mini title="Fraud chains" value={fraudChains?.length || 0} />
            <Mini title="Approval share" value={`${((analytics.approvedCount / analytics.total) * 100).toFixed(1)}%`} />
            <Mini title="Block share" value={`${((analytics.blockedCount / analytics.total) * 100).toFixed(1)}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value, tone }) {
  return (
    <div style={{ ...panel, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.45 }}>{title}</div>
      <div style={{ fontSize: 34, lineHeight: 1.1, marginTop: 8, fontWeight: 800, color: tone }}>{value}</div>
    </div>
  );
}

function Mini({ title, value }) {
  return (
    <div style={{ border: "1px solid #edf1f5", borderRadius: 8, padding: "10px 11px" }}>
      <div style={{ fontSize: 11, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{value}</div>
    </div>
  );
}
