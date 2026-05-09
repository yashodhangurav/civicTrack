"use client";

import dynamic from 'next/dynamic';

const MapDashboard = dynamic(() => import('./MapDashboard'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-white/5 animate-pulse rounded-2xl border border-white/10 flex items-center justify-center text-gray-400">
      Loading Map Data...
    </div>
  )
});

export default function MapWrapper() {
  return <MapDashboard />;
}
