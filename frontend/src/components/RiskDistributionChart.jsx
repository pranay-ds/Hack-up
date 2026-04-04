import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

export default function RiskDistributionChart({ transactions }) {
  const data = useMemo(() => {
    const buckets = [
      { range: "0.0-0.2", count: 0 }, { range: "0.2-0.4", count: 0 },
      { range: "0.4-0.6", count: 0 }, { range: "0.6-0.8", count: 0 },
      { range: "0.8-1.0", count: 0 },
    ];
    transactions.forEach(t => {
      const s = t.risk_score;
      if (s < 0.2) buckets[0].count++;
      else if (s < 0.4) buckets[1].count++;
      else if (s < 0.6) buckets[2].count++;
      else if (s < 0.8) buckets[3].count++;
      else buckets[4].count++;
    });
    return buckets;
  }, [transactions]);

  const colors = ["#4ade80", "#4ade80", "#fbbf24", "#f87171", "#ef4444"];

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ fontSize: 10, color: "#ccc", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Risk Score Distribution</div>
      </div>
      <div style={{ height: 200, padding: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#ccc" }} axisLine={{ stroke: "#555" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#ccc" }} axisLine={{ stroke: "#555" }} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #444", borderRadius: 4, fontSize: 11, color: "#eee" }} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#ccc" }} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} animationDuration={300}>
              {data.map((entry, i) => <Cell key={i} fill={colors[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
