"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import Leaflet components with SSR disabled
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
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface LocationPinMapProps {
  latitude: number;
  longitude: number;
  businessName?: string;
  zoom?: number;
  onChange: (lat: number, lng: number) => void;
}

// Helper hook component to handle map clicks & center changes inside MapContainer
const MapEventHandler = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMapEvents, useMap } = mod;
      return function MapInnerHandler({
        lat,
        lng,
        onChange,
      }: {
        lat: number;
        lng: number;
        onChange: (lat: number, lng: number) => void;
      }) {
        const map = useMap();

        useMapEvents({
          click(e) {
            onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
          },
        });

        useEffect(() => {
          if (lat && lng) {
            map.flyTo([lat, lng], map.getZoom(), { duration: 1.2 });
          }
        }, [lat, lng, map]);

        return null;
      };
    }),
  { ssr: false }
);

export function LocationPinMap({
  latitude,
  longitude,
  businessName = "Business Location",
  zoom = 14,
  onChange,
}: LocationPinMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        onChange(lat, lng);
      },
      (err) => {
        setIsDetecting(false);
        setGeoError(err.message || "Failed to retrieve exact position.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!isClient || !L) {
    return (
      <div className="w-full h-72 rounded-2xl bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center border border-border">
        <MapPin className="w-8 h-8 text-primary animate-bounce mb-2" />
        <span className="text-xs font-bold text-muted-foreground">Loading Interactive Pin Map...</span>
      </div>
    );
  }

  // Create customized animated pin icon
  const customPinIcon = L.divIcon({
    className: "interactive-pin-wrapper",
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.5);
          border: 2px solid #ffffff;
          white-space: nowrap;
          cursor: grab;
        ">
          <span style="font-size: 13px;">📍</span>
          <span>${businessName ? (businessName.length > 18 ? businessName.substring(0, 16) + "…" : businessName) : "Drag to Pin"}</span>
        </div>
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: #4f46e5;
          transform: rotate(45deg);
          border-right: 2px solid white;
          border-bottom: 2px solid white;
        "></div>
      </div>
    `,
    iconSize: [120, 40],
    iconAnchor: [0, 0],
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Crosshair className="w-3.5 h-3.5 text-primary" />
          <span>Click anywhere on the map or drag the pin to set exact coordinates</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="h-7 text-[11px] gap-1 font-semibold"
        >
          <Navigation className={`w-3 h-3 text-primary ${isDetecting ? "animate-spin" : ""}`} />
          {isDetecting ? "Detecting..." : "Detect My GPS"}
        </Button>
      </div>

      {geoError && (
        <div className="text-[11px] text-destructive bg-destructive/10 px-2.5 py-1 rounded-lg">
          {geoError}
        </div>
      )}

      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-border shadow-inner">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <MapContainer
          center={[latitude, longitude]}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={[latitude, longitude]}
            icon={customPinIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e: any) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
              },
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-foreground">{businessName || "Business Location"}</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
                <p className="text-[10px] text-primary mt-1">Drag marker to reposition</p>
              </div>
            </Popup>
          </Marker>

          <MapEventHandler lat={latitude} lng={longitude} onChange={onChange} />
        </MapContainer>

        {/* Live Coordinates Pill Overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-md flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-foreground">
            <span className="text-muted-foreground font-sans">Lat:</span>
            <span className="font-bold">{latitude.toFixed(6)}</span>
          </div>
          <div className="flex items-center gap-1 text-foreground">
            <span className="text-muted-foreground font-sans">Lng:</span>
            <span className="font-bold">{longitude.toFixed(6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
