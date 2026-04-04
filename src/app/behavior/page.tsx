'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import { User } from 'lucide-react';
import { userProfiles, getBehaviorTimeline } from '@/lib/simulator';
import { Card, CustomTooltip, ProgressBar } from '@/components/ui';

const riskColors: Record<string, string> = {
  low: '#00ff88', medium: '#ffd60a', high: '#ff3c5c',
};
const statusStyles: Record<string, { color: string; bg: string; border: string }> = {
  'Normal':       { color: '#00ff88', bg: 'rgba(0,255,136,0.08)',  border: 'rgba(0,255,136,0.2)'  },
  'Flagged':      { color: '#ffd60a', bg: 'rgba(255,214,10,0.08)', border: 'rgba(255,214,10,0.2)' },
  'Blocked':      { color: '#ff3c5c', bg: 'rgba(255,60,92,0.1)',   border: 'rgba(255,60,92,0.25)' },
  'Under Review': { color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.2)'  },
};

export default function BehaviorPage() {
  const [selected, setSelected] = useState(userProfiles[1]);
  const timeline = getBehaviorTimeline(selected.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black grad-text">Behavioral Analysis</h1>
        <p className="text-gray-500 text-sm mt-0.5">User profiling, baseline deviations, and spending patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* User profile list */}
        <div className="space-y-3">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">User Profiles</p>
          {userProfiles.map(u => {
            const ss = statusStyles[u.status] ?? statusStyles.Normal;
            const isSelected = u.id === selected.id;
            return (
              <button key={u.id} onClick={() => setSelected(u)} className="w-full text-left"
              >
                <div className="p-4 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{
                    background: isSelected ? 'rgba(0,212,255,0.08)' : 'rgba(13,18,36,0.85)',
                    border: isSelected ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(0,212,255,0.08)',
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#00d4ff,#7b2fff)' }}>
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{u.name}</p>
                      <p className="mono text-[10px] text-gray-500">{u.id}</p>
                    </div>
                    <div className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                      style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                      {u.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs font-black text-white">₹{u.avgSpend.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-600">Avg Spend</p>
                    </div>
                    <div>
                      <p className="text-xs font-black" style={{ color: riskColors[u.riskLevel] }}>{u.riskLevel.toUpperCase()}</p>
                      <p className="text-[9px] text-gray-600">Risk</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-300 text-[9px]">{u.locations}</p>
                      <p className="text-[9px] text-gray-600">Location</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile header */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white"
                style={{ background: 'linear-gradient(135deg,#00d4ff,#7b2fff)' }}>
                {selected.name[0]}
              </div>
              <div>
                <h2 className="font-black text-lg text-white">{selected.name}</h2>
                <p className="mono text-xs text-gray-500">{selected.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">Active Hours: <span className="text-cyan-400 font-semibold">{selected.activeHours}</span></p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-black text-white">₹{selected.avgSpend.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Avg Transaction</p>
              </div>
            </div>

            {/* Behavior metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Consistency Score', value: selected.riskLevel === 'low' ? 88 : selected.riskLevel === 'medium' ? 54 : 12, color: '#00d4ff' },
                { label: 'Location Trust',    value: selected.riskLevel === 'low' ? 92 : selected.riskLevel === 'medium' ? 61 : 8,  color: '#00ff88' },
                { label: 'Device Trust',      value: selected.riskLevel === 'low' ? 95 : selected.riskLevel === 'medium' ? 72 : 5,  color: '#7b2fff' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] text-gray-500 mb-2">{m.label}</p>
                  <p className="text-xl font-black mb-1.5" style={{ color: m.color }}>{m.value}%</p>
                  <ProgressBar value={m.value} color={m.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Spending timeline */}
          <Card title={`30-Day Spending Pattern — ${selected.name}`}>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                  <defs>
                    <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#4a5570', fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fill: '#4a5570', fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={selected.avgSpend} stroke="#ffd60a" strokeDasharray="4 3" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="actual"   stroke="#00d4ff" strokeWidth={2} fill="url(#gradActual)" name="Actual Spend" />
                  <Area type="monotone" dataKey="baseline" stroke="#ffd60a" strokeWidth={1.5} strokeDasharray="4 3" fill="none" name="Baseline" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {selected.riskLevel !== 'low' && (
              <div className="mt-3 px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
                style={{ background: 'rgba(255,60,92,0.08)', border: '1px solid rgba(255,60,92,0.2)', color: '#ff3c5c' }}>
                ⚠️ Anomaly detected: Spending pattern significantly deviates from {selected.name}&apos;s historical baseline
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
