import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceDot } from "recharts";

const UPDATE_MS = 1000;
const MAX_POINTS = 45;

function fmtTime(ts) {
  const d = new Date(ts);
  return `${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function estimateDecisionRates(transactions, nowTs) {
  const recent = transactions.filter((t) => new Date(t.timestamp).getTime() >= nowTs - 60_000);
  const rates = { approved: 0, blocked: 0, mfa: 0 };
  recent.forEach((t) => {
    if (t.decision === "APPROVE") rates.approved += 1;
    else if (t.decision === "BLOCK") rates.blocked += 1;
    else rates.mfa += 1;
  });
  return rates;
}

function seedSeries(transactions) {
  const now = Date.now();
  const base = estimateDecisionRates(transactions, now);
  const rows = [];
  for (let i = MAX_POINTS - 1; i >= 0; i--) {
    const ts = now - i * UPDATE_MS;
    rows.push({
      ts,
      time: fmtTime(ts),
      approved: Math.max(0, base.approved + Math.round((Math.random() - 0.5) * 4)),
      blocked: Math.max(0, base.blocked + Math.round((Math.random() - 0.5) * 2)),
      mfa: Math.max(0, base.mfa + Math.round((Math.random() - 0.5) * 2)),
    });
  }
  return rows;
}

export default function FraudTrendChart({ transactions }) {
  const txRef = useRef(transactions);
  const [data, setData] = useState(() => seedSeries(transactions));

  useEffect(() => {
    txRef.current = transactions;
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0 && data.length === 0) {
      setData(seedSeries(transactions));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const base = estimateDecisionRates(txRef.current, now);
      const blockSpike = Math.random() < 0.08 ? Math.round(4 + Math.random() * 8) : 0;
      const mfaSpike = Math.random() < 0.1 ? Math.round(3 + Math.random() * 6) : 0;

      const next = {
        ts: now,
        time: fmtTime(now),
        approved: Math.max(0, base.approved + Math.round((Math.random() - 0.5) * 4)),
        blocked: Math.max(0, base.blocked + Math.round((Math.random() - 0.5) * 3) + blockSpike),
        mfa: Math.max(0, base.mfa + Math.round((Math.random() - 0.5) * 3) + mfaSpike),
      };

      setData((prev) => [...prev.slice(-(MAX_POINTS - 1)), next]);
    }, UPDATE_MS);

    return () => clearInterval(timer);
  }, []);

  const latest = data[data.length - 1];
  const latestBlockedIsHigh = latest ? latest.blocked >= Math.max(6, latest.approved * 0.35) : false;

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, color: "#ccc", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Decision Trends</div>
        {latest && (
          <div style={{ fontSize: 9, color: latestBlockedIsHigh ? "#f87171" : "#888", fontFamily: "'SF Mono', monospace" }}>
            now A:{latest.approved} B:{latest.blocked} M:{latest.mfa}
          </div>
        )}
      </div>
      <div style={{ height: 200, padding: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.length > 0 ? data : [{ time: "00:00", approved: 0, blocked: 0, mfa: 0 }]}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#aaa" }} axisLine={{ stroke: "#444" }} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#aaa" }} axisLine={{ stroke: "#444" }} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #444", borderRadius: 4, fontSize: 11, color: "#eee" }} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#ccc" }} />
            <Line type="monotone" dataKey="approved" stroke="#4ade80" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={320} style={{ filter: "drop-shadow(0 0 6px rgba(74,222,128,0.35))" }} />
            <Line type="monotone" dataKey="blocked" stroke="#f87171" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={320} style={{ filter: "drop-shadow(0 0 6px rgba(248,113,113,0.35))" }} />
            <Line type="monotone" dataKey="mfa" stroke="#fbbf24" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={320} style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.35))" }} />
            {latest && <ReferenceDot x={latest.time} y={latest.blocked} r={3} fill="#f87171" stroke="#0a0a0a" strokeWidth={1} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
