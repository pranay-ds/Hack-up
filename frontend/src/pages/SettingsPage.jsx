import { useState } from "react";

const panel = {
  background: "#fff",
  border: "1px solid #e6e8eb",
  borderRadius: 10,
};

export default function SettingsPage({ settings, setSettings }) {
  const [local, setLocal] = useState(settings);
  const save = () => setSettings(local);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="section-title">Settings</div>
        <div className="section-subtitle">Policy controls and notification preferences</div>
      </div>

      <div style={{ ...panel, padding: "16px 18px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 14 }}>Decision Thresholds</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Slider
            label="Block threshold"
            value={local.blockThreshold}
            min={0.5}
            max={0.99}
            color="#dc2626"
            onChange={(v) => setLocal({ ...local, blockThreshold: v })}
          />
          <Slider
            label="MFA threshold"
            value={local.mfaThreshold}
            min={0.1}
            max={0.8}
            color="#d97706"
            onChange={(v) => setLocal({ ...local, mfaThreshold: v })}
          />
        </div>
      </div>

      <div style={{ ...panel, padding: "16px 18px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>Notifications & Automation</div>
        <ToggleRow label="Auto-block high-risk decisions" value={local.autoBlock} onToggle={(v) => setLocal({ ...local, autoBlock: v })} />
        <ToggleRow label="Email alerts" value={local.emailAlerts} onToggle={(v) => setLocal({ ...local, emailAlerts: v })} />
        <ToggleRow label="SMS alerts" value={local.smsAlerts} onToggle={(v) => setLocal({ ...local, smsAlerts: v })} />
      </div>

      <button
        onClick={save}
        style={{
          width: "fit-content",
          border: "1px solid #f97316",
          background: "#fff7ed",
          color: "#c2410c",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          padding: "9px 14px",
          cursor: "pointer",
        }}
      >
        Save settings
      </button>
    </div>
  );
}

function Slider({ label, value, min, max, color, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: "#64748b", marginBottom: 7, display: "block" }}>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 6 }}>{Number(value).toFixed(2)}</div>
    </div>
  );
}

function ToggleRow({ label, value, onToggle }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #edf0f3", padding: "11px 0" }}>
      <span style={{ fontSize: 13, color: "#334155" }}>{label}</span>
      <button
        onClick={() => onToggle(!value)}
        style={{
          width: 42,
          height: 24,
          borderRadius: 999,
          border: "1px solid #d4d9e0",
          background: value ? "#22c55e" : "#fff",
          position: "relative",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 21 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: value ? "#fff" : "#94a3b8",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}
