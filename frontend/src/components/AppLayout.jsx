export default function AppLayout({ route, setRoute, streamStatus, apiLatencyMs, session, onLogout, children }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "transactions", label: "Transactions" },
    { key: "analytics", label: "Analytics" },
    { key: "settings", label: "Settings" },
  ];

  const statusColor = streamStatus === "connected" ? "#17a34a" : streamStatus === "connecting" ? "#b45309" : "#b91c1c";
  const statusBg = streamStatus === "connected" ? "#dcfce7" : streamStatus === "connecting" ? "#fef3c7" : "#fee2e2";

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e6e8eb", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#1f2937", letterSpacing: 0.2 }}>SENTINEL</div>
                <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 0.35 }}>FRAUD OPERATIONS</div>
              </div>
              <nav style={{ display: "flex", gap: 6 }}>
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRoute(item.key)}
                    style={{
                      border: "none",
                      borderBottom: route === item.key ? "2px solid #f97316" : "2px solid transparent",
                      color: route === item.key ? "#f97316" : "#4b5563",
                      background: "transparent",
                      fontSize: 13,
                      fontWeight: route === item.key ? 700 : 500,
                      padding: "18px 10px 16px",
                      cursor: "pointer",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: statusColor,
                background: statusBg,
                border: `1px solid ${statusColor}33`,
                borderRadius: 999,
                padding: "5px 10px",
                textTransform: "capitalize",
              }}>
                {streamStatus}
              </span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{session?.name}</div>
                <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{session?.role}</div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  background: "#fff",
                  border: "1px solid #d6dae0",
                  borderRadius: 6,
                  color: "#374151",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "7px 11px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #f1f2f4", background: "#fcfcfd" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "7px 22px", display: "flex", gap: 18, fontSize: 11, color: "#4b5563" }}>
            <span>NIFTY 50 <strong style={{ color: "#16a34a" }}>24,678.50</strong></span>
            <span>SENSEX <strong style={{ color: "#16a34a" }}>80,435.09</strong></span>
            <span>API latency: <strong style={{ color: typeof apiLatencyMs === "number" && apiLatencyMs > 1400 ? "#b45309" : "#2563eb" }}>{typeof apiLatencyMs === "number" ? `${apiLatencyMs}ms` : "--"}</strong></span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "18px 22px 28px" }}>
        {(streamStatus !== "connected" || (typeof apiLatencyMs === "number" && apiLatencyMs > 1400)) && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 6,
              border: `1px solid ${streamStatus === "error" ? "rgba(239,68,68,0.3)" : "rgba(251,191,36,0.3)"}`,
              background: streamStatus === "error" ? "rgba(239,68,68,0.08)" : "rgba(251,191,36,0.08)",
              color: streamStatus === "error" ? "#fca5a5" : "#fcd34d",
              fontSize: 12,
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
