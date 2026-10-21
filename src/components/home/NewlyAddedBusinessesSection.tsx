"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCw, Sparkles, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessFeaturedCard } from "@/components/home/BusinessFeaturedCard";
import { Business } from "@/types/business";

interface NewlyAddedBusinessesSectionProps {
  initialBusinesses: Business[];
  totalNewCount?: number;
}

export function NewlyAddedBusinessesSection({
  initialBusinesses,
  totalNewCount = 0,
}: NewlyAddedBusinessesSectionProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/businesses/newly-added?limit=4&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.businesses && data.businesses.length > 0) {
          setBusinesses(data.businesses);
        }
      }
    } catch (err) {
      console.error("Failed to refresh newly added businesses:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  if (!businesses || businesses.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mt-12 xs:mt-16 sm:mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 xs:mb-6 sm:mb-8 gap-2.5 xs:gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 xs:px-2.5 py-0.5 rounded-full text-[10px] xs:text-[11px] sm:text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-amber-500 animate-pulse" />
            <span>Just Listed & Fresh Additions</span>
            {totalNewCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[9px] xs:text-[10px] rounded-full font-black">
                {totalNewCount}
              </span>
            )}
          </div>
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Newly Added Businesses
          </h2>
          <p className="text-[11px] xs:text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Explore recent local registrations, fresh establishments, and rising community spots.
          </p>
        </div>

        <div className="flex items-center gap-1.5 xs:gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-0.5 sm:pb-0 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-7.5 xs:h-8 sm:h-9 px-2.5 xs:px-3 sm:px-3.5 rounded-lg xs:rounded-xl gap-1.5 text-[11px] xs:text-xs sm:text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
            title="Refresh latest listings"
          >
            <RotateCw
              className={`w-3 h-3 xs:w-3.5 xs:h-3.5 text-amber-500 transition-transform ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </Button>

          <Link href="/dashboard/listings/new" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7.5 xs:h-8 sm:h-9 px-2.5 xs:px-3 sm:px-3.5 rounded-lg xs:rounded-xl gap-1.5 font-semibold text-[11px] xs:text-xs sm:text-sm border-dashed border-primary/40 hover:border-primary text-foreground hover:bg-primary/5 shrink-0"
            >
              <PlusCircle className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-primary" />
              <span>Add Business</span>
            </Button>
          </Link>

          <Link href="/search?sort=newest" className="shrink-0">
            <Button
              variant="default"
              size="sm"
              className="h-7.5 xs:h-8 sm:h-9 px-2.5 xs:px-3 sm:px-3.5 rounded-lg xs:rounded-xl gap-1.5 font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs text-[11px] xs:text-xs sm:text-sm shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 transition-opacity duration-300">
        {businesses.map((biz) => (
          <BusinessFeaturedCard key={biz.id} biz={biz} />
        ))}
      </div>
    </section>
  );
}
