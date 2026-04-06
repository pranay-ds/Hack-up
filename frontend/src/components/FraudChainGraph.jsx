import { useState, useMemo } from "react";

const stageConfig = {
  login_anomaly: {
    icon: "🔑",
    title: "Suspicious Login",
    description: "Login attempt from unrecognized device or IP address",
    color: "#fbbf24",
    bg: "rgba(234,179,8,0.06)",
    border: "rgba(234,179,8,0.15)",
  },
  credential_stuff: {
    icon: "🔓",
    title: "Credential Attack",
    description: "Multiple failed login attempts indicating automated credential stuffing",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.15)",
  },
  profile_change: {
    icon: "👤",
    title: "Profile Manipulation",
    description: "Account details modified — email, phone, or recovery info changed",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.15)",
  },
  velocity_spike: {
    icon: "⚡",
    title: "Velocity Anomaly",
    description: "Unusually high transaction frequency in a short time window",
    color: "#fbbf24",
    bg: "rgba(234,179,8,0.06)",
    border: "rgba(234,179,8,0.15)",
  },
  high_value_txn: {
    icon: "💰",
    title: "High-Value Transaction",
    description: "Large monetary transfer to external account or high-risk merchant",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.15)",
  },
};

function RiskGauge({ score }) {
  const pct = Math.round(score * 100);
  const color = score > 0.8 ? "#ef4444" : score > 0.6 ? "#f87171" : score > 0.4 ? "#fbbf24" : "#4ade80";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: 48, height: 48 }}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#1a1a1a" strokeWidth="4" />
          <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${pct * 1.26} ${126 - pct * 1.26}`}
            strokeDashoffset="31.5" strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'SF Mono', monospace" }}>{pct}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 9, color: "#777", textTransform: "uppercase", letterSpacing: 0.5 }}>Chain Risk</div>
        <div style={{ fontSize: 11, color, fontWeight: 600 }}>
          {score > 0.8 ? "CRITICAL" : score > 0.6 ? "HIGH" : score > 0.4 ? "MEDIUM" : "LOW"}
        </div>
      </div>
    </div>
  );
}

function ChainStep({ stage, isLast, isExpanded, onClick }) {
  const cfg = stageConfig[stage.type] || { icon: "•", title: stage.type, description: stage.detail, color: "#777", bg: "#0f0f0f", border: "#1a1a1a" };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0, paddingTop: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: cfg.bg,
          border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, cursor: "pointer", transition: "all 0.2s",
        }} onClick={onClick}>
          {cfg.icon}
        </div>
        {!isLast && (
          <div style={{ width: 1, height: 32, background: isExpanded ? cfg.color + "44" : "#1a1a1a", transition: "background 0.3s" }} />
        )}
      </div>

      <div
        onClick={onClick}
        style={{
          flex: 1, padding: "8px 12px", background: isExpanded ? cfg.bg : "transparent",
          border: `1px solid ${isExpanded ? cfg.border : "transparent"}`,
          borderRadius: 4, cursor: "pointer", marginBottom: isLast ? 0 : 4,
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color }}>{cfg.title}</span>
          <span style={{ fontSize: 8, color: "#999", fontFamily: "'SF Mono', monospace" }}>{stage.time}</span>
        </div>
        <div style={{ fontSize: 9, color: "#777", lineHeight: 1.4 }}>{cfg.description}</div>
        {isExpanded && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${cfg.border}`, fontSize: 9, color: "#777" }}>
            <div style={{ marginBottom: 2 }}><span style={{ color: "#999" }}>User:</span> {stage.user_id}</div>
            <div><span style={{ color: "#999" }}>Detail:</span> {stage.detail}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChainCard({ chain, isExpanded, onToggle, onAction }) {
  const isCritical = chain.risk_score > 0.8;

  return (
    <div style={{
      background: "#111",
      border: `1px solid ${isCritical ? "rgba(239,68,68,0.2)" : "#1a1a1a"}`,
      borderRadius: 6,
      overflow: "hidden",
      transition: "all 0.3s",
      boxShadow: isCritical ? "0 0 20px rgba(239,68,68,0.06)" : "none",
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: "10px 14px", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: isExpanded ? "1px solid #1a1a1a" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: "#ccc",
            padding: "2px 6px", background: "#0f0f0f", borderRadius: 3,
          }}>
            {chain.id}
          </span>
          <span style={{
            fontSize: 8, padding: "1px 5px", borderRadius: 2, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600,
            color: chain.status === "active" ? "#ef4444" : "#4ade80",
            background: chain.status === "active" ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)",
            border: `1px solid ${chain.status === "active" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"}`,
          }}>
            {chain.status}
          </span>
            <span style={{ fontSize: 9, color: "#888" }}>
            {chain.stages?.length || 0} stages · {chain.stages?.[0]?.user_id || ""}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RiskGauge score={chain.risk_score} />
          <span style={{ fontSize: 10, color: "#777", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: "12px 14px", animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, fontWeight: 600 }}>
            Attack Timeline
          </div>

          {chain.stages?.map((stage, i) => (
            <ChainStep
              key={i}
              stage={stage}
              isLast={i === (chain.stages?.length || 0) - 1}
              isExpanded={true}
            />
          ))}

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, fontWeight: 600 }}>
              AI Insight
            </div>
            <div style={{ fontSize: 10, color: "#777", lineHeight: 1.5, background: "#0f0f0f", padding: "8px 10px", borderRadius: 3, border: "1px solid #1a1a1a" }}>
              {chain.risk_score > 0.8
                ? `High-confidence attack pattern detected. ${chain.stages?.length || 0} sequential stages indicate coordinated account takeover. Immediate intervention recommended.`
                : chain.risk_score > 0.6
                  ? `Suspicious activity pattern with ${chain.stages?.length || 0} stages. Behavior deviates from user baseline. Recommend MFA escalation.`
                  : `Low-confidence anomaly chain. ${chain.stages?.length || 0} stages observed but risk score below critical threshold. Monitor for escalation.`
              }
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 4 }}>
            <button onClick={(e) => { e.stopPropagation(); onAction(chain.id, "block"); }} style={{ padding: "5px 14px", fontSize: 10, fontWeight: 600, background: "rgba(239,68,68,0.06)", border: "1px solid #ef444433", borderRadius: 3, color: "#ef4444", cursor: "pointer" }}>Block User</button>
            <button onClick={(e) => { e.stopPropagation(); onAction(chain.id, "mfa"); }} style={{ padding: "5px 14px", fontSize: 10, fontWeight: 600, background: "rgba(251,191,36,0.06)", border: "1px solid #fbbf2433", borderRadius: 3, color: "#fbbf24", cursor: "pointer" }}>Trigger MFA</button>
            <button onClick={(e) => { e.stopPropagation(); onAction(chain.id, "safe"); }} style={{ padding: "5px 14px", fontSize: 10, fontWeight: 600, background: "rgba(74,222,128,0.06)", border: "1px solid #4ade8033", borderRadius: 3, color: "#4ade80", cursor: "pointer" }}>Mark Safe</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FraudChainGraph({ fraudChains }) {
  const [expandedChain, setExpandedChain] = useState(null);
  const [chainOverrides, setChainOverrides] = useState({});
  const [feedback, setFeedback] = useState(null);

  const mergedChains = useMemo(() => {
    return (fraudChains || []).map((chain) => ({
      ...chain,
      ...(chainOverrides[chain.id] || {}),
    }));
  }, [fraudChains, chainOverrides]);

  const sortedChains = useMemo(() => {
    return [...mergedChains].sort((a, b) => b.risk_score - a.risk_score);
  }, [mergedChains]);

  const handleAction = (chainId, action) => {
    setChainOverrides((prev) => {
      const baseChain = (fraudChains || []).find((chain) => chain.id === chainId);
      if (!baseChain) return prev;

      const existingOverride = prev[chainId] || {};
      const currentRisk = existingOverride.risk_score ?? baseChain.risk_score;
      let nextStatus = existingOverride.status ?? baseChain.status;
      let nextRisk = currentRisk;

      if (action === "block") {
        nextStatus = "active";
        nextRisk = Math.min(0.99, currentRisk + 0.08);
      } else if (action === "mfa") {
        nextStatus = "investigating";
        nextRisk = Math.min(0.95, currentRisk + 0.03);
      } else if (action === "safe") {
        nextStatus = "mitigated";
        nextRisk = Math.max(0.1, currentRisk - 0.2);
      }

      return {
        ...prev,
        [chainId]: {
          status: nextStatus,
          risk_score: nextRisk,
        },
      };
    });

    const label = action === "block" ? "User blocked" : action === "mfa" ? "MFA triggered" : "Marked safe";
    setFeedback(`${chainId}: ${label}`);
    setTimeout(() => setFeedback(null), 1800);
  };

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Fraud Chain Intelligence</div>
          <div style={{ fontSize: 9, color: "#999", marginTop: 1 }}>Account takeover sequences and attack patterns</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#777" }}>{sortedChains.filter(c => c.status === "active").length} active</span>
          <span style={{ fontSize: 9, color: "#777" }}>{sortedChains.length} total</span>
        </div>
      </div>

      {feedback && (
        <div style={{ margin: "10px 12px 0", padding: "6px 8px", fontSize: 10, color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 4 }}>
          ✓ {feedback}
        </div>
      )}

      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {sortedChains.map(chain => (
          <ChainCard
            key={chain.id}
            chain={chain}
            isExpanded={expandedChain === chain.id}
            onToggle={() => setExpandedChain(prev => prev === chain.id ? null : chain.id)}
            onAction={handleAction}
          />
        ))}
      </div>
    </div>
  );
}
