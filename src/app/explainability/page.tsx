'use client';

import { useState } from 'react';
import { shapValues } from '@/lib/simulator';
import { Card, RiskBadge } from '@/components/ui';
import { generateTransaction } from '@/lib/simulator';

const sampleTxn = generateTransaction(true);

export default function ExplainabilityPage() {
  const [txn] = useState(sampleTxn);

  const maxVal = Math.max(...shapValues.map(s => Math.abs(s.value)));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black grad-text">Explainable AI</h1>
        <p className="text-gray-500 text-sm mt-0.5">SHAP feature importance — why was this transaction flagged?</p>
      </div>

      {/* Transaction summary */}
      <div className="flex items-start gap-5 p-5 rounded-2xl flex-wrap"
        style={{ background: 'rgba(255,60,92,0.06)', border: '1px solid rgba(255,60,92,0.25)' }}>
        <div className="flex-1 min-w-[240px]">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">⚠️ Flagged Transaction</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Transaction ID', txn.id],
              ['User ID',        txn.userId],
              ['Amount',         `₹${txn.amount.toLocaleString()}`],
              ['Merchant',       txn.merchant],
              ['Location',       txn.location],
              ['Device',         txn.device],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-gray-600 mb-0.5">{k}</p>
                <p className="text-gray-200 font-semibold mono truncate">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 font-semibold">RISK SCORE</p>
          <p className="text-5xl font-black" style={{ color: '#ff3c5c' }}>{txn.riskScore}</p>
          <RiskBadge score={txn.riskScore} />
          <p className="text-xs text-gray-600">Decision: <span className="font-bold text-red-400">BLOCKED</span></p>
        </div>
      </div>

      {/* Decision explanation */}
      <Card title="Decision Explanation (Plain English)">
        <div className="p-4 rounded-xl text-sm leading-relaxed"
          style={{ background: 'rgba(255,214,10,0.05)', border: '1px solid rgba(255,214,10,0.15)' }}>
          <p className="font-bold text-yellow-400 mb-2">🤖 Why was this transaction flagged?</p>
          <p className="text-gray-300">
            This transaction was flagged with a <span className="font-bold text-red-400">risk score of {txn.riskScore}/100</span> because:
          </p>
          <ul className="mt-2 space-y-1 text-gray-400">
            <li>• The <span className="text-red-400 font-semibold">transaction amount (₹{txn.amount.toLocaleString()})</span> is significantly higher than the user&apos;s average spend</li>
            <li>• The transaction originated from a <span className="text-red-400 font-semibold">new, unknown location ({txn.location})</span></li>
            <li>• An <span className="text-red-400 font-semibold">unrecognized device</span> was used for this session</li>
            <li>• The <span className="text-red-400 font-semibold">transaction time (3:12 AM)</span> is outside the user&apos;s normal active hours</li>
            <li>• The <span className="text-yellow-400 font-semibold">ML model (XGBoost) predicted {txn.mlScore}% fraud probability</span></li>
          </ul>
        </div>
      </Card>

      {/* SHAP chart */}
      <Card title="SHAP Feature Importance — Feature Contributions to Risk Score">
        <div className="space-y-3">
          {shapValues.map(s => {
            const pct = Math.abs(s.value) / maxVal * 100;
            const isPos = s.value > 0;
            return (
              <div key={s.feature} className="flex items-center gap-3">
                <div className="w-[160px] text-right flex-shrink-0">
                  <span className="text-xs text-gray-400">{s.feature}</span>
                </div>
                <div className="flex-1 relative h-7 flex items-center">
                  <div className="w-full h-6 rounded-lg overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="h-full rounded-lg flex items-center px-2 transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: isPos
                          ? 'linear-gradient(90deg, rgba(255,60,92,0.7), rgba(255,60,92,0.2))'
                          : 'linear-gradient(90deg, rgba(0,255,136,0.3), rgba(0,255,136,0.6))',
                      }}>
                      <span className="text-[10px] font-bold whitespace-nowrap"
                        style={{ color: isPos ? '#ff3c5c' : '#00ff88' }}>
                        {isPos ? '+' : ''}{s.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-[11px] font-black"
                    style={{ color: isPos ? '#ff3c5c' : '#00ff88' }}>
                    {isPos ? '↑ Risk' : '↓ Risk'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-6 mt-5 pt-4 border-t" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(255,60,92,0.6)' }} />
            Increases fraud risk
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(0,255,136,0.6)' }} />
            Reduces fraud risk
          </div>
        </div>
      </Card>
    </div>
  );
}
