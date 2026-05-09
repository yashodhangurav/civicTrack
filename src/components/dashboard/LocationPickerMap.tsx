"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerMapProps {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
}

function LocationMarker({ location, setLocation }: LocationPickerMapProps) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return location ? (
    <Marker 
      position={[location.lat, location.lng]} 
      icon={customIcon} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setLocation({ lat: pos.lat, lng: pos.lng });
        }
      }}
    />
  ) : null;
}

export default function LocationPickerMap({ location, setLocation }: LocationPickerMapProps) {
  const mapRef = useRef<L.Map>(null);
  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "fm63BZNe6hXB2ad5Xaz5";
  const defaultCenter: [number, number] = [19.0760, 72.8777];

  useEffect(() => {
    if ("geolocation" in navigator && !location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLoc);
          if (mapRef.current) {
            mapRef.current.flyTo([newLoc.lat, newLoc.lng], 15);
          }
        },
        (err) => console.error("Geolocation failed:", err),
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, [location, setLocation]);

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border border-white/10 relative z-0 mt-2 mb-4">
      <MapContainer 
        center={location ? [location.lat, location.lng] : defaultCenter} 
        zoom={location ? 15 : 11} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
          url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
        />
        <LocationMarker location={location} setLocation={setLocation} />
      </MapContainer>
      <div className="absolute top-2 right-2 z-[400] bg-black/60 backdrop-blur-sm text-xs text-white px-2 py-1 rounded pointer-events-none border border-white/10">
        Click or drag pin to set exact location
      </div>
    </div>
  );
}
