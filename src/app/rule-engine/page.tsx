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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Rule-Based Engine</h1>
          <p className="text-gray-500 text-sm mt-0.5">Hardcoded fraud detection rules — fast, deterministic, no ML required</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Active Rules',    val: activeCount,    color: 'text-green-600' },
            { label: 'Triggers Today',  val: triggeredToday, color: 'text-yellow-600' },
            { label: 'Total Rules',     val: rules.length,   color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="px-5 py-3 rounded-xl text-center bg-white border border-gray-200 shadow-sm min-w-[120px]">
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">{s.label}</p>
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
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 shadow-sm bg-white ${
                !rule.active ? 'opacity-60 grayscale-[0.5]' : ''
              } ${
                isTriggered && rule.active 
                  ? 'border border-red-200 bg-red-50/30 hover:border-red-300' 
                  : rule.active 
                    ? 'border border-gray-200 hover:border-blue-200 hover:shadow-md'
                    : 'border border-gray-200'
              }`}>
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isTriggered && rule.active ? '#fee2e2' : '#eff6ff',
                  color: isTriggered && rule.active ? '#e53935' : '#387ed1',
                }}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="font-mono text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{rule.id}</span>
                  <span className="font-bold text-[15px] text-gray-900 leading-none truncate">{rule.name}</span>
                  {isTriggered && rule.active && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded text-red-700 bg-red-100 uppercase tracking-widest whitespace-nowrap">
                      High Activity
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-gray-600 truncate">{rule.condition}</p>
              </div>

              {/* Triggered count */}
              <div className="text-right flex-shrink-0 px-4">
                <p className="font-black text-xl" style={{
                  color: isTriggered ? '#e53935' : '#d97706'
                }}>{rule.triggered.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">triggers</p>
              </div>

              {/* Toggle */}
              <button onClick={() => toggle(rule.id)}
                className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 border"
                style={{ 
                  background: rule.active ? '#387ed1' : '#e5e7eb',
                  borderColor: rule.active ? '#2563eb' : '#d1d5db'
                }}>
                <span className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-300"
                  style={{ left: rule.active ? 'calc(100% - 20px)' : '2px', width: '18px', height: '18px' }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
