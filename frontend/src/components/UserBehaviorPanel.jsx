import { useEffect, useMemo, useRef, useState } from "react";

const anomalyConfig = {
  amount_deviation: {
    icon: "💲",
    label: "Amount Deviation",
    severity: "high",
    explanation: "Transaction amount significantly differs from user's historical average",
  },
  location_anomaly: {
    icon: "🌍",
    label: "Location Anomaly",
    severity: "high",
    explanation: "Transaction originated from a location outside the user's typical regions",
  },
  velocity_spike: {
    icon: "⚡",
    label: "Velocity Spike",
    severity: "critical",
    explanation: "Transaction frequency far exceeds the user's normal rate",
  },
  device_anomaly: {
    icon: "📱",
    label: "New Device",
    severity: "medium",
    explanation: "Login or transaction from an unrecognized device",
  },
  time_anomaly: {
    icon: "🕐",
    label: "Unusual Time",
    severity: "low",
    explanation: "Activity occurred at an atypical time for this user",
  },
  merchant_anomaly: {
    icon: "🏪",
    label: "Merchant Risk",
    severity: "medium",
    explanation: "Transaction with a high-risk or unfamiliar merchant category",
  },
};

function SeverityBadge({ severity }) {
  const config = {
    critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", label: "CRITICAL" },
    high: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)", label: "HIGH" },
    medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", label: "MEDIUM" },
    low: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.2)", label: "LOW" },
  };
  const c = config[severity] || config.low;
  return (
    <span style={{
      fontSize: 7, fontWeight: 700, padding: "1px 5px", borderRadius: 2,
      letterSpacing: 0.8, color: c.color, background: c.bg, border: `1px solid ${c.border}`,
    }}>
      {c.label}
    </span>
  );
}

function AnomalyCard({ profile, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const latestScore = profile.risk_trend.length > 0 ? profile.risk_trend[profile.risk_trend.length - 1]?.score : 0;
  const riskColor = latestScore > 0.7 ? "#ef4444" : latestScore > 0.4 ? "#fbbf24" : "#4ade80";
  const riskLabel = latestScore > 0.7 ? "High Risk" : latestScore > 0.4 ? "Medium Risk" : "Low Risk";
  const actionBadge = profile.analyst_action
    ? profile.analyst_action === "block"
      ? { label: "BLOCKED", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" }
      : profile.analyst_action === "mfa"
        ? { label: "MFA", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" }
        : { label: "SAFE", color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.2)" }
    : null;

  const maxSeverity = profile.anomaly_flags.reduce((max, flag) => {
    const cfg = anomalyConfig[flag];
    if (!cfg) return max;
    const order = { critical: 4, high: 3, medium: 2, low: 1 };
    return (order[cfg.severity] || 0) > (order[max] || 0) ? cfg.severity : max;
  }, "low");

  return (
    <div
      onClick={() => setExpanded(v => !v)}
      style={{
        background: "#111",
        border: `1px solid ${latestScore > 0.7 ? "rgba(239,68,68,0.15)" : "#1a1a1a"}`,
        borderRadius: 4,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'SF Mono', monospace", color: "#ccc" }}>
              {profile.user_id}
            </span>
            <SeverityBadge severity={maxSeverity} />
            {actionBadge && (
              <span style={{
                fontSize: 7,
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: 2,
                letterSpacing: 0.8,
                color: actionBadge.color,
                background: actionBadge.bg,
                border: `1px solid ${actionBadge.border}`,
              }}>
                {actionBadge.label}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 4 }}>
            {profile.anomaly_flags.slice(0, 3).map(flag => {
              const cfg = anomalyConfig[flag] || { icon: "•", label: flag };
              return (
                <span key={flag} style={{
                  fontSize: 8, padding: "1px 5px", borderRadius: 2,
                  background: "#0f0f0f", border: "1px solid #1a1a1a", color: "#777",
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  <span style={{ fontSize: 9 }}>{cfg.icon}</span>
                  {cfg.label}
                </span>
              );
            })}
            {profile.anomaly_flags.length > 3 && (
              <span style={{ fontSize: 8, color: "#777" }}>+{profile.anomaly_flags.length - 3} more</span>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, fontSize: 8, color: "#999" }}>
            <span>{profile.total_txns} txns</span>
            <span>Avg ${profile.avg_amount.toFixed(0)}</span>
            <span>Velocity {profile.velocity_history.length > 0 ? profile.velocity_history[profile.velocity_history.length - 1]?.velocity.toFixed(1) : "0"}/hr</span>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: riskColor }}>
            {latestScore.toFixed(2)}
          </div>
          <div style={{ fontSize: 8, color: riskColor, fontWeight: 600 }}>{riskLabel}</div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 12px 10px", borderTop: "1px solid #1a1a1a", paddingTop: 8, animation: "fadeIn 0.15s" }}>
          <div style={{ fontSize: 8, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, fontWeight: 600 }}>
            Anomaly Details
          </div>
          {profile.anomaly_flags.map(flag => {
            const cfg = anomalyConfig[flag] || { icon: "•", label: flag, explanation: "Unknown anomaly detected" };
            return (
              <div key={flag} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "flex-start" }}>
                <span style={{ fontSize: 10, flexShrink: 0 }}>{cfg.icon}</span>
                <div>
                  <div style={{ fontSize: 9, color: "#ccc", fontWeight: 500 }}>{cfg.label}</div>
                  <div style={{ fontSize: 8, color: "#777", lineHeight: 1.4 }}>{cfg.explanation}</div>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAction(profile.user_id, "block"); }} style={{ padding: "3px 10px", fontSize: 9, fontWeight: 600, background: "rgba(239,68,68,0.06)", border: "1px solid #ef444433", borderRadius: 3, color: "#ef4444", cursor: "pointer" }}>Block</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAction(profile.user_id, "mfa"); }} style={{ padding: "3px 10px", fontSize: 9, fontWeight: 600, background: "rgba(251,191,36,0.06)", border: "1px solid #fbbf2433", borderRadius: 3, color: "#fbbf24", cursor: "pointer" }}>MFA</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onAction(profile.user_id, "safe"); }} style={{ padding: "3px 10px", fontSize: 9, fontWeight: 600, background: "rgba(74,222,128,0.06)", border: "1px solid #4ade8033", borderRadius: 3, color: "#4ade80", cursor: "pointer" }}>Safe</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserBehaviorPanel({ userProfiles, onUserAction }) {
  const [profiles, setProfiles] = useState(() => ({ ...(userProfiles || {}) }));
  const [feedback, setFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  useEffect(() => {
    setProfiles({ ...(userProfiles || {}) });
  }, [userProfiles]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const flaggedUsers = useMemo(() => {
    return Object.values(profiles)
      .filter(p => p.anomaly_flags.length > 0 || (p.risk_trend.length > 0 && p.risk_trend[p.risk_trend.length - 1]?.score > 0.5))
      .sort((a, b) => {
        const aScore = a.risk_trend.length > 0 ? a.risk_trend[a.risk_trend.length - 1]?.score : 0;
        const bScore = b.risk_trend.length > 0 ? b.risk_trend[b.risk_trend.length - 1]?.score : 0;
        return bScore - aScore;
      })
      .slice(0, 10);
  }, [profiles]);

  const handleAction = (userId, action) => {
    setProfiles((prev) => {
      const profile = prev[userId];
      if (!profile) return prev;

      const latest = profile.risk_trend.length > 0 ? profile.risk_trend[profile.risk_trend.length - 1]?.score : 0.5;
      const nextScore = action === "block"
        ? Math.min(0.99, latest + 0.25)
        : action === "mfa"
          ? Math.min(0.92, latest + 0.08)
          : Math.max(0.1, latest - 0.35);

      const nextTrend = [...profile.risk_trend, { time: new Date().toISOString(), score: nextScore }].slice(-120);

      return {
        ...prev,
        [userId]: {
          ...profile,
          anomaly_flags: action === "safe" ? [] : profile.anomaly_flags,
          risk_trend: nextTrend,
          analyst_action: action,
          analyst_action_at: new Date().toISOString(),
        },
      };
    });

    if (typeof onUserAction === "function") {
      onUserAction(userId, action);
    }

    const label = action === "block" ? "Blocked" : action === "mfa" ? "MFA required" : "Marked safe";
    setFeedback(`${userId}: ${label}`);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 1800);
  };

  if (flaggedUsers.length === 0) {
    return (
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>User Behavior Intelligence</div>
        </div>
        <div style={{ padding: 24, textAlign: "center", color: "#bbb", fontSize: 11 }}>
          No behavioral anomalies detected
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>User Behavior Intelligence</div>
          <div style={{ fontSize: 9, color: "#999", marginTop: 1 }}>Anomalous patterns detected across user base</div>
        </div>
        <div style={{ fontSize: 9, color: "#777" }}>{flaggedUsers.length} flagged users</div>
      </div>

      {feedback && (
        <div style={{ margin: "10px 10px 0", padding: "6px 8px", fontSize: 10, color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 4 }}>
          ✓ {feedback}
        </div>
      )}

      <div style={{ padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 6 }}>
        {flaggedUsers.map(profile => (
          <AnomalyCard key={profile.user_id} profile={profile} onAction={handleAction} />
        ))}
      </div>
    </div>
  );
}
