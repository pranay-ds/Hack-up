'use client';

import { usePathname } from 'next/navigation';
import { Topbar } from "@/components/Topbar";
import { LiveTicker } from "@/components/LiveTicker";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/server-login';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen relative z-10 transition-all duration-300 w-full bg-gray-50/30">
      <Topbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
        {pathname === '/' && <LiveTicker />}
        <div className="animate-fade-up flex-1 w-full">{children}</div>
      </main>
    </div>
  );
}
