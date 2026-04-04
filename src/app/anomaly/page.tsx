'use client';

import { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getAnomalyData } from '@/lib/simulator';
import { Card, CustomTooltip } from '@/components/ui';

export default function AnomalyPage() {
  const [data, setData]         = useState<{ x: number; y: number; type: string }[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const d = getAnomalyData();
    setTimeout(() => { setData(d); setLoading(false); }, 400);
  }, []);

  const normal  = data.filter(d => d.type === 'normal');
  const anomaly = data.filter(d => d.type === 'anomaly');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black grad-text">Anomaly Detection</h1>
        <p className="text-gray-500 text-sm mt-0.5">Isolation Forest & One-Class SVM unsupervised detection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Samples',    val: data.length, color: '#00d4ff' },
          { label: 'Normal',           val: normal.length, color: '#00ff88' },
          { label: 'Anomalies Found',  val: anomaly.length, color: '#ff3c5c' },
          { label: 'Anomaly Rate',     val: data.length ? `${((anomaly.length/data.length)*100).toFixed(1)}%` : '0%', color: '#ffd60a' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Scatter plot */}
      <Card title="Transaction Scatter — Amount vs Isolation Score">
        {loading ? (
          <div className="h-[320px] flex items-center justify-center">
            <div className="animate-spin w-10 h-10 rounded-full border-2 border-white/10 border-t-cyan-400" />
          </div>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: -10 }}>
                <XAxis dataKey="x" type="number" name="Amount (₹)" tick={{ fill: '#4a5570', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
                <YAxis dataKey="y" type="number" name="Anomaly Score" domain={[0, 100]} tick={{ fill: '#4a5570', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ strokeDasharray: '4 4', stroke: 'rgba(0,212,255,0.2)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="custom-tooltip">
                        <p style={{ color: d.type === 'anomaly' ? '#ff3c5c' : '#00ff88' }} className="font-bold capitalize">{d.type}</p>
                        <p className="text-xs text-gray-400">Amount: ₹{Math.round(d.x).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Score: {Math.round(d.y)}</p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={60} stroke="#ffd60a" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: 'Alert Threshold', fill: '#ffd60a', fontSize: 10, position: 'right' }} />
                <Scatter name="Normal"  data={normal}  fill="#00d4ff" opacity={0.55} r={3} />
                <Scatter name="Anomaly" data={anomaly} fill="#ff3c5c" opacity={0.9}  r={6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-6 mt-3">
          {[
            { color: '#00d4ff', label: 'Normal Transactions', count: normal.length  },
            { color: '#ff3c5c', label: 'Anomalous Transactions', count: anomaly.length },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-full" style={{ background: l.color }} />
              {l.label} <span className="font-bold" style={{ color: l.color }}>({l.count})</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Algorithms info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            name: 'Isolation Forest',
            desc: 'Isolates anomalies by randomly partitioning features. Anomalies require fewer partitions.',
            score: 91.0, color: '#7b2fff',
          },
          {
            name: 'One-Class SVM',
            desc: 'Learns the boundary of normal data distribution. Anything outside the boundary = anomaly.',
            score: 88.4, color: '#00d4ff',
          },
          {
            name: 'Autoencoder',
            desc: 'Neural network that reconstructs input. High reconstruction error = anomaly signal.',
            score: 93.1, color: '#00ff88',
          },
        ].map(a => (
          <div key={a.name} className="p-5 rounded-2xl"
            style={{ background: 'rgba(13,18,36,0.85)', border: `1px solid ${a.color}25` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-sm text-white">{a.name}</p>
              <span className="text-lg font-black" style={{ color: a.color }}>{a.score}%</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{a.desc}</p>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full shimmer-bar" style={{ width: `${a.score}%`, background: a.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
