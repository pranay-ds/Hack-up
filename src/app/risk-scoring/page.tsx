'use client';

import { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Shield, Brain, Zap, User } from 'lucide-react';
import { Card, RiskBadge, StatusPill, ProgressBar } from '@/components/ui';
import { generateTransaction } from '@/lib/simulator';

const sampleTxn = generateTransaction(true);

const GAUGE_COLORS: Record<string, string> = {
  low:  '#4caf50',
  mid:  '#ffb300',
  high: '#e53935',
};

function getScoreColor(score: number) {
  if (score >= 70) return '#e53935';
  if (score >= 30) return '#ffb300';
  return '#4caf50';
}

export default function RiskScoringPage() {
  const [txn, setTxn] = useState(sampleTxn);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => { setTxn(generateTransaction(Math.random() < 0.6)); setRefreshing(false); }, 600);
  };

  const factors = [
    { label: 'ML Model Score',    value: txn.mlScore,       weight: '× 0.40', icon: <Brain className="w-5 h-5" />,   color: '#8b5cf6', bg: '#f3e8ff' },
    { label: 'Behavior Analysis', value: txn.behaviorScore, weight: '× 0.30', icon: <User className="w-5 h-5" />,    color: '#00d4ff', bg: '#e0f2fe' },
    { label: 'Rule Engine',       value: txn.ruleScore,     weight: '× 0.30', icon: <Zap className="w-5 h-5" />,     color: '#f59e0b', bg: '#fef3c7' },
  ];

  const decision =
    txn.riskScore >= 70 ? { text: 'BLOCK TRANSACTION', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
  : txn.riskScore >= 30 ? { text: 'REQUIRE OTP VERIFICATION', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' }
  :                       { text: 'APPROVE TRANSACTION', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };

  const gaugeColor = getScoreColor(txn.riskScore);

  const radialData = [
    { name: 'Risk', value: txn.riskScore, fill: gaugeColor },
    { name: 'bg',   value: 100, fill: '#f3f4f6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Risk Scoring Engine</h1>
          <p className="text-gray-500 text-sm mt-0.5">Formula: Risk = 0.4(ML) + 0.3(Behavior) + 0.3(Rules)</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all bg-[#387ed1] hover:bg-blue-700 disabled:opacity-50">
          {refreshing ? 'Analyzing…' : '⟳ Analyze New Transaction'}
        </button>
      </div>

      {/* Transaction context */}
      <Card title="Transaction Under Analysis">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-sm">
          {[
            { k: 'ID',       v: txn.id },
            { k: 'User',     v: txn.userId },
            { k: 'Amount',   v: `₹${txn.amount.toLocaleString()}` },
            { k: 'Merchant', v: txn.merchant },
            { k: 'Location', v: txn.location },
            { k: 'Device',   v: txn.device },
          ].map(({ k, v }) => (
            <div key={k}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{k}</p>
              <p className="text-[13px] font-semibold text-gray-900 font-mono truncate">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score gauge */}
        <Card title="Final Risk Score" className="flex flex-col items-center">
          <div className="flex flex-col items-center py-5 w-full">
            <div className="relative w-[220px] h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                  startAngle={225} endAngle={-45} data={radialData}>
                  <RadialBar dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black" style={{ color: gaugeColor }}>{txn.riskScore}</span>
                <span className="text-sm text-gray-500 font-bold mt-1">/ 100</span>
              </div>
            </div>

            <div className={`mt-6 w-[80%] px-4 py-3 rounded-xl text-center font-bold text-sm border shadow-sm ${decision.bg} ${decision.border} ${decision.color}`}>
              {decision.text}
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-3 gap-3 mt-6 w-full text-center">
              {[
                { range: '0–29',  label: 'APPROVE',  color: '#4caf50' },
                { range: '30–69', label: 'OTP',      color: '#ffb300' },
                { range: '70–100',label: 'BLOCK',    color: '#e53935' },
              ].map(t => (
                <div key={t.range} className="rounded-xl py-2.5 bg-gray-50 border border-gray-100">
                  <p className="font-bold text-[11px] mb-0.5" style={{ color: t.color }}>{t.label}</p>
                  <p className="text-[10px] text-gray-500 font-mono font-medium">{t.range}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Factor breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Score Breakdown">
            <div className="space-y-5">
              {factors.map(f => (
                <div key={f.label} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[13px] text-gray-800">{f.label}</span>
                        <span className="font-mono text-xs font-semibold text-gray-500">{f.weight}</span>
                      </div>
                    </div>
                    <span className="text-xl font-black w-10 text-right" style={{ color: getScoreColor(f.value) }}>{f.value}</span>
                  </div>
                  <ProgressBar value={f.value} color={f.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* Formula display */}
          <Card title="Risk Formula">
            <div className="p-4 rounded-xl text-center font-mono text-sm bg-blue-50/50 border border-blue-100">
              <span className="text-gray-500 font-semibold">Risk = </span>
              <span className="text-purple-600 font-bold">0.4</span><span className="text-gray-400 font-semibold"> × </span>
              <span className="text-purple-600 font-bold">{txn.mlScore}</span>
              <span className="text-gray-400 font-semibold"> + </span>
              <span className="text-cyan-600 font-bold">0.3</span><span className="text-gray-400 font-semibold"> × </span>
              <span className="text-cyan-600 font-bold">{txn.behaviorScore}</span>
              <span className="text-gray-400 font-semibold"> + </span>
              <span className="text-yellow-600 font-bold">0.3</span><span className="text-gray-400 font-semibold"> × </span>
              <span className="text-yellow-600 font-bold">{txn.ruleScore}</span>
              <span className="text-gray-500 font-semibold"> = </span>
              <span className="font-black text-lg" style={{ color: gaugeColor }}>{txn.riskScore}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              {[
                { label: 'ML Component',      val: Math.round(txn.mlScore * 0.4),       color: '#8b5cf6' },
                { label: 'Behavior Component',val: Math.round(txn.behaviorScore * 0.3), color: '#0891b2' },
                { label: 'Rule Component',    val: Math.round(txn.ruleScore * 0.3),     color: '#d97706' },
                { label: 'Final Score',       val: txn.riskScore,                       color: gaugeColor },
              ].map(m => (
                <div key={m.label} className="p-3.5 rounded-xl text-center bg-white border border-gray-200 shadow-sm">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">{m.label}</p>
                  <p className="text-2xl font-black" style={{ color: m.color }}>{m.val}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
