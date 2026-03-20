import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export const metadata: Metadata = {
  title: "FFDS — AI Fraud Detection System",
  description: "AI-Powered Financial Fraud Detection Dashboard — Real-time monitoring, behavioral analysis, and risk scoring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" async></script>
      </head>
      <body className="flex min-h-screen bg-[#080c18] text-[#e2e8f6]">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 40% at 20% 20%, rgba(0,212,255,0.055) 0%, transparent 60%),
                radial-gradient(ellipse 50% 60% at 80% 80%, rgba(123,47,255,0.065) 0%, transparent 60%),
                radial-gradient(ellipse 40% 40% at 50% 50%, rgba(0,255,136,0.025) 0%, transparent 70%)`
            }}
          />
        </div>

        <Sidebar />

        {/* Main */}
        <div className="flex flex-col flex-1 ml-[240px] min-h-screen relative z-10 transition-all duration-300"
          style={{ marginLeft: '240px' }}>
          <Topbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <div className="animate-fade-up">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
