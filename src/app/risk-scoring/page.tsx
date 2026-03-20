'use client';

import { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Shield, Brain, Zap, User } from 'lucide-react';
import { Card, RiskBadge, StatusPill, ProgressBar } from '@/components/ui';
import { generateTransaction } from '@/lib/simulator';

const sampleTxn = generateTransaction(true);

const GAUGE_COLORS: Record<string, string> = {
  low:  '#00ff88',
  mid:  '#ffd60a',
  high: '#ff3c5c',
};

function getScoreColor(score: number) {
  if (score >= 70) return '#ff3c5c';
  if (score >= 30) return '#ffd60a';
  return '#00ff88';
}

export default function RiskScoringPage() {
  const [txn, setTxn] = useState(sampleTxn);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => { setTxn(generateTransaction(Math.random() < 0.6)); setRefreshing(false); }, 600);
  };

  const factors = [
    { label: 'ML Model Score',    value: txn.mlScore,       weight: '×0.40', icon: <Brain className="w-5 h-5" />,   color: '#7b2fff', bg: 'rgba(123,47,255,0.1)'  },
    { label: 'Behavior Analysis', value: txn.behaviorScore, weight: '×0.30', icon: <User className="w-5 h-5" />,    color: '#00d4ff', bg: 'rgba(0,212,255,0.1)'   },
    { label: 'Rule Engine',       value: txn.ruleScore,     weight: '×0.30', icon: <Zap className="w-5 h-5" />,     color: '#ffd60a', bg: 'rgba(255,214,10,0.1)'  },
  ];

  const decision =
    txn.riskScore >= 70 ? { text: 'BLOCK TRANSACTION', color: '#ff3c5c', bg: 'rgba(255,60,92,0.1)', border: 'rgba(255,60,92,0.3)' }
  : txn.riskScore >= 30 ? { text: 'REQUIRE OTP VERIFICATION', color: '#ffd60a', bg: 'rgba(255,214,10,0.08)', border: 'rgba(255,214,10,0.3)' }
  :                       { text: 'APPROVE TRANSACTION', color: '#00ff88', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)' };

  const gaugeColor = getScoreColor(txn.riskScore);

  const radialData = [
    { name: 'Risk', value: txn.riskScore, fill: gaugeColor },
    { name: 'bg',   value: 100, fill: 'rgba(255,255,255,0.04)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black grad-text">Risk Scoring Engine</h1>
          <p className="text-gray-500 text-sm mt-0.5">Formula: Risk = 0.4(ML) + 0.3(Behavior) + 0.3(Rules)</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:shadow-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#00d4ff,#7b2fff)', color: '#fff' }}>
          {refreshing ? 'Analyzing…' : '⟳ Analyze New Transaction'}
        </button>
      </div>

      {/* Transaction context */}
      <Card title="Transaction Under Analysis">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
          {[
            { k: 'ID',       v: txn.id },
            { k: 'User',     v: txn.userId },
            { k: 'Amount',   v: `₹${txn.amount.toLocaleString()}` },
            { k: 'Merchant', v: txn.merchant },
            { k: 'Location', v: txn.location },
            { k: 'Device',   v: txn.device },
          ].map(({ k, v }) => (
            <div key={k}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">{k}</p>
              <p className="text-xs font-semibold text-gray-200 mono truncate">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score gauge */}
        <Card title="Final Risk Score" className="flex flex-col items-center">
          <div className="flex flex-col items-center py-4">
            <div className="relative w-[200px] h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                  startAngle={225} endAngle={-45} data={radialData}>
                  <RadialBar dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: gaugeColor }}>{txn.riskScore}</span>
                <span className="text-xs text-gray-500 font-semibold">/ 100</span>
              </div>
            </div>

            <div className="mt-4 w-full px-4 py-3 rounded-xl text-center font-bold text-sm"
              style={{ background: decision.bg, border: `1px solid ${decision.border}`, color: decision.color }}>
              {decision.text}
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-3 gap-2 mt-4 w-full text-center text-xs">
              {[
                { range: '0–29',  label: 'APPROVE',  color: '#00ff88' },
                { range: '30–69', label: 'OTP',      color: '#ffd60a' },
                { range: '70–100',label: 'BLOCK',    color: '#ff3c5c' },
              ].map(t => (
                <div key={t.range} className="rounded-lg py-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-black text-xs" style={{ color: t.color }}>{t.label}</p>
                  <p className="text-[10px] text-gray-600 mono">{t.range}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Factor breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Score Breakdown">
            <div className="space-y-4">
              {factors.map(f => (
                <div key={f.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.07)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-gray-200">{f.label}</span>
                        <span className="mono text-xs font-bold text-gray-500">{f.weight}</span>
                      </div>
                    </div>
                    <span className="text-xl font-black" style={{ color: getScoreColor(f.value) }}>{f.value}</span>
                  </div>
                  <ProgressBar value={f.value} color={f.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* Formula display */}
          <Card title="Risk Formula">
            <div className="p-4 rounded-xl text-center mono text-sm"
              style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <span className="text-gray-400">Risk = </span>
              <span className="text-purple-400">0.4</span><span className="text-gray-500"> × </span>
              <span className="text-purple-400">{txn.mlScore}</span>
              <span className="text-gray-500"> + </span>
              <span className="text-cyan-400">0.3</span><span className="text-gray-500"> × </span>
              <span className="text-cyan-400">{txn.behaviorScore}</span>
              <span className="text-gray-500"> + </span>
              <span className="text-yellow-400">0.3</span><span className="text-gray-500"> × </span>
              <span className="text-yellow-400">{txn.ruleScore}</span>
              <span className="text-gray-500"> = </span>
              <span className="font-black text-lg" style={{ color: gaugeColor }}>{txn.riskScore}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: 'ML Component',      val: Math.round(txn.mlScore * 0.4),       color: '#7b2fff' },
                { label: 'Behavior Component',val: Math.round(txn.behaviorScore * 0.3), color: '#00d4ff' },
                { label: 'Rule Component',    val: Math.round(txn.ruleScore * 0.3),     color: '#ffd60a' },
                { label: 'Final Score',       val: txn.riskScore,                       color: gaugeColor },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] text-gray-600 mb-1">{m.label}</p>
                  <p className="text-xl font-black" style={{ color: m.color }}>{m.val}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
