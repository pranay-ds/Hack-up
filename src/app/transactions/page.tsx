'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { generateTransaction, Transaction } from '@/lib/simulator';
import { RiskBadge, StatusPill, Card } from '@/components/ui';

function formatAmount(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>(() =>
    Array.from({ length: 22 }, (_, i) => generateTransaction(Math.random() < 0.13 || i === 4 || i === 10))
  );
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  // Stream new transactions every 2.5s
  useEffect(() => {
    const id = setInterval(() => {
      const isFraud = Math.random() < 0.12;
      const newTxn = generateTransaction(isFraud);
      setTxns(prev => [newTxn, ...prev].slice(0, 60));
      if (tableRef.current) {
        const firstRow = tableRef.current.querySelector('tr.data-row');
        firstRow?.classList.add('animate-row-flash');
        setTimeout(() => firstRow?.classList.remove('animate-row-flash'), 2000);
      }
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const filtered = txns.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter;
    const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.userId.toLowerCase().includes(search.toLowerCase()) ||
      t.merchant.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total:    txns.length,
    approved: txns.filter(t => t.status === 'approved').length,
    flagged:  txns.filter(t => t.status === 'flagged').length,
    blocked:  txns.filter(t => t.status === 'blocked').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black grad-text">Live Transactions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time transaction stream — auto-updating every 2.5s</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(255,60,92,0.1)', border: '1px solid rgba(255,60,92,0.2)', color: '#ff3c5c' }}>
          <span className="w-2 h-2 rounded-full bg-red-500 pulse-red" />
          LIVE STREAM
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',    val: stats.total,    color: '#00d4ff' },
          { label: 'Approved', val: stats.approved, color: '#00ff88' },
          { label: 'Flagged',  val: stats.flagged,  color: '#ffd60a' },
          { label: 'Blocked',  val: stats.blocked,  color: '#ff3c5c' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{s.label}</span>
            <span className="text-2xl font-black" style={{ color: s.color }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card noPad>
        <div className="flex items-center gap-3 p-4 border-b flex-wrap" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px]"
            style={{ background: '#0d1224', border: '1px solid rgba(0,212,255,0.12)' }}>
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input className="bg-transparent outline-none text-sm text-gray-200 w-full placeholder-gray-600"
              placeholder="Search by ID, user, merchant…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Status filters */}
          <div className="flex gap-2 flex-wrap">
            {['all','approved','flagged','blocked','otp'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  filter === s ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                }`}
                style={filter === s ? { background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {s}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-cyan-400 transition-all ml-auto"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                {['Txn ID','User','Amount','Merchant','Location','Device','Risk','ML','Status','Time'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{ color: '#4a5570' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className={`data-row transition-all duration-200 hover:bg-white/[0.02] cursor-pointer ${i === 0 ? 'animate-row-flash' : ''}`}
                  style={{ borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                  <td className="px-4 py-3 mono text-xs text-cyan-400 font-semibold">{t.id}</td>
                  <td className="px-4 py-3 mono text-xs text-gray-400">{t.userId}</td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{formatAmount(t.amount)}</td>
                  <td className="px-4 py-3 text-xs text-gray-300 max-w-[130px] truncate">{t.merchant}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{t.location}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{t.device}</td>
                  <td className="px-4 py-3"><RiskBadge score={t.riskScore} /></td>
                  <td className="px-4 py-3 mono text-xs font-bold" style={{
                    color: t.mlScore > 65 ? '#ff3c5c' : t.mlScore > 35 ? '#ffd60a' : '#00ff88'
                  }}>{t.mlScore}%</td>
                  <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-600 mono">
                    {t.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
