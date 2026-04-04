'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ShieldCheck, AlertTriangle, Activity, TrendingUp,
  Zap, BrainCircuit, CheckCircle, User, Globe, Smartphone,
  Bell, HelpCircle, Users, Swords, Settings, ChevronRight
} from 'lucide-react';
import {
  getDashboardMetrics, getHourlyTrend, getRiskDistribution,
  generateInitialAlerts, FraudAlert,
} from '@/lib/simulator';
import { StatCard, Card, SeverityBadge, CustomTooltip } from '@/components/ui';

const STATUS_COLORS: Record<string, string> = {
  'Approved': '#4caf50',
  'Flagged':  '#ffb300',
  'Blocked':  '#e53935',
  'OTP':      '#387ed1',
};
const pieData = [
  { name: 'Approved', value: 84.3 },
  { name: 'OTP',      value: 9.1  },
  { name: 'Flagged',  value: 4.5  },
  { name: 'Blocked',  value: 2.1  },
];

const NAV_BLOCKS = [
  { href: '/transactions',  icon: Activity,        label: 'Live Transactions', color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100', hover: 'hover:border-blue-300 hover:shadow-blue-100' },
  { href: '/risk-scoring',  icon: ShieldCheck,     label: 'Risk Scoring',      color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-100', hover: 'hover:border-purple-300 hover:shadow-purple-100' },
  { href: '/behavior',      icon: User,            label: 'Behavior Analysis', color: 'text-cyan-600',   bg: 'bg-cyan-50',    border: 'border-cyan-100', hover: 'hover:border-cyan-300 hover:shadow-cyan-100' },
  { href: '/rule-engine',   icon: Zap,             label: 'Rule Engine',       color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-100', hover: 'hover:border-yellow-300 hover:shadow-yellow-100' },
  { href: '/alerts',        icon: Bell,            label: 'Alerts',            color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-100', hover: 'hover:border-red-300 hover:shadow-red-100' },
  { href: '/ml-models',     icon: BrainCircuit,    label: 'ML Models',         color: 'text-pink-600',   bg: 'bg-pink-50',    border: 'border-pink-100', hover: 'hover:border-pink-300 hover:shadow-pink-100' },
  { href: '/anomaly',       icon: AlertTriangle,   label: 'Anomaly Detection', color: 'text-orange-600', bg: 'bg-orange-50',  border: 'border-orange-100', hover: 'hover:border-orange-300 hover:shadow-orange-100' },
  { href: '/geo-intel',     icon: Globe,           label: 'Geo-Intelligence',  color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-100',hover: 'hover:border-emerald-300 hover:shadow-emerald-100' },
  { href: '/device-ip',     icon: Smartphone,      label: 'Device & IP Intel', color: 'text-indigo-600', bg: 'bg-indigo-50',  border: 'border-indigo-100', hover: 'hover:border-indigo-300 hover:shadow-indigo-100' },
  { href: '/explainability',icon: HelpCircle,      label: 'Explainable AI',    color: 'text-teal-600',   bg: 'bg-teal-50',    border: 'border-teal-100', hover: 'hover:border-teal-300 hover:shadow-teal-100' },
  { href: '/attack-sim',    icon: Swords,          label: 'Attack Simulation', color: 'text-rose-600',   bg: 'bg-rose-50',    border: 'border-rose-100', hover: 'hover:border-rose-300 hover:shadow-rose-100' },
  { href: '/admin',         icon: Users,           label: 'Admin Panel',       color: 'text-gray-600',   bg: 'bg-gray-100',   border: 'border-gray-200', hover: 'hover:border-gray-300 hover:shadow-gray-100' },
  { href: '/settings',      icon: Settings,        label: 'Settings',          color: 'text-slate-600',  bg: 'bg-white',      border: 'border-gray-200', hover: 'hover:border-gray-300 hover:shadow-gray-100' },
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Select a module to view the full page and functionality</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">Systems Online</span>
        </div>
      </div>

      {/* Navigation Blocks Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-4 gap-3">
        {NAV_BLOCKS.map(block => {
          const Icon = block.icon;
          return (
            <Link key={block.href} href={block.href}>
              <div className={`p-4 rounded-xl border bg-white shadow-sm transition-all duration-200 cursor-pointer group flex flex-col h-full ${block.hover}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${block.bg} ${block.color} ${block.border} border`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                  {block.label}
                </h3>
                <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-gray-400 group-hover:text-blue-500 transition-colors uppercase tracking-wider">
                  Open Module <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats Separator */}
      <div className="pt-4 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Platform Telemetry</h2>
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
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hourly trend */}
        <div className="lg:col-span-2">
          <Card title="24-Hour Transaction Flow">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradTxn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#387ed1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#387ed1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradFraud" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e53935" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#e53935" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="transactions" stroke="#387ed1" strokeWidth={2} fill="url(#gradTxn)" name="Transactions" />
                  <Area type="monotone" dataKey="fraud"        stroke="#e53935" strokeWidth={2} fill="url(#gradFraud)" name="Fraud" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Decision pie */}
        <Card title="Decision Breakdown">
          <div className="h-[240px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 4, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full px-4 text-xs mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_COLORS[d.name] }} />
                    <span className="text-gray-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Risk distribution + alerts + system status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-8">
        {/* Risk distribution */}
        <Card title="Risk Score Distribution">
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDist} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="range" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="count" name="Transactions" radius={[2, 2, 0, 0]}>
                  {riskDist.map((_, i) => (
                    <Cell key={i} fill={i >= 7 ? '#e53935' : i >= 4 ? '#ffb300' : '#387ed1'}
                      fillOpacity={0.8 + i * 0.02} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live alerts */}
        <Card title="Recent Alerts" className="lg:col-span-1">
          <div className="space-y-3">
            {alerts.slice(0, 4).map(a => (
              <div key={a.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors cursor-pointer bg-white">
                <div className="mt-0.5"><SeverityBadge severity={a.severity} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 leading-tight truncate">{a.title}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {a.userId} · ₹{a.amount.toLocaleString()} · Score: <span className="text-red-600 font-bold">{a.riskScore}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System status */}
        <Card title="System Health">
          <div className="space-y-4 pt-1">
            {[
              { name: 'Rule Engine',       status: 'Online', color: '#4caf50', icon: <Zap className="w-4 h-4" />,          load: 34 },
              { name: 'XGBoost Model',     status: 'Online', color: '#4caf50', icon: <BrainCircuit className="w-4 h-4" />, load: 68 },
              { name: 'Anomaly Detector',  status: 'Online', color: '#4caf50', icon: <AlertTriangle className="w-4 h-4" />,load: 45 },
              { name: 'Risk Scorer',       status: 'Online', color: '#4caf50', icon: <ShieldCheck className="w-4 h-4" />,  load: 52 },
              { name: 'Alert System',      status: 'Online', color: '#4caf50', icon: <Activity className="w-4 h-4" />,     load: 21 },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-[#387ed1]">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-700 font-medium">{s.name}</span>
                    <span className="font-bold text-gray-900">{s.load}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.load}%`, background: '#387ed1' }} />
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
