'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import { Play, Square, Swords, ShieldAlert, Zap, Wifi } from 'lucide-react';

type Scenario = {
  id: string;
  name: string;
  desc: string;
  attackType: string;
  duration: number;
};

const SCENARIOS: Scenario[] = [
  { id: 'split', name: 'Card Splitting Attack', desc: 'Fraudster splits one large txn into many small ones to evade limits', attackType: 'Structuring', duration: 8000 },
  { id: 'vpn',   name: 'VPN Location Masking',  desc: 'Attacker rotates VPN IPs to appear from different trusted locations', attackType: 'Identity', duration: 6000 },
  { id: 'probe', name: 'Low-Value Card Probing', desc: 'Testing stolen card with micro-transactions before large fraud', attackType: 'Carding', duration: 5000 },
  { id: 'takeover', name: 'Account Takeover',   desc: 'Credential stuffing → login → instant high-value transfer', attackType: 'ATO', duration: 10000 },
  { id: 'burst', name: 'Velocity Burst Attack',  desc: 'Rapid-fire transactions at 3AM to exploit overnight batch delays', attackType: 'Timing', duration: 7000 },
  { id: 'insider', name: 'Insider Threat Sim',  desc: 'Trusted user slowly escalating transaction amounts over time', attackType: 'Behavioral', duration: 9000 },
];

const TERMINAL_LINES: Record<string, string[]> = {
  split:    ['> Initiating card splitting simulation…', '> Generating 24 micro-transactions (₹470–₹990 each)', '> Txn burst detected by velocity engine [RULE R002]', '> ML score: 79/100 — FLAGGED', '> Fraud ring identified — 4 linked accounts blocked'],
  vpn:      ['> Rotating through 12 VPN exit nodes…', '> IPs: 45.142.212.10, 185.220.101.5, 213.109.202.15', '> IP reputation check: HIGH RISK (VPN detected)', '> Device mismatch on 3rd login → OTP triggered', '> Session blocked after 2nd suspicious login'],
  probe:    ['> Sending micro-probe transactions (₹1, ₹5, ₹10)…', '> Card validation pattern detected [RULE R010]', '> Score escalating: 12 → 34 → 67 → 89', '> Card BLOCKED before large transaction', '> Alert sent: Card cloning suspected'],
  takeover: ['> Credential stuffing attempt on USR3847…', '> 47 failed logins detected [RULE R008]', '> Account locked after threshold breach', '> New device fingerprint flagged', '> Emergency OTP sent — account frozen'],
  burst:    ['> Night attack simulation starting (3:17 AM context)…', '> 18 transactions in 45 seconds', '> Velocity engine: CRITICAL threshold breached', '> Risk score spiked to 94', '> All transactions blocked — 18 fraud prevented'],
  insider:  ['> Profiling normal user behavior…', '> Baseline: ₹2,400 avg spend', '> Week 1: ₹2,800 (normal)… Week 2: ₹6,100 (+154%)…', '> Behavior engine: ANOMALY DETECTED', '> Step-up authentication triggered'],
};

export default function AttackSimPage() {
  const [running, setRunning]   = useState<string | null>(null);
  const [logs, setLogs]         = useState<Array<{ text: string; type: string }>>([]);
  const [detected, setDetected] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  const startSim = (scenario: Scenario) => {
    if (running) return;
    setRunning(scenario.id);
    setLogs([{ text: `\n[FFDS] Launching: ${scenario.name}`, type: 'dim' }]);

    const lines = TERMINAL_LINES[scenario.id] ?? [];
    lines.forEach((line, i) => {
      setTimeout(() => {
        setLogs(prev => [
          ...prev,
          { text: line, type: line.includes('BLOCKED') || line.includes('blocked') || line.includes('frozen') ? 'error' : line.includes('detected') || line.includes('DETECTED') || line.includes('CRITICAL') ? 'warning' : 'normal' }
        ]);
        if (i === lines.length - 1) {
          setTimeout(() => {
            setLogs(prev => [...prev, { text: `\n✓ Simulation complete — fraud DETECTED and BLOCKED`, type: 'normal' }]);
            setDetected(d => d + 1);
            setRunning(null);
          }, 800);
        }
      }, (i + 1) * (scenario.duration / lines.length));
    });
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black grad-text-danger">Attack Simulation</h1>
          <p className="text-gray-500 text-sm mt-0.5">Red-team fraud scenarios — test your detection system</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl text-center" style={{ background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.15)' }}>
            <p className="text-lg font-black text-green-400">{detected}</p>
            <p className="text-[9px] text-gray-600 uppercase">Attacks Blocked</p>
          </div>
          <div className="px-3 py-2 rounded-xl text-center" style={{ background: 'rgba(255,60,92,0.08)', border: '1px solid rgba(255,60,92,0.2)' }}>
            <p className="text-lg font-black text-red-400">0</p>
            <p className="text-[9px] text-gray-600 uppercase">Bypassed</p>
          </div>
        </div>
      </div>

      {running && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl animate-glow-ring"
          style={{ background: 'rgba(255,60,92,0.08)', border: '1px solid rgba(255,60,92,0.35)' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 pulse-red" />
          <span className="text-red-400 font-bold text-sm">Attack simulation running…</span>
          <button onClick={() => setRunning(null)}
            className="ml-auto flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg"
            style={{ background: 'rgba(255,60,92,0.15)', color: '#ff3c5c' }}>
            <Square className="w-3 h-3" /> Stop
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scenario cards */}
        <div>
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Attack Scenarios</p>
          <div className="grid grid-cols-1 gap-3">
            {SCENARIOS.map(s => {
              const isRunning = running === s.id;
              return (
                <button key={s.id} onClick={() => startSim(s)} disabled={!!running && !isRunning}
                  className="text-left p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: isRunning ? 'rgba(255,60,92,0.08)' : 'rgba(13,18,36,0.85)',
                    border: isRunning ? '1px solid rgba(255,60,92,0.4)' : '1px solid rgba(0,212,255,0.1)',
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isRunning ? 'rgba(255,60,92,0.2)' : 'rgba(255,60,92,0.1)', color: '#ff3c5c' }}>
                      <Swords className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm text-white">{s.name}</p>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(255,60,92,0.12)', color: '#ff3c5c' }}>
                          {s.attackType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {isRunning
                        ? <div className="animate-spin w-5 h-5 rounded-full border-2 border-red-400/30 border-t-red-400" />
                        : <Play className="w-5 h-5 text-gray-600" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Terminal */}
        <div>
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Detection Terminal</p>
          <div ref={terminalRef}
            className="h-[420px] overflow-y-auto p-4 rounded-2xl mono text-xs"
            style={{ background: '#060910', border: '1px solid rgba(0,255,136,0.15)' }}>
            {logs.length === 0 ? (
              <p className="text-gray-700">{'>'} Select an attack scenario to begin simulation…</p>
            ) : (
              logs.map((l, i) => (
                <p key={i} className={`py-0.5 ${l.type === 'error' ? 'text-red-400' : l.type === 'warning' ? 'text-yellow-400' : l.type === 'dim' ? 'text-gray-600' : 'text-green-400'}`}>
                  {l.text}
                </p>
              ))
            )}
            {running && <span className="text-green-400 animate-pulse">█</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
