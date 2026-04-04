'use client';

import { deviceFingerprints, ipIntelligence } from '@/lib/simulator';
import { Card } from '@/components/ui';
import { Monitor, Smartphone, ShieldX, ShieldCheck } from 'lucide-react';

const riskStyles: Record<string, { color: string; bg: string }> = {
  low:      { color: '#00ff88', bg: 'rgba(0,255,136,0.08)' },
  high:     { color: '#ff8c42', bg: 'rgba(255,140,66,0.1)' },
  critical: { color: '#ff3c5c', bg: 'rgba(255,60,92,0.1)'  },
};

export default function DeviceIPPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black grad-text">Device & IP Intelligence</h1>
        <p className="text-gray-500 text-sm mt-0.5">Device fingerprinting, trust scoring, and IP threat intelligence</p>
      </div>

      {/* Device Fingerprints */}
      <div>
        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Device Fingerprints</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {deviceFingerprints.map(d => {
            const rs = riskStyles[d.risk] ?? riskStyles.low;
            const isRisky = d.risk === 'high' || d.risk === 'critical';
            return (
              <div key={d.id} className="rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: 'rgba(13,18,36,0.85)',
                  border: isRisky ? `1px solid ${rs.color}44` : '1px solid rgba(0,212,255,0.1)',
                }}>
                {/* Glow bg */}
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                  style={{ background: `radial-gradient(circle, ${rs.color}, transparent)`, transform: 'translate(30%, -30%)' }} />

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${rs.color}18`, color: rs.color }}>
                    {d.type === 'Mobile' ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-black text-sm text-white">{d.type}</p>
                    <p className="mono text-[10px] text-gray-500">{d.id}</p>
                  </div>
                  <div className="ml-auto">
                    {d.known
                      ? <ShieldCheck className="w-5 h-5" style={{ color: '#00ff88' }} />
                      : <ShieldX className="w-5 h-5" style={{ color: '#ff3c5c' }} />}
                  </div>
                </div>

                <ul className="space-y-2">
                  {[
                    ['OS',         d.os],
                    ['Browser',    d.browser],
                    ['Screen',     d.screen],
                    ['Timezone',   d.tz],
                    ['Seen Before',d.known ? '✓ Trusted' : '✗ Unknown'],
                  ].map(([k, v]) => (
                    <li key={k} className="flex justify-between text-xs border-b pb-1.5 last:border-0 last:pb-0"
                      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <span className="text-gray-500">{k}</span>
                      <span className={`font-semibold mono ${k === 'Seen Before' ? (d.known ? 'text-green-400' : 'text-red-400') : 'text-gray-200'}`}>{v}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 text-center py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest"
                  style={{ background: rs.bg, color: rs.color }}>
                  {d.risk} Risk
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IP Intelligence */}
      <Card title="IP Reputation Database">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                {['IP Address', 'Country', 'Type', 'VPN', 'TOR Exit', 'Risk Level', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
                    style={{ color: '#4a5570' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ipIntelligence.map(ip => {
                const rc = ip.risk === 'critical' ? '#ff3c5c' : ip.risk === 'high' ? '#ff8c42' : '#00ff88';
                return (
                  <tr key={ip.ip} className="hover:bg-white/[0.02] transition-all"
                    style={{ borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                    <td className="py-3 px-3 mono text-xs font-semibold text-cyan-400">{ip.ip}</td>
                    <td className="py-3 px-3 text-xs text-gray-300">{ip.country}</td>
                    <td className="py-3 px-3 text-xs text-gray-400">{ip.type}</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold text-xs ${ip.vpn ? 'text-red-400' : 'text-green-400'}`}>{ip.vpn ? 'YES' : 'NO'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold text-xs ${ip.tor ? 'text-red-400' : 'text-green-400'}`}>{ip.tor ? 'YES' : 'NO'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase font-black text-[10px] px-2.5 py-1 rounded-lg"
                        style={{ color: rc, background: `${rc}18`, border: `1px solid ${rc}33` }}>
                        {ip.risk}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-80 ${
                        ip.risk === 'low' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-500/10 text-red-400 border border-red-400/20'
                      }`}>
                        {ip.risk === 'low' ? 'Allow' : 'Block'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Fingerprint stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Known Devices',    val: '3,842', color: '#00ff88' },
          { label: 'Unknown Devices',  val: '127',   color: '#ffd60a' },
          { label: 'High-Risk Devices',val: '34',    color: '#ff8c42' },
          { label: 'TOR/VPN Sessions', val: '89',    color: '#ff3c5c' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(13,18,36,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
