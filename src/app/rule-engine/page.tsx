'use client';

import { useState } from 'react';
import { fraudRules } from '@/lib/simulator';
import { Card } from '@/components/ui';
import { Zap, Shield, Navigation, Globe, Smartphone, Moon, Tag, Lock, Wifi, CreditCard } from 'lucide-react';

const RULE_ICONS = [Zap, Shield, Navigation, Globe, Smartphone, Moon, Tag, Lock, Wifi, CreditCard];

export default function RuleEnginePage() {
  const [rules, setRules] = useState(fraudRules);

  const toggle = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const activeCount    = rules.filter(r => r.active).length;
  const triggeredToday = rules.reduce((s, r) => s + r.triggered, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black grad-text">Rule-Based Engine</h1>
          <p className="text-gray-500 text-sm mt-0.5">Hardcoded fraud detection rules — fast, deterministic, no ML required</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Active Rules',    val: activeCount,    color: '#00ff88' },
            { label: 'Triggers Today',  val: triggeredToday, color: '#ffd60a' },
            { label: 'Total Rules',     val: rules.length,   color: '#00d4ff' },
          ].map(s => (
            <div key={s.label} className="px-4 py-2.5 rounded-xl text-center"
              style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
              <p className="text-lg font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((rule, i) => {
          const Icon = RULE_ICONS[i % RULE_ICONS.length];
          const isTriggered = rule.triggered > 100;
          return (
            <div key={rule.id}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                !rule.active ? 'opacity-50' : ''
              }`}
              style={{
                background: 'rgba(13,18,36,0.85)',
                border: isTriggered && rule.active
                  ? '1px solid rgba(255,60,92,0.3)'
                  : rule.active
                    ? '1px solid rgba(0,212,255,0.1)'
                    : '1px solid rgba(255,255,255,0.05)',
              }}>
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isTriggered && rule.active ? 'rgba(255,60,92,0.12)' : 'rgba(0,212,255,0.1)',
                  color: isTriggered && rule.active ? '#ff3c5c' : '#00d4ff',
                }}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="mono text-[10px] text-gray-600">{rule.id}</span>
                  <span className="font-bold text-sm text-white">{rule.name}</span>
                  {isTriggered && rule.active && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,60,92,0.12)', color: '#ff3c5c' }}>
                      HIGH ACTIVITY
                    </span>
                  )}
                </div>
                <p className="mono text-[11px] text-gray-500">{rule.condition}</p>
              </div>

              {/* Triggered count */}
              <div className="text-right flex-shrink-0">
                <p className="font-black text-lg" style={{
                  color: isTriggered ? '#ff3c5c' : '#ffd60a'
                }}>{rule.triggered}</p>
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">triggers</p>
              </div>

              {/* Toggle */}
              <button onClick={() => toggle(rule.id)}
                className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: rule.active ? '#00d4ff' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                  style={{ left: rule.active ? 'calc(100% - 22px)' : '2px' }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
