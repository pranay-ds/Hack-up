'use client';

import { useState } from 'react';
import { userProfiles, generateTransactionBatch } from '@/lib/simulator';
import { Card, StatusPill, RiskBadge } from '@/components/ui';
import { ShieldX, ShieldCheck, Eye, Users, Activity } from 'lucide-react';

const pendingTxns = generateTransactionBatch(8).filter(t => t.status !== 'approved');

export default function AdminPage() {
  const [users, setUsers]   = useState(userProfiles);
  const [txns,  setTxns]    = useState(pendingTxns);
  const [auditLog, setLog]  = useState<string[]>([
    '[09:42:18] Admin approved TXN1023 — USR1042',
    '[09:41:05] Admin blocked USR3847 — Reason: Impossible travel',
    '[09:38:51] Alert ALT8F2A acknowledged',
    '[09:35:12] Rule R007 disabled by Admin',
    '[09:30:00] Model retraining triggered — XGBoost',
    '[09:25:44] Admin approved TXN1018 — USR4102',
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setLog(prev => [`[${time}] ${msg}`, ...prev].slice(0, 20));
  };

  const blockUser = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Blocked' } : u));
    addLog(`Admin blocked user ${id}`);
  };
  const unblockUser = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Normal' } : u));
    addLog(`Admin unblocked user ${id}`);
  };
  const approveTxn = (id: string) => {
    setTxns(prev => prev.filter(t => t.id !== id));
    addLog(`Admin approved transaction ${id}`);
  };
  const blockTxn   = (id: string) => {
    setTxns(prev => prev.filter(t => t.id !== id));
    addLog(`Admin blocked transaction ${id}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black grad-text">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-0.5">User management, transaction review, and system audit log</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Users className="w-5 h-5" />,    label: 'Flagged Users',      val: userProfiles.filter(u => u.status !== 'Normal').length, color: '#ffd60a' },
          { icon: <Activity className="w-5 h-5" />, label: 'Pending Reviews',    val: txns.length,    color: '#ff3c5c' },
          { icon: <Eye className="w-5 h-5" />,      label: 'Audit Events Today', val: auditLog.length, color: '#00d4ff' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl flex items-center gap-4"
            style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users */}
      <Card title="Flagged Users — Management">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                {['User ID','Name','Avg Spend','Location','Risk','Status','Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
                    style={{ color: '#4a5570' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const rc = u.riskLevel === 'high' ? '#ff3c5c' : u.riskLevel === 'medium' ? '#ffd60a' : '#00ff88';
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-all"
                    style={{ borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                    <td className="py-3 px-3 mono text-xs text-cyan-400">{u.id}</td>
                    <td className="py-3 px-3 font-semibold text-white text-sm">{u.name}</td>
                    <td className="py-3 px-3 text-xs text-gray-300">₹{u.avgSpend.toLocaleString()}</td>
                    <td className="py-3 px-3 text-xs text-gray-400">{u.locations}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded" style={{ color: rc, background: `${rc}18` }}>
                        {u.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        u.status === 'Normal' ? 'text-green-400 bg-green-400/10'
                        : u.status === 'Blocked' ? 'text-red-400 bg-red-400/10'
                        : 'text-yellow-400 bg-yellow-400/10'
                      }`}>{u.status}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        {u.status !== 'Blocked'
                          ? <button onClick={() => blockUser(u.id)}
                              className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                              style={{ background: 'rgba(255,60,92,0.1)', color: '#ff3c5c', border: '1px solid rgba(255,60,92,0.2)' }}>
                              <ShieldX className="w-3 h-3" /> Block
                            </button>
                          : <button onClick={() => unblockUser(u.id)}
                              className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                              style={{ background: 'rgba(0,255,136,0.08)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                              <ShieldCheck className="w-3 h-3" /> Unblock
                            </button>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending txns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Transaction Review Queue">
          {txns.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">All transactions reviewed ✓</p>
          ) : (
            <div className="space-y-3">
              {txns.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.07)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="mono text-[10px] text-cyan-400">{t.id}</span>
                      <RiskBadge score={t.riskScore} />
                    </div>
                    <p className="text-xs text-gray-300">{t.userId} · ₹{t.amount.toLocaleString()} · {t.merchant}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approveTxn(t.id)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                      style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                      Approve
                    </button>
                    <button onClick={() => blockTxn(t.id)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                      style={{ background: 'rgba(255,60,92,0.1)', color: '#ff3c5c', border: '1px solid rgba(255,60,92,0.2)' }}>
                      Block
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Audit log */}
        <Card title="System Audit Log">
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {auditLog.map((log, i) => (
              <div key={i} className="mono text-[11px] py-1.5 px-3 rounded-lg"
                style={{ background: 'rgba(0,212,255,0.04)', borderLeft: '2px solid rgba(0,212,255,0.2)', color: '#7a8aaa' }}>
                {log}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
