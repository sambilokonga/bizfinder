"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
  ChevronRight,
  Store,
  Layers,
} from "lucide-react";
import {
  CategoryIconBadge,
  getCategoryTheme,
} from "@/lib/utils/category-icon-helper";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";

// Curated list of high-intent, popular consumer categories on home page
const POPULAR_CATEGORY_SPECS = [
  {
    id: "cat-1",
    name: "Restaurants & Dining",
    slug: "restaurants-food-services",
    icon: "UtensilsCrossed",
    tagline: "Fine dining, buffets & local spots",
    group: "food",
  },
  {
    id: "cat-coffee",
    name: "Cafés & Bakeries",
    slug: "bakeries-confectionery",
    icon: "Coffee",
    tagline: "Artisan roasters & fresh pastries",
    group: "food",
  },
  {
    id: "cat-shops-retail",
    name: "Shops & Supermarkets",
    slug: "shops-retail",
    icon: "ShoppingBag",
    tagline: "Groceries, fashion & retail malls",
    group: "shopping",
  },
  {
    id: "cat-8",
    name: "Hospitals & Medical",
    slug: "health-medical",
    icon: "HeartPulse",
    tagline: "Clinics, diagnostics & specialists",
    group: "health",
  },
  {
    id: "cat-9",
    name: "Pharmacies & Meds",
    slug: "pharmacy-pharmaceutical",
    icon: "Pill",
    tagline: "24/7 dispensaries & healthcare",
    group: "health",
  },
  {
    id: "cat-31",
    name: "Hotels & Stays",
    slug: "hotels-accommodation",
    icon: "Hotel",
    tagline: "Luxury resorts & business rooms",
    group: "lifestyle",
  },
  {
    id: "cat-27",
    name: "Automotive & Repairs",
    slug: "automotive",
    icon: "Car",
    tagline: "Service centers, parts & rentals",
    group: "services",
  },
  {
    id: "cat-7",
    name: "Beauty & Salons",
    slug: "beauty-personal-care",
    icon: "Sparkles",
    tagline: "Hair studios, barbers & luxury spas",
    group: "lifestyle",
  },
  {
    id: "cat-25",
    name: "Electronics & Tech",
    slug: "software-it-services",
    icon: "Laptop",
    tagline: "Gadgets, computer repair & IT",
    group: "services",
  },
  {
    id: "cat-17",
    name: "Banks & Financial",
    slug: "banking-financial-services",
    icon: "Landmark",
    tagline: "ATMs, commercial banks & forex",
    group: "services",
  },
  {
    id: "cat-fitness",
    name: "Gyms & Fitness",
    slug: "entertainment-arts",
    icon: "Dumbbell",
    tagline: "Workout clubs, yoga & trainers",
    group: "lifestyle",
  },
  {
    id: "cat-19",
    name: "Real Estate & Rentals",
    slug: "real-estate-property",
    icon: "Building2",
    tagline: "Apartments, office spaces & brokers",
    group: "services",
  },
];

const FILTER_GROUPS = [
  { id: "all", label: "All Popular" },
  { id: "food", label: "Food & Drinks" },
  { id: "shopping", label: "Shopping" },
  { id: "health", label: "Health & Care" },
  { id: "services", label: "Services & Tech" },
  { id: "lifestyle", label: "Lifestyle & Stays" },
];

export function CategoryChips() {
  const [activeGroup, setActiveGroup] = useState("all");

  const displayedCategories =
    activeGroup === "all"
      ? POPULAR_CATEGORY_SPECS
      : POPULAR_CATEGORY_SPECS.filter((c) => c.group === activeGroup);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] xs:text-[11px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-indigo-500 animate-pulse" />
            <span>Curated Directory</span>
          </div>
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Popular Categories
          </h2>
          <p className="text-[11px] xs:text-xs sm:text-sm text-muted-foreground mt-0.5">
            Discover verified spots, ratings, and instant map directions by sector.
          </p>
        </div>

        <Link
          href="/categories"
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0"
        >
          <span>View all 70+ categories</span>
          <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 xs:gap-2 overflow-x-auto no-scrollbar pb-1.5 xs:pb-2 mb-3 xs:mb-4 text-[11px] xs:text-xs font-medium">
        {FILTER_GROUPS.map((grp) => {
          const isActive = activeGroup === grp.id;
          return (
            <button
              key={grp.id}
              onClick={() => setActiveGroup(grp.id)}
              className={`px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full whitespace-nowrap transition-all duration-200 shrink-0 font-semibold ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/25 scale-[1.02]"
                  : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground"
              }`}
            >
              {grp.label}
            </button>
          );
        })}
      </div>

      {/* Categories Grid with Attractive Dynamic Visual Cards */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 xs:gap-2.5 sm:gap-4">
        {displayedCategories.map((cat) => {
          const theme = getCategoryTheme(cat.name, cat.slug);

          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`group relative flex flex-col items-center text-center p-2.5 xs:p-3 sm:p-4 rounded-xl xs:rounded-2xl bg-card border border-border/70 hover:border-border transition-all duration-300 shadow-xs hover:shadow-lg ${theme.borderHover} hover:-translate-y-1 overflow-hidden`}
            >
              {/* Subtle gradient backdrop on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              {/* Glowing Icon Badge */}
              <div className="relative mb-2 xs:mb-2.5 sm:mb-3">
                <CategoryIconBadge
                  iconName={cat.icon}
                  categoryName={cat.name}
                  categorySlug={cat.slug}
                  size="md"
                />
              </div>

              {/* Category Title */}
              <span className="relative z-10 text-[11px] xs:text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {cat.name}
              </span>

              {/* Sector Tagline / Subtitle */}
              <span className="relative z-10 text-[9px] xs:text-[10px] text-muted-foreground line-clamp-1 mt-0.5 group-hover:text-foreground/80 transition-colors">
                {cat.tagline}
              </span>

              {/* Explore arrow pill on hover */}
              <div className="relative z-10 mt-1.5 xs:mt-2 sm:mt-2.5 flex items-center gap-1 text-[9px] xs:text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <span>Explore</span>
                <ChevronRight className="w-2.5 h-2.5 xs:w-3 xs:h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
