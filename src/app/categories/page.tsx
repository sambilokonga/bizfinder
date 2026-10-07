"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import {
  Layers,
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Building2,
  Utensils,
  Pill,
  Hotel,
  Car,
  Laptop,
  HeartPulse,
  Landmark,
  Dumbbell,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  Compass,
  Zap,
  Globe2,
  TrendingUp,
  LayoutGrid,
  ListTree,
  ListFilter,
  X,
  CheckCircle2,
  ExternalLink,
  Store,
  Star,
  MapPin,
  Phone,
  Eye,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEED_CATEGORIES, getCategoryTree } from "@/lib/db/seed-data/categories";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { Business } from "@/types/business";
import { isBusinessInCategory } from "@/lib/utils/category-matcher";
import { getBusinessCoverUrl } from "@/lib/utils/business-media";
import { getLiveOpeningStatus } from "@/lib/utils/opening-hours";
import { CategoryTree } from "@/types/category";

// Curated color themes for industries
interface CategoryTheme {
  iconBg: string;
  iconColor: string;
  borderHover: string;
  badgeBg: string;
  glow: string;
}

const DEFAULT_THEME: CategoryTheme = {
  iconBg: "bg-indigo-50 dark:bg-indigo-950/60",
  iconColor: "text-indigo-600 dark:text-indigo-400",
  borderHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
  badgeBg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300",
  glow: "from-indigo-500/10 via-purple-500/5 to-transparent",
};

const SECTOR_THEMES: Record<string, CategoryTheme> = {
  "cat-1": {
    // Restaurants & Food
    iconBg: "bg-amber-50 dark:bg-amber-950/60",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300",
    glow: "from-amber-500/15 via-orange-500/5 to-transparent",
  },
  "cat-2": {
    // Cafés & Beverages
    iconBg: "bg-orange-50 dark:bg-orange-950/60",
    iconColor: "text-orange-600 dark:text-orange-400",
    borderHover: "hover:border-orange-500/50 hover:shadow-orange-500/10",
    badgeBg: "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300",
    glow: "from-orange-500/15 via-amber-500/5 to-transparent",
  },
  "cat-shops-retail": {
    // Shops & Retail
    iconBg: "bg-fuchsia-50 dark:bg-fuchsia-950/60",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    borderHover: "hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/10",
    badgeBg: "bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-700 dark:text-fuchsia-300",
    glow: "from-fuchsia-500/15 via-pink-500/5 to-transparent",
  },

  "cat-8": {
    // Health & Medical
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300",
    glow: "from-emerald-500/15 via-teal-500/5 to-transparent",
  },
  "cat-9": {
    // Pharmacy
    iconBg: "bg-teal-50 dark:bg-teal-950/60",
    iconColor: "text-teal-600 dark:text-teal-400",
    borderHover: "hover:border-teal-500/50 hover:shadow-teal-500/10",
    badgeBg: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300",
    glow: "from-teal-500/15 via-cyan-500/5 to-transparent",
  },
  "cat-13": {
    // Education & Schools
    iconBg: "bg-blue-50 dark:bg-blue-950/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    badgeBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300",
    glow: "from-blue-500/15 via-indigo-500/5 to-transparent",
  },
  "cat-14": {
    // Professional Services
    iconBg: "bg-violet-50 dark:bg-violet-950/60",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderHover: "hover:border-violet-500/50 hover:shadow-violet-500/10",
    badgeBg: "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300",
    glow: "from-violet-500/15 via-purple-500/5 to-transparent",
  },
  "cat-17": {
    // Banking & Financial
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    iconColor: "text-emerald-700 dark:text-emerald-300",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200",
    glow: "from-emerald-500/15 via-green-500/5 to-transparent",
  },
  "cat-19": {
    // Real Estate
    iconBg: "bg-sky-50 dark:bg-sky-950/60",
    iconColor: "text-sky-600 dark:text-sky-400",
    borderHover: "hover:border-sky-500/50 hover:shadow-sky-500/10",
    badgeBg: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300",
    glow: "from-sky-500/15 via-blue-500/5 to-transparent",
  },
  "cat-24": {
    // Electronics & Tech
    iconBg: "bg-cyan-50 dark:bg-cyan-950/60",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    borderHover: "hover:border-cyan-500/50 hover:shadow-cyan-500/10",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300",
    glow: "from-cyan-500/15 via-blue-500/5 to-transparent",
  },
  "cat-25": {
    // Software & IT
    iconBg: "bg-indigo-50 dark:bg-indigo-950/60",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300",
    glow: "from-indigo-500/15 via-sky-500/5 to-transparent",
  },
  "cat-27": {
    // Automotive
    iconBg: "bg-red-50 dark:bg-red-950/60",
    iconColor: "text-red-600 dark:text-red-400",
    borderHover: "hover:border-red-500/50 hover:shadow-red-500/10",
    badgeBg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300",
    glow: "from-red-500/15 via-orange-500/5 to-transparent",
  },
  "cat-31": {
    // Hotels & Accommodation
    iconBg: "bg-purple-50 dark:bg-purple-950/60",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderHover: "hover:border-purple-500/50 hover:shadow-purple-500/10",
    badgeBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300",
    glow: "from-purple-500/15 via-indigo-500/5 to-transparent",
  },
  "cat-33": {
    // Sports & Fitness
    iconBg: "bg-lime-50 dark:bg-lime-950/60",
    iconColor: "text-lime-600 dark:text-lime-400",
    borderHover: "hover:border-lime-500/50 hover:shadow-lime-500/10",
    badgeBg: "bg-lime-50 dark:bg-lime-950/50 text-lime-700 dark:text-lime-300",
    glow: "from-lime-500/15 via-emerald-500/5 to-transparent",
  },
  "cat-42": {
    // Energy & Solar
    iconBg: "bg-yellow-50 dark:bg-yellow-950/60",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    borderHover: "hover:border-yellow-500/50 hover:shadow-yellow-500/10",
    badgeBg: "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300",
    glow: "from-yellow-500/15 via-amber-500/5 to-transparent",
  },
};

// Helper to dynamically render category icons safely
function CategoryIcon({
  name,
  className = "w-5 h-5",
}: {
  name?: string;
  className?: string;
}) {
  if (!name) return <Layers className={className} />;
  const IconComponent = (LucideIcons as any)[name] || Layers;
  return <IconComponent className={className} />;
}

// Popular featured sectors for spotlight cards
const FEATURED_SECTOR_IDS = [
  "cat-1", // Food & Dining
  "cat-shops-retail", // Shops & Retail
  "cat-8", // Health & Medical
  "cat-24", // Electronics & Tech
  "cat-27", // Automotive
  "cat-31", // Hotels & Accommodation
  "cat-17", // Financial Services
  "cat-19", // Real Estate
];

export default function CategoriesDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "tree">("grid");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [allBusinesses, setAllBusinesses] = useState<Business[]>(SEED_BUSINESSES);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [previewCategory, setPreviewCategory] = useState<{
    id: string;
    name: string;
    slug: string;
    level: number;
    icon?: string;
  } | null>(null);
  const [drawerSearch, setDrawerSearch] = useState("");

  const categoryTree = useMemo(() => getCategoryTree(), []);

  // Fetch all recorded businesses from database API
  useEffect(() => {
    fetch("/api/businesses?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        if (data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0) {
          const existingIds = new Set(data.businesses.map((b: Business) => b.id));
          const uniqueSeeds = SEED_BUSINESSES.filter((s) => !existingIds.has(s.id));
          setAllBusinesses([...data.businesses, ...uniqueSeeds]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBiz(false));
  }, []);

  // Compute live businesses count for each category in the taxonomy tree
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryTree.forEach((ind) => {
      counts[ind.id] = allBusinesses.filter((b) => isBusinessInCategory(b, ind.slug || ind.id)).length;
      ind.children?.forEach((cat) => {
        counts[cat.id] = allBusinesses.filter((b) => isBusinessInCategory(b, cat.slug || cat.id)).length;
        cat.children?.forEach((sub) => {
          counts[sub.id] = allBusinesses.filter((b) => isBusinessInCategory(b, sub.slug || sub.id)).length;
        });
      });
    });
    return counts;
  }, [categoryTree, allBusinesses]);

  // Filtered businesses matching the active preview category modal
  const previewBusinesses = useMemo(() => {
    if (!previewCategory) return [];
    let list = allBusinesses.filter((b) =>
      isBusinessInCategory(b, previewCategory.slug || previewCategory.id)
    );
    if (drawerSearch.trim()) {
      const q = drawerSearch.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.cityName?.toLowerCase().includes(q) ||
          b.addressLine.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [previewCategory, allBusinesses, drawerSearch]);

  // Compute total statistics
  const stats = useMemo(() => {
    let subcategoriesCount = 0;
    let specialtiesCount = 0;

    categoryTree.forEach((ind) => {
      if (ind.children) {
        subcategoriesCount += ind.children.length;
        ind.children.forEach((cat) => {
          if (cat.children) {
            specialtiesCount += cat.children.length;
          }
        });
      }
    });

    return {
      industries: categoryTree.length,
      subcategories: subcategoriesCount,
      specialties: specialtiesCount,
    };
  }, [categoryTree]);

  // Filtered Tree based on search query, sector, and letter
  const filteredTree = useMemo(() => {
    return categoryTree.filter((industry) => {
      // 1. Sector filter
      if (selectedSector !== "all" && industry.id !== selectedSector) {
        return false;
      }

      // 2. Alphabet letter filter
      if (selectedLetter !== "ALL") {
        const firstLetter = industry.name.trim().charAt(0).toUpperCase();
        if (firstLetter !== selectedLetter) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesIndustry = industry.name.toLowerCase().includes(q);
        const matchesChildren = industry.children?.some(
          (cat) =>
            cat.name.toLowerCase().includes(q) ||
            cat.children?.some((sub) => sub.name.toLowerCase().includes(q))
        );
        return matchesIndustry || matchesChildren;
      }

      return true;
    });
  }, [categoryTree, selectedSector, selectedLetter, searchQuery]);

  // Alphabet list present in current taxonomy
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    categoryTree.forEach((ind) => {
      const char = ind.name.trim().charAt(0).toUpperCase();
      if (char >= "A" && char <= "Z") letters.add(char);
    });
    return Array.from(letters).sort();
  }, [categoryTree]);

  const toggleCardExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedLetter("ALL");
    setSelectedSector("all");
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedLetter !== "ALL" ||
    selectedSector !== "all";

  return (
    <div className="w-full bg-slate-50/60 dark:bg-slate-950/80 min-h-screen">
      {/* ─── Modern Hero Section with Ambient Glow ─── */}
      <section className="relative overflow-hidden pt-8 xs:pt-10 sm:pt-12 pb-10 sm:pb-16 border-b border-border/60 bg-gradient-to-b from-background via-card/50 to-background">
        {/* Ambient background blur blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-pink-500/15 blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1 xs:py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] xs:text-xs font-bold shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse shrink-0" />
              <span>Worldwide Directory Taxonomy • 70 Core Sectors</span>
            </div>

            {/* Title with Gradient Text */}
            <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
              Explore Businesses Across <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Every Industry
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs xs:text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Find verified restaurants, medical clinics, corporate services, retail outlets, and specialized vendors categorized under our structured global classification system.
            </p>

            {/* Quick Live Search Bar */}
            <div className="pt-2 max-w-xl mx-auto">
              <div className="relative flex items-center shadow-lg shadow-indigo-500/5 rounded-2xl border border-border bg-card/90 backdrop-blur-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1.5">
                <Search className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search industries, cuisines, medical specialties, auto services..."
                  className="w-full bg-transparent px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors mr-1"
                    title="Clear Search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <Link
                  href={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search"}
                  className="hidden sm:inline-flex"
                >
                  <Button size="sm" variant="gradient" className="rounded-xl px-4 font-bold shadow-sm">
                    Search Listings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Metric Counters Strip */}
            <div className="pt-4 flex items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="font-bold text-foreground text-sm sm:text-base">
                  {stats.industries}
                </span>{" "}
                Industries
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm sm:text-base">
                  {stats.subcategories}+
                </span>{" "}
                Subcategories
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm sm:text-base">
                  {stats.specialties}+
                </span>{" "}
                Specialties
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-foreground text-sm sm:text-base">
                  {allBusinesses.length}+
                </span>{" "}
                Recorded Businesses
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trending / Spotlight Sectors Showcase ─── */}
      {!hasActiveFilters && (
        <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 pt-7 sm:pt-10">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-1.5 xs:gap-2">
              <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h2 className="text-base xs:text-lg font-black text-foreground tracking-tight">
                Trending &amp; Popular Sectors
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground hidden xs:inline">
              Most requested business categories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
            {categoryTree
              .filter((ind) => FEATURED_SECTOR_IDS.includes(ind.id))
              .slice(0, 8)
              .map((sector) => {
                const theme = SECTOR_THEMES[sector.id] || DEFAULT_THEME;
                const bizCount = categoryCounts[sector.id] || 0;
                return (
                  <div
                    key={sector.id}
                    className={`group relative rounded-2xl border border-border/80 bg-card p-3 xs:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.borderHover} flex flex-col justify-between overflow-hidden`}
                  >
                    {/* Ambient subtle glow background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-2.5 xs:mb-3">
                        <div
                          className={`w-8 h-8 xs:w-10 xs:h-10 rounded-xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center font-bold transition-transform group-hover:scale-110 duration-300`}
                        >
                          <CategoryIcon name={sector.icon} className="w-4 h-4 xs:w-5 xs:h-5" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPreviewCategory({ id: sector.id, name: sector.name, slug: sector.slug, level: 1, icon: sector.icon });
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                          title="Click to preview recorded businesses"
                        >
                          <Store className="w-2.5 h-2.5" />
                          <span>{bizCount} biz</span>
                        </button>
                      </div>
                      <Link
                        href={`/search?category=${sector.slug}`}
                        className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 block"
                      >
                        {sector.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {sector.children?.length || 0} subcategories • {bizCount} businesses
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewCategory({ id: sector.id, name: sector.name, slug: sector.slug, level: 1, icon: sector.icon });
                        }}
                        className="hover:text-foreground flex items-center gap-1 text-primary font-bold"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Quick View</span>
                      </button>
                      <Link
                        href={`/search?category=${sector.slug}`}
                        className="text-primary font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ─── Main Category Explorer Section ─── */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-4 sm:space-y-6">
        {/* Navigation & Controls Bar */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4 pb-2">
          <div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <span>All 70 Industry Sectors</span>
              <Badge variant="outline" className="text-xs font-bold px-2 py-0.5">
                {filteredTree.length} Shown
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any specialty tag or sector card to browse relevant verified business listings
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 xs:gap-1.5 p-1 rounded-2xl bg-card border border-border shadow-sm shrink-0 self-start xs:self-auto overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 py-1.5 rounded-xl text-[11px] xs:text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Visual Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 py-1.5 rounded-xl text-[11px] xs:text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Alphabetical Directory View"
            >
              <ListFilter className="w-3.5 h-3.5 shrink-0" />
              <span>A–Z Index</span>
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 py-1.5 rounded-xl text-[11px] xs:text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === "tree"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Hierarchy Tree View"
            >
              <ListTree className="w-3.5 h-3.5 shrink-0" />
              <span><span className="hidden sm:inline">Taxonomy </span>Tree</span>
            </button>
          </div>
        </div>

        {/* Alphabetical Fast Jump Bar */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs -mx-3 px-3 xs:-mx-4 xs:px-4 sm:-mx-0 sm:px-0">
          <button
            onClick={() => setSelectedLetter("ALL")}
            className={`px-2.5 xs:px-3 py-1 rounded-xl font-bold shrink-0 transition-all ${
              selectedLetter === "ALL"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                : "bg-card text-muted-foreground border border-border hover:text-foreground"
            }`}
          >
            All
          </button>
          {availableLetters.map((char) => {
            const isSelected = selectedLetter === char;
            return (
              <button
                key={char}
                onClick={() => setSelectedLetter(char)}
                className={`w-7 h-7 rounded-xl font-bold shrink-0 flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                    : "bg-card text-muted-foreground border border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {char}
              </button>
            );
          })}
        </div>

        {/* Sector Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          <button
            onClick={() => setSelectedSector("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 border ${
              selectedSector === "all"
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            All Sectors ({categoryTree.length})
          </button>
          {categoryTree.slice(0, 14).map((ind) => {
            const isSelected = selectedSector === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setSelectedSector(ind.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/30"
                }`}
              >
                <CategoryIcon name={ind.icon} className="w-3.5 h-3.5" />
                <span>{ind.name.split("&")[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-indigo-900 dark:text-indigo-200">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-background border border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {selectedLetter !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-background border border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Starts with: {selectedLetter}
                  <button onClick={() => setSelectedLetter("ALL")}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {selectedSector !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-background border border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Sector: {categoryTree.find((c) => c.id === selectedSector)?.name}
                  <button onClick={() => setSelectedSector("all")}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={clearAllFilters}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* ─── Zero Results State ─── */}
        {filteredTree.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-foreground">No matching categories found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any categories matching your criteria. Try widening your search or clearing active filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 font-semibold"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* ─── 1. Modern Cards Grid View ─── */
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
            {filteredTree.map((industry) => {
              const theme = SECTOR_THEMES[industry.id] || DEFAULT_THEME;
              const isExpanded = expandedCards[industry.id] || false;

              // Calculate total sub-items in this sector
              const totalSpecialties =
                industry.children?.reduce(
                  (acc, cat) => acc + (cat.children?.length || 1),
                  0
                ) || 0;

              // Determine primary subcategories to display
              const visibleSubcategories = isExpanded
                ? industry.children || []
                : (industry.children || []).slice(0, 4);

              const hasMore = (industry.children?.length || 0) > 4;

              return (
                <div
                  key={industry.id}
                  className={`group relative rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 flex flex-col justify-between hover:shadow-xl ${theme.borderHover} overflow-hidden`}
                >
                  {/* Subtle top corner gradient glow */}
                  <div
                    className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${theme.glow} rounded-bl-full pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity`}
                  />

                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/60 mb-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-2xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center font-bold shrink-0 shadow-inner group-hover:scale-105 transition-transform`}
                        >
                          <CategoryIcon name={industry.icon} className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/search?category=${industry.slug}`}
                            className="font-bold text-base text-foreground hover:text-primary transition-colors line-clamp-1 block"
                            title={industry.name}
                          >
                            {industry.name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground font-semibold">
                              {industry.children?.length || 0} subcategories
                            </span>
                            <span className="text-border">•</span>
                            <span className="text-xs text-muted-foreground">
                              {totalSpecialties} specialties
                            </span>
                            <span className="text-border">•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPreviewCategory({ id: industry.id, name: industry.name, slug: industry.slug, level: 1, icon: industry.icon });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                              title="Click to preview recorded businesses"
                            >
                              <Store className="w-3 h-3" />
                              <span>{categoryCounts[industry.id] || 0} Businesses</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/search?category=${industry.slug}`}
                        className="w-8 h-8 rounded-xl border border-border bg-background/80 hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center text-muted-foreground transition-all shrink-0 mt-0.5"
                        title={`Browse ${industry.name}`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Subcategories list */}
                    <div className="space-y-3.5">
                      {visibleSubcategories.map((cat) => {
                        const subBizCount = categoryCounts[cat.id] || 0;
                        return (
                          <div key={cat.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-foreground">
                              <Link
                                href={`/search?category=${cat.slug}`}
                                className="hover:text-primary transition-colors flex items-center gap-1.5 min-w-0"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                                <span className="truncate">{cat.name}</span>
                              </Link>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {subBizCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setPreviewCategory({ id: cat.id, name: cat.name, slug: cat.slug, level: 2 });
                                    }}
                                    className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-200/50 hover:bg-indigo-100 transition-colors"
                                    title="View businesses in this subcategory"
                                  >
                                    {subBizCount} biz
                                  </button>
                                )}
                                {cat.children && cat.children.length > 0 && (
                                  <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                                    {cat.children.length}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Specialties quick chips */}
                            {cat.children && cat.children.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pl-3">
                                {cat.children.slice(0, 5).map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/search?category=${sub.slug}`}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 dark:bg-slate-900/80 border border-border/70 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                                {cat.children.length > 5 && (
                                  <Link
                                    href={`/category/${cat.slug}`}
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    +{cat.children.length - 5} more
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Expand / Collapse Button */}
                    {hasMore && (
                      <button
                        onClick={() => toggleCardExpand(industry.id)}
                        className="mt-3.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                      >
                        <span>
                          {isExpanded
                            ? "Show Less"
                            : `+${(industry.children?.length || 0) - 4} more subcategories`}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/search?category=${industry.slug}`}
                      className="font-bold text-primary hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 min-w-0 truncate"
                    >
                      <span className="truncate">Explore listings</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setPreviewCategory({ id: industry.id, name: industry.name, slug: industry.slug, level: 1, icon: industry.icon });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-primary hover:text-white text-muted-foreground font-bold text-[11px] transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                      title="Quick preview recorded businesses"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View ({categoryCounts[industry.id] || 0})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === "list" ? (
          /* ─── 2. Alphabetical A-Z Directory View ─── */
          <div className="space-y-8">
            {availableLetters
              .filter(
                (letter) =>
                  selectedLetter === "ALL" || selectedLetter === letter
              )
              .map((letter) => {
                const industriesForLetter = filteredTree.filter(
                  (ind) => ind.name.trim().charAt(0).toUpperCase() === letter
                );
                if (industriesForLetter.length === 0) return null;

                return (
                  <div
                    key={letter}
                    className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm"
                  >
                    {/* Letter Header */}
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/60">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                        {letter}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          Letter {letter}
                        </h3>
                        <span className="text-xs text-muted-foreground font-semibold">
                          {industriesForLetter.length} Industries
                        </span>
                      </div>
                    </div>

                    {/* Alphabetical list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {industriesForLetter.map((ind) => {
                        const bizCount = categoryCounts[ind.id] || 0;
                        return (
                          <div
                            key={ind.id}
                            className="p-3.5 rounded-2xl border border-border/60 hover:border-primary/40 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-card transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <CategoryIcon
                                    name={ind.icon}
                                    className="w-4 h-4 text-primary shrink-0"
                                  />
                                  <Link
                                    href={`/search?category=${ind.slug}`}
                                    className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
                                  >
                                    {ind.name}
                                  </Link>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewCategory({ id: ind.id, name: ind.name, slug: ind.slug, level: 1, icon: ind.icon });
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] hover:bg-emerald-100 transition-colors flex items-center gap-0.5"
                                    title="Quick view businesses"
                                  >
                                    <Store className="w-2.5 h-2.5" />
                                    <span>{bizCount}</span>
                                  </button>
                                  <Link
                                    href={`/search?category=${ind.slug}`}
                                    className="text-primary hover:text-primary/80"
                                    title="Open search"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {ind.children?.slice(0, 4).map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/search?category=${sub.slug}`}
                                    className="text-[11px] text-muted-foreground hover:text-primary px-2 py-0.5 rounded-md bg-background border border-border/60"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* ─── 3. Full Deep Hierarchy Tree View ─── */
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-border/60 pb-4">
              <h3 className="text-lg font-black text-foreground">
                Deep Taxonomy Explorer (4 Levels)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Industry › Subcategory › Service Specialty
              </p>
            </div>

            <div className="space-y-6">
              {filteredTree.map((ind) => {
                const indBizCount = categoryCounts[ind.id] || 0;
                return (
                  <div
                    key={ind.id}
                    className="rounded-2xl border border-border/60 p-4 bg-slate-50/40 dark:bg-slate-900/40"
                  >
                    {/* Level 1: Industry */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <CategoryIcon name={ind.icon} className="w-4 h-4" />
                        </div>
                        <Link
                          href={`/search?category=${ind.slug}`}
                          className="font-bold text-base text-foreground hover:text-primary"
                        >
                          {ind.name}
                        </Link>
                        <Badge variant="outline" className="text-[10px]">
                          Level 1
                        </Badge>
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewCategory({ id: ind.id, name: ind.name, slug: ind.slug, level: 1, icon: ind.icon });
                          }}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          <Store className="w-2.5 h-2.5" />
                          <span>{indBizCount} Businesses</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewCategory({ id: ind.id, name: ind.name, slug: ind.slug, level: 1, icon: ind.icon });
                          }}
                          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Quick View</span>
                        </button>
                        <Link
                          href={`/search?category=${ind.slug}`}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Level 2 & 3: Children */}
                    <div className="pl-6 sm:pl-10 space-y-3 border-l-2 border-indigo-200 dark:border-indigo-900/60 ml-4">
                      {ind.children?.map((cat) => {
                        const catBizCount = categoryCounts[cat.id] || 0;
                        return (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/search?category=${cat.slug}`}
                                className="font-bold text-xs text-foreground hover:text-primary"
                              >
                                • {cat.name}
                              </Link>
                              {catBizCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewCategory({ id: cat.id, name: cat.name, slug: cat.slug, level: 2 });
                                  }}
                                  className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded"
                                >
                                  {catBizCount} biz
                                </button>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                ({cat.children?.length || 0} specialties)
                              </span>
                            </div>

                            {cat.children && cat.children.length > 0 && (
                              <div className="pl-4 flex flex-wrap gap-1.5 pt-1">
                                {cat.children.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/search?category=${sub.slug}`}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-background border border-border hover:border-primary hover:text-primary transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ─── Category Business Showcase Modal ─── */}
      {previewCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setPreviewCategory(null);
            setDrawerSearch("");
          }}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-bold gap-1 text-primary">
                    <Store className="w-3.5 h-3.5" />
                    Level {previewCategory.level} Category
                  </Badge>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {allBusinesses.filter((b) => isBusinessInCategory(b, previewCategory.slug || previewCategory.id)).length} Verified Businesses Recorded
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground mt-1 tracking-tight">
                  {previewCategory.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click any business to open its complete profile, or explore on the interactive map
                </p>
              </div>

              <button
                onClick={() => {
                  setPreviewCategory(null);
                  setDrawerSearch("");
                }}
                className="w-9 h-9 rounded-2xl border border-border bg-background hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Controls Bar */}
            <div className="p-4 border-b border-border/80 flex items-center gap-3 bg-card">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder={`Search within ${previewCategory.name}...`}
                  className="pl-9 h-10 rounded-xl text-xs"
                />
              </div>
              <Link
                href={`/search?category=${previewCategory.slug}`}
                onClick={() => setPreviewCategory(null)}
              >
                <Button variant="gradient" size="sm" className="font-bold rounded-xl gap-1.5 h-10 shadow-sm shrink-0">
                  <span>Open in Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Modal Businesses List */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)] space-y-4">
              {previewBusinesses.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border">
                  <Store className="w-10 h-10 text-muted-foreground/60 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-foreground">
                    {drawerSearch ? "No businesses match your search filter" : `No businesses recorded under ${previewCategory.name} yet`}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {drawerSearch ? "Try clearing your search keyword." : "Be the first to list and establish your presence in this category!"}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {drawerSearch && (
                      <Button size="sm" variant="outline" onClick={() => setDrawerSearch("")}>
                        Clear Search
                      </Button>
                    )}
                    <Link href="/dashboard/listings/new">
                      <Button size="sm" variant="default" className="font-bold">
                        List Your Business Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {previewBusinesses.map((biz) => {
                    const liveStatus = getLiveOpeningStatus(biz.openingHours);
                    return (
                      <div
                        key={biz.id}
                        className="group rounded-2xl border border-border/80 bg-background/80 hover:border-primary/50 hover:shadow-md transition-all p-3.5 flex flex-col justify-between"
                      >
                        <div className="flex gap-3">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getBusinessCoverUrl(biz)}
                              alt={biz.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80";
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/business/${biz.id}`}
                              className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block"
                            >
                              {biz.name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-1 text-xs">
                              <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{biz.ratingAvg?.toFixed(1) || "5.0"}</span>
                              </div>
                              <span className="text-muted-foreground text-[11px]">
                                ({biz.reviewCount || 0})
                              </span>
                              {biz.isVerified && (
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-primary" />
                              <span className="truncate">{biz.cityName || biz.addressLine}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs">
                          <span className={`text-[11px] font-semibold ${liveStatus.isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                            {liveStatus.statusText}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {biz.telephone && (
                              <a
                                href={`tel:${biz.telephone}`}
                                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent"
                                title="Call"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                            <Link
                              href={`/business/${biz.id}`}
                              className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-bold text-[11px] hover:bg-primary/90 transition-colors"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Showing {previewBusinesses.length} of {allBusinesses.filter((b) => isBusinessInCategory(b, previewCategory.slug || previewCategory.id)).length} businesses recorded
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/category/${previewCategory.slug}`}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Category Page ›
                </Link>
                <Link
                  href={`/search?category=${previewCategory.slug}`}
                >
                  <Button size="sm" variant="default" className="font-bold rounded-xl text-xs h-8">
                    Open Search Results
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
