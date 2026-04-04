import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceDot } from "recharts";

const UPDATE_MS = 1500;
const MAX_POINTS = 48;

export default function AdaptiveLearningPanel({ modelMetrics }) {
  const { accuracy, drift, history } = modelMetrics;
  const [streamHistory, setStreamHistory] = useState(() => {
    if (history && history.length > 0) {
      return history.slice(-MAX_POINTS).map((h, i) => ({ ...h, epoch: i }));
    }
    return Array.from({ length: 30 }, (_, i) => ({ epoch: i, accuracy: 0.8 + Math.random() * 0.08, drift: 0.03 + (Math.random() - 0.5) * 0.01 }));
  });

  useEffect(() => {
    if (history && history.length > 0) {
      setStreamHistory(history.slice(-MAX_POINTS).map((h, i) => ({ ...h, epoch: i })));
    }
  }, [history]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStreamHistory((prev) => {
        const last = prev[prev.length - 1] || { accuracy: accuracy || 0.85, drift: drift || 0.02, epoch: 0 };
        const nextAcc = Math.min(0.98, Math.max(0.72, last.accuracy + (Math.random() - 0.45) * 0.0035));
        const nextDrift = Math.min(0.08, Math.max(0.002, last.drift + (Math.random() - 0.55) * 0.0012));
        const next = { epoch: last.epoch + 1, accuracy: nextAcc, drift: nextDrift };
        return [...prev.slice(-(MAX_POINTS - 1)), next].map((p, i) => ({ ...p, epoch: i }));
      });
    }, UPDATE_MS);

    return () => clearInterval(timer);
  }, [accuracy, drift]);

  const latest = streamHistory[streamHistory.length - 1] || { accuracy: accuracy || 0, drift: drift || 0 };

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 10, color: "#ccc", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Adaptive Learning</div>
        <div style={{ display: "flex", gap: 12, fontSize: 9 }}>
          <span style={{ color: "#888" }}>Accuracy: <span style={{ color: "#4ade80", fontWeight: 600 }}>{(latest.accuracy * 100).toFixed(1)}%</span></span>
          <span style={{ color: "#888" }}>Drift: <span style={{ color: latest.drift < 0.02 ? "#4ade80" : "#f87171", fontWeight: 600 }}>{(latest.drift * 100).toFixed(2)}%</span></span>
        </div>
      </div>
      <div style={{ height: 180, padding: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={streamHistory}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="epoch" tick={{ fontSize: 9, fill: "#aaa" }} axisLine={{ stroke: "#444" }} tickLine={false} />
            <YAxis domain={[0.6, 1]} tick={{ fontSize: 9, fill: "#aaa" }} axisLine={{ stroke: "#444" }} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #444", borderRadius: 4, fontSize: 11, color: "#eee" }} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#ccc" }} />
            <Line type="monotone" dataKey="accuracy" stroke="#4ade80" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={320} style={{ filter: "drop-shadow(0 0 6px rgba(74,222,128,0.35))" }} />
            <Line type="monotone" dataKey="drift" stroke="#f87171" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={320} style={{ filter: "drop-shadow(0 0 6px rgba(248,113,113,0.35))" }} />
            {streamHistory.length > 0 && <ReferenceDot x={streamHistory[streamHistory.length - 1].epoch} y={streamHistory[streamHistory.length - 1].accuracy} r={3} fill="#4ade80" stroke="#0a0a0a" strokeWidth={1} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ borderTop: "1px solid #1a1a1a", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "Accuracy", value: `${(latest.accuracy * 100).toFixed(1)}%`, color: latest.accuracy > 0.85 ? "#4ade80" : "#fbbf24" },
          { label: "Drift", value: `${(latest.drift * 100).toFixed(2)}%`, color: latest.drift < 0.02 ? "#4ade80" : "#f87171" },
          { label: "Profiles", value: modelMetrics.total_profiles, color: "#60a5fa" },
          { label: "Active Threats", value: modelMetrics.active_rings + modelMetrics.active_chains, color: "#f87171" },
        ].map(m => (
          <div key={m.label} style={{ padding: "8px 12px", borderRight: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 8, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
