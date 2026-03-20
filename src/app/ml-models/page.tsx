'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';
import { modelMetrics } from '@/lib/simulator';
import { Card, ProgressBar } from '@/components/ui';
import { BrainCircuit, RefreshCcw } from 'lucide-react';
import { CustomTooltip } from '@/components/ui';

const ensembleWeights = [
  { model: 'XGBoost',       weight: 50, color: '#7b2fff' },
  { model: 'Random Forest', weight: 30, color: '#00ff88' },
  { model: 'Log. Reg.',     weight: 20, color: '#00d4ff' },
];

export default function MLModelsPage() {
  const radarData = modelMetrics.map(m => ({
    model: m.name.split(' ')[0],
    Accuracy:  m.accuracy,
    Precision: m.precision,
    Recall:    m.recall,
    F1:        m.f1,
  }));

  const barMetrics = ['accuracy', 'precision', 'recall', 'f1'] as const;
  const barData = modelMetrics.map(m => ({
    name:      m.name.includes('Logistic') ? 'LogReg' : m.name.includes('Forest') ? 'RandForest' : m.name.includes('XG') ? 'XGBoost' : 'IsoForest',
    Accuracy:  m.accuracy,
    Precision: m.precision,
    Recall:    m.recall,
    'F1 Score':m.f1,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black grad-text">ML Models</h1>
          <p className="text-gray-500 text-sm mt-0.5">Multi-model ensemble for hybrid fraud detection</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#00d4ff,#7b2fff)', color: '#fff' }}>
          <RefreshCcw className="w-4 h-4" /> Retrain All Models
        </button>
      </div>

      {/* Model cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {modelMetrics.map(m => (
          <div key={m.name} className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
            style={{
              background: 'rgba(13,18,36,0.85)',
              border: `1px solid ${m.color}33`,
            }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${m.color}18`, color: m.color }}>
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm text-white leading-tight">{m.name}</p>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{ background: `${m.color}22`, color: m.color }}>
                  {m.type}
                </span>
              </div>
            </div>
            {[
              { k: 'Accuracy',  v: m.accuracy  },
              { k: 'Precision', v: m.precision },
              { k: 'Recall',    v: m.recall    },
              { k: 'F1 Score',  v: m.f1        },
            ].map(({ k, v }) => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-bold" style={{ color: m.color }}>{v}%</span>
                </div>
                <ProgressBar value={v} color={m.color} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Model comparison */}
        <Card title="Model Performance Comparison">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <XAxis dataKey="name" tick={{ fill: '#4a5570', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: '#4a5570', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#7a8aaa', fontSize: 11 }} />
                <Bar dataKey="Accuracy"  fill="#00d4ff" radius={[3,3,0,0]} />
                <Bar dataKey="Precision" fill="#00ff88" radius={[3,3,0,0]} />
                <Bar dataKey="Recall"    fill="#7b2fff" radius={[3,3,0,0]} />
                <Bar dataKey="F1 Score"  fill="#ffd60a" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Ensemble voting */}
        <Card title="Ensemble Voting Weights">
          <div className="space-y-5 py-2">
            {ensembleWeights.map(e => (
              <div key={e.model}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-200">{e.model}</span>
                  <span className="font-black" style={{ color: e.color }}>{e.weight}%</span>
                </div>
                <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full shimmer-bar" style={{ width: `${e.weight}%`, background: e.color }} />
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 rounded-xl text-center"
              style={{ background: 'rgba(123,47,255,0.08)', border: '1px solid rgba(123,47,255,0.2)' }}>
              <p className="text-xs text-gray-400 mb-1">Ensemble Final Accuracy</p>
              <p className="text-3xl font-black grad-text">96.8%</p>
              <p className="text-xs text-gray-500 mt-1">Weighted voting → best fraud coverage</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
