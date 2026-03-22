import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import AppLayout from "@/components/AppLayout";

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
      <body className="flex min-h-screen font-sans text-gray-800 bg-white">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
