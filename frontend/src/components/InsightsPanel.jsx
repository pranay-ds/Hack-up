export default function InsightsPanel({ stats, modelMetrics, alerts }) {
  const riskState = parseFloat(stats.fraudRate) > 20 ? "High" : parseFloat(stats.fraudRate) > 10 ? "Elevated" : "Stable";
  const riskColor = riskState === "High" ? "#ef4444" : riskState === "Elevated" ? "#fbbf24" : "#4ade80";

  const insights = [
    `Fraud rate is ${stats.fraudRate}% across ${stats.total} recent transactions.`,
    `${alerts.filter(a => a.decision === "BLOCK").length} critical alerts are active in the current feed.`,
    `Model accuracy is ${(modelMetrics.accuracy * 100).toFixed(1)}% with drift at ${(modelMetrics.drift * 100).toFixed(2)}%.`,
  ];

  const recommendations = [
    "Increase manual review priority for high-value blocked transactions.",
    "Monitor users with repeated MFA prompts for possible account takeover.",
    "Escalate ring clusters with confidence > 0.80 to Tier-2 analysts.",
  ];

  return (
    <div className="panel hover-lift" style={{ padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
          Intelligence Summary
        </div>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: riskColor,
          background: `${riskColor}1a`,
          border: `1px solid ${riskColor}33`,
          borderRadius: 999,
          padding: "2px 8px",
          letterSpacing: 0.4,
        }}>
          {riskState}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
        {insights.map((text, idx) => (
          <div key={idx} style={{ fontSize: 10, color: "#b8b8b8", lineHeight: 1.45, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 6, padding: "7px 8px" }}>
            {text}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9, color: "#777", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6, fontWeight: 600 }}>
        Recommended Actions
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {recommendations.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: 7, fontSize: 10, color: "#9f9f9f", lineHeight: 1.4 }}>
            <span style={{ color: "#60a5fa", marginTop: 1 }}>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
