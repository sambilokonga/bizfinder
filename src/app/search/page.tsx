"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Phone,
  Navigation,
  Bookmark,
  Share2,
  Layers,
  Map as MapIcon,
  List,
  ArrowUpDown,
  Sparkles,
  X,
  Clock,
  Compass,
  DollarSign,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { SEED_CATEGORIES, getCategoryBySlug } from "@/lib/db/seed-data/categories";
import { SEED_LOCATIONS } from "@/lib/db/seed-data/locations";
import { getLiveOpeningStatus } from "@/lib/utils/opening-hours";
import { getBusinessCoverUrl, DEFAULT_BUSINESS_COVER } from "@/lib/utils/business-media";
import { calculateDistanceKm, formatDistance } from "@/lib/search/geo-distance";
import { isBusinessInCategory } from "@/lib/utils/category-matcher";
import { Business, PriceTier } from "@/types/business";
import { SyncedMapView } from "@/components/search/SyncedMapView";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UnifiedSearchAutocomplete, SEARCH_OPTIONS } from "@/components/search/UnifiedSearchAutocomplete";
import { SearchOptionScope, SearchAutocompleteResult } from "@/types/search";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const scopeParam = (searchParams.get("scope") as SearchOptionScope) || "all";
  const categoryParam = searchParams.get("category") || "";
  const locationParam = searchParams.get("location") || "";
  const buildingParam = searchParams.get("building") || "";
  const cityParam = searchParams.get("city") || "";
  const countryParam = searchParams.get("country") || "";
  const viewParam = searchParams.get("view");
  const openNowParam = searchParams.get("openNow") === "true";
  const radiusParam = searchParams.get("radiusKm")
    ? Number(searchParams.get("radiusKm"))
    : 25;
  const ratingParam = searchParams.get("minRating")
    ? Number(searchParams.get("minRating"))
    : 0;
  const verifiedParam = searchParams.get("verified") === "true";
  const sortParam =
    (searchParams.get("sort") as "relevance" | "rating" | "reviews" | "distance" | "newest") ||
    "relevance";
  const pageParam = Math.max(1, Number(searchParams.get("page") || "1"));
  const router = useRouter();
  // nearMeActive: true only when user explicitly clicks "Use My Location" GPS button
  const [nearMeActive, setNearMeActive] = useState(false);

  // Filter States — initialized from URL and kept in sync via useEffect below
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [selectedScope, setSelectedScope] = useState<SearchOptionScope>(scopeParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedLocation, setSelectedLocation] = useState(locationParam);
  const [selectedBuilding, setSelectedBuilding] = useState(buildingParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedCountry, setSelectedCountry] = useState(countryParam);
  const [openNowOnly, setOpenNowOnly] = useState(openNowParam);
  const [verifiedOnly, setVerifiedOnly] = useState(verifiedParam);
  const [selectedPriceTier, setSelectedPriceTier] = useState<PriceTier | "all">("all");
  const [minRating, setMinRating] = useState<number>(ratingParam);
  const [radiusKm, setRadiusKm] = useState<number>(radiusParam);
  const [sortBy, setSortBy] = useState<
    "relevance" | "rating" | "reviews" | "distance" | "newest"
  >(sortParam);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // View Mode — declared here so setViewMode is available in the URL sync effect below
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">(
    viewParam === "map" ? "map" : viewParam === "list" ? "list" : "split"
  );
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(pageParam);

  // Live Businesses Roster
  const [allBusinesses, setAllBusinesses] = useState<Business[]>(SEED_BUSINESSES);

  // ─── Sync all filter state whenever the URL search params change ──────────────
  // This is the critical integration bridge: when the user navigates to /search
  // from the hero, the navbar, or any other entry-point, the URL params change
  // and this effect re-hydrates every filter so the results update immediately.
  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
    setSelectedScope((searchParams.get("scope") as SearchOptionScope) || "all");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedLocation(searchParams.get("location") || "");
    setSelectedBuilding(searchParams.get("building") || "");
    setSelectedCity(searchParams.get("city") || "");
    setSelectedCountry(searchParams.get("country") || "");
    setOpenNowOnly(searchParams.get("openNow") === "true");
    setVerifiedOnly(searchParams.get("verified") === "true");
    if (searchParams.get("minRating")) {
      setMinRating(Number(searchParams.get("minRating")));
    }
    if (searchParams.get("radiusKm")) {
      setRadiusKm(Number(searchParams.get("radiusKm")));
    }
    const sort = searchParams.get("sort");
    if (sort && ["relevance", "rating", "reviews", "distance", "newest"].includes(sort)) {
      setSortBy(sort as any);
    }
    const page = searchParams.get("page");
    if (page && !isNaN(Number(page))) {
      setCurrentPage(Math.max(1, Number(page)));
    }
    const view = searchParams.get("view");
    if (view === "map") setViewMode("map");
    else if (view === "list") setViewMode("list");
    else if (view === "split") setViewMode("split");
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/businesses?limit=1000")
      .then((res) => res.json())
      .then((data) => {
        if (data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0) {
          // Merge db businesses with unique seed businesses
          const existingIds = new Set(data.businesses.map((b: Business) => b.id));
          const uniqueSeeds = SEED_BUSINESSES.filter((s) => !existingIds.has(s.id));
          setAllBusinesses([...data.businesses, ...uniqueSeeds]);
        }
      })
      .catch(() => {});
  }, []);

  // Log discovery search query to real analytics ledger
  useEffect(() => {
    if (queryParam && queryParam.trim()) {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "search",
          searchTerm: queryParam.trim(),
          registeredBy: "client_telemetry",
        }),
      }).catch(() => {});
    }
  }, [queryParam]);

  // User GPS coords — only populated after explicit "Use My Location" action
  const [userGpsLat, setUserGpsLat] = useState<number | null>(null);
  const [userGpsLng, setUserGpsLng] = useState<number | null>(null);
  // Fallback centroid for distance-sorting only (never used to FILTER out businesses)
  const userLat = userGpsLat ?? 8.9954;
  const userLng = userGpsLng ?? 38.7891;

  const toggleSave = (bizId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(bizId) ? prev.filter((id) => id !== bizId) : [...prev, bizId]
    );
  };

  // Filtered and Sorted Businesses Pipeline
  const filteredBusinesses = useMemo(() => {
    return allBusinesses.filter((biz) => {
      // 1. Search Query & Scope Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = biz.name.toLowerCase().includes(q);
        const matchesCategory =
          biz.categoryName.toLowerCase().includes(q) ||
          biz.subcategoryName?.toLowerCase().includes(q);
        const matchesAddress = biz.addressLine.toLowerCase().includes(q);
        const matchesDesc = biz.description.toLowerCase().includes(q);
        const matchesBuilding = biz.building?.toLowerCase().includes(q);
        const matchesStreet = biz.street?.toLowerCase().includes(q);
        const matchesDistrict = biz.districtName?.toLowerCase().includes(q);
        const matchesCity = biz.cityName?.toLowerCase().includes(q);
        const matchesCountry = biz.countryName?.toLowerCase().includes(q);
        const matchesProduct = biz.services?.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q)
        );
        const matchesBranch = biz.branches?.some(
          (br) =>
            br.name.toLowerCase().includes(q) ||
            br.branchCode?.toLowerCase().includes(q) ||
            br.addressLine.toLowerCase().includes(q)
        );

        if (selectedScope === "business" && !matchesName) return false;
        if (selectedScope === "branch" && !matchesBranch && !matchesName) return false;
        if (selectedScope === "product" && !matchesProduct) return false;
        if (selectedScope === "building" && !matchesBuilding) return false;
        if (selectedScope === "location" && !matchesDistrict && !matchesStreet && !matchesAddress) return false;
        if (selectedScope === "city_country" && !matchesCity && !matchesCountry) return false;
        if (selectedScope === "business_type" && !matchesCategory) return false;

        if (
          !matchesName &&
          !matchesCategory &&
          !matchesAddress &&
          !matchesDesc &&
          !matchesBuilding &&
          !matchesStreet &&
          !matchesDistrict &&
          !matchesCity &&
          !matchesCountry &&
          !matchesProduct &&
          !matchesBranch
        ) {
          return false;
        }
      }

      // Building Filter
      if (selectedBuilding && selectedBuilding.trim()) {
        const b = selectedBuilding.toLowerCase().trim();
        if (!biz.building?.toLowerCase().includes(b)) {
          return false;
        }
      }

      // City Filter
      if (selectedCity && selectedCity.trim()) {
        const c = selectedCity.toLowerCase().trim();
        if (!biz.cityName?.toLowerCase().includes(c)) {
          return false;
        }
      }

      // Country Filter
      if (selectedCountry && selectedCountry.trim()) {
        const c = selectedCountry.toLowerCase().trim();
        if (!biz.countryName?.toLowerCase().includes(c)) {
          return false;
        }
      }

      // 2. Category Filter (robust matching across hierarchy, slugs, and aliases)
      if (selectedCategory && selectedCategory !== "all") {
        if (!isBusinessInCategory(biz, selectedCategory)) {
          return false;
        }
      }

      // 3. Location Filter
      if (selectedLocation && selectedLocation.trim()) {
        const loc = selectedLocation.toLowerCase().trim();
        const matchesCity = biz.cityName?.toLowerCase().includes(loc);
        const matchesSubcity = biz.subcityId?.toLowerCase().includes(loc);
        const matchesDistrict = biz.districtName?.toLowerCase().includes(loc);
        const matchesAddress = biz.addressLine.toLowerCase().includes(loc);
        if (!matchesCity && !matchesSubcity && !matchesDistrict && !matchesAddress) {
          return false;
        }
      }

      // 4. Open Now Filter
      if (openNowOnly) {
        const status = getLiveOpeningStatus(biz.openingHours);
        if (!status.isOpen) return false;
      }

      // 5. Verified Only Filter
      if (verifiedOnly && !biz.isVerified) {
        return false;
      }

      // 6. Price Tier Filter
      if (selectedPriceTier !== "all") {
        if (biz.attributes.priceTier !== selectedPriceTier) {
          return false;
        }
      }

      // 7. Rating Filter
      if (minRating > 0 && biz.ratingAvg < minRating) {
        return false;
      }

      // 8. Distance Filter — only applied when user has explicitly activated GPS Near-Me mode.
      // Global users can always browse all businesses worldwide without any radius restriction.
      if (nearMeActive && userGpsLat !== null && userGpsLng !== null) {
        const distance = calculateDistanceKm(
          userGpsLat,
          userGpsLng,
          biz.latitude,
          biz.longitude
        );
        if (distance > radiusKm) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "newest") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === "rating") return b.ratingAvg - a.ratingAvg;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      if (sortBy === "distance") {
        const distA = calculateDistanceKm(
          userLat,
          userLng,
          a.latitude,
          a.longitude
        );
        const distB = calculateDistanceKm(
          userLat,
          userLng,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    allBusinesses,
    searchTerm,
    selectedScope,
    selectedBuilding,
    selectedCity,
    selectedCountry,
    selectedCategory,
    selectedLocation,
    openNowOnly,
    verifiedOnly,
    selectedPriceTier,
    minRating,
    radiusKm,
    nearMeActive,
    userGpsLat,
    userGpsLng,
    sortBy,
    userLat,
    userLng,
  ]);

  // Reset to page 1 whenever any search or filtering input changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedScope,
    selectedBuilding,
    selectedCity,
    selectedCountry,
    selectedCategory,
    selectedLocation,
    openNowOnly,
    verifiedOnly,
    selectedPriceTier,
    minRating,
    radiusKm,
    nearMeActive,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE));
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(targetPage);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (targetPage > 1) {
        params.set("page", targetPage.toString());
      } else {
        params.delete("page");
      }
      const newQuery = params.toString();
      const newUrl = newQuery ? `/search?${newQuery}` : `/search`;
      window.history.replaceState(null, "", newUrl);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedScope !== "all" ||
    Boolean(selectedBuilding) ||
    Boolean(selectedCity) ||
    Boolean(selectedCountry) ||
    (selectedCategory && selectedCategory !== "all") ||
    Boolean(selectedLocation) ||
    openNowOnly ||
    verifiedOnly ||
    selectedPriceTier !== "all" ||
    minRating > 0 ||
    radiusKm < 25;

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedScope("all");
    setSelectedBuilding("");
    setSelectedCity("");
    setSelectedCountry("");
    setSelectedCategory("all");
    setSelectedLocation("");
    setOpenNowOnly(false);
    setVerifiedOnly(false);
    setSelectedPriceTier("all");
    setMinRating(0);
    setRadiusKm(25);
    setSortBy("relevance");
    setCurrentPage(1);
  };

  // Push current filter state to URL so the page is shareable/bookmarkable
  const pushSearchUrl = useCallback(
    (overrides: Record<string, string> = {}) => {
      const params = new URLSearchParams();
      const q = overrides.q ?? searchTerm;
      const scope = overrides.scope ?? selectedScope;
      const category = overrides.category ?? selectedCategory;
      const location = overrides.location ?? selectedLocation;
      const building = overrides.building ?? selectedBuilding;
      const city = overrides.city ?? selectedCity;
      const country = overrides.country ?? selectedCountry;
      const sort = overrides.sort ?? sortBy;
      if (q) params.set("q", q);
      if (scope && scope !== "all") params.set("scope", scope);
      if (category && category !== "all") params.set("category", category);
      if (location) params.set("location", location);
      if (building) params.set("building", building);
      if (city) params.set("city", city);
      if (country) params.set("country", country);
      if (openNowOnly) params.set("openNow", "true");
      if (verifiedOnly) params.set("verified", "true");
      if (minRating > 0) params.set("minRating", minRating.toString());
      if (sort && sort !== "relevance") params.set("sort", sort);
      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [searchTerm, selectedScope, selectedCategory, selectedLocation, selectedBuilding, selectedCity, selectedCountry, openNowOnly, verifiedOnly, minRating, sortBy, router]
  );

  const handleAutocompleteSelect = (item: SearchAutocompleteResult) => {
    if (item.type === "business") {
      if (item.businessId) {
        const match = allBusinesses.find((b) => b.id === item.businessId);
        if (match) {
          setSelectedBusiness(match);
          // scroll card into view
          setTimeout(() => {
            const el = document.getElementById(`business-card-${match.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }
        setSearchTerm(item.title);
        return true;
      }
    } else if (item.type === "building") {
      setSelectedBuilding(item.building || item.title);
      setSearchTerm("");
      pushSearchUrl({ building: item.building || item.title, q: "" });
      return true;
    } else if (item.type === "city") {
      setSelectedCity(item.cityName || item.title);
      setSearchTerm("");
      pushSearchUrl({ city: item.cityName || item.title, q: "" });
      return true;
    } else if (item.type === "country") {
      setSelectedCountry(item.countryName || item.title);
      setSearchTerm("");
      pushSearchUrl({ country: item.countryName || item.title, q: "" });
      return true;
    } else if (item.type === "category") {
      if (item.categorySlug) setSelectedCategory(item.categorySlug);
      setSearchTerm("");
      pushSearchUrl({ category: item.categorySlug || "", q: "" });
      return true;
    } else if (item.type === "location") {
      setSelectedLocation(item.title);
      setSearchTerm("");
      pushSearchUrl({ location: item.title, q: "" });
      return true;
    } else if (item.type === "branch") {
      setSearchTerm(item.title);
      pushSearchUrl({ q: item.title, scope: "branch" });
      return true;
    } else if (item.type === "product") {
      setSearchTerm(item.title);
      pushSearchUrl({ q: item.title, scope: "product" });
      return true;
    } else if (item.type === "map") {
      setViewMode("map");
      return true;
    }
    return false;
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
      {/* Top Filter & Search Header Bar */}
      <div className="border-b border-border bg-card/85 backdrop-blur-xl sticky top-16 z-30 px-4 sm:px-6 pt-3 pb-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">

          {/* ── Single Row: Search + Filters + Sort ── */}
          <div className="flex items-center gap-2 w-full">
            {/* Search Input — takes all remaining space */}
            <div className="flex-1 min-w-0">
              <UnifiedSearchAutocomplete
                value={searchTerm}
                onChange={(val) => setSearchTerm(val)}
                onSearch={(val, scope) => {
                  setSearchTerm(val);
                  setSelectedScope(scope);
                  const params = new URLSearchParams();
                  if (val.trim()) params.set("q", val.trim());
                  if (scope && scope !== "all") params.set("scope", scope);
                  if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
                  if (selectedLocation) params.set("location", selectedLocation);
                  if (selectedBuilding) params.set("building", selectedBuilding);
                  if (selectedCity) params.set("city", selectedCity);
                  if (selectedCountry) params.set("country", selectedCountry);
                  router.push(`/search?${params.toString()}`, { scroll: false });
                }}
                onSelectResult={handleAutocompleteSelect}
                initialScope={selectedScope}
                variant="compact"
                showOptionPills={false}
                customBusinesses={allBusinesses}
                placeholder="Search business name, branches, products, buildings, cities, countries..."
              />
            </div>

            {/* Filter Modal Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`h-9 gap-1.5 text-xs font-bold rounded-xl shrink-0 ${
                showFiltersModal ? "border-primary text-primary" : ""
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => {
                const val = e.target.value as any;
                setSortBy(val);
                pushSearchUrl({ sort: val });
              }}
              className="h-9 shrink-0 rounded-xl border border-input bg-background px-2.5 text-xs font-semibold focus:outline-none hidden sm:block cursor-pointer hover:border-foreground/30 transition-colors"
            >
              <option value="relevance">Recommended</option>
              <option value="newest">Newest Added</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="distance">Nearest First</option>
            </select>

            {/* Quick Dark/Light Toggle */}
            <ThemeToggle variant="button" className="hidden sm:flex shrink-0" />

            {/* View Mode Toggle (Mobile / Tablet) */}
            <div className="flex md:hidden items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === "list"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === "map"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground"
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Scope Search Options Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 pt-2.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
            Scope:
          </span>
          {SEARCH_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedScope === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedScope(opt.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 select-none ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                    : "bg-background text-muted-foreground border border-border hover:border-foreground/30"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Specialized Filter Tags */}
        {(selectedBuilding || selectedCity || selectedCountry || selectedScope !== "all" || (selectedCategory && selectedCategory !== "all")) && (
          <div className="max-w-7xl mx-auto flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground">Active:</span>
            {selectedCategory && selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                Category: {getCategoryBySlug(selectedCategory)?.name || selectedCategory}
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    const params = new URLSearchParams(window.location.search);
                    params.delete("category");
                    router.push(params.toString() ? `/search?${params.toString()}` : "/search", { scroll: false });
                  }}
                  className="hover:text-indigo-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedScope !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                Scope: {SEARCH_OPTIONS.find((o) => o.key === selectedScope)?.label}
                <button
                  onClick={() => setSelectedScope("all")}
                  className="hover:text-indigo-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBuilding && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                Building: {selectedBuilding}
                <button
                  onClick={() => setSelectedBuilding("")}
                  className="hover:text-purple-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-800">
                City: {selectedCity}
                <button
                  onClick={() => setSelectedCity("")}
                  className="hover:text-cyan-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCountry && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-800">
                Country: {selectedCountry}
                <button
                  onClick={() => setSelectedCountry("")}
                  className="hover:text-cyan-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Quick Filter Pill Badges */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 pt-2.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
              openNowOnly
                ? "bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-600/20"
                : "bg-background text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Open Now
          </button>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
              verifiedOnly
                ? "bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-600/20"
                : "bg-background text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Only
          </button>

          {/* Price Tier Filters */}
          {(["$", "$$", "$$$", "$$$$"] as PriceTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() =>
                setSelectedPriceTier(selectedPriceTier === tier ? "all" : tier)
              }
              className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 border ${
                selectedPriceTier === tier
                  ? "bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-600/20"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/30"
              }`}
            >
              {tier}
            </button>
          ))}

          {/* Rating Filters */}
          {[4.5, 4.0].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 border flex items-center gap-1 ${
                minRating === rating
                  ? "bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/20"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/30"
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              {rating}+
            </button>
          ))}

          {/* Near-Me / Radius Pill — only active when GPS is on */}
          <button
            onClick={() => {
              if (!nearMeActive) {
                if (typeof navigator !== "undefined" && navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setUserGpsLat(pos.coords.latitude);
                      setUserGpsLng(pos.coords.longitude);
                      setNearMeActive(true);
                    },
                    () => setNearMeActive(false)
                  );
                }
              } else {
                setNearMeActive(false);
                setUserGpsLat(null);
                setUserGpsLng(null);
              }
            }}
            className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
              nearMeActive
                ? "bg-sky-600 text-white border-sky-700 shadow-sm shadow-sky-600/20"
                : "bg-background text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            {nearMeActive ? `Near Me (${radiusKm} km)` : "Near Me"}
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-2.5 py-1 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0 ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Extended Interactive Filter Drawer */}
        {showFiltersModal && (
          <div className="max-w-7xl mx-auto mt-4 p-5 rounded-2xl bg-card border border-border shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Radius Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Near-Me Radius
                </span>
                <span className="text-xs font-bold text-primary">
                  {radiusKm} km
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">
                Only applies when &ldquo;Near Me&rdquo; GPS mode is active. Worldwide by default.
              </p>
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-semibold">
                <span>1 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Location / Subcity Selection */}
            <div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
                Neighborhood / Subcity
              </span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Addis Ababa & East Africa</option>
                {SEED_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
                Minimum Customer Rating
              </span>
              <div className="flex items-center gap-2">
                {[0, 3.5, 4.0, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      minRating === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {r === 0 ? "Any" : `${r}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Split Screen Results Content */}
      <div className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Business Cards List */}
        <div
          className={`lg:col-span-8 flex flex-col space-y-5 ${
            viewMode === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredBusinesses.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBusinesses.length)} of {filteredBusinesses.length} results
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {filteredBusinesses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">
                No matching listings found
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Try widening your search keywords, increasing your distance radius, or clearing some active filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 font-semibold"
                onClick={resetAllFilters}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            paginatedBusinesses.map((biz, index) => {
              const liveStatus = getLiveOpeningStatus(biz.openingHours);
              const distanceKm = calculateDistanceKm(
                userLat,
                userLng,
                biz.latitude,
                biz.longitude
              );
              const isSaved = savedIds.includes(biz.id);
              const isSelected = selectedBusiness?.id === biz.id;

              return (
                <div
                  key={biz.id}
                  id={`business-card-${biz.id}`}
                  onMouseEnter={() => setSelectedBusiness(biz)}
                  className={`group rounded-3xl bg-card border p-5 sm:p-6 transition-all duration-200 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-2xl ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 shadow-indigo-500/10 -translate-y-0.5"
                      : "border-border/80 hover:border-primary/40"
                  }`}
                >
                  {/* Photo Thumbnail — bigger */}
                  <Link
                    href={`/business/${biz.id}`}
                    className="relative w-full sm:w-60 h-52 rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getBusinessCoverUrl(biz)}
                      alt={biz.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_BUSINESS_COVER;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <Badge
                        variant={liveStatus.isOpen ? "success" : "destructive"}
                        className="text-xs font-bold backdrop-blur-md shadow-sm px-2.5 py-0.5"
                      >
                        {liveStatus.isOpen ? "● Open" : "● Closed"}
                      </Badge>
                      {(biz.isFeatured || index === 0) && (
                        <Badge
                          variant="warning"
                          className="text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md bg-amber-500 text-white border-amber-400 gap-1"
                        >
                          <Crown className="w-2.5 h-2.5 fill-current" /> Promoted
                        </Badge>
                      )}
                    </div>
                    {/* Gradient overlay at bottom for label readability */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/business/${biz.id}`} className="flex items-center gap-2 min-w-0">
                          <h3 className="font-extrabold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {biz.name}
                          </h3>
                          {(biz.isFeatured || index === 0) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                              Sponsored
                            </span>
                          )}
                        </Link>
                        <FavoriteButton
                          businessId={biz.id}
                          businessName={biz.name}
                          businessCity={biz.cityName}
                          businessCountry={biz.countryName}
                          variant="minimal"
                          size="sm"
                        />
                      </div>

                      {/* Category • Rating • Price • Distance */}
                      <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground flex-wrap">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {biz.categoryName}
                        </span>
                        {biz.subcategoryName && (
                          <>
                            <span className="text-border">›</span>
                            <span className="font-medium text-muted-foreground/80">{biz.subcategoryName}</span>
                          </>
                        )}
                        <span className="text-border">•</span>
                        <div className="flex items-center gap-1 font-bold text-foreground">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>{biz.ratingAvg.toFixed(1)}</span>
                          <span className="font-normal text-muted-foreground text-xs">
                            ({biz.reviewCount} reviews)
                          </span>
                        </div>
                        <span className="text-border">•</span>
                        <span className="font-bold text-foreground">
                          {biz.attributes.priceTier || "$$"}
                        </span>
                        <span className="text-border">•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatDistance(distanceKm)} away
                        </span>
                      </div>

                      {/* Verified badge */}
                      {biz.isVerified && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Listing
                        </span>
                      )}

                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                        {biz.shortDescription || biz.description}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{biz.addressLine}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {biz.telephone && (
                          <a
                            href={`tel:${biz.telephone}`}
                            className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-border/60"
                            title="Call Business"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-border/60"
                          title="Get Directions"
                        >
                          <Navigation className="w-4 h-4" />
                        </a>
                        <Link href={`/business/${biz.id}`}>
                          <Button
                            size="default"
                            variant="gradient"
                            className="h-9 text-sm font-bold px-5 rounded-xl shadow-sm"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* ── Pagination Controls ── */}
          {filteredBusinesses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-4 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground order-2 sm:order-1">
                Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredBusinesses.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBusinesses.length)} of {filteredBusinesses.length} results
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center">
                {/* Previous */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs sm:text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {/* Page number pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first, last, current, and ±1 around current
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                      if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-xs sm:text-sm font-medium">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => goToPage(item as number)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                            currentPage === item
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-500/20 scale-105'
                              : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )
                  }
                </div>

                {/* Next */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs sm:text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
                  aria-label="Next Page"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map */}
        <div
          className={`lg:col-span-4 sticky top-40 h-[calc(100vh-10rem)] ${
            viewMode === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <SyncedMapView
            businesses={filteredBusinesses}
            selectedBusinessId={selectedBusiness?.id}
            onSelectBusiness={(biz) => {
              setSelectedBusiness(biz);
              const el = document.getElementById(`business-card-${biz.id}`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            center={[userLat, userLng]}
          />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm font-semibold text-muted-foreground">
          Loading BizFinder Search Engine...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

