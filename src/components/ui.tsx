import { ReactNode } from 'react';
import { clsx } from 'clsx';

// ── StatCard ──────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: 'green' | 'red' | 'muted';
  accent?: 'cyan' | 'green' | 'red' | 'yellow' | 'purple';
  icon?: ReactNode;
}

const accentTopMap = {
  cyan:   'linear-gradient(90deg,#00d4ff,#7b2fff)',
  green:  'linear-gradient(90deg,#00ff88,#00d4ff)',
  red:    'linear-gradient(90deg,#ff3c5c,#ff8c42)',
  yellow: 'linear-gradient(90deg,#ffd60a,#ff8c42)',
  purple: 'linear-gradient(90deg,#7b2fff,#00d4ff)',
};

const accentIconBg = {
  cyan:   'rgba(0,212,255,0.12)',
  green:  'rgba(0,255,136,0.1)',
  red:    'rgba(255,60,92,0.12)',
  yellow: 'rgba(255,214,10,0.1)',
  purple: 'rgba(123,47,255,0.12)',
};
const accentIconColor = {
  cyan: '#00d4ff', green: '#00ff88', red: '#ff3c5c', yellow: '#ffd60a', purple: '#7b2fff',
};

export function StatCard({ label, value, sub, subColor = 'muted', accent = 'cyan', icon }: StatCardProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
      style={{
        background: 'rgba(13,18,36,0.85)',
        border: '1px solid rgba(0,212,255,0.1)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accentTopMap[accent] }} />

      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold tracking-widest uppercase mb-3"
            style={{ color: '#7a8aaa' }}>
            {label}
          </p>
          <p className="text-[1.85rem] font-black leading-none tracking-tight text-white mb-2">{value}</p>
          {sub && (
            <p className={clsx('text-xs flex items-center gap-1', {
              'text-green-400': subColor === 'green',
              'text-red-400':   subColor === 'red',
              'text-gray-500':  subColor === 'muted',
            })}>{sub}</p>
          )}
        </div>

        {icon && (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: accentIconBg[accent] }}>
            <span style={{ color: accentIconColor[accent] }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── RiskBadge ─────────────────────────────────────────────
export function RiskBadge({ score }: { score: number }) {
  if (score >= 70) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
      style={{ background: 'rgba(255,60,92,0.15)', color: '#ff3c5c', border: '1px solid rgba(255,60,92,0.2)' }}>
      ● {score}
    </span>
  );
  if (score >= 30) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
      style={{ background: 'rgba(255,214,10,0.12)', color: '#ffd60a', border: '1px solid rgba(255,214,10,0.2)' }}>
      ● {score}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
      style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' }}>
      ● {score}
    </span>
  );
}

// ── StatusPill ────────────────────────────────────────────
const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
  approved: { bg: 'rgba(0,255,136,0.08)',  color: '#00ff88', border: 'rgba(0,255,136,0.18)' },
  flagged:  { bg: 'rgba(255,214,10,0.1)',  color: '#ffd60a', border: 'rgba(255,214,10,0.2)' },
  blocked:  { bg: 'rgba(255,60,92,0.1)',   color: '#ff3c5c', border: 'rgba(255,60,92,0.2)'  },
  otp:      { bg: 'rgba(0,212,255,0.1)',   color: '#00d4ff', border: 'rgba(0,212,255,0.2)'  },
};

export function StatusPill({ status }: { status: string }) {
  const s = statusStyles[status] ?? statusStyles.flagged;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold uppercase tracking-wider"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {status}
    </span>
  );
}

// ── SeverityBadge ─────────────────────────────────────────
const sevStyles: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: 'rgba(255,60,92,0.12)',  color: '#ff3c5c', border: 'rgba(255,60,92,0.25)'  },
  high:     { bg: 'rgba(255,140,66,0.12)', color: '#ff8c42', border: 'rgba(255,140,66,0.25)' },
  medium:   { bg: 'rgba(255,214,10,0.1)',  color: '#ffd60a', border: 'rgba(255,214,10,0.2)'  },
  low:      { bg: 'rgba(0,212,255,0.08)',  color: '#00d4ff', border: 'rgba(0,212,255,0.18)'  },
};

export function SeverityBadge({ severity }: { severity: string }) {
  const s = sevStyles[severity] ?? sevStyles.low;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-widest"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {severity}
    </span>
  );
}

// ── Card ─────────────────────────────────────────────────
interface CardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPad?: boolean;
}
export function Card({ title, actions, children, className, noPad }: CardProps) {
  return (
    <div className={clsx('rounded-2xl overflow-hidden transition-all duration-200 hover:border-[rgba(0,212,255,0.22)]', className)}
      style={{
        background: 'rgba(13,18,36,0.85)',
        border: '1px solid rgba(0,212,255,0.1)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
          <span className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: '#7a8aaa' }}>{title}</span>
          {actions}
        </div>
      )}
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

// ── RechartsTooltip ───────────────────────────────────────
export function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip" style={{ minWidth: 140 }}>
      {label && <p className="text-gray-400 text-xs mb-2">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex justify-between gap-4 text-xs font-semibold">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#00d4ff' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full shimmer-bar transition-all duration-1000"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
