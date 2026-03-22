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
        firstRow?.classList.add('bg-blue-50');
        setTimeout(() => firstRow?.classList.remove('bg-blue-50'), 2000);
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Live Transactions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time transaction stream — auto-updating every 2.5s</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider">Live Stream</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',    val: stats.total,    color: 'text-blue-600' },
          { label: 'Approved', val: stats.approved, color: 'text-green-600' },
          { label: 'Flagged',  val: stats.flagged,  color: 'text-yellow-600' },
          { label: 'Blocked',  val: stats.blocked,  color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 flex flex-col gap-1 bg-white border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest uppercase text-gray-500">{s.label}</span>
            <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card noPad>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px] bg-gray-50 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#387ed1] transition-all">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input className="bg-transparent outline-none text-sm text-gray-900 w-full placeholder-gray-500"
              placeholder="Search by ID, user, merchant…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Status filters */}
          <div className="flex gap-2 flex-wrap">
            {['all','approved','flagged','blocked','otp'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  filter === s 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all ml-auto">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Txn ID','User','Amount','Merchant','Location','Device','Risk','ML','Status','Time'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((t, i) => (
                <tr key={t.id} className={`data-row transition-all duration-300 hover:bg-gray-50 cursor-pointer ${i === 0 ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#387ed1] font-semibold">{t.id}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-600">{t.userId}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatAmount(t.amount)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-[150px] truncate">{t.merchant}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{t.location}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{t.device}</td>
                  <td className="px-4 py-3"><RiskBadge score={t.riskScore} /></td>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{
                    color: t.mlScore > 65 ? '#e53935' : t.mlScore > 35 ? '#d97706' : '#16a34a'
                  }}>{t.mlScore}%</td>
                  <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                    {t.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
