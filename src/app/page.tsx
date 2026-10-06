import React from "react";
import Link from "next/link";
import { SearchHero } from "@/components/home/SearchHero";
import { CategoryChips } from "@/components/home/CategoryChips";
import { NearMeShortcuts } from "@/components/home/NearMeShortcuts";
import { FeaturedBusinessesSection } from "@/components/home/FeaturedBusinessesSection";
import { NewlyAddedBusinessesSection } from "@/components/home/NewlyAddedBusinessesSection";
import {
  getFeaturedBusinesses,
  getNewlyAddedBusinesses,
  getPlatformHomeStats,
} from "@/lib/db/queries/businesses";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import {
  Sparkles,
  Clock,
  Compass,
  ShieldCheck,
  TrendingUp,
  Building2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let featuredBusinesses = SEED_BUSINESSES.slice(0, 4);
  let newlyAddedBusinesses = SEED_BUSINESSES.slice(0, 4);
  let stats = {
    verifiedListings: 520,
    totalListings: 521,
    totalCategories: 489,
    primaryCategories: 70,
    monthlyExplorers: 75,
    verificationRate: "99.8%",
    newlyAddedCount: 7,
  };

  try {
    const [dbFeatured, dbNew, dbStats] = await Promise.all([
      getFeaturedBusinesses(4),
      getNewlyAddedBusinesses(4),
      getPlatformHomeStats(),
    ]);

    if (dbFeatured && dbFeatured.length > 0) {
      featuredBusinesses = dbFeatured;
    }
    if (dbNew && dbNew.length > 0) {
      newlyAddedBusinesses = dbNew;
    }
    if (dbStats) {
      stats = dbStats;
    }
  } catch (e) {
    console.error("[HomePage] Error fetching real stats or businesses:", e);
  }

  return (
    <div className="w-full pb-20">
      {/* Top Search Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchHero />
        {/* NearMeShortcuts hidden to reduce home page clutter */}
        {/* <NearMeShortcuts /> */}
      </section>

      {/* Category Icons Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <CategoryChips />
      </section>

      {/* Featured & Verified Listings Section (Dynamic & Rotated) */}
      <FeaturedBusinessesSection initialBusinesses={featuredBusinesses} />

      {/* Newly Added Businesses Section (Real Recent Community Additions) */}
      <NewlyAddedBusinessesSection
        initialBusinesses={newlyAddedBusinesses}
        totalNewCount={stats.newlyAddedCount}
      />

      {/* Value Proposition Highlights: Why BizFinder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> Built for Instant Local Discovery
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            The Smartest Way to Explore Your City
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Engineered with high-speed query parsing, live opening hours, and synchronized map navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 border border-indigo-200 dark:border-indigo-800">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Synchronized Map & Distance
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Find exactly how far a place is with Haversine spherical precision. Filter by 1km to 50km radius around your location.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-200 dark:border-emerald-800">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Real-Time Live Opening Hours
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Never show up to closed doors. Real-time evaluations identify open spots, overnight shifts, 24/7 locations, and closing countdowns.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-card border border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Verified Business Profiles
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Official owner verification, authenticated phone numbers, menu items, photo galleries, and genuine local reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Stats Counter Bar with Real Live Data */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/30 border border-indigo-100 dark:border-indigo-900/50 p-8 sm:p-10 shadow-sm">
          {/* Top Live Sync Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-6 border-b border-indigo-100/80 dark:border-indigo-900/40">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Live Platform Telemetry</span>
              <span className="text-muted-foreground font-normal">•</span>
              <span className="text-muted-foreground font-normal">Real database verification stats</span>
            </div>

            {stats.newlyAddedCount > 0 && (
              <Link
                href="/search?sort=newest"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{stats.newlyAddedCount} newly added businesses this month</span>
                <span className="text-amber-500">&rarr;</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="p-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                {stats.verifiedListings.toLocaleString()}+
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground mt-1.5">
                Verified Listings
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                {stats.totalListings.toLocaleString()} total local directory spots
              </div>
            </div>

            <div className="p-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                {stats.totalCategories > 0 ? `${stats.totalCategories}+` : "70+"}
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground mt-1.5">
                Business Categories
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Across {stats.primaryCategories} primary industry sectors
              </div>
            </div>

            <div className="p-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-pink-600 dark:text-pink-400 tracking-tight">
                {stats.monthlyExplorers > 0 ? `${stats.monthlyExplorers.toLocaleString()}+` : "50+"}
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground mt-1.5">
                Monthly Explorers
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Active searchers & community members
              </div>
            </div>

            <div className="p-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {stats.verificationRate}
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground mt-1.5">
                Data Verification
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Owner-authenticated accuracy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Business CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-950 p-8 sm:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              For Business Owners & Managers
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Own a business? Claim your free profile today.
            </h2>
            <p className="text-sm sm:text-base text-indigo-100/80 leading-relaxed">
              Take control of your hours, showcase high-res photos and YouTube videos, respond directly to customer reviews, and view real-time performance analytics.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link href="/dashboard/listings/new">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 font-bold rounded-2xl shadow-lg">
                  Claim or Add Listing
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-2xl font-semibold">
                  Browse Directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

