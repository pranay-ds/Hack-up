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

const accentIconBg = {
  cyan:   'bg-blue-50',
  green:  'bg-green-50',
  red:    'bg-red-50',
  yellow: 'bg-yellow-50',
  purple: 'bg-purple-50',
};
const accentIconColor = {
  cyan: 'text-[#387ed1]', green: 'text-green-600', red: 'text-red-500', yellow: 'text-yellow-600', purple: 'text-purple-600',
};

export function StatCard({ label, value, sub, subColor = 'muted', accent = 'cyan', icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 mb-2">{value}</p>
          {sub && (
            <p className={clsx('text-xs flex items-center gap-1 font-medium', {
              'text-green-600': subColor === 'green',
              'text-red-600':   subColor === 'red',
              'text-gray-500':  subColor === 'muted',
            })}>{sub}</p>
          )}
        </div>

        {icon && (
          <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", accentIconBg[accent], accentIconColor[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ── RiskBadge ─────────────────────────────────────────────
export function RiskBadge({ score }: { score: number }) {
  if (score >= 70) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
      ● {score}
    </span>
  );
  if (score >= 30) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">
      ● {score}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-600 border border-green-100">
      ● {score}
    </span>
  );
}

// ── StatusPill ────────────────────────────────────────────
const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
  approved: { bg: 'bg-green-50',  color: 'text-green-600', border: 'border-green-200' },
  flagged:  { bg: 'bg-yellow-50', color: 'text-yellow-600', border: 'border-yellow-200' },
  blocked:  { bg: 'bg-red-50',    color: 'text-red-600', border: 'border-red-200'  },
  otp:      { bg: 'bg-blue-50',   color: 'text-blue-600', border: 'border-blue-200'  },
};

export function StatusPill({ status }: { status: string }) {
  const s = statusStyles[status] ?? statusStyles.flagged;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold uppercase tracking-wider border", s.bg, s.color, s.border)}>
      <span className="w-1.5 h-1.5 rounded-full fill-current bg-current opacity-70" />
      {status}
    </span>
  );
}

// ── SeverityBadge ─────────────────────────────────────────
const sevStyles: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: 'bg-red-50',     color: 'text-red-600', border: 'border-red-200'  },
  high:     { bg: 'bg-orange-50',  color: 'text-orange-600', border: 'border-orange-200' },
  medium:   { bg: 'bg-yellow-50',  color: 'text-yellow-600', border: 'border-yellow-200'  },
  low:      { bg: 'bg-blue-50',    color: 'text-blue-600', border: 'border-blue-200'  },
};

export function SeverityBadge({ severity }: { severity: string }) {
  const s = sevStyles[severity] ?? sevStyles.low;
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border", s.bg, s.color, s.border)}>
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
    <div className={clsx('bg-white border border-gray-200 rounded-xl shadow-sm', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {actions && <div className="text-gray-500">{actions}</div>}
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
    <div className="bg-white border border-gray-200 rounded shadow-lg p-3 min-w-[140px]">
      {label && <p className="text-gray-500 text-xs font-medium mb-2 pb-2 border-b border-gray-100">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex justify-between gap-4 text-xs font-medium py-0.5">
          <span className="text-gray-600">{p.name}</span>
          <span className="font-bold text-gray-900">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#387ed1' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
