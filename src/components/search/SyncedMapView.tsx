"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Business } from "@/types/business";
import { Star, MapPin, ExternalLink, Navigation } from "lucide-react";
import Link from "next/link";
import { getLiveOpeningStatus } from "@/lib/utils/opening-hours";
import { getBusinessCoverUrl, DEFAULT_BUSINESS_COVER } from "@/lib/utils/business-media";
import { Badge } from "@/components/ui/badge";

// Dynamically import Leaflet map components with SSR disabled
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

interface SyncedMapViewProps {
  businesses: Business[];
  selectedBusinessId?: string | null;
  onSelectBusiness: (biz: Business) => void;
  center?: [number, number];
}

export function SyncedMapView({
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  center = [8.9972, 38.7865], // Default to Bole, Addis Ababa
}: SyncedMapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import leaflet library and css on client
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      // Fix leaflet default marker icon urls in webpack / Next.js
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
      <div className="w-full h-full min-h-[450px] rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-border">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin className="w-8 h-8 text-primary animate-bounce" />
          <span className="text-sm font-semibold">Loading Interactive Map...</span>
        </div>
      </div>
    );
  }

  // Create custom marker icons
  const createCustomIcon = (isSelected: boolean, categoryName: string, name: string) => {
    const bgGradient = isSelected
      ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
      : "#0f172a";
    return L.divIcon({
      className: "custom-leaflet-pin",
      html: `
        <div style="
          background: ${bgGradient};
          color: white;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: ${
            isSelected
              ? "0 8px 20px rgba(79, 70, 229, 0.45)"
              : "0 4px 12px rgba(0,0,0,0.3)"
          };
          border: 2px solid ${isSelected ? "#c7d2fe" : "#ffffff"};
          transform: scale(${isSelected ? 1.18 : 1});
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          cursor: pointer;
        ">
          <span style="font-size: 13px;">📍</span>
          <span>${name.length > 14 ? name.substring(0, 12) + "…" : name}</span>
        </div>
      `,
      iconSize: [80, 32],
      iconAnchor: [40, 16],
    });
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-border shadow-lg relative z-10">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "500px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {businesses.map((biz) => {
          const liveStatus = getLiveOpeningStatus(biz.openingHours);
          const isSelected = selectedBusinessId === biz.id;

          return (
            <Marker
              key={biz.id}
              position={[biz.latitude, biz.longitude]}
              icon={createCustomIcon(isSelected, biz.categoryName, biz.name)}
              eventHandlers={{
                click: () => onSelectBusiness(biz),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 max-w-[240px]">
                  {/* Thumbnail */}
                  <div className="relative w-full h-28 rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getBusinessCoverUrl(biz)}
                      alt={biz.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_BUSINESS_COVER;
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant={liveStatus.isOpen ? "success" : "destructive"}
                        className="text-[10px] py-0 px-2 font-bold backdrop-blur-md shadow-sm"
                      >
                        {liveStatus.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </div>

                  <div className="font-bold text-sm text-foreground mb-0.5 line-clamp-1">
                    {biz.name}
                  </div>

                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {biz.categoryName}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-0.5 font-bold text-foreground">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{biz.ratingAvg.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span className="font-bold">{biz.attributes.priceTier || "$$"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                      {biz.addressLine}
                    </span>
                    <Link
                      href={`/business/${biz.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
                    >
                      View
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

