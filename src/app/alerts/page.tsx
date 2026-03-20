'use client';

import { useEffect, useState } from 'react';
import { generateAlert, generateInitialAlerts, FraudAlert } from '@/lib/simulator';
import { Card, SeverityBadge } from '@/components/ui';
import { Bell, Check, AlertTriangle } from 'lucide-react';

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

export default function AlertsPage() {
  const [alerts, setAlerts]   = useState<FraudAlert[]>([]);
  const [filter, setFilter]   = useState<string>('all');

  useEffect(() => {
    setAlerts(generateInitialAlerts());
    const id = setInterval(() => {
      const severities: Array<'critical'|'high'|'medium'|'low'> = ['critical','high','medium','low'];
      const weights = [0.15, 0.25, 0.35, 0.25];
      const r = Math.random();
      let cum = 0, sev: 'critical'|'high'|'medium'|'low' = 'low';
      for (let i = 0; i < weights.length; i++) { cum += weights[i]; if (r < cum) { sev = severities[i]; break; } }
      setAlerts(prev => [generateAlert(sev), ...prev].slice(0, 40));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const ack = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));

  const filtered = filter === 'all' ? alerts : filter === 'unacked' ? alerts.filter(a => !a.acknowledged) : alerts.filter(a => a.severity === filter);

  const counts = {
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    high:     alerts.filter(a => a.severity === 'high'     && !a.acknowledged).length,
    medium:   alerts.filter(a => a.severity === 'medium'   && !a.acknowledged).length,
    low:      alerts.filter(a => a.severity === 'low'      && !a.acknowledged).length,
  };

  const sevBorderColors: Record<string, string> = {
    critical: 'rgba(255,60,92,0.35)', high: 'rgba(255,140,66,0.35)',
    medium: 'rgba(255,214,10,0.3)', low: 'rgba(0,212,255,0.2)',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black grad-text">Alert System</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live fraud alerts — auto-updating every 4 seconds</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-semibold"
          style={{ background: 'rgba(255,60,92,0.1)', border: '1px solid rgba(255,60,92,0.25)', color: '#ff3c5c' }}>
          <span className="w-2 h-2 rounded-full bg-red-500 pulse-red" />
          LIVE · {alerts.filter(a => !a.acknowledged).length} unacknowledged
        </div>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-4 gap-3">
        {([['critical','#ff3c5c'],['high','#ff8c42'],['medium','#ffd60a'],['low','#00d4ff']] as const).map(([sev, color]) => (
          <button key={sev} onClick={() => setFilter(sev === filter as string ? 'all' : sev)}
            className="p-4 rounded-xl text-center transition-all hover:-translate-y-0.5"
            style={{
              background: filter === sev ? `${color}15` : 'rgba(13,18,36,0.85)',
              border: `1px solid ${filter === sev ? color + '44' : 'rgba(0,212,255,0.1)'}`,
            }}>
            <p className="text-xl font-black" style={{ color }}>{counts[sev]}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider capitalize mt-1">{sev}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all','unacked','critical','high','medium','low'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
              filter === f ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-200'
            }`}
            style={filter === f
              ? { background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Alert feed */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-600">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No alerts match this filter</p>
          </div>
        )}
        {filtered.map((a, i) => (
          <div key={a.id}
            className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${i === 0 ? 'animate-fade-up' : ''} ${a.acknowledged ? 'opacity-45' : ''}`}
            style={{
              background: 'rgba(13,18,36,0.85)',
              border: `1px solid rgba(0,212,255,0.08)`,
              borderLeft: `3px solid ${a.severity === 'critical' ? '#ff3c5c' : a.severity === 'high' ? '#ff8c42' : a.severity === 'medium' ? '#ffd60a' : '#00d4ff'}`,
            }}>
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: a.severity === 'critical' ? 'rgba(255,60,92,0.12)' : a.severity === 'high' ? 'rgba(255,140,66,0.12)' : a.severity === 'medium' ? 'rgba(255,214,10,0.1)' : 'rgba(0,212,255,0.1)',
                color: a.severity === 'critical' ? '#ff3c5c' : a.severity === 'high' ? '#ff8c42' : a.severity === 'medium' ? '#ffd60a' : '#00d4ff',
              }}>
              <AlertTriangle className="w-5 h-5" />
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <SeverityBadge severity={a.severity} />
                <span className="font-bold text-sm text-white truncate">{a.title}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{a.description}</p>
              <div className="flex gap-4 text-[11px] text-gray-600 flex-wrap">
                <span>User: <span className="mono text-gray-400">{a.userId}</span></span>
                <span>Amount: <span className="text-gray-300 font-semibold">₹{a.amount.toLocaleString()}</span></span>
                <span>Location: <span className="text-gray-400">{a.location}</span></span>
                <span>Risk: <span className="font-bold" style={{ color: a.riskScore >= 70 ? '#ff3c5c' : '#ffd60a' }}>{a.riskScore}</span></span>
                <span className="text-gray-600">{timeAgo(a.timestamp)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {!a.acknowledged && (
                <button onClick={() => ack(a.id)}
                  className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                  <Check className="w-3 h-3" /> Ack
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
