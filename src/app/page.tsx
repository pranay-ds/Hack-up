'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ShieldCheck, AlertTriangle, Activity, TrendingUp,
  Zap, BrainCircuit, CheckCircle, XCircle,
} from 'lucide-react';
import {
  getDashboardMetrics, getHourlyTrend, getRiskDistribution,
  generateInitialAlerts, FraudAlert,
} from '@/lib/simulator';
import { StatCard, Card, SeverityBadge, CustomTooltip } from '@/components/ui';

const COLORS = ['#00d4ff', '#00ff88', '#7b2fff', '#ff3c5c', '#ffd60a'];
const STATUS_COLORS: Record<string, string> = {
  'Approved': '#00ff88',
  'Flagged':  '#ffd60a',
  'Blocked':  '#ff3c5c',
  'OTP':      '#00d4ff',
};
const pieData = [
  { name: 'Approved', value: 84.3 },
  { name: 'OTP',      value: 9.1  },
  { name: 'Flagged',  value: 4.5  },
  { name: 'Blocked',  value: 2.1  },
];

export default function DashboardPage() {
  const metrics   = getDashboardMetrics();
  const hourly    = getHourlyTrend();
  const riskDist  = getRiskDistribution();
  const [alerts, setAlerts]   = useState<FraudAlert[]>([]);
  const [count, setCount]     = useState(metrics.totalTransactions);

  useEffect(() => {
    setAlerts(generateInitialAlerts().slice(0, 5));
    const id = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 4 + 1));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black grad-text tracking-tight">Command Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time fraud intelligence overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
          style={{ background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.15)', color: '#00ff88' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 pulse-green" />
          Live monitoring active
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Transactions" value={count.toLocaleString()} sub="↑ 12% vs yesterday" subColor="green" accent="cyan"
          icon={<Activity className="w-5 h-5" />} />
        <StatCard label="Fraud Detected" value={metrics.fraudDetected.toLocaleString()} sub="↑ 3 new alerts" subColor="red" accent="red"
          icon={<AlertTriangle className="w-5 h-5" />} />
        <StatCard label="Fraud Rate" value={`${metrics.fraudRate}%`} sub="↓ 0.4% from last week" subColor="green" accent="yellow"
          icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard label="Amount Saved" value={metrics.amountSaved} sub="Prevented losses" subColor="green" accent="green"
          icon={<ShieldCheck className="w-5 h-5" />} />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly trend */}
        <div className="lg:col-span-2">
          <Card title="24-Hour Transaction Flow">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradTxn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="gradFraud" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff3c5c" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#ff3c5c" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" tick={{ fill: '#4a5570', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis tick={{ fill: '#4a5570', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="transactions" stroke="#00d4ff" strokeWidth={2} fill="url(#gradTxn)" name="Transactions" />
                  <Area type="monotone" dataKey="fraud"        stroke="#ff3c5c" strokeWidth={2} fill="url(#gradFraud)" name="Fraud" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Decision pie */}
        <Card title="Decision Breakdown">
          <div className="h-[220px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="160">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full text-xs">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
                  <span className="text-gray-400">{d.name}</span>
                  <span className="ml-auto font-bold" style={{ color: STATUS_COLORS[d.name] }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Risk distribution + alerts + system status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk distribution */}
        <Card title="Risk Score Distribution">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDist} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                <XAxis dataKey="range" tick={{ fill: '#4a5570', fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4a5570', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]}>
                  {riskDist.map((_, i) => (
                    <Cell key={i} fill={i >= 7 ? '#ff3c5c' : i >= 4 ? '#ffd60a' : '#00d4ff'}
                      fillOpacity={0.7 + i * 0.03} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live alerts */}
        <Card title="Live Fraud Alerts" className="lg:col-span-1">
          <div className="space-y-2">
            {alerts.slice(0, 4).map(a => (
              <div key={a.id}
                className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5 cursor-pointer"
                style={{ border: '1px solid rgba(0,212,255,0.07)' }}>
                <div className="mt-0.5"><SeverityBadge severity={a.severity} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-bold leading-tight truncate">{a.title}</p>
                  <p className="text-[10.5px] text-gray-500 mt-0.5">
                    {a.userId} · ₹{a.amount.toLocaleString()} · Score: <span className="text-red-400 font-bold">{a.riskScore}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System status */}
        <Card title="System Health">
          <div className="space-y-3">
            {[
              { name: 'Rule Engine',       status: 'Online', color: '#00ff88', icon: <Zap className="w-4 h-4" />,          load: 34 },
              { name: 'XGBoost Model',     status: 'Online', color: '#00ff88', icon: <BrainCircuit className="w-4 h-4" />, load: 68 },
              { name: 'Anomaly Detector',  status: 'Online', color: '#00ff88', icon: <AlertTriangle className="w-4 h-4" />,load: 45 },
              { name: 'Risk Scorer',       status: 'Online', color: '#00ff88', icon: <ShieldCheck className="w-4 h-4" />,  load: 52 },
              { name: 'Alert System',      status: 'Online', color: '#00ff88', icon: <Activity className="w-4 h-4" />,     load: 21 },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#00d4ff]"
                  style={{ background: 'rgba(0,212,255,0.1)' }}>
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-medium">{s.name}</span>
                    <span className="font-bold" style={{ color: s.color }}>{s.load}%</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full shimmer-bar" style={{ width: `${s.load}%` }} />
                  </div>
                </div>
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
