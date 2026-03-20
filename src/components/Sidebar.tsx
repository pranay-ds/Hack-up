'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Activity, Shield, User, Globe, Smartphone,
  Zap, BrainCircuit, AlertTriangle, Bell, HelpCircle,
  Users, Swords, Settings, ChevronRight, type LucideIcon,
} from 'lucide-react';

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: string;
  badgeColor?: string;
  live?: boolean;
};


const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/',              icon: LayoutDashboard, label: 'Dashboard',        badge: '3',    badgeColor: 'bg-red-500 text-white' } as NavItem,
      { href: '/transactions',  icon: Activity,        label: 'Live Transactions', live: true    } as NavItem,
    ]
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { href: '/risk-scoring',  icon: Shield,      label: 'Risk Scoring'     } as NavItem,
      { href: '/behavior',      icon: User,        label: 'Behavior Analysis'} as NavItem,
      { href: '/geo-intel',     icon: Globe,       label: 'Geo-Intelligence' } as NavItem,
      { href: '/device-ip',     icon: Smartphone,  label: 'Device & IP Intel'} as NavItem,
    ]
  },
  {
    label: 'DETECTION',
    items: [
      { href: '/rule-engine',   icon: Zap,          label: 'Rule Engine'      } as NavItem,
      { href: '/ml-models',     icon: BrainCircuit, label: 'ML Models'        } as NavItem,
      { href: '/anomaly',       icon: AlertTriangle, label: 'Anomaly Detection'} as NavItem,
    ]
  },
  {
    label: 'RESPONSES',
    items: [
      { href: '/alerts',         icon: Bell,       label: 'Alerts',         badge: '5', badgeColor: 'bg-yellow-400 text-black' } as NavItem,
      { href: '/explainability', icon: HelpCircle, label: 'Explainable AI' } as NavItem,
      { href: '/admin',          icon: Users,      label: 'Admin Panel'    } as NavItem,
    ]
  },
  {
    label: 'SECURITY',
    items: [
      { href: '/attack-sim',    icon: Swords,   label: 'Attack Simulation', badge: 'LIVE', badgeColor: 'bg-red-500 text-white text-xs' } as NavItem,
      { href: '/settings',      icon: Settings, label: 'Settings' } as NavItem,
    ]
  },
];


export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-50 border-r overflow-hidden"
      style={{
        width: '240px',
        background: 'rgba(7,10,20,0.97)',
        borderColor: 'rgba(0,212,255,0.1)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#00d4ff,#7b2fff)' }}>
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-black text-sm tracking-wider grad-text">FFDS</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-0.5">Fraud Detection</p>
        </div>
      </div>

      {/* Status pill */}
      <div className="mx-3 my-3 flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.14)' }}>
        <span className="w-2 h-2 rounded-full bg-green-400 pulse-green inline-block" />
        <span className="text-[11px] font-semibold text-green-400">All Systems Operational</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 text-[13px]">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-bold tracking-[0.12em] text-gray-600 px-3 pt-3 pb-1.5">
              {group.label}
            </p>
            {group.items.map(({ href, icon: Icon, label, badge, badgeColor, live }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group relative
                    ${active
                      ? 'text-cyan-400 bg-cyan-400/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 rounded-r-full bg-cyan-400" />
                  )}
                  <Icon className={`w-[17px] h-[17px] flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-cyan-400' : ''}`} />
                  <span className="flex-1 leading-none">{label}</span>
                  {live && <span className="w-2 h-2 rounded-full bg-red-500 pulse-red" />}
                  {badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor || 'bg-gray-700 text-gray-300'} text-white`}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t flex items-center gap-3"
        style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex-shrink-0 font-black text-white text-sm flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#00d4ff,#7b2fff)' }}>A</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs leading-tight">Admin</p>
          <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Security Analyst</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
      </div>
    </aside>
  );
}
