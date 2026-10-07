"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Crosshair,
  Sparkles,
  ArrowRight,
  Store,
  GitBranch,
  ShoppingBag,
  Building2,
  Globe2,
  Layers,
  Map as MapIcon,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SearchAutocompleteResult,
  SearchOptionScope,
  AutocompleteResultType,
} from "@/types/search";
import {
  performMultiFacetSearch,
  highlightMatch,
} from "@/lib/search/multi-facet-search";
import { parseNaturalSearchQuery } from "@/lib/search/query-parser";
import { SEARCH_OPTIONS } from "@/components/search/UnifiedSearchAutocomplete";

const TRENDING_SEARCHES = [
  { label: "Kategna Restaurant", scope: "business" as const },
  { label: "CBE Branches", scope: "branch" as const },
  { label: "Bole Medhanialem", scope: "location" as const },
  { label: "Special Kitfo & Tibs", scope: "product" as const },
  { label: "Edna Mall", scope: "building" as const },
  { label: "24/7 Care Pharmacy", scope: "business" as const },
  { label: "Addis Ababa", scope: "city_country" as const },
  { label: "Hotels & Resorts", scope: "business_type" as const },
];

export function SearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedScope, setSelectedScope] = useState<SearchOptionScope>("all");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [results, setResults] = useState<SearchAutocompleteResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentOption =
    SEARCH_OPTIONS.find((o) => o.key === selectedScope) || SEARCH_OPTIONS[0];

  // Live autocomplete filtering on every spelling keystroke
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Fast synchronous search across all indexed data
    const fastResults = performMultiFacetSearch({
      query: trimmed,
      scope: selectedScope,
      limit: 10,
    });
    setResults(fastResults);
    setShowDropdown(fastResults.length > 0);
    setActiveIndex(-1);

    // Debounced API fetch to merge live database listings
    const timer = setTimeout(() => {
      fetch(`/api/search/autocomplete?q=${encodeURIComponent(trimmed)}&scope=${selectedScope}&limit=10`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
            const existingIds = new Set(fastResults.map((r) => r.id));
            const fresh = data.results.filter((r: SearchAutocompleteResult) => !existingIds.has(r.id));
            if (fresh.length > 0) {
              setResults([...fastResults, ...fresh].slice(0, 10));
            }
          }
        })
        .catch(() => {});
    }, 150);

    return () => clearTimeout(timer);
  }, [query, selectedScope]);

  // Click outside to close autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    const params = new URLSearchParams();

    if (query.trim()) {
      const parsed = parseNaturalSearchQuery(query.trim());
      if (parsed.extractedCategory) {
        params.set("category", parsed.extractedCategory);
      }
      if (parsed.extractedLocation) {
        params.set("location", parsed.extractedLocation);
      }
      if (parsed.extractedModifiers.openNow) {
        params.set("openNow", "true");
      }
      if (parsed.extractedModifiers.radiusKm) {
        params.set("radiusKm", parsed.extractedModifiers.radiusKm.toString());
      }
      if (parsed.extractedModifiers.ratingMin) {
        params.set("minRating", parsed.extractedModifiers.ratingMin.toString());
      }
      const residual = parsed.remainingKeywords.join(" ");
      if (residual) {
        params.set("q", residual);
      } else if (!parsed.extractedCategory && !parsed.extractedLocation) {
        params.set("q", query.trim());
      }
    }

    if (selectedScope !== "all") {
      params.set("scope", selectedScope);
    }

    if (location.trim() && !params.has("location")) {
      params.set("location", location.trim());
    }

    router.push(`/search?${params.toString()}`);
  };

  const handleSelectSuggestion = (item: SearchAutocompleteResult) => {
    setShowDropdown(false);
    switch (item.type) {
      case "business":
        if (item.businessId) {
          router.push(`/business/${item.businessId}`);
        } else {
          router.push(`/search?q=${encodeURIComponent(item.title)}`);
        }
        break;

      case "branch":
        if (item.businessId) {
          router.push(`/business/${item.businessId}#branches`);
        } else {
          router.push(`/search?q=${encodeURIComponent(item.title)}&view=map`);
        }
        break;

      case "product":
        if (item.businessId) {
          router.push(`/business/${item.businessId}?highlight=${encodeURIComponent(item.title)}`);
        } else {
          router.push(`/search?q=${encodeURIComponent(item.title)}`);
        }
        break;

      case "building":
        router.push(`/search?q=${encodeURIComponent(item.title)}&building=${encodeURIComponent(item.title)}`);
        break;

      case "location":
        router.push(`/search?location=${encodeURIComponent(item.title)}`);
        break;

      case "city":
        router.push(`/search?city=${encodeURIComponent(item.cityName || item.title)}`);
        break;

      case "country":
        router.push(`/search?country=${encodeURIComponent(item.countryName || item.title)}`);
        break;

      case "category":
        if (item.categorySlug) {
          router.push(`/search?category=${item.categorySlug}`);
        } else {
          router.push(`/search?q=${encodeURIComponent(item.title)}`);
        }
        break;

      case "map":
        router.push(`/search?q=${encodeURIComponent(query.trim())}&view=map`);
        break;

      default:
        router.push(`/search?q=${encodeURIComponent(item.title)}`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelectSuggestion(results[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        setLocation("Current Location");
        router.push(
          `/search?lat=${pos.coords.latitude.toFixed(4)}&lng=${pos.coords.longitude.toFixed(4)}&view=map`
        );
      },
      (err) => {
        setIsDetectingLocation(false);
        alert("Unable to retrieve location: " + err.message);
      },
      { timeout: 8000 }
    );
  };

  const getItemIcon = (type: AutocompleteResultType) => {
    switch (type) {
      case "business":
        return <Store className="w-4 h-4 text-indigo-500" />;
      case "branch":
        return <GitBranch className="w-4 h-4 text-emerald-500" />;
      case "product":
        return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case "building":
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case "location":
        return <MapPin className="w-4 h-4 text-rose-500" />;
      case "city":
      case "country":
        return <Globe2 className="w-4 h-4 text-cyan-500" />;
      case "category":
        return <Layers className="w-4 h-4 text-blue-500" />;
      case "map":
        return <MapIcon className="w-4 h-4 text-teal-500" />;
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative py-8 xs:py-10 sm:py-14 md:py-20 flex flex-col items-center text-center px-2 xs:px-3 sm:px-4 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[300px] xs:w-[450px] sm:w-[600px] h-[220px] xs:h-[280px] sm:h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-[80px] sm:blur-[100px] rounded-full" />
      </div>

      {/* Main Tagline Pill */}
      <div className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1 xs:py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] xs:text-xs font-bold mb-4 sm:mb-6 shadow-sm max-w-full">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="truncate">Discover 10,000+ Verified Businesses, Branches & Products</span>
      </div>

      <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-4xl leading-[1.15] sm:leading-[1.15]">
        Find What You Need,{" "}
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Right Where You Are.
        </span>
      </h1>

      <p className="mt-2.5 sm:mt-4 text-xs xs:text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed px-1">
        Search by business name, branches, products, building name, map, country, city, or business type with live spelling results.
      </p>

      {/* Unified Search Bar with Dropdown Container */}
      <div className="w-full max-w-3xl mt-4 sm:mt-6 relative" ref={dropdownRef}>
        <form
          onSubmit={handleSearch}
          className="glass-panel p-1 xs:p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl shadow-xl shadow-indigo-500/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 transition-all border border-indigo-100 dark:border-indigo-900/40"
        >
          {/* Query Input with dynamic icon & placeholder */}
          <div className="relative flex-1 w-full flex items-center h-10 xs:h-11 sm:h-12 border-b border-border/40 sm:border-b-0 px-1 sm:px-0">
            <currentOption.icon className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-indigo-500 ml-2 sm:ml-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim() && results.length > 0) {
                  setShowDropdown(true);
                }
              }}
              placeholder={currentOption.placeholder}
              className="w-full bg-transparent border-0 px-2 sm:px-3 text-xs xs:text-sm sm:text-base font-medium placeholder:text-muted-foreground/60 focus:outline-none text-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setShowDropdown(false);
                  inputRef.current?.focus();
                }}
                className="p-1 text-muted-foreground hover:text-foreground mr-1 rounded-full hover:bg-accent shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Vertical Divider on sm+ (Medium, Large, XL) */}
          <div className="hidden sm:block w-px h-7 bg-border/70 shrink-0" />

          {/* Location & Search Button Row (Inline side-by-side on Mobile / Integrated on sm+) */}
          <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto h-10 xs:h-11 sm:h-12 px-1 sm:px-0">
            {/* Location Input with GPS detector */}
            <div className="relative flex-1 sm:w-48 md:w-56 flex items-center h-full">
              <MapPin className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-indigo-600 dark:text-indigo-400 ml-1.5 sm:ml-2 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, area, district..."
                className="w-full bg-transparent border-0 px-1.5 sm:px-2 text-xs xs:text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none text-foreground"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                title="Use GPS current location"
                className="p-1.5 mr-0.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 shrink-0"
              >
                {isDetectingLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  <Crosshair className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              size="default"
              variant="gradient"
              className="h-8 xs:h-9 sm:h-10 md:h-11 px-3.5 xs:px-4 sm:px-5 md:px-6 rounded-xl sm:rounded-2xl gap-1.5 font-bold shrink-0 shadow-md shadow-indigo-500/20 text-xs sm:text-sm"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>

        {/* Live Spelling Results Dropdown Below Search Bar */}
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-2xl border border-indigo-100 dark:border-indigo-900/60 rounded-2xl shadow-2xl overflow-hidden z-50 text-left divide-y divide-border/50 animate-in fade-in zoom-in-95 duration-150 max-h-[60vh] sm:max-h-[480px] overflow-y-auto">
            {/* Header info */}
            <div className="px-4 py-2 bg-muted/40 flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Instant Results for &ldquo;{query}&rdquo;</span>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                {results.length} matches • Scope: {currentOption.label}
              </span>
            </div>

            {/* Suggestions list */}
            <div className="py-1">
              {results.map((item, idx) => {
                const isItemActive = idx === activeIndex;

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center justify-between p-3.5 transition-colors text-left group ${
                      isItemActive
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100"
                        : "hover:bg-accent/70 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Icon box */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          isItemActive
                            ? "bg-indigo-600 text-white scale-105 shadow-sm"
                            : "bg-muted text-muted-foreground group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600"
                        }`}
                      >
                        {getItemIcon(item.type)}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold truncate">
                            {highlightMatch(item.title, query).map((seg, i) =>
                              seg.isMatch ? (
                                <span
                                  key={i}
                                  className="font-black text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/50"
                                >
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={i}>{seg.text}</span>
                              )
                            )}
                          </span>

                          {/* Attribute Badges */}
                          {item.isVerified && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )}

                          {item.rating !== undefined && item.rating > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {item.rating.toFixed(1)}
                            </span>
                          )}

                          {item.badge && !item.isVerified && (
                            <span className="px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold">
                              {item.badge}
                            </span>
                          )}

                          {item.matchedField && (
                            <span className="text-[9px] text-muted-foreground/70 hidden sm:inline">
                              via {item.matchedField}
                            </span>
                          )}
                        </div>

                        {item.subtitle && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                        {item.extraInfo && item.extraInfo !== item.subtitle && (
                          <div className="text-[11px] text-muted-foreground/80 truncate">
                            {item.extraInfo}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      <span className="text-[10px] font-bold text-muted-foreground hidden sm:inline-block group-hover:text-indigo-600 transition-colors">
                        {item.type === "business"
                          ? "View Business"
                          : item.type === "map"
                          ? "Open Map"
                          : item.type === "branch"
                          ? "Branch Info"
                          : "Explore"}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isItemActive
                            ? "text-indigo-600 translate-x-1"
                            : "text-muted-foreground group-hover:text-indigo-600 group-hover:translate-x-0.5"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dropdown footer with quick shortcuts */}
            <div className="p-3 bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="kbd px-1.5 py-0.5 rounded bg-card border border-border text-[10px] font-mono">
                  ↵ Enter
                </span>
                <span>to view all matching directory listings</span>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/search?q=${encodeURIComponent(query.trim())}&view=map`)}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Explore all on interactive map</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trending & Quick Search Suggestions Tags — hidden to reduce home page clutter */}
      {/* <div className="mt-5 flex items-center justify-center gap-2 flex-wrap text-xs text-muted-foreground max-w-2xl">
        <span className="font-bold flex items-center gap-1 text-foreground">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Popular:
        </span>
        {TRENDING_SEARCHES.map((tag) => (
          <button
            key={tag.label}
            type="button"
            onClick={() => {
              setQuery(tag.label);
              setSelectedScope(tag.scope);
              router.push(`/search?q=${encodeURIComponent(tag.label)}&scope=${tag.scope}`);
            }}
            className="px-2.5 py-1 rounded-full bg-accent/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-border/60"
          >
            {tag.label}
          </button>
        ))}
      </div> */}
    </div>
  );
}
