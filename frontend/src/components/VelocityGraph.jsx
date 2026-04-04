import { useEffect, useMemo, useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, ReferenceDot, Scatter } from "recharts";

const SPIKE_THRESHOLD = 1.5;
const WINDOW_SECONDS = 60;
const UPDATE_MS = 1000;
const MAX_POINTS = 45;

function fmtTime(ts) {
  const d = new Date(ts);
  return `${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function estimateTxPerMinute(transactions, nowTs) {
  const recent = transactions.filter((t) => new Date(t.timestamp).getTime() >= nowTs - WINDOW_SECONDS * 1000);
  return recent.length;
}

function seedSeries(transactions) {
  const now = Date.now();
  const base = Math.max(1, estimateTxPerMinute(transactions, now));
  const items = [];
  for (let i = MAX_POINTS - 1; i >= 0; i--) {
    const ts = now - i * UPDATE_MS;
    const noise = Math.round((Math.random() - 0.5) * 4);
    const value = Math.max(0, base + noise);
    items.push({ ts, time: fmtTime(ts), velocity: value });
  }
  return items;
}

export default function VelocityGraph({ transactions }) {
  const txRef = useRef(transactions);
  const [data, setData] = useState(() => seedSeries(transactions));

  useEffect(() => {
    txRef.current = transactions;
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0 && data.every((d) => d.velocity === data[0].velocity)) {
      setData(seedSeries(transactions));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const base = estimateTxPerMinute(txRef.current, now);
      const noise = Math.round((Math.random() - 0.5) * 6);
      const spike = Math.random() < 0.08 ? Math.round(base * (0.35 + Math.random() * 0.7)) : 0;
      const nextValue = Math.max(0, base + noise + spike);

      setData((prev) => {
        const next = [...prev.slice(-(MAX_POINTS - 1)), { ts: now, time: fmtTime(now), velocity: nextValue }];
        return next;
      });
    }, UPDATE_MS);

    return () => clearInterval(timer);
  }, []);

  const { avg, currentVelocity, spikeCount, maxVelocity } = useMemo(() => {
    const avg = data.length > 0 ? data.reduce((s, v) => s + v.velocity, 0) / data.length : 0;
    const maxVelocity = data.length > 0 ? Math.max(...data.map((v) => v.velocity)) : 0;
    const spikeCount = data.filter((v) => v.velocity > avg * SPIKE_THRESHOLD && avg > 0).length;
    const currentVelocity = data.length > 0 ? data[data.length - 1].velocity : 0;
    return { avg, currentVelocity, spikeCount, maxVelocity };
  }, [data]);

  const spikeThreshold = avg * SPIKE_THRESHOLD;
  const isSpiking = currentVelocity > spikeThreshold && avg > 0;
  const latest = data[data.length - 1];
  const spikePoints = data.filter((d) => d.velocity > spikeThreshold && avg > 0);

  return (
    <div style={{ background: "#111", border: `1px solid ${isSpiking ? "rgba(239,68,68,0.3)" : "#1a1a1a"}`, borderRadius: 6, overflow: "hidden", transition: "border-color 0.3s" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Transaction Velocity</div>
          {isSpiking && (
            <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 2, color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", animation: "pulse 1s ease-in-out infinite", letterSpacing: 0.5 }}>
              ⚡ SPIKE
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Current</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: isSpiking ? "#ef4444" : "#4ade80" }}>{currentVelocity}</div>
          </div>
          <div style={{ width: 1, height: 24, background: "#1a1a1a" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Avg</div>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'SF Mono', monospace", color: "#fbbf24" }}>{avg.toFixed(1)}</div>
          </div>
          {spikeCount > 0 && (
            <>
              <div style={{ width: 1, height: 24, background: "#1a1a1a" }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Spikes</div>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'SF Mono', monospace", color: "#ef4444" }}>{spikeCount}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 210, padding: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.length > 0 ? data : [{ time: "00", velocity: 0 }]}>
            <defs>
              <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isSpiking ? "#ef4444" : "#4ade80"} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isSpiking ? "#ef4444" : "#4ade80"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#999" }} axisLine={{ stroke: "#444" }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: "#999" }} axisLine={{ stroke: "#444" }} tickLine={false} domain={[0, Math.max(maxVelocity + 1, avg * 2.5, 5)]} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #444", borderRadius: 4, fontSize: 11, color: "#ddd" }} formatter={(value) => [`${value} tx/min`, "Velocity"]} labelFormatter={(label) => `Time: ${label}`} />
            {avg > 0 && <ReferenceLine y={avg} stroke="#fbbf24" strokeDasharray="4 3" strokeWidth={2} label={{ value: `avg ${avg.toFixed(1)} tx/min`, position: "insideTopRight", fill: "#fbbf24", fontSize: 9 }} />}
            {spikeThreshold > 0 && avg > 0 && <ReferenceLine y={spikeThreshold} stroke="#ef4444" strokeDasharray="2 2" strokeWidth={2} label={{ value: `spike`, position: "insideBottomRight", fill: "#ef4444", fontSize: 8 }} />}
            <Area type="monotone" dataKey="velocity" stroke={isSpiking ? "#ef4444" : "#4ade80"} strokeWidth={2.5} fill="url(#velGrad)" dot={false} animationDuration={350} isAnimationActive style={{ filter: isSpiking ? "drop-shadow(0 0 8px rgba(239,68,68,0.5))" : "drop-shadow(0 0 6px rgba(74,222,128,0.45))" }} />
            {latest && <ReferenceDot x={latest.time} y={latest.velocity} r={4} fill={isSpiking ? "#ef4444" : "#4ade80"} stroke="#0a0a0a" strokeWidth={2} />}
            {spikePoints.length > 0 && <Scatter data={spikePoints} xAxisId={0} yAxisId={0} fill="#ef4444" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ borderTop: "1px solid #1a1a1a", padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, color: "#555" }}>Window: {WINDOW_SECONDS}s rolling · update: {UPDATE_MS / 1000}s</div>
        <div style={{ display: "flex", gap: 12, fontSize: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 10, height: 2, background: "#4ade80", borderRadius: 1, display: "inline-block" }} />Normal</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 10, height: 2, background: "#fbbf24", borderRadius: 1, display: "inline-block" }} />Baseline</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 10, height: 2, background: "#ef4444", borderRadius: 1, display: "inline-block" }} />Spike</span>
        </div>
      </div>
    </div>
  );
}
