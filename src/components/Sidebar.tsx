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
      { href: '/alerts',         icon: Bell,       label: 'Alerts',         badge: '5', badgeColor: 'bg-yellow-500 text-white' } as NavItem,
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
      className="fixed left-0 top-0 h-screen flex flex-col z-50 border-r bg-white border-gray-200 overflow-hidden"
      style={{ width: '240px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200 h-[60px]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#387ed1]">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-gray-800 leading-tight">Sentinel Core</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-tight">Enterprise</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 text-[13px]">
        {navGroups.map(group => (
          <div key={group.label} className="pb-4">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400 px-3 pb-2 uppercase">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label, badge, badgeColor, live }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors group
                      ${active
                        ? 'text-[#387ed1] bg-blue-50/60'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#387ed1]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="flex-1 leading-none">{label}</span>
                    {live && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    {badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor || 'bg-gray-200 text-gray-700'}`}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
        <span className="text-xs font-medium text-gray-600">All Systems Normal</span>
      </div>
    </aside>
  );
}
