'use client';

import { useEffect, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Hub',
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
  const router = useRouter();
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

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-[64px] bg-white border-b border-gray-200 shadow-sm">
      {/* Left: Chrome-like Controls & Branding */}
      <div className="flex items-center gap-4">
        {/* Browser Nav Buttons */}
        <div className="flex items-center gap-1.5 mr-2 text-gray-500">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => router.forward()} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => router.push('/')} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors ml-1 active:bg-gray-200" title="Home Hub">
            <Home className="w-4 h-4" />
          </button>
        </div>

        <span className="font-bold text-lg text-gray-800 tracking-tight">
          <span className="text-[#387ed1]">FFDS</span> Core
        </span>
        <div className="w-px h-6 bg-gray-200" />
        <span className="text-gray-600 font-medium text-sm bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{currentLabel}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6 text-sm">
        {/* Quick Links */}
        <nav className="flex items-center gap-5 text-gray-500 font-medium hidden md:flex">
          <button onClick={() => router.push('/')} className="hover:text-gray-900 transition-colors">Hub</button>
          <button onClick={() => router.push('/alerts')} className="hover:text-gray-900 transition-colors relative">
            Alerts
            <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={() => router.push('/settings')} className="hover:text-gray-900 transition-colors">Settings</button>
        </nav>

        <div className="flex items-center gap-3">
          {/* Clock */}
          <span className="text-gray-500 tabular-nums text-[13px] font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{time}</span>

          <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <button className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#387ed1] hover:bg-blue-100 font-bold text-xs transition-colors shadow-sm">
            OM
          </button>
        </div>
      </div>
    </header>
  );
}
