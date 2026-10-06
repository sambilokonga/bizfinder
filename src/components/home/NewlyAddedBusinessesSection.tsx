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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Just Listed & Fresh Additions
            {totalNewCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-black">
                {totalNewCount}
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Newly Added Businesses
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Explore recent local registrations, fresh establishments, and rising community spots.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 font-medium rounded-xl text-xs sm:text-sm hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            title="Refresh latest listings"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-amber-500 transition-transform ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </Button>

          <Link href="/dashboard/listings/new">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-semibold rounded-xl text-xs sm:text-sm border-dashed border-primary/40 hover:border-primary text-foreground hover:bg-primary/5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-primary" />
              <span>Add Your Business</span>
            </Button>
          </Link>

          <Link href="/search?sort=newest">
            <Button
              variant="default"
              size="sm"
              className="gap-2 font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm text-xs sm:text-sm"
            >
              <span>View All Newest</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300">
        {businesses.map((biz) => (
          <BusinessFeaturedCard key={biz.id} biz={biz} />
        ))}
      </div>
    </section>
  );
}
