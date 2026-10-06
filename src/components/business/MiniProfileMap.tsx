"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

interface MiniProfileMapProps {
  latitude: number;
  longitude: number;
  name: string;
  addressLine: string;
}

export function MiniProfileMap({
  latitude,
  longitude,
  name,
  addressLine,
}: MiniProfileMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isClient || !L) {
    return (
      <div className="w-full h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-border">
        <MapPin className="w-5 h-5 text-indigo-500 animate-bounce" />
      </div>
    );
  }

  const customPin = L.divIcon({
    className: "custom-pin",
    html: `
      <div style="
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
        padding: 6px 10px;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
        border: 2px solid white;
      ">
        <span>📍</span>
        <span>Here</span>
      </div>
    `,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
  });

  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-border shadow-sm">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        dragging={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={customPin} />
      </MapContainer>

      {/* Floating Directions Action */}
      <div className="absolute bottom-2.5 right-2.5 z-[400]">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="sm"
            variant="default"
            className="h-8 text-xs font-bold gap-1.5 shadow-lg bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-400" />
            Navigate
          </Button>
        </a>
      </div>
    </div>
  );
}
