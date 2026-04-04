import { useState } from "react";

export default function SettingsPage({ settings, setSettings }) {
  const [local, setLocal] = useState(settings);

  const save = () => setSettings(local);

  const Toggle = ({ label, value, onChange }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
      <span style={{ fontSize: 12, color: "#ccc" }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
        background: value ? "#4ade80" : "#0f0f0f", position: "relative", transition: "background 0.2s",
      }}>
        <span style={{
          position: "absolute", top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%", background: "#ccc", transition: "left 0.2s",
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e5e5" }}>Settings</div>

      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>Detection Thresholds</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 10, color: "#888", marginBottom: 4, display: "block" }}>Block Threshold</label>
            <input type="range" min="0.5" max="0.99" step="0.01" value={local.blockThreshold} onChange={e => setLocal({ ...local, blockThreshold: parseFloat(e.target.value) })} style={{ width: "100%" }} />
            <div style={{ fontSize: 12, fontFamily: "'SF Mono', monospace", color: "#ef4444", marginTop: 4 }}>{local.blockThreshold.toFixed(2)}</div>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "#888", marginBottom: 4, display: "block" }}>MFA Threshold</label>
            <input type="range" min="0.1" max="0.8" step="0.01" value={local.mfaThreshold} onChange={e => setLocal({ ...local, mfaThreshold: parseFloat(e.target.value) })} style={{ width: "100%" }} />
            <div style={{ fontSize: 12, fontFamily: "'SF Mono', monospace", color: "#fbbf24", marginTop: 4 }}>{local.mfaThreshold.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>Notifications</div>
        <Toggle label="Auto-Block High Risk" value={local.autoBlock} onChange={v => setLocal({ ...local, autoBlock: v })} />
        <Toggle label="Email Alerts" value={local.emailAlerts} onChange={v => setLocal({ ...local, emailAlerts: v })} />
        <Toggle label="SMS Alerts" value={local.smsAlerts} onChange={v => setLocal({ ...local, smsAlerts: v })} />
      </div>

      <button onClick={save} style={{ padding: "8px 20px", fontSize: 12, fontWeight: 600, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3, color: "#e5e5e5", cursor: "pointer", width: "fit-content" }}>
        Save Settings
      </button>
    </div>
  );
}
