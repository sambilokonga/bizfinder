"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Business } from "@/types/business";
import { getLiveOpeningStatus } from "@/lib/utils/opening-hours";

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "cat-hotels": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  "cafe-coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  "cat-dining": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  "food-dining": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  "shopping-retail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  "shops-retail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  automotive: "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80",
  health: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
  electronics: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
};

function getBusinessFallbackImage(biz: Business): string {
  if (biz.media && biz.media.length > 0 && biz.media[0]?.url) {
    return biz.media[0].url;
  }
  const catKey = (biz.categoryId || biz.categoryName || "").toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (catKey.includes(key)) {
      return url;
    }
  }
  return CATEGORY_FALLBACK_IMAGES.default;
}

interface BusinessFeaturedCardProps {
  biz: Business;
}

export function BusinessFeaturedCard({ biz }: BusinessFeaturedCardProps) {
  const liveStatus = getLiveOpeningStatus(biz.openingHours);
  const fallbackImg = getBusinessFallbackImage(biz);
  const [imgSrc, setImgSrc] = useState(biz.coverUrl || fallbackImg);

  const isRecent = (() => {
    if (!biz.createdAt) return false;
    const createdDate = new Date(biz.createdAt).getTime();
    const now = Date.now();
    const daysOld = (now - createdDate) / (1000 * 60 * 60 * 24);
    return daysOld <= 30;
  })();

  return (
    <div className="group relative flex flex-col rounded-3xl bg-card border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Thumbnail Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link href={`/business/${biz.id}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={biz.name}
            onError={() => setImgSrc(fallbackImg)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Category & New Pill Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
            {biz.categoryName}
          </span>
          {isRecent && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              NEW
            </span>
          )}
        </div>

        {/* Top-Right Favorite Heart Button */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton
            businessId={biz.id}
            businessName={biz.name}
            businessCity={biz.cityName}
            businessCountry={biz.countryName}
            variant="card"
            size="sm"
          />
        </div>

        {/* Live Status Badge */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <Badge
            variant={liveStatus.isOpen ? "success" : "destructive"}
            className="backdrop-blur-md font-bold text-[11px] shadow-sm"
          >
            {liveStatus.statusText}
          </Badge>
        </div>
      </div>

      {/* Card Body */}
      <Link href={`/business/${biz.id}`} className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {biz.name}
            </h3>
            {biz.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0 mt-0.5" />
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {biz.shortDescription || biz.description}
          </p>
        </div>

        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          {biz.reviewCount > 0 ? (
            <div className="flex items-center gap-1 font-bold text-foreground">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{biz.ratingAvg.toFixed(1)}</span>
              <span className="text-muted-foreground font-normal">
                ({biz.reviewCount})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Newly Listed</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground truncate max-w-[130px]">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{biz.districtName || biz.cityName}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
