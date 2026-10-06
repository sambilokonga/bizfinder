"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCw, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessFeaturedCard } from "@/components/home/BusinessFeaturedCard";
import { Business } from "@/types/business";

interface FeaturedBusinessesSectionProps {
  initialBusinesses: Business[];
}

export function FeaturedBusinessesSection({
  initialBusinesses,
}: FeaturedBusinessesSectionProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleShuffle = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/businesses/featured?limit=4&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.businesses && data.businesses.length > 0) {
          setBusinesses(data.businesses);
        }
      }
    } catch (err) {
      console.error("Failed to shuffle featured businesses:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Hand-picked & Verified
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Featured Local Businesses
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Discover latest verified additions and popular community picks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            disabled={isRefreshing}
            className="gap-2 font-medium rounded-xl text-xs sm:text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Discover different listings"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-indigo-500 transition-transform ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Shuffle</span>
          </Button>

          <Link href="/search">
            <Button
              variant="default"
              size="sm"
              className="gap-2 font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              Browse All Listings
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
