"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Globe,
  MapPin,
  Building2,
  Crown,
  Users,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

// Map controller to smoothly fly to selected territory
const MapController = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod;
      return function Controller({
        center,
        zoom,
      }: {
        center: [number, number];
        zoom: number;
      }) {
        const map = useMap();
        useEffect(() => {
          if (center && center[0] && center[1]) {
            map.flyTo(center, zoom, { duration: 1.2 });
          }
        }, [center, zoom, map]);
        return null;
      };
    }),
  { ssr: false }
);

export interface TerritoryMapPin {
  id: string;
  name: string;
  type: "country" | "region" | "city" | "subcity" | "district" | string;
  latitude: number;
  longitude: number;
  countryCode?: string;
  flag?: string;
  assignedAdmin?: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  businessCount?: number;
}

interface TerritoryMapProps {
  territories: TerritoryMapPin[];
  selectedTerritoryId?: string;
  onSelectTerritory?: (id: string) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export function TerritoryMap({
  territories,
  selectedTerritoryId,
  onSelectTerritory,
  className = "h-[500px] w-full",
  center = [9.010793, 38.761252], // Default Addis Ababa / Ethiopia center
  zoom = 6,
}: TerritoryMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);
  const [activeCenter, setActiveCenter] = useState<[number, number]>(center);
  const [activeZoom, setActiveZoom] = useState<number>(zoom);
  const [filterType, setFilterType] = useState<string>("all");

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

  // Update center if selected territory changes
  useEffect(() => {
    if (selectedTerritoryId) {
      const found = territories.find((t) => t.id === selectedTerritoryId);
      if (found && found.latitude && found.longitude) {
        setActiveCenter([found.latitude, found.longitude]);
        setActiveZoom(found.type === "country" ? 5 : found.type === "city" ? 11 : 14);
      }
    }
  }, [selectedTerritoryId, territories]);

  // Create custom markers based on territory type and admin status
  const getCustomIcon = (pin: TerritoryMapPin) => {
    if (!L) return undefined;

    const isSelected = pin.id === selectedTerritoryId;
    const hasAdmin = !!pin.assignedAdmin;
    const isCountry = pin.type === "country";
    const isCity = pin.type === "city";

    const bgClass = isCountry
      ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950"
      : isCity
      ? hasAdmin
        ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
        : "bg-slate-700 text-slate-200"
      : "bg-emerald-600 text-white";

    const iconHtml = `
      <div class="relative flex items-center justify-center transition-transform hover:scale-125 ${isSelected ? "scale-125 ring-4 ring-primary" : ""}" style="width: 32px; height: 32px;">
        <div class="w-8 h-8 rounded-2xl ${bgClass} shadow-xl flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-900">
          ${isCountry ? "👑" : isCity ? "🏙️" : "📍"}
        </div>
        ${
          pin.businessCount && pin.businessCount > 0
            ? `<div class="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white dark:border-slate-900 shadow">
                ${pin.businessCount}
              </div>`
            : ""
        }
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: "custom-leaflet-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const filteredTerritories = useMemo(() => {
    return territories.filter((t) => {
      if (filterType === "all") return true;
      if (filterType === "assigned") return !!t.assignedAdmin;
      if (filterType === "vacant") return !t.assignedAdmin;
      return t.type === filterType;
    });
  }, [territories, filterType]);

  if (!isClient) {
    return (
      <div className={`rounded-3xl border border-border bg-card/60 backdrop-blur flex flex-col items-center justify-center text-muted-foreground ${className}`}>
        <Globe className="w-8 h-8 animate-spin text-primary/40 mb-2" />
        <span className="text-xs font-semibold">Initializing Geographic Radar...</span>
      </div>
    );
  }

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-border shadow-xl bg-card ${className}`}>
      {/* Map Filter & Telemetry Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-border shadow-lg pointer-events-auto text-xs">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-foreground">Active Map Pins:</span>
          <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-4">
            {filteredTerritories.length} / {territories.length}
          </Badge>
        </div>

        <div className="flex items-center gap-1 bg-background/90 backdrop-blur-md p-1 rounded-2xl border border-border shadow-lg pointer-events-auto text-[11px]">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              filterType === "all" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Nodes
          </button>
          <button
            type="button"
            onClick={() => setFilterType("country")}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              filterType === "country" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            👑 Nations
          </button>
          <button
            type="button"
            onClick={() => setFilterType("city")}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              filterType === "city" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🏙️ Cities
          </button>
          <button
            type="button"
            onClick={() => setFilterType("subcity")}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              filterType === "subcity" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📍 Subcities
          </button>
          <button
            type="button"
            onClick={() => setFilterType("assigned")}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              filterType === "assigned" ? "bg-emerald-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ✓ Assigned
          </button>
        </div>
      </div>

      {/* Actual Map Container */}
      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapController center={activeCenter} zoom={activeZoom} />

        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {filteredTerritories.map((pin) => {
          const customIcon = getCustomIcon(pin);
          return (
            <React.Fragment key={pin.id}>
              <Marker
                position={[pin.latitude, pin.longitude]}
                icon={customIcon}
                eventHandlers={{
                  click: () => {
                    if (onSelectTerritory) onSelectTerritory(pin.id);
                  },
                }}
              >
                <Popup className="territory-map-popup">
                  <div className="p-2 space-y-2 min-w-[200px] text-foreground font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-border pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <span>{pin.flag || "📍"}</span>
                        <span>{pin.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-mono px-1 py-0 capitalize">
                        {pin.type}
                      </Badge>
                    </div>

                    <div className="text-[11px] space-y-1 text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Coordinates:</span>
                        <span className="font-mono font-medium text-foreground">
                          {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Directory Listings:</span>
                        <span className="font-bold text-primary font-mono">
                          {pin.businessCount ?? 0} businesses
                        </span>
                      </div>

                      <div className="pt-1 border-t border-border">
                        <div className="font-bold text-[10px] uppercase text-muted-foreground mb-0.5">
                          Assigned Jurisdiction Lead:
                        </div>
                        {pin.assignedAdmin ? (
                          <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20 text-foreground">
                            <div className="font-bold text-xs text-primary flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-500" />
                              <span>{pin.assignedAdmin.name}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {pin.assignedAdmin.email}
                            </div>
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium text-[10px]">
                            ⚠️ Vacant — No Lead Appointed
                          </div>
                        )}
                      </div>
                    </div>

                    {onSelectTerritory && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onSelectTerritory(pin.id)}
                        className="w-full text-xs font-bold py-1 h-7 mt-1"
                      >
                        Inspect Territory Node
                      </Button>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Territory Radius Glow Circle */}
              {pin.type === "city" && (
                <Circle
                  center={[pin.latitude, pin.longitude]}
                  radius={pin.businessCount && pin.businessCount > 50 ? 15000 : 8000}
                  pathOptions={{
                    color: pin.assignedAdmin ? "#6366f1" : "#f59e0b",
                    fillColor: pin.assignedAdmin ? "#818cf8" : "#fbbf24",
                    fillOpacity: 0.12,
                    weight: 1.5,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Leaflet CSS Link */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    </div>
  );
}
