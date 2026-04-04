import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4ade80", "#f87171", "#fbbf24"];

export default function FraudPieChart({ transactions }) {
  const data = useMemo(() => {
    const counts = { APPROVE: 0, BLOCK: 0, MFA: 0 };
    transactions.forEach(t => { counts[t.decision] = (counts[t.decision] || 0) + 1; });
    return [
      { name: "Approved", value: counts.APPROVE },
      { name: "Blocked", value: counts.BLOCK },
      { name: "MFA", value: counts.MFA },
    ];
  }, [transactions]);

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ fontSize: 10, color: "#ccc", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Decision Distribution</div>
      </div>
      <div style={{ height: 200, padding: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} animationDuration={300}>
              {data.map((entry, i) => <Cell key={i} fill={COLORS[i]} stroke="#111" strokeWidth={2} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #444", borderRadius: 4, fontSize: 11, color: "#eee" }} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#ccc" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
