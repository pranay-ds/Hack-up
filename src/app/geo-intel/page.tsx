'use client';

import { useEffect, useRef, useState } from 'react';
import { geoTransactions, ipIntelligence } from '@/lib/simulator';
import { Card, StatusPill } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

const riskColor = (r: number) => r >= 70 ? '#ff3c5c' : r >= 30 ? '#ffd60a' : '#00ff88';

export default function GeoIntelPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const [activeGeo, setActiveGeo] = useState(geoTransactions[4]); // New York (blocked)

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstance.current) return;
    const L = (window as unknown as { L: { map: (...args: unknown[]) => unknown; tileLayer: (...args: unknown[]) => unknown; circleMarker: (...args: unknown[]) => unknown; polyline: (...args: unknown[]) => unknown } }).L;
    if (!L || !mapRef.current) return;

    const map = (L.map as (...args: unknown[]) => { setView: (c: number[], z: number) => unknown; }) (mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }) as { setView: (c: number[], z: number) => typeof map; };
    map.setView([20, 78], 3);

    (L.tileLayer as (url: string, opts: object) => { addTo: (m: unknown) => void })(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 18 }
    ).addTo(map);

    geoTransactions.forEach(t => {
      const color = riskColor(t.risk);
      const marker = (L.circleMarker as (latlng: number[], opts: object) => { addTo: (m: unknown) => void; bindPopup: (s: string) => unknown })([t.lat, t.lng], {
        radius: t.risk > 60 ? 10 : 7,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      });
      marker.addTo(map);
      marker.bindPopup(`<div style="background:#0d1224;color:#e2e8f6;border:1px solid rgba(0,212,255,0.2);border-radius:8px;padding:10px;font-family:Inter,sans-serif;font-size:12px">
        <b>${t.city}</b><br/>Amount: ₹${t.amount.toLocaleString()}<br/>Risk: <b style="color:${color}">${t.risk}</b>
      </div>`);
    });

    // Impossible travel line
    const mumbai = [19.07, 72.87];
    const newYork = [40.71, -74.00];
    (L.polyline as (latlngs: number[][], opts: object) => { addTo: (m: unknown) => void })(
      [mumbai, newYork] as unknown as number[][],
      { color: '#ff3c5c', weight: 2, dashArray: '8 6', opacity: 0.8 }
    ).addTo(map);

    mapInstance.current = map;
  }, []);

  const impossibleTravel = {
    from: 'Mumbai, India',
    to: 'New York, USA',
    time: '8 minutes',
    distance: '11,785 km',
    speed: '88,387 km/h',
    userId: 'USR3847',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black grad-text">Geo-Intelligence</h1>
        <p className="text-gray-500 text-sm mt-0.5">Transaction geolocation, impossible travel detection, and IP intelligence</p>
      </div>

      {/* Impossible travel alert */}
      <div className="flex items-start gap-4 p-4 rounded-2xl animate-glow-ring"
        style={{ background: 'rgba(255,60,92,0.07)', border: '2px solid rgba(255,60,92,0.3)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,60,92,0.15)', color: '#ff3c5c' }}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-black text-sm text-red-400">🚨 Impossible Travel Detected — {impossibleTravel.userId}</p>
          <p className="text-xs text-gray-400 mt-1">
            {impossibleTravel.from} → {impossibleTravel.to} in <span className="text-red-400 font-bold">{impossibleTravel.time}</span> &nbsp;|&nbsp;
            Distance: <span className="text-red-400 font-bold">{impossibleTravel.distance}</span> &nbsp;|&nbsp;
            Required Speed: <span className="text-red-400 font-bold">{impossibleTravel.speed}</span>
          </p>
        </div>
        <span className="text-xs font-black px-3 py-1 rounded-full" style={{ background: 'rgba(255,60,92,0.15)', color: '#ff3c5c', border: '1px solid rgba(255,60,92,0.3)' }}>
          BLOCKED
        </span>
      </div>

      {/* Map */}
      <Card title="Global Transaction Map" noPad>
        <div id="geoMap" ref={mapRef} style={{ width: '100%', height: 400, borderRadius: '0 0 14px 14px' }} />
      </Card>

      {/* Transaction list + IP table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Recent Geo Events">
          <div className="space-y-2">
            {geoTransactions.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03]"
                style={{ border: '1px solid rgba(0,212,255,0.07)' }}
                onClick={() => setActiveGeo(t)}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: riskColor(t.risk), boxShadow: `0 0 6px ${riskColor(t.risk)}` }} />
                <span className="text-sm font-semibold text-gray-200 flex-1">{t.city}</span>
                <span className="text-xs text-gray-500 mono">₹{t.amount.toLocaleString()}</span>
                <span className="text-xs font-bold" style={{ color: riskColor(t.risk) }}>Score: {t.risk}</span>
                <StatusPill status={t.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="IP Intelligence">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                  {['IP', 'Country', 'Type', 'VPN', 'TOR', 'Risk'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[10px] font-bold tracking-widest uppercase" style={{ color: '#4a5570' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ipIntelligence.map(ip => {
                  const rr = ip.risk === 'critical' ? '#ff3c5c' : ip.risk === 'high' ? '#ff8c42' : '#00ff88';
                  return (
                    <tr key={ip.ip} style={{ borderBottom: '1px solid rgba(0,212,255,0.05)' }} className="hover:bg-white/[0.02] transition-all">
                      <td className="py-2.5 px-2 mono font-semibold text-cyan-400">{ip.ip}</td>
                      <td className="py-2.5 px-2 text-gray-300">{ip.country}</td>
                      <td className="py-2.5 px-2 text-gray-400">{ip.type}</td>
                      <td className="py-2.5 px-2">
                        <span style={{ color: ip.vpn ? '#ff3c5c' : '#00ff88' }} className="font-bold">{ip.vpn ? 'YES' : 'NO'}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span style={{ color: ip.tor ? '#ff3c5c' : '#00ff88' }} className="font-bold">{ip.tor ? 'YES' : 'NO'}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="uppercase font-black text-[10px] px-2 py-0.5 rounded-md"
                          style={{ color: rr, background: `${rr}18`, border: `1px solid ${rr}33` }}>
                          {ip.risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
