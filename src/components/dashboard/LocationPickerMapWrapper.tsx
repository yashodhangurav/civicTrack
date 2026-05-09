"use client";

import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-white/5 animate-pulse rounded-xl border border-white/10 flex items-center justify-center text-gray-400 mt-2 mb-4">
      Loading GPS Map...
    </div>
  )
});

interface Props {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
}

export default function LocationPickerMapWrapper(props: Props) {
  return <LocationPickerMap {...props} />;
}
