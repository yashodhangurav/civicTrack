"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/complaints')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setComplaints(data);
      })
      .catch(console.error);
  }, []);

  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "fm63BZNe6hXB2ad5Xaz5";

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border border-white/10 z-0 relative">
      <MapContainer 
        center={[19.0760, 72.8777]} // Default center (e.g., Mumbai)
        zoom={11} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
          url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
        />
        {complaints.map(comp => comp.location ? (
          <Marker 
            key={comp.id} 
            position={[comp.location.latitude, comp.location.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-black p-1">
                <h3 className="font-bold text-lg leading-tight">{comp.category?.name || "Reported Issue"}</h3>
                <p className="text-sm my-2 text-gray-700">{comp.description}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    comp.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                    comp.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {comp.priority}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 uppercase">{comp.status?.name}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ) : null)}
      </MapContainer>
    </div>
  );
}
