"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Store,
  GitBranch,
  ShoppingBag,
  Building2,
  Globe2,
  Layers,
  Map as MapIcon,
  CheckCircle2,
  Star,
  Clock,
  ArrowRight,
  X,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  SearchAutocompleteResult,
  SearchOptionScope,
  AutocompleteResultType,
} from "@/types/search";
import {
  performMultiFacetSearch,
  highlightMatch,
} from "@/lib/search/multi-facet-search";
import { Business } from "@/types/business";

export interface SearchOptionItem {
  key: SearchOptionScope;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  badge?: string;
}

export const SEARCH_OPTIONS: SearchOptionItem[] = [
  {
    key: "all",
    label: "All Results",
    icon: Sparkles,
    placeholder: "Search business name, branches, products, buildings, cities, business types...",
  },
  {
    key: "business",
    label: "Business Name",
    icon: Store,
    placeholder: "Search by registered business or brand name (e.g. Kategna, Care Pharmacy)...",
  },
  {
    key: "branch",
    label: "Branches",
    icon: GitBranch,
    placeholder: "Search branch name, outlet, or branch code (e.g. Bole Medhanialem Branch, CBE-001)...",
  },
  {
    key: "product",
    label: "Products & Services",
    icon: ShoppingBag,
    placeholder: "Search products, dishes, pharmacy meds, auto repairs (e.g. Kitfo, Tibs)...",
  },
  {
    key: "building",
    label: "Building Name",
    icon: Building2,
    placeholder: "Search commercial building, tower, mall (e.g. Kategna Bldg, Edna Mall, Morning Star)...",
  },
  {
    key: "location",
    label: "Location / Area",
    icon: MapPin,
    placeholder: "Search sub-city, district, neighborhood (e.g. Bole, Kazanchis, CMC, Sarbet)...",
  },
  {
    key: "city_country",
    label: "City & Country",
    icon: Globe2,
    placeholder: "Search cities and countries worldwide (e.g. Addis Ababa, Hawassa, Ethiopia, Kenya)...",
  },
  {
    key: "business_type",
    label: "Business Type",
    icon: Layers,
    placeholder: "Search 70+ business categories and industries (e.g. Restaurants, Hospitals, Banking)...",
  },
  {
    key: "map",
    label: "Map / Near Me",
    icon: MapIcon,
    placeholder: "Search locations to view pins, radius boundaries, and coordinates on map...",
  },
];

interface UnifiedSearchAutocompleteProps {
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (query: string, scope: SearchOptionScope) => void;
  onSelectResult?: (result: SearchAutocompleteResult) => boolean | void; // return true to prevent default navigation
  initialScope?: SearchOptionScope;
  variant?: "hero" | "compact" | "minimal";
  className?: string;
  placeholder?: string;
  showOptionPills?: boolean;
  autoFocus?: boolean;
  customBusinesses?: Business[];
}

export function UnifiedSearchAutocomplete({
  value: controlledValue,
  onChange: controlledOnChange,
  onSearch,
  onSelectResult,
  initialScope = "all",
  variant = "hero",
  className = "",
  placeholder: customPlaceholder,
  showOptionPills = true,
  autoFocus = false,
  customBusinesses,
}: UnifiedSearchAutocompleteProps) {
  const router = useRouter();
  const [internalQuery, setInternalQuery] = useState("");
  const [activeScope, setActiveScope] = useState<SearchOptionScope>(initialScope);
  const [results, setResults] = useState<SearchAutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = controlledValue !== undefined ? controlledValue : internalQuery;

  const currentOption = useMemo(
    () => SEARCH_OPTIONS.find((o) => o.key === activeScope) || SEARCH_OPTIONS[0],
    [activeScope]
  );

  const activePlaceholder =
    customPlaceholder || currentOption.placeholder;

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (controlledOnChange) {
      controlledOnChange(val);
    } else {
      setInternalQuery(val);
    }
  };

  // Instant multi-facet search on spelling changes
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Fast synchronous in-memory search first for sub-millisecond response
    const fastLocalResults = performMultiFacetSearch({
      query: trimmed,
      scope: activeScope,
      limit: 12,
      customBusinesses,
    });
    setResults(fastLocalResults);
    setIsOpen(fastLocalResults.length > 0);
    setActiveIndex(-1);

    // Debounced secondary fetch from API to include any database-persisted listings
    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/search/autocomplete?q=${encodeURIComponent(trimmed)}&scope=${activeScope}&limit=12`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
            // Merge with local results ensuring no duplicates
            const existingIds = new Set(fastLocalResults.map((r) => r.id));
            const fresh = data.results.filter((r: SearchAutocompleteResult) => !existingIds.has(r.id));
            if (fresh.length > 0) {
              setResults([...fastLocalResults, ...fresh].slice(0, 12));
            }
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [query, activeScope, customBusinesses]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
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
        handleSelect(results[activeIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);

    if (onSearch) {
      onSearch(query.trim(), activeScope);
      return;
    }

    // Default route to /search with scope params
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (activeScope !== "all") {
      params.set("scope", activeScope);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleSelect = (item: SearchAutocompleteResult) => {
    setIsOpen(false);

    // Check if custom interceptor handled it
    if (onSelectResult) {
      const handled = onSelectResult(item);
      if (handled) return;
    }

    // Default smart navigation
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

  // Group results for categorized display
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchAutocompleteResult[]> = {};
    for (const r of results) {
      const key = r.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return groups;
  }, [results]);

  const getSectionTitle = (type: AutocompleteResultType, count: number) => {
    switch (type) {
      case "business":
        return `🏢 Registered Businesses (${count})`;
      case "branch":
        return `🌿 Branches & Outlets (${count})`;
      case "product":
        return `🛍️ Products & Services (${count})`;
      case "building":
        return `🏛️ Commercial Buildings & Malls (${count})`;
      case "location":
        return `📍 Locations & Sub-cities (${count})`;
      case "city":
        return `🌆 Municipal Cities (${count})`;
      case "country":
        return `🌍 Countries (${count})`;
      case "category":
        return `🏷️ Business Types & Categories (${count})`;
      case "map":
        return `🗺️ Map View Exploration (${count})`;
      default:
        return `Matches (${count})`;
    }
  };

  const getTypeIcon = (type: AutocompleteResultType) => {
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
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Search Scope Option Pills */}
      {showOptionPills && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 scrollbar-none no-scrollbar">
          {SEARCH_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = activeScope === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setActiveScope(opt.key);
                  inputRef.current?.focus();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 select-none ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                    : "bg-background/80 hover:bg-accent text-muted-foreground hover:text-foreground border border-border/80 backdrop-blur-sm"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={`flex items-center w-full transition-all border ${
            variant === "hero"
              ? "h-12 px-4 rounded-2xl bg-background border-input shadow-md focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-400"
              : variant === "compact"
              ? "h-9 pl-2 sm:pl-2.5 pr-1 sm:pr-1.5 rounded-xl bg-background border-input shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
              : "h-9 pl-2 pr-1 rounded-lg bg-background border-input"
          }`}
        >
          {/* Active Scope Icon Indicator */}
          <div className="pl-1 sm:pl-1.5 pr-1 shrink-0 flex items-center">
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 animate-spin" />
            ) : (
              <currentOption.icon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 dark:text-indigo-400" />
            )}
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.trim() && results.length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={activePlaceholder}
            autoFocus={autoFocus}
            className="flex-1 min-w-0 bg-transparent border-0 px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none text-foreground"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                if (controlledOnChange) controlledOnChange("");
                else setInternalQuery("");
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0 mr-1 rounded-full hover:bg-accent"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Action Button — anchored firmly in the right corner */}
          <button
            type="submit"
            className={`font-bold shrink-0 transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              variant === "hero"
                ? "px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95 text-sm"
                : "h-7 px-2 xs:px-2.5 sm:px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs shadow-sm shadow-primary/20"
            }`}
            title="Search"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Search</span>
          </button>
        </div>
      </form>

      {/* Live Spellings & Autocomplete Dropdown Below Input */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2.5 bg-card/95 backdrop-blur-2xl border border-indigo-100 dark:border-indigo-900/60 rounded-2xl shadow-2xl overflow-hidden z-50 text-left divide-y divide-border/50 animate-in fade-in zoom-in-95 duration-150 max-h-[460px] overflow-y-auto">
          {/* Quick Header Bar */}
          <div className="px-4 py-2 bg-muted/40 flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Instant Matching Results for &ldquo;{query}&rdquo;</span>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
              {results.length} results
            </span>
          </div>

          {/* Categorized Result Items */}
          <div className="py-1">
            {Object.entries(groupedResults).map(([typeKey, items]) => {
              const type = typeKey as AutocompleteResultType;
              return (
                <div key={typeKey} className="py-1.5">
                  {/* Category Section Header */}
                  <div className="px-4 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{getSectionTitle(type, items.length)}</span>
                  </div>

                  {/* Category Items */}
                  {items.map((item) => {
                    const globalIdx = results.indexOf(item);
                    const isItemActive = globalIdx === activeIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 transition-all text-left group ${
                          isItemActive
                            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100"
                            : "hover:bg-accent/70 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Type Icon Box */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                              isItemActive
                                ? "bg-indigo-600 text-white scale-105 shadow-sm"
                                : "bg-muted/80 text-muted-foreground group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600"
                            }`}
                          >
                            {getTypeIcon(item.type)}
                          </div>

                          {/* Text & Highlight Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold truncate">
                                {highlightMatch(item.title, query).map(
                                  (seg, i) =>
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

                              {/* Badges: Rating, Verified, Open, Price */}
                              {item.isVerified && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/60">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  Verified
                                </span>
                              )}

                              {item.rating !== undefined && item.rating > 0 && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  {item.rating.toFixed(1)}
                                </span>
                              )}

                              {item.badge && !item.isVerified && (
                                <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold">
                                  {item.badge}
                                </span>
                              )}
                            </div>

                            {/* Subtitle & Extra Info */}
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

                        {/* Action Arrow / Navigation Badge */}
                        <div className="flex items-center gap-2 pl-3 shrink-0">
                          <span className="text-[10px] font-bold text-muted-foreground hidden sm:inline-block group-hover:text-indigo-600 transition-colors">
                            {item.type === "business"
                              ? "View Page"
                              : item.type === "map"
                              ? "Open Map"
                              : item.type === "branch"
                              ? "Branch Info"
                              : "Search"}
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
              );
            })}
          </div>

          {/* Dropdown Footer Action */}
          <div className="p-3 bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="kbd px-1.5 py-0.5 rounded bg-card border border-border text-[10px] font-mono shadow-xs">
                ↵ Enter
              </span>
              <span>to search all in &ldquo;{currentOption.label}&rdquo;</span>
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
  );
}
