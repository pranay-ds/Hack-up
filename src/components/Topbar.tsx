'use client';

import { useEffect, useState } from 'react';
import { Bell, ShieldAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Live Transactions',
  '/risk-scoring': 'Risk Scoring',
  '/behavior': 'Behavior Analysis',
  '/geo-intel': 'Geo-Intelligence',
  '/device-ip': 'Device & IP Intel',
  '/rule-engine': 'Rule Engine',
  '/ml-models': 'ML Models',
  '/anomaly': 'Anomaly Detection',
  '/alerts': 'Alerts',
  '/explainability': 'Explainable AI',
  '/admin': 'Admin Panel',
  '/attack-sim': 'Attack Simulation',
  '/settings': 'Settings',
};

const THREAT_LEVELS = [
  { label: 'LOW',      color: 'text-green-400',  dot: 'bg-green-400' },
  { label: 'MODERATE', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  { label: 'HIGH',     color: 'text-orange-400', dot: 'bg-orange-400' },
  { label: 'CRITICAL', color: 'text-red-500',    dot: 'bg-red-500' },
];

export function Topbar() {
  const pathname  = usePathname();
  const [time, setTime] = useState('');
  const [threat] = useState(1); // 0=low,1=moderate,2=high,3=critical

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const currentLabel  = PAGE_LABELS[pathname] ?? 'Dashboard';
  const threatLevel   = THREAT_LEVELS[threat];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 border-b h-[56px]"
      style={{
        background: 'rgba(7,10,20,0.82)',
        borderColor: 'rgba(0,212,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">FFDS</span>
        <svg className="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span className="text-cyan-400 font-semibold">{currentLabel}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <span className="mono text-xs text-gray-500 tabular-nums">{time}</span>

        <div className="w-px h-4 bg-white/10" />

        {/* Threat level */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${threatLevel.dot} pulse-yellow`} />
          <span className="text-gray-400">Threat: <span className={`font-bold ${threatLevel.color}`}>{threatLevel.label}</span></span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Alert icon */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all border border-white/5 hover:border-cyan-400/30">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">8</span>
        </button>

        {/* Shield status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Protected</span>
        </div>
      </div>
    </header>
  );
}
