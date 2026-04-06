'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { Shield, Bell, BrainCircuit, Key, Lock, RefreshCcw, Server } from 'lucide-react';

type ToggleKey =
  | 'mfa' | 'otp' | 'rateLimit' | 'jwtExpiry' | 'emailAlerts'
  | 'dashboardNotif' | 'criticalOnly' | 'autoRetrain'
  | 'driftDetect' | 'autoBlock';

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    mfa:            true,
    otp:            true,
    rateLimit:      true,
    jwtExpiry:      true,
    emailAlerts:    true,
    dashboardNotif: true,
    criticalOnly:   false,
    autoRetrain:    true,
    driftDetect:    true,
    autoBlock:      true,
  });

  const toggle = (key: ToggleKey) => setToggles(p => ({ ...p, [key]: !p[key] }));

  const Toggle = ({ k, label, desc }: { k: ToggleKey; label: string; desc?: string }) => (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0"
      style={{ borderColor: 'rgba(0,212,255,0.07)' }}>
      <div>
        <p className="text-sm font-medium text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-600 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => toggle(k)}
        className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ml-4"
        style={{ background: toggles[k] ? '#00d4ff' : 'rgba(255,255,255,0.1)' }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
          style={{ left: toggles[k] ? 'calc(100% - 22px)' : '2px' }} />
      </button>
    </div>
  );

  const groups = [
    {
      icon: <Lock className="w-4 h-4" />, title: 'Authentication & Access Control',
      items: [
        { k: 'mfa' as ToggleKey,       label: 'Multi-Factor Authentication',  desc: 'Require MFA for all admin logins' },
        { k: 'otp' as ToggleKey,       label: 'OTP for Medium-Risk Transactions', desc: 'Trigger OTP for risk score 30–69' },
        { k: 'jwtExpiry' as ToggleKey, label: 'JWT Short Expiry (15 min)',    desc: 'Rotate access tokens frequently' },
        { k: 'rateLimit' as ToggleKey, label: 'API Rate Limiting',            desc: 'Block >100 requests/min per IP' },
      ],
    },
    {
      icon: <Bell className="w-4 h-4" />, title: 'Alert & Notification Settings',
      items: [
        { k: 'emailAlerts' as ToggleKey,    label: 'Email Fraud Alerts',          desc: 'Send email for critical/high severity' },
        { k: 'dashboardNotif' as ToggleKey, label: 'Dashboard Notifications',     desc: 'Show real-time toast alerts in UI' },
        { k: 'criticalOnly' as ToggleKey,   label: 'Critical Alerts Only',        desc: 'Suppress medium and low alerts' },
      ],
    },
    {
      icon: <BrainCircuit className="w-4 h-4" />, title: 'Model & Learning Settings',
      items: [
        { k: 'autoRetrain' as ToggleKey,  label: 'Auto-Retrain (Weekly)',    desc: 'Automatically retrain models every 7 days' },
        { k: 'driftDetect' as ToggleKey,  label: 'Concept Drift Detection',  desc: 'Alert when model performance degrades' },
        { k: 'autoBlock' as ToggleKey,    label: 'Auto-Block High Risk',     desc: 'Automatically block transactions with score ≥70' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black grad-text">Security Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">System configuration, authentication, and model settings</p>
      </div>

      {/* API Keys */}
      <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
          <Key className="w-4 h-4 text-cyan-400" />API Key Management
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Backend API Key',  val: 'sk-sentinel-••••••••••••••••2a4f' },
            { label: 'ML Model Endpoint',val: 'http://localhost:8000/api/v1' },
            { label: 'Alert Webhook',    val: 'https://hooks.example.com/••••' },
            { label: 'Geo API Token',    val: 'geo_••••••••••••••••••••••3b8c' },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold mb-1.5">{f.label}</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg mono text-xs text-gray-400"
                  style={{ background: '#060910', border: '1px solid rgba(0,212,255,0.1)' }}>
                  {f.val}
                </div>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold text-cyan-400 hover:bg-cyan-400/10 transition-all"
                  style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk thresholds */}
      <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
          <Shield className="w-4 h-4 text-cyan-400" />Risk Thresholds
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Approve',    range: '0 – 29',   color: '#00ff88' },
            { label: 'OTP Required', range: '30 – 69', color: '#ffd60a' },
            { label: 'Block',     range: '70 – 100',  color: '#ff3c5c' },
          ].map(t => (
            <div key={t.label} className="text-center p-4 rounded-xl"
              style={{ background: `${t.color}0d`, border: `1px solid ${t.color}33` }}>
              <p className="font-black text-lg" style={{ color: t.color }}>{t.range}</p>
              <p className="text-xs text-gray-500 mt-1">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {groups.map(g => (
          <div key={g.title} className="p-5 rounded-2xl"
            style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: '#4a5570' }}>
              <span className="text-cyan-400">{g.icon}</span>{g.title.split(' ')[0]} Settings
            </div>
            {g.items.map(item => (
              <Toggle key={item.k} k={item.k} label={item.label} desc={item.desc} />
            ))}
          </div>
        ))}
      </div>

      {/* Backend connection info */}
      <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)' }}>
        <Server className="w-6 h-6 text-green-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-green-400">Backend Integration Ready</p>
          <p className="text-xs text-gray-500 mono mt-0.5">
            Connect your Flask/FastAPI backend at <span className="text-cyan-400">http://localhost:8000/api/v1</span> — all API stubs are pre-configured in <span className="text-cyan-400">/lib/api.ts</span>
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-green-400 flex-shrink-0 hover:bg-green-400/10 transition-all"
          style={{ border: '1px solid rgba(0,255,136,0.25)' }}>
          <RefreshCcw className="w-3.5 h-3.5" /> Test Connection
        </button>
      </div>
    </div>
  );
}
