'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, AlertTriangle, Activity, Zap, ShieldCheck } from 'lucide-react';

type TickerItem = {
  id: number;
  type: 'fraud' | 'approved' | 'flagged' | 'alert' | 'metric';
  icon: React.ReactNode;
  text: string;
  color: string;
  bg: string;
};

const genId = () => Math.random() * 1e9 | 0;

function generateItem(): TickerItem {
  const rand = Math.random();
  const userId = `USR-${(Math.random() * 9000 + 1000 | 0)}`;
  const amount = (Math.random() * 150000 + 500 | 0).toLocaleString('en-IN');
  const bank  = ['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB'][Math.random() * 6 | 0];
  const score = (Math.random() * 100 | 0);

  if (rand < 0.2) return {
    id: genId(), type: 'fraud',
    icon: <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />,
    text: `🚨 FRAUD BLOCKED · ${userId} · ₹${amount} · ${bank} · Risk ${score}`,
    color: '#e53935', bg: '#fef2f2',
  };
  if (rand < 0.4) return {
    id: genId(), type: 'flagged',
    icon: <Zap className="w-3.5 h-3.5 flex-shrink-0" />,
    text: `⚠ FLAGGED · ${userId} · ₹${amount} · Score ${score} · OTP Triggered`,
    color: '#ffb300', bg: '#fffbeb',
  };
  if (rand < 0.65) return {
    id: genId(), type: 'approved',
    icon: <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />,
    text: `✓ APPROVED · ${userId} · ₹${amount} · ${bank} · Score ${score}`,
    color: '#4caf50', bg: '#f0fdf4',
  };
  if (rand < 0.8) return {
    id: genId(), type: 'alert',
    icon: <Activity className="w-3.5 h-3.5 flex-shrink-0" />,
    text: `⚡ ALERT · Velocity spike on ${bank} channel · ${(Math.random()*30+5|0)} txns/min`,
    color: '#387ed1', bg: '#eff6ff',
  };
  const metrics = [
    `📊 Model accuracy: ${(98.1 + Math.random()*0.8).toFixed(2)}%`,
    `🔒 Threats blocked today: ${(Math.random()*500+100|0)}`,
    `⚡ Avg response time: ${(Math.random()*5+2).toFixed(1)}ms`,
    `📡 Active monitors: ${(Math.random()*20+40|0)} nodes`,
  ];
  return {
    id: genId(), type: 'metric',
    icon: <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />,
    text: metrics[Math.random() * metrics.length | 0],
    color: '#8b5cf6', bg: '#f5f3ff',
  };
}

export function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setItems(Array.from({ length: 20 }, generateItem));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    intervalRef.current = setInterval(() => {
      if (!paused) {
        setItems(prev => [generateItem(), ...prev].slice(0, 40));
      }
    }, 2200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, mounted]);

  if (!mounted) {
    return (
      <div className="relative overflow-hidden rounded-lg flex items-center bg-white border border-gray-200 shadow-sm" style={{ height: '40px' }}>
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 border-r border-gray-100 h-full z-10 select-none bg-gray-50">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
          <span className="text-xs font-bold tracking-widest text-gray-700">LIVE</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg flex items-center bg-white border border-gray-200 shadow-sm"
      style={{ height: '40px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* LIVE pill */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 border-r border-gray-100 h-full z-10 select-none bg-gray-50">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
        <span className="text-xs font-bold tracking-widest text-gray-700">LIVE</span>
      </div>

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 h-full w-8 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #ffffff, transparent)' }} />
        <div className="absolute right-0 top-0 h-full w-8 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(270deg, #ffffff, transparent)' }} />

        <div
          className="flex items-center gap-6 whitespace-nowrap"
          style={{
            animation: paused ? 'none' : 'ticker-scroll 60s linear infinite',
            paddingLeft: '16px',
            transform: 'translateZ(0)',
          }}
        >
          {/* Duplicate for seamless loop */}
          {[...items, ...items].map((item, idx) => (
            <span key={`${item.id}-${idx}`}
              className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded"
              style={{ color: item.color, background: item.bg }}>
              {item.icon}
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* Pause indicator */}
      {paused && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-white px-1 uppercase tracking-wider select-none z-20">
          PAUSED
        </div>
      )}

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
