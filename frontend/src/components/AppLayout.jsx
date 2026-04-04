export default function AppLayout({ route, setRoute, streamStatus, apiLatencyMs, session, onLogout, children }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "transactions", label: "Transactions" },
    { key: "analytics", label: "Analytics" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>
      <aside style={{
        width: 200,
        background: "#111",
        borderRight: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#e5e5e5", letterSpacing: 1 }}>SENTINEL</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 2, letterSpacing: 0.5 }}>FRAUD DETECTION</div>
        </div>

        <nav style={{ padding: "8px 0", flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setRoute(item.key)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                fontSize: 12,
                fontWeight: route === item.key ? 600 : 400,
                color: route === item.key ? "#e5e5e5" : "#666",
                background: route === item.key ? "#1a1a1a" : "transparent",
                border: "none",
                cursor: "pointer",
                borderLeft: route === item.key ? "2px solid #e5e5e5" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid #1a1a1a" }}>
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", display: "inline-block",
              background: streamStatus === "connected" ? "#4ade80" : streamStatus === "connecting" ? "#fbbf24" : "#ef4444",
            }} />
            <span style={{ fontSize: 10, color: streamStatus === "connected" ? "#4ade80" : "#666", textTransform: "capitalize" }}>
              {streamStatus}
            </span>
          </div>
          <div style={{ padding: "8px 16px", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#ccc", fontWeight: 500 }}>{session?.name}</div>
              <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>{session?.role}</div>
            </div>
            <button onClick={onLogout} style={{
              fontSize: 9, color: "#666", background: "transparent", border: "1px solid #222", borderRadius: 3, padding: "3px 8px", cursor: "pointer",
            }}>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>
        {(streamStatus !== "connected" || (typeof apiLatencyMs === "number" && apiLatencyMs > 1400)) && (
          <div
            style={{
              margin: "10px 14px 0",
              padding: "8px 10px",
              borderRadius: 6,
              border: `1px solid ${streamStatus === "error" ? "rgba(239,68,68,0.3)" : "rgba(251,191,36,0.3)"}`,
              background: streamStatus === "error" ? "rgba(239,68,68,0.08)" : "rgba(251,191,36,0.08)",
              color: streamStatus === "error" ? "#fca5a5" : "#fcd34d",
              fontSize: 11,
              letterSpacing: 0.1,
            }}
          >
            {streamStatus === "error"
              ? "Backend degraded. Dashboard is using fallback data while the API recovers."
              : `Backend warming up${typeof apiLatencyMs === "number" ? ` (${apiLatencyMs}ms)` : ""}. Live stream will stabilize shortly.`}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
